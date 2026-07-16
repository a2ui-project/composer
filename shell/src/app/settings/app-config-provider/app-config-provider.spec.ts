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

import {signal, Signal, WritableSignal} from '@angular/core';
import {describe, it, expect} from 'vitest';
import {AppConfigProvider, EnvMode, AuthType, ThemePreference} from './app-config-provider';

/**
 * Concrete implementation of AppConfigProvider used solely for testing type bounds.
 */
class TestConfigProvider extends AppConfigProvider {
  private readonly internalEnvMode: WritableSignal<EnvMode> = signal(EnvMode.STANDALONE);
  private readonly internalAuthType: WritableSignal<AuthType> = signal(AuthType.THIRD_PARTY);
  private readonly internalRendererUrl: WritableSignal<string> = signal(
    'https://test-renderer.com',
  );
  private readonly internalGeminiApiKey: WritableSignal<string> = signal('test-api-key');
  private readonly internalThemePreference: WritableSignal<ThemePreference> = signal('light');

  override readonly envMode: Signal<EnvMode> = this.internalEnvMode.asReadonly();
  override readonly authType: Signal<AuthType> = this.internalAuthType.asReadonly();
  override readonly rendererUrl: Signal<string> = this.internalRendererUrl.asReadonly();
  override readonly geminiApiKey: Signal<string> = this.internalGeminiApiKey.asReadonly();
  override readonly themePreference: Signal<ThemePreference> =
    this.internalThemePreference.asReadonly();

  override setRendererUrl(url: string): void {
    this.internalRendererUrl.set(url);
  }

  override setGeminiApiKey(key: string): void {
    this.internalGeminiApiKey.set(key);
  }

  override setForcedAuthMode(mode: AuthType): void {
    this.internalAuthType.set(mode);
  }

  override setThemePreference(theme: ThemePreference): void {
    this.internalThemePreference.set(theme);
  }

  override flushConfig(): void {
    this.internalEnvMode.set(EnvMode.STANDALONE);
    this.internalAuthType.set(AuthType.THIRD_PARTY);
    this.internalRendererUrl.set('https://test-renderer.com');
    this.internalGeminiApiKey.set('test-api-key');
    this.internalThemePreference.set('light');
  }
}

describe('AppConfigProvider', () => {
  it('instantiates and maps mock signals correctly without compilation errors', () => {
    const provider = new TestConfigProvider();

    expect(provider.envMode()).toBe(EnvMode.STANDALONE);
    expect(provider.authType()).toBe(AuthType.THIRD_PARTY);
    expect(provider.rendererUrl()).toBe('https://test-renderer.com');
    expect(provider.geminiApiKey()).toBe('test-api-key');
  });

  it('mutates active renderer url mapping as expected', () => {
    const provider = new TestConfigProvider();
    provider.setRendererUrl('https://new-endpoint.com');
    expect(provider.rendererUrl()).toBe('https://new-endpoint.com');
  });

  it('mutates personal third-party API key as expected', () => {
    const provider = new TestConfigProvider();
    provider.setGeminiApiKey('fresh-key');
    expect(provider.geminiApiKey()).toBe('fresh-key');
  });

  it('overrides target authentication modes as expected', () => {
    const provider = new TestConfigProvider();
    provider.setForcedAuthMode(AuthType.FIRST_PARTY);
    expect(provider.authType()).toBe(AuthType.FIRST_PARTY);
  });

  it('flushes dynamic configurations as expected', () => {
    const provider = new TestConfigProvider();
    provider.setRendererUrl('https://dirty.com');
    provider.flushConfig();
    expect(provider.rendererUrl()).toBe('https://test-renderer.com');
  });
});
