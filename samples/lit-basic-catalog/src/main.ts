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

import {bootstrapLitSandbox} from 'a2ui-bridge/lit';
import {basicCatalog} from '@a2ui/lit/v0_9';
import {Catalog, ComponentApi} from '@a2ui/web_core/v0_9';
import {renderMarkdown} from '@a2ui/markdown-it';

// Export AppRoot class constructor value with a safe double cast to bypass duplicate-dependency nominal mismatches:
export const AppRoot = bootstrapLitSandbox([basicCatalog as unknown as Catalog<ComponentApi>], {
  elementTagName: 'app-root',
  markdownRenderer: renderMarkdown,
});

// Export AppRoot instance type under same name (type/value namespace merging)
// to ensure 100% backward-compatibility with test suites without touching test code:
export type AppRoot = InstanceType<typeof AppRoot>;
