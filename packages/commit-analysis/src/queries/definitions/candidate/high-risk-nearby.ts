import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "candidate.high_risk_nearby",
	category: "candidate",
	description: "Find high-risk commits in the same subsystems before a given date",

	sql: `
SELECT DISTINCT
    c.sha,
    c.short_sha,
    c.message,
    c.date,
    cl.category,
    cl.risk_score,
    cl.flags,
    GROUP_CONCAT(DISTINCT fc.subsystem) AS subsystems
FROM commits c
JOIN classifications cl ON c.sha = cl.commit_sha
JOIN file_changes fc ON c.sha = fc.commit_sha
WHERE fc.subsystem IN ($subsystems)
AND c.date < datetime($before_date, 'unixepoch')
AND c.date > datetime($before_date - ($days_back * 86400), 'unixepoch')
AND cl.risk_score >= $risk_threshold
GROUP BY c.sha
ORDER BY cl.risk_score DESC, c.date DESC
`,

	parameters: [
		{
			name: "subsystems",
			type: "text[]",
			description: "List of subsystem names (comma-separated for raw SQL)",
			required: true,
		},
		{
			name: "before_date",
			type: "timestamp",
			description: "Unix timestamp (usually the bug fix date)",
			required: true,
		},
		{
			name: "risk_threshold",
			type: "real",
			description: "Minimum risk score",
			required: false,
			default: 40,
		},
		{
			name: "days_back",
			type: "integer",
			description: "How many days to look back",
			required: false,
			default: 30,
		},
	],

	example: {
		subsystems: ["provider", "api"],
		before_date: 1706745600,
		risk_threshold: 40,
		days_back: 30,
	},
}

export default query
