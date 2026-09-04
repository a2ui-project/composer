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
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {useA2uiSandbox} from './react-bridge';
import {a2uiBridge} from '../preview-bridge';
import {ThemePreference} from '../bridge-message';
import {Catalog, ComponentApi} from '@a2ui/web_core/v0_9';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react';

describe('React Hook Adapter Spec', () => {
  beforeEach(() => {
    (globalThis as unknown as {IS_REACT_ACT_ENVIRONMENT: boolean}).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    a2uiBridge.destroy();
    vi.restoreAllMocks();
  });

  it('aligns active catalogs array with the resolved catalogId when onCatalogResolved is triggered', async () => {
    const myCatalog = {
      id: 'https://default-catalog-id.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

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

    const onCatalogResolvedCb = configPassed.onCatalogResolved;

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

  it('updates hook state with active surface onSurfaceReady and resets onSurfaceCleared', async () => {
    const dummyCatalog = {
      id: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    let renderedSurface: {id?: string} | undefined = undefined;

    function TestComponent() {
      const {surface} = useA2uiSandbox([dummyCatalog]);
      renderedSurface = surface;
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    expect(attachSpy).toHaveBeenCalled();
    interface MockProcessor {
      processMessages(messages: unknown[]): void;
    }
    const processor = attachSpy.mock.lastCall![0] as unknown as MockProcessor;
    const config = attachSpy.mock.lastCall![1];

    expect(renderedSurface).toBeUndefined();

    processor.processMessages([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'surf-react',
          catalogId: dummyCatalog.id,
        },
      },
    ]);

    await act(async () => {
      config.onSurfaceReady('surf-react');
    });

    expect(renderedSurface).toBeDefined();
    expect(renderedSurface!.id).toBe('surf-react');

    await act(async () => {
      if (config.onSurfaceCleared) {
        config.onSurfaceCleared();
      }
    });

    expect(renderedSurface).toBeUndefined();

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('dispatches outbound actions triggered within MessageProcessor out to a2uiBridge.sendAction', async () => {
    const dummyCatalog = {
      id: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const sendActionSpy = vi.spyOn(a2uiBridge, 'sendAction');
    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    function TestComponent() {
      useA2uiSandbox([dummyCatalog]);
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    expect(attachSpy).toHaveBeenCalled();
    interface MockSurface {
      _onAction: {emit(val: unknown): void};
    }
    interface FullMockProcessor {
      processMessages(messages: unknown[]): void;
      model: {getSurface(id: string): MockSurface};
    }
    const processor = attachSpy.mock.lastCall![0] as unknown as FullMockProcessor;

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

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('passes onThemeChange option through sandbox configuration to attachRenderer', async () => {
    const dummyCatalog = {
      id: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const onThemeChange = vi.fn();
    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    function TestComponent() {
      useA2uiSandbox([dummyCatalog], {onThemeChange});
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.lastCall![1];
    // The hook installs a wrapper that delegates through a ref rather than handing the bridge the
    // host's own function reference, so identity is not what matters here: reaching the host is.
    expect(configPassed.onThemeChange).toBeTypeOf('function');
    configPassed.onThemeChange!(ThemePreference.DARK);
    expect(onThemeChange).toHaveBeenCalledWith(ThemePreference.DARK);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('passes getDemos option through sandbox configuration to attachRenderer', async () => {
    const dummyCatalog = {
      id: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const getDemos = vi.fn(async () => []);
    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    function TestComponent() {
      useA2uiSandbox([dummyCatalog], {getDemos});
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.lastCall![1];
    // As with onThemeChange: a delegating wrapper, not the host's own reference.
    expect(configPassed.getDemos).toBeTypeOf('function');
    await configPassed.getDemos!();
    expect(getDemos).toHaveBeenCalled();

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('invokes the latest getDemos closure after a re-render, not the one captured at mount', async () => {
    const dummyCatalog = {
      id: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    // The hook's attach effect runs once, so `getDemos` reaches the bridge exactly once. Each
    // render passes a brand new closure over `served`, which is what a real host does when the
    // demos it serves come from component state.
    function TestComponent({served}: {served: string | null}) {
      useA2uiSandbox(
        [dummyCatalog],
        served === null
          ? {}
          : {getDemos: async () => [{id: served, name: served, description: '', a2ui: []}]},
      );
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(TestComponent, {served: 'first'}));
    });

    expect(attachSpy).toHaveBeenCalledTimes(1);
    const configPassed = attachSpy.mock.lastCall![1];
    expect(await configPassed.getDemos!()).toEqual([
      {id: 'first', name: 'first', description: '', a2ui: []},
    ]);

    await act(async () => {
      root.render(React.createElement(TestComponent, {served: 'second'}));
    });

    // Still one attach: the renderer was not torn down and re-handshaken by the re-render.
    expect(attachSpy).toHaveBeenCalledTimes(1);
    expect(await configPassed.getDemos!()).toEqual([
      {id: 'second', name: 'second', description: '', a2ui: []},
    ]);

    // The property cannot be removed from a config the bridge already holds, so a host that
    // stops supplying `getDemos` gets the empty answer the bridge gives for a renderer that
    // never implemented it, rather than a throw on an absent callback.
    await act(async () => {
      root.render(React.createElement(TestComponent, {served: null}));
    });
    expect(await configPassed.getDemos!()).toEqual([]);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('invokes the latest getComponentUsages closure after a re-render', async () => {
    const dummyCatalog = {
      id: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    function TestComponent({label}: {label: string}) {
      useA2uiSandbox([dummyCatalog], {
        getComponentUsages: async () => ({Card: {usage: [{componentName: label}]}}),
      });
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(TestComponent, {label: 'first'}));
    });

    const configPassed = attachSpy.mock.lastCall![1];
    expect(await configPassed.getComponentUsages!()).toEqual({
      Card: {usage: [{componentName: 'first'}]},
    });

    await act(async () => {
      root.render(React.createElement(TestComponent, {label: 'second'}));
    });

    expect(attachSpy).toHaveBeenCalledTimes(1);
    expect(await configPassed.getComponentUsages!()).toEqual({
      Card: {usage: [{componentName: 'second'}]},
    });

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('reads the latest catalogs array in onCatalogResolved after a re-render', async () => {
    const mountCatalog = {
      id: 'https://mount-catalog.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;
    const laterCatalog = {
      id: 'https://later-catalog.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    function TestComponent({catalog}: {catalog: Catalog<ComponentApi>}) {
      useA2uiSandbox([catalog]);
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(TestComponent, {catalog: mountCatalog}));
    });

    const configPassed = attachSpy.mock.lastCall![1];

    await act(async () => {
      root.render(React.createElement(TestComponent, {catalog: laterCatalog}));
    });

    await act(async () => {
      configPassed.onCatalogResolved!('urn:a2ui:catalog:resolved_after_rerender');
    });

    expect(laterCatalog.id).toBe('urn:a2ui:catalog:resolved_after_rerender');
    // The array captured at mount is no longer the one the host renders with, so it is left alone.
    expect(mountCatalog.id).toBe('https://mount-catalog.json');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('leaves optional callbacks absent when the host supplies none', async () => {
    const dummyCatalog = {
      id: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    function TestComponent() {
      useA2uiSandbox([dummyCatalog]);
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    // `PreviewBridge` decides "this renderer does not implement it" by testing the config
    // property itself, so a delegating wrapper must not be installed where the host supplied
    // nothing: that would answer GET_DEMOS as an implementing renderer serving no demos.
    const configPassed = attachSpy.mock.lastCall![1];
    expect(configPassed.getDemos).toBeUndefined();
    expect(configPassed.getComponentUsages).toBeUndefined();
    expect(configPassed.onThemeChange).toBeUndefined();

    // A second render must not retroactively install them either.
    await act(async () => {
      root.render(React.createElement(TestComponent));
    });
    expect(attachSpy).toHaveBeenCalledTimes(1);
    expect(configPassed.getDemos).toBeUndefined();

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
