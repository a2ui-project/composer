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

import {Directive, HostListener, input, inject} from '@angular/core';
import {UsageTrackingService} from './usage-tracking.service';

/**
 * Directive to track events using the generic UsageTrackingService.
 */
@Directive({
  selector: '[a2uiComposerTrackEvent]',
  standalone: true,
})
export class TrackEventDirective {
  private readonly trackingService = inject(UsageTrackingService);

  /** The name of the event to track on UsageTrackingService. */
  readonly a2uiComposerTrackEvent = input.required<keyof UsageTrackingService>();

  /**
   * Parameters to pass to the tracking event function.
   * Note: This reflects the pre-click state (evaluated at the prior CD pass).
   */
  readonly a2uiComposerTrackParams = input<unknown>();

  /** Listens to click events and fires analytics */
  @HostListener('click')
  protected onClick(): void {
    const eventName = this.a2uiComposerTrackEvent();
    const eventParams = this.a2uiComposerTrackParams();
    if (eventName && typeof this.trackingService[eventName] === 'function') {
      (this.trackingService[eventName] as (...args: unknown[]) => void)(eventParams);
    }
  }
}
