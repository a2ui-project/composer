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

import {AgentCapability, AgentSkill} from '../../chat/a2a/a2a-types';

/**
 * Agent display details shown in the header and showcase card.
 */
export interface UiAgentInfo {
  /** Display name of the connected agent. */
  name: string;
  /** High-level description of the agent's capabilities. */
  description?: string;
  /** Semantic version identifier of the agent. */
  version?: string;
  /** Base URL or endpoint where the A2A agent server is hosted. */
  endpoint: string;
  /** URL of the agent avatar or icon image. */
  iconUrl?: string;
  /** List of registered skills and actions the agent supports. */
  skills?: AgentSkill[];
  /** Protocol feature flags and capabilities supported by the agent. */
  capabilities?: AgentCapability;
  /** Suggested starter prompts or queries for the agent. */
  samplePrompts?: string[];
}
