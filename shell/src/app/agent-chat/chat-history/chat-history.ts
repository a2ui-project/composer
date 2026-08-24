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
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RenderA2uiItem} from 'a2ui-bridge';
import {A2aChatMessage} from '../chat-message/chat-message';
import {DEFAULT_A2A_ICON_URL} from '../converters/a2a-ui-converter';
import {UiAgentInfo, UiMessage} from '../types';

/**
 * Scrollable chat stream viewport displaying conversation turns, welcome showcase,
 * connecting spinner, and quick-action prompt suggestions.
 */
@Component({
  selector: 'a2ui-composer-chat-history',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    A2aChatMessage,
  ],
  templateUrl: './chat-history.ng.html',
  styleUrl: './chat-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A2aChatHistory implements AfterViewChecked {
  /** Chronological list of UI messages rendered in the conversation timeline. */
  readonly messages = input<UiMessage[]>([]);
  /** Agent metadata and capability badges to display in the empty showcase state. */
  readonly agentInfo = input<UiAgentInfo | null>(null);
  /** Whether the agent is currently streaming response tokens. */
  readonly isStreaming = input<boolean>(false);
  /** Whether the initial handshake or connection to the agent is in progress. */
  readonly isConnecting = input<boolean>(false);
  /** Configured endpoint URL string to display in the connecting showcase. */
  readonly endpoint = input<string>('');
  /** Whether the A2UI surface canvas column is currently visible. */
  readonly isCanvasOpen = input<boolean>(false);

  /** Emitted when the user clicks a sample prompt chip in the welcome showcase. */
  readonly samplePromptClicked = output<string>();
  /** Emitted when the user requests to render an A2UI payload on Canvas. */
  readonly openCanvas = output<RenderA2uiItem[]>();
  /** Emitted when the user closes the Canvas panel. */
  readonly closeCanvas = output<void>();
  /** Emitted when the user clicks to open the protocol inspector drawer. */
  readonly openInspector = output<void>();

  protected readonly scrollContainerRef = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  private shouldAutoScroll = true;

  ngAfterViewChecked(): void {
    if (this.shouldAutoScroll) {
      this.scrollToLatestMessage();
    }
  }

  protected handleViewportScroll(): void {
    const el = this.scrollContainerRef()?.nativeElement;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    this.shouldAutoScroll = atBottom;
  }

  protected scrollToLatestMessage(): void {
    const el = this.scrollContainerRef()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  protected getAgentIconUrl(): string {
    return this.agentInfo()?.iconUrl || DEFAULT_A2A_ICON_URL;
  }

  protected getAgentDisplayName(): string {
    return this.agentInfo()?.name || 'Agent';
  }
}
