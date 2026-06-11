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

import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  // 1. Global Exclusions
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/.angular/**',
      '**/node_modules/**',
      '**/vite.config.ts',
      '**/vitest.config.ts',
    ],
  },

  // 2. Universal Base TypeScript Rules
  ...tseslint.configs.recommended.map(c => ({
    ...c,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
          caughtErrors: 'none',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // 3. Angular Shell Rules
  ...angular.configs.tsRecommended.map(c => ({
    ...c,
    files: ['shell/**/*.ts'],
  })),
  {
    files: ['shell/**/*.ts'],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'a2ui-composer',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'a2ui-composer',
          style: 'kebab-case',
        },
      ],
    },
  },
  ...angular.configs.templateRecommended.map(c => ({
    ...c,
    files: ['shell/**/*.html'],
  })),
  {
    files: ['shell/**/*.html'],
    rules: {},
  },

  // 4. Angular Sample Catalog Rules
  ...angular.configs.tsRecommended.map(c => ({
    ...c,
    files: ['samples/ng-basic-catalog/**/*.ts'],
  })),
  {
    files: ['samples/ng-basic-catalog/**/*.ts'],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  ...angular.configs.templateRecommended.map(c => ({
    ...c,
    files: ['samples/ng-basic-catalog/**/*.html'],
  })),
  {
    files: ['samples/ng-basic-catalog/**/*.html'],
    rules: {},
  },
);
