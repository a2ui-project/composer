# Theater Playback — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline). Steps use checkbox (`- [ ]`) syntax.

**Goal:** A `/theater` route that replays recorded A2UI v0.9 message streams into a native surface, with transport controls, a scrubbable timeline, and an Events/Data/Config inspector.

**Architecture:** Standalone route component with component-scoped `A2uiRendererService` + `A2UI_RENDERER_CONFIG` reusing `buildDashboardCatalog()`. Recordings derived from the existing flight/sales example assets. Generation-based playback engine (forward = incremental; backward/seek = rebuild on a fresh surface id).

**Tech Stack:** Angular 22 (zoneless, signals, standalone, OnPush), `@a2ui/angular/v0_9`, `@angular/material`.

## Global Constraints

- Node v24.16.0 via nvm; `corepack yarn`; tests from `shell/`.
- Apache-2.0 header on every new source file.
- zod pinned `3.25.76`; nothing to `origin` without approval; `fork` push OK.
- Coverage thresholds: lines 90 / functions 90 / branches 75 / statements 85.

---

### Task 1: Recordings module

**Files:**
- Create: `shell/src/app/theater/recordings.ts`

**Produces:** `TheaterMessage`, `TheaterRecording`, `RECORDINGS: TheaterRecording[]`.

- [ ] **Step 1:** Import `{sales,flight}-{schema,data}.json` from `../custom-catalog/assembled/examples`. Build each recording: `createSurface` (surfaceId `'session'`, catalogId `copilotkit://app-dashboard-catalog`) → `updateComponents(schema)` → one `updateDataModel({path:'/', op:'replace', value: state.data})` per data state. All messages tagged `version:'v0.9'`.
- [ ] **Step 2:** Commit.

### Task 2: Theater component + engine

**Files:**
- Create: `shell/src/app/theater/theater.ts` / `.ng.html` / `.scss` / `.spec.ts`

**Consumes:** `RECORDINGS`, `buildDashboardCatalog`/`DASHBOARD_CATALOG_ID`, `formatJson`, `@a2ui/angular/v0_9`.

- [ ] **Step 1:** Write failing spec: creates; first recording active; `step()` 0; `stepForward()` builds `surfaceGroup.getSurface(playbackSurfaceId())` and sets `step` 1; `seek(0)` after advancing starts a new generation (playback surface id changes); `events()` length == messages; `currentData()` reflects last applied `updateDataModel`; switching recording resets step; `togglePlay()` with `vi.useFakeTimers()` advances then stops at end.
- [ ] **Step 2:** Implement engine: `activeRecordingId` signal + `activeRecording` computed; `step` signal + private `appliedStep`/`gen`; `playbackSurfaceId` signal (`theater-<gen>`); `seek(target)` (incremental forward / new-gen rebuild backward); `applyRange`; `withSurfaceId`; transport (`reset`/`stepBack`/`stepForward`/`togglePlay`); `PLAYBACK_INTERVAL_MS=900` interval with `DestroyRef` + pause cleanup; `events`/`currentData`/`config` computeds; `inspectorTab` signal; `selectRecording`.
- [ ] **Step 3:** Template: recording selector (mat-button-toggle); render pane `<a2ui-v09-surface [surfaceId]="playbackSurfaceId()">` + empty-state; transport bar (reset/back/play-pause/forward + "N / total"); timeline (rows → seek); inspector sub-tabs Events/Data/Config.
- [ ] **Step 4:** SCSS with `--cpk-*` tokens (match custom-catalog/reference).
- [ ] **Step 5:** Run spec — expect pass. Commit.

### Task 3: Route + nav wiring

**Files:**
- Modify: `shell/src/app/app.routes.ts`
- Modify: `shell/src/app/shell/composer-shell/composer-shell.ng.html`
- Modify: `shell/src/app/shell/composer-shell/composer-shell.spec.ts`

- [ ] **Step 1:** Add `theater` route (lazy `loadComponent`, `title: 'A2UI Theater'`, no guard).
- [ ] **Step 2:** Add nav `<a routerLink="/theater">` icon `movie`, label/tooltip/aria "Theater", after Catalog Reference.
- [ ] **Step 3:** Update composer-shell.spec: nav items 5→6 (add "Theater"/'movie'); aria-hidden icons 7→8; tooltipsDisabled/nav-label/rlaAttrs arrays 5→6; rlaDirectives 6.
- [ ] **Step 4:** Run composer-shell.spec — expect pass. Commit.

### Task 4: Full suite + browser verify + push

- [ ] **Step 1:** `corepack yarn lint` + `corepack yarn exec vitest run` — green, coverage met.
- [ ] **Step 2:** Browser-verify :4215 — Theater nav, select Sales, play builds+evolves, seek/step, inspector tabs, dark mode, no console errors. Screenshot.
- [ ] **Step 3:** Push `fork/jerel/ux-update` (fast-forward). Update memory.

## Self-Review

- Spec coverage: recordings (T1), engine+UI (T2), route/nav (T3), verify/push (T4). ✓
- No placeholders. ✓
- Type consistency: `TheaterRecording`/`RECORDINGS`/`TheaterMessage` (T1) consumed in T2. ✓
