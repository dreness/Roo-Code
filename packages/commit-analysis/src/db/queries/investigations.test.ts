import { describe, it, expect, beforeEach, afterEach } from "vitest"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import * as schema from "../schema"
import type { DatabaseOrTransaction } from "../db"
import {
	createInvestigation,
	completeInvestigation,
	addCandidate,
	addEvidence,
	getInvestigationsForBugFix,
	getInvestigationWithDetails,
} from "./investigations"

/**
 * Test suite for investigation query functions
 */
describe("investigations", () => {
	let sqlite: Database.Database
	let db: DatabaseOrTransaction

	// Test data fixtures
	const testCommits = [
		{
			sha: "abc123def456abc123def456abc123def456abc1",
			shortSha: "abc123d",
			author: "Test Author",
			authorEmail: "test@example.com",
			date: new Date("2024-01-15T10:00:00Z"),
			message: "fix: resolve null pointer issue",
			messageType: "fix",
			messageScope: "core",
			prNumber: 123,
			filesChanged: 3,
			insertions: 45,
			deletions: 12,
		},
		{
			sha: "def456abc789def456abc789def456abc789def4",
			shortSha: "def456a",
			author: "Another Author",
			authorEmail: "another@example.com",
			date: new Date("2024-01-10T10:00:00Z"),
			message: "feat: add new validation logic",
			messageType: "feat",
			messageScope: "validation",
			prNumber: 120,
			filesChanged: 2,
			insertions: 80,
			deletions: 5,
		},
		{
			sha: "789abc456def789abc456def789abc456def7890",
			shortSha: "789abc4",
			author: "Third Author",
			authorEmail: "third@example.com",
			date: new Date("2024-01-05T10:00:00Z"),
			message: "refactor: update error handling",
			messageType: "refactor",
			messageScope: "errors",
			prNumber: 115,
			filesChanged: 5,
			insertions: 120,
			deletions: 80,
		},
	]

	beforeEach(async () => {
		// Create in-memory SQLite database
		sqlite = new Database(":memory:")
		sqlite.pragma("journal_mode = WAL")

		db = drizzle(sqlite, { schema })

		// Run migrations
		const __dirname = dirname(fileURLToPath(import.meta.url))
		const migrationsFolder = join(__dirname, "../migrations")
		migrate(db, { migrationsFolder })

		// Insert test commits
		await db.insert(schema.commits).values(testCommits)
	})

	afterEach(() => {
		sqlite.close()
	})

	describe("createInvestigation", () => {
		it("should create investigation with correct timestamps", async () => {
			const investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "test-investigator",
				},
				db,
			)

			expect(investigationId).toBeTypeOf("number")
			expect(investigationId).toBeGreaterThan(0)

			// Verify the record was created
			const investigation = await db.query.causalityInvestigations.findFirst({
				where: (table, { eq }) => eq(table.id, investigationId),
			})

			expect(investigation).toBeDefined()
			expect(investigation?.bugFixSha).toBe(testCommits[0]!.sha)
			expect(investigation?.investigator).toBe("test-investigator")
			expect(investigation?.startedAt).toBeInstanceOf(Date)
			expect(investigation?.startedAt.getTime()).toBeGreaterThan(0)
			expect(investigation?.completedAt).toBeNull()
			expect(investigation?.conclusionType).toBeNull()
		})

		it("should allow multiple investigations for the same bug fix", async () => {
			const id1 = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "investigator-1",
				},
				db,
			)

			const id2 = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "investigator-2",
				},
				db,
			)

			expect(id1).not.toBe(id2)

			const investigations = await getInvestigationsForBugFix(testCommits[0]!.sha, db)
			expect(investigations).toHaveLength(2)
		})

		it("should throw error for non-existent commit", async () => {
			await expect(
				createInvestigation(
					{
						bugFixSha: "nonexistent0000000000000000000000000000",
						investigator: "test-investigator",
					},
					db,
				),
			).rejects.toThrow()
		})
	})

	describe("completeInvestigation", () => {
		it("should update investigation with completion data", async () => {
			const investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "test-investigator",
				},
				db,
			)

			const result = await completeInvestigation(
				{
					investigationId,
					conclusionType: "confirmed",
					finalCauseSha: testCommits[1]!.sha,
					confidenceOverride: 0.95,
					summary: "Root cause identified through git blame analysis",
				},
				db,
			)

			expect(result.id).toBe(investigationId)
			expect(result.completedAt).toBeInstanceOf(Date)
			expect(result.completedAt!.getTime()).toBeGreaterThan(0)
			expect(result.conclusionType).toBe("confirmed")
			expect(result.finalCauseSha).toBe(testCommits[1]!.sha)
			expect(result.confidenceOverride).toBe(0.95)
			expect(result.summary).toBe("Root cause identified through git blame analysis")
		})

		it("should handle completion without final cause", async () => {
			const investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "test-investigator",
				},
				db,
			)

			const result = await completeInvestigation(
				{
					investigationId,
					conclusionType: "inconclusive",
					summary: "Could not determine root cause",
				},
				db,
			)

			expect(result.conclusionType).toBe("inconclusive")
			expect(result.finalCauseSha).toBeNull()
			expect(result.confidenceOverride).toBeNull()
		})

		it("should throw error for non-existent investigation", async () => {
			await expect(
				completeInvestigation(
					{
						investigationId: 99999,
						conclusionType: "confirmed",
					},
					db,
				),
			).rejects.toThrow(/Failed to complete investigation/)
		})
	})

	describe("addCandidate", () => {
		let investigationId: number

		beforeEach(async () => {
			investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "test-investigator",
				},
				db,
			)
		})

		it("should add candidate with verdict", async () => {
			const candidate = await addCandidate(
				{
					investigationId,
					candidateSha: testCommits[1]!.sha,
					verdict: "root_cause",
					reasoning: "Changed the affected function",
					orderExamined: 1,
				},
				db,
			)

			expect(candidate.id).toBeTypeOf("number")
			expect(candidate.investigationId).toBe(investigationId)
			expect(candidate.candidateSha).toBe(testCommits[1]!.sha)
			expect(candidate.verdict).toBe("root_cause")
			expect(candidate.reasoning).toBe("Changed the affected function")
			expect(candidate.orderExamined).toBe(1)
			expect(candidate.rejectionReason).toBeNull()
		})

		it("should add ruled_out candidate with rejection reason", async () => {
			const candidate = await addCandidate(
				{
					investigationId,
					candidateSha: testCommits[2]!.sha,
					verdict: "ruled_out",
					rejectionReason: "Unrelated changes to different module",
					reasoning: "Only modified error handling, not validation logic",
					orderExamined: 2,
				},
				db,
			)

			expect(candidate.verdict).toBe("ruled_out")
			expect(candidate.rejectionReason).toBe("Unrelated changes to different module")
			expect(candidate.reasoning).toBe("Only modified error handling, not validation logic")
		})

		it("should add multiple candidates", async () => {
			await addCandidate(
				{
					investigationId,
					candidateSha: testCommits[1]!.sha,
					verdict: "contributing",
					orderExamined: 1,
				},
				db,
			)

			await addCandidate(
				{
					investigationId,
					candidateSha: testCommits[2]!.sha,
					verdict: "ruled_out",
					rejectionReason: "Unrelated",
					orderExamined: 2,
				},
				db,
			)

			const investigation = await getInvestigationWithDetails(investigationId, db)
			expect(investigation?.candidates).toHaveLength(2)
		})

		it("should throw error for non-existent investigation", async () => {
			await expect(
				addCandidate(
					{
						investigationId: 99999,
						candidateSha: testCommits[1]!.sha,
						verdict: "root_cause",
					},
					db,
				),
			).rejects.toThrow()
		})

		it("should throw error for non-existent commit", async () => {
			await expect(
				addCandidate(
					{
						investigationId,
						candidateSha: "nonexistent0000000000000000000000000000",
						verdict: "root_cause",
					},
					db,
				),
			).rejects.toThrow()
		})
	})

	describe("addEvidence", () => {
		let investigationId: number

		beforeEach(async () => {
			investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "test-investigator",
				},
				db,
			)
		})

		it("should record evidence artifact", async () => {
			const evidence = await addEvidence(
				{
					investigationId,
					evidenceType: "blame",
					filePath: "src/core/validator.ts",
					contentHash: "abc123hash",
					contentPreview: "Line 42: if (value === null) {",
				},
				db,
			)

			expect(evidence.id).toBeTypeOf("number")
			expect(evidence.investigationId).toBe(investigationId)
			expect(evidence.evidenceType).toBe("blame")
			expect(evidence.filePath).toBe("src/core/validator.ts")
			expect(evidence.contentHash).toBe("abc123hash")
			expect(evidence.contentPreview).toBe("Line 42: if (value === null) {")
			expect(evidence.capturedAt).toBeInstanceOf(Date)
			expect(evidence.capturedAt.getTime()).toBeGreaterThan(0)
		})

		it("should add diff evidence", async () => {
			const evidence = await addEvidence(
				{
					investigationId,
					evidenceType: "diff",
					filePath: "src/core/validator.ts",
					contentPreview: "+  if (value !== null && value !== undefined) {",
				},
				db,
			)

			expect(evidence.evidenceType).toBe("diff")
		})

		it("should add manual note evidence", async () => {
			const evidence = await addEvidence(
				{
					investigationId,
					evidenceType: "manual_note",
					contentPreview: "Confirmed with author that this change introduced the bug",
				},
				db,
			)

			expect(evidence.evidenceType).toBe("manual_note")
			expect(evidence.filePath).toBeNull()
			expect(evidence.contentHash).toBeNull()
		})

		it("should throw error for non-existent investigation", async () => {
			await expect(
				addEvidence(
					{
						investigationId: 99999,
						evidenceType: "blame",
						contentPreview: "test",
					},
					db,
				),
			).rejects.toThrow()
		})
	})

	describe("getInvestigationsForBugFix", () => {
		it("should retrieve all investigations for a bug fix", async () => {
			const id1 = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "investigator-1",
				},
				db,
			)

			const id2 = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "investigator-2",
				},
				db,
			)

			const investigations = await getInvestigationsForBugFix(testCommits[0]!.sha, db)

			expect(investigations).toHaveLength(2)
			// Both investigations should be present
			const ids = investigations.map((i) => i.id).sort()
			expect(ids).toContain(id1)
			expect(ids).toContain(id2)
		})

		it("should return empty array for bug fix with no investigations", async () => {
			const investigations = await getInvestigationsForBugFix(testCommits[1]!.sha, db)
			expect(investigations).toHaveLength(0)
		})

		it("should not return investigations for different bug fixes", async () => {
			await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "investigator-1",
				},
				db,
			)

			await createInvestigation(
				{
					bugFixSha: testCommits[1]!.sha,
					investigator: "investigator-2",
				},
				db,
			)

			const investigations = await getInvestigationsForBugFix(testCommits[0]!.sha, db)
			expect(investigations).toHaveLength(1)
			expect(investigations[0]!.bugFixSha).toBe(testCommits[0]!.sha)
		})
	})

	describe("getInvestigationWithDetails", () => {
		it("should include nested candidates and evidence", async () => {
			const investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "test-investigator",
				},
				db,
			)

			// Add candidates
			await addCandidate(
				{
					investigationId,
					candidateSha: testCommits[1]!.sha,
					verdict: "root_cause",
					orderExamined: 1,
				},
				db,
			)

			await addCandidate(
				{
					investigationId,
					candidateSha: testCommits[2]!.sha,
					verdict: "ruled_out",
					rejectionReason: "Unrelated",
					orderExamined: 2,
				},
				db,
			)

			// Add evidence
			await addEvidence(
				{
					investigationId,
					evidenceType: "blame",
					filePath: "src/core/validator.ts",
					contentPreview: "Line 42 blame",
				},
				db,
			)

			await addEvidence(
				{
					investigationId,
					evidenceType: "diff",
					filePath: "src/core/validator.ts",
					contentPreview: "Diff content",
				},
				db,
			)

			const investigation = await getInvestigationWithDetails(investigationId, db)

			expect(investigation).not.toBeNull()
			expect(investigation!.id).toBe(investigationId)
			expect(investigation!.candidates).toHaveLength(2)
			expect(investigation!.evidence).toHaveLength(2)

			// Verify candidates are ordered by orderExamined DESC
			expect(investigation!.candidates[0]!.orderExamined).toBe(2)
			expect(investigation!.candidates[1]!.orderExamined).toBe(1)
		})

		it("should return null for non-existent investigation", async () => {
			const investigation = await getInvestigationWithDetails(99999, db)
			expect(investigation).toBeNull()
		})

		it("should handle investigation with no candidates or evidence", async () => {
			const investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "test-investigator",
				},
				db,
			)

			const investigation = await getInvestigationWithDetails(investigationId, db)

			expect(investigation).not.toBeNull()
			expect(investigation!.candidates).toHaveLength(0)
			expect(investigation!.evidence).toHaveLength(0)
		})

		it("should include completed investigation details", async () => {
			const investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "test-investigator",
				},
				db,
			)

			await completeInvestigation(
				{
					investigationId,
					conclusionType: "confirmed",
					finalCauseSha: testCommits[1]!.sha,
					confidenceOverride: 0.9,
					summary: "Root cause confirmed",
				},
				db,
			)

			const investigation = await getInvestigationWithDetails(investigationId, db)

			expect(investigation).not.toBeNull()
			expect(investigation!.conclusionType).toBe("confirmed")
			expect(investigation!.finalCauseSha).toBe(testCommits[1]!.sha)
			expect(investigation!.confidenceOverride).toBe(0.9)
			expect(investigation!.summary).toBe("Root cause confirmed")
			expect(investigation!.completedAt).toBeInstanceOf(Date)
		})
	})
})
