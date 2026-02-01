# @roo-code/web-commit-analysis

Web dashboard for visualizing Roo Code commit analysis data. Provides timeline views, risk visualization, bug causality graphs, and sync recommendations.

## Features

### Timeline View (`/`)

The main dashboard showing commits grouped by release:

- Commits displayed in chronological order within each release
- Color-coded risk scores (green/yellow/orange/red)
- 5-segment risk bar visualization
- Expandable causality links showing related bug fixes and causes
- Filter by category, risk level, and timeframe

### Commit Detail (`/commits/[sha]`)

Detailed view for individual commits:

- Full classification details (category, confidence, flags)
- Risk breakdown showing contribution of each factor
- Bidirectional causality graph:
    - **Causes**: What commits introduced bugs that this commit fixes
    - **Caused Bugs**: What bugs were introduced by this commit
- File changes with subsystem classification

### Regression Patterns (`/patterns`)

Overview of recurring issues:

- Pattern list with occurrence count and severity
- Subsystem grouping
- Links to all related commits
- Status tracking (active/resolved)

### Sync Advisor (`/sync`)

Interactive sync point recommendations:

- Current fork status vs upstream
- Recommended sync point with risk breakdown
- Cumulative risk visualization
- Warnings for high-risk changes
- Feature/fix/other breakdown

## Getting Started

```bash
# Install dependencies (from repo root)
pnpm install

# Start development server
pnpm --filter @roo-code/web-commit-analysis dev

# Or from this directory
pnpm dev
```

The app runs on **http://localhost:3447** by default.

## Prerequisites

Before using the web UI, you need analysis data in the database:

```bash
# Run initial analysis (from packages/commit-analysis)
pnpm cli analyze --since HEAD~500

# Optional: Run deep analysis for causality data
pnpm cli deep-analyze
```

## Technology Stack

| Component     | Choice               |
| ------------- | -------------------- |
| Framework     | Next.js 16           |
| UI Components | Radix UI + shadcn/ui |
| Styling       | Tailwind CSS 4       |
| Data Fetching | TanStack Query       |
| Icons         | Lucide React         |
| Theme         | next-themes          |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Timeline view
│   ├── layout.tsx            # Root layout with theme
│   ├── commits/[sha]/
│   │   └── page.tsx          # Commit detail view
│   ├── patterns/
│   │   └── page.tsx          # Regression patterns view
│   └── sync/
│       └── page.tsx          # Sync advisor
├── actions/
│   ├── timeline.ts           # Timeline data fetching
│   ├── causality.ts          # Causality graph data
│   ├── patterns.ts           # Regression pattern data
│   └── sync.ts               # Sync advisor data
├── components/
│   ├── timeline/
│   │   └── timeline.tsx      # Timeline component
│   └── ui/                   # shadcn components
└── lib/
    └── utils.ts              # Utility functions (cn, etc.)
```

## Risk Visualization

Risk scores are visualized using a 5-segment bar:

```
Score 0-20:   █░░░░  (green)
Score 20-40:  ██░░░  (yellow)
Score 40-60:  ███░░  (orange)
Score 60-80:  ████░  (orange-red)
Score 80-100: █████  (red)
```

## Development

```bash
# Type check
pnpm check-types

# Lint
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## Related

- [`@roo-code/commit-analysis`](../../packages/commit-analysis) - Core analysis engine and CLI
