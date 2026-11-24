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

const VERSION_GROUP = {
  keywordPrefixed: 'kwPrefixed',
  keywordBare: 'kwBare',
  standalone: 'standalone',
} as const;

const DOTTED_VERSION = String.raw`(?:0[._]9|1[._]0)`;
const DOTLESS_SHORTHAND = String.raw`(?:09|10)`;
const KEYWORD_LEFT_BOUNDARY = String.raw`(?<![.$\w?&=-])`;
const KEYWORD = String.raw`(?:a2ui|version|protocol|spec)`;
const KEYWORD_SEPARATOR = String.raw`(?:\s*:\s*|\s+)`;
const STANDALONE_LEFT_BOUNDARY = String.raw`(?<![.$\w])`;
const TRAILING_BOUNDARY = String.raw`(?!\w|\.\d)`;

const KEYWORD_FORM = String.raw`${KEYWORD_LEFT_BOUNDARY}${KEYWORD}${KEYWORD_SEPARATOR}(?:v(?<${VERSION_GROUP.keywordPrefixed}>${DOTTED_VERSION}|${DOTLESS_SHORTHAND})|(?<${VERSION_GROUP.keywordBare}>${DOTTED_VERSION}))`;
const STANDALONE_FORM = String.raw`${STANDALONE_LEFT_BOUNDARY}v(?<${VERSION_GROUP.standalone}>${DOTTED_VERSION})`;

// Match either:
// 1. Keyword form (`KEYWORD_FORM`): a protocol keyword (`a2ui`, `version`, `protocol`, `spec`),
//    protected by `KEYWORD_LEFT_BOUNDARY` against preceding `\w` or `.`, `$`, `?`, `&`, `=`, `-`
//    (blocks compound tokens and URL query keys like `sub-version 1.0`, `app.version: 1.0`,
//    `?protocol:1.0`, `&version 1.0`), followed by ONE separator (whitespace or a single colon
//    with optional surrounding whitespace), and either dotted/underscored `0.9`/`1.0` or
//    `v`-prefixed versions including dotless `v09`/`v10`.
//    - The stricter left boundary applies only to bare and dotless keyword forms (`v`-dotted
//      versions are still matched by `STANDALONE_FORM` regardless of what precedes the keyword).
//    - `=` and `-` are deliberately excluded as separators (URL queries, CSS/component names,
//      subtraction).
//    - Dotless shorthand requires a keyword because bare `v10`/`v09` collides with product names
//      (`Dyson V10`), URLs (`/v10/`), and identifiers (`v10-button`, `Angular v10`), while bare
//      `"version 10"` without `v` is excluded so prose numbers do not trigger whole-UI
//      regeneration or refusal.
//    - Pre-existing UI prose like `"version 1.0"` still matches (accepted).
// 2. Standalone form (`STANDALONE_FORM`): `v`-prefixed dotted/underscored `0.9`/`1.0`, protected by
//    `STANDALONE_LEFT_BOUNDARY` against preceding `.`, `$`, or `\w`.
// Both forms share `TRAILING_BOUNDARY`, which rejects trailing `\w` and `.\d` (blocking `0.95`,
// `1.0.2`, `v0.9_foo`, `a2ui v10.5`, `a2ui v100`), while hyphenated descriptors (`v1.0-card`,
// `version: 1.0-beta`, `a2ui v10-beta`) match and are accepted. Ranges with a bare second endpoint
// (`version 0.9-1.0`) yield only the first version, while `v`-prefixed endpoints
// (`version 0.9-v1.0`, `v0.9-v1.0`) yield both.
const VERSION_MENTION_PATTERN = new RegExp(
  String.raw`(?:${KEYWORD_FORM}|${STANDALONE_FORM})${TRAILING_BOUNDARY}`,
  'gi',
);

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
    const groups = match.groups;
    const raw =
      groups?.[VERSION_GROUP.keywordPrefixed] ??
      groups?.[VERSION_GROUP.keywordBare] ??
      groups?.[VERSION_GROUP.standalone];
    if (!raw) {
      throw new Error('VERSION_MENTION_PATTERN matched without a named version capture group');
    }
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
