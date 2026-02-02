import { describe, it, expect, beforeEach, afterEach } from "vitest"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import * as schema from "../schema"
import type { DatabaseOrTransaction } from "../db"
import {
	getInvestigationDataExport,
	getConfidenceCalibration,
	getRejectionReasons,
	getVerificationMetrics,
} from "./analytics"
import { createInvestigation, completeInvestigation, addCandidate, addEvidence } from "./investigations"
import { createBugCausality, recordHumanFeedback } from "./causality"

/**
 * Test suite for analytics query functions
 */
describe("analytics", () => {
	let sqlite: Database.Database
	let db: DatabaseOrTransaction

	// Test data fixtures
	const testCommits = [
		{
			sha: "bug1fix234bug1fix234bug1fix234bug1fix2",
			shortSha: "bug1fix",
			author: "Bug Fixer 1",
			authorEmail: "fixer1@example.com",
			date: new Date("2024-01-20T10:00:00Z"),
			message: "fix: resolve memory leak in cache",
			messageType: "fix",
			messageScope: "cache",
			prNumber: 150,
			filesChanged: 2,
			insertions: 20,
			deletions: 5,
		},
		{
			sha: "bug2fix345bug2fix345bug2fix345bug2fix3",
			shortSha: "bug2fix",
			author: "Bug Fixer 2",
			authorEmail: "fixer2@example.com",
			date: new Date("2024-01-25T10:00:00Z"),
			message: "fix: correct validation logic",
			messageType: "fix",
			messageScope: "validation",
			prNumber: 155,
			filesChanged: 1,
			insertions: 10,
			deletions: 3,
		},
		{
			sha: "cause1abc456cause1abc456cause1abc456cau",
			shortSha: "cause1a",
			author: "Developer 1",
			authorEmail: "dev1@example.com",
			date: new Date("2024-01-10T10:00:00Z"),
			message: "feat: add caching layer",
			messageType: "feat",
			messageScope: "cache",
			prNumber: 145,
			filesChanged: 5,
			insertions: 200,
			deletions: 10,
		},
		{
			sha: "cause2def789cause2def789cause2def789cau",
			shortSha: "cause2d",
			author: "Developer 2",
			authorEmail: "dev2@example.com",
			date: new Date("2024-01-15T10:00:00Z"),
			message: "feat: update validation rules",
			messageType: "feat",
			messageScope: "validation",
			prNumber: 148,
			filesChanged: 3,
			insertions: 80,
			deletions: 20,
		},
		{
			sha: "other3ghi012other3ghi012other3ghi012oth",
			shortSha: "other3g",
			author: "Developer 3",
			authorEmail: "dev3@example.com",
			date: new Date("2024-01-05T10:00:00Z"),
			message: "refactor: cleanup logging",
			messageType: "refactor",
			messageScope: "logging",
			prNumber: 140,
			filesChanged: 2,
			insertions: 30,
			deletions: 25,
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

	describe("getInvestigationDataExport", () => {
		it("should export complete investigation data", async () => {
			// Create investigation with candidates and evidence
			const investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "analyst-1",
				},
				db,
			)

			await addCandidate(
				{
					investigationId,
					candidateSha: testCommits[2]!.sha,
					verdict: "root_cause",
					reasoning: "Introduced caching bug",
					orderExamined: 1,
				},
				db,
			)

			await addEvidence(
				{
					investigationId,
					evidenceType: "blame",
					filePath: "src/cache.ts",
					contentPreview: "Line 42 shows the problematic change",
				},
				db,
			)

			await completeInvestigation(
				{
					investigationId,
					conclusionType: "confirmed",
					finalCauseSha: testCommits[2]!.sha,
					confidenceOverride: 0.95,
					summary: "Root cause identified",
				},
				db,
			)

			// Create causality with feedback
			const causality = await createBugCausality(
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[2]!.sha,
					relationshipType: "root_cause",
					confidence: 0.85,
					analysisMethod: "semantic",
				},
				db,
			)

			await recordHumanFeedback(
				{
					causalityId: causality.id,
					humanVerified: true,
					humanConfidence: 0.9,
					automationWasCorrect: true,
				},
				db,
			)

			const exportData = await getInvestigationDataExport(undefined, db)

			expect(exportData.investigations).toHaveLength(1)
			expect(exportData.causalityRecords).toHaveLength(1)
			expect(exportData.summary.totalInvestigations).toBe(1)
			expect(exportData.summary.completedInvestigations).toBe(1)
			expect(exportData.summary.humanVerifiedRecords).toBe(1)

			const inv = exportData.investigations[0]!
			expect(inv.bugFixSha).toBe(testCommits[0]!.sha)
			expect(inv.investigator).toBe("analyst-1")
			expect(inv.candidates).toHaveLength(1)
			expect(inv.evidence).toHaveLength(1)
			expect(inv.conclusionType).toBe("confirmed")

			const causal = exportData.causalityRecords[0]!
			expect(causal.humanVerified).toBe(true)
			expect(causal.automationWasCorrect).toBe(true)
		})

		it("should filter by date range", async () => {
			// Create investigation in January 2024
			const _id1 = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "analyst-1",
				},
				db,
			)

			// Wait to ensure different timestamp
			await new Promise((resolve) => setTimeout(resolve, 10))

			// Create investigation in January 2024 (slightly later)
			await createInvestigation(
				{
					bugFixSha: testCommits[1]!.sha,
					investigator: "analyst-2",
				},
				db,
			)

			// Filter to exclude first investigation
			const exportData = await getInvestigationDataExport(
				{
					since: new Date("2024-01-20T12:00:00Z"),
				},
				db,
			)

			// Should get fewer investigations due to filter
			expect(exportData.investigations.length).toBeLessThanOrEqual(2)
		})

		it("should handle empty database", async () => {
			const exportData = await getInvestigationDataExport(undefined, db)

			expect(exportData.investigations).toHaveLength(0)
			expect(exportData.causalityRecords).toHaveLength(0)
			expect(exportData.summary.totalInvestigations).toBe(0)
			expect(exportData.summary.completedInvestigations).toBe(0)
		})

		it("should include both completed and in-progress investigations", async () => {
			const id1 = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "analyst-1",
				},
				db,
			)

			await completeInvestigation(
				{
					investigationId: id1,
					conclusionType: "confirmed",
				},
				db,
			)

			const _id2 = await createInvestigation(
				{
					bugFixSha: testCommits[1]!.sha,
					investigator: "analyst-2",
				},
				db,
			)

			const exportData = await getInvestigationDataExport(undefined, db)

			expect(exportData.summary.totalInvestigations).toBe(2)
			expect(exportData.summary.completedInvestigations).toBe(1)
		})
	})

	describe("getConfidenceCalibration", () => {
		beforeEach(async () => {
			// Create causality records with varying confidence levels
			const records = [
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[2]!.sha,
					confidence: 0.9,
					humanConfidence: 0.95,
					automationWasCorrect: true,
				},
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[3]!.sha,
					confidence: 0.85,
					humanConfidence: 0.9,
					automationWasCorrect: true,
				},
				{
					bugFixSha: testCommits[1]!.sha,
					causeSha: testCommits[3]!.sha,
					confidence: 0.5,
					humanConfidence: 0.3,
					automationWasCorrect: false,
				},
				{
					bugFixSha: testCommits[1]!.sha,
					causeSha: testCommits[4]!.sha,
					confidence: 0.3,
					humanConfidence: 0.1,
					automationWasCorrect: false,
				},
			]

			for (const record of records) {
				const causality = await createBugCausality(
					{
						bugFixSha: record.bugFixSha,
						causeSha: record.causeSha,
						relationshipType: "root_cause",
						confidence: record.confidence,
						analysisMethod: "semantic",
					},
					db,
				)

				await recordHumanFeedback(
					{
						causalityId: causality.id,
						humanVerified: true,
						humanConfidence: record.humanConfidence,
						automationWasCorrect: record.automationWasCorrect,
					},
					db,
				)
			}
		})

		it("should bin confidence levels correctly", async () => {
			const calibration = await getConfidenceCalibration(undefined, db)

			expect(calibration.bins).toHaveLength(5) // 5 bins: 0-20, 20-40, etc.

			// Check that high confidence bin contains the high confidence records
			const highBin = calibration.bins.find((b) => b.binStart === 0.8)
			expect(highBin).toBeDefined()
			expect(highBin!.count).toBe(2) // Two records in 80-100% range
		})

		it("should calculate overall metrics correctly", async () => {
			const calibration = await getConfidenceCalibration(undefined, db)

			expect(calibration.overall.totalSamples).toBe(4)
			expect(calibration.overall.avgAutomatedConfidence).toBeCloseTo(0.6375, 2) // (0.9+0.85+0.5+0.3)/4
			expect(calibration.overall.avgHumanConfidence).toBeCloseTo(0.5625, 2) // (0.95+0.9+0.3+0.1)/4
			expect(calibration.overall.overallAccuracy).toBe(0.5) // 2 correct out of 4
		})

		it("should calculate calibration score", async () => {
			const calibration = await getConfidenceCalibration(undefined, db)

			expect(calibration.overall.calibrationScore).toBeGreaterThanOrEqual(0)
			expect(calibration.overall.calibrationScore).toBeLessThanOrEqual(1)
		})

		it("should generate insights", async () => {
			const calibration = await getConfidenceCalibration(undefined, db)

			expect(calibration.insights).toBeDefined()
			expect(Array.isArray(calibration.insights)).toBe(true)
			expect(calibration.insights.length).toBeGreaterThan(0)
		})

		it("should handle empty data", async () => {
			// Create new database with no verified records
			const newSqlite = new Database(":memory:")
			newSqlite.pragma("journal_mode = WAL")
			const newDb = drizzle(newSqlite, { schema })

			const __dirname = dirname(fileURLToPath(import.meta.url))
			const migrationsFolder = join(__dirname, "../migrations")
			migrate(newDb, { migrationsFolder })

			const calibration = await getConfidenceCalibration(undefined, newDb)

			expect(calibration.overall.totalSamples).toBe(0)
			expect(calibration.overall.avgAutomatedConfidence).toBe(0)
			expect(calibration.overall.overallAccuracy).toBe(0)

			newSqlite.close()
		})

		it("should detect overconfidence", async () => {
			// Add record where automation is very confident but wrong
			const causality = await createBugCausality(
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[4]!.sha,
					relationshipType: "root_cause",
					confidence: 0.95, // Very high confidence
					analysisMethod: "semantic",
				},
				db,
			)

			await recordHumanFeedback(
				{
					causalityId: causality.id,
					humanVerified: true,
					humanConfidence: 0.2,
					automationWasCorrect: false, // But wrong
				},
				db,
			)

			const calibration = await getConfidenceCalibration(undefined, db)

			// Should have some insight about overconfidence or poor calibration
			const hasOverconfidenceWarning = calibration.insights.some(
				(i) => i.includes("overconfident") || i.includes("Poor"),
			)
			expect(hasOverconfidenceWarning).toBe(true)
		})
	})

	describe("getRejectionReasons", () => {
		beforeEach(async () => {
			// Create investigation with multiple rejected candidates
			const investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "analyst-1",
				},
				db,
			)

			await addCandidate(
				{
					investigationId,
					candidateSha: testCommits[2]!.sha,
					verdict: "ruled_out",
					rejectionReason: "Changes are unrelated to the bug",
					reasoning: "Modified different module",
					orderExamined: 1,
				},
				db,
			)

			await addCandidate(
				{
					investigationId,
					candidateSha: testCommits[3]!.sha,
					verdict: "ruled_out",
					rejectionReason: "Commit is too old, temporal mismatch",
					reasoning: "Happened months before the bug",
					orderExamined: 2,
				},
				db,
			)

			await addCandidate(
				{
					investigationId,
					candidateSha: testCommits[4]!.sha,
					verdict: "ruled_out",
					rejectionReason: "Only refactoring and cleanup, no logic changes",
					reasoning: "Code reorganization",
					orderExamined: 3,
				},
				db,
			)
		})

		it("should aggregate rejection reasons", async () => {
			const analysis = await getRejectionReasons(undefined, db)

			expect(analysis.totalRejections).toBe(3)
			expect(analysis.reasons.length).toBeGreaterThan(0)
		})

		it("should normalize similar rejection reasons", async () => {
			const analysis = await getRejectionReasons(undefined, db)

			// Should have normalized reasons
			const reasons = analysis.reasons.map((r) => r.reason)
			expect(reasons).toContain("Unrelated changes")
			expect(reasons).toContain("Temporal mismatch")
			expect(reasons).toContain("Refactoring/cleanup")
		})

		it("should calculate percentages correctly", async () => {
			const analysis = await getRejectionReasons(undefined, db)

			const totalPercentage = analysis.reasons.reduce((sum, r) => sum + r.percentage, 0)
			expect(totalPercentage).toBeCloseTo(100, 0) // Should sum to ~100%
		})

		it("should extract keyword frequencies", async () => {
			const analysis = await getRejectionReasons(undefined, db)

			expect(analysis.topKeywords.length).toBeGreaterThan(0)
			// Should filter out common stop words
			const hasStopWords = analysis.topKeywords.some((k) => ["the", "a", "an", "is", "was"].includes(k.keyword))
			expect(hasStopWords).toBe(false)
		})

		it("should provide suggestions based on patterns", async () => {
			const analysis = await getRejectionReasons(undefined, db)

			expect(analysis.suggestions).toBeDefined()
			expect(Array.isArray(analysis.suggestions)).toBe(true)
		})

		it("should include examples for each reason", async () => {
			const analysis = await getRejectionReasons(undefined, db)

			for (const reason of analysis.reasons) {
				expect(reason.examples).toBeDefined()
				expect(reason.examples.length).toBeGreaterThan(0)
				expect(reason.examples.length).toBeLessThanOrEqual(3) // Max 3 examples
			}
		})

		it("should handle empty rejection data", async () => {
			// Create new database with no rejections
			const newSqlite = new Database(":memory:")
			newSqlite.pragma("journal_mode = WAL")
			const newDb = drizzle(newSqlite, { schema })

			const __dirname = dirname(fileURLToPath(import.meta.url))
			const migrationsFolder = join(__dirname, "../migrations")
			migrate(newDb, { migrationsFolder })

			const analysis = await getRejectionReasons(undefined, newDb)

			expect(analysis.totalRejections).toBe(0)
			expect(analysis.reasons).toHaveLength(0)
			expect(analysis.suggestions.length).toBeGreaterThan(0)
			// Should suggest that more data is needed
			expect(analysis.suggestions.some((s) => s.includes("No rejection data"))).toBe(true)

			newSqlite.close()
		})

		it("should filter by date range", async () => {
			// Create another investigation outside date range
			const investigationId2 = await createInvestigation(
				{
					bugFixSha: testCommits[1]!.sha,
					investigator: "analyst-2",
				},
				db,
			)

			await addCandidate(
				{
					investigationId: investigationId2,
					candidateSha: testCommits[2]!.sha,
					verdict: "ruled_out",
					rejectionReason: "Different file/component modified",
					orderExamined: 1,
				},
				db,
			)

			// Filter should only include investigations in range
			const analysis = await getRejectionReasons(
				{
					since: new Date("2024-01-01"),
					until: new Date("2024-12-31"),
				},
				db,
			)

			expect(analysis.totalRejections).toBeGreaterThan(0)
		})
	})

	describe("getVerificationMetrics", () => {
		beforeEach(async () => {
			// Create causality records with different methods and verification states
			const records = [
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[2]!.sha,
					relationshipType: "root_cause" as const,
					confidence: 0.9,
					analysisMethod: "semantic",
					humanVerified: true,
					humanConfidence: 0.95,
					automationWasCorrect: true,
				},
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[3]!.sha,
					relationshipType: "contributing" as const,
					confidence: 0.7,
					analysisMethod: "semantic",
					humanVerified: true,
					humanConfidence: 0.8,
					automationWasCorrect: true,
				},
				{
					bugFixSha: testCommits[1]!.sha,
					causeSha: testCommits[3]!.sha,
					relationshipType: "root_cause" as const,
					confidence: 0.85,
					analysisMethod: "explicit",
					humanVerified: true,
					humanConfidence: 0.3,
					automationWasCorrect: false,
				},
				{
					bugFixSha: testCommits[1]!.sha,
					causeSha: testCommits[4]!.sha,
					relationshipType: "contributing" as const,
					confidence: 0.6,
					analysisMethod: "explicit",
					humanVerified: false, // Not verified
					humanConfidence: null,
					automationWasCorrect: null,
				},
			]

			for (const record of records) {
				const causality = await createBugCausality(
					{
						bugFixSha: record.bugFixSha,
						causeSha: record.causeSha,
						relationshipType: record.relationshipType,
						confidence: record.confidence,
						analysisMethod: record.analysisMethod,
					},
					db,
				)

				if (record.humanVerified) {
					await recordHumanFeedback(
						{
							causalityId: causality.id,
							humanVerified: record.humanVerified,
							humanConfidence: record.humanConfidence,
							automationWasCorrect: record.automationWasCorrect,
						},
						db,
					)
				}
			}
		})

		it("should calculate overall metrics correctly", async () => {
			const metrics = await getVerificationMetrics(undefined, db)

			expect(metrics.overall.totalCausalityRecords).toBe(4)
			expect(metrics.overall.humanVerifiedCount).toBe(3)
			expect(metrics.overall.verificationRate).toBeCloseTo(0.75, 2) // 3/4
			expect(metrics.overall.correctCount).toBe(2)
			expect(metrics.overall.incorrectCount).toBe(1)
			expect(metrics.overall.accuracyRate).toBeCloseTo(0.667, 2) // 2/3
		})

		it("should breakdown metrics by analysis method", async () => {
			const metrics = await getVerificationMetrics(undefined, db)

			expect(metrics.byMethod.length).toBeGreaterThan(0)

			const semanticMethod = metrics.byMethod.find((m) => m.method === "semantic")
			expect(semanticMethod).toBeDefined()
			expect(semanticMethod!.count).toBe(2)
			expect(semanticMethod!.verifiedCount).toBe(2)
			expect(semanticMethod!.correctCount).toBe(2)
			expect(semanticMethod!.accuracyRate).toBe(1.0) // 100% accurate

			const explicitMethod = metrics.byMethod.find((m) => m.method === "explicit")
			expect(explicitMethod).toBeDefined()
			expect(explicitMethod!.count).toBe(2)
			expect(explicitMethod!.verifiedCount).toBe(1)
			expect(explicitMethod!.accuracyRate).toBe(0) // 0% accurate
		})

		it("should breakdown metrics by relationship type", async () => {
			const metrics = await getVerificationMetrics(undefined, db)

			expect(metrics.byRelationshipType.length).toBeGreaterThan(0)

			const rootCause = metrics.byRelationshipType.find((r) => r.relationshipType === "root_cause")
			expect(rootCause).toBeDefined()
			expect(rootCause!.count).toBe(2)

			const contributing = metrics.byRelationshipType.find((r) => r.relationshipType === "contributing")
			expect(contributing).toBeDefined()
			expect(contributing!.count).toBe(2)
		})

		it("should include trend data", async () => {
			const metrics = await getVerificationMetrics(undefined, db)

			expect(metrics.trends).toBeDefined()
			expect(Array.isArray(metrics.trends)).toBe(true)
		})

		it("should handle no verified records", async () => {
			// Create new database with only unverified records
			const newSqlite = new Database(":memory:")
			newSqlite.pragma("journal_mode = WAL")
			const newDb = drizzle(newSqlite, { schema })

			const __dirname = dirname(fileURLToPath(import.meta.url))
			const migrationsFolder = join(__dirname, "../migrations")
			migrate(newDb, { migrationsFolder })

			await newDb.insert(schema.commits).values(testCommits)

			await createBugCausality(
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[2]!.sha,
					relationshipType: "root_cause",
					confidence: 0.8,
					analysisMethod: "semantic",
				},
				newDb,
			)

			const metrics = await getVerificationMetrics(undefined, newDb)

			expect(metrics.overall.totalCausalityRecords).toBe(1)
			expect(metrics.overall.humanVerifiedCount).toBe(0)
			expect(metrics.overall.verificationRate).toBe(0)
			expect(metrics.overall.accuracyRate).toBe(0)

			newSqlite.close()
		})

		it("should filter by date range", async () => {
			// Use a date range that includes current date (records created in beforeEach)
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)

			const tomorrow = new Date()
			tomorrow.setDate(tomorrow.getDate() + 1)

			const metrics = await getVerificationMetrics(
				{
					since: yesterday,
					until: tomorrow,
				},
				db,
			)

			expect(metrics.overall.totalCausalityRecords).toBeGreaterThan(0)
		})

		it("should calculate average confidence values", async () => {
			const metrics = await getVerificationMetrics(undefined, db)

			const semanticMethod = metrics.byMethod.find((m) => m.method === "semantic")
			expect(semanticMethod).toBeDefined()
			expect(semanticMethod!.avgConfidence).toBeGreaterThan(0)
			expect(semanticMethod!.avgHumanConfidence).toBeGreaterThan(0)
		})
	})
})
