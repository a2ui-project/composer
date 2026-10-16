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
import {SLACK_LIMITS} from '@copilotkit/channels-slack/render';
import {ChartType} from './chart-image';
import {InputComponentType, InputKind} from './form-input';
import {HTTP_URL_PATTERN} from './http-url';
import {
  MarketSnapshotSchema,
  SOURCE_NAME_PATTERN,
  SOURCE_URL_PATTERN,
  SourceNameSchema,
  SourceUrlSchema,
} from './market-snapshot';
import {SLACK_TABLE_MAX_BODY_ROWS, SLACK_TEXT_INPUT_MAX_LENGTH} from './slack-limits';

/** The catalog ID the Slack renderer registers and its surfaces must use. */
export const SLACK_CATALOG_ID = 'https://a2ui-project.github.io/composer/catalogs/slack/v1';
const SLACK_CATALOG_SCHEMA = 'https://json-schema.org/draft/2019-09/schema';
const SLACK_CATALOG_TITLE = 'Slack Preview Renderer Catalog';
const SLACK_CATALOG_DESCRIPTION =
  'A2UI catalog for Slack Block Kit preview messages. TextField and date-only DateTimeInput provide editable forms with writable data bindings. Use Table for aligned tabular data such as scores or comparisons. Use Chart for bar, line, pie, or donut charts; the native Slack chart block cannot express every chart this catalog allows, so the renderer draws the chart and sends it as an image. Use Scorecard to show one match result; Slack has no block for it, so the renderer draws it and sends it as an uploaded image. Row and Column flatten their children into sequential Slack blocks; they do not preserve horizontal alignment. MarketSnapshot provides a specialized market summary.';

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
 * A data binding: a JSON Pointer to a value in the data model. The published
 * catalog refers to `common_types.json`'s `DataBinding` for it.
 */
const DataBindingSchema = z
  .object({path: z.string()})
  .strict()
  .describe('REF:common_types.json#/$defs/DataBinding');

/**
 * A call to one of the catalog's functions, for a string prop. `returnType`,
 * when given, must be `string`. The published catalog also checks the function
 * name and its arguments (see `publishedSchemaFor`).
 */
const StringFunctionCallSchema = z
  .object({
    call: z.string(),
    args: z.record(z.unknown()),
    returnType: z.literal('string').optional(),
  })
  .strict();

/**
 * How the published catalog checks a `StringFunctionCallSchema`: the
 * function-call member of `common_types.json`'s `DynamicString`. Its
 * `FunctionCall` takes only a call to one of this catalog's functions, as listed
 * in `$defs.anyFunction`.
 */
function stringFunctionCallJsonSchema(): Record<string, unknown> {
  return {
    allOf: [
      {$ref: 'common_types.json#/$defs/FunctionCall'},
      {properties: {returnType: {const: 'string'}}},
    ],
  };
}

/**
 * A string prop's schema: a literal string, a data binding, or a call to one of
 * the catalog's functions that returns a string. The published catalog refers to
 * `common_types.json`'s `DynamicString` for it, as the basic catalog does.
 *
 * @param description What the prop is for, published with the reference.
 */
function dynamicString(description?: string) {
  return z
    .union([z.string(), DataBindingSchema, StringFunctionCallSchema])
    .describe(`REF:common_types.json#/$defs/DynamicString${description ? `|${description}` : ''}`);
}

/**
 * A literal Image `url`. Slack fetches an image block's `image_url` itself and
 * takes only HTTP(S) URLs. At run time this takes any string, as before:
 * lowering rejects a URL that isn't HTTP(S) with an `A2UI_INVALID_IMAGE_URL`
 * diagnostic that says what Slack needs, where a regex here would have the
 * message processor reject the component with a generic schema error
 * (`A2UI_PROCESS_MESSAGE_ERROR`) instead. Only the published catalog adds
 * `HTTP_URL_PATTERN` to it (see `PUBLISHED_PATTERNS`), and Composer reads it
 * there to tell the assistant.
 */
