import { command, flag, boolean, option, string, optional, multioption, positional, array } from "cmd-ts"

export const queryCommand = command({
	name: "query",
	description: "Run named queries from the Investigative Analysis query library",
	args: {
		queryName: positional({
			type: optional(string),
			description: "Query name to run (e.g., commit.full_context)",
			displayName: "query",
		}),
		list: flag({
			type: boolean,
			long: "list",
			short: "l",
			description: "List all available queries",
			defaultValue: () => false,
		}),
		docs: option({
			type: optional(string),
			long: "docs",
			short: "d",
			description: "Show documentation for a specific query",
		}),
		category: option({
			type: optional(string),
			long: "category",
			short: "c",
			description: "Filter queries by category",
		}),
		param: multioption({
			type: array(string),
			long: "param",
			short: "p",
			description: "Query parameter in key=value format (can be repeated)",
		}),
		format: option({
			type: optional(string),
			long: "format",
			short: "f",
			description: "Output format: table, json, or csv",
		}),
		limit: option({
			type: optional(string),
			long: "limit",
			description: "Maximum rows to return",
		}),
		sql: flag({
			type: boolean,
			long: "sql",
			description: "Show the resolved SQL query",
			defaultValue: () => false,
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const { listQueries, getQueryDocs, runQuery, formatResults, getQueriesByCategory, getCategories, getQuery } =
			await import("../queries")

		// List queries
		if (args.list) {
			const queries = args.category ? getQueriesByCategory(args.category) : listQueries()

			if (queries.length === 0) {
				console.log(args.category ? `No queries found in category: ${args.category}` : "No queries available")
				return
			}

			console.log("\n📚 AVAILABLE QUERIES\n")

			if (args.category) {
				console.log(`Category: ${args.category}\n`)
				for (const q of queries) {
					console.log(`  ${q.name}`)
					console.log(`    ${q.description}\n`)
				}
			} else {
				// Group by category
				const categories = getCategories()
				for (const cat of categories) {
					const catQueries = getQueriesByCategory(cat)
					console.log(`${cat.toUpperCase()}:`)
					for (const q of catQueries) {
						console.log(`  ${q.name.padEnd(35)} ${q.description.slice(0, 50)}`)
					}
					console.log("")
				}
			}

			console.log("Use --docs <query-name> for detailed documentation")
			return
		}

		// Show documentation
		if (args.docs) {
			const docs = getQueryDocs(args.docs)
			if (!docs) {
				console.error(`Unknown query: ${args.docs}`)
				console.error("Use --list to see available queries")
				process.exit(1)
			}
			console.log(docs)
			return
		}

		// Run a query
		if (!args.queryName) {
			console.error("Please specify a query name or use --list to see available queries")
			console.error("\nUsage:")
			console.error("  pnpm cli query <query-name> --param key=value")
			console.error("  pnpm cli query --list")
			console.error("  pnpm cli query --docs <query-name>")
			process.exit(1)
		}

		// Verify query exists
		const queryDef = getQuery(args.queryName)
		if (!queryDef) {
			console.error(`Unknown query: ${args.queryName}`)
			console.error("Use --list to see available queries")
			process.exit(1)
		}

		// Parse parameters
		const params: Record<string, unknown> = {}
		for (const p of args.param) {
			const eqIndex = p.indexOf("=")
			if (eqIndex === -1) {
				console.error(`Invalid parameter format: ${p}`)
				console.error("Use key=value format (e.g., --param sha=abc123)")
				process.exit(1)
			}
			const key = p.slice(0, eqIndex)
			let value: unknown = p.slice(eqIndex + 1)

			// Find the parameter definition to determine type
			const paramDef = queryDef.parameters.find((pd) => pd.name === key)
			if (paramDef) {
				switch (paramDef.type) {
					case "integer":
					case "timestamp":
						value = parseInt(value as string, 10)
						if (isNaN(value as number)) {
							console.error(`Parameter ${key} must be an integer`)
							process.exit(1)
						}
						break
					case "real":
						value = parseFloat(value as string)
						if (isNaN(value as number)) {
							console.error(`Parameter ${key} must be a number`)
							process.exit(1)
						}
						break
					case "boolean":
						value = value === "true" || value === "1"
						break
					case "text[]":
						value = (value as string).split(",").map((s) => s.trim())
						break
				}
			}

			params[key] = value
		}

		// Check for missing required parameters
		const missingParams = queryDef.parameters
			.filter((p) => p.required !== false && params[p.name] === undefined && p.default === undefined)
			.map((p) => p.name)

		if (missingParams.length > 0) {
			console.error(`Missing required parameters: ${missingParams.join(", ")}`)
			console.error("\nRequired parameters:")
			for (const p of queryDef.parameters.filter((p) => p.required !== false)) {
				console.error(`  --param ${p.name}=<${p.type}>  ${p.description}`)
			}
			process.exit(1)
		}

		// Run query
		try {
			const result = await runQuery(args.queryName, params, {
				limit: args.limit ? parseInt(args.limit, 10) : undefined,
			})

			// Show SQL if requested
			if (args.sql) {
				console.log("Resolved SQL:")
				console.log("─".repeat(60))
				console.log(result.resolvedSql)
				console.log("─".repeat(60))
				console.log("")
			}

			// Format and output results
			const format = (args.format as "table" | "json" | "csv") || "table"
			console.log(formatResults(result, format))
		} catch (err) {
			console.error("Query failed:", err instanceof Error ? err.message : String(err))
			process.exit(1)
		}
	},
})
