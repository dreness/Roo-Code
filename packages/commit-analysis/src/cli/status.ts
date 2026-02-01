import { command, flag, boolean } from "cmd-ts"

export const statusCommand = command({
	name: "status",
	description: "Show the status of analysis data in the database",
	args: {
		verbose: flag({
			type: boolean,
			long: "verbose",
			short: "v",
			description: "Show detailed breakdown",
			defaultValue: () => false,
		}),
		json: flag({
			type: boolean,
			long: "json",
			description: "Output as JSON",
			defaultValue: () => false,
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const [{ getDb }, schemaModule, drizzleModule] = await Promise.all([
			import("../db/db"),
			import("../db/schema"),
			import("drizzle-orm"),
		])

		const { commits, classifications, bugCausality, regressionPatterns } = schemaModule
		const { sql, desc, asc, isNotNull } = drizzleModule

		const db = getDb()

		// Run all queries in parallel for better performance
		const [
			totalCommitsResult,
			analyzedCommitsResult,
			deepAnalyzedResult,
			categoryDistribution,
			rootCausesResult,
			causalityLinksResult,
			patternCountResult,
			activePatternResult,
			oldestAnalysisResult,
			newestAnalysisResult,
			oldestCommitResult,
			newestCommitResult,
			riskDistribution,
		] = await Promise.all([
			// Total commits
			db.select({ count: sql<number>`count(*)` }).from(commits),

			// Analyzed commits (with classification)
			db.select({ count: sql<number>`count(*)` }).from(classifications),

			// Deep-analyzed commits
			db
				.select({ count: sql<number>`count(*)` })
				.from(commits)
				.where(isNotNull(commits.deepAnalyzedAt)),

			// Category distribution
			db
				.select({
					category: classifications.category,
					count: sql<number>`count(*)`,
					avgRisk: sql<number>`round(avg(${classifications.riskScore}), 1)`,
				})
				.from(classifications)
				.groupBy(classifications.category)
				.orderBy(desc(sql`count(*)`)),

			// Root causes identified
			db.select({ count: sql<number>`count(distinct ${bugCausality.causeSha})` }).from(bugCausality),

			// Total causality links
			db.select({ count: sql<number>`count(*)` }).from(bugCausality),

			// Regression patterns count
			db.select({ count: sql<number>`count(*)` }).from(regressionPatterns),

			// Active patterns
			db
				.select({ count: sql<number>`count(*)` })
				.from(regressionPatterns)
				.where(sql`${regressionPatterns.status} = 'active'`),

			// Oldest analysis timestamp
			db
				.select({ date: commits.date, analyzedAt: commits.analyzedAt })
				.from(commits)
				.where(isNotNull(commits.analyzedAt))
				.orderBy(asc(commits.analyzedAt))
				.limit(1),

			// Newest analysis timestamp
			db
				.select({ date: commits.date, analyzedAt: commits.analyzedAt })
				.from(commits)
				.where(isNotNull(commits.analyzedAt))
				.orderBy(desc(commits.analyzedAt))
				.limit(1),

			// Oldest commit date
			db.select({ date: commits.date }).from(commits).orderBy(asc(commits.date)).limit(1),

			// Newest commit date
			db.select({ date: commits.date }).from(commits).orderBy(desc(commits.date)).limit(1),

			// Risk score distribution
			db
				.select({
					level: sql<string>`CASE
						WHEN ${classifications.riskScore} < 25 THEN 'Low (0-24)'
						WHEN ${classifications.riskScore} < 50 THEN 'Medium (25-49)'
						WHEN ${classifications.riskScore} < 75 THEN 'High (50-74)'
						ELSE 'Critical (75-100)'
					END`,
					count: sql<number>`count(*)`,
				})
				.from(classifications).groupBy(sql`CASE
					WHEN ${classifications.riskScore} < 25 THEN 'Low (0-24)'
					WHEN ${classifications.riskScore} < 50 THEN 'Medium (25-49)'
					WHEN ${classifications.riskScore} < 75 THEN 'High (50-74)'
					ELSE 'Critical (75-100)'
				END`).orderBy(sql`CASE
					WHEN ${classifications.riskScore} < 25 THEN 1
					WHEN ${classifications.riskScore} < 50 THEN 2
					WHEN ${classifications.riskScore} < 75 THEN 3
					ELSE 4
				END`),
		])

		// Extract results
		const totalCommits = totalCommitsResult[0]?.count ?? 0
		const analyzedCommits = analyzedCommitsResult[0]?.count ?? 0
		const deepAnalyzedCommits = deepAnalyzedResult[0]?.count ?? 0
		const rootCausesIdentified = rootCausesResult[0]?.count ?? 0
		const causalityLinks = causalityLinksResult[0]?.count ?? 0
		const patternCount = patternCountResult[0]?.count ?? 0
		const activePatterns = activePatternResult[0]?.count ?? 0
		const [oldestAnalysis] = oldestAnalysisResult
		const [newestAnalysis] = newestAnalysisResult
		const [oldestCommit] = oldestCommitResult
		const [newestCommit] = newestCommitResult

		if (args.json) {
			const output = {
				commits: {
					total: totalCommits,
					analyzed: analyzedCommits,
					deepAnalyzed: deepAnalyzedCommits,
				},
				categories: categoryDistribution.reduce(
					(acc, row) => {
						acc[row.category] = { count: row.count, avgRisk: row.avgRisk }
						return acc
					},
					{} as Record<string, { count: number; avgRisk: number }>,
				),
				causality: {
					rootCausesIdentified,
					totalLinks: causalityLinks,
				},
				patterns: {
					total: patternCount,
					active: activePatterns,
				},
				riskDistribution: riskDistribution.reduce(
					(acc, row) => {
						acc[row.level] = row.count
						return acc
					},
					{} as Record<string, number>,
				),
				timeRange: {
					oldestCommit: oldestCommit?.date?.toISOString() ?? null,
					newestCommit: newestCommit?.date?.toISOString() ?? null,
					oldestAnalysis: oldestAnalysis?.analyzedAt?.toISOString() ?? null,
					newestAnalysis: newestAnalysis?.analyzedAt?.toISOString() ?? null,
				},
			}
			console.log(JSON.stringify(output, null, 2))
			return
		}

		// Text output
		console.log("\n╔══════════════════════════════════════════════════════════════╗")
		console.log("║               COMMIT ANALYSIS STATUS                          ║")
		console.log("╚══════════════════════════════════════════════════════════════╝\n")

		// Commits section
		console.log("📊 COMMITS")
		console.log("─".repeat(50))
		console.log(`  Total commits:       ${totalCommits.toLocaleString()}`)
		console.log(`  Analyzed:            ${analyzedCommits.toLocaleString()}`)
		console.log(`  Deep-analyzed:       ${deepAnalyzedCommits.toLocaleString()}`)
		if (totalCommits > 0) {
			const pct = ((analyzedCommits / totalCommits) * 100).toFixed(1)
			console.log(`  Coverage:            ${pct}%`)
		}

		// Category distribution
		if (categoryDistribution.length > 0) {
			console.log("\n📁 CATEGORIES")
			console.log("─".repeat(50))

			const maxCount = Math.max(...categoryDistribution.map((c) => c.count))
			const barWidth = 20

			for (const row of categoryDistribution) {
				const barLength = Math.round((row.count / maxCount) * barWidth)
				const bar = "█".repeat(barLength) + "░".repeat(barWidth - barLength)
				const pct = ((row.count / analyzedCommits) * 100).toFixed(1)
				console.log(
					`  ${row.category.padEnd(15)} ${bar} ${row.count.toString().padStart(5)} (${pct.padStart(5)}%)  avg risk: ${row.avgRisk}`,
				)
			}
		}

		// Risk distribution
		if (riskDistribution.length > 0 && args.verbose) {
			console.log("\n⚠️  RISK DISTRIBUTION")
			console.log("─".repeat(50))

			for (const row of riskDistribution) {
				const pct = ((row.count / analyzedCommits) * 100).toFixed(1)
				console.log(`  ${row.level.padEnd(20)} ${row.count.toString().padStart(5)} (${pct.padStart(5)}%)`)
			}
		}

		// Causality section
		console.log("\n🔗 BUG CAUSALITY")
		console.log("─".repeat(50))
		console.log(`  Root causes identified: ${rootCausesIdentified.toLocaleString()}`)
		console.log(`  Total causality links:  ${causalityLinks.toLocaleString()}`)

		// Patterns section
		console.log("\n🔄 REGRESSION PATTERNS")
		console.log("─".repeat(50))
		console.log(`  Total patterns:  ${patternCount.toLocaleString()}`)
		console.log(`  Active patterns: ${activePatterns.toLocaleString()}`)

		// Time range
		console.log("\n⏱️  TIME RANGE")
		console.log("─".repeat(50))
		if (oldestCommit?.date) {
			console.log(`  Oldest commit:    ${formatDate(oldestCommit.date)}`)
		}
		if (newestCommit?.date) {
			console.log(`  Newest commit:    ${formatDate(newestCommit.date)}`)
		}
		if (oldestAnalysis?.analyzedAt) {
			console.log(`  First analyzed:   ${formatDate(oldestAnalysis.analyzedAt)}`)
		}
		if (newestAnalysis?.analyzedAt) {
			console.log(`  Last analyzed:    ${formatDate(newestAnalysis.analyzedAt)}`)
		}

		if (oldestCommit?.date && newestCommit?.date) {
			const days = Math.round((newestCommit.date.getTime() - oldestCommit.date.getTime()) / (1000 * 60 * 60 * 24))
			console.log(`  Date span:        ${days} days`)
		}

		console.log("")
	},
})

function formatDate(date: Date): string {
	return date.toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}
