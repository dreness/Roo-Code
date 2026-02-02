import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "regression.by_subsystem",
	category: "regression",
	description: "Get regression patterns for specific subsystems",

	sql: `
SELECT
    id,
    pattern_hash,
    subsystem,
    keywords,
    file_patterns,
    occurrence_count,
    severity,
    status,
    first_occurrence,
    created_at,
    updated_at
FROM regression_patterns
WHERE subsystem IN ($subsystems)
ORDER BY occurrence_count DESC, severity DESC
`,

	parameters: [
		{
			name: "subsystems",
			type: "text[]",
			description: "List of subsystem names",
			required: true,
		},
	],

	example: {
		subsystems: ["provider", "api"],
	},

	notes: "Check during preparation to understand known problem areas.",
}

export default query
