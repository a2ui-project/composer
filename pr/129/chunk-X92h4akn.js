import {C,a7 as Bn,s as se$1,c as aB,y as yt,ae as Fze,aR as Kl,V as Pze,al as cn,aS as ba,af as Da,ag as Eh,v as he$1,Z as Zu,aT as Hn,u as Wr,X,aU as Xa,ap as y$1,aq as f,_ as Mt,aV as hv,ao as pv,P as Pd}from'./main.js';import {e}from'./chunk-CLNpRTgV.js';import {y,p,g,d}from'./chunk--7ZQOTwc.js';var ne=`[
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
`;var R="updateComponents",U="components",ge="registerMockRules",ye="mockRulesConfig",ve="rules",Se="id",be="children",re="mock_rules_container",w=class o{destroyRef=C(Bn);chatState=C(y);catalogManagement=C(se$1);startupConfigState=C(aB);previousCatalogId=null;isDraftModified=false;_activeDraft=yt("");activeDraft=this._activeDraft.asReadonly();_draftInput=yt("");constructor(){Fze(this.startupConfigState.selectedRendererId).pipe(Kl(1),Pze(this.destroyRef)).subscribe(()=>{this.flushDraft();}),Fze(this.catalogManagement.activeCatalog).pipe(cn(t=>!!t),Pze(this.destroyRef)).subscribe(t=>{let n=t.catalogId||t.$id||"",a=this.previousCatalogId===null,r=this.previousCatalogId!==null&&this.previousCatalogId!==n;if((a||r)&&!this.isDraftModified){let i=this.getInitialDraft(n);this._activeDraft.set(i),this._draftInput.set(i);}this.previousCatalogId=n;}),(this.startupConfigState.sharedA2uiPayload?Fze(this.startupConfigState.sharedA2uiPayload):ba(null)).pipe(cn(t=>!!t),Pze(this.destroyRef)).subscribe(t=>{this.injectExternalDraft(t);}),Fze(this._draftInput).pipe(Kl(1),Da(300),Eh(),Pze(this.destroyRef)).subscribe(t=>{this.syncLayoutToHistory(t);});}updateDraft(e){this.isDraftModified=true,this._activeDraft.set(e),this._draftInput.set(e);}injectExternalDraft(e){this.isDraftModified=true,this._activeDraft.set(e),this._draftInput.set(e);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(e){this.isDraftModified=true,this._activeDraft.set(e);}flushDraft(){this.isDraftModified=false,this.previousCatalogId=null;let e=this.catalogManagement.activeCatalog(),t=e&&(e.catalogId||e.$id)||"";!this.startupConfigState.activeRenderer()?.samplePayload&&!t&&(t="https://a2ui.org/specification/v0_9/basic_catalog.json");let a=this.getInitialDraft(t);this._activeDraft.set(a),this._draftInput.set(a);}getInitialDraft(e){let t=this.startupConfigState.activeRenderer();return t?.samplePayload?t.samplePayload:e==="https://a2ui.org/specification/v0_9/basic_catalog.json"?ne:e?p([{version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:e,sendDataModel:true}}]):""}syncLayoutToHistory(e){let t=this.sanitizeLayout(e);if(!t)return;let n=this.chatState.chatHistory();if(n.length===0){this.chatState.setChatHistory([{role:"user",content:t}]);return}let a=n[n.length-1];if(a.role==="user"&&a.content.trim().startsWith("[")){let i=[...n];i[i.length-1]={role:"user",content:t},this.chatState.setChatHistory(i);}else this.chatState.updateChatHistory(i=>[...i,{role:"user",content:t}]);}sanitizeLayout(e){let t=e.trim();if(!t)return "";let n=g(t);if(n.success){let a=n.data.map(r=>r&&typeof r=="object"&&!Array.isArray(r)?this.sanitizeBlock(r):r).filter(r=>r!==null);return p(a)}return console.warn("[StateSync] Discarding malformed layout JSON during sanitization: not a valid JSON array"),""}sanitizeBlock(e){if(e[ge]||e[ye])return null;if(e[R]&&typeof e[R]=="object"&&e[R]!==null){let t=e[R];if(Array.isArray(t[U])){let n=t[U].filter(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?a[Se]!==re:true);t[U]=n.map(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?this.sanitizeComponentObject(a):a);}}return e}sanitizeComponentObject(e){let t={};for(let[n,a]of Object.entries(e))n===ve||/^mock/i.test(n)||(n===be&&Array.isArray(a)?t[n]=a.filter(r=>r!==re):a!==null&&typeof a=="object"&&!Array.isArray(a)?t[n]=this.sanitizeComponentObject(a):Array.isArray(a)?t[n]=a.map(r=>r!==null&&typeof r=="object"&&!Array.isArray(r)?this.sanitizeComponentObject(r):r):t[n]=a);return t}static \u0275fac=function(t){return new(t||o)};static \u0275prov=he$1({token:o,factory:o.\u0275fac,providedIn:"root"})};var oe=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi,ie=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,se=/\s*●●●\s*$/g;function ce(o){return o.length>0&&o.some(e=>{if(e&&typeof e=="object"&&!Array.isArray(e)){let t=Object.keys(e);return t.includes("version")||t.includes("createSurface")||t.includes("updateComponents")||t.includes("updateDataModel")||t.includes("deleteSurface")}return  false})}var E=class o{PULSE_INDICATOR="\u25CF\u25CF\u25CF";appendPulse(e){return `${e??""} ${this.PULSE_INDICATOR}`}stripPulse(e){return e?(se.lastIndex=0,e.replace(se,"").trim()):""}stripThinkingTags(e){return e?(ie.lastIndex=0,e.replace(ie,"").trim()):""}extractCodeFences(e){if(!e)return {extracted:"",hasFences:false};oe.lastIndex=0;let t=Array.from(e.matchAll(oe));return t.length>0?{extracted:t.map(n=>n[1].trim()).join(`
`),hasFences:true}:{extracted:e.trim(),hasFences:false}}cleanPayload(e){if(!e)return "";let t=this.stripPulse(e);if(t=this.stripThinkingTags(t),t=this.extractCodeFences(t).extracted,!t.startsWith("{")&&!t.startsWith("[")){let a=Array.from(t.matchAll(/[\{\[]/g));for(let r of a)if(r.index!==void 0&&r.index>=0){let i=t.substring(r.index).trim();if(i.startsWith("{")&&i.includes('"version"')||i.startsWith("[")&&/^\[\s*[\{\"]/.test(i)&&(i.includes('"version"')||i.includes('"createSurface"')||i.includes('"updateComponents"'))){t=i;break}let l=g(i);if(l.success&&ce(l.data)){t=i;break}}}return t.trim()}isLayoutSnapshot(e){if(!e)return  false;let t=this.cleanPayload(e);if(t.startsWith('{"version"')||t.startsWith("{")&&t.includes('"version"')||t.startsWith("[")&&(t.includes('"version"')||t.includes('"createSurface"')||t.includes('"updateComponents"')))return  true;let n=g(t);return n.success&&ce(n.data)}static \u0275fac=function(t){return new(t||o)};static \u0275prov=he$1({token:o,factory:o.\u0275fac,providedIn:"root"})};function ue(o){if(o==null||o.trim().length===0)return {success:true,isConversational:true,blocks:[],count:0};let e=g(o);if(e.success)return {success:true,isConversational:false,blocks:e.data,count:F(e.data)};let t=o.trim();if(t.startsWith("{")||t.startsWith("[")){let s=le(o);if(s!==null&&typeof s=="object"){let c=Array.isArray(s)?s:[s];return {success:true,isConversational:false,blocks:c,count:F(c)}}}let a=o.split(`
`).map((s,c)=>({text:(s||"").trim(),originalIndex:c})).filter(s=>s.text.length>0),r=[],i=false,l=null;for(let s of a)if(!(s.text.startsWith("```")||!s.text.startsWith("{")&&!s.text.startsWith("["))){i=true;try{r.push(JSON.parse(s.text));}catch(c){let u=le(s.text);if(u!==null)r.push(u);else if(!l){let p=d(c,s.text);l={success:false,error:c?.message??"Syntax recovery failed",line:s.originalIndex+1,column:p.column,snippet:s.text};}}}if(r.length===0){if(l)return l;if(i){let s=e.error;return {success:false,error:s?.message??"Syntax recovery failed",line:s?.line,column:s?.column,snippet:s?.snippet}}return {success:true,isConversational:true,blocks:[],count:0}}return {success:true,isConversational:false,blocks:r,count:F(r)}}function le(o){if(o==null||o.trim().length===0)return null;let e=o.trim();if(e.length>256*1024)return null;e=e.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(e)}catch{for(let n=1;n<=5;n++)try{return JSON.parse(e+"}".repeat(n))}catch{}for(let n=1;n<=3;n++)for(let a=1;a<=3;a++)try{return JSON.parse(e+"}".repeat(n)+"]".repeat(a))}catch{}for(let n=1;n<=3;n++)for(let a=1;a<=3;a++)try{return JSON.parse(e+"]".repeat(n)+"}".repeat(a))}catch{}}return null}function Ce(o){if(!o||typeof o!="object")return  false;let e=o;if(!e.updateComponents||typeof e.updateComponents!="object")return  false;let t=e.updateComponents;return Array.isArray(t.components)}function pe(o,e){let t=false,n={};if(e)for(let r of Object.keys(e)){let i=r.toLowerCase().replace(/[^a-z]/g,"");n[i]=r;}let a={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let r of o){if(!Ce(r))continue;let i=r.updateComponents,l=[];for(let s of i.components){if(!s||typeof s!="object"||Array.isArray(s)){l.push(s);continue}let c=s,u=c.component;if(c.name&&!c.component&&(t=true,u=c.name,c.component=u,delete c.name),typeof u!="string")throw new Error("Component declaration is missing component type name string.");let p=u;if(e&&!e[u]){let d=u.toLowerCase().replace(/[^a-z]/g,""),g=n[d];if(!g){let f=a[d];f&&(g=n[f]);}if(g&&e[g])t=true,p=g;else {let f=d?Object.keys(e).find(I=>I.toLowerCase().includes(d)||d.includes(I.toLowerCase())):void 0;if(f)t=true,p=f;else throw new Error(`Validation failure: Component type "${u}" is not registered in the active custom catalog.`)}}let h=Ie(c);h.component=p,l.push(h);}i.components=l;}return t}function z(o){if(o===null||typeof o!="object")return o;if(Array.isArray(o))return o.map(n=>z(n));let e=o,t={};for(let[n,a]of Object.entries(e))n==="__proto__"||n==="constructor"||n==="prototype"||(t[n]=z(a));return t}function Ie(o){return z(o)}function F(o){return o.reduce((e,t)=>!t||typeof t!="object"?e:t.updateComponents&&Array.isArray(t.updateComponents.components)?e+t.updateComponents.components.length:t.createSurface?e+1:e,0)}function de(o){return o?!!(o.functions&&"callMcpTool"in o.functions||o.$defs&&("callMcpTool"in o.$defs||"catalog_callMcpTool"in o.$defs)):false}var P=class o{catalogManagement=C(se$1);mcpManager=C(pv);systemPrompt=Pd(()=>{let e=this.catalogManagement.activeCatalog(),n=de(e)?this.mcpManager.getActiveServersWithTools():[],a=this.buildMcpInstructions(n);return e?this.generateSystemPrompt(p(e))+a:`
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests\u2014whether provided as text instructions, UI wireframes, screenshots,
  or mockup images\u2014into valid A2UI v0.9 interactive user interfaces.
  ${a}
      `});buildMcpInstructions(e){let t=new Map;for(let r of e)for(let i of r.tools||[])t.has(i.name)||t.set(i.name,i);if(t.size===0)return "";let n={type:"object",properties:{content:{type:"array",items:{type:"object",properties:{type:{type:"string"},text:{type:"string"}}}}}};return `

  ## Available MCP Tools & Catalog Instructions

  When building surfaces that interact with MCP tools:

  1. Trigger MCP tools via button \`functionCall\` actions that chain \`updateDataModel\`, \`jmespath\`, and \`callMcpTool\`:
     \`\`\`json
     "action": {
       "functionCall": {
         "call": "updateDataModel",
         "args": {
           "updates": {
             "call": "jmespath",
             "args": {
               "expression": "{\\"/result\\": content[0].text}",
               "data": {
                 "call": "callMcpTool",
                 "args": {
                   "name": "<tool_name>",
                   "arguments": {
                     "path": "/mcp_arguments"
                   }
                 }
               }
             }
           }
         }
       }
     }
     \`\`\`

  ### Available MCP Tools
  ${Array.from(t.values()).map(r=>{let i=r.description?` - ${r.description}`:"",l=JSON.stringify(r.inputSchema||{type:"object",properties:{}}),s=JSON.stringify(r.outputSchema||n);return `- **\`${r.name}\`**${i}
  - **Input Schema**: \`${l}\`
  - **Output Schema**: \`${s}\``}).join(`
`)}
`}generateSystemPrompt(e$1){return `
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
  ${p(e)}
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
  `}static \u0275fac=function(t){return new(t||o)};static \u0275prov=he$1({token:o,factory:o.\u0275fac,providedIn:"root"})};var O=class o{isConnectivityError(e){return e?e.includes("failed to fetch")||e.includes("fetch")||e.includes("timeout")||e.includes("504")||e.includes("proxy")||e.includes("networkerror")||e.includes("connection")||e.includes("401")||e.includes("403")||e.includes("credential")||e.includes("quota")||e.includes("blocked")||e.includes("503")||e.includes("unavailable")||e.includes("api key")||e.includes("apikey"):false}parseError(e,t,n=false){let a=e??"",r=t??"",i="Connectivity Failure",l=r.trim().startsWith("{"),s=l?"A connectivity error occurred.":r,c=l?"Details: "+r:void 0,u="Tip: Please check your network proxy configurations or verify your settings to restore connections.",p=n,h=true,d=this.isConnectivityError(a);return a.includes("validation")||a.includes("syntax recovery")||a.includes("validation failure")?{errorTitle:"Validation Failure",errorMessage:"The generated layout contains invalid components or structure.",errorTip:"Tip: Try rephrasing your prompt to guide the model to generate valid components.",isRetryable:n,showDetails:true,errorDetails:"Details: "+r,isConnectivityFailure:d}:a.includes("503")||a.includes("unavailable")?{errorTitle:"Service Unavailable",errorMessage:"The generative service is temporarily unavailable. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:d}:a.includes("high demand")?{errorTitle:"Model High Demand",errorMessage:"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:d}:a.includes("timeout")||a.includes("504")?{errorTitle:"REST Gateway Timeout",errorMessage:"Remote generation service did not respond.",errorDetails:"Details: "+r,errorTip:u,isRetryable:p,showDetails:true,isConnectivityFailure:d}:a.includes("api key")||a.includes("apikey")?{errorTitle:"Invalid API Key",errorMessage:"The provided Gemini API key is invalid or missing.",errorDetails:"Details: "+r,errorTip:"Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.",isRetryable:p,showDetails:true,isConnectivityFailure:d}:a.includes("auth")||a.includes("401")||a.includes("403")||a.includes("credential")?{errorTitle:"Authentication Refused",errorMessage:"Authentication failed. Please verify your credentials in Settings.",errorDetails:"Details: "+r,errorTip:u,isRetryable:p,showDetails:true,isConnectivityFailure:d}:a.includes("quota")||a.includes("blocked")||a.includes("429")?{errorTitle:"GenAI Service Blocked",errorMessage:"Resource quota depleted or content safety limits triggered.",errorDetails:"Details: "+r,errorTip:u,isRetryable:p,showDetails:true,isConnectivityFailure:d}:{errorTitle:i,errorMessage:s,errorTip:u,isRetryable:p,showDetails:h,errorDetails:c,isConnectivityFailure:d}}static \u0275fac=function(t){return new(t||o)};static \u0275prov=he$1({token:o,factory:o.\u0275fac,providedIn:"root"})};function me(o){let e=/^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i,t=o.replace(e,"");if(t.startsWith("{"))try{let n=JSON.parse(t);if(n.error&&n.error.message)return n.error.message}catch{}return t}function L(o){if(!o)return o;let e=o.replace(/AIzaSy[A-Za-z0-9_-]+/g,"redacted for your protection");return e=e.replace(/(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(t,n,a)=>a.toLowerCase()==="redacted for your protection"?t:n+"redacted for your protection"),e=e.replace(/(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(t,n,a)=>a.toLowerCase()==="redacted for your protection"?t:n+"redacted for your protection"),e}var he=class o{catalogManagement=C(se$1);configProvider=C(Zu);stateSync=C(w);chatState=C(y);llmClient=C(Hn);errorLogger=C(Wr);chatCleaner=C(E);usageTrackingService=C(X);promptFactory=C(P);errorPresenter=C(O);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;currentTurnIndex=yt(0);activePromptId=null;constructor(){Fze(this.configProvider.rendererUrl).pipe(Kl(1),Pze()).subscribe(()=>{queueMicrotask(()=>this.wipeEnvironmentCache());});}wipeEnvironmentCache(){this.currentTurnIndex.set(0),this.activePromptId=null,this.chatState.setChatHistory([]),this.finalizeStream("idle"),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}finalizeStream(e="idle"){this.chatState.setPipelineStatus(e),this.chatState.setProgrammaticStreamActive(false);}getFullMessageContext(){return [{role:"system",content:this.promptFactory.systemPrompt()},...this.chatState.chatHistory().filter(e=>e.role!=="error")]}activeStreamResponse;isCancelRequested=false;cancelActiveStream(){this.isCancelRequested=true,this.activePromptId&&this.usageTrackingService.trackChatCancel({promptId:this.activePromptId,turnIndex:this.currentTurnIndex(),pipelineStatus:this.pipelineStatus()}),this.activeStreamResponse&&this.activeStreamResponse.cancel&&this.activeStreamResponse.cancel();}emitPromptTracking(e,t,n){let a=!!n?.retryOfPromptId,r=n?.promptTurnIndex??this.currentTurnIndex()+1;this.currentTurnIndex.set(r);let i=this.catalogManagement.activeCatalog(),l=i&&(i.catalogId||i.$id)||"",s=t.some(u=>u.name==="screenshot.png"||u.mimeType?.startsWith("image/")),c=t.filter(u=>u.name!=="screenshot.png"&&!u.mimeType?.startsWith("image/"));return a?this.usageTrackingService.trackChatRetry({promptId:n?.promptId,catalogId:l,turnIndex:r,attemptNumber:2,retryOfPromptId:n?.retryOfPromptId}):this.usageTrackingService.trackChatPrompt({promptId:n?.promptId,catalogId:l,turnType:r===1?"initial":"followup",turnIndex:r,attemptNumber:1,hasScreenshot:s,attachmentCount:c.length})}async submitPrompt(e,t=[],n){if(this.chatState.isProgrammaticStreamActive()){console.warn("[ChatCoordinator] Blocked submitPrompt: programmatic stream is active.");return}let a=e.trim();if(!a&&t.length===0)return;let r=this.emitPromptTracking(a,t,n);this.activePromptId=r,this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(l=>[...l,{role:"user",content:a,attachments:t.length>0?t:void 0,promptId:r}]);let i=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",i),this.chatState.updateChatHistory(l=>[...l,{role:"model",content:this.chatCleaner.appendPulse("")}]);try{this.isCancelRequested=!1;let l=await this.llmClient.chatStream(i);if(this.isCancelRequested){l.cancel&&l.cancel();let p=new Error("Cancelled");throw p.name=Xa,p}this.activeStreamResponse=l;let s="",c="";for await(let p of l.contentStream)s+=p.content,p.thinking&&(c+=p.thinking),this.chatState.updateChatHistory(h=>{let d=[...h],g=d.length-1;return d[g]?.role==="model"&&(d[g]={role:"model",content:this.chatCleaner.appendPulse(s),thinking:c}),d});let u=await l.complete;this.chatState.addRawLlmLog("LLM_RESPONSE",u),this.chatState.updateChatHistory(p=>{let h=[...p],d=h.length-1;return h[d]?.role==="model"&&(h[d]={role:"model",content:u,thinking:c}),h}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(u,r);}catch(l){l&&typeof l=="object"&&"name"in l&&l.name===Xa?(this.finalizeStream("idle"),this.chatState.updateChatHistory(s=>{let c=[...s],u=c.length-1;return c[u]?.role==="model"&&(c[u]=y$1(f({},c[u]),{content:"*You stopped this response.*"})),c})):this.handleConnectivityError(l,a,t,r);}finally{this.activeStreamResponse=void 0;}}async processRawLlmPayload(e,t){let n=[],a=0;try{this.chatCleaner.extractCodeFences(e).hasFences&&this.chatState.setPipelineStatus("healing");let r=this.chatCleaner.cleanPayload(e),i=ue(r);if(i.success&&i.isConversational){this.finalizeStream("idle");return}if(!i.success){let l=t?`[prompt:${t}] `:"";this.errorLogger.error({sourceTag:"[ChatParser]",message:`${l}${i.error}`,line:i.line,column:i.column,snippet:i.snippet}),this.chatState.updateChatHistory(s=>{let c=[...s],u=c.length-1;return c[u]?.role==="model"&&(c[u]=y$1(f({},c[u]),{parseError:i})),c}),this.finalizeStream("idle");return}n=i.blocks,a=i.count;}catch(r){throw this.finalizeStream("failed"),r}this.chatState.setPipelineStatus("validating");try{let r={type:Mt.RENDER_A2UI,payload:n},i=[];if(!hv.validateOutgoingMessage(r,i))throw new Error(`Outgoing message envelope validation failed:
${i.join(`
`)}`);pe(n,this.catalogManagement.activeCatalog()?.components)&&this.chatState.setPipelineStatus("healing"),this.chatState.setPipelineStatus("ready");let c=p(n);this.chatState.updateChatHistory(u=>{let p=[...u],h=p.length-1;return p[h]?.role==="model"&&(p[h]=y$1(f({},p[h]),{content:c,isSnapshot:!0,componentCount:a})),p}),this.stateSync.commitLayoutFromLlm(c),this.chatState.setProgrammaticStreamActive(!1);}catch(r){throw this.finalizeStream("failed"),r}}handleConnectivityError(e,t,n=[],a){let r=e instanceof Error?e.message:String(e),i=r.toLowerCase(),l=me(r);this.errorPresenter.isConnectivityError(i)?this.finalizeStream("idle"):this.finalizeStream("failed");let s=this.errorPresenter.parseError(i,l,!!t),c="";e instanceof Error?c="Exception: "+e.message+`
Stack: `+(e.stack||"None"):c="Unknown Exception: "+JSON.stringify(e);let u="";s.errorDetails&&(u+=s.errorDetails+`

`),u+=c;let p=L(s.errorMessage),h=s.showDetails?L(u):void 0,d=s.showDetails?L(s.errorTip):void 0;console.error("Gemini chat execution failed:",e),this.chatState.updateChatHistory(g=>{let f$1=[...g],I=f$1.length-1,H=f({role:"error",content:p,errorTitle:s.errorTitle,errorMessage:p,errorDetails:h,errorTip:d,promptId:a},s.isRetryable?{isRetryable:true,originalPrompt:t,attachments:n}:{});return I>=0&&f$1[I].role==="model"?(f$1[I]=H,f$1):(f$1.push(H),f$1)});}systemPrompt=this.promptFactory.systemPrompt;static \u0275fac=function(t){return new(t||o)};static \u0275prov=he$1({token:o,factory:o.\u0275fac,providedIn:"root"})};export{E,de as d,he as h,ue as u,w};