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
 * A deterministic stand-in for the Gemini API in browser tests.
 *
 * Composer calls Gemini from the browser through the `@google/genai` SDK, which
 * streams responses as server-sent events over `fetch`. Playwright's
 * `page.route` can only answer a request with a complete body, so it can't send
 * a response chunk by chunk or hold a stream open until the app cancels it,
 * which the Stop journey needs. Instead, this fixture replaces `window.fetch`
 * inside the page before the app loads:
 * - Requests to Gemini's `streamGenerateContent` endpoint are recorded (URL,
 *   headers, and JSON body) so tests can assert what the app sent, and are
 *   answered from a queue of scripted scenarios.
 * - Every other request goes to the real `fetch` unchanged.
 * No request leaves the machine and no real API key is needed.
 */

import type {Page} from '@playwright/test';

/** Fake API key accepted by the deterministic Gemini browser fixture. */
export const FAKE_GEMINI_API_KEY = 'fake-e2e-gemini-key';

/** One deterministic response scenario for the intercepted Gemini stream endpoint. */
export interface GeminiFixtureScenario {
  /** Raw Gemini SSE payload objects emitted as `data:` events. */
  chunks: unknown[];
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

// The fixture's state lives on `window` so the test process can reach it through
// `page.evaluate`, and so a second install on the same page is a no-op.
declare global {
  interface Window {
    __a2uiGeminiFixtureInstalled?: boolean;
    __a2uiGeminiFixtureRequests?: CapturedGeminiRequest[];
    __a2uiGeminiFixtureSetScenarios?: (scenarios: GeminiFixtureScenario[]) => void;
    __a2uiGeminiFixtureClearRequests?: () => void;
  }
}

/**
 * Runs inside the page (via `page.addInitScript`) before any app code, so the
 * SDK picks up the replaced `fetch`. It can't use imports or closures from this
 * file; everything it needs is defined inside it.
 */
function installFixtureInBrowser(fakeApiKey: string): void {
  if (window.__a2uiGeminiFixtureInstalled) {
    return;
  }
  window.__a2uiGeminiFixtureInstalled = true;

  const originalFetch = window.fetch.bind(window);
  // Scripted responses, consumed one per Gemini request in order.
  let scenarios: GeminiFixtureScenario[] = [];
  window.__a2uiGeminiFixtureRequests = [];
  window.__a2uiGeminiFixtureSetScenarios = nextScenarios => {
    scenarios = [...nextScenarios];
  };
  window.__a2uiGeminiFixtureClearRequests = () => {
    window.__a2uiGeminiFixtureRequests = [];
  };

  // The SDK may pass headers as a Headers object, an array, or a plain object;
  // flatten them to lower-case keys so tests can read them directly.
  const normalizeHeaders = (headersInit: HeadersInit | undefined): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (!headersInit) {
      return headers;
    }
    const source = new Headers(headersInit);
    source.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    return headers;
  };

  // Builds the response body for one scenario as a server-sent event stream: each
  // chunk becomes one `data:` event, which is how Gemini's streaming API frames
  // them. If the app aborts the request (the Stop button), the stream errors
  // with the abort reason, just as a real network stream would.
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
            if (signal?.aborted) {
              return;
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
          // Hold the stream open, as a slow model would, until the app cancels it.
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

  // Answers Gemini stream requests from the scenario queue; passes everything else through.
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

    // Mirror Gemini's own failures so a missing key or an unscripted request
    // shows up in the app the way a real error would, instead of hanging.
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
