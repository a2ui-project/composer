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

export interface MonacoModel {
  getValue(): string;
  setValue(value: string): void;
}

export interface WindowWithMonaco extends Window {
  monaco?: {
    editor: {
      getModels(): MonacoModel[];
    };
  };
}

/** A single SURFACE_RESIZE message observed on the postMessage wire. */
export interface SurfaceResizeLogEntry {
  /** Height reported by the guest, in CSS pixels. */
  height?: number;
  /** `performance.now()` timestamp of the observation. */
  timeMs: number;
}

/** Window carrying the SURFACE_RESIZE wire log installed by the e2e init script. */
export interface WindowWithResizeLog extends Window {
  __a2uiResizeLog?: SurfaceResizeLogEntry[];
}
