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

import {useA2uiSandbox} from 'a2ui-bridge/react';
import {A2uiSurface, basicCatalog} from '@a2ui/react/v0_9';

const SANDBOX_CATALOGS = [basicCatalog];

export function App() {
  const {surface} = useA2uiSandbox(SANDBOX_CATALOGS);

  return (
    <main className="sandbox-shell">
      {surface ? (
        <A2uiSurface surface={surface} />
      ) : (
        <p style={{padding: 24, color: '#666', fontFamily: 'sans-serif', textAlign: 'center'}}>
          A2UI React Sandbox active. Waiting for RENDER_A2UI payloads...
        </p>
      )}
    </main>
  );
}
