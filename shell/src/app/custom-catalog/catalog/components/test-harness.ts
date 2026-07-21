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

/**
 * Shared TestBed harness for the dashboard catalog specs.
 *
 * Builds a real A2UI surface (create → updateComponents → optional
 * updateDataModel), renders it through `<a2ui-v09-surface>`, and returns the
 * host element plus the action-handler spy. This mirrors the runtime wiring
 * exactly, so bindings, template children, and action dispatch all exercise
 * the same code paths as production.
 */
import {Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {A2UI_RENDERER_CONFIG, A2uiRendererService, SurfaceComponent} from '@a2ui/angular/v0_9';
import type {A2uiClientAction} from '@a2ui/web_core/v0_9';
import {buildDashboardCatalog, DASHBOARD_CATALOG_ID} from '../dashboard-catalog';

/** Minimal host that embeds a single A2UI surface. */
@Component({
  selector: 'a2ui-composer-cc-test-host',
  standalone: true,
  imports: [SurfaceComponent],
  template: `<a2ui-v09-surface [surfaceId]="surfaceId()" />`,
})
export class CatalogTestHost {
  readonly surfaceId = signal('t');
}

export interface HarnessResult {
  fixture: ComponentFixture<CatalogTestHost>;
  host: HTMLElement;
  actionHandler: ReturnType<typeof vi.fn>;
  service: A2uiRendererService;
}

const SURFACE_ID = 't';

/**
 * Renders the given flat component list on a fresh surface.
 *
 * @param components The flat A2UI component list (`{ id, component, ...props }`).
 * @param dataModel Optional root data-model object for `{ path }` bindings.
 */
export async function renderSurface(
  components: Record<string, unknown>[],
  dataModel?: Record<string, unknown>,
): Promise<HarnessResult> {
  const actionHandler = vi.fn<(action: A2uiClientAction) => void>();

  TestBed.configureTestingModule({
    imports: [CatalogTestHost],
    providers: [
      provideZonelessChangeDetection(),
      A2uiRendererService,
      {
        provide: A2UI_RENDERER_CONFIG,
        useValue: {catalogs: [buildDashboardCatalog()], actionHandler},
      },
    ],
  });

  const service = TestBed.inject(A2uiRendererService);

  const messages: unknown[] = [
    {version: 'v0.9', createSurface: {surfaceId: SURFACE_ID, catalogId: DASHBOARD_CATALOG_ID}},
  ];
  if (dataModel) {
    messages.push({version: 'v0.9', updateDataModel: {surfaceId: SURFACE_ID, path: '/', value: dataModel}});
  }
  messages.push({version: 'v0.9', updateComponents: {surfaceId: SURFACE_ID, components}});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service.processMessages(messages as any);

  const fixture = TestBed.createComponent(CatalogTestHost);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return {fixture, host: fixture.nativeElement as HTMLElement, actionHandler, service};
}
