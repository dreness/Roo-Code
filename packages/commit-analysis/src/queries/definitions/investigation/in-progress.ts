import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "investigation.in_progress",
	category: "investigation",
	description: "Find investigations that were started but not completed",

	sql: `
SELECT
    ci.id,
    ci.bug_fix_sha,
    bf.message AS bug_fix_message,
    ci.investigator,
    ci.started_at,
    (SELECT COUNT(*) FROM investigation_candidates WHERE investigation_id = ci.id) AS candidates_so_far
FROM causality_investigations ci
JOIN commits bf ON ci.bug_fix_sha = bf.sha
WHERE ci.completed_at IS NULL
ORDER BY ci.started_at DESC
`,

	parameters: [],

	example: {},
}

export default query
