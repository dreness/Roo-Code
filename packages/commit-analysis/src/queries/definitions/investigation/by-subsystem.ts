import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "investigation.by_subsystem",
	category: "investigation",
	description: "Find investigations in the same subsystems as a commit",

	sql: `
SELECT DISTINCT
    ci.id,
    ci.bug_fix_sha,
    bf.message AS bug_fix_message,
    ci.conclusion_type,
    ci.confidence_override,
    ci.completed_at
FROM causality_investigations ci
JOIN commits bf ON ci.bug_fix_sha = bf.sha
JOIN file_changes fc ON bf.sha = fc.commit_sha
WHERE fc.subsystem IN (
    SELECT DISTINCT subsystem
    FROM file_changes
    WHERE commit_sha = $sha
    AND subsystem IS NOT NULL
)
AND ci.completed_at IS NOT NULL
ORDER BY ci.completed_at DESC
LIMIT 10
`,

	parameters: [
		{
			name: "sha",
			type: "text",
			description: "Commit SHA to find subsystems for",
			required: true,
		},
	],

	example: {
		sha: "abc123def456789",
	},

	notes: "Useful for finding similar investigations that may provide insights.",
}

export default query
