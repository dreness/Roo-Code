import { eq, desc, and, sql, inArray } from "drizzle-orm"
import type { DatabaseOrTransaction } from "../db"
import { getDb } from "../db"
import { bugCausality, commits, type InsertBugCausality, type BugCausality } from "../schema"

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
