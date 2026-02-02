/**
 * Query Runner
 *
 * Executes named queries with parameter substitution and validation.
 * Can be used as both a library and CLI.
 */

import { getQuery, queryRegistry } from "./definitions"
import type { QueryDefinition, QueryParams, QueryResult, QueryOptions } from "./types"
import { getDb, type DatabaseClient } from "../db/db"

/**
 * Validates parameters against a query definition
 */
export function validateParams(query: QueryDefinition, params: QueryParams): { valid: boolean; errors: string[] } {
	const errors: string[] = []

	for (const param of query.parameters) {
		const value = params[param.name]

		if (param.required && value === undefined && param.default === undefined) {
			errors.push(`Missing required parameter: ${param.name}`)
			continue
		}

		if (value !== undefined) {
			// Type validation
			const actualType = typeof value
			const isArray = Array.isArray(value)

			switch (param.type) {
				case "text":
					if (actualType !== "string") {
						errors.push(`Parameter ${param.name} must be a string, got ${actualType}`)
					}
					break
				case "integer":
					if (actualType !== "number" || !Number.isInteger(value)) {
						errors.push(`Parameter ${param.name} must be an integer`)
					}
					break
				case "real":
					if (actualType !== "number") {
						errors.push(`Parameter ${param.name} must be a number, got ${actualType}`)
					}
					break
				case "timestamp":
					if (actualType !== "number" || !Number.isInteger(value)) {
						errors.push(`Parameter ${param.name} must be a Unix timestamp (integer)`)
					}
					break
				case "text[]":
					if (!isArray || !value.every((v: unknown) => typeof v === "string")) {
						errors.push(`Parameter ${param.name} must be an array of strings`)
					}
					break
				case "boolean":
					if (actualType !== "boolean") {
						errors.push(`Parameter ${param.name} must be a boolean, got ${actualType}`)
					}
					break
			}
		}
	}

	return { valid: errors.length === 0, errors }
}

/**
 * Resolves parameters in SQL query string
 */
export function resolveSql(query: QueryDefinition, params: QueryParams): string {
	let sql = query.sql

	for (const param of query.parameters) {
		const value = params[param.name] ?? param.default
		const _placeholder = `$${param.name}`

		if (value === undefined) {
			continue
		}

		// Convert value to SQL-safe string
		let sqlValue: string

		switch (param.type) {
			case "text":
				sqlValue = `'${String(value).replace(/'/g, "''")}'`
				break
			case "integer":
			case "real":
			case "timestamp":
				sqlValue = String(value)
				break
			case "text[]":
				// Convert array to comma-separated quoted strings
				if (Array.isArray(value)) {
					sqlValue = value.map((v) => `'${String(v).replace(/'/g, "''")}'`).join(", ")
				} else {
					sqlValue = `'${String(value).replace(/'/g, "''")}'`
				}
				break
			case "boolean":
				sqlValue = value ? "1" : "0"
				break
			default:
				sqlValue = `'${String(value).replace(/'/g, "''")}'`
		}

		// Replace all occurrences of the placeholder
		sql = sql.replace(new RegExp(`\\$${param.name}\\b`, "g"), sqlValue)
	}

	return sql.trim()
}

/**
 * Runs a query by name with the given parameters
 */
export async function runQuery<T = Record<string, unknown>>(
	queryName: string,
	params: QueryParams = {},
	options: QueryOptions = {},
	db?: DatabaseClient,
): Promise<QueryResult<T>> {
	const query = getQuery(queryName)
	if (!query) {
		throw new Error(`Unknown query: ${queryName}. Use listQueries() to see available queries.`)
	}

	return runQueryDef<T>(query, params, options, db)
}

/**
 * Runs a query definition directly
 */
export async function runQueryDef<T = Record<string, unknown>>(
	query: QueryDefinition,
	params: QueryParams = {},
	options: QueryOptions = {},
	db?: DatabaseClient,
): Promise<QueryResult<T>> {
	// Validate parameters
	const validation = validateParams(query, params)
	if (!validation.valid) {
		throw new Error(`Parameter validation failed:\n${validation.errors.join("\n")}`)
	}

	// Resolve SQL
	const resolvedSql = resolveSql(query, params)

	// Apply limit if specified
	let finalSql = resolvedSql
	if (options.limit && !resolvedSql.toLowerCase().includes("limit")) {
		finalSql = `${resolvedSql}\nLIMIT ${options.limit}`
	}

	// Get database connection
	const database = db ?? getDb()

	// Execute query
	const startTime = performance.now()
	const sqlite = (database as unknown as { $client: { prepare: (sql: string) => { all: () => T[] } } }).$client
	const stmt = sqlite.prepare(finalSql)
	const rows = stmt.all() as T[]
	const endTime = performance.now()

	return {
		query: query.name,
		resolvedSql: finalSql,
		rows,
		rowCount: rows.length,
		executionTimeMs: Math.round(endTime - startTime),
	}
}

