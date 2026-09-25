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

import {MessageProcessor} from '@a2ui/web_core/v0_9';
import Ajv2019, {type SchemaObject, type ValidateFunction} from 'ajv/dist/2019';
import {describe, expect, it} from 'vitest';
import {
  SLACK_BASIC_COMPONENT_NAMES,
  SLACK_CATALOG_ID,
  slackCatalog,
  slackCatalogJson,
  TableSchema,
} from './catalog';
import dataBoundActionJson from '../public/examples/data-bound-action.json';
import marketSnapshotJson from '../public/examples/market-snapshot.json';
import {
  DATA_BOUND_ACTION_MESSAGES,
  MARKET_SNAPSHOT_MESSAGES,
  SLACK_COMPONENT_USAGES,
} from './examples';
import {MarketSnapshotApi} from './market-snapshot';

const EXPECTED_COMPONENTS = [...SLACK_BASIC_COMPONENT_NAMES, 'Table', 'MarketSnapshot'].sort();
const COMMON_TYPES_SCHEMA: SchemaObject = {
  $id: 'common_types.json',
  type: 'object',
  $defs: {
    ComponentId: {
      type: 'string',
    },
    DataBinding: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
        },
      },
      required: ['path'],
      additionalProperties: false,
    },
    FunctionCall: {
      type: 'object',
      properties: {
        call: {
          type: 'string',
        },
        args: {
          type: 'object',
        },
        returnType: {
          enum: ['string', 'number', 'boolean', 'array', 'object', 'any', 'void'],
        },
      },
      required: ['call', 'args'],
      additionalProperties: false,
    },
    DynamicString: {
      oneOf: [
        {
          type: 'string',
        },
        {
          $ref: '#/$defs/DataBinding',
        },
        {
          allOf: [
            {
              $ref: '#/$defs/FunctionCall',
            },
            {
              properties: {
                returnType: {
                  const: 'string',
                },
              },
            },
          ],
        },
      ],
    },
    AccessibilityAttributes: {
      type: 'object',
      properties: {
        label: {
          $ref: '#/$defs/DynamicString',
        },
        description: {
          $ref: '#/$defs/DynamicString',
        },
      },
    },
    ComponentCommon: {
      type: 'object',
      properties: {
        id: {
          $ref: '#/$defs/ComponentId',
        },
        accessibility: {
          $ref: '#/$defs/AccessibilityAttributes',
        },
      },
      required: ['id'],
    },
  },
};

function compileComponentSchema(schema: unknown): ValidateFunction {
  const ajv = new Ajv2019({strict: false});
  ajv.addSchema(COMMON_TYPES_SCHEMA);
  return ajv.compile(schema as SchemaObject);
}

function collectRefs(value: unknown, path = '$'): Array<{path: string; ref: string}> {
  if (typeof value !== 'object' || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((child, index) => collectRefs(child, `${path}/${index}`));
  }

  const record = value as Record<string, unknown>;
  const refs = Object.entries(record).flatMap(([key, child]) =>
    collectRefs(child, `${path}/${key}`),
  );
  if (typeof record['$ref'] === 'string') {
    refs.unshift({path, ref: record['$ref']});
  }
  return refs;
}

