import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "candidate.prior_verdicts",
	category: "candidate",
	description: "Check if a candidate commit was examined in prior investigations",

	sql: `
SELECT
    ic.verdict,
    ic.rejection_reason,
    ic.reasoning,
    ci.bug_fix_sha,
    bf.message AS bug_fix_message,
    ci.conclusion_type,
    ci.completed_at
FROM investigation_candidates ic
JOIN causality_investigations ci ON ic.investigation_id = ci.id
JOIN commits bf ON ci.bug_fix_sha = bf.sha
WHERE ic.candidate_sha = $candidate_sha
AND ci.completed_at IS NOT NULL
ORDER BY ci.completed_at DESC
`,

	parameters: [
		{
			name: "candidate_sha",
			type: "text",
			description: "The commit SHA to check",
			required: true,
		},
	],

	example: {
		candidate_sha: "abc123def456789",
	},

	notes: "Run this on each candidate to avoid redundant analysis and learn from past verdicts.",
}

export default query
