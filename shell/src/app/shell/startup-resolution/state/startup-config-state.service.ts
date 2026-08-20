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

import {Injectable, computed, signal} from '@angular/core';

/**
 * Represents the configuration options for an application renderer.
 */
export declare interface RendererConfig {
  rendererUrl?: string;
  displayName?: string;
  id?: string;
  name?: string;
  apiKey?: string;
  samplePayload?: string;
}

/**
 * Contains configuration for an API key.
 */
export declare interface ApiKeyConfig {
  apiKey: string;
  displayName?: string;
}

/**
 * Root application configuration format.
 */
export declare interface AppConfig {
  renderers?: Record<string, RendererConfig>;
  apiKeys?: Record<string, ApiKeyConfig>;
}

/**
 * Core state store for application startup configuration.
 */
@Injectable({
  providedIn: 'root',
})
export class StartupConfigStateService {
  private readonly _resolvedUrl = signal<string | null>(null);
  private readonly _renderers = signal<Record<string, RendererConfig>>({});
  private readonly _selectedRendererId = signal<string | null>(null);
  private readonly _apiKeys = signal<Record<string, ApiKeyConfig>>({});
  private readonly _sharedA2uiPayload = signal<string | null>(null);
  private readonly _sharedA2uiError = signal<string | null>(null);

  readonly resolvedUrl = this._resolvedUrl.asReadonly();
  readonly renderers = this._renderers.asReadonly();
  readonly apiKeys = this._apiKeys.asReadonly();
  readonly selectedRendererId = this._selectedRendererId.asReadonly();
  readonly sharedA2uiPayload = this._sharedA2uiPayload.asReadonly();
  readonly sharedA2uiError = this._sharedA2uiError.asReadonly();

  readonly activeRenderer = computed<RendererConfig | null>(() => {
    const renderers = this._renderers();
    const selectedId = this._selectedRendererId();
    if (!selectedId) return null;
    return (
      renderers[selectedId] || Object.values(renderers).find(r => r.name === selectedId) || null
    );
  });

  setResolvedUrl(url: string | null): void {
    this._resolvedUrl.set(url);
  }

  setRenderers(renderers: Record<string, RendererConfig>): void {
    this._renderers.set(renderers);
  }

  setSelectedRendererId(id: string | null): void {
    this._selectedRendererId.set(id);
  }

  setApiKeys(apiKeys: Record<string, ApiKeyConfig>): void {
    this._apiKeys.set(apiKeys);
  }

  setSharedA2uiPayload(payload: string | null): void {
    this._sharedA2uiPayload.set(payload);
  }

  setSharedA2uiError(error: string | null): void {
    this._sharedA2uiError.set(error);
  }
}
