import {Z as Zt,U as Ut,Q as Qt,K as Kt$1,W as Wt,V as Vt,X as Xt,$ as $t,q as qt,G as Gt,Y as Yt}from'./chunk-DS3S_hrK.js';import {C,e as yn$1,$ as $e,ac as x1,K as Kt,g as I1,h as Aoe,i as O4e,j as R4e,v as vr,s as bd,z as zr,G as Go,E as Ed,N as mt,P as dt,cD as ac,Q as Ir,bI as Pa,bK as ss,cE as mD,bl as _r,a5 as Dt$1,bn as Zn,cF as sn$1,ai as zb,bp as H,D as rr,a2 as dN,a3 as Om,a4 as Nm,ao as Fr,bH as ji,B as Be,bx as De,V as ot,by as Zo,bA as yt,ar as ge,cG as ei,cH as Cn,Y as Yt$1,bF as vn$1,cI as sc,cJ as pf,cK as jo,_ as Is,a0 as $r,aP as ll,t as Lr,w as wd,bu as Id,bw as bf,ap as Vm,bO as Ge$1,bP as Zr,bQ as b1,cL as jm,cM as ca,bM as FC,bD as Ms,af as Di,ah as Si,cN as tk,n as Rm,bo as Fb,aO as Mb,aQ as Pb,a8 as dW,W as WW,T as Ti,cO as fA,ag as Ii,x as km,a1 as Td,u as Lb,o as iN,a6 as lW,cP as Pr,a7 as Xx,a9 as eA}from'./main.js';function We(n){let a=new Date(n),e=String(a.getHours()).padStart(2,"0"),t=String(a.getMinutes()).padStart(2,"0"),i=String(a.getSeconds()).padStart(2,"0"),l=String(a.getMilliseconds()).padStart(3,"0");return `${e}:${t}:${i}.${l}`}var nn=()=>["expandedDetail"];function tn(n,a){n&1&&(vr(0,"th",13),Ti(1,"Time"),zr());}function an(n,a){if(n&1&&(vr(0,"td",14),Ti(1),zr()),n&2){let e=a.$implicit;Go(),km(e.time);}}function on(n,a){n&1&&(vr(0,"th",13),Ti(1,"Level"),zr());}function rn(n,a){if(n&1&&(vr(0,"td",14)(1,"span",15),Ti(2),zr()()),n&2){let e=a.$implicit;Go(),Td(e.level),Go(),km(e.level);}}function sn(n,a){n&1&&(vr(0,"th",13),Ti(1,"Source"),zr());}function dn(n,a){if(n&1&&(vr(0,"td",14)(1,"span",16),Ti(2),zr()()),n&2){let e=a.$implicit;Go(),Td(e.source),Go(),km(e.source);}}function ln(n,a){n&1&&(vr(0,"th",13),Ti(1,"Message"),zr());}function pn(n,a){if(n&1&&Ti(0),n&2){let e=dW(2).$implicit;Lb(" , Col ",e.column," ");}}function cn(n,a){if(n&1&&(vr(0,"span",19),Ti(1),bd(2,pn,1,1),Ti(3," )"),zr()),n&2){let e=dW().$implicit;Go(),Lb(" (Line ",e.line," "),Go(),Ed(e.column!==void 0?2:-1);}}function mn(n,a){if(n&1){let e=lW();vr(0,"button",21),Rm("click",function(i){Xx(e);let l=dW().$implicit;return dW(2).toggleRow(l),eA(i.stopPropagation())}),vr(1,"mat-icon",22),Ti(2),zr()();}if(n&2){let e=dW().$implicit,t=dW(2);Go(2),km(t.isRowExpanded(e)?"keyboard_arrow_up":"keyboard_arrow_down");}}function gn(n,a){if(n&1&&(vr(0,"td",14)(1,"div",17)(2,"span",18),Ti(3),bd(4,cn,4,2,"span",19),zr(),bd(5,mn,3,1,"button",20),zr()()),n&2){let e=a.$implicit;Go(3),Lb(" ",e.message," "),Go(),Ed(e.line!==void 0?4:-1),Go(),Ed(e.stack||e.snippet?5:-1);}}function un(n,a){if(n&1&&(vr(0,"pre",24),Ti(1),zr()),n&2){let e=dW().$implicit;Go(),km(e.snippet);}}function hn(n,a){if(n&1&&(vr(0,"pre",25),Ti(1),zr()),n&2){let e=dW().$implicit;Go(),km(e.stack);}}function xn(n,a){if(n&1&&(vr(0,"td",14)(1,"div",23),bd(2,un,2,1,"pre",24),bd(3,hn,2,1,"pre",25),zr()()),n&2){let e=a.$implicit,t=dW(2);Lr("colspan",t.columnsToDisplay.length),Go(2),Ed(e.snippet?2:-1),Go(),Ed(e.stack?3:-1);}}function fn(n,a){n&1&&iN(0,"tr",26);}function _n(n,a){if(n&1&&iN(0,"tr",27),n&2){let e=a.dataIndex;Lr("data-row-index",e);}}function bn(n,a){if(n&1&&iN(0,"tr",28),n&2){let e=a.$implicit,t=dW(2);rr("expanded",t.isRowExpanded(e));}}function yn(n,a){if(n&1&&(vr(0,"table",1),Mb(1,3),ll(2,tn,2,0,"th",4)(3,an,2,1,"td",5),Pb(),Mb(4,6),ll(5,on,2,0,"th",4)(6,rn,3,3,"td",5),Pb(),Mb(7,7),ll(8,sn,2,0,"th",4)(9,dn,3,3,"td",5),Pb(),Mb(10,8),ll(11,ln,2,0,"th",4)(12,gn,6,3,"td",5),Pb(),Mb(13,9),ll(14,xn,4,3,"td",5),Pb(),ll(15,fn,1,0,"tr",10)(16,_n,1,1,"tr",11)(17,bn,1,2,"tr",12),zr()),n&2){let e=dW();wd("dataSource",e.errorsLog()),Go(15),wd("matHeaderRowDef",e.columnsToDisplay),Go(),wd("matRowDefColumns",e.columnsToDisplay),Go(),wd("matRowDefColumns",WW(4,nn));}}function vn(n,a){n&1&&(vr(0,"div",2),Ti(1,"No errors captured yet"),zr());}var Ze=class n{errorLogger=C(yn$1);errorsLog=$e([]);columnsToDisplay=["time","level","source","message"];expandedRows=$e(new Set);constructor(){this.errorsLog.set(this.errorLogger.getHistory().map(a=>this.mapToDisplayItem(a)).reverse()),this.errorLogger.errorStream$.pipe(x1()).subscribe(a=>{let e=this.mapToDisplayItem(a);this.errorsLog.update(t=>{let i=[e,...t];return i.length>100&&(i.length=100),i});});}mapToDisplayItem(a){return {id:a.id,time:We(a.timestamp),source:a.sourceTag,level:a.level,message:a.message,line:a.line,column:a.column,stack:a.stack,snippet:a.snippet}}toggleRow(a){this.expandedRows.update(e=>{let t=new Set(e);return t.has(a.id)?t.delete(a.id):t.add(a.id),t});}isRowExpanded(a){return this.expandedRows().has(a.id)}clearLogs(){this.errorLogger.clear(),this.errorsLog.set([]),this.expandedRows.set(new Set);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=Kt({type:n,selectors:[["a2ui-composer-errors"]],decls:3,vars:1,consts:[[1,"errors-container"],["mat-table","","multiTemplateDataRows","",1,"mat-elevation-z1",3,"dataSource"],[1,"errors-placeholder"],["matColumnDef","time"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","level"],["matColumnDef","source"],["matColumnDef","message"],["matColumnDef","expandedDetail"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","","class","element-row",4,"matRowDef","matRowDefColumns"],["mat-row","","class","detail-row",3,"expanded",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],[1,"level-badge"],[1,"source-badge"],[1,"message-cell"],[1,"error-message-text"],[1,"line-col"],["mat-icon-button","","aria-label","Toggle Details"],["mat-icon-button","","aria-label","Toggle Details",3,"click"],["aria-hidden","true"],[1,"element-detail"],[1,"snippet-preview"],[1,"stack-preview"],["mat-header-row",""],["mat-row","",1,"element-row"],["mat-row","",1,"detail-row"]],template:function(e,t){e&1&&(vr(0,"div",0),bd(1,yn,18,5,"table",1)(2,vn,2,0,"div",2),zr()),e&2&&(Go(),Ed(t.errorsLog().length>0?1:2));},dependencies:[Zt,Ut,Qt,Kt$1,Wt,Vt,Xt,$t,qt,Gt,Yt,I1,Aoe,O4e,R4e],styles:["[_nghost-%COMP%]{display:block;height:100%;width:100%}.errors-container[_ngcontent-%COMP%]{height:100%;width:100%;overflow:auto;box-sizing:border-box;padding:2px 0 2px 8px}.errors-placeholder[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mat-sys-on-surface-variant);font-size:14px}table[_ngcontent-%COMP%]{width:100%;background:var(--mat-sys-surface);border-radius:6px;overflow:hidden}table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{font-weight:700;color:var(--mat-sys-on-surface-variant);font-size:12px}table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface);vertical-align:middle}table[_ngcontent-%COMP%]   .source-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}table[_ngcontent-%COMP%]   .source-badge.exception[_ngcontent-%COMP%]{background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container)}table[_ngcontent-%COMP%]   .source-badge.console[_ngcontent-%COMP%]{background-color:var(--mat-sys-tertiary-container);color:var(--mat-sys-on-tertiary-container)}table[_ngcontent-%COMP%]   .source-badge.validation[_ngcontent-%COMP%]{background-color:var(--app-success-container, #e6f4ea);color:var(--app-on-success-container, #137333)}table[_ngcontent-%COMP%]   .level-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}table[_ngcontent-%COMP%]   .level-badge.error[_ngcontent-%COMP%]{background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container)}table[_ngcontent-%COMP%]   .level-badge.warn[_ngcontent-%COMP%]{background-color:var(--mat-sys-tertiary-container);color:var(--mat-sys-on-tertiary-container)}table[_ngcontent-%COMP%]   .level-badge.info[_ngcontent-%COMP%]{background-color:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container)}table[_ngcontent-%COMP%]   .level-badge.debug[_ngcontent-%COMP%], table[_ngcontent-%COMP%]   .level-badge.log[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface-variant)}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   .error-message-text[_ngcontent-%COMP%]{flex:1;white-space:normal;word-break:break-word}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{width:28px;height:28px;line-height:28px}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]     .mat-mdc-button-touch-target{display:none}table[_ngcontent-%COMP%]   .message-cell[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:18px;width:18px;height:18px}table[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]{height:0;display:none}table[_ngcontent-%COMP%]   .detail-row.expanded[_ngcontent-%COMP%]{display:table-row;height:auto}table[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{border-bottom-width:0;padding:0}table[_ngcontent-%COMP%]   .element-detail[_ngcontent-%COMP%]{overflow:hidden;box-sizing:border-box;background:var(--mat-sys-surface-container-lowest)}table[_ngcontent-%COMP%]   .element-detail[_ngcontent-%COMP%]   pre.stack-preview[_ngcontent-%COMP%]{margin:8px;font-family:monospace;font-size:11px;white-space:pre-wrap;word-break:break-all;color:var(--mat-sys-error);padding:8px;border-left:3px solid var(--mat-sys-error);background:color-mix(in srgb,var(--mat-sys-error) 6%,transparent);border-radius:0 4px 4px 0}"]})};var Y=new H("CdkAccordion"),Xe=(()=>{class n{_stateChanges=new ge;_openCloseAllActions=new ge;id=C(ei).getId("cdk-accordion-");multi=false;openAll(){this.multi&&this._openCloseAllActions.next(true);}closeAll(){this._openCloseAllActions.next(false);}ngOnChanges(e){this._stateChanges.next(e);}ngOnDestroy(){this._stateChanges.complete(),this._openCloseAllActions.complete();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=Dt$1({type:n,selectors:[["cdk-accordion"],["","cdkAccordion",""]],inputs:{multi:[2,"multi","multi",sn$1]},exportAs:["cdkAccordion"],features:[zb([{provide:Y,useExisting:n}]),jo]})}return n})(),Ge=(()=>{class n{accordion=C(Y,{optional:true,skipSelf:true});_changeDetectorRef=C(Vm);_expansionDispatcher=C(Cn);_openCloseAllSubscription=Ge$1.EMPTY;closed=new yt;opened=new yt;destroyed=new yt;expandedChange=new yt;id=C(ei).getId("cdk-accordion-child-");get expanded(){return this._expanded}set expanded(e){if(this._expanded!==e){if(this._expanded=e,this.expandedChange.emit(e),e){this.opened.emit();let t=this.accordion?this.accordion.id:this.id;this._expansionDispatcher.notify(this.id,t);}else this.closed.emit();this._changeDetectorRef.markForCheck();}}_expanded=false;get disabled(){return this._disabled()}set disabled(e){this._disabled.set(e);}_disabled=$e(false);_removeUniqueSelectionListener=()=>{};ngOnInit(){this._removeUniqueSelectionListener=this._expansionDispatcher.listen((e,t)=>{this.accordion&&!this.accordion.multi&&this.accordion.id===t&&this.id!==e&&(this.expanded=false);}),this.accordion&&(this._openCloseAllSubscription=this._subscribeToOpenCloseAllActions());}ngOnDestroy(){this.opened.complete(),this.closed.complete(),this.destroyed.emit(),this.destroyed.complete(),this._removeUniqueSelectionListener(),this._openCloseAllSubscription.unsubscribe();}toggle(){this.disabled||(this.expanded=!this.expanded);}close(){this.disabled||(this.expanded=false);}open(){this.disabled||(this.expanded=true);}_subscribeToOpenCloseAllActions(){return this.accordion._openCloseAllActions.subscribe(e=>{this.disabled||(this.expanded=e);})}static \u0275fac=function(t){return new(t||n)};static \u0275dir=Dt$1({type:n,selectors:[["cdk-accordion-item"],["","cdkAccordionItem",""]],inputs:{expanded:[2,"expanded","expanded",sn$1],disabled:[2,"disabled","disabled",sn$1]},outputs:{closed:"closed",opened:"opened",destroyed:"destroyed",expandedChange:"expandedChange"},exportAs:["cdkAccordionItem"],features:[zb([{provide:Y,useValue:void 0}])]})}return n})(),Ye=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=mt({type:n});static \u0275inj=dt({})}return n})();var Mn=["body"],En=["bodyWrapper"],Pn=[[["mat-expansion-panel-header"]],"*",[["mat-action-row"]]],Dn=["mat-expansion-panel-header","*","mat-action-row"];function On(n,a){}var Tn=[[["mat-panel-title"]],[["mat-panel-description"]],"*"],kn=["mat-panel-title","mat-panel-description","*"];function Sn(n,a){n&1&&(Di(0,"span",1),fA(),Di(1,"svg",2),Ii(2,"path",3),Si()());}var J=new H("MAT_ACCORDION"),Je=new H("MAT_EXPANSION_PANEL"),An=(()=>{class n{_template=C(Pr);_expansionPanel=C(Je,{optional:true});static \u0275fac=function(t){return new(t||n)};static \u0275dir=Dt$1({type:n,selectors:[["ng-template","matExpansionPanelContent",""]]})}return n})(),en=new H("MAT_EXPANSION_PANEL_DEFAULT_OPTIONS"),In=(()=>{class n extends Ge{_viewContainerRef=C(Fr);_animationsDisabled=ji();_document=C(Be);_ngZone=C(De);_elementRef=C(ot);_renderer=C(Zo);_cleanupTransitionEnd;get hideToggle(){return this._hideToggle||this.accordion&&this.accordion.hideToggle}set hideToggle(e){this._hideToggle=e;}_hideToggle=false;get togglePosition(){return this._togglePosition||this.accordion&&this.accordion.togglePosition}set togglePosition(e){this._togglePosition=e;}_togglePosition;afterExpand=new yt;afterCollapse=new yt;_inputChanges=new ge;accordion=C(J,{optional:true,skipSelf:true});_lazyContent;_body;_bodyWrapper;_portal;_headerId=C(ei).getId("mat-expansion-panel-header-");constructor(){super();let e=C(en,{optional:true});this._expansionDispatcher=C(Cn),e&&(this.hideToggle=e.hideToggle);}_hasSpacing(){return this.accordion?this.expanded&&this.accordion.displayMode==="default":false}_getExpandedState(){return this.expanded?"expanded":"collapsed"}toggle(){this.expanded=!this.expanded;}close(){this.expanded=false;}open(){this.expanded=true;}ngAfterContentInit(){this._lazyContent&&this._lazyContent._expansionPanel===this&&this.opened.pipe(ss(null),Yt$1(()=>this.expanded&&!this._portal),vn$1(1)).subscribe(()=>{this._portal=new sc(this._lazyContent._template,this._viewContainerRef);}),this._setupAnimationEvents();}ngOnChanges(e){this._inputChanges.next(e);}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTransitionEnd?.(),this._inputChanges.complete();}_containsFocus(){if(this._body){let e=this._document.activeElement,t=this._body.nativeElement;return e===t||t.contains(e)}return  false}_transitionEndListener=({target:e,propertyName:t})=>{e===this._bodyWrapper?.nativeElement&&t==="grid-template-rows"&&this._ngZone.run(()=>{this.expanded?this.afterExpand.emit():this.afterCollapse.emit();});};_setupAnimationEvents(){this._ngZone.runOutsideAngular(()=>{this._animationsDisabled?(this.opened.subscribe(()=>this._ngZone.run(()=>this.afterExpand.emit())),this.closed.subscribe(()=>this._ngZone.run(()=>this.afterCollapse.emit()))):setTimeout(()=>{let e=this._elementRef.nativeElement;this._cleanupTransitionEnd=this._renderer.listen(e,"transitionend",this._transitionEndListener),e.classList.add("mat-expansion-panel-animations-enabled");},200);});}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=Kt({type:n,selectors:[["mat-expansion-panel"]],contentQueries:function(t,i,l){if(t&1&&dN(l,An,5),t&2){let c;Om(c=Nm())&&(i._lazyContent=c.first);}},viewQuery:function(t,i){if(t&1&&Id(Mn,5)(En,5),t&2){let l;Om(l=Nm())&&(i._body=l.first),Om(l=Nm())&&(i._bodyWrapper=l.first);}},hostAttrs:[1,"mat-expansion-panel"],hostVars:4,hostBindings:function(t,i){t&2&&rr("mat-expanded",i.expanded)("mat-expansion-panel-spacing",i._hasSpacing());},inputs:{hideToggle:[2,"hideToggle","hideToggle",sn$1],togglePosition:"togglePosition"},outputs:{afterExpand:"afterExpand",afterCollapse:"afterCollapse"},exportAs:["matExpansionPanel"],features:[zb([{provide:J,useValue:void 0},{provide:Je,useExisting:n}]),Zn,jo],ngContentSelectors:Dn,decls:9,vars:4,consts:[["bodyWrapper",""],["body",""],[1,"mat-expansion-panel-content-wrapper"],["role","region",1,"mat-expansion-panel-content",3,"id"],[1,"mat-expansion-panel-body"],[3,"cdkPortalOutlet"]],template:function(t,i){t&1&&(Is(Pn),$r(0),vr(1,"div",2,0)(3,"div",3,1)(5,"div",4),$r(6,1),ll(7,On,0,0,"ng-template",5),zr(),$r(8,2),zr()()),t&2&&(Go(),Lr("inert",i.expanded?null:""),Go(2),wd("id",i.id),Lr("aria-labelledby",i._headerId),Go(4),wd("cdkPortalOutlet",i._portal));},dependencies:[pf],styles:[`.mat-expansion-panel {
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
`],encapsulation:2})}return n})();var Hn=(()=>{class n{panel=C(In,{host:true});_element=C(ot);_focusMonitor=C(bf);_changeDetectorRef=C(Vm);_parentChangeSubscription=Ge$1.EMPTY;constructor(){C(Zr).load(b1);let e=this.panel,t=C(en,{optional:true}),i=C(new jm("tabindex"),{optional:true}),l=e.accordion?e.accordion._stateChanges.pipe(Yt$1(c=>!!(c.hideToggle||c.togglePosition))):ca;this.tabIndex=parseInt(i||"")||0,this._parentChangeSubscription=FC(e.opened,e.closed,l,e._inputChanges.pipe(Yt$1(c=>!!(c.hideToggle||c.disabled||c.togglePosition)))).subscribe(()=>this._changeDetectorRef.markForCheck()),e.closed.pipe(Yt$1(()=>e._containsFocus())).subscribe(()=>this._focusMonitor.focusVia(this._element,"program")),t&&(this.expandedHeight=t.expandedHeight,this.collapsedHeight=t.collapsedHeight);}expandedHeight;collapsedHeight;tabIndex=0;get disabled(){return this.panel.disabled}_toggle(){this.disabled||this.panel.toggle();}_isExpanded(){return this.panel.expanded}_getExpandedState(){return this.panel._getExpandedState()}_getPanelId(){return this.panel.id}_getTogglePosition(){return this.panel.togglePosition}_showToggle(){return !this.panel.hideToggle&&!this.panel.disabled}_getHeaderHeight(){let e=this._isExpanded();return e&&this.expandedHeight?this.expandedHeight:!e&&this.collapsedHeight?this.collapsedHeight:null}_keydown(e){switch(e.keyCode){case 32:case 13:Ms(e)||(e.preventDefault(),this._toggle());break;default:this.panel.accordion&&this.panel.accordion._handleHeaderKeydown(e);return}}focus(e,t){e?this._focusMonitor.focusVia(this._element,e,t):this._element.nativeElement.focus(t);}ngAfterViewInit(){this._focusMonitor.monitor(this._element).subscribe(e=>{e&&this.panel.accordion&&this.panel.accordion._handleHeaderFocus(this);});}ngOnDestroy(){this._parentChangeSubscription.unsubscribe(),this._focusMonitor.stopMonitoring(this._element);}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=Kt({type:n,selectors:[["mat-expansion-panel-header"]],hostAttrs:["role","button",1,"mat-expansion-panel-header","mat-focus-indicator"],hostVars:13,hostBindings:function(t,i){t&1&&Rm("click",function(){return i._toggle()})("keydown",function(c){return i._keydown(c)}),t&2&&(Lr("id",i.panel._headerId)("tabindex",i.disabled?-1:i.tabIndex)("aria-controls",i._getPanelId())("aria-expanded",i._isExpanded())("aria-disabled",i.panel.disabled),Fb("height",i._getHeaderHeight()),rr("mat-expanded",i._isExpanded())("mat-expansion-toggle-indicator-after",i._getTogglePosition()==="after")("mat-expansion-toggle-indicator-before",i._getTogglePosition()==="before"));},inputs:{expandedHeight:"expandedHeight",collapsedHeight:"collapsedHeight",tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:tk(e)]},ngContentSelectors:kn,decls:5,vars:3,consts:[[1,"mat-content"],[1,"mat-expansion-indicator"],["xmlns","http://www.w3.org/2000/svg","viewBox","0 -960 960 960","aria-hidden","true","focusable","false"],["d","M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"]],template:function(t,i){t&1&&(Is(Tn),Di(0,"span",0),$r(1),$r(2,1),$r(3,2),Si(),bd(4,Sn,3,0,"span",1)),t&2&&(rr("mat-content-hide-toggle",!i._showToggle()),Go(4),Ed(i._showToggle()?4:-1));},styles:[`.mat-expansion-panel-header {
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
`],encapsulation:2})}return n})(),Pt=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275dir=Dt$1({type:n,selectors:[["mat-panel-description"]],hostAttrs:[1,"mat-expansion-panel-header-description"]})}return n})(),Dt=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275dir=Dt$1({type:n,selectors:[["mat-panel-title"]],hostAttrs:[1,"mat-expansion-panel-header-title"]})}return n})(),Ot=(()=>{class n extends Xe{_keyManager;_ownHeaders=new Pa;_headers;hideToggle=false;displayMode="default";togglePosition="after";ngAfterContentInit(){this._headers.changes.pipe(ss(this._headers)).subscribe(e=>{this._ownHeaders.reset(e.filter(t=>t.panel.accordion===this)),this._ownHeaders.notifyOnChanges();}),this._keyManager=new mD(this._ownHeaders).withWrap().withHomeAndEnd();}_handleHeaderKeydown(e){this._keyManager.onKeydown(e);}_handleHeaderFocus(e){this._keyManager.updateActiveItem(e);}ngOnDestroy(){super.ngOnDestroy(),this._keyManager?.destroy(),this._ownHeaders.destroy();}static \u0275fac=(()=>{let e;return function(i){return (e||(e=_r(n)))(i||n)}})();static \u0275dir=Dt$1({type:n,selectors:[["mat-accordion"]],contentQueries:function(t,i,l){if(t&1&&dN(l,Hn,5),t&2){let c;Om(c=Nm())&&(i._headers=c);}},hostAttrs:[1,"mat-accordion"],hostVars:2,hostBindings:function(t,i){t&2&&rr("mat-accordion-multi",i.multi);},inputs:{hideToggle:[2,"hideToggle","hideToggle",sn$1],displayMode:"displayMode",togglePosition:"togglePosition"},exportAs:["matAccordion"],features:[zb([{provide:J,useExisting:n}]),Zn]})}return n})(),Tt=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=mt({type:n});static \u0275inj=dt({imports:[Ye,ac,Ir]})}return n})();export{Dt as D,Hn as H,In as I,Ot as O,Pt as P,Tt as T,We as W,Ze as Z};