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

import DOMPurify from 'dompurify';
import {marked} from 'marked';

/**
 * Global configuration for the Marked markdown parser:
 * - `gfm`: Enables GitHub Flavored Markdown (tables, strikethroughs, tasklists).
 * - `breaks`: Converts single line breaks in conversational responses to `<br>` elements.
 * - `renderer.link`: Automatically appends `target="_blank"` and `rel="noopener noreferrer"`
 *   to rendered links so that clicking links inside chat responses opens them safely in a
 *   new browser tab without navigating away from the Composer workspace or exposing window.opener.
 */
marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    link({href, title, tokens}) {
      const text = this.parser.parseInline(tokens);
      const safeHref = sanitizeUrl(href);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<a href="${safeHref}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    },
  },
});

/**
 * Escapes raw HTML characters to prevent XSS injection.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates and sanitizes link URLs to prevent javascript: or data: XSS attacks.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '#';
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return trimmed;
  }
  try {
    // Use a dummy base URL (https://example.com) so the standard WHATWG URL parser
    // can successfully parse and validate relative or protocol-less paths without throwing a TypeError.
    const parsed = new URL(trimmed, 'https://example.com');
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:') {
      return trimmed;
    }
  } catch {
    // Malformed URL
  }
  return '#';
}

/**
 * Parses and renders inline markdown formatting:
 */
export function renderInlineMarkdown(text: string): string {
  if (!text) return '';
  const rawHtml = marked.parseInline(text, {async: false}) as string;
  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'rel'],
  });
}

/**
 * Parses markdown into sanitized HTML using Marked (GFM) and DOMPurify.
 * Supports headings, blockquotes, fenced code blocks, tables, task lists, and inline formatting.
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';
  const rawHtml = marked.parse(markdown, {async: false}) as string;
  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'rel'],
  });
}
