import { command, option, number, flag } from "cmd-ts"
import { execa } from "execa"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

export const serveCommand = command({
	name: "serve",
	description: "Start the web UI server",
	args: {
		port: option({
			type: number,
			long: "port",
			short: "p",
			description: "Port to listen on",
			defaultValue: () => 3447,
		}),
		detached: flag({
			long: "detached",
			short: "d",
			description: "Run in background (detached mode)",
			defaultValue: () => false,
		}),
	},
	handler: async (args) => {
		// Find the web-commit-analysis app directory
		// Navigate from packages/commit-analysis/src/cli to apps/web-commit-analysis
		const webAppDir = resolve(__dirname, "../../../../apps/web-commit-analysis")

		console.log(`Starting commit-analysis web UI on http://localhost:${args.port}`)
		console.log("")

		try {
			if (args.detached) {
				// Spawn in background
				const subprocess = execa("pnpm", ["dev", "-p", String(args.port)], {
					cwd: webAppDir,
					detached: true,
					stdio: "ignore",
				})
				subprocess.unref()
				console.log(`Web UI started in background (PID: ${subprocess.pid})`)
				console.log(`Visit: http://localhost:${args.port}`)
			} else {
				// Run interactively
				console.log("Press Ctrl+C to stop the server")
				console.log("")

				await execa("pnpm", ["dev", "-p", String(args.port)], {
					cwd: webAppDir,
					stdio: "inherit",
				})
			}
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				console.error("Error: Could not find the web-commit-analysis app.")
				console.error(`Expected location: ${webAppDir}`)
				console.error("")
				console.error("Make sure you're running from the Roo Code repository.")
				process.exit(1)
			}
			throw error
		}
	},
})
