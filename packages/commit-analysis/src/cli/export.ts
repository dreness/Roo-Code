import { command, option, string, boolean as cmdBoolean, flag } from "cmd-ts"
import type { CommitAnalysisExport, ExportedCommit } from "../types"
import type { InvestigationExportData } from "../db/queries/analytics"

// ============================================================================
// CSV Conversion Helpers
// ============================================================================

function escapeCSV(value: string | number | boolean | null | undefined): string {
	if (value === null || value === undefined) {
		return ""
	}
	const str = String(value)
	// Escape quotes and wrap in quotes if contains comma, quote, or newline
	if (str.includes(",") || str.includes('"') || str.includes("\n")) {
		return `"${str.replace(/"/g, '""')}"`
	}
	return str
}

function investigationsToCSV(data: InvestigationExportData): string {
	const lines: string[] = []

	// Investigations sheet
	lines.push("# Investigations")
	lines.push(
		[
			"id",
			"bug_fix_sha",
			"bug_fix_short_sha",
			"bug_fix_message",
			"investigator",
			"started_at",
			"completed_at",
			"conclusion_type",
			"final_cause_sha",
			"confidence_override",
			"summary",
			"candidate_count",
			"evidence_count",
		].join(","),
	)

	for (const inv of data.investigations) {
		lines.push(
			[
				escapeCSV(inv.id),
				escapeCSV(inv.bugFixSha),
				escapeCSV(inv.bugFixShortSha),
				escapeCSV(inv.bugFixMessage),
				escapeCSV(inv.investigator),
				escapeCSV(inv.startedAt.toISOString()),
				escapeCSV(inv.completedAt?.toISOString()),
				escapeCSV(inv.conclusionType),
				escapeCSV(inv.finalCauseSha),
				escapeCSV(inv.confidenceOverride),
				escapeCSV(inv.summary),
				escapeCSV(inv.candidates.length),
				escapeCSV(inv.evidence.length),
			].join(","),
		)
	}

	lines.push("")
	lines.push("# Candidates")
	lines.push(
		[
			"investigation_id",
			"candidate_sha",
			"candidate_short_sha",
			"candidate_message",
			"verdict",
			"rejection_reason",
			"reasoning",
			"order_examined",
		].join(","),
	)

	for (const inv of data.investigations) {
		for (const cand of inv.candidates) {
			lines.push(
				[
					escapeCSV(inv.id),
					escapeCSV(cand.candidateSha),
					escapeCSV(cand.candidateShortSha),
					escapeCSV(cand.candidateMessage),
					escapeCSV(cand.verdict),
					escapeCSV(cand.rejectionReason),
					escapeCSV(cand.reasoning),
					escapeCSV(cand.orderExamined),
				].join(","),
			)
		}
	}

	lines.push("")
	lines.push("# Evidence")
	lines.push(["investigation_id", "evidence_type", "file_path", "content_preview", "captured_at"].join(","))

	for (const inv of data.investigations) {
		for (const ev of inv.evidence) {
			lines.push(
				[
					escapeCSV(inv.id),
					escapeCSV(ev.evidenceType),
					escapeCSV(ev.filePath),
					escapeCSV(ev.contentPreview),
					escapeCSV(ev.capturedAt.toISOString()),
				].join(","),
			)
		}
	}

	lines.push("")
	lines.push("# Causality Records (Human Verified)")
	lines.push(
		[
			"id",
			"bug_fix_sha",
			"bug_fix_short_sha",
			"cause_sha",
			"cause_short_sha",
			"relationship_type",
			"confidence",
			"bug_age",
			"bug_age_commits",
			"analysis_method",
			"human_verified",
			"human_confidence",
			"automation_was_correct",
			"investigation_id",
		].join(","),
	)

	for (const rec of data.causalityRecords) {
		lines.push(
			[
				escapeCSV(rec.id),
				escapeCSV(rec.bugFixSha),
				escapeCSV(rec.bugFixShortSha),
				escapeCSV(rec.causeSha),
				escapeCSV(rec.causeShortSha),
				escapeCSV(rec.relationshipType),
				escapeCSV(rec.confidence),
				escapeCSV(rec.bugAge),
				escapeCSV(rec.bugAgeCommits),
				escapeCSV(rec.analysisMethod),
				escapeCSV(rec.humanVerified),
				escapeCSV(rec.humanConfidence),
				escapeCSV(rec.automationWasCorrect),
				escapeCSV(rec.investigationId),
			].join(","),
		)
	}

	return lines.join("\n")
}

