import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "causality.caused_by",
	category: "causality",
	description: "Find all bugs that were caused by a specific commit",

	sql: `
SELECT
    bc.id,
    bc.bug_fix_sha,
    bf.message AS fix_message,
    bf.date AS fix_date,
    bc.relationship_type,
    bc.confidence,
    bc.bug_age,
    bc.analysis_method,
    bc.human_verified
FROM bug_causality bc
JOIN commits bf ON bc.bug_fix_sha = bf.sha
WHERE bc.cause_sha = $cause_sha
ORDER BY bf.date DESC
`,

	parameters: [
		{
			name: "cause_sha",
			type: "text",
			description: "The commit SHA that may have caused bugs",
			required: true,
		},
	],

	example: {
		cause_sha: "abc123def456789",
	},
}

export default query
