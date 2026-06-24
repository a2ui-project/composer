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
        },
        returnType: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'array', 'object', 'any', 'void'],
          default: 'boolean',
        },
      },
      required: ['call'],
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
          $ref: '#/$defs/FunctionCall',
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
          $ref: '#/$defs/FunctionCall',
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
          $ref: '#/$defs/FunctionCall',
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
  },
};
