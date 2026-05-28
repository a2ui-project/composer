/**
 * @license
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

/**
 * Enumerates the standard browser storage keys reserved for persistence.
 * Shields the application logic from raw string keys when accessing local storage.
 */
export enum LocalStorageKey {
  /** Key for storing the active preview renderer URL target. */
  RENDERER_URL = 'a2ui_composer_renderer_url',
  /** Key for storing the personal third-party Gemini developer API token. */
  GEMINI_API_KEY = 'a2ui_composer_api_key',
  /** Key mapping forced 1P authentication override settings. */
  FORCE_1P = 'a2ui_composer_force_1p',
  /** Key mapping forced 3P authentication override settings. */
  FORCE_3P = 'a2ui_composer_force_3p',
  /** Key tracking active runtime environment configuration modes. */
  EXTENSION_MODE = 'a2ui_composer_extension_mode',
  /** Key for retrieving the active workspace prompt in-progress draft content. */
  ACTIVE_DRAFT = 'a2ui_composer_active_draft',
  /** Key for persisting the user's theme selection (light vs dark). */
  THEME_PREFERENCE = 'a2ui_composer_theme_preference',
}
