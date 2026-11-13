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
 * Describes a detailed failure state from attempting to parse JSON.
 */
export interface JsonParseError {
  /** The descriptive error message */
  message: string;
  /** The 1-indexed line number where the syntax error occurred, if resolvable */
  line?: number;
  /** The 1-indexed column number within the line, if resolvable */
  column?: number;
  /** The raw substring representing the malformed section, if resolvable */
  snippet?: string;
}

/**
 * Discriminated union for safe JSON parsing results.
 * Avoids throwing arbitrary runtime exceptions on malformed boundaries.
 */
export type JsonParseResult<T> =
  | {readonly success: true; readonly data: T}
  | {readonly success: false; readonly data: null; readonly error: JsonParseError};

/**
 * V8's JsonParser::ReportUnexpectedCharacter centers error snippets with up to
 * 10 UTF-16 code units of context before and after the offending token.
 */
const V8_SNIPPET_CONTEXT_RADIUS = 10;

function offsetToLineColumn(text: string, offset: number): {line: number; column: number} {
  const clamped = Math.max(0, Math.min(offset, text.length));
  const lines = text.slice(0, clamped).split('\n');
  return {line: lines.length, column: lines[lines.length - 1].length + 1};
}

/**
 * Finds the offset of the first syntactically invalid token matching `rawToken`
 * by scanning tokens from index 0 with minimal structural state expectations.
 */
function findFirstInvalidTokenOffset(jsonText: string, rawToken: string): number {
  let i = 0;
  const len = jsonText.length;
  const stack: Array<'{' | '['> = [];
  let state: 'value' | 'after_value' | 'prop_or_end' | 'colon' | 'prop' = 'value';

  function skipWhitespace(): void {
    while (
      i < len &&
      (jsonText[i] === ' ' || jsonText[i] === '\t' || jsonText[i] === '\n' || jsonText[i] === '\r')
    ) {
      i++;
    }
  }

  function readString(): boolean {
    if (jsonText[i] !== '"') return false;
    i++;
    while (i < len) {
      if (jsonText[i] === '\\') {
        i += 2;
      } else if (jsonText[i] === '"') {
        i++;
        return true;
      } else {
        i++;
      }
    }
    return true;
  }

  function readNumber(): boolean {
    const start = i;
    if (jsonText[i] === '-') i++;
    if (i < len && jsonText[i] >= '0' && jsonText[i] <= '9') {
      while (i < len && jsonText[i] >= '0' && jsonText[i] <= '9') i++;
      if (i < len && jsonText[i] === '.') {
        i++;
        while (i < len && jsonText[i] >= '0' && jsonText[i] <= '9') i++;
      }
      if (i < len && (jsonText[i] === 'e' || jsonText[i] === 'E')) {
        i++;
        if (i < len && (jsonText[i] === '+' || jsonText[i] === '-')) i++;
        while (i < len && jsonText[i] >= '0' && jsonText[i] <= '9') i++;
      }
      return true;
    }
    i = start;
    return false;
  }

  function readKeyword(): boolean {
    for (const kw of ['true', 'false', 'null'] as const) {
      if (jsonText.startsWith(kw, i)) {
        const nextChar = jsonText[i + kw.length];
        if (!nextChar || !/[A-Za-z0-9_$]/.test(nextChar)) {
          i += kw.length;
          return true;
        }
      }
    }
    return false;
  }

  while (i < len) {
    skipWhitespace();
    if (i >= len) break;
    const tokenStart = i;
    const ch = jsonText[i];

    if (state === 'value') {
      if (ch === '{') {
        i++;
        stack.push('{');
        state = 'prop_or_end';
      } else if (ch === '[') {
        i++;
        stack.push('[');
        state = 'value';
      } else if (ch === ']' && stack[stack.length - 1] === '[') {
        i++;
        stack.pop();
        state = 'after_value';
      } else if (readString() || readNumber() || readKeyword()) {
        state = 'after_value';
      } else {
        return jsonText.startsWith(rawToken, tokenStart) ? tokenStart : -1;
      }
    } else if (state === 'prop_or_end') {
      if (ch === '}') {
        i++;
        stack.pop();
        state = 'after_value';
      } else if (readString()) {
        state = 'colon';
      } else {
        return jsonText.startsWith(rawToken, tokenStart) ? tokenStart : -1;
      }
    } else if (state === 'colon') {
      if (ch === ':') {
        i++;
        state = 'value';
      } else {
        return jsonText.startsWith(rawToken, tokenStart) ? tokenStart : -1;
      }
    } else if (state === 'prop') {
      if (readString()) {
        state = 'colon';
      } else {
        return jsonText.startsWith(rawToken, tokenStart) ? tokenStart : -1;
      }
    } else if (state === 'after_value') {
      const top = stack[stack.length - 1];
      if (top === '{') {
        if (ch === ',') {
          i++;
          state = 'prop';
        } else if (ch === '}') {
          i++;
          stack.pop();
          state = 'after_value';
        } else {
          return jsonText.startsWith(rawToken, tokenStart) ? tokenStart : -1;
        }
      } else if (top === '[') {
        if (ch === ',') {
          i++;
          state = 'value';
        } else if (ch === ']') {
          i++;
          stack.pop();
          state = 'after_value';
        } else {
          return jsonText.startsWith(rawToken, tokenStart) ? tokenStart : -1;
        }
      } else {
        return jsonText.startsWith(rawToken, tokenStart) ? tokenStart : -1;
      }
    }
  }
  return -1;
}

