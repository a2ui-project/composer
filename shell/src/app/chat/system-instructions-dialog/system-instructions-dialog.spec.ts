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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {SystemInstructionsDialog} from './system-instructions-dialog';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {SystemInstructionsDialogHarness} from './test/system-instructions-dialog.harness';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MatSnackBar} from '@angular/material/snack-bar';

describe('SystemInstructionsDialog', () => {
  let fixture: ComponentFixture<SystemInstructionsDialog>;
  let component: SystemInstructionsDialog;
  let harness: SystemInstructionsDialogHarness;
  const mockDialogData = 'Test system instructions content text.';
  const mockDialogRef = {
    close: vi.fn(),
  };
  let writeTextSpy: ReturnType<typeof vi.fn>;
  let originalClipboard: typeof navigator.clipboard;
  let mockSnackBar: {open: ReturnType<typeof vi.fn>};

  beforeEach(async () => {
    mockSnackBar = {
      open: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [SystemInstructionsDialog, MatDialogModule],
      providers: [
        provideNoopAnimations(),
        {provide: MAT_DIALOG_DATA, useValue: mockDialogData},
        {provide: MatDialogRef, useValue: mockDialogRef},
        {provide: MatSnackBar, useValue: mockSnackBar},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemInstructionsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SystemInstructionsDialogHarness,
    );

    writeTextSpy = vi.fn();
    originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: {writeText: writeTextSpy},
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', {value: originalClipboard});
    } else {
      Object.defineProperty(navigator, 'clipboard', {value: undefined});
    }
    vi.clearAllMocks();
  });

  it('compiles successfully', () => {
    expect(component).toBeTruthy();
  });

  it('displays the system instructions correctly inside the body', async () => {
    const text = await harness.getInstructions();
    expect(text.trim()).toBe(mockDialogData);
  });

  it('closes the dialog when the close button is clicked', async () => {
    await harness.clickClose();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('renders a copy button and copies instructions to clipboard when clicked, showing a toast', async () => {
    expect(await harness.hasCopyButton()).toBe(true);
    writeTextSpy.mockResolvedValue(undefined);
    await harness.clickCopy();
    expect(writeTextSpy).toHaveBeenCalledWith(mockDialogData);
    expect(mockSnackBar.open).toHaveBeenCalledWith('System instructions copied', undefined, {
      duration: 2000,
    });
  });

  it('resets copied state after 2 seconds', async () => {
    vi.useFakeTimers();
    writeTextSpy.mockResolvedValue(undefined);
    await harness.clickCopy();
    expect(component['copied']()).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(component['copied']()).toBe(false);
    vi.useRealTimers();
  });

  it('clears existing copy timeout on consecutive copies', async () => {
    vi.useFakeTimers();
    writeTextSpy.mockResolvedValue(undefined);

    // First copy
    await harness.clickCopy();
    expect(component['copied']()).toBe(true);

    // Second copy before 2 seconds elapsed
    await harness.clickCopy();
    expect(component['copied']()).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(component['copied']()).toBe(false);
    vi.useRealTimers();
  });

  it('logs an error when Clipboard API is completely unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await harness.clickCopy();
    expect(consoleSpy).toHaveBeenCalledWith('Clipboard API is not available in this environment.');
  });

  it('logs an error when copying to clipboard fails', async () => {
    writeTextSpy.mockRejectedValue(new Error('Clipboard failure'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await harness.clickCopy();
    // Wait for promise microtask queue to run the .catch handler
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to copy system instructions to clipboard: ',
      expect.any(Error),
    );
  });
});

describe('SystemInstructionsDialog with no data', () => {
  let fixture: ComponentFixture<SystemInstructionsDialog>;
  let component: SystemInstructionsDialog;
  let harness: SystemInstructionsDialogHarness;
  const mockDialogRef = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemInstructionsDialog, MatDialogModule],
      providers: [
        provideNoopAnimations(),
        {provide: MAT_DIALOG_DATA, useValue: null},
        {provide: MatDialogRef, useValue: mockDialogRef},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemInstructionsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SystemInstructionsDialogHarness,
    );
  });

  it('does not render a copy button', async () => {
    expect(await harness.hasCopyButton()).toBe(false);
  });

  it('throws an error when attempting to click copy button when it is absent', async () => {
    await expect(harness.clickCopy()).rejects.toThrow('Clipboard copy button is not present');
  });

  it('returns early when copyToClipboard is called with no data', () => {
    const writeSpy = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: {writeText: writeSpy},
      configurable: true,
      writable: true,
    });
    component['copyToClipboard']();
    expect(writeSpy).not.toHaveBeenCalled();
  });
});
