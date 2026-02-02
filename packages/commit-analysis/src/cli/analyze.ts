import { command, option, flag, string, number, boolean } from "cmd-ts"

export const analyzeCommand = command({
	name: "analyze",
	description: "Analyze commits and classify them",
	args: {
		since: option({
			type: string,
			long: "since",
			short: "s",
			description: "Start commit ref (e.g., HEAD~100, v3.44.0)",
			defaultValue: () => "HEAD~100",
		}),
		until: option({
			type: string,
			long: "until",
			short: "u",
			description: "End commit ref",
			defaultValue: () => "HEAD",
		}),
		incremental: flag({
			type: boolean,
			long: "incremental",
			short: "i",
			description: "Only analyze commits newer than the latest in DB",
			defaultValue: () => false,
		}),
		concurrency: option({
			type: number,
			long: "concurrency",
			short: "c",
			description: "Number of parallel workers",
			defaultValue: () => 4,
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
		const [
			{ default: PQueue },
			{ getDb, analyzeDb },
			{ createCommit, createFileChanges, getLatestCommit },
			{ createClassification },
			{ extractCommits, extractFileChanges, getGitCommitCount },
			{ classifyByConventionalCommit, getMessageType, getMessageScope },
			{ classifyBySemantic },
			{ detectSubsystem },
			{ calculateRiskScore },
			{ detectRegression },
		] = await Promise.all([
			import("p-queue"),
			import("../db/db"),
			import("../db/queries/commits"),
			import("../db/queries/classifications"),
			import("../git/extractor"),
			import("../classifiers/conventional"),
			import("../classifiers/semantic"),
			import("../classifiers/subsystem"),
			import("../scoring/risk"),
			import("../detection/regression"),
		])

		const db = getDb()
		console.log("Analyzing commits...")

		let since = args.since
		const until = args.until

		// Handle incremental mode
		if (args.incremental) {
			const latest = await getLatestCommit(db)
			if (latest) {
				since = latest.sha
				console.log(`Incremental mode: starting from ${latest.shortSha}`)
			}
		}

		// Get commit count first
		const totalCount = await getGitCommitCount(since, until, args.repoPath)
		console.log(`Found ${totalCount} commits to analyze`)

		if (totalCount === 0) {
			console.log("No commits to analyze")
			return
		}

		// Extract commits
		const commits = await extractCommits({
			since,
			until,
			repoPath: args.repoPath,
		})

		console.log(`Extracted ${commits.length} commits`)

		// Process with queue
		const queue = new PQueue({ concurrency: args.concurrency })
		let processed = 0
		let regressionCount = 0

		const jobs = commits.map((commit) =>
			queue.add(async () => {
				// Extract file changes
				const fileChanges = await extractFileChanges(commit.sha, args.repoPath)

				// Classify the commit
				const conventionalResult = classifyByConventionalCommit(commit.message)
				const semanticResult = classifyBySemantic(commit.message)

				// Use conventional if available, otherwise semantic
				const classification = conventionalResult || semanticResult

				// Get subsystem for each file
				const filePaths = fileChanges.map((fc) => fc.filePath)

				// Calculate risk score
				const riskBreakdown = calculateRiskScore(
					classification.category,
					commit.message,
					filePaths,
					commit.insertions,
					commit.deletions,
				)

				// Store commit
				await createCommit({
					sha: commit.sha,
					shortSha: commit.shortSha,
					author: commit.author,
					authorEmail: commit.authorEmail,
					date: commit.date,
					message: commit.message,
					messageType: getMessageType(commit.message),
					messageScope: getMessageScope(commit.message),
					prNumber: commit.prNumber,
					filesChanged: commit.filesChanged,
					insertions: commit.insertions,
					deletions: commit.deletions,
				})

				// Store file changes with subsystem
				const fileChangesWithSubsystem = fileChanges.map((fc) => ({
					commitSha: commit.sha,
					filePath: fc.filePath,
					changeType: fc.changeType,
					insertions: fc.insertions,
					deletions: fc.deletions,
					subsystem: detectSubsystem(fc.filePath),
				}))

				await createFileChanges(fileChangesWithSubsystem)

				// Store classification
				await createClassification({
					commitSha: commit.sha,
					category: classification.category,
					confidence: classification.confidence,
					flags: classification.flags,
					riskScore: riskBreakdown.finalScore,
					analysisVersion: 1,
				})

				// Detect regression pattern
				const regressionResult = await detectRegression(
					{
						sha: commit.sha,
						shortSha: commit.shortSha,
						author: commit.author,
						authorEmail: commit.authorEmail,
						date: commit.date,
						message: commit.message,
						messageType: getMessageType(commit.message),
						messageScope: getMessageScope(commit.message),
						prNumber: commit.prNumber ?? null,
						filesChanged: commit.filesChanged,
						insertions: commit.insertions,
						deletions: commit.deletions,
						analyzedAt: new Date(),
						deepAnalyzedAt: null,
					},
					filePaths,
				)

				if (regressionResult.isRegression) {
					regressionCount++
				}

				processed++
				if (processed % 10 === 0) {
					console.log(`Processed ${processed}/${commits.length} commits`)
				}
			}),
		)

		await Promise.all(jobs)

		// Update SQLite query planner statistics after bulk inserts
		console.log(`\nUpdating database statistics...`)
		analyzeDb(db)

		console.log(`\nAnalysis complete:`)
		console.log(`  - Processed: ${processed} commits`)
		console.log(`  - Regressions detected: ${regressionCount}`)
	},
})
