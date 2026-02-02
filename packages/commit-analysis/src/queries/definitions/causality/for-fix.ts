import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "causality.for_fix",
	category: "causality",
	description: "Get all known causality links for a bug fix commit",

	sql: `
SELECT
    bc.id,
    bc.cause_sha,
    c.message AS cause_message,
    c.date AS cause_date,
    bc.relationship_type,
    bc.confidence,
    bc.bug_age,
    bc.bug_age_commits,
    bc.analysis_method,
    bc.human_verified,
    bc.human_confidence,
    bc.automation_was_correct,
    bc.investigation_id,
    bc.notes
FROM bug_causality bc
JOIN commits c ON bc.cause_sha = c.sha
WHERE bc.bug_fix_sha = $bug_fix_sha
ORDER BY bc.confidence DESC
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

	notes: "Check this before investigating to see what automation found.",
}

export default query
