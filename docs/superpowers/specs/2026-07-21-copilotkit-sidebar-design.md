# CopilotKit v2 Sidebar for the A2UI Composer — Design

- **Date:** 2026-07-21
- **Status:** Approved (design); spec under review
- **Branch / base:** `jerel/copilotkit-sidebar` off `origin/main` (`ec76b5d`, Angular 22.0.6). Worktree `composer-wt/copilotkit-sidebar`.
- **Sibling track:** an option-1 variant (roll composer to Angular 21 for natively-supported `@copilotkit/angular`) is being explored on `jerel/copilotkit-sidebar-ng21`. This spec is the **option-3** track (stay on Angular 22, force `@copilotkit/angular`). The *feature* design here is shared across both tracks; only the Angular version / install mechanism differs.

## Goal

Replace the composer's native "Gemini Assistant" card with a **CopilotKit v2 sidebar** (on AG-UI), keep generation **functionally identical**, hide the A2UI JSON editor at first load, and use **custom tools + tool-renders** so the generate→preview experience is friendlier (no raw JSONL dumped into the conversation).

## Non-goals (v1 / YAGNI)

- No backend. No Copilot Runtime server, no server-side keys.
- Not porting attachments/voice, threads/history persistence, human-in-the-loop, or CopilotKit's sandboxed generative-UI in v1 (all deferred).
- Not changing the A2UI protocol, the catalog system, the preview iframe/renderer, or the healing/validation behavior.
- Not upstreaming to Google (CopilotKit-branded product direction; lives on our line).

## Background — what exists today (verified on `origin/main`)

