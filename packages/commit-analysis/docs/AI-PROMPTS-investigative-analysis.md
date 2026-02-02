# AI-Driven Investigative Analysis

> Prompts and workflows for AI agents conducting bug causality investigations

## Overview

This document provides prompts for AI coding agents to conduct Investigative Analysis (IA). The AI drives the investigation loop, with human oversight for final verdicts when needed.

**Scope Constraints**: IA operates without executing project code. All analysis is based on:

- Code inspection (reading source files, diffs)
- Git metadata and history
- GitHub issues and PR discussions
- Our analysis database (prior investigations, causality, patterns)

---

## Query Library Reference

All database queries are defined as TypeScript modules in `src/queries/definitions/`. See [DB-QUERIES-README.md](./DB-QUERIES-README.md) for the complete query index, parameter documentation, and usage examples.

Reference queries by name in prompts (e.g., `commit.full_context`, `causality.for_fix`).

---

## Investigation Phases

### Phase 1: Preparation

**Objective**: Gather all available context before investigating.

#### AI Prompt

```
I need to investigate bug fix commit <SHA> for causality analysis.

**Step 1: Query our database for existing information**

Run these queries (see docs/queries/ for SQL):
- `commit.full_context` with $sha = <SHA>
- `commit.files_changed` with $sha = <SHA>
- `commit.subsystems` with $sha = <SHA>
- `causality.for_fix` with $bug_fix_sha = <SHA>
- `investigation.for_commit` with $bug_fix_sha = <SHA>

For each subsystem found, also run:
- `regression.by_subsystem` with $subsystems = <found subsystems>

**Step 2: Gather git context**

Execute these git commands:
- git show <SHA> --stat (overview)
- git show <SHA> (full diff)
- Parse commit message for issue/PR references (#NNN patterns)

**Step 3: Fetch GitHub context**

If the commit references issues or PRs:
- gh issue view <number> --json title,body,comments
- gh pr view <number> --json title,body,comments,reviews

Search for related discussions:
- gh issue list --search "<keywords from commit message>" --json number,title

**Step 4: Record the investigation start**

Create investigation record:
- bug_fix_sha: <SHA>
- investigator: "ai-agent"
- started_at: <current timestamp>

**Output format:**
Summarize findings in structured format:
- Commit details (author, date, message, files, subsystems)
- Risk score and classification
- Existing causality links (if any)
- Prior investigations (if any)
- Regression patterns in affected subsystems
- GitHub context (issues, PR discussions)
```

---

### Phase 2: Candidate Identification

**Objective**: Find commits that could have introduced the bug.

#### AI Prompt

```
For bug fix commit <SHA>, identify candidate commits that may have introduced the bug.

**Step 1: Git Blame Analysis**

For each file modified in the fix:
- git blame <SHA>^1 -- <file-path>
- Focus on lines changed in the fix
- Extract commit SHAs that last touched those lines

Record blame output as evidence (type: "blame").

**Step 2: Check for explicit references**

Parse the fix commit message for:
- "introduced in <sha>", "caused by <sha>"
- "reverts <sha>", "revert of <sha>"
- Issue references that discuss the cause

**Step 3: Query database for candidates**

Run these queries:
- `candidate.high_risk_nearby` with:
  - $subsystems = <affected subsystems>
  - $before_date = <bug fix date>
  - $risk_threshold = 40
  - $days_back = 30

- `candidate.recent_in_files` with:
  - $file_paths = <files changed in fix>
  - $before_date = <bug fix date>
  - $days_back = 14

- `candidate.known_causes` with:
  - $subsystems = <affected subsystems>
  - $min_confidence = 0.5

**Step 4: Check candidate history**

For each candidate found, run:
- `candidate.prior_verdicts` with $candidate_sha = <candidate>

This tells us if the candidate was examined in other investigations.

**Step 5: Record candidates**

For each candidate, create record:
- investigation_id: <current>
- candidate_sha: <SHA>
- verdict: "pending"
- order_examined: <sequence number>

**Output format:**
List candidates with:
- SHA and commit message
- Discovery method (blame/explicit/temporal/database)
- Prior verdicts (if any)
- Initial relevance assessment
```

