import type { PatternSignature, PatternMatch, Subsystem } from "../types"
import type { Commit } from "../db/schema"
import {
	createRegressionPattern,
	getRegressionPatterns,
	getRegressionPatternByHash,
	addCommitToPattern,
	generatePatternHash,
} from "../db/queries/patterns"
import { extractKeywords } from "../git/parser"
import { extractSemanticKeywords } from "../classifiers/semantic"
import { getPrimarySubsystem } from "../classifiers/subsystem"

// Minimum similarity threshold to consider a match
const SIMILARITY_THRESHOLD = 0.4

export function extractPatternSignature(commit: Commit, filePaths: string[]): PatternSignature {
	const keywords = [...extractKeywords(commit.message), ...extractSemanticKeywords(commit.message)].slice(0, 10)

	const subsystem = getPrimarySubsystem(filePaths)

	// Extract file patterns (directories)
	const filePatterns = new Set<string>()
	for (const filePath of filePaths) {
		const parts = filePath.split("/")
		if (parts.length >= 2) {
			filePatterns.add(`${parts[0]}/${parts[1]}/*`)
		}
	}

	return {
		subsystem,
		keywords,
		filePatterns: [...filePatterns].slice(0, 5),
	}
}

export function calculatePatternSimilarity(sig1: PatternSignature, sig2: PatternSignature): PatternMatch | null {
	// Must be same subsystem for a match
	if (sig1.subsystem !== sig2.subsystem || sig1.subsystem === "unknown") {
		return null
	}

	// Calculate Jaccard similarity for keywords
	const kw1 = new Set(sig1.keywords.map((k) => k.toLowerCase()))
	const kw2 = new Set(sig2.keywords.map((k) => k.toLowerCase()))

	const intersection = new Set([...kw1].filter((k) => kw2.has(k)))
	const union = new Set([...kw1, ...kw2])

	if (intersection.size === 0 || union.size === 0) {
		return null
	}

	const keywordSimilarity = intersection.size / union.size

	// Calculate file pattern similarity
	const fp1 = new Set(sig1.filePatterns)
	const fp2 = new Set(sig2.filePatterns)

	const fpIntersection = new Set([...fp1].filter((f) => fp2.has(f)))
	const fpUnion = new Set([...fp1, ...fp2])

	const fileSimilarity = fpUnion.size > 0 ? fpIntersection.size / fpUnion.size : 0

	// Combined similarity (weighted)
	const similarity = keywordSimilarity * 0.7 + fileSimilarity * 0.3

	if (similarity < SIMILARITY_THRESHOLD) {
		return null
	}

	return {
		patternHash: generatePatternHash(sig1.subsystem, [...intersection]),
		similarity,
		matchedKeywords: [...intersection],
	}
}

export async function findMatchingPattern(signature: PatternSignature): Promise<PatternMatch | null> {
	// Get existing patterns for the same subsystem
	const patterns = await getRegressionPatterns({
		subsystem: signature.subsystem,
		status: "active",
	})

	let bestMatch: PatternMatch | null = null
	let bestSimilarity = 0

	for (const pattern of patterns) {
		const patternSig: PatternSignature = {
			subsystem: pattern.subsystem as Subsystem,
			keywords: pattern.keywords || [],
			filePatterns: pattern.filePatterns || [],
		}

		const match = calculatePatternSimilarity(signature, patternSig)

		if (match && match.similarity > bestSimilarity) {
			bestMatch = {
				patternHash: pattern.patternHash,
				similarity: match.similarity,
				matchedKeywords: match.matchedKeywords,
			}
			bestSimilarity = match.similarity
		}
	}

	return bestMatch
}

export async function detectRegression(
	commit: Commit,
	filePaths: string[],
): Promise<{ isRegression: boolean; patternHash?: string; isNew?: boolean }> {
	// Only bug fixes can be regressions
	if (commit.messageType !== "fix") {
		return { isRegression: false }
	}

	const signature = extractPatternSignature(commit, filePaths)

	// Skip if subsystem is unknown
	if (signature.subsystem === "unknown" || signature.keywords.length === 0) {
		return { isRegression: false }
	}

	// Look for matching pattern
	const match = await findMatchingPattern(signature)

	if (match && match.similarity >= SIMILARITY_THRESHOLD) {
		// Add this commit to the existing pattern
		await addCommitToPattern(match.patternHash, commit.sha)

		return {
			isRegression: true,
			patternHash: match.patternHash,
			isNew: false,
		}
	}

	// Check if we should create a new pattern
	// Only create patterns for commits with meaningful keywords
	if (signature.keywords.length >= 2) {
		const patternHash = generatePatternHash(signature.subsystem, signature.keywords)

		// Check if pattern already exists
		const existing = await getRegressionPatternByHash(patternHash)
		if (existing) {
			await addCommitToPattern(patternHash, commit.sha)
			return {
				isRegression: existing.occurrenceCount! >= 2,
				patternHash,
				isNew: false,
			}
		}

		// Create new pattern (not a regression yet until we see it again)
		await createRegressionPattern({
			patternHash,
			subsystem: signature.subsystem,
			keywords: signature.keywords,
			filePatterns: signature.filePatterns,
			firstOccurrence: commit.sha,
			occurrenceCount: 1,
			commitShas: [commit.sha],
			severity: "low",
			status: "active",
		})

		return {
			isRegression: false,
			patternHash,
			isNew: true,
		}
	}

	return { isRegression: false }
}

export async function getRecurringRegressions(minOccurrences: number = 2) {
	return getRegressionPatterns({
		minOccurrences,
		status: "active",
	})
}
