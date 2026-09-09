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

import {describe, it, expect} from 'vitest';
import {getModalityIcon, renderBase64Data, renderMultimediaContent} from './a2a-media';

describe('a2a-media', () => {
  describe('getModalityIcon', () => {
    it('returns 🖼️ for images', () => {
      expect(getModalityIcon('image/png')).toBe('🖼️');
      expect(getModalityIcon('IMAGE/JPEG')).toBe('🖼️');
      expect(getModalityIcon('  image/svg+xml  ')).toBe('🖼️');
    });

    it('returns 🎵 for audio', () => {
      expect(getModalityIcon('audio/wav')).toBe('🎵');
      expect(getModalityIcon('audio/mp3')).toBe('🎵');
    });

    it('returns 🎬 for video', () => {
      expect(getModalityIcon('video/mp4')).toBe('🎬');
      expect(getModalityIcon('video/webm')).toBe('🎬');
    });

    it('returns 📝 for text', () => {
      expect(getModalityIcon('text/plain')).toBe('📝');
      expect(getModalityIcon('text/markdown')).toBe('📝');
    });

    it('returns 📄 for pdf', () => {
      expect(getModalityIcon('application/pdf')).toBe('📄');
      expect(getModalityIcon('pdf')).toBe('📄');
    });

    it('returns 📎 for generic or unknown MIME types', () => {
      expect(getModalityIcon('application/octet-stream')).toBe('📎');
      expect(getModalityIcon('application/json')).toBe('📎');
      expect(getModalityIcon('')).toBe('📎');
      expect(getModalityIcon(undefined as unknown as string)).toBe('📎');
    });
  });

  describe('renderMultimediaContent', () => {
    it('renders image elements with safe alt text', () => {
      const html1 = renderMultimediaContent('https://example.com/pic.png', 'image/png');
      expect(html1).toContain('<img src="https://example.com/pic.png"');
      expect(html1).toContain('alt="Image attachment"');
      expect(html1).toContain('class="media-image"');

      const html2 = renderMultimediaContent(
        'https://example.com/pic.png',
        'image/png',
        'my "pic" <test>.png',
      );
      expect(html2).toContain('alt="my &quot;pic&quot; &lt;test&gt;.png"');
    });

    it('renders audio playback elements', () => {
      const html = renderMultimediaContent('https://example.com/sound.wav', 'audio/wav');
      expect(html).toContain('<audio controls class="media-audio">');
      expect(html).toContain('<source src="https://example.com/sound.wav" type="audio/wav">');
    });

    it('renders video playback elements', () => {
      const html = renderMultimediaContent('https://example.com/movie.mp4', 'video/mp4');
      expect(html).toContain('<video controls class="media-video">');
      expect(html).toContain('<source src="https://example.com/movie.mp4" type="video/mp4">');
    });

    it('renders PDF links with and without filename', () => {
      const htmlNoName = renderMultimediaContent('https://example.com/doc.pdf', 'application/pdf');
      expect(htmlNoName).toContain('📄 View PDF');
      expect(htmlNoName).toContain('href="https://example.com/doc.pdf"');

      const htmlWithName = renderMultimediaContent(
        'https://example.com/doc.pdf',
        'application/pdf',
        'Report.pdf',
      );
      expect(htmlWithName).toContain('📄 View PDF (Report.pdf)');
    });

    it('renders download links for generic binary files', () => {
      const htmlNoName = renderMultimediaContent(
        'https://example.com/file.bin',
        'application/octet-stream',
      );
      expect(htmlNoName).toContain('📎 Download file (application/octet-stream)');

      const htmlWithName = renderMultimediaContent(
        'https://example.com/data.csv',
        'text/csv',
        'data.csv',
      );
      expect(htmlWithName).toContain('📝 Download data.csv (text/csv)');
    });
  });

  describe('renderBase64Data', () => {
    it('constructs data URI and renders multimedia element', () => {
      const html = renderBase64Data('iVBORw0KGgo=', 'image/png', 'icon.png');
      expect(html).toContain('src="data:image/png;base64,iVBORw0KGgo="');
      expect(html).toContain('alt="icon.png"');
    });

    it('falls back to application/octet-stream when mimeType is omitted', () => {
      const html = renderBase64Data('AQID', '', 'binary.bin');
      expect(html).toContain('href="data:application/octet-stream;base64,AQID"');
      expect(html).toContain('📎 Download binary.bin (application/octet-stream)');
    });
  });
});
