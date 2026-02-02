import { command, option, string } from "cmd-ts"
import type { ConfidenceCalibrationData, ConfidenceCalibrationBin } from "../db/queries/analytics"

// ============================================================================
// ASCII Visualization Helpers
// ============================================================================

function renderCalibrationChart(bins: ConfidenceCalibrationBin[], width: number = 40): string[] {
	const lines: string[] = []

	lines.push("Calibration Chart (Automated vs Human Confidence)")
	lines.push("─".repeat(60))
	lines.push("")

	// Find max for scaling
	const maxCount = Math.max(...bins.map((b) => b.count), 1)

	for (const bin of bins) {
		const label = bin.label.padStart(10)
		const barLength = Math.round((bin.count / maxCount) * width)
		const bar = "█".repeat(barLength)
		const countStr = `(${bin.count})`

		// Color indicators for delta
		let deltaIndicator = ""
		if (bin.count >= 3) {
			if (bin.delta > 0.1) {
				deltaIndicator = " ↑ underconfident"
			} else if (bin.delta < -0.1) {
				deltaIndicator = " ↓ overconfident"
			} else {
				deltaIndicator = " ≈ well-calibrated"
			}
		}

		lines.push(`${label} │${bar} ${countStr}${deltaIndicator}`)
	}

	lines.push("")
	return lines
}

function renderAccuracyChart(bins: ConfidenceCalibrationBin[], width: number = 40): string[] {
	const lines: string[] = []

	lines.push("Accuracy by Confidence Bin")
	lines.push("─".repeat(60))
	lines.push("")
	lines.push("         Expected   Actual    Delta")
	lines.push("─".repeat(60))

	for (const bin of bins) {
		if (bin.count === 0) {
			lines.push(`${bin.label.padStart(10)} │ (no data)`)
			continue
		}

		const expected = (bin.avgAutomatedConfidence * 100).toFixed(0).padStart(6) + "%"
		const actual = (bin.accuracyRate * 100).toFixed(0).padStart(6) + "%"

		const delta = bin.accuracyRate - bin.avgAutomatedConfidence
		let deltaStr: string
		if (delta > 0.05) {
			deltaStr = `+${(delta * 100).toFixed(0)}% (good)`
		} else if (delta < -0.05) {
			deltaStr = `${(delta * 100).toFixed(0)}% (bad)`
		} else {
			deltaStr = `${(delta * 100).toFixed(0)}% (ok)`
		}

		// Visual bar showing actual vs expected
		const expectedPos = Math.round(bin.avgAutomatedConfidence * width)
		const actualPos = Math.round(bin.accuracyRate * width)

		let visualBar = ""
		for (let i = 0; i <= width; i++) {
			if (i === expectedPos && i === actualPos) {
				visualBar += "●" // Both at same position
			} else if (i === expectedPos) {
				visualBar += "○" // Expected
			} else if (i === actualPos) {
				visualBar += "●" // Actual
			} else if (i % 10 === 0) {
				visualBar += "┼"
			} else {
				visualBar += "─"
			}
		}

		lines.push(`${bin.label.padStart(10)} │ ${expected}  ${actual}  ${deltaStr}`)
		lines.push(`           │ ${visualBar}`)
		lines.push(`           │ ○=expected ●=actual`)
		lines.push("")
	}

	return lines
}

