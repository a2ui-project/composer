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
import {describe, it, expect, afterEach, vi} from 'vitest';
import {bootstrapLitSandbox, A2uiSandboxRoot, ContextRequestEventPayload} from './lit-bridge';
import {a2uiBridge} from '../preview-bridge';
import {Catalog, ComponentApi} from '@a2ui/web_core/v0_9';

describe('Lit Framework Adapter Spec', () => {
  const dummyCatalog = {
    id: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
    components: new Map<string, ComponentApi>(),
  } as unknown as Catalog<ComponentApi>;

  afterEach(() => {
    // Clear global state to not pollute other tests
    A2uiSandboxRoot.catalogs = [];
    A2uiSandboxRoot.catalogJson = undefined;
    A2uiSandboxRoot.markdownRenderer = undefined;
    a2uiBridge.destroy();
    vi.restoreAllMocks();
  });

  it('defines custom element using customTagName from options block', () => {
    const tagName = 'app-root';
    bootstrapLitSandbox([dummyCatalog], {elementTagName: tagName});

    expect(customElements.get(tagName)).toBe(A2uiSandboxRoot);
  });

  it('passes through preloaded catalogJson down to active renderer connection synchronously', () => {
    const preload = {catalogId: 'preload-id', version: 'v0.9', components: {}};
    bootstrapLitSandbox([dummyCatalog], {
      elementTagName: 'app-root',
      catalogJson: preload,
    });

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    const element = new A2uiSandboxRoot();
    document.body.appendChild(element);

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.calls[0][1];
    expect(configPassed.catalogJson).toBe(preload);

    element.remove();
  });

  it('aligns elements in the static catalogs array with the resolved catalogId when onCatalogResolved is triggered', () => {
    const myCatalog = {
      id: 'https://default-catalog-id.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;
    bootstrapLitSandbox([myCatalog], {elementTagName: 'app-root'});

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    const element = new A2uiSandboxRoot();
    document.body.appendChild(element);

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.calls[0][1];
    expect(configPassed.onCatalogResolved).toBeDefined();

    // Trigger the callback
    configPassed.onCatalogResolved!('urn:a2ui:catalog:resolved_dynamic_id');

    expect(myCatalog.id).toBe('urn:a2ui:catalog:resolved_dynamic_id');
    expect(A2uiSandboxRoot.catalogs[0].id).toBe('urn:a2ui:catalog:resolved_dynamic_id');

    element.remove();
  });

  it('handles context-request events for A2UIMarkdown and cleanly removes the listener on disconnect', () => {
    bootstrapLitSandbox([dummyCatalog], {
      elementTagName: 'app-root',
      markdownRenderer: async (text: string) => `<h1>${text}</h1>`,
    });

    const element = new A2uiSandboxRoot();
    document.body.appendChild(element);

    let resolvedRenderer: unknown = null;
    const contextEvent = new CustomEvent('context-request', {
      bubbles: true,
      composed: true,
    }) as unknown as ContextRequestEventPayload;
    contextEvent.context = 'A2UIMarkdown';
    contextEvent.callback = renderer => {
      resolvedRenderer = renderer;
    };

    element.dispatchEvent(contextEvent);
    expect(resolvedRenderer).toBeDefined();

    // Verify cleanup on disconnect
    element.remove();
    let afterRemoveRenderer: unknown = null;
    const postRemoveEvent = new CustomEvent('context-request', {
      bubbles: true,
      composed: true,
    }) as unknown as ContextRequestEventPayload;
    postRemoveEvent.context = 'A2UIMarkdown';
    postRemoveEvent.callback = renderer => {
      afterRemoveRenderer = renderer;
    };

    element.dispatchEvent(postRemoveEvent);
    expect(afterRemoveRenderer).toBeNull();
  });

  it('resolves context requests carrying an arbitrary object with a custom toString() method correctly', () => {
    bootstrapLitSandbox([dummyCatalog], {
      elementTagName: 'app-root-tostring',
      markdownRenderer: async (text: string) => `<i>${text}</i>`,
    });

    const ctor = customElements.get('app-root-tostring');
    const element = new ctor!();
    document.body.appendChild(element);

    let resolvedRenderer: unknown = null;
    const contextEvent = new CustomEvent('context-request', {
      bubbles: true,
      composed: true,
    }) as unknown as ContextRequestEventPayload;

    contextEvent.context = {
      toString: () => 'CustomA2UIMarkdownContext',
    };
    contextEvent.callback = renderer => {
      resolvedRenderer = renderer;
    };

    element.dispatchEvent(contextEvent);
    expect(resolvedRenderer).toBeDefined();

    element.remove();
  });

  it('handles context requests carrying Object.create(null) defensively without throwing a TypeError', () => {
    bootstrapLitSandbox([dummyCatalog], {
      elementTagName: 'app-root-nullproto',
      markdownRenderer: async (text: string) => `<i>${text}</i>`,
    });

    const ctor = customElements.get('app-root-nullproto');
    const element = new ctor!();
    document.body.appendChild(element);

    const contextEvent = new CustomEvent('context-request', {
      bubbles: true,
      composed: true,
    }) as unknown as ContextRequestEventPayload;

    contextEvent.context = Object.create(null);
    contextEvent.callback = () => {};

    expect(() => {
      element.dispatchEvent(contextEvent);
    }).not.toThrow();

    element.remove();
  });

  it('dispatches outbound component actions to a2uiBridge.sendAction', async () => {
    const sendActionSpy = vi.spyOn(a2uiBridge, 'sendAction');
    bootstrapLitSandbox([dummyCatalog], {elementTagName: 'app-root'});

    const element = new A2uiSandboxRoot();
    document.body.appendChild(element);

    const processor = element['processor'] as any;

    processor.processMessages([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'surf-action',
          catalogId: dummyCatalog.id,
        },
      },
    ]);

    const surface = processor.model.getSurface('surf-action');
    surface['_onAction'].emit({action: {click: true}});

    expect(sendActionSpy).toHaveBeenCalled();

    element.remove();
  });

  it('renders active a2ui-surface element onSurfaceReady and reverts to waiting banner onSurfaceCleared', () => {
    bootstrapLitSandbox([dummyCatalog], {elementTagName: 'app-root'});
    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    const element = new A2uiSandboxRoot();
    document.body.appendChild(element);

    const config = attachSpy.mock.lastCall![1];

    // Initial render is waiting banner
    let rendered = element.render() as any;
    expect(rendered.strings.join('')).toContain('A2UI Lit Sandbox active');

    // Trigger onSurfaceReady via real message processing
    const processor = element['processor'] as any;
    processor.processMessages([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'surf-lit',
          catalogId: dummyCatalog.id,
        },
      },
    ]);

    const mockSurface = processor.model.getSurface('surf-lit');
    config.onSurfaceReady('surf-lit');

    expect(element['surface']).toBe(mockSurface);

    rendered = element.render() as any;
    expect(rendered.strings.join('')).toContain('a2ui-surface');

    // Trigger onSurfaceCleared
    if (config.onSurfaceCleared) {
      config.onSurfaceCleared();
    }
    expect(element['surface']).toBeUndefined();

    rendered = element.render() as any;
    expect(rendered.strings.join('')).toContain('A2UI Lit Sandbox active');

    element.remove();
  });

  it('defines an anonymous subclass if A2uiSandboxRoot constructor is already registered to another tag', () => {
    bootstrapLitSandbox([dummyCatalog], {elementTagName: 'app-root'});
    const tag2 = 'app-root-second';

    bootstrapLitSandbox([dummyCatalog], {elementTagName: tag2});

    const ctor = customElements.get(tag2);
    expect(ctor).toBeDefined();
    expect(ctor).not.toBe(A2uiSandboxRoot);
    expect(new ctor!()).toBeInstanceOf(A2uiSandboxRoot);
  });

  it('resolves static subclass overrides (catalogs, catalogJson) properly upon initialization', () => {
    const customCatalog = {
      id: 'https://custom.json',
      components: new Map(),
    } as unknown as Catalog<ComponentApi>;
    const customPreload = {custom: true};

    class CustomSandboxRoot extends A2uiSandboxRoot {
      static catalogs = [customCatalog];
      static catalogJson = customPreload;
    }

    customElements.define('custom-sandbox-root', CustomSandboxRoot);

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    const element = new CustomSandboxRoot();
    document.body.appendChild(element);

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.lastCall![1];

    expect(configPassed.catalogJson).toBe(customPreload);

    configPassed.onCatalogResolved!('urn:a2ui:catalog:subclass_id');
    expect(customCatalog.id).toBe('urn:a2ui:catalog:subclass_id');

    element.remove();
  });

  it('isolates assigned static properties (catalogs, catalogJson) per registered target class without cross-contamination', () => {
    const cat1 = {id: 'cat-1'} as unknown as Catalog<ComponentApi>;
    const cat2 = {id: 'cat-2'} as unknown as Catalog<ComponentApi>;

    const ctor1 = bootstrapLitSandbox([cat1], {
      elementTagName: 'box-one',
      catalogJson: {box: 1},
    });

    const ctor2 = bootstrapLitSandbox([cat2], {
      elementTagName: 'box-two',
      catalogJson: {box: 2},
    });

    expect(ctor1).not.toBe(ctor2);
    expect(ctor1.catalogs).toEqual([cat1]);
    expect(ctor1.catalogJson).toEqual({box: 1});

    expect(ctor2.catalogs).toEqual([cat2]);
    expect(ctor2.catalogJson).toEqual({box: 2});
  });

  it('persists programmatic assignment of markdownRenderer across DOM disconnection and reconnection', () => {
    bootstrapLitSandbox([dummyCatalog], {
      elementTagName: 'app-root-persist',
    });

    const ctor = customElements.get('app-root-persist');
    const element = new ctor!();
    document.body.appendChild(element);

    const customRenderer = async (text: string) => `<b>${text}</b>`;
    element.markdownRenderer = customRenderer;

    expect(element.markdownRenderer).toBe(customRenderer);

    element.remove();
    document.body.appendChild(element);

    expect(element.markdownRenderer).toBe(customRenderer);

    element.remove();
  });

  it('upgrades pre-rendered DOM element synchronously and successfully resolves static configuration properties', () => {
    const preElement = document.createElement('app-root-sync');
    document.body.appendChild(preElement);

    const catSync = {id: 'cat-sync'} as unknown as Catalog<ComponentApi>;
    bootstrapLitSandbox([catSync], {
      elementTagName: 'app-root-sync',
      catalogJson: {sync: true},
    });

    const upgraded = document.querySelector('app-root-sync') as A2uiSandboxRoot;
    expect(upgraded).toBeInstanceOf(A2uiSandboxRoot);

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');
    upgraded.connectedCallback();

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.lastCall![1];
    expect(configPassed.catalogJson).toEqual({sync: true});

    preElement.remove();
  });
});
