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

import {DOCUMENT, NgTemplateOutlet} from '@angular/common';
import {Component, computed, inject, input, output, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RenderA2uiItem} from 'a2ui-bridge';
import {objectUrlFromSafeSource, setAnchorHref} from 'safevalues/dom';
import {
  decodeBase64,
  getMaterialFileIcon,
  inferMimeType,
  isImageAttachment,
  sanitizeDownloadFileName,
} from '../../chat/a2a/a2a-attachments';
import {RenderedFrame} from '../../preview/rendered/rendered-frame';
import {renderMarkdown} from '../../utils/markdown';
import {A2A_PROTOCOL_ICON_URL} from '../converters/a2a-ui-converter';
import {CanvasArtifact, UiAttachedImage, UiMessage} from './types';

/**
 * A user's explicit expand/collapse choice for the thinking accordion, tagged with the
 * content state the choice was made under.
 */
interface ManualThinkingToggle {
  readonly hadContent: boolean;
  readonly expanded: boolean;
}

/** One attachment of a message, prepared for rendering. */
interface AttachmentView {
  /** The attachment itself, passed back when the user downloads it. */
  readonly file: UiAttachedImage;
  /** Stable key for `@for` tracking. */
  readonly key: string;
  /** `src` of the inline preview, or '' when the attachment is not previewable. */
  readonly previewSrc: string;
  /** Material Symbols glyph shown on the download chip. */
  readonly icon: string;
}

/**
 * MIME type given to every downloaded attachment.
 *
 * The attachment's own type is agent controlled, and letting it decide how the
 * browser treats the file would allow, say, an HTML payload to be opened in
 * the page's origin rather than saved.
 */
const DOWNLOAD_MIME_TYPE = 'application/octet-stream';

/** Prefix of MIME types that may be previewed inline. */
const IMAGE_MIME_PREFIX = 'image/';

/**
 * Delay before a download's object URL is released.
 *
 * Browsers resolve the URL asynchronously after the click, so releasing it in
 * the same task cancels the download in some of them.
 */
const OBJECT_URL_REVOKE_DELAY_MS = 100;

/** URL prefixes accepted for a locally generated image preview. */
const LOCAL_PREVIEW_PREFIXES: readonly string[] = ['data:image/', 'blob:'];

/**
 * Returns the `src` of an attachment's inline preview, or '' if it has none.
 *
 * Only images are previewed, and only under an image MIME type, so an agent
 * cannot get an attachment rendered as something other than a picture.
 */
function imagePreviewSrc(file: UiAttachedImage): string {
  if (!isImageAttachment(file.mimeType, file.name)) {
    return '';
  }
  const previewUrl = file.previewUrl ?? '';
  if (LOCAL_PREVIEW_PREFIXES.some(prefix => previewUrl.startsWith(prefix))) {
    return previewUrl;
  }
  const mimeType = inferMimeType(file.name, file.mimeType);
  if (!file.data || !mimeType.startsWith(IMAGE_MIME_PREFIX)) {
    return '';
  }
  return `data:${mimeType};base64,${file.data}`;
}

/**
 * Message bubble item rendering textual responses, markdown, thinking blocks,
 * tool calls, attachments, and embedded inline A2UI surfaces.
 */
@Component({
  selector: 'a2ui-composer-chat-message',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    NgTemplateOutlet,
    RenderedFrame,
  ],
  templateUrl: './chat-message.ng.html',
  styleUrl: './chat-message.scss',
})
export class A2aChatMessage {
  private readonly document = inject(DOCUMENT);

  /** UI message object containing sender role, text, thinking trace, and optional A2UI payload. */
  readonly message = input.required<UiMessage>();
  /** URL for the agent's display avatar icon. */
  readonly agentIconUrl = input<string>(A2A_PROTOCOL_ICON_URL);
  /** Display name of the agent. */
  readonly agentName = input<string>('Agent');
  /** Whether the A2UI surface canvas is currently open. */
  readonly isCanvasOpen = input<boolean>(false);
  /** The currently active Canvas payload displayed in the RHS panel, if any. */
  readonly activeCanvasPayload = input<RenderA2uiItem[] | null>(null);

