import {E,F,k,z,T,S,j}from'./chunk-B2Bui2iM.js';import {y,cL as dZe,cM as If,ae as Kt,E as EB,W as Wg,a2 as aZ,l as le,N as Nl,cN as ty,cO as qg,R as Re,p as pn$1,V as Vo,a7 as Qe,a5 as Ize,F as Ft,av as fZe,c5 as uZe,c6 as cZe,c4 as hZe,c9 as ege,ar as me,at as Vr,e as R1,O as O1,X as Xoe,f as VGe,U as UGe,cP as y1,D as Dr,S as Si,H as Hr,m as Ds,I as Id,Y as Yo,o as xd,T as Td,J as Jb,d as dr,cQ as _B,k as ks,t as te,aN as r,u as se,cR as Sf,cS as sZ,cT as Iw,c3 as gT,aw as bZ,ax as aZe,c8 as Qme,cU as h1,cV as m1,cW as B1,cX as g1,as as Wt$1,cc as Be,ce as Fi,au as zr,v as vk,az as v9,P as Pm,aA as y9,z as Ye,A as qe,C as Xn,Z as Ze,bh as Df,ag as Ha,ba as j$1,bs as Io,bl as Ke,bz as Kr,bA as I1,bJ as Um,cy as oi,cY as c$e,bV as Pn$1,bD as xt,K as ws,L as Ur,co as GW,r as hn$1,n as ir,ab as Qo,cZ as bT,c_ as Rh,c$ as Nr,cD as uN,cJ as Ad,Q as kd,bf as Rd,$ as Nm,a0 as Mm,aL as cN,aM as OAe,cg as zo,ch as Lo,d0 as Po,ci as Fe$1,b8 as St,aT as LW,aJ as jW,aX as OW,aY as RW,cE as SA,a1 as Fe$2,d1 as Oi,aU as hA,aV as pA}from'./main.js';import {o as ot,k as ki,c as ct}from'./chunk-D0ho2v91.js';import {Y as Yt$1,m as mt}from'./chunk-mDl2a-_z.js';var qt=["*"],Ut=(()=>{class i{labelPosition="after";static \u0275fac=function(n){return new(n||i)};static \u0275cmp=Ft({type:i,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(n,r){n&2&&hn$1("mdc-form-field--align-end",r.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:qt,decls:1,vars:0,template:function(n,r){n&1&&(ws(),Ur(0));},styles:[`.mat-internal-form-field {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.mat-internal-form-field > label {
  margin-left: 0;
  margin-right: auto;
  padding-left: 4px;
  padding-right: 0;
  order: 0;
}
[dir=rtl] .mat-internal-form-field > label {
  margin-left: auto;
  margin-right: 0;
  padding-left: 0;
  padding-right: 4px;
}

.mdc-form-field--align-end > label {
  margin-left: auto;
  margin-right: 0;
  padding-left: 0;
  padding-right: 4px;
  order: -1;
}
[dir=rtl] .mdc-form-field--align-end .mdc-form-field--align-end label {
  margin-left: 0;
  margin-right: auto;
  padding-left: 4px;
  padding-right: 0;
}
`],encapsulation:2})}return i})();var Ht=["switch"],Wt=["*"];function Xt(i,t){i&1&&(Dr(0,"span",11),SA(),Dr(1,"svg",13),vk(2,"path",14),Hr(),Dr(3,"svg",15),vk(4,"path",16),Hr()());}var Yt=new j$1("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Ee=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Fe=(()=>{class i{_elementRef=y(Ze);_focusMonitor=y(Df);_changeDetectorRef=y(Ha);defaults=y(Yt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Ee(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Io();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new Ke;toggleChange=new Ke;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){y(Kr).load(I1);let e=y(new Um("tabindex"),{optional:true}),n=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=n.color||"accent",this.id=this._uniqueId=y(oi).getId("mat-mdc-slide-toggle-"),this.hideIcon=n.hideIcon??false,this.disabledInteractive=n.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Ee(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=Ft({type:i,selectors:[["mat-slide-toggle"]],viewQuery:function(n,r){if(n&1&&Rd(Ht,5),n&2){let l;Nm(l=Mm())&&(r._switchElement=l.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(n,r){n&2&&(Ad("id",r.id),ir("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),kd(r.color?"mat-"+r.color:""),hn$1("mat-mdc-slide-toggle-focused",r._focused)("mat-mdc-slide-toggle-checked",r.checked)("_mat-animation-noopable",r._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",xt],color:"color",disabled:[2,"disabled","disabled",xt],disableRipple:[2,"disableRipple","disableRipple",xt],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:uN(e)],checked:[2,"checked","checked",xt],hideIcon:[2,"hideIcon","hideIcon",xt],disabledInteractive:[2,"disabledInteractive","disabledInteractive",xt]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[Qo([{provide:bT,useExisting:Nr(()=>i),multi:true},{provide:Rh,useExisting:i,multi:true}]),Pn$1],ngContentSelectors:Wt,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(n,r){if(n&1&&(ws(),Dr(0,"div",1)(1,"button",2,0),Ds("click",function(){return r._handleClick()}),vk(3,"div",3)(4,"span",4),Dr(5,"span",5)(6,"span",6)(7,"span",7),vk(8,"span",8),Hr(),Dr(9,"span",9),vk(10,"span",10),Hr(),Id(11,Xt,5,0,"span",11),Hr()()(),Dr(12,"label",12),Ds("click",function(g){return g.stopPropagation()}),Ur(13),Hr()()),n&2){let l=GW(2);xd("labelPosition",r.labelPosition),Yo(),hn$1("mdc-switch--selected",r.checked)("mdc-switch--unselected",!r.checked)("mdc-switch--checked",r.checked)("mdc-switch--disabled",r.disabled)("mat-mdc-slide-toggle-disabled-interactive",r.disabledInteractive),xd("tabIndex",r.disabled&&!r.disabledInteractive?-1:r.tabIndex)("disabled",r.disabled&&!r.disabledInteractive),ir("id",r.buttonId)("name",r.name)("aria-label",r.ariaLabel)("aria-labelledby",r._getAriaLabelledBy())("aria-describedby",r.ariaDescribedby)("aria-required",r.required||null)("aria-checked",r.checked)("aria-disabled",r.disabled&&r.disabledInteractive?"true":null),Yo(9),xd("matRippleTrigger",l)("matRippleDisabled",r.disableRipple||r.disabled)("matRippleCentered",true),Yo(),Td(r.hideIcon?-1:11),Yo(),xd("for",r.buttonId),ir("id",r._labelId);}},dependencies:[c$e,Ut],styles:[`.mdc-switch {
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  margin: 0;
  outline: none;
  overflow: visible;
  padding: 0;
  position: relative;
  width: var(--mat-slide-toggle-track-width, 52px);
}
.mdc-switch.mdc-switch--disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-switch.mat-mdc-slide-toggle-disabled-interactive {
  pointer-events: auto;
}

.mdc-switch__track {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: var(--mat-slide-toggle-track-height, 32px);
  border-radius: var(--mat-slide-toggle-track-shape, var(--mat-sys-corner-full));
}
.mdc-switch--disabled.mdc-switch .mdc-switch__track {
  opacity: var(--mat-slide-toggle-disabled-track-opacity, 0.12);
}
.mdc-switch__track::before, .mdc-switch__track::after {
  border: 1px solid transparent;
  border-radius: inherit;
  box-sizing: border-box;
  content: "";
  height: 100%;
  left: 0;
  position: absolute;
  width: 100%;
  border-width: var(--mat-slide-toggle-track-outline-width, 2px);
  border-color: var(--mat-slide-toggle-track-outline-color, var(--mat-sys-outline));
}
.mdc-switch--selected .mdc-switch__track::before, .mdc-switch--selected .mdc-switch__track::after {
  border-width: var(--mat-slide-toggle-selected-track-outline-width, 2px);
  border-color: var(--mat-slide-toggle-selected-track-outline-color, transparent);
}
.mdc-switch--disabled .mdc-switch__track::before, .mdc-switch--disabled .mdc-switch__track::after {
  border-width: var(--mat-slide-toggle-disabled-unselected-track-outline-width, 2px);
  border-color: var(--mat-slide-toggle-disabled-unselected-track-outline-color, var(--mat-sys-on-surface));
}
@media (forced-colors: active) {
  .mdc-switch__track {
    border-color: currentColor;
  }
}
.mdc-switch__track::before {
  transition: transform 75ms 0ms cubic-bezier(0, 0, 0.2, 1);
  transform: translateX(0);
  background: var(--mat-slide-toggle-unselected-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch--selected .mdc-switch__track::before {
  transition: transform 75ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
  transform: translateX(100%);
}
[dir=rtl] .mdc-switch--selected .mdc-switch--selected .mdc-switch__track::before {
  transform: translateX(-100%);
}
.mdc-switch--selected .mdc-switch__track::before {
  opacity: var(--mat-slide-toggle-hidden-track-opacity, 0);
  transition: var(--mat-slide-toggle-hidden-track-transition, opacity 75ms);
}
.mdc-switch--unselected .mdc-switch__track::before {
  opacity: var(--mat-slide-toggle-visible-track-opacity, 1);
  transition: var(--mat-slide-toggle-visible-track-transition, opacity 75ms);
}
.mdc-switch:enabled:hover:not(:focus):not(:active) .mdc-switch__track::before {
  background: var(--mat-slide-toggle-unselected-hover-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch:enabled:focus:not(:active) .mdc-switch__track::before {
  background: var(--mat-slide-toggle-unselected-focus-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch:enabled:active .mdc-switch__track::before {
  background: var(--mat-slide-toggle-unselected-pressed-track-color, var(--mat-sys-surface-variant));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:hover:not(:focus):not(:active) .mdc-switch__track::before, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:focus:not(:active) .mdc-switch__track::before, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:active .mdc-switch__track::before, .mdc-switch.mdc-switch--disabled .mdc-switch__track::before {
  background: var(--mat-slide-toggle-disabled-unselected-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch__track::after {
  transform: translateX(-100%);
  background: var(--mat-slide-toggle-selected-track-color, var(--mat-sys-primary));
}
[dir=rtl] .mdc-switch__track::after {
  transform: translateX(100%);
}
.mdc-switch--selected .mdc-switch__track::after {
  transform: translateX(0);
}
.mdc-switch--selected .mdc-switch__track::after {
  opacity: var(--mat-slide-toggle-visible-track-opacity, 1);
  transition: var(--mat-slide-toggle-visible-track-transition, opacity 75ms);
}
.mdc-switch--unselected .mdc-switch__track::after {
  opacity: var(--mat-slide-toggle-hidden-track-opacity, 0);
  transition: var(--mat-slide-toggle-hidden-track-transition, opacity 75ms);
}
.mdc-switch:enabled:hover:not(:focus):not(:active) .mdc-switch__track::after {
  background: var(--mat-slide-toggle-selected-hover-track-color, var(--mat-sys-primary));
}
.mdc-switch:enabled:focus:not(:active) .mdc-switch__track::after {
  background: var(--mat-slide-toggle-selected-focus-track-color, var(--mat-sys-primary));
}
.mdc-switch:enabled:active .mdc-switch__track::after {
  background: var(--mat-slide-toggle-selected-pressed-track-color, var(--mat-sys-primary));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:hover:not(:focus):not(:active) .mdc-switch__track::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:focus:not(:active) .mdc-switch__track::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:active .mdc-switch__track::after, .mdc-switch.mdc-switch--disabled .mdc-switch__track::after {
  background: var(--mat-slide-toggle-disabled-selected-track-color, var(--mat-sys-on-surface));
}

.mdc-switch__handle-track {
  height: 100%;
  pointer-events: none;
  position: absolute;
  top: 0;
  transition: transform 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  left: 0;
  right: auto;
  transform: translateX(0);
  width: calc(100% - var(--mat-slide-toggle-handle-width));
}
[dir=rtl] .mdc-switch__handle-track {
  left: auto;
  right: 0;
}
.mdc-switch--selected .mdc-switch__handle-track {
  transform: translateX(100%);
}
[dir=rtl] .mdc-switch--selected .mdc-switch__handle-track {
  transform: translateX(-100%);
}

.mdc-switch__handle {
  display: flex;
  pointer-events: auto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: auto;
  transition: width 75ms cubic-bezier(0.4, 0, 0.2, 1), height 75ms cubic-bezier(0.4, 0, 0.2, 1), margin 75ms cubic-bezier(0.4, 0, 0.2, 1);
  width: var(--mat-slide-toggle-handle-width);
  height: var(--mat-slide-toggle-handle-height);
  border-radius: var(--mat-slide-toggle-handle-shape, var(--mat-sys-corner-full));
}
[dir=rtl] .mdc-switch__handle {
  left: auto;
  right: 0;
}
.mat-mdc-slide-toggle .mdc-switch--unselected .mdc-switch__handle {
  width: var(--mat-slide-toggle-unselected-handle-size, 16px);
  height: var(--mat-slide-toggle-unselected-handle-size, 16px);
  margin: var(--mat-slide-toggle-unselected-handle-horizontal-margin, 0 8px);
}
.mat-mdc-slide-toggle .mdc-switch--unselected .mdc-switch__handle:has(.mdc-switch__icons) {
  margin: var(--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin, 0 4px);
}
.mat-mdc-slide-toggle .mdc-switch--selected .mdc-switch__handle {
  width: var(--mat-slide-toggle-selected-handle-size, 24px);
  height: var(--mat-slide-toggle-selected-handle-size, 24px);
  margin: var(--mat-slide-toggle-selected-handle-horizontal-margin, 0 24px);
}
.mat-mdc-slide-toggle .mdc-switch--selected .mdc-switch__handle:has(.mdc-switch__icons) {
  margin: var(--mat-slide-toggle-selected-with-icon-handle-horizontal-margin, 0 24px);
}
.mat-mdc-slide-toggle .mdc-switch__handle:has(.mdc-switch__icons) {
  width: var(--mat-slide-toggle-with-icon-handle-size, 24px);
  height: var(--mat-slide-toggle-with-icon-handle-size, 24px);
}
.mat-mdc-slide-toggle .mdc-switch:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  width: var(--mat-slide-toggle-pressed-handle-size, 28px);
  height: var(--mat-slide-toggle-pressed-handle-size, 28px);
}
.mat-mdc-slide-toggle .mdc-switch--selected:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  margin: var(--mat-slide-toggle-selected-pressed-handle-horizontal-margin, 0 22px);
}
.mat-mdc-slide-toggle .mdc-switch--unselected:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  margin: var(--mat-slide-toggle-unselected-pressed-handle-horizontal-margin, 0 2px);
}
.mdc-switch--disabled.mdc-switch--selected .mdc-switch__handle::after {
  opacity: var(--mat-slide-toggle-disabled-selected-handle-opacity, 1);
}
.mdc-switch--disabled.mdc-switch--unselected .mdc-switch__handle::after {
  opacity: var(--mat-slide-toggle-disabled-unselected-handle-opacity, 0.38);
}
.mdc-switch__handle::before, .mdc-switch__handle::after {
  border: 1px solid transparent;
  border-radius: inherit;
  box-sizing: border-box;
  content: "";
  width: 100%;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transition: background-color 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1), border-color 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}
@media (forced-colors: active) {
  .mdc-switch__handle::before, .mdc-switch__handle::after {
    border-color: currentColor;
  }
}
.mdc-switch--selected:enabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-handle-color, var(--mat-sys-on-primary));
}
.mdc-switch--selected:enabled:hover:not(:focus):not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-hover-handle-color, var(--mat-sys-primary-container));
}
.mdc-switch--selected:enabled:focus:not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-focus-handle-color, var(--mat-sys-primary-container));
}
.mdc-switch--selected:enabled:active .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-pressed-handle-color, var(--mat-sys-primary-container));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--selected:hover:not(:focus):not(:active) .mdc-switch__handle::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--selected:focus:not(:active) .mdc-switch__handle::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--selected:active .mdc-switch__handle::after, .mdc-switch--selected.mdc-switch--disabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-disabled-selected-handle-color, var(--mat-sys-surface));
}
.mdc-switch--unselected:enabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-handle-color, var(--mat-sys-outline));
}
.mdc-switch--unselected:enabled:hover:not(:focus):not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-hover-handle-color, var(--mat-sys-on-surface-variant));
}
.mdc-switch--unselected:enabled:focus:not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-focus-handle-color, var(--mat-sys-on-surface-variant));
}
.mdc-switch--unselected:enabled:active .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-pressed-handle-color, var(--mat-sys-on-surface-variant));
}
.mdc-switch--unselected.mdc-switch--disabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-disabled-unselected-handle-color, var(--mat-sys-on-surface));
}
.mdc-switch__handle::before {
  background: var(--mat-slide-toggle-handle-surface-color);
}

