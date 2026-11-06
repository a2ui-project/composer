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

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';
import {describe, it, expect} from 'vitest';
import {COMMON_TYPES_SCHEMA, V1_0_COMMON_TYPES_SCHEMA} from './common-types-schema';

describe('V1.0 COMMON_TYPES_SCHEMA', () => {
  it('defines canonical $id and schema draft for v1.0 specification', () => {
    expect(COMMON_TYPES_SCHEMA['$schema']).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(COMMON_TYPES_SCHEMA['$id']).toBe(
      'https://a2ui.org/specification/v1_0/common_types.json',
    );
    expect(V1_0_COMMON_TYPES_SCHEMA).toBe(COMMON_TYPES_SCHEMA);
  });

  it('defines DataBinding with @path property', () => {
    const defs = COMMON_TYPES_SCHEMA['$defs'] as Record<string, Record<string, unknown>>;
    expect(defs['DataBinding']).toBeDefined();
    const dataBindingProps = defs['DataBinding']['properties'] as Record<string, unknown>;
    expect(dataBindingProps['@path']).toBeDefined();
    expect(dataBindingProps['path']).toBeUndefined();
    expect(defs['DataBinding']['required']).toEqual(['@path']);
  });

  it('defines FunctionCall and FunctionCommon with @call, catalogId, and ZERO returnType property', () => {
    const defs = COMMON_TYPES_SCHEMA['$defs'] as Record<string, Record<string, unknown>>;
    expect(defs['FunctionCommon']).toBeDefined();
    const funcCommonProps = defs['FunctionCommon']['properties'] as Record<string, unknown>;
    expect(funcCommonProps['@call']).toBeDefined();
    expect(funcCommonProps['catalogId']).toBeDefined();
    expect(funcCommonProps['returnType']).toBeUndefined();
    expect(funcCommonProps['call']).toBeUndefined();
    expect(defs['FunctionCommon']['required']).toEqual(['@call']);

    expect(defs['FunctionCall']).toBeDefined();
    const funcCallProps = (defs['FunctionCall']['properties'] || {}) as Record<string, unknown>;
    expect(funcCallProps['returnType']).toBeUndefined();
  });

  it('contains all required definitions for basic catalog and McpFunctionsCatalog', () => {
    const defs = COMMON_TYPES_SCHEMA['$defs'] as Record<string, Record<string, unknown>>;
    const requiredDefs = [
      'ComponentId',
      'CallId',
      'AccessibilityAttributes',
      'Extensions',
      'ComponentCommon',
      'Child',
      'ChildList',
      'DataBinding',
      'DynamicValue',
      'DynamicString',
      'DynamicNumber',
      'DynamicBoolean',
      'DynamicStringList',
      'FunctionCommon',
      'IndexSystemFunction',
      'FunctionCall',
      'CheckRule',
      'Checkable',
      'Action',
      'Surface',
      'FunctionResponse',
    ];

    for (const defName of requiredDefs) {
      expect(defs[defName]).toBeDefined();
    }
  });

  it('quotes all property keys in common-types-schema.ts to preserve keys under compilation', () => {
    const schemaDir = expect.getState().testPath
      ? path.dirname(expect.getState().testPath!)
      : path.resolve(process.cwd(), 'src/app/gallery/schema/v1-0');
    const filePath = path.resolve(schemaDir, 'common-types-schema.ts');

    const sourceText = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
    let propertyCount = 0;
    const unquotedKeys: string[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isPropertyAssignment(node)) {
        propertyCount++;
        const keyText = node.name.getText(sourceFile);
        if (!ts.isStringLiteral(node.name) || !keyText.startsWith("'")) {
          unquotedKeys.push(keyText);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);

    expect(propertyCount).toBeGreaterThan(0);
    expect(unquotedKeys).toEqual([]);
  });
});
