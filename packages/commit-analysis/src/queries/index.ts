/**
 * Query Library
 *
 * A library of named, reusable SQL queries for Investigative Analysis.
 *
 * ## Usage as Library
 *
 * ```typescript
 * import { runQuery, listQueries, getQueryDocs } from '@roo-code/commit-analysis/queries'
 *
 * // List available queries
 * const queries = listQueries()
 *
 * // Get documentation for a query
 * const docs = getQueryDocs('commit.full_context')
 *
 * // Run a query
 * const result = await runQuery('commit.full_context', { sha: 'abc123' })
 * console.log(result.rows)
 * ```
 *
 * ## Usage as CLI
 *
 * ```bash
 * # List all queries
 * pnpm cli query --list
 *
 * # Show query documentation
 * pnpm cli query --docs commit.full_context
 *
 * # Run a query
 * pnpm cli query commit.full_context --param sha=abc123
 *
 * # Run with JSON output
 * pnpm cli query commit.full_context --param sha=abc123 --format json
 * ```
 */

// Re-export types
export * from "./types"

// Re-export definitions
export { allQueries, queryRegistry, getQueriesByCategory, getCategories, getQuery, listQueryNames } from "./definitions"

// Re-export runner functions
export { runQuery, runQueryDef, validateParams, resolveSql, listQueries, getQueryDocs, formatResults } from "./runner"
