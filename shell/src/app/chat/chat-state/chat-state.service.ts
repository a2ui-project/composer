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

import {Injectable, signal} from '@angular/core';
import {LlmMessage} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';

@Injectable({
  providedIn: 'root',
})
/**
 * Zero-dependency standalone reactive state database for the Gemini sidebar
 * workspace, hosting chat histories, rendering pipeline statuses, and stream
 * locking indicators. Eliminates circular dependencies between domain
 * coordinators and layout synchronizers.
 */
export class ChatStateService {
  /**
   * Backing dynamic, reactive Signal array storing conversational turn history
   * records. Encapsulated as private to enforce transactional integrity.
   */
  private readonly _chatHistory = signal<LlmMessage[]>([]);

  /**
   * Reactively mapped rendering pipeline execution milestones overlay badge.
   * Encapsulated as private to prevent raw, state-violating write turns.
   */
  private readonly _pipelineStatus = signal<PipelineStatus>(PipelineStatus.IDLE);

  /**
   * Programmatic locking Signal protecting screens and preview panels against
   * deadlock turns. Encapsulated as private.
   */
  private readonly _isProgrammaticStreamActive = signal<boolean>(false);

  /**
   * Public readonly signal exposing conversational history segments securely.
   */
  public readonly chatHistory = this._chatHistory.asReadonly();

  /**
   * Public readonly signal exposing active rendering pipeline milestones.
   */
  public readonly pipelineStatus = this._pipelineStatus.asReadonly();

  /**
   * Public readonly signal exposing stream locks state reactively.
   */
  public readonly isProgrammaticStreamActive = this._isProgrammaticStreamActive.asReadonly();

  /**
   * Overwrites the complete active conversational history array safely.
   *
   * @param history The target complete list of LlmMessage records.
   */
  setChatHistory(history: LlmMessage[]): void {
    this._chatHistory.set(history);
  }

  /**
   * Updates the conversational history array using a standard updater callback.
   * Encourages cohesive transactional transitions.
   *
   * @param updater Callback mapping current history to updated turn segments.
   */
  updateChatHistory(updater: (history: LlmMessage[]) => LlmMessage[]): void {
    this._chatHistory.update(updater);
  }

  /**
   * Transitions and writes the active rendering pipeline milestone state.
   *
   * @param status The target executing pipeline milestone value.
   */
  setPipelineStatus(status: PipelineStatus): void {
    this._pipelineStatus.set(status);
  }

  /**
   * Modulates programmatic lock holds protecting screens and visual boundaries.
   *
   * @param active Indicator representing active stream routing turns.
   */
  setProgrammaticStreamActive(active: boolean): void {
    this._isProgrammaticStreamActive.set(active);
  }
}
