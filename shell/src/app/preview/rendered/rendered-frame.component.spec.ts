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
import {RenderedFrameComponent} from './rendered-frame.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RenderedFrameHarness} from './test/rendered-frame.harness';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {StartupResolutionService} from '../../shell/startup-resolution.service';
import {HostCommunicationService} from '../../shell/host-communication.service';

describe('RenderedFrameComponent', () => {
  let fixture: ComponentFixture<RenderedFrameComponent>;
  let harness: RenderedFrameHarness;
  let startupResolutionServiceMock: Partial<StartupResolutionService>;
  let hostCommunicationServiceMock: Partial<HostCommunicationService>;

  beforeEach(async () => {
    startupResolutionServiceMock = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://localhost:3000/renderer'),
    };

    hostCommunicationServiceMock = {
      registerIframe: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RenderedFrameComponent],
      providers: [
        {
          provide: StartupResolutionService,
          useValue: startupResolutionServiceMock,
        },
        {
          provide: HostCommunicationService,
          useValue: hostCommunicationServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RenderedFrameComponent);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RenderedFrameHarness);
  });

  it('renders the iframe securely bound to the active renderer URL', async () => {
    expect(await harness.hasIframe()).toBe(true);
    expect(await harness.getIframeSrc()).toBe('http://localhost:3000/renderer');
  });

  it('registers the iframe contentWindow with HostCommunicationService upon view initialization', () => {
    expect(hostCommunicationServiceMock.registerIframe).toHaveBeenCalled();
  });

  it('renders a placeholder when no renderer URL is resolved', async () => {
    fixture.destroy();
    startupResolutionServiceMock.getResolvedRendererUrl = vi.fn().mockReturnValue(null);
    const nullFixture = TestBed.createComponent(RenderedFrameComponent);
    nullFixture.detectChanges();
    const nullHarness = await TestbedHarnessEnvironment.harnessForFixture(
      nullFixture,
      RenderedFrameHarness,
    );

    expect(await nullHarness.hasIframe()).toBe(false);
  });
});
