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

import {
  ComponentContext,
  MessageProcessor,
  type A2uiClientAction,
  type A2uiMessage,
  type Action,
  type SurfaceModel,
} from '@a2ui/web_core/v0_9';
import {describe, expect, it, vi} from 'vitest';
import {SLACK_CATALOG_ID, slackCatalog} from './catalog';
import {dispatchReadOnlyLocalFunctionAction} from './local-function-dispatch';

const createSurface = (surfaceId = 'test-surface'): A2uiMessage => ({
  version: 'v0.9',
  createSurface: {
    surfaceId,
    catalogId: SLACK_CATALOG_ID,
  },
});

const createRootComponent = (surfaceId = 'test-surface'): A2uiMessage => ({
  version: 'v0.9',
  updateComponents: {
    surfaceId,
    components: [
      {
        id: 'root',
        component: 'Text',
        text: 'Ready',
      },
    ],
  },
});

const componentContext = (
  actionHandler = vi.fn<(action: A2uiClientAction) => void>(),
): ComponentContext => {
  const processor = new MessageProcessor([slackCatalog], actionHandler);
  processor.processMessages([createSurface(), createRootComponent()]);
  const surface = [...processor.model.surfacesMap.values()][0] as SurfaceModel;
  return new ComponentContext(surface, 'root', '/');
};

describe('dispatchReadOnlyLocalFunctionAction', () => {
  it('evaluates supported read-only functions without emitting client actions', () => {
    const actionHandler = vi.fn<(action: A2uiClientAction) => void>();
    const context = componentContext(actionHandler);
    const action: Action = {
      functionCall: {
        call: 'formatString',
        args: {
          value: 'Ready for ${name}',
          name: 'Slack',
        },
        returnType: 'string',
      },
    };

    const result = dispatchReadOnlyLocalFunctionAction(context, action, 'root');

    expect(result).toEqual({});
    expect(actionHandler).not.toHaveBeenCalled();
  });

  it('converts unsupported function reports from Web Core into diagnostics', () => {
    const context = componentContext();
    const action: Action = {
      functionCall: {
        call: 'missingFunction',
        args: {},
        returnType: 'string',
      },
    };

    const result = dispatchReadOnlyLocalFunctionAction(context, action, 'root');

    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        level: 'error',
        code: 'EXPRESSION_ERROR',
        componentId: 'root',
      }),
    ]);
    expect(result.diagnostics?.[0]?.message).toContain('missingFunction');
  });

  it('converts reported expression failures into diagnostics', () => {
    const context = componentContext();
    const action: Action = {
      functionCall: {
        call: 'regex',
        args: {
          value: 'abc',
          pattern: '[',
        },
        returnType: 'boolean',
      },
    };

    const result = dispatchReadOnlyLocalFunctionAction(context, action, 'root');

    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        level: 'error',
        code: 'EXPRESSION_ERROR',
        componentId: 'root',
      }),
    ]);
    expect(result.diagnostics?.[0]?.message).toContain('Invalid regex pattern');
  });
});
