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
 * Attempts to parse the provided string content as a JSON array.
 * Returns the parsed array if successful, or null if the string is not a valid JSON array.
 *
 * @param content The string content to parse.
 * @returns The parsed array, or null if parsing fails or the content is not an array.
 */
export function tryParseJsonArray(content: string): unknown[] | null {
  const trimmed = content.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // Ignore and return null
    }
  }
  return null;
}
