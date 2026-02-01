import { eq, desc, and, gte, lte, sql } from "drizzle-orm"
import type { DatabaseOrTransaction } from "../db"
import { getDb } from "../db"
import { releases, commits, type InsertRelease, type Release } from "../schema"

export async function createRelease(data: InsertRelease, db: DatabaseOrTransaction = getDb()): Promise<Release> {
	const result = await db
		.insert(releases)
		.values(data)
		.onConflictDoUpdate({
			target: releases.version,
			set: {
				date: data.date,
				tagSha: data.tagSha,
				fixCount: data.fixCount,
				featureCount: data.featureCount,
				totalRisk: data.totalRisk,
			},
		})
		.returning()

	const record = result[0]
	if (!record) {
		throw new Error(`Failed to create release ${data.version}`)
	}
	return record
}

export async function getRelease(version: string, db: DatabaseOrTransaction = getDb()) {
	return db.query.releases.findFirst({
		where: eq(releases.version, version),
	})
}

export async function getReleases(
	options: {
		since?: Date
		until?: Date
		limit?: number
	} = {},
	db: DatabaseOrTransaction = getDb(),
) {
	const conditions = []

	if (options.since) {
		conditions.push(gte(releases.date, options.since))
	}
	if (options.until) {
		conditions.push(lte(releases.date, options.until))
	}

	return db.query.releases.findMany({
		where: conditions.length > 0 ? and(...conditions) : undefined,
		orderBy: desc(releases.date),
		limit: options.limit,
	})
}

export async function getLatestRelease(db: DatabaseOrTransaction = getDb()) {
	return db.query.releases.findFirst({
		orderBy: desc(releases.date),
	})
}

export async function updateReleaseStats(version: string, db: DatabaseOrTransaction = getDb()) {
	// Get the release
	const release = await getRelease(version, db)
	if (!release || !release.tagSha) {
		return null
	}

	// Get the previous release to determine commit range
	const allReleases = await getReleases({}, db)
	const currentIndex = allReleases.findIndex((r) => r.version === version)
	const previousRelease = allReleases[currentIndex + 1]

	// Get commits between releases
	const conditions = [lte(commits.date, release.date)]
	if (previousRelease) {
		conditions.push(gte(commits.date, previousRelease.date))
	}

	const releaseCommits = await db.query.commits.findMany({
		where: and(...conditions),
		with: {
			classification: true,
		},
	})

	let fixCount = 0
	let featureCount = 0
	let totalRisk = 0

	for (const commit of releaseCommits) {
		if (commit.messageType === "fix") fixCount++
		if (commit.messageType === "feat") featureCount++
		if (commit.classification) {
			totalRisk += commit.classification.riskScore
		}
	}

	const result = await db
		.update(releases)
		.set({
			fixCount,
			featureCount,
			totalRisk,
		})
		.where(eq(releases.version, version))
		.returning()

	return result[0]
}

export async function getReleaseStats(db: DatabaseOrTransaction = getDb()) {
	const total = await db.select({ count: sql<number>`count(*)` }).from(releases)

	const avgFixes = await db.select({ avg: sql<number>`avg(${releases.fixCount})` }).from(releases)

	const avgFeatures = await db.select({ avg: sql<number>`avg(${releases.featureCount})` }).from(releases)

	const avgRisk = await db.select({ avg: sql<number>`avg(${releases.totalRisk})` }).from(releases)

	return {
		total: total[0]?.count ?? 0,
		avgFixesPerRelease: avgFixes[0]?.avg ?? 0,
		avgFeaturesPerRelease: avgFeatures[0]?.avg ?? 0,
		avgRiskPerRelease: avgRisk[0]?.avg ?? 0,
	}
}