.mdc-switch__shadow {
  border-radius: inherit;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}
.mdc-switch:enabled .mdc-switch__shadow {
  box-shadow: var(--mat-slide-toggle-handle-elevation-shadow);
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:hover:not(:focus):not(:active) .mdc-switch__shadow, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:focus:not(:active) .mdc-switch__shadow, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:active .mdc-switch__shadow, .mdc-switch.mdc-switch--disabled .mdc-switch__shadow {
  box-shadow: var(--mat-slide-toggle-disabled-handle-elevation-shadow);
}

.mdc-switch__ripple {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  width: var(--mat-slide-toggle-state-layer-size, 40px);
  height: var(--mat-slide-toggle-state-layer-size, 40px);
}
.mdc-switch__ripple::after {
  content: "";
  opacity: 0;
}
.mdc-switch--disabled .mdc-switch__ripple::after {
  display: none;
}
.mat-mdc-slide-toggle-disabled-interactive .mdc-switch__ripple::after {
  display: block;
}
.mdc-switch:hover .mdc-switch__ripple::after {
  transition: 75ms opacity cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:enabled:focus .mdc-switch__ripple::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:enabled:active .mdc-switch__ripple::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:enabled:hover:not(:focus) .mdc-switch__ripple::after, .mdc-switch--unselected:enabled:hover:not(:focus) .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-slide-toggle-unselected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mdc-switch--unselected:enabled:focus .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-unselected-focus-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-slide-toggle-unselected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mdc-switch--unselected:enabled:active .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-unselected-pressed-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-slide-toggle-unselected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  transition: opacity 75ms linear;
}
.mdc-switch--selected:enabled:hover:not(:focus) .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-selected-hover-state-layer-color, var(--mat-sys-primary));
  opacity: var(--mat-slide-toggle-selected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mdc-switch--selected:enabled:focus .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-selected-focus-state-layer-color, var(--mat-sys-primary));
  opacity: var(--mat-slide-toggle-selected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mdc-switch--selected:enabled:active .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-selected-pressed-state-layer-color, var(--mat-sys-primary));
  opacity: var(--mat-slide-toggle-selected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  transition: opacity 75ms linear;
}

