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

import {describe, expect, it} from 'vitest';
import {bentoColumns} from './bento-layout';

describe('bento layout', () => {
  it('alternates generous and compact tiles without reordering them', () => {
    expect(bentoColumns([false, false, false, false])).toEqual([7, 5, 5, 7]);
  });

  it('gives overflowing demos a full row and fills the preceding orphan', () => {
    expect(bentoColumns([false, true, false, false, true])).toEqual([12, 12, 7, 5, 12]);
  });

  it('fills the last row and handles an empty wall', () => {
    expect(bentoColumns([false, false, false])).toEqual([7, 5, 12]);
    expect(bentoColumns([])).toEqual([]);
  });
});
