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

import {describe, it, expect, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {FileIngestionService} from './file-ingestion.service';

describe('FileIngestionService', () => {
  let service: FileIngestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileIngestionService);
  });

  it('should read file as attachment', async () => {
    const file = new File(['hello world'], 'test.txt', {type: 'text/plain'});
    const result = await service.readFileAsAttachment(file);

    expect(result.name).toBe('test.txt');
    expect(result.mimeType).toBe('text/plain');
    expect(result.data).toBe(btoa('hello world'));
    expect(result.previewUrl).toBeUndefined();
  });

  it('should read image and return preview url', async () => {
    const file = new File(['blobdata'], 'test.png', {type: 'image/png'});
    const result = await service.readFileAsAttachment(file);

    expect(result.name).toBe('test.png');
    expect(result.mimeType).toBe('image/png');
    expect(result.data).toBe(btoa('blobdata'));
    expect(result.previewUrl).toContain('data:image/png;base64,');
  });
});
