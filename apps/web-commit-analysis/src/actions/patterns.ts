"use server"

import { getRegressionPatterns, getPatternStats } from "@roo-code/commit-analysis"

export async function getPatternsData() {
	try {
		const [patterns, stats] = await Promise.all([
			getRegressionPatterns({ minOccurrences: 2, limit: 50 }),
			getPatternStats(),
		])

		return { patterns, stats }
	} catch (error) {
		console.error("Error fetching patterns data:", error)
		return { patterns: [], stats: null }
	}
}

export async function getActivePatterns() {
	try {
		return await getRegressionPatterns({ status: "active", minOccurrences: 2 })
	} catch (error) {
		console.error("Error fetching active patterns:", error)
		return []
	}
}