.mdc-switch__icons {
  position: relative;
  height: 100%;
  width: 100%;
  z-index: 1;
  transform: translateZ(0);
}
.mdc-switch--disabled.mdc-switch--unselected .mdc-switch__icons {
  opacity: var(--mat-slide-toggle-disabled-unselected-icon-opacity, 0.38);
}
.mdc-switch--disabled.mdc-switch--selected .mdc-switch__icons {
  opacity: var(--mat-slide-toggle-disabled-selected-icon-opacity, 0.38);
}

.mdc-switch__icon {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  opacity: 0;
  transition: opacity 30ms 0ms cubic-bezier(0.4, 0, 1, 1);
}
.mdc-switch--unselected .mdc-switch__icon {
  width: var(--mat-slide-toggle-unselected-icon-size, 16px);
  height: var(--mat-slide-toggle-unselected-icon-size, 16px);
  fill: var(--mat-slide-toggle-unselected-icon-color, var(--mat-sys-surface-variant));
}
.mdc-switch--unselected.mdc-switch--disabled .mdc-switch__icon {
  fill: var(--mat-slide-toggle-disabled-unselected-icon-color, var(--mat-sys-surface-variant));
}
.mdc-switch--selected .mdc-switch__icon {
  width: var(--mat-slide-toggle-selected-icon-size, 16px);
  height: var(--mat-slide-toggle-selected-icon-size, 16px);
  fill: var(--mat-slide-toggle-selected-icon-color, var(--mat-sys-on-primary-container));
}
.mdc-switch--selected.mdc-switch--disabled .mdc-switch__icon {
  fill: var(--mat-slide-toggle-disabled-selected-icon-color, var(--mat-sys-on-surface));
}

.mdc-switch--selected .mdc-switch__icon--on,
.mdc-switch--unselected .mdc-switch__icon--off {
  opacity: 1;
  transition: opacity 45ms 30ms cubic-bezier(0, 0, 0.2, 1);
}

