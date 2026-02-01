import { eq, desc, and, gte, sql, inArray } from "drizzle-orm"
import type { DatabaseOrTransaction } from "../db"
import { getDb } from "../db"
import {
	classifications,
	type InsertClassification,
	type UpdateClassification,
	type Classification,
	type CommitCategory,
} from "../schema"

export async function createClassification(
	data: InsertClassification,
	db: DatabaseOrTransaction = getDb(),
): Promise<Classification> {
	const result = await db
		.insert(classifications)
		.values(data)
		.onConflictDoUpdate({
			target: classifications.commitSha,
			set: {
				category: data.category,
				confidence: data.confidence,
				flags: data.flags,
				riskScore: data.riskScore,
				analysisVersion: data.analysisVersion,
			},
		})
		.returning()

	const record = result[0]
	if (!record) {
		throw new Error(`Failed to create classification for ${data.commitSha}`)
	}
	return record
}

export async function getClassification(commitSha: string, db: DatabaseOrTransaction = getDb()) {
	return db.query.classifications.findFirst({
		where: eq(classifications.commitSha, commitSha),
		with: {
			commit: true,
		},
	})
}

export async function getClassifications(
	options: {
		category?: CommitCategory
		minRisk?: number
		limit?: number
		offset?: number
	} = {},
	db: DatabaseOrTransaction = getDb(),
) {
	const conditions = []

	if (options.category) {
		conditions.push(eq(classifications.category, options.category))
	}
	if (options.minRisk !== undefined) {
		conditions.push(gte(classifications.riskScore, options.minRisk))
	}

	return db.query.classifications.findMany({
		where: conditions.length > 0 ? and(...conditions) : undefined,
		orderBy: desc(classifications.riskScore),
		limit: options.limit,
		offset: options.offset,
		with: {
			commit: true,
		},
	})
}

export async function updateClassification(
	commitSha: string,
	data: UpdateClassification,
	db: DatabaseOrTransaction = getDb(),
) {
	return db.update(classifications).set(data).where(eq(classifications.commitSha, commitSha)).returning()
}

export async function getHighRiskCommits(threshold: number = 50, db: DatabaseOrTransaction = getDb()) {
	return db.query.classifications.findMany({
		where: gte(classifications.riskScore, threshold),
		orderBy: desc(classifications.riskScore),
		with: {
			commit: true,
		},
	})
}

export async function getCategoryDistribution(db: DatabaseOrTransaction = getDb()) {
	const result = await db
		.select({
			category: classifications.category,
			count: sql<number>`count(*)`,
			avgRisk: sql<number>`avg(${classifications.riskScore})`,
		})
		.from(classifications)
		.groupBy(classifications.category)
		.orderBy(desc(sql`count(*)`))

	return result
}

export async function getClassificationsByCommits(shas: string[], db: DatabaseOrTransaction = getDb()) {
	if (shas.length === 0) return []
	return db.query.classifications.findMany({
		where: inArray(classifications.commitSha, shas),
		with: {
			commit: true,
		},
	})
}
