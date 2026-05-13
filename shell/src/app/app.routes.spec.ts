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
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {describe, it, expect, beforeEach} from 'vitest';

describe('App Routes', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('defines routing pathway for the central workspace dashboard', () => {
    const parentRoute = routes.find(r => r.path === '');
    expect(parentRoute).toBeTruthy();
    const childRoute = parentRoute?.children?.find(r => r.path === '');
    expect(childRoute).toBeTruthy();
    expect(childRoute?.title).toBe('A2UI Composer Workspace');
  });

  it('defines routing pathway for the components gallery placeholder', () => {
    const parentRoute = routes.find(r => r.path === '');
    expect(parentRoute).toBeTruthy();
    const childRoute = parentRoute?.children?.find(r => r.path === 'gallery');
    expect(childRoute).toBeTruthy();
    expect(childRoute?.title).toBe('A2UI Components Gallery');
  });

  it('defines routing pathway for the settings configuration view', () => {
    const parentRoute = routes.find(r => r.path === '');
    expect(parentRoute).toBeTruthy();
    const childRoute = parentRoute?.children?.find(r => r.path === 'settings');
    expect(childRoute).toBeTruthy();
    expect(childRoute?.title).toBe('A2UI Composer Settings');
  });
});
