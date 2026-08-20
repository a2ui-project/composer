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
  let sharedMockElement: HTMLElement;

  beforeEach(() => {
    sharedMockElement = document.createElement('div');
    document.body.appendChild(sharedMockElement);
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
    document.body.removeChild(sharedMockElement);
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

    await expect(service.captureScreenshot(sharedMockElement)).rejects.toThrow(
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

    const promise = service.captureScreenshot(sharedMockElement);
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

    const promise = service.captureScreenshot(sharedMockElement);
    await vi.advanceTimersByTimeAsync(150);
    const result = await promise;

    expect(mockRestrictionTarget.fromElement).toHaveBeenCalledWith(sharedMockElement);
    expect(mockTrack.restrictTo).toHaveBeenCalledWith(mockTarget);
    expect(result).toBe('data:image/png;base64,mockScreenshot');
  });

  it('logs a fallback warning when targetElement is provided but RestrictionTarget is unsupported', async () => {
    delete (globalThis as Record<string, unknown>)['RestrictionTarget'];
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: vi.fn().mockResolvedValue(mockStream)},
      configurable: true,
      writable: true,
    });

    const promise = service.captureScreenshot(sharedMockElement);
    await vi.advanceTimersByTimeAsync(150);
    const result = await promise;

    expect(warnSpy).toHaveBeenCalledWith(
      'RestrictionTarget API not supported, capturing full tab.',
    );
    expect(result).toBe('data:image/png;base64,mockScreenshot');
  });

  it('throws an error when targetElement is null, undefined, or disconnected without calling getDisplayMedia', async () => {
    const getDisplayMediaSpy = vi.fn();
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: getDisplayMediaSpy},
      configurable: true,
      writable: true,
    });

    await expect(service.captureScreenshot(null)).rejects.toThrow(
      'No active target element found to capture screenshot.',
    );
    await expect(service.captureScreenshot(undefined)).rejects.toThrow(
      'No active target element found to capture screenshot.',
    );
    const div = document.createElement('div');
    await expect(service.captureScreenshot(div)).rejects.toThrow(
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

    await expect(service.captureScreenshot(sharedMockElement)).rejects.toThrow(
      'No video track found in media stream.',
    );
  });

  it('logs a fallback warning when targetElement is provided but capture throws or fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = new Error('Capture failed');
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: vi.fn().mockRejectedValue(error)},
      configurable: true,
      writable: true,
    });

    // We can't even test targetElement in the getDisplayMedia throw case without one,
    // so just use undefined since it fails upfront, wait we need to test rejection!
    // But captureScreenshot will throw early if target element is undefined or not connected.
    // Wait, let's just use undefined / no-args.
    await expect(service.captureScreenshot(sharedMockElement)).rejects.toThrow(error);
    expect(warnSpy).toHaveBeenCalledWith('Capture canceled or failed:', error);
  });

  it('handles RestrictionTarget.fromElement rejection gracefully and captures full tab', async () => {
    const mockRestrictionTarget = {
      fromElement: vi.fn().mockRejectedValue(new Error('fromElement error')),
    };
    (globalThis as Record<string, unknown>)['RestrictionTarget'] = mockRestrictionTarget;

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: vi.fn().mockResolvedValue(mockStream)},
      configurable: true,
      writable: true,
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const promise = service.captureScreenshot(sharedMockElement);
    await vi.advanceTimersByTimeAsync(150);
    const result = await promise;

    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to restrict video track to element, falling back to full tab capture:',
      expect.any(Error),
    );
    expect(result).toBe('data:image/png;base64,mockScreenshot');
  });

  it('handles track.restrictTo rejection gracefully and captures full tab', async () => {
    const mockTarget = {type: 'restriction-target'};
    const mockRestrictionTarget = {
      fromElement: vi.fn().mockResolvedValue(mockTarget),
    };
    (globalThis as Record<string, unknown>)['RestrictionTarget'] = mockRestrictionTarget;
    mockTrack.restrictTo = vi.fn().mockRejectedValue(new Error('restrictTo error'));

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: vi.fn().mockResolvedValue(mockStream)},
      configurable: true,
      writable: true,
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const promise = service.captureScreenshot(sharedMockElement);
    await vi.advanceTimersByTimeAsync(150);
    const result = await promise;

    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to restrict video track to element, falling back to full tab capture:',
      expect.any(Error),
    );
    expect(result).toBe('data:image/png;base64,mockScreenshot');
  });

  it('throws an error when video playback rejects', async () => {
    vi.spyOn(HTMLVideoElement.prototype, 'play').mockRejectedValue(new Error('Play error'));

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {getDisplayMedia: vi.fn().mockResolvedValue(mockStream)},
      configurable: true,
      writable: true,
    });

    let caughtError: Error | undefined;
    const promise = service.captureScreenshot(sharedMockElement).catch(e => {
      caughtError = e;
    });
    await vi.advanceTimersByTimeAsync(150);
    await promise;
    expect(caughtError?.message).toContain('Play error');
  });
});
