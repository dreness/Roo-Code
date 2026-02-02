import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

// Core commit metadata
export const commits = sqliteTable(
	"commits",
	{
		sha: text("sha").primaryKey(),
		shortSha: text("short_sha").notNull(),
		author: text("author").notNull(),
		authorEmail: text("author_email").notNull(),
		date: integer("date", { mode: "timestamp" }).notNull(),
		message: text("message").notNull(),
		messageType: text("message_type"), // fix, feat, chore, etc.
		messageScope: text("message_scope"), // e.g., "ui", "provider"
		prNumber: integer("pr_number"),
		filesChanged: integer("files_changed").default(0),
		insertions: integer("insertions").default(0),
		deletions: integer("deletions").default(0),
		analyzedAt: integer("analyzed_at", { mode: "timestamp" }),
		deepAnalyzedAt: integer("deep_analyzed_at", { mode: "timestamp" }),
	},
	(table) => [
		index("commits_date_idx").on(table.date),
		index("commits_message_type_idx").on(table.messageType),
		index("commits_analyzed_at_idx").on(table.analyzedAt),
		index("commits_deep_analyzed_at_idx").on(table.deepAnalyzedAt),
	],
)

export const commitsRelations = relations(commits, ({ many, one }) => ({
	fileChanges: many(fileChanges),
	classification: one(classifications, {
		fields: [commits.sha],
		references: [classifications.commitSha],
	}),
	causedBugs: many(bugCausality, { relationName: "causedBugs" }),
	fixedBy: many(bugCausality, { relationName: "fixedBy" }),
}))

// Per-file change details
export const fileChanges = sqliteTable(
	"file_changes",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		commitSha: text("commit_sha")
			.notNull()
			.references(() => commits.sha, { onDelete: "cascade" }),
		filePath: text("file_path").notNull(),
		changeType: text("change_type", { enum: ["A", "M", "D", "R"] }).notNull(),
		insertions: integer("insertions").default(0),
		deletions: integer("deletions").default(0),
		subsystem: text("subsystem"),
	},
	(table) => [
		uniqueIndex("file_changes_commit_file_idx").on(table.commitSha, table.filePath),
		index("file_changes_subsystem_idx").on(table.subsystem),
	],
)

export const fileChangesRelations = relations(fileChanges, ({ one }) => ({
	commit: one(commits, {
		fields: [fileChanges.commitSha],
		references: [commits.sha],
	}),
}))

// Commit category enum values
export const commitCategories = [
	"bugfix",
	"feature",
	"refactor",
	"documentation",
	"test",
	"build",
	"ci",
	"chore",
	"style",
	"performance",
	"revert",
	"unknown",
] as const

export type CommitCategory = (typeof commitCategories)[number]

// Analysis results
export const classifications = sqliteTable(
	"classifications",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		commitSha: text("commit_sha")
			.notNull()
			.references(() => commits.sha, { onDelete: "cascade" }),
		category: text("category", { enum: commitCategories }).notNull(),
		confidence: real("confidence").notNull().default(0),
		flags: text("flags", { mode: "json" }).$type<string[]>().default([]),
		riskScore: real("risk_score").notNull().default(0),
		analysisVersion: integer("analysis_version").notNull().default(1),
	},
	(table) => [
		uniqueIndex("classifications_commit_sha_idx").on(table.commitSha),
		index("classifications_category_idx").on(table.category),
		index("classifications_risk_score_idx").on(table.riskScore),
	],
)

export const classificationsRelations = relations(classifications, ({ one }) => ({
	commit: one(commits, {
		fields: [classifications.commitSha],
		references: [commits.sha],
	}),
}))

// Version releases
export const releases = sqliteTable(
	"releases",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		version: text("version").notNull().unique(),
		date: integer("date", { mode: "timestamp" }).notNull(),
		tagSha: text("tag_sha"),
		fixCount: integer("fix_count").default(0),
		featureCount: integer("feature_count").default(0),
		totalRisk: real("total_risk").default(0),
	},
	(table) => [index("releases_date_idx").on(table.date)],
)

// Bug causality relationship types
export const relationshipTypes = ["root_cause", "related_to"] as const
export type RelationshipType = (typeof relationshipTypes)[number]

// Investigation conclusion types
export const conclusionTypes = [
	"confirmed", // Human confirmed automated causality
	"rejected", // Human determined automated causality was wrong
	"inconclusive", // Human could not determine causality
	"new_cause_found", // Human found a different root cause
] as const
export type ConclusionType = (typeof conclusionTypes)[number]

// Investigation candidate verdicts
export const candidateVerdicts = [
	"root_cause", // This commit is the root cause
	"contributing", // This commit contributed but isn't primary cause
	"ruled_out", // This commit was considered but ruled out
	"uncertain", // Could not determine
] as const
export type CandidateVerdict = (typeof candidateVerdicts)[number]

// Investigation evidence types
export const evidenceTypes = [
	"blame", // git blame output
	"diff", // git diff output
	"bisect", // git bisect session
	"log", // git log output
	"manual_note", // Investigator's note
] as const
export type EvidenceType = (typeof evidenceTypes)[number]

