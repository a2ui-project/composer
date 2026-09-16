(() => {
"use strict";
var __webpack_modules__ = ({
4445(__unused_rspack_module, __unused_rspack___webpack_exports__, __webpack_require__) {

// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/client/index.js + 4 modules
var client = __webpack_require__(9823);
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-elements/dist/elements/all.js + 95 modules
var elements_all = __webpack_require__(8265);
;// CONCATENATED MODULE: ./src/styles.css
// extracted by css-extract-rspack-plugin

;// CONCATENATED MODULE: ./src/catalog.ts
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
 */ /** Catalog metadata exposed to Composer for prompt construction and validation. */ const LYNX_CATALOG = {
    $schema: 'https://a2ui.org/specification/v0_9/catalog.json',
    catalogId: 'https://unpkg.com/@lynx-js/genui/a2ui/dist/catalog.json',
    title: 'Lynx GenUI Catalog',
    description: 'A2UI components rendered by the Lynx GenUI ReactLynx runtime.',
    components: Object.fromEntries([
        'Text',
        'Image',
        'Icon',
        'Row',
        'Column',
        'List',
        'Card',
        'Tabs',
        'Modal',
        'Divider',
        'Button',
        'TextField',
        'CheckBox',
        'ChoicePicker',
        'Slider',
        'DateTimeInput',
        'Loading',
        'RadioGroup',
        'LineChart',
        'PieChart'
    ].map((name)=>[
            name,
            {
                name
            }
        ]))
};

;// CONCATENATED MODULE: ./src/protocol.ts
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
/** Composer preview bridge message names understood by the Lynx renderer. */ const BRIDGE_MESSAGE_TYPE = {
    A2UI_CATALOG: 'A2UI_CATALOG',
    COMPONENT_USAGES: 'COMPONENT_USAGES',
    DATA_MODEL_CHANGE: 'DATA_MODEL_CHANGE',
    GET_CATALOG: 'GET_CATALOG',
    GET_COMPONENT_USAGES: 'GET_COMPONENT_USAGES',
    RENDER_A2UI: 'RENDER_A2UI',
    RENDERER_READY: 'RENDERER_READY',
    SEND_TO_SERVER: 'SEND_TO_SERVER',
    SET_BLOCKING_STATE: 'SET_BLOCKING_STATE',
    SET_THEME: 'SET_THEME',
    SURFACE_RESIZE: 'SURFACE_RESIZE'
};
function isBridgeMessage(value) {
    return !!value && typeof value === 'object' && typeof value.type === 'string';
}
function hasCreateSurface(payload) {
    return Array.isArray(payload) && payload.some((item)=>!!item && typeof item === 'object' && 'createSurface' in item);
}
/** Adapts Composer's iframe protocol to Lynx global events and native module calls. */ class LynxComposerBridge {
    lynxView;
    parentWindow;
    allowedParentOrigins;
    documentRef;
    pendingMessages = [];
    runtimeReady = false;
    overlay = null;
    parentOrigin;
    constructor(lynxView, parentWindow, allowedParentOrigins, documentRef){
        this.lynxView = lynxView;
        this.parentWindow = parentWindow;
        this.allowedParentOrigins = allowedParentOrigins;
        this.documentRef = documentRef;
        this.parentOrigin = allowedParentOrigins.values().next().value ?? window.location.origin;
        this.lynxView.onNativeModulesCall = (name, data, moduleName)=>this.handleNativeModuleCall({
                name,
                data,
                moduleName
            });
    }
    /** Accepts a message event after verifying its source and origin. */ handleMessage(event) {
        if (event.source !== this.parentWindow || !this.allowedParentOrigins.has(event.origin)) {
            return;
        }
        if (!isBridgeMessage(event.data)) return;
        const { type, payload } = event.data;
        switch(type){
            case BRIDGE_MESSAGE_TYPE.RENDER_A2UI:
                this.forwardRenderPayload(payload);
                break;
            case BRIDGE_MESSAGE_TYPE.DATA_MODEL_CHANGE:
                this.forwardDataModelChange(payload);
                break;
            case BRIDGE_MESSAGE_TYPE.GET_CATALOG:
                this.postToParent({
                    type: BRIDGE_MESSAGE_TYPE.A2UI_CATALOG,
                    payload: LYNX_CATALOG
                });
                break;
            case BRIDGE_MESSAGE_TYPE.GET_COMPONENT_USAGES:
                this.postToParent({
                    type: BRIDGE_MESSAGE_TYPE.COMPONENT_USAGES,
                    payload: {}
                });
                break;
            case BRIDGE_MESSAGE_TYPE.SET_THEME:
                this.forwardTheme(payload);
                break;
            case BRIDGE_MESSAGE_TYPE.SET_BLOCKING_STATE:
                this.setBlockingState(payload);
                break;
        }
    }
    /** Reports the current host element dimensions to Composer. */ reportSurfaceSize() {
        const rect = this.lynxView.getBoundingClientRect();
        const height = Math.max(this.documentRef.body.scrollHeight, Math.ceil(rect.height));
        const width = Math.max(this.documentRef.body.scrollWidth, Math.ceil(rect.width));
        this.postToParent({
            type: BRIDGE_MESSAGE_TYPE.SURFACE_RESIZE,
            payload: {
                height,
                width
            }
        });
    }
    /** Removes runtime callbacks and transient UI. */ destroy() {
        this.lynxView.onNativeModulesCall = undefined;
        this.overlay?.remove();
        this.overlay = null;
    }
    handleNativeModuleCall(call) {
        if (call.moduleName !== 'bridge') return undefined;
        if (call.name === 'A2UI_RUNTIME_READY') {
            this.runtimeReady = true;
            this.flushPendingMessages();
            this.postToParent({
                type: BRIDGE_MESSAGE_TYPE.RENDERER_READY
            });
            this.reportSurfaceSize();
        } else if (call.name === 'A2UI_USER_ACTION') {
            this.postToParent({
                type: BRIDGE_MESSAGE_TYPE.SEND_TO_SERVER,
                payload: {
                    version: 'v0.9',
                    action: call.data
                }
            });
        } else if (call.name === 'A2UI_SURFACE_RESIZE') {
            this.reportSurfaceSize();
        }
        return undefined;
    }
    forwardRenderPayload(payload) {
        if (!Array.isArray(payload)) return;
        const eventName = hasCreateSurface(payload) ? 'COMPOSER_REPLAY_MESSAGES' : 'COMPOSER_LIVE_MESSAGES';
        this.sendOrQueue(eventName, payload);
    }
    forwardDataModelChange(payload) {
        if (!payload || typeof payload !== 'object') return;
        const updateDataModel = payload.updateDataModel;
        if (!updateDataModel) return;
        this.sendOrQueue('COMPOSER_LIVE_MESSAGES', [
            {
                version: 'v0.9',
                updateDataModel
            }
        ]);
    }
    forwardTheme(payload) {
        if (!payload || typeof payload !== 'object') return;
        const theme = payload.theme;
        if (theme !== 'light' && theme !== 'dark') return;
        this.documentRef.documentElement.classList.toggle('dark-theme', theme === 'dark');
        this.sendOrQueue('COMPOSER_THEME', theme);
    }
    setBlockingState(payload) {
        if (!payload || typeof payload !== 'object') return;
        const state = payload;
        if (state.blocked !== true) {
            this.overlay?.remove();
            this.overlay = null;
            return;
        }
        this.overlay ??= this.documentRef.createElement('div');
        this.overlay.className = 'bridge-overlay';
        this.overlay.textContent = typeof state.message === 'string' ? state.message : 'Processing layouts...';
        if (!this.overlay.isConnected) this.documentRef.body.append(this.overlay);
    }
    sendOrQueue(eventName, payload) {
        if (!this.runtimeReady || !this.lynxView.sendGlobalEvent) {
            this.pendingMessages.push({
                eventName,
                payload
            });
            return;
        }
        this.lynxView.sendGlobalEvent(eventName, [
            payload
        ]);
    }
    flushPendingMessages() {
        if (!this.lynxView.sendGlobalEvent) return;
        for (const message of this.pendingMessages.splice(0)){
            this.lynxView.sendGlobalEvent(message.eventName, [
                message.payload
            ]);
        }
    }
    postToParent(message) {
        this.parentWindow.postMessage(message, this.parentOrigin);
    }
}

;// CONCATENATED MODULE: ./src/main.ts
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



function readAllowedParentOrigins() {
    const origins = new URLSearchParams(window.location.search).getAll('origin').filter((origin)=>{
        try {
            const url = new URL(origin);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch  {
            return false;
        }
    });
    if (origins.length === 0) origins.push(window.location.origin);
    return new Set(origins);
}
const root = document.getElementById('app-root');
if (!root) throw new Error('Missing #app-root element.');
const main_lynxView = document.createElement('lynx-view');
const bridge = new LynxComposerBridge(main_lynxView, window.parent, readAllowedParentOrigins(), document);
main_lynxView.className = 'lynx-preview';
main_lynxView.setAttribute('thread-strategy', 'multi-thread');
main_lynxView.setAttribute('transform-vh', 'true');
main_lynxView.setAttribute('transform-vw', 'true');
main_lynxView.setAttribute('url', new URL('./a2ui.web.js', window.location.href).toString());
root.append(main_lynxView);
const handleMessage = (event)=>bridge.handleMessage(event);
window.addEventListener('message', handleMessage);
const resizeObserver = new ResizeObserver(()=>bridge.reportSurfaceSize());
resizeObserver.observe(main_lynxView);
window.addEventListener('pagehide', ()=>{
    resizeObserver.disconnect();
    window.removeEventListener('message', handleMessage);
    bridge.destroy();
});


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
id: moduleId,
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

// expose the modules object (__webpack_modules__)
__webpack_require__.m = __webpack_modules__;

// expose the module cache
__webpack_require__.c = __webpack_module_cache__;

// webpack/runtime/async_module
(() => {
var hasSymbol = typeof Symbol === "function";
var rspackQueues = hasSymbol ? Symbol("rspack queues") : "__rspack_queues";
var rspackExports = __webpack_require__.aE = hasSymbol ? Symbol("rspack exports") : "__webpack_exports__";
var rspackError = hasSymbol ? Symbol("rspack error") : "__rspack_error";
var rspackDone = hasSymbol ? Symbol("rspack done") : "__rspack_done";
var rspackDefer = __webpack_require__.zS = hasSymbol ? Symbol("rspack defer") : "__rspack_defer";
__webpack_require__.zT = (asyncDeps) => {
	var hasUnresolvedAsyncSubgraph = asyncDeps.some((id) => {
		var cache = __webpack_module_cache__[id];
		return !cache || cache[rspackDone] === false;
	});
	if (hasUnresolvedAsyncSubgraph) {
		return ({ then(onFulfilled, onRejected) { return Promise.all(asyncDeps.map(__webpack_require__)).then(onFulfilled, onRejected) } });
	}
}
var resolveQueue = (queue) => {
	if (queue && queue.d < 1) {
		queue.d = 1;
    	queue.forEach((fn) => (fn.r--));
		queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
	}
}
var wrapDeps = (deps) => {
	return deps.map((dep) => {
		if (dep !== null && typeof dep === "object") {
			if(!dep[rspackQueues] && dep[rspackDefer]) {
				var asyncDeps = __webpack_require__.zT(dep[rspackDefer]);
				if (asyncDeps) {
					var d = dep;
					dep = {
						then(onFulfilled, onRejected) {
							asyncDeps.then(() => (onFulfilled(d)), onRejected);
						}
					};
				} else return dep;
			}
			if (dep[rspackQueues]) return dep;
			if (dep.then) {
				var queue = [];
				queue.d = 0;
				dep.then((r) => {
					obj[rspackExports] = r;
					resolveQueue(queue);
				},(e) => {
					obj[rspackError] = e;
					resolveQueue(queue);
				});
				var obj = {};
				obj[rspackDefer] = false;
				obj[rspackQueues] = (fn) => (fn(queue));
				return obj;
			}
		}
		var ret = {};
		ret[rspackQueues] = () => {};
		ret[rspackExports] = dep;
		return ret;
	});
};
__webpack_require__.a = (module, body, hasAwait, useModuleExports) => {
	var queue;
	hasAwait && ((queue = []).d = -1);
	var depQueues = new Set();
	var exports = module.exports;
	var currentDeps;
	var outerResolve;
	var reject;
	var promise = new Promise((resolve, rej) => {
		reject = rej;
		outerResolve = resolve;
	});
	promise[rspackExports] = exports;
	promise[rspackQueues] = (fn) => { queue && fn(queue), depQueues.forEach(fn), promise["catch"](() => {}); };
	module.exports = promise;
	var asyncModule = module;
	if (useModuleExports) {
		asyncModule = Object.create(module);
		asyncModule.exports = exports;
	}
	var handle = (deps) => {
		currentDeps = wrapDeps(deps);
		var fn;
		var getResult = () => {
			return currentDeps.map((d) => {
				if(d[rspackDefer]) return d;
				if (d[rspackError]) throw d[rspackError];
				return d[rspackExports];
			});
		}
		var promise = new Promise((resolve) => {
			fn = () => (resolve(getResult));
			fn.r = 0;
			var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
			currentDeps.map((dep) => (dep[rspackDefer] || dep[rspackQueues](fnQueue)));
		});
		return fn.r ? promise : getResult();
	};
	var done = (err) => ((err ? reject(promise[rspackError] = err) : (useModuleExports && (exports = promise[rspackExports] = asyncModule.exports), outerResolve(exports))), resolveQueue(queue), promise[rspackDone] = true);
	body(handle, done, asyncModule);
	queue && queue.d < 0 && (queue.d = 0);
};

})();
// webpack/runtime/compat_get_default_export
(() => {
// getDefaultExport function for compatibility with non-ESM modules
__webpack_require__.n = (module) => {
	var getter = module && module.__esModule ?
		() => (module['default']) :
		() => (module);
	__webpack_require__.d(getter, { a: getter });
	return getter;
};

})();
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
__webpack_require__.e = (chunkId, fetchPriority) => {
	return Promise.all(
		Object.keys(__webpack_require__.f).reduce((promises, key) => {
			__webpack_require__.f[key](chunkId, promises, fetchPriority);
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
  return "static/js/async/" + {166: "xmarkdown-deps",350: "web-core-template-loader-thread",778: "legacy-wasm-js",894: "web-core-main-chunk",97: "web-core-worker-chunk",}[chunkId] + "." + {166: "055e18e281",350: "e8f95146e8",778: "0ed4e7d10a",894: "617cb72d38",97: "ef3aaccfc7",}[chunkId] + ".js"
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
// webpack/runtime/load_script
(() => {
var inProgress = {};

var uniqueName = "lynx-basic-catalog:";
// loadScript function to load a script via script tag
__webpack_require__.l = function (url, done, key, chunkId, fetchPriority) {
	if (inProgress[url]) {
		inProgress[url].push(done);
		return;
	}
	var script, needAttach;
	if (key !== undefined) {
		var scripts = document.getElementsByTagName("script");
		for (var i = 0; i < scripts.length; i++) {
			var s = scripts[i];
			if (s.getAttribute("src") == url || s.getAttribute("data-rspack") == uniqueName + key) {
				script = s;
				break;
			}
		}
	}
	if (!script) {
		needAttach = true;
		script = document.createElement('script');

script.timeout = 120;
if (__webpack_require__.nc) {
  script.setAttribute("nonce", __webpack_require__.nc);
}

script.setAttribute("data-rspack", uniqueName + key);


if(fetchPriority) {
  script.setAttribute("fetchpriority", fetchPriority);
}


script.src = url;



	}
	inProgress[url] = [done];
	var onScriptComplete = function (prev, event) {
		script.onerror = script.onload = null;
		clearTimeout(timeout);
		var doneFns = inProgress[url];
		delete inProgress[url];
		script.parentNode && script.parentNode.removeChild(script);
		doneFns &&
			doneFns.forEach(function (fn) {
				return fn(event);
			});
		if (prev) return prev(event);
	};
	var timeout = setTimeout(
		onScriptComplete.bind(null, undefined, {
			type: 'timeout',
			target: script
		}),
		120000
	);
	script.onerror = onScriptComplete.bind(null, script.onerror);
	script.onload = onScriptComplete.bind(null, script.onload);
	needAttach && document.head.appendChild(script);
};

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
// webpack/runtime/on_chunk_loaded
(() => {
var deferred = [];
__webpack_require__.O = (result, chunkIds, fn, priority) => {
	if (chunkIds) {
		priority = priority || 0;
		for (var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--)
			deferred[i] = deferred[i - 1];
		deferred[i] = [chunkIds, fn, priority];
		return;
	}
	var notFulfilled = Infinity;
	for (var i = 0; i < deferred.length; i++) {
		var [chunkIds, fn, priority] = deferred[i];
		var fulfilled = true;
		for (var j = 0; j < chunkIds.length; j++) {
			if (
				(priority & (1 === 0) || notFulfilled >= priority) &&
				Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))
			) {
				chunkIds.splice(j--, 1);
			} else {
				fulfilled = false;
				if (priority < notFulfilled) notFulfilled = priority;
			}
		}
		if (fulfilled) {
			deferred.splice(i--, 1);
			var r = fn();
			if (r !== undefined) result = r;
		}
	}
	return result;
};

})();
// webpack/runtime/public_path
(() => {
__webpack_require__.p = "./";
})();
// webpack/runtime/jsonp_chunk_loading
(() => {
__webpack_require__.b = document.baseURI || self.location.href;

      // object to store loaded and loading chunks
      // undefined = chunk not loaded, null = chunk preloaded/prefetched
      // [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
      var jsonpInstalledChunks = {410: 0,};
      
        __webpack_require__.f.j = function (chunkId, promises, fetchPriority) {
          // JSONP chunk loading for javascript
var installedChunkData = __webpack_require__.o(jsonpInstalledChunks, chunkId)
	? jsonpInstalledChunks[chunkId]
	: undefined;
if (installedChunkData !== 0) {
	// 0 means "already installed".

	// a Promise means "currently loading".
	if (installedChunkData) {
		promises.push(installedChunkData[2]);
	} else {
		if (true) {
			// setup Promise in chunk cache
			var promise = new Promise((resolve, reject) => (installedChunkData = jsonpInstalledChunks[chunkId] = [resolve, reject]));
			promises.push((installedChunkData[2] = promise));

			// start chunk loading
			var url = __webpack_require__.p + __webpack_require__.u(chunkId);
			// create error before stack unwound to get useful stacktrace later
			var error = new Error();
			var loadingEnded = function (event) {
				if (__webpack_require__.o(jsonpInstalledChunks, chunkId)) {
					installedChunkData = jsonpInstalledChunks[chunkId];
					if (installedChunkData !== 0) jsonpInstalledChunks[chunkId] = undefined;
					if (installedChunkData) {
						var errorType =
							event && (event.type === 'load' ? 'missing' : event.type);
						var realSrc = event && event.target && event.target.src;
						error.message =
							'Loading chunk ' +
							chunkId +
							' failed.\n(' +
							errorType +
							': ' +
							realSrc +
							')';
						error.name = 'ChunkLoadError';
						error.type = errorType;
						error.request = realSrc;
						installedChunkData[1](error);
					}
				}
			};
			__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId, fetchPriority);
		} 
	}
}

        }
        __webpack_require__.O.j = (chunkId) => (jsonpInstalledChunks[chunkId] === 0);
// install a JSONP callback for chunk loading
var __rspack_jsonp = (parentChunkLoadingFunction, data) => {
	var [chunkIds, moreModules, runtime] = data;
	// add "moreModules" to the modules object,
	// then flag all "chunkIds" as loaded and fire callback
	var moduleId, chunkId, i = 0;
	if (chunkIds.some((id) => (jsonpInstalledChunks[id] !== 0))) {
		for (moduleId in moreModules) {
			if (__webpack_require__.o(moreModules, moduleId)) {
				__webpack_require__.m[moduleId] = moreModules[moduleId];
			}
		}
		if (runtime) var result = runtime(__webpack_require__);
	}
	if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
	for (; i < chunkIds.length; i++) {
		chunkId = chunkIds[i];
		if (
			__webpack_require__.o(jsonpInstalledChunks, chunkId) &&
			jsonpInstalledChunks[chunkId]
		) {
			jsonpInstalledChunks[chunkId][0]();
		}
		jsonpInstalledChunks[chunkId] = 0;
	}
	
	return __webpack_require__.O(result);
	
};

var jsonpChunkLoadingGlobal = self["rspackChunklynx_basic_catalog"] = self["rspackChunklynx_basic_catalog"] || [];
jsonpChunkLoadingGlobal.forEach(__rspack_jsonp.bind(null, 0));
jsonpChunkLoadingGlobal.push = __rspack_jsonp.bind(null, jsonpChunkLoadingGlobal.push.bind(jsonpChunkLoadingGlobal));

})();
// module factories are used so entry inlining is disabled
// startup
// Load entry module and return exports
var __webpack_exports__ = __webpack_require__.O(undefined, ["491", "109"], () => __webpack_require__(4445));
__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
})()
;