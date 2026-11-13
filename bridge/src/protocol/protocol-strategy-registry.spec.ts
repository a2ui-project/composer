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
import {resolveProtocolStrategy, detectProtocolVersion} from './protocol-strategy-registry';
import {V09BridgeProtocolStrategy} from './v0-9-bridge-protocol-strategy';
import {V10BridgeProtocolStrategy} from './v1-0-bridge-protocol-strategy';

describe('ProtocolStrategyRegistry', () => {
  describe('resolveProtocolStrategy', () => {
    it('returns V09 strategy for undefined or null or empty', () => {
      expect(resolveProtocolStrategy()).toBeInstanceOf(V09BridgeProtocolStrategy);
      expect(resolveProtocolStrategy(null)).toBeInstanceOf(V09BridgeProtocolStrategy);
      expect(resolveProtocolStrategy('')).toBeInstanceOf(V09BridgeProtocolStrategy);
    });

    it('returns V09 strategy for "v0.9" and "0.9"', () => {
      expect(resolveProtocolStrategy('v0.9')).toBeInstanceOf(V09BridgeProtocolStrategy);
      expect(resolveProtocolStrategy('0.9')).toBeInstanceOf(V09BridgeProtocolStrategy);
    });

    it('returns V10 strategy for "v1.0" and "1.0"', () => {
      expect(resolveProtocolStrategy('v1.0')).toBeInstanceOf(V10BridgeProtocolStrategy);
      expect(resolveProtocolStrategy('1.0')).toBeInstanceOf(V10BridgeProtocolStrategy);
    });
  });

  describe('detectProtocolVersion', () => {
    it('detects v1.0 when an item specifies version "v1.0" or "1.0"', () => {
      expect(detectProtocolVersion([{version: 'v1.0'}])).toBe('v1.0');
      expect(detectProtocolVersion([{version: '1.0'}])).toBe('v1.0');
    });

    it('defaults to v0.9 when items specify "v0.9" or no version', () => {
      expect(detectProtocolVersion([{version: 'v0.9'}])).toBe('v0.9');
      expect(detectProtocolVersion([{}])).toBe('v0.9');
      expect(detectProtocolVersion([])).toBe('v0.9');
      expect(detectProtocolVersion(null as unknown as unknown[])).toBe('v0.9');
    });
  });
});
