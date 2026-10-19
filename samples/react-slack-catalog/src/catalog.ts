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
import {z} from 'zod/v3';
import {zodToJsonSchema} from 'zod-to-json-schema';
import {InputComponentType, InputKind} from './form-input';
import {MarketSnapshotSchema} from './market-snapshot';
import {
  SLACK_TABLE_MAX_BODY_ROWS,
  SLACK_TABLE_MAX_COLUMNS,
  SLACK_TEXT_INPUT_MAX_LENGTH,
} from './slack-limits';

/** The catalog ID the Slack renderer registers and its surfaces must use. */
export const SLACK_CATALOG_ID = 'https://a2ui-project.github.io/composer/catalogs/slack/v1';
const SLACK_CATALOG_SCHEMA = 'https://json-schema.org/draft/2019-09/schema';
const SLACK_CATALOG_TITLE = 'Slack Preview Renderer Catalog';
const SLACK_CATALOG_DESCRIPTION =
  'A2UI catalog for Slack Block Kit preview messages. TextField and date-only DateTimeInput provide editable forms with writable data bindings. Use Table for aligned tabular data such as scores or comparisons. Row and Column flatten their children into sequential Slack blocks; they do not preserve horizontal alignment. MarketSnapshot provides a specialized market summary.';

/**
 * Pairs a component name with its props schema. web_core types `ComponentApi`
 * against its own copy of zod 3, while this sample writes schemas with zod 4's
 * `zod/v3` API. The two behave the same at run time, but TypeScript runs out of
 * memory comparing the two copies' types, so the schema can't be type-checked
 * against `ComponentApi` and is cast instead.
 */
function slackComponentApi(name: string, schema: z.ZodTypeAny): ComponentApi {
  return {name, schema} as unknown as ComponentApi;
}

/**
 * A string prop's schema: the given literal string, a data binding, or a
 * function call that returns a string.
 */
function dynamicStringSchema(literal: z.ZodString) {
  return z.union([
    literal,
    z.object({path: z.string()}).strict(),
    z
      .object({
        call: z.string(),
        args: z.record(z.unknown()),
        returnType: z
          .enum(['string', 'number', 'boolean', 'array', 'object', 'any', 'void'])
          .default('string')
          .optional(),
      })
      .strict(),
  ]);
}

const DynamicStringSchema = dynamicStringSchema(z.string());

/**
 * The JSON Schema `pattern` the published catalog gives a literal Image `url`.
 * Slack fetches an image block's `image_url` itself and takes only HTTP(S)
 * URLs, and Composer reads this pattern to tell the assistant so.
 */
const HTTP_URL_PATTERN = '^https?://';

/**
 * A literal Image `url`. At run time it takes any string, as before: lowering
 * rejects a URL that isn't HTTP(S) with an `A2UI_INVALID_IMAGE_URL`
 * diagnostic that says what Slack needs, where a regex here would report a
 * generic `A2UI_INVALID_PROPS` schema error instead. Only the published
 * catalog adds `HTTP_URL_PATTERN` to it (see `addImageUrlPattern`).
 */
const ImageUrlLiteralSchema = z.string();

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

const SlackTextFieldApi = slackComponentApi(
  InputComponentType.TEXT_FIELD,
  z
    .object({
      ...CommonProps,
      label: DynamicStringSchema,
      value: WritableStringSchema,
      variant: z
        .enum([InputKind.SHORT_TEXT, InputKind.LONG_TEXT])
        .default(InputKind.SHORT_TEXT)
        .optional(),
    })
    .strict()
    .describe(
      `Editable Slack text input. Requires a writable value binding; supports shortText and longText only, with at most ${SLACK_TEXT_INPUT_MAX_LENGTH} characters. Number, obscured, validationRegexp, and checks are unsupported.`,
    ),
);

const SlackDateTimeInputApi = slackComponentApi(
  InputComponentType.DATE_TIME_INPUT,
  z
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
);

