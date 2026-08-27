import {Q,r as q,t as st,f,U,aV as y,c5 as YM,e as ue,c6 as MT,c3 as Sv,aq as oo,A as Ae$1,c4 as dm,K as Ky,H as He,c7 as fm,bG as Xy,aK as rS,i as wt,S as St,bj as hf,_ as _i,z as pf,j as $e,bb as wi,D as Ya,E as Ka,b$ as $f,c8 as n,$ as $c,I as m_,b as fo,a6 as pe$1,at as Cv,Y,C as Ci,N as ZU,X as Gt,s as sr,V as ge,aR as zc,a0 as Ht,v as vi,a2 as $t,l as bi,a4 as nv,a5 as nS,as as JI,aB as ZI,c9 as Jy,ca as Ei,W as Wt,aC as Qp,aD as Jp,cb as jS,cc as qg}from'./main.js';import {s}from'./chunk-D8BA0m4-.js';var fe=["determinateSpinner"];function he(i,t){if(i&1&&(dm(),Ae$1(0,"svg",11),Ky(1,"circle",12),He()),i&2){let e=JI();St("viewBox",e._viewBox()),wt(),hf("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),St("r",e._circleRadius());}}var _e=new y("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:le})}),le=100,ye=10,Ae=(()=>{class i{_elementRef=f(U);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=f(_e),r=YM(),n=this._elementRef.nativeElement;this._noopAnimations=r==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=n.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&r==="reduced-motion"&&n.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=le;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-ye)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(r){return new(r||i)};static \u0275cmp=ue({type:i,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(r,n){if(r&1&&wi(fe,5),r&2){let a;Ya(a=Ka())&&(n._determinateCircle=a.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(r,n){r&2&&(St("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",n.mode==="determinate"?n.value:null)("mode",n.mode),pf("mat-"+n.color),hf("width",n.diameter,"px")("height",n.diameter,"px")("--mat-progress-spinner-size",n.diameter+"px")("--mat-progress-spinner-active-indicator-width",n.diameter+"px"),$e("_mat-animation-noopable",n._noopAnimations)("mdc-circular-progress--indeterminate",n.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",Sv],diameter:[2,"diameter","diameter",Sv],strokeWidth:[2,"strokeWidth","strokeWidth",Sv]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(r,n){if(r&1&&(oo(0,he,2,8,"ng-template",null,0,jS),Ae$1(2,"div",2,1),dm(),Ae$1(4,"svg",3),Ky(5,"circle",4),He()(),fm(),Ae$1(6,"div",5)(7,"div",6)(8,"div",7),Xy(9,8),He(),Ae$1(10,"div",9),Xy(11,8),He(),Ae$1(12,"div",10),Xy(13,8),He()()()),r&2){let a=rS(1);wt(4),St("viewBox",n._viewBox()),wt(),hf("stroke-dasharray",n._strokeCircumference(),"px")("stroke-dashoffset",n._strokeDashOffset(),"px")("stroke-width",n._circleStrokeWidth(),"%"),St("r",n._circleRadius()),wt(4),_i("ngTemplateOutlet",a),wt(2),_i("ngTemplateOutlet",a),wt(2),_i("ngTemplateOutlet",a);}},dependencies:[MT],styles:[`.mat-mdc-progress-spinner {
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
`],encapsulation:2})}return i})();var Ie=(()=>{class i{static \u0275fac=function(r){return new(r||i)};static \u0275mod=Q({type:i});static \u0275inj=q({imports:[st]})}return i})();var ve=["previewIframe"];function be(i,t){if(i&1){let e=ZI();Ht(0,"iframe",4,0),Jy("load",function(){Qp(e);let n=JI();return Jp(n.syncPayloadOnIframeLoad())}),$t();}if(i&2){let e=JI();hf("height",e.frameHeight()?e.frameHeight()+"px":"100%"),Ei("src",e.safeRendererUrl(),qg);}}function we(i,t){i&1&&(Ht(0,"div",3),Wt(1,"Rendered UI Placeholder"),$t());}var pe=class i{sanitizer=f($f);urlValidator=f(n);startupResolution=f($c);hostCommunication=f(m_);configProvider=f(fo);chatState=f(s);destroyRef=f(pe$1);payload=Cv(null);dynamicHeight=Y(null);frameHeight=Ci(()=>{let t=this.dynamicHeight();return t&&t>0?t:null});isLocked=this.chatState.isProgrammaticStreamActive;iframeRef=ZU("previewIframe");safeRendererUrl=Ci(()=>{let t=this.startupResolution.resolvedUrl();if(!t)return null;try{let e=globalThis.location?.origin||void 0,r=new URL(t,e);r.searchParams.delete("origin");let n=new Set;e&&n.add(e);let a=globalThis.location?.ancestorOrigins;if(a)for(let d=0;d<a.length;d++)a[d]&&n.add(a[d]);for(let d of n)r.searchParams.append("origin",d);let ue=Gt(()=>this.configProvider.themePreference());r.searchParams.set("theme",ue);let C=r.toString();return this.urlValidator.isValidHttpUrl(C)?this.sanitizer.bypassSecurityTrustResourceUrl(C):(console.error("Renderer URL failed safe validation:",C),null)}catch(e){return console.error("Failed to parse renderer URL:",e),null}});constructor(){sr(()=>{let e=this.iframeRef()?.nativeElement??null;e&&this.hostCommunication.registerIframe(e);}),this.destroyRef.onDestroy(()=>{let e=this.iframeRef()?.nativeElement??null;e&&this.hostCommunication.unregisterIframe?.(e);}),sr(()=>{let t=this.configProvider.themePreference();this.hostCommunication.sendTheme(t);}),sr(()=>{let t=this.payload(),e=this.iframeRef()?.nativeElement;e&&t!==null&&Array.isArray(t)&&t.length>0&&this.hostCommunication.sendRenderA2UI(t,e);}),sr(()=>{let t=this.hostCommunication?.messageStream;if(typeof t=="function"){let e=t();if(e){let r=this.iframeRef()?.nativeElement,n=r?.contentWindow;if(e.sourceWindow&&n&&e.sourceWindow!==n)return;if(e.type===ge.RENDERER_READY||e.type===ge.A2UI_CATALOG){let a=Gt(()=>this.payload());r&&a!==null&&Array.isArray(a)&&a.length>0&&this.hostCommunication.sendRenderA2UI(a,r);}else if(e.type===ge.SURFACE_RESIZE&&zc.validateIncomingMessage(e)){let a=e.payload;this.dynamicHeight.set(a.height);}}}});}syncPayloadOnIframeLoad(){let t=this.payload(),e=this.iframeRef()?.nativeElement;e&&t!==null&&Array.isArray(t)&&t.length>0&&this.hostCommunication.sendRenderA2UI(t,e);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ue({type:i,selectors:[["a2ui-composer-rendered-frame"]],viewQuery:function(e,r){e&1&&nv(r.iframeRef,ve,5),e&2&&nS();},inputs:{payload:[1,"payload"]},decls:3,vars:5,consts:[["previewIframe",""],[1,"rendered-frame-container"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"src","height"],[1,"rendered-frame-placeholder"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"load","src"]],template:function(e,r){e&1&&(Ht(0,"div",1),vi(1,be,2,3,"iframe",2)(2,we,2,0,"div",3),$t()),e&2&&(hf("height",r.frameHeight()?r.frameHeight()+"px":"100%"),$e("is-locked",r.isLocked()),wt(),bi(r.safeRendererUrl()?1:2));},styles:['[_nghost-%COMP%]{display:block;width:100%;height:100%}.rendered-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;width:100%;height:100%;min-height:280px;container-type:inline-size;container-name:renderedFrame;overflow:hidden;background-color:var(--mat-sys-surface);position:relative;transition:height .15s ease-out}.rendered-frame-container.is-locked[_ngcontent-%COMP%]{pointer-events:none;-webkit-user-select:none;user-select:none}.rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{content:"Gemini is generating visual updates...";position:absolute;top:0;left:0;width:100%;height:100%;background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);z-index:10;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:var(--mat-sys-primary);font-family:Roboto,sans-serif;animation:_ngcontent-%COMP%_fadeInLockout .2s ease-out}.rendered-frame-container[_ngcontent-%COMP%]   .preview-iframe[_ngcontent-%COMP%]{flex:1 1 auto;width:100%;height:100%;min-height:280px;border:none;display:block;isolation:isolate}.rendered-frame-container[_ngcontent-%COMP%]   .rendered-frame-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--mat-sys-on-surface-variant);font-family:sans-serif}@container renderedFrame (max-width: 400px){.rendered-frame-container[_ngcontent-%COMP%]{border-radius:0}}@keyframes _ngcontent-%COMP%_fadeInLockout{0%{opacity:0;-webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px)}to{opacity:1;-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px)}}.dark-theme[_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container)}.dark-theme[_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after, .dark-theme   [_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);color:var(--mat-sys-primary)}']})};export{Ae as A,Ie as I,pe as p};