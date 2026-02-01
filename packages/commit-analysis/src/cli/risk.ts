import { command, option, string, number, optional } from "cmd-ts"

export const riskCommand = command({
	name: "risk",
	description: "Show risk analysis for commits",
	args: {
		commits: option({
			type: optional(string),
			long: "commits",
			short: "c",
			description: "Specific commit SHAs to analyze, comma-separated",
		}),
		threshold: option({
			type: number,
			long: "threshold",
			short: "t",
			description: "Minimum risk score to show",
			defaultValue: () => 0,
		}),
		limit: option({
			type: number,
			long: "limit",
			short: "l",
			description: "Maximum commits to show",
			defaultValue: () => 20,
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const [{ getDb }, { getHighRiskCommits, getCategoryDistribution }, { getCommit }, { getRiskLevel }] =
			await Promise.all([
				import("../db/db"),
				import("../db/queries/classifications"),
				import("../db/queries/commits"),
				import("../scoring/risk"),
			])

		const db = getDb()

		// Parse commits from comma-separated string
		const commitsList = args.commits
			? args.commits
					.split(",")
					.map((c) => c.trim())
					.filter(Boolean)
			: []

		// If specific commits requested, show those
		if (commitsList.length > 0) {
			console.log("Risk Analysis for Specified Commits")
			console.log("====================================")

			for (const sha of commitsList) {
				const commit = await getCommit(sha, db)
				if (!commit) {
					console.log(`\n${sha}: Not found in database`)
					continue
				}

				const classification = commit.classification
				if (!classification) {
					console.log(`\n${commit.shortSha}: Not classified yet`)
					continue
				}

				const riskLevel = getRiskLevel(classification.riskScore)
				console.log("")
				console.log(`${commit.shortSha} [${riskLevel.toUpperCase()}]`)
				console.log(`  Risk Score: ${classification.riskScore.toFixed(1)}/100`)
				console.log(`  Category: ${classification.category}`)
				console.log(`  Confidence: ${(classification.confidence * 100).toFixed(0)}%`)
				console.log(`  Message: ${commit.message.slice(0, 60)}...`)

				if (classification.flags && classification.flags.length > 0) {
					console.log(`  Flags: ${classification.flags.join(", ")}`)
				}
			}
			return
		}

		// Show distribution first
		const distribution = await getCategoryDistribution(db)
		console.log("Risk Distribution by Category")
		console.log("=============================")

		for (const { category, count, avgRisk } of distribution) {
			const riskLevel = getRiskLevel(avgRisk)
			console.log(`  ${category}: ${count} commits, avg risk ${avgRisk.toFixed(1)} (${riskLevel})`)
		}
		console.log("")

		// Show high risk commits
		const highRisk = await getHighRiskCommits(args.threshold, db)

		if (highRisk.length === 0) {
			console.log(`No commits with risk score >= ${args.threshold}`)
			return
		}

		console.log(`High Risk Commits (>= ${args.threshold})`)
		console.log("=".repeat(40))

		const toShow = highRisk.slice(0, args.limit)

		for (const classification of toShow) {
			if (!classification.commit) continue

			const riskLevel = getRiskLevel(classification.riskScore)
			const riskBar = generateRiskBar(classification.riskScore)

			console.log("")
			console.log(`${classification.commit.shortSha} ${riskBar} ${classification.riskScore.toFixed(0)}`)
			console.log(`  ${riskLevel.toUpperCase()} | ${classification.category}`)
			console.log(`  ${classification.commit.message.slice(0, 60)}`)
		}

		if (highRisk.length > args.limit) {
			console.log(`\n... and ${highRisk.length - args.limit} more`)
		}
	},
})

function generateRiskBar(score: number): string {
	const filled = Math.ceil(score / 20)

	const colors: Record<number, string> = {
		1: "░",
		2: "▒",
		3: "▓",
		4: "█",
		5: "█",
	}

	let bar = ""
	for (let i = 1; i <= 5; i++) {
		bar += i <= filled ? colors[Math.min(filled, 4)] : "░"
	}

	return `[${bar}]`
}
