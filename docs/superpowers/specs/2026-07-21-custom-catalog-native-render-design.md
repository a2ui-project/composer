# Custom Catalog — Native Angular Rendering (Assembled Components) — Design

**Date:** 2026-07-21
**Branch:** `jerel/ux-update` (on Google upstream `ec76b5d`)
**Status:** Approved (approach + charting confirmed with jerel)

## Goal

Bring the widget-builder's **Custom Catalog** into the v0.9 Angular composer, rendered
**natively in-app** (no iframe). First slice: a switchable custom "dashboard" catalog
(11 components) plus a live **Assembled Components** page — two example trees (Flight
Card, Sales Dashboard) driven by an editable data-model JSON panel.

## Key insight

"Native renderer" is NOT a from-scratch rebuild. `@a2ui/angular/v0_9` embeds directly
in the composer shell and **reuses the entire binding engine** from `@a2ui/web_core`
(`MessageProcessor`, `DataContext`, `ComponentBinder`): data-path resolution,
`{componentId,path}` template children, action dispatch, two-way `onUpdate`, validation.
We only write the 11 custom component renderers + the route. `samples/ng-basic-catalog`
already runs `@a2ui/angular@0.10.1` on Angular 22, proving the stack.

## Architecture

- **Deps:** add `@a2ui/angular@0.10.1` + `@a2ui/web_core@0.10.2` to `shell/package.json`
  (not present today). Peer dep declares Angular `^21.2.5`; the composer is 22.0.6 —
  a partial-Ivy skew that install-warns but works (proven by `ng-basic-catalog@22.0.2`).
- **Route provider scope:** the new `/custom-catalog` route component provides
  `A2uiRendererService` + the custom `AngularCatalog` + an `A2UI_RENDERER_CONFIG`
  factory **at the component level** (NOT root — the service is instance-per-injector),
  so the native surface is isolated from the workspace's iframe preview.
- **Render:** `inject(A2uiRendererService).processMessages([...])` with
  `createSurface` / `updateComponents` / `updateDataModel`, then render
  `<a2ui-v09-surface [surfaceId]="…">`. No bridge / no `provideA2uiSandbox`.

### The custom catalog (11 components)

Port of our own `samples/react-flight-catalog` (tag `v0.1.0`). Components:
`Row`, `Column`, `Title`, `Badge`, `Metric`, `DashboardCard`, `FlightCard`,
`DataTable`, `Button`, `PieChart`, `BarChart`.

- **Contract:** reuse `apis.ts` (the zod `ComponentApi` definitions) **verbatim** — it
  imports only from `@a2ui/web_core/v0_9` (`DynamicStringSchema`, `ChildListSchema`,
  `ActionSchema`, `ComponentIdSchema`, `DynamicValueSchema`) and is framework-neutral.
- **Renderers:** each is an Angular standalone component extending
  `CatalogComponent<typeof SomeApi>` (from `@a2ui/angular/v0_9`) — NOT
  `BasicCatalogComponent` (which injects global `--a2ui-*` styles we don't want). Read
  resolved values via `this.props()['x'].value()`; render children with
  `<a2ui-v09-component-host [componentKey]="child" [surfaceId]="surfaceId()">`; dispatch
  actions via `surface.dispatchAction(new DataContext(surface, dataContextPath()).resolveAction(action), componentId())`.
  Style with `--cpk-*` tokens (port the styling from `react-flight-catalog`'s `utils.tsx`).
- **Catalog assembly:** `new AngularCatalog('copilotkit://app-dashboard-catalog',
  [ {name, schema, component}, … ], BASIC_FUNCTIONS)`.
- **Charts (confirmed):** `PieChart` + `BarChart` are **hand-rolled SVG** components
  (no chart dependency), themed with `--cpk-*`. They read `props()['data'].value()`
  (a bound array) and render an SVG pie / bar set. `DataTable`/`Metric`/`DashboardCard`
  are plain Angular + tokens.

### The Assembled Components page (`/custom-catalog`)

- Two-pane layout. **Left:** sub-tabs *Flight Card* / *Sales Dashboard*; each renders
  its assembled tree via `<a2ui-v09-surface>`. **Right:** a Monaco JSON editor showing
  the active example's data model, with data tabs (*Morning Flights* / *Afternoon
  Flights* for Flight Card; *Q1–Q4* for Sales Dashboard).
- **Assets (reused, checked in as JSON):** the trees `flight-schema.json`,
  `sales-schema.json` and the data `flight-data.json`, `sales-data.json` from the
  widget-builder (`apps/widget-builder/src/app/custom-catalog/{flight-demo,sales-demo}/`).
- **Data flow:** on example/tab select → `processMessages([createSurface(catalogId),
  updateComponents(tree), updateDataModel(data)])`. On Monaco edit → debounced
  `JSON.parse` (invalid JSON silently ignored) → `updateDataModel(parsed)` → the
  library's signals re-resolve bindings → surface re-renders live. Template children in
  the Flight Card tree (`{componentId:'flight-card', path:'/flights'}`) expand one card
  per array element automatically (engine-handled).
- Nav entry **"Custom Catalog"** added to Google's existing `mat-nav-list` in
  `composer-shell.ng.html` (icon `dashboard_customize`), consistent with the
  extend-the-flat-list decision. New route in `app.routes.ts`.

## Data flow summary

`example/tab select` or `Monaco edit` → build A2UI messages → `A2uiRendererService.processMessages()`
→ `MessageProcessor` + `DataContext` resolve bindings into `BoundProperty` signals →
`<a2ui-v09-surface>` → `a2ui-v09-component-host` resolves `catalog.components.get(type).component`
→ our Angular renderer reads `props()['x'].value()` and renders. Actions →
`surface.dispatchAction` → `A2UI_RENDERER_CONFIG.actionHandler` (local; we log / toast).

## Testing

- **Catalog renderers:** unit-test a representative few (Row renders children;
  FlightCard binds path values + dispatches its action; PieChart/BarChart produce the
  expected SVG shapes from a data array). Use `@a2ui/web_core` to build a small surface
  in the test and assert rendered output via Angular TestBed.
- **Assembled page:** switching examples/tabs swaps the tree/data; editing valid JSON
  updates the surface; invalid JSON is ignored without crashing (error-boundary
  behavior). Full `vitest run` green.
- **Visual:** verify both example trees render correctly in light + dark on the
  `/custom-catalog` route (dev server), plus live data edits.

## Global constraints

- Angular **22.0.6**; do not downgrade. `@a2ui/angular`/`@a2ui/web_core` install with a
  peer-dep warning — acceptable (proven by `ng-basic-catalog`).
- `A2uiRendererService` provided at route/component scope, never root.
- Extend `CatalogComponent` (not `BasicCatalogComponent`) to avoid global `--a2ui-*`
  style injection; theme via `--cpk-*`.
- No charting dependency — SVG only.
- Fork-only; nothing to `origin` without jerel's approval. `vitest run` green per commit.

## Out of scope (later slices)

- **Catalog Components reference** (Preview/Usage/Props docs + "Catalog Definitions /
  Renderers" source viewers) — either via the composer gallery (needs a `catalog.json`
  + `ComponentUsages` emit) or a dedicated docs route.
- **Basic Catalog** curated reference route.
- **Theater** (JSONL playback).
- Exposing the custom catalog to the iframe workspace preview / renderer picker.
