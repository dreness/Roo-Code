import type { ParsedConventionalCommit } from "../types"

// Conventional commit regex pattern
// Format: type(scope)!: description
const CONVENTIONAL_COMMIT_REGEX =
	/^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?\s*:\s*(?<description>.+?)(?:\n\n(?<body>[\s\S]*?))?(?:\n\n(?<footer>[\s\S]*))?$/

// Common commit type mappings
const TYPE_MAPPINGS: Record<string, string> = {
	fix: "fix",
	bugfix: "fix",
	hotfix: "fix",
	feat: "feat",
	feature: "feat",
	docs: "docs",
	doc: "docs",
	style: "style",
	refactor: "refactor",
	perf: "perf",
	performance: "perf",
	test: "test",
	tests: "test",
	build: "build",
	ci: "ci",
	chore: "chore",
	revert: "revert",
	wip: "chore",
}

export function parseConventionalCommit(message: string): ParsedConventionalCommit | null {
	// Extract first line for parsing
	const firstLine = message.split("\n")[0]?.trim() ?? ""
	const rest = message.slice(firstLine.length).trim()

	const match = CONVENTIONAL_COMMIT_REGEX.exec(message.trim())

	if (match?.groups) {
		const { type, scope, breaking, description, body, footer } = match.groups

		// Extract PR number from description or footer
		const prMatch = message.match(/#(\d+)/)
		const prNumber = prMatch?.[1] ? parseInt(prMatch[1], 10) : undefined

		return {
			type: normalizeType(type!),
			scope: scope?.trim(),
			breaking: breaking === "!",
			description: description!.trim(),
			body: body?.trim(),
			footer: footer?.trim(),
			prNumber,
		}
	}

	// Try simpler patterns for non-conventional commits
	// Pattern: "type: description"
	const simpleMatch = firstLine.match(/^(\w+):\s*(.+)$/)
	if (simpleMatch && simpleMatch[1] && simpleMatch[2]) {
		const type = simpleMatch[1]
		const description = simpleMatch[2]
		const prMatch = message.match(/#(\d+)/)

		return {
			type: normalizeType(type),
			breaking: false,
			description: description.trim(),
			body: rest || undefined,
			prNumber: prMatch?.[1] ? parseInt(prMatch[1], 10) : undefined,
		}
	}

	// Pattern: "[type] description"
	const bracketMatch = firstLine.match(/^\[(\w+)\]\s*(.+)$/)
	if (bracketMatch && bracketMatch[1] && bracketMatch[2]) {
		const type = bracketMatch[1]
		const description = bracketMatch[2]
		const prMatch = message.match(/#(\d+)/)

		return {
			type: normalizeType(type),
			breaking: false,
			description: description.trim(),
			body: rest || undefined,
			prNumber: prMatch?.[1] ? parseInt(prMatch[1], 10) : undefined,
		}
	}

	return null
}

function normalizeType(type: string): string {
	const normalized = type.toLowerCase().trim()
	return TYPE_MAPPINGS[normalized] || normalized
}

export function extractKeywords(message: string): string[] {
	const keywords: string[] = []

	// Common bug-related keywords
	const bugKeywords = [
		"fix",
		"bug",
		"issue",
		"error",
		"crash",
		"fail",
		"broken",
		"regression",
		"revert",
		"incorrect",
		"wrong",
		"missing",
		"undefined",
		"null",
		"exception",
		"throw",
	]

	// Feature-related keywords
	const featureKeywords = ["add", "new", "feature", "implement", "support", "enable", "introduce"]

	// Refactor-related keywords
	const refactorKeywords = ["refactor", "restructure", "reorganize", "simplify", "clean", "improve", "optimize"]

	const lowerMessage = message.toLowerCase()

	for (const kw of [...bugKeywords, ...featureKeywords, ...refactorKeywords]) {
		if (lowerMessage.includes(kw)) {
			keywords.push(kw)
		}
	}

	// Extract technical terms (camelCase, snake_case, PascalCase identifiers)
	const identifiers = message.match(/\b[a-z]+(?:[A-Z][a-z]+)+\b|\b[a-z]+_[a-z_]+\b|\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g)
	if (identifiers) {
		keywords.push(...identifiers.slice(0, 5)) // Limit to 5 identifiers
	}

	return [...new Set(keywords)]
}

export function isBreakingChange(message: string): boolean {
	const lowerMessage = message.toLowerCase()

	// Check for conventional commit breaking indicator
	if (message.includes("!:")) return true

	// Check for BREAKING CHANGE in footer
	if (lowerMessage.includes("breaking change")) return true
	if (lowerMessage.includes("breaking:")) return true

	return false
}

export function extractScope(message: string): string | undefined {
	const parsed = parseConventionalCommit(message)
	return parsed?.scope
}

export function extractPrNumber(message: string): number | undefined {
	// Common patterns:
	// (#123)
	// #123
	// PR #123
	// Fixes #123
	const match = message.match(/#(\d+)/)
	return match?.[1] ? parseInt(match[1], 10) : undefined
}

export function isRevert(message: string): boolean {
	const lowerMessage = message.toLowerCase()
	return (
		lowerMessage.startsWith("revert") ||
		lowerMessage.includes("reverts commit") ||
		lowerMessage.includes('revert "')
	)
}

export function getRevertedSha(message: string): string | undefined {
	// Pattern: Revert "..." - This reverts commit <sha>
	const match = message.match(/This reverts commit ([a-f0-9]{7,40})/i)
	if (match) return match[1]

	// Pattern: revert <sha>
	const simpleMatch = message.match(/revert\s+([a-f0-9]{7,40})/i)
	if (simpleMatch) return simpleMatch[1]

	return undefined
}
