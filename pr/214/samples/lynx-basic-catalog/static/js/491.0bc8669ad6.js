"use strict";
(self["rspackChunklynx_basic_catalog"] = self["rspackChunklynx_basic_catalog"] || []).push([[491], {
917(module, __unused_rspack_exports, __webpack_require__) {
module.exports = __webpack_require__.p + "static/wasm/4c402c7981.module.wasm";

},
469(module, __unused_rspack_exports, __webpack_require__) {
module.exports = __webpack_require__.p + "static/wasm/72aaf7d0aa.module.wasm";

},
3622(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
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
        return ret;
    }
    /**
     * @returns {string}
     */
    get event_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_eventinfo_event_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get event_type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_eventinfo_event_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {any} arg0
     */
    set event_handler(arg0) {
        wasm.__wbg_set_eventinfo_event_handler(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string} arg0
     */
    set event_name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eventinfo_event_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set event_type(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
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
        const ptr0 = passStringToWasm0(event_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.mainthreadwasmcontext_add_closure_event(this.__wbg_ptr, unique_id, ptr0, len0, ptr1, len1, isLikeNone(closure) ? 0 : addToExternrefTable0(closure), isLikeNone(remove_target) ? 0 : addToExternrefTable0(remove_target));
    }
    /**
     * @param {number} unique_id
     * @param {string} event_type
     * @param {string} event_name
     * @param {string | null} [event_handler_identifier]
     */
    add_cross_thread_event(unique_id, event_type, event_name, event_handler_identifier) {
        const ptr0 = passStringToWasm0(event_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(event_handler_identifier) ? 0 : passStringToWasm0(event_handler_identifier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        wasm.mainthreadwasmcontext_add_cross_thread_event(this.__wbg_ptr, unique_id, ptr0, len0, ptr1, len1, ptr2, len2);
    }
    /**
     * @param {number} unique_id
     * @param {any} key
     * @param {any} value
     */
    add_dataset(unique_id, key, value) {
        const ret = wasm.mainthreadwasmcontext_add_dataset(this.__wbg_ptr, unique_id, key, value);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {number} unique_id
     * @param {string} event_type
     * @param {string} event_name
     * @param {any | null} [event_handler_identifier]
     */
    add_run_worklet_event(unique_id, event_type, event_name, event_handler_identifier) {
        const ptr0 = passStringToWasm0(event_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.mainthreadwasmcontext_add_run_worklet_event(this.__wbg_ptr, unique_id, ptr0, len0, ptr1, len1, isLikeNone(event_handler_identifier) ? 0 : addToExternrefTable0(event_handler_identifier));
    }
    /**
     * @param {any} event
     * @param {Uint32Array} bubble_unique_id_path
     * @param {string} event_name
     * @param {boolean} is_bubble
     */
    common_event_handler(event, bubble_unique_id_path, event_name, is_bubble) {
        const ptr0 = passArray32ToWasm0(bubble_unique_id_path, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.mainthreadwasmcontext_common_event_handler(this.__wbg_ptr, event, ptr0, len0, ptr1, len1, is_bubble);
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
        var ptr0 = isLikeNone(component_id) ? 0 : passStringToWasm0(component_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_create_element_common(this.__wbg_ptr, parent_component_unique_id, dom, dom_ref, isLikeNone(component_css_id) ? Number.MAX_SAFE_INTEGER : (component_css_id) >> 0, ptr0, len0);
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
        const ptr0 = passArray32ToWasm0(bubble_unique_id_path, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_dispatch_event_by_path(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_capture, serialized_event);
        return ret !== 0;
    }
    /**
     * @param {Uint32Array} bubble_unique_id_path
     * @param {string} event_name
     * @param {any} serialized_event
     */
    dispatch_global_bind_event(bubble_unique_id_path, event_name, serialized_event) {
        const ptr0 = passArray32ToWasm0(bubble_unique_id_path, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.mainthreadwasmcontext_dispatch_global_bind_event(this.__wbg_ptr, ptr0, len0, ptr1, len1, serialized_event);
    }
    gc() {
        wasm.mainthreadwasmcontext_gc(this.__wbg_ptr);
    }
    /**
     * @param {number} unique_id
     * @returns {string | undefined}
     */
    get_component_id(unique_id) {
        const ret = wasm.mainthreadwasmcontext_get_component_id(this.__wbg_ptr, unique_id);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {number} unique_id
     * @returns {object}
     */
    get_config(unique_id) {
        const ret = wasm.mainthreadwasmcontext_get_config(this.__wbg_ptr, unique_id);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} unique_id
     * @param {string} key
     * @returns {any}
     */
    get_data_by_key(unique_id, key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_get_data_by_key(this.__wbg_ptr, unique_id, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} unique_id
     * @returns {object}
     */
    get_dataset(unique_id) {
        const ret = wasm.mainthreadwasmcontext_get_dataset(this.__wbg_ptr, unique_id);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} unique_id
     * @returns {WeakRef<object> | undefined}
     */
    get_dom_by_unique_id(unique_id) {
        const ret = wasm.mainthreadwasmcontext_get_dom_by_unique_id(this.__wbg_ptr, unique_id);
        return ret;
    }
    /**
     * @param {number} unique_id
     * @returns {object | undefined}
     */
    get_element_config(unique_id) {
        const ret = wasm.mainthreadwasmcontext_get_element_config(this.__wbg_ptr, unique_id);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} unique_id
     * @param {string} event_name
     * @param {string} event_type
     * @returns {any}
     */
    get_event(unique_id, event_name, event_type) {
        const ptr0 = passStringToWasm0(event_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_get_event(this.__wbg_ptr, unique_id, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * @param {number} unique_id
     * @returns {EventInfo[]}
     */
    get_events(unique_id) {
        const ret = wasm.mainthreadwasmcontext_get_events(this.__wbg_ptr, unique_id);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string} component_id
     * @returns {number | undefined}
     */
    get_unique_id_by_component_id(component_id) {
        const ptr0 = passStringToWasm0(component_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
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
        const ret = wasm.mainthreadwasmcontext_new(root_node, mts_binding, config_enable_css_selector);
        this.__wbg_ptr = ret;
        MainThreadWasmContextFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {StyleSheetResource} style_info
     * @param {string | null} [entry_name]
     */
    push_style_sheet(style_info, entry_name) {
        _assertClass(style_info, StyleSheetResource);
        var ptr0 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_push_style_sheet(this.__wbg_ptr, style_info.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
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
        const ret = wasm.mainthreadwasmcontext_set_config(this.__wbg_ptr, unique_id, config);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {Uint32Array} elements_unique_id
     * @param {number} css_id
     * @param {string | null} [entry_name]
     */
    set_css_id(elements_unique_id, css_id, entry_name) {
        const ptr0 = passArray32ToWasm0(elements_unique_id, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_set_css_id(this.__wbg_ptr, ptr0, len0, css_id, ptr1, len1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {number} unique_id
     * @param {HTMLElement} dom
     * @param {object} new_dataset
     */
    set_dataset(unique_id, dom, new_dataset) {
        const ret = wasm.mainthreadwasmcontext_set_dataset(this.__wbg_ptr, unique_id, dom, new_dataset);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
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
        const ret = wasm.mainthreadwasmcontext_take_timing_flags(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {number} unique_id
     * @param {number} component_css_id
     */
    update_component_css_id(unique_id, component_css_id) {
        const ret = wasm.mainthreadwasmcontext_update_component_css_id(this.__wbg_ptr, unique_id, component_css_id);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {number} unique_id
     * @param {string | null} [component_id]
     */
    update_component_id(unique_id, component_id) {
        var ptr0 = isLikeNone(component_id) ? 0 : passStringToWasm0(component_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_update_component_id(this.__wbg_ptr, unique_id, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {number} unique_id
     * @param {string | null} [entry_name]
     */
    update_css_og_style(unique_id, entry_name) {
        var ptr0 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.mainthreadwasmcontext_update_css_og_style(this.__wbg_ptr, unique_id, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
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
        const ptr0 = passStringToWasm0(rule_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rule_new(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        RuleFinalization.register(this, this.__wbg_ptr, this);
        return this;
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
        const ptr0 = passStringToWasm0(property_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
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
        const ptr0 = passStringToWasm0(selector_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.selector_push_one_selector_section(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
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
        const ret = wasm.stylesheetresource_new(buffer, _document);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        StyleSheetResourceFinalization.register(this, this.__wbg_ptr, this);
        return this;
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
    const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(value) ? 0 : passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    wasm.add_inline_style_raw_string_key(dom, ptr0, len0, ptr1, len1);
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
    var ptr0 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.decode_style_info(buffer, ptr0, len0, config_enable_css_selector, transform_vw, transform_vh, transform_rem);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
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
    _assertClass(raw_style_info, RawStyleInfo);
    var ptr0 = raw_style_info.__destroy_into_raw();
    var ptr1 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.encode_legacy_json_generated_raw_style_info(ptr0, config_enable_css_selector, ptr1, len1, transform_vw, transform_vh, transform_rem);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} buffer
 * @returns {string}
 */
function get_font_face_content(buffer) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.get_font_face_content(buffer);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
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
        const ret = wasm.get_style_content(buffer);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
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
    const ptr0 = passArrayJsValueToWasm0(k_v_vec, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_inline_styles_in_key_value_vec(dom, ptr0, len0, transform_vw, transform_vh, transform_rem);
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
    const ptr0 = passStringToWasm0(styles, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.set_inline_styles_in_str(dom, ptr0, len0, transform_vw, transform_vh, transform_rem);
    return ret !== 0;
}

/**
 * @param {HTMLElement} dom
 * @param {number} key
 * @param {string | null} [value]
 */
function set_inline_styles_number_key(dom, key, value) {
    var ptr0 = isLikeNone(value) ? 0 : passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.set_inline_styles_number_key(dom, key, ptr0, len0);
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_92b29b0548f8b746: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg___wbindgen_debug_string_c25d447a39f5578f: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_is_null_ea9085d691f535d3: function(arg0) {
            const ret = arg0 === null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_c05833b95a3cf397: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_jsval_eq_e659fcf7b0e32763: function(arg0, arg1) {
            const ret = arg0 === arg1;
            return ret;
        },
        __wbg___wbindgen_string_get_b0ca35b86a603356: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_addEventListener_514c0d1b9cb98d61: function(arg0, arg1, arg2) {
            arg0.addEventListener(getStringFromWasm0(arg1, arg2));
        },
        __wbg_appendChild_f553e8704c4f14a6: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.appendChild(arg1);
            return ret;
        }, arguments); },
        __wbg_cloneNode_5f99da4333e10617: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.cloneNode(arg1 !== 0);
            return ret;
        }, arguments); },
        __wbg_createElement_fcbc0805de826d62: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.createElement(getStringFromWasm0(arg1, arg2));
            return ret;
        }, arguments); },
        __wbg_cssRules_a96ba5e195723d36: function() { return handleError(function (arg0) {
            const ret = arg0.cssRules;
            return ret;
        }, arguments); },
        __wbg_deref_e6425a8fa9d03a9d: function(arg0) {
            const ret = arg0.deref();
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_disableElementEvent_00750da2a3d98d3b: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            arg0.disableElementEvent(arg1, getStringFromWasm0(arg2, arg3));
        }, arguments); },
        __wbg_enableElementEvent_d3b114945b78a398: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            arg0.enableElementEvent(arg1, getStringFromWasm0(arg2, arg3));
        }, arguments); },
        __wbg_eventinfo_new: function(arg0) {
            const ret = EventInfo.__wrap(arg0);
            return ret;
        },
        __wbg_getClassList_4ef38849a4003220: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg1.getClassList(arg2);
            const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_get_507a50627bffa49b: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_78f252d074a84d0b: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_has_8374cf06984d8bfc: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.has(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_host_18450e7fb2bf2108: function(arg0) {
            const ret = arg0.host;
            return ret;
        },
        __wbg_insertRule_7f44b1a334b975c5: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg0.insertRule(getStringFromWasm0(arg1, arg2), arg3 >>> 0);
            return ret;
        }, arguments); },
        __wbg_item_6c9c57d2b0d3b03b: function(arg0, arg1) {
            const ret = arg0.item(arg1 >>> 0);
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_keys_58421f8f96795607: function(arg0) {
            const ret = Object.keys(arg0);
            return ret;
        },
        __wbg_length_1f0964f4a5e2c6d8: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_370319915dc99107: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_c9d11fa3c1e97549: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_new_da52cf8fe3429cb2: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_from_slice_77cdfb7977362f3c: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_ownerDocument_5a7a5473f8709b3e: function(arg0) {
            const ret = arg0.ownerDocument;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_prototypesetcall_4770620bbe4688a0: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        },
        __wbg_publishEvent_98f316996d32c83c: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            arg0.publishEvent(getStringFromWasm0(arg1, arg2), arg3 === 0 ? undefined : getStringFromWasm0(arg3, arg4), arg5, arg6 >>> 0, arg7, arg8 >>> 0, arg9);
        }, arguments); },
        __wbg_removeAttribute_1e7d2c409776d836: function() { return handleError(function (arg0, arg1, arg2) {
            arg0.removeAttribute(getStringFromWasm0(arg1, arg2));
        }, arguments); },
        __wbg_removeAttribute_425b95bcfcd686d9: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            arg0.removeAttribute(arg1, getStringFromWasm0(arg2, arg3));
        }, arguments); },
        __wbg_removeProperty_70da952bc1b493fa: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg1.removeProperty(getStringFromWasm0(arg2, arg3));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_runElementClosure_6b4e42c656f6ee9d: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.runElementClosure(arg1, arg2, arg3 >>> 0, arg4, arg5 >>> 0, arg6);
        },
        __wbg_runWorklet_3484f0c70445f9a7: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.runWorklet(arg1, arg2, arg3 >>> 0, arg4, arg5 >>> 0, arg6);
        }, arguments); },
        __wbg_setAttribute_39a501bc57b5d356: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.setAttribute(arg1, getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5));
        }, arguments); },
        __wbg_setAttribute_71039043be82d098: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            arg0.setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments); },
        __wbg_setProperty_e4e51b1b1d681d15: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            arg0.setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments); },
        __wbg_set_8535240470bf2500: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_set_cssText_1d203a1b8ff80e20: function(arg0, arg1, arg2) {
            arg0.cssText = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_textContent_54dcad83ae15772d: function(arg0, arg1, arg2) {
            arg0.textContent = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
        },
        __wbg_sheet_9201185a230c1cdc: function(arg0) {
            const ret = arg0.sheet;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_style_00ba0d9bec50983f: function(arg0) {
            const ret = arg0.style;
            return ret;
        },
        __wbg_style_6657aed849e5d757: function(arg0) {
            const ret = arg0.style;
            return ret;
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
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

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
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

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
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

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

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
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
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

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
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
    wasm.__wbindgen_start();
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
        module_or_path = new URL(/* asset import */__webpack_require__(917), __webpack_require__.b);
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
1773(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
const bigInt=()=>(async e=>{try{return(await WebAssembly.instantiate(e)).instance.exports.b(BigInt(0))===BigInt(0)}catch(e){return!1}})(new Uint8Array([0,97,115,109,1,0,0,0,1,6,1,96,1,126,1,126,3,2,1,0,7,5,1,1,98,0,0,10,6,1,4,0,32,0,11])),bulkMemory=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,3,1,0,1,10,14,1,12,0,65,0,65,0,65,0,252,10,0,0,11])),exceptions=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,8,1,6,0,6,64,25,11,11])),exceptionsFinal=()=>(async()=>{try{return new WebAssembly.Module(Uint8Array.from(atob("AGFzbQEAAAABBAFgAAADAgEAChABDgACaR9AAQMAAAsACxoL"),(e=>e.codePointAt(0)))),!0}catch(e){return!1}})(),extendedConst=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,5,3,1,0,1,11,9,1,0,65,1,65,2,106,11,0])),gc=()=>(async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,95,1,120,0])))(),jsStringBuiltins=()=>(async()=>{try{return await WebAssembly.instantiate(Uint8Array.from(atob("AGFzbQEAAAABBgFgAW8BfwIXAQ53YXNtOmpzLXN0cmluZwR0ZXN0AAA="),(e=>e.codePointAt(0))),{},{builtins:["js-string"]}),!0}catch(e){return!1}})(),jspi=()=>(async()=>"Suspending"in WebAssembly)(),memory64=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,5,3,1,4,1])),multiMemory=()=>(async()=>{try{return new WebAssembly.Module(new Uint8Array([0,97,115,109,1,0,0,0,5,5,2,0,0,0,0])),!0}catch(e){return!1}})(),multiValue=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,6,1,96,0,2,127,127,3,2,1,0,10,8,1,6,0,65,0,65,0,11])),mutableGlobals=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,2,8,1,1,97,1,98,3,127,1,6,6,1,127,1,65,0,11,7,5,1,1,97,3,1])),referenceTypes=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,7,1,5,0,208,112,26,11])),relaxedSimd=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,15,1,13,0,65,1,253,15,65,2,253,15,253,128,2,11])),saturatedFloatToInt=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,12,1,10,0,67,0,0,0,0,252,0,26,11])),signExtensions=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,8,1,6,0,65,0,192,26,11])),simd=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11])),streamingCompilation=()=>(async()=>"compileStreaming"in WebAssembly)(),tailCall=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,6,1,4,0,18,0,11])),threads=()=>(async e=>{try{return"undefined"!=typeof MessageChannel&&(new MessageChannel).port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(e)}catch(e){return!1}})(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11])),typeReflection=()=>(async()=>"Function"in WebAssembly)(),typedFunctionReferences=()=>(async()=>{try{return new WebAssembly.Module(Uint8Array.from(atob("AGFzbQEAAAABEANgAX8Bf2ABZAABf2AAAX8DBAMBAAIJBQEDAAEBChwDCwBBCkEqIAAUAGoLBwAgAEEBagsGANIBEAAL"),(e=>e.codePointAt(0)))),!0}catch(e){return!1}})(),wideArithmetic=()=>(async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,10,1,96,4,126,126,126,126,2,126,126,3,2,1,0,10,14,1,12,0,32,0,32,1,32,2,32,3,252,19,11])))();

__webpack_require__.d(__webpack_exports__, {
}, {
  oR: simd,
  rO: referenceTypes
});


},

}]);