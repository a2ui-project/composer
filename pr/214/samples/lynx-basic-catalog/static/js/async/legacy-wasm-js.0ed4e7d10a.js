"use strict";
(self["rspackChunklynx_basic_catalog"] = self["rspackChunklynx_basic_catalog"] || []).push([[778], {
7702(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
/* @ts-self-types="./client.d.ts" */

/**
 *
 * * for return of __GetEvents
 *
 */
class EventInfo {
    static __wrap(ptr) {
        const obj = Object.create(EventInfo.prototype);
        obj.__wbg_ptr = ptr;
        EventInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EventInfoFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_eventinfo_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    get event_handler() {
        const ret = wasm.__wbg_get_eventinfo_event_handler(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @returns {string}
     */
    get event_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_eventinfo_event_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get event_type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_eventinfo_event_type(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {any} arg0
     */
    set event_handler(arg0) {
        wasm.__wbg_set_eventinfo_event_handler(this.__wbg_ptr, addHeapObject(arg0));
    }
    /**
     * @param {string} arg0
     */
    set event_name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eventinfo_event_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set event_type(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eventinfo_event_type(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) EventInfo.prototype[Symbol.dispose] = EventInfo.prototype.free;

class MainThreadWasmContext {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MainThreadWasmContextFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mainthreadwasmcontext_free(ptr, 0);
    }
    /**
     * Registers or removes a callback bound through `__AddEventListener`.
     *
     * `closure` of `None` removes: a specific callback when `remove_target` is
     * given, otherwise every callback for this event name and type. Unlike the
     * cross-thread and worklet slots, which hold a single handler each, this one
     * holds a list, so clearing has to know *which* callback to drop.
     * @param {number} unique_id
     * @param {string} event_type
     * @param {string} event_name
     * @param {any | null} [closure]
     * @param {any | null} [remove_target]
     */
    add_closure_event(unique_id, event_type, event_name, closure, remove_target) {
        const ptr0 = passStringToWasm0(event_type, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        wasm.mainthreadwasmcontext_add_closure_event(this.__wbg_ptr, unique_id, ptr0, len0, ptr1, len1, isLikeNone(closure) ? 0 : addHeapObject(closure), isLikeNone(remove_target) ? 0 : addHeapObject(remove_target));
    }
    /**
     * @param {number} unique_id
     * @param {string} event_type
     * @param {string} event_name
     * @param {string | null} [event_handler_identifier]
     */
    add_cross_thread_event(unique_id, event_type, event_name, event_handler_identifier) {
        const ptr0 = passStringToWasm0(event_type, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(event_handler_identifier) ? 0 : passStringToWasm0(event_handler_identifier, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len2 = WASM_VECTOR_LEN;
        wasm.mainthreadwasmcontext_add_cross_thread_event(this.__wbg_ptr, unique_id, ptr0, len0, ptr1, len1, ptr2, len2);
    }
    /**
     * @param {number} unique_id
     * @param {any} key
     * @param {any} value
     */
    add_dataset(unique_id, key, value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mainthreadwasmcontext_add_dataset(retptr, this.__wbg_ptr, unique_id, addBorrowedObject(key), addBorrowedObject(value));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {number} unique_id
     * @param {string} event_type
     * @param {string} event_name
     * @param {any | null} [event_handler_identifier]
     */
    add_run_worklet_event(unique_id, event_type, event_name, event_handler_identifier) {
        const ptr0 = passStringToWasm0(event_type, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        wasm.mainthreadwasmcontext_add_run_worklet_event(this.__wbg_ptr, unique_id, ptr0, len0, ptr1, len1, isLikeNone(event_handler_identifier) ? 0 : addHeapObject(event_handler_identifier));
    }
    /**
     * @param {any} event
     * @param {Uint32Array} bubble_unique_id_path
     * @param {string} event_name
     * @param {boolean} is_bubble
     */
    common_event_handler(event, bubble_unique_id_path, event_name, is_bubble) {
        const ptr0 = passArray32ToWasm0(bubble_unique_id_path, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        wasm.mainthreadwasmcontext_common_event_handler(this.__wbg_ptr, addHeapObject(event), ptr0, len0, ptr1, len1, is_bubble);
    }
    /**
     * @param {number} parent_component_unique_id
     * @param {HTMLElement} dom
     * @param {WeakRef<object>} dom_ref
     * @param {number | null} [component_css_id]
     * @param {string | null} [component_id]
     * @returns {number}
     */
    create_element_common(parent_component_unique_id, dom, dom_ref, component_css_id, component_id) {
        var ptr0 = isLikeNone(component_id) ? 0 : passStringToWasm0(component_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_create_element_common(this.__wbg_ptr, parent_component_unique_id, addHeapObject(dom), addHeapObject(dom_ref), isLikeNone(component_css_id) ? Number.MAX_SAFE_INTEGER : (component_css_id) >> 0, ptr0, len0);
        return ret >>> 0;
    }
    /**
     * @param {Uint32Array} bubble_unique_id_path
     * @param {string} event_name
     * @param {boolean} is_capture
     * @param {any} serialized_event
     * @returns {boolean}
     */
    dispatch_event_by_path(bubble_unique_id_path, event_name, is_capture, serialized_event) {
        try {
            const ptr0 = passArray32ToWasm0(bubble_unique_id_path, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.mainthreadwasmcontext_dispatch_event_by_path(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_capture, addBorrowedObject(serialized_event));
            return ret !== 0;
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {Uint32Array} bubble_unique_id_path
     * @param {string} event_name
     * @param {any} serialized_event
     */
    dispatch_global_bind_event(bubble_unique_id_path, event_name, serialized_event) {
        try {
            const ptr0 = passArray32ToWasm0(bubble_unique_id_path, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.mainthreadwasmcontext_dispatch_global_bind_event(this.__wbg_ptr, ptr0, len0, ptr1, len1, addBorrowedObject(serialized_event));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    gc() {
        wasm.mainthreadwasmcontext_gc(this.__wbg_ptr);
    }
    /**
     * @param {number} unique_id
     * @returns {string | undefined}
     */
    get_component_id(unique_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mainthreadwasmcontext_get_component_id(retptr, this.__wbg_ptr, unique_id);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unique_id
     * @returns {object}
     */
    get_config(unique_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mainthreadwasmcontext_get_config(retptr, this.__wbg_ptr, unique_id);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unique_id
     * @param {string} key
     * @returns {any}
     */
    get_data_by_key(unique_id, key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.mainthreadwasmcontext_get_data_by_key(retptr, this.__wbg_ptr, unique_id, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unique_id
     * @returns {object}
     */
    get_dataset(unique_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mainthreadwasmcontext_get_dataset(retptr, this.__wbg_ptr, unique_id);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unique_id
     * @returns {WeakRef<object> | undefined}
     */
    get_dom_by_unique_id(unique_id) {
        const ret = wasm.mainthreadwasmcontext_get_dom_by_unique_id(this.__wbg_ptr, unique_id);
        return takeObject(ret);
    }
    /**
     * @param {number} unique_id
     * @returns {object | undefined}
     */
    get_element_config(unique_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mainthreadwasmcontext_get_element_config(retptr, this.__wbg_ptr, unique_id);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unique_id
     * @param {string} event_name
     * @param {string} event_type
     * @returns {any}
     */
    get_event(unique_id, event_name, event_type) {
        const ptr0 = passStringToWasm0(event_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_type, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_get_event(this.__wbg_ptr, unique_id, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
     * @param {number} unique_id
     * @returns {EventInfo[]}
     */
    get_events(unique_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mainthreadwasmcontext_get_events(retptr, this.__wbg_ptr, unique_id);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string} component_id
     * @returns {number | undefined}
     */
    get_unique_id_by_component_id(component_id) {
        const ptr0 = passStringToWasm0(component_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_get_unique_id_by_component_id(this.__wbg_ptr, ptr0, len0);
        return ret === Number.MAX_SAFE_INTEGER ? undefined : ret;
    }
    /**
     * @param {Node} root_node
     * @param {any} mts_binding
     * @param {boolean} config_enable_css_selector
     */
    constructor(root_node, mts_binding, config_enable_css_selector) {
        const ret = wasm.mainthreadwasmcontext_new(addHeapObject(root_node), addHeapObject(mts_binding), config_enable_css_selector);
        this.__wbg_ptr = ret;
        MainThreadWasmContextFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {StyleSheetResource} style_info
     * @param {string | null} [entry_name]
     */
    push_style_sheet(style_info, entry_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(style_info, StyleSheetResource);
            var ptr0 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len0 = WASM_VECTOR_LEN;
            wasm.mainthreadwasmcontext_push_style_sheet(retptr, this.__wbg_ptr, style_info.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     *
     *   * key: String
     *   * value: stringifyed js value
     *
     * @param {number} unique_id
     * @param {object} config
     */
    set_config(unique_id, config) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mainthreadwasmcontext_set_config(retptr, this.__wbg_ptr, unique_id, addBorrowedObject(config));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {Uint32Array} elements_unique_id
     * @param {number} css_id
     * @param {string | null} [entry_name]
     */
    set_css_id(elements_unique_id, css_id, entry_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray32ToWasm0(elements_unique_id, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            wasm.mainthreadwasmcontext_set_css_id(retptr, this.__wbg_ptr, ptr0, len0, css_id, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unique_id
     * @param {HTMLElement} dom
     * @param {object} new_dataset
     */
    set_dataset(unique_id, dom, new_dataset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mainthreadwasmcontext_set_dataset(retptr, this.__wbg_ptr, unique_id, addBorrowedObject(dom), addBorrowedObject(new_dataset));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {number} unique_id
     */
    set_page_element_unique_id(unique_id) {
        wasm.mainthreadwasmcontext_set_page_element_unique_id(this.__wbg_ptr, unique_id);
    }
    /**
     * @returns {string[]}
     */
    take_timing_flags() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mainthreadwasmcontext_take_timing_flags(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unique_id
     * @param {number} component_css_id
     */
    update_component_css_id(unique_id, component_css_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mainthreadwasmcontext_update_component_css_id(retptr, this.__wbg_ptr, unique_id, component_css_id);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unique_id
     * @param {string | null} [component_id]
     */
    update_component_id(unique_id, component_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(component_id) ? 0 : passStringToWasm0(component_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len0 = WASM_VECTOR_LEN;
            wasm.mainthreadwasmcontext_update_component_id(retptr, this.__wbg_ptr, unique_id, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unique_id
     * @param {string | null} [entry_name]
     */
    update_css_og_style(unique_id, entry_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len0 = WASM_VECTOR_LEN;
            wasm.mainthreadwasmcontext_update_css_og_style(retptr, this.__wbg_ptr, unique_id, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) MainThreadWasmContext.prototype[Symbol.dispose] = MainThreadWasmContext.prototype.free;

class RawStyleInfo {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawStyleInfoFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawstyleinfo_free(ptr, 0);
    }
    /**
     *
     *   * Appends an import to the stylesheet identified by `css_id`.
     *   * If the stylesheet does not exist, it is created.
     *   * @param css_id - The ID of the CSS file.
     *   * @param import_css_id - The ID of the imported CSS file.
     *
     * @param {number} css_id
     * @param {number} import_css_id
     */
    append_import(css_id, import_css_id) {
        wasm.rawstyleinfo_append_import(this.__wbg_ptr, css_id, import_css_id);
    }
    constructor() {
        const ret = wasm.rawstyleinfo_new();
        this.__wbg_ptr = ret;
        RawStyleInfoFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     *
     *   * Pushes a rule to the stylesheet identified by `css_id`.
     *   * If the stylesheet does not exist, it is created.
     *   * @param css_id - The ID of the CSS file.
     *   * @param rule - The rule to append.
     *
     * @param {number} css_id
     * @param {Rule} rule
     */
    push_rule(css_id, rule) {
        _assertClass(rule, Rule);
        var ptr0 = rule.__destroy_into_raw();
        wasm.rawstyleinfo_push_rule(this.__wbg_ptr, css_id, ptr0);
    }
}
if (Symbol.dispose) RawStyleInfo.prototype[Symbol.dispose] = RawStyleInfo.prototype.free;

class Rule {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RuleFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rule_free(ptr, 0);
    }
    /**
     *
     *   * Creates a new Rule with the specified type.
     *   * @param rule_type - The type of the rule (e.g., "StyleRule", "FontFaceRule", "KeyframesRule").
     *
     * @param {string} rule_type
     */
    constructor(rule_type) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(rule_type, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.rule_new(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0;
            RuleFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     *
     *   * Pushes a declaration to the rule's declaration block.
     *   * LynxJS doesn't support !important
     *   * @param property_name - The property name.
     *   * @param value - The property value.
     *
     * @param {string} property_name
     * @param {string} value
     */
    push_declaration(property_name, value) {
        const ptr0 = passStringToWasm0(property_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(value, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        wasm.rule_push_declaration(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
    /**
     *
     *   * Pushes a nested rule to the rule.
     *   * @param rule - The nested rule to add.
     *
     * @param {Rule} rule
     */
    push_rule_children(rule) {
        _assertClass(rule, Rule);
        var ptr0 = rule.__destroy_into_raw();
        wasm.rule_push_rule_children(this.__wbg_ptr, ptr0);
    }
    /**
     *
     *   * Sets the prelude for the rule.
     *   * @param prelude - The prelude to set (SelectorList or KeyFramesPrelude).
     *
     * @param {RulePrelude} prelude
     */
    set_prelude(prelude) {
        _assertClass(prelude, RulePrelude);
        var ptr0 = prelude.__destroy_into_raw();
        wasm.rule_set_prelude(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) Rule.prototype[Symbol.dispose] = Rule.prototype.free;

/**
 *
 * * Either SelectorList or KeyFramesPrelude
 * * Depending on the RuleType
 * * If it is SelectorList, then selectors is a list of Selector
 * * If it is KeyFramesPrelude, then selectors has only one selector which is Prelude text, its simple_selectors is empty
 * * If the parent is FontFace, then selectors is empty
 *
 */
class RulePrelude {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RulePreludeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ruleprelude_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.ruleprelude_new();
        this.__wbg_ptr = ret;
        RulePreludeFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     *
     *   * Pushes a selector to the list.
     *   * @param selector - The selector to add.
     *
     * @param {Selector} selector
     */
    push_selector(selector) {
        _assertClass(selector, Selector);
        var ptr0 = selector.__destroy_into_raw();
        wasm.ruleprelude_push_selector(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) RulePrelude.prototype[Symbol.dispose] = RulePrelude.prototype.free;

class Selector {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SelectorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_selector_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.selector_new();
        this.__wbg_ptr = ret;
        SelectorFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     *
     *   * Pushes a selector section to the selector.
     *   * @param selector_type - The type of the selector section (e.g., "ClassSelector", "IdSelector").
     *   * @param value - The value of the selector section.
     *
     * @param {string} selector_type
     * @param {string} value
     */
    push_one_selector_section(selector_type, value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(selector_type, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(value, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.selector_push_one_selector_section(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) Selector.prototype[Symbol.dispose] = Selector.prototype.free;

class StyleSheetResource {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StyleSheetResourceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stylesheetresource_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} buffer
     * @param {any} _document
     */
    constructor(buffer, _document) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stylesheetresource_new(retptr, addHeapObject(buffer), addHeapObject(_document));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0;
            StyleSheetResourceFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) StyleSheetResource.prototype[Symbol.dispose] = StyleSheetResource.prototype.free;

/**
 *
 * * The key could be string or number
 * * The value could be string or number or null or undefined
 *
 * @param {HTMLElement} dom
 * @param {string} key
 * @param {string | null} [value]
 */
function add_inline_style_raw_string_key(dom, key, value) {
    try {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(value) ? 0 : passStringToWasm0(value, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len1 = WASM_VECTOR_LEN;
        wasm.add_inline_style_raw_string_key(addBorrowedObject(dom), ptr0, len0, ptr1, len1);
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
 * @param {Uint8Array} buffer
 * @param {string | null | undefined} entry_name
 * @param {boolean} config_enable_css_selector
 * @param {boolean} transform_vw
 * @param {boolean} transform_vh
 * @param {boolean} transform_rem
 * @returns {Uint8Array}
 */
function decode_style_info(buffer, entry_name, config_enable_css_selector, transform_vw, transform_vh, transform_rem) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.decode_style_info(retptr, addHeapObject(buffer), ptr0, len0, config_enable_css_selector, transform_vw, transform_vh, transform_rem);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * @param {RawStyleInfo} raw_style_info
 * @param {boolean} config_enable_css_selector
 * @param {string | null | undefined} entry_name
 * @param {boolean} transform_vw
 * @param {boolean} transform_vh
 * @param {boolean} transform_rem
 * @returns {Uint8Array}
 */
function encode_legacy_json_generated_raw_style_info(raw_style_info, config_enable_css_selector, entry_name, transform_vw, transform_vh, transform_rem) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(raw_style_info, RawStyleInfo);
        var ptr0 = raw_style_info.__destroy_into_raw();
        var ptr1 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len1 = WASM_VECTOR_LEN;
        wasm.encode_legacy_json_generated_raw_style_info(retptr, ptr0, config_enable_css_selector, ptr1, len1, transform_vw, transform_vh, transform_rem);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * @param {Uint8Array} buffer
 * @returns {string}
 */
function get_font_face_content(buffer) {
    let deferred2_0;
    let deferred2_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.get_font_face_content(retptr, addHeapObject(buffer));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
        var ptr1 = r0;
        var len1 = r1;
        if (r3) {
            ptr1 = 0; len1 = 0;
            throw takeObject(r2);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {Uint8Array} buffer
 * @returns {string}
 */
function get_style_content(buffer) {
    let deferred2_0;
    let deferred2_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.get_style_content(retptr, addHeapObject(buffer));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
        var ptr1 = r0;
        var len1 = r1;
        if (r3) {
            ptr1 = 0; len1 = 0;
            throw takeObject(r2);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {HTMLElement} dom
 * @param {string[]} k_v_vec
 * @param {boolean} transform_vw
 * @param {boolean} transform_vh
 * @param {boolean} transform_rem
 */
function set_inline_styles_in_key_value_vec(dom, k_v_vec, transform_vw, transform_vh, transform_rem) {
    try {
        const ptr0 = passArrayJsValueToWasm0(k_v_vec, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.set_inline_styles_in_key_value_vec(addBorrowedObject(dom), ptr0, len0, transform_vw, transform_vh, transform_rem);
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
 * @param {HTMLElement} dom
 * @param {string} styles
 * @param {boolean} transform_vw
 * @param {boolean} transform_vh
 * @param {boolean} transform_rem
 * @returns {boolean}
 */
function set_inline_styles_in_str(dom, styles, transform_vw, transform_vh, transform_rem) {
    try {
        const ptr0 = passStringToWasm0(styles, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.set_inline_styles_in_str(addBorrowedObject(dom), ptr0, len0, transform_vw, transform_vh, transform_rem);
        return ret !== 0;
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
 * @param {HTMLElement} dom
 * @param {number} key
 * @param {string | null} [value]
 */
function set_inline_styles_number_key(dom, key, value) {
    try {
        var ptr0 = isLikeNone(value) ? 0 : passStringToWasm0(value, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.set_inline_styles_number_key(addBorrowedObject(dom), key, ptr0, len0);
    } finally {
        heap[stack_pointer++] = undefined;
    }
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_92b29b0548f8b746: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg___wbindgen_debug_string_c25d447a39f5578f: function(arg0, arg1) {
            const ret = debugString(getObject(arg1));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_is_null_ea9085d691f535d3: function(arg0) {
            const ret = getObject(arg0) === null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_c05833b95a3cf397: function(arg0) {
            const ret = getObject(arg0) === undefined;
            return ret;
        },
        __wbg___wbindgen_jsval_eq_e659fcf7b0e32763: function(arg0, arg1) {
            const ret = getObject(arg0) === getObject(arg1);
            return ret;
        },
        __wbg___wbindgen_string_get_b0ca35b86a603356: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_addEventListener_514c0d1b9cb98d61: function(arg0, arg1, arg2) {
            getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2));
        },
        __wbg_appendChild_f553e8704c4f14a6: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).appendChild(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_cloneNode_5f99da4333e10617: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).cloneNode(arg1 !== 0);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_createElement_fcbc0805de826d62: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_cssRules_a96ba5e195723d36: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).cssRules;
            return addHeapObject(ret);
        }, arguments); },
        __wbg_deref_e6425a8fa9d03a9d: function(arg0) {
            const ret = getObject(arg0).deref();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_disableElementEvent_00750da2a3d98d3b: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            getObject(arg0).disableElementEvent(getObject(arg1), getStringFromWasm0(arg2, arg3));
        }, arguments); },
        __wbg_enableElementEvent_d3b114945b78a398: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            getObject(arg0).enableElementEvent(getObject(arg1), getStringFromWasm0(arg2, arg3));
        }, arguments); },
        __wbg_eventinfo_new: function(arg0) {
            const ret = EventInfo.__wrap(arg0);
            return addHeapObject(ret);
        },
        __wbg_getClassList_4ef38849a4003220: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg1).getClassList(getObject(arg2));
            const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_get_507a50627bffa49b: function(arg0, arg1) {
            const ret = getObject(arg0)[arg1 >>> 0];
            return addHeapObject(ret);
        },
        __wbg_get_78f252d074a84d0b: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_has_8374cf06984d8bfc: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.has(getObject(arg0), getObject(arg1));
            return ret;
        }, arguments); },
        __wbg_host_18450e7fb2bf2108: function(arg0) {
            const ret = getObject(arg0).host;
            return addHeapObject(ret);
        },
        __wbg_insertRule_7f44b1a334b975c5: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).insertRule(getStringFromWasm0(arg1, arg2), arg3 >>> 0);
            return ret;
        }, arguments); },
        __wbg_item_6c9c57d2b0d3b03b: function(arg0, arg1) {
            const ret = getObject(arg0).item(arg1 >>> 0);
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_keys_58421f8f96795607: function(arg0) {
            const ret = Object.keys(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_length_1f0964f4a5e2c6d8: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_length_370319915dc99107: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_length_c9d11fa3c1e97549: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_new_da52cf8fe3429cb2: function() {
            const ret = new Object();
            return addHeapObject(ret);
        },
        __wbg_new_from_slice_77cdfb7977362f3c: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg_ownerDocument_5a7a5473f8709b3e: function(arg0) {
            const ret = getObject(arg0).ownerDocument;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_prototypesetcall_4770620bbe4688a0: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
        },
        __wbg_publishEvent_98f316996d32c83c: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).publishEvent(getStringFromWasm0(arg1, arg2), arg3 === 0 ? undefined : getStringFromWasm0(arg3, arg4), getObject(arg5), arg6 >>> 0, getObject(arg7), arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_removeAttribute_1e7d2c409776d836: function() { return handleError(function (arg0, arg1, arg2) {
            getObject(arg0).removeAttribute(getStringFromWasm0(arg1, arg2));
        }, arguments); },
        __wbg_removeAttribute_425b95bcfcd686d9: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            getObject(arg0).removeAttribute(getObject(arg1), getStringFromWasm0(arg2, arg3));
        }, arguments); },
        __wbg_removeProperty_70da952bc1b493fa: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg1).removeProperty(getStringFromWasm0(arg2, arg3));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_runElementClosure_6b4e42c656f6ee9d: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).runElementClosure(getObject(arg1), getObject(arg2), arg3 >>> 0, getObject(arg4), arg5 >>> 0, getObject(arg6));
        },
        __wbg_runWorklet_3484f0c70445f9a7: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).runWorklet(getObject(arg1), getObject(arg2), arg3 >>> 0, getObject(arg4), arg5 >>> 0, getObject(arg6));
        }, arguments); },
        __wbg_setAttribute_39a501bc57b5d356: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).setAttribute(getObject(arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5));
        }, arguments); },
        __wbg_setAttribute_71039043be82d098: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments); },
        __wbg_setProperty_e4e51b1b1d681d15: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments); },
        __wbg_set_8535240470bf2500: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
            return ret;
        }, arguments); },
        __wbg_set_cssText_1d203a1b8ff80e20: function(arg0, arg1, arg2) {
            getObject(arg0).cssText = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_textContent_54dcad83ae15772d: function(arg0, arg1, arg2) {
            getObject(arg0).textContent = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
        },
        __wbg_sheet_9201185a230c1cdc: function(arg0) {
            const ret = getObject(arg0).sheet;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_style_00ba0d9bec50983f: function(arg0) {
            const ret = getObject(arg0).style;
            return addHeapObject(ret);
        },
        __wbg_style_6657aed849e5d757: function(arg0) {
            const ret = getObject(arg0).style;
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_object_clone_ref: function(arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
    };
    return {
        __proto__: null,
        "./client_bg.js": import0,
    };
}

const EventInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_eventinfo_free(ptr, 1));
const MainThreadWasmContextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_mainthreadwasmcontext_free(ptr, 1));
const RawStyleInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawstyleinfo_free(ptr, 1));
const RuleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rule_free(ptr, 1));
const RulePreludeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_ruleprelude_free(ptr, 1));
const SelectorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_selector_free(ptr, 1));
const StyleSheetResourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_stylesheetresource_free(ptr, 1));

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function dropObject(idx) {
    if (idx < 1028) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(takeObject(mem.getUint32(i, true)));
    }
    return result;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export3(addHeapObject(e));
    }
}

let heap = new Array(1024).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let stack_pointer = 1024;

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL(/* asset import */__webpack_require__(469), __webpack_require__.b);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}



__webpack_require__.d(__webpack_exports__, {
  EventInfo: () => (EventInfo),
  MainThreadWasmContext: () => (MainThreadWasmContext),
  RawStyleInfo: () => (RawStyleInfo),
  Rule: () => (Rule),
  RulePrelude: () => (RulePrelude),
  Selector: () => (Selector),
  StyleSheetResource: () => (StyleSheetResource),
  add_inline_style_raw_string_key: () => (add_inline_style_raw_string_key),
  decode_style_info: () => (decode_style_info),
  "default": () => (__wbg_init),
  encode_legacy_json_generated_raw_style_info: () => (encode_legacy_json_generated_raw_style_info),
  get_font_face_content: () => (get_font_face_content),
  get_style_content: () => (get_style_content),
  initSync: () => (initSync),
  set_inline_styles_in_key_value_vec: () => (set_inline_styles_in_key_value_vec),
  set_inline_styles_in_str: () => (set_inline_styles_in_str),
  set_inline_styles_number_key: () => (set_inline_styles_number_key)
});


},

}]);