# Custom Catalog — Native Render + Assembled Demo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline) — this is being executed in-session with the full react-flight-catalog source available to port from.

**Goal:** A native (no-iframe) `/custom-catalog` route in the composer that renders the 11-component dashboard catalog via `@a2ui/angular/v0_9`, with an Assembled Components demo (Flight Card / Sales Dashboard) driven by an editable Monaco data-model panel.

**Architecture:** Reuse the `@a2ui/web_core` binding engine + `@a2ui/angular` surface; author the 11 renderers as Angular `CatalogComponent`s; register them in an `AngularCatalog`; feed protocol messages to `A2uiRendererService` at route scope.

**Tech Stack:** Angular 22.0.6 (standalone, signals, zoneless), `@a2ui/angular@0.10.1`, `@a2ui/web_core@0.10.2`, zod 3.25.76, monaco-editor, SVG charts.

## Global Constraints
- Foundation is DONE + committed (`9ff3ddc`): deps added, zod pinned to 3.25.76 (single shared instance — validated by a passing binding spike).
- `A2uiRendererService` provided at the route component (never root). Extend `CatalogComponent` (not `BasicCatalogComponent`). Theme via `--cpk-*`.
- Charts: hand-rolled SVG, no dependency. Fork-only; `vitest run` green per commit.
- Port source of truth: `git show v0.1.0:samples/react-flight-catalog/src/catalog/...` (apis.ts, components/*.tsx, utils.tsx, index.ts, usages.ts). Assembled JSON: `private_a2ui_demo/apps/widget-builder/src/app/custom-catalog/{flight-demo,sales-demo}/*.json`.

## File Structure (all under `shell/src/app/custom-catalog/`)
- `catalog/apis.ts` — 11 `ComponentApi` zod defs (port verbatim; import helpers from `@a2ui/web_core/v0_9`, `z` from `zod`).
- `catalog/components/<name>/<name>.ts` (+ `.ng.html`/`.scss` where useful) — 11 Angular renderers.
- `catalog/dashboard-catalog.ts` — `buildDashboardCatalog(): AngularCatalog` mapping name→component.
- `assembled/custom-catalog.ts` (+ template/scss) — the route page.
- `assembled/examples/{flight-schema,sales-schema,flight-data,sales-data}.json` — reused assets.
- `assembled/data-editor/…` — Monaco data-model editor (reuse `shell/src/app/shared/monaco-editor` if present; else `@monaco-editor/loader`).
- Route added in `shell/src/app/app.routes.ts`; nav entry in `shell/src/app/shell/composer-shell/composer-shell.ng.html`.

## Renderer pattern (proven in the spike)
```ts
@Component({selector:'cc-row', standalone:true, imports:[ComponentHostComponent],
  template:`@for (c of children(); track c.basePath+'/'+c.id) {
    <a2ui-v09-component-host [componentKey]="c" [surfaceId]="surfaceId()"/>
  }`, changeDetection: ChangeDetectionStrategy.OnPush})
export class CcRow extends CatalogComponent<typeof RowApi> {
  protected children = computed(() => this.props()['children']?.value() ?? []);
}
```
- Scalars: `computed(() => this.props()['x']?.value())`.
- Single child (`Button.child`, `DashboardCard.child`): render one `<a2ui-v09-component-host [componentKey]="child()">`.
- Actions (`Button`, `FlightCard`): `const dc = new DataContext(surface, dataContextPath()); surface.dispatchAction(dc.resolveAction(action()), componentId())` (surface via injected `A2uiRendererService.surfaceGroup.getSurface(surfaceId())`, or `BasicCatalogComponent.surface()` pattern — confirm accessor).

---

### Task 1: Port `apis.ts` (the 11-component contract)
**Files:** Create `catalog/apis.ts`.
- [ ] Port `v0.1.0:samples/react-flight-catalog/src/catalog/apis.ts` verbatim (it's framework-neutral; only imports `zod` + `@a2ui/web_core/v0_9` helpers).
- [ ] `corepack yarn exec vitest run` (typecheck compiles). Commit `feat(custom-catalog): port 11-component zod contract`.

### Task 2: Non-chart renderers (9) + catalog assembly
**Files:** `catalog/components/{row,column,title,badge,metric,dashboard-card,flight-card,data-table,button}/*`, `catalog/dashboard-catalog.ts`.
- [ ] Port each React renderer (`v0.1.0:…/components/<Name>.tsx` + `utils.tsx` styling) to an Angular `CatalogComponent`, styled with `--cpk-*`. Layout (Row/Column) uses the `@for` + `a2ui-v09-component-host` pattern; Button/FlightCard wire actions; DataTable/Metric/DashboardCard are plain markup.
- [ ] `dashboard-catalog.ts`: `buildDashboardCatalog()` → `new AngularCatalog('copilotkit://app-dashboard-catalog', [ {...RowApi, component: CcRow}, … ], BASIC_FUNCTIONS)`.
- [ ] Tests: Row renders N children; FlightCard binds `{path}` values + dispatches its action; Button dispatches. `vitest run`. Commit `feat(custom-catalog): angular renderers + catalog assembly`.

### Task 3: SVG chart renderers (PieChart, BarChart)
**Files:** `catalog/components/{pie-chart,bar-chart}/*`.
- [ ] Implement each as a `CatalogComponent` reading `props()['data'].value()` (bound array) and rendering an inline `<svg>` (pie slices / bars) themed with `--cpk-*`. Match the fields the React Recharts versions used (`v0.1.0:…/components/{PieChart,BarChart}.tsx`).
- [ ] Register both in `dashboard-catalog.ts`.
- [ ] Tests: given a small data array, the SVG has the expected number of slices/bars. `vitest run`. Commit `feat(custom-catalog): SVG pie + bar chart renderers`.

### Task 4: Assembled Components route
**Files:** `assembled/custom-catalog.ts` (+ template/scss), `assembled/examples/*.json`, `assembled/data-editor/*`; `app.routes.ts`.
- [ ] Copy the 4 JSON assets from the widget-builder into `assembled/examples/`.
- [ ] Route component: provides `A2uiRendererService` + `{provide: A2UI_RENDERER_CONFIG, useFactory: () => ({catalogs:[buildDashboardCatalog()], actionHandler: a => this.feedback/log})}`. Two-pane layout: left `<a2ui-v09-surface [surfaceId]="'custom-catalog'">`, sub-tabs Flight Card / Sales Dashboard; right Monaco JSON editor + data tabs.
- [ ] On example/tab select: `processMessages([createSurface, updateComponents(tree), updateDataModel(data)])`. On editor change (debounced): try `JSON.parse` → `updateDataModel`; ignore parse errors.
- [ ] Add lazy route `custom-catalog` in `app.routes.ts` (child of ComposerShell, `canActivate: [startupGuard]`? — no renderer needed; OMIT the guard since it renders natively, not via the iframe renderer). Title 'A2UI Custom Catalog'.
- [ ] Tests: selecting each example builds the right surface; editing valid JSON updates the data model; invalid JSON is ignored. `vitest run`. Commit `feat(custom-catalog): assembled components route`.

### Task 5: Nav entry + verify
**Files:** `composer-shell.ng.html`.
- [ ] Add a nav item to Google's `mat-nav-list` linking `/custom-catalog` (icon `dashboard_customize`, label "Custom Catalog"), matching the existing item markup (tooltip when collapsed, `ensureCollapsed()`).
- [ ] `vitest run` green. Dev server (:4215): verify Flight Card + Sales Dashboard render in light + dark, sub-tab switch, data tabs, and a live edit updating the surface. Screenshot. Commit `feat(custom-catalog): nav entry`.

## Self-Review
- Spec coverage: renderers (T2/T3), catalog assembly (T2), native route + surface + editor + data flow (T4), nav (T5), contract (T1). All spec sections mapped.
- Open detail to confirm during T2: the exact accessor for the active `SurfaceModel` inside a renderer for action dispatch (either inject `A2uiRendererService` and `surfaceGroup.getSurface(surfaceId())`, or use a `BasicCatalogComponent.surface()`-style protected getter if `CatalogComponent` exposes one). Resolve by reading `node_modules/@a2ui/angular/fesm2022/a2ui-angular-v0_9.mjs` (ButtonComponent ~line 1002).
