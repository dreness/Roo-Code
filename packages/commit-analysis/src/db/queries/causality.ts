import { eq, desc, and, sql, inArray, isNotNull, gte, lte } from "drizzle-orm"
import type { DatabaseOrTransaction } from "../db"
import { getDb } from "../db"
import { bugCausality, commits, type InsertBugCausality, type BugCausality, type RelationshipType } from "../schema"

export async function createBugCausality(
	data: InsertBugCausality,
	db: DatabaseOrTransaction = getDb(),
): Promise<BugCausality> {
	const result = await db
		.insert(bugCausality)
		.values({
			...data,
			createdAt: new Date(),
		})
		.onConflictDoUpdate({
			target: [bugCausality.bugFixSha, bugCausality.causeSha],
			set: {
				relationshipType: data.relationshipType,
				confidence: data.confidence,
				bugAge: data.bugAge,
				bugAgeCommits: data.bugAgeCommits,
				analysisMethod: data.analysisMethod,
				notes: data.notes,
			},
		})
		.returning()

	const record = result[0]
	if (!record) {
		throw new Error(`Failed to create bug causality for ${data.bugFixSha} -> ${data.causeSha}`)
	}
	return record
}

export async function getCausesForBugFix(bugFixSha: string, db: DatabaseOrTransaction = getDb()) {
	return db.query.bugCausality.findMany({
		where: eq(bugCausality.bugFixSha, bugFixSha),
		with: {
			cause: {
				with: {
					classification: true,
				},
			},
		},
		orderBy: desc(bugCausality.confidence),
	})
}

export async function getBugsCausedBy(causeSha: string, db: DatabaseOrTransaction = getDb()) {
	return db.query.bugCausality.findMany({
		where: eq(bugCausality.causeSha, causeSha),
		with: {
			bugFix: {
				with: {
					classification: true,
				},
			},
		},
		orderBy: desc(bugCausality.confidence),
	})
}

export async function getTopBugIntroducers(limit: number = 10, db: DatabaseOrTransaction = getDb()) {
	const result = await db
		.select({
			causeSha: bugCausality.causeSha,
			bugsCaused: sql<number>`count(*)`,
			avgBugAge: sql<number>`avg(${bugCausality.bugAge})`,
		})
		.from(bugCausality)
		.where(eq(bugCausality.relationshipType, "root_cause"))
		.groupBy(bugCausality.causeSha)
		.orderBy(desc(sql`count(*)`))
		.limit(limit)

	// Get commit details for each
	const shas = result.map((r) => r.causeSha)
	if (shas.length === 0) return []

	const commitDetails = await db.query.commits.findMany({
		where: inArray(commits.sha, shas),
		with: {
			classification: true,
		},
	})

	const commitMap = new Map(commitDetails.map((c) => [c.sha, c]))

	return result.map((r) => ({
		...r,
		commit: commitMap.get(r.causeSha),
	}))
}

export async function verifyCausality(
	bugFixSha: string,
	causeSha: string,
	verifiedBy: string,
	db: DatabaseOrTransaction = getDb(),
) {
	return db
		.update(bugCausality)
		.set({
			verifiedAt: new Date(),
			verifiedBy,
		})
		.where(and(eq(bugCausality.bugFixSha, bugFixSha), eq(bugCausality.causeSha, causeSha)))
		.returning()
}

export async function deleteCausalityForCommit(sha: string, db: DatabaseOrTransaction = getDb()) {
	// Delete where this commit is either the fix or the cause
	await db.delete(bugCausality).where(eq(bugCausality.bugFixSha, sha))
	await db.delete(bugCausality).where(eq(bugCausality.causeSha, sha))
}

export async function getCausalityStats(db: DatabaseOrTransaction = getDb()) {
	const totalLinks = await db.select({ count: sql<number>`count(*)` }).from(bugCausality)

	const rootCauses = await db
		.select({ count: sql<number>`count(*)` })
		.from(bugCausality)
		.where(eq(bugCausality.relationshipType, "root_cause"))

	const verified = await db
		.select({ count: sql<number>`count(*)` })
		.from(bugCausality)
		.where(sql`${bugCausality.verifiedAt} IS NOT NULL`)

	const avgBugAge = await db
		.select({ avg: sql<number>`avg(${bugCausality.bugAge})` })
		.from(bugCausality)
		.where(sql`${bugCausality.bugAge} IS NOT NULL`)

	return {
		totalLinks: totalLinks[0]?.count ?? 0,
		rootCauses: rootCauses[0]?.count ?? 0,
		verified: verified[0]?.count ?? 0,
		avgBugAgeDays: avgBugAge[0]?.avg ?? 0,
	}
}

// ============================================================================
// Investigation Feedback Functions
// ============================================================================

/**
 * Parameters for linking a causality record to an investigation.
 * Identify the causality record by either causalityId OR (bugFixSha + causeSha).
 */
export type LinkToInvestigationParams =
	| { causalityId: number; investigationId: number }
	| { bugFixSha: string; causeSha: string; investigationId: number }

