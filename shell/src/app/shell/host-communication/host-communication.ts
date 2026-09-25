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

import {Injectable, inject, signal, Signal, OnDestroy, untracked} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {Observable, ReplaySubject, filter} from 'rxjs';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {CrossFrameValidator} from '../cross-frame-validator/cross-frame-validator';
import {PreviewBridgeMessageType, McpRequestPayload} from 'a2ui-bridge';
import {ErrorLogger, ErrorLogLevel} from '../../debug/error-logger.service';
import {McpClientManagerService} from '../../mcp/mcp-client-manager.service';

/**
 * Schema representing a structured postMessage payload used to communicate
 * event data and lifecycle checks between the host and preview frame.
 */
export declare interface MessageEnvelope {
  /** Discriminator action type identifying the specific message intent */
  type: string;
  /** Optional payload attached to the message transaction */
  payload?: unknown;
  /** Fully resolved origin URI string of the dispatching sender */
  origin: string;
  /** Epoch millisecond timestamp recording when the message was received */
  timestamp: number;
  /** Window source that dispatched this message */
  sourceWindow?: Window | null;
}

/**
 * Core service managing cross-frame message passing and event dispatching
 * between the primary workspace shell and rendering client frames.
 */
@Injectable({
  providedIn: 'root',
})
export class HostCommunication implements OnDestroy {
  private readonly startupResolution = inject(StartupResolution);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly errorLogger = inject(ErrorLogger);
  private readonly logger = this.errorLogger.withTag('[HostCommunication]');
  private readonly mcpManager = inject(McpClientManagerService);
  private iframeWindow: Window | null = null;
  private iframeElement: HTMLIFrameElement | null = null;
  private readonly registeredIframes = new Set<HTMLIFrameElement>();
  private readonly registeredWindows = new Set<Window>();
  /**
   * Content window of each registered iframe element, captured while the
   * element is still attached. `contentWindow` turns null once the element
   * leaves the DOM, which can happen before `unregisterIframe` runs, and the
   * window is needed then to withdraw its readiness.
   */
  private readonly iframeWindows = new Map<HTMLIFrameElement, Window>();
  /**
   * Guest windows that have completed the RENDERER_READY handshake. Readiness
   * is tracked per window because several renderer frames can be open at the
   * same time (inline chat surfaces plus the side canvas) and each one
   * announces itself independently; one frame still loading must not stall
   * or reset the others.
   */
  private readonly readyWindows = new Set<Window>();
  private readonly latestEnvelopeSignal = signal<MessageEnvelope | null>(null);
  private readonly isRendererReadySignal = signal<boolean>(false);

  /** Readonly signal tracking the most recent message envelope */
  readonly latestEnvelope: Signal<MessageEnvelope | null> = this.latestEnvelopeSignal.asReadonly();

  /**
   * Whether at least one registered frame has completed its handshake. With
   * several frames open this says nothing about any particular frame; it is
   * the coarse signal for consumers such as the raw frame's watchdog message.
   */
  readonly isRendererReady = this.isRendererReadySignal.asReadonly();

  private readonly messageStreamSubject = new ReplaySubject<MessageEnvelope>(1);
  /** Uncoalesced hot event stream broadcasting all incoming message envelopes */
  readonly messageStream$ = this.messageStreamSubject.asObservable();
  /** Readonly signal holding the latest incoming stream message */
  readonly messageStream = toSignal(this.messageStream$, {
    initialValue: null,
  });

  private readonly messageHistoryBuffer: MessageEnvelope[] = [];
  private readonly earlyMessageBuffer: MessageEvent[] = [];
  /**
   * Messages we tried to send before the guest renderer was ready to receive
   * them. They are replayed once it announces itself with RENDERER_READY.
   *
   * Each entry also records which frame the message was meant for, because
   * several renderer iframes can be open at once (for example an inline
   * surface in the chat plus the side canvas), and a replayed message must
   * still reach the frame it was originally addressed to.
   *
   * The frame is stored next to the message instead of as a property on it:
   * `sendMessage` hands the message object straight to `postMessage`, and the
   * browser cannot copy a DOM element across frames, so an iframe reference
   * inside the message would make the send throw.
   */
  private readonly outboundMessageBuffer: Array<{
    message: {type: PreviewBridgeMessageType; payload?: unknown};
    target?: HTMLIFrameElement | Window | null;
  }> = [];

