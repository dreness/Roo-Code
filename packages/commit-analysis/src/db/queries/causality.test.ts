import { describe, it, expect, beforeEach, afterEach } from "vitest"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import * as schema from "../schema"
import type { DatabaseOrTransaction } from "../db"
import {
	createBugCausality,
	linkToInvestigation,
	recordHumanFeedback,
	getAutomationAccuracy,
	getCausesForBugFix,
} from "./causality"
import { createInvestigation } from "./investigations"

/**
 * Test suite for causality query functions, focusing on investigation feedback
 */
describe("causality", () => {
	let sqlite: Database.Database
	let db: DatabaseOrTransaction

	// Test data fixtures
	const testCommits = [
		{
			sha: "bug123fix456bug123fix456bug123fix456bug1",
			shortSha: "bug123f",
			author: "Bug Fixer",
			authorEmail: "fixer@example.com",
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
			sha: "cause456abc789cause456abc789cause456abc78",
			shortSha: "cause45",
			author: "Feature Developer",
			authorEmail: "dev@example.com",
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
			sha: "other789def012other789def012other789def01",
			shortSha: "other78",
			author: "Other Developer",
			authorEmail: "other@example.com",
			date: new Date("2024-01-05T10:00:00Z"),
			message: "refactor: improve logging",
			messageType: "refactor",
			messageScope: "logging",
			prNumber: 140,
			filesChanged: 3,
			insertions: 50,
			deletions: 30,
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

	describe("linkToInvestigation", () => {
		let investigationId: number
		let causalityId: number

		beforeEach(async () => {
			// Create test investigation
			investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "test-investigator",
				},
				db,
			)

			// Create test causality record
			const causality = await createBugCausality(
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[1]!.sha,
					relationshipType: "root_cause",
					confidence: 0.85,
					bugAge: 10,
					analysisMethod: "semantic",
				},
				db,
			)
			causalityId = causality.id
		})

		it("should link causality to investigation using causalityId", async () => {
			const result = await linkToInvestigation(
				{
					causalityId,
					investigationId,
				},
				db,
			)

			expect(result).not.toBeNull()
			expect(result!.id).toBe(causalityId)
			expect(result!.investigationId).toBe(investigationId)
		})

		it("should link causality to investigation using bugFixSha and causeSha", async () => {
			const result = await linkToInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[1]!.sha,
					investigationId,
				},
				db,
			)

			expect(result).not.toBeNull()
			expect(result!.investigationId).toBe(investigationId)
			expect(result!.bugFixSha).toBe(testCommits[0]!.sha)
			expect(result!.causeSha).toBe(testCommits[1]!.sha)
		})

		it("should return null for non-existent causality record", async () => {
			const result = await linkToInvestigation(
				{
					causalityId: 99999,
					investigationId,
				},
				db,
			)

			expect(result).toBeNull()
		})

		it("should update existing link", async () => {
			// Create another investigation
			const investigationId2 = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "another-investigator",
				},
				db,
			)

			// Link to first investigation
			await linkToInvestigation({ causalityId, investigationId }, db)

			// Link to second investigation (update)
			const result = await linkToInvestigation({ causalityId, investigationId: investigationId2 }, db)

			expect(result).not.toBeNull()
			expect(result!.investigationId).toBe(investigationId2)
		})
	})

	describe("recordHumanFeedback", () => {
		let causalityId: number

		beforeEach(async () => {
			const causality = await createBugCausality(
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[1]!.sha,
					relationshipType: "root_cause",
					confidence: 0.75,
					bugAge: 10,
					analysisMethod: "semantic",
				},
				db,
			)
			causalityId = causality.id
		})

		it("should record human verification as correct", async () => {
			const result = await recordHumanFeedback(
				{
					causalityId,
					humanVerified: true,
					humanConfidence: 0.9,
					automationWasCorrect: true,
				},
				db,
			)

			expect(result).not.toBeNull()
			expect(result!.humanVerified).toBe(true)
			expect(result!.humanConfidence).toBe(0.9)
			expect(result!.automationWasCorrect).toBe(true)
		})

		it("should record human verification as incorrect", async () => {
			const result = await recordHumanFeedback(
				{
					causalityId,
					humanVerified: true,
					humanConfidence: 0.3,
					automationWasCorrect: false,
				},
				db,
			)

			expect(result).not.toBeNull()
			expect(result!.humanVerified).toBe(true)
			expect(result!.humanConfidence).toBe(0.3)
			expect(result!.automationWasCorrect).toBe(false)
		})

		it("should record feedback using bugFixSha and causeSha", async () => {
			const result = await recordHumanFeedback(
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[1]!.sha,
					humanVerified: true,
					humanConfidence: 0.85,
					automationWasCorrect: true,
				},
				db,
			)

			expect(result).not.toBeNull()
			expect(result!.humanVerified).toBe(true)
			expect(result!.humanConfidence).toBe(0.85)
		})

		it("should handle feedback without confidence", async () => {
			const result = await recordHumanFeedback(
				{
					causalityId,
					humanVerified: true,
					automationWasCorrect: true,
				},
				db,
			)

			expect(result).not.toBeNull()
			expect(result!.humanVerified).toBe(true)
			expect(result!.humanConfidence).toBeNull()
			expect(result!.automationWasCorrect).toBe(true)
		})

		it("should handle feedback without automationWasCorrect", async () => {
			const result = await recordHumanFeedback(
				{
					causalityId,
					humanVerified: true,
					humanConfidence: 0.8,
				},
				db,
			)

			expect(result).not.toBeNull()
			expect(result!.humanVerified).toBe(true)
			expect(result!.humanConfidence).toBe(0.8)
			expect(result!.automationWasCorrect).toBeNull()
		})

		it("should return null for non-existent causality record", async () => {
			const result = await recordHumanFeedback(
				{
					causalityId: 99999,
					humanVerified: true,
					automationWasCorrect: true,
				},
				db,
			)

			expect(result).toBeNull()
		})

		it("should update existing feedback", async () => {
			// Record initial feedback
			await recordHumanFeedback(
				{
					causalityId,
					humanVerified: true,
					humanConfidence: 0.5,
					automationWasCorrect: false,
				},
				db,
			)

			// Update feedback
			const result = await recordHumanFeedback(
				{
					causalityId,
					humanVerified: true,
					humanConfidence: 0.9,
					automationWasCorrect: true,
				},
				db,
			)

			expect(result).not.toBeNull()
			expect(result!.humanConfidence).toBe(0.9)
			expect(result!.automationWasCorrect).toBe(true)
		})
	})

	describe("getAutomationAccuracy", () => {
		beforeEach(async () => {
			// Create multiple causality records with different feedback
			const records = [
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[1]!.sha,
					relationshipType: "root_cause" as const,
					confidence: 0.9,
					analysisMethod: "semantic",
					humanVerified: true,
					humanConfidence: 0.95,
					automationWasCorrect: true,
				},
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[2]!.sha,
					relationshipType: "contributing" as const,
					confidence: 0.6,
					analysisMethod: "semantic",
					humanVerified: true,
					humanConfidence: 0.3,
					automationWasCorrect: false,
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
		})

		it("should calculate overall accuracy correctly", async () => {
			const result = await getAutomationAccuracy(undefined, db)

			expect(result.totalVerified).toBe(2)
			expect(result.totalCorrect).toBe(1)
			expect(result.accuracyRate).toBe(0.5) // 1 correct out of 2
		})

		it("should calculate average confidence delta", async () => {
			const result = await getAutomationAccuracy(undefined, db)

			// First record: 0.95 - 0.9 = 0.05
			// Second record: 0.3 - 0.6 = -0.3
			// Average: (0.05 + (-0.3)) / 2 = -0.125
			expect(result.avgConfidenceDelta).toBeCloseTo(-0.125, 2)
		})

		it("should filter by relationshipType", async () => {
			const result = await getAutomationAccuracy({ relationshipType: "root_cause" }, db)

			expect(result.totalVerified).toBe(1)
			expect(result.totalCorrect).toBe(1)
			expect(result.accuracyRate).toBe(1.0)
		})

		it("should filter by analysisMethod", async () => {
			const result = await getAutomationAccuracy({ analysisMethod: "semantic" }, db)

			expect(result.totalVerified).toBe(2)
		})

		it("should filter by date range", async () => {
			// Use a date range that includes current date (records created in beforeEach)
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)

			const tomorrow = new Date()
			tomorrow.setDate(tomorrow.getDate() + 1)

			const result = await getAutomationAccuracy(
				{
					dateFrom: yesterday,
					dateTo: tomorrow,
				},
				db,
			)

			expect(result.totalVerified).toBe(2)
		})

		it("should return zero accuracy when no verified records exist", async () => {
			// Create new database with no verified records
			const newSqlite = new Database(":memory:")
			newSqlite.pragma("journal_mode = WAL")
			const newDb = drizzle(newSqlite, { schema })

			const __dirname = dirname(fileURLToPath(import.meta.url))
			const migrationsFolder = join(__dirname, "../migrations")
			migrate(newDb, { migrationsFolder })

			const result = await getAutomationAccuracy(undefined, newDb)

			expect(result.totalVerified).toBe(0)
			expect(result.totalCorrect).toBe(0)
			expect(result.accuracyRate).toBe(0)
			expect(result.avgConfidenceDelta).toBe(0)

			newSqlite.close()
		})

		it("should handle all correct records", async () => {
			// Add another correct record
			const causality = await createBugCausality(
				{
					bugFixSha: testCommits[1]!.sha,
					causeSha: testCommits[2]!.sha,
					relationshipType: "root_cause",
					confidence: 0.8,
					analysisMethod: "explicit",
				},
				db,
			)

			await recordHumanFeedback(
				{
					causalityId: causality.id,
					humanVerified: true,
					humanConfidence: 0.85,
					automationWasCorrect: true,
				},
				db,
			)

			const result = await getAutomationAccuracy(undefined, db)

			expect(result.totalVerified).toBe(3)
			expect(result.totalCorrect).toBe(2)
			expect(result.accuracyRate).toBeCloseTo(0.667, 2)
		})

		it("should handle all incorrect records", async () => {
			// Update the first record to be incorrect
			const causes = await getCausesForBugFix(testCommits[0]!.sha, db)
			const firstCausality = causes.find((c) => c.causeSha === testCommits[1]!.sha)

			await recordHumanFeedback(
				{
					causalityId: firstCausality!.id,
					humanVerified: true,
					humanConfidence: 0.2,
					automationWasCorrect: false,
				},
				db,
			)

			const result = await getAutomationAccuracy(undefined, db)

			expect(result.totalVerified).toBe(2)
			expect(result.totalCorrect).toBe(0)
			expect(result.accuracyRate).toBe(0)
		})

		it("should combine multiple filters", async () => {
			const result = await getAutomationAccuracy(
				{
					relationshipType: "root_cause",
					analysisMethod: "semantic",
					dateFrom: new Date("2024-01-01"),
				},
				db,
			)

			expect(result.totalVerified).toBe(1)
			expect(result.totalCorrect).toBe(1)
		})
	})

	describe("integration with investigations", () => {
		it("should link causality record created from investigation", async () => {
			// Create investigation
			const investigationId = await createInvestigation(
				{
					bugFixSha: testCommits[0]!.sha,
					investigator: "test-investigator",
				},
				db,
			)

			// Create causality record
			const causality = await createBugCausality(
				{
					bugFixSha: testCommits[0]!.sha,
					causeSha: testCommits[1]!.sha,
					relationshipType: "root_cause",
					confidence: 0.85,
					analysisMethod: "manual",
				},
				db,
			)

			// Link to investigation
			await linkToInvestigation({ causalityId: causality.id, investigationId }, db)

			// Record human feedback
			await recordHumanFeedback(
				{
					causalityId: causality.id,
					humanVerified: true,
					humanConfidence: 0.95,
					automationWasCorrect: true,
				},
				db,
			)

			// Verify all fields are set correctly
			const causes = await getCausesForBugFix(testCommits[0]!.sha, db)
			const linkedCausality = causes[0]

			expect(linkedCausality?.investigationId).toBe(investigationId)
			expect(linkedCausality?.humanVerified).toBe(true)
			expect(linkedCausality?.humanConfidence).toBe(0.95)
			expect(linkedCausality?.automationWasCorrect).toBe(true)
		})
	})
})
