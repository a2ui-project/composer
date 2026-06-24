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
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {Gallery} from './gallery';
import {GalleryHarness} from './test/gallery.harness';
import {GalleryCatalog, CategorizedComponents} from './services/gallery-catalog';
import {CatalogManagement} from '../storage/catalog-management/catalog-management';
import {ParsedProperty} from './schema/catalog-schema-resolver';
import {Catalog} from '../storage/models/catalog-storage.model';
import {HostCommunication} from '../shell/host-communication/host-communication';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {ChatState} from '../chat/chat-state/chat-state';

interface TestFriendlyGallery {
  catalogId: () => string | null;
  selectedComponentDescription: () => string;
  copyToClipboard: () => void;
}

class MockGalleryCatalogService {
  readonly componentsList = signal<CategorizedComponents[]>([]);
  readonly selectedComponentKey = signal<string | null>(null);
  readonly selectedComponentProperties = signal<ParsedProperty[]>([]);
  readonly selectedComponentUsage = signal<string>('');

  selectComponent = vi.fn((key: string | null) => {
    this.selectedComponentKey.set(key);
  });
}

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
  readonly catalogError = signal<string | null>(null);
}

class MockHostCommunication {
  sendRenderA2UI = vi.fn();
  registerIframeElement = vi.fn();
  registerIframe = vi.fn();
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
  let writeTextSpy: ReturnType<typeof vi.fn>;
  let originalClipboard: typeof navigator.clipboard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gallery],
      providers: [
        provideNoopAnimations(),
        {provide: GalleryCatalog, useClass: MockGalleryCatalogService},
        {provide: CatalogManagement, useClass: MockCatalogManagement},
        {provide: HostCommunication, useClass: MockHostCommunication},
        {provide: StartupResolution, useClass: MockStartupResolution},
        {provide: ChatState, useClass: MockChatState},
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

    writeTextSpy = vi.fn();
    originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: {writeText: writeTextSpy},
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', {value: originalClipboard});
    }
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

  it('renders the usage JSON envelope and copies the formatted A2UI JSONLines payload to the clipboard', async () => {
    writeTextSpy.mockResolvedValue(undefined);

    const mockCatalog: Catalog = {
      catalogId: 'https://a2ui.org/custom_catalog.json',
      components: {},
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);

    catalogServiceMock.selectedComponentKey.set('Text');
    const mockComponents = [{id: 'target', component: 'Text'}];
    const mockUsage = JSON.stringify(mockComponents, null, 2);
    catalogServiceMock.selectedComponentUsage.set(mockUsage);
    fixture.detectChanges();

    const usageText = await harness.getUsageCodeText();
    expect(usageText).toBe(mockUsage);

    await harness.clickCopyButton();

    const expectedPayload =
      `{"version":"v0.9","createSurface":{"surfaceId":"gallery-preview","catalogId":"https://a2ui.org/custom_catalog.json"}}\n` +
      `{"version":"v0.9","updateComponents":{"surfaceId":"gallery-preview","components":[{"id":"root","component":"Text"}]}}`;

    expect(writeTextSpy).toHaveBeenCalledWith(expectedPayload);
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

  it('logs an error to the console when copying to the clipboard fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    writeTextSpy.mockRejectedValue(new Error('Clipboard error'));

    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentUsage.set('[]');
    fixture.detectChanges();

    await harness.clickCopyButton();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to copy A2UI component usage to clipboard: ',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('logs an error and returns gracefully when clipboard API is completely unavailable', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentUsage.set('[]');
    fixture.detectChanges();

    await harness.clickCopyButton();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Clipboard API is not available in this environment.',
    );
    expect(writeTextSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('logs an error to the console when copying malformed JSON usage to the clipboard', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentUsage.set('{invalid-json}');
    fixture.detectChanges();

    await harness.clickCopyButton();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to parse or format A2UI usage payload: ',
      expect.any(SyntaxError),
    );
    expect(writeTextSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('logs an error to the console when copying a non-array JSON usage to the clipboard', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    catalogServiceMock.selectedComponentKey.set('Text');
    catalogServiceMock.selectedComponentUsage.set('{"not": "an array"}');
    fixture.detectChanges();

    await harness.clickCopyButton();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to parse or format A2UI usage payload: ',
      expect.any(Error),
    );
    expect(writeTextSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
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

    expect(writeTextSpy).not.toHaveBeenCalled();
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
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.flushEffects();

    // Since 'Column' is in the default mock catalog, it should wrap it
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
            {
              id: 'root',
              component: 'Column',
              align: 'center',
              justify: 'center',
              children: ['target'],
            },
            {id: 'target', component: 'Text'},
          ],
        },
      },
    ]);
  });

  it('does not wrap in Column layout if Column is not defined in the catalog', async () => {
    catalogManagementMock.activeCatalog.set({
      catalogId: 'https://a2ui.org/custom_catalog.json',
      components: {
        Text: {type: 'object'},
      }, // No Column component
    });
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.flushEffects();

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

  it('logs an error when rendering effect fails to parse component usage JSON', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    catalogServiceMock.selectedComponentUsage.set('{invalid}');
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to parse component usage JSON:',
      expect.any(SyntaxError),
    );
    consoleErrorSpy.mockRestore();
  });

  it('does not dispatch rendering payload if usage is not an array', async () => {
    catalogServiceMock.selectedComponentUsage.set('{"not": "an array"}');
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(hostCommunicationMock.sendRenderA2UI).not.toHaveBeenCalled();
  });

  it('wraps the component in Column layout using the exact casing defined in the catalog (e.g. coLuMn)', async () => {
    catalogManagementMock.activeCatalog.set({
      catalogId: 'https://a2ui.org/custom_catalog.json',
      components: {
        Text: {type: 'object'},
        coLuMn: {type: 'object'}, // Case variation
      },
    });
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.flushEffects();

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
          components: [
            {
              id: 'root',
              component: 'coLuMn',
              align: 'center',
              justify: 'center',
              children: ['target'],
            },
            {id: 'target', component: 'Text'},
          ],
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
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.flushEffects();

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
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.flushEffects();

    // Should safely proceed without throwing errors and render unwrapped
    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalled();
  });

  it('does not copy to clipboard if active catalog has no valid ID', () => {
    catalogManagementMock.activeCatalog.set(null);
    catalogServiceMock.selectedComponentUsage.set('[]');
    fixture.detectChanges();
    (fixture.componentInstance as unknown as TestFriendlyGallery).copyToClipboard();
    expect(writeTextSpy).not.toHaveBeenCalled();
  });

  it('does not dispatch render command if active catalog is null', () => {
    hostCommunicationMock.sendRenderA2UI.mockClear();
    catalogManagementMock.activeCatalog.set(null);
    catalogServiceMock.selectedComponentUsage.set('[{"id":"target","component":"Text"}]');
    fixture.detectChanges();
    TestBed.flushEffects();

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
        components: [
          {
            id: 'root',
            component: 'Column',
            align: 'center',
            justify: 'center',
            children: ['target'],
          },
          ...usageText,
        ],
      },
    };
    const expectedTextPayload = [expectedTextLine1, expectedTextLine2];

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith(expectedTextPayload);

    hostCommunicationMock.sendRenderA2UI.mockClear();

    catalogServiceMock.selectedComponentKey.set('Button');
    catalogServiceMock.selectedComponentUsage.set(JSON.stringify(usageButton));
    fixture.detectChanges();

    const expectedButtonLine2 = {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'gallery-preview',
        components: [
          {
            id: 'root',
            component: 'Column',
            align: 'center',
            justify: 'center',
            children: ['target'],
          },
          ...usageButton,
        ],
      },
    };
    const expectedButtonPayload = [expectedTextLine1, expectedButtonLine2];

    expect(hostCommunicationMock.sendRenderA2UI).toHaveBeenCalledWith(expectedButtonPayload);
  });
});
