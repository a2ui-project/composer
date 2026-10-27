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

import {ANIMATION_MODULE_TYPE, StaticProvider} from '@angular/core';
import {MATERIAL_ANIMATIONS} from '@angular/material/core';

// Replaces provideNoopAnimations(), which also set ANIMATION_MODULE_TYPE.
// Material dialogs/CDK overlays otherwise wait on a 75ms exit-animation timer
// so afterClosed() doesn't emit within tests.
const testProviders: StaticProvider[] = [
  {provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations'},
  {provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}},
];

export default testProviders;
