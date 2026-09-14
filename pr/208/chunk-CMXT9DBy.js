import {a as f,a6 as he$1,o as oe$1,m as mc,q,ad as Nq,aN as Fo,R as Rq,ak as ce$1,aO as Hn,ae as zn,af as Ps,T,p as po,aP as Fn,J,aQ as Xa,an as Z,ao as _$1,N as me$1,aR as Gc,I as Ii}from'./main.js';import {e}from'./chunk-CLNpRTgV.js';import {m,d,y}from'./chunk-zS2rsASb.js';var Q=`[
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "sample-surface",
      "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json",
      "sendDataModel": true
    }
  },
  {
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "sample-surface",
      "components": [
        {
          "id": "root",
          "component": "Column",
          "children": ["title", "location_input", "pickup_input", "dropoff_input", "book_button"],
          "justify": "start",
          "align": "stretch"
        },
        {
          "id": "title",
          "component": "Text",
          "text": "Book a Car",
          "variant": "h1"
        },
        {
          "id": "location_input",
          "component": "TextField",
          "label": "Pick-up Location",
          "value": {
            "path": "/booking/location"
          },
          "variant": "shortText"
        },
        {
          "id": "pickup_input",
          "component": "DateTimeInput",
          "label": "Pick-up Date",
          "value": {
            "path": "/booking/pickupDate"
          },
          "enableDate": true,
          "enableTime": false
        },
        {
          "id": "dropoff_input",
          "component": "DateTimeInput",
          "label": "Drop-off Date",
          "value": {
            "path": "/booking/dropoffDate"
          },
          "enableDate": true,
          "enableTime": false
        },
        {
          "id": "book_button",
          "component": "Button",
          "child": "book_button_text",
          "variant": "primary",
          "action": {
            "event": {
              "name": "searchCars",
              "context": {
                "location": {
                  "path": "/booking/location"
                },
                "pickupDate": {
                  "path": "/booking/pickupDate"
                },
                "dropoffDate": {
                  "path": "/booking/dropoffDate"
                }
              }
            }
          }
        },
        {
          "id": "book_button_text",
          "component": "Text",
          "text": "Search Cars",
          "variant": "body"
        }
      ]
    }
  },
  {
    "version": "v0.9",
    "updateDataModel": {
      "surfaceId": "sample-surface",
      "path": "/booking",
      "value": {
        "location": "",
        "pickupDate": "",
        "dropoffDate": ""
      }
    }
  }
]`.trim()+`
`;var w="updateComponents",j="components",de="registerMockRules",ue="mockRulesConfig",pe="rules",me="id",he="children",ee="mock_rules_container",M=class o{destroyRef=f(he$1);chatState=f(m);catalogManagement=f(oe$1);startupConfigState=f(mc);previousCatalogId=null;isDraftModified=false;_activeDraft=q("");activeDraft=this._activeDraft.asReadonly();_draftInput=q("");constructor(){Nq(this.startupConfigState.selectedRendererId).pipe(Fo(1),Rq(this.destroyRef)).subscribe(()=>{this.flushDraft();}),Nq(this.catalogManagement.activeCatalog).pipe(ce$1(t=>!!t),Rq(this.destroyRef)).subscribe(t=>{let a=t.catalogId||t.$id||"",n=this.previousCatalogId===null,r=this.previousCatalogId!==null&&this.previousCatalogId!==a;if((n||r)&&!this.isDraftModified){let i=this.getInitialDraft(a);this._activeDraft.set(i),this._draftInput.set(i);}this.previousCatalogId=a;}),(this.startupConfigState.sharedA2uiPayload?Nq(this.startupConfigState.sharedA2uiPayload):Hn(null)).pipe(ce$1(t=>!!t),Rq(this.destroyRef)).subscribe(t=>{this.injectExternalDraft(t);}),Nq(this._draftInput).pipe(Fo(1),zn(300),Ps(),Rq(this.destroyRef)).subscribe(t=>{this.syncLayoutToHistory(t);});}updateDraft(e){this.isDraftModified=true,this._activeDraft.set(e),this._draftInput.set(e);}injectExternalDraft(e){this.isDraftModified=true,this._activeDraft.set(e),this._draftInput.set(e);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(e){this.isDraftModified=true,this._activeDraft.set(e);}flushDraft(){this.isDraftModified=false;let e=this.catalogManagement.activeCatalog(),t=e&&(e.catalogId||e.$id)||"",a=this.getInitialDraft(t);this._activeDraft.set(a),this._draftInput.set(a);}getInitialDraft(e){let t=this.startupConfigState.activeRenderer();return t?.samplePayload?t.samplePayload:e==="https://a2ui.org/specification/v0_9/basic_catalog.json"?Q:e?d([{version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:e,sendDataModel:true}}]):""}syncLayoutToHistory(e){let t=this.sanitizeLayout(e);if(!t)return;let a=this.chatState.chatHistory();if(a.length===0){this.chatState.setChatHistory([{role:"user",content:t}]);return}let n=a[a.length-1];if(n.role==="user"&&n.content.trim().startsWith("[")){let i=[...a];i[i.length-1]={role:"user",content:t},this.chatState.setChatHistory(i);}else this.chatState.updateChatHistory(i=>[...i,{role:"user",content:t}]);}sanitizeLayout(e){let t=e.trim();if(!t)return "";let a=y(t);if(a){let n=a.map(r=>r&&typeof r=="object"&&!Array.isArray(r)?this.sanitizeBlock(r):r).filter(r=>r!==null);return d(n)}return console.warn("[StateSync] Discarding malformed layout JSON during sanitization: not a valid JSON array"),""}sanitizeBlock(e){if(e[de]||e[ue])return null;if(e[w]&&typeof e[w]=="object"&&e[w]!==null){let t=e[w];if(Array.isArray(t[j])){let a=t[j].filter(n=>n!==null&&typeof n=="object"&&!Array.isArray(n)?n[me]!==ee:true);t[j]=a.map(n=>n!==null&&typeof n=="object"&&!Array.isArray(n)?this.sanitizeComponentObject(n):n);}}return e}sanitizeComponentObject(e){let t={};for(let[a,n]of Object.entries(e))a===pe||/^mock/i.test(a)||(a===he&&Array.isArray(n)?t[a]=n.filter(r=>r!==ee):n!==null&&typeof n=="object"&&!Array.isArray(n)?t[a]=this.sanitizeComponentObject(n):Array.isArray(n)?t[a]=n.map(r=>r!==null&&typeof r=="object"&&!Array.isArray(r)?this.sanitizeComponentObject(r):r):t[a]=n);return t}static \u0275fac=function(t){return new(t||o)};static \u0275prov=T({token:o,factory:o.\u0275fac,providedIn:"root"})};var te=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi,ae=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,ne=/\s*●●●\s*$/g;function re(o){return o.length>0&&o.some(e=>{if(e&&typeof e=="object"&&!Array.isArray(e)){let t=Object.keys(e);return t.includes("version")||t.includes("createSurface")||t.includes("updateComponents")||t.includes("updateDataModel")||t.includes("deleteSurface")}return  false})}var _=class o{PULSE_INDICATOR="\u25CF\u25CF\u25CF";appendPulse(e){return `${e??""} ${this.PULSE_INDICATOR}`}stripPulse(e){return e?(ne.lastIndex=0,e.replace(ne,"").trim()):""}stripThinkingTags(e){return e?(ae.lastIndex=0,e.replace(ae,"").trim()):""}extractCodeFences(e){if(!e)return {extracted:"",hasFences:false};te.lastIndex=0;let t=Array.from(e.matchAll(te));return t.length>0?{extracted:t.map(a=>a[1].trim()).join(`
`),hasFences:true}:{extracted:e.trim(),hasFences:false}}cleanPayload(e){if(!e)return "";let t=this.stripPulse(e);if(t=this.stripThinkingTags(t),t=this.extractCodeFences(t).extracted,!t.startsWith("{")&&!t.startsWith("[")){let n=Array.from(t.matchAll(/[\{\[]/g));for(let r of n)if(r.index!==void 0&&r.index>=0){let i=t.substring(r.index).trim();if(i.startsWith("{")&&i.includes('"version"')||i.startsWith("[")&&/^\[\s*[\{\"]/.test(i)&&(i.includes('"version"')||i.includes('"createSurface"')||i.includes('"updateComponents"'))){t=i;break}let s=y(i);if(s!==null&&re(s)){t=i;break}}}return t.trim()}isLayoutSnapshot(e){if(!e)return  false;let t=this.cleanPayload(e);if(t.startsWith('{"version"')||t.startsWith("{")&&t.includes('"version"')||t.startsWith("[")&&(t.includes('"version"')||t.includes('"createSurface"')||t.includes('"updateComponents"')))return  true;let a=y(t);return a!==null&&re(a)}static \u0275fac=function(t){return new(t||o)};static \u0275prov=T({token:o,factory:o.\u0275fac,providedIn:"root"})};function oe(o){if(o==null||o.trim().length===0)return {blocks:[],wasHealed:false};let e=false,t=y(o);if(t)return {blocks:t,wasHealed:false};try{let r=JSON.parse(o);if(Array.isArray(r))return {blocks:r,wasHealed:e};if(r&&typeof r=="object")return {blocks:[r],wasHealed:e}}catch{}let a=o.split(`
`).map(r=>r.trim()).filter(r=>r.length>0),n=[];for(let r of a)if(!(r.startsWith("```")||!r.startsWith("{")&&!r.startsWith("[")))try{n.push(JSON.parse(r));}catch{e=true;let s=fe(r);if(s!==null)n.push(s);else if(r.includes('"version"')||r.includes('"createSurface"'))throw new Error(`Syntax recovery failed for corrupted JSON Line:
"${r}"`)}if(n.length===0)throw new Error("No valid A2UI JSON layout command block could be parsed or recovered.");return {blocks:n,wasHealed:e}}function fe(o){if(o==null||o.trim().length===0)return null;let e=o.trim();e=e.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(e)}catch{for(let a=1;a<=5;a++)try{return JSON.parse(e+"}".repeat(a))}catch{}for(let a=1;a<=3;a++)for(let n=1;n<=3;n++)try{return JSON.parse(e+"]".repeat(a)+"}".repeat(n))}catch{}}return null}function ge(o){if(!o||typeof o!="object")return  false;let e=o;if(!e.updateComponents||typeof e.updateComponents!="object")return  false;let t=e.updateComponents;return Array.isArray(t.components)}function ie(o,e){let t=false,a={};if(e)for(let r of Object.keys(e)){let i=r.toLowerCase().replace(/[^a-z]/g,"");a[i]=r;}let n={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let r of o){if(!ge(r))continue;let i=r.updateComponents,s=[];for(let d of i.components){if(!d||typeof d!="object"||Array.isArray(d)){s.push(d);continue}let l=d,c=l.component;if(l.name&&!l.component&&(t=true,c=l.name,l.component=c,delete l.name),typeof c!="string")throw new Error("Component declaration is missing component type name string.");let p=c;if(e&&!e[c]){let u=c.toLowerCase().replace(/[^a-z]/g,""),g=a[u];if(!g){let f=n[u];f&&(g=a[f]);}if(g&&e[g])t=true,p=g;else {let f=u?Object.keys(e).find(C=>C.toLowerCase().includes(u)||u.includes(C.toLowerCase())):void 0;if(f)t=true,p=f;else throw new Error(`Validation failure: Component type "${c}" is not registered in the active custom catalog.`)}}let h=ye(l);h.component=p,s.push(h);}i.components=s;}return t}function F(o){if(o===null||typeof o!="object")return o;if(Array.isArray(o))return o.map(a=>F(a));let e=o,t={};for(let[a,n]of Object.entries(e))a==="__proto__"||a==="constructor"||a==="prototype"||(t[a]=F(n));return t}function ye(o){return F(o)}var E=class o{catalogManagement=f(oe$1);systemPrompt=Ii(()=>{let e=this.catalogManagement.activeCatalog();return e?this.generateSystemPrompt(d(e)):`
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests\u2014whether provided as text instructions, UI wireframes, screenshots,
  or mockup images\u2014into valid A2UI v0.9 interactive user interfaces.
      `});generateSystemPrompt(e$1){return `
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests\u2014whether provided as text instructions, UI wireframes, screenshots,
  or mockup images\u2014into valid A2UI v0.9 interactive user interfaces.

  ## Catalog Allowlist & Component Rules

  You MUST strictly enforce the following rules regarding component selection
  and schema compliance:
  1. **Strict Component Allowlist**: You MUST use ONLY the component types
     defined as keys in the "components" map of the active catalog schema
     provided below.
  2. **No Hallucinated Component Names**: Never invent, guess, or mix
     component names from other libraries or catalogs. For example, if only
     "Column", "Row", "Text", and "Button" are present in the active catalog
     schema below, emitting "MaterialColumn", "MaterialText", or "Div" is
     strictly INVALID.
  3. **No Hallucinated Properties**: Include ONLY properties explicitly
     defined in the JSON Schema for that specific component type in the
     active catalog. Do NOT emit unauthorized keys (e.g., "rules", "mock*",
     or unsupported CSS/styling parameters).

  ### Active Catalog Schema (Mandatory Allowlist)
  \`\`\`json
  ${e$1}
  \`\`\`

  ### Common Schema Types
  Common structural types referenced by $ref in the catalog schema (e.g.,
  DataBinding, Action, Event, DynamicString, etc.) are defined here:
  \`\`\`json
  ${d(e)}
  \`\`\`

  ## Output Format: Strict A2UI JSON Lines (JSONL)

  Your output MUST be valid **A2UI JSON Lines (JSONL)**:
  1. **One JSON Object Per Line**: Each A2UI message MUST be formatted as a
     single, valid JSON object on its own line, terminated by a newline
     character (\\n). Do NOT pretty-print or split a single JSON object across
     multiple lines.
  2. **Required Version & Command**: Every message object MUST include
     "version": "v0.9" at the top level and specify exactly one A2UI
     command: "createSurface", "updateComponents", "updateDataModel", or
     "deleteSurface".
  3. **No Markdown or Preamble**: Output ONLY raw JSON Lines. Do NOT wrap
     your response in markdown code fences (such as \`\`\`jsonl or \`\`\`). Do
     NOT include any conversational text, greetings, explanations,
     scratchpad analysis, or summary before or after the JSON Lines.
  4. **Direct Parseability**: Every line in your response MUST be
     independently parseable by JSON.parse().

  ## Multimodal & Image-to-UI Guidelines

  When an image, wireframe, mockup, or UI screenshot is provided by the
  user, adhere strictly to these visual translation principles:

  ### 1. Visual Layout, Scope & Sizing Fidelity
  * **Root Container Bounding**: The root component ("id": "root") MUST match
    the visual boundary of the primary UI card, form, or dialog shown. Do
    NOT extract ambient background titles, file names, or browser canvas
    headers outside the visual card boundary unless explicitly requested.
  * **Flex Orientation Mapping**:
    - Elements arranged top-to-bottom MUST map to vertical layout containers
      defined in the active catalog (e.g., Column).
    - Elements arranged left-to-right MUST map to horizontal layout
      containers defined in the active catalog (e.g., Row).
  * **Full-Width Stretch Mandate**: When an element (such as a primary CTA
    button, input field, or card) visually spans the full width of its
    parent container in the screenshot, configure its layout/alignment
    properties to stretch full-width (e.g., setting "align": "stretch" on
    the parent container or applying full-width properties supported by
    the active catalog) rather than rendering as a compact inline element.
  * **Container Spacing & Clipping Prevention**: Ensure root layout
    containers (Column) and nested sections maintain proper vertical
    padding, spacing, and scrollability so that bottom elements (such as
    footer actions or trailing list items) are never cut off or clipped.
  * **No Unseen Separators Rule**: Do NOT insert "Divider" lines or border
    components unless a distinct horizontal or vertical line separator is
    literally visible in the screenshot.
  * **Visual Reading Order**: List child IDs in children arrays in strict
    visual reading order (top-to-bottom, left-to-right).

  ### 2. Catalog-Aware Component Mapping
  Map visual elements to the most specific matching component type from the
  "components" allowlist of the active catalog schema provided above:
  * **Headings & Titles** -> Text component with heading typography styles
    (usageHint: "h1" | "h2" | "h3" or equivalent variant property in the
    active catalog schema).
  * **Body Text & Captions** -> Text component with body or caption
    typography styles (usageHint: "body" | "caption").
  * **Interactive Buttons** -> Button/IconButton component in the active
    catalog schema. Reflect visual prominence (e.g., primary filled vs.
    secondary borderless/outlined) and preserve full-width intent.
  * **Form Controls & Inputs** -> Text entry, date picker, selection/picker,
    or toggle components defined in the active catalog schema.
  * **Content Panels & Containers** -> Card, panel, or layout container
    components defined in the active catalog schema wrapping child elements.
  * **Repeated Lists & Collections** -> Layout container components with
    dynamic item template declarations
    (children: { "componentId": "...", "path": "/..." }).
  * **CRITICAL**: Every generated "component" value MUST be an exact key
    from the "components" map in the active catalog schema provided above.
    Never invent or guess component names not present in the active catalog.

  ### 3. Icon Fidelity, Custom SVG & Styling Intent
  * **Composite Icon & Feature Matching**: Closely examine visual icon
    shapes for composite features (e.g., a document with an edit badge, a
    search icon with a filter indicator, or a custom symbol). First check if
    the active catalog's Icon component includes an exact visual match in
    its enum.
  * **Custom SVG Fallback (No Close Icon Match)**: If an icon in the
    screenshot has distinct visual features that do NOT have a close match
    in the active catalog's predefined icon list:
    - **Do NOT** substitute a visually mismatched, generic, or oversimplified
      placeholder icon.
    - **Fallback to SVG**: Generate an inline vector graphic instead using
      one of the mechanisms supported by the active catalog schema:
      1. If the Icon component in the active catalog accepts custom path
         data, specify the svgPath property with a valid SVG path d string.
      2. If an Image component is available in the active catalog, supply an
         inline SVG Data URL in its url/image source property
         ("data:image/svg+xml;utf8,<svg ...>...</svg>").
  * **Visual Hierarchy**: Preserve typography scale, text weight, button
    prominence, and color intent using supported catalog properties.

  ### 4. Visual Affordance Recognition
  Recognize common UI visual affordance symbols and map them strictly using
  components defined in the active catalog schema provided above:
  * **Downward Chevrons / Disclosure Carets (Collapsible Rows)**:
    - **Visual Indicator**: Downward-facing arrows (\u2228, expand_more) at row
      edges denote expandable/collapsible sections.
    - **Catalog Mapping**: If the active catalog schema includes an expansion
      or accordion component, use it. Otherwise, compose the row using
      layout primitives in the catalog: e.g., a horizontal layout container
      (Row) holding leading text/icons and a trailing downward icon.
  * **Search Cues (Search Inputs)**:
    - **Visual Indicator**: Magnifying glass symbols (\u{1F50D}) inside or adjacent
      to text entry boxes.
    - **Catalog Mapping**: If a search component exists in the active catalog
      schema, use it; otherwise, use a text input component paired with a
      search icon.
  * **Toggle Track & Thumb (Switches & Toggles)**:
    - **Visual Indicator**: Pill-shaped track with a circular thumb (\u26AA\u2501\u2501).
    - **Catalog Mapping**: Use a toggle, switch, or selection control
      component defined in the active catalog schema.
  * **Selection Controls (Option Pickers)**:
    - **Visual Indicator**: Radio circles (\u25EF / \u{1F518}), checkboxes (\u2610 / \u2611), or
      dropdown carets.
    - **Catalog Mapping**: Look up selection, picker, or option components
      in the active catalog schema; if none exist, compose using interactive
      button components.
  * **Pill Badges & Chips (Status & Tags)**:
    - **Visual Indicator**: Small rounded rectangle or oval containing short
      text/status labels.
    - **Catalog Mapping**: Use a chip, badge, or tag component if defined in
      the active catalog schema; otherwise, compose using a text component
      inside a container or card.

  ### 5. Grounding, Data Binding & Sequence
  * **Complete Data Model Extraction**: ALL text strings, label names, image
    URLs, options, and default values visible in the image MUST be extracted
    into the updateDataModel payload.
  * **JSON Pointer References**: Components in updateComponents MUST bind to
    values in updateDataModel using valid JSON Pointers
    (e.g., {"path": "/header/title"}). Do NOT hardcode visible text strings
    inline when data binding is supported.
  * **Strict Grounding**: Include ONLY visual elements present in the
    screenshot. Do NOT hallucinate extra buttons, fields, or unrepresented
    data streams.

  ### 6. Image-to-UI Processing Sequence
  When translating an image to A2UI, follow this internal mental sequence
  (do NOT output any analysis or scratchpad text; output ONLY the final
  JSONL messages):
  1. **Analyze (Internal)**: Identify primary card boundaries, flex layout
     directions, full-width element stretching, absence of unseen dividers,
     container spacing, and composite icon details.
  2. **Extract Data**: Extract all visible text strings, values, and list
     items into updateDataModel.
  3. **Build Component Tree**: Map visual elements strictly to active
     catalog component types with exact icon names/SVGs, full-width
     properties, and JSON Pointer paths.
  4. **Emit JSONL Messages**: Output the single-line JSONL messages in
     strict sequence (createSurface -> updateComponents -> updateDataModel).

  ## Validation & Lifecycle Ordering

  A complete A2UI payload consists of one or more message objects sent as
  continuous JSON Lines. Every message object MUST include a top-level
  "version": "v0.9" field.

  The four primary messages you must use to manage a UI surface are:
  1. **createSurface**: Sent **FIRST** to signal the client to create a new
     surface. It defines the catalogId and optional theme parameters.
  2. **updateComponents**: Used to define or update the UI component tree.
     You must provide a flat list of components. One component MUST have an
     id of "root".
  3. **updateDataModel**: Used to define or update data values that the
     components bind to.
  4. **deleteSurface**: Signals the client to destroy the surface.

  Typical sequence: createSurface -> updateComponents -> updateDataModel
  (or combined/interleaved after creation).
  When updating an existing UI in a multi-turn conversation, keep the
  surfaceId consistent across turns.

  ## Examples

  **IMPORTANT**: The component names used in the examples below (Column, Text,
  TextField, ChoicePicker, Button, etc.) are for structural illustration.
  You MUST replace them with exact component names from the active catalog
  schema provided above. In addition, code fences (\`\`\`jsonl) are shown
  below for documentation readability only; do NOT include code fences in
  your actual JSONL output.

    * **Simple Example**: A basic column with text:
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "main", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "main", "components": [{"id": "root", "component": "MaterialColumn", "children": ["header", "content"]}, {"id": "header", "component": "MaterialText", "text": "Welcome"}, {"id": "content", "component": "MaterialText", "text": {"path": "/message"}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "main", "path": "/message", "value": "Hello, world!"}}
      \`\`\`

    * **Complex Form Example**: A vacation booking form demonstrating advanced
      Material form controls (\`MaterialDatepicker\`, \`MaterialSelect\`,
      \`MaterialSlideToggle\`) and buttons using the modernized Material catalog:
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "vacation_booking", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "vacation_booking", "components": [{"id": "root", "component": "MaterialColumn", "children": ["title", "destination_input", "checkin_datepicker", "checkout_datepicker", "room_type_select", "passenger_select", "flexible_dates_toggle", "search_button"]}, {"id": "title", "component": "MaterialText", "text": {"path": "/title_label"}, "usageHint": "h1"}, {"id": "destination_input", "component": "MaterialInput", "label": {"path": "/destination_label"}, "value": {"path": "/destination_value"}}, {"id": "checkin_datepicker", "component": "MaterialDatepicker", "label": {"path": "/checkin_label"}, "value": {"path": "/checkin_value"}}, {"id": "checkout_datepicker", "component": "MaterialDatepicker", "label": {"path": "/checkout_label"}, "value": {"path": "/checkout_value"}}, {"id": "room_type_select", "component": "MaterialSelect", "label": {"path": "/room_type_label"}, "value": {"path": "/room_type_value"}, "options": [{"label": "Standard Room", "value": "standard"}, {"label": "Deluxe Suite", "value": "deluxe"}]}, {"id": "passenger_select", "component": "MaterialSelect", "label": {"path": "/passenger_label"}, "value": {"path": "/passenger_value"}, "options": [{"label": "1 Passenger", "value": "1"}, {"label": "2 Passengers", "value": "2"}, {"label": "3+ Passengers", "value": "3"}]}, {"id": "flexible_dates_toggle", "component": "MaterialSlideToggle", "label": {"path": "/flexible_dates_label"}, "checked": {"path": "/flexible_dates_checked"}, "color": "primary"}, {"id": "search_button", "component": "MaterialButton", "label": {"path": "/search_label"}, "action": {"event": {"name": "searchVacation"}}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "vacation_booking", "value": {"title_label": "Book Your Dream Vacation", "destination_label": "Destination", "destination_value": "Hawaii", "checkin_label": "Check-in Date", "checkin_value": "2026-07-01", "checkout_label": "Check-out Date", "checkout_value": "2026-07-14", "room_type_label": "Room Type", "room_type_value": "standard", "passenger_label": "Passengers", "passenger_value": "2", "flexible_dates_label": "Flexible Dates (+/- 3 days)", "flexible_dates_checked": true, "search_label": "Search Flights & Hotels"}}}
      \`\`\`

    * **Dynamic List Example**: An example using templates to render a list of
      items.
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "dynamic_list_demo", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "dynamic_list_demo", "components": [{"id": "root", "component": "MaterialColumn", "children": ["title", "list_container"]}, {"id": "title", "component": "MaterialText", "text": "Dynamic List Demo"}, {"id": "list_container", "component": "MaterialColumn", "children": {"componentId": "item_template", "path": "/items"}}, {"id": "item_template", "component": "MaterialText", "text": {"path": "text"}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "dynamic_list_demo", "value": {"items": [{"text": "Item One"}, {"text": "Item Two"}]}}}
      \`\`\`

  ## Data Binding
  Every component property value MUST come from the data model (with minor
  exceptions for static primitives).
  When referencing data in the data model, you MUST use valid JSON Pointer
  syntax starting with /.

  ## Actions and Context

  When defining actions (e.g., on buttons), the \`context\` payload is a standard
  JSON object, rather than an array of key-value pairs.

  Example action definition:
  \`\`\`json
  "action": {
    "event": {
      "name": "selectItem",
      "context": {
        "itemId": "12345",
        "itemName": {"path": "/selected/name"}
      }
    }
  }
  \`\`\`
  `}static \u0275fac=function(t){return new(t||o)};static \u0275prov=T({token:o,factory:o.\u0275fac,providedIn:"root"})};var P=class o{isConnectivityError(e){return e?e.includes("failed to fetch")||e.includes("fetch")||e.includes("timeout")||e.includes("504")||e.includes("proxy")||e.includes("networkerror")||e.includes("connection")||e.includes("401")||e.includes("403")||e.includes("credential")||e.includes("quota")||e.includes("blocked")||e.includes("503")||e.includes("unavailable")||e.includes("api key")||e.includes("apikey"):false}parseError(e,t,a=false){let n=e??"",r=t??"",i="Connectivity Failure",s=r.trim().startsWith("{"),d=s?"A connectivity error occurred.":r,l=s?"Details: "+r:void 0,c="Tip: Please check your network proxy configurations or verify your settings to restore connections.",p=a,h=true,u=this.isConnectivityError(n);return n.includes("validation")||n.includes("syntax recovery")||n.includes("validation failure")?{errorTitle:"Validation Failure",errorMessage:"The generated layout contains invalid components or structure.",errorTip:"Tip: Try rephrasing your prompt to guide the model to generate valid components.",isRetryable:a,showDetails:true,errorDetails:"Details: "+r,isConnectivityFailure:u}:n.includes("503")||n.includes("unavailable")?{errorTitle:"Service Unavailable",errorMessage:"The generative service is temporarily unavailable. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:u}:n.includes("high demand")?{errorTitle:"Model High Demand",errorMessage:"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:u}:n.includes("timeout")||n.includes("504")?{errorTitle:"REST Gateway Timeout",errorMessage:"Remote generation service did not respond.",errorDetails:"Details: "+r,errorTip:c,isRetryable:p,showDetails:true,isConnectivityFailure:u}:n.includes("api key")||n.includes("apikey")?{errorTitle:"Invalid API Key",errorMessage:"The provided Gemini API key is invalid or missing.",errorDetails:"Details: "+r,errorTip:"Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.",isRetryable:p,showDetails:true,isConnectivityFailure:u}:n.includes("auth")||n.includes("401")||n.includes("403")||n.includes("credential")?{errorTitle:"Authentication Refused",errorMessage:"Authentication failed. Please verify your credentials in Settings.",errorDetails:"Details: "+r,errorTip:c,isRetryable:p,showDetails:true,isConnectivityFailure:u}:n.includes("quota")||n.includes("blocked")||n.includes("429")?{errorTitle:"GenAI Service Blocked",errorMessage:"Resource quota depleted or content safety limits triggered.",errorDetails:"Details: "+r,errorTip:c,isRetryable:p,showDetails:true,isConnectivityFailure:u}:{errorTitle:i,errorMessage:d,errorTip:c,isRetryable:p,showDetails:h,errorDetails:l,isConnectivityFailure:u}}static \u0275fac=function(t){return new(t||o)};static \u0275prov=T({token:o,factory:o.\u0275fac,providedIn:"root"})};function se(o){let e=/^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i,t=o.replace(e,"");if(t.startsWith("{"))try{let a=JSON.parse(t);if(a.error&&a.error.message)return a.error.message}catch{}return t}function O(o){if(!o)return o;let e=o.replace(/AIzaSy[A-Za-z0-9_-]+/g,"redacted for your protection");return e=e.replace(/(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(t,a,n)=>n.toLowerCase()==="redacted for your protection"?t:a+"redacted for your protection"),e=e.replace(/(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(t,a,n)=>n.toLowerCase()==="redacted for your protection"?t:a+"redacted for your protection"),e}var ce=class o{catalogManagement=f(oe$1);configProvider=f(po);stateSync=f(M);chatState=f(m);llmClient=f(Fn);chatCleaner=f(_);usageTrackingService=f(J);promptFactory=f(E);errorPresenter=f(P);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;currentTurnIndex=q(0);activePromptId=null;constructor(){Nq(this.configProvider.rendererUrl).pipe(Fo(1),Rq()).subscribe(()=>{queueMicrotask(()=>this.wipeEnvironmentCache());});}wipeEnvironmentCache(){this.currentTurnIndex.set(0),this.activePromptId=null,this.chatState.setChatHistory([]),this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}getFullMessageContext(){return [{role:"system",content:this.promptFactory.systemPrompt()},...this.chatState.chatHistory().filter(e=>e.role!=="error")]}activeStreamResponse;isCancelRequested=false;cancelActiveStream(){this.isCancelRequested=true,this.activePromptId&&this.usageTrackingService.trackChatCancel({promptId:this.activePromptId,turnIndex:this.currentTurnIndex(),pipelineStatus:this.pipelineStatus()}),this.activeStreamResponse&&this.activeStreamResponse.cancel&&this.activeStreamResponse.cancel();}emitPromptTracking(e,t,a){let n=!!a?.retryOfPromptId,r=a?.promptTurnIndex??this.currentTurnIndex()+1;this.currentTurnIndex.set(r);let i=this.catalogManagement.activeCatalog(),s=i&&(i.catalogId||i.$id)||"",d=t.some(c=>c.name==="screenshot.png"||c.mimeType?.startsWith("image/")),l=t.filter(c=>c.name!=="screenshot.png"&&!c.mimeType?.startsWith("image/"));return n?this.usageTrackingService.trackChatRetry({promptId:a?.promptId,catalogId:s,turnIndex:r,attemptNumber:2,retryOfPromptId:a?.retryOfPromptId}):this.usageTrackingService.trackChatPrompt({promptId:a?.promptId,catalogId:s,turnType:r===1?"initial":"followup",turnIndex:r,attemptNumber:1,hasScreenshot:d,attachmentCount:l.length})}async submitPrompt(e,t=[],a){if(this.chatState.isProgrammaticStreamActive()){console.warn("[ChatCoordinator] Blocked submitPrompt: programmatic stream is active.");return}let n=e.trim();if(!n&&t.length===0)return;let r=this.emitPromptTracking(n,t,a);this.activePromptId=r,this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(s=>[...s,{role:"user",content:n,attachments:t.length>0?t:void 0,promptId:r}]);let i=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",i),this.chatState.updateChatHistory(s=>[...s,{role:"model",content:this.chatCleaner.appendPulse("")}]);try{this.isCancelRequested=!1;let s=await this.llmClient.chatStream(i);if(this.isCancelRequested){s.cancel&&s.cancel();let p=new Error("Cancelled");throw p.name=Xa,p}this.activeStreamResponse=s;let d="",l="";for await(let p of s.contentStream)d+=p.content,p.thinking&&(l+=p.thinking),this.chatState.updateChatHistory(h=>{let u=[...h],g=u.length-1;return u[g]?.role==="model"&&(u[g]={role:"model",content:this.chatCleaner.appendPulse(d),thinking:l}),u});let c=await s.complete;this.chatState.addRawLlmLog("LLM_RESPONSE",c),this.chatState.updateChatHistory(p=>{let h=[...p],u=h.length-1;return h[u]?.role==="model"&&(h[u]={role:"model",content:c,thinking:l}),h}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(c);}catch(s){s&&typeof s=="object"&&"name"in s&&s.name===Xa?(this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.updateChatHistory(d=>{let l=[...d],c=l.length-1;return l[c]?.role==="model"&&(l[c]=Z(_$1({},l[c]),{content:"*You stopped this response.*"})),l})):this.handleConnectivityError(s,n,t,r);}finally{this.activeStreamResponse=void 0;}}async processRawLlmPayload(e){let t=[];try{this.chatCleaner.extractCodeFences(e).hasFences&&this.chatState.setPipelineStatus("healing");let a=this.chatCleaner.cleanPayload(e),n=oe(a);if(t=n.blocks,n.wasHealed&&this.chatState.setPipelineStatus("healing"),t.length===0)throw new Error("No valid A2UI JSON layout command block could be parsed or recovered.")}catch(a){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),a}this.chatState.setPipelineStatus("validating");try{let a={type:me$1.RENDER_A2UI,payload:t},n=[];if(!Gc.validateOutgoingMessage(a,n))throw new Error(`Outgoing message envelope validation failed:
${n.join(`
`)}`);ie(t,this.catalogManagement.activeCatalog()?.components)&&this.chatState.setPipelineStatus("healing"),this.chatState.setPipelineStatus("ready");let s=d(t);this.chatState.updateChatHistory(d=>{let l=[...d],c=l.length-1;return l[c]?.role==="model"&&(l[c]=Z(_$1({},l[c]),{content:s})),l}),this.stateSync.commitLayoutFromLlm(s),this.chatState.setProgrammaticStreamActive(!1);}catch(a){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),a}}handleConnectivityError(e,t,a=[],n){let r=e instanceof Error?e.message:String(e),i=r.toLowerCase(),s=se(r);this.errorPresenter.isConnectivityError(i)?this.chatState.setPipelineStatus("idle"):this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false);let d=this.errorPresenter.parseError(i,s,!!t),l="";e instanceof Error?l="Exception: "+e.message+`
Stack: `+(e.stack||"None"):l="Unknown Exception: "+JSON.stringify(e);let c="";d.errorDetails&&(c+=d.errorDetails+`

`),c+=l;let p=O(d.errorMessage),h=d.showDetails?O(c):void 0,u=d.showDetails?O(d.errorTip):void 0;console.error("Gemini chat execution failed:",e),this.chatState.updateChatHistory(g=>{let f=[...g],C=f.length-1,H=_$1({role:"error",content:p,errorTitle:d.errorTitle,errorMessage:p,errorDetails:h,errorTip:u,promptId:n},d.isRetryable?{isRetryable:true,originalPrompt:t,attachments:a}:{});return C>=0&&f[C].role==="model"?(f[C]=H,f):(f.push(H),f)});}systemPrompt=this.promptFactory.systemPrompt;static \u0275fac=function(t){return new(t||o)};static \u0275prov=T({token:o,factory:o.\u0275fac,providedIn:"root"})};export{M,_,ce as c};