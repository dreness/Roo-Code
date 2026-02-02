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

Run commands via the CLI from anywhere in the monorepo:

```bash
# From the repository root (recommended - 'ca' = commit-analysis)
pnpm ca <command>

# All CLI commands are passed through, e.g.:
pnpm ca status
pnpm ca analyze --since HEAD~100
pnpm ca deep-analyze
pnpm ca serve

# Convenience shortcuts for common commands:
pnpm ca:serve      # Start web UI
pnpm ca:sync       # Pull upstream and analyze new commits

# Or from the package directory
cd packages/commit-analysis
pnpm cli <command>
```

### Commands

#### `analyze` - Basic commit analysis

Extracts commits from git history, classifies them, and calculates risk scores.

```bash
# Analyze last 100 commits
pnpm ca analyze --since HEAD~100 --until HEAD

# Analyze with higher parallelism
pnpm ca analyze --since HEAD~500 -c 8

# Incremental analysis (only new commits)
pnpm ca analyze --incremental
```

#### `deep-analyze` - Bug causality analysis

Runs deeper analysis to trace bug fix commits back to their root causes.

```bash
# Run deep analysis with default settings
pnpm ca deep-analyze

# Custom batch processing
pnpm ca deep-analyze \
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
pnpm ca risk --commits abc123,def456

# Show all commits above threshold
pnpm ca risk --threshold 50

# Risk report since date
pnpm ca risk --since 2026-01-01
```

#### `regressions` - View regression patterns

```bash
# Show all regression patterns
pnpm ca regressions

# Filter by subsystem
pnpm ca regressions --subsystem provider

# Only patterns with 2+ occurrences
pnpm ca regressions --min 2
```

#### `causality` - View bug relationships

```bash
# Show what caused a bug fix
pnpm ca causality --commit abc123

# Bidirectional: shows both causes and bugs introduced
```

#### `sync` - Sync advisor

Recommends safe sync points for fork maintenance.

```bash
pnpm ca sync \
  --upstream origin/main \
  --local HEAD \
  --max-risk 60
```

#### `sync-upstream` - Pull and analyze new commits

One-command workflow to pull latest commits from upstream and run full analysis on them. This is the recommended way to keep your analysis database up to date.

```bash
# Pull from upstream/main and analyze (default - use shortcut)
pnpm ca:sync

# Or with full command name
pnpm ca sync-upstream

# Preview what would happen
pnpm ca sync-upstream --dry-run

# Custom upstream remote and branch
pnpm ca sync-upstream --upstream origin --branch develop

# Skip deep causality analysis for faster sync
pnpm ca sync-upstream --skip-deep

# Higher parallelism for faster analysis
pnpm ca sync-upstream --concurrency 8
```

**What it does:**

1. Records current HEAD before pulling
2. Fetches from upstream remote
3. Merges upstream branch into current branch
4. Runs basic analysis (classify, risk score) on new commits
5. Runs deep analysis (bug causality) on new bug fixes

#### `export` / `import` - Analysis data portability

```bash
# Export analysis results
pnpm ca export --since 2026-01-01 -o analysis.json

# Import external analysis (merge with existing)
pnpm ca import -f external.json --merge

# Import and replace existing
pnpm ca import -f external.json --replace
```

#### `serve` - Start web UI

Starts the Next.js web UI server directly from the CLI:

```bash
# Start web UI from repo root (recommended - use shortcut)
pnpm ca:serve

# Start on custom port
pnpm ca serve --port 3000

# Start in background (detached mode)
pnpm ca serve --detached

# Default port is 3447
```

### Interactive Investigation Commands

Human-in-the-loop investigation of bug causality. Verify automated analysis, record expert reasoning, and improve system accuracy over time.

> 📖 **Full documentation**: See [docs/GUIDE-investigative-analysis.md](docs/GUIDE-investigative-analysis.md) for comprehensive workflows, best practices, and example sessions.
>
> 🤖 **AI agents**: See [docs/AI-PROMPTS-investigative-analysis.md](docs/AI-PROMPTS-investigative-analysis.md) for prompts to conduct AI-driven investigations.
>
> 🔍 **Query library**: See [docs/DB-QUERIES-README.md](docs/DB-QUERIES-README.md) for database queries used in investigations.

| Command                      | Description                               |
| ---------------------------- | ----------------------------------------- |
| `investigate --commit <sha>` | Full interactive investigation session    |
| `verify --commit <sha>`      | Quick confirm/reject of automated results |
| `feedback --stats`           | Automation accuracy statistics            |
| `calibration`                | Confidence calibration analysis           |
| `patterns`                   | Rejection pattern analysis                |
| `export --investigations`    | Export investigation data                 |

#### `status` - Database status overview

Shows a summary of analysis data including commit counts, category distribution, causality links, regression patterns, and time ranges.

```bash
# Show status summary
pnpm ca status

# Show verbose output with risk distribution
pnpm ca status --verbose

# Output as JSON
pnpm ca status --json
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
- **bug_causality** - Links between bug fixes and causing commits (with human feedback fields)
- **regression_patterns** - Recurring issue patterns
- **analysis_cache** - Cached git operations for faster re-analysis

### Investigation Tables

The following tables support interactive research and human-in-the-loop verification:

- **causality_investigations** - Records human investigation sessions for bug fixes

    - Links to the bug fix commit being investigated
    - Tracks investigator, start/end timestamps, and conclusion
    - Stores the human-determined root cause (may differ from automation)

- **investigation_candidates** - Commits examined during an investigation

    - Each candidate gets a verdict: `root_cause`, `contributing`, `ruled_out`, or `uncertain`
    - Captures reasoning and rejection reasons (valuable for improving automation)
    - Preserves examination order for workflow reconstruction

- **investigation_evidence** - Artifacts collected during investigation
    - Types: `blame`, `diff`, `bisect`, `log`, `manual_note`
    - Stores content previews and references to full content in analysis_cache
    - Provides audit trail for investigation decisions

### Human Feedback Fields

The `bug_causality` table includes fields for learning feedback:

| Field                    | Type    | Description                                             |
| ------------------------ | ------- | ------------------------------------------------------- |
| `investigation_id`       | FK      | Link to full investigation record                       |
| `human_verified`         | boolean | Whether a human has reviewed this link                  |
| `human_confidence`       | real    | Human-assigned confidence (if different from automated) |
| `automation_was_correct` | boolean | Explicit feedback: was the automated result correct?    |

These fields enable:

- Tracking automation accuracy over time
- Identifying systematic blind spots
- Calibrating confidence scores

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
# Start web UI from repo root (recommended - use shortcut)
pnpm ca:serve

# Or via the CLI directly
pnpm ca serve

# Runs on http://localhost:3447 by default
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
