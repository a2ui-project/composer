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
import {HostCommunicationService} from '../../shell/host-communication.service';

/**
 * A structured telemetry record representing a custom event or interaction
 * event captured within the isolated renderer.
 */
export interface MappedEventLogItem {
  time: string;
  action: string;
  surface: string;
  component: string;
  context: any;
}

@Component({
  selector: 'a2ui-composer-events',
  standalone: true,
  imports: [MatTableModule, JsonPipe],
  templateUrl: './events.component.ng.html',
  styleUrl: './events.component.scss',
})
/**
 * A debug drawer component displaying interactive event hooks and custom
 * event transmissions triggered by layout elements.
 */
export class EventsComponent {
  private readonly hostComm = inject(HostCommunicationService);

  public readonly eventsLog = signal<MappedEventLogItem[]>([]);
  public readonly displayedColumns = ['time', 'action', 'surface', 'component', 'context'];

  constructor() {
    effect(() => {
      const envelope = this.hostComm.messageStream();
      if (envelope?.type === 'SEND_TO_SERVER') {
        const payload = envelope.payload as any;
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
              time: this.formatTimestamp(timestamp),
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

  public clearLogs(): void {
    this.eventsLog.set([]);
  }

  private formatTimestamp(epoch: number): string {
    const date = new Date(epoch);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }
}
