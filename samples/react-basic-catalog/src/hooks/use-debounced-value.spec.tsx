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

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import React, {act} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {useDebouncedValue} from './use-debounced-value';

interface TestComponentProps<T> {
  value: T;
  delayMs: number;
}

function TestComponent<T>({value, delayMs}: TestComponentProps<T>) {
  const debounced = useDebouncedValue(value, delayMs);
  return <div data-testid="result">{String(debounced)}</div>;
}

describe('useDebouncedValue', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = null;
    root = null;
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initializes with immediate provided value', async () => {
    await act(async () => {
      root?.render(<TestComponent value="initial" delayMs={350} />);
    });
    expect(container?.textContent).toBe('initial');
  });

  it('updates immediately on falsy fast path without waiting for debounce timer', async () => {
    await act(async () => {
      root?.render(<TestComponent value="active" delayMs={350} />);
    });
    expect(container?.textContent).toBe('active');

    await act(async () => {
      root?.render(<TestComponent value="" delayMs={350} />);
    });
    expect(container?.textContent).toBe('');
  });

  it('debounces rapid updates and propagates only the latest value after stabilization delay', async () => {
    await act(async () => {
      root?.render(<TestComponent value="first" delayMs={350} />);
    });
    expect(container?.textContent).toBe('first');

    await act(async () => {
      root?.render(<TestComponent value="second" delayMs={350} />);
    });
    expect(container?.textContent).toBe('first');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(container?.textContent).toBe('first');

    await act(async () => {
      root?.render(<TestComponent value="third" delayMs={350} />);
    });
    expect(container?.textContent).toBe('first');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(container?.textContent).toBe('first');

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(container?.textContent).toBe('third');
  });

  it('cancels pending timers upon unmount preventing post-unmount state updates', async () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    await act(async () => {
      root?.render(<TestComponent value="first" delayMs={350} />);
    });

    await act(async () => {
      root?.render(<TestComponent value="second" delayMs={350} />);
    });

    act(() => {
      root?.unmount();
    });
    root = null;

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
