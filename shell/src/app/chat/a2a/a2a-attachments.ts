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

/**
 * Classification and encoding helpers for the file attachments exchanged with
 * A2A agents.
 *
 * These helpers answer the questions the chat UI asks about an attachment
 * before it can be displayed or downloaded: what its MIME type is, which icon
 * represents it, whether it is previewable as an image, and what its raw bytes
 * are. Rendering attachments to HTML lives in `a2a-media.ts`.
 */

/** MIME type reported for files whose type the browser cannot determine. */
const GENERIC_MIME_TYPE = 'application/octet-stream';

/** Filename extensions that always denote an image attachment. */
const IMAGE_EXTENSIONS: readonly string[] = [
  'bmp',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
];

/**
 * Canonical MIME type for each filename extension the composer recognises.
 *
 * Browsers leave `File.type` empty for extensions they do not know (notably
 * `.docx` on several platforms), so attachments fall back to extension-based
 * classification whenever the reported type is missing or generic.
 */
const MIME_TYPE_BY_EXTENSION: ReadonlyMap<string, string> = new Map([
  ['bmp', 'image/bmp'],
  ['csv', 'text/csv'],
  ['doc', 'application/msword'],
  ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['gif', 'image/gif'],
  ['htm', 'text/html'],
  ['html', 'text/html'],
  ['ico', 'image/x-icon'],
  ['jpeg', 'image/jpeg'],
  ['jpg', 'image/jpeg'],
  ['json', 'application/json'],
  ['md', 'text/markdown'],
  ['mp3', 'audio/mpeg'],
  ['mp4', 'video/mp4'],
  ['pdf', 'application/pdf'],
  ['png', 'image/png'],
  ['svg', 'image/svg+xml'],
  ['txt', 'text/plain'],
  ['wav', 'audio/wav'],
  ['webm', 'video/webm'],
  ['webp', 'image/webp'],
  ['xml', 'application/xml'],
  ['zip', 'application/zip'],
]);

/** Material Symbols glyph used when no attachment icon rule matches. */
const DEFAULT_FILE_ICON = 'description';

/** Selects a Material Symbols glyph for one class of attachments. */
interface FileIconRule {
  /** Glyph rendered for attachments matching this rule. */
  readonly icon: string;
  /** MIME type prefixes, such as `image/`, that select this glyph. */
  readonly mimePrefixes?: readonly string[];
  /** Exact MIME types that select this glyph. */
  readonly mimeTypes?: readonly string[];
  /** Filename extensions that select this glyph. */
  readonly extensions?: readonly string[];
}

/** Attachment icon rules, evaluated in order; the first match wins. */
const FILE_ICON_RULES: readonly FileIconRule[] = [
  {icon: 'image', mimePrefixes: ['image/'], extensions: IMAGE_EXTENSIONS},
  {icon: 'picture_as_pdf', mimeTypes: ['application/pdf'], extensions: ['pdf']},
  {
    icon: 'article',
    mimeTypes: [
      'application/msword',
      'application/rtf',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    extensions: ['doc', 'docx', 'odt', 'rtf'],
  },
  {
    icon: 'table_chart',
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    extensions: ['ods', 'xls', 'xlsx'],
  },
  {
    icon: 'audio_file',
    mimePrefixes: ['audio/'],
    extensions: ['aac', 'flac', 'm4a', 'mp3', 'ogg', 'wav'],
  },
  {
    icon: 'video_file',
    mimePrefixes: ['video/'],
    extensions: ['avi', 'mkv', 'mov', 'mp4', 'webm'],
  },
  {
    icon: 'code',
    mimeTypes: ['application/json', 'application/xml', 'text/html', 'text/xml'],
    extensions: ['css', 'html', 'java', 'js', 'json', 'py', 'ts', 'xml', 'yaml', 'yml'],
  },
  {
    icon: 'folder_zip',
    mimeTypes: ['application/gzip', 'application/x-tar', 'application/zip'],
    extensions: ['7z', 'gz', 'rar', 'tar', 'zip'],
  },
  {
    icon: DEFAULT_FILE_ICON,
    mimePrefixes: ['text/'],
    extensions: ['csv', 'log', 'md', 'txt'],
  },
];

/** Header of a base64 data URL, such as `data:application/pdf;base64,`. */
const BASE64_DATA_URL_PREFIX = /^data:[^,]*;base64,/i;

/** `DOMException.name` used by `atob` to report input that is not base64. */
const INVALID_CHARACTER_ERROR = 'InvalidCharacterError';

/** Filename used when an attachment carries no usable name. */
const FALLBACK_DOWNLOAD_NAME = 'download';

/**
 * Reports whether `error` is the malformed-input failure raised by `atob`.
 *
 * The error is matched by name rather than with `instanceof DOMException`,
 * because the DOM implementation that raises it does not always share the
 * ambient `DOMException` class.
 */
function isInvalidCharacterError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as {name?: unknown}).name === INVALID_CHARACTER_ERROR
  );
}

