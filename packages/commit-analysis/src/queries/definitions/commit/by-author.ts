import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "commit.by_author",
	category: "commit",
	description: "Find commits by a specific author",

	sql: `
SELECT
    c.sha,
    c.short_sha,
    c.date,
    c.message,
    cl.category,
    cl.risk_score
FROM commits c
LEFT JOIN classifications cl ON c.sha = cl.commit_sha
WHERE c.author_email = $author_email
ORDER BY c.date DESC
`,

	parameters: [
		{
			name: "author_email",
			type: "text",
			description: "Author email address",
			required: true,
		},
	],

	example: {
		author_email: "developer@example.com",
	},
}

export default query
