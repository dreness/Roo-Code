import { command, option, string, number } from "cmd-ts"
import type { RejectionReasonAnalysis, KeywordFrequency } from "../db/queries/analytics"

// ============================================================================
// Visualization Helpers
// ============================================================================

function renderReasonTable(analysis: RejectionReasonAnalysis, limit: number): string[] {
	const lines: string[] = []

	lines.push("╔══════════════════════════════════════════════════════════════════════════════╗")
	lines.push("║                     REJECTION REASON ANALYSIS                                ║")
	lines.push("╠══════════════════════════════════════════════════════════════════════════════╣")
	lines.push("")

	// Summary
	lines.push(`  Total rejections analyzed: ${analysis.totalRejections}`)
	lines.push(`  Unique reason categories: ${analysis.reasons.length}`)
	lines.push("")

	// Top reasons table
	lines.push("  Top Rejection Reasons:")
	lines.push("  ─────────────────────────────────────────────────────────────────────────────")
	lines.push("  " + "Reason".padEnd(30) + "Count".padStart(8) + "Percentage".padStart(12) + "  Bar")
	lines.push("  " + "─".repeat(74))

	const maxCount = Math.max(...analysis.reasons.map((r) => r.count), 1)
	const displayReasons = analysis.reasons.slice(0, limit)

	for (const reason of displayReasons) {
		const barLength = Math.round((reason.count / maxCount) * 20)
		const bar = "█".repeat(barLength)
		const percentage = `${reason.percentage.toFixed(1)}%`

		lines.push(
			"  " +
				truncate(reason.reason, 30).padEnd(30) +
				reason.count.toString().padStart(8) +
				percentage.padStart(12) +
				"  " +
				bar,
		)
	}

	if (analysis.reasons.length > limit) {
		lines.push(`  ... and ${analysis.reasons.length - limit} more reasons`)
	}

	lines.push("")

	return lines
}

function renderKeywordsTable(keywords: KeywordFrequency[]): string[] {
	const lines: string[] = []

	lines.push("  Top Keywords in Rejection Reasons:")
	lines.push("  ─────────────────────────────────────────────────────────────────────────────")

	if (keywords.length === 0) {
		lines.push("  No keywords extracted (not enough data)")
		lines.push("")
		return lines
	}

	lines.push("  " + "Keyword".padEnd(20) + "Count".padStart(8) + "Percentage".padStart(12))
	lines.push("  " + "─".repeat(40))

	const maxCount = Math.max(...keywords.map((k) => k.count), 1)

	for (const keyword of keywords.slice(0, 10)) {
		const barLength = Math.round((keyword.count / maxCount) * 15)
		const bar = "░".repeat(barLength)
		const percentage = `${keyword.percentage.toFixed(1)}%`

		lines.push(
			"  " +
				keyword.keyword.padEnd(20) +
				keyword.count.toString().padStart(8) +
				percentage.padStart(12) +
				"  " +
				bar,
		)
	}

	lines.push("")

	return lines
}

function renderExamples(analysis: RejectionReasonAnalysis): string[] {
	const lines: string[] = []

	lines.push("  Example Rejections by Category:")
	lines.push("  ─────────────────────────────────────────────────────────────────────────────")

	// Show examples for top 3 reasons
	const topReasons = analysis.reasons.slice(0, 3)

	for (const reason of topReasons) {
		lines.push("")
		lines.push(`  📋 ${reason.reason} (${reason.count} occurrences)`)
		lines.push("  " + "·".repeat(60))

		for (const example of reason.examples.slice(0, 2)) {
			lines.push(`     Investigation #${example.investigationId}`)
			lines.push(`     Bug fix: ${example.bugFixSha.slice(0, 7)}`)
			lines.push(`     Rejected: ${example.candidateSha.slice(0, 7)}`)
			if (example.candidateMessage) {
				lines.push(`     Commit: "${truncate(example.candidateMessage, 50)}"`)
			}
			if (example.reasoning) {
				lines.push(`     Reasoning: "${truncate(example.reasoning, 50)}"`)
			}
			lines.push("")
		}
	}

	return lines
}

function renderSuggestions(suggestions: string[]): string[] {
	const lines: string[] = []

	lines.push("  Suggestions for Improvement:")
	lines.push("  ─────────────────────────────────────────────────────────────────────────────")

	if (suggestions.length === 0) {
		lines.push("  ✅ No specific improvements suggested based on current patterns.")
		lines.push("")
		return lines
	}

	for (const suggestion of suggestions) {
		lines.push(`  💡 ${suggestion}`)
	}

	lines.push("")

	return lines
}

function truncate(str: string, maxLength: number): string {
	if (str.length <= maxLength) return str
	return str.slice(0, maxLength - 3) + "..."
}

// ============================================================================
// Patterns Command
// ============================================================================