function renderTable(data: ConfidenceCalibrationData): string[] {
	const lines: string[] = []

	lines.push("╔══════════════════════════════════════════════════════════════════════════════╗")
	lines.push("║                     CONFIDENCE CALIBRATION REPORT                            ║")
	lines.push("╠══════════════════════════════════════════════════════════════════════════════╣")
	lines.push("")

	// Overall metrics
	lines.push("  Overall Metrics:")
	lines.push("  ─────────────────────────────────────────────────────────────────────────────")
	lines.push(`  Total samples:              ${data.overall.totalSamples}`)
	lines.push(`  Average automated conf:     ${(data.overall.avgAutomatedConfidence * 100).toFixed(1)}%`)
	lines.push(`  Average human conf:         ${(data.overall.avgHumanConfidence * 100).toFixed(1)}%`)
	lines.push(`  Confidence delta:           ${(data.overall.avgDelta * 100).toFixed(1)}%`)
	lines.push(`  Overall accuracy:           ${(data.overall.overallAccuracy * 100).toFixed(1)}%`)
	lines.push(`  Calibration score:          ${data.overall.calibrationScore.toFixed(3)} (lower is better)`)
	lines.push("")

	// Bin table
	lines.push("  Detailed Breakdown by Confidence Bin:")
	lines.push("  ─────────────────────────────────────────────────────────────────────────────")
	lines.push(
		"  " +
			"Bin".padEnd(12) +
			"Count".padStart(8) +
			"Auto Conf".padStart(12) +
			"Human Conf".padStart(12) +
			"Delta".padStart(10) +
			"Accuracy".padStart(10) +
			"Correct".padStart(10),
	)
	lines.push("  " + "─".repeat(74))

	for (const bin of data.bins) {
		const row = [
			bin.label.padEnd(12),
			bin.count.toString().padStart(8),
			bin.count > 0 ? `${(bin.avgAutomatedConfidence * 100).toFixed(1)}%`.padStart(12) : "N/A".padStart(12),
			bin.count > 0 ? `${(bin.avgHumanConfidence * 100).toFixed(1)}%`.padStart(12) : "N/A".padStart(12),
			bin.count > 0 ? `${(bin.delta * 100).toFixed(1)}%`.padStart(10) : "N/A".padStart(10),
			bin.count > 0 ? `${(bin.accuracyRate * 100).toFixed(1)}%`.padStart(10) : "N/A".padStart(10),
			`${bin.correctCount}/${bin.count}`.padStart(10),
		]
		lines.push("  " + row.join(""))
	}

	lines.push("")

	// Insights
	if (data.insights.length > 0) {
		lines.push("  Insights:")
		lines.push("  ─────────────────────────────────────────────────────────────────────────────")
		for (const insight of data.insights) {
			lines.push(`  ${insight}`)
		}
		lines.push("")
	}

	lines.push("╚══════════════════════════════════════════════════════════════════════════════╝")

	return lines
}

// ============================================================================
// Calibration Command
// ============================================================================

export const calibrationCommand = command({
	name: "calibration",
	description: "Generate confidence calibration report comparing automated vs human confidence",
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
		format: option({
			type: string,
			long: "format",
			short: "f",
			description: "Output format: table, chart, or json",
			defaultValue: () => "table",
		}),
	},
	handler: async (args) => {
		const [{ getDb }, analyticsModule] = await Promise.all([import("../db/db"), import("../db/queries/analytics")])

		const { getConfidenceCalibration } = analyticsModule
		const db = getDb()

		// Parse date filters
		const since = args.since ? new Date(args.since) : undefined
		const until = args.until ? new Date(args.until) : undefined

		console.log("Generating confidence calibration report...")
		console.log("")

		const data = await getConfidenceCalibration({ since, until }, db)

		if (data.overall.totalSamples === 0) {
			console.log("No calibration data available.")
			console.log("")
			console.log("To generate calibration data:")
			console.log("  1. Run 'pnpm cli deep-analyze' to identify causality")
			console.log("  2. Run 'pnpm cli verify --commit <sha>' to provide human feedback")
			console.log("  3. Run 'pnpm cli feedback' to review and verify more records")
			console.log("")
			console.log("Human verification includes:")
			console.log("  - Whether automation was correct (true/false)")
			console.log("  - Human confidence level (0-100%)")
			return
		}

		const format = args.format.toLowerCase()

		if (format === "json") {
			console.log(JSON.stringify(data, null, 2))
			return
		}

		if (format === "chart") {
			const chartLines = renderCalibrationChart(data.bins)
			for (const line of chartLines) {
				console.log(line)
			}

			const accuracyLines = renderAccuracyChart(data.bins)
			for (const line of accuracyLines) {
				console.log(line)
			}

			// Also show insights
			if (data.insights.length > 0) {
				console.log("Insights:")
				console.log("─".repeat(60))
				for (const insight of data.insights) {
					console.log(`  ${insight}`)
				}
			}
			return
		}

		// Default: table format
		const tableLines = renderTable(data)
		for (const line of tableLines) {
			console.log(line)
		}

		// Show interpretation guide
		console.log("")
		console.log("Interpretation Guide:")
		console.log("─".repeat(60))
		console.log("• Calibration score: Measures alignment between confidence and accuracy.")
		console.log("  - < 0.10: Excellent calibration")
		console.log("  - 0.10 - 0.20: Good calibration")
		console.log("  - > 0.20: Needs improvement")
		console.log("")
		console.log("• Delta (Human - Automated):")
		console.log("  - Positive: Automation underestimates (humans more confident)")
		console.log("  - Negative: Automation overestimates (humans less confident)")
		console.log("")
		console.log("• Accuracy by bin: Shows how well confidence predicts correctness")
		console.log("  - Ideal: Accuracy matches confidence level (e.g., 80% conf → 80% accuracy)")
	},
})
