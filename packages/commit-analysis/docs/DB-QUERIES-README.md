# Investigative Analysis Query Library

> Named, reusable queries for conducting Investigative Analysis (IA)

## Overview

Queries are defined as TypeScript modules in `src/queries/definitions/`. Each query has:

- A unique name (e.g., `commit.full_context`)
- Typed parameter definitions
- Documentation and examples

## Usage

### CLI

```bash
# List all queries
pnpm cli query --list

# List queries in a category
pnpm cli query --list --category commit

# Show documentation for a query
pnpm cli query --docs commit.full_context

# Run a query
pnpm cli query commit.full_context --param sha=abc123

# Run with JSON output
pnpm cli query commit.full_context --param sha=abc123 --format json

# Run with CSV output
pnpm cli query stats.queue_for_investigation --format csv

# Show resolved SQL
pnpm cli query commit.full_context --param sha=abc123 --sql

# Array parameters (comma-separated)
pnpm cli query candidate.high_risk_nearby \
  --param subsystems=provider,api \
  --param before_date=1706745600 \
  --param risk_threshold=40
```

### Library (TypeScript)

```typescript
import { runQuery, listQueries, getQueryDocs, getQuery, formatResults } from "@roo-code/commit-analysis/queries"

// List available queries
const queries = listQueries()
// [{ name: 'commit.full_context', category: 'commit', description: '...' }, ...]

// Get documentation for a query
const docs = getQueryDocs("commit.full_context")
console.log(docs)

// Get query definition
const query = getQuery("commit.full_context")
console.log(query.parameters) // Parameter definitions

// Run a query
const result = await runQuery("commit.full_context", { sha: "abc123" })
console.log(result.rows) // Query results
console.log(result.rowCount) // Number of rows
console.log(result.executionTimeMs) // Execution time

// Format results for display
console.log(formatResults(result, "table")) // Pretty table
console.log(formatResults(result, "json")) // JSON
console.log(formatResults(result, "csv")) // CSV
```

### In AI Prompts

Reference queries by name in prompts:

```
Run query `causality.for_fix` with $bug_fix_sha = abc123
```

---

## Query Index

### Commit Context (`commit.*`)

| Query                  | Parameters               | Description                                           |
| ---------------------- | ------------------------ | ----------------------------------------------------- |
| `commit.full_context`  | `sha`                    | Get commit with classification, risk score, and flags |
| `commit.files_changed` | `sha`                    | List all files changed with subsystems                |
| `commit.subsystems`    | `sha`                    | Get distinct subsystems affected                      |
| `commit.by_date_range` | `start_date`, `end_date` | Find commits in date range                            |
| `commit.by_author`     | `author_email`           | Find commits by author                                |

### Causality (`causality.*`)

| Query                            | Parameters       | Description                                         |
| -------------------------------- | ---------------- | --------------------------------------------------- |
| `causality.for_fix`              | `bug_fix_sha`    | Get all causality links for a bug fix               |
| `causality.caused_by`            | `cause_sha`      | Find bugs caused by a specific commit               |
| `causality.unverified`           | `limit?`         | Find links needing human verification               |
| `causality.low_confidence`       | `threshold`      | Find links below confidence threshold               |
| `causality.high_risk_unverified` | `risk_threshold` | Unverified causality for high-risk commits          |
| `causality.disputed`             | `confidence_gap` | Commits with multiple similar-confidence candidates |

### Investigations (`investigation.*`)

| Query                         | Parameters         | Description                                   |
| ----------------------------- | ------------------ | --------------------------------------------- |
| `investigation.for_commit`    | `bug_fix_sha`      | Get all investigations for a bug fix          |
| `investigation.full_details`  | `investigation_id` | Get investigation with full context           |
| `investigation.candidates`    | `investigation_id` | Get candidates for an investigation           |
| `investigation.evidence`      | `investigation_id` | Get evidence for an investigation             |
| `investigation.recent`        | `limit?`           | List recently completed investigations        |
| `investigation.by_subsystem`  | `sha`              | Find related investigations in same subsystem |
| `investigation.in_progress`   | -                  | Find incomplete investigations                |
| `investigation.by_conclusion` | `conclusion_type`  | Find investigations by conclusion type        |

### Candidates (`candidate.*`)

