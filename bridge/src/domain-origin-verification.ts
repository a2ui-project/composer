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

export class DomainOriginVerificationService {
  /**
   * Verifies if a given message event comes from an explicitly trusted origin.
   *
   * Depends on the `?origin=` URL parameter pairing contract to dynamically authenticate
   * cross-origin communication with the parent Shell context.
   *
   * Note: This Javascript-level origin validation assumes the presence of a strict
   * outgoing HTTP CSP `frame-ancestors` policy configured on the hosting server
   * to protect against raw clickjacking and malicious iframe embedding prior to bridging.
   */
  static verifyStrictOrigin(
    eventOrigin: string,
    eventSource: MessageEventSource | null,
    parentWindow: Window,
  ): boolean {
    if (!eventSource || eventSource !== parentWindow) {
      return false;
    }

    if (typeof window !== 'undefined') {
      if (eventOrigin === window.location.origin) {
        return true;
      }

      if (window.location.search) {
        try {
          const params = new URLSearchParams(window.location.search);
          const expectedOrigin = params.get('origin');
          if (expectedOrigin && eventOrigin === expectedOrigin) {
            return true;
          }
        } catch {
          // Ignore URLSearchParams failure
        }
      }
    }

    return false;
  }
}
