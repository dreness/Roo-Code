import { command, option, string } from "cmd-ts"
import type { CommitAnalysisExport, ExportedCommit } from "../types"

export const exportCommand = command({
	name: "export",
	description: "Export analysis data to JSON",
	args: {
		since: option({
			type: string,
			long: "since",
			short: "s",
			description: "Export commits since date (YYYY-MM-DD)",
			defaultValue: () => "",
		}),
		commits: option({
			type: string,
			long: "commits",
			short: "c",
			description: "Comma-separated commit SHAs to export",
			defaultValue: () => "",
		}),
		output: option({
			type: string,
			long: "output",
			short: "o",
			description: "Output file path",
			defaultValue: () => "commit-analysis-export.json",
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const [{ writeFileSync }, { getDb }, { getCommits }, classificationsModule, causalityModule] =
			await Promise.all([
				import("fs"),
				import("../db/db"),
				import("../db/queries/commits"),
				import("../db/queries/classifications"),
				import("../db/queries/causality"),
			])

		const { getClassificationsByCommits } = classificationsModule
		const { getCausesForBugFix, getBugsCausedBy } = causalityModule

		const db = getDb()
		console.log("Exporting analysis data...")

		let commitsToExport: { sha: string }[] = []

		if (args.commits) {
			// Export specific commits
			const shas = args.commits.split(",").map((s) => s.trim())
			commitsToExport = shas.map((sha) => ({ sha }))
			console.log(`Exporting ${shas.length} specific commits`)
		} else if (args.since) {
			// Export since date
			const sinceDate = new Date(args.since)
			const commits = await getCommits({ since: sinceDate }, db)
			commitsToExport = commits
			console.log(`Exporting ${commits.length} commits since ${args.since}`)
		} else {
			// Export all
			const commits = await getCommits({}, db)
			commitsToExport = commits
			console.log(`Exporting all ${commits.length} commits`)
		}

		if (commitsToExport.length === 0) {
			console.log("No commits to export")
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

		// Write to file
		writeFileSync(args.output, JSON.stringify(exportData, null, 2))
		console.log(`Exported ${exportData.commits.length} commits to ${args.output}`)
	},
})
