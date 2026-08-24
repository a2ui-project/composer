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
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RenderA2uiItem} from 'a2ui-bridge';
import {renderMarkdown} from '../../utils/markdown';
import {DEFAULT_A2A_ICON_URL} from '../converters/a2a-ui-converter';
import {UiMessage} from '../types';

/**
 * Message bubble item rendering textual responses, markdown, thinking blocks,
 * tool calls, attachments, and embedded inline A2UI surfaces.
 */
@Component({
  selector: 'a2ui-composer-chat-message',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './chat-message.ng.html',
  styleUrl: './chat-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A2aChatMessage {
  private readonly sanitizer = inject(DomSanitizer);

  /** UI message object containing sender role, text, thinking trace, and optional A2UI payload. */
  readonly message = input.required<UiMessage>();
  /** URL for the agent's display avatar icon. */
  readonly agentIconUrl = input<string>(DEFAULT_A2A_ICON_URL);
  /** Display name of the agent. */
  readonly agentName = input<string>('Agent');
  /** Whether the A2UI surface canvas is currently open. */
  readonly isCanvasOpen = input<boolean>(false);

  /** Emitted when the user clicks the card button to view this message's A2UI payload in Canvas. */
  readonly openCanvas = output<RenderA2uiItem[]>();
  /** Emitted when the user clicks the close canvas button on the active message card. */
  readonly closeCanvas = output<void>();
  /** Emitted when the user clicks to open the protocol message inspector. */
  readonly openInspector = output<void>();

  protected readonly isThinkingExpanded = signal<boolean>(false);

  protected readonly formattedContent = computed<SafeHtml>(() => {
    const rawText = this.message().text || '';
    if (!rawText.trim()) return '';
    const html = renderMarkdown(rawText);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  protected readonly formattedThinking = computed<SafeHtml>(() => {
    const raw = this.message().thinking || '';
    if (!raw.trim()) return '';
    const html = renderMarkdown(raw);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  protected readonly formattedTime = computed<string>(() => {
    const ts = this.message().timestamp;
    const d = new Date(ts);
    return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  });

  protected readonly isPending = computed<boolean>(() => {
    const m = this.message();
    return (
      m.isStreaming === true &&
      !m.text &&
      !m.thinking &&
      (!m.a2uiPayload || m.a2uiPayload.length === 0)
    );
  });

  protected toggleThinkingExpansion(): void {
    this.isThinkingExpanded.update(v => !v);
  }

  protected openCanvasArtifact(): void {
    const payload = this.message().a2uiPayload;
    if (payload && payload.length > 0) {
      this.openCanvas.emit(payload);
    }
  }
}
