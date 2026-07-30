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

import {Injectable} from '@angular/core';
import {tryParseJsonArray} from '../../utils/json';

const MD_FENCE_REGEX = /```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi;
const TAG_REGEX = /<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi;
const PULSE_INDICATOR_REGEX = /\s*●●●\s*$/g;

/**
 * Service for cleaning and processing raw LLM chat messages, including
 * pulse indicator handling, thinking tag stripping, markdown fence extraction,
 * and layout snapshot detection.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatCleaner {
  readonly PULSE_INDICATOR = '●●●';

  /**
   * Appends the streaming pulse indicator to the given text.
   */
  appendPulse(text: string): string {
    return `${text} ${this.PULSE_INDICATOR}`;
  }

  /**
   * Strips trailing streaming pulse indicators and surrounding whitespace.
   */
  stripPulse(text: string): string {
    PULSE_INDICATOR_REGEX.lastIndex = 0;
    return text.replace(PULSE_INDICATOR_REGEX, '').trim();
  }

  /**
   * Strips XML/HTML thinking tags from the given text.
   */
  stripThinkingTags(text: string): string {
    TAG_REGEX.lastIndex = 0;
    return text.replace(TAG_REGEX, '').trim();
  }

  /**
   * Extracts content from markdown code fences if present.
   */
  extractCodeFences(text: string): {extracted: string; hasFences: boolean} {
    MD_FENCE_REGEX.lastIndex = 0;
    const matches = Array.from(text.matchAll(MD_FENCE_REGEX));
    if (matches.length > 0) {
      return {
        extracted: matches.map(m => m[1].trim()).join('\n'),
        hasFences: true,
      };
    }
    return {
      extracted: text.trim(),
      hasFences: false,
    };
  }

  /**
   * Cleans payload by stripping pulse indicators, XML/HTML thinking tags, and
   * markdown code fences, and isolates JSON start `{` / `[` without truncating
   * prose brackets.
   */
  cleanPayload(text: string): string {
    let result = this.stripPulse(text);
    result = this.stripThinkingTags(result);
    const fenceResult = this.extractCodeFences(result);
    result = fenceResult.extracted;

    if (!result.startsWith('{') && !result.startsWith('[')) {
      const jsonMatches = Array.from(result.matchAll(/[\{\[]/g));
      for (const match of jsonMatches) {
        if (match.index !== undefined && match.index >= 0) {
          const candidate = result.substring(match.index).trim();
          if (
            (candidate.startsWith('{') && candidate.includes('"version"')) ||
            (candidate.startsWith('[') &&
              /^\[\s*[\{\"]/.test(candidate) &&
              (candidate.includes('"version"') ||
                candidate.includes('"createSurface"') ||
                candidate.includes('"updateComponents"'))) ||
            tryParseJsonArray(candidate) !== null
          ) {
            result = candidate;
            break;
          }
        }
      }
    }

    return result.trim();
  }

  /**
   * Determines if the given text represents an A2UI layout snapshot.
   */
  isLayoutSnapshot(text: string): boolean {
    const trimmed = this.cleanPayload(text);
    return (
      trimmed.startsWith('{"version"') ||
      (trimmed.startsWith('{') && trimmed.includes('"version"')) ||
      (trimmed.startsWith('[') &&
        (trimmed.includes('"version"') ||
          trimmed.includes('"createSurface"') ||
          trimmed.includes('"updateComponents"'))) ||
      tryParseJsonArray(trimmed) !== null
    );
  }
}
