import {y as ye,Z as Zu,C as Cs,g,w as ws,u as uo$1,W,l as lf,_ as _I,s as sr,N as Nt,a as Co,K as Ki,J as Jh,j as jw,H as Hu,q as qh,b as ZI,c as ZD,z as zh,d as Wh,e as Wu,h as hg,f as cg,i as Ww,Y as YI,M,k as us,D as Dr,m as Zn,n as lw,o as dw,S as Sw,t as tg,p as pw,r as hw,v as ku}from'./main.js';import {M as Me,W as Wt,C as Ce,A as At,c as ci,s as si,r as ri,n as ne}from'./chunk-CkgSrw5d.js';import {Y as Yt,m as mt}from'./chunk-BYP8C5WL.js';import'./chunk-w-8ePJnK.js';import'./chunk-DtdOpY6D.js';import {u as uo,X as Xt,N as Nd,M as Md,q as qo,J as Jd,a as Xd,D,b as X}from'./chunk-BbXoP_s2.js';var ut=["*",[["mat-toolbar-row"]]],ft=["*","mat-toolbar-row"],ht=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275dir=ku({type:e,selectors:[["mat-toolbar-row"]],hostAttrs:[1,"mat-toolbar-row"],exportAs:["matToolbarRow"]})}return e})(),ct=(()=>{class e{_elementRef=g(Zn);_platform=g(D);_document=g(W);color;_toolbarRows;ngAfterViewInit(){this._platform.isBrowser&&(this._checkToolbarMixedModes(),this._toolbarRows.changes.subscribe(()=>this._checkToolbarMixedModes()));}_checkToolbarMixedModes(){this._toolbarRows.length;}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=_I({type:e,selectors:[["mat-toolbar"]],contentQueries:function(t,r,gt){if(t&1&&tg(gt,ht,5),t&2){let _;pw(_=hw())&&(r._toolbarRows=_);}},hostAttrs:[1,"mat-toolbar"],hostVars:6,hostBindings:function(t,r){t&2&&(Sw(r.color?"mat-"+r.color:""),cg("mat-toolbar-multiple-rows",r._toolbarRows.length>0)("mat-toolbar-single-row",r._toolbarRows.length===0));},inputs:{color:"color"},exportAs:["matToolbar"],ngContentSelectors:ft,decls:2,vars:0,template:function(t,r){t&1&&(lw(ut),dw(0),dw(1,1));},styles:[`.mat-toolbar {
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
`],encapsulation:2})}return e})();var dt=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275mod=us({type:e});static \u0275inj=Dr({imports:[X]})}return e})();var v=class e{storage=null;constructor(){try{typeof window<"u"&&window.sessionStorage&&(this.storage=window.sessionStorage);}catch(o){console.warn("Failed to access window.sessionStorage safely in environment:",o),this.storage=null;}}getItem(o){if(!this.storage)return null;try{return this.storage.getItem(o)}catch(a){return console.warn(`Failed to read key "${o}" from sessionStorage safely:`,a),null}}setItem(o,a){if(this.storage)try{this.storage.setItem(o,a);}catch(t){console.warn(`Failed to write key "${o}" to sessionStorage safely:`,t);}}removeItem(o){if(this.storage)try{this.storage.removeItem(o);}catch(a){console.warn(`Failed to remove key "${o}" from sessionStorage safely:`,a);}}clear(){if(this.storage)try{this.storage.clear();}catch(o){console.warn("Failed to clear sessionStorage safely:",o);}}static \u0275fac=function(a){return new(a||e)};static \u0275prov=M({token:e,factory:e.\u0275fac,providedIn:"root"})};var vt=()=>({exact:true});function Ct(e,o){e&1&&(Ki(0,"span",12),jw(1,"Composer Workspace"),Hu());}function yt(e,o){e&1&&(Ki(0,"span",12),jw(1,"Components Gallery"),Hu());}function Mt(e,o){e&1&&(Ki(0,"span",12),jw(1,"Settings"),Hu());}var pt=class e{isCollapsed=ye(true);isDarkTheme=Zu(()=>this.configProvider.themePreference()===Cs.DARK);catalogManagement=g(uo);indexedDbStorage=g(Xt);storage=g(ws);sessionStorage=g(v);configProvider=g(uo$1);document=g(W);activeCatalogTitle=this.catalogManagement.activeCatalogTitle;activeCatalogDescription=this.catalogManagement.activeCatalogDescription;constructor(){lf(()=>{this.isDarkTheme()?this.document.body.classList.add("dark-theme"):this.document.body.classList.remove("dark-theme");});}toggleCollapsed(){this.isCollapsed.update(o=>!o);}ensureCollapsed(){this.isCollapsed.set(true);}toggleTheme(){this.configProvider.setThemePreference(this.isDarkTheme()?Cs.LIGHT:Cs.DARK);}async resetSession(){await this.indexedDbStorage.flushAllRecords(),this.storage.removeItem("a2ui_composer_session_state"),this.storage.removeItem("a2ui_composer_editor_cache"),this.sessionStorage.clear(),this.document.defaultView&&this.document.defaultView.location.reload(),console.log("Session state cleared.");}static \u0275fac=function(a){return new(a||e)};static \u0275cmp=_I({type:e,selectors:[["a2ui-composer-shell"]],decls:30,vars:16,consts:[["sidenav",""],[1,"composer-header"],["mat-icon-button","","aria-label","Toggle sidenav","aria-controls","composer-sidenav",1,"hamburger-button",3,"click"],["aria-hidden","true"],[1,"header-title",3,"matTooltip"],[1,"spacer"],["mat-button","","color","primary",1,"reset-session-button",3,"click"],["mat-icon-button","","color","primary",1,"theme-toggle-button",3,"click"],[1,"composer-sidenav-container"],["id","composer-sidenav","mode","side",1,"composer-sidenav",3,"opened"],["mat-list-item","","routerLink","/","routerLinkActive","active-nav-item","aria-label","Composer Workspace","matTooltip","Composer Workspace","matTooltipPosition","right",3,"click","routerLinkActiveOptions","matTooltipDisabled"],["matListItemIcon","","aria-hidden","true"],[1,"nav-label"],["mat-list-item","","routerLink","/gallery","routerLinkActive","active-nav-item","aria-label","Components Gallery","matTooltip","Components Gallery","matTooltipPosition","right",3,"click","matTooltipDisabled"],["mat-list-item","","routerLink","/settings","routerLinkActive","active-nav-item","aria-label","Settings","matTooltip","Settings","matTooltipPosition","right",3,"click","matTooltipDisabled"],[1,"composer-content"]],template:function(a,t){a&1&&(Ki(0,"mat-toolbar",1)(1,"button",2),Jh("click",function(){return t.toggleCollapsed()}),Ki(2,"mat-icon",3),jw(3,"menu"),Hu()(),Ki(4,"span",4),jw(5),Hu(),qh(6,"span",5),Ki(7,"button",6),Jh("click",function(){return t.resetSession()}),jw(8," New Session "),Hu(),Ki(9,"button",7),Jh("click",function(){return t.toggleTheme()}),Ki(10,"mat-icon",3),jw(11),Hu()()(),Ki(12,"mat-sidenav-container",8)(13,"mat-sidenav",9,0)(15,"mat-nav-list")(16,"a",10),Jh("click",function(){return t.ensureCollapsed()}),Ki(17,"mat-icon",11),jw(18,"construction"),Hu(),ZI(19,Ct,2,0,"span",12),Hu(),Ki(20,"a",13),Jh("click",function(){return t.ensureCollapsed()}),Ki(21,"mat-icon",11),jw(22,"widgets"),Hu(),ZI(23,yt,2,0,"span",12),Hu(),Ki(24,"a",14),Jh("click",function(){return t.ensureCollapsed()}),Ki(25,"mat-icon",11),jw(26,"settings"),Hu(),ZI(27,Mt,2,0,"span",12),Hu()()(),Ki(28,"mat-sidenav-content",15),qh(29,"router-outlet"),Hu()()),a&2&&(ZD(),zh("aria-expanded",!t.isCollapsed()),ZD(3),Wh("matTooltip",t.activeCatalogDescription()||""),ZD(),Wu("A2UI Composer",t.activeCatalogTitle()?" - "+t.activeCatalogTitle():""),ZD(4),zh("aria-label",t.isDarkTheme()?"Switch to light theme":"Switch to dark theme"),ZD(2),hg(t.isDarkTheme()?"light_mode":"dark_mode"),ZD(2),cg("collapsed",t.isCollapsed()),Wh("opened",true),ZD(3),Wh("routerLinkActiveOptions",Ww(15,vt))("matTooltipDisabled",!t.isCollapsed()),ZD(3),YI(t.isCollapsed()?-1:19),ZD(),Wh("matTooltipDisabled",!t.isCollapsed()),ZD(3),YI(t.isCollapsed()?-1:23),ZD(),Wh("matTooltipDisabled",!t.isCollapsed()),ZD(3),YI(t.isCollapsed()?-1:27));},dependencies:[dt,ct,Me,Wt,Ce,At,Nd,Md,qo,Jd,Xd,ci,si,ri,ne,sr,Nt,Co,Yt,mt],styles:["[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;overflow:hidden}.composer-header[_ngcontent-%COMP%]{position:relative;z-index:2;flex-shrink:0;background-color:var(--mat-sys-surface-container);color:var(--mat-sys-on-surface);border-bottom:1px solid var(--mat-sys-outline-variant);--mat-toolbar-container-background-color: var(--mat-sys-surface-container);--mat-toolbar-container-text-color: var(--mat-sys-on-surface)}.spacer[_ngcontent-%COMP%]{flex:1 1 auto}.composer-sidenav-container[_ngcontent-%COMP%]{flex:1;min-height:0;overflow:hidden;display:flex}.composer-sidenav-container[_ngcontent-%COMP%] >   .mat-drawer{position:relative!important;transform:none!important}.composer-sidenav-container[_ngcontent-%COMP%] >   .mat-drawer-content{flex:1;min-width:0;margin-left:0!important;margin-right:0!important}.composer-sidenav[_ngcontent-%COMP%]{width:250px;background-color:var(--mat-sys-surface-container);border-right:1px solid var(--mat-sys-outline-variant);--mat-sidenav-container-shape: 0px;--mat-drawer-container-shape: 0px;border-radius:0;--mat-sidenav-background-color: var(--mat-sys-surface-container);transition:width .2s ease-in-out}.composer-sidenav[_ngcontent-%COMP%]     .mat-drawer-inner-container{border-radius:0;white-space:nowrap;overflow-x:hidden}.composer-sidenav[_ngcontent-%COMP%]   mat-nav-list[_ngcontent-%COMP%]{padding:8px}.composer-sidenav[_ngcontent-%COMP%]   mat-nav-list[_ngcontent-%COMP%]   a[mat-list-item][_ngcontent-%COMP%]{border-radius:28px;margin-bottom:4px}.composer-sidenav[_ngcontent-%COMP%]   mat-nav-list[_ngcontent-%COMP%]   a[mat-list-item].active-nav-item[_ngcontent-%COMP%]{background-color:var(--mat-sys-secondary-container);color:var(--mat-sys-on-secondary-container)}.composer-sidenav[_ngcontent-%COMP%]   mat-nav-list[_ngcontent-%COMP%]   a[mat-list-item].active-nav-item[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{color:var(--mat-sys-primary)}.composer-sidenav.collapsed[_ngcontent-%COMP%]{width:64px}.composer-sidenav.collapsed[_ngcontent-%COMP%]   a[mat-list-item][_ngcontent-%COMP%]{padding:16px;display:flex;justify-content:center}.composer-sidenav.collapsed[_ngcontent-%COMP%]   a[mat-list-item][_ngcontent-%COMP%]     .mdc-list-item__start{margin:0}.composer-content[_ngcontent-%COMP%]{padding:0;box-sizing:border-box;height:100%;overflow:hidden}.hamburger-button[_ngcontent-%COMP%]{margin-right:8px}.theme-toggle-button[_ngcontent-%COMP%]{margin-left:8px}"]})};export{pt as ComposerShell};