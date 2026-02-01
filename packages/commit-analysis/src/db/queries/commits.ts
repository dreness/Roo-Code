import { eq, desc, and, gte, lte, sql, inArray, isNull } from "drizzle-orm"
import type { DatabaseOrTransaction } from "../db"
import { getDb } from "../db"
import { commits, fileChanges, type InsertCommit, type InsertFileChange, type Commit } from "../schema"

export async function createCommit(data: InsertCommit, db: DatabaseOrTransaction = getDb()): Promise<Commit> {
	const result = await db
		.insert(commits)
		.values({
			...data,
			analyzedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: commits.sha,
			set: {
				...data,
				analyzedAt: new Date(),
			},
		})
		.returning()

	const record = result[0]
	if (!record) {
		throw new Error(`Failed to create commit ${data.sha}`)
	}
	return record
}

export async function createFileChanges(changes: InsertFileChange[], db: DatabaseOrTransaction = getDb()) {
	if (changes.length === 0) return []

	// Use onConflictDoUpdate to handle re-analysis of commits
	const results = []
	for (const change of changes) {
		const result = await db
			.insert(fileChanges)
			.values(change)
			.onConflictDoUpdate({
				target: [fileChanges.commitSha, fileChanges.filePath],
				set: {
					changeType: change.changeType,
					insertions: change.insertions,
					deletions: change.deletions,
					subsystem: change.subsystem,
				},
			})
			.returning()
		if (result[0]) {
			results.push(result[0])
		}
	}
	return results
}

export async function getCommit(sha: string, db: DatabaseOrTransaction = getDb()) {
	return db.query.commits.findFirst({
		where: eq(commits.sha, sha),
		with: {
			fileChanges: true,
			classification: true,
		},
	})
}

export async function getCommitBySha(sha: string, db: DatabaseOrTransaction = getDb()) {
	// Support both full and short SHA
	const commit = await db.query.commits.findFirst({
		where: eq(commits.sha, sha),
	})

	if (commit) return commit

	// Try short SHA match
	return db.query.commits.findFirst({
		where: sql`${commits.sha} LIKE ${sha + "%"}`,
	})
}

export async function getCommits(
	options: {
		since?: Date
		until?: Date
		limit?: number
		offset?: number
		messageType?: string
	} = {},
	db: DatabaseOrTransaction = getDb(),
) {
	const conditions = []

	if (options.since) {
		conditions.push(gte(commits.date, options.since))
	}
	if (options.until) {
		conditions.push(lte(commits.date, options.until))
	}
	if (options.messageType) {
		conditions.push(eq(commits.messageType, options.messageType))
	}

	return db.query.commits.findMany({
		where: conditions.length > 0 ? and(...conditions) : undefined,
		orderBy: desc(commits.date),
		limit: options.limit,
		offset: options.offset,
		with: {
			classification: true,
		},
	})
}

export async function getCommitCount(db: DatabaseOrTransaction = getDb()) {
	const result = await db.select({ count: sql<number>`count(*)` }).from(commits)
	return result[0]?.count ?? 0
}

export async function getLatestCommit(db: DatabaseOrTransaction = getDb()) {
	return db.query.commits.findFirst({
		orderBy: desc(commits.date),
	})
}

export async function getUnanalyzedCommits(db: DatabaseOrTransaction = getDb()) {
	return db.query.commits.findMany({
		where: isNull(commits.deepAnalyzedAt),
		orderBy: desc(commits.date),
	})
}

export async function markCommitDeepAnalyzed(sha: string, db: DatabaseOrTransaction = getDb()) {
	return db.update(commits).set({ deepAnalyzedAt: new Date() }).where(eq(commits.sha, sha))
}

export async function getCommitsBySubsystem(subsystem: string, db: DatabaseOrTransaction = getDb()) {
	const changes = await db.query.fileChanges.findMany({
		where: eq(fileChanges.subsystem, subsystem),
		with: {
			commit: {
				with: {
					classification: true,
				},
			},
		},
	})

	// Get unique commits
	const uniqueCommits = new Map<string, (typeof changes)[0]["commit"]>()
	for (const change of changes) {
		if (change.commit && !uniqueCommits.has(change.commit.sha)) {
			uniqueCommits.set(change.commit.sha, change.commit)
		}
	}

	return Array.from(uniqueCommits.values())
}

export async function deleteCommit(sha: string, db: DatabaseOrTransaction = getDb()) {
	return db.delete(commits).where(eq(commits.sha, sha))
}

export async function deleteCommits(shas: string[], db: DatabaseOrTransaction = getDb()) {
	if (shas.length === 0) return
	return db.delete(commits).where(inArray(commits.sha, shas))
}
