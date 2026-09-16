(() => {
"use strict";
var __webpack_modules__ = ({
3685(__unused_rspack___webpack_module__, __unused_rspack___webpack_exports__, __webpack_require__) {

;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-worker-rpc/dist/Rpc.js
/**
 * The instance for handling MessagePort Remote Process Call
 */
class Rpc {
    port;
    name;
    incId = 0;
    #messageQueue = [];
    #messageCache = {};
    #textEncoder = new TextEncoder();
    #textDecoder = new TextDecoder();
    #handlerMap = new Map();
    /**
     * @param port one size of a message channel
     * @param name instance name
     */
    constructor(port, name) {
        this.port = port;
        this.name = name;
        if (port) {
            port.onmessage = (ev) => this.#onMessage(ev.data);
        }
    }
    setMessagePort(port) {
        if (this.port) {
            throw new Error('Rpc port already set');
        }
        else {
            this.port = port;
            for (const item of this.#messageQueue) {
                this.postMessage(item.message, item.detail);
            }
            this.#messageQueue = [];
            port.onmessage = (ev) => this.#onMessage(ev.data);
        }
    }
    postMessage(message, detail) {
        if (this.port) {
            this.port.postMessage(message, detail);
        }
        else {
            this.#messageQueue.push({
                message: message,
                detail,
            });
        }
    }
    get nextRetId() {
        return `ret_${this.name}_${this.incId++}`;
    }
    /**
     * @private do not use this
     * @param retId
     * @returns
     */
    static createRetEndpoint(retId) {
        return {
            name: retId,
            hasReturn: false,
            isSync: false,
        };
    }
    #onMessage = async (message) => {
        // console.warn(`[rpc] on ${this.name} received ${message.name}`, message);
        const handler = this.#handlerMap.get(message.name);
        if (handler) {
            const lockViewer = message.sync
                ? new Int32Array(message.lock)
                : undefined;
            const replyTempEndpoint = (!message.sync && message.retId)
                ? Rpc.createRetEndpoint(message.retId)
                : undefined;
            try {
                const result = await handler(...message.data);
                let retData = undefined, transfer = [];
                if (message.sync) {
                    retData = result;
                }
                else if (message.hasTransfer) {
                    ({ data: retData, transfer } = (result || {}));
                }
                else {
                    retData = result;
                }
                if (message.sync) {
                    if (message.buf) {
                        const retStr = JSON.stringify(retData);
                        const lengthViewer = new Uint32Array(message.buf, 0, 1);
                        const bufViewer = new Uint8Array(message.buf, 4);
                        const retCache = new Uint8Array(message.buf.byteLength - 4);
                        const { written: byteLength } = this.#textEncoder.encodeInto(retStr, retCache);
                        lengthViewer[0] = byteLength;
                        bufViewer.set(retCache, 0);
                    }
                    Atomics.store(lockViewer, 0, 1);
                    Atomics.notify(lockViewer, 0);
                }
                else {
                    if (message.retId) {
                        this.invoke(replyTempEndpoint, [
                            retData,
                            false,
                        ], transfer || []);
                    }
                }
            }
            catch (e) {
                console.error(e);
                if (message.sync) {
                    Atomics.store(lockViewer, 0, 2);
                    Atomics.notify(lockViewer, 0);
                    lockViewer[1] = 2;
                }
                else {
                    this.invoke(replyTempEndpoint, [undefined, true]);
                }
            }
        }
        else {
            const cache = this.#messageCache[message.name];
            if (cache) {
                cache.push(message);
            }
            else {
                this.#messageCache[message.name] = [message];
            }
        }
    };
    createCall(endpoint) {
        return (...args) => {
            return this.invoke(endpoint, args);
        };
    }
    registerHandler(endpoint, handler) {
        this.#handlerMap.set(endpoint.name, handler);
        const currentCache = this.#messageCache[endpoint.name];
        if (currentCache?.length) {
            this.#messageCache[endpoint.name] = undefined;
            for (const message of currentCache) {
                this.#onMessage(message);
            }
        }
    }
    registerHandlerRef(endpoint, target, propertyName) {
        this.registerHandler(endpoint, (...args) => {
            return target[propertyName]?.call(target, ...args);
        });
    }
    registerHandlerLazy(endpoint, target, propertyName) {
        if (target[propertyName]) {
            this.registerHandlerRef(endpoint, target, propertyName);
        }
        else {
            let property = undefined;
            const rpc = this;
            Object.defineProperty(target, propertyName, {
                get() {
                    return property;
                },
                set(v) {
                    property = v;
                    if (v) {
                        rpc.registerHandlerRef(endpoint, target, propertyName);
                    }
                },
            });
        }
    }
    /**
     * Remove the handler for the name
     * @param name
     */
    removeHandler(rpc) {
        this.#handlerMap.delete(rpc.name);
    }
    invoke(endpoint, parameters, transfer = []) {
        if (endpoint.isSync) {
            const sharedBuffer = endpoint.bufferSize
                ? new SharedArrayBuffer(endpoint.bufferSize + 4)
                : undefined;
            const lock = new SharedArrayBuffer(4);
            const lockViewer = new Int32Array(lock);
            lockViewer[0] = 0;
            const message = {
                name: endpoint.name,
                data: parameters,
                sync: true,
                lock: lock,
                buf: sharedBuffer,
            };
            this.postMessage(message, { transfer });
            Atomics.wait(lockViewer, 0, 0);
            if (lockViewer[0] === 2) {
                // error
                throw null;
            }
            if (sharedBuffer) {
                const byteLength = (new Uint32Array(sharedBuffer, 0, 4))[0];
                const sharedBufferView = new Uint8Array(sharedBuffer, 4, byteLength);
                const localBuf = new Uint8Array(byteLength);
                localBuf.set(sharedBufferView, 0);
                const ret = localBuf
                    ? JSON.parse(this.#textDecoder.decode(localBuf))
                    : undefined;
                return ret;
            }
            else {
                return;
            }
        }
        else {
            if (endpoint.hasReturn) {
                let promise, resolve, reject;
                promise = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });
                const retHandler = Rpc.createRetEndpoint(this.nextRetId);
                this.registerHandler(retHandler, (returnValue, error) => {
                    if (error)
                        reject();
                    resolve(returnValue);
                });
                const message = {
                    name: endpoint.name,
                    data: parameters,
                    sync: false,
                    retId: retHandler?.name,
                    hasTransfer: endpoint.hasReturnTransfer,
                };
                this.postMessage(message, { transfer });
                return promise;
            }
            else {
                const message = {
                    name: endpoint.name,
                    data: parameters,
                    sync: false,
                };
                this.postMessage(message, { transfer });
            }
        }
    }
    /**
     * create a call with callbackify parameters
     */
    createCallbackify(endpoint, callbackAt) {
        const call = this.createCall(endpoint);
        return (...params) => {
            const callback = params.at(callbackAt);
            params.splice(callbackAt, 1);
            call(...params).then(callback);
        };
    }
}
//# sourceMappingURL=Rpc.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-worker-rpc/dist/RpcEndpoint.js
function createRpcEndpoint(name, isSync, hasReturn = true, hasReturnTransfer = false, bufferSize) {
    return {
        name,
        isSync,
        hasReturn,
        hasReturnTransfer,
        bufferSize,
    };
}
//# sourceMappingURL=RpcEndpoint.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/endpoints.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

const publicComponentEventEndpoint = createRpcEndpoint('publicComponentEvent', false, false);
const publishEventEndpoint = createRpcEndpoint('publishEvent', false, false);
const switchExposureServiceEndpoint = createRpcEndpoint('switchExposureServiceEndpoint', false, false);
const intersectionObserverCommandEndpoint = createRpcEndpoint('intersectionObserverCommand', false, false);
const dispatchIntersectionObserverEventEndpoint = createRpcEndpoint('dispatchIntersectionObserverEvent', false, false);
const updateDataEndpoint = createRpcEndpoint('updateData', false, true);
const sendGlobalEventEndpoint = createRpcEndpoint('sendGlobalEventEndpoint', false, false);
const disposeEndpoint = createRpcEndpoint('dispose', false, true);
const BackgroundThreadStartEndpoint = createRpcEndpoint('start', false, true);
/**
 * Error message, info
 */
const reportErrorEndpoint = createRpcEndpoint('reportError', false, false);
const callLepusMethodEndpoint = createRpcEndpoint('callLepusMethod', false, true);
const invokeUIMethodEndpoint = createRpcEndpoint('__invokeUIMethod', false, true);
const setNativePropsEndpoint = createRpcEndpoint('__setNativeProps', false, true);
const getPathInfoEndpoint = createRpcEndpoint('__getPathInfo', false, true);
const nativeModulesCallEndpoint = createRpcEndpoint('nativeModulesCall', false, true);
const napiModulesCallEndpoint = createRpcEndpoint('napiModulesCall', false, true, true);
const getCustomSectionsEndpoint = createRpcEndpoint('getCustomSections', false, true);
const markTimingEndpoint = createRpcEndpoint('markTiming', false, false);
const postTimingFlagsEndpoint = createRpcEndpoint('postTimingFlags', false, false);
const triggerComponentEventEndpoint = createRpcEndpoint('__triggerComponentEvent', false, false);
const selectComponentEndpoint = createRpcEndpoint('__selectComponent', false, true);
const dispatchLynxViewEventEndpoint = createRpcEndpoint('dispatchLynxViewEvent', false, false);
const dispatchNapiModuleEndpoint = createRpcEndpoint('dispatchNapiModule', false, false);
const dispatchCoreContextOnBackgroundEndpoint = createRpcEndpoint('dispatchCoreContextOnBackground', false, false);
const dispatchJSContextOnMainThreadEndpoint = createRpcEndpoint('dispatchJSContextOnMainThread', false, false);
const dispatchDevtoolEventOnBackgroundEndpoint = createRpcEndpoint('dispatchDevtoolEventOnBackground', false, false);
const dispatchDevtoolEventOnMainThreadEndpoint = createRpcEndpoint('dispatchDevtoolEventOnMainThread', false, false);
const triggerElementMethodEndpoint = createRpcEndpoint('__triggerElementMethod', false, false);
const updateGlobalPropsEndpoint = createRpcEndpoint('updateGlobalProps', false, false);
const updateI18nResourcesEndpoint = createRpcEndpoint('updateI18nResources', false, false);
const dispatchI18nResourceEndpoint = createRpcEndpoint('dispatchI18nResource', false, false);
const queryComponentEndpoint = createRpcEndpoint('queryComponent', false, true);
/**
 * Fetch + decode + cache an external `.lynx.bundle` on the main thread for a
 * background-thread `lynx.fetchBundle` call. The handler also registers the
 * bundle's raw JS sections with the worker (via {@link updateBTSChunkEndpoint})
 * so the bts `lynx.loadScript` can load them through the shared chunk loader.
 */
const fetchExternalBundleEndpoint = createRpcEndpoint('fetchExternalBundle', false, true);
const updateBTSChunkEndpoint = createRpcEndpoint('updateBTSChunkEndpoint', false, true);
const reloadEndpoint = createRpcEndpoint('reload', false, false);
//# sourceMappingURL=endpoints.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/createGetCustomSection.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

function createGetCustomSection(rpc, customSections) {
    const getCustomSections = rpc.createCall(getCustomSectionsEndpoint);
    return (key, callback) => {
        if (customSections[key]) {
            return callback(customSections[key]);
        }
        getCustomSections(key).then(callback);
    };
}
//# sourceMappingURL=createGetCustomSection.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/createElement.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

const createElement = (elementId, uiThreadRpc) => {
    const triggerElementMethod = uiThreadRpc.createCall(triggerElementMethodEndpoint);
    return {
        animate(operation, id, keyframes, timingOptions) {
            triggerElementMethod('animate', elementId, {
                operation,
                id,
                keyframes,
                timingOptions,
            });
        },
    };
};
//# sourceMappingURL=createElement.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/LynxCrossThreadContext.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
const DispatchEventResult = {
    // Event was not canceled by event handler or default event handler.
    NotCanceled: 0,
    // Event was canceled by event handler; i.e. a script handler calling
    // preventDefault.
    CanceledByEventHandler: 1,
    // Event was canceled by the default event handler; i.e. executing the default
    // action.  This result should be used sparingly as it deviates from the DOM
    // Event Dispatch model. Default event handlers really shouldn't be invoked
    // inside of dispatch.
    CanceledByDefaultEventHandler: 2,
    // Event was canceled but suppressed before dispatched to event handler.  This
    // result should be used sparingly; and its usage likely indicates there is
    // potential for a bug. Trusted events may return this code; but untrusted
    // events likely should always execute the event handler the developer intends
    // to execute.
    CanceledBeforeDispatch: 3,
};
class LynxCrossThreadContext extends EventTarget {
    #config;
    constructor(config) {
        super();
        this.#config = config;
    }
    postMessage(...args) {
        console.error('[lynx-web] postMessage not implemented, args:', ...args);
    }
    // @ts-expect-error
    dispatchEvent(event) {
        const { rpc, sendEventEndpoint } = this.#config;
        rpc.invoke(sendEventEndpoint, [event]);
        return DispatchEventResult.CanceledBeforeDispatch;
    }
    __start() {
        const { rpc, receiveEventEndpoint } = this.#config;
        rpc.registerHandler(receiveEventEndpoint, ({ type, data }) => {
            super.dispatchEvent(new MessageEvent(type, { data: data ?? {} }));
        });
    }
}
//# sourceMappingURL=LynxCrossThreadContext.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/createBackgroundLynx.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.




function createBackgroundLynx(globalProps, customSections, nativeApp, mainThreadRpc) {
    const coreContext = new LynxCrossThreadContext({
        rpc: mainThreadRpc,
        receiveEventEndpoint: dispatchCoreContextOnBackgroundEndpoint,
        sendEventEndpoint: dispatchJSContextOnMainThreadEndpoint,
    });
    const devtoolContext = new LynxCrossThreadContext({
        rpc: mainThreadRpc,
        receiveEventEndpoint: dispatchDevtoolEventOnBackgroundEndpoint,
        sendEventEndpoint: dispatchDevtoolEventOnMainThreadEndpoint,
    });
    const fetchExternalBundle = mainThreadRpc.createCall(fetchExternalBundleEndpoint);
    return {
        __globalProps: globalProps,
        getJSModule(_moduleName) {
        },
        getNativeApp() {
            return nativeApp;
        },
        getCoreContext() {
            return coreContext;
        },
        getDevtool() {
            return devtoolContext;
        },
        getCustomSectionSync(key) {
            return customSections[key];
        },
        getCustomSection: createGetCustomSection(mainThreadRpc, customSections),
        queueMicrotask: (callback) => {
            queueMicrotask(callback);
        },
        createElement(_, id) {
            return createElement(id, mainThreadRpc);
        },
        getI18nResource: () => nativeApp.i18nResource.data,
        QueryComponent: (source, callback) => nativeApp.queryComponent(source, callback),
        reload: () => {
            mainThreadRpc.invoke(reloadEndpoint, []);
        },
        fetchBundle(url) {
            return fetchExternalBundle(url);
        },
        loadScript(sectionPath, options) {
            // `fetchBundle` registered the bundle's raw sections with the worker as
            // bts chunks (updateBTSChunk -> templateCache); hand the section's init
            // object to lynx-core (>= 0.1.4), which runs `_$executeInit` and caches
            // the resulting exports.
            return nativeApp.loadScript(sectionPath, options.bundleName);
        },
    };
}
//# sourceMappingURL=createBackgroundLynx.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/constants.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
const lynxUniqueIdAttribute = /*#__PURE__*/ 'l-uid';
const cssIdAttribute = /*#__PURE__*/ 'l-css-id';
const lynxEntryNameAttribute = /*#__PURE__*/ 'l-e-name';
const lynxDisposedAttribute = /*#__PURE__*/ 'l-disposed';
const lynxElementTemplateMarkerAttribute = 
/*#__PURE__*/ 'l-template';
const lynxPartIdAttribute = /*#__PURE__*/ 'dirtyID';
const lynxDefaultDisplayLinearAttribute = /*#__PURE__*/ 'lynx-default-display-linear';
const lynxEnableCSSInheritanceAttribute = /*#__PURE__*/ 'lynx-enable-css-inheritance';
const lynxDefaultOverflowVisibleAttribute /*#__PURE__*/ = 'lynx-default-overflow-visible';
const LYNX_TIMING_FLAG_ATTRIBUTE = 
/*#__PURE__*/ '__lynx_timing_flag';
const i18nResourceMissedEventName = 'i18nResourceMissed';
/**
 * Message event types the engine dispatches onto the Engine context proxy
 * returned by `lynx.getEngine()`.
 *
 * Mirrors the `kMessageEventType*` constants in
 * `core/runtime/js/runtime_constant.h` of the Lynx engine.
 */
const EngineMessageEventType = /*#__PURE__*/ (/* unused pure expression or super */ null && ({
    RenderPage: '__RenderPage',
    UpdatePage: '__UpdatePage',
    DestroyLifetime: '__DestroyLifetime',
    UpdateGlobalProps: '__UpdateGlobalProps',
}));
const uniqueIdSymbol = /*#__PURE__*/ (/* unused pure expression or super */ null && (Symbol('uniqueId')));
const systemInfoBase = /*#__PURE__*/ (/* unused pure expression or super */ null && ({
    platform: 'web',
    lynxSdkVersion: '3.0',
}));
const W3cEventNameToLynx = /*#__PURE__*/ {
    click: 'tap',
    lynxscroll: 'scroll',
    lynxscrollend: 'scrollend',
    overlaytouch: 'touch',
    lynxfocus: 'focus',
    lynxblur: 'blur',
    lynxinput: 'input',
};
const LynxEventNameToW3cCommon = 
/*#__PURE__*/ Object.fromEntries(Object.entries(W3cEventNameToLynx).map(([k, v]) => [v, k]));
const MagicHeader0 = /*#__PURE__*/ 0x41524453; // 'SDRA'
const MagicHeader1 = /*#__PURE__*/ 0x464F5257; // 'WROF'
const TemplateSectionLabel = /*#__PURE__*/ (/* unused pure expression or super */ null && ({
    Manifest: 1,
    StyleInfo: 2,
    LepusCode: 3,
    CustomSections: 4,
    ElementTemplates: 5,
    Configurations: 6,
}));
/**
 * const enum will be shakedown in Typescript Compiler
 */
var constants_ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["SUCCESS"] = 0] = "SUCCESS";
    ErrorCode[ErrorCode["UNKNOWN"] = 1] = "UNKNOWN";
    ErrorCode[ErrorCode["NODE_NOT_FOUND"] = 2] = "NODE_NOT_FOUND";
    ErrorCode[ErrorCode["METHOD_NOT_FOUND"] = 3] = "METHOD_NOT_FOUND";
    ErrorCode[ErrorCode["PARAM_INVALID"] = 4] = "PARAM_INVALID";
    ErrorCode[ErrorCode["SELECTOR_NOT_SUPPORTED"] = 5] = "SELECTOR_NOT_SUPPORTED";
    ErrorCode[ErrorCode["NO_UI_FOR_NODE"] = 6] = "NO_UI_FOR_NODE";
})(constants_ErrorCode || (constants_ErrorCode = {}));
const LYNX_TAG_TO_HTML_TAG_MAP = 
/*#__PURE__*/ Object.freeze(Object.assign(Object.create(null), {
    'view': 'x-view',
    'text': 'x-text',
    'image': 'x-image',
    'raw-text': 'raw-text',
    'scroll-view': 'x-scroll-view',
    'wrapper': 'lynx-wrapper',
    'list': 'x-list',
    'page': 'div',
    'input': 'x-input',
    'x-input-ng': 'x-input',
    'textarea': 'x-textarea',
    'x-textarea-ng': 'x-textarea',
    'viewpager': 'x-viewpager-ng',
    'viewpager-item': 'x-viewpager-item-ng',
    'webview': 'x-webview',
    'overlay': 'x-overlay-ng',
    'refresh': 'x-refresh-view',
    'refresh-header': 'x-refresh-header',
    'blur-view': 'x-blur-view',
    'scroll-coordinator': 'x-foldview-ng',
    'scroll-coordinator-header': 'x-foldview-header-ng',
    'scroll-coordinator-slot': 'x-foldview-slot-ng',
    'scroll-coordinator-slot-drag': 'x-foldview-slot-drag-ng',
    'scroll-coordinator-toolbar': 'x-foldview-toolbar-ng',
    'svg': 'x-svg',
    'frame': 'lynx-view',
}));
const HTML_TAG_TO_LYNX_TAG_MAP = 
/*#__PURE__*/ Object.freeze(Object.assign(Object.create(null), Object.fromEntries(Object.entries(LYNX_TAG_TO_HTML_TAG_MAP).map(([k, v]) => [v, k])), 
// Keep canonical Lynx-facing names deterministic when aliases share the
// same HTML custom element. SSR uses this map to match CSR behavior.
{
    'x-input': 'x-input-ng',
    'x-textarea': 'textarea',
    'x-viewpager-ng': 'x-viewpager-ng',
    'x-viewpager-item-ng': 'x-viewpager-item-ng',
    'x-webview': 'x-webview',
    'x-overlay-ng': 'x-overlay-ng',
    'x-refresh-view': 'x-refresh-view',
    'x-refresh-header': 'x-refresh-header',
    'x-blur-view': 'x-blur-view',
    'x-foldview-ng': 'x-foldview-ng',
    'x-foldview-header-ng': 'x-foldview-header-ng',
    'x-foldview-slot-ng': 'x-foldview-slot-ng',
    'x-foldview-slot-drag-ng': 'x-foldview-slot-drag-ng',
    'x-foldview-toolbar-ng': 'x-foldview-toolbar-ng',
}));
/**
 * also see packages/web-platform/web-core/src/constants.rs
 */
