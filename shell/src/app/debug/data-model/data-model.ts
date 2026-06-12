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

import {Component, inject, signal, computed, linkedSignal, effect, untracked} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged, filter} from 'rxjs/operators';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

/**
 * A debug drawer component presenting a reactive, nested JSON tree explorer
 * of the active surface's underlying state data model.
 */
@Component({
  selector: 'a2ui-composer-data-model',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './data-model.ng.html',
  styleUrl: './data-model.scss',
})
export class DataModel {
  private readonly hostComm = inject(HostCommunication);

  private lastSurfaceId = 'sample-surface';
  private lastPath: string | undefined = undefined;

  readonly latestModelValue = signal<unknown>(null);

  readonly dataModelJson = linkedSignal({
    source: this.latestModelValue,
    computation: (newModel: unknown): string => {
      if (newModel === null) return '';
      return typeof newModel === 'string' ? newModel : JSON.stringify(newModel, null, 2);
    },
  });

  readonly isJsonInvalid = computed(() => {
    const val = this.dataModelJson();
    if (!val) return false;
    try {
      JSON.parse(val);
      return false;
    } catch {
      return true;
    }
  });

  constructor() {
    effect(() => {
      const streamValue = this.hostComm.messageStream();
      if (streamValue?.type === PreviewBridgeMessageType.DATA_MODEL_CHANGE) {
        const payload = streamValue?.payload as Record<string, unknown>;
        const updateObj = payload?.['updateDataModel'] as Record<string, unknown>;
        if (updateObj) {
          if (typeof updateObj['surfaceId'] === 'string') {
            this.lastSurfaceId = updateObj['surfaceId'];
          }
          if (typeof updateObj['path'] === 'string') {
            this.lastPath = updateObj['path'];
          } else {
            this.lastPath = undefined;
          }

          const cleanValue = updateObj['value'];
          untracked(() => this.latestModelValue.set(cleanValue));
        }
      }
    });

    toObservable(this.dataModelJson)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((jsonStr: string) => {
          try {
            JSON.parse(jsonStr);
            return true;
          } catch {
            return false;
          }
        }),
      )
      .subscribe((validJsonStr: string) => {
        const parsed = JSON.parse(validJsonStr);
        const currentIncoming = this.latestModelValue();
        const incomingStr = currentIncoming ? JSON.stringify(currentIncoming) : '';
        const localStr = JSON.stringify(parsed);

        if (incomingStr !== localStr) {
          this.hostComm.sendMessage({
            type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
            payload: {
              updateDataModel: {
                surfaceId: this.lastSurfaceId,
                path: this.lastPath,
                value: parsed,
              },
            },
          });
        }
      });
  }
}
