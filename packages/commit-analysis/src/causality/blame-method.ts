import type { CausalityResult } from "../types"
import type { Commit } from "../db/schema"
import { getDb } from "../db/db"
import { getUniqueBlameShas } from "../git/blame"
import { extractFileChanges } from "../git/extractor"
import { getCommit } from "../db/queries/commits"

export async function analyzeByBlame(
	bugFix: Commit,
	maxAgeDays: number,
	repoPath?: string,
): Promise<CausalityResult[]> {
	const results: CausalityResult[] = []
	const db = getDb()

	// Get file changes for this bug fix
	const fileChanges = await extractFileChanges(bugFix.sha, repoPath)

	if (fileChanges.length === 0) {
		return results
	}

	// Get the parent commit SHA to blame against
	const parentRef = `${bugFix.sha}^`

	// Collect all commits that touched the fixed files
	const blameShas = new Set<string>()

	for (const change of fileChanges) {
		// Skip deleted files (can't blame them)
		if (change.changeType === "D") continue

		// Skip new files (nothing to blame)
		if (change.changeType === "A") continue

		try {
			const shas = await getUniqueBlameShas(change.filePath, {
				ref: parentRef,
				repoPath,
			})

			for (const sha of shas) {
				// Skip the bug fix commit itself
				if (sha !== bugFix.sha) {
					blameShas.add(sha)
				}
			}
		} catch {
			// File might not exist at parent ref
			continue
		}
	}

	// Score each blamed commit
	const cutoffDate = new Date(bugFix.date.getTime() - maxAgeDays * 24 * 60 * 60 * 1000)

	for (const sha of blameShas) {
		const causeCommit = await getCommit(sha, db)

		if (!causeCommit) continue

		// Skip commits outside our time window
		if (causeCommit.date < cutoffDate) continue

		// Calculate confidence based on various factors
		let confidence = 0.6 // Base confidence for blame

		// Higher confidence if same author
		if (causeCommit.authorEmail === bugFix.authorEmail) {
			confidence += 0.1
		}

		// Higher confidence if recent commit
		const ageInDays = (bugFix.date.getTime() - causeCommit.date.getTime()) / (24 * 60 * 60 * 1000)
		if (ageInDays < 7) {
			confidence += 0.15
		} else if (ageInDays < 30) {
			confidence += 0.05
		}

		// Calculate bug age
		const bugAge = Math.floor(ageInDays)

		results.push({
			causeSha: sha,
			relationshipType: confidence >= 0.7 ? "root_cause" : "related_to",
			confidence: Math.min(confidence, 0.85),
			bugAge,
			analysisMethod: "blame",
			notes: `Blamed commit touched ${fileChanges.length} file(s)`,
		})
	}

	// Sort by confidence and return top results
	return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
}