const SlackImageApi = slackComponentApi(
  'Image',
  z
    .object({
      ...CommonProps,
      url: dynamicStringSchema(ImageUrlLiteralSchema).describe(
        'The HTTP(S) URL of the image to display in Slack.',
      ),
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
);

const SlackDividerApi = slackComponentApi(
  'Divider',
  z
    .object({
      ...CommonProps,
      axis: z.enum(['horizontal']).default('horizontal').optional(),
    })
    .strict()
    .describe('A horizontal divider. Slack catalog does not support vertical dividers.'),
);

const SlackRowApi: ComponentApi = {
  ...RowApi,
  schema: RowApi.schema.describe(
    'Groups children into sequential Slack blocks. Row layout and horizontal alignment are flattened; use Table for aligned scores, columns, or comparisons. Button-only rows become an actions block.',
  ),
};

const TableSchema = z
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
      .max(SLACK_TABLE_MAX_COLUMNS)
      .describe('Ordered column definitions. Use right alignment for scores or numeric values.'),
    rows: z
      .array(z.array(DynamicStringSchema).min(1).max(SLACK_TABLE_MAX_COLUMNS))
      .min(1)
      .max(SLACK_TABLE_MAX_BODY_ROWS)
      .describe(
        `Body rows in column order. Every row must contain exactly one cell per column. Cells may be literal strings, data bindings, or string-returning functions. At most ${SLACK_TABLE_MAX_BODY_ROWS} body rows plus one header row; resolved cells must fit Slack text limits.`,
      ),
  })
  .strict()
  .describe(
    `An aligned Slack table for scores, rankings, and comparisons. Use this instead of Row/Text combinations for tabular data. Supports 1–${SLACK_TABLE_MAX_COLUMNS} columns and 1–${SLACK_TABLE_MAX_BODY_ROWS} body rows, with matching cell counts in every row.`,
  );

const TableApi = slackComponentApi('Table', TableSchema);

const slackBasicComponents: ComponentApi[] = [
  TextApi,
  SlackImageApi,
  SlackDividerApi,
  SlackRowApi,
  ColumnApi,
  CardApi,
  ButtonApi,
  SlackTextFieldApi,
  SlackDateTimeInputApi,
];

// The basic catalog's functions minus `openUrl`, the only one with a side effect. The
// preview runs function actions as read-only (see dispatchReadOnlyLocalFunctionAction).
const slackBasicFunctions = BASIC_FUNCTIONS.filter(({name}) => name !== 'openUrl');

const slackComponents = [
  ...slackBasicComponents,
  TableApi,
  slackComponentApi('MarketSnapshot', MarketSnapshotSchema),
];

/** The Slack renderer's A2UI catalog: the components and functions it can lower to Slack. */
export const slackCatalog = new Catalog(SLACK_CATALOG_ID, slackComponents, slackBasicFunctions);

interface SlackCatalogJson {
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
  options: {
    target: 'jsonSchema2019-09';
    $refStrategy: 'none';
    postProcess: (jsonSchema: unknown, def: unknown) => unknown;
  },
) => unknown;

const toJsonSchema = zodToJsonSchema as JsonSchemaConverter;

/**
 * Called by zod-to-json-schema with each zod schema (`def`) and the JSON
 * Schema it made from it. Adds `HTTP_URL_PATTERN` to the one made from
 * `ImageUrlLiteralSchema` and returns every other JSON Schema unchanged.
 */
function addImageUrlPattern(jsonSchema: unknown, def: unknown): unknown {
  return def === ImageUrlLiteralSchema._def
    ? {...(jsonSchema as Record<string, unknown>), pattern: HTTP_URL_PATTERN}
    : jsonSchema;
}

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
    postProcess: addImageUrlPattern,
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

function createSlackCatalogJson(catalog: typeof slackCatalog): SlackCatalogJson {
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

/** The Slack catalog as the JSON Schema catalog document the renderer sends Composer. */
export const slackCatalogJson = createSlackCatalogJson(slackCatalog);
