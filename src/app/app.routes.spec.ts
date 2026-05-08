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

import {TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {describe, it, expect, beforeEach} from 'vitest';

describe('App Routes', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
    router = TestBed.inject(Router);
  });

  it('defines routing pathway for the central workspace dashboard', () => {
    const route = routes.find(r => r.path === '');
    expect(route).toBeTruthy();
    expect(route?.title).toBe('A2UI Composer Workspace');
  });

  it('defines routing pathway for the components gallery placeholder', () => {
    const route = routes.find(r => r.path === 'gallery');
    expect(route).toBeTruthy();
    expect(route?.title).toBe('A2UI Components Gallery');
  });
});
