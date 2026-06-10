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

/**
 * A highly robust, deterministic stringify utility designed for stable SHA-256 hashing
 * across complex JavaScript structures including DAGs, circular graphs, Maps, Sets,
 * BigInts, and property getter exceptions.
 */
export function stableStringify(value: unknown, visited = new WeakSet<object>()): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return '[NaN]';
    }
    if (!Number.isFinite(value)) {
      return value > 0 ? '[Infinity]' : '[-Infinity]';
    }
    return String(value);
  }
  if (typeof value === 'bigint') {
    return `${value}n`;
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'symbol') {
    return `[Symbol: ${JSON.stringify(value.description ?? '')}]`;
  }
  if (typeof value === 'function') {
    return `[Function: ${JSON.stringify(value.name || 'anonymous')}]`;
  }
  if (typeof value === 'object') {
    if (visited.has(value)) {
      return '[Circular]';
    }
    visited.add(value);

    try {
      let result: string;
      if (value instanceof Date) {
        const time = value.getTime();
        result = `[Date: ${Number.isNaN(time) ? 'Invalid Date' : value.toISOString()}]`;
      } else if (value instanceof RegExp) {
        result = `[RegExp: ${String(value)}]`;
      } else if (value instanceof Error) {
        result = `[Error: ${JSON.stringify(value.message)}]`;
      } else if (value instanceof Set) {
        const elements: string[] = [];
        for (const item of value) {
          elements.push(stableStringify(item, visited));
        }
        elements.sort();
        result = `Set[${elements.join(',')}]`;
      } else if (value instanceof Map) {
        const entries: string[] = [];
        for (const [k, v] of value) {
          const kStr = stableStringify(k, visited);
          const vStr = stableStringify(v, visited);
          entries.push(`${kStr}:${vStr}`);
        }
        entries.sort();
        result = `Map{${entries.join(',')}}`;
      } else if (Array.isArray(value)) {
        const elements: string[] = [];
        for (const item of value) {
          elements.push(stableStringify(item, visited));
        }
        result = `[${elements.join(',')}]`;
      } else {
        const keys = Object.keys(value).sort();
        const parts: string[] = [];
        for (const key of keys) {
          let valStr: string;
          try {
            const propVal = (value as Record<string, unknown>)[key];
            if (propVal === undefined) {
              continue;
            }
            valStr = stableStringify(propVal, visited);
          } catch {
            valStr = '[Getter Error]';
          }
          parts.push(`${JSON.stringify(key)}:${valStr}`);
        }
        result = `{${parts.join(',')}}`;
      }

      return result;
    } finally {
      visited.delete(value);
    }
  }

  return String(value);
}
