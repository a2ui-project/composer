# Catalog Components Reference — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A `/catalog-reference` route giving a per-component reference (Preview + Usage + Props) for the 11-component custom dashboard catalog, plus raw Definitions/Renderers source viewers.

**Architecture:** New standalone route component with component-scoped `A2uiRendererService` + `A2UI_RENDERER_CONFIG` reusing `buildDashboardCatalog()`. Per-component metadata is hand-authored; catalog source is bundled by a committed Node codegen into a generated data module. Previews render natively via `<a2ui-v09-surface>`.

**Tech Stack:** Angular 22 (zoneless, signals, standalone, OnPush), `@a2ui/angular/v0_9`, `@angular/material`, Node ESM codegen.

## Global Constraints

- Node v24.16.0 via nvm; `corepack yarn`; tests run from `shell/` via `corepack yarn exec vitest run`.
- Apache-2.0 copyright header on every new source file (match existing files verbatim).
- zod pinned `3.25.76`; nothing to `origin` without approval; `fork` push OK.
- Coverage thresholds: lines 90 / functions 90 / branches 75 / statements 85.

---

### Task 1: Codegen script + generated source module + lint/format wiring

**Files:**
- Create: `shell/scripts/generate-catalog-source.mjs`
- Create (generated, committed): `shell/src/app/custom-catalog/reference/catalog-source.generated.ts`
- Modify: `shell/package.json` (add `generate:catalog-source` script)
- Modify: `eslint.config.js` (ignore `**/*.generated.ts` + `shell/scripts/**`)
- Modify: `.prettierignore` (ignore `**/*.generated.ts`)

**Produces:** `CATALOG_SOURCE: { definitions: CatalogSourceFile[]; renderers: CatalogSourceFile[] }` and `interface CatalogSourceFile { label; path; code }`.

- [ ] **Step 1:** Write `generate-catalog-source.mjs`: read `apis.ts` + `dashboard-catalog.ts` (definitions) and the 11 renderer files (`components/*/<name>.ts`, excluding `*.spec.ts` and `test-harness.ts`) (renderers); emit the generated module with license header + `/* eslint-disable */` + GENERATED banner; each `code` via `JSON.stringify(fileText)`. Renderer label = component display name (map file→`CcX`→friendly).
- [ ] **Step 2:** Add eslint ignores (`**/*.generated.ts`, `shell/scripts/**`) and `.prettierignore` entry (`**/*.generated.ts`); add the npm script.
- [ ] **Step 3:** Run `node scripts/generate-catalog-source.mjs` from `shell/`; verify the generated file exists, has both arrays populated (2 definitions, 11 renderers), and each `code` is non-empty.
- [ ] **Step 4:** Run `corepack yarn lint` — expect pass (generated + script ignored).
- [ ] **Step 5:** Commit.

### Task 2: Hand-authored component metadata

**Files:**
- Create: `shell/src/app/custom-catalog/reference/catalog-reference.data.ts`

**Produces:** `COMPONENT_DOCS: ComponentDoc[]` (11 entries), types `CatalogCategory`, `PropDoc`, `ComponentDoc` (see spec). Each `usage` is a complete standalone A2UI tree; props mirror `apis.ts` with readable type aliases.

- [ ] **Step 1:** Author the 11 docs grouped Layout/Content/Data Display/Interactive with props + self-contained `usage` trees (literals preferred; `data` only where read).
- [ ] **Step 2:** Commit.

### Task 3: Reference route component (Components view)

**Files:**
- Create: `shell/src/app/custom-catalog/reference/catalog-reference.ts` / `.ng.html` / `.scss`
- Create: `shell/src/app/custom-catalog/reference/catalog-reference.spec.ts`

**Consumes:** `COMPONENT_DOCS`, `CATALOG_SOURCE`, `buildDashboardCatalog()`, `formatJson`, `@a2ui/angular/v0_9` (`A2uiRendererService`, `A2UI_RENDERER_CONFIG`, `SurfaceComponent`).

- [ ] **Step 1:** Write failing spec: creates the component; auto-selects the first `COMPONENT_DOCS` entry; toggling `viewMode` to `definitions`/`renderers` swaps the source list.
- [ ] **Step 2:** Implement the component: component-scoped providers; `viewMode` signal (`'components'|'definitions'|'renderers'`); `groups` computed (docs by category); `selectedName` signal + auto-select effect; `builtSurfaces` Set + effect that builds `ref-<name>` once (createSurface+updateComponents[+updateDataModel]); `usageJson` computed + `copyUsage()`; source: `sourceFiles` computed from `viewMode`, `selectedSourcePath` signal, `selectedSource` computed.
- [ ] **Step 3:** Template: top mat-button-toggle (Components/Definitions/Renderers); Components = grouped sidebar + detail (Preview `<a2ui-v09-surface [surfaceId]="'ref-'+selectedName()">`, Usage `<pre>` + copy, Props `mat-table`); source views = file list + read-only `<pre><code>`.
- [ ] **Step 4:** SCSS with `--cpk-*` tokens (match custom-catalog/gallery styling).
- [ ] **Step 5:** Run the spec — expect pass.
- [ ] **Step 6:** Commit.

### Task 4: Data-integrity guard test

**Files:**
- Modify: `shell/src/app/custom-catalog/reference/catalog-reference.spec.ts`

- [ ] **Step 1:** Add a test asserting the set of `COMPONENT_DOCS[i].name` equals the set of component names in `buildDashboardCatalog()` (both directions), so docs can't silently drift from the catalog.
- [ ] **Step 2:** Run spec — expect pass. Commit.

### Task 5: Route + nav wiring

**Files:**
- Modify: `shell/src/app/app.routes.ts`
- Modify: `shell/src/app/shell/composer-shell/composer-shell.ng.html`
- Modify: `shell/src/app/shell/composer-shell/composer-shell.spec.ts`

- [ ] **Step 1:** Add `catalog-reference` route (lazy `loadComponent`, `title: 'A2UI Catalog Reference'`, no `startupGuard`).
- [ ] **Step 2:** Add nav `<a mat-list-item routerLink="/catalog-reference">` with icon `menu_book`, label/tooltip/aria "Catalog Reference", after the Custom Catalog entry.
- [ ] **Step 3:** Update composer-shell.spec nav counts (icons, nav labels, tooltips, aria-labels, routerLinkActive) for the added entry.
- [ ] **Step 4:** Run composer-shell.spec — expect pass. Commit.

### Task 6: Full suite + browser verify + push save point

- [ ] **Step 1:** `corepack yarn exec vitest run` — full suite green, coverage met.
- [ ] **Step 2:** Browser-verify on :4215 (uxo-verify): nav → Catalog Reference; auto-select + native preview; Usage/Props; Definitions/Renderers source; dark mode; no console errors. Screenshot proof.
- [ ] **Step 3:** Push `fork/jerel/ux-update` (fast-forward, ff-safe). Update memory.

## Self-Review

- Spec coverage: route/placement (T5), Components view (T3), source viewers + codegen (T1), metadata (T2), sync guard (T4), verify/push (T6). ✓
- No placeholders. ✓
- Type consistency: `CatalogSourceFile`/`CATALOG_SOURCE` (T1) consumed in T3; `COMPONENT_DOCS`/`ComponentDoc` (T2) consumed in T3/T4. ✓
