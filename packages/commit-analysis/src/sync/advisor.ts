import type { SyncRecommendation } from "../types"
import { getDb } from "../db/db"
import { getCommits } from "../db/queries/commits"
import { getClassificationsByCommits } from "../db/queries/classifications"
import { getCommitsBetween, resolveRef } from "../git/extractor"
import { aggregateRisk } from "../scoring/risk"

export interface SyncAdvisorOptions {
	upstream: string // e.g., "origin/main"
	local: string // e.g., "HEAD" or a tag
	maxRisk: number // Maximum acceptable aggregate risk
	repoPath?: string
}

export async function analyzeSyncRange(options: SyncAdvisorOptions): Promise<SyncRecommendation> {
	const db = getDb()

	// Resolve refs to SHAs
	const upstreamSha = await resolveRef(options.upstream, options.repoPath)
	const localSha = await resolveRef(options.local, options.repoPath)

	// Get commits between local and upstream
	const commitShas = await getCommitsBetween(localSha, upstreamSha, options.repoPath)

	if (commitShas.length === 0) {
		return {
			recommendedCommit: upstreamSha,
			totalRisk: 0,
			commitCount: 0,
			breakdown: { features: 0, fixes: 0, other: 0 },
			warnings: [],
			safeToSync: true,
		}
	}

	// Get classifications for these commits
	const classifications = await getClassificationsByCommits(commitShas, db)
	const classificationMap = new Map(classifications.map((c) => [c.commitSha, c]))

	// Get commit details
	const commitDetails = await getCommits({}, db)
	const commitMap = new Map(commitDetails.map((c) => [c.sha, c]))

	// Analyze commits
	const riskScores: number[] = []
	let features = 0
	let fixes = 0
	let other = 0
	const warnings: string[] = []

	for (const sha of commitShas) {
		const commit = commitMap.get(sha)
		const classification = classificationMap.get(sha)

		if (!commit) continue

		const riskScore = classification?.riskScore ?? 25 // Default moderate risk for unanalyzed
		riskScores.push(riskScore)

		// Count by type
		if (commit.messageType === "feat") features++
		else if (commit.messageType === "fix") fixes++
		else other++

		// Check for high-risk commits
		if (riskScore >= 70) {
			warnings.push(`High risk: ${commit.shortSha} - ${commit.message.slice(0, 50)}`)
		}
	}

	const totalRisk = aggregateRisk(riskScores)
	const safeToSync = totalRisk <= options.maxRisk

	// Find recommended sync point if not safe
	let recommendedCommit = upstreamSha

	if (!safeToSync) {
		// Find the latest commit where cumulative risk is acceptable
		const riskScoresReversed = [...riskScores].reverse()
		const commitsReversed = [...commitShas].reverse()

		for (let i = 0; i < commitsReversed.length; i++) {
			const newRisk = aggregateRisk([...riskScoresReversed.slice(0, i + 1)])
			if (newRisk > options.maxRisk) {
				const prevCommit = i > 0 ? commitsReversed[i - 1] : undefined
				if (prevCommit) {
					recommendedCommit = prevCommit
				}
				break
			}
		}

		warnings.unshift(`Total risk (${totalRisk.toFixed(1)}) exceeds threshold (${options.maxRisk})`)
	}

	return {
		recommendedCommit,
		totalRisk,
		commitCount: commitShas.length,
		breakdown: { features, fixes, other },
		warnings,
		safeToSync,
	}
}

export async function getSyncSummary(
	upstream: string,
	local: string,
	repoPath?: string,
): Promise<{
	behind: number
	ahead: number
	lastSyncDate?: Date
}> {
	const db = getDb()

	// Get commits we're behind
	const upstreamSha = await resolveRef(upstream, repoPath)
	const localSha = await resolveRef(local, repoPath)

	const behind = await getCommitsBetween(localSha, upstreamSha, repoPath)

	// Get commits we're ahead (local changes not in upstream)
	let ahead: string[] = []
	try {
		ahead = await getCommitsBetween(upstreamSha, localSha, repoPath)
	} catch {
		// Might fail if local is behind upstream
	}

	// Get the date of the local commit
	const localCommit = await getCommits({ limit: 1 }, db)
	const lastSyncDate = localCommit[0]?.date

	return {
		behind: behind.length,
		ahead: ahead.length,
		lastSyncDate,
	}
}