.mat-mdc-slide-toggle {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  -webkit-tap-highlight-color: transparent;
  outline: 0;
}
.mat-mdc-slide-toggle .mat-mdc-slide-toggle-ripple,
.mat-mdc-slide-toggle .mdc-switch__ripple::after {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.mat-mdc-slide-toggle .mat-mdc-slide-toggle-ripple:not(:empty),
.mat-mdc-slide-toggle .mdc-switch__ripple::after:not(:empty) {
  transform: translateZ(0);
}
.mat-mdc-slide-toggle.mat-mdc-slide-toggle-focused .mat-focus-indicator::before {
  content: "";
}
.mat-mdc-slide-toggle .mat-internal-form-field {
  color: var(--mat-slide-toggle-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-slide-toggle-label-text-font, var(--mat-sys-body-medium-font));
  line-height: var(--mat-slide-toggle-label-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-slide-toggle-label-text-size, var(--mat-sys-body-medium-size));
  letter-spacing: var(--mat-slide-toggle-label-text-tracking, var(--mat-sys-body-medium-tracking));
  font-weight: var(--mat-slide-toggle-label-text-weight, var(--mat-sys-body-medium-weight));
}
.mat-mdc-slide-toggle .mat-ripple-element {
  opacity: 0.12;
}
.mat-mdc-slide-toggle .mat-focus-indicator::before {
  border-radius: 50%;
}
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle-track,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__icon,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle::before,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle::after,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__track::before,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__track::after {
  transition: none;
}
.mat-mdc-slide-toggle .mdc-switch:enabled + .mdc-label {
  cursor: pointer;
}
.mat-mdc-slide-toggle .mdc-switch--disabled + label {
  color: var(--mat-slide-toggle-disabled-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-slide-toggle label:empty {
  display: none;
}

.mat-mdc-slide-toggle-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--mat-slide-toggle-touch-target-size, 48px);
  width: 100%;
  transform: translate(-50%, -50%);
  display: var(--mat-slide-toggle-touch-target-display, block);
}
[dir=rtl] .mat-mdc-slide-toggle-touch-target {
  left: auto;
  right: 50%;
  transform: translate(50%, -50%);
}
`],encapsulation:2})}return i})(),Vt=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=Ye({type:i});static \u0275inj=qe({imports:[Fe,Xn]})}return i})();var I=class i{logger=y(dr).withTag("[Settings]");startupResolution=y(EB);startupConfigState=y(Wg);configProvider=y(Nl);secureCredentialsStorage=y(_B);localStorageInteractions=y(ks);usageTrackingService=y(te);renderers=pn$1(()=>this.startupConfigState.renderers());selectedRendererId=pn$1(()=>this.startupConfigState.selectedRendererId());activeRenderer=pn$1(()=>this.startupConfigState.activeRenderer());async selectRenderer(t){let e=this.selectedRendererId();if(!await this.startupResolution.setSelectedRendererId(t))return  false;this.usageTrackingService.trackRendererSwitch({fromRendererId:e,toRendererId:t||""}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_renderer",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer");let r=this.activeRenderer();r?.rendererUrl?this.configProvider.setRendererUrl(r.rendererUrl):this.configProvider.setRendererUrl("");let l=typeof r?.apiKey=="string"?r.apiKey.trim():"";if(l)this.configProvider.setApiKeyFromConfig(l);else try{await this.syncEffectiveApiKeyToConfigProvider();}catch(g){this.logger.warn("Failed to resolve effective API key during renderer selection:",g);}return  true}_selectedApiKeyId=Re(this.localStorageInteractions.getItem("a2ui_composer_selected_api_key")||null);selectedApiKeyId=pn$1(()=>{let t=this._selectedApiKeyId();return t||((this.startupConfigState.apiKeys()||{}).default!==void 0?"default":null)});_effectiveApiKey=Re("");effectiveApiKey=this._effectiveApiKey.asReadonly();getStaticApiKeys(){return this.startupConfigState.apiKeys()||{}}async getAvailableApiKeys(){let t=this.getStaticApiKeys(),e=Object.entries(t).map(([l,g])=>({id:l,name:g.displayName||l,key:g.apiKey||"",readOnly:true})),r=(await this.secureCredentialsStorage.getCustomApiKeys()).filter(l=>!Object.prototype.hasOwnProperty.call(t,l.id)).map(l=>({id:l.id,name:l.name,key:l.key,readOnly:false}));return [...e,...r]}async selectApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"select"}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_api_key",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_api_key"),this._selectedApiKeyId.set(t),await this.syncEffectiveApiKeyToConfigProvider();}async getEffectiveApiKey(){let t=this.selectedApiKeyId(),e=this.getStaticApiKeys();if(t&&e[t]){let l=e[t].apiKey||"";return this._effectiveApiKey.set(l),l}if(t){let l=await this.secureCredentialsStorage.getCustomApiKey(t);return l?(this._effectiveApiKey.set(l.key),l.key):(this._effectiveApiKey.set(""),"")}let n=await this.secureCredentialsStorage.getCustomApiKeys(),r=n.find(l=>l.id==="default")||n[0];if(r){let l=r.key;return this._effectiveApiKey.set(l),l}return this._effectiveApiKey.set(""),""}async saveCustomApiKey(t,e,n){let r=this.getStaticApiKeys();if(Object.prototype.hasOwnProperty.call(r,t))throw new Error(`Cannot save custom API key with ID "${t}": collides with a static configuration key.`);this.usageTrackingService.trackApiKeyUpdate({action:"add"}),await this.secureCredentialsStorage.saveCustomApiKey(t,e,n),await this.syncEffectiveApiKeyToConfigProvider();}async deleteCustomApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"delete"}),await this.secureCredentialsStorage.deleteCustomApiKey(t),this._selectedApiKeyId()===t?await this.selectApiKey(null):await this.syncEffectiveApiKeyToConfigProvider();}async syncEffectiveApiKeyToConfigProvider(){let t=await this.getEffectiveApiKey(),e=this._selectedApiKeyId(),n=this.getStaticApiKeys();return e&&n[e]?this.configProvider.setApiKeyFromConfig(t):!e&&n.default?this.configProvider.setApiKeyFromConfig(t):this.configProvider.setRuntimeApiKey(t),t}getStaticRenderersMap(){return this.startupConfigState.renderers()||{}}getCustomRenderers(){let t=this.localStorageInteractions.getItem("a2ui_composer_custom_renderers");if(!t)return [];try{let e=JSON.parse(t);return Array.isArray(e)?e.filter(n=>n&&typeof n=="object"&&!!String(n.id||"").trim()).map(n=>({id:String(n?.id||"").trim(),name:String(n?.name||""),rendererUrl:String(n?.rendererUrl||"")})):[]}catch(e){return this.logger.warn("Failed to parse custom renderers from LocalStorage:",e),[]}}getRenderers(){let t=this.getStaticRenderersMap(),e=Object.entries(t).map(([l,g])=>({id:l,name:g?.displayName||g?.name||l,rendererUrl:g?.rendererUrl||"",readOnly:true})),n=new Set(e.map(l=>l.name)),r=this.getCustomRenderers().filter(l=>!Object.prototype.hasOwnProperty.call(t,l.id)).map(l=>({id:l.id,name:n.has(l.name)?`${l.name} (local)`:l.name,rendererUrl:l.rendererUrl,readOnly:false}));return [...e,...r]}saveCustomRenderer(t){let e=(t.id||"").trim(),n=(t.name||"").trim(),r$1=(t.rendererUrl||"").trim();if(!e||!n||!r$1)throw new Error("Custom renderer id, name, and rendererUrl must not be empty.");if(!/^https?:\/\//i.test(r$1))throw new Error("Custom renderer URL must start with http:// or https://");let l=this.getStaticRenderersMap();if(Object.prototype.hasOwnProperty.call(l,e))throw new Error(`Cannot save custom renderer with ID "${e}": collides with a static configuration renderer.`);let g=this.getCustomRenderers(),Ue=g.findIndex($t=>$t.id===e);Ue>=0?(g[Ue]={id:e,name:n,rendererUrl:r$1},this.usageTrackingService.trackRendererEdit({rendererId:e})):(g.push({id:e,name:n,rendererUrl:r$1}),this.usageTrackingService.trackRendererAdd({rendererId:e})),this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(g));let Ve=r({},this.startupConfigState.renderers());Ve[e]={id:e,name:n,rendererUrl:r$1},this.startupConfigState.setRenderers(Ve);}deleteCustomRenderer(t){this.usageTrackingService.trackRendererDelete({rendererId:t});let e=this.getCustomRenderers().filter(r=>r.id!==t);this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(e));let n=r({},this.startupConfigState.renderers());delete n[t],this.startupConfigState.setRenderers(n),this.selectedRendererId()===t&&(this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer"),this.selectRenderer(null));}static \u0275fac=function(e){return new(e||i)};static \u0275prov=se({token:i,factory:i.\u0275fac,providedIn:"root"})};function Jt(i,t){if(i&1&&(Dr(0,"div",5),Si(1),Hr()),i&2){let e=jW();Yo(),Pm(e.errorMessage());}}function Zt(i){let t=i.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var pe=class i{fb=y(dZe);settingsService=y(I);dialogRef=y(Sf);data=y(Iw,{optional:true});errorMessage=Re(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[gT.required,gT.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[gT.required,Zt]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),n=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:n,name:t,rendererUrl:e}),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Ft({type:i,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:7,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","placeholder","My Renderer",3,"formControl"],["matInput","","id","renderer-url-input","placeholder","http://localhost:3000",3,"formControl"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Dr(0,"h2",0),Si(1),Hr(),Dr(2,"mat-dialog-content")(3,"form",1),Ds("ngSubmit",function(l){return l.preventDefault(),n.onConfirm()}),Dr(4,"mat-form-field",2)(5,"mat-label"),Si(6,"Name"),Hr(),vk(7,"input",3),v9(),Hr(),Dr(8,"mat-form-field",2)(9,"mat-label"),Si(10,"Renderer URL"),Hr(),vk(11,"input",4),v9(),Hr(),Id(12,Jt,2,1,"div",5),Hr()(),Dr(13,"mat-dialog-actions",6)(14,"button",7),Si(15,"Cancel"),Hr(),Dr(16,"button",8),Ds("click",function(){return n.onConfirm()}),Si(17),Hr()()),e&2&&(Yo(),Pm(n.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),Yo(2),xd("formGroup",n.form),Yo(4),xd("formControl",n.form.controls.name),y9(),Yo(4),xd("formControl",n.form.controls.rendererUrl),y9(),Yo(),Td(n.errorMessage()?12:-1),Yo(4),xd("disabled",n.form.invalid),Yo(),Jb(" ",n.data?.renderer?"Save":"Add"," "));},dependencies:[hZe,uZe,bZ,aZe,cZe,Qme,ege,y1,h1,m1,B1,g1,me,Wt$1,Be,Vr,zr,R1,O1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ce=class i{disabled=cN(false);dialog=y(If);destroyRef=y(Kt);items=Re([]);selectedItem=pn$1(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(Ize(this.destroyRef)).subscribe(async r=>{r&&(await this.refreshItems(),this.emitSelection(r));});}async handleEdit(t,e,n,r){if(e.stopPropagation(),e.preventDefault(),n.readOnly)return;this.dialog.open(t,{width:"450px",data:{[r]:n}}).afterClosed().pipe(Ize(this.destroyRef)).subscribe(async g=>{g&&(await this.refreshItems(),this.getSelectedId()===g&&this.emitSelection(g));});}async handleDelete(t,e,n=null){t.stopPropagation(),t.preventDefault(),!this.items().find(l=>l.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(n));}static \u0275fac=function(e){return new(e||i)};static \u0275dir=Fe$2({type:i,inputs:{disabled:[1,"disabled"]}})};var tn=(i,t)=>t.id;function nn(i,t){if(i&1&&(Dr(0,"span",5),Si(1),Hr()),i&2){let e=jW();Yo(),Pm(e.selectedItem()?.rendererUrl);}}function rn(i,t){i&1&&(Dr(0,"mat-option",6),Si(1,"No items available \u2014 click + to add"),Hr()),i&2&&xd("disabled",true);}function an(i,t){if(i&1){let e=LW();Dr(0,"mat-option",8)(1,"div",9)(2,"div",10),Si(3),Hr(),Dr(4,"div",5),Si(5),Hr()(),Dr(6,"button",11),Ds("click",function(r){let l=hA(e).$implicit,g=jW(2);return pA(g.onEditRenderer(r,l))})("keydown",function(r){return r.stopPropagation()}),Dr(7,"mat-icon",12),Si(8,"edit"),Hr()(),Dr(9,"button",13),Ds("click",function(r){let l=hA(e).$implicit,g=jW(2);return pA(g.onDeleteRenderer(r,l.id))})("keydown",function(r){return r.stopPropagation()}),Dr(10,"mat-icon",12),Si(11,"delete"),Hr()()();}if(i&2){let e=t.$implicit;xd("value",e.id),Yo(3),Pm(e.name),Yo(2),Pm(e.rendererUrl),Yo(),xd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),ir("aria-label","Edit "+e.name),Yo(3),xd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),ir("aria-label","Delete "+e.name);}}function on(i,t){if(i&1&&OW(0,an,12,9,"mat-option",8,tn),i&2){let e=jW();RW(e.items());}}var De=class i extends ce{selectedRendererId=cN("default");rendererSelected=OAe();settingsService=y(I);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(pe,t);}onEditRenderer(t,e){this.handleEdit(pe,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Ft({type:i,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[St],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,n){e&1&&(Dr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Si(3,"Renderer"),Hr(),Dr(4,"mat-select",2),Ds("selectionChange",function(l){return n.onSelectionChange(l.value)}),Dr(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Si(8),Hr(),Id(9,nn,2,1,"span",5),Hr()(),Id(10,rn,2,1,"mat-option",6)(11,on,2,0),Hr()(),Dr(12,"button",7),Ds("click",function(l){return n.onAddRenderer(l)}),Dr(13,"mat-icon"),Si(14,"add_circle"),Hr()()()),e&2&&(Yo(4),xd("value",n.selectedRendererId())("disabled",n.disabled()),Yo(4),Pm(n.selectedItem()?.name),Yo(),Td(n.selectedItem()?.rendererUrl?9:-1),Yo(),Td(n.items().length===0?10:11),Yo(2),xd("disabled",n.disabled()));},dependencies:[me,Wt$1,Be,zo,Lo,Po,Fe$1,R1,Xoe,VGe,UGe,Yt$1,mt,y1],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function ln(i,t){if(i&1&&(Dr(0,"div",7),Si(1),Hr()),i&2){let e=jW();Yo(),Pm(e.errorMessage());}}var he=class i{fb=y(dZe);settingsService=y(I);dialogRef=y(Sf);data=y(Iw,{optional:true});errorMessage=Re(null);hideApiKey=Re(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[gT.required,gT.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[gT.required,gT.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),n=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(n,t,e),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Ft({type:i,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:10,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","placeholder","My Gemini Key",3,"formControl"],["matInput","","id","api-key-value-input","placeholder","Paste your API key here",3,"type","formControl"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Dr(0,"h2",0),Si(1),Hr(),Dr(2,"mat-dialog-content")(3,"form",1),Ds("ngSubmit",function(l){return l.preventDefault(),n.onConfirm()}),Dr(4,"mat-form-field",2)(5,"mat-label"),Si(6,"Name"),Hr(),vk(7,"input",3),v9(),Hr(),Dr(8,"mat-form-field",2)(9,"mat-label"),Si(10,"API Key"),Hr(),vk(11,"input",4),v9(),Dr(12,"button",5),Ds("click",function(){return n.toggleHideApiKey()}),Dr(13,"mat-icon",6),Si(14),Hr()()(),Id(15,ln,2,1,"div",7),Hr()(),Dr(16,"mat-dialog-actions",8)(17,"button",9),Si(18,"Cancel"),Hr(),Dr(19,"button",10),Ds("click",function(){return n.onConfirm()}),Si(20),Hr()()),e&2&&(Yo(),Pm(n.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),Yo(2),xd("formGroup",n.form),Yo(4),xd("formControl",n.form.controls.name),y9(),Yo(4),xd("type",n.hideApiKey()?"password":"text")("formControl",n.form.controls.apiKey),y9(),Yo(),ir("aria-label",n.hideApiKey()?"Show API key":"Hide API key"),Yo(2),Pm(n.hideApiKey()?"visibility":"visibility_off"),Yo(),Td(n.errorMessage()?15:-1),Yo(4),xd("disabled",n.form.invalid),Yo(),Jb(" ",n.data?.apiKey?"Save":"Add"," "));},dependencies:[hZe,uZe,bZ,aZe,cZe,Qme,ege,y1,h1,m1,B1,g1,me,Wt$1,Be,Oi,Vr,zr,R1,O1,Xoe,VGe,UGe],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var dn=(i,t)=>t.id;function sn(i,t){i&1&&(Dr(0,"mat-option",3),Si(1,"No items available \u2014 click + to add"),Hr()),i&2&&xd("disabled",true);}function cn(i,t){if(i&1){let e=LW();Dr(0,"mat-option",5)(1,"span",6),Si(2),Hr(),Dr(3,"button",7),Ds("keydown",function(r){return r.stopPropagation()})("click",function(r){let l=hA(e).$implicit,g=jW(2);return pA(g.onEditApiKey(r,l))}),Dr(4,"mat-icon",8),Si(5,"edit"),Hr()(),Dr(6,"button",9),Ds("keydown",function(r){return r.stopPropagation()})("click",function(r){let l=hA(e).$implicit,g=jW(2);return pA(g.onDeleteApiKey(r,l.id))}),Dr(7,"mat-icon",8),Si(8,"delete"),Hr()()();}if(i&2){let e=t.$implicit;xd("value",e.id),Yo(2),Pm(e.name),Yo(),xd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),ir("aria-label","Edit "+e.name),Yo(3),xd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),ir("aria-label","Delete "+e.name);}}function mn(i,t){if(i&1&&OW(0,cn,9,8,"mat-option",5,dn),i&2){let e=jW();RW(e.items());}}var Oe=class i extends ce{selectedApiKeyId=cN(null);apiKeySelected=OAe();settingsService=y(I);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(he,t);}onEditApiKey(t,e){this.handleEdit(he,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Ft({type:i,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[St],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,n){e&1&&(Dr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Si(3,"API Key"),Hr(),Dr(4,"mat-select",2),Ds("selectionChange",function(l){return n.onSelectionChange(l.value)}),Dr(5,"mat-select-trigger"),Si(6),Hr(),Id(7,sn,2,1,"mat-option",3)(8,mn,2,0),Hr()(),Dr(9,"button",4),Ds("click",function(l){return n.onAddApiKey(l)}),Dr(10,"mat-icon"),Si(11,"add_circle"),Hr()()()),e&2&&(Yo(4),xd("value",n.selectedApiKeyId())("disabled",n.disabled()),Yo(2),Jb(" ",n.selectedItem()?.name," "),Yo(),Td(n.items().length===0?7:8),Yo(2),xd("disabled",n.disabled()));},dependencies:[me,Wt$1,Be,zo,Lo,Po,Fe$1,R1,Xoe,VGe,UGe,Yt$1,mt,y1],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function pn(i,t){i&1&&(Dr(0,"mat-error"),Si(1,"Enter a supported MCP server address"),Hr());}function gn(i,t){if(i&1&&(Dr(0,"div",4),Si(1),Hr()),i&2){let e=jW();Yo(),Pm(e.errorMessage());}}var fe=class i{fb=y(dZe);dialogRef=y(Sf);connector=y(sZ);data=y(Iw,{optional:true});errorMessage=Re(null);addressHint=this.connector.addressHint??"";addressValidator=t=>!t.value||this.connector.supports(t.value.trim())?null:{invalidUrl:true};form=this.fb.group({url:[this.data?.server?.url??"",[gT.required,this.addressValidator]]});onConfirm(){this.errorMessage.set(null);let t=this.form.controls.url.value.trim();this.dialogRef.close({url:t});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Ft({type:i,selectors:[["a2ui-composer-mcp-server-dialog"]],decls:15,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","mcp-server-url-input",3,"formControl","placeholder"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","button","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Dr(0,"h2",0),Si(1),Hr(),Dr(2,"mat-dialog-content")(3,"form",1),Ds("ngSubmit",function(l){return l.preventDefault(),n.onConfirm()}),Dr(4,"mat-form-field",2)(5,"mat-label"),Si(6,"Server URL"),Hr(),vk(7,"input",3),v9(),Id(8,pn,2,0,"mat-error"),Hr(),Id(9,gn,2,1,"div",4),Hr()(),Dr(10,"mat-dialog-actions",5)(11,"button",6),Si(12,"Cancel"),Hr(),Dr(13,"button",7),Ds("click",function(){return n.onConfirm()}),Si(14),Hr()()),e&2&&(Yo(),Pm(n.data?.server?"Edit MCP Server":"Add MCP Server"),Yo(2),xd("formGroup",n.form),Yo(4),xd("formControl",n.form.controls.url)("placeholder",n.addressHint),y9(),Yo(),Td(n.form.controls.url.hasError("invalidUrl")?8:-1),Yo(),Td(n.errorMessage()?9:-1),Yo(4),xd("disabled",n.form.invalid),Yo(),Jb(" ",n.data?.server?"Save":"Add"," "));},dependencies:[hZe,uZe,bZ,aZe,cZe,Qme,ege,y1,h1,m1,B1,g1,me,Wt$1,Be,Fi,Vr,zr,R1,O1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var un=(i,t)=>t.id,hn=(i,t)=>t.name;function fn(i,t){if(i&1){let e=LW();Dr(0,"div",4)(1,"h3"),Si(2,"Gemini API Provisioning"),Hr(),Dr(3,"a2ui-composer-api-key-selector",27),Ds("apiKeySelected",function(r){hA(e);let l=jW();return pA(l.onApiKeySelected(r))}),Hr()();}if(i&2){let e=jW();Yo(3),xd("selectedApiKeyId",e.selectedApiKeyId());}}function yn(i,t){i&1&&(Dr(0,"mat-card-footer",10),Si(1," To obtain an API key: "),Dr(2,"ol")(3,"li"),Si(4," Go to "),Dr(5,"a",28),Si(6," Google AI Studio"),Hr(),Si(7," and sign in with your Google account. "),Hr(),Dr(8,"li"),Si(9,"Click Create API key."),Hr(),Dr(10,"li"),Si(11,"Select or create a Google Cloud project when prompted, then click Create key."),Hr(),Dr(12,"li"),Si(13,"Save your key in a secure location!"),Hr()(),Si(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),Dr(15,"a",29),Si(16,"Web Crypto API"),Hr(),Si(17,". Neither Google nor anyone else has access to this key. "),Hr());}function vn(i,t){if(i&1&&(Dr(0,"code"),Si(1),Hr()),i&2){let e=jW();Yo(),Jb("[System] Active renderer updated to ",e.activeRendererUrl());}}function _n(i,t){if(i&1&&(Dr(0,"code",18),Si(1),Hr()),i&2){let e=jW();Yo(),Jb("[Catalog Error] ",e.catalogErrorMessage());}}function bn(i,t){i&1&&(Dr(0,"code",19),Si(1,"[System] Catalog handshake completed successfully. Active catalog ready."),Hr());}function Cn(i,t){i&1&&(Dr(0,"code"),Si(1,"[System] Catalog handshake in progress. Indexing metadata..."),Hr());}function wn(i,t){i&1&&(Dr(0,"code"),Si(1,"[System] Bridge connected. Initializing catalog handshake..."),Hr());}function Sn(i,t){i&1&&(Dr(0,"code"),Si(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),Hr());}function Mn(i,t){i&1&&(Dr(0,"div",25),Si(1,"No MCP servers configured \u2014 click + to add"),Hr());}function xn(i,t){if(i&1&&Si(0),i&2){let e=jW().$implicit;Jb(" Connected (",e.tools?.length||0," tools) ");}}function kn(i,t){i&1&&Si(0," Connecting... ");}function Pn(i,t){if(i&1&&Si(0),i&2){let e=jW().$implicit;Jb(" Error: ",e.errorMessage||"Failed to connect"," ");}}function An(i,t){i&1&&Si(0," Disconnected ");}function In(i,t){if(i&1&&(Dr(0,"span",38),Si(1),Hr()),i&2){let e=jW().$implicit;Yo(),Pm(e.url);}}function En(i,t){if(i&1&&(Dr(0,"span",44),Si(1),Hr()),i&2){let e=t.$implicit;Yo(),Pm(e.name);}}function Rn(i,t){if(i&1&&(Dr(0,"div",43),OW(1,En,2,1,"span",44,hn),Hr()),i&2){let e=jW().$implicit;Yo(),RW(e.tools);}}function Dn(i,t){if(i&1){let e=LW();Dr(0,"div",30)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),Ds("change",function(r){let l=hA(e).$implicit,g=jW(2);return pA(g.toggleMcpServer(l.id,r.checked))}),Hr(),Dr(4,"div",34)(5,"div",35)(6,"span",36),Si(7),Hr(),Dr(8,"span",37),Id(9,xn,1,1)(10,kn,1,0)(11,Pn,1,1)(12,An,1,0),Hr()(),Id(13,In,2,1,"span",38),Hr()(),Dr(14,"div",39)(15,"button",40),Ds("click",function(){let r=hA(e).$implicit,l=jW(2);return pA(l.testMcpServer(r.id))}),Si(16," Test "),Hr(),Dr(17,"button",41),Ds("click",function(){let r=hA(e).$implicit,l=jW(2);return pA(l.openEditMcpServerDialog(r))}),Dr(18,"mat-icon",24),Si(19,"edit"),Hr()(),Dr(20,"button",42),Ds("click",function(){let r=hA(e).$implicit,l=jW(2);return pA(l.removeMcpServer(r.id))}),Dr(21,"mat-icon",24),Si(22,"delete"),Hr()()()(),Id(23,Rn,3,0,"div",43),Hr();}if(i&2){let e=t.$implicit;Yo(3),xd("checked",e.enabled),ir("aria-label","Toggle "+(e.name||e.url)),Yo(4),Pm(e.name||e.url),Yo(),ir("data-status",e.status),Yo(),Td(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),Yo(4),Td(e.name&&e.name!==e.url?13:-1),Yo(10),Td(e.tools&&e.tools.length>0?23:-1);}}function On(i,t){if(i&1&&(Dr(0,"div",26),OW(1,Dn,24,7,"div",30,un),Hr()),i&2){let e=jW();Yo(),RW(e.mcpManager.servers());}}var jt=class i{fb=y(dZe);dialog=y(If);destroyRef=y(Kt);startupResolution=y(EB);startupConfigState=y(Wg);hostCommunication=y(aZ);catalogManagement=y(le);configProvider=y(Nl);settingsService=y(I);mcpManager=y(ty);is1PAuthEnabled=y(qg);selectedRendererId=Re(null);selectedApiKeyId=pn$1(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=pn$1(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=Re(false);isApiKeyProvidedByConfig=pn$1(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=pn$1(()=>this.isApiKeyProvidedByConfig());hideApiKey=Re(true);forceThirdPartyAuth=Re(false);bridgeConnected=pn$1(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=pn$1(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=pn$1(()=>this.catalogManagement.catalogError());activeRendererUrl=pn$1(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){Vo(()=>{let t=this.settingsService.selectedRendererId()||"default";Qe(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}openAddMcpServerDialog(){this.dialog.open(fe,{width:"450px"}).afterClosed().pipe(Ize(this.destroyRef)).subscribe(e=>{e?.url&&this.mcpManager.addServer(e.url);});}openEditMcpServerDialog(t){this.dialog.open(fe,{width:"450px",data:{server:t}}).afterClosed().pipe(Ize(this.destroyRef)).subscribe(n=>{n?.url&&this.mcpManager.updateServerUrl(t.id,n.url);});}async removeMcpServer(t){await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Ft({type:i,selectors:[["a2ui-composer-settings"]],decls:57,vars:13,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-card-header"],[1,"mcp-header-text"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click"],["aria-hidden","true"],[1,"mcp-empty-state"],[1,"mcp-server-list"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-item"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit MCP Server","aria-label","Edit MCP Server",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete MCP Server","aria-label","Delete MCP Server",1,"mcp-delete-btn",3,"click"],[1,"mcp-server-tools"],[1,"mcp-tool-name"]],template:function(e,n){e&1&&(Dr(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Si(4,"A2UI Composer Settings"),Hr()(),Dr(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Si(9,"Renderer"),Hr(),Dr(10,"a2ui-composer-renderer-selector",5),Ds("rendererSelected",function(l){return n.onRendererSelected(l)}),Hr()(),Id(11,fn,4,1,"div",4),Dr(12,"div",6)(13,"h3"),Si(14,"Developer Authentication Overrides"),Hr(),Dr(15,"p",7),Si(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),Hr(),Dr(17,"div",8)(18,"mat-slide-toggle",9),Ds("change",function(){return n.toggleForceThirdPartyAuth()}),Si(19," Force External Third-Party Authentication Mode "),Hr()()()()(),Id(20,yn,18,0,"mat-card-footer",10),Hr(),Dr(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Si(24,"Connection Status & Diagnostics"),Hr(),Dr(25,"p",12),Si(26,"Real-time monitoring bridge"),Hr()(),Dr(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Si(31),Hr(),Dr(32,"mat-chip",15),Si(33),Hr()()(),Dr(34,"div",16)(35,"h3"),Si(36,"Overlay Logs Preview"),Hr(),Dr(37,"div",17),Id(38,vn,2,1,"code"),Id(39,_n,2,1,"code",18)(40,bn,2,0,"code",19)(41,Cn,2,0,"code")(42,wn,2,0,"code")(43,Sn,2,0,"code"),Hr()()()(),Dr(44,"mat-card",20)(45,"mat-card-header",21)(46,"div",22)(47,"h2",2),Si(48,"MCP Servers"),Hr(),Dr(49,"p",12),Si(50," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),Hr()(),Dr(51,"button",23),Ds("click",function(){return n.openAddMcpServerDialog()}),Dr(52,"mat-icon",24),Si(53,"add_circle"),Hr()()(),Dr(54,"mat-card-content"),Id(55,Mn,2,0,"div",25)(56,On,3,0,"div",26),Hr()()()),e&2&&(Yo(6),xd("formGroup",n.settingsForm),Yo(4),xd("selectedRendererId",n.selectedRendererId()),Yo(),Td(n.isThirdParty()?11:-1),Yo(),xd("hidden",!n.is1PAuthEnabled),Yo(6),xd("checked",n.forceThirdPartyAuth()),Yo(2),Td(n.isThirdParty()?20:-1),Yo(10),xd("color",n.bridgeConnected()?"primary":"accent"),Yo(),Jb("Bridge: ",n.bridgeConnected()?"Connected":"Disconnected"),Yo(),xd("color",n.catalogStatus()==="Connected"?"primary":n.catalogStatus()==="Indexing"?"accent":n.catalogStatus()==="Error"?"warn":void 0),Yo(),Jb("Catalog Handshake: ",n.catalogStatus()),Yo(5),Td(n.activeRendererUrl()?38:-1),Yo(),Td(n.catalogErrorMessage()?39:n.catalogStatus()==="Connected"?40:n.catalogStatus()==="Indexing"?41:n.bridgeConnected()?42:43),Yo(16),Td(n.mcpManager.servers().length===0?55:56));},dependencies:[fZe,uZe,cZe,hZe,ege,me,Vr,R1,O1,Xoe,VGe,UGe,E,F,k,z,T,S,j,ot,ki,ct,Vt,Fe,Yt$1,mt,y1,De,Oe],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto;container-type:inline-size;container-name:settings}.settings-container[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,1fr);align-items:start;gap:24px;padding:32px;max-width:1180px;margin:0 auto}.settings-card[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]{min-width:0;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface)}.settings-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]{padding:28px 28px 8px}.settings-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{padding:0 28px 28px}.settings-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0;font:var(--mat-sys-title-large);letter-spacing:var(--mat-sys-title-large-tracking)}.settings-card[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:8px 0 0;font:var(--mat-sys-body-medium);letter-spacing:var(--mat-sys-body-medium-tracking);color:var(--mat-sys-on-surface-variant)}.form-section[_ngcontent-%COMP%]{margin-top:24px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:0 0 12px;font:var(--mat-sys-title-small);letter-spacing:var(--mat-sys-title-small-tracking)}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);color:var(--mat-sys-on-surface-variant);padding:16px;border-radius:12px;overflow-wrap:anywhere;font:var(--mat-sys-body-small);font-family:Spline Sans Mono,monospace;letter-spacing:var(--mat-sys-body-small-tracking)}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{display:block;font-family:inherit}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] + code[_ngcontent-%COMP%]{margin-top:8px}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:var(--mat-sys-label-large-weight-prominent)}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-primary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{padding:24px 28px;border-top:1px solid var(--mat-sys-outline-variant);font:var(--mat-sys-body-small);letter-spacing:var(--mat-sys-body-small-tracking);color:var(--mat-sys-on-surface-variant)}.get-api-key[_ngcontent-%COMP%]   ol[_ngcontent-%COMP%]{padding-left:20px}.get-api-key[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--mat-sys-primary);text-underline-offset:3px}@container settings (min-width: 980px){.settings-container[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}.settings-card[_ngcontent-%COMP%]{grid-column:1;grid-row:1/span 2}.status-card[_ngcontent-%COMP%]{grid-column:2}}@container settings (max-width: 600px){.settings-container[_ngcontent-%COMP%]{padding:16px;gap:16px}.settings-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]{padding:20px 20px 8px}.settings-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{padding:0 20px 20px}.get-api-key[_ngcontent-%COMP%]{padding:20px}}.mcp-card-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mcp-card-header[_ngcontent-%COMP%]     .mat-mdc-card-header-text{display:none}.mcp-card-header[_ngcontent-%COMP%]   .mcp-header-text[_ngcontent-%COMP%]{flex:1;min-width:0}.mcp-card-header[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0;margin-top:-4px;margin-right:-8px}.mcp-empty-state[_ngcontent-%COMP%]{margin-top:16px;padding:16px;text-align:center;font-size:13px;font-style:italic;color:var(--mat-sys-on-surface-variant);border-radius:8px;border:1px dashed var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-lowest)}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:4px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{jt as Settings};