import {B as Nt,C as xt,D as wo,_,E as pt,b6 as V,cr as Zoe,l as ln,c2 as IJ,cg as VR,at as hu,d as br,ch as wk,i as lR,h as $r,cs as Sk,bz as fR,aP as n6,K as Ko,X as Xo,b5 as Jb,m as kd,W as Wb,z as zr,ba as Rd,J as Hm,U as Um,bQ as DE,L as LB,Q as nZ,V as Vu,t as qr,ax as HR,y as yt,N as Nd,R as WTe,a0 as Ri,b as $a,Z as At,aX as Mp,S as Pze,a1 as Ti,k as xd,a3 as ki,r as Td,a5 as BR,a6 as t6,av as Q8,ct as e,aI as W8,cu as hR,cv as Ad,g as Oi,aJ as dk,aK as fk,c8 as F6,bS as aO}from'./main.js';import {s}from'./chunk-BSK9xgtt.js';var _e=["determinateSpinner"];function ve(i,r){if(i&1&&(wk(),br(0,"svg",11),lR(1,"circle",12),$r()),i&2){let e=Q8();Xo("viewBox",e._viewBox()),Ko(),Jb("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),Xo("r",e._circleRadius());}}var ye=new V("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:pe})}),pe=100,we=10,Ie=(()=>{class i{_elementRef=_(pt);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=_(ye),t=Zoe(),n=this._elementRef.nativeElement;this._noopAnimations=t==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=n.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&t==="reduced-motion"&&n.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=pe;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-we)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=ln({type:i,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(t,n){if(t&1&&Rd(_e,5),t&2){let a;Hm(a=Um())&&(n._determinateCircle=a.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(t,n){t&2&&(Xo("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",n.mode==="determinate"?n.value:null)("mode",n.mode),Wb("mat-"+n.color),Jb("width",n.diameter,"px")("height",n.diameter,"px")("--mat-progress-spinner-size",n.diameter+"px")("--mat-progress-spinner-active-indicator-width",n.diameter+"px"),zr("_mat-animation-noopable",n._noopAnimations)("mdc-circular-progress--indeterminate",n.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",VR],diameter:[2,"diameter","diameter",VR],strokeWidth:[2,"strokeWidth","strokeWidth",VR]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(t,n){if(t&1&&(hu(0,ve,2,8,"ng-template",null,0,F6),br(2,"div",2,1),wk(),br(4,"svg",3),lR(5,"circle",4),$r()(),Sk(),br(6,"div",5)(7,"div",6)(8,"div",7),fR(9,8),$r(),br(10,"div",9),fR(11,8),$r(),br(12,"div",10),fR(13,8),$r()()()),t&2){let a=n6(1);Ko(4),Xo("viewBox",n._viewBox()),Ko(),Jb("stroke-dasharray",n._strokeCircumference(),"px")("stroke-dashoffset",n._strokeDashOffset(),"px")("stroke-width",n._circleStrokeWidth(),"%"),Xo("r",n._circleRadius()),Ko(4),kd("ngTemplateOutlet",a),Ko(2),kd("ngTemplateOutlet",a),Ko(2),kd("ngTemplateOutlet",a);}},dependencies:[IJ],styles:[`.mat-mdc-progress-spinner {
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
`],encapsulation:2})}return i})();var He=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=Nt({type:i});static \u0275inj=xt({imports:[wo]})}return i})();function ge(i,r){if(!i)return null;try{let e$1=globalThis.location?.origin||void 0,t=new URL(i,e$1);t.searchParams.delete("origin");let n=new Set;e$1&&n.add(e$1);let a=globalThis.location?.ancestorOrigins;if(a)for(let l=0;l<a.length;l++)a[l]&&n.add(a[l]);for(let l of n)t.searchParams.append("origin",l);t.searchParams.set("theme",r);let P=t.toString();return e(P)?P:(console.error("Renderer URL failed safe validation:",P),null)}catch(e){return console.error("Failed to parse renderer URL:",e),null}}var Re=["previewIframe"];function be(i,r){if(i&1){let e=W8();Ti(0,"iframe",4,0),hR("load",function(){dk(e);let n=Q8();return fk(n.syncPayloadOnIframeLoad())}),ki();}if(i&2){let e=Q8();Jb("min-height",e.frameHeightPx()),Ad("src",e.safeRendererUrl(),aO);}}function ke(i,r){i&1&&(Ti(0,"div",3),Oi(1,"Rendered UI Placeholder"),ki());}var Ce=8,he=500,ue=class i{sanitizer=_(DE);startupResolution=_(LB);hostCommunication=_(nZ);configProvider=_(Vu);chatState=_(s);errorLogger=_(qr);payload=HR(null);dynamicHeight=yt(null);growthBreakerLatched=yt(false);isGrowthBreakerLatched=this.growthBreakerLatched.asReadonly();growthRunStartHeight=null;lastReportedHeight=null;lastReportTimestamp=0;growthRunLength=0;trackedRendererUrl=void 0;frameHeight=Nd(()=>{let r=this.dynamicHeight();return r&&r>0?r:null});frameHeightPx=Nd(()=>{let r=this.frameHeight();return r===null?void 0:`${r}px`});isLocked=this.chatState.isProgrammaticStreamActive;iframeRef=WTe("previewIframe");safeRendererUrl=Nd(()=>{let r=ge(this.startupResolution.resolvedUrl(),Ri(()=>this.configProvider.themePreference()));return r?this.sanitizer.bypassSecurityTrustResourceUrl(r):null});constructor(){$a(r=>{let t=this.iframeRef()?.nativeElement??null;t&&(this.hostCommunication.registerIframe(t),r(()=>{this.hostCommunication.unregisterIframe(t);}));}),$a(()=>{let r=this.configProvider.themePreference();this.hostCommunication.sendTheme(r);}),$a(()=>{let r=this.payload(),e=this.iframeRef()?.nativeElement;e&&r!==null&&Array.isArray(r)&&r.length>0&&(this.hostCommunication.sendRenderA2UI(r,e),this.resetGrowthRun());}),$a(()=>{let r=this.hostCommunication.messageStream();if(r){let e=this.iframeRef()?.nativeElement,t=e?.contentWindow;if(r.sourceWindow&&t&&r.sourceWindow!==t)return;if(r.type===At.RENDERER_READY||r.type===At.A2UI_CATALOG){let n=Ri(()=>this.payload());e&&n!==null&&Array.isArray(n)&&n.length>0&&this.hostCommunication.sendRenderA2UI(n,e);}else if(r.type===At.SURFACE_RESIZE&&Mp.validateIncomingMessage(r)){let n=r.payload;this.dynamicHeight.set(this.capReportedHeight(n.height));}}}),this.hostCommunication.messageStream$.pipe(Pze()).subscribe(r=>this.trackReportedGrowth(r)),$a(()=>{let r=this.startupResolution.resolvedUrl();Ri(()=>{this.trackedRendererUrl!==void 0&&r!==this.trackedRendererUrl&&this.resetGrowthBreaker(),this.trackedRendererUrl=r;});});}trackReportedGrowth(r){if(!r)return;let e=Ri(()=>this.iframeRef()?.nativeElement)?.contentWindow;if(r.sourceWindow&&e&&r.sourceWindow!==e)return;if(r.type===At.RENDERER_READY){this.resetGrowthBreaker();return}if(r.type!==At.SURFACE_RESIZE||!Mp.validateIncomingMessage(r))return;let t=r.payload.height;this.lastReportedHeight!==null&&t>this.lastReportedHeight&&r.timestamp-this.lastReportTimestamp<=he?this.growthRunLength++:(this.growthRunLength=1,this.growthRunStartHeight=t),this.lastReportedHeight=t,this.lastReportTimestamp=r.timestamp,this.growthRunLength>=Ce&&!this.growthBreakerLatched()&&(this.growthBreakerLatched.set(true),this.errorLogger.warn({message:`Preview frame growth stopped: the renderer reported ${this.growthRunLength} consecutive larger heights within ${he}ms, which is a runaway resize loop. Frame held at ${Ri(()=>this.dynamicHeight())??this.growthRunStartHeight}px; last reported height ${t}px.`,sourceTag:"[Shell]"}));}capReportedHeight(r){if(!Ri(()=>this.growthBreakerLatched()))return r;let e=Ri(()=>this.dynamicHeight())??this.growthRunStartHeight;return e===null?r:Math.min(r,e)}resetGrowthRun(){this.growthRunLength=0,this.growthRunStartHeight=null,this.lastReportedHeight=null,this.lastReportTimestamp=0;}resetGrowthBreaker(){this.resetGrowthRun(),this.growthBreakerLatched.set(false);}setupIframeWheelForwarding(r){try{r.contentWindow?.addEventListener("wheel",e=>{let t=r.closest(".chat-history-container, .side-canvas-viewport");t&&t.scrollBy({top:e.deltaY,left:e.deltaX,behavior:"auto"});},{passive:!0});}catch{}}syncPayloadOnIframeLoad(){let r=this.payload(),e=this.iframeRef()?.nativeElement;e&&(this.setupIframeWheelForwarding(e),r!==null&&Array.isArray(r)&&r.length>0&&this.hostCommunication.sendRenderA2UI(r,e));}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ln({type:i,selectors:[["a2ui-composer-rendered-frame"]],viewQuery:function(e,t){e&1&&BR(t.iframeRef,Re,5),e&2&&t6();},inputs:{payload:[1,"payload"]},decls:3,vars:7,consts:[["previewIframe",""],[1,"rendered-frame-container"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"src","min-height"],[1,"rendered-frame-placeholder"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"load","src"]],template:function(e,t){e&1&&(Ti(0,"div",1),xd(1,be,2,3,"iframe",2)(2,ke,2,0,"div",3),ki()),e&2&&(Jb("height",t.frameHeightPx()??"100%")("min-height",t.frameHeightPx()),zr("is-locked",t.isLocked()),Ko(),Td(t.safeRendererUrl()?1:2));},styles:['[_nghost-%COMP%]{display:block;width:100%;height:100%}.rendered-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;width:100%;height:100%;min-height:280px;container-type:inline-size;container-name:renderedFrame;overflow:hidden;background-color:var(--mat-sys-surface);position:relative}.rendered-frame-container.is-locked[_ngcontent-%COMP%]{pointer-events:none;-webkit-user-select:none;user-select:none}.rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{content:"Gemini is generating visual updates...";position:absolute;top:0;left:0;width:100%;height:100%;background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);z-index:10;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:var(--mat-sys-primary);font-family:Roboto,sans-serif;animation:_ngcontent-%COMP%_fadeInLockout .2s ease-out}.rendered-frame-container[_ngcontent-%COMP%]   .preview-iframe[_ngcontent-%COMP%]{flex:1 1 auto;width:100%;height:100%;min-height:280px;border:none;display:block;isolation:isolate}.rendered-frame-container[_ngcontent-%COMP%]   .rendered-frame-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--mat-sys-on-surface-variant);font-family:sans-serif}@container renderedFrame (max-width: 400px){.rendered-frame-container[_ngcontent-%COMP%]{border-radius:0}}@keyframes _ngcontent-%COMP%_fadeInLockout{0%{opacity:0;-webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px)}to{opacity:1;-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px)}}.dark-theme[_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container)}.dark-theme[_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after, .dark-theme   [_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);color:var(--mat-sys-primary)}']})};export{He as H,Ie as I,ge as g,ue as u};