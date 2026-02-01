import { command, option, flag, string, boolean } from "cmd-ts"
import type { CommitAnalysisExport } from "../types"

export const importCommand = command({
	name: "import",
	description: "Import analysis data from JSON",
	args: {
		file: option({
			type: string,
			long: "file",
			short: "f",
			description: "Input file path",
		}),
		replace: flag({
			type: boolean,
			long: "replace",
			description: "Replace existing data (default: merge)",
			defaultValue: () => false,
		}),
		merge: flag({
			type: boolean,
			long: "merge",
			description: "Merge with existing data (default)",
			defaultValue: () => true,
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const [{ readFileSync, existsSync }, { getDb }, classificationsModule, causalityModule, { getCommitBySha }] =
			await Promise.all([
				import("fs"),
				import("../db/db"),
				import("../db/queries/classifications"),
				import("../db/queries/causality"),
				import("../db/queries/commits"),
			])

		const { createClassification, getClassification } = classificationsModule
		const { createBugCausality } = causalityModule

		const db = getDb()

		if (!existsSync(args.file)) {
			console.error(`File not found: ${args.file}`)
			process.exit(1)
		}

		console.log(`Importing from ${args.file}...`)

		const content = readFileSync(args.file, "utf-8")
		const data: CommitAnalysisExport = JSON.parse(content)

		if (data.version !== "1.0") {
			console.error(`Unsupported export version: ${data.version}`)
			process.exit(1)
		}

		console.log(`Export from: ${data.exportedAt}`)
		console.log(`Commits to import: ${data.commits.length}`)
		console.log(`Mode: ${args.replace ? "replace" : "merge"}`)

		let imported = 0
		let skipped = 0
		let causalityImported = 0

		for (const commitData of data.commits) {
			// Check if commit exists in DB
			const commit = await getCommitBySha(commitData.sha, db)
			if (!commit) {
				console.log(`  Skipping ${commitData.sha.slice(0, 8)}: commit not in database`)
				skipped++
				continue
			}

			// Check existing classification
			const existing = await getClassification(commitData.sha, db)

			if (existing && !args.replace) {
				// Merge mode: only update if new data has higher confidence
				if (commitData.classification.confidence <= existing.confidence) {
					skipped++
					continue
				}
			}

			// Import classification
			await createClassification({
				commitSha: commitData.sha,
				category: commitData.classification.category,
				confidence: commitData.classification.confidence,
				flags: commitData.classification.flags,
				riskScore: commitData.classification.riskScore,
				analysisVersion: 1,
			})

			imported++

			// Import causality data
			if (commitData.causality) {
				for (const cause of commitData.causality.causes) {
					// Verify cause commit exists
					const causeCommit = await getCommitBySha(cause.sha, db)
					if (!causeCommit) continue

					await createBugCausality({
						bugFixSha: commitData.sha,
						causeSha: cause.sha,
						relationshipType: cause.type,
						confidence: cause.confidence,
						bugAge: cause.bugAge,
						analysisMethod: cause.method,
					})
					causalityImported++
				}
			}
		}

		console.log(`\nImport complete:`)
		console.log(`  - Classifications imported: ${imported}`)
		console.log(`  - Skipped: ${skipped}`)
		console.log(`  - Causality links imported: ${causalityImported}`)
	},
})
