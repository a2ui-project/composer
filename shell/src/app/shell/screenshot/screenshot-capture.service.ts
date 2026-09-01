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

import {Injectable} from '@angular/core';

declare global {
  class RestrictionTarget {
    static fromElement(element: Element): Promise<RestrictionTarget>;
  }

  interface MediaStreamTrack {
    restrictTo(target: RestrictionTarget | null): Promise<void>;
  }
}

/**
 * Service providing screenshot capture capabilities using browser media APIs.
 */
@Injectable({providedIn: 'root'})
export class ScreenshotCaptureService {
  /**
   * Captures a screenshot of the current tab, optionally restricted to a target element.
   * @param targetElement Optional DOM element to restrict the screenshot to.
   * @return A base64-encoded PNG image string.
   */
  async captureScreenshot(targetElement: Element | null | undefined): Promise<string> {
    if (!targetElement || !targetElement.isConnected) {
      throw new Error('No active target element found to capture screenshot.');
    }
    if (!navigator?.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen capture is not supported in this browser.');
    }
    let stream: MediaStream | null = null;
    try {
      // prettier-ignore
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {displaySurface: 'browser'},
        audio: false,
        // @ts-expect-error - preferCurrentTab is a recent/experimental API not yet in TS types
        'preferCurrentTab': true,
      });

      const [track] = stream.getVideoTracks();
      if (!track) {
        throw new Error('No video track found in media stream.');
      }
      if (targetElement) {
        const restrictionTargetClass = (globalThis as Record<string, unknown>)[
          'RestrictionTarget'
        ] as {fromElement?: (element: Element) => Promise<RestrictionTarget>} | undefined;

        if (
          typeof restrictionTargetClass?.fromElement === 'function' &&
          typeof track?.restrictTo === 'function'
        ) {
          try {
            const target = await restrictionTargetClass.fromElement(targetElement);
            await track.restrictTo(target);
          } catch (restrictionError) {
            console.warn(
              'Failed to restrict video track to element, falling back to full tab capture:',
              restrictionError,
            );
          }
        } else {
          console.warn('RestrictionTarget API not supported, capturing full tab.');
        }
      }

      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
        video.onerror = reject;
      });

      // Give the browser a tiny buffer to apply the restriction crop visually
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to create canvas context for screenshot');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.warn('Capture canceled or failed:', error);
      throw error;
    } finally {
      if (stream) stream.getTracks().forEach(track => track.stop());
    }
  }
}
