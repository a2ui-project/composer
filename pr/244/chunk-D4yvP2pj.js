import {y,cL as dZe,cM as If,ae as Kt$1,E as EB,W as Wg,a2 as aZ,l as le,N as Nl,cN as K,cO as ty,cP as qg,R as Re,p as pn$1,V as Vo,a7 as Qe,a5 as Ize,F as Ft,av as fZe,c5 as uZe,c6 as cZe,c4 as hZe,c9 as ege,ar as me,at as Vr,c as R1,O as O1,X as Xoe,e as VGe,U as UGe,cQ as y1,D as Dr,S as Si,i as Hr,h as Ds,j as Id,Y as Yo,n as xd,T as Td,J as Jb,cR as Sf,cS as sZ,cT as Iw,c3 as gT,aw as bZ,ax as aZe,c8 as Qme,cU as h1,cV as m1,cW as B1,cX as g1,as as Wt$1,cc as Be,ce as Fi,au as zr,v as vk,az as v9,P as Pm,aA as y9,w as Ye,z as qe,A as Xn,Z as Ze,bh as Df,ag as Ha,ba as j$1,bs as Io,bl as Ke,bz as Kr,bA as I1,bJ as Um,cy as oi,cY as c$e,bV as Pn,bD as xt,G as ws,K as Ur,co as GW,q as hn$1,m as ir,ab as Qo,cZ as bT,c_ as Rh,c$ as Nr,cD as uN,cJ as Ad,L as kd,bf as Rd,_ as Nm,a0 as Mm,aL as cN,aM as OAe,cg as zo,ch as Lo,d0 as Po,ci as Fe,b8 as St,aT as LW,aJ as jW,aX as OW,aY as RW,cE as SA,a1 as Fe$1,d1 as Oi,aU as hA,aV as pA}from'./main.js';import {E,F,k,z,T,S,j}from'./chunk-BKlpJoAr.js';import {o as ot,k as ki,c as ct}from'./chunk-BlxL5R9X.js';import {Y as Yt$1,m as mt}from'./chunk-9S8zMsMW.js';var Nt=["*"],Ot=(()=>{class n{labelPosition="after";static \u0275fac=function(i){return new(i||n)};static \u0275cmp=Ft({type:n,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(i,o){i&2&&hn$1("mdc-form-field--align-end",o.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Nt,decls:1,vars:0,template:function(i,o){i&1&&(ws(),Ur(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return n})();var zt=["switch"],Vt=["*"];function Gt(n,t){n&1&&(Dr(0,"span",11),SA(),Dr(1,"svg",13),vk(2,"path",14),Hr(),Dr(3,"svg",15),vk(4,"path",16),Hr()());}var Lt=new j$1("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Pe=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Ee=(()=>{class n{_elementRef=y(Ze);_focusMonitor=y(Df);_changeDetectorRef=y(Ha);defaults=y(Lt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Pe(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Io();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new Ke;toggleChange=new Ke;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){y(Kr).load(I1);let e=y(new Um("tabindex"),{optional:true}),i=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=i.color||"accent",this.id=this._uniqueId=y(oi).getId("mat-mdc-slide-toggle-"),this.hideIcon=i.hideIcon??false,this.disabledInteractive=i.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Pe(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=Ft({type:n,selectors:[["mat-slide-toggle"]],viewQuery:function(i,o){if(i&1&&Rd(zt,5),i&2){let s;Nm(s=Mm())&&(o._switchElement=s.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(i,o){i&2&&(Ad("id",o.id),ir("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),kd(o.color?"mat-"+o.color:""),hn$1("mat-mdc-slide-toggle-focused",o._focused)("mat-mdc-slide-toggle-checked",o.checked)("_mat-animation-noopable",o._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",xt],color:"color",disabled:[2,"disabled","disabled",xt],disableRipple:[2,"disableRipple","disableRipple",xt],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:uN(e)],checked:[2,"checked","checked",xt],hideIcon:[2,"hideIcon","hideIcon",xt],disabledInteractive:[2,"disabledInteractive","disabledInteractive",xt]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[Qo([{provide:bT,useExisting:Nr(()=>n),multi:true},{provide:Rh,useExisting:n,multi:true}]),Pn],ngContentSelectors:Vt,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(i,o){if(i&1&&(ws(),Dr(0,"div",1)(1,"button",2,0),Ds("click",function(){return o._handleClick()}),vk(3,"div",3)(4,"span",4),Dr(5,"span",5)(6,"span",6)(7,"span",7),vk(8,"span",8),Hr(),Dr(9,"span",9),vk(10,"span",10),Hr(),Id(11,Gt,5,0,"span",11),Hr()()(),Dr(12,"label",12),Ds("click",function(v){return v.stopPropagation()}),Ur(13),Hr()()),i&2){let s=GW(2);xd("labelPosition",o.labelPosition),Yo(),hn$1("mdc-switch--selected",o.checked)("mdc-switch--unselected",!o.checked)("mdc-switch--checked",o.checked)("mdc-switch--disabled",o.disabled)("mat-mdc-slide-toggle-disabled-interactive",o.disabledInteractive),xd("tabIndex",o.disabled&&!o.disabledInteractive?-1:o.tabIndex)("disabled",o.disabled&&!o.disabledInteractive),ir("id",o.buttonId)("name",o.name)("aria-label",o.ariaLabel)("aria-labelledby",o._getAriaLabelledBy())("aria-describedby",o.ariaDescribedby)("aria-required",o.required||null)("aria-checked",o.checked)("aria-disabled",o.disabled&&o.disabledInteractive?"true":null),Yo(9),xd("matRippleTrigger",s)("matRippleDisabled",o.disableRipple||o.disabled)("matRippleCentered",true),Yo(),Td(o.hideIcon?-1:11),Yo(),xd("for",o.buttonId),ir("id",o._labelId);}},dependencies:[c$e,Ot],styles:[`.mdc-switch {
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
`],encapsulation:2})}return n})(),Et=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=Ye({type:n});static \u0275inj=qe({imports:[Ee,Xn]})}return n})();function Ut(n,t){if(n&1&&(Dr(0,"div",5),Si(1),Hr()),n&2){let e=jW();Yo(),Pm(e.errorMessage());}}function $t(n){let t=n.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var pe=class n{fb=y(dZe);settingsService=y(K);dialogRef=y(Sf);data=y(Iw,{optional:true});errorMessage=Re(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[gT.required,gT.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[gT.required,$t]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),i=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:i,name:t,rendererUrl:e}),this.dialogRef.close(i);}catch(o){this.errorMessage.set(o instanceof Error?o.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=Ft({type:n,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:7,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","placeholder","My Renderer",3,"formControl"],["matInput","","id","renderer-url-input","placeholder","http://localhost:3000",3,"formControl"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(Dr(0,"h2",0),Si(1),Hr(),Dr(2,"mat-dialog-content")(3,"form",1),Ds("ngSubmit",function(s){return s.preventDefault(),i.onConfirm()}),Dr(4,"mat-form-field",2)(5,"mat-label"),Si(6,"Name"),Hr(),vk(7,"input",3),v9(),Hr(),Dr(8,"mat-form-field",2)(9,"mat-label"),Si(10,"Renderer URL"),Hr(),vk(11,"input",4),v9(),Hr(),Id(12,Ut,2,1,"div",5),Hr()(),Dr(13,"mat-dialog-actions",6)(14,"button",7),Si(15,"Cancel"),Hr(),Dr(16,"button",8),Ds("click",function(){return i.onConfirm()}),Si(17),Hr()()),e&2&&(Yo(),Pm(i.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),Yo(2),xd("formGroup",i.form),Yo(4),xd("formControl",i.form.controls.name),y9(),Yo(4),xd("formControl",i.form.controls.rendererUrl),y9(),Yo(),Td(i.errorMessage()?12:-1),Yo(4),xd("disabled",i.form.invalid),Yo(),Jb(" ",i.data?.renderer?"Save":"Add"," "));},dependencies:[hZe,uZe,bZ,aZe,cZe,Qme,ege,y1,h1,m1,B1,g1,me,Wt$1,Be,Vr,zr,R1,O1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ce=class n{disabled=cN(false);dialog=y(If);destroyRef=y(Kt$1);items=Re([]);selectedItem=pn$1(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(Ize(this.destroyRef)).subscribe(async o=>{o&&(await this.refreshItems(),this.emitSelection(o));});}async handleEdit(t,e,i,o){if(e.stopPropagation(),e.preventDefault(),i.readOnly)return;this.dialog.open(t,{width:"450px",data:{[o]:i}}).afterClosed().pipe(Ize(this.destroyRef)).subscribe(async v=>{v&&(await this.refreshItems(),this.getSelectedId()===v&&this.emitSelection(v));});}async handleDelete(t,e,i=null){t.stopPropagation(),t.preventDefault(),!this.items().find(s=>s.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(i));}static \u0275fac=function(e){return new(e||n)};static \u0275dir=Fe$1({type:n,inputs:{disabled:[1,"disabled"]}})};var Ht=(n,t)=>t.id;function jt(n,t){if(n&1&&(Dr(0,"span",5),Si(1),Hr()),n&2){let e=jW();Yo(),Pm(e.selectedItem()?.rendererUrl);}}function Wt(n,t){n&1&&(Dr(0,"mat-option",6),Si(1,"No items available \u2014 click + to add"),Hr()),n&2&&xd("disabled",true);}function Xt(n,t){if(n&1){let e=LW();Dr(0,"mat-option",8)(1,"div",9)(2,"div",10),Si(3),Hr(),Dr(4,"div",5),Si(5),Hr()(),Dr(6,"button",11),Ds("click",function(o){let s=hA(e).$implicit,v=jW(2);return pA(v.onEditRenderer(o,s))})("keydown",function(o){return o.stopPropagation()}),Dr(7,"mat-icon",12),Si(8,"edit"),Hr()(),Dr(9,"button",13),Ds("click",function(o){let s=hA(e).$implicit,v=jW(2);return pA(v.onDeleteRenderer(o,s.id))})("keydown",function(o){return o.stopPropagation()}),Dr(10,"mat-icon",12),Si(11,"delete"),Hr()()();}if(n&2){let e=t.$implicit;xd("value",e.id),Yo(3),Pm(e.name),Yo(2),Pm(e.rendererUrl),Yo(),xd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),ir("aria-label","Edit "+e.name),Yo(3),xd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),ir("aria-label","Delete "+e.name);}}function Qt(n,t){if(n&1&&OW(0,Xt,12,9,"mat-option",8,Ht),n&2){let e=jW();RW(e.items());}}var Ae=class n extends ce{selectedRendererId=cN("default");rendererSelected=OAe();settingsService=y(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(pe,t);}onEditRenderer(t,e){this.handleEdit(pe,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=Ft({type:n,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[St],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,i){e&1&&(Dr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Si(3,"Renderer"),Hr(),Dr(4,"mat-select",2),Ds("selectionChange",function(s){return i.onSelectionChange(s.value)}),Dr(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Si(8),Hr(),Id(9,jt,2,1,"span",5),Hr()(),Id(10,Wt,2,1,"mat-option",6)(11,Qt,2,0),Hr()(),Dr(12,"button",7),Ds("click",function(s){return i.onAddRenderer(s)}),Dr(13,"mat-icon"),Si(14,"add_circle"),Hr()()()),e&2&&(Yo(4),xd("value",i.selectedRendererId())("disabled",i.disabled()),Yo(4),Pm(i.selectedItem()?.name),Yo(),Td(i.selectedItem()?.rendererUrl?9:-1),Yo(),Td(i.items().length===0?10:11),Yo(2),xd("disabled",i.disabled()));},dependencies:[me,Wt$1,Be,zo,Lo,Po,Fe,R1,Xoe,VGe,UGe,Yt$1,mt,y1],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function Yt(n,t){if(n&1&&(Dr(0,"div",7),Si(1),Hr()),n&2){let e=jW();Yo(),Pm(e.errorMessage());}}var he=class n{fb=y(dZe);settingsService=y(K);dialogRef=y(Sf);data=y(Iw,{optional:true});errorMessage=Re(null);hideApiKey=Re(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[gT.required,gT.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[gT.required,gT.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),i=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(i,t,e),this.dialogRef.close(i);}catch(o){this.errorMessage.set(o instanceof Error?o.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=Ft({type:n,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:10,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","placeholder","My Gemini Key",3,"formControl"],["matInput","","id","api-key-value-input","placeholder","Paste your API key here",3,"type","formControl"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(Dr(0,"h2",0),Si(1),Hr(),Dr(2,"mat-dialog-content")(3,"form",1),Ds("ngSubmit",function(s){return s.preventDefault(),i.onConfirm()}),Dr(4,"mat-form-field",2)(5,"mat-label"),Si(6,"Name"),Hr(),vk(7,"input",3),v9(),Hr(),Dr(8,"mat-form-field",2)(9,"mat-label"),Si(10,"API Key"),Hr(),vk(11,"input",4),v9(),Dr(12,"button",5),Ds("click",function(){return i.toggleHideApiKey()}),Dr(13,"mat-icon",6),Si(14),Hr()()(),Id(15,Yt,2,1,"div",7),Hr()(),Dr(16,"mat-dialog-actions",8)(17,"button",9),Si(18,"Cancel"),Hr(),Dr(19,"button",10),Ds("click",function(){return i.onConfirm()}),Si(20),Hr()()),e&2&&(Yo(),Pm(i.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),Yo(2),xd("formGroup",i.form),Yo(4),xd("formControl",i.form.controls.name),y9(),Yo(4),xd("type",i.hideApiKey()?"password":"text")("formControl",i.form.controls.apiKey),y9(),Yo(),ir("aria-label",i.hideApiKey()?"Show API key":"Hide API key"),Yo(2),Pm(i.hideApiKey()?"visibility":"visibility_off"),Yo(),Td(i.errorMessage()?15:-1),Yo(4),xd("disabled",i.form.invalid),Yo(),Jb(" ",i.data?.apiKey?"Save":"Add"," "));},dependencies:[hZe,uZe,bZ,aZe,cZe,Qme,ege,y1,h1,m1,B1,g1,me,Wt$1,Be,Oi,Vr,zr,R1,O1,Xoe,VGe,UGe],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var Zt=(n,t)=>t.id;function Jt(n,t){n&1&&(Dr(0,"mat-option",3),Si(1,"No items available \u2014 click + to add"),Hr()),n&2&&xd("disabled",true);}function en(n,t){if(n&1){let e=LW();Dr(0,"mat-option",5)(1,"span",6),Si(2),Hr(),Dr(3,"button",7),Ds("keydown",function(o){return o.stopPropagation()})("click",function(o){let s=hA(e).$implicit,v=jW(2);return pA(v.onEditApiKey(o,s))}),Dr(4,"mat-icon",8),Si(5,"edit"),Hr()(),Dr(6,"button",9),Ds("keydown",function(o){return o.stopPropagation()})("click",function(o){let s=hA(e).$implicit,v=jW(2);return pA(v.onDeleteApiKey(o,s.id))}),Dr(7,"mat-icon",8),Si(8,"delete"),Hr()()();}if(n&2){let e=t.$implicit;xd("value",e.id),Yo(2),Pm(e.name),Yo(),xd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),ir("aria-label","Edit "+e.name),Yo(3),xd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),ir("aria-label","Delete "+e.name);}}function tn(n,t){if(n&1&&OW(0,en,9,8,"mat-option",5,Zt),n&2){let e=jW();RW(e.items());}}var De=class n extends ce{selectedApiKeyId=cN(null);apiKeySelected=OAe();settingsService=y(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(he,t);}onEditApiKey(t,e){this.handleEdit(he,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=Ft({type:n,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[St],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,i){e&1&&(Dr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Si(3,"API Key"),Hr(),Dr(4,"mat-select",2),Ds("selectionChange",function(s){return i.onSelectionChange(s.value)}),Dr(5,"mat-select-trigger"),Si(6),Hr(),Id(7,Jt,2,1,"mat-option",3)(8,tn,2,0),Hr()(),Dr(9,"button",4),Ds("click",function(s){return i.onAddApiKey(s)}),Dr(10,"mat-icon"),Si(11,"add_circle"),Hr()()()),e&2&&(Yo(4),xd("value",i.selectedApiKeyId())("disabled",i.disabled()),Yo(2),Jb(" ",i.selectedItem()?.name," "),Yo(),Td(i.items().length===0?7:8),Yo(2),xd("disabled",i.disabled()));},dependencies:[me,Wt$1,Be,zo,Lo,Po,Fe,R1,Xoe,VGe,UGe,Yt$1,mt,y1],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function nn(n,t){n&1&&(Dr(0,"mat-error"),Si(1,"Enter a supported MCP server address"),Hr());}function an(n,t){if(n&1&&(Dr(0,"div",4),Si(1),Hr()),n&2){let e=jW();Yo(),Pm(e.errorMessage());}}var fe=class n{fb=y(dZe);dialogRef=y(Sf);connector=y(sZ);data=y(Iw,{optional:true});errorMessage=Re(null);addressHint=this.connector.addressHint??"";addressValidator=t=>!t.value||this.connector.supports(t.value.trim())?null:{invalidUrl:true};form=this.fb.group({url:[this.data?.server?.url??"",[gT.required,this.addressValidator]]});onConfirm(){this.errorMessage.set(null);let t=this.form.controls.url.value.trim();this.dialogRef.close({url:t});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=Ft({type:n,selectors:[["a2ui-composer-mcp-server-dialog"]],decls:15,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","mcp-server-url-input",3,"formControl","placeholder"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","button","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(Dr(0,"h2",0),Si(1),Hr(),Dr(2,"mat-dialog-content")(3,"form",1),Ds("ngSubmit",function(s){return s.preventDefault(),i.onConfirm()}),Dr(4,"mat-form-field",2)(5,"mat-label"),Si(6,"Server URL"),Hr(),vk(7,"input",3),v9(),Id(8,nn,2,0,"mat-error"),Hr(),Id(9,an,2,1,"div",4),Hr()(),Dr(10,"mat-dialog-actions",5)(11,"button",6),Si(12,"Cancel"),Hr(),Dr(13,"button",7),Ds("click",function(){return i.onConfirm()}),Si(14),Hr()()),e&2&&(Yo(),Pm(i.data?.server?"Edit MCP Server":"Add MCP Server"),Yo(2),xd("formGroup",i.form),Yo(4),xd("formControl",i.form.controls.url)("placeholder",i.addressHint),y9(),Yo(),Td(i.form.controls.url.hasError("invalidUrl")?8:-1),Yo(),Td(i.errorMessage()?9:-1),Yo(4),xd("disabled",i.form.invalid),Yo(),Jb(" ",i.data?.server?"Save":"Add"," "));},dependencies:[hZe,uZe,bZ,aZe,cZe,Qme,ege,y1,h1,m1,B1,g1,me,Wt$1,Be,Fi,Vr,zr,R1,O1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var rn=(n,t)=>t.id,on=(n,t)=>t.name;function ln(n,t){if(n&1){let e=LW();Dr(0,"div",4)(1,"h3"),Si(2,"Gemini API Provisioning"),Hr(),Dr(3,"a2ui-composer-api-key-selector",27),Ds("apiKeySelected",function(o){hA(e);let s=jW();return pA(s.onApiKeySelected(o))}),Hr()();}if(n&2){let e=jW();Yo(3),xd("selectedApiKeyId",e.selectedApiKeyId());}}function dn(n,t){n&1&&(Dr(0,"mat-card-footer",10),Si(1," To obtain an API key: "),Dr(2,"ol")(3,"li"),Si(4," Go to "),Dr(5,"a",28),Si(6," Google AI Studio"),Hr(),Si(7," and sign in with your Google account. "),Hr(),Dr(8,"li"),Si(9,"Click Create API key."),Hr(),Dr(10,"li"),Si(11,"Select or create a Google Cloud project when prompted, then click Create key."),Hr(),Dr(12,"li"),Si(13,"Save your key in a secure location!"),Hr()(),Si(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),Dr(15,"a",29),Si(16,"Web Crypto API"),Hr(),Si(17,". Neither Google nor anyone else has access to this key. "),Hr());}function sn(n,t){if(n&1&&(Dr(0,"code"),Si(1),Hr()),n&2){let e=jW();Yo(),Jb("[System] Active renderer updated to ",e.activeRendererUrl());}}function cn(n,t){if(n&1&&(Dr(0,"code",18),Si(1),Hr()),n&2){let e=jW();Yo(),Jb("[Catalog Error] ",e.catalogErrorMessage());}}function mn(n,t){n&1&&(Dr(0,"code",19),Si(1,"[System] Catalog handshake completed successfully. Active catalog ready."),Hr());}function pn(n,t){n&1&&(Dr(0,"code"),Si(1,"[System] Catalog handshake in progress. Indexing metadata..."),Hr());}function gn(n,t){n&1&&(Dr(0,"code"),Si(1,"[System] Bridge connected. Initializing catalog handshake..."),Hr());}function un(n,t){n&1&&(Dr(0,"code"),Si(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),Hr());}function hn(n,t){n&1&&(Dr(0,"div",25),Si(1,"No MCP servers configured \u2014 click + to add"),Hr());}function fn(n,t){if(n&1&&Si(0),n&2){let e=jW().$implicit;Jb(" Connected (",e.tools?.length||0," tools) ");}}function _n(n,t){n&1&&Si(0," Connecting... ");}function vn(n,t){if(n&1&&Si(0),n&2){let e=jW().$implicit;Jb(" Error: ",e.errorMessage||"Failed to connect"," ");}}function yn(n,t){n&1&&Si(0," Disconnected ");}function bn(n,t){if(n&1&&(Dr(0,"span",38),Si(1),Hr()),n&2){let e=jW().$implicit;Yo(),Pm(e.url);}}function Cn(n,t){if(n&1&&(Dr(0,"span",44),Si(1),Hr()),n&2){let e=t.$implicit;Yo(),Pm(e.name);}}function wn(n,t){if(n&1&&(Dr(0,"div",43),OW(1,Cn,2,1,"span",44,on),Hr()),n&2){let e=jW().$implicit;Yo(),RW(e.tools);}}function Mn(n,t){if(n&1){let e=LW();Dr(0,"div",30)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),Ds("change",function(o){let s=hA(e).$implicit,v=jW(2);return pA(v.toggleMcpServer(s.id,o.checked))}),Hr(),Dr(4,"div",34)(5,"div",35)(6,"span",36),Si(7),Hr(),Dr(8,"span",37),Id(9,fn,1,1)(10,_n,1,0)(11,vn,1,1)(12,yn,1,0),Hr()(),Id(13,bn,2,1,"span",38),Hr()(),Dr(14,"div",39)(15,"button",40),Ds("click",function(){let o=hA(e).$implicit,s=jW(2);return pA(s.testMcpServer(o.id))}),Si(16," Test "),Hr(),Dr(17,"button",41),Ds("click",function(){let o=hA(e).$implicit,s=jW(2);return pA(s.openEditMcpServerDialog(o))}),Dr(18,"mat-icon",24),Si(19,"edit"),Hr()(),Dr(20,"button",42),Ds("click",function(){let o=hA(e).$implicit,s=jW(2);return pA(s.removeMcpServer(o.id))}),Dr(21,"mat-icon",24),Si(22,"delete"),Hr()()()(),Id(23,wn,3,0,"div",43),Hr();}if(n&2){let e=t.$implicit;Yo(3),xd("checked",e.enabled),ir("aria-label","Toggle "+(e.name||e.url)),Yo(4),Pm(e.name||e.url),Yo(),ir("data-status",e.status),Yo(),Td(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),Yo(4),Td(e.name&&e.name!==e.url?13:-1),Yo(10),Td(e.tools&&e.tools.length>0?23:-1);}}function xn(n,t){if(n&1&&(Dr(0,"div",26),OW(1,Mn,24,7,"div",30,rn),Hr()),n&2){let e=jW();Yo(),RW(e.mcpManager.servers());}}var Kt=class n{fb=y(dZe);dialog=y(If);destroyRef=y(Kt$1);startupResolution=y(EB);startupConfigState=y(Wg);hostCommunication=y(aZ);catalogManagement=y(le);configProvider=y(Nl);settingsService=y(K);mcpManager=y(ty);is1PAuthEnabled=y(qg);selectedRendererId=Re(null);selectedApiKeyId=pn$1(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=pn$1(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=Re(false);isApiKeyProvidedByConfig=pn$1(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=pn$1(()=>this.isApiKeyProvidedByConfig());hideApiKey=Re(true);forceThirdPartyAuth=Re(false);bridgeConnected=pn$1(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=pn$1(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=pn$1(()=>this.catalogManagement.catalogError());activeRendererUrl=pn$1(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){Vo(()=>{let t=this.settingsService.selectedRendererId()||"default";Qe(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}openAddMcpServerDialog(){this.dialog.open(fe,{width:"450px"}).afterClosed().pipe(Ize(this.destroyRef)).subscribe(e=>{e?.url&&this.mcpManager.addServer(e.url);});}openEditMcpServerDialog(t){this.dialog.open(fe,{width:"450px",data:{server:t}}).afterClosed().pipe(Ize(this.destroyRef)).subscribe(i=>{i?.url&&this.mcpManager.updateServerUrl(t.id,i.url);});}async removeMcpServer(t){await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=Ft({type:n,selectors:[["a2ui-composer-settings"]],decls:57,vars:13,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-card-header"],[1,"mcp-header-text"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click"],["aria-hidden","true"],[1,"mcp-empty-state"],[1,"mcp-server-list"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-item"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit MCP Server","aria-label","Edit MCP Server",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete MCP Server","aria-label","Delete MCP Server",1,"mcp-delete-btn",3,"click"],[1,"mcp-server-tools"],[1,"mcp-tool-name"]],template:function(e,i){e&1&&(Dr(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Si(4,"A2UI Composer Settings"),Hr()(),Dr(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Si(9,"Renderer"),Hr(),Dr(10,"a2ui-composer-renderer-selector",5),Ds("rendererSelected",function(s){return i.onRendererSelected(s)}),Hr()(),Id(11,ln,4,1,"div",4),Dr(12,"div",6)(13,"h3"),Si(14,"Developer Authentication Overrides"),Hr(),Dr(15,"p",7),Si(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),Hr(),Dr(17,"div",8)(18,"mat-slide-toggle",9),Ds("change",function(){return i.toggleForceThirdPartyAuth()}),Si(19," Force External Third-Party Authentication Mode "),Hr()()()()(),Id(20,dn,18,0,"mat-card-footer",10),Hr(),Dr(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Si(24,"Connection Status & Diagnostics"),Hr(),Dr(25,"p",12),Si(26,"Real-time monitoring bridge"),Hr()(),Dr(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Si(31),Hr(),Dr(32,"mat-chip",15),Si(33),Hr()()(),Dr(34,"div",16)(35,"h3"),Si(36,"Overlay Logs Preview"),Hr(),Dr(37,"div",17),Id(38,sn,2,1,"code"),Id(39,cn,2,1,"code",18)(40,mn,2,0,"code",19)(41,pn,2,0,"code")(42,gn,2,0,"code")(43,un,2,0,"code"),Hr()()()(),Dr(44,"mat-card",20)(45,"mat-card-header",21)(46,"div",22)(47,"h2",2),Si(48,"MCP Servers"),Hr(),Dr(49,"p",12),Si(50," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),Hr()(),Dr(51,"button",23),Ds("click",function(){return i.openAddMcpServerDialog()}),Dr(52,"mat-icon",24),Si(53,"add_circle"),Hr()()(),Dr(54,"mat-card-content"),Id(55,hn,2,0,"div",25)(56,xn,3,0,"div",26),Hr()()()),e&2&&(Yo(6),xd("formGroup",i.settingsForm),Yo(4),xd("selectedRendererId",i.selectedRendererId()),Yo(),Td(i.isThirdParty()?11:-1),Yo(),xd("hidden",!i.is1PAuthEnabled),Yo(6),xd("checked",i.forceThirdPartyAuth()),Yo(2),Td(i.isThirdParty()?20:-1),Yo(10),xd("color",i.bridgeConnected()?"primary":"accent"),Yo(),Jb("Bridge: ",i.bridgeConnected()?"Connected":"Disconnected"),Yo(),xd("color",i.catalogStatus()==="Connected"?"primary":i.catalogStatus()==="Indexing"?"accent":i.catalogStatus()==="Error"?"warn":void 0),Yo(),Jb("Catalog Handshake: ",i.catalogStatus()),Yo(5),Td(i.activeRendererUrl()?38:-1),Yo(),Td(i.catalogErrorMessage()?39:i.catalogStatus()==="Connected"?40:i.catalogStatus()==="Indexing"?41:i.bridgeConnected()?42:43),Yo(16),Td(i.mcpManager.servers().length===0?55:56));},dependencies:[fZe,uZe,cZe,hZe,ege,me,Vr,R1,O1,Xoe,VGe,UGe,E,F,k,z,T,S,j,ot,ki,ct,Et,Ee,Yt$1,mt,y1,Ae,De],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto;container-type:inline-size;container-name:settings}.settings-container[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,1fr);align-items:start;gap:24px;padding:32px;max-width:1180px;margin:0 auto}.settings-card[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]{min-width:0;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface)}.settings-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]{padding:28px 28px 8px}.settings-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{padding:0 28px 28px}.settings-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0;font:var(--mat-sys-title-large);letter-spacing:var(--mat-sys-title-large-tracking)}.settings-card[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:8px 0 0;font:var(--mat-sys-body-medium);letter-spacing:var(--mat-sys-body-medium-tracking);color:var(--mat-sys-on-surface-variant)}.form-section[_ngcontent-%COMP%]{margin-top:24px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:0 0 12px;font:var(--mat-sys-title-small);letter-spacing:var(--mat-sys-title-small-tracking)}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);color:var(--mat-sys-on-surface-variant);padding:16px;border-radius:12px;overflow-wrap:anywhere;font:var(--mat-sys-body-small);font-family:Spline Sans Mono,monospace;letter-spacing:var(--mat-sys-body-small-tracking)}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{display:block;font-family:inherit}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] + code[_ngcontent-%COMP%]{margin-top:8px}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:var(--mat-sys-label-large-weight-prominent)}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-primary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{padding:24px 28px;border-top:1px solid var(--mat-sys-outline-variant);font:var(--mat-sys-body-small);letter-spacing:var(--mat-sys-body-small-tracking);color:var(--mat-sys-on-surface-variant)}.get-api-key[_ngcontent-%COMP%]   ol[_ngcontent-%COMP%]{padding-left:20px}.get-api-key[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--mat-sys-primary);text-underline-offset:3px}@container settings (min-width: 980px){.settings-container[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}.settings-card[_ngcontent-%COMP%]{grid-column:1;grid-row:1/span 2}.status-card[_ngcontent-%COMP%]{grid-column:2}}@container settings (max-width: 600px){.settings-container[_ngcontent-%COMP%]{padding:16px;gap:16px}.settings-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]{padding:20px 20px 8px}.settings-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{padding:0 20px 20px}.get-api-key[_ngcontent-%COMP%]{padding:20px}}.mcp-card-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mcp-card-header[_ngcontent-%COMP%]     .mat-mdc-card-header-text{display:none}.mcp-card-header[_ngcontent-%COMP%]   .mcp-header-text[_ngcontent-%COMP%]{flex:1;min-width:0}.mcp-card-header[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0;margin-top:-4px;margin-right:-8px}.mcp-empty-state[_ngcontent-%COMP%]{margin-top:16px;padding:16px;text-align:center;font-size:13px;font-style:italic;color:var(--mat-sys-on-surface-variant);border-radius:8px;border:1px dashed var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-lowest)}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:4px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{Kt as Settings};