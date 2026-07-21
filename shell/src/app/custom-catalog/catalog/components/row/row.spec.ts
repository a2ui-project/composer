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

import {describe, it, expect} from 'vitest';
import {renderSurface} from '../test-harness';

describe('CcRow', () => {
  it('renders one component host per child', async () => {
    const {host} = await renderSurface([
      {id: 'root', component: 'Row', children: ['t1', 't2', 't3'], gap: 16},
      {id: 't1', component: 'Title', text: 'One', level: 'h3'},
      {id: 't2', component: 'Title', text: 'Two', level: 'h3'},
      {id: 't3', component: 'Title', text: 'Three', level: 'h3'},
    ]);

    const row = host.querySelector('.cc-row');
    expect(row).not.toBeNull();

    const childHosts = row!.querySelectorAll(':scope > a2ui-v09-component-host');
    expect(childHosts.length).toBe(3);

    expect(host.textContent).toContain('One');
    expect(host.textContent).toContain('Two');
    expect(host.textContent).toContain('Three');
  });
});
