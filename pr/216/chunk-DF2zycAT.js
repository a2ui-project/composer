import {K as K$1}from'./chunk-DKv1NMqd.js';import {C,a7 as hn,s as se$1,a as LB,B as Bt,ae as u$e,bE as Cd,_ as l$e,al as Qt,bu as wa,af as Ia,ag as dm,q as ge,J as Jl,bF as NF,W as Wr,X as X$1,bG as gAe,ap as s$1,aq as r,$ as $t,bH as c_,bI as hr,bJ as iAe,ao as a_,L as Ls,u as uf,h as hv,R as u3,aS as Ne$1,G as Ga,bK as ide,bL as T,ad as S}from'./main.js';import {e}from'./chunk-CLNpRTgV.js';import {y,p,g,d}from'./chunk-ChVFZ7RU.js';var De=`[
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
`;var W="updateComponents",oe="components",He="registerMockRules",Ge="mockRulesConfig",We="rules",qe="id",Be="children",Pe="mock_rules_container",q=class s{destroyRef=C(hn);chatState=C(y);catalogManagement=C(se$1);startupConfigState=C(LB);previousCatalogId=null;isDraftModified=false;lastSynchronizedLayout=null;_activeDraft=Bt("");activeDraft=this._activeDraft.asReadonly();_draftInput=Bt("");constructor(){u$e(this.startupConfigState.selectedRendererId).pipe(Cd(1),l$e(this.destroyRef)).subscribe(()=>{this.flushDraft();}),u$e(this.catalogManagement.activeCatalog).pipe(Qt(t=>!!t),l$e(this.destroyRef)).subscribe(t=>{let r=t.catalogId||t.$id||"",n=this.previousCatalogId===null,o=this.previousCatalogId!==null&&this.previousCatalogId!==r;if((n||o)&&!this.isDraftModified){let i=this.getInitialDraft(r);this._activeDraft.set(i),this._draftInput.set(i);}this.previousCatalogId=r;}),(this.startupConfigState.sharedA2uiPayload?u$e(this.startupConfigState.sharedA2uiPayload):wa(null)).pipe(Qt(t=>!!t),l$e(this.destroyRef)).subscribe(t=>{this.injectExternalDraft(t);}),u$e(this._draftInput).pipe(Cd(1),Ia(300),dm(),l$e(this.destroyRef)).subscribe(t=>{this.syncLayoutToHistory(t);});}updateDraft(e){this.isDraftModified=true,this._activeDraft.set(e),this._draftInput.set(e);}injectExternalDraft(e){this.isDraftModified=true,this._activeDraft.set(e),this._draftInput.set(e);}syncActiveDraftToHistory(){this.syncLayoutToHistory(this._activeDraft());}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(e){this.isDraftModified=true,this.lastSynchronizedLayout=null,this._activeDraft.set(e);}flushDraft(){this.isDraftModified=false,this.lastSynchronizedLayout=null,this.previousCatalogId=null;let e=this.catalogManagement.activeCatalog(),t=e&&(e.catalogId||e.$id)||"";!this.startupConfigState.activeRenderer()?.samplePayload&&!t&&(t="https://a2ui.org/specification/v0_9/basic_catalog.json");let n=this.getInitialDraft(t);this._activeDraft.set(n),this._draftInput.set(n);}getInitialDraft(e){let t=this.startupConfigState.activeRenderer();return t?.samplePayload?t.samplePayload:e==="https://a2ui.org/specification/v0_9/basic_catalog.json"?De:e?p([{version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:e,sendDataModel:true}}]):""}syncLayoutToHistory(e){if(e!==this._activeDraft())return;let t=this.sanitizeLayout(e);if(!t)return;let r=this.chatState.chatHistory();if(r.length>0&&t===this.lastSynchronizedLayout)return;if(this.lastSynchronizedLayout=t,r.length===0){this.chatState.setChatHistory([{role:"user",content:t}]);return}let n=r[r.length-1];if(n.role==="user"&&n.content.trim().startsWith("[")){let i=[...r];i[i.length-1]={role:"user",content:t},this.chatState.setChatHistory(i);}else this.chatState.updateChatHistory(i=>[...i,{role:"user",content:t}]);}sanitizeLayout(e){let t=e.trim();if(!t)return "";let r=g(t);if(r.success){let n=r.data.map(o=>o&&typeof o=="object"&&!Array.isArray(o)?this.sanitizeBlock(o):o).filter(o=>o!==null);return p(n)}return console.warn("[StateSync] Discarding malformed layout JSON during sanitization: not a valid JSON array"),""}sanitizeBlock(e){if(e[He]||e[Ge])return null;if(e[W]&&typeof e[W]=="object"&&e[W]!==null){let t=e[W];if(Array.isArray(t[oe])){let r=t[oe].filter(n=>n!==null&&typeof n=="object"&&!Array.isArray(n)?n[qe]!==Pe:true);t[oe]=r.map(n=>n!==null&&typeof n=="object"&&!Array.isArray(n)?this.sanitizeComponentObject(n):n);}}return e}sanitizeComponentObject(e){let t={};for(let[r,n]of Object.entries(e))r===We||/^mock/i.test(r)||(r===Be&&Array.isArray(n)?t[r]=n.filter(o=>o!==Pe):n!==null&&typeof n=="object"&&!Array.isArray(n)?t[r]=this.sanitizeComponentObject(n):Array.isArray(n)?t[r]=n.map(o=>o!==null&&typeof o=="object"&&!Array.isArray(o)?this.sanitizeComponentObject(o):o):t[r]=n);return t}static \u0275fac=function(t){return new(t||s)};static \u0275prov=ge({token:s,factory:s.\u0275fac,providedIn:"root"})};var ke=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi,Me=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,Le=/\s*●●●\s*$/g;function Oe(s){return s.length>0&&s.some(e=>{if(e&&typeof e=="object"&&!Array.isArray(e)){let t=Object.keys(e);return t.includes("version")||t.includes("createSurface")||t.includes("updateComponents")||t.includes("updateDataModel")||t.includes("deleteSurface")}return  false})}var B=class s{PULSE_INDICATOR="\u25CF\u25CF\u25CF";appendPulse(e){return `${e??""} ${this.PULSE_INDICATOR}`}stripPulse(e){return e?(Le.lastIndex=0,e.replace(Le,"").trim()):""}stripThinkingTags(e){return e?(Me.lastIndex=0,e.replace(Me,"").trim()):""}extractCodeFences(e){if(!e)return {extracted:"",hasFences:false};ke.lastIndex=0;let t=Array.from(e.matchAll(ke));return t.length>0?{extracted:t.map(r=>r[1].trim()).join(`
`),hasFences:true}:{extracted:e.trim(),hasFences:false}}cleanPayload(e){if(!e)return "";let t=this.stripPulse(e);if(t=this.stripThinkingTags(t),t=this.extractCodeFences(t).extracted,!t.startsWith("{")&&!t.startsWith("[")){let n=Array.from(t.matchAll(/[\{\[]/g));for(let o of n)if(o.index!==void 0&&o.index>=0){let i=t.substring(o.index).trim();if(i.startsWith("{")&&i.includes('"version"')||i.startsWith("[")&&/^\[\s*[\{\"]/.test(i)&&(i.includes('"version"')||i.includes('"createSurface"')||i.includes('"updateComponents"'))){t=i;break}let l=g(i);if(l.success&&Oe(l.data)){t=i;break}}}return t.trim()}isLayoutSnapshot(e){if(!e)return  false;let t=this.cleanPayload(e);if(t.startsWith('{"version"')||t.startsWith("{")&&t.includes('"version"')||t.startsWith("[")&&(t.includes('"version"')||t.includes('"createSurface"')||t.includes('"updateComponents"')))return  true;let r=g(t);return r.success&&Oe(r.data)}static \u0275fac=function(t){return new(t||s)};static \u0275prov=ge({token:s,factory:s.\u0275fac,providedIn:"root"})};function Ne(s){if(s==null||s.trim().length===0)return {success:true,isConversational:true,blocks:[],count:0};let e=g(s);if(e.success)return {success:true,isConversational:false,blocks:e.data,count:ae(e.data)};let t=s.trim();if(t.startsWith("{")||t.startsWith("[")){let a=Ue(s);if(a!==null&&typeof a=="object"){let c=Array.isArray(a)?a:[a];return {success:true,isConversational:false,blocks:c,count:ae(c)}}}let n=s.split(`
`).map((a,c)=>({text:(a||"").trim(),originalIndex:c})).filter(a=>a.text.length>0),o=[],i=false,l=null;for(let a of n)if(!(a.text.startsWith("```")||!a.text.startsWith("{")&&!a.text.startsWith("["))){i=true;try{o.push(JSON.parse(a.text));}catch(c){let d$1=Ue(a.text);if(d$1!==null)o.push(d$1);else if(!l){let p=d(c,a.text);l={success:false,error:c?.message??"Syntax recovery failed",line:a.originalIndex+1,column:p.column,snippet:a.text};}}}if(o.length===0){if(l)return l;if(i){let a=e.error;return {success:false,error:a?.message??"Syntax recovery failed",line:a?.line,column:a?.column,snippet:a?.snippet}}return {success:true,isConversational:true,blocks:[],count:0}}return {success:true,isConversational:false,blocks:o,count:ae(o)}}function Ue(s){if(s==null||s.trim().length===0)return null;let e=s.trim();if(e.length>256*1024)return null;e=e.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(e)}catch{for(let r=1;r<=5;r++)try{return JSON.parse(e+"}".repeat(r))}catch{}for(let r=1;r<=3;r++)for(let n=1;n<=3;n++)try{return JSON.parse(e+"}".repeat(r)+"]".repeat(n))}catch{}for(let r=1;r<=3;r++)for(let n=1;n<=3;n++)try{return JSON.parse(e+"]".repeat(r)+"}".repeat(n))}catch{}}return null}function Ve(s){if(!s||typeof s!="object")return  false;let e=s;if(!e.updateComponents||typeof e.updateComponents!="object")return  false;let t=e.updateComponents;return Array.isArray(t.components)}function je(s,e){let t=false,r={};if(e)for(let o of Object.keys(e)){let i=o.toLowerCase().replace(/[^a-z]/g,"");r[i]=o;}let n={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let o of s){if(!Ve(o))continue;let i=o.updateComponents,l=[];for(let a of i.components){if(!a||typeof a!="object"||Array.isArray(a)){l.push(a);continue}let c=a,d=c.component;if(c.name&&!c.component&&(t=true,d=c.name,c.component=d,delete c.name),typeof d!="string")throw new Error("Component declaration is missing component type name string.");let p=d;if(e&&!e[d]){let u=d.toLowerCase().replace(/[^a-z]/g,""),f=r[u];if(!f){let g=n[u];g&&(f=r[g]);}if(f&&e[f])t=true,p=f;else {let g=u?Object.keys(e).find(v=>v.toLowerCase().includes(u)||u.includes(v.toLowerCase())):void 0;if(g)t=true,p=g;else throw new Error(`Validation failure: Component type "${d}" is not registered in the active custom catalog.`)}}let h=Ye(c);h.component=p,l.push(h);}i.components=l;}return t}function ie(s){if(s===null||typeof s!="object")return s;if(Array.isArray(s))return s.map(r=>ie(r));let e=s,t={};for(let[r,n]of Object.entries(e))r==="__proto__"||r==="constructor"||r==="prototype"||(t[r]=ie(n));return t}function Ye(s){return ie(s)}function ae(s){return s.reduce((e,t)=>!t||typeof t!="object"?e:t.updateComponents&&Array.isArray(t.updateComponents.components)?e+t.updateComponents.components.length:t.createSurface?e+1:e,0)}var V=class s{catalogManagement=C(se$1);mcpManager=C(a_);localStorageInteractions=C(Ls);customInstructionsState=Bt(this.loadInitialState());presets=uf(()=>this.customInstructionsState().presets);activePresetId=uf(()=>this.customInstructionsState().activePresetId);activePreset=uf(()=>{let e=this.customInstructionsState();return e.presets.find(t=>t.id===e.activePresetId)??null});customInstructions=uf(()=>this.activePreset()?.content??"");hasCustomInstructions=uf(()=>this.customInstructions().trim().length>0);systemPrompt=uf(()=>{let e=this.catalogManagement.activeCatalog(),r=this.mcpManager.doesCatalogSupportMcp(e)?this.mcpManager.getActiveServersWithTools():[],n=this.buildMcpInstructions(r),o=this.customInstructions().trim(),i=o?`

## Custom User Instructions

${o}`:"";return e?(this.generateSystemPrompt(e)+n).trimEnd()+i:`
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests\u2014whether provided as text instructions, UI wireframes, screenshots,
  or mockup images\u2014into valid A2UI v0.9 interactive user interfaces.
  ${n}
      `.trimEnd()+i});setCustomInstructionsState(e){let t=e.presets.some(n=>n.id===e.activePresetId),r={presets:e.presets,activePresetId:t?e.activePresetId:null};this.customInstructionsState.set(r),this.localStorageInteractions.setItem("a2ui_composer_custom_instructions",JSON.stringify(r));}loadInitialState(){let e=this.localStorageInteractions.getItem("a2ui_composer_custom_instructions");if(!e)return {presets:[],activePresetId:null};try{let t=JSON.parse(e);if(!t||!Array.isArray(t.presets))return {presets:[],activePresetId:null};let r=t.presets.filter(o=>typeof o=="object"&&o!==null&&typeof o.id=="string"&&typeof o.name=="string"&&typeof o.content=="string"),n=typeof t.activePresetId=="string"&&r.some(o=>o.id===t.activePresetId)?t.activePresetId:null;return {presets:r,activePresetId:n}}catch{return {presets:[],activePresetId:null}}}buildMcpInstructions(e){let t=new Map;for(let o of e)for(let i of o.tools||[])t.has(i.name)||t.set(i.name,i);if(t.size===0)return "";let r={type:"object",properties:{content:{type:"array",items:{type:"object",properties:{type:{type:"string"},text:{type:"string"}}}}}};return `

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
  ${Array.from(t.values()).map(o=>{let i=o.description?` - ${o.description}`:"",l=JSON.stringify(o.inputSchema||{type:"object",properties:{}}),a=JSON.stringify(o.outputSchema||r);return `- **\`${o.name}\`**${i}
  - **Input Schema**: \`${l}\`
  - **Output Schema**: \`${a}\``}).join(`
`)}
`}generateSystemPrompt(e$1){let t=p(e$1),r=new Set(Object.keys(e$1.components??{})),n=r.has("Icon"),o=this.catalogSupportsCustomSvg(e$1),i=this.imageUrlGuidance(e$1),l=this.iconGuidance(n,o),a=this.visualAffordanceGuidance(n),c=this.componentTreeMappingGuidance(n,o),d=this.examplesForCatalog(r,e$1.catalogId||e$1.$id||"active-catalog");return `
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
     schema below, emitting any prefixed, library-specific, or DOM component
     name that is absent from the active catalog is strictly INVALID.
  3. **No Hallucinated Properties**: Include ONLY properties explicitly
     defined in the JSON Schema for that specific component type in the
     active catalog. Do NOT emit unauthorized keys (e.g., "rules", "mock*",
     or unsupported CSS/styling parameters).

  ### Active Catalog Schema (Mandatory Allowlist)
  \`\`\`json
  ${t}
  \`\`\`

  ### Common Schema Types
  Common structural types referenced by $ref in the catalog schema (e.g.,
  DataBinding, Action, Event, DynamicString, etc.) are defined here:
  \`\`\`json
  ${p(e)}
  \`\`\`

  ## Editing the Current UI

  When a current editor A2UI snapshot is provided, it is the authoritative UI
  being edited. Use its actual surface IDs, component IDs, and data bindings;
  never borrow IDs or paths from the illustrative examples below. For literal
  Text values, emit updateComponents with the edited component and its existing
  properties. Use updateDataModel only for values bound to that surface's model.
  Preserve unrelated components and update all labels affected by the request
  (for example, a destination's airport code, city label, and route heading).
  For edits, emit updates to existing surfaces. For a replacement UI, emit a
  complete document beginning with createSurface before its updates.

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

  ### 3. Icon, Image & Styling Intent
  ${l}
  ${i}
  * **Visual Hierarchy**: Preserve typography scale, text weight, button
    prominence, and color intent using supported catalog properties.

  ### 4. Visual Affordance Recognition
  ${a}

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
     catalog component types with ${c},
     full-width properties, and JSON Pointer paths.
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

  ${d}

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
  `}iconGuidance(e,t){return !e||!t?`* The active catalog does not support custom icon drawing. Do NOT invent Icon
    components, icon names, svgPath fields, inline SVG fields, or
    data:image/svg+xml fallbacks unless those exact component names and
    properties appear in the active catalog schema. Omit the icon or represent
    the meaning with supported Text, Button, Image, or layout components.`:`* Use Icon components only when the active catalog schema includes the exact
    icon values and properties you need. Custom SVG fields are allowed only
    when the Icon schema explicitly defines them.`}imageUrlGuidance(e){let t=e.components?.Image;if(!t)return "";let r=JSON.stringify(t).toLowerCase();return r.includes("http(s)")||r.includes("http")?`* For Image.url, use only HTTP(S) URLs. If no suitable HTTP(S) URL is
    provided or visible, omit the Image component instead of inventing a URL.`:""}catalogSupportsCustomSvg(e){let t=e.components?.Icon;if(!t)return  false;let r=JSON.stringify(t).toLowerCase();return r.includes("svg")||r.includes("path data")}visualAffordanceGuidance(e){return `Recognize common UI visual affordance symbols and map them strictly using
  components defined in the active catalog schema provided above:
  * **Downward Chevrons / Disclosure Carets (Collapsible Rows)**:
    - **Visual Indicator**: Downward-facing arrows (\u2228, expand_more) at row
      edges denote expandable/collapsible sections.
    - **Catalog Mapping**: If the active catalog schema includes an expansion
      or accordion component, use it. Otherwise, compose the row using
      ${e?`layout primitives in the catalog: e.g., a horizontal layout container
      (Row) holding leading text/icons and a trailing downward icon.`:`layout primitives in the catalog: e.g., a horizontal layout container
      (Row) holding the visible label and any supported text marker only when
      that marker is literally present.`}
  * **Search Cues (Search Inputs)**:
    - **Visual Indicator**: Magnifying glass symbols (\u{1F50D}) inside or adjacent
      to text entry boxes.
    - **Catalog Mapping**: If a search component exists in the active catalog
      schema, use it; otherwise, ${e?"use a text input component paired with a search icon.":`use the active catalog's text input component if one exists, or
      represent the visible search label/placeholder with supported Text and
      layout components.`}
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
      inside a container or card.`}componentTreeMappingGuidance(e,t){return e&&t?"exact icon names/SVGs":e?"exact supported icon values":"supported layout and text properties"}examplesForCatalog(e,t){if(e.has("Column")&&e.has("Text")){let r=[`* **Simple Example**: A basic column with text:
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "main", "catalogId": "${t}"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "main", "components": [{"id": "root", "component": "Column", "children": ["header", "content"]}, {"id": "header", "component": "Text", "text": "Welcome"}, {"id": "content", "component": "Text", "text": {"path": "/message"}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "main", "path": "/message", "value": "Hello, world!"}}
      \`\`\``];return e.has("Button")&&r.push(`* **Action Example**: A button with a text child:
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "action_demo", "catalogId": "${t}"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "action_demo", "components": [{"id": "root", "component": "Column", "children": ["summary", "ack_button"]}, {"id": "summary", "component": "Text", "text": {"path": "/summary"}}, {"id": "ack_button", "component": "Button", "child": "ack_label", "action": {"event": {"name": "acknowledge"}}}, {"id": "ack_label", "component": "Text", "text": {"path": "/ackLabel"}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "action_demo", "value": {"summary": "Three updates are ready for review.", "ackLabel": "Acknowledge"}}}
      \`\`\``),`These examples use only component names present in the active catalog. Code
  fences are shown for readability only; do NOT include code fences in your
  actual JSONL output.

    ${r.join(`

    `)}`}return `No generic component examples are included because the active catalog does
  not contain the common Column/Text layout primitives. Use only the exact
  component names and properties in the active catalog schema above.`}static \u0275fac=function(t){return new(t||s)};static \u0275prov=ge({token:s,factory:s.\u0275fac,providedIn:"root"})};var Y=class s{isConnectivityError(e){return e?e.includes("failed to fetch")||e.includes("fetch")||e.includes("timeout")||e.includes("504")||e.includes("proxy")||e.includes("networkerror")||e.includes("connection")||e.includes("401")||e.includes("403")||e.includes("credential")||e.includes("quota")||e.includes("blocked")||e.includes("503")||e.includes("unavailable")||e.includes("api key")||e.includes("apikey"):false}parseError(e,t,r=false){let n=e??"",o=t??"",i="Connectivity Failure",l=o.trim().startsWith("{"),a=l?"A connectivity error occurred.":o,c=l?"Details: "+o:void 0,d="Tip: Please check your network proxy configurations or verify your settings to restore connections.",p=r,h=true,u=this.isConnectivityError(n);return n.includes("validation")||n.includes("syntax recovery")||n.includes("validation failure")?{errorTitle:"Validation Failure",errorMessage:"The generated layout contains invalid components or structure.",errorTip:"Tip: Try rephrasing your prompt to guide the model to generate valid components.",isRetryable:r,showDetails:true,errorDetails:"Details: "+o,isConnectivityFailure:u}:n.includes("503")||n.includes("unavailable")?{errorTitle:"Service Unavailable",errorMessage:"The generative service is temporarily unavailable. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:u}:n.includes("high demand")?{errorTitle:"Model High Demand",errorMessage:"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:u}:n.includes("timeout")||n.includes("504")?{errorTitle:"REST Gateway Timeout",errorMessage:"Remote generation service did not respond.",errorDetails:"Details: "+o,errorTip:d,isRetryable:p,showDetails:true,isConnectivityFailure:u}:n.includes("api key")||n.includes("apikey")?{errorTitle:"Invalid API Key",errorMessage:"The provided Gemini API key is invalid or missing.",errorDetails:"Details: "+o,errorTip:"Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.",isRetryable:p,showDetails:true,isConnectivityFailure:u}:n.includes("auth")||n.includes("401")||n.includes("403")||n.includes("credential")?{errorTitle:"Authentication Refused",errorMessage:"Authentication failed. Please verify your credentials in Settings.",errorDetails:"Details: "+o,errorTip:d,isRetryable:p,showDetails:true,isConnectivityFailure:u}:n.includes("quota")||n.includes("blocked")||n.includes("429")?{errorTitle:"GenAI Service Blocked",errorMessage:"Resource quota depleted or content safety limits triggered.",errorDetails:"Details: "+o,errorTip:d,isRetryable:p,showDetails:true,isConnectivityFailure:u}:{errorTitle:i,errorMessage:a,errorTip:d,isRetryable:p,showDetails:h,errorDetails:c,isConnectivityFailure:u}}static \u0275fac=function(t){return new(t||s)};static \u0275prov=ge({token:s,factory:s.\u0275fac,providedIn:"root"})};function _e(s){let e=/^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i,t=s.replace(e,"");if(t.startsWith("{"))try{let r=JSON.parse(t);if(r.error&&r.error.message)return r.error.message}catch{}return t}function K(s){if(!s)return s;let e=s.replace(/AIzaSy[A-Za-z0-9_-]+/g,"redacted for your protection");return e=e.replace(/(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(t,r,n)=>n.toLowerCase()==="redacted for your protection"?t:r+"redacted for your protection"),e=e.replace(/(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(t,r,n)=>n.toLowerCase()==="redacted for your protection"?t:r+"redacted for your protection"),e}var Z=class s{settings=C(K$1);startup=C(hv);host=C(u3);catalog=C(se$1);injector=C(Ne$1);destroyRef=C(hn);switching=Bt(false);selectionError=Bt(null);renderers=uf(()=>(this.settings.renderers(),this.settings.getRenderers()));selectedRendererId=this.settings.selectedRendererId;activeRenderer=uf(()=>{let e=this.startup.resolvedUrl(),t=this.renderers().find(r=>r.id===this.selectedRendererId());return t?.rendererUrl===e?t:this.renderers().find(r=>r.rendererUrl===e)??null});isSwitching=this.switching.asReadonly();error=this.selectionError.asReadonly();async selectRenderer(e,t){if(this.isSwitching())throw new Error("A renderer change is already in progress.");this.selectionError.set(null);let r=this.renderers().find(a=>a.id===e);if(!r){let a=new Error("Choose a renderer registered in Composer settings.");throw this.selectionError.set(a.message),a}if(t?.aborted)throw this.abortReason(t);let n=this.isReady(r);if(this.selectedRendererId()===e&&n)return;this.switching.set(true);let o=this.waitForCatalog(r,n,t),i=false,l=(t?this.settings.selectRenderer(e,t):this.settings.selectRenderer(e)).then(a=>{if(i=true,!a)throw new Error("The selected renderer was not approved.");o.acceptSelection();},a=>{throw i=true,a});try{await Promise.all([l,o.promise]);}catch(a){throw this.selectionError.set(a instanceof Error||a instanceof DOMException?a.message:"Could not change the renderer."),a}finally{o.dispose(),i?this.switching.set(false):l.then(()=>this.switching.set(false),()=>this.switching.set(false));}}abortReason(e){return e?.reason instanceof Error||e?.reason instanceof DOMException?e.reason:new DOMException("Renderer change canceled.","AbortError")}isReady(e){return this.startup.resolvedUrl()===e.rendererUrl&&this.frameMatches(e)&&this.host.isRendererReady()&&!!this.catalog.activeCatalog()&&!this.catalog.isHandshakeInProgress()&&!this.catalog.catalogError()}frameMatches(e){let t=this.host.getIframeElement();if(!t)return  false;try{let r=new URL(t.src,document.baseURI),n=new URL(e.rendererUrl,document.baseURI);for(let o of [r,n])o.searchParams.delete("origin"),o.searchParams.delete("theme"),o.searchParams.sort();return r.href===n.href}catch{return  false}}waitForCatalog(e,t,r$1){let n=false,o=false,i=false,l=null,a=false,c=null,d,p,h=this.catalog.catalogError(),u,f,g=new Promise((w,E)=>{u=w,f=E;}),v=w=>{o||(o=true,f(w));},y=()=>{let w=this.selectedRendererId(),E=this.startup.resolvedUrl(),S$1=this.catalog.activeCatalog(),F=this.catalog.isHandshakeInProgress(),O=this.catalog.catalogError();if(o)return;if(w===e.id&&(i=true),i&&w!==e.id||n&&E!==e.rendererUrl||!this.renderers().some(ce=>ce.id===e.id&&ce.rendererUrl===e.rendererUrl)){v(new Error("Renderer changed before its catalog was ready."));return}if(l&&O&&O!==h){v(new Error(`Could not load renderer: ${O}`));return}let R=a&&S$1!==c&&!!S$1&&(S$1.catalogId||S$1.$id)===d&&S(S$1)===p&&!F;n&&(t||R)&&this.isReady(e)&&(o=true,u());},C=false,b=this.host.messageStream$.subscribe(w=>{if(!C||o||this.selectedRendererId()!==e.id||this.startup.resolvedUrl()!==e.rendererUrl||!this.frameMatches(e))return;let E=this.host.getIframeElement()?.contentWindow;if(!(!E||w.sourceWindow!==E)){if(w.type===$t.RENDERER_READY)l=E;else if(w.type===$t.A2UI_CATALOG&&l===E){a=true,c=this.catalog.activeCatalog();let S$1=w.payload;if(S$1&&typeof S$1=="object"&&!Array.isArray(S$1)){let F="catalogId"in S$1?S$1.catalogId:void 0,O="$id"in S$1?S$1.$id:void 0;d=typeof F=="string"?F:typeof O=="string"?O:void 0;let R=r({},S$1);"title"in R&&typeof R.title=="string"&&(R.title=T(R.title).toString()),"description"in R&&typeof R.description=="string"&&(R.description=T(R.description).toString()),p=S(R);}}y();}});C=true;let _=Ga(y,{injector:this.injector}),ze=setTimeout(()=>v(new Error("Renderer did not become ready. Try selecting it again.")),15e3),ee=()=>v(this.abortReason(r$1));r$1?.addEventListener("abort",ee,{once:true});let Je=this.destroyRef.onDestroy(ee);return {promise:g,acceptSelection:()=>{o||(n=true,i=true,y(),!o&&!l&&this.host.isRendererReady()&&this.frameMatches(e)&&(l=this.host.getIframeElement()?.contentWindow??null,this.host.sendMessage({type:$t.GET_CATALOG})));},dispose:()=>{o=true,clearTimeout(ze),_.destroy(),b.unsubscribe(),r$1?.removeEventListener("abort",ee),Je();}}}static \u0275fac=function(t){return new(t||s)};static \u0275prov=ge({token:s,factory:s.\u0275fac,providedIn:"root"})};var X="switchRenderer",se=ide.object({rendererId:ide.string().min(1)}).strict(),Q=class s{selection=C(Z);copilotKit=C(hr);constructor(){iAe({name:X,description:"Switch the canvas renderer before generating for a different output format.",parameters:se,handler:async({rendererId:e},{signal:t})=>(await this.selection.selectRenderer(e,t),{rendererId:e,status:"ready"})});}definition(){return {name:X,description:`Switch the canvas renderer ONLY when the user asks for a different output format.
For Slack messages or Block Kit choose the Slack renderer. For standard A2UI choose Angular Basic.
Do not switch just because the content mentions Slack. Keep the active renderer for ordinary edits.
Prefer the non-dev renderer unless the user requests a local renderer.
Current renderer: ${this.selection.selectedRendererId()}.
Available renderers: ${JSON.stringify(this.selection.renderers().map(({id:e,name:t})=>({id:e,name:t})))}.
Call this tool before emitting any canvas JSON; generation resumes with the selected catalog.`,parametersJsonSchema:{type:"object",properties:{rendererId:{type:"string",enum:this.selection.renderers().map(e=>e.id)}},required:["rendererId"],additionalProperties:false}}}targetUrl(e){if(e.name!==X)throw new Error(`Unknown frontend tool: ${e.name}`);let t=se.parse(e.args),r=this.selection.renderers().find(n=>n.id===t.rendererId);if(!r)throw new Error(`Unknown renderer: ${t.rendererId}`);return r.rendererUrl}async execute(e,t){this.targetUrl(e),t.throwIfAborted();let r=this.copilotKit.core.getTool({toolName:X});if(!r?.handler)throw new Error("The renderer tool is not registered.");await r.handler(se.parse(e.args),{signal:t,toolCall:{id:crypto.randomUUID(),type:"function",function:{name:e.name,arguments:JSON.stringify(e.args)}}});}static \u0275fac=function(t){return new(t||s)};static \u0275prov=ge({token:s,factory:s.\u0275fac,providedIn:"root"})};var Fe=class s{catalogManagement=C(se$1);configProvider=C(Jl);stateSync=C(q);chatState=C(y);llmClient=C(NF);rendererTool=C(Q);errorLogger=C(Wr);chatCleaner=C(B);usageTrackingService=C(X$1);promptFactory=C(V);errorPresenter=C(Y);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;currentTurnIndex=Bt(0);systemPrompt=this.promptFactory.systemPrompt;activePromptId=null;activeRequestId=0;expectedToolRendererUrl;toolAbortController;constructor(){u$e(this.configProvider.rendererUrl).pipe(Cd(1),l$e()).subscribe(e=>{if(e===this.expectedToolRendererUrl){this.expectedToolRendererUrl=void 0;return}queueMicrotask(()=>this.wipeEnvironmentCache());});}wipeEnvironmentCache(){this.activeRequestId++,this.toolAbortController?.abort(this.cancelError()),this.expectedToolRendererUrl=void 0,this.activeStreamResponse?.cancel?.(),this.activeStreamResponse=void 0,this.currentTurnIndex.set(0),this.activePromptId=null,this.chatState.setChatHistory([]),this.finalizeStream("idle"),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}finalizeStream(e="idle"){this.chatState.setPipelineStatus(e),this.chatState.setProgrammaticStreamActive(false);}getFullMessageContext(){return [{role:"system",content:this.promptFactory.systemPrompt()},...this.chatState.chatHistory().filter(e=>e.role!=="error")]}activeStreamResponse;isCancelRequested=false;cancelActiveStream(){this.isCancelRequested=true,this.toolAbortController?.abort(this.cancelError()),this.activePromptId&&this.usageTrackingService.trackChatCancel({promptId:this.activePromptId,turnIndex:this.currentTurnIndex(),pipelineStatus:this.pipelineStatus()}),this.activeStreamResponse&&this.activeStreamResponse.cancel&&this.activeStreamResponse.cancel();}emitPromptTracking(e,t,r){let n=!!r?.retryOfPromptId,o=r?.promptTurnIndex??this.currentTurnIndex()+1;this.currentTurnIndex.set(o);let i=this.catalogManagement.activeCatalog(),l=i&&(i.catalogId||i.$id)||"",a=t.some(d=>d.name==="screenshot.png"||d.mimeType?.startsWith("image/")),c=t.filter(d=>d.name!=="screenshot.png"&&!d.mimeType?.startsWith("image/"));return n?this.usageTrackingService.trackChatRetry({promptId:r?.promptId,catalogId:l,turnIndex:o,attemptNumber:2,retryOfPromptId:r?.retryOfPromptId}):this.usageTrackingService.trackChatPrompt({promptId:r?.promptId,catalogId:l,turnType:o===1?"initial":"followup",turnIndex:o,attemptNumber:1,hasScreenshot:a,attachmentCount:c.length})}async submitPrompt(e,t=[],r$1){if(this.chatState.isProgrammaticStreamActive()){console.warn("[ChatCoordinator] Blocked submitPrompt: programmatic stream is active.");return}let n=e.trim();if(!n&&t.length===0)return;this.stateSync.syncActiveDraftToHistory();let o=this.emitPromptTracking(n,t,r$1);this.activePromptId=o;let i=++this.activeRequestId,l=this.configProvider.rendererUrl(),a=this.getActiveCatalogId();this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(p=>[...p,{role:"user",content:n,attachments:t.length>0?t:void 0,promptId:o}]);let c=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",c),this.chatState.updateChatHistory(p=>[...p,{role:"model",content:this.chatCleaner.appendPulse("")}]);let d;try{this.isCancelRequested=!1;let p=new AbortController;this.toolAbortController=p;for(let h=0;h<2;h++){if(d=await this.llmClient.chatStream(c,h===0?{tools:[this.rendererTool.definition()]}:void 0),!this.isPromptContextStillActive(i,o,l,a)){d.cancel?.();return}if(this.isCancelRequested){d.cancel&&d.cancel();let y=new Error("Cancelled");throw y.name=gAe,y}this.activeStreamResponse=d;let u=[],f="",g="";for await(let y of d.contentStream){if(!this.isPromptContextStillActive(i,o,l,a)){d.cancel?.();return}y.toolCalls&&u.push(...y.toolCalls),f+=y.content,y.thinking&&(g+=y.thinking),this.chatState.updateChatHistory(C=>{let b=[...C],_=b.length-1;return b[_]?.role==="model"&&(b[_]={role:"model",content:this.chatCleaner.appendPulse(f),thinking:g}),b});}let v=await d.complete;if(this.assertPromptContextStillActive(i,o,l,a),u.length){if(h>0||u.length!==1)throw new Error("The assistant must request one renderer change at a time.");if(this.isCancelRequested)throw this.cancelError();let y=this.rendererTool.targetUrl(u[0]),C=y!==l;this.expectedToolRendererUrl=C?y:void 0;try{await this.rendererTool.execute(u[0],p.signal);}finally{i===this.activeRequestId&&(this.expectedToolRendererUrl=void 0);}if(i!==this.activeRequestId)return;if(this.isCancelRequested)throw this.cancelError();l=this.configProvider.rendererUrl(),a=this.getActiveCatalogId(),C&&this.stateSync.flushDraft(),c=[{role:"system",content:this.promptFactory.systemPrompt()+`
The renderer has been selected. Use only this catalog. Rebuild any prior layout using its supported components and emit a complete createSurface/updateComponents/updateDataModel sequence.`},...c.filter(b=>b.role!=="system")],this.chatState.addRawLlmLog("LLM_REQUEST",c);continue}this.chatState.addRawLlmLog("LLM_RESPONSE",v),this.chatState.updateChatHistory(y=>{let C=[...y],b=C.length-1;return C[b]?.role==="model"&&(C[b]={role:"model",content:v,thinking:g}),C}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(v,i,o,l,a);break}}catch(p){if(i!==this.activeRequestId)return;p&&typeof p=="object"&&"name"in p&&p.name===gAe?(this.finalizeStream("idle"),this.chatState.updateChatHistory(h=>{let u=[...h],f=u.length-1;return u[f]?.role==="model"&&(u[f]=s$1(r({},u[f]),{content:"*You stopped this response.*"})),u})):this.handleConnectivityError(p,n,t,o);}finally{this.activeRequestId===i&&(this.toolAbortController=void 0),this.activeRequestId===i&&this.activeStreamResponse===d&&(this.activeStreamResponse=void 0);}}cancelError(){let e=new Error("Cancelled");return e.name=gAe,e}async processRawLlmPayload(e,t,r$1,n,o){let i=[],l=0;try{this.chatCleaner.extractCodeFences(e).hasFences&&this.chatState.setPipelineStatus("healing");let a=this.chatCleaner.cleanPayload(e),c=Ne(a);if(c.success&&c.isConversational){this.assertPromptContextStillActive(t,r$1,n,o),this.finalizeStream("idle");return}if(!c.success){let d=r$1?`[prompt:${r$1}] `:"";this.errorLogger.error({sourceTag:"[ChatParser]",message:`${d}${c.error}`,line:c.line,column:c.column,snippet:c.snippet}),this.chatState.updateChatHistory(p=>{let h=[...p],u=h.length-1;return h[u]?.role==="model"&&(h[u]=s$1(r({},h[u]),{parseError:c})),h}),this.finalizeStream("idle");return}i=c.blocks,l=c.count;}catch(a){throw this.finalizeStream("failed"),a}this.chatState.setPipelineStatus("validating");try{let a={type:$t.RENDER_A2UI,payload:i},c=[];if(!c_.validateOutgoingMessage(a,c))throw new Error(`Outgoing message envelope validation failed:
${c.join(`
`)}`);je(i,this.catalogManagement.activeCatalog()?.components)&&this.chatState.setPipelineStatus("healing"),i=this.resolveLayoutUpdate(i),this.assertPromptContextStillActive(t,r$1,n,o),this.chatState.setPipelineStatus("ready");let h=p(i);this.chatState.updateChatHistory(u=>{let f=[...u],g=f.length-1;return f[g]?.role==="model"&&(f[g]=s$1(r({},f[g]),{content:h,isSnapshot:!0,componentCount:l})),f}),this.stateSync.commitLayoutFromLlm(h),this.chatState.setProgrammaticStreamActive(!1);}catch(a){throw this.finalizeStream("failed"),a}}getActiveCatalogId(){let e=this.catalogManagement.activeCatalog();return e&&(e.catalogId||e.$id)||""}assertPromptContextStillActive(e,t,r,n){if(!this.isPromptContextStillActive(e,t,r,n))throw new Error("Renderer changed while the assistant response was in flight. The new active draft was preserved. Please retry your prompt against the selected renderer.")}isPromptContextStillActive(e,t,r,n){if(!t)return  true;let o=r!==void 0&&this.configProvider.rendererUrl()!==r,i=n!==void 0&&this.getActiveCatalogId()!==n;return this.activeRequestId===e&&this.activePromptId===t&&!o&&!i}resolveLayoutUpdate(e){let t=(l,a)=>{if(!l||typeof l!="object"||!(a in l))return;let c=Reflect.get(l,a);return c&&typeof c=="object"&&"surfaceId"in c&&typeof c.surfaceId=="string"?c.surfaceId:void 0},r=e.some(l=>t(l,"createSurface")!==void 0),n=g(this.stateSync.activeDraft()),o=!r&&n.success?n.data:[],i=new Set;for(let l of o){let a=t(l,"createSurface"),c=t(l,"deleteSurface");a!==void 0&&i.add(a),c!==void 0&&i.delete(c);}for(let l of e){let a=t(l,"createSurface");a!==void 0&&i.add(a);for(let c of ["updateComponents","updateDataModel","deleteSurface"]){let d=t(l,c);if(d!==void 0&&!i.has(d))throw new Error(`Surface validation failed: cannot apply ${c}: surface "${d}" does not exist in the current draft. The draft was preserved.`);d!==void 0&&c==="deleteSurface"&&i.delete(d);}}return [...o,...e]}handleConnectivityError(e,t,r$1=[],n){let o=e instanceof Error?e.message:String(e),i=o.toLowerCase(),l=_e(o);this.errorPresenter.isConnectivityError(i)?this.finalizeStream("idle"):this.finalizeStream("failed");let a=this.errorPresenter.parseError(i,l,!!t),c="";e instanceof Error?c="Exception: "+e.message+`
Stack: `+(e.stack||"None"):c="Unknown Exception: "+JSON.stringify(e);let d="";a.errorDetails&&(d+=a.errorDetails+`

`),d+=c;let p=K(a.errorMessage),h=a.showDetails?K(d):void 0,u=a.showDetails?K(a.errorTip):void 0;console.error("Gemini chat execution failed:",e),this.chatState.updateChatHistory(f=>{let g=[...f],v=g.length-1,y=r({role:"error",content:p,errorTitle:a.errorTitle,errorMessage:p,errorDetails:h,errorTip:u,promptId:n},a.isRetryable?{isRetryable:true,originalPrompt:t,attachments:r$1}:{});return v>=0&&g[v].role==="model"?(g[v]=y,g):(g.push(y),g)});}static \u0275fac=function(t){return new(t||s)};static \u0275prov=ge({token:s,factory:s.\u0275fac,providedIn:"root"})};export{B,Fe as F,Ne as N,V,Z,Ve as a,q};