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
import {useA2uiSandbox} from './react-bridge';
import {a2uiBridge} from '../preview-bridge';
import {Catalog, ComponentApi} from '@a2ui/web_core/v0_9';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react';

describe('React Hook Adapter Spec', () => {
  afterEach(() => {
    a2uiBridge.destroy();
  });

  it('aligns active catalogs array with the resolved catalogId when onCatalogResolved is triggered', async () => {
    const myCatalog = {
      id: 'https://default-catalog-id.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    let onCatalogResolvedCb: ((catalogId: string) => void) | undefined;

    function TestComponent() {
      useA2uiSandbox([myCatalog]);
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.calls[0][1];
    expect(configPassed.onCatalogResolved).toBeDefined();

    onCatalogResolvedCb = configPassed.onCatalogResolved;

    // Trigger the callback
    await act(async () => {
      onCatalogResolvedCb!('urn:a2ui:catalog:react_resolved_id');
    });

    expect(myCatalog.id).toBe('urn:a2ui:catalog:react_resolved_id');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
