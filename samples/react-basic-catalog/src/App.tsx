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

import React, {useState, useEffect} from 'react';
import {useA2uiSandbox} from 'a2ui-bridge/react';
import {COMPONENT_USAGES} from './usages.js';
import {A2uiSurface, basicCatalog} from '@a2ui/react/v0_9';

/**
 * Hook that defers propagating a value until a delay has passed without updates.
 *
 * @param value The reactive value to buffer.
 * @param delayMs The stabilization window duration in milliseconds.
 * @returns The stabilized value.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    if (!value) {
      setDebouncedValue(value);
      return;
    }
    // Buffer overlay triggers to prevent UI flicker cascades during rapid
    // keypresses or continuous layout state transitions in the editor.
    const handler = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}

export function App() {
  const {surface, error} = useA2uiSandbox([basicCatalog], {
    getComponentUsages: async () => COMPONENT_USAGES,
  });

  // Buffer overlay triggers to prevent flicker cascades during rapid
  // keypresses or layout changes as JSON arrays stream across the bridge.
  const debouncedError = useDebouncedValue(error, 350);

  return (
    <main
      className="sandbox-shell"
      style={{position: 'relative', width: '100%', height: '100%', minHeight: '100vh'}}
    >
      {surface ? (
        <A2uiSurface surface={surface} />
      ) : (
        <p style={{padding: 24, color: '#666', fontFamily: 'sans-serif', textAlign: 'center'}}>
          A2UI React Sandbox active. Waiting for RENDER_A2UI payloads...
        </p>
      )}

      {debouncedError && (
        <div
          className="error-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            inset: 0,
            zIndex: 9999,
            backgroundColor:
              'color-mix(in srgb, var(--a2ui-color-surface, canvas) 95%, transparent)',
            color: 'var(--a2ui-color-error, #d32f2f)',
            padding: '24px',
            fontFamily: 'monospace',
            overflow: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <h3>JSON Preview Error</h3>
          <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
            {debouncedError.message || String(debouncedError)}
          </pre>
        </div>
      )}
    </main>
  );
}
