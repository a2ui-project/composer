import {g,k as Qg,l as tn,M as M1,J as Jd,h as hI,z as zi$1,H as Hh,O as Ou,T as Tw,a as qh,n as dg,p as kh,F as FI,r as rg,V as VD,b as Vh,u as ug,s as lg,L as LI,v as Jh,w as nw,A as O1,C as RC,y as ys$1,G as Gw,E as G,I as j,x as xn$1,P as T,S as Le,U as ee,Z as mg,$ as zm,a0 as se$1,a1 as Vt,a2 as ku,a3 as Uh,a4 as Pu,a5 as Kh,d as ew,t as tw,a6 as qw,a7 as Wm,a8 as _E,a9 as ME,o as os$1,D as Dr$1,aa as tp,_ as _u,ab as Rh,ac as Ow,ad as Kn$1,ae as $c,af as x1,K as KI,ag as Ph,B as Bh,Q as Qh,ah as zn$1,Y as Yn$1,ai as gC,aj as K,ak as H,al as xi$1,am as We,an as ey,ao as Um,ap as R1,aq as VI,ar as jh,as as HI,c as hw,at as ng,au as ah,W,av as Tn,X as XI,aw as yg,ax as jt,ay as e,N,az as re,aA as Vm,aB as Ve,q as qI,R as Rd,aC as YI,i as Od,aD as Jm,aE as mD,aF as Gd$1,aG as Fu,aH as Lu,aI as kw,aJ as cr$1,aK as Gh,aL as II,aM as jI,aN as BI,f as rw,aO as $s$1,aP as ty,aQ as rd,aR as x,aS as fr$1,aT as Lw,aU as Bw,j as ju,aV as _p,aW as Nw}from'./main.js';import {n as no$1,A as Ae$1,F as Fe,B,Y as Ye$1,u as ue,J as Jt,a as ae$1,_ as _e,s as st,q as q$1,b as J,V,R as Rt,G as G$1}from'./chunk-DYz_NQQ6.js';import {_ as _t,a as ae,m as mn,e as en,n as nn,b as an,r as rn,t as tn$1,l as ln,o as on,s as sn,c as cn,d as dn,$ as $t,f as oi,g as ri$1,q as qt}from'./chunk-DxHJHCjt.js';import {H as H$1,K as Ke,X as Xe$1}from'./chunk-5cQmHzcT.js';import {s as se,i as it,r as rn$1,o as on$1,V as Ve$1}from'./chunk-HAS8cOA2.js';import {X as Xt,$ as $i$1,a as E,G as Gd,H as Hd,w as wd,U as Uo$1,o as oo$1,E as Ed,f as fu,C as Ci$1,l as lu,b as Rs$1,T as Tu,q,r as ri$2,x as xe,R,c as Cn$1,d as ao$1,e as Gc,g as ac,z as zr$1,h as St,A as At,i as Gr$1,Q as Qt,j as ll,k as jo$1,m as Ao$1,S as Se,n as wn$1,p as Co$1,s as so$1,t as bn$1}from'./chunk-cmPPiF6x.js';var Va=`[
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
`;var pn="updateComponents",Bn="components",Gi="registerMockRules",Ui="mockRulesConfig",Ji="rules",Qi="id",qi="children",Wa="mock_rules_container",Ye=class n{destroyRef=g(Le);chatState=g(ae);catalogManagement=g(oo$1);_activeDraft=tn("");activeDraft=this._activeDraft.asReadonly();_draftInput=tn("");constructor(){Jd(()=>{let a=this.catalogManagement.activeCatalog();if(a){let e=a.catalogId||"";mg(()=>{let t=this._activeDraft(),i=this.getCatalogIdFromDraft(t);(t===""||i!==e)&&this._activeDraft.set(this.getInitialDraft(e));});}}),Tu(this._draftInput).pipe(Jm(1),zm(300),Wm(),$i$1(this.destroyRef)).subscribe(a=>{this.syncLayoutToHistory(a);});}updateDraft(a){this._activeDraft.set(a),this._draftInput.set(a);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(a){this._activeDraft.set(a);}flushDraft(){let e=this.catalogManagement.activeCatalog()?.catalogId||"";this._activeDraft.set(this.getInitialDraft(e));}getInitialDraft(a){return a==="https://a2ui.org/specification/v0_9/basic_catalog.json"?Va:a?qt([{version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:a,sendDataModel:true}}]):""}getCatalogIdFromDraft(a){let e=a.trim();if(!e)return null;try{let t=JSON.parse(e);if(Array.isArray(t)){for(let i of t)if(i?.createSurface?.catalogId)return i.createSurface.catalogId}else if(t?.createSurface?.catalogId)return t.createSurface.catalogId}catch{}return null}syncLayoutToHistory(a){let e=this.sanitizeLayout(a),t=this.chatState.chatHistory();if(t.length===0){this.chatState.setChatHistory([{role:"user",content:e}]);return}let i=t[t.length-1];if(i.role==="user"&&i.content.trim().startsWith("[")){let r=[...t];r[r.length-1]={role:"user",content:e},this.chatState.setChatHistory(r);}else this.chatState.updateChatHistory(r=>[...r,{role:"user",content:e}]);}sanitizeLayout(a){let e=a.trim();if(!e)return "";let t=$t(e);if(t){let i=t.map(o=>o&&typeof o=="object"&&!Array.isArray(o)?this.sanitizeBlock(o):o).filter(o=>o!==null);return qt(i)}return console.warn("[StateSync] Discarding malformed layout JSON during sanitization: not a valid JSON array"),""}sanitizeBlock(a){if(a[Gi]||a[Ui])return null;if(a[pn]&&typeof a[pn]=="object"&&a[pn]!==null){let e=a[pn];if(Array.isArray(e[Bn])){let t=e[Bn].filter(i=>i!==null&&typeof i=="object"&&!Array.isArray(i)?i[Qi]!==Wa:true);e[Bn]=t.map(i=>i!==null&&typeof i=="object"&&!Array.isArray(i)?this.sanitizeComponentObject(i):i);}}return a}sanitizeComponentObject(a){let e={};for(let[t,i]of Object.entries(a))t===Ji||/^mock/i.test(t)||(t===qi&&Array.isArray(i)?e[t]=i.filter(o=>o!==Wa):i!==null&&typeof i=="object"&&!Array.isArray(i)?e[t]=this.sanitizeComponentObject(i):Array.isArray(i)?e[t]=i.map(o=>o!==null&&typeof o=="object"&&!Array.isArray(o)?this.sanitizeComponentObject(o):o):e[t]=i);return e}static \u0275fac=function(e){return new(e||n)};static \u0275prov=N({token:n,factory:n.\u0275fac,providedIn:"root"})};function Ga(n){let a=/^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i,e=n.replace(a,"");if(e.startsWith("{"))try{let t=JSON.parse(e);if(t.error&&t.error.message)return t.error.message}catch{}return e}function un(n){if(!n)return n;let a=n.replace(/AIzaSy[A-Za-z0-9_-]+/g,"redacted for your protection");return a=a.replace(/(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,i)=>i.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),a=a.replace(/(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,i)=>i.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),a}var hn=class n{catalogManagement=g(oo$1);configProvider=g(ys$1);stateSync=g(Ye);chatState=g(ae);llmClient=g(e);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;lastSeenRendererUrl="";isFirstUrlEffectRun=true;constructor(){Jd(()=>{let a=this.configProvider.rendererUrl();mg(()=>{if(this.isFirstUrlEffectRun){this.isFirstUrlEffectRun=false,this.lastSeenRendererUrl=a;return}this.lastSeenRendererUrl!==a&&queueMicrotask(()=>this.wipeEnvironmentCache()),this.lastSeenRendererUrl=a;});});}wipeEnvironmentCache(){this.chatState.setChatHistory([]),this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}getFullMessageContext(){return [{role:"system",content:this.systemPrompt()},...this.chatState.chatHistory().filter(a=>a.role!=="error")]}async submitPrompt(a,e=[]){let t=a.trim();if(!t&&e.length===0)return;this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(o=>[...o,{role:"user",content:t,attachments:e.length>0?e:void 0}]);let i=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",i),this.chatState.updateChatHistory(o=>[...o,{role:"model",content:" \u25CF\u25CF\u25CF"}]);try{let o=await this.llmClient.chatStream(i),r="";for await(let h of o.contentStream)r+=h,this.chatState.updateChatHistory(g=>{let M=[...g],G=M.length-1;return M[G]?.role==="model"&&(M[G]={role:"model",content:r+" \u25CF\u25CF\u25CF"}),M});let c=await o.complete;this.chatState.addRawLlmLog("LLM_RESPONSE",c),this.chatState.updateChatHistory(h=>{let g=[...h],M=g.length-1;return g[M]?.role==="model"&&(g[M]={role:"model",content:c}),g}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(c);}catch(o){this.handleConnectivityError(o,t,e);}}async processRawLlmPayload(a){let e=[];try{e=this.parseAndHealJsonLines(a);}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}this.chatState.setPipelineStatus("validating");try{let t={type:E.RENDER_A2UI,payload:e},i=console.error,o=[];console.error=(...h)=>{o.push(h.map(g=>typeof g=="object"?JSON.stringify(g):String(g)).join(" "));};let r=!1;try{r=Qt.validateOutgoingMessage(t);}finally{console.error=i;}if(!r)throw new Error(`Outgoing message envelope validation failed:
${o.join(`
`)}`);this.runCatalogComponentSchemaCheck(e),this.chatState.setPipelineStatus("ready");let c=qt(e);this.stateSync.commitLayoutFromLlm(c),this.chatState.setProgrammaticStreamActive(!1);}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}}parseAndHealJsonLines(a){let e=a.trim(),t=/```json\s*([\s\S]*?)\s*```/,i=e.match(t);i&&i[1]&&(this.chatState.setPipelineStatus("healing"),e=i[1].trim());let o=e.split(`
`).map(c=>c.trim()).filter(c=>c.length>0),r=[];for(let c of o)if(!(c.startsWith("```")||!c.startsWith("{")&&!c.startsWith("[")))try{r.push(JSON.parse(c));}catch{this.chatState.setPipelineStatus("healing");let g=this.attemptSyntaxHealing(c);if(g!==null)r.push(g);else if(c.includes('"version"')||c.includes('"createSurface"'))throw new Error(`Syntax recovery failed for corrupted JSON Line:
"${c}"`)}if(r.length===0)throw new Error("No valid A2UI JSON layout command block could be parsed or recovered.");return r}attemptSyntaxHealing(a){let e=a.trim();e=e.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(e)}catch{for(let i=1;i<=5;i++)try{return JSON.parse(e+"}".repeat(i))}catch{}for(let i=1;i<=3;i++)for(let o=1;o<=3;o++)try{return JSON.parse(e+"]".repeat(i)+"}".repeat(o))}catch{}}return null}runCatalogComponentSchemaCheck(a){let e=this.catalogManagement.activeCatalog(),t={};if(e&&e.components)for(let o of Object.keys(e.components)){let r=o.toLowerCase().replace(/[^a-z]/g,"");t[r]=o;}let i={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let o of a){if(!o||typeof o!="object")continue;let c=o.updateComponents;if(!c||typeof c!="object"||!Array.isArray(c.components))continue;let h=[];for(let g of c.components){if(!g||typeof g!="object"||Array.isArray(g)){h.push(g);continue}let M=g,G=M.component;if(M.name&&!M.component&&(this.chatState.setPipelineStatus("healing"),G=M.name,M.component=G,delete M.name),typeof G!="string")throw new Error("Component declaration is missing component type name string.");let tt=G;if(e&&e.components&&!e.components[G]){let Q=G.toLowerCase().replace(/[^a-z]/g,""),be=t[Q];if(!be){let ve=i[Q];ve&&(be=t[ve]);}if(be&&e.components[be])this.chatState.setPipelineStatus("healing"),tt=be;else {let ve=Q?Object.keys(e.components).find(oa=>oa.toLowerCase().includes(Q)||Q.includes(oa.toLowerCase())):void 0;if(ve)this.chatState.setPipelineStatus("healing"),tt=ve;else throw new Error(`Validation failure: Component type "${G}" is not registered in the active custom catalog.`)}}let bt=this.sanitizeComponentObject(M);bt.component=tt,h.push(bt);}c.components=h;}}sanitizeValue(a){if(a===null||typeof a!="object")return a;if(Array.isArray(a))return a.map(i=>this.sanitizeValue(i));let e=a,t={};for(let[i,o]of Object.entries(e))i==="rules"||/^mock/i.test(i)||(t[i]=this.sanitizeValue(o));return t}sanitizeComponentObject(a){return this.sanitizeValue(a)}TEST_ONLY={sanitizeComponentObject:a=>this.sanitizeComponentObject(a)};isConnectivityError(a){return a.includes("failed to fetch")||a.includes("fetch")||a.includes("timeout")||a.includes("504")||a.includes("proxy")||a.includes("networkerror")||a.includes("connection")||a.includes("401")||a.includes("403")||a.includes("credential")||a.includes("quota")||a.includes("blocked")||a.includes("503")||a.includes("unavailable")||a.includes("api key")||a.includes("apikey")}parseError(a,e,t){let i="Connectivity Failure",o=e.trim().startsWith("{"),r=o?"A connectivity error occurred.":e,c=o?"Details: "+e:void 0,h="Tip: Please check your network proxy configurations or verify your settings to restore connections.",g=!!t,M=true;return a.includes("validation")||a.includes("syntax recovery")||a.includes("validation failure")?{errorTitle:"Validation Failure",errorMessage:"The generated layout contains invalid components or structure.",errorTip:"Tip: Try rephrasing your prompt to guide the model to generate valid components.",isRetryable:!!t,showDetails:true,errorDetails:"Details: "+e}:a.includes("503")||a.includes("unavailable")?{errorTitle:"Service Unavailable",errorMessage:"The generative service is temporarily unavailable. Please try again later.",errorTip:"",isRetryable:true,showDetails:false}:a.includes("high demand")?{errorTitle:"Model High Demand",errorMessage:"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",errorTip:"",isRetryable:true,showDetails:false}:a.includes("timeout")||a.includes("504")?{errorTitle:"REST Gateway Timeout",errorMessage:"Remote generation service did not respond.",errorDetails:"Details: "+e,errorTip:h,isRetryable:g,showDetails:true}:a.includes("api key")||a.includes("apikey")?{errorTitle:"Invalid API Key",errorMessage:"The provided Gemini API key is invalid or missing.",errorDetails:"Details: "+e,errorTip:"Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.",isRetryable:g,showDetails:true}:a.includes("auth")||a.includes("401")||a.includes("403")||a.includes("credential")?{errorTitle:"Authentication Refused",errorMessage:"Authentication failed. Please verify your credentials in Settings.",errorDetails:"Details: "+e,errorTip:h,isRetryable:g,showDetails:true}:a.includes("quota")||a.includes("blocked")||a.includes("429")?{errorTitle:"GenAI Service Blocked",errorMessage:"Resource quota depleted or content safety limits triggered.",errorDetails:"Details: "+e,errorTip:h,isRetryable:g,showDetails:true}:{errorTitle:i,errorMessage:r,errorTip:h,isRetryable:g,showDetails:M,errorDetails:c}}handleConnectivityError(a,e,t=[]){let i=a instanceof Error?a.message:String(a),o=i.toLowerCase(),r=Ga(i);this.isConnectivityError(o)?this.chatState.setPipelineStatus("idle"):this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false);let c=this.parseError(o,r,e),h="";a instanceof Error?h="Exception: "+a.message+`
Stack: `+(a.stack||"None"):h="Unknown Exception: "+JSON.stringify(a);let g="";c.errorDetails&&(g+=c.errorDetails+`

`),g+=h;let M=un(c.errorMessage),G=c.showDetails?un(g):void 0,tt=c.showDetails?un(c.errorTip):void 0;console.error("Gemini chat execution failed:",a),this.chatState.updateChatHistory(bt=>{let Q=[...bt],be=Q.length-1,ve=j({role:"error",content:M,errorTitle:c.errorTitle,errorMessage:M,errorDetails:G,errorTip:tt},c.isRetryable?{isRetryable:true,originalPrompt:e,attachments:t}:{});return be>=0&&Q[be].role==="model"?(Q[be]=ve,Q):(Q.push(ve),Q)});}systemPrompt=Gw(()=>{let a=this.catalogManagement.activeCatalog();return a?this.generateSystemPrompt(qt(a)):`You are an AI assistant designed to help model mock screens inside A2UI Composer shell.
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

  `}static \u0275fac=function(e){return new(e||n)};static \u0275prov=N({token:n,factory:n.\u0275fac,providedIn:"root"})};function Yi(n,a){}var Oe=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;positionStrategy;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;scrollStrategy;closeOnNavigation=true;closeOnDestroy=true;closeOnOverlayDetachments=true;disableAnimations=false;providers;container;templateContext;bindings};var jn=(()=>{class n extends G$1{_elementRef=g(Yn$1);_focusTrapFactory=g(Co$1);_config;_interactivityChecker=g(zr$1);_ngZone=g(K);_focusMonitor=g(At);_renderer=g(ah);_changeDetectorRef=g(gC);_injector=g(re);_platform=g(R);_document=g(W);_portalOutlet;_focusTrapped=new ee;_focusTrap=null;_elementFocusedBeforeDialogWasOpened=null;_closeInteractionType=null;_ariaLabelledByQueue=[];_isDestroyed=false;constructor(){super(),this._config=g(Oe,{optional:true})||new Oe,this._config.ariaLabelledBy&&this._ariaLabelledByQueue.push(this._config.ariaLabelledBy);}_addAriaLabelledBy(e){this._ariaLabelledByQueue.push(e),this._changeDetectorRef.markForCheck();}_removeAriaLabelledBy(e){let t=this._ariaLabelledByQueue.indexOf(e);t>-1&&(this._ariaLabelledByQueue.splice(t,1),this._changeDetectorRef.markForCheck());}_contentAttached(){this._initializeFocusTrap(),this._captureInitialFocus();}_captureInitialFocus(){this._trapFocus();}ngOnDestroy(){this._focusTrapped.complete(),this._isDestroyed=true,this._restoreFocus();}attachComponentPortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachComponentPortal(e);return this._contentAttached(),t}attachTemplatePortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachTemplatePortal(e);return this._contentAttached(),t}attachDomPortal=e=>{this._portalOutlet.hasAttached();let t=this._portalOutlet.attachDomPortal(e);return this._contentAttached(),t};_recaptureFocus(){this._containsFocus()||this._trapFocus();}_forceFocus(e,t){this._interactivityChecker.isFocusable(e)||(e.tabIndex=-1,this._ngZone.runOutsideAngular(()=>{let i=()=>{o(),r(),e.removeAttribute("tabindex");},o=this._renderer.listen(e,"blur",i),r=this._renderer.listen(e,"mousedown",i);})),e.focus(t);}_focusByCssSelector(e,t){let i=this._elementRef.nativeElement.querySelector(e);i&&this._forceFocus(i,t);}_trapFocus(e){this._isDestroyed||mD(()=>{let t=this._elementRef.nativeElement;switch(this._config.autoFocus){case  false:case "dialog":this._containsFocus()||t.focus(e);break;case  true:case "first-tabbable":this._focusTrap?.focusInitialElement(e)||this._focusDialogContainer(e);break;case "first-heading":this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]',e);break;default:this._focusByCssSelector(this._config.autoFocus,e);break}this._focusTrapped.next();},{injector:this._injector});}_restoreFocus(){let e=this._config.restoreFocus,t=null;if(typeof e=="string"?t=this._document.querySelector(e):typeof e=="boolean"?t=e?this._elementFocusedBeforeDialogWasOpened:null:e&&(t=e),this._config.restoreFocus&&t&&typeof t.focus=="function"){let i=so$1(),o=this._elementRef.nativeElement;(!i||i===this._document.body||i===o||o.contains(i))&&(this._focusMonitor?(this._focusMonitor.focusVia(t,this._closeInteractionType),this._closeInteractionType=null):t.focus());}this._focusTrap&&this._focusTrap.destroy();}_focusDialogContainer(e){this._elementRef.nativeElement.focus?.(e);}_containsFocus(){let e=this._elementRef.nativeElement,t=so$1();return e===t||e.contains(t)}_initializeFocusTrap(){this._platform.isBrowser&&(this._focusTrap=this._focusTrapFactory.create(this._elementRef.nativeElement),this._document&&(this._elementFocusedBeforeDialogWasOpened=so$1()));}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["cdk-dialog-container"]],viewQuery:function(t,i){if(t&1&&Kh(Ye$1,7),t&2){let o;ew(o=tw())&&(i._portalOutlet=o.first);}},hostAttrs:["tabindex","-1",1,"cdk-dialog-container"],hostVars:6,hostBindings:function(t,i){t&2&&Bh("id",i._config.id||null)("role",i._config.role)("aria-modal",i._config.ariaModal)("aria-labelledby",i._config.ariaLabel?null:i._ariaLabelledByQueue[0])("aria-label",i._config.ariaLabel)("aria-describedby",i._config.ariaDescribedBy||null);},features:[Rh],decls:1,vars:0,consts:[["cdkPortalOutlet",""]],template:function(t,i){t&1&&kh(0,Yi,0,0,"ng-template",0);},dependencies:[Ye$1],styles:[`.cdk-dialog-container {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
  max-height: inherit;
}
`],encapsulation:2,changeDetection:1})}return n})(),dt=class{overlayRef;config;componentInstance=null;componentRef=null;containerInstance;disableClose;closed=new ee;backdropClick;keydownEvents;outsidePointerEvents;id;_detachSubscription;constructor(a,e){this.overlayRef=a,this.config=e,this.disableClose=e.disableClose,this.backdropClick=a.backdropClick(),this.keydownEvents=a.keydownEvents(),this.outsidePointerEvents=a.outsidePointerEvents(),this.id=e.id,this.keydownEvents.subscribe(t=>{t.keyCode===27&&!this.disableClose&&!Gr$1(t)&&(t.preventDefault(),this.close(void 0,{focusOrigin:"keyboard"}));}),this.backdropClick.subscribe(()=>{!this.disableClose&&this._canClose()?this.close(void 0,{focusOrigin:"mouse"}):this.containerInstance._recaptureFocus?.();}),this._detachSubscription=a.detachments().subscribe(()=>{e.closeOnOverlayDetachments!==false&&this.close();});}close(a,e){if(this._canClose(a)){let t=this.closed;this.containerInstance._closeInteractionType=e?.focusOrigin||"program",this._detachSubscription.unsubscribe(),this.overlayRef.dispose(),t.next(a),t.complete(),this.componentInstance=this.containerInstance=null;}}updatePosition(){return this.overlayRef.updatePosition(),this}updateSize(a="",e=""){return this.overlayRef.updateSize({width:a,height:e}),this}addPanelClass(a){return this.overlayRef.addPanelClass(a),this}removePanelClass(a){return this.overlayRef.removePanelClass(a),this}_canClose(a){let e=this.config;return !!this.containerInstance&&(!e.closePredicate||e.closePredicate(a,e,this.componentInstance))}},Zi=new T("DialogScrollStrategy",{providedIn:"root",factory:()=>{let n=g(re);return ()=>ae$1(n)}}),Xi=new T("DialogData"),eo=new T("DefaultDialogConfig");function to(n){let a=tn(n),e=new We;return {valueSignal:a,get value(){return a()},change:e,ngOnDestroy(){e.complete();}}}var zn=(()=>{class n{_injector=g(re);_defaultOptions=g(eo,{optional:true});_parentDialog=g(n,{optional:true,skipSelf:true});_overlayContainer=g(_e);_idGenerator=g(Cn$1);_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new ee;_afterOpenedAtThisLevel=new ee;_ariaHiddenElements=new Map;_scrollStrategy=g(Zi);get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}afterAllClosed=Vm(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(ey(void 0)));open(e,t){let i=this._defaultOptions||new Oe;t=j(j({},i),t),t.id=t.id||this._idGenerator.getId("cdk-dialog-"),t.id&&this.getDialogById(t.id);let o=this._getOverlayConfig(t),r=st(this._injector,o),c=new dt(r,t),h=this._attachContainer(r,c,t);if(c.containerInstance=h,!this.openDialogs.length){let g=this._overlayContainer.getContainerElement();h._focusTrapped?h._focusTrapped.pipe(Tn(1)).subscribe(()=>{this._hideNonDialogContentFromAssistiveTechnology(g);}):this._hideNonDialogContentFromAssistiveTechnology(g);}return this._attachDialogContent(e,c,h,t),this.openDialogs.push(c),c.closed.subscribe(()=>this._removeOpenDialog(c,true)),this.afterOpened.next(c),c}closeAll(){Nn(this.openDialogs,e=>e.close());}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){Nn(this._openDialogsAtThisLevel,e=>{e.config.closeOnDestroy===false&&this._removeOpenDialog(e,false);}),Nn(this._openDialogsAtThisLevel,e=>e.close()),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete(),this._openDialogsAtThisLevel=[];}_getOverlayConfig(e){let t=new q$1({positionStrategy:e.positionStrategy||ue().centerHorizontally().centerVertically(),scrollStrategy:e.scrollStrategy||this._scrollStrategy(),panelClass:e.panelClass,hasBackdrop:e.hasBackdrop,direction:e.direction,minWidth:e.minWidth,minHeight:e.minHeight,maxWidth:e.maxWidth,maxHeight:e.maxHeight,width:e.width,height:e.height,disposeOnNavigation:e.closeOnNavigation,disableAnimations:e.disableAnimations});return e.backdropClass&&(t.backdropClass=e.backdropClass),t}_attachContainer(e,t,i){let o=i.injector||i.viewContainerRef?.injector,r=[{provide:Oe,useValue:i},{provide:dt,useValue:t},{provide:J,useValue:e}],c;i.container?typeof i.container=="function"?c=i.container:(c=i.container.type,r.push(...i.container.providers(i))):c=jn;let h=new V(c,i.viewContainerRef,re.create({parent:o||this._injector,providers:r}));return e.attach(h).instance}_attachDialogContent(e,t,i,o){if(e instanceof zn$1){let r=this._createInjector(o,t,i,void 0),c={$implicit:o.data,dialogRef:t};o.templateContext&&(c=j(j({},c),typeof o.templateContext=="function"?o.templateContext():o.templateContext)),i.attachTemplatePortal(new B(e,null,c,r));}else {let r=this._createInjector(o,t,i,this._injector),c=i.attachComponentPortal(new V(e,o.viewContainerRef,r,null,o.bindings));t.componentRef=c,t.componentInstance=c.instance;}}_createInjector(e,t,i,o){let r=e.injector||e.viewContainerRef?.injector,c=[{provide:Xi,useValue:e.data},{provide:dt,useValue:t}];return e.providers&&(typeof e.providers=="function"?c.push(...e.providers(t,e,i)):c.push(...e.providers)),e.direction&&(!r||!r.get(jo$1,null,{optional:true}))&&c.push({provide:jo$1,useValue:to(e.direction)}),re.create({parent:r||o,providers:c})}_removeOpenDialog(e,t){let i=this.openDialogs.indexOf(e);i>-1&&(this.openDialogs.splice(i,1),this.openDialogs.length||(this._ariaHiddenElements.forEach((o,r)=>{o?r.setAttribute("aria-hidden",o):r.removeAttribute("aria-hidden");}),this._ariaHiddenElements.clear(),t&&this._getAfterAllClosed().next()));}_hideNonDialogContentFromAssistiveTechnology(e){if(e.parentElement){let t=e.parentElement.children;for(let i=t.length-1;i>-1;i--){let o=t[i];o!==e&&o.nodeName!=="SCRIPT"&&o.nodeName!=="STYLE"&&!o.hasAttribute("aria-live")&&!o.hasAttribute("popover")&&(this._ariaHiddenElements.set(o,o.getAttribute("aria-hidden")),o.setAttribute("aria-hidden","true"));}}}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ve({token:n,factory:n.\u0275fac})}return n})();function Nn(n,a){let e=n.length;for(;e--;)a(n[e]);}var Ja=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os$1({type:n});static \u0275inj=Dr$1({providers:[zn],imports:[Rt,Jt,Ao$1,Jt]})}return n})();function no(n,a){}var bn=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;position;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;delayFocusTrap=true;scrollStrategy;closeOnNavigation=true;enterAnimationDuration;exitAnimationDuration;bindings},Hn="mdc-dialog--open",Qa="mdc-dialog--opening",qa="mdc-dialog--closing",ao=150,io=75,oo=(()=>{class n extends jn{_animationStateChanged=new We;_animationsEnabled=!xe();_actionSectionCount=0;_hostElement=this._elementRef.nativeElement;_enterAnimationDuration=this._animationsEnabled?Ya(this._config.enterAnimationDuration)??ao:0;_exitAnimationDuration=this._animationsEnabled?Ya(this._config.exitAnimationDuration)??io:0;_animationTimer=null;_contentAttached(){super._contentAttached(),this._startOpenAnimation();}_startOpenAnimation(){this._animationStateChanged.emit({state:"opening",totalTime:this._enterAnimationDuration}),this._animationsEnabled?(this._hostElement.style.setProperty(Ka,`${this._enterAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(Qa,Hn)),this._waitForAnimationToComplete(this._enterAnimationDuration,this._finishDialogOpen)):(this._hostElement.classList.add(Hn),Promise.resolve().then(()=>this._finishDialogOpen()));}_startExitAnimation(){this._animationStateChanged.emit({state:"closing",totalTime:this._exitAnimationDuration}),this._hostElement.classList.remove(Hn),this._animationsEnabled?(this._hostElement.style.setProperty(Ka,`${this._exitAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(qa)),this._waitForAnimationToComplete(this._exitAnimationDuration,this._finishDialogClose)):Promise.resolve().then(()=>this._finishDialogClose());}_updateActionSectionCount(e){this._actionSectionCount+=e,this._changeDetectorRef.markForCheck();}_finishDialogOpen=()=>{this._clearAnimationClasses(),this._openAnimationDone(this._enterAnimationDuration);};_finishDialogClose=()=>{this._clearAnimationClasses(),this._animationStateChanged.emit({state:"closed",totalTime:this._exitAnimationDuration});};_clearAnimationClasses(){this._hostElement.classList.remove(Qa,qa);}_waitForAnimationToComplete(e,t){this._animationTimer!==null&&clearTimeout(this._animationTimer),this._animationTimer=setTimeout(t,e);}_requestAnimationFrame(e){this._ngZone.runOutsideAngular(()=>{typeof requestAnimationFrame=="function"?requestAnimationFrame(e):e();});}_captureInitialFocus(){this._config.delayFocusTrap||this._trapFocus();}_openAnimationDone(e){this._config.delayFocusTrap&&this._trapFocus(),this._animationStateChanged.next({state:"opened",totalTime:e});}ngOnDestroy(){super.ngOnDestroy(),this._animationTimer!==null&&clearTimeout(this._animationTimer);}attachComponentPortal(e){let t=super.attachComponentPortal(e);return t.location.nativeElement.classList.add("mat-mdc-dialog-component-host"),t}static \u0275fac=(()=>{let e;return function(i){return (e||(e=tp(n)))(i||n)}})();static \u0275cmp=hI({type:n,selectors:[["mat-dialog-container"]],hostAttrs:["tabindex","-1",1,"mat-mdc-dialog-container","mdc-dialog"],hostVars:10,hostBindings:function(t,i){t&2&&(Gh("id",i._config.id),Bh("aria-modal",i._config.ariaModal)("role",i._config.role)("aria-labelledby",i._config.ariaLabel?null:i._ariaLabelledByQueue[0])("aria-label",i._config.ariaLabel)("aria-describedby",i._config.ariaDescribedBy||null),rg("_mat-animation-noopable",!i._animationsEnabled)("mat-mdc-dialog-container-with-actions",i._actionSectionCount>0));},features:[Rh],decls:3,vars:0,consts:[[1,"mat-mdc-dialog-inner-container","mdc-dialog__container"],[1,"mat-mdc-dialog-surface","mdc-dialog__surface"],["cdkPortalOutlet",""]],template:function(t,i){t&1&&(zi$1(0,"div",0)(1,"div",1),kh(2,no,0,0,"ng-template",2),Ou()());},dependencies:[Ye$1],styles:[`.mat-mdc-dialog-container {
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
`],encapsulation:2,changeDetection:1})}return n})(),Ka="--mat-dialog-transition-duration";function Ya(n){return n==null?null:typeof n=="number"?n:n.endsWith("ms")?bn$1(n.substring(0,n.length-2)):n.endsWith("s")?bn$1(n.substring(0,n.length-1))*1e3:n==="0"?0:null}var gn=(function(n){return n[n.OPEN=0]="OPEN",n[n.CLOSING=1]="CLOSING",n[n.CLOSED=2]="CLOSED",n})(gn||{}),mt=class{_ref;_config;_containerInstance;componentInstance;componentRef=null;disableClose;id;_afterOpened=new cr$1(1);_beforeClosed=new cr$1(1);_result;_closeFallbackTimeout;_state=gn.OPEN;_closeInteractionType;constructor(a,e,t){this._ref=a,this._config=e,this._containerInstance=t,this.disableClose=e.disableClose,this.id=a.id,a.addPanelClass("mat-mdc-dialog-panel"),t._animationStateChanged.pipe(Vt(i=>i.state==="opened"),Tn(1)).subscribe(()=>{this._afterOpened.next(),this._afterOpened.complete();}),t._animationStateChanged.pipe(Vt(i=>i.state==="closed"),Tn(1)).subscribe(()=>{clearTimeout(this._closeFallbackTimeout),this._finishDialogClose();}),a.overlayRef.detachments().subscribe(()=>{this._beforeClosed.next(this._result),this._beforeClosed.complete(),this._finishDialogClose();}),Um(this.backdropClick(),this.keydownEvents().pipe(Vt(i=>i.keyCode===27&&!this.disableClose&&!Gr$1(i)))).subscribe(i=>{this.disableClose||(i.preventDefault(),Za(this,i.type==="keydown"?"keyboard":"mouse"));});}close(a){let e=this._config.closePredicate;e&&!e(a,this._config,this.componentInstance)||(this._result=a,this._containerInstance._animationStateChanged.pipe(Vt(t=>t.state==="closing"),Tn(1)).subscribe(t=>{this._beforeClosed.next(a),this._beforeClosed.complete(),this._ref.overlayRef.detachBackdrop(),this._closeFallbackTimeout=setTimeout(()=>this._finishDialogClose(),t.totalTime+100);}),this._state=gn.CLOSING,this._containerInstance._startExitAnimation());}afterOpened(){return this._afterOpened}afterClosed(){return this._ref.closed}beforeClosed(){return this._beforeClosed}backdropClick(){return this._ref.backdropClick}keydownEvents(){return this._ref.keydownEvents}updatePosition(a){let e=this._ref.config.positionStrategy;return a&&(a.left||a.right)?a.left?e.left(a.left):e.right(a.right):e.centerHorizontally(),a&&(a.top||a.bottom)?a.top?e.top(a.top):e.bottom(a.bottom):e.centerVertically(),this._ref.updatePosition(),this}updateSize(a="",e=""){return this._ref.updateSize(a,e),this}addPanelClass(a){return this._ref.addPanelClass(a),this}removePanelClass(a){return this._ref.removePanelClass(a),this}getState(){return this._state}_finishDialogClose(){this._state=gn.CLOSED,this._ref.close(this._result,{focusOrigin:this._closeInteractionType}),this.componentInstance=null;}};function Za(n,a,e){return n._closeInteractionType=a,n.close(e)}var Vn=new T("MatMdcDialogData"),ro=new T("mat-mdc-dialog-default-options"),so=new T("mat-mdc-dialog-scroll-strategy",{providedIn:"root",factory:()=>{let n=g(re);return ()=>ae$1(n)}}),pt=(()=>{class n{_defaultOptions=g(ro,{optional:true});_scrollStrategy=g(so);_parentDialog=g(n,{optional:true,skipSelf:true});_idGenerator=g(Cn$1);_injector=g(re);_dialog=g(zn);_animationsDisabled=xe();_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new ee;_afterOpenedAtThisLevel=new ee;dialogConfigClass=bn;_dialogRefConstructor;_dialogContainerType;_dialogDataToken;get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}afterAllClosed=Vm(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(ey(void 0)));constructor(){this._dialogRefConstructor=mt,this._dialogContainerType=oo,this._dialogDataToken=Vn;}open(e,t){let i;t=j(j({},this._defaultOptions||new bn),t),t.id=t.id||this._idGenerator.getId("mat-mdc-dialog-"),t.scrollStrategy=t.scrollStrategy||this._scrollStrategy();let o=this._dialog.open(e,G(j({},t),{positionStrategy:ue(this._injector).centerHorizontally().centerVertically(),disableClose:true,closePredicate:void 0,closeOnDestroy:false,closeOnOverlayDetachments:false,disableAnimations:this._animationsDisabled||t.enterAnimationDuration?.toLocaleString()==="0"||t.exitAnimationDuration?.toString()==="0",container:{type:this._dialogContainerType,providers:()=>[{provide:this.dialogConfigClass,useValue:t},{provide:Oe,useValue:t}]},templateContext:()=>({dialogRef:i}),providers:(r,c,h)=>(i=new this._dialogRefConstructor(r,t,h),i.updatePosition(t?.position),[{provide:this._dialogContainerType,useValue:h},{provide:this._dialogDataToken,useValue:c.data},{provide:this._dialogRefConstructor,useValue:i}])}));return i.componentRef=o.componentRef,i.componentInstance=o.componentInstance,this.openDialogs.push(i),this.afterOpened.next(i),i.afterClosed().subscribe(()=>{let r=this.openDialogs.indexOf(i);r>-1&&(this.openDialogs.splice(r,1),this.openDialogs.length||this._getAfterAllClosed().next());}),i}closeAll(){this._closeDialogs(this.openDialogs);}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){this._closeDialogs(this._openDialogsAtThisLevel),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete();}_closeDialogs(e){let t=e.length;for(;t--;)e[t].close();}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ve({token:n,factory:n.\u0275fac})}return n})(),Xa=(()=>{class n{dialogRef=g(mt,{optional:true});_elementRef=g(Yn$1);_dialog=g(pt);ariaLabel;type="button";dialogResult;_matDialogClose;ngOnInit(){this.dialogRef||(this.dialogRef=ii(this._elementRef,this._dialog.openDialogs));}ngOnChanges(e){let t=e._matDialogClose;t&&(this.dialogResult=t.currentValue);}_onButtonClick(e){this._elementRef.nativeElement.getAttribute("aria-disabled")!=="true"&&Za(this.dialogRef,e.screenX===0&&e.screenY===0?"keyboard":"mouse",this.dialogResult);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["","mat-dialog-close",""],["","matDialogClose",""]],hostVars:2,hostBindings:function(t,i){t&1&&qh("click",function(r){return i._onButtonClick(r)}),t&2&&Bh("aria-label",i.ariaLabel||null)("type",i.type);},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],type:"type",dialogResult:[0,"mat-dialog-close","dialogResult"],_matDialogClose:[0,"matDialogClose","_matDialogClose"]},exportAs:["matDialogClose"],features:[$c]})}return n})(),ei=(()=>{class n{_dialogRef=g(mt,{optional:true});_elementRef=g(Yn$1);_dialog=g(pt);ngOnInit(){this._dialogRef||(this._dialogRef=ii(this._elementRef,this._dialog.openDialogs)),this._dialogRef&&Promise.resolve().then(()=>{this._onAdd();});}ngOnDestroy(){this._dialogRef?._containerInstance&&Promise.resolve().then(()=>{this._onRemove();});}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n})}return n})(),ti=(()=>{class n extends ei{id=g(Cn$1).getId("mat-mdc-dialog-title-");_onAdd(){this._dialogRef._containerInstance?._addAriaLabelledBy?.(this.id);}_onRemove(){this._dialogRef?._containerInstance?._removeAriaLabelledBy?.(this.id);}static \u0275fac=(()=>{let e;return function(i){return (e||(e=tp(n)))(i||n)}})();static \u0275dir=_u({type:n,selectors:[["","mat-dialog-title",""],["","matDialogTitle",""]],hostAttrs:[1,"mat-mdc-dialog-title","mdc-dialog__title"],hostVars:1,hostBindings:function(t,i){t&2&&Gh("id",i.id);},inputs:{id:"id"},exportAs:["matDialogTitle"],features:[Rh]})}return n})(),ni=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["","mat-dialog-content",""],["mat-dialog-content"],["","matDialogContent",""]],hostAttrs:[1,"mat-mdc-dialog-content","mdc-dialog__content"],features:[II([Ke])]})}return n})(),ai=(()=>{class n extends ei{align;_onAdd(){this._dialogRef._containerInstance?._updateActionSectionCount?.(1);}_onRemove(){this._dialogRef._containerInstance?._updateActionSectionCount?.(-1);}static \u0275fac=(()=>{let e;return function(i){return (e||(e=tp(n)))(i||n)}})();static \u0275dir=_u({type:n,selectors:[["","mat-dialog-actions",""],["mat-dialog-actions"],["","matDialogActions",""]],hostAttrs:[1,"mat-mdc-dialog-actions","mdc-dialog__actions"],hostVars:6,hostBindings:function(t,i){t&2&&rg("mat-mdc-dialog-actions-align-start",i.align==="start")("mat-mdc-dialog-actions-align-center",i.align==="center")("mat-mdc-dialog-actions-align-end",i.align==="end");},inputs:{align:"align"},features:[Rh]})}return n})();function ii(n,a){let e=n.nativeElement.parentElement;for(;e&&!e.classList.contains("mat-mdc-dialog-container");)e=e.parentElement;return e?a.find(t=>t.id===e.id):null}var fn=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os$1({type:n});static \u0275inj=Dr$1({providers:[pt],imports:[Ja,Rt,Jt,Se]})}return n})();var _n=class n{data=g(Vn);static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-system-instructions-dialog"]],decls:9,vars:1,consts:[["mat-dialog-title",""],["tabindex","0","aria-label","System instructions text",1,"dialog-content-scrollable"],[1,"instructions-text"],["align","end"],["mat-button","","mat-dialog-close",""]],template:function(e,t){e&1&&(zi$1(0,"h2",0),Tw(1,"System Instructions"),Ou(),zi$1(2,"mat-dialog-content")(3,"div",1)(4,"pre",2),Tw(5),Ou()()(),zi$1(6,"mat-dialog-actions",3)(7,"button",4),Tw(8,"Close"),Ou()()),e&2&&(VD(5),ug(t.data));},dependencies:[fn,Xa,ti,ai,ni,wd,Ed],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-left:0!important;padding-right:0!important}.dialog-content-scrollable[_ngcontent-%COMP%]{margin:0 16px;max-height:400px;overflow-y:auto;background-color:var(--mat-sys-surface-container-high);padding:16px;border-radius:4px}.dialog-content-scrollable[_ngcontent-%COMP%]:focus{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.instructions-text[_ngcontent-%COMP%]{margin:0;font-family:Roboto Mono,Consolas,monospace;font-size:12px;line-height:1.5;white-space:pre-wrap;color:var(--mat-sys-on-surface)}"]})};function uo(n,a){n&1&&(zi$1(0,"mat-icon",7),Tw(1,"error"),Ou());}function ho(n,a){n&1&&Hh(0,"mat-spinner",8),n&2&&Vh("diameter",40);}function go(n,a){if(n&1){let e=qI();zi$1(0,"div",6),qh("click",function(){Rd(e);let i=YI();return Od(i.dismissOverlay())})("keydown.enter",function(){Rd(e);let i=YI();return Od(i.dismissOverlay())})("keydown.space",function(i){Rd(e);let o=YI();return i.preventDefault(),Od(o.dismissOverlay())}),FI(1,uo,2,0,"mat-icon",7)(2,ho,1,1,"mat-spinner",8),zi$1(3,"div",9),Tw(4),Ou()();}if(n&2){let e=YI();hw(e.pipelineStatus()),VD(),LI(e.pipelineStatus()==="failed"?1:2),VD(3),ug(e.pipelineStatusText());}}function bo(n,a){n&1&&(zi$1(0,"div",5)(1,"mat-icon",10),Tw(2,"vpn_key"),Ou(),zi$1(3,"p",11),Tw(4," This feature is only available with a valid Gemini API key. "),Ou(),zi$1(5,"a",12),Tw(6," Add Gemini API key "),Ou()());}function fo(n,a){n&1&&(zi$1(0,"div",14)(1,"span",26),Tw(2,"\u{1F4AC}"),Ou(),zi$1(3,"p",27),Tw(4," Ask Gemini to shape your layout interfaces or generate dynamic mock configurations schemas. Let's get started! "),Ou()());}function _o(n,a){if(n&1&&(zi$1(0,"span",35),Tw(1),Ou()),n&2){let e=YI(2).$implicit;VD(),ug(e.isSnapshot?"Canvas Revision Snapshot":"You");}}function yo(n,a){n&1&&(zi$1(0,"span",35),Tw(1,"Gemini AI"),Ou());}function vo(n,a){if(n&1&&(zi$1(0,"div",30),FI(1,_o,2,1,"span",35)(2,yo,2,0,"span",35),Ou()),n&2){let e=YI().$implicit;VD(),LI(e.role==="user"?1:e.role==="model"?2:-1);}}function xo(n,a){if(n&1&&Hh(0,"img",37),n&2){let e=YI().$implicit;Vh("src","data:"+e.mimeType+";base64,"+e.data,_p);}}function Co(n,a){n&1&&(zi$1(0,"mat-icon",38),Tw(1,"description"),Ou());}function wo(n,a){if(n&1&&(zi$1(0,"div",36),FI(1,xo,1,1,"img",37)(2,Co,2,0,"mat-icon",38),zi$1(3,"span",39),Tw(4),Ou()()),n&2){let e=a.$implicit,t=YI(5);VD(),LI(t.isImage(e.mimeType)?1:2),VD(2),Vh("title",e.name),VD(),ug(e.name);}}function Mo(n,a){if(n&1&&(zi$1(0,"div",32),VI(1,wo,5,3,"div",36,jI),Ou()),n&2){let e=YI().$implicit;VD(),HI(e.attachments);}}function ko(n,a){if(n&1&&(zi$1(0,"p",33),Tw(1),Ou()),n&2){let e=YI().$implicit;VD(),ju("A2UI JSON: ",e.componentCount," components");}}function Po(n,a){if(n&1&&(zi$1(0,"i"),Tw(1),Ou()),n&2){let e=YI().$implicit;VD(),ug(e.text);}}function Do(n,a){if(n&1&&Tw(0),n&2){let e=YI().$implicit;ju(" ",e.text," ");}}function To(n,a){if(n&1&&FI(0,Po,2,1,"i")(1,Do,1,1),n&2){let e=a.$implicit;LI(e.isRedacted?0:1);}}function Eo(n,a){if(n&1&&(zi$1(0,"i"),Tw(1),Ou()),n&2){let e=YI().$implicit;VD(),ug(e.text);}}function So(n,a){if(n&1&&Tw(0),n&2){let e=YI().$implicit;ju(" ",e.text," ");}}function Oo(n,a){if(n&1&&FI(0,Eo,2,1,"i")(1,So,1,1),n&2){let e=a.$implicit;LI(e.isRedacted?0:1);}}function Io(n,a){if(n&1&&(zi$1(0,"div",42),VI(1,Oo,2,1,null,null,jI),Ou()),n&2){let e=YI(2).$implicit,t=YI(3);VD(),HI(t.parseMessage(e.errorTip));}}function Ao(n,a){if(n&1&&(zi$1(0,"i"),Tw(1),Ou()),n&2){let e=YI().$implicit;VD(),ug(e.text);}}function Ro(n,a){if(n&1&&Tw(0),n&2){let e=YI().$implicit;ju(" ",e.text," ");}}function Lo(n,a){if(n&1&&FI(0,Ao,2,1,"i")(1,Ro,1,1),n&2){let e=a.$implicit;LI(e.isRedacted?0:1);}}function Fo(n,a){if(n&1&&(zi$1(0,"details",43)(1,"summary"),Tw(2,"Technical Details"),Ou(),zi$1(3,"pre"),VI(4,Lo,2,1,null,null,jI),Ou()()),n&2){let e=YI(2).$implicit,t=YI(3);VD(4),HI(t.parseMessage(e.errorDetails));}}function Bo(n,a){if(n&1){let e=qI();zi$1(0,"div",44)(1,"button",45),qh("click",function(){Rd(e);let i=YI(2).$implicit,o=YI(3);return Od(o.retryPrompt(i.originalPrompt||"",i.attachments||[]))}),zi$1(2,"mat-icon",46),Tw(3,"refresh"),Ou(),Tw(4," Retry Request "),Ou()();}if(n&2){let e=YI(5);VD(),Vh("disabled",e.isLocked());}}function No(n,a){if(n&1&&(zi$1(0,"div",34)(1,"div",40),Tw(2),Ou(),zi$1(3,"div",41),VI(4,To,2,1,null,null,jI),Ou(),FI(6,Io,3,0,"div",42),FI(7,Fo,6,0,"details",43),FI(8,Bo,5,1,"div",44),Ou()),n&2){let e=YI().$implicit,t=YI(3);VD(2),ju("\u26A0 ",e.errorTitle||"Error"),VD(2),HI(t.parseMessage(e.errorMessage||e.content)),VD(2),LI(e.errorTip?6:-1),VD(),LI(e.errorDetails?7:-1),VD(),LI(e.isRetryable?8:-1);}}function jo(n,a){if(n&1){let e=qI();zi$1(0,"div",44)(1,"button",45),qh("click",function(){Rd(e);let i=YI(2).$implicit,o=YI(3);return Od(o.retryPrompt(i.originalPrompt||"",i.attachments||[]))}),zi$1(2,"mat-icon",46),Tw(3,"refresh"),Ou(),Tw(4," Retry Request "),Ou()();}if(n&2){let e=YI(5);VD(),Vh("disabled",e.isLocked());}}function zo(n,a){if(n&1&&(zi$1(0,"p",33),Tw(1),Ou(),FI(2,jo,5,1,"div",44)),n&2){let e=YI().$implicit;VD(),ug(e.content),VD(),LI(e.isRetryable?2:-1);}}function Ho(n,a){if(n&1&&(zi$1(0,"div",29),FI(1,vo,3,1,"div",30),zi$1(2,"div",31),FI(3,Mo,3,0,"div",32),FI(4,ko,2,1,"p",33)(5,No,9,4,"div",34)(6,zo,3,2),Ou()()),n&2){let e=a.$implicit,t=YI(3);hw(t.getBubbleClass(e)),VD(),LI(e.role!=="error"?1:-1),VD(2),LI(e.attachments&&e.attachments.length>0?3:-1),VD(),LI(e.isSnapshot?4:e.role==="error"?5:6);}}function Vo(n,a){if(n&1&&VI(0,Ho,7,5,"div",28,jI),n&2){let e=YI(2);HI(e.visibleChatHistory());}}function Wo(n,a){if(n&1&&Hh(0,"img",48),n&2){let e=YI().$implicit;Vh("src",e.previewUrl,_p);}}function $o(n,a){n&1&&(zi$1(0,"mat-icon",49),Tw(1,"description"),Ou());}function Go(n,a){if(n&1){let e=qI();zi$1(0,"div",47),FI(1,Wo,1,1,"img",48)(2,$o,2,0,"mat-icon",49),zi$1(3,"div",50)(4,"span",51),Tw(5),Ou()(),zi$1(6,"button",52),qh("click",function(){let i=Rd(e).$index,o=YI(3);return Od(o.removeAttachment(i))}),zi$1(7,"mat-icon"),Tw(8,"close"),Ou()()();}if(n&2){let e=a.$implicit,t=YI(3);VD(),LI(t.isImage(e.mimeType)?1:2),VD(4),ug(e.name);}}function Uo(n,a){if(n&1&&(zi$1(0,"div",16),VI(1,Go,9,2,"div",47,BI),Ou()),n&2){let e=YI(2);VD(),HI(e.attachedFiles());}}function Jo(n,a){if(n&1){let e=qI();zi$1(0,"div",13),FI(1,fo,5,0,"div",14)(2,Vo,2,0),Ou(),zi$1(3,"div",15),FI(4,Uo,3,0,"div",16),zi$1(5,"mat-form-field",17)(6,"textarea",18),qh("ngModelChange",function(i){Rd(e);let o=YI();return Od(o.userPrompt.set(i))})("keydown",function(i){Rd(e);let o=YI();return Od(o.onKeyDown(i))}),Ou(),_E(),Ou(),zi$1(7,"div",19)(8,"div",20)(9,"button",21),qh("click",function(){Rd(e);let i=rw(13);return Od(i.click())}),zi$1(10,"mat-icon"),Tw(11,"attach_file"),Ou()(),zi$1(12,"input",22,0),qh("change",function(i){Rd(e);let o=YI();return Od(o.onFilesSelected(i))}),Ou(),zi$1(14,"button",23),qh("click",function(){Rd(e);let i=YI();return Od(i.onIncludeScreenshotChange(!i.includeScreenshot()))}),zi$1(15,"mat-icon"),Tw(16,"photo_camera"),Ou()(),zi$1(17,"button",24),qh("click",function(){Rd(e);let i=YI();return Od(i.showSystemInstructions())}),Tw(18," Instructions "),Ou()(),zi$1(19,"button",25),qh("click",function(){Rd(e);let i=YI();return Od(i.submitPrompt())}),Tw(20," Send "),Ou()()();}if(n&2){let e=YI();VD(),LI(e.visibleChatHistory().length===0?1:2),VD(3),LI(e.attachedFiles().length>0?4:-1),VD(2),Vh("ngModel",e.userPrompt())("disabled",e.isLocked()),ME(),VD(3),Vh("disabled",e.isLocked()||e.isReadingFiles()),VD(3),Vh("disabled",e.isReadingFiles()),VD(2),rg("active",e.includeScreenshot()),Vh("disabled",e.isLocked()),Bh("aria-pressed",e.includeScreenshot()),VD(5),Vh("disabled",e.isLocked()||e.isReadingFiles()||!e.isHandshakeComplete()||!e.userPrompt().trim()&&e.attachedFiles().length===0);}}var yn=class n{chatCoordinator=g(hn);chatState=g(ae);dialog=g(pt);catalogManagement=g(oo$1);startupResolution=g(Qg);configProvider=g(ys$1);hostCommunication=g(Xt);includeScreenshot=this.configProvider.includeScreenshot;onIncludeScreenshotChange(a){this.configProvider.setIncludeScreenshot(a);}systemPrompt=this.chatCoordinator.systemPrompt;isHandshakeComplete=Gw(()=>this.catalogManagement.activeCatalog()!==null);isChatDisabled=Gw(()=>{let a=this.startupResolution.isThirdPartyEnvironment(),e=!this.configProvider.geminiApiKey();return a&&e});pipelineStatus=this.chatState.pipelineStatus;isLocked=this.chatState.isProgrammaticStreamActive;isReadingFiles=tn(false);userPrompt=tn("");attachedFiles=tn([]);visibleChatHistory=Gw(()=>this.chatState.chatHistory().filter(a=>a.role!=="system").map(a=>{let e=this.isLayoutSnapshot(a.content);return e?G(j({},a),{isSnapshot:e,componentCount:this.getComponentCount(a.content)}):G(j({},a),{isSnapshot:e})}));pipelineStatusText=Gw(()=>{switch(this.pipelineStatus()){case "receiving_stream":return "Receiving A2UI JSON stream...";case "received_raw":return "Received A2UI JSON.";case "validating":return "Validating A2UI JSON catalog schemas...";case "healing":return "Fixing A2UI JSON (Self-repair loop active)...";case "ready":return "Raw A2UI JSON is ready.";case "failed":return "A2UI JSON validation failed.";default:return ""}});async submitPrompt(){let a=this.userPrompt().trim(),e=[...this.attachedFiles()];if(!a&&e.length===0||this.isLocked())return;let t=true;if(this.includeScreenshot()){this.isReadingFiles.set(true);try{let i=await this.hostCommunication.captureScreenshot();if(i){let o=i.indexOf(","),r=o!==-1?i.substring(o+1):i;e.push({name:"screenshot.png",mimeType:"image/png",data:r});}}catch(i){console.error("ChatPanel: Failed to capture screenshot context:",i),t=false;}finally{this.isReadingFiles.set(false);}}t&&(this.userPrompt.set(""),this.attachedFiles.set([]),await this.chatCoordinator.submitPrompt(a,e));}onKeyDown(a){a.key==="Enter"&&!a.shiftKey&&!a.isComposing&&(a.preventDefault(),this.submitPrompt());}getBubbleClass(a){return a.role==="user"?this.isLayoutSnapshot(a.content)?"bubble-user bubble-layout":"bubble-user bubble-text":a.role==="model"?"bubble-model":a.role==="error"?"bubble-error":""}isLayoutSnapshot(a){let e=a.trim();return e.startsWith('{"version"')||e.startsWith("[")&&e.endsWith("]")}getComponentCount(a){try{let e=a.trim(),t=$t(e);if(t)return t.reduce((r,c)=>r+this.getCommandComponentCount(c),0);let i=e.split(`
`).filter(r=>r.trim().length>0),o=0;for(let r of i)if(r.startsWith("{"))try{let c=JSON.parse(r);o+=this.getCommandComponentCount(c);}catch{}return o}catch{}return 0}getCommandComponentCount(a){if(!a||typeof a!="object"||Array.isArray(a))return 0;let e=a;if(e.updateComponents&&typeof e.updateComponents=="object"){let t=e.updateComponents;if(Array.isArray(t.components))return t.components.length}else if(e.createSurface)return 1;return 0}showSystemInstructions(){this.dialog.open(_n,{data:this.chatCoordinator.systemPrompt(),width:"600px"});}dismissOverlay(){this.chatState.setPipelineStatus("idle");}async retryPrompt(a,e=[]){this.userPrompt.set(a),this.attachedFiles.set(e),await this.submitPrompt();}parseMessage(a){if(!a)return [];let e="redacted for your protection",t=a.split(e),i=[];for(let o=0;o<t.length;o++)t[o]&&i.push({text:t[o],isRedacted:false}),o<t.length-1&&i.push({text:e,isRedacted:true});return i}async onFilesSelected(a){let e=a.target;if(!(!e.files||e.files.length===0)){this.isReadingFiles.set(true);try{let t=[],i=Array.from(e.files);for(let o of i){if(o.size>10*1024*1024){console.warn(`File ${o.name} exceeds the 10MB size limit.`);continue}try{let r=await this.readFileAsAttachment(o);t.push(r);}catch(r){console.error(`Failed to read file ${o.name}:`,r);}}this.attachedFiles.update(o=>[...o,...t]);}finally{this.isReadingFiles.set(false),e.value="";}}}readFileAsAttachment(a){return new Promise((e,t)=>{let i=new FileReader;i.onload=o=>{let r=o.target?.result;if(typeof r!="string"){t(new Error("Failed to read file."));return}let c=r.indexOf(",");if(c===-1){t(new Error("Invalid data URL format."));return}let h=r.substring(c+1);e({name:a.name,mimeType:a.type||"application/octet-stream",data:h,previewUrl:a.type.startsWith("image/")?r:void 0});},i.onerror=o=>t(o),i.readAsDataURL(a);})}removeAttachment(a){this.attachedFiles.update(e=>e.filter((t,i)=>i!==a));}isImage(a){return a.startsWith("image/")}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-chat-panel"]],decls:7,vars:2,consts:[["fileInput",""],[1,"preview-frame-container"],["role","button","tabindex","0","aria-label","Dismiss status overlay",1,"pipeline-overlay",3,"class"],[1,"frame-header"],[1,"panel-title-text"],[1,"disabled-chat-panel"],["role","button","tabindex","0","aria-label","Dismiss status overlay",1,"pipeline-overlay",3,"click","keydown.enter","keydown.space"],["aria-hidden","true",1,"status-icon","error-icon"],[3,"diameter"],[1,"status-badge-text"],["aria-hidden","true",1,"disabled-key-icon"],[1,"disabled-notice-text"],["mat-flat-button","","color","primary","routerLink","/settings",1,"add-key-button"],[1,"frame-body","chat-history-log"],[1,"empty-state-notice"],[1,"chat-controllers-panel"],[1,"attachment-previews"],["appearance","outline","subscriptSizing","dynamic",1,"prompt-form-field"],["matInput","","aria-label","Chat prompt","placeholder","Type instruction to shape your screen (e.g. 'Add a checkbox column')...","rows","2",3,"ngModelChange","keydown","ngModel","disabled"],[1,"submit-action-bar"],[1,"action-bar-left"],["mat-icon-button","","type","button","title","Upload attachment","aria-label","Upload attachment",1,"attach-file-button",3,"click","disabled"],["type","file","multiple","",2,"display","none",3,"change","disabled"],["mat-icon-button","","type","button","title","Add screenshot","aria-label","Add screenshot",1,"screenshot-toggle-button",3,"click","disabled"],["type","button",1,"system-instructions-link",3,"click"],["mat-raised-button","","color","primary",1,"submit-button",3,"click","disabled"],[1,"empty-state-icon"],[1,"empty-state-text"],[1,"chat-bubble-container",3,"class"],[1,"chat-bubble-container"],[1,"bubble-header-bar"],[1,"bubble-body"],[1,"bubble-attachments-container"],[1,"bubble-text-content"],[1,"error-bubble-content"],[1,"bubble-author-name"],[1,"bubble-attachment-card"],["alt","Attached image",1,"bubble-attachment-thumbnail",3,"src"],[1,"bubble-attachment-icon"],[1,"bubble-attachment-name",3,"title"],[1,"error-title"],[1,"error-message"],[1,"error-tip"],[1,"error-details"],[1,"retry-action-container"],["mat-stroked-button","","color","primary",1,"retry-button",3,"click","disabled"],["aria-hidden","true"],[1,"attachment-preview-card"],["alt","Preview",1,"attachment-thumbnail",3,"src"],[1,"attachment-file-icon"],[1,"attachment-details"],[1,"attachment-name"],["mat-icon-button","","aria-label","Remove attachment",1,"remove-attachment-button",3,"click"]],template:function(e,t){e&1&&(zi$1(0,"div",1),FI(1,go,5,4,"div",2),zi$1(2,"div",3)(3,"span",4),Tw(4,"Gemini Assistant"),Ou()(),FI(5,bo,7,0,"div",5)(6,Jo,21,11),Ou()),e&2&&(VD(),LI(t.pipelineStatus()!=="idle"&&t.pipelineStatus()!=="ready"&&t.pipelineStatus()!=="failed"?1:-1),VD(4),LI(t.isChatDisabled()?5:6));},dependencies:[se,it,rn$1,on$1,wd,Ed,Uo$1,fu,Ci$1,lu,Rs$1,oi,ri$1,Gd,Hd,fn,xn$1],styles:[`[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;--app-success: #137333;--app-success-container: #e6f4ea;--app-on-success-container: #137333}.dark-theme[_nghost-%COMP%], .dark-theme   [_nghost-%COMP%]{--app-success: #81c784;--app-success-container: #132b19;--app-on-success-container: #a3e9a4}.dark-theme[_nghost-%COMP%]   .prompt-form-field[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]{--mdc-outlined-text-field-outline-color: rgba(255, 255, 255, .2) !important;--mdc-outlined-text-field-hover-outline-color: rgba(255, 255, 255, .3) !important}.preview-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;height:100%;box-sizing:border-box;border:1px solid var(--mat-sys-outline-variant);border-radius:8px;background-color:var(--mat-sys-surface);box-shadow:0 2px 4px #0000000d;overflow:hidden;min-width:0;position:relative}.frame-header[_ngcontent-%COMP%]{padding:12px 16px;background-color:var(--mat-sys-surface-container);border-bottom:1px solid var(--mat-sys-outline-variant);font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);display:flex;align-items:center;flex-shrink:0}.panel-title-text[_ngcontent-%COMP%]{font-size:14px;font-weight:500;color:var(--mat-sys-on-surface)}.frame-body[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;overflow:auto;box-sizing:border-box;min-height:0}.chat-history-log[_ngcontent-%COMP%]{flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:16px}.empty-state-notice[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;text-align:center;padding:32px;color:var(--mat-sys-on-surface-variant)}.empty-state-notice[_ngcontent-%COMP%]   .empty-state-icon[_ngcontent-%COMP%]{font-size:48px;margin-bottom:16px}.empty-state-notice[_ngcontent-%COMP%]   .empty-state-text[_ngcontent-%COMP%]{font-size:14px;line-height:1.5;margin:0;max-width:240px}.chat-bubble-container[_ngcontent-%COMP%]{display:flex;gap:8px;max-width:85%;align-items:flex-start;animation:_ngcontent-%COMP%_fadeInBubble .2s ease-out}.chat-bubble-container[_ngcontent-%COMP%]   .bubble-header-bar[_ngcontent-%COMP%]{font-size:11px;font-weight:500;margin-bottom:4px;opacity:.8}.chat-bubble-container[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{padding:10px 12px;font-size:13px;line-height:1.45;box-shadow:0 1px 2px #0000000d}@keyframes _ngcontent-%COMP%_fadeInBubble{0%{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.bubble-avatar-box[_ngcontent-%COMP%]{width:28px;height:28px;border-radius:50%;background-color:var(--mat-sys-surface-container-high);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--mat-sys-outline-variant);font-size:14px}.bubble-user[_ngcontent-%COMP%]{align-self:flex-end;flex-direction:row-reverse}.bubble-user[_ngcontent-%COMP%]   .bubble-header-bar[_ngcontent-%COMP%]{text-align:right}.bubble-user[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container);border-radius:12px 0 12px 12px;border:1px solid var(--mat-sys-outline-variant)}.bubble-user.bubble-layout[_ngcontent-%COMP%]{max-width:90%;align-self:center;flex-direction:row}.bubble-user.bubble-layout[_ngcontent-%COMP%]   .bubble-avatar-box[_ngcontent-%COMP%]{display:none}.bubble-user.bubble-layout[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);border:1px dashed var(--mat-sys-outline);color:var(--mat-sys-on-surface-variant);border-radius:8px;padding:8px 12px;box-shadow:none;width:100%}.bubble-model[_ngcontent-%COMP%]{align-self:flex-start}.bubble-model[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);color:var(--mat-sys-on-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:0 12px 12px}.bubble-model[_ngcontent-%COMP%]   .bubble-text-content[_ngcontent-%COMP%]{margin:0;white-space:pre-wrap}.bubble-error[_ngcontent-%COMP%]{align-self:flex-start;max-width:100%;word-break:break-word;word-wrap:break-word}.bubble-error[_ngcontent-%COMP%]   .bubble-body[_ngcontent-%COMP%]{background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border:1px solid var(--mat-sys-error);border-radius:12px;padding:12px;font-size:var(--mat-sys-body-medium-size);line-height:var(--mat-sys-body-medium-line-height)}.bubble-error[_ngcontent-%COMP%]   .error-title[_ngcontent-%COMP%]{font-weight:var(--mat-sys-title-small-weight);margin-bottom:6px;color:var(--mat-sys-error)}.bubble-error[_ngcontent-%COMP%]   .error-message[_ngcontent-%COMP%]{margin-bottom:8px;font-size:var(--mat-sys-body-small-size);line-height:var(--mat-sys-body-small-line-height)}.bubble-error[_ngcontent-%COMP%]   .error-tip[_ngcontent-%COMP%]{font-style:italic;font-size:var(--mat-sys-body-small-size);opacity:.9;margin-bottom:8px}.bubble-error[_ngcontent-%COMP%]   .error-details[_ngcontent-%COMP%]{margin-top:8px;word-break:break-word;word-wrap:break-word}.bubble-error[_ngcontent-%COMP%]   .error-details[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%]{font-size:var(--mat-sys-label-small-size);font-weight:var(--mat-sys-label-small-weight);cursor:pointer;color:var(--mat-sys-error);-webkit-user-select:none;user-select:none;outline:none}.bubble-error[_ngcontent-%COMP%]   .error-details[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%]:hover{text-decoration:underline}.bubble-error[_ngcontent-%COMP%]   .error-details[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{margin:6px 0 0;padding:8px;background-color:color-mix(in srgb,var(--mat-sys-error-container) 95%,black);border:1px solid color-mix(in srgb,var(--mat-sys-error) 30%,transparent);border-radius:4px;font-family:Roboto Mono,Consolas,monospace;font-size:var(--mat-sys-body-small-size);line-height:var(--mat-sys-body-small-line-height);white-space:pre-wrap;word-break:break-word;word-wrap:break-word;max-height:160px;overflow-y:auto}.streaming-pulse-indicator[_ngcontent-%COMP%]{display:inline-block;font-size:10px;color:var(--mat-sys-outline);animation:_ngcontent-%COMP%_pulsePulse 1.2s infinite ease-in-out;margin-top:4px}@keyframes _ngcontent-%COMP%_pulsePulse{0%,to{opacity:.3}50%{opacity:1}}.chat-controllers-panel[_ngcontent-%COMP%]{padding:12px 8px;background-color:var(--mat-sys-surface-container-high);border-top:1px solid var(--mat-sys-outline-variant);display:flex;flex-direction:column;gap:8px;z-index:10;flex-shrink:0}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]{width:100%;--mdc-outlined-text-field-container-shape: 20px !important;--mdc-outlined-text-field-outline-color: rgba(0, 0, 0, .12) !important;--mdc-outlined-text-field-focus-outline-color: var(--mat-sys-primary) !important;--mdc-outlined-text-field-hover-outline-color: rgba(0, 0, 0, .2) !important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]     .mdc-notched-outline__leading, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]     .mdc-notched-outline__notch, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]     .mdc-notched-outline__trailing{border-color:var(--mat-sys-outline-variant)!important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field.mat-focused[_ngcontent-%COMP%]     .mdc-notched-outline__leading, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field.mat-focused[_ngcontent-%COMP%]     .mdc-notched-outline__notch, .chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field.mat-focused[_ngcontent-%COMP%]     .mdc-notched-outline__trailing{border-color:var(--mat-sys-primary)!important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{font-size:13px;line-height:1.4;resize:none;overflow-y:hidden!important;scrollbar-width:none!important}.chat-controllers-panel[_ngcontent-%COMP%]   .prompt-form-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]::-webkit-scrollbar{display:none!important}.chat-controllers-panel[_ngcontent-%COMP%]   .submit-action-bar[_ngcontent-%COMP%]{display:flex;justify-content:space-between!important;align-items:center;width:100%}.chat-controllers-panel[_ngcontent-%COMP%]   .action-bar-left[_ngcontent-%COMP%]{display:flex;align-items:center;gap:12px;flex-wrap:nowrap;overflow:hidden}.chat-controllers-panel[_ngcontent-%COMP%]   .system-instructions-link[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-primary);text-decoration:none;background:none;border:none;padding:0;margin:0;cursor:pointer;font-weight:500;white-space:nowrap;display:inline-flex;align-items:center}.chat-controllers-panel[_ngcontent-%COMP%]   .system-instructions-link[_ngcontent-%COMP%]:hover{text-decoration:underline}.chat-controllers-panel[_ngcontent-%COMP%]   .screenshot-toggle-button[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);transition:color .15s ease,background-color .15s ease}.chat-controllers-panel[_ngcontent-%COMP%]   .screenshot-toggle-button.active[_ngcontent-%COMP%]{color:var(--mat-sys-primary);background-color:var(--mat-sys-primary-container)}.chat-controllers-panel[_ngcontent-%COMP%]   .submit-button[_ngcontent-%COMP%]{font-size:12px;font-weight:500;white-space:nowrap}.pipeline-overlay[_ngcontent-%COMP%]{position:absolute;top:0;left:0;width:100%;height:100%;background-color:color-mix(in srgb,var(--mat-sys-surface) 85%,transparent);-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:100;animation:_ngcontent-%COMP%_fadeInOverlay .15s ease-out}.pipeline-overlay[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{font-size:13px;font-weight:500;color:var(--mat-sys-primary);text-align:center;padding:0 24px;animation:_ngcontent-%COMP%_pulseText 1.5s infinite ease-in-out}.pipeline-overlay[_ngcontent-%COMP%]   mat-spinner[_ngcontent-%COMP%]     circle{stroke:var(--mat-sys-primary)!important}.pipeline-overlay[_ngcontent-%COMP%]   .status-icon[_ngcontent-%COMP%]{font-size:40px;width:40px;height:40px;display:flex;align-items:center;justify-content:center}.pipeline-overlay[_ngcontent-%COMP%]   .status-icon.success-icon[_ngcontent-%COMP%]{color:var(--app-success)}.pipeline-overlay[_ngcontent-%COMP%]   .status-icon.error-icon[_ngcontent-%COMP%]{color:var(--mat-sys-error)}.pipeline-overlay.healing[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--mat-sys-tertiary-container) 88%,transparent)}.pipeline-overlay.healing[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--mat-sys-on-tertiary-container)}.pipeline-overlay.healing[_ngcontent-%COMP%]   mat-spinner[_ngcontent-%COMP%]     circle{stroke:var(--mat-sys-tertiary)!important}.pipeline-overlay.validating[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--mat-sys-primary-container) 88%,transparent)}.pipeline-overlay.validating[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--mat-sys-on-primary-container)}.pipeline-overlay.validating[_ngcontent-%COMP%]   mat-spinner[_ngcontent-%COMP%]     circle{stroke:var(--mat-sys-primary)!important}.pipeline-overlay.ready[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--app-success-container) 90%,transparent)}.pipeline-overlay.ready[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--app-on-success-container);animation:none}.pipeline-overlay.failed[_ngcontent-%COMP%]{background-color:color-mix(in srgb,var(--mat-sys-error-container) 90%,transparent)}.pipeline-overlay.failed[_ngcontent-%COMP%]   .status-badge-text[_ngcontent-%COMP%]{color:var(--mat-sys-error);animation:none}@keyframes _ngcontent-%COMP%_fadeInOverlay{0%{opacity:0}to{opacity:1}}@keyframes _ngcontent-%COMP%_pulseText{0%,to{opacity:.7}50%{opacity:1}}.retry-action-container[_ngcontent-%COMP%]{margin-top:12px;display:flex;justify-content:flex-start}.retry-button[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:8px;font-size:12px!important;height:32px!important;line-height:32px!important;padding:0 12px!important;border-color:var(--mat-sys-outline-variant)!important;background-color:var(--mat-sys-surface-container-lowest)!important;color:var(--mat-sys-primary)!important}.retry-button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:16px!important;width:16px!important;height:16px!important}.layout-snapshot-badge[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:var(--mat-sys-on-surface-variant)}.layout-snapshot-badge[_ngcontent-%COMP%]   .badge-label[_ngcontent-%COMP%]{font-weight:500}.layout-snapshot-badge[_ngcontent-%COMP%]   .badge-count[_ngcontent-%COMP%]{opacity:.7;font-size:12px}.disabled-chat-panel[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;text-align:center;padding:32px;background-color:var(--mat-sys-surface-container-low);box-sizing:border-box}.disabled-chat-panel[_ngcontent-%COMP%]   .disabled-key-icon[_ngcontent-%COMP%]{font-size:48px;width:48px;height:48px;margin-bottom:16px;color:var(--mat-sys-outline)}.disabled-chat-panel[_ngcontent-%COMP%]   .disabled-notice-text[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-medium-size);line-height:1.5;margin:0 0 24px;max-width:260px;color:var(--mat-sys-on-surface-variant)}.attachment-previews[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:8px;padding:8px 4px;max-height:120px;overflow-y:auto;border-bottom:1px solid var(--mat-sys-outline-variant);margin-bottom:8px;scrollbar-width:thin}.attachment-previews[_ngcontent-%COMP%]::-webkit-scrollbar{width:4px;height:4px}.attachment-previews[_ngcontent-%COMP%]::-webkit-scrollbar-thumb{background-color:var(--mat-sys-outline-variant);border-radius:4px}.attachment-preview-card[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;background-color:var(--mat-sys-surface-container);border:1px solid var(--mat-sys-outline-variant);border-radius:8px;padding:6px 10px;font-size:12px;position:relative;max-width:200px;min-width:120px;box-shadow:0 1px 3px #0000000d;animation:_ngcontent-%COMP%_scaleIn .15s ease-out}.attachment-preview-card[_ngcontent-%COMP%]   .attachment-thumbnail[_ngcontent-%COMP%]{width:24px;height:24px;border-radius:4px;object-fit:cover;border:1px solid var(--mat-sys-outline-variant)}.attachment-preview-card[_ngcontent-%COMP%]   .attachment-file-icon[_ngcontent-%COMP%]{font-size:20px;width:20px;height:20px;color:var(--mat-sys-primary)}.attachment-preview-card[_ngcontent-%COMP%]   .attachment-details[_ngcontent-%COMP%]{flex:1;min-width:0;display:flex;flex-direction:column}.attachment-preview-card[_ngcontent-%COMP%]   .attachment-details[_ngcontent-%COMP%]   .attachment-name[_ngcontent-%COMP%]{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--mat-sys-on-surface)}.attachment-preview-card[_ngcontent-%COMP%]   .remove-attachment-button[_ngcontent-%COMP%]{width:24px!important;height:24px!important;line-height:24px!important;padding:0!important;min-width:0!important;margin-left:4px;color:var(--mat-sys-on-surface-variant);opacity:.7}.attachment-preview-card[_ngcontent-%COMP%]   .remove-attachment-button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:16px!important;width:16px!important;height:16px!important}.attachment-preview-card[_ngcontent-%COMP%]   .remove-attachment-button[_ngcontent-%COMP%]:hover{opacity:1;background-color:var(--mat-sys-surface-container-highest)}.bubble-attachments-container[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;width:100%}.bubble-attachment-card[_ngcontent-%COMP%]{display:flex;align-items:center;gap:6px;background-color:color-mix(in srgb,var(--mat-sys-primary-container) 95%,black);border:1px solid color-mix(in srgb,var(--mat-sys-primary-container) 85%,black);border-radius:6px;padding:4px 8px;font-size:11px;max-width:180px}.bubble-attachment-card[_ngcontent-%COMP%]   .bubble-attachment-thumbnail[_ngcontent-%COMP%]{width:20px;height:20px;border-radius:3px;object-fit:cover}.bubble-attachment-card[_ngcontent-%COMP%]   .bubble-attachment-icon[_ngcontent-%COMP%]{font-size:18px;width:18px;height:18px;color:var(--mat-sys-primary)}.bubble-attachment-card[_ngcontent-%COMP%]   .bubble-attachment-name[_ngcontent-%COMP%]{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--mat-sys-on-primary-container)}.bubble-model[_ngcontent-%COMP%]   .bubble-attachment-card[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-highest);border-color:var(--mat-sys-outline-variant)}.bubble-model[_ngcontent-%COMP%]   .bubble-attachment-card[_ngcontent-%COMP%]   .bubble-attachment-name[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface)}@keyframes _ngcontent-%COMP%_scaleIn{0%{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}















`]})};function ri(n,a){(a==null||a>n.length)&&(a=n.length);for(var e=0,t=Array(a);e<a;e++)t[e]=n[e];return t}function Qo(n){if(Array.isArray(n))return n}function qo(n,a,e){return (a=er(a))in n?Object.defineProperty(n,a,{value:e,enumerable:true,configurable:true,writable:true}):n[a]=e,n}function Ko(n,a){var e=n==null?null:typeof Symbol<"u"&&n[Symbol.iterator]||n["@@iterator"];if(e!=null){var t,i,o,r,c=[],h=true,g=false;try{if(o=(e=e.call(n)).next,a!==0)for(;!(h=(t=o.call(e)).done)&&(c.push(t.value),c.length!==a);h=!0);}catch(M){g=true,i=M;}finally{try{if(!h&&e.return!=null&&(r=e.return(),Object(r)!==r))return}finally{if(g)throw i}}return c}}function Yo(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function si(n,a){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(n);a&&(t=t.filter(function(i){return Object.getOwnPropertyDescriptor(n,i).enumerable})),e.push.apply(e,t);}return e}function $n(n){for(var a=1;a<arguments.length;a++){var e=arguments[a]!=null?arguments[a]:{};a%2?si(Object(e),true).forEach(function(t){qo(n,t,e[t]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):si(Object(e)).forEach(function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t));});}return n}function li(n,a){if(n==null)return {};var e,t,i=Zo(n,a);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);for(t=0;t<o.length;t++)e=o[t],a.indexOf(e)===-1&&{}.propertyIsEnumerable.call(n,e)&&(i[e]=n[e]);}return i}function Zo(n,a){if(n==null)return {};var e={};for(var t in n)if({}.hasOwnProperty.call(n,t)){if(a.indexOf(t)!==-1)continue;e[t]=n[t];}return e}function ci(n,a){return Qo(n)||Ko(n,a)||tr(n,a)||Yo()}function Xo(n,a){if(typeof n!="object"||!n)return n;var e=n[Symbol.toPrimitive];if(e!==void 0){var t=e.call(n,a);if(typeof t!="object")return t;throw new TypeError("@@toPrimitive must return a primitive value.")}return (a==="string"?String:Number)(n)}function er(n){var a=Xo(n,"string");return typeof a=="symbol"?a:a+""}function tr(n,a){if(n){if(typeof n=="string")return ri(n,a);var e={}.toString.call(n).slice(8,-1);return e==="Object"&&n.constructor&&(e=n.constructor.name),e==="Map"||e==="Set"?Array.from(n):e==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?ri(n,a):void 0}}function nr(n,a,e){return a in n?Object.defineProperty(n,a,{value:e,enumerable:true,configurable:true,writable:true}):n[a]=e,n}function di(n,a){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(n);a&&(t=t.filter(function(i){return Object.getOwnPropertyDescriptor(n,i).enumerable})),e.push.apply(e,t);}return e}function mi(n){for(var a=1;a<arguments.length;a++){var e=arguments[a]!=null?arguments[a]:{};a%2?di(Object(e),true).forEach(function(t){nr(n,t,e[t]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):di(Object(e)).forEach(function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t));});}return n}function ar(){for(var n=arguments.length,a=new Array(n),e=0;e<n;e++)a[e]=arguments[e];return function(t){return a.reduceRight(function(i,o){return o(i)},t)}}function ut(n){return function a(){for(var e=this,t=arguments.length,i=new Array(t),o=0;o<t;o++)i[o]=arguments[o];return i.length>=n.length?n.apply(this,i):function(){for(var r=arguments.length,c=new Array(r),h=0;h<r;h++)c[h]=arguments[h];return a.apply(e,[].concat(i,c))}}}function xn(n){return {}.toString.call(n).includes("Object")}function ir(n){return !Object.keys(n).length}function ht(n){return typeof n=="function"}function or(n,a){return Object.prototype.hasOwnProperty.call(n,a)}function rr(n,a){return xn(a)||Ae("changeType"),Object.keys(a).some(function(e){return !or(n,e)})&&Ae("changeField"),a}function sr(n){ht(n)||Ae("selectorType");}function lr(n){ht(n)||xn(n)||Ae("handlerType"),xn(n)&&Object.values(n).some(function(a){return !ht(a)})&&Ae("handlersType");}function cr(n){n||Ae("initialIsRequired"),xn(n)||Ae("initialType"),ir(n)&&Ae("initialContent");}function dr(n,a){throw new Error(n[a]||n.default)}var mr={initialIsRequired:"initial state is required",initialType:"initial state should be an object",initialContent:"initial state shouldn't be an empty object",handlerType:"handler should be an object or a function",handlersType:"all handlers should be a functions",selectorType:"selector should be a function",changeType:"provided value of changes should be an object",changeField:'it seams you want to change a field in the state which is not specified in the "initial" state',default:"an unknown error accured in `state-local` package"},Ae=ut(dr)(mr),vn={changes:rr,selector:sr,handler:lr,initial:cr};function pr(n){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};vn.initial(n),vn.handler(a);var e={current:n},t=ut(gr)(e,a),i=ut(hr)(e),o=ut(vn.changes)(n),r=ut(ur)(e);function c(){var g=arguments.length>0&&arguments[0]!==void 0?arguments[0]:function(M){return M};return vn.selector(g),g(e.current)}function h(g){ar(t,i,o,r)(g);}return [c,h]}function ur(n,a){return ht(a)?a(n.current):a}function hr(n,a){return n.current=mi(mi({},n.current),a),a}function gr(n,a,e){return ht(a)?a(n.current):Object.keys(e).forEach(function(t){var i;return (i=a[t])===null||i===void 0?void 0:i.call(a,n.current[t])}),e}var br={create:pr},pi=br;var ui={paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs"}};function hi(n){return function a(){for(var e=this,t=arguments.length,i=new Array(t),o=0;o<t;o++)i[o]=arguments[o];return i.length>=n.length?n.apply(this,i):function(){for(var r=arguments.length,c=new Array(r),h=0;h<r;h++)c[h]=arguments[h];return a.apply(e,[].concat(i,c))}}}function gi(n){return {}.toString.call(n).includes("Object")}function fr(n){return n||bi("configIsRequired"),gi(n)||bi("configType"),n.urls?(_r(),{paths:{vs:n.urls.monacoBase}}):n}function _r(){console.warn(fi.deprecation);}function yr(n,a){throw new Error(n[a]||n.default)}var fi={configIsRequired:"the configuration object is required",configType:"the configuration object should be an object",default:"an unknown error accured in `@monaco-editor/loader` package",deprecation:`Deprecation warning!
    You are using deprecated way of configuration.

    Instead of using
      monaco.config({ urls: { monacoBase: '...' } })
    use
      monaco.config({ paths: { vs: '...' } })

    For more please check the link https://github.com/suren-atoyan/monaco-loader#config
  `},bi=hi(yr)(fi),_i={config:fr};var yi=function(){for(var a=arguments.length,e=new Array(a),t=0;t<a;t++)e[t]=arguments[t];return function(i){return e.reduceRight(function(o,r){return r(o)},i)}};function Gn(n,a){return Object.keys(a).forEach(function(e){a[e]instanceof Object&&n[e]&&Object.assign(a[e],Gn(n[e],a[e]));}),$n($n({},n),a)}var vr={type:"cancelation",msg:"operation is manually canceled"};function Cn(n){var a=false,e=new Promise(function(t,i){n.then(function(o){return a?i(vr):t(o)}),n.catch(i);});return e.cancel=function(){return a=true},e}var xr=["monaco"],Cr=pi.create({config:ui,isInitialized:false,resolve:null,reject:null,monaco:null}),vi=ci(Cr,2),gt=vi[0],wn=vi[1];function wr(n){var a=_i.config(n),e=a.monaco,t=li(a,xr);wn(function(i){return {config:Gn(i.config,t),monaco:e}});}function Mr(){var n=gt(function(a){var e=a.monaco,t=a.isInitialized,i=a.resolve;return {monaco:e,isInitialized:t,resolve:i}});if(!n.isInitialized){if(wn({isInitialized:true}),n.monaco)return n.resolve(n.monaco),Cn(Un);if(window.monaco&&window.monaco.editor)return xi(window.monaco),n.resolve(window.monaco),Cn(Un);yi(kr,Dr)(Tr);}return Cn(Un)}function kr(n){return document.body.appendChild(n)}function Pr(n){var a=document.createElement("script");return n&&(a.src=n),a}function Dr(n){var a=gt(function(t){var i=t.config,o=t.reject;return {config:i,reject:o}}),e=Pr("".concat(a.config.paths.vs,"/loader.js"));return e.onload=function(){return n()},e.onerror=a.reject,e}function Tr(){var n=gt(function(e){var t=e.config,i=e.resolve,o=e.reject;return {config:t,resolve:i,reject:o}}),a=window.require;a.config(n.config),a(["vs/editor/editor.main"],function(e){var t=e.m||e;xi(t),n.resolve(t);},function(e){n.reject(e);});}function xi(n){gt().monaco||wn({monaco:n});}function Er(){return gt(function(n){var a=n.monaco;return a})}var Un=new Promise(function(n,a){return wn({resolve:n,reject:a})}),Mn={config:wr,init:Mr,__getMonacoInstance:Er};var Ci=new T("IS_EXTENSION_MODE",{providedIn:"root",factory:()=>tn(false)});var Sr=["editorContainer"];function Or(n,a){n&1&&(ku(0,"div",2),Tw(1,"\u26A0\uFE0F Invalid JSON syntax detected."),Pu());}var kn=class n{isExtensionMode=g(Ci);layoutJson;isJsonInvalid=tn(false);editorContainer;editor;destroyed=false;TEST_ONLY={layoutJson:()=>this.layoutJson,isJsonInvalid:()=>this.isJsonInvalid};hostCommunication=g(Xt);catalogManagement=g(oo$1);stateSync=g(Ye);chatState=g(ae);destroyRef=g(Le);layoutInput$=new ee;isLocked=this.chatState.isProgrammaticStreamActive;constructor(){this.layoutJson=tn(this.stateSync.hydrateActiveDraft()),Jd(()=>{if(this.catalogManagement.activeCatalog()){let e=mg(()=>this.layoutJson());try{let t=this.parseLayoutString(e);t!==null&&this.hostCommunication.sendRenderA2UI(t);}catch{}}}),Jd(()=>{let a=this.stateSync.activeDraft();mg(()=>{this.layoutJson()!==a&&queueMicrotask(()=>{this.layoutJson.set(a),this.editor&&this.editor.getValue()!==a&&this.editor.setValue(a);try{let e=this.parseLayoutString(a);e!==null?(this.isJsonInvalid.set(!1),this.hostCommunication.sendRenderA2UI(e)):this.isJsonInvalid.set(!0);}catch{this.isJsonInvalid.set(true);}});});}),Jd(()=>{let a=this.isLocked();mg(()=>{this.editor&&this.editor.updateOptions({readOnly:a});});}),this.layoutInput$.pipe(zm(300),se$1(a=>{try{let e=this.parseLayoutString(a);return e!==null?(this.isJsonInvalid.set(!1),e):(this.isJsonInvalid.set(!0),null)}catch{return this.isJsonInvalid.set(true),null}}),Vt(a=>a!==null),$i$1(this.destroyRef)).subscribe(a=>{this.hostCommunication.sendRenderA2UI(a);});}ngAfterViewInit(){Mn.config({paths:{vs:"assets/monaco/vs"}}),Mn.init().then(a=>{if(this.destroyed)return;let e=a.editor.create(this.editorContainer.nativeElement,{value:this.layoutJson(),language:"json",theme:"vs-light",automaticLayout:true,minimap:{enabled:false},readOnly:this.isLocked(),scrollBeyondLastLine:false,lineNumbers:"on",folding:true,wordWrap:"on",ariaLabel:"Raw layout JSON"});this.editor=e,e.onDidChangeModelContent(()=>{let t=e.getValue();t!==this.layoutJson()&&this.onLayoutChange(t);});});}ngOnDestroy(){this.destroyed=true,this.editor&&this.editor.dispose();}onLayoutChange(a){this.layoutJson.set(a),this.layoutInput$.next(a),this.stateSync.updateDraft(a);}parseLayoutString(a){let e=a.trim();if(!e)return [];try{let t=JSON.parse(e);return Array.isArray(t)?t:[t]}catch{throw new SyntaxError("Invalid JSON")}}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-raw-frame"]],viewQuery:function(e,t){if(e&1&&Kh(Sr,5),e&2){let i;ew(i=tw())&&(t.editorContainer=i.first);}},decls:4,vars:5,consts:[["editorContainer",""],[1,"raw-frame-container"],[1,"invalid-json-badge"],[1,"monaco-editor-container"]],template:function(e,t){e&1&&(ku(0,"div",1),FI(1,Or,2,0,"div",2),Uh(2,"div",3,0),Pu()),e&2&&(rg("is-collapsed",t.isExtensionMode())("is-locked",t.isLocked()),VD(),LI(t.isJsonInvalid()?1:-1));},styles:["[_nghost-%COMP%]{flex:1;display:block;width:100%;height:100%}.raw-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;padding:0;height:100%;box-sizing:border-box;transition:all .3s ease}.raw-frame-container.is-locked[_ngcontent-%COMP%]{opacity:.55;pointer-events:none;cursor:not-allowed}.raw-frame-container[_ngcontent-%COMP%]   .invalid-json-badge[_ngcontent-%COMP%]{color:#f44336;font-weight:700;padding:8px 0}.raw-frame-container[_ngcontent-%COMP%]   .monaco-editor-container[_ngcontent-%COMP%]{width:100%;height:100%;flex:1 1 auto;display:block;border:1px solid rgba(0,0,0,.12);border-radius:4px;overflow:hidden}.raw-frame-container.is-collapsed[_ngcontent-%COMP%]   .monaco-editor-container[_ngcontent-%COMP%]{font-size:12px}"]})};function Ir(n,a){n&1&&(zi$1(0,"div",1),Tw(1,"\u26A0\uFE0F Invalid JSON syntax detected."),Ou());}var Pn=class n{hostComm=g(Xt);lastSurfaceId="sample-surface";lastPath=void 0;latestModelValue=tn(null);dataModelJson=qw({source:this.latestModelValue,computation:a=>a===null?"":typeof a=="string"?a:qt(a)});isJsonInvalid=Gw(()=>{let a=this.dataModelJson();if(!a)return  false;try{return JSON.parse(a),!1}catch{return  true}});constructor(){Jd(()=>{let a=this.hostComm.messageStream();if(a?.type===E.DATA_MODEL_CHANGE){let t=a?.payload?.updateDataModel;if(t){typeof t.surfaceId=="string"&&(this.lastSurfaceId=t.surfaceId),typeof t.path=="string"?this.lastPath=t.path:this.lastPath=void 0;let i=t.value;mg(()=>this.latestModelValue.set(i));}}}),Tu(this.dataModelJson).pipe(zm(300),Wm(),Vt(a=>{try{return JSON.parse(a),!0}catch{return  false}})).subscribe(a=>{let e=JSON.parse(a),t=this.latestModelValue(),i=t?JSON.stringify(t):"",o=JSON.stringify(e);i!==o&&this.hostComm.sendMessage({type:E.DATA_MODEL_CHANGE,payload:{updateDataModel:{surfaceId:this.lastSurfaceId,path:this.lastPath,value:e}}});});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-data-model"]],decls:4,vars:2,consts:[[1,"data-model-container"],[1,"invalid-json-badge"],["appearance","outline","subscriptSizing","dynamic",1,"data-model-field"],["matInput","","aria-label","Data model JSON","placeholder","Enter data model JSON here...",3,"ngModelChange","ngModel"]],template:function(e,t){e&1&&(zi$1(0,"div",0),FI(1,Ir,2,0,"div",1),zi$1(2,"mat-form-field",2)(3,"textarea",3),qh("ngModelChange",function(o){return t.dataModelJson.set(o)}),Ou(),_E(),Ou()()),e&2&&(VD(),LI(t.isJsonInvalid()?1:-1),VD(2),Vh("ngModel",t.dataModelJson()),ME());},dependencies:[se,it,rn$1,on$1,fu,Ci$1,lu,Rs$1],styles:["[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;width:100%}.data-model-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;height:100%;width:100%;flex:1}.data-model-container[_ngcontent-%COMP%]   .invalid-json-badge[_ngcontent-%COMP%]{color:#f44336;font-weight:700;padding:8px 0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]{width:100%;flex:1;min-height:0;display:block}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mdc-notched-outline{display:none!important}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mat-mdc-text-field-wrapper{height:100%;padding-right:0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mat-mdc-form-field-flex{height:100%;background-color:transparent;padding:0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]     .mat-mdc-form-field-infix{height:100%;display:flex;flex-direction:column;box-sizing:border-box;padding-top:0}.data-model-container[_ngcontent-%COMP%]   .data-model-field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]{font-family:monospace;resize:none;flex:1 1 auto;height:100%;width:100%;box-sizing:border-box;border:none;outline:none;background:transparent}"]})};function ge(n){let a=new Date(n),e=String(a.getHours()).padStart(2,"0"),t=String(a.getMinutes()).padStart(2,"0"),i=String(a.getSeconds()).padStart(2,"0"),o=String(a.getMilliseconds()).padStart(3,"0");return `${e}:${t}:${i}.${o}`}function Rr(n,a){n&1&&(zi$1(0,"th",12),Tw(1,"Time"),Ou());}function Lr(n,a){if(n&1&&(zi$1(0,"td",13),Tw(1),Ou()),n&2){let e=a.$implicit;VD(),ug(e.time);}}function Fr(n,a){n&1&&(zi$1(0,"th",12),Tw(1,"Action Name"),Ou());}function Br(n,a){if(n&1&&(zi$1(0,"td",13),Tw(1),Ou()),n&2){let e=a.$implicit;VD(),ug(e.action);}}function Nr(n,a){n&1&&(zi$1(0,"th",12),Tw(1,"Surface ID"),Ou());}function jr(n,a){if(n&1&&(zi$1(0,"td",13),Tw(1),Ou()),n&2){let e=a.$implicit;VD(),ug(e.surface);}}function zr(n,a){n&1&&(zi$1(0,"th",12),Tw(1,"Source Component"),Ou());}function Hr(n,a){if(n&1&&(zi$1(0,"td",13),Tw(1),Ou()),n&2){let e=a.$implicit;VD(),ug(e.component);}}function Vr(n,a){n&1&&(zi$1(0,"th",12),Tw(1,"Context"),Ou());}function Wr(n,a){if(n&1&&(zi$1(0,"td",13)(1,"pre",14),Tw(2),Lw(3,"json"),Ou()()),n&2){let e=a.$implicit;VD(2),ug(Bw(3,1,e.context));}}function $r(n,a){n&1&&Hh(0,"tr",15);}function Gr(n,a){n&1&&Hh(0,"tr",16);}function Ur(n,a){if(n&1&&(zi$1(0,"table",1),Fu(1,3),kh(2,Rr,2,0,"th",4)(3,Lr,2,1,"td",5),Lu(),Fu(4,6),kh(5,Fr,2,0,"th",4)(6,Br,2,1,"td",5),Lu(),Fu(7,7),kh(8,Nr,2,0,"th",4)(9,jr,2,1,"td",5),Lu(),Fu(10,8),kh(11,zr,2,0,"th",4)(12,Hr,2,1,"td",5),Lu(),Fu(13,9),kh(14,Vr,2,0,"th",4)(15,Wr,4,3,"td",5),Lu(),kh(16,$r,1,0,"tr",10)(17,Gr,1,0,"tr",11),Ou()),n&2){let e=YI();Vh("dataSource",e.eventsLog()),VD(16),Vh("matHeaderRowDef",e.displayedColumns),VD(),Vh("matRowDefColumns",e.displayedColumns);}}function Jr(n,a){n&1&&(zi$1(0,"div",2),Tw(1,"No events captured yet"),Ou());}var Ze=class n{hostComm=g(Xt);eventsLog=tn([]);displayedColumns=["time","action","surface","component","context"];constructor(){Jd(()=>{let a=this.hostComm.messageStream();if(a?.type===E.SEND_TO_SERVER){let e=a?.payload;if(e&&e.action){let t=e.action;if(typeof t=="string")try{t=JSON.parse(t);}catch{}if(t&&typeof t=="object"){let i=t,o=i.timestamp||a.timestamp,r={time:ge(o),action:i.name||"",surface:i.surfaceId||"",component:i.sourceComponentId||i.sourceComponent||"",context:i.context||i.contextParameters||null};mg(()=>{this.eventsLog.update(c=>{let h=[r,...c];return h.length>100&&(h.length=100),h});});}}}});}clearLogs(){this.eventsLog.set([]);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-events"]],decls:3,vars:1,consts:[[1,"events-container"],["mat-table","",1,"mat-elevation-z1",3,"dataSource"],[1,"events-placeholder"],["matColumnDef","time"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","action"],["matColumnDef","surface"],["matColumnDef","component"],["matColumnDef","context"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","","class","element-row",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],[1,"context-preview"],["mat-header-row",""],["mat-row","",1,"element-row"]],template:function(e,t){e&1&&(zi$1(0,"div",0),FI(1,Ur,18,3,"table",1)(2,Jr,2,0,"div",2),Ou()),e&2&&(VD(),LI(t.eventsLog().length>0?1:2));},dependencies:[mn,en,nn,an,rn,tn$1,ln,on,sn,cn,dn,RC],styles:["[_nghost-%COMP%]{display:block;height:100%;width:100%}.events-container[_ngcontent-%COMP%]{height:100%;width:100%;overflow:auto;box-sizing:border-box;padding:8px}.events-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mat-sys-on-surface-variant);font-size:14px}table[_ngcontent-%COMP%]{width:100%;background:var(--mat-sys-surface);border-radius:6px;overflow:hidden}table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{font-weight:700;color:var(--mat-sys-on-surface-variant);font-size:12px}table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface);vertical-align:middle}table[_ngcontent-%COMP%]   pre.context-preview[_ngcontent-%COMP%]{margin:0;font-family:monospace;font-size:11px;white-space:pre-wrap;background:var(--mat-sys-surface-container-lowest);padding:4px 8px;border-radius:4px;max-width:300px;overflow-x:auto}"]})};var Qr=()=>["expandedDetail"];function qr(n,a){n&1&&(zi$1(0,"th",13),Tw(1,"Time"),Ou());}function Kr(n,a){if(n&1&&(zi$1(0,"td",14),Tw(1),Ou()),n&2){let e=a.$implicit;VD(),ug(e.time);}}function Yr(n,a){n&1&&(zi$1(0,"th",13),Tw(1,"Level"),Ou());}function Zr(n,a){if(n&1&&(zi$1(0,"td",14)(1,"span",15),Tw(2),Ou()()),n&2){let e=a.$implicit;VD(),hw(e.level),VD(),ug(e.level);}}function Xr(n,a){n&1&&(zi$1(0,"th",13),Tw(1,"Source"),Ou());}function es(n,a){if(n&1&&(zi$1(0,"td",14)(1,"span",16),Tw(2),Ou()()),n&2){let e=a.$implicit;VD(),hw(e.source),VD(),ug(e.source);}}function ts(n,a){n&1&&(zi$1(0,"th",13),Tw(1,"Message"),Ou());}function ns(n,a){if(n&1){let e=qI();zi$1(0,"button",20),qh("click",function(i){Rd(e);let o=YI().$implicit;return YI(2).toggleRow(o),Od(i.stopPropagation())}),zi$1(1,"mat-icon",21),Tw(2),Ou()();}if(n&2){let e=YI().$implicit,t=YI(2);VD(2),ug(t.isRowExpanded(e)?"keyboard_arrow_up":"keyboard_arrow_down");}}function as(n,a){if(n&1&&(zi$1(0,"td",14)(1,"div",17)(2,"span",18),Tw(3),Ou(),FI(4,ns,3,1,"button",19),Ou()()),n&2){let e=a.$implicit;VD(3),ug(e.message),VD(),LI(e.stack?4:-1);}}function is(n,a){if(n&1&&(zi$1(0,"pre",23),Tw(1),Ou()),n&2){let e=YI().$implicit;VD(),ug(e.stack);}}function os(n,a){if(n&1&&(zi$1(0,"td",14)(1,"div",22),FI(2,is,2,1,"pre",23),Ou()()),n&2){let e=a.$implicit,t=YI(2);Bh("colspan",t.columnsToDisplay.length),VD(2),LI(e.stack?2:-1);}}function rs(n,a){n&1&&Hh(0,"tr",24);}function ss(n,a){if(n&1&&Hh(0,"tr",25),n&2){let e=a.dataIndex;Bh("data-row-index",e);}}function ls(n,a){if(n&1&&Hh(0,"tr",26),n&2){let e=a.$implicit,t=YI(2);rg("expanded",t.isRowExpanded(e));}}function cs(n,a){if(n&1&&(zi$1(0,"table",1),Fu(1,3),kh(2,qr,2,0,"th",4)(3,Kr,2,1,"td",5),Lu(),Fu(4,6),kh(5,Yr,2,0,"th",4)(6,Zr,3,3,"td",5),Lu(),Fu(7,7),kh(8,Xr,2,0,"th",4)(9,es,3,3,"td",5),Lu(),Fu(10,8),kh(11,ts,2,0,"th",4)(12,as,5,2,"td",5),Lu(),Fu(13,9),kh(14,os,3,2,"td",5),Lu(),kh(15,rs,1,0,"tr",10)(16,ss,1,1,"tr",11)(17,ls,1,2,"tr",12),Ou()),n&2){let e=YI();Vh("dataSource",e.errorsLog()),VD(15),Vh("matHeaderRowDef",e.columnsToDisplay),VD(),Vh("matRowDefColumns",e.columnsToDisplay),VD(),Vh("matRowDefColumns",kw(4,Qr));}}function ds(n,a){n&1&&(zi$1(0,"div",2),Tw(1,"No errors captured yet"),Ou());}var Xe=class n{hostComm=g(Xt);errorsLog=tn([]);columnsToDisplay=["time","level","source","message"];expandedRows=tn(new Set);constructor(){Jd(()=>{let a=this.hostComm.messageStream();if(!a)return;let e=a.payload;if(e){if(a.type===E.CONSOLE_LOG){let t=e.message||"",i=t.includes("Unhandled Rejection")||t.includes("Uncaught")||!!e.stack,o=i?"exception":"console",r=i?"error":e.level||"log",c={time:ge(a.timestamp),source:o,level:r,message:t,stack:e.stack||void 0};mg(()=>{this.errorsLog.update(h=>{let g=[c,...h];return g.length>100&&(g.length=100),g});});}else if(a.type===E.DATA_MODEL_CHANGE&&e.validationErrors){let t=e.validationErrors;if(Array.isArray(t)?t.length>0:typeof t=="object"&&t!==null?Object.keys(t).length>0:!!t){let o="";Array.isArray(t)?o=t.map(c=>typeof c=="string"?c:JSON.stringify(c)).join(", "):typeof t=="object"?o=JSON.stringify(t):o=String(t);let r={time:ge(a.timestamp),source:"validation",level:"error",message:o,stack:void 0};mg(()=>{this.errorsLog.update(c=>{let h=[r,...c];return h.length>100&&(h.length=100),h});});}}}});}toggleRow(a){this.expandedRows.update(e=>{let t=new Set(e);return t.has(a)?t.delete(a):t.add(a),t});}isRowExpanded(a){return this.expandedRows().has(a)}clearLogs(){this.errorsLog.set([]),this.expandedRows.set(new Set);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-errors"]],decls:3,vars:1,consts:[[1,"errors-container"],["mat-table","","multiTemplateDataRows","",1,"mat-elevation-z1",3,"dataSource"],[1,"errors-placeholder"],["matColumnDef","time"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","level"],["matColumnDef","source"],["matColumnDef","message"],["matColumnDef","expandedDetail"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","","class","element-row",4,"matRowDef","matRowDefColumns"],["mat-row","","class","detail-row",3,"expanded",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],[1,"level-badge"],[1,"source-badge"],[1,"message-cell"],[1,"error-message-text"],["mat-icon-button","","aria-label","Toggle Stack Trace"],["mat-icon-button","","aria-label","Toggle Stack Trace",3,"click"],["aria-hidden","true"],[1,"element-detail"],[1,"stack-preview"],["mat-header-row",""],["mat-row","",1,"element-row"],["mat-row","",1,"detail-row"]],template:function(e,t){e&1&&(zi$1(0,"div",0),FI(1,cs,18,5,"table",1)(2,ds,2,0,"div",2),Ou()),e&2&&(VD(),LI(t.errorsLog().length>0?1:2));},dependencies:[mn,en,nn,an,rn,tn$1,ln,on,sn,cn,dn,wd,Uo$1,Gd,Hd],styles:["[_nghost-%COMP%]{display:block;height:100%;width:100%}.errors-container[_ngcontent-%COMP%]{height:100%;width:100%;overflow:auto;box-sizing:border-box;padding:2px 0 2px 8px}.errors-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mat-sys-on-surface-variant);font-size:14px}table[_ngcontent-%COMP%]{width:100%;background:var(--mat-sys-surface);border-radius:6px;overflow:hidden}table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{font-weight:700;color:var(--mat-sys-on-surface-variant);font-size:12px}table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface);vertical-align:middle}table[_ngcontent-%COMP%]   .source-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}table[_ngcontent-%COMP%]   .source-badge.exception[_ngcontent-%COMP%]{background-color:#ffdad6;color:#ba1a1a}table[_ngcontent-%COMP%]   .source-badge.console[_ngcontent-%COMP%]{background-color:#ffe082;color:#ff8f00}table[_ngcontent-%COMP%]   .source-badge.validation[_ngcontent-%COMP%]{background-color:#e8f5e9;color:#2e7d32}table[_ngcontent-%COMP%]   .level-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}table[_ngcontent-%COMP%]   .level-badge.error[_ngcontent-%COMP%]{background-color:#ffdad6;color:#ba1a1a}table[_ngcontent-%COMP%]   .level-badge.warn[_ngcontent-%COMP%]{background-color:#ffe082;color:#ff8f00}table[_ngcontent-%COMP%]   .level-badge.info[_ngcontent-%COMP%]{background-color:#e8f0fe;color:#1a73e8}table[_ngcontent-%COMP%]   .level-badge.debug[_ngcontent-%COMP%], table[_ngcontent-%COMP%]   .level-badge.log[_ngcontent-%COMP%]{background-color:#f1f3f4;color:#5f6368}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   .error-message-text[_ngcontent-%COMP%]{flex:1;white-space:normal;word-break:break-word}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{width:28px;height:28px;line-height:28px}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]     .mat-mdc-button-touch-target{display:none}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:18px;width:18px;height:18px}table[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]{height:0;display:none}table[_ngcontent-%COMP%]   .detail-row.expanded[_ngcontent-%COMP%]{display:table-row;height:auto}table[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{border-bottom-width:0;padding:0}table[_ngcontent-%COMP%]   .element-detail[_ngcontent-%COMP%]{overflow:hidden;box-sizing:border-box;background:var(--mat-sys-surface-container-lowest)}table[_ngcontent-%COMP%]   .element-detail[_ngcontent-%COMP%]   pre.stack-preview[_ngcontent-%COMP%]{margin:8px;font-family:monospace;font-size:11px;white-space:pre-wrap;word-break:break-all;color:var(--mat-sys-error);padding:8px;border-left:3px solid var(--mat-sys-error);background:#ba1a1a0d;border-radius:0 4px 4px 0}"]})};var wi=new T("CdkAccordion");var Mi=(()=>{class n{accordion=g(wi,{optional:true,skipSelf:true});_changeDetectorRef=g(gC);_expansionDispatcher=g(H$1);_openCloseAllSubscription=H.EMPTY;closed=new We;opened=new We;destroyed=new We;expandedChange=new We;id=g(Cn$1).getId("cdk-accordion-child-");get expanded(){return this._expanded}set expanded(e){if(this._expanded!==e){if(this._expanded=e,this.expandedChange.emit(e),e){this.opened.emit();let t=this.accordion?this.accordion.id:this.id;this._expansionDispatcher.notify(this.id,t);}else this.closed.emit();this._changeDetectorRef.markForCheck();}}_expanded=false;get disabled(){return this._disabled()}set disabled(e){this._disabled.set(e);}_disabled=tn(false);_removeUniqueSelectionListener=()=>{};ngOnInit(){this._removeUniqueSelectionListener=this._expansionDispatcher.listen((e,t)=>{this.accordion&&!this.accordion.multi&&this.accordion.id===t&&this.id!==e&&(this.expanded=false);}),this.accordion&&(this._openCloseAllSubscription=this._subscribeToOpenCloseAllActions());}ngOnDestroy(){this.opened.complete(),this.closed.complete(),this.destroyed.emit(),this.destroyed.complete(),this._removeUniqueSelectionListener(),this._openCloseAllSubscription.unsubscribe();}toggle(){this.disabled||(this.expanded=!this.expanded);}close(){this.disabled||(this.expanded=false);}open(){this.disabled||(this.expanded=true);}_subscribeToOpenCloseAllActions(){return this.accordion._openCloseAllActions.subscribe(e=>{this.disabled||(this.expanded=e);})}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["cdk-accordion-item"],["","cdkAccordionItem",""]],inputs:{expanded:[2,"expanded","expanded",x1],disabled:[2,"disabled","disabled",x1]},outputs:{closed:"closed",opened:"opened",destroyed:"destroyed",expandedChange:"expandedChange"},exportAs:["cdkAccordionItem"],features:[Ow([{provide:wi,useValue:void 0}])]})}return n})(),ki=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os$1({type:n});static \u0275inj=Dr$1({})}return n})();var ms=["body"],ps=["bodyWrapper"],us=[[["mat-expansion-panel-header"]],"*",[["mat-action-row"]]],hs=["mat-expansion-panel-header","*","mat-action-row"];function gs(n,a){}var bs=[[["mat-panel-title"]],[["mat-panel-description"]],"*"],fs=["mat-panel-title","mat-panel-description","*"];function _s(n,a){n&1&&(ku(0,"span",1),Gd$1(),ku(1,"svg",2),Uh(2,"path",3),Pu()());}var Pi=new T("MAT_ACCORDION"),Di=new T("MAT_EXPANSION_PANEL"),ys=(()=>{class n{_template=g(zn$1);_expansionPanel=g(Di,{optional:true});static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["ng-template","matExpansionPanelContent",""]]})}return n})(),Ti=new T("MAT_EXPANSION_PANEL_DEFAULT_OPTIONS"),qn=(()=>{class n extends Mi{_viewContainerRef=g(Kn$1);_animationsDisabled=xe();_document=g(W);_ngZone=g(K);_elementRef=g(Yn$1);_renderer=g(ah);_cleanupTransitionEnd;get hideToggle(){return this._hideToggle||this.accordion&&this.accordion.hideToggle}set hideToggle(e){this._hideToggle=e;}_hideToggle=false;get togglePosition(){return this._togglePosition||this.accordion&&this.accordion.togglePosition}set togglePosition(e){this._togglePosition=e;}_togglePosition;afterExpand=new We;afterCollapse=new We;_inputChanges=new ee;accordion=g(Pi,{optional:true,skipSelf:true});_lazyContent;_body;_bodyWrapper;_portal;_headerId=g(Cn$1).getId("mat-expansion-panel-header-");constructor(){super();let e=g(Ti,{optional:true});this._expansionDispatcher=g(H$1),e&&(this.hideToggle=e.hideToggle);}_hasSpacing(){return this.accordion?this.expanded&&this.accordion.displayMode==="default":false}_getExpandedState(){return this.expanded?"expanded":"collapsed"}toggle(){this.expanded=!this.expanded;}close(){this.expanded=false;}open(){this.expanded=true;}ngAfterContentInit(){this._lazyContent&&this._lazyContent._expansionPanel===this&&this.opened.pipe(ey(null),Vt(()=>this.expanded&&!this._portal),Tn(1)).subscribe(()=>{this._portal=new B(this._lazyContent._template,this._viewContainerRef);}),this._setupAnimationEvents();}ngOnChanges(e){this._inputChanges.next(e);}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTransitionEnd?.(),this._inputChanges.complete();}_containsFocus(){if(this._body){let e=this._document.activeElement,t=this._body.nativeElement;return e===t||t.contains(e)}return  false}_transitionEndListener=({target:e,propertyName:t})=>{e===this._bodyWrapper?.nativeElement&&t==="grid-template-rows"&&this._ngZone.run(()=>{this.expanded?this.afterExpand.emit():this.afterCollapse.emit();});};_setupAnimationEvents(){this._ngZone.runOutsideAngular(()=>{this._animationsDisabled?(this.opened.subscribe(()=>this._ngZone.run(()=>this.afterExpand.emit())),this.closed.subscribe(()=>this._ngZone.run(()=>this.afterCollapse.emit()))):setTimeout(()=>{let e=this._elementRef.nativeElement;this._cleanupTransitionEnd=this._renderer.listen(e,"transitionend",this._transitionEndListener),e.classList.add("mat-expansion-panel-animations-enabled");},200);});}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["mat-expansion-panel"]],contentQueries:function(t,i,o){if(t&1&&Qh(o,ys,5),t&2){let r;ew(r=tw())&&(i._lazyContent=r.first);}},viewQuery:function(t,i){if(t&1&&Kh(ms,5)(ps,5),t&2){let o;ew(o=tw())&&(i._body=o.first),ew(o=tw())&&(i._bodyWrapper=o.first);}},hostAttrs:[1,"mat-expansion-panel"],hostVars:4,hostBindings:function(t,i){t&2&&rg("mat-expanded",i.expanded)("mat-expansion-panel-spacing",i._hasSpacing());},inputs:{hideToggle:[2,"hideToggle","hideToggle",x1],togglePosition:"togglePosition"},outputs:{afterExpand:"afterExpand",afterCollapse:"afterCollapse"},exportAs:["matExpansionPanel"],features:[Ow([{provide:Pi,useValue:void 0},{provide:Di,useExisting:n}]),Rh,$c],ngContentSelectors:hs,decls:9,vars:4,consts:[["bodyWrapper",""],["body",""],[1,"mat-expansion-panel-content-wrapper"],["role","region",1,"mat-expansion-panel-content",3,"id"],[1,"mat-expansion-panel-body"],[3,"cdkPortalOutlet"]],template:function(t,i){t&1&&(KI(us),XI(0),zi$1(1,"div",2,0)(3,"div",3,1)(5,"div",4),XI(6,1),kh(7,gs,0,0,"ng-template",5),Ou(),XI(8,2),Ou()()),t&2&&(VD(),Bh("inert",i.expanded?null:""),VD(2),Vh("id",i.id),Bh("aria-labelledby",i._headerId),VD(4),Vh("cdkPortalOutlet",i._portal));},dependencies:[Ye$1],styles:[`.mat-expansion-panel {
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
`],encapsulation:2})}return n})();var Ei=(()=>{class n{panel=g(qn,{host:true});_element=g(Yn$1);_focusMonitor=g(At);_changeDetectorRef=g(gC);_parentChangeSubscription=H.EMPTY;constructor(){g(q).load(ri$2);let e=this.panel,t=g(Ti,{optional:true}),i=g(new yg("tabindex"),{optional:true}),o=e.accordion?e.accordion._stateChanges.pipe(Vt(r=>!!(r.hideToggle||r.togglePosition))):jt;this.tabIndex=parseInt(i||"")||0,this._parentChangeSubscription=Um(e.opened,e.closed,o,e._inputChanges.pipe(Vt(r=>!!(r.hideToggle||r.disabled||r.togglePosition)))).subscribe(()=>this._changeDetectorRef.markForCheck()),e.closed.pipe(Vt(()=>e._containsFocus())).subscribe(()=>this._focusMonitor.focusVia(this._element,"program")),t&&(this.expandedHeight=t.expandedHeight,this.collapsedHeight=t.collapsedHeight);}expandedHeight;collapsedHeight;tabIndex=0;get disabled(){return this.panel.disabled}_toggle(){this.disabled||this.panel.toggle();}_isExpanded(){return this.panel.expanded}_getExpandedState(){return this.panel._getExpandedState()}_getPanelId(){return this.panel.id}_getTogglePosition(){return this.panel.togglePosition}_showToggle(){return !this.panel.hideToggle&&!this.panel.disabled}_getHeaderHeight(){let e=this._isExpanded();return e&&this.expandedHeight?this.expandedHeight:!e&&this.collapsedHeight?this.collapsedHeight:null}_keydown(e){switch(e.keyCode){case 32:case 13:Gr$1(e)||(e.preventDefault(),this._toggle());break;default:this.panel.accordion&&this.panel.accordion._handleHeaderKeydown(e);return}}focus(e,t){e?this._focusMonitor.focusVia(this._element,e,t):this._element.nativeElement.focus(t);}ngAfterViewInit(){this._focusMonitor.monitor(this._element).subscribe(e=>{e&&this.panel.accordion&&this.panel.accordion._handleHeaderFocus(this);});}ngOnDestroy(){this._parentChangeSubscription.unsubscribe(),this._focusMonitor.stopMonitoring(this._element);}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["mat-expansion-panel-header"]],hostAttrs:["role","button",1,"mat-expansion-panel-header","mat-focus-indicator"],hostVars:13,hostBindings:function(t,i){t&1&&qh("click",function(){return i._toggle()})("keydown",function(r){return i._keydown(r)}),t&2&&(Bh("id",i.panel._headerId)("tabindex",i.disabled?-1:i.tabIndex)("aria-controls",i._getPanelId())("aria-expanded",i._isExpanded())("aria-disabled",i.panel.disabled),ng("height",i._getHeaderHeight()),rg("mat-expanded",i._isExpanded())("mat-expansion-toggle-indicator-after",i._getTogglePosition()==="after")("mat-expansion-toggle-indicator-before",i._getTogglePosition()==="before"));},inputs:{expandedHeight:"expandedHeight",collapsedHeight:"collapsedHeight",tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:R1(e)]},ngContentSelectors:fs,decls:5,vars:3,consts:[[1,"mat-content"],[1,"mat-expansion-indicator"],["xmlns","http://www.w3.org/2000/svg","viewBox","0 -960 960 960","aria-hidden","true","focusable","false"],["d","M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"]],template:function(t,i){t&1&&(KI(bs),ku(0,"span",0),XI(1),XI(2,1),XI(3,2),Pu(),FI(4,_s,3,0,"span",1)),t&2&&(rg("mat-content-hide-toggle",!i._showToggle()),VD(4),LI(i._showToggle()?4:-1));},styles:[`.mat-expansion-panel-header {
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
`],encapsulation:2})}return n})();var Si=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["mat-panel-title"]],hostAttrs:[1,"mat-expansion-panel-header-title"]})}return n})();var Oi=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os$1({type:n});static \u0275inj=Dr$1({imports:[ki,Jt,Se]})}return n})();var xs=["logContainer"],Cs=(n,a)=>a.type+"-"+a.timestamp;function ws(n,a){if(n&1&&(zi$1(0,"span",8),Tw(1),Ou()),n&2){let e=YI(2).$implicit;VD(),ug(e.origin);}}function Ms(n,a){if(n&1&&(zi$1(0,"mat-expansion-panel",4)(1,"mat-expansion-panel-header")(2,"mat-panel-title")(3,"span",6),Tw(4),Ou(),zi$1(5,"span",7),Tw(6),Ou(),FI(7,ws,2,1,"span",8),Ou()(),zi$1(8,"pre"),Tw(9),Lw(10,"json"),Ou()()),n&2){let e=YI().$implicit;Vh("expanded",false),VD(4),ug(e.timestampStr),VD(2),ug(e.type),VD(),LI(e.origin?7:-1),VD(2),ug(Bw(10,5,e.payload));}}function ks(n,a){if(n&1&&(zi$1(0,"pre"),Tw(1),Lw(2,"json"),Ou()),n&2){let e=YI(2).$implicit;VD(),ug(Bw(2,1,e.payload));}}function Ps(n,a){if(n&1&&(zi$1(0,"div",5)(1,"div",9)(2,"span",6),Tw(3),Ou(),zi$1(4,"span",7),Tw(5),Ou(),zi$1(6,"span",8),Tw(7),Ou()(),FI(8,ks,3,3,"pre"),Ou()),n&2){let e=YI().$implicit;VD(3),ug(e.timestampStr),VD(2),ug(e.type),VD(2),ug(e.origin),VD(),LI(e.payload?8:-1);}}function Ds(n,a){if(n&1&&FI(0,Ms,11,7,"mat-expansion-panel",4)(1,Ps,9,4,"div",5),n&2){let e=a.$implicit,t=YI(2);LI(t.isCollapsible(e)?0:1);}}function Ts(n,a){if(n&1&&VI(0,Ds,2,1,null,null,Cs),n&2){let e=YI();HI(e.messageHistory());}}function Es(n,a){n&1&&(zi$1(0,"div",3),Tw(1,"No messages captured yet"),Ou());}var et=class n{hostComm=g(Xt);chatState=g(ae);messageHistory=tn([]);logContainer=M1("logContainer");TEST_ONLY={logContainer:()=>this.logContainer()};postMessageListener=a=>{a.type!==E.CONSOLE_LOG&&this.addLogEntry({type:a.type,payload:a.payload,timestamp:a.timestamp,timestampStr:ge(a.timestamp),origin:a.origin});};constructor(){let e=this.hostComm.getHistoryBuffer().filter(c=>c.type!==E.CONSOLE_LOG).map(c=>({type:c.type,payload:c.payload,timestamp:c.timestamp,timestampStr:ge(c.timestamp),origin:c.origin})),t=this.chatState.llmHistory().map(c=>({type:c.type,payload:c.payload,timestamp:c.timestamp,timestampStr:ge(c.timestamp)})),i=[...e,...t],o=[],r=new Set;for(let c of i){let h=`${c.type}-${c.timestamp}`;r.has(h)||(r.add(h),o.push(c));}o.sort((c,h)=>h.timestamp-c.timestamp),this.messageHistory.set(o.slice(0,100)),this.hostComm.addListener(this.postMessageListener),Jd(()=>{let c=this.chatState.latestLlmLog();c&&this.addLogEntry({type:c.type,payload:c.payload,timestamp:c.timestamp,timestampStr:ge(c.timestamp)});}),O1(()=>{this.messageHistory();let c=this.logContainer()?.nativeElement;c&&(c.scrollTop=0);});}clearLogs(){this.messageHistory.set([]),this.chatState.clearRawLlmHistory(),this.hostComm.clearHistoryBuffer();}ngOnDestroy(){this.hostComm.removeListener(this.postMessageListener);}isCollapsible(a){return a.type!==E.RENDERER_READY&&a.type!==E.FORCE_UNBLOCK&&a.type!==E.SET_BLOCKING_STATE}addLogEntry(a){this.messageHistory.update(e=>e.some(i=>i.timestamp===a.timestamp&&i.type===a.type)?e:[a,...e].sort((i,o)=>o.timestamp-i.timestamp).slice(0,100));}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-raw-messages"]],viewQuery:function(e,t){e&1&&Jh(t.logContainer,xs,5),e&2&&nw();},decls:5,vars:1,consts:[["logContainer",""],[1,"raw-messages-wrapper"],[1,"raw-messages-container"],[1,"raw-messages-placeholder"],["data-testid","llm-log-panel",1,"llm-log-panel",3,"expanded"],["data-testid","raw-message-envelope",1,"message-envelope"],[1,"timestamp"],[1,"message-type"],[1,"origin"],[1,"envelope-header"]],template:function(e,t){e&1&&(zi$1(0,"div",1)(1,"div",2,0),FI(3,Ts,2,0)(4,Es,2,0,"div",3),Ou()()),e&2&&(VD(3),LI(t.messageHistory().length>0?3:4));},dependencies:[Oi,qn,Ei,Si,RC],styles:["[_nghost-%COMP%]{display:block;height:100%;width:100%}.raw-messages-wrapper[_ngcontent-%COMP%]{display:flex;flex-direction:column;height:100%;width:100%}.raw-messages-container[_ngcontent-%COMP%]{flex:1;height:0;width:100%;overflow-y:auto;box-sizing:border-box;padding:0 8px 8px;display:flex;flex-direction:column;gap:4px}.raw-messages-container[_ngcontent-%COMP%] > [_ngcontent-%COMP%]:first-child{margin-top:8px}.raw-messages-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mat-sys-on-surface-variant);font-size:14px}.message-envelope[_ngcontent-%COMP%]{flex-shrink:0;border:1px solid var(--mat-sys-outline-variant);border-radius:4px;background-color:var(--mat-sys-surface-container);padding:6px 8px;box-shadow:0 1px 2px #0000000d;display:flex;flex-direction:column;gap:4px}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]{display:flex;gap:12px;font-size:11px;font-weight:700;color:var(--mat-sys-on-surface-variant);padding-bottom:2px;margin-bottom:2px}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]   .timestamp[_ngcontent-%COMP%]{color:var(--mat-sys-primary)}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]   .message-type[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.message-envelope[_ngcontent-%COMP%]   .envelope-header[_ngcontent-%COMP%]   .origin[_ngcontent-%COMP%]{margin-left:auto;font-weight:400}.message-envelope[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{margin:0;font-family:monospace;font-size:11px;overflow-x:auto;white-space:pre-wrap;color:var(--mat-sys-on-surface)}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]{flex-shrink:0;min-width:0;box-shadow:none!important;background-color:var(--mat-sys-surface-container-low)!important;transition:background-color .2s ease}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]:hover{background-color:var(--mat-sys-surface-container)!important}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]{border:1px solid var(--mat-sys-outline-variant);border-radius:4px;overflow:visible!important}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     .mat-expansion-panel-content-wrapper{overflow:hidden;border-bottom-left-radius:inherit;border-bottom-right-radius:inherit}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-expansion-panel-header{position:sticky;top:0;z-index:10;height:28px!important;padding:0 8px!important;background-color:inherit;border-top-left-radius:inherit;border-top-right-radius:inherit}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-expansion-panel-header.mat-expanded{border-bottom:1px solid var(--mat-sys-outline-variant);box-shadow:0 2px 4px #0000000d}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title{display:flex;align-items:center;gap:12px;font-size:11px!important;color:var(--mat-sys-on-surface-variant)!important}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .timestamp{color:var(--mat-sys-primary);font-weight:700}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .message-type{color:var(--mat-sys-tertiary);font-weight:700}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .message-type.llm{color:var(--mat-sys-primary)}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-title .origin{margin-left:auto;font-weight:400;opacity:.8}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     mat-panel-description{font-size:10px;color:var(--mat-sys-outline);display:flex;align-items:center;justify-content:flex-end}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]     .mat-expansion-panel-body{padding:6px 8px!important;background-color:var(--mat-sys-surface-container-lowest)!important;min-width:0}mat-expansion-panel.llm-log-panel[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{margin:0;font-family:monospace;font-size:11px;overflow-x:auto;white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%;box-sizing:border-box;color:var(--mat-sys-on-surface)}"]})};var Dn=class n{static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-mock-rules"]],decls:2,vars:0,consts:[[1,"mock-rules-placeholder"]],template:function(e,t){e&1&&(ku(0,"div",0),Tw(1,"Mock Rules Placeholder"),Pu());},encapsulation:2})};var ta=["*"];function Ss(n,a){n&1&&XI(0);}var Os=["tabListContainer"],Is=["tabList"],As=["tabListInner"],Rs=["nextPaginator"],Ls=["previousPaginator"],Fs=["content"];function Bs(n,a){}var Ns=["tabBodyWrapper"],js=["tabHeader"];function zs(n,a){}function Hs(n,a){if(n&1&&kh(0,zs,0,0,"ng-template",12),n&2){let e=YI().$implicit;Vh("cdkPortalOutlet",e.templateLabel);}}function Vs(n,a){if(n&1&&Tw(0),n&2){let e=YI().$implicit;ug(e.textLabel);}}function Ws(n,a){if(n&1){let e=qI();zi$1(0,"div",7,2),qh("click",function(){let i=Rd(e),o=i.$implicit,r=i.$index,c=YI(),h=rw(1);return Od(c._handleClick(o,h,r))})("cdkFocusChange",function(i){let o=Rd(e).$index,r=YI();return Od(r._tabFocusChanged(i,o))}),Hh(2,"span",8)(3,"div",9),zi$1(4,"span",10)(5,"span",11),FI(6,Hs,1,1,null,12)(7,Vs,1,1),Ou()()();}if(n&2){let e=a.$implicit,t=a.$index,i=rw(1),o=YI();hw(e.labelClass),rg("mdc-tab--active",o.selectedIndex===t),Vh("id",o._getTabLabelId(e,t))("disabled",e.disabled)("fitInkBarToContent",o.fitInkBarToContent),Bh("tabIndex",o._getTabIndex(t))("aria-posinset",t+1)("aria-setsize",o._tabs.length)("aria-controls",o._getTabContentId(t))("aria-selected",o.selectedIndex===t)("aria-label",e.ariaLabel||null)("aria-labelledby",!e.ariaLabel&&e.ariaLabelledby?e.ariaLabelledby:null),VD(3),Vh("matRippleTrigger",i)("matRippleDisabled",e.disabled||o.disableRipple),VD(3),LI(e.templateLabel?6:7);}}function $s(n,a){n&1&&XI(0);}function Gs(n,a){if(n&1){let e=qI();zi$1(0,"mat-tab-body",13),qh("_onCentered",function(){Rd(e);let i=YI();return Od(i._removeTabBodyWrapperHeight())})("_onCentering",function(i){Rd(e);let o=YI();return Od(o._setTabBodyWrapperHeight(i))})("_beforeCentering",function(i){Rd(e);let o=YI();return Od(o._bodyCentered(i))}),Ou();}if(n&2){let e=a.$implicit,t=a.$index,i=YI();hw(e.bodyClass),Vh("id",i._getTabContentId(t))("content",e.content)("position",e.position)("animationDuration",i._bodyAnimationDuration)("preserveContent",i.preserveContent),Bh("tabindex",i.contentTabIndex!=null&&i.selectedIndex===t?i.contentTabIndex:null)("aria-labelledby",i._getTabLabelId(e,t))("aria-hidden",i.selectedIndex!==t);}}var Us=new T("MatTabContent"),Js=(()=>{class n{template=g(zn$1);static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["","matTabContent",""]],features:[Ow([{provide:Us,useExisting:n}])]})}return n})(),Qs=new T("MatTabLabel"),Li=new T("MAT_TAB"),na=(()=>{class n extends Fe{_closestTab=g(Li,{optional:true});static \u0275fac=(()=>{let e;return function(i){return (e||(e=tp(n)))(i||n)}})();static \u0275dir=_u({type:n,selectors:[["","mat-tab-label",""],["","matTabLabel",""]],features:[Ow([{provide:Qs,useExisting:n}]),Rh]})}return n})(),Fi=new T("MAT_TAB_GROUP"),aa=(()=>{class n{_viewContainerRef=g(Kn$1);_closestTabGroup=g(Fi,{optional:true});disabled=false;get templateLabel(){return this._templateLabel}set templateLabel(e){this._setTemplateLabelInput(e);}_templateLabel;_explicitContent=void 0;_implicitContent;textLabel="";ariaLabel;ariaLabelledby;labelClass;bodyClass;id=null;_contentPortal=null;get content(){return this._contentPortal}_stateChanges=new ee;position=null;origin=null;isActive=false;constructor(){g(q).load(ri$2);}ngOnChanges(e){(e.hasOwnProperty("textLabel")||e.hasOwnProperty("disabled"))&&this._stateChanges.next();}ngOnDestroy(){this._stateChanges.complete();}ngOnInit(){this._contentPortal=new B(this._explicitContent||this._implicitContent,this._viewContainerRef);}_setTemplateLabelInput(e){e&&e._closestTab===this&&(this._templateLabel=e);}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["mat-tab"]],contentQueries:function(t,i,o){if(t&1&&Qh(o,na,5)(o,Js,7,zn$1),t&2){let r;ew(r=tw())&&(i.templateLabel=r.first),ew(r=tw())&&(i._explicitContent=r.first);}},viewQuery:function(t,i){if(t&1&&Kh(zn$1,7),t&2){let o;ew(o=tw())&&(i._implicitContent=o.first);}},hostAttrs:["hidden",""],hostVars:1,hostBindings:function(t,i){t&2&&Bh("id",null);},inputs:{disabled:[2,"disabled","disabled",x1],textLabel:[0,"label","textLabel"],ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],labelClass:"labelClass",bodyClass:"bodyClass",id:"id"},exportAs:["matTab"],features:[Ow([{provide:Li,useExisting:n}]),$c],ngContentSelectors:ta,decls:1,vars:0,template:function(t,i){t&1&&(KI(),Ph(0,Ss,1,0,"ng-template"));},encapsulation:2,changeDetection:1})}return n})(),Kn="mdc-tab-indicator--active",Ii="mdc-tab-indicator--no-transition",Zn=class{_items;_currentItem;constructor(a){this._items=a;}hide(){this._items.forEach(a=>a.deactivateInkBar()),this._currentItem=void 0;}alignToElement(a){let e=this._items.find(i=>i.elementRef.nativeElement===a),t=this._currentItem;if(e!==t&&(t?.deactivateInkBar(),e)){let i=t?.elementRef.nativeElement.getBoundingClientRect?.();e.activateInkBar(i),this._currentItem=e;}}},qs=(()=>{class n{_elementRef=g(Yn$1);_inkBarElement=null;_inkBarContentElement=null;_fitToContent=false;get fitInkBarToContent(){return this._fitToContent}set fitInkBarToContent(e){this._fitToContent!==e&&(this._fitToContent=e,this._inkBarElement&&this._appendInkBarElement());}activateInkBar(e){let t=this._elementRef.nativeElement;if(!e||!t.getBoundingClientRect||!this._inkBarContentElement){t.classList.add(Kn);return}let i=t.getBoundingClientRect(),o=e.width/i.width,r=e.left-i.left;t.classList.add(Ii),this._inkBarContentElement.style.setProperty("transform",`translateX(${r}px) scaleX(${o})`),t.getBoundingClientRect(),t.classList.remove(Ii),t.classList.add(Kn),this._inkBarContentElement.style.setProperty("transform","");}deactivateInkBar(){this._elementRef.nativeElement.classList.remove(Kn);}ngOnInit(){this._createInkBarElement();}ngOnDestroy(){this._inkBarElement?.remove(),this._inkBarElement=this._inkBarContentElement=null;}_createInkBarElement(){let e=this._elementRef.nativeElement.ownerDocument||document,t=this._inkBarElement=e.createElement("span"),i=this._inkBarContentElement=e.createElement("span");t.className="mdc-tab-indicator",i.className="mdc-tab-indicator__content mdc-tab-indicator__content--underline",t.appendChild(this._inkBarContentElement),this._appendInkBarElement();}_appendInkBarElement(){this._inkBarElement;let e=this._fitToContent?this._elementRef.nativeElement.querySelector(".mdc-tab__content"):this._elementRef.nativeElement;e.appendChild(this._inkBarElement);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,inputs:{fitInkBarToContent:[2,"fitInkBarToContent","fitInkBarToContent",x1]}})}return n})();var Bi=(()=>{class n extends qs{elementRef=g(Yn$1);disabled=false;focus(){this.elementRef.nativeElement.focus();}getOffsetLeft(){return this.elementRef.nativeElement.offsetLeft}getOffsetWidth(){return this.elementRef.nativeElement.offsetWidth}static \u0275fac=(()=>{let e;return function(i){return (e||(e=tp(n)))(i||n)}})();static \u0275dir=_u({type:n,selectors:[["","matTabLabelWrapper",""]],hostVars:3,hostBindings:function(t,i){t&2&&(Bh("aria-disabled",!!i.disabled),rg("mat-mdc-tab-disabled",i.disabled));},inputs:{disabled:[2,"disabled","disabled",x1]},features:[Rh]})}return n})(),Ai={passive:true},Ks=650,Ys=100,Zs=(()=>{class n{_elementRef=g(Yn$1);_changeDetectorRef=g(gC);_viewportRuler=g(Xe$1);_dir=g(jo$1,{optional:true});_ngZone=g(K);_platform=g(R);_sharedResizeObserver=g(Ve$1);_injector=g(re);_renderer=g(ah);_animationsDisabled=xe();_eventCleanups;_scrollDistance=0;_selectedIndexChanged=false;_destroyed=new ee;_showPaginationControls=false;_disableScrollAfter=true;_disableScrollBefore=true;_tabLabelCount;_scrollDistanceChanged=false;_keyManager;_currentTextContent;_stopScrolling=new ee;disablePagination=false;get selectedIndex(){return this._selectedIndex}set selectedIndex(e){let t=isNaN(e)?0:e;this._selectedIndex!=t&&(this._selectedIndexChanged=true,this._selectedIndex=t,this._keyManager&&this._keyManager.updateActiveItem(t));}_selectedIndex=0;selectFocusedIndex=new We;indexFocused=new We;constructor(){this._eventCleanups=this._ngZone.runOutsideAngular(()=>[this._renderer.listen(this._elementRef.nativeElement,"mouseleave",()=>this._stopInterval())]);}ngAfterViewInit(){this._eventCleanups.push(this._renderer.listen(this._previousPaginator.nativeElement,"touchstart",()=>this._handlePaginatorPress("before"),Ai),this._renderer.listen(this._nextPaginator.nativeElement,"touchstart",()=>this._handlePaginatorPress("after"),Ai));}ngAfterContentInit(){let e=this._dir?this._dir.change:$s$1("ltr"),t=this._sharedResizeObserver.observe(this._elementRef.nativeElement).pipe(zm(32),ty(this._destroyed)),i=this._viewportRuler.change(150).pipe(ty(this._destroyed)),o=()=>{this.updatePagination(),this._alignInkBarToSelectedTab();};this._keyManager=new wn$1(this._items).withHorizontalOrientation(this._getLayoutDirection()).withHomeAndEnd().withWrap().skipPredicate(()=>false),this._keyManager.updateActiveItem(Math.max(this._selectedIndex,0)),mD(o,{injector:this._injector}),Um(e,i,t,this._items.changes,this._itemsResized()).pipe(ty(this._destroyed)).subscribe(()=>{this._ngZone.run(()=>{Promise.resolve().then(()=>{this._scrollDistance=Math.max(0,Math.min(this._getMaxScrollDistance(),this._scrollDistance)),o();});}),this._keyManager?.withHorizontalOrientation(this._getLayoutDirection());}),this._keyManager.change.subscribe(r=>{this.indexFocused.emit(r),this._setTabFocus(r);});}_itemsResized(){return typeof ResizeObserver!="function"?jt:this._items.changes.pipe(ey(this._items),rd(e=>new x(t=>this._ngZone.runOutsideAngular(()=>{let i=new ResizeObserver(o=>t.next(o));return e.forEach(o=>i.observe(o.elementRef.nativeElement)),()=>{i.disconnect();}}))),Jm(1),Vt(e=>e.some(t=>t.contentRect.width>0&&t.contentRect.height>0)))}ngAfterContentChecked(){this._tabLabelCount!=this._items.length&&(this.updatePagination(),this._tabLabelCount=this._items.length,this._changeDetectorRef.markForCheck()),this._selectedIndexChanged&&(this._scrollToLabel(this._selectedIndex),this._checkScrollingControls(),this._alignInkBarToSelectedTab(),this._selectedIndexChanged=false,this._changeDetectorRef.markForCheck()),this._scrollDistanceChanged&&(this._updateTabScrollPosition(),this._scrollDistanceChanged=false,this._changeDetectorRef.markForCheck());}ngOnDestroy(){this._eventCleanups.forEach(e=>e()),this._keyManager?.destroy(),this._destroyed.next(),this._destroyed.complete(),this._stopScrolling.complete();}_handleKeydown(e){if(!Gr$1(e))switch(e.keyCode){case 13:case 32:if(this.focusIndex!==this.selectedIndex){let t=this._items.get(this.focusIndex);t&&!t.disabled&&(this.selectFocusedIndex.emit(this.focusIndex),this._itemSelected(e));}break;default:this._keyManager?.onKeydown(e);}}_onContentChanges(){let e=this._elementRef.nativeElement.textContent;e!==this._currentTextContent&&(this._currentTextContent=e||"",this._ngZone.run(()=>{this.updatePagination(),this._alignInkBarToSelectedTab(),this._changeDetectorRef.markForCheck();}));}updatePagination(){this._checkPaginationEnabled(),this._checkScrollingControls(),this._updateTabScrollPosition();}get focusIndex(){return this._keyManager?this._keyManager.activeItemIndex:0}set focusIndex(e){!this._isValidIndex(e)||this.focusIndex===e||!this._keyManager||this._keyManager.setActiveItem(e);}_isValidIndex(e){return this._items?!!this._items.toArray()[e]:true}_setTabFocus(e){if(this._showPaginationControls&&this._scrollToLabel(e),this._items&&this._items.length){this._items.toArray()[e].focus();let t=this._tabListContainer.nativeElement;this._getLayoutDirection()=="ltr"?t.scrollLeft=0:t.scrollLeft=t.scrollWidth-t.offsetWidth;}}_getLayoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_updateTabScrollPosition(){if(this.disablePagination)return;let e=this.scrollDistance,t=this._getLayoutDirection()==="ltr"?-e:e;this._tabList.nativeElement.style.transform=`translateX(${Math.round(t)}px)`,(this._platform.TRIDENT||this._platform.EDGE)&&(this._tabListContainer.nativeElement.scrollLeft=0);}get scrollDistance(){return this._scrollDistance}set scrollDistance(e){this._scrollTo(e);}_scrollHeader(e){let t=this._tabListContainer.nativeElement.offsetWidth,i=(e=="before"?-1:1)*t/3;return this._scrollTo(this._scrollDistance+i)}_handlePaginatorClick(e){this._stopInterval(),this._scrollHeader(e);}_scrollToLabel(e){if(this.disablePagination)return;let t=this._items?this._items.toArray()[e]:null;if(!t)return;let i=this._tabListContainer.nativeElement.offsetWidth,{offsetLeft:o,offsetWidth:r}=t.elementRef.nativeElement,c,h;this._getLayoutDirection()=="ltr"?(c=o,h=c+r):(h=this._tabListInner.nativeElement.offsetWidth-o,c=h-r);let g=this.scrollDistance,M=this.scrollDistance+i;c<g?this.scrollDistance-=g-c:h>M&&(this.scrollDistance+=Math.min(h-M,c-g));}_checkPaginationEnabled(){if(this.disablePagination)this._showPaginationControls=false;else {let e=this._tabListInner.nativeElement.scrollWidth,t=this._elementRef.nativeElement.offsetWidth,i=e-t>=5;i||(this.scrollDistance=0),i!==this._showPaginationControls&&(this._showPaginationControls=i,this._changeDetectorRef.markForCheck());}}_checkScrollingControls(){this.disablePagination?this._disableScrollAfter=this._disableScrollBefore=true:(this._disableScrollBefore=this.scrollDistance==0,this._disableScrollAfter=this.scrollDistance==this._getMaxScrollDistance(),this._changeDetectorRef.markForCheck());}_getMaxScrollDistance(){let e=this._tabListInner.nativeElement.scrollWidth,t=this._tabListContainer.nativeElement.offsetWidth;return e-t||0}_alignInkBarToSelectedTab(){let e=this._items&&this._items.length?this._items.toArray()[this.selectedIndex]:null,t=e?e.elementRef.nativeElement:null;t?this._inkBar.alignToElement(t):this._inkBar.hide();}_stopInterval(){this._stopScrolling.next();}_handlePaginatorPress(e,t){t&&t.button!=null&&t.button!==0||(this._stopInterval(),fr$1(Ks,Ys).pipe(ty(Um(this._stopScrolling,this._destroyed))).subscribe(()=>{let{maxScrollDistance:i,distance:o}=this._scrollHeader(e);(o===0||o>=i)&&this._stopInterval();}));}_scrollTo(e){if(this.disablePagination)return {maxScrollDistance:0,distance:0};let t=this._getMaxScrollDistance();return this._scrollDistance=Math.max(0,Math.min(t,e)),this._scrollDistanceChanged=true,this._checkScrollingControls(),{maxScrollDistance:t,distance:this._scrollDistance}}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,inputs:{disablePagination:[2,"disablePagination","disablePagination",x1],selectedIndex:[2,"selectedIndex","selectedIndex",R1]},outputs:{selectFocusedIndex:"selectFocusedIndex",indexFocused:"indexFocused"}})}return n})(),Xs=(()=>{class n extends Zs{_items;_tabListContainer;_tabList;_tabListInner;_nextPaginator;_previousPaginator;_inkBar;ariaLabel;ariaLabelledby;disableRipple=false;ngAfterContentInit(){this._inkBar=new Zn(this._items),super.ngAfterContentInit();}_itemSelected(e){e.preventDefault();}static \u0275fac=(()=>{let e;return function(i){return (e||(e=tp(n)))(i||n)}})();static \u0275cmp=hI({type:n,selectors:[["mat-tab-header"]],contentQueries:function(t,i,o){if(t&1&&Qh(o,Bi,4),t&2){let r;ew(r=tw())&&(i._items=r);}},viewQuery:function(t,i){if(t&1&&Kh(Os,7)(Is,7)(As,7)(Rs,5)(Ls,5),t&2){let o;ew(o=tw())&&(i._tabListContainer=o.first),ew(o=tw())&&(i._tabList=o.first),ew(o=tw())&&(i._tabListInner=o.first),ew(o=tw())&&(i._nextPaginator=o.first),ew(o=tw())&&(i._previousPaginator=o.first);}},hostAttrs:[1,"mat-mdc-tab-header"],hostVars:4,hostBindings:function(t,i){t&2&&rg("mat-mdc-tab-header-pagination-controls-enabled",i._showPaginationControls)("mat-mdc-tab-header-rtl",i._getLayoutDirection()=="rtl");},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],disableRipple:[2,"disableRipple","disableRipple",x1]},features:[Rh],ngContentSelectors:ta,decls:13,vars:10,consts:[["previousPaginator",""],["tabListContainer",""],["tabList",""],["tabListInner",""],["nextPaginator",""],["mat-ripple","",1,"mat-mdc-tab-header-pagination","mat-mdc-tab-header-pagination-before",3,"click","mousedown","touchend","matRippleDisabled"],[1,"mat-mdc-tab-header-pagination-chevron"],[1,"mat-mdc-tab-label-container",3,"keydown"],["role","tablist",1,"mat-mdc-tab-list",3,"cdkObserveContent"],[1,"mat-mdc-tab-labels"],["mat-ripple","",1,"mat-mdc-tab-header-pagination","mat-mdc-tab-header-pagination-after",3,"mousedown","click","touchend","matRippleDisabled"]],template:function(t,i){t&1&&(KI(),zi$1(0,"div",5,0),qh("click",function(){return i._handlePaginatorClick("before")})("mousedown",function(r){return i._handlePaginatorPress("before",r)})("touchend",function(){return i._stopInterval()}),Hh(2,"div",6),Ou(),zi$1(3,"div",7,1),qh("keydown",function(r){return i._handleKeydown(r)}),zi$1(5,"div",8,2),qh("cdkObserveContent",function(){return i._onContentChanges()}),zi$1(7,"div",9,3),XI(9),Ou()()(),zi$1(10,"div",10,4),qh("mousedown",function(r){return i._handlePaginatorPress("after",r)})("click",function(){return i._handlePaginatorClick("after")})("touchend",function(){return i._stopInterval()}),Hh(12,"div",6),Ou()),t&2&&(rg("mat-mdc-tab-header-pagination-disabled",i._disableScrollBefore),Vh("matRippleDisabled",i._disableScrollBefore||i.disableRipple),VD(3),rg("_mat-animation-noopable",i._animationsDisabled),VD(2),Bh("aria-label",i.ariaLabel||null)("aria-labelledby",i.ariaLabelledby||null),VD(5),rg("mat-mdc-tab-header-pagination-disabled",i._disableScrollAfter),Vh("matRippleDisabled",i._disableScrollAfter||i.disableRipple));},dependencies:[Gc,ll],styles:[`.mat-mdc-tab-header {
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
`],encapsulation:2,changeDetection:1})}return n})(),el=new T("MAT_TABS_CONFIG"),Ri=(()=>{class n extends Ye$1{_host=g(Xn);_ngZone=g(K);_centeringSub=H.EMPTY;_leavingSub=H.EMPTY;ngOnInit(){super.ngOnInit(),this._centeringSub=this._host._beforeCentering.pipe(ey(this._host._isCenterPosition())).subscribe(e=>{this._host._content&&e&&!this.hasAttached()&&this._ngZone.run(()=>{Promise.resolve().then(),this.attach(this._host._content);});}),this._leavingSub=this._host._afterLeavingCenter.subscribe(()=>{this._host.preserveContent||this._ngZone.run(()=>this.detach());});}ngOnDestroy(){super.ngOnDestroy(),this._centeringSub.unsubscribe(),this._leavingSub.unsubscribe();}static \u0275fac=(()=>{let e;return function(i){return (e||(e=tp(n)))(i||n)}})();static \u0275dir=_u({type:n,selectors:[["","matTabBodyHost",""]],features:[Rh]})}return n})(),Xn=(()=>{class n{_elementRef=g(Yn$1);_dir=g(jo$1,{optional:true});_ngZone=g(K);_injector=g(re);_renderer=g(ah);_diAnimationsDisabled=xe();_eventCleanups;_initialized=false;_fallbackTimer;_positionIndex;_dirChangeSubscription=H.EMPTY;_position;_previousPosition;_onCentering=new We;_beforeCentering=new We;_afterLeavingCenter=new We;_onCentered=new We(true);_portalHost;_contentElement;_content;animationDuration="500ms";preserveContent=false;set position(e){this._positionIndex=e,this._computePositionAnimationState();}constructor(){if(this._dir){let e=g(gC);this._dirChangeSubscription=this._dir.change.subscribe(t=>{this._computePositionAnimationState(t),e.markForCheck();});}}ngOnInit(){this._bindTransitionEvents(),this._position==="center"&&(this._setActiveClass(true),mD(()=>this._onCentering.emit(this._elementRef.nativeElement.clientHeight),{injector:this._injector})),this._initialized=true;}ngOnDestroy(){clearTimeout(this._fallbackTimer),this._eventCleanups?.forEach(e=>e()),this._dirChangeSubscription.unsubscribe();}_bindTransitionEvents(){this._ngZone.runOutsideAngular(()=>{let e=this._elementRef.nativeElement,t=i=>{i.target===this._contentElement?.nativeElement&&(this._elementRef.nativeElement.classList.remove("mat-tab-body-animating"),i.type==="transitionend"&&this._transitionDone());};this._eventCleanups=[this._renderer.listen(e,"transitionstart",i=>{i.target===this._contentElement?.nativeElement&&(this._elementRef.nativeElement.classList.add("mat-tab-body-animating"),this._transitionStarted());}),this._renderer.listen(e,"transitionend",t),this._renderer.listen(e,"transitioncancel",t)];});}_transitionStarted(){clearTimeout(this._fallbackTimer);let e=this._position==="center";this._beforeCentering.emit(e),e&&this._onCentering.emit(this._elementRef.nativeElement.clientHeight);}_transitionDone(){this._position==="center"?this._onCentered.emit():this._previousPosition==="center"&&this._afterLeavingCenter.emit();}_setActiveClass(e){this._elementRef.nativeElement.classList.toggle("mat-mdc-tab-body-active",e);}_getLayoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_isCenterPosition(){return this._positionIndex===0}_computePositionAnimationState(e=this._getLayoutDirection()){this._previousPosition=this._position,this._positionIndex<0?this._position=e=="ltr"?"left":"right":this._positionIndex>0?this._position=e=="ltr"?"right":"left":this._position="center",this._animationsDisabled()?this._simulateTransitionEvents():this._initialized&&(this._position==="center"||this._previousPosition==="center")&&(clearTimeout(this._fallbackTimer),this._fallbackTimer=this._ngZone.runOutsideAngular(()=>setTimeout(()=>this._simulateTransitionEvents(),100)));}_simulateTransitionEvents(){this._transitionStarted(),mD(()=>this._transitionDone(),{injector:this._injector});}_animationsDisabled(){return this._diAnimationsDisabled||this.animationDuration==="0ms"||this.animationDuration==="0s"}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["mat-tab-body"]],viewQuery:function(t,i){if(t&1&&Kh(Ri,5)(Fs,5),t&2){let o;ew(o=tw())&&(i._portalHost=o.first),ew(o=tw())&&(i._contentElement=o.first);}},hostAttrs:[1,"mat-mdc-tab-body"],hostVars:1,hostBindings:function(t,i){t&2&&Bh("inert",i._position==="center"?null:"");},inputs:{_content:[0,"content","_content"],animationDuration:"animationDuration",preserveContent:"preserveContent",position:"position"},outputs:{_onCentering:"_onCentering",_beforeCentering:"_beforeCentering",_onCentered:"_onCentered"},decls:3,vars:6,consts:[["content",""],["cdkScrollable","",1,"mat-mdc-tab-body-content"],["matTabBodyHost",""]],template:function(t,i){t&1&&(zi$1(0,"div",1,0),kh(2,Bs,0,0,"ng-template",2),Ou()),t&2&&rg("mat-tab-body-content-left",i._position==="left")("mat-tab-body-content-right",i._position==="right")("mat-tab-body-content-can-animate",i._position==="center"||i._previousPosition==="center");},dependencies:[Ri,Ke],styles:[`.mat-mdc-tab-body {
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
`],encapsulation:2,changeDetection:1})}return n})(),Ni=(()=>{class n{_elementRef=g(Yn$1);_changeDetectorRef=g(gC);_ngZone=g(K);_tabsSubscription=H.EMPTY;_tabLabelSubscription=H.EMPTY;_tabBodySubscription=H.EMPTY;_diAnimationsDisabled=xe();_bodyAnimationDuration;_headerAnimationDuration;_allTabs;_tabBodies;_tabBodyWrapper;_tabHeader;_tabs=new xi$1;_indexToSelect=0;_lastFocusedTabIndex=null;_tabBodyWrapperHeight=0;color;get fitInkBarToContent(){return this._fitInkBarToContent}set fitInkBarToContent(e){this._fitInkBarToContent=e,this._changeDetectorRef.markForCheck();}_fitInkBarToContent=false;stretchTabs=true;alignTabs=null;dynamicHeight=false;get selectedIndex(){return this._selectedIndex}set selectedIndex(e){this._indexToSelect=isNaN(e)?null:e;}_selectedIndex=null;headerPosition="above";get animationDuration(){return this._animationDuration}set animationDuration(e){this._animationDuration=e,e&&typeof e=="object"?(this._bodyAnimationDuration=Yn(e.body),this._headerAnimationDuration=Yn(e.header)):this._headerAnimationDuration=this._bodyAnimationDuration=Yn(e);}_animationDuration;get contentTabIndex(){return this._contentTabIndex}set contentTabIndex(e){this._contentTabIndex=isNaN(e)?null:e;}_contentTabIndex=null;disablePagination=false;disableRipple=false;preserveContent=false;get backgroundColor(){return this._backgroundColor}set backgroundColor(e){let t=this._elementRef.nativeElement.classList;t.remove("mat-tabs-with-background",`mat-background-${this.backgroundColor}`),e&&t.add("mat-tabs-with-background",`mat-background-${e}`),this._backgroundColor=e;}_backgroundColor;ariaLabel;ariaLabelledby;selectedIndexChange=new We;focusChange=new We;animationDone=new We;selectedTabChange=new We(true);_groupId;_isServer=!g(R).isBrowser;constructor(){let e=g(el,{optional:true});this._groupId=g(Cn$1).getId("mat-tab-group-"),this.animationDuration=e&&e.animationDuration?e.animationDuration:"500ms",this.disablePagination=e&&e.disablePagination!=null?e.disablePagination:false,this.dynamicHeight=e&&e.dynamicHeight!=null?e.dynamicHeight:false,e?.contentTabIndex!=null&&(this.contentTabIndex=e.contentTabIndex),this.preserveContent=!!e?.preserveContent,this.fitInkBarToContent=e&&e.fitInkBarToContent!=null?e.fitInkBarToContent:false,this.stretchTabs=e&&e.stretchTabs!=null?e.stretchTabs:true,this.alignTabs=e&&e.alignTabs!=null?e.alignTabs:null;}ngAfterContentChecked(){let e=this._indexToSelect=this._clampTabIndex(this._indexToSelect);if(this._selectedIndex!=e){let t=this._selectedIndex==null;if(!t){this.selectedTabChange.emit(this._createChangeEvent(e));let i=this._tabBodyWrapper.nativeElement;i.style.minHeight=i.clientHeight+"px";}Promise.resolve().then(()=>{this._tabs.forEach((i,o)=>i.isActive=o===e),t||(this.selectedIndexChange.emit(e),this._tabBodyWrapper.nativeElement.style.minHeight="");});}this._tabs.forEach((t,i)=>{t.position=i-e,this._selectedIndex!=null&&t.position==0&&!t.origin&&(t.origin=e-this._selectedIndex);}),this._selectedIndex!==e&&(this._selectedIndex=e,this._lastFocusedTabIndex=null,this._changeDetectorRef.markForCheck());}ngAfterContentInit(){this._subscribeToAllTabChanges(),this._subscribeToTabLabels(),this._tabsSubscription=this._tabs.changes.subscribe(()=>{let e=this._clampTabIndex(this._indexToSelect);if(e===this._selectedIndex){let t=this._tabs.toArray(),i;for(let o=0;o<t.length;o++)if(t[o].isActive){this._indexToSelect=this._selectedIndex=o,this._lastFocusedTabIndex=null,i=t[o];break}!i&&t[e]&&Promise.resolve().then(()=>{t[e].isActive=true,this.selectedTabChange.emit(this._createChangeEvent(e));});}this._changeDetectorRef.markForCheck();});}ngAfterViewInit(){this._tabBodySubscription=this._tabBodies.changes.subscribe(()=>this._bodyCentered(true));}_subscribeToAllTabChanges(){this._allTabs.changes.pipe(ey(this._allTabs)).subscribe(e=>{this._tabs.reset(e.filter(t=>t._closestTabGroup===this||!t._closestTabGroup)),this._tabs.notifyOnChanges();});}ngOnDestroy(){this._tabs.destroy(),this._tabsSubscription.unsubscribe(),this._tabLabelSubscription.unsubscribe(),this._tabBodySubscription.unsubscribe();}realignInkBar(){this._tabHeader&&this._tabHeader._alignInkBarToSelectedTab();}updatePagination(){this._tabHeader&&this._tabHeader.updatePagination();}focusTab(e){let t=this._tabHeader;t&&(t.focusIndex=e);}_focusChanged(e){this._lastFocusedTabIndex=e,this.focusChange.emit(this._createChangeEvent(e));}_createChangeEvent(e){let t=new ea;return t.index=e,this._tabs&&this._tabs.length&&(t.tab=this._tabs.toArray()[e]),t}_subscribeToTabLabels(){this._tabLabelSubscription&&this._tabLabelSubscription.unsubscribe(),this._tabLabelSubscription=Um(...this._tabs.map(e=>e._stateChanges)).subscribe(()=>this._changeDetectorRef.markForCheck());}_clampTabIndex(e){return Math.min(this._tabs.length-1,Math.max(e||0,0))}_getTabLabelId(e,t){return e.id||`${this._groupId}-label-${t}`}_getTabContentId(e){return `${this._groupId}-content-${e}`}_setTabBodyWrapperHeight(e){if(!this.dynamicHeight||!this._tabBodyWrapperHeight){this._tabBodyWrapperHeight=e;return}let t=this._tabBodyWrapper.nativeElement;t.style.height=this._tabBodyWrapperHeight+"px",this._tabBodyWrapper.nativeElement.offsetHeight&&(t.style.height=e+"px");}_removeTabBodyWrapperHeight(){let e=this._tabBodyWrapper.nativeElement;this._tabBodyWrapperHeight=e.clientHeight,e.style.height="",this._ngZone.run(()=>this.animationDone.emit());}_handleClick(e,t,i){t.focusIndex=i,e.disabled||(this.selectedIndex=i);}_getTabIndex(e){let t=this._lastFocusedTabIndex??this.selectedIndex;return e===t?0:-1}_tabFocusChanged(e,t){e&&e!=="mouse"&&e!=="touch"&&(this._tabHeader.focusIndex=t);}_bodyCentered(e){e&&this._tabBodies?.forEach((t,i)=>t._setActiveClass(i===this._selectedIndex));}_bodyAnimationsDisabled(){return this._diAnimationsDisabled||this._bodyAnimationDuration==="0"||this._bodyAnimationDuration==="0ms"}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["mat-tab-group"]],contentQueries:function(t,i,o){if(t&1&&Qh(o,aa,5),t&2){let r;ew(r=tw())&&(i._allTabs=r);}},viewQuery:function(t,i){if(t&1&&Kh(Ns,5)(js,5)(Xn,5),t&2){let o;ew(o=tw())&&(i._tabBodyWrapper=o.first),ew(o=tw())&&(i._tabHeader=o.first),ew(o=tw())&&(i._tabBodies=o);}},hostAttrs:[1,"mat-mdc-tab-group"],hostVars:13,hostBindings:function(t,i){t&2&&(Bh("mat-align-tabs",i.alignTabs),hw("mat-"+(i.color||"primary")),ng("--mat-tab-body-animation-duration",i._bodyAnimationDuration)("--mat-tab-header-animation-duration",i._headerAnimationDuration),rg("mat-mdc-tab-group-dynamic-height",i.dynamicHeight)("mat-mdc-tab-group-inverted-header",i.headerPosition==="below")("mat-mdc-tab-group-stretch-tabs",i.stretchTabs));},inputs:{color:"color",fitInkBarToContent:[2,"fitInkBarToContent","fitInkBarToContent",x1],stretchTabs:[2,"mat-stretch-tabs","stretchTabs",x1],alignTabs:[0,"mat-align-tabs","alignTabs"],dynamicHeight:[2,"dynamicHeight","dynamicHeight",x1],selectedIndex:[2,"selectedIndex","selectedIndex",R1],headerPosition:"headerPosition",animationDuration:"animationDuration",contentTabIndex:[2,"contentTabIndex","contentTabIndex",R1],disablePagination:[2,"disablePagination","disablePagination",x1],disableRipple:[2,"disableRipple","disableRipple",x1],preserveContent:[2,"preserveContent","preserveContent",x1],backgroundColor:"backgroundColor",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"]},outputs:{selectedIndexChange:"selectedIndexChange",focusChange:"focusChange",animationDone:"animationDone",selectedTabChange:"selectedTabChange"},exportAs:["matTabGroup"],features:[Ow([{provide:Fi,useExisting:n}])],ngContentSelectors:ta,decls:9,vars:8,consts:[["tabHeader",""],["tabBodyWrapper",""],["tabNode",""],[3,"indexFocused","selectFocusedIndex","selectedIndex","disableRipple","disablePagination","aria-label","aria-labelledby"],["role","tab","matTabLabelWrapper","","cdkMonitorElementFocus","",1,"mdc-tab","mat-mdc-tab","mat-focus-indicator",3,"id","mdc-tab--active","class","disabled","fitInkBarToContent"],[1,"mat-mdc-tab-body-wrapper"],["role","tabpanel",3,"id","class","content","position","animationDuration","preserveContent"],["role","tab","matTabLabelWrapper","","cdkMonitorElementFocus","",1,"mdc-tab","mat-mdc-tab","mat-focus-indicator",3,"click","cdkFocusChange","id","disabled","fitInkBarToContent"],[1,"mdc-tab__ripple"],["mat-ripple","",1,"mat-mdc-tab-ripple",3,"matRippleTrigger","matRippleDisabled"],[1,"mdc-tab__content"],[1,"mdc-tab__text-label"],[3,"cdkPortalOutlet"],["role","tabpanel",3,"_onCentered","_onCentering","_beforeCentering","id","content","position","animationDuration","preserveContent"]],template:function(t,i){t&1&&(KI(),zi$1(0,"mat-tab-header",3,0),qh("indexFocused",function(r){return i._focusChanged(r)})("selectFocusedIndex",function(r){return i.selectedIndex=r}),VI(2,Ws,8,17,"div",4,BI),Ou(),FI(4,$s,1,0),zi$1(5,"div",5,1),VI(7,Gs,1,10,"mat-tab-body",6,BI),Ou()),t&2&&(Vh("selectedIndex",i.selectedIndex||0)("disableRipple",i.disableRipple)("disablePagination",i.disablePagination),jh("aria-label",i.ariaLabel)("aria-labelledby",i.ariaLabelledby),VD(2),HI(i._tabs),VD(2),LI(i._isServer?4:-1),VD(),rg("_mat-animation-noopable",i._bodyAnimationsDisabled()),VD(2),HI(i._tabs));},dependencies:[Xs,Bi,ao$1,Gc,Ye$1,Xn],styles:[`.mdc-tab {
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
`],encapsulation:2,changeDetection:1})}return n})(),ea=class{index;tab};function Yn(n){let a=n+"";return /^\d+$/.test(a)?n+"ms":a}var ji=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os$1({type:n});static \u0275inj=Dr$1({imports:[Se]})}return n})();var nl=new T("MAT_BADGE_CONFIG"),zi="mat-badge-content",al=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=hI({type:n,selectors:[["ng-component"]],decls:0,vars:0,template:function(t,i){},styles:[`.mat-badge {
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
`],encapsulation:2})}return n})(),Hi=(()=>{class n{_ngZone=g(K);_elementRef=g(Yn$1);_ariaDescriber=g(ac);_renderer=g(ah);_animationsDisabled=xe();_idGenerator=g(Cn$1);get color(){return this._color}set color(e){this._setColor(e),this._color=e;}_color;overlap;disabled=false;position;get content(){return this._content}set content(e){this._updateRenderedContent(e);}_content;get description(){return this._description}set description(e){this._updateDescription(e);}_description;size;hidden=false;_badgeElement;_inlineBadgeDescription;_isInitialized=false;_interactivityChecker=g(zr$1);_document=g(W);constructor(){let e=g(nl,{optional:true}),t=g(q);t.load(al),t.load(St),this._color=e?.color||"primary",this.overlap=e?.overlap??true,this.position=e?.position||"above after",this.size=e?.size||"medium";}isAbove(){return this.position.indexOf("below")===-1}isAfter(){return this.position.indexOf("before")===-1}getBadgeElement(){return this._badgeElement}ngOnInit(){this._clearExistingBadges(),this.content&&!this._badgeElement&&(this._badgeElement=this._createBadgeElement(),this._updateRenderedContent(this.content)),this._isInitialized=true;}ngAfterViewInit(){}ngOnDestroy(){this._renderer.destroyNode&&(this._renderer.destroyNode(this._badgeElement),this._inlineBadgeDescription?.remove()),this._ariaDescriber.removeDescription(this._elementRef.nativeElement,this.description);}_isHostInteractive(){return this._interactivityChecker.isFocusable(this._elementRef.nativeElement,{ignoreVisibility:true})}_createBadgeElement(){let e=this._renderer.createElement("span"),t="mat-badge-active";return e.setAttribute("id",this._idGenerator.getId("mat-badge-content-")),e.setAttribute("aria-hidden","true"),e.classList.add(zi),this._animationsDisabled&&e.classList.add("_mat-animation-noopable"),this._elementRef.nativeElement.appendChild(e),typeof requestAnimationFrame=="function"&&!this._animationsDisabled?this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>{e.classList.add(t);});}):e.classList.add(t),e}_updateRenderedContent(e){let t=`${e??""}`.trim();this._isInitialized&&t&&!this._badgeElement&&(this._badgeElement=this._createBadgeElement()),this._badgeElement&&(this._badgeElement.textContent=t),this._content=t;}_updateDescription(e){this._ariaDescriber.removeDescription(this._elementRef.nativeElement,this.description),(!e||this._isHostInteractive())&&this._removeInlineDescription(),this._description=e,this._isHostInteractive()?this._ariaDescriber.describe(this._elementRef.nativeElement,e):this._updateInlineDescription();}_updateInlineDescription(){this._inlineBadgeDescription||(this._inlineBadgeDescription=this._document.createElement("span"),this._inlineBadgeDescription.classList.add("cdk-visually-hidden")),this._inlineBadgeDescription.textContent=this.description,this._badgeElement?.appendChild(this._inlineBadgeDescription);}_removeInlineDescription(){this._inlineBadgeDescription?.remove(),this._inlineBadgeDescription=void 0;}_setColor(e){let t=this._elementRef.nativeElement.classList;t.remove(`mat-badge-${this._color}`),e&&t.add(`mat-badge-${e}`);}_clearExistingBadges(){let e=this._elementRef.nativeElement.querySelectorAll(`:scope > .${zi}`);for(let t of Array.from(e))t!==this._badgeElement&&t.remove();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=_u({type:n,selectors:[["","matBadge",""]],hostAttrs:[1,"mat-badge"],hostVars:20,hostBindings:function(t,i){t&2&&rg("mat-badge-overlap",i.overlap)("mat-badge-above",i.isAbove())("mat-badge-below",!i.isAbove())("mat-badge-before",!i.isAfter())("mat-badge-after",i.isAfter())("mat-badge-small",i.size==="small")("mat-badge-medium",i.size==="medium")("mat-badge-large",i.size==="large")("mat-badge-hidden",i.hidden||!i.content)("mat-badge-disabled",i.disabled);},inputs:{color:[0,"matBadgeColor","color"],overlap:[2,"matBadgeOverlap","overlap",x1],disabled:[2,"matBadgeDisabled","disabled",x1],position:[0,"matBadgePosition","position"],content:[0,"matBadge","content"],description:[0,"matBadgeDescription","description"],size:[0,"matBadgeSize","size"],hidden:[2,"matBadgeHidden","hidden",x1]}})}return n})(),Vi=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=os$1({type:n});static \u0275inj=Dr$1({imports:[Ao$1,Se]})}return n})();function ol(n,a){if(n&1&&(zi$1(0,"span",18),Tw(1,"Events"),Ou()),n&2){let e=YI();Vh("matBadge",e.unreadEventsCount())("matBadgeHidden",e.unreadEventsCount()===0);}}function rl(n,a){if(n&1&&(zi$1(0,"span",19),Tw(1,"Errors"),Ou()),n&2){let e=YI();Vh("matBadge",e.unreadErrorsCount())("matBadgeHidden",e.unreadErrorsCount()===0);}}function sl(n,a){n&1&&(zi$1(0,"mat-tab",17)(1,"div",14),Hh(2,"a2ui-composer-mock-rules"),Ou()());}var Wi=1,ia=2,$i=class n{startupResolution=g(Qg);hostComm=g(Xt);isExtension=tn(false);isDebugCollapsed=tn(false);showMockRules=tn(false);selectedTabIndex=tn(0);unreadEventsCount=tn(0);unreadErrorsCount=tn(0);rawMessages=M1(et);events=M1(Ze);errors=M1(Xe);constructor(){this.hostComm.messageStream$.pipe($i$1()).subscribe(a=>{if(!a)return;let e=a.payload,t=this.selectedTabIndex();if(a.type===E.SEND_TO_SERVER&&e?.action)t!==Wi&&this.unreadEventsCount.update(i=>i+1);else if(a.type===E.CONSOLE_LOG)t!==ia&&this.unreadErrorsCount.update(i=>i+1);else if(a.type===E.DATA_MODEL_CHANGE&&e?.validationErrors){let i=e.validationErrors;(Array.isArray(i)?i.length>0:typeof i=="object"&&i!==null?Object.keys(i).length>0:i)&&t!==ia&&this.unreadErrorsCount.update(r=>r+1);}}),Jd(()=>{let a=this.selectedTabIndex();a===Wi?mg(()=>{this.unreadEventsCount.set(0);}):a===ia&&mg(()=>{this.unreadErrorsCount.set(0);});});}ngOnInit(){let a=this.startupResolution.isExtensionMode();this.isExtension.set(a),a&&this.isDebugCollapsed.set(true);}toggleDebugCollapse(){this.isDebugCollapsed.update(a=>!a);}clearAllLogs(){this.rawMessages()?.clearLogs(),this.events()?.clearLogs(),this.errors()?.clearLogs();}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=hI({type:n,selectors:[["a2ui-composer-workspace"]],viewQuery:function(e,t){e&1&&Jh(t.rawMessages,et,5)(t.events,Ze,5)(t.errors,Xe,5),e&2&&nw(3);},decls:41,vars:8,consts:[[1,"workspace-container"],[1,"left-panel"],[1,"right-panel"],[1,"preview-section"],[1,"preview-frame-container"],[1,"frame-header"],[1,"frame-body"],[1,"debug-section"],[1,"debug-header-controls"],["mat-icon-button","","aria-label","Clear Logs","matTooltip","Clear all log tabs","matTooltipPosition","left",3,"click"],["aria-hidden","true"],["mat-icon-button","","aria-label","Toggle Debug Panel","matTooltipPosition","left",3,"click","matTooltip"],["fitInkBarToContent","",3,"selectedIndexChange","selectedIndex"],["label","Data Model"],[1,"tab-content-container"],["mat-tab-label",""],["label","Raw Messages"],["label","Mock Rules"],["matBadgeOverlap","false","matBadgeColor","accent",1,"events-badge-host",3,"matBadge","matBadgeHidden"],["matBadgeOverlap","false","matBadgeColor","warn",1,"errors-badge-host",3,"matBadge","matBadgeHidden"]],template:function(e,t){e&1&&(zi$1(0,"div",0)(1,"div",1),Hh(2,"a2ui-composer-chat-panel"),Ou(),zi$1(3,"div",2)(4,"div",3)(5,"div",4)(6,"div",5)(7,"span"),Tw(8,"Rendered A2UI Preview"),Ou()(),zi$1(9,"div",6),Hh(10,"a2ui-composer-rendered-frame"),Ou()(),zi$1(11,"div",4)(12,"div",5)(13,"span"),Tw(14,"A2UI JSON Editor"),Ou()(),zi$1(15,"div",6),Hh(16,"a2ui-composer-raw-frame"),Ou()()(),zi$1(17,"div",7)(18,"div",8)(19,"button",9),qh("click",function(){return t.clearAllLogs()}),zi$1(20,"mat-icon",10),Tw(21,"delete"),Ou()(),zi$1(22,"button",11),qh("click",function(){return t.toggleDebugCollapse()}),zi$1(23,"mat-icon",10),Tw(24),Ou()()(),zi$1(25,"mat-tab-group",12),dg("selectedIndexChange",function(o){return Nw(t.selectedTabIndex,o)||(t.selectedTabIndex=o),o}),zi$1(26,"mat-tab",13)(27,"div",14),Hh(28,"a2ui-composer-data-model"),Ou()(),zi$1(29,"mat-tab"),kh(30,ol,2,2,"ng-template",15),zi$1(31,"div",14),Hh(32,"a2ui-composer-events"),Ou()(),zi$1(33,"mat-tab"),kh(34,rl,2,2,"ng-template",15),zi$1(35,"div",14),Hh(36,"a2ui-composer-errors"),Ou()(),zi$1(37,"mat-tab",16)(38,"div",14),Hh(39,"a2ui-composer-raw-messages"),Ou()(),FI(40,sl,3,0,"mat-tab",17),Ou()()()()),e&2&&(rg("extension-mode",t.isExtension()),VD(17),rg("collapsed",t.isDebugCollapsed()),VD(5),Vh("matTooltip",t.isDebugCollapsed()?"Expand Debug Panel":"Collapse Debug Panel"),VD(2),ug(t.isDebugCollapsed()?"keyboard_arrow_up":"keyboard_arrow_down"),VD(),lg("selectedIndex",t.selectedTabIndex),VD(15),LI(t.showMockRules()?40:-1));},dependencies:[yn,kn,_t,Pn,Ze,Xe,et,Dn,ji,na,aa,Ni,Gd,Hd,wd,Uo$1,no$1,Ae$1,Vi,Hi],styles:["[_nghost-%COMP%]{display:block;height:100%}.workspace-container[_ngcontent-%COMP%]{display:flex;gap:16px;height:100%;box-sizing:border-box;padding:16px}.workspace-container.extension-mode[_ngcontent-%COMP%]{flex-direction:column}.workspace-container.extension-mode[_ngcontent-%COMP%]   .left-panel[_ngcontent-%COMP%]{flex:0 0 auto}.workspace-container.extension-mode[_ngcontent-%COMP%]   .right-panel[_ngcontent-%COMP%]{flex:1}.workspace-container.extension-mode[_ngcontent-%COMP%]   .preview-section[_ngcontent-%COMP%]{flex-direction:column}.left-panel[_ngcontent-%COMP%]{flex:0 0 300px;width:300px;max-width:300px;min-width:300px;display:flex;flex-direction:column;overflow:hidden}.right-panel[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;gap:16px;min-width:0;height:100%}.preview-section[_ngcontent-%COMP%]{display:flex;flex-direction:row;gap:16px;flex:1;min-height:0}.preview-frame-container[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;border:1px solid var(--mat-sys-outline-variant);border-radius:8px;background-color:var(--mat-sys-surface);box-shadow:0 2px 4px #0000000d;overflow:hidden;min-width:0}.frame-header[_ngcontent-%COMP%]{padding:12px 16px;background-color:var(--mat-sys-surface-container);border-bottom:1px solid var(--mat-sys-outline-variant);font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);display:flex;align-items:center;flex-shrink:0}.frame-body[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;overflow:auto;box-sizing:border-box;min-height:0}.debug-section[_ngcontent-%COMP%]{position:relative;transition:all .2s ease-in-out;height:320px;display:flex;flex-direction:column;background-color:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:8px;padding:8px;box-shadow:0 2px 4px #0000000d}.debug-section.collapsed[_ngcontent-%COMP%]{height:48px!important;flex:0 0 auto;overflow:hidden}.debug-header-controls[_ngcontent-%COMP%]{position:absolute;right:8px;top:8px;z-index:10;display:flex;gap:4px}.tab-content-container[_ngcontent-%COMP%]{padding:12px 8px;flex:1;display:flex;flex-direction:column;min-height:0;box-sizing:border-box}  .mat-mdc-tab-group{height:100%;display:flex;flex-direction:column;min-height:0}  .mat-mdc-tab-group .mat-mdc-tab-header{width:fit-content!important;max-width:calc(100% - 88px)!important;box-sizing:border-box;flex-shrink:0}  .mat-mdc-tab-group .mat-mdc-tab-header .mat-badge:not(.mat-badge-hidden) .mat-badge-content{width:16px!important;height:16px!important;min-width:16px!important;border-radius:50%!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;line-height:1!important;font-size:10px!important;top:-4px!important;right:-18px!important}  .mat-mdc-tab-group .mat-mdc-tab-header .events-badge-host .mat-badge-content{background-color:#3f51b5!important;color:#fff!important}  .mat-mdc-tab-group .mat-mdc-tab-header .errors-badge-host .mat-badge-content{background-color:#ba1a1a!important;color:#fff!important}  .mat-mdc-tab-group .mat-mdc-tab-body-wrapper{flex:1;display:flex;flex-direction:column;min-height:0}  .mat-mdc-tab-group .mat-mdc-tab-body{flex:1;display:flex;flex-direction:column;min-height:0}  .mat-mdc-tab-group .mat-mdc-tab-body-content{height:100%!important;display:flex;flex-direction:column;flex:1}  .mat-mdc-tab-group .mdc-tab{flex:0 0 auto!important;min-width:auto!important;padding:0 16px!important}"]})};export{$i as ComposerWorkspace};