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
import {V10BridgeProtocolStrategy} from './v1-0-bridge-protocol-strategy';

describe('V10BridgeProtocolStrategy', () => {
  const strategy = new V10BridgeProtocolStrategy();

  it('exposes version "v1.0"', () => {
    expect(strategy.version).toBe('v1.0');
  });

  describe('extractSurfaceIdsToReset', () => {
    it('extracts unique surfaceIds from createSurface commands', () => {
      const messages = [
        {
          version: 'v1.0',
          createSurface: {surfaceId: 'surf-a', catalogId: 'cat-1'},
        },
        {
          version: 'v1.0',
          updateComponents: {surfaceId: 'surf-a', components: []},
        },
        {
          version: 'v1.0',
          createSurface: {surfaceId: 'surf-b', catalogId: 'cat-2'},
        },
        {
          version: 'v1.0',
          createSurface: {surfaceId: 'surf-a', catalogId: 'cat-1'},
        },
      ];
      expect(strategy.extractSurfaceIdsToReset(messages)).toEqual(['surf-a', 'surf-b']);
    });
  });

  describe('buildDeleteSurfaceItem', () => {
    it('constructs a v1.0 deleteSurface item', () => {
      expect(strategy.buildDeleteSurfaceItem('surf-target')).toEqual({
        version: 'v1.0',
        deleteSurface: {
          surfaceId: 'surf-target',
        },
      });
    });
  });

  describe('buildSyntheticEnvelope', () => {
    it('stamps version v1.0 on action envelopes', () => {
      const env = strategy.buildSyntheticEnvelope('action', {name: 'submit'});
      expect(env).toEqual({
        version: 'v1.0',
        action: {name: 'submit'},
      });
    });

    it('stamps version v1.0 on dataModelChange envelopes', () => {
      const env = strategy.buildSyntheticEnvelope('dataModelChange', {
        surfaceId: 's1',
        value: 456,
      });
      expect(env).toEqual({
        version: 'v1.0',
        updateDataModel: {
          surfaceId: 's1',
          value: 456,
        },
      });
    });

    it('stamps version v1.0 on error envelopes', () => {
      const env = strategy.buildSyntheticEnvelope('error', {
        message: 'v1.0 error occurred',
      });
      expect(env).toEqual({
        version: 'v1.0',
        error: {
          message: 'v1.0 error occurred',
        },
      });
    });
  });
});
