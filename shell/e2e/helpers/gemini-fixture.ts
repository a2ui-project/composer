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

import type {Page} from '@playwright/test';

/** Fake API key accepted by the deterministic Gemini browser fixture. */
export const FAKE_GEMINI_API_KEY = 'fake-e2e-gemini-key';

/** One deterministic response scenario for the intercepted Gemini stream endpoint. */
export interface GeminiFixtureScenario {
  /** Raw Gemini SSE payload objects emitted as `data:` events. */
  chunks: unknown[];
  /** Optional delay after each emitted chunk. */
  delayMs?: number;
  /** Keeps the stream open after all chunks until the request AbortSignal fires. */
  hangAfterChunks?: boolean;
  /** HTTP status for the intercepted fixture response. */
  status?: number;
}

/** Gemini request metadata captured by the browser fixture for test assertions. */
export interface CapturedGeminiRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

declare global {
  interface Window {
    __a2uiGeminiFixtureInstalled?: boolean;
    __a2uiGeminiFixtureRequests?: CapturedGeminiRequest[];
    __a2uiGeminiFixtureSetScenarios?: (scenarios: GeminiFixtureScenario[]) => void;
    __a2uiGeminiFixtureClearRequests?: () => void;
  }
}

function installFixtureInBrowser(fakeApiKey: string): void {
  if (window.__a2uiGeminiFixtureInstalled) return;
  window.__a2uiGeminiFixtureInstalled = true;

  const originalFetch = window.fetch.bind(window);
  let scenarios: GeminiFixtureScenario[] = [];
  window.__a2uiGeminiFixtureRequests = [];
  window.__a2uiGeminiFixtureSetScenarios = nextScenarios => {
    scenarios = [...nextScenarios];
  };
  window.__a2uiGeminiFixtureClearRequests = () => {
    window.__a2uiGeminiFixtureRequests = [];
  };

  const normalizeHeaders = (headersInit: HeadersInit | undefined): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (!headersInit) return headers;
    const source = new Headers(headersInit);
    source.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    return headers;
  };

  const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

  const streamForScenario = (scenario: GeminiFixtureScenario, signal?: AbortSignal | null) => {
    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        const onAbort = () => {
          controller.error(signal?.reason || new DOMException('Aborted', 'AbortError'));
        };
        if (signal?.aborted) {
          onAbort();
          return;
        }
        signal?.addEventListener('abort', onAbort, {once: true});
        try {
          for (const chunk of scenario.chunks) {
            if (signal?.aborted) return;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            if (scenario.delayMs) await sleep(scenario.delayMs);
          }
          if (scenario.hangAfterChunks) {
            await new Promise<void>(resolve => {
              signal?.addEventListener('abort', () => resolve(), {once: true});
            });
            return;
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          signal?.removeEventListener('abort', onAbort);
        }
      },
    });
  };

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (
      !url.includes('generativelanguage.googleapis.com') ||
      !url.includes(':streamGenerateContent')
    ) {
      return originalFetch(input, init);
    }

    const headers = normalizeHeaders(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    const bodyText =
      typeof init?.body === 'string'
        ? init.body
        : input instanceof Request
          ? await input.clone().text()
          : '';
    let body: unknown = bodyText;
    try {
      body = JSON.parse(bodyText);
    } catch {
      // Keep the raw body string for diagnostics.
    }
    window.__a2uiGeminiFixtureRequests?.push({
      url,
      method: init?.method || (input instanceof Request ? input.method : 'GET'),
      headers,
      body,
    });

    if (headers['x-goog-api-key'] !== fakeApiKey) {
      return new Response(
        `data: ${JSON.stringify({error: {code: 401, status: 'UNAUTHENTICATED'}})}\n\n`,
        {status: 401, headers: {'content-type': 'text/event-stream'}},
      );
    }

    const scenario = scenarios.shift();
    if (!scenario) {
      return new Response(
        `data: ${JSON.stringify({error: {code: 500, status: 'NO_FIXTURE_SCENARIO'}})}\n\n`,
        {status: 500, headers: {'content-type': 'text/event-stream'}},
      );
    }

    const signal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
    return new Response(streamForScenario(scenario, signal), {
      status: scenario.status ?? 200,
      headers: {'content-type': 'text/event-stream'},
    });
  };
}

/**
 * Installs the deterministic Gemini fixture before page navigation.
 *
 * Call `setGeminiScenarios` after the page has loaded to seed responses.
 */
export async function installGeminiFixture(page: Page): Promise<void> {
  await page.addInitScript(installFixtureInBrowser, FAKE_GEMINI_API_KEY);
}

/** Replaces pending Gemini response scenarios and clears captured request history. */
export async function setGeminiScenarios(
  page: Page,
  scenarios: GeminiFixtureScenario[],
): Promise<void> {
  await page.evaluate(nextScenarios => {
    if (!window.__a2uiGeminiFixtureSetScenarios || !window.__a2uiGeminiFixtureClearRequests) {
      throw new Error('Gemini fixture is not installed on this page.');
    }
    window.__a2uiGeminiFixtureSetScenarios(nextScenarios);
    window.__a2uiGeminiFixtureClearRequests();
  }, scenarios);
}

/** Returns Gemini requests captured since the most recent `setGeminiScenarios` call. */
export async function getCapturedGeminiRequests(page: Page): Promise<CapturedGeminiRequest[]> {
  return await page.evaluate(() => {
    if (!window.__a2uiGeminiFixtureRequests) {
      throw new Error('Gemini fixture is not installed on this page.');
    }
    return window.__a2uiGeminiFixtureRequests;
  });
}

/** Creates one Gemini stream text chunk. */
export function geminiTextChunk(text: string): unknown {
  return {
    candidates: [
      {
        content: {
          role: 'model',
          parts: [{text}],
        },
      },
    ],
  };
}

/** Splits text into two Gemini stream chunks to exercise incremental streaming. */
export function splitTextIntoGeminiChunks(text: string): unknown[] {
  const midpoint = Math.max(1, Math.floor(text.length / 2));
  return [geminiTextChunk(text.slice(0, midpoint)), geminiTextChunk(text.slice(midpoint))];
}
