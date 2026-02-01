import type { CausalityResult, DeepAnalysisConfig } from "../types"
import type { Commit } from "../db/schema"
import { analyzeByBlame } from "./blame-method"
import { analyzeBySemantic } from "./semantic-method"
import { analyzeByTemporal } from "./temporal-method"
import { getRevertedSha, isRevert } from "../git/parser"

const DEFAULT_CONFIG: DeepAnalysisConfig = {
	batchSize: 50,
	concurrency: 4,
	methods: ["explicit", "blame", "semantic", "temporal"],
	maxAgeDays: 90,
}

export async function analyzeBugCausality(
	bugFix: Commit,
	options: Partial<DeepAnalysisConfig> = {},
	repoPath?: string,
): Promise<CausalityResult[]> {
	const config = { ...DEFAULT_CONFIG, ...options }
	const results: CausalityResult[] = []

	// 1. Check for explicit references (highest confidence)
	if (config.methods.includes("explicit")) {
		const explicitResult = await analyzeExplicitReferences(bugFix)
		if (explicitResult) {
			results.push(explicitResult)
		}
	}

	// 2. Blame-based analysis
	if (config.methods.includes("blame")) {
		const blameResults = await analyzeByBlame(bugFix, config.maxAgeDays, repoPath)
		results.push(...blameResults)
	}

	// 3. Semantic similarity analysis
	if (config.methods.includes("semantic")) {
		const semanticResults = await analyzeBySemantic(bugFix, config.maxAgeDays)
		results.push(...semanticResults)
	}

	// 4. Temporal proximity analysis
	if (config.methods.includes("temporal")) {
		const temporalResults = await analyzeByTemporal(bugFix, config.maxAgeDays)
		results.push(...temporalResults)
	}

	// Deduplicate and merge results
	return mergeResults(results)
}

async function analyzeExplicitReferences(bugFix: Commit): Promise<CausalityResult | null> {
	const message = bugFix.message

	// Check if this is a revert
	if (isRevert(message)) {
		const revertedSha = getRevertedSha(message)
		if (revertedSha) {
			return {
				causeSha: revertedSha,
				relationshipType: "root_cause",
				confidence: 0.95,
				analysisMethod: "explicit",
				notes: "Revert commit",
			}
		}
	}

	// Check for "introduced in", "caused by" patterns
	const patterns = [
		/introduced\s+in\s+([a-f0-9]{7,40})/i,
		/caused\s+by\s+([a-f0-9]{7,40})/i,
		/regression\s+from\s+([a-f0-9]{7,40})/i,
		/broke\s+in\s+([a-f0-9]{7,40})/i,
		/broken\s+by\s+([a-f0-9]{7,40})/i,
	]

	for (const pattern of patterns) {
		const match = message.match(pattern)
		if (match?.[1]) {
			return {
				causeSha: match[1],
				relationshipType: "root_cause",
				confidence: 0.95,
				analysisMethod: "explicit",
				notes: `Matched pattern: ${pattern.source}`,
			}
		}
	}

	// Check for "fixes #<issue>" that references another PR
	// This would require GitHub API access, so we skip for now

	return null
}

function mergeResults(results: CausalityResult[]): CausalityResult[] {
	const byCommit = new Map<string, CausalityResult>()

	for (const result of results) {
		const existing = byCommit.get(result.causeSha)

		if (!existing) {
			byCommit.set(result.causeSha, result)
		} else {
			// Merge: keep highest confidence, prefer root_cause over related_to
			const merged: CausalityResult = {
				causeSha: result.causeSha,
				relationshipType:
					existing.relationshipType === "root_cause" || result.relationshipType === "root_cause"
						? "root_cause"
						: "related_to",
				confidence: Math.max(existing.confidence, result.confidence),
				bugAge: existing.bugAge ?? result.bugAge,
				bugAgeCommits: existing.bugAgeCommits ?? result.bugAgeCommits,
				analysisMethod: `${existing.analysisMethod},${result.analysisMethod}`,
				notes: [existing.notes, result.notes].filter(Boolean).join("; "),
			}
			byCommit.set(result.causeSha, merged)
		}
	}

	// Sort by confidence descending
	return Array.from(byCommit.values()).sort((a, b) => b.confidence - a.confidence)
}

export { analyzeByBlame } from "./blame-method"
export { analyzeBySemantic } from "./semantic-method"
export { analyzeByTemporal } from "./temporal-method"
