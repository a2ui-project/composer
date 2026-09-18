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

import {By} from '@angular/platform-browser';
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
import {ParsedProperty} from './schema/catalog-schema-resolver';
import {Catalog} from '../storage/models/catalog-storage.model';
import {HostCommunication} from '../shell/host-communication/host-communication';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {
  AppConfigProvider,
  ThemePreference,
} from '../settings/app-config-provider/app-config-provider';
import {ChatState} from '../chat/chat-state/chat-state';
import {UsageTrackingService} from '../usage-tracking/usage-tracking.service';
import {NoopUsageTrackingService} from '../usage-tracking/noop-usage-tracking.service';

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

    const usageText = await harness.getUsageCodeText();
    expect(usageText).toBe(mockUsage);

    try {
      await harness.clickCopyButton();
    } catch (e) {}

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

    const usage = await harness.getUsageCodeText();
    expect(usage).toBeNull();

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
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockClipboard.copy.mockReturnValue(false);

    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({usage: []});
    catalogServiceMock.selectedComponentUsage.set('[]');
    fixture.detectChanges();

    try {
      await harness.clickCopyButton();
    } catch (e) {}

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to copy A2UI component usage to clipboard.',
    );

    consoleErrorSpy.mockRestore();
  });

  it('reports clipboard exceptions without losing the valid preview', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({usage: [{id: 'target', component: 'Text'}]});
    fixture.detectChanges();
    mockClipboard.copy.mockImplementation(() => {
      throw new Error('Clipboard unavailable');
    });
    await harness.clickCopyButton();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to parse or format A2UI usage payload: ',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it('returns gracefully when selectedComponentPreset is null or missing usage array', async () => {
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set(null);
    fixture.detectChanges();

    try {
      await harness.clickCopyButton();
    } catch (e) {}

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

    try {
      await harness.clickCopyButton();
    } catch (e) {}

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
    expect(titles).toEqual(['Preview', 'Usage', 'Properties']);
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
    try {
      await harness.clickCopyButton();
    } catch (e) {}
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
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    hostCommunicationMock.sendRenderA2UI.mockClear();
    hostCommunicationMock.sendRenderA2UI.mockImplementationOnce(() => {
      throw new Error('Transport failure');
    });
    hostCommunicationMock.messageStream$.next({type: PreviewBridgeMessageType.RENDERER_READY});
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to dispatch component example:',
      expect.any(Error),
    );
    hostCommunicationMock.messageStream$.next({type: PreviewBridgeMessageType.RENDERER_READY});
    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledTimes(2);
    consoleErrorSpy.mockRestore();
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

    try {
      await harness.clickCopyButton();
    } catch (e) {}

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
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cyclic: Record<string, unknown> = {id: 'target', component: 'Text'};
    cyclic['self'] = cyclic;
    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentPreset.set({usage: [cyclic]});
    fixture.detectChanges();
    expect(await harness.getDraftError()).toContain('Could not load');
    await harness.clickCopyButton();
    expect(mockClipboard.copy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  describe('Usage Tracking Instrumentation', () => {
    it('tracks gallery view on init', () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const trackSpy = vi.spyOn(trackingService, 'trackGalleryView');

      fixture.componentInstance.ngOnInit();

      expect(trackSpy).toHaveBeenCalledWith();
    });

    it('tracks component select when item is chosen', () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const trackSpy = vi.spyOn(trackingService, 'trackGalleryComponentSelect');

      catalogServiceMock.componentsList.set([{category: 'Content', components: ['Text']}]);

      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('.component-nav-item')).nativeElement;
      button.click();
      fixture.detectChanges();

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

      try {
        await harness.clickCopyButton();
      } catch (e) {}
      await Promise.resolve();

      expect(trackSpy).toHaveBeenCalledWith({
        componentKey: 'Text',
      });
    });

    it('does not track copying usage snippet to clipboard on failure', async () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const trackSpy = vi.spyOn(trackingService, 'trackGalleryCopyUsage');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      catalogServiceMock.selectedComponentPreset.set({
        usage: [{id: 'target', component: 'Text'}],
      });
      catalogServiceMock.selectedComponentKey.set('Text');
      mockClipboard.copy.mockReturnValueOnce(false);

      try {
        await harness.clickCopyButton();
      } catch (e) {}
      await Promise.resolve();

      expect(trackSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy A2UI component usage to clipboard.',
      );

      consoleErrorSpy.mockRestore();
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
  it.each([
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
    await harness.selectPropertyOption('emphasis', 1);
    expect(JSON.parse(await harness.getDraftText()).components[0]).toMatchObject({
      count: 12,
      enabled: false,
      emphasis: 'strong',
    });
    expect(await harness.getDraftError()).toBeNull();
  });
});
