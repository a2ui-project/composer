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

import {TrackEventDirective} from '../usage-tracking/track-event.directive';
import {
  Component,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
  viewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Clipboard} from '@angular/cdk/clipboard';
import {filter} from 'rxjs/operators';
import {JsonPipe, NgTemplateOutlet} from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CategorizedComponents, GalleryCatalog} from './services/gallery-catalog';
import {CatalogManagement} from '../storage/catalog-management/catalog-management';
import {RenderedFrame} from '../preview/rendered/rendered-frame';
import {DefaultTarget, HostCommunication} from '../shell/host-communication/host-communication';
import {formatJson} from '../utils/json';
import {PreviewBridgeMessageType, ComponentUsage} from 'a2ui-bridge';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {StartupConfigStateService} from '../shell/startup-resolution/state/startup-config-state.service';
import {stableStringify} from '../storage/stable-stringify/stable-stringify';
import {Catalog, getCatalogId} from '../storage/models/catalog-storage.model';
import {ParsedProperty} from './schema/catalog-schema-resolver';
import {parseGalleryExample} from './gallery-example';
import {ErrorLogger, TaggedLogger} from '../debug/error-logger.service';
import {GalleryLauncher} from './gallery-launcher';
import {UsageTrackingService} from '../usage-tracking/usage-tracking.service';
import {MonacoEditor} from '../shared/monaco-editor/monaco-editor';
import {validatePayloadProtocolVersion} from '../preview/protocol-version-mismatch';
import {PropertyEditor} from '../shared/property-editor/property-editor';

interface ExampleDraft {
  text: string;
  preset: ComponentUsage | null;
  payload: unknown[] | null;
  error: string | null;
}

/**
 * Displays a split visual catalog gallery enabling search, interactive component selection,
 * schema properties introspection, live preview placeholders, and usage clipboard exports.
 */
@Component({
  selector: 'a2ui-composer-gallery',
  standalone: true,
  imports: [
    TrackEventDirective,
    JsonPipe,
    NgTemplateOutlet,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MonacoEditor,
    PropertyEditor,
    RenderedFrame,
  ],
  templateUrl: './gallery.ng.html',
  styleUrl: './gallery.scss',
})
export class Gallery implements OnInit, OnDestroy {
  protected readonly DefaultTarget = DefaultTarget;
  private readonly catalogService = inject(GalleryCatalog);
  protected readonly catalogManagement = inject(CatalogManagement);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly usageTrackingService = inject(UsageTrackingService);
  private readonly clipboard = inject(Clipboard);
  private readonly startupResolution = inject(StartupResolution);
  private readonly startupConfigState = inject(StartupConfigStateService);
  private readonly launcher = inject(GalleryLauncher);
  private readonly errorLogger = inject(ErrorLogger);
  private readonly logger: TaggedLogger = this.errorLogger.withTag('[Gallery]');
  private readonly propertyEditor = viewChild(PropertyEditor);
  protected readonly opening = signal(false);
  protected readonly actionMessage = signal('');
  protected readonly activePlaygroundTab = signal<'preview' | 'json'>('preview');
  protected readonly rendererUrl: Signal<string | null> = this.startupResolution.resolvedUrl;
  readonly renderedFrame = viewChild(RenderedFrame);

  protected readonly galleryStrategy = this.catalogService.galleryStrategy;

  protected selectPlaygroundTab(tab: 'preview' | 'json'): void {
    this.activePlaygroundTab.set(tab);
  }

  /**
   * Memoized stringified catalog identity so switching components doesn't re-serialize the catalog.
   */
  private readonly catalogSignature: Signal<string | null> = computed(() => {
    const catalog =
      this.catalogManagement.mergedActiveCatalog() ?? this.catalogManagement.activeCatalog();
    return catalog ? stableStringify(catalog) : null;
  });

  /**
   * Identifies the current component context (rendererUrl, rendererId, catalog, componentKey)
   * and its initial preset/example JSON for `draft`.
   */
  protected readonly draftSource: Signal<{
    identity: string;
    catalog: Catalog | null;
    preset: ComponentUsage | null;
  }> = computed(() => {
    const catalog =
      this.catalogManagement.mergedActiveCatalog() ?? this.catalogManagement.activeCatalog();
    return {
      identity: JSON.stringify([
        this.rendererUrl(),
        this.startupConfigState.selectedRendererId(),
        this.catalogSignature(),
        this.catalogService.selectedComponentKey(),
      ]),
      catalog,
      preset: this.catalogService.selectedComponentPreset(),
    };
  });

  /**
   * `draft` owns the local example draft without propagating component state through effects.
   * Once initialized, repeat usages/ready messages cannot overwrite an edit.
   */
  protected readonly draft: WritableSignal<ExampleDraft> = linkedSignal({
    source: this.draftSource,
    computation: (source, previous): ExampleDraft => {
      if (previous?.source.identity === source.identity && previous.value.preset) {
        return previous.value;
      }
      return this.createDraft(source.preset, source.catalog);
    },
  });

