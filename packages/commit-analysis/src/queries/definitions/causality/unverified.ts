import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "causality.unverified",
	category: "causality",
	description: "Find causality links that have not been human-verified",

	sql: `
SELECT
    bc.id,
    bc.bug_fix_sha,
    bf.message AS fix_message,
    bc.cause_sha,
    bc.confidence,
    bc.analysis_method,
    bf.date AS fix_date
FROM bug_causality bc
JOIN commits bf ON bc.bug_fix_sha = bf.sha
WHERE bc.human_verified = 0 OR bc.human_verified IS NULL
ORDER BY bc.confidence ASC, bf.date DESC
LIMIT $limit
`,

	parameters: [
		{
			name: "limit",
			type: "integer",
			description: "Maximum number of results",
			required: false,
			default: 50,
		},
	],

	example: {
		limit: 50,
	},
}

export default query
