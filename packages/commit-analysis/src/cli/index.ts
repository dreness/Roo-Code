import { run, subcommands } from "cmd-ts"
import { analyzeCommand } from "./analyze"
import { deepAnalyzeCommand } from "./deep-analyze"
import { regressionsCommand } from "./regressions"
import { riskCommand } from "./risk"
import { causalityCommand } from "./causality"
import { syncCommand } from "./sync"
import { exportCommand } from "./export"
import { importCommand } from "./import"
import { serveCommand } from "./serve"
import { statusCommand } from "./status"

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
			export: exportCommand,
			import: importCommand,
			serve: serveCommand,
			status: statusCommand,
		},
	})

	await run(cli, process.argv.slice(2))
}

main().catch((err) => {
	console.error("Error:", err.message)
	process.exit(1)
})
