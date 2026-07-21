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

import {Routes} from '@angular/router';
import {startupGuard} from './shell/startup-guard/startup-guard';

/**
 * Declarative routing table mapping URL paths to feature components
 * and guards within the A2UI Composer application.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/composer-shell/composer-shell').then(m => m.ComposerShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./shell/composer-workspace/composer-workspace').then(m => m.ComposerWorkspace),
        title: 'A2UI Composer Workspace',
        canActivate: [startupGuard],
      },
      {
        path: 'gallery',
        loadComponent: () => import('./gallery/gallery').then(m => m.Gallery),
        title: 'A2UI Components Gallery',
        canActivate: [startupGuard],
      },
      {
        path: 'custom-catalog',
        loadComponent: () =>
          import('./custom-catalog/assembled/custom-catalog').then(m => m.CustomCatalog),
        title: 'A2UI Custom Catalog',
        // No startupGuard: renders natively via @a2ui/angular, not the iframe renderer.
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings-view/settings').then(m => m.Settings),
        title: 'A2UI Composer Settings',
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
