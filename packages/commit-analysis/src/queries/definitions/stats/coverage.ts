import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "stats.coverage",
	category: "stats",
	description: "How much of the codebase has been analyzed and investigated",

	sql: `
SELECT
    (SELECT COUNT(*) FROM commits) AS total_commits,
    (SELECT COUNT(*) FROM commits WHERE analyzed_at IS NOT NULL) AS analyzed,
    (SELECT COUNT(*) FROM commits WHERE deep_analyzed_at IS NOT NULL) AS deep_analyzed,
    (SELECT COUNT(DISTINCT bug_fix_sha) FROM bug_causality) AS with_causality,
    (SELECT COUNT(DISTINCT bug_fix_sha) FROM bug_causality WHERE human_verified = 1) AS human_verified,
    ROUND(
        (SELECT COUNT(DISTINCT bug_fix_sha) FROM bug_causality WHERE human_verified = 1) * 100.0 /
        NULLIF((SELECT COUNT(DISTINCT bug_fix_sha) FROM bug_causality), 0),
        1
    ) AS verification_coverage_percent
`,

	parameters: [],

	example: {},
}

export default query
