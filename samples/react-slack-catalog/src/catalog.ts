/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) Atai Barkai
 *
 * Adapted from CopilotKit commit 00904af842b2f8c015f1e405a0c590a86d7842f8:
 * - examples/channels-a2ui-playground/src/poc/basic-catalog.ts
 * - examples/channels-a2ui-playground/src/poc/catalog.ts
 */

import {
  Catalog,
  type A2uiReturnType,
  type ComponentApi,
  type FunctionImplementation,
} from '@a2ui/web_core/v0_9';
import {
  BASIC_FUNCTIONS,
  ButtonApi,
  CardApi,
  ColumnApi,
  RowApi,
  TextApi,
} from '@a2ui/web_core/v0_9/basic_catalog';
import {type ComponentUsages} from 'a2ui-bridge';
import {z} from 'zod/v3';
import {zodToJsonSchema} from 'zod-to-json-schema';
import {MarketSnapshotApi} from './market-snapshot';

export const SLACK_CATALOG_ID = 'https://a2ui-project.github.io/composer/catalogs/slack/v1';
const SLACK_CATALOG_SCHEMA = 'https://json-schema.org/draft/2019-09/schema';
const SLACK_CATALOG_TITLE = 'Slack Preview Renderer Catalog';
const SLACK_CATALOG_DESCRIPTION =
  'A2UI catalog for Slack Block Kit preview messages. TextField and date-only DateTimeInput provide editable forms with writable data bindings. Use Table for aligned tabular data such as scores or comparisons. Row and Column flatten their children into sequential Slack blocks; they do not preserve horizontal alignment. MarketSnapshot provides a specialized market summary.';

export const SLACK_BASIC_COMPONENT_NAMES = [
  'Text',
  'Image',
  'Divider',
  'Row',
  'Column',
  'Card',
  'Button',
  'TextField',
  'DateTimeInput',
] as const;

const DynamicStringSchema = z.union([
  z.string(),
  z.object({path: z.string()}).strict(),
  z
    .object({
      call: z.string(),
      args: z.record(z.any()),
      returnType: z
        .enum(['string', 'number', 'boolean', 'array', 'object', 'any', 'void'])
        .default('string')
        .optional(),
    })
    .strict(),
]);

const AccessibilityAttributesSchema = z
  .object({
    label: DynamicStringSchema.optional(),
    description: DynamicStringSchema.optional(),
  })
  .strict();

const CommonProps = {
  accessibility: AccessibilityAttributesSchema.optional(),
  weight: z.number().optional(),
};

const WritableStringSchema = z
  .object({path: z.string().min(1)})
  .strict()
  .describe(
    'Writable data-model binding. Initialize the bound value with a string or empty string.',
  );

export const SlackTextFieldApi = {
  name: 'TextField',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema,
      value: WritableStringSchema,
      variant: z.enum(['shortText', 'longText']).default('shortText').optional(),
    })
    .strict()
    .describe(
      'Editable Slack text input. Requires a writable value binding; supports shortText and longText only, with at most 3000 characters. Number, obscured, validationRegexp, and checks are unsupported.',
    ),
} as unknown as ComponentApi;

export const SlackDateTimeInputApi = {
  name: 'DateTimeInput',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      value: WritableStringSchema,
      enableDate: z.literal(true).default(true).optional(),
      enableTime: z.literal(false).default(false).optional(),
    })
    .strict()
    .describe(
      'Editable Slack date picker. Requires a writable value binding containing YYYY-MM-DD or an empty string. Date only: enableDate must be true and enableTime false. Time, min/max bounds, and checks are unsupported.',
    ),
} as unknown as ComponentApi;

const SlackImageApi = {
  name: 'Image',
  schema: z
    .object({
      ...CommonProps,
      url: DynamicStringSchema.describe('The HTTP(S) URL of the image to display in Slack.'),
      description: DynamicStringSchema.describe(
        'Required accessibility description rendered as Slack image alt_text.',
      ),
      fit: z
        .enum(['contain', 'cover', 'fill', 'none', 'scaleDown'])
        .default('fill')
        .describe(
          'Specifies how the image should be resized to fit its container. Slack accepts this hint but does not preserve it in image blocks.',
        )
        .optional(),
      variant: z
        .enum(['icon', 'avatar', 'smallFeature', 'mediumFeature', 'largeFeature', 'header'])
        .default('mediumFeature')
        .describe('A hint for the image size and style.')
        .optional(),
    })
    .strict()
    .describe('An image rendered as a Slack image block. Slack requires URL and alt text.'),
} as unknown as ComponentApi;

