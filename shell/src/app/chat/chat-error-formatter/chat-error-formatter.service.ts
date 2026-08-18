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

/**
 * Represents an error received while chatting with the LLM.
 */
export interface ParsedChatError {
  errorTitle: string;
  errorMessage: string;
  errorTip: string;
  isRetryable: boolean;
  showDetails: boolean;
  errorDetails?: string;
  isConnectivityFailure: boolean;
}

/**
 * Checks chat messages for errors.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatErrorFormatterService {
  /**
   * Determines whether the given lowercased message indicates a connectivity or backend error.
   */
  isConnectivityError(lowerMsg: string | null | undefined): boolean {
    if (!lowerMsg) {
      return false;
    }
    return (
      lowerMsg.includes('failed to fetch') ||
      lowerMsg.includes('fetch') ||
      lowerMsg.includes('timeout') ||
      lowerMsg.includes('504') ||
      lowerMsg.includes('proxy') ||
      lowerMsg.includes('networkerror') ||
      lowerMsg.includes('connection') ||
      lowerMsg.includes('401') ||
      lowerMsg.includes('403') ||
      lowerMsg.includes('credential') ||
      lowerMsg.includes('quota') ||
      lowerMsg.includes('blocked') ||
      lowerMsg.includes('503') ||
      lowerMsg.includes('unavailable') ||
      lowerMsg.includes('api key') ||
      lowerMsg.includes('apikey')
    );
  }

  /**
   * Parses error messages into a structured ParsedChatError object.
   */
  parseError(
    lowerMsg: string | null | undefined,
    cleanMsg: string | null | undefined,
    hasOriginalPrompt = false,
  ): ParsedChatError {
    const safeLowerMsg = lowerMsg ?? '';
    const safeCleanMsg = cleanMsg ?? '';

    // Default values (Connectivity Failure)
    const errorTitle = 'Connectivity Failure';
    const isJson = safeCleanMsg.trim().startsWith('{');
    const errorMessage = isJson ? 'A connectivity error occurred.' : safeCleanMsg;
    const errorDetails = isJson ? 'Details: ' + safeCleanMsg : undefined;
    const errorTip =
      'Tip: Please check your network proxy configurations or verify your settings to restore connections.';
    const isRetryable = hasOriginalPrompt;
    const showDetails = true;
    const isConnectivityFailure = this.isConnectivityError(safeLowerMsg);

    const isValidationError =
      safeLowerMsg.includes('validation') ||
      safeLowerMsg.includes('syntax recovery') ||
      safeLowerMsg.includes('validation failure');

    if (isValidationError) {
      return {
        errorTitle: 'Validation Failure',
        errorMessage: 'The generated layout contains invalid components or structure.',
        errorTip:
          'Tip: Try rephrasing your prompt to guide the model to generate valid components.',
        isRetryable: hasOriginalPrompt,
        showDetails: true,
        errorDetails: 'Details: ' + safeCleanMsg,
        isConnectivityFailure,
      };
    }

    if (safeLowerMsg.includes('503') || safeLowerMsg.includes('unavailable')) {
      return {
        errorTitle: 'Service Unavailable',
        errorMessage: 'The generative service is temporarily unavailable. Please try again later.',
        errorTip: '',
        isRetryable: true,
        showDetails: false,
        isConnectivityFailure,
      };
    }

    if (safeLowerMsg.includes('high demand')) {
      return {
        errorTitle: 'Model High Demand',
        errorMessage:
          'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
        errorTip: '',
        isRetryable: true,
        showDetails: false,
        isConnectivityFailure,
      };
    }

    if (safeLowerMsg.includes('timeout') || safeLowerMsg.includes('504')) {
      return {
        errorTitle: 'REST Gateway Timeout',
        errorMessage: 'Remote generation service did not respond.',
        errorDetails: 'Details: ' + safeCleanMsg,
        errorTip,
        isRetryable,
        showDetails: true,
        isConnectivityFailure,
      };
    }

    if (safeLowerMsg.includes('api key') || safeLowerMsg.includes('apikey')) {
      return {
        errorTitle: 'Invalid API Key',
        errorMessage: 'The provided Gemini API key is invalid or missing.',
        errorDetails: 'Details: ' + safeCleanMsg,
        errorTip:
          'Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.',
        isRetryable,
        showDetails: true,
        isConnectivityFailure,
      };
    }

    if (
      safeLowerMsg.includes('auth') ||
      safeLowerMsg.includes('401') ||
      safeLowerMsg.includes('403') ||
      safeLowerMsg.includes('credential')
    ) {
      return {
        errorTitle: 'Authentication Refused',
        errorMessage: 'Authentication failed. Please verify your credentials in Settings.',
        errorDetails: 'Details: ' + safeCleanMsg,
        errorTip,
        isRetryable,
        showDetails: true,
        isConnectivityFailure,
      };
    }

    if (
      safeLowerMsg.includes('quota') ||
      safeLowerMsg.includes('blocked') ||
      safeLowerMsg.includes('429')
    ) {
      return {
        errorTitle: 'GenAI Service Blocked',
        errorMessage: 'Resource quota depleted or content safety limits triggered.',
        errorDetails: 'Details: ' + safeCleanMsg,
        errorTip,
        isRetryable,
        showDetails: true,
        isConnectivityFailure,
      };
    }

    return {
      errorTitle,
      errorMessage,
      errorTip,
      isRetryable,
      showDetails,
      errorDetails,
      isConnectivityFailure,
    };
  }
}