const LYNX_TAG_TO_DYNAMIC_LOAD_TAG_ID = 
/*#__PURE__*/ Object
    .freeze(Object.assign(Object.create(null), {
    'list': 0,
    'x-swiper': 1,
    'x-input': 2,
    'x-input-ng': 2,
    'input': 2,
    'x-textarea': 3,
    'x-audio-tt': 4,
    'x-foldview-ng': 5,
    'x-foldview-header-ng': 5,
    'x-foldview-slot-drag-ng': 5,
    'x-foldview-slot-ng': 5,
    'x-foldview-toolbar-ng': 5,
    'x-refresh-view': 6,
    'x-refresh-header': 6,
    'x-refresh-footer': 6,
    'x-overlay-ng': 7,
    'x-viewpager-ng': 8,
    'x-viewpager-item-ng': 8,
}));
const scrollContainerDom = Symbol.for('lynx-scroll-container-dom');
const loadUnknownElementEventName = 'loadUnknownElement';
var constants_IdentifierType;
(function (IdentifierType) {
    IdentifierType[IdentifierType["ID_SELECTOR"] = 0] = "ID_SELECTOR";
    /**
     * @deprecated
     */
    IdentifierType[IdentifierType["REF_ID"] = 1] = "REF_ID";
    IdentifierType[IdentifierType["UNIQUE_ID"] = 2] = "UNIQUE_ID";
})(constants_IdentifierType || (constants_IdentifierType = {}));
var constants_AnimationOperation;
(function (AnimationOperation) {
    AnimationOperation[AnimationOperation["START"] = 0] = "START";
    AnimationOperation[AnimationOperation["PLAY"] = 1] = "PLAY";
    AnimationOperation[AnimationOperation["PAUSE"] = 2] = "PAUSE";
    AnimationOperation[AnimationOperation["CANCEL"] = 3] = "CANCEL";
    AnimationOperation[AnimationOperation["FINISH"] = 4] = "FINISH";
})(constants_AnimationOperation || (constants_AnimationOperation = {}));
//# sourceMappingURL=constants.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/createInvokeUIMethod.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.


