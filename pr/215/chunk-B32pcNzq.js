import {y as bt,H as ht,I as mo,_,J as ot,aC as U,c9 as xne,b as Xt,bG as bJ,bZ as GO,ai as Yc,h as fr,b_ as px,i as iO,x as xr,ca as hx,b7 as aO,bJ as G3,F as Fo,z as zo,aB as tb,k as sd,M as nb,A as Ar,aG as ld,R as im,T as sm,cb as Rb,G as Gg,ab as jV,C as Cl,P as Pr,at as UO,c as ct,u as ud,bw as $Ie,af as yi,cc as e,v as va,a8 as St,a9 as _y,Z as LLe,bX as hi,j as od,bY as mi,n as id,bx as fO,by as V3,ak as j3,am as L3,cd as lO,ce as ad,B as Bi,ap as ex,aq as tx,bO as R9,cf as QA}from'./main.js';import {y}from'./chunk-BAoc1Dk-.js';var ve=["determinateSpinner"];function ye(i,r){if(i&1&&(px(),fr(0,"svg",11),iO(1,"circle",12),xr()),i&2){let e=j3();zo("viewBox",e._viewBox()),Fo(),tb("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),zo("r",e._circleRadius());}}var we=new U("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:he})}),he=100,Re=10,He=(()=>{class i{_elementRef=_(ot);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=_(we),t=xne(),n=this._elementRef.nativeElement;this._noopAnimations=t==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=n.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&t==="reduced-motion"&&n.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=he;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-Re)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=Xt({type:i,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(t,n){if(t&1&&ld(ve,5),t&2){let a;im(a=sm())&&(n._determinateCircle=a.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(t,n){t&2&&(zo("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",n.mode==="determinate"?n.value:null)("mode",n.mode),nb("mat-"+n.color),tb("width",n.diameter,"px")("height",n.diameter,"px")("--mat-progress-spinner-size",n.diameter+"px")("--mat-progress-spinner-active-indicator-width",n.diameter+"px"),Ar("_mat-animation-noopable",n._noopAnimations)("mdc-circular-progress--indeterminate",n.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",GO],diameter:[2,"diameter","diameter",GO],strokeWidth:[2,"strokeWidth","strokeWidth",GO]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(t,n){if(t&1&&(Yc(0,ye,2,8,"ng-template",null,0,R9),fr(2,"div",2,1),px(),fr(4,"svg",3),iO(5,"circle",4),xr()(),hx(),fr(6,"div",5)(7,"div",6)(8,"div",7),aO(9,8),xr(),fr(10,"div",9),aO(11,8),xr(),fr(12,"div",10),aO(13,8),xr()()()),t&2){let a=G3(1);Fo(4),zo("viewBox",n._viewBox()),Fo(),tb("stroke-dasharray",n._strokeCircumference(),"px")("stroke-dashoffset",n._strokeDashOffset(),"px")("stroke-width",n._circleStrokeWidth(),"%"),zo("r",n._circleRadius()),Fo(4),sd("ngTemplateOutlet",a),Fo(2),sd("ngTemplateOutlet",a),Fo(2),sd("ngTemplateOutlet",a);}},dependencies:[bJ],styles:[`.mat-mdc-progress-spinner {
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
`],encapsulation:2})}return i})();var We=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=bt({type:i});static \u0275inj=ht({imports:[mo]})}return i})();var be=["previewIframe"];function ke(i,r){if(i&1){let e=L3();hi(0,"iframe",4,0),lO("load",function(){ex(e);let n=j3();return tx(n.syncPayloadOnIframeLoad())}),mi();}if(i&2){let e=j3();tb("min-height",e.frameHeightPx()),ad("src",e.safeRendererUrl(),QA);}}function Ce(i,r){i&1&&(hi(0,"div",3),Bi(1,"Rendered UI Placeholder"),mi());}var Pe=8,ge=500,ue=class i{sanitizer=_(Rb);startupResolution=_(Gg);hostCommunication=_(jV);configProvider=_(Cl);chatState=_(y);errorLogger=_(Pr);payload=UO(null);dynamicHeight=ct(null);growthBreakerLatched=ct(false);isGrowthBreakerLatched=this.growthBreakerLatched.asReadonly();growthRunStartHeight=null;lastReportedHeight=null;lastReportTimestamp=0;growthRunLength=0;trackedRendererUrl=void 0;frameHeight=ud(()=>{let r=this.dynamicHeight();return r&&r>0?r:null});frameHeightPx=ud(()=>{let r=this.frameHeight();return r===null?void 0:`${r}px`});isLocked=this.chatState.isProgrammaticStreamActive;iframeRef=$Ie("previewIframe");safeRendererUrl=ud(()=>{let r=this.startupResolution.resolvedUrl();if(!r)return null;try{let e$1=globalThis.location?.origin||void 0,t=globalThis.location?globalThis.document?.baseURI||globalThis.location.href||e$1:void 0,n=new URL(r,t);n.searchParams.delete("origin");let a=new Set;e$1&&a.add(e$1);let _=globalThis.location?.ancestorOrigins;if(_)for(let l=0;l<_.length;l++)_[l]&&a.add(_[l]);for(let l of a)n.searchParams.append("origin",l);let fe=yi(()=>this.configProvider.themePreference());n.searchParams.set("theme",fe);let M=n.toString();return e(M)?this.sanitizer.bypassSecurityTrustResourceUrl(M):(console.error("Renderer URL failed safe validation:",M),null)}catch(e){return console.error("Failed to parse renderer URL:",e),null}});constructor(){va(r=>{let t=this.iframeRef()?.nativeElement??null;t&&(this.hostCommunication.registerIframe(t),r(()=>{this.hostCommunication.unregisterIframe(t);}));}),va(()=>{let r=this.configProvider.themePreference();this.hostCommunication.sendTheme(r);}),va(()=>{let r=this.payload(),e=this.iframeRef()?.nativeElement;e&&r!==null&&Array.isArray(r)&&r.length>0&&(this.hostCommunication.sendRenderA2UI(r,e),this.resetGrowthRun());}),va(()=>{let r=this.hostCommunication.messageStream();if(r){let e=this.iframeRef()?.nativeElement,t=e?.contentWindow;if(r.sourceWindow&&t&&r.sourceWindow!==t)return;if(r.type===St.RENDERER_READY||r.type===St.A2UI_CATALOG){let n=yi(()=>this.payload());e&&n!==null&&Array.isArray(n)&&n.length>0&&this.hostCommunication.sendRenderA2UI(n,e);}else if(r.type===St.SURFACE_RESIZE&&_y.validateIncomingMessage(r)){let n=r.payload;this.dynamicHeight.set(this.capReportedHeight(n.height));}}}),this.hostCommunication.messageStream$.pipe(LLe()).subscribe(r=>this.trackReportedGrowth(r)),va(()=>{let r=this.startupResolution.resolvedUrl();yi(()=>{this.trackedRendererUrl!==void 0&&r!==this.trackedRendererUrl&&this.resetGrowthBreaker(),this.trackedRendererUrl=r;});});}trackReportedGrowth(r){if(!r)return;let e=yi(()=>this.iframeRef()?.nativeElement)?.contentWindow;if(r.sourceWindow&&e&&r.sourceWindow!==e)return;if(r.type===St.RENDERER_READY){this.resetGrowthBreaker();return}if(r.type!==St.SURFACE_RESIZE||!_y.validateIncomingMessage(r))return;let t=r.payload.height;this.lastReportedHeight!==null&&t>this.lastReportedHeight&&r.timestamp-this.lastReportTimestamp<=ge?this.growthRunLength++:(this.growthRunLength=1,this.growthRunStartHeight=t),this.lastReportedHeight=t,this.lastReportTimestamp=r.timestamp,this.growthRunLength>=Pe&&!this.growthBreakerLatched()&&(this.growthBreakerLatched.set(true),this.errorLogger.warn({message:`Preview frame growth stopped: the renderer reported ${this.growthRunLength} consecutive larger heights within ${ge}ms, which is a runaway resize loop. Frame held at ${yi(()=>this.dynamicHeight())??this.growthRunStartHeight}px; last reported height ${t}px.`,sourceTag:"[Shell]"}));}capReportedHeight(r){if(!yi(()=>this.growthBreakerLatched()))return r;let e=yi(()=>this.dynamicHeight())??this.growthRunStartHeight;return e===null?r:Math.min(r,e)}resetGrowthRun(){this.growthRunLength=0,this.growthRunStartHeight=null,this.lastReportedHeight=null,this.lastReportTimestamp=0;}resetGrowthBreaker(){this.resetGrowthRun(),this.growthBreakerLatched.set(false);}setupIframeWheelForwarding(r){try{r.contentWindow?.addEventListener("wheel",e=>{let t=r.closest(".chat-history-container, .side-canvas-viewport");t&&t.scrollBy({top:e.deltaY,left:e.deltaX,behavior:"auto"});},{passive:!0});}catch{}}syncPayloadOnIframeLoad(){let r=this.payload(),e=this.iframeRef()?.nativeElement;e&&(this.setupIframeWheelForwarding(e),r!==null&&Array.isArray(r)&&r.length>0&&this.hostCommunication.sendRenderA2UI(r,e));}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt({type:i,selectors:[["a2ui-composer-rendered-frame"]],viewQuery:function(e,t){e&1&&fO(t.iframeRef,be,5),e&2&&V3();},inputs:{payload:[1,"payload"]},decls:3,vars:7,consts:[["previewIframe",""],[1,"rendered-frame-container"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"src","min-height"],[1,"rendered-frame-placeholder"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"load","src"]],template:function(e,t){e&1&&(hi(0,"div",1),od(1,ke,2,3,"iframe",2)(2,Ce,2,0,"div",3),mi()),e&2&&(tb("height",t.frameHeightPx()??"100%")("min-height",t.frameHeightPx()),Ar("is-locked",t.isLocked()),Fo(),id(t.safeRendererUrl()?1:2));},styles:['[_nghost-%COMP%]{display:block;width:100%;height:100%}.rendered-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;width:100%;height:100%;min-height:280px;container-type:inline-size;container-name:renderedFrame;overflow:hidden;background-color:var(--mat-sys-surface);position:relative}.rendered-frame-container.is-locked[_ngcontent-%COMP%]{pointer-events:none;-webkit-user-select:none;user-select:none}.rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{content:"Gemini is generating visual updates...";position:absolute;top:0;left:0;width:100%;height:100%;background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);z-index:10;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:var(--mat-sys-primary);font-family:Roboto,sans-serif;animation:_ngcontent-%COMP%_fadeInLockout .2s ease-out}.rendered-frame-container[_ngcontent-%COMP%]   .preview-iframe[_ngcontent-%COMP%]{flex:1 1 auto;width:100%;height:100%;min-height:280px;border:none;display:block;isolation:isolate}.rendered-frame-container[_ngcontent-%COMP%]   .rendered-frame-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--mat-sys-on-surface-variant);font-family:sans-serif}@container renderedFrame (max-width: 400px){.rendered-frame-container[_ngcontent-%COMP%]{border-radius:0}}@keyframes _ngcontent-%COMP%_fadeInLockout{0%{opacity:0;-webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px)}to{opacity:1;-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px)}}.dark-theme[_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container)}.dark-theme[_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after, .dark-theme   [_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);color:var(--mat-sys-primary)}']})};export{He as H,We as W,ue as u};