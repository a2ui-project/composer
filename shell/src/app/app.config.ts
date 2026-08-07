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
import {provideRouter, Router, NavigationEnd} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';
import {filter} from 'rxjs/operators';
import {routes} from './app.routes';
import {StartupResolution} from './shell/startup-resolution/startup-resolution';
import {AppConfigProvider} from './settings/app-config-provider/app-config-provider';
import {LocalStorageAppConfigProvider} from './settings/local-storage-config-provider/local-storage-config.provider';
import {LlmClient} from './chat/llm-client/llm-client';
import {Standalone3pLlmClient} from './chat/llm-client/standalone-3p-llm-client';
import {USAGE_TRACKING_CONFIG, UsageTrackingService} from './usage-tracking/usage-tracking.service';
import {Ga4UsageTrackingService} from './usage-tracking/ga4-usage-tracking.service';
import {NoopUsageTrackingService} from './usage-tracking/noop-usage-tracking.service';

/**
 * Application-wide Angular configuration defining core providers,
 * routing mechanisms, and initializers for the Composer shell.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimations(),
    provideAppInitializer(() => {
      const startupResolution = inject(StartupResolution);
      const configProvider = inject(AppConfigProvider);
      const usageTrackingService = inject(UsageTrackingService);
      const router = inject(Router);

      router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(event => {
          usageTrackingService.trackPageView({pagePath: event.urlAfterRedirects});
        });

      return startupResolution
        .resolveStartupConfiguration()
        .then(() => configProvider.initialize())
        .then(() => usageTrackingService.initialize());
    }),
    {
      provide: AppConfigProvider,
      useExisting: LocalStorageAppConfigProvider,
    },
    {
      provide: LlmClient,
      useExisting: Standalone3pLlmClient,
    },
    {
      provide: UsageTrackingService,
      useFactory: () => {
        const config = inject(USAGE_TRACKING_CONFIG);
        if (config.enabled && config.measurementId) {
          return inject(Ga4UsageTrackingService);
        }
        return inject(NoopUsageTrackingService);
      },
    },
  ],
};
