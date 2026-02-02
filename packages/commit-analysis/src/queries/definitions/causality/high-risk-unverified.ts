import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "causality.high_risk_unverified",
	category: "causality",
	description: "Find unverified causality for high-risk commits",

	sql: `
SELECT
    bc.id,
    bc.bug_fix_sha,
    bf.message AS fix_message,
    cl.risk_score,
    bc.cause_sha,
    bc.confidence,
    bc.analysis_method
FROM bug_causality bc
JOIN commits bf ON bc.bug_fix_sha = bf.sha
JOIN classifications cl ON bf.sha = cl.commit_sha
WHERE cl.risk_score >= $risk_threshold
AND (bc.human_verified = 0 OR bc.human_verified IS NULL)
ORDER BY cl.risk_score DESC
`,

	parameters: [
		{
			name: "risk_threshold",
			type: "real",
			description: "Minimum risk score (e.g., 50)",
			required: true,
		},
	],

	example: {
		risk_threshold: 50,
	},
}

export default query
