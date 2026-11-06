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

/** Maximum payload byte length for combinatorial bracket healing heuristics. */
const MAX_HEALING_BUFFER_LENGTH = 256 * 1024;

/**
 * Attempts syntax healing on malformed or truncated JSON strings produced by streaming LLMs.
 * Strips trailing commas and injects balanced closing brackets and braces.
 *
 * @param line - Raw text line or JSON snippet to repair.
 * @returns Parsed JavaScript value if recovery succeeds, or null if unrecoverable.
 */
export function attemptSyntaxHealing(line?: string | null): unknown | null {
  if (line == null || line.trim().length === 0) {
    return null;
  }
  let patched = line.trim();

  // Guard against excessive payloads to prevent combinatorial parsing overhead
  if (patched.length > MAX_HEALING_BUFFER_LENGTH) {
    return null;
  }

  patched = patched.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(patched);
  } catch (_) {
    // 1. Try closing open objects (e.g. truncated inner properties)
    for (let i = 1; i <= 5; i++) {
      try {
        return JSON.parse(patched + '}'.repeat(i));
      } catch (_) {}
    }
    // 2. Try closing objects nested within arrays (curly braces followed by square brackets)
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        try {
          return JSON.parse(patched + '}'.repeat(i) + ']'.repeat(j));
        } catch (_) {}
      }
    }
    // 3. Try closing arrays nested within objects (square brackets followed by curly braces)
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        try {
          return JSON.parse(patched + ']'.repeat(i) + '}'.repeat(j));
        } catch (_) {}
      }
    }
  }

  return null;
}
