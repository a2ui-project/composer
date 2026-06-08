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
      markdownRenderer: ((text: string) => `<h1>${text}</h1>`) as unknown as (
        text: string,
      ) => unknown,
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
});
