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

/**
 * This is a copy synchronized from https://github.com/a2ui-project/a2ui/blob/main/specification/v0_9/json/common_types.json
 */
export const COMMON_TYPES_SCHEMA: Record<string, unknown> = {
  $defs: {
    ComponentId: {
      type: 'string',
    },
    ChildList: {
      oneOf: [
        {
          type: 'array',
          items: {
            $ref: '#/$defs/ComponentId',
          },
        },
        {
          type: 'object',
          properties: {
            componentId: {
              $ref: '#/$defs/ComponentId',
            },
            path: {
              type: 'string',
            },
          },
          required: ['componentId', 'path'],
          additionalProperties: false,
        },
      ],
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
          additionalProperties: {
            anyOf: [
              {
                $ref: '#/$defs/DynamicValue',
              },
              {
                type: 'object',
              },
            ],
          },
        },
        returnType: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'array', 'object', 'any', 'void'],
          default: 'boolean',
        },
      },
      required: ['call'],
      oneOf: [
        {
          $ref: 'catalog.json#/$defs/anyFunction',
        },
      ],
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
    DynamicBoolean: {
      oneOf: [
        {
          type: 'boolean',
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
                  const: 'boolean',
                },
              },
            },
          ],
        },
      ],
    },
    DynamicNumber: {
      oneOf: [
        {
          type: 'number',
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
                  const: 'number',
                },
              },
            },
          ],
        },
      ],
    },
    DynamicValue: {
      oneOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
        {
          type: 'boolean',
        },
        {
          type: 'array',
        },
        {
          $ref: '#/$defs/DataBinding',
        },
        {
          $ref: '#/$defs/FunctionCall',
        },
      ],
    },
    Action: {
      oneOf: [
        {
          type: 'object',
          properties: {
            event: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                context: {
                  type: 'object',
                  additionalProperties: {
                    $ref: '#/$defs/DynamicValue',
                  },
                },
              },
              required: ['name'],
              additionalProperties: false,
            },
          },
          required: ['event'],
          additionalProperties: false,
        },
        {
          type: 'object',
          properties: {
            functionCall: {
              $ref: '#/$defs/FunctionCall',
            },
          },
          required: ['functionCall'],
          additionalProperties: false,
        },
      ],
    },
    AccessibilityAttributes: {
      type: 'object',
      description:
        'Attributes to enhance accessibility when using assistive technologies like screen readers.',
      properties: {
        label: {
          $ref: '#/$defs/DynamicString',
          description:
            "A short string, typically 1 to 3 words, used by assistive technologies to convey the purpose or intent of an element. For example, an input field might have an accessible label of 'User ID' or a button might be labeled 'Submit'.",
        },
        description: {
          $ref: '#/$defs/DynamicString',
          description:
            "Additional information provided by assistive technologies about an element such as instructions, format requirements, or result of an action. For example, a mute button might have a label of 'Mute' and a description of 'Silences notifications about this conversation'.",
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
    DynamicStringList: {
      description:
        'Represents a value that can be either a literal array of strings, a path to a string array in the data model, or a function call returning a string array.',
      oneOf: [
        {
          type: 'array',
          items: {
            type: 'string',
          },
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
                  const: 'array',
                },
              },
            },
          ],
        },
      ],
    },
    CheckRule: {
      type: 'object',
      description: 'A single validation rule applied to an input component.',
      properties: {
        condition: {
          $ref: '#/$defs/DynamicBoolean',
        },
        message: {
          type: 'string',
          description: 'The error message to display if the check fails.',
        },
      },
      required: ['condition', 'message'],
      additionalProperties: false,
    },
    Checkable: {
      description: 'Properties for components that support client-side checks.',
      type: 'object',
      properties: {
        checks: {
          type: 'array',
          description:
            'A list of checks to perform. These are function calls that must return a boolean indicating validity.',
          items: {
            $ref: '#/$defs/CheckRule',
          },
        },
      },
    },
  },
};
