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

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {SurfaceResizeObserver} from './surface-resize-observer';

describe('SurfaceResizeObserver', () => {
  let observer: SurfaceResizeObserver;
  let onResizeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onResizeMock = vi.fn();
  });

  afterEach(() => {
    observer?.destroy();
    vi.restoreAllMocks();
    const docElRecord = document.documentElement as unknown as Record<string, unknown>;
    delete docElRecord['scrollHeight'];
    delete docElRecord['offsetHeight'];
    delete docElRecord['scrollWidth'];
    delete docElRecord['offsetWidth'];
    const bodyRecord = document.body as unknown as Record<string, unknown>;
    delete bodyRecord['scrollHeight'];
    delete bodyRecord['offsetHeight'];
    delete bodyRecord['scrollWidth'];
    delete bodyRecord['offsetWidth'];
  });

  it('measures dimensions and invokes callback when content height > 0', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 500, configurable: true});
    Object.defineProperty(document.body, 'scrollWidth', {value: 900, configurable: true});

    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();

    expect(onResizeMock).toHaveBeenCalledWith({height: 500, width: 900});
  });

  it('rounds fractional content up without growing on identical measurements', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 320, configurable: true});
    vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 600, 320.4));
    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenLastCalledWith(expect.objectContaining({height: 321}));
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(1);
  });

  it('deduplicates redundant measurements when dimensions have not changed', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 400, configurable: true});
    Object.defineProperty(document.body, 'scrollWidth', {value: 800, configurable: true});

    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(1);

    // Second measure with identical values should NOT trigger callback
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(1);

    // Changed dimensions should trigger callback
    Object.defineProperty(document.body, 'scrollHeight', {value: 600, configurable: true});
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(2);
    expect(onResizeMock).toHaveBeenLastCalledWith({height: 600, width: 800});
  });

  it('bypasses deduplication cache when force is true', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 300, configurable: true});
    Object.defineProperty(document.body, 'scrollWidth', {value: 600, configurable: true});

    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(1);

    // Force dispatch with identical values
    observer.measureAndDispatch(true);
    expect(onResizeMock).toHaveBeenCalledTimes(2);
  });

  it('reports the viewport from the same measurement and dispatches viewport-only changes', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 300, configurable: true});
    Object.defineProperty(document.body, 'scrollWidth', {value: 1230, configurable: true});
    const viewport = vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1230);
    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();

    // The iframe can resize before its asynchronous postMessage reaches the host.
    // The earlier report must retain its original viewport instead of appearing
    // to overflow merely because the host is now looking at a narrower iframe.
    viewport.mockReturnValue(1124);
    expect(onResizeMock).toHaveBeenLastCalledWith({
      height: 300,
      width: 1230,
      viewportWidth: 1230,
    });

    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(2);
    expect(onResizeMock).toHaveBeenLastCalledWith({
      height: 300,
      width: 1230,
      viewportWidth: 1124,
    });
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(2);
  });

  it('registers window resize listener and cleans it up on destroy', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    observer = new SurfaceResizeObserver(onResizeMock);
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    observer.destroy();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('handles DOMContentLoaded event when document is loading', () => {
    const originalReadyState = document.readyState;
    Object.defineProperty(document, 'readyState', {value: 'loading', configurable: true});

    const addEventSpy = vi.spyOn(document, 'addEventListener');
    const removeEventSpy = vi.spyOn(document, 'removeEventListener');

    observer = new SurfaceResizeObserver(onResizeMock);
    expect(addEventSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function), {
      once: true,
    });

    observer.destroy();
    expect(removeEventSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));

    Object.defineProperty(document, 'readyState', {value: originalReadyState, configurable: true});
  });

  it('reports content height when documentElement.scrollHeight is inflated by the viewport', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 264, configurable: true});
    Object.defineProperty(document.body, 'offsetHeight', {value: 264, configurable: true});
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 3224,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'offsetHeight', {
      value: 264,
      configurable: true,
    });
    Object.defineProperty(document.body, 'scrollWidth', {value: 800, configurable: true});

    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();

    expect(onResizeMock).toHaveBeenCalledWith({height: 264, width: 800});
  });

  it('reports a smaller height after the surface content shrinks', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 3224, configurable: true});
    Object.defineProperty(document.body, 'offsetHeight', {value: 3224, configurable: true});
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 3224,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'offsetHeight', {
      value: 3224,
      configurable: true,
    });
    Object.defineProperty(document.body, 'scrollWidth', {value: 800, configurable: true});

    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(1);
    expect(onResizeMock).toHaveBeenLastCalledWith({height: 3224, width: 800});

    // Content shrinks: body terms and docEl.offsetHeight drop to 264,
    // but docEl.scrollHeight stays latched at 3224 (as happens in the real viewport).
    Object.defineProperty(document.body, 'scrollHeight', {value: 264, configurable: true});
    Object.defineProperty(document.body, 'offsetHeight', {value: 264, configurable: true});
    Object.defineProperty(document.documentElement, 'offsetHeight', {
      value: 264,
      configurable: true,
    });

    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(2);
    expect(onResizeMock).toHaveBeenLastCalledWith({height: 264, width: 800});
  });

  it('includes body margins that escape through the root element', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 290, configurable: true});
    Object.defineProperty(document.body, 'offsetHeight', {value: 290, configurable: true});
    Object.defineProperty(document.documentElement, 'offsetHeight', {
      value: 390,
      configurable: true,
    });
    Object.defineProperty(document.body, 'scrollWidth', {value: 800, configurable: true});

    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();

    expect(onResizeMock).toHaveBeenCalledWith({height: 390, width: 800});
  });

  it('stops dispatching once the reported height matches the content', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 300, configurable: true});
    Object.defineProperty(document.body, 'offsetHeight', {value: 300, configurable: true});
    Object.defineProperty(document.documentElement, 'offsetHeight', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(document.body, 'scrollWidth', {value: 800, configurable: true});

    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(1);

    observer.measureAndDispatch();
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(1);
  });

  it('excludes documentElement.scrollWidth, which follows the frame', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 300, configurable: true});
    Object.defineProperty(document.body, 'offsetHeight', {value: 300, configurable: true});
    Object.defineProperty(document.documentElement, 'offsetHeight', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(document.body, 'scrollWidth', {value: 800, configurable: true});
    Object.defineProperty(document.body, 'offsetWidth', {value: 800, configurable: true});
    Object.defineProperty(document.documentElement, 'offsetWidth', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollWidth', {
      value: 800,
      configurable: true,
    });

    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(1);
    expect(onResizeMock).toHaveBeenLastCalledWith({height: 300, width: 800});

    // The frame widens: the root scroll box is floored at the new viewport while
    // the content boxes stay where they are.
    Object.defineProperty(document.documentElement, 'scrollWidth', {
      value: 1200,
      configurable: true,
    });

    observer.measureAndDispatch();
    expect(onResizeMock).toHaveBeenCalledTimes(1);
  });
});
