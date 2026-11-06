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

import {Injectable} from '@angular/core';
import {BasicCatalog} from '@a2ui/angular';
import {attachCatalogSchema} from '../../../shared/attach-catalog-schema.js';
import {COMPONENT_USAGES} from '../../../shared/usages.js';

/**
 * Angular catalog providing canonical A2UI v1.0 BasicCatalog components
 * enriched with component usage examples from usages.ts for the Gallery.
 */
@Injectable({
  providedIn: 'root',
})
export class SampleBasicCatalog extends BasicCatalog {
  constructor() {
    super();
    attachCatalogSchema(this, COMPONENT_USAGES);
  }
}
