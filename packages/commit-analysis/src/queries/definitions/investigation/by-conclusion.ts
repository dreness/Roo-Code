import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "investigation.by_conclusion",
	category: "investigation",
	description: "Find investigations by conclusion type",

	sql: `
SELECT
    ci.id,
    ci.bug_fix_sha,
    bf.message AS bug_fix_message,
    ci.final_cause_sha,
    ci.confidence_override,
    ci.summary,
    ci.completed_at
FROM causality_investigations ci
JOIN commits bf ON ci.bug_fix_sha = bf.sha
WHERE ci.conclusion_type = $conclusion_type
ORDER BY ci.completed_at DESC
`,

	parameters: [
		{
			name: "conclusion_type",
			type: "text",
			description: "One of: confirmed, rejected, inconclusive, new_cause_found",
			required: true,
		},
	],

	example: {
		conclusion_type: "new_cause_found",
	},
}

export default query
