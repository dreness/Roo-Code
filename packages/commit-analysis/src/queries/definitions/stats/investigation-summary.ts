import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "stats.investigation_summary",
	category: "stats",
	description: "Get a summary of all investigation activity",

	sql: `
SELECT
    (SELECT COUNT(*) FROM causality_investigations) AS total_investigations,
    (SELECT COUNT(*) FROM causality_investigations WHERE completed_at IS NOT NULL) AS completed,
    (SELECT COUNT(*) FROM causality_investigations WHERE completed_at IS NULL) AS in_progress,
    (SELECT COUNT(*) FROM investigation_candidates) AS total_candidates_examined,
    (SELECT COUNT(*) FROM investigation_evidence) AS total_evidence_captured,
    (SELECT COUNT(DISTINCT investigator) FROM causality_investigations) AS unique_investigators,
    (SELECT AVG(
        CAST((julianday(completed_at) - julianday(started_at)) * 24 * 60 AS INTEGER)
    ) FROM causality_investigations WHERE completed_at IS NOT NULL) AS avg_duration_minutes
`,

	parameters: [],

	example: {},
}

export default query
