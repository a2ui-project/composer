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

import {Component, computed, input, output} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ProfileConfig} from '../../shell/startup-resolution/startup-resolution';

/**
 * Default tooltip message displayed when profile selection is disabled due to empty profiles.
 */
export const NO_PROFILES_TOOLTIP = 'No profiles available';

/**
 * Option item model for profile selection dropdowns.
 */
export declare interface ProfileOption {
  id: string;
  displayName: string;
}

/**
 * Component for selecting configuration profiles.
 * Provides a dropdown interface to switch between available profile presets
 * or choose custom settings.
 */
@Component({
  selector: 'a2ui-composer-profile-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatTooltipModule],
  templateUrl: './profile-selector.ng.html',
  styleUrl: './profile-selector.scss',
})
export class ProfileSelector {
  readonly profiles = input<Record<string, ProfileConfig> | null | undefined>({});
  readonly selectedProfileId = input<string | null>(null);

  readonly profileSelected = output<string | null>();

  readonly profileOptions = computed<ProfileOption[]>(() => {
    const map = this.profiles();
    if (!map || typeof map !== 'object' || Array.isArray(map)) {
      return [];
    }
    return Object.entries(map).map(([key, config]) => ({
      id: key,
      displayName: config?.displayName || key,
    }));
  });

  readonly isEmpty = computed<boolean>(() => this.profileOptions().length === 0);

  readonly isDisabled = computed<boolean>(() => this.isEmpty());

  readonly tooltipMessage = computed<string>(() => (this.isEmpty() ? NO_PROFILES_TOOLTIP : ''));

  onSelectionChange(value: string | null): void {
    this.profileSelected.emit(value);
  }
}
