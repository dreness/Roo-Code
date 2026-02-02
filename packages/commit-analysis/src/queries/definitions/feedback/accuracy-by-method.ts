import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "feedback.accuracy_by_method",
	category: "feedback",
	description: "Get accuracy broken down by analysis method",

	sql: `
SELECT
    analysis_method,
    COUNT(*) AS total_verified,
    SUM(CASE WHEN automation_was_correct = 1 THEN 1 ELSE 0 END) AS correct,
    SUM(CASE WHEN automation_was_correct = 0 THEN 1 ELSE 0 END) AS incorrect,
    ROUND(
        AVG(CASE WHEN automation_was_correct = 1 THEN 1.0 ELSE 0.0 END) * 100,
        1
    ) AS accuracy_percent,
    AVG(confidence) AS avg_automated_confidence,
    AVG(human_confidence) AS avg_human_confidence,
    AVG(confidence) - AVG(human_confidence) AS confidence_gap
FROM bug_causality
WHERE human_verified = 1
AND analysis_method IS NOT NULL
GROUP BY analysis_method
ORDER BY accuracy_percent DESC
`,

	parameters: [],

	example: {},

	notes: "Use to calibrate confidence in conclusions based on analysis method.",
}

export default query
