import type { CommitCategory } from "../db/schema"
import type { ClassificationResult } from "../types"

// Semantic patterns for commit classification
interface SemanticPattern {
	keywords: string[]
	category: CommitCategory
	weight: number
}

const SEMANTIC_PATTERNS: SemanticPattern[] = [
	// Bug fix patterns (high weight)
	{
		keywords: ["fix", "bug", "issue", "error", "crash", "broken", "regression", "hotfix"],
		category: "bugfix",
		weight: 0.9,
	},
	{
		keywords: ["correct", "resolve", "repair", "patch", "wrong", "incorrect", "missing"],
		category: "bugfix",
		weight: 0.7,
	},

	// Feature patterns
	{
		keywords: ["add", "new", "feature", "implement", "introduce", "support", "enable"],
		category: "feature",
		weight: 0.8,
	},
	{
		keywords: ["create", "allow", "provide", "extend"],
		category: "feature",
		weight: 0.6,
	},

	// Refactor patterns
	{
		keywords: ["refactor", "restructure", "reorganize", "simplify", "clean"],
		category: "refactor",
		weight: 0.85,
	},
	{
		keywords: ["rename", "move", "extract", "inline", "split", "merge"],
		category: "refactor",
		weight: 0.7,
	},

	// Performance patterns
	{
		keywords: ["perf", "performance", "optimize", "speed", "fast", "slow", "cache"],
		category: "performance",
		weight: 0.85,
	},
	{
		keywords: ["memory", "cpu", "efficient", "reduce", "improve performance"],
		category: "performance",
		weight: 0.7,
	},

	// Documentation patterns
	{
		keywords: ["doc", "docs", "documentation", "readme", "comment", "jsdoc", "tsdoc"],
		category: "documentation",
		weight: 0.9,
	},

	// Test patterns
	{
		keywords: ["test", "tests", "spec", "specs", "coverage", "unit test", "e2e"],
		category: "test",
		weight: 0.9,
	},

	// Build patterns
	{
		keywords: ["build", "webpack", "vite", "esbuild", "bundle", "compile"],
		category: "build",
		weight: 0.85,
	},
	{
		keywords: ["dependency", "dependencies", "package", "npm", "pnpm", "yarn"],
		category: "build",
		weight: 0.7,
	},

	// CI patterns
	{
		keywords: ["ci", "cd", "pipeline", "workflow", "github actions", "jenkins"],
		category: "ci",
		weight: 0.9,
	},

	// Style patterns
	{
		keywords: ["style", "format", "lint", "prettier", "eslint", "whitespace"],
		category: "style",
		weight: 0.85,
	},

	// Revert patterns
	{
		keywords: ["revert", "rollback", "undo"],
		category: "revert",
		weight: 0.95,
	},

	// Chore patterns
	{
		keywords: ["chore", "misc", "cleanup", "housekeeping", "maintenance"],
		category: "chore",
		weight: 0.8,
	},
	{
		keywords: ["update", "upgrade", "bump", "version"],
		category: "chore",
		weight: 0.5,
	},
]

export function classifyBySemantic(message: string): ClassificationResult {
	const lowerMessage = message.toLowerCase()
	const scores: Record<CommitCategory, number> = {} as Record<CommitCategory, number>

	// Calculate scores for each category
	for (const pattern of SEMANTIC_PATTERNS) {
		for (const keyword of pattern.keywords) {
			if (lowerMessage.includes(keyword)) {
				const currentScore = scores[pattern.category] || 0
				scores[pattern.category] = Math.max(currentScore, pattern.weight)
			}
		}
	}

	// Find the highest scoring category
	let bestCategory: CommitCategory = "unknown"
	let bestScore = 0

	for (const [category, score] of Object.entries(scores)) {
		if (score > bestScore) {
			bestScore = score
			bestCategory = category as CommitCategory
		}
	}

	// Extract matched keywords as flags
	const flags: string[] = []
	for (const pattern of SEMANTIC_PATTERNS) {
		if (pattern.category === bestCategory) {
			for (const keyword of pattern.keywords) {
				if (lowerMessage.includes(keyword)) {
					flags.push(`keyword:${keyword}`)
				}
			}
		}
	}

	// Confidence is based on the score and number of matching keywords
	const confidence = bestScore * Math.min(1, 0.5 + flags.length * 0.1)

	return {
		category: bestCategory,
		confidence: Math.min(confidence, 0.85), // Cap at 0.85 for semantic (lower than conventional)
		flags: flags.slice(0, 5), // Limit flags
		riskScore: 0,
	}
}

export function extractSemanticKeywords(message: string): string[] {
	const lowerMessage = message.toLowerCase()
	const keywords: string[] = []

	for (const pattern of SEMANTIC_PATTERNS) {
		for (const keyword of pattern.keywords) {
			if (lowerMessage.includes(keyword)) {
				keywords.push(keyword)
			}
		}
	}

	return [...new Set(keywords)]
}
