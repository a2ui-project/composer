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

import {basicCatalog as v09BasicCatalog} from '@a2ui/web_core/v0_9/basic_catalog';
import type {Catalog, ComponentApi} from '@a2ui/web_core/v0_9';
import {attachCatalogSchema} from '../../../shared/attach-catalog-schema.js';
import {createDualIdV09BasicCatalogs} from '../../../shared/v0-9/basic-catalog-id.js';

export const v09Catalogs = createDualIdV09BasicCatalogs(
  v09BasicCatalog as unknown as Catalog<ComponentApi>,
  attachCatalogSchema,
  'React Basic Catalog (v0.9)',
);
