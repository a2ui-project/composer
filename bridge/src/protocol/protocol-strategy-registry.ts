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

import type {A2uiProtocolVersion} from '../bridge-message.js';
import type {BridgeProtocolStrategy} from './bridge-protocol-strategy.js';
import {V09BridgeProtocolStrategy} from './v0-9-bridge-protocol-strategy.js';
import {V10BridgeProtocolStrategy} from './v1-0-bridge-protocol-strategy.js';

const defaultV09Strategy = new V09BridgeProtocolStrategy();
const defaultV10Strategy = new V10BridgeProtocolStrategy();

const strategyRegistry = new Map<string, BridgeProtocolStrategy>([
  ['v0.9', defaultV09Strategy],
  ['0.9', defaultV09Strategy],
  ['v1.0', defaultV10Strategy],
  ['1.0', defaultV10Strategy],
]);

/**
 * Resolves the appropriate BridgeProtocolStrategy for a given version string.
 * Defaults to the v0.9 strategy when version is omitted, empty, or unknown.
 *
 * @param version Optional protocol version string.
 * @returns The resolved BridgeProtocolStrategy instance.
 */
export function resolveProtocolStrategy(version?: string | null): BridgeProtocolStrategy {
  if (!version || typeof version !== 'string') {
    return defaultV09Strategy;
  }
  const trimmed = version.trim();
  const registered = strategyRegistry.get(trimmed);
  if (registered) {
    return registered;
  }
  if (trimmed.startsWith('1.') || trimmed.startsWith('v1.')) {
    return defaultV10Strategy;
  }
  return defaultV09Strategy;
}

/**
 * Inspects a list of incoming layout messages to detect the targeted A2UI protocol version.
 * Returns 'v1.0' if any item explicitly declares 'v1.0' or '1.0', otherwise defaults to 'v0.9'.
 *
 * @param messages Array of incoming message items.
 * @returns The detected protocol version ('v0.9' or 'v1.0').
 */
export function detectProtocolVersion(messages: readonly unknown[]): A2uiProtocolVersion {
  if (!Array.isArray(messages)) return 'v0.9';
  for (const item of messages) {
    if (item && typeof item === 'object') {
      const version = (item as Record<string, unknown>)['version'];
      if (typeof version === 'string') {
        const v = version.trim();
        if (v === 'v1.0' || v === '1.0' || v.startsWith('1.') || v.startsWith('v1.')) {
          return 'v1.0';
        }
      }
    }
  }
  return 'v0.9';
}

export * from './bridge-protocol-strategy.js';
export * from './v0-9-bridge-protocol-strategy.js';
export * from './v1-0-bridge-protocol-strategy.js';
