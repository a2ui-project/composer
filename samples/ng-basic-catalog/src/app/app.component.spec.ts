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

// @vitest-environment jsdom
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {AppComponent} from './app.component';
import {A2uiSandboxConnection, provideA2uiSandbox} from 'a2ui-bridge/angular';
import {A2uiRendererService, A2UI_RENDERER_CONFIG, BasicCatalog} from '@a2ui/angular';
import {CreateSurfaceMessageSchema} from '@a2ui/web_core/v1_0';
import {BASIC_COMPONENTS} from '@a2ui/web_core/catalogs/basic/v1';
import {createMcpFunctionsCatalog, MCP_FUNCTIONS_CATALOG_ID} from 'a2ui-bridge';
import {COMPONENT_USAGES} from '../../../shared/usages.js';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ANIMATION_MODULE_TYPE, provideZonelessChangeDetection, WritableSignal} from '@angular/core';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {AppComponentHarness} from './test/app.component.harness';

vi.mock('a2ui-bridge', () => ({
  a2uiBridge: {
    attachRenderer: vi.fn().mockReturnValue({unsubscribe: vi.fn()}),
    sendMessage: vi.fn(),
    sendAction: vi.fn(),
    getMcpClient: vi.fn(),
  },
  ERROR_OVERLAY_DEBOUNCE_MS: 350,
  MCP_FUNCTIONS_CATALOG_ID: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
  createMcpFunctionsCatalog: () => ({
    id: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
    protocolVersion: '1.0',
    components: new Map(),
    functions: [],
  }),
}));

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let sandbox: A2uiSandboxConnection;
  let harness: AppComponentHarness;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.restoreAllMocks();

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        {provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations'},
        provideA2uiSandbox([BasicCatalog, createMcpFunctionsCatalog()]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    sandbox = fixture.debugElement.injector.get(A2uiSandboxConnection);
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppComponentHarness);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    fixture.destroy();
  });

  it('creates the component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('renders waiting placeholder initially when surfaceId is empty and no error exists', async () => {
    expect(await harness.hasWaitingPlaceholder()).toBe(true);
    expect(await harness.hasErrorOverlay()).toBe(false);
    expect(await harness.hasSurface()).toBe(false);
  });

  it('renders surface and hides waiting placeholder when surfaceId is present', async () => {
    (sandbox.surfaceId as WritableSignal<string>).set('surface-123');
    fixture.detectChanges();

    expect(await harness.hasSurface()).toBe(true);
    expect(await harness.hasWaitingPlaceholder()).toBe(false);
    expect(await harness.hasErrorOverlay()).toBe(false);
  });

  it('renders error overlay and hides waiting placeholder when error is debounced', async () => {
    (sandbox.error as WritableSignal<Error | null>).set(new Error('Syntax validation failed'));
    fixture.detectChanges();

    expect(await harness.hasErrorOverlay()).toBe(false);

    vi.advanceTimersByTime(350);
    fixture.detectChanges();

    expect(await harness.hasErrorOverlay()).toBe(true);
    expect(await harness.getErrorText()).toContain('Syntax validation failed');
    expect(await harness.hasWaitingPlaceholder()).toBe(false);
  });

  it('renders surface and error overlay simultaneously when surfaceId is present and error occurs', async () => {
    (sandbox.surfaceId as WritableSignal<string>).set('surface-456');
    (sandbox.error as WritableSignal<Error | null>).set(new Error('Runtime component failure'));
    fixture.detectChanges();

    vi.advanceTimersByTime(350);
    fixture.detectChanges();

    expect(await harness.hasSurface()).toBe(true);
    expect(await harness.hasErrorOverlay()).toBe(true);
    expect(await harness.getErrorText()).toContain('Runtime component failure');
    expect(await harness.hasWaitingPlaceholder()).toBe(false);
  });

  it('restores waiting placeholder when error is cleared and surfaceId is absent', async () => {
    (sandbox.error as WritableSignal<Error | null>).set(new Error('Temporary issue'));
    fixture.detectChanges();
    vi.advanceTimersByTime(350);
    fixture.detectChanges();

    expect(await harness.hasErrorOverlay()).toBe(true);

    (sandbox.error as WritableSignal<Error | null>).set(null);
    fixture.detectChanges();

    expect(await harness.hasErrorOverlay()).toBe(false);
    expect(await harness.hasWaitingPlaceholder()).toBe(true);
  });

  it('registers multi-catalog handshake with v1.0 BasicCatalog and McpFunctionsCatalog', () => {
    const config = TestBed.inject(A2UI_RENDERER_CONFIG);
    expect(config.catalogs).toHaveLength(2);
    const [basic, mcp] = config.catalogs as Array<{id?: string; protocolVersion?: string}>;
    expect(basic?.id).toBe('https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json');
    expect(basic?.protocolVersion).toBe('1.0');
    expect(mcp?.id).toBe(MCP_FUNCTIONS_CATALOG_ID);
    expect(mcp?.protocolVersion).toBe('1.0');
  });

  it('renders surface via v1.0 single-message createSurface with inline components and dataModel', async () => {
    const renderer = fixture.debugElement.injector.get(A2uiRendererService);
    const surfaceId = 'v1-surface-test';
    renderer.processMessages([
      {
        version: '1.0',
        createSurface: {
          surfaceId,
          catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
          components: [
            {
              id: 'root',
              component: 'Icon',
              name: 'check',
            },
          ],
          dataModel: {
            status: 'ready',
          },
        },
      },
    ]);
    (sandbox.surfaceId as WritableSignal<string>).set(surfaceId);
    fixture.detectChanges();

    expect(renderer.surfaceGroup.getSurface(surfaceId)).toBeDefined();
    expect(await harness.hasSurface()).toBe(true);
    expect(await harness.hasWaitingPlaceholder()).toBe(false);
  });

  describe('A2UI v1.0 COMPONENT_USAGES validation', () => {
    it('validates every usage entry in usages.ts against v1.0 CreateSurfaceMessageSchema and BASIC_COMPONENTS', () => {
      const basicComponentsMap = new Map(BASIC_COMPONENTS.map(c => [c.name, c]));
      expect(Object.keys(COMPONENT_USAGES).length).toBeGreaterThan(0);

      for (const [componentName, usageEntry] of Object.entries(COMPONENT_USAGES)) {
        const message = {
          version: '1.0',
          createSurface: {
            surfaceId: `test-${componentName}`,
            catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
            components: usageEntry.usage,
            ...(usageEntry.data ? {dataModel: usageEntry.data} : {}),
          },
        };

        const messageResult = CreateSurfaceMessageSchema.safeParse(message);
        expect(
          messageResult.success,
          `Usage envelope failed CreateSurfaceMessageSchema for ${componentName}: ${messageResult.error?.message}`,
        ).toBe(true);

        for (const compDef of usageEntry.usage) {
          const compName = (compDef as Record<string, unknown>)['component'] as string;
          const compId = (compDef as Record<string, unknown>)['id'] as string;
          const compApi = basicComponentsMap.get(compName);
          expect(
            compApi,
            `Component "${compName}" in ${componentName} is not a valid v1.0 Basic component`,
          ).toBeDefined();

          const {id: _id, component: _component, ...props} = compDef as Record<string, unknown>;
          const compResult = compApi!.schema.safeParse(props);
          expect(
            compResult.success,
            `Component "${compName}" (id: "${compId}") in ${componentName} failed schema validation: ${compResult.error?.message}`,
          ).toBe(true);
        }
      }
    });
  });
});
