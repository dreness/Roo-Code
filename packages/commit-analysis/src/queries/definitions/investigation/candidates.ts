import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "investigation.candidates",
	category: "investigation",
	description: "Get all candidates examined in an investigation",

	sql: `
SELECT
    ic.id,
    ic.candidate_sha,
    c.message AS candidate_message,
    c.date AS candidate_date,
    ic.verdict,
    ic.rejection_reason,
    ic.reasoning,
    ic.order_examined
FROM investigation_candidates ic
JOIN commits c ON ic.candidate_sha = c.sha
WHERE ic.investigation_id = $investigation_id
ORDER BY ic.order_examined
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
