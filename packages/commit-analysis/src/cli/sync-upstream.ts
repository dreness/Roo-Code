import { command, option, flag, string, number, boolean } from "cmd-ts"
import { execa } from "execa"

export const syncUpstreamCommand = command({
	name: "sync-upstream",
	description: "Pull latest commits from upstream into the commit-analysis branch and analyze them",
	args: {
		upstream: option({
			type: string,
			long: "upstream",
			short: "u",
			description: "Upstream remote name",
			defaultValue: () => "origin",
		}),
		branch: option({
			type: string,
			long: "branch",
			short: "b",
			description: "Branch to pull from",
			defaultValue: () => "main",
		}),
		concurrency: option({
			type: number,
			long: "concurrency",
			short: "c",
			description: "Number of parallel workers for analysis",
			defaultValue: () => 4,
		}),
		skipDeepAnalysis: flag({
			type: boolean,
			long: "skip-deep",
			description: "Skip deep causality analysis",
			defaultValue: () => false,
		}),
		dryRun: flag({
			type: boolean,
			long: "dry-run",
			short: "n",
			description: "Show what would be done without making changes",
			defaultValue: () => false,
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
		const { upstream, branch, repoPath, dryRun, skipDeepAnalysis, concurrency } = args

		console.log("╔═══════════════════════════════════════════════════════════╗")
		console.log("║           SYNC UPSTREAM & ANALYZE                          ║")
		console.log("╚═══════════════════════════════════════════════════════════╝")
		console.log("")

		// Step 0: Check if upstream remote exists
		try {
			await execa("git", ["remote", "get-url", upstream], { cwd: repoPath })
		} catch {
			console.error(`❌ Remote '${upstream}' not found.`)
			console.error("")
			console.error("Available remotes:")
			const { stdout: remotes } = await execa("git", ["remote", "-v"], { cwd: repoPath })
			console.error(remotes || "  (none)")
			console.error("")
			console.error(`To add an upstream remote, run:`)
			console.error(`  git remote add ${upstream} <upstream-url>`)
			process.exit(1)
		}

		// Step 1: Get the current HEAD before pulling
		console.log("📍 Getting current HEAD...")
		const { stdout: beforeSha } = await execa("git", ["rev-parse", "HEAD"], {
			cwd: repoPath,
		})
		console.log(`   Current HEAD: ${beforeSha.slice(0, 8)}`)
		console.log("")

		// Step 2: Fetch from upstream
		console.log(`📡 Fetching from ${upstream}...`)
		if (!dryRun) {
			try {
				await execa("git", ["fetch", upstream, branch], {
					cwd: repoPath,
					stdio: "inherit",
				})
			} catch (_error) {
				console.error("")
				console.error(`❌ Failed to fetch from ${upstream}/${branch}`)
				console.error("   Make sure the remote and branch exist.")
				process.exit(1)
			}
		} else {
			console.log(`   [DRY RUN] Would run: git fetch ${upstream} ${branch}`)
		}
		console.log("")

		// Step 3: Get the upstream HEAD
		const upstreamRef = `${upstream}/${branch}`
		let upstreamSha: string
		try {
			const result = await execa("git", ["rev-parse", upstreamRef], {
				cwd: repoPath,
			})
			upstreamSha = result.stdout
		} catch {
			console.error(`❌ Reference '${upstreamRef}' not found.`)
			console.error("")
			console.error("   This can happen if:")
			console.error(`   - The branch '${branch}' doesn't exist on '${upstream}'`)
			console.error(`   - You need to fetch first: git fetch ${upstream}`)
			process.exit(1)
		}
		console.log(`📍 Upstream HEAD: ${upstreamSha.slice(0, 8)}`)

		// Step 4: Count new commits
		const { stdout: commitCountStr } = await execa("git", ["rev-list", "--count", `${beforeSha}..${upstreamRef}`], {
			cwd: repoPath,
		})
		const newCommitCount = parseInt(commitCountStr.trim(), 10)

		if (newCommitCount === 0) {
			console.log("")
			console.log("✅ Already up to date. No new commits to analyze.")
			return
		}

		console.log(`   New commits available: ${newCommitCount}`)
		console.log("")

		// Step 5: Merge upstream
		console.log(`🔀 Merging ${upstreamRef}...`)
		if (!dryRun) {
			try {
				await execa("git", ["merge", upstreamRef, "--no-edit"], {
					cwd: repoPath,
					stdio: "inherit",
					env: {
						...process.env,
						GIT_EDITOR: "true",
					},
				})
			} catch (_error) {
				console.error("")
				console.error("❌ Merge failed. Please resolve conflicts and run:")
				console.error(`   pnpm commit-analysis analyze --since ${beforeSha} --until HEAD`)
				console.error("   pnpm commit-analysis deep-analyze")
				process.exit(1)
			}
		} else {
			console.log(`   [DRY RUN] Would run: git merge ${upstreamRef}`)
		}
		console.log("")

		// Step 6: Run analysis on new commits
		console.log("🔍 Analyzing new commits...")
		console.log(`   Range: ${beforeSha.slice(0, 8)}..HEAD`)
		console.log("")

		if (!dryRun) {
			// Dynamic import to run analyze
			const [
				{ default: PQueue },
				{ getDb },
				{ createCommit, createFileChanges },
				{ createClassification },
				{ extractCommits, extractFileChanges },
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

			// Extract new commits
			const commits = await extractCommits({
				since: beforeSha,
				until: "HEAD",
				repoPath,
			})

			if (commits.length === 0) {
				console.log("   No new commits found after merge.")
			} else {
				console.log(`   Found ${commits.length} commits to analyze`)

				const queue = new PQueue({ concurrency })
				let processed = 0

				for (const commit of commits) {
					queue.add(async () => {
						// Extract file changes
						const fileChanges = await extractFileChanges(commit.sha, repoPath)
						const filePaths = fileChanges.map((f) => f.path)

						// Classify
						const conventionalResult = classifyByConventionalCommit(commit.message)
						const semanticResult = classifyBySemantic(commit.message)
						const subsystems = detectSubsystem(filePaths)

						// Use conventional commit result if confident, else semantic
						const category =
							conventionalResult.confidence > 0.7 ? conventionalResult.category : semanticResult.category
						const confidence = Math.max(conventionalResult.confidence, semanticResult.confidence)

						// Calculate risk
						const riskScore = calculateRiskScore(
							category,
							commit.message,
							filePaths,
							commit.insertions,
							commit.deletions,
						)

						// Detect regression patterns
						const _regressionResult = await detectRegression(
							{
								sha: commit.sha,
								message: commit.message,
								filePaths,
								subsystems,
								category,
								date: commit.date,
							},
							db,
						)

						// Store commit
						await createCommit(
							{
								sha: commit.sha,
								shortSha: commit.shortSha,
								author: commit.author,
								authorEmail: commit.authorEmail,
								date: commit.date,
								message: commit.message,
								messageType: getMessageType(commit.message),
								messageScope: getMessageScope(commit.message),
								prNumber: commit.prNumber,
								filesChanged: fileChanges.length,
								insertions: commit.insertions,
								deletions: commit.deletions,
							},
							db,
						)

						// Store file changes
						if (fileChanges.length > 0) {
							await createFileChanges(
								fileChanges.map((fc) => ({
									commitSha: commit.sha,
									filePath: fc.path,
									changeType: fc.changeType,
									insertions: fc.insertions,
									deletions: fc.deletions,
									subsystem: detectSubsystem([fc.path])[0] || "other",
								})),
								db,
							)
						}

						// Store classification
						await createClassification(
							{
								commitSha: commit.sha,
								category,
								confidence,
								subsystems,
								flags: [],
								riskScore,
								analyzedAt: new Date(),
							},
							db,
						)

						processed++
						if (processed % 10 === 0 || processed === commits.length) {
							console.log(`   Analyzed: ${processed}/${commits.length}`)
						}
					})
				}

				await queue.onIdle()
				console.log(`   ✅ Analyzed ${commits.length} commits`)
			}

			// Step 7: Run deep analysis if not skipped
			if (!skipDeepAnalysis) {
				console.log("")
				console.log("🔬 Running deep causality analysis...")

				const [causalityDbModule, { analyzeBugCausality }] = await Promise.all([
					import("../db/queries/causality"),
					import("../causality/analyzer"),
				])

				const { createBugCausality } = causalityDbModule
				const { getUnanalyzedCommits, markCommitDeepAnalyzed, getCommit } = await import(
					"../db/queries/commits"
				)

				const unanalyzed = await getUnanalyzedCommits(db)
				const bugFixes = unanalyzed.filter((c) => c.messageType === "fix")

				if (bugFixes.length === 0) {
					console.log("   No bug fixes to analyze")
				} else {
					console.log(`   Found ${bugFixes.length} bug fixes to analyze`)

					const deepQueue = new PQueue({ concurrency })
					let causalLinksFound = 0
					let deepProcessed = 0

					for (const fix of bugFixes) {
						deepQueue.add(async () => {
							const commit = await getCommit(fix.sha, db)
							if (!commit) return

							const results = await analyzeBugCausality(
								commit,
								{
									methods: ["explicit", "blame", "semantic", "temporal"],
									maxAgeDays: 90,
								},
								repoPath,
							)

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

							await markCommitDeepAnalyzed(fix.sha, db)
							deepProcessed++

							if (deepProcessed % 5 === 0 || deepProcessed === bugFixes.length) {
								console.log(`   Deep analyzed: ${deepProcessed}/${bugFixes.length}`)
							}
						})
					}

					await deepQueue.onIdle()
					console.log(
						`   ✅ Deep analyzed ${bugFixes.length} commits, found ${causalLinksFound} causal links`,
					)
				}
			}
		} else {
			console.log(`   [DRY RUN] Would analyze ${newCommitCount} commits`)
			if (!skipDeepAnalysis) {
				console.log("   [DRY RUN] Would run deep causality analysis")
			}
		}

		console.log("")
		console.log("══════════════════════════════════════════════════════════════")
		console.log("✅ Sync complete!")
		console.log(`   Pulled ${newCommitCount} commits from ${upstreamRef}`)
		console.log("")
		console.log("💡 Next steps:")
		console.log("   pnpm commit-analysis status     # View updated stats")
		console.log("   pnpm commit-analysis:serve      # Start web UI")
	},
})