/**
 * Lists all available queries
 */
export function listQueries(): Array<{ name: string; category: string; description: string }> {
	return [...queryRegistry.values()].map((q) => ({
		name: q.name,
		category: q.category,
		description: q.description,
	}))
}

/**
 * Gets query documentation
 */
export function getQueryDocs(queryName: string): string | null {
	const query = getQuery(queryName)
	if (!query) {
		return null
	}

	const lines: string[] = []
	lines.push(`# ${query.name}`)
	lines.push("")
	lines.push(`**Category:** ${query.category}`)
	lines.push("")
	lines.push(`**Description:** ${query.description}`)
	lines.push("")

	if (query.notes) {
		lines.push(`**Notes:** ${query.notes}`)
		lines.push("")
	}

	lines.push("## Parameters")
	lines.push("")

	if (query.parameters.length === 0) {
		lines.push("_No parameters required._")
	} else {
		lines.push("| Name | Type | Required | Default | Description |")
		lines.push("|------|------|----------|---------|-------------|")

		for (const param of query.parameters) {
			const required = param.required !== false ? "Yes" : "No"
			const defaultVal = param.default !== undefined ? String(param.default) : "-"
			lines.push(`| \`${param.name}\` | ${param.type} | ${required} | ${defaultVal} | ${param.description} |`)
		}
	}

	lines.push("")
	lines.push("## SQL")
	lines.push("")
	lines.push("```sql")
	lines.push(query.sql.trim())
	lines.push("```")

	if (query.example && Object.keys(query.example).length > 0) {
		lines.push("")
		lines.push("## Example")
		lines.push("")
		lines.push("```json")
		lines.push(JSON.stringify(query.example, null, 2))
		lines.push("```")
	}

	return lines.join("\n")
}

/**
 * Formats query results for display
 */
export function formatResults<T>(result: QueryResult<T>, format: "json" | "table" | "csv" = "table"): string {
	switch (format) {
		case "json": {
			return JSON.stringify(
				{
					query: result.query,
					rowCount: result.rowCount,
					executionTimeMs: result.executionTimeMs,
					rows: result.rows,
				},
				null,
				2,
			)
		}

		case "csv": {
			if (result.rows.length === 0) {
				return ""
			}
			const headers = Object.keys(result.rows[0] as Record<string, unknown>)
			const csvLines = [headers.join(",")]
			for (const row of result.rows) {
				const values = headers.map((h) => {
					const val = (row as Record<string, unknown>)[h]
					if (val === null || val === undefined) return ""
					const str = String(val)
					// Escape quotes and wrap in quotes if contains comma
					if (str.includes(",") || str.includes('"') || str.includes("\n")) {
						return `"${str.replace(/"/g, '""')}"`
					}
					return str
				})
				csvLines.push(values.join(","))
			}
			return csvLines.join("\n")
		}

		case "table":
		default: {
			if (result.rows.length === 0) {
				return `Query: ${result.query}\nNo results. (${result.executionTimeMs}ms)`
			}

			const cols = Object.keys(result.rows[0] as Record<string, unknown>)
			const colWidths = cols.map((col) => {
				const values = result.rows.map((row) => String((row as Record<string, unknown>)[col] ?? ""))
				return Math.min(40, Math.max(col.length, ...values.map((v) => v.length)))
			})

			const header = cols.map((col, i) => col.padEnd(colWidths[i])).join(" | ")
			const separator = colWidths.map((w) => "-".repeat(w)).join("-+-")

			const rows = result.rows.map((row) =>
				cols
					.map((col, i) => {
						const val = String((row as Record<string, unknown>)[col] ?? "")
						return val.length > colWidths[i]
							? val.slice(0, colWidths[i] - 3) + "..."
							: val.padEnd(colWidths[i])
					})
					.join(" | "),
			)

			return [
				`Query: ${result.query} (${result.rowCount} rows, ${result.executionTimeMs}ms)`,
				"",
				header,
				separator,
				...rows,
			].join("\n")
		}
	}
}
