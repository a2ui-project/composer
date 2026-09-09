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

import {escapeHtml} from '../../utils/markdown';

/**
 * Utilities for parsing, formatting, and rendering multimedia file attachments
 * (images, audio, video, and documents) emitted by A2A agents via FileParts.
 *
 * Implements the presentation rules established in A2A Inspector (script.ts: renderMultimediaContent)
 * by generating sanitized HTML containers (.media-container) that chat-message displays cleanly.
 */

/**
 * Returns an emoji icon representation for a given MIME type matching A2A Inspector conventions.
 */
export function getModalityIcon(mimeType: string): string {
  const cleanMime = (mimeType || '').toLowerCase().trim();
  if (cleanMime.startsWith('image/')) return '🖼️';
  if (cleanMime.startsWith('audio/')) return '🎵';
  if (cleanMime.startsWith('video/')) return '🎬';
  if (cleanMime.startsWith('text/')) return '📝';
  if (cleanMime.includes('pdf')) return '📄';
  return '📎';
}

/**
 * Renders an A2A file or multimedia URI as a sanitized HTML string consistent with A2A Inspector rules.
 * Generates responsive media tags wrapped in `.media-container` styled by `chat-message.scss`:
 * - `image/*`: Responsive image with max constraints and subtle elevation.
 * - `audio/*`: Audio player with native browser controls.
 * - `video/*`: Video player with native browser controls.
 * - `application/pdf` and other files: Downloadable link with modality icon and filename.
 */
export function renderMultimediaContent(uri: string, mimeType: string, filename?: string): string {
  const cleanUri = (uri || '').trim();
  const safeUri = escapeHtml(cleanUri);
  const cleanMime = (mimeType || 'application/octet-stream').toLowerCase().trim();
  const safeFilename = filename ? escapeHtml(filename) : '';

  if (cleanMime.startsWith('image/')) {
    return `<div class="media-container"><img src="${safeUri}" alt="${safeFilename || 'Image attachment'}" class="media-image" /></div>`;
  } else if (cleanMime.startsWith('audio/')) {
    return `<div class="media-container"><audio controls class="media-audio"><source src="${safeUri}" type="${cleanMime}">Your browser does not support audio playback.</audio></div>`;
  } else if (cleanMime.startsWith('video/')) {
    return `<div class="media-container"><video controls class="media-video"><source src="${safeUri}" type="${cleanMime}">Your browser does not support video playback.</video></div>`;
  } else if (cleanMime === 'application/pdf') {
    const label = safeFilename ? `📄 View PDF (${safeFilename})` : '📄 View PDF';
    return `<div class="media-container"><a href="${safeUri}" target="_blank" rel="noopener noreferrer" class="file-link">${label}</a></div>`;
  } else {
    const icon = getModalityIcon(cleanMime);
    const label = safeFilename
      ? `${icon} Download ${safeFilename} (${cleanMime})`
      : `${icon} Download file (${cleanMime})`;
    return `<div class="media-container"><a href="${safeUri}" target="_blank" rel="noopener noreferrer" class="file-link">${label}</a></div>`;
  }
}

/**
 * Renders base64 binary data as an HTML data URI multimedia element consistent with A2A Inspector rules.
 */
export function renderBase64Data(base64Data: string, mimeType: string, filename?: string): string {
  const cleanMime = (mimeType || 'application/octet-stream').toLowerCase().trim();
  const dataUri = `data:${cleanMime};base64,${(base64Data || '').trim()}`;
  return renderMultimediaContent(dataUri, cleanMime, filename);
}
