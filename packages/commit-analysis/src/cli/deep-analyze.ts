import { command, option, string, number, optional } from "cmd-ts"
import type { AnalysisMethod } from "../types"

const VALID_METHODS: AnalysisMethod[] = ["explicit", "blame", "semantic", "temporal"]

export const deepAnalyzeCommand = command({
	name: "deep-analyze",
	description: "Run deep causality analysis on bug fixes",
	args: {
		batchSize: option({
			type: number,
			long: "batch-size",
			short: "b",
			description: "Commits per batch",
			defaultValue: () => 50,
		}),
		concurrency: option({
			type: number,
			long: "concurrency",
			short: "c",
			description: "Number of parallel workers",
			defaultValue: () => 4,
		}),
		methods: option({
			type: optional(string),
			long: "methods",
			short: "m",
			description: "Analysis methods to use, comma-separated (explicit,blame,semantic,temporal)",
		}),
		maxAgeDays: option({
			type: number,
			long: "max-age",
			description: "How far back to search for causes (days)",
			defaultValue: () => 90,
		}),
		repoPath: option({
			type: string,
			long: "repo",
			short: "r",
			description: "Path to git repository",
			defaultValue: () => process.cwd(),
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const [{ default: PQueue }, dbModule, commitsModule, causalityDbModule, { analyzeBugCausality }] =
			await Promise.all([
				import("p-queue"),
				import("../db/db"),
				import("../db/queries/commits"),
				import("../db/queries/causality"),
				import("../causality/analyzer"),
			])

		const { getDb, analyzeDb } = dbModule
		const { getUnanalyzedCommits, markCommitDeepAnalyzed, getCommit } = commitsModule
		const { createBugCausality, getCausalityStats } = causalityDbModule

		const db = getDb()
		console.log("Running deep causality analysis...")

		// Parse methods from comma-separated string
		const methodsInput = args.methods ? args.methods.split(",").map((m: string) => m.trim()) : []
		const methods: AnalysisMethod[] =
			methodsInput.length > 0
				? (methodsInput.filter((m: string) => VALID_METHODS.includes(m as AnalysisMethod)) as AnalysisMethod[])
				: VALID_METHODS

		console.log(`Using methods: ${methods.join(", ")}`)

		// Get unanalyzed bug fixes
		const unanalyzed = await getUnanalyzedCommits(db)
		const bugFixes = unanalyzed.filter((c) => c.messageType === "fix")

		console.log(`Found ${bugFixes.length} bug fixes to analyze`)

		if (bugFixes.length === 0) {
			console.log("No commits to analyze")
			return
		}

		const queue = new PQueue({ concurrency: args.concurrency })
		let processed = 0
		let causalLinksFound = 0

		// Process in batches
		for (let i = 0; i < bugFixes.length; i += args.batchSize) {
			const batch = bugFixes.slice(i, i + args.batchSize)
			console.log(`\nProcessing batch ${Math.floor(i / args.batchSize) + 1}...`)

			const jobs = batch.map((fix) =>
				queue.add(async () => {
					// Get full commit details
					const commit = await getCommit(fix.sha, db)
					if (!commit) return

					// Run causality analysis
					const results = await analyzeBugCausality(
						commit,
						{
							methods,
							maxAgeDays: args.maxAgeDays,
						},
						args.repoPath,
					)

					// Store results
					for (const result of results) {
						await createBugCausality({
							bugFixSha: fix.sha,
							causeSha: result.causeSha,
							relationshipType: result.relationshipType,
							confidence: result.confidence,
							bugAge: result.bugAge,
							bugAgeCommits: result.bugAgeCommits,
							analysisMethod: result.analysisMethod,
							notes: result.notes,
						})
						causalLinksFound++
					}

					// Mark as analyzed
					await markCommitDeepAnalyzed(fix.sha, db)

					processed++
				}),
			)

			await Promise.all(jobs)
			console.log(`  Processed ${Math.min(i + args.batchSize, bugFixes.length)}/${bugFixes.length}`)
		}

		// Update SQLite query planner statistics after bulk inserts
		console.log(`\nUpdating database statistics...`)
		analyzeDb(db)

		// Print summary
		const stats = await getCausalityStats(db)

		console.log(`\nDeep analysis complete:`)
		console.log(`  - Bug fixes analyzed: ${processed}`)
		console.log(`  - Causal links found: ${causalLinksFound}`)
		console.log(`  - Total links in DB: ${stats.totalLinks}`)
		console.log(`  - Root causes: ${stats.rootCauses}`)
		console.log(`  - Avg bug age: ${stats.avgBugAgeDays.toFixed(1)} days`)
	},
})
