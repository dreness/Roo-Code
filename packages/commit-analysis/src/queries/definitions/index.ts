/**
 * Query Definitions Index
 *
 * Exports all query definitions organized by category.
 */

import { commitQueries } from "./commit"
import { causalityQueries } from "./causality"
import { investigationQueries } from "./investigation"
import { candidateQueries } from "./candidate"
import { regressionQueries } from "./regression"
import { feedbackQueries } from "./feedback"
import { statsQueries } from "./stats"
import type { QueryDefinition, QueryRegistry } from "../types"

/** All query definitions */
export const allQueries: QueryDefinition[] = [
	...commitQueries,
	...causalityQueries,
	...investigationQueries,
	...candidateQueries,
	...regressionQueries,
	...feedbackQueries,
	...statsQueries,
]

/** Query registry map (name -> definition) */
export const queryRegistry: QueryRegistry = new Map(allQueries.map((q) => [q.name, q]))

/** Get all queries in a category */
export function getQueriesByCategory(category: string): QueryDefinition[] {
	return allQueries.filter((q) => q.category === category)
}

/** Get all category names */
export function getCategories(): string[] {
	return [...new Set(allQueries.map((q) => q.category))]
}

/** Get a query by name */
export function getQuery(name: string): QueryDefinition | undefined {
	return queryRegistry.get(name)
}

/** List all query names */
export function listQueryNames(): string[] {
	return allQueries.map((q) => q.name)
}

// Re-export individual category modules
export * from "./commit"
export * from "./causality"
export * from "./candidate"
export * from "./feedback"
export * from "./stats"
// Export investigation with aliases to avoid conflicts
export {
	forCommit,
	fullDetails,
	candidates,
	evidence,
	recent,
	bySubsystem as investigationBySubsystem,
	inProgress,
	byConclusion,
} from "./investigation"
// Export regression with aliases to avoid conflicts
export { bySubsystem as regressionBySubsystem, active } from "./regression"
