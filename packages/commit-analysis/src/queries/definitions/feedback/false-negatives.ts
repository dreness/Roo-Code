import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "feedback.false_negatives",
	category: "feedback",
	description: "Find cases where automation missed the actual root cause",

	sql: `
SELECT
    ci.id AS investigation_id,
    ci.bug_fix_sha,
    bf.message AS bug_fix_message,
    ci.final_cause_sha AS actual_cause,
    ac.message AS actual_cause_message,
    bc.cause_sha AS automated_cause,
    auc.message AS automated_cause_message,
    bc.analysis_method,
    bc.confidence AS automated_confidence,
    ci.confidence_override AS human_confidence,
    ci.summary
FROM causality_investigations ci
JOIN commits bf ON ci.bug_fix_sha = bf.sha
JOIN commits ac ON ci.final_cause_sha = ac.sha
LEFT JOIN bug_causality bc ON ci.bug_fix_sha = bc.bug_fix_sha
    AND bc.automation_was_correct = 0
LEFT JOIN commits auc ON bc.cause_sha = auc.sha
WHERE ci.conclusion_type = 'new_cause_found'
AND ci.completed_at IS NOT NULL
ORDER BY ci.completed_at DESC
`,

	parameters: [],

	example: {},
}

export default query