function createInvokeUIMethod(rpc) {
    return (type, identifier, component_id, method, params, callback, root_unique_id) => {
        rpc.invoke(invokeUIMethodEndpoint, [
            type,
            identifier,
            component_id,
            method,
            params,
            root_unique_id,
        ]).then(callback).catch((error) => {
            console.error(`[lynx-web] invokeUIMethod failed`, error);
            callback({
                code: constants_ErrorCode.UNKNOWN,
                data: '',
            });
        });
    };
}
//# sourceMappingURL=createInvokeUIMethod.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/registerPublicComponentEventHandler.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

function registerPublicComponentEventHandler(rpc, tt) {
    rpc.registerHandlerLazy(publicComponentEventEndpoint, tt, 'publicComponentEvent');
}
//# sourceMappingURL=registerPublicComponentEventHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/types/index.js
/*
 * Copyright 2025 The Lynx Authors. All rights reserved.
 * Licensed under the Apache License Version 2.0 that can be found in the
 * LICENSE file in the root directory of this source tree.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/createIntersectionObserverModule.js
// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

const DEFAULT_MARGINS = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};
const DEFAULT_OPTIONS = {
    thresholds: [0],
    initialRatio: 0,
    observeAll: false,
};
function createIntersectionObserverModule(rpc) {
    const sendCommand = rpc.createCall(intersectionObserverCommandEndpoint);
    const dispatch = (command) => {
        void sendCommand(command);
    };
    return {
        createIntersectionObserver(observerId, componentId, options) {
            dispatch({
                type: 'create',
                observerId,
                componentId,
                options: {
                    thresholds: options?.thresholds ?? DEFAULT_OPTIONS.thresholds,
                    initialRatio: options?.initialRatio ?? DEFAULT_OPTIONS.initialRatio,
                    observeAll: options?.observeAll ?? DEFAULT_OPTIONS.observeAll,
                },
            });
        },
        relativeTo(observerId, selector, margins) {
            dispatch({
                type: 'relativeTo',
                observerId,
                selector,
                margins: { ...DEFAULT_MARGINS, ...margins },
            });
        },
        relativeToViewport(observerId, margins) {
            dispatch({
                type: 'relativeToViewport',
                observerId,
                margins: { ...DEFAULT_MARGINS, ...margins },
            });
        },
        relativeToScreen(observerId, margins) {
            dispatch({
                type: 'relativeToScreen',
                observerId,
                margins: { ...DEFAULT_MARGINS, ...margins },
            });
        },
        observe(observerId, selector, callbackId) {
            dispatch({
                type: 'observe',
                observerId,
                selector,
                callbackId,
            });
        },
        disconnect(observerId) {
            dispatch({
                type: 'disconnect',
                observerId,
            });
        },
    };
}
//# sourceMappingURL=createIntersectionObserverModule.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/createNativeModules.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/* LYNX_NATIVE_MODULES_IMPORT */



