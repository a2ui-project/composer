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

import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {A2aMessageInspector} from './message-inspector';
import {A2aMessageInspectorHarness} from './test/message-inspector.harness';

describe('A2aMessageInspector', () => {
  let fixture: ComponentFixture<A2aMessageInspector>;
  let harness: A2aMessageInspectorHarness;

  const mockEvents = [
    {
      id: '1',
      timestamp: Date.now(),
      direction: 'sent' as const,
      summary: 'Sent [user]: Hello',
      payload: {role: 'user', content: 'Hello'},
    },
    {
      id: '2',
      timestamp: Date.now() + 1000,
      direction: 'received' as const,
      summary: 'Received text response',
      payload: {role: 'agent', content: 'Hi there!'},
    },
    {
      id: '3',
      timestamp: Date.now() + 2000,
      direction: 'error' as const,
      summary: 'Transport Error: Timeout',
      payload: {error: 'Timeout'},
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [A2aMessageInspector],
    }).compileComponents();

    fixture = TestBed.createComponent(A2aMessageInspector);
    fixture.componentRef.setInput('events', mockEvents);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      A2aMessageInspectorHarness,
    );
  });

  it('renders all events by default and displays counter badge', async () => {
    expect(await harness.getPanelCount()).toBe(3);
    expect(await harness.getCounterText()).toBe('3');
  });

  it('emits closeDrawer event on close button click', async () => {
    const closeSpy = vi.spyOn(fixture.componentInstance.closeDrawer, 'emit');
    await harness.clickClose();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('filters events by direction', () => {
    fixture.componentInstance['applyFilterDirection']('sent');
    expect(fixture.componentInstance['filteredEvents']().length).toBe(1);
    expect(fixture.componentInstance['filteredEvents']()[0].direction).toBe('sent');

    fixture.componentInstance['applyFilterDirection']('received');
    expect(fixture.componentInstance['filteredEvents']().length).toBe(1);
    expect(fixture.componentInstance['filteredEvents']()[0].direction).toBe('received');

    fixture.componentInstance['applyFilterDirection']('error');
    expect(fixture.componentInstance['filteredEvents']().length).toBe(1);
    expect(fixture.componentInstance['filteredEvents']()[0].direction).toBe('error');

    fixture.componentInstance['applyFilterDirection']('all');
    expect(fixture.componentInstance['filteredEvents']().length).toBe(3);
  });

  it('filters events by search query in summary and payload', () => {
    fixture.componentInstance['handleSearchInput']({
      target: {value: 'timeout'},
    } as unknown as Event);
    expect(fixture.componentInstance['filteredEvents']().length).toBe(1);
    expect(fixture.componentInstance['filteredEvents']()[0].id).toBe('3');

    fixture.componentInstance['handleSearchInput']({
      target: {value: 'nonexistent'},
    } as unknown as Event);
    expect(fixture.componentInstance['filteredEvents']().length).toBe(0);

    fixture.componentInstance['handleSearchInput']({target: {value: ''}} as unknown as Event);
    expect(fixture.componentInstance['filteredEvents']().length).toBe(3);
  });

  it('formats JSON into lines with line numbers correctly', () => {
    const lines = fixture.componentInstance['getFormattedJsonLines']({key: 'value'});
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0].lineNum).toBe(1);
    expect(lines[0].text).toContain('{');

    expect(fixture.componentInstance['formatJsonPayload'](undefined)).toBe('');
  });

  it('handles circular or malformed payload gracefully in formatJson', () => {
    const circular: Record<string, unknown> = {};
    circular['self'] = circular;
    const formatted = fixture.componentInstance['formatJsonPayload'](circular);
    expect(formatted).toBe('[object Object]');
  });

  it('copies JSON payload to clipboard and resets after timeout', async () => {
    vi.useFakeTimers();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    });

    await fixture.componentInstance['copyEventJsonToClipboard'](mockEvents[0]);
    expect(writeTextSpy).toHaveBeenCalledWith(JSON.stringify(mockEvents[0].payload, null, 2));
    expect(fixture.componentInstance['copiedEventId']()).toBe('1');

    vi.advanceTimersByTime(2500);
    expect(fixture.componentInstance['copiedEventId']()).toBeNull();
    vi.useRealTimers();
  });

  it('handles clipboard copy error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    });

    await fixture.componentInstance['copyEventJsonToClipboard'](mockEvents[0]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('formats timestamp into localized time string', () => {
    const formatted = fixture.componentInstance['formatEventTimestamp'](1700000000000);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('emits clearEvents when clear button is clicked', async () => {
    const clearSpy = vi.spyOn(fixture.componentInstance.clearEvents, 'emit');
    await harness.clickClear();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('renders empty state when events array is empty', async () => {
    fixture.componentRef.setInput('events', []);
    fixture.detectChanges();

    expect(await harness.getPanelCount()).toBe(0);
    expect(await harness.getCounterText()).toBeNull();

    const emptyText = fixture.nativeElement.querySelector('.empty-state p');
    expect(emptyText?.textContent).toContain('No matching A2A protocol events');
  });

  it('clears search query when clear search button is clicked in template', () => {
    fixture.componentInstance['searchQuery'].set('Hello');
    fixture.detectChanges();

    const clearSearchBtn = fixture.nativeElement.querySelector(
      '.clear-search-btn',
    ) as HTMLButtonElement;
    expect(clearSearchBtn).toBeTruthy();

    clearSearchBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance['searchQuery']()).toBe('');
  });

  it('triggers filter direction change on filter chip click', () => {
    const chipButtons = fixture.nativeElement.querySelectorAll(
      '.filter-chips .chip-btn',
    ) as NodeListOf<HTMLButtonElement>;
    expect(chipButtons.length).toBe(4);

    // Sent
    chipButtons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance['filterDirection']()).toBe('sent');

    // Received
    chipButtons[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance['filterDirection']()).toBe('received');

    // Error
    chipButtons[3].click();
    fixture.detectChanges();
    expect(fixture.componentInstance['filterDirection']()).toBe('error');

    // All
    chipButtons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance['filterDirection']()).toBe('all');
  });

  it('renders copy button and updates icon on copy click in template', async () => {
    vi.useFakeTimers();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {clipboard: {writeText: writeTextSpy}});

    const copyBtn = fixture.nativeElement.querySelector('.copy-btn') as HTMLButtonElement;
    expect(copyBtn).toBeTruthy();

    copyBtn.click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(writeTextSpy).toHaveBeenCalled();
    expect(copyBtn.getAttribute('aria-label')).toBe('JSON Copied');
    expect(copyBtn.querySelector('mat-icon')?.textContent?.trim()).toBe('check');

    vi.advanceTimersByTime(2500);
    fixture.detectChanges();

    expect(copyBtn.getAttribute('aria-label')).toBe('Copy JSON payload');
    expect(copyBtn.querySelector('mat-icon')?.textContent?.trim()).toBe('content_copy');
    vi.useRealTimers();
  });

  it('does not reset copiedEventId if another event was copied before timeout', async () => {
    vi.useFakeTimers();
    Object.assign(navigator, {clipboard: {writeText: vi.fn().mockResolvedValue(undefined)}});

    await fixture.componentInstance['copyEventJsonToClipboard'](mockEvents[0]);
    expect(fixture.componentInstance['copiedEventId']()).toBe('1');

    // Simulate another event copied before 2s timeout of event 1
    fixture.componentInstance['copiedEventId'].set('2');

    vi.advanceTimersByTime(2500);
    // Should stay '2' because event 1's timer will see copiedEventId() !== '1'
    expect(fixture.componentInstance['copiedEventId']()).toBe('2');
    vi.useRealTimers();
  });

  it('formats timestamp from Date object', () => {
    const formatted = fixture.componentInstance['formatEventTimestamp'](
      new Date('2026-08-25T12:00:00Z'),
    );
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});
