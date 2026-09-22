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

/** A custom element backed by the Lynx Web runtime. */
export interface LynxViewElement extends HTMLElement {
  initData?: Record<string, unknown>;
  globalProps?: Record<string, unknown>;
  reload?: () => void;
  sendGlobalEvent?: (eventName: string, params: unknown[]) => void;
  onNativeModulesCall?: (name: string, data: unknown, moduleName: string) => unknown;
}