function commitsToCSV(data: CommitAnalysisExport): string {
	const lines: string[] = []

	// Commits sheet
	lines.push("# Commits")
	lines.push(["sha", "category", "confidence", "flags", "risk_score"].join(","))

	for (const commit of data.commits) {
		lines.push(
			[
				escapeCSV(commit.sha),
				escapeCSV(commit.classification.category),
				escapeCSV(commit.classification.confidence),
				escapeCSV(commit.classification.flags.join(";")),
				escapeCSV(commit.classification.riskScore),
			].join(","),
		)
	}

	lines.push("")
	lines.push("# Causality")
	lines.push(["bug_fix_sha", "cause_sha", "type", "confidence", "bug_age", "method"].join(","))

	for (const commit of data.commits) {
		if (commit.causality) {
			for (const cause of commit.causality.causes) {
				lines.push(
					[
						escapeCSV(commit.sha),
						escapeCSV(cause.sha),
						escapeCSV(cause.type),
						escapeCSV(cause.confidence),
						escapeCSV(cause.bugAge),
						escapeCSV(cause.method),
					].join(","),
				)
			}
		}
	}

	return lines.join("\n")
}

// ============================================================================
// Export Command
// ============================================================================

export const exportCommand = command({
	name: "export",
	description: "Export analysis data to JSON or CSV",
	args: {
		investigations: flag({
			type: cmdBoolean,
			long: "investigations",
			short: "i",
			description: "Export investigation data (instead of commit data)",
		}),
		format: option({
			type: string,
			long: "format",
			short: "f",
			description: "Output format: json or csv",
			defaultValue: () => "json",
		}),
		since: option({
			type: string,
			long: "since",
			short: "s",
			description: "Export data since date (YYYY-MM-DD)",
			defaultValue: () => "",
		}),
		until: option({
			type: string,
			long: "until",
			short: "u",
			description: "Export data until date (YYYY-MM-DD)",
			defaultValue: () => "",
		}),
		commits: option({
			type: string,
			long: "commits",
			short: "c",
			description: "Comma-separated commit SHAs to export (commits mode only)",
			defaultValue: () => "",
		}),
		output: option({
			type: string,
			long: "output",
			short: "o",
			description: "Output file path (default: stdout)",
			defaultValue: () => "",
		}),
	},
	handler: async (args) => {
		// Validate format
		const format = args.format.toLowerCase()
		if (format !== "json" && format !== "csv") {
			console.error(`Error: Invalid format '${args.format}'. Use 'json' or 'csv'.`)
			process.exit(1)
		}

		// Parse date filters
		const since = args.since ? new Date(args.since) : undefined
		const until = args.until ? new Date(args.until) : undefined

		if (args.investigations) {
			// Export investigation data
			await exportInvestigations({ format, since, until, output: args.output })
		} else {
			// Export commit data (original behavior)
			await exportCommits({ format, since, until, commits: args.commits, output: args.output })
		}
	},
})

// ============================================================================
// Investigation Export
// ============================================================================

interface InvestigationExportOptions {
	format: string
	since?: Date
	until?: Date
	output: string
}

