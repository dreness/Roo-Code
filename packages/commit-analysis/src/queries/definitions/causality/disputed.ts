import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "causality.disputed",
	category: "causality",
	description: "Find commits with multiple causality candidates at similar confidence levels",

	sql: `
SELECT
    bug_fix_sha,
    COUNT(*) AS candidate_count,
    MAX(confidence) AS max_confidence,
    MIN(confidence) AS min_confidence,
    MAX(confidence) - MIN(confidence) AS confidence_gap
FROM bug_causality
WHERE human_verified = 0 OR human_verified IS NULL
GROUP BY bug_fix_sha
HAVING COUNT(*) > 1
AND (MAX(confidence) - MIN(confidence)) <= $confidence_gap
ORDER BY candidate_count DESC
`,

	parameters: [
		{
			name: "confidence_gap",
			type: "real",
			description: "Maximum gap between top candidates (e.g., 0.15)",
			required: true,
		},
	],

	example: {
		confidence_gap: 0.15,
	},

	notes: "Disputed causality indicates cases where human judgment is especially valuable.",
}

export default query
