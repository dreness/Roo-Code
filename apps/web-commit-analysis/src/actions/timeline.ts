"use server"

import {
	getReleases,
	getCommits,
	getClassifications,
	getCategoryDistribution,
	type Release,
	type Commit,
	type Classification,
} from "@roo-code/commit-analysis"

export interface ReleaseWithCommits {
	release: Release
	commits: (Commit & { classification?: Classification | null })[]
}

export async function getTimelineData(): Promise<ReleaseWithCommits[]> {
	try {
		const releases = await getReleases({ limit: 20 })
		const commits = await getCommits({ limit: 500 })

		// Group commits by release
		const result: ReleaseWithCommits[] = []

		for (let i = 0; i < releases.length; i++) {
			const release = releases[i]
			const nextRelease = releases[i + 1]

			// Skip if release is undefined
			if (!release) continue

			// Get commits between this release and the next one
			const releaseCommits = commits.filter((c) => {
				if (nextRelease) {
					return c.date <= release.date && c.date > nextRelease.date
				}
				return c.date <= release.date
			})

			result.push({
				release,
				commits: releaseCommits.slice(0, 50), // Limit commits per release
			})
		}

		return result
	} catch (error) {
		console.error("Error fetching timeline data:", error)
		return []
	}
}

export async function getCommitDetails(sha: string) {
	try {
		const commits = await getCommits({ limit: 1 })
		const commit = commits.find((c) => c.sha === sha || c.shortSha === sha)
		return commit || null
	} catch (error) {
		console.error("Error fetching commit details:", error)
		return null
	}
}

export async function getDashboardStats() {
	try {
		const commits = await getCommits({})
		const classifications = await getClassifications({})
		const distribution = await getCategoryDistribution()

		const totalCommits = commits.length
		const totalClassified = classifications.length
		const avgRisk = classifications.reduce((sum, c) => sum + c.riskScore, 0) / (classifications.length || 1)

		return {
			totalCommits,
			totalClassified,
			avgRisk,
			distribution,
		}
	} catch (error) {
		console.error("Error fetching dashboard stats:", error)
		return {
			totalCommits: 0,
			totalClassified: 0,
			avgRisk: 0,
			distribution: [],
		}
	}
}

export async function getHighRiskCommits(threshold: number = 50) {
	try {
		return await getClassifications({ minRisk: threshold, limit: 20 })
	} catch (error) {
		console.error("Error fetching high risk commits:", error)
		return []
	}
}