async function exportInvestigations(options: InvestigationExportOptions): Promise<void> {
	const [{ writeFileSync }, { getDb }, analyticsModule] = await Promise.all([
		import("fs"),
		import("../db/db"),
		import("../db/queries/analytics"),
	])

	const { getInvestigationDataExport } = analyticsModule
	const db = getDb()

	if (!options.output) {
		console.error("Exporting investigation data...")
	}

	const data = await getInvestigationDataExport({ since: options.since, until: options.until }, db)

	if (data.investigations.length === 0 && data.causalityRecords.length === 0) {
		console.error("No investigation data to export.")
		console.error("Run 'pnpm cli investigate --commit <sha>' to create investigations.")
		return
	}

	let output: string

	if (options.format === "csv") {
		output = investigationsToCSV(data)
	} else {
		output = JSON.stringify(data, null, 2)
	}

	if (options.output) {
		writeFileSync(options.output, output)
		console.log(`Exported ${data.investigations.length} investigations to ${options.output}`)
		console.log(`  - ${data.causalityRecords.length} human-verified causality records`)
		console.log(`  - Format: ${options.format.toUpperCase()}`)
	} else {
		// Output to stdout
		console.log(output)
	}
}

// ============================================================================
// Commit Export (Original Behavior)
// ============================================================================

interface CommitExportOptions {
	format: string
	since?: Date
	until?: Date
	commits: string
	output: string
}

async function exportCommits(options: CommitExportOptions): Promise<void> {
	const [{ writeFileSync }, { getDb }, { getCommits }, classificationsModule, causalityModule] = await Promise.all([
		import("fs"),
		import("../db/db"),
		import("../db/queries/commits"),
		import("../db/queries/classifications"),
		import("../db/queries/causality"),
	])

	const { getClassificationsByCommits } = classificationsModule
	const { getCausesForBugFix, getBugsCausedBy } = causalityModule

	const db = getDb()

	if (!options.output) {
		console.error("Exporting commit analysis data...")
	}

	let commitsToExport: { sha: string }[] = []

	if (options.commits) {
		// Export specific commits
		const shas = options.commits.split(",").map((s) => s.trim())
		commitsToExport = shas.map((sha) => ({ sha }))
		console.error(`Exporting ${shas.length} specific commits`)
	} else if (options.since) {
		// Export since date
		const commits = await getCommits({ since: options.since }, db)
		commitsToExport = commits
		console.error(`Exporting ${commits.length} commits since ${options.since.toISOString().split("T")[0]}`)
	} else {
		// Export all
		const commits = await getCommits({}, db)
		commitsToExport = commits
		console.error(`Exporting all ${commits.length} commits`)
	}

	if (commitsToExport.length === 0) {
		console.error("No commits to export")
		return
	}

	// Get classifications
	const shas = commitsToExport.map((c) => c.sha)
	const classifications = await getClassificationsByCommits(shas, db)
	const classificationMap = new Map(classifications.map((c) => [c.commitSha, c]))

	// Build export data
	const exportData: CommitAnalysisExport = {
		version: "1.0",
		exportedAt: new Date().toISOString(),
		commits: [],
	}

	for (const commit of commitsToExport) {
		const classification = classificationMap.get(commit.sha)
		if (!classification) continue

		const exported: ExportedCommit = {
			sha: commit.sha,
			classification: {
				category: classification.category,
				confidence: classification.confidence,
				flags: classification.flags || [],
				riskScore: classification.riskScore,
			},
		}

		// Get causality data
		const causes = await getCausesForBugFix(commit.sha, db)
		const causedBugs = await getBugsCausedBy(commit.sha, db)

		if (causes.length > 0 || causedBugs.length > 0) {
			exported.causality = {
				causes: causes.map((c) => ({
					sha: c.causeSha,
					type: c.relationshipType,
					confidence: c.confidence,
					bugAge: c.bugAge ?? undefined,
					method: c.analysisMethod || "unknown",
				})),
				causedBugs: causedBugs.map((c) => ({
					sha: c.bugFixSha,
					type: c.relationshipType,
					confidence: c.confidence,
				})),
			}
		}

		exportData.commits.push(exported)
	}

	let output: string

	if (options.format === "csv") {
		output = commitsToCSV(exportData)
	} else {
		output = JSON.stringify(exportData, null, 2)
	}

	if (options.output) {
		writeFileSync(options.output, output)
		console.log(`Exported ${exportData.commits.length} commits to ${options.output}`)
		console.log(`  - Format: ${options.format.toUpperCase()}`)
	} else {
		// Output to stdout
		console.log(output)
	}
}
