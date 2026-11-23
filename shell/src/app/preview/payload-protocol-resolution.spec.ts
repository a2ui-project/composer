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

import {describe, expect, it, vi} from 'vitest';
import type {Catalog} from '../storage/models/catalog-storage.model';
import type {ProtocolSupport} from '../storage/catalog-management/catalog-domain';
import type {VersionRegistry} from '../shared/protocol/version-registry';
import {
  formatMixedProtocolVersionsMessage,
  formatUnsupportedCatalogMessage,
  formatUnsupportedProtocolVersionMessage,
  gatePayloadDispatch,
  resolvePayloadProtocol,
} from './payload-protocol-resolution';

const V10_BASIC_ID = 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json';
const V10_MCP_ID = 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json';
const V09_COMPOSER_ID = 'https://a2ui.org/specification/v0_9/basic_catalog.json';
const V09_NPM_ID = 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';
const V09_MATERIAL_ID = 'https://a2ui.org/specification/v0_9/material_catalog.json';

const V10_BASIC: Catalog = {
  catalogId: V10_BASIC_ID,
  protocolVersion: '1.0',
  components: {Text: {type: 'object'}},
};

const V10_MCP: Catalog = {
  catalogId: V10_MCP_ID,
  protocolVersion: '1.0',
  functions: {callMcpTool: {type: 'object'}},
};

const V09_COMPOSER: Catalog = {
  catalogId: V09_COMPOSER_ID,
  protocolVersion: '0.9',
  components: {Text: {type: 'object'}},
};

const V09_NPM: Catalog = {
  catalogId: V09_NPM_ID,
  protocolVersion: '0.9',
  components: {Text: {type: 'object'}},
};

const DUAL_SUPPORT: ProtocolSupport = {
  defaultVersion: 'v1.0',
  versions: ['v1.0', 'v0.9'],
  catalogsByVersion: {
    'v1.0': [V10_BASIC, V10_MCP],
    'v0.9': [V09_COMPOSER, V09_NPM],
  },
  announcedCatalogCount: 4,
};

const V09_ONLY_SUPPORT: ProtocolSupport = {
  defaultVersion: 'v0.9',
  versions: ['v0.9'],
  catalogsByVersion: {
    'v0.9': [
      {
        catalogId: 'https://a2ui.org/slack/catalog.json',
        protocolVersion: '0.9',
        components: {Text: {type: 'object'}},
      },
    ],
  },
  announcedCatalogCount: 1,
};

const V10_ONLY_SUPPORT: ProtocolSupport = {
  defaultVersion: 'v1.0',
  versions: ['v1.0'],
  catalogsByVersion: {
    'v1.0': [V10_BASIC],
  },
  announcedCatalogCount: 1,
};

