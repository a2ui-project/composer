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
  useLayoutEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type CompositionEvent,
  type KeyboardEvent,
} from 'react';
import {type KnownBlock, type InputBlock} from '@slack/types';

/**
 * The elements slack-blocks-to-jsx wraps each text input and date picker in. The
 * library sets the wrapper's `id` to the input's `action_id`.
 */
const INPUT_WRAPPER =
  '.slack_blocks_to_jsx__plain_text_input_element, .slack_blocks_to_jsx__date_picker_element';

/**
 * The hint slack-blocks-to-jsx 1.1.2 prints under every plain-text input
 * (https://github.com/themashcodee/slack-blocks-to-jsx/issues/121), matched
 * by its exact English text because the library gives it no class or
 * attribute. If a later version changes the wording, the hint simply shows
 * again under our inputs; nothing else breaks.
 */
const ENTER_TO_SUBMIT_HINT = "↵ Please 'enter' to submit";

/**
 * Connects the Slack inputs drawn by the Tightknit renderer (the `Renderer`
 * component of @tightknitai/storybook-addon-slack-block-kit) to A2UI data
 * bindings.
 *
 * The renderer draws inputs with slack-blocks-to-jsx 1.1.2
 * (github.com/themashcodee/slack-blocks-to-jsx), which keeps what the user types
 * in its own React state and offers no change callback. So this listens for
 * `change` events on the preview's section and sends each value to
 * `updateInput`. It also corrects, after each render, what that version draws
 * wrong; each fix is described where it's made. If an upgrade fixes one of
 * these, its correction here is harmless, but should be removed.
 *
 * @param resetKey Changes when the controls were recreated, so the fixes are
 *     applied to the new elements.
 * @return Props to spread onto the element that contains the preview.
 */
export function useSlackInputBridge(
  blocks: readonly KnownBlock[],
  updateInput: (actionId: string, value: string) => void,
  resetKey: string,
) {
  const ref = useRef<HTMLElement>(null);
  const pendingFocus = useRef<{
    control: HTMLInputElement | HTMLTextAreaElement;
    index: number;
    start: number | null;
    end: number | null;
  } | null>(null);
  const inputs = useMemo(
    () =>
      new Map(
        blocks
          .filter((block): block is InputBlock => block.type === 'input')
          .map(block => [block.element.action_id, block]),
      ),
    [blocks],
  );

  useLayoutEffect(() => {
    const wrappers = Array.from(ref.current?.querySelectorAll<HTMLElement>(INPUT_WRAPPER) ?? []);
    for (const wrapper of wrappers) {
      const block = inputs.get(wrapper.id);
      const control = wrapper.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        'input,textarea',
      );
      if (!block || !control) {
        continue;
      }
      // slack-blocks-to-jsx 1.1.2 names every text input "Select an item" and
      // every date picker "Select a date"; screen readers should hear the input
      // block's label instead.
      control.setAttribute('aria-label', block.label.text);
      // slack-blocks-to-jsx 1.1.2 makes a text input's wrapper focusable too,
      // which puts an extra, unlabeled stop before each field when tabbing
      // through the form.
      wrapper.removeAttribute('tabindex');
      if (block.element.type === 'plain_text_input' && control instanceof HTMLTextAreaElement) {
        // slack-blocks-to-jsx 1.1.2 ignores `multiline` and draws every text input
        // as a 100px textarea, so a shortText field would look like a longText
        // one (https://github.com/themashcodee/slack-blocks-to-jsx/issues/121).
        // Size it from `multiline`, as Slack does; `onKeyDown` below stops Enter
        // adding a line to a single-line field.
        const multiline = block.element.multiline === true;
        control.rows = multiline ? 3 : 1;
        control.dataset.slackMultiline = String(multiline);
        control.style.minHeight = multiline ? '80px' : '36px';
        control.style.height = multiline ? '100px' : '36px';
        control.style.resize = multiline ? 'vertical' : 'none';
        // slack-blocks-to-jsx 1.1.2 always tells the user to press Enter to
        // submit (issue 121 above). These inputs save on every character
        // (`on_character_entered`), and Enter submits nothing, so the hint is
        // wrong here.
        for (const hint of wrapper.closest('.slack_blocks_to_jsx__input')?.querySelectorAll('p') ??
          []) {
          if (hint.textContent === ENTER_TO_SUBMIT_HINT) {
            hint.hidden = true;
          }
        }
      }
    }
    // Typing normally leaves the library's controls in place, but two kinds of
    // edit change `resetKey`, and SlackPreviewRenderer then remounts all the
    // controls: an edit that also changes another input, because both are bound
    // to the same data path, and an edit the session rejects. The remount
    // replaces the field the user was typing in, so put their cursor back in
    // its replacement.
    const focus = pendingFocus.current;
    pendingFocus.current = null;
    if (focus && !focus.control.isConnected && document.activeElement === document.body) {
      const control = wrappers[focus.index]?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        'input,textarea',
      );
      control?.focus({preventScroll: true});
      if (control instanceof HTMLTextAreaElement && focus.start !== null && focus.end !== null) {
        control.setSelectionRange(focus.start, focus.end);
      }
    }
  }, [inputs, resetKey]);

  const commitInput = (event: ChangeEvent<HTMLElement> | CompositionEvent<HTMLElement>) => {
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) {
      return;
    }
    const wrapper = control.closest<HTMLElement>(INPUT_WRAPPER);
    if (!wrapper || !event.currentTarget.contains(wrapper) || !inputs.has(wrapper.id)) {
      return;
    }
    pendingFocus.current = {
      control,
      index: Array.from(inputs.keys()).indexOf(wrapper.id),
      start: control.selectionStart,
      end: control.selectionEnd,
    };
    updateInput(wrapper.id, control.value);
  };

  const onChange = (event: ChangeEvent<HTMLElement>) => {
    if ('isComposing' in event.nativeEvent && event.nativeEvent.isComposing) {
      return;
    }
    commitInput(event);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      event.key === 'Enter' &&
      !event.nativeEvent.isComposing &&
      event.target instanceof HTMLTextAreaElement &&
      event.target.dataset.slackMultiline === 'false'
    ) {
      event.preventDefault();
    }
  };

  return {ref, onChange, onKeyDown, onCompositionEnd: commitInput};
}
