import { command, option, string } from "cmd-ts"

export const causalityCommand = command({
	name: "causality",
	description: "Show bug causality relationships",
	args: {
		commit: option({
			type: string,
			long: "commit",
			short: "c",
			description: "Show causality for specific commit",
			defaultValue: () => "",
		}),
		topIntroducers: option({
			type: string,
			long: "top-introducers",
			short: "t",
			description: "Show top N bug introducers",
			defaultValue: () => "",
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const [{ getDb }, { getCommitBySha }, causalityModule] = await Promise.all([
			import("../db/db"),
			import("../db/queries/commits"),
			import("../db/queries/causality"),
		])

		const { getCausesForBugFix, getBugsCausedBy, getTopBugIntroducers, getCausalityStats } = causalityModule

		const db = getDb()

		// Show stats
		const stats = await getCausalityStats(db)
		console.log("Bug Causality Summary")
		console.log("=====================")
		console.log(`Total causal links: ${stats.totalLinks}`)
		console.log(`Root causes identified: ${stats.rootCauses}`)
		console.log(`Verified links: ${stats.verified}`)
		console.log(`Average bug age: ${stats.avgBugAgeDays.toFixed(1)} days`)
		console.log("")

		// Show top introducers if requested
		if (args.topIntroducers) {
			const limit = parseInt(args.topIntroducers, 10) || 10
			const introducers = await getTopBugIntroducers(limit, db)

			if (introducers.length > 0) {
				console.log(`Top ${limit} Bug Introducers`)
				console.log("=".repeat(30))

				for (const { bugsCaused, avgBugAge, commit } of introducers) {
					if (!commit) continue
					console.log("")
					console.log(`${commit.shortSha} - ${bugsCaused} bugs caused`)
					console.log(`  Avg bug age: ${avgBugAge?.toFixed(1) || "?"} days`)
					console.log(`  ${commit.message.slice(0, 50)}...`)
				}
			}
			return
		}

		// Show specific commit causality
		if (args.commit) {
			const commit = await getCommitBySha(args.commit, db)
			if (!commit) {
				console.log(`Commit ${args.commit} not found`)
				return
			}

			console.log(`Causality for ${commit.shortSha}`)
			console.log(`${commit.message.slice(0, 60)}`)
			console.log("=".repeat(50))

			// If this is a bug fix, show what caused it
			if (commit.messageType === "fix") {
				const causes = await getCausesForBugFix(commit.sha, db)
				if (causes.length > 0) {
					console.log("\nRoot Causes:")
					for (const causality of causes) {
						if (!causality.cause) continue
						console.log(
							`  ${causality.cause.shortSha} [${causality.relationshipType}] confidence: ${(causality.confidence * 100).toFixed(0)}%`,
						)
						console.log(`    ${causality.cause.message.slice(0, 50)}...`)
						if (causality.bugAge) {
							console.log(`    Bug age: ${causality.bugAge} days`)
						}
						console.log(`    Method: ${causality.analysisMethod}`)
					}
				} else {
					console.log("\nNo root causes identified")
				}
			}

			// Show bugs caused by this commit
			const bugsCaused = await getBugsCausedBy(commit.sha, db)
			if (bugsCaused.length > 0) {
				console.log("\nBugs Caused by This Commit:")
				for (const causality of bugsCaused) {
					if (!causality.bugFix) continue
					console.log(
						`  ${causality.bugFix.shortSha} [${causality.relationshipType}] confidence: ${(causality.confidence * 100).toFixed(0)}%`,
					)
					console.log(`    ${causality.bugFix.message.slice(0, 50)}...`)
					if (causality.bugAge) {
						console.log(`    Fixed after: ${causality.bugAge} days`)
					}
				}
			} else {
				console.log("\nNo known bugs caused by this commit")
			}
		}
	},
})
