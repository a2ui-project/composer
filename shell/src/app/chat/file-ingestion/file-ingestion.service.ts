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
import {Attachment} from '../llm-client/llm-client';

/**
 * Represents a file attachment that may visually include a preview rendering.
 */
export interface AttachedFile extends Attachment {
  /** Optional data URL for rendering a preview of the attachment. */
  readonly previewUrl?: string;
}

/**
 * Manages the lifecycle of user-provided attachments by reading files from the browser into memory and parsing their contents into base64 structures suitable for large language model prompts.
 */
@Injectable({providedIn: 'root'})
export class FileIngestionService {
  /**
   * Reads a given File object as an AttachedFile.
   *
   * @param file The file to read and attach.
   * @returns A promise resolving to the AttachedFile containing the parsed contents.
   */
  readFileAsAttachment(file: File): Promise<AttachedFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          reject(new Error('Failed to read file.'));
          return;
        }
        const commaIndex = result.indexOf(',');
        if (commaIndex === -1) {
          reject(new Error('Invalid data URL format.'));
          return;
        }
        const base64Data = result.substring(commaIndex + 1);
        resolve({
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data,
          previewUrl: file.type.startsWith('image/') ? result : undefined,
        });
      };
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