describe('resolvePayloadProtocol', () => {
  it('supports lookup via VersionRegistry<T>', () => {
    const registry: VersionRegistry<string> = {
      'v0.9': 'v09-strategy',
      'v1.0': 'v10-strategy',
    };
    expect(registry['v0.9']).toBe('v09-strategy');
    expect(registry['v1.0']).toBe('v10-strategy');
  });

  it('supports both v0.9 and v1.0 payloads on a two-version support', () => {
    const v09Payload = [
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V09_COMPOSER_ID}},
      {version: 'v0.9', updateComponents: {surfaceId: 's1', components: []}},
    ];
    expect(resolvePayloadProtocol(v09Payload, DUAL_SUPPORT)).toEqual({
      status: 'supported',
      version: 'v0.9',
      catalogs: [V09_COMPOSER, V09_NPM],
      catalog: V09_COMPOSER,
    });

    const v10Payload = [
      {version: '1.0', createSurface: {surfaceId: 's1', catalogId: V10_BASIC_ID, components: []}},
    ];
    expect(resolvePayloadProtocol(v10Payload, DUAL_SUPPORT)).toEqual({
      status: 'supported',
      version: 'v1.0',
      catalogs: [V10_BASIC, V10_MCP],
      catalog: V10_BASIC,
    });
  });

  it('rejects v1.0 on v0.9-only support with PROTOCOL_VERSION_MISMATCH and exact text', () => {
    const payload = [{version: '1.0', createSurface: {surfaceId: 's1', catalogId: V10_BASIC_ID}}];
    expect(resolvePayloadProtocol(payload, V09_ONLY_SUPPORT)).toEqual({
      status: 'unsupported',
      code: 'PROTOCOL_VERSION_MISMATCH',
      message: formatUnsupportedProtocolVersionMessage('v1.0', ['v0.9']),
      anchor: '1.0',
    });
    expect(formatUnsupportedProtocolVersionMessage('v1.0', ['v0.9'])).toBe(
      'This renderer does not support A2UI v1.0. It supports v0.9. Change the payload\'s "version" or select a renderer that supports v1.0.',
    );
  });

  it('rejects v0.9 on v1.0-only support with PROTOCOL_VERSION_MISMATCH and exact text', () => {
    const payload = [
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V09_COMPOSER_ID}},
    ];
    expect(resolvePayloadProtocol(payload, V10_ONLY_SUPPORT)).toEqual({
      status: 'unsupported',
      code: 'PROTOCOL_VERSION_MISMATCH',
      message:
        'This renderer does not support A2UI v0.9. It supports v1.0. Change the payload\'s "version" or select a renderer that supports v0.9.',
      anchor: 'v0.9',
    });
  });

  it('returns null anchor when mismatch is detected structurally without explicit version field', () => {
    const payload = [{beginRendering: {surfaceId: 's1'}}];
    expect(resolvePayloadProtocol(payload, V10_ONLY_SUPPORT)).toEqual({
      status: 'unsupported',
      code: 'PROTOCOL_VERSION_MISMATCH',
      message:
        'This renderer does not support A2UI v0.9. It supports v1.0. Change the payload\'s "version" or select a renderer that supports v0.9.',
      anchor: null,
    });
  });

  it('rejects mixed v0.9 and v1.0 messages in one payload with exact text', () => {
    const payload = [
      {version: '1.0', createSurface: {surfaceId: 's1', catalogId: V10_BASIC_ID, components: []}},
      {version: 'v0.9', updateDataModel: {surfaceId: 's1', value: {}}},
    ];
    expect(resolvePayloadProtocol(payload, DUAL_SUPPORT)).toEqual({
      status: 'unsupported',
      code: 'PROTOCOL_VERSION_MISMATCH',
      message: formatMixedProtocolVersionsMessage(),
      anchor: 'v0.9',
    });
    expect(formatMixedProtocolVersionsMessage()).toBe(
      'This payload mixes A2UI v0.9 and v1.0 messages. Use one version for all messages.',
    );
  });

  it('resolves the matching v0.9 catalog for both Composer and npm basic catalog ids (D2)', () => {
    const composerPayload = [
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V09_COMPOSER_ID}},
    ];
    expect(resolvePayloadProtocol(composerPayload, DUAL_SUPPORT)).toEqual({
      status: 'supported',
      version: 'v0.9',
      catalogs: [V09_COMPOSER, V09_NPM],
      catalog: V09_COMPOSER,
    });

    const npmPayload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V09_NPM_ID}}];
    expect(resolvePayloadProtocol(npmPayload, DUAL_SUPPORT)).toEqual({
      status: 'supported',
      version: 'v0.9',
      catalogs: [V09_COMPOSER, V09_NPM],
      catalog: V09_NPM,
    });
  });

  it('returns UNSUPPORTED_CATALOG with exact message and anchor for an unknown v0.9 catalogId on multi-catalog support', () => {
    const payload = [
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V09_MATERIAL_ID}},
      {version: 'v0.9', updateComponents: {surfaceId: 's1', components: []}},
    ];
    expect(resolvePayloadProtocol(payload, DUAL_SUPPORT)).toEqual({
      status: 'unsupported',
      code: 'UNSUPPORTED_CATALOG',
      message:
        'This renderer does not provide the catalog "https://a2ui.org/specification/v0_9/material_catalog.json" for A2UI v0.9. Catalogs it provides for v0.9: https://a2ui.org/specification/v0_9/basic_catalog.json, https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json.',
      anchor: V09_MATERIAL_ID,
    });
    expect(
      formatUnsupportedCatalogMessage(V09_MATERIAL_ID, 'v0.9', [V09_COMPOSER_ID, V09_NPM_ID]),
    ).toBe(
      'This renderer does not provide the catalog "https://a2ui.org/specification/v0_9/material_catalog.json" for A2UI v0.9. Catalogs it provides for v0.9: https://a2ui.org/specification/v0_9/basic_catalog.json, https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json.',
    );
  });

  it('returns UNSUPPORTED_CATALOG when a v0.9 message names the v1.0 catalog id on multi-catalog support', () => {
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V10_BASIC_ID}}];
    expect(resolvePayloadProtocol(payload, DUAL_SUPPORT)).toEqual({
      status: 'unsupported',
      code: 'UNSUPPORTED_CATALOG',
      message: formatUnsupportedCatalogMessage(V10_BASIC_ID, 'v0.9', [V09_COMPOSER_ID, V09_NPM_ID]),
      anchor: V10_BASIC_ID,
    });
  });

  it('exempts single-catalog renderers (announcedCatalogCount === 1) from UNSUPPORTED_CATALOG (D3)', () => {
    const v09Foreign = [
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V09_MATERIAL_ID}},
    ];
    expect(resolvePayloadProtocol(v09Foreign, V09_ONLY_SUPPORT)).toEqual({
      status: 'supported',
      version: 'v0.9',
      catalogs: V09_ONLY_SUPPORT.catalogsByVersion['v0.9'],
      catalog: V09_ONLY_SUPPORT.catalogsByVersion['v0.9']![0],
    });

    const v10Foreign = [
      {
        version: '1.0',
        createSurface: {surfaceId: 's1', catalogId: 'https://example.com/custom.json'},
      },
    ];
    expect(resolvePayloadProtocol(v10Foreign, V10_ONLY_SUPPORT)).toEqual({
      status: 'supported',
      version: 'v1.0',
      catalogs: [V10_BASIC],
      catalog: V10_BASIC,
    });
  });

  it('resolves indeterminate, empty, or null payloads to defaultVersion and skips catalog check without createSurface or known ids', () => {
    expect(resolvePayloadProtocol(null, DUAL_SUPPORT)).toEqual({
      status: 'supported',
      version: 'v1.0',
      catalogs: [V10_BASIC, V10_MCP],
      catalog: V10_BASIC,
    });
    expect(resolvePayloadProtocol([], DUAL_SUPPORT)).toEqual({
      status: 'supported',
      version: 'v1.0',
      catalogs: [V10_BASIC, V10_MCP],
      catalog: V10_BASIC,
    });

    const indeterminate = [{updateComponents: {surfaceId: 's1', components: []}}];
    expect(resolvePayloadProtocol(indeterminate, DUAL_SUPPORT)).toEqual({
      status: 'supported',
      version: 'v1.0',
      catalogs: [V10_BASIC, V10_MCP],
      catalog: V10_BASIC,
    });

    const noCreateSurface = [
      {version: 'v0.9', updateComponents: {surfaceId: 's1', components: []}},
    ];
    expect(resolvePayloadProtocol(noCreateSurface, DUAL_SUPPORT)).toEqual({
      status: 'supported',
      version: 'v0.9',
      catalogs: [V09_COMPOSER, V09_NPM],
      catalog: V09_COMPOSER,
    });

    const noIdsSupport: ProtocolSupport = {
      defaultVersion: 'v1.0',
      versions: ['v1.0', 'v0.9'],
      catalogsByVersion: {
        'v1.0': [V10_BASIC],
        'v0.9': [{components: {Text: {type: 'object'}}}],
      },
      announcedCatalogCount: 2,
    };
    const payloadWithoutKnownIds = [
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V09_MATERIAL_ID}},
    ];
    expect(resolvePayloadProtocol(payloadWithoutKnownIds, noIdsSupport)).toEqual({
      status: 'supported',
      version: 'v0.9',
      catalogs: noIdsSupport.catalogsByVersion['v0.9'],
      catalog: noIdsSupport.catalogsByVersion['v0.9']![0],
    });
  });

  describe('gatePayloadDispatch', () => {
    it('defers silently while handshake is unsettled', () => {
      const errorLogger = {error: vi.fn()};
      const result = gatePayloadDispatch(
        {
          payload: [
            {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V09_COMPOSER_ID}},
          ],
        },
        false,
        V10_ONLY_SUPPORT,
        errorLogger,
        '[TestGate]',
      );

      expect(result).toBeNull();
      expect(errorLogger.error).not.toHaveBeenCalled();
    });

    it('logs unsupported payload errors with sourceTag and returns null', () => {
      const errorLogger = {error: vi.fn()};
      const result = gatePayloadDispatch(
        {
          payload: [
            {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V09_COMPOSER_ID}},
          ],
        },
        true,
        V10_ONLY_SUPPORT,
        errorLogger,
        '[TestGate]',
      );

      expect(result).toBeNull();
      expect(errorLogger.error).toHaveBeenCalledWith({
        sourceTag: '[TestGate]',
        code: 'PROTOCOL_VERSION_MISMATCH',
        message: formatUnsupportedProtocolVersionMessage('v0.9', ['v1.0']),
      });
    });

    it('accepts a pre-resolved PayloadProtocolResolution without re-resolving', () => {
      const errorLogger = {error: vi.fn()};
      const preResolved = resolvePayloadProtocol(
        [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: V09_COMPOSER_ID}}],
        DUAL_SUPPORT,
      );
      const result = gatePayloadDispatch(
        {resolution: preResolved},
        true,
        DUAL_SUPPORT,
        errorLogger,
        '[TestGate]',
      );

      expect(result).toBe(preResolved);
      expect(errorLogger.error).not.toHaveBeenCalled();
    });
  });
});
