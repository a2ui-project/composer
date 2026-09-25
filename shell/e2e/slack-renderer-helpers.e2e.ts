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

import {expect, test} from '@playwright/test';
import {getSevereMonacoMarkers} from './slack-renderer.helpers';

interface MarkerHarnessWindow extends Window {
  __markerCallCount?: number;
  monaco?: {
    editor?: {
      getModelMarkers?: () => {severity: number; message: string}[];
    };
  };
}

test.describe('Slack renderer E2E helpers', () => {
  test('fails loudly when Monaco marker collection is unavailable', async ({page}) => {
    await page.goto('about:blank');

    await expect(getSevereMonacoMarkers(page)).rejects.toThrow(
      'Monaco marker API was not available.',
    );
  });

  test('returns severe Monaco markers only after querying the marker API', async ({page}) => {
    await page.goto('about:blank');
    await page.evaluate(() => {
      const harnessWindow = window as MarkerHarnessWindow;
      harnessWindow.__markerCallCount = 0;
      harnessWindow.monaco = {
        editor: {
          getModelMarkers: () => {
            harnessWindow.__markerCallCount = (harnessWindow.__markerCallCount ?? 0) + 1;
            return [
              {severity: 8, message: 'JSON syntax error'},
              {severity: 4, message: 'Schema validation error'},
              {severity: 2, message: 'Informational marker'},
            ];
          },
        },
      };
    });

    await expect(getSevereMonacoMarkers(page)).resolves.toEqual([
      'JSON syntax error',
      'Schema validation error',
    ]);
    await expect(
      page.evaluate(() => (window as MarkerHarnessWindow).__markerCallCount),
    ).resolves.toBe(1);
  });
});
