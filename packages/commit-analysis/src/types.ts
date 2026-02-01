import type { CommitCategory, RelationshipType } from "./db/schema"

// Git data types
export interface GitCommitRaw {
	sha: string
	shortSha: string
	author: string
	authorEmail: string
	date: Date
	message: string
	prNumber?: number
	filesChanged: number
	insertions: number
	deletions: number
}

export interface GitFileChange {
	filePath: string
	changeType: "A" | "M" | "D" | "R"
	insertions: number
	deletions: number
}

// Classification types
export interface ClassificationResult {
	category: CommitCategory
	confidence: number
	flags: string[]
	riskScore: number
}

// Conventional commit parsed
export interface ParsedConventionalCommit {
	type: string
	scope?: string
	breaking: boolean
	description: string
	body?: string
	footer?: string
	prNumber?: number
}

// Subsystem mapping
export type Subsystem = "provider" | "tool" | "ui" | "api" | "core" | "test" | "build" | "docs" | "config" | "unknown"

// Causality analysis types
export interface CausalityResult {
	causeSha: string
	relationshipType: RelationshipType
	confidence: number
	bugAge?: number
	bugAgeCommits?: number
	analysisMethod: string
	notes?: string
}

export type AnalysisMethod = "explicit" | "blame" | "semantic" | "temporal"

export interface DeepAnalysisConfig {
	batchSize: number
	concurrency: number
	methods: AnalysisMethod[]
	maxAgeDays: number
}

// Regression pattern types
export interface PatternSignature {
	subsystem: Subsystem
	keywords: string[]
	filePatterns: string[]
}

export interface PatternMatch {
	patternHash: string
	similarity: number
	matchedKeywords: string[]
}

// Risk scoring types
export interface RiskFactors {
	filesChanged: number
	linesChanged: number
	subsystemsAffected: number
	isBreakingChange: boolean
	touchesCriticalPaths: boolean
	hasTests: boolean
	authorExperience: number // commits in this area
	recentRegressions: number // in same subsystem
}

export interface RiskBreakdown {
	baseScore: number
	factors: Record<string, number>
	finalScore: number
}

// Sync advisor types
export interface SyncRecommendation {
	recommendedCommit: string
	totalRisk: number
	commitCount: number
	breakdown: {
		features: number
		fixes: number
		other: number
	}
	warnings: string[]
	safeToSync: boolean
}

// Export/Import types
export interface CommitAnalysisExport {
	version: "1.0"
	exportedAt: string
	commits: ExportedCommit[]
}

export interface ExportedCommit {
	sha: string
	classification: {
		category: CommitCategory
		confidence: number
		flags: string[]
		riskScore: number
	}
	causality?: {
		causes: {
			sha: string
			type: RelationshipType
			confidence: number
			bugAge?: number
			method: string
		}[]
		causedBugs: {
			sha: string
			type: RelationshipType
			confidence: number
		}[]
	}
}

// CLI types
export interface AnalyzeOptions {
	since?: string
	until?: string
	incremental?: boolean
	concurrency?: number
}

export interface DeepAnalyzeOptions {
	batchSize?: number
	concurrency?: number
	methods?: AnalysisMethod[]
	maxAgeDays?: number
}

export interface RiskOptions {
	commits?: string[]
	threshold?: number
	since?: string
}

export interface SyncOptions {
	upstream?: string
	local?: string
	maxRisk?: number
}
