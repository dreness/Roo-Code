import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "investigation.full_details",
	category: "investigation",
	description: "Get complete investigation details including the bug fix context",

	sql: `
SELECT
    ci.id,
    ci.bug_fix_sha,
    bf.message AS bug_fix_message,
    ci.investigator,
    ci.started_at,
    ci.completed_at,
    ci.conclusion_type,
    ci.final_cause_sha,
    ci.confidence_override,
    ci.summary
FROM causality_investigations ci
JOIN commits bf ON ci.bug_fix_sha = bf.sha
WHERE ci.id = $investigation_id
`,

	parameters: [
		{
			name: "investigation_id",
			type: "integer",
			description: "The investigation ID",
			required: true,
		},
	],

	example: {
		investigation_id: 123,
	},
}

export default query
