import { command, option, number } from "cmd-ts"

export const serveCommand = command({
	name: "serve",
	description: "Start the web UI server",
	args: {
		port: option({
			type: number,
			long: "port",
			short: "p",
			description: "Port to listen on",
			defaultValue: () => 3001,
		}),
	},
	handler: async (args) => {
		console.log(`Starting web UI on port ${args.port}...`)
		console.log("")
		console.log("The web UI is implemented as a separate Next.js app.")
		console.log("To start it, run:")
		console.log("")
		console.log("  cd apps/web-commit-analysis")
		console.log("  pnpm dev")
		console.log("")
		console.log(`Or use: pnpm --filter @roo-code/web-commit-analysis dev`)
	},
})