// Causality investigations - Human investigation sessions for bug causality
export const causalityInvestigations = sqliteTable(
	"causality_investigations",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		bugFixSha: text("bug_fix_sha")
			.notNull()
			.references(() => commits.sha, { onDelete: "cascade" }),
		investigator: text("investigator").notNull(),
		startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
		completedAt: integer("completed_at", { mode: "timestamp" }),
		conclusionType: text("conclusion_type", { enum: conclusionTypes }),
		finalCauseSha: text("final_cause_sha").references(() => commits.sha),
		confidenceOverride: real("confidence_override"),
		summary: text("summary"),
	},
	(table) => [
		index("causality_investigations_bug_fix_sha_idx").on(table.bugFixSha),
		index("causality_investigations_investigator_idx").on(table.investigator),
		index("causality_investigations_conclusion_type_idx").on(table.conclusionType),
	],
)

export const causalityInvestigationsRelations = relations(causalityInvestigations, ({ one, many }) => ({
	bugFix: one(commits, {
		fields: [causalityInvestigations.bugFixSha],
		references: [commits.sha],
		relationName: "investigatedFixes",
	}),
	finalCause: one(commits, {
		fields: [causalityInvestigations.finalCauseSha],
		references: [commits.sha],
		relationName: "finalCauseOf",
	}),
	candidates: many(investigationCandidates),
	evidence: many(investigationEvidence),
	bugCausalityRecords: many(bugCausality),
}))

// Bug causality - Links bug fixes to their root causes
export const bugCausality = sqliteTable(
	"bug_causality",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		bugFixSha: text("bug_fix_sha")
			.notNull()
			.references(() => commits.sha, { onDelete: "cascade" }),
		causeSha: text("cause_sha")
			.notNull()
			.references(() => commits.sha, { onDelete: "cascade" }),
		relationshipType: text("relationship_type", { enum: relationshipTypes }).notNull(),
		confidence: real("confidence").notNull().default(0),
		bugAge: integer("bug_age"), // Days between cause and fix
		bugAgeCommits: integer("bug_age_commits"), // Commits between cause and fix
		analysisMethod: text("analysis_method"),
		notes: text("notes"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		verifiedAt: integer("verified_at", { mode: "timestamp" }),
		verifiedBy: text("verified_by"),
		// New columns for interactive research
		investigationId: integer("investigation_id").references(() => causalityInvestigations.id),
		humanVerified: integer("human_verified", { mode: "boolean" }).default(false),
		humanConfidence: real("human_confidence"),
		automationWasCorrect: integer("automation_was_correct", { mode: "boolean" }),
	},
	(table) => [
		index("bug_causality_bug_fix_sha_idx").on(table.bugFixSha),
		index("bug_causality_cause_sha_idx").on(table.causeSha),
		index("bug_causality_relationship_type_idx").on(table.relationshipType),
		uniqueIndex("bug_causality_unique_idx").on(table.bugFixSha, table.causeSha),
	],
)

export const bugCausalityRelations = relations(bugCausality, ({ one }) => ({
	bugFix: one(commits, {
		fields: [bugCausality.bugFixSha],
		references: [commits.sha],
		relationName: "fixedBy",
	}),
	cause: one(commits, {
		fields: [bugCausality.causeSha],
		references: [commits.sha],
		relationName: "causedBugs",
	}),
	investigation: one(causalityInvestigations, {
		fields: [bugCausality.investigationId],
		references: [causalityInvestigations.id],
	}),
}))

// Investigation candidates - Commits examined during investigation
export const investigationCandidates = sqliteTable(
	"investigation_candidates",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		investigationId: integer("investigation_id")
			.notNull()
			.references(() => causalityInvestigations.id, { onDelete: "cascade" }),
		candidateSha: text("candidate_sha")
			.notNull()
			.references(() => commits.sha, { onDelete: "cascade" }),
		verdict: text("verdict", { enum: candidateVerdicts }).notNull(),
		rejectionReason: text("rejection_reason"),
		reasoning: text("reasoning"),
		orderExamined: integer("order_examined"),
	},
	(table) => [
		index("investigation_candidates_investigation_id_idx").on(table.investigationId),
		index("investigation_candidates_verdict_idx").on(table.verdict),
		uniqueIndex("investigation_candidates_unique_idx").on(table.investigationId, table.candidateSha),
	],
)

export const investigationCandidatesRelations = relations(investigationCandidates, ({ one }) => ({
	investigation: one(causalityInvestigations, {
		fields: [investigationCandidates.investigationId],
		references: [causalityInvestigations.id],
	}),
	candidate: one(commits, {
		fields: [investigationCandidates.candidateSha],
		references: [commits.sha],
	}),
}))

