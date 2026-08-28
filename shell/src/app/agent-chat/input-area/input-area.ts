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

import {Component, ElementRef, input, output, signal, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {UiAttachedImage} from '../chat-message/types';

export interface SendMessageEvent {
  text: string;
  images: UiAttachedImage[];
}

/**
 * Message input component for Agent Chat, supporting multi-line typing,
 * image attachments, keyboard shortcuts, and stream cancellation.
 */
@Component({
  selector: 'a2ui-composer-input-area',
  imports: [FormsModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './input-area.ng.html',
  styleUrl: './input-area.scss',
})
export class A2aInputArea {
  /** Whether the input area and controls are disabled. */
  readonly disabled = input<boolean>(false);
  /** Whether an active response stream is currently in progress. */
  readonly isStreaming = input<boolean>(false);
  /** Placeholder text to display in the prompt textarea. */
  readonly placeholder = input<string>('Ask your agent anything...');

  /** Emitted when the user submits a text message and optional image attachments. */
  readonly sendMessage = output<SendMessageEvent>();
  /** Emitted when the user clicks the stop button to abort response generation. */
  readonly stopGeneration = output<void>();

  protected readonly inputText = signal<string>('');
  protected readonly attachedImages = signal<UiAttachedImage[]>([]);

  protected readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');
  protected readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitPrompt();
    }
  }

  protected submitPrompt(): void {
    const text = this.inputText().trim();
    const images = this.attachedImages();

    if ((!text && images.length === 0) || this.disabled() || this.isStreaming()) {
      return;
    }

    this.sendMessage.emit({
      text,
      images,
    });

    this.inputText.set('');
    this.attachedImages.set([]);
    const ta = this.textareaRef()?.nativeElement;
    if (ta) {
      ta.value = '';
    }
    this.adjustTextareaHeight();
  }

  protected cancelGeneration(): void {
    this.stopGeneration.emit();
  }

  protected openFilePicker(): void {
    this.fileInputRef()?.nativeElement.click();
  }

  protected async handleFileSelection(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      const base64 = await this.readFileAsBase64(file);
      this.attachedImages.update(imgs => [
        ...imgs,
        {
          name: file.name,
          mimeType: file.type,
          data: base64,
          previewUrl: `data:${file.type};base64,${base64}`,
        },
      ]);
    }

    input.value = '';
  }

  protected removeAttachedImage(index: number): void {
    this.attachedImages.update(imgs => imgs.filter((_, i) => i !== index));
  }

  protected handleTextInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.inputText.set(target.value);
    this.adjustTextareaHeight();
  }

  private adjustTextareaHeight(): void {
    const ta = this.textareaRef()?.nativeElement;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        const base64 = res.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
