import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "candidate.by_author_in_subsystem",
	category: "candidate",
	description: "Find commits by an author in specific subsystems",

	sql: `
SELECT DISTINCT
    c.sha,
    c.short_sha,
    c.message,
    c.date,
    cl.category,
    cl.risk_score,
    GROUP_CONCAT(DISTINCT fc.subsystem) AS subsystems
FROM commits c
JOIN file_changes fc ON c.sha = fc.commit_sha
LEFT JOIN classifications cl ON c.sha = cl.commit_sha
WHERE c.author_email = $author_email
AND fc.subsystem IN ($subsystems)
AND c.date < datetime($before_date, 'unixepoch')
GROUP BY c.sha
ORDER BY c.date DESC
LIMIT 20
`,

	parameters: [
		{
			name: "author_email",
			type: "text",
			description: "Author email",
			required: true,
		},
		{
			name: "subsystems",
			type: "text[]",
			description: "List of subsystem names",
			required: true,
		},
		{
			name: "before_date",
			type: "timestamp",
			description: "Unix timestamp",
			required: true,
		},
	],

	example: {
		author_email: "developer@example.com",
		subsystems: ["provider"],
		before_date: 1706745600,
	},

	notes: "Useful for pattern detection when an author's commits frequently cause issues.",
}

export default query
