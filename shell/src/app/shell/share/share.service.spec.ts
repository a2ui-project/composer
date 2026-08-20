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

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {Clipboard} from '@angular/cdk/clipboard';
import {DOCUMENT} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StateSync} from '../../chat/state-sync/state-sync';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {UsageTrackingService} from '../../usage-tracking/usage-tracking.service';
import {NoopUsageTrackingService} from '../../usage-tracking/noop-usage-tracking.service';
import {ShareService} from './share.service';
import {signal} from '@angular/core';

describe('ShareService', () => {
  let service: ShareService;
  let mockClipboard: {copy: ReturnType<typeof vi.fn>};
  let mockSnackBar: {open: ReturnType<typeof vi.fn>};
  let mockStateSync: unknown;
  let mockStartupResolution: unknown;
  let mockDocument: unknown;

  beforeEach(() => {
    mockClipboard = {copy: vi.fn()};
    mockSnackBar = {open: vi.fn()};
    mockStateSync = {activeDraft: signal('{"a":1}')};
    mockStartupResolution = {resolvedUrl: signal('http://renderer')};
    mockDocument = {defaultView: {location: {href: 'http://localhost/'}}};

    TestBed.configureTestingModule({
      providers: [
        {provide: Clipboard, useValue: mockClipboard},
        {provide: MatSnackBar, useValue: mockSnackBar},
        {provide: StateSync, useValue: mockStateSync},
        {provide: StartupResolution, useValue: mockStartupResolution},
        {provide: DOCUMENT, useValue: mockDocument},
        {provide: UsageTrackingService, useClass: NoopUsageTrackingService},
      ],
    });

    service = TestBed.inject(ShareService);
  });

  it('should copy to clipboard when valid', async () => {
    mockClipboard.copy.mockReturnValue(true);
    await service.shareDesign();
    expect(mockClipboard.copy).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('copied to clipboard'),
      'Close',
      expect.any(Object),
    );
  });

  it('includes rendererId in share URL hash when selectedRendererId$ is present', async () => {
    mockClipboard.copy.mockReturnValue(true);
    (mockStartupResolution as {selectedRendererId$: unknown}).selectedRendererId$ =
      signal('angular-dev');
    await service.shareDesign();
    expect(mockClipboard.copy).toHaveBeenCalledWith(
      expect.stringContaining('rendererId=angular-dev'),
    );
  });
});