async function createNativeModules(uiThreadRpc, mainThreadRpc, nativeModulesMap) {
    const switchExposure = mainThreadRpc.createCall(switchExposureServiceEndpoint);
    const nativeModulesCall = uiThreadRpc.createCall(nativeModulesCallEndpoint);
    const lynxExposureModule = {
        resumeExposure() {
            switchExposure(true, true);
        },
        stopExposure(param) {
            switchExposure(false, param.sendEvent ?? true);
        },
    };
    const bridgeModule = {
        call(name, data, callback) {
            nativeModulesCall(name, data, 'bridge').then(callback);
        },
    };
    const intersectionObserverModule = createIntersectionObserverModule(mainThreadRpc);
    const nativeModules = {};
    const customNativeModules = {};
    await Promise.all(Object.entries(nativeModulesMap).map(([moduleName, moduleStr]) => import(/* webpackIgnore: true */ moduleStr).then(module => customNativeModules[moduleName] = module?.default?.(nativeModules, (name, data) => nativeModulesCall(name, data, moduleName)))));
    /* LYNX_NATIVE_MODULES_ADD */
    return Object.assign(nativeModules, {
        bridge: bridgeModule,
        IntersectionObserverModule: intersectionObserverModule,
        LynxExposureModule: lynxExposureModule,
        ...customNativeModules,
    });
}
//# sourceMappingURL=createNativeModules.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/registerUpdateDataHandler.js

