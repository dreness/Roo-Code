# @roo-code/commit-analysis

A framework for analyzing Roo Code git history to classify commits, detect regression patterns, calculate risk scores, and trace bug causality. Designed to help decide when to sync a private fork from upstream.

## Overview

This package analyzes git commit history and provides:

- **Commit Classification** - Categorizes commits using conventional commit parsing and semantic analysis
- **Risk Scoring** - Calculates a 0-100 risk score based on files changed, subsystems affected, breaking changes, and more
- **Bug Causality Tracing** - Links bug fix commits to the commits that introduced the bugs
- **Regression Pattern Detection** - Identifies recurring issues in the same subsystems
- **Sync Advisor** - Recommends safe sync points for fork maintenance

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web Frontend                              │
│                   (apps/web-commit-analysis)                     │
│      Timeline view, releases, risk visualization                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ API calls
┌────────────────────────────▼────────────────────────────────────┐
│                     Core Package                                 │
│                (packages/commit-analysis)                        │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────────┐  │
│  │ Classifiers │ │ Risk Scoring │ │   Bug Causality Engine   │  │
│  └─────────────┘ └──────────────┘ └──────────────────────────┘  │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────────┐  │
│  │ Git Extract │ │ Regression   │ │   Import/Export          │  │
│  │             │ │ Detection    │ │                          │  │
│  └─────────────┘ └──────────────┘ └──────────────────────────┘  │
│                          │                                       │
│            ┌─────────────▼─────────────┐                        │
│            │     SQLite Database       │                        │
│            │   (commit-analysis.db)    │                        │
│            └───────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

The package is part of the Roo Code monorepo:

```bash
pnpm install
```

## CLI Usage

Run commands via the CLI:

```bash
# Run the CLI
pnpm --filter @roo-code/commit-analysis cli <command>

# Or from the package directory
pnpm cli <command>
```

### Commands

#### `analyze` - Basic commit analysis

Extracts commits from git history, classifies them, and calculates risk scores.

```bash
# Analyze last 100 commits
pnpm cli analyze --since HEAD~100 --until HEAD

# Analyze with higher parallelism
pnpm cli analyze --since HEAD~500 -c 8

# Incremental analysis (only new commits)
pnpm cli analyze --incremental
```

#### `deep-analyze` - Bug causality analysis

Runs deeper analysis to trace bug fix commits back to their root causes.

```bash
# Run deep analysis with default settings
pnpm cli deep-analyze

# Custom batch processing
pnpm cli deep-analyze \
  --batch-size 50 \
  --concurrency 4 \
  --methods blame,semantic,temporal \
  --max-age 90
```

**Analysis Methods:**

| Method     | Confidence | Description                                                                     |
| ---------- | ---------- | ------------------------------------------------------------------------------- |
| `explicit` | 0.95       | Commit message mentions "introduced in", "caused by", or reverts another commit |
| `blame`    | 0.7-0.9    | Uses `git blame` to find commits that last touched the fixed lines              |
| `semantic` | 0.5-0.7    | Matches fix keywords to recent changes in same subsystem                        |
| `temporal` | 0.3-0.5    | Flags fixes within 48-72 hours of features touching same files                  |

#### `risk` - View risk scores

```bash
# Show risk for specific commits
pnpm cli risk --commits abc123,def456

# Show all commits above threshold
pnpm cli risk --threshold 50

# Risk report since date
pnpm cli risk --since 2026-01-01
```

#### `regressions` - View regression patterns

```bash
# Show all regression patterns
pnpm cli regressions

# Filter by subsystem
pnpm cli regressions --subsystem provider

# Only patterns with 2+ occurrences
pnpm cli regressions --min 2
```

#### `causality` - View bug relationships

```bash
# Show what caused a bug fix
pnpm cli causality --commit abc123

# Bidirectional: shows both causes and bugs introduced
```

#### `sync` - Sync advisor

Recommends safe sync points for fork maintenance.

```bash
pnpm cli sync \
  --upstream origin/main \
  --local HEAD \
  --max-risk 60
```

#### `export` / `import` - Analysis data portability

```bash
# Export analysis results
pnpm cli export --since 2026-01-01 -o analysis.json

# Import external analysis (merge with existing)
pnpm cli import -f external.json --merge

# Import and replace existing
pnpm cli import -f external.json --replace
```

#### `serve` - Start web UI

```bash
pnpm cli serve --port 3001
```

#### `status` - Database status overview

Shows a summary of analysis data including commit counts, category distribution, causality links, regression patterns, and time ranges.

```bash
# Show status summary
pnpm cli status

# Show verbose output with risk distribution
pnpm cli status --verbose

# Output as JSON
pnpm cli status --json
```

**Example output:**