| Query                              | Parameters                                                   | Description                                     |
| ---------------------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| `candidate.prior_verdicts`         | `candidate_sha`                                              | Check if candidate was examined before          |
| `candidate.high_risk_nearby`       | `subsystems`, `before_date`, `risk_threshold?`, `days_back?` | Find high-risk commits in same subsystem        |
| `candidate.recent_in_files`        | `file_paths`, `before_date`, `days_back?`                    | Find commits touching same files                |
| `candidate.known_causes`           | `subsystems`, `min_confidence?`                              | Find commits already identified as causing bugs |
| `candidate.by_author_in_subsystem` | `author_email`, `subsystems`, `before_date`                  | Find commits by author in subsystem             |
| `candidate.with_flags`             | `flag`, `before_date`                                        | Find commits with specific flags                |
| `candidate.unanalyzed_in_range`    | `start_date`, `end_date`                                     | Find commits not yet deep-analyzed              |

### Regression Patterns (`regression.*`)

| Query                     | Parameters         | Description                          |
| ------------------------- | ------------------ | ------------------------------------ |
| `regression.by_subsystem` | `subsystems`       | Get patterns for specific subsystems |
| `regression.active`       | `min_occurrences?` | Get all active regression patterns   |

### Automation Feedback (`feedback.*`)

| Query                         | Parameters | Description                             |
| ----------------------------- | ---------- | --------------------------------------- |
| `feedback.accuracy_overall`   | -          | Overall automation accuracy stats       |
| `feedback.accuracy_by_method` | -          | Accuracy broken down by analysis method |
| `feedback.rejection_reasons`  | -          | Common reasons for rejecting findings   |
| `feedback.false_negatives`    | -          | Cases where automation missed the cause |

### Statistics (`stats.*`)

| Query                           | Parameters | Description                                 |
| ------------------------------- | ---------- | ------------------------------------------- |
| `stats.investigation_summary`   | -          | Summary of all investigation activity       |
| `stats.coverage`                | -          | How much has been investigated              |
| `stats.queue_for_investigation` | -          | Prioritized queue of commits to investigate |

---

## Investigation Workflow Queries

### Starting an Investigation

1. `commit.full_context` - Get bug fix details
2. `commit.subsystems` - Identify affected areas
3. `causality.for_fix` - See automated findings
4. `investigation.for_commit` - Check for prior investigations
5. `regression.by_subsystem` - Check for known patterns

### Finding Candidates

1. `candidate.recent_in_files` - Git log equivalent
2. `candidate.high_risk_nearby` - Risk-based discovery
3. `candidate.known_causes` - Database-assisted discovery
4. `candidate.prior_verdicts` - Check candidate history

### Examining Candidates

1. `commit.full_context` - Candidate details
2. `causality.caused_by` - Other bugs caused by candidate
3. `candidate.prior_verdicts` - Prior examination results

### Concluding Investigation

1. `feedback.accuracy_by_method` - Calibrate confidence
2. `investigation.by_subsystem` - Similar investigations

### Batch Processing

1. `stats.queue_for_investigation` - Get work queue
2. `causality.unverified` - All unverified links
3. `causality.low_confidence` - Low confidence links

---

## Parameter Types

| Type        | Description              | Example                   |
| ----------- | ------------------------ | ------------------------- |
| `text`      | String value             | `sha=abc123`              |
| `integer`   | Whole number             | `limit=50`                |
| `real`      | Decimal number           | `threshold=0.6`           |
| `timestamp` | Unix timestamp (seconds) | `before_date=1706745600`  |
| `text[]`    | Array of strings         | `subsystems=provider,api` |
| `boolean`   | true/false               | `verified=true`           |

---

## Adding New Queries

Create a new file in `src/queries/definitions/<category>/`:

```typescript
import type { QueryDefinition } from "../../types"

const query: QueryDefinition = {
	name: "category.query_name",
	category: "category",
	description: "What this query does",

	sql: `
SELECT ...
FROM ...
WHERE field = $param
  `,

	parameters: [
		{
			name: "param",
			type: "text",
			description: "What this parameter is",
			required: true,
		},
	],

	example: {
		param: "example_value",
	},

	notes: "Optional usage notes",
}

export default query
```

Then add it to the category's index.ts file.

---

## Related Documents

- [AI-PROMPTS-investigative-analysis.md](./AI-PROMPTS-investigative-analysis.md) - AI prompts using these queries
- [GUIDE-investigative-analysis.md](./GUIDE-investigative-analysis.md) - Human CLI workflow
- [PLAN-interactive-research-model.md](./PLAN-interactive-research-model.md) - Data model design