---

### Phase 3: Candidate Examination

**Objective**: Examine each candidate to determine if it caused the bug.

#### AI Prompt (per candidate)

```
Examine candidate commit <CANDIDATE-SHA> as potential cause of bug fix <BUG-FIX-SHA>.

**Step 1: Understand the candidate**

- git show <CANDIDATE-SHA> (full diff)
- git show <CANDIDATE-SHA> --stat (files overview)

**Step 2: Query database context**

Run these queries:
- `commit.full_context` with $sha = <CANDIDATE-SHA>
- `causality.caused_by` with $cause_sha = <CANDIDATE-SHA>
- `candidate.prior_verdicts` with $candidate_sha = <CANDIDATE-SHA>

**Step 3: Compare to the bug fix**

Analyze:
- What lines/functions does the fix modify?
- Did this candidate touch those same lines/functions?
- Is there a logical connection between changes?

**Step 4: Fetch GitHub context for candidate**

If candidate has associated PR:
- gh pr view <number> --json comments,reviews
- Look for reviewer concerns or follow-up issues

Search for issues mentioning this candidate:
- gh issue list --search "<candidate short sha>" --json number,title

**Step 5: Make determination**

Based on static analysis (no code execution), assign verdict:
- "root_cause": This commit directly introduced the bug
- "contributing": Contributed but not primary cause
- "ruled_out": Not related to the bug
- "uncertain": Cannot determine from available evidence

**Step 6: Record verdict**

Update candidate record:
- verdict: <determined verdict>
- rejection_reason: <if ruled_out, explain why>
- reasoning: <full explanation>

Add evidence:
- evidence_type: "diff" | "github_context" | "manual_note"
- content_preview: <relevant excerpt>

**Output format:**
- Verdict: <verdict>
- Confidence: <0.0-1.0>
- Reasoning: <explanation>
- Evidence captured: <list of evidence types>
```

---

### Phase 4: GitHub Context Enrichment

**Objective**: Gather additional context from upstream discussions.

#### AI Prompt

```
For bug fix <SHA>, search GitHub for additional context.

**Step 1: Direct references**

From commit message, extract and fetch:
- Issue references: gh issue view <N> --json title,body,comments
- PR references: gh pr view <N> --json title,body,comments,reviews

**Step 2: Search for related issues**

Search GitHub for:
- Error messages from the commit: gh issue list --search "<error text>"
- File names that were fixed: gh issue list --search "<filename>"
- Function names: gh issue list --search "<function name>"

**Step 3: Check candidate PRs**

For each candidate commit:
- Find associated PR (if any)
- Check review comments for concerns raised
- Look for follow-up issues or fixes

**Step 4: Extract insights**

From each issue/PR found, note:
- Initial problem report (symptoms)
- Discussion of root cause
- References to other commits
- Timeline (reported vs fixed)

**Step 5: Cross-reference with candidates**

Check if any issues mention our candidates:
- Direct SHA references
- Author mentions around time of candidate
- "this broke X" comments

**Step 6: Record evidence**

For each relevant finding:
- evidence_type: "github_issue" | "github_pr" | "github_review"
- file_path: <GitHub URL>
- content_preview: <key excerpt>

**Output format:**
- Issues found: <list with summaries>
- PR context: <relevant review comments>
- Cross-references to candidates: <any mentions>
```

---

### Phase 5: Conclusion

**Objective**: Synthesize evidence and record final determination.

#### AI Prompt

