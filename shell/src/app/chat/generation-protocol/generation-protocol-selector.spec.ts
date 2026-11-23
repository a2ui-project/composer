import {describe, expect, it} from 'vitest';
import type {ProtocolSupport} from '../../storage/catalog-management/catalog-domain';
import {CAR_BOOKING, CAR_BOOKING_V1_0} from '../chat-service/initial-draft';
import {V09DraftStrategy} from '../chat-service/v0-9-draft-strategy';
import {V10DraftStrategy} from '../chat-service/v1-0-draft-strategy';
import {
  existingUiVersion,
  formatUnsupportedGenerationMessage,
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
    it('extracts explicit v0.9, v0_9, v1.0, v1_0 and keyword-prefixed asks case-insensitively (C1)', () => {
      expect(requestedVersions('Build a v0.9 login form')).toEqual(['v0.9']);
      expect(requestedVersions('use v0_9')).toEqual(['v0.9']);
      expect(requestedVersions('A2UI v0_9 please')).toEqual(['v0.9']);
      expect(requestedVersions('use version 0.9')).toEqual(['v0.9']);
      expect(requestedVersions('Please use A2UI 0.9')).toEqual(['v0.9']);
      expect(requestedVersions('Use spec 0.9')).toEqual(['v0.9']);
      expect(requestedVersions('Generate in V1.0')).toEqual(['v1.0']);
      expect(requestedVersions('A2UI 1.0')).toEqual(['v1.0']);
      expect(requestedVersions('Use v1_0')).toEqual(['v1.0']);
      expect(requestedVersions('Use protocol 1.0')).toEqual(['v1.0']);
      expect(requestedVersions('Both v0.9 and v1.0 and v0.9 again')).toEqual(['v0.9', 'v1.0']);
    });

    it('ignores bare decimals, CSS values, and versioned sub-numbers (C1)', () => {
      expect(requestedVersions('')).toEqual([]);
      expect(requestedVersions('set the opacity to 0.9')).toEqual([]);
      expect(requestedVersions('opacity:0.9;')).toEqual([]);
      expect(requestedVersions('make it 0.9rem')).toEqual([]);
      expect(requestedVersions('scale the logo by 1.0')).toEqual([]);
      expect(requestedVersions('line-height 1.0')).toEqual([]);
      expect(requestedVersions('Add a $1.00 tip button and 0.95 opacity')).toEqual([]);
      expect(requestedVersions('Upgrade to 1.0.2 or 20.9')).toEqual([]);
      expect(requestedVersions('Make the title blue')).toEqual([]);
    });
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
