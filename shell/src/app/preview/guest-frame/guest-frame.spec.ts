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

import {Component, signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {PreviewBridgeMessageType, type SurfaceResizePayload} from 'a2ui-bridge';

import {ReplaySubject} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  DefaultTarget,
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {bridgeEnvelope, surfaceResizeEnvelope} from '../testing/bridge-envelopes';
import {showGuestDocument} from '../testing/guest-document';
import {buildRendererUrl} from '../renderer-url';
import {GuestFrame} from './guest-frame';
import {GuestFrameHarness} from './test/guest-frame.harness';

const RENDERER_URL = 'http://localhost:3000/renderer';
const RENDERER_ORIGIN = 'http://localhost:3000';
const PAYLOAD = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
const NEXT_PAYLOAD = [{version: 'v0.9', createSurface: {surfaceId: 's2', catalogId: 'c1'}}];

/** One output emission, as the host saw it. */
type FrameEvent =
  | {output: 'surfaceResize'; report: SurfaceResizePayload}
  | {output: 'rendererReady'}
  | {output: 'renderSuccess'}
  | {output: 'renderError'}
  | {output: 'documentReplaced'};

/** Hosts a GuestFrame the way RenderedFrame and DemoCard do, recording its outputs. */
@Component({
  standalone: true,
  imports: [GuestFrame],
  template: `
    <a2ui-composer-guest-frame
      [payload]="payload()"
      [defaultTarget]="defaultTarget"
      [frameTitle]="'Test preview'"
      (surfaceResize)="record({output: 'surfaceResize', report: $event})"
      (rendererReady)="record({output: 'rendererReady'})"
      (renderSuccess)="record({output: 'renderSuccess'})"
      (renderError)="record({output: 'renderError'})"
      (documentReplaced)="record({output: 'documentReplaced'})"
    >
      <p>No renderer</p>
    </a2ui-composer-guest-frame>
  `,
})
class TestHost {
  readonly payload = signal<unknown[] | null>(null);
  defaultTarget = DefaultTarget.REPLACE;
  readonly events: FrameEvent[] = [];
  /** Called with each emission as it happens, for checks on ordering. */
  onEvent: (event: FrameEvent) => void = () => {};

  protected record(event: FrameEvent): void {
    this.events.push(event);
    this.onEvent(event);
  }
}

describe('GuestFrame', () => {
  let resolvedUrl: WritableSignal<string | null>;
  let themePreference: WritableSignal<ThemePreference>;

  beforeEach(() => {
    resolvedUrl = signal<string | null>(RENDERER_URL);
    themePreference = signal(ThemePreference.LIGHT);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function configure(hostCommunication: Partial<HostCommunication> | null): void {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [
        {
          provide: StartupResolution,
          useValue: {resolvedUrl, getResolvedRendererUrl: () => resolvedUrl()},
        },
        {provide: AppConfigProvider, useValue: {themePreference}},
        ...(hostCommunication ? [{provide: HostCommunication, useValue: hostCommunication}] : []),
      ],
    });
  }

  interface MountedFrame {
    fixture: ComponentFixture<TestHost>;
    harness: GuestFrameHarness;
  }

  async function mount(setUp: (host: TestHost) => void = () => {}): Promise<MountedFrame> {
    const fixture = TestBed.createComponent(TestHost);
    setUp(fixture.componentInstance);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, GuestFrameHarness);
    const iframe = await harness.getIframe();
    if (iframe) {
      showGuestDocument(
        TestbedHarnessEnvironment.getNativeElement(iframe) as HTMLIFrameElement,
        'renderer',
      );
    }
    return {fixture, harness};
  }

  async function iframeOf(harness: GuestFrameHarness): Promise<HTMLIFrameElement> {
    const iframe = await harness.getIframe();
    if (!iframe) throw new Error('The guest frame has no iframe.');
    return TestbedHarnessEnvironment.getNativeElement(iframe) as HTMLIFrameElement;
  }

  describe('with a stubbed HostCommunication', () => {
    let messages: ReplaySubject<MessageEnvelope>;
    let hostCommunication: {
      registerIframe: ReturnType<typeof vi.fn>;
      unregisterIframe: ReturnType<typeof vi.fn>;
      sendRenderA2UI: ReturnType<typeof vi.fn>;
      messageStream$: ReplaySubject<MessageEnvelope>;
    };

    beforeEach(() => {
      messages = new ReplaySubject<MessageEnvelope>(1);
      hostCommunication = {
        registerIframe: vi.fn(),
        unregisterIframe: vi.fn(),
        sendRenderA2UI: vi.fn(),
        messageStream$: messages,
      };
      configure(hostCommunication as unknown as Partial<HostCommunication>);
    });

    /** Delivers an envelope from `iframe`'s own window and renders. */
    function fromGuest(
      fixture: ComponentFixture<TestHost>,
      iframe: HTMLIFrameElement,
      type: PreviewBridgeMessageType,
      payload: unknown = {},
      {render = true} = {},
    ): void {
      messages.next(bridgeEnvelope(type, payload, {sourceWindow: iframe.contentWindow!}));
      if (render) fixture.detectChanges();
    }

    describe('iframe and URL', () => {
      it('loads the sandboxed renderer at the URL buildRendererUrl gives', async () => {
        const {harness} = await mount();
        const logger = {error: vi.fn(), warn: vi.fn(), info: vi.fn(), log: vi.fn()};

        expect(await harness.getIframeSrc()).toBe(
          buildRendererUrl(RENDERER_URL, ThemePreference.LIGHT, logger),
        );
        expect(await harness.getIframeSandbox()).toBe(
          'allow-scripts allow-same-origin allow-forms',
        );
        expect(await harness.getIframeTitle()).toBe('Test preview');
      });

      it('shows the content its host projects while there is no renderer URL', async () => {
        resolvedUrl.set(null);
        const {harness} = await mount();

        expect(await harness.hasIframe()).toBe(false);
        expect(await harness.getText()).toBe('No renderer');
      });

      it('fails closed when the renderer URL is unsafe', async () => {
        resolvedUrl.set('javascript:alert(1)');
        const {harness} = await mount();

        expect(await harness.hasIframe()).toBe(false);
        expect(await harness.getText()).toBe('No renderer');
      });

      it('keeps its URL when the theme changes', async () => {
        const {fixture, harness} = await mount();
        const src = await harness.getIframeSrc();

        themePreference.set(ThemePreference.DARK);
        fixture.detectChanges();

        // A reload would lose the guest's state; the theme travels as SET_THEME,
        // which HostCommunication broadcasts to every frame on the page.
        expect(await harness.getIframeSrc()).toBe(src);
      });
    });

    describe('registration', () => {
      it('registers its iframe as the default target unless told otherwise', async () => {
        const {harness} = await mount();

        expect(hostCommunication.registerIframe).toHaveBeenCalledTimes(1);
        expect(hostCommunication.registerIframe).toHaveBeenCalledWith(
          await iframeOf(harness),
          DefaultTarget.REPLACE,
        );
      });

      it('registers with DefaultTarget.KEEP when its host asks', async () => {
        const {harness} = await mount(host => (host.defaultTarget = DefaultTarget.KEEP));

        expect(hostCommunication.registerIframe).toHaveBeenCalledWith(
          await iframeOf(harness),
          DefaultTarget.KEEP,
        );
      });

      it('unregisters its iframe when destroyed', async () => {
        const {fixture, harness} = await mount();
        const iframe = await iframeOf(harness);

        fixture.destroy();

        expect(hostCommunication.unregisterIframe).toHaveBeenCalledWith(iframe);
      });

      it('registers nothing while there is no renderer URL', async () => {
        resolvedUrl.set(null);
        await mount();

        expect(hostCommunication.registerIframe).not.toHaveBeenCalled();
      });

      it('re-registers its iframe when the renderer URL changes or the document reloads', async () => {
        const {fixture, harness} = await mount();
        const iframe = await iframeOf(harness);
        expect(hostCommunication.registerIframe).toHaveBeenCalledTimes(1);

        resolvedUrl.set('http://localhost:3000/other-renderer');
        fixture.detectChanges();
        expect(hostCommunication.registerIframe).toHaveBeenCalledTimes(2);
        expect(hostCommunication.registerIframe).toHaveBeenLastCalledWith(
          iframe,
          DefaultTarget.REPLACE,
        );

        await harness.simulateFrameLoad();
        await harness.simulateFrameLoad();
        expect(hostCommunication.registerIframe).toHaveBeenCalledTimes(3);
      });
    });

    describe('payload sends', () => {
      it('sends once for READY, load, READY', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        expect(hostCommunication.sendRenderA2UI).not.toHaveBeenCalled();

        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        await harness.simulateFrameLoad();
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledWith(PAYLOAD, iframe);
      });

      it('sends once for load, READY, READY', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);

        await harness.simulateFrameLoad();
        expect(hostCommunication.sendRenderA2UI).not.toHaveBeenCalled();
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledWith(PAYLOAD, iframe);
      });

      it('holds a payload that changes before READY and sends only the latest on READY', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);

        fixture.componentInstance.payload.set(NEXT_PAYLOAD);
        fixture.detectChanges();
        // Sent now, HostCommunication would queue it and flush it on READY, on top
        // of the send READY itself makes.
        expect(hostCommunication.sendRenderA2UI).not.toHaveBeenCalled();

        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledWith(NEXT_PAYLOAD, iframe);
      });

      it('sends a payload that changes after READY at once', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

        fixture.componentInstance.payload.set(NEXT_PAYLOAD);
        fixture.detectChanges();

        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(NEXT_PAYLOAD, iframe);
      });

      it('sends a payload that arrives after an empty READY', async () => {
        const {fixture, harness} = await mount();
        const iframe = await iframeOf(harness);

        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        fixture.componentInstance.payload.set([]);
        fixture.detectChanges();
        expect(hostCommunication.sendRenderA2UI).not.toHaveBeenCalled();

        // A guest that announces itself once still gets a payload that comes later.
        fixture.componentInstance.payload.set(PAYLOAD);
        fixture.detectChanges();
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledWith(PAYLOAD, iframe);

        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);
      });

      it('re-arms on a renderer URL change without sending, then sends on the new READY', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);

        resolvedUrl.set('http://localhost:3000/other-renderer');
        fixture.detectChanges();
        expect(await harness.getIframeSrc()).toContain('/other-renderer');
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);

        // The new document has not announced itself, so a payload change waits.
        fixture.componentInstance.payload.set(NEXT_PAYLOAD);
        fixture.detectChanges();
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);

        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(NEXT_PAYLOAD, iframe);
      });

      it('sends again after a reload, when the first document announced itself before its load', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        await harness.simulateFrameLoad();

        // A second load of the same URL is a second document.
        await harness.simulateFrameLoad();
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
      });

      it('sends again after a reload, when the first document loaded before it announced itself', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        await harness.simulateFrameLoad();
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

        // The usual order for the bundled renderers, which announce themselves
        // after their load; a frame reload or a renderer dev server's live
        // reload loads the same URL again.
        await harness.simulateFrameLoad();
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(PAYLOAD, iframe);
      });

      it('holds a payload change between a reload and its READY', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        await harness.simulateFrameLoad();
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        await harness.simulateFrameLoad();

        // The reloaded renderer ignores RENDER_A2UI until it has attached.
        fixture.componentInstance.payload.set(NEXT_PAYLOAD);
        fixture.detectChanges();
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);

        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
        expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(NEXT_PAYLOAD, iframe);
      });

      describe('a reload that announces itself before its load', () => {
        /**
         * A guest that announced itself before its first load (as one does when a
         * webfont holds that load back) reloads with the same order: its READY
         * comes before the second load, so it looks like a repeat of the first.
         */
        async function reloadAnnouncedBeforeLoad(): Promise<
          MountedFrame & {iframe: HTMLIFrameElement}
        > {
          const mounted = await mount(host => host.payload.set(PAYLOAD));
          const iframe = await iframeOf(mounted.harness);
          fromGuest(mounted.fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          await mounted.harness.simulateFrameLoad();
          fromGuest(mounted.fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          await mounted.harness.simulateFrameLoad();
          return {...mounted, iframe};
        }

        it('immediately re-sends the current payload on load without waiting for a repeat READY or payload change', async () => {
          const {iframe} = await reloadAnnouncedBeforeLoad();

          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(PAYLOAD, iframe);
        });

        it('delivers the payload on READY #3 when a StrictMode guest (READY #1 -> load #1 -> READY #2) reloads with load #2 before READY #3', async () => {
          const {fixture, iframe} = await reloadAnnouncedBeforeLoad();
          // If READY #2 was Document 1's post-load StrictMode repeat and load #2
          // was Document 2's load before READY #3, Document 2 was not listening
          // at load #2 and needs the payload when its READY #3 arrives.
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(3);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(PAYLOAD, iframe);

          // A StrictMode repeat READY #4 on Document 2 does not send again.
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(3);
        });

        it('resets on load #2 and waits for READY #3 when Document 1 completed rendering after its StrictMode repeat READY #2', async () => {
          const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
          const iframe = await iframeOf(harness);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          await harness.simulateFrameLoad();
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDER_SUCCESS);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);

          await harness.simulateFrameLoad();
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);

          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(PAYLOAD, iframe);
        });

        it('delivers the payload on load #2 without revoking readiness when Document 1 loaded before READY #1 and Document 2 announced READY #2 before load #2', async () => {
          const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
          const iframe = await iframeOf(harness);
          // Document 1: load #1 -> READY #1
          await harness.simulateFrameLoad();
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);
          hostCommunication.registerIframe.mockClear();

          // Document 2: READY #2 -> load #2
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          await harness.simulateFrameLoad();

          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(PAYLOAD, iframe);
          expect(hostCommunication.registerIframe).not.toHaveBeenCalled();
        });

        it('gets the next payload change at once', async () => {
          const {fixture, iframe} = await reloadAnnouncedBeforeLoad();

          fixture.componentInstance.payload.set(NEXT_PAYLOAD);
          fixture.detectChanges();

          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(3);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(NEXT_PAYLOAD, iframe);
        });

        it('delivers the payload on READY #3 after a StrictMode guest loaded before its two READY announcements, both with and without RENDER_SUCCESS', async () => {
          const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
          const iframe = await iframeOf(harness);
          // First document (React StrictMode): load -> READY #1 -> READY #2 -> RENDER_SUCCESS
          await harness.simulateFrameLoad();
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDER_SUCCESS);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);

          // Reloaded document: load arrives before the new document's READY.
          await harness.simulateFrameLoad();
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);

          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(PAYLOAD, iframe);

          // Reload again before RENDER_SUCCESS arrives after the StrictMode repeat READY:
          // load #3 sends in case READY was pre-load, and READY #5 still delivers to the new document.
          await harness.simulateFrameLoad();
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(3);

          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(4);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(PAYLOAD, iframe);
        });
      });

      it("ignores the load of the iframe's initial about:blank document", async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        showGuestDocument(iframe, 'initial-blank');
        await harness.simulateFrameLoad();
        showGuestDocument(iframe, 'renderer');

        // The renderer announces itself before its own load, as it does when
        // a webfont holds that load back.
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        await harness.simulateFrameLoad();
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);
      });

      it('does not re-send when its guest answers a catalog request', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

        fromGuest(fixture, iframe, PreviewBridgeMessageType.A2UI_CATALOG, {catalogId: 'c1'});

        expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);
        expect(fixture.componentInstance.events).toEqual([{output: 'rendererReady'}]);
      });

      describe('a payload change with the content the document already has', () => {
        it('is not sent again', async () => {
          const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
          const iframe = await iframeOf(harness);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

          // A host can rebuild an equal payload, as the A2A chat does when it
          // partitions its messages again once the first catalog resolves. A
          // second RENDER_A2UI would replay createSurface and drop typed input.
          fixture.componentInstance.payload.set(structuredClone(PAYLOAD));
          fixture.detectChanges();

          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);
        });

        it('is not sent again when only its key order differs', async () => {
          const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
          const iframe = await iframeOf(harness);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

          fixture.componentInstance.payload.set([
            {createSurface: {catalogId: 'c1', surfaceId: 's1'}, version: 'v0.9'},
          ]);
          fixture.detectChanges();

          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);
        });

        it('is compared with the last payload sent, not the first', async () => {
          const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
          const iframe = await iframeOf(harness);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

          fixture.componentInstance.payload.set(NEXT_PAYLOAD);
          fixture.detectChanges();
          fixture.componentInstance.payload.set(structuredClone(PAYLOAD));
          fixture.detectChanges();

          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(3);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(PAYLOAD, iframe);
        });

        it('is sent again after the payload is cleared to null or empty and then restored', async () => {
          const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
          const iframe = await iframeOf(harness);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(1);

          fixture.componentInstance.payload.set(null);
          fixture.detectChanges();
          fixture.componentInstance.payload.set(structuredClone(PAYLOAD));
          fixture.detectChanges();
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(PAYLOAD, iframe);

          fixture.componentInstance.payload.set([]);
          fixture.detectChanges();
          fixture.componentInstance.payload.set(structuredClone(PAYLOAD));
          fixture.detectChanges();
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(3);
          expect(hostCommunication.sendRenderA2UI).toHaveBeenLastCalledWith(PAYLOAD, iframe);
        });

        it('is sent to a new document after a renderer URL change', async () => {
          const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
          const iframe = await iframeOf(harness);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

          resolvedUrl.set('http://localhost:3000/other-renderer');
          fixture.detectChanges();
          fixture.componentInstance.payload.set(structuredClone(PAYLOAD));
          fixture.detectChanges();
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
        });

        it('reaches a document that reloaded with its load before READY', async () => {
          const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
          const iframe = await iframeOf(harness);
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
          await harness.simulateFrameLoad();
          await harness.simulateFrameLoad();

          fixture.componentInstance.payload.set(structuredClone(PAYLOAD));
          fixture.detectChanges();
          fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

          // Nothing has been sent to the reloaded document, so the equal
          // payload is new to it, whether it goes now or on its READY.
          expect(hostCommunication.sendRenderA2UI).toHaveBeenCalledTimes(2);
        });
      });
    });

    describe('inbound filtering', () => {
      it('drops envelopes that name no source window', async () => {
        const {fixture} = await mount(host => host.payload.set(PAYLOAD));

        messages.next(bridgeEnvelope(PreviewBridgeMessageType.RENDERER_READY));
        messages.next(surfaceResizeEnvelope(320));
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([]);
        expect(hostCommunication.sendRenderA2UI).not.toHaveBeenCalled();
      });

      it('drops envelopes from another window', async () => {
        const {fixture} = await mount(host => host.payload.set(PAYLOAD));
        const otherWindow = {postMessage: vi.fn()} as unknown as Window;

        messages.next(
          bridgeEnvelope(PreviewBridgeMessageType.RENDERER_READY, {}, {sourceWindow: otherWindow}),
        );
        messages.next(surfaceResizeEnvelope(320, {sourceWindow: otherWindow}));
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([]);
        expect(hostCommunication.sendRenderA2UI).not.toHaveBeenCalled();
      });

      it('drops an envelope replayed before its iframe exists', async () => {
        // HostCommunication replays its last envelope to every new subscriber,
        // which reaches the frame before its own iframe is rendered.
        const otherWindow = {postMessage: vi.fn()} as unknown as Window;
        messages.next(surfaceResizeEnvelope(320, {sourceWindow: otherWindow}));

        const {fixture} = await mount();

        expect(fixture.componentInstance.events).toEqual([]);
      });

      it('drops every envelope while there is no renderer URL', async () => {
        resolvedUrl.set(null);
        const {fixture} = await mount(host => host.payload.set(PAYLOAD));

        messages.next(surfaceResizeEnvelope(320, {sourceWindow: window}));
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([]);
      });

      it('stops emitting once destroyed', async () => {
        const {fixture, harness} = await mount();
        const iframe = await iframeOf(harness);
        const guestWindow = iframe.contentWindow!;
        const events = fixture.componentInstance.events;
        fixture.destroy();

        messages.next(surfaceResizeEnvelope(320, {sourceWindow: guestWindow}));

        expect(events).toEqual([]);
      });
    });

    describe('outputs', () => {
      it('reports documentReplaced when the renderer URL changes, and not when it mounts', async () => {
        const {fixture} = await mount();
        expect(fixture.componentInstance.events).toEqual([]);

        resolvedUrl.set('http://localhost:3000/other-renderer');
        fixture.detectChanges();
        expect(fixture.componentInstance.events).toEqual([{output: 'documentReplaced'}]);

        resolvedUrl.set(null);
        fixture.detectChanges();
        expect(fixture.componentInstance.events).toEqual([
          {output: 'documentReplaced'},
          {output: 'documentReplaced'},
        ]);
      });

      it('does not report documentReplaced when resolvedUrl transitions from initial null to the first URL', async () => {
        resolvedUrl.set(null);
        const {fixture} = await mount();
        expect(fixture.componentInstance.events).toEqual([]);

        resolvedUrl.set(RENDERER_URL);
        fixture.detectChanges();
        expect(fixture.componentInstance.events).toEqual([]);
      });

      it('does not report documentReplaced for a reload of the same URL', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        await harness.simulateFrameLoad();
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);
        await harness.simulateFrameLoad();

        expect(fixture.componentInstance.events).toEqual([{output: 'rendererReady'}]);
      });

      it('emits every message of a burst in one tick, in order', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        const burst = {render: false};

        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY, {}, burst);
        fromGuest(fixture, iframe, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 166}, burst);
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDER_SUCCESS, {}, burst);
        fromGuest(
          fixture,
          iframe,
          PreviewBridgeMessageType.SURFACE_RESIZE,
          {height: 300, width: 480, contentReady: true},
          burst,
        );
        fromGuest(fixture, iframe, PreviewBridgeMessageType.DATA_MODEL_CHANGE, {}, burst);
        fromGuest(fixture, iframe, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 320}, burst);
        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDER_ERROR, {}, burst);
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([
          {output: 'rendererReady'},
          {output: 'surfaceResize', report: {height: 166}},
          {output: 'renderSuccess'},
          {output: 'surfaceResize', report: {height: 300, width: 480, contentReady: true}},
          {output: 'surfaceResize', report: {height: 320}},
          {output: 'renderError'},
        ]);
      });

      it('sends the payload before it reports READY to its host', async () => {
        const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
        const iframe = await iframeOf(harness);
        let sentWhenReported: number | null = null;
        fixture.componentInstance.onEvent = () => {
          sentWhenReported = hostCommunication.sendRenderA2UI.mock.calls.length;
        };

        fromGuest(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY);

        expect(sentWhenReported).toBe(1);
      });

      it.each([
        ['without a height', {width: 480}],
        ['with a negative height', {height: -1}],
        ['with a height past the dimension cap', {height: 20_001}],
        ['with a non-boolean contentReady', {height: 300, contentReady: 'yes'}],
        ['as an array', [300]],
      ])('rejects a SURFACE_RESIZE %s', async (_label, payload) => {
        const {fixture, harness} = await mount();
        const iframe = await iframeOf(harness);

        fromGuest(fixture, iframe, PreviewBridgeMessageType.SURFACE_RESIZE, payload);

        expect(fixture.componentInstance.events).toEqual([]);
      });
    });
  });

  describe('with the real HostCommunication', () => {
    beforeEach(() => {
      configure(null);
    });

    it('posts a payload set before the handshake exactly once, when the frame announces itself', async () => {
      const {fixture, harness} = await mount(host => host.payload.set(PAYLOAD));
      const iframe = await iframeOf(harness);
      const guestWindow = iframe.contentWindow!;
      const postMessage = vi.spyOn(guestWindow, 'postMessage').mockImplementation(() => {});
      fixture.componentInstance.payload.set(NEXT_PAYLOAD);
      fixture.detectChanges();

      // A real handshake through HostCommunication's listener: it marks the frame
      // ready, flushes anything queued for it and then hands the envelope on.
      window.dispatchEvent(
        new MessageEvent('message', {
          source: guestWindow,
          origin: RENDERER_ORIGIN,
          data: {type: PreviewBridgeMessageType.RENDERER_READY},
        }),
      );
      await harness.simulateFrameLoad();
      fixture.detectChanges();

      const renders = postMessage.mock.calls.filter(
        ([message]) => (message as {type?: string}).type === PreviewBridgeMessageType.RENDER_A2UI,
      );
      expect(renders).toEqual([
        [{type: PreviewBridgeMessageType.RENDER_A2UI, payload: NEXT_PAYLOAD}, RENDERER_ORIGIN],
      ]);
    });

    it('withdraws readiness when the renderer URL changes so messages wait for the new handshake', async () => {
      const {fixture, harness} = await mount();
      const iframe = await iframeOf(harness);
      const guestWindow = iframe.contentWindow!;
      // A browser's WindowProxy keeps its identity across navigations.
      vi.spyOn(iframe, 'contentWindow', 'get').mockReturnValue(guestWindow);
      const postMessage = vi.spyOn(guestWindow, 'postMessage').mockImplementation(() => {});
      const realHostCommunication = TestBed.inject(HostCommunication);

      window.dispatchEvent(
        new MessageEvent('message', {
          source: guestWindow,
          origin: RENDERER_ORIGIN,
          data: {type: PreviewBridgeMessageType.RENDERER_READY},
        }),
      );
      fixture.detectChanges();
      expect(realHostCommunication.isRendererReady()).toBe(true);

      resolvedUrl.set('http://localhost:3000/other-renderer');
      fixture.detectChanges();
      expect(realHostCommunication.isRendererReady()).toBe(false);
      postMessage.mockClear();

      // Sent before the new document announces itself: must wait for the new READY.
      realHostCommunication.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG}, iframe);
      expect(postMessage).not.toHaveBeenCalled();

      window.dispatchEvent(
        new MessageEvent('message', {
          source: guestWindow,
          origin: RENDERER_ORIGIN,
          data: {type: PreviewBridgeMessageType.RENDERER_READY},
        }),
      );
      fixture.detectChanges();

      expect(postMessage).toHaveBeenCalledWith(
        {type: PreviewBridgeMessageType.GET_CATALOG},
        RENDERER_ORIGIN,
      );
    });
  });
});
