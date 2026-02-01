"use server"

import { analyzeSyncRange, getSyncSummary } from "@roo-code/commit-analysis"

export async function getSyncData(upstream: string, local: string, maxRisk: number) {
	try {
		const [summary, recommendation] = await Promise.all([
			getSyncSummary(upstream, local),
			analyzeSyncRange({ upstream, local, maxRisk }),
		])

		return { summary, recommendation }
	} catch (error) {
		console.error("Error fetching sync data:", error)
		return { summary: null, recommendation: null }
	}
}
