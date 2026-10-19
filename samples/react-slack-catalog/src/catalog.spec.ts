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
// web_core doesn't export its JSON schemas, so this reads the copy it ships from
// the workspace's root node_modules, as vitest.config.ts does for React.
import commonTypesJson from '../../../node_modules/@a2ui/web_core/src/v0_9/schemas/common_types.json';
import {SLACK_CATALOG_ID, slackCatalog, slackCatalogJson} from './catalog';
import dataBoundActionJson from '../public/examples/data-bound-action.json';
import marketSnapshotJson from '../public/examples/market-snapshot.json';
import {SLACK_COMPONENT_USAGES} from './examples';
import {MarketSnapshotSchema} from './market-snapshot';

const EXPECTED_COMPONENTS = [
  'Text',
  'Image',
  'Divider',
  'Row',
  'Column',
  'Card',
  'Button',
  'TextField',
  'DateTimeInput',
  'Table',
  'Chart',
  'MarketSnapshot',
].sort();
const TableSchema = slackCatalog.components.get('Table')!.schema;
const ChartSchema = slackCatalog.components.get('Chart')!.schema;

/** Where the Slack-specific components take a string: each builds props holding `text` there. */
const STRING_PROPS = [
  {
    name: 'Image url',
    component: 'Image',
    props: (text: unknown) => ({url: text, description: 'Chart'}),
  },
  {
    name: 'Image description',
    component: 'Image',
    props: (text: unknown) => ({url: 'https://example.com/chart.png', description: text}),
  },
  {
    name: 'TextField label',
    component: 'TextField',
    props: (text: unknown) => ({label: text, value: {path: '/location'}}),
  },
  {
    name: 'DateTimeInput label',
    component: 'DateTimeInput',
    props: (text: unknown) => ({label: text, value: {path: '/date'}}),
  },
  {
    name: 'Table header',
    component: 'Table',
    props: (text: unknown) => ({columns: [{header: text}], rows: [['1']]}),
  },
  {
    name: 'Table cell',
    component: 'Table',
    props: (text: unknown) => ({columns: [{header: 'Score'}], rows: [[text]]}),
  },
];
/**
 * A validator that has web_core's v0.9 `common_types.json` and the Slack catalog,
 * under the names Composer's JSON editor gives them: `common_types.json` and
 * `catalog.json`. The component schemas refer to `common_types.json`, and its
 * `FunctionCall` accepts only a call that matches the catalog's
 * `$defs.anyFunction`.
 *
 * `common_types.json` is written in JSON Schema 2020-12 and the catalog in
 * 2019-09, and an Ajv instance knows the meta-schema of only one of them, so
 * `validateSchema` is off. Both use their keywords the same way here.
 */
function createAjv(): Ajv2019 {
  const ajv = new Ajv2019({strict: false, validateSchema: false});
  ajv.addSchema({...commonTypesJson, $id: 'common_types.json'} as SchemaObject);
  ajv.addSchema({...slackCatalogJson, $id: 'catalog.json'} as SchemaObject);
  return ajv;
}