function registerUpdateDataHandler(rpc, tt) {
    rpc.registerHandlerLazy(updateDataEndpoint, tt, 'updateCardData');
}
//# sourceMappingURL=registerUpdateDataHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/registerPublishEventHandler.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

function registerPublishEventHandler(rpc, tt) {
    rpc.registerHandlerLazy(publishEventEndpoint, tt, 'publishEvent');
}
//# sourceMappingURL=registerPublishEventHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/createPerformanceApis.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
function getUserTimingPerformance() {
    const browserPerformance = globalThis.performance;
    if (!browserPerformance
        || typeof browserPerformance.mark !== 'function'
        || typeof browserPerformance.measure !== 'function') {
        return undefined;
    }
    return browserPerformance;
}
function markUserTiming(markName, option) {
    const browserPerformance = getUserTimingPerformance();
    if (!browserPerformance) {
        return false;
    }
    try {
        if (option === undefined) {
            browserPerformance.mark(markName);
        }
        else {
            try {
                browserPerformance.mark(markName, { detail: option });
            }
            catch {
                browserPerformance.mark(markName);
            }
        }
        return true;
    }
    catch {
        return false;
    }
}
function measureUserTiming(traceName, startMarkName, endMarkName, option) {
    const browserPerformance = getUserTimingPerformance();
    if (!browserPerformance) {
        return;
    }
    if (option === undefined) {
        try {
            browserPerformance.measure(traceName, startMarkName, endMarkName);
        }
        catch {
            // Do nothing.
        }
    }
    else {
        try {
            browserPerformance.measure(traceName, {
                start: startMarkName,
                end: endMarkName,
                detail: option,
            });
        }
        catch {
            try {
                browserPerformance.measure(traceName, startMarkName, endMarkName);
            }
            catch {
                // Do nothing.
            }
        }
    }
}
function createPerformanceApis(timingSystem) {
    let inc = 0;
    let profileFlowIdInc = 0;
    let profileMarkInc = 0;
    const profileTimingStack = [];
    const performanceApis = {
        generatePipelineOptions: () => {
            const newPipelineId = `_pipeline_` + (inc++);
            return {
                pipelineID: newPipelineId,
                needTimestamps: false,
            };
        },
        onPipelineStart: function () {
            // Do nothing
        },
        markPipelineTiming: function (pipelineId, timingKey) {
            timingSystem.markTimingInternal(timingKey, pipelineId);
        },
        bindPipelineIdWithTimingFlag: function (pipelineId, timingFlag) {
            if (!timingSystem.pipelineIdToTimingFlags.has(pipelineId)) {
                timingSystem.pipelineIdToTimingFlags.set(pipelineId, []);
            }
            const timingFlags = timingSystem.pipelineIdToTimingFlags.get(pipelineId);
            timingFlags.push(timingFlag);
        },
        profileStart: (traceName, option) => {
            const id = profileMarkInc++;
            const startMarkName = `lynx.profile:${id}:start:${traceName}`;
            if (markUserTiming(startMarkName, option)) {
                profileTimingStack.push({ traceName, startMarkName, option });
            }
        },
        profileEnd: () => {
            const profileTimingContext = profileTimingStack.pop();
            if (!profileTimingContext) {
                return;
            }
            const id = profileMarkInc++;
            const endMarkName = `lynx.profile:${id}:end:${profileTimingContext.traceName}`;
            if (!markUserTiming(endMarkName, profileTimingContext.option)) {
                getUserTimingPerformance()?.clearMarks?.(profileTimingContext.startMarkName);
                return;
            }
            measureUserTiming(profileTimingContext.traceName, profileTimingContext.startMarkName, endMarkName, profileTimingContext.option);
            const browserPerformance = getUserTimingPerformance();
            browserPerformance?.clearMarks?.(profileTimingContext.startMarkName);
            browserPerformance?.clearMarks?.(endMarkName);
        },
        profileMark: (traceName, option) => {
            markUserTiming(traceName, option);
        },
        profileFlowId: () => {
            return ++profileFlowIdInc;
        },
        isProfileRecording: () => {
            return getUserTimingPerformance() !== undefined;
        },
    };
    return performanceApis;
}
//# sourceMappingURL=createPerformanceApis.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/registerSendGlobalEvent.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

function registerSendGlobalEventHandler(rpc, tt) {
    rpc.registerHandler(sendGlobalEventEndpoint, (...args) => {
        tt.GlobalEventEmitter.emit(...args);
    });
}
//# sourceMappingURL=registerSendGlobalEvent.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/createJSObjectDestructionObserver.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
function createJSObjectDestructionObserver() {
    const registry = new FinalizationRegistry((callback) => callback());
    return (cleanupCallback) => {
        const observedObject = {};
        registry.register(observedObject, cleanupCallback);
        return observedObject;
    };
}
//# sourceMappingURL=createJSObjectDestructionObserver.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/registerUpdateGlobalPropsHandler.js