/** Returns the lower-case extension of `fileName`, or '' when it has none. */
function extractFileExtension(fileName?: string | null): string {
  const name = (fileName || '').trim();
  const dotIndex = name.lastIndexOf('.');
  // A leading dot marks a hidden file, and a trailing dot has no extension.
  if (dotIndex <= 0 || dotIndex === name.length - 1) {
    return '';
  }
  return name.slice(dotIndex + 1).toLowerCase();
}

/** Lower-cases and trims a MIME type so it can be compared to the tables. */
function normalizeMimeType(mimeType?: string): string {
  return (mimeType || '').trim().toLowerCase();
}

/** Whether an attachment's MIME type or extension satisfies an icon rule. */
function matchesIconRule(rule: FileIconRule, mimeType: string, extension: string): boolean {
  if (mimeType) {
    if (rule.mimeTypes?.includes(mimeType)) return true;
    if (rule.mimePrefixes?.some(prefix => mimeType.startsWith(prefix))) return true;
  }
  return Boolean(extension) && Boolean(rule.extensions?.includes(extension));
}

/**
 * Resolves the MIME type of a file selected by the user.
 *
 * @param fileName Name of the file, used to classify it by extension.
 * @param detectedType MIME type reported by the browser, if any.
 * @return The reported type when it is specific, otherwise the type implied by
 *     the extension, falling back to `application/octet-stream`.
 */
export function inferMimeType(fileName: string, detectedType?: string): string {
  const detected = normalizeMimeType(detectedType);
  if (detected && detected !== GENERIC_MIME_TYPE) {
    return detected;
  }
  const extension = extractFileExtension(fileName);
  return MIME_TYPE_BY_EXTENSION.get(extension) ?? GENERIC_MIME_TYPE;
}

/**
 * Returns the Material Symbols glyph representing an attachment.
 *
 * @param mimeType MIME type of the attachment.
 * @param fileName Name of the attachment, used when the MIME type is generic.
 */
export function getMaterialFileIcon(mimeType: string, fileName?: string): string {
  const normalizedMime = normalizeMimeType(mimeType);
  const extension = extractFileExtension(fileName);
  const rule = FILE_ICON_RULES.find(candidate =>
    matchesIconRule(candidate, normalizedMime, extension),
  );
  return rule?.icon ?? DEFAULT_FILE_ICON;
}

/**
 * Whether an attachment should be rendered as an inline image preview.
 *
 * @param mimeType MIME type of the attachment.
 * @param fileName Name of the attachment, used when the MIME type is generic.
 */
export function isImageAttachment(mimeType: string, fileName?: string): boolean {
  if (normalizeMimeType(mimeType).startsWith('image/')) {
    return true;
  }
  return IMAGE_EXTENSIONS.includes(extractFileExtension(fileName));
}

/** Strips the `data:<mime>;base64,` header from a base64 data URL. */
export function stripBase64DataUrlPrefix(value?: string | null): string {
  return (value || '').replace(BASE64_DATA_URL_PREFIX, '');
}

/**
 * Decodes base64 text, with or without a data URL header, into raw bytes.
 *
 * The bytes are backed by a plain `ArrayBuffer` so that callers can pass them
 * straight to APIs such as `Blob`, which reject shared buffers.
 *
 * @return The decoded bytes, or null when the input is empty or not base64.
 * @throws Any `atob` failure other than the malformed-input report.
 */
export function decodeBase64(base64?: string | null): Uint8Array<ArrayBuffer> | null {
  const payload = stripBase64DataUrlPrefix(base64).trim();
  if (!payload) {
    return null;
  }
  let binary: string;
  try {
    binary = atob(payload);
  } catch (error: unknown) {
    if (!isInvalidCharacterError(error)) {
      throw error;
    }
    return null;
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Reduces an agent-supplied filename to a safe `download` attribute value.
 *
 * Directory components are dropped so a crafted name cannot suggest a path,
 * and control characters are removed so the name cannot spoof the extension
 * shown by the browser.
 */
export function sanitizeDownloadFileName(fileName?: string): string {
  const baseName = (fileName || '').split(/[\\/]/).pop() ?? '';
  const printable = baseName.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return printable || FALLBACK_DOWNLOAD_NAME;
}
