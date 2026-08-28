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

import {Component, computed, input, output, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTooltipModule} from '@angular/material/tooltip';
import {formatJson} from '../../utils/json';
import {MessageInspectorEvent} from './message-inspector-event';

/**
 * Side-drawer diagnostic inspector for observing, filtering, and copying
 * low-level A2A protocol JSON events.
 */
@Component({
  selector: 'a2ui-composer-message-inspector',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatExpansionModule,
    MatTooltipModule,
  ],
  templateUrl: './message-inspector.ng.html',
  styleUrl: './message-inspector.scss',
})
export class A2aMessageInspector {
  /** Recorded raw A2A protocol events and JSON-RPC transport traces. */
  readonly events = input<MessageInspectorEvent[]>([]);
  /** Emitted when the user closes the message inspector side drawer. */
  readonly closeDrawer = output<void>();
  /** Emitted when the user clears all recorded inspector events. */
  readonly clearEvents = output<void>();

  protected readonly filterDirection = signal<'all' | 'sent' | 'received' | 'error'>('all');
  protected readonly searchQuery = signal<string>('');
  protected readonly copiedEventId = signal<string | null>(null);

  protected readonly filteredEvents = computed(() => {
    const list = this.events();
    const dir = this.filterDirection();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter(event => {
      if (dir !== 'all' && event.direction !== dir) {
        return false;
      }
      if (query) {
        const str = (event.summary + ' ' + JSON.stringify(event.payload)).toLowerCase();
        if (!str.includes(query)) {
          return false;
        }
      }
      return true;
    });
  });

  protected applyFilterDirection(dir: 'all' | 'sent' | 'received' | 'error'): void {
    this.filterDirection.set(dir);
  }

  protected handleSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  protected formatJsonPayload(payload: unknown): string {
    if (payload === undefined) return '';
    try {
      return formatJson(payload);
    } catch {
      return String(payload);
    }
  }

  protected getFormattedJsonLines(payload: unknown): Array<{lineNum: number; text: string}> {
    const formatted = this.formatJsonPayload(payload);
    const lines = formatted.split('\n');
    return lines.map((text, i) => ({
      lineNum: i + 1,
      text,
    }));
  }

  protected async copyEventJsonToClipboard(event: MessageInspectorEvent): Promise<void> {
    const jsonStr = this.formatJsonPayload(event.payload);
    try {
      await navigator.clipboard.writeText(jsonStr);
      this.copiedEventId.set(event.id);
      setTimeout(() => {
        if (this.copiedEventId() === event.id) {
          this.copiedEventId.set(null);
        }
      }, 2000);
    } catch (e) {
      console.error('Failed to copy JSON to clipboard', e);
    }
  }

  protected formatEventTimestamp(timestamp: Date | number): string {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
