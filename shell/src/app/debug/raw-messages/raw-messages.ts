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
  viewChild,
  afterRenderEffect,
  ElementRef,
  OnDestroy,
  effect,
} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {JsonPipe} from '@angular/common';
import {HostCommunication, MessageEnvelope} from '../../shell/host-communication';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {ChatState} from '../../chat/chat-state/chat-state';
import {formatTimestamp} from '../../utils/date.utils';

export interface RawLogEntry {
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: number;
  readonly timestampStr: string;
  readonly origin?: string;
}

@Component({
  selector: 'a2ui-composer-raw-messages',
  standalone: true,
  imports: [MatExpansionModule, JsonPipe],
  templateUrl: './raw-messages.ng.html',
  styleUrl: './raw-messages.scss',
})
/**
 * A debug drawer component presenting a scrolling diagnostic view
 * of raw postMessage traffic across the iframe boundary.
 */
export class RawMessages implements OnDestroy {
  private readonly hostComm = inject(HostCommunication);
  private readonly chatState = inject(ChatState);

  protected readonly messageHistory = signal<RawLogEntry[]>([]);

  private readonly logContainer = viewChild<ElementRef<HTMLDivElement>>('logContainer');

  public readonly TEST_ONLY = {
    logContainer: () => this.logContainer(),
  };

  private readonly postMessageListener = (envelope: MessageEnvelope) => {
    if (envelope.type === PreviewBridgeMessageType.CONSOLE_LOG) {
      return;
    }
    this.addLogEntry({
      type: envelope.type,
      payload: envelope.payload,
      timestamp: envelope.timestamp,
      timestampStr: formatTimestamp(envelope.timestamp),
      origin: envelope.origin,
    });
  };

  constructor() {
    const historyBuffer = this.hostComm.getHistoryBuffer();
    const initialHosts: RawLogEntry[] = historyBuffer
      .filter(env => env.type !== PreviewBridgeMessageType.CONSOLE_LOG)
      .map(env => ({
        type: env.type,
        payload: env.payload,
        timestamp: env.timestamp,
        timestampStr: formatTimestamp(env.timestamp),
        origin: env.origin,
      }));

    const initialLlms: RawLogEntry[] = this.chatState.llmHistory().map(log => ({
      type: log.type,
      payload: log.payload,
      timestamp: log.timestamp,
      timestampStr: formatTimestamp(log.timestamp),
    }));

    const merged = [...initialHosts, ...initialLlms];
    const deduped: RawLogEntry[] = [];
    const seen = new Set<string>();
    for (const entry of merged) {
      const key = `${entry.type}-${entry.timestamp}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(entry);
      }
    }
    deduped.sort((a, b) => b.timestamp - a.timestamp);
    this.messageHistory.set(deduped.slice(0, 100));

    this.hostComm.addListener(this.postMessageListener);

    effect(() => {
      const log = this.chatState.latestLlmLog();
      if (log) {
        this.addLogEntry({
          type: log.type,
          payload: log.payload,
          timestamp: log.timestamp,
          timestampStr: formatTimestamp(log.timestamp),
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
    this.chatState.clearRawLlmHistory();
    this.hostComm.clearHistoryBuffer();
  }

  ngOnDestroy(): void {
    this.hostComm.removeListener(this.postMessageListener);
  }

  protected isCollapsible(item: RawLogEntry): boolean {
    return (
      item.type !== PreviewBridgeMessageType.RENDERER_READY &&
      item.type !== PreviewBridgeMessageType.FORCE_UNBLOCK &&
      item.type !== PreviewBridgeMessageType.SET_BLOCKING_STATE
    );
  }

  private addLogEntry(entry: RawLogEntry): void {
    this.messageHistory.update(history => {
      if (history.some(h => h.timestamp === entry.timestamp && h.type === entry.type)) {
        return history;
      }
      const newHistory = [entry, ...history];
      return newHistory.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
    });
  }
}
