import type { CausalityResult } from "../types"
import type { Commit } from "../db/schema"
import { getDb } from "../db/db"
import { commits } from "../db/schema"
import { and, lt, gt, desc } from "drizzle-orm"
import { extractKeywords } from "../git/parser"
import { extractSemanticKeywords } from "../classifiers/semantic"

export async function analyzeBySemantic(bugFix: Commit, maxAgeDays: number): Promise<CausalityResult[]> {
	const results: CausalityResult[] = []
	const db = getDb()

	// Extract keywords from the bug fix message
	const fixKeywords = new Set([...extractKeywords(bugFix.message), ...extractSemanticKeywords(bugFix.message)])

	if (fixKeywords.size === 0) {
		return results
	}

	// Get recent commits within the time window
	const cutoffDate = new Date(bugFix.date.getTime() - maxAgeDays * 24 * 60 * 60 * 1000)

	const recentCommits = await db.query.commits.findMany({
		where: and(lt(commits.date, bugFix.date), gt(commits.date, cutoffDate)),
		orderBy: desc(commits.date),
		limit: 200, // Limit to prevent scanning too many commits
		with: {
			fileChanges: true,
		},
	})

	for (const candidate of recentCommits) {
		// Skip the same commit
		if (candidate.sha === bugFix.sha) continue

		// Extract keywords from candidate
		const candidateKeywords = new Set([
			...extractKeywords(candidate.message),
			...extractSemanticKeywords(candidate.message),
		])

		// Calculate keyword overlap
		const intersection = new Set([...fixKeywords].filter((k) => candidateKeywords.has(k)))
		const union = new Set([...fixKeywords, ...candidateKeywords])

		if (intersection.size === 0) continue

		// Jaccard similarity
		const similarity = intersection.size / union.size

		// Check subsystem overlap
		let subsystemMatch = false
		if (candidate.fileChanges && candidate.fileChanges.length > 0) {
			const candidateSubsystems = new Set(candidate.fileChanges.map((fc) => fc.subsystem))
			// Get fix subsystem from scope if available
			if (bugFix.messageScope && candidateSubsystems.has(bugFix.messageScope)) {
				subsystemMatch = true
			}
		}

		// Calculate confidence
		let confidence = similarity * 0.5 // Base from keyword similarity

		if (subsystemMatch) {
			confidence += 0.15
		}

		// Boost for same scope
		if (bugFix.messageScope && candidate.messageScope === bugFix.messageScope) {
			confidence += 0.1
		}

		// Only include if confidence is meaningful
		if (confidence < 0.3) continue

		const ageInDays = (bugFix.date.getTime() - candidate.date.getTime()) / (24 * 60 * 60 * 1000)

		results.push({
			causeSha: candidate.sha,
			relationshipType: "related_to", // Semantic is lower confidence
			confidence: Math.min(confidence, 0.65),
			bugAge: Math.floor(ageInDays),
			analysisMethod: "semantic",
			notes: `Matched keywords: ${[...intersection].slice(0, 5).join(", ")}`,
		})
	}

	return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
}
