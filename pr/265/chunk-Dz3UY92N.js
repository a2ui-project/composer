import {P as Qe$1,S as We,cM as gc,V as rr,y,ap as Ur,bG as Ro,b as Be,bw as Ie,Y as Ue,bx as Sn,bz as Ye$1,as as de,bo as j,cN as ai,cO as CBe,bJ as ds,t as tn$1,bE as wn,cP as mc,z as zt,cQ as Af,bm as yt,c9 as jn,bS as Ot,a0 as Rs,a1 as Zr,T as Tr,aQ as Cl,G as Gr,o as ei,r as dr,H as Hd,aj as Ar,D as Bn,bt as Gd,a4 as eg,a5 as tg,a3 as Xk,bv as Lf,aq as Os,bN as Ze,bO as Xr,bP as az,bZ as lg,cR as ga,bL as BC,bC as $s,ag as Ri,ai as Oi,$ as $d,u as jd,cS as VN,l as wo,bn as gE,a6 as Te,cT as rf,e as eu,_ as _v,j as jl,aJ as g,J as j$1,E as En,bg as jN,R as Re,W as Wt,ab as NRe,af as qe$1,cU as tS,c as Wo,ad as pz,ae as Ct,cV as Cv,al as tN,am as R6,cW as eR,ah as ki,a7 as S6,cX as Yk,a8 as jA,a9 as T6,aa as HA,cY as Ud,N as Ni,bH as Va,cZ as Vw,bk as ln$1,c8 as Hr,c_ as zO}from'./main.js';var en=["previewIframe"];function nn(i,t){if(i&1){let e=S6();Ri(0,"iframe",4,0),Yk("load",function(){jA(e);let a=T6();return HA(a.syncPayloadOnIframeLoad())}),Oi();}if(i&2){let e=T6();gE("min-height",e.frameHeightPx()),Ud("src",e.safeRendererUrl(),zO);}}function tn(i,t){i&1&&(Ri(0,"div",3),Ni(1,"Rendered UI Placeholder"),Oi());}var an=16,Qe=500,qe=class i{sanitizer=y(rf);startupResolution=y(eu);hostCommunication=y(_v);configProvider=y(jl);chatState=y(g);stateSync=y(j$1);errorLogger=y(En);logger=this.errorLogger.withTag("[RenderedFrame]");payload=jN(null);fillContainer=jN(false);dynamicHeight=Re(null);growthBreakerLatched=Re(false);isGrowthBreakerLatched=this.growthBreakerLatched.asReadonly();growthRunStartHeight=null;lastReportedHeight=null;lastReportTimestamp=0;growthRunLength=0;trackedRendererUrl=void 0;lastHandledResetNonce=this.stateSync.sessionResetNonce();frameHeight=Wt(()=>{if(this.fillContainer())return null;let t=this.dynamicHeight();return t&&t>0?t:null});frameHeightPx=Wt(()=>{let t=this.frameHeight();return t===null?void 0:`${t}px`});isLocked=this.chatState.isProgrammaticStreamActive;iframeRef=NRe("previewIframe");safeRendererUrl=Wt(()=>{let t=this.startupResolution.resolvedUrl();if(!t)return null;try{let e=globalThis.location?.origin||void 0,n=new URL(t,e);n.searchParams.delete("origin");let a=new Set;e&&a.add(e);let r=globalThis.location?.ancestorOrigins;if(r)for(let y=0;y<r.length;y++)r[y]&&a.add(r[y]);for(let y of a)n.searchParams.append("origin",y);let s=qe$1(()=>this.configProvider.themePreference());n.searchParams.set("theme",s);let z=n.toString();return tS(z)?this.sanitizer.bypassSecurityTrustResourceUrl(z):(this.logger.error("Renderer URL failed safe validation:",z),null)}catch(e){return this.logger.error("Failed to parse renderer URL:",e),null}});constructor(){Wo(t=>{let n=this.iframeRef()?.nativeElement??null;n&&(this.resetGrowthRun(),this.hostCommunication.registerIframe(n),t(()=>{this.hostCommunication.unregisterIframe(n);}));}),Wo(()=>{let t=this.configProvider.themePreference();this.hostCommunication.sendTheme(t);}),Wo(()=>{let t=this.payload(),e=this.iframeRef()?.nativeElement;e&&t!==null&&Array.isArray(t)&&t.length>0&&(this.hostCommunication.sendRenderA2UI(t,e),this.resetGrowthRun());}),this.hostCommunication.messageStream$.pipe(pz()).subscribe(t=>{this.trackReportedGrowth(t),this.handleInboundEnvelope(t);}),Wo(()=>{let t=this.startupResolution.resolvedUrl();qe$1(()=>{this.trackedRendererUrl!==void 0&&t!==this.trackedRendererUrl&&this.resetGrowthBreaker(),this.trackedRendererUrl=t;});}),Wo(()=>{let t=this.stateSync.sessionResetNonce();t>this.lastHandledResetNonce&&(this.lastHandledResetNonce=t,qe$1(()=>{this.dynamicHeight.set(null),this.resetGrowthBreaker();}));});}handleInboundEnvelope(t){if(!t)return;let e=qe$1(()=>this.iframeRef()?.nativeElement),n=e?.contentWindow;if(!(t.sourceWindow&&n&&t.sourceWindow!==n)){if(t.type===Ct.RENDERER_READY||t.type===Ct.A2UI_CATALOG){let a=qe$1(()=>this.payload());e&&a!==null&&Array.isArray(a)&&a.length>0&&this.hostCommunication.sendRenderA2UI(a,e);}else if(t.type===Ct.SURFACE_RESIZE&&!qe$1(()=>this.fillContainer())&&Cv.validateIncomingMessage(t,void 0,this.logger)){let a=t.payload;this.dynamicHeight.set(this.capReportedHeight(a.height));}}}trackReportedGrowth(t){if(!t||qe$1(()=>this.fillContainer()))return;let e=qe$1(()=>this.iframeRef()?.nativeElement)?.contentWindow;if(t.sourceWindow&&e&&t.sourceWindow!==e)return;if(t.type===Ct.RENDERER_READY){this.resetGrowthBreaker();return}if(t.type===Ct.RENDER_SUCCESS){this.resetGrowthRun();return}if(t.type!==Ct.SURFACE_RESIZE||!Cv.validateIncomingMessage(t,void 0,this.logger))return;let n=t.payload.height;this.lastReportedHeight!==null&&n>this.lastReportedHeight&&t.timestamp-this.lastReportTimestamp<=Qe?this.growthRunLength++:(this.growthRunLength=1,this.growthRunStartHeight=n),this.lastReportedHeight=n,this.lastReportTimestamp=t.timestamp,this.growthRunLength>=an&&!this.growthBreakerLatched()&&(this.growthBreakerLatched.set(true),this.errorLogger.warn({message:`Preview frame growth stopped: the renderer reported ${this.growthRunLength} consecutive larger heights within ${Qe}ms, which is a runaway resize loop. Frame held at ${qe$1(()=>this.dynamicHeight())??this.growthRunStartHeight}px; last reported height ${n}px.`,sourceTag:"[Shell]"}));}capReportedHeight(t){if(!qe$1(()=>this.growthBreakerLatched()))return t;let e=qe$1(()=>this.dynamicHeight())??this.growthRunStartHeight;return e===null?t:Math.min(t,e)}resetGrowthRun(){this.growthRunLength=0,this.growthRunStartHeight=null,this.lastReportedHeight=null,this.lastReportTimestamp=0;}resetGrowthBreaker(){this.resetGrowthRun(),this.growthBreakerLatched.set(false);}setupIframeWheelForwarding(t){try{t.contentWindow?.addEventListener("wheel",e=>{let n=t.closest(".chat-history-container, .side-canvas-viewport");n&&n.scrollBy({top:e.deltaY,left:e.deltaX,behavior:"auto"});},{passive:!0});}catch{}}syncPayloadOnIframeLoad(){let t=this.payload(),e=this.iframeRef()?.nativeElement;e&&(this.setupIframeWheelForwarding(e),this.resetGrowthRun(),t!==null&&Array.isArray(t)&&t.length>0&&this.hostCommunication.sendRenderA2UI(t,e));}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=zt({type:i,selectors:[["a2ui-composer-rendered-frame"]],viewQuery:function(e,n){e&1&&tN(n.iframeRef,en,5),e&2&&R6();},inputs:{payload:[1,"payload"],fillContainer:[1,"fillContainer"]},decls:3,vars:9,consts:[["previewIframe",""],[1,"rendered-frame-container"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"src","min-height"],[1,"rendered-frame-placeholder"],["sandbox","allow-scripts allow-same-origin allow-forms","title","Rendered Preview",1,"preview-iframe",3,"load","src"]],template:function(e,n){e&1&&(Ri(0,"div",1),$d(1,nn,2,3,"iframe",2)(2,tn,2,0,"div",3),Oi()),e&2&&(gE("height",n.frameHeightPx()??"100%")("min-height",n.frameHeightPx()),Bn("is-locked",n.isLocked())("fill-container",n.fillContainer()),ei(),jd(n.safeRendererUrl()?1:2));},styles:['[_nghost-%COMP%]{display:block;width:100%;height:100%}.rendered-frame-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;width:100%;height:100%;min-height:280px;container-type:inline-size;container-name:renderedFrame;overflow:hidden;background-color:var(--mat-sys-surface);position:relative}.rendered-frame-container.is-locked[_ngcontent-%COMP%]{pointer-events:none;-webkit-user-select:none;user-select:none}.rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{content:"Gemini is generating visual updates...";position:absolute;top:0;left:0;width:100%;height:100%;background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);z-index:10;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:var(--mat-sys-primary);font-family:Roboto,sans-serif;animation:_ngcontent-%COMP%_fadeInLockout .2s ease-out}.rendered-frame-container[_ngcontent-%COMP%]   .preview-iframe[_ngcontent-%COMP%]{flex:1 1 auto;width:100%;height:100%;min-height:280px;border:none;display:block;isolation:isolate}.rendered-frame-container.fill-container[_ngcontent-%COMP%], .rendered-frame-container.fill-container[_ngcontent-%COMP%]   .preview-iframe[_ngcontent-%COMP%]{min-height:0}.rendered-frame-container[_ngcontent-%COMP%]   .rendered-frame-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--mat-sys-on-surface-variant);font-family:sans-serif}@container renderedFrame (max-width: 400px){.rendered-frame-container[_ngcontent-%COMP%]{border-radius:0}}@keyframes _ngcontent-%COMP%_fadeInLockout{0%{opacity:0;-webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px)}to{opacity:1;-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px)}}.dark-theme[_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .rendered-frame-container[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container)}.dark-theme[_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after, .dark-theme   [_nghost-%COMP%]   .rendered-frame-container.is-locked[_ngcontent-%COMP%]:after{background-color:color-mix(in srgb,var(--mat-sys-surface) 75%,transparent);color:var(--mat-sys-primary)}']})};var X=new j("CdkAccordion"),Ye=(()=>{class i{_stateChanges=new de;_openCloseAllActions=new de;id=y(ai).getId("cdk-accordion-");multi=false;openAll(){this.multi&&this._openCloseAllActions.next(true);}closeAll(){this._openCloseAllActions.next(false);}ngOnChanges(e){this._stateChanges.next(e);}ngOnDestroy(){this._stateChanges.complete(),this._openCloseAllActions.complete();}static \u0275fac=function(n){return new(n||i)};static \u0275dir=Te({type:i,selectors:[["cdk-accordion"],["","cdkAccordion",""]],inputs:{multi:[2,"multi","multi",Ot]},exportAs:["cdkAccordion"],features:[Ar([{provide:X,useExisting:i}]),jn]})}return i})(),Ke=(()=>{class i{accordion=y(X,{optional:true,skipSelf:true});_changeDetectorRef=y(Os);_expansionDispatcher=y(CBe);_openCloseAllSubscription=Ze.EMPTY;closed=new Ye$1;opened=new Ye$1;destroyed=new Ye$1;expandedChange=new Ye$1;id=y(ai).getId("cdk-accordion-child-");get expanded(){return this._expanded}set expanded(e){if(this._expanded!==e){if(this._expanded=e,this.expandedChange.emit(e),e){this.opened.emit();let n=this.accordion?this.accordion.id:this.id;this._expansionDispatcher.notify(this.id,n);}else this.closed.emit();this._changeDetectorRef.markForCheck();}}_expanded=false;get disabled(){return this._disabled()}set disabled(e){this._disabled.set(e);}_disabled=Re(false);_removeUniqueSelectionListener=()=>{};ngOnInit(){this._removeUniqueSelectionListener=this._expansionDispatcher.listen((e,n)=>{this.accordion&&!this.accordion.multi&&this.accordion.id===n&&this.id!==e&&(this.expanded=false);}),this.accordion&&(this._openCloseAllSubscription=this._subscribeToOpenCloseAllActions());}ngOnDestroy(){this.opened.complete(),this.closed.complete(),this.destroyed.emit(),this.destroyed.complete(),this._removeUniqueSelectionListener(),this._openCloseAllSubscription.unsubscribe();}toggle(){this.disabled||(this.expanded=!this.expanded);}close(){this.disabled||(this.expanded=false);}open(){this.disabled||(this.expanded=true);}_subscribeToOpenCloseAllActions(){return this.accordion._openCloseAllActions.subscribe(e=>{this.disabled||(this.expanded=e);})}static \u0275fac=function(n){return new(n||i)};static \u0275dir=Te({type:i,selectors:[["cdk-accordion-item"],["","cdkAccordionItem",""]],inputs:{expanded:[2,"expanded","expanded",Ot],disabled:[2,"disabled","disabled",Ot]},outputs:{closed:"closed",opened:"opened",destroyed:"destroyed",expandedChange:"expandedChange"},exportAs:["cdkAccordionItem"],features:[Ar([{provide:X,useValue:void 0}])]})}return i})(),Xe=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=Qe$1({type:i});static \u0275inj=We({})}return i})();var sn=["body"],dn=["bodyWrapper"],ln=[[["mat-expansion-panel-header"]],"*",[["mat-action-row"]]],pn=["mat-expansion-panel-header","*","mat-action-row"];function cn(i,t){}var mn=[[["mat-panel-title"]],[["mat-panel-description"]],"*"],hn=["mat-panel-title","mat-panel-description","*"];function gn(i,t){i&1&&(Ri(0,"span",1),eR(),Ri(1,"svg",2),ki(2,"path",3),Oi()());}var $=new j("MAT_ACCORDION"),$e=new j("MAT_EXPANSION_PANEL"),un=(()=>{class i{_template=y(Hr);_expansionPanel=y($e,{optional:true});static \u0275fac=function(n){return new(n||i)};static \u0275dir=Te({type:i,selectors:[["ng-template","matExpansionPanelContent",""]]})}return i})(),Je=new j("MAT_EXPANSION_PANEL_DEFAULT_OPTIONS"),fn=(()=>{class i extends Ke{_viewContainerRef=y(Ur);_animationsDisabled=Ro();_document=y(Be);_ngZone=y(Ie);_elementRef=y(Ue);_renderer=y(Sn);_cleanupTransitionEnd;get hideToggle(){return this._hideToggle||this.accordion&&this.accordion.hideToggle}set hideToggle(e){this._hideToggle=e;}_hideToggle=false;get togglePosition(){return this._togglePosition||this.accordion&&this.accordion.togglePosition}set togglePosition(e){this._togglePosition=e;}_togglePosition;afterExpand=new Ye$1;afterCollapse=new Ye$1;_inputChanges=new de;accordion=y($,{optional:true,skipSelf:true});_lazyContent;_body;_bodyWrapper;_portal;_headerId=y(ai).getId("mat-expansion-panel-header-");constructor(){super();let e=y(Je,{optional:true});this._expansionDispatcher=y(CBe),e&&(this.hideToggle=e.hideToggle);}_hasSpacing(){return this.accordion?this.expanded&&this.accordion.displayMode==="default":false}_getExpandedState(){return this.expanded?"expanded":"collapsed"}toggle(){this.expanded=!this.expanded;}close(){this.expanded=false;}open(){this.expanded=true;}ngAfterContentInit(){this._lazyContent&&this._lazyContent._expansionPanel===this&&this.opened.pipe(ds(null),tn$1(()=>this.expanded&&!this._portal),wn(1)).subscribe(()=>{this._portal=new mc(this._lazyContent._template,this._viewContainerRef);}),this._setupAnimationEvents();}ngOnChanges(e){this._inputChanges.next(e);}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTransitionEnd?.(),this._inputChanges.complete();}_containsFocus(){if(this._body){let e=this._document.activeElement,n=this._body.nativeElement;return e===n||n.contains(e)}return  false}_transitionEndListener=({target:e,propertyName:n})=>{e===this._bodyWrapper?.nativeElement&&n==="grid-template-rows"&&this._ngZone.run(()=>{this.expanded?this.afterExpand.emit():this.afterCollapse.emit();});};_setupAnimationEvents(){this._ngZone.runOutsideAngular(()=>{this._animationsDisabled?(this.opened.subscribe(()=>this._ngZone.run(()=>this.afterExpand.emit())),this.closed.subscribe(()=>this._ngZone.run(()=>this.afterCollapse.emit()))):setTimeout(()=>{let e=this._elementRef.nativeElement;this._cleanupTransitionEnd=this._renderer.listen(e,"transitionend",this._transitionEndListener),e.classList.add("mat-expansion-panel-animations-enabled");},200);});}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=zt({type:i,selectors:[["mat-expansion-panel"]],contentQueries:function(n,a,r){if(n&1&&Xk(r,un,5),n&2){let s;eg(s=tg())&&(a._lazyContent=s.first);}},viewQuery:function(n,a){if(n&1&&Gd(sn,5)(dn,5),n&2){let r;eg(r=tg())&&(a._body=r.first),eg(r=tg())&&(a._bodyWrapper=r.first);}},hostAttrs:[1,"mat-expansion-panel"],hostVars:4,hostBindings:function(n,a){n&2&&Bn("mat-expanded",a.expanded)("mat-expansion-panel-spacing",a._hasSpacing());},inputs:{hideToggle:[2,"hideToggle","hideToggle",Ot],togglePosition:"togglePosition"},outputs:{afterExpand:"afterExpand",afterCollapse:"afterCollapse"},exportAs:["matExpansionPanel"],features:[Ar([{provide:$,useValue:void 0},{provide:$e,useExisting:i}]),yt,jn],ngContentSelectors:pn,decls:9,vars:4,consts:[["bodyWrapper",""],["body",""],[1,"mat-expansion-panel-content-wrapper"],["role","region",1,"mat-expansion-panel-content",3,"id"],[1,"mat-expansion-panel-body"],[3,"cdkPortalOutlet"]],template:function(n,a){n&1&&(Rs(ln),Zr(0),Tr(1,"div",2,0)(3,"div",3,1)(5,"div",4),Zr(6,1),Cl(7,cn,0,0,"ng-template",5),Gr(),Zr(8,2),Gr()()),n&2&&(ei(),dr("inert",a.expanded?null:""),ei(2),Hd("id",a.id),dr("aria-labelledby",a._headerId),ei(4),Hd("cdkPortalOutlet",a._portal));},dependencies:[Af],styles:[`.mat-expansion-panel {
  box-sizing: content-box;
  display: block;
  margin: 0;
  overflow: hidden;
}
.mat-expansion-panel.mat-expansion-panel-animations-enabled {
  transition: margin 225ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-expansion-panel {
  position: relative;
  background: var(--mat-expansion-container-background-color, var(--mat-sys-surface));
  color: var(--mat-expansion-container-text-color, var(--mat-sys-on-surface));
  border-radius: var(--mat-expansion-container-shape, 12px);
}
.mat-expansion-panel:not([class*=mat-elevation-z]) {
  box-shadow: var(--mat-expansion-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
}
.mat-accordion .mat-expansion-panel:not(.mat-expanded), .mat-accordion .mat-expansion-panel:not(.mat-expansion-panel-spacing) {
  border-radius: 0;
}
.mat-accordion .mat-expansion-panel:first-of-type {
  border-top-right-radius: var(--mat-expansion-container-shape, 12px);
  border-top-left-radius: var(--mat-expansion-container-shape, 12px);
}
.mat-accordion .mat-expansion-panel:last-of-type {
  border-bottom-right-radius: var(--mat-expansion-container-shape, 12px);
  border-bottom-left-radius: var(--mat-expansion-container-shape, 12px);
}
@media (forced-colors: active) {
  .mat-expansion-panel {
    outline: solid 1px;
  }
}

.mat-expansion-panel-content-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  grid-template-columns: 100%;
}
.mat-expansion-panel-animations-enabled .mat-expansion-panel-content-wrapper {
  transition: grid-template-rows 225ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-expansion-panel.mat-expanded > .mat-expansion-panel-content-wrapper {
  grid-template-rows: 1fr;
}
@supports not (grid-template-rows: 0fr) {
  .mat-expansion-panel-content-wrapper {
    height: 0;
  }
  .mat-expansion-panel.mat-expanded > .mat-expansion-panel-content-wrapper {
    height: auto;
  }
}
@media print {
  .mat-expansion-panel-content-wrapper {
    height: 0;
  }
  .mat-expansion-panel.mat-expanded > .mat-expansion-panel-content-wrapper {
    height: auto;
  }
}

.mat-expansion-panel-content {
  display: flex;
  flex-direction: column;
  overflow: visible;
  min-height: 0;
  visibility: hidden;
}
.mat-expansion-panel-animations-enabled .mat-expansion-panel-content {
  transition: visibility 190ms linear;
}
.mat-expansion-panel.mat-expanded > .mat-expansion-panel-content-wrapper > .mat-expansion-panel-content {
  visibility: visible;
}
.mat-expansion-panel-content {
  font-family: var(--mat-expansion-container-text-font, var(--mat-sys-body-large-font));
  font-size: var(--mat-expansion-container-text-size, var(--mat-sys-body-large-size));
  font-weight: var(--mat-expansion-container-text-weight, var(--mat-sys-body-large-weight));
  line-height: var(--mat-expansion-container-text-line-height, var(--mat-sys-body-large-line-height));
  letter-spacing: var(--mat-expansion-container-text-tracking, var(--mat-sys-body-large-tracking));
}

.mat-expansion-panel-body {
  padding: 0 24px 16px;
}

.mat-expansion-panel-spacing {
  margin: 16px 0;
}
.mat-accordion > .mat-expansion-panel-spacing:first-child, .mat-accordion > *:first-child:not(.mat-expansion-panel) .mat-expansion-panel-spacing {
  margin-top: 0;
}
.mat-accordion > .mat-expansion-panel-spacing:last-child, .mat-accordion > *:last-child:not(.mat-expansion-panel) .mat-expansion-panel-spacing {
  margin-bottom: 0;
}

.mat-action-row {
  border-top-style: solid;
  border-top-width: 1px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 16px 8px 16px 24px;
  border-top-color: var(--mat-expansion-actions-divider-color, var(--mat-sys-outline));
}
.mat-action-row .mat-button-base,
.mat-action-row .mat-mdc-button-base {
  margin-left: 8px;
}
[dir=rtl] .mat-action-row .mat-button-base,
[dir=rtl] .mat-action-row .mat-mdc-button-base {
  margin-left: 0;
  margin-right: 8px;
}
`],encapsulation:2})}return i})();var xn=(()=>{class i{panel=y(fn,{host:true});_element=y(Ue);_focusMonitor=y(Lf);_changeDetectorRef=y(Os);_parentChangeSubscription=Ze.EMPTY;constructor(){y(Xr).load(az);let e=this.panel,n=y(Je,{optional:true}),a=y(new lg("tabindex"),{optional:true}),r=e.accordion?e.accordion._stateChanges.pipe(tn$1(s=>!!(s.hideToggle||s.togglePosition))):ga;this.tabIndex=parseInt(a||"")||0,this._parentChangeSubscription=BC(e.opened,e.closed,r,e._inputChanges.pipe(tn$1(s=>!!(s.hideToggle||s.disabled||s.togglePosition)))).subscribe(()=>this._changeDetectorRef.markForCheck()),e.closed.pipe(tn$1(()=>e._containsFocus())).subscribe(()=>this._focusMonitor.focusVia(this._element,"program")),n&&(this.expandedHeight=n.expandedHeight,this.collapsedHeight=n.collapsedHeight);}expandedHeight;collapsedHeight;tabIndex=0;get disabled(){return this.panel.disabled}_toggle(){this.disabled||this.panel.toggle();}_isExpanded(){return this.panel.expanded}_getExpandedState(){return this.panel._getExpandedState()}_getPanelId(){return this.panel.id}_getTogglePosition(){return this.panel.togglePosition}_showToggle(){return !this.panel.hideToggle&&!this.panel.disabled}_getHeaderHeight(){let e=this._isExpanded();return e&&this.expandedHeight?this.expandedHeight:!e&&this.collapsedHeight?this.collapsedHeight:null}_keydown(e){switch(e.keyCode){case 32:case 13:$s(e)||(e.preventDefault(),this._toggle());break;default:this.panel.accordion&&this.panel.accordion._handleHeaderKeydown(e);return}}focus(e,n){e?this._focusMonitor.focusVia(this._element,e,n):this._element.nativeElement.focus(n);}ngAfterViewInit(){this._focusMonitor.monitor(this._element).subscribe(e=>{e&&this.panel.accordion&&this.panel.accordion._handleHeaderFocus(this);});}ngOnDestroy(){this._parentChangeSubscription.unsubscribe(),this._focusMonitor.stopMonitoring(this._element);}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=zt({type:i,selectors:[["mat-expansion-panel-header"]],hostAttrs:["role","button",1,"mat-expansion-panel-header","mat-focus-indicator"],hostVars:13,hostBindings:function(n,a){n&1&&wo("click",function(){return a._toggle()})("keydown",function(s){return a._keydown(s)}),n&2&&(dr("id",a.panel._headerId)("tabindex",a.disabled?-1:a.tabIndex)("aria-controls",a._getPanelId())("aria-expanded",a._isExpanded())("aria-disabled",a.panel.disabled),gE("height",a._getHeaderHeight()),Bn("mat-expanded",a._isExpanded())("mat-expansion-toggle-indicator-after",a._getTogglePosition()==="after")("mat-expansion-toggle-indicator-before",a._getTogglePosition()==="before"));},inputs:{expandedHeight:"expandedHeight",collapsedHeight:"collapsedHeight",tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:VN(e)]},ngContentSelectors:hn,decls:5,vars:3,consts:[[1,"mat-content"],[1,"mat-expansion-indicator"],["xmlns","http://www.w3.org/2000/svg","viewBox","0 -960 960 960","aria-hidden","true","focusable","false"],["d","M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"]],template:function(n,a){n&1&&(Rs(mn),Ri(0,"span",0),Zr(1),Zr(2,1),Zr(3,2),Oi(),$d(4,gn,3,0,"span",1)),n&2&&(Bn("mat-content-hide-toggle",!a._showToggle()),ei(4),jd(a._showToggle()?4:-1));},styles:[`.mat-expansion-panel-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 24px;
  border-radius: inherit;
}
.mat-expansion-panel-animations-enabled .mat-expansion-panel-header {
  transition: height 225ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-expansion-panel-header::before {
  border-radius: inherit;
}
.mat-expansion-panel-header {
  height: var(--mat-expansion-header-collapsed-state-height, 48px);
  font-family: var(--mat-expansion-header-text-font, var(--mat-sys-title-medium-font));
  font-size: var(--mat-expansion-header-text-size, var(--mat-sys-title-medium-size));
  font-weight: var(--mat-expansion-header-text-weight, var(--mat-sys-title-medium-weight));
  line-height: var(--mat-expansion-header-text-line-height, var(--mat-sys-title-medium-line-height));
  letter-spacing: var(--mat-expansion-header-text-tracking, var(--mat-sys-title-medium-tracking));
}
.mat-expansion-panel-header.mat-expanded {
  height: var(--mat-expansion-header-expanded-state-height, 64px);
}
.mat-expansion-panel-header[aria-disabled=true] {
  color: var(--mat-expansion-header-disabled-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-expansion-panel-header:not([aria-disabled=true]) {
  cursor: pointer;
}
.mat-expansion-panel:not(.mat-expanded) .mat-expansion-panel-header:not([aria-disabled=true]):hover {
  background: var(--mat-expansion-header-hover-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-hover-state-layer-opacity) * 100%), transparent));
}
@media (hover: none) {
  .mat-expansion-panel:not(.mat-expanded) .mat-expansion-panel-header:not([aria-disabled=true]):hover {
    background: var(--mat-expansion-container-background-color, var(--mat-sys-surface));
  }
}
.mat-expansion-panel .mat-expansion-panel-header:not([aria-disabled=true]).cdk-keyboard-focused, .mat-expansion-panel .mat-expansion-panel-header:not([aria-disabled=true]).cdk-program-focused {
  background: var(--mat-expansion-header-focus-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-focus-state-layer-opacity) * 100%), transparent));
}
.mat-expansion-panel-header._mat-animation-noopable {
  transition: none;
}
.mat-expansion-panel-header:focus, .mat-expansion-panel-header:hover {
  outline: none;
}
.mat-expansion-panel-header.mat-expanded:focus, .mat-expansion-panel-header.mat-expanded:hover {
  background: inherit;
}
.mat-expansion-panel-header.mat-expansion-toggle-indicator-before {
  flex-direction: row-reverse;
}
.mat-expansion-panel-header.mat-expansion-toggle-indicator-before .mat-expansion-indicator {
  margin: 0 16px 0 0;
}
[dir=rtl] .mat-expansion-panel-header.mat-expansion-toggle-indicator-before .mat-expansion-indicator {
  margin: 0 0 0 16px;
}

.mat-content {
  display: flex;
  flex: 1;
  flex-direction: row;
  overflow: hidden;
}
.mat-content.mat-content-hide-toggle {
  margin-right: 8px;
}
[dir=rtl] .mat-content.mat-content-hide-toggle {
  margin-right: 0;
  margin-left: 8px;
}
.mat-expansion-toggle-indicator-before .mat-content.mat-content-hide-toggle {
  margin-left: 24px;
  margin-right: 0;
}
[dir=rtl] .mat-expansion-toggle-indicator-before .mat-content.mat-content-hide-toggle {
  margin-right: 24px;
  margin-left: 0;
}

.mat-expansion-panel-header-title {
  color: var(--mat-expansion-header-text-color, var(--mat-sys-on-surface));
}

.mat-expansion-panel-header-title,
.mat-expansion-panel-header-description {
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  margin-right: 16px;
  align-items: center;
}
[dir=rtl] .mat-expansion-panel-header-title,
[dir=rtl] .mat-expansion-panel-header-description {
  margin-right: 0;
  margin-left: 16px;
}
.mat-expansion-panel-header[aria-disabled=true] .mat-expansion-panel-header-title,
.mat-expansion-panel-header[aria-disabled=true] .mat-expansion-panel-header-description {
  color: inherit;
}

.mat-expansion-panel-header-description {
  flex-grow: 2;
  color: var(--mat-expansion-header-description-color, var(--mat-sys-on-surface-variant));
}

.mat-expansion-panel-animations-enabled .mat-expansion-indicator {
  transition: transform 225ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-expansion-panel-header.mat-expanded .mat-expansion-indicator {
  transform: rotate(180deg);
}
.mat-expansion-indicator::after {
  border-style: solid;
  border-width: 0 2px 2px 0;
  content: "";
  padding: 3px;
  transform: rotate(45deg);
  vertical-align: middle;
  color: var(--mat-expansion-header-indicator-color, var(--mat-sys-on-surface-variant));
  display: var(--mat-expansion-legacy-header-indicator-display, none);
}
.mat-expansion-indicator svg {
  width: 24px;
  height: 24px;
  margin: 0 -8px;
  vertical-align: middle;
  fill: var(--mat-expansion-header-indicator-color, var(--mat-sys-on-surface-variant));
  display: var(--mat-expansion-header-indicator-display, inline-block);
}

@media (forced-colors: active) {
  .mat-expansion-panel-content {
    border-top: 1px solid;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}
`],encapsulation:2})}return i})(),ct=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275dir=Te({type:i,selectors:[["mat-panel-description"]],hostAttrs:[1,"mat-expansion-panel-header-description"]})}return i})(),mt=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275dir=Te({type:i,selectors:[["mat-panel-title"]],hostAttrs:[1,"mat-expansion-panel-header-title"]})}return i})(),ht=(()=>{class i extends Ye{_keyManager;_ownHeaders=new Va;_headers;hideToggle=false;displayMode="default";togglePosition="after";ngAfterContentInit(){this._headers.changes.pipe(ds(this._headers)).subscribe(e=>{this._ownHeaders.reset(e.filter(n=>n.panel.accordion===this)),this._ownHeaders.notifyOnChanges();}),this._keyManager=new Vw(this._ownHeaders).withWrap().withHomeAndEnd();}_handleHeaderKeydown(e){this._keyManager.onKeydown(e);}_handleHeaderFocus(e){this._keyManager.updateActiveItem(e);}ngOnDestroy(){super.ngOnDestroy(),this._keyManager?.destroy(),this._ownHeaders.destroy();}static \u0275fac=(()=>{let e;return function(a){return (e||(e=ln$1(i)))(a||i)}})();static \u0275dir=Te({type:i,selectors:[["mat-accordion"]],contentQueries:function(n,a,r){if(n&1&&Xk(r,xn,5),n&2){let s;eg(s=tg())&&(a._headers=s);}},hostAttrs:[1,"mat-accordion"],hostVars:2,hostBindings:function(n,a){n&2&&Bn("mat-accordion-multi",a.multi);},inputs:{hideToggle:[2,"hideToggle","hideToggle",Ot],displayMode:"displayMode",togglePosition:"togglePosition"},exportAs:["matAccordion"],features:[Ar([{provide:$,useExisting:i}]),yt]})}return i})(),gt=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=Qe$1({type:i});static \u0275inj=We({imports:[Xe,gc,rr]})}return i})();export{ct as c,fn as f,gt as g,ht as h,mt as m,qe as q,xn as x};