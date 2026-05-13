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

/**
 * Declarative routing table mapping URL paths to feature components
 * and guards within the A2UI Composer application.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/composer-shell.component').then(m => m.ComposerShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./shell/composer-workspace.component').then(m => m.ComposerWorkspaceComponent),
        title: 'A2UI Composer Workspace',
      },
      {
        path: 'gallery',
        loadComponent: () => import('./gallery/gallery.component').then(m => m.GalleryComponent),
        title: 'A2UI Components Gallery',
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
        title: 'A2UI Composer Settings',
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
