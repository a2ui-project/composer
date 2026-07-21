# Theater (A2UI protocol playback) — Design

**Date:** 2026-07-21
**Branch:** `jerel/ux-update` (on Google upstream `ec76b5d`)
**Status:** Approved (design questions answered 2026-07-21)

## Goal

A step-through player that replays a recorded A2UI **v0.9** message stream into
a live native surface — the composer's equivalent of the widget-builder's
Theater. You watch the UI get constructed and then mutate, message by message,
with a scrubbable timeline and an inspector, making the protocol's dynamics
(`createSurface` → `updateComponents` → `updateDataModel`…) visible.

## Placement (decision: new route)

New top-level route **`/theater`** with its own sidenav entry ("Theater", icon
`movie`), a sibling of Catalog Reference. Provides its own component-scoped
`A2uiRendererService` + `A2UI_RENDERER_CONFIG` (instance-per-injector, same
rule as the other native routes) reusing `buildDashboardCatalog()`. **No
`startupGuard`** (native render).

New feature dir `shell/src/app/theater/`.

## Recordings (decision: derive from existing examples)

`shell/src/app/theater/recordings.ts` builds recordings programmatically from
the flight + sales example assets already in the repo (DRY, no new fixtures,
no drift):

```ts
export interface TheaterMessage { version: 'v0.9'; [key: string]: unknown; }
export interface TheaterRecording {
  id: string;
  label: string;
  icon: string;
  description: string;
  messages: TheaterMessage[];
}
export const RECORDINGS: TheaterRecording[];
```

Each recording is the sequence: `createSurface` → `updateComponents(schema)` →
one `updateDataModel` per data state. So playing the **Sales** session shows
the dashboard populate then evolve across Q1→Q4, and **Flight** across
Morning→Afternoon. Assets: `../custom-catalog/assembled/examples/{sales,flight}-{schema,data}.json`
(`*-data.json` are `[{name, data}]` arrays → one `updateDataModel` step each,
the state `name` becoming the step's label).

Messages carry a canonical placeholder `surfaceId: 'session'`; the playback
engine rewrites it to the live surface id at replay time (see below). v0.9
only — the widget-builder's legacy v0.8 reducer path is out of scope.

## Playback engine

Generation-based, to avoid the stale-`createSurface` trap (re-sending
`createSurface` to a built surface binds it to stale state):

- State: `step` (signal, 0..N = number of messages applied), a private
  `appliedStep`, a private `gen`, and `playbackSurfaceId` (signal,
  `theater-<gen>`).
- `seek(target)` (clamped 0..N):
  - `target >= appliedStep` → apply messages `[appliedStep, target)` onto the
    current generation surface (incremental; the common forward case).
  - `target < appliedStep` → new generation: `gen++`,
    `playbackSurfaceId = theater-<gen>`, `appliedStep = 0`, then apply
    `[0, target)` onto the fresh surface.
  - Then `appliedStep = target`, `step.set(target)`.
- `applyRange(from, to)`: for each `i` in `[from, to)`, clone `messages[i]`,
  rewrite its `surfaceId` to `playbackSurfaceId()`, and
  `renderer.processMessages([clone])`.
- `withSurfaceId(msg, id)`: returns a shallow clone whose present sub-message
  (`createSurface` | `updateComponents` | `updateDataModel`) has `surfaceId`
  set to `id`.

The template binds `<a2ui-v09-surface [surfaceId]="playbackSurfaceId()">`, so a
new generation swaps the rendered surface cleanly. Old generations linger
harmlessly in the service (not displayed).

## Transport

Reset ⏮ (`seek(0)`) · Step-back ◀ (`seek(step-1)`) · Play/Pause ▶︎/⏸ ·
Step-forward ▶︎ (`seek(step+1)`), plus a "step N / total" readout and a
clickable timeline (row → `seek(index+1)`). Autoplay advances one message every
`PLAYBACK_INTERVAL_MS` (900ms) via `setInterval`; it stops at the end and on
pause. The interval is cleared on pause, on recording change, and via
`DestroyRef`. (Zoneless: the interval callback writes the `step` signal, which
drives change detection.)

Selecting a recording resets to `step = 0` (blank surface, new generation) and
pauses; the render pane shows a short "Press play" empty state until playback
begins.

## Inspector (sub-tabs)

`inspectorTab = signal<'events' | 'data' | 'config'>('events')`.

- **Events** — the message timeline: one row per message with a type chip
  (`createSurface` / `updateComponents` / `updateDataModel`) and a short
  summary; the current row (`step - 1`) highlighted; click a row to seek there.
- **Data** — the effective data model JSON at the playhead: the `value` of the
  last `updateDataModel` among applied messages (recordings use
  `{path:'/', op:'replace', value}`), else `{}`. Rendered with `formatJson` in
  a read-only `<pre>`.
- **Config** — playback surface id, catalog id (from the recording's
  `createSurface`), recording label, and total step count.

## Files

**Create:**
- `shell/src/app/theater/recordings.ts`
- `shell/src/app/theater/theater.ts` / `.ng.html` / `.scss` / `.spec.ts`

**Modify:**
- `shell/src/app/app.routes.ts` — add `theater` route (no guard).
- `shell/src/app/shell/composer-shell/composer-shell.ng.html` — add nav item
  (icon `movie`), after Catalog Reference.
- `shell/src/app/shell/composer-shell/composer-shell.spec.ts` — bump nav counts
  (5→6 nav items; aria-hidden icons 7→8; add `movie` + "Theater").

## Testing

- **theater.spec.ts** (no Monaco; `<a2ui-v09-surface>` uses the component's own
  providers): first recording selected, `step` starts at 0; `stepForward`
  applies `createSurface` (`surfaceGroup.getSurface(playbackSurfaceId)` truthy)
  and increments `step`; forward stepping is incremental; `seek` backward
  starts a new generation (playback surface id changes); `reset` → step 0;
  `events()` length equals message count with correct type labels;
  `currentData()` reflects the last applied `updateDataModel`; switching
  recordings resets to step 0; `togglePlay` + `vi.useFakeTimers()` advances one
  step per interval and stops at the end.
- **composer-shell.spec.ts** — nav-count bumps.

Full suite (`corepack yarn exec vitest run`) green with coverage met.

## Browser verification (:4215 uxo-verify)

Nav → Theater; select Sales; play → the KPI grid + charts build up then evolve
Q1→Q4; step back/forward + timeline seek work; Events highlights the current
message, Data shows the model, Config shows ids; dark mode; no console errors.

## Out of scope (future)

- User-loaded / pasted JSONL recordings.
- Legacy v0.8 message handling.
- Variable playback speed control.

## Global constraints

- Node v24.16.0 via nvm; `corepack yarn`; tests from `shell/`.
- Apache-2.0 header on every new source file.
- Nothing to `origin` without approval; `fork` push OK. No credentials.
- zod stays pinned `3.25.76`.