function compileComponentSchema(schema: unknown): ValidateFunction {
  return createAjv().compile(schema as SchemaObject);
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

  it('defines anyComponent and anyFunction for schemas that reference catalog.json', () => {
    const {anyComponent, anyFunction} = slackCatalogJson.$defs;

    for (const {$ref} of anyComponent.oneOf) {
      expect(resolvesLocalRef(slackCatalogJson, $ref), $ref).toBe(true);
    }
    expect(anyComponent.oneOf).toHaveLength(Object.keys(slackCatalogJson.components).length);
    expect(
      anyFunction.oneOf.map(
        call => (call as {properties: {call: {const: string}}}).properties.call.const,
      ),
    ).toEqual([...slackCatalog.functions.keys()]);
  });

  it('accepts a call to a Slack function and rejects one to openUrl through anyFunction', () => {
    const validateCall = createAjv().compile({$ref: 'catalog.json#/$defs/anyFunction'});

    expect(validateCall({call: 'required', args: {value: 'Pick-up location'}})).toBe(true);
    expect(validateCall({call: 'openUrl', args: {url: 'https://example.com'}})).toBe(false);
  });

  it('accepts bound and nested arguments in anyFunction calls', () => {
    const validateCall = createAjv().compile({$ref: 'catalog.json#/$defs/anyFunction'});

    expect(validateCall({call: 'formatNumber', args: {value: {path: '/price'}}})).toBe(true);
    expect(
      validateCall({
        call: 'formatNumber',
        args: {value: {call: 'add', args: {a: 1, b: {path: '/fee'}}, returnType: 'number'}},
      }),
    ).toBe(true);
    expect(validateCall({call: 'formatNumber', args: {value: true}})).toBe(false);
    expect(validateCall({call: 'formatNumber', args: {}})).toBe(false);
  });

  it('does not publish unresolved component-local refs', () => {
    for (const [name, schema] of Object.entries(slackCatalogJson.components)) {
      const badRefs = collectRefs(schema).filter(
        ({ref}) => ref.startsWith('#/') && !resolvesLocalRef(schema, ref),
      );

      expect(badRefs, `Unresolved refs in ${name}`).toEqual([]);
    }
  });

  it('publishes Row children as a reference to the shared ChildList type', () => {
    expect(
      (
        slackCatalogJson.components.Row as {
          allOf: [unknown, {properties: {children: {$ref: string}}}];
        }
      ).allOf[1].properties.children.$ref,
    ).toBe('common_types.json#/$defs/ChildList');
  });

  it('contains the supported Slack basic components plus Table, Chart, and MarketSnapshot', () => {
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

  it('publishes Table headers and cells as DynamicString, accepting bound and computed text', () => {
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
      {
        path: '$/allOf/1/properties/accessibility/properties/label',
        ref: 'common_types.json#/$defs/DynamicString',
      },
      {
        path: '$/allOf/1/properties/accessibility/properties/description',
        ref: 'common_types.json#/$defs/DynamicString',
      },
      {
        path: '$/allOf/1/properties/columns/items/properties/header',
        ref: 'common_types.json#/$defs/DynamicString',
      },
      {
        path: '$/allOf/1/properties/rows/items/items',
        ref: 'common_types.json#/$defs/DynamicString',
      },
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

  it('publishes an HTTP(S) pattern on a literal Image url only', () => {
    const image = slackCatalog.components.get('Image');
    const validateImage = compileComponentSchema(slackCatalogJson.components.Image);
    const imageProperties = (
      slackCatalogJson.components.Image as {
        allOf: Array<{properties?: Record<string, {anyOf?: unknown[]; $ref?: string}>}>;
      }
    ).allOf[1].properties;
    const mailtoImageProps = {
      url: 'mailto:image@example.com',
      description: 'Email URI',
    };

    expect(imageProperties?.['url'].anyOf?.[0]).toEqual({type: 'string', pattern: '^https?://'});
    expect(imageProperties?.['description'].$ref).toBe('common_types.json#/$defs/DynamicString');
    expect(
      validateImage({
        id: 'chart-image',
        component: 'Image',
        url: 'https://example.com/chart.png',
        description: 'Chart',
      }),
    ).toBe(true);
    expect(validateImage({id: 'chart-image', component: 'Image', ...mailtoImageProps})).toBe(false);
    // The runtime schema still takes it, so lowering can report it as
    // A2UI_INVALID_IMAGE_URL rather than as a generic props error.
    expect(image?.schema.safeParse(mailtoImageProps).success).toBe(true);
  });

  it.each(STRING_PROPS)(
    'checks a function call in $name against the catalog functions returning a string',
    ({component, props}) => {
      const runtimeSchema = slackCatalog.components.get(component)!.schema;
      const validate = compileComponentSchema(slackCatalogJson.components[component]);
      const published = (text: unknown) => validate({id: 'target', component, ...props(text)});

      const formatted = {
        call: 'formatNumber',
        args: {value: {path: '/price'}},
        returnType: 'string',
      };
      expect(published(formatted)).toBe(true);
      expect(runtimeSchema.safeParse(props(formatted)).success).toBe(true);
      expect(published({call: 'formatString', args: {value: '${/name}'}})).toBe(true);

      expect(published({call: 'openUrl', args: {url: 'https://example.com'}})).toBe(false);
      expect(published({call: 'missingFunction', args: {}})).toBe(false);
      expect(published({call: 'formatNumber', args: {}})).toBe(false);
      const numberResult = {call: 'add', args: {a: 1, b: 2}, returnType: 'number'};
      expect(published(numberResult)).toBe(false);
      expect(runtimeSchema.safeParse(props(numberResult)).success).toBe(false);
    },
  );

  it('requires a Button action and accepts only the variants Slack draws', () => {
    const button = slackCatalog.components.get('Button')!;
    const validateButton = compileComponentSchema(slackCatalogJson.components.Button);
    const props = {
      child: 'button-label',
      variant: 'primary',
      action: {event: {name: 'acknowledge'}},
    };
    const published = (buttonProps: Record<string, unknown>) =>
      validateButton({id: 'button', component: 'Button', ...buttonProps});
    const {action: _action, ...withoutAction} = props;

    expect(published(props)).toBe(true);
    expect(button.schema.safeParse(props).success).toBe(true);
    expect(
      published({...props, action: {functionCall: {call: 'formatString', args: {value: 'x'}}}}),
    ).toBe(true);
    for (const unsupported of [
      withoutAction,
      {...props, variant: 'borderless'},
      {...props, checks: [{condition: true, message: 'Never shown'}]},
      {...props, isValid: true},
      {...props, validationErrors: []},
    ]) {
      expect(published(unsupported), JSON.stringify(unsupported)).toBe(false);
      expect(button.schema.safeParse(unsupported).success, JSON.stringify(unsupported)).toBe(false);
    }
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

    expect(MarketSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(
      MarketSnapshotSchema.safeParse({...snapshot, markets: snapshot.markets.slice(0, 2)}).success,
    ).toBe(false);
    expect(
      MarketSnapshotSchema.safeParse({
        ...snapshot,
        markets: [{...snapshot.markets[0], unexpected: true}, ...snapshot.markets.slice(1)],
      }).success,
    ).toBe(false);

    const marketSnapshotSchemaJson = JSON.stringify(slackCatalogJson.components.MarketSnapshot);
    expect(marketSnapshotSchemaJson).toContain('"minItems":3');
    expect(marketSnapshotSchemaJson).toContain('"maxItems":3');
    expect(marketSnapshotSchemaJson).toContain('sourceUrl');
  });

  it('publishes the MarketSnapshot source patterns that the preview checks when drawing', () => {
    const validate = compileComponentSchema(slackCatalogJson.components.MarketSnapshot);
    const [{id, component, ...props}] = SLACK_COMPONENT_USAGES.MarketSnapshot.usage;
    const withSource = (source: {sourceName?: string; sourceUrl?: string}) => ({
      ...props,
      markets: [{...props.markets[0], ...source}, ...props.markets.slice(1)],
    });

    expect(validate({id, component, ...props})).toBe(true);
    for (const source of [
      {sourceUrl: 'javascript:alert(1)'},
      {sourceUrl: 'https://example.com/*a*'},
      {sourceName: 'Example <https://evil.example|here>'},
      {sourceName: 'Example\nSecond line'},
    ]) {
      expect(validate({id, component, ...withSource(source)}), JSON.stringify(source)).toBe(false);
      // The runtime schema takes it, so the preview can report it as
      // A2UI_INVALID_MARKET_SOURCE_NAME or _URL rather than as a generic props error.
      expect(MarketSnapshotSchema.safeParse(withSource(source)).success).toBe(true);
    }
  });

  it('validates all advertised Slack usage examples against their component schemas', () => {
    expect(Object.keys(SLACK_COMPONENT_USAGES).sort()).toEqual(EXPECTED_COMPONENTS);

    for (const usage of Object.values(SLACK_COMPONENT_USAGES)) {
      for (const {component, id: _id, ...props} of usage.usage) {
        const api = slackCatalog.components.get(component);

        expect(api, `Missing catalog schema for ${component}`).toBeDefined();
        expect(api?.schema.safeParse(props).success, `Invalid usage for ${component}`).toBe(true);
        expect(
          compileComponentSchema(slackCatalogJson.components[component])({
            id: 'target',
            component,
            ...props,
          }),
          `Invalid published usage for ${component}`,
        ).toBe(true);
      }
    }
  });

  it('exports data-bound Text and Button examples with public JSON parity', () => {
    expect(dataBoundActionJson).toEqual([
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
    expect(dataBoundActionJson[2]).toMatchObject({
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
    expect(marketSnapshotJson).toEqual([
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

describe('Slack Chart component', () => {
  const usage = SLACK_COMPONENT_USAGES.Chart.usage[0];
  const {id: _id, component: _component, ...usageProps} = usage;

  it('publishes guidance telling the model to send numbers, not image URLs', () => {
    expect(slackCatalogJson.components.Chart).toMatchObject({
      description: expect.stringContaining(
        'The native Slack chart block cannot express every chart this catalog allows, so the Slack renderer draws the chart and sends it as an image. Give the numbers, not an image URL.',
      ),
    });
    expect(slackCatalogJson.description).toContain('Use Chart for bar, line, pie, or donut charts');
  });

  it('publishes every chart type as a plain string, in order', () => {
    expect(slackCatalogJson.components.Chart).toMatchObject({
      allOf: [
        expect.anything(),
        {
          properties: {
            type: {type: 'string', enum: ['verticalBar', 'horizontalBar', 'line', 'pie', 'donut']},
          },
        },
      ],
    });
  });

  it('accepts the Gallery example and bound labels and values', () => {
    const validateChart = compileComponentSchema(slackCatalogJson.components.Chart);

    expect(ChartSchema.safeParse(usageProps).success).toBe(true);
    expect(validateChart(usage)).toBe(true);
    expect(
      ChartSchema.safeParse({
        type: 'line',
        data: [{label: {path: '/days/0'}, value: {path: '/visits/0'}}],
      }).success,
    ).toBe(true);
  });

  it('rejects unknown chart types and more than 20 points', () => {
    expect(ChartSchema.safeParse({...usageProps, type: 'scatter'}).success).toBe(false);
    expect(
      ChartSchema.safeParse({
        data: Array.from({length: 21}, (_, index) => ({label: `P${index}`, value: index})),
      }).success,
    ).toBe(false);
  });
});