function registerUpdateGlobalPropsHandler(rpc, tt) {
    rpc.registerHandlerLazy(updateGlobalPropsEndpoint, tt, 'updateGlobalProps');
}
//# sourceMappingURL=registerUpdateGlobalPropsHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/registerUpdateI18nResource.js

function registerUpdateI18nResource(mainThreadRpc, i18nResource, tt) {
    // dispatchI18nResource from mts
    mainThreadRpc.registerHandler(dispatchI18nResourceEndpoint, (data) => {
        i18nResource.setData(data);
        tt.GlobalEventEmitter.emit('onI18nResourceReady', []);
    });
}
//# sourceMappingURL=registerUpdateI18nResource.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/createGetPathInfo.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.


function createGetPathInfo(rpc) {
    return (type, identifier, component_id, first_only, callback, root_unique_id) => {
        rpc.invoke(getPathInfoEndpoint, [
            type,
            identifier,
            component_id,
            first_only,
            root_unique_id,
        ]).then(callback).catch((error) => {
            console.error(`[lynx-web] getPathInfo failed`, error);
            callback({
                code: constants_ErrorCode.UNKNOWN,
                data: error.message || '',
            });
        });
    };
}
//# sourceMappingURL=createGetPathInfo.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/createChunkLoading.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
function createChunkLoading(entryTemplateUrl, cardType) {
    const templateCache = new Map();
    const readScript = (sourceURL, templateUrl) => {
        if (!templateUrl || templateUrl === '__Card__') {
            templateUrl = entryTemplateUrl;
        }
        const finalSourceURL = templateCache.get(templateUrl)?.[`/${sourceURL}`] ?? sourceURL;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', finalSourceURL, false);
        xhr.send(null);
        if (xhr.status === 200) {
            return xhr.responseText;
        }
        throw new Error(`Failed to load ${sourceURL}, status: ${xhr.status}`);
    };
    const readScriptAsync = async (sourceURL, templateUrl) => {
        if (!templateUrl || templateUrl === '__Card__') {
            templateUrl = entryTemplateUrl;
        }
        const finalSourceURL = templateCache.get(templateUrl)?.[`/${sourceURL}`] ?? sourceURL;
        return new Promise((resolve, reject) => {
            fetch(finalSourceURL).then((response) => {
                if (response.ok) {
                    response.text().then((text) => resolve(text), reject);
                }
                else {
                    reject(new Error(`Failed to load ${sourceURL}, status: ${response.status}`));
                }
            }, reject);
        });
    };
    const createBundleInitReturnObj = (jsContent) => {
        const paramNames = [
            'postMessage',
            'module',
            'exports',
            'lynxCoreInject',
            ...(cardType !== 'react' ? ['Card'] : []),
            'setTimeout',
            'setInterval',
            'clearInterval',
            'clearTimeout',
            'NativeModules',
            'console',
            ...(cardType !== 'react' ? ['Component'] : []),
            'ReactLynx',
            'nativeAppId',
            'Behavior',
            'LynxJSBI',
            'lynx',
            // BOM API
            'window',
            'document',
            'frames',
            'location',
            'navigator',
            'localStorage',
            'history',
            'Caches',
            'screen',
            'alert',
            'confirm',
            'prompt',
            // 'fetch',
            // 'XMLHttpRequest',
            'webkit',
            'Reporter',
            'print',
            'global',
            // Lynx API
            'requestAnimationFrame',
            'cancelAnimationFrame',
        ];
        const foo = new Function(...paramNames, jsContent);
        return {
            init(lynxCoreInject) {
                const module = { exports: {} };
                const tt = lynxCoreInject.tt;
                const args = [
                    undefined,
                    module,
                    module.exports,
                    lynxCoreInject,
                    ...(cardType !== 'react' ? [tt.Card.bind(tt)] : []),
                    tt.setTimeout,
                    tt.setInterval,
                    tt.clearInterval,
                    tt.clearTimeout,
                    tt.NativeModules,
                    tt.NativeModules?.LynxConsoleModule
                        ?? tt.sharedConsole
                        ?? globalThis.console,
                    ...(cardType !== 'react' ? [tt.Component.bind(tt)] : []),
                    tt.ReactLynx,
                    tt.nativeAppId,
                    tt.Behavior,
                    tt.LynxJSBI,
                    tt.lynx,
                    // BOM API
                    tt.window,
                    tt.document,
                    tt.frames,
                    tt.location,
                    tt.navigator,
                    tt.localStorage,
                    tt.history,
                    tt.Caches,
                    tt.screen,
                    tt.alert,
                    tt.confirm,
                    tt.prompt,
                    // tt.fetch,
                    // tt.XMLHttpRequest,
                    tt.webkit,
                    tt.Reporter,
                    tt.print,
                    tt.global,
                    tt.requestAnimationFrame,
                    tt.cancelAnimationFrame,
                ];
                foo.apply(undefined, args);
                return module.exports;
            },
        };
    };
    return {
        readScript,
        loadScript: (sourceURL, templateUrl) => {
            const jsContent = readScript(sourceURL, templateUrl);
            return createBundleInitReturnObj(jsContent);
        },
        loadScriptAsync: async (sourceURL, callback, templateUrl) => {
            readScriptAsync(sourceURL, templateUrl).then((jsContent) => {
                callback(null, createBundleInitReturnObj(jsContent));
            });
        },
        templateCache,
    };
}
//# sourceMappingURL=createChunkLoading.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/createNativeApp.js













