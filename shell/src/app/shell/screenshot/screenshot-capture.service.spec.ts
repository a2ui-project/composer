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
import {ScreenshotCaptureService} from './screenshot-capture.service';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';

describe('ScreenshotCaptureService', () => {
  let service: ScreenshotCaptureService;
  let mockTrack: MediaStreamTrack;
  let mockStream: MediaStream;
  let originalMediaDevices: MediaDevices | undefined;
  let originalRestrictionTarget: unknown;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreenshotCaptureService);

    originalMediaDevices = navigator.mediaDevices;
    originalRestrictionTarget = (globalThis as Record<string, unknown>)['RestrictionTarget'];

    mockTrack = {
      stop: vi.fn(),
      restrictTo: vi.fn().mockResolvedValue(undefined),
    } as unknown as MediaStreamTrack;

    mockStream = {
      getVideoTracks: vi.fn().mockReturnValue([mockTrack]),
      getTracks: vi.fn().mockReturnValue([mockTrack]),
    } as unknown as MediaStream;

    Object.defineProperty(HTMLVideoElement.prototype, 'onloadedmetadata', {
      set(fn: (() => void) | null) {
        if (typeof fn === 'function') {
          setTimeout(() => fn(), 0);
        }
      },
      configurable: true,
    });

    vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,mockScreenshot',
    );
    vi.useFakeTimers({toFake: ['setTimeout']});
  });

  afterEach(() => {
    vi.useRealTimers();

    if (originalMediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: originalMediaDevices,
        configurable: true,
        writable: true,
      });
    } else {
      // @ts-expect-error - cleanup navigator.mediaDevices
      delete navigator.mediaDevices;
    }

    if (originalRestrictionTarget !== undefined) {
      (globalThis as Record<string, unknown>)['RestrictionTarget'] = originalRestrictionTarget;
    } else {
      delete (globalThis as Record<string, unknown>)['RestrictionTarget'];
    }

    vi.restoreAllMocks();
  });

  it('instantiates successfully', () => {
    expect(service).toBeTruthy();
  });

  it('throws an error when getDisplayMedia API is missing or unsupported', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {},
      configurable: true,
      writable: true,
    });

    await expect(service.captureScreenshot()).rejects.toThrow(
      'Screen capture is not supported in this browser.',
    );
  });

  it('captures a screenshot with preferCurrentTab option and waits 150ms for visual stabilization buffer', async () => {
    const getDisplayMediaSpy = vi.fn().mockResolvedValue(mockStream);
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: getDisplayMediaSpy},
      configurable: true,
      writable: true,
    });

    const promise = service.captureScreenshot();
    await vi.advanceTimersByTimeAsync(150);
    const result = await promise;

    expect(getDisplayMediaSpy).toHaveBeenCalledWith({
      video: {displaySurface: 'browser'},
      audio: false,
      preferCurrentTab: true,
    });
    expect(mockTrack.stop).toHaveBeenCalled();
    expect(result).toBe('data:image/png;base64,mockScreenshot');
  });

  it('applies crop restriction via RestrictionTarget.fromElement when targetElement is provided and supported', async () => {
    const mockElement = document.createElement('div');
    const mockTarget = {type: 'restriction-target'};
    const mockRestrictionTarget = {
      fromElement: vi.fn().mockResolvedValue(mockTarget),
    };
    (globalThis as Record<string, unknown>)['RestrictionTarget'] = mockRestrictionTarget;

    const getDisplayMediaSpy = vi.fn().mockResolvedValue(mockStream);
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: getDisplayMediaSpy},
      configurable: true,
      writable: true,
    });

    const promise = service.captureScreenshot(mockElement);
    await vi.advanceTimersByTimeAsync(150);
    const result = await promise;

    expect(mockRestrictionTarget.fromElement).toHaveBeenCalledWith(mockElement);
    expect(mockTrack.restrictTo).toHaveBeenCalledWith(mockTarget);
    expect(result).toBe('data:image/png;base64,mockScreenshot');
  });

  it('logs a fallback warning when targetElement is provided but RestrictionTarget is unsupported', async () => {
    const mockElement = document.createElement('div');
    delete (globalThis as Record<string, unknown>)['RestrictionTarget'];
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: vi.fn().mockResolvedValue(mockStream)},
      configurable: true,
      writable: true,
    });

    const promise = service.captureScreenshot(mockElement);
    await vi.advanceTimersByTimeAsync(150);
    const result = await promise;

    expect(warnSpy).toHaveBeenCalledWith(
      'RestrictionTarget API not supported, capturing full tab.',
    );
    expect(result).toBe('data:image/png;base64,mockScreenshot');
  });

  it('throws an error when targetElement is null without calling getDisplayMedia', async () => {
    const getDisplayMediaSpy = vi.fn();
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: getDisplayMediaSpy},
      configurable: true,
      writable: true,
    });

    await expect(service.captureScreenshot(null)).rejects.toThrow(
      'No active target element found to capture screenshot.',
    );
    expect(getDisplayMediaSpy).not.toHaveBeenCalled();
  });

  it('throws an error when getVideoTracks returns an empty array', async () => {
    const emptyStream = {
      getVideoTracks: vi.fn().mockReturnValue([]),
      getTracks: vi.fn().mockReturnValue([]),
    } as unknown as MediaStream;
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: vi.fn().mockResolvedValue(emptyStream)},
      configurable: true,
      writable: true,
    });

    await expect(service.captureScreenshot()).rejects.toThrow(
      'No video track found in media stream.',
    );
  });

  it('logs a warning to console when capture throws or fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = new Error('Capture failed');
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: vi.fn().mockRejectedValue(error)},
      configurable: true,
      writable: true,
    });

    await expect(service.captureScreenshot()).rejects.toThrow(error);
    expect(warnSpy).toHaveBeenCalledWith('Capture canceled or failed:', error);
  });
});
