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
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {PendingRpcRegistry, PendingRpcEntry, PendingRpcStatus} from '../pending-rpc-registry';

/**
 * Interactive form embedded in Debug Events log allowing developers to inspect
 * pending callAgentFunction invocations, observe timeout countdowns, and reply
 * manually with custom JSON/string values or error responses.
 */
@Component({
  selector: 'a2ui-composer-rpc-reply-form',
  standalone: true,
  templateUrl: './rpc-reply-form.ng.html',
  styleUrl: './rpc-reply-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RpcReplyForm implements OnInit {
  private readonly registry = inject(PendingRpcRegistry);
  private readonly destroyRef = inject(DestroyRef);

  readonly rpc = input.required<PendingRpcEntry>();

  protected readonly valueInput = signal<string>('');
  protected readonly errorCodeInput = signal<string>('');
  protected readonly errorMessageInput = signal<string>('');
  protected readonly validationError = signal<string | null>(null);

  private readonly tickSignal = signal<number>(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly status = computed<PendingRpcStatus>(() => {
    this.tickSignal();
    this.registry.stateVersion();
    const live = this.registry.getRpc(this.rpc().functionCallId);
    return live ? live.status : this.rpc().status;
  });

  protected readonly isPending = computed<boolean>(() => this.status() === 'pending');

  protected readonly remainingSeconds = computed<number>(() => {
    this.tickSignal();
    this.registry.stateVersion();
    const rem = this.registry.getRemainingMs(this.rpc().functionCallId);
    return Math.ceil(rem / 1000);
  });

  protected readonly badgeLabel = computed<string>(() => {
    switch (this.status()) {
      case 'replied':
        return 'Replied';
      case 'rejected':
        return 'Rejected';
      case 'timed_out':
        return 'Timed out';
      default:
        return '';
    }
  });

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      if (!this.isPending() && this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        return;
      }
      if (this.isPending()) {
        this.tickSignal.update(t => t + 1);
      }
    }, 500);

    this.destroyRef.onDestroy(() => {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    });
  }

  protected onValueInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.valueInput.set(target.value);
    if (this.validationError()) {
      this.validationError.set(null);
    }
  }

  protected onErrorCodeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.errorCodeInput.set(target.value);
  }

  protected onErrorMessageInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.errorMessageInput.set(target.value);
  }

  protected onReplyValue(): void {
    const raw = this.valueInput();
    const trimmed = raw.trim();

    let resolvedValue: unknown;

    if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('"')) {
      try {
        resolvedValue = JSON.parse(trimmed);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'Invalid JSON object or array structure.';
        this.validationError.set(`Malformed JSON: ${errorMsg}`);
        return;
      }
    } else {
      try {
        resolvedValue = JSON.parse(trimmed);
      } catch {
        resolvedValue = raw;
      }
    }

    this.validationError.set(null);
    this.registry.replyValue(this.rpc().functionCallId, resolvedValue);
  }

  protected onReplyError(): void {
    this.validationError.set(null);
    const code = this.errorCodeInput();
    const message = this.errorMessageInput();
    this.registry.replyError(this.rpc().functionCallId, code, message);
  }
}
