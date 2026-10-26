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

// Kept free of Angular imports so that the e2e helpers can import it.

/** How long CatalogManagement waits for A2UI_CATALOG after GET_CATALOG. */
export const CATALOG_WATCHDOG_TIMEOUT_MS = 5000;

/** What CatalogManagement reports when no frame answers GET_CATALOG in time. */
export const CATALOG_WATCHDOG_MESSAGE =
  `Watchdog timeout: A2UI_CATALOG not received within ` +
  `${CATALOG_WATCHDOG_TIMEOUT_MS / 1000} seconds.`;
