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
import {A2UI_RENDERER_CONFIG, A2uiRendererService} from '@a2ui/angular';
import {BasicCatalog} from '@a2ui/angular/v0_9';
import {a2uiBridge, createMcpFunctionsCatalog} from 'a2ui-bridge';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ANIMATION_MODULE_TYPE, provideZonelessChangeDetection, WritableSignal} from '@angular/core';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {AppComponentHarness} from './test/app.component.harness';
import {
  COMPOSER_V09_BASIC_CATALOG_ID,
  NPM_V09_BASIC_CATALOG_ID,
} from '../../../shared/v0-9/basic-catalog-id.js';
import {
  BasicWithMcpCatalog,
  BasicWithMcpNpmIdCatalog,
  toNativeAngularEntries,
} from './basic-with-mcp.catalog';
import {SampleBasicCatalog} from './sample-basic.catalog';

vi.mock('a2ui-bridge', () => ({
  a2uiBridge: {
    attachRenderer: vi.fn().mockReturnValue({unsubscribe: vi.fn()}),
    sendMessage: vi.fn(),
    sendAction: vi.fn(),
    getMcpClient: vi.fn(),
    getActiveProcessor: vi.fn(),
  },
  ERROR_OVERLAY_DEBOUNCE_MS: 350,
  MCP_FUNCTIONS_CATALOG_ID: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
  isV1ProtocolVersion: (v: unknown) =>
    typeof v === 'string' && (v.trim().startsWith('1.') || v.trim().startsWith('v1.')),
  createMcpFunctionsCatalog: () => ({
    id: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
    protocolVersion: '1.0',
    components: new Map(),
    functions: [],
  }),
  createMcpCatalogFunctions: vi.fn(() => []),
}));

describe('AppComponent (v0.9)', () => {
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
        provideA2uiSandbox([BasicCatalog]),
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
});

describe('AppComponent dual-version native Angular v0.9 & v1.0', () => {
  let fixture: ComponentFixture<AppComponent>;
  let sandbox: A2uiSandboxConnection;
  let renderer: A2uiRendererService;
  let harness: AppComponentHarness;

  beforeEach(async () => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        {provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations'},
        provideA2uiSandbox([
          SampleBasicCatalog,
          createMcpFunctionsCatalog(),
          BasicWithMcpCatalog,
          BasicWithMcpNpmIdCatalog,
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    sandbox = TestBed.inject(A2uiSandboxConnection);
    renderer = TestBed.inject(A2uiRendererService);
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppComponentHarness);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('strips tagName and element in toNativeAngularEntries without mutating source', () => {
    const entries = new Map([
      [
        'Text',
        {
          name: 'Text',
          component: class FakeText {},
          tagName: 'a2ui-basic-text',
          element: class FakeEl {},
        } as unknown as Parameters<typeof toNativeAngularEntries>[0] extends ReadonlyMap<
          string,
          infer V
        >
          ? V
          : never,
      ],
    ]);

    const stripped = toNativeAngularEntries(entries);
    expect(stripped).toHaveLength(1);
    expect('tagName' in stripped[0]).toBe(false);
    expect('element' in stripped[0]).toBe(false);
    expect('component' in stripped[0]).toBe(true);
    expect('tagName' in entries.get('Text')!).toBe(true);
  });

  it('registers all four catalogs with useUniversalComponents enabled for v1.0 coexistence', () => {
    const config = TestBed.inject(A2UI_RENDERER_CONFIG);
    const catalogs = config.catalogs as Array<{id?: string; protocolVersion?: string}>;
    expect(catalogs.map(c => c.id)).toEqual([
      'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
      'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
      COMPOSER_V09_BASIC_CATALOG_ID,
      NPM_V09_BASIC_CATALOG_ID,
    ]);
    expect(catalogs.map(c => c.protocolVersion)).toEqual(['1.0', '1.0', '0.9', '0.9']);
  });

  it('renders v0.9 payloads with native Angular a2ui-v09-text (not custom element) for both v0.9 catalog IDs', async () => {
    for (const [index, catalogId] of [
      COMPOSER_V09_BASIC_CATALOG_ID,
      NPM_V09_BASIC_CATALOG_ID,
    ].entries()) {
      const surfaceId = `v09-native-${index}`;
      renderer.processMessages([
        {
          version: 'v0.9',
          createSurface: {surfaceId, catalogId},
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId,
            components: [{id: 'root', component: 'Text', text: `Native v0.9 ${index}`}],
          },
        },
      ]);
      (sandbox.surfaceId as WritableSignal<string>).set(surfaceId);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(await harness.hasNativeV09Text()).toBe(true);
      expect(await harness.getNativeV09Text()).toContain(`Native v0.9 ${index}`);
      expect(await harness.hasUniversalV10Text()).toBe(false);
    }
  });

  it('continues rendering v1.0 payloads alongside v0.9', async () => {
    const surfaceId = 'v10-coexist';
    renderer.processMessages([
      {
        version: '1.0',
        createSurface: {
          surfaceId,
          catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
          components: [{id: 'root', component: 'Text', text: 'Coexisting v1.0'}],
        },
      },
    ]);
    (sandbox.surfaceId as WritableSignal<string>).set(surfaceId);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.hasUniversalV10Text()).toBe(true);
    expect(await harness.hasNativeV09Text()).toBe(false);
  });

  it('dispatches v0.9 actions when clicking native Angular a2ui-v09-button', async () => {
    const surfaceId = 'v09-button-action';
    renderer.processMessages([
      {
        version: 'v0.9',
        createSurface: {surfaceId, catalogId: COMPOSER_V09_BASIC_CATALOG_ID},
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId,
          components: [
            {
              id: 'root',
              component: 'Button',
              child: 'btn_label',
              action: {event: {name: 'nativeV09Click', context: {ok: true}}},
            },
            {id: 'btn_label', component: 'Text', text: 'Click Me'},
          ],
        },
      },
    ]);
    (sandbox.surfaceId as WritableSignal<string>).set(surfaceId);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.hasNativeV09Button()).toBe(true);
    await harness.clickNativeV09Button();
    expect(a2uiBridge.sendAction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'nativeV09Click',
        surfaceId,
        sourceComponentId: 'root',
      }),
    );
  });

  it('memoizes BasicWithMcpCatalog schema in BasicWithMcpNpmIdCatalog without regenerating or sharing mutable state', () => {
    const baseCatalog = TestBed.inject(BasicWithMcpCatalog);
    const npmCatalog = TestBed.inject(BasicWithMcpNpmIdCatalog);

    // Prime baseCatalog once so its own validationSchema memoization is populated.
    const baseSchema = baseCatalog.catalogSchema as Record<string, unknown>;
    const validationSpy = vi.spyOn(npmCatalog, 'validationSchema', 'get');
    const baseSchemaSpy = vi.spyOn(baseCatalog, 'catalogSchema', 'get');

    const npmSchema = npmCatalog.catalogSchema as Record<string, unknown>;
    const npmSchemaSecondRead = npmCatalog.catalogSchema as Record<string, unknown>;

    expect(validationSpy).not.toHaveBeenCalled();
    expect(baseSchemaSpy).toHaveBeenCalledTimes(1);
    expect(npmSchema).toEqual({
      ...baseSchema,
      catalogId: NPM_V09_BASIC_CATALOG_ID,
    });
    expect(npmSchema['$defs']).not.toBe(baseSchema['$defs']);
    expect(npmSchemaSecondRead['$defs']).not.toBe(npmSchema['$defs']);
  });
});
