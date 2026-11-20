import{i as u,n as s,t as r}from"./chunk-DarCEgGK.js";import{Ea as wn,Ht as Lt$1,Ji as pe,Pr as b$1,Qn as VHe,Rr as by,Vt as Le$1,Xn as V$,Z as Ft$1,Zn as VC,_r as Ys,b as Bt,da as te,kt as K9,vt as Ia,wt as JF,xn as Qt,xt as Is}from"./chunk-K3EcpCtk.js";function T(a,e){let t=Math.max(0,Math.min(e,a.length)),r=a.slice(0,t).split(`
`);return{line:r.length,column:r[r.length-1].length+1}}function ht(a,e){let t=0,r=a.length,o=[],n=`value`;function i(){for(;t<r&&(a[t]===` `||a[t]===`	`||a[t]===`
`||a[t]===`\r`);)t++}function s(){if(a[t]!==`"`)return!1;for(t++;t<r;)if(a[t]===`\\`)t+=2;else{if(a[t]===`"`)return t++,!0;t++}return!0}function l(){let c=t;if(a[t]===`-`&&t++,t<r&&a[t]>=`0`&&a[t]<=`9`){for(;t<r&&a[t]>=`0`&&a[t]<=`9`;)t++;if(t<r&&a[t]===`.`)for(t++;t<r&&a[t]>=`0`&&a[t]<=`9`;)t++;if(t<r&&(a[t]===`e`||a[t]===`E`))for(t++,t<r&&(a[t]===`+`||a[t]===`-`)&&t++;t<r&&a[t]>=`0`&&a[t]<=`9`;)t++;return!0}return t=c,!1}function d(){for(let c of[`true`,`false`,`null`])if(a.startsWith(c,t)){let u=a[t+c.length];if(!u||!/[A-Za-z0-9_$]/.test(u))return t+=c.length,!0}return!1}for(;t<r&&(i(),!(t>=r));){let c=t,u=a[t];if(n===`value_or_end`){if(u===`]`&&o[o.length-1]===`[`){t++,o.pop(),n=`after_value`;continue}n=`value`}if(n===`value`)if(u===`{`)t++,o.push(`{`),n=`prop_or_end`;else if(u===`[`)t++,o.push(`[`),n=`value_or_end`;else if(s()||l()||d())n=`after_value`;else return a.startsWith(e,c)?c:-1;else if(n===`prop_or_end`)if(u===`}`)t++,o.pop(),n=`after_value`;else if(s())n=`colon`;else return a.startsWith(e,c)?c:-1;else if(n===`colon`)if(u===`:`)t++,n=`value`;else return a.startsWith(e,c)?c:-1;else if(n===`prop`)if(s())n=`colon`;else return a.startsWith(e,c)?c:-1;else if(n===`after_value`){let X=o[o.length-1];if(X===`{`)if(u===`,`)t++,n=`prop`;else if(u===`}`)t++,o.pop(),n=`after_value`;else return a.startsWith(e,c)?c:-1;else if(X===`[`)if(u===`,`)t++,n=`value`;else if(u===`]`)t++,o.pop(),n=`after_value`;else return a.startsWith(e,c)?c:-1;else return a.startsWith(e,c)?c:-1}}return-1}function it(a,e){let t=a.message,r=t.match(/line (\d+) column (\d+)/i);if(r)return{line:parseInt(r[1],10),column:parseInt(r[2],10)};let o=t.match(/at position (\d+)/i);if(o)return T(e,parseInt(o[1],10));let n=t.match(/^Unexpected token (.+?), (\.\.\.)?"([\s\S]+)"(\.\.\.)? is not valid JSON$/);if(n){let i=n[1].replace(/^'|'$/g,``),s=!!n[2],l=n[3],d=!!n[4],c=e;if(s){if(l.startsWith(i,10)){let u=d?c.indexOf(l):c.lastIndexOf(l);if(u!==-1)return T(c,u+10)}return{}}else if(d&&l.length>=10&&l.startsWith(i,l.length-10)){let u=c.indexOf(l);if(u!==-1)return T(c,u+l.length-10)}else{let u=ht(c,i);if(u!==-1)return T(c,u)}}return{}}function f(a){if(a==null)return{success:!1,data:null,error:{message:`Content is null or undefined`}};let e=a.trim();if(e.length===0)return{success:!1,data:null,error:{message:`Content is empty`}};let t=null;if(e.startsWith(`[`)&&e.endsWith(`]`))try{let n=JSON.parse(e);if(Array.isArray(n))return{success:!0,data:n}}catch(n){t=n}else if(e.startsWith(`{`)&&e.endsWith(`}`))try{let n=JSON.parse(e);if(n!==null&&typeof n==`object`&&!Array.isArray(n))return{success:!0,data:[n]}}catch(n){t=n}else if(e.startsWith(`{`)||e.startsWith(`[`))try{JSON.parse(e)}catch(n){t=n}let r=e.split(`
`),o=[];for(let n=0;n<r.length;n++){let i=r[n].trim();i.length>0&&o.push({text:i,originalIndex:n})}if(o.length>0){let n=[],i=!0;for(let s of o){if(!s.text.startsWith(`{`)||!s.text.endsWith(`}`)){i=!1;break}try{let l=JSON.parse(s.text);if(l!==null&&typeof l==`object`&&!Array.isArray(l))n.push(l);else{i=!1;break}}catch(l){if(t=l,t instanceof Error){let d=it(t,s.text);return{success:!1,data:null,error:{message:t.message,line:s.originalIndex+1,column:d.column,snippet:r[s.originalIndex]}}}i=!1;break}}if(i)return{success:!0,data:n}}if(t instanceof Error){let n=it(t,a);return{success:!1,data:null,error:{message:t.message,line:n.line,column:n.column,snippet:n.line!==void 0&&n.line>0&&n.line<=r.length?r[n.line-1]:void 0}}}return{success:!1,data:null,error:{message:`Invalid JSON format`}}}function V(a){return a===void 0?``:JSON.stringify(a,null,2)}function Pt(a){return typeof a!=`object`||a===null||Array.isArray(a)?null:a}var F=class a{_chatHistory=Le$1([]);_pipelineStatus=Le$1(`idle`);_isProgrammaticStreamActive=Le$1(!1);_latestLlmLog=Le$1(null);_llmHistory=Le$1([]);chatHistory=this._chatHistory.asReadonly();pipelineStatus=this._pipelineStatus.asReadonly();isProgrammaticStreamActive=this._isProgrammaticStreamActive.asReadonly();latestLlmLog=this._latestLlmLog.asReadonly();llmHistory=this._llmHistory.asReadonly();setChatHistory(e){this._chatHistory.set(e)}updateChatHistory(e){this._chatHistory.update(e)}setPipelineStatus(e){this._pipelineStatus.set(e)}setProgrammaticStreamActive(e){this._isProgrammaticStreamActive.set(e)}addRawLlmLog(e,t){let r={type:e,timestamp:Date.now(),payload:t};this._latestLlmLog.set(r),this._llmHistory.update(o=>[...o,r].slice(-50))}clearRawLlmHistory(){this._latestLlmLog.set(null),this._llmHistory.set([])}static ɵfac=function(t){return new(t||a)};static ɵprov=te({token:a,factory:a.ɵfac,providedIn:`root`})};var Ft=`CancelError`;var jt=`*You stopped this response.*`;var st=class{async chat(e){return{content:await(await this.chatStream(e)).complete,isComplete:!0}}extractXmlThoughts(e){let t=``;return{cleanText:e.replace(/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,(o,n,i)=>(t+=i,``)),totalExtractedThinking:t}}createContentStream(e,t,r){return{[Symbol.asyncIterator](){let o=0;return{async next(){for(;o>=e.length&&!t.isDone&&!t.streamError;)await new Promise((n,i)=>{r.push(()=>{t.streamError?i(t.streamError):n()})});if(o>=e.length&&t.streamError)throw t.streamError;if(o<e.length){let n=e[o];return o++,{value:n,done:!1}}return{value:void 0,done:!0}}}}}}};var lt=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi;var ct=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi;var ut=/\s*●●●\s*$/g;function ft(a){return a.length>0&&a.some(e=>{if(e&&typeof e==`object`&&!Array.isArray(e)){let t=Object.keys(e);return t.includes(`version`)||t.includes(`createSurface`)||t.includes(`updateComponents`)||t.includes(`updateDataModel`)||t.includes(`deleteSurface`)}return!1})}var B=class a{PULSE_INDICATOR=`●●●`;appendPulse(e){return`${e??``} ${this.PULSE_INDICATOR}`}stripPulse(e){return e?(ut.lastIndex=0,e.replace(ut,``).trim()):``}stripThinkingTags(e){return e?(ct.lastIndex=0,e.replace(ct,``).trim()):``}extractCodeFences(e){if(!e)return{extracted:``,hasFences:!1};lt.lastIndex=0;let t=Array.from(e.matchAll(lt));return t.length>0?{extracted:t.map(r=>r[1].trim()).join(`
`),hasFences:!0}:{extracted:e.trim(),hasFences:!1}}cleanPayload(e){if(!e)return``;let t=this.stripPulse(e);if(t=this.stripThinkingTags(t),t=this.extractCodeFences(t).extracted,!t.startsWith(`{`)&&!t.startsWith(`[`)){let o=Array.from(t.matchAll(/[\{\[]/g));for(let n of o)if(n.index!==void 0&&n.index>=0){let i=t.substring(n.index).trim();if(i.startsWith(`{`)&&i.includes(`"version"`)||i.startsWith(`[`)&&/^\[\s*[\{\"]/.test(i)&&(i.includes(`"version"`)||i.includes(`"createSurface"`)||i.includes(`"updateComponents"`))){t=i;break}let s=f(i);if(s.success&&ft(s.data)){t=i;break}}}return t.trim()}isLayoutSnapshot(e){if(!e)return!1;let t=this.cleanPayload(e);if(t.startsWith(`{"version"`)||t.startsWith(`{`)&&t.includes(`"version"`)||t.startsWith(`[`)&&(t.includes(`"version"`)||t.includes(`"createSurface"`)||t.includes(`"updateComponents"`)))return!0;let r=f(t);return r.success&&ft(r.data)}isUserLayoutSnapshot(e){if(!e||e.role!==`user`||e.promptId||e.attachments?.length)return!1;if(e.isSnapshot!==void 0)return e.isSnapshot;let t=typeof e.content==`string`?e.content.trim():``;return(t.startsWith(`[`)||t.startsWith(`{`))&&this.isLayoutSnapshot(t)}static ɵfac=function(t){return new(t||a)};static ɵprov=te({token:a,factory:a.ɵfac,providedIn:`root`})};var S=`https://a2ui.org/specification/v0_9/basic_catalog.json`;var R=`https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`;var _=`[
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
`;function dt(a){let e=a.trim();if(!e)return!1;if(e===_.trim()||e===b.trim())return!0;let t=f(e);if(!t.success)return!1;let r=JSON.stringify(t.data),o=f(_);if(o.success&&JSON.stringify(o.data)===r)return!0;let n=f(b);return!!(n.success&&JSON.stringify(n.data)===r)}function pt(a){let e=a.trim();if(!e)return!1;let t=f(e);if(!t.success||t.data.length!==1)return!1;let r=t.data[0];if(!r||typeof r!=`object`||Array.isArray(r))return!1;let n=r.createSurface;if(!n||typeof n!=`object`||Array.isArray(n))return!1;let i=n;return!(typeof i.surfaceId!=`string`||Array.isArray(i.components)&&i.components.length>0||i.dataModel&&typeof i.dataModel==`object`&&Object.keys(i.dataModel).length>0)}var St=`registerMockRules`;var Rt=`mockRulesConfig`;var L=`updateComponents`;var P=`updateDataModel`;var $=`components`;var At=`rules`;var _t=`id`;var bt=`children`;var gt=`mock_rules_container`;var O=class a{version=`v0.9`;getStarterDraft(e){return _}getBlankDraft(e,t=`sample-surface`){return V([{version:`v0.9`,createSurface:{surfaceId:t,catalogId:e||S,sendDataModel:!0}}])}isStarterDraft(e){let t=e.trim();if(!t)return!1;if(t===_.trim())return!0;let r=f(t);if(!r.success)return!1;let o=f(_);return o.success?JSON.stringify(r.data)===JSON.stringify(o.data):!1}isBlankDraft(e){let t=e.trim();if(!t)return!1;let r=f(t);if(!r.success||r.data.length!==1)return!1;let o=r.data[0];if(!o||typeof o!=`object`||Array.isArray(o))return!1;let n=o;if(n.version!==`v0.9`&&n.version!==`0.9`)return!1;let i=n.createSurface;if(!i||typeof i!=`object`||Array.isArray(i))return!1;let s=i;return!(typeof s.surfaceId!=`string`||`components`in s||`dataModel`in s)}sanitizeLayout(e){return K(e,t=>this.sanitizeBlock(t))}sanitizeBlock(e){if(e[St]||e[Rt])return null;let t={};for(let[r,o]of Object.entries(e))M(r)||(t[r]=o);if(t[L]&&typeof t[L]==`object`&&t[L]!==null){let r$1=r({},t[L]);if(Array.isArray(r$1[$]))r$1[$]=r$1[$].filter(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?n[_t]!==gt:!0).map(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?w(n):n);t[L]=r$1}return t[P]&&typeof t[P]==`object`&&t[P]!==null&&(t[P]=A(t[P])),Object.keys(t).length===0?null:t}static ɵfac=function(t){return new(t||a)};static ɵprov=te({token:a,factory:a.ɵfac,providedIn:`root`})};function M(a){return a===`__proto__`||a===`constructor`||a===`prototype`}function A(a,e=[]){let t={};for(let[r,o]of Object.entries(a))e.includes(r)||M(r)||(o!==null&&typeof o==`object`&&!Array.isArray(o)?t[r]=A(o):Array.isArray(o)?t[r]=o.map(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?A(n):n):t[r]=o);return t}function w(a){let e={};for(let[t,r]of Object.entries(a))M(t)||t===At||/^mock/i.test(t)||(t===bt&&Array.isArray(r)?e[t]=r.filter(o=>o!==gt):r!==null&&typeof r==`object`&&!Array.isArray(r)?e[t]=w(r):Array.isArray(r)?e[t]=r.map(o=>o!==null&&typeof o==`object`&&!Array.isArray(o)?w(o):o):e[t]=r);return e}var kt=new O;function K(a,e){let t=a.trim();if(!t)return``;let r=f(t);if(!r.success)return``;let o=e??(i=>kt.sanitizeBlock(i)),n=r.data.map(i=>i&&typeof i==`object`&&!Array.isArray(i)?o(i):i).filter(i=>i!==null);return n.length>0?JSON.stringify(n):``}var Dt=`registerMockRules`;var It=`mockRulesConfig`;var D=`createSurface`;var x=`updateComponents`;var N=`updateDataModel`;var y=`components`;var v=`dataModel`;var Et=`id`;var Ct=`mock_rules_container`;var z=class a{version=`v1.0`;getStarterDraft(e){return b}getBlankDraft(e,t=`sample-surface`){return V([{version:`1.0`,createSurface:{surfaceId:t,catalogId:e||R}}])}isStarterDraft(e){let t=e.trim();if(!t)return!1;if(t===b.trim())return!0;let r$2=f(t);if(!r$2.success)return!1;let o=f(b);if(!o.success)return!1;let n=i=>i.map(s=>{if(s&&typeof s==`object`&&!Array.isArray(s)){let l=r({},s);return(l.version===`v1.0`||l.version===`1.0`)&&(l.version=`1.0`),l}return s});return JSON.stringify(n(r$2.data))===JSON.stringify(n(o.data))}isBlankDraft(e){let t=e.trim();if(!t)return!1;let r=f(t);if(!r.success||r.data.length!==1)return!1;let o=r.data[0];if(!o||typeof o!=`object`||Array.isArray(o))return!1;let n=o;if(n.version!==`v1.0`&&n.version!==`1.0`)return!1;let i=n[D];if(!i||typeof i!=`object`||Array.isArray(i))return!1;let s=i;return!(typeof s.surfaceId!=`string`||Array.isArray(s[y])&&s[y].length>0||s[v]&&typeof s[v]==`object`&&Object.keys(s[v]).length>0)}sanitizeLayout(e){return K(e,t=>this.sanitizeBlock(t))}sanitizeBlock(e){if(e[Dt]||e[It])return null;let t={};for(let[r,o]of Object.entries(e))M(r)||(t[r]=o);if(t[D]&&typeof t[D]==`object`&&t[D]!==null){let r$3=r({},t[D]),o=Array.isArray(r$3[y])?this.sanitizeComponentsList(r$3[y]):void 0,n=r$3[v]&&typeof r$3[v]==`object`&&r$3[v]!==null?A(r$3[v]):void 0,i=A(r$3,[y,v]);o!==void 0&&(i[y]=o),n!==void 0&&(i[v]=n),t[D]=i}if(t[x]&&typeof t[x]==`object`&&t[x]!==null){let r$4=r({},t[x]),o=Array.isArray(r$4[y])?this.sanitizeComponentsList(r$4[y]):void 0,n=A(r$4,[y]);o!==void 0&&(n[y]=o),t[x]=n}return t[N]&&typeof t[N]==`object`&&t[N]!==null&&(t[N]=A(t[N])),Object.keys(t).length===0?null:t}sanitizeComponentsList(e){return e.filter(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?r[Et]!==Ct:!0).map(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?w(r):r)}static ɵfac=function(t){return new(t||a)};static ɵprov=te({token:a,factory:a.ɵfac,providedIn:`root`})};var yt=class a{destroyRef=b$1(Lt$1);chatState=b$1(F);chatCleaner=b$1(B);catalogManagement=b$1(K9);startupConfigState=b$1(by);logger=b$1(wn).withTag(`[StateSync]`);v09Strategy=b$1(O);v10Strategy=b$1(z);previousCatalogId=null;isDraftEdited=!1;lastSynchronizedLayout=null;lastSamplePayload=null;_activeDraft=Le$1(``);activeDraft=this._activeDraft.asReadonly();sessionResetNonce=Le$1(0);userDraftInput$=new pe;cancelPendingDraftSync$=new pe;constructor(){let e=this.catalogManagement.activeCatalog();VHe(this.catalogManagement.activeCatalog).pipe(V$(this.destroyRef)).subscribe(r=>{let o=e!==null&&r===null;e=r,(r||o)&&this.syncCatalogDraft()}),VHe(this.catalogManagement.activeProtocolVersion).pipe(V$(this.destroyRef)).subscribe(r=>{this.handleProtocolVersionChange(r)}),VHe(this.catalogManagement.hasReceivedCatalogResponse).pipe(Ft$1(r=>r),V$(this.destroyRef)).subscribe(()=>{this.syncCatalogDraft()}),(this.startupConfigState.sharedA2uiPayload?VHe(this.startupConfigState.sharedA2uiPayload):Qt(null)).pipe(Ft$1(r=>!!r),V$(this.destroyRef)).subscribe(r=>{this.injectExternalDraft(r)}),this.userDraftInput$.pipe(VC(r=>Ia(300).pipe(Bt(()=>r),Is(this.cancelPendingDraftSync$))),V$(this.destroyRef)).subscribe(r=>{this.chatState.isProgrammaticStreamActive()||this.syncLayoutToHistory(r)})}updateDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}injectExternalDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}syncActiveDraftToHistory(){this.syncLayoutToHistory(this._activeDraft())}hasEditedDraft(){return this.isDraftEdited}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(e){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!0,this.lastSynchronizedLayout=this.sanitizeLayout(e)||null,this._activeDraft.set(e)}flushDraft(){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.lastSamplePayload=null,this.previousCatalogId=null;let e=this.catalogManagement.activeCatalog(),t=e&&Ys(e)||``;!this.startupConfigState.activeRenderer()?.samplePayload&&!t&&(t=this.catalogManagement.activeProtocolVersion()===`v1.0`?R:S),this.applyInitialDraft(t,!1)}resetToBlankDraft(){this.cancelPendingDraftSync$.next();let e=this.catalogManagement.activeCatalog(),t=this.catalogManagement.activeProtocolVersion(),r=t===`v1.0`?R:S,o=e&&Ys(e)||r;this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.lastSamplePayload=null,this.previousCatalogId=o;let i=this.getStrategy(t).getBlankDraft(o);this._activeDraft.set(i),this.sessionResetNonce.update(s=>s+1),this.syncLayoutToHistory(i)}syncCatalogDraft(){let e=this.catalogManagement.activeCatalog();if(e){let t=Ys(e)||``,r=this.previousCatalogId===null,o=this.previousCatalogId!==null&&this.previousCatalogId!==t;(r||o)&&!this.isDraftEdited&&this.applyInitialDraft(t),this.previousCatalogId=t}else this.previousCatalogId=null;this.catalogManagement.hasReceivedCatalogResponse()&&this.handleProtocolVersionChange(this.catalogManagement.activeProtocolVersion())}applyInitialDraft(e,t=!0){let r=this.getInitialDraft(e);this._activeDraft.set(r),(r||t)&&this.userDraftInput$.next(r)}handleProtocolVersionChange(e){if(!this.catalogManagement.hasReceivedCatalogResponse()||this.isDraftEdited)return;let t=this._activeDraft(),r=this.getStrategy(e),o=this.catalogManagement.activeCatalog(),n=o&&Ys(o)||``;n===S&&e===`v1.0`?n=R:n===R&&e===`v0.9`&&(n=S);let i=this.startupConfigState.activeRenderer()?.samplePayload;if(this.lastSamplePayload!==null&&t===this.lastSamplePayload){i!==t&&this.applyInitialDraft(n);return}if(t===``&&i){this.applyInitialDraft(n);return}if(dt(t)){let s=r.getStarterDraft(n);s!==t&&(this._activeDraft.set(s),this.userDraftInput$.next(s))}else if(pt(t)){let s=r.getBlankDraft(n||void 0);s!==t&&(this._activeDraft.set(s),this.userDraftInput$.next(s))}}getStrategy(e){return(e??this.catalogManagement.activeProtocolVersion())===`v1.0`?this.v10Strategy:this.v09Strategy}getInitialDraft(e){let t=this.startupConfigState.activeRenderer();if(t?.samplePayload)return this.lastSamplePayload=t.samplePayload,t.samplePayload;if(this.lastSamplePayload=null,!e)return``;let r=this.catalogManagement.activeProtocolVersion(),o=this.getStrategy(r);return e===S||e===R||e===`https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json`?o.getStarterDraft(e):o.getBlankDraft(e)}syncLayoutToHistory(e){if(e!==this._activeDraft())return;let t=this.sanitizeLayout(e);if(!t)return;let r=this.chatState.chatHistory();if(r.length>0&&t===this.lastSynchronizedLayout)return;if(this.lastSynchronizedLayout=t,r.length===0){this.chatState.setChatHistory([{role:`user`,content:t,isSnapshot:!0}]);return}let o=r[r.length-1];if(this.chatCleaner.isUserLayoutSnapshot(o)){let i=[...r];i[i.length-1]={role:`user`,content:t,isSnapshot:!0},this.chatState.setChatHistory(i)}else this.chatState.updateChatHistory(i=>[...i,{role:`user`,content:t,isSnapshot:!0}])}sanitizeLayout(e){let t=e.trim();if(!t)return``;let r=f(t);if(r.success?JF(r.data)===`v1.0`:/"version"\s*:\s*"v?1\.0"/i.test(t)){let i=this.v10Strategy.sanitizeLayout(t);return i||this.logger.warn(`Discarding malformed layout JSON during sanitization: not a valid JSON array`),i}let n=this.getStrategy().sanitizeLayout(t);return n||this.logger.warn(`Discarding malformed layout JSON during sanitization: not a valid JSON array`),n}static ɵfac=function(t){return new(t||a)};static ɵprov=te({token:a,factory:a.ɵfac,providedIn:`root`})};function ke(a,e){if(!Array.isArray(a)||a.length===0)return{valid:!0};for(let t of a){if(!t||typeof t!=`object`||Array.isArray(t))continue;let r=mt(t);if(r&&r!==e)return{valid:!1,code:`PROTOCOL_VERSION_MISMATCH`,detectedVersion:r,expectedVersion:e,message:`Payload protocol version ${r} does not match active renderer protocol version ${e}.`}}return{valid:!0}}function De(a){if(!Array.isArray(a)||a.length===0)return null;for(let e of a){if(!e||typeof e!=`object`||Array.isArray(e))continue;let t=mt(e);if(t)return t}return null}function mt(a){if(typeof a.version==`string`){let t=a.version.trim();if(t===`v1.0`||t===`1.0`)return`v1.0`;if(t===`v0.9`||t===`0.9`)return`v0.9`}if(a.callRendererFunction!==void 0||a.agentFunctionResponse!==void 0||a.callAgentFunctionResponse!==void 0)return`v1.0`;if(a.createSurface&&typeof a.createSurface==`object`&&!Array.isArray(a.createSurface)){let t=a.createSurface;if(typeof t.catalogId==`string`&&(t.catalogId.includes(`v1_0`)||t.catalogId.includes(`v1.0`))||Array.isArray(t.components)&&t.components.length>0||t.dataModel&&typeof t.dataModel==`object`&&!Array.isArray(t.dataModel)&&Object.keys(t.dataModel).length>0)return`v1.0`;if(t.theme!==void 0)return`v0.9`}return U(a)||(a.beginRendering!==void 0?`v0.9`:null)}function U(a){if(!a||typeof a!=`object`)return null;if(Array.isArray(a)){for(let t of a){let r=U(t);if(r)return r}return null}let e=a;if(`@path`in e||`@call`in e)return`v1.0`;if(typeof e.path==`string`&&Object.keys(e).length===1||typeof e.call==`string`&&`returnType`in e)return`v0.9`;for(let[t,r]of Object.entries(e)){if(t===`__proto__`||t===`constructor`||t===`prototype`||t===`dataModel`)continue;if(t===`updateDataModel`&&r&&typeof r==`object`&&!Array.isArray(r)){let n=r;for(let[i,s]of Object.entries(n))if(i!==`value`){let l=U(s);if(l)return l}continue}let o=U(r);if(o)return o}return null}function Le(a,e){return{version:`1.0`,agentFunctionResponse:`error`in e?{functionCallId:a,error:e.error}:{functionCallId:a,value:e.value}}}function J(a){return a!==null&&typeof a==`object`&&!Array.isArray(a)}function Pe(a){let e=r({},a);if(`callAgentFunctionResponse`in e){let i=e.callAgentFunctionResponse,t=e,{callAgentFunctionResponse:s}=t;e=u(t,[`callAgentFunctionResponse`]),e.agentFunctionResponse===void 0&&i!==void 0&&(e.agentFunctionResponse=i)}if(J(e.agentFunctionResponse)){let i=e.agentFunctionResponse;if(`result`in i){let r=i,{result:s}=r,l=u(r,[`result`]);l.value===void 0&&l.error===void 0&&(l.value=s),e.agentFunctionResponse=l}}if(J(e.callRendererFunction)){let i=e.callRendererFunction;if(i.call!==void 0&&!J(i.callFunction)){let o=i,{call:s$1,args:l,catalogId:d}=o,c=u(o,[`call`,`args`,`catalogId`]),u$1={"@call":String(s$1)};l!==void 0&&(u$1.args=l),d!==void 0&&(u$1.catalogId=d),e.callRendererFunction=s(r({},c),{callFunction:u$1})}else if(J(i.callFunction)){let n=i,{catalogId:s$2}=n,l=u(n,[`catalogId`]),d=r({},i.callFunction);d.call!==void 0&&!d[`@call`]&&(d[`@call`]=String(d.call),delete d.call),s$2!==void 0&&d.catalogId===void 0&&(d.catalogId=s$2),e.callRendererFunction=s(r({},l),{callFunction:d})}}return e}var Lt=(t=>(t.ORIGIN=`origin`,t.THEME=`theme`,t))(Lt||{});export{Le as a,Pt as c,it as d,jt as f,yt as h,Ft as i,V as l,st as m,De as n,Lt as o,ke as p,F as r,Pe as s,B as t,f as u};