import{t as r}from"./chunk-DarCEgGK.js";import{Aa as yy,C as C$1,D as Ca,Et as Lt,Ki as te,La as zt,Nn as VF,Oi as pe,On as U9,S as Bt,Yr as j$,an as RC,ja as z$,nr as _s,on as RHe,pa as wn,xa as xt,xt as Le}from"./chunk-BkKEumRv.js";function T(o,e){let t=Math.max(0,Math.min(e,o.length)),r=o.slice(0,t).split(`
`);return{line:r.length,column:r[r.length-1].length+1}}function ft(o,e){let t=0,r=o.length,a=[],n=`value`;function s(){for(;t<r&&(o[t]===` `||o[t]===`	`||o[t]===`
`||o[t]===`\r`);)t++}function i(){if(o[t]!==`"`)return!1;for(t++;t<r;)if(o[t]===`\\`)t+=2;else{if(o[t]===`"`)return t++,!0;t++}return!0}function l(){let c=t;if(o[t]===`-`&&t++,t<r&&o[t]>=`0`&&o[t]<=`9`){for(;t<r&&o[t]>=`0`&&o[t]<=`9`;)t++;if(t<r&&o[t]===`.`)for(t++;t<r&&o[t]>=`0`&&o[t]<=`9`;)t++;if(t<r&&(o[t]===`e`||o[t]===`E`))for(t++,t<r&&(o[t]===`+`||o[t]===`-`)&&t++;t<r&&o[t]>=`0`&&o[t]<=`9`;)t++;return!0}return t=c,!1}for(;t<r&&(s(),!(t>=r));){let c=t,f=o[t];if(n===`value`)if(f===`{`)t++,a.push(`{`),n=`prop_or_end`;else if(f===`[`)t++,a.push(`[`),n=`value`;else if(f===`]`&&a[a.length-1]===`[`)t++,a.pop(),n=`after_value`;else if(i()||l()||o.startsWith(`true`,t)||o.startsWith(`false`,t)||o.startsWith(`null`,t))o.startsWith(`true`,c)?t+=4:o.startsWith(`false`,c)?t+=5:o.startsWith(`null`,c)&&(t+=4),n=`after_value`;else return o.startsWith(e,c)?c:-1;else if(n===`prop_or_end`)if(f===`}`)t++,a.pop(),n=`after_value`;else if(i())n=`colon`;else return o.startsWith(e,c)?c:-1;else if(n===`colon`)if(f===`:`)t++,n=`value`;else return o.startsWith(e,c)?c:-1;else if(n===`prop`)if(i())n=`colon`;else return o.startsWith(e,c)?c:-1;else if(n===`after_value`){let d=a[a.length-1];if(d===`{`)if(f===`,`)t++,n=`prop`;else if(f===`}`)t++,a.pop(),n=`after_value`;else return o.startsWith(e,c)?c:-1;else if(d===`[`)if(f===`,`)t++,n=`value`;else if(f===`]`)t++,a.pop(),n=`after_value`;else return o.startsWith(e,c)?c:-1;else return o.startsWith(e,c)?c:-1}}return-1}function et(o,e){let t=o.message,r=t.match(/line (\d+) column (\d+)/i);if(r)return{line:parseInt(r[1],10),column:parseInt(r[2],10)};let a=t.match(/at position (\d+)/i);if(a)return T(e,parseInt(a[1],10));let n=t.match(/^Unexpected token (.+?), (\.\.\.)?"([\s\S]+)"(\.\.\.)? is not valid JSON$/);if(n){let s=n[1].replace(/^'|'$/g,``),i=!!n[2],l=n[3],c=!!n[4],f=e;if(i){if(l.startsWith(s,10)){let d=c?f.indexOf(l):f.lastIndexOf(l);if(d!==-1)return T(f,d+10)}return{}}else if(c&&l.length>=10&&l.startsWith(s,l.length-10)){let d=f.indexOf(l);if(d!==-1)return T(f,d+l.length-10)}else{let d=ft(f,s);if(d!==-1)return T(f,d)}}return{}}function u(o){if(o==null)return{success:!1,data:null,error:{message:`Content is null or undefined`}};let e=o.trim();if(e.length===0)return{success:!1,data:null,error:{message:`Content is empty`}};let t=null;if(e.startsWith(`[`)&&e.endsWith(`]`))try{let n=JSON.parse(e);if(Array.isArray(n))return{success:!0,data:n}}catch(n){t=n}else if(e.startsWith(`{`)&&e.endsWith(`}`))try{let n=JSON.parse(e);if(n!==null&&typeof n==`object`&&!Array.isArray(n))return{success:!0,data:[n]}}catch(n){t=n}else if(e.startsWith(`{`)||e.startsWith(`[`))try{JSON.parse(e)}catch(n){t=n}let r=e.split(`
`),a=[];for(let n=0;n<r.length;n++){let s=r[n].trim();s.length>0&&a.push({text:s,originalIndex:n})}if(a.length>0){let n=[],s=!0;for(let i of a){if(!i.text.startsWith(`{`)||!i.text.endsWith(`}`)){s=!1;break}try{let l=JSON.parse(i.text);if(l!==null&&typeof l==`object`&&!Array.isArray(l))n.push(l);else{s=!1;break}}catch(l){if(t=l,t instanceof Error){let c=et(t,i.text);return{success:!1,data:null,error:{message:t.message,line:i.originalIndex+1,column:c.column,snippet:r[i.originalIndex]}}}s=!1;break}}if(s)return{success:!0,data:n}}if(t instanceof Error){let n=et(t,o);return{success:!1,data:null,error:{message:t.message,line:n.line,column:n.column,snippet:n.line!==void 0&&n.line>0&&n.line<=r.length?r[n.line-1]:void 0}}}return{success:!1,data:null,error:{message:`Invalid JSON format`}}}function V(o){return o===void 0?``:JSON.stringify(o,null,2)}function kt(o){return typeof o!=`object`||o===null||Array.isArray(o)?null:o}var B=class o{_chatHistory=Le([]);_pipelineStatus=Le(`idle`);_isProgrammaticStreamActive=Le(!1);_latestLlmLog=Le(null);_llmHistory=Le([]);chatHistory=this._chatHistory.asReadonly();pipelineStatus=this._pipelineStatus.asReadonly();isProgrammaticStreamActive=this._isProgrammaticStreamActive.asReadonly();latestLlmLog=this._latestLlmLog.asReadonly();llmHistory=this._llmHistory.asReadonly();setChatHistory(e){this._chatHistory.set(e)}updateChatHistory(e){this._chatHistory.update(e)}setPipelineStatus(e){this._pipelineStatus.set(e)}setProgrammaticStreamActive(e){this._isProgrammaticStreamActive.set(e)}addRawLlmLog(e,t){let r={type:e,timestamp:Date.now(),payload:t};this._latestLlmLog.set(r),this._llmHistory.update(a=>[...a,r].slice(-50))}clearRawLlmHistory(){this._latestLlmLog.set(null),this._llmHistory.set([])}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};var wt=`CancelError`;var Nt=`*You stopped this response.*`;var rt=class{async chat(e){return{content:await(await this.chatStream(e)).complete,isComplete:!0}}extractXmlThoughts(e){let t=``;return{cleanText:e.replace(/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,(a,n,s)=>(t+=s,``)),totalExtractedThinking:t}}createContentStream(e,t,r){return{[Symbol.asyncIterator](){let a=0;return{async next(){for(;a>=e.length&&!t.isDone&&!t.streamError;)await new Promise((n,s)=>{r.push(()=>{t.streamError?s(t.streamError):n()})});if(a>=e.length&&t.streamError)throw t.streamError;if(a<e.length){let n=e[a];return a++,{value:n,done:!1}}return{value:void 0,done:!0}}}}}}};var nt=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi;var at=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi;var ot=/\s*●●●\s*$/g;function st(o){return o.length>0&&o.some(e=>{if(e&&typeof e==`object`&&!Array.isArray(e)){let t=Object.keys(e);return t.includes(`version`)||t.includes(`createSurface`)||t.includes(`updateComponents`)||t.includes(`updateDataModel`)||t.includes(`deleteSurface`)}return!1})}var z=class o{PULSE_INDICATOR=`●●●`;appendPulse(e){return`${e??``} ${this.PULSE_INDICATOR}`}stripPulse(e){return e?(ot.lastIndex=0,e.replace(ot,``).trim()):``}stripThinkingTags(e){return e?(at.lastIndex=0,e.replace(at,``).trim()):``}extractCodeFences(e){if(!e)return{extracted:``,hasFences:!1};nt.lastIndex=0;let t=Array.from(e.matchAll(nt));return t.length>0?{extracted:t.map(r=>r[1].trim()).join(`
`),hasFences:!0}:{extracted:e.trim(),hasFences:!1}}cleanPayload(e){if(!e)return``;let t=this.stripPulse(e);if(t=this.stripThinkingTags(t),t=this.extractCodeFences(t).extracted,!t.startsWith(`{`)&&!t.startsWith(`[`)){let a=Array.from(t.matchAll(/[\{\[]/g));for(let n of a)if(n.index!==void 0&&n.index>=0){let s=t.substring(n.index).trim();if(s.startsWith(`{`)&&s.includes(`"version"`)||s.startsWith(`[`)&&/^\[\s*[\{\"]/.test(s)&&(s.includes(`"version"`)||s.includes(`"createSurface"`)||s.includes(`"updateComponents"`))){t=s;break}let i=u(s);if(i.success&&st(i.data)){t=s;break}}}return t.trim()}isLayoutSnapshot(e){if(!e)return!1;let t=this.cleanPayload(e);if(t.startsWith(`{"version"`)||t.startsWith(`{`)&&t.includes(`"version"`)||t.startsWith(`[`)&&(t.includes(`"version"`)||t.includes(`"createSurface"`)||t.includes(`"updateComponents"`)))return!0;let r=u(t);return r.success&&st(r.data)}isUserLayoutSnapshot(e){if(!e||e.role!==`user`||e.promptId||e.attachments?.length)return!1;if(e.isSnapshot!==void 0)return e.isSnapshot;let t=typeof e.content==`string`?e.content.trim():``;return(t.startsWith(`[`)||t.startsWith(`{`))&&this.isLayoutSnapshot(t)}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};var v=`https://a2ui.org/specification/v0_9/basic_catalog.json`;var S=`https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`;var _=`[
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
`;var D=`[
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
`;function it(o){let e=o.trim();if(!e)return!1;if(e===_.trim()||e===D.trim())return!0;let t=u(e);if(!t.success)return!1;let r=JSON.stringify(t.data),a=u(_);if(a.success&&JSON.stringify(a.data)===r)return!0;let n=u(D);return!!(n.success&&JSON.stringify(n.data)===r)}function ct(o){let e=o.trim();if(!e)return!1;let t=u(e);if(!t.success||t.data.length!==1)return!1;let r=t.data[0];if(!r||typeof r!=`object`||Array.isArray(r))return!1;let n=r.createSurface;if(!n||typeof n!=`object`||Array.isArray(n))return!1;let s=n;return!(typeof s.surfaceId!=`string`||Array.isArray(s.components)&&s.components.length>0||s.dataModel&&typeof s.dataModel==`object`&&Object.keys(s.dataModel).length>0)}var pt=`registerMockRules`;var gt=`mockRulesConfig`;var E=`updateComponents`;var C=`updateDataModel`;var W=`components`;var yt=`rules`;var mt=`id`;var ht=`children`;var lt=`mock_rules_container`;var L=class o{version=`v0.9`;getStarterDraft(e){return _}getBlankDraft(e,t=`sample-surface`){return V([{version:`v0.9`,createSurface:{surfaceId:t,catalogId:e||v,sendDataModel:!0}}])}isStarterDraft(e){let t=e.trim();if(!t)return!1;if(t===_.trim())return!0;let r=u(t);if(!r.success)return!1;let a=u(_);return a.success?JSON.stringify(r.data)===JSON.stringify(a.data):!1}isBlankDraft(e){let t=e.trim();if(!t)return!1;let r=u(t);if(!r.success||r.data.length!==1)return!1;let a=r.data[0];if(!a||typeof a!=`object`||Array.isArray(a))return!1;let n=a;if(n.version!==`v0.9`&&n.version!==`0.9`)return!1;let s=n.createSurface;if(!s||typeof s!=`object`||Array.isArray(s))return!1;let i=s;return!(typeof i.surfaceId!=`string`||`components`in i||`dataModel`in i)}sanitizeLayout(e){return H(e,t=>this.sanitizeBlock(t))}sanitizeBlock(e){if(e[pt]||e[gt])return null;let t={};for(let[r,a]of Object.entries(e))P(r)||(t[r]=a);if(t[E]&&typeof t[E]==`object`&&t[E]!==null){let r$1=r({},t[E]);if(Array.isArray(r$1[W]))r$1[W]=r$1[W].filter(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?n[mt]!==lt:!0).map(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?O(n):n);t[E]=r$1}return t[C]&&typeof t[C]==`object`&&t[C]!==null&&(t[C]=b(t[C])),Object.keys(t).length===0?null:t}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};function P(o){return o===`__proto__`||o===`constructor`||o===`prototype`}function b(o,e=[]){let t={};for(let[r,a]of Object.entries(o))e.includes(r)||P(r)||(a!==null&&typeof a==`object`&&!Array.isArray(a)?t[r]=b(a):Array.isArray(a)?t[r]=a.map(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?b(n):n):t[r]=a);return t}function O(o){let e={};for(let[t,r]of Object.entries(o))P(t)||t===yt||/^mock/i.test(t)||(t===ht&&Array.isArray(r)?e[t]=r.filter(a=>a!==lt):r!==null&&typeof r==`object`&&!Array.isArray(r)?e[t]=O(r):Array.isArray(r)?e[t]=r.map(a=>a!==null&&typeof a==`object`&&!Array.isArray(a)?O(a):a):e[t]=r);return e}var vt=new L;function H(o,e){let t=o.trim();if(!t)return``;let r=u(t);if(!r.success)return``;let a=e??(s=>vt.sanitizeBlock(s)),n=r.data.map(s=>s&&typeof s==`object`&&!Array.isArray(s)?a(s):s).filter(s=>s!==null);return n.length>0?JSON.stringify(n):``}var St=`registerMockRules`;var bt=`mockRulesConfig`;var R=`createSurface`;var w=`updateComponents`;var N=`updateDataModel`;var g=`components`;var h=`dataModel`;var _t=`id`;var Dt=`mock_rules_container`;var U=class o{version=`v1.0`;getStarterDraft(e){return D}getBlankDraft(e,t=`sample-surface`){return V([{version:`1.0`,createSurface:{surfaceId:t,catalogId:e||S}}])}isStarterDraft(e){let t=e.trim();if(!t)return!1;if(t===D.trim())return!0;let r$2=u(t);if(!r$2.success)return!1;let a=u(D);if(!a.success)return!1;let n=s=>s.map(i=>{if(i&&typeof i==`object`&&!Array.isArray(i)){let l=r({},i);return(l.version===`v1.0`||l.version===`1.0`)&&(l.version=`1.0`),l}return i});return JSON.stringify(n(r$2.data))===JSON.stringify(n(a.data))}isBlankDraft(e){let t=e.trim();if(!t)return!1;let r=u(t);if(!r.success||r.data.length!==1)return!1;let a=r.data[0];if(!a||typeof a!=`object`||Array.isArray(a))return!1;let n=a;if(n.version!==`v1.0`&&n.version!==`1.0`)return!1;let s=n[R];if(!s||typeof s!=`object`||Array.isArray(s))return!1;let i=s;return!(typeof i.surfaceId!=`string`||Array.isArray(i[g])&&i[g].length>0||i[h]&&typeof i[h]==`object`&&Object.keys(i[h]).length>0)}sanitizeLayout(e){return H(e,t=>this.sanitizeBlock(t))}sanitizeBlock(e){if(e[St]||e[bt])return null;let t={};for(let[r,a]of Object.entries(e))P(r)||(t[r]=a);if(t[R]&&typeof t[R]==`object`&&t[R]!==null){let r$3=r({},t[R]),a=Array.isArray(r$3[g])?this.sanitizeComponentsList(r$3[g]):void 0,n=r$3[h]&&typeof r$3[h]==`object`&&r$3[h]!==null?b(r$3[h]):void 0,s=b(r$3,[g,h]);a!==void 0&&(s[g]=a),n!==void 0&&(s[h]=n),t[R]=s}if(t[w]&&typeof t[w]==`object`&&t[w]!==null){let r$4=r({},t[w]),a=Array.isArray(r$4[g])?this.sanitizeComponentsList(r$4[g]):void 0,n=b(r$4,[g]);a!==void 0&&(n[g]=a),t[w]=n}return t[N]&&typeof t[N]==`object`&&t[N]!==null&&(t[N]=b(t[N])),Object.keys(t).length===0?null:t}sanitizeComponentsList(e){return e.filter(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?r[_t]!==Dt:!0).map(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?O(r):r)}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};var ut=class o{destroyRef=C$1(zt);chatState=C$1(B);chatCleaner=C$1(z);catalogManagement=C$1(U9);startupConfigState=C$1(yy);logger=C$1(wn).withTag(`[StateSync]`);v09Strategy=C$1(L);v10Strategy=C$1(U);previousCatalogId=null;isDraftEdited=!1;lastSynchronizedLayout=null;_activeDraft=Le(``);activeDraft=this._activeDraft.asReadonly();sessionResetNonce=Le(0);userDraftInput$=new pe;cancelPendingDraftSync$=new pe;constructor(){RHe(this.catalogManagement.activeCatalog).pipe(xt(t=>!!t),z$(this.destroyRef)).subscribe(t=>{let r=j$(t)||``,a=this.previousCatalogId===null,n=this.previousCatalogId!==null&&this.previousCatalogId!==r;if((a||n)&&!this.isDraftEdited){let s=this.getInitialDraft(r);this._activeDraft.set(s),this.userDraftInput$.next(s)}this.previousCatalogId=r}),RHe(this.catalogManagement.activeProtocolVersion).pipe(z$(this.destroyRef)).subscribe(t=>{this.handleProtocolVersionChange(t)}),RHe(this.catalogManagement.hasReceivedCatalogResponse).pipe(xt(t=>t),z$(this.destroyRef)).subscribe(()=>{this.handleProtocolVersionChange(this.getActiveProtocolVersion())}),(this.startupConfigState.sharedA2uiPayload?RHe(this.startupConfigState.sharedA2uiPayload):Lt(null)).pipe(xt(t=>!!t),z$(this.destroyRef)).subscribe(t=>{this.injectExternalDraft(t)}),this.userDraftInput$.pipe(RC(t=>Ca(300).pipe(Bt(()=>t),_s(this.cancelPendingDraftSync$))),z$(this.destroyRef)).subscribe(t=>{this.chatState.isProgrammaticStreamActive()||this.syncLayoutToHistory(t)})}updateDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}injectExternalDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}syncActiveDraftToHistory(){this.syncLayoutToHistory(this._activeDraft())}hasEditedDraft(){return this.isDraftEdited}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(e){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!0,this.lastSynchronizedLayout=this.sanitizeLayout(e)||null,this._activeDraft.set(e)}flushDraft(){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.previousCatalogId=null;let e=this.catalogManagement.activeCatalog(),t=e&&j$(e)||``;!this.startupConfigState.activeRenderer()?.samplePayload&&!t&&(t=this.getActiveProtocolVersion()===`v1.0`?S:v);let a=this.getInitialDraft(t);this._activeDraft.set(a),a&&this.userDraftInput$.next(a)}resetToBlankDraft(){this.cancelPendingDraftSync$.next();let e=this.catalogManagement.activeCatalog(),t=this.getActiveProtocolVersion(),r=t===`v1.0`?S:v,a=e&&j$(e)||r;this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.previousCatalogId=a;let s=this.getStrategy(t).getBlankDraft(a);this._activeDraft.set(s),this.sessionResetNonce.update(i=>i+1),this.syncLayoutToHistory(s)}handleProtocolVersionChange(e){if(!this.hasReceivedCatalogResponse()||this.isDraftEdited)return;let t=this._activeDraft(),r=this.getStrategy(e),a=this.catalogManagement.activeCatalog(),n=a?.catalogId||a?.$id||``;if(n===v&&e===`v1.0`?n=S:n===S&&e===`v0.9`&&(n=v),it(t)){let s=r.getStarterDraft(n);s!==t&&(this._activeDraft.set(s),this.userDraftInput$.next(s))}else if(ct(t)){let s=r.getBlankDraft(n||void 0);s!==t&&(this._activeDraft.set(s),this.userDraftInput$.next(s))}}getStrategy(e){return(e??this.getActiveProtocolVersion())===`v1.0`?this.v10Strategy:this.v09Strategy}getActiveProtocolVersion(){return this.catalogManagement.activeProtocolVersion()}hasReceivedCatalogResponse(){return this.catalogManagement.hasReceivedCatalogResponse()}getInitialDraft(e){let t=this.startupConfigState.activeRenderer();if(t?.samplePayload)return t.samplePayload;if(!e)return``;let r=this.getActiveProtocolVersion(),a=this.getStrategy(r);return e===v||e===S||e===`https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json`?a.getStarterDraft(e):a.getBlankDraft(e)}syncLayoutToHistory(e){if(e!==this._activeDraft())return;let t=this.sanitizeLayout(e);if(!t)return;let r=this.chatState.chatHistory();if(r.length>0&&t===this.lastSynchronizedLayout)return;if(this.lastSynchronizedLayout=t,r.length===0){this.chatState.setChatHistory([{role:`user`,content:t,isSnapshot:!0}]);return}let a=r[r.length-1];if(this.chatCleaner.isUserLayoutSnapshot(a)){let s=[...r];s[s.length-1]={role:`user`,content:t,isSnapshot:!0},this.chatState.setChatHistory(s)}else this.chatState.updateChatHistory(s=>[...s,{role:`user`,content:t,isSnapshot:!0}])}sanitizeLayout(e){let t=e.trim();if(!t)return``;let r=u(t);if(r.success?VF(r.data)===`v1.0`:/"version"\s*:\s*"v?1\.0"/i.test(t)){let s=this.v10Strategy.sanitizeLayout(t);return s||this.logger.warn(`Discarding malformed layout JSON during sanitization: not a valid JSON array`),s}let n=this.getStrategy().sanitizeLayout(t);return n||this.logger.warn(`Discarding malformed layout JSON during sanitization: not a valid JSON array`),n}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};var At=(t=>(t.ORIGIN=`origin`,t.THEME=`theme`,t))(At||{});export{et as a,u as c,z as d,V as i,ut as l,B as n,kt as o,Nt as r,rt as s,At as t,wt as u};