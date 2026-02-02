import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "commit.subsystems",
	category: "commit",
	description: "Get distinct subsystems affected by a commit",

	sql: `
SELECT DISTINCT subsystem
FROM file_changes
WHERE commit_sha = $sha
AND subsystem IS NOT NULL
ORDER BY subsystem
`,

	parameters: [
		{
			name: "sha",
			type: "text",
			description: "The commit SHA",
			required: true,
		},
	],

	example: {
		sha: "abc123def456789",
	},
}

export default query
