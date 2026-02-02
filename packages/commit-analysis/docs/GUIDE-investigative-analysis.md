# Investigative Analysis Guide

> A comprehensive guide for conducting human-in-the-loop bug causality investigations

## Table of Contents

- [Introduction](#introduction)
- [Why Investigate?](#why-investigate)
- [Getting Started](#getting-started)
- [Investigation Workflow](#investigation-workflow)
- [CLI Commands Reference](#cli-commands-reference)
- [Web UI Workflow](#web-ui-workflow)
- [Best Practices](#best-practices)
- [Interpreting Results](#interpreting-results)
- [Improving Automation](#improving-automation)
- [FAQ](#faq)

---

## Introduction

The investigative analysis feature allows humans to verify, correct, and improve automated bug causality detection. By recording expert reasoning and verdicts, we create a feedback loop that:

1. Validates automated analysis accuracy
2. Captures domain knowledge for future reference
3. Identifies blind spots in automation
4. Enables continuous improvement of confidence calibration

This guide walks you through the complete investigation workflow, from starting a session to using the collected data to improve system accuracy.

---

## Why Investigate?

### The Problem with Pure Automation

Automated bug causality detection uses several methods:

| Method     | Confidence | Accuracy\* |
| ---------- | ---------- | ---------- |
| `explicit` | 0.95       | ~95%       |
| `blame`    | 0.7-0.9    | ~82%       |
| `semantic` | 0.5-0.7    | ~75%       |
| `temporal` | 0.3-0.5    | ~44%       |

\*Based on human verification data

While explicit references (e.g., "reverts abc123") are highly reliable, other methods have significant error rates. The `temporal` method, in particular, often flags coincidental correlations as causal.

### The Value of Human Feedback

Human investigation provides:

- **Ground truth** - Expert-verified causality that we can compare automation against
- **Reasoning capture** - Understanding _why_ something is/isn't the root cause
- **Rejection patterns** - What automation gets wrong and why
- **Confidence calibration** - Adjusting confidence scores to match actual accuracy

### When to Investigate

Prioritize investigation of:

1. **High-impact bugs** - Regressions affecting critical functionality
2. **Low-confidence results** - Automated confidence < 0.7
3. **Multi-candidate cases** - Multiple potential causes identified
4. **Method validation** - Systematically verifying each method's accuracy
5. **Post-incident review** - Understanding root causes after incidents

---

## Getting Started

### Prerequisites

1. Database with analyzed commits:

    ```bash
    # Run basic analysis if not already done
    pnpm cli analyze --since HEAD~500

    # Run deep analysis to generate causality candidates
    pnpm cli deep-analyze
    ```

2. Bug fix commits with causality links to investigate:

    ```bash
    # Check current status
    pnpm cli status --verbose
    ```

### Your First Investigation

Start with a simple case:

```bash
# Find a bug fix with automated causality
pnpm cli causality --unverified --limit 1

# Start investigation
pnpm cli investigate --commit <sha>
```

---

## Investigation Workflow

### Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    INVESTIGATION WORKFLOW                     │
└──────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │ Start       │  pnpm cli investigate --commit abc123
  │ Investigation│
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ Review      │  System shows automated analysis results
  │ Automated   │  and candidate commits
  │ Results     │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ Examine     │  For each candidate:
  │ Candidates  │  - View commit details
  │             │  - Capture evidence (blame, diff)
  │             │  - Record verdict & reasoning
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ Conclude    │  - Select root cause (or none)
  │ Investigation│  - Set confidence level
  │             │  - Confirm if automation was correct
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ Results     │  Data saved for calibration
  │ Recorded    │  and pattern analysis
  └─────────────┘
```

### Step 1: Start an Investigation

```bash
pnpm cli investigate --commit abc123
```

The system will display:

```
🔍 Starting investigation for bug fix: abc123def
   "fix: resolve memory leak in provider caching"

   Author:  jane@example.com
   Date:    Jan 15, 2026
   Files:   src/providers/cache.ts (+5, -12)

📊 Automated analysis found 2 potential causes:
   1. def456 (confidence: 0.85, method: blame)
      "feat: add provider caching"
   2. ghi789 (confidence: 0.45, method: temporal)
      "refactor: update cache invalidation"

? Start examining candidates? (Y/n)
```

### Step 2: Examine Each Candidate

For each candidate, the system presents:

```
══════════════════════════════════════════════════════════════
Examining candidate 1/2: def456
══════════════════════════════════════════════════════════════

   Author:   alice@example.com
   Date:     Jan 13, 2026 (2 days before fix)
   Message:  feat: add provider caching

   Files changed:
   - src/providers/cache.ts (+45, -0)
   - src/providers/base.ts (+12, -3)

   Automated reason: Git blame indicates lines 23-28 were
   last touched by this commit

? Actions:
  [v] View diff
  [b] Run git blame
  [l] View git log
  [n] Add note
  [d] Record verdict and continue
```

#### Capture Evidence

When you view diffs or blame output, the system automatically captures it:

```
? Actions: v

Capturing diff as evidence...

diff --git a/src/providers/cache.ts b/src/providers/cache.ts
--- a/src/providers/cache.ts
+++ b/src/providers/cache.ts
@@ -20,6 +20,10 @@ export class ProviderCache {
   private cache = new Map<string, Provider>()
+
+  // NOTE: No cleanup on disconnect - potential memory leak!
+  add(key: string, provider: Provider) {
+    this.cache.set(key, provider)
+  }

✓ Evidence captured: diff (preview: 342 chars)
```

#### Record Your Verdict

```
? Verdict for def456:
  > root_cause    - This commit introduced the bug
    contributing  - This commit contributed but isn't the primary cause
    ruled_out     - This commit is not related to the bug
    uncertain     - Cannot determine with available information

? Reasoning (required for root_cause/contributing):
> Introduced the cache Map without proper cleanup. The add() method
  stores providers but there's no corresponding remove() or clear()
  on disconnect, causing memory leak over time.

✓ Verdict recorded: root_cause
```

### Step 3: Complete the Investigation

After examining all candidates:

```
══════════════════════════════════════════════════════════════
Investigation Summary
══════════════════════════════════════════════════════════════

   Bug fix:     abc123 "fix: resolve memory leak in provider caching"

   Candidates examined: 2
   - def456: root_cause
   - ghi789: ruled_out

   Automated result: def456 (confidence: 0.85)
   Your verdict:     def456 (confidence: 0.90)

? Was the automation correct? Yes
? Overall confidence in your verdict (0.0-1.0): 0.9
? Summary notes (optional):
> Clear case - blame correctly identified the introducing commit.
  The lack of cleanup logic was evident in the diff.

✅ Investigation complete!
   Session ID: inv_12345
   Duration: 8 minutes
   Automation feedback: CORRECT
```

---

## CLI Commands Reference

### `investigate` - Full Investigation

```bash
# Basic usage
pnpm cli investigate --commit <sha>

# Resume incomplete investigation
pnpm cli investigate --commit <sha> --resume

# Start with specific candidates
pnpm cli investigate --commit <sha> --candidates def456,ghi789

# Non-interactive mode (for scripting)
pnpm cli investigate --commit <sha> \
  --verdict def456:root_cause \
  --verdict ghi789:ruled_out \
  --confidence 0.9 \
  --summary "Blame was correct"
```

**Options:**

| Option         | Description                                  |
| -------------- | -------------------------------------------- |
| `--commit`     | SHA of the bug fix to investigate (required) |
| `--resume`     | Resume an incomplete investigation           |
| `--candidates` | Comma-separated SHAs to examine              |
| `--verdict`    | Non-interactive: `sha:verdict`               |
| `--confidence` | Non-interactive: overall confidence          |
| `--summary`    | Non-interactive: summary notes               |

### `verify` - Quick Verification

For simple confirm/reject without full investigation:

```bash
# Confirm automated result is correct
pnpm cli verify --commit abc123 --confirm

# Reject with reason
pnpm cli verify --commit abc123 --reject \
  --reason "Blame identified wrong commit in refactored code"

# Override with different root cause
pnpm cli verify --commit abc123 \
  --override def456 \
  --confidence 0.85 \
  --reason "Actual cause was in earlier refactor"
```

**Options:**

| Option         | Description                                |
| -------------- | ------------------------------------------ |
| `--commit`     | SHA of the bug fix (required)              |
| `--confirm`    | Mark automated result as correct           |
| `--reject`     | Mark automated result as incorrect         |
| `--override`   | Specify different root cause SHA           |
| `--confidence` | Your confidence level (0.0-1.0)            |
| `--reason`     | Explanation (required for reject/override) |

### `feedback` - Accuracy Statistics

```bash
# Overall statistics
pnpm cli feedback --stats

# By analysis method
pnpm cli feedback --stats --by-method

# By time period
pnpm cli feedback --stats --since 2026-01-01 --until 2026-01-31

# JSON output for further analysis
pnpm cli feedback --stats --json > accuracy.json
```

### `calibration` - Confidence Analysis

```bash
# Basic calibration report
pnpm cli calibration

# Detailed breakdown by confidence band
pnpm cli calibration --detailed

# By specific method
pnpm cli calibration --method blame

# JSON output for plotting
pnpm cli calibration --json > calibration.json
```

### `patterns` - Rejection Analysis

```bash
# Show rejection patterns
pnpm cli patterns

# Filter by method
pnpm cli patterns --method semantic

# Include example commits
pnpm cli patterns --examples

# JSON output
pnpm cli patterns --json > patterns.json
```

### `export` - Export Investigation Data

```bash
# Export all investigations
pnpm cli export --investigations -o investigations.json

# Include full evidence content
pnpm cli export --investigations --include-evidence

# Only completed investigations
pnpm cli export --investigations --completed-only

# Filter by investigator
pnpm cli export --investigations --investigator jane@example.com
```

---

## Web UI Workflow

The web application (`apps/web-commit-analysis`) provides a visual interface for investigations.

### Starting an Investigation

1. Navigate to a commit detail page
2. In the "Bug Causality" section, find unverified links
3. Click **"Start Investigation"** button

### The Investigation Panel

The UI presents:

- **Bug fix details** on the left
- **Candidate list** in the center
- **Evidence viewer** on the right

### Recording Verdicts

1. Click on a candidate to expand details
2. Use quick actions: **View Diff**, **Run Blame**, **View Log**
3. Select verdict from dropdown: `root_cause`, `contributing`, `ruled_out`, `uncertain`
4. Enter reasoning in the text area
5. Click **"Save Verdict"**

### Completing Investigation

1. After examining all candidates, click **"Complete Investigation"**
2. Confirm or adjust the root cause selection
3. Set your confidence level (slider 0-100%)
4. Indicate if automation was correct
5. Add summary notes
6. Click **"Submit Investigation"**

### Viewing Past Investigations

Navigate to `/investigations` to see:

- All investigation sessions
- Filter by status (complete/incomplete)
- Search by commit SHA or investigator
- View full investigation details including evidence

---

## Best Practices

### Recording High-Quality Verdicts

#### Be Specific in Your Reasoning

❌ Bad: "This looks like the cause"

✅ Good: "Line 45 introduced a null check that returns early before the connection is established. The fix adds handling for this case."

#### Capture Relevant Evidence

Always capture:

- **Diff** of the candidate commit (shows what changed)
- **Blame** on the fixed lines (shows who last touched them)
- **Log** for context on surrounding commits

#### Use Consistent Rejection Reasons

Common rejection patterns to use:

| Rejection Reason                  | When to Use                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| "Wrong commit in blame chain"     | Blame found a commit that touched the line, but the bug was in logic, not that line |
| "Semantic match was coincidental" | Same subsystem but different functionality                                          |
| "Temporal proximity not causal"   | Changes happened around the same time but are unrelated                             |
| "Refactor obscured true cause"    | The blamed commit was a refactor; actual bug is older                               |
| "Test-only change"                | Candidate only touched tests, not production code                                   |

### Investigation Efficiency

1. **Start with high-confidence candidates** - Examine 0.8+ confidence first
2. **Check explicit references first** - Look for "reverts", "fixes #123" patterns
3. **Use blame strategically** - Focus on the specific lines that were fixed
4. **Time-box investigations** - Set a limit (e.g., 15 min) for complex cases
5. **Mark as inconclusive when appropriate** - Don't force a verdict if unsure

### Handling Edge Cases

#### Multiple Contributing Causes

If multiple commits contributed to a bug:

1. Mark the primary cause as `root_cause`
2. Mark others as `contributing`
3. Note the relationship in your reasoning

#### No Clear Root Cause

If none of the candidates seem correct:

1. Mark all as `ruled_out` or `uncertain`
2. Set conclusion type to `inconclusive` or `new_cause_found`
3. If you identify a different cause, specify it in the final verdict

#### Disagreeing with Automation

If the automated confidence seems off:

1. Override with your own confidence assessment
2. Document why you disagree
3. This data helps calibrate the system

---

## Interpreting Results

### Accuracy Report

```
╔══════════════════════════════════════════════════════════════╗
║           AUTOMATION ACCURACY REPORT                          ║
╚══════════════════════════════════════════════════════════════╝

📊 OVERALL ACCURACY
──────────────────────────────────────────────────
   Total verified:     150
   Correct:            127 (84.7%)
   Incorrect:          23 (15.3%)
```

**What this tells you:**

- Overall, automation correctly identifies root causes ~85% of the time
- 15% of cases need human correction

### Method Accuracy Breakdown

```
📈 BY ANALYSIS METHOD
──────────────────────────────────────────────────
   explicit   ████████████████████   95.2%  (40/42)
   blame      ███████████████░░░░░   82.1%  (55/67)
   semantic   ██████████████░░░░░░   75.0%  (24/32)
   temporal   ████████░░░░░░░░░░░░   44.4%  (8/18)
```

**What this tells you:**

- `explicit` references are highly reliable - trust these
- `blame` is good but not perfect - verify when critical
- `semantic` and `temporal` need more scrutiny

### Calibration Report

```
📊 CALIBRATION BY CONFIDENCE BAND
──────────────────────────────────────────────────
   Band        Predicted   Actual    Gap      n
   0.9-1.0     95%         92%      -3%      25
   0.8-0.9     85%         81%      -4%      38
   0.7-0.8     75%         70%      -5%      42
   0.6-0.7     65%         55%     -10%      28  ⚠️
   0.5-0.6     55%         42%     -13%      17  ⚠️
```

**What this tells you:**

- High confidence (0.8+) is well-calibrated - slight overestimation
- Medium confidence (0.5-0.7) is significantly overestimated
- Consider adjusting confidence thresholds or algorithms

### Rejection Patterns

```
📊 TOP REJECTION REASONS
──────────────────────────────────────────────────
   1. Wrong commit in blame chain         (23 occurrences)
   2. Semantic match was coincidental     (18 occurrences)
   3. Temporal proximity not causal       (15 occurrences)
```

**What this tells you:**

- Blame analysis struggles with refactored code
- Semantic matching has too many false positives
- Temporal method needs higher gap threshold

---

## Improving Automation

### Using Feedback Data

The investigation data enables several improvements:

#### 1. Confidence Calibration

Use calibration data to adjust confidence scores:

```typescript
// Example: Reduce temporal method confidence
if (method === "temporal") {
	confidence = confidence * 0.8 // Reduce by 20%
}
```

#### 2. Rejection Pattern Analysis

Identify common automation failures:

```bash
# Export rejection patterns for analysis
pnpm cli patterns --json > patterns.json

# Common patterns suggest algorithm improvements:
# - "Wrong commit in blame chain" → Expand blame context
# - "Semantic match coincidental" → Add function-level scoping
# - "Temporal not causal" → Increase time gap threshold
```

#### 3. Training Data Generation

Export verified causality for ML training:

```bash
# Export ground-truth data
pnpm cli export --investigations \
  --completed-only \
  --include-evidence \
  -o training-data.json
```

### Feedback Loop Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   CONTINUOUS IMPROVEMENT                     │
└─────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ Automated│────▶│  Human   │────▶│  Verify  │
  │ Analysis │     │ Verify   │     │  Feedback│
  └──────────┘     └──────────┘     └────┬─────┘
       ▲                                  │
       │           ┌──────────┐           │
       │           │ Calibrate│           │
       └───────────│ & Improve│◀──────────┘
                   │ Algorithms│
                   └──────────┘
```

1. **Collect**: Gather 50+ human-verified investigations
2. **Analyze**: Run calibration and pattern reports
3. **Identify**: Find systematic issues in automation
4. **Adjust**: Modify confidence weights or algorithms
5. **Validate**: Re-run on historical data to measure improvement
6. **Deploy**: Update production settings
7. **Repeat**: Continue collecting feedback

### Recommended Actions by Pattern

| Pattern                        | Suggested Improvement             |
| ------------------------------ | --------------------------------- |
| Blame accuracy < 80%           | Expand blame context to ±5 lines  |
| Semantic accuracy < 70%        | Add function-level scope matching |
| Temporal accuracy < 50%        | Increase gap threshold to 72h     |
| High-confidence miscalibration | Reduce confidence multiplier      |
| Specific subsystem issues      | Add subsystem-specific rules      |

---

## FAQ

### How long should an investigation take?

- **Simple cases** (explicit reference): 2-3 minutes
- **Typical cases** (blame/semantic): 5-10 minutes
- **Complex cases** (multiple candidates, unclear): 15-20 minutes

If an investigation is taking longer than 20 minutes, consider marking it as `inconclusive` and documenting what made it difficult.

### What if I'm not sure about my verdict?

Use the `uncertain` verdict and be honest about your confidence level. Low-confidence human verdicts are still valuable - they indicate cases where automation needs improvement.

### Can multiple people investigate the same commit?

Yes. The system tracks investigations by investigator. If verdicts differ, this highlights ambiguous cases that may need team discussion.

### How is "automation was correct" determined?

Automation is considered correct if:

1. It identified a root cause AND
2. Your verdict agrees with that root cause

Even if the confidence was off, if the right commit was identified, it's counted as correct.

### What happens to incomplete investigations?

Incomplete investigations are saved and can be resumed:

```bash
pnpm cli investigate --commit abc123 --resume
```

They are excluded from accuracy statistics until completed.

### How often should we run calibration?

After every 25-50 new investigations, or monthly, whichever comes first. Significant calibration drift indicates the codebase characteristics may have changed.

---

## Related Documentation

- [README.md](../README.md) - Package overview and CLI reference
- [AI-PROMPTS-investigative-analysis.md](AI-PROMPTS-investigative-analysis.md) - AI agent prompts for conducting investigations
- [DB-QUERIES-README.md](DB-QUERIES-README.md) - Query library index and usage
- [PLAN-interactive-research-model.md](PLAN-interactive-research-model.md) - Original design document
- [schema.ts](../src/db/schema.ts) - Database schema reference
