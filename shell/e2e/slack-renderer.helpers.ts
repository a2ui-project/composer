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

import {readFileSync} from 'node:fs';
import {expect, type FrameLocator, type Locator, type Page} from '@playwright/test';
import {type MonacoModel, type WindowWithMonaco} from './types';

export const SLACK_RENDERER_URL = 'http://127.0.0.1:3459';
export const MONACO_MARKER_DEBOUNCE_MS = 3000;

export const DATA_BOUND_ACTION_JSON = readSlackExample('data-bound-action.json');
export const MARKET_SNAPSHOT_JSON = readSlackExample('market-snapshot.json');

interface OpenSlackRendererOptions {
  forceAuthMode?: '1p' | '3p';
  rendererId?: 'slack' | 'slack-dev';
  selectedApiKeyId?: string;
}

interface MonacoMarker {
  severity: number;
  message: string;
}

interface WindowWithMonacoMarkers extends Window {
  monaco?: {
    editor?: {
      getModels(): MonacoModel[];
      getModelMarkers?: (options?: object) => MonacoMarker[];
    };
  };
}

interface WindowWithSlackRendererStorageSetupError extends Window {
  __a2uiSlackRendererStorageSetupError?: string;
}

function readSlackExample(fileName: string): string {
  return readFileSync(
    new URL(`../../samples/react-slack-catalog/public/examples/${fileName}`, import.meta.url),
    'utf-8',
  ).trim();
}

export async function openComposerWithSlackRenderer(
  page: Page,
  options: OpenSlackRendererOptions = {},
): Promise<void> {
  const forceAuthMode = options.forceAuthMode ?? '1p';
  const rendererId = options.rendererId;
  const selectedApiKeyId = options.selectedApiKeyId;
  await page.addInitScript(
    ({rendererOrigins, authMode, apiKeyId}) => {
      let isTopLevel = false;
      try {
        isTopLevel = window.top === window;
      } catch {
        return;
      }

      if (!isTopLevel) return;

      try {
        localStorage.clear();
        if (authMode === '3p') {
          localStorage.setItem('a2ui_composer_force_3p', 'true');
          localStorage.removeItem('a2ui_composer_force_1p');
          if (apiKeyId) {
            localStorage.setItem('a2ui_composer_selected_api_key', apiKeyId);
          } else {
            localStorage.removeItem('a2ui_composer_selected_api_key');
          }
        } else {
          localStorage.setItem('a2ui_composer_force_1p', 'true');
          localStorage.removeItem('a2ui_composer_force_3p');
          localStorage.removeItem('a2ui_composer_selected_api_key');
        }
        localStorage.setItem('a2ui_composer_allowed_origins', JSON.stringify(rendererOrigins));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const setupError = `Failed to configure Slack renderer E2E localStorage: ${message}`;
        (
          window as unknown as WindowWithSlackRendererStorageSetupError
        ).__a2uiSlackRendererStorageSetupError = setupError;
        throw new Error(setupError);
      }
    },
    {
      rendererOrigins: [new URL(SLACK_RENDERER_URL).origin, 'http://localhost:4200'],
      authMode: forceAuthMode,
      apiKeyId: selectedApiKeyId,
    },
  );

  await page.goto(rendererId ? `/?rendererId=${rendererId}` : `/?renderer=${SLACK_RENDERER_URL}`);
  const storageSetupError = await page.evaluate(() => {
    return (window as unknown as WindowWithSlackRendererStorageSetupError)
      .__a2uiSlackRendererStorageSetupError;
  });
  if (storageSetupError) {
    throw new Error(storageSetupError);
  }
  await expect(page.locator('.workspace-container')).toBeVisible();
  await expect(page.locator('iframe.preview-iframe').first()).toBeVisible();
}

export async function selectGalleryComponent(page: Page, componentName: string): Promise<void> {
  const componentButton = page
    .locator('.catalog-list')
    .getByRole('button', {name: componentName, exact: true});
  await expect(componentButton).toBeVisible();
  await componentButton.click();
  await expect(page.getByRole('heading', {name: componentName, exact: true})).toBeVisible();
}

export function slackPreviewFrame(page: Page): FrameLocator {
  return page.frameLocator('iframe.preview-iframe').first();
}

export function slackPreviewSurface(page: Page): Locator {
  return slackPreviewFrame(page).locator('section[aria-label="Slack preview"]');
}

export function blockKitDetails(page: Page): Locator {
  return slackPreviewFrame(page).locator('details').filter({hasText: 'Generated Block Kit'});
}

export async function waitForMonaco(page: Page): Promise<void> {
  await expect(page.locator('a2ui-composer-monaco-editor .monaco-editor').first()).toBeVisible();
  await page.waitForFunction(() => {
    const monaco = (window as unknown as WindowWithMonaco).monaco;
    return (monaco?.editor?.getModels()?.length ?? 0) > 0;
  });
}

export async function replaceMonacoJson(page: Page, value: string): Promise<void> {
  await page.evaluate(json => {
    const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
    if (!model) {
      throw new Error('Monaco model was not available.');
    }
    model.setValue(json);
  }, value);
}

export async function getSevereMonacoMarkers(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const monaco = (window as unknown as WindowWithMonacoMarkers).monaco;
    const getModelMarkers = monaco?.editor?.getModelMarkers;
    if (typeof getModelMarkers !== 'function') {
      throw new Error('Monaco marker API was not available.');
    }

    const markers = getModelMarkers({});
    return markers
      .filter(marker => marker.severity === 8 || marker.severity === 4)
      .map(marker => marker.message);
  });
}

export async function expectBlockKitJsonToContain(page: Page, expectedText: string): Promise<void> {
  await openGeneratedBlockKit(page);
  await expect(slackPreviewFrame(page).getByTestId('block-kit-json')).toContainText(expectedText);
}

export async function openGeneratedBlockKit(page: Page): Promise<void> {
  await blockKitDetails(page).evaluate((element: HTMLDetailsElement) => {
    element.open = true;
  });
}

export async function getBlockKitJson(page: Page): Promise<unknown> {
  await openGeneratedBlockKit(page);

  const blockKitText = await slackPreviewFrame(page).getByTestId('block-kit-json').textContent();
  if (!blockKitText) {
    throw new Error('Generated Block Kit JSON was empty.');
  }

  return JSON.parse(blockKitText);
}

export async function getBlockKitTextMatches(
  page: Page,
  expectedTexts: string[],
): Promise<string[]> {
  const blockKit = await getBlockKitJson(page);

  return expectedTexts.filter(text => containsStringValue(blockKit, text));
}

export async function getBlockKitActionIds(page: Page): Promise<string[]> {
  const blockKitJson = await getBlockKitJson(page);
  const actionIds: string[] = [];
  collectActionIds(blockKitJson, actionIds);
  return actionIds;
}

function containsStringValue(value: unknown, expectedText: string): boolean {
  if (value === expectedText) return true;

  if (Array.isArray(value)) {
    return value.some(item => containsStringValue(item, expectedText));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).some(child => containsStringValue(child, expectedText));
  }

  return false;
}

function collectActionIds(value: unknown, actionIds: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectActionIds(item, actionIds);
    return;
  }

  if (typeof value !== 'object' || value === null) return;

  for (const [key, child] of Object.entries(value)) {
    if (key === 'action_id' && typeof child === 'string') {
      actionIds.push(child);
    } else {
      collectActionIds(child, actionIds);
    }
  }
}

export function collectUnexpectedErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', error => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(`console.error: ${message.text()}`);
    }
  });
  return errors;
}
