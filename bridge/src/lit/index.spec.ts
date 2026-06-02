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
import {bootstrapLitSandbox, A2uiSandboxRoot} from './index';
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
    a2uiBridge.destroy();
  });

  it('defines custom element using customTagName from options block', () => {
    const tagName = 'lit-test-element';
    bootstrapLitSandbox([dummyCatalog], {elementTagName: tagName});

    expect(customElements.get(tagName)).toBe(A2uiSandboxRoot);
  });

  it('passes through preloaded catalogJson down to active renderer connection', async () => {
    const preload = {catalogId: 'preload-id', version: 'v0.9', components: {}};
    // Reuse the same tag name 'lit-test-element' to prevent registration constructor clash in JSDOM:
    bootstrapLitSandbox([dummyCatalog], {
      elementTagName: 'lit-test-element',
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
    bootstrapLitSandbox([myCatalog], {elementTagName: 'lit-test-element'});

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
});