let nativeAppCount = 0;
const sharedData = {};
class I18nResource {
    data;
    constructor(data) {
        this.data = data;
    }
    setData(data) {
        this.data = data;
    }
}
async function createNativeApp(mainThreadRpc, timingSystem, nativeModulesMap, entryTemplateUrl, cardType) {
    const performanceApis = createPerformanceApis(timingSystem);
    const callLepusMethod = mainThreadRpc.createCallbackify(callLepusMethodEndpoint, 2);
    const setNativeProps = mainThreadRpc.createCall(setNativePropsEndpoint);
    const triggerComponentEvent = mainThreadRpc.createCall(triggerComponentEventEndpoint);
    const selectComponent = mainThreadRpc.createCallbackify(selectComponentEndpoint, 3);
    const queryComponent = mainThreadRpc.createCall(queryComponentEndpoint);
    const reportError = mainThreadRpc.createCall(reportErrorEndpoint);
    const { templateCache, loadScript, loadScriptAsync, readScript } = createChunkLoading(entryTemplateUrl, cardType);
    mainThreadRpc.registerHandler(updateBTSChunkEndpoint, (url, btsChunkUrls) => {
        templateCache.set(url, btsChunkUrls);
    });
    const i18nResource = new I18nResource();
    let release = '';
    const nativeApp = {
        id: (nativeAppCount++).toString(),
        ...performanceApis,
        setTimeout: setTimeout,
        setInterval: setInterval,
        clearTimeout: clearTimeout,
        clearInterval: clearInterval,
        nativeModuleProxy: await createNativeModules(mainThreadRpc, mainThreadRpc, nativeModulesMap),
        readScript,
        loadScriptAsync,
        loadScript,
        requestAnimationFrame(cb) {
            return requestAnimationFrame(cb);
        },
        cancelAnimationFrame(handler) {
            return cancelAnimationFrame(handler);
        },
        callLepusMethod,
        setNativeProps,
        getPathInfo: createGetPathInfo(mainThreadRpc),
        invokeUIMethod: createInvokeUIMethod(mainThreadRpc),
        tt: null,
        setCard(tt) {
            registerPublicComponentEventHandler(mainThreadRpc, tt);
            registerPublishEventHandler(mainThreadRpc, tt);
            registerUpdateDataHandler(mainThreadRpc, tt);
            registerSendGlobalEventHandler(mainThreadRpc, tt);
            registerUpdateGlobalPropsHandler(mainThreadRpc, tt);
            registerUpdateI18nResource(mainThreadRpc, i18nResource, tt);
            timingSystem.registerGlobalEmitter(tt.GlobalEventEmitter);
            tt.lynx.getCoreContext().__start();
            tt.lynx.getDevtool().__start();
            nativeApp.tt = tt;
        },
        triggerComponentEvent,
        selectComponent,
        createJSObjectDestructionObserver: createJSObjectDestructionObserver(),
        setSharedData(dataKey, dataVal) {
            sharedData[dataKey] = dataVal;
        },
        getSharedData(dataKey) {
            return sharedData[dataKey];
        },
        i18nResource,
        reportException: (err, _) => reportError(err, _, release),
        __SetSourceMapRelease: (err) => release = err.message,
        __GetSourceMapRelease: (_url) => release,
        queryComponent: (source, callback) => {
            queryComponent(source).then(res => {
                callback?.(res);
            });
        },
    };
    mainThreadRpc.registerHandler(dispatchIntersectionObserverEventEndpoint, (observerId, callbackId, payload) => {
        nativeApp.tt?.onIntersectionObserverEvent(observerId, callbackId, payload);
    });
    return nativeApp;
}
//# sourceMappingURL=createNativeApp.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/crossThreadHandlers/registerDisposeHandler.js

function registerDisposeHandler(rpc, nativeApp, destroyCard, callDestroyLifetimeFun) {
    rpc.registerHandler(disposeEndpoint, () => {
        const id = nativeApp.id;
        // `callDestroyLifetimeFun` forwards to `tt.callDestroyLifetimeFun`, which is
        // injected by the ReactLynx background runtime (`injectTt`). Buildless
        // (vanilla / Lynx XML markup) cards run their own background script and
        // never install that hook, so lynx-core throws
        // "callDestroyLifetimeFun is not a function" for them. The framework
        // lifetime callback is optional, but `destroyCard` — which tears the app
        // down and drops it from `nativeGlobal.multiApps` — is not, so the throw
        // must not be allowed to skip it.
        try {
            callDestroyLifetimeFun(id);
        }
        catch (e) {
            // Nothing to report when the card simply has no framework lifetime hook;
            // a genuine failure inside a framework's callback is still surfaced.
            if (!isMissingLifetimeHookError(e)) {
                console.error('[lynx-web] error while calling the card destroy lifetime hook', e);
            }
        }
        destroyCard(id);
    });
}
/**
 * Whether `error` is lynx-core complaining that the card never installed
 * `tt.callDestroyLifetimeFun`, as opposed to a framework lifetime callback
 * failing on its own.
 */
function isMissingLifetimeHookError(error) {
    return error instanceof TypeError
        && error.message.includes('callDestroyLifetimeFun');
}
//# sourceMappingURL=registerDisposeHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/createNapiLoader.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/* LYNX_NAPI_MODULES_IMPORT */

const createNapiLoader = async (rpc, napiModulesMap) => {
    const napiModulesCall = rpc.createCall(napiModulesCallEndpoint);
    const napiModules = {};
    const listeners = new Set();
    rpc.registerHandler(dispatchNapiModuleEndpoint, (data) => {
        listeners.forEach((listener) => listener(data));
    });
    await Promise.all(Object.entries(napiModulesMap).map(([moduleName, moduleStr]) => import(/* webpackIgnore: true */ moduleStr).then((module) => (napiModules[moduleName] = module?.default?.(napiModules, (name, data) => napiModulesCall(name, data, moduleName), (func) => {
        listeners.add(func);
    })))));
    /* LYNX_NAPI_MODULES_ADD */
    return {
        load(moduleName) {
            return napiModules[moduleName];
        },
    };
};
//# sourceMappingURL=createNapiLoader.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/createTimingSystem.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

const ListenerKeys = {
    onSetup: 'lynx.performance.timing.onSetup',
    onUpdate: 'lynx.performance.timing.onUpdate',
};
function createTimingSystem(mainThreadRpc, uiThreadRpc) {
    let isFp = true;
    const setupTiming = {};
    const pipelineIdToTiming = new Map();
    const pipelineIdToTimingFlags = new Map();
    const dispatchLynxViewEvent = uiThreadRpc.createCall(dispatchLynxViewEventEndpoint);
    let commonTimingFlags = [];
    function markTimingInternal(markTimingRecords) {
        for (let { timingKey, pipelineId, timeStamp } of markTimingRecords) {
            if (!timeStamp)
                timeStamp = performance.now() + performance.timeOrigin;
            if (!pipelineId) {
                setupTiming[timingKey] = timeStamp;
                continue;
            }
            if (!pipelineIdToTiming.has(pipelineId)) {
                pipelineIdToTiming.set(pipelineId, {});
            }
            const timingInfo = pipelineIdToTiming.get(pipelineId);
            timingInfo[timingKey] = timeStamp;
        }
    }
    const registerGlobalEmitter = (globalEventEmitter) => {
        mainThreadRpc.registerHandler(postTimingFlagsEndpoint, (timingFlags, pipelineId) => {
            if (!pipelineId) {
                commonTimingFlags = commonTimingFlags.concat(timingFlags);
            }
            else
                timingFlags = timingFlags.concat(commonTimingFlags);
            if (isFp) {
                const timingInfo = {
                    extra_timing: {},
                    setup_timing: setupTiming,
                    update_timings: {},
                    metrics: {},
                    has_reload: false,
                    thread_strategy: 0,
                    url: '',
                };
                globalEventEmitter.emit(ListenerKeys.onSetup, [timingInfo]);
                dispatchLynxViewEvent('timing', setupTiming);
            }
            else {
                const timings = (pipelineId ? pipelineIdToTiming.get(pipelineId) : undefined) ?? {};
                const flags = [
                    ...timingFlags,
                    ...(pipelineIdToTimingFlags.get(pipelineId) ?? []),
                ];
                const timingInfo = {
                    extra_timing: {},
                    setup_timing: {},
                    update_timings: Object.fromEntries([...flags].map(flag => [flag, timings])),
                    metrics: {},
                    has_reload: false,
                    thread_strategy: 0,
                    url: '',
                };
                globalEventEmitter.emit(ListenerKeys.onUpdate, [timingInfo]);
                dispatchLynxViewEvent('timing', timings);
            }
            if (pipelineId) {
                pipelineIdToTimingFlags.delete(pipelineId);
                pipelineIdToTiming.delete(pipelineId);
            }
            if (isFp) {
                isFp = false;
            }
        });
    };
    mainThreadRpc.registerHandler(markTimingEndpoint, markTimingInternal);
    uiThreadRpc.registerHandler(markTimingEndpoint, markTimingInternal);
    return {
        markTimingInternal: (timingKey, pipelineId, timeStamp) => markTimingInternal([{ timingKey, pipelineId, timeStamp }]),
        registerGlobalEmitter,
        pipelineIdToTimingFlags,
    };
}
//# sourceMappingURL=createTimingSystem.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/background-apis/startBackgroundThread.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.







