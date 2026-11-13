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

import React from 'react';
import {useA2uiSandbox} from 'a2ui-bridge/react';
import {createMcpFunctionsCatalog, ERROR_OVERLAY_DEBOUNCE_MS} from 'a2ui-bridge';
import {attachCatalogSchema} from '../../shared/attach-catalog-schema.js';
import {COMPONENT_USAGES} from '../../shared/usages.js';
import {DEMOS} from '../../shared/demos';
import {renderMarkdown} from '@a2ui/markdown-it';
import {A2uiSurface, MarkdownContext, type ReactCatalogComponent} from '@a2ui/react';
import {basicCatalog} from '@a2ui/web_core/catalogs/basic/v1';
import {useDebouncedValue} from './hooks/use-debounced-value.js';

attachCatalogSchema(basicCatalog);

const mcpFunctionsCatalog = createMcpFunctionsCatalog();

export function App() {
  const {surface, hasRoot, error} = useA2uiSandbox<ReactCatalogComponent>(
    [basicCatalog, mcpFunctionsCatalog],
    {
      getComponentUsages: async () => COMPONENT_USAGES,
      getDemos: async () => DEMOS,
    },
  );

  // Buffer overlay triggers to prevent flicker cascades during rapid
  // keypresses or layout changes as JSON arrays stream across the bridge.
  const debouncedError = useDebouncedValue(error, ERROR_OVERLAY_DEBOUNCE_MS);

  return (
    <main className="sandbox-shell">
      {surface ? (
        hasRoot && (
          <MarkdownContext.Provider value={renderMarkdown}>
            <A2uiSurface surface={surface} />
          </MarkdownContext.Provider>
        )
      ) : (
        <p style={{padding: 24, color: '#666', fontFamily: 'sans-serif', textAlign: 'center'}}>
          A2UI React Sandbox active. Waiting for RENDER_A2UI payloads...
        </p>
      )}
      {debouncedError && (
        <div className="error-overlay">
          <h3>JSON Preview Error</h3>
          <pre>{debouncedError.message || String(debouncedError)}</pre>
        </div>
      )}
    </main>
  );
}
