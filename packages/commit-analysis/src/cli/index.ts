import { run, subcommands } from "cmd-ts"
import { analyzeCommand } from "./analyze"
import { deepAnalyzeCommand } from "./deep-analyze"
import { regressionsCommand } from "./regressions"
import { riskCommand } from "./risk"
import { causalityCommand } from "./causality"
import { syncCommand } from "./sync"
import { syncUpstreamCommand } from "./sync-upstream"
import { exportCommand } from "./export"
import { importCommand } from "./import"
import { serveCommand } from "./serve"
import { statusCommand } from "./status"
import { investigateCommand } from "./investigate"
import { verifyCommand } from "./verify"
import { feedbackCommand } from "./feedback"
import { calibrationCommand } from "./calibration"
import { patternsCommand } from "./patterns"
import { queryCommand } from "./query"

// cmd-ts exits with code 1 when showing help (both top-level and subcommand).
// Override process.exit for help requests to exit cleanly with code 0.
const originalExit = process.exit
const args = process.argv.slice(2)
const isHelpRequest = args.includes("--help") || args.includes("-h")

if (isHelpRequest) {
	process.exit = ((_code?: number) => {
		originalExit(0)
	}) as typeof process.exit
}

const main = async () => {
	const cli = subcommands({
		name: "commit-analysis",
		description: "Analyze Roo Code commit history for risk and regression patterns",
		cmds: {
			analyze: analyzeCommand,
			"deep-analyze": deepAnalyzeCommand,
			regressions: regressionsCommand,
			risk: riskCommand,
			causality: causalityCommand,
			sync: syncCommand,
			"sync-upstream": syncUpstreamCommand,
			export: exportCommand,
			import: importCommand,
			serve: serveCommand,
			status: statusCommand,
			investigate: investigateCommand,
			verify: verifyCommand,
			feedback: feedbackCommand,
			calibration: calibrationCommand,
			patterns: patternsCommand,
			query: queryCommand,
		},
	})

	await run(cli, process.argv.slice(2))
}

main().catch((err) => {
	console.error("Error:", err.message)
	originalExit(1)
})
