import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "candidate.known_causes",
	category: "candidate",
	description: "Find commits already identified as causing bugs in specific subsystems",

	sql: `
SELECT DISTINCT
    bc.cause_sha,
    c.message AS cause_message,
    c.date AS cause_date,
    COUNT(DISTINCT bc.bug_fix_sha) AS bugs_caused,
    AVG(bc.confidence) AS avg_confidence,
    GROUP_CONCAT(DISTINCT fc.subsystem) AS subsystems
FROM bug_causality bc
JOIN commits c ON bc.cause_sha = c.sha
JOIN file_changes fc ON bc.cause_sha = fc.commit_sha
WHERE fc.subsystem IN ($subsystems)
AND bc.confidence >= $min_confidence
GROUP BY bc.cause_sha
ORDER BY bugs_caused DESC, avg_confidence DESC
`,

	parameters: [
		{
			name: "subsystems",
			type: "text[]",
			description: "List of subsystem names",
			required: true,
		},
		{
			name: "min_confidence",
			type: "real",
			description: "Minimum confidence threshold",
			required: false,
			default: 0.5,
		},
	],

	example: {
		subsystems: ["provider", "api"],
		min_confidence: 0.5,
	},
}

export default query
