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

import {Signal} from '@angular/core';

/**
 * Identifies the host operational target modes.
 * Determines the communication bridges and platform capabilities available.
 */
export enum EnvMode {
  /** Running as a standalone application directly inside a web browser window. */
  STANDALONE = 'standalone',
  /** Running integrated inside a host developer IDE container context. */
  EXTENSION = 'extension',
}

/**
 * Declares target authentication protocols.
 * Distinguishes direct user-provided credential handshakes from enterprise
 * identity services.
 */
export enum AuthType {
  /** Default authentication resolved dynamically based on runtime environment. */
  DEFAULT = 'default',
  /** Enterprise identity protocol for internal developer services. */
  FIRST_PARTY = '1p',
  /** Public endpoint authentication utilizing user developer keys. */
  THIRD_PARTY = '3p',
}

/** Strong type representation for Light/Dark mode theme options. */
export type ThemePreference = 'light' | 'dark';

/**
 * Declares abstract configuration parameters, shielding the workspace
 * environment from direct local storage or file system calls.
 * Provides central reactive signal pathways to coordinate identity, endpoints,
 * and security tokens across decoupled visual blocks.
 */
export abstract class AppConfigProvider {
  /** Orchestrates overall domain configuration and credential bootstrapping. */
  abstract initialize(): Promise<void> | void;

  /** The active workspace runtime mode, standalone vs extension. */
  abstract readonly envMode: Signal<EnvMode>;

  /** The active authentication protocol context. */
  abstract readonly authType: Signal<AuthType>;

  /** Target URL path targeting preview iframe controllers. */
  abstract readonly rendererUrl: Signal<string>;

  /** Ephemeral api key token for Gemini LLM handshakes. */
  abstract readonly geminiApiKey: Signal<string>;

  /** Exposes the active theme preference selection, light vs dark. */
  abstract readonly themePreference: Signal<ThemePreference>;

  /** Exposes whether screenshots should be automatically attached to LLM prompts. */
  abstract readonly includeScreenshot: Signal<boolean>;

  /**
   * Mutates and persists the preferred setting for including screenshots.
   *
   * @param include Boolean toggle value.
   */
  abstract setIncludeScreenshot(include: boolean): void;

  /**
   * Mutates and saves the active renderer URL endpoint.
   * Enables runtime routing configurations for targeted iframe controllers.
   *
   * @param url The target destination URL endpoint to target.
   */
  abstract setRendererUrl(url: string): void;

  /**
   * Mutates and saves personal third party API key.
   * Secures public sandbox integrations by updating LLM handshake
   * authorization headers dynamically.
   *
   * @param key The fresh Gemini developer api key credential.
   */
  abstract setGeminiApiKey(key: string): Promise<void> | void;

  /**
   * Erases the Gemini developer API key credential from secure persistence
   * and resets our active reactive Signal to an empty string.
   */
  abstract purgeGeminiApiKey(): Promise<void> | void;

  /**
   * Overrides target authentication environments.
   * Dynamically pivots standard identity context scopes for diagnostic
   * or override targets.
   *
   * @param mode The forced authentication protocol mode.
   */
  abstract setForcedAuthMode(mode: AuthType): void;

  /**
   * Mutates and persists the preferred UI mode style theme.
   *
   * @param theme Preferred visual palette theme option.
   */
  abstract setThemePreference(theme: ThemePreference): void;

  /**
   * Purges dynamic runtime variables instantly.
   * Resets persistence layers and dynamic reactive channels to factory
   * base states.
   */
  abstract flushConfig(): Promise<void> | void;
}
