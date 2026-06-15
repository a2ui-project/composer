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

import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {StartupResolution} from '../startup-resolution/startup-resolution';

/**
 * Routing guard ensuring that the StartupResolution has completed
 * resolving configuration schemas prior to rendering target routes.
 */
export const startupGuard: CanActivateFn = async () => {
  const startupResolution = inject(StartupResolution);
  const router = inject(Router);

  const isValid = await startupResolution.isEnvironmentValid();
  if (!isValid) {
    return router.createUrlTree(['/settings']);
  }

  return true;
};
