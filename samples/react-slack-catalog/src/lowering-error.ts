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

/** What a `LoweringError` reports. */
export interface LoweringErrorOptions {
  /**
   * A `DiagnosticCode`, or the code of an error the A2UI surface reported while
   * binding data, such as `EXPRESSION_ERROR`.
   */
  readonly code: string;
  /** What is wrong, for the person editing the surface. */
  readonly message: string;
  /** The A2UI component the problem is in, when there is one. */
  readonly componentId?: string;
}

/**
 * An error that stops the preview from turning an A2UI surface into Slack
 * blocks, such as a component with no Slack equivalent, a value Slack doesn't
 * accept, or blocks over one of Slack's limits. Throw it while turning the
 * surface into Slack blocks or checking those blocks. The preview then draws no
 * Slack blocks for the surface, and lists one diagnostic with this error's
 * `code`, `message` and `componentId`.
 */
export class LoweringError extends Error {
  /** A `DiagnosticCode`, or the code of an error the A2UI surface reported. */
  readonly code: string;
  /** The A2UI component the problem is in, when there is one. */
  readonly componentId?: string;

  constructor({code, message, componentId}: LoweringErrorOptions) {
    super(message);
    this.name = 'LoweringError';
    this.code = code;
    this.componentId = componentId;
  }
}
