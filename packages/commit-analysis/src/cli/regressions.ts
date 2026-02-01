import { command, option, string, number } from "cmd-ts"
import type { SeverityLevel } from "../db/schema"

export const regressionsCommand = command({
	name: "regressions",
	description: "Show detected regression patterns",
	args: {
		subsystem: option({
			type: string,
			long: "subsystem",
			short: "s",
			description: "Filter by subsystem",
			defaultValue: () => "",
		}),
		minOccurrences: option({
			type: number,
			long: "min",
			short: "m",
			description: "Minimum occurrences to show",
			defaultValue: () => 2,
		}),
		severity: option({
			type: string,
			long: "severity",
			description: "Filter by severity (low, medium, high)",
			defaultValue: () => "",
		}),
		limit: option({
			type: number,
			long: "limit",
			short: "l",
			description: "Maximum patterns to show",
			defaultValue: () => 20,
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const [{ getDb }, { getRegressionPatterns, getPatternStats }, { getCommitBySha }] = await Promise.all([
			import("../db/db"),
			import("../db/queries/patterns"),
			import("../db/queries/commits"),
		])

		const db = getDb()

		// Get pattern stats first
		const stats = await getPatternStats(db)
		console.log("Regression Pattern Summary")
		console.log("==========================")
		console.log(`Total patterns: ${stats.total}`)
		console.log(`Active: ${stats.active}`)
		console.log("")

		if (stats.bySeverity.length > 0) {
			console.log("By Severity:")
			for (const { severity, count } of stats.bySeverity) {
				console.log(`  ${severity}: ${count}`)
			}
			console.log("")
		}

		if (stats.bySubsystem.length > 0) {
			console.log("By Subsystem:")
			for (const { subsystem, count, totalOccurrences } of stats.bySubsystem) {
				console.log(`  ${subsystem || "unknown"}: ${count} patterns, ${totalOccurrences} occurrences`)
			}
			console.log("")
		}

		// Get filtered patterns
		const patterns = await getRegressionPatterns(
			{
				subsystem: args.subsystem || undefined,
				severity: (args.severity as SeverityLevel) || undefined,
				minOccurrences: args.minOccurrences,
				limit: args.limit,
			},
			db,
		)

		if (patterns.length === 0) {
			console.log("No patterns found matching criteria")
			return
		}

		console.log(`\nRecurring Patterns (${patterns.length})`)
		console.log("=".repeat(50))

		for (const pattern of patterns) {
			console.log("")
			console.log(`[${pattern.severity?.toUpperCase()}] ${pattern.subsystem}`)
			console.log(`  Occurrences: ${pattern.occurrenceCount}`)
			console.log(`  Keywords: ${(pattern.keywords || []).join(", ")}`)
			console.log(`  Files: ${(pattern.filePatterns || []).join(", ")}`)

			// Show first occurrence
			if (pattern.firstOccurrence) {
				const firstCommit = await getCommitBySha(pattern.firstOccurrence, db)
				if (firstCommit) {
					console.log(`  First seen: ${firstCommit.shortSha} - ${firstCommit.message.slice(0, 50)}...`)
				}
			}

			// Show latest commits
			const shas = pattern.commitShas || []
			if (shas.length > 0) {
				console.log(`  Recent commits:`)
				for (const sha of shas.slice(-3)) {
					const commit = await getCommitBySha(sha, db)
					if (commit) {
						console.log(`    - ${commit.shortSha}: ${commit.message.slice(0, 40)}...`)
					}
				}
			}
		}
	},
})
