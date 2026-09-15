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

import {describe, it, expect, vi, afterEach} from 'vitest';
import {
  decodeBase64,
  getMaterialFileIcon,
  inferMimeType,
  isImageAttachment,
  sanitizeDownloadFileName,
  stripBase64DataUrlPrefix,
} from './a2a-attachments';

describe('a2a-attachments', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('inferMimeType', () => {
    it('keeps a specific MIME type reported by the browser', () => {
      expect(inferMimeType('doc.pdf', 'application/pdf')).toBe('application/pdf');
      expect(inferMimeType('file.xyz', 'custom/type')).toBe('custom/type');
      expect(inferMimeType('photo.png', '  IMAGE/PNG  ')).toBe('image/png');
    });

    it('infers document types from the extension when the reported type is unusable', () => {
      expect(inferMimeType('contract.pdf', '')).toBe('application/pdf');
      expect(inferMimeType('contract.pdf', 'application/octet-stream')).toBe('application/pdf');
      expect(inferMimeType('document.docx', '')).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      expect(inferMimeType('legacy.doc', '')).toBe('application/msword');
      expect(inferMimeType('notes.txt', '')).toBe('text/plain');
      expect(inferMimeType('data.csv', '')).toBe('text/csv');
      expect(inferMimeType('schema.json', '')).toBe('application/json');
      expect(inferMimeType('readme.md', '')).toBe('text/markdown');
      expect(inferMimeType('archive.zip', '')).toBe('application/zip');
    });

    it('infers media types from the extension', () => {
      expect(inferMimeType('pic.PNG', '')).toBe('image/png');
      expect(inferMimeType('photo.jpg', '')).toBe('image/jpeg');
      expect(inferMimeType('audio.mp3', '')).toBe('audio/mpeg');
      expect(inferMimeType('clip.mp4', '')).toBe('video/mp4');
    });

    it('falls back to the generic type for names without a usable extension', () => {
      expect(inferMimeType('file.xyz', '')).toBe('application/octet-stream');
      expect(inferMimeType('README', '')).toBe('application/octet-stream');
      expect(inferMimeType('.hidden', '')).toBe('application/octet-stream');
      expect(inferMimeType('trailing.', '')).toBe('application/octet-stream');
      expect(inferMimeType('', '')).toBe('application/octet-stream');
    });
  });

  describe('getMaterialFileIcon', () => {
    it('returns image for image MIME types or extensions', () => {
      expect(getMaterialFileIcon('image/png', 'test.png')).toBe('image');
      expect(getMaterialFileIcon('', 'photo.jpg')).toBe('image');
      expect(getMaterialFileIcon('', 'vector.svg')).toBe('image');
    });

    it('returns picture_as_pdf for PDFs', () => {
      expect(getMaterialFileIcon('application/pdf', 'doc.pdf')).toBe('picture_as_pdf');
      expect(getMaterialFileIcon('', 'doc.pdf')).toBe('picture_as_pdf');
    });

    it('returns article for word processor documents', () => {
      expect(getMaterialFileIcon('', 'document.docx')).toBe('article');
      expect(getMaterialFileIcon('', 'resume.doc')).toBe('article');
      expect(
        getMaterialFileIcon(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'file.bin',
        ),
      ).toBe('article');
    });

    it('returns table_chart for spreadsheets rather than the document icon', () => {
      expect(getMaterialFileIcon('', 'budget.xlsx')).toBe('table_chart');
      expect(getMaterialFileIcon('application/vnd.ms-excel', 'legacy.xls')).toBe('table_chart');
    });

    it('returns code, audio, video and archive icons for their types', () => {
      expect(getMaterialFileIcon('', 'script.py')).toBe('code');
      expect(getMaterialFileIcon('application/json', 'config.json')).toBe('code');
      expect(getMaterialFileIcon('text/html', 'page.html')).toBe('code');
      expect(getMaterialFileIcon('', 'track.mp3')).toBe('audio_file');
      expect(getMaterialFileIcon('', 'movie.mp4')).toBe('video_file');
      expect(getMaterialFileIcon('', 'archive.zip')).toBe('folder_zip');
    });

    it('returns description for plain text and unrecognised attachments', () => {
      expect(getMaterialFileIcon('text/plain', 'notes.txt')).toBe('description');
      expect(getMaterialFileIcon('', 'log.log')).toBe('description');
      expect(getMaterialFileIcon('application/octet-stream', 'unknown.bin')).toBe('description');
      expect(getMaterialFileIcon('', '')).toBe('description');
    });
  });

  describe('isImageAttachment', () => {
    it('returns true for image MIME types or extensions', () => {
      expect(isImageAttachment('image/png', 'sample.png')).toBe(true);
      expect(isImageAttachment('IMAGE/JPEG', 'sample.jpg')).toBe(true);
      expect(isImageAttachment('', 'sample.webp')).toBe(true);
      expect(isImageAttachment('application/octet-stream', 'sample.PNG')).toBe(true);
    });

    it('returns false for non-image files', () => {
      expect(isImageAttachment('application/pdf', 'document.pdf')).toBe(false);
      expect(isImageAttachment('text/plain', 'notes.txt')).toBe(false);
      expect(isImageAttachment('application/zip', 'archive.zip')).toBe(false);
      expect(isImageAttachment('', '')).toBe(false);
    });
  });

  describe('stripBase64DataUrlPrefix', () => {
    it('removes the data URL header', () => {
      expect(stripBase64DataUrlPrefix('data:application/pdf;base64,QUJD')).toBe('QUJD');
      expect(stripBase64DataUrlPrefix('DATA:image/png;BASE64,QUJD')).toBe('QUJD');
    });

    it('leaves bare base64 payloads untouched', () => {
      expect(stripBase64DataUrlPrefix('QUJD')).toBe('QUJD');
      expect(stripBase64DataUrlPrefix('')).toBe('');
    });

    it('returns an empty string for nullish input', () => {
      expect(stripBase64DataUrlPrefix(undefined)).toBe('');
      expect(stripBase64DataUrlPrefix(null)).toBe('');
    });
  });

  describe('decodeBase64', () => {
    it('decodes payloads with and without a data URL header', () => {
      expect(decodeBase64('QUJD')).toEqual(new Uint8Array([65, 66, 67]));
      expect(decodeBase64('data:text/plain;base64,QUJD')).toEqual(new Uint8Array([65, 66, 67]));
    });

    it('preserves bytes outside the ASCII range', () => {
      expect(decodeBase64('/w==')).toEqual(new Uint8Array([255]));
    });

    it('returns null for empty, nullish or malformed input', () => {
      expect(decodeBase64('')).toBeNull();
      expect(decodeBase64(undefined)).toBeNull();
      expect(decodeBase64(null)).toBeNull();
      expect(decodeBase64('   ')).toBeNull();
      expect(decodeBase64('data:application/pdf;base64,')).toBeNull();
      expect(decodeBase64('not valid base64!')).toBeNull();
    });

    it('rethrows failures that do not describe malformed input', () => {
      const failure = new Error('atob is unavailable');
      vi.spyOn(globalThis, 'atob').mockImplementation(() => {
        throw failure;
      });

      expect(() => decodeBase64('QUJD')).toThrow(failure);
    });
  });

  describe('sanitizeDownloadFileName', () => {
    it('drops directory components so names cannot suggest a path', () => {
      expect(sanitizeDownloadFileName('../../etc/passwd')).toBe('passwd');
      expect(sanitizeDownloadFileName('C:\\Windows\\system32\\evil.exe')).toBe('evil.exe');
    });

    it('removes control characters that could hide the real extension', () => {
      expect(sanitizeDownloadFileName('invoice\u0000.pdf')).toBe('invoice.pdf');
      expect(sanitizeDownloadFileName('report\n.txt')).toBe('report.txt');
    });

    it('falls back to a default name when nothing usable remains', () => {
      expect(sanitizeDownloadFileName('')).toBe('download');
      expect(sanitizeDownloadFileName(undefined)).toBe('download');
      expect(sanitizeDownloadFileName('   ')).toBe('download');
      expect(sanitizeDownloadFileName('some/dir/')).toBe('download');
    });

    it('keeps ordinary file names unchanged', () => {
      expect(sanitizeDownloadFileName('Quarterly Report.pdf')).toBe('Quarterly Report.pdf');
    });
  });
});
