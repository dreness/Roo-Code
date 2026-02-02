import { command, option, string, flag } from "cmd-ts"

export const feedbackCommand = command({
	name: "feedback",
	description: "Display automation accuracy statistics from human feedback",
	args: {
		stats: flag({
			long: "stats",
			short: "s",
			description: "Show automation accuracy statistics",
			defaultValue: () => true,
		}),
		from: option({
			type: string,
			long: "from",
			description: "Filter from date (YYYY-MM-DD)",
			defaultValue: () => "",
		}),
		to: option({
			type: string,
			long: "to",
			description: "Filter to date (YYYY-MM-DD)",
			defaultValue: () => "",
		}),
		type: option({
			type: string,
			long: "type",
			short: "t",
			description: "Filter by relationship type (root_cause, related_to)",
			defaultValue: () => "",
		}),
		method: option({
			type: string,
			long: "method",
			short: "m",
			description: "Filter by analysis method (explicit, blame, semantic, temporal)",
			defaultValue: () => "",
		}),
		json: flag({
			long: "json",
			description: "Output as JSON",
			defaultValue: () => false,
		}),
		verbose: flag({
			long: "verbose",
			short: "v",
			description: "Show detailed breakdown",
			defaultValue: () => false,
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const [{ getDb }, causalityModule] = await Promise.all([import("../db/db"), import("../db/queries/causality")])

		const { getAutomationAccuracy, getCausalityStats } = causalityModule

		const db = getDb()

		// Build filters
		const filters: {
			dateFrom?: Date
			dateTo?: Date
			relationshipType?: "root_cause" | "related_to"
			analysisMethod?: string
		} = {}

		if (args.from) {
			const fromDate = new Date(args.from)
			if (!isNaN(fromDate.getTime())) {
				filters.dateFrom = fromDate
			} else {
				console.error(`Error: Invalid --from date format: ${args.from}`)
				console.log("Use YYYY-MM-DD format")
				process.exit(1)
			}
		}

		if (args.to) {
			const toDate = new Date(args.to)
			if (!isNaN(toDate.getTime())) {
				filters.dateTo = toDate
			} else {
				console.error(`Error: Invalid --to date format: ${args.to}`)
				console.log("Use YYYY-MM-DD format")
				process.exit(1)
			}
		}

		if (args.type) {
			if (args.type === "root_cause" || args.type === "related_to") {
				filters.relationshipType = args.type
			} else {
				console.error(`Error: Invalid --type value: ${args.type}`)
				console.log("Valid values: root_cause, related_to")
				process.exit(1)
			}
		}

		if (args.method) {
			filters.analysisMethod = args.method
		}

		// Get accuracy statistics
		const accuracy = await getAutomationAccuracy(filters, db)

		// Get general causality stats for context
		const generalStats = await getCausalityStats(db)

		// Output as JSON if requested
		if (args.json) {
			const output = {
				filters: {
					dateFrom: filters.dateFrom?.toISOString() ?? null,
					dateTo: filters.dateTo?.toISOString() ?? null,
					relationshipType: filters.relationshipType ?? null,
					analysisMethod: filters.analysisMethod ?? null,
				},
				accuracy: {
					totalVerified: accuracy.totalVerified,
					totalCorrect: accuracy.totalCorrect,
					accuracyRate: accuracy.accuracyRate,
					accuracyPercent: (accuracy.accuracyRate * 100).toFixed(1),
					avgConfidenceDelta: accuracy.avgConfidenceDelta,
				},
				general: {
					totalLinks: generalStats.totalLinks,
					rootCauses: generalStats.rootCauses,
					verified: generalStats.verified,
					avgBugAgeDays: generalStats.avgBugAgeDays,
				},
			}
			console.log(JSON.stringify(output, null, 2))
			return
		}

		// Display formatted output
		console.log("")
		console.log("╔══════════════════════════════════════════════════════════════╗")
		console.log("║            AUTOMATION ACCURACY STATISTICS                    ║")
		console.log("╚══════════════════════════════════════════════════════════════╝")
		console.log("")

		// Show active filters
		const activeFilters: string[] = []
		if (filters.dateFrom) activeFilters.push(`from ${filters.dateFrom.toLocaleDateString()}`)
		if (filters.dateTo) activeFilters.push(`to ${filters.dateTo.toLocaleDateString()}`)
		if (filters.relationshipType) activeFilters.push(`type: ${filters.relationshipType}`)
		if (filters.analysisMethod) activeFilters.push(`method: ${filters.analysisMethod}`)

		if (activeFilters.length > 0) {
			console.log("Active Filters: " + activeFilters.join(", "))
			console.log("")
		}

		// Main accuracy stats
		console.log("📊 HUMAN VERIFICATION RESULTS")
		console.log("─".repeat(50))

		if (accuracy.totalVerified === 0) {
			console.log("  No human-verified causality records found.")
			console.log("")
			console.log("  Use 'pnpm cli verify --commit <sha>' to verify causality")
			console.log("  or 'pnpm cli investigate --commit <sha>' for full investigation")
		} else {
			console.log(`  Total Verified:     ${accuracy.totalVerified}`)
			console.log(`  Total Correct:      ${accuracy.totalCorrect}`)
			console.log(`  Total Incorrect:    ${accuracy.totalVerified - accuracy.totalCorrect}`)
			console.log("")

			// Accuracy rate with visual bar
			const accuracyPercent = accuracy.accuracyRate * 100
			const barLength = 20
			const filledLength = Math.round((accuracyPercent / 100) * barLength)
			const emptyLength = barLength - filledLength
			const bar = "█".repeat(filledLength) + "░".repeat(emptyLength)

			console.log(`  Accuracy Rate:      ${bar} ${accuracyPercent.toFixed(1)}%`)
			console.log("")

			// Confidence delta
			if (accuracy.avgConfidenceDelta !== 0) {
				const deltaSign = accuracy.avgConfidenceDelta > 0 ? "+" : ""
				const deltaPercent = accuracy.avgConfidenceDelta * 100
				console.log(`  Avg Confidence Delta: ${deltaSign}${deltaPercent.toFixed(1)}% (human vs automation)`)

				if (accuracy.avgConfidenceDelta > 0) {
					console.log("  → Humans are more confident than automation on average")
				} else if (accuracy.avgConfidenceDelta < -0.1) {
					console.log("  → Automation is more confident than humans on average")
				} else {
					console.log("  → Confidence levels are similar")
				}
			}
		}

		console.log("")

		// General stats for context
		console.log("📈 OVERALL CAUSALITY STATUS")
		console.log("─".repeat(50))
		console.log(`  Total Causal Links:     ${generalStats.totalLinks}`)
		console.log(`  Root Causes:            ${generalStats.rootCauses}`)
		console.log(`  Verified (any method):  ${generalStats.verified}`)
		console.log(`  Avg Bug Age:            ${generalStats.avgBugAgeDays.toFixed(1)} days`)

		if (generalStats.totalLinks > 0 && accuracy.totalVerified > 0) {
			const verificationCoverage = (accuracy.totalVerified / generalStats.totalLinks) * 100
			console.log(`  Verification Coverage:  ${verificationCoverage.toFixed(1)}%`)
		}

		console.log("")

		// Verbose breakdown by method
		if (args.verbose && accuracy.totalVerified > 0) {
			console.log("📋 BREAKDOWN BY ANALYSIS METHOD")
			console.log("─".repeat(50))

			// Get accuracy for each method
			const methods = ["explicit", "blame", "semantic", "temporal", "human_verified"]

			for (const method of methods) {
				const methodAccuracy = await getAutomationAccuracy({ ...filters, analysisMethod: method }, db)

				if (methodAccuracy.totalVerified > 0) {
					const methodPercent = methodAccuracy.accuracyRate * 100
					const bar =
						"█".repeat(Math.round(methodPercent / 5)) + "░".repeat(20 - Math.round(methodPercent / 5))
					console.log(
						`  ${method.padEnd(15)} ${bar} ${methodPercent.toFixed(0)}% (${methodAccuracy.totalCorrect}/${methodAccuracy.totalVerified})`,
					)
				}
			}

			console.log("")
		}

		// Recommendations
		if (accuracy.totalVerified > 0 && accuracy.accuracyRate < 0.7) {
			console.log("💡 RECOMMENDATIONS")
			console.log("─".repeat(50))
			console.log("  Accuracy is below 70%. Consider:")
			console.log("  • Reviewing low-confidence causality records")
			console.log("  • Adjusting analysis method parameters")
			console.log("  • Using 'pnpm cli investigate' for complex cases")
			console.log("")
		}

		console.log("═".repeat(50))
	},
})
