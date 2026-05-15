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

import {Component, inject, signal, DestroyRef} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {Subject} from 'rxjs';
import {debounceTime, filter, map} from 'rxjs/operators';
import {IS_EXTENSION_MODE} from '../../shell/environment-tokens';
import {HostCommunicationService} from '../../shell/host-communication.service';

const CAR_BOOKING = `
{"version": "v0.9", "createSurface": {"surfaceId": "car_booking_basic", "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json"}}
{"version": "v0.9", "updateComponents": {"surfaceId": "car_booking_basic", "components": [{"id": "root", "component": "Column", "children": ["title", "location_input", "pickup_input", "dropoff_input", "book_button"], "justify": "start", "align": "stretch"}, {"id": "title", "component": "Text", "text": "Book a Car", "variant": "h1"}, {"id": "location_input", "component": "TextField", "label": "Pick-up Location", "value": {"path": "/booking/location"}, "variant": "shortText"}, {"id": "pickup_input", "component": "DateTimeInput", "label": "Pick-up Date", "value": {"path": "/booking/pickupDate"}, "enableDate": true, "enableTime": false}, {"id": "dropoff_input", "component": "DateTimeInput", "label": "Drop-off Date", "value": {"path": "/booking/dropoffDate"}, "enableDate": true, "enableTime": false}, {"id": "book_button", "component": "Button", "child": "book_button_text", "variant": "primary", "action": {"event": {"name": "searchCars", "context": {"location": {"path": "/booking/location"}, "pickupDate": {"path": "/booking/pickupDate"}, "dropoffDate": {"path": "/booking/dropoffDate"}}}}}, {"id": "book_button_text", "component": "Text", "text": "Search Cars", "variant": "body"}]}}
{"version": "v0.9", "updateDataModel": {"surfaceId": "car_booking_basic", "path": "/booking", "value": {"location": "", "pickupDate": "", "dropoffDate": ""}}}
`;

@Component({
  selector: 'a2ui-composer-raw-frame',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './raw-frame.component.ng.html',
  styleUrl: './raw-frame.component.scss',
})
/**
 * Hosts the raw JSON view of active surface models, allowing direct source editing
 * and displaying real-time parsing error indicators.
 */
export class RawFrameComponent {
  readonly isExtensionMode = inject(IS_EXTENSION_MODE);
  readonly layoutJson = signal<string>(CAR_BOOKING);
  public readonly isJsonInvalid = signal<boolean>(false);

  private readonly hostCommunicationService = inject(HostCommunicationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly layoutInput$ = new Subject<string>();

  constructor() {
    this.layoutInput$
      .pipe(
        debounceTime(300),
        map((value: string): unknown[] | null => {
          try {
            const trimmed = value.trim();
            if (!trimmed) {
              this.isJsonInvalid.set(false);
              return [];
            }
            let payload: unknown[];
            if (trimmed.startsWith('[')) {
              payload = JSON.parse(trimmed);
            } else {
              const lines = trimmed
                .split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0);
              payload = lines.map(line => JSON.parse(line));
            }
            this.isJsonInvalid.set(false);
            return payload;
          } catch (err) {
            this.isJsonInvalid.set(true);
            return null;
          }
        }),
        filter((payload): payload is unknown[] => payload !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((payload: unknown[]) => {
        this.hostCommunicationService.sendRenderA2UI(payload);
      });
  }

  public onLayoutChange(value: string): void {
    this.layoutJson.set(value);
    this.layoutInput$.next(value);
  }
}
