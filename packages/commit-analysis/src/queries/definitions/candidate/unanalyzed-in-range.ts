import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "candidate.unanalyzed_in_range",
	category: "candidate",
	description: "Find commits that haven't been deep-analyzed in a date range",

	sql: `
SELECT
    c.sha,
    c.short_sha,
    c.message,
    c.date,
    cl.category,
    cl.risk_score
FROM commits c
LEFT JOIN classifications cl ON c.sha = cl.commit_sha
WHERE c.date >= datetime($start_date, 'unixepoch')
AND c.date <= datetime($end_date, 'unixepoch')
AND c.deep_analyzed_at IS NULL
ORDER BY c.date DESC
`,

	parameters: [
		{
			name: "start_date",
			type: "timestamp",
			description: "Unix timestamp",
			required: true,
		},
		{
			name: "end_date",
			type: "timestamp",
			description: "Unix timestamp",
			required: true,
		},
	],

	example: {
		start_date: 1704067200,
		end_date: 1706745600,
	},
}

export default query