  /**
   * Returns a snapshot copy of the recent message history buffer. Non-destructive: several debug panels hydrate from this same buffer during construction. Use `clearHistoryBuffer()` for a genuine reset.
   * @return Array of stored message envelopes
   */
  getEnvelopeHistory(): readonly MessageEnvelope[] {
    return [...this.messageHistoryBuffer];
  }

  /**
   * Clears the historical message buffer and resets the tracked catalog state.
   */
  clearHistoryBuffer(): void {
    this.messageHistoryBuffer.length = 0;
  }

  private handleConsoleLog(payload: unknown): void {
    const payloadObj = payload as {level?: string; message?: string; stack?: string} | undefined;
    const levelStr = payloadObj?.level || 'log';
    const msg = payloadObj?.message || '';
    const stackStr = payloadObj?.stack;
    let level: ErrorLogLevel = 'log';
    if (levelStr === 'error') level = 'error';
    else if (levelStr === 'warn') level = 'warn';
    else if (levelStr === 'info') level = 'info';

    this.errorLogger.log({
      level,
      message: msg,
      sourceTag: '[Preview]',
      ...(stackStr !== undefined ? {stack: stackStr} : {}),
    });
  }

  /**
   * Triggers a message stream envelope update. Primarily exposed for testing specifications
   * to safely simulate incoming guest frame postMessages without unsafe casting bypasses.
   */
  private triggerMessageStreamForTesting(envelope: MessageEnvelope): void {
    if (envelope.type === PreviewBridgeMessageType.CONSOLE_LOG) {
      this.handleConsoleLog(envelope.payload);
    }
    this.messageStreamSubject.next(envelope);
  }

  /** Test-only hooks to simulate incoming stream messages */
  readonly TEST_ONLY = {
    triggerMessageStreamForTesting: (envelope: MessageEnvelope) =>
      this.triggerMessageStreamForTesting(envelope),
  };

  private hasRegisteredTarget(): boolean {
    return (
      this.iframeElement !== null ||
      this.iframeWindow !== null ||
      this.registeredIframes.size > 0 ||
      this.registeredWindows.size > 0
    );
  }

