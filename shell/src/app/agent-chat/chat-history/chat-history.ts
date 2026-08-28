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
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RenderA2uiItem} from 'a2ui-bridge';
import {AgentCard} from '../../chat/a2a/a2a-types';
import {A2aChatMessage} from '../chat-message/chat-message';
import {DEFAULT_A2A_ICON_URL} from '../converters/a2a-ui-converter';
import {UiAgentInfo} from '../agent-header/types';
import {UiMessage} from '../chat-message/types';

/**
 * Scrollable chat stream viewport displaying conversation turns, welcome showcase,
 * connecting spinner, and quick-action prompt suggestions.
 */
@Component({
  selector: 'a2ui-composer-chat-history',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    A2aChatMessage,
  ],
  templateUrl: './chat-history.ng.html',
  styleUrl: './chat-history.scss',
})
export class A2aChatHistory implements AfterViewChecked {
  /** Chronological list of UI messages rendered in the conversation timeline. */
  readonly messages = input<UiMessage[]>([]);
  /** Agent metadata and capability badges to display in the empty showcase state. */
  readonly agentInfo = input<UiAgentInfo | null>(null);
  /** Optional raw agent card discovery manifest. */
  readonly agentCard = input<AgentCard | null>(null);
  /** Whether the agent is currently streaming response tokens. */
  readonly isStreaming = input<boolean>(false);
  /** Whether the initial handshake or connection to the agent is in progress. */
  readonly isConnecting = input<boolean>(false);
  /** Configured endpoint URL string to display in the connecting showcase. */
  readonly endpoint = input<string>('');
  /** Whether the A2UI surface canvas column is currently visible. */
  readonly isCanvasOpen = input<boolean>(false);
  /** The currently active Canvas payload displayed in the RHS panel, if any. */
  readonly activeCanvasPayload = input<RenderA2uiItem[] | null>(null);

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
  private lastScrollTop = 0;
  private previousMessageCount = 0;

  constructor() {
    effect(() => {
      const currentCount = this.messages().length;
      if (currentCount > this.previousMessageCount) {
        const lastMsg = this.messages()[currentCount - 1];
        if (lastMsg?.sender === 'user') {
          this.shouldAutoScroll = true;
          this.scrollToLatestMessage();
        }
      }
      this.previousMessageCount = currentCount;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldAutoScroll) {
      this.scrollToLatestMessage();
    }
  }

  protected handleWheel(event: WheelEvent): void {
    if (event.deltaY < 0) {
      // User explicitly scrolled upward: immediately release auto-scroll lock
      this.shouldAutoScroll = false;
    }
  }

  protected handleTouchStart(): void {
    // User touch interaction releases auto-scroll until bottom is reached
    this.shouldAutoScroll = false;
  }

  protected handleViewportScroll(): void {
    const el = this.scrollContainerRef()?.nativeElement;
    if (!el) return;

    const currentScrollTop = el.scrollTop;
    const isScrollingUp = currentScrollTop < this.lastScrollTop;
    this.lastScrollTop = currentScrollTop;

    const distanceToBottom = el.scrollHeight - currentScrollTop - el.clientHeight;
    if (isScrollingUp) {
      this.shouldAutoScroll = false;
    } else {
      this.shouldAutoScroll = distanceToBottom < 30;
    }
  }

  protected scrollToLatestMessage(): void {
    const el = this.scrollContainerRef()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  protected getAgentIconUrl(): string {
    return this.agentInfo()?.iconUrl || this.agentCard()?.iconUrl || DEFAULT_A2A_ICON_URL;
  }

  protected getAgentDisplayName(): string {
    return this.agentInfo()?.name || this.agentCard()?.name || 'Agent';
  }
}
