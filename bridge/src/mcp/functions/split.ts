/*
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * TODO: Replace this file with imports from `@a2ui/mcp-catalog/v0_9` once published to NPM.
 */

import {createFunctionImplementation, type FunctionImplementation} from '@a2ui/web_core/v0_9';
import {z} from 'zod/v3';

import {asyncable, type FunctionApiDefinition, overValue, withSettledArgs} from './common.js';

/** Function API definition for `split`. */
export const SplitApi: FunctionApiDefinition = {
  name: 'split',
  returnType: 'any',
  schema: z.object({
    value: asyncable(z.any()).describe('The string or array of strings to split.'),
    separator: asyncable(z.any()).describe(
      'The delimiter string to split on. An empty string splits into individual characters.',
    ),
  }) as unknown as FunctionApiDefinition['schema'],
};

/**
 * Splits a string into an array of substrings using a literal separator, or maps
 * the split operation across each element of an array of strings.
 */
export const SplitImplementation: FunctionImplementation = createFunctionImplementation(
  SplitApi as Parameters<typeof createFunctionImplementation>[0],
  args =>
    withSettledArgs(args, settled => {
      const separator = String(settled['separator'] ?? '');
      return overValue(settled['value'], item => item.split(separator));
    }),
);
