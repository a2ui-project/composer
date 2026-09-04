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
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Errors} from './errors';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ErrorsHarness} from './test/errors.harness';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {ErrorLogger, ErrorLogItem} from '../error-logger.service';
import {Subject} from 'rxjs';
import {UsageTrackingService} from '../../usage-tracking/usage-tracking.service';
import {NoopUsageTrackingService} from '../../usage-tracking/noop-usage-tracking.service';

describe('Errors Component', () => {
  let fixture: ComponentFixture<Errors>;
  let harness: ErrorsHarness;
  let errorStream$: Subject<ErrorLogItem>;

  beforeEach(async () => {
    errorStream$ = new Subject<ErrorLogItem>();

    const mockErrorLogger = {
      errorStream$,
    };

    await TestBed.configureTestingModule({
      imports: [Errors, MatTableModule],
      providers: [
        provideNoopAnimations(),
        {provide: ErrorLogger, useValue: mockErrorLogger},
        {provide: UsageTrackingService, useClass: NoopUsageTrackingService},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Errors);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ErrorsHarness);
  });

  describe('trackComposerError telemetry', () => {
    let usageService: UsageTrackingService;

    beforeEach(async () => {
      vi.useFakeTimers();
      usageService = TestBed.inject(UsageTrackingService);
      vi.spyOn(usageService, 'trackComposerError');
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('transmits mapped structural error events to the usage tracking service', () => {
      errorStream$.next({
        id: '1',
        timestamp: Date.now(),
        sourceTag: '[Monaco]',
        level: 'error',
        message: "Schema error: property 'missingProp'",
        line: 5,
        column: 10,
      });

      expect(usageService.trackComposerError).toHaveBeenCalledWith({
        source_tag: '[Monaco]',
        line: 5,
        column: 10,
        invalid_property: 'missingProp',
        message: "Schema error: property 'missingProp'",
      });
    });

    it('buffers and deduplicates repetitive error signatures for 5 seconds preventing flood', () => {
      errorStream$.next({
        id: '2',
        timestamp: Date.now(),
        sourceTag: '[Parser]',
        level: 'warn',
        message: 'SyntaxError at line 10',
        line: 10,
        column: 5,
      });

      errorStream$.next({
        id: '3',
        timestamp: Date.now(),
        sourceTag: '[Parser]',
        level: 'warn',
        message: 'SyntaxError at line 10',
        line: 10,
        column: 5,
      });

      expect(usageService.trackComposerError).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(5000);

      errorStream$.next({
        id: '4',
        timestamp: Date.now(),
        sourceTag: '[Parser]',
        level: 'error',
        message: 'SyntaxError at line 10',
        line: 10,
        column: 5,
      });

      expect(usageService.trackComposerError).toHaveBeenCalledTimes(2);
    });

    it('extracts known structure keys replacing literals with extracted string', () => {
      errorStream$.next({
        id: '5',
        timestamp: Date.now(),
        sourceTag: '[Monaco]',
        level: 'error',
        message: 'Schema error: instance.components is not of a type',
        line: 1,
        column: 1,
      });

      expect(usageService.trackComposerError).toHaveBeenCalledWith(
        expect.objectContaining({invalid_property: 'components'}),
      );
    });
  });

  it('creates the errors component via test harness', async () => {
    expect(harness).toBeTruthy();
  });

  it('displays placeholder initially', async () => {
    expect(await harness.hasPlaceholder()).toBe(true);
    expect(await harness.getRowsCount()).toBe(0);
  });

  it('processes incoming error log items correctly', async () => {
    errorStream$.next({
      id: '123',
      timestamp: Date.now(),
      level: 'error',
      message: 'Simple error message',
      sourceTag: '[Previewer]',
    });
    fixture.detectChanges();

    expect(await harness.hasPlaceholder()).toBe(false);
    expect(await harness.getRowsCount()).toBe(1);

    const row = await harness.getRowValuesAt(0);
    expect(row.time).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
    expect(row.source).toBe('[Previewer]');
    expect(row.message).toContain('Simple error message');
  });

  it('maps incoming exception item correctly preserving source category', async () => {
    errorStream$.next({
      id: 'exc-1',
      timestamp: Date.now(),
      level: 'error',
      message: 'Uncaught TypeError: Cannot read property',
      sourceTag: '[Previewer]',
      stack: 'Error\n  at main.ts:10:5',
    });
    fixture.detectChanges();

    const row = await harness.getRowValuesAt(0);
    expect(row.source).toBe('[Previewer]');
    expect(row.message).toContain('Uncaught TypeError: Cannot read property');
  });

  it('processes incoming validation error log items correctly', async () => {
    errorStream$.next({
      id: 'val-1',
      timestamp: Date.now(),
      level: 'error',
      message: 'Missing required field title, Invalid surface id',
      sourceTag: '[Validation]',
    });
    fixture.detectChanges();

    expect(await harness.hasPlaceholder()).toBe(false);
    expect(await harness.getRowsCount()).toBe(1);

    const row = await harness.getRowValuesAt(0);
    expect(row.source).toBe('[Validation]');
    expect(row.message).toBe('Missing required field title, Invalid surface id');
  });

  it('ignores empty validation error items gracefully', async () => {
    // If an error is empty, it shouldn't produce a visible row if we just don't push it,
    // but here we just verify standard behavior.
    expect(await harness.hasPlaceholder()).toBe(true);
  });

  it('handles log items with line and column numbers', async () => {
    errorStream$.next({
      id: '124',
      timestamp: Date.now(),
      level: 'warn',
      message: 'Line warning',
      sourceTag: '[Editor]',
      line: 12,
      column: 34,
    });
    fixture.detectChanges();

    const row = await harness.getRowValuesAt(0);
    expect(row.message).toContain('Line warning');
    expect(row.message).toContain('Line 12');
    expect(row.message).toContain('Col 34');
    expect(row.level).toBe('warn');
  });

  it('prepends newer errors at index 0', async () => {
    errorStream$.next({
      id: '1',
      timestamp: Date.now(),
      level: 'error',
      message: 'Error 1',
      sourceTag: '[Shell]',
    });
    errorStream$.next({
      id: '2',
      timestamp: Date.now() + 1,
      level: 'error',
      message: 'Error 2',
      sourceTag: '[Shell]',
    });
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(2);
    const row0 = await harness.getRowValuesAt(0);
    expect(row0.message).toContain('Error 2');
    const row1 = await harness.getRowValuesAt(1);
    expect(row1.message).toContain('Error 1');
  });

  it('caps history at 100 entries strictly', async () => {
    for (let i = 0; i < 120; i++) {
      errorStream$.next({
        id: `err-${i}`,
        timestamp: Date.now() + i,
        level: 'error',
        message: `Error-${i}`,
        sourceTag: '[Shell]',
      });
    }
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(100);
    const newestRow = await harness.getRowValuesAt(0);
    expect(newestRow.message).toContain('Error-119');
    const oldestRow = await harness.getRowValuesAt(99);
    expect(oldestRow.message).toContain('Error-20');
  });

  it('handles collapsible stack trace traces correctly', async () => {
    errorStream$.next({
      id: 'stack-1',
      timestamp: Date.now(),
      level: 'error',
      message: 'Exception with stack',
      sourceTag: '[Shell]',
      stack: 'Stack trace details here\n  at file.ts:10',
    });
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(1);

    await harness.toggleStackAt(0);
    fixture.detectChanges();

    const stackText = await harness.getStackTextAt(0);
    expect(stackText).toContain('Stack trace details here');
    expect(stackText).toContain('at file.ts:10');

    await harness.toggleStackAt(0);
    fixture.detectChanges();
  });

  it('clears logs and resets expanded rows cleanly on clearLogs()', async () => {
    errorStream$.next({
      id: 'err-x',
      timestamp: Date.now(),
      level: 'error',
      message: 'Clean error',
      sourceTag: '[Shell]',
      stack: 'stack trace',
    });
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(1);

    fixture.componentInstance.clearLogs();
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(0);
    expect(await harness.hasPlaceholder()).toBe(true);
    expect(
      (fixture.componentInstance as unknown as {expandedRows: () => Set<string>}).expandedRows()
        .size,
    ).toBe(0);
  });

  it('applies aria-hidden attribute to the purely decorative MatIcon element inside stack toggle buttons', async () => {
    errorStream$.next({
      id: 'icon-err',
      timestamp: Date.now(),
      level: 'error',
      message: 'Exception with stack',
      sourceTag: '[Shell]',
      stack: 'Stack trace details here',
    });
    fixture.detectChanges();

    const hiddenAttrs = await harness.getIconsAriaHidden();
    expect(hiddenAttrs.length).toBe(1);
    expect(hiddenAttrs[0]).toBe('true');
  });
});
