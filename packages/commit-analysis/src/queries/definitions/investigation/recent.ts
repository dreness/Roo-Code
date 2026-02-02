import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "investigation.recent",
	category: "investigation",
	description: "List recently completed investigations",

	sql: `
SELECT
    ci.id,
    ci.bug_fix_sha,
    bf.message AS bug_fix_message,
    ci.investigator,
    ci.completed_at,
    ci.conclusion_type,
    ci.confidence_override,
    (SELECT COUNT(*) FROM investigation_candidates WHERE investigation_id = ci.id) AS candidates_examined
FROM causality_investigations ci
JOIN commits bf ON ci.bug_fix_sha = bf.sha
WHERE ci.completed_at IS NOT NULL
ORDER BY ci.completed_at DESC
LIMIT $limit
`,

	parameters: [
		{
			name: "limit",
			type: "integer",
			description: "Maximum number of results",
			required: false,
			default: 20,
		},
	],

	example: {
		limit: 20,
	},
}

export default query
