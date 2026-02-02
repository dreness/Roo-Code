import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "regression.active",
	category: "regression",
	description: "Get all active regression patterns",

	sql: `
SELECT
    rp.id,
    rp.pattern_hash,
    rp.subsystem,
    rp.keywords,
    rp.file_patterns,
    rp.occurrence_count,
    rp.severity,
    rp.commit_shas,
    c.message AS first_occurrence_message,
    c.date AS first_occurrence_date
FROM regression_patterns rp
LEFT JOIN commits c ON rp.first_occurrence = c.sha
WHERE rp.status = 'active'
AND rp.occurrence_count >= $min_occurrences
ORDER BY rp.severity DESC, rp.occurrence_count DESC
`,

	parameters: [
		{
			name: "min_occurrences",
			type: "integer",
			description: "Minimum occurrence count",
			required: false,
			default: 1,
		},
	],

	example: {
		min_occurrences: 2,
	},
}

export default query
