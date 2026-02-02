import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "candidate.with_flags",
	category: "candidate",
	description: "Find commits with specific classification flags",

	sql: `
SELECT
    c.sha,
    c.short_sha,
    c.message,
    c.date,
    cl.category,
    cl.risk_score,
    cl.flags
FROM commits c
JOIN classifications cl ON c.sha = cl.commit_sha
WHERE cl.flags LIKE '%' || $flag || '%'
AND c.date < datetime($before_date, 'unixepoch')
ORDER BY c.date DESC
`,

	parameters: [
		{
			name: "flag",
			type: "text",
			description: "The flag to search for (e.g., 'touches_critical_path')",
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
		flag: "touches_critical_path",
		before_date: 1706745600,
	},
}

export default query