Client-side, no backend. `ChatCoordinator.submitPrompt(prompt)`:
1. Appends the user turn to `ChatState` history; builds context = `systemPrompt()` (catalog-driven) + history.
2. `LlmClient.chatStream(context)` streams **raw JSONL** text from Gemini via `Standalone3pLlmClient` (user's key, in browser).
3. Accumulates the stream into a live MODEL chat bubble.
4. `processRawLlmPayload(finalRawText)`: `parseAndHealJsonLines` → `CrossFrameValidator.validateOutgoingMessage` → `runCatalogComponentSchemaCheck` (component-name healing) → `StateSync.commitLayoutFromLlm(finalLayoutText)` (writes the editor draft, which drives the preview iframe).
5. Rich typed error handling (`parseError` → error bubble; retryable).

Layout (upstream): a **Dockview** workspace; chat, rendered preview, raw/JSON editor, data-model, events, errors are Dockview panels (`ComposerPanelId`).

Key files: `chat/chat-service/chat-coordinator.ts`, `chat/llm-client/{llm-client.ts,standalone-3p-llm-client.ts}`, `chat/chat-state/chat-state.ts`, `chat/state-sync/state-sync.ts`, `chat/pipeline-status/pipeline-status.ts`, `shell/composer-workspace/*`, `app.config.ts`, `app.routes.ts`.

## Key decisions

1. **Native `@copilotkit/angular@0.1.2` on Angular 22**, forced past its `^19||^20||^21` peer cap. Proven this session: installs (peer mismatch is warning-only), `tsc` clean, `ng build` links the `fesm2022` bundle, `<copilot-chat>` renders + runs at runtime with zero console errors. We own the unsupported-combo risk.
2. **In-browser AG-UI agent** wrapping the existing Gemini flow — no backend; preserves bring-your-own-key.
3. **Generation reframed as a `render_a2ui` tool call** (the package's built-in `RENDER_A2UI_TOOL_NAME`), rendered by a custom tool-render, instead of raw JSONL in the conversation.
4. **Real docked CopilotKit sidebar**, pulled out of the Dockview panel set; Dockview keeps preview + editor + debug.
5. **A2UI JSON editor hidden** from the default Dockview layout at first load; revealable on demand / auto-reveal after first generation.

## Architecture & components

Each unit below is independently testable with a clear interface.

### A2uiGenerationService (extracted core)
- **Does:** the reusable, framework-neutral generation core lifted out of `ChatCoordinator`: `systemPrompt()`, run a streamed Gemini turn via `LlmClient`, parse/heal JSONL, validate via `CrossFrameValidator`, catalog component-name heal, and commit via `StateSync`. Behavior byte-for-byte equivalent to today.
- **Interface:** `generate(messages): { narration$: AsyncIterable<string>; result: Promise<{ blocks: unknown[]; layoutText: string } | GenerationError> }` (exact shape finalized in the plan). Exposes `PipelineStatus` transitions as it goes.
- **Depends on:** `LlmClient`, `CatalogManagement`, `CrossFrameValidator`, `StateSync`, `ChatState` (telemetry/raw logs).
- `ChatCoordinator` is refactored to delegate to this service (keeps existing non-CopilotKit callers working, and keeps its tests green).

### GeminiA2uiAgent (`extends AbstractAgent` from `@ag-ui/client`)
- **Does:** the bridge the sidebar talks to. On run: calls `A2uiGenerationService.generate(...)`, and emits AG-UI events — `RUN_STARTED`, `TEXT_MESSAGE_*` (short natural-language narration), `TOOL_CALL_*` for `render_a2ui` (args = the healed/validated A2UI blocks), `RUN_FINISHED`; maps `GenerationError` to an error/text event with the existing typed messaging.
- **Interface:** the AG-UI `AbstractAgent.run(input): Observable<BaseEvent>` contract.
- **Depends on:** `A2uiGenerationService`. Registered with CopilotKit as a self-managed/direct agent (the "you manage it" path; acceptable — fully client-side, no exposed endpoint).

### CopilotKit wiring
- `provideCopilotKit({...})` in `app.config.ts` with the `GeminiA2uiAgent` registered and default `agentId`.
- Frontend tool-renders registered via `registerRenderToolCall` (and/or `CopilotA2UIToolRenderer`).

### CopilotSidebar (new Angular component)
- **Does:** a collapsible, CopilotKit-styled docked sidebar hosting `<copilot-chat agentId="default">`; replaces the old Gemini Assistant panel. Owns collapse/expand + responsive behavior.
- **Depends on:** `@copilotkit/angular` (`CopilotChat`, slots), the app shell.

### RenderA2uiToolRender (new)
- **Does:** the friendly render for the `render_a2ui` tool call — a "Generated **&lt;title&gt;**" card with live pipeline status (Healing → Validating → Rendered) and a "shown in canvas" affordance. No raw JSON in the thread.
- **Depends on:** `PipelineStatus`, the tool-call render context.

### Workspace layout changes (`composer-workspace`)
- Remove the chat Dockview panel; mount `CopilotSidebar` as a docked sidebar around the Dockview area.
- Default Dockview layout **omits the raw/editor panel**; add a "Show source" control to add it on demand; optionally auto-add after the first successful generation.

## Data flow (happy path)

1. User types in the sidebar → `<copilot-chat>` runs `GeminiA2uiAgent`.
2. Agent → `A2uiGenerationService.generate()` → `LlmClient.chatStream` (Gemini, user's key).
3. Agent emits streaming `TEXT_MESSAGE_*` narration to the sidebar.
4. On completion: heal + validate + catalog-heal → agent emits `TOOL_CALL render_a2ui` with the A2UI blocks.
5. `RenderA2uiToolRender` shows the "Generated X" card with pipeline status; `StateSync.commitLayoutFromLlm` pushes the A2UI into the editor draft → preview iframe re-renders.
6. If the editor was hidden and this is the first generation, optionally reveal it.

## Error handling

Reuse `ChatCoordinator.parseError` semantics (invalid API key, quota, timeout, validation failure, cancel). In the sidebar these surface as a friendly assistant message / tool-render error state rather than the old raw error bubble; retry re-runs the agent with the original prompt. Cancel maps to AG-UI run cancellation.

## Testing strategy

- **Unit:** `A2uiGenerationService` (healing/validation/catalog-heal parity with current `ChatCoordinator` tests — reuse the fixtures); `GeminiA2uiAgent` emits the correct AG-UI event sequence (narration + `render_a2ui` tool call) for a given fake `LlmClient` stream, and maps errors correctly; `RenderA2uiToolRender` status states; `CopilotSidebar` mounts.
- **e2e (Playwright):** with a stubbed Gemini stream — send a prompt → narration streams → tool-render card appears → preview updates → JSON editor hidden at first load and revealable.
- Existing `chat-coordinator.spec` stays green (coordinator delegates to the extracted service).

## Risks & mitigations

- **Unsupported Angular-22 combo** (`@copilotkit/angular` caps at 21): proven to build+run now; pin the exact working version, keep the probe's build/e2e as a canary, and treat a future CopilotKit release that breaks 22 as a pinned-version decision. (Option-1 / Angular-21 rollback remains the fallback.)
- **Bundle size:** CopilotKit adds weight (markdown, lucide, websandbox). Raise Angular's build budget; measure prod build; lazy-load the sidebar.
- **Direct/self-managed agent is "not officially supported"** by CopilotKit for production: acceptable because the agent is fully in-browser (no exposed endpoint, no auth surface). Revisit if we later add a runtime.

## Deferred (post-v1)

Attachments/images, voice transcription, thread history/persistence, human-in-the-loop tool approvals, CopilotKit sandboxed generative-UI, and porting our earlier UX-overhaul theming onto this branch.

## Cleanup

Remove the temporary spike scaffolding before/while implementing: `shell/src/app/_ck-probe/`, the `_ck-probe` route, and fold the `provideCopilotKit` + styles `@import` into the real wiring.
