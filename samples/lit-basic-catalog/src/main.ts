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

import '../../shared/basic-catalog.css';
import {bootstrapLitSandbox} from 'a2ui-bridge/lit';
import {createMcpFunctionsCatalog} from 'a2ui-bridge';
import {basicCatalog, injectBasicCatalogStyles} from '@a2ui/web_core/catalogs/basic/v1';
import {renderMarkdown} from '@a2ui/markdown-it';
import {A2uiSurface} from '@a2ui/lit';
import {attachCatalogSchema} from '../../shared/attach-catalog-schema.js';
import {COMPONENT_USAGES} from '../../shared/usages.js';
import {DEMOS} from '../../shared/demos';

// Ensure the canonical @a2ui/lit surface component is registered
void A2uiSurface;

injectBasicCatalogStyles();
attachCatalogSchema(basicCatalog);

export const AppRoot = bootstrapLitSandbox([basicCatalog, createMcpFunctionsCatalog()], {
  elementTagName: 'app-root',
  markdownRenderer: renderMarkdown,
  getComponentUsages: async () => COMPONENT_USAGES,
  getDemos: async () => DEMOS,
});

export type AppRoot = InstanceType<typeof AppRoot>;
