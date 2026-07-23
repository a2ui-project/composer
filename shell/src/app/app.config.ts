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

import {
  ApplicationConfig,
  provideZonelessChangeDetection,
  provideAppInitializer,
  inject,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';
import {COPILOT_KIT_CONFIG} from '@copilotkit/angular';
import {routes} from './app.routes';
import {GeminiA2uiAgent} from './copilotkit/gemini-a2ui-agent/gemini-a2ui-agent';
import {StartupResolution} from './shell/startup-resolution/startup-resolution';
import {AppConfigProvider} from './settings/app-config-provider/app-config-provider';
import {LocalStorageAppConfigProvider} from './settings/local-storage-config-provider/local-storage-config.provider';
import {LlmClient} from './chat/llm-client/llm-client';
import {Standalone3pLlmClient} from './chat/llm-client/standalone-3p-llm-client';

/**
 * Application-wide Angular configuration defining core providers,
 * routing mechanisms, and initializers for the Composer shell.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimations(),
    // Register the in-browser AG-UI agent as the default CopilotKit agent.
    // provideCopilotKit only binds COPILOT_KIT_CONFIG as a value, so we bind it
    // via a factory to inject the DI-constructed GeminiA2uiAgent (no runtimeUrl —
    // the agent runs entirely client-side).
    {
      provide: COPILOT_KIT_CONFIG,
      useFactory: () => ({agents: {default: inject(GeminiA2uiAgent)}}),
    },
    provideAppInitializer(() => {
      const startupResolution = inject(StartupResolution);
      const configProvider = inject(AppConfigProvider);
      return startupResolution.resolveStartupConfiguration().then(() => {
        return configProvider.initialize();
      });
    }),
    {
      provide: AppConfigProvider,
      useExisting: LocalStorageAppConfigProvider,
    },
    {
      provide: LlmClient,
      useExisting: Standalone3pLlmClient,
    },
  ],
};
