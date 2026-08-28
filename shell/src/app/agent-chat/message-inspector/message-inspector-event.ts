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
 * A recorded A2A event item for the Message Inspector debugger.
 */
export interface MessageInspectorEvent {
  /** Unique identifier for the recorded protocol trace event. */
  id: string;
  /** Timestamp when the event was transmitted or received. */
  timestamp: Date | number;
  /** Transport direction indicating whether the event was sent, received, or errored. */
  direction: 'sent' | 'received' | 'error';
  /** Human-readable headline summarizing the event type and method. */
  summary: string;
  /** Full raw JSON payload or error object associated with the event. */
  payload: unknown;
}

/**
 * @deprecated Use MessageInspectorEvent instead.
 */
export type InspectorEvent = MessageInspectorEvent;
