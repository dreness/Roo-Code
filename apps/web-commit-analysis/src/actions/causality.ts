"use server"

import { getCausesForBugFix, getBugsCausedBy, getCausalityStats } from "@roo-code/commit-analysis"

export async function getCausalityData(sha: string) {
	try {
		const [causes, causedBugs] = await Promise.all([getCausesForBugFix(sha), getBugsCausedBy(sha)])

		return { causes, causedBugs }
	} catch (error) {
		console.error("Error fetching causality data:", error)
		return { causes: [], causedBugs: [] }
	}
}

export async function getCausalityOverview() {
	try {
		return await getCausalityStats()
	} catch (error) {
		console.error("Error fetching causality overview:", error)
		return null
	}
}
