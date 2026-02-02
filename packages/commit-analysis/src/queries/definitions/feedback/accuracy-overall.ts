import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "feedback.accuracy_overall",
	category: "feedback",
	description: "Get overall automation accuracy statistics",

	sql: `
SELECT
    COUNT(*) AS total_verified,
    SUM(CASE WHEN automation_was_correct = 1 THEN 1 ELSE 0 END) AS correct,
    SUM(CASE WHEN automation_was_correct = 0 THEN 1 ELSE 0 END) AS incorrect,
    ROUND(
        AVG(CASE WHEN automation_was_correct = 1 THEN 1.0 ELSE 0.0 END) * 100,
        1
    ) AS accuracy_percent,
    AVG(confidence) AS avg_automated_confidence,
    AVG(human_confidence) AS avg_human_confidence
FROM bug_causality
WHERE human_verified = 1
`,

	parameters: [],

	example: {},
}

export default query
