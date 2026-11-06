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

// Kept free of Angular imports so that the Playwright runner can load it.

/**
 * Renderer dev servers hosting the guest samples, started by the `webServer`
 * entries in playwright.config.ts. The ports live in both places because the
 * config starts the servers by command line; these are the addresses the e2e
 * and visual tests navigate to.
 */
export const RENDERER_URLS = {
  angular: 'http://localhost:3456',
  lit: 'http://localhost:3457',
  react: 'http://localhost:3458',
  slack: 'http://localhost:3460',
} as const;
