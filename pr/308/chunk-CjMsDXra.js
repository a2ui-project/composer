import{$ as JR,$n as cf,$t as Te,A as FA,Ai as qg,An as Zg,At as Or,B as H,Bn as ar,Bt as Qt,Ca as xt,Cr as fe,Ea as ye,Fa as zi,Fi as qr,Fn as _n$1,Hn as ba,Ii as qs,In as _t,It as QKe,Jn as bw,K as Hr,Kt as Rse,Li as rB,Ln as _w,M as Fi,Mn as Zr,Mt as Pi,Pa as zS,Pn as _c,Qi as tn$1,R as Gg,T as En$1,Ui as sf,Vn as b,Vr as ht,Wi as st,X as Ir,Xn as c$,Yi as tM,Yt as Sr,_n as Xo,an as VM,ar as dJ,bi as p$,bt as Ls,cn as Vr,cr as dn$1,ct as Ko,da as vp,dt as LA,er as ci,fn as Wg,gn as Xe,gt as Li,ht as Le,ja as yw,ka as yt,li as mC,ln as WJ,lr as dp,mn as XKe,nt as KA,pa as vw,qi as tB,qn as bs,rn as Ur,si as m$,sr as df,st as Kn,ti as lJ,v as Cw,vr as eo,w as Ec,wn as Ya,wr as ff,yt as Ll,z as Gr,zn as af,zt as Qi}from"./chunk-CgUBps1E.js";import{h as bn$1}from"./chunk-CN38vt4b.js";import{a as Lt,c as Vt,d as zt,i as It,l as Wt,n as Bt,o as Pt$1,r as Ht,s as Ut,t as At,u as jt}from"./chunk-DJc5_OBo.js";function Ye(n){let a=new Date(n);return`${String(a.getHours()).padStart(2,`0`)}:${String(a.getMinutes()).padStart(2,`0`)}:${String(a.getSeconds()).padStart(2,`0`)}.${String(a.getMilliseconds()).padStart(3,`0`)}`}var sn=()=>[`expandedDetail`];function ln(n,a){n&1&&(Sr(0,`th`,13),zi(1,`Time`),Zr())}function dn(n,a){if(n&1&&(Sr(0,`td`,14),zi(1),Zr()),n&2){let e=a.$implicit;Xo(),Wg(e.time)}}function pn(n,a){n&1&&(Sr(0,`th`,13),zi(1,`Level`),Zr())}function cn(n,a){if(n&1&&(Sr(0,`td`,14)(1,`span`,15),zi(2),Zr()()),n&2){let e=a.$implicit;Xo(),ff(e.level),Xo(),Wg(e.level)}}function mn(n,a){n&1&&(Sr(0,`th`,13),zi(1,`Source`),Zr())}function gn(n,a){if(n&1&&(Sr(0,`td`,14)(1,`span`,16),zi(2),Zr()()),n&2){let e=a.$implicit;Xo(),ff(e.source),Xo(),Wg(e.source)}}function xn(n,a){n&1&&(Sr(0,`th`,13),zi(1,`Message`),Zr())}function un(n,a){if(n&1&&zi(0),n&2){let e=dJ(2).$implicit;Cw(` , Col `,e.column,` `)}}function hn(n,a){if(n&1&&(Sr(0,`span`,19),zi(1),sf(2,un,1,1),zi(3,` )`),Zr()),n&2){let e=dJ().$implicit;Xo(),Cw(` (Line `,e.line,` `),Xo(),af(e.column!==void 0?2:-1)}}function fn(n,a){if(n&1){let e=lJ();Sr(0,`button`,21),Gg(`click`,function(d){FA(e);let c=dJ().$implicit;return dJ(2).toggleRow(c),LA(d.stopPropagation())}),Sr(1,`mat-icon`,22),zi(2),Zr()()}if(n&2){let e=dJ().$implicit,t=dJ(2);Xo(2),Wg(t.isRowExpanded(e)?`keyboard_arrow_up`:`keyboard_arrow_down`)}}function bn(n,a){if(n&1&&(Sr(0,`td`,14)(1,`div`,17)(2,`span`,18),zi(3),sf(4,hn,4,2,`span`,19),Zr(),sf(5,fn,3,1,`button`,20),Zr()()),n&2){let e=a.$implicit;Xo(3),Cw(` `,e.message,` `),Xo(),af(e.line!==void 0?4:-1),Xo(),af(e.stack||e.snippet?5:-1)}}function yn(n,a){if(n&1&&(Sr(0,`pre`,24),zi(1),Zr()),n&2){let e=dJ().$implicit;Xo(),Wg(e.snippet)}}function _n(n,a){if(n&1&&(Sr(0,`pre`,25),zi(1),Zr()),n&2){let e=dJ().$implicit;Xo(),Wg(e.stack)}}function vn(n,a){if(n&1&&(Sr(0,`td`,14)(1,`div`,23),sf(2,yn,2,1,`pre`,24),sf(3,_n,2,1,`pre`,25),Zr()()),n&2){let e=a.$implicit,t=dJ(2);Gr(`colspan`,t.columnsToDisplay.length),Xo(2),af(e.snippet?2:-1),Xo(),af(e.stack?3:-1)}}function Cn(n,a){n&1&&JR(0,`tr`,26)}function wn(n,a){if(n&1&&JR(0,`tr`,27),n&2){let e=a.dataIndex;Gr(`data-row-index`,e)}}function Mn(n,a){if(n&1&&JR(0,`tr`,28),n&2){let e=a.$implicit,t=dJ(2);ar(`expanded`,t.isRowExpanded(e))}}function En(n,a){if(n&1&&(Sr(0,`table`,1),yw(1,3),Ll(2,ln,2,0,`th`,4)(3,dn,2,1,`td`,5),vw(),yw(4,6),Ll(5,pn,2,0,`th`,4)(6,cn,3,3,`td`,5),vw(),yw(7,7),Ll(8,mn,2,0,`th`,4)(9,gn,3,3,`td`,5),vw(),yw(10,8),Ll(11,xn,2,0,`th`,4)(12,bn,6,3,`td`,5),vw(),yw(13,9),Ll(14,vn,4,3,`td`,5),vw(),Ll(15,Cn,1,0,`tr`,10)(16,wn,1,1,`tr`,11)(17,Mn,1,2,`tr`,12),Zr()),n&2){let e=dJ();cf(`dataSource`,e.errorsLog()),Xo(15),cf(`matHeaderRowDef`,e.columnsToDisplay),Xo(),cf(`matRowDefColumns`,e.columnsToDisplay),Xo(),cf(`matRowDefColumns`,WJ(4,sn))}}function Pn(n,a){n&1&&(Sr(0,`div`,2),zi(1,`No errors captured yet`),Zr())}var Je=class n{errorLogger=b(_n$1);errorsLog=Le([]);columnsToDisplay=[`time`,`level`,`source`,`message`];expandedRows=Le(new Set);constructor(){this.errorsLog.set(this.errorLogger.getHistory().map(a=>this.mapToDisplayItem(a)).reverse()),this.errorLogger.errorStream$.pipe(m$()).subscribe(a=>{let e=this.mapToDisplayItem(a);this.errorsLog.update(t=>{let d=[e,...t];return d.length>100&&(d.length=100),d})})}mapToDisplayItem(a){return{id:a.id,time:Ye(a.timestamp),source:a.sourceTag,level:a.level,message:a.message,line:a.line,column:a.column,stack:a.stack,snippet:a.snippet}}toggleRow(a){this.expandedRows.update(e=>{let t=new Set(e);return t.has(a.id)?t.delete(a.id):t.add(a.id),t})}isRowExpanded(a){return this.expandedRows().has(a.id)}clearLogs(){this.errorLogger.clear(),this.errorsLog.set([]),this.expandedRows.set(new Set)}static ɵfac=function(e){return new(e||n)};static ɵcmp=Qt({type:n,selectors:[[`a2ui-composer-errors`]],decls:3,vars:1,consts:[[1,`errors-container`],[`mat-table`,``,`multiTemplateDataRows`,``,1,`mat-elevation-z1`,3,`dataSource`],[1,`errors-placeholder`],[`matColumnDef`,`time`],[`mat-header-cell`,``,4,`matHeaderCellDef`],[`mat-cell`,``,4,`matCellDef`],[`matColumnDef`,`level`],[`matColumnDef`,`source`],[`matColumnDef`,`message`],[`matColumnDef`,`expandedDetail`],[`mat-header-row`,``,4,`matHeaderRowDef`],[`mat-row`,``,`class`,`element-row`,4,`matRowDef`,`matRowDefColumns`],[`mat-row`,``,`class`,`detail-row`,3,`expanded`,4,`matRowDef`,`matRowDefColumns`],[`mat-header-cell`,``],[`mat-cell`,``],[1,`level-badge`],[1,`source-badge`],[1,`message-cell`],[1,`error-message-text`],[1,`line-col`],[`mat-icon-button`,``,`aria-label`,`Toggle Details`],[`mat-icon-button`,``,`aria-label`,`Toggle Details`,3,`click`],[`aria-hidden`,`true`],[1,`element-detail`],[1,`snippet-preview`],[1,`stack-preview`],[`mat-header-row`,``],[`mat-row`,``,1,`element-row`],[`mat-row`,``,1,`detail-row`]],template:function(e,t){e&1&&(Sr(0,`div`,0),sf(1,En,18,5,`table`,1)(2,Pn,2,0,`div`,2),Zr()),e&2&&(Xo(),af(t.errorsLog().length>0?1:2))},dependencies:[Wt,It,Ht,Bt,Pt$1,At,Vt,zt,Lt,jt,Ut,p$,Rse,XKe,QKe],styles:[`[_nghost-%COMP%]{display:block;height:100%;width:100%}.errors-container[_ngcontent-%COMP%]{height:100%;width:100%;overflow:auto;box-sizing:border-box;padding:2px 0 2px 8px}.errors-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--%NS%mat-sys-on-surface-variant);font-size:14px}table[_ngcontent-%COMP%]{width:100%;background:var(--%NS%mat-sys-surface);border-radius:6px;overflow:hidden}table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{font-weight:700;color:var(--%NS%mat-sys-on-surface-variant);font-size:12px}table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{font-size:12px;color:var(--%NS%mat-sys-on-surface);vertical-align:middle}table[_ngcontent-%COMP%]   .source-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}table[_ngcontent-%COMP%]   .source-badge.exception[_ngcontent-%COMP%]{background-color:var(--%NS%mat-sys-error-container);color:var(--%NS%mat-sys-on-error-container)}table[_ngcontent-%COMP%]   .source-badge.console[_ngcontent-%COMP%]{background-color:var(--%NS%mat-sys-tertiary-container);color:var(--%NS%mat-sys-on-tertiary-container)}table[_ngcontent-%COMP%]   .source-badge.validation[_ngcontent-%COMP%]{background-color:var(--%NS%app-success-container, #e6f4ea);color:var(--%NS%app-on-success-container, #137333)}table[_ngcontent-%COMP%]   .level-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}table[_ngcontent-%COMP%]   .level-badge.error[_ngcontent-%COMP%]{background-color:var(--%NS%mat-sys-error-container);color:var(--%NS%mat-sys-on-error-container)}table[_ngcontent-%COMP%]   .level-badge.warn[_ngcontent-%COMP%]{background-color:var(--%NS%mat-sys-tertiary-container);color:var(--%NS%mat-sys-on-tertiary-container)}table[_ngcontent-%COMP%]   .level-badge.info[_ngcontent-%COMP%]{background-color:var(--%NS%mat-sys-primary-container);color:var(--%NS%mat-sys-on-primary-container)}table[_ngcontent-%COMP%]   .level-badge.debug[_ngcontent-%COMP%], table[_ngcontent-%COMP%]   .level-badge.log[_ngcontent-%COMP%]{background-color:var(--%NS%mat-sys-surface-container-high);color:var(--%NS%mat-sys-on-surface-variant)}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   .error-message-text[_ngcontent-%COMP%]{flex:1;white-space:normal;word-break:break-word}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{width:28px;height:28px;line-height:28px}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]     .mat-mdc-button-touch-target{display:none}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:18px;width:18px;height:18px}table[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]{height:0;display:none}table[_ngcontent-%COMP%]   .detail-row.expanded[_ngcontent-%COMP%]{display:table-row;height:auto}table[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{border-bottom-width:0;padding:0}table[_ngcontent-%COMP%]   .element-detail[_ngcontent-%COMP%]{overflow:hidden;box-sizing:border-box;background:var(--%NS%mat-sys-surface-container-lowest)}table[_ngcontent-%COMP%]   .element-detail[_ngcontent-%COMP%]   pre.stack-preview[_ngcontent-%COMP%]{margin:8px;font-family:monospace;font-size:11px;white-space:pre-wrap;word-break:break-all;color:var(--%NS%mat-sys-error);padding:8px;border-left:3px solid var(--%NS%mat-sys-error);background:color-mix(in srgb,var(--%NS%mat-sys-error) 6%,transparent);border-radius:0 4px 4px 0}`]})};var te=new H(`CdkAccordion`);var nn=(()=>{class n{_stateChanges=new fe;_openCloseAllActions=new fe;id=b(ci).getId(`cdk-accordion-`);multi=!1;openAll(){this.multi&&this._openCloseAllActions.next(!0)}closeAll(){this._openCloseAllActions.next(!1)}ngOnChanges(e){this._stateChanges.next(e)}ngOnDestroy(){this._stateChanges.complete(),this._openCloseAllActions.complete()}static ɵfac=function(t){return new(t||n)};static ɵdir=xt({type:n,selectors:[[`cdk-accordion`],[``,`cdkAccordion`,``]],inputs:{multi:[2,`multi`,`multi`,dn$1]},exportAs:[`cdkAccordion`],features:[_w([{provide:te,useExisting:n}]),Ko]})}return n})();var tn=(()=>{class n{accordion=b(te,{optional:!0,skipSelf:!0});_changeDetectorRef=b(rB);_expansionDispatcher=b(bn$1);_openCloseAllSubscription=Xe.EMPTY;closed=new _t;opened=new _t;destroyed=new _t;expandedChange=new _t;id=b(ci).getId(`cdk-accordion-child-`);get expanded(){return this._expanded}set expanded(e){if(this._expanded!==e){if(this._expanded=e,this.expandedChange.emit(e),e){this.opened.emit();let t=this.accordion?this.accordion.id:this.id;this._expansionDispatcher.notify(this.id,t)}else this.closed.emit();this._changeDetectorRef.markForCheck()}}_expanded=!1;get disabled(){return this._disabled()}set disabled(e){this._disabled.set(e)}_disabled=Le(!1);_removeUniqueSelectionListener=()=>{};ngOnInit(){this._removeUniqueSelectionListener=this._expansionDispatcher.listen((e,t)=>{this.accordion&&!this.accordion.multi&&this.accordion.id===t&&this.id!==e&&(this.expanded=!1)}),this.accordion&&(this._openCloseAllSubscription=this._subscribeToOpenCloseAllActions())}ngOnDestroy(){this.opened.complete(),this.closed.complete(),this.destroyed.emit(),this.destroyed.complete(),this._removeUniqueSelectionListener(),this._openCloseAllSubscription.unsubscribe()}toggle(){this.disabled||(this.expanded=!this.expanded)}close(){this.disabled||(this.expanded=!1)}open(){this.disabled||(this.expanded=!0)}_subscribeToOpenCloseAllActions(){return this.accordion._openCloseAllActions.subscribe(e=>{this.disabled||(this.expanded=e)})}static ɵfac=function(t){return new(t||n)};static ɵdir=xt({type:n,selectors:[[`cdk-accordion-item`],[``,`cdkAccordionItem`,``]],inputs:{expanded:[2,`expanded`,`expanded`,dn$1],disabled:[2,`disabled`,`disabled`,dn$1]},outputs:{closed:`closed`,opened:`opened`,destroyed:`destroyed`,expandedChange:`expandedChange`},exportAs:[`cdkAccordionItem`],features:[_w([{provide:te,useValue:void 0}])]})}return n})();var an=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵmod=yt({type:n});static ɵinj=ht({})}return n})();var ae=new H(`MAT_ACCORDION`);var on=new H(`MAT_EXPANSION_PANEL`);var Nn=(()=>{class n{_template=b(Hr);_expansionPanel=b(on,{optional:!0});static ɵfac=function(t){return new(t||n)};static ɵdir=xt({type:n,selectors:[[`ng-template`,`matExpansionPanelContent`,``]]})}return n})();var rn=new H(`MAT_EXPANSION_PANEL_DEFAULT_OPTIONS`);var An=(()=>{class n extends tn{_viewContainerRef=b(Vr);_animationsDisabled=Qi();_document=b(ye);_ngZone=b(Te);_elementRef=b(st);_renderer=b(Ur);_cleanupTransitionEnd;get hideToggle(){return this._hideToggle||this.accordion&&this.accordion.hideToggle}set hideToggle(e){this._hideToggle=e}_hideToggle=!1;get togglePosition(){return this._togglePosition||this.accordion&&this.accordion.togglePosition}set togglePosition(e){this._togglePosition=e}_togglePosition;afterExpand=new _t;afterCollapse=new _t;_inputChanges=new fe;accordion=b(ae,{optional:!0,skipSelf:!0});_lazyContent;_body;_bodyWrapper;_portal;_headerId=b(ci).getId(`mat-expansion-panel-header-`);constructor(){super();let e=b(rn,{optional:!0});this._expansionDispatcher=b(bn$1),e&&(this.hideToggle=e.hideToggle)}_hasSpacing(){return this.accordion?this.expanded&&this.accordion.displayMode==="default":!1}_getExpandedState(){return this.expanded?`expanded`:`collapsed`}toggle(){this.expanded=!this.expanded}close(){this.expanded=!1}open(){this.expanded=!0}ngAfterContentInit(){this._lazyContent&&this._lazyContent._expansionPanel===this&&this.opened.pipe(bs(null),tn$1(()=>this.expanded&&!this._portal),En$1(1)).subscribe(()=>{this._portal=new _c(this._lazyContent._template,this._viewContainerRef)}),this._setupAnimationEvents()}ngOnChanges(e){this._inputChanges.next(e)}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTransitionEnd?.(),this._inputChanges.complete()}_containsFocus(){if(this._body){let e=this._document.activeElement,t=this._body.nativeElement;return e===t||t.contains(e)}return!1}_transitionEndListener=({target:e,propertyName:t})=>{e===this._bodyWrapper?.nativeElement&&t===`grid-template-rows`&&this._ngZone.run(()=>{this.expanded?this.afterExpand.emit():this.afterCollapse.emit()})};_setupAnimationEvents(){this._ngZone.runOutsideAngular(()=>{this._animationsDisabled?(this.opened.subscribe(()=>this._ngZone.run(()=>this.afterExpand.emit())),this.closed.subscribe(()=>this._ngZone.run(()=>this.afterCollapse.emit()))):setTimeout(()=>{let e=this._elementRef.nativeElement;this._cleanupTransitionEnd=this._renderer.listen(e,`transitionend`,this._transitionEndListener),e.classList.add(`mat-expansion-panel-animations-enabled`)},200)})}static ɵfac=function(t){return new(t||n)};static ɵcmp=(function(){let e=[`body`],t=[`bodyWrapper`],d=[[[`mat-expansion-panel-header`]],`*`,[[`mat-action-row`]]],c=[`mat-expansion-panel-header`,`*`,`mat-action-row`];function p(s,x){}return Qt({type:n,selectors:[[`mat-expansion-panel`]],contentQueries:function(x,g,S){if(x&1&&tM(S,Nn,5),x&2){let ie;Zg(ie=qg())&&(g._lazyContent=ie.first)}},viewQuery:function(x,g){if(x&1&&df(e,5)(t,5),x&2){let S;Zg(S=qg())&&(g._body=S.first),Zg(S=qg())&&(g._bodyWrapper=S.first)}},hostAttrs:[1,`mat-expansion-panel`],hostVars:4,hostBindings:function(x,g){x&2&&ar(`mat-expanded`,g.expanded)(`mat-expansion-panel-spacing`,g._hasSpacing())},inputs:{hideToggle:[2,`hideToggle`,`hideToggle`,dn$1],togglePosition:`togglePosition`},outputs:{afterExpand:`afterExpand`,afterCollapse:`afterCollapse`},exportAs:[`matExpansionPanel`],features:[_w([{provide:ae,useValue:void 0},{provide:on,useExisting:n}]),Kn,Ko],ngContentSelectors:c,decls:9,vars:4,consts:[[`bodyWrapper`,``],[`body`,``],[1,`mat-expansion-panel-content-wrapper`],[`role`,`region`,1,`mat-expansion-panel-content`,3,`id`],[1,`mat-expansion-panel-body`],[3,`cdkPortalOutlet`]],template:function(x,g){x&1&&(Ls(d),qr(0),Sr(1,`div`,2,0)(3,`div`,3,1)(5,`div`,4),qr(6,1),Ll(7,p,0,0,`ng-template`,5),Zr(),qr(8,2),Zr()()),x&2&&(Xo(),Gr(`inert`,g.expanded?null:``),Xo(2),cf(`id`,g.id),Gr(`aria-labelledby`,g._headerId),Xo(4),cf(`cdkPortalOutlet`,g._portal))},dependencies:[dp],styles:[`.mat-expansion-panel {
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
`],encapsulation:2})})()}return n})();var On=(()=>{class n{panel=b(An,{host:!0});_element=b(st);_focusMonitor=b(vp);_changeDetectorRef=b(rB);_parentChangeSubscription=Xe.EMPTY;constructor(){b(eo).load(c$);let e=this.panel,t=b(rn,{optional:!0}),d=b(new tB(`tabindex`),{optional:!0}),c=e.accordion?e.accordion._stateChanges.pipe(tn$1(p=>!!(p.hideToggle||p.togglePosition))):ba;this.tabIndex=parseInt(d||``)||0,this._parentChangeSubscription=mC(e.opened,e.closed,c,e._inputChanges.pipe(tn$1(p=>!!(p.hideToggle||p.disabled||p.togglePosition)))).subscribe(()=>this._changeDetectorRef.markForCheck()),e.closed.pipe(tn$1(()=>e._containsFocus())).subscribe(()=>this._focusMonitor.focusVia(this._element,`program`)),t&&(this.expandedHeight=t.expandedHeight,this.collapsedHeight=t.collapsedHeight)}expandedHeight;collapsedHeight;tabIndex=0;get disabled(){return this.panel.disabled}_toggle(){this.disabled||this.panel.toggle()}_isExpanded(){return this.panel.expanded}_getExpandedState(){return this.panel._getExpandedState()}_getPanelId(){return this.panel.id}_getTogglePosition(){return this.panel.togglePosition}_showToggle(){return!this.panel.hideToggle&&!this.panel.disabled}_getHeaderHeight(){let e=this._isExpanded();return e&&this.expandedHeight?this.expandedHeight:!e&&this.collapsedHeight?this.collapsedHeight:null}_keydown(e){switch(e.keyCode){case 32:case 13:qs(e)||(e.preventDefault(),this._toggle());break;default:this.panel.accordion&&this.panel.accordion._handleHeaderKeydown(e);return}}focus(e,t){e?this._focusMonitor.focusVia(this._element,e,t):this._element.nativeElement.focus(t)}ngAfterViewInit(){this._focusMonitor.monitor(this._element).subscribe(e=>{e&&this.panel.accordion&&this.panel.accordion._handleHeaderFocus(this)})}ngOnDestroy(){this._parentChangeSubscription.unsubscribe(),this._focusMonitor.stopMonitoring(this._element)}static ɵfac=function(t){return new(t||n)};static ɵcmp=(function(){let e=[[[`mat-panel-title`]],[[`mat-panel-description`]],`*`],t=[`mat-panel-title`,`mat-panel-description`,`*`];function d(c,p){c&1&&(Pi(0,`span`,1),KA(),Pi(1,`svg`,2),Li(2,`path`,3),Fi()())}return Qt({type:n,selectors:[[`mat-expansion-panel-header`]],hostAttrs:[`role`,`button`,1,`mat-expansion-panel-header`,`mat-focus-indicator`],hostVars:13,hostBindings:function(p,s){p&1&&Gg(`click`,function(){return s._toggle()})(`keydown`,function(g){return s._keydown(g)}),p&2&&(Gr(`id`,s.panel._headerId)(`tabindex`,s.disabled?-1:s.tabIndex)(`aria-controls`,s._getPanelId())(`aria-expanded`,s._isExpanded())(`aria-disabled`,s.panel.disabled),bw(`height`,s._getHeaderHeight()),ar(`mat-expanded`,s._isExpanded())(`mat-expansion-toggle-indicator-after`,s._getTogglePosition()===`after`)(`mat-expansion-toggle-indicator-before`,s._getTogglePosition()===`before`))},inputs:{expandedHeight:`expandedHeight`,collapsedHeight:`collapsedHeight`,tabIndex:[2,`tabIndex`,`tabIndex`,c=>c==null?0:VM(c)]},ngContentSelectors:t,decls:5,vars:3,consts:[[1,`mat-content`],[1,`mat-expansion-indicator`],[`xmlns`,`http://www.w3.org/2000/svg`,`viewBox`,`0 -960 960 960`,`aria-hidden`,`true`,`focusable`,`false`],[`d`,`M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z`]],template:function(p,s){p&1&&(Ls(e),Pi(0,`span`,0),qr(1),qr(2,1),qr(3,2),Fi(),sf(4,d,3,0,`span`,1)),p&2&&(ar(`mat-content-hide-toggle`,!s._showToggle()),Xo(4),af(s._showToggle()?4:-1))},styles:[`.mat-expansion-panel-header {
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
`],encapsulation:2})})()}return n})();var Mt=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵdir=xt({type:n,selectors:[[`mat-panel-description`]],hostAttrs:[1,`mat-expansion-panel-header-description`]})}return n})();var Et=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵdir=xt({type:n,selectors:[[`mat-panel-title`]],hostAttrs:[1,`mat-expansion-panel-header-title`]})}return n})();var Pt=(()=>{class n extends nn{_keyManager;_ownHeaders=new Ya;_headers;hideToggle=!1;displayMode=`default`;togglePosition=`after`;ngAfterContentInit(){this._headers.changes.pipe(bs(this._headers)).subscribe(e=>{this._ownHeaders.reset(e.filter(t=>t.panel.accordion===this)),this._ownHeaders.notifyOnChanges()}),this._keyManager=new zS(this._ownHeaders).withWrap().withHomeAndEnd()}_handleHeaderKeydown(e){this._keyManager.onKeydown(e)}_handleHeaderFocus(e){this._keyManager.updateActiveItem(e)}ngOnDestroy(){super.ngOnDestroy(),this._keyManager?.destroy(),this._ownHeaders.destroy()}static ɵfac=(()=>{let e;return function(d){return(e||(e=Ir(n)))(d||n)}})();static ɵdir=xt({type:n,selectors:[[`mat-accordion`]],contentQueries:function(t,d,c){if(t&1&&tM(c,On,5),t&2){let p;Zg(p=qg())&&(d._headers=p)}},hostAttrs:[1,`mat-accordion`],hostVars:2,hostBindings:function(t,d){t&2&&ar(`mat-accordion-multi`,d.multi)},inputs:{hideToggle:[2,`hideToggle`,`hideToggle`,dn$1],displayMode:`displayMode`,togglePosition:`togglePosition`},exportAs:[`matAccordion`],features:[_w([{provide:ae,useExisting:n}]),Kn]})}return n})();var St=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵmod=yt({type:n});static ɵinj=ht({imports:[an,Ec,Or]})}return n})();export{On as a,Ye as c,Mt as i,Et as n,Pt as o,Je as r,St as s,An as t};