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

import {TestBed} from '@angular/core/testing';
import {ErrorLogger, ErrorLogItem} from '../debug/error-logger.service';
import {UsageTrackingService} from './usage-tracking.service';
import {ErrorTelemetryReporter} from './error-telemetry-reporter.service';
import {Subject} from 'rxjs';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';

describe('ErrorTelemetryReporter', () => {
  let reporter: ErrorTelemetryReporter;
  let usageTrackingService: UsageTrackingService;
  let errorStream$: Subject<ErrorLogItem>;

  beforeEach(() => {
    errorStream$ = new Subject<ErrorLogItem>();

    TestBed.configureTestingModule({
      providers: [
        ErrorTelemetryReporter,
        {
          provide: UsageTrackingService,
          useValue: {trackComposerError: vi.fn()},
        },
        {
          provide: ErrorLogger,
          useValue: {errorStream$},
        },
      ],
    });

    reporter = TestBed.inject(ErrorTelemetryReporter);
    usageTrackingService = TestBed.inject(UsageTrackingService);
  });

  it('subscribes to errorStream immediately when start is called', () => {
    reporter.start();
    errorStream$.next({
      id: '1',
      timestamp: Date.now(),
      level: 'error',
      sourceTag: '[Monaco]',
      message: 'SyntaxError: something',
    } as ErrorLogItem);

    expect(usageTrackingService.trackComposerError).toHaveBeenCalledTimes(1);
  });

  it('filters out non-warn/error logs', () => {
    reporter.start();
    errorStream$.next({
      id: '1',
      timestamp: Date.now(),
      level: 'info',
      sourceTag: '[Monaco]',
      message: 'just info',
    } as ErrorLogItem);

    expect(usageTrackingService.trackComposerError).not.toHaveBeenCalled();
  });

  describe('timing deduplication', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('deduplicates identical signatures', () => {
      reporter.start();
      const item = {
        id: '1',
        timestamp: Date.now(),
        level: 'error',
        sourceTag: '[TestTag]',
        message: 'TypeError: is undefined',
        line: 12,
        column: 15,
      } as ErrorLogItem;

      errorStream$.next({...item, id: '1'});
      errorStream$.next({...item, id: '2'});
      expect(usageTrackingService.trackComposerError).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(5001); // Evicted after 5000
      errorStream$.next({...item, id: '3'});
      expect(usageTrackingService.trackComposerError).toHaveBeenCalledTimes(2);
    });
  });

  it('caps history at 1000 items', () => {
    reporter.start();
    for (let i = 0; i < 1500; i++) {
      errorStream$.next({
        id: `id-${i}`,
        timestamp: Date.now(),
        level: 'error',
        sourceTag: '[TestTag]',
        message: `Error number ${i}`,
      } as ErrorLogItem);
    }
    // Expected to not throw or leak, we could assert the internal map size via cast
    const cacheMap = (reporter as unknown as {recentErrors: Map<string, number>})
      .recentErrors as Map<string, number>;
    expect(cacheMap.size).toBeLessThanOrEqual(1000);
  });

  it('extracts invalidProperty from standard a2ui schema messages', () => {
    reporter.start();
    errorStream$.next({
      id: '1',
      timestamp: Date.now(),
      level: 'error',
      sourceTag: '[Monaco]',
      message: "Schema error: property 'components' is missing",
    } as ErrorLogItem);

    expect(usageTrackingService.trackComposerError).toHaveBeenCalledWith(
      expect.objectContaining({invalidProperty: 'components'}),
    );
  });

  it('does not extract user-authored property names from not-allowed messages', () => {
    reporter.start();
    errorStream$.next({
      id: 'leak',
      timestamp: Date.now(),
      level: 'error',
      sourceTag: '[Monaco]',
      message: "Schema error: Property 'userEmail' is not allowed",
    } as ErrorLogItem);
    expect(usageTrackingService.trackComposerError).toHaveBeenCalledWith(
      expect.objectContaining({invalidProperty: undefined}),
    );
  });

  it('extracts invalidProperty from a missing-property message ending with a comma', () => {
    reporter.start();
    errorStream$.next({
      id: '2',
      timestamp: Date.now(),
      level: 'error',
      sourceTag: '[Monaco]',
      message: "Schema error: property 'components' is missing, wait no",
    } as ErrorLogItem);
    expect(usageTrackingService.trackComposerError).toHaveBeenCalledWith(
      expect.objectContaining({invalidProperty: 'components'}),
    );
  });

  it('extracts invalidProperty from a missing-property message with no trailing text', () => {
    reporter.start();
    errorStream$.next({
      id: '3',
      timestamp: Date.now(),
      level: 'error',
      sourceTag: '[Monaco]',
      message: "property 'components' is missing",
    } as ErrorLogItem);
    expect(usageTrackingService.trackComposerError).toHaveBeenCalledWith(
      expect.objectContaining({invalidProperty: 'components'}),
    );
  });

  it('extracts invalidProperty from a prefixed message', () => {
    reporter.start();
    errorStream$.next({
      id: '4',
      timestamp: Date.now(),
      level: 'error',
      sourceTag: '[Monaco]',
      message: "TypeError: Schema error: property 'componentId' is missing",
    } as ErrorLogItem);
    expect(usageTrackingService.trackComposerError).toHaveBeenCalledWith(
      expect.objectContaining({invalidProperty: 'componentId'}),
    );
  });

  it('extracts invalidProperty from Monaco vscode-json-languageservice Missing property format', () => {
    reporter.start();
    errorStream$.next({
      id: '5',
      timestamp: Date.now(),
      level: 'error',
      sourceTag: '[Monaco]',
      message: 'Missing property "surfaceId".',
    } as ErrorLogItem);
    expect(usageTrackingService.trackComposerError).toHaveBeenCalledWith(
      expect.objectContaining({invalidProperty: 'surfaceId'}),
    );
  });

  it('rejects invalidProperty extraction from untrusted preview console logs with [Preview] tag', () => {
    reporter.start();
    errorStream$.next({
      id: 'preview-spoof-1',
      timestamp: Date.now(),
      level: 'error',
      sourceTag: '[Preview]',
      message: 'Missing property "spoofedField".',
    } as ErrorLogItem);
    expect(usageTrackingService.trackComposerError).toHaveBeenCalledWith(
      expect.objectContaining({invalidProperty: undefined}),
    );
  });

  it('extracts invalidProperty from [Validation] source tag', () => {
    reporter.start();
    errorStream$.next({
      id: 'validation-err-1',
      timestamp: Date.now(),
      level: 'error',
      sourceTag: '[Validation]',
      message: "property 'validProp' is missing",
    } as ErrorLogItem);
    expect(usageTrackingService.trackComposerError).toHaveBeenCalledWith(
      expect.objectContaining({invalidProperty: 'validProp'}),
    );
  });

  it('maps source tags to categories gracefully', () => {
    reporter.start();
    errorStream$.next({
      id: '1',
      timestamp: Date.now(),
      level: 'error',
      sourceTag: '[NonExistentTag]',
      message: 'Something broke',
    } as ErrorLogItem);

    expect(usageTrackingService.trackComposerError).toHaveBeenCalledWith(
      expect.objectContaining({errorCategory: 'unknown_NonExistentTag'}),
    );
  });
});