function startBackgroundThread(startMessage) {
    const { mainThreadMessagePort, napiModulesMap, nativeModulesMap, initData, globalProps, customSections, cardType, entryTemplateUrl, } = startMessage;
    const mainThreadPort = mainThreadMessagePort;
    const mainThreadRpc = new Rpc(mainThreadPort, 'bg-to-main');
    const timingSystem = createTimingSystem(mainThreadRpc, mainThreadRpc);
    timingSystem.markTimingInternal('load_core_start');
    const nativeApp = createNativeApp(mainThreadRpc, timingSystem, nativeModulesMap, entryTemplateUrl, cardType);
    const lynxCore = __webpack_require__.e(/* import() | lynx-core-chunk */ 177).then(__webpack_require__.bind(__webpack_require__, 6176));
    const napiLoader = createNapiLoader(mainThreadRpc, napiModulesMap);
    Promise.all([lynxCore, nativeApp, napiLoader]).then(([lynxCore, nativeApp, napiLoader]) => {
        timingSystem.markTimingInternal('load_core_end');
        globalThis['napiLoaderOnRT' + nativeApp.id] = napiLoader;
        const nativeLynx = createBackgroundLynx(globalProps, customSections, nativeApp, mainThreadRpc);
        const { loadCard, destroyCard, callDestroyLifetimeFun, nativeGlobal, loadDynamicComponent, } = lynxCore;
        // @lynx-js/lynx-core >= 0.1.3 will export nativeGlobal and loadDynamicComponent
        if (nativeGlobal && loadDynamicComponent) {
            nativeGlobal.loadDynamicComponent = loadDynamicComponent;
        }
        mainThreadRpc.registerHandler(BackgroundThreadStartEndpoint, () => {
            loadCard(nativeApp, {
                initData,
                cardType,
                // @ts-ignore
                updateData: initData,
            }, nativeLynx);
        });
        registerDisposeHandler(mainThreadRpc, nativeApp, destroyCard, callDestroyLifetimeFun);
    });
}
//# sourceMappingURL=startBackgroundThread.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/background/index.js

// @ts-expect-error
globalThis.nativeConsole = console;
globalThis.onmessage = async (ev) => {
    const message = ev
        .data;
    if (!globalThis.SystemInfo) {
        globalThis.SystemInfo = message.systemInfo;
    }
    startBackgroundThread(message);
};
Object.assign(globalThis, {
    module: { exports: null },
});
//# sourceMappingURL=index.js.map

},

});
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

// expose the modules object (__webpack_modules__)
__webpack_require__.m = __webpack_modules__;

// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, getters, values) => {
	var define = (defs, kind) => {
		for(var key in defs) {
			if(__webpack_require__.o(defs, key) && !__webpack_require__.o(exports, key)) {
				Object.defineProperty(exports, key, { enumerable: true, [kind]: defs[key] });
			}
		}
	};
	define(getters, "get");
	define(values, "value");
};
})();
// webpack/runtime/ensure_chunk
(() => {
__webpack_require__.f = {};
// This file contains only the entry chunk.
// The chunk loading function for additional chunks
__webpack_require__.e = (chunkId) => {
	return Promise.all(
		Object.keys(__webpack_require__.f).reduce((promises, key) => {
			__webpack_require__.f[key](chunkId, promises);
			return promises;
		}, [])
	);
};
})();
// webpack/runtime/get javascript chunk filename
(() => {
// This function allow to reference chunks
__webpack_require__.u = (chunkId) => {
  // return url for filenames not based on template
  
  // return url for filenames based on template
  return "static/js/async/" + "lynx-core-chunk" + "." + "28cac15a19" + ".js"
}
})();
// webpack/runtime/get mini-css chunk filename
(() => {
// This function allow to reference chunks
__webpack_require__.miniCssF = (chunkId) => {
  // return url for filenames not based on template
  
  // return url for filenames based on template
  return "" + chunkId + ".css"
}
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
// webpack/runtime/public_path
(() => {
__webpack_require__.p = "./";
})();
// webpack/runtime/import_scripts_chunk_loading
(() => {
var importScriptsInstalledChunks = {97: 1,};
// importScripts chunk loading
var importScriptsInstallChunk = (data) => {
    var [chunkIds, moreModules, runtime] = data;
    for (var moduleId in moreModules) {
        if (__webpack_require__.o(moreModules, moduleId)) {
            __webpack_require__.m[moduleId] = moreModules[moduleId];
        }
    }
    if (runtime) runtime(__webpack_require__);
    while (chunkIds.length) importScriptsInstalledChunks[chunkIds.pop()] = 1;
    importScriptsParentChunkLoadingFunction(data);
};

var importScriptsChunkLoadingGlobal = self["rspackChunklynx_basic_catalog"] = self["rspackChunklynx_basic_catalog"] || [];
var importScriptsParentChunkLoadingFunction = importScriptsChunkLoadingGlobal.push.bind(importScriptsChunkLoadingGlobal);
importScriptsChunkLoadingGlobal.push = importScriptsInstallChunk;
__webpack_require__.f.i = (chunkId, promises) => {
    
    // "1" is the signal for "already loaded
    if (!importScriptsInstalledChunks[chunkId]) {
        if (true) {
            
            importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
            
        }
    }
    
};

})();
// module factories are used so entry inlining is disabled
// startup
// Load entry module and return exports
var __webpack_exports__ = __webpack_require__(3685);
})()
;