  /** Emitted when the user clicks the card button to view this message's A2UI payload in Canvas. */
  readonly openCanvas = output<RenderA2uiItem[]>();
  /** Emitted when the user clicks the close canvas button on the active message card. */
  readonly closeCanvas = output<void>();
  /** Emitted when the user clicks to open the protocol message inspector. */
  readonly openInspector = output<void>();

  /**
   * Records the user's last manual expand/collapse action along with the content state
   * (`hadContent`) it was performed under.
   *
   * Storing the content state alongside the choice lets the accordion automatically revert to
   * the default behaviour whenever the message transitions from thinking-only to having visible
   * content (i.e. the first non-thinking chunk streams in), while still honouring the manual
   * choice for as long as the content state is unchanged.
   */
  private readonly manualThinkingToggle = signal<ManualThinkingToggle | null>(null);

  protected readonly formattedContent = computed<string>(() => {
    const rawText = this.message().text || '';
    if (!rawText.trim()) return '';
    return renderMarkdown(rawText);
  });

  protected readonly formattedThinking = computed<string>(() => {
    const raw = this.message().thinking || '';
    if (!raw.trim()) return '';
    return renderMarkdown(raw);
  });

  protected readonly agentInitial = computed<string>(() => {
    const name = (this.agentName() || 'Agent').trim();
    // Iterate by code point so a leading emoji or other non-BMP character is
    // not split into a lone surrogate.
    return name ? [...name][0].toUpperCase() : 'A';
  });

  protected readonly formattedTime = computed<string>(() => {
    const ts = this.message().timestamp;
    const d = new Date(ts);
    return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  });

  /**
   * Whether this message renders an embedded inline A2UI surface in the chat timeline.
   *
   * - Explicit inline: For partitioned messages (supporting mixed inline + Canvas turns),
   *   `inlineA2uiPayload` is populated separately from `canvasArtifacts`.
   * - Legacy fallback: For unpartitioned messages or test fixtures where only `a2uiPayload`
   *   is provided, `hasCanvas: true` directed the entire payload to the Canvas side panel,
   *   whereas `hasCanvas: false` (or falsy) meant the payload rendered inline in the chat bubble.
   *   Therefore, we only treat `a2uiPayload` as inline when `!m.hasCanvas`.
   */
  protected readonly hasInlineSurface = computed<boolean>(() => {
    const m = this.message();
    const hasExplicitInline = Boolean(m.inlineA2uiPayload?.length);
    const hasLegacyInline = !m.hasCanvas && Boolean(m.a2uiPayload?.length);
    return hasExplicitInline || hasLegacyInline;
  });

  protected readonly inlinePayload = computed<RenderA2uiItem[] | undefined>(() => {
    const m = this.message();
    return m.inlineA2uiPayload || (!m.hasCanvas ? m.a2uiPayload : undefined);
  });

  /**
   * Attachments of this message, prepared for rendering.
   *
   * Classifying attachments here rather than in the template keeps the work
   * off the change detection path, where it would rerun for every attachment
   * on every cycle.
   */
  protected readonly attachments = computed<AttachmentView[]>(() =>
    (this.message().images ?? []).map((file, index) => ({
      file,
      key: `${index}:${file.name}`,
      previewSrc: imagePreviewSrc(file),
      icon: getMaterialFileIcon(file.mimeType, file.name),
    })),
  );

  /**
   * Whether the message has streamed any user-visible, non-thinking content yet.
   *
   * Covers rendered text as well as A2UI surfaces (inline or Canvas), since both represent an
   * actual agent response rather than intermediate reasoning.
   */
  protected readonly hasNonThinkingContent = computed<boolean>(() => {
    const message = this.message();
    return Boolean(
      message.text?.trim() ||
      message.inlineA2uiPayload?.length ||
      message.a2uiPayload?.length ||
      message.canvasArtifacts?.length,
    );
  });

