(() => {
"use strict";
var __webpack_modules__ = ({
9595(__webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.a(__webpack_module__, async function (__rspack_load_async_deps, __rspack_async_done) { try {
/* import */ var _constants_js__rspack_import_0 = __webpack_require__(3077);
/* import */ var _wasm_js__rspack_import_1 = __webpack_require__(3384);
var __rspack_async_deps = __rspack_load_async_deps([_wasm_js__rspack_import_1]);
_wasm_js__rspack_import_1 = (__rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps)[0];

function loadStyleFromJSON(styleInfo, configEnableCSSSelector, transformVW, transformVH, transformREM, entryName) {
    const rawStyleInfo = new _wasm_js__rspack_import_1.wasmInstance.RawStyleInfo();
    for (const [cssIdStr, info] of Object.entries(styleInfo)) {
        const cssId = parseInt(cssIdStr, 10);
        // Handle imports
        if (info.imports) {
            info.imports.forEach(importIdStr => {
                const importId = parseInt(importIdStr, 10);
                if (!isNaN(importId)) {
                    rawStyleInfo.append_import(cssId, importId);
                }
            });
        }
        if (info.content) {
            const contentStr = info.content.join('\n').trim();
            if (contentStr.length > 0) {
                parseAndPushContentRules(rawStyleInfo, cssId, contentStr);
            }
        }
        // Handle rules
        for (const rule of info.rules) {
            const wasmRule = new _wasm_js__rspack_import_1.wasmInstance.Rule('StyleRule');
            // Declarations
            for (const [prop, val] of rule.decl) {
                wasmRule.push_declaration(prop, val);
            }
            // Selectors
            const prelude = new _wasm_js__rspack_import_1.wasmInstance.RulePrelude();
            for (const selectorChain of rule.sel) {
                const selector = new _wasm_js__rspack_import_1.wasmInstance.Selector();
                // Iterate in chunks of 4
                for (let i = 0; i < selectorChain.length; i += 4) {
                    const plain = selectorChain[i] || [];
                    const pseudoClass = selectorChain[i + 1] || [];
                    const pseudoElement = selectorChain[i + 2] || [];
                    const combinator = selectorChain[i + 3] || [];
                    for (const s of plain) {
                        parseAndPushSelector(selector, s);
                    }
                    for (const s of pseudoClass) {
                        if (s === '::part(input)::placeholder') {
                            selector.push_one_selector_section('PseudoElementSelector', 'placeholder');
                        }
                        else {
                            // Strip leading :
                            const val = s.startsWith(':') ? s.substring(1) : s;
                            selector.push_one_selector_section('PseudoClassSelector', val);
                        }
                    }
                    for (const s of pseudoElement) {
                        // Strip leading ::
                        const val = s.startsWith('::')
                            ? s.substring(2)
                            : s.startsWith(':')
                                ? s.substring(1)
                                : s;
                        selector.push_one_selector_section('PseudoElementSelector', val);
                    }
                    if (combinator.length > 0) {
                        selector.push_one_selector_section('Combinator', combinator[0]);
                    }
                }
                prelude.push_selector(selector);
            }
            wasmRule.set_prelude(prelude);
            rawStyleInfo.push_rule(cssId, wasmRule);
        }
    }
    return _wasm_js__rspack_import_1.wasmInstance.encode_legacy_json_generated_raw_style_info(rawStyleInfo, configEnableCSSSelector, entryName, transformVW, transformVH, transformREM);
}
function parseAndPushSelector(selector, s) {
    if (s.startsWith('.')) {
        selector.push_one_selector_section('ClassSelector', s.substring(1));
    }
    else if (s.startsWith('#')) {
        selector.push_one_selector_section('IdSelector', s.substring(1));
    }
    else if (s.startsWith('[') && s.startsWith('[lynx-tag=') && s.endsWith(']')) {
        // Handling [lynx-tag="tag_name"] or [lynx-tag='tag_name'] or [lynx-tag=tag_name]
        let tag = s.substring('[lynx-tag='.length, s.length - 1);
        if ((tag.startsWith('"') && tag.endsWith('"'))
            || (tag.startsWith('\'') && tag.endsWith('\''))) {
            tag = tag.substring(1, tag.length - 1);
        }
        if (tag === 'page') {
            selector.push_one_selector_section('AttributeSelector', 'part="page"');
        }
        else {
            const typeName = _constants_js__rspack_import_0/* .LYNX_TAG_TO_HTML_TAG_MAP */.H1[tag]
                ?? (tag.includes('-') ? tag : `x-${tag}`);
            selector.push_one_selector_section('TypeSelector', typeName);
        }
    }
    else if (s.startsWith('[')) {
        // Attribute: [attr=val]
        // Remove enclosing []
        const content = s.substring(1, s.length - 1);
        selector.push_one_selector_section('AttributeSelector', content);
    }
    else if (s === '*') {
        selector.push_one_selector_section('UniversalSelector', '*');
    }
    else {
        selector.push_one_selector_section('TypeSelector', s);
    }
}
function parseAndPushContentRules(rawStyleInfo, cssId, content) {
    const rule = new _wasm_js__rspack_import_1.wasmInstance.Rule('StyleRule');
    const prelude = new _wasm_js__rspack_import_1.wasmInstance.RulePrelude();
    const selector = new _wasm_js__rspack_import_1.wasmInstance.Selector();
    selector.push_one_selector_section('UnknownText', '{}' + content); // this is a hack We put it into selector section and use a {} to make the prior part be a valid rule (`{}` means corresponding block)
    prelude.push_selector(selector);
    rule.set_prelude(prelude);
    rawStyleInfo.push_rule(cssId, rule);
}
//# sourceMappingURL=cssLoader.js.map
__webpack_require__.d(__webpack_exports__, {
  g: () => (loadStyleFromJSON)
});

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
5429(__webpack_module__, __unused_rspack___webpack_exports__, __webpack_require__) {
__webpack_require__.a(__webpack_module__, async function (__rspack_load_async_deps, __rspack_async_done) { try {
/* import */ var _constants_js__rspack_import_0 = __webpack_require__(3077);
/* import */ var _wasm_js__rspack_import_1 = __webpack_require__(3384);
/* import */ var _cssLoader_js__rspack_import_2 = __webpack_require__(9595);
/* import */ var _common_decodeUtils_js__rspack_import_3 = __webpack_require__(355);
var __rspack_async_deps = __rspack_load_async_deps([_wasm_js__rspack_import_1, _cssLoader_js__rspack_import_2]);
([_wasm_js__rspack_import_1, _cssLoader_js__rspack_import_2] = __rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps);

let wasmModuleLoadedResolve;
const wasmModuleLoadedPromise = new Promise((resolve) => {
    wasmModuleLoadedResolve = resolve;
});


const MTS_CODE_WRAPPER_PREFIX = '//# allFunctionsCalledOnLoad\n(function(){ "use strict"; const navigator=void 0,postMessage=void 0; let window=void 0; ';
/**
 * The bundle compiler, loaded only when a markup (buildless Lynx XML) card
 * actually arrives.
 *
 * This is `@lynx-js/web-core/encode`'s own `encodeLynxXML` - the function the
 * build uses - reached through its source module rather than reimplemented. It is
 * heavy: a CSS parser (`@lynx-js/css-serializer`, which re-exports `css-tree`)
 * plus the `binary/encode` wasm, a few hundred kilobytes a card built ahead of
 * time never needs.
 *
 * It must stay behind this lazy `import()`. `TemplateManager` requests this worker
 * with `webpackPrefetch`, `webpackPreload` and `fetchPriority: "high"`, so
 * anything imported statically here is eagerly fetched for *every* card; the magic
 * comments below undo those inherited hints for this one chunk. Nothing in
 * `decodeWorker/` may import `ts/encode/` statically.
 *
 * Reaching the encoder from a browser bundle at all is what #3589 made possible:
 * `binary/encode`'s glue used to load its wasm through `node:fs` and is now
 * generated with `wasm-bindgen --target bundler`, which a bundler resolves on
 * either platform.
 */
const loadMarkupEncoder = () => __webpack_require__.e(/* import() | web-core-markup-encoder */ 98, "low").then(__webpack_require__.bind(__webpack_require__, 4730));
const HEARTBREAK_INTERVAL_MS = 1000;
let heartbreakTimer;
class StreamReader {
    #reader;
    #buffer = new Uint8Array(0);
    constructor(reader) {
        this.#reader = reader;
    }
    async read(size) {
        if (this.#buffer.length >= size) {
            const result = this.#buffer.slice(0, size);
            this.#buffer = this.#buffer.slice(size);
            return result;
        }
        while (this.#buffer.length < size) {
            const { done, value } = await this.#reader.read();
            if (value) {
                const newBuffer = new Uint8Array(this.#buffer.length + value.length);
                newBuffer.set(this.#buffer);
                newBuffer.set(value, this.#buffer.length);
                this.#buffer = newBuffer;
            }
            if (done) {
                break;
            }
        }
        if (this.#buffer.length < size) {
            if (this.#buffer.length === 0) {
                return null;
            }
            throw new Error(`Unexpected end of stream. Expected ${size} bytes, got ${this.#buffer.length}`);
        }
        const result = this.#buffer.slice(0, size);
        this.#buffer = this.#buffer.slice(size);
        return result;
    }
    async readRest() {
        while (true) {
            const { done, value } = await this.#reader.read();
            if (value) {
                const newBuffer = new Uint8Array(this.#buffer.length + value.length);
                newBuffer.set(this.#buffer);
                newBuffer.set(value, this.#buffer.length);
                this.#buffer = newBuffer;
            }
            if (done) {
                break;
            }
        }
        const result = this.#buffer;
        this.#buffer = new Uint8Array(0);
        return result;
    }
}
function decodeJSONMap(buffer) {
    const utf16Array = new Uint16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 2);
    let jsonString = '';
    const CHUNK_SIZE = 8192;
    for (let i = 0; i < utf16Array.length; i += CHUNK_SIZE) {
        jsonString += String.fromCharCode.apply(null, utf16Array.subarray(i, i + CHUNK_SIZE));
    }
    return JSON.parse(jsonString);
}
function postHeartbreak() {
    postMessage({ type: 'heartbreak' });
}
function unrefTimer(timer) {
    if (typeof timer === 'object' && timer !== null && 'unref' in timer) {
        timer.unref();
    }
}
function scheduleHeartbreak() {
    if (heartbreakTimer !== undefined) {
        return;
    }
    heartbreakTimer = setTimeout(() => {
        heartbreakTimer = undefined;
        postHeartbreak();
    }, HEARTBREAK_INTERVAL_MS);
    unrefTimer(heartbreakTimer);
}
self.onmessage = async (event) => {
    const data = event.data;
    if (data.type === 'init') {
        const { wasmModule } = data;
        _wasm_js__rspack_import_1.wasmInstance.initSync({ module: wasmModule });
        wasmModuleLoadedResolve();
    }
    else if (data.type === 'heartbreak') {
        scheduleHeartbreak();
    }
    else if (data.type === 'load') {
        const { url, fetchUrl, overrideConfig, transformVW, transformVH, transformREM, } = data;
        try {
            const response = await fetch(fetchUrl, {
                headers: {
                    'Accept': 'application/octet-stream, application/json',
                },
            });
            if (!response.body || response.status !== 200) {
                throw new Error(`Failed to fetch template: ${response.statusText}`);
            }
            const reader = response.body.getReader();
            await handleStream(url, reader, transformVW, transformVH, transformREM, overrideConfig);
            postMessage({ type: 'done', url });
        }
        catch (error) {
            postMessage({ type: 'error', url, error: error.message });
        }
    }
};
async function handleStream(url, reader, transformVW, transformVH, transformREM, overrideConfig) {
    const streamReader = new StreamReader(reader);
    let config = {};
    // 1. Check MagicHeader
    const headerBytes = await streamReader.read(8);
    if (!headerBytes) {
        throw new Error('Empty stream');
    }
    // Check if JSON (starts with {)
    if (headerBytes[0] === 123) {
        const rest = await streamReader.readRest();
        const decoder = new TextDecoder();
        const jsonStr = decoder.decode(headerBytes) + decoder.decode(rest);
        const json = JSON.parse(jsonStr);
        await handleJSON(json, url, transformVW, transformVH, transformREM, overrideConfig);
        return;
    }
    const view = new DataView(headerBytes.buffer, headerBytes.byteOffset, headerBytes.byteLength);
    const magic0 = view.getUint32(0, true);
    const magic1 = view.getUint32(4, true);
    if (magic0 !== _constants_js__rspack_import_0/* .MagicHeader0 */.Bz || magic1 !== _constants_js__rspack_import_0/* .MagicHeader1 */.ug) {
        // Neither a bundle nor JSON, so the one artifact shape left is a Lynx XML
        // markup card. It arrives here rather than being sniffed for up front
        // because it is the only shape that cannot be streamed - the XML parser has
        // no incremental mode - and making every artifact pay for a look-ahead in
        // order to route the one that does not stream had it backwards. By this
        // point the header is already in hand and nothing has to be replayed.
        await handleMarkup(headerBytes, await streamReader.readRest(), url, transformVW, transformVH, transformREM, overrideConfig);
        return;
    }
    // 2. Check Version
    const versionBytes = await streamReader.read(4);
    if (!versionBytes) {
        throw new Error('Unexpected EOF reading version');
    }
    const versionView = new DataView(versionBytes.buffer, versionBytes.byteOffset, versionBytes.byteLength);
    const version = versionView.getUint32(0, true);
    if (version > 1) {
        throw new Error(`Unsupported version: ${version}`);
    }
    // 3. Read Sections
    while (true) {
        const labelBytes = await streamReader.read(4);
        if (!labelBytes) {
            break; // EOF
        }
        const labelView = new DataView(labelBytes.buffer, labelBytes.byteOffset, labelBytes.byteLength);
        const label = labelView.getUint32(0, true);
        const lengthBytes = await streamReader.read(4);
        if (!lengthBytes) {
            throw new Error('Unexpected EOF reading section length');
        }
        const lengthView = new DataView(lengthBytes.buffer, lengthBytes.byteOffset, lengthBytes.byteLength);
        const length = lengthView.getUint32(0, true);
        const content = await streamReader.read(length);
        if (!content) {
            throw new Error(`Unexpected EOF reading section content. Expected ${length} bytes.`);
        }
        switch (label) {
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.Configurations */.eC.Configurations: {
                config = overrideConfig
                    ? { ...decodeJSONMap(content), ...overrideConfig }
                    : decodeJSONMap(content);
                postMessage({ type: 'section', label, url, data: config });
                break;
            }
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.StyleInfo */.eC.StyleInfo: {
                await wasmModuleLoadedPromise;
                const buffer = _wasm_js__rspack_import_1.wasmInstance.decode_style_info(content, config['isLazy'] === 'true' ? url : undefined, config['enableCSSSelector'] === 'true', transformVW, transformVH, transformREM);
                postMessage({
                    type: 'section',
                    label,
                    url,
                    data: buffer.buffer,
                    config,
                }, {
                    transfer: [buffer.buffer],
                });
                break;
            }
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.LepusCode */.eC.LepusCode: {
                const codeMap = (0,_common_decodeUtils_js__rspack_import_3/* .decodeBinaryMap */.E)(content);
                const isLazy = config['isLazy'] === 'true';
                // An external bundle's mts chunk is CommonJS-style (it writes to
                // `exports`), so give it a `module.exports`/`exports` env. A card's own
                // lepus chunk is either side-effecting (non-lazy) or an expression
                // assigned to `module.exports` (lazy component root).
                const prefix = config['isExternalBundle'] === 'true'
                    ? 'var exports=(module.exports={}); '
                    : isLazy
                        ? 'module.exports='
                        : '';
                const blobMap = {};
                for (const [key, code] of Object.entries(codeMap)) {
                    const blob = new Blob([
                        MTS_CODE_WRAPPER_PREFIX,
                        prefix,
                        code,
                        ' \n })()\n//# sourceURL=',
                        url,
                        '/',
                        key,
                        '\n',
                    ], {
                        type: 'text/javascript; charset=utf-8',
                    });
                    blobMap[key] = URL.createObjectURL(blob);
                }
                postMessage({ type: 'section', label, url, data: blobMap, config });
                break;
            }
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.ElementTemplates */.eC.ElementTemplates: {
                postMessage({ type: 'section', label, url, data: content }, [content.buffer]);
                break;
            }
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.CustomSections */.eC.CustomSections: {
                postMessage({ type: 'section', label, url, data: content.buffer }, {
                    transfer: [content.buffer],
                });
                break;
            }
            case _constants_js__rspack_import_0/* .TemplateSectionLabel.Manifest */.eC.Manifest: {
                const codeMap = (0,_common_decodeUtils_js__rspack_import_3/* .decodeBinaryMap */.E)(content);
                const blobMap = {};
                for (const [key, code] of Object.entries(codeMap)) {
                    const blob = new Blob([
                        code,
                        '//# sourceURL=',
                        url,
                        '/',
                        key,
                    ], {
                        type: 'text/javascript; charset=utf-8',
                    });
                    blobMap[key] = URL.createObjectURL(blob);
                }
                postMessage({ type: 'section', label, url, data: blobMap });
                break;
            }
            default:
                throw new Error(`Unknown section label: ${label}`);
        }
    }
}
/**
 * Whether the text begins an XML document, i.e. its first non-whitespace
 * character opens a tag.
 *
 * This is not a sniff and nothing is routed by it: by the time it runs the
 * artifact has already been classified as markup, by elimination. It exists only
 * so that {@link handleMarkup} can tell the two failures apart - a document the
 * author wrote wrong, and bytes that were never a Lynx artifact of any kind.
 *
 * The rule is deliberately the parser's own precondition rather than a new one:
 * `parseLynxXML` skips a BOM (already stripped by `TextDecoder` here) and the
 * same ASCII whitespace set, then accepts a leading comment, `<!doctype lynx>`
 * or `<lynx`. Anything this rejects would have been rejected there too, one
 * step later and with a message about a missing root element.
 */
function startsXMLDocument(source) {
    for (let index = 0; index < source.length; index++) {
        const character = source[index];
        if (character === ' ' || character === '\t' || character === '\n'
            || character === '\r' || character === '\f') {
            continue;
        }
        return character === '<';
    }
    return false;
}
/**
 * Compiles a Lynx XML markup card into a bundle and loads that, the artifact
 * shape reached by elimination.
 *
 * A markup card is not a third kind of artifact. It is compiled here, in the
 * browser, by the same `encodeLynxXML` a build would run, into the same
 * `.web.bundle` bytes a build would emit - magic header, version, and the five
 * sections in the encoder's order - and those bytes are then handed back to
 * {@link handleStream}. Every section is read by the reader that already exists,
 * so there is no markup-specific decoding anywhere: not in this worker, and not
 * on the main thread.
 *
 * The recursion terminates after exactly one extra level. `encode` writes
 * `MagicHeader0`/`MagicHeader1` at offset 0 unconditionally, so the second
 * `handleStream` takes the binary branch. Were that ever untrue the bytes would
 * reach {@link startsXMLDocument}, whose answer for a bundle's first byte (`S`)
 * is `false`, and the recursion would end in a thrown error rather than a loop.
 *
 * ## Why it reports two different failures
 *
 * Because it is the fallback, a corrupted binary bundle lands here too: a single
 * flipped bit in the magic header is enough. Handing those bytes to the XML
 * parser would answer with
 * `expected '<lynx engine-version="...">' root element`, which sends whoever is
 * reading it looking for a markup bug in a file that is not markup. So the
 * bytes are checked for the shape of a text document first, and if they do not
 * have it the diagnosis `handleStream` used to give -
 * `Invalid Magic Header` - is reported instead, with the offending header bytes.
 * That check also keeps the several hundred kilobyte compiler chunk from being
 * fetched only to reject a corrupt bundle.
 */
async function handleMarkup(head, rest, url, transformVW, transformVH, transformREM, overrideConfig) {
    const bytes = new Uint8Array(head.length + rest.length);
    bytes.set(head);
    bytes.set(rest, head.length);
    // Joined before a single `TextDecoder` pass rather than decoded in two,
    // because a multi-byte sequence can straddle the eight byte header. Nothing
    // observable rests on it today: bytes 0..7 of a Lynx XML document are ASCII
    // by grammar - `<!doctype`, `<lynx` or whitespace - so a character can only
    // straddle inside a leading comment, which is discarded. It costs three
    // lines and stops being a question.
    // `TextDecoder` strips a leading UTF-8 BOM for us.
    const source = new TextDecoder().decode(bytes);
    if (!startsXMLDocument(source)) {
        const headHex = Array.from(head, byte => byte.toString(16).padStart(2, '0'))
            .join(' ');
        throw new Error(`Invalid Magic Header: not a Lynx bundle, and not a Lynx XML markup card`
            + ` either - the content does not begin a tag. First bytes: ${headHex}`);
    }
    const { encodeLynxXML } = await loadMarkupEncoder();
    const compiled = encodeLynxXML(source);
    if (!compiled.success) {
        throw new Error(compiled.message);
    }
    await handleStream(url, new ReadableStream({
        start(controller) {
            controller.enqueue(compiled.buffer);
            controller.close();
        },
    }).getReader(), transformVW, transformVH, transformREM, overrideConfig);
}
async function handleJSON(json, url, transformVW, transformVH, transformREM, overrideConfig) {
    // Configurations
    let config = {};
    if (json.pageConfig) {
        config = { ...json.pageConfig };
    }
    if (json.lepusCode?.root && typeof json.lepusCode.root === 'string') {
        const appType = json.appType
            ?? (json.lepusCode.root.startsWith('(function (globDynamicComponentEntry')
                ? 'lazy'
                : 'card');
        config.cardType = json.cardType ?? json.pageConfig?.cardType ?? 'react';
        config.appType = config.appType ?? appType;
        config.isLazy = (appType === 'card') ? 'false' : 'true';
    }
    if (overrideConfig) {
        config = { ...config, ...overrideConfig };
    }
    config = Object.fromEntries(Object.entries(config).map(([key, value]) => [key, value.toString()]));
    postMessage({
        type: 'section',
        label: _constants_js__rspack_import_0/* .TemplateSectionLabel.Configurations */.eC.Configurations,
        url,
        data: config,
    });
    // StyleInfo
    if (json.styleInfo) {
        await wasmModuleLoadedPromise;
        const buffer = (0,_cssLoader_js__rspack_import_2/* .loadStyleFromJSON */.g)(json.styleInfo, config['enableCSSSelector'] === 'true', transformVW, transformVH, transformREM, config['isLazy'] === 'true' ? url : undefined);
        postMessage({
            type: 'section',
            label: _constants_js__rspack_import_0/* .TemplateSectionLabel.StyleInfo */.eC.StyleInfo,
            url,
            data: buffer.buffer,
            config,
        }, {
            transfer: [buffer.buffer],
        });
    }
    // LepusCode
    if (json.lepusCode) {
        // Flattened structure in json: { root: "...", chunk1: "..." }
        const isLazy = config['isLazy'] === 'true';
        const blobMap = {};
        for (const [key, code] of Object.entries(json.lepusCode)) {
            if (typeof code !== 'string')
                continue;
            const prefix = `${MTS_CODE_WRAPPER_PREFIX}${isLazy ? 'module.exports=' : ''} `;
            const suffix = ` \n })()\n//# sourceURL=${url}/${key}\n`;
            const blob = new Blob([prefix, code, suffix], {
                type: 'text/javascript; charset=utf-8',
            });
            blobMap[key] = URL.createObjectURL(blob);
        }
        postMessage({
            type: 'section',
            label: _constants_js__rspack_import_0/* .TemplateSectionLabel.LepusCode */.eC.LepusCode,
            url,
            data: blobMap,
            config,
        });
    }
    // Manifest
    if (json.manifest) {
        const blobMap = {};
        for (const [key, code] of Object.entries(json.manifest)) {
            if (typeof code !== 'string')
                continue;
            const blob = new Blob([code], {
                type: 'text/javascript;',
            });
            blobMap[key] = URL.createObjectURL(blob);
        }
        postMessage({
            type: 'section',
            label: _constants_js__rspack_import_0/* .TemplateSectionLabel.Manifest */.eC.Manifest,
            url,
            data: blobMap,
        });
    }
    // CustomSections
    if (json.customSections) {
        // Currently we don't have a way to encode custom sections here.
        // If main thread accepts generic object, we send it.
        // But TemplateManager expects buffer?
        // TemplateManager: case CustomSections: #setCustomSection(url, data). data: any.
        // So passing object is fine!
        postMessage({
            type: 'section',
            label: _constants_js__rspack_import_0/* .TemplateSectionLabel.CustomSections */.eC.CustomSections,
            url,
            data: json.customSections,
        });
    }
    // ElementTemplates
    if (json.elementTemplates && Object.keys(json.elementTemplates).length > 0) {
        // TemplateManager expects Uint8Array for ElementTemplates.
        // We can't support this easily for JSON.
        throw new Error('ElementTemplates in JSON artifacts are not supported yet.');
    }
}
postMessage({ type: 'ready' });
scheduleHeartbreak();
//# sourceMappingURL=decode.worker.js.map
__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
3384(__webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.a(__webpack_module__, async function (__rspack_load_async_deps, __rspack_async_done) { try {
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
  wasmInstance: wasmInstance
});

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } }, 1);

},
355(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
/*
 * Copyright 2025 The Lynx Authors. All rights reserved.
 * Licensed under the Apache License Version 2.0 that can be found in the
 * LICENSE file in the root directory of this source tree.
 */
function decodeBinaryMap(buffer) {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    let offset = 0;
    if (buffer.byteLength < 4) {
        throw new Error('Buffer too short for count');
    }
    const count = view.getUint32(offset, true);
    offset += 4;
    const result = {};
    const decoder = new TextDecoder();
    for (let i = 0; i < count; i++) {
        if (buffer.byteLength < offset + 4) {
            throw new Error('Buffer too short for key length');
        }
        const keyLen = view.getUint32(offset, true);
        offset += 4;
        if (buffer.byteLength < offset + keyLen) {
            throw new Error('Buffer too short for key');
        }
        const key = decoder.decode(buffer.subarray(offset, offset + keyLen));
        offset += keyLen;
        if (buffer.byteLength < offset + 4) {
            throw new Error('Buffer too short for value length');
        }
        const valLen = view.getUint32(offset, true);
        offset += 4;
        if (buffer.byteLength < offset + valLen) {
            throw new Error('Buffer too short for value');
        }
        const val = buffer.subarray(offset, offset + valLen);
        offset += valLen;
        result[key] = val;
    }
    return result;
}
//# sourceMappingURL=decodeUtils.js.map
__webpack_require__.d(__webpack_exports__, {
  E: () => (decodeBinaryMap)
});


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
}, {
  Bz: MagicHeader0,
  H1: LYNX_TAG_TO_HTML_TAG_MAP,
  eC: TemplateSectionLabel,
  ug: MagicHeader1
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

// the startup function
__webpack_require__.x = () => {
// Load entry module and return exports
var __webpack_exports__ = __webpack_require__.O(undefined, ["491"], () => __webpack_require__(5429));
__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
return __webpack_exports__
};

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
  if (chunkId === 491) return "static/js/491.0bc8669ad6.js";
  // return url for filenames based on template
  return "static/js/async/" + {778: "legacy-wasm-js",98: "web-core-markup-encoder",}[chunkId] + "." + {778: "0ed4e7d10a",98: "79140d2f9f",}[chunkId] + ".js"
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
// webpack/runtime/startup_chunk_dependencies
(() => {
var next = __webpack_require__.x
__webpack_require__.x = () => {
  return __webpack_require__.e(491).then(next);
}
})();
// webpack/runtime/async_wasm_loading
(() => {

    __webpack_require__.v = function(exports, wasmModuleFilename, importsObj) {
      
      var req = fetch(__webpack_require__.p + wasmModuleFilename);
      var fallback = function() {
        return req
          .then(function(x) { return x.arrayBuffer();})
          .then(function(bytes) { return WebAssembly.instantiate(bytes, importsObj);})
          .then(function(res) { return Object.assign(exports, res.instance.exports);});

      }
      
      return req.then(function(res) {
        if (typeof WebAssembly.instantiateStreaming === "function") {
          return WebAssembly.instantiateStreaming(res, importsObj)
            .then(
              function(res) { return Object.assign(exports, res.instance.exports);},
              function(e) {
                if(res.headers.get("Content-Type") !== "application/wasm") {
                  console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                  return fallback();
                }
                throw e;
              }
            );
        }
        return fallback();
      });

    };

})();
// webpack/runtime/import_scripts_chunk_loading
(() => {
__webpack_require__.b = self.location + "/../../../../";
var importScriptsInstalledChunks = {350: 1,};
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
// run startup
var __webpack_exports__ = __webpack_require__.x();
})()
;