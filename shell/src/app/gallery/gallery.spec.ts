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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {signal} from '@angular/core';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {ReplaySubject} from 'rxjs';
import {Clipboard} from '@angular/cdk/clipboard';
import {Gallery} from './gallery';
import {GalleryLauncher} from './gallery-launcher';
import {StartupConfigStateService} from '../shell/startup-resolution/state/startup-config-state.service';
import {GalleryHarness} from './test/gallery.harness';
import {GalleryCatalog, CategorizedComponents} from './services/gallery-catalog';
import {PreviewBridgeMessageType, type ComponentUsage} from 'a2ui-bridge';
import {CatalogManagement} from '../storage/catalog-management/catalog-management';
import {CatalogSchemaResolver, ParsedProperty} from './schema/catalog-schema-resolver';
import {ErrorLogger} from '../debug/error-logger.service';
import {Catalog} from '../storage/models/catalog-storage.model';
import {HostCommunication} from '../shell/host-communication/host-communication';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {
  AppConfigProvider,
  ThemePreference,
} from '../settings/app-config-provider/app-config-provider';
import {ChatState} from '../chat/chat-state/chat-state';
import {StateSync} from '../chat/state-sync/state-sync';
import {UsageTrackingService} from '../usage-tracking/usage-tracking.service';
import {NoopUsageTrackingService} from '../usage-tracking/noop-usage-tracking.service';
import type * as monaco from 'monaco-editor';

const {createMockMonaco} = vi.hoisted(() => {
  const create = vi.fn(
    (container: HTMLElement, options: monaco.editor.IStandaloneEditorConstructionOptions) => {
      const textarea = document.createElement('textarea');
      textarea.className = 'mock-monaco-textarea';
      textarea.value = (options.model as {value?: string} | undefined)?.value || '';
      if (options.readOnly) {
        textarea.readOnly = true;
      }
      container.appendChild(textarea);

      const mockModel = {
        getFullModelRange: vi.fn(() => ({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
        })),
        setValue: vi.fn((val: string) => {
          textarea.value = val;
          textarea.dispatchEvent(new Event('input'));
        }),
        dispose: vi.fn(),
      };

      return {
        getModel: vi.fn(() => mockModel),
        getValue: vi.fn(() => textarea.value),
        setValue: vi.fn((val: string) => mockModel.setValue(val)),
        executeEdits: vi.fn(
          (_source: string, edits: monaco.editor.IIdentifiedSingleEditOperation[]) => {
            if (edits && edits.length > 0) {
              textarea.value = edits[0].text ?? '';
              textarea.dispatchEvent(new Event('input'));
            }
            return true;
          },
        ),
        pushUndoStop: vi.fn(),
        setPosition: vi.fn(),
        revealPositionInCenterIfOutsideViewport: vi.fn(),
        revealPositionInCenter: vi.fn(),
        focus: vi.fn(),
        onDidChangeModelContent: vi.fn((cb: () => void) => {
          textarea.addEventListener('input', cb);
          return {dispose: () => textarea.removeEventListener('input', cb)};
        }),
        onDidChangeCursorPosition: vi.fn(() => ({dispose: () => {}})),
        onDidChangeCursorSelection: vi.fn(() => ({dispose: () => {}})),
        onKeyDown: vi.fn(() => ({dispose: () => {}})),
        onMouseDown: vi.fn(() => ({dispose: () => {}})),
        updateOptions: vi.fn((newOpts: monaco.editor.IEditorOptions) => {
          if (newOpts.readOnly !== undefined) {
            textarea.readOnly = newOpts.readOnly;
          }
        }),
        dispose: vi.fn(() => textarea.remove()),
      } as unknown as monaco.editor.IStandaloneCodeEditor;
    },
  );
  return {createMockMonaco: create};
});

vi.mock('@monaco-editor/loader', () => ({
  default: {
    config: vi.fn(),
    init: vi.fn().mockResolvedValue({
      Uri: {
        parse: vi.fn((uri: string) => ({toString: () => uri})),
      },
      editor: {
        defineTheme: vi.fn(),
        create: createMockMonaco,
        EndOfLineSequence: {LF: 0, CRLF: 1},
        getModel: vi.fn(() => null),
        createModel: vi.fn((value: string, language: string, uri: unknown) => ({
          value,
          language,
          uri,
          setValue: vi.fn(),
          setEOL: vi.fn(),
          dispose: vi.fn(),
        })),
        onDidChangeMarkers: vi.fn(() => ({dispose: () => {}})),
        getModelMarkers: vi.fn(() => []),
      },
      languages: {
        json: {
          jsonDefaults: {
            setDiagnosticsOptions: vi.fn(),
          },
        },
      },
    }),
  },
}));

interface TestFriendlyGallery {
  catalogId: () => string | null;
  selectedComponentDescription: () => string;
  copyToClipboard: () => void;
}

class MockGalleryCatalogService {
  readonly componentsList = signal<CategorizedComponents[]>([]);
  readonly selectedComponentKey = signal<string | null>(null);
  readonly selectedComponentProperties = signal<ParsedProperty[]>([]);
  readonly selectedComponentPreset = signal<ComponentUsage | null>(null);
  readonly selectedComponentUsage = signal<string>('');
  private readonly _galleryActive = signal<boolean>(false);
  readonly galleryActive = this._galleryActive.asReadonly();
  readonly loadingUsages = signal<boolean>(false);

  selectComponent = vi.fn((key: string | null) => {
    this.selectedComponentKey.set(key);
  });

  setGalleryActive = vi.fn((active: boolean) => {
    this._galleryActive.set(active);
  });
}

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
  readonly catalogError = signal<string | null>(null);
}

class MockHostCommunication {
  sendRenderA2UI = vi.fn();
  registerIframe = vi.fn();
  unregisterIframe = vi.fn();
  sendTheme = vi.fn();
  readonly messageStream$ = new ReplaySubject<unknown>(1);
  readonly messageStream = signal(null);
}

class MockStartupResolution {
  readonly resolvedUrl = signal<string | null>('http://localhost/renderer');
  getResolvedRendererUrl = vi.fn(() => 'http://localhost/renderer');
}

class MockChatState {
  readonly isProgrammaticStreamActive = signal<boolean>(false);
}

/**
 * Gallery embeds RenderedFrame, which injects StateSync. Mocking it prevents the real StateSync's
 * debounced history sync from calling into MockChatState after a test has finished.
 */
class MockStateSync {
  readonly sessionResetNonce = signal(0);
}

// The basic catalog's ChoicePicker and DateTimeInput, with the common types they reference.
const dynamic = (literal: Record<string, unknown>) => ({
  oneOf: [literal, {$ref: '#/$defs/DataBinding'}, {$ref: '#/$defs/FunctionCall'}],
});
const basicCatalog: Catalog = {
  catalogId: 'https://a2ui.org/basic_catalog.json',
  $defs: {
    DataBinding: {type: 'object', properties: {path: {type: 'string'}}, required: ['path']},
    FunctionCall: {type: 'object', properties: {call: {type: 'string'}}, required: ['call']},
    DynamicString: dynamic({type: 'string'}),
    DynamicStringList: dynamic({type: 'array', items: {type: 'string'}}),
    ComponentCommon: {
      type: 'object',
      properties: {id: {type: 'string'}, weight: {type: 'number'}},
      required: ['id'],
    },
  },
  components: {
    ChoicePicker: {
      type: 'object',
      allOf: [
        {$ref: '#/$defs/ComponentCommon'},
        {
          type: 'object',
          properties: {
            component: {const: 'ChoicePicker'},
            label: {$ref: '#/$defs/DynamicString'},
            variant: {type: 'string', enum: ['multipleSelection', 'mutuallyExclusive']},
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {label: {$ref: '#/$defs/DynamicString'}, value: {type: 'string'}},
                required: ['label', 'value'],
              },
            },
            value: {$ref: '#/$defs/DynamicStringList'},
            displayStyle: {type: 'string', enum: ['checkbox', 'chips']},
            filterable: {type: 'boolean'},
          },
          required: ['component', 'options', 'value'],
        },
      ],
    },
    DateTimeInput: {
      type: 'object',
      allOf: [
        {$ref: '#/$defs/ComponentCommon'},
        {
          type: 'object',
          properties: {
            component: {const: 'DateTimeInput'},
            value: {$ref: '#/$defs/DynamicString'},
            enableDate: {type: 'boolean'},
            enableTime: {type: 'boolean'},
            min: {$ref: '#/$defs/DynamicString'},
            label: {$ref: '#/$defs/DynamicString'},
          },
          required: ['component', 'value'],
        },
      ],
    },
  },
};
const choicePicker = {
  id: 'target',
  component: 'ChoicePicker',
  label: 'Size',
  options: [
    {label: 'Small', value: 's'},
    {label: 'Large', value: 'l'},
  ],
  value: {path: '/size'},
};

