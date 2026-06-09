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
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {HostCommunication} from '../../shell/host-communication';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {formatTimestamp} from '../../utils/date.utils';

/**
 * A structured telemetry record capturing uncaught exceptions and
 * framework runtime errors thrown within the preview window context.
 */
export interface MappedErrorLogItem {
  time: string;
  source: 'exception' | 'validation' | 'console';
  level: 'error' | 'warn' | 'info' | 'debug' | 'log';
  message: string;
  stack?: string;
}

/** Internal interface mapping raw cross-frame telemetry message data. */
interface RawTelemetryPayload {
  message?: string;
  stack?: string;
  level?: 'error' | 'warn' | 'info' | 'debug' | 'log';
  validationErrors?: unknown[] | Record<string, unknown> | string | boolean;
}

@Component({
  selector: 'a2ui-composer-errors',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './errors.ng.html',
  styleUrl: './errors.scss',
})
/**
 * A debug drawer component presenting captured error stacks, warnings,
 * and connection failures piped from the renderer application.
 */
export class Errors {
  private readonly hostComm = inject(HostCommunication);

  protected readonly errorsLog = signal<MappedErrorLogItem[]>([]);
  protected readonly columnsToDisplay = ['time', 'level', 'source', 'message'];
  protected readonly expandedRows = signal<Set<MappedErrorLogItem>>(new Set());

  constructor() {
    effect(() => {
      const envelope = this.hostComm.messageStream();
      if (!envelope) return;

      const payload = envelope.payload as RawTelemetryPayload;
      if (!payload) return;

      if (envelope.type === PreviewBridgeMessageType.CONSOLE_LOG) {
        const msg = payload.message || '';
        const isException =
          msg.includes('Unhandled Rejection') || msg.includes('Uncaught') || !!payload.stack;
        const source = isException ? 'exception' : 'console';
        const level = isException ? 'error' : payload.level || 'log';
        const mapped: MappedErrorLogItem = {
          time: formatTimestamp(envelope.timestamp),
          source,
          level,
          message: msg,
          stack: payload.stack || undefined,
        };
        untracked(() => {
          this.errorsLog.update(logs => {
            const newLogs = [mapped, ...logs];
            if (newLogs.length > 100) {
              newLogs.length = 100;
            }
            return newLogs;
          });
        });
      } else if (
        envelope.type === PreviewBridgeMessageType.DATA_MODEL_CHANGE &&
        payload.validationErrors
      ) {
        const validationErrors = payload.validationErrors;
        const hasErrors = Array.isArray(validationErrors)
          ? validationErrors.length > 0
          : typeof validationErrors === 'object' && validationErrors !== null
            ? Object.keys(validationErrors).length > 0
            : !!validationErrors;

        if (hasErrors) {
          let message = '';
          if (Array.isArray(validationErrors)) {
            message = validationErrors
              .map(e => (typeof e === 'string' ? e : JSON.stringify(e)))
              .join(', ');
          } else if (typeof validationErrors === 'object') {
            message = JSON.stringify(validationErrors);
          } else {
            message = String(validationErrors);
          }

          const mapped: MappedErrorLogItem = {
            time: formatTimestamp(envelope.timestamp),
            source: 'validation',
            level: 'error',
            message,
            stack: undefined,
          };
          untracked(() => {
            this.errorsLog.update(logs => {
              const newLogs = [mapped, ...logs];
              if (newLogs.length > 100) {
                newLogs.length = 100;
              }
              return newLogs;
            });
          });
        }
      }
    });
  }

  protected toggleRow(element: MappedErrorLogItem): void {
    this.expandedRows.update(set => {
      const newSet = new Set(set);
      if (newSet.has(element)) {
        newSet.delete(element);
      } else {
        newSet.add(element);
      }
      return newSet;
    });
  }

  protected isRowExpanded(element: MappedErrorLogItem): boolean {
    return this.expandedRows().has(element);
  }

  public clearLogs(): void {
    this.errorsLog.set([]);
    this.expandedRows.set(new Set());
  }
}
