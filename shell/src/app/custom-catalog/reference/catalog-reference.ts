/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {A2uiRendererService, A2UI_RENDERER_CONFIG, SurfaceComponent} from '@a2ui/angular/v0_9';
import {buildDashboardCatalog, DASHBOARD_CATALOG_ID} from '../catalog/dashboard-catalog';
import {COMPONENT_DOCS, type CatalogCategory, type ComponentDoc} from './catalog-reference.data';
import {CATALOG_SOURCE, type CatalogSourceFile} from './catalog-source.generated';
import {formatJson} from '../../utils/json';

/** Which face of the reference is showing. */
type ReferenceView = 'components' | 'definitions' | 'renderers';

/** A category and the components filed under it, for the sidebar. */
interface DocGroup {
  category: CatalogCategory;
  docs: ComponentDoc[];
}

/**
 * Catalog Reference route. Documents the 11-component custom dashboard catalog:
 * a per-component reference (native `@a2ui/angular` Preview + A2UI Usage
 * snippet + Props table) plus raw source viewers for the catalog's Definitions
 * (`apis.ts`, `dashboard-catalog.ts`) and Renderers (the 11 component files).
 *
 * The renderer service + config are provided at component scope (never root —
 * instance-per-injector) and reuse the same `buildDashboardCatalog()` as the
 * Assembled Components page, so previews bind and dispatch identically.
 */
@Component({
  selector: 'a2ui-composer-catalog-reference',
  standalone: true,
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule, MatTableModule, SurfaceComponent],
  templateUrl: './catalog-reference.ng.html',
  styleUrl: './catalog-reference.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    A2uiRendererService,
    {
      provide: A2UI_RENDERER_CONFIG,
      useFactory: () => ({
        catalogs: [buildDashboardCatalog()],
        actionHandler: (action: unknown) =>
          console.info('[catalog-reference] action dispatched', action),
      }),
    },
  ],
})
export class CatalogReference {
  private readonly renderer = inject(A2uiRendererService);
  /** Preview surface ids already built, so each component renders once. */
  private readonly builtSurfaces = new Set<string>();

  private static readonly CATEGORY_ORDER: readonly CatalogCategory[] = [
    'Layout',
    'Content',
    'Data Display',
    'Interactive',
  ];

  protected readonly docs = COMPONENT_DOCS;
  protected readonly viewMode = signal<ReferenceView>('components');

  /** Components grouped by category, in a stable display order. */
  protected readonly groups = computed<DocGroup[]>(() =>
    CatalogReference.CATEGORY_ORDER.map(category => ({
      category,
      docs: this.docs.filter(doc => doc.category === category),
    })).filter(group => group.docs.length > 0),
  );

  protected readonly selectedName = signal<string>(COMPONENT_DOCS[0]?.name ?? '');
  protected readonly selectedDoc = computed<ComponentDoc | undefined>(() =>
    this.docs.find(doc => doc.name === this.selectedName()),
  );

  /** The surface id shown by the preview element for the active component. */
  protected readonly activeSurfaceId = computed(() => this.surfaceId(this.selectedName()));

  protected readonly displayedColumns: readonly string[] = [
    'name',
    'type',
    'required',
    'description',
  ];

  /** The canonical A2UI message sequence that renders the selected component. */
  protected readonly usageJson = computed<string>(() => {
    const doc = this.selectedDoc();
    if (!doc) return '';
    const surfaceId = this.surfaceId(doc.name);
    const messages: unknown[] = [
      {version: 'v0.9', createSurface: {surfaceId, catalogId: DASHBOARD_CATALOG_ID}},
      {version: 'v0.9', updateComponents: {surfaceId, components: doc.usage}},
    ];
    if (doc.data !== undefined) {
      messages.push({version: 'v0.9', updateDataModel: {surfaceId, value: doc.data}});
    }
    return formatJson(messages);
  });

  /** The source files backing the active source view (definitions vs renderers). */
  protected readonly sourceFiles = computed<CatalogSourceFile[]>(() =>
    this.viewMode() === 'renderers' ? CATALOG_SOURCE.renderers : CATALOG_SOURCE.definitions,
  );
  protected readonly selectedSourcePath = signal<string>('');
  protected readonly selectedSource = computed<CatalogSourceFile | undefined>(() => {
    const files = this.sourceFiles();
    return files.find(file => file.path === this.selectedSourcePath()) ?? files[0];
  });

  constructor() {
    // Build the selected component's preview surface once; thereafter it is
    // just shown by id. Re-sending createSurface to a built surface would bind
    // it to stale state (same pattern as the Assembled Components page).
    effect(() => {
      const doc = this.selectedDoc();
      if (this.viewMode() !== 'components' || !doc) return;
      untracked(() => this.buildSurface(doc));
    });

    // Default-select the first file whenever a source view is entered (or its
    // file list changes) and nothing valid is selected.
    effect(() => {
      const files = this.sourceFiles();
      if (this.viewMode() === 'components') return;
      const hasSelection = untracked(() =>
        files.some(file => file.path === this.selectedSourcePath()),
      );
      if (hasSelection) return;
      const first = files[0];
      if (first) untracked(() => this.selectedSourcePath.set(first.path));
    });
  }

  private surfaceId(name: string): string {
    return `ref-${name}`;
  }

  private buildSurface(doc: ComponentDoc): void {
    const surfaceId = this.surfaceId(doc.name);
    if (this.builtSurfaces.has(surfaceId)) return;
    this.renderer.processMessages([
      {createSurface: {surfaceId, catalogId: DASHBOARD_CATALOG_ID}},
      {updateComponents: {surfaceId, components: doc.usage}},
    ] as never);
    if (doc.data !== undefined) {
      this.renderer.processMessages([
        {updateDataModel: {surfaceId, path: '/', op: 'replace', value: doc.data}},
      ] as never);
    }
    this.builtSurfaces.add(surfaceId);
  }

  protected setViewMode(mode: ReferenceView): void {
    this.viewMode.set(mode);
  }

  protected selectComponent(name: string): void {
    this.selectedName.set(name);
  }

  protected selectSource(path: string): void {
    this.selectedSourcePath.set(path);
  }

  /** Copies the selected component's A2UI usage snippet to the clipboard. */
  protected copyUsage(): void {
    const json = this.usageJson();
    if (!json || !navigator.clipboard) return;
    navigator.clipboard.writeText(json).catch(err => {
      console.error('Failed to copy usage snippet to clipboard:', err);
    });
  }
}
