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

import type {A2uiProtocolVersion, RenderA2uiItem} from '../bridge-message.js';

/**
 * Strategy interface abstracting version-specific behavior across A2UI protocol specifications.
 */
export interface BridgeProtocolStrategy {
  /** The protocol version identifier managed by this strategy ('v0.9' or 'v1.0'). */
  readonly version: A2uiProtocolVersion;

  /**
   * Extracts unique surface identifiers scheduled for creation/reset across an incoming batch.
   *
   * @param messages Incoming layout command messages.
   * @returns Array of unique surface ID strings.
   */
  extractSurfaceIdsToReset(messages: readonly unknown[]): string[];

  /**
   * Constructs a deleteSurface layout command item stamped with this strategy's protocol version.
   *
   * @param surfaceId Surface identifier to delete.
   * @returns A structured RenderA2uiItem layout command.
   */
  buildDeleteSurfaceItem(surfaceId: string): RenderA2uiItem;

  /**
   * Constructs a synthetic outbound or internal layout command envelope stamped with this strategy's protocol version.
   *
   * @param kind The envelope category: 'action', 'dataModelChange', or 'error'.
   * @param payload The underlying payload data.
   * @returns A structured record stamped with `version`.
   */
  buildSyntheticEnvelope(
    kind: 'action' | 'dataModelChange' | 'error',
    payload: unknown,
  ): Record<string, unknown>;
}

/**
 * Base protocol strategy providing common surface management and envelope logic.
 */
export abstract class BaseBridgeProtocolStrategy implements BridgeProtocolStrategy {
  /** The protocol version identifier managed by this strategy ('v0.9' or 'v1.0'). */
  abstract readonly version: A2uiProtocolVersion;

  /**
   * Returns the wire version string to stamp on outbound envelopes.
   */
  protected get wireVersion(): string {
    return this.version;
  }

  /**
   * Extracts unique surface identifiers scheduled for creation/reset across an incoming batch.
   *
   * @param messages Incoming layout command messages.
   * @returns Array of unique surface ID strings.
   */
  extractSurfaceIdsToReset(messages: readonly unknown[]): string[] {
    if (!Array.isArray(messages)) return [];
    const surfaceIds = new Set<string>();
    for (const item of messages) {
      if (item && typeof item === 'object') {
        const createSurface = (item as Record<string, unknown>)['createSurface'] as
          {surfaceId?: unknown} | undefined;
        if (typeof createSurface?.surfaceId === 'string' && createSurface.surfaceId.trim()) {
          surfaceIds.add(createSurface.surfaceId);
        }
      }
    }
    return Array.from(surfaceIds);
  }

  /**
   * Constructs a deleteSurface layout command item stamped with this strategy's protocol version.
   *
   * @param surfaceId Surface identifier to delete.
   * @returns A structured RenderA2uiItem layout command.
   */
  buildDeleteSurfaceItem(surfaceId: string): RenderA2uiItem {
    return {
      version: this.wireVersion,
      deleteSurface: {
        surfaceId,
      },
    };
  }

  /**
   * Constructs a synthetic outbound or internal layout command envelope stamped with this strategy's protocol version.
   *
   * @param kind The envelope category: 'action', 'dataModelChange', or 'error'.
   * @param payload The underlying payload data.
   * @returns A structured record stamped with `version`.
   */
  buildSyntheticEnvelope(
    kind: 'action' | 'dataModelChange' | 'error',
    payload: unknown,
  ): Record<string, unknown> {
    switch (kind) {
      case 'action':
        return {
          version: this.wireVersion,
          action: payload,
        };
      case 'dataModelChange':
        return {
          version: this.wireVersion,
          updateDataModel: payload,
        };
      case 'error':
        return {
          version: this.wireVersion,
          error: payload,
        };
    }
  }
}
