"use strict";
(self["rspackChunklynx_basic_catalog"] = self["rspackChunklynx_basic_catalog"] || []).push([[109], {
9823(__unused_rspack___webpack_module__, __unused_rspack___webpack_exports__, __webpack_require__) {

// UNUSED EXPORTS: CommonEventsAndMethods, Component, bindSwitchToEventListener, bindToAttribute, bindToStyle, boostedQueueMicrotask, commonComponentEventSetting, genDomGetter, html, layoutChangeTarget, registerAttributeHandler, registerEventEnableStatusChangeHandler, registerStyleChangeHandler, scrollContainerDom, useScrollEnd

// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/constants.js
var constants = __webpack_require__(3077);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/createIFrameRealm.js
/*
 * Copyright (C) 2025 The Lynx Authors. All rights reserved.
 * Licensed under the Apache License Version 2.0 that can be found in the
 * LICENSE file in the root directory of this source tree.
 */
const existingScript = document.querySelector('script[nonce]');
const nonce = existingScript?.nonce || existingScript?.getAttribute('nonce');
/**
 * Creates a isolated JavaScript context for executing mts code.
 * This context has its own global variables and functions.
 */
async function createIFrameRealm(parent) {
    const iframe = document.createElement('iframe');
    const iframeReadyPromise = new Promise((resolve) => {
        const listener = (event) => {
            if (event.data === 'lynx:mtsready' && event.source === iframe.contentWindow) {
                resolve();
                globalThis.removeEventListener('message', listener);
            }
        };
        globalThis.addEventListener('message', listener);
    });
    iframe.style.display = 'none';
    iframe.srcdoc = '<!DOCTYPE html><html><head><script nonce="' + nonce
        + '">parent.postMessage("lynx:mtsready","*")</script></head><body style="display:none"></body></html>';
    iframe.sandbox = 'allow-same-origin allow-scripts'; // Restrict capabilities for security
    iframe.loading = 'eager';
    parent.appendChild(iframe);
    await iframeReadyPromise;
    const iframeWindow = iframe.contentWindow;
    const loadScript = async (url) => {
        const script = iframe.contentDocument.createElement('script');
        script.fetchPriority = 'high';
        script.defer = true;
        script.async = false;
        script.nonce = nonce || '';
        iframe.contentDocument.head.appendChild(script);
        return new Promise(async (resolve, reject) => {
            script.onload = () => {
                const ret = iframeWindow?.module?.exports;
                iframeWindow.module = { exports: undefined };
                resolve(ret);
            };
            script.onerror = (err) => reject(new Error(`Failed to load script: ${url}`, { cause: err }));
            iframeWindow.module = { exports: undefined };
            script.src = url;
        });
    };
    const loadScriptSync = (url) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, false); // Synchronous request
        xhr.send(null);
        if (xhr.status === 200) {
            const script = iframe.contentDocument.createElement('script');
            script.textContent = xhr.responseText;
            iframeWindow.module = { exports: undefined };
            iframe.contentDocument.head.appendChild(script);
            const ret = iframeWindow?.module?.exports;
            iframeWindow.module = { exports: undefined };
            return ret;
        }
        else {
            throw new Error(`Failed to load script: ${url}`, { cause: xhr });
        }
    };
    return { globalWindow: iframeWindow, loadScript, loadScriptSync };
}
//# sourceMappingURL=createIFrameRealm.js.map
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/TemplateManager.js
var TemplateManager = __webpack_require__(4231);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/LynxView.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.



__webpack_require__.e(/* import() | web-core-main-chunk */ 894, "high").then(__webpack_require__.bind(__webpack_require__, 6903));
/**
 * Based on our experiences, these elements are almost used in all lynx cards.
 */
/**
 * @property {string} url [required] (attribute: "url") The url of the entry of your Lynx card
 * @property {Cloneable} globalProps [optional] (attribute: "global-props") The globalProps value of this Lynx card
 * @property {Cloneable} initData [optional] (attribute: "init-data") The initial data of this Lynx card
 * @property {NativeModulesMap} nativeModulesMap [optional] use to customize NativeModules. key is module-name, value is esm url.
 * A `LynxConsoleModule` whose factory returns a Console-like object provides
 * the lexical `console` for this view's background bundles.
 * @property {NativeModulesCall} onNativeModulesCall [optional] the NativeModules value handler. Arguments will be cached before this property is assigned.
 * @property {"auto" | null} height [optional] (attribute: "height") set it to "auto" for height auto-sizing
 * @property {"auto" | null} width [optional] (attribute: "width") set it to "auto" for width auto-sizing
 * @property {NapiModulesMap} napiModulesMap [optional] the napiModule which is called in lynx-core. key is module-name, value is esm url.
 * @property {NapiModulesCall} onNapiModulesCall [optional] the NapiModule value handler.
 * @property {string[]} injectStyleRules [optional] the css rules which will be injected into shadowroot. Each items will be inserted by `insertRule` method. @see https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/insertRule
 * @property {number} lynxGroupId [optional] (attribute: "lynx-group-id") the background shared context id, which is used to share webworker between different lynx cards
 * @property {InitI18nResources} initI18nResources [optional] (attribute: "init-i18n-resources") the complete set of i18nResources that on the container side, which can be obtained synchronously by _I18nResourceTranslation
 *
 * @event error lynx card fired an error
 * @event i18nResourceMissed i18n resource cache miss
 * @event devtoolMessage a devtool event dispatched by the background thread
 *
 * @example
 * HTML Example
 *
 * Note that you should declarae the size of lynx-view
 *
 * ```html
 * <lynx-view url="https://path/to/main-thread.js" raw-data="{}" global-props="{}" style="height:300px;width:300px">
 * </lynx-view>
 * ```
 *
 * React 19 Example
 * ```jsx
 * <lynx-view url={myLynxCardUrl} rawData={{}} globalProps={{}} style={{height:'300px', width:'300px'}}>
 * </lynx-view>
 * ```
 */
class LynxViewElement extends HTMLElement {
    static lynxViewCount = 0;
    static tag = 'lynx-view';
    static observedAttributeAsProperties = [
        'url',
        'src',
        'global-props',
        'init-data',
        'data',
        'browser-config',
        'transform-vw',
        'transform-vh',
        'transform-rem',
    ];
    /**
     * @private
     */
    static observedAttributes = LynxViewElement.observedAttributeAsProperties.map(nm => nm.toLowerCase());
    #instance;
    #connected = false;
    #url;
    /**
     * @public
     * @property nativeModulesMap
     * @default {}
     * A `LynxConsoleModule` whose factory returns a Console-like object provides
     * the lexical `console` for this view's background bundles.
     */
    nativeModulesMap;
    /**
     * @param
     * @property napiModulesMap
     * @default {}
     */
    napiModulesMap;
    /**
     * @param
     * @property
     */
    onNapiModulesCall;
    #browserConfig;
    /**
     * @public
     * @property browserConfig
     */
    get browserConfig() {
        return this.#browserConfig;
    }
    set browserConfig(val) {
        if (typeof val === 'string') {
            try {
                this.#browserConfig = JSON.parse(val);
            }
            catch (e) {
                console.error('Invalid browser-config', e);
            }
        }
        else {
            this.#browserConfig = val;
        }
    }
    #transformVW = false;
    /**
     * @public
     * @property transformVW
     * Enable evaluating vw subset to the current LynxView container width
     */
    get transformVW() {
        return this.#transformVW;
    }
    set transformVW(val) {
        this.#transformVW = val;
        if (val) {
            this.setAttribute('transform-vw', '');
        }
        else {
            this.removeAttribute('transform-vw');
        }
    }
    #transformVH = false;
    /**
     * @public
     * @property transformVH
     * Enable evaluating vh subset to the current LynxView container height
     */
    get transformVH() {
        return this.#transformVH;
    }
    set transformVH(val) {
        this.#transformVH = val;
        if (val) {
            this.setAttribute('transform-vh', '');
        }
        else {
            this.removeAttribute('transform-vh');
        }
    }
    #transformREM = false;
    /**
     * @public
     * @property transformREM
     * Enable evaluating rem unit to the current CSS var(--rem-unit)
     */
    get transformREM() {
        return this.#transformREM;
    }
    set transformREM(val) {
        this.#transformREM = val;
        if (val) {
            this.setAttribute('transform-rem', '');
        }
        else {
            this.removeAttribute('transform-rem');
        }
    }
    constructor() {
        super();
        if (!this.onNativeModulesCall) {
            this.onNativeModulesCall = (name, data, moduleName) => {
                return new Promise((resolve) => {
                    this.#cachedNativeModulesCall.push({
                        args: [name, data, moduleName],
                        resolve,
                    });
                });
            };
        }
    }
    /**
     * @public
     * @property the url of lynx view output entry file
     */
    get url() {
        return this.#url;
    }
    set url(val) {
        if (this.#url === val) {
            return;
        }
        this.#url = val;
        this.#render();
    }
    get src() {
        return this.url;
    }
    set src(val) {
        this.url = val;
    }
    #globalProps = {};
    /**
     * @public
     * @property globalProps
     * @default {}
     */
    get globalProps() {
        return this.#globalProps;
    }
    set globalProps(val) {
        const nextGlobalProps = typeof val === 'string' ? JSON.parse(val) : val;
        this.#globalProps = nextGlobalProps;
        this.#instance?.updateGlobalProps(nextGlobalProps);
    }
    get ['global-props']() {
        return this.globalProps;
    }
    set ['global-props'](val) {
        this.globalProps = val;
    }
    #initData = {};
    /**
     * @public
     * @property initData
     * @default {}
     */
    get initData() {
        return this.#initData;
    }
    set initData(val) {
        const nextInitData = typeof val === 'string' ? JSON.parse(val) : val;
        this.updateData(nextInitData);
    }
    get ['init-data']() {
        return this.initData;
    }
    set ['init-data'](val) {
        this.initData = val;
    }
    get data() {
        return this.initData;
    }
    set data(val) {
        this.initData = val;
    }
    #initI18nResources = [];
    /**
     * @public
     * @property initI18nResources
     * @default {}
     */
    get initI18nResources() {
        return this.#initI18nResources;
    }
    set initI18nResources(val) {
        if (typeof val === 'string') {
            this.#initI18nResources = JSON.parse(val);
        }
        else {
            this.#initI18nResources = val;
        }
    }
    /**
     * @public
     * @method
     * update the `__initData` and trigger essential flow
     */
    updateI18nResources(data, options) {
        this.#instance?.i18nManager.updateData(data, options);
    }
    #cachedNativeModulesCall = [];
    #onNativeModulesCall;
    /**
     * @param
     * @property
     */
    get onNativeModulesCall() {
        return this.#onNativeModulesCall;
    }
    set onNativeModulesCall(handler) {
        this.#onNativeModulesCall = handler;
        for (const callInfo of this.#cachedNativeModulesCall) {
            callInfo.resolve(handler.apply(undefined, callInfo.args));
        }
        this.#cachedNativeModulesCall = [];
    }
    /**
     * @param
     * @property
     */
    get lynxGroupId() {
        return this.getAttribute('lynx-group-id')
            ? Number(this.getAttribute('lynx-group-id'))
            : undefined;
    }
    set lynxGroupId(val) {
        if (val) {
            this.setAttribute('lynx-group-id', val.toString());
        }
        else {
            this.removeAttribute('lynx-group-id');
        }
    }
    /**
     * @public
     * @method
     * update the `__initData` and trigger essential flow
     */
    updateData(data, processorName, callback) {
        this.#initData = data;
        this.#instance?.updateData(data, processorName).then(() => {
            callback?.();
        });
    }
    /**
     * @public
     * @method
     * update the `__globalProps`
     */
    updateGlobalProps(data) {
        this.globalProps = data;
    }
    /**
     * @public
     * @method
     * send global events, which can be listened to using the GlobalEventEmitter
     */
    sendGlobalEvent(eventName, params) {
        this.#instance?.backgroundThread.sendGlobalEvent(eventName, params);
    }
    /**
     * @public
     * @method
     * send a devtool event to the background thread, which can be listened to
     * using `lynx.getDevtool().addEventListener()`
     */
    sendDevtoolEvent(eventName, data) {
        this.#instance?.backgroundThread.sendDevtoolEvent({
            type: eventName,
            data,
        });
    }
    /**
     * @public
     * @method
     * reload the current page
     */
    reload() {
        this.removeAttribute('ssr');
        this.#render();
    }
    /**
     * @override
     * "false" value will be omitted
     *
     * {@inheritdoc HTMLElement.setAttribute}
     */
    setAttribute(qualifiedName, value) {
        if (value === 'false') {
            this.removeAttribute(qualifiedName);
        }
        else {
            super.setAttribute(qualifiedName, value);
        }
    }
    /**
     * @private
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            switch (name) {
                case 'url':
                case 'src':
                    this.url = newValue ?? undefined;
                    break;
                case 'global-props':
                    this.globalProps = newValue ? JSON.parse(newValue) : {};
                    break;
                case 'browser-config':
                    this.browserConfig = newValue ? JSON.parse(newValue) : undefined;
                    break;
                case 'init-data':
                case 'data':
                    this.initData = newValue ? JSON.parse(newValue) : {};
                    break;
                case 'transform-vw':
                    this.transformVW = newValue !== 'false' && newValue !== null;
                    break;
                case 'transform-vh':
                    this.transformVH = newValue !== 'false' && newValue !== null;
                    break;
                case 'transform-rem':
                    this.transformREM = newValue !== 'false' && newValue !== null;
                    break;
            }
        }
    }
    injectStyleRules;
    #disposePromise;
    /**
     * @private
     */
    disconnectedCallback() {
        this.#connected = false;
        this.#disposeInstance();
    }
    async #disposeInstance() {
        if (this.#disposePromise) {
            return this.#disposePromise;
        }
        const dispose = async () => {
            this.shadowRoot?.querySelector('[part="page"]')
                ?.setAttribute(constants/* .lynxDisposedAttribute */.JA, '');
            const oldInstance = this.#instance;
            this.#instance = undefined;
            if (oldInstance) {
                await oldInstance[Symbol.asyncDispose]();
            }
            if (this.shadowRoot) {
                this.shadowRoot.innerHTML = '';
                this.shadowRoot.adoptedStyleSheets = [];
            }
        };
        this.#disposePromise = dispose();
        await this.#disposePromise;
        this.#disposePromise = undefined;
    }
    /**
     * @#the flag to group all changes into one render operation
     */
    #rendering = false;
    /**
     * @private
     */
    async #render() {
        if (!this.#rendering && this.#connected && this.#url) {
            this.#rendering = true;
            if (!this.shadowRoot) {
                this.attachShadow({ mode: 'open' });
            }
            if (this.#instance || this.#disposePromise) {
                await this.#disposeInstance();
            }
            const mtsRealmPromise = createIFrameRealm(this.shadowRoot);
            queueMicrotask(async () => {
                if (this.injectStyleRules && this.injectStyleRules.length > 0) {
                    const styleSheet = new CSSStyleSheet();
                    for (const rule of this.injectStyleRules) {
                        styleSheet.insertRule(rule);
                    }
                    this.shadowRoot.adoptedStyleSheets = this.shadowRoot
                        .adoptedStyleSheets.concat(styleSheet);
                }
                const mtsRealm = await mtsRealmPromise;
                if (this.#url) {
                    const lynxViewInstance = __webpack_require__.e(/* import() | web-core-main-chunk */ 894, "high").then(__webpack_require__.bind(__webpack_require__, 6903)).then(({ LynxViewInstance }) => {
                        const isSSR = this.hasAttribute('ssr');
                        if (isSSR) {
                            this.removeAttribute('ssr');
                        }
                        return new LynxViewInstance(this, this.initData, this.globalProps, this.#url, this.shadowRoot, mtsRealm, isSSR, lynxGroupId, this.nativeModulesMap, this.napiModulesMap, this.#initI18nResources, this.transformVW, this.transformVH, this.transformREM, this.browserConfig);
                    });
                    TemplateManager/* .templateManager.fetchBundle */.Q.fetchBundle(this.#url, lynxViewInstance, this.transformVW, this.transformVH, this.transformREM, undefined);
                    const lynxGroupId = this.lynxGroupId;
                    this.#instance = await lynxViewInstance;
                    this.#rendering = false;
                }
            });
        }
    }
    #upgradeProperty(prop) {
        if (Object.prototype.hasOwnProperty.call(this, prop)) {
            const value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }
    /**
     * @private
     */
    connectedCallback() {
        this.#upgradeProperty('url');
        this.#upgradeProperty('src');
        this.#upgradeProperty('globalProps');
        this.#upgradeProperty('global-props');
        this.#upgradeProperty('initData');
        this.#upgradeProperty('init-data');
        this.#upgradeProperty('data');
        this.#upgradeProperty('browserConfig');
        this.#upgradeProperty('transformVW');
        this.#upgradeProperty('transformVH');
        this.#upgradeProperty('transformREM');
        if (this.url) {
            this.#url = this.url;
        }
        this.#connected = true;
        this.#render();
    }
}
if (customElements.get(LynxViewElement.tag)) {
    console.error(`[${LynxViewElement.tag}] has already been defined`);
}
else {
    customElements.define(LynxViewElement.tag, LynxViewElement);
}
//# sourceMappingURL=LynxView.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/css/index.css
// extracted by css-extract-rspack-plugin

// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/index.js + 11 modules
var element_reactive = __webpack_require__(3210);
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/common/CommonEventsAndMethods.js
var CommonEventsAndMethods = __webpack_require__(8969);
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/common/commonEventInitConfiguration.js
var commonEventInitConfiguration = __webpack_require__(2233);
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/common/constants.js
var common_constants = __webpack_require__(7683);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements
 *
 * This module exports the common utilities and types for Lynx Web Elements.
 *
 * It acts as the shared foundation for all specific element implementations.
 * Note that it does NOT export the elements themselves; use `all.ts` or specific element paths for that.
 */




//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/index.js



//# sourceMappingURL=index.js.map

},
4231(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/* import */ var _constants_js__rspack_import_0 = __webpack_require__(3077);
/*
 * Copyright 2025 The Lynx Authors. All rights reserved.
 * Licensed under the Apache License Version 2.0 that can be found in the
 * LICENSE file in the root directory of this source tree.
 */

const wasm = Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 3384));
class TemplateManager {
    #bundles = new Map();
    #loadingBundles = new Map();
    #loadingPromises = new Map();
    #lynxViewInstancesMap = new Map();
    #pendingResolves = new Map();
    #worker = null;
    #workerReadyPromise = null;
    #resolveWorkerReady = null;
    constructor() {
        this.#ensureWorker();
    }
    fetchBundle(url, lynxViewInstancePromise, transformVW, transformVH, transformREM, overrideConfig) {
        if (this.#bundles.has(url)) {
            return (async () => {
                const bundle = this.#bundles.get(url);
                const config = (bundle?.config || {});
                const lynxViewInstance = await lynxViewInstancePromise;
                lynxViewInstance.backgroundThread.markTiming('decode_start');
                lynxViewInstance.onPageConfigReady(config);
                lynxViewInstance.onStyleInfoReady(url);
                lynxViewInstance.onMTSScriptsLoaded(url, config.isLazy === 'true');
                lynxViewInstance.onBTSScriptsLoaded(url);
            })();
        }
        else if (this.#loadingPromises.has(url)) {
            return this.#loadingPromises.get(url).then(async () => {
                const bundle = this.#bundles.get(url);
                const config = (bundle?.config || {});
                const lynxViewInstance = await lynxViewInstancePromise;
                lynxViewInstance.backgroundThread.markTiming('decode_start');
                lynxViewInstance.onPageConfigReady(config);
                lynxViewInstance.onStyleInfoReady(url);
                lynxViewInstance.onMTSScriptsLoaded(url, config.isLazy === 'true');
                lynxViewInstance.onBTSScriptsLoaded(url);
            });
        }
        else {
            this.createBundle(url);
            const promise = this.#load(url, lynxViewInstancePromise, transformVW, transformVH, transformREM, overrideConfig);
            this.#loadingPromises.set(url, promise);
            return promise;
        }
    }
    async #load(url, lynxViewInstancePromise, transformVW, transformVH, transformREM, overrideConfig) {
        const currentTime = performance.now() + performance.timeOrigin;
        lynxViewInstancePromise.then((instance) => {
            instance.backgroundThread.markTiming('fetch_start', undefined, currentTime);
        });
        this.#lynxViewInstancesMap.set(url, lynxViewInstancePromise);
        await this.#ensureWorker();
        const msg = {
            type: 'load',
            url,
            fetchUrl: (new URL(url, location.href)).toString(),
            transformVW,
            transformVH,
            transformREM,
            overrideConfig,
        };
        this.#worker.postMessage(msg);
        return new Promise((resolve, reject) => {
            this.#pendingResolves.set(url, { resolve, reject });
        });
    }
    #resolvePromise(url) {
        const promise = this.#pendingResolves.get(url);
        if (promise) {
            promise.resolve();
            this.#pendingResolves.delete(url);
        }
    }
    #rejectPromise(url, reason) {
        const promise = this.#pendingResolves.get(url);
        if (promise) {
            promise.reject(reason);
            this.#pendingResolves.delete(url);
        }
    }
    #ensureWorker() {
        if (!this.#worker) {
            this.#workerReadyPromise = new Promise((resolve) => {
                this.#resolveWorkerReady = resolve;
            });
            this.#worker = new Worker(new URL(
            /* webpackFetchPriority: "high" */
            /* webpackChunkName: "web-core-template-loader-thread" */
            /* webpackPrefetch: true */
            /* webpackPreload: true */
            /* worker import */__webpack_require__.p + __webpack_require__.u(350), __webpack_require__.b), Object.assign({}, { type: 'module' }, { type: undefined }));
            this.#worker.onmessage = this.#handleMessage.bind(this);
            this.#workerReadyPromise.then(() => {
                wasm.then(({ wasmModule }) => {
                    this.#worker.postMessage({
                        type: 'init',
                        wasmModule,
                    });
                });
            });
            return this.#workerReadyPromise;
        }
        else if (this.#workerReadyPromise) {
            return this.#workerReadyPromise;
        }
    }
    #handleMessage(event) {
        const msg = event.data;
        if (msg.type === 'ready') {
            if (this.#resolveWorkerReady) {
                this.#resolveWorkerReady();
                this.#resolveWorkerReady = null;
                this.#workerReadyPromise = null;
            }
            return;
        }
        if (msg.type === 'heartbreak') {
            this.#worker?.postMessage({ type: 'heartbreak' });
            return;
        }
        const { url } = msg;
        const lynxViewInstancePromise = this.#lynxViewInstancesMap.get(url);
        if (!lynxViewInstancePromise)
            return;
        switch (msg.type) {
            case 'section':
                /**
                 * The lynxViewInstance is already awaited the wasm is ready
                 */
                this.#handleSection(msg, lynxViewInstancePromise);
                break;
            case 'error':
                console.error(`Error decoding bundle ${url}:`, msg.error);
                this.#cleanup(url);
                this.#removeBundle(url);
                this.#rejectPromise(url, new Error(msg.error));
                this.#loadingPromises.delete(url);
                break;
            case 'done':
                this.#cleanup(url);
                const bundle = this.#loadingBundles.get(url);
                if (bundle) {
                    this.#bundles.set(url, bundle);
                    this.#loadingBundles.delete(url);
                }
                this.#resolvePromise(url);
                this.#loadingPromises.delete(url);
                /* TODO: The promise resolution is deferred inside .then() without error handling.
                 *
                 */
                lynxViewInstancePromise.then((instance) => {
                    instance.backgroundThread.markTiming('decode_end');
                    instance.backgroundThread.markTiming('load_template_start');
                });
                break;
        }
    }
    async #handleSection(msg, instancePromise) {
        const [instance, StyleSheetResource,] = await Promise.all([
            instancePromise,
            wasm.then((wasm) => (wasm.wasmInstance.StyleSheetResource)),
        ]);
        const { label, data, url, config } = msg;
        switch (label) {
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.Configurations */.eC.Configurations: {
                instance.backgroundThread.markTiming('decode_start');
                this.#setConfig(url, data);
                instance.onPageConfigReady(data);
                break;
            }
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.StyleInfo */.eC.StyleInfo: {
                const resource = new StyleSheetResource(new Uint8Array(data), document);
                const bundle = this.#loadingBundles.get(url);
                if (bundle) {
                    bundle.styleSheet = resource;
                }
                instance.onStyleInfoReady(url);
                break;
            }
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.LepusCode */.eC.LepusCode: {
                const blobMap = data;
                this.#setLepusCode(url, blobMap);
                instance.onMTSScriptsLoaded(url, config['isLazy'] === 'true');
                break;
            }
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.CustomSections */.eC.CustomSections: {
                this.#setCustomSection(url, data);
                break;
            }
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.Manifest */.eC.Manifest: {
                const blobMap = data;
                this.#setBackgroundCode(url, blobMap);
                instance.onBTSScriptsLoaded(url);
                break;
            }
            default:
                throw new Error(`Unknown section label: ${label}`);
        }
    }
    #cleanup(url) {
        this.#lynxViewInstancesMap.delete(url);
    }
    createBundle(url) {
        if (this.#bundles.has(url)) {
            const bundle = this.#bundles.get(url);
            if (bundle) {
                if (bundle.lepusCode) {
                    for (const blobUrl of Object.values(bundle.lepusCode)) {
                        URL.revokeObjectURL(blobUrl);
                    }
                }
                if (bundle.backgroundCode) {
                    for (const blobUrl of Object.values(bundle.backgroundCode)) {
                        URL.revokeObjectURL(blobUrl);
                    }
                }
                if (bundle.styleSheet) {
                    bundle.styleSheet.free();
                }
            }
            this.#bundles.delete(url);
        }
        if (this.#loadingBundles.has(url)) {
            const bundle = this.#loadingBundles.get(url);
            if (bundle) {
                if (bundle.lepusCode) {
                    for (const blobUrl of Object.values(bundle.lepusCode)) {
                        URL.revokeObjectURL(blobUrl);
                    }
                }
                if (bundle.backgroundCode) {
                    for (const blobUrl of Object.values(bundle.backgroundCode)) {
                        URL.revokeObjectURL(blobUrl);
                    }
                }
                if (bundle.styleSheet) {
                    bundle.styleSheet.free();
                }
            }
            this.#loadingBundles.delete(url);
        }
        this.#loadingBundles.set(url, {});
    }
    #removeBundle(url) {
        this.createBundle(url); // This actually clears it in current logic
        this.#loadingBundles.delete(url);
    }
    #setConfig(url, config) {
        const bundle = this.#loadingBundles.get(url);
        if (bundle) {
            bundle.config = config;
        }
    }
    #setLepusCode(url, lepusCode) {
        const bundle = this.#loadingBundles.get(url);
        if (bundle) {
            bundle.lepusCode = lepusCode;
        }
    }
    #setCustomSection(url, customSections) {
        const bundle = this.#loadingBundles.get(url);
        if (bundle) {
            bundle.customSections = customSections;
        }
    }
    #setBackgroundCode(url, backgroundCode) {
        const bundle = this.#loadingBundles.get(url);
        if (bundle) {
            bundle.backgroundCode = backgroundCode;
        }
    }
    getBundle(url) {
        return this.#bundles.get(url) || this.#loadingBundles.get(url);
    }
    getStyleSheet(url) {
        return this.getBundle(url)?.styleSheet;
    }
}
const templateManager = new TemplateManager();
//# sourceMappingURL=TemplateManager.js.map
__webpack_require__.d(__webpack_exports__, {
}, {
  Q: templateManager
});


},
3384(__webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.a(__webpack_module__, async function (__rspack_load_async_deps, __rspack_async_done) { try {
__webpack_require__.r(__webpack_exports__);
/* import */ var wasm_feature_detect__rspack_import_0 = __webpack_require__(1773);
/*
 * Copyright 2025 The Lynx Authors. All rights reserved.
 * Licensed under the Apache License Version 2.0 that can be found in the
 * LICENSE file in the root directory of this source tree.
 */

const isWorker = typeof WorkerGlobalScope !== 'undefined'
    && self instanceof WorkerGlobalScope;
const wasmLoaded = Promise.all([(0,wasm_feature_detect__rspack_import_0/* .referenceTypes */.rO)(), (0,wasm_feature_detect__rspack_import_0/* .simd */.oR)()]).then(([supportsReferenceTypes, supportsSimd]) => {
    if (supportsReferenceTypes && supportsSimd) {
        return Promise.all([
            Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 3622)),
            isWorker ? undefined : WebAssembly.compileStreaming(fetch(new URL(
            /* webpackChunkName: "standard-wasm" */
            /* webpackMode: "eager" */
            /* webpackFetchPriority: "high" */
            /* webpackPrefetch: true */
            /* webpackPreload: true */
            /* asset import */__webpack_require__(917), __webpack_require__.b))),
        ]);
    }
    else {
        return Promise.all([
            __webpack_require__.e(/* import() | legacy-wasm-js */ 778, "low").then(__webpack_require__.bind(__webpack_require__, 7702)),
            isWorker ? undefined : WebAssembly.compileStreaming(fetch(new URL(
            /* webpackChunkName: "legacy-wasm" */
            /* webpackMode: "lazy" */
            /* webpackFetchPriority: "low" */
            /* webpackPrefetch: false */
            /* webpackPreload: false */
            /* asset import */__webpack_require__(469), __webpack_require__.b))),
        ]);
    }
});
const [wasmInstance, wasmModule] = await wasmLoaded;
if (!isWorker) {
    await wasmInstance.default(wasmModule);
}
//# sourceMappingURL=wasm.js.map
__webpack_require__.d(__webpack_exports__, {
}, {
  wasmInstance: wasmInstance,
  wasmModule: wasmModule
});

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } }, 1);

},
3077(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
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
const EngineMessageEventType = /*#__PURE__*/ {
    RenderPage: '__RenderPage',
    UpdatePage: '__UpdatePage',
    DestroyLifetime: '__DestroyLifetime',
    UpdateGlobalProps: '__UpdateGlobalProps',
};
const uniqueIdSymbol = /*#__PURE__*/ Symbol('uniqueId');
const systemInfoBase = /*#__PURE__*/ {
    platform: 'web',
    lynxSdkVersion: '3.0',
};
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
const TemplateSectionLabel = /*#__PURE__*/ {
    Manifest: 1,
    StyleInfo: 2,
    LepusCode: 3,
    CustomSections: 4,
    ElementTemplates: 5,
    Configurations: 6,
};
/**
 * const enum will be shakedown in Typescript Compiler
 */
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["SUCCESS"] = 0] = "SUCCESS";
    ErrorCode[ErrorCode["UNKNOWN"] = 1] = "UNKNOWN";
    ErrorCode[ErrorCode["NODE_NOT_FOUND"] = 2] = "NODE_NOT_FOUND";
    ErrorCode[ErrorCode["METHOD_NOT_FOUND"] = 3] = "METHOD_NOT_FOUND";
    ErrorCode[ErrorCode["PARAM_INVALID"] = 4] = "PARAM_INVALID";
    ErrorCode[ErrorCode["SELECTOR_NOT_SUPPORTED"] = 5] = "SELECTOR_NOT_SUPPORTED";
    ErrorCode[ErrorCode["NO_UI_FOR_NODE"] = 6] = "NO_UI_FOR_NODE";
})(ErrorCode || (ErrorCode = {}));
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
var IdentifierType;
(function (IdentifierType) {
    IdentifierType[IdentifierType["ID_SELECTOR"] = 0] = "ID_SELECTOR";
    /**
     * @deprecated
     */
    IdentifierType[IdentifierType["REF_ID"] = 1] = "REF_ID";
    IdentifierType[IdentifierType["UNIQUE_ID"] = 2] = "UNIQUE_ID";
})(IdentifierType || (IdentifierType = {}));
var AnimationOperation;
(function (AnimationOperation) {
    AnimationOperation[AnimationOperation["START"] = 0] = "START";
    AnimationOperation[AnimationOperation["PLAY"] = 1] = "PLAY";
    AnimationOperation[AnimationOperation["PAUSE"] = 2] = "PAUSE";
    AnimationOperation[AnimationOperation["CANCEL"] = 3] = "CANCEL";
    AnimationOperation[AnimationOperation["FINISH"] = 4] = "FINISH";
})(AnimationOperation || (AnimationOperation = {}));
//# sourceMappingURL=constants.js.map
__webpack_require__.d(__webpack_exports__, {
  O4: () => (ErrorCode),
  Uc: () => (AnimationOperation),
  Wx: () => (IdentifierType)
}, {
  $4: W3cEventNameToLynx,
  Fd: uniqueIdSymbol,
  Gm: lynxDefaultDisplayLinearAttribute,
  H1: LYNX_TAG_TO_HTML_TAG_MAP,
  JA: lynxDisposedAttribute,
  Pb: lynxEntryNameAttribute,
  RM: systemInfoBase,
  Ye: EngineMessageEventType,
  eC: TemplateSectionLabel,
  f7: lynxDefaultOverflowVisibleAttribute,
  hv: i18nResourceMissedEventName,
  im: LynxEventNameToW3cCommon,
  li: scrollContainerDom,
  oZ: lynxPartIdAttribute,
  qh: lynxEnableCSSInheritanceAttribute,
  u9: loadUnknownElementEventName,
  vh: HTML_TAG_TO_LYNX_TAG_MAP,
  xW: LYNX_TIMING_FLAG_ATTRIBUTE,
  y: lynxElementTemplateMarkerAttribute
});


},
3210(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  uA: () => (/* reexport */ Component),
  LB: () => (/* reexport */ bindSwitchToEventListener),
  H$: () => (/* reexport */ bindToAttribute),
  _8: () => (/* reexport */ bindToStyle),
  JS: () => (/* reexport */ boostedQueueMicrotask),
  Ut: () => (/* reexport */ genDomGetter),
  qy: () => (/* reexport */ html),
  _y: () => (/* reexport */ registerAttributeHandler),
  ZR: () => (/* reexport */ registerEventEnableStatusChangeHandler),
  h3: () => (/* reexport */ registerStyleChangeHandler)
});

;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/boostedQueueMicrotask.js
/**
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/
let queuedFunctions = [];
function __executeNextMicrotask() {
    const currentQueuedFunction = queuedFunctions;
    queuedFunctions = [];
    for (const [foo, that] of currentQueuedFunction) {
        that ? foo.call(that) : foo();
    }
}
function boostedQueueMicrotask(foo, that) {
    if (queuedFunctions.length === 0) {
        queueMicrotask(__executeNextMicrotask);
    }
    queuedFunctions.push([foo, that]);
}
//# sourceMappingURL=boostedQueueMicrotask.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/bindSwitchToEventListener.js
/**
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

function bindSwitchToEventListener(elementGetter, eventName, eventListener, options) {
    let listening = false;
    return function (enable) {
        if (enable !== listening) {
            const target = elementGetter.call(this);
            if (enable) {
                boostedQueueMicrotask(() => target.addEventListener(eventName, eventListener, options));
                listening = true;
            }
            else {
                boostedQueueMicrotask(() => target.removeEventListener(eventName, eventListener));
                listening = false;
            }
        }
    };
}
//# sourceMappingURL=bindSwitchToEventListener.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/bindToAttribute.js
/**
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

function bindToAttribute(elementGetter, attributeName, valProcessor) {
    return function (newVal) {
        if (valProcessor)
            newVal = valProcessor(newVal);
        const target = elementGetter.call(this);
        const currentAttribute = target.getAttribute(attributeName);
        if (currentAttribute !== newVal) {
            if (newVal !== null) {
                boostedQueueMicrotask(() => {
                    target.setAttribute(attributeName, newVal);
                });
            }
            else {
                boostedQueueMicrotask(() => {
                    target.removeAttribute(attributeName);
                });
            }
        }
    };
}
//# sourceMappingURL=bindToAttribute.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/bindToStyle.js
/**
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

function bindToStyle(elementGetter, styleName, valProcessor, important) {
    return function (newVal) {
        if (newVal) {
            if (valProcessor)
                newVal = valProcessor(newVal);
            boostedQueueMicrotask(() => elementGetter
                .call(this)
                .style.setProperty(styleName, newVal, important ? 'important' : undefined));
        }
        else {
            boostedQueueMicrotask(() => elementGetter.call(this).style.removeProperty(styleName));
        }
    };
}
//# sourceMappingURL=bindToStyle.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/genDomGetter.js
function genDomGetter(queryableElementGetter, selector) {
    let dom;
    let queryTarget;
    return () => {
        if (!queryTarget)
            queryTarget = queryableElementGetter();
        if (queryTarget.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            if (!dom) {
                dom = queryTarget.querySelector(selector);
            }
        }
        else {
            dom = queryTarget.querySelector(selector);
        }
        return dom;
    };
}
//# sourceMappingURL=genDomGetter.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/component.js

function convertStyleWithPriority(value, priority) {
    if (priority) {
        return value + ' !important';
    }
    else {
        return value;
    }
}
function Component(tag, attributeReactiveClassesOptional, template) {
    let templateElement;
    const attributeReactiveClasses = attributeReactiveClassesOptional.filter((e) => Boolean(e));
    return (target, { addInitializer }) => {
        var _a;
        const observedStyleProperties = new Set([
            ...attributeReactiveClasses
                .filter((e) => e.observedCSSProperties)
                .map((e) => e.observedCSSProperties)
                .reduce((p, r) => p.concat(r), []),
        ]);
        // @ts-ignore
        class CustomElement extends target {
            static registerPlugin(reactiveClass) {
                _a.observedAttributes.push(...reactiveClass.observedAttributes);
                if (reactiveClass.observedCSSProperties) {
                    for (const property of reactiveClass.observedCSSProperties) {
                        observedStyleProperties.add(property);
                    }
                }
                attributeReactiveClasses.push(reactiveClass);
            }
            static observedAttributes = [
                ...(target.observedAttributes ?? []),
                ...attributeReactiveClasses
                    .map((e) => e.observedAttributes)
                    .reduce((p, r) => p.concat(r), []),
                'class',
            ];
            #attributeReactives = [];
            constructor() {
                super();
                if (template && !templateElement) {
                    templateElement = document.createElement('template');
                    templateElement.innerHTML = template;
                    document.body.appendChild(templateElement);
                }
                if (templateElement && !this.shadowRoot) {
                    const shadowRoot = this.attachShadow({
                        mode: 'open',
                        delegatesFocus: true,
                    });
                    const template = templateElement.content.cloneNode(true);
                    shadowRoot.append(template);
                }
                this.#attributeReactives = attributeReactiveClasses.map((oneClass) => {
                    const oneAttributeReactive = new oneClass(this);
                    return oneAttributeReactive;
                });
                this.#cleanFalseAttributes();
            }
            /** handle observing styles */
            #checking = false;
            #previousStyle = new Map();
            #responseStyleChange() {
                if (!this.#checking && observedStyleProperties.size) {
                    this.#checking = true;
                    boostedQueueMicrotask(this.#invokeStyleHandler, this);
                }
            }
            #invokeStyleHandler() {
                const computedStyle = getComputedStyle(this);
                for (const propertyName of observedStyleProperties) {
                    const value = computedStyle.getPropertyValue(propertyName);
                    const priority = computedStyle.getPropertyPriority(propertyName);
                    const propertyValue = convertStyleWithPriority(value.trim(), priority);
                    if (this.#previousStyle.get(propertyName) !== propertyValue) {
                        for (const oneReactive of this.#attributeReactives) {
                            oneReactive.cssPropertyChangedHandler?.[propertyName]?.call(oneReactive, propertyValue, propertyName);
                        }
                    }
                }
                this.#checking = false;
            }
            /** handle attribute='false' */
            setAttribute(qualifiedName, value) {
                if (value.toString() === 'false'
                    && !_a.notToFilterFalseAttributes?.has(qualifiedName)
                    && !qualifiedName.startsWith('data-')) {
                    this.removeAttribute(qualifiedName);
                    return;
                }
                super.setAttribute(qualifiedName, value);
            }
            #cleanFalseAttributes() {
                const attributes = this.attributes;
                for (let index = 0, attr; (attr = attributes.item(index)); index++) {
                    if (attr.value === 'false'
                        && !_a.notToFilterFalseAttributes?.has(attr.name)
                        && !attr.name.startsWith('data-')) {
                        this.removeAttributeNode(attr);
                    }
                }
            }
            #connected = false;
            /** handle custom element life-cycles */
            attributeChangedCallback(name, oldValue, newValue) {
                super.attributeChangedCallback
                    && super.attributeChangedCallback(name, oldValue, newValue);
                if (!_a.notToFilterFalseAttributes?.has(name)
                    && !name.startsWith('data-')) {
                    if (oldValue === 'false')
                        oldValue = null;
                    if (newValue === 'false') {
                        newValue = null;
                        this.removeAttribute(name);
                    }
                }
                if (oldValue !== newValue) {
                    if (this.#connected && (name === 'class' || name === 'style')) {
                        this.#responseStyleChange();
                    }
                    for (const oneReactive of this.#attributeReactives) {
                        if (oneReactive.attributeChangedHandler?.[name]) {
                            const { handler, noDomMeasure } = oneReactive.attributeChangedHandler[name];
                            if (noDomMeasure) {
                                handler.call(oneReactive, newValue, oldValue, name);
                            }
                            else if (this.#connected) {
                                boostedQueueMicrotask(() => handler.call(oneReactive, newValue, oldValue, name));
                            }
                        }
                    }
                }
            }
            #invokeAfterConnectedAttributeChangedHandler() {
                this.getAttributeNames().forEach((attributeName) => {
                    for (const oneReactive of this.#attributeReactives) {
                        if (oneReactive.attributeChangedHandler?.[attributeName]) {
                            const { handler, noDomMeasure } = oneReactive.attributeChangedHandler[attributeName];
                            if (!noDomMeasure) {
                                boostedQueueMicrotask(() => handler.call(oneReactive, this.getAttribute(attributeName), null, attributeName));
                            }
                        }
                    }
                });
            }
            connectedCallback() {
                super.connectedCallback?.();
                this.#attributeReactives.forEach((oneAttributeReactive) => {
                    oneAttributeReactive.connectedCallback?.();
                });
                this.#responseStyleChange();
                boostedQueueMicrotask(this.#invokeAfterConnectedAttributeChangedHandler, this);
                this.#connected = true;
            }
            disconnectedCallback() {
                super.disconnectedCallback?.();
                this.#attributeReactives.forEach((oneAttributeReactive) => {
                    oneAttributeReactive.dispose?.();
                });
            }
            #eventListenerMap = {};
            enableEvent(eventName) {
                this.#eventListenerMap[eventName] ??= {
                    count: 0,
                    listenerCount: new WeakMap(),
                    captureListenerCount: new WeakMap(),
                };
                const targetEventInfo = this.#eventListenerMap[eventName];
                if (targetEventInfo.count === 0) {
                    // trigger eventStatusChangeHandler
                    for (const oneReactive of this.#attributeReactives) {
                        const handler = oneReactive.eventStatusChangedHandler?.[eventName];
                        if (handler) {
                            handler.call(oneReactive, true, eventName);
                        }
                    }
                }
                targetEventInfo.count++;
            }
            disableEvent(eventName) {
                const targetEventInfo = this.#eventListenerMap[eventName];
                if (targetEventInfo && targetEventInfo.count > 0) {
                    targetEventInfo.count--;
                    if (targetEventInfo.count === 0) {
                        // trigger eventStatusChangeHandler
                        for (const oneReactive of this.#attributeReactives) {
                            const handler = oneReactive.eventStatusChangedHandler?.[eventName];
                            if (handler) {
                                handler.call(oneReactive, false, eventName);
                            }
                        }
                    }
                }
            }
            addEventListener(type, listener, options) {
                super.addEventListener(type, listener, options);
                this.enableEvent(type);
                const targetEventInfo = this.#eventListenerMap[type];
                const capture = typeof options === 'object' ? options.capture : options;
                const targetMap = capture
                    ? targetEventInfo.captureListenerCount
                    : targetEventInfo.listenerCount;
                const currentListenerCount = targetMap.get(listener) ?? 0;
                targetMap.set(listener, currentListenerCount + 1);
            }
            removeEventListener(type, listener, options) {
                super.removeEventListener(type, listener, options);
                const capture = typeof options === 'object' ? options.capture : options;
                const targetEventInfo = this.#eventListenerMap[type];
                if (targetEventInfo && targetEventInfo.count > 0) {
                    const targetMap = capture
                        ? targetEventInfo.captureListenerCount
                        : targetEventInfo.listenerCount;
                    const currentListenerCount = targetMap.get(listener);
                    if (currentListenerCount === 1) {
                        targetMap.delete(listener);
                        this.disableEvent(type);
                    }
                }
            }
        }
        _a = CustomElement;
        addInitializer(() => {
            customElements.define(tag, CustomElement);
        });
        return CustomElement;
    };
}
//# sourceMappingURL=component.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/html.js
/**
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#raw_strings
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
//# sourceMappingURL=html.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/generateRegister.js
/**
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/
function generateRegister(registerName, convertHandlerToRegistryItem) {
    return function registerHandler(key, ...args) {
        return function (target, context) {
            if (context.kind === 'method') {
                context.addInitializer(function () {
                    this[registerName] ??= {};
                    this[registerName][key] =
                        convertHandlerToRegistryItem(target, args);
                });
            }
            else if (context.kind === 'field') {
                return function (value) {
                    this[registerName] ??= {};
                    this[registerName][key] = convertHandlerToRegistryItem(value, args);
                    return value;
                };
            }
            else {
                throw new Error(`[lynx-web-components] decorator type ${context.kind} is not supported`);
            }
        };
    };
}
//# sourceMappingURL=generateRegister.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/registerAttributeHandler.js

/**
 * @param attributeName
 * @param noDomMeasure  If there are any measurement operation, the handler will be invoked after connected
 * @returns
 */
const registerAttributeHandler = generateRegister('attributeChangedHandler', (handler, [noDomMeasure]) => ({
    handler,
    noDomMeasure,
}));
//# sourceMappingURL=registerAttributeHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/registerStyleChangeHandler.js
/**
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

const registerStyleChangeHandler = generateRegister('cssPropertyChangedHandler', (handler) => handler);
//# sourceMappingURL=registerStyleChangeHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/registerEventStatusChangedHandler.js

/**
 * @param eventName
 * @returns
 */
const registerEventEnableStatusChangeHandler = generateRegister('eventStatusChangedHandler', (handler) => handler);
//# sourceMappingURL=registerEventStatusChangedHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/index.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module element-reactive
 *
 * This module provides the core reactive framework for building Web Components in Lynx.
 *
 * Core features:
 * - `Component` decorator: Defines a custom element with reactive capabilities.
 * - Attribute & Style Binding: Automatically updates component state when attributes or styles change.
 * - Event Handling: Provides mechanisms to bind and handle events efficiently.
 * - Lifecycle Management: Extensions to standard Web Component lifecycle callbacks.
 * - Plugin System: Allows extending component behavior.
 *
 * Use this module to create highly performant and reactive custom elements that integrate seamlessly with the Lynx platform.
 */










//# sourceMappingURL=index.js.map

},
8265(__unused_rspack___webpack_module__, __unused_rspack___webpack_exports__, __webpack_require__) {

// EXTERNAL MODULE: ../../node_modules/tslib/tslib.es6.mjs
var tslib_es6 = __webpack_require__(5608);
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-elements/dist/element-reactive/index.js + 11 modules
var element_reactive = __webpack_require__(3210);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/LynxWrapper/LynxWrapper.js

/**
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let LynxWrapper_LynxWrapper = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('lynx-wrapper', [])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var LynxWrapper = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LynxWrapper = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return LynxWrapper = _classThis;
})();

//# sourceMappingURL=LynxWrapper.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/LynxWrapper/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/LynxWrapper
 *
 * `lynx-wrapper` is a helper element used to wrap content in specific scenarios.
 * It is a simple container with no specific behavioral logic.
 *
 * @example
 * ```html
 * <lynx-wrapper>
 *   <div>Content</div>
 * </lynx-wrapper>
 * ```
 */

//# sourceMappingURL=index.js.map
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/common/CommonEventsAndMethods.js
var CommonEventsAndMethods = __webpack_require__(8969);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/ScrollView/FadeEdgeLengthAttribute.js
/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/


let FadeEdgeLengthAttribute = (() => {
    let _instanceExtraInitializers = [];
    let __handleFadingEdgeLength_decorators;
    let __handleFadingEdgeLength_initializers = [];
    let __handleFadingEdgeLength_extraInitializers = [];
    let __backgroundColorToVariable_decorators;
    return class FadeEdgeLengthAttribute {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleFadingEdgeLength_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('fading-edge-length', true)];
            __backgroundColorToVariable_decorators = [(0,element_reactive/* .registerStyleChangeHandler */.h3)('background'), (0,element_reactive/* .registerStyleChangeHandler */.h3)('background-color')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __backgroundColorToVariable_decorators, { kind: "method", name: "_backgroundColorToVariable", static: false, private: false, access: { has: obj => "_backgroundColorToVariable" in obj, get: obj => obj._backgroundColorToVariable }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleFadingEdgeLength_decorators, { kind: "field", name: "_handleFadingEdgeLength", static: false, private: false, access: { has: obj => "_handleFadingEdgeLength" in obj, get: obj => obj._handleFadingEdgeLength, set: (obj, value) => { obj._handleFadingEdgeLength = value; } }, metadata: _metadata }, __handleFadingEdgeLength_initializers, __handleFadingEdgeLength_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #getTopFadeMask = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#top-fade-mask');
        #getBotFadeMask = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#bot-fade-mask');
        static observedAttributes = ['fading-edge-length'];
        static observedCSSProperties = ['background', 'background-color'];
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handleFadingEdgeLength_extraInitializers);
            this.#dom = dom;
        }
        _handleFadingEdgeLength = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleFadingEdgeLength_initializers, (0,element_reactive/* .bindToStyle */._8)(() => this.#dom, '--scroll-view-fading-edge-length', (v) => `${parseFloat(v)}px`));
        _backgroundColorToVariable(backGroundColor) {
            this.#getTopFadeMask().style.setProperty('--scroll-view-bg-color', backGroundColor);
            this.#getBotFadeMask().style.setProperty('--scroll-view-bg-color', backGroundColor);
        }
        connectedCallback() { }
        dispose() { }
    };
})();

//# sourceMappingURL=FadeEdgeLengthAttribute.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/ScrollView/ScrollAttributes.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let ScrollAttributes = (() => {
    let _instanceExtraInitializers = [];
    let __handleInitialScrollOffset_decorators;
    let __handleInitialScrollIndex_decorators;
    return class ScrollAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleInitialScrollOffset_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('scroll-top', false), (0,element_reactive/* .registerAttributeHandler */._y)('scroll-left', false), (0,element_reactive/* .registerAttributeHandler */._y)('initial-scroll-offset', false)];
            __handleInitialScrollIndex_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('scroll-to-index', false), (0,element_reactive/* .registerAttributeHandler */._y)('initial-scroll-to-index', false)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleInitialScrollOffset_decorators, { kind: "method", name: "_handleInitialScrollOffset", static: false, private: false, access: { has: obj => "_handleInitialScrollOffset" in obj, get: obj => obj._handleInitialScrollOffset }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleInitialScrollIndex_decorators, { kind: "method", name: "_handleInitialScrollIndex", static: false, private: false, access: { has: obj => "_handleInitialScrollIndex" in obj, get: obj => obj._handleInitialScrollIndex }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        static observedAttributes = [
            'scroll-top',
            'scroll-left',
            'initial-scroll-offset',
            'scroll-to-index',
            'initial-scroll-to-index',
        ];
        constructor(dom) {
            this.#dom = dom;
        }
        _handleInitialScrollOffset(newVal, _, attributeName) {
            if (newVal) {
                const scrollValue = parseFloat(newVal);
                const scrollOrientation = this.#dom.getAttribute('scroll-orientation');
                const scrollY = this.#dom.getAttribute('scroll-y');
                const scrollX = this.#dom.getAttribute('scroll-x');
                const topScrollDistance = (attributeName === 'scroll-top'
                    || attributeName === 'initial-scroll-offset')
                    && (scrollY === ''
                        || scrollY === 'true'
                        || scrollOrientation === 'vertical'
                        || scrollOrientation === 'both');
                const leftScrollDistance = (attributeName === 'scroll-left'
                    || attributeName === 'initial-scroll-offset')
                    && (scrollX === ''
                        || scrollX === 'true'
                        || scrollOrientation === 'vertical'
                        || scrollOrientation === 'both');
                requestAnimationFrame(() => {
                    if (topScrollDistance) {
                        this.#dom.scrollTo(0, scrollValue);
                    }
                    if (leftScrollDistance) {
                        this.#dom.scrollLeft = scrollValue;
                    }
                });
            }
        }
        _handleInitialScrollIndex(newVal) {
            if (newVal) {
                const scrollValue = parseFloat(newVal);
                const childrenElement = this.#dom.children.item(scrollValue);
                if (childrenElement && childrenElement instanceof HTMLElement) {
                    const scrollX = this.#dom.getAttribute('scroll-x') !== null;
                    requestAnimationFrame(() => {
                        if (scrollX) {
                            this.#dom.scrollLeft = childrenElement.offsetLeft;
                        }
                        else {
                            this.#dom.scrollTop = childrenElement.offsetTop;
                        }
                    });
                }
            }
        }
        dispose() { }
    };
})();

//# sourceMappingURL=ScrollAttributes.js.map
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/common/commonEventInitConfiguration.js
var commonEventInitConfiguration = __webpack_require__(2233);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/common/bindToIntersectionObserver.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
function bindToIntersectionObserver(rootGetter, targetGetter, callback) {
    let observer;
    return (newVal) => {
        if (newVal !== null) {
            if (!observer) {
                observer = new IntersectionObserver(callback, {
                    root: rootGetter(),
                });
                observer.observe(targetGetter());
            }
        }
        else {
            if (observer) {
                observer.disconnect();
                observer = undefined;
            }
        }
    };
}
//# sourceMappingURL=bindToIntersectionObserver.js.map
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/common/constants.js
var constants = __webpack_require__(7683);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/ScrollView/ScrollViewEvents.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/





let ScrollViewEvents = (() => {
    let __handleScrollUpperThresholdEventEnabled_decorators;
    let __handleScrollUpperThresholdEventEnabled_initializers = [];
    let __handleScrollUpperThresholdEventEnabled_extraInitializers = [];
    let __handleScrollLowerThresholdEventEnabled_decorators;
    let __handleScrollLowerThresholdEventEnabled_initializers = [];
    let __handleScrollLowerThresholdEventEnabled_extraInitializers = [];
    let __updateUpperThreshold_decorators;
    let __updateUpperThreshold_initializers = [];
    let __updateUpperThreshold_extraInitializers = [];
    let __updateLowerThreshold_decorators;
    let __updateLowerThreshold_initializers = [];
    let __updateLowerThreshold_extraInitializers = [];
    let __handleScrollEventEnabled_decorators;
    let __handleScrollEventEnabled_initializers = [];
    let __handleScrollEventEnabled_extraInitializers = [];
    let __handleScrollEndEventEnabled_decorators;
    let __handleScrollEndEventEnabled_initializers = [];
    let __handleScrollEndEventEnabled_extraInitializers = [];
    return class ScrollViewEvents {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleScrollUpperThresholdEventEnabled_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('scrolltoupper')];
            __handleScrollLowerThresholdEventEnabled_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('scrolltolower')];
            __updateUpperThreshold_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('upper-threshold', true)];
            __updateLowerThreshold_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('lower-threshold', true)];
            __handleScrollEventEnabled_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('lynxscroll')];
            __handleScrollEndEventEnabled_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('lynxscrollend')];
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleScrollUpperThresholdEventEnabled_decorators, { kind: "field", name: "_handleScrollUpperThresholdEventEnabled", static: false, private: false, access: { has: obj => "_handleScrollUpperThresholdEventEnabled" in obj, get: obj => obj._handleScrollUpperThresholdEventEnabled, set: (obj, value) => { obj._handleScrollUpperThresholdEventEnabled = value; } }, metadata: _metadata }, __handleScrollUpperThresholdEventEnabled_initializers, __handleScrollUpperThresholdEventEnabled_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleScrollLowerThresholdEventEnabled_decorators, { kind: "field", name: "_handleScrollLowerThresholdEventEnabled", static: false, private: false, access: { has: obj => "_handleScrollLowerThresholdEventEnabled" in obj, get: obj => obj._handleScrollLowerThresholdEventEnabled, set: (obj, value) => { obj._handleScrollLowerThresholdEventEnabled = value; } }, metadata: _metadata }, __handleScrollLowerThresholdEventEnabled_initializers, __handleScrollLowerThresholdEventEnabled_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __updateUpperThreshold_decorators, { kind: "field", name: "_updateUpperThreshold", static: false, private: false, access: { has: obj => "_updateUpperThreshold" in obj, get: obj => obj._updateUpperThreshold, set: (obj, value) => { obj._updateUpperThreshold = value; } }, metadata: _metadata }, __updateUpperThreshold_initializers, __updateUpperThreshold_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __updateLowerThreshold_decorators, { kind: "field", name: "_updateLowerThreshold", static: false, private: false, access: { has: obj => "_updateLowerThreshold" in obj, get: obj => obj._updateLowerThreshold, set: (obj, value) => { obj._updateLowerThreshold = value; } }, metadata: _metadata }, __updateLowerThreshold_initializers, __updateLowerThreshold_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleScrollEventEnabled_decorators, { kind: "field", name: "_handleScrollEventEnabled", static: false, private: false, access: { has: obj => "_handleScrollEventEnabled" in obj, get: obj => obj._handleScrollEventEnabled, set: (obj, value) => { obj._handleScrollEventEnabled = value; } }, metadata: _metadata }, __handleScrollEventEnabled_initializers, __handleScrollEventEnabled_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleScrollEndEventEnabled_decorators, { kind: "field", name: "_handleScrollEndEventEnabled", static: false, private: false, access: { has: obj => "_handleScrollEndEventEnabled" in obj, get: obj => obj._handleScrollEndEventEnabled, set: (obj, value) => { obj._handleScrollEndEventEnabled = value; } }, metadata: _metadata }, __handleScrollEndEventEnabled_initializers, __handleScrollEndEventEnabled_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #dom;
        #debounceScrollForMockingScrollEnd;
        #prevX = 0;
        #prevY = 0;
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollEndEventEnabled_extraInitializers);
            this.#dom = dom;
        }
        #getScrollContainer = () => this.#dom;
        #getUpperThresholdObserverDom = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#upper-threshold-observer');
        #getLowerThresholdObserverDom = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#lower-threshold-observer');
        #handleObserver = (entries) => {
            const { isIntersecting, target } = entries[0];
            const id = target.id;
            if (isIntersecting) {
                if (id === 'upper-threshold-observer') {
                    this.#dom.dispatchEvent(new CustomEvent('scrolltoupper', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: this.#getScrollDetail(),
                    }));
                }
                else if (id === 'lower-threshold-observer') {
                    this.#dom.dispatchEvent(new CustomEvent('scrolltolower', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: this.#getScrollDetail(),
                    }));
                }
            }
        };
        static observedAttributes = [
            'upper-threshold',
            'lower-threshold',
        ];
        _handleScrollUpperThresholdEventEnabled = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollUpperThresholdEventEnabled_initializers, (enabled) => {
            enabled
                ? this.#dom.setAttribute('x-enable-scrolltoupper-event', '')
                : this.#dom.removeAttribute('x-enable-scrolltoupper-event'); // css needs this;
            this.#updateUpperIntersectionObserver(enabled);
        });
        #updateUpperIntersectionObserver = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollUpperThresholdEventEnabled_extraInitializers), bindToIntersectionObserver(this.#getScrollContainer, this.#getUpperThresholdObserverDom, this.#handleObserver));
        _handleScrollLowerThresholdEventEnabled = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollLowerThresholdEventEnabled_initializers, (enabled) => {
            enabled
                ? this.#dom.setAttribute('x-enable-scrolltolower-event', '')
                : this.#dom.removeAttribute('x-enable-scrolltolower-event'); // css needs this;
            this.#updateLowerIntersectionObserver(enabled);
        });
        #updateLowerIntersectionObserver = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollLowerThresholdEventEnabled_extraInitializers), bindToIntersectionObserver(this.#getScrollContainer, this.#getLowerThresholdObserverDom, this.#handleObserver));
        _updateUpperThreshold = (0,tslib_es6/* .__runInitializers */.zF)(this, __updateUpperThreshold_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getUpperThresholdObserverDom, 'flex-basis', (v) => `${parseInt(v)}px`));
        _updateLowerThreshold = ((0,tslib_es6/* .__runInitializers */.zF)(this, __updateUpperThreshold_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __updateLowerThreshold_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getLowerThresholdObserverDom, 'flex-basis', (v) => `${parseInt(v)}px`)));
        #getScrollDetail() {
            let { scrollTop, scrollLeft, scrollHeight, scrollWidth } = this
                .#getScrollContainer();
            if (scrollTop === 0) {
                scrollTop -= this.#dom.scrollHeight / 2 - this.#dom.scrollTop;
            }
            if (scrollLeft === 0) {
                scrollLeft -= this.#dom.scrollWidth / 2 - this.#dom.scrollLeft;
            }
            const detail = {
                scrollTop,
                scrollLeft,
                scrollHeight,
                scrollWidth,
                isDragging: false,
                deltaX: scrollLeft - this.#prevX,
                deltaY: scrollTop - this.#prevY,
            };
            this.#prevX = scrollLeft;
            this.#prevY = scrollTop;
            return detail;
        }
        #handleScroll = ((0,tslib_es6/* .__runInitializers */.zF)(this, __updateLowerThreshold_extraInitializers), () => {
            if (this.#scrollEndEventEnabled && !constants/* .useScrollEnd */.k) {
                // debounce
                clearTimeout(this.#debounceScrollForMockingScrollEnd);
                this.#debounceScrollForMockingScrollEnd = setTimeout(() => {
                    this.#handleScrollEnd();
                }, 100);
            }
            this.#dom.dispatchEvent(new CustomEvent('lynxscroll', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: this.#getScrollDetail(),
            }));
        });
        #handleScrollEnd = () => {
            this.#dom.dispatchEvent(new CustomEvent('lynxscrollend', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: this.#getScrollDetail(),
            }));
        };
        #scrollEventEnabled = false;
        _handleScrollEventEnabled = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollEventEnabled_initializers, (enabled) => {
            this.#scrollEventEnabled = enabled;
            this.#handleScrollEventsSwitches();
        });
        #scrollEndEventEnabled = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollEventEnabled_extraInitializers), false);
        _handleScrollEndEventEnabled = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollEndEventEnabled_initializers, (enabled) => {
            this.#scrollEndEventEnabled = enabled;
            this.#handleScrollEventsSwitches();
        });
        #handleScrollEventsSwitches() {
            if (this.#scrollEventEnabled || this.#scrollEndEventEnabled) {
                this.#getScrollContainer().addEventListener('scroll', this.#handleScroll);
                this.#getScrollContainer().addEventListener('scrollend', this.#handleScrollEnd);
                this.#dom.addEventListener('scroll', this.#handleScroll);
                this.#dom.addEventListener('scrollend', this.#handleScrollEnd);
                this.#prevX = 0;
                this.#prevY = 0;
            }
            else {
                this.#dom.removeEventListener('scroll', this.#handleScroll);
                this.#dom.removeEventListener('scrollend', this.#handleScrollEnd);
            }
        }
        connectedCallback() { }
        dispose() { }
    };
})();

//# sourceMappingURL=ScrollViewEvents.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/ScrollView/ScrollIntoView.js
/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

class ScrollIntoView {
    static eventName = '__scrollIntoView';
    static observedAttributes = [];
    #dom;
    #handleScrollIntoView = ((event) => {
        event.stopPropagation();
        const compusedPath = event
            .composedPath()
            .filter((e) => e instanceof HTMLElement);
        const eventPath = [];
        const scrollContainer = this.#dom;
        for (const target of compusedPath) {
            if (target === scrollContainer)
                break;
            eventPath.push(target);
        }
        const scrollOrientation = this.#dom.getAttribute('scroll-orientation');
        const scrollX = this.#dom.getAttribute('scroll-x') !== null
            || scrollOrientation === 'both'
            || scrollOrientation === 'horizontal';
        const scrollY = this.#dom.getAttribute('scroll-y') !== null
            || scrollOrientation === 'both'
            || scrollOrientation === 'vertical';
        let top = 0, left = 0;
        for (const { offsetTop, offsetLeft } of eventPath) {
            if (scrollX)
                left += offsetLeft;
            if (scrollY)
                top += offsetTop;
        }
        if (scrollX) {
            switch (event.detail.inline) {
                case 'center':
                    left += (event.target.clientWidth
                        - this.#dom.clientWidth)
                        / 2;
                    break;
                case 'end':
                    left += event.target.clientWidth
                        - this.#dom.clientWidth;
                    break;
            }
        }
        if (scrollY) {
            switch (event.detail.block) {
                case 'center':
                    top += (event.target.clientHeight
                        - this.#dom.clientHeight)
                        / 2;
                    break;
                case 'end':
                    top += event.target.clientHeight
                        - this.#dom.clientHeight;
                    break;
            }
        }
        scrollContainer.scrollTo({
            behavior: event.detail.behavior === 'smooth' ? 'smooth' : 'instant',
            left,
            top,
        });
    });
    constructor(dom) {
        this.#dom = dom;
        this.#dom.addEventListener(ScrollIntoView.eventName, this.#handleScrollIntoView, { passive: false });
    }
    dispose() {
        this.#dom.removeEventListener(ScrollIntoView.eventName, this.#handleScrollIntoView);
    }
}
//# sourceMappingURL=ScrollIntoView.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/htmlTemplates.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
// --- IMPORTANT SYNCHRONIZATION NOTICE ---
// The templates defined in this file are mirrored in the pure Rust library `web_elements`.
// If you modify, add, or remove any template in this file, you MUST ALSO update
// the corresponding Rust implementation in `src/template.rs` to ensure they
// remain exactly synchronized. Tests enforce this parity.
// ----------------------------------------
const templateScrollView = `<style>
  .placeholder-dom {
    display: none;
    flex: 0 0 0;
    align-self: stretch;
    min-height: 0;
    min-width: 0;
  }
  .mask {
    z-index: 1;
    position: sticky;
  }
  .observer-container {
    flex-direction: inherit;
    overflow: visible;
  }
  .observer {
    display: flex;
  }
  ::-webkit-scrollbar {
    display: none;
  }
</style>
  <div
    class="mask placeholder-dom"
    id="top-fade-mask"
    part="top-fade-mask"
  ></div>
  <div
    class="observer-container placeholder-dom"
    part="upper-threshold-observer"
  >
    <div
      class="observer placeholder-dom"
      id="upper-threshold-observer"
    ></div>
  </div>
  <slot></slot>
  <div
    class="observer-container placeholder-dom"
    part="lower-threshold-observer"
  >
    <div
      class="observer placeholder-dom"
      id="lower-threshold-observer"
    ></div>
  </div>
  <div
    class="mask placeholder-dom"
    id="bot-fade-mask"
    part="bot-fade-mask"
  ></div>`;
const templateXAudioTT = `<audio id="audio"></audio>`;
const XSSDetector = /<\s*script/;
const templateXImage = (attributes) => {
    const { src } = attributes;
    if (src && XSSDetector.test(src)) {
        throw new Error('detected <script, this is a potential XSS attack, please check your src');
    }
    return `<img part="img" alt="" id="img" ${src ? `src="${src}"` : ''}/> `;
};
const templateFilterImage = templateXImage;
const templateXInput = `<style>
  #input:focus {
    outline: none;
  }
  #form {
    display: none;
  }
</style>
<form id="form" part="form" method="dialog">
  <input
    id="input"
    part="input"
    step="any"
    type="text"
    inputmode="text"
    spell-check="true"
  />
</form>`;
const templateXList = `<style>
  .placeholder-dom {
    display: none;
    flex: 0 0 0;
    align-self: stretch;
    min-height: 0;
    min-width: 0;
  }
  .observer-container {
    flex-direction: inherit;
    overflow: visible;
  }
  .observer {
    display: flex;
  }
</style>
<div id="content" part="content">
  <div
    class="observer-container placeholder-dom"
    part="upper-threshold-observer"
  >
    <div
      class="observer placeholder-dom"
      id="upper-threshold-observer"
      part="upper-threshold-sentinel"
    ></div>
  </div>
  <slot part="slot"></slot>
  <div
    class="observer-container placeholder-dom"
    part="lower-threshold-observer"
  >
    <div
      class="observer placeholder-dom"
      id="lower-threshold-observer"
      part="lower-threshold-sentinel"
    ></div>
  </div>
</div>`;
const templateXOverlayNg = `<style>
  #dialog[open] {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    position: fixed;
    overscroll-behavior: contain;
    scrollbar-width: none;
  }
  #dialog[open]::-webkit-scrollbar {
    display: none;
  }
  #dialog::backdrop {
    background-color: transparent;
  }
  .overlay-inner {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .overlay-inner > * {
    pointer-events: auto;
  }
  .overlay-placeholder {
    width: 100%;
    height: 1px;
  }
</style>
<dialog id="dialog" part="dialog">
  <div class="overlay-inner">
    <slot></slot>
  </div>
  <div class="overlay-placeholder"></div>
</dialog>`;
const templateXRefreshView = `<style>
  .bounce-container {
    overflow: scroll;
    overscroll-behavior: contain;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
  }
  .overflow-placeholder {
    min-height: 30%;
    min-width: 100%;
    flex-shrink: 0;
    scroll-snap-align: none;
  }
  .not-shrink {
    height: 100%;
    width: 100%;
    min-height: 100%;
    min-width: 100%;
    flex-shrink: 0;
  }
  .vertical {
    display: flex;
    flex-direction: column;
  }
  #content {
    scroll-snap-align: center;
  }
</style>
<div id="container" part="container" class="bounce-container not-shrink vertical">
  <div
    id="placeholder-top"
    class="overflow-placeholder bounce-item"
    part="placeholder-top"
  ></div>
  <slot name="header"></slot>
  <div id="content" part="content" class="not-shrink vertical">
    <slot part="slot"></slot>
  </div>
  <slot name="footer"></slot>
  <div
    id="placeholder-bot"
    class="overflow-placeholder bounce-item"
    part="placeholder-bot"
  ></div>
</div>`;
/* https://bugs.webkit.org/show_bug.cgi?id=296048
  The animation name should be defined in the template
  This is a workaround for safari
*/
const templateXSwiper = `<style>
  #bounce-padding {
    display: none;
    flex: 0 0 0;
    align-self: stretch;
    scroll-snap-align: none;
    flex-basis: 100%;
  }
  #content {
    position: relative;
    display: flex;
    flex: 0 0 100%;
    flex-direction: inherit;
    flex-wrap: inherit;
    align-self: stretch;
    justify-content: inherit;
    align-items: inherit;
    overflow: inherit;
    scrollbar-width: none;
    scroll-snap-align: start;
    scroll-snap-type: inherit;
  }
  div::-webkit-scrollbar {
    display: none;
  }
  #indicator-container {
    display: none;
  }
  #indicator-container > div {
    animation-name: indicator-dot;
    animation-duration: 100ms;
  }
  @keyframes indicator-dot {
    30%,
    70% {
      background-color: var(--indicator-color);
    }
    31%,
    69% {
      background-color: var(--indicator-active-color);
    }
  }
</style>
<style id="indicator-style"></style>
<div id="bounce-padding" part="bounce-padding"></div>
<div id="indicator-container" part="indicator-container"></div>
<div id="content" part="content">
  <slot part="slot-start" name="circular-start" id="circular-start"></slot>
  <slot part="slot"></slot>
  <slot part="slot-end" name="circular-end" id="circular-end"></slot>
</div>`;
const templateXText = `<div id="inner-box" part="inner-box"><slot part="slot"></slot><slot name="inline-truncation"></slot></div>`;
const templateXMarkdown = `<style>
  :host {
    display: block;
  }
  .markdown-body {
    display: block;
    line-height: 1.4;
    color: inherit;
    word-break: break-word;
    position: relative;
  }
  .markdown-body p {
    margin: 0 0 0.75em 0;
  }
  .markdown-body h1,
  .markdown-body h2,
  .markdown-body h3,
  .markdown-body h4,
  .markdown-body h5,
  .markdown-body h6 {
    margin: 0.8em 0 0.4em 0;
  }
  .markdown-body ul,
  .markdown-body ol {
    margin: 0 0 0.75em 1.5em;
  }
  .markdown-body pre {
    margin: 0 0 0.75em 0;
    padding: 8px 12px;
    border-radius: 6px;
    background: #f6f8fa;
    overflow: auto;
  }
  .markdown-body code {
    font-family: ui-monospace, SFMono-Regular, SFMono, Menlo, Consolas,
      "Liberation Mono", monospace;
  }
  .markdown-body pre code {
    display: block;
    padding: 0;
  }
  .markdown-body img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  .markdown-body .md-inline-view {
    display: inline-block;
    vertical-align: baseline;
  }
  .markdown-body .md-truncation {
    position: absolute;
    right: 0;
    bottom: 0;
    background-color: inherit;
  }
  .markdown-body .md-image-figure {
    margin: 0 0 0.75em 0;
  }
  .markdown-body .md-image-caption {
    margin-top: 4px;
    color: #666;
    font-size: 0.875em;
  }
  .markdown-body .md-text-mask-effect {
    position: relative;
    display: inline-block;
  }
  .markdown-body .md-text-mask-effect-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    user-select: none;
    white-space: pre;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
  }
  .markdown-body a {
    color: #0366d6;
    text-decoration: underline;
  }
</style>
<style id="markdown-style"></style>
<div id="markdown-root" part="root" class="markdown-body"></div>`;
const templateInlineImage = templateXImage;
const templateXTextarea = `<style>
  #textarea:focus,
  #textarea:focus-visible {
    border: inherit;
    outline: inherit;
  }
</style>
<form id="form" part="form" method="dialog">
  <textarea id="textarea" part="textarea"></textarea>
</form>`;
const templateXViewpageNg = `<style>
  #bounce-padding {
    display: none;
    flex: 0 0 0;
    align-self: stretch;
    scroll-snap-align: none;
    flex-basis: 100%;
  }
  #content {
    flex: 0 0 100%;
    flex-direction: row;
    align-self: stretch;
    display: inherit;
    justify-content: inherit;
    align-items: inherit;
    overflow: inherit;
    scrollbar-width: none;
    scroll-snap-type: inherit;
  }
  #content::-webkit-scrollbar {
    display: none;
  }
</style>
<div id="bounce-padding" part="bounce-padding"></div>
<div id="content" part="content">
  <slot></slot>
</div>`;
const templateXWebView = `<style>
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
<iframe id="webview" part="webview"></iframe>`;
const templateXSvg = () => {
    return `<img part="img" alt="" loading="lazy" id="img" /> `;
};
//# sourceMappingURL=htmlTemplates.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/compat/LinearContainer/LinearContainer.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/** For @container
 * chrome 111, safari 18, firefox no
 *
 * However, when the chromuim version is less than 116.0.5806.0, the following code will crash:
 * ```
 *  <style>
      #container {
        --lynx-display: flex;
      }

      #target {
        background-color: red;
        width: 400px;
        height: 400px;
      }

      @container style(--lynx-display: flex) {
        #target {
          background-color: green;
        }
      }
    </style>
    <div id="container">
      <div id="target"></div>
    </div>
    <script>
      const target = document.getElementById('container');
      container.style.setProperty('display', 'none');
      setTimeout(() => {
        target.style.removeProperty('display');
      }, 10);
    </script>
 * ```
 * it fixed in 116.0.5806.0, detail: https://issues.chromium.org/issues/40270007
 *
 * so we limit this feature to chrome 117, safari 18, firefox no:
 * -webkit-box-reflect: chrome 4, safari 4, firefox no
 *  https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-box-reflect
 * transition-behavior:allow-discrete: chrome 117, safari 18, firefox 125
 *  https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior
 *  https://caniuse.com/mdn-css_properties_display_is_transitionable
 *
 * update this once firefox supports this.
 */
const supportContainerStyleQuery = CSS.supports('-webkit-box-reflect: above')
    && CSS.supports('transition-behavior:allow-discrete')
    && CSS.supports('content-visibility: auto');
class LinearContainerImpl {
    static observedAttributes = [];
    static observedCSSProperties = [
        '--lynx-display',
        '--lynx-linear-orientation',
    ];
    #dom;
    constructor(currentElement) {
        this.#dom = currentElement;
        // @ts-expect-error
        this.cssPropertyChangedHandler = {
            '--lynx-display': this.#setComputedDisplay,
            '--lynx-linear-orientation': this.#setLinearOrientation,
        };
    }
    #setComputedDisplay = (0,element_reactive/* .bindToAttribute */.H$)(() => this.#dom, 'lynx-computed-display');
    #setLinearOrientation = (0,element_reactive/* .bindToAttribute */.H$)(() => this.#dom, 'lynx-linear-orientation');
}
const LinearContainer = supportContainerStyleQuery
    ? undefined
    : LinearContainerImpl;
//# sourceMappingURL=LinearContainer.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/compat/index.js

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/ScrollView/ScrollView.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/









let ScrollView_ScrollView = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('scroll-view', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
            ScrollAttributes,
            FadeEdgeLengthAttribute,
            ScrollViewEvents,
            ScrollIntoView,
        ], templateScrollView)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var ScrollView = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ScrollView = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static notToFilterFalseAttributes = new Set(['enable-scroll']);
        static scrollInterval = 100;
        #autoScrollTimer;
        scrollTo(...args) {
            let offset;
            if (typeof args[0].offset === 'string') {
                const offsetValue = parseFloat(args[0].offset);
                offset = { left: offsetValue, top: offsetValue };
            }
            else if (typeof args[0].offset === 'number') {
                offset = { left: args[0].offset, top: args[0].offset };
            }
            if (typeof args[0].index === 'number') {
                const index = args[0].index;
                if (index === 0) {
                    this.scrollTop = 0;
                    this.scrollLeft = 0;
                }
                else if (index > 0 && index < this.childElementCount) {
                    const targetKid = this.children.item(index);
                    if (targetKid instanceof HTMLElement) {
                        if (offset) {
                            offset = {
                                left: targetKid.offsetLeft + offset.left,
                                top: targetKid.offsetTop + offset.top,
                            };
                        }
                        else {
                            offset = { left: targetKid.offsetLeft, top: targetKid.offsetTop };
                        }
                    }
                }
            }
            if (offset) {
                this.scrollTo({
                    ...offset,
                    behavior: args[0].smooth ? 'smooth' : 'auto',
                });
            }
            else {
                super.scrollTo(...args);
            }
        }
        autoScroll(options) {
            clearInterval(this.#autoScrollTimer);
            if (options.start) {
                const rate = typeof options.rate === 'number'
                    ? options.rate
                    : parseFloat(options.rate);
                const tickDistance = (rate * ScrollView.scrollInterval) / 1000;
                this.#autoScrollTimer = setInterval((dom) => {
                    dom.scrollBy({
                        left: tickDistance,
                        top: tickDistance,
                        behavior: 'smooth',
                    });
                }, ScrollView.scrollInterval, this);
            }
        }
        get [constants/* .scrollContainerDom */.l]() {
            return this;
        }
        static {
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return ScrollView = _classThis;
})();

//# sourceMappingURL=ScrollView.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/ScrollView/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/ScrollView
 *
 * `scroll-view` provides a scrollable container.
 *
 * Attributes:
 * - `scroll-top`: Sets the vertical scroll position.
 * - `scroll-left`: Sets the horizontal scroll position.
 * - `initial-scroll-offset`: Sets the initial scroll position (in px).
 * - `scroll-to-index`: Scrolls to the child element at the specified index.
 * - `initial-scroll-to-index`: Scrolls to the child element at the specified index on init.
 * - `fading-edge-length`: Sets the length of the fading edge effect.
 * - `scroll-orientation`: 'vertical' | 'horizontal' | 'both'.
 * - `scroll-y`: 'true' | 'false' to enable vertical scrolling.
 * - `scroll-x`: 'true' | 'false' to enable horizontal scrolling.
 * - `enable-scroll`: 'true' | 'false', creates a scrolling container.
 *
 * Events:
 * - `scrolltoupper`: Reached top threshold.
 * - `scrolltolower`: Reached bottom threshold.
 * - `scroll`: Fired on scroll. Detail: `{ scrollTop, scrollLeft, scrollHeight, scrollWidth, deltaX, deltaY }`.
 *
 * CSS:
 * - Forces `display: flex` and linear layout behavior.
 * - Hides scrollbars by default (unless enabled via attribute).
 * - Uses `scroll-timeline` for scroll-linked animations.
 *
 * Methods:
 * - `scrollTo(options)`: Scrolls to a specific position or child.
 * - `autoScroll(options)`: Starts or stops auto-scrolling.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XAudioTT/utils.js
/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/
const xAudioSrc = Symbol('__src');
const xAudioBlob = Symbol('__src');
const audioLoadingStateMap = {
    loadstart: {
        code: 0,
        type: 'init',
    },
    canplay: {
        code: 1,
        type: 'playable',
    },
    // Code 2 refers to the audio loading jam, which is a resource decoding problem
    // cannot be implemented at present, use stalled replaced
    stalled: {
        code: 2,
        type: 'stalled',
    },
    error: {
        code: 3,
        type: 'error',
    },
};
const audioPlaybackStateMap = {
    stop: {
        code: 0,
        type: 'stopped',
    },
    play: {
        code: 1,
        type: 'playing',
    },
    pause: {
        code: 2,
        type: 'paused',
    },
};
const getAudioState = (audioElement) => {
    if (!audioElement) {
        return -1;
    }
    if (audioElement.paused) {
        if (audioElement.ended) {
            return 0;
        }
        return 2;
    }
    if (audioElement.currentTime > 0) {
        return 1;
    }
    return 3;
};
var utils_XAudioErrorCode;
(function (XAudioErrorCode) {
    XAudioErrorCode[XAudioErrorCode["SrcError"] = -1] = "SrcError";
    XAudioErrorCode[XAudioErrorCode["SrcJsonError"] = -2] = "SrcJsonError";
    XAudioErrorCode[XAudioErrorCode["DownloadError"] = -3] = "DownloadError";
    XAudioErrorCode[XAudioErrorCode["PlayerFinishedError"] = -4] = "PlayerFinishedError";
    XAudioErrorCode[XAudioErrorCode["PlayerLoadingError"] = -5] = "PlayerLoadingError";
    XAudioErrorCode[XAudioErrorCode["PlayerPlaybackError"] = -6] = "PlayerPlaybackError";
})(utils_XAudioErrorCode || (utils_XAudioErrorCode = {}));
//# sourceMappingURL=utils.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XAudioTT/XAudioAttribute.js
/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XAudioAttribute = (() => {
    let _instanceExtraInitializers = [];
    let __handleSrc_decorators;
    let __handleLoop_decorators;
    let __handleLoop_initializers = [];
    let __handleLoop_extraInitializers = [];
    let __handlePauseOnHide_decorators;
    return class XAudioAttribute {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleSrc_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('src', true)];
            __handleLoop_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('loop', true)];
            __handlePauseOnHide_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('pause-on-hide', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleSrc_decorators, { kind: "method", name: "_handleSrc", static: false, private: false, access: { has: obj => "_handleSrc" in obj, get: obj => obj._handleSrc }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handlePauseOnHide_decorators, { kind: "method", name: "_handlePauseOnHide", static: false, private: false, access: { has: obj => "_handlePauseOnHide" in obj, get: obj => obj._handlePauseOnHide }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleLoop_decorators, { kind: "field", name: "_handleLoop", static: false, private: false, access: { has: obj => "_handleLoop" in obj, get: obj => obj._handleLoop, set: (obj, value) => { obj._handleLoop = value; } }, metadata: _metadata }, __handleLoop_initializers, __handleLoop_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'src',
            'loop',
            'pause-on-hide',
        ];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #getAudioElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#audio');
        _handleSrc(newValue) {
            let parsedSrc;
            try {
                parsedSrc = JSON.parse(newValue || '') || {};
            }
            catch (error) {
                console.error(`JSON.parse src error: ${error}`);
                parsedSrc = {};
            }
            if (newValue === null) {
                this.#dom.dispatchEvent(new CustomEvent('error', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: {
                        code: utils_XAudioErrorCode.SrcError,
                        msg: '',
                        from: 'res loader',
                        currentSrcID: this.#dom[xAudioSrc]?.id,
                    },
                }));
            }
            else if (parsedSrc?.id === undefined || parsedSrc?.play_url === undefined) {
                this.#dom.dispatchEvent(new CustomEvent('error', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: {
                        code: utils_XAudioErrorCode.SrcJsonError,
                        msg: '',
                        from: 'res loader',
                        currentSrcID: this.#dom[xAudioSrc]?.id,
                    },
                }));
            }
            this.#dom[xAudioSrc] = parsedSrc;
            this.#dom[xAudioBlob] = undefined;
            this.#dom.stop();
        }
        _handleLoop = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleLoop_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getAudioElement, 'loop'));
        #documentVisibilitychange = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleLoop_extraInitializers), () => {
            if (document.visibilityState === 'hidden') {
                this.#dom.pause();
            }
        });
        _handlePauseOnHide(newValue) {
            if (newValue !== null) {
                document.addEventListener('visibilitychange', this.#documentVisibilitychange, { passive: true });
            }
            else {
                document.removeEventListener('visibilitychange', this.#documentVisibilitychange);
            }
        }
        constructor(dom) {
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=XAudioAttribute.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XAudioTT/XAudioEvents.js
/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



class XAudioEvents {
    static observedAttributes = [];
    #dom;
    #intervalPlay;
    #getAudioElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#audio');
    #playEvent = (event) => {
        const attributeInterval = Number(this.#dom.getAttribute('interval'));
        const delay = Number.isNaN(attributeInterval) ? 0 : attributeInterval;
        this.#intervalPlay = setInterval(() => {
            this.#dom.dispatchEvent(new CustomEvent('timeupdate', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    currentTime: this.#getAudioElement().currentTime,
                    currentSrcID: this.#dom[xAudioSrc]?.id,
                },
            }));
        }, delay);
        const playbackState = audioPlaybackStateMap[event.type];
        this.#dom.dispatchEvent(new CustomEvent('playbackstatechanged', {
            ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
            detail: {
                code: playbackState?.code,
                type: playbackState?.type,
                currentSrcID: this.#dom[xAudioSrc]?.id,
            },
        }));
    };
    #pauseEvent = (event) => {
        clearInterval(this.#intervalPlay);
        const playbackState = audioPlaybackStateMap[event.type];
        this.#dom.dispatchEvent(new CustomEvent('playbackstatechanged', {
            ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
            detail: {
                code: playbackState?.code,
                type: playbackState?.type,
                currentSrcID: this.#dom[xAudioSrc]?.id,
            },
        }));
    };
    #loadingEvent = (event) => {
        const loadingState = audioLoadingStateMap[event.type];
        this.#dom.dispatchEvent(new CustomEvent('loadingstatechanged', {
            ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
            detail: {
                code: loadingState?.code,
                type: loadingState?.type,
                currentSrcID: this.#dom[xAudioSrc]?.id,
            },
        }));
    };
    #errorEvent = (event) => {
        this.#loadingEvent(event);
        const mediaCode = event.target?.error?.code;
        let code = mediaCode === MediaError.MEDIA_ERR_DECODE
            ? utils_XAudioErrorCode.PlayerLoadingError
            : utils_XAudioErrorCode.PlayerPlaybackError;
        if (mediaCode === MediaError.MEDIA_ERR_DECODE) {
            code = utils_XAudioErrorCode.PlayerLoadingError;
        }
        this.#dom.dispatchEvent(new CustomEvent('error', {
            ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
            detail: {
                code,
                msg: '',
                from: 'player',
                currentSrcID: this.#dom[xAudioSrc]?.id,
            },
        }));
    };
    #endedEvent = () => {
        const loop = this.#dom.getAttribute('loop') === null ? false : true;
        this.#dom.dispatchEvent(new CustomEvent('finished', {
            ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
            detail: {
                loop,
                currentSrcID: this.#dom[xAudioSrc]?.id,
            },
        }));
    };
    constructor(dom) {
        this.#dom = dom;
    }
    connectedCallback() {
        const audioElement = this.#getAudioElement();
        audioElement.addEventListener('play', this.#playEvent, {
            passive: true,
        });
        audioElement.addEventListener('pause', this.#pauseEvent, {
            passive: true,
        });
        audioElement.addEventListener('ended', this.#endedEvent, {
            passive: true,
        });
        audioElement.addEventListener('loadstart', this.#loadingEvent, {
            passive: true,
        });
        audioElement.addEventListener('canplay', this.#loadingEvent, {
            passive: true,
        });
        audioElement.addEventListener('stalled', this.#loadingEvent, {
            passive: true,
        });
        audioElement.addEventListener('error', this.#errorEvent, {
            passive: true,
        });
    }
}
//# sourceMappingURL=XAudioEvents.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XAudioTT/XAudioTT.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/







let XAudioTT_XAudioTT = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-audio-tt', [CommonEventsAndMethods/* .CommonEventsAndMethods */.O, XAudioAttribute, XAudioEvents], templateXAudioTT)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XAudioTT = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XAudioTT = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        #getAudio = (0,element_reactive/* .genDomGetter */.Ut)(() => this.shadowRoot, '#audio');
        #getAudioElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.shadowRoot, '#audio');
        #setAudioSrc = (0,element_reactive/* .bindToAttribute */.H$)(this.#getAudioElement, 'src');
        [xAudioSrc];
        [xAudioBlob];
        #dispatchError(code, from) {
            this.dispatchEvent(new CustomEvent('error', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    code,
                    msg: '',
                    from,
                    currentSrcID: this[xAudioSrc]?.id,
                },
            }));
        }
        #fetchAudio = () => {
            const parsedSrc = this[xAudioSrc];
            if (!parsedSrc || !parsedSrc.id || !parsedSrc.play_url) {
                return;
            }
            let parsedHeaders;
            try {
                parsedHeaders = JSON.parse(this.getAttribute('headers') || '{}')
                    || {};
            }
            catch (error) {
                console.error(`JSON.parse headers error: ${error}`);
                parsedHeaders = {};
            }
            this[xAudioBlob] = new Promise(async (resolve, reject) => {
                this.dispatchEvent(new CustomEvent('srcloadingstatechanged', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: {
                        code: 0,
                        type: 'loading',
                        currentSrcID: parsedSrc.id,
                    },
                }));
                const response = await fetch(parsedSrc.play_url, {
                    headers: parsedHeaders,
                });
                if (!response.ok) {
                    this.#dispatchError(utils_XAudioErrorCode.DownloadError, 'res loader');
                    reject();
                    return;
                }
                this.dispatchEvent(new CustomEvent('srcloadingstatechanged', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: {
                        code: 1,
                        type: 'success',
                        currentSrcID: parsedSrc.id,
                    },
                }));
                if (response.headers.get('content-type')?.toLowerCase().startsWith('text/html')) {
                    this.#dispatchError(utils_XAudioErrorCode.PlayerPlaybackError, 'player');
                    reject();
                    return;
                }
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                this.#setAudioSrc(blobUrl);
                resolve();
            });
            void this[xAudioBlob].catch(() => { });
        };
        play() {
            // If prepare method is not called, needs to fetch first
            if (!this[xAudioBlob]) {
                this.#fetchAudio();
            }
            this[xAudioBlob]?.then(() => {
                const audio = this.#getAudio();
                audio.currentTime = 0;
                try {
                    void audio.play().catch(() => {
                        this.#dispatchError(utils_XAudioErrorCode.PlayerPlaybackError, 'player');
                    });
                }
                catch {
                    this.#dispatchError(utils_XAudioErrorCode.PlayerPlaybackError, 'player');
                }
            }, () => { });
            return {
                currentSrcID: this[xAudioSrc]?.id,
                loadingSrcID: '',
            };
        }
        stop() {
            const audio = this.#getAudio();
            const playbackState = audioPlaybackStateMap.stop;
            this.dispatchEvent(new CustomEvent('playbackstatechanged', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    code: playbackState?.code,
                    type: playbackState?.type,
                    currentSrcID: this[xAudioSrc]?.id,
                },
            }));
            audio.currentTime = 0;
            audio.pause();
            return {
                currentSrcID: this[xAudioSrc]?.id,
            };
        }
        pause() {
            const audio = this.#getAudio();
            audio.pause();
            return {
                currentSrcID: this[xAudioSrc]?.id,
            };
        }
        resume() {
            const audio = this.#getAudio();
            audio.play();
            return {
                currentSrcID: this[xAudioSrc]?.id,
                loadingSrcID: '',
            };
        }
        seek(params) {
            const audio = this.#getAudio();
            audio.currentTime = (params.currentTime || 0) / 1000;
            this.dispatchEvent(new CustomEvent('seek', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    seekresult: 1,
                    currentSrcID: this[xAudioSrc]?.id,
                },
            }));
            return {
                currentSrcID: this[xAudioSrc]?.id,
            };
        }
        mute(params) {
            const audio = this.#getAudio();
            audio.muted = params.mute;
            return {
                currentSrcID: this[xAudioSrc]?.id,
            };
        }
        playerInfo() {
            const audioElement = this.#getAudio();
            const buffered = audioElement.buffered;
            const cacheTime = buffered.end(buffered.length - 1);
            return {
                currentSrcID: this[xAudioSrc]?.id,
                duration: audioElement.duration * 1000,
                playbackState: getAudioState(audioElement),
                // playBitrate can not support now
                currentTime: audioElement.currentTime,
                cacheTime,
            };
        }
        prepare() {
            // if has fetched, no need to fetch again
            if (!this[xAudioBlob]) {
                this.#fetchAudio();
            }
        }
        setVolume(params) {
            const audio = this.#getAudio();
            audio.volume = params.volume;
            return {
                code: 1,
            };
        }
    };
    return XAudioTT = _classThis;
})();

//# sourceMappingURL=XAudioTT.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XAudioTT/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/XAudioTT
 *
 * `x-audio-tt` provides audio playback functionality.
 *
 * Attributes:
 * - `src`: JSON string containing audio source info (`{id, play_url}`).
 * - `loop`: 'true' | 'false', whether to loop playback.
 * - `pause-on-hide`: 'true' | 'false', whether to pause when document is hidden.
 *
 * Methods:
 * - `play()`: Starts playback.
 * - `pause()`: Pauses playback.
 * - `stop()`: Stops playback.
 * - `resume()`: Resumes playback.
 * - `seek({ currentTime })`: Seeks to time (in ms).
 * - `mute({ mute })`: Mutes/unmutes.
 * - `setVolume({ volume })`: Sets volume (0-1).
 * - `playerInfo()`: Returns current player state.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XCanvas/CanvasAttributes.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/


let CanvasAttributes = (() => {
    let _handleName_decorators;
    let _handleName_initializers = [];
    let _handleName_extraInitializers = [];
    let _handleHeight_decorators;
    let _handleHeight_initializers = [];
    let _handleHeight_extraInitializers = [];
    let _handleWidth_decorators;
    let _handleWidth_initializers = [];
    let _handleWidth_extraInitializers = [];
    return class CanvasAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _handleName_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('name', true)];
            _handleHeight_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('height', true)];
            _handleWidth_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('width', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, _handleName_decorators, { kind: "field", name: "handleName", static: false, private: false, access: { has: obj => "handleName" in obj, get: obj => obj.handleName, set: (obj, value) => { obj.handleName = value; } }, metadata: _metadata }, _handleName_initializers, _handleName_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, _handleHeight_decorators, { kind: "field", name: "handleHeight", static: false, private: false, access: { has: obj => "handleHeight" in obj, get: obj => obj.handleHeight, set: (obj, value) => { obj.handleHeight = value; } }, metadata: _metadata }, _handleHeight_initializers, _handleHeight_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, _handleWidth_decorators, { kind: "field", name: "handleWidth", static: false, private: false, access: { has: obj => "handleWidth" in obj, get: obj => obj.handleWidth, set: (obj, value) => { obj.handleWidth = value; } }, metadata: _metadata }, _handleWidth_initializers, _handleWidth_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['name', 'height', 'width'];
        #dom;
        #resizeObserver;
        #getCanvas = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#canvas');
        constructor(dom) {
            this.#dom = dom;
        }
        handleName = (0,tslib_es6/* .__runInitializers */.zF)(this, _handleName_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getCanvas, 'name'));
        handleHeight = ((0,tslib_es6/* .__runInitializers */.zF)(this, _handleName_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, _handleHeight_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getCanvas, 'height')));
        handleWidth = ((0,tslib_es6/* .__runInitializers */.zF)(this, _handleHeight_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, _handleWidth_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getCanvas, 'width')));
        #resizeHandler = ((0,tslib_es6/* .__runInitializers */.zF)(this, _handleWidth_extraInitializers), (entries) => {
            const { contentRect } = entries[0];
            const canvas = this.#dom.shadowRoot.firstElementChild;
            if (canvas) {
                let { height, width } = contentRect;
                height = height * window.devicePixelRatio;
                width = width * window.devicePixelRatio;
                const resizeEvent = new CustomEvent('resize', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: {
                        height,
                        width,
                    },
                });
                resizeEvent.height = height;
                resizeEvent.width = width;
                canvas.dispatchEvent(resizeEvent);
            }
        });
        #startResizeObserver() {
            if (!this.#resizeObserver) {
                this.#resizeObserver = new ResizeObserver(this.#resizeHandler);
                this.#resizeObserver.observe(this.#dom);
            }
        }
        #stopResizeObserver() {
            this.#resizeObserver?.disconnect();
            this.#resizeObserver = undefined;
        }
        connectedCallback() {
            this.#startResizeObserver();
        }
        dispose() {
            this.#stopResizeObserver();
        }
    };
})();

//# sourceMappingURL=CanvasAttributes.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XCanvas/XCanvas.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



/**
 * @deprecated this proposals cannot be implemented on other platforms
 */
let XCanvas_XCanvas = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-canvas', [CommonEventsAndMethods/* .CommonEventsAndMethods */.O, CanvasAttributes], (0,element_reactive/* .html */.qy) `<canvas id="canvas" part="canvas"></canvas>`)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XCanvas = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XCanvas = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XCanvas = _classThis;
})();

//# sourceMappingURL=XCanvas.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XFoldViewNg/XFoldviewNgEvents.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



let XFoldviewNgEvents = (() => {
    let _instanceExtraInitializers = [];
    let __handleGranularity_decorators;
    let __enableOffsetEvent_decorators;
    return class XFoldviewNgEvents {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleGranularity_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('granularity', true)];
            __enableOffsetEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('offset')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleGranularity_decorators, { kind: "method", name: "_handleGranularity", static: false, private: false, access: { has: obj => "_handleGranularity" in obj, get: obj => obj._handleGranularity }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __enableOffsetEvent_decorators, { kind: "method", name: "_enableOffsetEvent", static: false, private: false, access: { has: obj => "_enableOffsetEvent" in obj, get: obj => obj._enableOffsetEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #granularity = 0.01;
        #pervScroll = 0;
        constructor(dom) {
            this.#dom = dom;
        }
        static observedAttributes = ['granularity'];
        _handleGranularity(newVal) {
            if (newVal && newVal !== '')
                this.#granularity = parseFloat(newVal);
            else
                this.#granularity = 0.01;
        }
        _enableOffsetEvent(enable) {
            if (enable) {
                this.#dom.addEventListener('scroll', this.#handleScroll, {
                    passive: true,
                });
            }
            else {
                this.#dom.removeEventListener('scroll', this.#handleScroll);
            }
        }
        #handleScroll = () => {
            const currentScrollTop = this.#dom.scrollTop;
            const scrollLength = Math.abs(this.#pervScroll - currentScrollTop);
            if (scrollLength > this.#granularity
                || this.#dom.scrollTop === 0
                || Math.abs(this.#dom.scrollHeight - this.#dom.clientHeight - this.#dom.scrollTop) <= 1) {
                this.#pervScroll = currentScrollTop;
                this.#dom.dispatchEvent(new CustomEvent('offset', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: {
                        offset: currentScrollTop,
                        height: this.#dom[scrollableLength],
                    },
                }));
            }
        };
    };
})();

//# sourceMappingURL=XFoldviewNgEvents.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XFoldViewNg/XFoldviewNg.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/





const scrollableLength = Symbol('scrollableLength');
const isHeaderShowing = Symbol('isHeaderShowing');
const resizeObserver = Symbol('resizeObserver');
const slotKid = Symbol('slotKid');
let XFoldviewNg_XFoldviewNg = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-foldview-ng', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
            XFoldviewNgEvents,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XFoldviewNg = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XFoldviewNg = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static notToFilterFalseAttributes = new Set(['scroll-enable']);
        [slotKid];
        [resizeObserver] = new ResizeObserver((resizeEntries) => {
            for (const resize of resizeEntries) {
                if (resize.target.tagName === 'X-FOLDVIEW-HEADER-NG') {
                    this.#headerHeight = resize.contentRect.height;
                }
                else if (resize.target.tagName === 'X-FOLDVIEW-TOOLBAR-NG') {
                    this.#toolbarHeight = resize.contentRect.height;
                }
            }
            if (this[slotKid]) {
                this[slotKid].style.top = `${this.#headerHeight - this.#toolbarHeight}px`;
            }
        });
        #headerHeight = 0;
        #toolbarHeight = 0;
        get [scrollableLength]() {
            return this.#headerHeight - this.#toolbarHeight;
        }
        get [isHeaderShowing]() {
            // This behavior cannot be reproduced in the current test, but can be reproduced in Android WebView
            return this[scrollableLength] - this.scrollTop >= 1;
        }
        get scrollTop() {
            return super.scrollTop;
        }
        set scrollTop(value) {
            if (value > this[scrollableLength]) {
                value = this[scrollableLength];
            }
            else if (value < 0) {
                value = 0;
            }
            super.scrollTop = value;
        }
        setFoldExpanded(params) {
            const { offset, smooth = true } = params;
            const offsetValue = parseFloat(offset);
            // `scrollTo` is the native method and does not go through the `scrollTop`
            // setter above, so the offset has to be clamped here as well.
            this.scrollTo({
                top: Math.min(Math.max(offsetValue, 0), this[scrollableLength]),
                behavior: smooth ? 'smooth' : 'instant',
            });
        }
        get [constants/* .scrollContainerDom */.l]() {
            return this;
        }
        disconnectedCallback() {
            this[resizeObserver]?.disconnect();
            this[resizeObserver] = undefined;
        }
        static {
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XFoldviewNg = _classThis;
})();

//# sourceMappingURL=XFoldviewNg.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/common/getCombinedParentElement.js
const getCombinedDirectParentElement = (element, parentTagName) => {
    let parentElement = element.parentElement;
    if (parentElement?.tagName === 'LYNX-WRAPPER') {
        parentElement = parentElement.parentElement;
    }
    if (parentElement?.tagName === parentTagName) {
        return parentElement;
    }
    return;
};
//# sourceMappingURL=getCombinedParentElement.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XFoldViewNg/XFoldviewHeaderNg.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/





let XFoldviewHeaderNg_XFoldviewHeaderNg = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-foldview-header-ng', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XFoldviewHeaderNg = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XFoldviewHeaderNg = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        #parentResizeObserver = undefined;
        connectedCallback() {
            const parentElement = getCombinedDirectParentElement(this, 'X-FOLDVIEW-NG');
            this.#parentResizeObserver = parentElement?.[resizeObserver];
            this.#parentResizeObserver?.observe(this);
        }
        dispose() {
            this.#parentResizeObserver?.unobserve(this);
        }
    };
    return XFoldviewHeaderNg = _classThis;
})();

//# sourceMappingURL=XFoldviewHeaderNg.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XFoldViewNg/XFoldviewSlotDragNg.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



let XFoldviewSlotDragNg_XFoldviewSlotDragNg = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-foldview-slot-drag-ng', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XFoldviewSlotDragNg = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XFoldviewSlotDragNg = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XFoldviewSlotDragNg = _classThis;
})();

//# sourceMappingURL=XFoldviewSlotDragNg.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XFoldViewNg/XFoldviewSlotNgTouchEventsHandler.js


class XFoldviewSlotNgTouchEventsHandler {
    #parentScrollTop = 0;
    #childrenElemsntsScrollTop = new WeakMap();
    #elements;
    #previousPageY = 0;
    #previousPageX = 0;
    #scrollingVertically = null;
    #currentScrollingElement;
    #deltaY = 0;
    #dom;
    static observedAttributes = [];
    constructor(dom) {
        this.#dom = dom;
        this.#dom.addEventListener('touchmove', this.#handleTouch, {
            passive: false,
        });
        this.#dom.addEventListener('touchstart', this.#touchStart, {
            passive: true,
        });
        this.#dom.addEventListener('touchend', this.#touchEnd, {
            passive: true,
        });
        this.#dom.addEventListener('wheel', this.#handleWheel, {
            passive: false,
        });
    }
    #resolveScrollContainer(element) {
        const maybeScrollContainer = element[constants/* .scrollContainerDom */.l];
        return maybeScrollContainer instanceof Element
            ? maybeScrollContainer
            : element;
    }
    #collectCandidateElements(elements) {
        return [
            ...new Set(elements.map(element => this.#resolveScrollContainer(element))),
        ];
    }
    #isScrollContainer(element) {
        let overflowY;
        if (typeof element.computedStyleMap === 'function') {
            try {
                overflowY = element.computedStyleMap().get('overflow-y')?.toString()
                    ?? 'visible';
            }
            catch {
                overflowY = getComputedStyle(element).overflowY || 'visible';
            }
        }
        else {
            overflowY = getComputedStyle(element).overflowY || 'visible';
        }
        return overflowY === 'auto' || overflowY === 'scroll'
            || overflowY === 'hidden' || overflowY === 'overlay';
    }
    #getTheMostScrollableKid(delta) {
        const scrollableKid = this.#elements?.find((element) => {
            if (this.#isScrollContainer(element)
                && element.scrollHeight > element.clientHeight) {
                const couldScrollNear = delta < 0
                    && element.scrollTop !== 0;
                const couldScrollFar = delta > 0
                    && Math.abs(element.scrollHeight - element.clientHeight
                        - element.scrollTop) > 1;
                return couldScrollNear || couldScrollFar;
            }
            return false;
        });
        return scrollableKid;
    }
    #scrollKid(scrollableKid, delta) {
        let targetKidScrollDistance = this.#childrenElemsntsScrollTop.get(scrollableKid) ?? 0;
        targetKidScrollDistance += delta;
        this.#childrenElemsntsScrollTop.set(scrollableKid, targetKidScrollDistance);
        scrollableKid.scrollTop = targetKidScrollDistance;
    }
    #handleTouch = (event) => {
        const parentElement = this.#getParentElement();
        if (!parentElement) {
            return;
        }
        const touch = event.touches.item(0);
        const { pageY, pageX } = touch;
        const deltaY = this.#previousPageY - pageY;
        if (this.#scrollingVertically === null) {
            const deltaX = this.#previousPageX - pageX;
            this.#scrollingVertically = Math.abs(deltaY) > Math.abs(deltaX);
        }
        if (this.#scrollingVertically === false) {
            return;
        }
        if (event.cancelable) {
            event.preventDefault();
        }
        this.#handleScrollDelta(deltaY, parentElement);
        this.#previousPageY = pageY;
        this.#previousPageX = pageX;
    };
    #handleWheel = (event) => {
        const parentElement = this.#getParentElement();
        if (!parentElement) {
            return;
        }
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
            return;
        }
        const pathElements = event.composedPath().filter((element) => element instanceof Element && this.#dom.contains(element)
            && element !== this.#dom);
        const { clientX, clientY } = event;
        const pointElements = document.elementsFromPoint(clientX, clientY).filter(e => this.#dom.contains(e));
        this.#elements = this.#collectCandidateElements([
            ...pathElements,
            ...pointElements,
        ]);
        this.#parentScrollTop = parentElement.scrollTop;
        if (this.#elements) {
            for (const element of this.#elements) {
                this.#childrenElemsntsScrollTop.set(element, element.scrollTop);
            }
        }
        if (event.cancelable) {
            event.preventDefault();
        }
        this.#handleScrollDelta(event.deltaY, parentElement);
    };
    #getParentElement() {
        const parentElement = this.#dom.parentElement;
        if (parentElement && parentElement.tagName === 'X-FOLDVIEW-NG') {
            return parentElement;
        }
    }
    #touchStart = (event) => {
        const touch = event.touches.item(0);
        const { pageX, pageY, clientX, clientY } = touch;
        // `elementsFromPoint()` doesn't reliably pierce into Shadow DOM; combine with
        // the composed path so we can pick up internal scroll containers like
        // `x-list`'s `#content` inside the shadow root.
        const pathElements = event.composedPath().filter((element) => element instanceof Element && this.#dom.contains(element)
            && element !== this.#dom);
        const pointElements = document.elementsFromPoint(clientX, clientY).filter(e => this.#dom.contains(e) && e !== this.#dom);
        this.#elements = this.#collectCandidateElements([
            ...pathElements,
            ...pointElements,
        ]);
        this.#previousPageY = pageY;
        this.#previousPageX = pageX;
        this.#parentScrollTop = this.#getParentElement()?.scrollTop ?? 0;
        for (const element of this.#elements) {
            this.#childrenElemsntsScrollTop.set(element, element.scrollTop);
        }
        this.#scrollingVertically = null;
        this.#currentScrollingElement = undefined;
    };
    #touchEnd = () => {
        this.#scrollingVertically = null;
        if (this.#currentScrollingElement) {
            const parentElement = this.#getParentElement();
            if (this.#currentScrollingElement === parentElement
                && !parentElement[isHeaderShowing]) {
                return;
            }
            this.#currentScrollingElement.scrollBy({
                top: this.#deltaY * 4,
                behavior: 'smooth',
            });
        }
    };
    #handleScrollDelta(deltaY, parentElement) {
        const scrollableKidY = this.#getTheMostScrollableKid(deltaY);
        if ((parentElement[isHeaderShowing] && deltaY > 0
            || (deltaY < 0 && !scrollableKidY))
            // deltaY > 0: swipe up (folding header)
            // scroll the foldview if its scrollable
            || (!parentElement[isHeaderShowing] && !scrollableKidY)
        // all sub doms are scrolled
        ) {
            parentElement.scrollBy({
                top: deltaY,
                behavior: 'smooth',
            });
            this.#parentScrollTop += deltaY;
            parentElement.scrollTop = this.#parentScrollTop;
            this.#currentScrollingElement = parentElement;
        }
        else if (scrollableKidY) {
            this.#currentScrollingElement = scrollableKidY;
            this.#scrollKid(scrollableKidY, deltaY);
        }
        this.#deltaY = deltaY;
    }
}
//# sourceMappingURL=XFoldviewSlotNgTouchEventsHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XFoldViewNg/XFoldviewSlotNg.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/





let XFoldviewSlotNg_XFoldviewSlotNg = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-foldview-slot-ng', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
            XFoldviewSlotNgTouchEventsHandler,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XFoldviewSlotNg = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XFoldviewSlotNg = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        connectedCallback() {
            if (this.matches('x-foldview-ng>x-foldview-slot-ng:first-of-type')) {
                this.parentElement[slotKid] = this;
            }
        }
    };
    return XFoldviewSlotNg = _classThis;
})();

//# sourceMappingURL=XFoldviewSlotNg.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XFoldViewNg/XFoldviewToolbarNg.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/





let XFoldviewToolbarNg_XFoldviewToolbarNg = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-foldview-toolbar-ng', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XFoldviewToolbarNg = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XFoldviewToolbarNg = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        #parentResizeObserver = undefined;
        connectedCallback() {
            const parentElement = getCombinedDirectParentElement(this, 'X-FOLDVIEW-NG');
            this.#parentResizeObserver = parentElement?.[resizeObserver];
            this.#parentResizeObserver?.observe(this);
        }
        dispose() {
            this.#parentResizeObserver?.unobserve(this);
        }
    };
    return XFoldviewToolbarNg = _classThis;
})();

//# sourceMappingURL=XFoldviewToolbarNg.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XFoldViewNg/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/XFoldViewNg
 *
 * `x-foldview-ng` provides a collapsible view with header, toolbar, and content slots.
 *
 * Components:
 * - `x-foldview-ng`: Main container.
 * - `x-foldview-header-ng`: Header area.
 * - `x-foldview-toolbar-ng`: Toolbar area.
 * - `x-foldview-slot-ng`: Scrollable content area.
 * - `x-foldview-slot-drag-ng`: Area to drag for scrolling.
 *
 * `x-foldview-ng` attributes:
 * - `scroll-enable`: 'true' | 'false'.
 *
 * `x-foldview-ng` methods:
 * - `setFoldExpanded({ offset, smooth })`: Expands/collapses the view.
 */





//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XImage/DropShadow.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let DropShadow = (() => {
    let __handleBlurRadius_decorators;
    let __handleBlurRadius_initializers = [];
    let __handleBlurRadius_extraInitializers = [];
    return class DropShadow {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleBlurRadius_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('drop-shadow', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleBlurRadius_decorators, { kind: "field", name: "_handleBlurRadius", static: false, private: false, access: { has: obj => "_handleBlurRadius" in obj, get: obj => obj._handleBlurRadius, set: (obj, value) => { obj._handleBlurRadius = value; } }, metadata: _metadata }, __handleBlurRadius_initializers, __handleBlurRadius_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['drop-shadow'];
        #dom;
        #getImg = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#img');
        _handleBlurRadius = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleBlurRadius_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getImg, '--drop-shadow', undefined, true));
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handleBlurRadius_extraInitializers);
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=DropShadow.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XImage/ImageSrc.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let ImageSrc = (() => {
    let _instanceExtraInitializers = [];
    let __handleSrc_decorators;
    let __handleSrc_initializers = [];
    let __handleSrc_extraInitializers = [];
    let __preloadPlaceholder_decorators;
    let __handleBlurRadius_decorators;
    let __handleBlurRadius_initializers = [];
    let __handleBlurRadius_extraInitializers = [];
    let __handleCrossorigin_decorators;
    let __handleCrossorigin_initializers = [];
    let __handleCrossorigin_extraInitializers = [];
    let __handleReferrerpolicy_decorators;
    let __handleReferrerpolicy_initializers = [];
    let __handleReferrerpolicy_extraInitializers = [];
    return class ImageSrc {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleSrc_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('src', true)];
            __preloadPlaceholder_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder', true)];
            __handleBlurRadius_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('blur-radius', true)];
            __handleCrossorigin_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('crossorigin', true)];
            __handleReferrerpolicy_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('referrerpolicy', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __preloadPlaceholder_decorators, { kind: "method", name: "_preloadPlaceholder", static: false, private: false, access: { has: obj => "_preloadPlaceholder" in obj, get: obj => obj._preloadPlaceholder }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleSrc_decorators, { kind: "field", name: "_handleSrc", static: false, private: false, access: { has: obj => "_handleSrc" in obj, get: obj => obj._handleSrc, set: (obj, value) => { obj._handleSrc = value; } }, metadata: _metadata }, __handleSrc_initializers, __handleSrc_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleBlurRadius_decorators, { kind: "field", name: "_handleBlurRadius", static: false, private: false, access: { has: obj => "_handleBlurRadius" in obj, get: obj => obj._handleBlurRadius, set: (obj, value) => { obj._handleBlurRadius = value; } }, metadata: _metadata }, __handleBlurRadius_initializers, __handleBlurRadius_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleCrossorigin_decorators, { kind: "field", name: "_handleCrossorigin", static: false, private: false, access: { has: obj => "_handleCrossorigin" in obj, get: obj => obj._handleCrossorigin, set: (obj, value) => { obj._handleCrossorigin = value; } }, metadata: _metadata }, __handleCrossorigin_initializers, __handleCrossorigin_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleReferrerpolicy_decorators, { kind: "field", name: "_handleReferrerpolicy", static: false, private: false, access: { has: obj => "_handleReferrerpolicy" in obj, get: obj => obj._handleReferrerpolicy, set: (obj, value) => { obj._handleReferrerpolicy = value; } }, metadata: _metadata }, __handleReferrerpolicy_initializers, __handleReferrerpolicy_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'src',
            'placeholder',
            'blur-radius',
            'crossorigin',
            'referrerpolicy',
        ];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #getImg = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#img');
        _handleSrc = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleSrc_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getImg, 'src', (newval) => {
            return newval || this.#dom.getAttribute('placeholder');
        }));
        _preloadPlaceholder(newVal) {
            if (newVal) {
                new Image().src = newVal;
            }
        }
        _handleBlurRadius = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleSrc_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleBlurRadius_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getImg, '--blur-radius', undefined, true)));
        _handleCrossorigin = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleBlurRadius_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleCrossorigin_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getImg, 'crossorigin')));
        _handleReferrerpolicy = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleCrossorigin_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleReferrerpolicy_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getImg, 'referrerpolicy')));
        #onImageError = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleReferrerpolicy_extraInitializers), () => {
            const currentSrc = this.#getImg().src;
            const placeholder = this.#dom.getAttribute('placeholder');
            if (placeholder && currentSrc !== placeholder) {
                this.#getImg().src = placeholder;
            }
        });
        constructor(dom) {
            this.#dom = dom;
            this.#getImg().addEventListener('error', this.#onImageError);
        }
        connectedCallback() {
            if (this.#dom.getAttribute('src') === null
                || this.#dom.getAttribute('src') === '') {
                this._handleSrc(null);
            }
        }
    };
})();

//# sourceMappingURL=ImageSrc.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XImage/ImageEvents.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



let ImageEvents = (() => {
    let _instanceExtraInitializers = [];
    let __enableLoadEvent_decorators;
    let __enableErrorEvent_decorators;
    return class ImageEvents {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __enableLoadEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('load')];
            __enableErrorEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('error')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __enableLoadEvent_decorators, { kind: "method", name: "_enableLoadEvent", static: false, private: false, access: { has: obj => "_enableLoadEvent" in obj, get: obj => obj._enableLoadEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __enableErrorEvent_decorators, { kind: "method", name: "_enableErrorEvent", static: false, private: false, access: { has: obj => "_enableErrorEvent" in obj, get: obj => obj._enableErrorEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #pendingLoadEvents = [];
        #getImg = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#img');
        _enableLoadEvent(status) {
            if (status) {
                this.#getImg().addEventListener('load', this.#teleportLoadEvent, {
                    passive: true,
                });
            }
            else {
                this.#getImg().removeEventListener('load', this.#teleportLoadEvent);
                this.#pendingLoadEvents = [];
            }
        }
        _enableErrorEvent(status) {
            if (status) {
                this.#getImg().addEventListener('error', this.#teleportErrorEvent, {
                    passive: true,
                });
            }
            else {
                this.#getImg().removeEventListener('error', this.#teleportErrorEvent);
            }
        }
        #teleportLoadEvent = () => {
            const event = new CustomEvent('load', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    width: this.#getImg().naturalWidth,
                    height: this.#getImg().naturalHeight,
                },
            });
            if (this.#dom.isConnected) {
                this.#dom.dispatchEvent(event);
            }
            else {
                // Preserve the dimensions at load time until the host joins the document.
                this.#pendingLoadEvents.push(event);
            }
        };
        connectedCallback() {
            while (this.#dom.isConnected && this.#pendingLoadEvents.length) {
                this.#dom.dispatchEvent(this.#pendingLoadEvents.shift());
            }
        }
        #teleportErrorEvent = () => {
            this.#dom.dispatchEvent(new CustomEvent('error', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {},
            }));
        };
        constructor(dom) {
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=ImageEvents.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XImage/FilterImage.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/






let FilterImage_FilterImage = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('filter-image', [CommonEventsAndMethods/* .CommonEventsAndMethods */.O, ImageSrc, DropShadow, ImageEvents], templateFilterImage({}))];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var FilterImage = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            FilterImage = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return FilterImage = _classThis;
})();

//# sourceMappingURL=FilterImage.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XImage/XImage.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/





let XImage_XImage = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-image', [CommonEventsAndMethods/* .CommonEventsAndMethods */.O, ImageSrc, ImageEvents], templateXImage({}))];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XImage = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XImage = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XImage = _classThis;
})();

//# sourceMappingURL=XImage.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XImage/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * @module elements/XImage
 *
 * `x-image` displays an image.
 *
 * Attributes:
 * - `src`: Image source URL.
 * - `placeholder`: Placeholder image URL.
 * - `blur-radius`: Blur radius in px.
 * - `crossorigin`: Cross-origin settings.
 * - `referrerpolicy`: Referrer policy.
 *
 * Events:
 * - `load`: Fired when image loads successfully. Detail: `{ width, height }`.
 * - `error`: Fired when image fails to load.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XInput/InputBaseAttributes.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

/**
 * shared by x-input and x-input-ng
 */
let InputBaseAttributes = (() => {
    let _instanceExtraInitializers = [];
    let __handlerConfirmType_decorators;
    let __handlerConfirmType_initializers = [];
    let __handlerConfirmType_extraInitializers = [];
    let __handlerMaxlength_decorators;
    let __handlerMaxlength_initializers = [];
    let __handlerMaxlength_extraInitializers = [];
    let __handleReadonly_decorators;
    let __handleReadonly_initializers = [];
    let __handleReadonly_extraInitializers = [];
    let __handleType_decorators;
    let __handleSpellCheck_decorators;
    let __handleSpellCheck_initializers = [];
    let __handleSpellCheck_extraInitializers = [];
    return class InputBaseAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handlerConfirmType_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('confirm-type', true)];
            __handlerMaxlength_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('maxlength', true)];
            __handleReadonly_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('readonly', true)];
            __handleType_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('type', true)];
            __handleSpellCheck_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('ios-spell-check', true), (0,element_reactive/* .registerAttributeHandler */._y)('spell-check', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleType_decorators, { kind: "method", name: "_handleType", static: false, private: false, access: { has: obj => "_handleType" in obj, get: obj => obj._handleType }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerConfirmType_decorators, { kind: "field", name: "_handlerConfirmType", static: false, private: false, access: { has: obj => "_handlerConfirmType" in obj, get: obj => obj._handlerConfirmType, set: (obj, value) => { obj._handlerConfirmType = value; } }, metadata: _metadata }, __handlerConfirmType_initializers, __handlerConfirmType_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerMaxlength_decorators, { kind: "field", name: "_handlerMaxlength", static: false, private: false, access: { has: obj => "_handlerMaxlength" in obj, get: obj => obj._handlerMaxlength, set: (obj, value) => { obj._handlerMaxlength = value; } }, metadata: _metadata }, __handlerMaxlength_initializers, __handlerMaxlength_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleReadonly_decorators, { kind: "field", name: "_handleReadonly", static: false, private: false, access: { has: obj => "_handleReadonly" in obj, get: obj => obj._handleReadonly, set: (obj, value) => { obj._handleReadonly = value; } }, metadata: _metadata }, __handleReadonly_initializers, __handleReadonly_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleSpellCheck_decorators, { kind: "field", name: "_handleSpellCheck", static: false, private: false, access: { has: obj => "_handleSpellCheck" in obj, get: obj => obj._handleSpellCheck, set: (obj, value) => { obj._handleSpellCheck = value; } }, metadata: _metadata }, __handleSpellCheck_initializers, __handleSpellCheck_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'confirm-type',
            'maxlength',
            'readonly',
            'type',
            'ios-spell-check',
            'spell-check',
        ];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #getInputElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#input');
        _handlerConfirmType = (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerConfirmType_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getInputElement, 'enterkeyhint', (val) => {
            if (val === null)
                return 'send';
            return val;
        }));
        _handlerMaxlength = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlerConfirmType_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerMaxlength_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getInputElement, 'maxlength', (val) => {
            if (val === null)
                return '140';
            return val;
        })));
        _handleReadonly = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlerMaxlength_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleReadonly_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getInputElement, 'readonly', (value) => (value !== null ? '' : null))));
        #setType = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleReadonly_extraInitializers), (0,element_reactive/* .bindToAttribute */.H$)(this.#getInputElement, 'type'));
        #setInputmode = (0,element_reactive/* .bindToAttribute */.H$)(this.#getInputElement, 'inputmode');
        _handleType(value) {
            const attributeValue = value;
            // @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode
            let inputMode = 'text';
            let inputType = 'text';
            /**
             * For number / digit type, if the user is typing "2.", the raw value is expected to remain "2." rather than being altered.
             */
            if (attributeValue === 'digit') {
                inputMode = 'numeric';
            }
            else if (attributeValue === 'number') {
                inputMode = 'decimal';
            }
            else if (attributeValue === 'email') {
                inputMode = 'email';
            }
            else if (attributeValue === 'tel') {
                inputMode = 'tel';
            }
            else {
                inputType = attributeValue;
            }
            this.#setInputmode(inputMode);
            this.#setType(inputType);
        }
        _handleSpellCheck = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleSpellCheck_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getInputElement, 'spellcheck', (value) => (value === null ? 'false' : 'true')));
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handleSpellCheck_extraInitializers);
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=InputBaseAttributes.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XInput/Placeholder.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let Placeholder = (() => {
    let __handlerPlaceholder_decorators;
    let __handlerPlaceholder_initializers = [];
    let __handlerPlaceholder_extraInitializers = [];
    let __handlerPlaceholderColor_decorators;
    let __handlerPlaceholderColor_initializers = [];
    let __handlerPlaceholderColor_extraInitializers = [];
    let __handlerPlaceholderFontFamily_decorators;
    let __handlerPlaceholderFontFamily_initializers = [];
    let __handlerPlaceholderFontFamily_extraInitializers = [];
    let __handlerPlaceholderFontSize_decorators;
    let __handlerPlaceholderFontSize_initializers = [];
    let __handlerPlaceholderFontSize_extraInitializers = [];
    let __handlerPlaceholderFontWeight_decorators;
    let __handlerPlaceholderFontWeight_initializers = [];
    let __handlerPlaceholderFontWeight_extraInitializers = [];
    return class Placeholder {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handlerPlaceholder_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder', true)];
            __handlerPlaceholderColor_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder-color', true)];
            __handlerPlaceholderFontFamily_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder-font-family', true)];
            __handlerPlaceholderFontSize_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder-font-size', true)];
            __handlerPlaceholderFontWeight_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder-font-weight', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerPlaceholder_decorators, { kind: "field", name: "_handlerPlaceholder", static: false, private: false, access: { has: obj => "_handlerPlaceholder" in obj, get: obj => obj._handlerPlaceholder, set: (obj, value) => { obj._handlerPlaceholder = value; } }, metadata: _metadata }, __handlerPlaceholder_initializers, __handlerPlaceholder_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerPlaceholderColor_decorators, { kind: "field", name: "_handlerPlaceholderColor", static: false, private: false, access: { has: obj => "_handlerPlaceholderColor" in obj, get: obj => obj._handlerPlaceholderColor, set: (obj, value) => { obj._handlerPlaceholderColor = value; } }, metadata: _metadata }, __handlerPlaceholderColor_initializers, __handlerPlaceholderColor_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerPlaceholderFontFamily_decorators, { kind: "field", name: "_handlerPlaceholderFontFamily", static: false, private: false, access: { has: obj => "_handlerPlaceholderFontFamily" in obj, get: obj => obj._handlerPlaceholderFontFamily, set: (obj, value) => { obj._handlerPlaceholderFontFamily = value; } }, metadata: _metadata }, __handlerPlaceholderFontFamily_initializers, __handlerPlaceholderFontFamily_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerPlaceholderFontSize_decorators, { kind: "field", name: "_handlerPlaceholderFontSize", static: false, private: false, access: { has: obj => "_handlerPlaceholderFontSize" in obj, get: obj => obj._handlerPlaceholderFontSize, set: (obj, value) => { obj._handlerPlaceholderFontSize = value; } }, metadata: _metadata }, __handlerPlaceholderFontSize_initializers, __handlerPlaceholderFontSize_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerPlaceholderFontWeight_decorators, { kind: "field", name: "_handlerPlaceholderFontWeight", static: false, private: false, access: { has: obj => "_handlerPlaceholderFontWeight" in obj, get: obj => obj._handlerPlaceholderFontWeight, set: (obj, value) => { obj._handlerPlaceholderFontWeight = value; } }, metadata: _metadata }, __handlerPlaceholderFontWeight_initializers, __handlerPlaceholderFontWeight_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'placeholder',
            'placeholder-color',
            'placeholder-font-family',
            'placeholder-font-size',
            'placeholder-font-weight',
        ];
        #dom;
        #getInputElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#input');
        _handlerPlaceholder = (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerPlaceholder_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getInputElement, 'placeholder'));
        _handlerPlaceholderColor = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlerPlaceholder_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerPlaceholderColor_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getInputElement, '--placeholder-color', undefined, true)));
        _handlerPlaceholderFontFamily = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlerPlaceholderColor_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerPlaceholderFontFamily_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getInputElement, '--placeholder-font-family', undefined, true)));
        _handlerPlaceholderFontSize = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlerPlaceholderFontFamily_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerPlaceholderFontSize_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getInputElement, '--placeholder-font-size', undefined, true)));
        _handlerPlaceholderFontWeight = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlerPlaceholderFontSize_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerPlaceholderFontWeight_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getInputElement, '--placeholder-font-weight', undefined, true)));
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerPlaceholderFontWeight_extraInitializers);
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=Placeholder.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XInput/XInputAttribute.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

/**
 * shared by x-input and x-input-ng
 */
let XInputAttribute = (() => {
    let _instanceExtraInitializers = [];
    let __handleValue_decorators;
    let __handleDisabled_decorators;
    let __handleDisabled_initializers = [];
    let __handleDisabled_extraInitializers = [];
    let __handleAutocomplete_decorators;
    let __handleAutocomplete_initializers = [];
    let __handleAutocomplete_extraInitializers = [];
    return class XInputAttribute {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleValue_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('value', false)];
            __handleDisabled_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('disabled', true)];
            __handleAutocomplete_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('autocomplete', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleValue_decorators, { kind: "method", name: "_handleValue", static: false, private: false, access: { has: obj => "_handleValue" in obj, get: obj => obj._handleValue }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleDisabled_decorators, { kind: "field", name: "_handleDisabled", static: false, private: false, access: { has: obj => "_handleDisabled" in obj, get: obj => obj._handleDisabled, set: (obj, value) => { obj._handleDisabled = value; } }, metadata: _metadata }, __handleDisabled_initializers, __handleDisabled_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleAutocomplete_decorators, { kind: "field", name: "_handleAutocomplete", static: false, private: false, access: { has: obj => "_handleAutocomplete" in obj, get: obj => obj._handleAutocomplete, set: (obj, value) => { obj._handleAutocomplete = value; } }, metadata: _metadata }, __handleAutocomplete_initializers, __handleAutocomplete_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['value', 'disabled', 'autocomplete'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #getInputElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#input');
        _handleValue(newValue) {
            if (newValue) {
                const maxlength = parseFloat(this.#dom.getAttribute('maxlength') ?? '');
                if (!isNaN(maxlength))
                    newValue = newValue.substring(0, maxlength);
            }
            else {
                newValue = '';
            }
            const input = this.#getInputElement();
            if (input.value !== newValue) {
                input.value = newValue;
            }
        }
        _handleDisabled = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleDisabled_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getInputElement, 'disabled', (value) => (value !== null ? '' : null)));
        _handleAutocomplete = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleDisabled_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleAutocomplete_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getInputElement, 'autocomplete')));
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handleAutocomplete_extraInitializers);
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=XInputAttribute.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/common/renameEvent.js
const renameEvent = {
    'submit': 'confirm',
    'blur': 'lynxblur',
    'focus': 'lynxfocus',
};
//# sourceMappingURL=renameEvent.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XInput/XInputEvents.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XInputEvents = (() => {
    let _instanceExtraInitializers = [];
    let __handleEnableInputEvent_decorators;
    let __handleSendComposingInput_decorators;
    let __handleEnableSelectionEvent_decorators;
    return class XInputEvents {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleEnableInputEvent_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('input-filter', true), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('lynxinput')];
            __handleSendComposingInput_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('send-composing-input', true)];
            __handleEnableSelectionEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('selection')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleEnableInputEvent_decorators, { kind: "method", name: "_handleEnableInputEvent", static: false, private: false, access: { has: obj => "_handleEnableInputEvent" in obj, get: obj => obj._handleEnableInputEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleSendComposingInput_decorators, { kind: "method", name: "_handleSendComposingInput", static: false, private: false, access: { has: obj => "_handleSendComposingInput" in obj, get: obj => obj._handleSendComposingInput }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleEnableSelectionEvent_decorators, { kind: "method", name: "_handleEnableSelectionEvent", static: false, private: false, access: { has: obj => "_handleEnableSelectionEvent" in obj, get: obj => obj._handleEnableSelectionEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['send-composing-input', 'input-filter'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #sendComposingInput = false;
        #numberInputFilter = /[^0-9.]|\.(?=.*\.)/g;
        #getInputElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#input');
        #getFormElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#form');
        _handleEnableInputEvent(status) {
            const input = this.#getInputElement();
            if (status) {
                input.addEventListener('input', this.#teleportInput, { passive: true });
                input.addEventListener('compositionend', this.#teleportCompositionendInput, { passive: true });
            }
            else {
                input.removeEventListener('input', this.#teleportInput);
                input.removeEventListener('compositionend', this.#teleportCompositionendInput);
            }
        }
        _handleSendComposingInput(newVal) {
            this.#sendComposingInput = newVal !== null;
        }
        #teleportEvent = (event) => {
            const eventType = renameEvent[event.type] ?? event.type;
            this.#dom.dispatchEvent(new CustomEvent(eventType, {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    value: this.#getInputElement().value,
                },
            }));
        };
        #teleportInput = (event) => {
            const input = this.#getInputElement();
            const filterValue = this.#filterInputValue(input.value);
            const isComposing = event.isComposing;
            input.value = filterValue;
            if (isComposing && !this.#sendComposingInput)
                return;
            this.#dom.dispatchEvent(new CustomEvent('lynxinput', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    value: filterValue,
                    /** @deprecated */
                    textLength: filterValue.length,
                    /** @deprecated */
                    cursor: input.selectionStart,
                    isComposing,
                    selectionStart: input.selectionStart,
                    selectionEnd: input.selectionEnd,
                },
            }));
        };
        #teleportCompositionendInput = () => {
            const input = this.#getInputElement();
            const filterValue = this.#filterInputValue(input.value);
            input.value = filterValue;
            // if #sendComposingInput set true, #teleportInput will send detail
            if (!this.#sendComposingInput) {
                this.#dom.dispatchEvent(new CustomEvent('lynxinput', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: {
                        value: filterValue,
                        /** @deprecated */
                        textLength: filterValue.length,
                        /** @deprecated */
                        cursor: input.selectionStart,
                        isComposing: false,
                        selectionStart: input.selectionStart,
                        selectionEnd: input.selectionEnd,
                    },
                }));
            }
        };
        #filterInputValue(value) {
            let filterValue = value;
            if (this.#dom.getAttribute('type') === 'number') {
                filterValue = filterValue.replace(this.#numberInputFilter, '');
            }
            const inputFilter = this.#dom.getAttribute('input-filter');
            if (inputFilter) {
                filterValue = filterValue.replace(new RegExp(inputFilter, 'g'), '');
            }
            return filterValue;
        }
        _handleEnableSelectionEvent(status) {
            if (status) {
                this.#getInputElement().addEventListener('select', this.#selectEvent, {
                    passive: true,
                });
            }
            else {
                this.#getInputElement().removeEventListener('select', this.#selectEvent);
            }
        }
        #selectEvent = () => {
            const input = this.#getInputElement();
            this.#dom.dispatchEvent(new CustomEvent('selection', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    selectionStart: input.selectionStart,
                    selectionEnd: input.selectionEnd,
                },
            }));
        };
        #blockHtmlEvent = (event) => {
            if (event.target === this.#getInputElement()
                && typeof event.detail === 'number') {
                event.stopImmediatePropagation();
            }
        };
        constructor(dom) {
            this.#dom = dom;
            const inputElement = this.#getInputElement();
            const formElement = this.#getFormElement();
            inputElement.addEventListener('blur', this.#teleportEvent, {
                passive: true,
            });
            inputElement.addEventListener('focus', this.#teleportEvent, {
                passive: true,
            });
            formElement.addEventListener('submit', this.#teleportEvent, {
                passive: true,
            });
            // use form to stop propagation
            formElement.addEventListener('input', this.#blockHtmlEvent, {
                passive: true,
            });
        }
    };
})();

//# sourceMappingURL=XInputEvents.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XInput/XInput.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/







let XInput_XInput = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-input', [
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
            Placeholder,
            XInputAttribute,
            InputBaseAttributes,
            XInputEvents,
        ], templateXInput)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XInput = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XInput = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        #getInput = (0,element_reactive/* .genDomGetter */.Ut)(() => this.shadowRoot, '#input');
        addText(params) {
            const { text } = params;
            const input = this.#getInput();
            const selectionStart = input.selectionStart;
            if (selectionStart === null) {
                input.value = text;
            }
            else {
                const currentValue = input.value;
                input.value = currentValue.slice(0, selectionStart)
                    + text
                    + currentValue.slice(selectionStart);
            }
        }
        controlKeyBoard(params) {
            const { action } = params;
            if (action === 0 || action === 1) {
                this.focus();
            }
            else if (action === 2 || action === 3) {
                this.blur();
            }
        }
        setValue(params) {
            const input = this.#getInput();
            input.value = params.value;
            let cursorIndex;
            if ((cursorIndex = params.index)) {
                input.setSelectionRange(cursorIndex, cursorIndex);
            }
        }
        getValue() {
            const input = this.#getInput();
            return {
                value: input.value,
                selectionBegin: input.selectionStart,
                selectionEnd: input.selectionEnd,
            };
        }
        sendDelEvent(params) {
            let { action, length } = params;
            const input = this.#getInput();
            if (action === 1) {
                length = 1;
            }
            const selectionStart = input.selectionStart;
            if (selectionStart === null) {
                const currentValue = input.value;
                input.value = input.value.substring(0, currentValue.length - length);
            }
            else {
                const currentValue = input.value;
                input.value = currentValue.slice(0, selectionStart - length)
                    + currentValue.slice(selectionStart);
            }
        }
        setInputFilter(params) {
            this.#getInput().setAttribute('pattern', params.pattern);
        }
        select() {
            const input = this.#getInput();
            input.setSelectionRange(0, input.value.length);
        }
        setSelectionRange(params) {
            this.#getInput().setSelectionRange(params.selectionStart, params.selectionEnd);
        }
        focus(options) {
            this.#getInput().focus(options);
        }
        blur() {
            this.#getInput().blur();
        }
        connectedCallback() {
            const input = this.#getInput();
            if (this.getAttribute('confirm-type') === null) {
                input.setAttribute('confirm-type', 'send');
            }
            if (this.getAttribute('maxlength') === null) {
                input.setAttribute('maxlength', '140');
            }
        }
    };
    return XInput = _classThis;
})();

//# sourceMappingURL=XInput.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XInput/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/XInput
 *
 * `x-input` provides a single-line input field.
 *
 * Attributes:
 * - `value`: Input value.
 * - `disabled`: 'true' | 'false'.
 * - `readonly`: 'true' | 'false'.
 * - `placeholder`: Placeholder text.
 * - `maxlength`: Max character length (default 140).
 * - `type`: 'text' | 'number' | 'digit' | 'password' | 'tel' | 'email'.
 * - `confirm-type`: 'send' | 'search' | 'next' | 'go' | 'done'.
 * - `input-filter`: Regex pattern to filter input.
 * - `send-composing-input`: 'true' | 'false', send input event during composition.
 * - `placeholder-color`: Color of the placeholder text.
 * - `placeholder-font-weight`: Font weight of the placeholder.
 * - `placeholder-font-size`: Font size of the placeholder.
 * - `placeholder-font-family`: Font family of the placeholder.
 *
 * Events:
 * - `input` (mapped to `lynxinput`): Fired on input.
 * - `focus`: Fired on focus.
 * - `blur`: Fired on blur.
 * - `confirm` (submit): Fired on enter key.
 *
 * Methods:
 * - `setValue({ value, index })`: Sets value and cursor.
 * - `getValue()`: Returns value and selection.
 * - `blur()`: Removes focus.
 * - `focus()`: Sets focus.
 * - `setSelectionRange({ selectionStart, selectionEnd })`: Sets selection.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XOverlayNg/XOverlayAttributes.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/


let XOverlayAttributes = (() => {
    let _instanceExtraInitializers = [];
    let __handleEventsPassThrough_decorators;
    let __handleVisible_decorators;
    return class XOverlayAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleEventsPassThrough_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('events-pass-through', true)];
            __handleVisible_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('visible', false)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleEventsPassThrough_decorators, { kind: "method", name: "_handleEventsPassThrough", static: false, private: false, access: { has: obj => "_handleEventsPassThrough" in obj, get: obj => obj._handleEventsPassThrough }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleVisible_decorators, { kind: "method", name: "_handleVisible", static: false, private: false, access: { has: obj => "_handleVisible" in obj, get: obj => obj._handleVisible }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['visible', 'events-pass-through'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #useModernDialog = !!window.HTMLDialogElement;
        #visible = false;
        constructor(dom) {
            this.#dom = dom;
        }
        #getDialogDom = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#dialog');
        _handleEventsPassThrough(newVal) {
            if (newVal !== null) {
                this.#getDialogDom().addEventListener('click', this.#portalEventToMainDocument, { passive: false });
                this.#dom.addEventListener('click', this.#portalEventToMainDocument, {
                    passive: false,
                });
            }
            else {
                this.#getDialogDom().removeEventListener('click', this.#portalEventToMainDocument);
                this.#dom.removeEventListener('click', this.#portalEventToMainDocument);
            }
        }
        _handleVisible(newVal) {
            this.#visible = newVal !== null;
            if (this.#useModernDialog) {
                if (this.#visible) {
                    this.#getDialogDom().showModal();
                    this.#dom.dispatchEvent(new CustomEvent('showoverlay', commonEventInitConfiguration/* .commonComponentEventSetting */.$));
                }
                else {
                    this.#getDialogDom().close();
                    this.#dom.dispatchEvent(new CustomEvent('dismissoverlay', commonEventInitConfiguration/* .commonComponentEventSetting */.$));
                }
            }
        }
        #portalEventToMainDocument = (e) => {
            e.stopPropagation();
            const diaglogDom = this.#getDialogDom();
            if (e.target === this.#dom || e.target === diaglogDom) {
                diaglogDom.close();
                const { clientX, clientY } = e;
                let targetElement = document.elementFromPoint(clientX, clientY);
                if (targetElement?.tagName === 'LYNX-VIEW' && targetElement.shadowRoot) {
                    targetElement =
                        targetElement.shadowRoot.elementFromPoint(clientX, clientY)
                            ?? targetElement;
                }
                targetElement?.dispatchEvent(new MouseEvent('click', e));
                requestAnimationFrame(() => {
                    if (this.#visible && diaglogDom.isConnected) {
                        diaglogDom.showModal();
                    }
                });
            }
        };
        connectedCallback() {
            if (!this.#useModernDialog) {
                this.#getDialogDom().style.display = 'none';
            }
        }
    };
})();

//# sourceMappingURL=XOverlayAttributes.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XOverlayNg/XOverlayNg.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XOverlayNg_XOverlayNg = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-overlay-ng', [CommonEventsAndMethods/* .CommonEventsAndMethods */.O, XOverlayAttributes], templateXOverlayNg)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XOverlayNg = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XOverlayNg = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        get [CommonEventsAndMethods/* .layoutChangeTarget */.v]() {
            return this.shadowRoot.firstElementChild;
        }
    };
    return XOverlayNg = _classThis;
})();

//# sourceMappingURL=XOverlayNg.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XOverlayNg/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/XOverlayNg
 *
 * `x-overlay-ng` provides a modal overlay using the `<dialog>` element.
 *
 * Attributes:
 * - `visible`: 'true' | 'false', shows or hides the overlay.
 * - `events-pass-through`: 'true' | 'false', allows clicks to pass through to the underlying document.
 *
 * Events:
 * - `showoverlay`: Fired when the overlay is shown.
 * - `dismissoverlay`: Fired when the overlay is dismissed.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XRefreshView/XRefreshSubElementIntersectionObserver.js
class XRefreshIntersectionObserverEvent extends Event {
    startShowing;
    fullyShowing;
    static EventName = 'x-refresh-view-intersecting';
    constructor(startShowing, fullyShowing) {
        super(XRefreshIntersectionObserverEvent.EventName, {
            composed: false,
            cancelable: true,
            bubbles: true,
        });
        this.startShowing = startShowing;
        this.fullyShowing = fullyShowing;
    }
}
class XRefreshSubElementIntersectionObserver {
    #dom;
    static observedAttributes = [];
    #intersectionObserver;
    constructor(dom) {
        this.#dom = dom;
    }
    connectedCallback() {
        if (IntersectionObserver && !this.#intersectionObserver) {
            const parent = this.#dom.parentElement;
            if (parent) {
                this.#intersectionObserver = new IntersectionObserver((intersectionEntries) => {
                    let isStartShowing = false;
                    let isFullyShowing = false;
                    intersectionEntries.forEach((e) => {
                        isStartShowing = e.intersectionRatio > 0;
                        isFullyShowing = e.intersectionRatio > 0.9;
                    });
                    this.#dom.dispatchEvent(new XRefreshIntersectionObserverEvent(isStartShowing, isFullyShowing));
                    if (isFullyShowing) {
                        this.#dom.setAttribute('x-magnet-enable', '');
                    }
                }, {
                    root: parent,
                    threshold: [0.1, 0.9], // set to 0.9 to get better user-experience
                });
                this.#intersectionObserver.observe(this.#dom);
            }
        }
    }
    dispose() {
        if (this.#intersectionObserver) {
            this.#intersectionObserver.disconnect();
            this.#intersectionObserver = undefined;
        }
    }
}
//# sourceMappingURL=XRefreshSubElementIntersectionObserver.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XRefreshView/XRefreshFooter.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XRefreshFooter_XRefreshFooter = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-refresh-footer', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
            XRefreshSubElementIntersectionObserver,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XRefreshFooter = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XRefreshFooter = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        connectedCallback() {
            this.setAttribute('slot', 'footer');
        }
    };
    return XRefreshFooter = _classThis;
})();

//# sourceMappingURL=XRefreshFooter.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XRefreshView/XRefreshHeader.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XRefreshHeader_XRefreshHeader = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-refresh-header', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
            XRefreshSubElementIntersectionObserver,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XRefreshHeader = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XRefreshHeader = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        connectedCallback() {
            this.setAttribute('slot', 'header');
        }
    };
    return XRefreshHeader = _classThis;
})();

//# sourceMappingURL=XRefreshHeader.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XRefreshView/XRefreshViewEventsEmitter.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XRefreshViewEventsEmitter = (() => {
    let _instanceExtraInitializers = [];
    let __handleComplexEventEnableAttributes_decorators;
    let __handleXEnableHeaderOffsetEvent_decorators;
    return class XRefreshViewEventsEmitter {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleComplexEventEnableAttributes_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('headeroffset'), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('headershow'), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('footeroffset')];
            __handleXEnableHeaderOffsetEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('startrefresh'), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('headerreleased'), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('startloadmore'), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('footerreleased')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleComplexEventEnableAttributes_decorators, { kind: "method", name: "_handleComplexEventEnableAttributes", static: false, private: false, access: { has: obj => "_handleComplexEventEnableAttributes" in obj, get: obj => obj._handleComplexEventEnableAttributes }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleXEnableHeaderOffsetEvent_decorators, { kind: "method", name: "_handleXEnableHeaderOffsetEvent", static: false, private: false, access: { has: obj => "_handleXEnableHeaderOffsetEvent" in obj, get: obj => obj._handleXEnableHeaderOffsetEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        static observedAttributes = [];
        #getXRefreshHeader = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom, 'x-refresh-view > x-refresh-header:first-of-type');
        #getXRefreshFooter = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom, 'x-refresh-view > x-refresh-footer:first-of-type');
        constructor(dom) {
            this.#dom = dom;
            this.#dom.addEventListener(XRefreshIntersectionObserverEvent.EventName, this.#handleSubElementObserverEvent);
        }
        #eventSwitches = {
            headeroffset: false,
            headerreleased: false,
            startrefresh: false,
            footeroffset: false,
            headershow: false,
            footerreleased: false,
            startloadmore: false,
        };
        // complex events switches
        _handleComplexEventEnableAttributes(status, eventName) {
            this
                .#eventSwitches[eventName] = status;
            const { headeroffset, headershow, footeroffset } = this.#eventSwitches;
            if (headeroffset
                || headershow
                || footeroffset) {
                this.#enableComplexRefreshViewEvents();
            }
            else {
                this.#disableComplexRefreshViewEvents();
            }
        }
        _handleXEnableHeaderOffsetEvent(status, eventName) {
            this
                .#eventSwitches[eventName] = status;
            const { startrefresh, headerreleased, startloadmore, footerreleased } = this.#eventSwitches;
            if (headerreleased
                || footerreleased
                || startloadmore
                || startrefresh) {
                this.#enableSimpleRefreshViewEvents();
            }
            else {
                this.#disableSimpleRefreshViewEvents();
            }
        }
        /**
         * handle header/footer showing events
         */
        #headerShowing = false;
        #headerFullyShown = false;
        #footerShowing = false;
        #footerFullyShown = false;
        #handleSubElementObserverEvent = (e) => {
            e.stopPropagation();
            if (e.target.tagName === 'X-REFRESH-HEADER') {
                this.#headerShowing = e.startShowing;
                this.#headerFullyShown = e.fullyShowing;
            }
            else {
                this.#footerShowing = e.startShowing;
                this.#footerFullyShown = e.fullyShowing;
            }
        };
        /**
         * Event without dragging info;
         */
        #simpleRefreshViewEventsEnabled = false;
        #enableSimpleRefreshViewEvents() {
            if (this.#simpleRefreshViewEventsEnabled)
                return;
            this.#dom.addEventListener('touchend', this.#handleTouchEndForEvent);
            this.#simpleRefreshViewEventsEnabled = true;
        }
        #handleTouchEndForEvent = () => {
            if (this.#headerFullyShown) {
                this.#dom.dispatchEvent(new CustomEvent('headerreleased', commonEventInitConfiguration/* .commonComponentEventSetting */.$));
                this.#dom.dispatchEvent(new CustomEvent('startrefresh', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: { isManual: this.#dom._nextRefreshIsManual },
                }));
                this.#dom._nextRefreshIsManual = true;
            }
            else if ((this.#dom.getAttribute('enable-auto-loadmore') === 'true'
                && this.#footerShowing)
                || this.#footerFullyShown) {
                this.#dom.dispatchEvent(new CustomEvent('footerreleased', commonEventInitConfiguration/* .commonComponentEventSetting */.$));
                this.#dom.dispatchEvent(new CustomEvent('startloadmore', commonEventInitConfiguration/* .commonComponentEventSetting */.$));
            }
        };
        #disableSimpleRefreshViewEvents() {
            if (this.#simpleRefreshViewEventsEnabled) {
                this.#dom.removeEventListener('touchend', this.#handleTouchEndForEvent);
            }
        }
        /**
         * Event with dragging info
         */
        #dragging = false;
        #complexRefreshViewEventEnabled = false;
        #enableComplexRefreshViewEvents() {
            if (this.#complexRefreshViewEventEnabled)
                return;
            this.#dom.addEventListener('touchstart', this.#handleTouchStartForDraggingStatus);
            this.#dom.addEventListener('touchend', this.#handleTouchEndForDraggingStatus);
            this.#dom.addEventListener('touchcancel', this.#handleTouchEndForDraggingStatus);
            this.#dom
                .shadowRoot.querySelector('#container')
                .addEventListener('scroll', this.#handleScroll);
        }
        #handleTouchEndForDraggingStatus = () => {
            this.#dragging = false;
        };
        #handleTouchStartForDraggingStatus = () => {
            this.#dragging = true;
        };
        #handleScroll = () => {
            if (this.#headerShowing
                && (this.#eventSwitches.headershow || this.#eventSwitches.headeroffset)) {
                const header = this.#getXRefreshHeader();
                if (header) {
                    const height = parseFloat(getComputedStyle(header).height);
                    const scrollTop = this.#dom.shadowRoot.querySelector('#container').scrollTop;
                    this.#dom.dispatchEvent(new CustomEvent('headershow', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: {
                            isDragging: this.#dragging,
                            offsetPercent: 1 - scrollTop / height,
                        },
                    }));
                    this.#dom.dispatchEvent(new CustomEvent('headeroffset', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: {
                            isDragging: this.#dragging,
                            offsetPercent: 1 - scrollTop / height,
                        },
                    }));
                }
            }
            else if (this.#footerShowing && this.#eventSwitches.footeroffset) {
                const footer = this.#getXRefreshFooter();
                if (footer) {
                    const contentDom = this.#dom.shadowRoot.querySelector('#container');
                    const scrollTop = contentDom.scrollTop;
                    const height = parseFloat(getComputedStyle(footer).height);
                    this.#dom.dispatchEvent(new CustomEvent('footeroffset', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: {
                            isDragging: this.#dragging,
                            offsetPercent: 1 - scrollTop / height,
                        },
                    }));
                }
            }
        };
        #disableComplexRefreshViewEvents() {
            if (this.#complexRefreshViewEventEnabled) {
                this.#dom.removeEventListener('touchstart', this.#handleTouchStartForDraggingStatus);
                this.#dom.removeEventListener('touchend', this.#handleTouchEndForDraggingStatus);
                this.#dom.removeEventListener('touchcancel', this.#handleTouchEndForDraggingStatus);
                this.#dom
                    .shadowRoot.querySelector('#container')
                    .removeEventListener('scroll', this.#handleScroll);
            }
        }
        dispose() {
            this.#disableSimpleRefreshViewEvents();
            this.#disableComplexRefreshViewEvents();
        }
    };
})();

//# sourceMappingURL=XRefreshViewEventsEmitter.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XRefreshView/XRefreshView.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/






let XRefreshView_XRefreshView = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-refresh-view', [LinearContainer, CommonEventsAndMethods/* .CommonEventsAndMethods */.O, XRefreshViewEventsEmitter], templateXRefreshView)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XRefreshView = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XRefreshView = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static notToFilterFalseAttributes = new Set([
            'enable-refresh',
            'enable-loadmore',
            'enable-auto-loadmore',
        ]);
        _nextRefreshIsManual = true;
        finishRefresh() {
            this.querySelector('x-refresh-view > x-refresh-header:first-of-type')?.removeAttribute('x-magnet-enable');
        }
        finishLoadMore() {
            this.querySelector('x-refresh-view > x-refresh-footer:first-of-type')?.removeAttribute('x-magnet-enable');
        }
        autoStartRefresh() {
            const content = this.shadowRoot.querySelector('#container');
            this.querySelector('x-refresh-view > x-refresh-header:first-of-type')?.setAttribute('x-magnet-enable', '');
            this._nextRefreshIsManual = false;
            content.scroll({
                top: 0,
                behavior: 'smooth',
            });
        }
        #getOverScrollContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.shadowRoot, '#container');
        #getContentContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.shadowRoot, '#content');
        get scrollTop() {
            const outer = this.#getOverScrollContainer();
            const inner = this.#getContentContainer();
            return inner.scrollTop + inner.offsetTop - outer.scrollTop;
        }
        set scrollTop(val) {
            console.log(val);
            const outer = this.#getOverScrollContainer();
            const inner = this.#getContentContainer();
            if (val > 0) {
                inner.scrollTop = val;
            }
            else {
                outer.scrollTop = inner.offsetTop + val;
            }
        }
        get scrollHeight() {
            const inner = this.#getContentContainer();
            return inner.scrollHeight;
        }
        get [constants/* .scrollContainerDom */.l]() {
            return this;
        }
        static {
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XRefreshView = _classThis;
})();

//# sourceMappingURL=XRefreshView.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XRefreshView/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.


/**
 * @module elements/XRefreshView
 *
 * `x-refresh-view` provides pull-to-refresh and load-more functionality.
 *
 * Attributes:
 * - `enable-refresh`: 'true' | 'false'.
 * - `enable-loadmore`: 'true' | 'false'.
 * - `enable-auto-loadmore`: 'true' | 'false'.
 *
 * Events:
 * - `startrefresh`: Fired when refresh triggers. Detail: `{ isManual }`.
 * - `startloadmore`: Fired when load more triggers.
 * - `headerreleased`: Fired when header is released.
 * - `footerreleased`: Fired when footer is released.
 * - `headeroffset` / `headershow`: Fired during pull down. Detail: `{ isDragging, offsetPercent }`.
 * - `footeroffset`: Fired during pull up. Detail: `{ isDragging, offsetPercent }`.
 *
 * Methods:
 * - `finishRefresh()`: Stops refresh animation.
 * - `finishLoadMore()`: Stops load more animation.
 * - `autoStartRefresh()`: Manually triggers refresh.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XSvg/XSvg.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XSvgFeatures = (() => {
    let _instanceExtraInitializers = [];
    let __handleSrc_decorators;
    let __handleContent_decorators;
    let __enableLoadEvent_decorators;
    return class XSvgFeatures {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleSrc_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('src', true)];
            __handleContent_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('content', true)];
            __enableLoadEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('load')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleSrc_decorators, { kind: "method", name: "_handleSrc", static: false, private: false, access: { has: obj => "_handleSrc" in obj, get: obj => obj._handleSrc }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleContent_decorators, { kind: "method", name: "_handleContent", static: false, private: false, access: { has: obj => "_handleContent" in obj, get: obj => obj._handleContent }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __enableLoadEvent_decorators, { kind: "method", name: "_enableLoadEvent", static: false, private: false, access: { has: obj => "_enableLoadEvent" in obj, get: obj => obj._enableLoadEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['src', 'content'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #url = null;
        #getImg = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#img');
        _handleSrc(newVal) {
            if (!newVal) {
                this.#getImg().src = '';
            }
            else {
                this.#getImg().src = newVal;
            }
        }
        _handleContent(content) {
            this.#url && URL.revokeObjectURL(this.#url);
            if (!content) {
                this.#url = '';
                return;
            }
            const blob = new Blob([content], {
                type: 'image/svg+xml;charset=UTF-8',
            });
            const src = URL.createObjectURL(blob);
            this.#url = src;
            this.#getImg().src = src;
        }
        _enableLoadEvent(status) {
            if (status) {
                this.#getImg().addEventListener('load', this.#teleportLoadEvent, {
                    passive: true,
                });
            }
            else {
                this.#getImg().removeEventListener('load', this.#teleportLoadEvent);
            }
        }
        #teleportLoadEvent = () => {
            this.#dom.dispatchEvent(new CustomEvent('load', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    width: this.#getImg().naturalWidth,
                    height: this.#getImg().naturalHeight,
                },
            }));
        };
        constructor(dom) {
            this.#dom = dom;
        }
    };
})();

let XSvg_XSvg = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-svg', [CommonEventsAndMethods/* .CommonEventsAndMethods */.O, XSvgFeatures], templateXSvg())];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XSvg = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XSvg = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XSvg = _classThis;
})();

//# sourceMappingURL=XSvg.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XSvg/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/XSvg
 *
 * `x-svg` displays SVG content.
 *
 * Attributes:
 * - `src`: URL of the SVG file.
 * - `content`: Raw SVG content string.
 *
 * Events:
 * - `load`: Fired when SVG loads. Detail: `{ width, height }`.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XSwiper/SwiperItem.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



let SwiperItem_SwiperItem = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-swiper-item', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var SwiperItem = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SwiperItem = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return SwiperItem = _classThis;
})();

//# sourceMappingURL=SwiperItem.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XSwiper/XSwiperEvents.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XSwipeEvents = (() => {
    let _instanceExtraInitializers = [];
    let __handleEnableTransitionEvent_decorators;
    let __handleEnableTransitionEvent_initializers = [];
    let __handleEnableTransitionEvent_extraInitializers = [];
    let __enableScrollEventProcessor_decorators;
    return class XSwipeEvents {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleEnableTransitionEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('transition')];
            __enableScrollEventProcessor_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('scrollstart'), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('lynxscrollend'), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('change'), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('change-event-for-indicator')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __enableScrollEventProcessor_decorators, { kind: "method", name: "_enableScrollEventProcessor", static: false, private: false, access: { has: obj => "_enableScrollEventProcessor" in obj, get: obj => obj._enableScrollEventProcessor }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleEnableTransitionEvent_decorators, { kind: "field", name: "_handleEnableTransitionEvent", static: false, private: false, access: { has: obj => "_handleEnableTransitionEvent" in obj, get: obj => obj._handleEnableTransitionEvent, set: (obj, value) => { obj._handleEnableTransitionEvent = value; } }, metadata: _metadata }, __handleEnableTransitionEvent_initializers, __handleEnableTransitionEvent_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #current = 0;
        #pervScrollPosition = 0;
        #dragging = false;
        #debounceScrollForMockingScrollEnd;
        #scrollStarted = false;
        constructor(dom) {
            this.#dom = dom;
        }
        #getContentContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#content').bind(this);
        _handleEnableTransitionEvent = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleEnableTransitionEvent_initializers, (0,element_reactive/* .bindSwitchToEventListener */.LB)(this.#getContentContainer, 'scroll', this.#scrollEventListenerForTransition, { passive: true }));
        #handleScroll() {
            if (!constants/* .useScrollEnd */.k) {
                // debounce
                clearTimeout(this.#debounceScrollForMockingScrollEnd);
                this.#debounceScrollForMockingScrollEnd = setTimeout(() => {
                    this.#handleScrollEnd();
                }, 100);
            }
            if (!this.#scrollStarted) {
                this.#dom.dispatchEvent(new CustomEvent('scrollstart', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: {
                        current: this.#current,
                        isDragged: this.#dragging,
                    },
                }));
                this.#scrollStarted = true;
            }
            const contentContainer = this.#getContentContainer();
            const isVertical = this.#dom.isVertical;
            /* already scrolled distance */
            const currentScrollDistance = isVertical
                ? contentContainer.scrollTop
                : contentContainer.scrollLeft;
            const pageLength = isVertical
                ? contentContainer.clientHeight
                : contentContainer.clientWidth;
            const totalScrollDistance = isVertical
                ? contentContainer.scrollHeight
                : contentContainer.scrollWidth;
            if (Math.abs(this.#pervScrollPosition - currentScrollDistance)
                > pageLength / 4
                || currentScrollDistance < 10
                || Math.abs(currentScrollDistance - totalScrollDistance) <= pageLength) {
                const current = this.#dom.currentIndex;
                if (current !== this.#current) {
                    this.#dom.dispatchEvent(new CustomEvent('change', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: {
                            current,
                            isDragged: this.#dragging,
                        },
                    }));
                    this.#current = current;
                }
                this.#pervScrollPosition = currentScrollDistance;
            }
        }
        #handleScrollEnd() {
            this.#dom.dispatchEvent(new CustomEvent('lynxscrollend', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    current: this.#current,
                },
            }));
            this.#scrollStarted = false;
        }
        #handleTouchStart() {
            this.#dragging = true;
        }
        #handleTouchEndAndCancel() {
            this.#dragging = false;
        }
        #scrollEventListenerForTransition() {
            this.#dom.dispatchEvent(new CustomEvent('transition', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    dx: this.#getContentContainer().scrollLeft,
                    dy: this.#getContentContainer().scrollTop,
                },
            }));
        }
        #listeners = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleEnableTransitionEvent_extraInitializers), [
            (0,element_reactive/* .bindSwitchToEventListener */.LB)(this.#getContentContainer, 'scroll', this.#handleScroll.bind(this), { passive: true }),
            (0,element_reactive/* .bindSwitchToEventListener */.LB)(this.#getContentContainer, 'touchstart', this.#handleTouchStart.bind(this), { passive: true }),
            (0,element_reactive/* .bindSwitchToEventListener */.LB)(this.#getContentContainer, 'touchend', this.#handleTouchEndAndCancel.bind(this), { passive: true }),
            (0,element_reactive/* .bindSwitchToEventListener */.LB)(this.#getContentContainer, 'touchcancel', this.#handleTouchEndAndCancel.bind(this), { passive: true }),
            (0,element_reactive/* .bindSwitchToEventListener */.LB)(this.#getContentContainer, 'scrollend', this.#handleScrollEnd.bind(this), { passive: true }),
        ]);
        #eventSwitches = {
            scrollstart: false,
            lynxscrollend: false,
            change: false,
            'change-event-for-indicator': false,
        };
        _enableScrollEventProcessor(value, eventName) {
            this
                .#eventSwitches[eventName] = value;
            const { lynxscrollend, scrollstart, change } = this.#eventSwitches;
            const changeEventEnabled = change || lynxscrollend || scrollstart
                || this.#eventSwitches['change-event-for-indicator'];
            this.#listeners.forEach((l) => l(changeEventEnabled));
        }
        connectedCallback() {
            this.#current = parseFloat(this.#dom.getAttribute('current') ?? '0');
            const isVertical = this.#dom.isVertical;
            this.#pervScrollPosition = isVertical
                ? this.#getContentContainer().scrollTop
                : this.#getContentContainer().scrollLeft;
        }
    };
})();

//# sourceMappingURL=XSwiperEvents.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XSwiper/XSwiperAutoScroll.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let XSwiperAutoScroll = (() => {
    let _instanceExtraInitializers = [];
    let __handleCurrentChange_decorators;
    let __handleAutoplay_decorators;
    return class XSwiperAutoScroll {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleCurrentChange_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('current', false)];
            __handleAutoplay_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('interval', false), (0,element_reactive/* .registerAttributeHandler */._y)('autoplay', false)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleCurrentChange_decorators, { kind: "method", name: "_handleCurrentChange", static: false, private: false, access: { has: obj => "_handleCurrentChange" in obj, get: obj => obj._handleCurrentChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleAutoplay_decorators, { kind: "method", name: "_handleAutoplay", static: false, private: false, access: { has: obj => "_handleAutoplay" in obj, get: obj => obj._handleAutoplay }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['current', 'interval', 'autoplay'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        constructor(dom) {
            this.#dom = dom;
        }
        #scrollToNext() {
            const current = this.#dom.currentIndex;
            const count = this.#dom.childElementCount;
            if (current === count - 1) {
                const circularPlay = this.#dom.circularPlay;
                if (circularPlay) {
                    this.#dom.currentIndex = 0;
                }
            }
            else {
                this.#dom.currentIndex += 1;
            }
        }
        _handleCurrentChange(newVal) {
            const newval = Number(newVal);
            if (!Number.isNaN(newval)) {
                this.#dom.currentIndex = newval;
            }
        }
        #autoPlayTimer;
        #autoPlayTick = (() => {
            this.#scrollToNext();
        }).bind(this);
        #startAutoplay(interval) {
            this.#stopAutoplay();
            this.#autoPlayTimer = setInterval(this.#autoPlayTick, interval);
        }
        #stopAutoplay() {
            if (this.#autoPlayTimer) {
                clearInterval(this.#autoPlayTimer);
            }
        }
        _handleAutoplay() {
            const enableAutoPlay = this.#dom.getAttribute('autoplay') !== null;
            if (enableAutoPlay) {
                const interval = this.#dom.getAttribute('interval');
                let intervalValue = interval ? parseFloat(interval) : 5000;
                if (Number.isNaN(intervalValue))
                    intervalValue = 5000;
                this.#startAutoplay(intervalValue);
            }
        }
        dispose() {
            this.#stopAutoplay();
        }
    };
})();

//# sourceMappingURL=XSwiperAutoScroll.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XSwiper/XSwiperCircular.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let XSwiperCircular = (() => {
    let _instanceExtraInitializers = [];
    let __handleCircular_decorators;
    let __handleVerticalChange_decorators;
    return class XSwiperCircular {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleCircular_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('circular', false)];
            __handleVerticalChange_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('vertical', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleCircular_decorators, { kind: "method", name: "_handleCircular", static: false, private: false, access: { has: obj => "_handleCircular" in obj, get: obj => obj._handleCircular }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleVerticalChange_decorators, { kind: "method", name: "_handleVerticalChange", static: false, private: false, access: { has: obj => "_handleVerticalChange" in obj, get: obj => obj._handleVerticalChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['circular', 'vertical'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #isVertical = false;
        #pervTouchPosition;
        #currentScrollDistance = 0;
        #getContentContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#content').bind(this);
        constructor(dom) {
            this.#dom = dom;
        }
        #getCircularFirstSlot = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#circular-start').bind(this);
        #getCircularLastSlot = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#circular-end').bind(this);
        #changeEventHandler(eventLikeObject) {
            const numberOfChildren = this.#dom.childElementCount;
            if (numberOfChildren > 2) {
                const { current, isDragged, __isFirstLayout } = eventLikeObject.detail;
                if (current === 0
                    || current === numberOfChildren - 1
                    || current === 2
                    || current === numberOfChildren - 2) {
                    /**
                     * for current = 0
                     * start:[lastElement]
                     * main: [firstElement, ....]
                     * end: []
                     *
                     * for current = EOF
                     *
                     * start: []
                     * main: [..., lastElement],
                     * end: [firstElement]
                     */
                    const contentContainer = this.#getContentContainer();
                    const elementsAtStart = this.#getCircularFirstSlot().assignedElements();
                    const elementsAtEnd = this.#getCircularLastSlot().assignedElements();
                    const firstElement = this.#dom.firstElementChild;
                    const lastElement = this.#dom.lastElementChild;
                    const snapDistance = this.#dom.snapDistance;
                    let targetElement;
                    if (current === 0) {
                        elementsAtEnd.forEach((e) => e.removeAttribute('slot'));
                        lastElement.setAttribute('slot', 'circular-start');
                        targetElement = firstElement;
                    }
                    else if (current === numberOfChildren - 1) {
                        elementsAtStart.forEach((e) => e.removeAttribute('slot'));
                        firstElement.setAttribute('slot', 'circular-end');
                        targetElement = lastElement;
                    }
                    else {
                        elementsAtStart.forEach((e) => e.removeAttribute('slot'));
                        elementsAtEnd.forEach((e) => e.removeAttribute('slot'));
                        targetElement = this.#dom.children[current];
                    }
                    // make sure the center offset of first element does not change.
                    // make scrollleft + midWidth/2 = offsetLeft/2 + itemWidth - snapDistance
                    if (this.#isVertical) {
                        const midHeight = this.#dom.getAttribute('mode') === 'carousel'
                            ? (contentContainer.clientHeight * 0.8) / 2
                            : contentContainer.clientHeight / 2;
                        this.#currentScrollDistance = targetElement.offsetTop
                            + targetElement.offsetHeight / 2
                            - snapDistance
                            - midHeight;
                        contentContainer.scrollTop = this.#currentScrollDistance;
                    }
                    else {
                        const midWidth = this.#dom.getAttribute('mode') === 'carousel'
                            ? (contentContainer.clientWidth * 0.8) / 2
                            : contentContainer.clientWidth / 2;
                        this.#currentScrollDistance = targetElement.offsetLeft
                            + targetElement.offsetWidth / 2
                            - snapDistance
                            - midWidth;
                        contentContainer.scrollLeft = this.#currentScrollDistance;
                    }
                    if (!isDragged) {
                        const mode = this.#dom.getAttribute('mode');
                        // first layout, the following mode position is the leftmost, no scrollToSnapPosition is needed
                        if (__isFirstLayout
                            && (mode === null || mode === 'normal' || mode === 'carousel'
                                || mode === 'carry')) {
                            return;
                        }
                        // first layout should always scroll instant
                        this.#scrollToSnapPosition(__isFirstLayout ? 'instant' : 'smooth');
                    }
                }
            }
        }
        #scrollToSnapPosition(behavior) {
            const contentContainer = this.#getContentContainer();
            const snapDistance = this.#dom.snapDistance;
            contentContainer.scrollBy({
                top: this.#isVertical ? snapDistance : 0,
                left: this.#isVertical ? 0 : snapDistance,
                behavior: behavior ?? 'smooth',
            });
        }
        #listeners = [
            (0,element_reactive/* .bindSwitchToEventListener */.LB)(() => this.#dom, 'change', this.#changeEventHandler.bind(this), { passive: true }),
            (0,element_reactive/* .bindSwitchToEventListener */.LB)(() => this.#dom, 'touchmove', this.#handleTouchEvent.bind(this), { passive: false }),
            (0,element_reactive/* .bindSwitchToEventListener */.LB)(() => this.#dom, 'touchend', this.#handleEndEvent.bind(this), { passive: false }),
            (0,element_reactive/* .bindSwitchToEventListener */.LB)(() => this.#dom, 'touchcancel', this.#handleEndEvent.bind(this), { passive: false }),
        ];
        _handleCircular(newVal) {
            this.#listeners.forEach((l) => l(newVal != null));
            if (newVal !== null) {
                this.#changeEventHandler({
                    detail: {
                        current: this.#dom.currentIndex,
                        isDragged: false,
                        __isFirstLayout: true,
                    },
                });
            }
        }
        #handleTouchEvent(event) {
            const touch = event.touches.item(0);
            if (touch) {
                const currentTouchPosition = this.#isVertical ? touch.pageY : touch.pageX;
                if (this.#pervTouchPosition !== undefined) {
                    this.#startScrolling();
                    const scrollMoveDistance = this.#pervTouchPosition
                        - currentTouchPosition;
                    this.#currentScrollDistance += scrollMoveDistance;
                }
                this.#pervTouchPosition = currentTouchPosition;
            }
        }
        #handleEndEvent(_event) {
            this.#stopScrolling();
            this.#scrollToSnapPosition();
            this.#pervTouchPosition = undefined;
        }
        _handleVerticalChange(newVal) {
            const enable = newVal !== null;
            this.#isVertical = enable;
        }
        #scrollTimer;
        #startScrolling() {
            if (!this.#scrollTimer) {
                const contentContainer = this.#getContentContainer();
                this.#currentScrollDistance = this.#isVertical
                    ? contentContainer.scrollTop
                    : contentContainer.scrollLeft;
                this.#scrollTimer = setInterval(() => {
                    if (this.#isVertical) {
                        contentContainer.scrollTop = this.#currentScrollDistance;
                    }
                    else {
                        contentContainer.scrollLeft = this.#currentScrollDistance;
                    }
                }, 10);
            }
        }
        #stopScrolling() {
            if (this.#scrollTimer) {
                clearInterval(this.#scrollTimer);
                this.#scrollTimer = undefined;
            }
        }
        dispose() {
            this.#stopScrolling();
        }
    };
})();

//# sourceMappingURL=XSwiperCircular.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XSwiper/XSwiperIndicator.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let XSwiperIndicator = (() => {
    let __handleIndicatorColor_decorators;
    let __handleIndicatorColor_initializers = [];
    let __handleIndicatorColor_extraInitializers = [];
    let __handleIndicatorActiveColor_decorators;
    let __handleIndicatorActiveColor_initializers = [];
    let __handleIndicatorActiveColor_extraInitializers = [];
    let __handlePageMargin_decorators;
    let __handlePageMargin_initializers = [];
    let __handlePageMargin_extraInitializers = [];
    let __handlePreviousMargin_decorators;
    let __handlePreviousMargin_initializers = [];
    let __handlePreviousMargin_extraInitializers = [];
    let __handleNextMargin_decorators;
    let __handleNextMargin_initializers = [];
    let __handleNextMargin_extraInitializers = [];
    return class XSwiperIndicator {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleIndicatorColor_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('indicator-color', true)];
            __handleIndicatorActiveColor_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('indicator-active-color', true)];
            __handlePageMargin_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('page-margin', true)];
            __handlePreviousMargin_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('previous-margin', true)];
            __handleNextMargin_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('next-margin', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleIndicatorColor_decorators, { kind: "field", name: "_handleIndicatorColor", static: false, private: false, access: { has: obj => "_handleIndicatorColor" in obj, get: obj => obj._handleIndicatorColor, set: (obj, value) => { obj._handleIndicatorColor = value; } }, metadata: _metadata }, __handleIndicatorColor_initializers, __handleIndicatorColor_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleIndicatorActiveColor_decorators, { kind: "field", name: "_handleIndicatorActiveColor", static: false, private: false, access: { has: obj => "_handleIndicatorActiveColor" in obj, get: obj => obj._handleIndicatorActiveColor, set: (obj, value) => { obj._handleIndicatorActiveColor = value; } }, metadata: _metadata }, __handleIndicatorActiveColor_initializers, __handleIndicatorActiveColor_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlePageMargin_decorators, { kind: "field", name: "_handlePageMargin", static: false, private: false, access: { has: obj => "_handlePageMargin" in obj, get: obj => obj._handlePageMargin, set: (obj, value) => { obj._handlePageMargin = value; } }, metadata: _metadata }, __handlePageMargin_initializers, __handlePageMargin_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlePreviousMargin_decorators, { kind: "field", name: "_handlePreviousMargin", static: false, private: false, access: { has: obj => "_handlePreviousMargin" in obj, get: obj => obj._handlePreviousMargin, set: (obj, value) => { obj._handlePreviousMargin = value; } }, metadata: _metadata }, __handlePreviousMargin_initializers, __handlePreviousMargin_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleNextMargin_decorators, { kind: "field", name: "_handleNextMargin", static: false, private: false, access: { has: obj => "_handleNextMargin" in obj, get: obj => obj._handleNextMargin, set: (obj, value) => { obj._handleNextMargin = value; } }, metadata: _metadata }, __handleNextMargin_initializers, __handleNextMargin_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'indicator-color',
            'indicator-active-color',
            'page-margin',
            'previous-margin',
            'next-margin',
        ];
        #dom;
        #numOfChildElement = 0;
        #getIndicatorContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#indicator-container');
        #getIndicatorDynamicStyleContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#indicator-style');
        #childrenElementMutationObserver;
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handleNextMargin_extraInitializers);
            this.#dom = dom;
        }
        _handleIndicatorColor = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleIndicatorColor_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getIndicatorContainer, '--indicator-color', undefined, true));
        _handleIndicatorActiveColor = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleIndicatorColor_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleIndicatorActiveColor_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getIndicatorContainer, '--indicator-active-color', undefined, true)));
        _handlePageMargin = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleIndicatorActiveColor_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handlePageMargin_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getIndicatorContainer, '--page-margin', undefined, true)));
        _handlePreviousMargin = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlePageMargin_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handlePreviousMargin_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getIndicatorContainer, '--previous-margin', undefined, true)));
        _handleNextMargin = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlePreviousMargin_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleNextMargin_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getIndicatorContainer, '--next-margin', undefined, true)));
        #updateIndicatorDoms() {
            const currentNumber = this.#dom.childElementCount;
            if (currentNumber !== this.#numOfChildElement) {
                let nextInnerHtml = '';
                for (let ii = 0; ii < currentNumber; ii++) {
                    nextInnerHtml +=
                        `<div style="animation-timeline:--x-swiper-item-${ii};" part="indicator-item"></div>`;
                }
                this.#getIndicatorContainer().innerHTML = nextInnerHtml;
                if (currentNumber > 5) {
                    for (let ii = 0; ii < currentNumber; ii++) {
                        this.#dom.children.item(ii)?.style.setProperty('view-timeline-name', `--x-swiper-item-${ii}`);
                    }
                    this.#getIndicatorDynamicStyleContainer().innerHTML =
                        `:host { timeline-scope: ${Array.from({ length: currentNumber }, (_, ii) => `--x-swiper-item-${ii}`).join(',')} !important; }`;
                }
            }
            this.#numOfChildElement = currentNumber;
        }
        connectedCallback() {
            this.#updateIndicatorDoms();
            this.#childrenElementMutationObserver = new MutationObserver(this.#updateIndicatorDoms.bind(this));
            this.#childrenElementMutationObserver.observe(this.#dom, {
                attributes: false,
                characterData: false,
                childList: true,
                subtree: false,
            });
            if (!CSS.supports('timeline-scope', '--a, --b')) {
                this.#dom.addEventListener('change', (({ detail }) => {
                    const currentPage = detail.current;
                    const numberOfChildren = this.#dom.childElementCount;
                    const indicatorContainer = this.#getIndicatorContainer();
                    for (let ii = 0; ii < numberOfChildren; ii++) {
                        const indicator = indicatorContainer.children[ii];
                        if (indicator) {
                            if (ii === currentPage) {
                                indicator.style.setProperty('background-color', 'var(--indicator-active-color)', 'important');
                            }
                            else {
                                indicator.style.removeProperty('background-color');
                            }
                        }
                    }
                }).bind(this));
                const firstPaintIndex = parseFloat(this.#dom.getAttribute('current') ?? '0');
                this.#getIndicatorContainer().children[firstPaintIndex]?.style.setProperty('background-color', 'var(--indicator-active-color)', 'important');
            }
        }
        dispose() {
            this.#childrenElementMutationObserver?.disconnect();
            this.#childrenElementMutationObserver = undefined;
        }
    };
})();

//# sourceMappingURL=XSwiperIndicator.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XSwiper/XSwiper.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/








let XSwiper_XSwiper = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-swiper', [
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
            XSwiperIndicator,
            XSwipeEvents,
            XSwiperCircular,
            XSwiperAutoScroll,
        ], templateXSwiper)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XSwiper = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XSwiper = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static notToFilterFalseAttributes = new Set([
            'smooth-scroll',
            'indicator-dots',
        ]);
        #getContentContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.shadowRoot, '#content').bind(this);
        #getNeatestElementIndexAndDistanceToMid() {
            let current = 0;
            let minDistanceToMid = Number.MAX_SAFE_INTEGER;
            let minOffsetToMid = 0;
            if (this.childElementCount > 0) {
                const contentContainer = this.#getContentContainer();
                const isVertical = this.isVertical;
                const numberOfChildren = this.childElementCount;
                /* already scrolled distance */
                const currentScrollDistance = isVertical
                    ? contentContainer.scrollTop
                    : contentContainer.scrollLeft;
                const pageLength = isVertical
                    ? contentContainer.clientHeight
                    : contentContainer.clientWidth;
                const itemLength = isVertical
                    ? this.firstElementChild.offsetHeight
                    : this.firstElementChild.offsetWidth;
                /**
                 * ============================
                 * |                          |
                 * |                          |
                 * |    <-> scroll container  |
                 * |                          |
                 * |                          |
                 * ============================
                 *              ^___ mid
                 */
                // mode carousel width is 80% of pageLength
                const midWidth = this.getAttribute('mode') === 'carousel'
                    ? (pageLength * 0.8) / 2
                    : pageLength / 2;
                const midOffset = currentScrollDistance + midWidth;
                for (let ii = 0; ii < numberOfChildren; ii++) {
                    const swiperItem = this.children[ii];
                    if (swiperItem) {
                        const scrollOffset = (isVertical ? swiperItem.offsetTop : swiperItem.offsetLeft)
                            + itemLength / 2;
                        const offsetToMid = scrollOffset - midOffset;
                        const distanceToMid = Math.abs(offsetToMid);
                        if (distanceToMid < minDistanceToMid) {
                            current = ii;
                            minDistanceToMid = distanceToMid;
                            minOffsetToMid = offsetToMid;
                        }
                    }
                }
            }
            return {
                current,
                minDistanceToMid,
                minOffsetToMid,
            };
        }
        get currentIndex() {
            return this.#getNeatestElementIndexAndDistanceToMid().current;
        }
        set currentIndex(newval) {
            // When current is specified and current is updated in bindchange, there is no need to respond to the update of current
            if (this.currentIndex === newval) {
                return;
            }
            const smooth = this.getAttribute('smooth-scroll') === null; // smooth-scroll default true, it is set to be false
            this.#scrollToIndex(newval, smooth ? 'smooth' : 'instant');
        }
        #scrollToIndex(index, behavior) {
            const target = this.children.item(index);
            if (target) {
                const isVertical = this.isVertical;
                let offset = 0;
                // flat-coverflow mode, should scroll to the mid, 20% of left, 1/3 of width.
                if (this.getAttribute('mode') === 'flat-coverflow') {
                    if (isVertical) {
                        offset = target.offsetTop - target.offsetHeight / 3;
                    }
                    else {
                        offset = target.offsetLeft - target.offsetWidth / 3;
                    }
                }
                else {
                    if (isVertical) {
                        offset = target.offsetTop;
                    }
                    else {
                        offset = target.offsetLeft;
                    }
                }
                this.#getContentContainer().scrollTo({
                    left: isVertical ? 0 : offset,
                    top: isVertical ? offset : 0,
                    behavior,
                });
            }
        }
        get snapDistance() {
            return this.#getNeatestElementIndexAndDistanceToMid().minOffsetToMid;
        }
        get isVertical() {
            return this.getAttribute('vertical') !== null;
        }
        get circularPlay() {
            return this.getAttribute('circular') !== null;
        }
        scrollTo(...args) {
            // Check if the first argument has an index property (custom usage)
            if (args.length > 0 && typeof args[0] === 'object' && args[0] !== null
                && 'index' in args[0]) {
                const { index, smooth = true } = args[0];
                if (typeof index === 'number') {
                    this.#scrollToIndex(index, smooth ? 'smooth' : 'instant');
                    return;
                }
            }
            // Fall back to standard HTML scrollTo behavior
            super.scrollTo(...args);
        }
        connectedCallback() {
            const current = this.getAttribute('current');
            if (current !== null) {
                // first layout should always scroll instant
                this.#scrollToIndex(Number(current), 'instant');
            }
        }
        get [constants/* .scrollContainerDom */.l]() {
            return this;
        }
        static {
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XSwiper = _classThis;
})();

//# sourceMappingURL=XSwiper.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XSwiper/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * @module elements/XSwiper
 *
 * `x-swiper` provides a swipeable container for items.
 *
 * Attributes:
 * - `mode`: 'normal' | 'carousel' | 'flat-coverflow'.
 * - `vertical`: 'true' | 'false', vertical scrolling.
 * - `circular`: 'true' | 'false', circular scrolling.
 * - `current`: Current index.
 * - `autoplay`: 'true' | 'false'.
 * - `interval`: Autoplay interval in ms (default 5000).
 * - `duration`: Animation duration.
 * - `smooth-scroll`: 'true' | 'false'.
 * - `indicator-dots`: 'true' | 'false', show indicator dots.
 * - `indicator-color`: Color of inactive indicator dots.
 * - `indicator-active-color`: Color of active indicator dot.
 *
 * Events:
 * - `change`: Fired when current index changes. Detail: `{ current, isDragged }`.
 * - `scrollstart`: Fired when scrolling starts.
 * - `scrollend` (mapped to `lynxscrollend`): Fired when scrolling ends.
 * - `transition`: Fired during scroll transition (if enabled). Detail: `{ dx, dy }`.
 *
 * Methods:
 * - `scrollTo({ index, smooth })`: Scrolls to index.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XText/InlineImage.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



let InlineImageAttributes = (() => {
    let _instanceExtraInitializers = [];
    let __handleSrc_decorators;
    return class InlineImageAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleSrc_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('src', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleSrc_decorators, { kind: "method", name: "_handleSrc", static: false, private: false, access: { has: obj => "_handleSrc" in obj, get: obj => obj._handleSrc }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['src'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        constructor(dom) {
            this.#dom = dom;
        }
        #getImage = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#img');
        _handleSrc(newVal) {
            if (newVal)
                this.#getImage().setAttribute('src', newVal);
            else
                this.#getImage().removeAttribute('src');
        }
    };
})();

/**
 * @deprecated you can use `x-image` instead in `x-text`.
 */
let InlineImage_InlineImage = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('inline-image', [InlineImageAttributes, ImageEvents], templateInlineImage({}))];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var InlineImage = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            InlineImage = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return InlineImage = _classThis;
})();

//# sourceMappingURL=InlineImage.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XText/XTextSelectionEvents.js

/*
// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/


const emptySelection = () => ({
    start: -1,
    end: -1,
    direction: 'forward',
});
/**
 * Converts a selection boundary to an offset in the target's text. Using the
 * range text length provides one offset space across nested text nodes.
 */
const getTextOffset = (root, node, offset) => {
    if (!node || !root.contains(node))
        return null;
    const range = root.ownerDocument.createRange();
    range.selectNodeContents(root);
    try {
        range.setEnd(node, offset);
    }
    catch {
        return null;
    }
    return range.toString().length;
};
/**
 * Returns offsets relative to the target text. A -1 offset means the selection
 * is collapsed, unavailable, or outside the target.
 */
const getSelectionDetail = (dom) => {
    const selection = dom.ownerDocument.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return emptySelection();
    }
    const anchor = getTextOffset(dom, selection.anchorNode, selection.anchorOffset);
    const focus = getTextOffset(dom, selection.focusNode, selection.focusOffset);
    if (anchor !== null && focus !== null && anchor !== focus) {
        return {
            start: Math.min(anchor, focus),
            end: Math.max(anchor, focus),
            direction: anchor < focus ? 'forward' : 'backward',
        };
    }
    // WebKit retargets selection endpoints outside a shadow tree. Ask for the
    // composed range to recover the actual text nodes in that case.
    const shadowRoots = [];
    let root = dom.getRootNode();
    while (root instanceof ShadowRoot) {
        shadowRoots.push(root);
        root = root.host.getRootNode();
    }
    const [range] = selection.getComposedRanges?.({ shadowRoots }) ?? [];
    const start = range
        ? getTextOffset(dom, range.startContainer, range.startOffset)
        : null;
    const end = range
        ? getTextOffset(dom, range.endContainer, range.endOffset)
        : null;
    if (start === null || end === null || start === end)
        return emptySelection();
    return {
        start,
        end,
        direction: selection.direction === 'backward' ? 'backward' : 'forward',
    };
};
let XTextSelectionEvents = (() => {
    let _instanceExtraInitializers = [];
    let __handleEnableSelectionChangeEvent_decorators;
    return class XTextSelectionEvents {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleEnableSelectionChangeEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('selectionchange')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleEnableSelectionChangeEvent_decorators, { kind: "method", name: "_handleEnableSelectionChangeEvent", static: false, private: false, access: { has: obj => "_handleEnableSelectionChangeEvent" in obj, get: obj => obj._handleEnableSelectionChangeEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #enabled = false;
        #connected = false;
        #attachedDocument;
        #lastSelectionSignature;
        constructor(dom) {
            this.#dom = dom;
        }
        connectedCallback() {
            this.#connected = true;
            this.#updateSelectionChangeListener();
        }
        dispose() {
            this.#connected = false;
            this.#updateSelectionChangeListener();
        }
        _handleEnableSelectionChangeEvent(status) {
            this.#enabled = status;
            if (!status)
                this.#lastSelectionSignature = undefined;
            this.#updateSelectionChangeListener();
        }
        #updateSelectionChangeListener() {
            const document = this.#dom.ownerDocument;
            const shouldAttach = this.#enabled && this.#connected;
            if (shouldAttach && this.#attachedDocument === document)
                return;
            if (!shouldAttach && !this.#attachedDocument)
                return;
            this.#attachedDocument?.removeEventListener('selectionchange', this.#handleSelectionChange);
            if (shouldAttach) {
                document.addEventListener('selectionchange', this.#handleSelectionChange);
            }
            this.#attachedDocument = shouldAttach ? document : undefined;
        }
        #handleSelectionChange = () => {
            const detail = getSelectionDetail(this.#dom);
            const signature = `${detail.start}:${detail.end}:${detail.direction}`;
            if (signature === this.#lastSelectionSignature
                || (detail.start === -1 && this.#lastSelectionSignature === undefined)) {
                return;
            }
            this.#lastSelectionSignature = signature;
            this.#dom.dispatchEvent(new CustomEvent('selectionchange', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail,
            }));
        };
    };
})();

//# sourceMappingURL=XTextSelectionEvents.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XText/InlineText.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/


/**
 * @deprecated Use x-text instead of inline-text.
 */
let InlineText_InlineText = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('inline-text', [XTextSelectionEvents])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var InlineText = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            InlineText = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return InlineText = _classThis;
})();

//# sourceMappingURL=InlineText.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XText/InlineTruncation.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let InlineTruncation_InlineTruncation = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('inline-truncation', [])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var InlineTruncation = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            InlineTruncation = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static XEnableCustomTruncation = 'x-text-custom-overflow';
        connectedCallback() {
            if (!CSS.supports('selector(:has(>inline-truncation))')) {
                if (this.parentElement?.tagName === 'X-TEXT'
                    && !this.matches('inline-truncation ~ inline-truncation')) {
                    this.parentElement.setAttribute(InlineTruncation.XEnableCustomTruncation, '');
                }
            }
            this.setAttribute('slot', 'inline-truncation');
        }
        disconnectedCallback() {
            this.parentElement?.removeAttribute(InlineTruncation.XEnableCustomTruncation);
        }
        static {
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return InlineTruncation = _classThis;
})();

//# sourceMappingURL=InlineTruncation.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XText/RawText.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let RawTextAttributes = (() => {
    let _instanceExtraInitializers = [];
    let __handleText_decorators;
    return class RawTextAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleText_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('text', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleText_decorators, { kind: "method", name: "_handleText", static: false, private: false, access: { has: obj => "_handleText" in obj, get: obj => obj._handleText }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['text'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #text;
        constructor(currentElement) {
            this.#dom = currentElement;
        }
        _handleText(newVal) {
            this.#text?.remove();
            if (newVal) {
                this.#text = new Text(newVal);
                this.#dom.append(this.#text);
            }
        }
    };
})();

let RawText_RawText = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('raw-text', [RawTextAttributes])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var RawText = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RawText = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return RawText = _classThis;
})();

//# sourceMappingURL=RawText.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XText/XTextTruncation.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const getSiblingIndex = (node) => {
    let index = 0;
    let previousNode = node.previousSibling;
    while (previousNode) {
        index++;
        previousNode = previousNode.previousSibling;
    }
    return index;
};
const getRangePosition = (nodeInfo, offsetInNode) => {
    const { node } = nodeInfo;
    if (node.nodeType === Node.TEXT_NODE) {
        return {
            container: node,
            offset: clamp(offsetInNode, 0, node.data.length),
        };
    }
    // Elements are one virtual character, while DOM Range offsets address child
    // indexes. Use the parent's before/after-element boundary instead.
    const elementOffset = offsetInNode > 0 ? 1 : 0;
    const parentNode = node.parentNode;
    if (!parentNode) {
        return {
            container: node,
            offset: clamp(elementOffset, 0, node.childNodes.length),
        };
    }
    return {
        container: parentNode,
        offset: getSiblingIndex(node) + elementOffset,
    };
};
let XTextTruncation_XTextTruncation = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let __handleAttributeChange_decorators;
    let __handleEnableLayoutEvent_decorators;
    return class XTextTruncation {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleAttributeChange_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('text-maxlength', true), (0,element_reactive/* .registerAttributeHandler */._y)('text-maxline', true), (0,element_reactive/* .registerAttributeHandler */._y)('tail-color-convert', true)];
            __handleEnableLayoutEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('layout')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleAttributeChange_decorators, { kind: "method", name: "_handleAttributeChange", static: false, private: false, access: { has: obj => "_handleAttributeChange" in obj, get: obj => obj._handleAttributeChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleEnableLayoutEvent_decorators, { kind: "method", name: "_handleEnableLayoutEvent", static: false, private: false, access: { has: obj => "_handleEnableLayoutEvent" in obj, get: obj => obj._handleEnableLayoutEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static exceedMathLengthAttribute = 'x-text-clipped';
        static showInlineTruncation = 'x-show-inline-truncation';
        static observedAttributes = [
            'text-maxlength',
            'text-maxline',
            'tail-color-convert',
        ];
        #scheduledTextLayout = ((0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers), false);
        #componentConnected = false;
        #originalTextMap = new Map();
        #mutationObserver;
        #resizeObserver;
        #inplaceEllipsisNode;
        #textMeasure;
        #firstResizeObserverCallback = false;
        // attribute status
        #maxLength = NaN;
        #maxLine = NaN;
        #tailColorConvert = true;
        #enableLayoutEvent = false;
        get #ellipsisInPlace() {
            return !this.#hasInlineTruncation && !this.#tailColorConvert;
        }
        get #hasInlineTruncation() {
            return !!this.#findValidInlineTruncation();
        }
        #findValidInlineTruncation() {
            return this.#dom.querySelector(':scope > inline-truncation');
        }
        get #doExpensiveLineLayoutCalculation() {
            return (!isNaN(this.#maxLine)
                && (this.#hasInlineTruncation || !this.#tailColorConvert));
        }
        #dom;
        constructor(dom) {
            this.#dom = dom;
        }
        #getInnerBox = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#inner-box');
        #updateOriginalText(mutationRecords) {
            mutationRecords.forEach((oneRecord) => {
                oneRecord.removedNodes.forEach((node) => {
                    this.#originalTextMap.delete(node);
                });
                if (oneRecord.type === 'characterData'
                    && this.#originalTextMap.get(oneRecord.target) !== undefined) {
                    this.#originalTextMap.set(oneRecord.target, oneRecord.target.data);
                }
            });
        }
        #revertTruncatedTextNodes() {
            for (const [node, originalText] of this.#originalTextMap) {
                if (node.nodeType === Node.TEXT_NODE) {
                    if (originalText !== undefined) {
                        node.data = originalText;
                    }
                }
                else {
                    node.removeAttribute(XTextTruncation.exceedMathLengthAttribute);
                }
            }
            this.#dom.removeAttribute(XTextTruncation.exceedMathLengthAttribute);
            this.#dom.removeAttribute(XTextTruncation.showInlineTruncation);
        }
        #getAllSiblings(targetNode) {
            const siblingNodes = [];
            let targetNodeSibling = targetNode;
            while ((targetNodeSibling = targetNodeSibling.nextSibling)) {
                if (targetNodeSibling.nodeType === Node.TEXT_NODE
                    || targetNodeSibling.nodeType === Node.ELEMENT_NODE) {
                    siblingNodes.push(targetNodeSibling);
                }
            }
            return siblingNodes;
        }
        #layoutText() {
            if (!this.#componentConnected || this.#dom.matches('x-text>x-text'))
                return;
            if (this.#scheduledTextLayout)
                return;
            this.#scheduledTextLayout = true;
            (0,element_reactive/* .boostedQueueMicrotask */.JS)(async () => {
                await this.#layoutTextInner();
                this.#startObservers();
                this.#scheduledTextLayout = false;
            });
        }
        async #layoutTextInner() {
            this.#inplaceEllipsisNode?.parentElement?.removeChild(this.#inplaceEllipsisNode);
            this.#revertTruncatedTextNodes();
            if (!this.#doExpensiveLineLayoutCalculation && isNaN(this.#maxLength)) {
                return;
            }
            await document.fonts.ready;
            const parentBondingRect = this.#getInnerBox().getBoundingClientRect();
            this.#textMeasure = new TextRenderingMeasureTool(this.#dom, parentBondingRect);
            const measure = this.#textMeasure;
            const maxLengthMeasureResult = !isNaN(this.#maxLength)
                ? measure.getNodeInfoByCharIndex(this.#maxLength)
                : undefined;
            const maxLengthEndAt = maxLengthMeasureResult ? this.#maxLength : Infinity;
            const maxLineMeasureResult = this.#doExpensiveLineLayoutCalculation
                ? measure.getLineInfo(this.#maxLine)
                    ? measure.getLineInfo(this.#maxLine - 1)
                    : undefined
                : undefined;
            let maxLineEndAt = Infinity;
            let ellipsisLength = 3;
            if (maxLineMeasureResult) {
                const { start, end } = maxLineMeasureResult;
                const currentLineText = end - start;
                if (this.#hasInlineTruncation) {
                    this.#dom.setAttribute(XTextTruncation.showInlineTruncation, '');
                    const inlineTruncation = this.#findValidInlineTruncation();
                    const inlineTruncationBoundingRect = inlineTruncation
                        .getBoundingClientRect();
                    const parentWidth = parentBondingRect.width;
                    const inlineTruncationWidth = inlineTruncationBoundingRect.width;
                    if (parentWidth > inlineTruncationWidth) {
                        maxLineEndAt = end - 1;
                        const range = document.createRange();
                        let currentNodeInfo = measure
                            .getNodeInfoByCharIndex(maxLineEndAt);
                        const endCharInNodeIndex = end - currentNodeInfo.start;
                        const initialRangePosition = getRangePosition(currentNodeInfo, endCharInNodeIndex);
                        range.setEnd(initialRangePosition.container, initialRangePosition.offset);
                        range.setStart(initialRangePosition.container, initialRangePosition.offset);
                        while (range.getBoundingClientRect().width < inlineTruncationWidth
                            && (maxLineEndAt -= 1)
                            && (currentNodeInfo = measure.getNodeInfoByCharIndex(maxLineEndAt))) {
                            const rangePosition = getRangePosition(currentNodeInfo, maxLineEndAt - currentNodeInfo.start);
                            range.setStart(rangePosition.container, rangePosition.offset);
                        }
                    }
                    else {
                        maxLineEndAt = start;
                        this.#dom.removeAttribute(XTextTruncation.showInlineTruncation);
                    }
                }
                else {
                    if (currentLineText < 3) {
                        ellipsisLength = currentLineText;
                        maxLineEndAt = start;
                    }
                    else {
                        maxLineEndAt = end - 3;
                    }
                }
            }
            const truncateAt = Math.min(maxLengthEndAt, maxLineEndAt);
            if (truncateAt < Infinity) {
                const targetNodeInfo = measure.getNodeInfoByCharIndex(truncateAt);
                if (targetNodeInfo) {
                    const truncatePositionInNode = truncateAt - targetNodeInfo.start;
                    const targetNode = targetNodeInfo.node;
                    let toBeHideNodes = [];
                    if (targetNode.nodeType === Node.TEXT_NODE) {
                        const textNode = targetNode;
                        this.#originalTextMap.set(targetNode, textNode.data);
                        textNode.data = textNode.data.substring(0, truncatePositionInNode);
                    }
                    else {
                        toBeHideNodes.push(targetNode);
                    }
                    toBeHideNodes = toBeHideNodes.concat(this.#getAllSiblings(targetNode));
                    let targetNodeParentElement = targetNode.parentElement;
                    while (targetNodeParentElement !== this.#dom) {
                        toBeHideNodes = toBeHideNodes.concat(this.#getAllSiblings(targetNodeParentElement));
                        targetNodeParentElement = targetNodeParentElement.parentElement;
                    }
                    toBeHideNodes.forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE
                            && node.data.length !== 0) {
                            this.#originalTextMap.set(node, node.data);
                            node.data = '';
                        }
                        else if (node.nodeType === Node.ELEMENT_NODE) {
                            this.#originalTextMap.set(node, '');
                            node.setAttribute(XTextTruncation.exceedMathLengthAttribute, '');
                        }
                    });
                    if (this.#ellipsisInPlace) {
                        const closestParent = (truncatePositionInNode === 0
                            ? measure.nodelist.at(targetNodeInfo.nodeIndex - 1)
                                ?.parentElement
                            : targetNode.parentElement) ?? targetNode.parentElement;
                        this.#inplaceEllipsisNode = new Text(new Array(ellipsisLength).fill('.').join(''));
                        closestParent.append(this.#inplaceEllipsisNode);
                    }
                    this.#dom.setAttribute(XTextTruncation.exceedMathLengthAttribute, '');
                }
                this.#sendLayoutEvent(truncateAt);
            }
        }
        #handleMutationObserver = (records) => {
            this.#updateOriginalText(records);
            this.#layoutText();
        };
        #handleRezieObserver = () => {
            if (this.#firstResizeObserverCallback) {
                this.#firstResizeObserverCallback = false;
                return;
            }
            this.#layoutText();
        };
        #startObservers() {
            if (!this.#componentConnected) {
                return;
            }
            if (this.#maxLength || this.#maxLine) {
                if (!this.#mutationObserver) {
                    this.#mutationObserver = new MutationObserver(this.#handleMutationObserver);
                    this.#mutationObserver.observe(this.#dom, {
                        subtree: true,
                        childList: true,
                        attributes: false,
                        characterData: true,
                    });
                }
            }
            if (this.#maxLine) {
                if (!this.#resizeObserver) {
                    this.#resizeObserver = new ResizeObserver(this.#handleRezieObserver);
                    this.#firstResizeObserverCallback = true;
                    this.#resizeObserver.observe(this.#getInnerBox(), {
                        box: 'content-box',
                    });
                }
            }
        }
        #stopObservers() {
            this.#mutationObserver?.disconnect();
            this.#mutationObserver = undefined;
            this.#resizeObserver?.disconnect();
            this.#resizeObserver = undefined;
        }
        _handleAttributeChange() {
            this.#maxLength = parseFloat(this.#dom.getAttribute('text-maxlength') ?? '');
            this.#maxLine = parseFloat(this.#dom.getAttribute('text-maxline') ?? '');
            this.#tailColorConvert =
                this.#dom.getAttribute('tail-color-convert') !== 'false';
            if (this.#maxLength < 0)
                this.#maxLength = NaN;
            if (this.#maxLine < 1)
                this.#maxLine = NaN;
            if (!isNaN(this.#maxLine)) {
                this.#getInnerBox().style.webkitLineClamp = this.#maxLine.toString();
            }
            else {
                this.#getInnerBox().style.removeProperty('-webkit-line-clamp');
            }
            this.#layoutText();
        }
        _handleEnableLayoutEvent(status) {
            this.#enableLayoutEvent = status;
        }
        #sendLayoutEvent(truncateAt) {
            if (!this.#enableLayoutEvent)
                return;
            const detail = new Proxy(this, {
                get(that, property) {
                    if (property === 'lineCount') {
                        if (!that.#textMeasure) {
                            that.#textMeasure = new TextRenderingMeasureTool(that.#dom, that.#dom.getBoundingClientRect());
                        }
                        return that.#textMeasure.getLineCount();
                    }
                    else if (property === 'lines') {
                        // event.detail.lines
                        return new Proxy(that, {
                            get(that, lineIndex) {
                                // event.detail.lines[num]
                                const lineIndexNum = parseFloat(lineIndex.toString());
                                if (!isNaN(lineIndexNum)) {
                                    if (!that.#textMeasure) {
                                        that.#textMeasure = new TextRenderingMeasureTool(that.#dom, that.#dom.getBoundingClientRect());
                                    }
                                    const lineInfo = that.#textMeasure.getLineInfo(lineIndexNum);
                                    if (lineInfo) {
                                        return new Proxy(lineInfo, {
                                            get(lineInfo, property) {
                                                // event.detail.lines[num].(<start>, <end>, <ellipsisCount>)
                                                switch (property) {
                                                    case 'start':
                                                    case 'end':
                                                        return lineInfo[property];
                                                    case 'ellipsisCount':
                                                        if (truncateAt !== undefined
                                                            && truncateAt >= lineInfo.start
                                                            && truncateAt < lineInfo.end) {
                                                            return lineInfo.end - truncateAt;
                                                        }
                                                        return 0;
                                                }
                                            },
                                        });
                                    }
                                }
                            },
                        });
                    }
                },
            });
            this.#dom.dispatchEvent(new CustomEvent('layout', { ...commonEventInitConfiguration/* .commonComponentEventSetting */.$, detail }));
        }
        dispose() {
            this.#stopObservers();
        }
        connectedCallback() {
            this.#componentConnected = true;
            this._handleEnableLayoutEvent(this.#enableLayoutEvent);
            this._handleAttributeChange();
            (0,element_reactive/* .boostedQueueMicrotask */.JS)(() => {
                this.#sendLayoutEvent();
            });
        }
    };
})();

class TextRenderingMeasureTool {
    #cachedLineInfo = [{ start: 0 }];
    #lazyLinesInfo = [];
    #lazyNodesInfo = [];
    #dom;
    #domRect;
    nodelist;
    constructor(containerDom, parentRect) {
        this.#dom = containerDom;
        this.nodelist = new LazyNodesList(this.#dom);
        this.#domRect = parentRect;
    }
    #findWrapIndexInTargetTextNode(lastRectInfo) {
        if (lastRectInfo.node.nodeType === Node.TEXT_NODE) {
            const { rect, rectIndex } = lastRectInfo;
            const textNode = lastRectInfo.node;
            const measurementRange = document.createRange();
            measurementRange.selectNode(textNode);
            for (let charIndex = 0; charIndex < textNode.data.length; charIndex++) {
                measurementRange.setEnd(textNode, charIndex);
                const targetRect = measurementRange.getClientRects().item(rectIndex);
                if (targetRect && targetRect.right === rect.right) {
                    return charIndex;
                }
            }
            return textNode.data.length;
        }
        else {
            return 1;
        }
    }
    #genLinesInfoUntil(lineIndex) {
        if (this.#lazyLinesInfo[lineIndex])
            return;
        const { left: containerLeft } = this.#domRect;
        const lastLineInfo = this.#lazyLinesInfo[this.#lazyLinesInfo.length - 1];
        const lastNodeInfo = lastLineInfo?.[lastLineInfo.length - 1];
        const nextNodeIndex = lastNodeInfo?.nodeIndex
            ? lastNodeInfo?.nodeIndex + 1
            : 0;
        for (let nodeIndex = nextNodeIndex, currentNodeInfo; (currentNodeInfo = this.#getNodeInfoByIndex(nodeIndex))
            && lineIndex >= this.#lazyLinesInfo.length; nodeIndex++) {
            const { node } = currentNodeInfo;
            let rects;
            if (node.nodeType === Node.ELEMENT_NODE) {
                rects = node.getClientRects();
            }
            else {
                const range = document.createRange();
                range.selectNode(node);
                rects = range.getClientRects();
            }
            if (rects.length > 0) {
                const currentLine = this
                    .#lazyLinesInfo[this.#lazyLinesInfo.length - 1];
                const firstRect = rects[0];
                if (Math.abs(firstRect.left - containerLeft) < 0.2 || !currentLine) {
                    this.#lazyLinesInfo.push([
                        { ...currentNodeInfo, rect: firstRect, rectIndex: 0 },
                    ]);
                }
                else {
                    currentLine.push({
                        ...currentNodeInfo,
                        rect: firstRect,
                        rectIndex: 0,
                    });
                }
                if (rects.length > 1) {
                    for (let ii = 1; ii < rects.length; ii++) {
                        const rect = rects[ii];
                        if (rect.left !== firstRect.left
                            || rect.bottom !== firstRect.bottom) {
                            if (Math.abs(rect.left - containerLeft) < 0.2) {
                                // is a new line
                                this.#lazyLinesInfo.push([
                                    { ...currentNodeInfo, rect, rectIndex: ii },
                                ]);
                            }
                            else {
                                const currentLine = this
                                    .#lazyLinesInfo[this.#lazyLinesInfo.length - 1];
                                currentLine.push({
                                    ...currentNodeInfo,
                                    rect,
                                    rectIndex: ii,
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * **NOTE: this is expensive.**
     * @returns
     */
    getLineCount() {
        this.#genLinesInfoUntil(Infinity);
        return this.#lazyLinesInfo.length;
    }
    getLineInfo(lineIndex) {
        this.#genLinesInfoUntil(lineIndex + 1);
        if (lineIndex < this.#lazyLinesInfo.length) {
            // get caught info first
            const pervLineInfo = lineIndex > 0
                ? this.#cachedLineInfo[lineIndex - 1] ?? {}
                : undefined;
            const currentLineInfo = this.#cachedLineInfo[lineIndex] ?? {};
            const nextLineInfo = lineIndex < this.#lazyLinesInfo.length - 1
                ? this.#cachedLineInfo[lineIndex + 1] ?? {}
                : undefined;
            if (currentLineInfo.start === undefined) {
                // can't be firstline since the first line's start is already initialized at the constructor.
                const pervLineRects = this.#lazyLinesInfo[lineIndex - 1];
                const pervLineLastRectInfo = pervLineRects[pervLineRects.length - 1];
                const wrapPosition = this.#findWrapIndexInTargetTextNode(pervLineLastRectInfo);
                const end = pervLineLastRectInfo.start + wrapPosition;
                if (pervLineInfo)
                    pervLineInfo.end = end;
                currentLineInfo.start = end + 1;
            }
            if (currentLineInfo.end === undefined) {
                const currentLineRects = this.#lazyLinesInfo[lineIndex];
                const currentLineLastRectInfo = currentLineRects[currentLineRects.length - 1];
                if (lineIndex === this.#lazyLinesInfo.length - 1) {
                    // the last line
                    const currentNodeLength = currentLineLastRectInfo.node.nodeType === Node.TEXT_NODE
                        ? currentLineLastRectInfo.node.data.length
                        : 1;
                    currentLineInfo.end = currentLineLastRectInfo.start
                        + currentNodeLength;
                }
                else {
                    const wrapPosition = this.#findWrapIndexInTargetTextNode(currentLineLastRectInfo);
                    currentLineInfo.end = currentLineLastRectInfo.start + wrapPosition;
                    nextLineInfo.start = currentLineInfo.end + 1;
                }
            }
            return currentLineInfo;
        }
    }
    #getNodeInfoByIndex(nodeIndex) {
        const lastIndex = this.#lazyNodesInfo.length - 1;
        const lastNode = this.#lazyNodesInfo[lastIndex];
        let currentLength = lastNode ? lastNode.start + lastNode.length : 0;
        for (let currentIndex = this.#lazyNodesInfo.length, nextNode; (nextNode = this.nodelist.at(currentIndex))
            && nodeIndex >= this.#lazyNodesInfo.length; currentIndex++) {
            const nodeLength = nextNode.nodeType === Node.ELEMENT_NODE
                ? 1
                : nextNode.data.length;
            const currentNodeInfo = {
                node: nextNode,
                length: nodeLength,
                start: currentLength,
                nodeIndex: currentIndex,
            };
            this.#lazyNodesInfo.push(currentNodeInfo);
        }
        return this.#lazyNodesInfo[nodeIndex];
    }
    getNodeInfoByCharIndex(searchTarget) {
        // binary search
        let left = 0;
        let right = this.#lazyNodesInfo.length - 1;
        let result;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const midNodeInfo = this.#lazyNodesInfo[mid];
            const midNode = midNodeInfo.node;
            const mindNodeLength = midNode.nodeType === Node.TEXT_NODE
                ? midNode.data.length
                : 1;
            const midNodeStart = midNodeInfo.start;
            // check searchTarget is placed inside midRange
            if (searchTarget >= midNodeStart
                && searchTarget < midNodeStart + mindNodeLength) {
                result = midNodeInfo;
                break;
            }
            else if (searchTarget < midNodeStart) {
                right = mid - 1;
            }
            else {
                left = mid + 1;
            }
        }
        if (result) {
            return result;
        }
        else {
            for (let currentIndex = this.#lazyNodesInfo.length, nextNode; (nextNode = this.#getNodeInfoByIndex(currentIndex)); currentIndex++) {
                if (searchTarget < nextNode.start + nextNode.length) {
                    return nextNode;
                }
            }
        }
        return undefined;
    }
}
class LazyNodesList {
    #nodeCache = [];
    #treeWalker;
    constructor(dom) {
        this.#treeWalker = document.createTreeWalker(dom, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, (node) => {
            for (let element = node.parentElement; element && element !== dom; element = element.parentElement) {
                if (element.tagName === 'X-VIEW') {
                    // x-view is measured as a single inline box, so skip its subtree.
                    return NodeFilter.FILTER_REJECT;
                }
            }
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName;
                if (tagName === 'X-TEXT'
                    || tagName === 'INLINE-TEXT'
                    || tagName === 'RAW-TEXT'
                    || tagName === 'LYNX-WRAPPER') {
                    return NodeFilter.FILTER_SKIP;
                }
            }
            return NodeFilter.FILTER_ACCEPT;
        });
    }
    at(index) {
        if (this.#nodeCache[index]) {
            return this.#nodeCache[index];
        }
        this.#fillCacheTo(index);
        return this.#nodeCache[index];
    }
    #fillCacheTo(index) {
        let currentNode = null;
        while (index >= this.#nodeCache.length
            && (currentNode = this.#treeWalker.nextNode())) {
            this.#nodeCache.push(currentNode);
            break;
        }
    }
}
// function addClientRectsOverlay(rect: DOMRect, color: string = 'red', size: string = '1px') {
//   /* Absolutely position a div over each client rect so that its border width
//      is the same as the rectangle's width.
//      Note: the overlays will be out of place if the user resizes or zooms. */
//   const tableRectDiv = document.createElement("div");
//   tableRectDiv.style.position = "absolute";
//   tableRectDiv.style.border = `${size} solid ${color}`;
//   const scrollTop =
//     document.documentElement.scrollTop || document.body.scrollTop;
//   const scrollLeft =
//     document.documentElement.scrollLeft || document.body.scrollLeft;
//   tableRectDiv.style.margin = tableRectDiv.style.padding = "0";
//   tableRectDiv.style.top = `${rect.top + scrollTop}px`;
//   tableRectDiv.style.left = `${rect.left + scrollLeft}px`;
//   // We want rect.width to be the border width, so content width is 2px less.
//   tableRectDiv.style.width = `${rect.width - 2}px`;
//   tableRectDiv.style.height = `${rect.height - 2}px`;
//   document.body.appendChild(tableRectDiv);
// }
//# sourceMappingURL=XTextTruncation.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XText/XText.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/







let XText_XText = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-text', [
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
            XTextSelectionEvents,
            XTextTruncation_XTextTruncation,
            RawTextAttributes,
        ], templateXText)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XText = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XText = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static notToFilterFalseAttributes = new Set(['tail-color-convert']);
        superScrollIntoView(arg) {
            super.scrollIntoView(arg);
        }
        scrollIntoView(arg) {
            const lynxArg = arg;
            if (typeof arg === 'object' && lynxArg.scrollIntoViewOptions) {
                this.dispatchEvent(new CustomEvent(ScrollIntoView.eventName, {
                    bubbles: true,
                    composed: true,
                    detail: lynxArg.scrollIntoViewOptions,
                }));
            }
            else {
                super.scrollIntoView(arg);
            }
        }
        [CommonEventsAndMethods/* .layoutChangeTarget */.v] = this;
        static {
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XText = _classThis;
})();

//# sourceMappingURL=XText.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XText/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.




/**
 * @module elements/XText
 *
 * `x-text` displays text content, supporting truncation and rich text.
 *
 * Attributes:
 * - `text-maxlength`: Max characters to show.
 * - `text-maxline`: Max lines to show (ellipsis).
 * - `tail-color-convert`: 'true' | 'false', whether to apply color to truncation ellipsis.
 *
 * Events:
 * - `layout`: Fired when text layout happens (if enabled). Detail provides line info.
 * - `selectionchange`: Fired when the text selection changes. Detail provides start, end, and direction.
 *
 * CSS Variables:
 * - `--lynx-text-bg-color`: Inherited background color for nested text elements.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XTextarea/Placeholder.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/


let Placeholder_Placeholder = (() => {
    let __updatePlaceholderColor_decorators;
    let __updatePlaceholderColor_initializers = [];
    let __updatePlaceholderColor_extraInitializers = [];
    let __updatePlaceholderFontSize_decorators;
    let __updatePlaceholderFontSize_initializers = [];
    let __updatePlaceholderFontSize_extraInitializers = [];
    let __updatePlaceholderFontWeight_decorators;
    let __updatePlaceholderFontWeight_initializers = [];
    let __updatePlaceholderFontWeight_extraInitializers = [];
    let __updatePlaceholderFontFamily_decorators;
    let __updatePlaceholderFontFamily_initializers = [];
    let __updatePlaceholderFontFamily_extraInitializers = [];
    let __handlePlaceholder_decorators;
    let __handlePlaceholder_initializers = [];
    let __handlePlaceholder_extraInitializers = [];
    return class Placeholder {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __updatePlaceholderColor_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder-color', true)];
            __updatePlaceholderFontSize_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder-font-size', true)];
            __updatePlaceholderFontWeight_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder-font-weight', true)];
            __updatePlaceholderFontFamily_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder-font-family', true)];
            __handlePlaceholder_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('placeholder', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __updatePlaceholderColor_decorators, { kind: "field", name: "_updatePlaceholderColor", static: false, private: false, access: { has: obj => "_updatePlaceholderColor" in obj, get: obj => obj._updatePlaceholderColor, set: (obj, value) => { obj._updatePlaceholderColor = value; } }, metadata: _metadata }, __updatePlaceholderColor_initializers, __updatePlaceholderColor_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __updatePlaceholderFontSize_decorators, { kind: "field", name: "_updatePlaceholderFontSize", static: false, private: false, access: { has: obj => "_updatePlaceholderFontSize" in obj, get: obj => obj._updatePlaceholderFontSize, set: (obj, value) => { obj._updatePlaceholderFontSize = value; } }, metadata: _metadata }, __updatePlaceholderFontSize_initializers, __updatePlaceholderFontSize_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __updatePlaceholderFontWeight_decorators, { kind: "field", name: "_updatePlaceholderFontWeight", static: false, private: false, access: { has: obj => "_updatePlaceholderFontWeight" in obj, get: obj => obj._updatePlaceholderFontWeight, set: (obj, value) => { obj._updatePlaceholderFontWeight = value; } }, metadata: _metadata }, __updatePlaceholderFontWeight_initializers, __updatePlaceholderFontWeight_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __updatePlaceholderFontFamily_decorators, { kind: "field", name: "_updatePlaceholderFontFamily", static: false, private: false, access: { has: obj => "_updatePlaceholderFontFamily" in obj, get: obj => obj._updatePlaceholderFontFamily, set: (obj, value) => { obj._updatePlaceholderFontFamily = value; } }, metadata: _metadata }, __updatePlaceholderFontFamily_initializers, __updatePlaceholderFontFamily_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlePlaceholder_decorators, { kind: "field", name: "_handlePlaceholder", static: false, private: false, access: { has: obj => "_handlePlaceholder" in obj, get: obj => obj._handlePlaceholder, set: (obj, value) => { obj._handlePlaceholder = value; } }, metadata: _metadata }, __handlePlaceholder_initializers, __handlePlaceholder_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'placeholder',
            'placeholder-color',
            'placeholder-font-size',
            'placeholder-font-weight',
            'placeholder-font-family',
        ];
        #getTextarea = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#textarea');
        _updatePlaceholderColor = (0,tslib_es6/* .__runInitializers */.zF)(this, __updatePlaceholderColor_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getTextarea, '--placeholder-color', undefined, true));
        _updatePlaceholderFontSize = ((0,tslib_es6/* .__runInitializers */.zF)(this, __updatePlaceholderColor_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __updatePlaceholderFontSize_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getTextarea, '--placeholder-font-size', undefined, true)));
        _updatePlaceholderFontWeight = ((0,tslib_es6/* .__runInitializers */.zF)(this, __updatePlaceholderFontSize_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __updatePlaceholderFontWeight_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getTextarea, '--placeholder-font-weight', undefined, true)));
        _updatePlaceholderFontFamily = ((0,tslib_es6/* .__runInitializers */.zF)(this, __updatePlaceholderFontWeight_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __updatePlaceholderFontFamily_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getTextarea, '--placeholder-font-family', undefined, true)));
        _handlePlaceholder = ((0,tslib_es6/* .__runInitializers */.zF)(this, __updatePlaceholderFontFamily_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handlePlaceholder_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getTextarea, 'placeholder')));
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, __handlePlaceholder_extraInitializers);
        constructor(dom) {
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=Placeholder.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XTextarea/TextareaBaseAttributes.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let TextareaBaseAttributes = (() => {
    let __handlerConfirmType_decorators;
    let __handlerConfirmType_initializers = [];
    let __handlerConfirmType_extraInitializers = [];
    let __handlerMaxlength_decorators;
    let __handlerMaxlength_initializers = [];
    let __handlerMaxlength_extraInitializers = [];
    let __handleReadonly_decorators;
    let __handleReadonly_initializers = [];
    let __handleReadonly_extraInitializers = [];
    let __handleSpellCheck_decorators;
    let __handleSpellCheck_initializers = [];
    let __handleSpellCheck_extraInitializers = [];
    let __handleShowSoftInputOnfocus_decorators;
    let __handleShowSoftInputOnfocus_initializers = [];
    let __handleShowSoftInputOnfocus_extraInitializers = [];
    return class TextareaBaseAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handlerConfirmType_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('confirm-type', true)];
            __handlerMaxlength_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('maxlength', true)];
            __handleReadonly_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('readonly', true)];
            __handleSpellCheck_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('ios-spell-check', true)];
            __handleShowSoftInputOnfocus_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('show-soft-input-onfocus', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerConfirmType_decorators, { kind: "field", name: "_handlerConfirmType", static: false, private: false, access: { has: obj => "_handlerConfirmType" in obj, get: obj => obj._handlerConfirmType, set: (obj, value) => { obj._handlerConfirmType = value; } }, metadata: _metadata }, __handlerConfirmType_initializers, __handlerConfirmType_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerMaxlength_decorators, { kind: "field", name: "_handlerMaxlength", static: false, private: false, access: { has: obj => "_handlerMaxlength" in obj, get: obj => obj._handlerMaxlength, set: (obj, value) => { obj._handlerMaxlength = value; } }, metadata: _metadata }, __handlerMaxlength_initializers, __handlerMaxlength_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleReadonly_decorators, { kind: "field", name: "_handleReadonly", static: false, private: false, access: { has: obj => "_handleReadonly" in obj, get: obj => obj._handleReadonly, set: (obj, value) => { obj._handleReadonly = value; } }, metadata: _metadata }, __handleReadonly_initializers, __handleReadonly_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleSpellCheck_decorators, { kind: "field", name: "_handleSpellCheck", static: false, private: false, access: { has: obj => "_handleSpellCheck" in obj, get: obj => obj._handleSpellCheck, set: (obj, value) => { obj._handleSpellCheck = value; } }, metadata: _metadata }, __handleSpellCheck_initializers, __handleSpellCheck_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleShowSoftInputOnfocus_decorators, { kind: "field", name: "_handleShowSoftInputOnfocus", static: false, private: false, access: { has: obj => "_handleShowSoftInputOnfocus" in obj, get: obj => obj._handleShowSoftInputOnfocus, set: (obj, value) => { obj._handleShowSoftInputOnfocus = value; } }, metadata: _metadata }, __handleShowSoftInputOnfocus_initializers, __handleShowSoftInputOnfocus_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'confirm-type',
            'maxlength',
            'readonly',
            'type',
            'ios-spell-check',
            'spell-check',
            'show-soft-input-onfocus',
        ];
        #dom;
        #getTextareaElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#textarea');
        _handlerConfirmType = (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerConfirmType_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getTextareaElement, 'enterkeyhint', (val) => {
            if (val === null)
                return 'send';
            return val;
        }));
        _handlerMaxlength = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlerConfirmType_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerMaxlength_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getTextareaElement, 'maxlength', (val) => {
            if (val === null)
                return '140';
            return val;
        })));
        _handleReadonly = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlerMaxlength_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleReadonly_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getTextareaElement, 'readonly', (value) => (value !== null ? '' : null))));
        _handleSpellCheck = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleReadonly_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleSpellCheck_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getTextareaElement, 'spellcheck', (value) => (value === null ? 'false' : 'true'))));
        _handleShowSoftInputOnfocus = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleSpellCheck_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleShowSoftInputOnfocus_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getTextareaElement, 'virtualkeyboardpolicy', (value) => (value === null ? 'manual' : 'auto'))));
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handleShowSoftInputOnfocus_extraInitializers);
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=TextareaBaseAttributes.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XTextarea/XTextareaAttributes.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let XTextareaAttributes = (() => {
    let _instanceExtraInitializers = [];
    let __handleConfirmEnter_decorators;
    let __handleDisabled_decorators;
    let __handleDisabled_initializers = [];
    let __handleDisabled_extraInitializers = [];
    let __handleMaxHeight_decorators;
    let __handleMaxHeight_initializers = [];
    let __handleMaxHeight_extraInitializers = [];
    let __handleMinHeight_decorators;
    let __handleMinHeight_initializers = [];
    let __handleMinHeight_extraInitializers = [];
    let __handleValue_decorators;
    return class XTextareaAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleConfirmEnter_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('confirm-enter', true)];
            __handleDisabled_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('disabled', true)];
            __handleMaxHeight_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('max-height', true)];
            __handleMinHeight_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('min-height', true)];
            __handleValue_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('value', false)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleConfirmEnter_decorators, { kind: "method", name: "_handleConfirmEnter", static: false, private: false, access: { has: obj => "_handleConfirmEnter" in obj, get: obj => obj._handleConfirmEnter }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleValue_decorators, { kind: "method", name: "_handleValue", static: false, private: false, access: { has: obj => "_handleValue" in obj, get: obj => obj._handleValue }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleDisabled_decorators, { kind: "field", name: "_handleDisabled", static: false, private: false, access: { has: obj => "_handleDisabled" in obj, get: obj => obj._handleDisabled, set: (obj, value) => { obj._handleDisabled = value; } }, metadata: _metadata }, __handleDisabled_initializers, __handleDisabled_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleMaxHeight_decorators, { kind: "field", name: "_handleMaxHeight", static: false, private: false, access: { has: obj => "_handleMaxHeight" in obj, get: obj => obj._handleMaxHeight, set: (obj, value) => { obj._handleMaxHeight = value; } }, metadata: _metadata }, __handleMaxHeight_initializers, __handleMaxHeight_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleMinHeight_decorators, { kind: "field", name: "_handleMinHeight", static: false, private: false, access: { has: obj => "_handleMinHeight" in obj, get: obj => obj._handleMinHeight, set: (obj, value) => { obj._handleMinHeight = value; } }, metadata: _metadata }, __handleMinHeight_initializers, __handleMinHeight_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'confirm-enter',
            'disabled',
            'max-height',
            'min-height',
            'value',
        ];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #getTextareaElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#textarea');
        #getFormElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#form');
        #confirmEnter = false;
        _handleConfirmEnter(newVal) {
            this.#confirmEnter = newVal !== null;
        }
        _handleDisabled = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleDisabled_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getTextareaElement, 'disabled', (value) => (value !== null ? '' : null)));
        _handleMaxHeight = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleDisabled_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleMaxHeight_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getTextareaElement, 'max-height')));
        _handleMinHeight = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleMaxHeight_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleMinHeight_initializers, (0,element_reactive/* .bindToStyle */._8)(this.#getTextareaElement, 'min-height')));
        _handleValue(newValue) {
            if (newValue) {
                const maxlength = parseFloat(this.#dom.getAttribute('maxlength') ?? '');
                if (!isNaN(maxlength))
                    newValue = newValue.substring(0, maxlength);
            }
            else {
                newValue = '';
            }
            const textarea = this.#getTextareaElement();
            if (textarea.value !== newValue) {
                textarea.value = newValue;
            }
        }
        #handleKeyEvent = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleMinHeight_extraInitializers), (event) => {
            if (this.#confirmEnter && event.key === 'Enter') {
                this.#getFormElement().dispatchEvent(new SubmitEvent('submit'));
            }
        });
        constructor(dom) {
            this.#dom = dom;
            this.#getTextareaElement().addEventListener('keyup', this.#handleKeyEvent);
        }
    };
})();

//# sourceMappingURL=XTextareaAttributes.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XTextarea/XTextareaEvents.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XTextareaEvents = (() => {
    let _instanceExtraInitializers = [];
    let __handleEnableConfirmEvent_decorators;
    let __handleSendComposingInput_decorators;
    let __handleEnableSelectionEvent_decorators;
    return class XTextareaEvents {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleEnableConfirmEvent_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('input-filter', true), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('lynxinput')];
            __handleSendComposingInput_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('send-composing-input', true)];
            __handleEnableSelectionEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('selection')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleEnableConfirmEvent_decorators, { kind: "method", name: "_handleEnableConfirmEvent", static: false, private: false, access: { has: obj => "_handleEnableConfirmEvent" in obj, get: obj => obj._handleEnableConfirmEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleSendComposingInput_decorators, { kind: "method", name: "_handleSendComposingInput", static: false, private: false, access: { has: obj => "_handleSendComposingInput" in obj, get: obj => obj._handleSendComposingInput }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleEnableSelectionEvent_decorators, { kind: "method", name: "_handleEnableSelectionEvent", static: false, private: false, access: { has: obj => "_handleEnableSelectionEvent" in obj, get: obj => obj._handleEnableSelectionEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['send-composing-input', 'input-filter'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #sendComposingInput = false;
        #getTextareaElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#textarea');
        #getFormElement = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#form');
        _handleEnableConfirmEvent(status) {
            const textareaElement = this.#getTextareaElement();
            if (status) {
                textareaElement.addEventListener('input', this.#teleportInput, { passive: true });
                textareaElement.addEventListener('compositionend', this.#teleportCompositionendInput, { passive: true });
            }
            else {
                textareaElement.removeEventListener('input', this.#teleportInput);
                textareaElement.removeEventListener('compositionend', this.#teleportCompositionendInput);
            }
        }
        _handleSendComposingInput(newVal) {
            this.#sendComposingInput = newVal !== null;
        }
        #teleportEvent = (event) => {
            const eventType = renameEvent[event.type] ?? event.type;
            this.#dom.dispatchEvent(new CustomEvent(eventType, {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    value: this.#getTextareaElement().value,
                },
            }));
        };
        #teleportInput = (event) => {
            const input = this.#getTextareaElement();
            const inputFilter = this.#dom.getAttribute('input-filter');
            const filterValue = inputFilter
                ? input.value.replace(new RegExp(inputFilter, 'g'), '')
                : input.value;
            const isComposing = event.isComposing;
            input.value = filterValue;
            if (isComposing && !this.#sendComposingInput)
                return;
            this.#dom.dispatchEvent(new CustomEvent('lynxinput', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    value: filterValue,
                    /** @deprecated */
                    textLength: filterValue.length,
                    /** @deprecated */
                    cursor: input.selectionStart,
                    isComposing,
                    selectionStart: input.selectionStart,
                    selectionEnd: input.selectionEnd,
                },
            }));
        };
        #teleportCompositionendInput = () => {
            const input = this.#getTextareaElement();
            const inputFilter = this.#dom.getAttribute('input-filter');
            const filterValue = inputFilter
                ? input.value.replace(new RegExp(inputFilter, 'g'), '')
                : input.value;
            input.value = filterValue;
            // if #sendComposingInput set true, #teleportInput will send detail
            if (!this.#sendComposingInput) {
                this.#dom.dispatchEvent(new CustomEvent('lynxinput', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: {
                        value: filterValue,
                        /** @deprecated */
                        textLength: filterValue.length,
                        /** @deprecated */
                        cursor: input.selectionStart,
                        isComposing: false,
                        selectionStart: input.selectionStart,
                        selectionEnd: input.selectionEnd,
                    },
                }));
            }
        };
        _handleEnableSelectionEvent(status) {
            if (status) {
                this.#getTextareaElement().addEventListener('select', this.#selectEvent, {
                    passive: true,
                });
            }
            else {
                this.#getTextareaElement().removeEventListener('select', this.#selectEvent);
            }
        }
        #selectEvent = () => {
            const input = this.#getTextareaElement();
            this.#dom.dispatchEvent(new CustomEvent('selection', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: {
                    selectionStart: input.selectionStart,
                    selectionEnd: input.selectionEnd,
                },
            }));
        };
        #blockHtmlEvent = (event) => {
            if (event.target === this.#getTextareaElement()
                && typeof event.detail === 'number') {
                event.stopImmediatePropagation();
            }
        };
        constructor(dom) {
            this.#dom = dom;
            const textareaElement = this.#getTextareaElement();
            const formElement = this.#getFormElement();
            textareaElement.addEventListener('blur', this.#teleportEvent, {
                passive: true,
            });
            textareaElement.addEventListener('focus', this.#teleportEvent, {
                passive: true,
            });
            formElement.addEventListener('submit', this.#teleportEvent, {
                passive: true,
            });
            // use form to stop propagation
            formElement.addEventListener('input', this.#blockHtmlEvent, {
                passive: true,
            });
        }
    };
})();

//# sourceMappingURL=XTextareaEvents.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XTextarea/XTextarea.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/







// x-textarea
let XTextarea_XTextarea = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-textarea', [
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
            Placeholder_Placeholder,
            TextareaBaseAttributes,
            XTextareaAttributes,
            XTextareaEvents,
        ], templateXTextarea)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XTextarea = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XTextarea = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        #getTextarea = (0,element_reactive/* .genDomGetter */.Ut)(() => this.shadowRoot, '#textarea');
        get value() {
            return this.#getTextarea().value;
        }
        set value(val) {
            this.#getTextarea().value = val;
        }
        addText(params) {
            const { text } = params;
            const input = this.#getTextarea();
            const selectionStart = input.selectionStart;
            if (selectionStart === null) {
                input.value = text;
            }
            else {
                const currentValue = input.value;
                input.value = currentValue.slice(0, selectionStart)
                    + text
                    + currentValue.slice(selectionStart);
            }
        }
        setValue(params) {
            const input = this.#getTextarea();
            input.value = params.value;
            let cursorIndex;
            if ((cursorIndex = params.index)) {
                input.setSelectionRange(cursorIndex, cursorIndex);
            }
        }
        getValue() {
            const input = this.#getTextarea();
            return {
                value: input.value,
                selectionBegin: input.selectionStart,
                selectionEnd: input.selectionEnd,
            };
        }
        sendDelEvent(params) {
            let { action, length } = params;
            const input = this.#getTextarea();
            if (action === 1) {
                length = 1;
            }
            const selectionStart = input.selectionStart;
            if (selectionStart === null) {
                const currentValue = input.value;
                input.value = input.value.substring(0, currentValue.length - length);
            }
            else {
                const currentValue = input.value;
                input.value = currentValue.slice(0, selectionStart - length)
                    + currentValue.slice(selectionStart);
            }
        }
        select() {
            const input = this.#getTextarea();
            input.setSelectionRange(0, input.value.length);
        }
        setSelectionRange(params) {
            this.#getTextarea().setSelectionRange(params.selectionStart, params.selectionEnd);
        }
    };
    return XTextarea = _classThis;
})();

//# sourceMappingURL=XTextarea.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XTextarea/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/XTextarea
 *
 * `x-textarea` provides a multi-line input field.
 *
 * Attributes:
 * - `value`: Input value.
 * - `disabled`: 'true' | 'false'.
 * - `placeholder`: Placeholder text.
 * - `maxlength`: Max character length (default 140).
 * - `auto-height`: 'true' | 'false', auto resize height.
 * - `confirm-type`: 'send' | 'search' | 'next' | 'go' | 'done'.
 * - `confirm-enter`: 'true' | 'false', trigger confirm event on enter.
 * - `max-height`: Max height style.
 * - `min-height`: Min height style.
 * - `placeholder-color`: Color of the placeholder text.
 * - `placeholder-font-weight`: Font weight of the placeholder.
 * - `placeholder-font-size`: Font size of the placeholder.
 * - `placeholder-font-family`: Font family of the placeholder.
 *
 * Events:
 * - `input`: Fired on input.
 * - `focus`: Fired on focus.
 * - `blur`: Fired on blur.
 * - `confirm`: Fired on confirm/enter.
 * - `linechange`: Fired when line count changes.
 *
 * Methods:
 * - `addText({ text })`: Inserts text.
 * - `setValue({ value, index })`: Sets value and cursor.
 * - `getValue()`: Returns value and selection.
 * - `select()`: Selects all text.
 * - `setSelectionRange({ selectionStart, selectionEnd })`: Sets selection.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XView/XView.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XView_XView = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-view', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XView = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XView = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        superScrollIntoView(arg) {
            super.scrollIntoView(arg);
        }
        scrollIntoView(arg) {
            const lynxArg = arg;
            if (typeof arg === 'object' && lynxArg.scrollIntoViewOptions) {
                this.dispatchEvent(new CustomEvent(ScrollIntoView.eventName, {
                    bubbles: true,
                    composed: true,
                    detail: lynxArg.scrollIntoViewOptions,
                }));
            }
            else {
                super.scrollIntoView(arg);
            }
        }
        [CommonEventsAndMethods/* .layoutChangeTarget */.v] = this;
    };
    return XView = _classThis;
})();

//# sourceMappingURL=XView.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XView/BlurRadius.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let BlurRadius = (() => {
    let _instanceExtraInitializers = [];
    let __handleBlurRadius_decorators;
    return class BlurRadius {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleBlurRadius_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('blur-radius', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleBlurRadius_decorators, { kind: "method", name: "_handleBlurRadius", static: false, private: false, access: { has: obj => "_handleBlurRadius" in obj, get: obj => obj._handleBlurRadius }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['blur-radius'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #getDynamicStyle = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#dynamic-style');
        _handleBlurRadius(newVal) {
            if (newVal) {
                newVal = `blur(${parseFloat(newVal)}px)`;
                this.#getDynamicStyle().innerHTML =
                    `:host { backdrop-filter: ${newVal}; -webkit-backdrop-filter: ${newVal}}`;
            }
            else {
                this.#getDynamicStyle().innerHTML = '';
            }
        }
        constructor(dom) {
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=BlurRadius.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XView/XBlurView.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



let XBlurView_XBlurView = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-blur-view', [CommonEventsAndMethods/* .CommonEventsAndMethods */.O, BlurRadius], `<style id="dynamic-style"></style><slot></slot>`)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XBlurView = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XBlurView = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XBlurView = _classThis;
})();

//# sourceMappingURL=XBlurView.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XView/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/XView
 *
 * `x-view` is a generic container element, similar to `div`.
 * It supports standard layout and styling attributes.
 */


//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XViewpagerNg/XViewpagerNgEvents.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XViewpagerNgEvents = (() => {
    let _instanceExtraInitializers = [];
    let __enableChangeEvent_decorators;
    let __enableWillChangeEvent_decorators;
    let __enableOffsetChangeEvent_decorators;
    return class XViewpagerNgEvents {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __enableChangeEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('change')];
            __enableWillChangeEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('willchange')];
            __enableOffsetChangeEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('offsetchange')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __enableChangeEvent_decorators, { kind: "method", name: "_enableChangeEvent", static: false, private: false, access: { has: obj => "_enableChangeEvent" in obj, get: obj => obj._enableChangeEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __enableWillChangeEvent_decorators, { kind: "method", name: "_enableWillChangeEvent", static: false, private: false, access: { has: obj => "_enableWillChangeEvent" in obj, get: obj => obj._enableWillChangeEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __enableOffsetChangeEvent_decorators, { kind: "method", name: "_enableOffsetChangeEvent", static: false, private: false, access: { has: obj => "_enableOffsetChangeEvent" in obj, get: obj => obj._enableOffsetChangeEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #isDragging = false;
        #connected = false;
        #currentIndex = 0;
        #debounceScrollForMockingScrollEnd;
        constructor(dom) {
            this.#dom = dom;
        }
        #getScrollContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#content');
        #scrollHandler = () => {
            if (!this.#connected)
                return;
            const scrollContainer = this.#getScrollContainer();
            const oneItemWidth = this.#dom.clientWidth;
            const scrollLeft = scrollContainer.scrollLeft;
            const innerOffset = scrollLeft / oneItemWidth;
            if (this.#enableChange && !constants/* .useScrollEnd */.k) {
                // debounce
                clearTimeout(this.#debounceScrollForMockingScrollEnd);
                this.#debounceScrollForMockingScrollEnd = setTimeout(() => {
                    this.#scrollEndHandler();
                }, 100);
            }
            this.#dom.dispatchEvent(new CustomEvent('offsetchange', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: { offset: innerOffset },
            }));
        };
        #scrollEndHandler = () => {
            if (this.#connected) {
                const scrollContainer = this.#getScrollContainer();
                const oneItemWidth = this.#dom.clientWidth;
                const scrollLeft = scrollContainer.scrollLeft;
                const currentIndex = Math.floor(scrollLeft / oneItemWidth);
                if (currentIndex !== this.#currentIndex) {
                    this.#dom.dispatchEvent(new CustomEvent('change', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: { index: currentIndex, isDragged: this.#isDragging },
                    }));
                    this.#currentIndex = currentIndex;
                }
            }
        };
        #touchStartHandler = () => {
            this.#isDragging = true;
        };
        #touchEndHandler = () => {
            this.#isDragging = false;
            if (this.#enableWillChange) {
                const scrollContainer = this.#getScrollContainer();
                const oneItemWidth = this.#dom.clientWidth;
                if (oneItemWidth > 0) {
                    const scrollLeft = scrollContainer.scrollLeft;
                    let targetIndex = Math.round(scrollLeft / oneItemWidth);
                    targetIndex = Math.max(0, Math.min(targetIndex, this.#dom.children.length - 1));
                    this.#dom.dispatchEvent(new CustomEvent('willchange', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: { index: targetIndex },
                    }));
                }
            }
        };
        #enableChange = false;
        _enableChangeEvent(status) {
            this.#enableChange = status;
            this.#enableScrollEventListener();
        }
        #enableWillChange = false;
        _enableWillChangeEvent(status) {
            this.#enableWillChange = status;
        }
        #enableOffsetChange = false;
        _enableOffsetChangeEvent(status) {
            this.#enableOffsetChange = status;
            this.#enableScrollEventListener();
        }
        #enableScrollEventListener() {
            const scrollContainer = this.#getScrollContainer();
            if (this.#enableOffsetChange || this.#enableChange) {
                scrollContainer.addEventListener('scroll', this.#scrollHandler, {
                    passive: true,
                });
            }
            else {
                scrollContainer.removeEventListener('scroll', this.#scrollHandler);
            }
            if (constants/* .useScrollEnd */.k && this.#enableChange) {
                scrollContainer.addEventListener('scrollend', this.#scrollEndHandler, {
                    passive: true,
                });
            }
            else {
                scrollContainer.removeEventListener('scrollend', this.#scrollEndHandler);
            }
        }
        connectedCallback() {
            this.#connected = true;
            const scrollContainer = this.#getScrollContainer();
            this.#dom.addEventListener('touchstart', this.#touchStartHandler, {
                passive: true,
            });
            scrollContainer.addEventListener('touchend', this.#touchEndHandler, {
                passive: true,
            });
            scrollContainer.addEventListener('touchcancel', this.#touchEndHandler, {
                passive: true,
            });
        }
        dispose() {
            const scrollContainer = this.#getScrollContainer();
            scrollContainer.removeEventListener('scroll', this.#scrollHandler);
            scrollContainer.removeEventListener('scrollend', this.#scrollEndHandler);
        }
    };
})();

//# sourceMappingURL=XViewpagerNgEvents.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XViewpagerNg/XViewpagerNg.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/






let XViewpagerNg_XViewpagerNg = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-viewpager-ng', [LinearContainer, CommonEventsAndMethods/* .CommonEventsAndMethods */.O, XViewpagerNgEvents], templateXViewpageNg)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XViewpagerNg = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XViewpagerNg = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static notToFilterFalseAttributes = new Set([
            'allow-horizontal-gesture',
            'enable-scroll',
        ]);
        selectTab(params) {
            let { index, smooth } = params;
            if (typeof smooth === 'undefined')
                smooth = true;
            const scrollContainer = this.shadowRoot.children.item(2);
            const scrollLeft = scrollContainer.clientWidth * index;
            scrollContainer.scrollTo({
                left: scrollLeft,
                behavior: smooth ? 'smooth' : 'instant',
            });
        }
        connectedCallback() {
            const initialSelectIndex = this.getAttribute('select-index')
                || this.getAttribute('initial-select-index');
            if (initialSelectIndex !== null) {
                const selectIndex = Number(initialSelectIndex);
                const scrollContainer = this.shadowRoot.children.item(2);
                const scrollToInitialIndex = () => {
                    if (scrollContainer.clientWidth === 0) {
                        // In Safari, there is the potential race condition between the browser's layout and clientWidth calculate.
                        // So, we have to use requestAnimationFrame to ensure that the code runs after the browser's layout.
                        requestAnimationFrame(scrollToInitialIndex);
                    }
                    else {
                        this.selectTab({ index: selectIndex, smooth: false });
                    }
                };
                // The reason for using microtasks is that the width and height of the child element may not be rendered at this time, so it will not be able to scroll.
                (0,element_reactive/* .boostedQueueMicrotask */.JS)(scrollToInitialIndex);
            }
        }
        get [constants/* .scrollContainerDom */.l]() {
            return this;
        }
        static {
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XViewpagerNg = _classThis;
})();

//# sourceMappingURL=XViewpagerNg.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XViewpagerNg/XViewpagerItemNg.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



let XViewpagerItemNg_XViewpagerItemNg = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-viewpager-item-ng', [
            LinearContainer,
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XViewpagerItemNg = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XViewpagerItemNg = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XViewpagerItemNg = _classThis;
})();

//# sourceMappingURL=XViewpagerItemNg.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XViewpagerNg/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/XViewpagerNg
 *
 * `x-viewpager-ng` provides a page container that allows sliding between pages.
 *
 * Attributes:
 * - `select-index`: Index of the currently selected page.
 * - `initial-select-index`: Initial selected index.
 * - `allow-horizontal-gesture`: 'true' | 'false'.
 * - `enable-scroll`: 'true' | 'false'.
 *
 * Events:
 * - `change`: Fired when the selected page changes. Detail: `{ index, isDragged }`.
 * - `offsetchange`: Fired when scroll offset changes. Detail: `{ offset }`.
 *
 * Methods:
 * - `selectTab({ index, smooth })`: Selects a page.
 */


//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XList/ListItemAttributes.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let ListItemAttributes = (() => {
    let __handlerEstimatedMainAxisSizePx_decorators;
    let __handlerEstimatedMainAxisSizePx_initializers = [];
    let __handlerEstimatedMainAxisSizePx_extraInitializers = [];
    return class ListItemAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handlerEstimatedMainAxisSizePx_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('estimated-main-axis-size-px', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerEstimatedMainAxisSizePx_decorators, { kind: "field", name: "_handlerEstimatedMainAxisSizePx", static: false, private: false, access: { has: obj => "_handlerEstimatedMainAxisSizePx" in obj, get: obj => obj._handlerEstimatedMainAxisSizePx, set: (obj, value) => { obj._handlerEstimatedMainAxisSizePx = value; } }, metadata: _metadata }, __handlerEstimatedMainAxisSizePx_initializers, __handlerEstimatedMainAxisSizePx_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'estimated-main-axis-size-px',
        ];
        #dom;
        _handlerEstimatedMainAxisSizePx = (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerEstimatedMainAxisSizePx_initializers, (0,element_reactive/* .bindToStyle */._8)(() => this.#dom, '--estimated-main-axis-size-px', (v) => `${parseFloat(v)}px`));
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerEstimatedMainAxisSizePx_extraInitializers);
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=ListItemAttributes.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XList/ListItem.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/



let ListItem_ListItem = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('list-item', [
            CommonEventsAndMethods/* .CommonEventsAndMethods */.O,
            ListItemAttributes,
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var ListItem = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ListItem = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static notToFilterFalseAttributes = new Set(['recyclable']);
        static {
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return ListItem = _classThis;
})();

//# sourceMappingURL=ListItem.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XList/XListAttributes.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let XListAttributes = (() => {
    let __handlerStickyOffset_decorators;
    let __handlerStickyOffset_initializers = [];
    let __handlerStickyOffset_extraInitializers = [];
    let __handlerCount_decorators;
    let __handlerCount_initializers = [];
    let __handlerCount_extraInitializers = [];
    return class XListAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handlerStickyOffset_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('sticky-offset', true)];
            __handlerCount_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('span-count', true), (0,element_reactive/* .registerAttributeHandler */._y)('column-count', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerStickyOffset_decorators, { kind: "field", name: "_handlerStickyOffset", static: false, private: false, access: { has: obj => "_handlerStickyOffset" in obj, get: obj => obj._handlerStickyOffset, set: (obj, value) => { obj._handlerStickyOffset = value; } }, metadata: _metadata }, __handlerStickyOffset_initializers, __handlerStickyOffset_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handlerCount_decorators, { kind: "field", name: "_handlerCount", static: false, private: false, access: { has: obj => "_handlerCount" in obj, get: obj => obj._handlerCount, set: (obj, value) => { obj._handlerCount = value; } }, metadata: _metadata }, __handlerCount_initializers, __handlerCount_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'sticky-offset',
            'initial-scroll-index',
            'span-count',
            'column-count',
        ];
        #dom;
        _handlerStickyOffset = (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerStickyOffset_initializers, (0,element_reactive/* .bindToStyle */._8)(() => this.#dom, '--list-item-sticky-offset', (v) => `${parseFloat(v)}px`));
        _handlerCount = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handlerStickyOffset_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerCount_initializers, (0,element_reactive/* .bindToStyle */._8)(() => this.#dom, '--list-item-span-count', (v) => `${parseFloat(v)}`)));
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handlerCount_extraInitializers);
            this.#dom = dom;
        }
        connectedCallback() {
            const initialScrollIndex = this.#dom.getAttribute('initial-scroll-index');
            if (initialScrollIndex !== null) {
                const position = parseFloat(initialScrollIndex);
                const scrollToInitialIndex = () => {
                    if (this.#dom.clientHeight === 0) {
                        // In Safari, there is the potential race condition between the browser's layout and clientWidth calculate.
                        // So, we have to use requestAnimationFrame to ensure that the code runs after the browser's layout.
                        requestAnimationFrame(scrollToInitialIndex);
                    }
                    else {
                        this.#dom.scrollToPosition({ position });
                    }
                };
                // The reason for using microtasks is that the width and height of the child element may not be rendered at this time, so it will not be able to scroll.
                (0,element_reactive/* .boostedQueueMicrotask */.JS)(scrollToInitialIndex);
            }
        }
    };
})();

//# sourceMappingURL=XListAttributes.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/common/throttle.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
const throttle = function (func, wait, options) {
    let timeout;
    let context;
    let args;
    let result;
    let previous = 0;
    var later = function () {
        previous = options?.leading === false ? 0 : new Date().getTime();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout)
            context = args = null;
    };
    return function () {
        var now = new Date().getTime();
        if (!previous && options?.leading === false)
            previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout)
                context = args = null;
        }
        else if (!timeout && options?.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};
//# sourceMappingURL=throttle.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XList/XListEvents.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/






let XListEvents = (() => {
    let _instanceExtraInitializers = [];
    let __updateEventSwitches_decorators;
    let __updateEventSwitches_initializers = [];
    let __updateEventSwitches_extraInitializers = [];
    let __handleUpperThresholdItemCountChange_decorators;
    let __updateScrollToLowerEventSwitches_decorators;
    let __updateScrollToLowerEventSwitches_initializers = [];
    let __updateScrollToLowerEventSwitches_extraInitializers = [];
    let __handleLowerThresholdItemCountChange_decorators;
    let __handleScrollEventsSwitches_decorators;
    let __handleScrollEventsSwitches_initializers = [];
    let __handleScrollEventsSwitches_extraInitializers = [];
    let __handleScrollToUpperEdgeEventEnable_decorators;
    let __handleScrollToUpperEdgeEventEnable_initializers = [];
    let __handleScrollToUpperEdgeEventEnable_extraInitializers = [];
    let __handleScrollToLowerEdgeEventEnable_decorators;
    let __handleScrollToLowerEdgeEventEnable_initializers = [];
    let __handleScrollToLowerEdgeEventEnable_extraInitializers = [];
    return class XListEvents {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __updateEventSwitches_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('scrolltoupper')];
            __handleUpperThresholdItemCountChange_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('upper-threshold-item-count', true)];
            __updateScrollToLowerEventSwitches_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('scrolltolower')];
            __handleLowerThresholdItemCountChange_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('lower-threshold-item-count', true)];
            __handleScrollEventsSwitches_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('lynxscroll'), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('lynxscrollend'), (0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('snap')];
            __handleScrollToUpperEdgeEventEnable_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('scrolltoupperedge')];
            __handleScrollToLowerEdgeEventEnable_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('scrolltoloweredge')];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleUpperThresholdItemCountChange_decorators, { kind: "method", name: "_handleUpperThresholdItemCountChange", static: false, private: false, access: { has: obj => "_handleUpperThresholdItemCountChange" in obj, get: obj => obj._handleUpperThresholdItemCountChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleLowerThresholdItemCountChange_decorators, { kind: "method", name: "_handleLowerThresholdItemCountChange", static: false, private: false, access: { has: obj => "_handleLowerThresholdItemCountChange" in obj, get: obj => obj._handleLowerThresholdItemCountChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __updateEventSwitches_decorators, { kind: "field", name: "_updateEventSwitches", static: false, private: false, access: { has: obj => "_updateEventSwitches" in obj, get: obj => obj._updateEventSwitches, set: (obj, value) => { obj._updateEventSwitches = value; } }, metadata: _metadata }, __updateEventSwitches_initializers, __updateEventSwitches_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __updateScrollToLowerEventSwitches_decorators, { kind: "field", name: "_updateScrollToLowerEventSwitches", static: false, private: false, access: { has: obj => "_updateScrollToLowerEventSwitches" in obj, get: obj => obj._updateScrollToLowerEventSwitches, set: (obj, value) => { obj._updateScrollToLowerEventSwitches = value; } }, metadata: _metadata }, __updateScrollToLowerEventSwitches_initializers, __updateScrollToLowerEventSwitches_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleScrollEventsSwitches_decorators, { kind: "field", name: "_handleScrollEventsSwitches", static: false, private: false, access: { has: obj => "_handleScrollEventsSwitches" in obj, get: obj => obj._handleScrollEventsSwitches, set: (obj, value) => { obj._handleScrollEventsSwitches = value; } }, metadata: _metadata }, __handleScrollEventsSwitches_initializers, __handleScrollEventsSwitches_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleScrollToUpperEdgeEventEnable_decorators, { kind: "field", name: "_handleScrollToUpperEdgeEventEnable", static: false, private: false, access: { has: obj => "_handleScrollToUpperEdgeEventEnable" in obj, get: obj => obj._handleScrollToUpperEdgeEventEnable, set: (obj, value) => { obj._handleScrollToUpperEdgeEventEnable = value; } }, metadata: _metadata }, __handleScrollToUpperEdgeEventEnable_initializers, __handleScrollToUpperEdgeEventEnable_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleScrollToLowerEdgeEventEnable_decorators, { kind: "field", name: "_handleScrollToLowerEdgeEventEnable", static: false, private: false, access: { has: obj => "_handleScrollToLowerEdgeEventEnable" in obj, get: obj => obj._handleScrollToLowerEdgeEventEnable, set: (obj, value) => { obj._handleScrollToLowerEdgeEventEnable = value; } }, metadata: _metadata }, __handleScrollToLowerEdgeEventEnable_initializers, __handleScrollToLowerEdgeEventEnable_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'upper-threshold-item-count',
            'lower-threshold-item-count',
        ];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #getListContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#content');
        // The reason for using two observers is:
        // Using upper-threshold-item-count and lower-threshold-item-count configurations, it is possible that upper and lower observers monitor the same list-item.
        // Using the same observer, invoking callback event, it is impossible to confirm whether its source is upper or lower
        #upperObserver;
        #lowerObserver;
        // When list-item counts changes, Observer needs to be regenerated. Applicable to: Load More scenario
        #childrenObserver;
        #prevX = 0;
        #prevY = 0;
        #enableScrollEnd = false;
        #debounceScrollForMockingScrollEnd;
        #getUpperThresholdObserverDom = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#upper-threshold-observer');
        #getLowerThresholdObserverDom = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#lower-threshold-observer');
        #getScrollDetail() {
            const needVisibleItemInfo = this.#dom.getAttribute('need-visible-item-info') !== null;
            const { scrollTop, scrollLeft, scrollHeight, scrollWidth } = this
                .#getListContainer();
            const detail = {
                scrollTop,
                scrollLeft,
                scrollHeight,
                scrollWidth,
                deltaX: scrollLeft - this.#prevX,
                deltaY: scrollTop - this.#prevY,
                attachedCells: needVisibleItemInfo
                    ? this.#dom.getVisibleCells()
                    : undefined,
            };
            this.#prevX = scrollLeft;
            this.#prevY = scrollTop;
            return detail;
        }
        #handleUpperObserver = (entries) => {
            const { isIntersecting } = entries[0];
            if (isIntersecting) {
                this.#dom.dispatchEvent(new CustomEvent('scrolltoupper', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: this.#getScrollDetail(),
                }));
            }
        };
        _updateEventSwitches = (0,tslib_es6/* .__runInitializers */.zF)(this, __updateEventSwitches_initializers, (enableScrollToUpper) => {
            enableScrollToUpper
                ? this.#dom.setAttribute('x-enable-scrolltoupper-event', '')
                : this.#dom.removeAttribute('x-enable-scrolltoupper-event'); // css needs this;
            this.#eventSwitches.scrolltoupper = enableScrollToUpper;
            if (!enableScrollToUpper) {
                // if x-enable-scrolltoupper-event null, no need to handle upper-threshold-item-count
                if (this.#upperObserver) {
                    this.#upperObserver.disconnect();
                    this.#upperObserver = undefined;
                }
                if (this.#childrenObserver) {
                    this.#childrenObserver.disconnect();
                    this.#childrenObserver = undefined;
                }
            }
            else {
                if (!this.#upperObserver) {
                    this.#upperObserver = new IntersectionObserver(this.#handleUpperObserver, {
                        root: this.#getListContainer(),
                    });
                }
                if (!this.#childrenObserver) {
                    this.#childrenObserver = new MutationObserver(this.#handleChildrenObserver);
                }
                const upperThresholdItemCount = this.#dom.getAttribute('upper-threshold-item-count');
                const itemCount = upperThresholdItemCount !== null
                    ? parseFloat(upperThresholdItemCount)
                    : 0;
                const observerDom = itemCount === 0
                    ? this.#getUpperThresholdObserverDom()
                    : this.#dom.children[itemCount - 1];
                observerDom && this.#upperObserver.observe(observerDom);
                this.#childrenObserver.observe(this.#dom, {
                    childList: true,
                });
            }
        });
        _handleUpperThresholdItemCountChange(newValue, oldValue) {
            const oldItemCount = oldValue !== null
                ? parseFloat(oldValue)
                : 0;
            const oldObserverDom = oldItemCount === 0
                ? this.#getUpperThresholdObserverDom()
                : this.#dom.children[oldItemCount - 1];
            oldObserverDom && this.#upperObserver?.unobserve(oldObserverDom);
            const itemCount = newValue !== null
                ? parseFloat(newValue)
                : 0;
            const observerDom = itemCount === 0
                ? this.#getUpperThresholdObserverDom()
                : this.#dom.children[itemCount - 1];
            observerDom && this.#upperObserver?.observe(observerDom);
        }
        #handleLowerObserver = ((0,tslib_es6/* .__runInitializers */.zF)(this, __updateEventSwitches_extraInitializers), (entries) => {
            const { isIntersecting } = entries[0];
            if (isIntersecting) {
                this.#dom.dispatchEvent(new CustomEvent('scrolltolower', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: this.#getScrollDetail(),
                }));
            }
        });
        #eventSwitches = {
            lynxscroll: false,
            lynxscrollend: false,
            snap: false,
            scrolltolower: false,
            scrolltoupper: false,
        };
        _updateScrollToLowerEventSwitches = (0,tslib_es6/* .__runInitializers */.zF)(this, __updateScrollToLowerEventSwitches_initializers, (enableScrollToLower) => {
            this.#eventSwitches.scrolltolower = enableScrollToLower;
            enableScrollToLower
                ? this.#dom.setAttribute('x-enable-scrolltolower-event', '')
                : this.#dom.removeAttribute('x-enable-scrolltolower-event'); // css needs this;
            if (!enableScrollToLower) {
                if (this.#lowerObserver) {
                    this.#lowerObserver.disconnect();
                    this.#lowerObserver = undefined;
                }
                if (this.#childrenObserver) {
                    this.#childrenObserver.disconnect();
                    this.#childrenObserver = undefined;
                }
            }
            else {
                if (!this.#lowerObserver) {
                    this.#lowerObserver = new IntersectionObserver(this.#handleLowerObserver, {
                        root: this.#getListContainer(),
                    });
                }
                if (!this.#childrenObserver) {
                    this.#childrenObserver = new MutationObserver(this.#handleChildrenObserver);
                }
                const lowerThresholdItemCount = this.#dom.getAttribute('lower-threshold-item-count');
                const itemCount = lowerThresholdItemCount !== null
                    ? parseFloat(lowerThresholdItemCount)
                    : 0;
                const observerDom = itemCount === 0
                    ? this.#getLowerThresholdObserverDom()
                    : this.#dom.children[this.#dom.children.length
                        - itemCount];
                observerDom && this.#lowerObserver.observe(observerDom);
                this.#childrenObserver.observe(this.#dom, {
                    childList: true,
                });
            }
        });
        _handleLowerThresholdItemCountChange(newValue, oldValue) {
            const oldItemCount = oldValue !== null
                ? parseFloat(oldValue)
                : 0;
            const oldObserverDom = oldItemCount === 0
                ? this.#getLowerThresholdObserverDom()
                : this.#dom.children[this.#dom.children.length - oldItemCount];
            oldObserverDom && this.#lowerObserver?.unobserve(oldObserverDom);
            const itemCount = newValue !== null
                ? parseFloat(newValue)
                : 0;
            const observerDom = itemCount === 0
                ? this.#getLowerThresholdObserverDom()
                : this.#dom.children[this.#dom.children.length
                    - itemCount];
            observerDom && this.#lowerObserver?.observe(observerDom);
        }
        #handleChildrenObserver = ((0,tslib_es6/* .__runInitializers */.zF)(this, __updateScrollToLowerEventSwitches_extraInitializers), (mutationList) => {
            const mutation = mutationList?.[0];
            // reset upper and lower observers
            if (mutation?.type === 'childList') {
                if (this.#eventSwitches.scrolltolower) {
                    // The reason why unobserve cannot be used is that the structure of list-item has changed,
                    // and the list-item before the change cannot be obtained.
                    // so disconnect and reconnect is required.
                    if (this.#lowerObserver) {
                        this.#lowerObserver.disconnect();
                        this.#lowerObserver = undefined;
                    }
                    this.#lowerObserver = new IntersectionObserver(this.#handleLowerObserver, {
                        root: this.#getListContainer(),
                    });
                    const lowerThresholdItemCount = this.#dom.getAttribute('lower-threshold-item-count');
                    const itemCount = lowerThresholdItemCount !== null
                        ? parseFloat(lowerThresholdItemCount)
                        : 0;
                    const observerDom = itemCount === 0
                        ? this.#getLowerThresholdObserverDom()
                        : this.#dom.children[this.#dom.children.length
                            - itemCount];
                    observerDom && this.#lowerObserver.observe(observerDom);
                }
                if (this.#dom.getAttribute('x-enable-scrolltoupper-event') !== null) {
                    // The reason why unobserve cannot be used is that the structure of list-item has changed,
                    // and the list-item before the change cannot be obtained.
                    // so disconnect and reconnect is required.
                    if (this.#upperObserver) {
                        this.#upperObserver.disconnect();
                        this.#upperObserver = undefined;
                    }
                    this.#upperObserver = new IntersectionObserver(this.#handleUpperObserver, {
                        root: this.#getListContainer(),
                    });
                    const upperThresholdItemCount = this.#dom.getAttribute('upper-threshold-item-count');
                    const itemCount = upperThresholdItemCount !== null
                        ? parseFloat(upperThresholdItemCount)
                        : 0;
                    const observerDom = itemCount === 0
                        ? this.#getUpperThresholdObserverDom()
                        : this.#dom.children[itemCount - 1];
                    observerDom && this.#upperObserver.observe(observerDom);
                }
            }
        });
        #throttledScroll = null;
        #handleScroll = () => {
            if (this.#enableScrollEnd && !constants/* .useScrollEnd */.k) {
                // debounce
                clearTimeout(this.#debounceScrollForMockingScrollEnd);
                this.#debounceScrollForMockingScrollEnd = setTimeout(() => {
                    this.#handleScrollEnd();
                }, 100);
            }
            this.#dom.dispatchEvent(new CustomEvent('lynxscroll', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                detail: this.#getScrollDetail(),
            }));
        };
        _handleScrollEventsSwitches = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollEventsSwitches_initializers, (enabled, name) => {
            this.#eventSwitches[name] =
                enabled;
            const { lynxscroll, lynxscrollend, snap } = this.#eventSwitches;
            const scrollEventThrottle = this.#dom.getAttribute('scroll-event-throttle');
            this.#enableScrollEnd = lynxscrollend !== null || snap !== null;
            const listContainer = this.#getListContainer();
            // cancel the previous listener first
            this.#throttledScroll
                && listContainer.removeEventListener('scroll', this.#throttledScroll);
            if (lynxscroll !== null || this.#enableScrollEnd) {
                const wait = scrollEventThrottle !== null
                    ? parseFloat(scrollEventThrottle)
                    : 0;
                const throttledScroll = throttle(this.#handleScroll, wait, {
                    leading: true,
                    trailing: false,
                });
                this.#throttledScroll = throttledScroll;
                listContainer.addEventListener('scroll', this.#throttledScroll);
                this.#prevX = 0;
                this.#prevY = 0;
            }
            if (constants/* .useScrollEnd */.k && this.#enableScrollEnd) {
                listContainer.addEventListener('scrollend', this.#handleScrollEnd);
            }
            else {
                listContainer.removeEventListener('scrollend', this.#handleScrollEnd);
            }
        });
        #handleObserver = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollEventsSwitches_extraInitializers), (entries) => {
            const { isIntersecting, target } = entries[0];
            const id = target.id;
            if (isIntersecting) {
                if (id === 'upper-threshold-observer') {
                    this.#dom.dispatchEvent(new CustomEvent('scrolltoupperedge', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: this.#getScrollDetail(),
                    }));
                }
                else if (id === 'lower-threshold-observer') {
                    this.#dom.dispatchEvent(new CustomEvent('scrolltoloweredge', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: this.#getScrollDetail(),
                    }));
                }
            }
        });
        _handleScrollToUpperEdgeEventEnable = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollToUpperEdgeEventEnable_initializers, (enabled) => {
            enabled
                ? this.#dom.setAttribute('x-enable-scrolltoupperedge-event', '')
                : this.#dom.removeAttribute('x-enable-scrolltoupperedge-event'); // css needs this;
            this.#updateUpperEdgeIntersectionObserver(enabled);
        });
        #updateUpperEdgeIntersectionObserver = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollToUpperEdgeEventEnable_extraInitializers), bindToIntersectionObserver(this.#getListContainer, this.#getUpperThresholdObserverDom, this.#handleObserver));
        _handleScrollToLowerEdgeEventEnable = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollToLowerEdgeEventEnable_initializers, (enabled) => {
            enabled
                ? this.#dom.setAttribute('x-enable-scrolltoloweredge-event', '')
                : this.#dom.removeAttribute('x-enable-scrolltoloweredge-event'); // css needs this;
            this.#updateLowerEdgeIntersectionObserver(enabled);
        });
        #updateLowerEdgeIntersectionObserver = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleScrollToLowerEdgeEventEnable_extraInitializers), bindToIntersectionObserver(this.#getListContainer, this.#getLowerThresholdObserverDom, this.#handleObserver));
        #handleScrollEnd = () => {
            const itemSnap = this.#dom.getAttribute('item-snap');
            this.#dom.dispatchEvent(new CustomEvent('lynxscrollend', {
                ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
            }));
            if (itemSnap !== null) {
                const children = Array.from(this.#dom.children).filter(node => {
                    return node.tagName === 'LIST-ITEM';
                });
                const scrollTop = this.#getListContainer().scrollTop;
                const scrollLeft = this.#getListContainer().scrollLeft;
                const snapItem = children.find((ele) => {
                    return scrollTop >= ele.offsetTop
                        && scrollTop < ele.offsetTop + ele.offsetHeight;
                });
                this.#dom.dispatchEvent(new CustomEvent('snap', {
                    ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                    detail: {
                        position: snapItem && children.indexOf(snapItem),
                        scrollTop,
                        scrollLeft,
                    },
                }));
            }
        };
        constructor(dom) {
            this.#dom = dom;
        }
    };
})();

//# sourceMappingURL=XListEvents.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XList/XListWaterfall.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

const WATERFALL_SLOT = 'waterfall-slot';
const WATERFALL_STYLE = 'waterfall-style';
let XListWaterfall = (() => {
    let _instanceExtraInitializers = [];
    let __handleXEnableHeaderOffsetEvent_decorators;
    let __handlerListType_decorators;
    return class XListWaterfall {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleXEnableHeaderOffsetEvent_decorators = [(0,element_reactive/* .registerEventEnableStatusChangeHandler */.ZR)('scrolltolower')];
            __handlerListType_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('list-type', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleXEnableHeaderOffsetEvent_decorators, { kind: "method", name: "_handleXEnableHeaderOffsetEvent", static: false, private: false, access: { has: obj => "_handleXEnableHeaderOffsetEvent" in obj, get: obj => obj._handleXEnableHeaderOffsetEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handlerListType_decorators, { kind: "method", name: "_handlerListType", static: false, private: false, access: { has: obj => "_handlerListType" in obj, get: obj => obj._handlerListType }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['list-type'];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #getListContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#content');
        #getLowerThresholdObserver = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, 'div[part="lower-threshold-observer"]');
        #resizeObserver;
        #childrenObserver;
        _handleXEnableHeaderOffsetEvent(enableScrollToLower) {
            enableScrollToLower
                ? this.#dom.setAttribute('x-enable-scrolltolower-event', '')
                : this.#dom.removeAttribute('x-enable-scrolltolower-event'); // css needs this;
            if (enableScrollToLower) {
                const lower = this.#getLowerThresholdObserver();
                const scrollOrientation = this.#dom.getAttribute('scroll-orientation')
                    || 'vertical';
                const listContent = this.#getListContainer();
                // under waterfall, and when the list-item does not have a specified height, obtaining the correct scrollable value takes some time.
                setTimeout(() => {
                    if (scrollOrientation === 'vertical') {
                        lower.style.setProperty('top', 
                        // Firefox cannot trigger the bottom IntersectionObserver
                        `${String(listContent.scrollHeight - 1)}px`, 'important');
                        // Firefox needs this
                        lower.style.setProperty('bottom', 'unset', 'important');
                    }
                    else {
                        lower.style.setProperty('left', 
                        // Firefox cannot trigger the bottom IntersectionObserver
                        `${String(listContent.scrollWidth - 1)}px`, 'important');
                        // Firefox needs this
                        lower.style.setProperty('right', 'unset', 'important');
                    }
                }, 100);
            }
        }
        #createWaterfallContainer = () => {
            const waterfallSlot = document.createElement('slot');
            waterfallSlot.setAttribute('name', `${WATERFALL_SLOT}`);
            this.#dom.shadowRoot?.querySelector('[part=upper-threshold-observer]')
                ?.insertAdjacentElement('afterend', waterfallSlot);
        };
        #layoutListItem = () => {
            const spanCount = parseFloat(this.#dom.getAttribute('span-count')
                || this.#dom.getAttribute('column-count')
                || '') || 1;
            const isScrollVertical = (this.#dom.getAttribute('scroll-orientation')
                || 'vertical') === 'vertical';
            const measurements = new Array(spanCount).fill(0);
            for (let i = 0; i < this.#dom.children.length; i++) {
                const listItem = this.#dom.children[i];
                const mainAxisGap = getComputedStyle(listItem).getPropertyValue('--list-main-axis-gap');
                const crossAxisGap = getComputedStyle(listItem).getPropertyValue('--list-cross-axis-gap');
                const increasedMeasurement = isScrollVertical
                    ? listItem.getBoundingClientRect().height + parseFloat(mainAxisGap)
                    : listItem.getBoundingClientRect().width + parseFloat(mainAxisGap);
                if (listItem.getAttribute('full-span') !== null) {
                    let longestMeasurement = measurements[0];
                    // Find the longest track.
                    for (let j = 1; j < spanCount; j++) {
                        if (measurements[j] > longestMeasurement) {
                            longestMeasurement = measurements[j];
                        }
                    }
                    for (let j = 0; j < spanCount; j++) {
                        measurements[j] = longestMeasurement + increasedMeasurement;
                    }
                    if (isScrollVertical) {
                        listItem.setAttribute(`${WATERFALL_STYLE}-left`, '0');
                        listItem.setAttribute(`${WATERFALL_STYLE}-top`, `${longestMeasurement}px`);
                    }
                    else {
                        listItem.setAttribute(`${WATERFALL_STYLE}-left`, `${longestMeasurement}px`);
                        listItem.setAttribute(`${WATERFALL_STYLE}-top`, '0');
                    }
                }
                else {
                    let shortestIndex = 0;
                    let shortestMeasurement = measurements[0];
                    // Find the shortest track.
                    for (let j = 1; j < spanCount; j++) {
                        if (measurements[j] < shortestMeasurement) {
                            shortestIndex = j;
                            shortestMeasurement = measurements[j];
                        }
                    }
                    const crossOffset = `calc(${shortestIndex} * (100% - ${crossAxisGap} * (${spanCount} - 1))/ ${spanCount} + ${Math.max(0, shortestIndex)} * ${crossAxisGap})`;
                    if (isScrollVertical) {
                        listItem.setAttribute(`${WATERFALL_STYLE}-left`, crossOffset);
                        listItem.setAttribute(`${WATERFALL_STYLE}-top`, `${shortestMeasurement}px`);
                    }
                    else {
                        listItem.setAttribute(`${WATERFALL_STYLE}-left`, `${shortestMeasurement}px`);
                        listItem.setAttribute(`${WATERFALL_STYLE}-top`, crossOffset);
                    }
                    measurements[shortestIndex] += increasedMeasurement;
                }
            }
            for (let i = 0; i < this.#dom.children.length; i++) {
                const listItem = this.#dom.children[i];
                listItem.style.setProperty('left', listItem.getAttribute(`${WATERFALL_STYLE}-left`));
                listItem.style.setProperty('top', listItem.getAttribute(`${WATERFALL_STYLE}-top`));
                listItem.setAttribute('slot', WATERFALL_SLOT);
            }
        };
        constructor(dom) {
            this.#dom = dom;
        }
        #resizeObserverInit = () => {
            this.#resizeObserver?.disconnect();
            this.#resizeObserver = new ResizeObserver(() => {
                // may cause: Resizeobserver loop completed with undelivered notifications
                // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#observation_errors
                requestAnimationFrame(() => {
                    this.#layoutListItem();
                });
            });
            Array.from(this.#dom.children).forEach(element => {
                this.#resizeObserver?.observe(element);
            });
        };
        _handlerListType(newVal) {
            if (newVal === 'waterfall') {
                this.#createWaterfallContainer();
                if (!this.#resizeObserver) {
                    this.#resizeObserverInit();
                }
                if (!this.#childrenObserver) {
                    this.#childrenObserver = new MutationObserver((mutationList) => {
                        const mutation = mutationList?.[0];
                        if (mutation?.type === 'childList') {
                            this.#resizeObserverInit();
                        }
                    });
                    this.#childrenObserver.observe(this.#dom, {
                        childList: true,
                    });
                }
            }
            else {
                this.#resizeObserver?.disconnect();
                this.#resizeObserver = undefined;
                this.#childrenObserver?.disconnect();
                this.#childrenObserver = undefined;
                for (let i = 0; i < this.#dom.children.length; i++) {
                    const listItem = this.#dom.children[i];
                    listItem.removeAttribute('slot');
                }
                this.#dom.shadowRoot?.querySelector(`slot[name=${WATERFALL_SLOT}]`)
                    ?.remove();
            }
        }
    };
})();

//# sourceMappingURL=XListWaterfall.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XList/XList.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/








let XList_XList = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-list', [CommonEventsAndMethods/* .CommonEventsAndMethods */.O, XListAttributes, XListEvents, XListWaterfall], templateXList)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XList = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XList = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static notToFilterFalseAttributes = new Set(['enable-scroll']);
        #getListContainer = (0,element_reactive/* .genDomGetter */.Ut)(() => this.shadowRoot, '#content');
        #autoScrollOptions = {
            rate: 0,
            lastTimestamp: 0,
            autoStop: true,
            isScrolling: false,
        };
        #cellsMap = {};
        get scrollTop() {
            return this.#getListContainer().scrollTop;
        }
        set scrollTop(val) {
            this.#getListContainer().scrollTop = val;
        }
        get scrollLeft() {
            return this.#getListContainer().scrollLeft;
        }
        set scrollLeft(val) {
            this.#getListContainer().scrollLeft = val;
        }
        get scrollHeight() {
            return this.#getListContainer().scrollHeight;
        }
        get scrollWidth() {
            return this.#getListContainer().scrollWidth;
        }
        get [constants/* .scrollContainerDom */.l]() {
            return this.#getListContainer();
        }
        get __scrollTop() {
            return super.scrollTop;
        }
        get __scrollLeft() {
            return super.scrollLeft;
        }
        scrollToPosition(params) {
            let offset;
            if (typeof params.offset === 'string') {
                const offsetValue = parseFloat(params.offset);
                offset = { left: offsetValue, top: offsetValue };
            }
            else if (typeof params.offset === 'number') {
                offset = { left: params.offset, top: params.offset };
            }
            if (typeof params.position === 'number') {
                if (params.position === 0) {
                    this.#getListContainer().scrollTop = 0;
                    this.#getListContainer().scrollLeft = 0;
                }
                else if (params.position > 0 && params.position < this.childElementCount) {
                    const targetKid = this.children.item(params.position);
                    if (targetKid instanceof HTMLElement) {
                        if (offset) {
                            offset = {
                                left: targetKid.offsetLeft + offset.left,
                                top: targetKid.offsetTop + offset.top,
                            };
                        }
                        else {
                            offset = { left: targetKid.offsetLeft, top: targetKid.offsetTop };
                        }
                    }
                }
            }
            if (offset) {
                this.#getListContainer().scrollTo({
                    ...offset,
                    behavior: params.smooth ? 'smooth' : 'auto',
                });
            }
        }
        #autoScroll = (timestamp) => {
            if (!this.#autoScrollOptions.isScrolling) {
                return;
            }
            if (!this.#autoScrollOptions.lastTimestamp) {
                this.#autoScrollOptions.lastTimestamp = timestamp;
                requestAnimationFrame(this.#autoScroll);
                return;
            }
            const scrollContainer = this.#getListContainer();
            const deltaTime = timestamp - this.#autoScrollOptions.lastTimestamp;
            const tickDistance = (deltaTime / 1000) * this.#autoScrollOptions.rate;
            const isScrollVertical = (this.getAttribute('scroll-orientation')
                || 'vertical') === 'vertical';
            scrollContainer.scrollBy({
                left: isScrollVertical ? 0 : tickDistance,
                top: isScrollVertical ? tickDistance : 0,
                // smooth might cause lag when scrolling.
                behavior: 'auto',
            });
            this.#autoScrollOptions.lastTimestamp = timestamp;
            const isContainerScrollable = isScrollVertical
                ? scrollContainer.scrollTop + scrollContainer.clientHeight
                    >= scrollContainer.scrollHeight
                : scrollContainer.scrollLeft + scrollContainer.clientWidth
                    >= scrollContainer.scrollWidth;
            if (isContainerScrollable && this.#autoScrollOptions.autoStop) {
                if (isScrollVertical) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight
                        - scrollContainer.clientHeight;
                }
                else {
                    scrollContainer.scrollLeft = scrollContainer.scrollWidth
                        - scrollContainer.clientWidth;
                }
                this.#autoScrollOptions.isScrolling = false;
            }
            else {
                requestAnimationFrame(this.#autoScroll);
            }
        };
        autoScroll(params) {
            if (params.start) {
                const rate = typeof params.rate === 'number'
                    ? params.rate
                    : parseFloat(params.rate);
                this.#autoScrollOptions = {
                    rate,
                    lastTimestamp: 0,
                    isScrolling: true,
                    autoStop: params.autoStop !== false ? true : false,
                };
                const scrollContainer = this.#getListContainer();
                const isScrollVertical = (this.getAttribute('scroll-orientation')
                    || 'vertical') === 'vertical';
                const isContainerScrollable = isScrollVertical
                    ? scrollContainer.clientHeight <= scrollContainer.scrollHeight
                    : scrollContainer.clientWidth <= scrollContainer.scrollWidth;
                this.#autoScrollOptions.lastTimestamp = 0;
                if (isContainerScrollable) {
                    // During the initial render, there might be instances in raq where scrollContainer hasn't fully expanded (rendering hasn't succeeded yet), so use setTimeout.
                    setTimeout(() => requestAnimationFrame(this.#autoScroll), 0);
                }
                else {
                    requestAnimationFrame(this.#autoScroll);
                }
            }
            else {
                this.#autoScrollOptions.isScrolling = false;
            }
        }
        getScrollContainerInfo() {
            return {
                scrollTop: this.scrollTop,
                scrollLeft: this.scrollLeft,
                scrollHeight: this.scrollHeight,
                scrollWidth: this.scrollWidth,
            };
        }
        getVisibleCells = () => {
            let cells = Object.values(this.#cellsMap);
            const children = Array.from(this.children).filter((node) => {
                return node.tagName === 'LIST-ITEM';
            });
            // firfox cannot triiger contentvisibilityautostatechange event of list-item
            if (cells.length === 0) {
                const listRect = this.#getListContainer().getBoundingClientRect();
                cells = children.filter((cell) => {
                    const rect = cell.getBoundingClientRect();
                    return (rect.bottom >= listRect.top
                        && rect.top <= listRect.bottom
                        && rect.right >= listRect.left
                        && rect.left <= listRect.right);
                });
            }
            return cells.map((cell) => {
                const rect = cell.getBoundingClientRect();
                return {
                    id: cell.getAttribute('id'),
                    itemKey: cell.getAttribute('item-key'),
                    bottom: rect.bottom,
                    top: rect.top,
                    left: rect.left,
                    right: rect.right,
                    index: children.indexOf(cell),
                };
            });
        };
        #getListItemInfo = () => {
            const cells = Object.values(this.#cellsMap);
            return cells.map(cell => {
                const rect = cell.getBoundingClientRect();
                return {
                    height: rect.height,
                    width: rect.width,
                    itemKey: cell.getAttribute('item-key'),
                    originX: rect.x,
                    originY: rect.y,
                };
            });
        };
        #contentVisibilityChange = (event) => {
            if (!event.target || !(event.target instanceof HTMLElement)) {
                return;
            }
            const skipped = event.skipped;
            const isContent = event.target?.getAttribute('id') === 'content'
                && event.target?.getAttribute('part') === 'content';
            const isListItem = event.target.tagName === 'LIST-ITEM';
            if (isContent && !skipped) {
                const visibleItemBeforeUpdate = this.#getListItemInfo();
                setTimeout(() => {
                    this.dispatchEvent(new CustomEvent('layoutcomplete', {
                        ...commonEventInitConfiguration/* .commonComponentEventSetting */.$,
                        detail: {
                            visibleItemBeforeUpdate,
                            visibleItemAfterUpdate: this.#getListItemInfo(),
                        },
                    }));
                    // Set 100 is because #content is the parent container of list-item, and content is always visible before list-item.
                    // We cannot obtain the timing of all the successfully visible list-items on the screen, so 100ms is used to delay this behavior.
                }, 100);
                return;
            }
            if (isListItem) {
                const itemKey = event.target?.getAttribute('item-key');
                if (!itemKey) {
                    return;
                }
                if (skipped) {
                    this.#cellsMap[itemKey] && delete this.#cellsMap[itemKey];
                }
                else {
                    this.#cellsMap[itemKey] = event.target;
                }
                return;
            }
        };
        connectedCallback() {
            const listContainer = this.#getListContainer();
            listContainer.addEventListener('contentvisibilityautostatechange', this.#contentVisibilityChange, {
                passive: true,
            });
        }
        static {
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XList = _classThis;
})();

//# sourceMappingURL=XList.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XList/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * @module elements/XList
 *
 * `x-list` provides a scalable list container, supporting waterflow layout.
 *
 * Attributes:
 * - `list-type`: 'single' | 'flow' | 'waterfall'.
 * - `span-count` / `column-count`: Columns in waterfall/flow.
 * - `sticky-offset`: Top offset for sticky items.
 * - `scroll-orientation`: 'vertical' | 'horizontal'.
 * - `upper-threshold-item-count`: Items from top to trigger `scrolltoupper`.
 * - `lower-threshold-item-count`: Items from bottom to trigger `scrolltolower`.
 * - `initial-scroll-index`: Initial scroll index.
 *
 * Events:
 * - `scrolltoupper`: Reached top threshold.
 * - `scrolltolower`: Reached bottom threshold.
 * - `scroll`: Fired on scroll.
 * - `scrollend`: Fired when scrolling stops.
 * - `snap`: Fired on scroll snap.
 *
 * Methods:
 * - `scrollToPosition({ position, offset, smooth })`: Scrolls to index.
 * - `autoScroll({ rate, start, autoStop })`: Auto-scrolling.
 *
 * CSS:
 * - `list-type="flow"` uses `display: grid`.
 * - `list-type="waterfall"` uses `display: flex` (column) / `display: row` with absolute positioning for items.
 * - `sticky` items use `position: sticky`.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XWebView/XWebViewAttribute.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

let XWebViewAttribute = (() => {
    let __handleSrc_decorators;
    let __handleSrc_initializers = [];
    let __handleSrc_extraInitializers = [];
    let __handleHtml_decorators;
    let __handleHtml_initializers = [];
    let __handleHtml_extraInitializers = [];
    return class XWebViewAttribute {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleSrc_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('src', true)];
            __handleHtml_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('html', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleSrc_decorators, { kind: "field", name: "_handleSrc", static: false, private: false, access: { has: obj => "_handleSrc" in obj, get: obj => obj._handleSrc, set: (obj, value) => { obj._handleSrc = value; } }, metadata: _metadata }, __handleSrc_initializers, __handleSrc_extraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(null, null, __handleHtml_decorators, { kind: "field", name: "_handleHtml", static: false, private: false, access: { has: obj => "_handleHtml" in obj, get: obj => obj._handleHtml, set: (obj, value) => { obj._handleHtml = value; } }, metadata: _metadata }, __handleHtml_initializers, __handleHtml_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = ['src', 'html'];
        #dom;
        #getWebView = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#webview');
        constructor(dom) {
            (0,tslib_es6/* .__runInitializers */.zF)(this, __handleHtml_extraInitializers);
            this.#dom = dom;
        }
        _handleSrc = (0,tslib_es6/* .__runInitializers */.zF)(this, __handleSrc_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getWebView, 'src'));
        _handleHtml = ((0,tslib_es6/* .__runInitializers */.zF)(this, __handleSrc_extraInitializers), (0,tslib_es6/* .__runInitializers */.zF)(this, __handleHtml_initializers, (0,element_reactive/* .bindToAttribute */.H$)(this.#getWebView, 'srcdoc')));
    };
})();

//# sourceMappingURL=XWebViewAttribute.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XWebView/XWebView.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




let XWebView_XWebView = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-webview', [CommonEventsAndMethods/* .CommonEventsAndMethods */.O, XWebViewAttribute], templateXWebView)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XWebView = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XWebView = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
        #getWebView = (0,element_reactive/* .genDomGetter */.Ut)(() => this.shadowRoot, '#webview');
        /**
         * @internal
         */
        #handleLoad = () => {
            this.dispatchEvent(new CustomEvent('load', {
                bubbles: true,
                composed: true,
                detail: {
                    url: this.#getWebView().src,
                },
            }));
            this.dispatchEvent(new CustomEvent('bindload', {
                bubbles: true,
                composed: true,
                detail: {
                    url: this.#getWebView().src,
                },
            }));
        };
        /**
         * @internal
         */
        #handleError = (e) => {
            this.dispatchEvent(new CustomEvent('error', {
                bubbles: true,
                composed: true,
                detail: {
                    errorMsg: e.message || 'unknown error',
                },
            }));
            this.dispatchEvent(new CustomEvent('binderror', {
                bubbles: true,
                composed: true,
                detail: {
                    errorMsg: e.message || 'unknown error',
                },
            }));
        };
        /**
         * @internal
         */
        #handleMessage = (e) => {
            if (e.source !== this.#getWebView().contentWindow) {
                return;
            }
            this.dispatchEvent(new CustomEvent('message', {
                bubbles: true,
                composed: true,
                detail: {
                    msg: e.data, // compatible with bindmessage
                    data: e.data, // standard CustomEvent
                },
            }));
            this.dispatchEvent(new CustomEvent('bindmessage', {
                bubbles: true,
                composed: true,
                detail: {
                    msg: e.data,
                },
            }));
        };
        connectedCallback() {
            this.#getWebView().addEventListener('load', this.#handleLoad);
            this.#getWebView().addEventListener('error', this.#handleError);
            window.addEventListener('message', this.#handleMessage);
        }
        disconnectedCallback() {
            this.#getWebView().removeEventListener('load', this.#handleLoad);
            this.#getWebView().removeEventListener('error', this.#handleError);
            window.removeEventListener('message', this.#handleMessage);
        }
        get src() {
            return this.getAttribute('src');
        }
        set src(val) {
            if (val === null) {
                this.removeAttribute('src');
            }
            else {
                this.setAttribute('src', val);
            }
        }
        get html() {
            return this.getAttribute('html');
        }
        set html(val) {
            if (val === null) {
                this.removeAttribute('html');
            }
            else {
                this.setAttribute('html', val);
            }
        }
        reload() {
            // eslint-disable-next-line no-self-assign
            this.#getWebView().src = this.#getWebView().src;
        }
    };
    return XWebView = _classThis;
})();

//# sourceMappingURL=XWebView.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XWebView/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/XWebView
 *
 * `x-webview` provides a web container that allows loading web pages.
 *
 * Attributes:
 * - `src`: The URL of the web page to load.
 * - `html`: The HTML content to load (via srcdoc).
 *
 * Events:
 * - `bindload`: Fired when the page loads. Detail: `{ url }`.
 * - `binderror`: Fired when an error occurs. Detail: `{ errorMsg }`.
 * - `message`: Fired when the page posts a message to its parent. Detail:
 *   `{ msg, data }`.
 * - `bindmessage`: Fired when a message is received from the page. Detail: `{ msg }`.
 *
 * Methods:
 * - `reload()`: Reloads the current page.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XMarkdown/XMarkdownAttributes.js


let MarkdownItLoaded;
let DOMPurifyLoaded;
let depsLoading;
let depsLoaded = false;
let depsError;
const loadDeps = () => {
    if (depsLoaded)
        return Promise.resolve();
    if (depsLoading)
        return depsLoading;
    depsLoading = __webpack_require__.e(/* import() | xmarkdown-deps */ 166).then(__webpack_require__.bind(__webpack_require__, 5102)).then((deps) => {
        MarkdownItLoaded = deps.MarkdownIt;
        DOMPurifyLoaded = deps.createDOMPurify;
        depsLoaded = true;
    }).catch((err) => {
        depsError = err;
    });
    return depsLoading;
};
const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
const escapeHtmlAttr = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;');
const decodeHtmlEntities = (value) => value
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&apos;', '\'')
    .replaceAll('&#39;', '\'')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
const normalizeClassList = (value) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    const safe = parts.filter((part) => /^[A-Za-z0-9_-]+$/.test(part));
    return safe.join(' ');
};
const sanitizeAllowedHtml = (value) => {
    if (!value)
        return value;
    if (value.includes('<!--')
        || value.includes('<!')
        || value.includes('<?')
        || value.includes('<%')) {
        return escapeHtml(value);
    }
    const tagNameRe = /<\s*\/?\s*([A-Za-z][\w-]*)\b[^>]*>/g;
    let match = null;
    let hasTag = false;
    while ((match = tagNameRe.exec(value))) {
        hasTag = true;
        const name = (match[1] ?? '').toLowerCase();
        if (name !== 'span' && name !== 'p') {
            return escapeHtml(value);
        }
    }
    if (!hasTag) {
        return value.includes('<') ? escapeHtml(value) : value;
    }
    const openTagRe = /<(span|p)\b([^>]*?)(\/?)>/gi;
    return value.replace(openTagRe, (_m, rawName, rawAttrs, rawSelfClose) => {
        const name = String(rawName).toLowerCase();
        const attrs = decodeHtmlEntities(String(rawAttrs ?? ''));
        const classMatch = /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
        const rawClass = (classMatch?.[1] ?? classMatch?.[2] ?? classMatch?.[3])
            ?? '';
        const normalized = normalizeClassList(rawClass);
        const classAttr = normalized
            ? ` class="${escapeHtmlAttr(normalized)}"`
            : '';
        const selfClose = String(rawSelfClose ?? '') === '/';
        if (selfClose)
            return `<${name}${classAttr}></${name}>`;
        return `<${name}${classAttr}>`;
    });
};
const applyRawHtmlPolicy = (tokens) => {
    for (const token of tokens) {
        if (token?.type === 'html_inline' || token?.type === 'html_block') {
            token.content = sanitizeAllowedHtml(String(token.content ?? ''));
        }
        if (Array.isArray(token?.children)) {
            applyRawHtmlPolicy(token.children);
        }
    }
};
const renderMarkdown = (parser, content) => {
    const env = {};
    const tokens = parser.parse(content, env);
    applyRawHtmlPolicy(tokens);
    return parser.renderer.render(tokens, parser.options, env);
};
let markdownParser = null;
let markdownParserError;
let htmlSanitizer = null;
const getMarkdownParser = () => {
    if (markdownParser || markdownParserError)
        return markdownParser;
    if (!MarkdownItLoaded)
        return null;
    try {
        markdownParser = new MarkdownItLoaded({
            html: true,
            linkify: true,
        });
        markdownParser.enable(['table', 'strikethrough']);
    }
    catch (error) {
        markdownParserError = error;
    }
    return markdownParser;
};
const getHtmlSanitizer = () => {
    if (htmlSanitizer)
        return htmlSanitizer;
    if (!DOMPurifyLoaded)
        return null;
    htmlSanitizer = DOMPurifyLoaded(window);
    return htmlSanitizer;
};
const sanitizeHtml = (value) => {
    const sanitizer = getHtmlSanitizer();
    if (!sanitizer)
        return value;
    return sanitizer.sanitize(value, {
        USE_PROFILES: { html: true },
    });
};
const emptySelectionDetail = () => ({
    start: -1,
    end: -1,
    direction: 'forward',
});
const getComposedRange = (selection, shadowRoot) => {
    const getComposedRanges = selection
        .getComposedRanges;
    if (!shadowRoot || typeof getComposedRanges !== 'function')
        return null;
    try {
        return getComposedRanges.call(selection, {
            shadowRoots: [shadowRoot],
        })[0] ?? null;
    }
    catch {
        try {
            return getComposedRanges.call(selection, shadowRoot)[0] ?? null;
        }
        catch {
            return null;
        }
    }
};
const createRangeByOffsets = (doc, root, start, end) => {
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let pos = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;
    let node = walker.nextNode();
    while (node) {
        const len = node.nodeValue?.length ?? 0;
        if (!startNode && pos + len >= start) {
            startNode = node;
            startOffset = start - pos;
        }
        if (pos + len >= end) {
            endNode = node;
            endOffset = end - pos;
            break;
        }
        pos += len;
        node = walker.nextNode();
    }
    if (!startNode)
        return null;
    if (!endNode) {
        endNode = startNode;
        endOffset = startOffset;
    }
    const range = doc.createRange();
    range.setStart(startNode, Math.max(0, Math.min(startOffset, startNode.length)));
    range.setEnd(endNode, Math.max(0, Math.min(endOffset, endNode.length)));
    return range;
};
const isSelectionNodeInsideHost = (dom, shadowRoot, node) => !!node
    && (node === dom
        || node === shadowRoot
        || dom.contains(node)
        || !!shadowRoot?.contains(node));
const getRangeInRoot = (doc, dom, root, shadowRoot, selection) => {
    if (!selection)
        return null;
    const sourceRange = getComposedRange(selection, shadowRoot)
        ?? (selection.rangeCount > 0 ? selection.getRangeAt(0) : null);
    if (!sourceRange)
        return null;
    if (!root.contains(sourceRange.startContainer)
        || !root.contains(sourceRange.endContainer)) {
        if (!isSelectionNodeInsideHost(dom, shadowRoot, sourceRange.startContainer)
            || !isSelectionNodeInsideHost(dom, shadowRoot, sourceRange.endContainer)
            || !isSelectionNodeInsideHost(dom, shadowRoot, selection.anchorNode)
            || !isSelectionNodeInsideHost(dom, shadowRoot, selection.focusNode)) {
            return null;
        }
        const selectedText = selection.toString();
        if (!selectedText) {
            return null;
        }
        const start = root.textContent?.indexOf(selectedText) ?? -1;
        if (start < 0)
            return null;
        return createRangeByOffsets(doc, root, start, start + selectedText.length);
    }
    const range = doc.createRange();
    range.setStart(sourceRange.startContainer, sourceRange.startOffset);
    range.setEnd(sourceRange.endContainer, sourceRange.endOffset);
    return range;
};
const getBoundaryOffset = (doc, root, node, offset) => {
    if (!node || !root.contains(node))
        return null;
    const range = doc.createRange();
    range.selectNodeContents(root);
    try {
        range.setEnd(node, offset);
    }
    catch {
        return null;
    }
    return range.toString().length;
};
const XMarkdownAttributes_getSelectionDetail = (dom, root) => {
    const doc = dom.ownerDocument;
    const shadowRoot = dom.shadowRoot;
    const shadowSelection = shadowRoot?.getSelection?.()
        ?? null;
    const documentSelection = doc.getSelection();
    const selectionCandidates = [
        shadowSelection,
        documentSelection,
    ].filter((selection, index, selections) => !!selection && selections.indexOf(selection) === index);
    let range = null;
    let selection = null;
    for (const candidate of selectionCandidates) {
        const nextRange = getRangeInRoot(doc, dom, root, shadowRoot, candidate);
        if (nextRange && !nextRange.collapsed) {
            range = nextRange;
            selection = candidate;
            break;
        }
    }
    if (!range || !selection) {
        return emptySelectionDetail();
    }
    const start = getBoundaryOffset(doc, root, range.startContainer, range.startOffset);
    const end = getBoundaryOffset(doc, root, range.endContainer, range.endOffset);
    if (start === null || end === null || start === end) {
        return emptySelectionDetail();
    }
    const anchor = getBoundaryOffset(doc, root, selection.anchorNode, selection.anchorOffset);
    const focus = getBoundaryOffset(doc, root, selection.focusNode, selection.focusOffset);
    return {
        start: Math.min(start, end),
        end: Math.max(start, end),
        direction: anchor !== null && focus !== null && anchor > focus
            ? 'backward'
            : 'forward',
    };
};
const preprocessInlineView = (html) => html.replace(/src\s*=\s*"inlineview:\/\/([^"]+)"/g, (_m, id) => `data-inlineview="${id}"`);
const unitlessCssProperties = new Set([
    'font-weight',
    'opacity',
    'z-index',
    'flex',
    'flex-grow',
    'flex-shrink',
    'order',
]);
const selectorMap = {
    normalText: '.markdown-body',
    link: '.markdown-body a',
    inlineCode: '.markdown-body code:not(pre code)',
    codeBlock: ['.markdown-body pre', '.markdown-body pre code'],
    h1: '.markdown-body h1',
    h2: '.markdown-body h2',
    h3: '.markdown-body h3',
    h4: '.markdown-body h4',
    h5: '.markdown-body h5',
    h6: '.markdown-body h6',
    quote: '.markdown-body blockquote',
    orderedList: '.markdown-body ol',
    unorderedList: '.markdown-body ul',
    listItem: '.markdown-body li',
    image: '.markdown-body img',
    span: '.markdown-body span',
    p: '.markdown-body p',
    // Extended selectors
    table: '.markdown-body table',
    thead: '.markdown-body thead',
    tbody: '.markdown-body tbody',
    tr: '.markdown-body tr',
    th: '.markdown-body th',
    td: '.markdown-body td',
    imageCaption: '.markdown-body .md-image-caption',
};
const normalizeColor = (value) => {
    const hex = value.trim();
    if (/^[0-9a-fA-F]{6,8}$/.test(hex)) {
        return `#${hex}`;
    }
    return value;
};
const camelToKebab = (value) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const toCssValue = (property, value) => {
    if (value === null || value === undefined)
        return null;
    if (typeof value === 'number') {
        return unitlessCssProperties.has(property) ? `${value}` : `${value}px`;
    }
    if (typeof value === 'string') {
        if (property.includes('color')) {
            return normalizeColor(value);
        }
        return value;
    }
    return null;
};
const parseMarkdownStyle = (value) => {
    if (!value)
        return {};
    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object') {
            return parsed;
        }
    }
    catch {
        return {};
    }
    return {};
};
const serializeMarkdownStyle = (value) => {
    if (value === null || value === undefined)
        return null;
    return typeof value === 'string' ? value : JSON.stringify(value);
};
const buildMarkdownStyleCss = (style) => {
    const rules = [];
    for (const [key, properties] of Object.entries(style)) {
        if (!properties || typeof properties !== 'object')
            continue;
        let selectors = [];
        if (key.startsWith('.') || key.startsWith('#')) {
            selectors = [`.markdown-body ${key}`];
        }
        else if (selectorMap[key]) {
            selectors = Array.isArray(selectorMap[key])
                ? selectorMap[key]
                : [selectorMap[key]];
        }
        else {
            continue;
        }
        const declarations = Object.entries(properties)
            .map(([property, value]) => {
            const cssProperty = camelToKebab(property);
            const cssValue = toCssValue(cssProperty, value);
            return cssValue ? `${cssProperty}: ${cssValue};` : null;
        })
            .filter(Boolean)
            .join('');
        if (!declarations)
            continue;
        for (const selector of selectors) {
            rules.push(`${selector} {${declarations}}`);
        }
    }
    return rules.join('\n');
};
let XMarkdownAttributes = (() => {
    let _instanceExtraInitializers = [];
    let __handleContent_decorators;
    let __handleMarkdownEffect_decorators;
    let __handleMarkdownStyle_decorators;
    let __handleContentId_decorators;
    let __handleTextSelection_decorators;
    let __handleAnimationType_decorators;
    let __handleAnimationVelocity_decorators;
    let __handleAnimationPaused_decorators;
    let __handleInitialAnimationStep_decorators;
    let __handleContentComplete_decorators;
    let __handleTypewriterDynamicHeight_decorators;
    let __handleTypewriterHeightTransition_decorators;
    let __handleTextMaxline_decorators;
    let __handleContentRange_decorators;
    return class XMarkdownAttributes {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __handleContent_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('content', true)];
            __handleMarkdownEffect_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('markdown-effect', true)];
            __handleMarkdownStyle_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('markdown-style', true)];
            __handleContentId_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('content-id', true)];
            __handleTextSelection_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('text-selection', true)];
            __handleAnimationType_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('animation-type', true)];
            __handleAnimationVelocity_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('animation-velocity', true)];
            __handleAnimationPaused_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('animation-paused', true)];
            __handleInitialAnimationStep_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('initial-animation-step', true)];
            __handleContentComplete_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('content-complete', true)];
            __handleTypewriterDynamicHeight_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('typewriter-dynamic-height', true)];
            __handleTypewriterHeightTransition_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('typewriter-height-transition-duration', true)];
            __handleTextMaxline_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('text-maxline', true)];
            __handleContentRange_decorators = [(0,element_reactive/* .registerAttributeHandler */._y)('content-range', true)];
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleContent_decorators, { kind: "method", name: "_handleContent", static: false, private: false, access: { has: obj => "_handleContent" in obj, get: obj => obj._handleContent }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleMarkdownEffect_decorators, { kind: "method", name: "_handleMarkdownEffect", static: false, private: false, access: { has: obj => "_handleMarkdownEffect" in obj, get: obj => obj._handleMarkdownEffect }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleMarkdownStyle_decorators, { kind: "method", name: "_handleMarkdownStyle", static: false, private: false, access: { has: obj => "_handleMarkdownStyle" in obj, get: obj => obj._handleMarkdownStyle }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleContentId_decorators, { kind: "method", name: "_handleContentId", static: false, private: false, access: { has: obj => "_handleContentId" in obj, get: obj => obj._handleContentId }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleTextSelection_decorators, { kind: "method", name: "_handleTextSelection", static: false, private: false, access: { has: obj => "_handleTextSelection" in obj, get: obj => obj._handleTextSelection }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleAnimationType_decorators, { kind: "method", name: "_handleAnimationType", static: false, private: false, access: { has: obj => "_handleAnimationType" in obj, get: obj => obj._handleAnimationType }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleAnimationVelocity_decorators, { kind: "method", name: "_handleAnimationVelocity", static: false, private: false, access: { has: obj => "_handleAnimationVelocity" in obj, get: obj => obj._handleAnimationVelocity }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleAnimationPaused_decorators, { kind: "method", name: "_handleAnimationPaused", static: false, private: false, access: { has: obj => "_handleAnimationPaused" in obj, get: obj => obj._handleAnimationPaused }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleInitialAnimationStep_decorators, { kind: "method", name: "_handleInitialAnimationStep", static: false, private: false, access: { has: obj => "_handleInitialAnimationStep" in obj, get: obj => obj._handleInitialAnimationStep }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleContentComplete_decorators, { kind: "method", name: "_handleContentComplete", static: false, private: false, access: { has: obj => "_handleContentComplete" in obj, get: obj => obj._handleContentComplete }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleTypewriterDynamicHeight_decorators, { kind: "method", name: "_handleTypewriterDynamicHeight", static: false, private: false, access: { has: obj => "_handleTypewriterDynamicHeight" in obj, get: obj => obj._handleTypewriterDynamicHeight }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleTypewriterHeightTransition_decorators, { kind: "method", name: "_handleTypewriterHeightTransition", static: false, private: false, access: { has: obj => "_handleTypewriterHeightTransition" in obj, get: obj => obj._handleTypewriterHeightTransition }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleTextMaxline_decorators, { kind: "method", name: "_handleTextMaxline", static: false, private: false, access: { has: obj => "_handleTextMaxline" in obj, get: obj => obj._handleTextMaxline }, metadata: _metadata }, null, _instanceExtraInitializers);
            (0,tslib_es6/* .__esDecorate */.G4)(this, null, __handleContentRange_decorators, { kind: "method", name: "_handleContentRange", static: false, private: false, access: { has: obj => "_handleContentRange" in obj, get: obj => obj._handleContentRange }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [
            'content',
            'markdown-style',
            'content-id',
            // Optional: allow enabling text selection within content
            'text-selection',
            // Typewriter / animation
            'animation-type',
            'animation-velocity',
            'animation-paused',
            'initial-animation-step',
            'content-complete',
            'typewriter-dynamic-height',
            'typewriter-height-transition-duration',
            // Overflow
            'text-maxline',
            // Range rendering
            'content-range',
            // Effect
            'markdown-effect',
        ];
        #dom = (0,tslib_es6/* .__runInitializers */.zF)(this, _instanceExtraInitializers);
        #root = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#markdown-root');
        #style = (0,element_reactive/* .genDomGetter */.Ut)(() => this.#dom.shadowRoot, '#markdown-style');
        #pendingRender = false;
        #content = '';
        #renderedContent = '';
        #contentId;
        #eventsAttached = false;
        #selectionEventAttached = false;
        #appendRemainder = '';
        #appendFlushTimer;
        #appendFlushDelay = 60;
        #currentMarkdownCss = '';
        #textSelection = false;
        #selectionSyncTimer;
        #lastSelectionSignature;
        #truncationConfig = null;
        #truncationEl;
        // Typewriter state
        #animationType = 'none';
        #animationVelocity = 40; // chars per second
        #animationTimer;
        #animationStep = 0;
        #animationStarted = false;
        #animationPaused = false;
        #contentComplete = true;
        #maxAnimationStep = 0;
        #typewriterDynamicHeight = false;
        #typewriterHeightTransition = 0; // seconds
        #typewriterCursorConfig = null;
        #typewriterCursorEl;
        // Overflow state
        #textMaxline = 0;
        #overflowEmitted = false;
        // Range rendering: inclusive [start, end)
        #contentRange;
        // Markdown effect
        #markdownEffect = null;
        constructor(dom) {
            this.#dom = dom;
        }
        connectedCallback() {
            this.#ensureEvents();
        }
        dispose() {
            this.#clearAppendFlushTimer();
            this.#stopTypewriterTimer();
            clearTimeout(this.#selectionSyncTimer);
            this.#selectionSyncTimer = undefined;
            if (this.#eventsAttached) {
                const root = this.#root();
                root.removeEventListener('click', this.#handleClick);
                this.#eventsAttached = false;
            }
            if (this.#selectionEventAttached) {
                document.removeEventListener('selectionchange', this.#handleSelectionChange);
                document.removeEventListener('mouseup', this.#handleSelectionGestureEnd);
                document.removeEventListener('touchend', this.#handleSelectionGestureEnd);
                document.removeEventListener('keyup', this.#handleSelectionGestureEnd);
                this.#selectionEventAttached = false;
            }
        }
        #ensureEvents() {
            if (this.#eventsAttached)
                return;
            const root = this.#root();
            root.addEventListener('click', this.#handleClick);
            this.#eventsAttached = true;
            if (!this.#selectionEventAttached) {
                document.addEventListener('selectionchange', this.#handleSelectionChange);
                document.addEventListener('mouseup', this.#handleSelectionGestureEnd);
                document.addEventListener('touchend', this.#handleSelectionGestureEnd);
                document.addEventListener('keyup', this.#handleSelectionGestureEnd);
                this.#selectionEventAttached = true;
            }
        }
        #handleClick = (event) => {
            const target = event.target;
            if (!target)
                return;
            const root = this.#root();
            const anchor = target.closest('a');
            if (anchor && root.contains(anchor)) {
                event.preventDefault();
                this.#dom.dispatchEvent(new CustomEvent('bindlink', {
                    detail: {
                        url: anchor.getAttribute('href') ?? '',
                        content: anchor.textContent ?? '',
                        contentId: this.#contentId,
                    },
                    bubbles: true,
                    composed: true,
                }));
                return;
            }
            const image = target.closest('img');
            if (image && root.contains(image)) {
                this.#dom.dispatchEvent(new CustomEvent('bindimageTap', {
                    detail: {
                        url: image.getAttribute('src') ?? '',
                        contentId: this.#contentId,
                    },
                    bubbles: true,
                    composed: true,
                }));
            }
        };
        #emitSelectionChange() {
            if (!this.#textSelection)
                return;
            try {
                const root = this.#root();
                const detail = XMarkdownAttributes_getSelectionDetail(this.#dom, root);
                const signature = `${detail.start}:${detail.end}:${detail.direction}`;
                if (signature === this.#lastSelectionSignature)
                    return;
                this.#lastSelectionSignature = signature;
                this.#dom.dispatchEvent(new CustomEvent('bindselectionchange', {
                    detail,
                    bubbles: true,
                    composed: true,
                }));
            }
            catch {
                /* noop */
            }
        }
        #scheduleSelectionSync = () => {
            clearTimeout(this.#selectionSyncTimer);
            this.#selectionSyncTimer = setTimeout(() => {
                this.#selectionSyncTimer = undefined;
                this.#emitSelectionChange();
            }, 0);
        };
        #handleSelectionChange = () => {
            this.#emitSelectionChange();
            this.#scheduleSelectionSync();
        };
        #handleSelectionGestureEnd = () => {
            this.#emitSelectionChange();
            this.#scheduleSelectionSync();
        };
        #scheduleRender() {
            if (this.#pendingRender)
                return;
            this.#pendingRender = true;
            if (!depsLoaded && !depsError) {
                loadDeps().then(() => {
                    this.#pendingRender = false;
                    this.#render();
                });
                return;
            }
            (0,element_reactive/* .boostedQueueMicrotask */.JS)(() => {
                this.#pendingRender = false;
                this.#render();
            });
        }
        #render() {
            const root = this.#root();
            if (!this.#content) {
                this.#resetTypewriterState();
                root.innerHTML = '';
                this.#renderedContent = '';
                this.#appendRemainder = '';
                this.#clearAppendFlushTimer();
                return;
            }
            // Typewriter animation takes precedence over incremental append
            if (this.#animationType === 'typewriter') {
                this.#renderTypewriter(root);
                return;
            }
            const parser = getMarkdownParser();
            if (!parser) {
                const content = this.#contentRange
                    ? this.#content.slice(this.#contentRange[0], this.#contentRange[1])
                    : this.#content;
                root.textContent = content;
                this.#renderedContent = content;
                this.#appendRemainder = '';
                this.#clearAppendFlushTimer();
                return;
            }
            if (this.#canAppendIncrementally()) {
                this.#appendIncrementally(root);
                return;
            }
            const content = this.#contentRange
                ? this.#content.slice(this.#contentRange[0], this.#contentRange[1])
                : this.#content;
            const rendered = renderMarkdown(parser, content);
            root.innerHTML = sanitizeHtml(preprocessInlineView(rendered));
            this.#injectInlineViews(root);
            this.#renderedContent = content;
            this.#appendRemainder = '';
            this.#clearAppendFlushTimer();
            this.#dispatchParseEnd();
            this.#applyPostRenderPolicies(root);
        }
        #canAppendIncrementally() {
            if (!this.#renderedContent)
                return false;
            if (!this.#content.startsWith(this.#renderedContent))
                return false;
            if (this.#content.length === this.#renderedContent.length)
                return false;
            return true;
        }
        #appendIncrementally(root) {
            const delta = this.#content.slice(this.#renderedContent.length);
            if (!delta)
                return;
            const lastNewlineIndex = delta.lastIndexOf('\n');
            if (lastNewlineIndex === -1) {
                this.#appendRemainder = delta;
                this.#scheduleAppendFlush();
                return;
            }
            const chunk = delta.slice(0, lastNewlineIndex + 1);
            if (chunk) {
                const parser = getMarkdownParser();
                if (!parser)
                    return;
                const html = renderMarkdown(parser, chunk);
                this.#appendHtml(root, html);
                this.#renderedContent += chunk;
            }
            this.#appendRemainder = delta.slice(lastNewlineIndex + 1);
            if (this.#appendRemainder) {
                this.#scheduleAppendFlush();
            }
            else {
                this.#clearAppendFlushTimer();
            }
        }
        #scheduleAppendFlush() {
            this.#clearAppendFlushTimer();
            this.#appendFlushTimer = setTimeout(() => {
                this.#appendFlushTimer = undefined;
                this.#flushAppendRemainder();
            }, this.#appendFlushDelay);
        }
        #clearAppendFlushTimer() {
            if (this.#appendFlushTimer) {
                clearTimeout(this.#appendFlushTimer);
                this.#appendFlushTimer = undefined;
            }
        }
        #resetTypewriterState() {
            this.#stopTypewriterTimer();
            this.#animationStarted = false;
            this.#animationStep = 0;
            this.#maxAnimationStep = 0;
            this.#removeTypewriterCursor();
        }
        #flushAppendRemainder() {
            if (!this.#appendRemainder)
                return;
            if (!this.#content.startsWith(this.#renderedContent))
                return;
            const expectedLength = this.#renderedContent.length
                + this.#appendRemainder.length;
            if (this.#content.length !== expectedLength)
                return;
            const root = this.#root();
            const parser = getMarkdownParser();
            if (!parser)
                return;
            const html = renderMarkdown(parser, this.#appendRemainder);
            this.#appendHtml(root, html);
            this.#renderedContent += this.#appendRemainder;
            this.#appendRemainder = '';
            this.#dispatchParseEnd();
            this.#applyPostRenderPolicies(this.#root());
        }
        #appendHtml(root, html) {
            const template = document.createElement('template');
            template.innerHTML = sanitizeHtml(preprocessInlineView(html));
            root.append(template.content);
            this.#applyPostRenderPolicies(root);
            this.#injectInlineViews(root);
        }
        #applyMarkdownEffect(root) {
            if (!this.#markdownEffect || this.#markdownEffect.type !== 'text-mask') {
                return;
            }
            if (this.#contentComplete !== false
                && this.#animationStep >= this.#maxAnimationStep) {
                return;
            }
            const { color, rangeStart, rangeEnd } = this.#markdownEffect;
            if (!color || typeof rangeStart !== 'number') {
                return;
            }
            const existingEffects = root.querySelectorAll('.md-text-mask-effect');
            existingEffects.forEach((effect) => {
                const content = effect.querySelector('.md-text-mask-effect-content');
                const parent = effect.parentNode;
                if (!content || !parent)
                    return;
                while (content.firstChild) {
                    parent.insertBefore(content.firstChild, effect);
                }
                parent.removeChild(effect);
            });
            // Collect all text nodes
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            const textNodes = [];
            while (walker.nextNode()) {
                const node = walker.currentNode;
                // Ignore text nodes inside the typewriter cursor or truncation marker
                const parent = node.parentElement;
                if (parent === root
                    && (node.nodeValue?.trim() ?? '') === '') {
                    continue;
                }
                if (parent
                    && (parent.closest('.md-typewriter-cursor')
                        || parent.closest('.md-truncation')
                        || parent.closest('.md-text-mask-effect-overlay'))) {
                    continue;
                }
                textNodes.push(node);
            }
            const totalLength = textNodes.reduce((sum, node) => sum + (node.nodeValue?.length ?? 0), 0);
            const normalizedStart = rangeStart < 0
                ? totalLength + rangeStart
                : rangeStart;
            const normalizedEndRaw = typeof rangeEnd === 'number'
                ? (rangeEnd < 0 ? totalLength + rangeEnd : rangeEnd)
                : normalizedStart;
            const effectStart = Math.max(0, Math.min(totalLength, normalizedStart));
            const effectEnd = Math.max(effectStart, Math.min(totalLength, normalizedEndRaw + 1));
            if (effectEnd <= effectStart) {
                return;
            }
            let cursor = 0;
            const nodesToWrap = [];
            textNodes.forEach((textNode) => {
                const textLength = textNode.nodeValue?.length ?? 0;
                const nodeStart = cursor;
                const nodeEnd = cursor + textLength;
                const startOffset = Math.max(effectStart, nodeStart) - nodeStart;
                const endOffset = Math.min(effectEnd, nodeEnd) - nodeStart;
                if (startOffset < endOffset) {
                    nodesToWrap.push({
                        node: textNode,
                        startOffset,
                        endOffset,
                    });
                }
                cursor = nodeEnd;
            });
            if (nodesToWrap.length === 0) {
                return;
            }
            // Wrap them
            const appliedEffects = [];
            for (const { node, startOffset, endOffset } of nodesToWrap.reverse()) {
                let targetNode = node;
                if (startOffset > 0) {
                    targetNode = node.splitText(startOffset);
                }
                const targetLength = endOffset - startOffset;
                if (targetLength < (targetNode.nodeValue?.length ?? 0)) {
                    targetNode.splitText(targetLength);
                }
                const originalText = targetNode.nodeValue ?? '';
                const span = document.createElement('span');
                span.className = 'md-text-mask-effect';
                const content = document.createElement('span');
                content.className = 'md-text-mask-effect-content';
                const overlay = document.createElement('span');
                overlay.className = 'md-text-mask-effect-overlay';
                overlay.setAttribute('aria-hidden', 'true');
                overlay.textContent = originalText;
                overlay.style.background = color;
                const parent = targetNode.parentNode;
                if (parent) {
                    parent.insertBefore(span, targetNode);
                    content.appendChild(targetNode);
                    span.append(content, overlay);
                    appliedEffects.unshift({
                        content,
                        overlay,
                    });
                }
            }
            if (appliedEffects.length === 0) {
                return;
            }
            const segmentWidths = appliedEffects.map(({ content }) => content.getBoundingClientRect().width);
            const totalEffectWidth = segmentWidths.reduce((sum, width) => sum + width, 0);
            if (totalEffectWidth <= 0) {
                return;
            }
            let offsetX = 0;
            appliedEffects.forEach(({ overlay }, index) => {
                overlay.style.backgroundRepeat = 'no-repeat';
                overlay.style.backgroundSize = `${totalEffectWidth}px 100%`;
                overlay.style.backgroundPosition = `${-offsetX}px 0`;
                offsetX += segmentWidths[index] ?? 0;
            });
        }
        #dispatchParseEnd() {
            this.#dom.dispatchEvent(new CustomEvent('bindparseEnd', {
                detail: { id: this.#contentId },
                bubbles: true,
                composed: true,
            }));
        }
        #applyPostRenderPolicies(root) {
            this.#applyMarkdownEffect(root);
            // Overflow detection for line clamp
            if (this.#textMaxline > 0) {
                // give layout a tick
                queueMicrotask(() => {
                    try {
                        const overflow = root.scrollHeight > root.clientHeight + 1;
                        if (overflow && !this.#overflowEmitted) {
                            this.#overflowEmitted = true;
                            this.#dom.dispatchEvent(new CustomEvent('bindoverflow', {
                                detail: { type: 'ellipsis' },
                                bubbles: true,
                                composed: true,
                            }));
                        }
                    }
                    catch {
                        /* noop */
                    }
                });
            }
            else {
                this.#overflowEmitted = false;
            }
            // Dynamic height transition for typewriter
            if (this.#animationType === 'typewriter' && this.#typewriterDynamicHeight) {
                const dur = this.#typewriterHeightTransition;
                if (dur > 0) {
                    root.style.transition = `height ${dur}s ease`;
                }
            }
            else {
                root.style.transition = '';
            }
            // Truncation tail marker
            if (this.#textMaxline > 0) {
                if (!this.#ensureTruncationMarker(root)) {
                    this.#removeTruncationMarker();
                }
            }
            else {
                this.#removeTruncationMarker();
            }
        }
        #renderTypewriter(root) {
            // Prepare max steps considering content range
            const [start, end] = this.#contentRange
                ? this.#contentRange
                : [0, this.#content.length];
            this.#maxAnimationStep = Math.max(0, end - start);
            // Start if not started
            if (!this.#animationStarted) {
                this.#animationStarted = true;
                this.#dom.dispatchEvent(new CustomEvent('binddrawStart', { bubbles: true, composed: true }));
                if (!this.#animationPaused) {
                    this.#startTypewriterTimer();
                }
            }
            const visible = this.#content.slice(start, start + this.#animationStep);
            const parser = getMarkdownParser();
            if (!parser) {
                root.textContent = visible;
            }
            else {
                root.innerHTML = sanitizeHtml(preprocessInlineView(renderMarkdown(parser, visible)));
                this.#injectInlineViews(root);
            }
            this.#appendTypewriterCursor(root);
            this.#applyPostRenderPolicies(root);
            if (this.#animationStep >= this.#maxAnimationStep) {
                this.#stopTypewriterTimer();
                if (this.#contentComplete !== false) {
                    this.#dom.dispatchEvent(new CustomEvent('binddrawEnd', { bubbles: true, composed: true }));
                }
            }
        }
        #startTypewriterTimer() {
            this.#stopTypewriterTimer();
            const interval = Math.max(10, Math.floor(1000 / Math.max(1, this.#animationVelocity)));
            this.#animationTimer = setInterval(() => {
                if (this.#animationStep < this.#maxAnimationStep) {
                    this.#animationStep += 1;
                    this.#dom.dispatchEvent(new CustomEvent('bindanimationStep', {
                        detail: {
                            animationStep: this.#animationStep,
                            maxAnimationStep: this.#maxAnimationStep,
                        },
                        bubbles: true,
                        composed: true,
                    }));
                    // Re-render slice only
                    const root = this.#root();
                    this.#renderTypewriter(root);
                }
                else {
                    this.#stopTypewriterTimer();
                }
            }, interval);
        }
        #stopTypewriterTimer() {
            if (this.#animationTimer) {
                clearInterval(this.#animationTimer);
                this.#animationTimer = undefined;
            }
        }
        #applyMarkdownStyle(value) {
            const parsed = parseMarkdownStyle(value);
            this.#truncationConfig = parsed.truncation ?? null;
            this.#typewriterCursorConfig = parsed.typewriterCursor ?? null;
            const { truncation, typewriterCursor, ...cssParts } = parsed;
            this.#currentMarkdownCss = buildMarkdownStyleCss(cssParts);
            this.#updateStyleTag();
        }
        #updateStyleTag() {
            const styleTag = this.#style();
            let css = this.#currentMarkdownCss || '';
            if (this.#textSelection) {
                css += '\n.markdown-body { user-select: text; }';
            }
            if (this.#textMaxline > 0) {
                css +=
                    `\n.markdown-body { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: ${this.#textMaxline}; overflow: hidden; }`;
            }
            styleTag.textContent = css;
        }
        _handleContent(newVal) {
            const content = newVal ?? '';
            const contentChanged = content !== this.#content;
            this.#content = content;
            if (contentChanged && this.#animationType === 'typewriter') {
                this.#resetTypewriterState();
            }
            this.#scheduleRender();
        }
        _handleMarkdownEffect(newVal) {
            try {
                this.#markdownEffect = newVal ? JSON.parse(newVal) : null;
            }
            catch {
                this.#markdownEffect = null;
            }
            this.#scheduleRender();
        }
        _handleMarkdownStyle(newVal) {
            this.#applyMarkdownStyle(newVal);
        }
        _handleContentId(newVal) {
            this.#contentId = newVal ?? undefined;
        }
        _handleTextSelection(newVal) {
            // Treat presence and value !== 'false' as true
            this.#textSelection = !!(newVal && newVal !== 'false');
            if (!this.#textSelection) {
                clearTimeout(this.#selectionSyncTimer);
                this.#selectionSyncTimer = undefined;
                this.#lastSelectionSignature = undefined;
            }
            this.#updateStyleTag();
        }
        _handleAnimationType(newVal) {
            const v = (newVal ?? 'none').toLowerCase();
            this.#animationType = v === 'typewriter' ? 'typewriter' : 'none';
            this.#animationStarted = false;
            this.#stopTypewriterTimer();
            this.#scheduleRender();
        }
        _handleAnimationVelocity(newVal) {
            const n = Number(newVal);
            if (!Number.isNaN(n) && n > 0)
                this.#animationVelocity = n;
            if (this.#animationType === 'typewriter'
                && !this.#animationPaused
                && this.#animationTimer) {
                this.#startTypewriterTimer();
            }
        }
        _handleAnimationPaused(newVal) {
            this.#animationPaused = !!(newVal && newVal !== 'false');
            if (this.#animationPaused) {
                this.#stopTypewriterTimer();
                return;
            }
            if (this.#animationType === 'typewriter'
                && this.#animationStarted
                && this.#animationStep < this.#maxAnimationStep) {
                this.#startTypewriterTimer();
            }
        }
        _handleInitialAnimationStep(newVal) {
            const n = Number(newVal);
            this.#animationStep = Number.isNaN(n) ? 0 : Math.max(0, Math.floor(n));
        }
        _handleContentComplete(newVal) {
            this.#contentComplete = !(newVal === 'false');
        }
        _handleTypewriterDynamicHeight(newVal) {
            this.#typewriterDynamicHeight = !!(newVal && newVal !== 'false');
        }
        _handleTypewriterHeightTransition(newVal) {
            const n = Number(newVal);
            this.#typewriterHeightTransition = Number.isNaN(n) ? 0 : Math.max(0, n);
        }
        _handleTextMaxline(newVal) {
            const n = Number(newVal);
            this.#textMaxline = Number.isNaN(n) ? 0 : Math.max(0, Math.floor(n));
            this.#updateStyleTag();
        }
        _handleContentRange(newVal) {
            if (!newVal) {
                this.#contentRange = undefined;
            }
            else {
                try {
                    const parsed = JSON.parse(newVal);
                    if (Array.isArray(parsed) && parsed.length === 2) {
                        const s = Number(parsed[0]);
                        const e = Number(parsed[1]);
                        if (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) {
                            this.#contentRange = [Math.max(0, s), Math.max(0, e)];
                        }
                    }
                }
                catch {
                    // Support "start,end" form
                    const parts = newVal.split(',');
                    if (parts.length === 2) {
                        const s = Number(parts[0]);
                        const e = Number(parts[1]);
                        if (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) {
                            this.#contentRange = [Math.max(0, s), Math.max(0, e)];
                        }
                    }
                }
            }
            this.#scheduleRender();
        }
        #injectInlineViews(root) {
            try {
                const imgs = Array.from(root.querySelectorAll('img'));
                for (const img of imgs) {
                    const inlineId = img.getAttribute('data-inlineview');
                    if (inlineId) {
                        const id = inlineId;
                        const container = document.createElement('span');
                        container.className = 'md-inline-view';
                        const slot = document.createElement('slot');
                        slot.name = id;
                        container.appendChild(slot);
                        img.replaceWith(container);
                    }
                }
            }
            catch {
                /* noop */
            }
        }
        #ensureTruncationMarker(root) {
            const overflow = root.scrollHeight > root.clientHeight + 1;
            if (!overflow)
                return false;
            if (!this.#truncationEl) {
                const span = document.createElement('span');
                span.className = 'md-truncation';
                this.#truncationEl = span;
                root.appendChild(span);
            }
            const cfg = this.#truncationConfig || {};
            const span = this.#truncationEl;
            span.textContent = '';
            span.innerHTML = '';
            if (cfg.truncationType === 'view' && cfg.content) {
                const view = this.#dom.querySelector(`#${CSS.escape(String(cfg.content))}`);
                if (view)
                    span.appendChild(view);
                else
                    span.textContent = '…';
            }
            else if (cfg.content) {
                span.textContent = String(cfg.content);
            }
            else {
                span.textContent = '…';
            }
            return true;
        }
        #removeTruncationMarker() {
            if (this.#truncationEl && this.#truncationEl.parentNode) {
                this.#truncationEl.parentNode.removeChild(this.#truncationEl);
            }
            this.#truncationEl = undefined;
        }
        #appendTypewriterCursor(root) {
            if (this.#contentComplete !== false
                && this.#animationStep >= this.#maxAnimationStep) {
                this.#removeTypewriterCursor();
                return;
            }
            const cfg = this.#typewriterCursorConfig || {};
            const customCursor = cfg.customCursor;
            if (customCursor === 'none') {
                this.#removeTypewriterCursor();
                return;
            }
            if (!this.#typewriterCursorEl) {
                const span = document.createElement('span');
                span.className = 'md-typewriter-cursor';
                this.#typewriterCursorEl = span;
                if (cfg.verticalAlign) {
                    span.style.verticalAlign = cfg.verticalAlign;
                }
                if (customCursor) {
                    // Look in light DOM or shadow DOM
                    const view = this.#dom.querySelector(`#${CSS.escape(customCursor)}`)
                        || root.querySelector(`#${CSS.escape(customCursor)}`);
                    if (view) {
                        span.appendChild(view);
                    }
                    else {
                        span.textContent = '…';
                    }
                }
                else {
                    span.textContent = '…';
                }
            }
            // Find the right place to insert the cursor
            let target = root;
            while (true) {
                let lastNode = target.lastChild;
                // Skip empty text nodes at the end
                while (lastNode) {
                    if (lastNode.nodeType === Node.TEXT_NODE
                        && (!lastNode.textContent || lastNode.textContent.trim() === '')) {
                        lastNode = lastNode.previousSibling;
                    }
                    else {
                        break;
                    }
                }
                if (lastNode
                    && lastNode.nodeType === Node.ELEMENT_NODE
                    && !['IMG', 'BR', 'HR', 'INPUT', 'TABLE', 'PRE', 'CODE'].includes(lastNode.tagName)) {
                    target = lastNode;
                }
                else {
                    break;
                }
            }
            target.appendChild(this.#typewriterCursorEl);
        }
        #removeTypewriterCursor() {
            if (this.#typewriterCursorEl && this.#typewriterCursorEl.parentNode) {
                this.#typewriterCursorEl.parentNode.removeChild(this.#typewriterCursorEl);
            }
            this.#typewriterCursorEl = undefined;
        }
    };
})();

//# sourceMappingURL=XMarkdownAttributes.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XMarkdown/XMarkdown.js

/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




const XMarkdown_getComposedRange = (selection, shadowRoot) => {
    const getComposedRanges = selection
        .getComposedRanges;
    if (!shadowRoot || typeof getComposedRanges !== 'function')
        return null;
    try {
        return getComposedRanges.call(selection, {
            shadowRoots: [shadowRoot],
        })[0] ?? null;
    }
    catch {
        try {
            return getComposedRanges.call(selection, shadowRoot)[0] ?? null;
        }
        catch {
            return null;
        }
    }
};
const XMarkdown_createRangeByOffsets = (doc, root, start, end) => {
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let pos = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;
    let node = walker.nextNode();
    while (node) {
        const len = node.nodeValue?.length ?? 0;
        if (!startNode && pos + len >= start) {
            startNode = node;
            startOffset = start - pos;
        }
        if (pos + len >= end) {
            endNode = node;
            endOffset = end - pos;
            break;
        }
        pos += len;
        node = walker.nextNode();
    }
    if (!startNode)
        return null;
    if (!endNode) {
        endNode = startNode;
        endOffset = startOffset;
    }
    const range = doc.createRange();
    range.setStart(startNode, Math.max(0, Math.min(startOffset, startNode.length)));
    range.setEnd(endNode, Math.max(0, Math.min(endOffset, endNode.length)));
    return range;
};
const getRenderedPrefixLengthForSourceOffset = (source, rendered, sourceOffset) => {
    let renderedIndex = 0;
    const limit = Math.max(0, Math.min(sourceOffset, source.length));
    for (let sourceIndex = 0; sourceIndex < limit; sourceIndex += 1) {
        if (renderedIndex >= rendered.length)
            break;
        if (source[sourceIndex] === rendered[renderedIndex]) {
            renderedIndex += 1;
        }
    }
    return renderedIndex;
};
const mapSourceRangeToCharRange = (source, rendered, start, end) => {
    const renderedStart = getRenderedPrefixLengthForSourceOffset(source, rendered, start);
    const renderedEnd = getRenderedPrefixLengthForSourceOffset(source, rendered, end);
    return {
        start: renderedStart,
        end: Math.max(renderedStart, renderedEnd),
    };
};
const XMarkdown_isSelectionNodeInsideHost = (dom, shadowRoot, node) => !!node
    && (node === dom
        || node === shadowRoot
        || dom.contains(node)
        || !!shadowRoot?.contains(node));
const XMarkdown_getRangeInRoot = (dom, root, selection) => {
    if (!selection)
        return null;
    const shadowRoot = dom.shadowRoot;
    const sourceRange = XMarkdown_getComposedRange(selection, shadowRoot)
        ?? (selection.rangeCount > 0 ? selection.getRangeAt(0) : null);
    if (!sourceRange)
        return null;
    if (!root.contains(sourceRange.startContainer)
        || !root.contains(sourceRange.endContainer)) {
        if (!XMarkdown_isSelectionNodeInsideHost(dom, shadowRoot, sourceRange.startContainer)
            || !XMarkdown_isSelectionNodeInsideHost(dom, shadowRoot, sourceRange.endContainer)
            || !XMarkdown_isSelectionNodeInsideHost(dom, shadowRoot, selection.anchorNode)
            || !XMarkdown_isSelectionNodeInsideHost(dom, shadowRoot, selection.focusNode)) {
            return null;
        }
        const selectedText = selection.toString();
        if (!selectedText) {
            return null;
        }
        const start = root.textContent?.indexOf(selectedText) ?? -1;
        if (start < 0)
            return null;
        return XMarkdown_createRangeByOffsets(dom.ownerDocument, root, start, start + selectedText.length);
    }
    const range = dom.ownerDocument.createRange();
    range.setStart(sourceRange.startContainer, sourceRange.startOffset);
    range.setEnd(sourceRange.endContainer, sourceRange.endOffset);
    return range;
};
const getSelectionCandidates = (dom) => {
    const shadowRoot = dom.shadowRoot;
    const shadowSelection = shadowRoot && typeof shadowRoot.getSelection === 'function'
        ? shadowRoot.getSelection()
        : null;
    const documentSelection = dom.ownerDocument.getSelection();
    return [shadowSelection, documentSelection].filter((selection, index, selections) => !!selection && selections.indexOf(selection) === index);
};
const getSelectionForRoot = (dom, root) => {
    for (const selection of getSelectionCandidates(dom)) {
        const range = XMarkdown_getRangeInRoot(dom, root, selection);
        if (range)
            return { selection, range };
    }
    return null;
};
const getPreferredSelectionTarget = (dom) => {
    const candidates = getSelectionCandidates(dom);
    return candidates[0] ?? null;
};
let XMarkdown_XMarkdown = (() => {
    let _classDecorators = [(0,element_reactive/* .Component */.uA)('x-markdown', [CommonEventsAndMethods/* .CommonEventsAndMethods */.O, XMarkdownAttributes], templateXMarkdown)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var XMarkdown = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            (0,tslib_es6/* .__esDecorate */.G4)(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            XMarkdown = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static notToFilterFalseAttributes = new Set(['content-complete']);
        #getMarkdownStyle() {
            return parseMarkdownStyle(this.getAttribute('markdown-style'));
        }
        #setMarkdownStyle(value) {
            const serialized = serializeMarkdownStyle(value);
            if (serialized === null) {
                this.removeAttribute('markdown-style');
            }
            else {
                this.setAttribute('markdown-style', serialized);
            }
        }
        get markdownStyle() {
            return this.#getMarkdownStyle();
        }
        set markdownStyle(value) {
            this.#setMarkdownStyle(value);
        }
        get ['markdown-style']() {
            return this.#getMarkdownStyle();
        }
        set ['markdown-style'](value) {
            this.#setMarkdownStyle(value);
        }
        /**
         * 获取当前渲染内容中的所有图片 URL。
         */
        getImages() {
            const root = this.shadowRoot?.querySelector('#markdown-root');
            if (!root)
                return [];
            return Array.from(root.querySelectorAll('img'))
                .map((img) => img.getAttribute('src') || '')
                .filter((v) => !!v);
        }
        getContent(params) {
            const content = this.getAttribute('content') ?? '';
            const s = Math.max(0, params?.start ?? 0);
            const eInclusive = params?.end ?? (content.length - 1);
            const e = Math.min(content.length, eInclusive + 1);
            const slice = e >= s ? content.slice(s, e) : '';
            return { content: slice };
        }
        pauseAnimation() {
            this.setAttribute('animation-paused', 'true');
        }
        resumeAnimation(params) {
            if (params?.animationStep !== undefined) {
                this.setAttribute('initial-animation-step', String(params.animationStep));
            }
            if (this.getAttribute('animation-type') !== 'typewriter') {
                this.setAttribute('animation-type', 'typewriter');
            }
            const velocity = this.getAttribute('animation-velocity');
            if (!velocity || Number(velocity) <= 0) {
                this.setAttribute('animation-velocity', '40');
            }
            this.removeAttribute('animation-paused');
        }
        getSelectedText() {
            const root = this.shadowRoot?.querySelector('#markdown-root');
            if (!root)
                return '';
            const result = getSelectionForRoot(this, root);
            return result?.range.toString() ?? '';
        }
        getTextBoundingRect(params) {
            const root = this.shadowRoot?.querySelector('#markdown-root');
            if (!root)
                return null;
            const doc = this.ownerDocument;
            const createRangeByChar = (s, e) => {
                const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
                let pos = 0;
                let startNode = null;
                let startOffset = 0;
                let endNode = null;
                let endOffset = 0;
                let node = walker.nextNode();
                while (node) {
                    const len = node.nodeValue?.length ?? 0;
                    if (!startNode && pos + len >= s) {
                        startNode = node;
                        startOffset = s - pos;
                    }
                    if (pos + len >= e) {
                        endNode = node;
                        endOffset = e - pos;
                        break;
                    }
                    pos += len;
                    node = walker.nextNode();
                }
                if (!startNode)
                    return null;
                if (!endNode) {
                    endNode = startNode;
                    endOffset = startOffset;
                }
                const r = doc.createRange();
                r.setStart(startNode, Math.max(0, Math.min(startOffset, startNode.length)));
                r.setEnd(endNode, Math.max(0, Math.min(endOffset, endNode.length)));
                return r;
            };
            if (params?.start !== undefined || params?.end !== undefined) {
                const s = Math.max(0, params?.start ?? 0);
                const e = Math.max(s, params?.end ?? s);
                const rangeOffsets = params?.indexType === 'source'
                    ? mapSourceRangeToCharRange(this.getAttribute('content') ?? '', root.textContent ?? '', s, e)
                    : { start: s, end: e };
                if (!rangeOffsets)
                    return null;
                const r = createRangeByChar(rangeOffsets.start, rangeOffsets.end);
                if (!r)
                    return null;
                return { boundingRect: r.getBoundingClientRect() };
            }
            const result = getSelectionForRoot(this, root);
            if (!result)
                return null;
            return { boundingRect: result.range.getBoundingClientRect() };
        }
        setTextSelection(params) {
            const doc = this.ownerDocument;
            const getRangeAtPoint = (x, y) => {
                if (doc.caretRangeFromPoint)
                    return doc.caretRangeFromPoint(x, y);
                if (doc.caretPositionFromPoint) {
                    const pos = doc.caretPositionFromPoint(x, y);
                    if (!pos)
                        return null;
                    const r = this.ownerDocument.createRange();
                    r.setStart(pos.offsetNode, pos.offset);
                    r.collapse(true);
                    return r;
                }
                return null;
            };
            const r1 = getRangeAtPoint(params.startX, params.startY);
            const r2 = getRangeAtPoint(params.endX, params.endY);
            if (r1 && r2) {
                const sel = getPreferredSelectionTarget(this);
                if (!sel)
                    return;
                sel.removeAllRanges();
                const range = this.ownerDocument.createRange();
                range.setStart(r1.startContainer, r1.startOffset);
                range.setEnd(r2.startContainer, r2.startOffset);
                sel.addRange(range);
            }
        }
        getParseResult(params) {
            const root = this.shadowRoot?.querySelector('#markdown-root');
            if (!root)
                return {};
            const text = root.textContent || '';
            const result = {};
            const doc = this.ownerDocument;
            const calcOffset = (node) => {
                const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
                let pos = 0;
                let start = -1;
                let end = -1;
                let current = walker.nextNode();
                while (current) {
                    const len = (current.nodeValue || '').length;
                    if (current === node || node.contains(current)) {
                        if (start < 0) {
                            start = pos;
                        }
                        end = pos + len;
                    }
                    pos += len;
                    current = walker.nextNode();
                }
                return {
                    start: Math.max(0, Math.min(start, text.length)),
                    end: Math.max(0, Math.min(end, text.length)),
                };
            };
            for (const tag of params.tags) {
                const nodes = Array.from(root.querySelectorAll(tag));
                result[tag] = nodes.map((el) => calcOffset(el));
            }
            return result;
        }
        static {
            (0,tslib_es6/* .__runInitializers */.zF)(_classThis, _classExtraInitializers);
        }
    };
    return XMarkdown = _classThis;
})();

//# sourceMappingURL=XMarkdown.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/XMarkdown/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * @module elements/XMarkdown
 *
 * `x-markdown` renders markdown content with minimal styling.
 * It supports the `content` and `markdown-style` attributes.
 */

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/all.js



















//# sourceMappingURL=all.js.map

},
8969(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/* import */ var tslib__rspack_import_2 = __webpack_require__(5608);
/* import */ var _commonEventInitConfiguration_js__rspack_import_0 = __webpack_require__(2233);
/* import */ var _element_reactive_index_js__rspack_import_1 = __webpack_require__(3210);
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.



const layoutChangeTarget = Symbol('layoutChangeTarget');
let CommonEventsAndMethods = (() => {
    let ___handleScrollUpperThresholdEventEnabled_decorators;
    let ___handleScrollUpperThresholdEventEnabled_initializers = [];
    let ___handleScrollUpperThresholdEventEnabled_extraInitializers = [];
    return class CommonEventsAndMethods {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            ___handleScrollUpperThresholdEventEnabled_decorators = [(0,_element_reactive_index_js__rspack_import_1/* .registerEventEnableStatusChangeHandler */.ZR)('layoutchange')];
            (0,tslib__rspack_import_2/* .__esDecorate */.G4)(null, null, ___handleScrollUpperThresholdEventEnabled_decorators, { kind: "field", name: "__handleScrollUpperThresholdEventEnabled", static: false, private: false, access: { has: obj => "__handleScrollUpperThresholdEventEnabled" in obj, get: obj => obj.__handleScrollUpperThresholdEventEnabled, set: (obj, value) => { obj.__handleScrollUpperThresholdEventEnabled = value; } }, metadata: _metadata }, ___handleScrollUpperThresholdEventEnabled_initializers, ___handleScrollUpperThresholdEventEnabled_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static observedAttributes = [];
        #dom;
        constructor(currentElement) {
            (0,tslib__rspack_import_2/* .__runInitializers */.zF)(this, ___handleScrollUpperThresholdEventEnabled_extraInitializers);
            this.#dom = currentElement;
        }
        #resizeObserving = false;
        #resizeObserver;
        __handleScrollUpperThresholdEventEnabled = (0,tslib__rspack_import_2/* .__runInitializers */.zF)(this, ___handleScrollUpperThresholdEventEnabled_initializers, (enabled) => {
            if (enabled && this.#dom[layoutChangeTarget]) {
                if (!this.#resizeObserver) {
                    this.#resizeObserver = new ResizeObserver(([entry]) => {
                        if (entry) {
                            const id = this.#dom.id;
                            // Reuse getBoundingClientRect to get left and top, because ResizeObserver-contentRect is calculated based on padding box
                            const { top, bottom, left, right, width, height } = entry.target
                                .getBoundingClientRect();
                            this.#dom.dispatchEvent(new CustomEvent('layoutchange', {
                                detail: {
                                    width,
                                    height,
                                    left,
                                    right,
                                    top,
                                    bottom,
                                    id,
                                },
                                ..._commonEventInitConfiguration_js__rspack_import_0/* .commonComponentEventSetting */.$,
                            }));
                        }
                    });
                    if (!this.#resizeObserving) {
                        this.#resizeObserver.observe(this.#dom[layoutChangeTarget]);
                        this.#resizeObserving = true;
                    }
                }
            }
            else {
                this.#resizeObserver?.disconnect();
                this.#resizeObserver = undefined;
                this.#resizeObserving = false;
            }
        });
        dispose() {
            this.#resizeObserver?.disconnect();
            this.#resizeObserver = undefined;
            this.#resizeObserving = false;
        }
    };
})();

//# sourceMappingURL=CommonEventsAndMethods.js.map
__webpack_require__.d(__webpack_exports__, {
  O: () => (CommonEventsAndMethods)
}, {
  v: layoutChangeTarget
});


},
2233(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
const commonComponentEventSetting = {
    bubbles: false,
    composed: false,
    cancelable: true,
};
//# sourceMappingURL=commonEventInitConfiguration.js.map
__webpack_require__.d(__webpack_exports__, {
}, {
  $: commonComponentEventSetting
});


},
7683(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
// safari cannot use scrollend event
const useScrollEnd = 'onscrollend' in document;
const scrollContainerDom = Symbol.for('lynx-scroll-container-dom');
//# sourceMappingURL=constants.js.map
__webpack_require__.d(__webpack_exports__, {
}, {
  k: useScrollEnd,
  l: scrollContainerDom
});


},
5608(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  }
  return __assign.apply(this, arguments);
}

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};

function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};

function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
};

function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};

function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
}

/** @deprecated */
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
  return ar;
}

/** @deprecated */
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
  function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
  function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};

var ownKeys = function(o) {
  ownKeys = Object.getOwnPropertyNames || function (o) {
    var ar = [];
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
    return ar;
  };
  return ownKeys(o);
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
  __setModuleDefault(result, mod);
  return result;
}

function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}

function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}

var _SuppressedError = (/* unused pure expression or super */ null && (typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
}));

function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  var r, s = 0;
  function next() {
    while (r = env.stack.pop()) {
      try {
        if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
        if (r.dispose) {
          var result = r.dispose.call(r.value);
          if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
        }
        else s |= 1;
      }
      catch (e) {
        fail(e);
      }
    }
    if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
    if (env.hasError) throw env.error;
  }
  return next();
}

function __rewriteRelativeImportExtension(path, preserveJsx) {
  if (typeof path === "string" && /^\.\.?\//.test(path)) {
      return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
          return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
      });
  }
  return path;
}

/* unused export default */ var __rspack_default_export = ((/* unused pure expression or super */ null && ({
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __esDecorate,
  __runInitializers,
  __propKey,
  __setFunctionName,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
  __rewriteRelativeImportExtension,
})));

__webpack_require__.d(__webpack_exports__, {
  G4: () => (__esDecorate),
  zF: () => (__runInitializers)
});


},

}]);