export const patternsCommand = command({
	name: "patterns",
	description: "Analyze rejection reasons to find common patterns for improving automation",
	args: {
		since: option({
			type: string,
			long: "since",
			short: "s",
			description: "Analyze data since date (YYYY-MM-DD)",
			defaultValue: () => "",
		}),
		until: option({
			type: string,
			long: "until",
			short: "u",
			description: "Analyze data until date (YYYY-MM-DD)",
			defaultValue: () => "",
		}),
		limit: option({
			type: number,
			long: "limit",
			short: "l",
			description: "Number of top reasons to display",
			defaultValue: () => 10,
		}),
		format: option({
			type: string,
			long: "format",
			short: "f",
			description: "Output format: table or json",
			defaultValue: () => "table",
		}),
		examples: option({
			type: string,
			long: "examples",
			short: "e",
			description: "Show examples: yes or no",
			defaultValue: () => "yes",
		}),
	},
	handler: async (args) => {
		const [{ getDb }, analyticsModule] = await Promise.all([import("../db/db"), import("../db/queries/analytics")])

		const { getRejectionReasons, getVerificationMetrics } = analyticsModule
		const db = getDb()

		// Parse date filters
		const since = args.since ? new Date(args.since) : undefined
		const until = args.until ? new Date(args.until) : undefined

		console.log("Analyzing rejection patterns...")
		console.log("")

		const [analysis, metrics] = await Promise.all([
			getRejectionReasons({ since, until }, db),
			getVerificationMetrics({ since, until }, db),
		])

		if (analysis.totalRejections === 0) {
			console.log("No rejection data available.")
			console.log("")
			console.log("To generate rejection data:")
			console.log("  1. Run 'pnpm cli investigate --commit <sha>' to start investigations")
			console.log("  2. Examine candidate commits and reject non-causal ones")
			console.log("  3. Provide rejection reasons when prompted")
			console.log("")
			console.log("Rejection reasons help identify where automation needs improvement.")
			return
		}

		const format = args.format.toLowerCase()

		if (format === "json") {
			console.log(
				JSON.stringify(
					{
						analysis,
						metrics: {
							total: metrics.overall.totalCausalityRecords,
							verified: metrics.overall.humanVerifiedCount,
							accuracy: metrics.overall.accuracyRate,
						},
					},
					null,
					2,
				),
			)
			return
		}

		// Table format
		const reasonLines = renderReasonTable(analysis, args.limit)
		for (const line of reasonLines) {
			console.log(line)
		}

		const keywordLines = renderKeywordsTable(analysis.topKeywords)
		for (const line of keywordLines) {
			console.log(line)
		}

		if (args.examples.toLowerCase() === "yes" && analysis.reasons.length > 0) {
			const exampleLines = renderExamples(analysis)
			for (const line of exampleLines) {
				console.log(line)
			}
		}

		const suggestionLines = renderSuggestions(analysis.suggestions)
		for (const line of suggestionLines) {
			console.log(line)
		}

		// Context from verification metrics
		console.log("  Context (Verification Metrics):")
		console.log("  ─────────────────────────────────────────────────────────────────────────────")
		console.log(`  Total causality records:    ${metrics.overall.totalCausalityRecords}`)
		console.log(`  Human verified:             ${metrics.overall.humanVerifiedCount}`)
		console.log(`  Automation accuracy:        ${(metrics.overall.accuracyRate * 100).toFixed(1)}%`)

		if (metrics.byMethod.length > 0) {
			console.log("")
			console.log("  Accuracy by Analysis Method:")
			for (const method of metrics.byMethod.slice(0, 5)) {
				const accuracy = method.verifiedCount > 0 ? method.accuracyRate : null
				const accuracyStr = accuracy !== null ? `${(accuracy * 100).toFixed(1)}%` : "N/A"
				console.log(
					`    ${method.method?.padEnd(20) ?? "unknown".padEnd(20)}: ${accuracyStr} (${method.correctCount}/${method.verifiedCount} verified)`,
				)
			}
		}

		console.log("")
		console.log("╚══════════════════════════════════════════════════════════════════════════════╝")

		// Actionable summary
		console.log("")
		console.log("Actionable Summary:")
		console.log("─".repeat(60))

		if (analysis.reasons.length > 0) {
			const topReason = analysis.reasons[0]!
			console.log(
				`• Most common rejection: "${topReason.reason}" (${topReason.percentage.toFixed(1)}% of rejections)`,
			)
		}

		if (analysis.topKeywords.length > 0) {
			const topKeyword = analysis.topKeywords[0]!
			console.log(`• Most frequent keyword: "${topKeyword.keyword}" (${topKeyword.count} occurrences)`)
		}

		if (metrics.overall.accuracyRate < 0.7) {
			console.log("• ⚠️  Automation accuracy is below 70% - significant improvement needed")
		} else if (metrics.overall.accuracyRate < 0.85) {
			console.log("• ⚡ Automation accuracy is moderate (70-85%) - room for improvement")
		} else {
			console.log("• ✅ Automation accuracy is good (>85%)")
		}

		console.log("")
		console.log("Use 'pnpm cli calibration' to see confidence calibration details.")
	},
})
