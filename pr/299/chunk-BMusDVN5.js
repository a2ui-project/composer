import{Aa as yt,At as Lr,Bn as Xe,Ca as xe,Dr as ds,Ea as xt,Ei as lz,Fi as ni,Fr as fa,G as Gd,Gt as Oi,H as Fe,Ia as zg,L as En,Lr as fe,Ni as nR,Nt as ME,On as Vo,Pn as Wn,Qr as ht,Ra as zr,St as Kr,U as Fg,W as GR,Wn as Xt,Xr as hc,Yi as qo,Yn as YN,Zn as Yf,Zt as QD,_i as kE,_n as Tr,ba as xC,ca as v,fi as jr,gn as Tl,ji as mc,jt as Ls,ka as ye,mn as Tg,ni as ir,nn as Qt,nr as Zd,nt as Hr,oi as j,qi as qd,r as $r,ri as it,rr as Zi,ti as ip,u as Ai,ur as _t,ut as Ig,va as wr,vn as Ts,wa as xg,wn as Ur,xn as Ua,yr as cn$1,yt as Kd,z as Er,zt as Ni}from"./chunk-Caw8pTmq.js";import{h as bn}from"./chunk-Bo7sNieK.js";var L=new j(`CdkAccordion`);var we=(()=>{class n{_stateChanges=new fe;_openCloseAllActions=new fe;id=v(ni).getId(`cdk-accordion-`);multi=!1;openAll(){this.multi&&this._openCloseAllActions.next(!0)}closeAll(){this._openCloseAllActions.next(!1)}ngOnChanges(e){this._stateChanges.next(e)}ngOnDestroy(){this._stateChanges.complete(),this._openCloseAllActions.complete()}static ɵfac=function(t){return new(t||n)};static ɵdir=xt({type:n,selectors:[[`cdk-accordion`],[``,`cdkAccordion`,``]],inputs:{multi:[2,`multi`,`multi`,cn$1]},exportAs:[`cdkAccordion`],features:[ME([{provide:L,useExisting:n}]),Vo]})}return n})();var Ce=(()=>{class n{accordion=v(L,{optional:!0,skipSelf:!0});_changeDetectorRef=v(zg);_expansionDispatcher=v(bn);_openCloseAllSubscription=Xe.EMPTY;closed=new _t;opened=new _t;destroyed=new _t;expandedChange=new _t;id=v(ni).getId(`cdk-accordion-child-`);get expanded(){return this._expanded}set expanded(e){if(this._expanded!==e){if(this._expanded=e,this.expandedChange.emit(e),e){this.opened.emit();let t=this.accordion?this.accordion.id:this.id;this._expansionDispatcher.notify(this.id,t)}else this.closed.emit();this._changeDetectorRef.markForCheck()}}_expanded=!1;get disabled(){return this._disabled()}set disabled(e){this._disabled.set(e)}_disabled=Fe(!1);_removeUniqueSelectionListener=()=>{};ngOnInit(){this._removeUniqueSelectionListener=this._expansionDispatcher.listen((e,t)=>{this.accordion&&!this.accordion.multi&&this.accordion.id===t&&this.id!==e&&(this.expanded=!1)}),this.accordion&&(this._openCloseAllSubscription=this._subscribeToOpenCloseAllActions())}ngOnDestroy(){this.opened.complete(),this.closed.complete(),this.destroyed.emit(),this.destroyed.complete(),this._removeUniqueSelectionListener(),this._openCloseAllSubscription.unsubscribe()}toggle(){this.disabled||(this.expanded=!this.expanded)}close(){this.disabled||(this.expanded=!1)}open(){this.disabled||(this.expanded=!0)}_subscribeToOpenCloseAllActions(){return this.accordion._openCloseAllActions.subscribe(e=>{this.disabled||(this.expanded=e)})}static ɵfac=function(t){return new(t||n)};static ɵdir=xt({type:n,selectors:[[`cdk-accordion-item`],[``,`cdkAccordionItem`,``]],inputs:{expanded:[2,`expanded`,`expanded`,cn$1],disabled:[2,`disabled`,`disabled`,cn$1]},outputs:{closed:`closed`,opened:`opened`,destroyed:`destroyed`,expandedChange:`expandedChange`},exportAs:[`cdkAccordionItem`],features:[ME([{provide:L,useValue:void 0}])]})}return n})();var Me=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵmod=yt({type:n});static ɵinj=ht({})}return n})();var Q=new j(`MAT_ACCORDION`);var Ee=new j(`MAT_EXPANSION_PANEL`);var De=(()=>{class n{_template=v(Lr);_expansionPanel=v(Ee,{optional:!0});static ɵfac=function(t){return new(t||n)};static ɵdir=xt({type:n,selectors:[[`ng-template`,`matExpansionPanelContent`,``]]})}return n})();var Ae=new j(`MAT_EXPANSION_PANEL_DEFAULT_OPTIONS`);var Ie=(()=>{class n extends Ce{_viewContainerRef=v($r);_animationsDisabled=Zi();_document=v(ye);_ngZone=v(xe);_elementRef=v(it);_renderer=v(zr);_cleanupTransitionEnd;get hideToggle(){return this._hideToggle||this.accordion&&this.accordion.hideToggle}set hideToggle(e){this._hideToggle=e}_hideToggle=!1;get togglePosition(){return this._togglePosition||this.accordion&&this.accordion.togglePosition}set togglePosition(e){this._togglePosition=e}_togglePosition;afterExpand=new _t;afterCollapse=new _t;_inputChanges=new fe;accordion=v(Q,{optional:!0,skipSelf:!0});_lazyContent;_body;_bodyWrapper;_portal;_headerId=v(ni).getId(`mat-expansion-panel-header-`);constructor(){super();let e=v(Ae,{optional:!0});this._expansionDispatcher=v(bn),e&&(this.hideToggle=e.hideToggle)}_hasSpacing(){return this.accordion?this.expanded&&this.accordion.displayMode==="default":!1}_getExpandedState(){return this.expanded?`expanded`:`collapsed`}toggle(){this.expanded=!this.expanded}close(){this.expanded=!1}open(){this.expanded=!0}ngAfterContentInit(){this._lazyContent&&this._lazyContent._expansionPanel===this&&this.opened.pipe(ds(null),Xt(()=>this.expanded&&!this._portal),En(1)).subscribe(()=>{this._portal=new hc(this._lazyContent._template,this._viewContainerRef)}),this._setupAnimationEvents()}ngOnChanges(e){this._inputChanges.next(e)}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTransitionEnd?.(),this._inputChanges.complete()}_containsFocus(){if(this._body){let e=this._document.activeElement,t=this._body.nativeElement;return e===t||t.contains(e)}return!1}_transitionEndListener=({target:e,propertyName:t})=>{e===this._bodyWrapper?.nativeElement&&t===`grid-template-rows`&&this._ngZone.run(()=>{this.expanded?this.afterExpand.emit():this.afterCollapse.emit()})};_setupAnimationEvents(){this._ngZone.runOutsideAngular(()=>{this._animationsDisabled?(this.opened.subscribe(()=>this._ngZone.run(()=>this.afterExpand.emit())),this.closed.subscribe(()=>this._ngZone.run(()=>this.afterCollapse.emit()))):setTimeout(()=>{let e=this._elementRef.nativeElement;this._cleanupTransitionEnd=this._renderer.listen(e,`transitionend`,this._transitionEndListener),e.classList.add(`mat-expansion-panel-animations-enabled`)},200)})}static ɵfac=function(t){return new(t||n)};static ɵcmp=(function(){let e=[`body`],t=[`bodyWrapper`],p=[[[`mat-expansion-panel-header`]],`*`,[[`mat-action-row`]]],d=[`mat-expansion-panel-header`,`*`,`mat-action-row`];function o(i,s){}return Qt({type:n,selectors:[[`mat-expansion-panel`]],contentQueries:function(s,r,g){if(s&1&&nR(g,De,5),s&2){let B;xg(B=Tg())&&(r._lazyContent=B.first)}},viewQuery:function(s,r){if(s&1&&Kd(e,5)(t,5),s&2){let g;xg(g=Tg())&&(r._body=g.first),xg(g=Tg())&&(r._bodyWrapper=g.first)}},hostAttrs:[1,`mat-expansion-panel`],hostVars:4,hostBindings:function(s,r){s&2&&ir(`mat-expanded`,r.expanded)(`mat-expansion-panel-spacing`,r._hasSpacing())},inputs:{hideToggle:[2,`hideToggle`,`hideToggle`,cn$1],togglePosition:`togglePosition`},outputs:{afterExpand:`afterExpand`,afterCollapse:`afterCollapse`},exportAs:[`matExpansionPanel`],features:[ME([{provide:Q,useValue:void 0},{provide:Ee,useExisting:n}]),Wn,Vo],ngContentSelectors:d,decls:9,vars:4,consts:[[`bodyWrapper`,``],[`body`,``],[1,`mat-expansion-panel-content-wrapper`],[`role`,`region`,1,`mat-expansion-panel-content`,3,`id`],[1,`mat-expansion-panel-body`],[3,`cdkPortalOutlet`]],template:function(s,r){s&1&&(Ts(p),Ur(0),Er(1,`div`,2,0)(3,`div`,3,1)(5,`div`,4),Ur(6,1),Tl(7,o,0,0,`ng-template`,5),Hr(),Ur(8,2),Hr()()),s&2&&(qo(),jr(`inert`,r.expanded?null:``),qo(2),qd(`id`,r.id),jr(`aria-labelledby`,r._headerId),qo(4),qd(`cdkPortalOutlet`,r._portal))},dependencies:[Yf],styles:[`.mat-expansion-panel {
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
  background: var(--%NS%mat-expansion-container-background-color, var(--%NS%mat-sys-surface));
  color: var(--%NS%mat-expansion-container-text-color, var(--%NS%mat-sys-on-surface));
  border-radius: var(--%NS%mat-expansion-container-shape, 12px);
}
.mat-expansion-panel:not([class*=mat-elevation-z]) {
  box-shadow: var(--%NS%mat-expansion-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
}
.mat-accordion .mat-expansion-panel:not(.mat-expanded), .mat-accordion .mat-expansion-panel:not(.mat-expansion-panel-spacing) {
  border-radius: 0;
}
.mat-accordion .mat-expansion-panel:first-of-type {
  border-top-right-radius: var(--%NS%mat-expansion-container-shape, 12px);
  border-top-left-radius: var(--%NS%mat-expansion-container-shape, 12px);
}
.mat-accordion .mat-expansion-panel:last-of-type {
  border-bottom-right-radius: var(--%NS%mat-expansion-container-shape, 12px);
  border-bottom-left-radius: var(--%NS%mat-expansion-container-shape, 12px);
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
  font-family: var(--%NS%mat-expansion-container-text-font, var(--%NS%mat-sys-body-large-font));
  font-size: var(--%NS%mat-expansion-container-text-size, var(--%NS%mat-sys-body-large-size));
  font-weight: var(--%NS%mat-expansion-container-text-weight, var(--%NS%mat-sys-body-large-weight));
  line-height: var(--%NS%mat-expansion-container-text-line-height, var(--%NS%mat-sys-body-large-line-height));
  letter-spacing: var(--%NS%mat-expansion-container-text-tracking, var(--%NS%mat-sys-body-large-tracking));
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
  border-top-color: var(--%NS%mat-expansion-actions-divider-color, var(--%NS%mat-sys-outline));
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
`],encapsulation:2})})()}return n})();var Te=(()=>{class n{panel=v(Ie,{host:!0});_element=v(it);_focusMonitor=v(ip);_changeDetectorRef=v(zg);_parentChangeSubscription=Xe.EMPTY;constructor(){v(Kr).load(lz);let e=this.panel,t=v(Ae,{optional:!0}),p=v(new Fg(`tabindex`),{optional:!0}),d=e.accordion?e.accordion._stateChanges.pipe(Xt(o=>!!(o.hideToggle||o.togglePosition))):fa;this.tabIndex=parseInt(p||``)||0,this._parentChangeSubscription=xC(e.opened,e.closed,d,e._inputChanges.pipe(Xt(o=>!!(o.hideToggle||o.disabled||o.togglePosition)))).subscribe(()=>this._changeDetectorRef.markForCheck()),e.closed.pipe(Xt(()=>e._containsFocus())).subscribe(()=>this._focusMonitor.focusVia(this._element,`program`)),t&&(this.expandedHeight=t.expandedHeight,this.collapsedHeight=t.collapsedHeight)}expandedHeight;collapsedHeight;tabIndex=0;get disabled(){return this.panel.disabled}_toggle(){this.disabled||this.panel.toggle()}_isExpanded(){return this.panel.expanded}_getExpandedState(){return this.panel._getExpandedState()}_getPanelId(){return this.panel.id}_getTogglePosition(){return this.panel.togglePosition}_showToggle(){return!this.panel.hideToggle&&!this.panel.disabled}_getHeaderHeight(){let e=this._isExpanded();return e&&this.expandedHeight?this.expandedHeight:!e&&this.collapsedHeight?this.collapsedHeight:null}_keydown(e){switch(e.keyCode){case 32:case 13:Ls(e)||(e.preventDefault(),this._toggle());break;default:this.panel.accordion&&this.panel.accordion._handleHeaderKeydown(e);return}}focus(e,t){e?this._focusMonitor.focusVia(this._element,e,t):this._element.nativeElement.focus(t)}ngAfterViewInit(){this._focusMonitor.monitor(this._element).subscribe(e=>{e&&this.panel.accordion&&this.panel.accordion._handleHeaderFocus(this)})}ngOnDestroy(){this._parentChangeSubscription.unsubscribe(),this._focusMonitor.stopMonitoring(this._element)}static ɵfac=function(t){return new(t||n)};static ɵcmp=(function(){let e=[[[`mat-panel-title`]],[[`mat-panel-description`]],`*`],t=[`mat-panel-title`,`mat-panel-description`,`*`];function p(d,o){d&1&&(Ni(0,`span`,1),YN(),Ni(1,`svg`,2),Oi(2,`path`,3),Ai()())}return Qt({type:n,selectors:[[`mat-expansion-panel-header`]],hostAttrs:[`role`,`button`,1,`mat-expansion-panel-header`,`mat-focus-indicator`],hostVars:13,hostBindings:function(o,i){o&1&&Ig(`click`,function(){return i._toggle()})(`keydown`,function(r){return i._keydown(r)}),o&2&&(jr(`id`,i.panel._headerId)(`tabindex`,i.disabled?-1:i.tabIndex)(`aria-controls`,i._getPanelId())(`aria-expanded`,i._isExpanded())(`aria-disabled`,i.panel.disabled),kE(`height`,i._getHeaderHeight()),ir(`mat-expanded`,i._isExpanded())(`mat-expansion-toggle-indicator-after`,i._getTogglePosition()===`after`)(`mat-expansion-toggle-indicator-before`,i._getTogglePosition()===`before`))},inputs:{expandedHeight:`expandedHeight`,collapsedHeight:`collapsedHeight`,tabIndex:[2,`tabIndex`,`tabIndex`,d=>d==null?0:GR(d)]},ngContentSelectors:t,decls:5,vars:3,consts:[[1,`mat-content`],[1,`mat-expansion-indicator`],[`xmlns`,`http://www.w3.org/2000/svg`,`viewBox`,`0 -960 960 960`,`aria-hidden`,`true`,`focusable`,`false`],[`d`,`M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z`]],template:function(o,i){o&1&&(Ts(e),Ni(0,`span`,0),Ur(1),Ur(2,1),Ur(3,2),Ai(),Gd(4,p,3,0,`span`,1)),o&2&&(ir(`mat-content-hide-toggle`,!i._showToggle()),qo(4),Zd(i._showToggle()?4:-1))},styles:[`.mat-expansion-panel-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 24px;
  border-radius: inherit;
  outline: 0;
}
.mat-expansion-panel-animations-enabled .mat-expansion-panel-header {
  transition: height 225ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-expansion-panel-header::before {
  border-radius: inherit;
}
.mat-expansion-panel-header {
  height: var(--%NS%mat-expansion-header-collapsed-state-height, 48px);
  font-family: var(--%NS%mat-expansion-header-text-font, var(--%NS%mat-sys-title-medium-font));
  font-size: var(--%NS%mat-expansion-header-text-size, var(--%NS%mat-sys-title-medium-size));
  font-weight: var(--%NS%mat-expansion-header-text-weight, var(--%NS%mat-sys-title-medium-weight));
  line-height: var(--%NS%mat-expansion-header-text-line-height, var(--%NS%mat-sys-title-medium-line-height));
  letter-spacing: var(--%NS%mat-expansion-header-text-tracking, var(--%NS%mat-sys-title-medium-tracking));
}
.mat-expansion-panel-header.mat-expanded {
  height: var(--%NS%mat-expansion-header-expanded-state-height, 64px);
}
.mat-expansion-panel-header[aria-disabled=true] {
  color: var(--%NS%mat-expansion-header-disabled-state-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-expansion-panel-header:not([aria-disabled=true]) {
  cursor: pointer;
}
.mat-expansion-panel:not(.mat-expanded) .mat-expansion-panel-header:not([aria-disabled=true]):hover {
  background: var(--%NS%mat-expansion-header-hover-state-layer-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) calc(var(--%NS%mat-sys-hover-state-layer-opacity) * 100%), transparent));
}
@media (hover: none) {
  .mat-expansion-panel:not(.mat-expanded) .mat-expansion-panel-header:not([aria-disabled=true]):hover {
    background: var(--%NS%mat-expansion-container-background-color, var(--%NS%mat-sys-surface));
  }
}
.mat-expansion-panel .mat-expansion-panel-header:not([aria-disabled=true]).cdk-keyboard-focused, .mat-expansion-panel .mat-expansion-panel-header:not([aria-disabled=true]).cdk-program-focused {
  background: var(--%NS%mat-expansion-header-focus-state-layer-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) calc(var(--%NS%mat-sys-focus-state-layer-opacity) * 100%), transparent));
}
.mat-expansion-panel-header._mat-animation-noopable {
  transition: none;
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
  color: var(--%NS%mat-expansion-header-text-color, var(--%NS%mat-sys-on-surface));
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
  color: var(--%NS%mat-expansion-header-description-color, var(--%NS%mat-sys-on-surface-variant));
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
  color: var(--%NS%mat-expansion-header-indicator-color, var(--%NS%mat-sys-on-surface-variant));
  display: var(--%NS%mat-expansion-legacy-header-indicator-display, none);
}
.mat-expansion-indicator svg {
  width: 24px;
  height: 24px;
  margin: 0 -8px;
  vertical-align: middle;
  fill: var(--%NS%mat-expansion-header-indicator-color, var(--%NS%mat-sys-on-surface-variant));
  display: var(--%NS%mat-expansion-header-indicator-display, inline-block);
}

@media (forced-colors: active) {
  .mat-expansion-panel-content {
    border-top: 1px solid;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}
`],encapsulation:2})})()}return n})();var cn=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵdir=xt({type:n,selectors:[[`mat-panel-description`]],hostAttrs:[1,`mat-expansion-panel-header-description`]})}return n})();var mn=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵdir=xt({type:n,selectors:[[`mat-panel-title`]],hostAttrs:[1,`mat-expansion-panel-header-title`]})}return n})();var xn=(()=>{class n extends we{_keyManager;_ownHeaders=new Ua;_headers;hideToggle=!1;displayMode=`default`;togglePosition=`after`;ngAfterContentInit(){this._headers.changes.pipe(ds(this._headers)).subscribe(e=>{this._ownHeaders.reset(e.filter(t=>t.panel.accordion===this)),this._ownHeaders.notifyOnChanges()}),this._keyManager=new QD(this._ownHeaders).withWrap().withHomeAndEnd()}_handleHeaderKeydown(e){this._keyManager.onKeydown(e)}_handleHeaderFocus(e){this._keyManager.updateActiveItem(e)}ngOnDestroy(){super.ngOnDestroy(),this._keyManager?.destroy(),this._ownHeaders.destroy()}static ɵfac=(()=>{let e;return function(p){return(e||(e=wr(n)))(p||n)}})();static ɵdir=xt({type:n,selectors:[[`mat-accordion`]],contentQueries:function(t,p,d){if(t&1&&nR(d,Te,5),t&2){let o;xg(o=Tg())&&(p._headers=o)}},hostAttrs:[1,`mat-accordion`],hostVars:2,hostBindings:function(t,p){t&2&&ir(`mat-accordion-multi`,p.multi)},inputs:{hideToggle:[2,`hideToggle`,`hideToggle`,cn$1],displayMode:`displayMode`,togglePosition:`togglePosition`},exportAs:[`matAccordion`],features:[ME([{provide:Q,useExisting:n}]),Wn]})}return n})();var gn=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵmod=yt({type:n});static ɵinj=ht({imports:[Me,mc,Tr]})}return n})();export{mn as a,gn as i,Te as n,xn as o,cn as r,Ie as t};