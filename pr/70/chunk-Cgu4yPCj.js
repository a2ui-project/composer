import {C,a9 as jt,S as So$1,aa as dF,A as Au,H as HE,a as ai$1,c as Dp,b as Mc,t as tD,M as Mp,ab as Wp,ac as pp,s as fI,F as Fp,B as By,I as Ip,U as Up,ad as qp,u as pI,ae as Rp,af as kI,ag as vF,ah as Yt,p as pe,D as DD,ai as W,aj as q,P as Pn$1,y as x,ak as it$1,X,al as wD,a0 as ng,O as Oe,R as Rn$1,am as Jv,an as eE,ao as kn$1,ap as Nc,aq as Sc,ar as CD,as as og,$ as $E,j as jl,n as Am,a4 as WE,o as dp,r as lD,at as Di,au as pm,av as mF,h as MI,aw as hp,E as Ep,v as Ap,l as xI,m as AI,x as xp,ax as nr$1,f as cr$1,K as hF,w as Ce,a5 as j,Z as zo$1,G as Le,_ as pg,a1 as Xh,ay as yF,az as mI,aA as vp,aB as yI,q as qI,L as Lp,z as zv,N as No$1,d as ee,V as Kt,i as NI,aC as Yp,aD as yt$1,aE as Cp,aF as e,J as fe,aG as Kh,aH as ar$1,aI as Wt,aJ as Du$1,aK as wu,a8 as RI,T as TI,a6 as cu,a2 as bI,a7 as lu,aL as fg,W as Wy,aM as wp,aN as xc,aO as Ac,aP as kD,aQ as _n$1,Q as gg,aR as Bh,aS as Vh,aT as Zh,aU as eg,aV as uD,aW as Nn,aX as bp,aY as YE,aZ as hg,a_ as M,a$ as kn$2,b0 as pD,b1 as gD,b2 as Ah,b3 as xh,k as kc,b4 as hI,b5 as gI,b6 as yD,b7 as sf,b8 as iD}from'./main.js';import {a as an,G as Ge,b as Hi,c as G,X as Xi,$ as $e,R as Re$1,V as Ve,l as le,H,I as Ii,d as ae,x as xe$2,q as qe$1,P,g as ge,S as Se$1,m as mt,e as ct,f as ft,Z,z as zt,h as It$1,s as st}from'./chunk-Q07mmfFm.js';import {s as se$1,i as it,r as rn,o as on,V as Ve$1}from'./chunk-Bwu0f8QJ.js';import {X as Xt,f as Wi,g as S,H as Hd,j as jd,E as Ed,L as Lo,i as io$1,y as yd,m as mu,C as Ci,h as au,N as Ns$1,D as Du,q as q$1,r as ri$1,x as xe$1,R,k as An$1,l as so$1,n as Hc,o as sc,c as jr$1,p as St,A as At$1,W as Wr$1,Q as Qt,t as Do$1,a as al,z as zo$2,u as Co$1,S as Se,v as wn$1,w as wo,B as oo$1,b as bn$1}from'./chunk-rE_E6kTi.js';var se=class n{_chatHistory=So$1([]);_pipelineStatus=So$1("idle");_isProgrammaticStreamActive=So$1(false);_latestLlmLog=So$1(null);_llmHistory=So$1([]);chatHistory=this._chatHistory.asReadonly();pipelineStatus=this._pipelineStatus.asReadonly();isProgrammaticStreamActive=this._isProgrammaticStreamActive.asReadonly();latestLlmLog=this._latestLlmLog.asReadonly();llmHistory=this._llmHistory.asReadonly();setChatHistory(a){this._chatHistory.set(a);}updateChatHistory(a){this._chatHistory.update(a);}setPipelineStatus(a){this._pipelineStatus.set(a);}setProgrammaticStreamActive(a){this._isProgrammaticStreamActive.set(a);}addRawLlmLog(a,e){let t={type:a,timestamp:Date.now(),payload:e};this._latestLlmLog.set(t),this._llmHistory.update(i=>[...i,t].slice(-50));}clearRawLlmHistory(){this._latestLlmLog.set(null),this._llmHistory.set([]);}static \u0275fac=function(e){return new(e||n)};static \u0275prov=ee({token:n,factory:n.\u0275fac,providedIn:"root"})};var Un=`
{"version": "v0.9", "createSurface": {"surfaceId": "sample-surface", "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json", "sendDataModel": true}}
{"version": "v0.9", "updateComponents": {"surfaceId": "sample-surface", "components": [{"id": "root", "component": "Column", "children": ["title", "location_input", "pickup_input", "dropoff_input", "book_button"], "justify": "start", "align": "stretch"}, {"id": "title", "component": "Text", "text": "Book a Car", "variant": "h1"}, {"id": "location_input", "component": "TextField", "label": "Pick-up Location", "value": {"path": "/booking/location"}, "variant": "shortText"}, {"id": "pickup_input", "component": "DateTimeInput", "label": "Pick-up Date", "value": {"path": "/booking/pickupDate"}, "enableDate": true, "enableTime": false}, {"id": "dropoff_input", "component": "DateTimeInput", "label": "Drop-off Date", "value": {"path": "/booking/dropoffDate"}, "enableDate": true, "enableTime": false}, {"id": "book_button", "component": "Button", "child": "book_button_text", "variant": "primary", "action": {"event": {"name": "searchCars", "context": {"location": {"path": "/booking/location"}, "pickupDate": {"path": "/booking/pickupDate"}, "dropoffDate": {"path": "/booking/dropoffDate"}}}}}, {"id": "book_button_text", "component": "Text", "text": "Search Cars", "variant": "body"}]}}
{"version": "v0.9", "updateDataModel": {"surfaceId": "sample-surface", "path": "/booking", "value": {"location": "", "pickupDate": "", "dropoffDate": ""}}}
`.trim()+`
`;function gt(n){let a=n.trim();if(a.startsWith("[")&&a.endsWith("]"))try{let e=JSON.parse(a);if(Array.isArray(e))return e}catch{}return null}var ln="updateComponents",Qn="components",ho="registerMockRules",fo="mockRulesConfig",go="rules",_o="id",bo="children",ha="mock_rules_container",_t=class n{destroyRef=C(it$1);chatState=C(se);_activeDraft=So$1(Un);activeDraft=this._activeDraft.asReadonly();_draftInput=So$1("");constructor(){Du(this._draftInput).pipe(fg(1),ng(300),og(),Wi(this.destroyRef)).subscribe(a=>{this.syncLayoutToHistory(a);});}updateDraft(a){this._activeDraft.set(a),this._draftInput.set(a);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(a){this._activeDraft.set(a);}flushDraft(){this._activeDraft.set(Un);}syncLayoutToHistory(a){let e=this.sanitizeLayout(a),t=this.chatState.chatHistory();if(t.length===0){this.chatState.setChatHistory([{role:"user",content:e}]);return}let i=t[t.length-1];if(i.role==="user"&&i.content.trim().startsWith('{"version"')){let r=[...t];r[r.length-1]={role:"user",content:e},this.chatState.setChatHistory(r);}else this.chatState.updateChatHistory(r=>[...r,{role:"user",content:e}]);}sanitizeLayout(a){let e=a.trim();if(!e)return "";let t=gt(e);if(t)return t.map(l=>l&&typeof l=="object"&&!Array.isArray(l)?this.sanitizeBlock(l):l).filter(Boolean).map(l=>JSON.stringify(l)).join(`
`)+`
`;let i=e.split(`
`).map(r=>r.trim()).filter(r=>r.length>0),o=[];for(let r of i)try{let l=JSON.parse(r);if(!l||typeof l!="object"||Array.isArray(l))continue;let p=this.sanitizeBlock(l);p&&o.push(JSON.stringify(p));}catch(l){console.warn("[StateSync] Discarding malformed layout JSON Line during sanitization:",r,l);}return o.length>0?o.join(`
`)+`
`:""}sanitizeBlock(a){if(a[ho]||a[fo])return null;if(a[ln]&&typeof a[ln]=="object"&&a[ln]!==null){let e=a[ln];if(Array.isArray(e[Qn])){let t=e[Qn].filter(i=>i!==null&&typeof i=="object"&&!Array.isArray(i)?i[_o]!==ha:true);e[Qn]=t.map(i=>i!==null&&typeof i=="object"&&!Array.isArray(i)?this.sanitizeComponentObject(i):i);}}return a}sanitizeComponentObject(a){let e={};for(let[t,i]of Object.entries(a))t===go||/^mock/i.test(t)||(t===bo&&Array.isArray(i)?e[t]=i.filter(o=>o!==ha):i!==null&&typeof i=="object"&&!Array.isArray(i)?e[t]=this.sanitizeComponentObject(i):Array.isArray(i)?e[t]=i.map(o=>o!==null&&typeof o=="object"&&!Array.isArray(o)?this.sanitizeComponentObject(o):o):e[t]=i);return e}static \u0275fac=function(e){return new(e||n)};static \u0275prov=ee({token:n,factory:n.\u0275fac,providedIn:"root"})};var cn=class n{catalogManagement=C(io$1);configProvider=C(pe);stateSync=C(_t);chatState=C(se);llmClient=C(e);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;lastSeenRendererUrl="";isFirstUrlEffectRun=true;constructor(){Au(()=>{let a=this.configProvider.rendererUrl();wD(()=>{if(this.isFirstUrlEffectRun){this.isFirstUrlEffectRun=false,this.lastSeenRendererUrl=a;return}this.lastSeenRendererUrl!==a&&queueMicrotask(()=>this.wipeEnvironmentCache()),this.lastSeenRendererUrl=a;});});}wipeEnvironmentCache(){this.chatState.setChatHistory([]),this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}getFullMessageContext(){return [{role:"system",content:this.systemPrompt()},...this.chatState.chatHistory().filter(a=>a.role!=="error")]}async submitPrompt(a){let e=a.trim();if(!e)return;this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(i=>[...i,{role:"user",content:e}]);let t=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",t),this.chatState.updateChatHistory(i=>[...i,{role:"model",content:" \u25CF\u25CF\u25CF"}]);try{let i=await this.llmClient.chatStream(t),o="";for await(let l of i.contentStream)o+=l,this.chatState.updateChatHistory(p=>{let h=[...p],C=h.length-1;return h[C]?.role==="model"&&(h[C]={role:"model",content:o+" \u25CF\u25CF\u25CF"}),h});let r=await i.complete;this.chatState.addRawLlmLog("LLM_RESPONSE",r),this.chatState.updateChatHistory(l=>{let p=[...l],h=p.length-1;return p[h]?.role==="model"&&(p[h]={role:"model",content:r}),p}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(r);}catch(i){this.handleConnectivityError(i,e);}}async processRawLlmPayload(a){let e=[];try{e=this.parseAndHealJsonLines(a);}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}this.chatState.setPipelineStatus("validating");try{let t={type:S.RENDER_A2UI,payload:e},i=console.error,o=[];console.error=(...p)=>{o.push(p.map(h=>typeof h=="object"?JSON.stringify(h):String(h)).join(" "));};let r=!1;try{r=Qt.validateOutgoingMessage(t);}finally{console.error=i;}if(!r)throw new Error(`Outgoing message envelope validation failed:
${o.join(`
`)}`);this.runCatalogComponentSchemaCheck(e),this.chatState.setPipelineStatus("ready");let l=e.map(p=>JSON.stringify(p)).join(`
`)+`
`;this.stateSync.commitLayoutFromLlm(l),this.chatState.setProgrammaticStreamActive(!1);}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}}parseAndHealJsonLines(a){let e=a.trim(),t=/```json\s*([\s\S]*?)\s*```/,i=e.match(t);i&&i[1]&&(this.chatState.setPipelineStatus("healing"),e=i[1].trim());let o=e.split(`
`).map(l=>l.trim()).filter(l=>l.length>0),r=[];for(let l of o)if(!(l.startsWith("```")||!l.startsWith("{")&&!l.startsWith("[")))try{r.push(JSON.parse(l));}catch{this.chatState.setPipelineStatus("healing");let h=this.attemptSyntaxHealing(l);if(h!==null)r.push(h);else if(l.includes('"version"')||l.includes('"createSurface"'))throw new Error(`Syntax recovery failed for corrupted JSON Line:
"${l}"`)}if(r.length===0)throw new Error("No valid A2UI JSON layout command block could be parsed or recovered.");return r}attemptSyntaxHealing(a){let e=a.trim();e=e.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(e)}catch{for(let i=1;i<=5;i++)try{return JSON.parse(e+"}".repeat(i))}catch{}for(let i=1;i<=3;i++)for(let o=1;o<=3;o++)try{return JSON.parse(e+"]".repeat(i)+"}".repeat(o))}catch{}}return null}runCatalogComponentSchemaCheck(a){let e=this.catalogManagement.activeCatalog(),t={};if(e&&e.components)for(let o of Object.keys(e.components)){let r=o.toLowerCase().replace(/[^a-z]/g,"");t[r]=o;}let i={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let o of a){if(!o||typeof o!="object")continue;let l=o.updateComponents;if(!l||typeof l!="object"||!Array.isArray(l.components))continue;let p=[];for(let h of l.components){if(!h||typeof h!="object"||Array.isArray(h)){p.push(h);continue}let C=h,B=C.component;if(C.name&&!C.component&&(this.chatState.setPipelineStatus("healing"),B=C.name,C.component=B,delete C.name),typeof B!="string")throw new Error("Component declaration is missing component type name string.");let R=B;if(e&&e.components&&!e.components[B]){let fe=B.toLowerCase().replace(/[^a-z]/g,""),Ae=t[fe];if(!Ae){let J=i[fe];J&&(Ae=t[J]);}if(Ae&&e.components[Ae])this.chatState.setPipelineStatus("healing"),R=Ae;else {let J=fe?Object.keys(e.components).find(Z=>Z.toLowerCase().includes(fe)||fe.includes(Z.toLowerCase())):void 0;if(J)this.chatState.setPipelineStatus("healing"),R=J;else throw new Error(`Validation failure: Component type "${B}" is not registered in the active custom catalog.`)}}let z=this.sanitizeComponentObject(C);z.component=R,p.push(z);}l.components=p;}}sanitizeValue(a){if(a===null||typeof a!="object")return a;if(Array.isArray(a))return a.map(i=>this.sanitizeValue(i));let e=a,t={};for(let[i,o]of Object.entries(e))i==="rules"||/^mock/i.test(i)||(t[i]=this.sanitizeValue(o));return t}sanitizeComponentObject(a){return this.sanitizeValue(a)}TEST_ONLY={sanitizeComponentObject:a=>this.sanitizeComponentObject(a)};handleConnectivityError(a,e){let t=a instanceof Error?a.message:String(a);t.includes("Failed to fetch")||t.includes("fetch")||t.includes("Timeout")||t.includes("timeout")||t.includes("504")||t.includes("Proxy")||t.includes("proxy")||t.includes("NetworkError")||t.includes("TypeError")||t.includes("connection")||t.includes("Connection")||t.includes("401")||t.includes("403")||t.includes("credential")||t.includes("quota")||t.includes("blocked")||t.includes("503")||t.includes("UNAVAILABLE")?this.chatState.setPipelineStatus("idle"):this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false);let o;a instanceof Error?o=`Exception: ${a.message}
Stack: ${a.stack||"None"}`:o=`Unknown Exception: ${JSON.stringify(a)}`;let r=t.includes("validation")||t.includes("Syntax recovery")||t.includes("Validation failure"),l=r?"\u26A0\uFE0F Validation Failure. The generated layout contains invalid components or structure.":"\u26A0\uFE0F Connectivity Failure. Remote gateway communication drop.",p=!!e,h=t.includes("503")||t.includes("UNAVAILABLE")||t.includes("high demand")||t.includes("experiencing high demand");h?(l="\u26A0\uFE0F This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",p=true):t.includes("Timeout")||t.includes("504")?l=`\u26A0\uFE0F REST Gateway Timeout. Remote generation service did not respond.
Details: `+t:t.includes("Auth")||t.includes("401")||t.includes("403")||t.includes("credential")?l=`\u26A0\uFE0F Authentication Refused. Please verify your 3P API credentials in Settings.
Details: `+t:(t.includes("quota")||t.includes("blocked")||t.includes("429"))&&(l=`\u26A0\uFE0F GenAI Service Blocked. Resource quota depleted or content safety limits triggered.
Details: `+t);let C=l;if(!h){let B=r?"[A2UI Schema Validation or Parsing Exception]":"[REST Gateway Timeout or Connectivity Exception]",R=r?"Tip: Try rephrasing your prompt to guide the model to generate valid components.":"Tip: Please check your network proxy configurations or supply your third-party Gemini developer token key on the settings page to restore connections.";C+=`

`+B+`
-------------------------------------------------
Failed to compile generative turn. Diagnostic stack details:

`+o+`

`+R;}this.chatState.updateChatHistory(B=>{let R=[...B],z=R.length-1,fe=q({role:"error",content:C},p?{isRetryable:true,originalPrompt:e}:{});return z>=0&&R[z].role==="model"?(R[z]=fe,R):(R.push(fe),R)});}systemPrompt=DD(()=>{let a=this.catalogManagement.activeCatalog();return a?this.generateSystemPrompt(JSON.stringify(a,null,2)):`You are an AI assistant designed to help model mock screens inside A2UI Composer shell.
Status: Awaiting renderer dynamic handshake settlement...`});generateSystemPrompt(a){return `
  # A2UI Generation Expert

  ## Role
  You are an A2UI expert. Your job is to translate the user's request into valid
  A2UI messages.

  # Overview
  You MUST ensure all payloads strictly adhere to the **JSON Lines (JSONL)**
  format. Each JSON object MUST be flattened to a single line without unescaped
  newline characters.

  The generated A2UI MUST conform to this A2UI JSON:
  \`\`\`json
  ${a}.
  \`\`\`

  ## Protocol
  When building the \`createSurface\` message, you MUST set the \`catalogId\` to
  reference the appropriate catalog schema URL.

  You MUST follow the strict message sequence (\`createSurface\` ->
  \`updateComponents\` -> \`updateDataModel\`) and use JSON Pointers for data
  binding.

  ## Validation

  A complete A2UI payload consists of one or more message objects sent as
  continuous JSON objects (or JSON Lines). Every message object MUST include a
  top-level \`"version": "v0.9"\` field.

  The four primary messages you must use to manage a UI surface are:

  1.  **\`createSurface\`**: Sent **FIRST** to signal the client to create a new
      surface. It defines the \`catalogId\` and optional \`theme\` parameters.
  2.  **\`updateComponents\`**: Used to define or update the UI component tree. You
      must provide a flat list of components. One component MUST have an \`id\` of
      \`"root"\`.
  3.  **\`updateDataModel\`**: Used to define or update data values that the
      components bind to.
  4.  **\`deleteSurface\`**: Signals the client to destroy the surface.

  ## Lifecycle and Ordering

  Typical sequence: \`createSurface\` -> \`updateComponents\` -> \`updateDataModel\` (or
  combined/interleaved after creation).

  ## Examples

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

  When referencing data in the data model, you MUST use valid JSON Pointer syntax
  starting with \`/\`.

  ## Actions and Context

  When defining actions (e.g., on buttons), the \`context\` payload is a standard
  JSON object, rather than an array of key-value pairs.

  Example action definition:

  \`\`\`jsonl
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

  `}static \u0275fac=function(e){return new(e||n)};static \u0275prov=ee({token:n,factory:n.\u0275fac,providedIn:"root"})};var yo=["determinateSpinner"];function vo(n,a){if(n&1&&(Du$1(),ai$1(0,"svg",11),Dp(1,"circle",12),Mc()),n&2){let e=bI();Ep("viewBox",e._viewBox()),By(),Lp("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),Ep("r",e._circleRadius());}}var Co=new x("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:ga})}),ga=100,xo=10,_a=(()=>{class n{_elementRef=C(cr$1);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=C(Co),t=Do$1(),i=this._elementRef.nativeElement;this._noopAnimations=t==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=i.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&t==="reduced-motion"&&i.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=ga;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-xo)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(t,i){if(t&1&&Ap(yo,5),t&2){let o;xI(o=AI())&&(i._determinateCircle=o.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(t,i){t&2&&(Ep("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",i.mode==="determinate"?i.value:null)("mode",i.mode),qI("mat-"+i.color),Lp("width",i.diameter,"px")("height",i.diameter,"px")("--mat-progress-spinner-size",i.diameter+"px")("--mat-progress-spinner-active-indicator-width",i.diameter+"px"),Fp("_mat-animation-noopable",i._noopAnimations)("mdc-circular-progress--indeterminate",i.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",yF],diameter:[2,"diameter","diameter",yF],strokeWidth:[2,"strokeWidth","strokeWidth",yF]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(t,i){if(t&1&&(pp(0,vo,2,8,"ng-template",null,0,yD),ai$1(2,"div",2,1),Du$1(),ai$1(4,"svg",3),Dp(5,"circle",4),Mc()(),wu(),ai$1(6,"div",5)(7,"div",6)(8,"div",7),Cp(9,8),Mc(),ai$1(10,"div",9),Cp(11,8),Mc(),ai$1(12,"div",10),Cp(13,8),Mc()()()),t&2){let o=RI(1);By(4),Ep("viewBox",i._viewBox()),By(),Lp("stroke-dasharray",i._strokeCircumference(),"px")("stroke-dashoffset",i._strokeDashOffset(),"px")("stroke-width",i._circleStrokeWidth(),"%"),Ep("r",i._circleRadius()),By(4),Ip("ngTemplateOutlet",o),By(2),Ip("ngTemplateOutlet",o),By(2),Ip("ngTemplateOutlet",o);}},dependencies:[Wt],styles:[`.mat-mdc-progress-spinner {
  --mat-progress-spinner-animation-multiplier: 1;
  display: block;
  overflow: hidden;
  line-height: 0;
  position: relative;
  direction: ltr;
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mat-mdc-progress-spinner circle {
  stroke-width: var(--mat-progress-spinner-active-indicator-width, 4px);
}
.mat-mdc-progress-spinner._mat-animation-noopable, .mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__determinate-circle {
  transition: none !important;
}
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-circle-graphic,
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__spinner-layer,
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container {
  animation: none !important;
}
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container circle {
  stroke-dasharray: 0 !important;
}
@media (forced-colors: active) {
  .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic,
  .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle {
    stroke: currentColor;
    stroke: CanvasText;
  }
}

.mat-progress-spinner-reduced-motion {
  --mat-progress-spinner-animation-multiplier: 1.25;
}

.mdc-circular-progress__determinate-container,
.mdc-circular-progress__indeterminate-circle-graphic,
.mdc-circular-progress__indeterminate-container,
.mdc-circular-progress__spinner-layer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.mdc-circular-progress__determinate-container {
  transform: rotate(-90deg);
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__determinate-container {
  opacity: 0;
}

.mdc-circular-progress__indeterminate-container {
  font-size: 0;
  letter-spacing: 0;
  white-space: nowrap;
  opacity: 0;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__indeterminate-container {
  opacity: 1;
  animation: mdc-circular-progress-container-rotate calc(1568.2352941176ms * var(--mat-progress-spinner-animation-multiplier)) linear infinite;
}

.mdc-circular-progress__determinate-circle-graphic,
.mdc-circular-progress__indeterminate-circle-graphic {
  fill: transparent;
}

.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,
.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic {
  stroke: var(--mat-progress-spinner-active-indicator-color, var(--mat-sys-primary));
}
@media (forced-colors: active) {
  .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,
  .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic {
    stroke: CanvasText;
  }
}

.mdc-circular-progress__determinate-circle {
  transition: stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1);
}

.mdc-circular-progress__gap-patch {
  position: absolute;
  top: 0;
  left: 47.5%;
  box-sizing: border-box;
  width: 5%;
  height: 100%;
  overflow: hidden;
}

.mdc-circular-progress__gap-patch .mdc-circular-progress__indeterminate-circle-graphic {
  left: -900%;
  width: 2000%;
  transform: rotate(180deg);
}
.mdc-circular-progress__circle-clipper .mdc-circular-progress__indeterminate-circle-graphic {
  width: 200%;
}
.mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic {
  left: -100%;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-left .mdc-circular-progress__indeterminate-circle-graphic {
  animation: mdc-circular-progress-left-spin calc(1333ms * var(--mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic {
  animation: mdc-circular-progress-right-spin calc(1333ms * var(--mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

.mdc-circular-progress__circle-clipper {
  display: inline-flex;
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
}

.mdc-circular-progress--indeterminate .mdc-circular-progress__spinner-layer {
  animation: mdc-circular-progress-spinner-layer-rotate calc(5332ms * var(--mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

@keyframes mdc-circular-progress-container-rotate {
  to {
    transform: rotate(360deg);
  }
}
@keyframes mdc-circular-progress-spinner-layer-rotate {
  12.5% {
    transform: rotate(135deg);
  }
  25% {
    transform: rotate(270deg);
  }
  37.5% {
    transform: rotate(405deg);
  }
  50% {
    transform: rotate(540deg);
  }
  62.5% {
    transform: rotate(675deg);
  }
  75% {
    transform: rotate(810deg);
  }
  87.5% {
    transform: rotate(945deg);
  }
  100% {
    transform: rotate(1080deg);
  }
}
@keyframes mdc-circular-progress-left-spin {
  from {
    transform: rotate(265deg);
  }
  50% {
    transform: rotate(130deg);
  }
  to {
    transform: rotate(265deg);
  }
}
@keyframes mdc-circular-progress-right-spin {
  from {
    transform: rotate(-265deg);
  }
  50% {
    transform: rotate(-130deg);
  }
  to {
    transform: rotate(-265deg);
  }
}
`],encapsulation:2})}return n})();var ba=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$E({type:n});static \u0275inj=jl({imports:[Se]})}return n})();function Do(n,a){}var Ue=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;positionStrategy;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;scrollStrategy;closeOnNavigation=true;closeOnDestroy=true;closeOnOverlayDetachments=true;disableAnimations=false;providers;container;templateContext;bindings};var $n=(()=>{class n extends st{_elementRef=C(cr$1);_focusTrapFactory=C(wo);_config;_interactivityChecker=C(jr$1);_ngZone=C(Ce);_focusMonitor=C(At$1);_renderer=C(zv);_changeDetectorRef=C(hF);_injector=C(fe);_platform=C(R);_document=C(No$1);_portalOutlet;_focusTrapped=new X;_focusTrap=null;_elementFocusedBeforeDialogWasOpened=null;_closeInteractionType=null;_ariaLabelledByQueue=[];_isDestroyed=false;constructor(){super(),this._config=C(Ue,{optional:true})||new Ue,this._config.ariaLabelledBy&&this._ariaLabelledByQueue.push(this._config.ariaLabelledBy);}_addAriaLabelledBy(e){this._ariaLabelledByQueue.push(e),this._changeDetectorRef.markForCheck();}_removeAriaLabelledBy(e){let t=this._ariaLabelledByQueue.indexOf(e);t>-1&&(this._ariaLabelledByQueue.splice(t,1),this._changeDetectorRef.markForCheck());}_contentAttached(){this._initializeFocusTrap(),this._captureInitialFocus();}_captureInitialFocus(){this._trapFocus();}ngOnDestroy(){this._focusTrapped.complete(),this._isDestroyed=true,this._restoreFocus();}attachComponentPortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachComponentPortal(e);return this._contentAttached(),t}attachTemplatePortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachTemplatePortal(e);return this._contentAttached(),t}attachDomPortal=e=>{this._portalOutlet.hasAttached();let t=this._portalOutlet.attachDomPortal(e);return this._contentAttached(),t};_recaptureFocus(){this._containsFocus()||this._trapFocus();}_forceFocus(e,t){this._interactivityChecker.isFocusable(e)||(e.tabIndex=-1,this._ngZone.runOutsideAngular(()=>{let i=()=>{o(),r(),e.removeAttribute("tabindex");},o=this._renderer.listen(e,"blur",i),r=this._renderer.listen(e,"mousedown",i);})),e.focus(t);}_focusByCssSelector(e,t){let i=this._elementRef.nativeElement.querySelector(e);i&&this._forceFocus(i,t);}_trapFocus(e){this._isDestroyed||Wy(()=>{let t=this._elementRef.nativeElement;switch(this._config.autoFocus){case  false:case "dialog":this._containsFocus()||t.focus(e);break;case  true:case "first-tabbable":this._focusTrap?.focusInitialElement(e)||this._focusDialogContainer(e);break;case "first-heading":this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]',e);break;default:this._focusByCssSelector(this._config.autoFocus,e);break}this._focusTrapped.next();},{injector:this._injector});}_restoreFocus(){let e=this._config.restoreFocus,t=null;if(typeof e=="string"?t=this._document.querySelector(e):typeof e=="boolean"?t=e?this._elementFocusedBeforeDialogWasOpened:null:e&&(t=e),this._config.restoreFocus&&t&&typeof t.focus=="function"){let i=oo$1(),o=this._elementRef.nativeElement;(!i||i===this._document.body||i===o||o.contains(i))&&(this._focusMonitor?(this._focusMonitor.focusVia(t,this._closeInteractionType),this._closeInteractionType=null):t.focus());}this._focusTrap&&this._focusTrap.destroy();}_focusDialogContainer(e){this._elementRef.nativeElement.focus?.(e);}_containsFocus(){let e=this._elementRef.nativeElement,t=oo$1();return e===t||e.contains(t)}_initializeFocusTrap(){this._platform.isBrowser&&(this._focusTrap=this._focusTrapFactory.create(this._elementRef.nativeElement),this._document&&(this._elementFocusedBeforeDialogWasOpened=oo$1()));}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["cdk-dialog-container"]],viewQuery:function(t,i){if(t&1&&Ap(Xi,7),t&2){let o;xI(o=AI())&&(i._portalOutlet=o.first);}},hostAttrs:["tabindex","-1",1,"cdk-dialog-container"],hostVars:6,hostBindings:function(t,i){t&2&&Ep("id",i._config.id||null)("role",i._config.role)("aria-modal",i._config.ariaModal)("aria-labelledby",i._config.ariaLabel?null:i._ariaLabelledByQueue[0])("aria-label",i._config.ariaLabel)("aria-describedby",i._config.ariaDescribedBy||null);},features:[dp],decls:1,vars:0,consts:[["cdkPortalOutlet",""]],template:function(t,i){t&1&&pp(0,Do,0,0,"ng-template",0);},dependencies:[Xi],styles:[`.cdk-dialog-container {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
  max-height: inherit;
}
`],encapsulation:2,changeDetection:1})}return n})(),Pt=class{overlayRef;config;componentInstance=null;componentRef=null;containerInstance;disableClose;closed=new X;backdropClick;keydownEvents;outsidePointerEvents;id;_detachSubscription;constructor(a,e){this.overlayRef=a,this.config=e,this.disableClose=e.disableClose,this.backdropClick=a.backdropClick(),this.keydownEvents=a.keydownEvents(),this.outsidePointerEvents=a.outsidePointerEvents(),this.id=e.id,this.keydownEvents.subscribe(t=>{t.keyCode===27&&!this.disableClose&&!Wr$1(t)&&(t.preventDefault(),this.close(void 0,{focusOrigin:"keyboard"}));}),this.backdropClick.subscribe(()=>{!this.disableClose&&this._canClose()?this.close(void 0,{focusOrigin:"mouse"}):this.containerInstance._recaptureFocus?.();}),this._detachSubscription=a.detachments().subscribe(()=>{e.closeOnOverlayDetachments!==false&&this.close();});}close(a,e){if(this._canClose(a)){let t=this.closed;this.containerInstance._closeInteractionType=e?.focusOrigin||"program",this._detachSubscription.unsubscribe(),this.overlayRef.dispose(),t.next(a),t.complete(),this.componentInstance=this.containerInstance=null;}}updatePosition(){return this.overlayRef.updatePosition(),this}updateSize(a="",e=""){return this.overlayRef.updateSize({width:a,height:e}),this}addPanelClass(a){return this.overlayRef.addPanelClass(a),this}removePanelClass(a){return this.overlayRef.removePanelClass(a),this}_canClose(a){let e=this.config;return !!this.containerInstance&&(!e.closePredicate||e.closePredicate(a,e,this.componentInstance))}},ko=new x("DialogScrollStrategy",{providedIn:"root",factory:()=>{let n=C(fe);return ()=>ge(n)}}),Mo=new x("DialogData"),So=new x("DefaultDialogConfig");function Ro(n){let a=So$1(n),e=new Le;return {valueSignal:a,get value(){return a()},change:e,ngOnDestroy(){e.complete();}}}var Jn=(()=>{class n{_injector=C(fe);_defaultOptions=C(So,{optional:true});_parentDialog=C(n,{optional:true,skipSelf:true});_overlayContainer=C(Se$1);_idGenerator=C(An$1);_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new X;_afterOpenedAtThisLevel=new X;_ariaHiddenElements=new Map;_scrollStrategy=C(ko);get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}afterAllClosed=Kh(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(pg(void 0)));open(e,t){let i=this._defaultOptions||new Ue;t=q(q({},i),t),t.id=t.id||this._idGenerator.getId("cdk-dialog-"),t.id&&this.getDialogById(t.id);let o=this._getOverlayConfig(t),r=mt(this._injector,o),l=new Pt(r,t),p=this._attachContainer(r,l,t);if(l.containerInstance=p,!this.openDialogs.length){let h=this._overlayContainer.getContainerElement();p._focusTrapped?p._focusTrapped.pipe(Kt(1)).subscribe(()=>{this._hideNonDialogContentFromAssistiveTechnology(h);}):this._hideNonDialogContentFromAssistiveTechnology(h);}return this._attachDialogContent(e,l,p,t),this.openDialogs.push(l),l.closed.subscribe(()=>this._removeOpenDialog(l,true)),this.afterOpened.next(l),l}closeAll(){Gn(this.openDialogs,e=>e.close());}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){Gn(this._openDialogsAtThisLevel,e=>{e.config.closeOnDestroy===false&&this._removeOpenDialog(e,false);}),Gn(this._openDialogsAtThisLevel,e=>e.close()),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete(),this._openDialogsAtThisLevel=[];}_getOverlayConfig(e){let t=new ct({positionStrategy:e.positionStrategy||Re$1().centerHorizontally().centerVertically(),scrollStrategy:e.scrollStrategy||this._scrollStrategy(),panelClass:e.panelClass,hasBackdrop:e.hasBackdrop,direction:e.direction,minWidth:e.minWidth,minHeight:e.minHeight,maxWidth:e.maxWidth,maxHeight:e.maxHeight,width:e.width,height:e.height,disposeOnNavigation:e.closeOnNavigation,disableAnimations:e.disableAnimations});return e.backdropClass&&(t.backdropClass=e.backdropClass),t}_attachContainer(e,t,i){let o=i.injector||i.viewContainerRef?.injector,r=[{provide:Ue,useValue:i},{provide:Pt,useValue:t},{provide:ft,useValue:e}],l;i.container?typeof i.container=="function"?l=i.container:(l=i.container.type,r.push(...i.container.providers(i))):l=$n;let p=new Z(l,i.viewContainerRef,fe.create({parent:o||this._injector,providers:r}));return e.attach(p).instance}_attachDialogContent(e,t,i,o){if(e instanceof nr$1){let r=this._createInjector(o,t,i,void 0),l={$implicit:o.data,dialogRef:t};o.templateContext&&(l=q(q({},l),typeof o.templateContext=="function"?o.templateContext():o.templateContext)),i.attachTemplatePortal(new G(e,null,l,r));}else {let r=this._createInjector(o,t,i,this._injector),l=i.attachComponentPortal(new Z(e,o.viewContainerRef,r,null,o.bindings));t.componentRef=l,t.componentInstance=l.instance;}}_createInjector(e,t,i,o){let r=e.injector||e.viewContainerRef?.injector,l=[{provide:Mo,useValue:e.data},{provide:Pt,useValue:t}];return e.providers&&(typeof e.providers=="function"?l.push(...e.providers(t,e,i)):l.push(...e.providers)),e.direction&&(!r||!r.get(zo$2,null,{optional:true}))&&l.push({provide:zo$2,useValue:Ro(e.direction)}),fe.create({parent:r||o,providers:l})}_removeOpenDialog(e,t){let i=this.openDialogs.indexOf(e);i>-1&&(this.openDialogs.splice(i,1),this.openDialogs.length||(this._ariaHiddenElements.forEach((o,r)=>{o?r.setAttribute("aria-hidden",o):r.removeAttribute("aria-hidden");}),this._ariaHiddenElements.clear(),t&&this._getAfterAllClosed().next()));}_hideNonDialogContentFromAssistiveTechnology(e){if(e.parentElement){let t=e.parentElement.children;for(let i=t.length-1;i>-1;i--){let o=t[i];o!==e&&o.nodeName!=="SCRIPT"&&o.nodeName!=="STYLE"&&!o.hasAttribute("aria-live")&&!o.hasAttribute("popover")&&(this._ariaHiddenElements.set(o,o.getAttribute("aria-hidden")),o.setAttribute("aria-hidden","true"));}}}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}static \u0275fac=function(t){return new(t||n)};static \u0275prov=ar$1({token:n,factory:n.\u0275fac})}return n})();function Gn(n,a){let e=n.length;for(;e--;)a(n[e]);}var va=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$E({type:n});static \u0275inj=jl({providers:[Jn],imports:[zt,le,Co$1,le]})}return n})();function To(n,a){}var mn=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;position;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;delayFocusTrap=true;scrollStrategy;closeOnNavigation=true;enterAnimationDuration;exitAnimationDuration;bindings},qn="mdc-dialog--open",Ca="mdc-dialog--opening",xa="mdc-dialog--closing",Eo=150,Po=75,Oo=(()=>{class n extends $n{_animationStateChanged=new Le;_animationsEnabled=!xe$1();_actionSectionCount=0;_hostElement=this._elementRef.nativeElement;_enterAnimationDuration=this._animationsEnabled?Da(this._config.enterAnimationDuration)??Eo:0;_exitAnimationDuration=this._animationsEnabled?Da(this._config.exitAnimationDuration)??Po:0;_animationTimer=null;_contentAttached(){super._contentAttached(),this._startOpenAnimation();}_startOpenAnimation(){this._animationStateChanged.emit({state:"opening",totalTime:this._enterAnimationDuration}),this._animationsEnabled?(this._hostElement.style.setProperty(wa,`${this._enterAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(Ca,qn)),this._waitForAnimationToComplete(this._enterAnimationDuration,this._finishDialogOpen)):(this._hostElement.classList.add(qn),Promise.resolve().then(()=>this._finishDialogOpen()));}_startExitAnimation(){this._animationStateChanged.emit({state:"closing",totalTime:this._exitAnimationDuration}),this._hostElement.classList.remove(qn),this._animationsEnabled?(this._hostElement.style.setProperty(wa,`${this._exitAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(xa)),this._waitForAnimationToComplete(this._exitAnimationDuration,this._finishDialogClose)):Promise.resolve().then(()=>this._finishDialogClose());}_updateActionSectionCount(e){this._actionSectionCount+=e,this._changeDetectorRef.markForCheck();}_finishDialogOpen=()=>{this._clearAnimationClasses(),this._openAnimationDone(this._enterAnimationDuration);};_finishDialogClose=()=>{this._clearAnimationClasses(),this._animationStateChanged.emit({state:"closed",totalTime:this._exitAnimationDuration});};_clearAnimationClasses(){this._hostElement.classList.remove(Ca,xa);}_waitForAnimationToComplete(e,t){this._animationTimer!==null&&clearTimeout(this._animationTimer),this._animationTimer=setTimeout(t,e);}_requestAnimationFrame(e){this._ngZone.runOutsideAngular(()=>{typeof requestAnimationFrame=="function"?requestAnimationFrame(e):e();});}_captureInitialFocus(){this._config.delayFocusTrap||this._trapFocus();}_openAnimationDone(e){this._config.delayFocusTrap&&this._trapFocus(),this._animationStateChanged.next({state:"opened",totalTime:e});}ngOnDestroy(){super.ngOnDestroy(),this._animationTimer!==null&&clearTimeout(this._animationTimer);}attachComponentPortal(e){let t=super.attachComponentPortal(e);return t.location.nativeElement.classList.add("mat-mdc-dialog-component-host"),t}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275cmp=HE({type:n,selectors:[["mat-dialog-container"]],hostAttrs:["tabindex","-1",1,"mat-mdc-dialog-container","mdc-dialog"],hostVars:10,hostBindings:function(t,i){t&2&&(bp("id",i._config.id),Ep("aria-modal",i._config.ariaModal)("role",i._config.role)("aria-labelledby",i._config.ariaLabel?null:i._ariaLabelledByQueue[0])("aria-label",i._config.ariaLabel)("aria-describedby",i._config.ariaDescribedBy||null),Fp("_mat-animation-noopable",!i._animationsEnabled)("mat-mdc-dialog-container-with-actions",i._actionSectionCount>0));},features:[dp],decls:3,vars:0,consts:[[1,"mat-mdc-dialog-inner-container","mdc-dialog__container"],[1,"mat-mdc-dialog-surface","mdc-dialog__surface"],["cdkPortalOutlet",""]],template:function(t,i){t&1&&(ai$1(0,"div",0)(1,"div",1),pp(2,To,0,0,"ng-template",2),Mc()());},dependencies:[Xi],styles:[`.mat-mdc-dialog-container {
  width: 100%;
  height: 100%;
  display: block;
  box-sizing: border-box;
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
  outline: 0;
}

.cdk-overlay-pane.mat-mdc-dialog-panel {
  max-width: var(--mat-dialog-container-max-width, 560px);
  min-width: var(--mat-dialog-container-min-width, 280px);
}
@media (max-width: 599px) {
  .cdk-overlay-pane.mat-mdc-dialog-panel {
    max-width: var(--mat-dialog-container-small-max-width, calc(100vw - 32px));
  }
}

.mat-mdc-dialog-inner-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;
  height: 100%;
  opacity: 0;
  transition: opacity linear var(--mat-dialog-transition-duration, 0ms);
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
}
.mdc-dialog--closing .mat-mdc-dialog-inner-container {
  transition: opacity 75ms linear;
  transform: none;
}
.mdc-dialog--open .mat-mdc-dialog-inner-container {
  opacity: 1;
}
._mat-animation-noopable .mat-mdc-dialog-inner-container {
  transition: none;
}

.mat-mdc-dialog-surface {
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  outline: 0;
  transform: scale(0.8);
  transition: transform var(--mat-dialog-transition-duration, 0ms) cubic-bezier(0, 0, 0.2, 1);
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
  box-shadow: var(--mat-dialog-container-elevation-shadow, none);
  border-radius: var(--mat-dialog-container-shape, var(--mat-sys-corner-extra-large, 4px));
  background-color: var(--mat-dialog-container-color, var(--mat-sys-surface, white));
}
[dir=rtl] .mat-mdc-dialog-surface {
  text-align: right;
}
.mdc-dialog--open .mat-mdc-dialog-surface, .mdc-dialog--closing .mat-mdc-dialog-surface {
  transform: none;
}
._mat-animation-noopable .mat-mdc-dialog-surface {
  transition: none;
}
.mat-mdc-dialog-surface::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 2px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}

.mat-mdc-dialog-title {
  display: block;
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  margin: 0 0 1px;
  padding: var(--mat-dialog-headline-padding, 6px 24px 13px);
}
.mat-mdc-dialog-title::before {
  display: inline-block;
  width: 0;
  height: 40px;
  content: "";
  vertical-align: 0;
}
[dir=rtl] .mat-mdc-dialog-title {
  text-align: right;
}
.mat-mdc-dialog-container .mat-mdc-dialog-title {
  color: var(--mat-dialog-subhead-color, var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
  font-family: var(--mat-dialog-subhead-font, var(--mat-sys-headline-small-font, inherit));
  line-height: var(--mat-dialog-subhead-line-height, var(--mat-sys-headline-small-line-height, 1.5rem));
  font-size: var(--mat-dialog-subhead-size, var(--mat-sys-headline-small-size, 1rem));
  font-weight: var(--mat-dialog-subhead-weight, var(--mat-sys-headline-small-weight, 400));
  letter-spacing: var(--mat-dialog-subhead-tracking, var(--mat-sys-headline-small-tracking, 0.03125em));
}

.mat-mdc-dialog-content {
  display: block;
  flex-grow: 1;
  box-sizing: border-box;
  margin: 0;
  overflow: auto;
  max-height: 65vh;
}
.mat-mdc-dialog-content > :first-child {
  margin-top: 0;
}
.mat-mdc-dialog-content > :last-child {
  margin-bottom: 0;
}
.mat-mdc-dialog-container .mat-mdc-dialog-content {
  color: var(--mat-dialog-supporting-text-color, var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6)));
  font-family: var(--mat-dialog-supporting-text-font, var(--mat-sys-body-medium-font, inherit));
  line-height: var(--mat-dialog-supporting-text-line-height, var(--mat-sys-body-medium-line-height, 1.5rem));
  font-size: var(--mat-dialog-supporting-text-size, var(--mat-sys-body-medium-size, 1rem));
  font-weight: var(--mat-dialog-supporting-text-weight, var(--mat-sys-body-medium-weight, 400));
  letter-spacing: var(--mat-dialog-supporting-text-tracking, var(--mat-sys-body-medium-tracking, 0.03125em));
}
.mat-mdc-dialog-container .mat-mdc-dialog-content {
  padding: var(--mat-dialog-content-padding, 20px 24px);
}
.mat-mdc-dialog-container-with-actions .mat-mdc-dialog-content {
  padding: var(--mat-dialog-with-actions-content-padding, 20px 24px 0);
}
.mat-mdc-dialog-container .mat-mdc-dialog-title + .mat-mdc-dialog-content {
  padding-top: 0;
}

.mat-mdc-dialog-actions {
  display: flex;
  position: relative;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  box-sizing: border-box;
  min-height: 52px;
  margin: 0;
  border-top: 1px solid transparent;
  padding: var(--mat-dialog-actions-padding, 16px 24px);
  justify-content: var(--mat-dialog-actions-alignment, flex-end);
}
@media (forced-colors: active) {
  .mat-mdc-dialog-actions {
    border-top-color: CanvasText;
  }
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-start, .mat-mdc-dialog-actions[align=start] {
  justify-content: start;
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-center, .mat-mdc-dialog-actions[align=center] {
  justify-content: center;
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-end, .mat-mdc-dialog-actions[align=end] {
  justify-content: flex-end;
}
.mat-mdc-dialog-actions .mat-button-base + .mat-button-base,
.mat-mdc-dialog-actions .mat-mdc-button-base + .mat-mdc-button-base {
  margin-left: 8px;
}
[dir=rtl] .mat-mdc-dialog-actions .mat-button-base + .mat-button-base,
[dir=rtl] .mat-mdc-dialog-actions .mat-mdc-button-base + .mat-mdc-button-base {
  margin-left: 0;
  margin-right: 8px;
}

.mat-mdc-dialog-component-host {
  display: contents;
}
`],encapsulation:2,changeDetection:1})}return n})(),wa="--mat-dialog-transition-duration";function Da(n){return n==null?null:typeof n=="number"?n:n.endsWith("ms")?bn$1(n.substring(0,n.length-2)):n.endsWith("s")?bn$1(n.substring(0,n.length-1))*1e3:n==="0"?0:null}var dn=(function(n){return n[n.OPEN=0]="OPEN",n[n.CLOSING=1]="CLOSING",n[n.CLOSED=2]="CLOSED",n})(dn||{}),Ot=class{_ref;_config;_containerInstance;componentInstance;componentRef=null;disableClose;id;_afterOpened=new Nn(1);_beforeClosed=new Nn(1);_result;_closeFallbackTimeout;_state=dn.OPEN;_closeInteractionType;constructor(a,e,t){this._ref=a,this._config=e,this._containerInstance=t,this.disableClose=e.disableClose,this.id=a.id,a.addPanelClass("mat-mdc-dialog-panel"),t._animationStateChanged.pipe(Rn$1(i=>i.state==="opened"),Kt(1)).subscribe(()=>{this._afterOpened.next(),this._afterOpened.complete();}),t._animationStateChanged.pipe(Rn$1(i=>i.state==="closed"),Kt(1)).subscribe(()=>{clearTimeout(this._closeFallbackTimeout),this._finishDialogClose();}),a.overlayRef.detachments().subscribe(()=>{this._beforeClosed.next(this._result),this._beforeClosed.complete(),this._finishDialogClose();}),Xh(this.backdropClick(),this.keydownEvents().pipe(Rn$1(i=>i.keyCode===27&&!this.disableClose&&!Wr$1(i)))).subscribe(i=>{this.disableClose||(i.preventDefault(),ka(this,i.type==="keydown"?"keyboard":"mouse"));});}close(a){let e=this._config.closePredicate;e&&!e(a,this._config,this.componentInstance)||(this._result=a,this._containerInstance._animationStateChanged.pipe(Rn$1(t=>t.state==="closing"),Kt(1)).subscribe(t=>{this._beforeClosed.next(a),this._beforeClosed.complete(),this._ref.overlayRef.detachBackdrop(),this._closeFallbackTimeout=setTimeout(()=>this._finishDialogClose(),t.totalTime+100);}),this._state=dn.CLOSING,this._containerInstance._startExitAnimation());}afterOpened(){return this._afterOpened}afterClosed(){return this._ref.closed}beforeClosed(){return this._beforeClosed}backdropClick(){return this._ref.backdropClick}keydownEvents(){return this._ref.keydownEvents}updatePosition(a){let e=this._ref.config.positionStrategy;return a&&(a.left||a.right)?a.left?e.left(a.left):e.right(a.right):e.centerHorizontally(),a&&(a.top||a.bottom)?a.top?e.top(a.top):e.bottom(a.bottom):e.centerVertically(),this._ref.updatePosition(),this}updateSize(a="",e=""){return this._ref.updateSize(a,e),this}addPanelClass(a){return this._ref.addPanelClass(a),this}removePanelClass(a){return this._ref.removePanelClass(a),this}getState(){return this._state}_finishDialogClose(){this._state=dn.CLOSED,this._ref.close(this._result,{focusOrigin:this._closeInteractionType}),this.componentInstance=null;}};function ka(n,a,e){return n._closeInteractionType=a,n.close(e)}var Kn=new x("MatMdcDialogData"),Io=new x("mat-mdc-dialog-default-options"),Ao=new x("mat-mdc-dialog-scroll-strategy",{providedIn:"root",factory:()=>{let n=C(fe);return ()=>ge(n)}}),It=(()=>{class n{_defaultOptions=C(Io,{optional:true});_scrollStrategy=C(Ao);_parentDialog=C(n,{optional:true,skipSelf:true});_idGenerator=C(An$1);_injector=C(fe);_dialog=C(Jn);_animationsDisabled=xe$1();_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new X;_afterOpenedAtThisLevel=new X;dialogConfigClass=mn;_dialogRefConstructor;_dialogContainerType;_dialogDataToken;get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}afterAllClosed=Kh(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(pg(void 0)));constructor(){this._dialogRefConstructor=Ot,this._dialogContainerType=Oo,this._dialogDataToken=Kn;}open(e,t){let i;t=q(q({},this._defaultOptions||new mn),t),t.id=t.id||this._idGenerator.getId("mat-mdc-dialog-"),t.scrollStrategy=t.scrollStrategy||this._scrollStrategy();let o=this._dialog.open(e,W(q({},t),{positionStrategy:Re$1(this._injector).centerHorizontally().centerVertically(),disableClose:true,closePredicate:void 0,closeOnDestroy:false,closeOnOverlayDetachments:false,disableAnimations:this._animationsDisabled||t.enterAnimationDuration?.toLocaleString()==="0"||t.exitAnimationDuration?.toString()==="0",container:{type:this._dialogContainerType,providers:()=>[{provide:this.dialogConfigClass,useValue:t},{provide:Ue,useValue:t}]},templateContext:()=>({dialogRef:i}),providers:(r,l,p)=>(i=new this._dialogRefConstructor(r,t,p),i.updatePosition(t?.position),[{provide:this._dialogContainerType,useValue:p},{provide:this._dialogDataToken,useValue:l.data},{provide:this._dialogRefConstructor,useValue:i}])}));return i.componentRef=o.componentRef,i.componentInstance=o.componentInstance,this.openDialogs.push(i),this.afterOpened.next(i),i.afterClosed().subscribe(()=>{let r=this.openDialogs.indexOf(i);r>-1&&(this.openDialogs.splice(r,1),this.openDialogs.length||this._getAfterAllClosed().next());}),i}closeAll(){this._closeDialogs(this.openDialogs);}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){this._closeDialogs(this._openDialogsAtThisLevel),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete();}_closeDialogs(e){let t=e.length;for(;t--;)e[t].close();}static \u0275fac=function(t){return new(t||n)};static \u0275prov=ar$1({token:n,factory:n.\u0275fac})}return n})(),Ma=(()=>{class n{dialogRef=C(Ot,{optional:true});_elementRef=C(cr$1);_dialog=C(It);ariaLabel;type="button";dialogResult;_matDialogClose;ngOnInit(){this.dialogRef||(this.dialogRef=Pa(this._elementRef,this._dialog.openDialogs));}ngOnChanges(e){let t=e._matDialogClose;t&&(this.dialogResult=t.currentValue);}_onButtonClick(e){ka(this.dialogRef,e.screenX===0&&e.screenY===0?"keyboard":"mouse",this.dialogResult);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","mat-dialog-close",""],["","matDialogClose",""]],hostVars:2,hostBindings:function(t,i){t&1&&Mp("click",function(r){return i._onButtonClick(r)}),t&2&&Ep("aria-label",i.ariaLabel||null)("type",i.type);},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],type:"type",dialogResult:[0,"mat-dialog-close","dialogResult"],_matDialogClose:[0,"matDialogClose","_matDialogClose"]},exportAs:["matDialogClose"],features:[pm]})}return n})(),Sa=(()=>{class n{_dialogRef=C(Ot,{optional:true});_elementRef=C(cr$1);_dialog=C(It);ngOnInit(){this._dialogRef||(this._dialogRef=Pa(this._elementRef,this._dialog.openDialogs)),this._dialogRef&&Promise.resolve().then(()=>{this._onAdd();});}ngOnDestroy(){this._dialogRef?._containerInstance&&Promise.resolve().then(()=>{this._onRemove();});}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n})}return n})(),Ra=(()=>{class n extends Sa{id=C(An$1).getId("mat-mdc-dialog-title-");_onAdd(){this._dialogRef._containerInstance?._addAriaLabelledBy?.(this.id);}_onRemove(){this._dialogRef?._containerInstance?._removeAriaLabelledBy?.(this.id);}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","mat-dialog-title",""],["","matDialogTitle",""]],hostAttrs:[1,"mat-mdc-dialog-title","mdc-dialog__title"],hostVars:1,hostBindings:function(t,i){t&2&&bp("id",i.id);},inputs:{id:"id"},exportAs:["matDialogTitle"],features:[dp]})}return n})(),Ta=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","mat-dialog-content",""],["mat-dialog-content"],["","matDialogContent",""]],hostAttrs:[1,"mat-mdc-dialog-content","mdc-dialog__content"],features:[YE([Ve])]})}return n})(),Ea=(()=>{class n extends Sa{align;_onAdd(){this._dialogRef._containerInstance?._updateActionSectionCount?.(1);}_onRemove(){this._dialogRef._containerInstance?._updateActionSectionCount?.(-1);}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","mat-dialog-actions",""],["mat-dialog-actions"],["","matDialogActions",""]],hostAttrs:[1,"mat-mdc-dialog-actions","mdc-dialog__actions"],hostVars:6,hostBindings:function(t,i){t&2&&Fp("mat-mdc-dialog-actions-align-start",i.align==="start")("mat-mdc-dialog-actions-align-center",i.align==="center")("mat-mdc-dialog-actions-align-end",i.align==="end");},inputs:{align:"align"},features:[dp]})}return n})();function Pa(n,a){let e=n.nativeElement.parentElement;for(;e&&!e.classList.contains("mat-mdc-dialog-container");)e=e.parentElement;return e?a.find(t=>t.id===e.id):null}var pn=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$E({type:n});static \u0275inj=jl({providers:[It],imports:[va,zt,le,Se]})}return n})();var un=class n{data=C(Kn);static \u0275fac=function(e){return new(e||n)};static \u0275cmp=HE({type:n,selectors:[["a2ui-composer-system-instructions-dialog"]],decls:9,vars:1,consts:[["mat-dialog-title",""],["tabindex","0","aria-label","System instructions text",1,"dialog-content-scrollable"],[1,"instructions-text"],["align","end"],["mat-button","","mat-dialog-close",""]],template:function(e,t){e&1&&(ai$1(0,"h2",0),tD(1,"System Instructions"),Mc(),ai$1(2,"mat-dialog-content")(3,"div",1)(4,"pre",2),tD(5),Mc()()(),ai$1(6,"mat-dialog-actions",3)(7,"button",4),tD(8,"Close"),Mc()()),e&2&&(By(5),Up(t.data));},dependencies:[pn,Ma,Ra,Ea,Ta,Ed,yd],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-left:0!important;padding-right:0!important}.dialog-content-scrollable[_ngcontent-%COMP%]{margin:0 16px;max-height:400px;overflow-y:auto;background-color:var(--mat-sys-surface-container-high);padding:16px;border-radius:4px}.dialog-content-scrollable[_ngcontent-%COMP%]:focus{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.instructions-text[_ngcontent-%COMP%]{margin:0;font-family:Roboto Mono,Consolas,monospace;font-size:12px;line-height:1.5;white-space:pre-wrap;color:var(--mat-sys-on-surface)}"]})};function Fo(n,a){n&1&&(ai$1(0,"mat-icon",6),tD(1,"error"),Mc());}function No(n,a){n&1&&Dp(0,"mat-spinner",7),n&2&&Ip("diameter",40);}function Bo(n,a){if(n&1){let e=TI();ai$1(0,"div",5),Mp("click",function(){cu(e);let i=bI();return lu(i.dismissOverlay())})("keydown.enter",function(){cu(e);let i=bI();return lu(i.dismissOverlay())})("keydown.space",function(i){cu(e);let o=bI();return i.preventDefault(),lu(o.dismissOverlay())}),fI(1,Fo,2,0,"mat-icon",6)(2,No,1,1,"mat-spinner",7),ai$1(3,"div",8),tD(4),Mc()();}if(n&2){let e=bI();qI(e.pipelineStatus()),By(),pI(e.pipelineStatus()==="failed"?1:2),By(3),Up(e.pipelineStatusText());}}function zo(n,a){n&1&&(ai$1(0,"div",4)(1,"mat-icon",9),tD(2,"vpn_key"),Mc(),ai$1(3,"p",10),tD(4," This feature is only available with a valid Gemini API key. "),Mc(),ai$1(5,"a",11),tD(6," Add Gemini API key "),Mc()());}function Ho(n,a){n&1&&(ai$1(0,"div",13)(1,"span",20),tD(2,"\u{1F4AC}"),Mc(),ai$1(3,"p",21),tD(4," Ask Gemini to shape your layout interfaces or generate dynamic mock configurations schemas. Let's get started! "),Mc()());}function jo(n,a){if(n&1&&(ai$1(0,"span",25),tD(1),Mc()),n&2){let e=bI().$implicit;By(),Up(e.isSnapshot?"Canvas Revision Snapshot":"You");}}function Vo(n,a){n&1&&(ai$1(0,"span",25),tD(1,"Gemini AI"),Mc());}function Wo(n,a){n&1&&(ai$1(0,"span",26),tD(1,"Gateway Exception Diagnostic"),Mc());}function Uo(n,a){if(n&1&&(ai$1(0,"p",28),tD(1),Mc()),n&2){let e=bI().$implicit;By(),kc("A2UI JSON: ",e.componentCount," components");}}function Qo(n,a){if(n&1){let e=TI();ai$1(0,"div",29)(1,"button",30),Mp("click",function(){cu(e);let i=bI(2).$implicit,o=bI(3);return lu(o.retryPrompt(i.originalPrompt||""))}),ai$1(2,"mat-icon",31),tD(3,"refresh"),Mc(),tD(4," Retry Request "),Mc()();}if(n&2){let e=bI(5);By(),Ip("disabled",e.isLocked());}}function Go(n,a){if(n&1&&(ai$1(0,"p",28),tD(1),Mc(),fI(2,Qo,5,1,"div",29)),n&2){let e=bI().$implicit;By(),Up(e.content),By(),pI(e.isRetryable?2:-1);}}function $o(n,a){if(n&1&&(ai$1(0,"div",23)(1,"div",24),fI(2,jo,2,1,"span",25)(3,Vo,2,0,"span",25)(4,Wo,2,0,"span",26),Mc(),ai$1(5,"div",27),fI(6,Uo,2,1,"p",28)(7,Go,3,2),Mc()()),n&2){let e=a.$implicit,t=bI(3);qI(t.getBubbleClass(e)),By(2),pI(e.role==="user"?2:e.role==="model"?3:e.role==="error"?4:-1),By(4),pI(e.isSnapshot?6:7);}}function Jo(n,a){if(n&1&&mI(0,$o,8,4,"div",22,hI),n&2){let e=bI(2);yI(e.visibleChatHistory());}}function qo(n,a){if(n&1){let e=TI();ai$1(0,"div",12),fI(1,Ho,5,0,"div",13)(2,Jo,2,0),Mc(),ai$1(3,"div",14)(4,"mat-form-field",15)(5,"textarea",16),Mp("ngModelChange",function(i){cu(e);let o=bI();return lu(o.userPrompt.set(i))})("keydown",function(i){cu(e);let o=bI();return lu(o.onKeyDown(i))}),Mc(),Jv(),Mc(),ai$1(6,"div",17)(7,"button",18),Mp("click",function(){cu(e);let i=bI();return lu(i.showSystemInstructions())}),tD(8," Show system instructions "),Mc(),ai$1(9,"button",19),Mp("click",function(){cu(e);let i=bI();return lu(i.submitPrompt())}),tD(10," Send "),Mc()()();}if(n&2){let e=bI();By(),pI(e.visibleChatHistory().length===0?1:2),By(4),Ip("ngModel",e.userPrompt())("disabled",e.isLocked()),eE(),By(4),Ip("disabled",e.isLocked()||!e.isHandshakeComplete()||!e.userPrompt().trim());}}var hn=class n{chatCoordinator=C(cn);chatState=C(se);dialog=C(It);catalogManagement=C(io$1);startupResolution=C(jt);configProvider=C(pe);systemPrompt=this.chatCoordinator.systemPrompt;isHandshakeComplete=DD(()=>this.catalogManagement.activeCatalog()!==null);isChatDisabled=DD(()=>{let a=this.startupResolution.isThirdPartyEnvironment(),e=!this.configProvider.geminiApiKey();return a&&e});pipelineStatus=this.chatState.pipelineStatus;isLocked=this.chatState.isProgrammaticStreamActive;userPrompt=So$1("");visibleChatHistory=DD(()=>this.chatState.chatHistory().filter(a=>a.role!=="system").map(a=>{let e=this.isLayoutSnapshot(a.content);return e?W(q({},a),{isSnapshot:e,componentCount:this.getComponentCount(a.content)}):W(q({},a),{isSnapshot:e})}));pipelineStatusText=DD(()=>{switch(this.pipelineStatus()){case "receiving_stream":return "Receiving A2UI JSON stream...";case "received_raw":return "Received A2UI JSON.";case "validating":return "Validating A2UI JSON catalog schemas...";case "healing":return "Fixing A2UI JSON (Self-repair loop active)...";case "ready":return "Raw A2UI JSON is ready.";case "failed":return "A2UI JSON validation failed.";default:return ""}});async submitPrompt(){let a=this.userPrompt().trim();!a||this.isLocked()||(this.userPrompt.set(""),await this.chatCoordinator.submitPrompt(a));}onKeyDown(a){a.key==="Enter"&&!a.shiftKey&&!a.isComposing&&(a.preventDefault(),this.submitPrompt());}getBubbleClass(a){return a.role==="user"?this.isLayoutSnapshot(a.content)?"bubble-user bubble-layout":"bubble-user bubble-text":a.role==="model"?"bubble-model":a.role==="error"?"bubble-error":""}isLayoutSnapshot(a){let e=a.trim();return e.startsWith('{"version"')||e.startsWith("[")&&e.endsWith("]")}getComponentCount(a){try{let e=a.trim(),t=gt(e);if(t)return t.reduce((r,l)=>r+this.getCommandComponentCount(l),0);let i=e.split(`
`).filter(r=>r.trim().length>0),o=0;for(let r of i)if(r.startsWith("{"))try{let l=JSON.parse(r);o+=this.getCommandComponentCount(l);}catch{}return o}catch{}return 0}getCommandComponentCount(a){if(!a||typeof a!="object"||Array.isArray(a))return 0;let e=a;if(e.updateComponents&&typeof e.updateComponents=="object"){let t=e.updateComponents;if(Array.isArray(t.components))return t.components.length}else if(e.createSurface)return 1;return 0}showSystemInstructions(){this.dialog.open(un,{data:this.chatCoordinator.systemPrompt(),width:"600px"});}dismissOverlay(){this.chatState.setPipelineStatus("idle");}async retryPrompt(a){this.userPrompt.set(a),await this.submitPrompt();}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=HE({type:n,selectors:[["a2ui-composer-chat-panel"]],decls:7,vars:2,consts:[[1,"preview-frame-container"],["role","button","tabindex","0","aria-label","Dismiss status overlay",1,"pipeline-overlay",3,"class"],[1,"frame-header"],[1,"panel-title-text"],[1,"disabled-chat-panel"],["role","button","tabindex","0","aria-label","Dismiss status overlay",1,"pipeline-overlay",3,"click","keydown.enter","keydown.space"],["aria-hidden","true",1,"status-icon","error-icon"],[3,"diameter"],[1,"status-badge-text"],["aria-hidden","true",1,"disabled-key-icon"],[1,"disabled-notice-text"],["mat-flat-button","","color","primary","routerLink","/settings",1,"add-key-button"],[1,"frame-body","chat-history-log"],[1,"empty-state-notice"],[1,"chat-controllers-panel"],["appearance","outline","subscriptSizing","dynamic",1,"prompt-form-field"],["matInput","","aria-label","Chat prompt","placeholder","Type instruction to shape your screen (e.g. 'Add a checkbox column')...","rows","2",3,"ngModelChange","keydown","ngModel","disabled"],[1,"submit-action-bar"],["mat-button","",1,"system-instructions-link",3,"click"],["mat-raised-button","","color","primary",1,"submit-button",3,"click","disabled"],[1,"empty-state-icon"],[1,"empty-state-text"],[1,"chat-bubble-container",3,"class"],[1,"chat-bubble-container"],[1,"bubble-header-bar"],[1,"bubble-author-name"],[1,"bubble-author-name","error-label"],[1,"bubble-body"],[1,"bubble-text-content"],[1,"retry-action-container"],["mat-stroked-button","","color","primary",1,"retry-button",3,"click","disabled"],["aria-hidden","true"]],template:function(e,t){e&1&&(ai$1(0,"div",0),fI(1,Bo,5,4,"div",1),ai$1(2,"div",2)(3,"span",3),tD(4,"Gemini Assistant"),Mc()(),fI(5,zo,7,0,"div",4)(6,qo,11,4),Mc()),e&2&&(By(),pI(t.pipelineStatus()!=="idle"&&t.pipelineStatus()!=="ready"?1:-1),By(4),pI(t.isChatDisabled()?5:6));},dependencies:[se$1,it,rn,on,Ed,yd,mu,Ci,au,Ns$1,ba,_a,Hd,jd,pn,Pn$1],styles:[`[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;--app-success: #137333;--app-success-container: #e6f4ea;--app-on-success-container: #137333}.dark-theme[_nghost-%COMP%], .dark-theme   [_nghost-%COMP%]{--app-success: #81c784;--app-success-container: #132b19;--app-on-success-container: #a3e9a4}.dark-theme[_nghost-%COMP%]   .prompt-form-field[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]{--mdc-outlined-text-field-outline-color: rgba(255, 255, 255, .2) !important;--mdc-outlined-text-field-hover-outline-color: rgba(255, 255, 255, .3) !important}.preview-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;height:100%;box-sizing:border-box;border:1px solid var(--mat-sys-outline-variant);border-radius:8px;background-color:var(--mat-sys-surface);box-shadow:0 2px 4px #0000000d;overflow:hidden;min-width:0;position:relative}.frame-header[_ngcontent-%COMP%]{padding:12px 16px;background-color:var(--mat-sys-surface-container);border-bottom:1px solid var(--mat-sys-outline-variant);font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);display:flex;align-items:center;flex-shrink:0}.panel-title-text[_ngcontent-%COMP%]{font-size:14px;font-weight:500;color:var(--mat-sys-on-surface)}.frame-body[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;overflow:auto;box-sizing:border-box;min-height:0}.chat-history-log[_ngcontent-%COMP%]{flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:16px}.empty-state-notice[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;text-align:center;padding:32px;color:var(--mat-sys-on-surface-variant)}.empty-state-notice[_ngcontent-%COMP%]   .empty-state-icon[_ngcontent-%COMP%]{font-size:48px;margin-bottom:16px}.empty-state-notice[_ngcontent-%COMP%]   .empty-state-text[_ngcontent-%COMP%]{font-size:14px;line-height:1.5;margin:0;max-width:240px}.chat-bubble-container[_ngcontent-%COMP%]{display:flex;gap:8px;max-width:85%;align-items:flex-start;animation:_ngcontent-%COMP%_fadeInBubble .2s ease-out}.chat-bubble-container[_ngcontent-%COMP%]   .bubble-header-bar[_ngcontent-%COMP%]{font-size:11px;font-weight:500;margin-bottom:4px;opacity:.8}.chat-bubble-container[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{padding:10px 12px;font-size:13px;line-height:1.45;box-shadow:0 1px 2px #0000000d}@keyframes _ngcontent-%COMP%_fadeInBubble{0%{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.bubble-avatar-box[_ngcontent-%COMP%]{width:28px;height:28px;border-radius:50%;background-color:var(--mat-sys-surface-container-high);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--mat-sys-outline-variant);font-size:14px}.bubble-user[_ngcontent-%COMP%]{align-self:flex-end;flex-direction:row-reverse}.bubble-user[_ngcontent-%COMP%]   .bubble-header-bar[_ngcontent-%COMP%]{text-align:right}.bubble-user[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container);border-radius:12px 0 12px 12px;border:1px solid var(--mat-sys-outline-variant)}.bubble-user.bubble-layout[_ngcontent-%COMP%]{max-width:90%;align-self:center;flex-direction:row}.bubble-user.bubble-layout[_ngcontent-%COMP%]   .bubble-avatar-box[_ngcontent-%COMP%]{display:none}.bubble-user.bubble-layout[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);border:1px dashed var(--mat-sys-outline);color:var(--mat-sys-on-surface-variant);border-radius:8px;padding:8px 12px;box-shadow:none;width:100%}.bubble-model[_ngcontent-%COMP%]{align-self:flex-start}.bubble-model[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);color:var(--mat-sys-on-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:0 12px 12px}.bubble-model[_ngcontent-%COMP%]   .bubble-text-content[_ngcontent-%COMP%]{margin:0;white-space:pre-wrap}.bubble-error[_ngcontent-%COMP%]{align-self:flex-start;max-width:95%}.bubble-error[_ngcontent-%COMP%]   .error-label[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:600}.bubble-error[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border:1px solid var(--mat-sys-error);border-radius:0 12px 12px;font-family:Roboto Mono,Consolas,monospace;font-size:11px;line-height:1.4;white-space:pre-wrap;max-height:240px;overflow-y:auto;padding:10px}.streaming-pulse-indicator[_ngcontent-%COMP%]{display:inline-block;font-size:10px;color:var(--mat-sys-outline);animation:_ngcontent-%COMP%_pulsePulse 1.2s infinite ease-in-out;margin-top:4px}@keyframes _ngcontent-%COMP%_pulsePulse{0%,to{opacity:.3}50%{opacity:1}}.chat-controllers-panel[_ngcontent-%COMP%]{padding:12px 8px;background-color:var(--mat-sys-surface-container-high);border-top:1px solid var(--mat-sys-outline-variant);display:flex;flex-direction:column;gap:8px;z-index:10;flex-shrink:0}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]{width:100%;--mdc-outlined-text-field-container-shape: 20px !important;--mdc-outlined-text-field-outline-color: rgba(0, 0, 0, .12) !important;--mdc-outlined-text-field-focus-outline-color: var(--mat-sys-primary) !important;--mdc-outlined-text-field-hover-outline-color: rgba(0, 0, 0, .2) !important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]     .mdc-notched-outline__leading, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]     .mdc-notched-outline__notch, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]     .mdc-notched-outline__trailing{border-color:var(--mat-sys-outline-variant)!important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field.mat-focused[_ngcontent-%COMP%]     .mdc-notched-outline__leading, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field.mat-focused[_ngcontent-%COMP%]     .mdc-notched-outline__notch, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field.mat-focused[_ngcontent-%COMP%]     .mdc-notched-outline__trailing{border-color:var(--mat-sys-primary)!important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{font-size:13px;line-height:1.4;resize:none;overflow-y:hidden!important;scrollbar-width:none!important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]::-webkit-scrollbar{display:none!important}.chat-controllers-panel[_ngcontent-%COMP%]   .submit-action-bar[_ngcontent-%COMP%]{display:flex;justify-content:space-between!important;align-items:center;width:100%}.chat-controllers-panel[_ngcontent-%COMP%]   .system-instructions-link[_ngcontent-%COMP%]{font-size:13px;color:var(--mat-sys-primary);text-decoration:none;cursor:pointer;font-weight:500}.chat-controllers-panel[_ngcontent-%COMP%]   .submit-button[_ngcontent-%COMP%]{font-size:13px;font-weight:500}.pipeline-overlay[_ngcontent-%COMP%]{position:absolute;top:0;left:0;width:100%;height:100%;background-color:color-mix(in srgb,var(--mat-sys-surface) 85%,transparent);-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:100;animation:_ngcontent-%COMP%_fadeInOverlay .15s ease-out}.pipeline-overlay[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{font-size:13px;font-weight:500;color:var(--mat-sys-primary);text-align:center;padding:0 24px;animation:_ngcontent-%COMP%_pulseText 1.5s infinite ease-in-out}.pipeline-overlay[_ngcontent-%COMP%]   mat-spinner[_ngcontent-%COMP%]     circle{stroke:var(--mat-sys-primary)!important}.pipeline-overlay[_ngcontent-%COMP%]   .status-icon[_ngcontent-%COMP%]{font-size:40px;width:40px;height:40px;display:flex;align-items:center;justify-content:center}.pipeline-overlay[_ngcontent-%COMP%]   .status-icon.success-icon[_ngcontent-%COMP%]{color:var(--app-success)}.pipeline-overlay[_ngcontent-%COMP%]   .status-icon.error-icon[_ngcontent-%COMP%]{color:var(--mat-sys-error)}.pipeline-overlay.healing[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--mat-sys-tertiary-container) 88%,transparent)}.pipeline-overlay.healing[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--mat-sys-on-tertiary-container)}.pipeline-overlay.healing[_ngcontent-%COMP%]   mat-spinner[_ngcontent-%COMP%]     circle{stroke:var(--mat-sys-tertiary)!important}.pipeline-overlay.validating[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--mat-sys-primary-container) 88%,transparent)}.pipeline-overlay.validating[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--mat-sys-on-primary-container)}.pipeline-overlay.validating[_ngcontent-%COMP%]   mat-spinner[_ngcontent-%COMP%]     circle{stroke:var(--mat-sys-primary)!important}.pipeline-overlay.ready[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--app-success-container) 90%,transparent)}.pipeline-overlay.ready[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--app-on-success-container);animation:none}.pipeline-overlay.failed[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--mat-sys-error-container) 90%,transparent)}.pipeline-overlay.failed[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--mat-sys-error);animation:none}@keyframes _ngcontent-%COMP%_fadeInOverlay{0%{opacity:0}to{opacity:1}}@keyframes _ngcontent-%COMP%_pulseText{0%,to{opacity:.7}50%{opacity:1}}.retry-action-container[_ngcontent-%COMP%]{margin-top:12px;display:flex;justify-content:flex-start}.retry-button[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:8px;font-size:12px!important;height:32px!important;line-height:32px!important;padding:0 12px!important;border-color:var(--mat-sys-outline-variant)!important;background-color:var(--mat-sys-surface-container-lowest)!important;color:var(--mat-sys-primary)!important}.retry-button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:16px!important;width:16px!important;height:16px!important}.layout-snapshot-badge[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:var(--mat-sys-on-surface-variant)}.layout-snapshot-badge[_ngcontent-%COMP%]   .badge-label[_ngcontent-%COMP%]{font-weight:500}.layout-snapshot-badge[_ngcontent-%COMP%]   .badge-count[_ngcontent-%COMP%]{opacity:.7;font-size:12px}.disabled-chat-panel[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;text-align:center;padding:32px;background-color:var(--mat-sys-surface-container-low);box-sizing:border-box}.disabled-chat-panel[_ngcontent-%COMP%]   .disabled-key-icon[_ngcontent-%COMP%]{font-size:48px;width:48px;height:48px;margin-bottom:16px;color:var(--mat-sys-outline)}.disabled-chat-panel[_ngcontent-%COMP%]   .disabled-notice-text[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-medium-size);line-height:1.5;margin:0 0 24px;max-width:260px;color:var(--mat-sys-on-surface-variant)}















`]})};var Fa=new x("IS_EXTENSION_MODE",{providedIn:"root",factory:()=>So$1(false)});function Ko(n,a){n&1&&(ai$1(0,"div",1),tD(1,"\u26A0\uFE0F Invalid JSON syntax detected."),Mc());}var fn=class n{isExtensionMode=C(Fa);layoutJson;isJsonInvalid=So$1(false);TEST_ONLY={layoutJson:()=>this.layoutJson,isJsonInvalid:()=>this.isJsonInvalid};hostCommunication=C(Xt);catalogManagement=C(io$1);stateSync=C(_t);chatState=C(se);destroyRef=C(it$1);layoutInput$=new X;isLocked=this.chatState.isProgrammaticStreamActive;constructor(){this.layoutJson=So$1(this.stateSync.hydrateActiveDraft()),Au(()=>{if(this.catalogManagement.activeCatalog()){let e=wD(()=>this.layoutJson());try{let t=this.parseLayoutString(e);t!==null&&this.hostCommunication.sendRenderA2UI(t);}catch{}}}),Au(()=>{let a=this.stateSync.activeDraft();wD(()=>{this.layoutJson()!==a&&queueMicrotask(()=>{this.layoutJson.set(a);try{let e=this.parseLayoutString(a);e!==null?(this.isJsonInvalid.set(!1),this.hostCommunication.sendRenderA2UI(e)):this.isJsonInvalid.set(!0);}catch{this.isJsonInvalid.set(true);}});});}),this.layoutInput$.pipe(ng(300),Oe(a=>{try{let e=this.parseLayoutString(a);return e!==null?(this.isJsonInvalid.set(!1),e):(this.isJsonInvalid.set(!0),null)}catch{return this.isJsonInvalid.set(true),null}}),Rn$1(a=>a!==null),Wi(this.destroyRef)).subscribe(a=>{this.hostCommunication.sendRenderA2UI(a);});}onLayoutChange(a){this.layoutJson.set(a),this.layoutInput$.next(a),this.stateSync.updateDraft(a);}parseLayoutString(a){let e=a.trim();if(!e)return [];if(e.startsWith("[")){let i=gt(e);if(i===null)throw new SyntaxError("Invalid JSON Array");return i}return e.split(`
`).map(i=>i.trim()).filter(i=>i.length>0).map(i=>JSON.parse(i))}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=HE({type:n,selectors:[["a2ui-composer-raw-frame"]],decls:4,vars:7,consts:[[1,"raw-frame-container"],[1,"invalid-json-badge"],["appearance","outline","subscriptSizing","dynamic",1,"raw-json-field"],["matInput","","aria-label","Raw layout JSON","placeholder","Enter raw JSON here...",3,"ngModelChange","ngModel","readOnly"]],template:function(e,t){e&1&&(ai$1(0,"div",0),fI(1,Ko,2,0,"div",1),ai$1(2,"mat-form-field",2)(3,"textarea",3),Mp("ngModelChange",function(o){return t.onLayoutChange(o)}),Mc(),Jv(),Mc()()),e&2&&(Fp("is-collapsed",t.isExtensionMode())("is-locked",t.isLocked()),By(),pI(t.isJsonInvalid()?1:-1),By(2),Ip("ngModel",t.layoutJson())("readOnly",t.isLocked()),eE());},dependencies:[se$1,it,rn,on,mu,Ci,au,Ns$1],styles:["[_nghost-%COMP%]{flex:1;display:block;width:100%;height:100%}.raw-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;padding:0;height:100%;box-sizing:border-box;transition:all .3s ease}.raw-frame-container.is-locked[_ngcontent-%COMP%]{opacity:.55;pointer-events:none;cursor:not-allowed}.raw-frame-container.is-locked[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{cursor:not-allowed}.raw-frame-container[_ngcontent-%COMP%]   .invalid-json-badge[_ngcontent-%COMP%]{color:#f44336;font-weight:700;padding:8px 0}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]{width:100%;height:100%;flex:1 1 auto;display:block}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mdc-notched-outline{display:none!important}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mat-mdc-text-field-wrapper{height:100%;padding-right:0}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mat-mdc-form-field-flex{height:100%;background-color:transparent;padding:0}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mat-mdc-form-field-infix{height:100%;display:flex;flex-direction:column;box-sizing:border-box;padding-top:0}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{font-family:monospace;resize:none;flex:1 1 auto;height:100%;width:100%;box-sizing:border-box;border:none;outline:none;background:transparent}.raw-frame-container.is-collapsed[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]{font-size:12px}.raw-frame-container.is-collapsed[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mat-mdc-form-field-flex{padding:0}.raw-frame-container.is-collapsed[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mat-mdc-form-field-infix{padding-top:0}"]})};var Yo=["previewIframe"];function Zo(n,a){if(n&1&&wp(0,"iframe",2,0),n&2){let e=bI();bp("src",e.safeRendererUrl(),sf);}}function Xo(n,a){n&1&&(Nc(0,"div",3),tD(1,"Rendered UI Placeholder"),Sc());}var gn=class n{sanitizer=C(kn$1);startupResolution=C(jt);hostCommunication=C(Xt);chatState=C(se);isLocked=this.chatState.isProgrammaticStreamActive;iframeRef=dF("previewIframe");safeRendererUrl=DD(()=>{let a=this.startupResolution.resolvedUrl();if(!a)return null;try{let e=globalThis.location?.origin||"",t=new URL(a,e);return t.searchParams.set("origin",e),this.sanitizer.bypassSecurityTrustResourceUrl(t.toString())}catch(e){return console.error("Failed to parse renderer URL:",e),null}});constructor(){Au(()=>{let a=this.iframeRef();typeof this.hostCommunication.registerIframeElement=="function"&&this.hostCommunication.registerIframeElement(a?.nativeElement||null),typeof this.hostCommunication.registerIframe=="function"&&this.hostCommunication.registerIframe(a?.nativeElement?.contentWindow||null);});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=HE({type:n,selectors:[["a2ui-composer-rendered-frame"]],viewQuery:function(e,t){e&1&&Rp(t.iframeRef,Yo,5),e&2&&kI();},decls:3,vars:3,consts:[["previewIframe",""],[1,"rendered-frame-container"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"src"],[1,"rendered-frame-placeholder"]],template:function(e,t){e&1&&(Nc(0,"div",1),fI(1,Zo,2,1,"iframe",2)(2,Xo,2,0,"div",3),Sc()),e&2&&(Fp("is-locked",t.isLocked()),By(),pI(t.safeRendererUrl()?1:2));},styles:['[_nghost-%COMP%]{display:block;width:100%;height:100%}.rendered-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;width:100%;height:100%;container-type:inline-size;container-name:renderedFrame;overflow:hidden;background-color:var(--mat-app-background-color, #fafafa);position:relative}.rendered-frame-container.is-locked[_ngcontent-%COMP%]{pointer-events:none;-webkit-user-select:none;user-select:none}.rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{content:"Gemini is generating visual updates...";position:absolute;top:0;left:0;width:100%;height:100%;background-color:#ffffffa6;-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);z-index:10;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:var(--mat-sys-primary, #1a73e8);font-family:Roboto,sans-serif;animation:_ngcontent-%COMP%_fadeInLockout .2s ease-out}.rendered-frame-container[_ngcontent-%COMP%]   .preview-iframe[_ngcontent-%COMP%]{flex:1 1 auto;width:100%;height:100%;border:none;display:block}.rendered-frame-container[_ngcontent-%COMP%]   .rendered-frame-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#888;font-family:sans-serif}@container renderedFrame (max-width: 400px){.rendered-frame-container[_ngcontent-%COMP%]{border-radius:0}}@keyframes _ngcontent-%COMP%_fadeInLockout{0%{opacity:0;-webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px)}to{opacity:1;-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px)}}.dark-theme[_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container, #131314)}.dark-theme[_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after, .dark-theme   [_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{background-color:#1e1f22a6;color:var(--mat-sys-primary, #8ab4f8)}']})};function er(n,a){n&1&&(ai$1(0,"div",1),tD(1,"\u26A0\uFE0F Invalid JSON syntax detected."),Mc());}var _n=class n{hostComm=C(Xt);lastSurfaceId="sample-surface";lastPath=void 0;latestModelValue=So$1(null);dataModelJson=CD({source:this.latestModelValue,computation:a=>a===null?"":typeof a=="string"?a:JSON.stringify(a,null,2)});isJsonInvalid=DD(()=>{let a=this.dataModelJson();if(!a)return  false;try{return JSON.parse(a),!1}catch{return  true}});constructor(){Au(()=>{let a=this.hostComm.messageStream();if(a?.type===S.DATA_MODEL_CHANGE){let t=a?.payload?.updateDataModel;if(t){typeof t.surfaceId=="string"&&(this.lastSurfaceId=t.surfaceId),typeof t.path=="string"?this.lastPath=t.path:this.lastPath=void 0;let i=t.value;wD(()=>this.latestModelValue.set(i));}}}),Du(this.dataModelJson).pipe(ng(300),og(),Rn$1(a=>{try{return JSON.parse(a),!0}catch{return  false}})).subscribe(a=>{let e=JSON.parse(a),t=this.latestModelValue(),i=t?JSON.stringify(t):"",o=JSON.stringify(e);i!==o&&this.hostComm.sendMessage({type:S.DATA_MODEL_CHANGE,payload:{updateDataModel:{surfaceId:this.lastSurfaceId,path:this.lastPath,value:e}}});});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=HE({type:n,selectors:[["a2ui-composer-data-model"]],decls:4,vars:2,consts:[[1,"data-model-container"],[1,"invalid-json-badge"],["appearance","outline","subscriptSizing","dynamic",1,"data-model-field"],["matInput","","aria-label","Data model JSON","placeholder","Enter data model JSON here...",3,"ngModelChange","ngModel"]],template:function(e,t){e&1&&(ai$1(0,"div",0),fI(1,er,2,0,"div",1),ai$1(2,"mat-form-field",2)(3,"textarea",3),Mp("ngModelChange",function(o){return t.dataModelJson.set(o)}),Mc(),Jv(),Mc()()),e&2&&(By(),pI(t.isJsonInvalid()?1:-1),By(2),Ip("ngModel",t.dataModelJson()),eE());},dependencies:[se$1,it,rn,on,mu,Ci,au,Ns$1],styles:["[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;width:100%}.data-model-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;height:100%;width:100%;flex:1}.data-model-container[_ngcontent-%COMP%]   .invalid-json-badge[_ngcontent-%COMP%]{color:#f44336;font-weight:700;padding:8px 0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]{width:100%;flex:1;min-height:0;display:block}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mdc-notched-outline{display:none!important}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mat-mdc-text-field-wrapper{height:100%;padding-right:0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mat-mdc-form-field-flex{height:100%;background-color:transparent;padding:0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mat-mdc-form-field-infix{height:100%;display:flex;flex-direction:column;box-sizing:border-box;padding-top:0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{font-family:monospace;resize:none;flex:1 1 auto;height:100%;width:100%;box-sizing:border-box;border:none;outline:none;background:transparent}"]})};var tr=[[["caption"]],[["colgroup"],["col"]],"*"],nr=["caption","colgroup, col","*"];function ir(n,a){n&1&&NI(0,2);}function ar(n,a){n&1&&(ai$1(0,"thead",0),Cp(1,1),Mc(),ai$1(2,"tbody",0),Cp(3,2)(4,3),Mc(),ai$1(5,"tfoot",0),Cp(6,4),Mc());}function or(n,a){n&1&&Cp(0,1)(1,2)(2,3)(3,4);}var xe=new x("CDK_TABLE");var vn=(()=>{class n{template=C(nr$1);static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","cdkCellDef",""]]})}return n})(),Cn=(()=>{class n{template=C(nr$1);static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","cdkHeaderCellDef",""]]})}return n})(),za=(()=>{class n{template=C(nr$1);static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","cdkFooterCellDef",""]]})}return n})(),bt=(()=>{class n{_table=C(xe,{optional:true});_hasStickyChanged=false;get name(){return this._name}set name(e){this._setNameInput(e);}_name;get sticky(){return this._sticky}set sticky(e){e!==this._sticky&&(this._sticky=e,this._hasStickyChanged=true);}_sticky=false;get stickyEnd(){return this._stickyEnd}set stickyEnd(e){e!==this._stickyEnd&&(this._stickyEnd=e,this._hasStickyChanged=true);}_stickyEnd=false;cell;headerCell;footerCell;cssClassFriendlyName;_columnCssClassName;hasStickyChanged(){let e=this._hasStickyChanged;return this.resetStickyChanged(),e}resetStickyChanged(){this._hasStickyChanged=false;}_updateColumnCssClassName(){this._columnCssClassName=[`cdk-column-${this.cssClassFriendlyName}`];}_setNameInput(e){e&&(this._name=e,this.cssClassFriendlyName=e.replace(/[^a-z0-9_-]/gi,"-"),this._updateColumnCssClassName());}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","cdkColumnDef",""]],contentQueries:function(t,i,o){if(t&1&&xp(o,vn,5)(o,Cn,5)(o,za,5),t&2){let r;xI(r=AI())&&(i.cell=r.first),xI(r=AI())&&(i.headerCell=r.first),xI(r=AI())&&(i.footerCell=r.first);}},inputs:{name:[0,"cdkColumnDef","name"],sticky:[2,"sticky","sticky",mF],stickyEnd:[2,"stickyEnd","stickyEnd",mF]}})}return n})(),yn=class{constructor(a,e){e.nativeElement.classList.add(...a._columnCssClassName);}},Ha=(()=>{class n extends yn{constructor(){super(C(bt),C(cr$1));}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["cdk-header-cell"],["th","cdk-header-cell",""]],hostAttrs:["role","columnheader",1,"cdk-header-cell"],features:[dp]})}return n})();var ja=(()=>{class n extends yn{constructor(){let e=C(bt),t=C(cr$1);super(e,t);let i=e._table?._getCellRole();i&&t.nativeElement.setAttribute("role",i);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["cdk-cell"],["td","cdk-cell",""]],hostAttrs:[1,"cdk-cell"],features:[dp]})}return n})();var Xn=(()=>{class n{template=C(nr$1);_differs=C(kD);columns;_columnsDiffer;ngOnChanges(e){if(!this._columnsDiffer){let t=e.columns&&e.columns.currentValue||[];this._columnsDiffer=this._differs.find(t).create(),this._columnsDiffer.diff(t);}}getColumnsDiff(){return this._columnsDiffer.diff(this.columns)}extractCellTemplate(e){return this instanceof Lt?e.headerCell.template:this instanceof ei?e.footerCell.template:e.cell.template}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,features:[pm]})}return n})(),Lt=(()=>{class n extends Xn{_table=C(xe,{optional:true});_hasStickyChanged=false;get sticky(){return this._sticky}set sticky(e){e!==this._sticky&&(this._sticky=e,this._hasStickyChanged=true);}_sticky=false;ngOnChanges(e){super.ngOnChanges(e);}hasStickyChanged(){let e=this._hasStickyChanged;return this.resetStickyChanged(),e}resetStickyChanged(){this._hasStickyChanged=false;}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","cdkHeaderRowDef",""]],inputs:{columns:[0,"cdkHeaderRowDef","columns"],sticky:[2,"cdkHeaderRowDefSticky","sticky",mF]},features:[dp,pm]})}return n})(),ei=(()=>{class n extends Xn{_table=C(xe,{optional:true});_hasStickyChanged=false;get sticky(){return this._sticky}set sticky(e){e!==this._sticky&&(this._sticky=e,this._hasStickyChanged=true);}_sticky=false;ngOnChanges(e){super.ngOnChanges(e);}hasStickyChanged(){let e=this._hasStickyChanged;return this.resetStickyChanged(),e}resetStickyChanged(){this._hasStickyChanged=false;}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","cdkFooterRowDef",""]],inputs:{columns:[0,"cdkFooterRowDef","columns"],sticky:[2,"cdkFooterRowDefSticky","sticky",mF]},features:[dp,pm]})}return n})(),xn=(()=>{class n extends Xn{_table=C(xe,{optional:true});when;static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","cdkRowDef",""]],inputs:{columns:[0,"cdkRowDefColumns","columns"],when:[0,"cdkRowDefWhen","when"]},features:[dp]})}return n})(),qe=(()=>{class n{_viewContainer=C(Di);cells;context;static mostRecentCellOutlet=null;constructor(){n.mostRecentCellOutlet=this;}ngOnDestroy(){n.mostRecentCellOutlet===this&&(n.mostRecentCellOutlet=null);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","cdkCellOutlet",""]]})}return n})(),ti=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["cdk-header-row"],["tr","cdk-header-row",""]],hostAttrs:["role","row",1,"cdk-header-row"],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,i){t&1&&Cp(0,0);},dependencies:[qe],encapsulation:2,changeDetection:1})}return n})();var ni=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["cdk-row"],["tr","cdk-row",""]],hostAttrs:["role","row",1,"cdk-row"],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,i){t&1&&Cp(0,0);},dependencies:[qe],encapsulation:2,changeDetection:1})}return n})(),Va=(()=>{class n{templateRef=C(nr$1);_contentClassNames=["cdk-no-data-row","cdk-row"];_cellClassNames=["cdk-cell","cdk-no-data-cell"];_cellSelector="td, cdk-cell, [cdk-cell], .cdk-cell";static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["ng-template","cdkNoDataRow",""]]})}return n})(),Na=["top","bottom","left","right"],Zn=class{_isNativeHtmlTable;_stickCellCss;_isBrowser;_needsPositionStickyOnElement;direction;_positionListener;_tableInjector;_elemSizeCache=new WeakMap;_resizeObserver=globalThis?.ResizeObserver?new globalThis.ResizeObserver(a=>this._updateCachedSizes(a)):null;_updatedStickyColumnsParamsToReplay=[];_stickyColumnsReplayTimeout=null;_cachedCellWidths=[];_borderCellCss;_destroyed=false;constructor(a,e,t=true,i=true,o,r,l){this._isNativeHtmlTable=a,this._stickCellCss=e,this._isBrowser=t,this._needsPositionStickyOnElement=i,this.direction=o,this._positionListener=r,this._tableInjector=l,this._borderCellCss={top:`${e}-border-elem-top`,bottom:`${e}-border-elem-bottom`,left:`${e}-border-elem-left`,right:`${e}-border-elem-right`};}clearStickyPositioning(a,e){(e.includes("left")||e.includes("right"))&&this._removeFromStickyColumnReplayQueue(a);let t=[];for(let i of a)i.nodeType===i.ELEMENT_NODE&&t.push(i,...Array.from(i.children));Wy({write:()=>{for(let i of t)this._removeStickyStyle(i,e);}},{injector:this._tableInjector});}updateStickyColumns(a,e,t,i=true,o=true){if(!a.length||!this._isBrowser||!(e.some(J=>J)||t.some(J=>J))){this._positionListener?.stickyColumnsUpdated({sizes:[]}),this._positionListener?.stickyEndColumnsUpdated({sizes:[]});return}let r=a[0],l=r.children.length,p=this.direction==="rtl",h=p?"right":"left",C=p?"left":"right",B=e.lastIndexOf(true),R=t.indexOf(true),z,fe,Ae;o&&this._updateStickyColumnReplayQueue({rows:[...a],stickyStartStates:[...e],stickyEndStates:[...t]}),Wy({earlyRead:()=>{z=this._getCellWidths(r,i),fe=this._getStickyStartColumnPositions(z,e),Ae=this._getStickyEndColumnPositions(z,t);},write:()=>{for(let J of a)for(let Z=0;Z<l;Z++){let vi=J.children[Z];e[Z]&&this._addStickyStyle(vi,h,fe[Z],Z===B),t[Z]&&this._addStickyStyle(vi,C,Ae[Z],Z===R);}this._positionListener&&z.some(J=>!!J)&&(this._positionListener.stickyColumnsUpdated({sizes:B===-1?[]:z.slice(0,B+1).map((J,Z)=>e[Z]?J:null)}),this._positionListener.stickyEndColumnsUpdated({sizes:R===-1?[]:z.slice(R).map((J,Z)=>t[Z+R]?J:null).reverse()}));}},{injector:this._tableInjector});}stickRows(a,e,t){if(!this._isBrowser)return;let i=t==="bottom"?a.slice().reverse():a,o=t==="bottom"?e.slice().reverse():e,r=[],l=[],p=[];Wy({earlyRead:()=>{for(let h=0,C=0;h<i.length;h++){if(!o[h])continue;r[h]=C;let B=i[h];p[h]=this._isNativeHtmlTable?Array.from(B.children):[B];let R=this._retrieveElementSize(B).height;C+=R,l[h]=R;}},write:()=>{let h=o.lastIndexOf(true);for(let C=0;C<i.length;C++){if(!o[C])continue;let B=r[C],R=C===h;for(let z of p[C])this._addStickyStyle(z,t,B,R);}t==="top"?this._positionListener?.stickyHeaderRowsUpdated({sizes:l,offsets:r,elements:p}):this._positionListener?.stickyFooterRowsUpdated({sizes:l,offsets:r,elements:p});}},{injector:this._tableInjector});}updateStickyFooterContainer(a,e){this._isNativeHtmlTable&&Wy({write:()=>{let t=a.querySelector("tfoot");t&&(e.some(i=>!i)?this._removeStickyStyle(t,["bottom"]):this._addStickyStyle(t,"bottom",0,false));}},{injector:this._tableInjector});}destroy(){this._stickyColumnsReplayTimeout&&clearTimeout(this._stickyColumnsReplayTimeout),this._resizeObserver?.disconnect(),this._destroyed=true;}_removeStickyStyle(a,e){if(!a.classList.contains(this._stickCellCss))return;for(let i of e)a.style[i]="",a.classList.remove(this._borderCellCss[i]);Na.some(i=>e.indexOf(i)===-1&&a.style[i])?a.style.zIndex=this._getCalculatedZIndex(a):(a.style.zIndex="",this._needsPositionStickyOnElement&&(a.style.position=""),a.classList.remove(this._stickCellCss));}_addStickyStyle(a,e,t,i){a.classList.add(this._stickCellCss),i&&a.classList.add(this._borderCellCss[e]),a.style[e]=`${t}px`,a.style.zIndex=this._getCalculatedZIndex(a),this._needsPositionStickyOnElement&&(a.style.cssText+="position: -webkit-sticky; position: sticky; ");}_getCalculatedZIndex(a){let e={top:100,bottom:10,left:1,right:1},t=0;for(let i of Na)a.style[i]&&(t+=e[i]);return t?`${t}`:""}_getCellWidths(a,e=true){if(!e&&this._cachedCellWidths.length)return this._cachedCellWidths;let t=[],i=a.children;for(let o=0;o<i.length;o++){let r=i[o];t.push(this._retrieveElementSize(r).width);}return this._cachedCellWidths=t,t}_getStickyStartColumnPositions(a,e){let t=[],i=0;for(let o=0;o<a.length;o++)e[o]&&(t[o]=i,i+=a[o]);return t}_getStickyEndColumnPositions(a,e){let t=[],i=0;for(let o=a.length;o>0;o--)e[o]&&(t[o]=i,i+=a[o]);return t}_retrieveElementSize(a){let e=this._elemSizeCache.get(a);if(e)return e;let t=a.getBoundingClientRect(),i={width:t.width,height:t.height};return this._resizeObserver&&(this._elemSizeCache.set(a,i),this._resizeObserver.observe(a,{box:"border-box"})),i}_updateStickyColumnReplayQueue(a){this._removeFromStickyColumnReplayQueue(a.rows),this._stickyColumnsReplayTimeout||this._updatedStickyColumnsParamsToReplay.push(a);}_removeFromStickyColumnReplayQueue(a){let e=new Set(a);for(let t of this._updatedStickyColumnsParamsToReplay)t.rows=t.rows.filter(i=>!e.has(i));this._updatedStickyColumnsParamsToReplay=this._updatedStickyColumnsParamsToReplay.filter(t=>!!t.rows.length);}_updateCachedSizes(a){let e=false;for(let t of a){let i=t.borderBoxSize?.length?{width:t.borderBoxSize[0].inlineSize,height:t.borderBoxSize[0].blockSize}:{width:t.contentRect.width,height:t.contentRect.height};i.width!==this._elemSizeCache.get(t.target)?.width&&rr(t.target)&&(e=true),this._elemSizeCache.set(t.target,i);}e&&this._updatedStickyColumnsParamsToReplay.length&&(this._stickyColumnsReplayTimeout&&clearTimeout(this._stickyColumnsReplayTimeout),this._stickyColumnsReplayTimeout=setTimeout(()=>{if(!this._destroyed){for(let t of this._updatedStickyColumnsParamsToReplay)this.updateStickyColumns(t.rows,t.stickyStartStates,t.stickyEndStates,true,false);this._updatedStickyColumnsParamsToReplay=[],this._stickyColumnsReplayTimeout=null;}},0));}};function rr(n){return ["cdk-cell","cdk-header-cell","cdk-footer-cell"].some(a=>n.classList.contains(a))}var At=new x("STICKY_POSITIONING_LISTENER");var ii=(()=>{class n{viewContainer=C(Di);elementRef=C(cr$1);constructor(){let e=C(xe);e._rowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","rowOutlet",""]]})}return n})(),ai=(()=>{class n{viewContainer=C(Di);elementRef=C(cr$1);constructor(){let e=C(xe);e._headerRowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","headerRowOutlet",""]]})}return n})(),oi=(()=>{class n{viewContainer=C(Di);elementRef=C(cr$1);constructor(){let e=C(xe);e._footerRowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","footerRowOutlet",""]]})}return n})(),ri=(()=>{class n{viewContainer=C(Di);elementRef=C(cr$1);constructor(){let e=C(xe);e._noDataRowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","noDataRowOutlet",""]]})}return n})(),si=(()=>{class n{_differs=C(kD);_changeDetectorRef=C(hF);_elementRef=C(cr$1);_dir=C(zo$2,{optional:true});_platform=C(R);_viewRepeater;_viewportRuler=C(H);_injector=C(fe);_virtualScrollViewport=C(Ii,{optional:true,host:true});_positionListener=C(At,{optional:true})||C(At,{optional:true,skipSelf:true});_document=C(No$1);_data;_renderedRange;_onDestroy=new X;_renderRows;_renderChangeSubscription=null;_columnDefsByName=new Map;_rowDefs;_headerRowDefs;_footerRowDefs;_dataDiffer;_defaultRowDef=null;_customColumnDefs=new Set;_customRowDefs=new Set;_customHeaderRowDefs=new Set;_customFooterRowDefs=new Set;_customNoDataRow=null;_headerRowDefChanged=true;_footerRowDefChanged=true;_stickyColumnStylesNeedReset=true;_forceRecalculateCellWidths=true;_cachedRenderRowsMap=new Map;_isNativeHtmlTable;_stickyStyler;stickyCssClass="cdk-table-sticky";needsPositionStickyOnElement=true;_isServer;_isShowingNoDataRow=false;_hasAllOutlets=false;_hasInitialized=false;_headerRowStickyUpdates=new X;_footerRowStickyUpdates=new X;_disableVirtualScrolling=false;_getCellRole(){if(this._cellRoleInternal===void 0){let e=this._elementRef.nativeElement.getAttribute("role");return e==="grid"||e==="treegrid"?"gridcell":"cell"}return this._cellRoleInternal}_cellRoleInternal=void 0;get trackBy(){return this._trackByFn}set trackBy(e){this._trackByFn=e;}_trackByFn;get dataSource(){return this._dataSource}set dataSource(e){this._dataSource!==e&&(this._switchDataSource(e),this._changeDetectorRef.markForCheck());}_dataSource;_dataSourceChanges=new X;_dataStream=new X;get multiTemplateDataRows(){return this._multiTemplateDataRows}set multiTemplateDataRows(e){this._multiTemplateDataRows=e,this._rowOutlet&&this._rowOutlet.viewContainer.length&&(this._forceRenderDataRows(),this.updateStickyColumnStyles());}_multiTemplateDataRows=false;get fixedLayout(){return this._virtualScrollEnabled()?true:this._fixedLayout}set fixedLayout(e){this._fixedLayout=e,this._forceRecalculateCellWidths=true,this._stickyColumnStylesNeedReset=true;}_fixedLayout=false;recycleRows=false;contentChanged=new Le;viewChange=new _n$1({start:0,end:Number.MAX_VALUE});_rowOutlet;_headerRowOutlet;_footerRowOutlet;_noDataRowOutlet;_contentColumnDefs;_contentRowDefs;_contentHeaderRowDefs;_contentFooterRowDefs;_noDataRow;get renderedRows(){return this._renderRows}constructor(){C(new Yp("role"),{optional:true})||this._elementRef.nativeElement.setAttribute("role","table"),this._isServer=!this._platform.isBrowser,this._isNativeHtmlTable=this._elementRef.nativeElement.nodeName==="TABLE",this._dataDiffer=this._differs.find([]).create((t,i)=>this.trackBy?this.trackBy(i.dataIndex,i.data):i);}ngOnInit(){this._setupStickyStyler(),this._viewportRuler.change().pipe(gg(this._onDestroy)).subscribe(()=>{this._forceRecalculateCellWidths=true;});}ngAfterContentInit(){this._viewRepeater=this.recycleRows||this._virtualScrollEnabled()?new ae:new xe$2,this._virtualScrollEnabled()&&this._setupVirtualScrolling(this._virtualScrollViewport),this._hasInitialized=true;}ngAfterContentChecked(){this._canRender()&&this._render();}ngOnDestroy(){this._stickyStyler?.destroy(),[this._rowOutlet?.viewContainer,this._headerRowOutlet?.viewContainer,this._footerRowOutlet?.viewContainer,this._cachedRenderRowsMap,this._customColumnDefs,this._customRowDefs,this._customHeaderRowDefs,this._customFooterRowDefs,this._columnDefsByName].forEach(e=>{e?.clear();}),this._headerRowDefs=[],this._footerRowDefs=[],this._defaultRowDef=null,this._headerRowStickyUpdates.complete(),this._footerRowStickyUpdates.complete(),this._onDestroy.next(),this._onDestroy.complete(),qe$1(this.dataSource)&&this.dataSource.disconnect(this);}renderRows(){this._renderRows=this._getAllRenderRows();let e=this._dataDiffer.diff(this._renderRows);if(!e){this._updateNoDataRow(),this.contentChanged.next();return}let t=this._rowOutlet.viewContainer;this._viewRepeater.applyChanges(e,t,(i,o,r)=>this._getEmbeddedViewArgs(i.item,r),i=>i.item.data,i=>{i.operation===P.INSERTED&&i.context&&this._renderCellTemplateForItem(i.record.item.rowDef,i.context);}),this._updateRowIndexContext(),e.forEachIdentityChange(i=>{let o=t.get(i.currentIndex);o.context.$implicit=i.item.data;}),this._updateNoDataRow(),this.contentChanged.next(),this.updateStickyColumnStyles();}addColumnDef(e){this._customColumnDefs.add(e);}removeColumnDef(e){this._customColumnDefs.delete(e);}addRowDef(e){this._customRowDefs.add(e);}removeRowDef(e){this._customRowDefs.delete(e);}addHeaderRowDef(e){this._customHeaderRowDefs.add(e),this._headerRowDefChanged=true;}removeHeaderRowDef(e){this._customHeaderRowDefs.delete(e),this._headerRowDefChanged=true;}addFooterRowDef(e){this._customFooterRowDefs.add(e),this._footerRowDefChanged=true;}removeFooterRowDef(e){this._customFooterRowDefs.delete(e),this._footerRowDefChanged=true;}setNoDataRow(e){this._customNoDataRow=e;}updateStickyHeaderRowStyles(){let e=this._getRenderedRows(this._headerRowOutlet);if(this._isNativeHtmlTable){let i=Ba(this._headerRowOutlet,"thead");i&&(i.style.display=e.length?"":"none");}let t=this._headerRowDefs.map(i=>i.sticky);this._stickyStyler.clearStickyPositioning(e,["top"]),this._stickyStyler.stickRows(e,t,"top"),this._headerRowDefs.forEach(i=>i.resetStickyChanged());}updateStickyFooterRowStyles(){let e=this._getRenderedRows(this._footerRowOutlet);if(this._isNativeHtmlTable){let i=Ba(this._footerRowOutlet,"tfoot");i&&(i.style.display=e.length?"":"none");}let t=this._footerRowDefs.map(i=>i.sticky);this._stickyStyler.clearStickyPositioning(e,["bottom"]),this._stickyStyler.stickRows(e,t,"bottom"),this._stickyStyler.updateStickyFooterContainer(this._elementRef.nativeElement,t),this._footerRowDefs.forEach(i=>i.resetStickyChanged());}updateStickyColumnStyles(){let e=this._getRenderedRows(this._headerRowOutlet),t=this._getRenderedRows(this._rowOutlet),i=this._getRenderedRows(this._footerRowOutlet);(this._isNativeHtmlTable&&!this.fixedLayout||this._stickyColumnStylesNeedReset)&&(this._stickyStyler.clearStickyPositioning([...e,...t,...i],["left","right"]),this._stickyColumnStylesNeedReset=false),e.forEach((o,r)=>{this._addStickyColumnStyles([o],this._headerRowDefs[r]);}),this._rowDefs.forEach(o=>{let r=[];for(let l=0;l<t.length;l++)this._renderRows[l].rowDef===o&&r.push(t[l]);this._addStickyColumnStyles(r,o);}),i.forEach((o,r)=>{this._addStickyColumnStyles([o],this._footerRowDefs[r]);}),Array.from(this._columnDefsByName.values()).forEach(o=>o.resetStickyChanged());}stickyColumnsUpdated(e){this._positionListener?.stickyColumnsUpdated(e);}stickyEndColumnsUpdated(e){this._positionListener?.stickyEndColumnsUpdated(e);}stickyHeaderRowsUpdated(e){this._headerRowStickyUpdates.next(e),this._positionListener?.stickyHeaderRowsUpdated(e);}stickyFooterRowsUpdated(e){this._footerRowStickyUpdates.next(e),this._positionListener?.stickyFooterRowsUpdated(e);}_outletAssigned(){!this._hasAllOutlets&&this._rowOutlet&&this._headerRowOutlet&&this._footerRowOutlet&&this._noDataRowOutlet&&(this._hasAllOutlets=true,this._canRender()&&this._render());}_canRender(){return this._hasAllOutlets&&this._hasInitialized}_render(){this._cacheRowDefs(),this._cacheColumnDefs(),!this._headerRowDefs.length&&!this._footerRowDefs.length&&this._rowDefs.length;let t=this._renderUpdatedColumns()||this._headerRowDefChanged||this._footerRowDefChanged;this._stickyColumnStylesNeedReset=this._stickyColumnStylesNeedReset||t,this._forceRecalculateCellWidths=t,this._headerRowDefChanged&&(this._forceRenderHeaderRows(),this._headerRowDefChanged=false),this._footerRowDefChanged&&(this._forceRenderFooterRows(),this._footerRowDefChanged=false),this.dataSource&&this._rowDefs.length>0&&!this._renderChangeSubscription?this._observeRenderChanges():this._stickyColumnStylesNeedReset&&this.updateStickyColumnStyles(),this._checkStickyStates();}_getAllRenderRows(){if(!Array.isArray(this._data)||!this._renderedRange)return [];let e=[],t=Math.min(this._data.length,this._renderedRange.end),i=this._cachedRenderRowsMap;this._cachedRenderRowsMap=new Map;for(let o=this._renderedRange.start;o<t;o++){let r=this._data[o],l=this._getRenderRowsForData(r,o,i.get(r));this._cachedRenderRowsMap.has(r)||this._cachedRenderRowsMap.set(r,new WeakMap);for(let p=0;p<l.length;p++){let h=l[p],C=this._cachedRenderRowsMap.get(h.data);C.has(h.rowDef)?C.get(h.rowDef).push(h):C.set(h.rowDef,[h]),e.push(h);}}return e}_getRenderRowsForData(e,t,i){return this._getRowDefs(e,t).map(r=>{let l=i&&i.has(r)?i.get(r):[];if(l.length){let p=l.shift();return p.dataIndex=t,p}else return {data:e,rowDef:r,dataIndex:t}})}_cacheColumnDefs(){this._columnDefsByName.clear(),bn(this._getOwnDefs(this._contentColumnDefs),this._customColumnDefs).forEach(t=>{this._columnDefsByName.has(t.name),this._columnDefsByName.set(t.name,t);});}_cacheRowDefs(){this._headerRowDefs=bn(this._getOwnDefs(this._contentHeaderRowDefs),this._customHeaderRowDefs),this._footerRowDefs=bn(this._getOwnDefs(this._contentFooterRowDefs),this._customFooterRowDefs),this._rowDefs=bn(this._getOwnDefs(this._contentRowDefs),this._customRowDefs);let e=this._rowDefs.filter(t=>!t.when);this._defaultRowDef=e[0];}_renderUpdatedColumns(){let e=(r,l)=>{let p=!!l.getColumnsDiff();return r||p},t=this._rowDefs.reduce(e,false);t&&this._forceRenderDataRows();let i=this._headerRowDefs.reduce(e,false);i&&this._forceRenderHeaderRows();let o=this._footerRowDefs.reduce(e,false);return o&&this._forceRenderFooterRows(),t||i||o}_switchDataSource(e){this._data=[],qe$1(this.dataSource)&&this.dataSource.disconnect(this),this._renderChangeSubscription&&(this._renderChangeSubscription.unsubscribe(),this._renderChangeSubscription=null),e||(this._dataDiffer&&this._dataDiffer.diff([]),this._rowOutlet&&this._rowOutlet.viewContainer.clear()),this._dataSource=e;}_observeRenderChanges(){if(!this.dataSource)return;let e;qe$1(this.dataSource)?e=this.dataSource.connect(this):Bh(this.dataSource)?e=this.dataSource:Array.isArray(this.dataSource)&&(e=Vh(this.dataSource)),this._renderChangeSubscription=Zh([e,this.viewChange]).pipe(gg(this._onDestroy)).subscribe(([t,i])=>{this._data=t||[],this._renderedRange=i,this._dataStream.next(t),this.renderRows();});}_forceRenderHeaderRows(){this._headerRowOutlet.viewContainer.length>0&&this._headerRowOutlet.viewContainer.clear(),this._headerRowDefs.forEach((e,t)=>this._renderRow(this._headerRowOutlet,e,t)),this.updateStickyHeaderRowStyles();}_forceRenderFooterRows(){this._footerRowOutlet.viewContainer.length>0&&this._footerRowOutlet.viewContainer.clear(),this._footerRowDefs.forEach((e,t)=>this._renderRow(this._footerRowOutlet,e,t)),this.updateStickyFooterRowStyles();}_addStickyColumnStyles(e,t){let i=Array.from(t?.columns||[]).map(l=>{let p=this._columnDefsByName.get(l);return p}),o=i.map(l=>l.sticky),r=i.map(l=>l.stickyEnd);this._stickyStyler.updateStickyColumns(e,o,r,!this.fixedLayout||this._forceRecalculateCellWidths);}_getRenderedRows(e){let t=[];for(let i=0;i<e.viewContainer.length;i++){let o=e.viewContainer.get(i);t.push(o.rootNodes[0]);}return t}_getRowDefs(e,t){if(this._rowDefs.length===1)return [this._rowDefs[0]];let i=[];if(this.multiTemplateDataRows)i=this._rowDefs.filter(o=>!o.when||o.when(t,e));else {let o=this._rowDefs.find(r=>r.when&&r.when(t,e))||this._defaultRowDef;o&&i.push(o);}return i.length,i}_getEmbeddedViewArgs(e,t){let i=e.rowDef,o={$implicit:e.data};return {templateRef:i.template,context:o,index:t}}_renderRow(e,t,i,o={}){let r=e.viewContainer.createEmbeddedView(t.template,o,i);return this._renderCellTemplateForItem(t,o),r}_renderCellTemplateForItem(e,t){for(let i of this._getCellTemplates(e))qe.mostRecentCellOutlet&&qe.mostRecentCellOutlet._viewContainer.createEmbeddedView(i,t);this._changeDetectorRef.markForCheck();}_updateRowIndexContext(){let e=this._rowOutlet.viewContainer;for(let t=0,i=e.length;t<i;t++){let r=e.get(t).context;r.count=i,r.first=t===0,r.last=t===i-1,r.even=t%2===0,r.odd=!r.even,this.multiTemplateDataRows?(r.dataIndex=this._renderRows[t].dataIndex,r.renderIndex=t):r.index=this._renderRows[t].dataIndex;}}_getCellTemplates(e){return !e||!e.columns?[]:Array.from(e.columns,t=>{let i=this._columnDefsByName.get(t);return e.extractCellTemplate(i)})}_forceRenderDataRows(){this._dataDiffer.diff([]),this._rowOutlet.viewContainer.clear(),this.renderRows();}_checkStickyStates(){let e=(t,i)=>t||i.hasStickyChanged();this._headerRowDefs.reduce(e,false)&&this.updateStickyHeaderRowStyles(),this._footerRowDefs.reduce(e,false)&&this.updateStickyFooterRowStyles(),Array.from(this._columnDefsByName.values()).reduce(e,false)&&(this._stickyColumnStylesNeedReset=true,this.updateStickyColumnStyles());}_setupStickyStyler(){let e=this._dir?this._dir.value:"ltr",t=this._injector;this._stickyStyler=new Zn(this._isNativeHtmlTable,this.stickyCssClass,this._platform.isBrowser,this.needsPositionStickyOnElement,e,this,t),(this._dir?this._dir.change:Vh()).pipe(gg(this._onDestroy)).subscribe(i=>{this._stickyStyler.direction=i,this.updateStickyColumnStyles();});}_setupVirtualScrolling(e){let t=typeof requestAnimationFrame<"u"?Ah:xh;this.viewChange.next({start:0,end:0}),e.renderedRangeStream.pipe(eg(0,t),gg(this._onDestroy)).subscribe(this.viewChange),e.attach({dataStream:this._dataStream,measureRangeSize:(i,o)=>this._measureRangeSize(i,o)}),Zh([e.renderedContentOffset,this._headerRowStickyUpdates]).pipe(gg(this._onDestroy)).subscribe(([i,o])=>{if(!(!o.sizes||!o.offsets||!o.elements))for(let r=0;r<o.elements.length;r++){let l=o.elements[r];if(l){let p=o.offsets[r],h=i!==0?Math.max(i-p,p):-p;for(let C of l)C.style.top=`${-h}px`;}}}),Zh([e.renderedContentOffset,this._footerRowStickyUpdates]).pipe(gg(this._onDestroy)).subscribe(([i,o])=>{if(!(!o.sizes||!o.offsets||!o.elements))for(let r=0;r<o.elements.length;r++){let l=o.elements[r];if(l)for(let p of l)p.style.bottom=`${i+o.offsets[r]}px`;}});}_getOwnDefs(e){return e.filter(t=>!t._table||t._table===this)}_updateNoDataRow(){let e=this._customNoDataRow||this._noDataRow;if(!e)return;let t=this._rowOutlet.viewContainer.length===0;if(t===this._isShowingNoDataRow)return;let i=this._noDataRowOutlet.viewContainer;if(t){let o=i.createEmbeddedView(e.templateRef),r=o.rootNodes[0];if(o.rootNodes.length===1&&r?.nodeType===this._document.ELEMENT_NODE){r.setAttribute("role","row"),r.classList.add(...e._contentClassNames);let l=r.querySelectorAll(e._cellSelector);for(let p=0;p<l.length;p++)l[p].classList.add(...e._cellClassNames);}}else i.clear();this._isShowingNoDataRow=t,this._changeDetectorRef.markForCheck();}_measureRangeSize(e,t){if(e.start>=e.end||t!=="vertical")return 0;let i=this.viewChange.value,o=this._rowOutlet.viewContainer;e.start<i.start||e.end>i.end;let r=e.start-i.start,l=e.end-e.start,p,h;for(let R=0;R<l;R++){let z=o.get(R+r);if(z&&z.rootNodes.length){p=h=z.rootNodes[0];break}}for(let R=l-1;R>-1;R--){let z=o.get(R+r);if(z&&z.rootNodes.length){h=z.rootNodes[z.rootNodes.length-1];break}}let C=p?.getBoundingClientRect?.(),B=h?.getBoundingClientRect?.();return C&&B?B.bottom-C.top:0}_virtualScrollEnabled(){return !this._disableVirtualScrolling&&this._virtualScrollViewport!=null}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["cdk-table"],["table","cdk-table",""]],contentQueries:function(t,i,o){if(t&1&&xp(o,Va,5)(o,bt,5)(o,xn,5)(o,Lt,5)(o,ei,5),t&2){let r;xI(r=AI())&&(i._noDataRow=r.first),xI(r=AI())&&(i._contentColumnDefs=r),xI(r=AI())&&(i._contentRowDefs=r),xI(r=AI())&&(i._contentHeaderRowDefs=r),xI(r=AI())&&(i._contentFooterRowDefs=r);}},hostAttrs:[1,"cdk-table"],hostVars:2,hostBindings:function(t,i){t&2&&Fp("cdk-table-fixed-layout",i.fixedLayout);},inputs:{trackBy:"trackBy",dataSource:"dataSource",multiTemplateDataRows:[2,"multiTemplateDataRows","multiTemplateDataRows",mF],fixedLayout:[2,"fixedLayout","fixedLayout",mF],recycleRows:[2,"recycleRows","recycleRows",mF]},outputs:{contentChanged:"contentChanged"},exportAs:["cdkTable"],features:[lD([{provide:xe,useExisting:n},{provide:At,useValue:null}])],ngContentSelectors:nr,decls:5,vars:2,consts:[["role","rowgroup"],["headerRowOutlet",""],["rowOutlet",""],["noDataRowOutlet",""],["footerRowOutlet",""]],template:function(t,i){t&1&&(MI(tr),NI(0),NI(1,1),fI(2,ir,1,0),fI(3,ar,7,0)(4,or,4,0)),t&2&&(By(2),pI(i._isServer?2:-1),By(),pI(i._isNativeHtmlTable?3:4));},dependencies:[ai,ii,ri,oi],styles:[`.cdk-table-fixed-layout {
  table-layout: fixed;
}
`],encapsulation:2,changeDetection:1})}return n})();function bn(n,a){return n.concat(Array.from(a))}function Ba(n,a){let e=a.toUpperCase(),t=n.viewContainer.element.nativeElement;for(;t;){let i=t.nodeType===1?t.nodeName:null;if(i===e)return t;if(i==="TABLE")break;t=t.parentNode;}return null}var Wa=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$E({type:n});static \u0275inj=jl({imports:[It$1]})}return n})();var sr=[[["caption"]],[["colgroup"],["col"]],"*"],lr=["caption","colgroup, col","*"];function cr(n,a){n&1&&NI(0,2);}function dr(n,a){n&1&&(ai$1(0,"thead",0),Cp(1,1),Mc(),ai$1(2,"tbody",2),Cp(3,3)(4,4),Mc(),ai$1(5,"tfoot",0),Cp(6,5),Mc());}function mr(n,a){n&1&&Cp(0,1)(1,3)(2,4)(3,5);}var wn=(()=>{class n extends si{stickyCssClass="mat-mdc-table-sticky";needsPositionStickyOnElement=false;static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275cmp=HE({type:n,selectors:[["mat-table"],["table","mat-table",""]],hostAttrs:[1,"mat-mdc-table","mdc-data-table__table"],hostVars:2,hostBindings:function(t,i){t&2&&Fp("mat-table-fixed-layout",i.fixedLayout);},exportAs:["matTable"],features:[lD([{provide:si,useExisting:n},{provide:xe,useExisting:n},{provide:At,useValue:null}]),dp],ngContentSelectors:lr,decls:5,vars:2,consts:[["role","rowgroup"],["headerRowOutlet",""],["role","rowgroup",1,"mdc-data-table__content"],["rowOutlet",""],["noDataRowOutlet",""],["footerRowOutlet",""]],template:function(t,i){t&1&&(MI(sr),NI(0),NI(1,1),fI(2,cr,1,0),fI(3,dr,7,0)(4,mr,4,0)),t&2&&(By(2),pI(i._isServer?2:-1),By(),pI(i._isNativeHtmlTable?3:4));},dependencies:[ai,ii,ri,oi],styles:[`.mat-mdc-table-sticky {
  position: sticky !important;
}

mat-table {
  display: block;
}

mat-header-row {
  min-height: var(--mat-table-header-container-height, 56px);
}

mat-row {
  min-height: var(--mat-table-row-item-container-height, 52px);
}

mat-footer-row {
  min-height: var(--mat-table-footer-container-height, 52px);
}

mat-row, mat-header-row, mat-footer-row {
  display: flex;
  border-width: 0;
  border-bottom-width: 1px;
  border-style: solid;
  align-items: center;
  box-sizing: border-box;
}

mat-cell:first-of-type, mat-header-cell:first-of-type, mat-footer-cell:first-of-type {
  padding-left: 24px;
}
[dir=rtl] mat-cell:first-of-type:not(:only-of-type), [dir=rtl] mat-header-cell:first-of-type:not(:only-of-type), [dir=rtl] mat-footer-cell:first-of-type:not(:only-of-type) {
  padding-left: 0;
  padding-right: 24px;
}
mat-cell:last-of-type, mat-header-cell:last-of-type, mat-footer-cell:last-of-type {
  padding-right: 24px;
}
[dir=rtl] mat-cell:last-of-type:not(:only-of-type), [dir=rtl] mat-header-cell:last-of-type:not(:only-of-type), [dir=rtl] mat-footer-cell:last-of-type:not(:only-of-type) {
  padding-right: 0;
  padding-left: 24px;
}

mat-cell, mat-header-cell, mat-footer-cell {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  word-wrap: break-word;
  min-height: inherit;
}

.mat-mdc-table {
  min-width: 100%;
  border: 0;
  border-spacing: 0;
  table-layout: auto;
  white-space: normal;
  background-color: var(--mat-table-background-color, var(--mat-sys-surface));
}

.mat-table-fixed-layout {
  table-layout: fixed;
}

.mdc-data-table__cell {
  box-sizing: border-box;
  overflow: hidden;
  text-align: start;
  text-overflow: ellipsis;
}

.mdc-data-table__cell,
.mdc-data-table__header-cell {
  padding: 0 16px;
}

.mat-mdc-header-row {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  height: var(--mat-table-header-container-height, 56px);
  color: var(--mat-table-header-headline-color, var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
  font-family: var(--mat-table-header-headline-font, var(--mat-sys-title-small-font, Roboto, sans-serif));
  line-height: var(--mat-table-header-headline-line-height, var(--mat-sys-title-small-line-height));
  font-size: var(--mat-table-header-headline-size, var(--mat-sys-title-small-size, 14px));
  font-weight: var(--mat-table-header-headline-weight, var(--mat-sys-title-small-weight, 500));
}

.mat-mdc-row {
  height: var(--mat-table-row-item-container-height, 52px);
  color: var(--mat-table-row-item-label-text-color, var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
}

.mat-mdc-row,
.mdc-data-table__content {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: var(--mat-table-row-item-label-text-font, var(--mat-sys-body-medium-font, Roboto, sans-serif));
  line-height: var(--mat-table-row-item-label-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-table-row-item-label-text-size, var(--mat-sys-body-medium-size, 14px));
  font-weight: var(--mat-table-row-item-label-text-weight, var(--mat-sys-body-medium-weight));
}

.mat-mdc-footer-row {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  height: var(--mat-table-footer-container-height, 52px);
  color: var(--mat-table-row-item-label-text-color, var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
  font-family: var(--mat-table-footer-supporting-text-font, var(--mat-sys-body-medium-font, Roboto, sans-serif));
  line-height: var(--mat-table-footer-supporting-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-table-footer-supporting-text-size, var(--mat-sys-body-medium-size, 14px));
  font-weight: var(--mat-table-footer-supporting-text-weight, var(--mat-sys-body-medium-weight));
  letter-spacing: var(--mat-table-footer-supporting-text-tracking, var(--mat-sys-body-medium-tracking));
}

.mat-mdc-header-cell {
  border-bottom-color: var(--mat-table-row-item-outline-color, var(--mat-sys-outline, rgba(0, 0, 0, 0.12)));
  border-bottom-width: var(--mat-table-row-item-outline-width, 1px);
  border-bottom-style: solid;
  letter-spacing: var(--mat-table-header-headline-tracking, var(--mat-sys-title-small-tracking));
  font-weight: inherit;
  line-height: inherit;
  box-sizing: border-box;
  text-overflow: ellipsis;
  overflow: hidden;
  outline: none;
  text-align: start;
}
.mdc-data-table__row:last-child > .mat-mdc-header-cell {
  border-bottom: none;
}

.mat-mdc-cell {
  border-bottom-color: var(--mat-table-row-item-outline-color, var(--mat-sys-outline, rgba(0, 0, 0, 0.12)));
  border-bottom-width: var(--mat-table-row-item-outline-width, 1px);
  border-bottom-style: solid;
  letter-spacing: var(--mat-table-row-item-label-text-tracking, var(--mat-sys-body-medium-tracking));
  line-height: inherit;
}
.mdc-data-table__row:last-child > .mat-mdc-cell {
  border-bottom: none;
}

.mat-mdc-footer-cell {
  letter-spacing: var(--mat-table-row-item-label-text-tracking, var(--mat-sys-body-medium-tracking));
}

mat-row.mat-mdc-row,
mat-header-row.mat-mdc-header-row,
mat-footer-row.mat-mdc-footer-row {
  border-bottom: none;
}

.mat-mdc-table tbody,
.mat-mdc-table tfoot,
.mat-mdc-table thead,
.mat-mdc-cell,
.mat-mdc-footer-cell,
.mat-mdc-header-row,
.mat-mdc-row,
.mat-mdc-footer-row,
.mat-mdc-table .mat-mdc-header-cell {
  background: inherit;
}

.mat-mdc-table mat-header-row.mat-mdc-header-row,
.mat-mdc-table mat-row.mat-mdc-row,
.mat-mdc-table mat-footer-row.mat-mdc-footer-cell {
  height: unset;
}

mat-header-cell.mat-mdc-header-cell,
mat-cell.mat-mdc-cell,
mat-footer-cell.mat-mdc-footer-cell {
  align-self: stretch;
}
`],encapsulation:2,changeDetection:1})}return n})(),Dn=(()=>{class n extends vn{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","matCellDef",""]],features:[lD([{provide:vn,useExisting:n}]),dp]})}return n})(),kn=(()=>{class n extends Cn{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","matHeaderCellDef",""]],features:[lD([{provide:Cn,useExisting:n}]),dp]})}return n})();var Mn=(()=>{class n extends bt{get name(){return this._name}set name(e){this._setNameInput(e);}_updateColumnCssClassName(){super._updateColumnCssClassName(),this._columnCssClassName.push(`mat-column-${this.cssClassFriendlyName}`);}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","matColumnDef",""]],inputs:{name:[0,"matColumnDef","name"]},features:[lD([{provide:bt,useExisting:n}]),dp]})}return n})(),Sn=(()=>{class n extends Ha{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["mat-header-cell"],["th","mat-header-cell",""]],hostAttrs:["role","columnheader",1,"mat-mdc-header-cell","mdc-data-table__header-cell"],features:[dp]})}return n})();var Rn=(()=>{class n extends ja{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["mat-cell"],["td","mat-cell",""]],hostAttrs:[1,"mat-mdc-cell","mdc-data-table__cell"],features:[dp]})}return n})();var Tn=(()=>{class n extends Lt{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","matHeaderRowDef",""]],inputs:{columns:[0,"matHeaderRowDef","columns"],sticky:[2,"matHeaderRowDefSticky","sticky",mF]},features:[lD([{provide:Lt,useExisting:n}]),dp]})}return n})();var En=(()=>{class n extends xn{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","matRowDef",""]],inputs:{columns:[0,"matRowDefColumns","columns"],when:[0,"matRowDefWhen","when"]},features:[lD([{provide:xn,useExisting:n}]),dp]})}return n})(),Pn=(()=>{class n extends ti{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275cmp=HE({type:n,selectors:[["mat-header-row"],["tr","mat-header-row",""]],hostAttrs:["role","row",1,"mat-mdc-header-row","mdc-data-table__header-row"],exportAs:["matHeaderRow"],features:[lD([{provide:ti,useExisting:n}]),dp],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,i){t&1&&Cp(0,0);},dependencies:[qe],encapsulation:2,changeDetection:1})}return n})();var On=(()=>{class n extends ni{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275cmp=HE({type:n,selectors:[["mat-row"],["tr","mat-row",""]],hostAttrs:["role","row",1,"mat-mdc-row","mdc-data-table__row"],exportAs:["matRow"],features:[lD([{provide:ni,useExisting:n}]),dp],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,i){t&1&&Cp(0,0);},dependencies:[qe],encapsulation:2,changeDetection:1})}return n})();var In=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$E({type:n});static \u0275inj=jl({imports:[Wa,Se]})}return n})();function Re(n){let a=new Date(n),e=String(a.getHours()).padStart(2,"0"),t=String(a.getMinutes()).padStart(2,"0"),i=String(a.getSeconds()).padStart(2,"0"),o=String(a.getMilliseconds()).padStart(3,"0");return `${e}:${t}:${i}.${o}`}function pr(n,a){n&1&&(ai$1(0,"th",12),tD(1,"Time"),Mc());}function ur(n,a){if(n&1&&(ai$1(0,"td",13),tD(1),Mc()),n&2){let e=a.$implicit;By(),Up(e.time);}}function hr(n,a){n&1&&(ai$1(0,"th",12),tD(1,"Action Name"),Mc());}function fr(n,a){if(n&1&&(ai$1(0,"td",13),tD(1),Mc()),n&2){let e=a.$implicit;By(),Up(e.action);}}function gr(n,a){n&1&&(ai$1(0,"th",12),tD(1,"Surface ID"),Mc());}function _r(n,a){if(n&1&&(ai$1(0,"td",13),tD(1),Mc()),n&2){let e=a.$implicit;By(),Up(e.surface);}}function br(n,a){n&1&&(ai$1(0,"th",12),tD(1,"Source Component"),Mc());}function yr(n,a){if(n&1&&(ai$1(0,"td",13),tD(1),Mc()),n&2){let e=a.$implicit;By(),Up(e.component);}}function vr(n,a){n&1&&(ai$1(0,"th",12),tD(1,"Context"),Mc());}function Cr(n,a){if(n&1&&(ai$1(0,"td",13)(1,"pre",14),tD(2),pD(3,"json"),Mc()()),n&2){let e=a.$implicit;By(2),Up(gD(3,1,e.context));}}function xr(n,a){n&1&&Dp(0,"tr",15);}function wr(n,a){n&1&&Dp(0,"tr",16);}function Dr(n,a){if(n&1&&(ai$1(0,"table",1),xc(1,3),pp(2,pr,2,0,"th",4)(3,ur,2,1,"td",5),Ac(),xc(4,6),pp(5,hr,2,0,"th",4)(6,fr,2,1,"td",5),Ac(),xc(7,7),pp(8,gr,2,0,"th",4)(9,_r,2,1,"td",5),Ac(),xc(10,8),pp(11,br,2,0,"th",4)(12,yr,2,1,"td",5),Ac(),xc(13,9),pp(14,vr,2,0,"th",4)(15,Cr,4,3,"td",5),Ac(),pp(16,xr,1,0,"tr",10)(17,wr,1,0,"tr",11),Mc()),n&2){let e=bI();Ip("dataSource",e.eventsLog()),By(16),Ip("matHeaderRowDef",e.displayedColumns),By(),Ip("matRowDefColumns",e.displayedColumns);}}function kr(n,a){n&1&&(ai$1(0,"div",2),tD(1,"No events captured yet"),Mc());}var yt=class n{hostComm=C(Xt);eventsLog=So$1([]);displayedColumns=["time","action","surface","component","context"];constructor(){Au(()=>{let a=this.hostComm.messageStream();if(a?.type===S.SEND_TO_SERVER){let e=a?.payload;if(e&&e.action){let t=e.action;if(typeof t=="string")try{t=JSON.parse(t);}catch{}if(t&&typeof t=="object"){let i=t,o=i.timestamp||a.timestamp,r={time:Re(o),action:i.name||"",surface:i.surfaceId||"",component:i.sourceComponentId||i.sourceComponent||"",context:i.context||i.contextParameters||null};wD(()=>{this.eventsLog.update(l=>{let p=[r,...l];return p.length>100&&(p.length=100),p});});}}}});}clearLogs(){this.eventsLog.set([]);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=HE({type:n,selectors:[["a2ui-composer-events"]],decls:3,vars:1,consts:[[1,"events-container"],["mat-table","",1,"mat-elevation-z1",3,"dataSource"],[1,"events-placeholder"],["matColumnDef","time"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","action"],["matColumnDef","surface"],["matColumnDef","component"],["matColumnDef","context"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","","class","element-row",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],[1,"context-preview"],["mat-header-row",""],["mat-row","",1,"element-row"]],template:function(e,t){e&1&&(ai$1(0,"div",0),fI(1,Dr,18,3,"table",1)(2,kr,2,0,"div",2),Mc()),e&2&&(By(),pI(t.eventsLog().length>0?1:2));},dependencies:[In,wn,kn,Tn,Mn,Dn,En,Sn,Rn,Pn,On,Yt],styles:["[_nghost-%COMP%]{display:block;height:100%;width:100%}.events-container[_ngcontent-%COMP%]{height:100%;width:100%;overflow:auto;box-sizing:border-box;padding:8px}.events-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mat-sys-on-surface-variant);font-size:14px}table[_ngcontent-%COMP%]{width:100%;background:var(--mat-sys-surface);border-radius:6px;overflow:hidden}table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{font-weight:700;color:var(--mat-sys-on-surface-variant);font-size:12px}table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface);vertical-align:middle}table[_ngcontent-%COMP%]   pre.context-preview[_ngcontent-%COMP%]{margin:0;font-family:monospace;font-size:11px;white-space:pre-wrap;background:var(--mat-sys-surface-container-lowest);padding:4px 8px;border-radius:4px;max-width:300px;overflow-x:auto}"]})};var Mr=()=>["expandedDetail"];function Sr(n,a){n&1&&(ai$1(0,"th",13),tD(1,"Time"),Mc());}function Rr(n,a){if(n&1&&(ai$1(0,"td",14),tD(1),Mc()),n&2){let e=a.$implicit;By(),Up(e.time);}}function Tr(n,a){n&1&&(ai$1(0,"th",13),tD(1,"Level"),Mc());}function Er(n,a){if(n&1&&(ai$1(0,"td",14)(1,"span",15),tD(2),Mc()()),n&2){let e=a.$implicit;By(),qI(e.level),By(),Up(e.level);}}function Pr(n,a){n&1&&(ai$1(0,"th",13),tD(1,"Source"),Mc());}function Or(n,a){if(n&1&&(ai$1(0,"td",14)(1,"span",16),tD(2),Mc()()),n&2){let e=a.$implicit;By(),qI(e.source),By(),Up(e.source);}}function Ir(n,a){n&1&&(ai$1(0,"th",13),tD(1,"Message"),Mc());}function Ar(n,a){if(n&1){let e=TI();ai$1(0,"button",20),Mp("click",function(i){cu(e);let o=bI().$implicit;return bI(2).toggleRow(o),lu(i.stopPropagation())}),ai$1(1,"mat-icon",21),tD(2),Mc()();}if(n&2){let e=bI().$implicit,t=bI(2);By(2),Up(t.isRowExpanded(e)?"keyboard_arrow_up":"keyboard_arrow_down");}}function Lr(n,a){if(n&1&&(ai$1(0,"td",14)(1,"div",17)(2,"span",18),tD(3),Mc(),fI(4,Ar,3,1,"button",19),Mc()()),n&2){let e=a.$implicit;By(3),Up(e.message),By(),pI(e.stack?4:-1);}}function Fr(n,a){if(n&1&&(ai$1(0,"pre",23),tD(1),Mc()),n&2){let e=bI().$implicit;By(),Up(e.stack);}}function Nr(n,a){if(n&1&&(ai$1(0,"td",14)(1,"div",22),fI(2,Fr,2,1,"pre",23),Mc()()),n&2){let e=a.$implicit,t=bI(2);Ep("colspan",t.columnsToDisplay.length),By(2),pI(e.stack?2:-1);}}function Br(n,a){n&1&&Dp(0,"tr",24);}function zr(n,a){if(n&1&&Dp(0,"tr",25),n&2){let e=a.dataIndex;Ep("data-row-index",e);}}function Hr(n,a){if(n&1&&Dp(0,"tr",26),n&2){let e=a.$implicit,t=bI(2);Fp("expanded",t.isRowExpanded(e));}}function jr(n,a){if(n&1&&(ai$1(0,"table",1),xc(1,3),pp(2,Sr,2,0,"th",4)(3,Rr,2,1,"td",5),Ac(),xc(4,6),pp(5,Tr,2,0,"th",4)(6,Er,3,3,"td",5),Ac(),xc(7,7),pp(8,Pr,2,0,"th",4)(9,Or,3,3,"td",5),Ac(),xc(10,8),pp(11,Ir,2,0,"th",4)(12,Lr,5,2,"td",5),Ac(),xc(13,9),pp(14,Nr,3,2,"td",5),Ac(),pp(15,Br,1,0,"tr",10)(16,zr,1,1,"tr",11)(17,Hr,1,2,"tr",12),Mc()),n&2){let e=bI();Ip("dataSource",e.errorsLog()),By(15),Ip("matHeaderRowDef",e.columnsToDisplay),By(),Ip("matRowDefColumns",e.columnsToDisplay),By(),Ip("matRowDefColumns",uD(4,Mr));}}function Vr(n,a){n&1&&(ai$1(0,"div",2),tD(1,"No errors captured yet"),Mc());}var vt=class n{hostComm=C(Xt);errorsLog=So$1([]);columnsToDisplay=["time","level","source","message"];expandedRows=So$1(new Set);constructor(){Au(()=>{let a=this.hostComm.messageStream();if(!a)return;let e=a.payload;if(e){if(a.type===S.CONSOLE_LOG){let t=e.message||"",i=t.includes("Unhandled Rejection")||t.includes("Uncaught")||!!e.stack,o=i?"exception":"console",r=i?"error":e.level||"log",l={time:Re(a.timestamp),source:o,level:r,message:t,stack:e.stack||void 0};wD(()=>{this.errorsLog.update(p=>{let h=[l,...p];return h.length>100&&(h.length=100),h});});}else if(a.type===S.DATA_MODEL_CHANGE&&e.validationErrors){let t=e.validationErrors;if(Array.isArray(t)?t.length>0:typeof t=="object"&&t!==null?Object.keys(t).length>0:!!t){let o="";Array.isArray(t)?o=t.map(l=>typeof l=="string"?l:JSON.stringify(l)).join(", "):typeof t=="object"?o=JSON.stringify(t):o=String(t);let r={time:Re(a.timestamp),source:"validation",level:"error",message:o,stack:void 0};wD(()=>{this.errorsLog.update(l=>{let p=[r,...l];return p.length>100&&(p.length=100),p});});}}}});}toggleRow(a){this.expandedRows.update(e=>{let t=new Set(e);return t.has(a)?t.delete(a):t.add(a),t});}isRowExpanded(a){return this.expandedRows().has(a)}clearLogs(){this.errorsLog.set([]),this.expandedRows.set(new Set);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=HE({type:n,selectors:[["a2ui-composer-errors"]],decls:3,vars:1,consts:[[1,"errors-container"],["mat-table","","multiTemplateDataRows","",1,"mat-elevation-z1",3,"dataSource"],[1,"errors-placeholder"],["matColumnDef","time"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","level"],["matColumnDef","source"],["matColumnDef","message"],["matColumnDef","expandedDetail"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","","class","element-row",4,"matRowDef","matRowDefColumns"],["mat-row","","class","detail-row",3,"expanded",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],[1,"level-badge"],[1,"source-badge"],[1,"message-cell"],[1,"error-message-text"],["mat-icon-button","","aria-label","Toggle Stack Trace"],["mat-icon-button","","aria-label","Toggle Stack Trace",3,"click"],["aria-hidden","true"],[1,"element-detail"],[1,"stack-preview"],["mat-header-row",""],["mat-row","",1,"element-row"],["mat-row","",1,"detail-row"]],template:function(e,t){e&1&&(ai$1(0,"div",0),fI(1,jr,18,5,"table",1)(2,Vr,2,0,"div",2),Mc()),e&2&&(By(),pI(t.errorsLog().length>0?1:2));},dependencies:[In,wn,kn,Tn,Mn,Dn,En,Sn,Rn,Pn,On,Ed,Lo,Hd,jd],styles:["[_nghost-%COMP%]{display:block;height:100%;width:100%}.errors-container[_ngcontent-%COMP%]{height:100%;width:100%;overflow:auto;box-sizing:border-box;padding:2px 0 2px 8px}.errors-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mat-sys-on-surface-variant);font-size:14px}table[_ngcontent-%COMP%]{width:100%;background:var(--mat-sys-surface);border-radius:6px;overflow:hidden}table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{font-weight:700;color:var(--mat-sys-on-surface-variant);font-size:12px}table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface);vertical-align:middle}table[_ngcontent-%COMP%]   .source-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}table[_ngcontent-%COMP%]   .source-badge.exception[_ngcontent-%COMP%]{background-color:#ffdad6;color:#ba1a1a}table[_ngcontent-%COMP%]   .source-badge.console[_ngcontent-%COMP%]{background-color:#ffe082;color:#ff8f00}table[_ngcontent-%COMP%]   .source-badge.validation[_ngcontent-%COMP%]{background-color:#e8f5e9;color:#2e7d32}table[_ngcontent-%COMP%]   .level-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}table[_ngcontent-%COMP%]   .level-badge.error[_ngcontent-%COMP%]{background-color:#ffdad6;color:#ba1a1a}table[_ngcontent-%COMP%]   .level-badge.warn[_ngcontent-%COMP%]{background-color:#ffe082;color:#ff8f00}table[_ngcontent-%COMP%]   .level-badge.info[_ngcontent-%COMP%]{background-color:#e8f0fe;color:#1a73e8}table[_ngcontent-%COMP%]   .level-badge.debug[_ngcontent-%COMP%], table[_ngcontent-%COMP%]   .level-badge.log[_ngcontent-%COMP%]{background-color:#f1f3f4;color:#5f6368}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   .error-message-text[_ngcontent-%COMP%]{flex:1;white-space:normal;word-break:break-word}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{width:28px;height:28px;line-height:28px}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]     .mat-mdc-button-touch-target{display:none}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:18px;width:18px;height:18px}table[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]{height:0;display:none}table[_ngcontent-%COMP%]   .detail-row.expanded[_ngcontent-%COMP%]{display:table-row;height:auto}table[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{border-bottom-width:0;padding:0}table[_ngcontent-%COMP%]   .element-detail[_ngcontent-%COMP%]{overflow:hidden;box-sizing:border-box;background:var(--mat-sys-surface-container-lowest)}table[_ngcontent-%COMP%]   .element-detail[_ngcontent-%COMP%]   pre.stack-preview[_ngcontent-%COMP%]{margin:8px;font-family:monospace;font-size:11px;white-space:pre-wrap;word-break:break-all;color:var(--mat-sys-error);padding:8px;border-left:3px solid var(--mat-sys-error);background:#ba1a1a0d;border-radius:0 4px 4px 0}"]})};var Qa=new x("CdkAccordion");var Ga=(()=>{class n{accordion=C(Qa,{optional:true,skipSelf:true});_changeDetectorRef=C(hF);_expansionDispatcher=C($e);_openCloseAllSubscription=j.EMPTY;closed=new Le;opened=new Le;destroyed=new Le;expandedChange=new Le;id=C(An$1).getId("cdk-accordion-child-");get expanded(){return this._expanded}set expanded(e){if(this._expanded!==e){if(this._expanded=e,this.expandedChange.emit(e),e){this.opened.emit();let t=this.accordion?this.accordion.id:this.id;this._expansionDispatcher.notify(this.id,t);}else this.closed.emit();this._changeDetectorRef.markForCheck();}}_expanded=false;get disabled(){return this._disabled()}set disabled(e){this._disabled.set(e);}_disabled=So$1(false);_removeUniqueSelectionListener=()=>{};ngOnInit(){this._removeUniqueSelectionListener=this._expansionDispatcher.listen((e,t)=>{this.accordion&&!this.accordion.multi&&this.accordion.id===t&&this.id!==e&&(this.expanded=false);}),this.accordion&&(this._openCloseAllSubscription=this._subscribeToOpenCloseAllActions());}ngOnDestroy(){this.opened.complete(),this.closed.complete(),this.destroyed.emit(),this.destroyed.complete(),this._removeUniqueSelectionListener(),this._openCloseAllSubscription.unsubscribe();}toggle(){this.disabled||(this.expanded=!this.expanded);}close(){this.disabled||(this.expanded=false);}open(){this.disabled||(this.expanded=true);}_subscribeToOpenCloseAllActions(){return this.accordion._openCloseAllActions.subscribe(e=>{this.disabled||(this.expanded=e);})}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["cdk-accordion-item"],["","cdkAccordionItem",""]],inputs:{expanded:[2,"expanded","expanded",mF],disabled:[2,"disabled","disabled",mF]},outputs:{closed:"closed",opened:"opened",destroyed:"destroyed",expandedChange:"expandedChange"},exportAs:["cdkAccordionItem"],features:[lD([{provide:Qa,useValue:void 0}])]})}return n})(),$a=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$E({type:n});static \u0275inj=jl({})}return n})();var Wr=["body"],Ur=["bodyWrapper"],Qr=[[["mat-expansion-panel-header"]],"*",[["mat-action-row"]]],Gr=["mat-expansion-panel-header","*","mat-action-row"];function $r(n,a){}var Jr=[[["mat-panel-title"]],[["mat-panel-description"]],"*"],qr=["mat-panel-title","mat-panel-description","*"];function Kr(n,a){n&1&&(Nc(0,"span",1),Du$1(),Nc(1,"svg",2),wp(2,"path",3),Sc()());}var Ja=new x("MAT_ACCORDION"),qa=new x("MAT_EXPANSION_PANEL"),Yr=(()=>{class n{_template=C(nr$1);_expansionPanel=C(qa,{optional:true});static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["ng-template","matExpansionPanelContent",""]]})}return n})(),Ka=new x("MAT_EXPANSION_PANEL_DEFAULT_OPTIONS"),di=(()=>{class n extends Ga{_viewContainerRef=C(Di);_animationsDisabled=xe$1();_document=C(No$1);_ngZone=C(Ce);_elementRef=C(cr$1);_renderer=C(zv);_cleanupTransitionEnd;get hideToggle(){return this._hideToggle||this.accordion&&this.accordion.hideToggle}set hideToggle(e){this._hideToggle=e;}_hideToggle=false;get togglePosition(){return this._togglePosition||this.accordion&&this.accordion.togglePosition}set togglePosition(e){this._togglePosition=e;}_togglePosition;afterExpand=new Le;afterCollapse=new Le;_inputChanges=new X;accordion=C(Ja,{optional:true,skipSelf:true});_lazyContent;_body;_bodyWrapper;_portal;_headerId=C(An$1).getId("mat-expansion-panel-header-");constructor(){super();let e=C(Ka,{optional:true});this._expansionDispatcher=C($e),e&&(this.hideToggle=e.hideToggle);}_hasSpacing(){return this.accordion?this.expanded&&this.accordion.displayMode==="default":false}_getExpandedState(){return this.expanded?"expanded":"collapsed"}toggle(){this.expanded=!this.expanded;}close(){this.expanded=false;}open(){this.expanded=true;}ngAfterContentInit(){this._lazyContent&&this._lazyContent._expansionPanel===this&&this.opened.pipe(pg(null),Rn$1(()=>this.expanded&&!this._portal),Kt(1)).subscribe(()=>{this._portal=new G(this._lazyContent._template,this._viewContainerRef);}),this._setupAnimationEvents();}ngOnChanges(e){this._inputChanges.next(e);}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTransitionEnd?.(),this._inputChanges.complete();}_containsFocus(){if(this._body){let e=this._document.activeElement,t=this._body.nativeElement;return e===t||t.contains(e)}return  false}_transitionEndListener=({target:e,propertyName:t})=>{e===this._bodyWrapper?.nativeElement&&t==="grid-template-rows"&&this._ngZone.run(()=>{this.expanded?this.afterExpand.emit():this.afterCollapse.emit();});};_setupAnimationEvents(){this._ngZone.runOutsideAngular(()=>{this._animationsDisabled?(this.opened.subscribe(()=>this._ngZone.run(()=>this.afterExpand.emit())),this.closed.subscribe(()=>this._ngZone.run(()=>this.afterCollapse.emit()))):setTimeout(()=>{let e=this._elementRef.nativeElement;this._cleanupTransitionEnd=this._renderer.listen(e,"transitionend",this._transitionEndListener),e.classList.add("mat-expansion-panel-animations-enabled");},200);});}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["mat-expansion-panel"]],contentQueries:function(t,i,o){if(t&1&&xp(o,Yr,5),t&2){let r;xI(r=AI())&&(i._lazyContent=r.first);}},viewQuery:function(t,i){if(t&1&&Ap(Wr,5)(Ur,5),t&2){let o;xI(o=AI())&&(i._body=o.first),xI(o=AI())&&(i._bodyWrapper=o.first);}},hostAttrs:[1,"mat-expansion-panel"],hostVars:4,hostBindings:function(t,i){t&2&&Fp("mat-expanded",i.expanded)("mat-expansion-panel-spacing",i._hasSpacing());},inputs:{hideToggle:[2,"hideToggle","hideToggle",mF],togglePosition:"togglePosition"},outputs:{afterExpand:"afterExpand",afterCollapse:"afterCollapse"},exportAs:["matExpansionPanel"],features:[lD([{provide:Ja,useValue:void 0},{provide:qa,useExisting:n}]),dp,pm],ngContentSelectors:Gr,decls:9,vars:4,consts:[["bodyWrapper",""],["body",""],[1,"mat-expansion-panel-content-wrapper"],["role","region",1,"mat-expansion-panel-content",3,"id"],[1,"mat-expansion-panel-body"],[3,"cdkPortalOutlet"]],template:function(t,i){t&1&&(MI(Qr),NI(0),ai$1(1,"div",2,0)(3,"div",3,1)(5,"div",4),NI(6,1),pp(7,$r,0,0,"ng-template",5),Mc(),NI(8,2),Mc()()),t&2&&(By(),Ep("inert",i.expanded?null:""),By(2),Ip("id",i.id),Ep("aria-labelledby",i._headerId),By(4),Ip("cdkPortalOutlet",i._portal));},dependencies:[Xi],styles:[`.mat-expansion-panel {
  box-sizing: content-box;
  display: block;
  margin: 0;
  overflow: hidden;
}
.mat-expansion-panel.mat-expansion-panel-animations-enabled {
  transition: margin 225ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-expansion-panel {
  position: relative;
  background: var(--mat-expansion-container-background-color, var(--mat-sys-surface));
  color: var(--mat-expansion-container-text-color, var(--mat-sys-on-surface));
  border-radius: var(--mat-expansion-container-shape, 12px);
}
.mat-expansion-panel:not([class*=mat-elevation-z]) {
  box-shadow: var(--mat-expansion-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
}
.mat-accordion .mat-expansion-panel:not(.mat-expanded), .mat-accordion .mat-expansion-panel:not(.mat-expansion-panel-spacing) {
  border-radius: 0;
}
.mat-accordion .mat-expansion-panel:first-of-type {
  border-top-right-radius: var(--mat-expansion-container-shape, 12px);
  border-top-left-radius: var(--mat-expansion-container-shape, 12px);
}
.mat-accordion .mat-expansion-panel:last-of-type {
  border-bottom-right-radius: var(--mat-expansion-container-shape, 12px);
  border-bottom-left-radius: var(--mat-expansion-container-shape, 12px);
}
@media (forced-colors: active) {
  .mat-expansion-panel {
    outline: solid 1px;
  }
}

.mat-expansion-panel-content-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  grid-template-columns: 100%;
}
.mat-expansion-panel-animations-enabled .mat-expansion-panel-content-wrapper {
  transition: grid-template-rows 225ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-expansion-panel.mat-expanded > .mat-expansion-panel-content-wrapper {
  grid-template-rows: 1fr;
}
@supports not (grid-template-rows: 0fr) {
  .mat-expansion-panel-content-wrapper {
    height: 0;
  }
  .mat-expansion-panel.mat-expanded > .mat-expansion-panel-content-wrapper {
    height: auto;
  }
}
@media print {
  .mat-expansion-panel-content-wrapper {
    height: 0;
  }
  .mat-expansion-panel.mat-expanded > .mat-expansion-panel-content-wrapper {
    height: auto;
  }
}

.mat-expansion-panel-content {
  display: flex;
  flex-direction: column;
  overflow: visible;
  min-height: 0;
  visibility: hidden;
}
.mat-expansion-panel-animations-enabled .mat-expansion-panel-content {
  transition: visibility 190ms linear;
}
.mat-expansion-panel.mat-expanded > .mat-expansion-panel-content-wrapper > .mat-expansion-panel-content {
  visibility: visible;
}
.mat-expansion-panel-content {
  font-family: var(--mat-expansion-container-text-font, var(--mat-sys-body-large-font));
  font-size: var(--mat-expansion-container-text-size, var(--mat-sys-body-large-size));
  font-weight: var(--mat-expansion-container-text-weight, var(--mat-sys-body-large-weight));
  line-height: var(--mat-expansion-container-text-line-height, var(--mat-sys-body-large-line-height));
  letter-spacing: var(--mat-expansion-container-text-tracking, var(--mat-sys-body-large-tracking));
}

.mat-expansion-panel-body {
  padding: 0 24px 16px;
}

.mat-expansion-panel-spacing {
  margin: 16px 0;
}
.mat-accordion > .mat-expansion-panel-spacing:first-child, .mat-accordion > *:first-child:not(.mat-expansion-panel) .mat-expansion-panel-spacing {
  margin-top: 0;
}
.mat-accordion > .mat-expansion-panel-spacing:last-child, .mat-accordion > *:last-child:not(.mat-expansion-panel) .mat-expansion-panel-spacing {
  margin-bottom: 0;
}

.mat-action-row {
  border-top-style: solid;
  border-top-width: 1px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 16px 8px 16px 24px;
  border-top-color: var(--mat-expansion-actions-divider-color, var(--mat-sys-outline));
}
.mat-action-row .mat-button-base,
.mat-action-row .mat-mdc-button-base {
  margin-left: 8px;
}
[dir=rtl] .mat-action-row .mat-button-base,
[dir=rtl] .mat-action-row .mat-mdc-button-base {
  margin-left: 0;
  margin-right: 8px;
}
`],encapsulation:2})}return n})();var Ya=(()=>{class n{panel=C(di,{host:true});_element=C(cr$1);_focusMonitor=C(At$1);_changeDetectorRef=C(hF);_parentChangeSubscription=j.EMPTY;constructor(){C(q$1).load(ri$1);let e=this.panel,t=C(Ka,{optional:true}),i=C(new Yp("tabindex"),{optional:true}),o=e.accordion?e.accordion._stateChanges.pipe(Rn$1(r=>!!(r.hideToggle||r.togglePosition))):yt$1;this.tabIndex=parseInt(i||"")||0,this._parentChangeSubscription=Xh(e.opened,e.closed,o,e._inputChanges.pipe(Rn$1(r=>!!(r.hideToggle||r.disabled||r.togglePosition)))).subscribe(()=>this._changeDetectorRef.markForCheck()),e.closed.pipe(Rn$1(()=>e._containsFocus())).subscribe(()=>this._focusMonitor.focusVia(this._element,"program")),t&&(this.expandedHeight=t.expandedHeight,this.collapsedHeight=t.collapsedHeight);}expandedHeight;collapsedHeight;tabIndex=0;get disabled(){return this.panel.disabled}_toggle(){this.disabled||this.panel.toggle();}_isExpanded(){return this.panel.expanded}_getExpandedState(){return this.panel._getExpandedState()}_getPanelId(){return this.panel.id}_getTogglePosition(){return this.panel.togglePosition}_showToggle(){return !this.panel.hideToggle&&!this.panel.disabled}_getHeaderHeight(){let e=this._isExpanded();return e&&this.expandedHeight?this.expandedHeight:!e&&this.collapsedHeight?this.collapsedHeight:null}_keydown(e){switch(e.keyCode){case 32:case 13:Wr$1(e)||(e.preventDefault(),this._toggle());break;default:this.panel.accordion&&this.panel.accordion._handleHeaderKeydown(e);return}}focus(e,t){e?this._focusMonitor.focusVia(this._element,e,t):this._element.nativeElement.focus(t);}ngAfterViewInit(){this._focusMonitor.monitor(this._element).subscribe(e=>{e&&this.panel.accordion&&this.panel.accordion._handleHeaderFocus(this);});}ngOnDestroy(){this._parentChangeSubscription.unsubscribe(),this._focusMonitor.stopMonitoring(this._element);}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["mat-expansion-panel-header"]],hostAttrs:["role","button",1,"mat-expansion-panel-header","mat-focus-indicator"],hostVars:13,hostBindings:function(t,i){t&1&&Mp("click",function(){return i._toggle()})("keydown",function(r){return i._keydown(r)}),t&2&&(Ep("id",i.panel._headerId)("tabindex",i.disabled?-1:i.tabIndex)("aria-controls",i._getPanelId())("aria-expanded",i._isExpanded())("aria-disabled",i.panel.disabled),Lp("height",i._getHeaderHeight()),Fp("mat-expanded",i._isExpanded())("mat-expansion-toggle-indicator-after",i._getTogglePosition()==="after")("mat-expansion-toggle-indicator-before",i._getTogglePosition()==="before"));},inputs:{expandedHeight:"expandedHeight",collapsedHeight:"collapsedHeight",tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:yF(e)]},ngContentSelectors:qr,decls:5,vars:3,consts:[[1,"mat-content"],[1,"mat-expansion-indicator"],["xmlns","http://www.w3.org/2000/svg","viewBox","0 -960 960 960","aria-hidden","true","focusable","false"],["d","M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"]],template:function(t,i){t&1&&(MI(Jr),Nc(0,"span",0),NI(1),NI(2,1),NI(3,2),Sc(),fI(4,Kr,3,0,"span",1)),t&2&&(Fp("mat-content-hide-toggle",!i._showToggle()),By(4),pI(i._showToggle()?4:-1));},styles:[`.mat-expansion-panel-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 24px;
  border-radius: inherit;
}
.mat-expansion-panel-animations-enabled .mat-expansion-panel-header {
  transition: height 225ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-expansion-panel-header::before {
  border-radius: inherit;
}
.mat-expansion-panel-header {
  height: var(--mat-expansion-header-collapsed-state-height, 48px);
  font-family: var(--mat-expansion-header-text-font, var(--mat-sys-title-medium-font));
  font-size: var(--mat-expansion-header-text-size, var(--mat-sys-title-medium-size));
  font-weight: var(--mat-expansion-header-text-weight, var(--mat-sys-title-medium-weight));
  line-height: var(--mat-expansion-header-text-line-height, var(--mat-sys-title-medium-line-height));
  letter-spacing: var(--mat-expansion-header-text-tracking, var(--mat-sys-title-medium-tracking));
}
.mat-expansion-panel-header.mat-expanded {
  height: var(--mat-expansion-header-expanded-state-height, 64px);
}
.mat-expansion-panel-header[aria-disabled=true] {
  color: var(--mat-expansion-header-disabled-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-expansion-panel-header:not([aria-disabled=true]) {
  cursor: pointer;
}
.mat-expansion-panel:not(.mat-expanded) .mat-expansion-panel-header:not([aria-disabled=true]):hover {
  background: var(--mat-expansion-header-hover-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-hover-state-layer-opacity) * 100%), transparent));
}
@media (hover: none) {
  .mat-expansion-panel:not(.mat-expanded) .mat-expansion-panel-header:not([aria-disabled=true]):hover {
    background: var(--mat-expansion-container-background-color, var(--mat-sys-surface));
  }
}
.mat-expansion-panel .mat-expansion-panel-header:not([aria-disabled=true]).cdk-keyboard-focused, .mat-expansion-panel .mat-expansion-panel-header:not([aria-disabled=true]).cdk-program-focused {
  background: var(--mat-expansion-header-focus-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-focus-state-layer-opacity) * 100%), transparent));
}
.mat-expansion-panel-header._mat-animation-noopable {
  transition: none;
}
.mat-expansion-panel-header:focus, .mat-expansion-panel-header:hover {
  outline: none;
}
.mat-expansion-panel-header.mat-expanded:focus, .mat-expansion-panel-header.mat-expanded:hover {
  background: inherit;
}
.mat-expansion-panel-header.mat-expansion-toggle-indicator-before {
  flex-direction: row-reverse;
}
.mat-expansion-panel-header.mat-expansion-toggle-indicator-before .mat-expansion-indicator {
  margin: 0 16px 0 0;
}
[dir=rtl] .mat-expansion-panel-header.mat-expansion-toggle-indicator-before .mat-expansion-indicator {
  margin: 0 0 0 16px;
}

.mat-content {
  display: flex;
  flex: 1;
  flex-direction: row;
  overflow: hidden;
}
.mat-content.mat-content-hide-toggle {
  margin-right: 8px;
}
[dir=rtl] .mat-content.mat-content-hide-toggle {
  margin-right: 0;
  margin-left: 8px;
}
.mat-expansion-toggle-indicator-before .mat-content.mat-content-hide-toggle {
  margin-left: 24px;
  margin-right: 0;
}
[dir=rtl] .mat-expansion-toggle-indicator-before .mat-content.mat-content-hide-toggle {
  margin-right: 24px;
  margin-left: 0;
}

.mat-expansion-panel-header-title {
  color: var(--mat-expansion-header-text-color, var(--mat-sys-on-surface));
}

.mat-expansion-panel-header-title,
.mat-expansion-panel-header-description {
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  margin-right: 16px;
  align-items: center;
}
[dir=rtl] .mat-expansion-panel-header-title,
[dir=rtl] .mat-expansion-panel-header-description {
  margin-right: 0;
  margin-left: 16px;
}
.mat-expansion-panel-header[aria-disabled=true] .mat-expansion-panel-header-title,
.mat-expansion-panel-header[aria-disabled=true] .mat-expansion-panel-header-description {
  color: inherit;
}

.mat-expansion-panel-header-description {
  flex-grow: 2;
  color: var(--mat-expansion-header-description-color, var(--mat-sys-on-surface-variant));
}

.mat-expansion-panel-animations-enabled .mat-expansion-indicator {
  transition: transform 225ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-expansion-panel-header.mat-expanded .mat-expansion-indicator {
  transform: rotate(180deg);
}
.mat-expansion-indicator::after {
  border-style: solid;
  border-width: 0 2px 2px 0;
  content: "";
  padding: 3px;
  transform: rotate(45deg);
  vertical-align: middle;
  color: var(--mat-expansion-header-indicator-color, var(--mat-sys-on-surface-variant));
  display: var(--mat-expansion-legacy-header-indicator-display, none);
}
.mat-expansion-indicator svg {
  width: 24px;
  height: 24px;
  margin: 0 -8px;
  vertical-align: middle;
  fill: var(--mat-expansion-header-indicator-color, var(--mat-sys-on-surface-variant));
  display: var(--mat-expansion-header-indicator-display, inline-block);
}

@media (forced-colors: active) {
  .mat-expansion-panel-content {
    border-top: 1px solid;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}
`],encapsulation:2})}return n})();var Za=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["mat-panel-title"]],hostAttrs:[1,"mat-expansion-panel-header-title"]})}return n})();var Xa=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$E({type:n});static \u0275inj=jl({imports:[$a,le,Se]})}return n})();var Xr=["logContainer"],es=(n,a)=>a.type+"-"+a.timestamp;function ts(n,a){if(n&1&&(ai$1(0,"span",8),tD(1),Mc()),n&2){let e=bI(2).$implicit;By(),Up(e.origin);}}function ns(n,a){if(n&1&&(ai$1(0,"mat-expansion-panel",4)(1,"mat-expansion-panel-header")(2,"mat-panel-title")(3,"span",6),tD(4),Mc(),ai$1(5,"span",7),tD(6),Mc(),fI(7,ts,2,1,"span",8),Mc()(),ai$1(8,"pre"),tD(9),pD(10,"json"),Mc()()),n&2){let e=bI().$implicit;Ip("expanded",false),By(4),Up(e.timestampStr),By(2),Up(e.type),By(),pI(e.origin?7:-1),By(2),Up(gD(10,5,e.payload));}}function is(n,a){if(n&1&&(ai$1(0,"pre"),tD(1),pD(2,"json"),Mc()),n&2){let e=bI(2).$implicit;By(),Up(gD(2,1,e.payload));}}function as(n,a){if(n&1&&(ai$1(0,"div",5)(1,"div",9)(2,"span",6),tD(3),Mc(),ai$1(4,"span",7),tD(5),Mc(),ai$1(6,"span",8),tD(7),Mc()(),fI(8,is,3,3,"pre"),Mc()),n&2){let e=bI().$implicit;By(3),Up(e.timestampStr),By(2),Up(e.type),By(2),Up(e.origin),By(),pI(e.payload?8:-1);}}function os(n,a){if(n&1&&fI(0,ns,11,7,"mat-expansion-panel",4)(1,as,9,4,"div",5),n&2){let e=a.$implicit,t=bI(2);pI(t.isCollapsible(e)?0:1);}}function rs(n,a){if(n&1&&mI(0,os,2,1,null,null,es),n&2){let e=bI();yI(e.messageHistory());}}function ss(n,a){n&1&&(ai$1(0,"div",3),tD(1,"No messages captured yet"),Mc());}var Ct=class n{hostComm=C(Xt);chatState=C(se);messageHistory=So$1([]);logContainer=dF("logContainer");TEST_ONLY={logContainer:()=>this.logContainer()};postMessageListener=a=>{a.type!==S.CONSOLE_LOG&&this.addLogEntry({type:a.type,payload:a.payload,timestamp:a.timestamp,timestampStr:Re(a.timestamp),origin:a.origin});};constructor(){let e=this.hostComm.getHistoryBuffer().filter(l=>l.type!==S.CONSOLE_LOG).map(l=>({type:l.type,payload:l.payload,timestamp:l.timestamp,timestampStr:Re(l.timestamp),origin:l.origin})),t=this.chatState.llmHistory().map(l=>({type:l.type,payload:l.payload,timestamp:l.timestamp,timestampStr:Re(l.timestamp)})),i=[...e,...t],o=[],r=new Set;for(let l of i){let p=`${l.type}-${l.timestamp}`;r.has(p)||(r.add(p),o.push(l));}o.sort((l,p)=>p.timestamp-l.timestamp),this.messageHistory.set(o.slice(0,100)),this.hostComm.addListener(this.postMessageListener),Au(()=>{let l=this.chatState.latestLlmLog();l&&this.addLogEntry({type:l.type,payload:l.payload,timestamp:l.timestamp,timestampStr:Re(l.timestamp)});}),vF(()=>{this.messageHistory();let l=this.logContainer()?.nativeElement;l&&(l.scrollTop=0);});}clearLogs(){this.messageHistory.set([]),this.chatState.clearRawLlmHistory(),this.hostComm.clearHistoryBuffer();}ngOnDestroy(){this.hostComm.removeListener(this.postMessageListener);}isCollapsible(a){return a.type!==S.RENDERER_READY&&a.type!==S.FORCE_UNBLOCK&&a.type!==S.SET_BLOCKING_STATE}addLogEntry(a){this.messageHistory.update(e=>e.some(i=>i.timestamp===a.timestamp&&i.type===a.type)?e:[a,...e].sort((i,o)=>o.timestamp-i.timestamp).slice(0,100));}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=HE({type:n,selectors:[["a2ui-composer-raw-messages"]],viewQuery:function(e,t){e&1&&Rp(t.logContainer,Xr,5),e&2&&kI();},decls:5,vars:1,consts:[["logContainer",""],[1,"raw-messages-wrapper"],[1,"raw-messages-container"],[1,"raw-messages-placeholder"],["data-testid","llm-log-panel",1,"llm-log-panel",3,"expanded"],["data-testid","raw-message-envelope",1,"message-envelope"],[1,"timestamp"],[1,"message-type"],[1,"origin"],[1,"envelope-header"]],template:function(e,t){e&1&&(ai$1(0,"div",1)(1,"div",2,0),fI(3,rs,2,0)(4,ss,2,0,"div",3),Mc()()),e&2&&(By(3),pI(t.messageHistory().length>0?3:4));},dependencies:[Xa,di,Ya,Za,Yt],styles:["[_nghost-%COMP%]{display:block;height:100%;width:100%}.raw-messages-wrapper[_ngcontent-%COMP%]{display:flex;flex-direction:column;height:100%;width:100%}.raw-messages-container[_ngcontent-%COMP%]{flex:1;height:0;width:100%;overflow-y:auto;box-sizing:border-box;padding:0 8px 8px;display:flex;flex-direction:column;gap:4px}.raw-messages-container[_ngcontent-%COMP%] > [_ngcontent-%COMP%]:first-child{margin-top:8px}.raw-messages-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mat-sys-on-surface-variant);font-size:14px}.message-envelope[_ngcontent-%COMP%]{flex-shrink:0;border:1px solid var(--mat-sys-outline-variant);border-radius:4px;background-color:var(--mat-sys-surface-container);padding:6px 8px;box-shadow:0 1px 2px #0000000d;display:flex;flex-direction:column;gap:4px}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]{display:flex;gap:12px;font-size:11px;font-weight:700;color:var(--mat-sys-on-surface-variant);padding-bottom:2px;margin-bottom:2px}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]   .timestamp[_ngcontent-%COMP%]{color:var(--mat-sys-primary)}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]   .message-type[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]   .origin[_ngcontent-%COMP%]{margin-left:auto;font-weight:400}.message-envelope[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{margin:0;font-family:monospace;font-size:11px;overflow-x:auto;white-space:pre-wrap;color:var(--mat-sys-on-surface)}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]{flex-shrink:0;min-width:0;box-shadow:none!important;background-color:var(--mat-sys-surface-container-low)!important;transition:background-color .2s ease}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]:hover{background-color:var(--mat-sys-surface-container)!important}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]{border:1px solid var(--mat-sys-outline-variant);border-radius:4px;overflow:visible!important}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     .mat-expansion-panel-content-wrapper{overflow:hidden;border-bottom-left-radius:inherit;border-bottom-right-radius:inherit}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-expansion-panel-header{position:sticky;top:0;z-index:10;height:28px!important;padding:0 8px!important;background-color:inherit;border-top-left-radius:inherit;border-top-right-radius:inherit}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-expansion-panel-header.mat-expanded{border-bottom:1px solid var(--mat-sys-outline-variant);box-shadow:0 2px 4px #0000000d}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title{display:flex;align-items:center;gap:12px;font-size:11px!important;color:var(--mat-sys-on-surface-variant)!important}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .timestamp{color:var(--mat-sys-primary);font-weight:700}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .message-type{color:var(--mat-sys-tertiary);font-weight:700}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .message-type.llm{color:var(--mat-sys-primary)}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .origin{margin-left:auto;font-weight:400;opacity:.8}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-description{font-size:10px;color:var(--mat-sys-outline);display:flex;align-items:center;justify-content:flex-end}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     .mat-expansion-panel-body{padding:6px 8px!important;background-color:var(--mat-sys-surface-container-lowest)!important;min-width:0}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{margin:0;font-family:monospace;font-size:11px;overflow-x:auto;white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%;box-sizing:border-box;color:var(--mat-sys-on-surface)}"]})};var An=class n{static \u0275fac=function(e){return new(e||n)};static \u0275cmp=HE({type:n,selectors:[["a2ui-composer-mock-rules"]],decls:2,vars:0,consts:[[1,"mock-rules-placeholder"]],template:function(e,t){e&1&&(Nc(0,"div",0),tD(1,"Mock Rules Placeholder"),Sc());},encapsulation:2})};var gi=["*"];function ls(n,a){n&1&&NI(0);}var cs=["tabListContainer"],ds=["tabList"],ms=["tabListInner"],ps=["nextPaginator"],us=["previousPaginator"],hs=["content"];function fs(n,a){}var gs=["tabBodyWrapper"],_s=["tabHeader"];function bs(n,a){}function ys(n,a){if(n&1&&pp(0,bs,0,0,"ng-template",12),n&2){let e=bI().$implicit;Ip("cdkPortalOutlet",e.templateLabel);}}function vs(n,a){if(n&1&&tD(0),n&2){let e=bI().$implicit;Up(e.textLabel);}}function Cs(n,a){if(n&1){let e=TI();ai$1(0,"div",7,2),Mp("click",function(){let i=cu(e),o=i.$implicit,r=i.$index,l=bI(),p=RI(1);return lu(l._handleClick(o,p,r))})("cdkFocusChange",function(i){let o=cu(e).$index,r=bI();return lu(r._tabFocusChanged(i,o))}),Dp(2,"span",8)(3,"div",9),ai$1(4,"span",10)(5,"span",11),fI(6,ys,1,1,null,12)(7,vs,1,1),Mc()()();}if(n&2){let e=a.$implicit,t=a.$index,i=RI(1),o=bI();qI(e.labelClass),Fp("mdc-tab--active",o.selectedIndex===t),Ip("id",o._getTabLabelId(e,t))("disabled",e.disabled)("fitInkBarToContent",o.fitInkBarToContent),Ep("tabIndex",o._getTabIndex(t))("aria-posinset",t+1)("aria-setsize",o._tabs.length)("aria-controls",o._getTabContentId(t))("aria-selected",o.selectedIndex===t)("aria-label",e.ariaLabel||null)("aria-labelledby",!e.ariaLabel&&e.ariaLabelledby?e.ariaLabelledby:null),By(3),Ip("matRippleTrigger",i)("matRippleDisabled",e.disabled||o.disableRipple),By(3),pI(e.templateLabel?6:7);}}function xs(n,a){n&1&&NI(0);}function ws(n,a){if(n&1){let e=TI();ai$1(0,"mat-tab-body",13),Mp("_onCentered",function(){cu(e);let i=bI();return lu(i._removeTabBodyWrapperHeight())})("_onCentering",function(i){cu(e);let o=bI();return lu(o._setTabBodyWrapperHeight(i))})("_beforeCentering",function(i){cu(e);let o=bI();return lu(o._bodyCentered(i))}),Mc();}if(n&2){let e=a.$implicit,t=a.$index,i=bI();qI(e.bodyClass),Ip("id",i._getTabContentId(t))("content",e.content)("position",e.position)("animationDuration",i._bodyAnimationDuration)("preserveContent",i.preserveContent),Ep("tabindex",i.contentTabIndex!=null&&i.selectedIndex===t?i.contentTabIndex:null)("aria-labelledby",i._getTabLabelId(e,t))("aria-hidden",i.selectedIndex!==t);}}var Ds=new x("MatTabContent"),ks=(()=>{class n{template=C(nr$1);static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","matTabContent",""]],features:[lD([{provide:Ds,useExisting:n}])]})}return n})(),Ms=new x("MatTabLabel"),io=new x("MAT_TAB"),_i=(()=>{class n extends Hi{_closestTab=C(io,{optional:true});static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","mat-tab-label",""],["","matTabLabel",""]],features:[lD([{provide:Ms,useExisting:n}]),dp]})}return n})(),ao=new x("MAT_TAB_GROUP"),bi=(()=>{class n{_viewContainerRef=C(Di);_closestTabGroup=C(ao,{optional:true});disabled=false;get templateLabel(){return this._templateLabel}set templateLabel(e){this._setTemplateLabelInput(e);}_templateLabel;_explicitContent=void 0;_implicitContent;textLabel="";ariaLabel;ariaLabelledby;labelClass;bodyClass;id=null;_contentPortal=null;get content(){return this._contentPortal}_stateChanges=new X;position=null;origin=null;isActive=false;constructor(){C(q$1).load(ri$1);}ngOnChanges(e){(e.hasOwnProperty("textLabel")||e.hasOwnProperty("disabled"))&&this._stateChanges.next();}ngOnDestroy(){this._stateChanges.complete();}ngOnInit(){this._contentPortal=new G(this._explicitContent||this._implicitContent,this._viewContainerRef);}_setTemplateLabelInput(e){e&&e._closestTab===this&&(this._templateLabel=e);}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["mat-tab"]],contentQueries:function(t,i,o){if(t&1&&xp(o,_i,5)(o,ks,7,nr$1),t&2){let r;xI(r=AI())&&(i.templateLabel=r.first),xI(r=AI())&&(i._explicitContent=r.first);}},viewQuery:function(t,i){if(t&1&&Ap(nr$1,7),t&2){let o;xI(o=AI())&&(i._implicitContent=o.first);}},hostAttrs:["hidden",""],hostVars:1,hostBindings:function(t,i){t&2&&Ep("id",null);},inputs:{disabled:[2,"disabled","disabled",mF],textLabel:[0,"label","textLabel"],ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],labelClass:"labelClass",bodyClass:"bodyClass",id:"id"},exportAs:["matTab"],features:[lD([{provide:io,useExisting:n}]),pm],ngContentSelectors:gi,decls:1,vars:0,template:function(t,i){t&1&&(MI(),hp(0,ls,1,0,"ng-template"));},encapsulation:2,changeDetection:1})}return n})(),mi="mdc-tab-indicator--active",eo="mdc-tab-indicator--no-transition",ui=class{_items;_currentItem;constructor(a){this._items=a;}hide(){this._items.forEach(a=>a.deactivateInkBar()),this._currentItem=void 0;}alignToElement(a){let e=this._items.find(i=>i.elementRef.nativeElement===a),t=this._currentItem;if(e!==t&&(t?.deactivateInkBar(),e)){let i=t?.elementRef.nativeElement.getBoundingClientRect?.();e.activateInkBar(i),this._currentItem=e;}}},Ss=(()=>{class n{_elementRef=C(cr$1);_inkBarElement=null;_inkBarContentElement=null;_fitToContent=false;get fitInkBarToContent(){return this._fitToContent}set fitInkBarToContent(e){this._fitToContent!==e&&(this._fitToContent=e,this._inkBarElement&&this._appendInkBarElement());}activateInkBar(e){let t=this._elementRef.nativeElement;if(!e||!t.getBoundingClientRect||!this._inkBarContentElement){t.classList.add(mi);return}let i=t.getBoundingClientRect(),o=e.width/i.width,r=e.left-i.left;t.classList.add(eo),this._inkBarContentElement.style.setProperty("transform",`translateX(${r}px) scaleX(${o})`),t.getBoundingClientRect(),t.classList.remove(eo),t.classList.add(mi),this._inkBarContentElement.style.setProperty("transform","");}deactivateInkBar(){this._elementRef.nativeElement.classList.remove(mi);}ngOnInit(){this._createInkBarElement();}ngOnDestroy(){this._inkBarElement?.remove(),this._inkBarElement=this._inkBarContentElement=null;}_createInkBarElement(){let e=this._elementRef.nativeElement.ownerDocument||document,t=this._inkBarElement=e.createElement("span"),i=this._inkBarContentElement=e.createElement("span");t.className="mdc-tab-indicator",i.className="mdc-tab-indicator__content mdc-tab-indicator__content--underline",t.appendChild(this._inkBarContentElement),this._appendInkBarElement();}_appendInkBarElement(){this._inkBarElement;let e=this._fitToContent?this._elementRef.nativeElement.querySelector(".mdc-tab__content"):this._elementRef.nativeElement;e.appendChild(this._inkBarElement);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,inputs:{fitInkBarToContent:[2,"fitInkBarToContent","fitInkBarToContent",mF]}})}return n})();var oo=(()=>{class n extends Ss{elementRef=C(cr$1);disabled=false;focus(){this.elementRef.nativeElement.focus();}getOffsetLeft(){return this.elementRef.nativeElement.offsetLeft}getOffsetWidth(){return this.elementRef.nativeElement.offsetWidth}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","matTabLabelWrapper",""]],hostVars:3,hostBindings:function(t,i){t&2&&(Ep("aria-disabled",!!i.disabled),Fp("mat-mdc-tab-disabled",i.disabled));},inputs:{disabled:[2,"disabled","disabled",mF]},features:[dp]})}return n})(),to={passive:true},Rs=650,Ts=100,Es=(()=>{class n{_elementRef=C(cr$1);_changeDetectorRef=C(hF);_viewportRuler=C(H);_dir=C(zo$2,{optional:true});_ngZone=C(Ce);_platform=C(R);_sharedResizeObserver=C(Ve$1);_injector=C(fe);_renderer=C(zv);_animationsDisabled=xe$1();_eventCleanups;_scrollDistance=0;_selectedIndexChanged=false;_destroyed=new X;_showPaginationControls=false;_disableScrollAfter=true;_disableScrollBefore=true;_tabLabelCount;_scrollDistanceChanged=false;_keyManager;_currentTextContent;_stopScrolling=new X;disablePagination=false;get selectedIndex(){return this._selectedIndex}set selectedIndex(e){let t=isNaN(e)?0:e;this._selectedIndex!=t&&(this._selectedIndexChanged=true,this._selectedIndex=t,this._keyManager&&this._keyManager.updateActiveItem(t));}_selectedIndex=0;selectFocusedIndex=new Le;indexFocused=new Le;constructor(){this._eventCleanups=this._ngZone.runOutsideAngular(()=>[this._renderer.listen(this._elementRef.nativeElement,"mouseleave",()=>this._stopInterval())]);}ngAfterViewInit(){this._eventCleanups.push(this._renderer.listen(this._previousPaginator.nativeElement,"touchstart",()=>this._handlePaginatorPress("before"),to),this._renderer.listen(this._nextPaginator.nativeElement,"touchstart",()=>this._handlePaginatorPress("after"),to));}ngAfterContentInit(){let e=this._dir?this._dir.change:Vh("ltr"),t=this._sharedResizeObserver.observe(this._elementRef.nativeElement).pipe(ng(32),gg(this._destroyed)),i=this._viewportRuler.change(150).pipe(gg(this._destroyed)),o=()=>{this.updatePagination(),this._alignInkBarToSelectedTab();};this._keyManager=new wn$1(this._items).withHorizontalOrientation(this._getLayoutDirection()).withHomeAndEnd().withWrap().skipPredicate(()=>false),this._keyManager.updateActiveItem(Math.max(this._selectedIndex,0)),Wy(o,{injector:this._injector}),Xh(e,i,t,this._items.changes,this._itemsResized()).pipe(gg(this._destroyed)).subscribe(()=>{this._ngZone.run(()=>{Promise.resolve().then(()=>{this._scrollDistance=Math.max(0,Math.min(this._getMaxScrollDistance(),this._scrollDistance)),o();});}),this._keyManager?.withHorizontalOrientation(this._getLayoutDirection());}),this._keyManager.change.subscribe(r=>{this.indexFocused.emit(r),this._setTabFocus(r);});}_itemsResized(){return typeof ResizeObserver!="function"?yt$1:this._items.changes.pipe(pg(this._items),hg(e=>new M(t=>this._ngZone.runOutsideAngular(()=>{let i=new ResizeObserver(o=>t.next(o));return e.forEach(o=>i.observe(o.elementRef.nativeElement)),()=>{i.disconnect();}}))),fg(1),Rn$1(e=>e.some(t=>t.contentRect.width>0&&t.contentRect.height>0)))}ngAfterContentChecked(){this._tabLabelCount!=this._items.length&&(this.updatePagination(),this._tabLabelCount=this._items.length,this._changeDetectorRef.markForCheck()),this._selectedIndexChanged&&(this._scrollToLabel(this._selectedIndex),this._checkScrollingControls(),this._alignInkBarToSelectedTab(),this._selectedIndexChanged=false,this._changeDetectorRef.markForCheck()),this._scrollDistanceChanged&&(this._updateTabScrollPosition(),this._scrollDistanceChanged=false,this._changeDetectorRef.markForCheck());}ngOnDestroy(){this._eventCleanups.forEach(e=>e()),this._keyManager?.destroy(),this._destroyed.next(),this._destroyed.complete(),this._stopScrolling.complete();}_handleKeydown(e){if(!Wr$1(e))switch(e.keyCode){case 13:case 32:if(this.focusIndex!==this.selectedIndex){let t=this._items.get(this.focusIndex);t&&!t.disabled&&(this.selectFocusedIndex.emit(this.focusIndex),this._itemSelected(e));}break;default:this._keyManager?.onKeydown(e);}}_onContentChanges(){let e=this._elementRef.nativeElement.textContent;e!==this._currentTextContent&&(this._currentTextContent=e||"",this._ngZone.run(()=>{this.updatePagination(),this._alignInkBarToSelectedTab(),this._changeDetectorRef.markForCheck();}));}updatePagination(){this._checkPaginationEnabled(),this._checkScrollingControls(),this._updateTabScrollPosition();}get focusIndex(){return this._keyManager?this._keyManager.activeItemIndex:0}set focusIndex(e){!this._isValidIndex(e)||this.focusIndex===e||!this._keyManager||this._keyManager.setActiveItem(e);}_isValidIndex(e){return this._items?!!this._items.toArray()[e]:true}_setTabFocus(e){if(this._showPaginationControls&&this._scrollToLabel(e),this._items&&this._items.length){this._items.toArray()[e].focus();let t=this._tabListContainer.nativeElement;this._getLayoutDirection()=="ltr"?t.scrollLeft=0:t.scrollLeft=t.scrollWidth-t.offsetWidth;}}_getLayoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_updateTabScrollPosition(){if(this.disablePagination)return;let e=this.scrollDistance,t=this._getLayoutDirection()==="ltr"?-e:e;this._tabList.nativeElement.style.transform=`translateX(${Math.round(t)}px)`,(this._platform.TRIDENT||this._platform.EDGE)&&(this._tabListContainer.nativeElement.scrollLeft=0);}get scrollDistance(){return this._scrollDistance}set scrollDistance(e){this._scrollTo(e);}_scrollHeader(e){let t=this._tabListContainer.nativeElement.offsetWidth,i=(e=="before"?-1:1)*t/3;return this._scrollTo(this._scrollDistance+i)}_handlePaginatorClick(e){this._stopInterval(),this._scrollHeader(e);}_scrollToLabel(e){if(this.disablePagination)return;let t=this._items?this._items.toArray()[e]:null;if(!t)return;let i=this._tabListContainer.nativeElement.offsetWidth,{offsetLeft:o,offsetWidth:r}=t.elementRef.nativeElement,l,p;this._getLayoutDirection()=="ltr"?(l=o,p=l+r):(p=this._tabListInner.nativeElement.offsetWidth-o,l=p-r);let h=this.scrollDistance,C=this.scrollDistance+i;l<h?this.scrollDistance-=h-l:p>C&&(this.scrollDistance+=Math.min(p-C,l-h));}_checkPaginationEnabled(){if(this.disablePagination)this._showPaginationControls=false;else {let e=this._tabListInner.nativeElement.scrollWidth,t=this._elementRef.nativeElement.offsetWidth,i=e-t>=5;i||(this.scrollDistance=0),i!==this._showPaginationControls&&(this._showPaginationControls=i,this._changeDetectorRef.markForCheck());}}_checkScrollingControls(){this.disablePagination?this._disableScrollAfter=this._disableScrollBefore=true:(this._disableScrollBefore=this.scrollDistance==0,this._disableScrollAfter=this.scrollDistance==this._getMaxScrollDistance(),this._changeDetectorRef.markForCheck());}_getMaxScrollDistance(){let e=this._tabListInner.nativeElement.scrollWidth,t=this._tabListContainer.nativeElement.offsetWidth;return e-t||0}_alignInkBarToSelectedTab(){let e=this._items&&this._items.length?this._items.toArray()[this.selectedIndex]:null,t=e?e.elementRef.nativeElement:null;t?this._inkBar.alignToElement(t):this._inkBar.hide();}_stopInterval(){this._stopScrolling.next();}_handlePaginatorPress(e,t){t&&t.button!=null&&t.button!==0||(this._stopInterval(),kn$2(Rs,Ts).pipe(gg(Xh(this._stopScrolling,this._destroyed))).subscribe(()=>{let{maxScrollDistance:i,distance:o}=this._scrollHeader(e);(o===0||o>=i)&&this._stopInterval();}));}_scrollTo(e){if(this.disablePagination)return {maxScrollDistance:0,distance:0};let t=this._getMaxScrollDistance();return this._scrollDistance=Math.max(0,Math.min(t,e)),this._scrollDistanceChanged=true,this._checkScrollingControls(),{maxScrollDistance:t,distance:this._scrollDistance}}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,inputs:{disablePagination:[2,"disablePagination","disablePagination",mF],selectedIndex:[2,"selectedIndex","selectedIndex",yF]},outputs:{selectFocusedIndex:"selectFocusedIndex",indexFocused:"indexFocused"}})}return n})(),Ps=(()=>{class n extends Es{_items;_tabListContainer;_tabList;_tabListInner;_nextPaginator;_previousPaginator;_inkBar;ariaLabel;ariaLabelledby;disableRipple=false;ngAfterContentInit(){this._inkBar=new ui(this._items),super.ngAfterContentInit();}_itemSelected(e){e.preventDefault();}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275cmp=HE({type:n,selectors:[["mat-tab-header"]],contentQueries:function(t,i,o){if(t&1&&xp(o,oo,4),t&2){let r;xI(r=AI())&&(i._items=r);}},viewQuery:function(t,i){if(t&1&&Ap(cs,7)(ds,7)(ms,7)(ps,5)(us,5),t&2){let o;xI(o=AI())&&(i._tabListContainer=o.first),xI(o=AI())&&(i._tabList=o.first),xI(o=AI())&&(i._tabListInner=o.first),xI(o=AI())&&(i._nextPaginator=o.first),xI(o=AI())&&(i._previousPaginator=o.first);}},hostAttrs:[1,"mat-mdc-tab-header"],hostVars:4,hostBindings:function(t,i){t&2&&Fp("mat-mdc-tab-header-pagination-controls-enabled",i._showPaginationControls)("mat-mdc-tab-header-rtl",i._getLayoutDirection()=="rtl");},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],disableRipple:[2,"disableRipple","disableRipple",mF]},features:[dp],ngContentSelectors:gi,decls:13,vars:10,consts:[["previousPaginator",""],["tabListContainer",""],["tabList",""],["tabListInner",""],["nextPaginator",""],["mat-ripple","",1,"mat-mdc-tab-header-pagination","mat-mdc-tab-header-pagination-before",3,"click","mousedown","touchend","matRippleDisabled"],[1,"mat-mdc-tab-header-pagination-chevron"],[1,"mat-mdc-tab-label-container",3,"keydown"],["role","tablist",1,"mat-mdc-tab-list",3,"cdkObserveContent"],[1,"mat-mdc-tab-labels"],["mat-ripple","",1,"mat-mdc-tab-header-pagination","mat-mdc-tab-header-pagination-after",3,"mousedown","click","touchend","matRippleDisabled"]],template:function(t,i){t&1&&(MI(),ai$1(0,"div",5,0),Mp("click",function(){return i._handlePaginatorClick("before")})("mousedown",function(r){return i._handlePaginatorPress("before",r)})("touchend",function(){return i._stopInterval()}),Dp(2,"div",6),Mc(),ai$1(3,"div",7,1),Mp("keydown",function(r){return i._handleKeydown(r)}),ai$1(5,"div",8,2),Mp("cdkObserveContent",function(){return i._onContentChanges()}),ai$1(7,"div",9,3),NI(9),Mc()()(),ai$1(10,"div",10,4),Mp("mousedown",function(r){return i._handlePaginatorPress("after",r)})("click",function(){return i._handlePaginatorClick("after")})("touchend",function(){return i._stopInterval()}),Dp(12,"div",6),Mc()),t&2&&(Fp("mat-mdc-tab-header-pagination-disabled",i._disableScrollBefore),Ip("matRippleDisabled",i._disableScrollBefore||i.disableRipple),By(3),Fp("_mat-animation-noopable",i._animationsDisabled),By(2),Ep("aria-label",i.ariaLabel||null)("aria-labelledby",i.ariaLabelledby||null),By(5),Fp("mat-mdc-tab-header-pagination-disabled",i._disableScrollAfter),Ip("matRippleDisabled",i._disableScrollAfter||i.disableRipple));},dependencies:[Hc,al],styles:[`.mat-mdc-tab-header {
  display: flex;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.mdc-tab-indicator .mdc-tab-indicator__content {
  transition-duration: var(--mat-tab-header-animation-duration, 250ms);
}

.mat-mdc-tab-header-pagination {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: none;
  justify-content: center;
  align-items: center;
  min-width: 32px;
  cursor: pointer;
  z-index: 2;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  box-sizing: content-box;
  outline: 0;
}
.mat-mdc-tab-header-pagination::-moz-focus-inner {
  border: 0;
}
.mat-mdc-tab-header-pagination .mat-ripple-element {
  opacity: 0.12;
  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-header-pagination-controls-enabled .mat-mdc-tab-header-pagination {
  display: flex;
}

.mat-mdc-tab-header-pagination-before,
.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after {
  padding-left: 4px;
}
.mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {
  transform: rotate(-135deg);
}

.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before,
.mat-mdc-tab-header-pagination-after {
  padding-right: 4px;
}
.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {
  transform: rotate(45deg);
}

.mat-mdc-tab-header-pagination-chevron {
  border-style: solid;
  border-width: 2px 2px 0 0;
  height: 8px;
  width: 8px;
  border-color: var(--mat-tab-pagination-icon-color, var(--mat-sys-on-surface));
}

.mat-mdc-tab-header-pagination-disabled {
  box-shadow: none;
  cursor: default;
  pointer-events: none;
}
.mat-mdc-tab-header-pagination-disabled .mat-mdc-tab-header-pagination-chevron {
  opacity: 0.4;
}

.mat-mdc-tab-list {
  flex-grow: 1;
  position: relative;
  transition: transform 500ms cubic-bezier(0.35, 0, 0.25, 1);
}
._mat-animation-noopable .mat-mdc-tab-list {
  transition: none;
}

.mat-mdc-tab-label-container {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  z-index: 1;
  border-bottom-style: solid;
  border-bottom-width: var(--mat-tab-divider-height, 1px);
  border-bottom-color: var(--mat-tab-divider-color, var(--mat-sys-surface-variant));
}
.mat-mdc-tab-group-inverted-header .mat-mdc-tab-label-container {
  border-bottom: none;
  border-top-style: solid;
  border-top-width: var(--mat-tab-divider-height, 1px);
  border-top-color: var(--mat-tab-divider-color, var(--mat-sys-surface-variant));
}

.mat-mdc-tab-labels {
  display: flex;
  flex: 1 0 auto;
}
[mat-align-tabs=center] > .mat-mdc-tab-header .mat-mdc-tab-labels {
  justify-content: center;
}
[mat-align-tabs=end] > .mat-mdc-tab-header .mat-mdc-tab-labels {
  justify-content: flex-end;
}
.cdk-drop-list .mat-mdc-tab-labels, .mat-mdc-tab-labels.cdk-drop-list {
  min-height: var(--mat-tab-container-height, 48px);
}

.mat-mdc-tab::before {
  margin: 5px;
}
@media (forced-colors: active) {
  .mat-mdc-tab[aria-disabled=true] {
    color: GrayText;
  }
}
`],encapsulation:2,changeDetection:1})}return n})(),Os=new x("MAT_TABS_CONFIG"),no=(()=>{class n extends Xi{_host=C(hi);_ngZone=C(Ce);_centeringSub=j.EMPTY;_leavingSub=j.EMPTY;ngOnInit(){super.ngOnInit(),this._centeringSub=this._host._beforeCentering.pipe(pg(this._host._isCenterPosition())).subscribe(e=>{this._host._content&&e&&!this.hasAttached()&&this._ngZone.run(()=>{Promise.resolve().then(),this.attach(this._host._content);});}),this._leavingSub=this._host._afterLeavingCenter.subscribe(()=>{this._host.preserveContent||this._ngZone.run(()=>this.detach());});}ngOnDestroy(){super.ngOnDestroy(),this._centeringSub.unsubscribe(),this._leavingSub.unsubscribe();}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Am(n)))(i||n)}})();static \u0275dir=WE({type:n,selectors:[["","matTabBodyHost",""]],features:[dp]})}return n})(),hi=(()=>{class n{_elementRef=C(cr$1);_dir=C(zo$2,{optional:true});_ngZone=C(Ce);_injector=C(fe);_renderer=C(zv);_diAnimationsDisabled=xe$1();_eventCleanups;_initialized=false;_fallbackTimer;_positionIndex;_dirChangeSubscription=j.EMPTY;_position;_previousPosition;_onCentering=new Le;_beforeCentering=new Le;_afterLeavingCenter=new Le;_onCentered=new Le(true);_portalHost;_contentElement;_content;animationDuration="500ms";preserveContent=false;set position(e){this._positionIndex=e,this._computePositionAnimationState();}constructor(){if(this._dir){let e=C(hF);this._dirChangeSubscription=this._dir.change.subscribe(t=>{this._computePositionAnimationState(t),e.markForCheck();});}}ngOnInit(){this._bindTransitionEvents(),this._position==="center"&&(this._setActiveClass(true),Wy(()=>this._onCentering.emit(this._elementRef.nativeElement.clientHeight),{injector:this._injector})),this._initialized=true;}ngOnDestroy(){clearTimeout(this._fallbackTimer),this._eventCleanups?.forEach(e=>e()),this._dirChangeSubscription.unsubscribe();}_bindTransitionEvents(){this._ngZone.runOutsideAngular(()=>{let e=this._elementRef.nativeElement,t=i=>{i.target===this._contentElement?.nativeElement&&(this._elementRef.nativeElement.classList.remove("mat-tab-body-animating"),i.type==="transitionend"&&this._transitionDone());};this._eventCleanups=[this._renderer.listen(e,"transitionstart",i=>{i.target===this._contentElement?.nativeElement&&(this._elementRef.nativeElement.classList.add("mat-tab-body-animating"),this._transitionStarted());}),this._renderer.listen(e,"transitionend",t),this._renderer.listen(e,"transitioncancel",t)];});}_transitionStarted(){clearTimeout(this._fallbackTimer);let e=this._position==="center";this._beforeCentering.emit(e),e&&this._onCentering.emit(this._elementRef.nativeElement.clientHeight);}_transitionDone(){this._position==="center"?this._onCentered.emit():this._previousPosition==="center"&&this._afterLeavingCenter.emit();}_setActiveClass(e){this._elementRef.nativeElement.classList.toggle("mat-mdc-tab-body-active",e);}_getLayoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_isCenterPosition(){return this._positionIndex===0}_computePositionAnimationState(e=this._getLayoutDirection()){this._previousPosition=this._position,this._positionIndex<0?this._position=e=="ltr"?"left":"right":this._positionIndex>0?this._position=e=="ltr"?"right":"left":this._position="center",this._animationsDisabled()?this._simulateTransitionEvents():this._initialized&&(this._position==="center"||this._previousPosition==="center")&&(clearTimeout(this._fallbackTimer),this._fallbackTimer=this._ngZone.runOutsideAngular(()=>setTimeout(()=>this._simulateTransitionEvents(),100)));}_simulateTransitionEvents(){this._transitionStarted(),Wy(()=>this._transitionDone(),{injector:this._injector});}_animationsDisabled(){return this._diAnimationsDisabled||this.animationDuration==="0ms"||this.animationDuration==="0s"}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["mat-tab-body"]],viewQuery:function(t,i){if(t&1&&Ap(no,5)(hs,5),t&2){let o;xI(o=AI())&&(i._portalHost=o.first),xI(o=AI())&&(i._contentElement=o.first);}},hostAttrs:[1,"mat-mdc-tab-body"],hostVars:1,hostBindings:function(t,i){t&2&&Ep("inert",i._position==="center"?null:"");},inputs:{_content:[0,"content","_content"],animationDuration:"animationDuration",preserveContent:"preserveContent",position:"position"},outputs:{_onCentering:"_onCentering",_beforeCentering:"_beforeCentering",_onCentered:"_onCentered"},decls:3,vars:6,consts:[["content",""],["cdkScrollable","",1,"mat-mdc-tab-body-content"],["matTabBodyHost",""]],template:function(t,i){t&1&&(ai$1(0,"div",1,0),pp(2,fs,0,0,"ng-template",2),Mc()),t&2&&Fp("mat-tab-body-content-left",i._position==="left")("mat-tab-body-content-right",i._position==="right")("mat-tab-body-content-can-animate",i._position==="center"||i._previousPosition==="center");},dependencies:[no,Ve],styles:[`.mat-mdc-tab-body {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  display: block;
  overflow: hidden;
  outline: 0;
  flex-basis: 100%;
}
.mat-mdc-tab-body.mat-mdc-tab-body-active {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 1;
  flex-grow: 1;
}
.mat-mdc-tab-group.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body.mat-mdc-tab-body-active {
  overflow-y: hidden;
}

.mat-mdc-tab-body-content {
  height: 100%;
  overflow: auto;
  transform: none;
  visibility: hidden;
}
.mat-tab-body-animating > .mat-mdc-tab-body-content, .mat-mdc-tab-body-active > .mat-mdc-tab-body-content {
  visibility: visible;
}
.mat-tab-body-animating > .mat-mdc-tab-body-content {
  min-height: 1px;
}
.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body-content {
  overflow: hidden;
}

.mat-tab-body-content-can-animate {
  transition: transform var(--mat-tab-body-animation-duration) 1ms cubic-bezier(0.35, 0, 0.25, 1);
}
.mat-mdc-tab-body-wrapper._mat-animation-noopable .mat-tab-body-content-can-animate {
  transition: none;
}

.mat-tab-body-content-left {
  transform: translate3d(-100%, 0, 0);
}

.mat-tab-body-content-right {
  transform: translate3d(100%, 0, 0);
}
`],encapsulation:2,changeDetection:1})}return n})(),ro=(()=>{class n{_elementRef=C(cr$1);_changeDetectorRef=C(hF);_ngZone=C(Ce);_tabsSubscription=j.EMPTY;_tabLabelSubscription=j.EMPTY;_tabBodySubscription=j.EMPTY;_diAnimationsDisabled=xe$1();_bodyAnimationDuration;_headerAnimationDuration;_allTabs;_tabBodies;_tabBodyWrapper;_tabHeader;_tabs=new zo$1;_indexToSelect=0;_lastFocusedTabIndex=null;_tabBodyWrapperHeight=0;color;get fitInkBarToContent(){return this._fitInkBarToContent}set fitInkBarToContent(e){this._fitInkBarToContent=e,this._changeDetectorRef.markForCheck();}_fitInkBarToContent=false;stretchTabs=true;alignTabs=null;dynamicHeight=false;get selectedIndex(){return this._selectedIndex}set selectedIndex(e){this._indexToSelect=isNaN(e)?null:e;}_selectedIndex=null;headerPosition="above";get animationDuration(){return this._animationDuration}set animationDuration(e){this._animationDuration=e,e&&typeof e=="object"?(this._bodyAnimationDuration=pi(e.body),this._headerAnimationDuration=pi(e.header)):this._headerAnimationDuration=this._bodyAnimationDuration=pi(e);}_animationDuration;get contentTabIndex(){return this._contentTabIndex}set contentTabIndex(e){this._contentTabIndex=isNaN(e)?null:e;}_contentTabIndex=null;disablePagination=false;disableRipple=false;preserveContent=false;get backgroundColor(){return this._backgroundColor}set backgroundColor(e){let t=this._elementRef.nativeElement.classList;t.remove("mat-tabs-with-background",`mat-background-${this.backgroundColor}`),e&&t.add("mat-tabs-with-background",`mat-background-${e}`),this._backgroundColor=e;}_backgroundColor;ariaLabel;ariaLabelledby;selectedIndexChange=new Le;focusChange=new Le;animationDone=new Le;selectedTabChange=new Le(true);_groupId;_isServer=!C(R).isBrowser;constructor(){let e=C(Os,{optional:true});this._groupId=C(An$1).getId("mat-tab-group-"),this.animationDuration=e&&e.animationDuration?e.animationDuration:"500ms",this.disablePagination=e&&e.disablePagination!=null?e.disablePagination:false,this.dynamicHeight=e&&e.dynamicHeight!=null?e.dynamicHeight:false,e?.contentTabIndex!=null&&(this.contentTabIndex=e.contentTabIndex),this.preserveContent=!!e?.preserveContent,this.fitInkBarToContent=e&&e.fitInkBarToContent!=null?e.fitInkBarToContent:false,this.stretchTabs=e&&e.stretchTabs!=null?e.stretchTabs:true,this.alignTabs=e&&e.alignTabs!=null?e.alignTabs:null;}ngAfterContentChecked(){let e=this._indexToSelect=this._clampTabIndex(this._indexToSelect);if(this._selectedIndex!=e){let t=this._selectedIndex==null;if(!t){this.selectedTabChange.emit(this._createChangeEvent(e));let i=this._tabBodyWrapper.nativeElement;i.style.minHeight=i.clientHeight+"px";}Promise.resolve().then(()=>{this._tabs.forEach((i,o)=>i.isActive=o===e),t||(this.selectedIndexChange.emit(e),this._tabBodyWrapper.nativeElement.style.minHeight="");});}this._tabs.forEach((t,i)=>{t.position=i-e,this._selectedIndex!=null&&t.position==0&&!t.origin&&(t.origin=e-this._selectedIndex);}),this._selectedIndex!==e&&(this._selectedIndex=e,this._lastFocusedTabIndex=null,this._changeDetectorRef.markForCheck());}ngAfterContentInit(){this._subscribeToAllTabChanges(),this._subscribeToTabLabels(),this._tabsSubscription=this._tabs.changes.subscribe(()=>{let e=this._clampTabIndex(this._indexToSelect);if(e===this._selectedIndex){let t=this._tabs.toArray(),i;for(let o=0;o<t.length;o++)if(t[o].isActive){this._indexToSelect=this._selectedIndex=o,this._lastFocusedTabIndex=null,i=t[o];break}!i&&t[e]&&Promise.resolve().then(()=>{t[e].isActive=true,this.selectedTabChange.emit(this._createChangeEvent(e));});}this._changeDetectorRef.markForCheck();});}ngAfterViewInit(){this._tabBodySubscription=this._tabBodies.changes.subscribe(()=>this._bodyCentered(true));}_subscribeToAllTabChanges(){this._allTabs.changes.pipe(pg(this._allTabs)).subscribe(e=>{this._tabs.reset(e.filter(t=>t._closestTabGroup===this||!t._closestTabGroup)),this._tabs.notifyOnChanges();});}ngOnDestroy(){this._tabs.destroy(),this._tabsSubscription.unsubscribe(),this._tabLabelSubscription.unsubscribe(),this._tabBodySubscription.unsubscribe();}realignInkBar(){this._tabHeader&&this._tabHeader._alignInkBarToSelectedTab();}updatePagination(){this._tabHeader&&this._tabHeader.updatePagination();}focusTab(e){let t=this._tabHeader;t&&(t.focusIndex=e);}_focusChanged(e){this._lastFocusedTabIndex=e,this.focusChange.emit(this._createChangeEvent(e));}_createChangeEvent(e){let t=new fi;return t.index=e,this._tabs&&this._tabs.length&&(t.tab=this._tabs.toArray()[e]),t}_subscribeToTabLabels(){this._tabLabelSubscription&&this._tabLabelSubscription.unsubscribe(),this._tabLabelSubscription=Xh(...this._tabs.map(e=>e._stateChanges)).subscribe(()=>this._changeDetectorRef.markForCheck());}_clampTabIndex(e){return Math.min(this._tabs.length-1,Math.max(e||0,0))}_getTabLabelId(e,t){return e.id||`${this._groupId}-label-${t}`}_getTabContentId(e){return `${this._groupId}-content-${e}`}_setTabBodyWrapperHeight(e){if(!this.dynamicHeight||!this._tabBodyWrapperHeight){this._tabBodyWrapperHeight=e;return}let t=this._tabBodyWrapper.nativeElement;t.style.height=this._tabBodyWrapperHeight+"px",this._tabBodyWrapper.nativeElement.offsetHeight&&(t.style.height=e+"px");}_removeTabBodyWrapperHeight(){let e=this._tabBodyWrapper.nativeElement;this._tabBodyWrapperHeight=e.clientHeight,e.style.height="",this._ngZone.run(()=>this.animationDone.emit());}_handleClick(e,t,i){t.focusIndex=i,e.disabled||(this.selectedIndex=i);}_getTabIndex(e){let t=this._lastFocusedTabIndex??this.selectedIndex;return e===t?0:-1}_tabFocusChanged(e,t){e&&e!=="mouse"&&e!=="touch"&&(this._tabHeader.focusIndex=t);}_bodyCentered(e){e&&this._tabBodies?.forEach((t,i)=>t._setActiveClass(i===this._selectedIndex));}_bodyAnimationsDisabled(){return this._diAnimationsDisabled||this._bodyAnimationDuration==="0"||this._bodyAnimationDuration==="0ms"}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["mat-tab-group"]],contentQueries:function(t,i,o){if(t&1&&xp(o,bi,5),t&2){let r;xI(r=AI())&&(i._allTabs=r);}},viewQuery:function(t,i){if(t&1&&Ap(gs,5)(_s,5)(hi,5),t&2){let o;xI(o=AI())&&(i._tabBodyWrapper=o.first),xI(o=AI())&&(i._tabHeader=o.first),xI(o=AI())&&(i._tabBodies=o);}},hostAttrs:[1,"mat-mdc-tab-group"],hostVars:13,hostBindings:function(t,i){t&2&&(Ep("mat-align-tabs",i.alignTabs),qI("mat-"+(i.color||"primary")),Lp("--mat-tab-body-animation-duration",i._bodyAnimationDuration)("--mat-tab-header-animation-duration",i._headerAnimationDuration),Fp("mat-mdc-tab-group-dynamic-height",i.dynamicHeight)("mat-mdc-tab-group-inverted-header",i.headerPosition==="below")("mat-mdc-tab-group-stretch-tabs",i.stretchTabs));},inputs:{color:"color",fitInkBarToContent:[2,"fitInkBarToContent","fitInkBarToContent",mF],stretchTabs:[2,"mat-stretch-tabs","stretchTabs",mF],alignTabs:[0,"mat-align-tabs","alignTabs"],dynamicHeight:[2,"dynamicHeight","dynamicHeight",mF],selectedIndex:[2,"selectedIndex","selectedIndex",yF],headerPosition:"headerPosition",animationDuration:"animationDuration",contentTabIndex:[2,"contentTabIndex","contentTabIndex",yF],disablePagination:[2,"disablePagination","disablePagination",mF],disableRipple:[2,"disableRipple","disableRipple",mF],preserveContent:[2,"preserveContent","preserveContent",mF],backgroundColor:"backgroundColor",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"]},outputs:{selectedIndexChange:"selectedIndexChange",focusChange:"focusChange",animationDone:"animationDone",selectedTabChange:"selectedTabChange"},exportAs:["matTabGroup"],features:[lD([{provide:ao,useExisting:n}])],ngContentSelectors:gi,decls:9,vars:8,consts:[["tabHeader",""],["tabBodyWrapper",""],["tabNode",""],[3,"indexFocused","selectFocusedIndex","selectedIndex","disableRipple","disablePagination","aria-label","aria-labelledby"],["role","tab","matTabLabelWrapper","","cdkMonitorElementFocus","",1,"mdc-tab","mat-mdc-tab","mat-focus-indicator",3,"id","mdc-tab--active","class","disabled","fitInkBarToContent"],[1,"mat-mdc-tab-body-wrapper"],["role","tabpanel",3,"id","class","content","position","animationDuration","preserveContent"],["role","tab","matTabLabelWrapper","","cdkMonitorElementFocus","",1,"mdc-tab","mat-mdc-tab","mat-focus-indicator",3,"click","cdkFocusChange","id","disabled","fitInkBarToContent"],[1,"mdc-tab__ripple"],["mat-ripple","",1,"mat-mdc-tab-ripple",3,"matRippleTrigger","matRippleDisabled"],[1,"mdc-tab__content"],[1,"mdc-tab__text-label"],[3,"cdkPortalOutlet"],["role","tabpanel",3,"_onCentered","_onCentering","_beforeCentering","id","content","position","animationDuration","preserveContent"]],template:function(t,i){t&1&&(MI(),ai$1(0,"mat-tab-header",3,0),Mp("indexFocused",function(r){return i._focusChanged(r)})("selectFocusedIndex",function(r){return i.selectedIndex=r}),mI(2,Cs,8,17,"div",4,gI),Mc(),fI(4,xs,1,0),ai$1(5,"div",5,1),mI(7,ws,1,10,"mat-tab-body",6,gI),Mc()),t&2&&(Ip("selectedIndex",i.selectedIndex||0)("disableRipple",i.disableRipple)("disablePagination",i.disablePagination),vp("aria-label",i.ariaLabel)("aria-labelledby",i.ariaLabelledby),By(2),yI(i._tabs),By(2),pI(i._isServer?4:-1),By(),Fp("_mat-animation-noopable",i._bodyAnimationsDisabled()),By(2),yI(i._tabs));},dependencies:[Ps,oo,so$1,Hc,Xi,hi],styles:[`.mdc-tab {
  min-width: 90px;
  padding: 0 24px;
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  box-sizing: border-box;
  border: none;
  outline: none;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  z-index: 1;
  touch-action: manipulation;
}

.mdc-tab__content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: inherit;
  pointer-events: none;
}

.mdc-tab__text-label {
  transition: 150ms color linear;
  display: inline-block;
  line-height: 1;
  z-index: 2;
}

.mdc-tab--active .mdc-tab__text-label {
  transition-delay: 100ms;
}

._mat-animation-noopable .mdc-tab__text-label {
  transition: none;
}

.mdc-tab-indicator {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  justify-content: center;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.mdc-tab-indicator__content {
  transition: var(--mat-tab-header-animation-duration, 250ms) transform cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left;
  opacity: 0;
}

.mdc-tab-indicator__content--underline {
  align-self: flex-end;
  box-sizing: border-box;
  width: 100%;
  border-top-style: solid;
}

.mdc-tab-indicator--active .mdc-tab-indicator__content {
  opacity: 1;
}

._mat-animation-noopable .mdc-tab-indicator__content, .mdc-tab-indicator--no-transition .mdc-tab-indicator__content {
  transition: none;
}

.mat-mdc-tab-ripple.mat-mdc-tab-ripple {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  pointer-events: none;
}

.mat-mdc-tab {
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-decoration: none;
  background: none;
  height: var(--mat-tab-container-height, 48px);
  font-family: var(--mat-tab-label-text-font, var(--mat-sys-title-small-font));
  font-size: var(--mat-tab-label-text-size, var(--mat-sys-title-small-size));
  letter-spacing: var(--mat-tab-label-text-tracking, var(--mat-sys-title-small-tracking));
  line-height: var(--mat-tab-label-text-line-height, var(--mat-sys-title-small-line-height));
  font-weight: var(--mat-tab-label-text-weight, var(--mat-sys-title-small-weight));
}
.mat-mdc-tab.mdc-tab {
  flex-grow: 0;
}
.mat-mdc-tab .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-active-indicator-color, var(--mat-sys-primary));
  border-top-width: var(--mat-tab-active-indicator-height, 2px);
  border-radius: var(--mat-tab-active-indicator-shape, 0);
}
.mat-mdc-tab:hover .mdc-tab__text-label {
  color: var(--mat-tab-inactive-hover-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab:focus .mdc-tab__text-label {
  color: var(--mat-tab-inactive-focus-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
  color: var(--mat-tab-active-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab.mdc-tab--active .mdc-tab__ripple::before,
.mat-mdc-tab.mdc-tab--active .mat-ripple-element {
  background-color: var(--mat-tab-active-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab.mdc-tab--active:hover .mdc-tab__text-label {
  color: var(--mat-tab-active-hover-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab.mdc-tab--active:hover .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-active-hover-indicator-color, var(--mat-sys-primary));
}
.mat-mdc-tab.mdc-tab--active:focus .mdc-tab__text-label {
  color: var(--mat-tab-active-focus-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab.mdc-tab--active:focus .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-active-focus-indicator-color, var(--mat-sys-primary));
}
.mat-mdc-tab.mat-mdc-tab-disabled {
  opacity: 0.4;
  pointer-events: none;
}
.mat-mdc-tab.mat-mdc-tab-disabled .mdc-tab__content {
  pointer-events: none;
}
.mat-mdc-tab.mat-mdc-tab-disabled .mdc-tab__ripple::before,
.mat-mdc-tab.mat-mdc-tab-disabled .mat-ripple-element {
  background-color: var(--mat-tab-disabled-ripple-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-tab .mdc-tab__ripple::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  pointer-events: none;
  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab .mdc-tab__text-label {
  color: var(--mat-tab-inactive-label-text-color, var(--mat-sys-on-surface));
  display: inline-flex;
  align-items: center;
}
.mat-mdc-tab .mdc-tab__content {
  position: relative;
  pointer-events: auto;
}
.mat-mdc-tab:hover .mdc-tab__ripple::before {
  opacity: 0.04;
}
.mat-mdc-tab.cdk-program-focused .mdc-tab__ripple::before, .mat-mdc-tab.cdk-keyboard-focused .mdc-tab__ripple::before {
  opacity: 0.12;
}
.mat-mdc-tab .mat-ripple-element {
  opacity: 0.12;
  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-group.mat-mdc-tab-group-stretch-tabs > .mat-mdc-tab-header .mat-mdc-tab {
  flex-grow: 1;
}

.mat-mdc-tab-group {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination {
  background-color: var(--mat-tab-background-color);
}
.mat-mdc-tab-group.mat-tabs-with-background.mat-primary > .mat-mdc-tab-header .mat-mdc-tab .mdc-tab__text-label {
  color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background.mat-primary > .mat-mdc-tab-header .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-header .mat-mdc-tab:not(.mdc-tab--active) .mdc-tab__text-label {
  color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-header .mat-mdc-tab:not(.mdc-tab--active) .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-focus-indicator::before, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-focus-indicator::before {
  border-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-ripple-element, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mdc-tab__ripple::before, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-ripple-element, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mdc-tab__ripple::before {
  background-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron {
  color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header {
  flex-direction: column-reverse;
}
.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header .mdc-tab-indicator__content--underline {
  align-self: flex-start;
}

.mat-mdc-tab-body-wrapper {
  position: relative;
  overflow: hidden;
  display: flex;
  transition: height 500ms cubic-bezier(0.35, 0, 0.25, 1);
}
.mat-mdc-tab-body-wrapper._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
`],encapsulation:2,changeDetection:1})}return n})(),fi=class{index;tab};function pi(n){let a=n+"";return /^\d+$/.test(a)?n+"ms":a}var so=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$E({type:n});static \u0275inj=jl({imports:[Se]})}return n})();var As=new x("MAT_BADGE_CONFIG"),lo="mat-badge-content",Ls=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=HE({type:n,selectors:[["ng-component"]],decls:0,vars:0,template:function(t,i){},styles:[`.mat-badge {
  position: relative;
}
.mat-badge.mat-badge {
  overflow: visible;
}

.mat-badge-content {
  position: absolute;
  text-align: center;
  display: inline-block;
  transition: transform 200ms ease-in-out;
  transform: scale(0.6);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-sizing: border-box;
  pointer-events: none;
  background-color: var(--mat-badge-background-color, var(--mat-sys-error));
  color: var(--mat-badge-text-color, var(--mat-sys-on-error));
  font-family: var(--mat-badge-text-font, var(--mat-sys-label-small-font));
  font-weight: var(--mat-badge-text-weight, var(--mat-sys-label-small-weight));
  border-radius: var(--mat-badge-container-shape, var(--mat-sys-corner-full));
}
.mat-badge-above .mat-badge-content {
  bottom: 100%;
}
.mat-badge-below .mat-badge-content {
  top: 100%;
}
.mat-badge-before .mat-badge-content {
  right: 100%;
}
[dir=rtl] .mat-badge-before .mat-badge-content {
  right: auto;
  left: 100%;
}
.mat-badge-after .mat-badge-content {
  left: 100%;
}
[dir=rtl] .mat-badge-after .mat-badge-content {
  left: auto;
  right: 100%;
}
@media (forced-colors: active) {
  .mat-badge-content {
    outline: solid 1px;
    border-radius: 0;
  }
}

.mat-badge-disabled .mat-badge-content {
  background-color: var(--mat-badge-disabled-state-background-color, color-mix(in srgb, var(--mat-sys-error) 38%, transparent));
  color: var(--mat-badge-disabled-state-text-color, var(--mat-sys-on-error));
}

.mat-badge-hidden .mat-badge-content {
  display: none;
}

.ng-animate-disabled .mat-badge-content,
.mat-badge-content._mat-animation-noopable {
  transition: none;
}

.mat-badge-content.mat-badge-active {
  transform: none;
}

.mat-badge-small .mat-badge-content {
  width: var(--mat-badge-legacy-small-size-container-size, unset);
  height: var(--mat-badge-legacy-small-size-container-size, unset);
  min-width: var(--mat-badge-small-size-container-size, 6px);
  min-height: var(--mat-badge-small-size-container-size, 6px);
  line-height: var(--mat-badge-small-size-line-height, 6px);
  padding: var(--mat-badge-small-size-container-padding, 0);
  font-size: var(--mat-badge-small-size-text-size, 0);
  margin: var(--mat-badge-small-size-container-offset, -6px 0);
}
.mat-badge-small.mat-badge-overlap .mat-badge-content {
  margin: var(--mat-badge-small-size-container-overlap-offset, -6px);
}

.mat-badge-medium .mat-badge-content {
  width: var(--mat-badge-legacy-container-size, unset);
  height: var(--mat-badge-legacy-container-size, unset);
  min-width: var(--mat-badge-container-size, 16px);
  min-height: var(--mat-badge-container-size, 16px);
  line-height: var(--mat-badge-line-height, 16px);
  padding: var(--mat-badge-container-padding, 0 4px);
  font-size: var(--mat-badge-text-size, var(--mat-sys-label-small-size));
  margin: var(--mat-badge-container-offset, -12px 0);
}
.mat-badge-medium.mat-badge-overlap .mat-badge-content {
  margin: var(--mat-badge-container-overlap-offset, -12px);
}

.mat-badge-large .mat-badge-content {
  width: var(--mat-badge-legacy-large-size-container-size, unset);
  height: var(--mat-badge-legacy-large-size-container-size, unset);
  min-width: var(--mat-badge-large-size-container-size, 16px);
  min-height: var(--mat-badge-large-size-container-size, 16px);
  line-height: var(--mat-badge-large-size-line-height, 16px);
  padding: var(--mat-badge-large-size-container-padding, 0 4px);
  font-size: var(--mat-badge-large-size-text-size, var(--mat-sys-label-small-size));
  margin: var(--mat-badge-large-size-container-offset, -12px 0);
}
.mat-badge-large.mat-badge-overlap .mat-badge-content {
  margin: var(--mat-badge-large-size-container-overlap-offset, -12px);
}
`],encapsulation:2})}return n})(),co=(()=>{class n{_ngZone=C(Ce);_elementRef=C(cr$1);_ariaDescriber=C(sc);_renderer=C(zv);_animationsDisabled=xe$1();_idGenerator=C(An$1);get color(){return this._color}set color(e){this._setColor(e),this._color=e;}_color;overlap;disabled=false;position;get content(){return this._content}set content(e){this._updateRenderedContent(e);}_content;get description(){return this._description}set description(e){this._updateDescription(e);}_description;size;hidden=false;_badgeElement;_inlineBadgeDescription;_isInitialized=false;_interactivityChecker=C(jr$1);_document=C(No$1);constructor(){let e=C(As,{optional:true}),t=C(q$1);t.load(Ls),t.load(St),this._color=e?.color||"primary",this.overlap=e?.overlap??true,this.position=e?.position||"above after",this.size=e?.size||"medium";}isAbove(){return this.position.indexOf("below")===-1}isAfter(){return this.position.indexOf("before")===-1}getBadgeElement(){return this._badgeElement}ngOnInit(){this._clearExistingBadges(),this.content&&!this._badgeElement&&(this._badgeElement=this._createBadgeElement(),this._updateRenderedContent(this.content)),this._isInitialized=true;}ngAfterViewInit(){}ngOnDestroy(){this._renderer.destroyNode&&(this._renderer.destroyNode(this._badgeElement),this._inlineBadgeDescription?.remove()),this._ariaDescriber.removeDescription(this._elementRef.nativeElement,this.description);}_isHostInteractive(){return this._interactivityChecker.isFocusable(this._elementRef.nativeElement,{ignoreVisibility:true})}_createBadgeElement(){let e=this._renderer.createElement("span"),t="mat-badge-active";return e.setAttribute("id",this._idGenerator.getId("mat-badge-content-")),e.setAttribute("aria-hidden","true"),e.classList.add(lo),this._animationsDisabled&&e.classList.add("_mat-animation-noopable"),this._elementRef.nativeElement.appendChild(e),typeof requestAnimationFrame=="function"&&!this._animationsDisabled?this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>{e.classList.add(t);});}):e.classList.add(t),e}_updateRenderedContent(e){let t=`${e??""}`.trim();this._isInitialized&&t&&!this._badgeElement&&(this._badgeElement=this._createBadgeElement()),this._badgeElement&&(this._badgeElement.textContent=t),this._content=t;}_updateDescription(e){this._ariaDescriber.removeDescription(this._elementRef.nativeElement,this.description),(!e||this._isHostInteractive())&&this._removeInlineDescription(),this._description=e,this._isHostInteractive()?this._ariaDescriber.describe(this._elementRef.nativeElement,e):this._updateInlineDescription();}_updateInlineDescription(){this._inlineBadgeDescription||(this._inlineBadgeDescription=this._document.createElement("span"),this._inlineBadgeDescription.classList.add("cdk-visually-hidden")),this._inlineBadgeDescription.textContent=this.description,this._badgeElement?.appendChild(this._inlineBadgeDescription);}_removeInlineDescription(){this._inlineBadgeDescription?.remove(),this._inlineBadgeDescription=void 0;}_setColor(e){let t=this._elementRef.nativeElement.classList;t.remove(`mat-badge-${this._color}`),e&&t.add(`mat-badge-${e}`);}_clearExistingBadges(){let e=this._elementRef.nativeElement.querySelectorAll(`:scope > .${lo}`);for(let t of Array.from(e))t!==this._badgeElement&&t.remove();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=WE({type:n,selectors:[["","matBadge",""]],hostAttrs:[1,"mat-badge"],hostVars:20,hostBindings:function(t,i){t&2&&Fp("mat-badge-overlap",i.overlap)("mat-badge-above",i.isAbove())("mat-badge-below",!i.isAbove())("mat-badge-before",!i.isAfter())("mat-badge-after",i.isAfter())("mat-badge-small",i.size==="small")("mat-badge-medium",i.size==="medium")("mat-badge-large",i.size==="large")("mat-badge-hidden",i.hidden||!i.content)("mat-badge-disabled",i.disabled);},inputs:{color:[0,"matBadgeColor","color"],overlap:[2,"matBadgeOverlap","overlap",mF],disabled:[2,"matBadgeDisabled","disabled",mF],position:[0,"matBadgePosition","position"],content:[0,"matBadge","content"],description:[0,"matBadgeDescription","description"],size:[0,"matBadgeSize","size"],hidden:[2,"matBadgeHidden","hidden",mF]}})}return n})(),mo=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$E({type:n});static \u0275inj=jl({imports:[Co$1,Se]})}return n})();function Ns(n,a){if(n&1&&(ai$1(0,"span",18),tD(1,"Events"),Mc()),n&2){let e=bI();Ip("matBadge",e.unreadEventsCount())("matBadgeHidden",e.unreadEventsCount()===0);}}function Bs(n,a){if(n&1&&(ai$1(0,"span",19),tD(1,"Errors"),Mc()),n&2){let e=bI();Ip("matBadge",e.unreadErrorsCount())("matBadgeHidden",e.unreadErrorsCount()===0);}}function zs(n,a){n&1&&(ai$1(0,"mat-tab",17)(1,"div",14),Dp(2,"a2ui-composer-mock-rules"),Mc()());}var po=1,yi=2,uo=class n{startupResolution=C(jt);hostComm=C(Xt);isExtension=So$1(false);isDebugCollapsed=So$1(false);showMockRules=So$1(false);selectedTabIndex=So$1(0);unreadEventsCount=So$1(0);unreadErrorsCount=So$1(0);rawMessages=dF(Ct);events=dF(yt);errors=dF(vt);constructor(){this.hostComm.messageStream$.pipe(Wi()).subscribe(a=>{if(!a)return;let e=a.payload,t=this.selectedTabIndex();if(a.type===S.SEND_TO_SERVER&&e?.action)t!==po&&this.unreadEventsCount.update(i=>i+1);else if(a.type===S.CONSOLE_LOG)t!==yi&&this.unreadErrorsCount.update(i=>i+1);else if(a.type===S.DATA_MODEL_CHANGE&&e?.validationErrors){let i=e.validationErrors;(Array.isArray(i)?i.length>0:typeof i=="object"&&i!==null?Object.keys(i).length>0:i)&&t!==yi&&this.unreadErrorsCount.update(r=>r+1);}}),Au(()=>{let a=this.selectedTabIndex();a===po?wD(()=>{this.unreadEventsCount.set(0);}):a===yi&&wD(()=>{this.unreadErrorsCount.set(0);});});}ngOnInit(){let a=this.startupResolution.isExtensionMode();this.isExtension.set(a),a&&this.isDebugCollapsed.set(true);}toggleDebugCollapse(){this.isDebugCollapsed.update(a=>!a);}clearAllLogs(){this.rawMessages()?.clearLogs(),this.events()?.clearLogs(),this.errors()?.clearLogs();}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=HE({type:n,selectors:[["a2ui-composer-workspace"]],viewQuery:function(e,t){e&1&&Rp(t.rawMessages,Ct,5)(t.events,yt,5)(t.errors,vt,5),e&2&&kI(3);},decls:41,vars:8,consts:[[1,"workspace-container"],[1,"left-panel"],[1,"right-panel"],[1,"preview-section"],[1,"preview-frame-container"],[1,"frame-header"],[1,"frame-body"],[1,"debug-section"],[1,"debug-header-controls"],["mat-icon-button","","aria-label","Clear Logs","matTooltip","Clear all log tabs","matTooltipPosition","left",3,"click"],["aria-hidden","true"],["mat-icon-button","","aria-label","Toggle Debug Panel","matTooltipPosition","left",3,"click","matTooltip"],["fitInkBarToContent","",3,"selectedIndexChange","selectedIndex"],["label","Data Model"],[1,"tab-content-container"],["mat-tab-label",""],["label","Raw Messages"],["label","Mock Rules"],["matBadgeOverlap","false","matBadgeColor","accent",1,"events-badge-host",3,"matBadge","matBadgeHidden"],["matBadgeOverlap","false","matBadgeColor","warn",1,"errors-badge-host",3,"matBadge","matBadgeHidden"]],template:function(e,t){e&1&&(ai$1(0,"div",0)(1,"div",1),Dp(2,"a2ui-composer-chat-panel"),Mc(),ai$1(3,"div",2)(4,"div",3)(5,"div",4)(6,"div",5)(7,"span"),tD(8,"Rendered A2UI Preview"),Mc()(),ai$1(9,"div",6),Dp(10,"a2ui-composer-rendered-frame"),Mc()(),ai$1(11,"div",4)(12,"div",5)(13,"span"),tD(14,"A2UI JSON Editor"),Mc()(),ai$1(15,"div",6),Dp(16,"a2ui-composer-raw-frame"),Mc()()(),ai$1(17,"div",7)(18,"div",8)(19,"button",9),Mp("click",function(){return t.clearAllLogs()}),ai$1(20,"mat-icon",10),tD(21,"delete"),Mc()(),ai$1(22,"button",11),Mp("click",function(){return t.toggleDebugCollapse()}),ai$1(23,"mat-icon",10),tD(24),Mc()()(),ai$1(25,"mat-tab-group",12),Wp("selectedIndexChange",function(o){return iD(t.selectedTabIndex,o)||(t.selectedTabIndex=o),o}),ai$1(26,"mat-tab",13)(27,"div",14),Dp(28,"a2ui-composer-data-model"),Mc()(),ai$1(29,"mat-tab"),pp(30,Ns,2,2,"ng-template",15),ai$1(31,"div",14),Dp(32,"a2ui-composer-events"),Mc()(),ai$1(33,"mat-tab"),pp(34,Bs,2,2,"ng-template",15),ai$1(35,"div",14),Dp(36,"a2ui-composer-errors"),Mc()(),ai$1(37,"mat-tab",16)(38,"div",14),Dp(39,"a2ui-composer-raw-messages"),Mc()(),fI(40,zs,3,0,"mat-tab",17),Mc()()()()),e&2&&(Fp("extension-mode",t.isExtension()),By(17),Fp("collapsed",t.isDebugCollapsed()),By(5),Ip("matTooltip",t.isDebugCollapsed()?"Expand Debug Panel":"Collapse Debug Panel"),By(2),Up(t.isDebugCollapsed()?"keyboard_arrow_up":"keyboard_arrow_down"),By(),qp("selectedIndex",t.selectedTabIndex),By(15),pI(t.showMockRules()?40:-1));},dependencies:[hn,fn,gn,_n,yt,vt,Ct,An,so,_i,bi,ro,Hd,jd,Ed,Lo,an,Ge,mo,co],styles:["[_nghost-%COMP%]{display:block;height:100%}.workspace-container[_ngcontent-%COMP%]{display:flex;gap:16px;height:100%;box-sizing:border-box}.workspace-container.extension-mode[_ngcontent-%COMP%]{flex-direction:column}.workspace-container.extension-mode[_ngcontent-%COMP%]   .left-panel[_ngcontent-%COMP%]{flex:0 0 auto}.workspace-container.extension-mode[_ngcontent-%COMP%]   .right-panel[_ngcontent-%COMP%]{flex:1}.workspace-container.extension-mode[_ngcontent-%COMP%]   .preview-section[_ngcontent-%COMP%]{flex-direction:column}.left-panel[_ngcontent-%COMP%]{flex:0 0 300px;width:300px;max-width:300px;min-width:300px;display:flex;flex-direction:column;overflow:hidden}.right-panel[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;gap:16px;min-width:0;height:100%}.preview-section[_ngcontent-%COMP%]{display:flex;flex-direction:row;gap:16px;flex:1;min-height:0}.preview-frame-container[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;border:1px solid var(--mat-sys-outline-variant);border-radius:8px;background-color:var(--mat-sys-surface);box-shadow:0 2px 4px #0000000d;overflow:hidden;min-width:0}.frame-header[_ngcontent-%COMP%]{padding:12px 16px;background-color:var(--mat-sys-surface-container);border-bottom:1px solid var(--mat-sys-outline-variant);font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);display:flex;align-items:center;flex-shrink:0}.frame-body[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;overflow:auto;box-sizing:border-box;min-height:0}.debug-section[_ngcontent-%COMP%]{position:relative;transition:all .2s ease-in-out;height:320px;display:flex;flex-direction:column;background-color:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:8px;padding:8px;box-shadow:0 2px 4px #0000000d}.debug-section.collapsed[_ngcontent-%COMP%]{height:48px!important;flex:0 0 auto;overflow:hidden}.debug-header-controls[_ngcontent-%COMP%]{position:absolute;right:8px;top:8px;z-index:10;display:flex;gap:4px}.tab-content-container[_ngcontent-%COMP%]{padding:12px 8px;flex:1;display:flex;flex-direction:column;min-height:0;box-sizing:border-box}  .mat-mdc-tab-group{height:100%;display:flex;flex-direction:column;min-height:0}  .mat-mdc-tab-group .mat-mdc-tab-header{width:fit-content!important;max-width:calc(100% - 88px)!important;box-sizing:border-box;flex-shrink:0}  .mat-mdc-tab-group .mat-mdc-tab-header .mat-badge:not(.mat-badge-hidden) .mat-badge-content{width:16px!important;height:16px!important;min-width:16px!important;border-radius:50%!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;line-height:1!important;font-size:10px!important;top:-4px!important;right:-18px!important}  .mat-mdc-tab-group .mat-mdc-tab-header .events-badge-host .mat-badge-content{background-color:#3f51b5!important;color:#fff!important}  .mat-mdc-tab-group .mat-mdc-tab-header .errors-badge-host .mat-badge-content{background-color:#ba1a1a!important;color:#fff!important}  .mat-mdc-tab-group .mat-mdc-tab-body-wrapper{flex:1;display:flex;flex-direction:column;min-height:0}  .mat-mdc-tab-group .mat-mdc-tab-body{flex:1;display:flex;flex-direction:column;min-height:0}  .mat-mdc-tab-group .mat-mdc-tab-body-content{height:100%!important;display:flex;flex-direction:column;flex:1}  .mat-mdc-tab-group .mdc-tab{flex:0 0 auto!important;min-width:auto!important;padding:0 16px!important}"]})};export{uo as ComposerWorkspace};