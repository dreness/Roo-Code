import type { CausalityResult } from "../types"
import type { Commit } from "../db/schema"
import { getDb } from "../db/db"
import { fileChanges } from "../db/schema"
import { and, eq, inArray } from "drizzle-orm"

// Time windows for temporal analysis
const TIME_WINDOWS = {
	immediate: 24, // hours - very suspicious
	recent: 72, // hours - suspicious
	moderate: 168, // hours (1 week) - possible
}

export async function analyzeByTemporal(bugFix: Commit, maxAgeDays: number): Promise<CausalityResult[]> {
	const results: CausalityResult[] = []
	const db = getDb()

	// Get files changed in the bug fix
	const fixFileChanges = await db.query.fileChanges.findMany({
		where: eq(fileChanges.commitSha, bugFix.sha),
	})

	if (fixFileChanges.length === 0) {
		return results
	}

	const fixFilePaths = fixFileChanges.map((fc) => fc.filePath)

	// Look for commits that touched the same files within the time window
	const cutoffDate = new Date(bugFix.date.getTime() - maxAgeDays * 24 * 60 * 60 * 1000)

	// Find commits that touched the same files
	const relatedFileChanges = await db.query.fileChanges.findMany({
		where: and(inArray(fileChanges.filePath, fixFilePaths)),
		with: {
			commit: true,
		},
	})

	// Group by commit
	const commitMap = new Map<string, { commit: Commit; fileOverlap: number }>()

	for (const fc of relatedFileChanges) {
		if (!fc.commit) continue
		if (fc.commit.sha === bugFix.sha) continue
		if (fc.commit.date >= bugFix.date) continue
		if (fc.commit.date < cutoffDate) continue

		const existing = commitMap.get(fc.commit.sha)
		if (existing) {
			existing.fileOverlap++
		} else {
			commitMap.set(fc.commit.sha, { commit: fc.commit, fileOverlap: 1 })
		}
	}

	for (const [sha, { commit, fileOverlap }] of commitMap) {
		const ageInHours = (bugFix.date.getTime() - commit.date.getTime()) / (60 * 60 * 1000)
		const ageInDays = ageInHours / 24

		// Calculate confidence based on temporal proximity
		let confidence = 0.3 // Base confidence

		if (ageInHours <= TIME_WINDOWS.immediate) {
			confidence += 0.25
		} else if (ageInHours <= TIME_WINDOWS.recent) {
			confidence += 0.15
		} else if (ageInHours <= TIME_WINDOWS.moderate) {
			confidence += 0.05
		}

		// Boost for file overlap
		const overlapRatio = fileOverlap / fixFilePaths.length
		confidence += overlapRatio * 0.2

		// Boost for same author (might be fixing own bug)
		if (commit.authorEmail === bugFix.authorEmail) {
			confidence += 0.1
		}

		// Skip low confidence results
		if (confidence < 0.35) continue

		results.push({
			causeSha: sha,
			relationshipType: "related_to",
			confidence: Math.min(confidence, 0.55), // Cap temporal confidence
			bugAge: Math.floor(ageInDays),
			analysisMethod: "temporal",
			notes: `${fileOverlap} file(s) overlap, ${Math.floor(ageInHours)}h before fix`,
		})
	}

	return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
}
