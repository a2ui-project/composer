import {w as Nt,x as xt,S as Si,C,y as ut,aX as W,cQ as Qae,b as an,cB as HY,bT as kL,aA as Sl,I as Ir,bm as WM,V as VF,U as Ur,cR as KM,cc as ZF,bh as f5,Y as Yi,i as eo,bV as zD,k as sf,E as jD,H as Hr,b3 as lf,M as xg,T as Tg,cS as gw,h as hv,R as u3,J as Jl,W as Wr,aE as xL,B as Bt,u as uf,Z as oNe,a0 as $o,cT as e,G as Ga,$ as $t,bH as c_,_ as l$e,a1 as Ro,r as rf,a3 as No,p as of,a5 as YF,a6 as d5,aC as c5,bd as o5,bk as JF,be as PM,bf as $M,bl as af,g as Po,bg as Q5,cU as N$}from'./main.js';import {y}from'./chunk-ChVFZ7RU.js';var ve=["determinateSpinner"];function ye(i,r){if(i&1&&(WM(),Ir(0,"svg",11),VF(1,"circle",12),Ur()),i&2){let e=c5();eo("viewBox",e._viewBox()),Yi(),zD("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),eo("r",e._circleRadius());}}var we=new W("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:he})}),he=100,Re=10,He=(()=>{class i{_elementRef=C(ut);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=C(we),t=Qae(),n=this._elementRef.nativeElement;this._noopAnimations=t==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=n.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&t==="reduced-motion"&&n.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=he;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-Re)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=an({type:i,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(t,n){if(t&1&&lf(ve,5),t&2){let a;xg(a=Tg())&&(n._determinateCircle=a.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(t,n){t&2&&(eo("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",n.mode==="determinate"?n.value:null)("mode",n.mode),jD("mat-"+n.color),zD("width",n.diameter,"px")("height",n.diameter,"px")("--mat-progress-spinner-size",n.diameter+"px")("--mat-progress-spinner-active-indicator-width",n.diameter+"px"),Hr("_mat-animation-noopable",n._noopAnimations)("mdc-circular-progress--indeterminate",n.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",kL],diameter:[2,"diameter","diameter",kL],strokeWidth:[2,"strokeWidth","strokeWidth",kL]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(t,n){if(t&1&&(Sl(0,ye,2,8,"ng-template",null,0,Q5),Ir(2,"div",2,1),WM(),Ir(4,"svg",3),VF(5,"circle",4),Ur()(),KM(),Ir(6,"div",5)(7,"div",6)(8,"div",7),ZF(9,8),Ur(),Ir(10,"div",9),ZF(11,8),Ur(),Ir(12,"div",10),ZF(13,8),Ur()()()),t&2){let a=f5(1);Yi(4),eo("viewBox",n._viewBox()),Yi(),zD("stroke-dasharray",n._strokeCircumference(),"px")("stroke-dashoffset",n._strokeDashOffset(),"px")("stroke-width",n._circleStrokeWidth(),"%"),eo("r",n._circleRadius()),Yi(4),sf("ngTemplateOutlet",a),Yi(2),sf("ngTemplateOutlet",a),Yi(2),sf("ngTemplateOutlet",a);}},dependencies:[HY],styles:[`.mat-mdc-progress-spinner {
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
`],encapsulation:2})}return i})();var We=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=Nt({type:i});static \u0275inj=xt({imports:[Si]})}return i})();var be=["previewIframe"];function ke(i,r){if(i&1){let e=o5();Ro(0,"iframe",4,0),JF("load",function(){PM(e);let n=c5();return $M(n.syncPayloadOnIframeLoad())}),No();}if(i&2){let e=c5();zD("min-height",e.frameHeightPx()),af("src",e.safeRendererUrl(),N$);}}function Ce(i,r){i&1&&(Ro(0,"div",3),Po(1,"Rendered UI Placeholder"),No());}var Pe=8,ge=500,ue=class i{sanitizer=C(gw);startupResolution=C(hv);hostCommunication=C(u3);configProvider=C(Jl);chatState=C(y);errorLogger=C(Wr);payload=xL(null);dynamicHeight=Bt(null);growthBreakerLatched=Bt(false);isGrowthBreakerLatched=this.growthBreakerLatched.asReadonly();growthRunStartHeight=null;lastReportedHeight=null;lastReportTimestamp=0;growthRunLength=0;trackedRendererUrl=void 0;frameHeight=uf(()=>{let r=this.dynamicHeight();return r&&r>0?r:null});frameHeightPx=uf(()=>{let r=this.frameHeight();return r===null?void 0:`${r}px`});isLocked=this.chatState.isProgrammaticStreamActive;iframeRef=oNe("previewIframe");safeRendererUrl=uf(()=>{let r=this.startupResolution.resolvedUrl();if(!r)return null;try{let e$1=globalThis.location?.origin||void 0,t=globalThis.location?globalThis.document?.baseURI||globalThis.location.href||e$1:void 0,n=new URL(r,t);n.searchParams.delete("origin");let a=new Set;e$1&&a.add(e$1);let _=globalThis.location?.ancestorOrigins;if(_)for(let l=0;l<_.length;l++)_[l]&&a.add(_[l]);for(let l of a)n.searchParams.append("origin",l);let fe=$o(()=>this.configProvider.themePreference());n.searchParams.set("theme",fe);let M=n.toString();return e(M)?this.sanitizer.bypassSecurityTrustResourceUrl(M):(console.error("Renderer URL failed safe validation:",M),null)}catch(e){return console.error("Failed to parse renderer URL:",e),null}});constructor(){Ga(r=>{let t=this.iframeRef()?.nativeElement??null;t&&(this.hostCommunication.registerIframe(t),r(()=>{this.hostCommunication.unregisterIframe(t);}));}),Ga(()=>{let r=this.configProvider.themePreference();this.hostCommunication.sendTheme(r);}),Ga(()=>{let r=this.payload(),e=this.iframeRef()?.nativeElement;e&&r!==null&&Array.isArray(r)&&r.length>0&&(this.hostCommunication.sendRenderA2UI(r,e),this.resetGrowthRun());}),Ga(()=>{let r=this.hostCommunication.messageStream();if(r){let e=this.iframeRef()?.nativeElement,t=e?.contentWindow;if(r.sourceWindow&&t&&r.sourceWindow!==t)return;if(r.type===$t.RENDERER_READY||r.type===$t.A2UI_CATALOG){let n=$o(()=>this.payload());e&&n!==null&&Array.isArray(n)&&n.length>0&&this.hostCommunication.sendRenderA2UI(n,e);}else if(r.type===$t.SURFACE_RESIZE&&c_.validateIncomingMessage(r)){let n=r.payload;this.dynamicHeight.set(this.capReportedHeight(n.height));}}}),this.hostCommunication.messageStream$.pipe(l$e()).subscribe(r=>this.trackReportedGrowth(r)),Ga(()=>{let r=this.startupResolution.resolvedUrl();$o(()=>{this.trackedRendererUrl!==void 0&&r!==this.trackedRendererUrl&&this.resetGrowthBreaker(),this.trackedRendererUrl=r;});});}trackReportedGrowth(r){if(!r)return;let e=$o(()=>this.iframeRef()?.nativeElement)?.contentWindow;if(r.sourceWindow&&e&&r.sourceWindow!==e)return;if(r.type===$t.RENDERER_READY){this.resetGrowthBreaker();return}if(r.type!==$t.SURFACE_RESIZE||!c_.validateIncomingMessage(r))return;let t=r.payload.height;this.lastReportedHeight!==null&&t>this.lastReportedHeight&&r.timestamp-this.lastReportTimestamp<=ge?this.growthRunLength++:(this.growthRunLength=1,this.growthRunStartHeight=t),this.lastReportedHeight=t,this.lastReportTimestamp=r.timestamp,this.growthRunLength>=Pe&&!this.growthBreakerLatched()&&(this.growthBreakerLatched.set(true),this.errorLogger.warn({message:`Preview frame growth stopped: the renderer reported ${this.growthRunLength} consecutive larger heights within ${ge}ms, which is a runaway resize loop. Frame held at ${$o(()=>this.dynamicHeight())??this.growthRunStartHeight}px; last reported height ${t}px.`,sourceTag:"[Shell]"}));}capReportedHeight(r){if(!$o(()=>this.growthBreakerLatched()))return r;let e=$o(()=>this.dynamicHeight())??this.growthRunStartHeight;return e===null?r:Math.min(r,e)}resetGrowthRun(){this.growthRunLength=0,this.growthRunStartHeight=null,this.lastReportedHeight=null,this.lastReportTimestamp=0;}resetGrowthBreaker(){this.resetGrowthRun(),this.growthBreakerLatched.set(false);}setupIframeWheelForwarding(r){try{r.contentWindow?.addEventListener("wheel",e=>{let t=r.closest(".chat-history-container, .side-canvas-viewport");t&&t.scrollBy({top:e.deltaY,left:e.deltaX,behavior:"auto"});},{passive:!0});}catch{}}syncPayloadOnIframeLoad(){let r=this.payload(),e=this.iframeRef()?.nativeElement;e&&(this.setupIframeWheelForwarding(e),r!==null&&Array.isArray(r)&&r.length>0&&this.hostCommunication.sendRenderA2UI(r,e));}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-rendered-frame"]],viewQuery:function(e,t){e&1&&YF(t.iframeRef,be,5),e&2&&d5();},inputs:{payload:[1,"payload"]},decls:3,vars:7,consts:[["previewIframe",""],[1,"rendered-frame-container"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"src","min-height"],[1,"rendered-frame-placeholder"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"load","src"]],template:function(e,t){e&1&&(Ro(0,"div",1),rf(1,ke,2,3,"iframe",2)(2,Ce,2,0,"div",3),No()),e&2&&(zD("height",t.frameHeightPx()??"100%")("min-height",t.frameHeightPx()),Hr("is-locked",t.isLocked()),Yi(),of(t.safeRendererUrl()?1:2));},styles:['[_nghost-%COMP%]{display:block;width:100%;height:100%}.rendered-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;width:100%;height:100%;min-height:280px;container-type:inline-size;container-name:renderedFrame;overflow:hidden;background-color:var(--mat-sys-surface);position:relative}.rendered-frame-container.is-locked[_ngcontent-%COMP%]{pointer-events:none;-webkit-user-select:none;user-select:none}.rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{content:"Gemini is generating visual updates...";position:absolute;top:0;left:0;width:100%;height:100%;background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);z-index:10;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:var(--mat-sys-primary);font-family:Roboto,sans-serif;animation:_ngcontent-%COMP%_fadeInLockout .2s ease-out}.rendered-frame-container[_ngcontent-%COMP%]   .preview-iframe[_ngcontent-%COMP%]{flex:1 1 auto;width:100%;height:100%;min-height:280px;border:none;display:block;isolation:isolate}.rendered-frame-container[_ngcontent-%COMP%]   .rendered-frame-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--mat-sys-on-surface-variant);font-family:sans-serif}@container renderedFrame (max-width: 400px){.rendered-frame-container[_ngcontent-%COMP%]{border-radius:0}}@keyframes _ngcontent-%COMP%_fadeInLockout{0%{opacity:0;-webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px)}to{opacity:1;-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px)}}.dark-theme[_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container)}.dark-theme[_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after, .dark-theme   [_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);color:var(--mat-sys-primary)}']})};export{He as H,We as W,ue as u};