/**
 * Extracts line and column coordinates from heterogeneous JS engine SyntaxError messages.
 *
 * @param error - The trapped JSON syntax error.
 * @param rawText - The raw source text that triggered the failure.
 * @returns Resolvable line and column coordinates.
 */
export function extractErrorDetails(
  error: SyntaxError | Error,
  rawText: string,
): {line?: number; column?: number} {
  const message = error.message;

  const lineColMatch = message.match(/line (\d+) column (\d+)/i);
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  const positionMatch = message.match(/at position (\d+)/i);
  if (positionMatch) {
    const rawPos = parseInt(positionMatch[1], 10);
    return offsetToLineColumn(rawText, rawPos);
  }

  // Handle modern V8 error format:
  // Unexpected token <token>, [...]"<snippet>"[...] is not valid JSON
  const tokenSnippetMatch = message.match(
    /^Unexpected token (.+?), (\.\.\.)?"([\s\S]+)"(\.\.\.)? is not valid JSON$/,
  );
  if (tokenSnippetMatch) {
    const rawToken = tokenSnippetMatch[1].replace(/^'|'$/g, '');
    const hasLeadingDots = Boolean(tokenSnippetMatch[2]);
    const snippet = tokenSnippetMatch[3];
    const hasTrailingDots = Boolean(tokenSnippetMatch[4]);
    const text = rawText;

    if (hasLeadingDots) {
      if (snippet.startsWith(rawToken, V8_SNIPPET_CONTEXT_RADIUS)) {
        const snippetIdx = hasTrailingDots ? text.indexOf(snippet) : text.lastIndexOf(snippet);
        if (snippetIdx !== -1) {
          return offsetToLineColumn(text, snippetIdx + V8_SNIPPET_CONTEXT_RADIUS);
        }
      }
      return {};
    } else if (
      hasTrailingDots &&
      snippet.length >= V8_SNIPPET_CONTEXT_RADIUS &&
      snippet.startsWith(rawToken, snippet.length - V8_SNIPPET_CONTEXT_RADIUS)
    ) {
      const snippetIdx = text.indexOf(snippet);
      if (snippetIdx !== -1) {
        return offsetToLineColumn(text, snippetIdx + snippet.length - V8_SNIPPET_CONTEXT_RADIUS);
      }
    } else {
      const offset = findFirstInvalidTokenOffset(text, rawToken);
      if (offset !== -1) {
        return offsetToLineColumn(text, offset);
      }
    }
  }

  return {};
}

/**
 * Safely evaluates input text, predicting whether it should be parsed as a singular
 * JSON object, a JSON array, or newline-delimited JSON Lines (JSONL).
 *
 * @param content - The raw string representation to parse.
 * @returns A structured JsonParseResult union.
 */
export function tryParseJsonArray(content?: string | null): JsonParseResult<unknown[]> {
  if (content == null) {
    return {success: false, data: null, error: {message: 'Content is null or undefined'}};
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return {success: false, data: null, error: {message: 'Content is empty'}};
  }

  let lastError: SyntaxError | Error | null = null;

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return {success: true, data: parsed};
      }
    } catch (e) {
      lastError = e as Error;
    }
  } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return {success: true, data: [parsed]};
      }
    } catch (e) {
      lastError = e as Error;
    }
  } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
    } catch (e) {
      lastError = e as Error;
    }
  }

  // Try parsing as JSON Lines
  const rawLines = trimmed.split('\n');
  const lines: Array<{text: string; originalIndex: number}> = [];
  for (let i = 0; i < rawLines.length; i++) {
    const text = rawLines[i].trim();
    if (text.length > 0) {
      lines.push({text, originalIndex: i});
    }
  }

  if (lines.length > 0) {
    const parsedLines: unknown[] = [];
    let validJSONL = true;
    for (const line of lines) {
      if (!line.text.startsWith('{') || !line.text.endsWith('}')) {
        validJSONL = false;
        break;
      }
      try {
        const parsed = JSON.parse(line.text);
        if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
          parsedLines.push(parsed);
        } else {
          validJSONL = false;
          break;
        }
      } catch (e) {
        lastError = e as Error;
        if (lastError instanceof Error) {
          const details = extractErrorDetails(lastError, line.text);
          return {
            success: false,
            data: null,
            error: {
              message: lastError.message,
              line: line.originalIndex + 1, // 1-indexed relative to raw output
              column: details.column,
              snippet: rawLines[line.originalIndex],
            },
          };
        }
        validJSONL = false;
        break;
      }
    }
    if (validJSONL) {
      return {success: true, data: parsedLines};
    }
  }

  if (lastError instanceof Error) {
    const details = extractErrorDetails(lastError, content);
    return {
      success: false,
      data: null,
      error: {
        message: lastError.message,
        line: details.line,
        column: details.column,
        snippet:
          details.line !== undefined && details.line > 0 && details.line <= rawLines.length
            ? rawLines[details.line - 1]
            : undefined,
      },
    };
  }

  return {success: false, data: null, error: {message: 'Invalid JSON format'}};
}

/**
 * Formats the given value as a JSON string with 2-space indentation.
 *
 * @param value The value to format.
 * @return The formatted JSON string. Returns empty string when value is undefined.
 */
export function formatJson(value: unknown): string {
  return value === undefined ? '' : JSON.stringify(value, null, 2);
}

/**
 * Narrows a parsed JSON value to an indexable object.
 *
 * @param value The value to narrow, typically decoded from an agent payload.
 * @return The value as a record, or null if it is not a plain object.
 */
export function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}
