import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "investigation.for_commit",
	category: "investigation",
	description: "Get all investigations for a specific bug fix commit",

	sql: `
SELECT
    ci.id,
    ci.investigator,
    ci.started_at,
    ci.completed_at,
    ci.conclusion_type,
    ci.final_cause_sha,
    fc.message AS final_cause_message,
    ci.confidence_override,
    ci.summary
FROM causality_investigations ci
LEFT JOIN commits fc ON ci.final_cause_sha = fc.sha
WHERE ci.bug_fix_sha = $bug_fix_sha
ORDER BY ci.completed_at DESC NULLS FIRST
`,

	parameters: [
		{
			name: "bug_fix_sha",
			type: "text",
			description: "The bug fix commit SHA",
			required: true,
		},
	],

	example: {
		bug_fix_sha: "abc123def456789",
	},

	notes: "Always check this before starting to avoid duplicate investigations.",
}

export default query
