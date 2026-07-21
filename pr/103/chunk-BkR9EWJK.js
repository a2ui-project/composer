import {X as Xe,J as Je,I,A as A$1,G,h,e as et}from'./chunk-FEqRqiQ3.js';import {S as So,q as qt$1,x as xe$1,B as Bo,R}from'./chunk-K_J2SIZD.js';import {i as ss,m as Dr,aL as cp,w as wI,aj as Fh,n as sw,p as aw,G as GI,c as GD,z as zI,an as Hw,o as og,M as xu,al as J1,b5 as Wh,g,Z as Zn,B as w,b6 as VC,as as ej,am as jh,q as qi,aG as Kd,$ as $h,j as ju,b7 as Xd,aV as fw,H as Hh,at as rg,U as Uh,r as Cw,X as Xh,u as uw,t as lw,b8 as Sb,T as Xg,I as Is,_ as Q1,e as eC,a1 as gg,s as sf,P as Bu,V as Vu,a3 as eg,a4 as dw,Q as Qe,h as N,b9 as bg,O as bC,x as re,W,E as ee,ag as Ge,ba as sr,ap as mg,F as ry,bb as Rm,aJ as qs,bc as Vm,bd as zm,K as Kh,y as Qn,av as Gn,ak as qc,k as kw,J as ED,a2 as Gh,aE as ow,aM as qh,be as Cm,bf as wm,bg as Yw,bh as kp}from'./main.js';function Gt(i){let o=i.trim();if(o.startsWith("[")&&o.endsWith("]"))try{let e=JSON.parse(o);if(Array.isArray(e))return e}catch{}return null}function Kt(i){return JSON.stringify(i,null,2)}var xt=["determinateSpinner"];function Mt(i,o){if(i&1&&(Kd(),qi(0,"svg",11),$h(1,"circle",12),ju()),i&2){let e=ow();Hh("viewBox",e._viewBox()),GD(),rg("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),Hh("r",e._circleRadius());}}var Tt=new w("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:yt})}),yt=100,Et=10,si=(()=>{class i{_elementRef=g(Zn);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=g(Tt),t=So(),n=this._elementRef.nativeElement;this._noopAnimations=t==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=n.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&t==="reduced-motion"&&n.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0));}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0;}_diameter=yt;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0;}_strokeWidth;_circleRadius(){return (this.diameter-Et)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return `0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=wI({type:i,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(t,n){if(t&1&&Xh(xt,5),t&2){let r;uw(r=lw())&&(n._determinateCircle=r.first);}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(t,n){t&2&&(Hh("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",n.mode==="determinate"?n.value:null)("mode",n.mode),Cw("mat-"+n.color),rg("width",n.diameter,"px")("height",n.diameter,"px")("--mat-progress-spinner-size",n.diameter+"px")("--mat-progress-spinner-active-indicator-width",n.diameter+"px"),og("_mat-animation-noopable",n._noopAnimations)("mdc-circular-progress--indeterminate",n.mode==="indeterminate"));},inputs:{color:"color",mode:"mode",value:[2,"value","value",ej],diameter:[2,"diameter","diameter",ej],strokeWidth:[2,"strokeWidth","strokeWidth",ej]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(t,n){if(t&1&&(jh(0,Mt,2,8,"ng-template",null,0,Yw),qi(2,"div",2,1),Kd(),qi(4,"svg",3),$h(5,"circle",4),ju()(),Xd(),qi(6,"div",5)(7,"div",6)(8,"div",7),Wh(9,8),ju(),qi(10,"div",9),Wh(11,8),ju(),qi(12,"div",10),Wh(13,8),ju()()()),t&2){let r=fw(1);GD(4),Hh("viewBox",n._viewBox()),GD(),rg("stroke-dasharray",n._strokeCircumference(),"px")("stroke-dashoffset",n._strokeDashOffset(),"px")("stroke-width",n._circleStrokeWidth(),"%"),Hh("r",n._circleRadius()),GD(4),Uh("ngTemplateOutlet",r),GD(2),Uh("ngTemplateOutlet",r),GD(2),Uh("ngTemplateOutlet",r);}},dependencies:[VC],styles:[`.mat-mdc-progress-spinner {
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
`],encapsulation:2})}return i})();var ai=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=ss({type:i});static \u0275inj=Dr({imports:[xe$1]})}return i})();var ae=class i{_chatHistory=Qe([]);_pipelineStatus=Qe("idle");_isProgrammaticStreamActive=Qe(false);_latestLlmLog=Qe(null);_llmHistory=Qe([]);chatHistory=this._chatHistory.asReadonly();pipelineStatus=this._pipelineStatus.asReadonly();isProgrammaticStreamActive=this._isProgrammaticStreamActive.asReadonly();latestLlmLog=this._latestLlmLog.asReadonly();llmHistory=this._llmHistory.asReadonly();setChatHistory(o){this._chatHistory.set(o);}updateChatHistory(o){this._chatHistory.update(o);}setPipelineStatus(o){this._pipelineStatus.set(o);}setProgrammaticStreamActive(o){this._isProgrammaticStreamActive.set(o);}addRawLlmLog(o,e){let t={type:o,timestamp:Date.now(),payload:e};this._latestLlmLog.set(t),this._llmHistory.update(n=>[...n,t].slice(-50));}clearRawLlmHistory(){this._latestLlmLog.set(null),this._llmHistory.set([]);}static \u0275fac=function(e){return new(e||i)};static \u0275prov=N({token:i,factory:i.\u0275fac,providedIn:"root"})};var Ft=["previewIframe"];function Ot(i,o){if(i&1&&Gh(0,"iframe",2,0),i&2){let e=ow();qh("src",e.safeRendererUrl(),kp);}}function It(i,o){i&1&&(Bu(0,"div",3),kw(1,"Rendered UI Placeholder"),Vu());}var wt=class i{sanitizer=g(Sb);startupResolution=g(Xg);hostCommunication=g(qt$1);configProvider=g(Is);chatState=g(ae);isLocked=this.chatState.isProgrammaticStreamActive;iframeRef=Q1("previewIframe");safeRendererUrl=eC(()=>{let o=this.startupResolution.resolvedUrl();if(!o)return null;try{let e=globalThis.location?.origin||"",t=new URL(o,e);t.searchParams.set("origin",e);let n=gg(()=>this.configProvider.themePreference());return t.searchParams.set("theme",n),this.sanitizer.bypassSecurityTrustResourceUrl(t.toString())}catch(e){return console.error("Failed to parse renderer URL:",e),null}});constructor(){sf(()=>{let o=this.iframeRef();this.hostCommunication.registerIframeElement(o?.nativeElement||null);}),sf(()=>{let o=this.configProvider.themePreference();this.hostCommunication.sendTheme(o);});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=wI({type:i,selectors:[["a2ui-composer-rendered-frame"]],viewQuery:function(e,t){e&1&&eg(t.iframeRef,Ft,5),e&2&&dw();},decls:3,vars:3,consts:[["previewIframe",""],[1,"rendered-frame-container"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"src"],[1,"rendered-frame-placeholder"]],template:function(e,t){e&1&&(Bu(0,"div",1),GI(1,Ot,2,1,"iframe",2)(2,It,2,0,"div",3),Vu()),e&2&&(og("is-locked",t.isLocked()),GD(),zI(t.safeRendererUrl()?1:2));},styles:['[_nghost-%COMP%]{display:block;width:100%;height:100%}.rendered-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;width:100%;height:100%;container-type:inline-size;container-name:renderedFrame;overflow:hidden;background-color:var(--mat-sys-surface);position:relative}.rendered-frame-container.is-locked[_ngcontent-%COMP%]{pointer-events:none;-webkit-user-select:none;user-select:none}.rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{content:"Gemini is generating visual updates...";position:absolute;top:0;left:0;width:100%;height:100%;background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);z-index:10;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:var(--mat-sys-primary);font-family:Roboto,sans-serif;animation:_ngcontent-%COMP%_fadeInLockout .2s ease-out}.rendered-frame-container[_ngcontent-%COMP%]   .preview-iframe[_ngcontent-%COMP%]{flex:1 1 auto;width:100%;height:100%;border:none;display:block;isolation:isolate}.rendered-frame-container[_ngcontent-%COMP%]   .rendered-frame-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--mat-sys-on-surface-variant);font-family:sans-serif}@container renderedFrame (max-width: 400px){.rendered-frame-container[_ngcontent-%COMP%]{border-radius:0}}@keyframes _ngcontent-%COMP%_fadeInLockout{0%{opacity:0;-webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px)}to{opacity:1;-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px)}}.dark-theme[_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container)}.dark-theme[_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after, .dark-theme   [_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);color:var(--mat-sys-primary)}']})};var Lt=[[["caption"]],[["colgroup"],["col"]],"*"],Ht=["caption","colgroup, col","*"];function zt(i,o){i&1&&aw(0,2);}function Bt(i,o){i&1&&(qi(0,"thead",0),Wh(1,1),ju(),qi(2,"tbody",0),Wh(3,2)(4,3),ju(),qi(5,"tfoot",0),Wh(6,4),ju());}function jt(i,o){i&1&&Wh(0,1)(1,2)(2,3)(3,4);}var M=new w("CDK_TABLE");var de=(()=>{class i{template=g(Gn);static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["","cdkCellDef",""]]})}return i})(),me=(()=>{class i{template=g(Gn);static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["","cdkHeaderCellDef",""]]})}return i})(),Dt=(()=>{class i{template=g(Gn);static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["","cdkFooterCellDef",""]]})}return i})(),$=(()=>{class i{_table=g(M,{optional:true});_hasStickyChanged=false;get name(){return this._name}set name(e){this._setNameInput(e);}_name;get sticky(){return this._sticky}set sticky(e){e!==this._sticky&&(this._sticky=e,this._hasStickyChanged=true);}_sticky=false;get stickyEnd(){return this._stickyEnd}set stickyEnd(e){e!==this._stickyEnd&&(this._stickyEnd=e,this._hasStickyChanged=true);}_stickyEnd=false;cell;headerCell;footerCell;cssClassFriendlyName;_columnCssClassName;hasStickyChanged(){let e=this._hasStickyChanged;return this.resetStickyChanged(),e}resetStickyChanged(){this._hasStickyChanged=false;}_updateColumnCssClassName(){this._columnCssClassName=[`cdk-column-${this.cssClassFriendlyName}`];}_setNameInput(e){e&&(this._name=e,this.cssClassFriendlyName=e.replace(/[^a-z0-9_-]/gi,"-"),this._updateColumnCssClassName());}static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["","cdkColumnDef",""]],contentQueries:function(t,n,r){if(t&1&&Kh(r,de,5)(r,me,5)(r,Dt,5),t&2){let s;uw(s=lw())&&(n.cell=s.first),uw(s=lw())&&(n.headerCell=s.first),uw(s=lw())&&(n.footerCell=s.first);}},inputs:{name:[0,"cdkColumnDef","name"],sticky:[2,"sticky","sticky",J1],stickyEnd:[2,"stickyEnd","stickyEnd",J1]}})}return i})(),ce=class{constructor(o,e){e.nativeElement.classList.add(...o._columnCssClassName);}},Rt=(()=>{class i extends ce{constructor(){super(g($),g(Zn));}static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["cdk-header-cell"],["th","cdk-header-cell",""]],hostAttrs:["role","columnheader",1,"cdk-header-cell"],features:[Fh]})}return i})();var bt=(()=>{class i extends ce{constructor(){let e=g($),t=g(Zn);super(e,t);let n=e._table?._getCellRole();n&&t.nativeElement.setAttribute("role",n);}static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["cdk-cell"],["td","cdk-cell",""]],hostAttrs:[1,"cdk-cell"],features:[Fh]})}return i})();var Re=(()=>{class i{template=g(Gn);_differs=g(bg);columns;_columnsDiffer;ngOnChanges(e){if(!this._columnsDiffer){let t=e.columns&&e.columns.currentValue||[];this._columnsDiffer=this._differs.find(t).create(),this._columnsDiffer.diff(t);}}getColumnsDiff(){return this._columnsDiffer.diff(this.columns)}extractCellTemplate(e){return this instanceof J?e.headerCell.template:this instanceof be?e.footerCell.template:e.cell.template}static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,features:[qc]})}return i})(),J=(()=>{class i extends Re{_table=g(M,{optional:true});_hasStickyChanged=false;get sticky(){return this._sticky}set sticky(e){e!==this._sticky&&(this._sticky=e,this._hasStickyChanged=true);}_sticky=false;ngOnChanges(e){super.ngOnChanges(e);}hasStickyChanged(){let e=this._hasStickyChanged;return this.resetStickyChanged(),e}resetStickyChanged(){this._hasStickyChanged=false;}static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275dir=xu({type:i,selectors:[["","cdkHeaderRowDef",""]],inputs:{columns:[0,"cdkHeaderRowDef","columns"],sticky:[2,"cdkHeaderRowDefSticky","sticky",J1]},features:[Fh,qc]})}return i})(),be=(()=>{class i extends Re{_table=g(M,{optional:true});_hasStickyChanged=false;get sticky(){return this._sticky}set sticky(e){e!==this._sticky&&(this._sticky=e,this._hasStickyChanged=true);}_sticky=false;ngOnChanges(e){super.ngOnChanges(e);}hasStickyChanged(){let e=this._hasStickyChanged;return this.resetStickyChanged(),e}resetStickyChanged(){this._hasStickyChanged=false;}static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275dir=xu({type:i,selectors:[["","cdkFooterRowDef",""]],inputs:{columns:[0,"cdkFooterRowDef","columns"],sticky:[2,"cdkFooterRowDefSticky","sticky",J1]},features:[Fh,qc]})}return i})(),ue=(()=>{class i extends Re{_table=g(M,{optional:true});when;static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275dir=xu({type:i,selectors:[["","cdkRowDef",""]],inputs:{columns:[0,"cdkRowDefColumns","columns"],when:[0,"cdkRowDefWhen","when"]},features:[Fh]})}return i})(),A=(()=>{class i{_viewContainer=g(Qn);cells;context;static mostRecentCellOutlet=null;constructor(){i.mostRecentCellOutlet=this;}ngOnDestroy(){i.mostRecentCellOutlet===this&&(i.mostRecentCellOutlet=null);}static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["","cdkCellOutlet",""]]})}return i})(),ke=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275cmp=wI({type:i,selectors:[["cdk-header-row"],["tr","cdk-header-row",""]],hostAttrs:["role","row",1,"cdk-header-row"],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,n){t&1&&Wh(0,0);},dependencies:[A],encapsulation:2,changeDetection:1})}return i})();var Se=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275cmp=wI({type:i,selectors:[["cdk-row"],["tr","cdk-row",""]],hostAttrs:["role","row",1,"cdk-row"],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,n){t&1&&Wh(0,0);},dependencies:[A],encapsulation:2,changeDetection:1})}return i})(),kt=(()=>{class i{templateRef=g(Gn);_contentClassNames=["cdk-no-data-row","cdk-row"];_cellClassNames=["cdk-cell","cdk-no-data-cell"];_cellSelector="td, cdk-cell, [cdk-cell], .cdk-cell";static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["ng-template","cdkNoDataRow",""]]})}return i})(),Ct=["top","bottom","left","right"],De=class{_isNativeHtmlTable;_stickCellCss;_isBrowser;_needsPositionStickyOnElement;direction;_positionListener;_tableInjector;_elemSizeCache=new WeakMap;_resizeObserver=globalThis?.ResizeObserver?new globalThis.ResizeObserver(o=>this._updateCachedSizes(o)):null;_updatedStickyColumnsParamsToReplay=[];_stickyColumnsReplayTimeout=null;_cachedCellWidths=[];_borderCellCss;_destroyed=false;constructor(o,e,t=true,n=true,r,s,l){this._isNativeHtmlTable=o,this._stickCellCss=e,this._isBrowser=t,this._needsPositionStickyOnElement=n,this.direction=r,this._positionListener=s,this._tableInjector=l,this._borderCellCss={top:`${e}-border-elem-top`,bottom:`${e}-border-elem-bottom`,left:`${e}-border-elem-left`,right:`${e}-border-elem-right`};}clearStickyPositioning(o,e){(e.includes("left")||e.includes("right"))&&this._removeFromStickyColumnReplayQueue(o);let t=[];for(let n of o)n.nodeType===n.ELEMENT_NODE&&t.push(n,...Array.from(n.children));ED({write:()=>{for(let n of t)this._removeStickyStyle(n,e);}},{injector:this._tableInjector});}updateStickyColumns(o,e,t,n=true,r=true){if(!o.length||!this._isBrowser||!(e.some(b=>b)||t.some(b=>b))){this._positionListener?.stickyColumnsUpdated({sizes:[]}),this._positionListener?.stickyEndColumnsUpdated({sizes:[]});return}let s=o[0],l=s.children.length,c=this.direction==="rtl",d=c?"right":"left",u=c?"left":"right",D=e.lastIndexOf(true),h=t.indexOf(true),p,Oe,Ie;r&&this._updateStickyColumnReplayQueue({rows:[...o],stickyStartStates:[...e],stickyEndStates:[...t]}),ED({earlyRead:()=>{p=this._getCellWidths(s,n),Oe=this._getStickyStartColumnPositions(p,e),Ie=this._getStickyEndColumnPositions(p,t);},write:()=>{for(let b of o)for(let v=0;v<l;v++){let Ne=b.children[v];e[v]&&this._addStickyStyle(Ne,d,Oe[v],v===D),t[v]&&this._addStickyStyle(Ne,u,Ie[v],v===h);}this._positionListener&&p.some(b=>!!b)&&(this._positionListener.stickyColumnsUpdated({sizes:D===-1?[]:p.slice(0,D+1).map((b,v)=>e[v]?b:null)}),this._positionListener.stickyEndColumnsUpdated({sizes:h===-1?[]:p.slice(h).map((b,v)=>t[v+h]?b:null).reverse()}));}},{injector:this._tableInjector});}stickRows(o,e,t){if(!this._isBrowser)return;let n=t==="bottom"?o.slice().reverse():o,r=t==="bottom"?e.slice().reverse():e,s=[],l=[],c=[];ED({earlyRead:()=>{for(let d=0,u=0;d<n.length;d++){if(!r[d])continue;s[d]=u;let D=n[d];c[d]=this._isNativeHtmlTable?Array.from(D.children):[D];let h=this._retrieveElementSize(D).height;u+=h,l[d]=h;}},write:()=>{let d=r.lastIndexOf(true);for(let u=0;u<n.length;u++){if(!r[u])continue;let D=s[u],h=u===d;for(let p of c[u])this._addStickyStyle(p,t,D,h);}t==="top"?this._positionListener?.stickyHeaderRowsUpdated({sizes:l,offsets:s,elements:c}):this._positionListener?.stickyFooterRowsUpdated({sizes:l,offsets:s,elements:c});}},{injector:this._tableInjector});}updateStickyFooterContainer(o,e){this._isNativeHtmlTable&&ED({write:()=>{let t=o.querySelector("tfoot");t&&(e.some(n=>!n)?this._removeStickyStyle(t,["bottom"]):this._addStickyStyle(t,"bottom",0,false));}},{injector:this._tableInjector});}destroy(){this._stickyColumnsReplayTimeout&&clearTimeout(this._stickyColumnsReplayTimeout),this._resizeObserver?.disconnect(),this._destroyed=true;}_removeStickyStyle(o,e){if(!o.classList.contains(this._stickCellCss))return;for(let n of e)o.style[n]="",o.classList.remove(this._borderCellCss[n]);Ct.some(n=>e.indexOf(n)===-1&&o.style[n])?o.style.zIndex=this._getCalculatedZIndex(o):(o.style.zIndex="",this._needsPositionStickyOnElement&&(o.style.position=""),o.classList.remove(this._stickCellCss));}_addStickyStyle(o,e,t,n){o.classList.add(this._stickCellCss),n&&o.classList.add(this._borderCellCss[e]),o.style[e]=`${t}px`,o.style.zIndex=this._getCalculatedZIndex(o),this._needsPositionStickyOnElement&&(o.style.cssText+="position: -webkit-sticky; position: sticky; ");}_getCalculatedZIndex(o){let e={top:100,bottom:10,left:1,right:1},t=0;for(let n of Ct)o.style[n]&&(t+=e[n]);return t?`${t}`:""}_getCellWidths(o,e=true){if(!e&&this._cachedCellWidths.length)return this._cachedCellWidths;let t=[],n=o.children;for(let r=0;r<n.length;r++){let s=n[r];t.push(this._retrieveElementSize(s).width);}return this._cachedCellWidths=t,t}_getStickyStartColumnPositions(o,e){let t=[],n=0;for(let r=0;r<o.length;r++)e[r]&&(t[r]=n,n+=o[r]);return t}_getStickyEndColumnPositions(o,e){let t=[],n=0;for(let r=o.length;r>0;r--)e[r]&&(t[r]=n,n+=o[r]);return t}_retrieveElementSize(o){let e=this._elemSizeCache.get(o);if(e)return e;let t=o.getBoundingClientRect(),n={width:t.width,height:t.height};return this._resizeObserver&&(this._elemSizeCache.set(o,n),this._resizeObserver.observe(o,{box:"border-box"})),n}_updateStickyColumnReplayQueue(o){this._removeFromStickyColumnReplayQueue(o.rows),this._stickyColumnsReplayTimeout||this._updatedStickyColumnsParamsToReplay.push(o);}_removeFromStickyColumnReplayQueue(o){let e=new Set(o);for(let t of this._updatedStickyColumnsParamsToReplay)t.rows=t.rows.filter(n=>!e.has(n));this._updatedStickyColumnsParamsToReplay=this._updatedStickyColumnsParamsToReplay.filter(t=>!!t.rows.length);}_updateCachedSizes(o){let e=false;for(let t of o){let n=t.borderBoxSize?.length?{width:t.borderBoxSize[0].inlineSize,height:t.borderBoxSize[0].blockSize}:{width:t.contentRect.width,height:t.contentRect.height};n.width!==this._elemSizeCache.get(t.target)?.width&&Ut(t.target)&&(e=true),this._elemSizeCache.set(t.target,n);}e&&this._updatedStickyColumnsParamsToReplay.length&&(this._stickyColumnsReplayTimeout&&clearTimeout(this._stickyColumnsReplayTimeout),this._stickyColumnsReplayTimeout=setTimeout(()=>{if(!this._destroyed){for(let t of this._updatedStickyColumnsParamsToReplay)this.updateStickyColumns(t.rows,t.stickyStartStates,t.stickyEndStates,true,false);this._updatedStickyColumnsParamsToReplay=[],this._stickyColumnsReplayTimeout=null;}},0));}};function Ut(i){return ["cdk-cell","cdk-header-cell","cdk-footer-cell"].some(o=>i.classList.contains(o))}var K=new w("STICKY_POSITIONING_LISTENER");var xe=(()=>{class i{viewContainer=g(Qn);elementRef=g(Zn);constructor(){let e=g(M);e._rowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["","rowOutlet",""]]})}return i})(),Me=(()=>{class i{viewContainer=g(Qn);elementRef=g(Zn);constructor(){let e=g(M);e._headerRowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["","headerRowOutlet",""]]})}return i})(),Te=(()=>{class i{viewContainer=g(Qn);elementRef=g(Zn);constructor(){let e=g(M);e._footerRowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["","footerRowOutlet",""]]})}return i})(),Ee=(()=>{class i{viewContainer=g(Qn);elementRef=g(Zn);constructor(){let e=g(M);e._noDataRowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||i)};static \u0275dir=xu({type:i,selectors:[["","noDataRowOutlet",""]]})}return i})(),Fe=(()=>{class i{_differs=g(bg);_changeDetectorRef=g(bC);_elementRef=g(Zn);_dir=g(Bo,{optional:true});_platform=g(R);_viewRepeater;_viewportRuler=g(Xe);_injector=g(re);_virtualScrollViewport=g(Je,{optional:true,host:true});_positionListener=g(K,{optional:true})||g(K,{optional:true,skipSelf:true});_document=g(W);_data;_renderedRange;_onDestroy=new ee;_renderRows;_renderChangeSubscription=null;_columnDefsByName=new Map;_rowDefs;_headerRowDefs;_footerRowDefs;_dataDiffer;_defaultRowDef=null;_customColumnDefs=new Set;_customRowDefs=new Set;_customHeaderRowDefs=new Set;_customFooterRowDefs=new Set;_customNoDataRow=null;_headerRowDefChanged=true;_footerRowDefChanged=true;_stickyColumnStylesNeedReset=true;_forceRecalculateCellWidths=true;_cachedRenderRowsMap=new Map;_isNativeHtmlTable;_stickyStyler;stickyCssClass="cdk-table-sticky";needsPositionStickyOnElement=true;_isServer;_isShowingNoDataRow=false;_hasAllOutlets=false;_hasInitialized=false;_headerRowStickyUpdates=new ee;_footerRowStickyUpdates=new ee;_disableVirtualScrolling=false;_getCellRole(){if(this._cellRoleInternal===void 0){let e=this._elementRef.nativeElement.getAttribute("role");return e==="grid"||e==="treegrid"?"gridcell":"cell"}return this._cellRoleInternal}_cellRoleInternal=void 0;get trackBy(){return this._trackByFn}set trackBy(e){this._trackByFn=e;}_trackByFn;get dataSource(){return this._dataSource}set dataSource(e){this._dataSource!==e&&(this._switchDataSource(e),this._changeDetectorRef.markForCheck());}_dataSource;_dataSourceChanges=new ee;_dataStream=new ee;get multiTemplateDataRows(){return this._multiTemplateDataRows}set multiTemplateDataRows(e){this._multiTemplateDataRows=e,this._rowOutlet&&this._rowOutlet.viewContainer.length&&(this._forceRenderDataRows(),this.updateStickyColumnStyles());}_multiTemplateDataRows=false;get fixedLayout(){return this._virtualScrollEnabled()?true:this._fixedLayout}set fixedLayout(e){this._fixedLayout=e,this._forceRecalculateCellWidths=true,this._stickyColumnStylesNeedReset=true;}_fixedLayout=false;recycleRows=false;contentChanged=new Ge;viewChange=new sr({start:0,end:Number.MAX_VALUE});_rowOutlet;_headerRowOutlet;_footerRowOutlet;_noDataRowOutlet;_contentColumnDefs;_contentRowDefs;_contentHeaderRowDefs;_contentFooterRowDefs;_noDataRow;get renderedRows(){return this._renderRows}constructor(){g(new mg("role"),{optional:true})||this._elementRef.nativeElement.setAttribute("role","table"),this._isServer=!this._platform.isBrowser,this._isNativeHtmlTable=this._elementRef.nativeElement.nodeName==="TABLE",this._dataDiffer=this._differs.find([]).create((t,n)=>this.trackBy?this.trackBy(n.dataIndex,n.data):n);}ngOnInit(){this._setupStickyStyler(),this._viewportRuler.change().pipe(ry(this._onDestroy)).subscribe(()=>{this._forceRecalculateCellWidths=true;});}ngAfterContentInit(){this._viewRepeater=this.recycleRows||this._virtualScrollEnabled()?new I:new A$1,this._virtualScrollEnabled()&&this._setupVirtualScrolling(this._virtualScrollViewport),this._hasInitialized=true;}ngAfterContentChecked(){this._canRender()&&this._render();}ngOnDestroy(){this._stickyStyler?.destroy(),[this._rowOutlet?.viewContainer,this._headerRowOutlet?.viewContainer,this._footerRowOutlet?.viewContainer,this._cachedRenderRowsMap,this._customColumnDefs,this._customRowDefs,this._customHeaderRowDefs,this._customFooterRowDefs,this._columnDefsByName].forEach(e=>{e?.clear();}),this._headerRowDefs=[],this._footerRowDefs=[],this._defaultRowDef=null,this._headerRowStickyUpdates.complete(),this._footerRowStickyUpdates.complete(),this._onDestroy.next(),this._onDestroy.complete(),G(this.dataSource)&&this.dataSource.disconnect(this);}renderRows(){this._renderRows=this._getAllRenderRows();let e=this._dataDiffer.diff(this._renderRows);if(!e){this._updateNoDataRow(),this.contentChanged.next();return}let t=this._rowOutlet.viewContainer;this._viewRepeater.applyChanges(e,t,(n,r,s)=>this._getEmbeddedViewArgs(n.item,s),n=>n.item.data,n=>{n.operation===h.INSERTED&&n.context&&this._renderCellTemplateForItem(n.record.item.rowDef,n.context);}),this._updateRowIndexContext(),e.forEachIdentityChange(n=>{let r=t.get(n.currentIndex);r.context.$implicit=n.item.data;}),this._updateNoDataRow(),this.contentChanged.next(),this.updateStickyColumnStyles();}addColumnDef(e){this._customColumnDefs.add(e);}removeColumnDef(e){this._customColumnDefs.delete(e);}addRowDef(e){this._customRowDefs.add(e);}removeRowDef(e){this._customRowDefs.delete(e);}addHeaderRowDef(e){this._customHeaderRowDefs.add(e),this._headerRowDefChanged=true;}removeHeaderRowDef(e){this._customHeaderRowDefs.delete(e),this._headerRowDefChanged=true;}addFooterRowDef(e){this._customFooterRowDefs.add(e),this._footerRowDefChanged=true;}removeFooterRowDef(e){this._customFooterRowDefs.delete(e),this._footerRowDefChanged=true;}setNoDataRow(e){this._customNoDataRow=e;}updateStickyHeaderRowStyles(){let e=this._getRenderedRows(this._headerRowOutlet);if(this._isNativeHtmlTable){let n=vt(this._headerRowOutlet,"thead");n&&(n.style.display=e.length?"":"none");}let t=this._headerRowDefs.map(n=>n.sticky);this._stickyStyler.clearStickyPositioning(e,["top"]),this._stickyStyler.stickRows(e,t,"top"),this._headerRowDefs.forEach(n=>n.resetStickyChanged());}updateStickyFooterRowStyles(){let e=this._getRenderedRows(this._footerRowOutlet);if(this._isNativeHtmlTable){let n=vt(this._footerRowOutlet,"tfoot");n&&(n.style.display=e.length?"":"none");}let t=this._footerRowDefs.map(n=>n.sticky);this._stickyStyler.clearStickyPositioning(e,["bottom"]),this._stickyStyler.stickRows(e,t,"bottom"),this._stickyStyler.updateStickyFooterContainer(this._elementRef.nativeElement,t),this._footerRowDefs.forEach(n=>n.resetStickyChanged());}updateStickyColumnStyles(){let e=this._getRenderedRows(this._headerRowOutlet),t=this._getRenderedRows(this._rowOutlet),n=this._getRenderedRows(this._footerRowOutlet);(this._isNativeHtmlTable&&!this.fixedLayout||this._stickyColumnStylesNeedReset)&&(this._stickyStyler.clearStickyPositioning([...e,...t,...n],["left","right"]),this._stickyColumnStylesNeedReset=false),e.forEach((r,s)=>{this._addStickyColumnStyles([r],this._headerRowDefs[s]);}),this._rowDefs.forEach(r=>{let s=[];for(let l=0;l<t.length;l++)this._renderRows[l].rowDef===r&&s.push(t[l]);this._addStickyColumnStyles(s,r);}),n.forEach((r,s)=>{this._addStickyColumnStyles([r],this._footerRowDefs[s]);}),Array.from(this._columnDefsByName.values()).forEach(r=>r.resetStickyChanged());}stickyColumnsUpdated(e){this._positionListener?.stickyColumnsUpdated(e);}stickyEndColumnsUpdated(e){this._positionListener?.stickyEndColumnsUpdated(e);}stickyHeaderRowsUpdated(e){this._headerRowStickyUpdates.next(e),this._positionListener?.stickyHeaderRowsUpdated(e);}stickyFooterRowsUpdated(e){this._footerRowStickyUpdates.next(e),this._positionListener?.stickyFooterRowsUpdated(e);}_outletAssigned(){!this._hasAllOutlets&&this._rowOutlet&&this._headerRowOutlet&&this._footerRowOutlet&&this._noDataRowOutlet&&(this._hasAllOutlets=true,this._canRender()&&this._render());}_canRender(){return this._hasAllOutlets&&this._hasInitialized}_render(){this._cacheRowDefs(),this._cacheColumnDefs(),!this._headerRowDefs.length&&!this._footerRowDefs.length&&this._rowDefs.length;let t=this._renderUpdatedColumns()||this._headerRowDefChanged||this._footerRowDefChanged;this._stickyColumnStylesNeedReset=this._stickyColumnStylesNeedReset||t,this._forceRecalculateCellWidths=t,this._headerRowDefChanged&&(this._forceRenderHeaderRows(),this._headerRowDefChanged=false),this._footerRowDefChanged&&(this._forceRenderFooterRows(),this._footerRowDefChanged=false),this.dataSource&&this._rowDefs.length>0&&!this._renderChangeSubscription?this._observeRenderChanges():this._stickyColumnStylesNeedReset&&this.updateStickyColumnStyles(),this._checkStickyStates();}_getAllRenderRows(){if(!Array.isArray(this._data)||!this._renderedRange)return [];let e=[],t=Math.min(this._data.length,this._renderedRange.end),n=this._cachedRenderRowsMap;this._cachedRenderRowsMap=new Map;for(let r=this._renderedRange.start;r<t;r++){let s=this._data[r],l=this._getRenderRowsForData(s,r,n.get(s));this._cachedRenderRowsMap.has(s)||this._cachedRenderRowsMap.set(s,new WeakMap);for(let c=0;c<l.length;c++){let d=l[c],u=this._cachedRenderRowsMap.get(d.data);u.has(d.rowDef)?u.get(d.rowDef).push(d):u.set(d.rowDef,[d]),e.push(d);}}return e}_getRenderRowsForData(e,t,n){return this._getRowDefs(e,t).map(s=>{let l=n&&n.has(s)?n.get(s):[];if(l.length){let c=l.shift();return c.dataIndex=t,c}else return {data:e,rowDef:s,dataIndex:t}})}_cacheColumnDefs(){this._columnDefsByName.clear(),le(this._getOwnDefs(this._contentColumnDefs),this._customColumnDefs).forEach(t=>{this._columnDefsByName.has(t.name),this._columnDefsByName.set(t.name,t);});}_cacheRowDefs(){this._headerRowDefs=le(this._getOwnDefs(this._contentHeaderRowDefs),this._customHeaderRowDefs),this._footerRowDefs=le(this._getOwnDefs(this._contentFooterRowDefs),this._customFooterRowDefs),this._rowDefs=le(this._getOwnDefs(this._contentRowDefs),this._customRowDefs);let e=this._rowDefs.filter(t=>!t.when);this._defaultRowDef=e[0];}_renderUpdatedColumns(){let e=(s,l)=>{let c=!!l.getColumnsDiff();return s||c},t=this._rowDefs.reduce(e,false);t&&this._forceRenderDataRows();let n=this._headerRowDefs.reduce(e,false);n&&this._forceRenderHeaderRows();let r=this._footerRowDefs.reduce(e,false);return r&&this._forceRenderFooterRows(),t||n||r}_switchDataSource(e){this._data=[],G(this.dataSource)&&this.dataSource.disconnect(this),this._renderChangeSubscription&&(this._renderChangeSubscription.unsubscribe(),this._renderChangeSubscription=null),e||(this._dataDiffer&&this._dataDiffer.diff([]),this._rowOutlet&&this._rowOutlet.viewContainer.clear()),this._dataSource=e;}_observeRenderChanges(){if(!this.dataSource)return;let e;G(this.dataSource)?e=this.dataSource.connect(this):Rm(this.dataSource)?e=this.dataSource:Array.isArray(this.dataSource)&&(e=qs(this.dataSource)),this._renderChangeSubscription=Vm([e,this.viewChange]).pipe(ry(this._onDestroy)).subscribe(([t,n])=>{this._data=t||[],this._renderedRange=n,this._dataStream.next(t),this.renderRows();});}_forceRenderHeaderRows(){this._headerRowOutlet.viewContainer.length>0&&this._headerRowOutlet.viewContainer.clear(),this._headerRowDefs.forEach((e,t)=>this._renderRow(this._headerRowOutlet,e,t)),this.updateStickyHeaderRowStyles();}_forceRenderFooterRows(){this._footerRowOutlet.viewContainer.length>0&&this._footerRowOutlet.viewContainer.clear(),this._footerRowDefs.forEach((e,t)=>this._renderRow(this._footerRowOutlet,e,t)),this.updateStickyFooterRowStyles();}_addStickyColumnStyles(e,t){let n=Array.from(t?.columns||[]).map(l=>{let c=this._columnDefsByName.get(l);return c}),r=n.map(l=>l.sticky),s=n.map(l=>l.stickyEnd);this._stickyStyler.updateStickyColumns(e,r,s,!this.fixedLayout||this._forceRecalculateCellWidths);}_getRenderedRows(e){let t=[];for(let n=0;n<e.viewContainer.length;n++){let r=e.viewContainer.get(n);t.push(r.rootNodes[0]);}return t}_getRowDefs(e,t){if(this._rowDefs.length===1)return [this._rowDefs[0]];let n=[];if(this.multiTemplateDataRows)n=this._rowDefs.filter(r=>!r.when||r.when(t,e));else {let r=this._rowDefs.find(s=>s.when&&s.when(t,e))||this._defaultRowDef;r&&n.push(r);}return n.length,n}_getEmbeddedViewArgs(e,t){let n=e.rowDef,r={$implicit:e.data};return {templateRef:n.template,context:r,index:t}}_renderRow(e,t,n,r={}){let s=e.viewContainer.createEmbeddedView(t.template,r,n);return this._renderCellTemplateForItem(t,r),s}_renderCellTemplateForItem(e,t){for(let n of this._getCellTemplates(e))A.mostRecentCellOutlet&&A.mostRecentCellOutlet._viewContainer.createEmbeddedView(n,t);this._changeDetectorRef.markForCheck();}_updateRowIndexContext(){let e=this._rowOutlet.viewContainer;for(let t=0,n=e.length;t<n;t++){let s=e.get(t).context;s.count=n,s.first=t===0,s.last=t===n-1,s.even=t%2===0,s.odd=!s.even,this.multiTemplateDataRows?(s.dataIndex=this._renderRows[t].dataIndex,s.renderIndex=t):s.index=this._renderRows[t].dataIndex;}}_getCellTemplates(e){return !e||!e.columns?[]:Array.from(e.columns,t=>{let n=this._columnDefsByName.get(t);return e.extractCellTemplate(n)})}_forceRenderDataRows(){this._dataDiffer.diff([]),this._rowOutlet.viewContainer.clear(),this.renderRows();}_checkStickyStates(){let e=(t,n)=>t||n.hasStickyChanged();this._headerRowDefs.reduce(e,false)&&this.updateStickyHeaderRowStyles(),this._footerRowDefs.reduce(e,false)&&this.updateStickyFooterRowStyles(),Array.from(this._columnDefsByName.values()).reduce(e,false)&&(this._stickyColumnStylesNeedReset=true,this.updateStickyColumnStyles());}_setupStickyStyler(){let e=this._dir?this._dir.value:"ltr",t=this._injector;this._stickyStyler=new De(this._isNativeHtmlTable,this.stickyCssClass,this._platform.isBrowser,this.needsPositionStickyOnElement,e,this,t),(this._dir?this._dir.change:qs()).pipe(ry(this._onDestroy)).subscribe(n=>{this._stickyStyler.direction=n,this.updateStickyColumnStyles();});}_setupVirtualScrolling(e){let t=typeof requestAnimationFrame<"u"?Cm:wm;this.viewChange.next({start:0,end:0}),e.renderedRangeStream.pipe(zm(0,t),ry(this._onDestroy)).subscribe(this.viewChange),e.attach({dataStream:this._dataStream,measureRangeSize:(n,r)=>this._measureRangeSize(n,r)}),Vm([e.renderedContentOffset,this._headerRowStickyUpdates]).pipe(ry(this._onDestroy)).subscribe(([n,r])=>{if(!(!r.sizes||!r.offsets||!r.elements))for(let s=0;s<r.elements.length;s++){let l=r.elements[s];if(l){let c=r.offsets[s],d=n!==0?Math.max(n-c,c):-c;for(let u of l)u.style.top=`${-d}px`;}}}),Vm([e.renderedContentOffset,this._footerRowStickyUpdates]).pipe(ry(this._onDestroy)).subscribe(([n,r])=>{if(!(!r.sizes||!r.offsets||!r.elements))for(let s=0;s<r.elements.length;s++){let l=r.elements[s];if(l)for(let c of l)c.style.bottom=`${n+r.offsets[s]}px`;}});}_getOwnDefs(e){return e.filter(t=>!t._table||t._table===this)}_updateNoDataRow(){let e=this._customNoDataRow||this._noDataRow;if(!e)return;let t=this._rowOutlet.viewContainer.length===0;if(t===this._isShowingNoDataRow)return;let n=this._noDataRowOutlet.viewContainer;if(t){let r=n.createEmbeddedView(e.templateRef),s=r.rootNodes[0];if(r.rootNodes.length===1&&s?.nodeType===this._document.ELEMENT_NODE){s.setAttribute("role","row"),s.classList.add(...e._contentClassNames);let l=s.querySelectorAll(e._cellSelector);for(let c=0;c<l.length;c++)l[c].classList.add(...e._cellClassNames);}}else n.clear();this._isShowingNoDataRow=t,this._changeDetectorRef.markForCheck();}_measureRangeSize(e,t){if(e.start>=e.end||t!=="vertical")return 0;let n=this.viewChange.value,r=this._rowOutlet.viewContainer;e.start<n.start||e.end>n.end;let s=e.start-n.start,l=e.end-e.start,c,d;for(let h=0;h<l;h++){let p=r.get(h+s);if(p&&p.rootNodes.length){c=d=p.rootNodes[0];break}}for(let h=l-1;h>-1;h--){let p=r.get(h+s);if(p&&p.rootNodes.length){d=p.rootNodes[p.rootNodes.length-1];break}}let u=c?.getBoundingClientRect?.(),D=d?.getBoundingClientRect?.();return u&&D?D.bottom-u.top:0}_virtualScrollEnabled(){return !this._disableVirtualScrolling&&this._virtualScrollViewport!=null}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=wI({type:i,selectors:[["cdk-table"],["table","cdk-table",""]],contentQueries:function(t,n,r){if(t&1&&Kh(r,kt,5)(r,$,5)(r,ue,5)(r,J,5)(r,be,5),t&2){let s;uw(s=lw())&&(n._noDataRow=s.first),uw(s=lw())&&(n._contentColumnDefs=s),uw(s=lw())&&(n._contentRowDefs=s),uw(s=lw())&&(n._contentHeaderRowDefs=s),uw(s=lw())&&(n._contentFooterRowDefs=s);}},hostAttrs:[1,"cdk-table"],hostVars:2,hostBindings:function(t,n){t&2&&og("cdk-table-fixed-layout",n.fixedLayout);},inputs:{trackBy:"trackBy",dataSource:"dataSource",multiTemplateDataRows:[2,"multiTemplateDataRows","multiTemplateDataRows",J1],fixedLayout:[2,"fixedLayout","fixedLayout",J1],recycleRows:[2,"recycleRows","recycleRows",J1]},outputs:{contentChanged:"contentChanged"},exportAs:["cdkTable"],features:[Hw([{provide:M,useExisting:i},{provide:K,useValue:null}])],ngContentSelectors:Ht,decls:5,vars:2,consts:[["role","rowgroup"],["headerRowOutlet",""],["rowOutlet",""],["noDataRowOutlet",""],["footerRowOutlet",""]],template:function(t,n){t&1&&(sw(Lt),aw(0),aw(1,1),GI(2,zt,1,0),GI(3,Bt,7,0)(4,jt,4,0)),t&2&&(GD(2),zI(n._isServer?2:-1),GD(),zI(n._isNativeHtmlTable?3:4));},dependencies:[Me,xe,Ee,Te],styles:[`.cdk-table-fixed-layout {
  table-layout: fixed;
}
`],encapsulation:2,changeDetection:1})}return i})();function le(i,o){return i.concat(Array.from(o))}function vt(i,o){let e=o.toUpperCase(),t=i.viewContainer.element.nativeElement;for(;t;){let n=t.nodeType===1?t.nodeName:null;if(n===e)return t;if(n==="TABLE")break;t=t.parentNode;}return null}var St=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=ss({type:i});static \u0275inj=Dr({imports:[et]})}return i})();var Wt=[[["caption"]],[["colgroup"],["col"]],"*"],Vt=["caption","colgroup, col","*"];function Qt(i,o){i&1&&aw(0,2);}function $t(i,o){i&1&&(qi(0,"thead",0),Wh(1,1),ju(),qi(2,"tbody",2),Wh(3,3)(4,4),ju(),qi(5,"tfoot",0),Wh(6,5),ju());}function qt(i,o){i&1&&Wh(0,1)(1,3)(2,4)(3,5);}var rn=(()=>{class i extends Fe{stickyCssClass="mat-mdc-table-sticky";needsPositionStickyOnElement=false;static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275cmp=wI({type:i,selectors:[["mat-table"],["table","mat-table",""]],hostAttrs:[1,"mat-mdc-table","mdc-data-table__table"],hostVars:2,hostBindings:function(t,n){t&2&&og("mat-table-fixed-layout",n.fixedLayout);},exportAs:["matTable"],features:[Hw([{provide:Fe,useExisting:i},{provide:M,useExisting:i},{provide:K,useValue:null}]),Fh],ngContentSelectors:Vt,decls:5,vars:2,consts:[["role","rowgroup"],["headerRowOutlet",""],["role","rowgroup",1,"mdc-data-table__content"],["rowOutlet",""],["noDataRowOutlet",""],["footerRowOutlet",""]],template:function(t,n){t&1&&(sw(Wt),aw(0),aw(1,1),GI(2,Qt,1,0),GI(3,$t,7,0)(4,qt,4,0)),t&2&&(GD(2),zI(n._isServer?2:-1),GD(),zI(n._isNativeHtmlTable?3:4));},dependencies:[Me,xe,Ee,Te],styles:[`.mat-mdc-table-sticky {
  position: sticky !important;
}

mat-table {
  display: block;
}

mat-header-row {
  min-height: var(--mat-table-header-container-height, 56px);
}

mat-row {
  min-height: var(--mat-table-row-item-container-height, 52px);
}

mat-footer-row {
  min-height: var(--mat-table-footer-container-height, 52px);
}

mat-row, mat-header-row, mat-footer-row {
  display: flex;
  border-width: 0;
  border-bottom-width: 1px;
  border-style: solid;
  align-items: center;
  box-sizing: border-box;
}

mat-cell:first-of-type, mat-header-cell:first-of-type, mat-footer-cell:first-of-type {
  padding-left: 24px;
}
[dir=rtl] mat-cell:first-of-type:not(:only-of-type), [dir=rtl] mat-header-cell:first-of-type:not(:only-of-type), [dir=rtl] mat-footer-cell:first-of-type:not(:only-of-type) {
  padding-left: 0;
  padding-right: 24px;
}
mat-cell:last-of-type, mat-header-cell:last-of-type, mat-footer-cell:last-of-type {
  padding-right: 24px;
}
[dir=rtl] mat-cell:last-of-type:not(:only-of-type), [dir=rtl] mat-header-cell:last-of-type:not(:only-of-type), [dir=rtl] mat-footer-cell:last-of-type:not(:only-of-type) {
  padding-right: 0;
  padding-left: 24px;
}

mat-cell, mat-header-cell, mat-footer-cell {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  word-wrap: break-word;
  min-height: inherit;
}

.mat-mdc-table {
  min-width: 100%;
  border: 0;
  border-spacing: 0;
  table-layout: auto;
  white-space: normal;
  background-color: var(--mat-table-background-color, var(--mat-sys-surface));
}

.mat-table-fixed-layout {
  table-layout: fixed;
}

.mdc-data-table__cell {
  box-sizing: border-box;
  overflow: hidden;
  text-align: start;
  text-overflow: ellipsis;
}

.mdc-data-table__cell,
.mdc-data-table__header-cell {
  padding: 0 16px;
}

.mat-mdc-header-row {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  height: var(--mat-table-header-container-height, 56px);
  color: var(--mat-table-header-headline-color, var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
  font-family: var(--mat-table-header-headline-font, var(--mat-sys-title-small-font, Roboto, sans-serif));
  line-height: var(--mat-table-header-headline-line-height, var(--mat-sys-title-small-line-height));
  font-size: var(--mat-table-header-headline-size, var(--mat-sys-title-small-size, 14px));
  font-weight: var(--mat-table-header-headline-weight, var(--mat-sys-title-small-weight, 500));
}

.mat-mdc-row {
  height: var(--mat-table-row-item-container-height, 52px);
  color: var(--mat-table-row-item-label-text-color, var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
}

.mat-mdc-row,
.mdc-data-table__content {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: var(--mat-table-row-item-label-text-font, var(--mat-sys-body-medium-font, Roboto, sans-serif));
  line-height: var(--mat-table-row-item-label-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-table-row-item-label-text-size, var(--mat-sys-body-medium-size, 14px));
  font-weight: var(--mat-table-row-item-label-text-weight, var(--mat-sys-body-medium-weight));
}

.mat-mdc-footer-row {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  height: var(--mat-table-footer-container-height, 52px);
  color: var(--mat-table-row-item-label-text-color, var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
  font-family: var(--mat-table-footer-supporting-text-font, var(--mat-sys-body-medium-font, Roboto, sans-serif));
  line-height: var(--mat-table-footer-supporting-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-table-footer-supporting-text-size, var(--mat-sys-body-medium-size, 14px));
  font-weight: var(--mat-table-footer-supporting-text-weight, var(--mat-sys-body-medium-weight));
  letter-spacing: var(--mat-table-footer-supporting-text-tracking, var(--mat-sys-body-medium-tracking));
}

.mat-mdc-header-cell {
  border-bottom-color: var(--mat-table-row-item-outline-color, var(--mat-sys-outline, rgba(0, 0, 0, 0.12)));
  border-bottom-width: var(--mat-table-row-item-outline-width, 1px);
  border-bottom-style: solid;
  letter-spacing: var(--mat-table-header-headline-tracking, var(--mat-sys-title-small-tracking));
  font-weight: inherit;
  line-height: inherit;
  box-sizing: border-box;
  text-overflow: ellipsis;
  overflow: hidden;
  outline: none;
  text-align: start;
}
.mdc-data-table__row:last-child > .mat-mdc-header-cell {
  border-bottom: none;
}

.mat-mdc-cell {
  border-bottom-color: var(--mat-table-row-item-outline-color, var(--mat-sys-outline, rgba(0, 0, 0, 0.12)));
  border-bottom-width: var(--mat-table-row-item-outline-width, 1px);
  border-bottom-style: solid;
  letter-spacing: var(--mat-table-row-item-label-text-tracking, var(--mat-sys-body-medium-tracking));
  line-height: inherit;
}
.mdc-data-table__row:last-child > .mat-mdc-cell {
  border-bottom: none;
}

.mat-mdc-footer-cell {
  letter-spacing: var(--mat-table-row-item-label-text-tracking, var(--mat-sys-body-medium-tracking));
}

mat-row.mat-mdc-row,
mat-header-row.mat-mdc-header-row,
mat-footer-row.mat-mdc-footer-row {
  border-bottom: none;
}

.mat-mdc-table tbody,
.mat-mdc-table tfoot,
.mat-mdc-table thead,
.mat-mdc-cell,
.mat-mdc-footer-cell,
.mat-mdc-header-row,
.mat-mdc-row,
.mat-mdc-footer-row,
.mat-mdc-table .mat-mdc-header-cell {
  background: inherit;
}

.mat-mdc-table mat-header-row.mat-mdc-header-row,
.mat-mdc-table mat-row.mat-mdc-row,
.mat-mdc-table mat-footer-row.mat-mdc-footer-cell {
  height: unset;
}

mat-header-cell.mat-mdc-header-cell,
mat-cell.mat-mdc-cell,
mat-footer-cell.mat-mdc-footer-cell {
  align-self: stretch;
}
`],encapsulation:2,changeDetection:1})}return i})(),on=(()=>{class i extends de{static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275dir=xu({type:i,selectors:[["","matCellDef",""]],features:[Hw([{provide:de,useExisting:i}]),Fh]})}return i})(),sn=(()=>{class i extends me{static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275dir=xu({type:i,selectors:[["","matHeaderCellDef",""]],features:[Hw([{provide:me,useExisting:i}]),Fh]})}return i})();var an=(()=>{class i extends ${get name(){return this._name}set name(e){this._setNameInput(e);}_updateColumnCssClassName(){super._updateColumnCssClassName(),this._columnCssClassName.push(`mat-column-${this.cssClassFriendlyName}`);}static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275dir=xu({type:i,selectors:[["","matColumnDef",""]],inputs:{name:[0,"matColumnDef","name"]},features:[Hw([{provide:$,useExisting:i}]),Fh]})}return i})(),ln=(()=>{class i extends Rt{static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275dir=xu({type:i,selectors:[["mat-header-cell"],["th","mat-header-cell",""]],hostAttrs:["role","columnheader",1,"mat-mdc-header-cell","mdc-data-table__header-cell"],features:[Fh]})}return i})();var cn=(()=>{class i extends bt{static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275dir=xu({type:i,selectors:[["mat-cell"],["td","mat-cell",""]],hostAttrs:[1,"mat-mdc-cell","mdc-data-table__cell"],features:[Fh]})}return i})();var dn=(()=>{class i extends J{static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275dir=xu({type:i,selectors:[["","matHeaderRowDef",""]],inputs:{columns:[0,"matHeaderRowDef","columns"],sticky:[2,"matHeaderRowDefSticky","sticky",J1]},features:[Hw([{provide:J,useExisting:i}]),Fh]})}return i})();var mn=(()=>{class i extends ue{static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275dir=xu({type:i,selectors:[["","matRowDef",""]],inputs:{columns:[0,"matRowDefColumns","columns"],when:[0,"matRowDefWhen","when"]},features:[Hw([{provide:ue,useExisting:i}]),Fh]})}return i})(),un=(()=>{class i extends ke{static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275cmp=wI({type:i,selectors:[["mat-header-row"],["tr","mat-header-row",""]],hostAttrs:["role","row",1,"mat-mdc-header-row","mdc-data-table__header-row"],exportAs:["matHeaderRow"],features:[Hw([{provide:ke,useExisting:i}]),Fh],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,n){t&1&&Wh(0,0);},dependencies:[A],encapsulation:2,changeDetection:1})}return i})();var fn=(()=>{class i extends Se{static \u0275fac=(()=>{let e;return function(n){return (e||(e=cp(i)))(n||i)}})();static \u0275cmp=wI({type:i,selectors:[["mat-row"],["tr","mat-row",""]],hostAttrs:["role","row",1,"mat-mdc-row","mdc-data-table__row"],exportAs:["matRow"],features:[Hw([{provide:Se,useExisting:i}]),Fh],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,n){t&1&&Wh(0,0);},dependencies:[A],encapsulation:2,changeDetection:1})}return i})();var hn=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=ss({type:i});static \u0275inj=Dr({imports:[St,xe$1]})}return i})();export{Gt as G,Kt as K,ae as a,an as b,cn as c,dn as d,ai as e,fn as f,si as g,hn as h,ln as l,mn as m,on as o,rn as r,sn as s,un as u,wt as w};