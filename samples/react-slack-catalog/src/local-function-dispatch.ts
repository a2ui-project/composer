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

import {type Action, type ComponentContext} from '@a2ui/web_core/v0_9';
import {DiagnosticCode, DiagnosticLevel, type PreviewDiagnostic} from './preview-snapshot';

/** What running a local function action reported. */
interface LocalFunctionDispatchResult {
  /** The function's errors, if it failed. */
  readonly diagnostics?: PreviewDiagnostic[];
}

interface SurfaceError {
  code?: string;
  message?: string;
  expression?: string;
}

/**
 * Runs an A2UI function-call action, such as `formatString`, in the preview
 * instead of sending it to Composer. The sample's functions only read the data
 * model, so running one has no effect beyond any errors it reports.
 *
 * @param componentId The component the action came from, for the diagnostics.
 */
export function dispatchReadOnlyLocalFunctionAction(
  context: ComponentContext,
  action: Action,
  componentId?: string,
): LocalFunctionDispatchResult {
  if (!('functionCall' in action)) {
    return {};
  }

  const errors: SurfaceError[] = [];
  const subscription = context.dataContext.surface.onError.subscribe(error => {
    errors.push(isSurfaceError(error) ? error : {message: String(error)});
  });

  try {
    context.dataContext.resolveAction(action);
  } catch (error) {
    errors.push({
      code: DiagnosticCode.A2UI_LOCAL_FUNCTION_ERROR,
      message: error instanceof Error ? error.message : String(error),
      expression: action.functionCall.call,
    });
  } finally {
    subscription.unsubscribe();
  }

  const diagnostics = errors.map(error => localFunctionDiagnostic(error, componentId));
  return diagnostics.length > 0 ? {diagnostics} : {};
}

function localFunctionDiagnostic(error: SurfaceError, componentId?: string): PreviewDiagnostic {
  return {
    level: DiagnosticLevel.ERROR,
    code: error.code ?? DiagnosticCode.A2UI_LOCAL_FUNCTION_ERROR,
    message: localFunctionDiagnosticMessage(error),
    componentId,
  };
}

function localFunctionDiagnosticMessage(error: SurfaceError): string {
  const expression = error.expression ? ` "${error.expression}"` : '';
  const message = error.message ?? 'Unknown local function failure.';
  return `Failed to dispatch local A2UI function${expression}: ${message}`;
}

function isSurfaceError(value: unknown): value is SurfaceError {
  return typeof value === 'object' && value !== null;
}
