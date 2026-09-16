import {Q,m as Y,o as st,f,r as U,aW as y,cf as ex,e as ue,cg as kT,cd as xv,ar as oo,A as Ae$1,ce as hm,X as Xy,H as He,ch as pm,bI as Jy,aL as lS,i as wt,S as St,bk as mf,_ as _i,B as gf,$ as $e,bc as wi,K as Ka,Z as Za,ci as Wf,z as zc,G as __,b as fo,au as Tv,q,C as Ci,I as eH,R as Gt,cj as e,s as sr,P as me,aS as Wc,a0 as Ht,v as vi,a2 as $t,k as bi,a4 as ov,a5 as cS,at as iS,W as Wt,ck as Ei,aC as nS,cl as tv,aD as em,aE as tm,cm as zS,aN as Yg,cn as Kg}from'./main.js';import {y as y$1}from'./chunk-jTGWZB2t.js';var fe=["determinateSpinner"];function he(i,r){if(i&1&&(hm(),Ae$1(0,"svg",11),Xy(1,"circle",12),He()),i&2){let e=iS();St("viewBox",e._viewBox()),wt(),mf("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),St("r",e._circleRadius());}}var _e=new y("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:le})}),le=100,ve=10,Ae=(()=>{class i{_elementRef=f(U);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=f(_e),n=ex(),t=this._elementRef.nativeElement;this._noopAnimations=n==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=t.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&n==="reduced-motion"&&t.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=le;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-ve)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=ue({type:i,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(n,t){if(n&1&&wi(fe,5),n&2){let a;Ka(a=Za())&&(t._determinateCircle=a.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(n,t){n&2&&(St("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",t.mode==="determinate"?t.value:null)("mode",t.mode),gf("mat-"+t.color),mf("width",t.diameter,"px")("height",t.diameter,"px")("--mat-progress-spinner-size",t.diameter+"px")("--mat-progress-spinner-active-indicator-width",t.diameter+"px"),$e("_mat-animation-noopable",t._noopAnimations)("mdc-circular-progress--indeterminate",t.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",xv],diameter:[2,"diameter","diameter",xv],strokeWidth:[2,"strokeWidth","strokeWidth",xv]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(n,t){if(n&1&&(oo(0,he,2,8,"ng-template",null,0,zS),Ae$1(2,"div",2,1),hm(),Ae$1(4,"svg",3),Xy(5,"circle",4),He()(),pm(),Ae$1(6,"div",5)(7,"div",6)(8,"div",7),Jy(9,8),He(),Ae$1(10,"div",9),Jy(11,8),He(),Ae$1(12,"div",10),Jy(13,8),He()()()),n&2){let a=lS(1);wt(4),St("viewBox",t._viewBox()),wt(),mf("stroke-dasharray",t._strokeCircumference(),"px")("stroke-dashoffset",t._strokeDashOffset(),"px")("stroke-width",t._circleStrokeWidth(),"%"),St("r",t._circleRadius()),wt(4),_i("ngTemplateOutlet",a),wt(2),_i("ngTemplateOutlet",a),wt(2),_i("ngTemplateOutlet",a);}},dependencies:[kT],styles:[`.mat-mdc-progress-spinner {
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
`],encapsulation:2})}return i})();var Te=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=Q({type:i});static \u0275inj=Y({imports:[st]})}return i})();var ye=["previewIframe"];function be(i,r){i&1&&(Ht(0,"div",2)(1,"span"),Wt(2,"Lynx Web preview"),$t(),Ht(3,"a",5),Wt(4," Download mobile bundle "),$t()()),i&2&&(wt(3),Ei("href",r,Yg));}function we(i,r){if(i&1){let e=nS();Ht(0,"iframe",6,0),tv("load",function(){em(e);let t=iS();return tm(t.syncPayloadOnIframeLoad())}),$t();}if(i&2){let e=iS();Ei("src",e.safeRendererUrl(),Kg);}}function ke(i,r){i&1&&(Ht(0,"div",4),Wt(1,"Rendered UI Placeholder"),$t());}var pe=class i{sanitizer=f(Wf);startupResolution=f(zc);hostCommunication=f(__);configProvider=f(fo);chatState=f(y$1);payload=Tv(null);dynamicHeight=q(null);frameHeight=Ci(()=>{let r=this.dynamicHeight();return r&&r>0?r:null});isLocked=this.chatState.isProgrammaticStreamActive;lynxBundleUrl=Ci(()=>this.startupResolution.activeRenderer?.()?.artifacts?.lynxBundleUrl??null);iframeRef=eH("previewIframe");safeRendererUrl=Ci(()=>{let r=this.startupResolution.resolvedUrl();if(!r)return null;try{let e$1=globalThis.location?.origin||void 0,n=new URL(r,e$1);n.searchParams.delete("origin");let t=new Set;e$1&&t.add(e$1);let a=globalThis.location?.ancestorOrigins;if(a)for(let d=0;d<a.length;d++)a[d]&&t.add(a[d]);for(let d of t)n.searchParams.append("origin",d);let ue=Gt(()=>this.configProvider.themePreference());n.searchParams.set("theme",ue);let P=n.toString();return e(P)?this.sanitizer.bypassSecurityTrustResourceUrl(P):(console.error("Renderer URL failed safe validation:",P),null)}catch(e){return console.error("Failed to parse renderer URL:",e),null}});constructor(){sr(r=>{let n=this.iframeRef()?.nativeElement??null;n&&(this.hostCommunication.registerIframe(n),r(()=>{this.hostCommunication.unregisterIframe(n);}));}),sr(()=>{let r=this.configProvider.themePreference();this.hostCommunication.sendTheme(r);}),sr(()=>{let r=this.payload(),e=this.iframeRef()?.nativeElement;e&&r!==null&&Array.isArray(r)&&r.length>0&&this.hostCommunication.sendRenderA2UI(r,e);}),sr(()=>{let r=this.hostCommunication.messageStream();if(r){let e=this.iframeRef()?.nativeElement,n=e?.contentWindow;if(r.sourceWindow&&n&&r.sourceWindow!==n)return;if(r.type===me.RENDERER_READY||r.type===me.A2UI_CATALOG){let t=Gt(()=>this.payload());e&&t!==null&&Array.isArray(t)&&t.length>0&&this.hostCommunication.sendRenderA2UI(t,e);}else if(r.type===me.SURFACE_RESIZE&&Wc.validateIncomingMessage(r)){let t=r.payload;this.dynamicHeight.set(t.height);}}});}setupIframeWheelForwarding(r){try{r.contentWindow?.addEventListener("wheel",e=>{let n=r.closest(".chat-history-container, .side-canvas-viewport");n&&n.scrollBy({top:e.deltaY,left:e.deltaX,behavior:"auto"});},{passive:!0});}catch{}}syncPayloadOnIframeLoad(){let r=this.payload(),e=this.iframeRef()?.nativeElement;e&&(this.setupIframeWheelForwarding(e),r!==null&&Array.isArray(r)&&r.length>0&&this.hostCommunication.sendRenderA2UI(r,e));}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ue({type:i,selectors:[["a2ui-composer-rendered-frame"]],viewQuery:function(e,n){e&1&&ov(n.iframeRef,ye,5),e&2&&cS();},inputs:{payload:[1,"payload"]},decls:4,vars:6,consts:[["previewIframe",""],[1,"rendered-frame-container"],[1,"artifact-toolbar"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"src"],[1,"rendered-frame-placeholder"],["download","a2ui.lynx.js","target","_blank","rel","noopener noreferrer",1,"artifact-download",3,"href"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"load","src"]],template:function(e,n){if(e&1&&(Ht(0,"div",1),vi(1,be,5,1,"div",2),vi(2,we,2,1,"iframe",3)(3,ke,2,0,"div",4),$t()),e&2){let t;mf("height",n.frameHeight()?n.frameHeight()+"px":"100%"),$e("is-locked",n.isLocked()),wt(),bi((t=n.lynxBundleUrl())?1:-1,t),wt(),bi(n.safeRendererUrl()?2:3);}},styles:['[_nghost-%COMP%]{display:block;width:100%;height:100%}.rendered-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;width:100%;height:100%;min-height:280px;container-type:inline-size;container-name:renderedFrame;overflow:hidden;background-color:var(--mat-sys-surface);position:relative}.rendered-frame-container[_ngcontent-%COMP%]   .artifact-toolbar[_ngcontent-%COMP%]{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;border-bottom:1px solid var(--mat-sys-outline-variant);color:var(--mat-sys-on-surface-variant);background:var(--mat-sys-surface-container-low);font:500 12px/20px Roboto,sans-serif}.rendered-frame-container[_ngcontent-%COMP%]   .artifact-download[_ngcontent-%COMP%]{color:var(--mat-sys-primary);text-decoration:none}.rendered-frame-container[_ngcontent-%COMP%]   .artifact-download[_ngcontent-%COMP%]:hover, .rendered-frame-container[_ngcontent-%COMP%]   .artifact-download[_ngcontent-%COMP%]:focus-visible{text-decoration:underline}.rendered-frame-container.is-locked[_ngcontent-%COMP%]{pointer-events:none;-webkit-user-select:none;user-select:none}.rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{content:"Gemini is generating visual updates...";position:absolute;top:0;left:0;width:100%;height:100%;background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);z-index:10;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:var(--mat-sys-primary);font-family:Roboto,sans-serif;animation:_ngcontent-%COMP%_fadeInLockout .2s ease-out}.rendered-frame-container[_ngcontent-%COMP%]   .preview-iframe[_ngcontent-%COMP%]{flex:1 1 auto;width:100%;height:100%;min-height:280px;border:none;display:block;isolation:isolate}.rendered-frame-container[_ngcontent-%COMP%]   .rendered-frame-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--mat-sys-on-surface-variant);font-family:sans-serif}@container renderedFrame (max-width: 400px){.rendered-frame-container[_ngcontent-%COMP%]{border-radius:0}}@keyframes _ngcontent-%COMP%_fadeInLockout{0%{opacity:0;-webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px)}to{opacity:1;-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px)}}.dark-theme[_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container)}.dark-theme[_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after, .dark-theme   [_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);color:var(--mat-sys-primary)}']})};export{Ae as A,Te as T,pe as p};