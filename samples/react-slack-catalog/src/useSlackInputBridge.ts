/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
 * The hint slack-blocks-to-jsx 1.1.2 prints under every plain-text input,
 * matched by its exact English text because the library gives it no class or
 * attribute. If a later version changes the wording, the hint simply shows
 * again under our inputs; nothing else breaks.
 */
const ENTER_TO_SUBMIT_HINT = "↵ Please 'enter' to submit";

/**
 * Connects the Slack inputs drawn by the Tightknit preview to A2UI data bindings.
 *
 * The preview draws inputs with slack-blocks-to-jsx 1.1.2
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
      // The library labels every text input "Select an item"; screen readers
      // should hear the input block's label instead.
      control.setAttribute('aria-label', block.label.text);
      // The library makes the wrapper focusable too, which puts an extra, unlabeled
      // stop before each field when tabbing through the form.
      wrapper.removeAttribute('tabindex');
      if (block.element.type === 'plain_text_input' && control instanceof HTMLTextAreaElement) {
        // The library ignores `multiline` and draws every text input as a 100px
        // textarea, so a shortText field would look like a longText one. Size it
        // from `multiline`, as Slack does; `onKeyDown` below stops Enter adding a
        // line to a single-line field.
        const multiline = block.element.multiline === true;
        control.rows = multiline ? 3 : 1;
        control.dataset.slackMultiline = String(multiline);
        control.style.minHeight = multiline ? '80px' : '36px';
        control.style.height = multiline ? '100px' : '36px';
        control.style.resize = multiline ? 'vertical' : 'none';
        // The library always tells the user to press Enter to submit. These inputs
        // save on every character (`on_character_entered`), and Enter submits
        // nothing, so the hint is wrong here.
        for (const hint of wrapper.closest('.slack_blocks_to_jsx__input')?.querySelectorAll('p') ??
          []) {
          if (hint.textContent === ENTER_TO_SUBMIT_HINT) {
            hint.hidden = true;
          }
        }
      }
    }
    // Shared bindings and rejected edits need an exceptional remount of the
    // upstream controls. Keep the user's cursor in the field they were editing.
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
