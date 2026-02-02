import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "commit.files_changed",
	category: "commit",
	description: "List all files changed in a commit with their subsystems",

	sql: `
SELECT
    file_path,
    change_type,
    insertions,
    deletions,
    subsystem
FROM file_changes
WHERE commit_sha = $sha
ORDER BY subsystem, file_path
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
