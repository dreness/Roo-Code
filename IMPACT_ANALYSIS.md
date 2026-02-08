# Detailed Impact Analysis: thinkingLevel Validation Bug

## Executive Summary

The thinkingLevel validation bug caused API errors when users switched between Gemini models with different reasoning effort capabilities while having a stale reasoning effort setting from the previous model.

## Who Was Affected

**All users who:**
1. Used multiple Gemini models with different reasoning effort support, AND
2. Switched between these models within the same Roo-Code session/configuration

**Specific user scenarios:**

### High-Impact Scenario
A user working with `gemini-3-flash-preview` (supports: minimal, low, medium, high) who:
1. Selected "medium" or "minimal" reasoning effort
2. Switched to `gemini-3-pro-preview` (supports only: low, high)
3. **Result**: API request would fail with validation error from Google's API

### Moderate-Impact Scenario  
A user who:
1. Used `gemini-3-pro-preview` with "low" effort
2. Switched to `gemini-3-flash-preview`
3. **Result**: No error, but user couldn't access the additional "minimal" and "medium" options without manually changing settings

## Conditions Required for Bug to Occur

The bug manifested when **ALL** of these conditions were met:

1. **Model switching**: User switched from one Gemini model to another
2. **Different capabilities**: The two models had different `supportsReasoningEffort` arrays
3. **Incompatible setting**: The previously selected effort was NOT in the new model's supported set
4. **Settings persistence**: The reasoning effort setting was retained across model switches

### Example Trigger Sequence

```
Time T0: User selects gemini-3-flash-preview
Time T1: User sets reasoning effort to "medium"
Time T2: User switches to gemini-3-pro-preview
Time T3: User sends a request
        ❌ API ERROR: gemini-3-pro-preview doesn't support "medium"
```

## Severity of the Problem

### Error Type: **API Request Failure** (Complete Blocking)

When the bug occurred, it was **completely blocking**:

- **User Experience**: Total failure - no response from the model
- **Error Message**: Cryptic Google API error (e.g., "Invalid thinkingLevel: medium")
- **Recovery**: User had to manually:
  1. Realize the issue was related to reasoning effort settings
  2. Navigate to settings
  3. Change reasoning effort to a compatible value
  4. Retry the request

### Impact Severity Levels

#### Critical Impact (Complete Block)
- **Frequency**: Every request after model switch with incompatible effort
- **User Effect**: Cannot use the model at all until settings manually changed
- **Error Visibility**: Google API error (not user-friendly)
- **Workaround Difficulty**: Moderate - requires understanding of the settings system

#### Data Loss Risk
- **Low**: No data loss - requests simply failed
- **User Time Lost**: 5-15 minutes per occurrence to diagnose and fix

### Affected Model Combinations

Based on the model definitions in the codebase:

| Source Model | Effort Set | Target Model | Effort Support | Result |
|--------------|------------|--------------|----------------|---------|
| gemini-3-flash-preview | "minimal" | gemini-3-pro-preview | ["low", "high"] | ❌ API ERROR |
| gemini-3-flash-preview | "medium" | gemini-3-pro-preview | ["low", "high"] | ❌ API ERROR |
| gemini-3-pro-preview | "low" | gemini-3-flash-preview | ["minimal", "low", "medium", "high"] | ✅ Works (but suboptimal) |
| gemini-3-pro-preview | "high" | gemini-3-flash-preview | ["minimal", "low", "medium", "high"] | ✅ Works (but suboptimal) |

## Why This Bug Was Particularly Problematic

### 1. Silent State Carry-Over
The bug exploited the fact that user settings persisted across model switches. This is normally a feature (users don't want to reconfigure everything), but became a liability without validation.

### 2. Non-Obvious Error Source
When users saw the Google API error, they likely:
- Blamed the API/network
- Blamed the model being unavailable
- Did NOT immediately connect it to a stale reasoning effort setting

### 3. Timing of Introduction
The bug became more severe over time:
- **Nov 17, 2025**: Introduced with basic "low"/"high" support
- **Dec 9, 2025**: **Severity increased** when "minimal" and "medium" were added
  - More models with different capabilities
  - More opportunities for incompatible combinations

### 4. User Trust Impact
Repeated failures when switching models could:
- Reduce user confidence in the platform
- Create perception that certain models are "broken"
- Lead to unnecessary support tickets

## Real-World Usage Patterns Affected

### Development Workflow
Users experimenting with different models to find the best one for their task:
```
Try gemini-3-flash-preview (fast, cheap) → Set medium effort
Not getting good results → Switch to gemini-3-pro-preview (better quality)
💥 Error! Unable to proceed
```

### Cost Optimization
Users switching between models for cost reasons:
```
Use gemini-3-pro-preview for complex task → Set high effort  
Switch to gemini-3-flash-preview for simple tasks → Set minimal effort
Switch back to gemini-3-pro-preview → 💥 "minimal" not supported
```

### A/B Testing
Teams comparing model outputs:
```
Model A with medium effort → switch → Model B (doesn't support medium) → Error
```

## Technical Root Cause

The code blindly passed through the `selectedEffort` without checking if it was in the model's `supportsReasoningEffort` array:

```typescript
// BEFORE (buggy code)
const selectedEffort = (settings.reasoningEffort ?? model.reasoningEffort)

if (!isGeminiThinkingLevel(selectedEffort)) {
    return undefined
}

return { thinkingLevel: selectedEffort, includeThoughts: true }
// ❌ No check against model.supportsReasoningEffort!
```

```typescript
// AFTER (fixed code)
const effortToUse =
    Array.isArray(model.supportsReasoningEffort) &&
    isGeminiThinkingLevel(selectedEffort) &&
    !model.supportsReasoningEffort.includes(selectedEffort)  // ✅ Validation!
        ? model.reasoningEffort  // Fallback to model default
        : selectedEffort

return { thinkingLevel: effortToUse, includeThoughts: true }
```

## Fix Behavior

The fix gracefully falls back to the model's default reasoning effort when the user's selected effort is not supported:

1. **User has "medium" selected**
2. **Switches to model supporting only ["low", "high"]**
3. **Fix detects incompatibility**
4. **Automatically uses model's default** (e.g., "low" for gemini-3-pro-preview)
5. **Request succeeds** ✅

This means:
- ✅ No API errors
- ✅ No manual intervention required
- ✅ Request completes with reasonable default
- ⚠️ User might not realize effort level changed (but better than error)

## Estimated Impact Scale

**Active Duration**: 82 days (Nov 17, 2025 - Feb 7, 2026)

**Potential User Impact**:
- Users switching between Gemini 3 models: **High** (likely encountered multiple times)
- Users staying on one model: **None**
- New users starting after Dec 9, 2025: **Higher** (more model/effort combinations)

**Severity Rating**: **7/10**
- Not data-corrupting or security-related
- Complete functional block when triggered
- Requires manual intervention
- Non-obvious error message
- Affects common workflow (model experimentation)

## Prevention Lessons

1. **Validate settings against capabilities** - Don't assume settings are always valid
2. **Test cross-model workflows** - Settings persistence + model switching = edge cases
3. **Clear error messages** - If an error occurs, explain what setting is incompatible
4. **Smart defaults** - When validation fails, fall back gracefully rather than error
5. **Settings migration** - When adding new capabilities, consider existing user settings
