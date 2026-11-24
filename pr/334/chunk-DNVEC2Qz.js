import{i as u,n as s,t as r}from"./chunk-DarCEgGK.js";import{C as Bt,Ct as Is,Kn as W$,Ni as n3,Oa as wn,T as C,Ut as Lt$1,Y as Ft,bt as Ia,cn as Pe$1,cr as Ys,dn as QF,hr as Zb,ir as YHe,k as Cy,pa as te,qi as pe,rr as Xt}from"./chunk-CxbNUGsV.js";function T(o,e){let t=Math.max(0,Math.min(e,o.length)),n=o.slice(0,t).split(`
`);return{line:n.length,column:n[n.length-1].length+1}}function vt(o,e){let t=0,n=o.length,a=[],r=`value`;function s(){for(;t<n&&(o[t]===` `||o[t]===`	`||o[t]===`
`||o[t]===`\r`);)t++}function i(){if(o[t]!==`"`)return!1;for(t++;t<n;)if(o[t]===`\\`)t+=2;else{if(o[t]===`"`)return t++,!0;t++}return!0}function l(){let c=t;if(o[t]===`-`&&t++,t<n&&o[t]>=`0`&&o[t]<=`9`){for(;t<n&&o[t]>=`0`&&o[t]<=`9`;)t++;if(t<n&&o[t]===`.`)for(t++;t<n&&o[t]>=`0`&&o[t]<=`9`;)t++;if(t<n&&(o[t]===`e`||o[t]===`E`))for(t++,t<n&&(o[t]===`+`||o[t]===`-`)&&t++;t<n&&o[t]>=`0`&&o[t]<=`9`;)t++;return!0}return t=c,!1}function d(){for(let c of[`true`,`false`,`null`])if(o.startsWith(c,t)){let u=o[t+c.length];if(!u||!/[A-Za-z0-9_$]/.test(u))return t+=c.length,!0}return!1}for(;t<n&&(s(),!(t>=n));){let c=t,u=o[t];if(r===`value_or_end`){if(u===`]`&&a[a.length-1]===`[`){t++,a.pop(),r=`after_value`;continue}r=`value`}if(r===`value`)if(u===`{`)t++,a.push(`{`),r=`prop_or_end`;else if(u===`[`)t++,a.push(`[`),r=`value_or_end`;else if(i()||l()||d())r=`after_value`;else return o.startsWith(e,c)?c:-1;else if(r===`prop_or_end`)if(u===`}`)t++,a.pop(),r=`after_value`;else if(i())r=`colon`;else return o.startsWith(e,c)?c:-1;else if(r===`colon`)if(u===`:`)t++,r=`value`;else return o.startsWith(e,c)?c:-1;else if(r===`prop`)if(i())r=`colon`;else return o.startsWith(e,c)?c:-1;else if(r===`after_value`){let X=a[a.length-1];if(X===`{`)if(u===`,`)t++,r=`prop`;else if(u===`}`)t++,a.pop(),r=`after_value`;else return o.startsWith(e,c)?c:-1;else if(X===`[`)if(u===`,`)t++,r=`value`;else if(u===`]`)t++,a.pop(),r=`after_value`;else return o.startsWith(e,c)?c:-1;else return o.startsWith(e,c)?c:-1}}return-1}function st(o,e){let t=o.message,n=t.match(/line (\d+) column (\d+)/i);if(n)return{line:parseInt(n[1],10),column:parseInt(n[2],10)};let a=t.match(/at position (\d+)/i);if(a)return T(e,parseInt(a[1],10));let r=t.match(/^Unexpected token (.+?), (\.\.\.)?"([\s\S]+)"(\.\.\.)? is not valid JSON$/);if(r){let s=r[1].replace(/^'|'$/g,``),i=!!r[2],l=r[3],d=!!r[4],c=e;if(i){if(l.startsWith(s,10)){let u=d?c.indexOf(l):c.lastIndexOf(l);if(u!==-1)return T(c,u+10)}return{}}else if(d&&l.length>=10&&l.startsWith(s,l.length-10)){let u=c.indexOf(l);if(u!==-1)return T(c,u+l.length-10)}else{let u=vt(c,s);if(u!==-1)return T(c,u)}}return{}}function f(o){if(o==null)return{success:!1,data:null,error:{message:`Content is null or undefined`}};let e=o.trim();if(e.length===0)return{success:!1,data:null,error:{message:`Content is empty`}};let t=null;if(e.startsWith(`[`)&&e.endsWith(`]`))try{let r=JSON.parse(e);if(Array.isArray(r))return{success:!0,data:r}}catch(r){t=r}else if(e.startsWith(`{`)&&e.endsWith(`}`))try{let r=JSON.parse(e);if(r!==null&&typeof r==`object`&&!Array.isArray(r))return{success:!0,data:[r]}}catch(r){t=r}else if(e.startsWith(`{`)||e.startsWith(`[`))try{JSON.parse(e)}catch(r){t=r}let n=e.split(`
`),a=[];for(let r=0;r<n.length;r++){let s=n[r].trim();s.length>0&&a.push({text:s,originalIndex:r})}if(a.length>0){let r=[],s=!0;for(let i of a){if(!i.text.startsWith(`{`)||!i.text.endsWith(`}`)){s=!1;break}try{let l=JSON.parse(i.text);if(l!==null&&typeof l==`object`&&!Array.isArray(l))r.push(l);else{s=!1;break}}catch(l){if(t=l,t instanceof Error){let d=st(t,i.text);return{success:!1,data:null,error:{message:t.message,line:i.originalIndex+1,column:d.column,snippet:n[i.originalIndex]}}}s=!1;break}}if(s)return{success:!0,data:r}}if(t instanceof Error){let r=st(t,o);return{success:!1,data:null,error:{message:t.message,line:r.line,column:r.column,snippet:r.line!==void 0&&r.line>0&&r.line<=n.length?n[r.line-1]:void 0}}}return{success:!1,data:null,error:{message:`Invalid JSON format`}}}function V(o){return o===void 0?``:JSON.stringify(o,null,2)}function Nt(o){return typeof o!=`object`||o===null||Array.isArray(o)?null:o}var F=class o{_chatHistory=Pe$1([]);_pipelineStatus=Pe$1(`idle`);_isProgrammaticStreamActive=Pe$1(!1);_latestLlmLog=Pe$1(null);_llmHistory=Pe$1([]);chatHistory=this._chatHistory.asReadonly();pipelineStatus=this._pipelineStatus.asReadonly();isProgrammaticStreamActive=this._isProgrammaticStreamActive.asReadonly();latestLlmLog=this._latestLlmLog.asReadonly();llmHistory=this._llmHistory.asReadonly();setChatHistory(e){this._chatHistory.set(e)}updateChatHistory(e){this._chatHistory.update(e)}setPipelineStatus(e){this._pipelineStatus.set(e)}setProgrammaticStreamActive(e){this._isProgrammaticStreamActive.set(e)}addRawLlmLog(e,t){let n={type:e,timestamp:Date.now(),payload:t};this._latestLlmLog.set(n),this._llmHistory.update(a=>[...a,n].slice(-50))}clearRawLlmHistory(){this._latestLlmLog.set(null),this._llmHistory.set([])}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};var Ut=`CancelError`;var Wt=`*You stopped this response.*`;var it=class{async chat(e){return{content:await(await this.chatStream(e)).complete,isComplete:!0}}extractXmlThoughts(e){let t=``;return{cleanText:e.replace(/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,(a,r,s)=>(t+=s,``)),totalExtractedThinking:t}}createContentStream(e,t,n){return{[Symbol.asyncIterator](){let a=0;return{async next(){for(;a>=e.length&&!t.isDone&&!t.streamError;)await new Promise((r,s)=>{n.push(()=>{t.streamError?s(t.streamError):r()})});if(a>=e.length&&t.streamError)throw t.streamError;if(a<e.length){let r=e[a];return a++,{value:r,done:!1}}return{value:void 0,done:!0}}}}}}};var lt=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi;var ct=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi;var ut=/\s*●●●\s*$/g;function ft(o){return o.length>0&&o.some(e=>{if(e&&typeof e==`object`&&!Array.isArray(e)){let t=Object.keys(e);return t.includes(`version`)||t.includes(`createSurface`)||t.includes(`updateComponents`)||t.includes(`updateDataModel`)||t.includes(`deleteSurface`)}return!1})}var B=class o{PULSE_INDICATOR=`●●●`;appendPulse(e){return`${e??``} ${this.PULSE_INDICATOR}`}stripPulse(e){return e?(ut.lastIndex=0,e.replace(ut,``).trim()):``}stripThinkingTags(e){return e?(ct.lastIndex=0,e.replace(ct,``).trim()):``}extractCodeFences(e){if(!e)return{extracted:``,hasFences:!1};lt.lastIndex=0;let t=Array.from(e.matchAll(lt));return t.length>0?{extracted:t.map(n=>n[1].trim()).join(`
`),hasFences:!0}:{extracted:e.trim(),hasFences:!1}}cleanPayload(e){if(!e)return``;let t=this.stripPulse(e);if(t=this.stripThinkingTags(t),t=this.extractCodeFences(t).extracted,!t.startsWith(`{`)&&!t.startsWith(`[`)){let a=Array.from(t.matchAll(/[\{\[]/g));for(let r of a)if(r.index!==void 0&&r.index>=0){let s=t.substring(r.index).trim();if(s.startsWith(`{`)&&s.includes(`"version"`)||s.startsWith(`[`)&&/^\[\s*[\{\"]/.test(s)&&(s.includes(`"version"`)||s.includes(`"createSurface"`)||s.includes(`"updateComponents"`))){t=s;break}let i=f(s);if(i.success&&ft(i.data)){t=s;break}}}return t.trim()}isLayoutSnapshot(e){if(!e)return!1;let t=this.cleanPayload(e);if(t.startsWith(`{"version"`)||t.startsWith(`{`)&&t.includes(`"version"`)||t.startsWith(`[`)&&(t.includes(`"version"`)||t.includes(`"createSurface"`)||t.includes(`"updateComponents"`)))return!0;let n=f(t);return n.success&&ft(n.data)}isUserLayoutSnapshot(e){if(!e||e.role!==`user`||e.promptId||e.attachments?.length)return!1;if(e.isSnapshot!==void 0)return e.isSnapshot;let t=typeof e.content==`string`?e.content.trim():``;return(t.startsWith(`[`)||t.startsWith(`{`))&&this.isLayoutSnapshot(t)}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};var S=`https://a2ui.org/specification/v0_9/basic_catalog.json`;var R=`https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`;var _=`[
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
`;var b=`[
  {
    "version": "1.0",
    "createSurface": {
      "surfaceId": "sample-surface",
      "catalogId": "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",
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
          "text": "# Book a Car"
        },
        {
          "id": "location_input",
          "component": "TextField",
          "label": "Pick-up Location",
          "value": {
            "@path": "/booking/location"
          },
          "variant": "shortText"
        },
        {
          "id": "pickup_input",
          "component": "DateTimeInput",
          "label": "Pick-up Date",
          "value": {
            "@path": "/booking/pickupDate"
          },
          "enableDate": true,
          "enableTime": false
        },
        {
          "id": "dropoff_input",
          "component": "DateTimeInput",
          "label": "Drop-off Date",
          "value": {
            "@path": "/booking/dropoffDate"
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
                  "@path": "/booking/location"
                },
                "pickupDate": {
                  "@path": "/booking/pickupDate"
                },
                "dropoffDate": {
                  "@path": "/booking/dropoffDate"
                }
              }
            }
          }
        },
        {
          "id": "book_button_text",
          "component": "Text",
          "text": "Search Cars"
        }
      ],
      "dataModel": {
        "booking": {
          "location": "",
          "pickupDate": "",
          "dropoffDate": ""
        }
      }
    }
  }
]`.trim()+`
`;function dt(o){let e=o.trim();if(!e)return!1;if(e===_.trim()||e===b.trim())return!0;let t=f(e);if(!t.success)return!1;let n=JSON.stringify(t.data),a=f(_);if(a.success&&JSON.stringify(a.data)===n)return!0;let r=f(b);return!!(r.success&&JSON.stringify(r.data)===n)}function pt(o){let e=o.trim();if(!e)return!1;let t=f(e);if(!t.success||t.data.length!==1)return!1;let n=t.data[0];if(!n||typeof n!=`object`||Array.isArray(n))return!1;let r=n.createSurface;if(!r||typeof r!=`object`||Array.isArray(r))return!1;let s=r;return!(typeof s.surfaceId!=`string`||Array.isArray(s.components)&&s.components.length>0||s.dataModel&&typeof s.dataModel==`object`&&Object.keys(s.dataModel).length>0)}var Rt=/"version"\s*:\s*"v?1\.0"/i;var At=/"version"\s*:\s*"v?0\.9"/i;function gt(o){return Rt.test(o)?`v1.0`:At.test(o)?`v0.9`:null}var _t=`registerMockRules`;var bt=`mockRulesConfig`;var P=`updateComponents`;var L=`updateDataModel`;var $=`components`;var Dt=`rules`;var kt=`id`;var It=`children`;var yt=`mock_rules_container`;var O=class o{version=`v0.9`;getStarterDraft(e){return _}getBlankDraft(e,t=`sample-surface`){return V([{version:`v0.9`,createSurface:{surfaceId:t,catalogId:e||S,sendDataModel:!0}}])}isStarterDraft(e){let t=e.trim();if(!t)return!1;if(t===_.trim())return!0;let n=f(t);if(!n.success)return!1;let a=f(_);return a.success?JSON.stringify(n.data)===JSON.stringify(a.data):!1}isBlankDraft(e){let t=e.trim();if(!t)return!1;let n=f(t);if(!n.success||n.data.length!==1)return!1;let a=n.data[0];if(!a||typeof a!=`object`||Array.isArray(a))return!1;let r=a;if(r.version!==`v0.9`&&r.version!==`0.9`)return!1;let s=r.createSurface;if(!s||typeof s!=`object`||Array.isArray(s))return!1;let i=s;return!(typeof i.surfaceId!=`string`||`components`in i||`dataModel`in i)}sanitizeLayout(e){return K(e,t=>this.sanitizeBlock(t))}sanitizeBlock(e){if(e[_t]||e[bt])return null;let t={};for(let[n,a]of Object.entries(e))x(n)||(t[n]=a);if(t[P]&&typeof t[P]==`object`&&t[P]!==null){let n=r({},t[P]);if(Array.isArray(n[$]))n[$]=n[$].filter(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?r[kt]!==yt:!0).map(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?w(r):r);t[P]=n}return t[L]&&typeof t[L]==`object`&&t[L]!==null&&(t[L]=A(t[L])),Object.keys(t).length===0?null:t}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};function x(o){return o===`__proto__`||o===`constructor`||o===`prototype`}function A(o,e=[]){let t={};for(let[n,a]of Object.entries(o))e.includes(n)||x(n)||(a!==null&&typeof a==`object`&&!Array.isArray(a)?t[n]=A(a):Array.isArray(a)?t[n]=a.map(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?A(r):r):t[n]=a);return t}function w(o){let e={};for(let[t,n]of Object.entries(o))x(t)||t===Dt||/^mock/i.test(t)||(t===It&&Array.isArray(n)?e[t]=n.filter(a=>a!==yt):n!==null&&typeof n==`object`&&!Array.isArray(n)?e[t]=w(n):Array.isArray(n)?e[t]=n.map(a=>a!==null&&typeof a==`object`&&!Array.isArray(a)?w(a):a):e[t]=n);return e}var Et=new O;function K(o,e){let t=o.trim();if(!t)return``;let n=f(t);if(!n.success)return``;let a=e??(s=>Et.sanitizeBlock(s)),r=n.data.map(s=>s&&typeof s==`object`&&!Array.isArray(s)?a(s):s).filter(s=>s!==null);return r.length>0?JSON.stringify(r):``}var Ct=`registerMockRules`;var Pt=`mockRulesConfig`;var k=`createSurface`;var M=`updateComponents`;var N=`updateDataModel`;var y=`components`;var v=`dataModel`;var Lt=`id`;var Ot=`mock_rules_container`;var z=class o{version=`v1.0`;getStarterDraft(e){return b}getBlankDraft(e,t=`sample-surface`){return V([{version:`1.0`,createSurface:{surfaceId:t,catalogId:e||R}}])}isStarterDraft(e){let t=e.trim();if(!t)return!1;if(t===b.trim())return!0;let n=f(t);if(!n.success)return!1;let a=f(b);if(!a.success)return!1;let r$1=s=>s.map(i=>{if(i&&typeof i==`object`&&!Array.isArray(i)){let l=r({},i);return(l.version===`v1.0`||l.version===`1.0`)&&(l.version=`1.0`),l}return i});return JSON.stringify(r$1(n.data))===JSON.stringify(r$1(a.data))}isBlankDraft(e){let t=e.trim();if(!t)return!1;let n=f(t);if(!n.success||n.data.length!==1)return!1;let a=n.data[0];if(!a||typeof a!=`object`||Array.isArray(a))return!1;let r=a;if(r.version!==`v1.0`&&r.version!==`1.0`)return!1;let s=r[k];if(!s||typeof s!=`object`||Array.isArray(s))return!1;let i=s;return!(typeof i.surfaceId!=`string`||Array.isArray(i[y])&&i[y].length>0||i[v]&&typeof i[v]==`object`&&Object.keys(i[v]).length>0)}sanitizeLayout(e){return K(e,t=>this.sanitizeBlock(t))}sanitizeBlock(e){if(e[Ct]||e[Pt])return null;let t={};for(let[n,a]of Object.entries(e))x(n)||(t[n]=a);if(t[k]&&typeof t[k]==`object`&&t[k]!==null){let n=r({},t[k]),a=Array.isArray(n[y])?this.sanitizeComponentsList(n[y]):void 0,r$2=n[v]&&typeof n[v]==`object`&&n[v]!==null?A(n[v]):void 0,s=A(n,[y,v]);a!==void 0&&(s[y]=a),r$2!==void 0&&(s[v]=r$2),t[k]=s}if(t[M]&&typeof t[M]==`object`&&t[M]!==null){let n=r({},t[M]),a=Array.isArray(n[y])?this.sanitizeComponentsList(n[y]):void 0,r$3=A(n,[y]);a!==void 0&&(r$3[y]=a),t[M]=r$3}return t[N]&&typeof t[N]==`object`&&t[N]!==null&&(t[N]=A(t[N])),Object.keys(t).length===0?null:t}sanitizeComponentsList(e){return e.filter(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?n[Lt]!==Ot:!0).map(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?w(n):n)}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};var mt=class o{destroyRef=C(Lt$1);chatState=C(F);chatCleaner=C(B);catalogManagement=C(n3);startupConfigState=C(Cy);logger=C(wn).withTag(`[StateSync]`);v09Strategy=C(O);v10Strategy=C(z);previousCatalogId=null;isDraftEdited=!1;lastSynchronizedLayout=null;lastSamplePayload=null;_activeDraft=Pe$1(``);activeDraft=this._activeDraft.asReadonly();sessionResetNonce=Pe$1(0);userDraftInput$=new pe;cancelPendingDraftSync$=new pe;constructor(){let e=this.catalogManagement.activeCatalog();YHe(this.catalogManagement.activeCatalog).pipe(W$(this.destroyRef)).subscribe(n=>{let a=e!==null&&n===null;e=n,(n||a)&&this.syncCatalogDraft()}),YHe(this.catalogManagement.activeProtocolVersion).pipe(W$(this.destroyRef)).subscribe(n=>{this.handleProtocolVersionChange(n)}),YHe(this.catalogManagement.hasReceivedCatalogResponse).pipe(Ft(n=>n),W$(this.destroyRef)).subscribe(()=>{this.syncCatalogDraft()}),(this.startupConfigState.sharedA2uiPayload?YHe(this.startupConfigState.sharedA2uiPayload):Xt(null)).pipe(Ft(n=>!!n),W$(this.destroyRef)).subscribe(n=>{this.injectExternalDraft(n)}),this.userDraftInput$.pipe(Zb(n=>Ia(300).pipe(Bt(()=>n),Is(this.cancelPendingDraftSync$))),W$(this.destroyRef)).subscribe(n=>{this.chatState.isProgrammaticStreamActive()||this.syncLayoutToHistory(n)})}updateDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}injectExternalDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}syncActiveDraftToHistory(){this.syncLayoutToHistory(this._activeDraft())}hasEditedDraft(){return this.isDraftEdited}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(e){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!0,this.lastSynchronizedLayout=this.sanitizeLayout(e)||null,this._activeDraft.set(e)}flushDraft(){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.lastSamplePayload=null,this.previousCatalogId=null;let e=this.catalogManagement.activeCatalog(),t=e&&Ys(e)||``;!this.startupConfigState.activeRenderer()?.samplePayload&&!t&&(t=this.catalogManagement.activeProtocolVersion()===`v1.0`?R:S),this.applyInitialDraft(t,!1)}resetToBlankDraft(){this.cancelPendingDraftSync$.next();let e=this.catalogManagement.activeCatalog(),t=this.catalogManagement.activeProtocolVersion(),n=t===`v1.0`?R:S,a=e&&Ys(e)||n;this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.lastSamplePayload=null,this.previousCatalogId=a;let s=this.getStrategy(t).getBlankDraft(a);this._activeDraft.set(s),this.sessionResetNonce.update(i=>i+1),this.syncLayoutToHistory(s)}syncCatalogDraft(){let e=this.catalogManagement.activeCatalog();if(e){let t=Ys(e)||``,n=this.previousCatalogId===null,a=this.previousCatalogId!==null&&this.previousCatalogId!==t;(n||a)&&!this.isDraftEdited&&this.applyInitialDraft(t),this.previousCatalogId=t}else this.previousCatalogId=null;this.catalogManagement.hasReceivedCatalogResponse()&&this.handleProtocolVersionChange(this.catalogManagement.activeProtocolVersion())}applyInitialDraft(e,t=!0){let n=this.getInitialDraft(e);this._activeDraft.set(n),(n||t)&&this.userDraftInput$.next(n)}handleProtocolVersionChange(e){if(!this.catalogManagement.hasReceivedCatalogResponse()||this.isDraftEdited)return;let t=this._activeDraft(),n=this.getStrategy(e),a=this.catalogManagement.activeCatalog(),r=a&&Ys(a)||``;r===S&&e===`v1.0`?r=R:r===R&&e===`v0.9`&&(r=S);let s=this.startupConfigState.activeRenderer()?.samplePayload;if(this.lastSamplePayload!==null&&t===this.lastSamplePayload){s!==t&&this.applyInitialDraft(r);return}if(t===``&&s){this.applyInitialDraft(r);return}if(dt(t)){let i=n.getStarterDraft(r);i!==t&&(this._activeDraft.set(i),this.userDraftInput$.next(i))}else if(pt(t)){let i=n.getBlankDraft(r||void 0);i!==t&&(this._activeDraft.set(i),this.userDraftInput$.next(i))}}getStrategy(e){return(e??this.catalogManagement.activeProtocolVersion())===`v1.0`?this.v10Strategy:this.v09Strategy}getInitialDraft(e){let t=this.startupConfigState.activeRenderer();if(t?.samplePayload)return this.lastSamplePayload=t.samplePayload,t.samplePayload;if(this.lastSamplePayload=null,!e)return``;let n=this.catalogManagement.activeProtocolVersion(),a=this.getStrategy(n);return e===S||e===R||e===`https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json`?a.getStarterDraft(e):a.getBlankDraft(e)}syncLayoutToHistory(e){if(e!==this._activeDraft())return;let t=this.sanitizeLayout(e);if(!t)return;let n=this.chatState.chatHistory();if(n.length>0&&t===this.lastSynchronizedLayout)return;if(this.lastSynchronizedLayout=t,n.length===0){this.chatState.setChatHistory([{role:`user`,content:t,isSnapshot:!0}]);return}let a=n[n.length-1];if(this.chatCleaner.isUserLayoutSnapshot(a)){let s=[...n];s[s.length-1]={role:`user`,content:t,isSnapshot:!0},this.chatState.setChatHistory(s)}else this.chatState.updateChatHistory(s=>[...s,{role:`user`,content:t,isSnapshot:!0}])}sanitizeLayout(e){let t=e.trim();if(!t)return``;let n=f(t);if(n.success?QF(n.data)===`v1.0`:gt(t)===`v1.0`){let s=this.v10Strategy.sanitizeLayout(t);return s||this.logger.warn(`Discarding malformed layout JSON during sanitization: not a valid JSON array`),s}let r=this.getStrategy().sanitizeLayout(t);return r||this.logger.warn(`Discarding malformed layout JSON during sanitization: not a valid JSON array`),r}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};function wt(o){if(typeof o.version!=`string`)return null;let e=o.version.trim();return e.length>0?e:null}function ht(o,e){if(!Array.isArray(o)||o.length===0)return{status:`indeterminate`};let t=null,n=null;for(let a of o){if(!a||typeof a!=`object`||Array.isArray(a))continue;let r=a,s=xt(r);if(!s)continue;let i=wt(r);if(e)return{status:`detected`,version:s,anchor:i};if(t===null)t=s,n=i;else if(s!==t)return{status:`mixed`,anchor:i??n}}return t===null?{status:`indeterminate`}:{status:`detected`,version:t,anchor:n}}function Pe(o){return ht(o,!1)}function Le(o){let e=ht(o,!0);return e.status===`detected`?e.version:null}function xt(o){if(typeof o.version==`string`){let t=o.version.trim();if(t===`v1.0`||t===`1.0`)return`v1.0`;if(t===`v0.9`||t===`0.9`)return`v0.9`}if(o.callRendererFunction!==void 0||o.agentFunctionResponse!==void 0||o.callAgentFunctionResponse!==void 0)return`v1.0`;if(o.createSurface&&typeof o.createSurface==`object`&&!Array.isArray(o.createSurface)){let t=o.createSurface;if(typeof t.catalogId==`string`&&(t.catalogId.includes(`v1_0`)||t.catalogId.includes(`v1.0`))||Array.isArray(t.components)&&t.components.length>0||t.dataModel&&typeof t.dataModel==`object`&&!Array.isArray(t.dataModel)&&Object.keys(t.dataModel).length>0)return`v1.0`;if(t.theme!==void 0)return`v0.9`}return J(o)||(o.beginRendering!==void 0?`v0.9`:null)}function J(o){if(!o||typeof o!=`object`)return null;if(Array.isArray(o)){for(let t of o){let n=J(t);if(n)return n}return null}let e=o;if(`@path`in e||`@call`in e)return`v1.0`;if(typeof e.path==`string`&&Object.keys(e).length===1||typeof e.call==`string`&&`returnType`in e)return`v0.9`;for(let[t,n]of Object.entries(e)){if(t===`__proto__`||t===`constructor`||t===`prototype`||t===`dataModel`)continue;if(t===`updateDataModel`&&n&&typeof n==`object`&&!Array.isArray(n)){let r=n;for(let[s,i]of Object.entries(r))if(s!==`value`){let l=J(i);if(l)return l}continue}let a=J(n);if(a)return a}return null}function Me(o,e){return{version:`1.0`,agentFunctionResponse:`error`in e?{functionCallId:o,error:e.error}:{functionCallId:o,value:e.value}}}function U(o){return o!==null&&typeof o==`object`&&!Array.isArray(o)}function Ne(o){let e=r({},o);if(`callAgentFunctionResponse`in e){let s=e.callAgentFunctionResponse,t=e,{callAgentFunctionResponse:i}=t;e=u(t,[`callAgentFunctionResponse`]),e.agentFunctionResponse===void 0&&s!==void 0&&(e.agentFunctionResponse=s)}if(U(e.agentFunctionResponse)){let s=e.agentFunctionResponse;if(`result`in s){let n=s,{result:i}=n,l=u(n,[`result`]);l.value===void 0&&l.error===void 0&&(l.value=i),e.agentFunctionResponse=l}}if(U(e.callRendererFunction)){let s$1=e.callRendererFunction;if(s$1.call!==void 0&&!U(s$1.callFunction)){let a=s$1,{call:i,args:l,catalogId:d}=a,c=u(a,[`call`,`args`,`catalogId`]),u$1={"@call":String(i)};l!==void 0&&(u$1.args=l),d!==void 0&&(u$1.catalogId=d),e.callRendererFunction=s(r({},c),{callFunction:u$1})}else if(U(s$1.callFunction)){let r$4=s$1,{catalogId:i}=r$4,l=u(r$4,[`catalogId`]),d=r({},s$1.callFunction);d.call!==void 0&&!d[`@call`]&&(d[`@call`]=String(d.call),delete d.call),i!==void 0&&d.catalogId===void 0&&(d.catalogId=i),e.callRendererFunction=s(r({},l),{callFunction:d})}}return e}var Mt=(t=>(t.ORIGIN=`origin`,t.THEME=`theme`,t))(Mt||{});export{st as _,Mt as a,Pe as c,Wt as d,f,pt as g,mt as h,Me as i,Ut as l,it as m,F as n,Ne as o,gt as p,Le as r,Nt as s,B as t,V as u};