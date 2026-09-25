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
import {MatMenuHarness} from '@angular/material/menu/testing';

/**
 * Harness for interacting with the chat drawer view.
 * Exposes visual locator assertions and text modifier actions.
 */
export class CopilotKitChatPanelHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-chat-panel';

  protected getPromptInput = this.locatorForOptional(MatInputHarness);
  protected getSubmitButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.send-button'}),
  );
  protected getAddPromptMenu = this.locatorFor(
    MatMenuHarness.with({selector: '.add-prompt-button'}),
  );
  protected getStopButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.stop-button'}),
  );

  async getRendererLabel(): Promise<string> {
    return (await this.locatorFor('.renderer-selector-label')()).text();
  }

  async isRendererSelectorDisabled(): Promise<boolean> {
    return (
      await this.locatorFor(MatButtonHarness.with({selector: '.renderer-selector'}))()
    ).isDisabled();
  }

  async selectRenderer(name: string): Promise<void> {
    const menu = await this.locatorFor(MatMenuHarness.with({selector: '.renderer-selector'}))();
    await menu.open();
    await menu.clickItem({text: new RegExp(name)});
  }

  async getRendererChoices(): Promise<{label: string; selected: boolean}[]> {
    const menu = await this.locatorFor(MatMenuHarness.with({selector: '.renderer-selector'}))();
    await menu.open();
    const items = await menu.getItems();
    const choices = await Promise.all(
      items.map(async item => ({
        label: await item.getText(),
        selected: (await (await item.host()).getAttribute('aria-checked')) === 'true',
      })),
    );
    await menu.close();
    return choices;
  }

  async getRendererFeedback(): Promise<string | null> {
    const feedback = await this.locatorForOptional('.renderer-feedback')();
    return feedback ? feedback.text() : null;
  }

  async getAddPromptActions(): Promise<{text: string; disabled: boolean}[]> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    const items = await menu.getItems();
    const actions = await Promise.all(
      items.map(async item => ({text: await item.getText(), disabled: await item.isDisabled()})),
    );
    await menu.close();
    return actions;
  }

  async clickAttachFiles(): Promise<void> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    await menu.clickItem({text: /Attach files/});
  }

  async getAddPromptDescription(): Promise<string | null> {
    return (await this.locatorFor('.add-prompt-button')()).getAttribute('aria-description');
  }

  /** Confirms the controlled CopilotKit view is the visible chat surface. */
  async hasCopilotChatView(): Promise<boolean> {
    return (await this.locatorForOptional('copilot-chat-view')()) !== null;
  }

  /** Reads the actual CopilotKit message primitives rendered for conversational turns. */
  async getCopilotMessageRoles(): Promise<string[]> {
    const messages = await this.locatorForAll('[data-message-role]')();
    return Promise.all(
      messages.map(async message => (await message.getAttribute('data-message-role')) || ''),
    );
  }

  /** Checks the parser recovery action without accessing the fixture DOM. */
  async hasParseErrorAction(): Promise<boolean> {
    return (await this.locatorForOptional('.parse-error-card button')()) !== null;
  }

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

  async clickStop(): Promise<void> {
    const btn = await this.getStopButton();
    if (!btn) throw new Error('Stop button not found.');
    await btn.click();
  }

  async hasStopButton(): Promise<boolean> {
    const btn = await this.getStopButton();
    return btn !== null;
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
    const notice = await this.locatorForOptional('[data-testid="copilot-welcome-screen"]')();
    return notice !== null;
  }

  /**
   * Retrieves the empty state card welcome notice text content.
   */
  async getWelcomeNoticeText(): Promise<string | null> {
    const notice = await this.locatorForOptional('[data-testid="copilot-welcome-screen"]')();
    if (!notice) return null;
    return notice.text();
  }
  async clickSystemInstructionsLink(): Promise<void> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    await menu.clickItem({text: /Instructions/});
  }

  async hasSystemInstructionsLink(): Promise<boolean> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    const items = await menu.getItems({text: /Instructions/});
    await menu.close();
    return items.length > 0;
  }

  async getSystemInstructionsLinkText(): Promise<string | null> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    const label = await this.documentRootLocatorFactory().locatorForOptional(
      '.system-instructions-link .system-instructions-label',
    )();
    const text = label ? (await label.text()).trim() : null;
    await menu.close();
    return text;
  }

  async clickCustomInstructionsLink(): Promise<void> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    await menu.clickItem({text: /Custom Instructions/});
  }

  async hasCustomInstructionsLink(): Promise<boolean> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    const items = await menu.getItems({text: /Custom Instructions/});
    await menu.close();
    return items.length > 0;
  }

  async getCustomInstructionsLinkText(): Promise<string | null> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    const label = await this.documentRootLocatorFactory().locatorForOptional(
      '.custom-instructions-link .custom-instructions-label',
    )();
    const text = label ? (await label.text()).trim() : null;
    await menu.close();
    return text;
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
    const turns = await this.locatorForAll(ChatTurnHarness)();
    return turns[index].hasErrorDetails();
  }

  async getErrorDetailsTextAt(index: number): Promise<string | null> {
    const turns = await this.locatorForAll(ChatTurnHarness)();
    return turns[index].getErrorDetailsText();
  }

  async toggleErrorDetailsAt(index: number): Promise<void> {
    const turns = await this.locatorForAll(ChatTurnHarness)();
    await turns[index].toggleErrorDetails();
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

  async hasScreenshotCheckbox(): Promise<boolean> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    const items = await menu.getItems({text: /Include screenshot/});
    const role = items.length ? await (await items[0].host()).getAttribute('role') : null;
    await menu.close();
    return role === 'menuitemcheckbox';
  }

  async isScreenshotChecked(): Promise<boolean> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    const items = await menu.getItems({text: /Include screenshot/});
    const checked = items.length
      ? await (await items[0].host()).getAttribute('aria-checked')
      : null;
    await menu.close();
    return checked === 'true';
  }

  async toggleScreenshot(): Promise<void> {
    const menu = await this.getAddPromptMenu();
    await menu.open();
    await menu.clickItem({text: /Include screenshot/});
  }

  async hasParseErrorCard(): Promise<boolean> {
    const card = await this.locatorForOptional('.parse-error-card')();
    return card !== null;
  }

  async getParseErrorCardAttributes(): Promise<{role: string | null; ariaLive: string | null}> {
    const card = await this.locatorForOptional('.parse-error-card')();
    if (!card) return {role: null, ariaLive: null};
    const role = await card.getAttribute('role');
    const ariaLive = await card.getAttribute('aria-live');
    return {role, ariaLive};
  }

  async getParseErrorText(): Promise<string | null> {
    const card = await this.locatorForOptional('.parse-error-card')();
    if (!card) return null;
    return card.text();
  }

  async clickParseErrorDetailsButton(): Promise<void> {
    const btn = await this.locatorForOptional('.parse-error-card button')();
    if (!btn) throw new Error('Parse error details button not found.');
    await btn.click();
  }
}

class ChatTurnHarness extends ComponentHarness {
  static hostSelector = '.chat-bubble-container';

  async hasErrorDetails(): Promise<boolean> {
    return (await this.locatorForOptional('.error-details')()) !== null;
  }

  async getErrorDetailsText(): Promise<string | null> {
    const details = await this.locatorForOptional('.error-details pre')();
    return details ? details.text() : null;
  }

  async toggleErrorDetails(): Promise<void> {
    await (await this.locatorFor('.error-details summary')()).click();
  }
}
