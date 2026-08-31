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

import {ComponentHarness} from '@angular/cdk/testing';
import {MatButtonHarness} from '@angular/material/button/testing';

export class A2aChatMessageHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-chat-message';

  private getSenderName = this.locatorForOptional('.agent-badge-name');
  private getMessageText = this.locatorForOptional('.markdown-body, .user-message-bubble');
  private getThinkingHeader = this.locatorForOptional('.thinking-header');
  private getThinkingContent = this.locatorForOptional('.thinking-content');
  private getOpenCanvasButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.view-canvas-btn'}),
  );
  private getCloseCanvasButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.close-canvas-btn'}),
  );
  private getImageElements = this.locatorForAll('.msg-image-thumb');
  private getToolChips = this.locatorForAll('.tool-call-chip');
  private getPendingIndicator = this.locatorForOptional('.pending-response-indicator');
  private getStreamingCursor = this.locatorForOptional('.streaming-cursor');
  private getInlineSurface = this.locatorForOptional('.inline-surface-card');

  async hasInlineSurface(): Promise<boolean> {
    const el = await this.getInlineSurface();
    return el !== null;
  }

  async hasCanvasButton(): Promise<boolean> {
    const btn = await this.getOpenCanvasButton();
    return btn !== null;
  }

  async getCanvasButtonText(): Promise<string | null> {
    const btn = await this.getOpenCanvasButton();
    return btn ? btn.getText() : null;
  }

  async getSenderNameText(): Promise<string | null> {
    const el = await this.getSenderName();
    return el ? el.text() : null;
  }

  async getMessageContent(): Promise<string | null> {
    const el = await this.getMessageText();
    return el ? el.text() : null;
  }

  async hasThinking(): Promise<boolean> {
    const el = await this.getThinkingHeader();
    return el !== null;
  }

  async clickThinking(): Promise<void> {
    const el = await this.getThinkingHeader();
    if (el) {
      return el.click();
    }
  }

  async isThinkingExpanded(): Promise<boolean> {
    const el = await this.getThinkingContent();
    return el !== null;
  }

  async clickOpenCanvas(): Promise<void> {
    const btn = await this.getOpenCanvasButton();
    if (btn) {
      return btn.click();
    }
  }

  async clickCloseCanvas(): Promise<void> {
    const btn = await this.getCloseCanvasButton();
    if (btn) {
      return btn.click();
    }
  }

  async getImageCount(): Promise<number> {
    const images = await this.getImageElements();
    return images.length;
  }

  async getToolCallCount(): Promise<number> {
    const chips = await this.getToolChips();
    return chips.length;
  }

  async hasPendingIndicator(): Promise<boolean> {
    const el = await this.getPendingIndicator();
    return el !== null;
  }

  async hasStreamingCursor(): Promise<boolean> {
    const el = await this.getStreamingCursor();
    return el !== null;
  }
}
