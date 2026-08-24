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

import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {A2aInputArea} from './input-area';
import {A2aInputAreaHarness} from './test/input-area.harness';

describe('A2aInputArea', () => {
  let fixture: ComponentFixture<A2aInputArea>;
  let harness: A2aInputAreaHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [A2aInputArea],
    }).compileComponents();

    fixture = TestBed.createComponent(A2aInputArea);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, A2aInputAreaHarness);
  });

  it('disables send button when text is empty', async () => {
    expect(await harness.isSendDisabled()).toBe(true);
  });

  it('enables send button when text is typed and emits sendMessage on Enter', async () => {
    const spy = vi.spyOn(fixture.componentInstance.sendMessage, 'emit');
    await harness.setInputValue('Hello agent');
    expect(await harness.isSendDisabled()).toBe(false);

    await harness.sendEnter();
    expect(spy).toHaveBeenCalledWith({
      text: 'Hello agent',
      images: [],
    });
    expect(await harness.getInputValue()).toBe('');
  });

  it('does not send on Shift+Enter', async () => {
    const spy = vi.spyOn(fixture.componentInstance.sendMessage, 'emit');
    await harness.setInputValue('Multi\nline');
    await harness.sendShiftEnter();
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits sendMessage when send button is clicked', async () => {
    const spy = vi.spyOn(fixture.componentInstance.sendMessage, 'emit');
    await harness.setInputValue('Test click');
    await harness.clickSend();
    expect(spy).toHaveBeenCalledWith({
      text: 'Test click',
      images: [],
    });
  });

  it('shows stop button and emits stopGeneration during streaming', async () => {
    const spy = vi.spyOn(fixture.componentInstance.stopGeneration, 'emit');
    fixture.componentRef.setInput('isStreaming', true);
    fixture.detectChanges();

    await harness.clickStop();
    expect(spy).toHaveBeenCalled();
  });

  it('handles image attachments and removal', async () => {
    fixture.componentInstance['attachedImages'].set([
      {
        name: 'test.png',
        mimeType: 'image/png',
        data: 'base64data',
        previewUrl: 'data:image/png;base64,base64data',
      },
    ]);
    fixture.detectChanges();

    expect(await harness.getImageChipCount()).toBe(1);

    fixture.componentInstance['removeAttachedImage'](0);
    fixture.detectChanges();

    expect(await harness.getImageChipCount()).toBe(0);
  });

  it('triggers file input click on attach button click', async () => {
    const fileInput = fixture.componentInstance['fileInputRef']()?.nativeElement;
    if (fileInput) {
      const clickSpy = vi.spyOn(fileInput, 'click');
      await harness.clickAttach();
      expect(clickSpy).toHaveBeenCalled();
    }
  });

  it('handles file selection for image files and ignores non-images', async () => {
    const imgFile = new File(['image-content'], 'sample.png', {type: 'image/png'});
    const txtFile = new File(['text-content'], 'sample.txt', {type: 'text/plain'});
    const event = {
      target: {
        files: [imgFile, txtFile],
        value: '',
      },
    } as unknown as Event;

    await fixture.componentInstance['handleFileSelection'](event);
    expect(fixture.componentInstance['attachedImages']().length).toBe(1);
    expect(fixture.componentInstance['attachedImages']()[0].name).toBe('sample.png');

    // Handle empty file selection
    const emptyEvent = {
      target: {
        files: [],
        value: '',
      },
    } as unknown as Event;
    await fixture.componentInstance['handleFileSelection'](emptyEvent);
    expect(fixture.componentInstance['attachedImages']().length).toBe(1);
  });
});
