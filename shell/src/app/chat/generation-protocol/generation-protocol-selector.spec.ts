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
import {describe, expect, it} from 'vitest';
import type {ProtocolSupport} from '../../storage/catalog-management/catalog-domain';
import {CAR_BOOKING, CAR_BOOKING_V1_0} from '../chat-service/initial-draft';
import {V09DraftStrategy} from '../chat-service/v0-9-draft-strategy';
import {V10DraftStrategy} from '../chat-service/v1-0-draft-strategy';
import {
  existingUiVersion,
  formatUnsupportedGenerationMessage,
  type GenerationProtocolDecision,
  requestedVersions,
  selectGenerationVersion,
} from './generation-protocol-selector';

function makeSupport(
  versions: readonly ('v0.9' | 'v1.0')[],
  defaultVersion: 'v0.9' | 'v1.0' = versions.includes('v1.0') ? 'v1.0' : 'v0.9',
): ProtocolSupport {
  return {
    versions,
    defaultVersion,
    catalogsByVersion: {
      'v0.9': [],
      'v1.0': [],
    },
    announcedCatalogCount: versions.length,
  };
}

describe('generation-protocol-selector', () => {
  const dualSupport = makeSupport(['v1.0', 'v0.9'], 'v1.0');
  const v10OnlySupport = makeSupport(['v1.0'], 'v1.0');
  const v09OnlySupport = makeSupport(['v0.9'], 'v0.9');

  describe('existingUiVersion', () => {
    it('returns null for empty, whitespace, non-array, or unparseable drafts without a version', () => {
      expect(existingUiVersion('')).toBeNull();
      expect(existingUiVersion('   \n  ')).toBeNull();
      expect(existingUiVersion('not valid json {')).toBeNull();
      expect(existingUiVersion('{"createSurface": {"surfaceId": "main"}}')).toBeNull();
      expect(existingUiVersion('[]')).toBeNull();
    });

    it('keeps draft version via raw text fallback when draft contains a syntax error (I2)', () => {
      expect(existingUiVersion('[{"version": "v0.9", "createSurface": {broken')).toBe('v0.9');
      expect(existingUiVersion('[{"version": "1.0", "createSurface": {broken')).toBe('v1.0');
    });

    it('treats untouched blank drafts and single-createSurface placeholders as from-scratch (null)', () => {
      const v09Blank = new V09DraftStrategy().getBlankDraft();
      const v10Blank = new V10DraftStrategy().getBlankDraft();

      expect(existingUiVersion(v09Blank)).toBeNull();
      expect(existingUiVersion(v10Blank)).toBeNull();

      const customV09Placeholder = JSON.stringify([
        {createSurface: {surfaceId: 's1', catalogId: 'https://example.com/c.json'}},
      ]);
      const customV10Placeholder = JSON.stringify([
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: 's1',
            catalogId: 'https://example.com/c.json',
            components: [],
            dataModel: {},
          },
        },
      ]);

      expect(existingUiVersion(customV09Placeholder)).toBeNull();
      expect(existingUiVersion(customV10Placeholder)).toBeNull();
    });

    it('treats single v1.0 createSurface with inline components or dataModel as existing UI', () => {
      const inlineV10 = JSON.stringify([
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: 's1',
            catalogId: 'https://example.com/c.json',
            components: [{id: 'root', component: 'Text', text: 'hi'}],
          },
        },
      ]);
      expect(existingUiVersion(inlineV10)).toBe('v1.0');
    });

    it('counts untouched starter samples as existing UI (A1)', () => {
      expect(existingUiVersion(CAR_BOOKING)).toBe('v0.9');
      expect(existingUiVersion(CAR_BOOKING_V1_0)).toBe('v1.0');
    });

    it('detects existing v0.9 and v1.0 UIs with components or data models', () => {
      const v09WithComponents = JSON.stringify([
        {
          version: 'v0.9',
          createSurface: {surfaceId: 'main', catalogId: 'https://a2ui.org/v0_9.json'},
        },
        {version: 'v0.9', updateComponents: {surfaceId: 'main', components: []}},
      ]);
      const v10WithData = JSON.stringify([
        {
          version: 'v1.0',
          createSurface: {surfaceId: 'main', catalogId: 'https://a2ui.org/v1_0.json'},
        },
        {version: 'v1.0', updateDataModel: {surfaceId: 'main', value: {title: 'Hi'}}},
      ]);

      expect(existingUiVersion(v09WithComponents)).toBe('v0.9');
      expect(existingUiVersion(v10WithData)).toBe('v1.0');
    });

    it('returns null for mixed-version drafts', () => {
      const mixed = JSON.stringify([
        {
          version: 'v0.9',
          createSurface: {surfaceId: 's1', catalogId: 'https://a2ui.org/v0_9.json'},
        },
        {version: 'v1.0', updateComponents: {surfaceId: 's1', components: []}},
      ]);

      expect(existingUiVersion(mixed)).toBeNull();
    });
  });

  describe('requestedVersions', () => {
    it.each<[string, readonly A2uiProtocolVersion[]]>([
      ['use version 0.9', ['v0.9']],
      ['Please use A2UI 0.9', ['v0.9']],
      ['Use spec 0.9', ['v0.9']],
      ['A2UI 1.0', ['v1.0']],
      ['Use protocol 1.0', ['v1.0']],
      ['version  0.9', ['v0.9']],
      ['version: 0.9', ['v0.9']],
      ['version:0.9', ['v0.9']],
      ['version : 0.9', ['v0.9']],
      ['version:\n0.9', ['v0.9']],
      ['protocol: v0.9', ['v0.9']],
      ['protocol:v0.9', ['v0.9']],
      ['A2UI: v1.0', ['v1.0']],
      ['spec: 1.0', ['v1.0']],
      ['version\tv1.0', ['v1.0']],
      ['A2UI\nv0.9', ['v0.9']],
      ['version v0.9', ['v0.9']],
      ['A2UI v0_9 please', ['v0.9']],
      ['A2UI v1_0', ['v1.0']],
      ['A2UI v10', ['v1.0']],
      ['a2ui v09', ['v0.9']],
      ['protocol:v09', ['v0.9']],
      ['protocol: v10', ['v1.0']],
      ['version v10', ['v1.0']],
      ['a2ui: v10 and v0.9', ['v1.0', 'v0.9']],
      ['a2ui/spec 0.9', ['v0.9']],
      ['v0.9/version 1.0', ['v0.9', 'v1.0']],
      ['version: 1.0-beta', ['v1.0']],
      ['a2ui v10-beta', ['v1.0']],
      ['A2UI v1.0-only', ['v1.0']],
    ])(
      'matches keyword-prefixed versions across whitespace/colon separators and keyword dotless shorthand: %j -> %j',
      (requestText, expected) => {
        expect(requestedVersions(requestText)).toEqual(expected);
      },
    );

    it.each<[string, readonly A2uiProtocolVersion[]]>([
      ['Build a v0.9 login form', ['v0.9']],
      ['use v0_9', ['v0.9']],
      ['Generate in V1.0', ['v1.0']],
      ['Use v1_0', ['v1.0']],
      ['use v0.9', ['v0.9']],
      ['v1.0', ['v1.0']],
      ['(v1.0)', ['v1.0']],
      ['"v0.9"', ['v0.9']],
      ['v1.0-card', ['v1.0']],
      ['make it v0.9-compatible', ['v0.9']],
      ['v0.9-style layout', ['v0.9']],
      ['Both v0.9 and v1.0 and v0.9 again', ['v0.9', 'v1.0']],
      ['Convert this v0.9 UI to v1.0', ['v0.9', 'v1.0']],
      ['switch from v1.0 to v0.9', ['v1.0', 'v0.9']],
      ['v0.9-v1.0', ['v0.9', 'v1.0']],
      ['v1.0-v0.9', ['v1.0', 'v0.9']],
      ['version 0.9-v1.0', ['v0.9', 'v1.0']],
      // Pin current range behavior: a hyphenated range with a bare second endpoint yields only the first version.
      ['version 0.9-1.0', ['v0.9']],
    ])(
      'matches standalone v-prefixed dotted/underscored versions, preserves order, and pins ranges: %j -> %j',
      (requestText, expected) => {
        expect(requestedVersions(requestText)).toEqual(expected);
      },
    );

    it.each<string>([
      'v10',
      'V10',
      'v09',
      'use v09',
      'Build a Dyson V10 product card',
      'Fetch items from https://api.example.com/v10/orders',
      'Style the v10-button with icon-v10',
      'Angular v10',
      'version 10',
      'version: 10',
      'spec: 10',
      'protocol 09',
      'a2ui 10',
      'version1.0',
      'spec0.9',
    ])(
      'ignores standalone bare v09/v10, unprefixed dotless numbers, and missing separators: %j',
      input => {
        expect(requestedVersions(input)).toEqual([]);
      },
    );

    it.each<string>([
      'spec = 1.0',
      'spec=1.0',
      'spec=v10',
      'a2ui-1.0',
      'a2ui-10',
      'version - 1.0',
      'version- 1.0',
      'version -1.0',
      'version: -1.0',
      'if (version == 1.0)',
      'version := 1.0',
      'https://api.example.com/items?protocol=1.0',
      '?version=1.0',
      '?protocol:1.0',
      '&version 1.0',
      'x=protocol 1.0',
      '$version 1.0',
      'aspect-spec 1.0',
      'sub-version 1.0',
      'app.version: 1.0',
      'subversion 1.0',
      'Style the spec-1.0-card',
      'Style the version-v10-button',
    ])('ignores = and - keyword separators and compound/URL left boundaries: %j', input => {
      expect(requestedVersions(input)).toEqual([]);
    });

    it.each<string>([
      '',
      'Make the title blue',
      'set the opacity to 0.9',
      'opacity:0.9;',
      'opacity: 0.9',
      'make it 0.9rem',
      'scale the logo by 1.0',
      'line-height 1.0',
      'line-height: 1.0',
      'Add a $1.00 tip button and 0.95 opacity',
      'Upgrade to 1.0.2 or 20.9',
      'A2UI v100',
      'A2UI v090',
      'A2UI v10px',
      'A2UI v10.5',
      'a2ui v10.5',
      'a2ui v100',
      'version v1.0.2',
      'spec 1.0.2',
      'version 0.95',
      'v1.0.2',
      'v0.9_foo',
      '$1.00',
      '$v1.0',
      'foo.v1.0',
      'av1.0',
      'v100',
      'v090',
      'rev10',
      'mv10',
      'v10px',
      'v10.5',
    ])(
      'ignores CSS/numeric decimals, sub-versions, and prefixed/suffixed identifiers: %j',
      input => {
        expect(requestedVersions(input)).toEqual([]);
      },
    );
  });

  describe('selectGenerationVersion', () => {
    const v09Ui = JSON.stringify([
      {
        version: 'v0.9',
        createSurface: {surfaceId: 'main', catalogId: 'https://a2ui.org/v0_9.json'},
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'main',
          components: [{id: 'root', component: 'Text', text: 'hi'}],
        },
      },
    ]);
    const v10Ui = JSON.stringify([
      {
        version: 'v1.0',
        createSurface: {surfaceId: 'main', catalogId: 'https://a2ui.org/v1_0.json'},
      },
      {
        version: 'v1.0',
        updateComponents: {
          surfaceId: 'main',
          components: [{id: 'root', component: 'Text', text: 'hi'}],
        },
      },
    ]);
    const v09Placeholder = new V09DraftStrategy().getBlankDraft();
    const v10Placeholder = new V10DraftStrategy().getBlankDraft();

    it('defaults from-scratch generation to v1.0 on dual and v1.0 renderers, and replaces when placeholder version differs (M1)', () => {
      expect(
        selectGenerationVersion({
          draft: v09Placeholder,
          requestText: 'Build a login form',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: true});

      expect(
        selectGenerationVersion({
          draft: v10Placeholder,
          requestText: 'Build a login form',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: false});

      expect(
        selectGenerationVersion({
          draft: '',
          requestText: 'Build a login form',
          support: v10OnlySupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: false});

      expect(
        selectGenerationVersion({
          draft: v09Placeholder,
          requestText: 'Build a login form',
          support: v09OnlySupport,
        }),
      ).toEqual({kind: 'selected', version: 'v0.9', replacesDraft: false});
    });

    it('honors an explicit v0.9 request from scratch and replaces only when placeholder version differs (M1)', () => {
      expect(
        selectGenerationVersion({
          draft: v09Placeholder,
          requestText: 'Build a v0.9 login form',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v0.9', replacesDraft: false});

      expect(
        selectGenerationVersion({
          draft: v10Placeholder,
          requestText: 'Build a login form in A2UI v0.9',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v0.9', replacesDraft: true});
    });

    it('keeps the existing UI version when editing without an explicit version change', () => {
      expect(
        selectGenerationVersion({
          draft: v09Ui,
          requestText: 'Add a submit button',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v0.9', replacesDraft: false});

      expect(
        selectGenerationVersion({
          draft: CAR_BOOKING,
          requestText: 'Change the car color',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v0.9', replacesDraft: false});

      expect(
        selectGenerationVersion({
          draft: v10Ui,
          requestText: 'Add a subtitle',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: false});
    });

    it('lets an explicit ask for a different supported version win and replaces the draft (A2)', () => {
      expect(
        selectGenerationVersion({
          draft: v10Ui,
          requestText: 'Rebuild this in v0.9',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v0.9', replacesDraft: true});

      expect(
        selectGenerationVersion({
          draft: v09Ui,
          requestText: 'Upgrade this to v1.0',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: true});

      expect(
        selectGenerationVersion({
          draft: v09Ui,
          requestText: 'Keep it in v0.9 and add a button',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v0.9', replacesDraft: false});
    });

    it.each<[string, string, GenerationProtocolDecision]>([
      ['use protocol: 0.9', v10Ui, {kind: 'selected', version: 'v0.9', replacesDraft: true}],
      ['use A2UI v09', v10Ui, {kind: 'selected', version: 'v0.9', replacesDraft: true}],
      [
        'make the title version 10',
        v09Ui,
        {kind: 'selected', version: 'v0.9', replacesDraft: false},
      ],
      [
        'Build a Dyson V10 product card',
        v09Ui,
        {kind: 'selected', version: 'v0.9', replacesDraft: false},
      ],
      [
        'fetch https://api.example.com/items?protocol=1.0',
        v09Ui,
        {kind: 'selected', version: 'v0.9', replacesDraft: false},
      ],
    ])(
      'handles colon/keyword-dotless version asks and ignores non-keyword v10, query params, and bare version 10: %j',
      (requestText, draft, expected) => {
        expect(
          selectGenerationVersion({
            draft,
            requestText,
            support: dualSupport,
          }),
        ).toEqual(expected);
      },
    );

    it('handles requests naming both versions (C2/R3): converts away from existing UI, or defaults when no existing UI', () => {
      expect(
        selectGenerationVersion({
          draft: v09Ui,
          requestText: 'Convert this v0.9 UI to v1.0',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: true});

      expect(
        selectGenerationVersion({
          draft: v09Ui,
          requestText: 'convert this from v0.9 to v1.0',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: true});

      expect(
        selectGenerationVersion({
          draft: v10Ui,
          requestText: 'convert this v1.0 UI to v0.9',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v0.9', replacesDraft: true});

      expect(
        selectGenerationVersion({
          draft: '',
          requestText: 'compare v0.9 and v1.0',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: false});

      expect(
        selectGenerationVersion({
          draft: v10Placeholder,
          requestText: 'compare v0.9 and v1.0',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: false});
    });

    it('keeps unparseable drafts with explicit version and treats unversioned ones as from-scratch (I2)', () => {
      expect(
        selectGenerationVersion({
          draft: '{"version": "v0.9", broken',
          requestText: 'Fix the form',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v0.9', replacesDraft: false});

      expect(
        selectGenerationVersion({
          draft: '{broken json',
          requestText: 'Build a form',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: false});
    });

    it('falls back to renderer default and replaces when the existing draft version is unsupported (A3)', () => {
      expect(
        selectGenerationVersion({
          draft: v09Ui,
          requestText: 'Add a button',
          support: v10OnlySupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: true});

      expect(
        selectGenerationVersion({
          draft: v10Ui,
          requestText: 'Add a button',
          support: v09OnlySupport,
        }),
      ).toEqual({kind: 'selected', version: 'v0.9', replacesDraft: true});
    });

    it('returns unsupported-request when the user asks for a version the renderer does not support', () => {
      expect(
        selectGenerationVersion({
          draft: v09Placeholder,
          requestText: 'Generate a v0.9 form',
          support: v10OnlySupport,
        }),
      ).toEqual({
        kind: 'unsupported-request',
        requested: 'v0.9',
        supported: ['v1.0'],
      });

      expect(
        selectGenerationVersion({
          draft: v09Ui,
          requestText: 'Convert this to v1.0',
          support: v09OnlySupport,
        }),
      ).toEqual({
        kind: 'unsupported-request',
        requested: 'v1.0',
        supported: ['v0.9'],
      });
    });

    it('treats unparseable drafts as from-scratch without setting replacesDraft', () => {
      expect(
        selectGenerationVersion({
          draft: '{broken json',
          requestText: 'Build a form',
          support: dualSupport,
        }),
      ).toEqual({kind: 'selected', version: 'v1.0', replacesDraft: false});
    });
  });

  describe('formatUnsupportedGenerationMessage', () => {
    it('formats the exact refusal message for unsupported requested versions', () => {
      expect(formatUnsupportedGenerationMessage('v0.9', ['v1.0'])).toBe(
        "The selected renderer supports A2UI v1.0 only, so I can't generate v0.9 for it. Ask again without a version, or select a renderer that supports v0.9.",
      );
      expect(formatUnsupportedGenerationMessage('v1.0', ['v0.9'])).toBe(
        "The selected renderer supports A2UI v0.9 only, so I can't generate v1.0 for it. Ask again without a version, or select a renderer that supports v1.0.",
      );
    });
  });
});
