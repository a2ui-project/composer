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
import {escapeHtml, sanitizeUrl, renderInlineMarkdown, renderMarkdown} from './markdown';

describe('Markdown Engine', () => {
  describe('escapeHtml', () => {
    it('escapes special HTML characters', () => {
      expect(escapeHtml('<script>alert("XSS") & \'test\'</script>')).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot;) &amp; &#39;test&#39;&lt;/script&gt;',
      );
    });
  });

  describe('sanitizeUrl', () => {
    it('permits safe URLs', () => {
      expect(sanitizeUrl('https://example.com/path?q=1')).toBe('https://example.com/path?q=1');
      expect(sanitizeUrl('http://localhost:8080')).toBe('http://localhost:8080');
      expect(sanitizeUrl('mailto:user@example.com')).toBe('mailto:user@example.com');
      expect(sanitizeUrl('#heading')).toBe('#heading');
      expect(sanitizeUrl('/relative/path')).toBe('/relative/path');
      expect(sanitizeUrl('./local/path')).toBe('./local/path');
      expect(sanitizeUrl('../parent/path')).toBe('../parent/path');
      expect(sanitizeUrl('')).toBe('#');
      expect(sanitizeUrl(null as unknown as string)).toBe('#');
    });

    it('blocks dangerous URL schemes', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
      expect(sanitizeUrl('vbscript:msgbox')).toBe('#');
      expect(sanitizeUrl('ftp://example.com')).toBe('#');
    });
  });

  describe('renderInlineMarkdown', () => {
    it('returns empty string for empty input', () => {
      expect(renderInlineMarkdown('')).toBe('');
    });

    it('renders inline formatting correctly', () => {
      expect(renderInlineMarkdown('Hello `const a = 1;` world')).toBe(
        'Hello <code>const a = 1;</code> world',
      );
      expect(renderInlineMarkdown('**bold** and *italic*')).toBe(
        '<strong>bold</strong> and <em>italic</em>',
      );
      expect(renderInlineMarkdown('~~strikethrough~~')).toBe('<del>strikethrough</del>');
      expect(renderInlineMarkdown('[Google](https://google.com "Google Site")')).toBe(
        '<a href="https://google.com" title="Google Site" target="_blank" rel="noopener noreferrer">Google</a>',
      );
    });
    it('sanitizes dangerous link URLs and escapes quotes in title attributes', () => {
      const mdWithXss = '[Attack](javascript:alert(1) "Evil \\"quotes\\" & title")';
      const html = renderInlineMarkdown(mdWithXss);
      expect(html).toContain('href="#"');
      expect(html).toContain('title="Evil &quot;quotes&quot; &amp; title"');
    });
  });

  describe('renderMarkdown', () => {
    it('returns empty string for empty input', () => {
      expect(renderMarkdown('')).toBe('');
    });

    it('renders headings from level 1 to 6', () => {
      const md = '# Header 1\n## Header 2\n### Header 3';
      const html = renderMarkdown(md);
      expect(html).toContain('<h1>Header 1</h1>');
      expect(html).toContain('<h2>Header 2</h2>');
      expect(html).toContain('<h3>Header 3</h3>');
    });

    it('renders fenced code blocks with language classes', () => {
      const md = '```typescript\nconst x = 10;\n```';
      const html = renderMarkdown(md);
      expect(html).toContain('class="language-typescript"');
      expect(html).toContain('const x = 10;');
    });

    it('renders unordered and ordered lists', () => {
      const ulMd = '- Item 1\n- Item 2';
      const ulHtml = renderMarkdown(ulMd);
      expect(ulHtml).toContain('<ul>');
      expect(ulHtml).toContain('<li>Item 1</li>');
      expect(ulHtml).toContain('<li>Item 2</li>');

      const olMd = '1. First\n2. Second';
      const olHtml = renderMarkdown(olMd);
      expect(olHtml).toContain('<ol>');
      expect(olHtml).toContain('<li>First</li>');
      expect(olHtml).toContain('<li>Second</li>');
    });

    it('renders blockquotes', () => {
      const md = '> This is a quote';
      const html = renderMarkdown(md);
      expect(html).toContain('<blockquote>');
      expect(html).toContain('<p>This is a quote</p>');
    });
  });
});
