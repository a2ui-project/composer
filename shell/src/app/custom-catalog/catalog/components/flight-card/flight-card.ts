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

import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CatalogComponent, A2uiRendererService} from '@a2ui/angular/v0_9';
import {DataContext, type Action} from '@a2ui/web_core/v0_9';
import {FlightCardApi} from '../../apis';

/**
 * Map `status` text → a visual dot colour. Bypassed when the agent sets an
 * explicit `statusColor`.
 */
const STATUS_COLORS: Record<string, string> = {
  'On Time': 'var(--cpk-success)',
  Delayed: 'var(--cpk-warning)',
  Cancelled: 'var(--cpk-critical)',
};

/**
 * `FlightCard` renderer — the showcase card. Every string prop is a
 * `DynString` the binder has already resolved (literal or scoped path
 * binding), so we render values directly. The "Select" CTA resolves and
 * dispatches the `book_flight` action, then latches to "Selected".
 */
@Component({
  selector: 'a2ui-composer-cc-flight-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cc-flight">
      <div class="cc-flight__head">
        <div class="cc-flight__airline">
          @if (airlineLogo()) {
            <img
              class="cc-flight__logo"
              [src]="airlineLogo()"
              [alt]="airline()"
              (error)="onLogoError($event)"
            />
          }
          <span class="cc-flight__airline-name">{{ airline() }}</span>
        </div>
        <span class="cc-flight__price">{{ price() }}</span>
      </div>

      <div class="cc-flight__meta">
        <span>{{ flightNumber() }}</span>
        <span>{{ date() }}</span>
      </div>

      <hr class="cc-flight__rule" />

      <div class="cc-flight__times">
        <span class="cc-flight__time">{{ departureTime() }}</span>
        <span class="cc-flight__duration">{{ duration() }}</span>
        <span class="cc-flight__time">{{ arrivalTime() }}</span>
      </div>

      <div class="cc-flight__route">
        <span>{{ origin() }}</span>
        <span class="cc-flight__arrow">→</span>
        <span>{{ destination() }}</span>
      </div>

      <div class="cc-flight__foot">
        <hr class="cc-flight__rule" />
        <div class="cc-flight__status">
          <span class="cc-flight__dot" [style.background]="dotColor()"></span>
          <span class="cc-flight__status-text">{{ status() }}</span>
        </div>
        <button
          type="button"
          class="cc-flight__cta"
          [class.cc-flight__cta--done]="done()"
          [disabled]="done()"
          (click)="handleAction()"
        >
          {{ done() ? 'Selected' : 'Select' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .cc-flight {
        border: 1px solid var(--cpk-border);
        border-radius: var(--cpk-radius-lg);
        padding: 20px;
        background: var(--cpk-surface-elevated);
        color: var(--cpk-text-primary);
        min-width: 260px;
        max-width: 340px;
        flex: 1 1 260px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: var(--cpk-shadow-card);
        font-family: var(--cpk-font-body);
      }
      .cc-flight__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .cc-flight__airline {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cc-flight__logo {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: contain;
      }
      .cc-flight__airline-name {
        font-weight: 600;
        font-size: 0.95rem;
      }
      .cc-flight__price {
        font-weight: 700;
        font-size: 1.15rem;
      }
      .cc-flight__meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--cpk-text-secondary);
      }
      .cc-flight__rule {
        border: none;
        border-top: 1px solid var(--cpk-divider);
        margin: 0;
        width: 100%;
      }
      .cc-flight__times {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .cc-flight__time {
        font-weight: 700;
        font-size: 1.1rem;
      }
      .cc-flight__duration {
        font-size: 0.75rem;
        color: var(--cpk-text-secondary);
      }
      .cc-flight__route {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.95rem;
        font-weight: 600;
      }
      .cc-flight__arrow {
        color: var(--cpk-text-secondary);
      }
      .cc-flight__foot {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .cc-flight__status {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .cc-flight__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .cc-flight__status-text {
        font-size: 0.8rem;
        color: var(--cpk-text-secondary);
      }
      .cc-flight__cta {
        width: 100%;
        padding: 10px 16px;
        border-radius: var(--cpk-radius-card);
        border: 1px solid var(--cpk-border);
        background: var(--cpk-surface-elevated);
        color: var(--cpk-text-primary);
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--cpk-font-body);
      }
      .cc-flight__cta--done {
        border-color: var(--cpk-success);
        background: var(--cpk-success-bg);
        color: var(--cpk-success);
        cursor: default;
      }
    `,
  ],
})
export class CcFlightCard extends CatalogComponent<typeof FlightCardApi> {
  private readonly rendererService = inject(A2uiRendererService);
  private readonly surface = computed(() =>
    this.rendererService.surfaceGroup.getSurface(this.surfaceId()),
  );

  protected readonly airline = computed(() => String(this.props()['airline']?.value() ?? ''));
  protected readonly airlineLogo = computed(() =>
    String(this.props()['airlineLogo']?.value() ?? ''),
  );
  protected readonly flightNumber = computed(() =>
    String(this.props()['flightNumber']?.value() ?? ''),
  );
  protected readonly origin = computed(() => String(this.props()['origin']?.value() ?? ''));
  protected readonly destination = computed(() =>
    String(this.props()['destination']?.value() ?? ''),
  );
  protected readonly date = computed(() => String(this.props()['date']?.value() ?? ''));
  protected readonly departureTime = computed(() =>
    String(this.props()['departureTime']?.value() ?? ''),
  );
  protected readonly arrivalTime = computed(() =>
    String(this.props()['arrivalTime']?.value() ?? ''),
  );
  protected readonly duration = computed(() => String(this.props()['duration']?.value() ?? ''));
  protected readonly status = computed(() => String(this.props()['status']?.value() ?? ''));
  protected readonly price = computed(() => String(this.props()['price']?.value() ?? ''));
  protected readonly dotColor = computed(() => {
    const explicit = this.props()['statusColor']?.value();
    if (typeof explicit === 'string' && explicit) return explicit;
    return STATUS_COLORS[this.status()] ?? 'var(--cpk-success)';
  });

  protected readonly action = computed(() => this.props()['action']?.value());
  protected readonly done = signal(false);

  onLogoError(event: Event): void {
    // Hide a broken airline logo rather than show the browser broken-image glyph.
    (event.target as HTMLElement).style.display = 'none';
  }

  handleAction(): void {
    if (this.done()) return;
    const action = this.action();
    const surface = this.surface();
    if (action && surface) {
      const dc = new DataContext(surface, this.dataContextPath());
      surface.dispatchAction(dc.resolveAction(action as Action), this.componentId());
    }
    this.done.set(true);
  }
}
