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

import {Component, inject, signal, effect, untracked, DestroyRef} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatTableModule} from '@angular/material/table';
import {JsonPipe} from '@angular/common';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {formatTimestamp} from '../../utils/date.utils';

/** Exposes the unminified dynamic details mapping of cross-frame custom events */
interface RawActionDetails {
  name?: string;
  surfaceId?: string;
  sourceComponentId?: string;
  sourceComponent?: string;
  context?: Record<string, unknown> | null;
  contextParameters?: Record<string, unknown> | null;
  timestamp?: number;
}

/** Represents raw event envelopes carrying action payloads sent to the backend */
interface RawServerPayload {
  action?: string | RawActionDetails;
}

/**
 * A structured telemetry record representing a custom event or interaction
 * event captured within the isolated renderer.
 */
export interface DisplayEventLogItem {
  time: string;
  action: string;
  surface: string;
  component: string;
  context: Record<string, unknown> | null;
}

/**
 * A debug drawer component displaying interactive event hooks and custom
 * event transmissions triggered by layout elements.
 */
@Component({
  selector: 'a2ui-composer-events',
  standalone: true,
  imports: [MatTableModule, JsonPipe],
  templateUrl: './events.ng.html',
  styleUrl: './events.scss',
})
export class Events {
  private readonly hostComm = inject(HostCommunication);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly eventsLog = signal<DisplayEventLogItem[]>([]);
  protected readonly displayedColumns = ['time', 'action', 'surface', 'component', 'context'];
  private readonly processedEnvelopes = new WeakSet<MessageEnvelope>();

  constructor() {
    // The Events tab specifically captures SEND_TO_SERVER messages, which represent
    // interactive user actions and component event payloads destined for the server/backend.
    // Other message types (CONSOLE_LOG, DATA_MODEL_CHANGE, RENDERER_READY, SURFACE_RESIZE)
    // are routed to their dedicated tabs: Errors, Data Model, and Raw Messages.
    const initialEvents = (this.hostComm.getHistoryBuffer?.() || [])
      .filter(env => env.type === PreviewBridgeMessageType.SEND_TO_SERVER)
      .map(env => {
        this.processedEnvelopes.add(env);
        return this.mapEnvelopeToEvent(env);
      })
      .filter((item): item is DisplayEventLogItem => item !== null)
      .reverse();
    if (initialEvents.length > 0) {
      this.eventsLog.set(initialEvents.slice(0, 100));
    }

    if (this.hostComm.messageStream$) {
      this.hostComm.messageStream$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(envelope => {
        this.handleIncomingEnvelope(envelope);
      });
    }

    effect(() => {
      const envelope = this.hostComm.messageStream();
      if (envelope) {
        this.handleIncomingEnvelope(envelope);
      }
    });
  }

  private handleIncomingEnvelope(envelope: MessageEnvelope): void {
    // Only capture SEND_TO_SERVER messages; other message types (such as CONSOLE_LOG,
    // DATA_MODEL_CHANGE, RENDERER_READY, SURFACE_RESIZE) are handled by dedicated tabs
    // (Errors, Data Model, Raw Messages).
    if (
      envelope.type !== PreviewBridgeMessageType.SEND_TO_SERVER ||
      this.processedEnvelopes.has(envelope)
    ) {
      return;
    }
    this.processedEnvelopes.add(envelope);
    const mappedItem = this.mapEnvelopeToEvent(envelope);
    if (mappedItem) {
      untracked(() => {
        this.eventsLog.update(logs => {
          const newLogs = [mappedItem, ...logs];
          if (newLogs.length > 100) {
            newLogs.length = 100;
          }
          return newLogs;
        });
      });
    }
  }

  private mapEnvelopeToEvent(envelope: MessageEnvelope): DisplayEventLogItem | null {
    // NOTE: Bracket notation is used to access properties on the parsed postMessage payload
    // to prevent compiler minification renaming from breaking property reads.
    const payload = envelope.payload as RawServerPayload | undefined;
    if (!payload || !payload['action']) {
      return null;
    }
    let action = payload['action'];
    if (typeof action === 'string') {
      try {
        action = JSON.parse(action);
      } catch {
        return null;
      }
    }
    if (!action || typeof action !== 'object') {
      return null;
    }
    // NOTE: Bracket notation prevents compiler minification renaming of keys that
    // originate from external cross-frame events.
    const actionObj = action as RawActionDetails;
    const timestamp = actionObj['timestamp'] || envelope.timestamp || 0;
    return {
      time: formatTimestamp(timestamp),
      action: actionObj['name'] || '',
      surface: actionObj['surfaceId'] || '',
      component: actionObj['sourceComponentId'] || actionObj['sourceComponent'] || '',
      context: actionObj['context'] || actionObj['contextParameters'] || null,
    };
  }

  clearLogs(): void {
    this.eventsLog.set([]);
  }
}
