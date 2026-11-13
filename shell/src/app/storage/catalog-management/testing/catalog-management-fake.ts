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

import {computed, Signal, signal, WritableSignal} from '@angular/core';
import type {A2uiProtocolVersion} from 'a2ui-bridge';
import type {CatalogManagement} from '../catalog-management';
import type {Catalog, CatalogJson} from '../../models/catalog-storage.model';

/**
 * Public signal contract representing the reactive state of CatalogManagement.
 * Exists to decouple test suites from production IndexedDB storage dependencies.
 */
export type MockCatalogManagement = Pick<
  CatalogManagement,
  | 'activeCatalogTitle'
  | 'activeCatalogDescription'
  | 'activeCatalog'
  | 'activeCatalogs'
  | 'activeProtocolVersion'
  | 'mergedActiveCatalog'
  | 'catalogError'
  | 'isHandshakeInProgress'
  | 'watchdogFired'
  | 'lastCatalogString'
  | 'lastChecksumHash'
  | 'catalogHashDelta'
  | 'hasReceivedCatalogResponse'
  | 'handshakeState'
>;

/**
 * Overrides allowing test suites to supply custom signals or writable signals
 * for specific CatalogManagement reactive state properties.
 */
export type MockCatalogManagementOverrides = Partial<{
  [K in keyof MockCatalogManagement]: MockCatalogManagement[K] extends Signal<infer T>
    ? Signal<T> | WritableSignal<T>
    : MockCatalogManagement[K];
}>;

/**
 * Test double implementation of CatalogManagement that simulates reactive catalog
 * discovery and handshake state with in-memory signals for isolated unit testing.
 */
export class FakeCatalogManagement implements MockCatalogManagement {
  readonly activeCatalogTitle: Signal<string>;
  readonly activeCatalogDescription: Signal<string>;
  readonly activeCatalog: Signal<Catalog | null>;
  readonly activeCatalogs: Signal<CatalogJson[]>;
  readonly activeProtocolVersion: Signal<A2uiProtocolVersion>;
  readonly mergedActiveCatalog: Signal<Catalog | null>;
  readonly catalogError: Signal<string | null>;
  readonly isHandshakeInProgress: Signal<boolean>;
  readonly watchdogFired: Signal<boolean>;
  readonly lastCatalogString: Signal<string>;
  readonly lastChecksumHash: Signal<string>;
  readonly catalogHashDelta: Signal<boolean>;
  readonly hasReceivedCatalogResponse: Signal<boolean>;
  readonly handshakeState: Signal<'idle' | 'in-progress' | 'settled'>;

  constructor(overrides?: MockCatalogManagementOverrides) {
    this.activeCatalog = overrides?.activeCatalog ?? signal<Catalog | null>(null);
    this.activeCatalogs = overrides?.activeCatalogs ?? signal<CatalogJson[]>([]);
    this.activeCatalogTitle =
      overrides?.activeCatalogTitle ?? computed(() => this.activeCatalog()?.title || '');
    this.activeCatalogDescription =
      overrides?.activeCatalogDescription ??
      computed(() => this.activeCatalog()?.description || '');
    this.mergedActiveCatalog =
      overrides?.mergedActiveCatalog ??
      computed(() => this.activeCatalog() ?? this.activeCatalogs()[0] ?? null);
    this.activeProtocolVersion =
      overrides?.activeProtocolVersion ?? signal<A2uiProtocolVersion>('v0.9');
    this.catalogError = overrides?.catalogError ?? signal<string | null>(null);
    this.isHandshakeInProgress = overrides?.isHandshakeInProgress ?? signal(false);
    this.watchdogFired = overrides?.watchdogFired ?? signal(false);
    this.lastCatalogString = overrides?.lastCatalogString ?? signal('');
    this.lastChecksumHash = overrides?.lastChecksumHash ?? signal('');
    this.catalogHashDelta = overrides?.catalogHashDelta ?? signal(false);
    this.hasReceivedCatalogResponse = overrides?.hasReceivedCatalogResponse ?? signal(true);
    this.handshakeState =
      overrides?.handshakeState ?? signal<'idle' | 'in-progress' | 'settled'>('settled');
  }
}

/**
 * Factory function creating a test double conforming to CatalogManagement signals.
 * Defaults `hasReceivedCatalogResponse` to `signal(true)` matching the expectations
 * of consumer test harnesses.
 *
 * @param overrides Optional partial signals to override default test state.
 * @returns Fully populated MockCatalogManagement test double instance.
 */
export function createMockCatalogManagement(
  overrides?: MockCatalogManagementOverrides,
): MockCatalogManagement {
  return new FakeCatalogManagement(overrides);
}
