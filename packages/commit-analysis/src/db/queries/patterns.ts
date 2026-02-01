import { eq, desc, and, sql } from "drizzle-orm"
import type { DatabaseOrTransaction } from "../db"
import { getDb } from "../db"
import {
	regressionPatterns,
	type InsertRegressionPattern,
	type RegressionPattern,
	type SeverityLevel,
	type PatternStatus,
} from "../schema"
import { createHash } from "crypto"

export function generatePatternHash(subsystem: string, keywords: string[]): string {
	const normalized = [subsystem, ...keywords.sort()].join(":").toLowerCase()
	return createHash("md5").update(normalized).digest("hex")
}

export async function createRegressionPattern(
	data: InsertRegressionPattern,
	db: DatabaseOrTransaction = getDb(),
): Promise<RegressionPattern> {
	const now = new Date()
	const result = await db
		.insert(regressionPatterns)
		.values({
			...data,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: regressionPatterns.patternHash,
			set: {
				occurrenceCount: sql`${regressionPatterns.occurrenceCount} + 1`,
				commitShas: data.commitShas,
				severity: data.severity,
				status: data.status,
				updatedAt: now,
			},
		})
		.returning()

	const record = result[0]
	if (!record) {
		throw new Error(`Failed to create regression pattern ${data.patternHash}`)
	}
	return record
}

export async function getRegressionPattern(id: number, db: DatabaseOrTransaction = getDb()) {
	return db.query.regressionPatterns.findFirst({
		where: eq(regressionPatterns.id, id),
	})
}

export async function getRegressionPatternByHash(hash: string, db: DatabaseOrTransaction = getDb()) {
	return db.query.regressionPatterns.findFirst({
		where: eq(regressionPatterns.patternHash, hash),
	})
}

export async function getRegressionPatterns(
	options: {
		subsystem?: string
		severity?: SeverityLevel
		status?: PatternStatus
		minOccurrences?: number
		limit?: number
	} = {},
	db: DatabaseOrTransaction = getDb(),
) {
	const conditions = []

	if (options.subsystem) {
		conditions.push(eq(regressionPatterns.subsystem, options.subsystem))
	}
	if (options.severity) {
		conditions.push(eq(regressionPatterns.severity, options.severity))
	}
	if (options.status) {
		conditions.push(eq(regressionPatterns.status, options.status))
	}
	if (options.minOccurrences !== undefined) {
		conditions.push(sql`${regressionPatterns.occurrenceCount} >= ${options.minOccurrences}`)
	}

	return db.query.regressionPatterns.findMany({
		where: conditions.length > 0 ? and(...conditions) : undefined,
		orderBy: [desc(regressionPatterns.occurrenceCount), desc(regressionPatterns.updatedAt)],
		limit: options.limit,
	})
}

export async function addCommitToPattern(patternHash: string, commitSha: string, db: DatabaseOrTransaction = getDb()) {
	const pattern = await getRegressionPatternByHash(patternHash, db)
	if (!pattern) {
		throw new Error(`Pattern not found: ${patternHash}`)
	}

	const existingShas = pattern.commitShas || []
	if (existingShas.includes(commitSha)) {
		return pattern
	}

	const updatedShas = [...existingShas, commitSha]

	const result = await db
		.update(regressionPatterns)
		.set({
			commitShas: updatedShas,
			occurrenceCount: updatedShas.length,
			updatedAt: new Date(),
		})
		.where(eq(regressionPatterns.patternHash, patternHash))
		.returning()

	return result[0]
}

export async function updatePatternSeverity(
	patternHash: string,
	severity: SeverityLevel,
	db: DatabaseOrTransaction = getDb(),
) {
	return db
		.update(regressionPatterns)
		.set({
			severity,
			updatedAt: new Date(),
		})
		.where(eq(regressionPatterns.patternHash, patternHash))
		.returning()
}

export async function resolvePattern(patternHash: string, db: DatabaseOrTransaction = getDb()) {
	return db
		.update(regressionPatterns)
		.set({
			status: "resolved",
			updatedAt: new Date(),
		})
		.where(eq(regressionPatterns.patternHash, patternHash))
		.returning()
}

export async function getActivePatterns(db: DatabaseOrTransaction = getDb()) {
	return getRegressionPatterns({ status: "active" }, db)
}

export async function getPatternStats(db: DatabaseOrTransaction = getDb()) {
	const total = await db.select({ count: sql<number>`count(*)` }).from(regressionPatterns)

	const active = await db
		.select({ count: sql<number>`count(*)` })
		.from(regressionPatterns)
		.where(eq(regressionPatterns.status, "active"))

	const bySeverity = await db
		.select({
			severity: regressionPatterns.severity,
			count: sql<number>`count(*)`,
		})
		.from(regressionPatterns)
		.groupBy(regressionPatterns.severity)

	const bySubsystem = await db
		.select({
			subsystem: regressionPatterns.subsystem,
			count: sql<number>`count(*)`,
			totalOccurrences: sql<number>`sum(${regressionPatterns.occurrenceCount})`,
		})
		.from(regressionPatterns)
		.groupBy(regressionPatterns.subsystem)
		.orderBy(desc(sql`sum(${regressionPatterns.occurrenceCount})`))

	return {
		total: total[0]?.count ?? 0,
		active: active[0]?.count ?? 0,
		bySeverity,
		bySubsystem,
	}
}