```
Conclude investigation for bug fix <SHA>.

**Step 1: Review all evidence**

Summarize:
- Phase 1: Initial context and existing analysis
- Phase 2: Candidates identified and methods used
- Phase 3: Verdicts for each candidate examined
- Phase 4: GitHub context discovered

**Step 2: Query for final context**

Run:
- `feedback.accuracy_by_method` (to calibrate confidence)
- `investigation.by_subsystem` with $sha = <SHA> (similar investigations)

**Step 3: Determine conclusion type**

Choose one:
- "confirmed": Evidence supports automated finding
- "rejected": Evidence contradicts automated finding
- "inconclusive": Cannot determine root cause
- "new_cause_found": Found different cause than automation

**Step 4: Assign confidence**

Based on evidence strength:
- 0.9-1.0: Multiple independent sources agree
- 0.7-0.89: Strong evidence from one source
- 0.5-0.69: Reasonable but uncertain
- 0.3-0.49: Weak evidence, best guess
- <0.3: Mark as "inconclusive"

**Step 5: Record conclusion**

Update investigation:
- completed_at: <timestamp>
- conclusion_type: <type>
- final_cause_sha: <root cause SHA or NULL>
- confidence_override: <confidence>
- summary: <explanation>

Update causality record:
- human_verified: true
- human_confidence: <confidence>
- automation_was_correct: <true/false>

**Step 6: Identify improvement opportunities**

Note:
- What automation got right/wrong
- What method would have found correct cause
- Patterns for improving automation

**Output format:**
- Conclusion: <type>
- Root cause: <SHA or "undetermined">
- Confidence: <0.0-1.0>
- Automation correct: <yes/no>
- Summary: <brief explanation>
- Improvement suggestions: <list>
```

---

## Complete Investigation Template

Use this template to run a full IA session:

```markdown
# Investigation: <BUG-FIX-SHA>

## Metadata

- Target: <SHA> "<commit message>"
- Investigator: ai-agent
- Started: <timestamp>

## Phase 1: Preparation

<Run Phase 1 prompt>

### Database Context

- Risk score: <score>
- Category: <category>
- Subsystems: <list>
- Existing causality: <links or "none">
- Prior investigations: <count or "none">

### GitHub Context

- Related issues: <list>
- Related PRs: <list>

## Phase 2: Candidate Identification

### Candidates Found

| #   | SHA | Message | Method   | Prior Verdicts      |
| --- | --- | ------- | -------- | ------------------- |
| 1   | ... | ...     | blame    | none                |
| 2   | ... | ...     | temporal | ruled_out (inv_123) |

## Phase 3: Candidate Examination

### Candidate 1: <SHA>

<Run Phase 3 prompt>

**Verdict**: <verdict>
**Reasoning**: <explanation>

### Candidate 2: <SHA>

...

## Phase 4: GitHub Context

<Run Phase 4 prompt>

### Findings

- ...

## Phase 5: Conclusion

<Run Phase 5 prompt>

### Final Determination

- **Conclusion**: <type>
- **Root Cause**: <SHA or undetermined>
- **Confidence**: <0.0-1.0>
- **Automation Correct**: <yes/no>

### Summary

<Brief explanation>

### Improvement Notes

- ...

---

## Records Created

- Investigation ID: <id>
- Candidates recorded: <count>
- Evidence captured: <count>
- Causality updated: <yes/no>
```

---

## Batch Investigation Workflow

For investigating multiple commits efficiently:

#### AI Prompt: Get Investigation Queue

```
Get prioritized queue of commits needing investigation.

Run query `stats.queue_for_investigation` to get commits ordered by:
1. Critical risk (score >= 75)
2. Low confidence (< 0.6)
3. Weak method (temporal)
4. Standard priority

For each commit in queue:
- Check `investigation.for_commit` to skip already investigated
- Group by subsystem for efficient context reuse

Output: Ordered list of commits to investigate with priority reasons.
```

#### AI Prompt: Batch Summary

```
After completing a batch of investigations, generate summary.

Run these queries:
- `feedback.accuracy_overall` - current accuracy
- `feedback.accuracy_by_method` - per-method breakdown
- `feedback.rejection_reasons` - common issues
- `stats.investigation_summary` - activity stats

Output:
- Investigations completed: <count>
- Automation accuracy: <percent>
- Most common rejection reason: <reason>
- Recommendations for automation improvement
```

---

## Related Documents

- [GUIDE-investigative-analysis.md](./GUIDE-investigative-analysis.md) - Human CLI workflow
- [DB-QUERIES-README.md](./DB-QUERIES-README.md) - Query library index
- [PLAN-interactive-research-model.md](./PLAN-interactive-research-model.md) - Data model design
