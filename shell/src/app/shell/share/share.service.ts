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

import {DOCUMENT} from '@angular/common';
import {Injectable, inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StateSync} from '../../chat/state-sync/state-sync';
import {QueryParser} from '../query-parser/query-parser';
import {StartupConfigStateService} from '../startup-resolution/state/startup-config-state.service';
import {
  ShareTrackingStatus,
  UsageTrackingService,
} from '../../usage-tracking/usage-tracking.service';

const SNACK_BAR_DURATION_MS = 5000;

/**
 * Encapsulates clipboard access to provide a streamlined dependency-injected utility for copying JSON structures and emitting success snackbars.
 */
@Injectable({providedIn: 'root'})
export class ShareService {
  private readonly document = inject(DOCUMENT);
  private readonly snackBar = inject(MatSnackBar);
  private readonly stateSync = inject(StateSync);
  private readonly startupConfigState = inject(StartupConfigStateService);
  private readonly usageTrackingService = inject(UsageTrackingService);

  /**
   * Generates a sharable link encoding the current state draft, and copies it to clipboard.
   */
  async shareDesign(): Promise<void> {
    const href = this.document.defaultView?.location.href;
    if (!href) {
      return;
    }

    const activeDraft = this.stateSync.activeDraft() || '';
    try {
      JSON.parse(activeDraft);
    } catch {
      this.usageTrackingService.trackShareDesign({
        status: ShareTrackingStatus.INVALID_JSON,
        compressedLengthChars: 0,
      });
      this.snackBar.open('Cannot share design: invalid JSON syntax', 'Close', {
        duration: SNACK_BAR_DURATION_MS,
      });
      return;
    }

    let compressedLengthChars = 0;
    try {
      const rendererUrl = this.startupConfigState.resolvedUrl() || '';
      const selectedId = this.startupConfigState.selectedRendererId() ?? null;
      const compressed = await QueryParser.encodeSharedPayload(activeDraft);
      const shareUrl = new URL(href);
      const hashParams = new URLSearchParams();
      if (rendererUrl) {
        hashParams.set('renderer', rendererUrl);
      }
      if (selectedId) {
        hashParams.set('rendererId', selectedId);
      }
      hashParams.set('a2ui', compressed);
      shareUrl.hash = hashParams.toString();
      shareUrl.search = '';

      compressedLengthChars = compressed.length;
      const sizeKb = (shareUrl.toString().length / 1024).toFixed(1);

      await navigator.clipboard.writeText(shareUrl.toString());
      this.usageTrackingService.trackShareDesign({
        status: ShareTrackingStatus.SUCCESS,
        compressedLengthChars,
      });
      this.snackBar.open(`Shareable link copied to clipboard (${sizeKb} KB)`, 'Close', {
        duration: SNACK_BAR_DURATION_MS,
      });
    } catch (err) {
      this.usageTrackingService.trackShareDesign({
        status: ShareTrackingStatus.FAILURE,
        compressedLengthChars,
      });
      console.error('Failed to copy shareable link:', err);
      this.snackBar.open('Failed to copy link to clipboard', 'Close', {
        duration: SNACK_BAR_DURATION_MS,
      });
      throw err;
    }
  }
}
