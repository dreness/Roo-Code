# Investigation: When Problems Fixed by Commit 12cddc969 First Appeared

## Summary

This document tracks when the two problems fixed by commit [12cddc969](https://github.com/RooCodeInc/Roo-Code/commit/12cddc96971dca86beda687c266a705c23fba0ab) first appeared in the Roo-Code project.

## The Fix (Commit 12cddc969 - Feb 7, 2026)

The fix commit addressed two distinct problems:

1. **thinkingLevel Validation Issue**: `getGeminiReasoning()` now validates the selected effort against the model's `supportsReasoningEffort` array before sending it as `thinkingLevel`. When a stale settings value (e.g. 'medium' from a different model) is not in the supported set, it falls back to the model's default `reasoningEffort`.

2. **Empty Stream Handling**: `GeminiHandler.createMessage()` now tracks whether any text content was yielded during streaming and handles `NoOutputGeneratedError` gracefully instead of surfacing the cryptic 'No output generated' error.

## Problem 1: thinkingLevel Validation Bug

### When It First Appeared

**Commit**: [f7c2e8d16](https://github.com/RooCodeInc/Roo-Code/commit/f7c2e8d16) - "Improve Google Gemini defaults, temperature, and cost reporting"  
**Date**: November 17, 2025  
**Author**: Hannes Rudolph

### What Happened

In commit f7c2e8d16, the `getGeminiReasoning()` function was introduced in `src/api/transform/reasoning.ts`. This function had the following logic:

```typescript
// Effort-based models on Google GenAI: only support explicit low/high levels.
const selectedEffort = (settings.reasoningEffort ?? model.reasoningEffort) as
    | ReasoningEffortExtended
    | "disable"
    | undefined

// Respect "off" / unset semantics.
if (!selectedEffort || selectedEffort === "disable") {
    return undefined
}

// Only map "low" and "high" to thinkingLevel; ignore other values.
if (selectedEffort !== "low" && selectedEffort !== "high") {
    return undefined
}

return { thinkingLevel: selectedEffort, includeThoughts: true }
```

### The Problem

The function did **not validate** that the selected effort level was actually supported by the specific model being used. It only checked if the effort was "low" or "high", but didn't verify against the model's `supportsReasoningEffort` array.

This meant that if a user selected "medium" effort for one model (like `gemini-3-flash-preview` which supports `["minimal", "low", "medium", "high"]`), and then switched to another model (like `gemini-3-pro-preview` which only supports `["low", "high"]`), the stale "medium" setting would be sent to the API, causing errors.

### Evolution

1. **Nov 17, 2025** (f7c2e8d16): Bug introduced - no validation against model's supported efforts
2. **Nov 18, 2025** (55e9c880d): "fix: gemini maxOutputTokens and reasoning config" - did not fix the validation issue
3. **Dec 9, 2025** (048e7f350): "feat(gemini): add minimal and medium reasoning effort levels" - expanded the function to support "minimal" and "medium" but still no model-specific validation
4. **Feb 7, 2026** (12cddc969): **FIXED** - Added validation against `model.supportsReasoningEffort` array

### Time Active

**Duration**: Approximately **82 days** (November 17, 2025 to February 7, 2026)

## Problem 2: Empty Stream Handling Bug

### When It First Appeared

**Commit**: [afe51e0fe](https://github.com/RooCodeInc/Roo-Code/commit/afe51e0fe) - "feat: migrate Gemini and Vertex providers to AI SDK"  
**Date**: February 4, 2026  
**Author**: Daniel

### Background

The `hasContent` tracking was originally introduced in commit [47320dca6](https://github.com/RooCodeInc/Roo-Code/commit/47320dca6) on December 11, 2025, to handle cases where the model returned only reasoning tokens but no actual output.

### What Happened

The AI SDK migration removed the `hasContent` tracking that existed in the previous implementation. Before the migration, the code tracked whether any actual content was yielded:

```typescript
let hasContent = false
let hasReasoning = false

for await (const chunk of result) {
    // ... various checks that would set hasContent = true
    if (part.text) {
        hasContent = true
        yield { type: "text", text: part.text }
    }
    // ... or for function calls
    if (part.functionCall) {
        hasContent = true
        // ... yield tool call
    }
}
```

After the AI SDK migration (afe51e0fe), this tracking was removed:

```typescript
// Use streamText for streaming responses
const result = streamText(requestOptions)

// Process the full stream to get all events including reasoning
for await (const part of result.fullStream) {
    for (const chunk of processAiSdkStreamPart(part)) {
        yield chunk
    }
}
```

### The Problem

Without tracking `hasContent`, the handler couldn't detect when:
- The model returned only reasoning/thinking tokens but no actual output
- Content filtering blocked the response
- An unsupported thinking configuration caused an empty response

Additionally, when the stream produced no output, the AI SDK would throw `NoOutputGeneratedError` when trying to read `result.usage`, and this error would bubble up as a cryptic "No output generated" message instead of being handled gracefully.

### Time Active

**Duration**: Approximately **3 days** (February 4, 2026 to February 7, 2026)

## Key Commits Timeline

| Date | Commit | Description | Impact |
|------|--------|-------------|--------|
| Nov 17, 2025 | f7c2e8d16 | Improve Google Gemini defaults | **Bug 1 introduced**: No thinkingLevel validation |
| Nov 18, 2025 | 55e9c880d | Fix gemini maxOutputTokens and reasoning config | Bug 1 remains |
| Dec 9, 2025 | 048e7f350 | Add minimal and medium reasoning effort levels | Bug 1 remains (expanded scope) |
| Dec 11, 2025 | 47320dca6 | Fix empty Gemini responses and reasoning loops | hasContent tracking introduced |
| Feb 4, 2026 | afe51e0fe | Migrate Gemini and Vertex to AI SDK | **Bug 2 introduced**: Empty stream handling removed during refactor |
| Feb 7, 2026 | 12cddc969 | **Fix both bugs** | Both bugs fixed |

## Technical Details of the Fix

### Fix for Problem 1 (thinkingLevel Validation)

Added model-specific validation in `src/api/transform/reasoning.ts`:

```typescript
// Validate that the selected effort is supported by this specific model.
// e.g. gemini-3-pro-preview only supports ["low", "high"] — sending
// "medium" (carried over from a different model's settings) causes errors.
const effortToUse =
    Array.isArray(model.supportsReasoningEffort) &&
    isGeminiThinkingLevel(selectedEffort) &&
    !model.supportsReasoningEffort.includes(selectedEffort)
        ? model.reasoningEffort
        : selectedEffort

// Effort-based models on Google GenAI support minimal/low/medium/high levels.
if (!effortToUse || !isGeminiThinkingLevel(effortToUse)) {
    return undefined
}

return { thinkingLevel: effortToUse, includeThoughts: true }
```

### Fix for Problem 2 (Empty Stream Handling)

Added content tracking and graceful error handling in `src/api/providers/gemini.ts`:

```typescript
// Track whether any text content was yielded (not just reasoning/thinking)
let hasContent = false

// Process the full stream to get all events including reasoning
for await (const part of result.fullStream) {
    // ... capture thought signatures ...
    
    for (const chunk of processAiSdkStreamPart(part)) {
        if (chunk.type === "text" || chunk.type === "tool_call_start") {
            hasContent = true
        }
        yield chunk
    }
}

// If the stream completed without yielding any text content, inform the user
if (!hasContent) {
    yield {
        type: "text" as const,
        text: "Model returned an empty response. This may be caused by an unsupported thinking configuration or content filtering.",
    }
}

// ... later ...

// Wrap in try-catch to handle NoOutputGeneratedError
try {
    const usage = await result.usage
    if (usage) {
        yield this.processUsageMetrics(usage, info, providerMetadata)
    }
} catch (usageError) {
    if (usageError instanceof NoOutputGeneratedError) {
        // If we already yielded the empty-stream message, suppress this error
        if (hasContent) {
            throw usageError
        }
        // Otherwise the informative message was already yielded above — no-op
    } else {
        throw usageError
    }
}
```

## Conclusion

- **Problem 1 (thinkingLevel validation)**: Active for ~82 days from introduction to fix (Nov 17, 2025 - Feb 7, 2026)
- **Problem 2 (empty stream handling)**: 
  - Originally implemented on Dec 11, 2025 (47320dca6)
  - Accidentally removed during AI SDK migration on Feb 4, 2026 (afe51e0fe)
  - Re-implemented on Feb 7, 2026 (12cddc969)
  - Bug active for ~3 days (Feb 4-7, 2026)

Both problems were introduced during refactoring/feature addition work and were fixed together in a single comprehensive fix commit. The empty stream handling issue was particularly notable as it was a regression - functionality that had been working was accidentally removed during a major refactoring (AI SDK migration) and then had to be re-added.
