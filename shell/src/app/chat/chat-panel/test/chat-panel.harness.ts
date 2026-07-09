/**
 * @license
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
import {MatInputHarness} from '@angular/material/input/testing';
import {MatButtonHarness} from '@angular/material/button/testing';

/**
 * Harness for interacting with the chat drawer view.
 * Exposes visual locator assertions and text modifier actions.
 */
export class ChatPanelHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-chat-panel';

  protected getPromptInput = this.locatorForOptional(MatInputHarness);
  protected getSubmitButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.submit-button'}),
  );

  async getBubblesText(): Promise<string[]> {
    const bubbles = await this.locatorForAll('.bubble-body')();
    return Promise.all(bubbles.map(b => b.text()));
  }

  async getBubbleHeaders(): Promise<string[]> {
    const headers = await this.locatorForAll('.bubble-author-name')();
    return Promise.all(headers.map(h => h.text()));
  }

  async getBubbleTypes(): Promise<string[]> {
    const bubbles = await this.locatorForAll('.chat-bubble-container')();
    return Promise.all(
      bubbles.map(async b => {
        if (await b.hasClass('bubble-user')) {
          if (await b.hasClass('bubble-layout')) {
            return 'layout-snapshot';
          }
          return 'human-text';
        }
        if (await b.hasClass('bubble-model')) {
          return 'model-response';
        }
        if (await b.hasClass('bubble-error')) {
          return 'diagnostic-error';
        }
        return 'unknown';
      }),
    );
  }

  async getPromptText(): Promise<string> {
    const input = await this.getPromptInput();
    if (!input) return '';
    return input.getValue();
  }

  async setPromptText(text: string): Promise<void> {
    const input = await this.getPromptInput();
    if (!input) throw new Error('Prompt input field not found.');
    await input.setValue(text);
  }

  async clickSubmit(): Promise<void> {
    const btn = await this.getSubmitButton();
    if (!btn) throw new Error('Submit button not found.');
    await btn.click();
  }

  async isSubmitDisabled(): Promise<boolean> {
    const btn = await this.getSubmitButton();
    if (!btn) return true;
    return btn.isDisabled();
  }

  async isPromptDisabled(): Promise<boolean> {
    const input = await this.getPromptInput();
    if (!input) return true;
    return input.isDisabled();
  }

  async hasLoadingOverlay(): Promise<boolean> {
    const overlay = await this.locatorForOptional('.pipeline-overlay')();
    return overlay !== null;
  }

  async getLoadingOverlayText(): Promise<string | null> {
    const textNode = await this.locatorForOptional('.status-badge-text')();
    if (!textNode) return null;
    return textNode.text();
  }

  /**
   * Simulates keydowns natively on the prompt input element.
   *
   * @param key The keyboard key identifier to press.
   * @param modifiers Key modifier flags like shift.
   */
  async pressKeyOnPrompt(key: string, modifiers?: {shiftKey?: boolean}): Promise<void> {
    const input = await this.getPromptInput();
    if (!input) throw new Error('Prompt input field not found.');
    const host = await input.host();
    await host.dispatchEvent('keydown', {
      key,
      shiftKey: !!modifiers?.shiftKey,
    });
  }

  /**
   * Clicks and dismisses the loading pipeline overlay manually.
   */
  async dismissLoadingOverlay(): Promise<void> {
    const overlay = await this.locatorForOptional('.pipeline-overlay')();
    if (!overlay) throw new Error('Pipeline overlay not found.');
    await overlay.click();
  }

  /**
   * Checks if the welcome empty state card notice is shown.
   */
  async hasWelcomeNotice(): Promise<boolean> {
    const notice = await this.locatorForOptional('.empty-state-notice')();
    return notice !== null;
  }

  /**
   * Retrieves the empty state card welcome notice text content.
   */
  async getWelcomeNoticeText(): Promise<string | null> {
    const notice = await this.locatorForOptional('.empty-state-notice')();
    if (!notice) return null;
    return notice.text();
  }
  async clickSystemInstructionsLink(): Promise<void> {
    const link = await this.locatorFor('.system-instructions-link')();
    await link.click();
  }

  async hasSystemInstructionsLink(): Promise<boolean> {
    const link = await this.locatorForOptional('.system-instructions-link')();
    return link !== null;
  }

  async getRetryButtonsCount(): Promise<number> {
    const buttons = await this.locatorForAll('.retry-button')();
    return buttons.length;
  }

  async clickRetryButtonAt(index: number): Promise<void> {
    const buttons = await this.locatorForAll('.retry-button')();
    if (index < 0 || index >= buttons.length) {
      throw new Error(`Index ${index} out of bounds for retry buttons!`);
    }
    await buttons[index].click();
  }

  async getPipelineOverlayAttributes(): Promise<{
    role: string | null;
    tabindex: string | null;
    ariaLabel: string | null;
  }> {
    const overlay = await this.locatorForOptional('.pipeline-overlay')();
    if (!overlay) return {role: null, tabindex: null, ariaLabel: null};
    return {
      role: await overlay.getAttribute('role'),
      tabindex: await overlay.getAttribute('tabindex'),
      ariaLabel: await overlay.getAttribute('aria-label'),
    };
  }

  async getIconsAriaHidden(): Promise<(string | null)[]> {
    const icons = await this.locatorForAll('mat-icon')();
    return Promise.all(icons.map(i => i.getAttribute('aria-hidden')));
  }

  async isDisabled(): Promise<boolean> {
    const panel = await this.locatorForOptional('.disabled-chat-panel')();
    return panel !== null;
  }

  async getDisabledNoticeText(): Promise<string | null> {
    const textNode = await this.locatorForOptional('.disabled-notice-text')();
    if (!textNode) return null;
    return textNode.text();
  }

  async hasAddKeyButton(): Promise<boolean> {
    const btn = await this.locatorForOptional('.add-key-button')();
    return btn !== null;
  }

  async clickAddKeyButton(): Promise<void> {
    const btn = await this.locatorForOptional('.add-key-button')();
    if (!btn) throw new Error('Add API key button not found.');
    await btn.click();
  }

  async hasErrorDetailsAt(index: number): Promise<boolean> {
    const selector = `.chat-bubble-container:nth-child(${index + 1}) .error-details`;
    const details = await this.locatorForOptional(selector)();
    return details !== null;
  }

  async getErrorDetailsTextAt(index: number): Promise<string | null> {
    const selector = `.chat-bubble-container:nth-child(${index + 1}) .error-details pre`;
    const pre = await this.locatorForOptional(selector)();
    if (!pre) return null;
    return pre.text();
  }

  async toggleErrorDetailsAt(index: number): Promise<void> {
    const selector = `.chat-bubble-container:nth-child(${index + 1}) .error-details summary`;
    const summary = await this.locatorForOptional(selector)();
    if (!summary) throw new Error(`Error details summary not found for bubble ${index}.`);
    await summary.click();
  }

  async isRedactedTextItalicizedAt(index: number): Promise<boolean> {
    const bubbles = await this.locatorForAll('.bubble-body')();
    if (index < 0 || index >= bubbles.length) {
      throw new Error(`Index ${index} out of bounds!`);
    }
    const html = await bubbles[index].getProperty<string>('innerHTML');
    return (
      html.includes('<i>redacted for your protection</i>') ||
      html.includes('<em>redacted for your protection</em>')
    );
  }

  async hasAttachmentPreviews(): Promise<boolean> {
    const previews = await this.locatorForOptional('.attachment-previews')();
    return previews !== null;
  }

  async getAttachmentNames(): Promise<string[]> {
    const names = await this.locatorForAll('.attachment-preview-card .attachment-name')();
    return Promise.all(names.map(n => n.text()));
  }

  async clickRemoveAttachmentAt(index: number): Promise<void> {
    const buttons = await this.locatorForAll(
      '.attachment-preview-card .remove-attachment-button',
    )();
    if (index < 0 || index >= buttons.length) {
      throw new Error(`Index ${index} out of bounds for remove attachment buttons!`);
    }
    await buttons[index].click();
  }
}
