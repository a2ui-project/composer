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

import {Injectable, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ErrorLogger, ErrorLogItem} from '../debug/error-logger.service';
import {UsageTrackingService} from './usage-tracking.service';

export const CATEGORY_BY_TAG: Record<string, string> = {
  '[Monaco]': 'SCHEMA_VALIDATION_ERROR',
  '[ChatParser]': 'CHAT_PARSER_ERROR',
  '[Shell]': 'SHELL_ERROR',
  '[Renderer]': 'RENDERER_ERROR',
  '[Preview]': 'PREVIEW_ERROR',
};

@Injectable({providedIn: 'root'})
export class ErrorTelemetryReporter {
  private readonly usageTrackingService = inject(UsageTrackingService);
  private readonly errorLogger = inject(ErrorLogger);
  private readonly destroyRef = inject(DestroyRef);
  private isStarted = false;

  private readonly recentErrors = new Map<string, number>();
  private readonly MAX_RECENT_ERRORS = 1000;
  private readonly DEDUPE_TTL = 5000;

  start(): void {
    if (this.isStarted) return;
    this.isStarted = true;

    this.errorLogger.errorStream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((item: ErrorLogItem) => {
        if (item.level === 'error' || item.level === 'warn') {
          this.processErrorLog(item);
        }
      });
  }

  private processErrorLog(item: ErrorLogItem): void {
    let invalidProp: string | undefined;

    const propMatch =
      item.message.match(/property '([^']+)'/i) || item.message.match(/instance\.([^ ]+)(?: |$)/i);
    if (propMatch) {
      invalidProp = propMatch[1];
    }

    const now = Date.now();
    this.evictStaleErrors(now);

    const errorClassName = item.message.match(/^([A-Z][A-Za-z0-9]*Error):/)?.[1] || '';
    const messageSlice = item.message.slice(0, 50);

    // safe fallback per Planner A (Commit 2 Plan)
    const errorCategory =
      CATEGORY_BY_TAG[item.sourceTag] || `unknown_${item.sourceTag.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const signature = `${item.sourceTag}|${errorCategory}|${item.line ?? ''}|${item.column ?? ''}|${invalidProp ?? ''}|${errorClassName}|${messageSlice}`;

    if (!this.recentErrors.has(signature)) {
      if (this.recentErrors.size >= this.MAX_RECENT_ERRORS) {
        // Find oldest entry to evict if we hit capacity limit
        const oldestKey = this.recentErrors.keys().next().value;
        if (oldestKey) this.recentErrors.delete(oldestKey);
      }

      this.recentErrors.set(signature, now);

      this.usageTrackingService.trackComposerError({
        sourceTag: item.sourceTag,
        errorCategory,
        line: item.line,
        column: item.column,
        invalidProperty: invalidProp,
      });
    }
  }

  private evictStaleErrors(now: number): void {
    for (const [sig, timestamp] of this.recentErrors.entries()) {
      if (now - timestamp >= this.DEDUPE_TTL) {
        this.recentErrors.delete(sig);
      }
    }
  }
}
