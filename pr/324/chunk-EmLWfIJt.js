import{i as u,n as s,t as r}from"./chunk-DarCEgGK.js";import{Bi as pe,Ea as wn,Fn as UC,G as FHe,Ka as zt,Ot as Lt$1,Q as GF,Tt as Le$1,Vn as V9,Y as Ft$1,b as C$1,ia as te,k as Da,mt as Is,t as $$,y as Bt,ya as vy,zn as V$}from"./chunk-C07PHo16.js";function V(o,e){let t=Math.max(0,Math.min(e,o.length)),r=o.slice(0,t).split(`
`);return{line:r.length,column:r[r.length-1].length+1}}function mt(o,e){let t=0,r=o.length,a=[],n=`value`;function i(){for(;t<r&&(o[t]===` `||o[t]===`	`||o[t]===`
`||o[t]===`\r`);)t++}function s(){if(o[t]!==`"`)return!1;for(t++;t<r;)if(o[t]===`\\`)t+=2;else{if(o[t]===`"`)return t++,!0;t++}return!0}function c(){let l=t;if(o[t]===`-`&&t++,t<r&&o[t]>=`0`&&o[t]<=`9`){for(;t<r&&o[t]>=`0`&&o[t]<=`9`;)t++;if(t<r&&o[t]===`.`)for(t++;t<r&&o[t]>=`0`&&o[t]<=`9`;)t++;if(t<r&&(o[t]===`e`||o[t]===`E`))for(t++,t<r&&(o[t]===`+`||o[t]===`-`)&&t++;t<r&&o[t]>=`0`&&o[t]<=`9`;)t++;return!0}return t=l,!1}for(;t<r&&(i(),!(t>=r));){let l=t,u=o[t];if(n===`value_or_end`){if(u===`]`&&a[a.length-1]===`[`){t++,a.pop(),n=`after_value`;continue}n=`value`}if(n===`value`)if(u===`{`)t++,a.push(`{`),n=`prop_or_end`;else if(u===`[`)t++,a.push(`[`),n=`value_or_end`;else if(s()||c()||o.startsWith(`true`,t)||o.startsWith(`false`,t)||o.startsWith(`null`,t))o.startsWith(`true`,l)?t+=4:o.startsWith(`false`,l)?t+=5:o.startsWith(`null`,l)&&(t+=4),n=`after_value`;else return o.startsWith(e,l)?l:-1;else if(n===`prop_or_end`)if(u===`}`)t++,a.pop(),n=`after_value`;else if(s())n=`colon`;else return o.startsWith(e,l)?l:-1;else if(n===`colon`)if(u===`:`)t++,n=`value`;else return o.startsWith(e,l)?l:-1;else if(n===`prop`)if(s())n=`colon`;else return o.startsWith(e,l)?l:-1;else if(n===`after_value`){let d=a[a.length-1];if(d===`{`)if(u===`,`)t++,n=`prop`;else if(u===`}`)t++,a.pop(),n=`after_value`;else return o.startsWith(e,l)?l:-1;else if(d===`[`)if(u===`,`)t++,n=`value`;else if(u===`]`)t++,a.pop(),n=`after_value`;else return o.startsWith(e,l)?l:-1;else return o.startsWith(e,l)?l:-1}}return-1}function at(o,e){let t=o.message,r=t.match(/line (\d+) column (\d+)/i);if(r)return{line:parseInt(r[1],10),column:parseInt(r[2],10)};let a=t.match(/at position (\d+)/i);if(a)return V(e,parseInt(a[1],10));let n=t.match(/^Unexpected token (.+?), (\.\.\.)?"([\s\S]+)"(\.\.\.)? is not valid JSON$/);if(n){let i=n[1].replace(/^'|'$/g,``),s=!!n[2],c=n[3],l=!!n[4],u=e;if(s){if(c.startsWith(i,10)){let d=l?u.indexOf(c):u.lastIndexOf(c);if(d!==-1)return V(u,d+10)}return{}}else if(l&&c.length>=10&&c.startsWith(i,c.length-10)){let d=u.indexOf(c);if(d!==-1)return V(u,d+c.length-10)}else{let d=mt(u,i);if(d!==-1)return V(u,d)}}return{}}function f(o){if(o==null)return{success:!1,data:null,error:{message:`Content is null or undefined`}};let e=o.trim();if(e.length===0)return{success:!1,data:null,error:{message:`Content is empty`}};let t=null;if(e.startsWith(`[`)&&e.endsWith(`]`))try{let n=JSON.parse(e);if(Array.isArray(n))return{success:!0,data:n}}catch(n){t=n}else if(e.startsWith(`{`)&&e.endsWith(`}`))try{let n=JSON.parse(e);if(n!==null&&typeof n==`object`&&!Array.isArray(n))return{success:!0,data:[n]}}catch(n){t=n}else if(e.startsWith(`{`)||e.startsWith(`[`))try{JSON.parse(e)}catch(n){t=n}let r=e.split(`
`),a=[];for(let n=0;n<r.length;n++){let i=r[n].trim();i.length>0&&a.push({text:i,originalIndex:n})}if(a.length>0){let n=[],i=!0;for(let s of a){if(!s.text.startsWith(`{`)||!s.text.endsWith(`}`)){i=!1;break}try{let c=JSON.parse(s.text);if(c!==null&&typeof c==`object`&&!Array.isArray(c))n.push(c);else{i=!1;break}}catch(c){if(t=c,t instanceof Error){let l=at(t,s.text);return{success:!1,data:null,error:{message:t.message,line:s.originalIndex+1,column:l.column,snippet:r[s.originalIndex]}}}i=!1;break}}if(i)return{success:!0,data:n}}if(t instanceof Error){let n=at(t,o);return{success:!1,data:null,error:{message:t.message,line:n.line,column:n.column,snippet:n.line!==void 0&&n.line>0&&n.line<=r.length?r[n.line-1]:void 0}}}return{success:!1,data:null,error:{message:`Invalid JSON format`}}}function F(o){return o===void 0?``:JSON.stringify(o,null,2)}function Lt(o){return typeof o!=`object`||o===null||Array.isArray(o)?null:o}var j=class o{_chatHistory=Le$1([]);_pipelineStatus=Le$1(`idle`);_isProgrammaticStreamActive=Le$1(!1);_latestLlmLog=Le$1(null);_llmHistory=Le$1([]);chatHistory=this._chatHistory.asReadonly();pipelineStatus=this._pipelineStatus.asReadonly();isProgrammaticStreamActive=this._isProgrammaticStreamActive.asReadonly();latestLlmLog=this._latestLlmLog.asReadonly();llmHistory=this._llmHistory.asReadonly();setChatHistory(e){this._chatHistory.set(e)}updateChatHistory(e){this._chatHistory.update(e)}setPipelineStatus(e){this._pipelineStatus.set(e)}setProgrammaticStreamActive(e){this._isProgrammaticStreamActive.set(e)}addRawLlmLog(e,t){let r={type:e,timestamp:Date.now(),payload:t};this._latestLlmLog.set(r),this._llmHistory.update(a=>[...a,r].slice(-50))}clearRawLlmHistory(){this._latestLlmLog.set(null),this._llmHistory.set([])}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};var Vt=`CancelError`;var Ft=`*You stopped this response.*`;var it=class{async chat(e){return{content:await(await this.chatStream(e)).complete,isComplete:!0}}extractXmlThoughts(e){let t=``;return{cleanText:e.replace(/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,(a,n,i)=>(t+=i,``)),totalExtractedThinking:t}}createContentStream(e,t,r){return{[Symbol.asyncIterator](){let a=0;return{async next(){for(;a>=e.length&&!t.isDone&&!t.streamError;)await new Promise((n,i)=>{r.push(()=>{t.streamError?i(t.streamError):n()})});if(a>=e.length&&t.streamError)throw t.streamError;if(a<e.length){let n=e[a];return a++,{value:n,done:!1}}return{value:void 0,done:!0}}}}}}};var st=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi;var ct=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi;var lt=/\s*●●●\s*$/g;function ut(o){return o.length>0&&o.some(e=>{if(e&&typeof e==`object`&&!Array.isArray(e)){let t=Object.keys(e);return t.includes(`version`)||t.includes(`createSurface`)||t.includes(`updateComponents`)||t.includes(`updateDataModel`)||t.includes(`deleteSurface`)}return!1})}var z=class o{PULSE_INDICATOR=`●●●`;appendPulse(e){return`${e??``} ${this.PULSE_INDICATOR}`}stripPulse(e){return e?(lt.lastIndex=0,e.replace(lt,``).trim()):``}stripThinkingTags(e){return e?(ct.lastIndex=0,e.replace(ct,``).trim()):``}extractCodeFences(e){if(!e)return{extracted:``,hasFences:!1};st.lastIndex=0;let t=Array.from(e.matchAll(st));return t.length>0?{extracted:t.map(r=>r[1].trim()).join(`
`),hasFences:!0}:{extracted:e.trim(),hasFences:!1}}cleanPayload(e){if(!e)return``;let t=this.stripPulse(e);if(t=this.stripThinkingTags(t),t=this.extractCodeFences(t).extracted,!t.startsWith(`{`)&&!t.startsWith(`[`)){let a=Array.from(t.matchAll(/[\{\[]/g));for(let n of a)if(n.index!==void 0&&n.index>=0){let i=t.substring(n.index).trim();if(i.startsWith(`{`)&&i.includes(`"version"`)||i.startsWith(`[`)&&/^\[\s*[\{\"]/.test(i)&&(i.includes(`"version"`)||i.includes(`"createSurface"`)||i.includes(`"updateComponents"`))){t=i;break}let s=f(i);if(s.success&&ut(s.data)){t=i;break}}}return t.trim()}isLayoutSnapshot(e){if(!e)return!1;let t=this.cleanPayload(e);if(t.startsWith(`{"version"`)||t.startsWith(`{`)&&t.includes(`"version"`)||t.startsWith(`[`)&&(t.includes(`"version"`)||t.includes(`"createSurface"`)||t.includes(`"updateComponents"`)))return!0;let r=f(t);return r.success&&ut(r.data)}isUserLayoutSnapshot(e){if(!e||e.role!==`user`||e.promptId||e.attachments?.length)return!1;if(e.isSnapshot!==void 0)return e.isSnapshot;let t=typeof e.content==`string`?e.content.trim():``;return(t.startsWith(`[`)||t.startsWith(`{`))&&this.isLayoutSnapshot(t)}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};var R=`https://a2ui.org/specification/v0_9/basic_catalog.json`;var A=`https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`;var _=`[
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
`;function ft(o){let e=o.trim();if(!e)return!1;if(e===_.trim()||e===b.trim())return!0;let t=f(e);if(!t.success)return!1;let r=JSON.stringify(t.data),a=f(_);if(a.success&&JSON.stringify(a.data)===r)return!0;let n=f(b);return!!(n.success&&JSON.stringify(n.data)===r)}function dt(o){let e=o.trim();if(!e)return!1;let t=f(e);if(!t.success||t.data.length!==1)return!1;let r=t.data[0];if(!r||typeof r!=`object`||Array.isArray(r))return!1;let n=r.createSurface;if(!n||typeof n!=`object`||Array.isArray(n))return!1;let i=n;return!(typeof i.surfaceId!=`string`||Array.isArray(i.components)&&i.components.length>0||i.dataModel&&typeof i.dataModel==`object`&&Object.keys(i.dataModel).length>0)}var vt=`registerMockRules`;var Rt=`mockRulesConfig`;var C=`updateComponents`;var L=`updateDataModel`;var $=`components`;var At=`rules`;var St=`id`;var _t=`children`;var pt=`mock_rules_container`;var O=class o{version=`v0.9`;getStarterDraft(e){return _}getBlankDraft(e,t=`sample-surface`){return F([{version:`v0.9`,createSurface:{surfaceId:t,catalogId:e||R,sendDataModel:!0}}])}isStarterDraft(e){let t=e.trim();if(!t)return!1;if(t===_.trim())return!0;let r=f(t);if(!r.success)return!1;let a=f(_);return a.success?JSON.stringify(r.data)===JSON.stringify(a.data):!1}isBlankDraft(e){let t=e.trim();if(!t)return!1;let r=f(t);if(!r.success||r.data.length!==1)return!1;let a=r.data[0];if(!a||typeof a!=`object`||Array.isArray(a))return!1;let n=a;if(n.version!==`v0.9`&&n.version!==`0.9`)return!1;let i=n.createSurface;if(!i||typeof i!=`object`||Array.isArray(i))return!1;let s=i;return!(typeof s.surfaceId!=`string`||`components`in s||`dataModel`in s)}sanitizeLayout(e){return K(e,t=>this.sanitizeBlock(t))}sanitizeBlock(e){if(e[vt]||e[Rt])return null;let t={};for(let[r,a]of Object.entries(e))w(r)||(t[r]=a);if(t[C]&&typeof t[C]==`object`&&t[C]!==null){let r$1=r({},t[C]);if(Array.isArray(r$1[$]))r$1[$]=r$1[$].filter(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?n[St]!==pt:!0).map(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?P(n):n);t[C]=r$1}return t[L]&&typeof t[L]==`object`&&t[L]!==null&&(t[L]=S(t[L])),Object.keys(t).length===0?null:t}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};function w(o){return o===`__proto__`||o===`constructor`||o===`prototype`}function S(o,e=[]){let t={};for(let[r,a]of Object.entries(o))e.includes(r)||w(r)||(a!==null&&typeof a==`object`&&!Array.isArray(a)?t[r]=S(a):Array.isArray(a)?t[r]=a.map(n=>n!==null&&typeof n==`object`&&!Array.isArray(n)?S(n):n):t[r]=a);return t}function P(o){let e={};for(let[t,r]of Object.entries(o))w(t)||t===At||/^mock/i.test(t)||(t===_t&&Array.isArray(r)?e[t]=r.filter(a=>a!==pt):r!==null&&typeof r==`object`&&!Array.isArray(r)?e[t]=P(r):Array.isArray(r)?e[t]=r.map(a=>a!==null&&typeof a==`object`&&!Array.isArray(a)?P(a):a):e[t]=r);return e}var bt=new O;function K(o,e){let t=o.trim();if(!t)return``;let r=f(t);if(!r.success)return``;let a=e??(i=>bt.sanitizeBlock(i)),n=r.data.map(i=>i&&typeof i==`object`&&!Array.isArray(i)?a(i):i).filter(i=>i!==null);return n.length>0?JSON.stringify(n):``}var kt=`registerMockRules`;var Dt=`mockRulesConfig`;var D=`createSurface`;var M=`updateComponents`;var x=`updateDataModel`;var y=`components`;var v=`dataModel`;var It=`id`;var Et=`mock_rules_container`;var U=class o{version=`v1.0`;getStarterDraft(e){return b}getBlankDraft(e,t=`sample-surface`){return F([{version:`1.0`,createSurface:{surfaceId:t,catalogId:e||A}}])}isStarterDraft(e){let t=e.trim();if(!t)return!1;if(t===b.trim())return!0;let r$2=f(t);if(!r$2.success)return!1;let a=f(b);if(!a.success)return!1;let n=i=>i.map(s=>{if(s&&typeof s==`object`&&!Array.isArray(s)){let c=r({},s);return(c.version===`v1.0`||c.version===`1.0`)&&(c.version=`1.0`),c}return s});return JSON.stringify(n(r$2.data))===JSON.stringify(n(a.data))}isBlankDraft(e){let t=e.trim();if(!t)return!1;let r=f(t);if(!r.success||r.data.length!==1)return!1;let a=r.data[0];if(!a||typeof a!=`object`||Array.isArray(a))return!1;let n=a;if(n.version!==`v1.0`&&n.version!==`1.0`)return!1;let i=n[D];if(!i||typeof i!=`object`||Array.isArray(i))return!1;let s=i;return!(typeof s.surfaceId!=`string`||Array.isArray(s[y])&&s[y].length>0||s[v]&&typeof s[v]==`object`&&Object.keys(s[v]).length>0)}sanitizeLayout(e){return K(e,t=>this.sanitizeBlock(t))}sanitizeBlock(e){if(e[kt]||e[Dt])return null;let t={};for(let[r,a]of Object.entries(e))w(r)||(t[r]=a);if(t[D]&&typeof t[D]==`object`&&t[D]!==null){let r$3=r({},t[D]),a=Array.isArray(r$3[y])?this.sanitizeComponentsList(r$3[y]):void 0,n=r$3[v]&&typeof r$3[v]==`object`&&r$3[v]!==null?S(r$3[v]):void 0,i=S(r$3,[y,v]);a!==void 0&&(i[y]=a),n!==void 0&&(i[v]=n),t[D]=i}if(t[M]&&typeof t[M]==`object`&&t[M]!==null){let r$4=r({},t[M]),a=Array.isArray(r$4[y])?this.sanitizeComponentsList(r$4[y]):void 0,n=S(r$4,[y]);a!==void 0&&(n[y]=a),t[M]=n}return t[x]&&typeof t[x]==`object`&&t[x]!==null&&(t[x]=S(t[x])),Object.keys(t).length===0?null:t}sanitizeComponentsList(e){return e.filter(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?r[It]!==Et:!0).map(r=>r!==null&&typeof r==`object`&&!Array.isArray(r)?P(r):r)}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};var gt=class o{destroyRef=C$1(zt);chatState=C$1(j);chatCleaner=C$1(z);catalogManagement=C$1(V9);startupConfigState=C$1(vy);logger=C$1(wn).withTag(`[StateSync]`);v09Strategy=C$1(O);v10Strategy=C$1(U);previousCatalogId=null;isDraftEdited=!1;lastSynchronizedLayout=null;_activeDraft=Le$1(``);activeDraft=this._activeDraft.asReadonly();sessionResetNonce=Le$1(0);userDraftInput$=new pe;cancelPendingDraftSync$=new pe;constructor(){FHe(this.catalogManagement.activeCatalog).pipe(Ft$1(t=>!!t),$$(this.destroyRef)).subscribe(t=>{let r=V$(t)||``,a=this.previousCatalogId===null,n=this.previousCatalogId!==null&&this.previousCatalogId!==r;if((a||n)&&!this.isDraftEdited){let i=this.getInitialDraft(r);this._activeDraft.set(i),this.userDraftInput$.next(i)}this.previousCatalogId=r}),FHe(this.catalogManagement.activeProtocolVersion).pipe($$(this.destroyRef)).subscribe(t=>{this.handleProtocolVersionChange(t)}),FHe(this.catalogManagement.hasReceivedCatalogResponse).pipe(Ft$1(t=>t),$$(this.destroyRef)).subscribe(()=>{this.handleProtocolVersionChange(this.getActiveProtocolVersion())}),(this.startupConfigState.sharedA2uiPayload?FHe(this.startupConfigState.sharedA2uiPayload):Lt$1(null)).pipe(Ft$1(t=>!!t),$$(this.destroyRef)).subscribe(t=>{this.injectExternalDraft(t)}),this.userDraftInput$.pipe(UC(t=>Da(300).pipe(Bt(()=>t),Is(this.cancelPendingDraftSync$))),$$(this.destroyRef)).subscribe(t=>{this.chatState.isProgrammaticStreamActive()||this.syncLayoutToHistory(t)})}updateDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}injectExternalDraft(e){this.isDraftEdited=!0,this._activeDraft.set(e),this.userDraftInput$.next(e)}syncActiveDraftToHistory(){this.syncLayoutToHistory(this._activeDraft())}hasEditedDraft(){return this.isDraftEdited}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(e){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!0,this.lastSynchronizedLayout=this.sanitizeLayout(e)||null,this._activeDraft.set(e)}flushDraft(){this.cancelPendingDraftSync$.next(),this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.previousCatalogId=null;let e=this.catalogManagement.activeCatalog(),t=e&&V$(e)||``;!this.startupConfigState.activeRenderer()?.samplePayload&&!t&&(t=this.getActiveProtocolVersion()===`v1.0`?A:R);let a=this.getInitialDraft(t);this._activeDraft.set(a),a&&this.userDraftInput$.next(a)}resetToBlankDraft(){this.cancelPendingDraftSync$.next();let e=this.catalogManagement.activeCatalog(),t=this.getActiveProtocolVersion(),r=t===`v1.0`?A:R,a=e&&V$(e)||r;this.isDraftEdited=!1,this.lastSynchronizedLayout=null,this.previousCatalogId=a;let i=this.getStrategy(t).getBlankDraft(a);this._activeDraft.set(i),this.sessionResetNonce.update(s=>s+1),this.syncLayoutToHistory(i)}handleProtocolVersionChange(e){if(!this.hasReceivedCatalogResponse()||this.isDraftEdited)return;let t=this._activeDraft(),r=this.getStrategy(e),a=this.catalogManagement.activeCatalog(),n=a?.catalogId||a?.$id||``;if(n===R&&e===`v1.0`?n=A:n===A&&e===`v0.9`&&(n=R),ft(t)){let i=r.getStarterDraft(n);i!==t&&(this._activeDraft.set(i),this.userDraftInput$.next(i))}else if(dt(t)){let i=r.getBlankDraft(n||void 0);i!==t&&(this._activeDraft.set(i),this.userDraftInput$.next(i))}}getStrategy(e){return(e??this.getActiveProtocolVersion())===`v1.0`?this.v10Strategy:this.v09Strategy}getActiveProtocolVersion(){return this.catalogManagement.activeProtocolVersion()}hasReceivedCatalogResponse(){return this.catalogManagement.hasReceivedCatalogResponse()}getInitialDraft(e){let t=this.startupConfigState.activeRenderer();if(t?.samplePayload)return t.samplePayload;if(!e)return``;let r=this.getActiveProtocolVersion(),a=this.getStrategy(r);return e===R||e===A||e===`https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json`?a.getStarterDraft(e):a.getBlankDraft(e)}syncLayoutToHistory(e){if(e!==this._activeDraft())return;let t=this.sanitizeLayout(e);if(!t)return;let r=this.chatState.chatHistory();if(r.length>0&&t===this.lastSynchronizedLayout)return;if(this.lastSynchronizedLayout=t,r.length===0){this.chatState.setChatHistory([{role:`user`,content:t,isSnapshot:!0}]);return}let a=r[r.length-1];if(this.chatCleaner.isUserLayoutSnapshot(a)){let i=[...r];i[i.length-1]={role:`user`,content:t,isSnapshot:!0},this.chatState.setChatHistory(i)}else this.chatState.updateChatHistory(i=>[...i,{role:`user`,content:t,isSnapshot:!0}])}sanitizeLayout(e){let t=e.trim();if(!t)return``;let r=f(t);if(r.success?GF(r.data)===`v1.0`:/"version"\s*:\s*"v?1\.0"/i.test(t)){let i=this.v10Strategy.sanitizeLayout(t);return i||this.logger.warn(`Discarding malformed layout JSON during sanitization: not a valid JSON array`),i}let n=this.getStrategy().sanitizeLayout(t);return n||this.logger.warn(`Discarding malformed layout JSON during sanitization: not a valid JSON array`),n}static ɵfac=function(t){return new(t||o)};static ɵprov=te({token:o,factory:o.ɵfac,providedIn:`root`})};function be(o,e){if(!Array.isArray(o)||o.length===0)return{valid:!0};for(let t of o){if(!t||typeof t!=`object`||Array.isArray(t))continue;let r=yt(t);if(r&&r!==e)return{valid:!1,code:`PROTOCOL_VERSION_MISMATCH`,detectedVersion:r,expectedVersion:e,message:`Payload protocol version ${r} does not match active renderer protocol version ${e}.`}}return{valid:!0}}function ke(o){if(!Array.isArray(o)||o.length===0)return null;for(let e of o){if(!e||typeof e!=`object`||Array.isArray(e))continue;let t=yt(e);if(t)return t}return null}function yt(o){if(typeof o.version==`string`){let t=o.version.trim();if(t===`v1.0`||t===`1.0`)return`v1.0`;if(t===`v0.9`||t===`0.9`)return`v0.9`}if(o.callRendererFunction!==void 0||o.agentFunctionResponse!==void 0||o.callAgentFunctionResponse!==void 0)return`v1.0`;if(o.createSurface&&typeof o.createSurface==`object`&&!Array.isArray(o.createSurface)){let t=o.createSurface;if(typeof t.catalogId==`string`&&(t.catalogId.includes(`v1_0`)||t.catalogId.includes(`v1.0`))||Array.isArray(t.components)&&t.components.length>0||t.dataModel&&typeof t.dataModel==`object`&&!Array.isArray(t.dataModel)&&Object.keys(t.dataModel).length>0)return`v1.0`;if(t.theme!==void 0)return`v0.9`}return J(o)||(o.beginRendering!==void 0?`v0.9`:null)}function J(o){if(!o||typeof o!=`object`)return null;if(Array.isArray(o)){for(let t of o){let r=J(t);if(r)return r}return null}let e=o;if(`@path`in e||`@call`in e)return`v1.0`;if(typeof e.path==`string`&&Object.keys(e).length===1||typeof e.call==`string`&&`returnType`in e)return`v0.9`;for(let[t,r]of Object.entries(e)){if(t===`__proto__`||t===`constructor`||t===`prototype`||t===`dataModel`)continue;if(t===`updateDataModel`&&r&&typeof r==`object`&&!Array.isArray(r)){let n=r;for(let[i,s]of Object.entries(n))if(i!==`value`){let c=J(s);if(c)return c}continue}let a=J(r);if(a)return a}return null}function Ce(o,e){return{version:`1.0`,agentFunctionResponse:`error`in e?{functionCallId:o,error:e.error}:{functionCallId:o,value:e.value}}}function W(o){return o!==null&&typeof o==`object`&&!Array.isArray(o)}function Le(o){let e=r({},o);if(`callAgentFunctionResponse`in e){let i=e.callAgentFunctionResponse,t=e,{callAgentFunctionResponse:s}=t;e=u(t,[`callAgentFunctionResponse`]),e.agentFunctionResponse===void 0&&i!==void 0&&(e.agentFunctionResponse=i)}if(W(e.agentFunctionResponse)){let i=e.agentFunctionResponse;if(`result`in i){let r=i,{result:s}=r,c=u(r,[`result`]);c.value===void 0&&c.error===void 0&&(c.value=s),e.agentFunctionResponse=c}}if(W(e.callRendererFunction)){let i=e.callRendererFunction;if(i.call!==void 0&&!W(i.callFunction)){let a=i,{call:s$1,args:c,catalogId:l}=a,u$1=u(a,[`call`,`args`,`catalogId`]),d={"@call":String(s$1)};c!==void 0&&(d.args=c),l!==void 0&&(d.catalogId=l),e.callRendererFunction=s(r({},u$1),{callFunction:d})}else if(W(i.callFunction)){let n=i,{catalogId:s$2}=n,c=u(n,[`catalogId`]),l=r({},i.callFunction);l.call!==void 0&&!l[`@call`]&&(l[`@call`]=String(l.call),delete l.call),s$2!==void 0&&l.catalogId===void 0&&(l.catalogId=s$2),e.callRendererFunction=s(r({},c),{callFunction:l})}}return e}var Ct=(t=>(t.ORIGIN=`origin`,t.THEME=`theme`,t))(Ct||{});export{Le as a,at as c,gt as d,it as f,z as h,Ft as i,be as l,ke as m,Ct as n,Lt as o,j as p,F as r,Vt as s,Ce as t,f as u};