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

import {ComposerPanelId, OpenPanelEvent} from '../../shell/composer-workspace/composer-panel-id';
import {
  Component,
  inject,
  signal,
  DestroyRef,
  effect,
  untracked,
  WritableSignal,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subject} from 'rxjs';
import {debounceTime, filter, map} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {IS_EXTENSION_MODE} from '../../shell/environment-tokens/environment-tokens';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {StateSync} from '../../chat/state-sync/state-sync';
import {ChatState} from '../../chat/chat-state/chat-state';
import {MonacoEditor} from '../../shared/monaco-editor/monaco-editor';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {UsageTrackingService} from '../../usage-tracking/usage-tracking.service';
import {tryParseJsonArray} from '../../utils/json';
import {ErrorLogger} from '../../debug/error-logger.service';
import type {editor} from 'monaco-editor';

/**
 * Hosts the raw JSON view of active surface models, allowing direct source editing
 * and displaying real-time parsing error indicators.
 */
@Component({
  selector: 'a2ui-composer-raw-frame',
  standalone: true,
  imports: [MonacoEditor],
  templateUrl: './raw-frame.ng.html',
  styleUrl: './raw-frame.scss',
})
export class RawFrame {
  protected readonly isExtensionMode = inject(IS_EXTENSION_MODE);
  /** The current JSON layout representation reflecting the active draft. */
  protected readonly layoutJson: WritableSignal<string>;
  /** Tracks if the current layout string fails to parse. */
  protected readonly isJsonInvalid: WritableSignal<boolean> = signal(false);

  readonly TEST_ONLY = {
    layoutJson: () => this.layoutJson,
    notifySchemaErrors: (markers: editor.IMarker[]) => this.notifySchemaErrors(markers),
    startWatchdog: () => this.startWatchdog(),
    clearWatchdog: () => this.clearWatchdog(),
  };

  private readonly hostCommunication = inject(HostCommunication);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly stateSync = inject(StateSync);
  private readonly chatState = inject(ChatState);
  private readonly usageTrackingService = inject(UsageTrackingService);
  private readonly errorLogger = inject(ErrorLogger);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly layoutInput$ = new Subject<string>();
  private isDestroyed = false;

  private readonly WATCHDOG_TIMEOUT_MS = 15000;
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null;
  private lastErrorSignature: string | null = null;
  private readonly markerSubject = new Subject<editor.IMarker[]>();

