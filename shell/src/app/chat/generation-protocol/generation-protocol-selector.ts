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

import type {A2uiProtocolVersion} from 'a2ui-bridge';
import {inspectPayloadVersion} from '../../preview/protocol-version-mismatch';
import type {ProtocolSupport} from '../../storage/catalog-management/catalog-domain';
import {tryParseJsonArray} from '../../utils/json';
import {
  detectRawJsonDraftVersion,
  isUntouchedBlankDraft,
} from '../chat-service/draft-protocol-strategy';

// Match explicit `v0.9`/`v0_9`/`v1.0`/`v1_0` (with required `v`) or bare `0.9`/`1.0` preceded by
// a protocol keyword (`a2ui`/`version`/`protocol`/`spec`), excluding CSS/numeric decimals
// (`opacity: 0.9`, `0.9rem`, `scale ... 1.0`) and sub-versions/identifiers (`v1.0.2`, `v0.9_foo`).
const VERSION_MENTION_PATTERN =
  /\b(?:a2ui|version|protocol|spec)\s+v?(0[._]9|1[._]0)(?![a-zA-Z\d_]|(?:\.\d))|(?<![.$\w])v(0[._]9|1[._]0)(?![a-zA-Z\d_]|(?:\.\d))/gi;

/**
 * Outcome of selecting the A2UI protocol version for a chat generation run.
 */
export type GenerationProtocolDecision =
  | {
      readonly kind: 'selected';
      readonly version: A2uiProtocolVersion;
      readonly replacesDraft: boolean;
    }
  | {
      readonly kind: 'unsupported-request';
      readonly requested: A2uiProtocolVersion;
      readonly supported: readonly A2uiProtocolVersion[];
    };

/**
 * Inputs used to select the protocol version for a chat generation run.
 */
export interface GenerationProtocolInput {
  readonly draft: string;
  readonly requestText: string;
  readonly support: ProtocolSupport;
}

function detectDraftVersion(draft: string): A2uiProtocolVersion | null {
  const trimmed = draft.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = tryParseJsonArray(trimmed);
  if (!parsed.success) {
    return detectRawJsonDraftVersion(trimmed);
  }
  if (parsed.data.length === 0) {
    return null;
  }
  const inspection = inspectPayloadVersion(parsed.data);
  return inspection.status === 'detected' ? inspection.version : null;
}

/**
 * Returns the protocol version of an existing non-placeholder draft, or `null`
 * when the draft is blank, a single-`createSurface` placeholder, unparseable
 * without an explicit `"version"` key, or mixed-version.
 */
export function existingUiVersion(draft: string): A2uiProtocolVersion | null {
  if (!draft.trim() || isUntouchedBlankDraft(draft)) {
    return null;
  }
  return detectDraftVersion(draft);
}

/**
 * Returns distinct A2UI protocol versions explicitly mentioned in `requestText`,
 * ordered by first appearance.
 */
export function requestedVersions(requestText: string): readonly A2uiProtocolVersion[] {
  if (!requestText) {
    return [];
  }
  const seen = new Set<A2uiProtocolVersion>();
  const matches = requestText.matchAll(VERSION_MENTION_PATTERN);
  for (const match of matches) {
    const raw = match[1] ?? match[2] ?? '';
    const version: A2uiProtocolVersion = raw.startsWith('0') ? 'v0.9' : 'v1.0';
    seen.add(version);
  }
  return [...seen];
}

/**
 * Picks the protocol version for a chat generation turn in one place across
 * the coordinator and prompt preview.
 */
export function selectGenerationVersion(
  input: GenerationProtocolInput,
): GenerationProtocolDecision {
  const draftVersion = detectDraftVersion(input.draft);
  const existing = isUntouchedBlankDraft(input.draft) ? null : draftVersion;
  const requests = requestedVersions(input.requestText);
  const {versions, defaultVersion} = input.support;

  let requested: A2uiProtocolVersion | null = null;
  if (requests.length === 1) {
    requested = requests[0];
  } else if (requests.length > 1 && existing !== null) {
    requested = requests.find(v => v !== existing) ?? null;
  }

  if (requested !== null) {
    if (!versions.includes(requested)) {
      return {
        kind: 'unsupported-request',
        requested,
        supported: versions,
      };
    }
    return {
      kind: 'selected',
      version: requested,
      replacesDraft: draftVersion !== null && draftVersion !== requested,
    };
  }

  if (existing !== null) {
    const version = versions.includes(existing) ? existing : defaultVersion;
    return {
      kind: 'selected',
      version,
      replacesDraft: version !== existing,
    };
  }

  return {
    kind: 'selected',
    version: defaultVersion,
    replacesDraft: draftVersion !== null && draftVersion !== defaultVersion,
  };
}

/**
 * Formats the assistant message shown when the user explicitly requests a
 * protocol version the selected renderer does not support.
 */
export function formatUnsupportedGenerationMessage(
  requested: A2uiProtocolVersion,
  supported: readonly A2uiProtocolVersion[],
): string {
  const supportedLabel = supported.length > 0 ? supported.join(' and ') : 'none';
  return `The selected renderer supports A2UI ${supportedLabel} only, so I can't generate ${requested} for it. Ask again without a version, or select a renderer that supports ${requested}.`;
}
