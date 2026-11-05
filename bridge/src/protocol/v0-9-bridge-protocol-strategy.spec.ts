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
import {V09BridgeProtocolStrategy} from './v0-9-bridge-protocol-strategy';

describe('V09BridgeProtocolStrategy', () => {
  const strategy = new V09BridgeProtocolStrategy();

  it('exposes version "v0.9"', () => {
    expect(strategy.version).toBe('v0.9');
  });

  describe('extractSurfaceIdsToReset', () => {
    it('extracts unique surfaceIds from createSurface commands', () => {
      const messages = [
        {
          version: 'v0.9',
          createSurface: {surfaceId: 'surf-1', catalogId: 'cat-1'},
        },
        {
          version: 'v0.9',
          updateComponents: {surfaceId: 'surf-1', components: []},
        },
        {
          version: 'v0.9',
          createSurface: {surfaceId: 'surf-2', catalogId: 'cat-1'},
        },
        {
          version: 'v0.9',
          createSurface: {surfaceId: 'surf-1', catalogId: 'cat-1'},
        },
      ];
      expect(strategy.extractSurfaceIdsToReset(messages)).toEqual(['surf-1', 'surf-2']);
    });

    it('ignores items without createSurface or missing surfaceId', () => {
      const messages = [null, {}, {createSurface: {}}, {createSurface: {surfaceId: ''}}];
      expect(strategy.extractSurfaceIdsToReset(messages)).toEqual([]);
    });
  });

  describe('buildDeleteSurfaceItem', () => {
    it('constructs a v0.9 deleteSurface item', () => {
      expect(strategy.buildDeleteSurfaceItem('surf-target')).toEqual({
        version: 'v0.9',
        deleteSurface: {
          surfaceId: 'surf-target',
        },
      });
    });
  });

  describe('buildSyntheticEnvelope', () => {
    it('stamps version v0.9 on action envelopes', () => {
      const env = strategy.buildSyntheticEnvelope('action', {name: 'submit'});
      expect(env).toEqual({
        version: 'v0.9',
        action: {name: 'submit'},
      });
    });

    it('stamps version v0.9 on dataModelChange envelopes', () => {
      const env = strategy.buildSyntheticEnvelope('dataModelChange', {
        surfaceId: 's1',
        value: 123,
      });
      expect(env).toEqual({
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 's1',
          value: 123,
        },
      });
    });

    it('stamps version v0.9 on error envelopes', () => {
      const env = strategy.buildSyntheticEnvelope('error', {
        message: 'Something went wrong',
      });
      expect(env).toEqual({
        version: 'v0.9',
        error: {
          message: 'Something went wrong',
        },
      });
    });
  });
});