  /** Public lock indicator preventing typing deadlocks during generative LLM stream turns. */
  protected readonly isLocked = this.chatState.isProgrammaticStreamActive;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
      this.clearWatchdog();
    });

    this.markerSubject
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe(markers => {
        this.notifySchemaErrors(markers);
      });

    this.hostCommunication.messageStream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(envelope => {
        if (
          envelope?.type === PreviewBridgeMessageType.RENDER_SUCCESS ||
          envelope?.type === PreviewBridgeMessageType.RENDER_ERROR ||
          envelope?.type === PreviewBridgeMessageType.RENDERER_READY
        ) {
          this.startWatchdog();
        }
      });

    // Initialize backing editor layout state Signal dynamically from the volatile session cache
    this.layoutJson = signal(this.stateSync.hydrateActiveDraft());
    effect(() => {
      const catalog = this.catalogManagement.activeCatalog();
      if (catalog) {
        const currentLayout = untracked(() => this.layoutJson());
        try {
          const payload = this.parseLayoutString(currentLayout);
          if (payload !== null) {
            this.hostCommunication.sendRenderA2UI(payload);
          }
        } catch (err) {
          // Ignore initial parse errors
        }
      }
    });

    this.hostCommunication.messageStream$
      .pipe(
        filter(
          envelope =>
            envelope?.type === PreviewBridgeMessageType.RENDERER_READY ||
            envelope?.type === PreviewBridgeMessageType.A2UI_CATALOG,
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        try {
          const payload = this.parseLayoutString(this.layoutJson());
          if (payload !== null) {
            this.hostCommunication.sendRenderA2UI(payload);
          }
        } catch (err) {
          if (err instanceof SyntaxError) {
            console.warn(`Syntax error in JSON:`, err);
          } else {
            console.error('Unexpected error sending A2UI to renderer:', err);
          }
        }
      });

    // Sync back changes in StateSync activeDraft to editor layoutJson (e.g. from LLM stream completed updates)
    effect(() => {
      const activeDraftVal = this.stateSync.activeDraft();
      untracked(() => {
        if (this.layoutJson() !== activeDraftVal) {
          queueMicrotask(() => {
            if (this.isDestroyed) {
              return;
            }
            this.layoutJson.set(activeDraftVal);

            // Run live render updating matching activeDraft commits
            try {
              const payload = this.parseLayoutString(activeDraftVal);
              if (payload !== null) {
                this.hostCommunication.sendRenderA2UI(payload);
                this.startWatchdog();
              } else {
                this.showJsonSyntaxError();
              }
            } catch (err) {
              this.showJsonSyntaxError();
            }
          });
        }
      });
    });

    this.layoutInput$
      .pipe(
        debounceTime(300),
        map((value: string): unknown[] | null => {
          try {
            const payload = this.parseLayoutString(value);
            if (payload !== null) {
              this.snackBar.dismiss();
              this.usageTrackingService.trackJsonEditorEdit({isValidJson: true});
              return payload;
            }
            this.showJsonSyntaxError();
            this.usageTrackingService.trackJsonEditorEdit({isValidJson: false});
            return null;
          } catch (err) {
            this.showJsonSyntaxError();
            this.usageTrackingService.trackJsonEditorEdit({isValidJson: false});
            return null;
          }
        }),
        filter((payload): payload is unknown[] => payload !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((payload: unknown[]) => {
        this.hostCommunication.sendRenderA2UI(payload);
        this.startWatchdog();
      });
  }

  protected onLayoutChange(value: string): void {
    this.layoutJson.set(value);
    this.layoutInput$.next(value);
    this.stateSync.updateDraft(value);
  }

  protected onMarkersChange(markers: editor.IMarker[]): void {
    this.markerSubject.next(markers);
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private startWatchdog(): void {
    this.clearWatchdog();
    if (
      this.chatState.isProgrammaticStreamActive() ||
      (typeof document !== 'undefined' && document.hidden)
    ) {
      return;
    }

    this.watchdogTimer = setTimeout(() => {
      if (!this.hostCommunication.isRendererReady()) {
        this.errorLogger.error({
          sourceTag: '[Previewer]',
          message: 'Preview frame did not respond within 15 seconds.',
          level: 'warn',
        });
      }
    }, this.WATCHDOG_TIMEOUT_MS);
  }

  private notifySchemaErrors(markers: editor.IMarker[]): void {
    const errorMarkers = markers.filter(m => m.severity === 8);
    if (errorMarkers.length === 0) {
      this.lastErrorSignature = null;
      return;
    }
    const currentSignature = errorMarkers
      .map(m => m.message)
      .sort()
      .join('|');
    if (this.lastErrorSignature === currentSignature) return;
    this.lastErrorSignature = currentSignature;

    const message =
      errorMarkers.length === 1
        ? `Schema error: ${errorMarkers[0].message}`
        : `Found ${errorMarkers.length} schema errors in JSON.`;

    this.snackBar
      .open(message, 'View in Errors Tab', {
        duration: 5000,
        panelClass: 'schema-error-snackbar',
      })
      .onAction()
      .subscribe(() => {
        window.dispatchEvent(new OpenPanelEvent(ComposerPanelId.Errors));
      });
  }

  /**
   * Parses the raw layout configuration string into an array of message objects.
   *
   * It expects a standard JSON structure (either an array of message objects or a
   * single message object). If it's a single message object, it wraps it in an array.
   *
   * If parsing fails, it throws a SyntaxError (which callers are expected to catch).
   *
   * @param value The raw layout string to parse.
   * @return An array of parsed JSON objects (or empty array if input is empty).
   */
  private parseLayoutString(value: string): unknown[] | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    const parsed = tryParseJsonArray(trimmed);
    if (parsed.success) {
      return parsed.data;
    }
    const err = new SyntaxError(parsed.error.message);
    Object.assign(err, parsed.error);
    throw err;
  }

  private showJsonSyntaxError(): void {
    if (this.isLocked()) {
      return;
    }
    this.snackBar.open('Invalid JSON syntax detected.', undefined, {
      duration: 5000,
    });
  }
}
