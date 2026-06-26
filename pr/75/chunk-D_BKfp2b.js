import {g,k as Qg,l as tn,M as M1,J as Jd,h as hI,z as zi$1,H as Hh,O as Ou,T as Tw,a as qh,n as dg,p as kh,F as FI,r as rg,V as VD,b as Vh,u as ug,s as lg,L as LI,v as Jh,w as nw,A as O1,C as RC,y as ys,G as Gw,E as G,I as j$1,x as xn,P as T,S as Le,U as ee,Z as mg,$ as zm,a0 as se$1,a1 as Vt,a2 as _E,a3 as ME,a4 as qw,a5 as Wm,a6 as ku,a7 as Pu,o as os,D as Dr$1,a8 as tp,_ as _u,a9 as Rh,aa as Ow,ab as Kn,ac as $c,ad as x1,K as KI,ae as Ph,B as Bh,af as Kh,d as ew,t as tw,Q as Qh,ag as zn$1,Y as Yn,ah as gC,ai as K,aj as H,ak as xi$1,al as We,am as ey,an as Um,ao as R1,ap as VI,aq as jh,ar as HI,c as hw,as as ng,at as ah,W,au as Tn$1,X as XI,av as yg,aw as jt,ax as e,N,ay as re,az as Vm,aA as Ve,q as qI,R as Rd,aB as YI,i as Od,aC as Jm,aD as mD,aE as Gd$1,aF as Uh,aG as Fu,aH as Lu,aI as kw,aJ as cr$1,aK as Gh,aL as II,aM as jI,f as rw,aN as $s,aO as ty,aP as rd,aQ as x,aR as fr$1,aS as Lw,aT as Bw,j as ju,aU as BI,aV as Nw}from'./main.js';import {n as no$1,A as Ae,F as Fe,B,Y as Ye,u as ue$1,J as Jt,a as ae$1,_ as _e,s as st,q as q$1,b as J,V,R as Rt,G as G$1}from'./chunk-BQyogGyh.js';import {g as gt,a as ae,l as ln$1,Y as Yi$1,J as Ji$1,r as rn$1,e as en,Z as Zi$1,o as on$1,t as tn$1,n as nn,s as sn$1,b as an$1,i as ii$1,c as ti$1}from'./chunk-B9vhu2GR.js';import {H as H$1,K as Ke,X as Xe}from'./chunk-Cbw4IkWb.js';import {s as se,i as it$1,r as rn$2,o as on$2,V as Ve$1}from'./chunk-D-hJ2cS0.js';import {X as Xt,$ as $i$1,a as E,G as Gd,H as Hd,C as Cd,U as Uo$1,o as oo$1,E as Ed,f as fu,w as wi$1,l as lu,b as Rs,T as Tu,q,r as ri$1,x as xe,R,c as wn,d as ao$1,e as Gc,g as ac,z as zr$1,h as St,A as At,i as Gr,Q as Qt,j as ll,k as jo$1,m as Ao$1,S as Se,n as Cn,p as wo$1,s as so$1,t as bn}from'./chunk-NhS7cbI6.js';var Ta=`
{"version": "v0.9", "createSurface": {"surfaceId": "sample-surface", "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json", "sendDataModel": true}}
{"version": "v0.9", "updateComponents": {"surfaceId": "sample-surface", "components": [{"id": "root", "component": "Column", "children": ["title", "location_input", "pickup_input", "dropoff_input", "book_button"], "justify": "start", "align": "stretch"}, {"id": "title", "component": "Text", "text": "Book a Car", "variant": "h1"}, {"id": "location_input", "component": "TextField", "label": "Pick-up Location", "value": {"path": "/booking/location"}, "variant": "shortText"}, {"id": "pickup_input", "component": "DateTimeInput", "label": "Pick-up Date", "value": {"path": "/booking/pickupDate"}, "enableDate": true, "enableTime": false}, {"id": "dropoff_input", "component": "DateTimeInput", "label": "Drop-off Date", "value": {"path": "/booking/dropoffDate"}, "enableDate": true, "enableTime": false}, {"id": "book_button", "component": "Button", "child": "book_button_text", "variant": "primary", "action": {"event": {"name": "searchCars", "context": {"location": {"path": "/booking/location"}, "pickupDate": {"path": "/booking/pickupDate"}, "dropoffDate": {"path": "/booking/dropoffDate"}}}}}, {"id": "book_button_text", "component": "Text", "text": "Search Cars", "variant": "body"}]}}
{"version": "v0.9", "updateDataModel": {"surfaceId": "sample-surface", "path": "/booking", "value": {"location": "", "pickupDate": "", "dropoffDate": ""}}}
`.trim()+`
`;function nt(n){let i=n.trim();if(i.startsWith("[")&&i.endsWith("]"))try{let e=JSON.parse(i);if(Array.isArray(e))return e}catch{}return null}var an="updateComponents",kn="components",_i="registerMockRules",yi="mockRulesConfig",vi="rules",xi="id",Ci="children",Ea="mock_rules_container",at=class n{destroyRef=g(Le);chatState=g(ae);catalogManagement=g(oo$1);_activeDraft=tn("");activeDraft=this._activeDraft.asReadonly();_draftInput=tn("");constructor(){Jd(()=>{let i=this.catalogManagement.activeCatalog();if(i){let e=i.catalogId||"";mg(()=>{let t=this._activeDraft(),a=this.getCatalogIdFromDraft(t);(t===""||a!==e)&&this._activeDraft.set(this.getInitialDraft(e));});}}),Tu(this._draftInput).pipe(Jm(1),zm(300),Wm(),$i$1(this.destroyRef)).subscribe(i=>{this.syncLayoutToHistory(i);});}updateDraft(i){this._activeDraft.set(i),this._draftInput.set(i);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(i){this._activeDraft.set(i);}flushDraft(){let e=this.catalogManagement.activeCatalog()?.catalogId||"";this._activeDraft.set(this.getInitialDraft(e));}getInitialDraft(i){return i==="https://a2ui.org/specification/v0_9/basic_catalog.json"?Ta:i?JSON.stringify({version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:i,sendDataModel:true}})+`
`:""}getCatalogIdFromDraft(i){let e=i.trim();if(!e)return null;try{let a=JSON.parse(e);if(Array.isArray(a)){for(let o of a)if(o?.createSurface?.catalogId)return o.createSurface.catalogId}else if(a?.createSurface?.catalogId)return a.createSurface.catalogId}catch{}let t=e.split(`
`);for(let a of t){let o=a.trim();if(o)try{let s=JSON.parse(o);if(s?.createSurface?.catalogId)return s.createSurface.catalogId}catch{}}return null}syncLayoutToHistory(i){let e=this.sanitizeLayout(i),t=this.chatState.chatHistory();if(t.length===0){this.chatState.setChatHistory([{role:"user",content:e}]);return}let a=t[t.length-1];if(a.role==="user"&&a.content.trim().startsWith('{"version"')){let s=[...t];s[s.length-1]={role:"user",content:e},this.chatState.setChatHistory(s);}else this.chatState.updateChatHistory(s=>[...s,{role:"user",content:e}]);}sanitizeLayout(i){let e=i.trim();if(!e)return "";let t=nt(e);if(t)return t.map(l=>l&&typeof l=="object"&&!Array.isArray(l)?this.sanitizeBlock(l):l).filter(Boolean).map(l=>JSON.stringify(l)).join(`
`)+`
`;let a=e.split(`
`).map(s=>s.trim()).filter(s=>s.length>0),o=[];for(let s of a)try{let l=JSON.parse(s);if(!l||typeof l!="object"||Array.isArray(l))continue;let h=this.sanitizeBlock(l);h&&o.push(JSON.stringify(h));}catch(l){console.warn("[StateSync] Discarding malformed layout JSON Line during sanitization:",s,l);}return o.length>0?o.join(`
`)+`
`:""}sanitizeBlock(i){if(i[_i]||i[yi])return null;if(i[an]&&typeof i[an]=="object"&&i[an]!==null){let e=i[an];if(Array.isArray(e[kn])){let t=e[kn].filter(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?a[xi]!==Ea:true);e[kn]=t.map(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?this.sanitizeComponentObject(a):a);}}return i}sanitizeComponentObject(i){let e={};for(let[t,a]of Object.entries(i))t===vi||/^mock/i.test(t)||(t===Ci&&Array.isArray(a)?e[t]=a.filter(o=>o!==Ea):a!==null&&typeof a=="object"&&!Array.isArray(a)?e[t]=this.sanitizeComponentObject(a):Array.isArray(a)?e[t]=a.map(o=>o!==null&&typeof o=="object"&&!Array.isArray(o)?this.sanitizeComponentObject(o):o):e[t]=a);return e}static \u0275fac=function(e){return new(e||n)};static \u0275prov=N({token:n,factory:n.\u0275fac,providedIn:"root"})};function Ia(n){let i=/^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i,e=n.replace(i,"");if(e.startsWith("{"))try{let t=JSON.parse(e);if(t.error&&t.error.message)return t.error.message}catch{}return e}function on(n){if(!n)return n;let i=n.replace(/AIzaSy[A-Za-z0-9_-]+/g,"redacted for your protection");return i=i.replace(/(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,a)=>a.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),i=i.replace(/(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,a)=>a.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),i}var rn=class n{catalogManagement=g(oo$1);configProvider=g(ys);stateSync=g(at);chatState=g(ae);llmClient=g(e);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;lastSeenRendererUrl="";isFirstUrlEffectRun=true;constructor(){Jd(()=>{let i=this.configProvider.rendererUrl();mg(()=>{if(this.isFirstUrlEffectRun){this.isFirstUrlEffectRun=false,this.lastSeenRendererUrl=i;return}this.lastSeenRendererUrl!==i&&queueMicrotask(()=>this.wipeEnvironmentCache()),this.lastSeenRendererUrl=i;});});}wipeEnvironmentCache(){this.chatState.setChatHistory([]),this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}getFullMessageContext(){return [{role:"system",content:this.systemPrompt()},...this.chatState.chatHistory().filter(i=>i.role!=="error")]}async submitPrompt(i){let e=i.trim();if(!e)return;this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(a=>[...a,{role:"user",content:e}]);let t=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",t),this.chatState.updateChatHistory(a=>[...a,{role:"model",content:" \u25CF\u25CF\u25CF"}]);try{let a=await this.llmClient.chatStream(t),o="";for await(let l of a.contentStream)o+=l,this.chatState.updateChatHistory(h=>{let g=[...h],B=g.length-1;return g[B]?.role==="model"&&(g[B]={role:"model",content:o+" \u25CF\u25CF\u25CF"}),g});let s=await a.complete;this.chatState.addRawLlmLog("LLM_RESPONSE",s),this.chatState.updateChatHistory(l=>{let h=[...l],g=h.length-1;return h[g]?.role==="model"&&(h[g]={role:"model",content:s}),h}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(s);}catch(a){this.handleConnectivityError(a,e);}}async processRawLlmPayload(i){let e=[];try{e=this.parseAndHealJsonLines(i);}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}this.chatState.setPipelineStatus("validating");try{let t={type:E.RENDER_A2UI,payload:e},a=console.error,o=[];console.error=(...h)=>{o.push(h.map(g=>typeof g=="object"?JSON.stringify(g):String(g)).join(" "));};let s=!1;try{s=Qt.validateOutgoingMessage(t);}finally{console.error=a;}if(!s)throw new Error(`Outgoing message envelope validation failed:
${o.join(`
`)}`);this.runCatalogComponentSchemaCheck(e),this.chatState.setPipelineStatus("ready");let l=e.map(h=>JSON.stringify(h)).join(`
`)+`
`;this.stateSync.commitLayoutFromLlm(l),this.chatState.setProgrammaticStreamActive(!1);}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}}parseAndHealJsonLines(i){let e=i.trim(),t=/```json\s*([\s\S]*?)\s*```/,a=e.match(t);a&&a[1]&&(this.chatState.setPipelineStatus("healing"),e=a[1].trim());let o=e.split(`
`).map(l=>l.trim()).filter(l=>l.length>0),s=[];for(let l of o)if(!(l.startsWith("```")||!l.startsWith("{")&&!l.startsWith("[")))try{s.push(JSON.parse(l));}catch{this.chatState.setPipelineStatus("healing");let g=this.attemptSyntaxHealing(l);if(g!==null)s.push(g);else if(l.includes('"version"')||l.includes('"createSurface"'))throw new Error(`Syntax recovery failed for corrupted JSON Line:
"${l}"`)}if(s.length===0)throw new Error("No valid A2UI JSON layout command block could be parsed or recovered.");return s}attemptSyntaxHealing(i){let e=i.trim();e=e.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(e)}catch{for(let a=1;a<=5;a++)try{return JSON.parse(e+"}".repeat(a))}catch{}for(let a=1;a<=3;a++)for(let o=1;o<=3;o++)try{return JSON.parse(e+"]".repeat(a)+"}".repeat(o))}catch{}}return null}runCatalogComponentSchemaCheck(i){let e=this.catalogManagement.activeCatalog(),t={};if(e&&e.components)for(let o of Object.keys(e.components)){let s=o.toLowerCase().replace(/[^a-z]/g,"");t[s]=o;}let a={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let o of i){if(!o||typeof o!="object")continue;let l=o.updateComponents;if(!l||typeof l!="object"||!Array.isArray(l.components))continue;let h=[];for(let g of l.components){if(!g||typeof g!="object"||Array.isArray(g)){h.push(g);continue}let B=g,ne=B.component;if(B.name&&!B.component&&(this.chatState.setPipelineStatus("healing"),ne=B.name,B.component=ne,delete B.name),typeof ne!="string")throw new Error("Component declaration is missing component type name string.");let st=ne;if(e&&e.components&&!e.components[ne]){let ge=ne.toLowerCase().replace(/[^a-z]/g,""),ye=t[ge];if(!ye){let lt=a[ge];lt&&(ye=t[lt]);}if(ye&&e.components[ye])this.chatState.setPipelineStatus("healing"),st=ye;else {let lt=ge?Object.keys(e.components).find(Gn=>Gn.toLowerCase().includes(ge)||ge.includes(Gn.toLowerCase())):void 0;if(lt)this.chatState.setPipelineStatus("healing"),st=lt;else throw new Error(`Validation failure: Component type "${ne}" is not registered in the active custom catalog.`)}}let he=this.sanitizeComponentObject(B);he.component=st,h.push(he);}l.components=h;}}sanitizeValue(i){if(i===null||typeof i!="object")return i;if(Array.isArray(i))return i.map(a=>this.sanitizeValue(a));let e=i,t={};for(let[a,o]of Object.entries(e))a==="rules"||/^mock/i.test(a)||(t[a]=this.sanitizeValue(o));return t}sanitizeComponentObject(i){return this.sanitizeValue(i)}TEST_ONLY={sanitizeComponentObject:i=>this.sanitizeComponentObject(i)};isConnectivityError(i){return i.includes("failed to fetch")||i.includes("fetch")||i.includes("timeout")||i.includes("504")||i.includes("proxy")||i.includes("networkerror")||i.includes("connection")||i.includes("401")||i.includes("403")||i.includes("credential")||i.includes("quota")||i.includes("blocked")||i.includes("503")||i.includes("unavailable")||i.includes("api key")||i.includes("apikey")}parseError(i,e,t){let a="Connectivity Failure",o=e.trim().startsWith("{"),s=o?"A connectivity error occurred.":e,l=o?"Details: "+e:void 0,h="Tip: Please check your network proxy configurations or verify your settings to restore connections.",g=!!t,B=true;return i.includes("validation")||i.includes("syntax recovery")||i.includes("validation failure")?{errorTitle:"Validation Failure",errorMessage:"The generated layout contains invalid components or structure.",errorTip:"Tip: Try rephrasing your prompt to guide the model to generate valid components.",isRetryable:!!t,showDetails:true,errorDetails:"Details: "+e}:i.includes("503")||i.includes("unavailable")?{errorTitle:"Service Unavailable",errorMessage:"The generative service is temporarily unavailable. Please try again later.",errorTip:"",isRetryable:true,showDetails:false}:i.includes("high demand")?{errorTitle:"Model High Demand",errorMessage:"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",errorTip:"",isRetryable:true,showDetails:false}:i.includes("timeout")||i.includes("504")?{errorTitle:"REST Gateway Timeout",errorMessage:"Remote generation service did not respond.",errorDetails:"Details: "+e,errorTip:h,isRetryable:g,showDetails:true}:i.includes("api key")||i.includes("apikey")?{errorTitle:"Invalid API Key",errorMessage:"The provided Gemini API key is invalid or missing.",errorDetails:"Details: "+e,errorTip:"Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.",isRetryable:g,showDetails:true}:i.includes("auth")||i.includes("401")||i.includes("403")||i.includes("credential")?{errorTitle:"Authentication Refused",errorMessage:"Authentication failed. Please verify your credentials in Settings.",errorDetails:"Details: "+e,errorTip:h,isRetryable:g,showDetails:true}:i.includes("quota")||i.includes("blocked")||i.includes("429")?{errorTitle:"GenAI Service Blocked",errorMessage:"Resource quota depleted or content safety limits triggered.",errorDetails:"Details: "+e,errorTip:h,isRetryable:g,showDetails:true}:{errorTitle:a,errorMessage:s,errorTip:h,isRetryable:g,showDetails:B,errorDetails:l}}handleConnectivityError(i,e){let t=i instanceof Error?i.message:String(i),a=t.toLowerCase(),o=Ia(t);this.isConnectivityError(a)?this.chatState.setPipelineStatus("idle"):this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false);let s=this.parseError(a,o,e),l="";i instanceof Error?l="Exception: "+i.message+`
Stack: `+(i.stack||"None"):l="Unknown Exception: "+JSON.stringify(i);let h="";s.errorDetails&&(h+=s.errorDetails+`

`),h+=l;let g=on(s.errorMessage),B=s.showDetails?on(h):void 0,ne=s.showDetails?on(s.errorTip):void 0;console.error("Gemini chat execution failed:",i),this.chatState.updateChatHistory(st=>{let he=[...st],ge=he.length-1,ye=j$1({role:"error",content:g,errorTitle:s.errorTitle,errorMessage:g,errorDetails:B,errorTip:ne},s.isRetryable?{isRetryable:true,originalPrompt:e}:{});return ge>=0&&he[ge].role==="model"?(he[ge]=ye,he):(he.push(ye),he)});}systemPrompt=Gw(()=>{let i=this.catalogManagement.activeCatalog();return i?this.generateSystemPrompt(JSON.stringify(i,null,2)):`You are an AI assistant designed to help model mock screens inside A2UI Composer shell.
Status: Awaiting renderer dynamic handshake settlement...`});generateSystemPrompt(i){return `
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
  ${i}.
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

  `}static \u0275fac=function(e){return new(e||n)};static \u0275prov=N({token:n,factory:n.\u0275fac,providedIn:"root"})};function wi(n,i){}var Te=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;positionStrategy;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;scrollStrategy;closeOnNavigation=true;closeOnDestroy=true;closeOnOverlayDetachments=true;disableAnimations=false;providers;container;templateContext;bindings};var Pn=(()=>{class n extends G$1{_elementRef=g(Yn);_focusTrapFactory=g(wo$1);_config;_interactivityChecker=g(zr$1);_ngZone=g(K);_focusMonitor=g(At);_renderer=g(ah);_changeDetectorRef=g(gC);_injector=g(re);_platform=g(R);_document=g(W);_portalOutlet;_focusTrapped=new ee;_focusTrap=null;_elementFocusedBeforeDialogWasOpened=null;_closeInteractionType=null;_ariaLabelledByQueue=[];_isDestroyed=false;constructor(){super(),this._config=g(Te,{optional:true})||new Te,this._config.ariaLabelledBy&&this._ariaLabelledByQueue.push(this._config.ariaLabelledBy);}_addAriaLabelledBy(e){this._ariaLabelledByQueue.push(e),this._changeDetectorRef.markForCheck();}_removeAriaLabelledBy(e){let t=this._ariaLabelledByQueue.indexOf(e);t>-1&&(this._ariaLabelledByQueue.splice(t,1),this._changeDetectorRef.markForCheck());}_contentAttached(){this._initializeFocusTrap(),this._captureInitialFocus();}_captureInitialFocus(){this._trapFocus();}ngOnDestroy(){this._focusTrapped.complete(),this._isDestroyed=true,this._restoreFocus();}attachComponentPortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachComponentPortal(e);return this._contentAttached(),t}attachTemplatePortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachTemplatePortal(e);return this._contentAttached(),t}attachDomPortal=e=>{this._portalOutlet.hasAttached();let t=this._portalOutlet.attachDomPortal(e);return this._contentAttached(),t};_recaptureFocus(){this._containsFocus()||this._trapFocus();}_forceFocus(e,t){this._interactivityChecker.isFocusable(e)||(e.tabIndex=-1,this._ngZone.runOutsideAngular(()=>{let a=()=>{o(),s(),e.removeAttribute("tabindex");},o=this._renderer.listen(e,"blur",a),s=this._renderer.listen(e,"mousedown",a);})),e.focus(t);}_focusByCssSelector(e,t){let a=this._elementRef.nativeElement.querySelector(e);a&&this._forceFocus(a,t);}_trapFocus(e){this._isDestroyed||mD(()=>{let t=this._elementRef.nativeElement;switch(this._config.autoFocus){case  false:case "dialog":this._containsFocus()||t.focus(e);break;case  true:case "first-tabbable":this._focusTrap?.focusInitialElement(e)||this._focusDialogContainer(e);break;case "first-heading":this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]',e);break;default:this._focusByCssSelector(this._config.autoFocus,e);break}this._focusTrapped.next();},{injector:this._injector});}_restoreFocus(){let e=this._config.restoreFocus,t=null;if(typeof e=="string"?t=this._document.querySelector(e):typeof e=="boolean"?t=e?this._elementFocusedBeforeDialogWasOpened:null:e&&(t=e),this._config.restoreFocus&&t&&typeof t.focus=="function"){let a=so$1(),o=this._elementRef.nativeElement;(!a||a===this._document.body||a===o||o.contains(a))&&(this._focusMonitor?(this._focusMonitor.focusVia(t,this._closeInteractionType),this._closeInteractionType=null):t.focus());}this._focusTrap&&this._focusTrap.destroy();}_focusDialogContainer(e){this._elementRef.nativeElement.focus?.(e);}_containsFocus(){let e=this._elementRef.nativeElement,t=so$1();return e===t||e.contains(t)}_initializeFocusTrap(){this._platform.isBrowser&&(this._focusTrap=this._focusTrapFactory.create(this._elementRef.nativeElement),this._document&&(this._elementFocusedBeforeDialogWasOpened=so$1()));}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["cdk-dialog-container"]],viewQuery:function(t,a){if(t&1&&Kh(Ye,7),t&2){let o;ew(o=tw())&&(a._portalOutlet=o.first);}},hostAttrs:["tabindex","-1",1,"cdk-dialog-container"],hostVars:6,hostBindings:function(t,a){t&2&&Bh("id",a._config.id||null)("role",a._config.role)("aria-modal",a._config.ariaModal)("aria-labelledby",a._config.ariaLabel?null:a._ariaLabelledByQueue[0])("aria-label",a._config.ariaLabel)("aria-describedby",a._config.ariaDescribedBy||null);},features:[Rh],decls:1,vars:0,consts:[["cdkPortalOutlet",""]],template:function(t,a){t&1&&kh(0,wi,0,0,"ng-template",0);},dependencies:[Ye],styles:[`.cdk-dialog-container {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
  max-height: inherit;
}
`],encapsulation:2,changeDetection:1})}return n})(),ft=class{overlayRef;config;componentInstance=null;componentRef=null;containerInstance;disableClose;closed=new ee;backdropClick;keydownEvents;outsidePointerEvents;id;_detachSubscription;constructor(i,e){this.overlayRef=i,this.config=e,this.disableClose=e.disableClose,this.backdropClick=i.backdropClick(),this.keydownEvents=i.keydownEvents(),this.outsidePointerEvents=i.outsidePointerEvents(),this.id=e.id,this.keydownEvents.subscribe(t=>{t.keyCode===27&&!this.disableClose&&!Gr(t)&&(t.preventDefault(),this.close(void 0,{focusOrigin:"keyboard"}));}),this.backdropClick.subscribe(()=>{!this.disableClose&&this._canClose()?this.close(void 0,{focusOrigin:"mouse"}):this.containerInstance._recaptureFocus?.();}),this._detachSubscription=i.detachments().subscribe(()=>{e.closeOnOverlayDetachments!==false&&this.close();});}close(i,e){if(this._canClose(i)){let t=this.closed;this.containerInstance._closeInteractionType=e?.focusOrigin||"program",this._detachSubscription.unsubscribe(),this.overlayRef.dispose(),t.next(i),t.complete(),this.componentInstance=this.containerInstance=null;}}updatePosition(){return this.overlayRef.updatePosition(),this}updateSize(i="",e=""){return this.overlayRef.updateSize({width:i,height:e}),this}addPanelClass(i){return this.overlayRef.addPanelClass(i),this}removePanelClass(i){return this.overlayRef.removePanelClass(i),this}_canClose(i){let e=this.config;return !!this.containerInstance&&(!e.closePredicate||e.closePredicate(i,e,this.componentInstance))}},ki=new T("DialogScrollStrategy",{providedIn:"root",factory:()=>{let n=g(re);return ()=>ae$1(n)}}),Di=new T("DialogData"),Pi=new T("DefaultDialogConfig");function Ti(n){let i=tn(n),e=new We;return {valueSignal:i,get value(){return i()},change:e,ngOnDestroy(){e.complete();}}}var Tn=(()=>{class n{_injector=g(re);_defaultOptions=g(Pi,{optional:true});_parentDialog=g(n,{optional:true,skipSelf:true});_overlayContainer=g(_e);_idGenerator=g(wn);_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new ee;_afterOpenedAtThisLevel=new ee;_ariaHiddenElements=new Map;_scrollStrategy=g(ki);get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}afterAllClosed=Vm(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(ey(void 0)));open(e,t){let a=this._defaultOptions||new Te;t=j$1(j$1({},a),t),t.id=t.id||this._idGenerator.getId("cdk-dialog-"),t.id&&this.getDialogById(t.id);let o=this._getOverlayConfig(t),s=st(this._injector,o),l=new ft(s,t),h=this._attachContainer(s,l,t);if(l.containerInstance=h,!this.openDialogs.length){let g=this._overlayContainer.getContainerElement();h._focusTrapped?h._focusTrapped.pipe(Tn$1(1)).subscribe(()=>{this._hideNonDialogContentFromAssistiveTechnology(g);}):this._hideNonDialogContentFromAssistiveTechnology(g);}return this._attachDialogContent(e,l,h,t),this.openDialogs.push(l),l.closed.subscribe(()=>this._removeOpenDialog(l,true)),this.afterOpened.next(l),l}closeAll(){Dn(this.openDialogs,e=>e.close());}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){Dn(this._openDialogsAtThisLevel,e=>{e.config.closeOnDestroy===false&&this._removeOpenDialog(e,false);}),Dn(this._openDialogsAtThisLevel,e=>e.close()),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete(),this._openDialogsAtThisLevel=[];}_getOverlayConfig(e){let t=new q$1({positionStrategy:e.positionStrategy||ue$1().centerHorizontally().centerVertically(),scrollStrategy:e.scrollStrategy||this._scrollStrategy(),panelClass:e.panelClass,hasBackdrop:e.hasBackdrop,direction:e.direction,minWidth:e.minWidth,minHeight:e.minHeight,maxWidth:e.maxWidth,maxHeight:e.maxHeight,width:e.width,height:e.height,disposeOnNavigation:e.closeOnNavigation,disableAnimations:e.disableAnimations});return e.backdropClass&&(t.backdropClass=e.backdropClass),t}_attachContainer(e,t,a){let o=a.injector||a.viewContainerRef?.injector,s=[{provide:Te,useValue:a},{provide:ft,useValue:t},{provide:J,useValue:e}],l;a.container?typeof a.container=="function"?l=a.container:(l=a.container.type,s.push(...a.container.providers(a))):l=Pn;let h=new V(l,a.viewContainerRef,re.create({parent:o||this._injector,providers:s}));return e.attach(h).instance}_attachDialogContent(e,t,a,o){if(e instanceof zn$1){let s=this._createInjector(o,t,a,void 0),l={$implicit:o.data,dialogRef:t};o.templateContext&&(l=j$1(j$1({},l),typeof o.templateContext=="function"?o.templateContext():o.templateContext)),a.attachTemplatePortal(new B(e,null,l,s));}else {let s=this._createInjector(o,t,a,this._injector),l=a.attachComponentPortal(new V(e,o.viewContainerRef,s,null,o.bindings));t.componentRef=l,t.componentInstance=l.instance;}}_createInjector(e,t,a,o){let s=e.injector||e.viewContainerRef?.injector,l=[{provide:Di,useValue:e.data},{provide:ft,useValue:t}];return e.providers&&(typeof e.providers=="function"?l.push(...e.providers(t,e,a)):l.push(...e.providers)),e.direction&&(!s||!s.get(jo$1,null,{optional:true}))&&l.push({provide:jo$1,useValue:Ti(e.direction)}),re.create({parent:s||o,providers:l})}_removeOpenDialog(e,t){let a=this.openDialogs.indexOf(e);a>-1&&(this.openDialogs.splice(a,1),this.openDialogs.length||(this._ariaHiddenElements.forEach((o,s)=>{o?s.setAttribute("aria-hidden",o):s.removeAttribute("aria-hidden");}),this._ariaHiddenElements.clear(),t&&this._getAfterAllClosed().next()));}_hideNonDialogContentFromAssistiveTechnology(e){if(e.parentElement){let t=e.parentElement.children;for(let a=t.length-1;a>-1;a--){let o=t[a];o!==e&&o.nodeName!=="SCRIPT"&&o.nodeName!=="STYLE"&&!o.hasAttribute("aria-live")&&!o.hasAttribute("popover")&&(this._ariaHiddenElements.set(o,o.getAttribute("aria-hidden")),o.setAttribute("aria-hidden","true"));}}}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ve({token:n,factory:n.\u0275fac})}return n})();function Dn(n,i){let e=n.length;for(;e--;)i(n[e]);}var Aa=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os({type:n});static \u0275inj=Dr$1({providers:[Tn],imports:[Rt,Jt,Ao$1,Jt]})}return n})();function Ei(n,i){}var ln=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;position;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;delayFocusTrap=true;scrollStrategy;closeOnNavigation=true;enterAnimationDuration;exitAnimationDuration;bindings},En="mdc-dialog--open",Ra="mdc-dialog--opening",La="mdc-dialog--closing",Si=150,Ii=75,Oi=(()=>{class n extends Pn{_animationStateChanged=new We;_animationsEnabled=!xe();_actionSectionCount=0;_hostElement=this._elementRef.nativeElement;_enterAnimationDuration=this._animationsEnabled?Fa(this._config.enterAnimationDuration)??Si:0;_exitAnimationDuration=this._animationsEnabled?Fa(this._config.exitAnimationDuration)??Ii:0;_animationTimer=null;_contentAttached(){super._contentAttached(),this._startOpenAnimation();}_startOpenAnimation(){this._animationStateChanged.emit({state:"opening",totalTime:this._enterAnimationDuration}),this._animationsEnabled?(this._hostElement.style.setProperty(Ba,`${this._enterAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(Ra,En)),this._waitForAnimationToComplete(this._enterAnimationDuration,this._finishDialogOpen)):(this._hostElement.classList.add(En),Promise.resolve().then(()=>this._finishDialogOpen()));}_startExitAnimation(){this._animationStateChanged.emit({state:"closing",totalTime:this._exitAnimationDuration}),this._hostElement.classList.remove(En),this._animationsEnabled?(this._hostElement.style.setProperty(Ba,`${this._exitAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(La)),this._waitForAnimationToComplete(this._exitAnimationDuration,this._finishDialogClose)):Promise.resolve().then(()=>this._finishDialogClose());}_updateActionSectionCount(e){this._actionSectionCount+=e,this._changeDetectorRef.markForCheck();}_finishDialogOpen=()=>{this._clearAnimationClasses(),this._openAnimationDone(this._enterAnimationDuration);};_finishDialogClose=()=>{this._clearAnimationClasses(),this._animationStateChanged.emit({state:"closed",totalTime:this._exitAnimationDuration});};_clearAnimationClasses(){this._hostElement.classList.remove(Ra,La);}_waitForAnimationToComplete(e,t){this._animationTimer!==null&&clearTimeout(this._animationTimer),this._animationTimer=setTimeout(t,e);}_requestAnimationFrame(e){this._ngZone.runOutsideAngular(()=>{typeof requestAnimationFrame=="function"?requestAnimationFrame(e):e();});}_captureInitialFocus(){this._config.delayFocusTrap||this._trapFocus();}_openAnimationDone(e){this._config.delayFocusTrap&&this._trapFocus(),this._animationStateChanged.next({state:"opened",totalTime:e});}ngOnDestroy(){super.ngOnDestroy(),this._animationTimer!==null&&clearTimeout(this._animationTimer);}attachComponentPortal(e){let t=super.attachComponentPortal(e);return t.location.nativeElement.classList.add("mat-mdc-dialog-component-host"),t}static \u0275fac=(()=>{let e;return function(a){return (e||(e=tp(n)))(a||n)}})();static \u0275cmp=hI({type:n,selectors:[["mat-dialog-container"]],hostAttrs:["tabindex","-1",1,"mat-mdc-dialog-container","mdc-dialog"],hostVars:10,hostBindings:function(t,a){t&2&&(Gh("id",a._config.id),Bh("aria-modal",a._config.ariaModal)("role",a._config.role)("aria-labelledby",a._config.ariaLabel?null:a._ariaLabelledByQueue[0])("aria-label",a._config.ariaLabel)("aria-describedby",a._config.ariaDescribedBy||null),rg("_mat-animation-noopable",!a._animationsEnabled)("mat-mdc-dialog-container-with-actions",a._actionSectionCount>0));},features:[Rh],decls:3,vars:0,consts:[[1,"mat-mdc-dialog-inner-container","mdc-dialog__container"],[1,"mat-mdc-dialog-surface","mdc-dialog__surface"],["cdkPortalOutlet",""]],template:function(t,a){t&1&&(zi$1(0,"div",0)(1,"div",1),kh(2,Ei,0,0,"ng-template",2),Ou()());},dependencies:[Ye],styles:[`.mat-mdc-dialog-container {
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
`],encapsulation:2,changeDetection:1})}return n})(),Ba="--mat-dialog-transition-duration";function Fa(n){return n==null?null:typeof n=="number"?n:n.endsWith("ms")?bn(n.substring(0,n.length-2)):n.endsWith("s")?bn(n.substring(0,n.length-1))*1e3:n==="0"?0:null}var sn=(function(n){return n[n.OPEN=0]="OPEN",n[n.CLOSING=1]="CLOSING",n[n.CLOSED=2]="CLOSED",n})(sn||{}),_t=class{_ref;_config;_containerInstance;componentInstance;componentRef=null;disableClose;id;_afterOpened=new cr$1(1);_beforeClosed=new cr$1(1);_result;_closeFallbackTimeout;_state=sn.OPEN;_closeInteractionType;constructor(i,e,t){this._ref=i,this._config=e,this._containerInstance=t,this.disableClose=e.disableClose,this.id=i.id,i.addPanelClass("mat-mdc-dialog-panel"),t._animationStateChanged.pipe(Vt(a=>a.state==="opened"),Tn$1(1)).subscribe(()=>{this._afterOpened.next(),this._afterOpened.complete();}),t._animationStateChanged.pipe(Vt(a=>a.state==="closed"),Tn$1(1)).subscribe(()=>{clearTimeout(this._closeFallbackTimeout),this._finishDialogClose();}),i.overlayRef.detachments().subscribe(()=>{this._beforeClosed.next(this._result),this._beforeClosed.complete(),this._finishDialogClose();}),Um(this.backdropClick(),this.keydownEvents().pipe(Vt(a=>a.keyCode===27&&!this.disableClose&&!Gr(a)))).subscribe(a=>{this.disableClose||(a.preventDefault(),Na(this,a.type==="keydown"?"keyboard":"mouse"));});}close(i){let e=this._config.closePredicate;e&&!e(i,this._config,this.componentInstance)||(this._result=i,this._containerInstance._animationStateChanged.pipe(Vt(t=>t.state==="closing"),Tn$1(1)).subscribe(t=>{this._beforeClosed.next(i),this._beforeClosed.complete(),this._ref.overlayRef.detachBackdrop(),this._closeFallbackTimeout=setTimeout(()=>this._finishDialogClose(),t.totalTime+100);}),this._state=sn.CLOSING,this._containerInstance._startExitAnimation());}afterOpened(){return this._afterOpened}afterClosed(){return this._ref.closed}beforeClosed(){return this._beforeClosed}backdropClick(){return this._ref.backdropClick}keydownEvents(){return this._ref.keydownEvents}updatePosition(i){let e=this._ref.config.positionStrategy;return i&&(i.left||i.right)?i.left?e.left(i.left):e.right(i.right):e.centerHorizontally(),i&&(i.top||i.bottom)?i.top?e.top(i.top):e.bottom(i.bottom):e.centerVertically(),this._ref.updatePosition(),this}updateSize(i="",e=""){return this._ref.updateSize(i,e),this}addPanelClass(i){return this._ref.addPanelClass(i),this}removePanelClass(i){return this._ref.removePanelClass(i),this}getState(){return this._state}_finishDialogClose(){this._state=sn.CLOSED,this._ref.close(this._result,{focusOrigin:this._closeInteractionType}),this.componentInstance=null;}};function Na(n,i,e){return n._closeInteractionType=i,n.close(e)}var Sn=new T("MatMdcDialogData"),Ai=new T("mat-mdc-dialog-default-options"),Ri=new T("mat-mdc-dialog-scroll-strategy",{providedIn:"root",factory:()=>{let n=g(re);return ()=>ae$1(n)}}),yt=(()=>{class n{_defaultOptions=g(Ai,{optional:true});_scrollStrategy=g(Ri);_parentDialog=g(n,{optional:true,skipSelf:true});_idGenerator=g(wn);_injector=g(re);_dialog=g(Tn);_animationsDisabled=xe();_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new ee;_afterOpenedAtThisLevel=new ee;dialogConfigClass=ln;_dialogRefConstructor;_dialogContainerType;_dialogDataToken;get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}afterAllClosed=Vm(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(ey(void 0)));constructor(){this._dialogRefConstructor=_t,this._dialogContainerType=Oi,this._dialogDataToken=Sn;}open(e,t){let a;t=j$1(j$1({},this._defaultOptions||new ln),t),t.id=t.id||this._idGenerator.getId("mat-mdc-dialog-"),t.scrollStrategy=t.scrollStrategy||this._scrollStrategy();let o=this._dialog.open(e,G(j$1({},t),{positionStrategy:ue$1(this._injector).centerHorizontally().centerVertically(),disableClose:true,closePredicate:void 0,closeOnDestroy:false,closeOnOverlayDetachments:false,disableAnimations:this._animationsDisabled||t.enterAnimationDuration?.toLocaleString()==="0"||t.exitAnimationDuration?.toString()==="0",container:{type:this._dialogContainerType,providers:()=>[{provide:this.dialogConfigClass,useValue:t},{provide:Te,useValue:t}]},templateContext:()=>({dialogRef:a}),providers:(s,l,h)=>(a=new this._dialogRefConstructor(s,t,h),a.updatePosition(t?.position),[{provide:this._dialogContainerType,useValue:h},{provide:this._dialogDataToken,useValue:l.data},{provide:this._dialogRefConstructor,useValue:a}])}));return a.componentRef=o.componentRef,a.componentInstance=o.componentInstance,this.openDialogs.push(a),this.afterOpened.next(a),a.afterClosed().subscribe(()=>{let s=this.openDialogs.indexOf(a);s>-1&&(this.openDialogs.splice(s,1),this.openDialogs.length||this._getAfterAllClosed().next());}),a}closeAll(){this._closeDialogs(this.openDialogs);}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){this._closeDialogs(this._openDialogsAtThisLevel),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete();}_closeDialogs(e){let t=e.length;for(;t--;)e[t].close();}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ve({token:n,factory:n.\u0275fac})}return n})(),za=(()=>{class n{dialogRef=g(_t,{optional:true});_elementRef=g(Yn);_dialog=g(yt);ariaLabel;type="button";dialogResult;_matDialogClose;ngOnInit(){this.dialogRef||(this.dialogRef=Ga(this._elementRef,this._dialog.openDialogs));}ngOnChanges(e){let t=e._matDialogClose;t&&(this.dialogResult=t.currentValue);}_onButtonClick(e){this._elementRef.nativeElement.getAttribute("aria-disabled")!=="true"&&Na(this.dialogRef,e.screenX===0&&e.screenY===0?"keyboard":"mouse",this.dialogResult);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["","mat-dialog-close",""],["","matDialogClose",""]],hostVars:2,hostBindings:function(t,a){t&1&&qh("click",function(s){return a._onButtonClick(s)}),t&2&&Bh("aria-label",a.ariaLabel||null)("type",a.type);},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],type:"type",dialogResult:[0,"mat-dialog-close","dialogResult"],_matDialogClose:[0,"matDialogClose","_matDialogClose"]},exportAs:["matDialogClose"],features:[$c]})}return n})(),Ha=(()=>{class n{_dialogRef=g(_t,{optional:true});_elementRef=g(Yn);_dialog=g(yt);ngOnInit(){this._dialogRef||(this._dialogRef=Ga(this._elementRef,this._dialog.openDialogs)),this._dialogRef&&Promise.resolve().then(()=>{this._onAdd();});}ngOnDestroy(){this._dialogRef?._containerInstance&&Promise.resolve().then(()=>{this._onRemove();});}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n})}return n})(),ja=(()=>{class n extends Ha{id=g(wn).getId("mat-mdc-dialog-title-");_onAdd(){this._dialogRef._containerInstance?._addAriaLabelledBy?.(this.id);}_onRemove(){this._dialogRef?._containerInstance?._removeAriaLabelledBy?.(this.id);}static \u0275fac=(()=>{let e;return function(a){return (e||(e=tp(n)))(a||n)}})();static \u0275dir=_u({type:n,selectors:[["","mat-dialog-title",""],["","matDialogTitle",""]],hostAttrs:[1,"mat-mdc-dialog-title","mdc-dialog__title"],hostVars:1,hostBindings:function(t,a){t&2&&Gh("id",a.id);},inputs:{id:"id"},exportAs:["matDialogTitle"],features:[Rh]})}return n})(),Va=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["","mat-dialog-content",""],["mat-dialog-content"],["","matDialogContent",""]],hostAttrs:[1,"mat-mdc-dialog-content","mdc-dialog__content"],features:[II([Ke])]})}return n})(),Wa=(()=>{class n extends Ha{align;_onAdd(){this._dialogRef._containerInstance?._updateActionSectionCount?.(1);}_onRemove(){this._dialogRef._containerInstance?._updateActionSectionCount?.(-1);}static \u0275fac=(()=>{let e;return function(a){return (e||(e=tp(n)))(a||n)}})();static \u0275dir=_u({type:n,selectors:[["","mat-dialog-actions",""],["mat-dialog-actions"],["","matDialogActions",""]],hostAttrs:[1,"mat-mdc-dialog-actions","mdc-dialog__actions"],hostVars:6,hostBindings:function(t,a){t&2&&rg("mat-mdc-dialog-actions-align-start",a.align==="start")("mat-mdc-dialog-actions-align-center",a.align==="center")("mat-mdc-dialog-actions-align-end",a.align==="end");},inputs:{align:"align"},features:[Rh]})}return n})();function Ga(n,i){let e=n.nativeElement.parentElement;for(;e&&!e.classList.contains("mat-mdc-dialog-container");)e=e.parentElement;return e?i.find(t=>t.id===e.id):null}var dn=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os({type:n});static \u0275inj=Dr$1({providers:[yt],imports:[Aa,Rt,Jt,Se]})}return n})();var cn=class n{data=g(Sn);static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-system-instructions-dialog"]],decls:9,vars:1,consts:[["mat-dialog-title",""],["tabindex","0","aria-label","System instructions text",1,"dialog-content-scrollable"],[1,"instructions-text"],["align","end"],["mat-button","","mat-dialog-close",""]],template:function(e,t){e&1&&(zi$1(0,"h2",0),Tw(1,"System Instructions"),Ou(),zi$1(2,"mat-dialog-content")(3,"div",1)(4,"pre",2),Tw(5),Ou()()(),zi$1(6,"mat-dialog-actions",3)(7,"button",4),Tw(8,"Close"),Ou()()),e&2&&(VD(5),ug(t.data));},dependencies:[dn,za,ja,Wa,Va,Cd,Ed],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-left:0!important;padding-right:0!important}.dialog-content-scrollable[_ngcontent-%COMP%]{margin:0 16px;max-height:400px;overflow-y:auto;background-color:var(--mat-sys-surface-container-high);padding:16px;border-radius:4px}.dialog-content-scrollable[_ngcontent-%COMP%]:focus{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.instructions-text[_ngcontent-%COMP%]{margin:0;font-family:Roboto Mono,Consolas,monospace;font-size:12px;line-height:1.5;white-space:pre-wrap;color:var(--mat-sys-on-surface)}"]})};function Bi(n,i){n&1&&(zi$1(0,"mat-icon",6),Tw(1,"error"),Ou());}function Fi(n,i){n&1&&Hh(0,"mat-spinner",7),n&2&&Vh("diameter",40);}function Ni(n,i){if(n&1){let e=qI();zi$1(0,"div",5),qh("click",function(){Rd(e);let a=YI();return Od(a.dismissOverlay())})("keydown.enter",function(){Rd(e);let a=YI();return Od(a.dismissOverlay())})("keydown.space",function(a){Rd(e);let o=YI();return a.preventDefault(),Od(o.dismissOverlay())}),FI(1,Bi,2,0,"mat-icon",6)(2,Fi,1,1,"mat-spinner",7),zi$1(3,"div",8),Tw(4),Ou()();}if(n&2){let e=YI();hw(e.pipelineStatus()),VD(),LI(e.pipelineStatus()==="failed"?1:2),VD(3),ug(e.pipelineStatusText());}}function zi(n,i){n&1&&(zi$1(0,"div",4)(1,"mat-icon",9),Tw(2,"vpn_key"),Ou(),zi$1(3,"p",10),Tw(4," This feature is only available with a valid Gemini API key. "),Ou(),zi$1(5,"a",11),Tw(6," Add Gemini API key "),Ou()());}function Hi(n,i){n&1&&(zi$1(0,"div",13)(1,"span",20),Tw(2,"\u{1F4AC}"),Ou(),zi$1(3,"p",21),Tw(4," Ask Gemini to shape your layout interfaces or generate dynamic mock configurations schemas. Let's get started! "),Ou()());}function ji(n,i){if(n&1&&(zi$1(0,"span",28),Tw(1),Ou()),n&2){let e=YI(2).$implicit;VD(),ug(e.isSnapshot?"Canvas Revision Snapshot":"You");}}function Vi(n,i){n&1&&(zi$1(0,"span",28),Tw(1,"Gemini AI"),Ou());}function Wi(n,i){if(n&1&&(zi$1(0,"div",24),FI(1,ji,2,1,"span",28)(2,Vi,2,0,"span",28),Ou()),n&2){let e=YI().$implicit;VD(),LI(e.role==="user"?1:e.role==="model"?2:-1);}}function Gi(n,i){if(n&1&&(zi$1(0,"p",26),Tw(1),Ou()),n&2){let e=YI().$implicit;VD(),ju("A2UI JSON: ",e.componentCount," components");}}function Ji(n,i){if(n&1&&(zi$1(0,"i"),Tw(1),Ou()),n&2){let e=YI().$implicit;VD(),ug(e.text);}}function $i(n,i){if(n&1&&Tw(0),n&2){let e=YI().$implicit;ju(" ",e.text," ");}}function Ui(n,i){if(n&1&&FI(0,Ji,2,1,"i")(1,$i,1,1),n&2){let e=i.$implicit;LI(e.isRedacted?0:1);}}function Qi(n,i){if(n&1&&(zi$1(0,"i"),Tw(1),Ou()),n&2){let e=YI().$implicit;VD(),ug(e.text);}}function qi(n,i){if(n&1&&Tw(0),n&2){let e=YI().$implicit;ju(" ",e.text," ");}}function Yi(n,i){if(n&1&&FI(0,Qi,2,1,"i")(1,qi,1,1),n&2){let e=i.$implicit;LI(e.isRedacted?0:1);}}function Ki(n,i){if(n&1&&(zi$1(0,"div",31),VI(1,Yi,2,1,null,null,jI),Ou()),n&2){let e=YI(2).$implicit,t=YI(3);VD(),HI(t.parseMessage(e.errorTip));}}function Zi(n,i){if(n&1&&(zi$1(0,"i"),Tw(1),Ou()),n&2){let e=YI().$implicit;VD(),ug(e.text);}}function Xi(n,i){if(n&1&&Tw(0),n&2){let e=YI().$implicit;ju(" ",e.text," ");}}function eo(n,i){if(n&1&&FI(0,Zi,2,1,"i")(1,Xi,1,1),n&2){let e=i.$implicit;LI(e.isRedacted?0:1);}}function to(n,i){if(n&1&&(zi$1(0,"details",32)(1,"summary"),Tw(2,"Technical Details"),Ou(),zi$1(3,"pre"),VI(4,eo,2,1,null,null,jI),Ou()()),n&2){let e=YI(2).$implicit,t=YI(3);VD(4),HI(t.parseMessage(e.errorDetails));}}function no(n,i){if(n&1){let e=qI();zi$1(0,"div",33)(1,"button",34),qh("click",function(){Rd(e);let a=YI(2).$implicit,o=YI(3);return Od(o.retryPrompt(a.originalPrompt||""))}),zi$1(2,"mat-icon",35),Tw(3,"refresh"),Ou(),Tw(4," Retry Request "),Ou()();}if(n&2){let e=YI(5);VD(),Vh("disabled",e.isLocked());}}function ao(n,i){if(n&1&&(zi$1(0,"div",27)(1,"div",29),Tw(2),Ou(),zi$1(3,"div",30),VI(4,Ui,2,1,null,null,jI),Ou(),FI(6,Ki,3,0,"div",31),FI(7,to,6,0,"details",32),FI(8,no,5,1,"div",33),Ou()),n&2){let e=YI().$implicit,t=YI(3);VD(2),ju("\u26A0 ",e.errorTitle||"Error"),VD(2),HI(t.parseMessage(e.errorMessage||e.content)),VD(2),LI(e.errorTip?6:-1),VD(),LI(e.errorDetails?7:-1),VD(),LI(e.isRetryable?8:-1);}}function io(n,i){if(n&1){let e=qI();zi$1(0,"div",33)(1,"button",34),qh("click",function(){Rd(e);let a=YI(2).$implicit,o=YI(3);return Od(o.retryPrompt(a.originalPrompt||""))}),zi$1(2,"mat-icon",35),Tw(3,"refresh"),Ou(),Tw(4," Retry Request "),Ou()();}if(n&2){let e=YI(5);VD(),Vh("disabled",e.isLocked());}}function oo(n,i){if(n&1&&(zi$1(0,"p",26),Tw(1),Ou(),FI(2,io,5,1,"div",33)),n&2){let e=YI().$implicit;VD(),ug(e.content),VD(),LI(e.isRetryable?2:-1);}}function ro(n,i){if(n&1&&(zi$1(0,"div",23),FI(1,Wi,3,1,"div",24),zi$1(2,"div",25),FI(3,Gi,2,1,"p",26)(4,ao,9,4,"div",27)(5,oo,3,2),Ou()()),n&2){let e=i.$implicit,t=YI(3);hw(t.getBubbleClass(e)),VD(),LI(e.role!=="error"?1:-1),VD(2),LI(e.isSnapshot?3:e.role==="error"?4:5);}}function so(n,i){if(n&1&&VI(0,ro,6,4,"div",22,jI),n&2){let e=YI(2);HI(e.visibleChatHistory());}}function lo(n,i){if(n&1){let e=qI();zi$1(0,"div",12),FI(1,Hi,5,0,"div",13)(2,so,2,0),Ou(),zi$1(3,"div",14)(4,"mat-form-field",15)(5,"textarea",16),qh("ngModelChange",function(a){Rd(e);let o=YI();return Od(o.userPrompt.set(a))})("keydown",function(a){Rd(e);let o=YI();return Od(o.onKeyDown(a))}),Ou(),_E(),Ou(),zi$1(6,"div",17)(7,"button",18),qh("click",function(){Rd(e);let a=YI();return Od(a.showSystemInstructions())}),Tw(8," Show system instructions "),Ou(),zi$1(9,"button",19),qh("click",function(){Rd(e);let a=YI();return Od(a.submitPrompt())}),Tw(10," Send "),Ou()()();}if(n&2){let e=YI();VD(),LI(e.visibleChatHistory().length===0?1:2),VD(4),Vh("ngModel",e.userPrompt())("disabled",e.isLocked()),ME(),VD(4),Vh("disabled",e.isLocked()||!e.isHandshakeComplete()||!e.userPrompt().trim());}}var mn=class n{chatCoordinator=g(rn);chatState=g(ae);dialog=g(yt);catalogManagement=g(oo$1);startupResolution=g(Qg);configProvider=g(ys);systemPrompt=this.chatCoordinator.systemPrompt;isHandshakeComplete=Gw(()=>this.catalogManagement.activeCatalog()!==null);isChatDisabled=Gw(()=>{let i=this.startupResolution.isThirdPartyEnvironment(),e=!this.configProvider.geminiApiKey();return i&&e});pipelineStatus=this.chatState.pipelineStatus;isLocked=this.chatState.isProgrammaticStreamActive;userPrompt=tn("");visibleChatHistory=Gw(()=>this.chatState.chatHistory().filter(i=>i.role!=="system").map(i=>{let e=this.isLayoutSnapshot(i.content);return e?G(j$1({},i),{isSnapshot:e,componentCount:this.getComponentCount(i.content)}):G(j$1({},i),{isSnapshot:e})}));pipelineStatusText=Gw(()=>{switch(this.pipelineStatus()){case "receiving_stream":return "Receiving A2UI JSON stream...";case "received_raw":return "Received A2UI JSON.";case "validating":return "Validating A2UI JSON catalog schemas...";case "healing":return "Fixing A2UI JSON (Self-repair loop active)...";case "ready":return "Raw A2UI JSON is ready.";case "failed":return "A2UI JSON validation failed.";default:return ""}});async submitPrompt(){let i=this.userPrompt().trim();!i||this.isLocked()||(this.userPrompt.set(""),await this.chatCoordinator.submitPrompt(i));}onKeyDown(i){i.key==="Enter"&&!i.shiftKey&&!i.isComposing&&(i.preventDefault(),this.submitPrompt());}getBubbleClass(i){return i.role==="user"?this.isLayoutSnapshot(i.content)?"bubble-user bubble-layout":"bubble-user bubble-text":i.role==="model"?"bubble-model":i.role==="error"?"bubble-error":""}isLayoutSnapshot(i){let e=i.trim();return e.startsWith('{"version"')||e.startsWith("[")&&e.endsWith("]")}getComponentCount(i){try{let e=i.trim(),t=nt(e);if(t)return t.reduce((s,l)=>s+this.getCommandComponentCount(l),0);let a=e.split(`
`).filter(s=>s.trim().length>0),o=0;for(let s of a)if(s.startsWith("{"))try{let l=JSON.parse(s);o+=this.getCommandComponentCount(l);}catch{}return o}catch{}return 0}getCommandComponentCount(i){if(!i||typeof i!="object"||Array.isArray(i))return 0;let e=i;if(e.updateComponents&&typeof e.updateComponents=="object"){let t=e.updateComponents;if(Array.isArray(t.components))return t.components.length}else if(e.createSurface)return 1;return 0}showSystemInstructions(){this.dialog.open(cn,{data:this.chatCoordinator.systemPrompt(),width:"600px"});}dismissOverlay(){this.chatState.setPipelineStatus("idle");}async retryPrompt(i){this.userPrompt.set(i),await this.submitPrompt();}parseMessage(i){if(!i)return [];let e="redacted for your protection",t=i.split(e),a=[];for(let o=0;o<t.length;o++)t[o]&&a.push({text:t[o],isRedacted:false}),o<t.length-1&&a.push({text:e,isRedacted:true});return a}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-chat-panel"]],decls:7,vars:2,consts:[[1,"preview-frame-container"],["role","button","tabindex","0","aria-label","Dismiss status overlay",1,"pipeline-overlay",3,"class"],[1,"frame-header"],[1,"panel-title-text"],[1,"disabled-chat-panel"],["role","button","tabindex","0","aria-label","Dismiss status overlay",1,"pipeline-overlay",3,"click","keydown.enter","keydown.space"],["aria-hidden","true",1,"status-icon","error-icon"],[3,"diameter"],[1,"status-badge-text"],["aria-hidden","true",1,"disabled-key-icon"],[1,"disabled-notice-text"],["mat-flat-button","","color","primary","routerLink","/settings",1,"add-key-button"],[1,"frame-body","chat-history-log"],[1,"empty-state-notice"],[1,"chat-controllers-panel"],["appearance","outline","subscriptSizing","dynamic",1,"prompt-form-field"],["matInput","","aria-label","Chat prompt","placeholder","Type instruction to shape your screen (e.g. 'Add a checkbox column')...","rows","2",3,"ngModelChange","keydown","ngModel","disabled"],[1,"submit-action-bar"],["mat-button","",1,"system-instructions-link",3,"click"],["mat-raised-button","","color","primary",1,"submit-button",3,"click","disabled"],[1,"empty-state-icon"],[1,"empty-state-text"],[1,"chat-bubble-container",3,"class"],[1,"chat-bubble-container"],[1,"bubble-header-bar"],[1,"bubble-body"],[1,"bubble-text-content"],[1,"error-bubble-content"],[1,"bubble-author-name"],[1,"error-title"],[1,"error-message"],[1,"error-tip"],[1,"error-details"],[1,"retry-action-container"],["mat-stroked-button","","color","primary",1,"retry-button",3,"click","disabled"],["aria-hidden","true"]],template:function(e,t){e&1&&(zi$1(0,"div",0),FI(1,Ni,5,4,"div",1),zi$1(2,"div",2)(3,"span",3),Tw(4,"Gemini Assistant"),Ou()(),FI(5,zi,7,0,"div",4)(6,lo,11,4),Ou()),e&2&&(VD(),LI(t.pipelineStatus()!=="idle"&&t.pipelineStatus()!=="ready"&&t.pipelineStatus()!=="failed"?1:-1),VD(4),LI(t.isChatDisabled()?5:6));},dependencies:[se,it$1,rn$2,on$2,Cd,Ed,fu,wi$1,lu,Rs,ii$1,ti$1,Gd,Hd,dn,xn],styles:[`[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;--app-success: #137333;--app-success-container: #e6f4ea;--app-on-success-container: #137333}.dark-theme[_nghost-%COMP%], .dark-theme   [_nghost-%COMP%]{--app-success: #81c784;--app-success-container: #132b19;--app-on-success-container: #a3e9a4}.dark-theme[_nghost-%COMP%]   .prompt-form-field[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]{--mdc-outlined-text-field-outline-color: rgba(255, 255, 255, .2) !important;--mdc-outlined-text-field-hover-outline-color: rgba(255, 255, 255, .3) !important}.preview-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;height:100%;box-sizing:border-box;border:1px solid var(--mat-sys-outline-variant);border-radius:8px;background-color:var(--mat-sys-surface);box-shadow:0 2px 4px #0000000d;overflow:hidden;min-width:0;position:relative}.frame-header[_ngcontent-%COMP%]{padding:12px 16px;background-color:var(--mat-sys-surface-container);border-bottom:1px solid var(--mat-sys-outline-variant);font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);display:flex;align-items:center;flex-shrink:0}.panel-title-text[_ngcontent-%COMP%]{font-size:14px;font-weight:500;color:var(--mat-sys-on-surface)}.frame-body[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;overflow:auto;box-sizing:border-box;min-height:0}.chat-history-log[_ngcontent-%COMP%]{flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:16px}.empty-state-notice[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;text-align:center;padding:32px;color:var(--mat-sys-on-surface-variant)}.empty-state-notice[_ngcontent-%COMP%]   .empty-state-icon[_ngcontent-%COMP%]{font-size:48px;margin-bottom:16px}.empty-state-notice[_ngcontent-%COMP%]   .empty-state-text[_ngcontent-%COMP%]{font-size:14px;line-height:1.5;margin:0;max-width:240px}.chat-bubble-container[_ngcontent-%COMP%]{display:flex;gap:8px;max-width:85%;align-items:flex-start;animation:_ngcontent-%COMP%_fadeInBubble .2s ease-out}.chat-bubble-container[_ngcontent-%COMP%]   .bubble-header-bar[_ngcontent-%COMP%]{font-size:11px;font-weight:500;margin-bottom:4px;opacity:.8}.chat-bubble-container[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{padding:10px 12px;font-size:13px;line-height:1.45;box-shadow:0 1px 2px #0000000d}@keyframes _ngcontent-%COMP%_fadeInBubble{0%{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.bubble-avatar-box[_ngcontent-%COMP%]{width:28px;height:28px;border-radius:50%;background-color:var(--mat-sys-surface-container-high);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--mat-sys-outline-variant);font-size:14px}.bubble-user[_ngcontent-%COMP%]{align-self:flex-end;flex-direction:row-reverse}.bubble-user[_ngcontent-%COMP%]   .bubble-header-bar[_ngcontent-%COMP%]{text-align:right}.bubble-user[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container);border-radius:12px 0 12px 12px;border:1px solid var(--mat-sys-outline-variant)}.bubble-user.bubble-layout[_ngcontent-%COMP%]{max-width:90%;align-self:center;flex-direction:row}.bubble-user.bubble-layout[_ngcontent-%COMP%]   .bubble-avatar-box[_ngcontent-%COMP%]{display:none}.bubble-user.bubble-layout[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);border:1px dashed var(--mat-sys-outline);color:var(--mat-sys-on-surface-variant);border-radius:8px;padding:8px 12px;box-shadow:none;width:100%}.bubble-model[_ngcontent-%COMP%]{align-self:flex-start}.bubble-model[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);color:var(--mat-sys-on-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:0 12px 12px}.bubble-model[_ngcontent-%COMP%]   .bubble-text-content[_ngcontent-%COMP%]{margin:0;white-space:pre-wrap}.bubble-error[_ngcontent-%COMP%]{align-self:flex-start;max-width:100%;word-break:break-word;word-wrap:break-word}.bubble-error[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border:1px solid var(--mat-sys-error);border-radius:12px;padding:12px;font-size:var(--mat-sys-body-medium-size);line-height:var(--mat-sys-body-medium-line-height)}.bubble-error[_ngcontent-%COMP%]   .error-title[_ngcontent-%COMP%]{font-weight:var(--mat-sys-title-small-weight);margin-bottom:6px;color:var(--mat-sys-error)}.bubble-error[_ngcontent-%COMP%]   .error-message[_ngcontent-%COMP%]{margin-bottom:8px;font-size:var(--mat-sys-body-small-size);line-height:var(--mat-sys-body-small-line-height)}.bubble-error[_ngcontent-%COMP%]   .error-tip[_ngcontent-%COMP%]{font-style:italic;font-size:var(--mat-sys-body-small-size);opacity:.9;margin-bottom:8px}.bubble-error[_ngcontent-%COMP%]   .error-details[_ngcontent-%COMP%]{margin-top:8px;word-break:break-word;word-wrap:break-word}.bubble-error[_ngcontent-%COMP%]   .error-details[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%]{font-size:var(--mat-sys-label-small-size);font-weight:var(--mat-sys-label-small-weight);cursor:pointer;color:var(--mat-sys-error);-webkit-user-select:none;user-select:none;outline:none}.bubble-error[_ngcontent-%COMP%]   .error-details[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%]:hover{text-decoration:underline}.bubble-error[_ngcontent-%COMP%]   .error-details[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{margin:6px 0 0;padding:8px;background-color:color-mix(in srgb,var(--mat-sys-error-container) 95%,black);border:1px solid color-mix(in srgb,var(--mat-sys-error) 30%,transparent);border-radius:4px;font-family:Roboto Mono,Consolas,monospace;font-size:var(--mat-sys-body-small-size);line-height:var(--mat-sys-body-small-line-height);white-space:pre-wrap;word-break:break-word;word-wrap:break-word;max-height:160px;overflow-y:auto}.streaming-pulse-indicator[_ngcontent-%COMP%]{display:inline-block;font-size:10px;color:var(--mat-sys-outline);animation:_ngcontent-%COMP%_pulsePulse 1.2s infinite ease-in-out;margin-top:4px}@keyframes _ngcontent-%COMP%_pulsePulse{0%,to{opacity:.3}50%{opacity:1}}.chat-controllers-panel[_ngcontent-%COMP%]{padding:12px 8px;background-color:var(--mat-sys-surface-container-high);border-top:1px solid var(--mat-sys-outline-variant);display:flex;flex-direction:column;gap:8px;z-index:10;flex-shrink:0}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]{width:100%;--mdc-outlined-text-field-container-shape: 20px !important;--mdc-outlined-text-field-outline-color: rgba(0, 0, 0, .12) !important;--mdc-outlined-text-field-focus-outline-color: var(--mat-sys-primary) !important;--mdc-outlined-text-field-hover-outline-color: rgba(0, 0, 0, .2) !important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]     .mdc-notched-outline__leading, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]     .mdc-notched-outline__notch, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]     .mdc-notched-outline__trailing{border-color:var(--mat-sys-outline-variant)!important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field.mat-focused[_ngcontent-%COMP%]     .mdc-notched-outline__leading, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field.mat-focused[_ngcontent-%COMP%]     .mdc-notched-outline__notch, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field.mat-focused[_ngcontent-%COMP%]     .mdc-notched-outline__trailing{border-color:var(--mat-sys-primary)!important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{font-size:13px;line-height:1.4;resize:none;overflow-y:hidden!important;scrollbar-width:none!important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]::-webkit-scrollbar{display:none!important}.chat-controllers-panel[_ngcontent-%COMP%]   .submit-action-bar[_ngcontent-%COMP%]{display:flex;justify-content:space-between!important;align-items:center;width:100%}.chat-controllers-panel[_ngcontent-%COMP%]   .system-instructions-link[_ngcontent-%COMP%]{font-size:13px;color:var(--mat-sys-primary);text-decoration:none;cursor:pointer;font-weight:500}.chat-controllers-panel[_ngcontent-%COMP%]   .submit-button[_ngcontent-%COMP%]{font-size:13px;font-weight:500}.pipeline-overlay[_ngcontent-%COMP%]{position:absolute;top:0;left:0;width:100%;height:100%;background-color:color-mix(in srgb,var(--mat-sys-surface) 85%,transparent);-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:100;animation:_ngcontent-%COMP%_fadeInOverlay .15s ease-out}.pipeline-overlay[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{font-size:13px;font-weight:500;color:var(--mat-sys-primary);text-align:center;padding:0 24px;animation:_ngcontent-%COMP%_pulseText 1.5s infinite ease-in-out}.pipeline-overlay[_ngcontent-%COMP%]   mat-spinner[_ngcontent-%COMP%]     circle{stroke:var(--mat-sys-primary)!important}.pipeline-overlay[_ngcontent-%COMP%]   .status-icon[_ngcontent-%COMP%]{font-size:40px;width:40px;height:40px;display:flex;align-items:center;justify-content:center}.pipeline-overlay[_ngcontent-%COMP%]   .status-icon.success-icon[_ngcontent-%COMP%]{color:var(--app-success)}.pipeline-overlay[_ngcontent-%COMP%]   .status-icon.error-icon[_ngcontent-%COMP%]{color:var(--mat-sys-error)}.pipeline-overlay.healing[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--mat-sys-tertiary-container) 88%,transparent)}.pipeline-overlay.healing[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--mat-sys-on-tertiary-container)}.pipeline-overlay.healing[_ngcontent-%COMP%]   mat-spinner[_ngcontent-%COMP%]     circle{stroke:var(--mat-sys-tertiary)!important}.pipeline-overlay.validating[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--mat-sys-primary-container) 88%,transparent)}.pipeline-overlay.validating[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--mat-sys-on-primary-container)}.pipeline-overlay.validating[_ngcontent-%COMP%]   mat-spinner[_ngcontent-%COMP%]     circle{stroke:var(--mat-sys-primary)!important}.pipeline-overlay.ready[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--app-success-container) 90%,transparent)}.pipeline-overlay.ready[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--app-on-success-container);animation:none}.pipeline-overlay.failed[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--mat-sys-error-container) 90%,transparent)}.pipeline-overlay.failed[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--mat-sys-error);animation:none}@keyframes _ngcontent-%COMP%_fadeInOverlay{0%{opacity:0}to{opacity:1}}@keyframes _ngcontent-%COMP%_pulseText{0%,to{opacity:.7}50%{opacity:1}}.retry-action-container[_ngcontent-%COMP%]{margin-top:12px;display:flex;justify-content:flex-start}.retry-button[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:8px;font-size:12px!important;height:32px!important;line-height:32px!important;padding:0 12px!important;border-color:var(--mat-sys-outline-variant)!important;background-color:var(--mat-sys-surface-container-lowest)!important;color:var(--mat-sys-primary)!important}.retry-button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:16px!important;width:16px!important;height:16px!important}.layout-snapshot-badge[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:var(--mat-sys-on-surface-variant)}.layout-snapshot-badge[_ngcontent-%COMP%]   .badge-label[_ngcontent-%COMP%]{font-weight:500}.layout-snapshot-badge[_ngcontent-%COMP%]   .badge-count[_ngcontent-%COMP%]{opacity:.7;font-size:12px}.disabled-chat-panel[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;text-align:center;padding:32px;background-color:var(--mat-sys-surface-container-low);box-sizing:border-box}.disabled-chat-panel[_ngcontent-%COMP%]   .disabled-key-icon[_ngcontent-%COMP%]{font-size:48px;width:48px;height:48px;margin-bottom:16px;color:var(--mat-sys-outline)}.disabled-chat-panel[_ngcontent-%COMP%]   .disabled-notice-text[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-medium-size);line-height:1.5;margin:0 0 24px;max-width:260px;color:var(--mat-sys-on-surface-variant)}















`]})};var qa=new T("IS_EXTENSION_MODE",{providedIn:"root",factory:()=>tn(false)});function co(n,i){n&1&&(zi$1(0,"div",1),Tw(1,"\u26A0\uFE0F Invalid JSON syntax detected."),Ou());}var pn=class n{isExtensionMode=g(qa);layoutJson;isJsonInvalid=tn(false);TEST_ONLY={layoutJson:()=>this.layoutJson,isJsonInvalid:()=>this.isJsonInvalid};hostCommunication=g(Xt);catalogManagement=g(oo$1);stateSync=g(at);chatState=g(ae);destroyRef=g(Le);layoutInput$=new ee;isLocked=this.chatState.isProgrammaticStreamActive;constructor(){this.layoutJson=tn(this.stateSync.hydrateActiveDraft()),Jd(()=>{if(this.catalogManagement.activeCatalog()){let e=mg(()=>this.layoutJson());try{let t=this.parseLayoutString(e);t!==null&&this.hostCommunication.sendRenderA2UI(t);}catch{}}}),Jd(()=>{let i=this.stateSync.activeDraft();mg(()=>{this.layoutJson()!==i&&queueMicrotask(()=>{this.layoutJson.set(i);try{let e=this.parseLayoutString(i);e!==null?(this.isJsonInvalid.set(!1),this.hostCommunication.sendRenderA2UI(e)):this.isJsonInvalid.set(!0);}catch{this.isJsonInvalid.set(true);}});});}),this.layoutInput$.pipe(zm(300),se$1(i=>{try{let e=this.parseLayoutString(i);return e!==null?(this.isJsonInvalid.set(!1),e):(this.isJsonInvalid.set(!0),null)}catch{return this.isJsonInvalid.set(true),null}}),Vt(i=>i!==null),$i$1(this.destroyRef)).subscribe(i=>{this.hostCommunication.sendRenderA2UI(i);});}onLayoutChange(i){this.layoutJson.set(i),this.layoutInput$.next(i),this.stateSync.updateDraft(i);}parseLayoutString(i){let e=i.trim();if(!e)return [];if(e.startsWith("[")){let a=nt(e);if(a===null)throw new SyntaxError("Invalid JSON Array");return a}return e.split(`
`).map(a=>a.trim()).filter(a=>a.length>0).map(a=>JSON.parse(a))}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-raw-frame"]],decls:4,vars:7,consts:[[1,"raw-frame-container"],[1,"invalid-json-badge"],["appearance","outline","subscriptSizing","dynamic",1,"raw-json-field"],["matInput","","aria-label","Raw layout JSON","placeholder","Enter raw JSON here...",3,"ngModelChange","ngModel","readOnly"]],template:function(e,t){e&1&&(zi$1(0,"div",0),FI(1,co,2,0,"div",1),zi$1(2,"mat-form-field",2)(3,"textarea",3),qh("ngModelChange",function(o){return t.onLayoutChange(o)}),Ou(),_E(),Ou()()),e&2&&(rg("is-collapsed",t.isExtensionMode())("is-locked",t.isLocked()),VD(),LI(t.isJsonInvalid()?1:-1),VD(2),Vh("ngModel",t.layoutJson())("readOnly",t.isLocked()),ME());},dependencies:[se,it$1,rn$2,on$2,fu,wi$1,lu,Rs],styles:["[_nghost-%COMP%]{flex:1;display:block;width:100%;height:100%}.raw-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;padding:0;height:100%;box-sizing:border-box;transition:all .3s ease}.raw-frame-container.is-locked[_ngcontent-%COMP%]{opacity:.55;pointer-events:none;cursor:not-allowed}.raw-frame-container.is-locked[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{cursor:not-allowed}.raw-frame-container[_ngcontent-%COMP%]   .invalid-json-badge[_ngcontent-%COMP%]{color:#f44336;font-weight:700;padding:8px 0}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]{width:100%;height:100%;flex:1 1 auto;display:block}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mdc-notched-outline{display:none!important}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mat-mdc-text-field-wrapper{height:100%;padding-right:0}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mat-mdc-form-field-flex{height:100%;background-color:transparent;padding:0}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mat-mdc-form-field-infix{height:100%;display:flex;flex-direction:column;box-sizing:border-box;padding-top:0}.raw-frame-container[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{font-family:monospace;resize:none;flex:1 1 auto;height:100%;width:100%;box-sizing:border-box;border:none;outline:none;background:transparent}.raw-frame-container.is-collapsed[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]{font-size:12px}.raw-frame-container.is-collapsed[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mat-mdc-form-field-flex{padding:0}.raw-frame-container.is-collapsed[_ngcontent-%COMP%]   .raw-json-field[_ngcontent-%COMP%]     .mat-mdc-form-field-infix{padding-top:0}"]})};function mo(n,i){n&1&&(zi$1(0,"div",1),Tw(1,"\u26A0\uFE0F Invalid JSON syntax detected."),Ou());}var un=class n{hostComm=g(Xt);lastSurfaceId="sample-surface";lastPath=void 0;latestModelValue=tn(null);dataModelJson=qw({source:this.latestModelValue,computation:i=>i===null?"":typeof i=="string"?i:JSON.stringify(i,null,2)});isJsonInvalid=Gw(()=>{let i=this.dataModelJson();if(!i)return  false;try{return JSON.parse(i),!1}catch{return  true}});constructor(){Jd(()=>{let i=this.hostComm.messageStream();if(i?.type===E.DATA_MODEL_CHANGE){let t=i?.payload?.updateDataModel;if(t){typeof t.surfaceId=="string"&&(this.lastSurfaceId=t.surfaceId),typeof t.path=="string"?this.lastPath=t.path:this.lastPath=void 0;let a=t.value;mg(()=>this.latestModelValue.set(a));}}}),Tu(this.dataModelJson).pipe(zm(300),Wm(),Vt(i=>{try{return JSON.parse(i),!0}catch{return  false}})).subscribe(i=>{let e=JSON.parse(i),t=this.latestModelValue(),a=t?JSON.stringify(t):"",o=JSON.stringify(e);a!==o&&this.hostComm.sendMessage({type:E.DATA_MODEL_CHANGE,payload:{updateDataModel:{surfaceId:this.lastSurfaceId,path:this.lastPath,value:e}}});});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-data-model"]],decls:4,vars:2,consts:[[1,"data-model-container"],[1,"invalid-json-badge"],["appearance","outline","subscriptSizing","dynamic",1,"data-model-field"],["matInput","","aria-label","Data model JSON","placeholder","Enter data model JSON here...",3,"ngModelChange","ngModel"]],template:function(e,t){e&1&&(zi$1(0,"div",0),FI(1,mo,2,0,"div",1),zi$1(2,"mat-form-field",2)(3,"textarea",3),qh("ngModelChange",function(o){return t.dataModelJson.set(o)}),Ou(),_E(),Ou()()),e&2&&(VD(),LI(t.isJsonInvalid()?1:-1),VD(2),Vh("ngModel",t.dataModelJson()),ME());},dependencies:[se,it$1,rn$2,on$2,fu,wi$1,lu,Rs],styles:["[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;width:100%}.data-model-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;height:100%;width:100%;flex:1}.data-model-container[_ngcontent-%COMP%]   .invalid-json-badge[_ngcontent-%COMP%]{color:#f44336;font-weight:700;padding:8px 0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]{width:100%;flex:1;min-height:0;display:block}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mdc-notched-outline{display:none!important}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mat-mdc-text-field-wrapper{height:100%;padding-right:0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mat-mdc-form-field-flex{height:100%;background-color:transparent;padding:0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mat-mdc-form-field-infix{height:100%;display:flex;flex-direction:column;box-sizing:border-box;padding-top:0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{font-family:monospace;resize:none;flex:1 1 auto;height:100%;width:100%;box-sizing:border-box;border:none;outline:none;background:transparent}"]})};function ue(n){let i=new Date(n),e=String(i.getHours()).padStart(2,"0"),t=String(i.getMinutes()).padStart(2,"0"),a=String(i.getSeconds()).padStart(2,"0"),o=String(i.getMilliseconds()).padStart(3,"0");return `${e}:${t}:${a}.${o}`}function uo(n,i){n&1&&(zi$1(0,"th",12),Tw(1,"Time"),Ou());}function ho(n,i){if(n&1&&(zi$1(0,"td",13),Tw(1),Ou()),n&2){let e=i.$implicit;VD(),ug(e.time);}}function go(n,i){n&1&&(zi$1(0,"th",12),Tw(1,"Action Name"),Ou());}function bo(n,i){if(n&1&&(zi$1(0,"td",13),Tw(1),Ou()),n&2){let e=i.$implicit;VD(),ug(e.action);}}function fo(n,i){n&1&&(zi$1(0,"th",12),Tw(1,"Surface ID"),Ou());}function _o(n,i){if(n&1&&(zi$1(0,"td",13),Tw(1),Ou()),n&2){let e=i.$implicit;VD(),ug(e.surface);}}function yo(n,i){n&1&&(zi$1(0,"th",12),Tw(1,"Source Component"),Ou());}function vo(n,i){if(n&1&&(zi$1(0,"td",13),Tw(1),Ou()),n&2){let e=i.$implicit;VD(),ug(e.component);}}function xo(n,i){n&1&&(zi$1(0,"th",12),Tw(1,"Context"),Ou());}function Co(n,i){if(n&1&&(zi$1(0,"td",13)(1,"pre",14),Tw(2),Lw(3,"json"),Ou()()),n&2){let e=i.$implicit;VD(2),ug(Bw(3,1,e.context));}}function Mo(n,i){n&1&&Hh(0,"tr",15);}function wo(n,i){n&1&&Hh(0,"tr",16);}function ko(n,i){if(n&1&&(zi$1(0,"table",1),Fu(1,3),kh(2,uo,2,0,"th",4)(3,ho,2,1,"td",5),Lu(),Fu(4,6),kh(5,go,2,0,"th",4)(6,bo,2,1,"td",5),Lu(),Fu(7,7),kh(8,fo,2,0,"th",4)(9,_o,2,1,"td",5),Lu(),Fu(10,8),kh(11,yo,2,0,"th",4)(12,vo,2,1,"td",5),Lu(),Fu(13,9),kh(14,xo,2,0,"th",4)(15,Co,4,3,"td",5),Lu(),kh(16,Mo,1,0,"tr",10)(17,wo,1,0,"tr",11),Ou()),n&2){let e=YI();Vh("dataSource",e.eventsLog()),VD(16),Vh("matHeaderRowDef",e.displayedColumns),VD(),Vh("matRowDefColumns",e.displayedColumns);}}function Do(n,i){n&1&&(zi$1(0,"div",2),Tw(1,"No events captured yet"),Ou());}var it=class n{hostComm=g(Xt);eventsLog=tn([]);displayedColumns=["time","action","surface","component","context"];constructor(){Jd(()=>{let i=this.hostComm.messageStream();if(i?.type===E.SEND_TO_SERVER){let e=i?.payload;if(e&&e.action){let t=e.action;if(typeof t=="string")try{t=JSON.parse(t);}catch{}if(t&&typeof t=="object"){let a=t,o=a.timestamp||i.timestamp,s={time:ue(o),action:a.name||"",surface:a.surfaceId||"",component:a.sourceComponentId||a.sourceComponent||"",context:a.context||a.contextParameters||null};mg(()=>{this.eventsLog.update(l=>{let h=[s,...l];return h.length>100&&(h.length=100),h});});}}}});}clearLogs(){this.eventsLog.set([]);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-events"]],decls:3,vars:1,consts:[[1,"events-container"],["mat-table","",1,"mat-elevation-z1",3,"dataSource"],[1,"events-placeholder"],["matColumnDef","time"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","action"],["matColumnDef","surface"],["matColumnDef","component"],["matColumnDef","context"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","","class","element-row",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],[1,"context-preview"],["mat-header-row",""],["mat-row","",1,"element-row"]],template:function(e,t){e&1&&(zi$1(0,"div",0),FI(1,ko,18,3,"table",1)(2,Do,2,0,"div",2),Ou()),e&2&&(VD(),LI(t.eventsLog().length>0?1:2));},dependencies:[ln$1,Yi$1,Ji$1,rn$1,en,Zi$1,on$1,tn$1,nn,sn$1,an$1,RC],styles:["[_nghost-%COMP%]{display:block;height:100%;width:100%}.events-container[_ngcontent-%COMP%]{height:100%;width:100%;overflow:auto;box-sizing:border-box;padding:8px}.events-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mat-sys-on-surface-variant);font-size:14px}table[_ngcontent-%COMP%]{width:100%;background:var(--mat-sys-surface);border-radius:6px;overflow:hidden}table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{font-weight:700;color:var(--mat-sys-on-surface-variant);font-size:12px}table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface);vertical-align:middle}table[_ngcontent-%COMP%]   pre.context-preview[_ngcontent-%COMP%]{margin:0;font-family:monospace;font-size:11px;white-space:pre-wrap;background:var(--mat-sys-surface-container-lowest);padding:4px 8px;border-radius:4px;max-width:300px;overflow-x:auto}"]})};var Po=()=>["expandedDetail"];function To(n,i){n&1&&(zi$1(0,"th",13),Tw(1,"Time"),Ou());}function Eo(n,i){if(n&1&&(zi$1(0,"td",14),Tw(1),Ou()),n&2){let e=i.$implicit;VD(),ug(e.time);}}function So(n,i){n&1&&(zi$1(0,"th",13),Tw(1,"Level"),Ou());}function Io(n,i){if(n&1&&(zi$1(0,"td",14)(1,"span",15),Tw(2),Ou()()),n&2){let e=i.$implicit;VD(),hw(e.level),VD(),ug(e.level);}}function Oo(n,i){n&1&&(zi$1(0,"th",13),Tw(1,"Source"),Ou());}function Ao(n,i){if(n&1&&(zi$1(0,"td",14)(1,"span",16),Tw(2),Ou()()),n&2){let e=i.$implicit;VD(),hw(e.source),VD(),ug(e.source);}}function Ro(n,i){n&1&&(zi$1(0,"th",13),Tw(1,"Message"),Ou());}function Lo(n,i){if(n&1){let e=qI();zi$1(0,"button",20),qh("click",function(a){Rd(e);let o=YI().$implicit;return YI(2).toggleRow(o),Od(a.stopPropagation())}),zi$1(1,"mat-icon",21),Tw(2),Ou()();}if(n&2){let e=YI().$implicit,t=YI(2);VD(2),ug(t.isRowExpanded(e)?"keyboard_arrow_up":"keyboard_arrow_down");}}function Bo(n,i){if(n&1&&(zi$1(0,"td",14)(1,"div",17)(2,"span",18),Tw(3),Ou(),FI(4,Lo,3,1,"button",19),Ou()()),n&2){let e=i.$implicit;VD(3),ug(e.message),VD(),LI(e.stack?4:-1);}}function Fo(n,i){if(n&1&&(zi$1(0,"pre",23),Tw(1),Ou()),n&2){let e=YI().$implicit;VD(),ug(e.stack);}}function No(n,i){if(n&1&&(zi$1(0,"td",14)(1,"div",22),FI(2,Fo,2,1,"pre",23),Ou()()),n&2){let e=i.$implicit,t=YI(2);Bh("colspan",t.columnsToDisplay.length),VD(2),LI(e.stack?2:-1);}}function zo(n,i){n&1&&Hh(0,"tr",24);}function Ho(n,i){if(n&1&&Hh(0,"tr",25),n&2){let e=i.dataIndex;Bh("data-row-index",e);}}function jo(n,i){if(n&1&&Hh(0,"tr",26),n&2){let e=i.$implicit,t=YI(2);rg("expanded",t.isRowExpanded(e));}}function Vo(n,i){if(n&1&&(zi$1(0,"table",1),Fu(1,3),kh(2,To,2,0,"th",4)(3,Eo,2,1,"td",5),Lu(),Fu(4,6),kh(5,So,2,0,"th",4)(6,Io,3,3,"td",5),Lu(),Fu(7,7),kh(8,Oo,2,0,"th",4)(9,Ao,3,3,"td",5),Lu(),Fu(10,8),kh(11,Ro,2,0,"th",4)(12,Bo,5,2,"td",5),Lu(),Fu(13,9),kh(14,No,3,2,"td",5),Lu(),kh(15,zo,1,0,"tr",10)(16,Ho,1,1,"tr",11)(17,jo,1,2,"tr",12),Ou()),n&2){let e=YI();Vh("dataSource",e.errorsLog()),VD(15),Vh("matHeaderRowDef",e.columnsToDisplay),VD(),Vh("matRowDefColumns",e.columnsToDisplay),VD(),Vh("matRowDefColumns",kw(4,Po));}}function Wo(n,i){n&1&&(zi$1(0,"div",2),Tw(1,"No errors captured yet"),Ou());}var ot=class n{hostComm=g(Xt);errorsLog=tn([]);columnsToDisplay=["time","level","source","message"];expandedRows=tn(new Set);constructor(){Jd(()=>{let i=this.hostComm.messageStream();if(!i)return;let e=i.payload;if(e){if(i.type===E.CONSOLE_LOG){let t=e.message||"",a=t.includes("Unhandled Rejection")||t.includes("Uncaught")||!!e.stack,o=a?"exception":"console",s=a?"error":e.level||"log",l={time:ue(i.timestamp),source:o,level:s,message:t,stack:e.stack||void 0};mg(()=>{this.errorsLog.update(h=>{let g=[l,...h];return g.length>100&&(g.length=100),g});});}else if(i.type===E.DATA_MODEL_CHANGE&&e.validationErrors){let t=e.validationErrors;if(Array.isArray(t)?t.length>0:typeof t=="object"&&t!==null?Object.keys(t).length>0:!!t){let o="";Array.isArray(t)?o=t.map(l=>typeof l=="string"?l:JSON.stringify(l)).join(", "):typeof t=="object"?o=JSON.stringify(t):o=String(t);let s={time:ue(i.timestamp),source:"validation",level:"error",message:o,stack:void 0};mg(()=>{this.errorsLog.update(l=>{let h=[s,...l];return h.length>100&&(h.length=100),h});});}}}});}toggleRow(i){this.expandedRows.update(e=>{let t=new Set(e);return t.has(i)?t.delete(i):t.add(i),t});}isRowExpanded(i){return this.expandedRows().has(i)}clearLogs(){this.errorsLog.set([]),this.expandedRows.set(new Set);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-errors"]],decls:3,vars:1,consts:[[1,"errors-container"],["mat-table","","multiTemplateDataRows","",1,"mat-elevation-z1",3,"dataSource"],[1,"errors-placeholder"],["matColumnDef","time"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","level"],["matColumnDef","source"],["matColumnDef","message"],["matColumnDef","expandedDetail"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","","class","element-row",4,"matRowDef","matRowDefColumns"],["mat-row","","class","detail-row",3,"expanded",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],[1,"level-badge"],[1,"source-badge"],[1,"message-cell"],[1,"error-message-text"],["mat-icon-button","","aria-label","Toggle Stack Trace"],["mat-icon-button","","aria-label","Toggle Stack Trace",3,"click"],["aria-hidden","true"],[1,"element-detail"],[1,"stack-preview"],["mat-header-row",""],["mat-row","",1,"element-row"],["mat-row","",1,"detail-row"]],template:function(e,t){e&1&&(zi$1(0,"div",0),FI(1,Vo,18,5,"table",1)(2,Wo,2,0,"div",2),Ou()),e&2&&(VD(),LI(t.errorsLog().length>0?1:2));},dependencies:[ln$1,Yi$1,Ji$1,rn$1,en,Zi$1,on$1,tn$1,nn,sn$1,an$1,Cd,Uo$1,Gd,Hd],styles:["[_nghost-%COMP%]{display:block;height:100%;width:100%}.errors-container[_ngcontent-%COMP%]{height:100%;width:100%;overflow:auto;box-sizing:border-box;padding:2px 0 2px 8px}.errors-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mat-sys-on-surface-variant);font-size:14px}table[_ngcontent-%COMP%]{width:100%;background:var(--mat-sys-surface);border-radius:6px;overflow:hidden}table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{font-weight:700;color:var(--mat-sys-on-surface-variant);font-size:12px}table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface);vertical-align:middle}table[_ngcontent-%COMP%]   .source-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}table[_ngcontent-%COMP%]   .source-badge.exception[_ngcontent-%COMP%]{background-color:#ffdad6;color:#ba1a1a}table[_ngcontent-%COMP%]   .source-badge.console[_ngcontent-%COMP%]{background-color:#ffe082;color:#ff8f00}table[_ngcontent-%COMP%]   .source-badge.validation[_ngcontent-%COMP%]{background-color:#e8f5e9;color:#2e7d32}table[_ngcontent-%COMP%]   .level-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}table[_ngcontent-%COMP%]   .level-badge.error[_ngcontent-%COMP%]{background-color:#ffdad6;color:#ba1a1a}table[_ngcontent-%COMP%]   .level-badge.warn[_ngcontent-%COMP%]{background-color:#ffe082;color:#ff8f00}table[_ngcontent-%COMP%]   .level-badge.info[_ngcontent-%COMP%]{background-color:#e8f0fe;color:#1a73e8}table[_ngcontent-%COMP%]   .level-badge.debug[_ngcontent-%COMP%], table[_ngcontent-%COMP%]   .level-badge.log[_ngcontent-%COMP%]{background-color:#f1f3f4;color:#5f6368}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   .error-message-text[_ngcontent-%COMP%]{flex:1;white-space:normal;word-break:break-word}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{width:28px;height:28px;line-height:28px}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]     .mat-mdc-button-touch-target{display:none}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:18px;width:18px;height:18px}table[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]{height:0;display:none}table[_ngcontent-%COMP%]   .detail-row.expanded[_ngcontent-%COMP%]{display:table-row;height:auto}table[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{border-bottom-width:0;padding:0}table[_ngcontent-%COMP%]   .element-detail[_ngcontent-%COMP%]{overflow:hidden;box-sizing:border-box;background:var(--mat-sys-surface-container-lowest)}table[_ngcontent-%COMP%]   .element-detail[_ngcontent-%COMP%]   pre.stack-preview[_ngcontent-%COMP%]{margin:8px;font-family:monospace;font-size:11px;white-space:pre-wrap;word-break:break-all;color:var(--mat-sys-error);padding:8px;border-left:3px solid var(--mat-sys-error);background:#ba1a1a0d;border-radius:0 4px 4px 0}"]})};var Ya=new T("CdkAccordion");var Ka=(()=>{class n{accordion=g(Ya,{optional:true,skipSelf:true});_changeDetectorRef=g(gC);_expansionDispatcher=g(H$1);_openCloseAllSubscription=H.EMPTY;closed=new We;opened=new We;destroyed=new We;expandedChange=new We;id=g(wn).getId("cdk-accordion-child-");get expanded(){return this._expanded}set expanded(e){if(this._expanded!==e){if(this._expanded=e,this.expandedChange.emit(e),e){this.opened.emit();let t=this.accordion?this.accordion.id:this.id;this._expansionDispatcher.notify(this.id,t);}else this.closed.emit();this._changeDetectorRef.markForCheck();}}_expanded=false;get disabled(){return this._disabled()}set disabled(e){this._disabled.set(e);}_disabled=tn(false);_removeUniqueSelectionListener=()=>{};ngOnInit(){this._removeUniqueSelectionListener=this._expansionDispatcher.listen((e,t)=>{this.accordion&&!this.accordion.multi&&this.accordion.id===t&&this.id!==e&&(this.expanded=false);}),this.accordion&&(this._openCloseAllSubscription=this._subscribeToOpenCloseAllActions());}ngOnDestroy(){this.opened.complete(),this.closed.complete(),this.destroyed.emit(),this.destroyed.complete(),this._removeUniqueSelectionListener(),this._openCloseAllSubscription.unsubscribe();}toggle(){this.disabled||(this.expanded=!this.expanded);}close(){this.disabled||(this.expanded=false);}open(){this.disabled||(this.expanded=true);}_subscribeToOpenCloseAllActions(){return this.accordion._openCloseAllActions.subscribe(e=>{this.disabled||(this.expanded=e);})}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["cdk-accordion-item"],["","cdkAccordionItem",""]],inputs:{expanded:[2,"expanded","expanded",x1],disabled:[2,"disabled","disabled",x1]},outputs:{closed:"closed",opened:"opened",destroyed:"destroyed",expandedChange:"expandedChange"},exportAs:["cdkAccordionItem"],features:[Ow([{provide:Ya,useValue:void 0}])]})}return n})(),Za=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os({type:n});static \u0275inj=Dr$1({})}return n})();var Go=["body"],Jo=["bodyWrapper"],$o=[[["mat-expansion-panel-header"]],"*",[["mat-action-row"]]],Uo=["mat-expansion-panel-header","*","mat-action-row"];function Qo(n,i){}var qo=[[["mat-panel-title"]],[["mat-panel-description"]],"*"],Yo=["mat-panel-title","mat-panel-description","*"];function Ko(n,i){n&1&&(ku(0,"span",1),Gd$1(),ku(1,"svg",2),Uh(2,"path",3),Pu()());}var Xa=new T("MAT_ACCORDION"),ei=new T("MAT_EXPANSION_PANEL"),Zo=(()=>{class n{_template=g(zn$1);_expansionPanel=g(ei,{optional:true});static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["ng-template","matExpansionPanelContent",""]]})}return n})(),ti=new T("MAT_EXPANSION_PANEL_DEFAULT_OPTIONS"),Rn=(()=>{class n extends Ka{_viewContainerRef=g(Kn);_animationsDisabled=xe();_document=g(W);_ngZone=g(K);_elementRef=g(Yn);_renderer=g(ah);_cleanupTransitionEnd;get hideToggle(){return this._hideToggle||this.accordion&&this.accordion.hideToggle}set hideToggle(e){this._hideToggle=e;}_hideToggle=false;get togglePosition(){return this._togglePosition||this.accordion&&this.accordion.togglePosition}set togglePosition(e){this._togglePosition=e;}_togglePosition;afterExpand=new We;afterCollapse=new We;_inputChanges=new ee;accordion=g(Xa,{optional:true,skipSelf:true});_lazyContent;_body;_bodyWrapper;_portal;_headerId=g(wn).getId("mat-expansion-panel-header-");constructor(){super();let e=g(ti,{optional:true});this._expansionDispatcher=g(H$1),e&&(this.hideToggle=e.hideToggle);}_hasSpacing(){return this.accordion?this.expanded&&this.accordion.displayMode==="default":false}_getExpandedState(){return this.expanded?"expanded":"collapsed"}toggle(){this.expanded=!this.expanded;}close(){this.expanded=false;}open(){this.expanded=true;}ngAfterContentInit(){this._lazyContent&&this._lazyContent._expansionPanel===this&&this.opened.pipe(ey(null),Vt(()=>this.expanded&&!this._portal),Tn$1(1)).subscribe(()=>{this._portal=new B(this._lazyContent._template,this._viewContainerRef);}),this._setupAnimationEvents();}ngOnChanges(e){this._inputChanges.next(e);}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTransitionEnd?.(),this._inputChanges.complete();}_containsFocus(){if(this._body){let e=this._document.activeElement,t=this._body.nativeElement;return e===t||t.contains(e)}return  false}_transitionEndListener=({target:e,propertyName:t})=>{e===this._bodyWrapper?.nativeElement&&t==="grid-template-rows"&&this._ngZone.run(()=>{this.expanded?this.afterExpand.emit():this.afterCollapse.emit();});};_setupAnimationEvents(){this._ngZone.runOutsideAngular(()=>{this._animationsDisabled?(this.opened.subscribe(()=>this._ngZone.run(()=>this.afterExpand.emit())),this.closed.subscribe(()=>this._ngZone.run(()=>this.afterCollapse.emit()))):setTimeout(()=>{let e=this._elementRef.nativeElement;this._cleanupTransitionEnd=this._renderer.listen(e,"transitionend",this._transitionEndListener),e.classList.add("mat-expansion-panel-animations-enabled");},200);});}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["mat-expansion-panel"]],contentQueries:function(t,a,o){if(t&1&&Qh(o,Zo,5),t&2){let s;ew(s=tw())&&(a._lazyContent=s.first);}},viewQuery:function(t,a){if(t&1&&Kh(Go,5)(Jo,5),t&2){let o;ew(o=tw())&&(a._body=o.first),ew(o=tw())&&(a._bodyWrapper=o.first);}},hostAttrs:[1,"mat-expansion-panel"],hostVars:4,hostBindings:function(t,a){t&2&&rg("mat-expanded",a.expanded)("mat-expansion-panel-spacing",a._hasSpacing());},inputs:{hideToggle:[2,"hideToggle","hideToggle",x1],togglePosition:"togglePosition"},outputs:{afterExpand:"afterExpand",afterCollapse:"afterCollapse"},exportAs:["matExpansionPanel"],features:[Ow([{provide:Xa,useValue:void 0},{provide:ei,useExisting:n}]),Rh,$c],ngContentSelectors:Uo,decls:9,vars:4,consts:[["bodyWrapper",""],["body",""],[1,"mat-expansion-panel-content-wrapper"],["role","region",1,"mat-expansion-panel-content",3,"id"],[1,"mat-expansion-panel-body"],[3,"cdkPortalOutlet"]],template:function(t,a){t&1&&(KI($o),XI(0),zi$1(1,"div",2,0)(3,"div",3,1)(5,"div",4),XI(6,1),kh(7,Qo,0,0,"ng-template",5),Ou(),XI(8,2),Ou()()),t&2&&(VD(),Bh("inert",a.expanded?null:""),VD(2),Vh("id",a.id),Bh("aria-labelledby",a._headerId),VD(4),Vh("cdkPortalOutlet",a._portal));},dependencies:[Ye],styles:[`.mat-expansion-panel {
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
`],encapsulation:2})}return n})();var ni=(()=>{class n{panel=g(Rn,{host:true});_element=g(Yn);_focusMonitor=g(At);_changeDetectorRef=g(gC);_parentChangeSubscription=H.EMPTY;constructor(){g(q).load(ri$1);let e=this.panel,t=g(ti,{optional:true}),a=g(new yg("tabindex"),{optional:true}),o=e.accordion?e.accordion._stateChanges.pipe(Vt(s=>!!(s.hideToggle||s.togglePosition))):jt;this.tabIndex=parseInt(a||"")||0,this._parentChangeSubscription=Um(e.opened,e.closed,o,e._inputChanges.pipe(Vt(s=>!!(s.hideToggle||s.disabled||s.togglePosition)))).subscribe(()=>this._changeDetectorRef.markForCheck()),e.closed.pipe(Vt(()=>e._containsFocus())).subscribe(()=>this._focusMonitor.focusVia(this._element,"program")),t&&(this.expandedHeight=t.expandedHeight,this.collapsedHeight=t.collapsedHeight);}expandedHeight;collapsedHeight;tabIndex=0;get disabled(){return this.panel.disabled}_toggle(){this.disabled||this.panel.toggle();}_isExpanded(){return this.panel.expanded}_getExpandedState(){return this.panel._getExpandedState()}_getPanelId(){return this.panel.id}_getTogglePosition(){return this.panel.togglePosition}_showToggle(){return !this.panel.hideToggle&&!this.panel.disabled}_getHeaderHeight(){let e=this._isExpanded();return e&&this.expandedHeight?this.expandedHeight:!e&&this.collapsedHeight?this.collapsedHeight:null}_keydown(e){switch(e.keyCode){case 32:case 13:Gr(e)||(e.preventDefault(),this._toggle());break;default:this.panel.accordion&&this.panel.accordion._handleHeaderKeydown(e);return}}focus(e,t){e?this._focusMonitor.focusVia(this._element,e,t):this._element.nativeElement.focus(t);}ngAfterViewInit(){this._focusMonitor.monitor(this._element).subscribe(e=>{e&&this.panel.accordion&&this.panel.accordion._handleHeaderFocus(this);});}ngOnDestroy(){this._parentChangeSubscription.unsubscribe(),this._focusMonitor.stopMonitoring(this._element);}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["mat-expansion-panel-header"]],hostAttrs:["role","button",1,"mat-expansion-panel-header","mat-focus-indicator"],hostVars:13,hostBindings:function(t,a){t&1&&qh("click",function(){return a._toggle()})("keydown",function(s){return a._keydown(s)}),t&2&&(Bh("id",a.panel._headerId)("tabindex",a.disabled?-1:a.tabIndex)("aria-controls",a._getPanelId())("aria-expanded",a._isExpanded())("aria-disabled",a.panel.disabled),ng("height",a._getHeaderHeight()),rg("mat-expanded",a._isExpanded())("mat-expansion-toggle-indicator-after",a._getTogglePosition()==="after")("mat-expansion-toggle-indicator-before",a._getTogglePosition()==="before"));},inputs:{expandedHeight:"expandedHeight",collapsedHeight:"collapsedHeight",tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:R1(e)]},ngContentSelectors:Yo,decls:5,vars:3,consts:[[1,"mat-content"],[1,"mat-expansion-indicator"],["xmlns","http://www.w3.org/2000/svg","viewBox","0 -960 960 960","aria-hidden","true","focusable","false"],["d","M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"]],template:function(t,a){t&1&&(KI(qo),ku(0,"span",0),XI(1),XI(2,1),XI(3,2),Pu(),FI(4,Ko,3,0,"span",1)),t&2&&(rg("mat-content-hide-toggle",!a._showToggle()),VD(4),LI(a._showToggle()?4:-1));},styles:[`.mat-expansion-panel-header {
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
`],encapsulation:2})}return n})();var ai=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["mat-panel-title"]],hostAttrs:[1,"mat-expansion-panel-header-title"]})}return n})();var ii=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os({type:n});static \u0275inj=Dr$1({imports:[Za,Jt,Se]})}return n})();var er=["logContainer"],tr=(n,i)=>i.type+"-"+i.timestamp;function nr(n,i){if(n&1&&(zi$1(0,"span",8),Tw(1),Ou()),n&2){let e=YI(2).$implicit;VD(),ug(e.origin);}}function ar(n,i){if(n&1&&(zi$1(0,"mat-expansion-panel",4)(1,"mat-expansion-panel-header")(2,"mat-panel-title")(3,"span",6),Tw(4),Ou(),zi$1(5,"span",7),Tw(6),Ou(),FI(7,nr,2,1,"span",8),Ou()(),zi$1(8,"pre"),Tw(9),Lw(10,"json"),Ou()()),n&2){let e=YI().$implicit;Vh("expanded",false),VD(4),ug(e.timestampStr),VD(2),ug(e.type),VD(),LI(e.origin?7:-1),VD(2),ug(Bw(10,5,e.payload));}}function ir(n,i){if(n&1&&(zi$1(0,"pre"),Tw(1),Lw(2,"json"),Ou()),n&2){let e=YI(2).$implicit;VD(),ug(Bw(2,1,e.payload));}}function or(n,i){if(n&1&&(zi$1(0,"div",5)(1,"div",9)(2,"span",6),Tw(3),Ou(),zi$1(4,"span",7),Tw(5),Ou(),zi$1(6,"span",8),Tw(7),Ou()(),FI(8,ir,3,3,"pre"),Ou()),n&2){let e=YI().$implicit;VD(3),ug(e.timestampStr),VD(2),ug(e.type),VD(2),ug(e.origin),VD(),LI(e.payload?8:-1);}}function rr(n,i){if(n&1&&FI(0,ar,11,7,"mat-expansion-panel",4)(1,or,9,4,"div",5),n&2){let e=i.$implicit,t=YI(2);LI(t.isCollapsible(e)?0:1);}}function sr(n,i){if(n&1&&VI(0,rr,2,1,null,null,tr),n&2){let e=YI();HI(e.messageHistory());}}function lr(n,i){n&1&&(zi$1(0,"div",3),Tw(1,"No messages captured yet"),Ou());}var rt=class n{hostComm=g(Xt);chatState=g(ae);messageHistory=tn([]);logContainer=M1("logContainer");TEST_ONLY={logContainer:()=>this.logContainer()};postMessageListener=i=>{i.type!==E.CONSOLE_LOG&&this.addLogEntry({type:i.type,payload:i.payload,timestamp:i.timestamp,timestampStr:ue(i.timestamp),origin:i.origin});};constructor(){let e=this.hostComm.getHistoryBuffer().filter(l=>l.type!==E.CONSOLE_LOG).map(l=>({type:l.type,payload:l.payload,timestamp:l.timestamp,timestampStr:ue(l.timestamp),origin:l.origin})),t=this.chatState.llmHistory().map(l=>({type:l.type,payload:l.payload,timestamp:l.timestamp,timestampStr:ue(l.timestamp)})),a=[...e,...t],o=[],s=new Set;for(let l of a){let h=`${l.type}-${l.timestamp}`;s.has(h)||(s.add(h),o.push(l));}o.sort((l,h)=>h.timestamp-l.timestamp),this.messageHistory.set(o.slice(0,100)),this.hostComm.addListener(this.postMessageListener),Jd(()=>{let l=this.chatState.latestLlmLog();l&&this.addLogEntry({type:l.type,payload:l.payload,timestamp:l.timestamp,timestampStr:ue(l.timestamp)});}),O1(()=>{this.messageHistory();let l=this.logContainer()?.nativeElement;l&&(l.scrollTop=0);});}clearLogs(){this.messageHistory.set([]),this.chatState.clearRawLlmHistory(),this.hostComm.clearHistoryBuffer();}ngOnDestroy(){this.hostComm.removeListener(this.postMessageListener);}isCollapsible(i){return i.type!==E.RENDERER_READY&&i.type!==E.FORCE_UNBLOCK&&i.type!==E.SET_BLOCKING_STATE}addLogEntry(i){this.messageHistory.update(e=>e.some(a=>a.timestamp===i.timestamp&&a.type===i.type)?e:[i,...e].sort((a,o)=>o.timestamp-a.timestamp).slice(0,100));}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-raw-messages"]],viewQuery:function(e,t){e&1&&Jh(t.logContainer,er,5),e&2&&nw();},decls:5,vars:1,consts:[["logContainer",""],[1,"raw-messages-wrapper"],[1,"raw-messages-container"],[1,"raw-messages-placeholder"],["data-testid","llm-log-panel",1,"llm-log-panel",3,"expanded"],["data-testid","raw-message-envelope",1,"message-envelope"],[1,"timestamp"],[1,"message-type"],[1,"origin"],[1,"envelope-header"]],template:function(e,t){e&1&&(zi$1(0,"div",1)(1,"div",2,0),FI(3,sr,2,0)(4,lr,2,0,"div",3),Ou()()),e&2&&(VD(3),LI(t.messageHistory().length>0?3:4));},dependencies:[ii,Rn,ni,ai,RC],styles:["[_nghost-%COMP%]{display:block;height:100%;width:100%}.raw-messages-wrapper[_ngcontent-%COMP%]{display:flex;flex-direction:column;height:100%;width:100%}.raw-messages-container[_ngcontent-%COMP%]{flex:1;height:0;width:100%;overflow-y:auto;box-sizing:border-box;padding:0 8px 8px;display:flex;flex-direction:column;gap:4px}.raw-messages-container[_ngcontent-%COMP%] > [_ngcontent-%COMP%]:first-child{margin-top:8px}.raw-messages-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mat-sys-on-surface-variant);font-size:14px}.message-envelope[_ngcontent-%COMP%]{flex-shrink:0;border:1px solid var(--mat-sys-outline-variant);border-radius:4px;background-color:var(--mat-sys-surface-container);padding:6px 8px;box-shadow:0 1px 2px #0000000d;display:flex;flex-direction:column;gap:4px}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]{display:flex;gap:12px;font-size:11px;font-weight:700;color:var(--mat-sys-on-surface-variant);padding-bottom:2px;margin-bottom:2px}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]   .timestamp[_ngcontent-%COMP%]{color:var(--mat-sys-primary)}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]   .message-type[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]   .origin[_ngcontent-%COMP%]{margin-left:auto;font-weight:400}.message-envelope[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{margin:0;font-family:monospace;font-size:11px;overflow-x:auto;white-space:pre-wrap;color:var(--mat-sys-on-surface)}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]{flex-shrink:0;min-width:0;box-shadow:none!important;background-color:var(--mat-sys-surface-container-low)!important;transition:background-color .2s ease}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]:hover{background-color:var(--mat-sys-surface-container)!important}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]{border:1px solid var(--mat-sys-outline-variant);border-radius:4px;overflow:visible!important}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     .mat-expansion-panel-content-wrapper{overflow:hidden;border-bottom-left-radius:inherit;border-bottom-right-radius:inherit}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-expansion-panel-header{position:sticky;top:0;z-index:10;height:28px!important;padding:0 8px!important;background-color:inherit;border-top-left-radius:inherit;border-top-right-radius:inherit}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-expansion-panel-header.mat-expanded{border-bottom:1px solid var(--mat-sys-outline-variant);box-shadow:0 2px 4px #0000000d}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title{display:flex;align-items:center;gap:12px;font-size:11px!important;color:var(--mat-sys-on-surface-variant)!important}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .timestamp{color:var(--mat-sys-primary);font-weight:700}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .message-type{color:var(--mat-sys-tertiary);font-weight:700}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .message-type.llm{color:var(--mat-sys-primary)}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .origin{margin-left:auto;font-weight:400;opacity:.8}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-description{font-size:10px;color:var(--mat-sys-outline);display:flex;align-items:center;justify-content:flex-end}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     .mat-expansion-panel-body{padding:6px 8px!important;background-color:var(--mat-sys-surface-container-lowest)!important;min-width:0}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{margin:0;font-family:monospace;font-size:11px;overflow-x:auto;white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%;box-sizing:border-box;color:var(--mat-sys-on-surface)}"]})};var hn=class n{static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-mock-rules"]],decls:2,vars:0,consts:[[1,"mock-rules-placeholder"]],template:function(e,t){e&1&&(ku(0,"div",0),Tw(1,"Mock Rules Placeholder"),Pu());},encapsulation:2})};var Hn=["*"];function dr(n,i){n&1&&XI(0);}var cr=["tabListContainer"],mr=["tabList"],pr=["tabListInner"],ur=["nextPaginator"],hr=["previousPaginator"],gr=["content"];function br(n,i){}var fr=["tabBodyWrapper"],_r=["tabHeader"];function yr(n,i){}function vr(n,i){if(n&1&&kh(0,yr,0,0,"ng-template",12),n&2){let e=YI().$implicit;Vh("cdkPortalOutlet",e.templateLabel);}}function xr(n,i){if(n&1&&Tw(0),n&2){let e=YI().$implicit;ug(e.textLabel);}}function Cr(n,i){if(n&1){let e=qI();zi$1(0,"div",7,2),qh("click",function(){let a=Rd(e),o=a.$implicit,s=a.$index,l=YI(),h=rw(1);return Od(l._handleClick(o,h,s))})("cdkFocusChange",function(a){let o=Rd(e).$index,s=YI();return Od(s._tabFocusChanged(a,o))}),Hh(2,"span",8)(3,"div",9),zi$1(4,"span",10)(5,"span",11),FI(6,vr,1,1,null,12)(7,xr,1,1),Ou()()();}if(n&2){let e=i.$implicit,t=i.$index,a=rw(1),o=YI();hw(e.labelClass),rg("mdc-tab--active",o.selectedIndex===t),Vh("id",o._getTabLabelId(e,t))("disabled",e.disabled)("fitInkBarToContent",o.fitInkBarToContent),Bh("tabIndex",o._getTabIndex(t))("aria-posinset",t+1)("aria-setsize",o._tabs.length)("aria-controls",o._getTabContentId(t))("aria-selected",o.selectedIndex===t)("aria-label",e.ariaLabel||null)("aria-labelledby",!e.ariaLabel&&e.ariaLabelledby?e.ariaLabelledby:null),VD(3),Vh("matRippleTrigger",a)("matRippleDisabled",e.disabled||o.disableRipple),VD(3),LI(e.templateLabel?6:7);}}function Mr(n,i){n&1&&XI(0);}function wr(n,i){if(n&1){let e=qI();zi$1(0,"mat-tab-body",13),qh("_onCentered",function(){Rd(e);let a=YI();return Od(a._removeTabBodyWrapperHeight())})("_onCentering",function(a){Rd(e);let o=YI();return Od(o._setTabBodyWrapperHeight(a))})("_beforeCentering",function(a){Rd(e);let o=YI();return Od(o._bodyCentered(a))}),Ou();}if(n&2){let e=i.$implicit,t=i.$index,a=YI();hw(e.bodyClass),Vh("id",a._getTabContentId(t))("content",e.content)("position",e.position)("animationDuration",a._bodyAnimationDuration)("preserveContent",a.preserveContent),Bh("tabindex",a.contentTabIndex!=null&&a.selectedIndex===t?a.contentTabIndex:null)("aria-labelledby",a._getTabLabelId(e,t))("aria-hidden",a.selectedIndex!==t);}}var kr=new T("MatTabContent"),Dr=(()=>{class n{template=g(zn$1);static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["","matTabContent",""]],features:[Ow([{provide:kr,useExisting:n}])]})}return n})(),Pr=new T("MatTabLabel"),li=new T("MAT_TAB"),jn=(()=>{class n extends Fe{_closestTab=g(li,{optional:true});static \u0275fac=(()=>{let e;return function(a){return (e||(e=tp(n)))(a||n)}})();static \u0275dir=_u({type:n,selectors:[["","mat-tab-label",""],["","matTabLabel",""]],features:[Ow([{provide:Pr,useExisting:n}]),Rh]})}return n})(),di=new T("MAT_TAB_GROUP"),Vn=(()=>{class n{_viewContainerRef=g(Kn);_closestTabGroup=g(di,{optional:true});disabled=false;get templateLabel(){return this._templateLabel}set templateLabel(e){this._setTemplateLabelInput(e);}_templateLabel;_explicitContent=void 0;_implicitContent;textLabel="";ariaLabel;ariaLabelledby;labelClass;bodyClass;id=null;_contentPortal=null;get content(){return this._contentPortal}_stateChanges=new ee;position=null;origin=null;isActive=false;constructor(){g(q).load(ri$1);}ngOnChanges(e){(e.hasOwnProperty("textLabel")||e.hasOwnProperty("disabled"))&&this._stateChanges.next();}ngOnDestroy(){this._stateChanges.complete();}ngOnInit(){this._contentPortal=new B(this._explicitContent||this._implicitContent,this._viewContainerRef);}_setTemplateLabelInput(e){e&&e._closestTab===this&&(this._templateLabel=e);}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["mat-tab"]],contentQueries:function(t,a,o){if(t&1&&Qh(o,jn,5)(o,Dr,7,zn$1),t&2){let s;ew(s=tw())&&(a.templateLabel=s.first),ew(s=tw())&&(a._explicitContent=s.first);}},viewQuery:function(t,a){if(t&1&&Kh(zn$1,7),t&2){let o;ew(o=tw())&&(a._implicitContent=o.first);}},hostAttrs:["hidden",""],hostVars:1,hostBindings:function(t,a){t&2&&Bh("id",null);},inputs:{disabled:[2,"disabled","disabled",x1],textLabel:[0,"label","textLabel"],ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],labelClass:"labelClass",bodyClass:"bodyClass",id:"id"},exportAs:["matTab"],features:[Ow([{provide:li,useExisting:n}]),$c],ngContentSelectors:Hn,decls:1,vars:0,template:function(t,a){t&1&&(KI(),Ph(0,dr,1,0,"ng-template"));},encapsulation:2,changeDetection:1})}return n})(),Ln="mdc-tab-indicator--active",oi="mdc-tab-indicator--no-transition",Fn=class{_items;_currentItem;constructor(i){this._items=i;}hide(){this._items.forEach(i=>i.deactivateInkBar()),this._currentItem=void 0;}alignToElement(i){let e=this._items.find(a=>a.elementRef.nativeElement===i),t=this._currentItem;if(e!==t&&(t?.deactivateInkBar(),e)){let a=t?.elementRef.nativeElement.getBoundingClientRect?.();e.activateInkBar(a),this._currentItem=e;}}},Tr=(()=>{class n{_elementRef=g(Yn);_inkBarElement=null;_inkBarContentElement=null;_fitToContent=false;get fitInkBarToContent(){return this._fitToContent}set fitInkBarToContent(e){this._fitToContent!==e&&(this._fitToContent=e,this._inkBarElement&&this._appendInkBarElement());}activateInkBar(e){let t=this._elementRef.nativeElement;if(!e||!t.getBoundingClientRect||!this._inkBarContentElement){t.classList.add(Ln);return}let a=t.getBoundingClientRect(),o=e.width/a.width,s=e.left-a.left;t.classList.add(oi),this._inkBarContentElement.style.setProperty("transform",`translateX(${s}px) scaleX(${o})`),t.getBoundingClientRect(),t.classList.remove(oi),t.classList.add(Ln),this._inkBarContentElement.style.setProperty("transform","");}deactivateInkBar(){this._elementRef.nativeElement.classList.remove(Ln);}ngOnInit(){this._createInkBarElement();}ngOnDestroy(){this._inkBarElement?.remove(),this._inkBarElement=this._inkBarContentElement=null;}_createInkBarElement(){let e=this._elementRef.nativeElement.ownerDocument||document,t=this._inkBarElement=e.createElement("span"),a=this._inkBarContentElement=e.createElement("span");t.className="mdc-tab-indicator",a.className="mdc-tab-indicator__content mdc-tab-indicator__content--underline",t.appendChild(this._inkBarContentElement),this._appendInkBarElement();}_appendInkBarElement(){this._inkBarElement;let e=this._fitToContent?this._elementRef.nativeElement.querySelector(".mdc-tab__content"):this._elementRef.nativeElement;e.appendChild(this._inkBarElement);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,inputs:{fitInkBarToContent:[2,"fitInkBarToContent","fitInkBarToContent",x1]}})}return n})();var ci=(()=>{class n extends Tr{elementRef=g(Yn);disabled=false;focus(){this.elementRef.nativeElement.focus();}getOffsetLeft(){return this.elementRef.nativeElement.offsetLeft}getOffsetWidth(){return this.elementRef.nativeElement.offsetWidth}static \u0275fac=(()=>{let e;return function(a){return (e||(e=tp(n)))(a||n)}})();static \u0275dir=_u({type:n,selectors:[["","matTabLabelWrapper",""]],hostVars:3,hostBindings:function(t,a){t&2&&(Bh("aria-disabled",!!a.disabled),rg("mat-mdc-tab-disabled",a.disabled));},inputs:{disabled:[2,"disabled","disabled",x1]},features:[Rh]})}return n})(),ri={passive:true},Er=650,Sr=100,Ir=(()=>{class n{_elementRef=g(Yn);_changeDetectorRef=g(gC);_viewportRuler=g(Xe);_dir=g(jo$1,{optional:true});_ngZone=g(K);_platform=g(R);_sharedResizeObserver=g(Ve$1);_injector=g(re);_renderer=g(ah);_animationsDisabled=xe();_eventCleanups;_scrollDistance=0;_selectedIndexChanged=false;_destroyed=new ee;_showPaginationControls=false;_disableScrollAfter=true;_disableScrollBefore=true;_tabLabelCount;_scrollDistanceChanged=false;_keyManager;_currentTextContent;_stopScrolling=new ee;disablePagination=false;get selectedIndex(){return this._selectedIndex}set selectedIndex(e){let t=isNaN(e)?0:e;this._selectedIndex!=t&&(this._selectedIndexChanged=true,this._selectedIndex=t,this._keyManager&&this._keyManager.updateActiveItem(t));}_selectedIndex=0;selectFocusedIndex=new We;indexFocused=new We;constructor(){this._eventCleanups=this._ngZone.runOutsideAngular(()=>[this._renderer.listen(this._elementRef.nativeElement,"mouseleave",()=>this._stopInterval())]);}ngAfterViewInit(){this._eventCleanups.push(this._renderer.listen(this._previousPaginator.nativeElement,"touchstart",()=>this._handlePaginatorPress("before"),ri),this._renderer.listen(this._nextPaginator.nativeElement,"touchstart",()=>this._handlePaginatorPress("after"),ri));}ngAfterContentInit(){let e=this._dir?this._dir.change:$s("ltr"),t=this._sharedResizeObserver.observe(this._elementRef.nativeElement).pipe(zm(32),ty(this._destroyed)),a=this._viewportRuler.change(150).pipe(ty(this._destroyed)),o=()=>{this.updatePagination(),this._alignInkBarToSelectedTab();};this._keyManager=new Cn(this._items).withHorizontalOrientation(this._getLayoutDirection()).withHomeAndEnd().withWrap().skipPredicate(()=>false),this._keyManager.updateActiveItem(Math.max(this._selectedIndex,0)),mD(o,{injector:this._injector}),Um(e,a,t,this._items.changes,this._itemsResized()).pipe(ty(this._destroyed)).subscribe(()=>{this._ngZone.run(()=>{Promise.resolve().then(()=>{this._scrollDistance=Math.max(0,Math.min(this._getMaxScrollDistance(),this._scrollDistance)),o();});}),this._keyManager?.withHorizontalOrientation(this._getLayoutDirection());}),this._keyManager.change.subscribe(s=>{this.indexFocused.emit(s),this._setTabFocus(s);});}_itemsResized(){return typeof ResizeObserver!="function"?jt:this._items.changes.pipe(ey(this._items),rd(e=>new x(t=>this._ngZone.runOutsideAngular(()=>{let a=new ResizeObserver(o=>t.next(o));return e.forEach(o=>a.observe(o.elementRef.nativeElement)),()=>{a.disconnect();}}))),Jm(1),Vt(e=>e.some(t=>t.contentRect.width>0&&t.contentRect.height>0)))}ngAfterContentChecked(){this._tabLabelCount!=this._items.length&&(this.updatePagination(),this._tabLabelCount=this._items.length,this._changeDetectorRef.markForCheck()),this._selectedIndexChanged&&(this._scrollToLabel(this._selectedIndex),this._checkScrollingControls(),this._alignInkBarToSelectedTab(),this._selectedIndexChanged=false,this._changeDetectorRef.markForCheck()),this._scrollDistanceChanged&&(this._updateTabScrollPosition(),this._scrollDistanceChanged=false,this._changeDetectorRef.markForCheck());}ngOnDestroy(){this._eventCleanups.forEach(e=>e()),this._keyManager?.destroy(),this._destroyed.next(),this._destroyed.complete(),this._stopScrolling.complete();}_handleKeydown(e){if(!Gr(e))switch(e.keyCode){case 13:case 32:if(this.focusIndex!==this.selectedIndex){let t=this._items.get(this.focusIndex);t&&!t.disabled&&(this.selectFocusedIndex.emit(this.focusIndex),this._itemSelected(e));}break;default:this._keyManager?.onKeydown(e);}}_onContentChanges(){let e=this._elementRef.nativeElement.textContent;e!==this._currentTextContent&&(this._currentTextContent=e||"",this._ngZone.run(()=>{this.updatePagination(),this._alignInkBarToSelectedTab(),this._changeDetectorRef.markForCheck();}));}updatePagination(){this._checkPaginationEnabled(),this._checkScrollingControls(),this._updateTabScrollPosition();}get focusIndex(){return this._keyManager?this._keyManager.activeItemIndex:0}set focusIndex(e){!this._isValidIndex(e)||this.focusIndex===e||!this._keyManager||this._keyManager.setActiveItem(e);}_isValidIndex(e){return this._items?!!this._items.toArray()[e]:true}_setTabFocus(e){if(this._showPaginationControls&&this._scrollToLabel(e),this._items&&this._items.length){this._items.toArray()[e].focus();let t=this._tabListContainer.nativeElement;this._getLayoutDirection()=="ltr"?t.scrollLeft=0:t.scrollLeft=t.scrollWidth-t.offsetWidth;}}_getLayoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_updateTabScrollPosition(){if(this.disablePagination)return;let e=this.scrollDistance,t=this._getLayoutDirection()==="ltr"?-e:e;this._tabList.nativeElement.style.transform=`translateX(${Math.round(t)}px)`,(this._platform.TRIDENT||this._platform.EDGE)&&(this._tabListContainer.nativeElement.scrollLeft=0);}get scrollDistance(){return this._scrollDistance}set scrollDistance(e){this._scrollTo(e);}_scrollHeader(e){let t=this._tabListContainer.nativeElement.offsetWidth,a=(e=="before"?-1:1)*t/3;return this._scrollTo(this._scrollDistance+a)}_handlePaginatorClick(e){this._stopInterval(),this._scrollHeader(e);}_scrollToLabel(e){if(this.disablePagination)return;let t=this._items?this._items.toArray()[e]:null;if(!t)return;let a=this._tabListContainer.nativeElement.offsetWidth,{offsetLeft:o,offsetWidth:s}=t.elementRef.nativeElement,l,h;this._getLayoutDirection()=="ltr"?(l=o,h=l+s):(h=this._tabListInner.nativeElement.offsetWidth-o,l=h-s);let g=this.scrollDistance,B=this.scrollDistance+a;l<g?this.scrollDistance-=g-l:h>B&&(this.scrollDistance+=Math.min(h-B,l-g));}_checkPaginationEnabled(){if(this.disablePagination)this._showPaginationControls=false;else {let e=this._tabListInner.nativeElement.scrollWidth,t=this._elementRef.nativeElement.offsetWidth,a=e-t>=5;a||(this.scrollDistance=0),a!==this._showPaginationControls&&(this._showPaginationControls=a,this._changeDetectorRef.markForCheck());}}_checkScrollingControls(){this.disablePagination?this._disableScrollAfter=this._disableScrollBefore=true:(this._disableScrollBefore=this.scrollDistance==0,this._disableScrollAfter=this.scrollDistance==this._getMaxScrollDistance(),this._changeDetectorRef.markForCheck());}_getMaxScrollDistance(){let e=this._tabListInner.nativeElement.scrollWidth,t=this._tabListContainer.nativeElement.offsetWidth;return e-t||0}_alignInkBarToSelectedTab(){let e=this._items&&this._items.length?this._items.toArray()[this.selectedIndex]:null,t=e?e.elementRef.nativeElement:null;t?this._inkBar.alignToElement(t):this._inkBar.hide();}_stopInterval(){this._stopScrolling.next();}_handlePaginatorPress(e,t){t&&t.button!=null&&t.button!==0||(this._stopInterval(),fr$1(Er,Sr).pipe(ty(Um(this._stopScrolling,this._destroyed))).subscribe(()=>{let{maxScrollDistance:a,distance:o}=this._scrollHeader(e);(o===0||o>=a)&&this._stopInterval();}));}_scrollTo(e){if(this.disablePagination)return {maxScrollDistance:0,distance:0};let t=this._getMaxScrollDistance();return this._scrollDistance=Math.max(0,Math.min(t,e)),this._scrollDistanceChanged=true,this._checkScrollingControls(),{maxScrollDistance:t,distance:this._scrollDistance}}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,inputs:{disablePagination:[2,"disablePagination","disablePagination",x1],selectedIndex:[2,"selectedIndex","selectedIndex",R1]},outputs:{selectFocusedIndex:"selectFocusedIndex",indexFocused:"indexFocused"}})}return n})(),Or=(()=>{class n extends Ir{_items;_tabListContainer;_tabList;_tabListInner;_nextPaginator;_previousPaginator;_inkBar;ariaLabel;ariaLabelledby;disableRipple=false;ngAfterContentInit(){this._inkBar=new Fn(this._items),super.ngAfterContentInit();}_itemSelected(e){e.preventDefault();}static \u0275fac=(()=>{let e;return function(a){return (e||(e=tp(n)))(a||n)}})();static \u0275cmp=hI({type:n,selectors:[["mat-tab-header"]],contentQueries:function(t,a,o){if(t&1&&Qh(o,ci,4),t&2){let s;ew(s=tw())&&(a._items=s);}},viewQuery:function(t,a){if(t&1&&Kh(cr,7)(mr,7)(pr,7)(ur,5)(hr,5),t&2){let o;ew(o=tw())&&(a._tabListContainer=o.first),ew(o=tw())&&(a._tabList=o.first),ew(o=tw())&&(a._tabListInner=o.first),ew(o=tw())&&(a._nextPaginator=o.first),ew(o=tw())&&(a._previousPaginator=o.first);}},hostAttrs:[1,"mat-mdc-tab-header"],hostVars:4,hostBindings:function(t,a){t&2&&rg("mat-mdc-tab-header-pagination-controls-enabled",a._showPaginationControls)("mat-mdc-tab-header-rtl",a._getLayoutDirection()=="rtl");},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],disableRipple:[2,"disableRipple","disableRipple",x1]},features:[Rh],ngContentSelectors:Hn,decls:13,vars:10,consts:[["previousPaginator",""],["tabListContainer",""],["tabList",""],["tabListInner",""],["nextPaginator",""],["mat-ripple","",1,"mat-mdc-tab-header-pagination","mat-mdc-tab-header-pagination-before",3,"click","mousedown","touchend","matRippleDisabled"],[1,"mat-mdc-tab-header-pagination-chevron"],[1,"mat-mdc-tab-label-container",3,"keydown"],["role","tablist",1,"mat-mdc-tab-list",3,"cdkObserveContent"],[1,"mat-mdc-tab-labels"],["mat-ripple","",1,"mat-mdc-tab-header-pagination","mat-mdc-tab-header-pagination-after",3,"mousedown","click","touchend","matRippleDisabled"]],template:function(t,a){t&1&&(KI(),zi$1(0,"div",5,0),qh("click",function(){return a._handlePaginatorClick("before")})("mousedown",function(s){return a._handlePaginatorPress("before",s)})("touchend",function(){return a._stopInterval()}),Hh(2,"div",6),Ou(),zi$1(3,"div",7,1),qh("keydown",function(s){return a._handleKeydown(s)}),zi$1(5,"div",8,2),qh("cdkObserveContent",function(){return a._onContentChanges()}),zi$1(7,"div",9,3),XI(9),Ou()()(),zi$1(10,"div",10,4),qh("mousedown",function(s){return a._handlePaginatorPress("after",s)})("click",function(){return a._handlePaginatorClick("after")})("touchend",function(){return a._stopInterval()}),Hh(12,"div",6),Ou()),t&2&&(rg("mat-mdc-tab-header-pagination-disabled",a._disableScrollBefore),Vh("matRippleDisabled",a._disableScrollBefore||a.disableRipple),VD(3),rg("_mat-animation-noopable",a._animationsDisabled),VD(2),Bh("aria-label",a.ariaLabel||null)("aria-labelledby",a.ariaLabelledby||null),VD(5),rg("mat-mdc-tab-header-pagination-disabled",a._disableScrollAfter),Vh("matRippleDisabled",a._disableScrollAfter||a.disableRipple));},dependencies:[Gc,ll],styles:[`.mat-mdc-tab-header {
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
`],encapsulation:2,changeDetection:1})}return n})(),Ar=new T("MAT_TABS_CONFIG"),si=(()=>{class n extends Ye{_host=g(Nn);_ngZone=g(K);_centeringSub=H.EMPTY;_leavingSub=H.EMPTY;ngOnInit(){super.ngOnInit(),this._centeringSub=this._host._beforeCentering.pipe(ey(this._host._isCenterPosition())).subscribe(e=>{this._host._content&&e&&!this.hasAttached()&&this._ngZone.run(()=>{Promise.resolve().then(),this.attach(this._host._content);});}),this._leavingSub=this._host._afterLeavingCenter.subscribe(()=>{this._host.preserveContent||this._ngZone.run(()=>this.detach());});}ngOnDestroy(){super.ngOnDestroy(),this._centeringSub.unsubscribe(),this._leavingSub.unsubscribe();}static \u0275fac=(()=>{let e;return function(a){return (e||(e=tp(n)))(a||n)}})();static \u0275dir=_u({type:n,selectors:[["","matTabBodyHost",""]],features:[Rh]})}return n})(),Nn=(()=>{class n{_elementRef=g(Yn);_dir=g(jo$1,{optional:true});_ngZone=g(K);_injector=g(re);_renderer=g(ah);_diAnimationsDisabled=xe();_eventCleanups;_initialized=false;_fallbackTimer;_positionIndex;_dirChangeSubscription=H.EMPTY;_position;_previousPosition;_onCentering=new We;_beforeCentering=new We;_afterLeavingCenter=new We;_onCentered=new We(true);_portalHost;_contentElement;_content;animationDuration="500ms";preserveContent=false;set position(e){this._positionIndex=e,this._computePositionAnimationState();}constructor(){if(this._dir){let e=g(gC);this._dirChangeSubscription=this._dir.change.subscribe(t=>{this._computePositionAnimationState(t),e.markForCheck();});}}ngOnInit(){this._bindTransitionEvents(),this._position==="center"&&(this._setActiveClass(true),mD(()=>this._onCentering.emit(this._elementRef.nativeElement.clientHeight),{injector:this._injector})),this._initialized=true;}ngOnDestroy(){clearTimeout(this._fallbackTimer),this._eventCleanups?.forEach(e=>e()),this._dirChangeSubscription.unsubscribe();}_bindTransitionEvents(){this._ngZone.runOutsideAngular(()=>{let e=this._elementRef.nativeElement,t=a=>{a.target===this._contentElement?.nativeElement&&(this._elementRef.nativeElement.classList.remove("mat-tab-body-animating"),a.type==="transitionend"&&this._transitionDone());};this._eventCleanups=[this._renderer.listen(e,"transitionstart",a=>{a.target===this._contentElement?.nativeElement&&(this._elementRef.nativeElement.classList.add("mat-tab-body-animating"),this._transitionStarted());}),this._renderer.listen(e,"transitionend",t),this._renderer.listen(e,"transitioncancel",t)];});}_transitionStarted(){clearTimeout(this._fallbackTimer);let e=this._position==="center";this._beforeCentering.emit(e),e&&this._onCentering.emit(this._elementRef.nativeElement.clientHeight);}_transitionDone(){this._position==="center"?this._onCentered.emit():this._previousPosition==="center"&&this._afterLeavingCenter.emit();}_setActiveClass(e){this._elementRef.nativeElement.classList.toggle("mat-mdc-tab-body-active",e);}_getLayoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_isCenterPosition(){return this._positionIndex===0}_computePositionAnimationState(e=this._getLayoutDirection()){this._previousPosition=this._position,this._positionIndex<0?this._position=e=="ltr"?"left":"right":this._positionIndex>0?this._position=e=="ltr"?"right":"left":this._position="center",this._animationsDisabled()?this._simulateTransitionEvents():this._initialized&&(this._position==="center"||this._previousPosition==="center")&&(clearTimeout(this._fallbackTimer),this._fallbackTimer=this._ngZone.runOutsideAngular(()=>setTimeout(()=>this._simulateTransitionEvents(),100)));}_simulateTransitionEvents(){this._transitionStarted(),mD(()=>this._transitionDone(),{injector:this._injector});}_animationsDisabled(){return this._diAnimationsDisabled||this.animationDuration==="0ms"||this.animationDuration==="0s"}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["mat-tab-body"]],viewQuery:function(t,a){if(t&1&&Kh(si,5)(gr,5),t&2){let o;ew(o=tw())&&(a._portalHost=o.first),ew(o=tw())&&(a._contentElement=o.first);}},hostAttrs:[1,"mat-mdc-tab-body"],hostVars:1,hostBindings:function(t,a){t&2&&Bh("inert",a._position==="center"?null:"");},inputs:{_content:[0,"content","_content"],animationDuration:"animationDuration",preserveContent:"preserveContent",position:"position"},outputs:{_onCentering:"_onCentering",_beforeCentering:"_beforeCentering",_onCentered:"_onCentered"},decls:3,vars:6,consts:[["content",""],["cdkScrollable","",1,"mat-mdc-tab-body-content"],["matTabBodyHost",""]],template:function(t,a){t&1&&(zi$1(0,"div",1,0),kh(2,br,0,0,"ng-template",2),Ou()),t&2&&rg("mat-tab-body-content-left",a._position==="left")("mat-tab-body-content-right",a._position==="right")("mat-tab-body-content-can-animate",a._position==="center"||a._previousPosition==="center");},dependencies:[si,Ke],styles:[`.mat-mdc-tab-body {
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
`],encapsulation:2,changeDetection:1})}return n})(),mi=(()=>{class n{_elementRef=g(Yn);_changeDetectorRef=g(gC);_ngZone=g(K);_tabsSubscription=H.EMPTY;_tabLabelSubscription=H.EMPTY;_tabBodySubscription=H.EMPTY;_diAnimationsDisabled=xe();_bodyAnimationDuration;_headerAnimationDuration;_allTabs;_tabBodies;_tabBodyWrapper;_tabHeader;_tabs=new xi$1;_indexToSelect=0;_lastFocusedTabIndex=null;_tabBodyWrapperHeight=0;color;get fitInkBarToContent(){return this._fitInkBarToContent}set fitInkBarToContent(e){this._fitInkBarToContent=e,this._changeDetectorRef.markForCheck();}_fitInkBarToContent=false;stretchTabs=true;alignTabs=null;dynamicHeight=false;get selectedIndex(){return this._selectedIndex}set selectedIndex(e){this._indexToSelect=isNaN(e)?null:e;}_selectedIndex=null;headerPosition="above";get animationDuration(){return this._animationDuration}set animationDuration(e){this._animationDuration=e,e&&typeof e=="object"?(this._bodyAnimationDuration=Bn(e.body),this._headerAnimationDuration=Bn(e.header)):this._headerAnimationDuration=this._bodyAnimationDuration=Bn(e);}_animationDuration;get contentTabIndex(){return this._contentTabIndex}set contentTabIndex(e){this._contentTabIndex=isNaN(e)?null:e;}_contentTabIndex=null;disablePagination=false;disableRipple=false;preserveContent=false;get backgroundColor(){return this._backgroundColor}set backgroundColor(e){let t=this._elementRef.nativeElement.classList;t.remove("mat-tabs-with-background",`mat-background-${this.backgroundColor}`),e&&t.add("mat-tabs-with-background",`mat-background-${e}`),this._backgroundColor=e;}_backgroundColor;ariaLabel;ariaLabelledby;selectedIndexChange=new We;focusChange=new We;animationDone=new We;selectedTabChange=new We(true);_groupId;_isServer=!g(R).isBrowser;constructor(){let e=g(Ar,{optional:true});this._groupId=g(wn).getId("mat-tab-group-"),this.animationDuration=e&&e.animationDuration?e.animationDuration:"500ms",this.disablePagination=e&&e.disablePagination!=null?e.disablePagination:false,this.dynamicHeight=e&&e.dynamicHeight!=null?e.dynamicHeight:false,e?.contentTabIndex!=null&&(this.contentTabIndex=e.contentTabIndex),this.preserveContent=!!e?.preserveContent,this.fitInkBarToContent=e&&e.fitInkBarToContent!=null?e.fitInkBarToContent:false,this.stretchTabs=e&&e.stretchTabs!=null?e.stretchTabs:true,this.alignTabs=e&&e.alignTabs!=null?e.alignTabs:null;}ngAfterContentChecked(){let e=this._indexToSelect=this._clampTabIndex(this._indexToSelect);if(this._selectedIndex!=e){let t=this._selectedIndex==null;if(!t){this.selectedTabChange.emit(this._createChangeEvent(e));let a=this._tabBodyWrapper.nativeElement;a.style.minHeight=a.clientHeight+"px";}Promise.resolve().then(()=>{this._tabs.forEach((a,o)=>a.isActive=o===e),t||(this.selectedIndexChange.emit(e),this._tabBodyWrapper.nativeElement.style.minHeight="");});}this._tabs.forEach((t,a)=>{t.position=a-e,this._selectedIndex!=null&&t.position==0&&!t.origin&&(t.origin=e-this._selectedIndex);}),this._selectedIndex!==e&&(this._selectedIndex=e,this._lastFocusedTabIndex=null,this._changeDetectorRef.markForCheck());}ngAfterContentInit(){this._subscribeToAllTabChanges(),this._subscribeToTabLabels(),this._tabsSubscription=this._tabs.changes.subscribe(()=>{let e=this._clampTabIndex(this._indexToSelect);if(e===this._selectedIndex){let t=this._tabs.toArray(),a;for(let o=0;o<t.length;o++)if(t[o].isActive){this._indexToSelect=this._selectedIndex=o,this._lastFocusedTabIndex=null,a=t[o];break}!a&&t[e]&&Promise.resolve().then(()=>{t[e].isActive=true,this.selectedTabChange.emit(this._createChangeEvent(e));});}this._changeDetectorRef.markForCheck();});}ngAfterViewInit(){this._tabBodySubscription=this._tabBodies.changes.subscribe(()=>this._bodyCentered(true));}_subscribeToAllTabChanges(){this._allTabs.changes.pipe(ey(this._allTabs)).subscribe(e=>{this._tabs.reset(e.filter(t=>t._closestTabGroup===this||!t._closestTabGroup)),this._tabs.notifyOnChanges();});}ngOnDestroy(){this._tabs.destroy(),this._tabsSubscription.unsubscribe(),this._tabLabelSubscription.unsubscribe(),this._tabBodySubscription.unsubscribe();}realignInkBar(){this._tabHeader&&this._tabHeader._alignInkBarToSelectedTab();}updatePagination(){this._tabHeader&&this._tabHeader.updatePagination();}focusTab(e){let t=this._tabHeader;t&&(t.focusIndex=e);}_focusChanged(e){this._lastFocusedTabIndex=e,this.focusChange.emit(this._createChangeEvent(e));}_createChangeEvent(e){let t=new zn;return t.index=e,this._tabs&&this._tabs.length&&(t.tab=this._tabs.toArray()[e]),t}_subscribeToTabLabels(){this._tabLabelSubscription&&this._tabLabelSubscription.unsubscribe(),this._tabLabelSubscription=Um(...this._tabs.map(e=>e._stateChanges)).subscribe(()=>this._changeDetectorRef.markForCheck());}_clampTabIndex(e){return Math.min(this._tabs.length-1,Math.max(e||0,0))}_getTabLabelId(e,t){return e.id||`${this._groupId}-label-${t}`}_getTabContentId(e){return `${this._groupId}-content-${e}`}_setTabBodyWrapperHeight(e){if(!this.dynamicHeight||!this._tabBodyWrapperHeight){this._tabBodyWrapperHeight=e;return}let t=this._tabBodyWrapper.nativeElement;t.style.height=this._tabBodyWrapperHeight+"px",this._tabBodyWrapper.nativeElement.offsetHeight&&(t.style.height=e+"px");}_removeTabBodyWrapperHeight(){let e=this._tabBodyWrapper.nativeElement;this._tabBodyWrapperHeight=e.clientHeight,e.style.height="",this._ngZone.run(()=>this.animationDone.emit());}_handleClick(e,t,a){t.focusIndex=a,e.disabled||(this.selectedIndex=a);}_getTabIndex(e){let t=this._lastFocusedTabIndex??this.selectedIndex;return e===t?0:-1}_tabFocusChanged(e,t){e&&e!=="mouse"&&e!=="touch"&&(this._tabHeader.focusIndex=t);}_bodyCentered(e){e&&this._tabBodies?.forEach((t,a)=>t._setActiveClass(a===this._selectedIndex));}_bodyAnimationsDisabled(){return this._diAnimationsDisabled||this._bodyAnimationDuration==="0"||this._bodyAnimationDuration==="0ms"}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["mat-tab-group"]],contentQueries:function(t,a,o){if(t&1&&Qh(o,Vn,5),t&2){let s;ew(s=tw())&&(a._allTabs=s);}},viewQuery:function(t,a){if(t&1&&Kh(fr,5)(_r,5)(Nn,5),t&2){let o;ew(o=tw())&&(a._tabBodyWrapper=o.first),ew(o=tw())&&(a._tabHeader=o.first),ew(o=tw())&&(a._tabBodies=o);}},hostAttrs:[1,"mat-mdc-tab-group"],hostVars:13,hostBindings:function(t,a){t&2&&(Bh("mat-align-tabs",a.alignTabs),hw("mat-"+(a.color||"primary")),ng("--mat-tab-body-animation-duration",a._bodyAnimationDuration)("--mat-tab-header-animation-duration",a._headerAnimationDuration),rg("mat-mdc-tab-group-dynamic-height",a.dynamicHeight)("mat-mdc-tab-group-inverted-header",a.headerPosition==="below")("mat-mdc-tab-group-stretch-tabs",a.stretchTabs));},inputs:{color:"color",fitInkBarToContent:[2,"fitInkBarToContent","fitInkBarToContent",x1],stretchTabs:[2,"mat-stretch-tabs","stretchTabs",x1],alignTabs:[0,"mat-align-tabs","alignTabs"],dynamicHeight:[2,"dynamicHeight","dynamicHeight",x1],selectedIndex:[2,"selectedIndex","selectedIndex",R1],headerPosition:"headerPosition",animationDuration:"animationDuration",contentTabIndex:[2,"contentTabIndex","contentTabIndex",R1],disablePagination:[2,"disablePagination","disablePagination",x1],disableRipple:[2,"disableRipple","disableRipple",x1],preserveContent:[2,"preserveContent","preserveContent",x1],backgroundColor:"backgroundColor",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"]},outputs:{selectedIndexChange:"selectedIndexChange",focusChange:"focusChange",animationDone:"animationDone",selectedTabChange:"selectedTabChange"},exportAs:["matTabGroup"],features:[Ow([{provide:di,useExisting:n}])],ngContentSelectors:Hn,decls:9,vars:8,consts:[["tabHeader",""],["tabBodyWrapper",""],["tabNode",""],[3,"indexFocused","selectFocusedIndex","selectedIndex","disableRipple","disablePagination","aria-label","aria-labelledby"],["role","tab","matTabLabelWrapper","","cdkMonitorElementFocus","",1,"mdc-tab","mat-mdc-tab","mat-focus-indicator",3,"id","mdc-tab--active","class","disabled","fitInkBarToContent"],[1,"mat-mdc-tab-body-wrapper"],["role","tabpanel",3,"id","class","content","position","animationDuration","preserveContent"],["role","tab","matTabLabelWrapper","","cdkMonitorElementFocus","",1,"mdc-tab","mat-mdc-tab","mat-focus-indicator",3,"click","cdkFocusChange","id","disabled","fitInkBarToContent"],[1,"mdc-tab__ripple"],["mat-ripple","",1,"mat-mdc-tab-ripple",3,"matRippleTrigger","matRippleDisabled"],[1,"mdc-tab__content"],[1,"mdc-tab__text-label"],[3,"cdkPortalOutlet"],["role","tabpanel",3,"_onCentered","_onCentering","_beforeCentering","id","content","position","animationDuration","preserveContent"]],template:function(t,a){t&1&&(KI(),zi$1(0,"mat-tab-header",3,0),qh("indexFocused",function(s){return a._focusChanged(s)})("selectFocusedIndex",function(s){return a.selectedIndex=s}),VI(2,Cr,8,17,"div",4,BI),Ou(),FI(4,Mr,1,0),zi$1(5,"div",5,1),VI(7,wr,1,10,"mat-tab-body",6,BI),Ou()),t&2&&(Vh("selectedIndex",a.selectedIndex||0)("disableRipple",a.disableRipple)("disablePagination",a.disablePagination),jh("aria-label",a.ariaLabel)("aria-labelledby",a.ariaLabelledby),VD(2),HI(a._tabs),VD(2),LI(a._isServer?4:-1),VD(),rg("_mat-animation-noopable",a._bodyAnimationsDisabled()),VD(2),HI(a._tabs));},dependencies:[Or,ci,ao$1,Gc,Ye,Nn],styles:[`.mdc-tab {
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
`],encapsulation:2,changeDetection:1})}return n})(),zn=class{index;tab};function Bn(n){let i=n+"";return /^\d+$/.test(i)?n+"ms":i}var pi=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os({type:n});static \u0275inj=Dr$1({imports:[Se]})}return n})();var Lr=new T("MAT_BADGE_CONFIG"),ui="mat-badge-content",Br=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["ng-component"]],decls:0,vars:0,template:function(t,a){},styles:[`.mat-badge {
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
`],encapsulation:2})}return n})(),hi=(()=>{class n{_ngZone=g(K);_elementRef=g(Yn);_ariaDescriber=g(ac);_renderer=g(ah);_animationsDisabled=xe();_idGenerator=g(wn);get color(){return this._color}set color(e){this._setColor(e),this._color=e;}_color;overlap;disabled=false;position;get content(){return this._content}set content(e){this._updateRenderedContent(e);}_content;get description(){return this._description}set description(e){this._updateDescription(e);}_description;size;hidden=false;_badgeElement;_inlineBadgeDescription;_isInitialized=false;_interactivityChecker=g(zr$1);_document=g(W);constructor(){let e=g(Lr,{optional:true}),t=g(q);t.load(Br),t.load(St),this._color=e?.color||"primary",this.overlap=e?.overlap??true,this.position=e?.position||"above after",this.size=e?.size||"medium";}isAbove(){return this.position.indexOf("below")===-1}isAfter(){return this.position.indexOf("before")===-1}getBadgeElement(){return this._badgeElement}ngOnInit(){this._clearExistingBadges(),this.content&&!this._badgeElement&&(this._badgeElement=this._createBadgeElement(),this._updateRenderedContent(this.content)),this._isInitialized=true;}ngAfterViewInit(){}ngOnDestroy(){this._renderer.destroyNode&&(this._renderer.destroyNode(this._badgeElement),this._inlineBadgeDescription?.remove()),this._ariaDescriber.removeDescription(this._elementRef.nativeElement,this.description);}_isHostInteractive(){return this._interactivityChecker.isFocusable(this._elementRef.nativeElement,{ignoreVisibility:true})}_createBadgeElement(){let e=this._renderer.createElement("span"),t="mat-badge-active";return e.setAttribute("id",this._idGenerator.getId("mat-badge-content-")),e.setAttribute("aria-hidden","true"),e.classList.add(ui),this._animationsDisabled&&e.classList.add("_mat-animation-noopable"),this._elementRef.nativeElement.appendChild(e),typeof requestAnimationFrame=="function"&&!this._animationsDisabled?this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>{e.classList.add(t);});}):e.classList.add(t),e}_updateRenderedContent(e){let t=`${e??""}`.trim();this._isInitialized&&t&&!this._badgeElement&&(this._badgeElement=this._createBadgeElement()),this._badgeElement&&(this._badgeElement.textContent=t),this._content=t;}_updateDescription(e){this._ariaDescriber.removeDescription(this._elementRef.nativeElement,this.description),(!e||this._isHostInteractive())&&this._removeInlineDescription(),this._description=e,this._isHostInteractive()?this._ariaDescriber.describe(this._elementRef.nativeElement,e):this._updateInlineDescription();}_updateInlineDescription(){this._inlineBadgeDescription||(this._inlineBadgeDescription=this._document.createElement("span"),this._inlineBadgeDescription.classList.add("cdk-visually-hidden")),this._inlineBadgeDescription.textContent=this.description,this._badgeElement?.appendChild(this._inlineBadgeDescription);}_removeInlineDescription(){this._inlineBadgeDescription?.remove(),this._inlineBadgeDescription=void 0;}_setColor(e){let t=this._elementRef.nativeElement.classList;t.remove(`mat-badge-${this._color}`),e&&t.add(`mat-badge-${e}`);}_clearExistingBadges(){let e=this._elementRef.nativeElement.querySelectorAll(`:scope > .${ui}`);for(let t of Array.from(e))t!==this._badgeElement&&t.remove();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["","matBadge",""]],hostAttrs:[1,"mat-badge"],hostVars:20,hostBindings:function(t,a){t&2&&rg("mat-badge-overlap",a.overlap)("mat-badge-above",a.isAbove())("mat-badge-below",!a.isAbove())("mat-badge-before",!a.isAfter())("mat-badge-after",a.isAfter())("mat-badge-small",a.size==="small")("mat-badge-medium",a.size==="medium")("mat-badge-large",a.size==="large")("mat-badge-hidden",a.hidden||!a.content)("mat-badge-disabled",a.disabled);},inputs:{color:[0,"matBadgeColor","color"],overlap:[2,"matBadgeOverlap","overlap",x1],disabled:[2,"matBadgeDisabled","disabled",x1],position:[0,"matBadgePosition","position"],content:[0,"matBadge","content"],description:[0,"matBadgeDescription","description"],size:[0,"matBadgeSize","size"],hidden:[2,"matBadgeHidden","hidden",x1]}})}return n})(),gi=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os({type:n});static \u0275inj=Dr$1({imports:[Ao$1,Se]})}return n})();function Nr(n,i){if(n&1&&(zi$1(0,"span",18),Tw(1,"Events"),Ou()),n&2){let e=YI();Vh("matBadge",e.unreadEventsCount())("matBadgeHidden",e.unreadEventsCount()===0);}}function zr(n,i){if(n&1&&(zi$1(0,"span",19),Tw(1,"Errors"),Ou()),n&2){let e=YI();Vh("matBadge",e.unreadErrorsCount())("matBadgeHidden",e.unreadErrorsCount()===0);}}function Hr(n,i){n&1&&(zi$1(0,"mat-tab",17)(1,"div",14),Hh(2,"a2ui-composer-mock-rules"),Ou()());}var bi=1,Wn=2,fi=class n{startupResolution=g(Qg);hostComm=g(Xt);isExtension=tn(false);isDebugCollapsed=tn(false);showMockRules=tn(false);selectedTabIndex=tn(0);unreadEventsCount=tn(0);unreadErrorsCount=tn(0);rawMessages=M1(rt);events=M1(it);errors=M1(ot);constructor(){this.hostComm.messageStream$.pipe($i$1()).subscribe(i=>{if(!i)return;let e=i.payload,t=this.selectedTabIndex();if(i.type===E.SEND_TO_SERVER&&e?.action)t!==bi&&this.unreadEventsCount.update(a=>a+1);else if(i.type===E.CONSOLE_LOG)t!==Wn&&this.unreadErrorsCount.update(a=>a+1);else if(i.type===E.DATA_MODEL_CHANGE&&e?.validationErrors){let a=e.validationErrors;(Array.isArray(a)?a.length>0:typeof a=="object"&&a!==null?Object.keys(a).length>0:a)&&t!==Wn&&this.unreadErrorsCount.update(s=>s+1);}}),Jd(()=>{let i=this.selectedTabIndex();i===bi?mg(()=>{this.unreadEventsCount.set(0);}):i===Wn&&mg(()=>{this.unreadErrorsCount.set(0);});});}ngOnInit(){let i=this.startupResolution.isExtensionMode();this.isExtension.set(i),i&&this.isDebugCollapsed.set(true);}toggleDebugCollapse(){this.isDebugCollapsed.update(i=>!i);}clearAllLogs(){this.rawMessages()?.clearLogs(),this.events()?.clearLogs(),this.errors()?.clearLogs();}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-workspace"]],viewQuery:function(e,t){e&1&&Jh(t.rawMessages,rt,5)(t.events,it,5)(t.errors,ot,5),e&2&&nw(3);},decls:41,vars:8,consts:[[1,"workspace-container"],[1,"left-panel"],[1,"right-panel"],[1,"preview-section"],[1,"preview-frame-container"],[1,"frame-header"],[1,"frame-body"],[1,"debug-section"],[1,"debug-header-controls"],["mat-icon-button","","aria-label","Clear Logs","matTooltip","Clear all log tabs","matTooltipPosition","left",3,"click"],["aria-hidden","true"],["mat-icon-button","","aria-label","Toggle Debug Panel","matTooltipPosition","left",3,"click","matTooltip"],["fitInkBarToContent","",3,"selectedIndexChange","selectedIndex"],["label","Data Model"],[1,"tab-content-container"],["mat-tab-label",""],["label","Raw Messages"],["label","Mock Rules"],["matBadgeOverlap","false","matBadgeColor","accent",1,"events-badge-host",3,"matBadge","matBadgeHidden"],["matBadgeOverlap","false","matBadgeColor","warn",1,"errors-badge-host",3,"matBadge","matBadgeHidden"]],template:function(e,t){e&1&&(zi$1(0,"div",0)(1,"div",1),Hh(2,"a2ui-composer-chat-panel"),Ou(),zi$1(3,"div",2)(4,"div",3)(5,"div",4)(6,"div",5)(7,"span"),Tw(8,"Rendered A2UI Preview"),Ou()(),zi$1(9,"div",6),Hh(10,"a2ui-composer-rendered-frame"),Ou()(),zi$1(11,"div",4)(12,"div",5)(13,"span"),Tw(14,"A2UI JSON Editor"),Ou()(),zi$1(15,"div",6),Hh(16,"a2ui-composer-raw-frame"),Ou()()(),zi$1(17,"div",7)(18,"div",8)(19,"button",9),qh("click",function(){return t.clearAllLogs()}),zi$1(20,"mat-icon",10),Tw(21,"delete"),Ou()(),zi$1(22,"button",11),qh("click",function(){return t.toggleDebugCollapse()}),zi$1(23,"mat-icon",10),Tw(24),Ou()()(),zi$1(25,"mat-tab-group",12),dg("selectedIndexChange",function(o){return Nw(t.selectedTabIndex,o)||(t.selectedTabIndex=o),o}),zi$1(26,"mat-tab",13)(27,"div",14),Hh(28,"a2ui-composer-data-model"),Ou()(),zi$1(29,"mat-tab"),kh(30,Nr,2,2,"ng-template",15),zi$1(31,"div",14),Hh(32,"a2ui-composer-events"),Ou()(),zi$1(33,"mat-tab"),kh(34,zr,2,2,"ng-template",15),zi$1(35,"div",14),Hh(36,"a2ui-composer-errors"),Ou()(),zi$1(37,"mat-tab",16)(38,"div",14),Hh(39,"a2ui-composer-raw-messages"),Ou()(),FI(40,Hr,3,0,"mat-tab",17),Ou()()()()),e&2&&(rg("extension-mode",t.isExtension()),VD(17),rg("collapsed",t.isDebugCollapsed()),VD(5),Vh("matTooltip",t.isDebugCollapsed()?"Expand Debug Panel":"Collapse Debug Panel"),VD(2),ug(t.isDebugCollapsed()?"keyboard_arrow_up":"keyboard_arrow_down"),VD(),lg("selectedIndex",t.selectedTabIndex),VD(15),LI(t.showMockRules()?40:-1));},dependencies:[mn,pn,gt,un,it,ot,rt,hn,pi,jn,Vn,mi,Gd,Hd,Cd,Uo$1,no$1,Ae,gi,hi],styles:["[_nghost-%COMP%]{display:block;height:100%}.workspace-container[_ngcontent-%COMP%]{display:flex;gap:16px;height:100%;box-sizing:border-box;padding:16px}.workspace-container.extension-mode[_ngcontent-%COMP%]{flex-direction:column}.workspace-container.extension-mode[_ngcontent-%COMP%]   .left-panel[_ngcontent-%COMP%]{flex:0 0 auto}.workspace-container.extension-mode[_ngcontent-%COMP%]   .right-panel[_ngcontent-%COMP%]{flex:1}.workspace-container.extension-mode[_ngcontent-%COMP%]   .preview-section[_ngcontent-%COMP%]{flex-direction:column}.left-panel[_ngcontent-%COMP%]{flex:0 0 300px;width:300px;max-width:300px;min-width:300px;display:flex;flex-direction:column;overflow:hidden}.right-panel[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;gap:16px;min-width:0;height:100%}.preview-section[_ngcontent-%COMP%]{display:flex;flex-direction:row;gap:16px;flex:1;min-height:0}.preview-frame-container[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;border:1px solid var(--mat-sys-outline-variant);border-radius:8px;background-color:var(--mat-sys-surface);box-shadow:0 2px 4px #0000000d;overflow:hidden;min-width:0}.frame-header[_ngcontent-%COMP%]{padding:12px 16px;background-color:var(--mat-sys-surface-container);border-bottom:1px solid var(--mat-sys-outline-variant);font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);display:flex;align-items:center;flex-shrink:0}.frame-body[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;overflow:auto;box-sizing:border-box;min-height:0}.debug-section[_ngcontent-%COMP%]{position:relative;transition:all .2s ease-in-out;height:320px;display:flex;flex-direction:column;background-color:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:8px;padding:8px;box-shadow:0 2px 4px #0000000d}.debug-section.collapsed[_ngcontent-%COMP%]{height:48px!important;flex:0 0 auto;overflow:hidden}.debug-header-controls[_ngcontent-%COMP%]{position:absolute;right:8px;top:8px;z-index:10;display:flex;gap:4px}.tab-content-container[_ngcontent-%COMP%]{padding:12px 8px;flex:1;display:flex;flex-direction:column;min-height:0;box-sizing:border-box}  .mat-mdc-tab-group{height:100%;display:flex;flex-direction:column;min-height:0}  .mat-mdc-tab-group .mat-mdc-tab-header{width:fit-content!important;max-width:calc(100% - 88px)!important;box-sizing:border-box;flex-shrink:0}  .mat-mdc-tab-group .mat-mdc-tab-header .mat-badge:not(.mat-badge-hidden) .mat-badge-content{width:16px!important;height:16px!important;min-width:16px!important;border-radius:50%!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;line-height:1!important;font-size:10px!important;top:-4px!important;right:-18px!important}  .mat-mdc-tab-group .mat-mdc-tab-header .events-badge-host .mat-badge-content{background-color:#3f51b5!important;color:#fff!important}  .mat-mdc-tab-group .mat-mdc-tab-header .errors-badge-host .mat-badge-content{background-color:#ba1a1a!important;color:#fff!important}  .mat-mdc-tab-group .mat-mdc-tab-body-wrapper{flex:1;display:flex;flex-direction:column;min-height:0}  .mat-mdc-tab-group .mat-mdc-tab-body{flex:1;display:flex;flex-direction:column;min-height:0}  .mat-mdc-tab-group .mat-mdc-tab-body-content{height:100%!important;display:flex;flex-direction:column;flex:1}  .mat-mdc-tab-group .mdc-tab{flex:0 0 auto!important;min-width:auto!important;padding:0 16px!important}"]})};export{fi as ComposerWorkspace};