const ImageUrlLiteralSchema = z.string();

const AccessibilityAttributesSchema = z
  .object({
    label: dynamicString().optional(),
    description: dynamicString().optional(),
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
      label: dynamicString(),
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
      label: dynamicString().optional(),
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
      url: z
        .union([ImageUrlLiteralSchema, DataBindingSchema, StringFunctionCallSchema])
        .describe('The HTTP(S) URL of the image to display in Slack.'),
      description: dynamicString(
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

const buttonProps = ButtonApi.schema.shape;

/**
 * The basic catalog's Button, limited to what a Slack button can do: it requires
 * an action, which the preview runs when the button is clicked; it takes no
 * checks (`checks`, `isValid` and `validationErrors`), the rules that disable a
 * basic catalog Button, since a Slack button can't be disabled; and its variant
 * is `default` or `primary`, the two styles Slack draws.
 */
const SlackButtonApi: ComponentApi = {
  name: ButtonApi.name,
  schema: ButtonApi.schema
    .omit({checks: true, isValid: true, validationErrors: true})
    .extend({
      variant: buttonProps.variant
        .unwrap()
        .removeDefault()
        .exclude(['borderless'])
        .default('default')
        .describe(
          "A hint for the button style. 'primary' marks the main call to action and becomes Slack's primary button; 'default' is a plain Slack button.",
        )
        .optional(),
      action: buttonProps.action.unwrap(),
    })
    .strict()
    .describe(
      'A Slack button. Requires an action: an event, or a call to a catalog function. The borderless variant and checks are unsupported.',
    ),
};

const TableSchema = z
  .object({
    ...CommonProps,
    columns: z
      .array(
        z
          .object({
            header: dynamicString('Header text or binding for this column.'),
            align: z.enum(['left', 'center', 'right']).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(SLACK_LIMITS.tableColumns)
      .describe('Ordered column definitions. Use right alignment for scores or numeric values.'),
    rows: z
      .array(z.array(dynamicString()).min(1).max(SLACK_LIMITS.tableColumns))
      .min(1)
      .max(SLACK_TABLE_MAX_BODY_ROWS)
      .describe(
        `Body rows in column order. Every row must contain exactly one cell per column. Cells may be literal strings, data bindings, or string-returning functions. At most ${SLACK_TABLE_MAX_BODY_ROWS} body rows plus one header row; resolved cells must fit Slack text limits.`,
      ),
  })
  .strict()
  .describe(
    `An aligned Slack table for scores, rankings, and comparisons. Use this instead of Row/Text combinations for tabular data. Supports 1–${SLACK_LIMITS.tableColumns} columns and 1–${SLACK_TABLE_MAX_BODY_ROWS} body rows, with matching cell counts in every row.`,
  );

const TableApi = slackComponentApi('Table', TableSchema);

const DynamicNumberSchema = z.union([
  z.number(),
  z.object({path: z.string()}).strict(),
  z
    .object({
      call: z.string(),
      args: z.record(z.unknown()),
      returnType: z
        .enum(['string', 'number', 'boolean', 'array', 'object', 'any', 'void'])
        .default('number')
        .optional(),
    })
    .strict(),
]);

const ChartSchema = z
  .object({
    ...CommonProps,
    type: z
      .nativeEnum(ChartType)
      .optional()
      .describe(
        'Chart kind. Defaults to verticalBar. Use pie or donut for shares of a whole, line for trends, and bars to compare categories.',
      ),
    title: DynamicStringSchema.optional().describe('Title drawn above the chart.'),
    xAxisTitle: DynamicStringSchema.optional().describe(
      'Axis title under bar and line charts. Ignored for pie and donut.',
    ),
    yAxisTitle: DynamicStringSchema.optional().describe(
      'Axis title beside bar and line charts. Ignored for pie and donut.',
    ),
    data: z
      .array(
        z
          .object({
            label: DynamicStringSchema.describe('Category, slice name, or x value.'),
            value: DynamicNumberSchema.describe(
              'Number or binding. Pie and donut values must be zero or more.',
            ),
          })
          .strict(),
      )
      .min(1)
      .max(20)
      .describe('One entry per category, slice, or point, in display order (1 to 20).'),
  })
  .strict()
  .describe(
    'A bar, line, pie, or donut chart drawn from labeled values. The native Slack chart block cannot express every chart this catalog allows, so the Slack renderer draws the chart and sends it as an image. Give the numbers, not an image URL.',
  );

const ChartApi = slackComponentApi('Chart', ChartSchema);

/** A score: a number, or anything a DynamicString accepts, such as "3 (4)" or a binding. */
const DynamicScoreSchema = z.union([z.number(), ...DynamicStringSchema.options]);

const ScorecardTeamSchema = z
  .object({
    name: DynamicStringSchema.describe('Team or player name.'),
    score: DynamicScoreSchema.describe(
      'Score as a number, as text such as "3 (4)" for a penalty shootout, or a binding.',
    ),
  })
  .strict();

const ScorecardSchema = z
  .object({
    ...CommonProps,
    home: ScorecardTeamSchema.describe('The home team and its score, drawn on the left.'),
    away: ScorecardTeamSchema.describe('The away team and its score, drawn on the right.'),
    status: DynamicStringSchema.optional().describe(
      'Where the match stands, such as "Full time" or "72\'".',
    ),
    competition: DynamicStringSchema.optional().describe(
      'Competition or stage, such as "World Cup, Group C".',
    ),
  })
  .strict()
  .describe(
    "A match result card: two teams with their scores, plus an optional status and competition. Use it to show one game's score at a glance, and Table to list several results. Slack has no block for a scorecard, so the Slack renderer draws it and sends it as an uploaded image. Give the teams and scores, not an image URL.",
  );

const ScorecardApi = slackComponentApi('Scorecard', ScorecardSchema);

const slackBasicComponents: ComponentApi[] = [
  TextApi,
  SlackImageApi,
  SlackDividerApi,
  SlackRowApi,
  ColumnApi,
  CardApi,
  SlackButtonApi,
  SlackTextFieldApi,
  SlackDateTimeInputApi,
];

// The basic catalog's functions minus `openUrl`, the only one with a side effect. The
// preview runs function actions as read-only (see dispatchReadOnlyLocalFunctionAction).
const slackBasicFunctions = BASIC_FUNCTIONS.filter(({name}) => name !== 'openUrl');

const slackComponents = [
  ...slackBasicComponents,
  TableApi,
  ChartApi,
  ScorecardApi,
  slackComponentApi('MarketSnapshot', MarketSnapshotSchema),
];

/** The Slack renderer's A2UI catalog: the components and functions it can lower to Slack. */
export const slackCatalog = new Catalog(SLACK_CATALOG_ID, slackComponents, slackBasicFunctions);

/** A JSON Schema object, with the keywords this file reads typed. */
interface JsonSchemaObject {
  /** The JSON Schema dialect, named only at the root of a document or of a schema with an `$id`. */
  readonly $schema?: string;
  /** The schemas of an object's properties, by name. */
  readonly properties?: Record<string, unknown>;
  /** The properties an object must have. */
  readonly required?: string[];
  readonly [keyword: string]: unknown;
}

interface SlackCatalogJson {
  $schema: string;
  title: string;
  description: string;
  catalogId: string;
  components: Record<string, unknown>;
  functions?: Array<{
    name: string;
    description?: string;
    parameters: JsonSchemaObject;
    returnType: A2uiReturnType;
  }>;
  theme?: unknown;
  /**
   * The definitions every A2UI catalog document provides for other schemas to reference.
   * Composer validates the JSON editor against this document as `catalog.json`, and
   * `common_types.json` refers to `catalog.json#/$defs/anyFunction` for function calls.
   */
  $defs: {
    /** Any of the catalog's components. */
    anyComponent: {oneOf: Array<{$ref: string}>};
    /** A call to any of the catalog's functions. */
    anyFunction: {oneOf: Array<Record<string, unknown>>};
  };
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
 * The JSON Schema `pattern` the published catalog gives each string prop that
 * takes any string at run time, keyed by the prop's zod definition. The preview
 * checks these props when it draws the component, so it can report a specific
 * diagnostic; the pattern lets Composer's editor and assistant see the rule.
 */
const PUBLISHED_PATTERNS = new Map<unknown, string>([
  [ImageUrlLiteralSchema._def, HTTP_URL_PATTERN],
  [SourceNameSchema._def, SOURCE_NAME_PATTERN],
  [SourceUrlSchema._def, SOURCE_URL_PATTERN],
]);

/**
 * Called by zod-to-json-schema with each zod schema (`def`) and the JSON
 * Schema it made from it. Adds the pattern from `PUBLISHED_PATTERNS`, replaces
 * the JSON Schema made from `StringFunctionCallSchema` with
 * `stringFunctionCallJsonSchema`, and returns every other JSON Schema
 * unchanged.
 */
function publishedSchemaFor(jsonSchema: unknown, def: unknown): unknown {
  const pattern = PUBLISHED_PATTERNS.get(def);
  if (pattern !== undefined) {
    return {...(jsonSchema as Record<string, unknown>), pattern};
  }
  if (def === StringFunctionCallSchema._def) {
    return stringFunctionCallJsonSchema();
  }
  return jsonSchema;
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

function schemaJsonFor(schema: unknown): JsonSchemaObject {
  const jsonSchema = toJsonSchema(schema, {
    target: 'jsonSchema2019-09',
    $refStrategy: 'none',
    postProcess: publishedSchemaFor,
  }) as JsonSchemaObject;
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
          ...zodSchema.properties,
        },
        required: ['component', ...(zodSchema.required ?? [])],
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

/**
 * The schema of a call to one function, shaped like the basic catalog's entries under
 * `functions`. `functions` here is the inline catalog's list, which a `$ref` can't
 * address by name, so `$defs.anyFunction` inlines these instead.
 *
 * A function whose `returnType` is `any` takes any `returnType` in a call, so a
 * prop that needs a string can call it with `returnType: 'string'`.
 */
function functionCallSchemaFor(
  fn: NonNullable<SlackCatalogJson['functions']>[number],
): Record<string, unknown> {
  return {
    type: 'object',
    ...(fn.description ? {description: fn.description} : {}),
    properties: {
      call: {const: fn.name},
      args: callArgsSchemaFor(fn.parameters),
      returnType: fn.returnType === 'any' ? {} : {const: fn.returnType},
    },
    required: ['call', 'args'],
    unevaluatedProperties: false,
  };
}

/**
 * The schema of a call's `args`, from the function's `parameters`. `parameters`
 * describes the values the function receives, but a call can also give each
 * argument as a data binding or another function call, which the client resolves
 * to such a value before calling the function.
 *
 * It leaves out the `$schema` that `parameters` has. JSON Schema 2019-09 (section
 * 8.1.1) allows `$schema` only in a document's root schema or a schema with its
 * own `$id`, and `args` is neither: it sits inside the catalog's
 * `$defs.anyFunction`.
 */
function callArgsSchemaFor(parameters: JsonSchemaObject): JsonSchemaObject {
  const {$schema: _dialect, properties = {}, ...rest} = parameters;
  return {
    ...rest,
    properties: Object.fromEntries(
      Object.entries(properties).map(([name, schema]) => [
        name,
        {
          anyOf: [
            schema,
            {$ref: 'common_types.json#/$defs/DataBinding'},
            {$ref: 'common_types.json#/$defs/FunctionCall'},
          ],
        },
      ]),
    ),
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
    $defs: {
      anyComponent: {oneOf: Object.keys(components).map(name => ({$ref: `#/components/${name}`}))},
      anyFunction: {oneOf: functions.map(functionCallSchemaFor)},
    },
  };
}

/** The Slack catalog as the JSON Schema catalog document the renderer sends Composer. */
export const slackCatalogJson = createSlackCatalogJson(slackCatalog);
