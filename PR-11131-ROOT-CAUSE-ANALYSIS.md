# PR #11131 Root Cause Analysis: Tool Block ID Sanitization

## Executive Summary

PR #11131 fixed a `ToolResultIdMismatchError` that occurred when tool result IDs didn't match tool use IDs in the API conversation history. The root cause was an **inconsistent application of ID sanitization** between where `tool_use` blocks were saved to history (`Task.ts`) and where `tool_result` blocks were created (`presentAssistantMessage.ts`). This affected approximately **926 occurrences** reported via PostHog telemetry in version 3.46.0.

## Background: The Tool Execution Flow

To understand the problem, it's essential to understand how tool execution and API conversation history work in this codebase:

### 1. Tool Use Block Creation and Storage

When the AI model responds with tool calls:

1. **Streaming Phase** (`Task.ts:3400-3570`): Tool use blocks arrive during streaming
2. **Sanitization** (`Task.ts:3459-3480`): Tool use IDs are sanitized using `sanitizeToolUseId()` before being saved to API history
   - Original ID: `functions.read_file:0`
   - Sanitized ID: `functions_read_file_0`
3. **Storage** (`Task.ts:3549-3553`): The assistant message with **sanitized** tool_use IDs is added to `apiConversationHistory`

```typescript
const sanitizedId = sanitizeToolUseId(toolCallId)
// ... later ...
await this.addToApiConversationHistory(
    { role: "assistant", content: assistantContent },
    reasoningMessage || undefined,
)
```

### 2. Tool Result Block Creation (THE BUG LOCATION)

When tools are executed in `presentAssistantMessage.ts`:

