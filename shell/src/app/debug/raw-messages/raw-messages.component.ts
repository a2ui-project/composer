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

import {
  Component,
  inject,
  signal,
  effect,
  viewChild,
  afterRenderEffect,
  ElementRef,
} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {HostCommunicationService, MessageEnvelope} from '../../shell/host-communication.service';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

@Component({
  selector: 'a2ui-composer-raw-messages',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './raw-messages.component.ng.html',
  styleUrl: './raw-messages.component.scss',
})
/**
 * A debug drawer component presenting a scrolling diagnostic view
 * of raw postMessage traffic across the iframe boundary.
 */
export class RawMessagesComponent {
  private readonly hostComm = inject(HostCommunicationService);

  public readonly messageHistory = signal<{envelope: MessageEnvelope; timestampStr: string}[]>([]);
  public readonly logContainer = viewChild<ElementRef<HTMLDivElement>>('logContainer');

  constructor() {
    effect(() => {
      const envelope = this.hostComm.messageStream();
      if (envelope && envelope.type !== PreviewBridgeMessageType.CONSOLE_LOG) {
        const timestampStr = this.formatTimestamp(envelope.timestamp);
        this.messageHistory.update(history => {
          const newHistory = [{envelope, timestampStr}, ...history];
          if (newHistory.length > 100) {
            newHistory.pop();
          }
          return newHistory;
        });
      }
    });

    afterRenderEffect(() => {
      // Reactively depend on message history changes to run after each list render
      this.messageHistory();

      const container = this.logContainer()?.nativeElement;
      if (container) {
        container.scrollTop = 0;
      }
    });
  }

  public clearLogs(): void {
    this.messageHistory.set([]);
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
