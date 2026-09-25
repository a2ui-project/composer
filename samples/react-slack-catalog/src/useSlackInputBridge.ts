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

const INPUT_WRAPPER =
  '.slack_blocks_to_jsx__plain_text_input_element, .slack_blocks_to_jsx__date_picker_element';

/** Adapts the upstream preview's native controls to A2UI bindings and labels.
 * The library exposes neither input callbacks nor accessible field labels.
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
      control.setAttribute('aria-label', block.label.text);
      wrapper.removeAttribute('tabindex');
      if (block.element.type === 'plain_text_input' && control instanceof HTMLTextAreaElement) {
        const multiline = block.element.multiline === true;
        control.rows = multiline ? 3 : 1;
        control.dataset.slackMultiline = String(multiline);
        control.style.minHeight = multiline ? '80px' : '36px';
        control.style.height = multiline ? '100px' : '36px';
        control.style.resize = multiline ? 'vertical' : 'none';
        // Upstream always advertises Enter-to-submit, including for our
        // on-character-change inputs. These fields save through the binding.
        for (const hint of wrapper.closest('.slack_blocks_to_jsx__input')?.querySelectorAll('p') ??
          []) {
          if (hint.textContent === "↵ Please 'enter' to submit") {
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
