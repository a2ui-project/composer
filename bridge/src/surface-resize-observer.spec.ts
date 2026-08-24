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
  });

  it('measures dimensions and invokes callback when content height > 0', () => {
    Object.defineProperty(document.body, 'scrollHeight', {value: 500, configurable: true});
    Object.defineProperty(document.body, 'scrollWidth', {value: 900, configurable: true});

    observer = new SurfaceResizeObserver(onResizeMock);
    observer.measureAndDispatch();

    expect(onResizeMock).toHaveBeenCalledWith({height: 500, width: 900});
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
});