describe('Gallery Component', () => {
  let fixture: ComponentFixture<Gallery>;
  let harness: GalleryHarness;
  let catalogServiceMock: MockGalleryCatalogService;
  let catalogManagementMock: MockCatalogManagement;
  let hostCommunicationMock: MockHostCommunication;
  const launcher = {open: vi.fn<GalleryLauncher['open']>().mockResolvedValue()};
  let mockClipboard: {copy: ReturnType<typeof vi.fn>};

  beforeEach(async () => {
    launcher.open.mockClear();
    mockClipboard = {copy: vi.fn().mockReturnValue(true)};

    await TestBed.configureTestingModule({
      imports: [Gallery],
      providers: [
        provideNoopAnimations(),
        {provide: GalleryCatalog, useClass: MockGalleryCatalogService},
        {provide: CatalogManagement, useClass: MockCatalogManagement},
        {provide: HostCommunication, useClass: MockHostCommunication},
        {provide: StartupResolution, useClass: MockStartupResolution},
        {provide: AppConfigProvider, useValue: {themePreference: signal(ThemePreference.LIGHT)}},
        {provide: ChatState, useClass: MockChatState},
        {provide: StateSync, useClass: MockStateSync},
        {provide: UsageTrackingService, useClass: NoopUsageTrackingService},
        {provide: Clipboard, useValue: mockClipboard},
        {provide: GalleryLauncher, useValue: launcher},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, GalleryHarness);

    catalogServiceMock = TestBed.inject(GalleryCatalog) as unknown as MockGalleryCatalogService;
    catalogManagementMock = TestBed.inject(CatalogManagement) as unknown as MockCatalogManagement;
    hostCommunicationMock = TestBed.inject(HostCommunication) as unknown as MockHostCommunication;
    catalogManagementMock.activeCatalog.set({
      catalogId: 'https://a2ui.org/default_catalog.json',
      components: {
        Text: {type: 'object'},
        Row: {type: 'object'},
        Column: {type: 'object'},
      },
    });
  });

  it('renders components list grouped by categories and sorted alphabetically by default', async () => {
    catalogServiceMock.componentsList.set([
      {category: 'Layout', components: ['Column', 'Row']},
      {category: 'Content', components: ['Text']},
    ]);
    fixture.detectChanges();

    const headers = await harness.getCategoryHeadersText();
    expect(headers).toEqual(['Layout', 'Content']);

    const links = await harness.getNavigationLinksText();
    expect(links).toEqual(['Column', 'Row', 'Text']);
  });

  it('calls selectComponent on the catalog service when a sidebar navigation link is clicked', async () => {
    catalogServiceMock.componentsList.set([{category: 'Content', components: ['Text']}]);
    fixture.detectChanges();

    await harness.clickNavigationLink('Text');
    expect(catalogServiceMock.selectComponent).toHaveBeenCalledWith('Text');
  });

  it('updates the details card header with name and description when a component is selected', async () => {
    const mockCatalog: Catalog = {
      catalogId: 'https://a2ui.org/default_catalog.json',
      components: {
        Text: {
          type: 'object',
          description: 'A text block.',
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);

    catalogServiceMock.selectedComponentKey.set('Text');
    fixture.detectChanges();

    const title = await harness.getSelectedComponentTitle();
    const description = await harness.getSelectedComponentDescription();

    expect(title).toBe('Text');
    expect(description).toBe('A text block.');
  });

  it('renders correct properties inside the properties table', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentProperties.set([
      {
        name: 'text',
        description: 'The content string.',
        type: 'string',
        required: true,
        defaultValue: 'hello',
      },
      {
        name: 'variant',
        description: 'The typographic scale.',
        type: 'string',
        required: false,
      },
    ]);
    fixture.detectChanges();

    const data = await harness.getPropertiesTableData();
    expect(data.length).toBe(2);
    expect(data[0]).toEqual({
      name: 'text',
      description: 'The content string.',
      type: 'string',
      required: 'check_circle',
      defaultValue: '"hello"',
    });
    expect(data[1]).toEqual({
      name: 'variant',
      description: 'The typographic scale.',
      type: 'string',
      required: 'optional',
      defaultValue: '-',
    });
  });

  it('renders the usage JSON envelope and copies the formatted A2UI JSON array payload to the clipboard via CDK Clipboard', async () => {
    const mockCatalog: Catalog = {
      catalogId: 'https://a2ui.org/custom_catalog.json',
      components: {},
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);

    catalogServiceMock.selectedComponentKey.set('Text');
    const mockComponents = [{id: 'target', component: 'Text'}];
    catalogServiceMock.selectedComponentPreset.set({usage: mockComponents});
    const mockUsage = JSON.stringify(mockComponents, null, 2);
    catalogServiceMock.selectedComponentUsage.set(mockUsage);
    fixture.detectChanges();

    expect(JSON.parse(await harness.getDraftText())).toEqual({components: mockComponents});

    await harness.clickCopyButton();

    const expectedPayload = JSON.stringify(
      [
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'gallery-preview',
            catalogId: 'https://a2ui.org/custom_catalog.json',
          },
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'gallery-preview',
            components: [{id: 'root', component: 'Text'}],
          },
        },
      ],
      null,
      2,
    );

    expect(mockClipboard.copy).toHaveBeenCalledWith(expectedPayload);
  });

  it('displays empty state illustration when no component is selected', async () => {
    catalogServiceMock.selectedComponentKey.set(null);
    fixture.detectChanges();

    const title = await harness.getSelectedComponentTitle();
    expect(title).toBeNull();

    const desc = await harness.getSelectedComponentDescription();
    expect(desc).toBeNull();

    expect(await harness.hasDraftEditor()).toBe(false);

    const placeholderText = await harness.getEmptyStateSubtitleText();
    expect(placeholderText).toContain('Choose a component from the sidebar catalog');
  });

  it('updates the details card header with name and empty description when component has no description', async () => {
    const mockCatalog: Catalog = {
      catalogId: 'https://a2ui.org/default_catalog.json',
      components: {
        Text: {
          type: 'object',
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);

    catalogServiceMock.selectedComponentKey.set('Text');
    fixture.detectChanges();

    const title = await harness.getSelectedComponentTitle();
    expect(title).toBe('Text');

    const description = await harness.getSelectedComponentDescription();
    expect(description).toBeNull();
  });

  it('logs an error when CDK Clipboard copy returns false', async () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error');
    mockClipboard.copy.mockReturnValue(false);

    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({usage: []});
    catalogServiceMock.selectedComponentUsage.set('[]');
    fixture.detectChanges();

    await harness.clickCopyButton();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Failed to copy A2UI component usage to clipboard.'),
        sourceTag: '[Gallery]',
      }),
    );
  });

  it('reports clipboard exceptions without losing the valid preview', async () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error');
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({usage: [{id: 'target', component: 'Text'}]});
    fixture.detectChanges();
    mockClipboard.copy.mockImplementation(() => {
      throw new Error('Clipboard unavailable');
    });
    await harness.clickCopyButton();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Failed to parse or format A2UI usage payload: '),
        sourceTag: '[Gallery]',
      }),
    );
  });

  it('returns gracefully when selectedComponentPreset is null or missing usage array', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set(null);
    fixture.detectChanges();

    await harness.clickCopyButton();

    expect(mockClipboard.copy).not.toHaveBeenCalled();
  });

  it('throws an error in the harness when trying to click a non-existent navigation link', async () => {
    await expect(harness.clickNavigationLink('NonExistent')).rejects.toThrow(
      'Could not find navigation link with text: "NonExistent"',
    );
  });

  it('throws an error in the harness when trying to click copy button in empty state', async () => {
    catalogServiceMock.selectedComponentKey.set(null);
    fixture.detectChanges();

    await expect(harness.clickCopyButton()).rejects.toThrow('Clipboard copy button is not present');
  });

  it('returns an empty array in the harness when reading table rows in empty state', async () => {
    catalogServiceMock.selectedComponentKey.set(null);
    fixture.detectChanges();

    const data = await harness.getPropertiesTableData();
    expect(data).toEqual([]);
  });

  it('does not attempt to copy to the clipboard if selectedComponentUsage resolves to an empty string', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentUsage.set('');
    fixture.detectChanges();

    await harness.clickCopyButton();

    expect(mockClipboard.copy).not.toHaveBeenCalled();
  });

  it('returns null for empty state subtitle when a component is selected', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    fixture.detectChanges();

    const subtitleText = await harness.getEmptyStateSubtitleText();
    expect(subtitleText).toBeNull();
  });

  it('renders the details cards with updated header titles', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    fixture.detectChanges();

    const titles = await harness.getCardTitlesText();
    expect(titles).toEqual(['Preview', 'Edit JSON', 'Properties']);
  });

  it('switches between the Preview and Edit JSON tabs while keeping the preview frame mounted', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    fixture.detectChanges();

    expect(await harness.getPlaygroundTabsText()).toEqual(['Preview', 'Edit JSON']);
    expect(await harness.getActivePlaygroundTabText()).toBe('Preview');
    expect(await harness.isPreviewCardHidden()).toBe(false);
    expect(await harness.isJsonCardHidden()).toBe(true);
    expect(await harness.hasRenderedFrame()).toBe(true);

    await harness.selectPlaygroundTab('Edit JSON');
    expect(await harness.getActivePlaygroundTabText()).toBe('Edit JSON');
    expect(await harness.isPreviewCardHidden()).toBe(true);
    expect(await harness.isJsonCardHidden()).toBe(false);
    expect(await harness.hasRenderedFrame()).toBe(true);

    await harness.selectPlaygroundTab('Preview');
    expect(await harness.getActivePlaygroundTabText()).toBe('Preview');
    expect(await harness.isPreviewCardHidden()).toBe(false);
    expect(await harness.isJsonCardHidden()).toBe(true);

    await expect(harness.selectPlaygroundTab('NonExistent')).rejects.toThrow(
      'Could not find playground tab with text: "NonExistent"',
    );
  });

  it('returns null for active playground tab in empty state', async () => {
    catalogServiceMock.selectedComponentKey.set(null);
    fixture.detectChanges();

    expect(await harness.getActivePlaygroundTabText()).toBeNull();
  });

  it('displays catalog configuration error state when catalogError is set', async () => {
    catalogManagementMock.catalogError.set('Mock Catalog Error: Connection Failed');
    fixture.detectChanges();

    const placeholderText = await harness.getEmptyStateSubtitleText();
    expect(placeholderText).toContain('Mock Catalog Error: Connection Failed');
  });

  it('dispatches the rendering payload to HostCommunication when selection changes', async () => {
    catalogServiceMock.selectedComponentPreset.set({usage: [{id: 'target', component: 'Text'}]});
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.tick();

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId: 'https://a2ui.org/default_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: [{id: 'root', component: 'Text'}],
        },
      },
    ]);
  });

  it('normalizes a legacy target-only example without requiring a Column in the catalog', async () => {
    catalogManagementMock.activeCatalog.set({
      catalogId: 'https://a2ui.org/custom_catalog.json',
      components: {
        Text: {type: 'object'},
      }, // No Column component
    });
    catalogServiceMock.selectedComponentPreset.set({usage: [{id: 'target', component: 'Text'}]});
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.tick();

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId: 'https://a2ui.org/custom_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: [{id: 'root', component: 'Text'}],
        },
      },
    ]);
  });

  it('does not dispatch rendering payload if selectedComponentPreset is null or usage is not an array', async () => {
    catalogServiceMock.selectedComponentPreset.set(null);
    fixture.detectChanges();
    TestBed.tick();

    expect(hostCommunicationMock.sendRenderA2UI).not.toHaveBeenCalled();
  });

  it('dispatches updateDataModel command when preset contains data model', async () => {
    const mockComponents = [{id: 'target', component: 'TextField'}];
    const mockData = {user: {name: 'Hello'}};
    catalogServiceMock.selectedComponentPreset.set({usage: mockComponents, data: mockData});
    catalogServiceMock.selectedComponentUsage.set(JSON.stringify(mockComponents));
    fixture.detectChanges();
    TestBed.tick();

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId: 'https://a2ui.org/default_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: [{id: 'root', component: 'TextField'}],
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'gallery-preview',
          value: mockData,
        },
      },
    ]);
  });

  it('does not infer layout behavior from a catalog component named coLuMn', async () => {
    catalogManagementMock.activeCatalog.set({
      catalogId: 'https://a2ui.org/custom_catalog.json',
      components: {
        Text: {type: 'object'},
        coLuMn: {type: 'object'}, // Case variation
      },
    });
    catalogServiceMock.selectedComponentPreset.set({usage: [{id: 'target', component: 'Text'}]});
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.tick();

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId: 'https://a2ui.org/custom_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: [{id: 'root', component: 'Text'}],
        },
      },
    ]);
  });

  it('catalogId returns null when activeCatalog is null', () => {
    catalogManagementMock.activeCatalog.set(null);
    expect((fixture.componentInstance as unknown as TestFriendlyGallery).catalogId()).toBeNull();
  });

  it('catalogId returns null if both catalogId and $id are missing in activeCatalog', () => {
    catalogManagementMock.activeCatalog.set({
      components: {},
    });
    expect((fixture.componentInstance as unknown as TestFriendlyGallery).catalogId()).toBeNull();
  });

  it('resolves catalogId from $id in computed and rendering effect if catalogId is missing', () => {
    catalogManagementMock.activeCatalog.set({
      $id: 'https://a2ui.org/fallback_catalog.json',
      components: {
        Text: {type: 'object'},
      },
    });
    catalogServiceMock.selectedComponentPreset.set({usage: [{id: 'target', component: 'Text'}]});
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.tick();

    expect((fixture.componentInstance as unknown as TestFriendlyGallery).catalogId()).toBe(
      'https://a2ui.org/fallback_catalog.json',
    );
    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId: 'https://a2ui.org/fallback_catalog.json',
        },
      },
      expect.anything(),
    ]);
  });

  it('selectedComponentDescription returns empty string if components catalog is missing', () => {
    catalogManagementMock.activeCatalog.set({
      catalogId: 'mock-id',
    });
    catalogServiceMock.selectedComponentKey.set('Text');
    expect(
      (fixture.componentInstance as unknown as TestFriendlyGallery).selectedComponentDescription(),
    ).toBe('');
  });

  it('handles active catalogs with undefined components list safely', () => {
    catalogManagementMock.activeCatalog.set({
      catalogId: 'https://a2ui.org/empty.json',
    });
    catalogServiceMock.selectedComponentPreset.set({usage: [{id: 'target', component: 'Text'}]});
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.tick();

    // Should safely proceed without throwing errors and render unwrapped
    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalled();
  });

  it('does not copy to clipboard if active catalog has no valid ID', async () => {
    catalogManagementMock.activeCatalog.set(null);
    catalogServiceMock.selectedComponentPreset.set({usage: []});
    catalogServiceMock.selectedComponentUsage.set('[]');
    fixture.detectChanges();
    await expect(harness.clickCopyButton()).rejects.toThrow('Clipboard copy button is not present');
    expect(mockClipboard.copy).not.toHaveBeenCalled();
  });

  it('does not dispatch render command if active catalog is null', () => {
    hostCommunicationMock.sendRenderA2UI.mockClear();
    catalogManagementMock.activeCatalog.set(null);
    catalogServiceMock.selectedComponentPreset.set({usage: [{id: 'target', component: 'Text'}]});
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.tick();

    expect(hostCommunicationMock.sendRenderA2UI).not.toHaveBeenCalled();
  });

  it('renders the a2ui-composer-rendered-frame element when a component is active', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    fixture.detectChanges();

    const hasFrame = await harness.hasRenderedFrame();
    expect(hasFrame).toBe(true);
  });

  it('triggers another rendering update call when changing component selection', async () => {
    catalogManagementMock.activeCatalog.set({
      catalogId: 'https://a2ui.org/custom_catalog.json',
      components: {
        Text: {type: 'object'},
        Button: {type: 'object'},
        Column: {type: 'object'},
      },
    });

    const usageText = [
      {
        id: 'target',
        component: 'Text',
        text: 'Headline Large (H1)',
        variant: 'h1',
      },
    ];
    const usageButton = [
      {
        id: 'target',
        component: 'Button',
        text: 'Click Me',
      },
    ];

    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({usage: usageText});
    catalogServiceMock.selectedComponentUsage.set(JSON.stringify(usageText));
    fixture.detectChanges();

    const expectedTextLine1 = {
      version: 'v0.9',
      createSurface: {
        surfaceId: 'gallery-preview',
        catalogId: 'https://a2ui.org/custom_catalog.json',
      },
    };
    const expectedTextLine2 = {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'gallery-preview',
        components: [{...usageText[0], id: 'root'}],
      },
    };
    const expectedTextPayload = [expectedTextLine1, expectedTextLine2];

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith(expectedTextPayload);

    hostCommunicationMock.sendRenderA2UI.mockClear();

    catalogServiceMock.selectedComponentKey.set('Button');
    catalogServiceMock.selectedComponentPreset.set({usage: usageButton});
    catalogServiceMock.selectedComponentUsage.set(JSON.stringify(usageButton));
    fixture.detectChanges();

    const expectedButtonLine2 = {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'gallery-preview',
        components: [{...usageButton[0], id: 'root'}],
      },
    };
    const expectedButtonPayload = [expectedTextLine1, expectedButtonLine2];

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith(expectedButtonPayload);
  });

  it('preserves authored root IDs and internal child references', async () => {
    catalogManagementMock.activeCatalog.set({
      catalogId: 'https://a2ui.org/default_catalog.json',
      components: {
        Card: {type: 'object'},
        Text: {type: 'object'},
        Column: {type: 'object'},
      },
    });
    catalogServiceMock.selectedComponentKey.set('Card');
    const mockUsage = [
      {id: 'root', component: 'Card', children: ['header']},
      {id: 'header', component: 'Text', text: 'Hello'},
    ];
    catalogServiceMock.selectedComponentPreset.set({usage: mockUsage});
    catalogServiceMock.selectedComponentUsage.set(JSON.stringify(mockUsage));
    fixture.detectChanges();

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId: 'https://a2ui.org/default_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: [
            {id: 'root', component: 'Card', children: ['header']},
            {id: 'header', component: 'Text', text: 'Hello'},
          ],
        },
      },
    ]);
  });

  it('dispatches a complete example payload with bound data', () => {
    const preset = {
      usage: [{id: 'target', component: 'Text', text: 'Hello'}],
      data: {key: 'val'},
    };
    catalogServiceMock.selectedComponentPreset.set(preset);
    fixture.detectChanges();
    const payload = hostCommunicationMock.sendRenderA2UI.mock.lastCall?.[0];

    expect(payload).toEqual([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId: 'https://a2ui.org/default_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: [{id: 'root', component: 'Text', text: 'Hello'}],
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'gallery-preview',
          value: {key: 'val'},
        },
      },
    ]);
  });

  it('re-dispatches preview payload when RENDERER_READY message is received on messageStream$', () => {
    catalogServiceMock.selectedComponentPreset.set({usage: [{id: 'target', component: 'Text'}]});
    fixture.detectChanges();
    TestBed.tick();

    hostCommunicationMock.sendRenderA2UI.mockClear();

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: Date.now(),
    });

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledTimes(1);
  });

  it('keeps the ready subscription alive when the preview transport fails once', () => {
    catalogServiceMock.selectedComponentPreset.set({usage: [{id: 'target', component: 'Text'}]});
    fixture.detectChanges();
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error');
    hostCommunicationMock.sendRenderA2UI.mockClear();
    hostCommunicationMock.sendRenderA2UI.mockImplementationOnce(() => {
      throw new Error('Transport failure');
    });
    hostCommunicationMock.messageStream$.next({type: PreviewBridgeMessageType.RENDERER_READY});
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Failed to dispatch component example:'),
        sourceTag: '[Gallery]',
      }),
    );
    hostCommunicationMock.messageStream$.next({type: PreviewBridgeMessageType.RENDERER_READY});
    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledTimes(2);
  });

  it('dispatches preview payload when default component auto-selection sets selectedComponentPreset', () => {
    hostCommunicationMock.sendRenderA2UI.mockClear();

    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Button'}],
    });
    fixture.detectChanges();
    TestBed.tick();

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId: 'https://a2ui.org/default_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: [{id: 'root', component: 'Button'}],
        },
      },
    ]);
  });

  it('verifies JSON stringified postMessage payload key structure contains required protocol fields', async () => {
    mockClipboard.copy.mockReturnValue(true);
    catalogServiceMock.selectedComponentKey.set('Button');
    const mockUsage = [{id: 'target', component: 'Button'}];
    const mockData = {count: 1};
    catalogServiceMock.selectedComponentPreset.set({
      usage: mockUsage,
      data: mockData,
    });
    catalogServiceMock.selectedComponentUsage.set(JSON.stringify(mockUsage));
    fixture.detectChanges();

    await harness.clickCopyButton();

    expect(mockClipboard.copy).toHaveBeenCalled();
    const copiedPayloadString = mockClipboard.copy.mock.calls[0][0] as string;
    const parsedPayload = JSON.parse(copiedPayloadString);

    expect(parsedPayload[0]).toHaveProperty('version');
    expect(parsedPayload[0]).toHaveProperty('createSurface');
    expect(parsedPayload[0].createSurface).toHaveProperty('surfaceId');
    expect(parsedPayload[0].createSurface).toHaveProperty('catalogId');

    expect(parsedPayload[1]).toHaveProperty('version');
    expect(parsedPayload[1]).toHaveProperty('updateComponents');
    expect(parsedPayload[1].updateComponents).toHaveProperty('surfaceId');
    expect(parsedPayload[1].updateComponents).toHaveProperty('components');

    expect(parsedPayload[2]).toHaveProperty('version');
    expect(parsedPayload[2]).toHaveProperty('updateDataModel');
    expect(parsedPayload[2].updateDataModel).toHaveProperty('surfaceId');
    expect(parsedPayload[2].updateDataModel).toHaveProperty('value');
  });

  it('verifies JSON stringified postMessage payload contains exact quoted keys', () => {
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Text'}],
    });
    fixture.detectChanges();
    TestBed.tick();

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalled();
    const payload = hostCommunicationMock.sendRenderA2UI.mock.calls[0][0];
    const rawJson = JSON.stringify(payload);

    expect(rawJson).toContain('"version":"v0.9"');
    expect(rawJson).toContain('"createSurface":');
    expect(rawJson).toContain('"surfaceId":"gallery-preview"');
    expect(rawJson).toContain('"catalogId":');
    expect(rawJson).toContain('"updateComponents":');
    expect(rawJson).toContain('"components":');
    expect(rawJson).toContain('"id":"root"');
    expect(rawJson).toContain('"component":"Text"');
  });

  it('reports an unencodable renderer example without enabling copy or breaking the Gallery', async () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error');
    const cyclic: Record<string, unknown> = {id: 'target', component: 'Text'};
    cyclic['self'] = cyclic;
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({usage: [cyclic]});
    fixture.detectChanges();
    expect(await harness.getDraftError()).toContain('Could not load');
    await harness.clickCopyButton();
    expect(mockClipboard.copy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Failed to load component example:'),
        sourceTag: '[Gallery]',
      }),
    );
  });

  describe('Usage Tracking Instrumentation', () => {
    it('tracks gallery view on init', () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const trackSpy = vi.spyOn(trackingService, 'trackGalleryView');

      fixture.componentInstance.ngOnInit();

      expect(trackSpy).toHaveBeenCalledWith();
    });

    it('tracks component select when item is chosen', async () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const trackSpy = vi.spyOn(trackingService, 'trackGalleryComponentSelect');

      catalogServiceMock.componentsList.set([{category: 'Content', components: ['Text']}]);

      await harness.clickNavigationLink('Text');

      expect(trackSpy).toHaveBeenCalledWith({
        componentKey: 'Text',
        category: 'Content',
      });
    });

    it('tracks copying usage snippet to clipboard successfully', async () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const trackSpy = vi.spyOn(trackingService, 'trackGalleryCopyUsage');

      catalogServiceMock.selectedComponentPreset.set({
        usage: [{id: 'target', component: 'Text'}],
      });
      catalogServiceMock.selectedComponentKey.set('Text');
      mockClipboard.copy.mockReturnValueOnce(true);

      await harness.clickCopyButton();
      await Promise.resolve();

      expect(trackSpy).toHaveBeenCalledWith({
        componentKey: 'Text',
      });
    });

    it('does not track copying usage snippet to clipboard on failure', async () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const trackSpy = vi.spyOn(trackingService, 'trackGalleryCopyUsage');
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error');

      catalogServiceMock.selectedComponentPreset.set({
        usage: [{id: 'target', component: 'Text'}],
      });
      catalogServiceMock.selectedComponentKey.set('Text');
      mockClipboard.copy.mockReturnValueOnce(false);

      await harness.clickCopyButton();
      await Promise.resolve();

      expect(trackSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Failed to copy A2UI component usage to clipboard.'),
          sourceTag: '[Gallery]',
        }),
      );
    });
  });
  it('edits a property and retains the same valid preview and copy payload through invalid JSON and late usages', async () => {
    catalogManagementMock.activeCatalog.set({
      catalogId: 'custom://notice',
      components: {Notice: {type: 'object', properties: {text: {type: 'string'}}}},
    });
    catalogServiceMock.selectedComponentKey.set('Notice');
    catalogServiceMock.selectedComponentProperties.set([
      {name: 'text', type: 'string', required: true, description: 'Notice text'},
    ]);
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Notice', text: 'Original'}],
      data: {count: 1},
    });
    fixture.detectChanges();
    await harness.editProperty('text', 'Edited notice');
    expect(await harness.getDraftText()).toContain('Edited notice');
    const dispatched = hostCommunicationMock.sendRenderA2UI.mock.lastCall?.[0];
    expect(dispatched[1].updateComponents.components[0].text).toBe('Edited notice');
    await harness.clickCopyButton();
    expect(JSON.parse(mockClipboard.copy.mock.lastCall?.[0])).toEqual(dispatched);

    await harness.editDraft('{broken');
    expect(await harness.getDraftError()).toContain('JSON');
    expect(await harness.getDraftText()).toBe('{broken');
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Notice', text: 'Late reply'}],
    });
    hostCommunicationMock.messageStream$.next({type: PreviewBridgeMessageType.RENDERER_READY});
    fixture.detectChanges();
    expect(await harness.getDraftText()).toBe('{broken');
    await harness.clickCopyButton();
    expect(JSON.parse(mockClipboard.copy.mock.lastCall?.[0])).toEqual(dispatched);
    expect(hostCommunicationMock.sendRenderA2UI.mock.lastCall?.[0]).toEqual(dispatched);
  });

  it('updates bound data from JSON and rejects components outside the active catalog', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Text', text: {path: '/name'}}],
      data: {name: 'Original'},
    });
    fixture.detectChanges();
    const edited = {
      components: [{id: 'target', component: 'Text', text: {path: '/name'}}],
      data: {name: 'New name'},
    };
    await harness.editDraft(JSON.stringify(edited));
    const preview = hostCommunicationMock.sendRenderA2UI.mock.lastCall?.[0];
    expect(preview[2].updateDataModel.value).toEqual({name: 'New name'});
    await harness.editDraft(
      JSON.stringify({...edited, components: [{id: 'target', component: 'OtherCatalog'}]}),
    );
    expect(await harness.getDraftError()).toContain('OtherCatalog');
    await harness.clickCopyButton();
    expect(JSON.parse(mockClipboard.copy.mock.lastCall?.[0])).toEqual(preview);
  });

  it('resets the draft for a new component or catalog but not an equivalent catalog announcement', async () => {
    const catalog: Catalog = {
      catalogId: 'custom://notice',
      components: {Notice: {type: 'object'}, Other: {type: 'object'}},
    };
    catalogManagementMock.activeCatalog.set(catalog);
    catalogServiceMock.selectedComponentKey.set('Notice');
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Notice', text: 'First'}],
    });
    fixture.detectChanges();
    await harness.editDraft(
      JSON.stringify({components: [{id: 'target', component: 'Notice', text: 'Edited'}]}),
    );
    catalogManagementMock.activeCatalog.set(structuredClone(catalog));
    fixture.detectChanges();
    expect(await harness.getDraftText()).toContain('Edited');
    catalogServiceMock.selectedComponentKey.set('Other');
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Other', text: 'Second'}],
    });
    fixture.detectChanges();
    expect(await harness.getDraftText()).toContain('Second');
    catalogManagementMock.activeCatalog.set({...catalog, catalogId: 'custom://new'});
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Other', text: 'New catalog'}],
    });
    fixture.detectChanges();
    expect(await harness.getDraftText()).toContain('New catalog');
  });
  it.each<{
    name: string;
    catalog: Catalog;
    selected: string;
    authored: Record<string, unknown>[];
    expected: Record<string, unknown>[];
  }>([
    {
      name: 'an authored root and target tree with internal child references',
      catalog: {
        catalogId: 'custom://tree',
        components: {
          Column: {type: 'object'},
          Row: {type: 'object'},
          Text: {type: 'object'},
        },
      },
      selected: 'Column',
      authored: [
        {id: 'root', component: 'Column', children: ['target', 'detail']},
        {id: 'target', component: 'Row', children: ['label']},
        {id: 'label', component: 'Text', text: 'Name'},
        {id: 'detail', component: 'Text', text: 'target'},
      ],
      expected: [
        {id: 'root', component: 'Column', children: ['target', 'detail']},
        {id: 'target', component: 'Row', children: ['label']},
        {id: 'label', component: 'Text', text: 'Name'},
        {id: 'detail', component: 'Text', text: 'target'},
      ],
    },
    {
      name: 'a legacy target-only container and its child references',
      catalog: {
        catalogId: 'custom://tree',
        components: {Column: {type: 'object'}, Text: {type: 'object'}},
      },
      selected: 'Column',
      authored: [
        {id: 'target', component: 'Column', children: ['label']},
        {id: 'label', component: 'Text', text: 'target'},
      ],
      expected: [
        {id: 'root', component: 'Column', children: ['label']},
        {id: 'label', component: 'Text', text: 'target'},
      ],
    },
    {
      name: 'a prefixed Column with custom slots and mode properties',
      catalog: {
        catalogId: 'custom://acme',
        components: {
          AcmeColumn: {
            type: 'object',
            properties: {
              id: {type: 'string'},
              component: {const: 'AcmeColumn'},
              slots: {type: 'array'},
              mode: {type: 'string', enum: ['stacked']},
            },
            required: ['slots', 'mode'],
            additionalProperties: false,
          },
          Text: {type: 'object'},
        },
      },
      selected: 'AcmeColumn',
      authored: [
        {id: 'target', component: 'AcmeColumn', slots: ['label'], mode: 'stacked'},
        {id: 'label', component: 'Text', text: 'Custom child'},
      ],
      expected: [
        {id: 'root', component: 'AcmeColumn', slots: ['label'], mode: 'stacked'},
        {id: 'label', component: 'Text', text: 'Custom child'},
      ],
    },
  ])('preserves $name across preview, copy, and Open', async scenario => {
    catalogManagementMock.activeCatalog.set(scenario.catalog);
    catalogServiceMock.selectedComponentKey.set(scenario.selected);
    catalogServiceMock.selectedComponentPreset.set({usage: scenario.authored});
    fixture.detectChanges();
    await harness.editDraft(
      JSON.stringify({components: scenario.authored, data: {name: 'Edited'}}),
    );
    expect(await harness.getDraftError()).toBeNull();
    const preview = hostCommunicationMock.sendRenderA2UI.mock.lastCall?.[0];
    expect(preview[1].updateComponents.components).toEqual(scenario.expected);
    expect(preview[2].updateDataModel.value).toEqual({name: 'Edited'});
    expect(JSON.parse(await harness.getDraftText()).components).toEqual(scenario.authored);
    await harness.clickCopyButton();
    await harness.openInComposer();
    const copied = mockClipboard.copy.mock.lastCall?.[0];
    expect(JSON.parse(copied)).toEqual(preview);
    expect(launcher.open.mock.lastCall?.[0]).toBe(copied);
  });

  it('copies and opens byte-equivalent last valid JSON with the selected renderer after an invalid edit', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Text', text: 'Initial'}],
    });
    TestBed.inject(StartupConfigStateService).setSelectedRendererId('selected');
    fixture.detectChanges();
    await harness.editDraft(
      JSON.stringify({components: [{id: 'target', component: 'Text', text: 'Final'}]}),
    );
    await harness.editDraft('{bad');
    await harness.clickCopyButton();
    await harness.openInComposer();
    expect(launcher.open).toHaveBeenCalledWith(
      mockClipboard.copy.mock.lastCall?.[0],
      'http://localhost/renderer',
      'selected',
    );
    expect(JSON.parse(mockClipboard.copy.mock.lastCall?.[0])).toEqual(
      hostCommunicationMock.sendRenderA2UI.mock.lastCall?.[0],
    );
  });

  it('reports an error and re-enables Open in Composer when launching fails, and ignores missing renderer or concurrent opens', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Text', text: 'Initial'}],
    });
    fixture.detectChanges();

    const startup = TestBed.inject(StartupResolution) as unknown as MockStartupResolution;
    const openInComposer = () =>
      (fixture.componentInstance as unknown as {openInComposer(): Promise<void>}).openInComposer();

    // Guard when rendererUrl() is null:
    startup.resolvedUrl.set(null);
    fixture.detectChanges();
    launcher.open.mockClear();
    await openInComposer();
    expect(launcher.open).not.toHaveBeenCalled();

    // Restore rendererUrl:
    startup.resolvedUrl.set('http://localhost/renderer');
    fixture.detectChanges();

    // Guard when opening() is already in flight:
    let resolveOpen!: () => void;
    launcher.open.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveOpen = resolve;
        }),
    );
    const firstOpen = openInComposer();
    await openInComposer();
    expect(launcher.open).toHaveBeenCalledTimes(1);
    resolveOpen();
    await firstOpen;

    // Rejecting with an Error displays error.message and resets opening() so retry works:
    launcher.open.mockRejectedValueOnce(new Error('Storage quota exceeded.'));
    await harness.openInComposer();
    expect(await harness.getStatusMessages()).toContain('Storage quota exceeded.');

    // Rejecting with a non-Error value falls back to default message and resets opening():
    launcher.open.mockRejectedValueOnce('unknown failure');
    await harness.openInComposer();
    expect(await harness.getStatusMessages()).toContain('Could not open this example.');
  });

  it('resets an edited draft when the selected renderer URL changes', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Text', text: 'Initial'}],
    });
    fixture.detectChanges();
    await harness.editDraft(
      JSON.stringify({components: [{id: 'target', component: 'Text', text: 'Edited'}]}),
    );
    const startup = TestBed.inject(StartupResolution) as unknown as MockStartupResolution;
    startup.resolvedUrl.set('http://localhost/new-renderer');
    fixture.detectChanges();
    expect(await harness.getDraftText()).toContain('Initial');
    expect(await harness.getDraftText()).not.toContain('Edited');
  });

  it('keeps the current draft when renderer validation and theme messages arrive', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Text', text: 'Initial'}],
    });
    fixture.detectChanges();
    await harness.editDraft(
      JSON.stringify({components: [{id: 'target', component: 'Text', text: 'Edited'}]}),
    );
    hostCommunicationMock.sendRenderA2UI.mockClear();
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
      payload: {validationErrors: []},
    });
    fixture.detectChanges();
    expect(await harness.getDraftText()).toContain('Edited');
    expect(hostCommunicationMock.sendRenderA2UI).not.toHaveBeenCalled();
  });

  it('still edits properties when the catalog declares no schema for the component', async () => {
    // `resolveComponentPropertiesSchema` returns `{}` for a component the catalog does not
    // describe, so the property controls must fall back to the draft values rather than
    // failing to render.
    catalogManagementMock.activeCatalog.set({
      catalogId: 'custom://unresolved',
      components: {Notice: {type: 'object'}},
    });
    catalogServiceMock.selectedComponentKey.set('Notice');
    catalogServiceMock.selectedComponentProperties.set([
      {name: 'text', type: 'string', description: '', required: false},
    ]);
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Notice', text: 'Initial'}],
    });
    expect(() => fixture.detectChanges()).not.toThrow();

    await harness.editProperty('text', 'Edited');
    expect(JSON.parse(await harness.getDraftText()).components[0]).toMatchObject({
      text: 'Edited',
    });
    expect(await harness.getDraftError()).toBeNull();
  });

  it('preserves native number, boolean and enum values in supported property controls', async () => {
    catalogManagementMock.activeCatalog.set({
      catalogId: 'custom://controls',
      components: {
        Notice: {
          type: 'object',
          properties: {
            count: {type: 'number'},
            enabled: {type: 'boolean'},
            emphasis: {type: 'string', enum: ['normal', 'strong']},
          },
        },
      },
    });
    catalogServiceMock.selectedComponentKey.set('Notice');
    catalogServiceMock.selectedComponentProperties.set([
      {name: 'count', type: 'number', description: '', required: false},
      {name: 'enabled', type: 'boolean', description: '', required: false},
      {name: 'emphasis', type: 'string', description: '', required: false},
    ]);
    catalogServiceMock.selectedComponentPreset.set({
      usage: [{id: 'target', component: 'Notice', count: 2, enabled: true, emphasis: 'normal'}],
    });
    fixture.detectChanges();
    await harness.editProperty('count', '');
    await harness.editProperty('count', '12');
    await harness.toggleProperty('enabled');
    await harness.selectPropertyOption('emphasis', 2);
    expect(JSON.parse(await harness.getDraftText()).components[0]).toMatchObject({
      count: 12,
      enabled: false,
      emphasis: 'strong',
    });
    expect(await harness.getDraftError()).toBeNull();
  });

  describe('property editor', () => {
    const select = (name: string, usage: Record<string, unknown>[]) => {
      catalogManagementMock.activeCatalog.set(basicCatalog);
      catalogServiceMock.selectedComponentKey.set(name);
      catalogServiceMock.selectedComponentProperties.set(
        new CatalogSchemaResolver(basicCatalog, new ErrorLogger()).resolveComponentProperties(name),
      );
      catalogServiceMock.selectedComponentPreset.set({usage, data: {size: ['s']}});
      fixture.detectChanges();
    };
    const target = async () => JSON.parse(await harness.getDraftText()).components[0];

    it('flags a required property the example does not set, and only that one', async () => {
      const {value: _value, ...withoutValue} = choicePicker;
      select('ChoicePicker', [withoutValue]);
      expect(await harness.isPropertyMissing('value')).toBe(true);
      expect(await harness.isPropertyMissing('options')).toBe(false);
      expect(await harness.isPropertyMissing('displayStyle')).toBe(false);
    });

    it('lists every catalog property, including required and unset optional ones', async () => {
      select('ChoicePicker', [choicePicker]);
      // Required first, then ChoicePicker's own, then those every component shares.
      expect(await harness.getPropertyNames()).toEqual([
        'options',
        'value',
        'variant',
        'displayStyle',
        'filterable',
        'weight',
        'label',
      ]);
      expect(await harness.getPropertySectionHeadings()).toEqual(['Common properties']);
      expect(await harness.getPropertyControlKind('options')).toBe('array');
      expect(await harness.getPropertyControlKind('displayStyle')).toBe('select');
      expect(await harness.getPropertyControlKind('filterable')).toBe('checkbox');
      expect(await harness.getPropertyControlKind('weight')).toBe('number');
      expect(await harness.getPropertyControlKind('label')).toBe('text');
      expect(await harness.isPropertyRequired('options')).toBe(true);
      expect(await harness.isPropertyRequired('displayStyle')).toBe(false);
    });

    it('adds an unset enum property and removes it again with "(not set)"', async () => {
      select('ChoicePicker', [choicePicker]);
      expect(await harness.getPropertyOptions('displayStyle')).toEqual([
        '(not set)',
        'checkbox',
        'chips',
      ]);
      await harness.selectPropertyOption('displayStyle', 2);
      expect((await target()).displayStyle).toBe('chips');
      expect(hostCommunicationMock.sendRenderA2UI.mock.lastCall?.[0][1]).toMatchObject({
        updateComponents: {components: [{displayStyle: 'chips'}]},
      });
      await harness.selectPropertyOption('displayStyle', 0);
      expect(await target()).not.toHaveProperty('displayStyle');
    });

    it('edits array items, duplicates the last item on Add Entry, and creates a default item when empty', async () => {
      select('ChoicePicker', [choicePicker]);
      expect(await harness.getArrayItemCount('options')).toBe(2);
      expect(await harness.getObjectPropertyNames('options.0')).toEqual(['label', 'value']);

      await harness.editProperty('options.0.label', 'Extra Small');
      expect((await target()).options[0]).toEqual({label: 'Extra Small', value: 's'});

      // Adding an entry duplicates the latest item in the array.
      await harness.addArrayItem('options');
      expect(await harness.getArrayItemCount('options')).toBe(3);
      expect((await target()).options[2]).toEqual({label: 'Large', value: 'l'});

      // Deleting all items and clicking Add Entry creates a fresh item from itemControl.
      await harness.deleteArrayItem('options', 2);
      await harness.deleteArrayItem('options', 1);
      await harness.deleteArrayItem('options', 0);
      expect(await harness.getArrayItemCount('options')).toBe(0);

      await harness.addArrayItem('options');
      expect(await harness.getArrayItemCount('options')).toBe(1);
      expect((await target()).options).toEqual([{label: '', value: ''}]);
    });

    it('renders objects with properties as nested cards and objects without properties as JSON textareas', async () => {
      const catalogWithObjects: Catalog = {
        ...basicCatalog,
        components: {
          ...basicCatalog.components,
          CardWithObjects: {
            type: 'object',
            allOf: [
              {$ref: '#/$defs/ComponentCommon'},
              {
                type: 'object',
                properties: {
                  component: {const: 'CardWithObjects'},
                  accessibility: {
                    type: 'object',
                    properties: {
                      label: {$ref: '#/$defs/DynamicString'},
                      live: {type: 'string', enum: ['off', 'polite', 'assertive']},
                    },
                  },
                  style: {
                    type: 'object',
                    additionalProperties: true,
                  },
                },
                required: ['component', 'style'],
              },
            ],
          },
        },
      };
      catalogManagementMock.activeCatalog.set(catalogWithObjects);
      catalogServiceMock.selectedComponentKey.set('CardWithObjects');
      catalogServiceMock.selectedComponentProperties.set(
        new CatalogSchemaResolver(catalogWithObjects, new ErrorLogger()).resolveComponentProperties(
          'CardWithObjects',
        ),
      );
      catalogServiceMock.selectedComponentPreset.set({
        usage: [{id: 'target', component: 'CardWithObjects', style: {padding: 8}}],
      });
      fixture.detectChanges();

      expect(await harness.getPropertyControlKind('accessibility')).toBe('object');
      expect(await harness.getObjectPropertyNames('accessibility')).toEqual(['label', 'live']);
      expect(await harness.getPropertyControlKind('style')).toBe('json');

      await harness.editProperty('accessibility.label', 'Close dialog');
      await harness.selectPropertyOption('accessibility.live', 2);
      expect((await target()).accessibility).toEqual({label: 'Close dialog', live: 'polite'});

      const updatedStyle = {padding: 16};
      await harness.editJsonProperty('style', JSON.stringify(updatedStyle));
      expect((await target()).style).toEqual(updatedStyle);
      expect(await harness.getPropertyError('style')).toBeNull();

      const draft = await harness.getDraftText();
      await harness.editJsonProperty('style', '{"padding": ');
      expect(await harness.getPropertyError('style')).toContain('Invalid JSON');
      expect(await harness.getJsonPropertyText('style')).toBe('{"padding": ');
      expect(await harness.getDraftText()).toBe(draft);
      expect(await harness.getDraftError()).toBeNull();

      await harness.editJsonProperty('style', '');
      expect(await harness.getPropertyError('style')).toContain('required');
    });

    it('never offers to remove or unset a required property', async () => {
      select('ChoicePicker', [{...choicePicker, variant: 'mutuallyExclusive'}]);
      expect(await harness.canRemoveProperty('options')).toBe(false);
      expect(await harness.canRemoveProperty('value')).toBe(false);
      expect(await harness.getPropertyOptions('variant')).toContain('(not set)');
    });

    it('removes a set optional property through its remove action', async () => {
      select('ChoicePicker', [{...choicePicker, filterable: true}]);
      expect(await harness.canRemoveProperty('filterable')).toBe(true);
      await harness.removeProperty('filterable');
      expect(await target()).not.toHaveProperty('filterable');
      expect(await harness.canRemoveProperty('filterable')).toBe(false);
    });

    it('shows a bound literal property as read-only instead of overwriting the binding', async () => {
      select('ChoicePicker', [
        {
          ...choicePicker,
          label: {path: '/sizeLabel'},
          options: [
            {label: {path: '/optionLabel'}, value: 's'},
            {label: 'Large', value: 'l'},
          ],
        },
      ]);
      expect(await harness.getPropertyNote('label')).toContain('Bound to /sizeLabel');
      expect(await harness.getPropertyControlKind('label')).toBeNull();
      expect(await harness.getPropertyLabelFor('label')).toBeNull();
      expect(await harness.getPropertyNote('options.0.label')).toContain('Bound to /optionLabel');
      expect(await harness.getPropertyLabelFor('options.0.label')).toBeNull();
      expect(await harness.getPropertyLabelFor('options.0.value')).toBe(
        'gallery-property-options.0.value',
      );
      await harness.selectPropertyOption('displayStyle', 1);
      expect((await target()).label).toEqual({path: '/sizeLabel'});
    });

    it('keeps each DateTimeInput boolean on its own single-line row', async () => {
      select('DateTimeInput', [
        {id: 'target', component: 'DateTimeInput', value: '', enableDate: true},
      ]);
      for (const name of ['enableDate', 'enableTime']) {
        expect(await harness.getPropertyControlKind(name)).toBe('checkbox');
        expect(await harness.isPropertyInline(name)).toBe(true);
      }
      expect(await harness.isPropertyRequired('value')).toBe(true);
      await harness.toggleProperty('enableTime');
      expect(await target()).toMatchObject({value: '', enableDate: true, enableTime: true});
    });

    it('edits the draft from the Edit JSON card and resets it while keeping the preview frame mounted', async () => {
      select('ChoicePicker', [choicePicker]);
      await harness.editDraft(
        JSON.stringify({components: [{...choicePicker, displayStyle: 'chips'}]}),
      );
      expect(await harness.hasRenderedFrame()).toBe(true);
      expect(hostCommunicationMock.sendRenderA2UI.mock.lastCall?.[0][1]).toMatchObject({
        updateComponents: {components: [{displayStyle: 'chips'}]},
      });
      expect(await harness.getPropertyOptions('displayStyle')).toContain('chips');
      expect(await harness.hasRenderedFrame()).toBe(true);

      await harness.resetDraft();
      expect(await target()).not.toHaveProperty('displayStyle');
    });

    it('no longer renders collapsible groups or a read-only current JSON block', async () => {
      select('ChoicePicker', [choicePicker]);
      expect(await harness.hasCollapsibleJson()).toBe(false);
    });

    it('prioritizes the target or root component when another component of the same type appears earlier', async () => {
      select('ChoicePicker', [
        {...choicePicker, id: 'helper-picker', label: 'Helper'},
        {...choicePicker, id: 'target', label: 'Primary'},
      ]);

      await harness.editProperty('label', 'Updated Primary');
      const components = JSON.parse(await harness.getDraftText()).components;
      expect(components[0].label).toBe('Helper');
      expect(components[1].label).toBe('Updated Primary');
    });

    it('prunes empty intermediate and root optional objects when nested optional properties are cleared', async () => {
      const nestedCatalog: Catalog = {
        ...basicCatalog,
        components: {
          ...basicCatalog.components,
          NestedOptionalCard: {
            type: 'object',
            allOf: [
              {$ref: '#/$defs/ComponentCommon'},
              {
                type: 'object',
                required: ['component'],
                properties: {
                  component: {const: 'NestedOptionalCard'},
                  outer: {
                    type: 'object',
                    properties: {
                      inner: {
                        type: 'object',
                        properties: {
                          note: {type: 'string'},
                        },
                      },
                      keep: {type: 'string'},
                    },
                  },
                },
              },
            ],
          },
        },
      };
      catalogManagementMock.activeCatalog.set(nestedCatalog);
      catalogServiceMock.selectedComponentKey.set('NestedOptionalCard');
      catalogServiceMock.selectedComponentProperties.set(
        new CatalogSchemaResolver(nestedCatalog, new ErrorLogger()).resolveComponentProperties(
          'NestedOptionalCard',
        ),
      );
      catalogServiceMock.selectedComponentPreset.set({
        usage: [
          {
            id: 'target',
            component: 'NestedOptionalCard',
            outer: {inner: {note: 'hello'}, keep: 'stay'},
          },
        ],
      });
      fixture.detectChanges();

      await harness.editProperty('outer.inner.note', '');
      expect(await target()).toEqual({
        id: 'target',
        component: 'NestedOptionalCard',
        outer: {keep: 'stay'},
      });

      await harness.editProperty('outer.keep', '');
      expect(await target()).toEqual({
        id: 'target',
        component: 'NestedOptionalCard',
      });
    });

    it('sets a status message and retains the previous number in the preview when clearing a required number property', async () => {
      const numberCatalog: Catalog = {
        ...basicCatalog,
        components: {
          ...basicCatalog.components,
          SliderInput: {
            type: 'object',
            allOf: [
              {$ref: '#/$defs/ComponentCommon'},
              {
                type: 'object',
                required: ['component', 'value'],
                properties: {
                  component: {const: 'SliderInput'},
                  value: {type: 'number'},
                },
              },
            ],
          },
        },
      };
      catalogManagementMock.activeCatalog.set(numberCatalog);
      catalogServiceMock.selectedComponentKey.set('SliderInput');
      catalogServiceMock.selectedComponentProperties.set(
        new CatalogSchemaResolver(numberCatalog, new ErrorLogger()).resolveComponentProperties(
          'SliderInput',
        ),
      );
      catalogServiceMock.selectedComponentPreset.set({
        usage: [{id: 'target', component: 'SliderInput', value: 42}],
      });
      fixture.detectChanges();

      await harness.editProperty('value', '');

      expect(await harness.getStatusMessages()).toContain(
        'Enter a number for value. Preview keeps its previous value.',
      );
      expect((await target()).value).toBe(42);
      expect(hostCommunicationMock.sendRenderA2UI.mock.lastCall?.[0][1]).toMatchObject({
        updateComponents: {components: [{id: 'root', component: 'SliderInput', value: 42}]},
      });
    });

    it('clears an optional JSON property and surfaces schema errors when JSON has the wrong schema type', async () => {
      const jsonCatalog: Catalog = {
        ...basicCatalog,
        components: {
          ...basicCatalog.components,
          StyledBox: {
            type: 'object',
            allOf: [
              {$ref: '#/$defs/ComponentCommon'},
              {
                type: 'object',
                required: ['component'],
                properties: {
                  component: {const: 'StyledBox'},
                  style: {
                    type: 'object',
                    additionalProperties: true,
                  },
                },
              },
            ],
          },
        },
      };
      catalogManagementMock.activeCatalog.set(jsonCatalog);
      catalogServiceMock.selectedComponentKey.set('StyledBox');
      catalogServiceMock.selectedComponentProperties.set(
        new CatalogSchemaResolver(jsonCatalog, new ErrorLogger()).resolveComponentProperties(
          'StyledBox',
        ),
      );
      catalogServiceMock.selectedComponentPreset.set({
        usage: [{id: 'target', component: 'StyledBox', style: {padding: 8}}],
      });
      fixture.detectChanges();

      const initialDraft = await harness.getDraftText();
      await harness.editJsonProperty('style', '123');
      expect(await harness.getPropertyError('style')).toBe(
        '"style" on "target" does not match its catalog property type or choices. The example keeps its previous value.',
      );
      expect(await harness.getJsonPropertyText('style')).toBe('123');
      expect(await harness.getDraftText()).toBe(initialDraft);
      expect(await harness.getDraftError()).toBeNull();

      await harness.editJsonProperty('style', '   ');
      expect(await harness.getPropertyError('style')).toBeNull();
      expect(await target()).not.toHaveProperty('style');
    });

    it('renders read-only binding notes for bound sub-properties inside an object or array item', async () => {
      select('ChoicePicker', [
        {
          ...choicePicker,
          options: [
            {label: {path: '/itemLabel'}, value: 's'},
            {label: 'Large', value: 'l'},
          ],
          value: [{path: '/selectedValue'}],
        },
      ]);

      expect(await harness.getPropertyNote('options.0.label')).toBe(
        'Bound to /itemLabel — edit in the JSON editor.',
      );
      expect(await harness.getPropertyControlKind('options.0.label')).toBeNull();
      expect(await harness.getPropertyLabelFor('options.0.label')).toBeNull();
      expect(await harness.getPropertyControlKind('options.0.value')).toBe('text');
      expect(await harness.getPropertyLabelFor('options.0.value')).toBe(
        'gallery-property-options.0.value',
      );

      expect(await harness.getPropertyNote('value.0')).toBe(
        'Bound to /selectedValue — edit in the JSON editor.',
      );
      expect(await harness.getPropertyControlKind('value.0')).toBeNull();
    });
  });
});
