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
import {
  mergeCatalogs,
  type ProtocolSupport,
  resolveProtocolSupport,
  selectDefaultCatalogs,
  selectDefaultPrimaryCatalog,
} from '../catalog-domain';
import type {CatalogManagement} from '../catalog-management';
import type {Catalog, CatalogJson} from '../../models/catalog-storage.model';

/**
 * Public signal contract representing the reactive state of CatalogManagement.
 * Exists to decouple test suites from production IndexedDB storage dependencies.
 */
export type FakeCatalogManagementState = Pick<
  CatalogManagement,
  | 'activeCatalogTitle'
  | 'activeCatalogDescription'
  | 'activeCatalog'
  | 'activeCatalogs'
  | 'announcedCatalogs'
  | 'activeProtocolVersion'
  | 'protocolSupport'
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
export type FakeCatalogManagementOverrides = Partial<{
  [K in keyof FakeCatalogManagementState]: FakeCatalogManagementState[K] extends Signal<infer T>
    ? Signal<T> | WritableSignal<T>
    : FakeCatalogManagementState[K];
}>;

/**
 * Test double implementation of CatalogManagement that simulates reactive catalog
 * discovery and handshake state with in-memory signals for isolated unit testing.
 */
export class FakeCatalogManagement implements FakeCatalogManagementState {
  readonly activeCatalogTitle: Signal<string>;
  readonly activeCatalogDescription: Signal<string>;
  readonly activeCatalog: Signal<Catalog | null>;
  readonly activeCatalogs: Signal<CatalogJson[]>;
  readonly announcedCatalogs: Signal<Catalog[]>;
  readonly activeProtocolVersion: Signal<A2uiProtocolVersion>;
  readonly protocolSupport: Signal<ProtocolSupport>;
  readonly mergedActiveCatalog: Signal<Catalog | null>;
  readonly catalogError: Signal<string | null>;
  readonly isHandshakeInProgress: Signal<boolean>;
  readonly watchdogFired: Signal<boolean>;
  readonly lastCatalogString: Signal<string>;
  readonly lastChecksumHash: Signal<string>;
  readonly catalogHashDelta: Signal<boolean>;
  readonly hasReceivedCatalogResponse: Signal<boolean>;
  readonly handshakeState: Signal<'idle' | 'in-progress' | 'settled'>;

  constructor(overrides?: FakeCatalogManagementOverrides) {
    const rawPrimary = overrides?.activeCatalog ?? signal<Catalog | null>(null);
    const rawCatalogs =
      overrides?.announcedCatalogs ?? overrides?.activeCatalogs ?? signal<CatalogJson[]>([]);
    this.announcedCatalogs = computed(() => {
      const list = rawCatalogs();
      if (list.length > 0) {
        return list;
      }
      const primary = rawPrimary();
      return primary ? [primary] : [];
    });
    this.catalogError = overrides?.catalogError ?? signal<string | null>(null);
    this.isHandshakeInProgress = overrides?.isHandshakeInProgress ?? signal(false);
    this.watchdogFired = overrides?.watchdogFired ?? signal(false);
    this.lastCatalogString = overrides?.lastCatalogString ?? signal('');
    this.lastChecksumHash = overrides?.lastChecksumHash ?? signal('');
    this.catalogHashDelta = overrides?.catalogHashDelta ?? signal(false);
    this.hasReceivedCatalogResponse = overrides?.hasReceivedCatalogResponse ?? signal(true);
    this.protocolSupport =
      overrides?.protocolSupport ??
      computed<ProtocolSupport>(() => {
        const base = resolveProtocolSupport(
          this.hasReceivedCatalogResponse(),
          this.announcedCatalogs(),
          this.catalogError() !== null,
          rawPrimary(),
        );
        if (!overrides?.activeProtocolVersion) {
          return base;
        }
        const forcedDefault = overrides.activeProtocolVersion();
        if (forcedDefault === base.defaultVersion) {
          return base;
        }
        const unversionedOnly = this.announcedCatalogs().every(c => !c.protocolVersion);
        if (unversionedOnly && this.announcedCatalogs().length > 0) {
          return {
            ...base,
            defaultVersion: forcedDefault,
            versions: [forcedDefault],
            catalogsByVersion: {[forcedDefault]: [...this.announcedCatalogs()]},
          };
        }
        const otherVersion = base.versions.find(
          v => v !== forcedDefault && (base.catalogsByVersion[v]?.length ?? 0) > 0,
        );
        const versions: A2uiProtocolVersion[] = otherVersion
          ? [forcedDefault, otherVersion]
          : [forcedDefault];
        return {
          ...base,
          defaultVersion: forcedDefault,
          versions,
        };
      });
    this.activeProtocolVersion =
      overrides?.activeProtocolVersion ?? computed(() => this.protocolSupport().defaultVersion);
    this.activeCatalogs = computed(() =>
      selectDefaultCatalogs(this.announcedCatalogs(), this.protocolSupport()),
    );
    this.activeCatalog = computed(() =>
      selectDefaultPrimaryCatalog(
        rawPrimary(),
        this.activeCatalogs(),
        this.protocolSupport().defaultVersion,
      ),
    );
    this.activeCatalogTitle =
      overrides?.activeCatalogTitle ?? computed(() => this.activeCatalog()?.title || '');
    this.activeCatalogDescription =
      overrides?.activeCatalogDescription ??
      computed(() => this.activeCatalog()?.description || '');
    this.mergedActiveCatalog =
      overrides?.mergedActiveCatalog ??
      computed(() => mergeCatalogs(this.activeCatalog(), this.activeCatalogs()));
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
 * @returns Fully populated FakeCatalogManagement test double instance.
 */
export function createFakeCatalogManagement(
  overrides?: FakeCatalogManagementOverrides,
): FakeCatalogManagementState {
  return new FakeCatalogManagement(overrides);
}
