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

import {describe, expect, it} from 'vitest';
import type {Catalog} from '../models/catalog-storage.model';
import {
  catalogProtocolVersion,
  resolveProtocolSupport,
  resolveProtocolVersion,
  selectCatalogsForVersion,
} from './catalog-domain';

describe('catalogProtocolVersion', () => {
  it('returns null when protocolVersion is omitted or empty', () => {
    expect(catalogProtocolVersion({catalogId: 'c1'})).toBeNull();
    expect(catalogProtocolVersion({catalogId: 'c1', protocolVersion: ''})).toBeNull();
    expect(catalogProtocolVersion({catalogId: 'c1', protocolVersion: '   '})).toBeNull();
  });

  it('returns v1.0 for 1.0 and v1.x protocolVersion strings', () => {
    expect(catalogProtocolVersion({catalogId: 'c1', protocolVersion: '1.0'})).toBe('v1.0');
    expect(catalogProtocolVersion({catalogId: 'c1', protocolVersion: 'v1.0'})).toBe('v1.0');
    expect(catalogProtocolVersion({catalogId: 'c1', protocolVersion: '1.1'})).toBe('v1.0');
  });

  it('returns v0.9 for 0.9 and v0.9 protocolVersion strings', () => {
    expect(catalogProtocolVersion({catalogId: 'c1', protocolVersion: '0.9'})).toBe('v0.9');
    expect(catalogProtocolVersion({catalogId: 'c1', protocolVersion: 'v0.9'})).toBe('v0.9');
  });

  it('returns null for unrecognized protocolVersion strings', () => {
    expect(catalogProtocolVersion({catalogId: 'c1', protocolVersion: 'unknown'})).toBeNull();
  });
});

describe('resolveProtocolSupport', () => {
  it('defaults to v0.9 with zero announced catalogs before handshake settles', () => {
    expect(resolveProtocolSupport(false, [], false, null)).toEqual({
      defaultVersion: 'v0.9',
      versions: ['v0.9'],
      catalogsByVersion: {},
      announcedCatalogCount: 0,
    });
  });

  it('returns v1.0 default and zero count on settled empty catalog without error', () => {
    expect(resolveProtocolSupport(true, [], false, null)).toEqual({
      defaultVersion: 'v1.0',
      versions: ['v1.0'],
      catalogsByVersion: {},
      announcedCatalogCount: 0,
    });
  });

  it('returns v0.9 default and zero count on settled catalog error', () => {
    expect(resolveProtocolSupport(true, [], true, null)).toEqual({
      defaultVersion: 'v0.9',
      versions: ['v0.9'],
      catalogsByVersion: {},
      announcedCatalogCount: 0,
    });
  });

  it('models a v0.9-only renderer with count 1', () => {
    const slackCatalog: Catalog = {
      catalogId: 'https://a2ui.org/slack/catalog.json',
      protocolVersion: '0.9',
      components: {Text: {type: 'object'}},
    };
    expect(resolveProtocolSupport(true, [slackCatalog], false, slackCatalog)).toEqual({
      defaultVersion: 'v0.9',
      versions: ['v0.9'],
      catalogsByVersion: {'v0.9': [slackCatalog]},
      announcedCatalogCount: 1,
    });
  });

  it('models a v1.0-only renderer with count 1', () => {
    const v1Catalog: Catalog = {
      catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
      protocolVersion: '1.0',
      components: {Text: {type: 'object'}},
    };
    expect(resolveProtocolSupport(true, [v1Catalog], false, v1Catalog)).toEqual({
      defaultVersion: 'v1.0',
      versions: ['v1.0'],
      catalogsByVersion: {'v1.0': [v1Catalog]},
      announcedCatalogCount: 1,
    });
  });

  it('assigns catalogs with undeclared version to defaultVersion', () => {
    const undeclaredCatalog: Catalog = {
      catalogId: 'https://example.com/undeclared.json',
      components: {Text: {type: 'object'}},
    };
    expect(resolveProtocolSupport(true, [undeclaredCatalog], false, undeclaredCatalog)).toEqual({
      defaultVersion: 'v0.9',
      versions: ['v0.9'],
      catalogsByVersion: {'v0.9': [undeclaredCatalog]},
      announcedCatalogCount: 1,
    });
  });

  it('models an older bridge with only a primary catalog and no list (count 1)', () => {
    const primaryCatalog: Catalog = {
      catalogId: 'https://example.com/legacy.json',
      components: {Text: {type: 'object'}},
    };
    expect(resolveProtocolSupport(true, [], false, primaryCatalog)).toEqual({
      defaultVersion: 'v0.9',
      versions: ['v0.9'],
      catalogsByVersion: {'v0.9': [primaryCatalog]},
      announcedCatalogCount: 1,
    });
  });

  it('models [v1.0, mcp v1.0, v0.9 Composer id, v0.9 npm id] with defaultVersion v1.0 first and count 4', () => {
    const v1Basic: Catalog = {
      catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
      protocolVersion: '1.0',
      components: {Text: {type: 'object'}},
    };
    const mcpV1: Catalog = {
      catalogId: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
      protocolVersion: '1.0',
      functions: {callMcpTool: {type: 'object'}},
    };
    const v09Composer: Catalog = {
      catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      protocolVersion: '0.9',
      components: {Text: {type: 'object'}},
    };
    const v09Npm: Catalog = {
      catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
      protocolVersion: '0.9',
      components: {Text: {type: 'object'}},
    };

    expect(
      resolveProtocolSupport(true, [v1Basic, mcpV1, v09Composer, v09Npm], false, v1Basic),
    ).toEqual({
      defaultVersion: 'v1.0',
      versions: ['v1.0', 'v0.9'],
      catalogsByVersion: {
        'v1.0': [v1Basic, mcpV1],
        'v0.9': [v09Composer, v09Npm],
      },
      announcedCatalogCount: 4,
    });
  });

  it('agrees between resolveProtocolVersion and resolveProtocolSupport on whitespace-padded protocolVersion (F3)', () => {
    const paddedV10: Catalog = {
      catalogId: 'https://example.com/v10-padded.json',
      protocolVersion: ' 1.0 ',
      components: {Text: {type: 'object'}},
    };
    expect(resolveProtocolVersion(true, [paddedV10], false, paddedV10)).toBe('v1.0');
    expect(resolveProtocolSupport(true, [paddedV10], false, paddedV10)).toEqual({
      defaultVersion: 'v1.0',
      versions: ['v1.0'],
      catalogsByVersion: {'v1.0': [paddedV10]},
      announcedCatalogCount: 1,
    });
  });
});

