import{Dt as Pt,En as _C,Er as gt,Gn as bs,Ln as b,Qi as tn,V as Fe,ci as nn,da as v$,fr as ee,ka as ya,kn as _n,rn as WUe,ua as uy,v as C$,vr as fe,y as C3}from"./chunk-Cc-9bSF2.js";function S(n,e){let t=Math.max(0,Math.min(e,n.length)),a=n.slice(0,t).split(`
`);return{line:a.length,column:a[a.length-1].length+1}}function V(n,e){let t=0,a=n.length,s=[],r=`value`;function i(){for(;t<a&&(n[t]===` `||n[t]===`	`||n[t]===`
`||n[t]===`\r`);)t++}function u(){if(n[t]!==`"`)return!1;for(t++;t<a;)if(n[t]===`\\`)t+=2;else{if(n[t]===`"`)return t++,!0;t++}return!0}function l(){let o=t;if(n[t]===`-`&&t++,t<a&&n[t]>=`0`&&n[t]<=`9`){for(;t<a&&n[t]>=`0`&&n[t]<=`9`;)t++;if(t<a&&n[t]===`.`)for(t++;t<a&&n[t]>=`0`&&n[t]<=`9`;)t++;if(t<a&&(n[t]===`e`||n[t]===`E`))for(t++,t<a&&(n[t]===`+`||n[t]===`-`)&&t++;t<a&&n[t]>=`0`&&n[t]<=`9`;)t++;return!0}return t=o,!1}for(;t<a&&(i(),!(t>=a));){let o=t,c=n[t];if(r===`value`)if(c===`{`)t++,s.push(`{`),r=`prop_or_end`;else if(c===`[`)t++,s.push(`[`),r=`value`;else if(c===`]`&&s[s.length-1]===`[`)t++,s.pop(),r=`after_value`;else if(u()||l()||n.startsWith(`true`,t)||n.startsWith(`false`,t)||n.startsWith(`null`,t))n.startsWith(`true`,o)?t+=4:n.startsWith(`false`,o)?t+=5:n.startsWith(`null`,o)&&(t+=4),r=`after_value`;else return n.startsWith(e,o)?o:-1;else if(r===`prop_or_end`)if(c===`}`)t++,s.pop(),r=`after_value`;else if(u())r=`colon`;else return n.startsWith(e,o)?o:-1;else if(r===`colon`)if(c===`:`)t++,r=`value`;else return n.startsWith(e,o)?o:-1;else if(r===`prop`)if(u())r=`colon`;else return n.startsWith(e,o)?o:-1;else if(r===`after_value`){let d=s[s.length-1];if(d===`{`)if(c===`,`)t++,r=`prop`;else if(c===`}`)t++,s.pop(),r=`after_value`;else return n.startsWith(e,o)?o:-1;else if(d===`[`)if(c===`,`)t++,r=`value`;else if(c===`]`)t++,s.pop(),r=`after_value`;else return n.startsWith(e,o)?o:-1;else return n.startsWith(e,o)?o:-1}}return-1}function T(n,e){let t=n.message,a=t.match(/line (\d+) column (\d+)/i);if(a)return{line:parseInt(a[1],10),column:parseInt(a[2],10)};let s=t.match(/at position (\d+)/i);if(s)return S(e,parseInt(s[1],10));let r=t.match(/^Unexpected token (.+?), (\.\.\.)?"([\s\S]+)"(\.\.\.)? is not valid JSON$/);if(r){let i=r[1].replace(/^'|'$/g,``),u=!!r[2],l=r[3],o=!!r[4],c=e;if(u){if(l.startsWith(i,10)){let d=o?c.indexOf(l):c.lastIndexOf(l);if(d!==-1)return S(c,d+10)}return{}}else if(o&&l.length>=10&&l.startsWith(i,l.length-10)){let d=c.indexOf(l);if(d!==-1)return S(c,d+l.length-10)}else{let d=V(c,i);if(d!==-1)return S(c,d)}}return{}}function h(n){if(n==null)return{success:!1,data:null,error:{message:`Content is null or undefined`}};let e=n.trim();if(e.length===0)return{success:!1,data:null,error:{message:`Content is empty`}};let t=null;if(e.startsWith(`[`)&&e.endsWith(`]`))try{let r=JSON.parse(e);if(Array.isArray(r))return{success:!0,data:r}}catch(r){t=r}else if(e.startsWith(`{`)&&e.endsWith(`}`))try{let r=JSON.parse(e);if(r!==null&&typeof r==`object`&&!Array.isArray(r))return{success:!0,data:[r]}}catch(r){t=r}else if(e.startsWith(`{`)||e.startsWith(`[`))try{JSON.parse(e)}catch(r){t=r}let a=e.split(`
`),s=[];for(let r=0;r<a.length;r++){let i=a[r].trim();i.length>0&&s.push({text:i,originalIndex:r})}if(s.length>0){let r=[],i=!0;for(let u of s){if(!u.text.startsWith(`{`)||!u.text.endsWith(`}`)){i=!1;break}try{let l=JSON.parse(u.text);if(l!==null&&typeof l==`object`&&!Array.isArray(l))r.push(l);else{i=!1;break}}catch(l){if(t=l,t instanceof Error){let o=T(t,u.text);return{success:!1,data:null,error:{message:t.message,line:u.originalIndex+1,column:o.column,snippet:a[u.originalIndex]}}}i=!1;break}}if(i)return{success:!0,data:r}}if(t instanceof Error){let r=T(t,n);return{success:!1,data:null,error:{message:t.message,line:r.line,column:r.column,snippet:r.line!==void 0&&r.line>0&&r.line<=a.length?a[r.line-1]:void 0}}}return{success:!1,data:null,error:{message:`Invalid JSON format`}}}function W(n){return n===void 0?``:JSON.stringify(n,null,2)}function et(n){return typeof n!=`object`||n===null||Array.isArray(n)?null:n}var v=class n{_chatHistory=Fe([]);_pipelineStatus=Fe(`idle`);_isProgrammaticStreamActive=Fe(!1);_latestLlmLog=Fe(null);_llmHistory=Fe([]);chatHistory=this._chatHistory.asReadonly();pipelineStatus=this._pipelineStatus.asReadonly();isProgrammaticStreamActive=this._isProgrammaticStreamActive.asReadonly();latestLlmLog=this._latestLlmLog.asReadonly();llmHistory=this._llmHistory.asReadonly();setChatHistory(e){this._chatHistory.set(e)}updateChatHistory(e){this._chatHistory.update(e)}setPipelineStatus(e){this._pipelineStatus.set(e)}setProgrammaticStreamActive(e){this._isProgrammaticStreamActive.set(e)}addRawLlmLog(e,t){let a={type:e,timestamp:Date.now(),payload:t};this._latestLlmLog.set(a),this._llmHistory.update(s=>[...s,a].slice(-50))}clearRawLlmHistory(){this._latestLlmLog.set(null),this._llmHistory.set([])}static ɵfac=function(t){return new(t||n)};static ɵprov=ee({token:n,factory:n.ɵfac,providedIn:`root`})};var ct=`CancelError`;var ut=`*You stopped this response.*`;var U=class{async chat(e){return{content:await(await this.chatStream(e)).complete,isComplete:!0}}extractXmlThoughts(e){let t=``;return{cleanText:e.replace(/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,(s,r,i)=>(t+=i,``)),totalExtractedThinking:t}}createContentStream(e,t,a){return{[Symbol.asyncIterator](){let s=0;return{async next(){for(;s>=e.length&&!t.isDone&&!t.streamError;)await new Promise((r,i)=>{a.push(()=>{t.streamError?i(t.streamError):r()})});if(s>=e.length&&t.streamError)throw t.streamError;if(s<e.length){let r=e[s];return s++,{value:r,done:!1}}return{value:void 0,done:!0}}}}}}};var J=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi;var $=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi;var z=/\s*●●●\s*$/g;function F(n){return n.length>0&&n.some(e=>{if(e&&typeof e==`object`&&!Array.isArray(e)){let t=Object.keys(e);return t.includes(`version`)||t.includes(`createSurface`)||t.includes(`updateComponents`)||t.includes(`updateDataModel`)||t.includes(`deleteSurface`)}return!1})}var E=class n{PULSE_INDICATOR=`●●●`;appendPulse(e){return`${e??``} ${this.PULSE_INDICATOR}`}stripPulse(e){return e?(z.lastIndex=0,e.replace(z,``).trim()):``}stripThinkingTags(e){return e?($.lastIndex=0,e.replace($,``).trim()):``}extractCodeFences(e){if(!e)return{extracted:``,hasFences:!1};J.lastIndex=0;let t=Array.from(e.matchAll(J));return t.length>0?{extracted:t.map(a=>a[1].trim()).join(`
`),hasFences:!0}:{extracted:e.trim(),hasFences:!1}}cleanPayload(e){if(!e)return``;let t=this.stripPulse(e);if(t=this.stripThinkingTags(t),t=this.extractCodeFences(t).extracted,!t.startsWith(`{`)&&!t.startsWith(`[`)){let s=Array.from(t.matchAll(/[\{\[]/g));for(let r of s)if(r.index!==void 0&&r.index>=0){let i=t.substring(r.index).trim();if(i.startsWith(`{`)&&i.includes(`"version"`)||i.startsWith(`[`)&&/^\[\s*[\{\"]/.test(i)&&(i.includes(`"version"`)||i.includes(`"createSurface"`)||i.includes(`"updateComponents"`))){t=i;break}let u=h(i);if(u.success&&F(u.data)){t=i;break}}}return t.trim()}isLayoutSnapshot(e){if(!e)return!1;let t=this.cleanPayload(e);if(t.startsWith(`{"version"`)||t.startsWith(`{`)&&t.includes(`"version"`)||t.startsWith(`[`)&&(t.includes(`"version"`)||t.includes(`"createSurface"`)||t.includes(`"updateComponents"`)))return!0;let a=h(t);return a.success&&F(a.data)}isUserLayoutSnapshot(e){if(!e||e.role!==`user`||e.promptId||e.attachments?.length)return!1;if(e.isSnapshot!==void 0)return e.isSnapshot;let t=typeof e.content==`string`?e.content.trim():``;return(t.startsWith(`[`)||t.startsWith(`{`))&&this.isLayoutSnapshot(t)}static ɵfac=function(t){return new(t||n)};static ɵprov=ee({token:n,factory:n.ɵfac,providedIn:`root`})};var G=`[
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
`;var R=`https://a2ui.org/specification/v0_9/basic_catalog.json`;var D=`updateComponents`;var L=`components`;var Y=`registerMockRules`;var j=`mockRulesConfig`;var q=`rules`;var Q=`id`;var Z=`children`;var B=`mock_rules_container`;var X=class n{destroyRef=b(Pt);chatState=b(v);chatCleaner=b(E);catalogManagement=b(C3);startupConfigState=b(uy);logger=b(_n).withTag(`[StateSync]`);previousCatalogId=null;isDraftEdited=!1;lastSynchronizedLayout=null;_activeDraft=Fe(``);activeDraft=this._activeDraft.asReadonly();sessionResetNonce=Fe(0);userDraftInput$=new fe;cancelPendingDraftSync$=new fe;constructor(){WUe(this.catalogManagement.activeCatalog).pipe(tn(t=>!!t),v$(this.destroyRef)).subscribe(t=>{let a=C$(t)||``,s=this.previousCatalogId===null,r=this.previousCatalogId!==null&&this.previousCatalogId!==a;if((s||r)&&!this.isDraftEdited){let i=this.getInitialDraft(a);this._activeDraft.set(i),this.userDraftInput$.next(i)}this.previousCatalogId=a}),(this.startupConfigState.sharedA2uiPayload?WUe(this.startupConfigState.sharedA2uiPayload):nn(null)).pipe(tn(t=>!!t),v$(this.destroyRef)).subscribe(t=>{this.injectExternalDraft(t)}),this.userDraftInput$.pipe(_C(t=>ya(300).pipe(gt(()=>t),bs(this.cancelPendingDraftSync$))),v$(this.destroyRef)).subscribe(t=>{this.chatState.isProgrammaticStreamActive()||this.syncLayoutToHistory(t)})}updateDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}injectExternalDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}syncActiveDraftToHistory(){this.syncLayoutToHistory(this._activeDraft())}hasEditedDraft(){return this.isDraftEdited}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(e){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!0,this.lastSynchronizedLayout=this.sanitizeLayout(e)||null,this._activeDraft.set(e)}flushDraft(){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.previousCatalogId=null;let e=this.catalogManagement.activeCatalog(),t=e&&C$(e)||``;!this.startupConfigState.activeRenderer()?.samplePayload&&!t&&(t=R);let s=this.getInitialDraft(t);this._activeDraft.set(s),s&&this.userDraftInput$.next(s)}resetToBlankDraft(){this.cancelPendingDraftSync$.next();let e=this.catalogManagement.activeCatalog(),t=e&&C$(e)||R;this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.previousCatalogId=t;let a=this.buildBlankSurfaceDraft(t);this._activeDraft.set(a),this.sessionResetNonce.update(s=>s+1),this.syncLayoutToHistory(a)}getInitialDraft(e){let t=this.startupConfigState.activeRenderer();return t?.samplePayload?t.samplePayload:e===R?G:e?this.buildBlankSurfaceDraft(e):``}buildBlankSurfaceDraft(e){return W([{version:`v0.9`,createSurface:{surfaceId:`sample-surface`,catalogId:e,sendDataModel:!0}}])}syncLayoutToHistory(e){if(e!==this._activeDraft())return;let t=this.sanitizeLayout(e);if(!t)return;let a=this.chatState.chatHistory();if(a.length>0&&t===this.lastSynchronizedLayout)return;if(this.lastSynchronizedLayout=t,a.length===0){this.chatState.setChatHistory([{role:`user`,content:t,isSnapshot:!0}]);return}let s=a[a.length-1];if(this.chatCleaner.isUserLayoutSnapshot(s)){let i=[...a];i[i.length-1]={role:`user`,content:t,isSnapshot:!0},this.chatState.setChatHistory(i)}else this.chatState.updateChatHistory(i=>[...i,{role:`user`,content:t,isSnapshot:!0}])}sanitizeLayout(e){let t=e.trim();if(!t)return``;let a=h(t);if(a.success){let s=a.data.map(r=>r&&typeof r==`object`&&!Array.isArray(r)?this.sanitizeBlock(r):r).filter(r=>r!==null);return s.length>0?JSON.stringify(s):``}return this.logger.warn(`Discarding malformed layout JSON during sanitization: not a valid JSON array`),``}sanitizeBlock(e){if(e[Y]||e[j])return null;if(e[D]&&typeof e[D]==`object`&&e[D]!==null){let t=e[D];if(Array.isArray(t[L]))t[L]=t[L].filter(s=>s!==null&&typeof s==`object`&&!Array.isArray(s)?s[Q]!==B:!0).map(s=>s!==null&&typeof s==`object`&&!Array.isArray(s)?this.sanitizeComponentObject(s):s)}return e}sanitizeComponentObject(e){let t={};for(let[a,s]of Object.entries(e))a===q||/^mock/i.test(a)||(a===Z&&Array.isArray(s)?t[a]=s.filter(r=>r!==B):s!==null&&typeof s==`object`&&!Array.isArray(s)?t[a]=this.sanitizeComponentObject(s):Array.isArray(s)?t[a]=s.map(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?this.sanitizeComponentObject(r):r):t[a]=s);return t}static ɵfac=function(t){return new(t||n)};static ɵprov=ee({token:n,factory:n.ɵfac,providedIn:`root`})};var tt=(t=>(t.ORIGIN=`origin`,t.THEME=`theme`,t))(tt||{});export{X as a,h as c,v as d,W as i,tt as l,T as n,ct as o,U as r,et as s,E as t,ut as u};