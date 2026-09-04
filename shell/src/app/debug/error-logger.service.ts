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
import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {safeSerialize} from 'a2ui-bridge';

/**
 * Defines the severity levels for log events.
 */
export type ErrorLogLevel = 'error' | 'warn' | 'info' | 'log';

/**
 * Represents a structured log entry emitted by the ErrorLogger.
 */
export interface ErrorLogItem {
  /** Unique identifier for the log entry. */
  readonly id: string;
  /** Unix timestamp when the log entry was created. */
  readonly timestamp: number;
  /** Severity level of the log entry. */
  readonly level: ErrorLogLevel;
  /** The formatted log message. */
  readonly message: string;
  /** Identifier of the system or subsystem that generated the log. */
  readonly sourceTag: string;
  /** Optional line number associated with the log, typically 1-indexed. */
  readonly line?: number;
  /** Optional column number associated with the log, typically 1-indexed. */
  readonly column?: number;
  /** Optional stack trace string for error occurrences. */
  readonly stack?: string;
  /** Optional code snippet related to the log. */
  readonly snippet?: string;
}

/**
 * Used with the `ErrorLogger.withTag` method to simplify callers passing in
 * the "tag" to associate with a log message.
 */
export interface TaggedLogger {
  /** Logs an error with the bound tag. */
  error(message: string, ...args: unknown[]): void;
  /** Logs a warning with the bound tag. */
  warn(message: string, ...args: unknown[]): void;
  /** Logs info with the bound tag. */
  info(message: string, ...args: unknown[]): void;
  /** Logs a standard message with the bound tag. */
  log(message: string, ...args: unknown[]): void;
}

/**
 * Determines whether a given value resembles an Error object.
 * Checks for the presence of standard Error properties like 'message' and 'stack'.
 *
 * @param val - The value to inspect.
 * @returns True if the value is shaped like an Error, false otherwise.
 */
