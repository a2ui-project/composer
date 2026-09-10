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

import {describe, it, expect} from 'vitest';
import {renderSurface} from '../test-harness';

describe('CcFlightCard', () => {
  it('renders its bound text values resolved from the data model', async () => {
    const {host} = await renderSurface(
      [
        {
          id: 'root',
          component: 'FlightCard',
          airline: {path: '/flight/airline'},
          airlineLogo: '',
          flightNumber: {path: '/flight/flightNumber'},
          origin: {path: '/flight/origin'},
          destination: {path: '/flight/destination'},
          date: 'Jul 14, 2026',
          departureTime: '08:15',
          arrivalTime: '16:42',
          duration: '5h 27m',
          status: 'On Time',
          price: {path: '/flight/price'},
          action: {event: {name: 'book_flight', context: {}}},
        },
      ],
      {
        flight: {
          airline: 'United Airlines',
          flightNumber: 'UA 482',
          origin: 'SFO',
          destination: 'JFK',
          price: '$342',
        },
      },
    );

    expect(host.textContent).toContain('United Airlines');
    expect(host.textContent).toContain('UA 482');
    expect(host.textContent).toContain('SFO');
    expect(host.textContent).toContain('JFK');
    expect(host.textContent).toContain('$342');

    // Empty airlineLogo must NOT emit an <img> (broken-URL fallback).
    expect(host.querySelector('img')).toBeNull();
  });

  it('dispatches its action through the surface on Select', async () => {
    const {host, actionHandler, fixture} = await renderSurface([
      {
        id: 'root',
        component: 'FlightCard',
        airline: 'United Airlines',
        airlineLogo: '',
        flightNumber: 'UA 482',
        origin: 'SFO',
        destination: 'JFK',
        date: 'Jul 14, 2026',
        departureTime: '08:15',
        arrivalTime: '16:42',
        duration: '5h 27m',
        status: 'On Time',
        price: '$342',
        action: {event: {name: 'book_flight', context: {}}},
      },
    ]);

    const cta = host.querySelector('.cc-flight__cta') as HTMLButtonElement;
    expect(cta).not.toBeNull();
    expect(cta.textContent?.trim()).toBe('Select');

    cta.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(actionHandler).toHaveBeenCalledWith(
      expect.objectContaining({name: 'book_flight', sourceComponentId: 'root'}),
    );
    // CTA latches into its done state.
    expect(cta.textContent?.trim()).toBe('Selected');
  });
});
