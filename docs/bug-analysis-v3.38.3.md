# Bug Analysis Report: Presence in v3.38.3

## Version 3.38.3 Information

- **Commit:** d82ed6fa3f3aeb85f43320232f8d4d33946ef4c4
- **Release Date:** January 3, 2026

## Summary

**Only 2 out of 8 bugs (25%) were present in v3.38.3**

The remaining 6 bugs (75%) were introduced AFTER v3.38.3 when parallel tool calling was re-enabled on January 18, 2026, which is 15 days after the v3.38.3 release.

---

## ✅ Bugs Present in v3.38.3 (2 bugs)

### 1. Duplicate tool_result blocks - `f2276bebc`

- **Fix Date:** January 5, 2026 (2 days after v3.38.3)
- **PR:** #10466
- **Description:** Add explicit deduplication for duplicate tool_result blocks
- **Files Changed:** `src/core/task/Task.ts`
- **Duration in Released Builds:** 2 days (from v3.38.3 release until fix)

### 2. Duplicate tool_result blocks causing API errors - `741b2680b`

- **Fix Date:** January 6, 2026 (3 days after v3.38.3)
- **PR:** #10497
- **Description:** Prevent duplicate tool_result blocks causing API errors
- **Files Changed:** `src/core/assistant-message/presentAssistantMessage.ts`
- **Duration in Released Builds:** 3 days (from v3.38.3 release until fix)

---

## ❌ Bugs NOT Present in v3.38.3 (6 bugs)

All 6 of these bugs were introduced after parallel tool calling was re-enabled on January 18, 2026:

| Commit      | Description                                                      | PR     | Fixed        |
| ----------- | ---------------------------------------------------------------- | ------ | ------------ |
| `621d9500d` | Sanitize tool_use IDs to match API validation pattern            | #10649 | Jan 12, 2026 |
| `bbb6a6e4b` | Prevent duplicate tool_use IDs causing API 400 errors            | #10760 | Jan 15, 2026 |
| `6eafee94b` | Prevent duplicated tool call rendering in parallel execution     | -      | Jan 27, 2026 |
| `17d3456e9` | Remove duplicate tool_call emission from Responses API providers | #11008 | Jan 27, 2026 |
| `f5004ac40` | Prevent time-travel bug in parallel tool calling                 | #11046 | Jan 28, 2026 |
| `340049991` | Sanitize tool_use_id in tool_result blocks to match API history  | #11131 | Jan 30, 2026 |

These bugs are all related to the parallel tool calling feature which was disabled at the time of v3.38.3 release.

---

## Timeline

```
Sept 2025     : Parallel tool calling disabled
Jan 3, 2026   : v3.38.3 released (without parallel tool calling)
Jan 5-6, 2026 : Fixed 2 existing bugs (f2276bebc, 741b2680b)
Jan 18, 2026  : Parallel tool calling re-enabled (commit 0d4fe08d3)
Jan 12-30, 2026: Fixed 6 new parallel-tool-calling-related bugs
```

## Conclusion

For demonstrating bugs that existed in v3.38.3, you can reference:

1. **f2276bebc** (#10466) - Duplicate tool_result blocks deduplication
2. **741b2680b** (#10497) - Duplicate tool_result blocks causing API errors

These two bugs were present at the time of v3.38.3 release and fixed within 2-3 days afterward.
