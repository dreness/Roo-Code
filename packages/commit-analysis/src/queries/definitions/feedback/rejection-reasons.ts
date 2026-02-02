import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "feedback.rejection_reasons",
	category: "feedback",
	description: "Analyze common reasons for rejecting automated findings",

	sql: `
SELECT
    ic.rejection_reason,
    COUNT(*) AS occurrences,
    GROUP_CONCAT(DISTINCT ci.bug_fix_sha) AS example_fixes
FROM investigation_candidates ic
JOIN causality_investigations ci ON ic.investigation_id = ci.id
WHERE ic.verdict = 'ruled_out'
AND ic.rejection_reason IS NOT NULL
AND ci.completed_at IS NOT NULL
GROUP BY ic.rejection_reason
ORDER BY occurrences DESC
`,

	parameters: [],

	example: {},

	notes: "Identifies patterns in what automation gets wrong.",
}

export default query