  /**
   * Whether the thinking accordion is currently expanded.
   *
   * Defaults to expanded while the message contains only thinking content, and automatically
   * collapses as soon as the first non-thinking chunk streams in. A manual toggle by the user
   * overrides this default until the content state changes again.
   */
  protected readonly isThinkingExpanded = computed<boolean>(() => {
    const hasContent = this.hasNonThinkingContent();
    const manual = this.manualThinkingToggle();
    if (manual && manual.hadContent === hasContent) {
      return manual.expanded;
    }
    return !hasContent;
  });

  protected readonly thinkingLabel = computed<string>(() => {
    const message = this.message();
    if (message.isStreaming && !message.thinking) {
      return 'Thinking...';
    }
    return this.isThinkingExpanded() ? 'Hide thinking' : 'Show thinking';
  });

  protected readonly thinkingExpandIcon = computed<string>(() => {
    return this.isThinkingExpanded() ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  });

  protected readonly isPending = computed<boolean>(() => {
    const m = this.message();
    return m.isStreaming === true && !m.text && !m.thinking && !m.a2uiPayload?.length;
  });

  protected readonly canvasArtifacts = computed<CanvasArtifact[]>(() => {
    const m = this.message();
    if (m.canvasArtifacts?.length) {
      return m.canvasArtifacts;
    }
    if (m.hasCanvas && m.a2uiPayload?.length) {
      return [
        {
          id: 'default-canvas',
          cardTitle: 'Interactive content',
          cardIcon: 'apps',
          autoOpen: true,
          payload: m.a2uiPayload,
        },
      ];
    }
    return [];
  });

  protected readonly hasCanvasArtifacts = computed<boolean>(() => {
    return Boolean(this.canvasArtifacts().length);
  });

  /** Whether the feedback/copy action bar is shown under a finished agent turn. */
  protected readonly showMessageActions = computed<boolean>(() => {
    if (this.message().isStreaming) return false;
    return Boolean(this.message().text || this.hasInlineSurface() || this.hasCanvasArtifacts());
  });

  protected isArtifactActive(artifact: CanvasArtifact): boolean {
    if (!this.isCanvasOpen()) return false;
    const active = this.activeCanvasPayload();
    if (active) {
      return active === artifact.payload;
    }
    return this.canvasArtifacts().length === 1;
  }

  protected toggleThinkingExpansion(): void {
    this.manualThinkingToggle.set({
      hadContent: this.hasNonThinkingContent(),
      expanded: !this.isThinkingExpanded(),
    });
  }

  protected copyMessageText(): void {
    const text = this.message().text;
    if (!text || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    navigator.clipboard.writeText(text).catch((err: unknown) => {
      console.warn('Failed to copy message text to clipboard', err);
    });
  }

  protected openCanvasArtifact(payload: RenderA2uiItem[]): void {
    if (payload?.length) {
      this.openCanvas.emit(payload);
    }
  }

  /**
   * Saves an attachment to the user's machine.
   *
   * The payload is decoded and handed to the browser as an opaque binary blob
   * so that neither the file's contents nor its agent-supplied MIME type can
   * cause it to be rendered in this origin instead of saved.
   */
  protected downloadAttachment(file: UiAttachedImage): void {
    const bytes = decodeBase64(file.data);
    if (!bytes) {
      console.warn('Attachment has no decodable content to download', file.name);
      return;
    }

    const objectUrl = objectUrlFromSafeSource(new Blob([bytes], {type: DOWNLOAD_MIME_TYPE}));
    try {
      const link = this.document.createElement('a');
      setAnchorHref(link, objectUrl);
      link.download = sanitizeDownloadFileName(file.name);
      link.click();
    } finally {
      // The blob stays alive until the URL is released. `URL` is the same
      // global that safevalues created the object URL from.
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl.toString());
      }, OBJECT_URL_REVOKE_DELAY_MS);
    }
  }
}
