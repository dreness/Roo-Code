import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "stats.queue_for_investigation",
	category: "stats",
	description: "Find commits that should be prioritized for investigation",

	sql: `
SELECT
    bc.bug_fix_sha,
    c.message AS bug_fix_message,
    cl.risk_score,
    bc.confidence AS automated_confidence,
    bc.analysis_method,
    CASE
        WHEN cl.risk_score >= 75 THEN 'critical-risk'
        WHEN bc.confidence < 0.6 THEN 'low-confidence'
        WHEN bc.analysis_method = 'temporal' THEN 'weak-method'
        ELSE 'standard'
    END AS priority_reason,
    CASE
        WHEN cl.risk_score >= 75 THEN 1
        WHEN bc.confidence < 0.6 THEN 2
        WHEN bc.analysis_method = 'temporal' THEN 3
        ELSE 4
    END AS priority_order
FROM bug_causality bc
JOIN commits c ON bc.bug_fix_sha = c.sha
JOIN classifications cl ON c.sha = cl.commit_sha
WHERE (bc.human_verified = 0 OR bc.human_verified IS NULL)
ORDER BY priority_order ASC, cl.risk_score DESC, bc.confidence ASC
LIMIT 50
`,

	parameters: [],

	example: {},

	notes: "Use this to find the next commit to investigate.",
}

export default query
