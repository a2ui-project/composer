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
import {BaseBridgeProtocolStrategy} from './bridge-protocol-strategy.js';

/**
 * Protocol strategy implementing A2UI v1.0 wire behaviors.
 */
export class V10BridgeProtocolStrategy extends BaseBridgeProtocolStrategy {
  /** The protocol version identifier managed by this strategy ('v1.0'). */
  readonly version: A2uiProtocolVersion = 'v1.0';

  /**
   * Returns canonical wire version '1.0' for A2UI v1.0 protocol messages.
   */
  protected override get wireVersion(): string {
    return '1.0';
  }

  /**
   * Normalizes version: 'v1.0' -> '1.0' for canonical v1.0 message processor.
   *
   * @param messages Incoming layout command messages.
   * @returns Normalized messages array.
   */
  override normalizeIncomingMessages(messages: unknown[]): unknown[] {
    for (const item of messages) {
      if (item && typeof item === 'object' && (item as {version?: unknown}).version === 'v1.0') {
        (item as {version: string}).version = '1.0';
      }
    }
    return messages;
  }
}
