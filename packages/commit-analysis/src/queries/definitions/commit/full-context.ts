import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "commit.full_context",
	category: "commit",
	description: "Get complete context for a commit including classification and risk score",

	sql: `
SELECT
    c.sha,
    c.short_sha,
    c.author,
    c.author_email,
    c.date,
    c.message,
    c.message_type,
    c.message_scope,
    c.pr_number,
    c.files_changed,
    c.insertions,
    c.deletions,
    c.analyzed_at,
    c.deep_analyzed_at,
    cl.category,
    cl.confidence,
    cl.risk_score,
    cl.flags
FROM commits c
LEFT JOIN classifications cl ON c.sha = cl.commit_sha
WHERE c.sha = $sha
`,

	parameters: [
		{
			name: "sha",
			type: "text",
			description: "The full commit SHA to look up",
			required: true,
		},
	],

	example: {
		sha: "abc123def456789",
	},

	notes: "Start every investigation by running this query on the bug fix commit.",
}

export default query
