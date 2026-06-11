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

import {Component, inject, signal, effect, untracked} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {JsonPipe} from '@angular/common';
import {HostCommunication} from '../../shell/host-communication';
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
export interface MappedEventLogItem {
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

  protected readonly eventsLog = signal<MappedEventLogItem[]>([]);
  protected readonly displayedColumns = ['time', 'action', 'surface', 'component', 'context'];

  constructor() {
    effect(() => {
      const envelope = this.hostComm.messageStream();
      if (envelope?.type === PreviewBridgeMessageType.SEND_TO_SERVER) {
        const payload = envelope?.payload as RawServerPayload;
        if (payload && payload.action) {
          let action = payload.action;
          if (typeof action === 'string') {
            try {
              action = JSON.parse(action);
            } catch (e) {
              // Ignore parsing errors
            }
          }
          if (action && typeof action === 'object') {
            const timestamp = action.timestamp || envelope.timestamp;
            const mappedItem = {
              time: formatTimestamp(timestamp),
              action: action.name || '',
              surface: action.surfaceId || '',
              component: action.sourceComponentId || action.sourceComponent || '',
              context: action.context || action.contextParameters || null,
            };
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
      }
    });
  }

  clearLogs(): void {
    this.eventsLog.set([]);
  }
}