function resolvesLocalRef(root: unknown, ref: string): boolean {
  if (!ref.startsWith('#/')) {
    return true;
  }

  let cursor = root;
  for (const rawPart of ref.substring(2).split('/')) {
    const part = rawPart.replace(/~1/g, '/').replace(/~0/g, '~');
    if (typeof cursor !== 'object' || cursor === null || !(part in cursor)) {
      return false;
    }
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return true;
}

describe('Slack catalog schema payload', () => {
  it('exports a renderer-owned inline catalog payload for the bridge handshake', () => {
    const capabilities = new MessageProcessor([slackCatalog]).getClientCapabilities({
      includeInlineCatalogs: true,
    });
    const versionCapabilities = capabilities['v0.9'];
    const upstreamInlineCatalog = versionCapabilities?.inlineCatalogs?.[0];

    expect(versionCapabilities?.supportedCatalogIds).toEqual([SLACK_CATALOG_ID]);
    expect(slackCatalogJson).toMatchObject({
      $schema: 'https://json-schema.org/draft/2019-09/schema',
      title: 'Slack Preview Renderer Catalog',
      description: expect.stringContaining('Use Table for aligned tabular data'),
    });
    expect(slackCatalogJson.catalogId).toBe(SLACK_CATALOG_ID);
    expect(slackCatalogJson).toHaveProperty('components');
    expect(slackCatalogJson).toHaveProperty('functions');
    expect(slackCatalogJson).not.toHaveProperty('v0.9');
    expect(Object.keys(slackCatalogJson.components).sort()).toEqual(
      Object.keys(upstreamInlineCatalog?.components ?? {}).sort(),
    );
    expect(
      slackCatalogJson.functions?.map(({name, description, returnType}) => ({
        name,
        description,
        returnType,
      })),
    ).toEqual(
      upstreamInlineCatalog?.functions?.map(({name, description, returnType}) => ({
        name,
        description,
        returnType,
      })),
    );
  });

  it('does not publish unresolved component-local refs', () => {
    for (const [name, schema] of Object.entries(slackCatalogJson.components)) {
      const badRefs = collectRefs(schema).filter(
        ({ref}) => ref.startsWith('#/') && !resolvesLocalRef(schema, ref),
      );

      expect(badRefs, `Unresolved refs in ${name}`).toEqual([]);
    }
  });

  it('rebases REF-tagged Row child component ids to the shared common type', () => {
    expect(
      (
        slackCatalogJson.components.Row as {
          allOf: [
            unknown,
            {
              properties: {
                children: {
                  anyOf: [
                    unknown,
                    {
                      properties: {
                        componentId: {$ref: string};
                      };
                    },
                  ];
                };
              };
            },
          ];
        }
      ).allOf[1].properties.children.anyOf[1].properties.componentId.$ref,
    ).toBe('common_types.json#/$defs/ComponentId');
  });

  it('contains the supported Slack basic components plus Table and MarketSnapshot', () => {
    expect(Object.keys(slackCatalogJson.components).sort()).toEqual(EXPECTED_COMPONENTS);
    expect([...slackCatalog.components.keys()].sort()).toEqual(EXPECTED_COMPONENTS);
  });

  it('omits openUrl from local catalog functions', () => {
    const functionNames = slackCatalogJson.functions?.map(({name}) => name) ?? [];

    expect(functionNames).not.toContain('openUrl');
    expect(slackCatalog.functions.has('openUrl')).toBe(false);
  });

  it('advertises writable text/date inputs while rejecting unsupported form variants', () => {
    const text = compileComponentSchema(slackCatalogJson.components.TextField);
    const date = compileComponentSchema(slackCatalogJson.components.DateTimeInput);
    const textProps = {
      id: 'location',
      component: 'TextField',
      label: {path: '/labels/location'},
      value: {path: '/location'},
    };
    const dateProps = {id: 'date', component: 'DateTimeInput', value: {path: '/date'}};
    expect(text(textProps)).toBe(true);
    expect(text({...textProps, variant: 'longText'})).toBe(true);
    expect(text({...textProps, value: 'not writable'})).toBe(false);
    expect(text({...textProps, value: {call: 'formatString', args: {value: 'readonly'}}})).toBe(
      false,
    );
    expect(text({...textProps, variant: 'obscured'})).toBe(false);
    expect(text({...textProps, validationRegexp: '.*'})).toBe(false);
    expect(date(dateProps)).toBe(true);
    expect(date({...dateProps, enableDate: true, enableTime: false})).toBe(true);
    expect(date({...dateProps, enableTime: true})).toBe(false);
    expect(date({...dateProps, enableDate: false})).toBe(false);
    expect(date({...dateProps, min: '2026-10-01'})).toBe(false);
  });

  it('allows only horizontal Divider instances', () => {
    const divider = slackCatalog.components.get('Divider');
    const validateDivider = compileComponentSchema(slackCatalogJson.components.Divider);

    expect(divider?.schema.safeParse({axis: 'horizontal'}).success).toBe(true);
    expect(divider?.schema.safeParse({axis: 'vertical'}).success).toBe(false);
    expect(validateDivider({id: 'divider', component: 'Divider', axis: 'horizontal'})).toBe(true);
    expect(validateDivider({id: 'divider', component: 'Divider', axis: 'vertical'})).toBe(false);
  });

  it('publishes component guidance explaining Table alignment and Row flattening', () => {
    expect(slackCatalogJson.components.Row).toMatchObject({
      description: expect.stringContaining('horizontal alignment are flattened'),
    });
    expect(slackCatalogJson.components.Table).toMatchObject({
      description: expect.stringContaining('Use this instead of Row/Text combinations'),
    });
  });

  it('exports a self-contained Table schema accepting bound headers and cells', () => {
    const props = {
      columns: [
        {header: {path: '/labels/team'}, align: 'left'},
        {header: 'Goals', align: 'right'},
      ],
      rows: [
        [{path: '/teams/0/name'}, {path: '/teams/0/goals'}],
        ['France', {call: 'formatString', args: {value: '3'}, returnType: 'string'}],
      ],
    };
    const validateTable = compileComponentSchema(slackCatalogJson.components.Table);
    expect(TableSchema.safeParse(props).success).toBe(true);
    expect(validateTable({id: 'scores', component: 'Table', ...props})).toBe(true);
    expect(collectRefs(slackCatalogJson.components.Table)).toEqual([
      {path: '$/allOf/0', ref: 'common_types.json#/$defs/ComponentCommon'},
    ]);
  });

  it('allows the maximum Table dimensions in both runtime and published schemas', () => {
    const props = {
      columns: Array.from({length: 20}, (_, i) => ({header: `Column ${i + 1}`})),
      rows: Array.from({length: 99}, () => Array.from({length: 20}, () => 'x')),
    };
    expect(TableSchema.safeParse(props).success).toBe(true);
    expect(
      compileComponentSchema(slackCatalogJson.components.Table)({
        id: 'scores',
        component: 'Table',
        ...props,
      }),
    ).toBe(true);
  });

  it.each([
    {columns: [], rows: [['1']]},
    {columns: Array.from({length: 21}, () => ({header: 'Score'})), rows: [['1']]},
    {columns: [{header: 'Score'}], rows: []},
    {columns: [{header: 'Score'}], rows: Array.from({length: 100}, () => ['1'])},
    {columns: [{header: 'Score'}], rows: [[]]},
    {columns: [{header: 'Score'}], rows: [Array.from({length: 21}, () => '1')]},
    {columns: [{header: 'Score', align: 'justify'}], rows: [['1']]},
    {columns: [{header: 'Score', unknown: true}], rows: [['1']]},
    {columns: [{header: 'Score'}], rows: [[{path: '/score', unknown: true}]]},
    {columns: [{header: 'Score'}], rows: [['1']], unknown: true},
  ])('rejects invalid Table dimensions and unsupported properties (%#)', props => {
    expect(TableSchema.safeParse(props).success).toBe(false);
    expect(
      compileComponentSchema(slackCatalogJson.components.Table)({
        id: 'scores',
        component: 'Table',
        ...props,
      }),
    ).toBe(false);
  });

  it('keeps published component schemas strict while accepting common and dynamic fields', () => {
    const text = slackCatalog.components.get('Text');
    const validateText = compileComponentSchema(slackCatalogJson.components.Text);
    const validTextProps = {
      text: {path: '/status/headline'},
      accessibility: {
        label: {
          call: 'formatString',
          args: {value: {path: '/status/headline'}},
          returnType: 'string',
        },
      },
    };
    const textWithUnsupportedProp = {
      text: 'Slack-ready status update',
      unsupported: true,
    };

    expect(
      validateText({
        id: 'status-copy',
        component: 'Text',
        ...validTextProps,
      }),
    ).toBe(true);
    expect(text?.schema.safeParse(validTextProps).success).toBe(true);

    expect(
      validateText({
        id: 'status-copy',
        component: 'Text',
        ...textWithUnsupportedProp,
      }),
    ).toBe(false);
    expect(text?.schema.safeParse(textWithUnsupportedProp).success).toBe(false);
  });

  it('publishes Image description as required while preserving dynamic bindings', () => {
    const image = slackCatalog.components.get('Image');
    const validateImage = compileComponentSchema(slackCatalogJson.components.Image);
    const validBoundImageProps = {
      url: {path: '/imageUrl'},
      description: {path: '/imageDescription'},
    };
    const missingDescriptionProps = {
      url: 'https://example.com/chart.png',
    };

    expect(
      validateImage({
        id: 'chart-image',
        component: 'Image',
        ...validBoundImageProps,
      }),
    ).toBe(true);
    expect(image?.schema.safeParse(validBoundImageProps).success).toBe(true);

    expect(
      validateImage({
        id: 'chart-image',
        component: 'Image',
        ...missingDescriptionProps,
      }),
    ).toBe(false);
    expect(image?.schema.safeParse(missingDescriptionProps).success).toBe(false);
  });

  it('defines a strict three-row MarketSnapshot schema', () => {
    const snapshot = {
      headline: 'Rates and equities diverge',
      summary: 'Treasury yields eased while index futures held steady.',
      markets: [
        {
          name: 'S&P 500 futures',
          price: '6,580.25',
          change: '+0.2%',
          sourceName: 'CME',
          sourceUrl: 'https://www.cmegroup.com/',
        },
        {
          name: '10Y Treasury yield',
          price: '3.91%',
          change: '-4 bps',
          sourceName: 'Treasury',
          sourceUrl: 'https://home.treasury.gov/',
        },
        {
          name: 'WTI crude',
          price: '$67.12',
          change: '-0.5%',
          sourceName: 'NYMEX',
          sourceUrl: 'https://www.cmegroup.com/markets/energy/crude-oil/light-sweet-crude.html',
        },
      ],
      whyItMatters: 'Lower yields can support duration-sensitive sectors.',
      searchedAt: '2026-09-16T12:00:00Z',
    };

    expect(MarketSnapshotApi.schema.safeParse(snapshot).success).toBe(true);
    expect(
      MarketSnapshotApi.schema.safeParse({...snapshot, markets: snapshot.markets.slice(0, 2)})
        .success,
    ).toBe(false);
    expect(
      MarketSnapshotApi.schema.safeParse({
        ...snapshot,
        markets: [{...snapshot.markets[0], unexpected: true}, ...snapshot.markets.slice(1)],
      }).success,
    ).toBe(false);

    const marketSnapshotSchemaJson = JSON.stringify(slackCatalogJson.components.MarketSnapshot);
    expect(marketSnapshotSchemaJson).toContain('"minItems":3');
    expect(marketSnapshotSchemaJson).toContain('"maxItems":3');
    expect(marketSnapshotSchemaJson).toContain('sourceUrl');
  });

  it('validates all advertised Slack usage examples against their component schemas', () => {
    expect(Object.keys(SLACK_COMPONENT_USAGES).sort()).toEqual(EXPECTED_COMPONENTS);

    for (const usage of Object.values(SLACK_COMPONENT_USAGES)) {
      for (const {component, id: _id, ...props} of usage.usage) {
        const api = slackCatalog.components.get(component);

        expect(api, `Missing catalog schema for ${component}`).toBeDefined();
        expect(api?.schema.safeParse(props).success, `Invalid usage for ${component}`).toBe(true);
      }
    }
  });

  it('exports data-bound Text and Button examples with public JSON parity', () => {
    expect(dataBoundActionJson).toEqual(DATA_BOUND_ACTION_MESSAGES);
    expect(DATA_BOUND_ACTION_MESSAGES).toEqual([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'data-bound-action',
          catalogId: SLACK_CATALOG_ID,
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'data-bound-action',
          path: '/',
          value: {
            greeting: 'Ready for review',
            record: {
              id: 'example-42',
            },
          },
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'data-bound-action',
          components: SLACK_COMPONENT_USAGES.Button.usage,
        },
      },
    ]);
    expect(DATA_BOUND_ACTION_MESSAGES[2]).toMatchObject({
      updateComponents: {
        components: expect.arrayContaining([
          expect.objectContaining({
            component: 'Button',
            action: {
              event: {
                name: 'acknowledge',
                context: {
                  recordId: {
                    path: '/record/id',
                  },
                },
              },
            },
          }),
        ]),
      },
    });
  });

  it('exports a Mark-derived MarketSnapshot sequence with public JSON parity', () => {
    expect(marketSnapshotJson).toEqual(MARKET_SNAPSHOT_MESSAGES);
    expect(MARKET_SNAPSHOT_MESSAGES).toEqual([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'market-snapshot',
          catalogId: SLACK_CATALOG_ID,
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'market-snapshot',
          components: SLACK_COMPONENT_USAGES.MarketSnapshot.usage,
        },
      },
    ]);
  });
});
