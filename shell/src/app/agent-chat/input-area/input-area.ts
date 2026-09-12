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

import {Component, ElementRef, computed, input, output, signal, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {
  getMaterialFileIcon,
  inferMimeType,
  isImageAttachment,
} from '../../chat/a2a/a2a-attachments';
import {UiAttachedImage} from '../chat-message/types';

export interface SendMessageEvent {
  text: string;
  images: UiAttachedImage[];
}

/**
 * Largest attachment accepted, in bytes.
 *
 * Attachments are base64 encoded and held in memory until the message is sent,
 * so an unbounded file would cost roughly 4/3 of its size on the client and
 * again on every hop to the agent.
 */
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

/** `MAX_ATTACHMENT_BYTES` in mebibytes, for use in messages to the user. */
const MAX_ATTACHMENT_MIB = MAX_ATTACHMENT_BYTES / (1024 * 1024);

/** Largest number of attachments a single message may carry. */
const MAX_ATTACHMENTS = 10;

/** One attachment as rendered in the input area's chip tray. */
interface AttachmentChip {
  /** File name shown on the chip. */
  readonly name: string;
  /** Material Symbols glyph shown on the chip. */
  readonly icon: string;
}

/** The files of a selection that may be attached, and why the rest may not. */
interface AcceptedFiles {
  /** Files that passed the size and count limits. */
  readonly files: readonly File[];
  /** One message per rejected file, for display to the user. */
  readonly errors: readonly string[];
}

/** The attachments read from a selection, and why the rest could not be. */
interface ReadAttachments {
  /** Attachments the browser could read. */
  readonly attachments: readonly UiAttachedImage[];
  /** One message per unreadable file, for display to the user. */
  readonly errors: readonly string[];
}

/**
 * Message input component for Agent Chat, supporting multi-line typing,
 * file attachments, keyboard shortcuts, and stream cancellation.
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

  /** Emitted when the user submits a text message and optional file attachments. */
  readonly sendMessage = output<SendMessageEvent>();
  /** Emitted when the user clicks the stop button to abort response generation. */
  readonly stopGeneration = output<void>();

  protected readonly inputText = signal<string>('');
  protected readonly attachedImages = signal<UiAttachedImage[]>([]);
  /** Why the last file selection was partly or wholly rejected, if it was. */
  protected readonly attachmentError = signal<string>('');

  /**
   * Chips for the attachment tray.
   *
   * Resolving the icon here rather than in the template keeps it off the
   * change detection path, where it would rerun for every attachment on every
   * cycle.
   */
  protected readonly attachmentChips = computed<AttachmentChip[]>(() =>
    this.attachedImages().map(attachment => ({
      name: attachment.name,
      icon: getMaterialFileIcon(attachment.mimeType, attachment.name),
    })),
  );

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
    this.attachmentError.set('');
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

  /**
   * Attaches the files chosen in the file picker.
   *
   * Every file type is accepted; which of them an agent understands is the
   * agent's concern. Selections are capped instead by `MAX_ATTACHMENT_BYTES`
   * and `MAX_ATTACHMENTS`, and anything rejected is reported through
   * `attachmentError` rather than dropped silently.
   */
  protected async handleFileSelection(event: Event): Promise<void> {
    const fileInput = event.target as HTMLInputElement;
    const selected = Array.from(fileInput.files ?? []);
    // Clear the picker up front so choosing the same file again still fires a
    // change event.
    fileInput.value = '';
    if (selected.length === 0) {
      return;
    }

    const accepted = this.selectAcceptableFiles(selected);
    const read = await this.readAttachments(accepted.files);
    if (read.attachments.length > 0) {
      this.attachedImages.update(current => [...current, ...read.attachments]);
    }
    this.attachmentError.set([...accepted.errors, ...read.errors].join(' '));
  }

  /** Applies the size and count limits to the files the user chose. */
  private selectAcceptableFiles(selected: readonly File[]): AcceptedFiles {
    const errors: string[] = [];
    const smallEnough = selected.filter(file => {
      if (file.size <= MAX_ATTACHMENT_BYTES) {
        return true;
      }
      errors.push(`"${file.name}" is larger than ${MAX_ATTACHMENT_MIB} MiB.`);
      return false;
    });

    const freeSlots = Math.max(0, MAX_ATTACHMENTS - this.attachedImages().length);
    if (smallEnough.length > freeSlots) {
      errors.push(`A message can carry at most ${MAX_ATTACHMENTS} attachments.`);
    }
    return {files: smallEnough.slice(0, freeSlots), errors};
  }

  /**
   * Reads every accepted file.
   *
   * Reads run in parallel so the tray renders once rather than once per file.
   */
  private async readAttachments(files: readonly File[]): Promise<ReadAttachments> {
    const results = await Promise.all(files.map(file => this.readAttachment(file)));
    const attachments: UiAttachedImage[] = [];
    const errors: string[] = [];
    results.forEach((attachment, index) => {
      if (attachment) {
        attachments.push(attachment);
      } else {
        errors.push(`"${files[index].name}" could not be read.`);
      }
    });
    return {attachments, errors};
  }

  protected removeAttachedImage(index: number): void {
    this.attachedImages.update(imgs => imgs.filter((_, i) => i !== index));
    this.attachmentError.set('');
  }

  /**
   * Reads one file into an attachment.
   *
   * @return The attachment, or null if the browser could not read the file.
   */
  private async readAttachment(file: File): Promise<UiAttachedImage | null> {
    const data = await this.readFileAsBase64(file);
    if (data === null) {
      return null;
    }
    // Browsers report no type for extensions they do not know, such as .docx
    // on some platforms, so fall back to the extension.
    const mimeType = inferMimeType(file.name, file.type);
    return {
      name: file.name,
      mimeType,
      data,
      previewUrl: isImageAttachment(mimeType, file.name)
        ? `data:${mimeType};base64,${data}`
        : undefined,
    };
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

  /**
   * Reads `file` as base64 text.
   *
   * @return The base64 payload, or null when the browser reported a read
   *     error. Read errors are a property of the file, not a fault of the
   *     caller, so they are reported in the result rather than thrown.
   */
  private readFileAsBase64(file: File): Promise<string | null> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // A data URL read yields a string; anything else is not usable.
        resolve(typeof result === 'string' ? result.split(',')[1] || '' : null);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }
}