  private readonly validPayload: Signal<unknown[] | null> = computed(() => this.draft().payload);
  protected readonly validPayloadJson: Signal<string> = computed(() => {
    const payload = this.validPayload();
    return payload ? formatJson(payload) : '';
  });

  /**
   * Property Editor form reads and writes to. Prioritize 'target'
   * or 'root' nodes when it matches the selected component type so
   * child nodes of the same type don't shadow it
   */
  protected readonly editableComponent: Signal<Record<string, unknown> | undefined> = computed(
    () => {
      const key = this.catalogService.selectedComponentKey();
      const usage = this.draft().preset?.usage;

      if (!usage || !key) {
        return undefined;
      }

      return (
        usage.find(
          component =>
            component['component'] === key &&
            (component['id'] === 'target' || component['id'] === 'root'),
        ) ?? usage.find(component => component['component'] === key)
      );
    },
  );

  private createDraft(preset: ComponentUsage | null, catalog: Catalog | null): ExampleDraft {
    const prov = this.catalogService.selectedComponentProvenance();
    const effectiveCatalog = prov?.catalog ?? catalog;
    const id = prov?.catalogId || (effectiveCatalog && getCatalogId(effectiveCatalog));
    if (!preset || !Array.isArray(preset.usage) || !effectiveCatalog || !id) {
      return {text: '', preset: null, payload: null, error: null};
    }
    try {
      const copy = structuredClone(preset);
      return {
        text: formatJson({
          ['components']: copy.usage,
          ...(copy.data !== undefined ? {['data']: copy.data} : {}),
        }),
        preset: copy,
        payload: this.buildA2UIPayload(copy, id),
        error: null,
      };
    } catch (error) {
      this.logger.error('Failed to load component example:', error);
      return {
        text: '',
        preset: null,
        payload: null,
        error: 'Could not load this component example.',
      };
    }
  }

  /**
   * Retains every edit; preview and actions keep the last valid example when parsing fails.
   */
  protected editDraft(text: string, propertyEdit = false): string | null {
    const prov = this.catalogService.selectedComponentProvenance();
    const catalog =
      this.catalogManagement.mergedActiveCatalog() ??
      prov?.catalog ??
      this.catalogManagement.activeCatalog();
    const id = prov?.catalogId || this.catalogId();
    if (!catalog || !id) {
      return null;
    }
    this.actionMessage.set('');
    try {
      const preset = parseGalleryExample(text, catalog, this.errorLogger);

      if (!propertyEdit) {
        this.propertyEditor()?.clearErrors();
      }

      this.draft.set({
        text,
        preset,
        payload: this.buildA2UIPayload(preset, id),
        error: null,
      });
      return null;
    } catch (error) {
      const reason =
        error instanceof SyntaxError
          ? 'Invalid JSON.'
          : error instanceof Error
            ? error.message
            : 'Invalid example.';
      if (propertyEdit) {
        this.actionMessage.set(`${reason} Preview keeps its previous value.`);
        return reason;
      }
      this.draft.update(draft => ({
        ...draft,
        text,
        error: `${reason} Preview and actions use the last valid example.`,
      }));
      return `${reason} Preview and actions use the last valid example.`;
    }
  }

  /**
   * Sets one property on the selected component, or removes it when value is undefined.
   */
  protected editProperty(name: string, value: unknown): string | null {
    const preset = this.draft().preset;
    const target = this.editableComponent();
    if (!preset || !target || this.draft().error) {
      return null;
    }
    const components = preset.usage.map(component => {
      if (component !== target) {
        return component;
      }
      if (value !== undefined) {
        return {...component, [name]: value};
      }
      const {[name]: _removed, ...rest} = component;
      return rest;
    });
    return this.editDraft(
      formatJson({
        ['components']: components,
        ...(preset.data !== undefined ? {['data']: preset.data} : {}),
      }),
      true,
    );
  }

  protected resetDraft(): void {
    this.actionMessage.set('');
    this.propertyEditor()?.clearErrors();
    const prov = this.catalogService.selectedComponentProvenance();
    const catalog =
      this.catalogManagement.mergedActiveCatalog() ??
      prov?.catalog ??
      this.catalogManagement.activeCatalog();
    this.draft.set(this.createDraft(this.catalogService.selectedComponentPreset(), catalog));
  }

  protected async openInComposer(): Promise<void> {
    const payload = this.validPayloadJson();
    const renderer = this.rendererUrl();
    if (!payload || !renderer || this.opening()) {
      return;
    }
    this.opening.set(true);
    this.actionMessage.set('');
    try {
      await this.launcher.open(payload, renderer, this.startupConfigState.selectedRendererId());
    } catch (error) {
      this.actionMessage.set(
        error instanceof Error ? error.message : 'Could not open this example.',
      );
    } finally {
      this.opening.set(false);
    }
  }