/**
 * Links a causality record to an investigation.
 * Sets the investigationId field on the bug_causality record.
 */
export async function linkToInvestigation(
	params: LinkToInvestigationParams,
	db: DatabaseOrTransaction = getDb(),
): Promise<BugCausality | null> {
	const whereClause =
		"causalityId" in params
			? eq(bugCausality.id, params.causalityId)
			: and(eq(bugCausality.bugFixSha, params.bugFixSha), eq(bugCausality.causeSha, params.causeSha))

	const result = await db
		.update(bugCausality)
		.set({ investigationId: params.investigationId })
		.where(whereClause)
		.returning()

	return result[0] ?? null
}

/**
 * Parameters for recording human feedback on a causality record.
 * Identify the causality record by either causalityId OR (bugFixSha + causeSha).
 */
export type RecordHumanFeedbackParams =
	| {
			causalityId: number
			humanVerified: boolean
			humanConfidence?: number
			automationWasCorrect?: boolean
	  }
	| {
			bugFixSha: string
			causeSha: string
			humanVerified: boolean
			humanConfidence?: number
			automationWasCorrect?: boolean
	  }

/**
 * Records human feedback on a causality record.
 * Updates humanVerified, humanConfidence, and automationWasCorrect fields.
 */
export async function recordHumanFeedback(
	params: RecordHumanFeedbackParams,
	db: DatabaseOrTransaction = getDb(),
): Promise<BugCausality | null> {
	const whereClause =
		"causalityId" in params
			? eq(bugCausality.id, params.causalityId)
			: and(eq(bugCausality.bugFixSha, params.bugFixSha), eq(bugCausality.causeSha, params.causeSha))

	const updateData: {
		humanVerified: boolean
		humanConfidence?: number
		automationWasCorrect?: boolean
	} = {
		humanVerified: params.humanVerified,
	}

	if (params.humanConfidence !== undefined) {
		updateData.humanConfidence = params.humanConfidence
	}

	if (params.automationWasCorrect !== undefined) {
		updateData.automationWasCorrect = params.automationWasCorrect
	}

	const result = await db.update(bugCausality).set(updateData).where(whereClause).returning()

	return result[0] ?? null
}

/**
 * Filter parameters for automation accuracy statistics
 */
export interface AutomationAccuracyFilters {
	/** Filter by date range (based on createdAt) */
	dateFrom?: Date
	dateTo?: Date
	/** Filter by relationship type */
	relationshipType?: RelationshipType
	/** Filter by analysis method */
	analysisMethod?: string
}

/**
 * Result of automation accuracy calculations
 */
export interface AutomationAccuracyResult {
	/** Total number of human-verified records */
	totalVerified: number
	/** Number of records where automation was correct */
	totalCorrect: number
	/** Accuracy rate as a decimal (0-1) */
	accuracyRate: number
	/** Average difference between automation confidence and human confidence */
	avgConfidenceDelta: number
}

/**
 * Gets aggregate statistics about automation accuracy based on human feedback.
 * Calculates from bug_causality records where humanVerified = true.
 */
export async function getAutomationAccuracy(
	filters?: AutomationAccuracyFilters,
	db: DatabaseOrTransaction = getDb(),
): Promise<AutomationAccuracyResult> {
	// Build where conditions
	const conditions = [eq(bugCausality.humanVerified, true)]

	if (filters?.dateFrom) {
		conditions.push(gte(bugCausality.createdAt, filters.dateFrom))
	}

	if (filters?.dateTo) {
		conditions.push(lte(bugCausality.createdAt, filters.dateTo))
	}

	if (filters?.relationshipType) {
		conditions.push(eq(bugCausality.relationshipType, filters.relationshipType))
	}

	if (filters?.analysisMethod) {
		conditions.push(eq(bugCausality.analysisMethod, filters.analysisMethod))
	}

	const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0]

	// Get total verified count
	const totalVerifiedResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(bugCausality)
		.where(whereClause)

	const totalVerified = totalVerifiedResult[0]?.count ?? 0

	// Get total correct count (where automationWasCorrect = true)
	const totalCorrectResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(bugCausality)
		.where(and(whereClause, eq(bugCausality.automationWasCorrect, true)))

	const totalCorrect = totalCorrectResult[0]?.count ?? 0

	// Calculate average confidence delta (humanConfidence - confidence)
	// Only for records that have both values
	const avgDeltaResult = await db
		.select({
			avgDelta: sql<number>`avg(${bugCausality.humanConfidence} - ${bugCausality.confidence})`,
		})
		.from(bugCausality)
		.where(and(whereClause, isNotNull(bugCausality.humanConfidence)))

	const avgConfidenceDelta = avgDeltaResult[0]?.avgDelta ?? 0

	// Calculate accuracy rate
	const accuracyRate = totalVerified > 0 ? totalCorrect / totalVerified : 0

	return {
		totalVerified,
		totalCorrect,
		accuracyRate,
		avgConfidenceDelta,
	}
}