```
╔══════════════════════════════════════════════════════════════╗
║               COMMIT ANALYSIS STATUS                          ║
╚══════════════════════════════════════════════════════════════╝

📊 COMMITS
──────────────────────────────────────────────────
  Total commits:       1,234
  Analyzed:            1,234
  Deep-analyzed:       500
  Coverage:            100.0%

📁 CATEGORIES
──────────────────────────────────────────────────
  bugfix          ████████████████████   450 (36.5%)  avg risk: 28.5
  feature         ██████████████░░░░░░   350 (28.4%)  avg risk: 42.1
  ...

🔗 BUG CAUSALITY
──────────────────────────────────────────────────
  Root causes identified: 125
  Total causality links:  180

🔄 REGRESSION PATTERNS
──────────────────────────────────────────────────
  Total patterns:  15
  Active patterns: 8

⏱️  TIME RANGE
──────────────────────────────────────────────────
  Oldest commit:    Jan 15, 2026, 10:30 AM
  Newest commit:    Jan 30, 2026, 02:45 PM
  Date span:        15 days
```

## Risk Scoring

Risk scores range from 0-100 and consider multiple factors:

| Factor                | Weight       | Description                                                 |
| --------------------- | ------------ | ----------------------------------------------------------- |
| Category              | Varies       | Base risk by type: feature (30), bugfix (20), refactor (25) |
| Files Changed         | 2/file       | Up to 20 files                                              |
| Lines Changed         | 0.1/line     | Up to 500 lines                                             |
| Subsystems Affected   | 10/subsystem | Up to 5 subsystems                                          |
| Breaking Change       | 25           | Detected from `!` or "BREAKING" in message                  |
| Critical Path         | 15           | Touches core API, providers, or tool handlers               |
| No Tests              | 10           | Changes >2 files without test coverage                      |
| Low Author Experience | 5            | Author has <5 commits in affected area                      |
| Recent Regressions    | 8/regression | Subsystem had recent bugs                                   |

**Risk Levels:**

- **Low** (0-24): Safe to sync
- **Medium** (25-49): Review before syncing
- **High** (50-74): Careful review needed
- **Critical** (75-100): High risk, consider waiting

## Subsystems

Commits are classified into subsystems based on file paths:

| Subsystem  | Path Patterns                                |
| ---------- | -------------------------------------------- |
| `provider` | `src/api/providers/`, `*Provider.ts`         |
| `tool`     | `src/core/tools/`, `*Tool.ts`                |
| `ui`       | `webview-ui/`, `*.tsx`                       |
| `api`      | `src/api/`, `src/services/`                  |
| `core`     | `src/core/`, `src/shared/`                   |
| `test`     | `__tests__/`, `*.test.ts`                    |
| `build`    | `package.json`, `tsconfig.json`, `webpack.*` |
| `docs`     | `*.md`, `docs/`                              |
| `config`   | `.env*`, `*.config.*`                        |

## Database Schema

The SQLite database stores:

- **commits** - Core commit metadata (sha, author, date, message, stats)
- **file_changes** - Per-file change details with subsystem classification
- **classifications** - Analysis results (category, confidence, risk score, flags)
- **releases** - Version release aggregates
- **bug_causality** - Links between bug fixes and causing commits
- **regression_patterns** - Recurring issue patterns
- **analysis_cache** - Cached git operations for faster re-analysis

### Database Management

```bash
# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema directly (dev only)
pnpm db:push
```

## Web Frontend

The companion web app (`apps/web-commit-analysis`) provides:

- **Timeline View** - Commits grouped by release with risk visualization
- **Commit Detail** - Full classification details and causality graph
- **Patterns View** - All detected regression patterns
- **Sync Advisor** - Interactive sync point recommendations

```bash
# Start web UI (from apps/web-commit-analysis)
pnpm dev

# Runs on http://localhost:3447
```

## Programmatic API

```typescript
import {
	extractCommits,
	classifyCommit,
	calculateRiskScore,
	detectRegressionPatterns,
	analyzeBugCausality,
} from "@roo-code/commit-analysis"

// Extract commits from git
const commits = await extractCommits({ since: "HEAD~100" })

// Classify a commit
const classification = classifyCommit(commit.message, commit.filePaths)

// Calculate risk
const risk = calculateRiskScore(
	classification.category,
	commit.message,
	commit.filePaths,
	commit.insertions,
	commit.deletions,
)

// Find regression patterns
const patterns = detectRegressionPatterns(commits)

// Trace bug causality
const causes = await analyzeBugCausality(bugFixCommit)
```

## Development

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type check
pnpm check-types

# Lint
pnpm lint
```

## Technology Stack

| Component           | Choice               |
| ------------------- | -------------------- |
| Database            | SQLite + Drizzle ORM |
| CLI                 | cmd-ts               |
| Parallel Processing | p-queue              |
| Git Interface       | execa                |
| Testing             | vitest               |

## Export Format

Analysis data can be exported/imported in JSON format:

```json
{
	"version": "1.0",
	"exportedAt": "2026-01-30T12:00:00Z",
	"commits": [
		{
			"sha": "abc123...",
			"classification": {
				"category": "bugfix",
				"confidence": 0.95,
				"flags": ["touches_critical_path"],
				"riskScore": 45
			},
			"causality": {
				"causes": [
					{
						"sha": "def456...",
						"type": "root_cause",
						"confidence": 0.85,
						"bugAge": 3,
						"method": "blame"
					}
				],
				"causedBugs": []
			}
		}
	]
}
```
