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

import '@angular/compiler';

// @vitest-environment jsdom
import {describe, it, expect, afterEach, beforeEach, vi, Mock} from 'vitest';
import {A2uiSandboxConnection} from './angular-bridge';
import {a2uiBridge} from '../preview-bridge';
import {Catalog, ComponentApi} from '@a2ui/web_core/v0_9';

declare global {
  var mockInject: Mock<(token: unknown) => unknown> | undefined;
}

// Mock @angular/core inject dynamically using globalThis delegation
vi.mock('@angular/core', async importOriginal => {
  const original = await importOriginal<typeof import('@angular/core')>();
  return {
    ...original,
    inject: <T>(token: Parameters<typeof original.inject>[0]): T => {
      if (globalThis.mockInject) {
        return globalThis.mockInject(token) as T;
      }
      return original.inject(token) as T;
    },
  };
});

describe('Angular Sandbox Connection Spec', () => {
  beforeEach(() => {
    globalThis.mockInject = vi.fn();
  });

  afterEach(() => {
    globalThis.mockInject = undefined;
    a2uiBridge.destroy();
    vi.restoreAllMocks();
  });

  it('aligns catalogs inside A2UI_RENDERER_CONFIG with the resolved catalogId when onCatalogResolved is triggered', () => {
    const myCatalog = {
      id: 'https://default-catalog-id.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const mockRendererService = {
      surfaceGroup: {
        onSurfaceCreated: {
          subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()}),
        },
      },
      processMessages: vi.fn(),
    };

    const mockRendererConfig = {
      catalogs: [myCatalog],
    };

    const mockInject = globalThis.mockInject;
    if (!mockInject) {
      throw new Error('mockInject is not defined');
    }
    mockInject.mockImplementation((token: unknown) => {
      if (token && typeof token === 'function' && token.name === 'A2uiRendererService') {
        return mockRendererService;
      }
      return mockRendererConfig;
    });

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    const connection = new A2uiSandboxConnection();

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.calls[0][1];
    expect(configPassed.onCatalogResolved).toBeDefined();

    // Trigger the callback
    configPassed.onCatalogResolved!('urn:a2ui:catalog:angular_resolved_id');

    expect(myCatalog.id).toBe('urn:a2ui:catalog:angular_resolved_id');

    connection.ngOnDestroy();
  });
});
