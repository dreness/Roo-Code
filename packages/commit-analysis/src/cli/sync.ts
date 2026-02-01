import { command, option, string, number } from "cmd-ts"

export const syncCommand = command({
	name: "sync",
	description: "Get sync recommendations for your fork",
	args: {
		upstream: option({
			type: string,
			long: "upstream",
			short: "u",
			description: "Upstream branch ref",
			defaultValue: () => "origin/main",
		}),
		local: option({
			type: string,
			long: "local",
			short: "l",
			description: "Local branch/tag ref",
			defaultValue: () => "HEAD",
		}),
		maxRisk: option({
			type: number,
			long: "max-risk",
			short: "m",
			description: "Maximum acceptable risk score",
			defaultValue: () => 60,
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
		const [{ analyzeSyncRange, getSyncSummary }, { getRiskLevel }] = await Promise.all([
			import("../sync/advisor"),
			import("../scoring/risk"),
		])

		console.log("Sync Advisor")
		console.log("============")
		console.log(`Upstream: ${args.upstream}`)
		console.log(`Local: ${args.local}`)
		console.log(`Max acceptable risk: ${args.maxRisk}`)
		console.log("")

		// Get summary first
		const summary = await getSyncSummary(args.upstream, args.local, args.repoPath)
		console.log("Status:")
		console.log(`  Behind upstream: ${summary.behind} commits`)
		console.log(`  Ahead of upstream: ${summary.ahead} commits`)
		if (summary.lastSyncDate) {
			console.log(`  Last sync: ${summary.lastSyncDate.toISOString().split("T")[0]}`)
		}
		console.log("")

		if (summary.behind === 0) {
			console.log("Already up to date!")
			return
		}

		// Analyze the sync range
		const recommendation = await analyzeSyncRange({
			upstream: args.upstream,
			local: args.local,
			maxRisk: args.maxRisk,
			repoPath: args.repoPath,
		})

		const riskLevel = getRiskLevel(recommendation.totalRisk)

		console.log("Analysis:")
		console.log(`  Total commits: ${recommendation.commitCount}`)
		console.log(`  Features: ${recommendation.breakdown.features}`)
		console.log(`  Fixes: ${recommendation.breakdown.fixes}`)
		console.log(`  Other: ${recommendation.breakdown.other}`)
		console.log(`  Aggregate risk: ${recommendation.totalRisk.toFixed(1)} (${riskLevel})`)
		console.log("")

		if (recommendation.warnings.length > 0) {
			console.log("Warnings:")
			for (const warning of recommendation.warnings) {
				console.log(`  ⚠️  ${warning}`)
			}
			console.log("")
		}

		console.log("Recommendation:")
		if (recommendation.safeToSync) {
			console.log(`  ✅ Safe to sync to ${args.upstream}`)
		} else {
			console.log(`  ⚠️  Consider syncing to ${recommendation.recommendedCommit.slice(0, 8)} instead`)
			console.log(`  This limits risk to acceptable levels`)
		}
	},
})
