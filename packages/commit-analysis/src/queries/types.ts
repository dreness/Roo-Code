/**
 * Query definition types for the Investigative Analysis query library
 */

/** Supported parameter types */
export type ParameterType = "text" | "integer" | "real" | "timestamp" | "text[]" | "boolean"

/** Parameter definition */
export interface ParameterDef {
	name: string
	type: ParameterType
	description: string
	required?: boolean
	default?: unknown
}

/** Query definition */
export interface QueryDefinition {
	/** Unique query name (e.g., "commit.full_context") */
	name: string

	/** Human-readable description */
	description: string

	/** Category for organization */
	category: string

	/** The SQL query with $param placeholders */
	sql: string

	/** Parameter definitions */
	parameters: ParameterDef[]

	/** Example parameter values for documentation */
	example?: Record<string, unknown>

	/** Additional notes or usage tips */
	notes?: string
}

/** Result of running a query */
export interface QueryResult<T = Record<string, unknown>> {
	/** The query that was run */
	query: string

	/** Resolved SQL with parameters substituted */
	resolvedSql: string

	/** Result rows */
	rows: T[]

	/** Number of rows returned */
	rowCount: number

	/** Execution time in milliseconds */
	executionTimeMs: number
}

/** Query execution options */
export interface QueryOptions {
	/** Maximum rows to return (default: 1000) */
	limit?: number

	/** Output format */
	format?: "json" | "table" | "csv"

	/** Include SQL in output */
	includeSql?: boolean
}

/** Parameter values passed to a query */
export type QueryParams = Record<string, unknown>

/** Registry of all available queries */
export type QueryRegistry = Map<string, QueryDefinition>
