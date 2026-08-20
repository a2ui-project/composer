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
import {
  UsageTrackingService,
  ShareTrackingStatus,
} from '../../usage-tracking/usage-tracking.service';

import {ShareService} from './share.service';
import {signal} from '@angular/core';

describe('ShareService', () => {
  let service: ShareService;
  let mockClipboard: {copy: ReturnType<typeof vi.fn>};
  let mockSnackBar: {open: ReturnType<typeof vi.fn>};
  let mockStateSync: unknown;
  let mockStartupResolution: unknown;
  let mockDocument: {defaultView: {location: {href: string}}};
  let mockUsageTracking: {trackShareDesign: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    mockClipboard = {copy: vi.fn()};
    mockSnackBar = {open: vi.fn()};
    mockStateSync = {activeDraft: signal('{"a":1}')};
    mockStartupResolution = {resolvedUrl: signal('http://renderer')};
    mockDocument = {defaultView: {location: {href: 'http://localhost/'}}};
    mockUsageTracking = {trackShareDesign: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        {provide: Clipboard, useValue: mockClipboard},
        {provide: MatSnackBar, useValue: mockSnackBar},
        {provide: StateSync, useValue: mockStateSync},
        {provide: StartupResolution, useValue: mockStartupResolution},
        {provide: DOCUMENT, useValue: mockDocument},
        {provide: UsageTrackingService, useValue: mockUsageTracking},
      ],
    });

    service = TestBed.inject(ShareService);
  });

  it('copies to clipboard space tracks success with size and updates url correctly', async () => {
    mockClipboard.copy.mockReturnValue(true);
    await service.shareDesign();

    expect(mockClipboard.copy).toHaveBeenCalled();
    const copiedUrl = mockClipboard.copy.mock.calls[0][0];
    expect(copiedUrl).toContain('renderer=http%3A%2F%2Frenderer');
    expect(copiedUrl).toContain('a2ui=');
    expect(copiedUrl).not.toContain('search=');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.stringMatching(/copied to clipboard \(.* KB\)/),
      'Close',
      expect.any(Object),
    );
    expect(mockUsageTracking.trackShareDesign).toHaveBeenCalledWith({
      status: ShareTrackingStatus.SUCCESS,
      compressedLengthChars: expect.any(Number),
    });
  });

  it('handles clipboard copy failure and tracks failure status throwing error', async () => {
    mockClipboard.copy.mockReturnValue(false);

    await service.shareDesign();

    expect(mockUsageTracking.trackShareDesign).toHaveBeenCalledWith(
      expect.objectContaining({status: ShareTrackingStatus.FAILURE}),
    );
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Failed to copy link to clipboard',
      'Close',
      expect.any(Object),
    );
  });

  it('gives invalid json error', async () => {
    (mockStateSync as {activeDraft: ReturnType<typeof signal>}).activeDraft.set('invalid');
    await service.shareDesign();
    expect(mockClipboard.copy).not.toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Cannot share design: invalid JSON syntax',
      'Close',
      expect.any(Object),
    );
  });
});