1. **Tool Execution**: Tools run and produce results
2. **Result Creation** (BEFORE PR #11131): Tool result blocks were created with **unsanitized** `toolCallId`:
   ```typescript
   cline.pushToolResultToUserContent({
       type: "tool_result",
       tool_use_id: toolCallId,  // ❌ UNSANITIZED: "functions.read_file:0"
       content: resultContent,
   })
   ```
3. **The Mismatch**: 
   - Tool use ID in history: `functions_read_file_0` (sanitized)
   - Tool result ID trying to reference it: `functions.read_file:0` (unsanitized)
   - **Result**: `ToolResultIdMismatchError`

### 3. Validation and Error Detection

Before messages are added to API history, they pass through `validateAndFixToolResultIds()`:

- **Location**: Called in `Task.ts:1163` and `Task.ts:1241`
- **Purpose**: Validates that tool_result IDs match tool_use IDs from the previous assistant message
- **Error Tracking**: Reports mismatches to PostHog telemetry as `ToolResultIdMismatchError`
- **Automatic Fixing**: Attempts to fix mismatches by position-based matching, but this is a **workaround** for what should have been prevented

## The Root Cause

The root cause was a **split-brain problem** in ID sanitization:

### Path 1: Tool Use IDs (Correct)
```
AI Model Response → tool_use block created → sanitizeToolUseId() applied
→ Saved to API history with sanitized ID (e.g., "functions_read_file_0")
```

### Path 2: Tool Result IDs (Incorrect - Before PR #11131)
```
Tool execution → tool_result block created → NO SANITIZATION APPLIED
→ Attempted to reference tool_use with unsanitized ID (e.g., "functions.read_file:0")
```

### Why This Happened

The ID sanitization logic was added to `Task.ts` to handle API validation requirements (IDs must match `^[a-zA-Z0-9_-]+$`), but the corresponding sanitization was **not added** to `presentAssistantMessage.ts` where tool results are created. This created an asymmetry in the codebase.

## The Fix (PR #11131)

The fix was surgical and precise:

1. **Import sanitizeToolUseId** in `presentAssistantMessage.ts`:
   ```typescript
   import { sanitizeToolUseId } from "../../utils/tool-id"
   ```

2. **Apply sanitization at all 7 locations** where tool_result blocks are created:
   ```typescript
   cline.pushToolResultToUserContent({
       type: "tool_result",
       tool_use_id: sanitizeToolUseId(toolCallId),  // ✅ NOW SANITIZED
       content: resultContent,
   })
   ```

3. **Added test coverage** for the exact pattern seen in PostHog errors:
   ```typescript
   expect(sanitizeToolUseId("functions.read_file:0")).toBe("functions_read_file_0")
   ```

## Scope of Change: Relationship to Queued Outgoing User Prompts

### Understanding "Queued Outgoing User Prompts"

The codebase has a message queueing system for handling user prompts that arrive while the task is busy:

1. **Queueing** (`MessageQueueService.ts`): Messages are queued when they arrive during certain task states
2. **Processing** (`Task.ts:4756-4771`): After operations complete, queued messages are dequeued and submitted via `submitUserMessage()`
3. **Flow to History**: These user messages eventually flow through the same `addToApiConversationHistory()` path

### How Tool Block ID Sanitization Relates to Queued Prompts

The relationship is **indirect but critical**:

#### Scenario: Parallel Tool Execution with Queued User Prompts

Consider this sequence:

1. **T=0ms**: AI responds with multiple tool_use blocks (e.g., `read_file`, `new_task`)
2. **T=10ms**: Tools begin executing in parallel during streaming
3. **T=20ms**: User types a new message → **queued** because task is busy
4. **T=30ms**: First tool (`read_file`) completes → `pushToolResultToUserContent()` called
5. **T=40ms**: Second tool (`new_task`) triggers delegation → `flushPendingToolResultsToHistory()` called
6. **T=50ms**: Queued user message is dequeued and processed

#### The Critical Point: ID Validation During Flush

When `flushPendingToolResultsToHistory()` is called (step 5):

```typescript
// Task.ts:1237-1241
const validatedMessage = validateAndFixToolResultIds(userMessage, historyForValidation)
```

This validation compares:
- **Tool result IDs** from `userMessageContent` (accumulated from tool executions)
- **Tool use IDs** from the previous assistant message in `apiConversationHistory`

**Before PR #11131**: The validation would detect a mismatch because:
- Tool use ID in history: `functions_read_file_0` (sanitized)
- Tool result ID in pending content: `functions.read_file:0` (unsanitized)
- Result: `ToolResultIdMismatchError` captured in PostHog

**After PR #11131**: Both IDs are sanitized consistently:
- Tool use ID in history: `functions_read_file_0` (sanitized in Task.ts)
- Tool result ID in pending content: `functions_read_file_0` (sanitized in presentAssistantMessage.ts)
- Result: No mismatch, validation passes

### Why This Matters for Queued Prompts

Queued user prompts are particularly relevant because:

1. **Timing Sensitivity**: When messages are queued, there's a higher likelihood of tool results being flushed to history before the next API request (due to the asynchronous nature of queueing)

2. **Validation Trigger Points**: Queued prompts trigger `submitUserMessage()` which may cause:
   - Context condensing (`condenseContext()` → `flushPendingToolResultsToHistory()`)
   - New API requests (which flush pending tool results)

3. **Race Condition Exposure**: The queueing mechanism exposes timing-dependent code paths where tool results might be validated against API history at different points than in synchronous execution

## Impact Analysis

### Affected Patterns

The bug affected API providers that generate function call IDs with special characters:

- **Gemini/OpenRouter**: Generate IDs like `functions.read_file:0`, `functions.write_to_file:1`
- **MCP Tools**: Could generate IDs like `mcp.server:tool/name`

### Why PostHog Reported 926 Occurrences

1. **Version 3.46.0**: The issue existed in production
2. **Gemini/OpenRouter Usage**: Users with these providers would hit the issue on every tool call
3. **Validation Catches All**: `validateAndFixToolResultIds()` reports **every** mismatch to PostHog
4. **Multiple Tools Per Turn**: A single AI turn with 3 tools = 3 error reports

### Why It Didn't Break Completely

The validation layer (`validateAndFixToolResultIds()`) served as a **defensive safety net**:

- **Position-based fixing**: Attempts to match tool results to tool uses by position
- **Automatic correction**: Fixes mismatches when possible
- **Error tracking**: Reports to PostHog but doesn't fail the operation

However, this was masking the **root cause** rather than preventing the issue from occurring.

## Technical Debt Implications

### Before PR #11131 (Technical Debt)

1. **Split Responsibility**: ID sanitization logic existed in two places:
   - `Task.ts`: Sanitizes before saving to history
   - `validateAndFixToolResultIds()`: Attempts to fix mismatches after the fact

2. **Validation as Workaround**: The validation layer was doing **corrective work** that should have been **preventative**

3. **Telemetry Noise**: 926 error reports for what should have been a non-error

### After PR #11131 (Debt Reduced)

1. **Consistent Sanitization**: IDs are sanitized at creation time in both places:
   - `Task.ts`: When saving tool_use blocks
   - `presentAssistantMessage.ts`: When creating tool_result blocks

2. **Validation as Safety Net**: Now only catches **genuine anomalies** rather than systematic mismatches

3. **Clean Telemetry**: Error reports only for actual problems

## Conclusion

PR #11131 fixed a fundamental architectural inconsistency where tool block IDs were sanitized in one part of the system but not another. The scope of the change is **narrow** (adding sanitization to 7 locations in one file) but the **impact is significant** because:

1. **Prevents Systematic Errors**: Eliminates 926+ PostHog error reports
2. **Ensures API Compliance**: Tool result IDs now always match tool use IDs
3. **Reduces Reliance on Defensive Code**: Validation layer no longer needs to fix preventable issues
4. **Improves Reliability**: Especially important for queued user prompts which can trigger validation at unexpected times

The relationship to queued outgoing user prompts is that they **expose timing-dependent code paths** where tool results are flushed to history and validated. Without consistent ID sanitization, these paths would trigger `ToolResultIdMismatchError` reports, which PR #11131 now prevents.

## References

- **PR #11131**: https://github.com/RooCodeInc/Roo-Code/pull/11131
- **Linear Issue**: EXT-711
- **Key Files Changed**:
  - `src/core/assistant-message/presentAssistantMessage.ts` (7 sanitization calls added)
  - `src/utils/__tests__/tool-id.spec.ts` (test coverage added)
- **Validation Logic**: `src/core/task/validateToolResultIds.ts`
- **ID Sanitization Utility**: `src/utils/tool-id.ts`
