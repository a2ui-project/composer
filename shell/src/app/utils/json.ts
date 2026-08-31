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
 * @return The formatted JSON string.
 */
export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
