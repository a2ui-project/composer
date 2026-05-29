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
import {SystemInstructionsDialogComponent} from './system-instructions-dialog.component';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {By} from '@angular/platform-browser';

describe('SystemInstructionsDialogComponent', () => {
  let fixture: ComponentFixture<SystemInstructionsDialogComponent>;
  let component: SystemInstructionsDialogComponent;
  const mockDialogData = 'Test system instructions content text.';
  const mockDialogRef = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemInstructionsDialogComponent, MatDialogModule],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: mockDialogData},
        {provide: MatDialogRef, useValue: mockDialogRef},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemInstructionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('compiles successfully', () => {
    expect(component).toBeTruthy();
  });

  it('displays the system instructions correctly inside the body', () => {
    const instructionsEl = fixture.debugElement.query(By.css('.instructions-text'));
    expect(instructionsEl).toBeTruthy();
    expect(instructionsEl.nativeElement.textContent.trim()).toBe(mockDialogData);
  });

  it('renders the scrollable container nested inside the mat-dialog-content container', () => {
    const dialogContentEl = fixture.debugElement.query(By.css('mat-dialog-content'));
    expect(dialogContentEl).toBeTruthy();

    const scrollableEl = dialogContentEl.query(By.css('.dialog-content-scrollable'));
    expect(scrollableEl).toBeTruthy();
    expect(scrollableEl.name).toBe('div');
  });

  it('renders a close button', () => {
    const closeButtonEl = fixture.debugElement.query(By.css('button[mat-dialog-close]'));
    expect(closeButtonEl).toBeTruthy();
    expect(closeButtonEl.nativeElement.textContent.trim()).toBe('Close');
  });
});