  private readonly messageListener = (event: MessageEvent) => {
    if (!this.hasRegisteredTarget()) {
      const isBridgeMessage =
        event.data &&
        typeof event.data === 'object' &&
        Object.values(PreviewBridgeMessageType).includes(event.data.type);

      if (event.data?.type === PreviewBridgeMessageType.CONSOLE_LOG) {
        const expectedUrl = this.startupResolution.getResolvedRendererUrl();
        if (!expectedUrl) {
          return;
        }

        try {
          const expectedOrigin = new URL(expectedUrl, globalThis.location?.href).origin;
          if (event.origin !== expectedOrigin) {
            return;
          }
        } catch {
          return;
        }

        const envelope: MessageEnvelope = {
          type: event.data.type,
          payload: event.data.payload,
          origin: event.origin,
          timestamp: Date.now(),
          sourceWindow: (event.source as Window) ?? null,
        };
        this.handleConsoleLog(event.data.payload);
        this.messageStreamSubject.next(envelope);
        return;
      }

      if (!isBridgeMessage) {
        return;
      }
      this.earlyMessageBuffer.push(event);
      if (this.earlyMessageBuffer.length > 20) {
        this.earlyMessageBuffer.shift();
      }
      return;
    }

    const matchesSource =
      (this.iframeElement && this.iframeElement.contentWindow === event.source) ||
      (this.iframeWindow && this.iframeWindow === event.source) ||
      this.registeredWindows.has(event.source as Window) ||
      Array.from(this.registeredIframes).some(iframe => iframe.contentWindow === event.source);

    if (!matchesSource) {
      return;
    }

    const expectedOrigin = this.resolveExpectedRendererOrigin();
    if (!expectedOrigin || event.origin !== expectedOrigin) return;

    const data = event.data;
    if (data && typeof data === 'object' && data.type) {
      const type = data.type as string;
      const envelope: MessageEnvelope = {
        type,
        payload: data.payload,
        origin: event.origin,
        timestamp: Date.now(),
        sourceWindow: (event.source as Window) ?? null,
      };
      const sourceWindow = envelope.sourceWindow ?? null;
      if (type === PreviewBridgeMessageType.RENDERER_READY && sourceWindow) {
        this.markWindowReady(sourceWindow);
        // Only the frame that just announced itself needs the theme. Frames
        // that are already up received it on their own handshake, and frames
        // still loading will get it on theirs.
        this.sendMessage(this.themeMessage(this.configProvider.themePreference()), sourceWindow);
        this.flushOutboundMessages();
      }
      if (type === PreviewBridgeMessageType.CONSOLE_LOG) {
        this.handleConsoleLog(data.payload);
        this.messageStreamSubject.next(envelope);
        return;
      }

      if (type === PreviewBridgeMessageType.MCP_REQUEST) {
        // A frame that calls tools is evidently up, even if its RENDERER_READY
        // was missed; treat it exactly like a handshake so anything queued for
        // it does not wait for some other frame's RENDERER_READY.
        this.markWindowReady(sourceWindow);
        this.flushOutboundMessages();
        const req = data.payload as McpRequestPayload;
        const sourceTarget =
          Array.from(this.registeredIframes).find(f => f.contentWindow === event.source) ??
          (event.source as Window) ??
          null;
        void this.mcpManager
          .callTool(req.toolName, req.args ?? {})
          .then(result => {
            this.sendMessage(
              {
                type: PreviewBridgeMessageType.MCP_RESPONSE,
                payload: {requestId: req.requestId, result},
              },
              sourceTarget,
            );
          })
          .catch((err: unknown) => {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.errorLogger.log({
              level: 'error',
              message: `MCP tool execution failed for "${req.toolName}": ${errorMessage}`,
              sourceTag: '[McpBridge]',
            });
            this.sendMessage(
              {
                type: PreviewBridgeMessageType.MCP_RESPONSE,
                payload: {
                  requestId: req.requestId,
                  error: errorMessage,
                },
              },
              sourceTarget,
            );
          });
      }

      if (type === PreviewBridgeMessageType.DATA_MODEL_CHANGE) {
        const payload = data.payload as {validationErrors?: unknown} | undefined;
        if (payload?.validationErrors) {
          const validationErrors = payload.validationErrors;
          const hasErrors = Array.isArray(validationErrors)
            ? validationErrors.length > 0
            : typeof validationErrors === 'object' && validationErrors !== null
              ? Object.keys(validationErrors).length > 0
              : !!validationErrors;

          if (hasErrors) {
            let msg = '';
            if (Array.isArray(validationErrors)) {
              msg = validationErrors
                .map(e => (typeof e === 'string' ? e : JSON.stringify(e)))
                .join(', ');
            } else if (typeof validationErrors === 'object') {
              msg = JSON.stringify(validationErrors);
            } else {
              msg = String(validationErrors);
            }

            this.errorLogger.log({
              level: 'error',
              message: msg,
              sourceTag: '[Validation]',
            });
          }
        }
      }

      this.recordEnvelope(envelope);
    }
  };

