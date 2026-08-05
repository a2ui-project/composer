import {l as ot,L as Le$1,m as Ud,d as dm,au as $u,T as Tm,b2 as Yu,M as Mm,a5 as Xs,a6 as Js,r as rb,i as ed,e as Cg,o as ob,g,z as ze$1,an as I,c4 as _e,aB as G,aD as ny,ar as fn,aw as WC,h as Wu,p as Lb,aZ as z,Y as Yt$1,c5 as qt$1,al as Zs,ay as nd,c as Cm,am as Ie$1,aS as X,av as Ro,c6 as U_,bk as tu,ak as W,aA as o4,a_ as lH,aC as Pq,c7 as Ge$1,b7 as te$1,c8 as cc$1,ai as le$1,c9 as Qa,ca as Rf,cb as Qv,cc as ki,cd as sc,ce as A,cf as US,br as VS,V,S,bj as yT,aa as ec,cg as YE,b0 as s,Z as r$1,ch as Et$1,bN as io$1,v as oe$1,w as uy,B as Bo,A as An$1,X as vt$1,O,n as Lr$1,c0 as Ne$1,bT as Br$1,ci as Tn$1,cj as Eo,aH as pH,c1 as Fr$1,ck as cv,cl as lv,c2 as M,ac as Ee$1,ah as j$1,by as ti$1,cm as Qs,cn as ye,co as Aa,bA as Kv,cp as xt$1,cq as ac,aq as jf,aV as ir$1,b1 as mg,cr as uv,cs as m,ct as P4}from'./main.js';var $t=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275cmp=dm({type:i,selectors:[["ng-component"]],exportAs:["cdkVisuallyHidden"],decls:0,vars:0,template:function(n,r){},styles:[`.cdk-visually-hidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
  outline: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  left: 0;
}
[dir=rtl] .cdk-visually-hidden {
  left: auto;
  right: 0;
}
`],encapsulation:2})}return i})(),Gt;function Oi(){if(Gt===void 0&&(Gt=null,typeof window<"u")){let i=window;if(i.trustedTypes!==void 0)try{Gt=i.trustedTypes.createPolicy("angular#components",{createHTML:e=>e});}catch(e){console.error(e);}}return Gt}function K(i){return Oi()?.createHTML(i)||i}function En(i,e,t){let n=t.sanitize(Ge$1.HTML,e);i.innerHTML=K(n||"");}var xn=new Set,Y,Wt=(()=>{class i{_platform=g(Lr$1);_nonce=g(Eo,{optional:true});_matchMedia;constructor(){this._matchMedia=this._platform.isBrowser&&window.matchMedia?window.matchMedia.bind(window):Pi;}matchMedia(t){return (this._platform.WEBKIT||this._platform.BLINK)&&Ri(t,this._nonce),this._matchMedia(t)}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})();function Ri(i,e){if(!xn.has(i))try{Y||(Y=document.createElement("style"),e&&Y.setAttribute("nonce",e),Y.setAttribute("type","text/css"),document.head.appendChild(Y)),Y.sheet&&(Y.sheet.insertRule(`@media ${i.replace(/[{}]/g,"")} {body{ }}`,0),xn.add(i));}catch(t){console.error(t);}}function Pi(i){return {matches:i==="all"||i==="",media:i,addListener:()=>{},removeListener:()=>{}}}var Ee=(()=>{class i{_mediaMatcher=g(Wt);_zone=g(W);_queries=new Map;_destroySubject=new j$1;ngOnDestroy(){this._destroySubject.next(),this._destroySubject.complete();}isMatched(t){return An(P4(t)).some(r=>this._registerQuery(r).mql.matches)}observe(t){let r=An(P4(t)).map(a=>this._registerQuery(a).observable),o=Kv(r);return o=xt$1(o.pipe(fn(1)),o.pipe(ac(1),ec(0))),o.pipe(le$1(a=>{let c={matches:false,breakpoints:{}};return a.forEach(({matches:d,query:m})=>{c.matches=c.matches||d,c.breakpoints[m]=d;}),c}))}_registerQuery(t){if(this._queries.has(t))return this._queries.get(t);let n=this._mediaMatcher.matchMedia(t),o={observable:new M(a=>{let c=d=>this._zone.run(()=>a.next(d));return n.addListener(c),()=>{n.removeListener(c);}}).pipe(jf(n),le$1(({matches:a})=>({query:t,matches:a})),ir$1(this._destroySubject)),mql:n};return this._queries.set(t,o),o}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})();function An(i){return i.map(e=>e.split(",")).reduce((e,t)=>e.concat(t)).map(e=>e.trim())}function Li(i){if(i.type==="characterData"&&i.target instanceof Comment)return  true;if(i.type==="childList"){for(let e=0;e<i.addedNodes.length;e++)if(!(i.addedNodes[e]instanceof Comment))return  false;for(let e=0;e<i.removedNodes.length;e++)if(!(i.removedNodes[e]instanceof Comment))return  false;return  true}return  false}var wn=(()=>{class i{create(t){return typeof MutationObserver>"u"?null:new MutationObserver(t)}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})(),Dn=(()=>{class i{_mutationObserverFactory=g(wn);_observedElements=new Map;_ngZone=g(W);ngOnDestroy(){this._observedElements.forEach((t,n)=>this._cleanupObserver(n));}observe(t){let n=Fr$1(t);return new M(r=>{let a=this._observeElement(n).pipe(le$1(c=>c.filter(d=>!Li(d))),Ee$1(c=>!!c.length)).subscribe(c=>{this._ngZone.run(()=>{r.next(c);});});return ()=>{a.unsubscribe(),this._unobserveElement(n);}})}_observeElement(t){return this._ngZone.runOutsideAngular(()=>{if(this._observedElements.has(t))this._observedElements.get(t).count++;else {let n=new j$1,r=this._mutationObserverFactory.create(o=>n.next(o));r&&r.observe(t,{characterData:true,childList:true,subtree:true}),this._observedElements.set(t,{observer:r,stream:n,count:1});}return this._observedElements.get(t).stream})}_unobserveElement(t){this._observedElements.has(t)&&(this._observedElements.get(t).count--,this._observedElements.get(t).count||this._cleanupObserver(t));}_cleanupObserver(t){if(this._observedElements.has(t)){let{observer:n,stream:r}=this._observedElements.get(t);n&&n.disconnect(),r.complete(),this._observedElements.delete(t);}}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})(),No=(()=>{class i{_contentObserver=g(Dn);_elementRef=g(ze$1);event=new Ie$1;get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._disabled?this._unsubscribe():this._subscribe();}_disabled=false;get debounce(){return this._debounce}set debounce(t){this._debounce=yT(t),this._subscribe();}_debounce;_currentSubscription=null;ngAfterContentInit(){!this._currentSubscription&&!this.disabled&&this._subscribe();}ngOnDestroy(){this._unsubscribe();}_subscribe(){this._unsubscribe();let t=this._contentObserver.observe(this._elementRef);this._currentSubscription=(this.debounce?t.pipe(ec(this.debounce)):t).subscribe(this.event);}_unsubscribe(){this._currentSubscription?.unsubscribe();}static \u0275fac=function(n){return new(n||i)};static \u0275dir=Yt$1({type:i,selectors:[["","cdkObserveContent",""]],inputs:{disabled:[2,"cdkObserveContentDisabled","disabled",WC],debounce:"debounce"},outputs:{event:"cdkObserveContent"},exportAs:["cdkObserveContent"]})}return i})(),Mn=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=ot({type:i});static \u0275inj=Le$1({providers:[wn]})}return i})();var Sn=(()=>{class i{_platform=g(Lr$1);isDisabled(t){return t.hasAttribute("disabled")}isVisible(t){return ji(t)&&getComputedStyle(t).visibility==="visible"}isTabbable(t){if(!this._platform.isBrowser)return  false;let n=Bi(Zi(t));if(n&&(In(n)===-1||!this.isVisible(n)))return  false;let r=t.nodeName.toLowerCase(),o=In(t);return t.hasAttribute("contenteditable")?o!==-1:r==="iframe"||r==="object"||this._platform.WEBKIT&&this._platform.IOS&&!Wi(t)?false:r==="audio"?t.hasAttribute("controls")?o!==-1:false:r==="video"?o===-1?false:o!==null?true:this._platform.FIREFOX||t.hasAttribute("controls"):t.tabIndex>=0}isFocusable(t,n){return qi(t)&&!this.isDisabled(t)&&(n?.ignoreVisibility||this.isVisible(t))}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})();function Bi(i){try{return i.frameElement}catch{return null}}function ji(i){return !!(i.offsetWidth||i.offsetHeight||typeof i.getClientRects=="function"&&i.getClientRects().length)}function Ui(i){let e=i.nodeName.toLowerCase();return e==="input"||e==="select"||e==="button"||e==="textarea"}function Hi(i){return Gi(i)&&i.type=="hidden"}function zi(i){return $i(i)&&i.hasAttribute("href")}function Gi(i){return i.nodeName.toLowerCase()=="input"}function $i(i){return i.nodeName.toLowerCase()=="a"}function Nn(i){if(!i.hasAttribute("tabindex")||i.tabIndex===void 0)return  false;let e=i.getAttribute("tabindex");return !!(e&&!isNaN(parseInt(e,10)))}function In(i){if(!Nn(i))return null;let e=parseInt(i.getAttribute("tabindex")||"",10);return isNaN(e)?-1:e}function Wi(i){let e=i.nodeName.toLowerCase(),t=e==="input"&&i.type;return t==="text"||t==="password"||e==="select"||e==="textarea"}function qi(i){return Hi(i)?false:Ui(i)||zi(i)||i.hasAttribute("contenteditable")||Nn(i)}function Zi(i){return i.ownerDocument&&i.ownerDocument.defaultView||window}var qt=class{_element;_checker;_ngZone;_document;_injector;_startAnchor=null;_endAnchor=null;_hasAttached=false;startAnchorListener=()=>this.focusLastTabbableElement();endAnchorListener=()=>this.focusFirstTabbableElement();get enabled(){return this._enabled}set enabled(e){this._enabled=e,this._startAnchor&&this._endAnchor&&(this._toggleAnchorTabIndex(e,this._startAnchor),this._toggleAnchorTabIndex(e,this._endAnchor));}_enabled=true;constructor(e,t,n,r,o=false,a){this._element=e,this._checker=t,this._ngZone=n,this._document=r,this._injector=a,o||this.attachAnchors();}destroy(){let e=this._startAnchor,t=this._endAnchor;e&&(e.removeEventListener("focus",this.startAnchorListener),e.remove()),t&&(t.removeEventListener("focus",this.endAnchorListener),t.remove()),this._startAnchor=this._endAnchor=null,this._hasAttached=false;}attachAnchors(){return this._hasAttached?true:(this._ngZone.runOutsideAngular(()=>{this._startAnchor||(this._startAnchor=this._createAnchor(),this._startAnchor.addEventListener("focus",this.startAnchorListener)),this._endAnchor||(this._endAnchor=this._createAnchor(),this._endAnchor.addEventListener("focus",this.endAnchorListener));}),this._element.parentNode&&(this._element.parentNode.insertBefore(this._startAnchor,this._element),this._element.parentNode.insertBefore(this._endAnchor,this._element.nextSibling),this._hasAttached=true),this._hasAttached)}focusInitialElementWhenReady(e){return new Promise(t=>{this._executeOnStable(()=>t(this.focusInitialElement(e)));})}focusFirstTabbableElementWhenReady(e){return new Promise(t=>{this._executeOnStable(()=>t(this.focusFirstTabbableElement(e)));})}focusLastTabbableElementWhenReady(e){return new Promise(t=>{this._executeOnStable(()=>t(this.focusLastTabbableElement(e)));})}_getRegionBoundary(e){let t=this._element.querySelectorAll(`[cdk-focus-region-${e}], [cdkFocusRegion${e}], [cdk-focus-${e}]`);return e=="start"?t.length?t[0]:this._getFirstTabbableElement(this._element):t.length?t[t.length-1]:this._getLastTabbableElement(this._element)}focusInitialElement(e){let t=this._element.querySelector("[cdk-focus-initial], [cdkFocusInitial]");if(t){if(!this._checker.isFocusable(t)){let n=this._getFirstTabbableElement(t);return n?.focus(e),!!n}return t.focus(e),true}return this.focusFirstTabbableElement(e)}focusFirstTabbableElement(e){let t=this._getRegionBoundary("start");return t&&t.focus(e),!!t}focusLastTabbableElement(e){let t=this._getRegionBoundary("end");return t&&t.focus(e),!!t}hasAttached(){return this._hasAttached}_getFirstTabbableElement(e){if(this._checker.isFocusable(e)&&this._checker.isTabbable(e))return e;let t=e.children;for(let n=0;n<t.length;n++){let r=t[n].nodeType===this._document.ELEMENT_NODE?this._getFirstTabbableElement(t[n]):null;if(r)return r}return null}_getLastTabbableElement(e){if(this._checker.isFocusable(e)&&this._checker.isTabbable(e))return e;let t=e.children;for(let n=t.length-1;n>=0;n--){let r=t[n].nodeType===this._document.ELEMENT_NODE?this._getLastTabbableElement(t[n]):null;if(r)return r}return null}_createAnchor(){let e=this._document.createElement("div");return this._toggleAnchorTabIndex(this._enabled,e),e.classList.add("cdk-visually-hidden"),e.classList.add("cdk-focus-trap-anchor"),e.setAttribute("aria-hidden","true"),e}_toggleAnchorTabIndex(e,t){e?t.setAttribute("tabindex","0"):t.removeAttribute("tabindex");}toggleAnchors(e){this._startAnchor&&this._endAnchor&&(this._toggleAnchorTabIndex(e,this._startAnchor),this._toggleAnchorTabIndex(e,this._endAnchor));}_executeOnStable(e){mg(e,{injector:this._injector});}},Ki=(()=>{class i{_checker=g(Sn);_ngZone=g(W);_document=g(V);_injector=g(X);constructor(){g(Pq).load($t);}create(t,n=false){return new qt(t,this._checker,this._ngZone,this._document,n,this._injector)}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})();var Tn=new I("liveAnnouncerElement",{providedIn:"root",factory:()=>null}),kn=new I("LIVE_ANNOUNCER_DEFAULT_OPTIONS"),Yi=0,Qi=(()=>{class i{_ngZone=g(W);_defaultOptions=g(kn,{optional:true});_liveElement;_document=g(V);_sanitizer=g(VS);_previousTimeout;_currentPromise;_currentResolve;constructor(){let t=g(Tn,{optional:true});this._liveElement=t||this._createLiveElement();}announce(t,...n){let r=this._defaultOptions,o,a;return n.length===1&&typeof n[0]=="number"?a=n[0]:[o,a]=n,this.clear(),clearTimeout(this._previousTimeout),o||(o=r&&r.politeness?r.politeness:"polite"),a==null&&r&&(a=r.duration),this._liveElement.setAttribute("aria-live",o),this._liveElement.id&&this._exposeAnnouncerToModals(this._liveElement.id),this._ngZone.runOutsideAngular(()=>(this._currentPromise||(this._currentPromise=new Promise(c=>this._currentResolve=c)),clearTimeout(this._previousTimeout),this._previousTimeout=setTimeout(()=>{!t||typeof t=="string"?this._liveElement.textContent=t:En(this._liveElement,t,this._sanitizer),typeof a=="number"&&(this._previousTimeout=setTimeout(()=>this.clear(),a)),this._currentResolve?.(),this._currentPromise=this._currentResolve=void 0;},100),this._currentPromise))}clear(){this._liveElement&&(this._liveElement.textContent="");}ngOnDestroy(){clearTimeout(this._previousTimeout),this._liveElement?.remove(),this._liveElement=null,this._currentResolve?.(),this._currentPromise=this._currentResolve=void 0;}_createLiveElement(){let t="cdk-live-announcer-element",n=this._document.getElementsByClassName(t),r=this._document.createElement("div");for(let o=0;o<n.length;o++)n[o].remove();return r.classList.add(t),r.classList.add("cdk-visually-hidden"),r.setAttribute("aria-atomic","true"),r.setAttribute("aria-live","polite"),r.id=`cdk-live-announcer-${Yi++}`,this._document.body.appendChild(r),r}_exposeAnnouncerToModals(t){let n=this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');for(let r=0;r<n.length;r++){let o=n[r],a=o.getAttribute("aria-owns");a?a.indexOf(t)===-1&&o.setAttribute("aria-owns",a+" "+t):o.setAttribute("aria-owns",t);}}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})();var B=(function(i){return i[i.NONE=0]="NONE",i[i.BLACK_ON_WHITE=1]="BLACK_ON_WHITE",i[i.WHITE_ON_BLACK=2]="WHITE_ON_BLACK",i})(B||{}),Vn="cdk-high-contrast-black-on-white",Fn="cdk-high-contrast-white-on-black",xe="cdk-high-contrast-active",On=(()=>{class i{_platform=g(Lr$1);_hasCheckedHighContrastMode=false;_document=g(V);_breakpointSubscription;constructor(){this._breakpointSubscription=g(Ee).observe("(forced-colors: active)").subscribe(()=>{this._hasCheckedHighContrastMode&&(this._hasCheckedHighContrastMode=false,this._applyBodyHighContrastModeCssClasses());});}getHighContrastMode(){if(!this._platform.isBrowser)return B.NONE;let t=this._document.createElement("div");t.style.backgroundColor="rgb(1,2,3)",t.style.position="absolute",this._document.body.appendChild(t);let n=this._document.defaultView||window,r=n&&n.getComputedStyle?n.getComputedStyle(t):null,o=(r&&r.backgroundColor||"").replace(/ /g,"");switch(t.remove(),o){case "rgb(0,0,0)":case "rgb(45,50,54)":case "rgb(32,32,32)":return B.WHITE_ON_BLACK;case "rgb(255,255,255)":case "rgb(255,250,239)":return B.BLACK_ON_WHITE}return B.NONE}ngOnDestroy(){this._breakpointSubscription.unsubscribe();}_applyBodyHighContrastModeCssClasses(){if(!this._hasCheckedHighContrastMode&&this._platform.isBrowser&&this._document.body){let t=this._document.body.classList;t.remove(xe,Vn,Fn),this._hasCheckedHighContrastMode=true;let n=this.getHighContrastMode();n===B.BLACK_ON_WHITE?t.add(xe,Vn):n===B.WHITE_ON_BLACK&&t.add(xe,Fn);}}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})(),Xi=(()=>{class i{constructor(){g(On)._applyBodyHighContrastModeCssClasses();}static \u0275fac=function(n){return new(n||i)};static \u0275mod=ot({type:i});static \u0275inj=Le$1({imports:[Mn]})}return i})();var Ae=class extends Aa{setActiveItem(e){this.activeItem&&this.activeItem.setInactiveStyles(),super.setActiveItem(e),this.activeItem&&this.activeItem.setActiveStyles();}};var Pn=" ";function Ji(i,e,t){let n=Kt(i,e);t=t.trim(),!n.some(r=>r.trim()===t)&&(n.push(t),i.setAttribute(e,n.join(Pn)));}function tr(i,e,t){let n=Kt(i,e);t=t.trim();let r=n.filter(o=>o!==t);r.length?i.setAttribute(e,r.join(Pn)):i.removeAttribute(e);}function Kt(i,e){return i.getAttribute(e)?.match(/\S+/g)??[]}var Ln="cdk-describedby-message",Zt="cdk-describedby-host",De=0,ua=(()=>{class i{_platform=g(Lr$1);_document=g(V);_messageRegistry=new Map;_messagesContainer=null;_id=`${De++}`;constructor(){g(Pq).load($t),this._id=g(Tn$1)+"-"+De++;}describe(t,n,r){if(!this._canBeDescribed(t,n))return;let o=we(n,r);typeof n!="string"?(Rn(n,this._id),this._messageRegistry.set(o,{messageElement:n,referenceCount:0})):this._messageRegistry.has(o)||this._createMessageElement(n,r),this._isElementDescribedByMessage(t,o)||this._addMessageReference(t,o);}removeDescription(t,n,r){if(!n||!this._isElementNode(t))return;let o=we(n,r);if(this._isElementDescribedByMessage(t,o)&&this._removeMessageReference(t,o),typeof n=="string"){let a=this._messageRegistry.get(o);a&&a.referenceCount===0&&this._deleteMessageElement(o);}this._messagesContainer?.childNodes.length===0&&(this._messagesContainer.remove(),this._messagesContainer=null);}ngOnDestroy(){let t=this._document.querySelectorAll(`[${Zt}="${this._id}"]`);for(let n=0;n<t.length;n++)this._removeCdkDescribedByReferenceIds(t[n]),t[n].removeAttribute(Zt);this._messagesContainer?.remove(),this._messagesContainer=null,this._messageRegistry.clear();}_createMessageElement(t,n){let r=this._document.createElement("div");Rn(r,this._id),r.textContent=t,n&&r.setAttribute("role",n),this._createMessagesContainer(),this._messagesContainer.appendChild(r),this._messageRegistry.set(we(t,n),{messageElement:r,referenceCount:0});}_deleteMessageElement(t){this._messageRegistry.get(t)?.messageElement?.remove(),this._messageRegistry.delete(t);}_createMessagesContainer(){if(this._messagesContainer)return;let t="cdk-describedby-message-container",n=this._document.querySelectorAll(`.${t}[platform="server"]`);for(let o=0;o<n.length;o++)n[o].remove();let r=this._document.createElement("div");r.style.visibility="hidden",r.classList.add(t),r.classList.add("cdk-visually-hidden"),this._platform.isBrowser||r.setAttribute("platform","server"),this._document.body.appendChild(r),this._messagesContainer=r;}_removeCdkDescribedByReferenceIds(t){let n=Kt(t,"aria-describedby").filter(r=>r.indexOf(Ln)!=0);t.setAttribute("aria-describedby",n.join(" "));}_addMessageReference(t,n){let r=this._messageRegistry.get(n);Ji(t,"aria-describedby",r.messageElement.id),t.setAttribute(Zt,this._id),r.referenceCount++;}_removeMessageReference(t,n){let r=this._messageRegistry.get(n);r.referenceCount--,tr(t,"aria-describedby",r.messageElement.id),t.removeAttribute(Zt);}_isElementDescribedByMessage(t,n){let r=Kt(t,"aria-describedby"),o=this._messageRegistry.get(n),a=o&&o.messageElement.id;return !!a&&r.indexOf(a)!=-1}_canBeDescribed(t,n){if(!this._isElementNode(t))return  false;if(n&&typeof n=="object")return  true;let r=n==null?"":`${n}`.trim(),o=t.getAttribute("aria-label");return r?!o||o.trim()!==r:false}_isElementNode(t){return t.nodeType===this._document.ELEMENT_NODE}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})();function we(i,e){return typeof i=="string"?`${e||""}/${i}`:i}function Rn(i,e){i.id||(i.id=`${Ln}-${e}-${De++}`);}var at,Bn=["color","button","checkbox","date","datetime-local","email","file","hidden","image","month","number","password","radio","range","reset","search","submit","tel","text","time","url","week"];function xa(){if(at)return at;if(typeof document!="object"||!document)return at=new Set(Bn),at;let i=document.createElement("input");return at=new Set(Bn.filter(e=>(i.setAttribute("type",e),i.type===e))),at}var Ia={HandsetPortrait:"(max-width: 599.98px) and (orientation: portrait)"};var er=new I("MATERIAL_ANIMATIONS"),jn=null;function nr(){return g(er,{optional:true})?.animationsDisabled||g(YE,{optional:true})==="NoopAnimations"?"di-disabled":(jn??=g(Wt).matchMedia("(prefers-reduced-motion)").matches,jn?"reduced-motion":"enabled")}function st(){return nr()!=="enabled"}function Oa(i){return i!=null&&`${i}`!="false"}var F=(function(i){return i[i.FADING_IN=0]="FADING_IN",i[i.VISIBLE=1]="VISIBLE",i[i.FADING_OUT=2]="FADING_OUT",i[i.HIDDEN=3]="HIDDEN",i})(F||{}),Me=class{_renderer;element;config;_animationForciblyDisabledThroughCss;state=F.HIDDEN;constructor(e,t,n,r=false){this._renderer=e,this.element=t,this.config=n,this._animationForciblyDisabledThroughCss=r;}fadeOut(){this._renderer.fadeOutRipple(this);}},Un=uv({passive:true,capture:true}),Ie=class{_events=new Map;addHandler(e,t,n,r){let o=this._events.get(t);if(o){let a=o.get(n);a?a.add(r):o.set(n,new Set([r]));}else this._events.set(t,new Map([[n,new Set([r])]])),e.runOutsideAngular(()=>{document.addEventListener(t,this._delegateEventHandler,Un);});}removeHandler(e,t,n){let r=this._events.get(e);if(!r)return;let o=r.get(t);o&&(o.delete(n),o.size===0&&r.delete(t),r.size===0&&(this._events.delete(e),document.removeEventListener(e,this._delegateEventHandler,Un)));}_delegateEventHandler=e=>{let t=Br$1(e);t&&this._events.get(e.type)?.forEach((n,r)=>{(r===t||r.contains(t))&&n.forEach(o=>o.handleEvent(e));});}},gt={enterDuration:225,exitDuration:150},ir=800,Hn=uv({passive:true,capture:true}),zn=["mousedown","touchstart"],Gn=["mouseup","mouseleave","touchend","touchcancel"],rr=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275cmp=dm({type:i,selectors:[["ng-component"]],hostAttrs:["mat-ripple-style-loader",""],decls:0,vars:0,template:function(n,r){},styles:[`.mat-ripple {
  overflow: hidden;
  position: relative;
}
.mat-ripple:not(:empty) {
  transform: translateZ(0);
}

.mat-ripple.mat-ripple-unbounded {
  overflow: visible;
}

.mat-ripple-element {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  transition: opacity, transform 0ms cubic-bezier(0, 0, 0.2, 1);
  transform: scale3d(0, 0, 0);
  background-color: var(--mat-ripple-color, color-mix(in srgb, var(--mat-sys-on-surface) 10%, transparent));
}
@media (forced-colors: active) {
  .mat-ripple-element {
    display: none;
  }
}
.cdk-drag-preview .mat-ripple-element, .cdk-drag-placeholder .mat-ripple-element {
  display: none;
}
`],encapsulation:2})}return i})(),vt=class i{_target;_ngZone;_platform;_containerElement;_triggerElement=null;_isPointerDown=false;_activeRipples=new Map;_mostRecentTransientRipple=null;_lastTouchStartEvent;_pointerUpEventsRegistered=false;_containerRect=null;static _eventManager=new Ie;constructor(e,t,n,r,o){this._target=e,this._ngZone=t,this._platform=r,r.isBrowser&&(this._containerElement=Fr$1(n)),o&&o.get(Pq).load(rr);}fadeInRipple(e,t,n={}){let r=this._containerRect=this._containerRect||this._containerElement.getBoundingClientRect(),o=r$1(r$1({},gt),n.animation);n.centered&&(e=r.left+r.width/2,t=r.top+r.height/2);let a=n.radius||or(e,t,r),c=e-r.left,d=t-r.top,m=o.enterDuration,h=document.createElement("div");h.classList.add("mat-ripple-element"),h.style.left=`${c-a}px`,h.style.top=`${d-a}px`,h.style.height=`${a*2}px`,h.style.width=`${a*2}px`,n.color!=null&&(h.style.backgroundColor=n.color),h.style.transitionDuration=`${m}ms`,this._containerElement.appendChild(h);let X=window.getComputedStyle(h),ki=X.transitionProperty,Ze=X.transitionDuration,ue=ki==="none"||Ze==="0s"||Ze==="0s, 0s"||r.width===0&&r.height===0,z=new Me(this,h,n,ue);h.style.transform="scale3d(1, 1, 1)",z.state=F.FADING_IN,n.persistent||(this._mostRecentTransientRipple=z);let Dt=null;return !ue&&(m||o.exitDuration)&&this._ngZone.runOutsideAngular(()=>{let Ke=()=>{Dt&&(Dt.fallbackTimer=null),clearTimeout(Ye),this._finishRippleTransition(z);},me=()=>this._destroyRipple(z),Ye=setTimeout(me,m+100);h.addEventListener("transitionend",Ke),h.addEventListener("transitioncancel",me),Dt={onTransitionEnd:Ke,onTransitionCancel:me,fallbackTimer:Ye};}),this._activeRipples.set(z,Dt),(ue||!m)&&this._finishRippleTransition(z),z}fadeOutRipple(e){if(e.state===F.FADING_OUT||e.state===F.HIDDEN)return;let t=e.element,n=r$1(r$1({},gt),e.config.animation);t.style.transitionDuration=`${n.exitDuration}ms`,t.style.opacity="0",e.state=F.FADING_OUT,(e._animationForciblyDisabledThroughCss||!n.exitDuration)&&this._finishRippleTransition(e);}fadeOutAll(){this._getActiveRipples().forEach(e=>e.fadeOut());}fadeOutAllNonPersistent(){this._getActiveRipples().forEach(e=>{e.config.persistent||e.fadeOut();});}setupTriggerEvents(e){let t=Fr$1(e);!this._platform.isBrowser||!t||t===this._triggerElement||(this._removeTriggerEvents(),this._triggerElement=t,zn.forEach(n=>{i._eventManager.addHandler(this._ngZone,n,t,this);}));}handleEvent(e){e.type==="mousedown"?this._onMousedown(e):e.type==="touchstart"?this._onTouchStart(e):this._onPointerUp(),this._pointerUpEventsRegistered||(this._ngZone.runOutsideAngular(()=>{Gn.forEach(t=>{this._triggerElement.addEventListener(t,this,Hn);});}),this._pointerUpEventsRegistered=true);}_finishRippleTransition(e){e.state===F.FADING_IN?this._startFadeOutTransition(e):e.state===F.FADING_OUT&&this._destroyRipple(e);}_startFadeOutTransition(e){let t=e===this._mostRecentTransientRipple,{persistent:n}=e.config;e.state=F.VISIBLE,!n&&(!t||!this._isPointerDown)&&e.fadeOut();}_destroyRipple(e){let t=this._activeRipples.get(e)??null;this._activeRipples.delete(e),this._activeRipples.size||(this._containerRect=null),e===this._mostRecentTransientRipple&&(this._mostRecentTransientRipple=null),e.state=F.HIDDEN,t!==null&&(e.element.removeEventListener("transitionend",t.onTransitionEnd),e.element.removeEventListener("transitioncancel",t.onTransitionCancel),t.fallbackTimer!==null&&clearTimeout(t.fallbackTimer)),e.element.remove();}_onMousedown(e){let t=cv(e),n=this._lastTouchStartEvent&&Date.now()<this._lastTouchStartEvent+ir;!this._target.rippleDisabled&&!t&&!n&&(this._isPointerDown=true,this.fadeInRipple(e.clientX,e.clientY,this._target.rippleConfig));}_onTouchStart(e){if(!this._target.rippleDisabled&&!lv(e)){this._lastTouchStartEvent=Date.now(),this._isPointerDown=true;let t=e.changedTouches;if(t)for(let n=0;n<t.length;n++)this.fadeInRipple(t[n].clientX,t[n].clientY,this._target.rippleConfig);}}_onPointerUp(){this._isPointerDown&&(this._isPointerDown=false,this._getActiveRipples().forEach(e=>{let t=e.state===F.VISIBLE||e.config.terminateOnPointerUp&&e.state===F.FADING_IN;!e.config.persistent&&t&&e.fadeOut();}));}_getActiveRipples(){return Array.from(this._activeRipples.keys())}_removeTriggerEvents(){let e=this._triggerElement;e&&(zn.forEach(t=>i._eventManager.removeHandler(t,e,this)),this._pointerUpEventsRegistered&&(Gn.forEach(t=>e.removeEventListener(t,this,Hn)),this._pointerUpEventsRegistered=false));}};function or(i,e,t){let n=Math.max(Math.abs(i-t.left),Math.abs(i-t.right)),r=Math.max(Math.abs(e-t.top),Math.abs(e-t.bottom));return Math.sqrt(n*n+r*r)}var Ve=new I("mat-ripple-global-options"),Za=(()=>{class i{_elementRef=g(ze$1);_animationsDisabled=st();color;unbounded=false;centered=false;radius=0;animation;get disabled(){return this._disabled}set disabled(t){t&&this.fadeOutAllNonPersistent(),this._disabled=t,this._setupTriggerEventsIfEnabled();}_disabled=false;get trigger(){return this._trigger||this._elementRef.nativeElement}set trigger(t){this._trigger=t,this._setupTriggerEventsIfEnabled();}_trigger;_rippleRenderer;_globalOptions;_isInitialized=false;constructor(){let t=g(W),n=g(Lr$1),r=g(Ve,{optional:true}),o=g(X);this._globalOptions=r||{},this._rippleRenderer=new vt(this,t,this._elementRef,n,o);}ngOnInit(){this._isInitialized=true,this._setupTriggerEventsIfEnabled();}ngOnDestroy(){this._rippleRenderer._removeTriggerEvents();}fadeOutAll(){this._rippleRenderer.fadeOutAll();}fadeOutAllNonPersistent(){this._rippleRenderer.fadeOutAllNonPersistent();}get rippleConfig(){return {centered:this.centered,radius:this.radius,color:this.color,animation:r$1(r$1(r$1({},this._globalOptions.animation),this._animationsDisabled?{enterDuration:0,exitDuration:0}:{}),this.animation),terminateOnPointerUp:this._globalOptions.terminateOnPointerUp}}get rippleDisabled(){return this.disabled||!!this._globalOptions.disabled}_setupTriggerEventsIfEnabled(){!this.disabled&&this._isInitialized&&this._rippleRenderer.setupTriggerEvents(this.trigger);}launch(t,n=0,r){return typeof t=="number"?this._rippleRenderer.fadeInRipple(t,n,r$1(r$1({},this.rippleConfig),r)):this._rippleRenderer.fadeInRipple(0,0,r$1(r$1({},this.rippleConfig),t))}static \u0275fac=function(n){return new(n||i)};static \u0275dir=Yt$1({type:i,selectors:[["","mat-ripple",""],["","matRipple",""]],hostAttrs:[1,"mat-ripple"],hostVars:2,hostBindings:function(n,r){n&2&&ed("mat-ripple-unbounded",r.unbounded);},inputs:{color:[0,"matRippleColor","color"],unbounded:[0,"matRippleUnbounded","unbounded"],centered:[0,"matRippleCentered","centered"],radius:[0,"matRippleRadius","radius"],animation:[0,"matRippleAnimation","animation"],disabled:[0,"matRippleDisabled","disabled"],trigger:[0,"matRippleTrigger","trigger"]},exportAs:["matRipple"]})}return i})();var ar={capture:true},sr=["focus","mousedown","mouseenter","touchstart"],Fe="mat-ripple-loader-uninitialized",Se="mat-ripple-loader-class-name",$n="mat-ripple-loader-centered",Yt="mat-ripple-loader-disabled",Wn=(()=>{class i{_document=g(V);_animationsDisabled=st();_globalRippleOptions=g(Ve,{optional:true});_platform=g(Lr$1);_ngZone=g(W);_injector=g(X);_eventCleanups;_hosts=new Map;constructor(){let t=g(Ne$1).createRenderer(null,null);this._eventCleanups=this._ngZone.runOutsideAngular(()=>sr.map(n=>t.listen(this._document,n,this._onInteraction,ar)));}ngOnDestroy(){let t=this._hosts.keys();for(let n of t)this.destroyRipple(n);this._eventCleanups.forEach(n=>n());}configureRipple(t,n){t.setAttribute(Fe,this._globalRippleOptions?.namespace??""),(n.className||!t.hasAttribute(Se))&&t.setAttribute(Se,n.className||""),n.centered&&t.setAttribute($n,""),n.disabled&&t.setAttribute(Yt,"");}setDisabled(t,n){let r=this._hosts.get(t);r?(r.target.rippleDisabled=n,!n&&!r.hasSetUpEvents&&(r.hasSetUpEvents=true,r.renderer.setupTriggerEvents(t))):n?t.setAttribute(Yt,""):t.removeAttribute(Yt);}_onInteraction=t=>{let n=Br$1(t);if(n instanceof HTMLElement){let r=n.closest(`[${Fe}="${this._globalRippleOptions?.namespace??""}"]`);r&&this._createRipple(r);}};_createRipple(t){if(!this._document||this._hosts.has(t))return;t.querySelector(".mat-ripple")?.remove();let n=this._document.createElement("span");n.classList.add("mat-ripple",t.getAttribute(Se)),t.append(n);let r=this._globalRippleOptions,o=this._animationsDisabled?0:r?.animation?.enterDuration??gt.enterDuration,a=this._animationsDisabled?0:r?.animation?.exitDuration??gt.exitDuration,c={rippleDisabled:this._animationsDisabled||r?.disabled||t.hasAttribute(Yt),rippleConfig:{centered:t.hasAttribute($n),terminateOnPointerUp:r?.terminateOnPointerUp,animation:{enterDuration:o,exitDuration:a}}},d=new vt(c,this._ngZone,n,this._platform,this._injector),m=!c.rippleDisabled;m&&d.setupTriggerEvents(t),this._hosts.set(t,{target:c,renderer:d,hasSetUpEvents:m}),t.removeAttribute(Fe);}destroyRipple(t){let n=this._hosts.get(t);n&&(n.renderer._removeTriggerEvents(),this._hosts.delete(t));}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})();var qn=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275cmp=dm({type:i,selectors:[["structural-styles"]],decls:0,vars:0,template:function(n,r){},styles:[`.mat-focus-indicator {
  position: relative;
}
.mat-focus-indicator::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  box-sizing: border-box;
  pointer-events: none;
  display: var(--mat-focus-indicator-display, none);
  border-width: var(--mat-focus-indicator-border-width, 3px);
  border-style: var(--mat-focus-indicator-border-style, solid);
  border-color: var(--mat-focus-indicator-border-color, transparent);
  border-radius: var(--mat-focus-indicator-border-radius, 4px);
}
.mat-focus-indicator:focus-visible::before {
  content: "";
}

@media (forced-colors: active) {
  html {
    --mat-focus-indicator-display: block;
    --mat-focus-indicator-fallback-border-style: none;
  }
}
`],encapsulation:2})}return i})();var cr=["*",[["","progressIndicator",""]]],lr=["*","[progressIndicator]"];function dr(i,e){i&1&&(Xs(0,"div",1),Mm(1,1),Js());}var ur=new I("MAT_BUTTON_CONFIG");function Zn(i){return i==null?void 0:pH(i)}var Ne=(()=>{class i{_elementRef=g(ze$1);_ngZone=g(W);_animationsDisabled=st();_config=g(ur,{optional:true});_focusMonitor=g(o4);_cleanupClick;_renderer=g(Zs);_rippleLoader=g(Wn);_isAnchor;_isFab=false;color;get disableRipple(){return this._disableRipple}set disableRipple(t){this._disableRipple=t,this._updateRippleDisabled();}_disableRipple=false;get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._updateRippleDisabled();}_disabled=false;ariaDisabled;disabledInteractive;tabIndex;set _tabindex(t){this.tabIndex=t;}showProgress=lH(false,{transform:WC});constructor(){g(Pq).load(qn);let t=this._elementRef.nativeElement;this._isAnchor=t.tagName==="A",this.disabledInteractive=this._config?.disabledInteractive??false,this.color=this._config?.color??null,this._rippleLoader?.configureRipple(t,{className:"mat-mdc-button-ripple"});}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,true),this._isAnchor&&this._setupAsAnchor();}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._rippleLoader?.destroyRipple(this._elementRef.nativeElement);}focus(t="program",n){t?this._focusMonitor.focusVia(this._elementRef.nativeElement,t,n):this._elementRef.nativeElement.focus(n);}_getAriaDisabled(){return this.ariaDisabled!=null?this.ariaDisabled:this._isAnchor?this.disabled||null:this.disabled&&this.disabledInteractive?true:null}_getDisabledAttribute(){return this.disabledInteractive||!this.disabled?null:true}_updateRippleDisabled(){this._rippleLoader?.setDisabled(this._elementRef.nativeElement,this.disableRipple||this.disabled);}_getTabIndex(){return this._isAnchor?this.disabled&&!this.disabledInteractive?-1:this.tabIndex:this.tabIndex}_setupAsAnchor(){this._cleanupClick=this._ngZone.runOutsideAngular(()=>this._renderer.listen(this._elementRef.nativeElement,"click",t=>{this.disabled&&(t.preventDefault(),t.stopImmediatePropagation());}));}static \u0275fac=function(n){return new(n||i)};static \u0275dir=Yt$1({type:i,hostAttrs:[1,"mat-mdc-button-base"],hostVars:15,hostBindings:function(n,r){n&2&&(Wu("disabled",r._getDisabledAttribute())("aria-disabled",r._getAriaDisabled())("tabindex",r._getTabIndex()),Lb(r.color?"mat-"+r.color:""),ed("mat-mdc-button-progress-indicator-shown",r.showProgress())("mat-mdc-button-disabled",r.disabled)("mat-mdc-button-disabled-interactive",r.disabledInteractive)("mat-unthemed",!r.color)("_mat-animation-noopable",r._animationsDisabled));},inputs:{color:"color",disableRipple:[2,"disableRipple","disableRipple",WC],disabled:[2,"disabled","disabled",WC],ariaDisabled:[2,"aria-disabled","ariaDisabled",WC],disabledInteractive:[2,"disabledInteractive","disabledInteractive",WC],tabIndex:[2,"tabIndex","tabIndex",Zn],_tabindex:[2,"tabindex","_tabindex",Zn],showProgress:[1,"showProgress"]}})}return i})(),mr=(()=>{class i extends Ne{constructor(){super(),this._rippleLoader.configureRipple(this._elementRef.nativeElement,{centered:true});}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=dm({type:i,selectors:[["button","mat-icon-button",""],["a","mat-icon-button",""],["button","matIconButton",""],["a","matIconButton",""]],hostAttrs:[1,"mdc-icon-button","mat-mdc-icon-button"],exportAs:["matButton","matAnchor"],features:[$u],ngContentSelectors:lr,decls:5,vars:1,consts:[[1,"mat-mdc-button-persistent-ripple","mdc-icon-button__ripple"],[1,"mat-mdc-button-progress-indicator-container"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(n,r){n&1&&(Tm(cr),Yu(0,"span",0),Mm(1),rb(2,dr,2,0,"div",1),Yu(3,"span",2)(4,"span",3)),n&2&&(Cg(2),ob(r.showProgress()?2:-1));},styles:[`.mat-mdc-icon-button {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  border: none;
  outline: none;
  background-color: transparent;
  fill: currentColor;
  text-decoration: none;
  cursor: pointer;
  z-index: 0;
  overflow: visible;
  border-radius: var(--mat-icon-button-container-shape, var(--mat-sys-corner-full, 50%));
  flex-shrink: 0;
  text-align: center;
  width: var(--mat-icon-button-state-layer-size, 40px);
  height: var(--mat-icon-button-state-layer-size, 40px);
  padding: calc(calc(var(--mat-icon-button-state-layer-size, 40px) - var(--mat-icon-button-icon-size, 24px)) / 2);
  font-size: var(--mat-icon-button-icon-size, 24px);
  color: var(--mat-icon-button-icon-color, var(--mat-sys-on-surface-variant));
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-icon-button .mat-mdc-button-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-icon-button .mdc-button__label,
.mat-mdc-icon-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-icon-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-icon-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-ripple-element {
  background-color: var(--mat-icon-button-ripple-color, color-mix(in srgb, var(--mat-sys-on-surface-variant) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-icon-button-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-icon-button-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-icon-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-icon-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-icon-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-icon-button-touch-target-size, 48px);
  display: var(--mat-icon-button-touch-target-display, block);
  left: 50%;
  width: var(--mat-icon-button-touch-target-size, 48px);
  transform: translate(-50%, -50%);
}
.mat-mdc-icon-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-icon-button[disabled], .mat-mdc-icon-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-icon-button-disabled-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-icon-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-icon-button img,
.mat-mdc-icon-button svg {
  width: var(--mat-icon-button-icon-size, 24px);
  height: var(--mat-icon-button-icon-size, 24px);
  vertical-align: baseline;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__determinate-circle-graphic {
  width: inherit;
  height: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__indeterminate-circle-graphic {
  height: 100%;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple {
  border-radius: var(--mat-icon-button-container-shape, var(--mat-sys-corner-full, 50%));
}
.mat-mdc-icon-button[hidden] {
  display: none;
}
.mat-mdc-icon-button.mat-unthemed:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-primary:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-accent:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-warn:not(.mdc-ripple-upgraded):focus::before {
  background: transparent;
  opacity: 1;
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})}return i})();var Kn=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=ot({type:i});static \u0275inj=Le$1({imports:[Ud]})}return i})();var hr=[[["",8,"material-icons",3,"iconPositionEnd",""],["mat-icon",3,"iconPositionEnd",""],["","matButtonIcon","",3,"iconPositionEnd",""]],"*",[["","iconPositionEnd","",8,"material-icons"],["mat-icon","iconPositionEnd",""],["","matButtonIcon","","iconPositionEnd",""]],[["","progressIndicator",""]]],pr=[".material-icons:not([iconPositionEnd]), mat-icon:not([iconPositionEnd]), [matButtonIcon]:not([iconPositionEnd])","*",".material-icons[iconPositionEnd], mat-icon[iconPositionEnd], [matButtonIcon][iconPositionEnd]","[progressIndicator]"];function fr(i,e){i&1&&(Xs(0,"div",2),Mm(1,3),Js());}var Yn=new Map([["text",["mat-mdc-button"]],["filled",["mdc-button--unelevated","mat-mdc-unelevated-button"]],["elevated",["mdc-button--raised","mat-mdc-raised-button"]],["outlined",["mdc-button--outlined","mat-mdc-outlined-button"]],["tonal",["mat-tonal-button"]]]),ys=(()=>{class i extends Ne{get appearance(){return this._appearance}set appearance(t){this.setAppearance(t||this._config?.defaultAppearance||"text");}_appearance=null;constructor(){super();let t=br(this._elementRef.nativeElement);t&&this.setAppearance(t);}setAppearance(t){if(t===this._appearance)return;let n=this._elementRef.nativeElement.classList,r=this._appearance?Yn.get(this._appearance):null,o=Yn.get(t);r&&n.remove(...r),n.add(...o),this._appearance=t;}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=dm({type:i,selectors:[["button","matButton",""],["a","matButton",""],["button","mat-button",""],["button","mat-raised-button",""],["button","mat-flat-button",""],["button","mat-stroked-button",""],["a","mat-button",""],["a","mat-raised-button",""],["a","mat-flat-button",""],["a","mat-stroked-button",""]],hostAttrs:[1,"mdc-button"],inputs:{appearance:[0,"matButton","appearance"]},exportAs:["matButton","matAnchor"],features:[$u],ngContentSelectors:pr,decls:8,vars:5,consts:[[1,"mat-mdc-button-persistent-ripple"],[1,"mdc-button__label"],[1,"mat-mdc-button-progress-indicator-container"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(n,r){n&1&&(Tm(hr),Yu(0,"span",0),Mm(1),Xs(2,"span",1),Mm(3,1),Js(),Mm(4,2),rb(5,fr,2,0,"div",2),Yu(6,"span",3)(7,"span",4)),n&2&&(ed("mdc-button__ripple",!r._isFab)("mdc-fab__ripple",r._isFab),Cg(5),ob(r.showProgress()?5:-1));},styles:[`.mat-mdc-button-base {
  text-decoration: none;
}
.mat-mdc-button-base .mat-icon {
  min-height: fit-content;
  flex-shrink: 0;
}
@media (hover: none) {
  .mat-mdc-button-base:hover > span.mat-mdc-button-persistent-ripple::before {
    opacity: 0;
  }
}

.mdc-button {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  border: none;
  outline: none;
  line-height: inherit;
  -webkit-appearance: none;
  overflow: visible;
  vertical-align: middle;
  background: transparent;
  padding: 0 8px;
}
.mdc-button::-moz-focus-inner {
  padding: 0;
  border: 0;
}
.mdc-button:active {
  outline: none;
}
.mdc-button:hover {
  cursor: pointer;
}
.mdc-button:disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-button[hidden] {
  display: none;
}
.mdc-button .mdc-button__label {
  position: relative;
}

.mat-mdc-button {
  padding: 0 var(--mat-button-text-horizontal-padding, 12px);
  height: var(--mat-button-text-container-height, 40px);
  font-family: var(--mat-button-text-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-text-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-text-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-text-label-text-transform);
  font-weight: var(--mat-button-text-label-text-weight, var(--mat-sys-label-large-weight));
}
.mat-mdc-button, .mat-mdc-button .mdc-button__ripple {
  border-radius: var(--mat-button-text-container-shape, var(--mat-sys-corner-full));
}
.mat-mdc-button:not(:disabled) {
  color: var(--mat-button-text-label-text-color, var(--mat-sys-primary));
}
.mat-mdc-button[disabled], .mat-mdc-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-text-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-button:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding: 0 var(--mat-button-text-with-icon-horizontal-padding, 16px);
}
.mat-mdc-button > .mat-icon {
  margin-right: var(--mat-button-text-icon-spacing, 8px);
  margin-left: var(--mat-button-text-icon-offset, -4px);
}
[dir=rtl] .mat-mdc-button > .mat-icon {
  margin-right: var(--mat-button-text-icon-offset, -4px);
  margin-left: var(--mat-button-text-icon-spacing, 8px);
}
.mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-text-icon-offset, -4px);
  margin-left: var(--mat-button-text-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-text-icon-spacing, 8px);
  margin-left: var(--mat-button-text-icon-offset, -4px);
}
.mat-mdc-button .mat-ripple-element {
  background-color: var(--mat-button-text-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-text-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-text-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-text-touch-target-size, 48px);
  display: var(--mat-button-text-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-unelevated-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-filled-container-height, 40px);
  font-family: var(--mat-button-filled-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-filled-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-filled-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-filled-label-text-transform);
  font-weight: var(--mat-button-filled-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-filled-horizontal-padding, 24px);
}
.mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--mat-button-filled-icon-spacing, 8px);
  margin-left: var(--mat-button-filled-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--mat-button-filled-icon-offset, -8px);
  margin-left: var(--mat-button-filled-icon-spacing, 8px);
}
.mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-filled-icon-offset, -8px);
  margin-left: var(--mat-button-filled-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-filled-icon-spacing, 8px);
  margin-left: var(--mat-button-filled-icon-offset, -8px);
}
.mat-mdc-unelevated-button .mat-ripple-element {
  background-color: var(--mat-button-filled-ripple-color, color-mix(in srgb, var(--mat-sys-on-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-filled-state-layer-color, var(--mat-sys-on-primary));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-filled-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-unelevated-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-unelevated-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-unelevated-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-unelevated-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-filled-touch-target-size, 48px);
  display: var(--mat-button-filled-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-unelevated-button:not(:disabled) {
  color: var(--mat-button-filled-label-text-color, var(--mat-sys-on-primary));
  background-color: var(--mat-button-filled-container-color, var(--mat-sys-primary));
}
.mat-mdc-unelevated-button, .mat-mdc-unelevated-button .mdc-button__ripple {
  border-radius: var(--mat-button-filled-container-shape, var(--mat-sys-corner-full));
}
.mat-mdc-unelevated-button .mat-mdc-button-progress-indicator-container {
  --mat-progress-spinner-active-indicator-color: var(--mat-button-filled-progress-active-indicator-color, var(--mat-sys-on-primary));
}
.mat-mdc-unelevated-button[disabled], .mat-mdc-unelevated-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-filled-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-filled-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-raised-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--mat-button-protected-container-elevation-shadow, var(--mat-sys-level1));
  height: var(--mat-button-protected-container-height, 40px);
  font-family: var(--mat-button-protected-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-protected-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-protected-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-protected-label-text-transform);
  font-weight: var(--mat-button-protected-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-protected-horizontal-padding, 24px);
}
.mat-mdc-raised-button > .mat-icon {
  margin-right: var(--mat-button-protected-icon-spacing, 8px);
  margin-left: var(--mat-button-protected-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-raised-button > .mat-icon {
  margin-right: var(--mat-button-protected-icon-offset, -8px);
  margin-left: var(--mat-button-protected-icon-spacing, 8px);
}
.mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-protected-icon-offset, -8px);
  margin-left: var(--mat-button-protected-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-protected-icon-spacing, 8px);
  margin-left: var(--mat-button-protected-icon-offset, -8px);
}
.mat-mdc-raised-button .mat-ripple-element {
  background-color: var(--mat-button-protected-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-protected-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-raised-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-protected-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-raised-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-raised-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-raised-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-raised-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-protected-touch-target-size, 48px);
  display: var(--mat-button-protected-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-raised-button:not(:disabled) {
  color: var(--mat-button-protected-label-text-color, var(--mat-sys-primary));
  background-color: var(--mat-button-protected-container-color, var(--mat-sys-surface));
}
.mat-mdc-raised-button, .mat-mdc-raised-button .mdc-button__ripple {
  border-radius: var(--mat-button-protected-container-shape, var(--mat-sys-corner-full));
}
@media (hover: hover) {
  .mat-mdc-raised-button:hover {
    box-shadow: var(--mat-button-protected-hover-container-elevation-shadow, var(--mat-sys-level2));
  }
}
.mat-mdc-raised-button:focus {
  box-shadow: var(--mat-button-protected-focus-container-elevation-shadow, var(--mat-sys-level1));
}
.mat-mdc-raised-button:active, .mat-mdc-raised-button:focus:active {
  box-shadow: var(--mat-button-protected-pressed-container-elevation-shadow, var(--mat-sys-level1));
}
.mat-mdc-raised-button[disabled], .mat-mdc-raised-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-protected-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-protected-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-raised-button[disabled].mat-mdc-button-disabled, .mat-mdc-raised-button.mat-mdc-button-disabled.mat-mdc-button-disabled {
  box-shadow: var(--mat-button-protected-disabled-container-elevation-shadow, var(--mat-sys-level0));
}
.mat-mdc-raised-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-outlined-button {
  border-style: solid;
  transition: border 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-outlined-container-height, 40px);
  font-family: var(--mat-button-outlined-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-outlined-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-outlined-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-outlined-label-text-transform);
  font-weight: var(--mat-button-outlined-label-text-weight, var(--mat-sys-label-large-weight));
  border-radius: var(--mat-button-outlined-container-shape, var(--mat-sys-corner-full));
  border-width: var(--mat-button-outlined-outline-width, 1px);
  padding: 0 var(--mat-button-outlined-horizontal-padding, 24px);
}
.mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--mat-button-outlined-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--mat-button-outlined-icon-offset, -8px);
  margin-left: var(--mat-button-outlined-icon-spacing, 8px);
}
.mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-outlined-icon-offset, -8px);
  margin-left: var(--mat-button-outlined-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--mat-button-outlined-icon-offset, -8px);
}
.mat-mdc-outlined-button .mat-ripple-element {
  background-color: var(--mat-button-outlined-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-outlined-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-outlined-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-outlined-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-outlined-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-outlined-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-outlined-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-outlined-touch-target-size, 48px);
  display: var(--mat-button-outlined-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-outlined-button:not(:disabled) {
  color: var(--mat-button-outlined-label-text-color, var(--mat-sys-primary));
  border-color: var(--mat-button-outlined-outline-color, var(--mat-sys-outline));
}
.mat-mdc-outlined-button[disabled], .mat-mdc-outlined-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-outlined-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: var(--mat-button-outlined-disabled-outline-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-tonal-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-tonal-container-height, 40px);
  font-family: var(--mat-button-tonal-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-tonal-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-tonal-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-tonal-label-text-transform);
  font-weight: var(--mat-button-tonal-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-tonal-horizontal-padding, 24px);
}
.mat-tonal-button:not(:disabled) {
  color: var(--mat-button-tonal-label-text-color, var(--mat-sys-on-secondary-container));
  background-color: var(--mat-button-tonal-container-color, var(--mat-sys-secondary-container));
}
.mat-tonal-button, .mat-tonal-button .mdc-button__ripple {
  border-radius: var(--mat-button-tonal-container-shape, var(--mat-sys-corner-full));
}
.mat-tonal-button[disabled], .mat-tonal-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-tonal-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-tonal-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-tonal-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-tonal-button > .mat-icon {
  margin-right: var(--mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--mat-button-tonal-icon-offset, -8px);
}
[dir=rtl] .mat-tonal-button > .mat-icon {
  margin-right: var(--mat-button-tonal-icon-offset, -8px);
  margin-left: var(--mat-button-tonal-icon-spacing, 8px);
}
.mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-tonal-icon-offset, -8px);
  margin-left: var(--mat-button-tonal-icon-spacing, 8px);
}
[dir=rtl] .mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--mat-button-tonal-icon-offset, -8px);
}
.mat-tonal-button .mat-ripple-element {
  background-color: var(--mat-button-tonal-ripple-color, color-mix(in srgb, var(--mat-sys-on-secondary-container) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-tonal-state-layer-color, var(--mat-sys-on-secondary-container));
}
.mat-tonal-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-tonal-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-tonal-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-tonal-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-tonal-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-tonal-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-tonal-touch-target-size, 48px);
  display: var(--mat-button-tonal-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-button,
.mat-mdc-unelevated-button,
.mat-mdc-raised-button,
.mat-mdc-outlined-button,
.mat-tonal-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-button .mdc-button__label,
.mat-mdc-button .mat-icon,
.mat-mdc-unelevated-button .mdc-button__label,
.mat-mdc-unelevated-button .mat-icon,
.mat-mdc-raised-button .mdc-button__label,
.mat-mdc-raised-button .mat-icon,
.mat-mdc-outlined-button .mdc-button__label,
.mat-mdc-outlined-button .mat-icon,
.mat-tonal-button .mdc-button__label,
.mat-tonal-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-button .mat-focus-indicator,
.mat-mdc-unelevated-button .mat-focus-indicator,
.mat-mdc-raised-button .mat-focus-indicator,
.mat-mdc-outlined-button .mat-focus-indicator,
.mat-tonal-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-unelevated-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-raised-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-outlined-button:focus-visible > .mat-focus-indicator::before,
.mat-tonal-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-button._mat-animation-noopable,
.mat-mdc-unelevated-button._mat-animation-noopable,
.mat-mdc-raised-button._mat-animation-noopable,
.mat-mdc-outlined-button._mat-animation-noopable,
.mat-tonal-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-button > .mat-icon,
.mat-mdc-unelevated-button > .mat-icon,
.mat-mdc-raised-button > .mat-icon,
.mat-mdc-outlined-button > .mat-icon,
.mat-tonal-button > .mat-icon {
  display: inline-block;
  position: relative;
  vertical-align: top;
  font-size: 1.125rem;
  height: 1.125rem;
  width: 1.125rem;
}

.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mdc-button__ripple {
  top: -1px;
  left: -1px;
  bottom: -1px;
  right: -1px;
}

.mat-mdc-unelevated-button .mat-focus-indicator::before,
.mat-tonal-button .mat-focus-indicator::before,
.mat-mdc-raised-button .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 2px) * -1);
}

.mat-mdc-outlined-button .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 3px) * -1);
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon,
.mat-mdc-button-progress-indicator-shown [matButtonIcon],
.mat-mdc-button-progress-indicator-shown .mdc-button__label {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})}return i})();function br(i){return i.hasAttribute("mat-raised-button")?"elevated":i.hasAttribute("mat-stroked-button")?"outlined":i.hasAttribute("mat-flat-button")?"filled":i.hasAttribute("mat-button")?"text":null}var Cs=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=ot({type:i});static \u0275inj=Le$1({imports:[Kn,Ud]})}return i})();function Qn(i){return Error(`Unable to find icon with the name "${i}"`)}function gr(){return Error("Could not find HttpClient for use with Angular Material icons. Please add provideHttpClient() to your providers.")}function Xn(i){return Error(`The URL provided to MatIconRegistry was not trusted as a resource URL via Angular's DomSanitizer. Attempted URL was "${i}".`)}function Jn(i){return Error(`The literal provided to MatIconRegistry was not trusted as safe HTML by Angular's DomSanitizer. Attempted literal was "${i}".`)}var R=class{url;svgText;options;svgElement=null;constructor(e,t,n){this.url=e,this.svgText=t,this.options=n;}},ei=(()=>{class i{_httpClient;_sanitizer;_errorHandler;_document;_svgIconConfigs=new Map;_iconSetConfigs=new Map;_cachedIconsByUrl=new Map;_inProgressUrlFetches=new Map;_fontCssClassesByAlias=new Map;_resolvers=[];_defaultFontSetClass=["material-icons","mat-ligature-font"];constructor(t,n,r,o){this._httpClient=t,this._sanitizer=n,this._errorHandler=o,this._document=r;}addSvgIcon(t,n,r){return this.addSvgIconInNamespace("",t,n,r)}addSvgIconLiteral(t,n,r){return this.addSvgIconLiteralInNamespace("",t,n,r)}addSvgIconInNamespace(t,n,r,o){return this._addSvgIconConfig(t,n,new R(r,null,o))}addSvgIconResolver(t){return this._resolvers.push(t),this}addSvgIconLiteralInNamespace(t,n,r,o){let a=this._sanitizer.sanitize(Ge$1.HTML,r);if(!a)throw Jn(r);let c=K(a);return this._addSvgIconConfig(t,n,new R("",c,o))}addSvgIconSet(t,n){return this.addSvgIconSetInNamespace("",t,n)}addSvgIconSetLiteral(t,n){return this.addSvgIconSetLiteralInNamespace("",t,n)}addSvgIconSetInNamespace(t,n,r){return this._addSvgIconSetConfig(t,new R(n,null,r))}addSvgIconSetLiteralInNamespace(t,n,r){let o=this._sanitizer.sanitize(Ge$1.HTML,n);if(!o)throw Jn(n);let a=K(o);return this._addSvgIconSetConfig(t,new R("",a,r))}registerFontClassAlias(t,n=t){return this._fontCssClassesByAlias.set(t,n),this}classNameForFontAlias(t){return this._fontCssClassesByAlias.get(t)||t}setDefaultFontSetClass(...t){return this._defaultFontSetClass=t,this}getDefaultFontSetClass(){return this._defaultFontSetClass}getSvgIconFromUrl(t){let n=this._sanitizer.sanitize(Ge$1.RESOURCE_URL,t);if(!n)throw Xn(t);let r=this._cachedIconsByUrl.get(n);return r?te$1(Qt(r)):this._loadSvgIconFromConfig(new R(t,null)).pipe(cc$1(o=>this._cachedIconsByUrl.set(n,o)),le$1(o=>Qt(o)))}getNamedSvgIcon(t,n=""){let r=ti(n,t),o=this._svgIconConfigs.get(r);if(o)return this._getSvgFromConfig(o);if(o=this._getIconConfigFromResolvers(n,t),o)return this._svgIconConfigs.set(r,o),this._getSvgFromConfig(o);let a=this._iconSetConfigs.get(n);return a?this._getSvgFromIconSetConfigs(t,a):Qa(Qn(r))}ngOnDestroy(){this._resolvers=[],this._svgIconConfigs.clear(),this._iconSetConfigs.clear(),this._cachedIconsByUrl.clear();}_getSvgFromConfig(t){return t.svgText?te$1(Qt(this._svgElementFromConfig(t))):this._loadSvgIconFromConfig(t).pipe(le$1(n=>Qt(n)))}_getSvgFromIconSetConfigs(t,n){let r=this._extractIconWithNameFromAnySet(t,n);if(r)return te$1(r);let o=n.filter(a=>!a.svgText).map(a=>this._loadSvgIconSetFromConfig(a).pipe(Rf(c=>{let m=`Loading icon set URL: ${this._sanitizer.sanitize(Ge$1.RESOURCE_URL,a.url)} failed: ${c.message}`;return this._errorHandler.handleError(new Error(m)),te$1(null)})));return Qv(o).pipe(le$1(()=>{let a=this._extractIconWithNameFromAnySet(t,n);if(!a)throw Qn(t);return a}))}_extractIconWithNameFromAnySet(t,n){for(let r=n.length-1;r>=0;r--){let o=n[r];if(o.svgText&&o.svgText.toString().indexOf(t)>-1){let a=this._svgElementFromConfig(o),c=this._extractSvgIconFromSet(a,t,o.options);if(c)return c}}return null}_loadSvgIconFromConfig(t){return this._fetchIcon(t).pipe(cc$1(n=>t.svgText=n),le$1(()=>this._svgElementFromConfig(t)))}_loadSvgIconSetFromConfig(t){return t.svgText?te$1(null):this._fetchIcon(t).pipe(cc$1(n=>t.svgText=n))}_extractSvgIconFromSet(t,n,r){let o=t.querySelector(`[id="${n}"]`);if(!o)return null;let a=o.cloneNode(true);if(a.removeAttribute("id"),a.nodeName.toLowerCase()==="svg")return this._setSvgAttributes(a,r);if(a.nodeName.toLowerCase()==="symbol")return this._setSvgAttributes(this._toSvgElement(a),r);let c=this._svgElementFromString(K("<svg></svg>"));return c.appendChild(a),this._setSvgAttributes(c,r)}_svgElementFromString(t){let n=this._document.createElement("DIV");n.innerHTML=t;let r=n.querySelector("svg");if(!r)throw Error("<svg> tag not found");return r}_toSvgElement(t){let n=this._svgElementFromString(K("<svg></svg>")),r=t.attributes;for(let o=0;o<r.length;o++){let{name:a,value:c}=r[o];a!=="id"&&n.setAttribute(a,c);}for(let o=0;o<t.childNodes.length;o++)t.childNodes[o].nodeType===this._document.ELEMENT_NODE&&n.appendChild(t.childNodes[o].cloneNode(true));return n}_setSvgAttributes(t,n){return t.setAttribute("fit",""),t.setAttribute("height","100%"),t.setAttribute("width","100%"),t.setAttribute("preserveAspectRatio","xMidYMid meet"),t.setAttribute("focusable","false"),n&&n.viewBox&&t.setAttribute("viewBox",n.viewBox),t}_fetchIcon(t){let{url:n,options:r}=t,o=r?.withCredentials??false;if(!this._httpClient)throw gr();if(n==null)throw Error(`Cannot fetch icon from URL "${n}".`);let a=this._sanitizer.sanitize(Ge$1.RESOURCE_URL,n);if(!a)throw Xn(n);let c=this._inProgressUrlFetches.get(a);if(c)return c;let d=this._httpClient.get(a,{responseType:"text",withCredentials:o}).pipe(le$1(m=>K(m)),ki(()=>this._inProgressUrlFetches.delete(a)),sc());return this._inProgressUrlFetches.set(a,d),d}_addSvgIconConfig(t,n,r){return this._svgIconConfigs.set(ti(t,n),r),this}_addSvgIconSetConfig(t,n){let r=this._iconSetConfigs.get(t);return r?r.push(n):this._iconSetConfigs.set(t,[n]),this}_svgElementFromConfig(t){if(!t.svgElement){let n=this._svgElementFromString(t.svgText);this._setSvgAttributes(n,t.options),t.svgElement=n;}return t.svgElement}_getIconConfigFromResolvers(t,n){for(let r=0;r<this._resolvers.length;r++){let o=this._resolvers[r](n,t);if(o)return vr(o)?new R(o.url,null,o.options):new R(o,null)}}static \u0275fac=function(n){return new(n||i)(A(US,8),A(VS),A(V,8),A(_e))};static \u0275prov=S({token:i,factory:i.\u0275fac,providedIn:"root"})}return i})();function Qt(i){return i.cloneNode(true)}function ti(i,e){return i+":"+e}function vr(i){return !!(i.url&&i.options)}var _r=["*"],yr=new I("MAT_ICON_DEFAULT_OPTIONS"),Cr=new I("mat-icon-location",{providedIn:"root",factory:()=>{let i=g(V),e=i?i.location:null;return {getPathname:()=>e?e.pathname+e.search:""}}}),ni=["clip-path","color-profile","src","cursor","fill","filter","marker","marker-start","marker-mid","marker-end","mask","stroke"],Er=ni.map(i=>`[${i}]`).join(", "),xr=/^url\(['"]?#(.*?)['"]?\)$/,Hs=(()=>{class i{_elementRef=g(ze$1);_iconRegistry=g(ei);_location=g(Cr);_errorHandler=g(_e);_defaultColor;get color(){return this._color||this._defaultColor}set color(t){this._color=t;}_color;inline=false;get svgIcon(){return this._svgIcon}set svgIcon(t){t!==this._svgIcon&&(t?this._updateSvgIcon(t):this._svgIcon&&this._clearSvgElement(),this._svgIcon=t);}_svgIcon;get fontSet(){return this._fontSet}set fontSet(t){let n=this._cleanupFontValue(t);n!==this._fontSet&&(this._fontSet=n,this._updateFontIconClasses());}_fontSet;get fontIcon(){return this._fontIcon}set fontIcon(t){let n=this._cleanupFontValue(t);n!==this._fontIcon&&(this._fontIcon=n,this._updateFontIconClasses());}_fontIcon;_previousFontSetClass=[];_previousFontIconClass;_svgName=null;_svgNamespace=null;_previousPath;_elementsWithExternalReferences;_currentIconFetch=G.EMPTY;constructor(){let t=g(new ny("aria-hidden"),{optional:true}),n=g(yr,{optional:true});n&&(n.color&&(this.color=this._defaultColor=n.color),n.fontSet&&(this.fontSet=n.fontSet)),t||this._elementRef.nativeElement.setAttribute("aria-hidden","true");}_splitIconName(t){if(!t)return ["",""];let n=t.split(":");switch(n.length){case 1:return ["",n[0]];case 2:return n;default:throw Error(`Invalid icon name: "${t}"`)}}ngOnInit(){this._updateFontIconClasses();}ngAfterViewChecked(){let t=this._elementsWithExternalReferences;if(t&&t.size){let n=this._location.getPathname();n!==this._previousPath&&(this._previousPath=n,this._prependPathToReferences(n));}}ngOnDestroy(){this._currentIconFetch.unsubscribe(),this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear();}_usingFontIcon(){return !this.svgIcon}_setSvgElement(t){this._clearSvgElement();let n=this._location.getPathname();this._previousPath=n,this._cacheChildrenWithExternalReferences(t),this._prependPathToReferences(n),this._elementRef.nativeElement.appendChild(t);}_clearSvgElement(){let t=this._elementRef.nativeElement,n=t.childNodes.length;for(this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear();n--;){let r=t.childNodes[n];(r.nodeType!==1||r.nodeName.toLowerCase()==="svg")&&r.remove();}}_updateFontIconClasses(){if(!this._usingFontIcon())return;let t=this._elementRef.nativeElement,n=(this.fontSet?this._iconRegistry.classNameForFontAlias(this.fontSet).split(/ +/):this._iconRegistry.getDefaultFontSetClass()).filter(r=>r.length>0);this._previousFontSetClass.forEach(r=>t.classList.remove(r)),n.forEach(r=>t.classList.add(r)),this._previousFontSetClass=n,this.fontIcon!==this._previousFontIconClass&&!n.includes("mat-ligature-font")&&(this._previousFontIconClass&&t.classList.remove(this._previousFontIconClass),this.fontIcon&&t.classList.add(this.fontIcon),this._previousFontIconClass=this.fontIcon);}_cleanupFontValue(t){return typeof t=="string"?t.trim().split(" ")[0]:t}_prependPathToReferences(t){let n=this._elementsWithExternalReferences;n&&n.forEach((r,o)=>{r.forEach(a=>{o.setAttribute(a.name,`url('${t}#${a.value}')`);});});}_cacheChildrenWithExternalReferences(t){let n=t.querySelectorAll(Er),r=this._elementsWithExternalReferences=this._elementsWithExternalReferences||new Map;for(let o=0;o<n.length;o++)ni.forEach(a=>{let c=n[o],d=c.getAttribute(a),m=d?d.match(xr):null;if(m){let h=r.get(c);h||(h=[],r.set(c,h)),h.push({name:a,value:m[1]});}});}_updateSvgIcon(t){if(this._svgNamespace=null,this._svgName=null,this._currentIconFetch.unsubscribe(),t){let[n,r]=this._splitIconName(t);n&&(this._svgNamespace=n),r&&(this._svgName=r),this._currentIconFetch=this._iconRegistry.getNamedSvgIcon(r,n).pipe(fn(1)).subscribe(o=>this._setSvgElement(o),o=>{let a=`Error retrieving icon ${n}:${r}! ${o.message}`;this._errorHandler.handleError(new Error(a));});}}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=dm({type:i,selectors:[["mat-icon"]],hostAttrs:["role","img",1,"mat-icon","notranslate"],hostVars:10,hostBindings:function(n,r){n&2&&(Wu("data-mat-icon-type",r._usingFontIcon()?"font":"svg")("data-mat-icon-name",r._svgName||r.fontIcon)("data-mat-icon-namespace",r._svgNamespace||r.fontSet)("fontIcon",r._usingFontIcon()?r.fontIcon:null),Lb(r.color?"mat-"+r.color:""),ed("mat-icon-inline",r.inline)("mat-icon-no-color",r.color!=="primary"&&r.color!=="accent"&&r.color!=="warn"));},inputs:{color:"color",inline:[2,"inline","inline",WC],svgIcon:"svgIcon",fontSet:"fontSet",fontIcon:"fontIcon"},exportAs:["matIcon"],ngContentSelectors:_r,decls:1,vars:0,template:function(n,r){n&1&&(Tm(),Mm(0));},styles:[`mat-icon, mat-icon.mat-primary, mat-icon.mat-accent, mat-icon.mat-warn {
  color: var(--mat-icon-color, inherit);
}

.mat-icon {
  -webkit-user-select: none;
  user-select: none;
  background-repeat: no-repeat;
  display: inline-block;
  fill: currentColor;
  height: 24px;
  width: 24px;
  overflow: hidden;
}
.mat-icon.mat-icon-inline {
  font-size: inherit;
  height: inherit;
  line-height: inherit;
  width: inherit;
}
.mat-icon.mat-ligature-font[fontIcon]::before {
  content: attr(fontIcon);
}

[dir=rtl] .mat-icon-rtl-mirror {
  transform: scale(-1, 1);
}

.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon,
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon {
  display: block;
}
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-icon,
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-icon {
  margin: auto;
}
`],encapsulation:2})}return i})(),zs=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=ot({type:i});static \u0275inj=Le$1({imports:[Ud]})}return i})();var di=(()=>{class i{_renderer;_elementRef;onChange=t=>{};onTouched=()=>{};constructor(t,n){this._renderer=t,this._elementRef=n;}setProperty(t,n){this._renderer.setProperty(this._elementRef.nativeElement,t,n);}registerOnTouched(t){this.onTouched=t;}registerOnChange(t){this.onChange=t;}setDisabledState(t){this.setProperty("disabled",t);}static \u0275fac=function(n){return new(n||i)(qt$1(Zs),qt$1(ze$1))};static \u0275dir=Yt$1({type:i})}return i})(),Ar=(()=>{class i extends di{static \u0275fac=(()=>{let t;return function(r){return (t||(t=tu(i)))(r||i)}})();static \u0275dir=Yt$1({type:i,features:[$u]})}return i})(),Be=new I("");var wr={provide:Be,useExisting:io$1(()=>ui),multi:true};function Dr(){let i=Et$1()?Et$1().getUserAgent():"";return /android (\d+)/.test(i.toLowerCase())}var Mr=new I(""),ui=(()=>{class i extends di{_compositionMode;_composing=false;constructor(t,n,r){super(t,n),this._compositionMode=r,this._compositionMode==null&&(this._compositionMode=!Dr());}writeValue(t){let n=t??"";this.setProperty("value",n);}_handleInput(t){(!this._compositionMode||this._compositionMode&&!this._composing)&&this.onChange(t);}_compositionStart(){this._composing=true;}_compositionEnd(t){this._composing=false,this._compositionMode&&this.onChange(t);}static \u0275fac=function(n){return new(n||i)(qt$1(Zs),qt$1(ze$1),qt$1(Mr,8))};static \u0275dir=Yt$1({type:i,selectors:[["input","formControlName","",3,"type","checkbox",3,"ngNoCva",""],["textarea","formControlName","",3,"ngNoCva",""],["input","formControl","",3,"type","checkbox",3,"ngNoCva",""],["textarea","formControl","",3,"ngNoCva",""],["input","ngModel","",3,"type","checkbox",3,"ngNoCva",""],["textarea","ngModel","",3,"ngNoCva",""],["","ngDefaultControl",""]],hostBindings:function(n,r){n&1&&Cm("input",function(a){return r._handleInput(a.target.value)})("blur",function(){return r.onTouched()})("compositionstart",function(){return r._compositionStart()})("compositionend",function(a){return r._compositionEnd(a.target.value)});},standalone:false,features:[nd([wr]),$u]})}return i})();function je(i){return i==null||Ue(i)===0}function Ue(i){return i==null?null:Array.isArray(i)||typeof i=="string"?i.length:i instanceof Set?i.size:null}var wt=new I(""),ce=new I(""),Ir=/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,Te=class{static min(e){return Vr(e)}static max(e){return Fr(e)}static required(e){return mi(e)}static requiredTrue(e){return Sr(e)}static email(e){return Nr(e)}static minLength(e){return Tr(e)}static maxLength(e){return kr(e)}static pattern(e){return Or(e)}static nullValidator(e){return Jt()}static compose(e){return vi(e)}static composeAsync(e){return _i(e)}};function Vr(i){return e=>{if(e.value==null||i==null)return null;let t=parseFloat(e.value);return !isNaN(t)&&t<i?{min:{min:i,actual:e.value}}:null}}function Fr(i){return e=>{if(e.value==null||i==null)return null;let t=parseFloat(e.value);return !isNaN(t)&&t>i?{max:{max:i,actual:e.value}}:null}}function mi(i){return je(i.value)?{required:true}:null}function Sr(i){return i.value===true?null:{required:true}}function Nr(i){return je(i.value)||Ir.test(i.value)?null:{email:true}}function Tr(i){return e=>{let t=e.value?.length??Ue(e.value);return t===null||t===0?null:t<i?{minlength:{requiredLength:i,actualLength:t}}:null}}function kr(i){return e=>{let t=e.value?.length??Ue(e.value);return t!==null&&t>i?{maxlength:{requiredLength:i,actualLength:t}}:null}}function Or(i){if(!i)return Jt;let e,t;return typeof i=="string"?(t="",i.charAt(0)!=="^"&&(t+="^"),t+=i,i.charAt(i.length-1)!=="$"&&(t+="$"),e=new RegExp(t)):(t=i.toString(),e=i),n=>{if(je(n.value))return null;let r=n.value;return e.test(r)?null:{pattern:{requiredPattern:t,actualValue:r}}}}function Jt(i){return null}function hi(i){return i!=null}function pi(i){return Qs(i)?ye(i):i}function fi(i){let e={};return i.forEach(t=>{e=t!=null?r$1(r$1({},e),t):e;}),Object.keys(e).length===0?null:e}function bi(i,e){return e.map(t=>t(i))}function Rr(i){return !i.validate}function gi(i){return i.map(e=>Rr(e)?e:t=>e.validate(t))}function vi(i){if(!i)return null;let e=i.filter(hi);return e.length==0?null:function(t){return fi(bi(t,e))}}function He(i){return i!=null?vi(gi(i)):null}function _i(i){if(!i)return null;let e=i.filter(hi);return e.length==0?null:function(t){let n=bi(t,e).map(pi);return Qv(n).pipe(le$1(fi))}}function ze(i){return i!=null?_i(gi(i)):null}function ii(i,e){return i===null?[e]:Array.isArray(i)?[...i,e]:[i,e]}function yi(i){return i._rawValidators}function Ci(i){return i._rawAsyncValidators}function ke(i){return i?Array.isArray(i)?i:[i]:[]}function te(i,e){return Array.isArray(i)?i.includes(e):i===e}function ri(i,e){let t=ke(e);return ke(i).forEach(r=>{te(t,r)||t.push(r);}),t}function oi(i,e){return ke(e).filter(t=>!te(i,t))}var ee=class{get value(){return this.control?this.control.value:null}get valid(){return this.control?this.control.valid:null}get invalid(){return this.control?this.control.invalid:null}get pending(){return this.control?this.control.pending:null}get disabled(){return this.control?this.control.disabled:null}get enabled(){return this.control?this.control.enabled:null}get errors(){return this.control?this.control.errors:null}get pristine(){return this.control?this.control.pristine:null}get dirty(){return this.control?this.control.dirty:null}get touched(){return this.control?this.control.touched:null}get status(){return this.control?this.control.status:null}get untouched(){return this.control?this.control.untouched:null}get statusChanges(){return this.control?this.control.statusChanges:null}get valueChanges(){return this.control?this.control.valueChanges:null}get path(){return null}_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators=[];_rawAsyncValidators=[];_setValidators(e){this._rawValidators=e||[],this._composedValidatorFn=He(this._rawValidators);}_setAsyncValidators(e){this._rawAsyncValidators=e||[],this._composedAsyncValidatorFn=ze(this._rawAsyncValidators);}get validator(){return this._composedValidatorFn||null}get asyncValidator(){return this._composedAsyncValidatorFn||null}_onDestroyCallbacks=[];_registerOnDestroy(e){this._onDestroyCallbacks.push(e);}_invokeOnDestroyCallbacks(){this._onDestroyCallbacks.forEach(e=>e()),this._onDestroyCallbacks=[];}reset(e=void 0){this.control?.reset(e);}hasError(e,t){return this.control?this.control.hasError(e,t):false}getError(e,t){return this.control?this.control.getError(e,t):null}},j=class extends ee{name;get formDirective(){return null}get path(){return null}};var _t="VALID",Xt="INVALID",ct="PENDING",yt="DISABLED",U=class{},ne=class extends U{value;source;constructor(e,t){super(),this.value=e,this.source=t;}},Et=class extends U{pristine;source;constructor(e,t){super(),this.pristine=e,this.source=t;}},xt=class extends U{touched;source;constructor(e,t){super(),this.touched=e,this.source=t;}},lt=class extends U{status;source;constructor(e,t){super(),this.status=e,this.source=t;}},ie=class extends U{source;constructor(e){super(),this.source=e;}},Q=class extends U{source;constructor(e){super(),this.source=e;}};function Ge(i){return (le(i)?i.validators:i)||null}function Pr(i){return Array.isArray(i)?He(i):i||null}function $e(i,e){return (le(e)?e.asyncValidators:i)||null}function Lr(i){return Array.isArray(i)?ze(i):i||null}function le(i){return i!=null&&!Array.isArray(i)&&typeof i=="object"}function Ei(i,e,t){let n=i.controls;if(!(e?Object.keys(n):n).length)throw new m(1e3,"");if(!Ai(n,t))throw new m(1001,"")}function xi(i,e,t){i._forEachChild((n,r)=>{if(t[r]===void 0)throw new m(-1002,"")});}var dt=class{_pendingDirty=false;_hasOwnPendingAsyncValidator=null;_pendingTouched=false;_onCollectionChange=()=>{};_updateOn;_hasRequired=O(false);_parent=null;_asyncValidationSubscription;_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators;_rawAsyncValidators;value;constructor(e,t){this._assignValidators(e),this._assignAsyncValidators(t);}get validator(){return this._composedValidatorFn}set validator(e){this._rawValidators=this._composedValidatorFn=e,this._updateHasRequiredValidator();}get asyncValidator(){return this._composedAsyncValidatorFn}set asyncValidator(e){this._rawAsyncValidators=this._composedAsyncValidatorFn=e;}get parent(){return this._parent}get status(){return vt$1(this.statusReactive)}set status(e){vt$1(()=>this.statusReactive.set(e));}_status=Bo(()=>this.statusReactive());statusReactive=O(void 0);get valid(){return this.status===_t}get invalid(){return this.status===Xt}get pending(){return this.status===ct}get disabled(){return this.status===yt}get enabled(){return this.status!==yt}errors;get pristine(){return vt$1(this.pristineReactive)}set pristine(e){vt$1(()=>this.pristineReactive.set(e));}_pristine=Bo(()=>this.pristineReactive());pristineReactive=O(true);get dirty(){return !this.pristine}get touched(){return vt$1(this.touchedReactive)}set touched(e){vt$1(()=>this.touchedReactive.set(e));}_touched=Bo(()=>this.touchedReactive());touchedReactive=O(false);get untouched(){return !this.touched}_events=new j$1;events=this._events.asObservable();valueChanges;statusChanges;get updateOn(){return this._updateOn?this._updateOn:this.parent?this.parent.updateOn:"change"}setValidators(e){this._assignValidators(e);}setAsyncValidators(e){this._assignAsyncValidators(e);}addValidators(e){this.setValidators(ri(e,this._rawValidators));}addAsyncValidators(e){this.setAsyncValidators(ri(e,this._rawAsyncValidators));}removeValidators(e){this.setValidators(oi(e,this._rawValidators));}removeAsyncValidators(e){this.setAsyncValidators(oi(e,this._rawAsyncValidators));}hasValidator(e){return te(this._rawValidators,e)}hasAsyncValidator(e){return te(this._rawAsyncValidators,e)}clearValidators(){this.validator=null;}clearAsyncValidators(){this.asyncValidator=null;}markAsTouched(e={}){let t=this.touched===false;this.touched=true;let n=e.sourceControl??this;e.onlySelf||this._parent?.markAsTouched(s(r$1({},e),{sourceControl:n})),t&&e.emitEvent!==false&&this._events.next(new xt(true,n));}markAllAsDirty(e={}){this.markAsDirty({onlySelf:true,emitEvent:e.emitEvent,sourceControl:this}),this._forEachChild(t=>t.markAllAsDirty(e));}markAllAsTouched(e={}){this.markAsTouched({onlySelf:true,emitEvent:e.emitEvent,sourceControl:this}),this._forEachChild(t=>t.markAllAsTouched(e));}markAsUntouched(e={}){let t=this.touched===true;this.touched=false,this._pendingTouched=false;let n=e.sourceControl??this;this._forEachChild(r=>{r.markAsUntouched({onlySelf:true,emitEvent:e.emitEvent,sourceControl:n});}),e.onlySelf||this._parent?._updateTouched(e,n),t&&e.emitEvent!==false&&this._events.next(new xt(false,n));}markAsDirty(e={}){let t=this.pristine===true;this.pristine=false;let n=e.sourceControl??this;e.onlySelf||this._parent?.markAsDirty(s(r$1({},e),{sourceControl:n})),t&&e.emitEvent!==false&&this._events.next(new Et(false,n));}markAsPristine(e={}){let t=this.pristine===false;this.pristine=true,this._pendingDirty=false;let n=e.sourceControl??this;this._forEachChild(r=>{r.markAsPristine({onlySelf:true,emitEvent:e.emitEvent});}),e.onlySelf||this._parent?._updatePristine(e,n),t&&e.emitEvent!==false&&this._events.next(new Et(true,n));}markAsPending(e={}){this.status=ct;let t=e.sourceControl??this;e.emitEvent!==false&&(this._events.next(new lt(this.status,t)),this.statusChanges.emit(this.status)),e.onlySelf||this._parent?.markAsPending(s(r$1({},e),{sourceControl:t}));}disable(e={}){let t=this._parentMarkedDirty(e.onlySelf);this.status=yt,this.errors=null,this._forEachChild(r=>{r.disable(s(r$1({},e),{onlySelf:true}));}),this._updateValue();let n=e.sourceControl??this;e.emitEvent!==false&&(this._events.next(new ne(this.value,n)),this._events.next(new lt(this.status,n)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),this._updateAncestors(s(r$1({},e),{skipPristineCheck:t}),this),this._onDisabledChange.forEach(r=>r(true));}enable(e={}){let t=this._parentMarkedDirty(e.onlySelf);this.status=_t,this._forEachChild(n=>{n.enable(s(r$1({},e),{onlySelf:true}));}),this.updateValueAndValidity({onlySelf:true,emitEvent:e.emitEvent}),this._updateAncestors(s(r$1({},e),{skipPristineCheck:t}),this),this._onDisabledChange.forEach(n=>n(false));}_updateAncestors(e,t){e.onlySelf||(this._parent?.updateValueAndValidity(e),e.skipPristineCheck||this._parent?._updatePristine({},t),this._parent?._updateTouched({},t));}setParent(e){this._parent=e;}getRawValue(){return this.value}updateValueAndValidity(e={}){if(this._setInitialStatus(),this._updateValue(),this.enabled){let n=this._cancelExistingSubscription();this.errors=this._runValidator(),this.status=this._calculateStatus(),(this.status===_t||this.status===ct)&&this._runAsyncValidator(n,e.emitEvent);}let t=e.sourceControl??this;e.emitEvent!==false&&(this._events.next(new ne(this.value,t)),this._events.next(new lt(this.status,t)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),e.onlySelf||this._parent?.updateValueAndValidity(s(r$1({},e),{sourceControl:t}));}_updateTreeValidity(e={emitEvent:true}){this._forEachChild(t=>t._updateTreeValidity(e)),this.updateValueAndValidity({onlySelf:true,emitEvent:e.emitEvent});}_setInitialStatus(){this.status=this._allControlsDisabled()?yt:_t;}_runValidator(){return this.validator?this.validator(this):null}_runAsyncValidator(e,t){if(this.asyncValidator){this.status=ct,this._hasOwnPendingAsyncValidator={emitEvent:t!==false,shouldHaveEmitted:e!==false};let n=pi(this.asyncValidator(this));this._asyncValidationSubscription=n.subscribe(r=>{this._hasOwnPendingAsyncValidator=null,this.setErrors(r,{emitEvent:t,shouldHaveEmitted:e});});}}_cancelExistingSubscription(){if(this._asyncValidationSubscription){this._asyncValidationSubscription.unsubscribe();let e=(this._hasOwnPendingAsyncValidator?.emitEvent||this._hasOwnPendingAsyncValidator?.shouldHaveEmitted)??false;return this._hasOwnPendingAsyncValidator=null,e}return  false}setErrors(e,t={}){this.errors=e,this._updateControlsErrors(t.emitEvent!==false,this,t.shouldHaveEmitted);}get(e){let t=e;return t==null||(Array.isArray(t)||(t=t.split(".")),t.length===0)?null:t.reduce((n,r)=>n&&n._find(r),this)}getError(e,t){let n=t?this.get(t):this;return n?.errors?n.errors[e]:null}hasError(e,t){return !!this.getError(e,t)}get root(){let e=this;for(;e._parent;)e=e._parent;return e}_updateControlsErrors(e,t,n){this.status=this._calculateStatus(),e&&this.statusChanges.emit(this.status),(e||n)&&this._events.next(new lt(this.status,t)),this._parent&&this._parent._updateControlsErrors(e,t,n);}_initObservables(){this.valueChanges=new Ie$1,this.statusChanges=new Ie$1;}_calculateStatus(){return this._allControlsDisabled()?yt:this.errors?Xt:this._hasOwnPendingAsyncValidator||this._anyControlsHaveStatus(ct)?ct:this._anyControlsHaveStatus(Xt)?Xt:_t}_anyControlsHaveStatus(e){return this._anyControls(t=>t.status===e)}_anyControlsDirty(){return this._anyControls(e=>e.dirty)}_anyControlsTouched(){return this._anyControls(e=>e.touched)}_updatePristine(e,t){let n=!this._anyControlsDirty(),r=this.pristine!==n;this.pristine=n,e.onlySelf||this._parent?._updatePristine(e,t),r&&this._events.next(new Et(this.pristine,t));}_updateTouched(e={},t){this.touched=this._anyControlsTouched(),this._events.next(new xt(this.touched,t)),e.onlySelf||this._parent?._updateTouched(e,t);}_onDisabledChange=[];_registerOnCollectionChange(e){this._onCollectionChange=e;}_setUpdateStrategy(e){le(e)&&e.updateOn!=null&&(this._updateOn=e.updateOn);}_parentMarkedDirty(e){return !e&&!!this._parent?.dirty&&!this._parent._anyControlsDirty()}_find(e){return null}_assignValidators(e){this._rawValidators=Array.isArray(e)?e.slice():e,this._composedValidatorFn=Pr(this._rawValidators),this._updateHasRequiredValidator();}_assignAsyncValidators(e){this._rawAsyncValidators=Array.isArray(e)?e.slice():e,this._composedAsyncValidatorFn=Lr(this._rawAsyncValidators);}_updateHasRequiredValidator(){vt$1(()=>this._hasRequired.set(this.hasValidator(Te.required)));}};function Ai(i,e){return Object.hasOwn(i,e)}function Br(i){return i.tagName==="INPUT"||i.tagName==="SELECT"||i.tagName==="TEXTAREA"}function jr(i,e,t,n){switch(t){case "name":i.setAttribute(e,t,n);break;case "disabled":case "readonly":case "required":n?i.setAttribute(e,t,""):i.removeAttribute(e,t);break;case "max":case "min":case "minLength":case "maxLength":n!==void 0?i.setAttribute(e,t,n.toString()):i.removeAttribute(e,t);break}}var Oe=class{kind;context;control;message;constructor({kind:e,context:t,control:n}){this.kind=e,this.context=t,this.control=n;}};var Ur=(()=>{class i{_validator=Jt;_onChange;_enabled;ngOnChanges(t){if(this.inputName in t){let n=this.normalizeInput(t[this.inputName].currentValue);this._enabled=this.enabled(n),this._validator=this._enabled?this.createValidator(n):Jt,this._onChange?.();}}validate(t){return this._validator(t)}registerOnValidatorChange(t){this._onChange=t;}enabled(t){return t!=null}static \u0275fac=function(n){return new(n||i)};static \u0275dir=Yt$1({type:i,features:[Ro]})}return i})();var Hr={provide:wt,useExisting:io$1(()=>wi),multi:true};var wi=(()=>{class i extends Ur{required;inputName="required";normalizeInput=WC;createValidator=t=>mi;enabled(t){return t}static \u0275fac=(()=>{let t;return function(r){return (t||(t=tu(i)))(r||i)}})();static \u0275dir=Yt$1({type:i,selectors:[["","required","","formControlName","",3,"type","checkbox"],["","required","","formControl","",3,"type","checkbox"],["","required","","ngModel","",3,"type","checkbox"]],hostVars:1,hostBindings:function(n,r){n&2&&Wu("required",r._enabled?"":null);},inputs:{required:"required"},standalone:false,features:[nd([Hr]),$u]})}return i})();var zr=new I(""),mt=new I("",{factory:()=>de}),de="always";function Gr(i,e){return [...e.path,i]}function Re(i,e,t=de){We(i,e),e.valueAccessor.writeValue(i.value),(i.disabled||t==="always")&&e.valueAccessor.setDisabledState?.(i.disabled),Wr(i,e),Zr(i,e),qr(i,e),$r(i,e);}function re(i,e,t=true){let n=()=>{};e?.valueAccessor?.registerOnChange(n),e?.valueAccessor?.registerOnTouched(n),ae(i,e),i&&(e._invokeOnDestroyCallbacks(),i._registerOnCollectionChange(()=>{}));}function oe(i,e){i.forEach(t=>{t.registerOnValidatorChange&&t.registerOnValidatorChange(e);});}function $r(i,e){if(e.valueAccessor.setDisabledState){let t=n=>{e.valueAccessor.setDisabledState(n);};i.registerOnDisabledChange(t),e._registerOnDestroy(()=>{i._unregisterOnDisabledChange(t);});}}function We(i,e){let t=yi(i);e.validator!==null?i.setValidators(ii(t,e.validator)):typeof t=="function"&&i.setValidators([t]);let n=Ci(i);e.asyncValidator!==null?i.setAsyncValidators(ii(n,e.asyncValidator)):typeof n=="function"&&i.setAsyncValidators([n]);let r=()=>i.updateValueAndValidity();oe(e._rawValidators,r),oe(e._rawAsyncValidators,r);}function ae(i,e){let t=false;if(i!==null){if(e.validator!==null){let r=yi(i);if(Array.isArray(r)&&r.length>0){let o=r.filter(a=>a!==e.validator);o.length!==r.length&&(t=true,i.setValidators(o));}}if(e.asyncValidator!==null){let r=Ci(i);if(Array.isArray(r)&&r.length>0){let o=r.filter(a=>a!==e.asyncValidator);o.length!==r.length&&(t=true,i.setAsyncValidators(o));}}}let n=()=>{};return oe(e._rawValidators,n),oe(e._rawAsyncValidators,n),t}function Wr(i,e){e.valueAccessor.registerOnChange(t=>{i._pendingValue=t,i._pendingChange=true,i._pendingDirty=true,i.updateOn==="change"&&Di(i,e);});}function qr(i,e){e.valueAccessor.registerOnTouched(()=>{i._pendingTouched=true,i.updateOn==="blur"&&i._pendingChange&&Di(i,e),i.updateOn!=="submit"&&i.markAsTouched();});}function Di(i,e){i._pendingDirty&&i.markAsDirty(),i.setValue(i._pendingValue,{emitModelToViewChange:false}),e.viewToModelUpdate(i._pendingValue),i._pendingChange=false;}function Zr(i,e){let t=(n,r)=>{e.valueAccessor.writeValue(n),r&&e.viewToModelUpdate(n);};i.registerOnChange(t),e._registerOnDestroy(()=>{i._unregisterOnChange(t);});}function Mi(i,e){We(i,e);}function Kr(i,e){return ae(i,e)}function Ii(i,e){if(!i.hasOwnProperty("model"))return  false;let t=i.model;return t.isFirstChange()?true:!Object.is(e,t.currentValue)}function Yr(i){return Object.getPrototypeOf(i.constructor)===Ar}function Vi(i,e){i._syncPendingControls(),e.forEach(t=>{let n=t.control;n.updateOn==="submit"&&n._pendingChange&&(t.viewToModelUpdate(n._pendingValue),n._pendingChange=false);});}function Qr(i,e){if(!e)return null;let t,n,r;return e.forEach(o=>{o.constructor===ui?t=o:Yr(o)?n=o:r=o;}),r||n||t||null}function Xr(i,e){let t=i.indexOf(e);t>-1&&i.splice(t,1);}var Fi={provide:zr,useFactory:()=>{let i=g(H,{self:true});return {setParseErrors:e=>{i.setParseErrorSource(e);},set onReset(e){i.onReset=e;}}}},H=class extends ee{_parent=null;name=null;valueAccessor=null;isCustomControlBased=false;userOnReset;resetSubscription;set onReset(e){this.userOnReset=e,this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.control&&(this.resetSubscription=this.control.events.subscribe(t=>{t instanceof Q&&this.control&&this.userOnReset?.(this.control.value);}),this.subscription?.add(this.resetSubscription));}isNativeFormElement=false;rawValueAccessors;_selectedValueAccessor=null;get selectedValueAccessor(){return this._selectedValueAccessor??=Qr(this,this.rawValueAccessors)}parseErrorsValidator=null;renderer;injector;requiredValidatorViaDi;subscription;customControlBindings=null;constructor(e,t,n){super(),this.injector=e,this.renderer=t,this.rawValueAccessors=n,this.injector?.get(oe$1)?.onDestroy(()=>{this.removeParseErrorsValidator(this.control),this.subscription?.unsubscribe();});}setupCustomControl(){this.subscription?.unsubscribe();let e=this.injector?.get(uy);if(!this.control||!e)return;let t=e.markForCheck.bind(e);this.subscription=new G,this.subscription.add(this.control.valueChanges.subscribe(t)),this.subscription.add(this.control.statusChanges.subscribe(t)),this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.userOnReset&&(this.resetSubscription=this.control.events.subscribe(n=>{n instanceof Q&&this.control&&this.userOnReset?.(this.control.value);}),this.subscription.add(this.resetSubscription)),this.parseErrorsValidator&&this.control.addValidators(this.parseErrorsValidator);}ngControlCreate(e){!e.nativeElement.hasAttribute?.("ngNoCva")&&(this.rawValueAccessors&&this.rawValueAccessors.length>0||this.valueAccessor!==null)||!e.customControl||(this.isCustomControlBased=true,e.listenToCustomControlModel(r=>{this.control?.setValue(r,{emitModelToViewChange:false}),this.control?.markAsDirty(),this.viewToModelUpdate(r);}),e.listenToCustomControlOutput("touch",()=>{this.control?.markAsTouched();}),this.customControlBindings={},this.isNativeFormElement=Br(e.nativeElement),this.requiredValidatorViaDi=this._rawValidators.find(r=>r instanceof wi));}ngControlUpdate(e,t){if(!this.isCustomControlBased)return;let n=this.control,r=this.customControlBindings;Object.is(r.value,n.value)||(r.value=n.value,e.setCustomControlModelInput(n.value)),this.bindControlProperty(e,r,"touched",n.touched),this.bindControlProperty(e,r,"dirty",n.dirty),this.bindControlProperty(e,r,"valid",n.valid),this.bindControlProperty(e,r,"invalid",n.invalid),this.bindControlProperty(e,r,"pending",n.pending),this.bindControlProperty(e,r,"disabled",n.disabled),this.shouldBindRequired&&this.bindControlProperty(e,r,"required",this.isRequired);let o=n.errors;if(r.errors!==o){r.errors=o;let a=this._convertErrors(o);e.setInputOnDirectives("errors",a);}}get isRequired(){return (this.requiredValidatorViaDi?._enabled||this.control?._hasRequired())??false}get shouldBindRequired(){return  true}bindControlProperty(e,t,n,r){if(t[n]===r)return;t[n]=r;let o=e.setInputOnDirectives(n,r);this.isNativeFormElement&&!o&&(n==="disabled"||n==="required")&&this.renderer&&jr(this.renderer,e.nativeElement,n,r);}_convertErrors(e){if(e===null)return [];let t=this.control;return Object.entries(e).map(([n,r])=>new Oe({context:r,kind:n,control:t}))}setParseErrorSource(e){if(e===void 0)return;let t=null,n=Bo(()=>{let r=e();return r.length===0?null:r.reduce((o,a)=>(o[a.kind]=a,o),{})});this.parseErrorsValidator=(()=>t).bind(this),An$1(()=>{t=n(),this.control?.updateValueAndValidity({emitEvent:false});},{injector:this.injector});}removeParseErrorsValidator(e){this.parseErrorsValidator&&(e?.removeValidators(this.parseErrorsValidator),e?.updateValueAndValidity({emitEvent:false}));}},se=class{_cd;constructor(e){this._cd=e;}get isTouched(){return this._cd?.control?._touched?.(),!!this._cd?.control?.touched}get isUntouched(){return !!this._cd?.control?.untouched}get isPristine(){return this._cd?.control?._pristine?.(),!!this._cd?.control?.pristine}get isDirty(){return !!this._cd?.control?.dirty}get isValid(){return this._cd?.control?._status?.(),!!this._cd?.control?.valid}get isInvalid(){return !!this._cd?.control?.invalid}get isPending(){return !!this._cd?.control?.pending}get isSubmitted(){return this._cd?._submitted?.(),!!this._cd?.submitted}};var cc=(()=>{class i extends se{constructor(t){super(t);}static \u0275fac=function(n){return new(n||i)(qt$1(H,2))};static \u0275dir=Yt$1({type:i,selectors:[["","formControlName",""],["","ngModel",""],["","formControl",""]],hostVars:14,hostBindings:function(n,r){n&2&&ed("ng-untouched",r.isUntouched)("ng-touched",r.isTouched)("ng-pristine",r.isPristine)("ng-dirty",r.isDirty)("ng-valid",r.isValid)("ng-invalid",r.isInvalid)("ng-pending",r.isPending);},standalone:false,features:[$u]})}return i})(),lc=(()=>{class i extends se{constructor(t){super(t);}static \u0275fac=function(n){return new(n||i)(qt$1(j,10))};static \u0275dir=Yt$1({type:i,selectors:[["","formGroupName",""],["","formArrayName",""],["","ngModelGroup",""],["","formGroup",""],["","formArray",""],["form",3,"ngNoForm",""],["","ngForm",""]],hostVars:16,hostBindings:function(n,r){n&2&&ed("ng-untouched",r.isUntouched)("ng-touched",r.isTouched)("ng-pristine",r.isPristine)("ng-dirty",r.isDirty)("ng-valid",r.isValid)("ng-invalid",r.isInvalid)("ng-pending",r.isPending)("ng-submitted",r.isSubmitted);},standalone:false,features:[$u]})}return i})(),ut=class extends dt{constructor(e,t,n){super(Ge(t),$e(n,t)),this.controls=e,this._initObservables(),this._setUpdateStrategy(t),this._setUpControls(),this.updateValueAndValidity({onlySelf:true,emitEvent:!!this.asyncValidator});}controls;registerControl(e,t){let n=this._find(e);return n||(this.controls[e]=t,t.setParent(this),t._registerOnCollectionChange(this._onCollectionChange),t)}addControl(e,t,n={}){this.registerControl(e,t),this.updateValueAndValidity({emitEvent:n.emitEvent}),this._onCollectionChange();}removeControl(e,t={}){let n=this._find(e);n&&n._registerOnCollectionChange(()=>{}),delete this.controls[e],this.updateValueAndValidity({emitEvent:t.emitEvent}),this._onCollectionChange();}setControl(e,t,n={}){let r=this._find(e);r&&r._registerOnCollectionChange(()=>{}),delete this.controls[e],t&&this.registerControl(e,t),this.updateValueAndValidity({emitEvent:n.emitEvent}),this._onCollectionChange();}contains(e){return this._find(e)?.enabled===true}setValue(e,t={}){vt$1(()=>{xi(this,true,e),Object.keys(e).forEach(n=>{Ei(this,true,n),this.controls[n].setValue(e[n],{onlySelf:true,emitEvent:t.emitEvent});}),this.updateValueAndValidity(t);});}patchValue(e,t={}){e!=null&&(Object.keys(e).forEach(n=>{let r=this._find(n);r&&r.patchValue(e[n],{onlySelf:true,emitEvent:t.emitEvent});}),this.updateValueAndValidity(t));}reset(e={},t={}){this._forEachChild((n,r)=>{n.reset(e?e[r]:null,s(r$1({},t),{onlySelf:true}));}),this._updatePristine(t,this),this._updateTouched(t,this),this.updateValueAndValidity(t),t?.emitEvent!==false&&this._events.next(new Q(this));}getRawValue(){return this._reduceChildren({},(e,t,n)=>(e[n]=t.getRawValue(),e))}_syncPendingControls(){let e=this._reduceChildren(false,(t,n)=>n._syncPendingControls()?true:t);return e&&this.updateValueAndValidity({onlySelf:true}),e}_forEachChild(e){Object.keys(this.controls).forEach(t=>{let n=this.controls[t];n&&e(n,t);});}_setUpControls(){this._forEachChild(e=>{e.setParent(this),e._registerOnCollectionChange(this._onCollectionChange);});}_updateValue(){this.value=this._reduceValue();}_anyControls(e){for(let[t,n]of Object.entries(this.controls))if(this.contains(t)&&e(n))return  true;return  false}_reduceValue(){let e={};return this._reduceChildren(e,(t,n,r)=>((n.enabled||this.disabled)&&(t[r]=n.value),t))}_reduceChildren(e,t){let n=e;return this._forEachChild((r,o)=>{n=t(n,r,o);}),n}_allControlsDisabled(){for(let e of Object.keys(this.controls))if(this.controls[e].enabled)return  false;return Object.keys(this.controls).length>0||this.disabled}_find(e){return Ai(this.controls,e)?this.controls[e]:null}};var Pe=class extends ut{};var Jr={provide:j,useExisting:io$1(()=>to)},Ct=Promise.resolve(),to=(()=>{class i extends j{callSetDisabledState;get submitted(){return vt$1(this.submittedReactive)}_submitted=Bo(()=>this.submittedReactive());submittedReactive=O(false);_directives=new Set;form;ngSubmit=new Ie$1;options;constructor(t,n,r){super(),this.callSetDisabledState=r,this.form=new ut({},He(t),ze(n));}ngAfterViewInit(){this._setUpdateStrategy();}get formDirective(){return this}get control(){return this.form}get path(){return []}get controls(){return this.form.controls}addControl(t){Ct.then(()=>{let n=this._findContainer(t.path);t.control=n.registerControl(t.name,t.control),t._setupWithForm(this.callSetDisabledState),t.control.updateValueAndValidity({emitEvent:false}),this._directives.add(t);});}getControl(t){return this.form.get(t.path)}removeControl(t){Ct.then(()=>{this._findContainer(t.path)?.removeControl(t.name),this._directives.delete(t);});}addFormGroup(t){Ct.then(()=>{let n=this._findContainer(t.path),r=new ut({});Mi(r,t),n.registerControl(t.name,r),r.updateValueAndValidity({emitEvent:false});});}removeFormGroup(t){Ct.then(()=>{this._findContainer(t.path)?.removeControl?.(t.name);});}getFormGroup(t){return this.form.get(t.path)}updateModel(t,n){Ct.then(()=>{this.form.get(t.path).setValue(n);});}setValue(t){this.control.setValue(t);}onSubmit(t){return this.submittedReactive.set(true),Vi(this.form,this._directives),this.ngSubmit.emit(t),this.form._events.next(new ie(this.control)),t?.target?.method==="dialog"}onReset(){this.resetForm();}resetForm(t=void 0){this.form.reset(t),this.submittedReactive.set(false);}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.form._updateOn=this.options.updateOn);}_findContainer(t){return t.pop(),t.length?this.form.get(t):this.form}static \u0275fac=function(n){return new(n||i)(qt$1(wt,10),qt$1(ce,10),qt$1(mt,8))};static \u0275dir=Yt$1({type:i,selectors:[["form",3,"ngNoForm","",3,"formGroup","",3,"formArray",""],["ng-form"],["","ngForm",""]],hostBindings:function(n,r){n&1&&Cm("submit",function(a){return r.onSubmit(a)})("reset",function(){return r.onReset()});},inputs:{options:[0,"ngFormOptions","options"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:false,features:[nd([Jr]),$u]})}return i})();function ai(i,e){let t=i.indexOf(e);t>-1&&i.splice(t,1);}function si(i){return typeof i=="object"&&i!==null&&Object.keys(i).length===2&&"value"in i&&"disabled"in i}var At=class extends dt{defaultValue=null;_onChange=[];_pendingValue;_pendingChange=false;constructor(e=null,t,n){super(Ge(t),$e(n,t)),this._applyFormState(e),this._setUpdateStrategy(t),this._initObservables(),this.updateValueAndValidity({onlySelf:true,emitEvent:!!this.asyncValidator}),le(t)&&(t.nonNullable||t.initialValueIsDefault)&&(si(e)?this.defaultValue=e.value:this.defaultValue=e);}setValue(e,t={}){vt$1(()=>{this.value=this._pendingValue=e,this._onChange.length&&t.emitModelToViewChange!==false&&this._onChange.forEach(n=>n(this.value,t.emitViewToModelChange!==false)),this.updateValueAndValidity(t);});}patchValue(e,t={}){this.setValue(e,t);}reset(e=this.defaultValue,t={}){this._applyFormState(e),this.markAsPristine(t),this.markAsUntouched(t),this.setValue(this.value,t),t.overwriteDefaultValue&&(this.defaultValue=this.value),this._pendingChange=false,t?.emitEvent!==false&&this._events.next(new Q(this));}_updateValue(){}_anyControls(e){return  false}_allControlsDisabled(){return this.disabled}registerOnChange(e){this._onChange.push(e);}_unregisterOnChange(e){ai(this._onChange,e);}registerOnDisabledChange(e){this._onDisabledChange.push(e);}_unregisterOnDisabledChange(e){ai(this._onDisabledChange,e);}_forEachChild(e){}_syncPendingControls(){return this.updateOn==="submit"&&(this._pendingDirty&&this.markAsDirty(),this._pendingTouched&&this.markAsTouched(),this._pendingChange)?(this.setValue(this._pendingValue,{onlySelf:true,emitModelToViewChange:false}),true):false}_applyFormState(e){si(e)?(this.value=this._pendingValue=e.value,e.disabled?this.disable({onlySelf:true,emitEvent:false}):this.enable({onlySelf:true,emitEvent:false})):this.value=this._pendingValue=e;}};var eo=i=>i instanceof At;var no={provide:H,useExisting:io$1(()=>io)},ci=Promise.resolve(),io=(()=>{class i extends H{_changeDetectorRef;callSetDisabledState;control=new At;static ngAcceptInputType_isDisabled;_registered=false;viewModel;name="";isDisabled;model;options;update=new Ie$1;constructor(t,n,r,o,a,c,d,m){super(d,m,o),this._changeDetectorRef=a,this.callSetDisabledState=c,this._parent=t,this._setValidators(n),this._setAsyncValidators(r);}ngOnChanges(t){if(this._checkForErrors(),!this._registered||"name"in t){if(this._registered&&(this._checkName(),this.formDirective)){let n=t.name.previousValue;this.formDirective.removeControl({name:n,path:this._getPath(n)});}this._setUpControl();}"isDisabled"in t&&this._updateDisabled(t),Ii(t,this.viewModel)&&(this._updateValue(this.model),this.viewModel=this.model);}ngOnDestroy(){this.formDirective?.removeControl(this);}\u0275ngControlCreate(t){super.ngControlCreate(t);}\u0275ngControlUpdate(t){super.ngControlUpdate(t,false);}get shouldBindRequired(){return  false}get path(){return this._getPath(this.name)}get formDirective(){return this._parent?this._parent.formDirective:null}viewToModelUpdate(t){this.viewModel=t,this.update.emit(t);}_setUpControl(){this._setUpdateStrategy(),this._isStandalone()?this._setUpStandalone():this.formDirective.addControl(this),this._registered=true;}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.control._updateOn=this.options.updateOn);}_isStandalone(){return !this._parent||!!(this.options&&this.options.standalone)}_setUpStandalone(){this.isCustomControlBased?this.setupCustomControl():(this.valueAccessor??=this.selectedValueAccessor,Re(this.control,this,this.callSetDisabledState)),this.control.updateValueAndValidity({emitEvent:false});}_setupWithForm(t){this.isCustomControlBased?this.setupCustomControl():(this.valueAccessor??=this.selectedValueAccessor,Re(this.control,this,t));}_checkForErrors(){this._checkName();}_checkName(){this.options&&this.options.name&&(this.name=this.options.name),!this._isStandalone()&&this.name;}_updateValue(t){ci.then(()=>{this.control.setValue(t,{emitViewToModelChange:false}),this._changeDetectorRef?.markForCheck();});}_updateDisabled(t){let n=t.isDisabled.currentValue,r=n!==0&&WC(n);ci.then(()=>{r&&!this.control.disabled?this.control.disable():!r&&this.control.disabled&&this.control.enable(),this._changeDetectorRef?.markForCheck();});}_getPath(t){return this._parent?Gr(t,this._parent):[t]}static \u0275fac=function(n){return new(n||i)(qt$1(j,9),qt$1(wt,10),qt$1(ce,10),qt$1(Be,10),qt$1(uy,8),qt$1(mt,8),qt$1(X,8),qt$1(Zs,8))};static \u0275dir=Yt$1({type:i,selectors:[["","ngModel","",3,"formControlName","",3,"formControl",""]],inputs:{name:"name",isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"],options:[0,"ngModelOptions","options"]},outputs:{update:"ngModelChange"},exportAs:["ngModel"],standalone:false,features:[nd([no,Fi]),$u,Ro,U_(null)]})}return i})();var uc=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275dir=Yt$1({type:i,selectors:[["form",3,"ngNoForm","",3,"ngNativeValidate",""]],hostAttrs:["novalidate",""],standalone:false})}return i})();var Le=class extends dt{constructor(e,t,n){super(Ge(t),$e(n,t)),this.controls=e,this._initObservables(),this._setUpdateStrategy(t),this._setUpControls(),this.updateValueAndValidity({onlySelf:true,emitEvent:!!this.asyncValidator});}controls;at(e){return this.controls[this._adjustIndex(e)]}push(e,t={}){Array.isArray(e)?e.forEach(n=>{this.controls.push(n),this._registerControl(n);}):(this.controls.push(e),this._registerControl(e)),this.updateValueAndValidity({emitEvent:t.emitEvent}),this._onCollectionChange();}insert(e,t,n={}){this.controls.splice(e,0,t),this._registerControl(t),this.updateValueAndValidity({emitEvent:n.emitEvent});}removeAt(e,t={}){let n=this._adjustIndex(e);n<0&&(n=0),this.controls[n]&&this.controls[n]._registerOnCollectionChange(()=>{}),this.controls.splice(n,1),this.updateValueAndValidity({emitEvent:t.emitEvent});}setControl(e,t,n={}){let r=this._adjustIndex(e);r<0&&(r=0),this.controls[r]&&this.controls[r]._registerOnCollectionChange(()=>{}),this.controls.splice(r,1),t&&(this.controls.splice(r,0,t),this._registerControl(t)),this.updateValueAndValidity({emitEvent:n.emitEvent}),this._onCollectionChange();}get length(){return this.controls.length}setValue(e,t={}){vt$1(()=>{xi(this,false,e),e.forEach((n,r)=>{Ei(this,false,r),this.at(r).setValue(n,{onlySelf:true,emitEvent:t.emitEvent});}),this.updateValueAndValidity(t);});}patchValue(e,t={}){e!=null&&(e.forEach((n,r)=>{this.at(r)&&this.at(r).patchValue(n,{onlySelf:true,emitEvent:t.emitEvent});}),this.updateValueAndValidity(t));}reset(e=[],t={}){this._forEachChild((n,r)=>{n.reset(e[r],s(r$1({},t),{onlySelf:true}));}),this._updatePristine(t,this),this._updateTouched(t,this),this.updateValueAndValidity(t),t?.emitEvent!==false&&this._events.next(new Q(this));}getRawValue(){return this.controls.map(e=>e.getRawValue())}clear(e={}){this.controls.length<1||(this._forEachChild(t=>t._registerOnCollectionChange(()=>{})),this.controls.splice(0),this.updateValueAndValidity({emitEvent:e.emitEvent}));}_adjustIndex(e){return e<0?e+this.length:e}_syncPendingControls(){let e=this.controls.reduce((t,n)=>n._syncPendingControls()?true:t,false);return e&&this.updateValueAndValidity({onlySelf:true}),e}_forEachChild(e){this.controls.forEach((t,n)=>{e(t,n);});}_updateValue(){this.value=this.controls.filter(e=>e.enabled||this.disabled).map(e=>e.value);}_anyControls(e){return this.controls.some(t=>t.enabled&&e(t))}_setUpControls(){this._forEachChild(e=>this._registerControl(e));}_allControlsDisabled(){for(let e of this.controls)if(e.enabled)return  false;return this.controls.length>0||this.disabled}_registerControl(e){e.setParent(this),e._registerOnCollectionChange(this._onCollectionChange);}_find(e){return this.at(e)??null}};var ro=(()=>{class i extends j{callSetDisabledState;get submitted(){return vt$1(this._submittedReactive)}set submitted(t){this._submittedReactive.set(t);}_submitted=Bo(()=>this._submittedReactive());_submittedReactive=O(false);_oldForm;_onCollectionChange=()=>this._updateDomValue();directives=[];constructor(t,n,r){super(),this.callSetDisabledState=r,this._setValidators(t),this._setAsyncValidators(n);}ngOnChanges(t){this.onChanges(t);}ngOnDestroy(){this.onDestroy();}onChanges(t){this._checkFormPresent(),t.hasOwnProperty("form")&&(this._updateValidators(),this._updateDomValue(),this._updateRegistrations(),this._oldForm=this.form);}onDestroy(){this.form&&(ae(this.form,this),this.form._onCollectionChange===this._onCollectionChange&&this.form._registerOnCollectionChange(()=>{}));}get formDirective(){return this}get path(){return []}addControl(t){let n=this.form.get(t.path);return t._setupWithForm(n,this.callSetDisabledState),n.updateValueAndValidity({emitEvent:false}),this.directives.push(t),n}getControl(t){return this.form.get(t.path)}removeControl(t){re(t.control||null,t,false),Xr(this.directives,t);}addFormGroup(t){this._setUpFormContainer(t);}removeFormGroup(t){this._cleanUpFormContainer(t);}getFormGroup(t){return this.form.get(t.path)}getFormArray(t){return this.form.get(t.path)}addFormArray(t){this._setUpFormContainer(t);}removeFormArray(t){this._cleanUpFormContainer(t);}updateModel(t,n){this.form.get(t.path).setValue(n);}onReset(){this.resetForm();}resetForm(t=void 0,n={}){this.form.reset(t,n),this._submittedReactive.set(false);}onSubmit(t){return this.submitted=true,Vi(this.form,this.directives),this.ngSubmit.emit(t),this.form._events.next(new ie(this.control)),t?.target?.method==="dialog"}_updateDomValue(){this.directives.forEach(t=>{let n=t.control,r=this.form.get(t.path);n!==r&&(re(n||null,t),eo(r)&&t._setupWithForm(r,this.callSetDisabledState));}),this.form._updateTreeValidity({emitEvent:false});}_setUpFormContainer(t){let n=this.form.get(t.path);Mi(n,t),n.updateValueAndValidity({emitEvent:false});}_cleanUpFormContainer(t){let n=this.form?.get(t.path);n&&Kr(n,t)&&n.updateValueAndValidity({emitEvent:false});}_updateRegistrations(){this.form._registerOnCollectionChange(this._onCollectionChange),this._oldForm?._registerOnCollectionChange(()=>{});}_updateValidators(){We(this.form,this),this._oldForm&&ae(this._oldForm,this);}_checkFormPresent(){this.form;}static \u0275fac=function(n){return new(n||i)(qt$1(wt,10),qt$1(ce,10),qt$1(mt,8))};static \u0275dir=Yt$1({type:i,features:[$u,Ro]})}return i})();var Si=new I(""),oo={provide:H,useExisting:io$1(()=>ao)},ao=(()=>{class i extends H{_ngModelWarningConfig;callSetDisabledState;viewModel;form;set isDisabled(t){}model;update=new Ie$1;static _ngModelWarningSentOnce=false;_ngModelWarningSent=false;constructor(t,n,r,o,a,c,d){super(d,c,r),this._ngModelWarningConfig=o,this.callSetDisabledState=a,this._setValidators(t),this._setAsyncValidators(n);}ngOnChanges(t){if(this._isControlChanged(t)){let n=t.form.previousValue;n&&(re(n,this,false),this.removeParseErrorsValidator(n)),this.isCustomControlBased?this.setupCustomControl():(this.valueAccessor??=this.selectedValueAccessor,Re(this.form,this,this.callSetDisabledState)),this.form.updateValueAndValidity({emitEvent:false});}Ii(t,this.viewModel)&&(this.form.setValue(this.model),this.viewModel=this.model);}ngOnDestroy(){this.form&&re(this.form,this,false);}get path(){return []}get control(){return this.form}viewToModelUpdate(t){this.viewModel=t,this.update.emit(t);}_isControlChanged(t){return t.hasOwnProperty("form")}\u0275ngControlCreate(t){super.ngControlCreate(t);}\u0275ngControlUpdate(t){super.ngControlUpdate(t,true);}static \u0275fac=function(n){return new(n||i)(qt$1(wt,10),qt$1(ce,10),qt$1(Be,10),qt$1(Si,8),qt$1(mt,8),qt$1(Zs,8),qt$1(X,8))};static \u0275dir=Yt$1({type:i,selectors:[["","formControl",""]],inputs:{form:[0,"formControl","form"],isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"]},outputs:{update:"ngModelChange"},exportAs:["ngForm"],standalone:false,features:[nd([oo,Fi]),$u,Ro,U_(null)]})}return i})();var so={provide:j,useExisting:io$1(()=>co)},co=(()=>{class i extends ro{form=null;ngSubmit=new Ie$1;get control(){return this.form}static \u0275fac=(()=>{let t;return function(r){return (t||(t=tu(i)))(r||i)}})();static \u0275dir=Yt$1({type:i,selectors:[["","formGroup",""]],hostBindings:function(n,r){n&1&&Cm("submit",function(a){return r.onSubmit(a)})("reset",function(){return r.onReset()});},inputs:{form:[0,"formGroup","form"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:false,features:[nd([so]),$u]})}return i})();var Ni=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=ot({type:i});static \u0275inj=Le$1({})}return i})();function li(i){return !!i&&(i.asyncValidators!==void 0||i.validators!==void 0||i.updateOn!==void 0)}var lo=(()=>{class i{useNonNullable=false;get nonNullable(){let t=new i;return t.useNonNullable=true,t}group(t,n=null){let r=this._reduceControls(t),o={};return li(n)?o=n:n!==null&&(o.validators=n.validator,o.asyncValidators=n.asyncValidator),new ut(r,o)}record(t,n=null){let r=this._reduceControls(t);return new Pe(r,n)}control(t,n,r){let o={};return this.useNonNullable?(li(n)?o=n:(o.validators=n,o.asyncValidators=r),new At(t,s(r$1({},o),{nonNullable:true}))):new At(t,n,r)}array(t,n,r){let o=t.map(a=>this._createControl(a));return new Le(o,n,r)}_reduceControls(t){let n={};return Object.keys(t).forEach(r=>{n[r]=this._createControl(t[r]);}),n}_createControl(t){if(t instanceof At)return t;if(t instanceof dt)return t;if(Array.isArray(t)){let n=t[0],r=t.length>1?t[1]:null,o=t.length>2?t[2]:null;return this.control(n,r,o)}else return this.control(t)}static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:i.\u0275fac})}return i})(),mc=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275prov=z({token:i,factory:()=>g(lo).nonNullable})}return i})();var hc=(()=>{class i{static withConfig(t){return {ngModule:i,providers:[{provide:mt,useValue:t.callSetDisabledState??de}]}}static \u0275fac=function(n){return new(n||i)};static \u0275mod=ot({type:i});static \u0275inj=Le$1({imports:[Ni]})}return i})(),pc=(()=>{class i{static withConfig(t){return {ngModule:i,providers:[{provide:Si,useValue:t.warnOnNgModelWithFormControl??"always"},{provide:mt,useValue:t.callSetDisabledState??de}]}}static \u0275fac=function(n){return new(n||i)};static \u0275mod=ot({type:i});static \u0275inj=Le$1({imports:[Ni]})}return i})();var qe=class{_multiple;_emitChanges;compareWith;_selection=new Set;_deselectedToEmit=[];_selectedToEmit=[];_selected=null;get selected(){return this._selected||(this._selected=Array.from(this._selection.values())),this._selected}changed=new j$1;bulk={select:e=>this._select(e),deselect:e=>this._deselect(e),setSelection:e=>this._setSelection(e)};constructor(e=false,t,n=true,r){this._multiple=e,this._emitChanges=n,this.compareWith=r,t&&t.length&&(e?t.forEach(o=>this._markSelected(o)):this._markSelected(t[0]),this._selectedToEmit.length=0);}select(...e){return this._select(e)}deselect(...e){return this._deselect(e)}setSelection(...e){return this._setSelection(e)}toggle(e){return this.isSelected(e)?this.deselect(e):this.select(e)}clear(e=true){this._unmarkAll();let t=this._hasQueuedChanges();return e&&this._emitChangeEvent(),t}isSelected(e){return this._selection.has(this._getConcreteValue(e))}isEmpty(){return this._selection.size===0}hasValue(){return !this.isEmpty()}sort(e){this._multiple&&this.selected&&this._selected.sort(e);}isMultipleSelection(){return this._multiple}_select(e){this._verifyValueAssignment(e),e.forEach(n=>this._markSelected(n));let t=this._hasQueuedChanges();return this._emitChangeEvent(),t}_deselect(e){this._verifyValueAssignment(e),e.forEach(n=>this._unmarkSelected(n));let t=this._hasQueuedChanges();return this._emitChangeEvent(),t}_setSelection(e){this._verifyValueAssignment(e);let t=this.selected,n=new Set(e.map(o=>this._getConcreteValue(o)));e.forEach(o=>this._markSelected(o)),t.filter(o=>!n.has(this._getConcreteValue(o,n))).forEach(o=>this._unmarkSelected(o));let r=this._hasQueuedChanges();return this._emitChangeEvent(),r}_emitChangeEvent(){this._selected=null,(this._selectedToEmit.length||this._deselectedToEmit.length)&&(this.changed.next({source:this,added:this._selectedToEmit,removed:this._deselectedToEmit}),this._deselectedToEmit=[],this._selectedToEmit=[]);}_markSelected(e){e=this._getConcreteValue(e),this.isSelected(e)||(this._multiple||this._unmarkAll(),this.isSelected(e)||this._selection.add(e),this._emitChanges&&this._selectedToEmit.push(e));}_unmarkSelected(e){e=this._getConcreteValue(e),this.isSelected(e)&&(this._selection.delete(e),this._emitChanges&&this._deselectedToEmit.push(e));}_unmarkAll(){this.isEmpty()||this._selection.forEach(e=>this._unmarkSelected(e));}_verifyValueAssignment(e){e.length>1&&this._multiple;}_hasQueuedChanges(){return !!(this._deselectedToEmit.length||this._selectedToEmit.length)}_getConcreteValue(e,t){if(this.compareWith){t=t??this._selection;for(let n of t)if(this.compareWith(e,n))return n;return e}else return e}};var Ti=class{applyChanges(e,t,n,r,o){e.forEachOperation((a,c,d)=>{let m,h;if(a.previousIndex==null){let X=n(a,c,d);m=t.createEmbeddedView(X.templateRef,X.context,X.index),h=ti$1.INSERTED;}else d==null?(t.remove(c),h=ti$1.REMOVED):(m=t.get(c),t.move(m,d),h=ti$1.MOVED);o&&o({context:m?.context,operation:h,record:a});});}detach(){}};export{$t as $,Ae as A,Be as B,Cs as C,Ee as E,Hs as H,Ia as I,Kn as K,Mn as M,No as N,Oa as O,Qi as Q,Sn as S,Ti as T,Ve as V,Wn as W,Xi as X,Za as Z,Ki as a,mc as b,cc as c,Te as d,uc as e,ao as f,co as g,hc as h,io as i,H as j,qe as k,lc as l,mr as m,nr as n,ua as o,pc as p,qn as q,Wt as r,st as s,to as t,ui as u,vt as v,wt as w,xa as x,ys as y,zs as z};