import {C,a7 as Bn,s as se$1,u as uB,y as yt,ae as Fze,aT as Kl,_ as Pze,al as cn,aU as ba,af as Da,ag as wh,v as he$1,Z as Zu,aV as Hn,t as Wr,X,aW as Xa,ap as y$1,aq as f,$ as Mt,aX as hv,ao as pv,z as zs,P as Pd}from'./main.js';import {e}from'./chunk-CLNpRTgV.js';import {y,p,g,d}from'./chunk--7ZQOTwc.js';var re=`[
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
`;var P="updateComponents",F="components",ge="registerMockRules",ye="mockRulesConfig",ve="rules",Se="id",Ie="children",oe="mock_rules_container",w=class i{destroyRef=C(Bn);chatState=C(y);catalogManagement=C(se$1);startupConfigState=C(uB);previousCatalogId=null;isDraftModified=false;_activeDraft=yt("");activeDraft=this._activeDraft.asReadonly();_draftInput=yt("");constructor(){Fze(this.startupConfigState.selectedRendererId).pipe(Kl(1),Pze(this.destroyRef)).subscribe(()=>{this.flushDraft();}),Fze(this.catalogManagement.activeCatalog).pipe(cn(t=>!!t),Pze(this.destroyRef)).subscribe(t=>{let a=t.catalogId||t.$id||"",n=this.previousCatalogId===null,r=this.previousCatalogId!==null&&this.previousCatalogId!==a;if((n||r)&&!this.isDraftModified){let o=this.getInitialDraft(a);this._activeDraft.set(o),this._draftInput.set(o);}this.previousCatalogId=a;}),(this.startupConfigState.sharedA2uiPayload?Fze(this.startupConfigState.sharedA2uiPayload):ba(null)).pipe(cn(t=>!!t),Pze(this.destroyRef)).subscribe(t=>{this.injectExternalDraft(t);}),Fze(this._draftInput).pipe(Kl(1),Da(300),wh(),Pze(this.destroyRef)).subscribe(t=>{this.syncLayoutToHistory(t);});}updateDraft(e){this.isDraftModified=true,this._activeDraft.set(e),this._draftInput.set(e);}injectExternalDraft(e){this.isDraftModified=true,this._activeDraft.set(e),this._draftInput.set(e);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(e){this.isDraftModified=true,this._activeDraft.set(e);}flushDraft(){this.isDraftModified=false,this.previousCatalogId=null;let e=this.catalogManagement.activeCatalog(),t=e&&(e.catalogId||e.$id)||"";!this.startupConfigState.activeRenderer()?.samplePayload&&!t&&(t="https://a2ui.org/specification/v0_9/basic_catalog.json");let n=this.getInitialDraft(t);this._activeDraft.set(n),this._draftInput.set(n);}getInitialDraft(e){let t=this.startupConfigState.activeRenderer();return t?.samplePayload?t.samplePayload:e==="https://a2ui.org/specification/v0_9/basic_catalog.json"?re:e?p([{version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:e,sendDataModel:true}}]):""}syncLayoutToHistory(e){let t=this.sanitizeLayout(e);if(!t)return;let a=this.chatState.chatHistory();if(a.length===0){this.chatState.setChatHistory([{role:"user",content:t}]);return}let n=a[a.length-1];if(n.role==="user"&&n.content.trim().startsWith("[")){let o=[...a];o[o.length-1]={role:"user",content:t},this.chatState.setChatHistory(o);}else this.chatState.updateChatHistory(o=>[...o,{role:"user",content:t}]);}sanitizeLayout(e){let t=e.trim();if(!t)return "";let a=g(t);if(a.success){let n=a.data.map(r=>r&&typeof r=="object"&&!Array.isArray(r)?this.sanitizeBlock(r):r).filter(r=>r!==null);return p(n)}return console.warn("[StateSync] Discarding malformed layout JSON during sanitization: not a valid JSON array"),""}sanitizeBlock(e){if(e[ge]||e[ye])return null;if(e[P]&&typeof e[P]=="object"&&e[P]!==null){let t=e[P];if(Array.isArray(t[F])){let a=t[F].filter(n=>n!==null&&typeof n=="object"&&!Array.isArray(n)?n[Se]!==oe:true);t[F]=a.map(n=>n!==null&&typeof n=="object"&&!Array.isArray(n)?this.sanitizeComponentObject(n):n);}}return e}sanitizeComponentObject(e){let t={};for(let[a,n]of Object.entries(e))a===ve||/^mock/i.test(a)||(a===Ie&&Array.isArray(n)?t[a]=n.filter(r=>r!==oe):n!==null&&typeof n=="object"&&!Array.isArray(n)?t[a]=this.sanitizeComponentObject(n):Array.isArray(n)?t[a]=n.map(r=>r!==null&&typeof r=="object"&&!Array.isArray(r)?this.sanitizeComponentObject(r):r):t[a]=n);return t}static \u0275fac=function(t){return new(t||i)};static \u0275prov=he$1({token:i,factory:i.\u0275fac,providedIn:"root"})};var ie=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi,se=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,ce=/\s*●●●\s*$/g;function le(i){return i.length>0&&i.some(e=>{if(e&&typeof e=="object"&&!Array.isArray(e)){let t=Object.keys(e);return t.includes("version")||t.includes("createSurface")||t.includes("updateComponents")||t.includes("updateDataModel")||t.includes("deleteSurface")}return  false})}var E=class i{PULSE_INDICATOR="\u25CF\u25CF\u25CF";appendPulse(e){return `${e??""} ${this.PULSE_INDICATOR}`}stripPulse(e){return e?(ce.lastIndex=0,e.replace(ce,"").trim()):""}stripThinkingTags(e){return e?(se.lastIndex=0,e.replace(se,"").trim()):""}extractCodeFences(e){if(!e)return {extracted:"",hasFences:false};ie.lastIndex=0;let t=Array.from(e.matchAll(ie));return t.length>0?{extracted:t.map(a=>a[1].trim()).join(`
`),hasFences:true}:{extracted:e.trim(),hasFences:false}}cleanPayload(e){if(!e)return "";let t=this.stripPulse(e);if(t=this.stripThinkingTags(t),t=this.extractCodeFences(t).extracted,!t.startsWith("{")&&!t.startsWith("[")){let n=Array.from(t.matchAll(/[\{\[]/g));for(let r of n)if(r.index!==void 0&&r.index>=0){let o=t.substring(r.index).trim();if(o.startsWith("{")&&o.includes('"version"')||o.startsWith("[")&&/^\[\s*[\{\"]/.test(o)&&(o.includes('"version"')||o.includes('"createSurface"')||o.includes('"updateComponents"'))){t=o;break}let l=g(o);if(l.success&&le(l.data)){t=o;break}}}return t.trim()}isLayoutSnapshot(e){if(!e)return  false;let t=this.cleanPayload(e);if(t.startsWith('{"version"')||t.startsWith("{")&&t.includes('"version"')||t.startsWith("[")&&(t.includes('"version"')||t.includes('"createSurface"')||t.includes('"updateComponents"')))return  true;let a=g(t);return a.success&&le(a.data)}static \u0275fac=function(t){return new(t||i)};static \u0275prov=he$1({token:i,factory:i.\u0275fac,providedIn:"root"})};function pe(i){if(i==null||i.trim().length===0)return {success:true,isConversational:true,blocks:[],count:0};let e=g(i);if(e.success)return {success:true,isConversational:false,blocks:e.data,count:z(e.data)};let t=i.trim();if(t.startsWith("{")||t.startsWith("[")){let s=ue(i);if(s!==null&&typeof s=="object"){let c=Array.isArray(s)?s:[s];return {success:true,isConversational:false,blocks:c,count:z(c)}}}let n=i.split(`
`).map((s,c)=>({text:(s||"").trim(),originalIndex:c})).filter(s=>s.text.length>0),r=[],o=false,l=null;for(let s of n)if(!(s.text.startsWith("```")||!s.text.startsWith("{")&&!s.text.startsWith("["))){o=true;try{r.push(JSON.parse(s.text));}catch(c){let u=ue(s.text);if(u!==null)r.push(u);else if(!l){let p=d(c,s.text);l={success:false,error:c?.message??"Syntax recovery failed",line:s.originalIndex+1,column:p.column,snippet:s.text};}}}if(r.length===0){if(l)return l;if(o){let s=e.error;return {success:false,error:s?.message??"Syntax recovery failed",line:s?.line,column:s?.column,snippet:s?.snippet}}return {success:true,isConversational:true,blocks:[],count:0}}return {success:true,isConversational:false,blocks:r,count:z(r)}}function ue(i){if(i==null||i.trim().length===0)return null;let e=i.trim();if(e.length>256*1024)return null;e=e.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(e)}catch{for(let a=1;a<=5;a++)try{return JSON.parse(e+"}".repeat(a))}catch{}for(let a=1;a<=3;a++)for(let n=1;n<=3;n++)try{return JSON.parse(e+"}".repeat(a)+"]".repeat(n))}catch{}for(let a=1;a<=3;a++)for(let n=1;n<=3;n++)try{return JSON.parse(e+"]".repeat(a)+"}".repeat(n))}catch{}}return null}function Ce(i){if(!i||typeof i!="object")return  false;let e=i;if(!e.updateComponents||typeof e.updateComponents!="object")return  false;let t=e.updateComponents;return Array.isArray(t.components)}function de(i,e){let t=false,a={};if(e)for(let r of Object.keys(e)){let o=r.toLowerCase().replace(/[^a-z]/g,"");a[o]=r;}let n={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let r of i){if(!Ce(r))continue;let o=r.updateComponents,l=[];for(let s of o.components){if(!s||typeof s!="object"||Array.isArray(s)){l.push(s);continue}let c=s,u=c.component;if(c.name&&!c.component&&(t=true,u=c.name,c.component=u,delete c.name),typeof u!="string")throw new Error("Component declaration is missing component type name string.");let p=u;if(e&&!e[u]){let d=u.toLowerCase().replace(/[^a-z]/g,""),g=a[d];if(!g){let f=n[d];f&&(g=a[f]);}if(g&&e[g])t=true,p=g;else {let f=d?Object.keys(e).find(k=>k.toLowerCase().includes(d)||d.includes(k.toLowerCase())):void 0;if(f)t=true,p=f;else throw new Error(`Validation failure: Component type "${u}" is not registered in the active custom catalog.`)}}let h=be(c);h.component=p,l.push(h);}o.components=l;}return t}function J(i){if(i===null||typeof i!="object")return i;if(Array.isArray(i))return i.map(a=>J(a));let e=i,t={};for(let[a,n]of Object.entries(e))a==="__proto__"||a==="constructor"||a==="prototype"||(t[a]=J(n));return t}function be(i){return J(i)}function z(i){return i.reduce((e,t)=>!t||typeof t!="object"?e:t.updateComponents&&Array.isArray(t.updateComponents.components)?e+t.updateComponents.components.length:t.createSurface?e+1:e,0)}var O=class i{catalogManagement=C(se$1);mcpManager=C(pv);localStorageInteractions=C(zs);customInstructionsState=yt(this.loadInitialState());presets=Pd(()=>this.customInstructionsState().presets);activePresetId=Pd(()=>this.customInstructionsState().activePresetId);activePreset=Pd(()=>{let e=this.customInstructionsState();return e.presets.find(t=>t.id===e.activePresetId)??null});customInstructions=Pd(()=>this.activePreset()?.content??"");hasCustomInstructions=Pd(()=>this.customInstructions().trim().length>0);systemPrompt=Pd(()=>{let e=this.catalogManagement.activeCatalog(),a=this.mcpManager.doesCatalogSupportMcp(e)?this.mcpManager.getActiveServersWithTools():[],n=this.buildMcpInstructions(a),r=this.customInstructions().trim(),o=r?`

## Custom User Instructions

${r}`:"";return e?(this.generateSystemPrompt(p(e))+n).trimEnd()+o:`
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests\u2014whether provided as text instructions, UI wireframes, screenshots,
  or mockup images\u2014into valid A2UI v0.9 interactive user interfaces.
  ${n}
      `.trimEnd()+o});setCustomInstructionsState(e){let t=e.presets.some(n=>n.id===e.activePresetId),a={presets:e.presets,activePresetId:t?e.activePresetId:null};this.customInstructionsState.set(a),this.localStorageInteractions.setItem("a2ui_composer_custom_instructions",JSON.stringify(a));}loadInitialState(){let e=this.localStorageInteractions.getItem("a2ui_composer_custom_instructions");if(!e)return {presets:[],activePresetId:null};try{let t=JSON.parse(e);if(!t||!Array.isArray(t.presets))return {presets:[],activePresetId:null};let a=t.presets.filter(r=>typeof r=="object"&&r!==null&&typeof r.id=="string"&&typeof r.name=="string"&&typeof r.content=="string"),n=typeof t.activePresetId=="string"&&a.some(r=>r.id===t.activePresetId)?t.activePresetId:null;return {presets:a,activePresetId:n}}catch{return {presets:[],activePresetId:null}}}buildMcpInstructions(e){let t=new Map;for(let r of e)for(let o of r.tools||[])t.has(o.name)||t.set(o.name,o);if(t.size===0)return "";let a={type:"object",properties:{content:{type:"array",items:{type:"object",properties:{type:{type:"string"},text:{type:"string"}}}}}};return `

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
  ${Array.from(t.values()).map(r=>{let o=r.description?` - ${r.description}`:"",l=JSON.stringify(r.inputSchema||{type:"object",properties:{}}),s=JSON.stringify(r.outputSchema||a);return `- **\`${r.name}\`**${o}
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
  `}static \u0275fac=function(t){return new(t||i)};static \u0275prov=he$1({token:i,factory:i.\u0275fac,providedIn:"root"})};var L=class i{isConnectivityError(e){return e?e.includes("failed to fetch")||e.includes("fetch")||e.includes("timeout")||e.includes("504")||e.includes("proxy")||e.includes("networkerror")||e.includes("connection")||e.includes("401")||e.includes("403")||e.includes("credential")||e.includes("quota")||e.includes("blocked")||e.includes("503")||e.includes("unavailable")||e.includes("api key")||e.includes("apikey"):false}parseError(e,t,a=false){let n=e??"",r=t??"",o="Connectivity Failure",l=r.trim().startsWith("{"),s=l?"A connectivity error occurred.":r,c=l?"Details: "+r:void 0,u="Tip: Please check your network proxy configurations or verify your settings to restore connections.",p=a,h=true,d=this.isConnectivityError(n);return n.includes("validation")||n.includes("syntax recovery")||n.includes("validation failure")?{errorTitle:"Validation Failure",errorMessage:"The generated layout contains invalid components or structure.",errorTip:"Tip: Try rephrasing your prompt to guide the model to generate valid components.",isRetryable:a,showDetails:true,errorDetails:"Details: "+r,isConnectivityFailure:d}:n.includes("503")||n.includes("unavailable")?{errorTitle:"Service Unavailable",errorMessage:"The generative service is temporarily unavailable. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:d}:n.includes("high demand")?{errorTitle:"Model High Demand",errorMessage:"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:d}:n.includes("timeout")||n.includes("504")?{errorTitle:"REST Gateway Timeout",errorMessage:"Remote generation service did not respond.",errorDetails:"Details: "+r,errorTip:u,isRetryable:p,showDetails:true,isConnectivityFailure:d}:n.includes("api key")||n.includes("apikey")?{errorTitle:"Invalid API Key",errorMessage:"The provided Gemini API key is invalid or missing.",errorDetails:"Details: "+r,errorTip:"Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.",isRetryable:p,showDetails:true,isConnectivityFailure:d}:n.includes("auth")||n.includes("401")||n.includes("403")||n.includes("credential")?{errorTitle:"Authentication Refused",errorMessage:"Authentication failed. Please verify your credentials in Settings.",errorDetails:"Details: "+r,errorTip:u,isRetryable:p,showDetails:true,isConnectivityFailure:d}:n.includes("quota")||n.includes("blocked")||n.includes("429")?{errorTitle:"GenAI Service Blocked",errorMessage:"Resource quota depleted or content safety limits triggered.",errorDetails:"Details: "+r,errorTip:u,isRetryable:p,showDetails:true,isConnectivityFailure:d}:{errorTitle:o,errorMessage:s,errorTip:u,isRetryable:p,showDetails:h,errorDetails:c,isConnectivityFailure:d}}static \u0275fac=function(t){return new(t||i)};static \u0275prov=he$1({token:i,factory:i.\u0275fac,providedIn:"root"})};function me(i){let e=/^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i,t=i.replace(e,"");if(t.startsWith("{"))try{let a=JSON.parse(t);if(a.error&&a.error.message)return a.error.message}catch{}return t}function N(i){if(!i)return i;let e=i.replace(/AIzaSy[A-Za-z0-9_-]+/g,"redacted for your protection");return e=e.replace(/(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(t,a,n)=>n.toLowerCase()==="redacted for your protection"?t:a+"redacted for your protection"),e=e.replace(/(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(t,a,n)=>n.toLowerCase()==="redacted for your protection"?t:a+"redacted for your protection"),e}var he=class i{catalogManagement=C(se$1);configProvider=C(Zu);stateSync=C(w);chatState=C(y);llmClient=C(Hn);errorLogger=C(Wr);chatCleaner=C(E);usageTrackingService=C(X);promptFactory=C(O);errorPresenter=C(L);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;currentTurnIndex=yt(0);systemPrompt=this.promptFactory.systemPrompt;activePromptId=null;constructor(){Fze(this.configProvider.rendererUrl).pipe(Kl(1),Pze()).subscribe(()=>{queueMicrotask(()=>this.wipeEnvironmentCache());});}wipeEnvironmentCache(){this.currentTurnIndex.set(0),this.activePromptId=null,this.chatState.setChatHistory([]),this.finalizeStream("idle"),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}finalizeStream(e="idle"){this.chatState.setPipelineStatus(e),this.chatState.setProgrammaticStreamActive(false);}getFullMessageContext(){return [{role:"system",content:this.promptFactory.systemPrompt()},...this.chatState.chatHistory().filter(e=>e.role!=="error")]}activeStreamResponse;isCancelRequested=false;cancelActiveStream(){this.isCancelRequested=true,this.activePromptId&&this.usageTrackingService.trackChatCancel({promptId:this.activePromptId,turnIndex:this.currentTurnIndex(),pipelineStatus:this.pipelineStatus()}),this.activeStreamResponse&&this.activeStreamResponse.cancel&&this.activeStreamResponse.cancel();}emitPromptTracking(e,t,a){let n=!!a?.retryOfPromptId,r=a?.promptTurnIndex??this.currentTurnIndex()+1;this.currentTurnIndex.set(r);let o=this.catalogManagement.activeCatalog(),l=o&&(o.catalogId||o.$id)||"",s=t.some(u=>u.name==="screenshot.png"||u.mimeType?.startsWith("image/")),c=t.filter(u=>u.name!=="screenshot.png"&&!u.mimeType?.startsWith("image/"));return n?this.usageTrackingService.trackChatRetry({promptId:a?.promptId,catalogId:l,turnIndex:r,attemptNumber:2,retryOfPromptId:a?.retryOfPromptId}):this.usageTrackingService.trackChatPrompt({promptId:a?.promptId,catalogId:l,turnType:r===1?"initial":"followup",turnIndex:r,attemptNumber:1,hasScreenshot:s,attachmentCount:c.length})}async submitPrompt(e,t=[],a){if(this.chatState.isProgrammaticStreamActive()){console.warn("[ChatCoordinator] Blocked submitPrompt: programmatic stream is active.");return}let n=e.trim();if(!n&&t.length===0)return;let r=this.emitPromptTracking(n,t,a);this.activePromptId=r,this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(l=>[...l,{role:"user",content:n,attachments:t.length>0?t:void 0,promptId:r}]);let o=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",o),this.chatState.updateChatHistory(l=>[...l,{role:"model",content:this.chatCleaner.appendPulse("")}]);try{this.isCancelRequested=!1;let l=await this.llmClient.chatStream(o);if(this.isCancelRequested){l.cancel&&l.cancel();let p=new Error("Cancelled");throw p.name=Xa,p}this.activeStreamResponse=l;let s="",c="";for await(let p of l.contentStream)s+=p.content,p.thinking&&(c+=p.thinking),this.chatState.updateChatHistory(h=>{let d=[...h],g=d.length-1;return d[g]?.role==="model"&&(d[g]={role:"model",content:this.chatCleaner.appendPulse(s),thinking:c}),d});let u=await l.complete;this.chatState.addRawLlmLog("LLM_RESPONSE",u),this.chatState.updateChatHistory(p=>{let h=[...p],d=h.length-1;return h[d]?.role==="model"&&(h[d]={role:"model",content:u,thinking:c}),h}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(u,r);}catch(l){l&&typeof l=="object"&&"name"in l&&l.name===Xa?(this.finalizeStream("idle"),this.chatState.updateChatHistory(s=>{let c=[...s],u=c.length-1;return c[u]?.role==="model"&&(c[u]=y$1(f({},c[u]),{content:"*You stopped this response.*"})),c})):this.handleConnectivityError(l,n,t,r);}finally{this.activeStreamResponse=void 0;}}async processRawLlmPayload(e,t){let a=[],n=0;try{this.chatCleaner.extractCodeFences(e).hasFences&&this.chatState.setPipelineStatus("healing");let r=this.chatCleaner.cleanPayload(e),o=pe(r);if(o.success&&o.isConversational){this.finalizeStream("idle");return}if(!o.success){let l=t?`[prompt:${t}] `:"";this.errorLogger.error({sourceTag:"[ChatParser]",message:`${l}${o.error}`,line:o.line,column:o.column,snippet:o.snippet}),this.chatState.updateChatHistory(s=>{let c=[...s],u=c.length-1;return c[u]?.role==="model"&&(c[u]=y$1(f({},c[u]),{parseError:o})),c}),this.finalizeStream("idle");return}a=o.blocks,n=o.count;}catch(r){throw this.finalizeStream("failed"),r}this.chatState.setPipelineStatus("validating");try{let r={type:Mt.RENDER_A2UI,payload:a},o=[];if(!hv.validateOutgoingMessage(r,o))throw new Error(`Outgoing message envelope validation failed:
${o.join(`
`)}`);de(a,this.catalogManagement.activeCatalog()?.components)&&this.chatState.setPipelineStatus("healing"),this.chatState.setPipelineStatus("ready");let c=p(a);this.chatState.updateChatHistory(u=>{let p=[...u],h=p.length-1;return p[h]?.role==="model"&&(p[h]=y$1(f({},p[h]),{content:c,isSnapshot:!0,componentCount:n})),p}),this.stateSync.commitLayoutFromLlm(c),this.chatState.setProgrammaticStreamActive(!1);}catch(r){throw this.finalizeStream("failed"),r}}handleConnectivityError(e,t,a=[],n){let r=e instanceof Error?e.message:String(e),o=r.toLowerCase(),l=me(r);this.errorPresenter.isConnectivityError(o)?this.finalizeStream("idle"):this.finalizeStream("failed");let s=this.errorPresenter.parseError(o,l,!!t),c="";e instanceof Error?c="Exception: "+e.message+`
Stack: `+(e.stack||"None"):c="Unknown Exception: "+JSON.stringify(e);let u="";s.errorDetails&&(u+=s.errorDetails+`

`),u+=c;let p=N(s.errorMessage),h=s.showDetails?N(u):void 0,d=s.showDetails?N(s.errorTip):void 0;console.error("Gemini chat execution failed:",e),this.chatState.updateChatHistory(g=>{let f$1=[...g],k=f$1.length-1,H=f({role:"error",content:p,errorTitle:s.errorTitle,errorMessage:p,errorDetails:h,errorTip:d,promptId:n},s.isRetryable?{isRetryable:true,originalPrompt:t,attachments:a}:{});return k>=0&&f$1[k].role==="model"?(f$1[k]=H,f$1):(f$1.push(H),f$1)});}static \u0275fac=function(t){return new(t||i)};static \u0275prov=he$1({token:i,factory:i.\u0275fac,providedIn:"root"})};export{E,O,he as h,pe as p,w};