  private recordEnvelope(envelope: MessageEnvelope): void {
    this.messageHistoryBuffer.push(envelope);
    if (this.messageHistoryBuffer.length > 100) {
      this.messageHistoryBuffer.shift();
    }

    this.latestEnvelopeSignal.set(envelope);
    this.messageStreamSubject.next(envelope);
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.messageListener);
    }
  }

  private flushEarlyMessages(): void {
    if (this.hasRegisteredTarget() && this.earlyMessageBuffer.length > 0) {
      const messages = [...this.earlyMessageBuffer];
      this.earlyMessageBuffer.length = 0;
      for (const msg of messages) {
        this.messageListener(msg);
      }
    }
  }

  private isIframeElement(target: HTMLIFrameElement | Window): target is HTMLIFrameElement {
    if (typeof HTMLIFrameElement !== 'undefined' && target instanceof HTMLIFrameElement) {
      return true;
    }
    try {
      return (
        'contentWindow' in target && typeof (target as unknown as Window).postMessage !== 'function'
      );
    } catch {
      return false;
    }
  }

  /**
   * Resolves the window a message for `target` is posted to. An omitted target
   * means the current default frame (`iframeElement` / `iframeWindow`): the
   * last one registered, or whichever frame `unregisterIframe` fell back to.
   */
  private resolveTargetWindow(target?: HTMLIFrameElement | Window | null): Window | null {
    if (target) {
      return this.isIframeElement(target) ? target.contentWindow : target;
    }
    return this.iframeElement ? this.iframeElement.contentWindow : this.iframeWindow;
  }

  private isRegisteredWindow(targetWindow: Window): boolean {
    if (this.registeredWindows.has(targetWindow)) {
      return true;
    }
    for (const iframe of this.registeredIframes) {
      if (
        iframe.contentWindow === targetWindow ||
        this.iframeWindows.get(iframe) === targetWindow
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Whether a message for `target` can be posted right away. A registered frame
   * has to have completed its own handshake. A target the service does not
   * know about cannot announce itself, so it falls back to the overall
   * readiness flag, which keeps the single-frame behaviour for such callers.
   */
  private isTargetReady(target?: HTMLIFrameElement | Window | null): boolean {
    // An omitted target means the default frame. Resolve it up front so a
    // registered default whose element is currently detached is handled like
    // an explicit target: the message waits for the frame instead of falling
    // through to the overall flag and being dropped for lack of a window.
    const resolvedTarget = target ?? this.iframeElement ?? this.iframeWindow;
    const targetWindow = this.resolveTargetWindow(resolvedTarget);
    if (targetWindow) {
      if (this.readyWindows.has(targetWindow)) {
        return true;
      }
      if (this.isRegisteredWindow(targetWindow)) {
        return false;
      }
    } else if (
      resolvedTarget &&
      this.isIframeElement(resolvedTarget) &&
      this.registeredIframes.has(resolvedTarget)
    ) {
      // A registered element without a window yet is simply not attached; its
      // frame will announce itself once it is, so the message waits for it.
      return false;
    }
    return this.isRendererReady();
  }

  /**
   * Records that `sourceWindow` completed its handshake. The window is also
   * remembered against its iframe element so the readiness can be withdrawn
   * later even if the element has left the DOM by then.
   */
  private markWindowReady(sourceWindow: Window | null): void {
    if (!sourceWindow) {
      // Nothing can be waited for without a window to post to. A real guest
      // frame always has one; only synthetic events lack it.
      return;
    }
    this.readyWindows.add(sourceWindow);
    for (const iframe of this.registeredIframes) {
      if (iframe.contentWindow === sourceWindow) {
        this.iframeWindows.set(iframe, sourceWindow);
      }
    }
    this.isRendererReadySignal.set(true);
  }

  /**
   * Posts every queued message whose target is ready now, in the order they
   * were queued. Messages for frames that are still handshaking stay queued
   * and wait for their own RENDERER_READY.
   */
  private flushOutboundMessages(): void {
    const pending = [...this.outboundMessageBuffer];
    this.outboundMessageBuffer.length = 0;
    for (const pendingMessage of pending) {
      if (this.isTargetReady(pendingMessage.target)) {
        this.sendMessage(pendingMessage.message, pendingMessage.target);
      } else {
        this.outboundMessageBuffer.push(pendingMessage);
      }
    }
  }

  /**
   * Whether a queued message's target refers to `target`, either by the same
   * element or window reference, or by resolving to the same window.
   */
  private addressesTarget(
    queuedTarget: HTMLIFrameElement | Window | null | undefined,
    target: HTMLIFrameElement | Window,
    targetWindow: Window | null,
  ): boolean {
    if (!queuedTarget) {
      return false;
    }
    if (queuedTarget === target) {
      return true;
    }
    return targetWindow !== null && this.resolveTargetWindow(queuedTarget) === targetWindow;
  }

  private dropQueuedMessages(
    shouldDrop: (queuedTarget: HTMLIFrameElement | Window | null | undefined) => boolean,
  ): void {
    for (let i = this.outboundMessageBuffer.length - 1; i >= 0; i--) {
      if (shouldDrop(this.outboundMessageBuffer[i].target)) {
        this.outboundMessageBuffer.splice(i, 1);
      }
    }
  }

  /**
   * Registers an active iframe DOM element or content window target and flushes
   * any buffered early messages. Supports multiple concurrent iframes.
   *
   * Registering a frame starts a fresh handshake for that frame only: its own
   * queued messages and previous readiness are discarded, while frames that
   * are already up keep their readiness and their queued messages.
   * @param target Target iframe element, window reference, or null to unregister all
   */
  registerIframe(target: HTMLIFrameElement | Window | null): void {
    if (!target) {
      this.outboundMessageBuffer.length = 0;
      this.iframeElement = null;
      this.iframeWindow = null;
      this.registeredIframes.clear();
      this.registeredWindows.clear();
      this.iframeWindows.clear();
      this.readyWindows.clear();
      this.earlyMessageBuffer.length = 0;
      this.isRendererReadySignal.set(false);
      return;
    }

    let windowTarget: Window | null = null;
    if (this.isIframeElement(target)) {
      const previousWindow = this.iframeWindows.get(target);
      if (previousWindow) {
        this.readyWindows.delete(previousWindow);
      }
      this.iframeElement = target;
      this.registeredIframes.add(target);
      windowTarget = target.contentWindow;
      if (windowTarget) {
        this.iframeWindows.set(target, windowTarget);
      } else {
        this.iframeWindows.delete(target);
      }
    } else {
      this.iframeElement = null;
      this.registeredWindows.add(target);
      windowTarget = target;
    }

    if (windowTarget) {
      this.readyWindows.delete(windowTarget);
    }
    // Untargeted messages were meant for the previous default frame. This
    // frame is now the default, so replaying them would misroute them here;
    // drop them. Messages addressed to other frames stay queued.
    this.dropQueuedMessages(
      queuedTarget => !queuedTarget || this.addressesTarget(queuedTarget, target, windowTarget),
    );
    this.iframeWindow = windowTarget;
    this.isRendererReadySignal.set(this.readyWindows.size > 0);
    if (windowTarget) {
      this.flushEarlyMessages();
    }
  }

  /**
   * Unregisters a previously registered iframe element or window target.
   * Handles both HTMLIFrameElement and raw Window targets, ensuring that if
   * the active communication target is removed, the service gracefully falls
   * back to any remaining iframe or window rather than breaking the channel.
   *
   * @param target Target iframe element or window reference to unregister
   */
  unregisterIframe(target: HTMLIFrameElement | Window): void {
    if (!target) return;
    let targetWindow: Window | null = null;
    if (this.isIframeElement(target)) {
      targetWindow = this.iframeWindows.get(target) ?? target.contentWindow;
      this.iframeWindows.delete(target);
      this.registeredIframes.delete(target);
      if (this.iframeElement === target) {
        this.iframeElement = this.registeredIframes.values().next().value ?? null;
        this.iframeWindow = this.iframeElement
          ? this.iframeElement.contentWindow
          : (this.registeredWindows.values().next().value ?? null);
      }
    } else {
      // Target is a direct Window reference (e.g. external popout or window-only test target).
      targetWindow = target;
      this.registeredWindows.delete(target);
      if (this.iframeWindow === target) {
        const nextWindow = this.registeredWindows.values().next().value ?? null;
        if (nextWindow) {
          this.iframeWindow = nextWindow;
        } else {
          // If no windows remain, fall back to any active iframe element in registeredIframes
          // to prevent leaving the active communication channel disconnected when mixing targets.
          this.iframeElement = this.registeredIframes.values().next().value ?? null;
          this.iframeWindow = this.iframeElement ? this.iframeElement.contentWindow : null;
        }
      }
    }
    if (targetWindow) {
      this.readyWindows.delete(targetWindow);
    }
    this.dropQueuedMessages(queuedTarget =>
      this.addressesTarget(queuedTarget, target, targetWindow),
    );
    if (this.registeredIframes.size === 0 && this.registeredWindows.size === 0) {
      // Nothing is registered any more, so no readiness can be current.
      this.readyWindows.clear();
    }
    this.isRendererReadySignal.set(this.readyWindows.size > 0);
  }

  /**
   * Registers an additional secondary iframe target for message dispatch without
   * disturbing the primary communication target, outbound buffer, or readiness state.
   * Unlike {@link registerIframe}, this performs no buffer clearing or readiness reset,
   * so it is safe to call for auxiliary consumers while a primary exchange is in flight.
   * @param el Secondary iframe element to register
   */
  registerSecondaryIframe(el: HTMLIFrameElement): void {
    this.registeredIframes.add(el);
  }

  /**
   * Unregisters a previously registered secondary iframe target added via
   * {@link registerSecondaryIframe}. Removes the element from the tracked set, and,
   * if {@link unregisterIframe}'s fallback had promoted this element to the primary
   * target in the meantime (e.g. cleanup ordering during route teardown), clears the
   * dangling primary pointer rather than leaving it aimed at a detached iframe.
   * It never promotes a replacement primary target itself; that remains
   * {@link unregisterIframe}'s responsibility.
   * @param el Secondary iframe element to unregister
   */
  unregisterSecondaryIframe(el: HTMLIFrameElement): void {
    this.registeredIframes.delete(el);
    if (this.iframeElement === el) {
      this.iframeElement = null;
      this.iframeWindow = null;
    }
  }

  /**
   * Derives a filtered message stream scoped to envelopes originating from a specific window.
   * @param win Source window to filter incoming message envelopes by
   * @return Observable emitting only envelopes whose sourceWindow matches the given window
   */
  messageStreamFor(win: Window): Observable<MessageEnvelope> {
    return this.messageStream$.pipe(filter(e => e.sourceWindow === win));
  }

  /**
   * Resolves the expected renderer origin from the currently configured renderer URL.
   * @return Resolved origin string, or null if no renderer URL is configured or it fails to parse
   */
  private resolveExpectedRendererOrigin(): string | null {
    const expectedUrl = this.startupResolution.getResolvedRendererUrl();
    if (!expectedUrl) return null;

    try {
      return new URL(expectedUrl, globalThis.location?.href).origin;
    } catch (err) {
      // Ignore malformed URL
      return null;
    }
  }

  /**
   * Validates and dispatches a structured postMessage payload to the registered guest frame.
   * @param message Structured message payload
   * @param target Optional explicit target iframe element or window reference
   */
  sendMessage(
    message: {type: PreviewBridgeMessageType; payload?: unknown},
    target?: HTMLIFrameElement | Window | null,
  ): void {
    if (!CrossFrameValidator.validateOutgoingMessage(message, undefined, this.logger)) {
      this.logger.error('Blocked dispatch of malformed message type...', message);
      return;
    }

    // Callers run inside component effects (RenderedFrame's payload and theme
    // effects). Readiness must not become a dependency of those effects, or
    // every frame's handshake would re-run them and re-send their payloads.
    // Only the fallback branch of isTargetReady reads a signal today; the
    // untracked read keeps that from changing by accident.
    if (!untracked(() => this.isTargetReady(target))) {
      this.logger.info('Queueing outbound message; renderer is not yet ready.', message);
      this.outboundMessageBuffer.push({message, target});
      return;
    }

    const targetWindow = this.resolveTargetWindow(target);
    if (!targetWindow) return;

    const targetOrigin = this.resolveExpectedRendererOrigin();
    if (!targetOrigin) return;

    try {
      targetWindow.postMessage(message, targetOrigin);
      if (message.type === PreviewBridgeMessageType.MCP_RESPONSE) {
        this.recordEnvelope({
          type: message.type,
          payload: message.payload,
          origin: targetOrigin,
          timestamp: Date.now(),
          sourceWindow: targetWindow,
        });
      }
    } catch (err) {
      // Ignore postMessage failure (e.g. detached or restricted frame)
    }
  }

  /**
   * Validates and dispatches a structured postMessage payload directly to a specific
   * iframe target, bypassing the renderer-readiness gate and outbound message queue
   * used by {@link sendMessage}. Intended for targeted sends to secondary frames where
   * queueing would otherwise replay the message to the primary frame instead.
   * @param message Structured message payload
   * @param el Target iframe element to post the message to
   */
  sendToFrame(
    message: {type: PreviewBridgeMessageType; payload?: unknown},
    el: HTMLIFrameElement,
  ): void {
    if (!CrossFrameValidator.validateOutgoingMessage(message)) {
      console.error('Blocked dispatch of malformed message type...', message);
      return;
    }

    if (!el.contentWindow) return;

    const targetOrigin = this.resolveExpectedRendererOrigin();
    if (!targetOrigin) return;

    try {
      el.contentWindow.postMessage(message, targetOrigin);
    } catch (err) {
      // Ignore postMessage failure (e.g. detached or restricted frame)
    }
  }

  private themeMessage(theme: ThemePreference): {
    type: PreviewBridgeMessageType;
    payload: {theme: ThemePreference};
  } {
    return {type: PreviewBridgeMessageType.SET_THEME, payload: {theme}};
  }

  /**
   * Dispatches a SET_THEME message to every registered frame that is up. A
   * frame that has not completed its handshake is skipped rather than queued
   * for: it receives the current theme on its own RENDERER_READY, so a queued
   * copy would only arrive as a duplicate. With nothing registered the message
   * waits for the default frame, as any other message does.
   * @param theme Target theme option
   */
  sendTheme(theme: ThemePreference): void {
    const message = this.themeMessage(theme);
    const targets: Array<HTMLIFrameElement | Window> = [
      ...this.registeredIframes,
      ...this.registeredWindows,
    ];
    if (targets.length === 0) {
      this.sendMessage(message);
      return;
    }
    const postedWindows = new Set<Window>();
    for (const target of targets) {
      const targetWindow = this.resolveTargetWindow(target);
      if (
        !targetWindow ||
        postedWindows.has(targetWindow) ||
        !this.readyWindows.has(targetWindow)
      ) {
        continue;
      }
      postedWindows.add(targetWindow);
      this.sendMessage(message, target);
    }
  }

  /**
   * Helper utility dispatching a RENDER_A2UI layout array to the preview renderer.
   * @param payload Array of layout nodes or configuration objects
   * @param target Optional explicit target iframe element or window reference
   */
  sendRenderA2UI(payload: unknown[], target?: HTMLIFrameElement | Window | null): void {
    this.sendMessage(
      {
        type: PreviewBridgeMessageType.RENDER_A2UI,
        payload: payload,
      },
      target,
    );
  }

  /**
   * Retrieves the currently registered iframe element, if any.
   * @return HTMLIFrameElement or null
   */
  getIframeElement(): HTMLIFrameElement | null {
    return this.iframeElement;
  }

  ngOnDestroy(): void {
    this.outboundMessageBuffer.length = 0;
    this.isRendererReadySignal.set(false);
    this.earlyMessageBuffer.length = 0;
    this.registeredIframes.clear();
    this.registeredWindows.clear();
    this.iframeWindows.clear();
    this.readyWindows.clear();
    this.iframeElement = null;
    this.iframeWindow = null;
    this.messageStreamSubject.complete();
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.messageListener);
    }
  }
}