  constructor() {
    this.hostCommunication.messageStream$
      .pipe(
        filter(envelope => envelope?.type === PreviewBridgeMessageType.RENDERER_READY),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.dispatchSelectedComponentPayload();
      });

    effect(() => {
      this.catalogManagement.hasReceivedCatalogResponse();
      this.catalogManagement.activeProtocolVersion();
      this.validPayload();
      untracked(() => {
        this.dispatchSelectedComponentPayload();
      });
    });
  }

  /**
   * Constructs the A2UI layout and data model command payload using the active protocol strategy.
   */
  private buildA2UIPayload(preset: ComponentUsage, catalogId: string): unknown[] {
    return this.galleryStrategy().buildPreviewPayload(preset, catalogId);
  }

  private dispatchSelectedComponentPayload(): void {
    const payload = this.validPayload();
    if (!payload) {
      return;
    }

    if (!this.catalogManagement.hasReceivedCatalogResponse()) {
      // Defer render until catalog discovery handshake settles
      return;
    }

    const activeVersion = this.catalogManagement.activeProtocolVersion();

    const validation = validatePayloadProtocolVersion(payload, activeVersion);
    if (!validation.valid) {
      this.errorLogger.error({
        sourceTag: '[Gallery]',
        code: 'PROTOCOL_VERSION_MISMATCH',
        message: validation.message,
      });
      return;
    }

    try {
      this.hostCommunication.sendRenderA2UI(payload);
    } catch (error) {
      this.actionMessage.set('Could not update the preview. Select the component again to retry.');
      this.logger.error('Failed to dispatch component example:', error);
    }
  }

  ngOnInit(): void {
    this.catalogService.setGalleryActive(true);
    this.usageTrackingService.trackGalleryView();
  }

  ngOnDestroy(): void {
    this.catalogService.setGalleryActive(false);
  }

  /**
   * Whether usage samples are currently loading from the bridge.
   */
  protected readonly loadingUsages: Signal<boolean> = this.catalogService.loadingUsages;

  /**
   * The alphabetized component list categorized by Layout, Content, Input, Feedback, Other.
   */
  protected readonly componentsList: Signal<CategorizedComponents[]> =
    this.catalogService.componentsList;

  /**
   * The key of the currently selected component.
   */
  protected readonly selectedComponentKey: Signal<string | null> =
    this.catalogService.selectedComponentKey;

  /**
   * The parsed property specifications for the selected component.
   */
  protected readonly selectedComponentProperties: Signal<ParsedProperty[]> =
    this.catalogService.selectedComponentProperties;

  /**
   * The formatted JSON usage snippet containing the component array.
   */
  protected readonly selectedComponentUsage: Signal<string> =
    this.catalogService.selectedComponentUsage;

  protected readonly catalogId: Signal<string | null> = computed(() => {
    const prov = this.catalogService.selectedComponentProvenance();
    if (prov?.catalogId) {
      return prov.catalogId;
    }
    const catalog = this.catalogManagement.activeCatalog();
    if (!catalog) {
      return null;
    }
    return getCatalogId(catalog) || null;
  });

  /**
   * The table column names mapped by MatTable.
   */
  protected readonly displayedColumns: string[] = [
    'name',
    'description',
    'type',
    'required',
    'defaultValue',
  ];

  /**
   * The resolved schema description for the selected component.
   */
  protected readonly selectedComponentDescription: Signal<string> = computed(() => {
    const key = this.selectedComponentKey();
    const prov = this.catalogService.selectedComponentProvenance();
    const catalog =
      this.catalogManagement.mergedActiveCatalog() ??
      prov?.catalog ??
      this.catalogManagement.activeCatalog();
    const comp =
      key && catalog && catalog.components
        ? (catalog.components as Record<string, Record<string, unknown>>)[key]
        : null;
    return comp && typeof comp['description'] === 'string' ? (comp['description'] as string) : '';
  });

  /**
   * Sets the selected component key.
   *
   * @param key The component key or null to deselect.
   */
  protected selectComponent(key: string | null): void {
    this.catalogService.selectComponent(key);
  }

  /**
   * Copies formatted A2UI JSON payload commands to the user's clipboard.
   */
  protected copyToClipboard(): void {
    const payload = this.validPayloadJson();
    if (!payload) {
      return;
    }
    try {
      if (this.clipboard.copy(payload)) {
        this.actionMessage.set('Copied the last valid example JSON.');
        this.usageTrackingService.trackGalleryCopyUsage({
          componentKey: this.selectedComponentKey() || '',
        });
      } else {
        this.actionMessage.set('Could not copy JSON. Try again.');
        this.logger.error('Failed to copy A2UI component usage to clipboard.');
      }
    } catch (error) {
      this.actionMessage.set('Could not copy JSON. Try again.');
      this.logger.error('Failed to parse or format A2UI usage payload: ', error);
    }
  }
}
