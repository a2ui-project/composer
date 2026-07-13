import {n as no,A as Ae}from'./chunk-DYz_NQQ6.js';import {G as Gw,g,m as ms,y as ys,W,J as Jd,h as hI,e as er,x as xn,q as qI,z as zi,a as qh,T as Tw,O as Ou,H as Hh,V as VD,b as Vh,j as ju,B as Bh,u as ug,N,o as os,D as Dr,Y as Yn,K as KI,X as XI,c as hw,r as rg,Q as Qh,d as ew,t as tw,_ as _u,R as Rd,f as rw,i as Od}from'./main.js';import {M as Me,W as Wt,C as Ce,A as At,l as li,d as di,s as si}from'./chunk-DaUoXqQJ.js';import'./chunk-5cQmHzcT.js';import {o as oo,Y as Yt,w as wd,E as Ed,U as Uo,G as Gd,H as Hd,R,S as Se}from'./chunk-cmPPiF6x.js';var dt=["*",[["mat-toolbar-row"]]],pt=["*","mat-toolbar-row"],ft=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275dir=_u({type:e,selectors:[["mat-toolbar-row"]],hostAttrs:[1,"mat-toolbar-row"],exportAs:["matToolbarRow"]})}return e})(),st=(()=>{class e{_elementRef=g(Yn);_platform=g(R);_document=g(W);color;_toolbarRows;ngAfterViewInit(){this._platform.isBrowser&&(this._checkToolbarMixedModes(),this._toolbarRows.changes.subscribe(()=>this._checkToolbarMixedModes()));}_checkToolbarMixedModes(){this._toolbarRows.length;}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=hI({type:e,selectors:[["mat-toolbar"]],contentQueries:function(t,i,c){if(t&1&&Qh(c,ft,5),t&2){let d;ew(d=tw())&&(i._toolbarRows=d);}},hostAttrs:[1,"mat-toolbar"],hostVars:6,hostBindings:function(t,i){t&2&&(hw(i.color?"mat-"+i.color:""),rg("mat-toolbar-multiple-rows",i._toolbarRows.length>0)("mat-toolbar-single-row",i._toolbarRows.length===0));},inputs:{color:"color"},exportAs:["matToolbar"],ngContentSelectors:pt,decls:2,vars:0,template:function(t,i){t&1&&(KI(dt),XI(0),XI(1,1));},styles:[`.mat-toolbar {
  background: var(--mat-toolbar-container-background-color, var(--mat-sys-surface));
  color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
}
.mat-toolbar, .mat-toolbar h1, .mat-toolbar h2, .mat-toolbar h3, .mat-toolbar h4, .mat-toolbar h5, .mat-toolbar h6 {
  font-family: var(--mat-toolbar-title-text-font, var(--mat-sys-title-large-font));
  font-size: var(--mat-toolbar-title-text-size, var(--mat-sys-title-large-size));
  line-height: var(--mat-toolbar-title-text-line-height, var(--mat-sys-title-large-line-height));
  font-weight: var(--mat-toolbar-title-text-weight, var(--mat-sys-title-large-weight));
  letter-spacing: var(--mat-toolbar-title-text-tracking, var(--mat-sys-title-large-tracking));
  margin: 0;
}
@media (forced-colors: active) {
  .mat-toolbar {
    outline: solid 1px;
  }
}
.mat-toolbar .mat-form-field-underline,
.mat-toolbar .mat-form-field-ripple,
.mat-toolbar .mat-focused .mat-form-field-ripple {
  background-color: currentColor;
}
.mat-toolbar .mat-form-field-label,
.mat-toolbar .mat-focused .mat-form-field-label,
.mat-toolbar .mat-select-value,
.mat-toolbar .mat-select-arrow,
.mat-toolbar .mat-form-field.mat-focused .mat-select-arrow {
  color: inherit;
}
.mat-toolbar .mat-input-element {
  caret-color: currentColor;
}
.mat-toolbar .mat-mdc-button-base.mat-mdc-button-base.mat-unthemed {
  --mat-button-text-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
  --mat-button-outlined-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
}

.mat-toolbar-row, .mat-toolbar-single-row {
  display: flex;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  height: var(--mat-toolbar-standard-height, 64px);
}
@media (max-width: 599px) {
  .mat-toolbar-row, .mat-toolbar-single-row {
    height: var(--mat-toolbar-mobile-height, 56px);
  }
}

.mat-toolbar-multiple-rows {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  min-height: var(--mat-toolbar-standard-height, 64px);
}
@media (max-width: 599px) {
  .mat-toolbar-multiple-rows {
    min-height: var(--mat-toolbar-mobile-height, 56px);
  }
}
`],encapsulation:2})}return e})();var mt=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275mod=os({type:e});static \u0275inj=Dr({imports:[Se]})}return e})();var u=class e{storage=null;constructor(){try{typeof window<"u"&&window.sessionStorage&&(this.storage=window.sessionStorage);}catch(r){console.warn("Failed to access window.sessionStorage safely in environment:",r),this.storage=null;}}getItem(r){if(!this.storage)return null;try{return this.storage.getItem(r)}catch(o){return console.warn(`Failed to read key "${r}" from sessionStorage safely:`,o),null}}setItem(r,o){if(this.storage)try{this.storage.setItem(r,o);}catch(t){console.warn(`Failed to write key "${r}" to sessionStorage safely:`,t);}}removeItem(r){if(this.storage)try{this.storage.removeItem(r);}catch(o){console.warn(`Failed to remove key "${r}" from sessionStorage safely:`,o);}}clear(){if(this.storage)try{this.storage.clear();}catch(r){console.warn("Failed to clear sessionStorage safely:",r);}}static \u0275fac=function(o){return new(o||e)};static \u0275prov=N({token:e,factory:e.\u0275fac,providedIn:"root"})};var ct=class e{isDarkTheme=Gw(()=>this.configProvider.themePreference()==="dark");catalogManagement=g(oo);indexedDbStorage=g(Yt);storage=g(ms);sessionStorage=g(u);configProvider=g(ys);document=g(W);activeCatalogTitle=this.catalogManagement.activeCatalogTitle;activeCatalogDescription=this.catalogManagement.activeCatalogDescription;constructor(){Jd(()=>{this.isDarkTheme()?this.document.body.classList.add("dark-theme"):this.document.body.classList.remove("dark-theme");});}toggleTheme(){this.configProvider.setThemePreference(this.isDarkTheme()?"light":"dark");}async resetSession(){await this.indexedDbStorage.flushAllRecords(),this.storage.removeItem("a2ui_composer_session_state"),this.storage.removeItem("a2ui_composer_editor_cache"),this.sessionStorage.clear(),this.document.defaultView&&this.document.defaultView.location.reload(),console.log("Session state cleared.");}static \u0275fac=function(o){return new(o||e)};static \u0275cmp=hI({type:e,selectors:[["a2ui-composer-shell"]],decls:24,vars:4,consts:[["sidenav",""],[1,"composer-header"],["mat-icon-button","","aria-label","Toggle sidenav",1,"hamburger-button",3,"click"],["aria-hidden","true"],[1,"header-title",3,"matTooltip"],[1,"spacer"],["mat-button","","color","primary",1,"reset-session-button",3,"click"],["mat-icon-button","","color","primary",1,"theme-toggle-button",3,"click"],[1,"composer-sidenav-container"],["mode","side","opened","",1,"composer-sidenav"],["mat-list-item","","routerLink","/"],["mat-list-item","","routerLink","/gallery"],["mat-list-item","","routerLink","/settings"],[1,"composer-content"]],template:function(o,t){if(o&1){let i=qI();zi(0,"mat-toolbar",1)(1,"button",2),qh("click",function(){Rd(i);let d=rw(14);return Od(d.toggle())}),zi(2,"mat-icon",3),Tw(3,"menu"),Ou()(),zi(4,"span",4),Tw(5),Ou(),Hh(6,"span",5),zi(7,"button",6),qh("click",function(){return t.resetSession()}),Tw(8," New Session "),Ou(),zi(9,"button",7),qh("click",function(){return t.toggleTheme()}),zi(10,"mat-icon",3),Tw(11),Ou()()(),zi(12,"mat-sidenav-container",8)(13,"mat-sidenav",9,0)(15,"mat-nav-list")(16,"a",10),Tw(17,"Composer Workspace"),Ou(),zi(18,"a",11),Tw(19,"Components Gallery"),Ou(),zi(20,"a",12),Tw(21,"Settings"),Ou()()(),zi(22,"mat-sidenav-content",13),Hh(23,"router-outlet"),Ou()();}o&2&&(VD(4),Vh("matTooltip",t.activeCatalogDescription()||""),VD(),ju("A2UI Composer",t.activeCatalogTitle()?" - "+t.activeCatalogTitle():""),VD(4),Bh("aria-label",t.isDarkTheme()?"Switch to light theme":"Switch to dark theme"),VD(2),ug(t.isDarkTheme()?"light_mode":"dark_mode"));},dependencies:[mt,st,Me,Wt,Ce,At,wd,Ed,Uo,Gd,Hd,li,di,si,er,xn,no,Ae],styles:["[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%}.composer-header[_ngcontent-%COMP%]{position:relative;z-index:2;flex-shrink:0;background-color:var(--mat-sys-surface-container);color:var(--mat-sys-on-surface);border-bottom:1px solid var(--mat-sys-outline-variant);--mat-toolbar-container-background-color: var(--mat-sys-surface-container);--mat-toolbar-container-text-color: var(--mat-sys-on-surface)}.spacer[_ngcontent-%COMP%]{flex:1 1 auto}.composer-sidenav-container[_ngcontent-%COMP%]{flex:1;min-height:0}.composer-sidenav[_ngcontent-%COMP%]{width:250px;background-color:var(--mat-sys-surface-container);border-right:1px solid var(--mat-sys-outline-variant);--mat-sidenav-container-shape: 0px;--mat-drawer-container-shape: 0px;border-radius:0;--mat-sidenav-background-color: var(--mat-sys-surface-container)}.composer-sidenav[_ngcontent-%COMP%]     .mat-drawer-inner-container{border-radius:0}.composer-content[_ngcontent-%COMP%]{padding:0;box-sizing:border-box;height:100%}.hamburger-button[_ngcontent-%COMP%]{margin-right:8px}.theme-toggle-button[_ngcontent-%COMP%]{margin-left:8px}"]})};export{ct as ComposerShell};