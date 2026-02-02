import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "investigation.evidence",
	category: "investigation",
	description: "Get all evidence captured during an investigation",

	sql: `
SELECT
    ie.id,
    ie.evidence_type,
    ie.file_path,
    ie.content_preview,
    ie.captured_at
FROM investigation_evidence ie
WHERE ie.investigation_id = $investigation_id
ORDER BY ie.captured_at
`,

	parameters: [
		{
			name: "investigation_id",
			type: "integer",
			description: "The investigation ID",
			required: true,
		},
	],

	example: {
		investigation_id: 123,
	},
}

export default query