export function isErrorLike(val: unknown): val is Error {
  if (val instanceof Error || Object.prototype.toString.call(val) === '[object Error]') {
    return true;
  }
  return (
    typeof val === 'object' &&
    val !== null &&
    'message' in val &&
    typeof (val as Record<string, unknown>)['message'] === 'string' &&
    'stack' in val &&
    !('nodeType' in val) &&
    !('component' in val)
  );
}
/**
 * Service for centralizing, structuring, and broadcasting shell log events.
 * Provides a unified channel for various subsystem diagnostics.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorLogger {
  private readonly _errorStream = new Subject<ErrorLogItem>();
  readonly errorStream$: Observable<ErrorLogItem> = this._errorStream.asObservable();

  /**
   * Logs an entry at the 'error' level.
   */
  error(item: Partial<ErrorLogItem>): void;
  error(messageOrError: unknown, ...optionalParams: unknown[]): void;
  error(arg1: unknown, ...args: unknown[]): void {
    const item = this.normalizeItem('error', arg1, ...args);
    if (item) {
      this._errorStream.next(item);
    }
  }

  /**
   * Logs an entry at the 'warn' level.
   */
  warn(item: Partial<ErrorLogItem>): void;
  warn(messageOrError: unknown, ...optionalParams: unknown[]): void;
  warn(arg1: unknown, ...args: unknown[]): void {
    const item = this.normalizeItem('warn', arg1, ...args);
    if (item) {
      this._errorStream.next(item);
    }
  }

  /**
   * Logs an entry at the 'log' level.
   */
  log(item: Partial<ErrorLogItem>): void;
  log(messageOrError: unknown, ...optionalParams: unknown[]): void;
  log(arg1: unknown, ...args: unknown[]): void {
    const item = this.normalizeItem('log', arg1, ...args);
    if (item) {
      this._errorStream.next(item);
    }
  }

  /**
   * Logs an entry at the 'info' level.
   */
  info(item: Partial<ErrorLogItem>): void;
  info(messageOrError: unknown, ...optionalParams: unknown[]): void;
  info(arg1: unknown, ...args: unknown[]): void {
    const item = this.normalizeItem('info', arg1, ...args);
    if (item) {
      this._errorStream.next(item);
    }
  }

  /**
   * Returns a TaggedLogger bound to the specified sourceTag.
   * Useful for UI components and nested services to standardise their logging tag.
   *
   * @param sourceTag - The tag to associate with logs (e.g. '[Shell]').
   * @returns A TaggedLogger instance.
   */
  withTag(sourceTag: string): TaggedLogger {
    const buildMessage = (message: string, args: unknown[]) => {
      if (args.length === 0) return message;
      const argsStr = args.map(a => (typeof a === 'string' ? a : safeSerialize(a))).join(' ');
      return message ? `${message} ${argsStr}` : argsStr;
    };
    return {
      error: (message: string, ...args: unknown[]) =>
        this.error({message: buildMessage(message, args), sourceTag, level: 'error'}),
      warn: (message: string, ...args: unknown[]) =>
        this.warn({message: buildMessage(message, args), sourceTag, level: 'warn'}),
      info: (message: string, ...args: unknown[]) =>
        this.info({message: buildMessage(message, args), sourceTag, level: 'info'}),
      log: (message: string, ...args: unknown[]) =>
        this.log({message: buildMessage(message, args), sourceTag, level: 'log'}),
    };
  }

  private normalizeItem(
    defaultLevel: ErrorLogLevel,
    arg1: unknown,
    ...args: unknown[]
  ): ErrorLogItem | null {
    const timestamp = Date.now();
    const id = `${timestamp}-${Math.random().toString(36).substring(2, 9)}`;

    if (this.isPartialErrorLogItem(arg1)) {
      return this.normalizePartialItem(arg1, defaultLevel, id, timestamp, args);
    }

    return this.normalizeUnknown(arg1, defaultLevel, id, timestamp, args);
  }

  private normalizePartialItem(
    partialObj: Partial<ErrorLogItem>,
    defaultLevel: ErrorLogLevel,
    id: string,
    timestamp: number,
    args: unknown[],
  ): ErrorLogItem {
    const sourceTag = '[Shell]';
    const message =
      partialObj.message !== undefined
        ? partialObj.message
        : args.length > 0
          ? args.map(a => (typeof a === 'string' ? a : safeSerialize(a))).join(' ')
          : '';
    return {
      id: partialObj.id ?? id,
      timestamp: partialObj.timestamp ?? timestamp,
      level: partialObj.level ?? defaultLevel,
      message,
      sourceTag: partialObj.sourceTag ?? sourceTag,
      line: partialObj.line,
      column: partialObj.column,
      stack: partialObj.stack,
      snippet: partialObj.snippet,
    };
  }

  private normalizeUnknown(
    arg1: unknown,
    defaultLevel: ErrorLogLevel,
    id: string,
    timestamp: number,
    args: unknown[],
  ): ErrorLogItem {
    let message = '';
    let stack: string | undefined = undefined;
    const sourceTag = '[Shell]';

    if (isErrorLike(arg1)) {
      message = arg1.message;
      stack = arg1.stack;
    } else if (typeof arg1 === 'string') {
      message = arg1;
    } else {
      message = safeSerialize(arg1);
    }

    if (args.length > 0) {
      const argsStr = args.map(a => (typeof a === 'string' ? a : safeSerialize(a))).join(' ');
      message = message ? `${message} ${argsStr}` : argsStr;
    }

    return {
      id,
      timestamp,
      level: defaultLevel,
      message,
      sourceTag,
      stack,
    };
  }

  private isPartialErrorLogItem(val: unknown): val is Partial<ErrorLogItem> {
    if (isErrorLike(val)) {
      return false;
    }

    if (typeof val !== 'object' || val === null) {
      return false;
    }

    if ('startLineNumber' in val) {
      return false;
    }

    const keys = Object.keys(val);
    if (keys.length === 0) {
      return false;
    }

    const validKeys = new Set([
      'id',
      'timestamp',
      'level',
      'message',
      'sourceTag',
      'line',
      'column',
      'stack',
      'snippet',
    ]);

    for (const k of keys) {
      if (!validKeys.has(k)) {
        return false;
      }
    }

    return true;
  }
}