// Investigation evidence - Evidence collected during investigation
export const investigationEvidence = sqliteTable(
	"investigation_evidence",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		investigationId: integer("investigation_id")
			.notNull()
			.references(() => causalityInvestigations.id, { onDelete: "cascade" }),
		evidenceType: text("evidence_type", { enum: evidenceTypes }).notNull(),
		filePath: text("file_path"),
		contentHash: text("content_hash"),
		contentPreview: text("content_preview"),
		capturedAt: integer("captured_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [
		index("investigation_evidence_investigation_id_idx").on(table.investigationId),
		index("investigation_evidence_evidence_type_idx").on(table.evidenceType),
	],
)

export const investigationEvidenceRelations = relations(investigationEvidence, ({ one }) => ({
	investigation: one(causalityInvestigations, {
		fields: [investigationEvidence.investigationId],
		references: [causalityInvestigations.id],
	}),
}))

// Regression pattern severity levels
export const severityLevels = ["low", "medium", "high"] as const
export type SeverityLevel = (typeof severityLevels)[number]

// Regression pattern status
export const patternStatuses = ["active", "resolved"] as const
export type PatternStatus = (typeof patternStatuses)[number]

// Regression patterns - Recurring issues
export const regressionPatterns = sqliteTable(
	"regression_patterns",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		patternHash: text("pattern_hash").notNull().unique(),
		subsystem: text("subsystem"),
		keywords: text("keywords", { mode: "json" }).$type<string[]>().default([]),
		filePatterns: text("file_patterns", { mode: "json" }).$type<string[]>().default([]),
		firstOccurrence: text("first_occurrence").references(() => commits.sha),
		occurrenceCount: integer("occurrence_count").default(1),
		commitShas: text("commit_shas", { mode: "json" }).$type<string[]>().default([]),
		severity: text("severity", { enum: severityLevels }).default("low"),
		status: text("status", { enum: patternStatuses }).default("active"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [
		index("regression_patterns_subsystem_idx").on(table.subsystem),
		index("regression_patterns_status_idx").on(table.status),
	],
)

// Analysis cache types
export const cacheTypes = ["blame", "bisect", "diff", "log"] as const
export type CacheType = (typeof cacheTypes)[number]

// Analysis cache - Speed up future analysis
export const analysisCache = sqliteTable(
	"analysis_cache",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		cacheKey: text("cache_key").notNull().unique(),
		cacheType: text("cache_type", { enum: cacheTypes }).notNull(),
		filePath: text("file_path"),
		lineRange: text("line_range"),
		resultSha: text("result_sha"),
		resultData: text("result_data", { mode: "json" }),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp" }),
	},
	(table) => [
		index("analysis_cache_cache_type_idx").on(table.cacheType),
		index("analysis_cache_expires_at_idx").on(table.expiresAt),
		index("analysis_cache_file_path_idx").on(table.filePath),
	],
)

// Type exports
export type Commit = typeof commits.$inferSelect
export type InsertCommit = Omit<typeof commits.$inferInsert, "analyzedAt" | "deepAnalyzedAt">
export type UpdateCommit = Partial<Omit<Commit, "sha">>

export type FileChange = typeof fileChanges.$inferSelect
export type InsertFileChange = Omit<typeof fileChanges.$inferInsert, "id">

export type Classification = typeof classifications.$inferSelect
export type InsertClassification = Omit<typeof classifications.$inferInsert, "id">
export type UpdateClassification = Partial<Omit<Classification, "id" | "commitSha">>

export type Release = typeof releases.$inferSelect
export type InsertRelease = Omit<typeof releases.$inferInsert, "id">

export type BugCausality = typeof bugCausality.$inferSelect
export type InsertBugCausality = Omit<typeof bugCausality.$inferInsert, "id" | "createdAt">

export type CausalityInvestigation = typeof causalityInvestigations.$inferSelect
export type InsertCausalityInvestigation = Omit<typeof causalityInvestigations.$inferInsert, "id">

export type InvestigationCandidate = typeof investigationCandidates.$inferSelect
export type InsertInvestigationCandidate = Omit<typeof investigationCandidates.$inferInsert, "id">

export type InvestigationEvidence = typeof investigationEvidence.$inferSelect
export type InsertInvestigationEvidence = Omit<typeof investigationEvidence.$inferInsert, "id">

export type RegressionPattern = typeof regressionPatterns.$inferSelect
export type InsertRegressionPattern = Omit<typeof regressionPatterns.$inferInsert, "id" | "createdAt" | "updatedAt">

export type AnalysisCache = typeof analysisCache.$inferSelect
export type InsertAnalysisCache = Omit<typeof analysisCache.$inferInsert, "id" | "createdAt">

// Schema bundle for Drizzle
export const schema = {
	commits,
	commitsRelations,
	fileChanges,
	fileChangesRelations,
	classifications,
	classificationsRelations,
	releases,
	causalityInvestigations,
	causalityInvestigationsRelations,
	bugCausality,
	bugCausalityRelations,
	investigationCandidates,
	investigationCandidatesRelations,
	investigationEvidence,
	investigationEvidenceRelations,
	regressionPatterns,
	analysisCache,
}