const SlackDividerApi = {
  name: 'Divider',
  schema: z
    .object({
      ...CommonProps,
      axis: z.enum(['horizontal']).default('horizontal').optional(),
    })
    .strict()
    .describe('A horizontal divider. Slack catalog does not support vertical dividers.'),
} as unknown as ComponentApi;

const SlackRowApi = {
  ...RowApi,
  schema: RowApi.schema.describe(
    'Groups children into sequential Slack blocks. Row layout and horizontal alignment are flattened; use Table for aligned scores, columns, or comparisons. Button-only rows become an actions block.',
  ),
} as ComponentApi;

export const TableSchema = z
  .object({
    ...CommonProps,
    columns: z
      .array(
        z
          .object({
            header: DynamicStringSchema.describe('Header text or binding for this column.'),
            align: z.enum(['left', 'center', 'right']).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(20)
      .describe('Ordered column definitions. Use right alignment for scores or numeric values.'),
    rows: z
      .array(z.array(DynamicStringSchema).min(1).max(20))
      .min(1)
      .max(99)
      .describe(
        'Body rows in column order. Every row must contain exactly one cell per column. Cells may be literal strings, data bindings, or string-returning functions. At most 99 body rows plus one header row; resolved cells must fit Slack text limits.',
      ),
  })
  .strict()
  .describe(
    'An aligned Slack table for scores, rankings, and comparisons. Use this instead of Row/Text combinations for tabular data. Supports 1–20 columns and 1–99 body rows, with matching cell counts in every row.',
  );

export const TableApi = {
  name: 'Table',
  schema: TableSchema,
} as unknown as ComponentApi;

export const slackBasicComponents = [
  TextApi,
  SlackImageApi,
  SlackDividerApi,
  SlackRowApi,
  ColumnApi,
  CardApi,
  ButtonApi,
  SlackTextFieldApi,
  SlackDateTimeInputApi,
] as ComponentApi[];

export const slackBasicFunctions = BASIC_FUNCTIONS.filter(({name}) => name !== 'openUrl');

export const slackComponents = [...slackBasicComponents, TableApi, MarketSnapshotApi];

export const slackCatalog = new Catalog(SLACK_CATALOG_ID, slackComponents, slackBasicFunctions);

export interface SlackCatalogJson {
  $schema: string;
  title: string;
  description: string;
  catalogId: string;
  components: Record<string, unknown>;
  functions?: Array<{
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
    returnType: A2uiReturnType;
  }>;
  theme?: unknown;
}

type JsonSchemaConverter = (
  schema: unknown,
  options: {target: 'jsonSchema2019-09'; $refStrategy: 'none'},
) => unknown;

const toJsonSchema = zodToJsonSchema as JsonSchemaConverter;

function processRefs(node: unknown): void {
  if (typeof node !== 'object' || node === null) {
    return;
  }

  const record = node as Record<string, unknown>;
  if (typeof record.description === 'string' && record.description.startsWith('REF:')) {
    const [ref, description = ''] = record.description.substring(4).split('|');
    for (const key of Object.keys(record)) {
      delete record[key];
    }
    record['$ref'] = ref;
    if (description) {
      record.description = description;
    }
    return;
  }

  for (const child of Array.isArray(node) ? node : Object.values(record)) {
    processRefs(child);
  }
}

function schemaJsonFor(schema: unknown): Record<string, unknown> {
  const jsonSchema = toJsonSchema(schema, {
    target: 'jsonSchema2019-09',
    $refStrategy: 'none',
  }) as Record<string, unknown>;
  processRefs(jsonSchema);
  return jsonSchema;
}

function componentSchemaFor(name: string, api: ComponentApi): Record<string, unknown> {
  const zodSchema = schemaJsonFor(api.schema);

  return {
    type: 'object',
    ...(api.schema.description ? {description: api.schema.description} : {}),
    allOf: [
      {$ref: 'common_types.json#/$defs/ComponentCommon'},
      {
        type: 'object',
        properties: {
          component: {const: name},
          ...((zodSchema.properties as Record<string, unknown> | undefined) ?? {}),
        },
        required: ['component', ...((zodSchema.required as string[] | undefined) ?? [])],
      },
    ],
    unevaluatedProperties: false,
  };
}

function functionSchemaFor(
  api: FunctionImplementation,
): NonNullable<SlackCatalogJson['functions']>[number] {
  return {
    name: api.name,
    description: api.schema.description,
    returnType: api.returnType,
    parameters: schemaJsonFor(api.schema),
  };
}

export function createSlackCatalogJson(catalog = slackCatalog): SlackCatalogJson {
  const components: Record<string, unknown> = {};
  for (const [name, api] of catalog.components.entries()) {
    components[name] = componentSchemaFor(name, api);
  }

  const functions = [...catalog.functions.values()].map(functionSchemaFor);
  const theme = catalog.themeSchema ? schemaJsonFor(catalog.themeSchema).properties : undefined;

  return {
    $schema: SLACK_CATALOG_SCHEMA,
    title: SLACK_CATALOG_TITLE,
    description: SLACK_CATALOG_DESCRIPTION,
    catalogId: catalog.id,
    components,
    functions: functions.length > 0 ? functions : undefined,
    theme,
  };
}

export const slackCatalogJson = createSlackCatalogJson();

export const SLACK_COMPONENT_USAGES = {
  Text: {
    usage: [
      {
        id: 'root',
        component: 'Text',
        text: 'Slack-ready status update',
        variant: 'body',
      },
    ],
  },
  Image: {
    usage: [
      {
        id: 'root',
        component: 'Image',
        url: 'https://www.gstatic.com/marketing-cms/assets/images/c5/3a/200414104c669203c62270f7884f/google-wordmarks-2x.webp=n-w100-h32-fcrop64=1,00000000ffffffff-rw',
        description: 'Google wordmark',
        fit: 'scaleDown',
        variant: 'mediumFeature',
      },
    ],
  },
  Divider: {
    usage: [
      {
        id: 'root',
        component: 'Divider',
        axis: 'horizontal',
      },
    ],
  },
  Row: {
    usage: [
      {
        id: 'root',
        component: 'Row',
        children: ['left-copy', 'right-copy'],
        justify: 'spaceBetween',
        align: 'center',
      },
      {
        id: 'left-copy',
        component: 'Text',
        text: 'Open',
      },
      {
        id: 'right-copy',
        component: 'Text',
        text: '42',
      },
    ],
  },
  Column: {
    usage: [
      {
        id: 'root',
        component: 'Column',
        children: ['title-copy', 'body-copy'],
        justify: 'start',
        align: 'stretch',
      },
      {
        id: 'title-copy',
        component: 'Text',
        text: 'Daily brief',
        variant: 'h3',
      },
      {
        id: 'body-copy',
        component: 'Text',
        text: 'Three updates are ready for review.',
      },
    ],
  },
  Card: {
    usage: [
      {
        id: 'root',
        component: 'Card',
        child: 'card-copy',
      },
      {
        id: 'card-copy',
        component: 'Text',
        text: 'Card content',
      },
    ],
  },
  Button: {
    usage: [
      {
        id: 'root',
        component: 'Button',
        child: 'button-label',
        variant: 'primary',
        action: {
          event: {
            name: 'acknowledge',
          },
        },
      },
      {
        id: 'button-label',
        component: 'Text',
        text: 'Acknowledge',
      },
    ],
  },
  TextField: {
    usage: [
      {
        id: 'root',
        component: 'TextField',
        label: 'Pickup location',
        value: {path: '/pickupLocation'},
        variant: 'shortText',
      },
    ],
  },
  DateTimeInput: {
    usage: [
      {
        id: 'root',
        component: 'DateTimeInput',
        label: 'Pickup date',
        value: {path: '/pickupDate'},
        enableDate: true,
        enableTime: false,
      },
    ],
  },
  Table: {
    usage: [
      {
        id: 'root',
        component: 'Table',
        accessibility: {label: 'Illustrative 2022 World Cup final scores'},
        columns: [{header: 'Team'}, {header: 'Goals', align: 'right'}, {header: 'Result'}],
        rows: [
          ['Argentina', '3', 'Won on penalties'],
          ['France', '3', 'Runner-up'],
        ],
      },
    ],
  },
  MarketSnapshot: {
    usage: [
      {
        id: 'root',
        component: 'MarketSnapshot',
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
      },
    ],
  },
} satisfies ComponentUsages;
