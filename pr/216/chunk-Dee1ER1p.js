import{Mr as gq,Nr as gt,Vi as sq,Xn as b$1,Yi as tn,Yn as ay,fr as ee,ht as Le,ii as m$,jt as Pt,oa as vC,pi as nn,t as $He,x as Cs,xr as fe,y as Ca,zn as _n}from"./chunk-DIuqi4eh.js";function O(o,e){let t=o.message,a=t.match(/line (\d+) column (\d+)/i);if(a)return{line:parseInt(a[1],10),column:parseInt(a[2],10)};let n=t.match(/at position (\d+)/i);if(n){let r=parseInt(n[1],10),s=e??``,i=Math.max(0,Math.min(r,s.length)),p=s.slice(0,i).split(`
`);return{line:p.length,column:p[p.length-1].length+1}}return{}}function m(o){if(o==null)return{success:!1,data:null,error:{message:`Content is null or undefined`}};let e=o.trim();if(e.length===0)return{success:!1,data:null,error:{message:`Content is empty`}};let t=null;if(e.startsWith(`[`)&&e.endsWith(`]`))try{let r=JSON.parse(e);if(Array.isArray(r))return{success:!0,data:r}}catch(r){t=r}else if(e.startsWith(`{`)&&e.endsWith(`}`))try{let r=JSON.parse(e);if(r!==null&&typeof r==`object`&&!Array.isArray(r))return{success:!0,data:[r]}}catch(r){t=r}else if(e.startsWith(`{`)||e.startsWith(`[`))try{JSON.parse(e)}catch(r){t=r}let a=e.split(`
`),n=[];for(let r=0;r<a.length;r++){let s=a[r].trim();s.length>0&&n.push({text:s,originalIndex:r})}if(n.length>0){let r=[],s=!0;for(let i of n){if(!i.text.startsWith(`{`)||!i.text.endsWith(`}`)){s=!1;break}try{let c=JSON.parse(i.text);if(c!==null&&typeof c==`object`&&!Array.isArray(c))r.push(c);else{s=!1;break}}catch(c){if(t=c,t instanceof Error){let p=O(t,i.text);return{success:!1,data:null,error:{message:t.message,line:i.originalIndex+1,column:p.column,snippet:a[i.originalIndex]}}}s=!1;break}}if(s)return{success:!0,data:r}}if(t instanceof Error){let r=O(t,o);return{success:!1,data:null,error:{message:t.message,line:r.line,column:r.column,snippet:r.line!==void 0&&r.line>0&&r.line<=a.length?a[r.line-1]:void 0}}}return{success:!1,data:null,error:{message:`Invalid JSON format`}}}function P(o){return o===void 0?``:JSON.stringify(o,null,2)}function q(o){return typeof o!=`object`||o===null||Array.isArray(o)?null:o}var y=class o{_chatHistory=Le([]);_pipelineStatus=Le(`idle`);_isProgrammaticStreamActive=Le(!1);_latestLlmLog=Le(null);_llmHistory=Le([]);chatHistory=this._chatHistory.asReadonly();pipelineStatus=this._pipelineStatus.asReadonly();isProgrammaticStreamActive=this._isProgrammaticStreamActive.asReadonly();latestLlmLog=this._latestLlmLog.asReadonly();llmHistory=this._llmHistory.asReadonly();setChatHistory(e){this._chatHistory.set(e)}updateChatHistory(e){this._chatHistory.update(e)}setPipelineStatus(e){this._pipelineStatus.set(e)}setProgrammaticStreamActive(e){this._isProgrammaticStreamActive.set(e)}addRawLlmLog(e,t){let a={type:e,timestamp:Date.now(),payload:t};this._latestLlmLog.set(a),this._llmHistory.update(n=>[...n,a].slice(-50))}clearRawLlmHistory(){this._latestLlmLog.set(null),this._llmHistory.set([])}static ɵfac=function(t){return new(t||o)};static ɵprov=ee({token:o,factory:o.ɵfac,providedIn:`root`})};var st=`CancelError`;var ot=`*You stopped this response.*`;var w=class{async chat(e){return{content:await(await this.chatStream(e)).complete,isComplete:!0}}extractXmlThoughts(e){let t=``;return{cleanText:e.replace(/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,(n,r,s)=>(t+=s,``)),totalExtractedThinking:t}}createContentStream(e,t,a){return{[Symbol.asyncIterator](){let n=0;return{async next(){for(;n>=e.length&&!t.isDone&&!t.streamError;)await new Promise((r,s)=>{a.push(()=>{t.streamError?s(t.streamError):r()})});if(n>=e.length&&t.streamError)throw t.streamError;if(n<e.length){let r=e[n];return n++,{value:r,done:!1}}return{value:void 0,done:!0}}}}}}};var j=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi;var H=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi;var J=/\s*●●●\s*$/g;function U(o){return o.length>0&&o.some(e=>{if(e&&typeof e==`object`&&!Array.isArray(e)){let t=Object.keys(e);return t.includes(`version`)||t.includes(`createSurface`)||t.includes(`updateComponents`)||t.includes(`updateDataModel`)||t.includes(`deleteSurface`)}return!1})}var g=class o{PULSE_INDICATOR=`●●●`;appendPulse(e){return`${e??``} ${this.PULSE_INDICATOR}`}stripPulse(e){return e?(J.lastIndex=0,e.replace(J,``).trim()):``}stripThinkingTags(e){return e?(H.lastIndex=0,e.replace(H,``).trim()):``}extractCodeFences(e){if(!e)return{extracted:``,hasFences:!1};j.lastIndex=0;let t=Array.from(e.matchAll(j));return t.length>0?{extracted:t.map(a=>a[1].trim()).join(`
`),hasFences:!0}:{extracted:e.trim(),hasFences:!1}}cleanPayload(e){if(!e)return``;let t=this.stripPulse(e);if(t=this.stripThinkingTags(t),t=this.extractCodeFences(t).extracted,!t.startsWith(`{`)&&!t.startsWith(`[`)){let n=Array.from(t.matchAll(/[\{\[]/g));for(let r of n)if(r.index!==void 0&&r.index>=0){let s=t.substring(r.index).trim();if(s.startsWith(`{`)&&s.includes(`"version"`)||s.startsWith(`[`)&&/^\[\s*[\{\"]/.test(s)&&(s.includes(`"version"`)||s.includes(`"createSurface"`)||s.includes(`"updateComponents"`))){t=s;break}let i=m(s);if(i.success&&U(i.data)){t=s;break}}}return t.trim()}isLayoutSnapshot(e){if(!e)return!1;let t=this.cleanPayload(e);if(t.startsWith(`{"version"`)||t.startsWith(`{`)&&t.includes(`"version"`)||t.startsWith(`[`)&&(t.includes(`"version"`)||t.includes(`"createSurface"`)||t.includes(`"updateComponents"`)))return!0;let a=m(t);return a.success&&U(a.data)}isUserLayoutSnapshot(e){if(!e||e.role!==`user`||e.promptId||e.attachments?.length)return!1;if(e.isSnapshot!==void 0)return e.isSnapshot;let t=typeof e.content==`string`?e.content.trim():``;return(t.startsWith(`[`)||t.startsWith(`{`))&&this.isLayoutSnapshot(t)}static ɵfac=function(t){return new(t||o)};static ɵprov=ee({token:o,factory:o.ɵfac,providedIn:`root`})};var z=`[
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
`;var L=`https://a2ui.org/specification/v0_9/basic_catalog.json`;var v=`updateComponents`;var b=`components`;var G=`registerMockRules`;var B=`mockRulesConfig`;var K=`rules`;var X=`id`;var V=`children`;var W=`mock_rules_container`;var $=class o{destroyRef=b$1(Pt);chatState=b$1(y);chatCleaner=b$1(g);catalogManagement=b$1(gq);startupConfigState=b$1(ay);logger=b$1(_n).withTag(`[StateSync]`);previousCatalogId=null;isDraftEdited=!1;lastSynchronizedLayout=null;_activeDraft=Le(``);activeDraft=this._activeDraft.asReadonly();sessionResetNonce=Le(0);userDraftInput$=new fe;cancelPendingDraftSync$=new fe;constructor(){$He(this.catalogManagement.activeCatalog).pipe(tn(t=>!!t),m$(this.destroyRef)).subscribe(t=>{let a=sq(t)||``,n=this.previousCatalogId===null,r=this.previousCatalogId!==null&&this.previousCatalogId!==a;if((n||r)&&!this.isDraftEdited){let s=this.getInitialDraft(a);this._activeDraft.set(s),this.userDraftInput$.next(s)}this.previousCatalogId=a}),(this.startupConfigState.sharedA2uiPayload?$He(this.startupConfigState.sharedA2uiPayload):nn(null)).pipe(tn(t=>!!t),m$(this.destroyRef)).subscribe(t=>{this.injectExternalDraft(t)}),this.userDraftInput$.pipe(vC(t=>Ca(300).pipe(gt(()=>t),Cs(this.cancelPendingDraftSync$))),m$(this.destroyRef)).subscribe(t=>{this.syncLayoutToHistory(t)})}updateDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}injectExternalDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}syncActiveDraftToHistory(){this.syncLayoutToHistory(this._activeDraft())}hasEditedDraft(){return this.isDraftEdited}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(e){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!0,this.lastSynchronizedLayout=this.sanitizeLayout(e)||null,this._activeDraft.set(e)}flushDraft(){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.previousCatalogId=null;let e=this.catalogManagement.activeCatalog(),t=e&&sq(e)||``;!this.startupConfigState.activeRenderer()?.samplePayload&&!t&&(t=L);let n=this.getInitialDraft(t);this._activeDraft.set(n),n&&this.userDraftInput$.next(n)}resetToBlankDraft(){this.cancelPendingDraftSync$.next();let e=this.catalogManagement.activeCatalog(),t=e&&sq(e)||L;this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.previousCatalogId=t;let a=this.buildBlankSurfaceDraft(t);this._activeDraft.set(a),this.sessionResetNonce.update(n=>n+1),this.syncLayoutToHistory(a)}getInitialDraft(e){let t=this.startupConfigState.activeRenderer();return t?.samplePayload?t.samplePayload:e===L?z:e?this.buildBlankSurfaceDraft(e):``}buildBlankSurfaceDraft(e){return P([{version:`v0.9`,createSurface:{surfaceId:`sample-surface`,catalogId:e,sendDataModel:!0}}])}syncLayoutToHistory(e){if(e!==this._activeDraft())return;let t=this.sanitizeLayout(e);if(!t)return;let a=this.chatState.chatHistory();if(a.length>0&&t===this.lastSynchronizedLayout)return;if(this.lastSynchronizedLayout=t,a.length===0){this.chatState.setChatHistory([{role:`user`,content:t,isSnapshot:!0}]);return}let n=a[a.length-1];if(this.chatCleaner.isUserLayoutSnapshot(n)){let s=[...a];s[s.length-1]={role:`user`,content:t,isSnapshot:!0},this.chatState.setChatHistory(s)}else this.chatState.updateChatHistory(s=>[...s,{role:`user`,content:t,isSnapshot:!0}])}sanitizeLayout(e){let t=e.trim();if(!t)return``;let a=m(t);if(a.success){let n=a.data.map(r=>r&&typeof r==`object`&&!Array.isArray(r)?this.sanitizeBlock(r):r).filter(r=>r!==null);return n.length>0?JSON.stringify(n):``}return this.logger.warn(`Discarding malformed layout JSON during sanitization: not a valid JSON array`),``}sanitizeBlock(e){if(e[G]||e[B])return null;if(e[v]&&typeof e[v]==`object`&&e[v]!==null){let t=e[v];if(Array.isArray(t[b]))t[b]=t[b].filter(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?n[X]!==W:!0).map(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?this.sanitizeComponentObject(n):n)}return e}sanitizeComponentObject(e){let t={};for(let[a,n]of Object.entries(e))a===K||/^mock/i.test(a)||(a===V&&Array.isArray(n)?t[a]=n.filter(r=>r!==W):n!==null&&typeof n==`object`&&!Array.isArray(n)?t[a]=this.sanitizeComponentObject(n):Array.isArray(n)?t[a]=n.map(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?this.sanitizeComponentObject(r):r):t[a]=n);return t}static ɵfac=function(t){return new(t||o)};static ɵprov=ee({token:o,factory:o.ɵfac,providedIn:`root`})};var Y=(t=>(t.ORIGIN=`origin`,t.THEME=`theme`,t))(Y||{});export{g as a,q as c,y as d,Y as i,st as l,O as n,m as o,P as r,ot as s,$ as t,w as u};