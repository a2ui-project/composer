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
 * Represents the sequence status points in the code generation pipeline.
 * Coordinates rendering updates and recovery loops in the shell interface.
 */
export enum PipelineStatus {
  /** System is idle, ready for new operational instructions. */
  IDLE = 'idle',
  /** Streamed LLM packets are currently being accumulated from the network. */
  RECEIVING_STREAM = 'receiving_stream',
  /** The full code response body has been received but not processed. */
  RECEIVED_RAW = 'received_raw',
  /** Current payload changes are undergoing validation constraints checking. */
  VALIDATING = 'validating',
  /** Applying fallback auto-healing patches to corrupted code structures. */
  HEALING = 'healing',
  /** Content is validated, healed, and compiled into the preview frame. */
  READY = 'ready',
  /** Pipeline sequence was aborted due to critical unrecoverable failures. */
  FAILED = 'failed',
}
