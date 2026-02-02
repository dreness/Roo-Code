import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "candidate.recent_in_files",
	category: "candidate",
	description: "Find recent commits that touched specific files",

	sql: `
SELECT DISTINCT
    c.sha,
    c.short_sha,
    c.message,
    c.date,
    c.author,
    cl.category,
    cl.risk_score,
    fc.file_path,
    fc.change_type
FROM commits c
JOIN file_changes fc ON c.sha = fc.commit_sha
LEFT JOIN classifications cl ON c.sha = cl.commit_sha
WHERE fc.file_path IN ($file_paths)
AND c.date < datetime($before_date, 'unixepoch')
AND c.date > datetime($before_date - ($days_back * 86400), 'unixepoch')
ORDER BY c.date DESC
`,

	parameters: [
		{
			name: "file_paths",
			type: "text[]",
			description: "List of file paths",
			required: true,
		},
		{
			name: "before_date",
			type: "timestamp",
			description: "Unix timestamp",
			required: true,
		},
		{
			name: "days_back",
			type: "integer",
			description: "How many days to look back",
			required: false,
			default: 14,
		},
	],

	example: {
		file_paths: ["src/api/providers/openai.ts"],
		before_date: 1706745600,
		days_back: 14,
	},
}

export default query