describe('selectCatalogsForVersion', () => {
  const v10Basic: Catalog = {
    catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
    protocolVersion: '1.0',
    components: {Text: {type: 'object'}},
  };
  const v10Mcp: Catalog = {
    catalogId: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
    protocolVersion: '1.0',
    functions: {callMcpTool: {type: 'object'}},
  };
  const v09Legacy: Catalog = {
    catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
    protocolVersion: '0.9',
    components: {LegacyCard: {type: 'object'}},
  };
  const v09Npm: Catalog = {
    catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
    protocolVersion: '0.9',
    components: {Text: {type: 'object'}},
  };

  it('selects primary and catalogs for the requested version without eagerly merging (F5)', () => {
    const support = resolveProtocolSupport(true, [v10Basic, v10Mcp, v09Legacy, v09Npm], false);

    const v09Selection = selectCatalogsForVersion(support, 'v0.9', v10Basic, [v10Basic, v10Mcp]);
    expect(v09Selection).toEqual({primary: v09Legacy, catalogs: [v09Legacy, v09Npm]});
    expect('merged' in v09Selection).toBe(false);

    const v10Selection = selectCatalogsForVersion(support, 'v1.0', v10Basic, [v10Basic, v10Mcp]);
    expect(v10Selection).toEqual({primary: v10Basic, catalogs: [v10Basic, v10Mcp]});
    expect('merged' in v10Selection).toBe(false);
  });

  it('falls back to active catalogs only when version matches defaultVersion', () => {
    const support = resolveProtocolSupport(false, [], false);

    const defaultSelection = selectCatalogsForVersion(support, 'v0.9', v09Legacy, [v09Legacy]);
    expect(defaultSelection).toEqual({primary: v09Legacy, catalogs: [v09Legacy]});

    const foreignSelection = selectCatalogsForVersion(support, 'v1.0', v09Legacy, [v09Legacy]);
    expect(foreignSelection).toEqual({primary: null, catalogs: []});
  });
});
