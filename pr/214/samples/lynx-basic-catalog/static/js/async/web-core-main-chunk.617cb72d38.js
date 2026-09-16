"use strict";
(self["rspackChunklynx_basic_catalog"] = self["rspackChunklynx_basic_catalog"] || []).push([[894], {
6271(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_3 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_3_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_3);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_2 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_2_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_2);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_index_css__rspack_import_0 = __webpack_require__(7061);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_web_elements_index_css__rspack_import_1 = __webpack_require__(4367);
// Imports




var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_2_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_3_default()));
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_index_css__rspack_import_0/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_web_elements_index_css__rspack_import_1/* ["default"] */.A);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `[lynx-default-display-linear="false"] * {
  --lynx-display: flex;
  --lynx-display-toggle: var(--lynx-display-flex);
}

[lynx-default-overflow-visible="true"] x-view {
  overflow: visible;
}

[lynx-enable-css-inheritance="true"] :where(x-view > x-text, x-view > lynx-wrapper, x-view > lynx-wrapper > x-text) {
  color: inherit;
  --lynx-text-bg-color: inherit;
  background-clip: inherit;
  -webkit-background-clip: inherit;
  direction: inherit;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  text-align: inherit;
  -webkit-text-decoration: inherit;
  text-decoration: inherit;
  text-shadow: inherit;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
7061(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:host, lynx-view {
  contain: strict;
  --rpx-unit: calc(1cqw / 7.5);
  --ppx-unit: 1cqw;
  --vw-unit: 1cqw;
  --vh-unit: 1cqh;
  width: 100%;
  display: none;
  container: lynx-view / inline-size;
}

:host([transform-vh]), lynx-view[transform-vh] {
  container-type: size;
}

:host([ssr]), lynx-view[ssr] {
  display: flex;
}

:host([width="auto"]), lynx-view[width="auto"] {
  --lynx-view-width: 100%;
  width: var(--lynx-view-width);
  inline-size: var(--lynx-view-width);
}

:host([height="auto"]), :host([auto-height]), :host([width="auto"]), lynx-view[height="auto"], lynx-view[auto-height], lynx-view[width="auto"] {
  contain: content;
}

[part="page"], lynx-view::part(page) {
  --rpx-unit: inherit;
  --ppx-unit: inherit;
  --vw-unit: inherit;
  --vh-unit: inherit;
  width: 100%;
  height: 100%;
}

@property --lynx-display {
  syntax: "linear | flex";
  inherits: false;
  initial-value: linear;
}

@property --lynx-linear-weight-sum {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

@property --lynx-linear-weight {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

@property --justify-content-column {
  syntax: "flex-start | flex-end | center | space-between | space-around";
  inherits: false;
  initial-value: flex-start;
}

@property --justify-content-column-reverse {
  syntax: "flex-start | flex-end | center | space-between | space-around";
  inherits: false;
  initial-value: flex-start;
}

@property --justify-content-row {
  syntax: "flex-start | flex-end | center | space-between | space-around";
  inherits: false;
  initial-value: flex-start;
}

@property --justify-content-row-reverse {
  syntax: "flex-start | flex-end | center | space-between | space-around";
  inherits: false;
  initial-value: flex-start;
}

@property --align-self-row {
  syntax: "start | end | center | stretch | auto";
  inherits: false;
  initial-value: auto;
}

@property --align-self-column {
  syntax: "start | end | center | stretch | auto";
  inherits: false;
  initial-value: auto;
}

@property --lynx-linear-weight-basis {
  syntax: "auto | <number> | <length>";
  inherits: false;
  initial-value: auto;
}

@property --lynx-linear-orientation {
  syntax: "<custom-ident>";
  inherits: false;
  initial-value: vertical;
}

@property --flex-direction {
  syntax: "*";
  inherits: false
}

@property --flex-wrap {
  syntax: "*";
  inherits: false
}

@property --flex-grow {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

@property --flex-shrink {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

@property --flex-basis {
  syntax: "*";
  inherits: false;
  initial-value: auto;
}

@property --flex-value {
  syntax: "*";
  inherits: false
}

@property --flex {
  syntax: "*";
  inherits: false
}

@property --linear-justify-content {
  syntax: "flex-start | flex-end | center | space-between | space-around";
  inherits: false;
  initial-value: flex-start;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
4367(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_19 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_19_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_19);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_18 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_18_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_18);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_compat_LinearContainer_linear_compat_css__rspack_import_0 = __webpack_require__(2194);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_common_css_linear_css__rspack_import_1 = __webpack_require__(2471);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_LynxWrapper_lynx_wrapper_css__rspack_import_2 = __webpack_require__(3080);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XText_x_text_css__rspack_import_3 = __webpack_require__(5182);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_ScrollView_scroll_view_css__rspack_import_4 = __webpack_require__(4868);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XFoldViewNg_x_foldview_ng_css__rspack_import_5 = __webpack_require__(8287);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XViewpagerNg_x_viewpager_ng_css__rspack_import_6 = __webpack_require__(6393);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XCanvas_x_canvas_css__rspack_import_7 = __webpack_require__(2116);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XSvg_x_svg_css__rspack_import_8 = __webpack_require__(4732);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XImage_x_image_css__rspack_import_9 = __webpack_require__(28);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XInput_x_input_css__rspack_import_10 = __webpack_require__(2200);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XMarkdown_x_markdown_css__rspack_import_11 = __webpack_require__(8858);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XOverlayNg_x_overlay_ng_css__rspack_import_12 = __webpack_require__(5965);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XRefreshView_x_refresh_view_css__rspack_import_13 = __webpack_require__(9877);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XSwiper_x_swiper_css__rspack_import_14 = __webpack_require__(2964);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XTextarea_x_textarea_css__rspack_import_15 = __webpack_require__(2812);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XList_x_list_css__rspack_import_16 = __webpack_require__(5412);
/* import */ var _rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XWebView_x_webview_css__rspack_import_17 = __webpack_require__(9740);
// Imports




















var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_18_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_19_default()));
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_compat_LinearContainer_linear_compat_css__rspack_import_0/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_common_css_linear_css__rspack_import_1/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_LynxWrapper_lynx_wrapper_css__rspack_import_2/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XText_x_text_css__rspack_import_3/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_ScrollView_scroll_view_css__rspack_import_4/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XFoldViewNg_x_foldview_ng_css__rspack_import_5/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XViewpagerNg_x_viewpager_ng_css__rspack_import_6/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XCanvas_x_canvas_css__rspack_import_7/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XSvg_x_svg_css__rspack_import_8/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XImage_x_image_css__rspack_import_9/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XInput_x_input_css__rspack_import_10/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XMarkdown_x_markdown_css__rspack_import_11/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XOverlayNg_x_overlay_ng_css__rspack_import_12/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XRefreshView_x_refresh_view_css__rspack_import_13/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XSwiper_x_swiper_css__rspack_import_14/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XTextarea_x_textarea_css__rspack_import_15/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XList_x_list_css__rspack_import_16/* ["default"] */.A);
___CSS_LOADER_EXPORT___.i(_rsbuild_core_compiled_css_loader_index_js_ruleSet_1_rules_1_oneOf_2_use_0_builtin_lightningcss_loader_ruleSet_1_rules_1_oneOf_2_use_1_src_elements_XWebView_x_webview_css__rspack_import_17/* ["default"] */.A);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
2194(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `@supports not ((content-visibility: auto) and (transition-behavior: allow-discrete) and (-webkit-box-reflect: above)) {
  * {
    --lynx-display: linear;
    --lynx-linear-weight-sum: 1;
    --lynx-linear-weight: 0;
    --justify-content-column: flex-start;
    --justify-content-column-reverse: flex-start;
    --justify-content-row: flex-start;
    --justify-content-row-reverse: flex-start;
    --align-self-row: auto;
    --align-self-column: auto;
    --lynx-linear-weight-basis: auto;
    --lynx-linear-orientation: vertical;
    --flex-direction: row;
    --flex-grow: 0;
    --flex-shrink: 1;
    --flex-basis: auto;
    --justify-content: flex-start;
    --flex-wrap: nowrap;
    --align-self: auto;
  }

  [lynx-computed-display="linear"] {
    flex-direction: column;
    justify-content: flex-start;
    flex-wrap: nowrap !important;
  }

  [lynx-computed-display="flex"] {
    flex-direction: var(--flex-direction);
    justify-content: var(--justify-content);
    flex-wrap: var(--flex-wrap);
  }

  [lynx-computed-display="flex"] > *, [lynx-computed-display="flex"] > lynx-wrapper > * {
    flex: var(--flex, var(--flex-grow) var(--flex-shrink) var(--flex-basis));
  }

  [lynx-computed-display="linear"] > *, [lynx-computed-display="linear"] > lynx-wrapper > * {
    flex-shrink: 0 !important;
    flex-grow: calc(var(--lynx-linear-weight) /
        calc(var(--lynx-linear-weight-sum) +
          (
          1 - clamp(0, var(--lynx-linear-weight-sum) * 999999, 1)
        ))) !important;
    flex-basis: var(--lynx-linear-weight-basis) !important;
  }

  [lynx-computed-display="linear"][lynx-linear-orientation="vertical"] {
    justify-content: var(--justify-content-column);
    flex-direction: column !important;
  }

  [lynx-computed-display="linear"][lynx-linear-orientation="horizontal"] {
    justify-content: var(--justify-content-row);
    flex-direction: row !important;
  }

  [lynx-computed-display="linear"][lynx-linear-orientation="vertical-reverse"] {
    justify-content: var(--justify-content-column-reverse);
    flex-direction: column-reverse !important;
  }

  [lynx-computed-display="linear"][lynx-linear-orientation="horizontal-reverse"] {
    justify-content: var(--justify-content-row-reverse);
    flex-direction: row-reverse !important;
  }

  [lynx-computed-display="linear"][lynx-linear-orientation="vertical"] > *, [lynx-computed-display="linear"][lynx-linear-orientation="vertical-reverse"], [lynx-computed-display="linear"][lynx-linear-orientation="vertical"] > lynx-wrapper > *, [lynx-computed-display="linear"][lynx-linear-orientation="vertical-reverse"] > lynx-wrapper > * {
    align-self: var(--align-self-column);
  }

  [lynx-computed-display="linear"][lynx-linear-orientation="horizontal"] > *, [lynx-computed-display="linear"][lynx-linear-orientation="horizontal-reverse"], [lynx-computed-display="linear"][lynx-linear-orientation="horizontal"] > lynx-wrapper > *, [lynx-computed-display="linear"][lynx-linear-orientation="horizontal-reverse"] > lynx-wrapper > * {
    align-self: var(--align-self-row);
  }
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
3080(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `lynx-wrapper {
  --lynx-display: inherit;
  --lynx-display-toggle: inherit;
  --lynx-linear-orientation: inherit;
  --lynx-linear-orientation-toggle: inherit;
  display: contents !important;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
4868(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `scroll-view {
  --lynx-display-toggle: var(--lynx-display-linear);
  flex-wrap: nowrap;
  flex-direction: var(--linear-flex-direction);
  justify-content: var(--linear-justify-content);
  scroll-timeline: --scroll-view-timeline;
  --lynx-display: linear !important;
  display: flex !important;
}

scroll-view > *, scroll-view > lynx-wrapper > * {
  flex-shrink: 0;
  flex-grow: calc(var(--lynx-linear-weight) / var(--lynx-linear-weight-sum));
  flex-basis: var(--lynx-linear-weight-basis);
  align-self: var(--align-self-column);
}

scroll-view, scroll-view {
  scrollbar-width: none;
}

scroll-view::-webkit-scrollbar {
  display: none;
}

scroll-view::-webkit-scrollbar {
  display: none;
}

scroll-view[enable-scrollbar], scroll-view[scroll-bar-enable] {
  scrollbar-width: initial;
}

scroll-view[enable-scrollbar]::-webkit-scrollbar {
  display: initial;
}

scroll-view[scroll-bar-enable]::-webkit-scrollbar {
  display: initial;
}

scroll-view, scroll-view[scroll-y], scroll-view[scroll-orientation="vertical"] {
  --lynx-linear-orientation-toggle: var(--lynx-linear-orientation-vertical);
  --lynx-linear-orientation: vertical !important;
  flex-direction: column !important;
  overflow: clip scroll !important;
}

scroll-view[scroll-x], scroll-view[scroll-orientation="horizontal"] {
  --lynx-linear-orientation-toggle: var(--lynx-linear-orientation-horizontal);
  --lynx-linear-orientation: horizontal !important;
  flex-direction: row !important;
  overflow: scroll clip !important;
}

scroll-view[scroll-orientation="both"] {
  overflow: scroll !important;
}

@supports not (overflow: clip) {
  scroll-view[scroll-y], scroll-view[scroll-orientation="vertical"] {
    overflow-x: hidden;
  }

  scroll-view[scroll-x], scroll-view[scroll-orientation="horizontal"] {
    overflow-y: hidden;
  }
}

scroll-view[scroll-y][enable-scroll="false"], scroll-view[scroll-orientation="vertical"][enable-scroll="false"] {
  overflow-y: hidden !important;
}

scroll-view[scroll-x][enable-scroll="false"], scroll-view[scroll-orientation="horizontal"][enable-scroll="false"] {
  overflow-x: hidden !important;
}

@supports (animation-timeline: --scroll-view-timeline) {
  @keyframes scrollViewTopFading {
    0% {
      box-shadow: 0 0 #0000;
    }

    5% {
      box-shadow: var(--scroll-view-bg-color) 0px 0px
        var(--scroll-view-fading-edge-length)
        var(--scroll-view-fading-edge-length);
    }

    100% {
      box-shadow: var(--scroll-view-bg-color) 0px 0px
        var(--scroll-view-fading-edge-length)
        var(--scroll-view-fading-edge-length);
    }
  }

  @keyframes scrollViewBotFading {
    0% {
      box-shadow: var(--scroll-view-bg-color) 0px 0px
        var(--scroll-view-fading-edge-length)
        var(--scroll-view-fading-edge-length);
    }

    95% {
      box-shadow: var(--scroll-view-bg-color) 0px 0px
        var(--scroll-view-fading-edge-length)
        var(--scroll-view-fading-edge-length);
    }

    100% {
      box-shadow: 0 0 #0000;
    }
  }

  scroll-view[fading-edge-length]::part(top-fade-mask) {
    animation-name: scrollViewTopFading;
    top: 0;
  }

  scroll-view[fading-edge-length]::part(bot-fade-mask) {
    animation-name: scrollViewBotFading;
    bottom: 0;
  }

  scroll-view[fading-edge-length]::part(top-fade-mask), scroll-view[fading-edge-length]::part(bot-fade-mask) {
    flex: none;
    animation-duration: 1ms;
    animation-timeline: --scroll-view-timeline;
    display: flex;
    left: 0;
  }
}

scroll-view[x-enable-scrolltolower-event]::part(lower-threshold-observer), scroll-view[x-enable-scrolltoupper-event]::part(upper-threshold-observer) {
  display: flex;
}

scroll-view[scroll-y][x-enable-scrolltolower-event]::part(lower-threshold-observer), scroll-view[scroll-orientation="vertical"][x-enable-scrolltolower-event]::part(lower-threshold-observer) {
  flex-direction: column-reverse !important;
}

scroll-view[scroll-x][x-enable-scrolltolower-event]::part(lower-threshold-observer), scroll-view[scroll-orientation="horizontal"][x-enable-scrolltolower-event]::part(lower-threshold-observer) {
  flex-direction: row-reverse !important;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
2116(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-canvas {
  contain: strict;
  flex-direction: column;
}

x-canvas > * {
  display: none !important;
}

x-canvas::part(canvas) {
  width: 100%;
  height: 100%;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
8287(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-foldview-ng {
  overscroll-behavior: contain;
  --foldview-header-height: 0px;
  scrollbar-width: none;
  display: flex;
  overflow-x: hidden;
  overflow-y: scroll !important;
}

x-foldview-ng::-webkit-scrollbar {
  display: none;
}

x-foldview-ng[scroll-bar-enable] {
  scrollbar-width: initial;
}

x-foldview-ng[scroll-bar-enable]::-webkit-scrollbar {
  display: initial;
}

x-foldview-ng:not([scroll-bar-enable], [scroll-bar-enable="true"])::-webkit-scrollbar {
  display: none;
}

x-foldview-ng[scroll-enable="false"] {
  overflow-y: hidden;
}

x-foldview-ng > *, x-foldview-header-ng, x-foldview-slot-ng, x-foldview-toolbar-ng {
  display: none;
}

x-foldview-ng > x-foldview-header-ng, x-foldview-ng > x-foldview-slot-ng, x-foldview-ng > x-foldview-toolbar-ng, x-foldview-ng > lynx-wrapper > x-foldview-header-ng, x-foldview-ng > lynx-wrapper > x-foldview-slot-ng, x-foldview-ng > lynx-wrapper > x-foldview-toolbar-ng {
  display: flex;
}

x-foldview-toolbar-ng {
  z-index: 1;
  order: 1;
  position: sticky;
  top: 0;
}

x-foldview-header-ng {
  flex: none;
  order: 2;
  width: 100%;
  position: absolute;
}

x-foldview-ng[header-over-slot] > x-foldview-slot-ng, x-foldview-ng[header-over-slot] > lynx-wrapper > x-foldview-slot-ng {
  z-index: 1;
}

x-foldview-slot-ng {
  contain: strict;
  order: 3;
}

x-foldview-slot-ng scroll-view {
  overscroll-behavior-y: none;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
28(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-image, filter-image {
  --justify-content: center;
  contain: strict;
  object-fit: fill;
  justify-content: center;
  align-items: center;
  flex-direction: row !important;
}

x-image > *, filter-image > * {
  display: none;
}

x-image[blur-radius]::part(img) {
  --blur-radius: 0;
  filter: blur(var(--blur-radius));
}

filter-image[blur-radius]::part(img), filter-image[drop-shadow]::part(img) {
  --blur-radius: 0;
  --drop-shadow: 0px 0px;
  filter: blur(var(--blur-radius)) drop-shadow(var(--drop-shadow));
}

x-image:not([auto-size])::part(img), filter-image::part(img) {
  object-fit: inherit;
  flex: 0 0 100%;
  align-self: stretch;
  width: 100%;
}

x-image[mode="aspectFit"], filter-image[mode="aspectFit"] {
  object-fit: contain;
}

x-image[mode="aspectFill"], filter-image[mode="aspectFill"] {
  object-fit: cover;
}

x-image[mode="center"]:not([auto-size])::part(img), filter-image[mode="center"]::part(img) {
  width: unset;
  flex: unset;
  align-self: unset;
  margin: auto;
  position: absolute;
}

x-image[auto-size] {
  display: contents;
}

x-image[auto-size]::part(img) {
  margin: inherit;
  padding: inherit;
  width: inherit;
  height: inherit;
  box-sizing: inherit;
  flex: inherit;
  min-width: inherit;
  min-height: inherit;
  border: inherit;
  border-radius: inherit;
  max-width: 100%;
  max-height: 100%;
  position: inherit;
  top: inherit;
  left: inherit;
  right: inherit;
  bottom: inherit;
  transform: inherit;
  opacity: inherit;
  z-index: inherit;
  filter: inherit;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
2200(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-input {
  font-size: 14px;
  display: contents !important;
}

x-input::part(form) {
  display: contents;
}

x-input::part(input), x-input::part(form) {
  box-sizing: inherit;
  width: inherit;
  height: inherit;
  border: inherit;
  border-radius: inherit;
  align-self: inherit;
  justify-self: inherit;
  text-align: inherit;
  direction: inherit;
  caret-color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  flex: inherit;
  background-color: inherit;
  z-index: inherit;
  margin: inherit;
  padding: inherit;
  color: inherit;
}

x-input::part(input) {
  --placeholder-color: grey;
  --placeholder-font-weight: normal;
}

x-input::part(input)::placeholder {
  color: var(--placeholder-color);
  font-family: var(--placeholder-font-family);
  font-size: var(--placeholder-font-size, inherit);
  font-weight: var(--placeholder-font-weight);
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
5412(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-list {
  contain: layout;
  scrollbar-width: none;
  --list-item-sticky-offset: 0;
  --list-item-span-count: 0;
  --list-main-axis-gap: 0px;
  --list-cross-axis-gap: 0px;
  container-type: size;
}

x-list > :not(list-item) {
  display: none;
}

x-list::part(content), x-list[list-type="waterfall"]::part(waterfall-content) {
  justify-content: inherit;
  background-color: inherit;
  flex-wrap: nowrap;
  flex: none;
  flex-direction: inherit;
  scrollbar-width: inherit;
  scroll-snap-type: inherit;
  scroll-snap-align: start;
  width: 100%;
  height: 100%;
  overflow: inherit;
  content-visibility: auto;
  row-gap: inherit;
  column-gap: inherit;
  display: flex;
  position: relative;
}

x-list::part(content), x-list::part(slot) {
  --lynx-display: inherit;
}

x-list, x-list::part(content) {
  scrollbar-width: none;
}

x-list::-webkit-scrollbar {
  display: none;
}

x-list::part(content)::-webkit-scrollbar {
  display: none;
}

x-list[scrollbar-enable]::part(content) {
  scrollbar-width: initial;
}

x-list[scrollbar-enable]::part(content)::-webkit-scrollbar {
  display: initial;
}

list-item {
  content-visibility: auto;
  contain: layout paint;
  contain-intrinsic-size: none auto var(--estimated-main-axis-size-px, 100cqh);
  display: none;
  position: static;
  flex: none !important;
}

list-item[recyclable="false"] {
  content-visibility: visible;
  contain: initial;
}

x-list[scroll-orientation="horizontal"] list-item {
  contain-intrinsic-size: auto var(--estimated-main-axis-size-px, 100cqw) none;
}

x-list > list-item, x-list > lynx-wrapper > list-item {
  display: flex;
}

x-list {
  overflow: clip scroll !important;
}

x-list[scroll-orientation="horizontal"] {
  overflow: scroll clip !important;
}

x-list[enable-scroll="false"] {
  overflow-y: hidden !important;
}

x-list[scroll-orientation="horizontal"][enable-scroll="false"] {
  overflow-x: hidden !important;
}

x-list[sticky="true"] list-item[sticky-top], x-list[sticky="true"] list-item[sticky-bottom] {
  z-index: 1;
  position: sticky;
}

x-list[sticky="true"] > list-item[sticky-top], x-list[sticky="true"] > lynx-wrapper > list-item[sticky-top] {
  top: var(--list-item-sticky-offset);
}

x-list[sticky="true"] > list-item[sticky-bottom], x-list[sticky="true"] > lynx-wrapper > list-item[sticky-bottom] {
  bottom: var(--list-item-sticky-offset);
}

x-list[sticky="true"][scroll-orientation="horizontal"] > list-item[sticky-top], x-list[sticky="true"][scroll-orientation="horizontal"] > lynx-wrapper > list-item[sticky-top] {
  top: unset;
  left: var(--list-item-sticky-offset);
}

x-list[sticky="true"][scroll-orientation="horizontal"] > list-item[sticky-bottom], x-list[sticky="true"][scroll-orientation="horizontal"] > lynx-wrapper > list-item[sticky-bottom] {
  bottom: unset;
  right: var(--list-item-sticky-offset);
}

x-list[item-snap], x-list[paging-enabled] {
  scroll-snap-type: y mandatory;
  scroll-snap-stop: always;
}

x-list[item-snap][scroll-orientation="horizontal"], x-list[paging-enabled][scroll-orientation="horizontal"] {
  scroll-snap-type: x mandatory;
}

x-list[item-snap] > list-item, x-list[item-snap] > lynx-wrapper > list-item {
  scroll-snap-align: start;
}

x-list[x-enable-scrolltoupper-event]::part(upper-threshold-observer), x-list[x-enable-scrolltoupperedge-event]::part(upper-threshold-observer), x-list[x-enable-scrolltolower-event]::part(lower-threshold-observer), x-list[x-enable-scrolltoloweredge-event]::part(lower-threshold-observer) {
  display: flex;
}

x-list[x-enable-scrolltoupper-event]::part(upper-threshold-sentinel), x-list[x-enable-scrolltoupperedge-event]::part(upper-threshold-sentinel), x-list[x-enable-scrolltolower-event]::part(lower-threshold-sentinel), x-list[x-enable-scrolltoloweredge-event]::part(lower-threshold-sentinel) {
  flex: 0 0 1px;
}

x-list[x-enable-scrolltoupper-event]::part(upper-threshold-sentinel), x-list[x-enable-scrolltoupperedge-event]::part(upper-threshold-sentinel) {
  margin-bottom: -1px;
}

x-list[x-enable-scrolltolower-event]::part(lower-threshold-sentinel), x-list[x-enable-scrolltoloweredge-event]::part(lower-threshold-sentinel) {
  margin-top: -1px;
  transform: translateY(1px);
}

x-list[scroll-orientation="horizontal"][x-enable-scrolltoupper-event]::part(upper-threshold-sentinel), x-list[scroll-orientation="horizontal"][x-enable-scrolltoupperedge-event]::part(upper-threshold-sentinel) {
  margin-bottom: 0;
  margin-right: -1px;
}

x-list[scroll-orientation="horizontal"][x-enable-scrolltolower-event]::part(lower-threshold-sentinel), x-list[scroll-orientation="horizontal"][x-enable-scrolltoloweredge-event]::part(lower-threshold-sentinel) {
  margin-top: 0;
  margin-left: -1px;
  transform: translateX(1px);
}

x-list::part(lower-threshold-observer) {
  flex-direction: column-reverse;
}

x-list {
  align-items: stretch;
  row-gap: var(--list-main-axis-gap);
  column-gap: var(--list-cross-axis-gap);
  flex-direction: column;
  display: flex;
}

x-list[scroll-orientation="horizontal"] {
  row-gap: var(--list-cross-axis-gap);
  column-gap: var(--list-main-axis-gap);
  flex-direction: row;
}

x-list[list-type="flow"]::part(content) {
  grid-template-columns: repeat(var(--list-item-span-count), 1fr);
  grid-row-gap: var(--list-main-axis-gap);
  grid-column-gap: var(--list-cross-axis-gap);
  grid-auto-rows: min-content;
  place-items: start stretch;
  display: grid;
}

x-list[list-type="flow"][scroll-orientation="horizontal"]::part(content) {
  grid-template-rows: repeat(var(--list-item-span-count), 1fr);
  grid-row-gap: var(--list-cross-axis-gap);
  grid-column-gap: var(--list-main-axis-gap);
  grid-auto-columns: min-content;
  grid-auto-flow: column;
  place-items: stretch start;
}

x-list[list-type="flow"] list-item[full-span]:not([full-span="false"]) {
  grid-column-start: 1;
  grid-column-end: calc(var(--list-item-span-count) + 1);
}

x-list[list-type="flow"][scroll-orientation="horizontal"] list-item[full-span]:not([full-span="false"]) {
  grid-row-start: 1;
  grid-row-end: calc(var(--list-item-span-count) + 1);
}

x-list[list-type="flow"][x-enable-scrolltoupper-event]::part(upper-threshold-observer), x-list[list-type="flow"][x-enable-scrolltoupperedge-event]::part(upper-threshold-observer), x-list[list-type="flow"][x-enable-scrolltolower-event]::part(lower-threshold-observer), x-list[list-type="flow"][x-enable-scrolltoloweredge-event]::part(lower-threshold-observer) {
  grid-column: 1 / calc(var(--list-item-span-count) + 1);
}

x-list[list-type="flow"][scroll-orientation="horizontal"][x-enable-scrolltoupper-event]::part(upper-threshold-observer), x-list[list-type="flow"][scroll-orientation="horizontal"][x-enable-scrolltoupperedge-event]::part(upper-threshold-observer), x-list[list-type="flow"][scroll-orientation="horizontal"][x-enable-scrolltolower-event]::part(lower-threshold-observer), x-list[list-type="flow"][scroll-orientation="horizontal"][x-enable-scrolltoloweredge-event]::part(lower-threshold-observer) {
  grid-row: 1 / calc(var(--list-item-span-count) + 1);
}

x-list[list-type="waterfall"] {
  flex-direction: column;
  display: flex;
}

x-list[list-type="waterfall"][scroll-orientation="horizontal"] {
  flex-direction: row;
}

x-list[list-type="waterfall"]::part(slot) {
  visibility: hidden;
}

x-list[list-type="waterfall"] list-item {
  width: calc((
      100% - var(--list-cross-axis-gap) * (var(--list-item-span-count) - 1)
    ) /
      var(--list-item-span-count));
  height: fit-content;
  position: absolute;
}

x-list[list-type="waterfall"][scroll-orientation="horizontal"] list-item {
  width: fit-content;
  height: calc((
      100% - var(--list-cross-axis-gap) * (var(--list-item-span-count) - 1)
    ) /
      var(--list-item-span-count));
}

x-list[list-type="waterfall"] list-item[full-span]:not([full-span="false"]) {
  width: 100%;
  height: fit-content;
}

x-list[list-type="waterfall"][scroll-orientation="horizontal"] list-item[full-span]:not([full-span="false"]) {
  width: fit-content;
  height: 100%;
}

x-list[list-type="waterfall"]::part(upper-threshold-observer), x-list[list-type="waterfall"]::part(lower-threshold-observer) {
  position: absolute;
}

x-list[list-type="waterfall"]::part(lower-threshold-observer) {
  bottom: -999px;
}

x-list[list-type="waterfall"][scroll-orientation="horizontal"]::part(lower-threshold-observer) {
  bottom: unset;
  right: -999px;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
8858(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-markdown {
  color: inherit;
  flex-direction: column;
  align-items: stretch;
  display: flex;
}

x-markdown::part(root) {
  width: 100%;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
5965(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-overlay-ng::part(dialog) {
  background: none;
  border: 0;
  outline: none;
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  margin: 0;
  padding: 0;
}

x-overlay-ng {
  contain: strict;
  width: 0;
  max-width: 0;
  max-height: 0;
  display: contents;
  position: fixed;
  top: 0;
  overflow: visible;
}

x-overlay-ng > :not(:first-child) {
  display: none !important;
}

x-overlay-ng > :first-child, x-overlay-ng > lynx-wrapper > :first-child {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
}

x-overlay-ng [event-through] {
  pointer-events: none;
}

x-overlay-ng:not([level]), x-overlay-ng[level="1"] {
  z-index: 4;
}

x-overlay-ng[level="2"] {
  z-index: 3;
}

x-overlay-ng[level="3"] {
  z-index: 2;
}

x-overlay-ng[level="4"] {
  z-index: 1;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
9877(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-refresh-header, x-refresh-footer {
  display: none;
}

x-refresh-view {
  box-sizing: border-box;
  border-style: solid;
  border-width: 0;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  position: relative;
}

x-refresh-view::part(container), x-refresh-view::part(content), x-refresh-view::part(slot) {
  --lynx-display: inherit;
}

x-refresh-view:not([enable-refresh="false"]) > x-refresh-header:first-of-type {
  scroll-snap-align: none;
  flex-shrink: 0;
  display: flex;
  position: relative !important;
}

x-refresh-view[enable-refresh="false"]::part(placeholder-top) {
  display: none;
}

x-refresh-view > x-refresh-header[x-magnet-enable]:first-of-type {
  scroll-snap-align: start !important;
}

x-refresh-view > x-refresh-footer[x-magnet-enable]:first-of-type {
  scroll-snap-align: end !important;
}

x-refresh-view:not([enable-loadmore="false"]) > x-refresh-footer:first-of-type {
  scroll-snap-align: none;
  flex-shrink: 0;
  margin-top: auto;
  display: flex;
  position: relative !important;
}

x-refresh-view[enable-loadmore="false"]::part(placeholder-bot) {
  display: none;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
4732(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-svg {
  contain: content;
  display: flex;
}

x-svg::part(img) {
  width: inherit;
  height: inherit;
  flex: inherit;
  min-width: inherit;
  min-height: inherit;
  border: inherit;
  border-radius: inherit;
  max-width: 100%;
  max-height: 100%;
  filter: inherit;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
2964(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-swiper {
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  contain: content;
  timeline-scope: --x-swiper-item-0,
    --x-swiper-item-1,
    --x-swiper-item-2,
    --x-swiper-item-3,
    --x-swiper-item-4;
  flex-direction: row;
  justify-content: flex-start;
  display: flex;
  overflow: scroll clip;
  flex-wrap: nowrap !important;
}

x-swiper::part(content) {
  --page-margin: 0px;
  --next-margin: 0px;
  --previous-margin: 0px;
}

x-swiper, x-swiper::part(content), x-swiper::part(slot), x-swiper::part(slot-start), x-swiper::part(slot-end) {
  --lynx-display: linear;
  --lynx-display-toggle: var(--lynx-display-linear);
}

x-swiper > *, x-swiper > lynx-wrapper > * {
  flex-shrink: 0;
  flex-grow: calc(var(--lynx-linear-weight) / var(--lynx-linear-weight-sum));
  flex-basis: var(--lynx-linear-weight-basis);
  align-self: var(--align-self-column);
}

x-swiper::-webkit-scrollbar {
  display: none;
}

x-swiper[vertical] {
  scroll-snap-type: y mandatory;
  --lynx-linear-orientation: vertical;
  --lynx-linear-orientation-toggle: var(--lynx-linear-orientation-vertical);
  overflow: clip scroll;
  flex-direction: column !important;
}

x-swiper[bounces]:not([circular])::part(bounce-padding) {
  display: initial;
}

x-swiper-item {
  scroll-snap-align: start;
  animation-duration: 10ms;
  flex-shrink: 0 !important;
  flex-grow: calc(var(--lynx-linear-weight) / var(--lynx-linear-weight-sum)) !important;
  flex-basis: var(--lynx-linear-weight-basis) !important;
}

x-swiper-item:nth-child(n+20) {
  contain: strict;
  content-visibility: auto;
}

x-swiper-item:first-child {
  view-timeline-name: --x-swiper-item-0;
}

x-swiper-item:nth-child(2) {
  view-timeline-name: --x-swiper-item-1;
}

x-swiper-item:nth-child(3) {
  view-timeline-name: --x-swiper-item-2;
}

x-swiper-item:nth-child(4) {
  view-timeline-name: --x-swiper-item-3;
}

x-swiper-item:nth-child(5) {
  view-timeline-name: --x-swiper-item-4;
}

x-swiper > :not(x-swiper-item) {
  display: none;
}

x-swiper > x-swiper-item {
  view-timeline-axis: inline;
  height: 100%;
  animation-timeline: view(inline);
  width: calc(100% - 2 * var(--page-margin) - var(--previous-margin) - var(--next-margin)) !important;
}

x-swiper[vertical] > x-swiper-item {
  view-timeline-axis: block;
  width: 100%;
  animation-timeline: view();
  height: calc(100% - 2 * var(--page-margin) - var(--previous-margin) - var(--next-margin)) !important;
}

x-swiper[circular] {
  scroll-snap-type: none;
  overflow: hidden clip;
}

x-swiper[circular][vertical] {
  overflow: clip hidden;
}

x-swiper[indicator-dots]::part(indicator-container) {
  display: none;
}

x-swiper::part(indicator-container) {
  --indicator-size: .6rem;
  --indicator-container-margin: .5rem;
  z-index: 100;
  width: 100%;
  height: var(--indicator-size);
  contain: strict;
  margin-bottom: var(--indicator-container-margin);
  --indicator-color: #ffffff4d;
  --indicator-active-color: white;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  overflow: clip;
}

x-swiper[vertical]::part(indicator-container) {
  left: unset;
  height: 100%;
  width: var(--indicator-size);
  margin-bottom: 0;
  margin-right: var(--indicator-container-margin);
  flex-direction: column;
  top: 0;
  right: 0;
}

x-swiper::part(indicator-item) {
  background-color: var(--indicator-color);
  flex: 0 0 var(--indicator-size);
  margin: 0 calc(var(--indicator-size) / 5) 0 calc(var(--indicator-size) / 5);
  border-radius: 100%;
}

x-swiper[vertical]::part(indicator-item) {
  margin: calc(var(--indicator-size) / 5) 0 calc(var(--indicator-size) / 5) 0;
}

x-swiper[mode="carousel"]:not([vertical]) > x-swiper-item {
  width: calc(80% - 2 * var(--page-margin) - var(--previous-margin) - var(--next-margin)) !important;
}

x-swiper[mode="carousel"][vertical] > x-swiper-item {
  height: calc(80% - 2 * var(--page-margin) - var(--previous-margin) - var(--next-margin)) !important;
}

x-swiper[mode="carousel"]:not([circular]) > x-swiper-item:last-child {
  margin-right: 20%;
}

@media screen and (-webkit-min-device-pixel-ratio: 0) {
  x-swiper[mode="carousel"]::part(content):after {
    content: "";
    padding-right: 20%;
  }
}

x-swiper[mode="coverflow"]::part(content) {
  perspective: 200px;
}

x-swiper[mode="coverflow"] > x-swiper-item {
  scroll-snap-align: center;
  transform-style: preserve-3d;
  z-index: 0;
  animation-name: x-swiper-coverflow;
}

x-swiper[mode="coverflow"]:not([vertical]) > x-swiper-item {
  animation-name: x-swiper-coverflow-horizontal;
  width: calc(60% - 2 * var(--page-margin) - var(--previous-margin) - var(--next-margin)) !important;
}

x-swiper[mode="coverflow"][vertical] > x-swiper-item {
  animation-name: x-swiper-coverflow-vertical;
  height: calc(60% - 2 * var(--page-margin) - var(--previous-margin) - var(--next-margin)) !important;
}

x-swiper[mode="coverflow"]:not([circular]):not([vertical]) > x-swiper-item:first-child {
  margin-left: 20%;
}

x-swiper[mode="coverflow"]:not([circular]):not([vertical]) > x-swiper-item:last-child {
  margin-right: 20%;
}

x-swiper[mode="coverflow"][vertical]:not([circular]) > x-swiper-item:first-child {
  margin-top: 20%;
}

x-swiper[mode="coverflow"][vertical]:not([circular]) > x-swiper-item:last-child {
  margin-bottom: 20%;
}

@keyframes x-swiper-coverflow-horizontal {
  25% {
    transform: rotateY(-50deg) scale(.8);
  }

  45%, 55% {
    z-index: 1;
    transform: rotateY(0) scale(1);
  }

  100% {
    transform: rotateY(40deg) scale(.8);
  }
}

@keyframes x-swiper-coverflow-vertical {
  25% {
    transform: rotateX(-50deg) scale(.8);
  }

  45%, 55% {
    z-index: 1;
    transform: rotateX(0) scale(1);
  }

  100% {
    transform: rotateX(40deg) scale(.8);
  }
}

x-swiper[mode="flat-coverflow"] > x-swiper-item {
  scroll-snap-align: center;
}

x-swiper[mode="flat-coverflow"]:not([vertical]) > x-swiper-item {
  width: 60% !important;
}

x-swiper[mode="flat-coverflow"]:not([circular]):not([vertical]) > x-swiper-item:first-child {
  margin-left: 20%;
}

x-swiper[mode="flat-coverflow"]:not([circular]):not([vertical]) > x-swiper-item:last-child {
  margin-right: 20%;
}

x-swiper[mode="flat-coverflow"][vertical] > x-swiper-item {
  height: 60% !important;
}

x-swiper[mode="flat-coverflow"][vertical]:not([circular]) > x-swiper-item:first-child {
  margin-top: 20%;
}

x-swiper[mode="flat-coverflow"][vertical]:not([circular]) > x-swiper-item:last-child {
  margin-bottom: 20%;
}

x-swiper[mode="carry"] > x-swiper-item {
  scroll-snap-align: center;
  animation-name: x-swiper-carry;
  width: 100% !important;
}

@keyframes x-swiper-carry {
  0% {
    transform: scale(.6);
  }

  45%, 55% {
    z-index: 1;
    transform: scale(1);
  }

  100% {
    transform: scale(.6);
  }
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
5182(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-text {
  overflow-wrap: break-word;
  background-image: var(--lynx-text-bg-color);
  color: initial;
  align-items: stretch;
  display: flex;
}

x-text > x-text, x-text > lynx-wrapper > x-text {
  color: inherit;
}

x-text:not(x-text > x-text):not(x-text > lynx-wrapper > x-text) {
  --lynx-text-bg-color: initial;
}

x-text > * {
  display: none;
}

x-text::part(inner-box) {
  text-overflow: inherit;
  --lynx-text-bg-color: inherit;
}

x-text > x-text::part(inner-box), x-text > lynx-wrapper > x-text::part(inner-box) {
  display: contents !important;
}

x-text::part(inner-box), inline-text, x-text::part(slot) {
  background-clip: inherit;
  -webkit-background-clip: inherit;
}

inline-text, inline-image, inline-truncation {
  display: none;
}

x-text > x-text, x-text > inline-text, inline-text > inline-text, inline-truncation > inline-text, inline-truncation > x-text, x-text > lynx-wrapper > x-text, x-text > lynx-wrapper > inline-text, x-text > lynx-wrapper > x-text, inline-text > lynx-wrapper > inline-text, x-text > lynx-wrapper > *, inline-truncation > lynx-wrapper > inline-text, inline-truncation > lynx-wrapper > x-text {
  background-clip: inherit;
  -webkit-background-clip: inherit;
  display: inline;
}

x-text > inline-image, x-text > x-image, x-text > x-svg, inline-truncation > inline-image, inline-truncation > x-image, inline-truncation > x-svg, inline-text > inline-image, inline-text > x-image, inline-text > x-svg, x-text > lynx-wrapper > inline-image, x-text > lynx-wrapper > x-image, x-text > lynx-wrapper > x-svg, inline-truncation > lynx-wrapper > inline-image, inline-truncation > lynx-wrapper > x-image, inline-truncation > lynx-wrapper > x-svg, inline-text > lynx-wrapper > inline-image, inline-text > lynx-wrapper > x-image, inline-text > lynx-wrapper > x-svg {
  display: contents !important;
}

x-text > x-view, x-text > lynx-wrapper > x-view {
  display: inline-flex !important;
}

x-text > x-view, x-text[x-show-inline-truncation] > inline-truncation, x-text > lynx-wrapper > x-view, x-text[x-show-inline-truncation] > lynx-wrapper > inline-truncation {
  display: inline-flex;
}

x-text > inline-truncation:first-child, x-text > lynx-wrapper > inline-truncation:first-child {
  max-width: 100%;
}

inline-truncation ~ inline-truncation {
  display: none;
}

inline-truncation[x-text-clipped] {
  flex-direction: row;
}

inline-image::part(img) {
  height: inherit;
  width: inherit;
  border: inherit;
  border-radius: inherit;
  background-color: inherit;
  vertical-align: inherit;
  margin: inherit;
  display: inline-block;
}

x-text > x-image::part(img), x-text > x-svg::part(img), x-text > lynx-wrapper > x-image::part(img), x-text > lynx-wrapper > x-svg::part(img), inline-truncation > x-image::part(img), inline-truncation > x-svg::part(img), inline-truncation > lynx-wrapper > x-image::part(img), inline-truncation > lynx-wrapper > x-svg::part(img) {
  border: inherit;
  border-radius: inherit;
  background-color: inherit;
  vertical-align: inherit;
  margin: inherit;
  object-fit: inherit;
  display: inline-block;
  height: inherit !important;
  width: inherit !important;
  flex: inherit !important;
  align-self: inherit !important;
}

x-text, inline-text, inline-image, inline-truncation {
  -webkit-user-select: none;
  user-select: none;
}

x-text::part(inner-box) {
  width: 100%;
  height: 100%;
  overflow: inherit;
}

x-text[text-maxline] {
  overflow: hidden;
}

x-text[text-selection], x-text[text-selection] > inline-text, x-text[text-selection] > x-text, x-text[text-selection] > inline-image, x-text[text-selection] > x-image, x-text[text-selection] > x-svg, x-text[text-selection] > inline-truncation, x-text[text-selection] > lynx-wrapper > inline-text, x-text[text-selection] > lynx-wrapper > x-text, x-text[text-selection] > lynx-wrapper > inline-image, x-text[text-selection] > lynx-wrapper > x-image, x-text[text-selection] > lynx-wrapper > x-svg, x-text[text-selection] > lynx-wrapper > inline-truncation {
  -webkit-user-select: auto;
  user-select: auto;
}

x-text[x-text-clipped] > [x-text-clipped]:not(inline-truncation), x-text[x-text-clipped] > lynx-wrapper > [x-text-clipped]:not(inline-truncation) {
  display: none !important;
}

x-text[x-text-clipped]:not([tail-color-convert="false"])::part(inner-box):after, x-text[x-text-clipped]:not([tail-color-convert="false"])::part(inner-box):after {
  content: "...";
}

x-text[x-text-clipped][x-text-custom-overflow]::part(inner-box):after, x-text[x-text-clipped][x-text-custom-overflow]::part(inner-box):after {
  content: "" !important;
}

x-text[x-text-clipped]:has( > inline-truncation)::part(inner-box):after {
  content: "" !important;
}

x-text[x-text-clipped]:has( > inline-truncation)::part(inner-box):after {
  content: "" !important;
}

x-text[text-maxline]::part(inner-box) {
  -webkit-box-orient: vertical;
  display: -webkit-box;
}

x-text[text-maxline="0"] {
  display: none;
}

@supports not selector(:has(> inline-truncation)) {
  x-text[text-maxline="1"]:not([tail-color-convert="false"]):not([x-text-custom-overflow])::part(inner-box) {
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

@supports selector(:has(> inline-truncation)) {
  x-text[text-maxline="1"]:not([tail-color-convert="false"], :has( > inline-truncation))::part(inner-box) {
    text-wrap: nowrap;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

x-text[text-maxline="1"] {
  max-width: -moz-available;
  max-width: -webkit-fill-available;
}

x-text[text-maxline="1"]:not([tail-color-convert="false"])::part(inner-box) {
  display: block;
}

x-text[text-maxline][x-text-custom-overflow]::part(inner-box), x-text[text-maxline][tail-color-convert="false"]::part(inner-box) {
  display: block !important;
}

x-text[text-maxline]:has( > inline-truncation)::part(inner-box) {
  display: block !important;
}

raw-text {
  white-space-collapse: preserve-breaks;
  display: none;
}

x-text > raw-text, inline-text > raw-text, x-text > lynx-wrapper > raw-text, inline-text > lynx-wrapper > raw-text {
  display: contents !important;
}

raw-text:not(:defined):before {
  content: attr(text);
  display: contents;
}

x-text:not(:has(x-text, raw-text)):not(:defined):before {
  content: attr(text);
  display: contents;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
2812(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-textarea {
  font-size: 14px;
  display: contents;
}

x-textarea::part(form) {
  display: contents;
}

x-textarea::part(textarea), x-textarea::part(form) {
  width: inherit;
  height: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  flex: inherit;
  border: inherit;
  padding: inherit;
  margin: inherit;
  caret-color: inherit;
  direction: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-align: inherit;
  outline: inherit;
  background-color: inherit;
  color: inherit;
}

x-textarea::part(textarea) {
  --placeholder-color: grey;
  --placeholder-font-weight: normal;
  --placeholder-font-family: inherit;
  resize: none;
}

x-textarea::part(textarea)::placeholder {
  color: var(--placeholder-color);
  font-size: var(--placeholder-font-size, inherit);
  font-weight: var(--placeholder-font-weight);
  font-family: var(--placeholder-font-family);
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
6393(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-viewpager-ng, x-viewpager-item-ng {
  display: none;
}

x-viewpager-ng, x-viewpager-ng > x-viewpager-item-ng, x-viewpager-ng > lynx-wrapper > x-viewpager-item-ng {
  display: flex;
}

x-viewpager-ng {
  contain: content;
  scrollbar-width: 0;
  --lynx-linear-orientation: horizontal;
  scroll-snap-type: x mandatory;
  scroll-snap-stop: always;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: scroll clip;
}

x-viewpager-ng[allow-horizontal-gesture="false"], x-viewpager-ng[enable-scroll="false"] {
  overflow-x: hidden;
}

x-viewpager-ng::-webkit-scrollbar {
  display: none;
}

x-viewpager-ng::part(content) {
  scroll-snap-align: start;
}

x-viewpager-ng[bounces]::part(bounce-padding) {
  display: flex;
}

@supports not (overflow: clip) {
  x-viewpager-ng {
    overflow-y: hidden;
  }
}

x-viewpager-item-ng {
  contain: content;
  --flex-grow: 0;
  --flex-shrink: 0;
  --flex-basis: auto;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  flex: none;
  width: 100%;
  height: 100%;
  position: relative !important;
}

x-viewpager-item-ng:nth-child(n+5) {
  contain: strict;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
9740(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `x-webview {
  flex-direction: column;
  display: flex;
  overflow: hidden;
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
2471(module, __webpack_exports__, __webpack_require__) {
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1 = __webpack_require__(6783);
/* import */ var _rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0 = __webpack_require__(2464);
/* import */ var _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_rsbuild_core_compiled_css_loader_api_js__rspack_import_0);
// Imports


var ___CSS_LOADER_EXPORT___ = _rsbuild_core_compiled_css_loader_api_js__rspack_import_0_default()((_rsbuild_core_compiled_css_loader_noSourceMaps_js__rspack_import_1_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `@property --lynx-display {
  syntax: "linear | flex";
  inherits: false;
  initial-value: linear;
}

@property --lynx-linear-weight-sum {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

@property --lynx-linear-weight {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

@property --justify-content-column {
  syntax: "flex-start | flex-end | center | space-between | space-around";
  inherits: false;
  initial-value: flex-start;
}

@property --justify-content-column-reverse {
  syntax: "flex-start | flex-end | center | space-between | space-around";
  inherits: false;
  initial-value: flex-start;
}

@property --justify-content-row {
  syntax: "flex-start | flex-end | center | space-between | space-around";
  inherits: false;
  initial-value: flex-start;
}

@property --justify-content-row-reverse {
  syntax: "flex-start | flex-end | center | space-between | space-around";
  inherits: false;
  initial-value: flex-start;
}

@property --align-self-row {
  syntax: "start | end | center | stretch | auto";
  inherits: false;
  initial-value: auto;
}

@property --align-self-column {
  syntax: "start | end | center | stretch | auto";
  inherits: false;
  initial-value: auto;
}

@property --lynx-linear-weight-basis {
  syntax: "auto | <number> | <length>";
  inherits: false;
  initial-value: auto;
}

@property --lynx-linear-orientation {
  syntax: "<custom-ident>";
  inherits: false;
  initial-value: vertical;
}

@property --flex-direction {
  syntax: "*";
  inherits: false
}

@property --flex-wrap {
  syntax: "*";
  inherits: false
}

@property --flex-grow {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

@property --flex-shrink {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

@property --flex-basis {
  syntax: "*";
  inherits: false;
  initial-value: auto;
}

@property --flex-value {
  syntax: "*";
  inherits: false
}

@property --flex {
  syntax: "*";
  inherits: false
}

@property --linear-justify-content {
  syntax: "flex-start | flex-end | center | space-between | space-around";
  inherits: false;
  initial-value: flex-start;
}

x-view, x-blur-view, scroll-view, x-foldview-ng, x-foldview-slot-ng, x-foldview-header-ng, x-foldview-toolbar-ng, x-foldview-drag-ng, x-text, inline-text, inline-image, inline-truncation, x-viewpager-ng, x-viewpager-item-ng, x-canvas, x-svg, x-image, filter-image, x-input, x-swiper, x-swiper-item, x-textarea, x-list, list-item {
  box-sizing: border-box;
  scrollbar-width: none;
  border-style: solid;
  border-width: 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  position: relative;
  overflow: clip;
}

x-view::--webkit-scrollbar {
  display: none;
}

x-view, scroll-view, x-foldview-header-ng, x-foldview-ng, x-foldview-slot-drag-ng, x-foldview-slot-ng, x-foldview-toolbar-ng, x-refresh-footer, x-refresh-header, x-refresh-view, x-swiper-item, x-viewpager-item-ng, x-viewpager-ng, list-item {
  --lynx-display-toggle: var(--lynx-display-linear);
  --lynx-display-linear: var(--lynx-display-toggle, );
  --lynx-display-flex: var(--lynx-display-toggle, );
  --lynx-linear-orientation-toggle: var(--lynx-linear-orientation-vertical);
  --lynx-linear-orientation-horizontal: var(--lynx-linear-orientation-toggle, );
  --lynx-linear-orientation-vertical: var(--lynx-linear-orientation-toggle, );
  --lynx-linear-orientation-horizontal-reverse: var(--lynx-linear-orientation-toggle,
  );
  --lynx-linear-orientation-vertical-reverse: var(--lynx-linear-orientation-toggle,
  );
  --linear-flex-direction: var(--lynx-linear-orientation-horizontal, row) var(--lynx-linear-orientation-vertical, column) var(--lynx-linear-orientation-horizontal-reverse, row-reverse) var(--lynx-linear-orientation-vertical-reverse, column-reverse);
  --linear-justify-content: var(--lynx-linear-orientation-horizontal, var(--justify-content-row)) var(--lynx-linear-orientation-vertical, var(--justify-content-column)) var(--lynx-linear-orientation-horizontal-reverse, var(--justify-content-row-reverse)) var(--lynx-linear-orientation-vertical-reverse, var(--justify-content-column-reverse));
}

x-view, x-foldview-header-ng, x-foldview-ng, x-foldview-slot-drag-ng, x-foldview-slot-ng, x-foldview-toolbar-ng, x-refresh-footer, x-refresh-header, x-refresh-view, x-swiper-item, x-viewpager-item-ng, x-viewpager-ng, list-item {
  flex-wrap: var(--lynx-display-linear, nowrap)
    var(--lynx-display-flex, var(--flex-wrap));
  flex-direction: var(--lynx-display-linear, var(--linear-flex-direction))
    var(--lynx-display-flex, var(--flex-direction));
  justify-content: var(--lynx-display-linear, var(--linear-justify-content));
}

@supports (content-visibility: auto) and (transition-behavior: allow-discrete) and (-webkit-box-reflect: above) {
  @container style(--lynx-display: linear) {
    x-view, x-blur-view, scroll-view, x-foldview-ng, x-foldview-slot-ng, x-foldview-header-ng, x-foldview-toolbar-ng, x-foldview-drag-ng, x-text, inline-text, inline-image, inline-truncation, x-viewpager-ng, x-viewpager-item-ng, x-canvas, x-svg, x-image, filter-image, x-input, x-swiper, x-swiper-item, x-textarea, x-list, list-item {
      flex-shrink: 0;
      flex-grow: calc(var(--lynx-linear-weight) /
          calc(var(--lynx-linear-weight-sum) +
            (
            1 - clamp(0, var(--lynx-linear-weight-sum) * 999999, 1)
          )));
      flex-basis: var(--lynx-linear-weight-basis);
    }
  }

  @container not style(--lynx-display: linear) {
    x-view, x-blur-view, scroll-view, x-foldview-ng, x-foldview-slot-ng, x-foldview-header-ng, x-foldview-toolbar-ng, x-foldview-drag-ng, x-text, inline-text, inline-image, inline-truncation, x-viewpager-ng, x-viewpager-item-ng, x-canvas, x-svg, x-image, filter-image, x-input, x-swiper, x-swiper-item, x-textarea, x-list, list-item {
      flex: var(--flex, var(--flex-grow) var(--flex-shrink) var(--flex-basis));
    }
  }

  @container style(--lynx-display: linear) and (style(--lynx-linear-orientation: vertical) or style(--lynx-linear-orientation: vertical-reverse)) {
    x-view, x-blur-view, scroll-view, x-foldview-ng, x-foldview-slot-ng, x-foldview-header-ng, x-foldview-toolbar-ng, x-foldview-drag-ng, x-text, inline-text, inline-image, inline-truncation, x-viewpager-ng, x-viewpager-item-ng, x-canvas, x-svg, x-image, filter-image, x-input, x-swiper, x-swiper-item, x-textarea, x-list, list-item {
      align-self: var(--align-self-column);
    }
  }

  @container style(--lynx-display: linear) and (style(--lynx-linear-orientation: horizontal) or style(--lynx-linear-orientation: horizontal-reverse)) {
    x-view, x-blur-view, scroll-view, x-foldview-ng, x-foldview-slot-ng, x-foldview-header-ng, x-foldview-toolbar-ng, x-foldview-drag-ng, x-text, inline-text, inline-image, inline-truncation, x-viewpager-ng, x-viewpager-item-ng, x-canvas, x-svg, x-image, filter-image, x-input, x-swiper, x-swiper-item, x-textarea, x-list, list-item {
      align-self: var(--align-self-row);
    }
  }
}
`, ""]);
// Exports
/* export default */ __webpack_exports__.A = (___CSS_LOADER_EXPORT___.toString());


},
2464(module) {


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

},
6783(module) {


module.exports = function (i) {
  return i[1];
};

},
634(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
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
__webpack_require__.d(__webpack_exports__, {
  t: () => (LynxCrossThreadContext)
}, {
  U: DispatchEventResult
});


},
3375(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  D: () => (/* binding */ BackgroundThread)
});

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
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/client/LynxCrossThreadContext.js
var LynxCrossThreadContext = __webpack_require__(634);
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/constants.js
var constants = __webpack_require__(3077);
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/elementAPIs/pureElementPAPIs.js
var pureElementPAPIs = __webpack_require__(4529);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/crossThreadHandlers/queryNodes.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.


function queryNodes(lynxViewInstance, type, identifier, component_id, first_only, root_unique_id, callback, error) {
    let queryRoot = lynxViewInstance.rootDom;
    if (root_unique_id) {
        const root = lynxViewInstance.mtsWasmBinding.getElementByUniqueId(root_unique_id);
        if (root) {
            queryRoot = root;
        }
        else {
            console.error(`[lynx-web] cannot find dom for root_unique_id: ${root_unique_id}`);
            error?.(constants/* .ErrorCode.NODE_NOT_FOUND */.O4.NODE_NOT_FOUND);
            return;
        }
    }
    else if (component_id) {
        const root = lynxViewInstance.mtsWasmBinding.getElementByComponentId(component_id);
        if (root) {
            queryRoot = root;
        }
        else {
            console.error(`[lynx-web] cannot find dom for component_id: ${component_id}`);
            error?.(constants/* .ErrorCode.NODE_NOT_FOUND */.O4.NODE_NOT_FOUND);
            return;
        }
    }
    let selector;
    if (type === constants/* .IdentifierType.ID_SELECTOR */.Wx.ID_SELECTOR) {
        selector = identifier;
    }
    else if (type === constants/* .IdentifierType.UNIQUE_ID */.Wx.UNIQUE_ID) {
        const element = lynxViewInstance.mtsWasmBinding.getElementByUniqueId(Number(identifier));
        if (element) {
            callback(element);
            return;
        }
        else {
            console.error(`[lynx-web] cannot find dom for unique_id: ${identifier}`);
            error?.(constants/* .ErrorCode.NODE_NOT_FOUND */.O4.NODE_NOT_FOUND);
            return;
        }
    }
    else {
        console.error(`[lynx-web] NYI: setnativeprops type ${type}`);
        error?.(constants/* .ErrorCode.UNKNOWN */.O4.UNKNOWN);
        return;
    }
    if (first_only) {
        let targetElement = null;
        try {
            targetElement = (0,pureElementPAPIs/* .__QuerySelector */.Gi)(queryRoot, selector);
        }
        catch (e) {
            console.error(`[lynx-web] cannot use selector: ${selector}`);
            error?.(constants/* .ErrorCode.SELECTOR_NOT_SUPPORTED */.O4.SELECTOR_NOT_SUPPORTED);
            return;
        }
        if (targetElement) {
            callback(targetElement);
        }
        else {
            console.error(`[lynx-web] cannot find from for selector ${identifier} under`, queryRoot);
            error?.(constants/* .ErrorCode.NODE_NOT_FOUND */.O4.NODE_NOT_FOUND);
        }
    }
    else {
        queryRoot.querySelectorAll(selector).forEach((element) => {
            callback(element);
        });
    }
}
//# sourceMappingURL=queryNodes.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/crossThreadHandlers/registerInvokeUIMethodHandler.js



function registerInvokeUIMethodHandler(rpc, lynxViewInstance) {
    rpc.registerHandler(invokeUIMethodEndpoint, (type, identifier, component_id, method, params, root_unique_id) => {
        let code = constants/* .ErrorCode.UNKNOWN */.O4.UNKNOWN;
        let data = undefined;
        queryNodes(lynxViewInstance, type, identifier, component_id, true, root_unique_id, (element) => {
            lynxViewInstance.invokeUIMethod(element, method, params, (res) => {
                code = res.code;
                data = res.data;
            });
        }, (error) => {
            code = error;
        });
        return { code, data };
    });
}
//# sourceMappingURL=registerInvokeUIMethodHandler.js.map
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/utils/setElementPropertyOrAttribute.js
var setElementPropertyOrAttribute = __webpack_require__(8584);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/crossThreadHandlers/registerSetNativePropsHandler.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.




function applyNativeProps(element, nativeProps) {
    for (const key in nativeProps) {
        const value = nativeProps[key];
        if (key === 'text' && element?.tagName === 'X-TEXT') {
            if (element.firstElementChild
                && element.firstElementChild.tagName == 'RAW-TEXT') {
                element = element.firstElementChild;
            }
        }
        if (CSS.supports(key, value)
            && element.style) {
            element.style.setProperty(key, value);
        }
        else {
            (0,setElementPropertyOrAttribute/* .setElementPropertyOrAttribute */.J)(element, key, value);
        }
    }
}
function registerNativePropsHandler(rpc, lynxViewInstance) {
    rpc.registerHandler(setNativePropsEndpoint, (type, identifier, component_id, first_only, native_props, root_unique_id) => {
        queryNodes(lynxViewInstance, type, identifier, component_id, first_only, root_unique_id, (element) => {
            applyNativeProps(element, native_props);
        });
    });
}
//# sourceMappingURL=registerSetNativePropsHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/crossThreadHandlers/registerGetPathInfoHandler.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.



function registerGetPathInfoHandler(rpc, lynxViewInstance) {
    rpc.registerHandler(getPathInfoEndpoint, (type, identifier, component_id, first_only, root_unique_id) => {
        let code = constants/* .ErrorCode.UNKNOWN */.O4.UNKNOWN;
        let data;
        queryNodes(lynxViewInstance, type, identifier, component_id, first_only, root_unique_id, (element) => {
            try {
                const path = [];
                let currentNode = element;
                while (currentNode) {
                    const parent = currentNode.parentElement;
                    const parentNodeForChildren = parent ?? lynxViewInstance.rootDom;
                    const children = Array.from(parentNodeForChildren.children);
                    const tag = lynxViewInstance.mainThreadGlobalThis.__GetTag(currentNode);
                    const index = tag === 'page' ? 0 : children.indexOf(currentNode);
                    const id = currentNode.getAttribute('id') || undefined;
                    const className = currentNode.getAttribute('class') || undefined;
                    const dataSet = lynxViewInstance.mainThreadGlobalThis
                        .__GetDataset(currentNode);
                    path.push({
                        tag,
                        id,
                        class: className,
                        dataSet,
                        index,
                    });
                    if (tag === 'page'
                        || currentNode.parentNode === lynxViewInstance.rootDom) {
                        break;
                    }
                    currentNode = parent;
                }
                data = { path };
                code = constants/* .ErrorCode.SUCCESS */.O4.SUCCESS;
            }
            catch (e) {
                console.error('[lynx-web] getPathInfo: failed with', e, element);
                code = constants/* .ErrorCode.UNKNOWN */.O4.UNKNOWN;
            }
        }, (error) => {
            code = error;
        });
        return { code, data };
    });
}
//# sourceMappingURL=registerGetPathInfoHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/crossThreadHandlers/registerSelectComponentHandler.js
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.



function registerSelectComponentHandler(rpc, lynxViewInstance) {
    rpc.registerHandler(selectComponentEndpoint, (componentId, idSelector, single) => {
        let element = null;
        queryNodes(lynxViewInstance, constants/* .IdentifierType.ID_SELECTOR */.Wx.ID_SELECTOR, idSelector, componentId === 'card' ? '0' : componentId, single, undefined, (ele) => {
            element = ele;
        });
        if (!element)
            return [];
        return [
            lynxViewInstance.mainThreadGlobalThis.__GetComponentID(element),
        ];
    });
}
//# sourceMappingURL=registerSelectComponentHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/crossThreadHandlers/registerTriggerComponentEventHandler.js

function registerTriggerComponentEventHandler(rpc, lynxViewInstance) {
    rpc.registerHandler(triggerComponentEventEndpoint, (id, params) => {
        const componentDom = lynxViewInstance.mtsWasmBinding
            .getElementByComponentId(params.componentId);
        componentDom?.dispatchEvent(new CustomEvent(id, {
            ...params.eventOption,
            detail: params.eventDetail,
        }));
    });
}
//# sourceMappingURL=registerTriggerComponentEventHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/crossThreadHandlers/registerTriggerElementMethodEndpointHandler.js



function registerTriggerElementMethodEndpointHandler(rpc, lynxViewInstance) {
    const animationMap = new Map();
    rpc.registerHandler(triggerElementMethodEndpoint, (method, id, options) => {
        if (method === 'animate') {
            switch (options.operation) {
                case constants/* .AnimationOperation.START */.Uc.START:
                    animationMap.set(options.id, (0,pureElementPAPIs/* .__QuerySelector */.Gi)(lynxViewInstance.rootDom, id)?.animate(options.keyframes, options.timingOptions));
                    break;
                case constants/* .AnimationOperation.PLAY */.Uc.PLAY:
                    animationMap.get(options.id)?.play();
                    break;
                case constants/* .AnimationOperation.PAUSE */.Uc.PAUSE:
                    animationMap.get(options.id)?.pause();
                    break;
                case constants/* .AnimationOperation.CANCEL */.Uc.CANCEL:
                    animationMap.get(options.id)?.cancel();
                    animationMap.delete(options.id);
                    break;
                case constants/* .AnimationOperation.FINISH */.Uc.FINISH:
                    animationMap.get(options.id)?.finish();
                    animationMap.delete(options.id);
                    break;
            }
        }
    });
}
//# sourceMappingURL=registerTriggerElementMethodEndpointHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/crossThreadHandlers/registerNapiModulesCallHandler.js

function registerNapiModulesCallHandler(rpc, lynxViewInstance) {
    const dispatchNapiModules = rpc.createCall(dispatchNapiModuleEndpoint);
    rpc.registerHandler(napiModulesCallEndpoint, (name, data, moduleName) => {
        return lynxViewInstance.parentDom.onNapiModulesCall?.(name, data, moduleName, lynxViewInstance.parentDom, dispatchNapiModules);
    });
}
//# sourceMappingURL=registerNapiModulesCallHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/crossThreadHandlers/registerNativeModulesCallHandler.js

function registerNativeModulesCallHandler(rpc, lynxViewInstance) {
    rpc.registerHandler(nativeModulesCallEndpoint, (name, data, moduleName) => {
        return lynxViewInstance.parentDom.onNativeModulesCall?.(name, data, moduleName);
    });
}
//# sourceMappingURL=registerNativeModulesCallHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/crossThreadHandlers/registerReloadHandler.js
// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

function registerReloadHandler(rpc, lynxViewInstance) {
    rpc.registerHandler(reloadEndpoint, () => {
        lynxViewInstance.parentDom.reload();
    });
}
//# sourceMappingURL=registerReloadHandler.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/Background.js
/*
 * Copyright (C) 2025 The Lynx Authors. All rights reserved.
 * Licensed under the Apache License Version 2.0 that can be found in the
 * LICENSE file in the root directory of this source tree.
 */












function createWebWorker() {
    return new Worker(
    /* webpackFetchPriority: "high" */
    /* webpackChunkName: "web-core-worker-chunk" */
    /* webpackPrefetch: true */
    /* webpackPreload: true */
    new URL(/* worker import */__webpack_require__.p + __webpack_require__.u(97), __webpack_require__.b), Object.assign({}, {
        type: 'module',
        name: 'lynx-bg',
    }, { type: undefined }));
}
class BackgroundThread {
    static contextIdToBackgroundWorker = [];
    #rpc;
    #webWorker;
    #nextMacroTask = null;
    #caughtTimingInfo = [];
    #batchSendTimingInfo;
    jsContext;
    #messagePort;
    postTimingFlags;
    sendGlobalEvent;
    sendDevtoolEvent;
    publicComponentEvent;
    publishEvent;
    dispatchI18nResource;
    updateData;
    updateGlobalProps;
    updateBTSChunk;
    dispatchIntersectionObserverEvent;
    #lynxGroupId;
    #lynxViewInstance;
    #btsReady;
    #btsReadyResolver;
    #btsStarted = false;
    constructor(lynxGroupId, lynxViewInstance) {
        this.#lynxGroupId = lynxGroupId;
        this.#lynxViewInstance = lynxViewInstance;
        this.#rpc = new Rpc(undefined, 'main-to-bg');
        this.jsContext = new LynxCrossThreadContext/* .LynxCrossThreadContext */.t({
            rpc: this.#rpc,
            receiveEventEndpoint: dispatchJSContextOnMainThreadEndpoint,
            sendEventEndpoint: dispatchCoreContextOnBackgroundEndpoint,
        });
        this.#btsReady = new Promise((resolve) => {
            this.#btsReadyResolver = resolve;
        });
        this.jsContext.__start();
        this.#batchSendTimingInfo = this.#rpc.createCall(markTimingEndpoint);
        this.postTimingFlags = this.#rpc.createCall(postTimingFlagsEndpoint);
        this.sendGlobalEvent = this.#rpc.createCall(sendGlobalEventEndpoint);
        this.sendDevtoolEvent = this.#rpc.createCall(dispatchDevtoolEventOnBackgroundEndpoint);
        this.publicComponentEvent = this.#rpc.createCall(publicComponentEventEndpoint);
        this.publishEvent = this.#rpc.createCall(publishEventEndpoint);
        this.dispatchI18nResource = this.#rpc.createCall(dispatchI18nResourceEndpoint);
        this.updateData = this.#rpc.createCall(updateDataEndpoint);
        this.updateGlobalProps = this.#rpc.createCall(updateGlobalPropsEndpoint);
        this.updateBTSChunk = this.#rpc.createCall(updateBTSChunkEndpoint);
        this.dispatchIntersectionObserverEvent = this.#rpc.createCall(dispatchIntersectionObserverEventEndpoint);
    }
    startWebWorker(initData, globalProps, cardType, customSections, nativeModulesMap, napiModulesMap) {
        if (this.#webWorker)
            return;
        // now start the background worker
        if (this.#lynxGroupId !== undefined) {
            const group = BackgroundThread.contextIdToBackgroundWorker[this.#lynxGroupId];
            if (group) {
                group.runningCards += 1;
            }
            else {
                BackgroundThread.contextIdToBackgroundWorker[this.#lynxGroupId] = {
                    worker: createWebWorker(),
                    runningCards: 1,
                };
            }
            this.#webWorker = BackgroundThread.contextIdToBackgroundWorker[this.#lynxGroupId].worker;
        }
        else {
            this.#webWorker = createWebWorker();
        }
        const messageChannel = new MessageChannel();
        this.#webWorker.postMessage({
            mainThreadMessagePort: messageChannel.port2,
            systemInfo: this.#lynxViewInstance.systemInfo,
            initData,
            globalProps,
            cardType,
            customSections,
            nativeModulesMap,
            napiModulesMap,
            entryTemplateUrl: this.#lynxViewInstance.templateUrl,
        }, [messageChannel.port2]);
        this.#messagePort = messageChannel.port1;
        this.#rpc.setMessagePort(messageChannel.port1);
    }
    startBTS() {
        if (this.#btsStarted)
            return;
        this.#btsStarted = true;
        // prepare bts rpc handlers
        this.#rpc.registerHandler(callLepusMethodEndpoint, (methodName, data) => {
            const method = this.#lynxViewInstance.mainThreadGlobalThis[methodName];
            if (typeof method === 'function') {
                return method.call(this.#lynxViewInstance.mainThreadGlobalThis, data);
            }
            else {
                console.error(`Method ${methodName} not found on mainThreadGlobalThis`);
            }
        });
        this.#rpc.registerHandler(switchExposureServiceEndpoint, this.#lynxViewInstance.exposureServices.switchExposureService.bind(this.#lynxViewInstance.exposureServices));
        this.#rpc.registerHandler(intersectionObserverCommandEndpoint, (command) => {
            this.#lynxViewInstance.intersectionObserverService.handleCommand(command);
        });
        this.#rpc.registerHandler(reportErrorEndpoint, (e, _, release) => {
            this.#lynxViewInstance.reportError(e, release, 'app-service.js');
        });
        this.#rpc.registerHandler(dispatchLynxViewEventEndpoint, (eventType, detail) => {
            this.#lynxViewInstance.rootDom.dispatchEvent(new CustomEvent(eventType, {
                detail,
                bubbles: true,
                cancelable: true,
                composed: true,
            }));
        });
        this.#rpc.registerHandler(dispatchDevtoolEventOnMainThreadEndpoint, (event) => {
            this.#lynxViewInstance.parentDom.dispatchEvent(new CustomEvent('devtoolMessage', {
                detail: event,
                bubbles: true,
                cancelable: true,
                composed: true,
            }));
        });
        this.#rpc.registerHandler(queryComponentEndpoint, (url) => {
            return this.#lynxViewInstance.queryComponent(url).then(() => {
                this.jsContext.dispatchEvent({
                    type: '__OnDynamicJSSourcePrepared',
                    data: url,
                });
                return {
                    code: 0,
                    detail: {
                        schema: url,
                    },
                };
            });
        });
        this.#rpc.registerHandler(fetchExternalBundleEndpoint, (url) => {
            // `loadExternalBundle` decodes the bundle through the shared decode
            // worker; its `Manifest` section registers the bts chunks with the
            // worker (updateBTSChunk -> templateCache) and its `LepusCode` section
            // registers the mts chunks under `lepusCodeUrls`, so `lynx.loadScript`
            // can load either realm afterwards.
            return this.#lynxViewInstance.loadExternalBundle(url);
        });
        registerReloadHandler(this.#rpc, this.#lynxViewInstance);
        registerGetPathInfoHandler(this.#rpc, this.#lynxViewInstance);
        registerInvokeUIMethodHandler(this.#rpc, this.#lynxViewInstance);
        registerNapiModulesCallHandler(this.#rpc, this.#lynxViewInstance);
        registerNativeModulesCallHandler(this.#rpc, this.#lynxViewInstance);
        registerSelectComponentHandler(this.#rpc, this.#lynxViewInstance);
        registerNativePropsHandler(this.#rpc, this.#lynxViewInstance);
        registerTriggerComponentEventHandler(this.#rpc, this.#lynxViewInstance);
        registerTriggerElementMethodEndpointHandler(this.#rpc, this.#lynxViewInstance);
        this.#rpc.invoke(BackgroundThreadStartEndpoint, []).then(this.#btsReadyResolver);
    }
    markTiming(timingKey, pipelineId, timeStamp) {
        this.#caughtTimingInfo.push({
            timingKey,
            pipelineId,
            timeStamp: timeStamp ?? (performance.now() + performance.timeOrigin),
        });
        if (this.#nextMacroTask === null) {
            this.#nextMacroTask = setTimeout(() => {
                this.flushTimingInfo();
            }, 500);
        }
    }
    /**
     * Flush the timing info immediately.
     */
    flushTimingInfo() {
        this.#batchSendTimingInfo(this.#caughtTimingInfo);
        this.#caughtTimingInfo = [];
        if (this.#nextMacroTask !== null) {
            clearTimeout(this.#nextMacroTask);
            this.#nextMacroTask = null;
        }
    }
    async [Symbol.asyncDispose]() {
        if (this.#btsStarted) {
            await this.#btsReady;
            await this.#rpc.invoke(disposeEndpoint, []);
        }
        if (this.#lynxGroupId !== undefined) {
            const group = BackgroundThread.contextIdToBackgroundWorker[this.#lynxGroupId];
            if (group) {
                group.runningCards -= 1;
                if (group.runningCards === 0) {
                    group.worker.terminate();
                    BackgroundThread.contextIdToBackgroundWorker[this.#lynxGroupId] = undefined;
                }
            }
        }
        else {
            this.#webWorker?.terminate();
        }
        this.#messagePort?.close();
        this.#messagePort = undefined;
        this.#nextMacroTask && clearTimeout(this.#nextMacroTask);
    }
}
//# sourceMappingURL=Background.js.map

},
4430(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/* import */ var _utils_requestIdleCallback_js__rspack_import_0 = __webpack_require__(248);
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Minimum spacing between idle-time cache invalidations, in milliseconds.
 *
 * 240 ms ≈ one full cycle of the "Model Human Processor" (Card, Moran &
 * Newell, *The Psychology of Human-Computer Interaction*, 1983): ~100 ms
 * perceptual + ~70 ms cognitive + ~70 ms motor processing — the time it
 * takes a person to perceive a stimulus, decide on a response, and
 * produce it. It also falls within the typical sustained-input window for
 * finger tapping (~2–7 Hz, varying with task and stimulus modality), so
 * cache staleness on this timescale stays at or below the threshold at
 * which a user can issue a distinct, intentional next input. Throttling
 * idle-time invalidation here keeps `getBoundingClientRect` off the hot
 * path while bounding cache lag during idle to ~250 ms.
 *
 * References:
 * - MHP cycle-time table (citing Card, Moran & Newell 1983):
 *   https://en.wikipedia.org/wiki/Human_processor_model
 * - Tapping-rate ranges and limits:
 *   https://pmc.ncbi.nlm.nih.gov/articles/PMC2670435/
 */
const MIN_IDLE_INVALIDATION_INTERVAL_MS = 240;
class BoundingClientRectService {
    #parentDom;
    #cachedRect = new DOMRect(0, 0, 0, 0);
    #dirty = true;
    #idleScheduled = false;
    #lastIdleInvalidation = 0;
    #disposed = false;
    constructor(parentDom) {
        this.#parentDom = parentDom;
        parentDom.addEventListener('transitionend', this.#onAnimationOrTransitionEnd);
        parentDom.addEventListener('animationend', this.#onAnimationOrTransitionEnd);
    }
    getLynxViewRect() {
        if (this.#dirty && !this.#disposed) {
            this.#cachedRect = this.#parentDom.getBoundingClientRect();
            this.#dirty = false;
        }
        this.#scheduleIdleInvalidation();
        return this.#cachedRect;
    }
    dispose() {
        this.#disposed = true;
        this.#parentDom.removeEventListener('transitionend', this.#onAnimationOrTransitionEnd);
        this.#parentDom.removeEventListener('animationend', this.#onAnimationOrTransitionEnd);
    }
    // Idle-time invalidation, throttled to MIN_IDLE_INVALIDATION_INTERVAL_MS.
    // Catches drifts (e.g., transform, scroll) that no other invalidation
    // path observes, without paying for a per-frame re-measurement.
    #scheduleIdleInvalidation() {
        if (this.#idleScheduled || this.#disposed)
            return;
        this.#idleScheduled = true;
        (0,_utils_requestIdleCallback_js__rspack_import_0/* .requestIdleCallbackImpl */.b)(() => {
            this.#idleScheduled = false;
            if (this.#disposed)
                return;
            const now = performance.now();
            if (now - this.#lastIdleInvalidation < MIN_IDLE_INVALIDATION_INTERVAL_MS) {
                return;
            }
            this.#lastIdleInvalidation = now;
            this.#dirty = true;
        });
    }
    // Only invalidate on transitions/animations of the lynx-view itself —
    // events bubbling from descendants (including across the shadow boundary,
    // which retargets `event.target` to the host) cannot move the lynx-view.
    #onAnimationOrTransitionEnd = (event) => {
        if (event.composedPath()[0] !== this.#parentDom)
            return;
        this.#dirty = true;
    };
}
//# sourceMappingURL=BoundingClientRectService.js.map
__webpack_require__.d(__webpack_exports__, {
  x: () => (BoundingClientRectService)
});


},
4094(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  _: () => (/* binding */ ExposureServices)
});

// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/constants.js
var constants = __webpack_require__(3077);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/utils/convertLengthToPx.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
function convertLengthToPx(targetElement, str, isWidth) {
    if (str) {
        str = str.trim();
        if (str.endsWith('px')) {
            return Number(str.substring(0, str.length - 2));
        }
        else if (str.endsWith('%')) {
            const pct = Number(str.substring(0, str.length - 1));
            const { width, height } = targetElement.getBoundingClientRect();
            const base = isWidth ? width : height;
            return (base * pct) / 100;
        }
        else {
            /**
             * TODO (haoyang.wang): support rpx
             */
            return 0;
        }
    }
    return 0;
}
//# sourceMappingURL=convertLengthToPx.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/ExposureServices.js
/*
 * Copyright 2021-2024 The Lynx Authors. All rights reserved.
 * Licensed under the Apache License Version 2.0 that can be found in the
 * LICENSE file in the root directory of this source tree.
 */


class ExposureServices {
    #exposureEnabledElementsToIntersectionObserver = new Map();
    #exposureEnabledElementsToOldExposureIdAttributeValue = new Map();
    #globalExposureEventCache = [];
    #globalDisexposureEventCache = [];
    #globalExposureEventBatchTimer = null;
    /**
     * The elements that are currently exposed
     * We only send the event when the element enters or leaves the exposed state
     */
    #exposedElements = new Set();
    /**
     * note that this flag only affects the global exposure events.
     * The uiappear/uidisappear events are always dispatched when the element enters or leaves the viewport
     */
    #isExposureServiceOn = true;
    #lynxViewInstance;
    constructor(lynxViewInstance) {
        this.#lynxViewInstance = lynxViewInstance;
    }
    /**
     * diff the current exposure enabled elements with the previous ones, and start/stop IntersectionObserver accordingly
     * If an element's exposure-id attribute has changed, we also need to send a new disexposure event with the old one
     */
    updateExposureStatus(elementsToBeEnabled, elementsToBeDisabled) {
        const elementsToBeEnabledSet = new Set(elementsToBeEnabled);
        // start observing newly enabled elements
        for (const element of elementsToBeEnabledSet.values()) {
            if (this.#exposureEnabledElementsToIntersectionObserver.has(element)) {
                this.#stopIntersectionObserver(element);
            }
            this.#startIntersectionObserver(element);
        }
        const elementsToBeDisabledSet = new Set(elementsToBeDisabled);
        // stop observing newly disabled elements
        for (const element of elementsToBeDisabledSet.values()) {
            this.#stopIntersectionObserver(element);
        }
    }
    #IntersectionObserverEventHandler = (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting && !this.#exposedElements.has(target)) {
                this.#sendExposureEvent(target, true, null, true);
                this.#exposedElements.add(target);
            }
            else if (!isIntersecting && this.#exposedElements.has(target)) {
                this.#sendExposureEvent(target, false, null, true);
                this.#exposedElements.delete(target);
            }
        });
    };
    #stopIntersectionObserver(element) {
        const intersectionObserver = this
            .#exposureEnabledElementsToIntersectionObserver.get(element);
        if (intersectionObserver) {
            const oldExposureId = this
                .#exposureEnabledElementsToOldExposureIdAttributeValue.get(element);
            intersectionObserver.unobserve(element);
            intersectionObserver.disconnect();
            this.#exposureEnabledElementsToIntersectionObserver.delete(element);
            this.#exposureEnabledElementsToOldExposureIdAttributeValue.delete(element);
            const currentExposureId = element.getAttribute('exposure-id');
            if (oldExposureId != null && currentExposureId !== oldExposureId) {
                this.#sendExposureEvent(element, false, oldExposureId, false);
            }
        }
        this.#exposedElements.delete(element);
    }
    #startIntersectionObserver(target) {
        const threshold = parseFloat(target.getAttribute('exposure-area') ?? '0')
            / 100;
        const screenMarginTop = convertLengthToPx(target, target.getAttribute('exposure-screen-margin-top'));
        const screenMarginRight = convertLengthToPx(target, target.getAttribute('exposure-screen-margin-right'));
        const screenMarginBottom = convertLengthToPx(target, target.getAttribute('exposure-screen-margin-bottom'));
        const screenMarginLeft = convertLengthToPx(target, target.getAttribute('exposure-screen-margin-left'));
        const uiMarginTop = convertLengthToPx(target, target.getAttribute('exposure-ui-margin-top'));
        const uiMarginRight = convertLengthToPx(target, target.getAttribute('exposure-ui-margin-right'));
        const uiMarginBottom = convertLengthToPx(target, target.getAttribute('exposure-ui-margin-bottom'));
        const uiMarginLeft = convertLengthToPx(target, target.getAttribute('exposure-ui-margin-left'));
        /**
         * TODO: @haoyang.wang support the switch `enableExposureUIMargin`
         */
        const calcedRootMarginTop = (uiMarginBottom ? -1 : 1)
            * (screenMarginTop - uiMarginBottom);
        const calcedRootMarginRight = (uiMarginLeft ? -1 : 1)
            * (screenMarginRight - uiMarginLeft);
        const calcedRootMarginBottom = (uiMarginTop ? -1 : 1)
            * (screenMarginBottom - uiMarginTop);
        const calcedRootMarginLeft = (uiMarginRight ? -1 : 1)
            * (screenMarginLeft - uiMarginRight);
        // get the parent scroll container
        let root = target.parentElement;
        while (root) {
            // @ts-expect-error
            if (root[constants/* .scrollContainerDom */.li]) {
                // @ts-expect-error
                root = root[constants/* .scrollContainerDom */.li];
                break;
            }
            else {
                root = root.parentElement;
            }
        }
        const rootContainer = root ?? this.#lynxViewInstance.rootDom.parentElement;
        const intersectionObserver = new IntersectionObserver(this.#IntersectionObserverEventHandler, {
            rootMargin: `${calcedRootMarginTop}px ${calcedRootMarginRight}px ${calcedRootMarginBottom}px ${calcedRootMarginLeft}px`,
            root: rootContainer,
            threshold,
        });
        intersectionObserver.observe(target);
        this.#exposureEnabledElementsToIntersectionObserver.set(target, intersectionObserver);
        const currentExposureId = target.getAttribute('exposure-id');
        if (currentExposureId != null) {
            this.#exposureEnabledElementsToOldExposureIdAttributeValue.set(target, currentExposureId);
        }
    }
    #sendExposureEvent(target, isIntersecting, exposureId, 
    /**
     * Whether to send the uiappear/uidisappear event
     * If the exposure service is turned from off to on, we may not want to send the appear events for all currently exposed elements
     */
    sendAppearEvent) {
        exposureId = exposureId ?? target.getAttribute('exposure-id');
        const exposureScene = target.getAttribute('exposure-scene') ?? '';
        const uniqueId = this.#lynxViewInstance.mainThreadGlobalThis
            .__GetElementUniqueID(target);
        const detail = {
            'unique-id': uniqueId,
            exposureID: exposureId,
            exposureScene,
            'exposure-id': exposureId,
            'exposure-scene': exposureScene,
        };
        if (sendAppearEvent) {
            const appearEvent = new CustomEvent(isIntersecting ? 'uiappear' : 'uidisappear', {
                bubbles: false,
                composed: false,
                cancelable: true,
                detail,
            });
            target.dispatchEvent(appearEvent);
        }
        const serializedTargetInfo = this.#lynxViewInstance.mtsWasmBinding
            .generateTargetObject(target, this.#lynxViewInstance.mainThreadGlobalThis.__GetDataset(target)
            ?? {});
        const globalEvent = {
            dataset: serializedTargetInfo.dataset,
            ...detail,
            type: isIntersecting ? 'exposure' : 'disexposure',
            target: serializedTargetInfo,
            currentTarget: serializedTargetInfo,
            detail: {
                ...detail,
                'unique-id': 0,
            },
            timestamp: Date.now(),
        };
        if (isIntersecting) {
            this.#globalExposureEventCache.push(globalEvent);
        }
        else {
            this.#globalDisexposureEventCache.push(globalEvent);
        }
        if (!this.#globalExposureEventBatchTimer) {
            this.#globalExposureEventBatchTimer = setTimeout(() => {
                if (this.#globalExposureEventCache.length > 0
                    || this.#globalDisexposureEventCache.length > 0) {
                    const currentExposureEvents = this.#globalExposureEventCache;
                    const currentDisexposureEvents = this.#globalDisexposureEventCache;
                    this.#globalExposureEventCache = [];
                    this.#globalDisexposureEventCache = [];
                    if (currentExposureEvents.length > 0) {
                        this.#lynxViewInstance.backgroundThread?.sendGlobalEvent('exposure', [
                            currentExposureEvents,
                        ]);
                    }
                    if (currentDisexposureEvents.length > 0) {
                        this.#lynxViewInstance.backgroundThread?.sendGlobalEvent('disexposure', [
                            currentDisexposureEvents,
                        ]);
                    }
                }
                this.#globalExposureEventBatchTimer = null;
            }, 1000 / 20);
        }
    }
    switchExposureService(toEnable, sendEvent) {
        if (toEnable && !this.#isExposureServiceOn) {
            // send all onScreen info
            this.#exposedElements.forEach((element) => {
                this.#sendExposureEvent(element, true, element.getAttribute('exposure-id'), false);
            });
        }
        else if (!toEnable && this.#isExposureServiceOn) {
            if (sendEvent) {
                this.#exposedElements.forEach((element) => {
                    this.#sendExposureEvent(element, false, element.getAttribute('exposure-id'), false);
                });
            }
        }
        this.#isExposureServiceOn = toEnable;
    }
    dispose() {
        this.#exposureEnabledElementsToIntersectionObserver.forEach((observer) => {
            observer.disconnect();
        });
        this.#exposureEnabledElementsToIntersectionObserver.clear();
        this.#exposureEnabledElementsToOldExposureIdAttributeValue.clear();
        this.#exposedElements.clear();
        if (this.#globalExposureEventBatchTimer) {
            clearTimeout(this.#globalExposureEventBatchTimer);
            this.#globalExposureEventBatchTimer = null;
        }
        this.#globalExposureEventCache = [];
        this.#globalDisexposureEventCache = [];
    }
}
//# sourceMappingURL=ExposureServices.js.map

},
208(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/* import */ var _constants_js__rspack_import_0 = __webpack_require__(3077);
/*
 * Copyright 2025 The Lynx Authors. All rights reserved.
 * Licensed under the Apache License Version 2.0 that can be found in the
 * LICENSE file in the root directory of this source tree.
 */

const getCacheI18nResourcesKey = (options) => {
    return `${options.locale}_${options.channel}_${options.fallback_url}`;
};
class I18nManager {
    #background;
    #rootDom;
    #i18nResources;
    constructor(background, rootDom, i18nResources = []) {
        this.#background = background;
        this.#rootDom = rootDom;
        this.#i18nResources = i18nResources;
    }
    updateData(data, options) {
        this.#i18nResources = this.#i18nResources.concat(data);
        const matchedInitI18nResources = data.find(i => getCacheI18nResourcesKey(i.options)
            === getCacheI18nResourcesKey(options));
        this.#background.dispatchI18nResource(matchedInitI18nResources?.resource);
    }
    _I18nResourceTranslation = (options) => {
        const matchedInitI18nResources = this.#i18nResources?.find((i) => getCacheI18nResourcesKey(i.options)
            === getCacheI18nResourcesKey(options));
        this.#background.dispatchI18nResource(matchedInitI18nResources?.resource);
        if (matchedInitI18nResources) {
            return matchedInitI18nResources.resource;
        }
        this.#triggerI18nResourceFallback(options);
        return undefined;
    };
    #triggerI18nResourceFallback(options) {
        const event = new CustomEvent(_constants_js__rspack_import_0/* .i18nResourceMissedEventName */.hv, {
            detail: options,
            bubbles: true,
            composed: true,
        });
        this.#rootDom.dispatchEvent(event);
    }
}
//# sourceMappingURL=I18n.js.map
__webpack_require__.d(__webpack_exports__, {
  S: () => (I18nManager)
});


},
1376(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
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
const EMPTY_RECT = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};
const BROWSER_THRESHOLD_EPSILON = 1e-7;
function normalizeThresholds(thresholds) {
    const normalized = (Array.isArray(thresholds) ? thresholds : DEFAULT_OPTIONS.thresholds)
        .filter((threshold) => Number.isFinite(threshold) && threshold >= 0 && threshold <= 1)
        .sort((left, right) => left - right);
    return normalized.length > 0 ? [...new Set(normalized)] : [0];
}
function toBrowserThresholds(thresholds) {
    const browserThresholds = new Set(thresholds);
    for (const threshold of thresholds) {
        if (threshold < 1) {
            browserThresholds.add(Math.min(1, threshold + BROWSER_THRESHOLD_EPSILON));
        }
    }
    return [...browserThresholds].sort((left, right) => left - right);
}
function toRootMarginValue(value) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? `${value}px` : '0px';
    }
    const normalized = value?.trim();
    if (!normalized)
        return '0px';
    if (/^-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|%)$/.test(normalized)) {
        return normalized;
    }
    if (/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)) {
        return `${normalized}px`;
    }
    return '0px';
}
function toRootMargin(margins) {
    return [
        margins.top,
        margins.right,
        margins.bottom,
        margins.left,
    ].map(toRootMarginValue).join(' ');
}
function rectToPayload(rect, offsetLeft, offsetTop) {
    if (!rect)
        return { ...EMPTY_RECT };
    return {
        left: rect.left - offsetLeft,
        right: rect.right - offsetLeft,
        top: rect.top - offsetTop,
        bottom: rect.bottom - offsetTop,
    };
}
function hasCrossedThreshold(thresholds, previousRatio, currentRatio) {
    if (previousRatio === currentRatio)
        return false;
    return thresholds.some((threshold) => threshold === previousRatio
        || threshold === currentRatio
        || (threshold < previousRatio) !== (threshold < currentRatio));
}
class IntersectionObserverService {
    #lynxViewInstance;
    #observers = new Map();
    #disposed = false;
    constructor(lynxViewInstance) {
        this.#lynxViewInstance = lynxViewInstance;
    }
    handleCommand(command) {
        if (this.#disposed)
            return;
        switch (command.type) {
            case 'create':
                this.#create(command.observerId, command.componentId, command.options);
                break;
            case 'relativeTo':
                this.#configureRoot(command.observerId, 'element', command.margins, command.selector);
                break;
            case 'relativeToViewport':
                this.#configureRoot(command.observerId, 'viewport', command.margins);
                break;
            case 'relativeToScreen':
                this.#configureRoot(command.observerId, 'screen', command.margins);
                break;
            case 'observe':
                this.#observe(command.observerId, command.selector, command.callbackId);
                break;
            case 'disconnect':
                this.#disconnect(command.observerId);
                break;
        }
    }
    dispose() {
        this.#disposed = true;
        for (const observer of this.#observers.values()) {
            observer.browserObserver?.disconnect();
            observer.targets.clear();
        }
        this.#observers.clear();
    }
    #create(observerId, componentId, options) {
        this.#disconnect(observerId);
        this.#observers.set(observerId, {
            componentId,
            margins: { ...DEFAULT_MARGINS },
            options: {
                thresholds: normalizeThresholds(options.thresholds),
                initialRatio: Number.isFinite(options.initialRatio)
                    ? options.initialRatio
                    : DEFAULT_OPTIONS.initialRatio,
                observeAll: options.observeAll ?? DEFAULT_OPTIONS.observeAll,
            },
            rootType: 'viewport',
            targets: new Map(),
        });
    }
    #configureRoot(observerId, rootType, margins, rootSelector) {
        const observer = this.#observers.get(observerId);
        if (!observer)
            return;
        observer.rootType = rootType;
        observer.rootSelector = rootSelector;
        observer.margins = { ...DEFAULT_MARGINS, ...margins };
        this.#rebuildBrowserObserver(observerId, observer);
    }
    #observe(observerId, selector, callbackId) {
        const observer = this.#observers.get(observerId);
        if (!observer)
            return;
        const targets = observer.options.observeAll
            ? this.#resolveTargets(observer.componentId, selector)
            : [this.#resolveTarget(observer.componentId, selector)].filter((target) => target !== null);
        if (targets.length === 0)
            return;
        const browserObserver = this.#ensureBrowserObserver(observerId, observer);
        for (const target of targets) {
            if (observer.targets.has(target))
                continue;
            observer.targets.set(target, { callbackId });
            browserObserver.observe(target);
        }
    }
    #disconnect(observerId) {
        const observer = this.#observers.get(observerId);
        observer?.browserObserver?.disconnect();
        observer?.targets.clear();
        this.#observers.delete(observerId);
    }
    #rebuildBrowserObserver(observerId, observer) {
        if (!observer.browserObserver)
            return;
        observer.browserObserver.disconnect();
        observer.browserObserver = undefined;
        if (observer.targets.size === 0)
            return;
        const browserObserver = this.#ensureBrowserObserver(observerId, observer);
        for (const target of observer.targets.keys()) {
            browserObserver.observe(target);
        }
    }
    #ensureBrowserObserver(observerId, observer) {
        if (observer.browserObserver)
            return observer.browserObserver;
        const browserObserver = new IntersectionObserver((entries) => {
            if (observer.browserObserver !== browserObserver)
                return;
            this.#handleEntries(observerId, observer, entries);
        }, {
            root: this.#resolveRoot(observer),
            rootMargin: toRootMargin(observer.margins),
            threshold: toBrowserThresholds(observer.options.thresholds),
        });
        observer.browserObserver = browserObserver;
        return browserObserver;
    }
    #resolveRoot(observer) {
        if (observer.rootType === 'screen')
            return null;
        if (observer.rootType === 'viewport') {
            return this.#getViewportRoot();
        }
        return observer.rootSelector
            ? this.#resolveTarget(observer.componentId, observer.rootSelector)
                ?? this.#getViewportRoot()
            : this.#getViewportRoot();
    }
    #getViewportRoot() {
        return this.#lynxViewInstance.rootDom.querySelector('[part="page"]')
            ?? this.#lynxViewInstance.parentDom;
    }
    #resolveTarget(componentId, selector) {
        return this.#resolveTargets(componentId, selector)[0] ?? null;
    }
    #resolveTargets(componentId, selector) {
        if (!selector.startsWith('#')) {
            if (!/^\d+$/.test(selector))
                return [];
            const target = this.#lynxViewInstance.mtsWasmBinding.getElementByUniqueId(Number(selector));
            return target ? [target] : [];
        }
        const componentRoot = componentId && componentId !== 'card'
            ? this.#lynxViewInstance.mtsWasmBinding.getElementByComponentId(componentId)
            : null;
        const scopedTargets = this.#querySelectorAll(componentRoot ?? null, selector);
        return scopedTargets.length > 0
            ? scopedTargets
            : this.#querySelectorAll(this.#lynxViewInstance.rootDom, selector);
    }
    #querySelectorAll(root, selector) {
        if (!root)
            return [];
        try {
            const targets = [...root.querySelectorAll(selector)];
            if (root instanceof HTMLElement && root.matches(selector)) {
                targets.unshift(root);
            }
            return targets;
        }
        catch {
            return [];
        }
    }
    #handleEntries(observerId, observer, entries) {
        const shouldOffsetFromViewport = observer.rootType !== 'screen';
        const lynxViewRect = shouldOffsetFromViewport
            ? this.#lynxViewInstance.boundingClientRectService.getLynxViewRect()
            : null;
        const offsetLeft = lynxViewRect?.left ?? 0;
        const offsetTop = lynxViewRect?.top ?? 0;
        for (const entry of entries) {
            const target = observer.targets.get(entry.target);
            if (!target)
                continue;
            const hasArea = entry.intersectionRect.width > 0
                && entry.intersectionRect.height > 0;
            const isIntersecting = entry.isIntersecting && hasArea;
            const intersectionRatio = isIntersecting ? entry.intersectionRatio : 0;
            const currentRatio = isIntersecting ? intersectionRatio : -1;
            let shouldNotify;
            if (target.ratio === undefined) {
                shouldNotify = observer.options.initialRatio < intersectionRatio;
            }
            else {
                const previousRatio = target.isIntersecting ? target.ratio : -1;
                shouldNotify = hasCrossedThreshold(observer.options.thresholds, previousRatio, currentRatio);
            }
            target.ratio = intersectionRatio;
            target.isIntersecting = isIntersecting;
            if (!shouldNotify)
                continue;
            const payload = {
                relativeRect: rectToPayload(entry.rootBounds, offsetLeft, offsetTop),
                boundingClientRect: rectToPayload(entry.boundingClientRect, offsetLeft, offsetTop),
                intersectionRect: isIntersecting
                    ? rectToPayload(entry.intersectionRect, offsetLeft, offsetTop)
                    : { ...EMPTY_RECT },
                intersectionRatio,
                isIntersecting,
                time: 0,
                observerId: entry.target.id,
            };
            this.#lynxViewInstance.backgroundThread
                .dispatchIntersectionObserverEvent(observerId, target.callbackId, payload);
        }
    }
}
//# sourceMappingURL=IntersectionObserverService.js.map
__webpack_require__.d(__webpack_exports__, {
  P: () => (IntersectionObserverService)
});


},
8704(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/* import */ var _LynxCrossThreadContext_js__rspack_import_0 = __webpack_require__(634);

function captureOf(options) {
    return typeof options === 'boolean' ? options : options?.capture === true;
}
/**
 * Ledger key. `capture` is part of listener identity for `EventTarget` — the
 * same callback added once capturing and once bubbling is two registrations —
 * so it is part of the key too.
 */
function ledgerKey(type, capture) {
    return `${capture ? 'C' : 'B'}\u0000${type}`;
}
let EngineEvent;
/**
 * Build the object handed to `super.dispatchEvent`.
 *
 * `EventTarget` only accepts a real `Event`, so the engine's `{ type, data }`
 * has to travel as one. It is deliberately an `Event` subclass rather than a
 * `MessageEvent`: `new MessageEvent(type, { data: undefined })` coerces `data`
 * to `null`, whereas the engine uses `undefined` to mark an event that carries
 * no packed arguments (`__DestroyLifetime`), and the public
 * `EngineMessageEvent.data` type admits no `null`. Subclassing also keeps the
 * event in the same realm as the `Event` this class was defined against, which
 * `dispatchEvent` brand-checks.
 *
 * The class is built on first use because `Event` is not guaranteed to exist
 * when this module is evaluated.
 */
function engineEvent(type, data) {
    EngineEvent ??= class extends Event {
        data;
        constructor(eventType, eventData) {
            super(eventType);
            this.data = eventData;
        }
    };
    return new EngineEvent(type, data);
}
/**
 * Main-thread-local implementation of the Engine context proxy
 * (`ContextProxy::Type::kEngine`).
 *
 * Buildless (vanilla) Lynx cards subscribe to engine lifecycle events instead
 * of exporting `globalThis.renderPage` / `globalThis.updatePage`:
 *
 * ```js
 * const engine = lynx.getEngine();
 * engine.addEventListener('__RenderPage', onRenderPage);
 * engine.addEventListener('__DestroyLifetime', cleanup);
 * ```
 *
 * The engine side (`LynxViewInstance`) must consult {@link hasEventListener}
 * before dispatching and fall back to the direct global call when no listener
 * is registered — this is what keeps existing ReactLynx bundles working. See
 * `TemplateAssembler::DispatchEventFromEngineToCoreContext` and
 * {@link dispatchEngineEventWithFallback}.
 *
 * Registration identity, invocation order, `once` and duplicate-add semantics
 * are delegated to `EventTarget`, exactly as `LynxCrossThreadContext` does for
 * `lynx.getJSContext()`, so the two contexts a card can reach behave alike.
 * Listeners receive an event whose `type` and `data` mirror the engine, where
 * `LepusClosureEventListener::ConvertEventToLepusValue` reads those same two
 * fields off the event before handing them to lepus.
 *
 * Unlike the JS context there is no RPC hop: the engine and the main-thread
 * script share a thread, so `dispatchEvent` delivers synchronously.
 */
class LynxEngineContextImpl extends EventTarget {
    /**
     * Mirror of what has been handed to `EventTarget`, keyed by
     * {@link ledgerKey} and mapping each card callback to the wrapper actually
     * registered for it.
     *
     * `EventTarget` exposes no way to ask whether a type has listeners, and the
     * engine needs exactly that to choose between the event channel and the
     * legacy direct call. The ledger answers {@link hasEventListener} and holds
     * the wrappers needed to unregister; it never decides ordering or delivery.
     * Empty buckets are dropped, so a bucket's presence is itself the answer.
     */
    #ledger = new Map();
    #disposed = false;
    // @ts-expect-error the listener receives the `{ type, data }` view of the
    // dispatched `MessageEvent`, which is narrower than DOM `EventListener`.
    addEventListener(type, listener, options) {
        if (typeof listener !== 'function' || this.#disposed)
            return;
        const capture = captureOf(options);
        const key = ledgerKey(type, capture);
        let bucket = this.#ledger.get(key);
        if (!bucket) {
            bucket = new Map();
            this.#ledger.set(key, bucket);
        }
        if (bucket.has(listener)) {
            // `EventTarget` ignores a repeated (type, listener, capture) triple and
            // keeps the first registration's options. Returning here keeps that
            // no-op exact: re-registering the same wrapper would be ignored anyway,
            // but building a *new* wrapper would read as a distinct listener and be
            // invoked a second time.
            return;
        }
        const once = typeof options === 'object' && options.once === true;
        const wrapper = ((event) => {
            // `EventTarget` unregisters a `once` listener *before* invoking it, so
            // the ledger can settle up here rather than trying to predict from the
            // outside which registrations a dispatch consumed. Doing it first also
            // means a handler that re-arms itself (`addEventListener(type, self,
            // { once: true })` from inside its own call) re-enters the ledger after
            // this removal and is correctly kept.
            if (once)
                this.#forget(key, listener);
            try {
                listener(event);
            }
            catch (e) {
                // Report and carry on, so one broken card callback cannot stop the
                // remaining listeners — or, on the `__DestroyLifetime` path, abort
                // teardown and leak the worker. `EventTarget` would otherwise hand the
                // throw to the host's "report an exception" step, which a bare jsdom
                // realm discards silently.
                console.error(`[lynx-web] error in engine "${type}" listener`, e);
            }
        });
        bucket.set(listener, wrapper);
        super.addEventListener(type, wrapper, options);
    }
    // @ts-expect-error see `addEventListener`.
    removeEventListener(type, listener, options) {
        if (typeof listener !== 'function')
            return;
        const capture = captureOf(options);
        const wrapper = this.#forget(ledgerKey(type, capture), listener);
        if (wrapper)
            super.removeEventListener(type, wrapper, capture);
    }
    /** Drop `listener` from the ledger, returning the wrapper to unregister. */
    #forget(key, listener) {
        const bucket = this.#ledger.get(key);
        if (!bucket)
            return undefined;
        const wrapper = bucket.get(listener);
        if (bucket.delete(listener) && bucket.size === 0) {
            this.#ledger.delete(key);
        }
        return wrapper;
    }
    /**
     * Whether at least one listener is registered for `type`, regardless of its
     * capture flag. This is the web counterpart of
     * `ContextProxy::HasEventListener`, which the engine consults to choose
     * between the event channel and the legacy direct call.
     */
    hasEventListener(type) {
        return this.#ledger.has(ledgerKey(type, true))
            || this.#ledger.has(ledgerKey(type, false));
    }
    /**
     * Dispatch an engine message event to the main-thread script.
     *
     * Accepts the `{ type, data }` shape used by `LynxCrossThreadContext` so card
     * code can dispatch onto the engine proxy with the same call shape it uses
     * for `lynx.getJSContext()`. Listeners run synchronously.
     */
    // @ts-expect-error the engine dispatches the `{ type, data }` shape and reads
    // back a `DispatchEventResult`, not the DOM `boolean`.
    dispatchEvent(event) {
        if (this.#disposed)
            return _LynxCrossThreadContext_js__rspack_import_0/* .DispatchEventResult.NotCanceled */.U.NotCanceled;
        // `once` bookkeeping is settled by the wrapper itself, as `EventTarget`
        // invokes it, so nothing has to be reconciled around this call.
        super.dispatchEvent(engineEvent(event.type, event.data));
        return _LynxCrossThreadContext_js__rspack_import_0/* .DispatchEventResult.NotCanceled */.U.NotCanceled;
    }
    /**
     * Stop delivering events. Called on teardown *after* `__DestroyLifetime` has
     * been delivered.
     *
     * Listeners are not individually unregistered. This proxy is owned by the
     * `LynxViewInstance` being destroyed — its only construction site — so once
     * that instance is unreachable the proxy and every listener it holds are
     * collected together. Clearing the ledger and refusing further dispatch is
     * the part callers can observe.
     */
    dispose() {
        this.#disposed = true;
        this.#ledger.clear();
    }
}
/**
 * Deliver an engine lifecycle event to the main-thread script, mirroring
 * `TemplateAssembler::DispatchEventFromEngineToCoreContext`:
 *
 * - if the Engine context proxy has a listener for `eventName`, dispatch a
 *   message event whose `data` carries the call arguments;
 * - otherwise fall back to calling the corresponding global function
 *   (`globalThis.renderPage` / `globalThis.updatePage`) directly.
 *
 * The fallback is what keeps existing ReactLynx bundles — which export
 * `globalThis.renderPage` and never touch `lynx.getEngine()` — working
 * unchanged.
 *
 * `args` is passed as an array, matching the engine, which packs `args...`
 * into a `lepus::CArray`. Events dispatched outside this helper - such as
 * `__DestroyLifetime`, a bare teardown signal - carry no arguments and so do
 * not use the array shape.
 *
 * @returns `true` when the event channel was used, `false` when `directCall`
 * ran. Returned for observability (tests, tracing); callers may ignore it.
 */
function dispatchEngineEventWithFallback(engineContext, eventName, directCall, args) {
    if (engineContext.hasEventListener(eventName)) {
        engineContext.dispatchEvent({
            type: eventName,
            data: args,
        });
        return true;
    }
    directCall();
    return false;
}
//# sourceMappingURL=LynxEngineContext.js.map
__webpack_require__.d(__webpack_exports__, {
  R: () => (dispatchEngineEventWithFallback),
  n: () => (LynxEngineContextImpl)
});


},
6903(__webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.a(__webpack_module__, async function (__rspack_load_async_deps, __rspack_async_done) { try {
__webpack_require__.r(__webpack_exports__);
/* import */ var _constants_js__rspack_import_0 = __webpack_require__(3077);
/* import */ var _Background_js__rspack_import_1 = __webpack_require__(3375);
/* import */ var _BoundingClientRectService_js__rspack_import_2 = __webpack_require__(4430);
/* import */ var _I18n_js__rspack_import_3 = __webpack_require__(208);
/* import */ var _IntersectionObserverService_js__rspack_import_4 = __webpack_require__(1376);
/* import */ var _elementAPIs_WASMJSBinding_js__rspack_import_5 = __webpack_require__(7882);
/* import */ var _elementAPIs_createInvokeUIMethod_js__rspack_import_6 = __webpack_require__(265);
/* import */ var _ExposureServices_js__rspack_import_7 = __webpack_require__(4094);
/* import */ var _elementAPIs_createElementAPI_js__rspack_import_8 = __webpack_require__(2962);
/* import */ var _createMainThreadGlobalAPIs_js__rspack_import_9 = __webpack_require__(4039);
/* import */ var _LynxEngineContext_js__rspack_import_10 = __webpack_require__(8704);
/* import */ var _TemplateManager_js__rspack_import_11 = __webpack_require__(4231);
/* import */ var _webElementsDynamicLoader_js__rspack_import_12 = __webpack_require__(9467);
/* import */ var _css_in_shadow_css_inline__rspack_import_13 = __webpack_require__(6271);
/* import */ var _utils_requestIdleCallback_js__rspack_import_14 = __webpack_require__(248);
var __rspack_async_deps = __rspack_load_async_deps([_elementAPIs_createElementAPI_js__rspack_import_8]);
_elementAPIs_createElementAPI_js__rspack_import_8 = (__rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps)[0];












// @ts-expect-error


(0,_webElementsDynamicLoader_js__rspack_import_12/* .loadAllWebElements */.l)().catch((e) => {
    console.error('[lynx-web] Failed to load web elements', e);
});
const IN_SHADOW_CSS = URL.createObjectURL(new Blob([_css_in_shadow_css_inline__rspack_import_13/* ["default"] */.A], { type: 'text/css' }));
const linkElement = document.createElement('link');
linkElement.rel = 'stylesheet';
linkElement.href = IN_SHADOW_CSS;
linkElement.type = 'text/css';
linkElement.fetchPriority = 'high';
linkElement.blocking = 'render';
const pixelRatio = window.devicePixelRatio;
const screenWidth = window.screen.availWidth * pixelRatio;
const screenHeight = window.screen.availHeight * pixelRatio;
function createSystemInfo(browserConfig) {
    return Object.freeze({
        ..._constants_js__rspack_import_0/* .systemInfoBase */.RM,
        // some information only available on main thread, we should read and pass to worker
        pixelRatio,
        pixelWidth: screenWidth,
        pixelHeight: screenHeight,
        ...browserConfig,
    });
}
class LynxViewInstance {
    parentDom;
    initData;
    globalprops;
    templateUrl;
    rootDom;
    mtsRealm;
    isSSR;
    transformVW;
    transformVH;
    transformREM;
    mainThreadGlobalThis;
    mtsWasmBinding;
    backgroundThread;
    i18nManager;
    exposureServices;
    intersectionObserverService;
    webElementsLoadingPromises = [];
    /**
     * The Engine context proxy handed to main-thread scripts via
     * `lynx.getEngine()`. Buildless cards subscribe here for engine lifecycle
     * events; see {@link dispatchEngineEvent} for the fallback semantics that
     * keep `globalThis.renderPage`-style bundles working.
     */
    engineContext = new _LynxEngineContext_js__rspack_import_10/* .LynxEngineContextImpl */.n();
    // A `.web.bundle` url is only ever loaded one way — as a lazy component
    // (`queryComponent`) or as an external bundle (`loadExternalBundle`), never
    // both — so both share a single per-url promise cache.
    #bundleLoadCache = new Map();
    #pageConfig;
    #nativeModulesMap;
    #napiModulesMap;
    boundingClientRectService;
    invokeUIMethod;
    get lynxViewClientLeft() {
        return this.boundingClientRectService.getLynxViewRect().left;
    }
    get lynxViewClientTop() {
        return this.boundingClientRectService.getLynxViewRect().top;
    }
    lepusCodeUrls = new Map();
    systemInfo;
    constructor(parentDom, initData, globalprops, templateUrl, rootDom, mtsRealm, isSSR, lynxGroupId, nativeModulesMap = {}, napiModulesMap = {}, initI18nResources, transformVW = false, transformVH = false, transformREM = false, browserConfig) {
        this.parentDom = parentDom;
        this.initData = initData;
        this.globalprops = globalprops;
        this.templateUrl = templateUrl;
        this.rootDom = rootDom;
        this.mtsRealm = mtsRealm;
        this.isSSR = isSSR;
        this.transformVW = transformVW;
        this.transformVH = transformVH;
        this.transformREM = transformREM;
        this.systemInfo = createSystemInfo(browserConfig);
        if (!isSSR) {
            this.rootDom.append(linkElement.cloneNode(false));
        }
        this.#nativeModulesMap = nativeModulesMap;
        this.#napiModulesMap = napiModulesMap;
        this.mainThreadGlobalThis = mtsRealm.globalWindow;
        this.boundingClientRectService = new _BoundingClientRectService_js__rspack_import_2/* .BoundingClientRectService */.x(parentDom);
        this.invokeUIMethod = (0,_elementAPIs_createInvokeUIMethod_js__rspack_import_6/* .createInvokeUIMethod */.C)(this.boundingClientRectService);
        this.backgroundThread = new _Background_js__rspack_import_1/* .BackgroundThread */.D(lynxGroupId, this);
        this.i18nManager = new _I18n_js__rspack_import_3/* .I18nManager */.S(this.backgroundThread, this.rootDom, initI18nResources);
        this.mtsWasmBinding = new _elementAPIs_WASMJSBinding_js__rspack_import_5/* .WASMJSBinding */.p(this);
        this.exposureServices = new _ExposureServices_js__rspack_import_7/* .ExposureServices */._(this);
        this.intersectionObserverService = new _IntersectionObserverService_js__rspack_import_4/* .IntersectionObserverService */.P(this);
        this.backgroundThread.markTiming('create_lynx_start');
    }
    onPageConfigReady(config) {
        if (this.#pageConfig) {
            return;
        }
        // create element APIs
        this.#pageConfig = config;
        const enableCSSSelector = config['enableCSSSelector'] == 'true';
        const defaultDisplayLinear = config['defaultDisplayLinear'] == 'true';
        const defaultOverflowVisible = config['defaultOverflowVisible'] == 'true';
        Object.assign(this.mtsRealm.globalWindow, (0,_elementAPIs_createElementAPI_js__rspack_import_8/* .createElementAPI */.b)(this.rootDom, this.mtsWasmBinding, enableCSSSelector, defaultDisplayLinear, defaultOverflowVisible, this.transformVW, this.transformVH, this.transformREM, config['enableCSSInheritance'] === 'true'), (0,_createMainThreadGlobalAPIs_js__rspack_import_9/* .createMainThreadGlobalAPIs */.O)(this));
    }
    onStyleInfoReady(currentUrl) {
        if (this.mtsWasmBinding.wasmContext) {
            const resource = _TemplateManager_js__rspack_import_11/* .templateManager.getStyleSheet */.Q.getStyleSheet(currentUrl);
            if (resource) {
                this.mtsWasmBinding.wasmContext.push_style_sheet(resource, this.templateUrl === currentUrl ? undefined : currentUrl);
            }
        }
    }
    async onMTSScriptsLoaded(currentUrl, isLazy) {
        this.backgroundThread.markTiming('lepus_execute_start');
        const urlMap = _TemplateManager_js__rspack_import_11/* .templateManager */.Q.getBundle(currentUrl)
            ?.lepusCode;
        this.lepusCodeUrls.set(currentUrl, urlMap);
        // External bundles register their mts chunks here (so `lynx.loadScript` can
        // load them on demand) but have no `root` chunk to auto-execute, so the
        // `urlMap['root']` guard skips the page render for them.
        if (!isLazy && urlMap && urlMap['root']) {
            await this.mtsRealm.loadScript(urlMap['root']);
            this.onMTSScriptsExecuted();
        }
    }
    /**
     * Deliver an engine lifecycle event to the main-thread script with the
     * "listener wins, else direct call" fallback semantics. See
     * {@link dispatchEngineEventWithFallback}.
     */
    #dispatchEngineEvent(eventName, directCall, args) {
        (0,_LynxEngineContext_js__rspack_import_10/* .dispatchEngineEventWithFallback */.R)(this.engineContext, eventName, directCall, args);
    }
    onMTSScriptsExecuted() {
        this.backgroundThread.markTiming('lepus_execute_end');
        this.webElementsLoadingPromises.length = 0;
        this.backgroundThread.markTiming('data_processor_start');
        const processedData = this.#pageConfig?.['enableJSDataProcessor'] !== 'true'
            && this.mainThreadGlobalThis.processData
            ? this.mainThreadGlobalThis.processData?.(this.initData)
            : this.initData;
        this.backgroundThread.markTiming('data_processor_end');
        this.backgroundThread.startWebWorker(processedData, this.globalprops, _TemplateManager_js__rspack_import_11/* .templateManager.getBundle */.Q.getBundle(this.templateUrl).config.cardType, _TemplateManager_js__rspack_import_11/* .templateManager */.Q.getBundle(this.templateUrl)?.customSections, this.#nativeModulesMap, this.#napiModulesMap);
        if (this.isSSR) {
            this.rootDom.querySelector('[part="page"]')?.remove();
        }
        this.#dispatchEngineEvent(_constants_js__rspack_import_0/* .EngineMessageEventType.RenderPage */.Ye.RenderPage, () => this.mainThreadGlobalThis.renderPage?.(processedData), [processedData]);
        this.mainThreadGlobalThis.__FlushElementTree();
    }
    async onBTSScriptsLoaded(url) {
        const btsUrls = _TemplateManager_js__rspack_import_11/* .templateManager */.Q.getBundle(url)
            ?.backgroundCode;
        await this.backgroundThread.updateBTSChunk(url, btsUrls);
        this.backgroundThread.startBTS();
    }
    loadUnknownElement(tagName) {
        if (tagName.includes('-') && !customElements.get(tagName)) {
            this.rootDom.dispatchEvent(new CustomEvent(_constants_js__rspack_import_0/* .loadUnknownElementEventName */.u9, {
                detail: {
                    tagName,
                },
            }));
            this.webElementsLoadingPromises.push(customElements.whenDefined(tagName).then(() => { }));
        }
    }
    queryComponent(url) {
        if (this.#bundleLoadCache.has(url)) {
            return this.#bundleLoadCache.get(url);
        }
        const promise = _TemplateManager_js__rspack_import_11/* .templateManager.fetchBundle */.Q.fetchBundle(url, Promise.resolve(this), this.transformVW, this.transformVH, this.transformREM, {
            enableCSSSelector: this.#pageConfig['enableCSSSelector'],
        })
            .then(async () => {
            const urlMap = this.lepusCodeUrls.get(url);
            const rootUrl = urlMap?.['root'];
            if (!rootUrl) {
                throw new Error(`[lynx-web] Missing root URL for component: ${url}`);
            }
            let lepusRootChunkExport = await this.mtsRealm.loadScript(rootUrl);
            lepusRootChunkExport = this.mainThreadGlobalThis.processEvalResult?.(lepusRootChunkExport, url) ?? lepusRootChunkExport;
            return lepusRootChunkExport;
        });
        this.#bundleLoadCache.set(url, promise);
        return promise;
    }
    /**
     * Fetch + decode + cache an external `.lynx.bundle` for `lynx.fetchBundle`.
     * Reuses the same machinery as {@link queryComponent} — the shared decode
     * worker, the bundle cache, and `onStyleInfoReady`, which applies the bundle's
     * pre-processed style section via the wasm style engine — but does not load a
     * lepus root chunk. Resolves to a response object (never rejects) so the
     * externals plugin can branch on `code`.
     */
    loadExternalBundle(url) {
        if (this.#bundleLoadCache.has(url)) {
            return this.#bundleLoadCache.get(url);
        }
        const promise = _TemplateManager_js__rspack_import_11/* .templateManager.fetchBundle */.Q.fetchBundle(url, Promise.resolve(this), this.transformVW, this.transformVH, this.transformREM, {
            enableCSSSelector: this.#pageConfig['enableCSSSelector'],
            // An external bundle ships global styles (they apply to the consumer's
            // elements), so decode its StyleInfo unscoped rather than scoping it to
            // the bundle url the way a lazy component's styles are scoped.
            isLazy: 'false',
            // Mark the bundle external so the decode worker wraps its mts
            // (`lepusCode`) chunks with a CommonJS `module`/`exports` env.
            isExternalBundle: 'true',
        }).then(() => ({ url, code: 0, errorMsg: '' }), (error) => ({
            url,
            code: -1,
            errorMsg: error?.message ?? String(error),
        }));
        this.#bundleLoadCache.set(url, promise);
        return promise;
    }
    async updateData(data, processorName) {
        const processedData = this.#pageConfig['enableJSDataProcessor'] !== 'true'
            && this.mainThreadGlobalThis.processData
            ? this.mainThreadGlobalThis.processData(data, processorName)
            : data;
        this.#dispatchEngineEvent(_constants_js__rspack_import_0/* .EngineMessageEventType.UpdatePage */.Ye.UpdatePage, () => this.mainThreadGlobalThis.updatePage?.(processedData, {
            processorName,
        }), [processedData, { processorName }]);
        await this.backgroundThread.updateData(processedData, { processorName });
    }
    async updateGlobalProps(data) {
        // `__UpdateGlobalProps` has no legacy global-function counterpart on web
        // (the engine calls `kUpdateGlobalProps`, which web-platform never
        // exposed), so the fallback branch is a no-op: cards that subscribe get
        // the event, and everything else keeps relying solely on the
        // background-thread notification below.
        this.#dispatchEngineEvent(_constants_js__rspack_import_0/* .EngineMessageEventType.UpdateGlobalProps */.Ye.UpdateGlobalProps, () => { }, [data]);
        await this.backgroundThread.updateGlobalProps(data);
    }
    reportError(error, release, fileName) {
        this.rootDom.dispatchEvent(new CustomEvent('error', {
            detail: {
                sourceMap: {
                    offset: {
                        line: 2,
                        col: 0,
                    },
                },
                error,
                release,
                fileName,
            },
            bubbles: true,
            cancelable: true,
            composed: true,
        }));
    }
    async [Symbol.asyncDispose]() {
        // Give the card a chance to clean up (remove element listeners, notify the
        // background thread) while the element tree and wasmContext are still
        // alive. Mirrors the `__DestroyLifetime` dispatch in
        // `LynxShell::Destroy` / `BTSRuntime`, which likewise fires before the
        // engine is torn down. `dispatchEvent` runs listeners synchronously, so
        // the card's cleanup has completed by the time this returns.
        try {
            // `data` is `undefined` rather than an empty array on purpose: unlike
            // `__RenderPage` / `__UpdatePage`, this event does not travel through the
            // engine's argument-packing path, so it carries no positional arguments.
            // Cards subscribe to it purely as a teardown signal.
            this.engineContext.dispatchEvent({
                type: _constants_js__rspack_import_0/* .EngineMessageEventType.DestroyLifetime */.Ye.DestroyLifetime,
                data: undefined,
            });
        }
        catch (e) {
            // A throwing card cleanup must not abort teardown of the rest of the
            // instance, otherwise we leak workers and DOM listeners.
            console.error('[lynx-web] error while dispatching __DestroyLifetime', e);
        }
        this.engineContext.dispose();
        this.boundingClientRectService.dispose();
        this.intersectionObserverService.dispose();
        await this.backgroundThread[Symbol.asyncDispose]();
        this.exposureServices.dispose();
        // Detach DOM event listeners synchronously. Some (keydown/keyup) are
        // bound on `document`, so deferring removal to the idle callback below
        // would leave stale handlers firing against a torn-down wasmContext.
        this.mtsWasmBinding.disposeEventListeners();
        (0,_utils_requestIdleCallback_js__rspack_import_14/* .requestIdleCallbackImpl */.b)(() => {
            this.mtsWasmBinding.dispose();
        });
    }
}
//# sourceMappingURL=LynxViewInstance.js.map
__webpack_require__.d(__webpack_exports__, {
  LynxViewInstance: () => (LynxViewInstance),
  createSystemInfo: () => (createSystemInfo)
});

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
4039(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  O: () => (/* binding */ createMainThreadGlobalAPIs)
});

// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/TemplateManager.js
var TemplateManager = __webpack_require__(4231);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/createMainThreadLynxPerformance.js
// Copyright 2026 The Lynx Authors. All rights reserved.
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
function createMainThreadLynxPerformance(markTiming) {
    let pipelineIdInc = 0;
    let profileFlowIdInc = 0;
    let profileMarkInc = 0;
    const profileTimingStack = [];
    return {
        _generatePipelineOptions: () => {
            return {
                pipelineID: `_pipeline_mts_` + (pipelineIdInc++),
                needTimestamps: false,
            };
        },
        _onPipelineStart: () => {
            // Do nothing.
        },
        _bindPipelineIdWithTimingFlag: () => {
            // Timing flags are posted by the element flush path on the web main thread.
        },
        _markTiming: (pipelineId, timingKey) => {
            markTiming(timingKey, pipelineId);
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
}
//# sourceMappingURL=createMainThreadLynxPerformance.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/createMainThreadGlobalAPIs.js
/*
 * Copyright 2025 The Lynx Authors. All rights reserved.
 * Licensed under the Apache License Version 2.0 that can be found in the
 * LICENSE file in the root directory of this source tree.
 */


function createMainThreadLynx(lynxViewInstance) {
    const requestAnimationFrameBrowserImpl = requestAnimationFrame;
    const cancelAnimationFrameBrowserImpl = cancelAnimationFrame;
    const setTimeoutBrowserImpl = setTimeout;
    const clearTimeoutBrowserImpl = clearTimeout;
    const setIntervalBrowserImpl = setInterval;
    const clearIntervalBrowserImpl = clearInterval;
    return {
        performance: createMainThreadLynxPerformance(lynxViewInstance.backgroundThread.markTiming.bind(lynxViewInstance.backgroundThread)),
        getJSContext() {
            return lynxViewInstance.backgroundThread.jsContext;
        },
        getEngine() {
            return lynxViewInstance.engineContext;
        },
        requestAnimationFrame(cb) {
            return requestAnimationFrameBrowserImpl(cb);
        },
        cancelAnimationFrame(handler) {
            return cancelAnimationFrameBrowserImpl(handler);
        },
        __globalProps: lynxViewInstance.globalprops,
        getCustomSectionSync(key) {
            return TemplateManager/* .templateManager */.Q.getBundle(lynxViewInstance.templateUrl)?.customSections?.[key]
                ?.content;
        },
        markPipelineTiming: lynxViewInstance.backgroundThread.markTiming.bind(lynxViewInstance.backgroundThread),
        SystemInfo: lynxViewInstance.systemInfo,
        setTimeout: setTimeoutBrowserImpl,
        clearTimeout: clearTimeoutBrowserImpl,
        setInterval: setIntervalBrowserImpl,
        clearInterval: clearIntervalBrowserImpl,
        fetchBundle(url) {
            return lynxViewInstance.loadExternalBundle(url);
        },
        loadScript(sectionPath, options) {
            // An external bundle's mts chunk rides the `lepusCode` section: the decode
            // worker already wrapped it (with a `module`/`exports` env) into a blob
            // url registered under `lepusCodeUrls`. Evaluate it in the mts iframe
            // realm; `loadScriptSync` returns its `module.exports`.
            const blobUrl = lynxViewInstance.lepusCodeUrls.get(options.bundleName)?.[sectionPath];
            if (blobUrl === undefined) {
                throw new Error(`lynx.loadScript: section "${sectionPath}" not found in bundle ${options.bundleName}`);
            }
            return lynxViewInstance.mtsRealm.loadScriptSync(blobUrl);
        },
    };
}
function createMainThreadGlobalAPIs(lynxViewInstance) {
    let releaseSetting = '';
    return {
        __globalProps: lynxViewInstance.globalprops,
        SystemInfo: lynxViewInstance.systemInfo,
        lynx: createMainThreadLynx(lynxViewInstance),
        __OnLifecycleEvent: (data) => {
            lynxViewInstance.backgroundThread.jsContext.dispatchEvent({
                type: '__OnLifecycleEvent',
                data,
            });
        },
        __LoadLepusChunk: (path, config) => {
            try {
                let entryUrl = config?.dynamicComponentEntry;
                if (!entryUrl || entryUrl === '__Card__') {
                    entryUrl = lynxViewInstance.templateUrl;
                }
                path = lynxViewInstance.lepusCodeUrls.get(entryUrl)?.[path] ?? path;
                lynxViewInstance.mtsRealm.loadScriptSync(path);
                return true;
            }
            catch (e) {
                console.error(`failed to load lepus chunk ${path}`, e);
                return false;
            }
        },
        _AddEventListener: () => { }, // no-op for main thread
        _ReportError: (err, _) => {
            lynxViewInstance.reportError?.(err, releaseSetting, 'lepus.js');
        },
        _SetSourceMapRelease: (errInfo) => releaseSetting = errInfo?.release,
        _I18nResourceTranslation: lynxViewInstance.i18nManager
            ._I18nResourceTranslation.bind(lynxViewInstance.i18nManager),
        __QueryComponent: (url, callback) => {
            lynxViewInstance.queryComponent(url).then((lepusRootChunkExport) => {
                callback?.({
                    code: 0,
                    data: {
                        url,
                        evalResult: lepusRootChunkExport,
                    },
                });
            });
            return null;
        },
    };
}
//# sourceMappingURL=createMainThreadGlobalAPIs.js.map

},
7882(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  p: () => (/* binding */ WASMJSBinding)
});

// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/constants.js
var constants = __webpack_require__(3077);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/elementAPIs/createCrossThreadEvent.js

function toCloneableObject(obj) {
    const cloneableObj = {};
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'boolean' || typeof value === 'number'
            || typeof value === 'string' || value === null) {
            cloneableObj[key] = value;
        }
    }
    return cloneableObj;
}
function createCrossThreadEvent(domEvent, lynxViewClientLeft, lynxViewClientTop) {
    const type = domEvent.type;
    const params = {};
    const otherProperties = {};
    let detail = domEvent.detail ?? {};
    if (type.match(/^transition/)) {
        Object.assign(params, {
            'animation_type': 'keyframe-animation',
            'animation_name': domEvent.propertyName,
            new_animator: true, // we support the new_animator only
        });
    }
    else if (type.match(/animation/)) {
        Object.assign(params, {
            'animation_type': 'keyframe-animation',
            'animation_name': domEvent.animationName,
            new_animator: true, // we support the new_animator only
        });
    }
    else if (type.startsWith('touch')) {
        const touchEvent = domEvent;
        const touch = [...touchEvent.touches];
        const targetTouches = [...touchEvent.targetTouches];
        const changedTouches = [...touchEvent.changedTouches];
        // Each Touch keeps its original `clientX/clientY` (viewport) and
        // `pageX/pageY` (document) for Web interop; `x/y` is added in lynx-view
        // local space for native Lynx parity. The guard skips touches that do
        // not carry numeric client coords (e.g. synthetic test inputs).
        const addLynxViewLocalCoords = (t) => {
            const cx = t['clientX'];
            const cy = t['clientY'];
            if (typeof cx === 'number' && typeof cy === 'number') {
                return {
                    ...t,
                    x: cx - lynxViewClientLeft,
                    y: cy - lynxViewClientTop,
                };
            }
            return t;
        };
        Object.assign(otherProperties, {
            touches: touch.map(toCloneableObject).map(addLynxViewLocalCoords),
            targetTouches: targetTouches.map(toCloneableObject).map(addLynxViewLocalCoords),
            changedTouches: changedTouches.map(toCloneableObject).map(addLynxViewLocalCoords),
        });
        if (touch[0]) {
            detail = {
                x: touch[0].clientX - lynxViewClientLeft,
                y: touch[0].clientY - lynxViewClientTop,
            };
        }
    }
    else if (type.startsWith('mouse')) {
        const mouseEvent = domEvent;
        // `x/y` are lynx-view-relative (native Lynx parity); `clientX/clientY`
        // and `pageX/pageY` keep their Web-standard meaning so handlers can
        // still reach viewport/document coordinates.
        Object.assign(otherProperties, {
            button: mouseEvent.button,
            buttons: mouseEvent.buttons,
            x: mouseEvent.clientX - lynxViewClientLeft,
            y: mouseEvent.clientY - lynxViewClientTop,
            clientX: mouseEvent.clientX,
            clientY: mouseEvent.clientY,
            pageX: mouseEvent.pageX,
            pageY: mouseEvent.pageY,
        });
    }
    else if (type === 'click') {
        const mouseEvent = domEvent;
        detail = {
            x: mouseEvent.clientX - lynxViewClientLeft,
            y: mouseEvent.clientY - lynxViewClientTop,
        };
        // Web-standard viewport/document coords live alongside `detail`.
        Object.assign(otherProperties, {
            clientX: mouseEvent.clientX,
            clientY: mouseEvent.clientY,
            pageX: mouseEvent.pageX,
            pageY: mouseEvent.pageY,
        });
    }
    else if (type === 'layoutchange') {
        const d = detail;
        detail = {
            ...d,
            left: d.left - lynxViewClientLeft,
            right: d.right - lynxViewClientLeft,
            top: d.top - lynxViewClientTop,
            bottom: d.bottom - lynxViewClientTop,
        };
    }
    else if (type === 'keydown' || type === 'keyup') {
        // `keyCode` is deprecated by the DOM spec but forwarded here for parity
        // with iOS/Android, which surface a numeric `keyCode` to JS.
        Object.assign(otherProperties, {
            key: domEvent.key,
            code: domEvent.code,
            keyCode: domEvent.keyCode,
            shiftKey: domEvent.shiftKey,
            altKey: domEvent.altKey,
            ctrlKey: domEvent.ctrlKey,
            metaKey: domEvent.metaKey,
        });
    }
    const lynxEventName = constants/* .W3cEventNameToLynx */.$4[type] ?? type;
    return {
        type: lynxEventName,
        timestamp: domEvent.timeStamp,
        // @ts-expect-error
        detail,
        params,
        ...otherProperties,
    };
}
//# sourceMappingURL=createCrossThreadEvent.js.map
// EXTERNAL MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/elementAPIs/pureElementPAPIs.js
var pureElementPAPIs = __webpack_require__(4529);
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/web-core/dist/client/mainthread/elementAPIs/WASMJSBinding.js



const DOCUMENT_LEVEL_EVENTS = new Set(['keydown', 'keyup']);
class WASMJSBinding {
    lynxViewInstance;
    wasmContext;
    disposeWasmContext;
    #addedEventListeners = new Set();
    #documentEventListeners = new Set();
    toBeEnabledElement = new Set();
    toBeDisabledElement = new Set();
    constructor(lynxViewInstance) {
        this.lynxViewInstance = lynxViewInstance;
    }
    markExposureRelatedElementByUniqueId(element, toEnable) {
        if (element) {
            if (toEnable) {
                this.toBeDisabledElement.delete(element);
                this.toBeEnabledElement.add(element);
            }
            else {
                this.toBeEnabledElement.delete(element);
                this.toBeDisabledElement.add(element);
            }
        }
    }
    generateTargetObject(element, dataset) {
        const uniqueId = element[constants/* .uniqueIdSymbol */.Fd];
        return {
            dataset: Object.assign(Object.create(null), dataset),
            id: element.id || null,
            uid: uniqueId,
        };
    }
    getClassList(elementRef) {
        const element = elementRef.deref();
        if (element) {
            return [...element.classList];
        }
        return [];
    }
    getElementByUniqueId(uniqueId) {
        return this.wasmContext?.get_dom_by_unique_id(uniqueId)?.deref();
    }
    getElementByComponentId(componentId) {
        const uniqueId = this.wasmContext?.get_unique_id_by_component_id(componentId);
        if (uniqueId != undefined) {
            return this.getElementByUniqueId(uniqueId);
        }
        return undefined;
    }
    runWorklet(handler, eventObject, targetUniqueId, targetDataset, currentTargetUniqueId, currentTargetDataset) {
        const target = this.getElementByUniqueId(targetUniqueId);
        const currentTarget = this.getElementByUniqueId(currentTargetUniqueId);
        const resolvedTarget = (target ?? currentTarget);
        if (!resolvedTarget)
            return;
        const resolvedTargetDataset = target ? targetDataset : currentTargetDataset;
        eventObject.target = this.generateTargetObject(resolvedTarget, resolvedTargetDataset);
        eventObject.currentTarget = this.generateTargetObject(currentTarget, currentTargetDataset);
        // @ts-expect-error
        eventObject.target.elementRefptr = resolvedTarget;
        // @ts-expect-error
        eventObject.currentTarget.elementRefptr = currentTarget;
        this.lynxViewInstance.mainThreadGlobalThis.runWorklet?.(handler.value, [
            eventObject,
        ]);
    }
    /**
     * Invokes a callback registered through `__AddEventListener`.
     *
     * Called from the same per-element loop as `runWorklet` and `publishEvent`.
     * The callback is queued in that loop's capture, catch and bubble order, but
     * runs one microtask later.
     */
    runElementClosure(closure, eventObject, targetUniqueId, targetDataset, currentTargetUniqueId, currentTargetDataset) {
        if (typeof closure !== 'function')
            return;
        const target = this.getElementByUniqueId(targetUniqueId);
        const currentTarget = this.getElementByUniqueId(currentTargetUniqueId);
        const resolvedTarget = (target ?? currentTarget);
        if (!resolvedTarget)
            return;
        const resolvedTargetDataset = target ? targetDataset : currentTargetDataset;
        const eventTarget = this.generateTargetObject(resolvedTarget, resolvedTargetDataset);
        const eventCurrentTarget = this.generateTargetObject(currentTarget, currentTargetDataset);
        // @ts-expect-error
        eventTarget.elementRefptr = resolvedTarget;
        // @ts-expect-error
        eventCurrentTarget.elementRefptr = currentTarget;
        queueMicrotask(() => {
            eventObject.target = eventTarget;
            eventObject.currentTarget = eventCurrentTarget;
            closure(eventObject);
        });
    }
    publishEvent(handlerName, parentComponentId, eventObject, targetUniqueId, targetDataset, currentTargetUniqueId, currentTargetDataset) {
        const target = this.getElementByUniqueId(targetUniqueId);
        const currentTarget = this.getElementByUniqueId(currentTargetUniqueId);
        // The Rust dispatcher only reaches this code with target_unique_id == 0
        // on the global-bindevent path (regular bind/catch handlers early-return
        // when the bubble path has no element). For that case the DOM event
        // originated outside the Lynx element tree, so fall back to currentTarget
        // (the element that registered the global handler).
        const resolvedTarget = (target ?? currentTarget);
        if (!resolvedTarget)
            return;
        const resolvedTargetDataset = target ? targetDataset : currentTargetDataset;
        eventObject.target = this.generateTargetObject(resolvedTarget, resolvedTargetDataset);
        eventObject.currentTarget = this.generateTargetObject(currentTarget, currentTargetDataset);
        if (parentComponentId) {
            this.lynxViewInstance?.backgroundThread.publicComponentEvent(parentComponentId, handlerName, eventObject);
        }
        else {
            this.lynxViewInstance.backgroundThread.publishEvent(handlerName, eventObject);
        }
    }
    #commonEventHandler = (event) => {
        const target = event.target;
        let bubblePath = new Uint32Array(32);
        let bubblePathLength = 0;
        bubblePath;
        let currentTarget = target;
        while (currentTarget) {
            if (currentTarget === this.lynxViewInstance.rootDom) {
                break;
            }
            const uniqueId = (0,pureElementPAPIs/* .__GetElementUniqueID */.Tj)(currentTarget);
            if (uniqueId !== -1) {
                bubblePath[bubblePathLength++] = uniqueId;
                if (bubblePathLength >= bubblePath.length) {
                    const newBubblePath = new Uint32Array(bubblePath.length * 2);
                    newBubblePath.set(bubblePath);
                    bubblePath = newBubblePath;
                }
            }
            currentTarget = currentTarget.parentElement;
        }
        const eventObject = createCrossThreadEvent(event, this.lynxViewInstance.lynxViewClientLeft, this.lynxViewInstance.lynxViewClientTop);
        this.wasmContext?.common_event_handler(eventObject, bubblePath.slice(0, bubblePathLength), eventObject.type, event.bubbles);
    };
    addEventListener(eventName) {
        const w3cEventName = constants/* .LynxEventNameToW3cCommon */.im[eventName] ?? eventName;
        if (this.#addedEventListeners.has(w3cEventName))
            return;
        this.#addedEventListeners.add(w3cEventName);
        const isDocumentLevel = DOCUMENT_LEVEL_EVENTS.has(w3cEventName);
        if (isDocumentLevel) {
            this.#documentEventListeners.add(w3cEventName);
            document.addEventListener(w3cEventName, this.#commonEventHandler, {
                passive: true,
                capture: true,
            });
        }
        else {
            this.lynxViewInstance.rootDom.addEventListener(w3cEventName, this.#commonEventHandler, {
                passive: true,
                capture: true,
            });
        }
    }
    // Synchronously detach all DOM listeners. Safe to call multiple times.
    // Document-level listeners must be removed before this binding is GC'd or
    // before another LynxView instance mounts, otherwise stale handlers stay
    // attached to `document` and fire against a torn-down wasmContext.
    disposeEventListeners() {
        for (const eventName of this.#addedEventListeners) {
            if (this.#documentEventListeners.has(eventName)) {
                document.removeEventListener(eventName, this.#commonEventHandler, true);
            }
            else {
                this.lynxViewInstance.rootDom.removeEventListener(eventName, this.#commonEventHandler, true);
            }
        }
        this.#addedEventListeners.clear();
        this.#documentEventListeners.clear();
    }
    dispose() {
        this.disposeEventListeners();
        this.toBeEnabledElement.clear();
        this.toBeDisabledElement.clear();
        this.disposeWasmContext?.();
        this.wasmContext = undefined;
    }
    postTimingFlags(flags, pipelineId) {
        this.lynxViewInstance.backgroundThread.postTimingFlags(flags, pipelineId);
    }
    updateExposureStatus(enabledExposureElements, disabledExposureElements) {
        this.lynxViewInstance.exposureServices.updateExposureStatus(enabledExposureElements, disabledExposureElements);
    }
    enableElementEvent(elementRef, eventName) {
        this.#invokeElementEventMethod(elementRef, eventName, 'enableEvent');
    }
    disableElementEvent(elementRef, eventName) {
        this.#invokeElementEventMethod(elementRef, eventName, 'disableEvent');
    }
    #invokeElementEventMethod(elementRef, eventName, method) {
        const element = elementRef.deref();
        if (!element)
            return;
        const normalizedEventName = constants/* .LynxEventNameToW3cCommon */.im[eventName]
            ?? eventName;
        if (element[method]) {
            element[method](normalizedEventName);
            return;
        }
        const registry = element.ownerDocument.defaultView?.customElements;
        if (!registry || !element.localName.includes('-'))
            return;
        void registry.whenDefined(element.localName).then(() => {
            const upgradedElement = elementRef.deref();
            if (!upgradedElement)
                return;
            registry.upgrade(upgradedElement);
            upgradedElement[method]?.(normalizedEventName);
        });
    }
    setAttribute(elementRef, name, value) {
        const element = elementRef.deref();
        if (element) {
            element.setAttribute(name, value);
        }
    }
    removeAttribute(elementRef, name) {
        const element = elementRef.deref();
        if (element) {
            element.removeAttribute(name);
        }
    }
}
//# sourceMappingURL=WASMJSBinding.js.map

},
2962(__webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.a(__webpack_module__, async function (__rspack_load_async_deps, __rspack_async_done) { try {
/* import */ var _wasm_js__rspack_import_0 = __webpack_require__(3384);
/* import */ var _utils_setElementPropertyOrAttribute_js__rspack_import_1 = __webpack_require__(8584);
/* import */ var _constants_js__rspack_import_2 = __webpack_require__(3077);
/* import */ var _pureElementPAPIs_js__rspack_import_3 = __webpack_require__(4529);
/* import */ var _createElementEventListenerAPIs_js__rspack_import_4 = __webpack_require__(6123);
/* import */ var _utils_requestIdleCallback_js__rspack_import_5 = __webpack_require__(248);
var __rspack_async_deps = __rspack_load_async_deps([_wasm_js__rspack_import_0]);
_wasm_js__rspack_import_0 = (__rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps)[0];





const { MainThreadWasmContext, add_inline_style_raw_string_key, set_inline_styles_number_key, set_inline_styles_in_str, set_inline_styles_in_key_value_vec, } = _wasm_js__rspack_import_0.wasmInstance;
function dispatchLynxViewLoadEvent(host) {
    host.dispatchEvent(new CustomEvent('load', {
        detail: {
            statusCode: 0,
            statusMessage: 'success',
            url: host.url ?? '',
        },
        bubbles: true,
        cancelable: true,
        composed: true,
    }));
}
function createElementAPI(rootDom, mtsBinding, config_enable_css_selector, config_default_display_linear, config_default_overflow_visible, transform_vw, transform_vh, transform_rem, config_enable_css_inheritance = false) {
    let wasmContext = new MainThreadWasmContext(rootDom, mtsBinding, config_enable_css_selector);
    let page = undefined;
    const timingFlags = [];
    let disposed = false;
    mtsBinding.wasmContext = wasmContext;
    mtsBinding.disposeWasmContext = () => {
        if (disposed)
            return;
        disposed = true;
        if (wasmContext) {
            wasmContext.free();
            // @ts-expect-error It's better to throw an Error than triggering an use-after-free of rust struct
            wasmContext = null;
        }
        page = undefined;
        timingFlags.length = 0;
    };
    const __SetCSSId = (elements, cssId, entryName) => {
        const uniqueIds = elements.map((element) => {
            return element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
        });
        return wasmContext.set_css_id(new Uint32Array(uniqueIds), cssId ?? 0, entryName);
    };
    const __AddEvent = (element, eventType, eventName, frameworkCrossThreadIdentifier) => {
        const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
        if (typeof frameworkCrossThreadIdentifier === 'string') {
            wasmContext.add_cross_thread_event(uniqueId, eventType, eventName, frameworkCrossThreadIdentifier);
        }
        else if (frameworkCrossThreadIdentifier == null) {
            wasmContext.add_cross_thread_event(uniqueId, eventType, eventName, undefined);
            wasmContext.add_run_worklet_event(uniqueId, eventType, eventName, undefined);
        }
        else if (typeof frameworkCrossThreadIdentifier === 'object') {
            wasmContext.add_run_worklet_event(uniqueId, eventType, eventName, frameworkCrossThreadIdentifier);
        }
        if (eventName === 'uiappear' || eventName === 'uidisappear') {
            const element = wasmContext.get_dom_by_unique_id(uniqueId)?.deref();
            if (element) {
                mtsBinding.markExposureRelatedElementByUniqueId(element, frameworkCrossThreadIdentifier != null);
            }
        }
    };
    const { __AddEventListener, __RemoveEventListener } = (0,_createElementEventListenerAPIs_js__rspack_import_4/* .createElementEventListenerAPIs */.I)(mtsBinding);
    return {
        __AddEventListener,
        __RemoveEventListener,
        __CreateView(parentComponentUniqueId) {
            const dom = document.createElement('x-view');
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(parentComponentUniqueId, dom, new WeakRef(dom));
            return dom;
        },
        __CreateText(parentComponentUniqueId) {
            const dom = document.createElement('x-text');
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(parentComponentUniqueId, dom, new WeakRef(dom));
            return dom;
        },
        __CreateImage(parentComponentUniqueId) {
            const dom = document.createElement('x-image');
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(parentComponentUniqueId, dom, new WeakRef(dom));
            return dom;
        },
        __CreateFrame(parentComponentUniqueId) {
            const dom = document.createElement(_constants_js__rspack_import_2/* .LYNX_TAG_TO_HTML_TAG_MAP.frame */.H1.frame);
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(parentComponentUniqueId, dom, new WeakRef(dom));
            return dom;
        },
        __CreateRawText(text) {
            const dom = document.createElement('raw-text');
            dom.setAttribute('text', text);
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(-1, dom, new WeakRef(dom));
            return dom;
        },
        __CreateScrollView(parentComponentUniqueId) {
            const dom = document.createElement('scroll-view');
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(parentComponentUniqueId, dom, new WeakRef(dom));
            return dom;
        },
        __CreateElement(tagName, parentComponentUniqueId) {
            const dom = document.createElement(_constants_js__rspack_import_2/* .LYNX_TAG_TO_HTML_TAG_MAP */.H1[tagName] ?? tagName);
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(parentComponentUniqueId, dom, new WeakRef(dom));
            return dom;
        },
        __CreateComponent(parentComponentUniqueId, componentID, componentCSSID, entryName, name) {
            const dom = document.createElement('x-view');
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(parentComponentUniqueId, dom, new WeakRef(dom), componentCSSID, componentID);
            if (entryName && entryName !== '__Card__') {
                dom.setAttribute(_constants_js__rspack_import_2/* .lynxEntryNameAttribute */.Pb, entryName);
            }
            if (name) {
                dom.setAttribute('name', name);
            }
            return dom;
        },
        __CreateWrapperElement(parentComponentUniqueId) {
            const dom = document.createElement('lynx-wrapper');
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(parentComponentUniqueId, dom, new WeakRef(dom));
            return dom;
        },
        __CreateList(parentComponentUniqueId, componentAtIndex, enqueueComponent) {
            const dom = document.createElement('x-list');
            dom.componentAtIndex = componentAtIndex;
            dom.enqueueComponent = enqueueComponent;
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(parentComponentUniqueId, dom, new WeakRef(dom));
            return dom;
        },
        __CreatePage(componentID, componentCSSID) {
            if (page)
                return page;
            const dom = document.createElement('div');
            dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd] = wasmContext.create_element_common(0, dom, new WeakRef(dom), componentCSSID, componentID);
            wasmContext.set_page_element_unique_id(dom[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd]);
            if (config_default_overflow_visible) {
                dom.setAttribute(_constants_js__rspack_import_2/* .lynxDefaultOverflowVisibleAttribute */.f7, 'true');
            }
            if (!config_default_display_linear) {
                dom.setAttribute(_constants_js__rspack_import_2/* .lynxDefaultDisplayLinearAttribute */.Gm, 'false');
            }
            dom.setAttribute('part', 'page');
            if (config_enable_css_inheritance) {
                dom.setAttribute(_constants_js__rspack_import_2/* .lynxEnableCSSInheritanceAttribute */.qh, 'true');
            }
            page = dom;
            return dom;
        },
        __SetClasses: config_enable_css_selector
            ? _pureElementPAPIs_js__rspack_import_3/* .__SetClasses */.R5
            : ((element, classname) => {
                (0,_pureElementPAPIs_js__rspack_import_3/* .__SetClasses */.R5)(element, classname);
                const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
                wasmContext.update_css_og_style(uniqueId, element.getAttribute(_constants_js__rspack_import_2/* .lynxEntryNameAttribute */.Pb));
            }),
        __SetCSSId,
        __AddInlineStyle: (element, key, value) => {
            let valStr = null;
            if (value != null) {
                valStr = value.toString();
            }
            if (typeof key === 'number') {
                return set_inline_styles_number_key(element, key, valStr);
            }
            else {
                return add_inline_style_raw_string_key(element, key.toString(), valStr);
            }
        },
        __SetInlineStyles: (element, value) => {
            if (!value) {
                element.removeAttribute('style');
            }
            else {
                if (typeof value === 'string') {
                    if (!set_inline_styles_in_str(element, value, transform_vw, transform_vh, transform_rem)) {
                        element.setAttribute('style', value);
                    }
                }
                else if (!value) {
                    element.removeAttribute('style');
                }
                else {
                    const vec = [];
                    for (const [k, v] of Object.entries(value)) {
                        if (v != null) {
                            vec.push(k, v.toString());
                        }
                    }
                    set_inline_styles_in_key_value_vec(element, vec, transform_vw, transform_vh, transform_rem);
                }
            }
        },
        __AddConfig: (element, type, value) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            const config = wasmContext.get_config(uniqueId);
            // @ts-ignore
            config[type] = value;
        },
        __UpdateComponentInfo: (element, componentInfo) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            const { componentID, cssID, entry, name } = componentInfo;
            if (name) {
                element.setAttribute('name', name);
            }
            else {
                element.removeAttribute('name');
            }
            wasmContext.update_component_id(uniqueId, componentID);
            if (cssID !== undefined) {
                wasmContext.update_component_css_id(uniqueId, cssID);
                if (entry) {
                    element.setAttribute(_constants_js__rspack_import_2/* .lynxEntryNameAttribute */.Pb, entry);
                }
            }
        },
        __UpdateComponentID: (element, componentID) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            wasmContext.update_component_id(uniqueId, componentID);
        },
        __GetConfig: (element) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            return wasmContext.get_config(uniqueId);
        },
        __SetConfig: (element, config) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            wasmContext.set_config(uniqueId, config);
        },
        __GetElementConfig: (element) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            return wasmContext.get_element_config(uniqueId);
        },
        __GetComponentID: (element) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            return wasmContext.get_component_id(uniqueId);
        },
        __SetDataset: (element, dataset) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            wasmContext.set_dataset(uniqueId, element, dataset);
        },
        __AddDataset: (element, key, value) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            if (value) {
                element.setAttribute(`data-${key}`, typeof value === 'object' ? JSON.stringify(value) : value.toString());
            }
            else {
                element.removeAttribute(`data-${key}`);
            }
            wasmContext.add_dataset(uniqueId, key, value);
        },
        __GetDataset: (element) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            return Object.assign(Object.create(null), wasmContext.get_dataset(uniqueId));
        },
        __GetDataByKey: (element, key) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            return wasmContext.get_data_by_key(uniqueId, key);
        },
        __SetAttribute(element, name, value) {
            if (name === 'update-list-info') {
                const { insertAction, removeAction } = value;
                queueMicrotask(() => {
                    const componentAtIndex = element.componentAtIndex;
                    const enqueueComponent = element.enqueueComponent;
                    const uniqueId = (0,_pureElementPAPIs_js__rspack_import_3/* .__GetElementUniqueID */.Tj)(element);
                    removeAction.forEach((position, i) => {
                        const removedEle = element.children[position - i];
                        if (removedEle) {
                            const sign = (0,_pureElementPAPIs_js__rspack_import_3/* .__GetElementUniqueID */.Tj)(removedEle);
                            enqueueComponent?.(element, uniqueId, sign);
                            element.removeChild(removedEle);
                        }
                    });
                    for (const action of insertAction) {
                        const childSign = componentAtIndex?.(element, uniqueId, action.position, 0, false);
                        if (typeof childSign === 'number') {
                            const childElement = wasmContext.get_dom_by_unique_id(childSign)
                                ?.deref();
                            if (childElement) {
                                const referenceNode = element.children[action.position];
                                if (referenceNode !== childElement) {
                                    element.insertBefore(childElement, referenceNode || null);
                                }
                            }
                        }
                    }
                });
            }
            else {
                (0,_utils_setElementPropertyOrAttribute_js__rspack_import_1/* .setElementPropertyOrAttribute */.J)(element, name, value);
                if (name === 'exposure-id') {
                    if (value != null) {
                        mtsBinding.markExposureRelatedElementByUniqueId(element, true);
                    }
                    else {
                        mtsBinding.markExposureRelatedElementByUniqueId(element, false);
                    }
                }
                else if (name === _constants_js__rspack_import_2/* .LYNX_TIMING_FLAG_ATTRIBUTE */.xW) {
                    timingFlags.push(String(value));
                }
            }
        },
        __AddEvent,
        __GetEvent: (element, eventType, eventName) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            return wasmContext.get_event(uniqueId, eventType, eventName);
        },
        __GetEvents: (element) => {
            const uniqueId = element[_constants_js__rspack_import_2/* .uniqueIdSymbol */.Fd];
            return wasmContext.get_events(uniqueId);
        },
        __SetEvents: (element, events) => {
            for (const event of events) {
                __AddEvent(element, event.type, event.name, event.function);
            }
        },
        __GetPageElement: () => page,
        __AppendElement: _pureElementPAPIs_js__rspack_import_3/* .__AppendElement */.vh,
        __ElementIsEqual: _pureElementPAPIs_js__rspack_import_3/* .__ElementIsEqual */.pn,
        __FirstElement: _pureElementPAPIs_js__rspack_import_3/* .__FirstElement */.vH,
        __GetChildren: _pureElementPAPIs_js__rspack_import_3/* .__GetChildren */.yj,
        __GetParent: _pureElementPAPIs_js__rspack_import_3/* .__GetParent */.d6,
        __InsertElementBefore: _pureElementPAPIs_js__rspack_import_3/* .__InsertElementBefore */.pi,
        __LastElement: _pureElementPAPIs_js__rspack_import_3/* .__LastElement */.Nu,
        __NextElement: _pureElementPAPIs_js__rspack_import_3/* .__NextElement */.cw,
        __RemoveElement: _pureElementPAPIs_js__rspack_import_3/* .__RemoveElement */.z3,
        __ReplaceElement: _pureElementPAPIs_js__rspack_import_3/* .__ReplaceElement */.Xk,
        __GetAttributes: _pureElementPAPIs_js__rspack_import_3/* .__GetAttributes */.GE,
        __GetAttributeNames: _pureElementPAPIs_js__rspack_import_3/* .__GetAttributeNames */.Td,
        __GetAttributeByName: _pureElementPAPIs_js__rspack_import_3/* .__GetAttributeByName */.li,
        __GetComputedStyleByKey: _pureElementPAPIs_js__rspack_import_3/* .__GetComputedStyleByKey */.pQ,
        __ReplaceElements: _pureElementPAPIs_js__rspack_import_3/* .__ReplaceElements */.yE,
        __GetID: _pureElementPAPIs_js__rspack_import_3/* .__GetID */.cb,
        __SetID: _pureElementPAPIs_js__rspack_import_3/* .__SetID */.wr,
        __GetTag: _pureElementPAPIs_js__rspack_import_3/* .__GetTag */.zm,
        __AddClass: config_enable_css_selector
            ? _pureElementPAPIs_js__rspack_import_3/* .__AddClass */.gA
            : ((element, className) => {
                (0,_pureElementPAPIs_js__rspack_import_3/* .__AddClass */.gA)(element, className);
                const uniqueId = (0,_pureElementPAPIs_js__rspack_import_3/* .__GetElementUniqueID */.Tj)(element);
                const entryName = element.getAttribute(_constants_js__rspack_import_2/* .lynxEntryNameAttribute */.Pb);
                wasmContext.update_css_og_style(uniqueId, entryName);
            }),
        __GetClasses: _pureElementPAPIs_js__rspack_import_3/* .__GetClasses */.Tq,
        __MarkTemplateElement: _pureElementPAPIs_js__rspack_import_3/* .__MarkTemplateElement */.uY,
        __MarkPartElement: _pureElementPAPIs_js__rspack_import_3/* .__MarkPartElement */.ZW,
        __GetTemplateParts: _pureElementPAPIs_js__rspack_import_3/* .__GetTemplateParts */.$G,
        __GetElementUniqueID: _pureElementPAPIs_js__rspack_import_3/* .__GetElementUniqueID */.Tj,
        __UpdateListCallbacks: _pureElementPAPIs_js__rspack_import_3/* .__UpdateListCallbacks */.YW,
        __SwapElement: _pureElementPAPIs_js__rspack_import_3/* .__SwapElement */.cJ,
        __ElementAnimate: (() => {
            const animationMap = new Map();
            const mapTimingOptions = (options) => {
                if (!options)
                    return undefined;
                const result = {};
                if ('duration' in options) {
                    result.duration = Number(options['duration']);
                }
                if ('delay' in options)
                    result.delay = Number(options['delay']);
                if ('direction' in options) {
                    result.direction = options['direction'];
                }
                if ('iterationCount' in options) {
                    result.iterations = options['iterationCount'] === 'infinite'
                        ? Infinity
                        : Number(options['iterationCount']);
                }
                if ('fillMode' in options) {
                    result.fill = options['fillMode'];
                }
                if ('timingFunction' in options) {
                    result.easing = options['timingFunction'];
                }
                return result;
            };
            return (element, args) => {
                const [operation, name] = args;
                switch (operation) {
                    case _constants_js__rspack_import_2/* .AnimationOperation.START */.Uc.START: {
                        const keyframes = args[2];
                        const options = args[3];
                        animationMap.get(name)?.cancel();
                        const animation = element.animate(keyframes, mapTimingOptions(options));
                        animation.oncancel = animation.onfinish = () => {
                            if (animationMap.get(name) === animation) {
                                animationMap.delete(name);
                            }
                        };
                        animationMap.set(name, animation);
                        break;
                    }
                    case _constants_js__rspack_import_2/* .AnimationOperation.PLAY */.Uc.PLAY:
                        animationMap.get(name)?.play();
                        break;
                    case _constants_js__rspack_import_2/* .AnimationOperation.PAUSE */.Uc.PAUSE:
                        animationMap.get(name)?.pause();
                        break;
                    case _constants_js__rspack_import_2/* .AnimationOperation.CANCEL */.Uc.CANCEL:
                        animationMap.get(name)?.cancel();
                        animationMap.delete(name);
                        break;
                    case _constants_js__rspack_import_2/* .AnimationOperation.FINISH */.Uc.FINISH:
                        animationMap.get(name)?.finish();
                        break;
                }
            };
        })(),
        __InvokeUIMethod: mtsBinding.lynxViewInstance.invokeUIMethod,
        __QuerySelector: _pureElementPAPIs_js__rspack_import_3/* .__QuerySelector */.Gi,
        __QuerySelectorAll: _pureElementPAPIs_js__rspack_import_3/* .__QuerySelectorAll */.H0,
        // Gesture recognition is not implemented on web yet. Keep these PAPIs as
        // no-ops so ReactLynx bundles using `main-thread:gesture` can still render.
        __SetGestureDetector: () => undefined,
        __RemoveGestureDetector: () => undefined,
        __FlushElementTree: (_, options) => {
            const pipelineId = options?.pipelineOptions?.pipelineID;
            const backgroundThread = mtsBinding.lynxViewInstance.backgroundThread;
            if (page && !page.parentNode
                && page.getAttribute(_constants_js__rspack_import_2/* .lynxDisposedAttribute */.JA) !== '') {
                backgroundThread.markTiming('dispatch_start', pipelineId);
                backgroundThread.jsContext.dispatchEvent({
                    type: '__OnNativeAppReady',
                    data: undefined,
                });
                backgroundThread.markTiming('layout_start', pipelineId);
                backgroundThread.markTiming('ui_operation_flush_start', pipelineId);
                rootDom.appendChild(page);
                rootDom.host.style.display = 'flex';
                dispatchLynxViewLoadEvent(rootDom.host);
                backgroundThread.markTiming('ui_operation_flush_end', pipelineId);
                backgroundThread.markTiming('layout_end', pipelineId);
                backgroundThread.markTiming('dispatch_end', pipelineId);
                backgroundThread.flushTimingInfo();
            }
            let timingFlagsAll = timingFlags.concat(wasmContext.take_timing_flags());
            (0,_utils_requestIdleCallback_js__rspack_import_5/* .requestIdleCallbackImpl */.b)(() => {
                if (disposed)
                    return;
                mtsBinding.postTimingFlags(timingFlagsAll, pipelineId);
                wasmContext.gc();
            });
            timingFlags.length = 0;
            const enabledExposureElements = [
                ...mtsBinding.toBeEnabledElement,
            ];
            mtsBinding.toBeEnabledElement.clear();
            const disabledExposureElements = [
                ...mtsBinding.toBeDisabledElement,
            ];
            mtsBinding.toBeDisabledElement.clear();
            mtsBinding?.updateExposureStatus(enabledExposureElements, disabledExposureElements);
        },
    };
}
//# sourceMappingURL=createElementAPI.js.map
__webpack_require__.d(__webpack_exports__, {
  b: () => (createElementAPI)
});

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
6123(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/* import */ var _pureElementPAPIs_js__rspack_import_0 = __webpack_require__(4529);

/**
 * `ClosureEventListener::ClosureType` from
 * `core/renderer/events/closure_event_listener.h`.
 */
const ClosureType = {
    kNone: 0,
    kJS: 1,
    kCore: 2,
    kClient: 3,
};
/**
 * `Event::BindType` from `core/event/event.h`.
 */
const BindType = {
    kNone: 0,
    kBubble: 1,
    kCapture: 2,
    kCaptureCatch: 3,
    kBubbleCatch: 4,
    kGlobalBind: 5,
};
/**
 * The event *type* a handler is filed under, which is what the dispatcher reads
 * to decide whether a handler runs during the capture or the bubble pass and
 * whether it stops propagation.
 *
 * These four names are the ones `dispatch_event_by_path` looks up, plus
 * `global-bindevent` for the separate global pass.
 */
function eventTypeOf(options) {
    const closureType = typeof options?.closure_type === 'number'
        ? options.closure_type
        : ClosureType.kNone;
    const bindType = typeof options?.bind_type === 'number'
        ? options.bind_type
        : BindType.kBubble;
    if (bindType === BindType.kGlobalBind) {
        return 'global-bindevent';
    }
    // For a plain callback the web platform's own `capture` flag selects the
    // pass, because such a listener has no `bind_type` to derive it from. The
    // bind forms follow `bind_type`, exactly as `FiberAddEventListener` does.
    const capture = closureType === ClosureType.kNone
        ? options?.capture === true
        : bindType === BindType.kCapture || bindType === BindType.kCaptureCatch;
    const isCatch = bindType === BindType.kCaptureCatch
        || bindType === BindType.kBubbleCatch;
    if (capture) {
        return isCatch ? 'capture-catch' : 'capture-bind';
    }
    return isCatch ? 'catchevent' : 'bindevent';
}
/**
 * Element-level event listener PAPIs (`__AddEventListener` /
 * `__RemoveEventListener`).
 *
 * These are the *function callback* form of element event binding used by
 * buildless (vanilla) Lynx cards, as opposed to `__AddEvent`, which binds a
 * handler *name* dispatched across threads or a worklet object.
 *
 * Both forms are filed in the element's own handler table on the Rust side, so
 * a callback participates in the same dispatch as every other handler: one
 * delegated DOM listener per event name feeds `common_event_handler`, which
 * walks the ancestor path and runs the capture pass, the catch short-circuit,
 * the bubble pass and the global-bind pass. Binding directly with
 * `element.addEventListener` would instead create a second, parallel dispatch
 * that could neither stop nor be stopped by those handlers.
 *
 * `once` is handled here rather than in Rust: the slot is cleared before the
 * callback runs, so a re-entrant dispatch cannot see it twice. `passive` is
 * accepted and ignored, because the delegated listener - not the per-element
 * registration - is what decides passiveness, and it is already passive.
 */
function createElementEventListenerAPIs(mtsBinding) {
    /**
     * The wrapper filed for a `once` registration, so that
     * `__RemoveEventListener` - which is called with the *original* callback - can
     * find what was actually registered.
     *
     * Keyed by element (weakly, so a collected element takes its entries with it)
     * and then by the full registration identity, `(eventName, eventType,
     * callback)`. Keying by callback alone would conflate registrations for
     * different events or passes on the same element.
     */
    const onceWrappers = new WeakMap();
    const wrappersOf = (element, slot) => {
        let bySlot = onceWrappers.get(element);
        if (!bySlot) {
            bySlot = new Map();
            onceWrappers.set(element, bySlot);
        }
        let wrappers = bySlot.get(slot);
        if (!wrappers) {
            wrappers = new Map();
            bySlot.set(slot, wrappers);
        }
        return wrappers;
    };
    /** Identifies a registration slot within one element. */
    const slotKey = (eventName, eventType) => `${eventName}\u0000${eventType}`;
    const __AddEventListener = (element, name, callback, options) => {
        // `__GetElementUniqueID` yields -1 for anything not built through the
        // Element PAPIs, which therefore has no handler table to file into.
        const uniqueId = (0,_pureElementPAPIs_js__rspack_import_0/* .__GetElementUniqueID */.Tj)(element);
        if (uniqueId === -1) {
            return;
        }
        const eventName = name.toLowerCase();
        const eventType = eventTypeOf(options);
        if (typeof callback === 'string') {
            // `native:bind`: the callback is a handler *name*, which is dispatched to
            // the host rather than invoked here.
            mtsBinding.wasmContext?.add_cross_thread_event(uniqueId, eventType, eventName, callback);
            return;
        }
        if (typeof callback !== 'function') {
            return;
        }
        const slot = slotKey(eventName, eventType);
        const wrappers = wrappersOf(element, slot);
        const existingWrapper = wrappers.get(callback);
        if (options?.once !== true) {
            // Re-registering the same callback without `once` has to drop the wrapper
            // a previous `once` registration filed, otherwise both would run.
            if (existingWrapper) {
                mtsBinding.wasmContext?.add_closure_event(uniqueId, eventType, eventName, undefined, existingWrapper);
                wrappers.delete(callback);
            }
            mtsBinding.wasmContext?.add_closure_event(uniqueId, eventType, eventName, callback, undefined);
            return;
        }
        // Already registered for this exact identity, so this is a no-op, as with
        // `EventTarget`. Filing a second wrapper would make the callback run twice
        // and orphan the first wrapper, which nothing could then remove.
        if (existingWrapper) {
            return;
        }
        // The same callback may already be filed *unwrapped* by an earlier
        // registration without `once`. `EventTarget` treats that as the same
        // listener and ignores the second add, so drop the bare one rather than
        // letting both run.
        mtsBinding.wasmContext?.add_closure_event(uniqueId, eventType, eventName, undefined, callback);
        // `once` lives here rather than in the handler table. The wrapper guards
        // with a flag so a re-entrant dispatch cannot deliver twice, then drops the
        // registration in a microtask: the dispatcher owns the element data for the
        // duration of the walk, so mutating the handler table from inside a callback
        // would abort with "recursive use of an object".
        let fired = false;
        const wrapper = (...args) => {
            if (fired) {
                return;
            }
            fired = true;
            queueMicrotask(() => {
                mtsBinding.wasmContext?.add_closure_event(uniqueId, eventType, eventName, undefined, wrapper);
            });
            wrappers.delete(callback);
            callback(...args);
        };
        wrappers.set(callback, wrapper);
        mtsBinding.wasmContext?.add_closure_event(uniqueId, eventType, eventName, wrapper, undefined);
    };
    const __RemoveEventListener = (element, name, callback, options) => {
        const uniqueId = (0,_pureElementPAPIs_js__rspack_import_0/* .__GetElementUniqueID */.Tj)(element);
        if (uniqueId === -1) {
            return;
        }
        const eventName = name.toLowerCase();
        const eventType = eventTypeOf(options);
        if (typeof callback === 'string') {
            // Clear only the cross-thread slot, so removing a `native:bind` handler
            // cannot disturb a callback or a worklet bound to the same triple.
            mtsBinding.wasmContext?.add_cross_thread_event(uniqueId, eventType, eventName, undefined);
            return;
        }
        // A `once` registration was filed as a wrapper, so removal has to target
        // that wrapper rather than the callback the caller hands back.
        const slot = slotKey(eventName, eventType);
        const wrappers = onceWrappers.get(element)?.get(slot);
        const registered = wrappers?.get(callback) ?? callback;
        wrappers?.delete(callback);
        mtsBinding.wasmContext?.add_closure_event(uniqueId, eventType, eventName, undefined, registered);
    };
    return { __AddEventListener, __RemoveEventListener };
}
//# sourceMappingURL=createElementEventListenerAPIs.js.map
__webpack_require__.d(__webpack_exports__, {
  I: () => (createElementEventListenerAPIs)
});


},
265(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/* import */ var _constants_js__rspack_import_0 = __webpack_require__(3077);
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

function createInvokeUIMethod(boundingClientRectService) {
    return (element, method, params, callback) => {
        let code = _constants_js__rspack_import_0/* .ErrorCode.UNKNOWN */.O4.UNKNOWN;
        let data = undefined;
        try {
            if (method === 'boundingClientRect') {
                const rect = element.getBoundingClientRect();
                const lynxViewRect = boundingClientRectService.getLynxViewRect();
                data = {
                    id: element.id,
                    left: rect.left - lynxViewRect.left,
                    right: rect.right - lynxViewRect.left,
                    top: rect.top - lynxViewRect.top,
                    bottom: rect.bottom - lynxViewRect.top,
                    width: rect.width,
                    height: rect.height,
                };
                code = _constants_js__rspack_import_0/* .ErrorCode.SUCCESS */.O4.SUCCESS;
            }
            else if (typeof element[method] === 'function') {
                data = element[method](params);
                code = _constants_js__rspack_import_0/* .ErrorCode.SUCCESS */.O4.SUCCESS;
            }
            else {
                code = _constants_js__rspack_import_0/* .ErrorCode.METHOD_NOT_FOUND */.O4.METHOD_NOT_FOUND;
            }
        }
        catch (e) {
            console.error(`[lynx-web] invokeUIMethod: apply method failed with`, e, element);
            code = _constants_js__rspack_import_0/* .ErrorCode.PARAM_INVALID */.O4.PARAM_INVALID;
        }
        callback({ code, data });
    };
}
//# sourceMappingURL=createInvokeUIMethod.js.map
__webpack_require__.d(__webpack_exports__, {
  C: () => (createInvokeUIMethod)
});


},
4529(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/* import */ var _constants_js__rspack_import_0 = __webpack_require__(3077);
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

const __AppendElement = /*#__PURE__*/ (parent, child) => parent.appendChild(child);
const __ElementIsEqual = /*#__PURE__*/ (left, right) => left === right;
const __FirstElement = /*#__PURE__*/ (element) => element.firstElementChild;
const __GetChildren = /*#__PURE__*/ (element) => element.children ? [...element.children] : null;
const __GetParent = /*#__PURE__*/ (element) => element.parentElement;
const __InsertElementBefore = /*#__PURE__*/ (parent, child, ref) => parent.insertBefore(child, ref);
const __LastElement = /*#__PURE__*/ (element) => element.lastElementChild;
const __NextElement = /*#__PURE__*/ (element) => element.nextElementSibling;
const __RemoveElement = /*#__PURE__*/ (parent, child) => parent.removeChild(child);
const __ReplaceElement = /*#__PURE__*/ (newElement, oldElement) => oldElement.replaceWith(newElement);
const __ReplaceElements = /*#__PURE__*/ (parent, newChildren, oldChildren) => {
    newChildren = Array.isArray(newChildren) ? newChildren : [newChildren];
    if (!oldChildren || (Array.isArray(oldChildren) && oldChildren?.length === 0)) {
        parent.append(...newChildren);
    }
    else {
        oldChildren = Array.isArray(oldChildren) ? oldChildren : [oldChildren];
        for (let ii = 1; ii < oldChildren.length; ii++) {
            __RemoveElement(parent, oldChildren[ii]);
        }
        const firstOldChildren = oldChildren[0];
        firstOldChildren.replaceWith(...newChildren);
    }
};
const __GetAttributes = /*#__PURE__*/ (element) => {
    return Object.fromEntries(element.getAttributeNames().map((attributeName) => [attributeName, element.getAttribute(attributeName)])
        .filter(([, value]) => value));
};
const __GetAttributeNames = /*#__PURE__*/ (element) => element.getAttributeNames();
const __GetAttributeByName = /*#__PURE__*/ (element, name) => element.getAttribute(name);
const __GetComputedStyleByKey = 
/*#__PURE__*/ (element, key) => element.ownerDocument.defaultView?.getComputedStyle(element)
    .getPropertyValue(key) ?? '';
const __GetID = /*#__PURE__*/ (element) => element.getAttribute('id');
const __SetID = /*#__PURE__*/ (element, id) => id ? element.setAttribute('id', id) : element.removeAttribute('id');
const __GetTag = /*#__PURE__*/ (element) => {
    const tagName = element.tagName.toLowerCase();
    return _constants_js__rspack_import_0/* .HTML_TAG_TO_LYNX_TAG_MAP */.vh[tagName] ?? tagName;
};
const __GetClasses = /*#__PURE__*/ (element) => [...element.classList];
const __SwapElement = /*#__PURE__*/ (childA, childB) => {
    const temp = document.createElement('div');
    childA.replaceWith(temp);
    childB.replaceWith(childA);
    temp.replaceWith(childB);
};
const __SetClasses = /*#__PURE__*/ (element, classname) => {
    classname
        ? element.setAttribute('class', classname)
        : element.removeAttribute('class');
};
const __AddClass = /*#__PURE__*/ (element, className) => {
    element.classList.add(className);
};
const __GetTemplateParts = (templateElement) => {
    const isTemplate = templateElement.getAttribute(_constants_js__rspack_import_0/* .lynxElementTemplateMarkerAttribute */.y)
        !== null;
    if (!isTemplate) {
        return {};
    }
    const templateUniqueId = __GetElementUniqueID(templateElement);
    const parts = {};
    const partElements = templateElement.querySelectorAll(`[${_constants_js__rspack_import_0/* .lynxPartIdAttribute */.oZ}]:not([${_constants_js__rspack_import_0/* .lynxElementTemplateMarkerAttribute */.y}="${templateUniqueId}"] [${_constants_js__rspack_import_0/* .lynxElementTemplateMarkerAttribute */.y}] [${_constants_js__rspack_import_0/* .lynxPartIdAttribute */.oZ}])`);
    for (const partElement of partElements) {
        const partId = partElement.getAttribute(_constants_js__rspack_import_0/* .lynxPartIdAttribute */.oZ);
        if (partId) {
            parts[partId] = partElement;
        }
    }
    return parts;
};
const __MarkTemplateElement = (element) => {
    const templateUniqueId = __GetElementUniqueID(element);
    element.setAttribute(_constants_js__rspack_import_0/* .lynxElementTemplateMarkerAttribute */.y, templateUniqueId.toString());
};
const __MarkPartElement = (element, partId) => {
    element.setAttribute(_constants_js__rspack_import_0/* .lynxPartIdAttribute */.oZ, partId);
};
const __GetElementUniqueID = /*#__PURE__*/ (element) => (element && element[_constants_js__rspack_import_0/* .uniqueIdSymbol */.Fd]) ?? -1;
const __UpdateListCallbacks = /*#__PURE__*/ (element, componentAtIndex, enqueueComponent) => {
    const decoratedElement = element;
    decoratedElement.componentAtIndex = componentAtIndex;
    decoratedElement.enqueueComponent = enqueueComponent;
};
const __QuerySelector = /*#__PURE__*/ (element, selector, _options) => {
    return element.querySelector(selector);
};
const __QuerySelectorAll = /*#__PURE__*/ (element, selector, _options) => {
    return Array.from(element.querySelectorAll(selector));
};
//# sourceMappingURL=pureElementPAPIs.js.map
__webpack_require__.d(__webpack_exports__, {
}, {
  $G: __GetTemplateParts,
  GE: __GetAttributes,
  Gi: __QuerySelector,
  H0: __QuerySelectorAll,
  Nu: __LastElement,
  R5: __SetClasses,
  Td: __GetAttributeNames,
  Tj: __GetElementUniqueID,
  Tq: __GetClasses,
  Xk: __ReplaceElement,
  YW: __UpdateListCallbacks,
  ZW: __MarkPartElement,
  cJ: __SwapElement,
  cb: __GetID,
  cw: __NextElement,
  d6: __GetParent,
  gA: __AddClass,
  li: __GetAttributeByName,
  pQ: __GetComputedStyleByKey,
  pi: __InsertElementBefore,
  pn: __ElementIsEqual,
  uY: __MarkTemplateElement,
  vH: __FirstElement,
  vh: __AppendElement,
  wr: __SetID,
  yE: __ReplaceElements,
  yj: __GetChildren,
  z3: __RemoveElement,
  zm: __GetTag
});


},
248(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
// Safari doesn't support requestIdleCallback
const requestIdleCallbackImpl = typeof requestIdleCallback === 'undefined'
    ? (callback) => setTimeout(callback, 16)
    : requestIdleCallback;
//# sourceMappingURL=requestIdleCallback.js.map
__webpack_require__.d(__webpack_exports__, {
}, {
  b: requestIdleCallbackImpl
});


},
8584(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
const setElementPropertyOrAttribute = (element, key, value) => {
    if (value == null) {
        element.removeAttribute(key);
        return;
    }
    if (key in element
        && typeof value !== 'string'
        && typeof value !== 'number'
        && typeof value !== 'boolean') {
        element[key] = value;
    }
    else {
        element.setAttribute(key, String(value));
    }
};
//# sourceMappingURL=setElementPropertyOrAttribute.js.map
__webpack_require__.d(__webpack_exports__, {
}, {
  J: setElementPropertyOrAttribute
});


},
9467(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/*
 * Copyright 2025 The Lynx Authors. All rights reserved.
 * Licensed under the Apache License Version 2.0 that can be found in the
 * LICENSE file in the root directory of this source tree.
 */
function loadAllWebElements() {
    return Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 8265)).then(() => { });
}
//# sourceMappingURL=webElementsDynamicLoader.js.map
__webpack_require__.d(__webpack_exports__, {
  l: () => (loadAllWebElements)
});


},

}]);