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
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {formatTimestamp} from '../../utils/date.utils';
import {ErrorLogger, ErrorLogItem} from '../error-logger.service';
import {UsageTrackingService} from '../../usage-tracking/usage-tracking.service';

/**
 * Represents a structured log entry specifically mapped for UI presentation
 * in the Errors diagnostic tab.
 */
export interface DisplayErrorLogItem {
  /** Unique identifier for the error log entry */
  id: string;
  /** Human-readable formatted time string */
  time: string;
  /** Origin subsystem or tag describing where the error was emitted */
  source: string;
  /** Severity level (e.g., 'error', 'warn', 'info') */
  level: string;
  /** Primary diagnostic message content */
  message: string;
  /** Optional 1-indexed line number where the issue occurred */
  line?: number;
  /** Optional 1-indexed column number where the issue occurred */
  column?: number;
  /** Optional multi-line stack trace context */
  stack?: string;
  /** Optional source code snippet associated with the error */
  snippet?: string;
}

/**
 * A debug drawer component presenting captured error stacks, warnings, and connection failures piped from the renderer application.
 */
@Component({
  selector: 'a2ui-composer-errors',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './errors.ng.html',
  styleUrl: './errors.scss',
})
export class Errors {
  private readonly errorLogger = inject(ErrorLogger);
  private readonly usageTrackingService = inject(UsageTrackingService);
  private readonly recentErrors = new Set<string>();
  private readonly destroyRef = inject(DestroyRef);

  protected readonly errorsLog = signal<DisplayErrorLogItem[]>([]);
  protected readonly columnsToDisplay = ['time', 'level', 'source', 'message'];
  protected readonly expandedRows = signal<Set<string>>(new Set());

  constructor() {
    this.errorLogger.errorStream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((item: ErrorLogItem) => {
        if (item.level === 'error' || item.level === 'warn') {
          let invalidProp: string | undefined;

          const propMatch =
            item.message.match(/property '([^']+)'/i) || item.message.match(/instance.([^ ]+) /i);
          if (propMatch) {
            invalidProp = propMatch[1];
          }

          const signature = `${item.sourceTag}:${item.line}:${item.column}:${invalidProp}`;
          if (!this.recentErrors.has(signature)) {
            this.recentErrors.add(signature);
            setTimeout(() => this.recentErrors.delete(signature), 5000);

            this.usageTrackingService.trackComposerError({
              source_tag: item.sourceTag,
              message: item.message,
              line: item.line,
              column: item.column,
              invalid_property: invalidProp,
            });
          }
        }

        const mapped: DisplayErrorLogItem = {
          id: item.id,
          time: formatTimestamp(item.timestamp),
          source: item.sourceTag,
          level: item.level,
          message: item.message,
          line: item.line,
          column: item.column,
          stack: item.stack,
          snippet: item.snippet,
        };
        this.errorsLog.update(logs => {
          const newLogs = [mapped, ...logs];
          if (newLogs.length > 100) {
            newLogs.length = 100;
          }
          return newLogs;
        });
      });
  }

  protected toggleRow(element: DisplayErrorLogItem): void {
    this.expandedRows.update(set => {
      const newSet = new Set(set);
      if (newSet.has(element.id)) {
        newSet.delete(element.id);
      } else {
        newSet.add(element.id);
      }
      return newSet;
    });
  }

  protected isRowExpanded(element: DisplayErrorLogItem): boolean {
    return this.expandedRows().has(element.id);
  }

  clearLogs(): void {
    this.errorsLog.set([]);
    this.expandedRows.set(new Set());
  }
}
