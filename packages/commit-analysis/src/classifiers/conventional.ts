import type { CommitCategory } from "../db/schema"
import type { ClassificationResult } from "../types"
import { parseConventionalCommit } from "../git/parser"

// Map conventional commit types to categories
const TYPE_TO_CATEGORY: Record<string, CommitCategory> = {
	fix: "bugfix",
	feat: "feature",
	docs: "documentation",
	style: "style",
	refactor: "refactor",
	perf: "performance",
	test: "test",
	build: "build",
	ci: "ci",
	chore: "chore",
	revert: "revert",
}

export function classifyByConventionalCommit(message: string): ClassificationResult | null {
	const parsed = parseConventionalCommit(message)

	if (!parsed) {
		return null
	}

	const category = TYPE_TO_CATEGORY[parsed.type] || "unknown"
	const flags: string[] = []

	if (parsed.breaking) {
		flags.push("breaking-change")
	}

	if (parsed.scope) {
		flags.push(`scope:${parsed.scope}`)
	}

	// High confidence for well-formed conventional commits
	let confidence = 0.9

	// Reduce confidence if type is not standard
	if (!TYPE_TO_CATEGORY[parsed.type]) {
		confidence = 0.7
	}

	return {
		category,
		confidence,
		flags,
		riskScore: 0, // Will be calculated separately
	}
}

export function getMessageType(message: string): string | null {
	const parsed = parseConventionalCommit(message)
	return parsed?.type || null
}

export function getMessageScope(message: string): string | null {
	const parsed = parseConventionalCommit(message)
	return parsed?.scope || null
}
