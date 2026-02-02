import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "causality.low_confidence",
	category: "causality",
	description: "Find causality links below a confidence threshold",

	sql: `
SELECT
    bc.id,
    bc.bug_fix_sha,
    bf.message AS fix_message,
    bc.cause_sha,
    c.message AS cause_message,
    bc.confidence,
    bc.analysis_method,
    bc.human_verified
FROM bug_causality bc
JOIN commits bf ON bc.bug_fix_sha = bf.sha
JOIN commits c ON bc.cause_sha = c.sha
WHERE bc.confidence < $threshold
AND (bc.human_verified = 0 OR bc.human_verified IS NULL)
ORDER BY bc.confidence ASC
`,

	parameters: [
		{
			name: "threshold",
			type: "real",
			description: "Confidence threshold (e.g., 0.6)",
			required: true,
		},
	],

	example: {
		threshold: 0.6,
	},
}

export default query
