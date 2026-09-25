import {K}from'./chunk-CUshs9bk.js';import {E,F,k,z,T,S,j}from'./chunk-UZpoCfOc.js';import {_,an as tp,a7 as hn,p as pv,F as FB,Q as a3,s as se,J as Jl,ao as s_,cO as $B,g as gt,l as lf,U as Ua,a0 as Po,Y as a$e,a as an,K as KH,W as WH,b as gce,ar as $H,D as Dr,M as Mo,c as Ur,S as Sg,n as nf,f as Ki,o as of,r as rf,i as UD,aH as ep,aI as hI,aO as OH,aJ as RH,aK as MH,aL as NH,e as jF,ah as $W,T as Tg,ai as FW,v as Nt$1,w as St,x as Si$1,y as dt,b4 as Qf,a9 as Ng,aX as W,aT as Wo,aV as wt,b5 as Kr,b6 as GH,c6 as BL,aW as so,b7 as JUe,cf as yi$1,b1 as cn,I as Il,B as eo,bh as d5,H as Hr,h as Xi,a4 as HD,cP as Sd,cC as IL,bz as sf,C as jD,b3 as cf,E as Ig,G as xg,aE as wL,aF as nNe,bc as qn,bd as i5,aC as a5,aM as YK,aN as QK,bk as WM,O as xt,be as PM,bf as $M}from'./main.js';import {o as ot,k as ki$1,c as ct}from'./chunk-IC13rBzt.js';import {Y as Yt$1,m as mt}from'./chunk-C-v2sw3z.js';import {m as me,V as Vr,W as Wt$1,B as Be,z as zr,a as zo,L as Lo,P as Po$1,F as Fe,O as Oi$1}from'./chunk-CBfLpgTp.js';import {b as Ni,k as ki,x as xi,I as Ii,O as Oi,U as Un,l as li$1,a as ai$1,N as Ne,A as At,S as Si,j as jn,c as je,Y}from'./chunk-DeYL1Go6.js';var Kt=["*"],Dt=(()=>{class i{labelPosition="after";static \u0275fac=function(n){return new(n||i)};static \u0275cmp=an({type:i,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(n,r){n&2&&Hr("mdc-form-field--align-end",r.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Kt,decls:1,vars:0,template:function(n,r){n&1&&(Il(),eo(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return i})();var Nt=["switch"],zt=["*"];function Vt(i,t){i&1&&(Dr(0,"span",11),WM(),Dr(1,"svg",13),jF(2,"path",14),Ur(),Dr(3,"svg",15),jF(4,"path",16),Ur()());}var Gt=new W("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Pe=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Te=(()=>{class i{_elementRef=_(dt);_focusMonitor=_(Qf);_changeDetectorRef=_(Ng);defaults=_(Gt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Pe(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Wo();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new wt;toggleChange=new wt;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){_(Kr).load(GH);let e=_(new BL("tabindex"),{optional:true}),n=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=n.color||"accent",this.id=this._uniqueId=_(so).getId("mat-mdc-slide-toggle-"),this.hideIcon=n.hideIcon??false,this.disabledInteractive=n.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Pe(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=an({type:i,selectors:[["mat-slide-toggle"]],viewQuery:function(n,r){if(n&1&&cf(Nt,5),n&2){let s;Ig(s=xg())&&(r._switchElement=s.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(n,r){n&2&&(sf("id",r.id),Xi("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),jD(r.color?"mat-"+r.color:""),Hr("mat-mdc-slide-toggle-focused",r._focused)("mat-mdc-slide-toggle-checked",r.checked)("_mat-animation-noopable",r._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",cn],color:"color",disabled:[2,"disabled","disabled",cn],disableRipple:[2,"disableRipple","disableRipple",cn],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:IL(e)],checked:[2,"checked","checked",cn],hideIcon:[2,"hideIcon","hideIcon",cn],disabledInteractive:[2,"disabledInteractive","disabledInteractive",cn]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[HD([{provide:je,useExisting:Sd(()=>i),multi:true},{provide:Y,useExisting:i,multi:true}]),yi$1],ngContentSelectors:zt,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(n,r){if(n&1&&(Il(),Dr(0,"div",1)(1,"button",2,0),Sg("click",function(){return r._handleClick()}),jF(3,"div",3)(4,"span",4),Dr(5,"span",5)(6,"span",6)(7,"span",7),jF(8,"span",8),Ur(),Dr(9,"span",9),jF(10,"span",10),Ur(),nf(11,Vt,5,0,"span",11),Ur()()(),Dr(12,"label",12),Sg("click",function(v){return v.stopPropagation()}),eo(13),Ur()()),n&2){let s=d5(2);of("labelPosition",r.labelPosition),Ki(),Hr("mdc-switch--selected",r.checked)("mdc-switch--unselected",!r.checked)("mdc-switch--checked",r.checked)("mdc-switch--disabled",r.disabled)("mat-mdc-slide-toggle-disabled-interactive",r.disabledInteractive),of("tabIndex",r.disabled&&!r.disabledInteractive?-1:r.tabIndex)("disabled",r.disabled&&!r.disabledInteractive),Xi("id",r.buttonId)("name",r.name)("aria-label",r.ariaLabel)("aria-labelledby",r._getAriaLabelledBy())("aria-describedby",r.ariaDescribedby)("aria-required",r.required||null)("aria-checked",r.checked)("aria-disabled",r.disabled&&r.disabledInteractive?"true":null),Ki(9),of("matRippleTrigger",s)("matRippleDisabled",r.disableRipple||r.disabled)("matRippleCentered",true),Ki(),rf(r.hideIcon?-1:11),Ki(),of("for",r.buttonId),Xi("id",r._labelId);}},dependencies:[JUe,Dt],styles:[`.mdc-switch {
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
`],encapsulation:2})}return i})(),Et=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=Nt$1({type:i});static \u0275inj=St({imports:[Te,Si$1]})}return i})();function Bt(i,t){if(i&1&&(Dr(0,"div",5),Mo(1),Ur()),i&2){let e=a5();Ki(),Tg(e.errorMessage());}}function Oe(i){let t=i.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var pe=class i{fb=_(Ni);settingsService=_(K);dialogRef=_(ep);data=_(hI,{optional:true});errorMessage=gt(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[Ne.required,Ne.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[Ne.required,Oe]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),n=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:n,name:t,rendererUrl:e}),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","formControlName","name","placeholder","My Renderer"],["matInput","","id","renderer-url-input","formControlName","rendererUrl","placeholder","http://localhost:3000"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Dr(0,"h2",0),Mo(1),Ur(),Dr(2,"mat-dialog-content")(3,"form",1),Sg("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),Dr(4,"mat-form-field",2)(5,"mat-label"),Mo(6,"Name"),Ur(),jF(7,"input",3),$W(),Ur(),Dr(8,"mat-form-field",2)(9,"mat-label"),Mo(10,"Renderer URL"),Ur(),jF(11,"input",4),$W(),Ur(),nf(12,Bt,2,1,"div",5),Ur()(),Dr(13,"mat-dialog-actions",6)(14,"button",7),Mo(15,"Cancel"),Ur(),Dr(16,"button",8),Sg("click",function(){return n.onConfirm()}),Mo(17),Ur()()),e&2&&(Ki(),Tg(n.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),Ki(2),of("formGroup",n.form),Ki(4),FW(),Ki(4),FW(),Ki(),rf(n.errorMessage()?12:-1),Ki(4),of("disabled",n.form.invalid),Ki(),UD(" ",n.data?.renderer?"Save":"Add"," "));},dependencies:[Oi,xi,At,Si,Ii,Un,jn,$H,OH,RH,MH,NH,me,Wt$1,Be,Vr,zr,KH,WH],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ce=class i{disabled=wL(false);dialog=_(tp);destroyRef=_(hn);items=gt([]);selectedItem=lf(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(a$e(this.destroyRef)).subscribe(async r=>{r&&(await this.refreshItems(),this.emitSelection(r));});}async handleEdit(t,e,n,r){if(e.stopPropagation(),e.preventDefault(),n.readOnly)return;this.dialog.open(t,{width:"450px",data:{[r]:n}}).afterClosed().pipe(a$e(this.destroyRef)).subscribe(async v=>{v&&(await this.refreshItems(),this.getSelectedId()===v&&this.emitSelection(v));});}async handleDelete(t,e,n=null){t.stopPropagation(),t.preventDefault(),!this.items().find(s=>s.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(n));}static \u0275fac=function(e){return new(e||i)};static \u0275dir=xt({type:i,inputs:{disabled:[1,"disabled"]}})};var $t=(i,t)=>t.id;function qt(i,t){if(i&1&&(Dr(0,"span",5),Mo(1),Ur()),i&2){let e=a5();Ki(),Tg(e.selectedItem()?.rendererUrl);}}function jt(i,t){i&1&&(Dr(0,"mat-option",6),Mo(1,"No items available \u2014 click + to add"),Ur()),i&2&&of("disabled",true);}function Ht(i,t){if(i&1){let e=i5();Dr(0,"mat-option",8)(1,"div",9)(2,"div",10),Mo(3),Ur(),Dr(4,"div",5),Mo(5),Ur()(),Dr(6,"button",11),Sg("click",function(r){let s=PM(e).$implicit,v=a5(2);return $M(v.onEditRenderer(r,s))})("keydown",function(r){return r.stopPropagation()}),Dr(7,"mat-icon",12),Mo(8,"edit"),Ur()(),Dr(9,"button",13),Sg("click",function(r){let s=PM(e).$implicit,v=a5(2);return $M(v.onDeleteRenderer(r,s.id))})("keydown",function(r){return r.stopPropagation()}),Dr(10,"mat-icon",12),Mo(11,"delete"),Ur()()();}if(i&2){let e=t.$implicit;of("value",e.id),Ki(3),Tg(e.name),Ki(2),Tg(e.rendererUrl),Ki(),of("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),Xi("aria-label","Edit "+e.name),Ki(3),of("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),Xi("aria-label","Delete "+e.name);}}function Wt(i,t){if(i&1&&YK(0,Ht,12,9,"mat-option",8,$t),i&2){let e=a5();QK(e.items());}}var Ae=class i extends ce{selectedRendererId=wL("default");rendererSelected=nNe();settingsService=_(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(pe,t);}onEditRenderer(t,e){this.handleEdit(pe,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[qn],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,n){e&1&&(Dr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Mo(3,"Renderer"),Ur(),Dr(4,"mat-select",2),Sg("selectionChange",function(s){return n.onSelectionChange(s.value)}),Dr(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Mo(8),Ur(),nf(9,qt,2,1,"span",5),Ur()(),nf(10,jt,2,1,"mat-option",6)(11,Wt,2,0),Ur()(),Dr(12,"button",7),Sg("click",function(s){return n.onAddRenderer(s)}),Dr(13,"mat-icon"),Mo(14,"add_circle"),Ur()()()),e&2&&(Ki(4),of("value",n.selectedRendererId())("disabled",n.disabled()),Ki(4),Tg(n.selectedItem()?.name),Ki(),rf(n.selectedItem()?.rendererUrl?9:-1),Ki(),rf(n.items().length===0?10:11),Ki(2),of("disabled",n.disabled()));},dependencies:[me,Wt$1,Be,zo,Lo,Po$1,Fe,KH,gce,li$1,ai$1,Yt$1,mt,$H],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-option-supporting-text-color, #666);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function Xt(i,t){if(i&1&&(Dr(0,"div",7),Mo(1),Ur()),i&2){let e=a5();Ki(),Tg(e.errorMessage());}}var he=class i{fb=_(Ni);settingsService=_(K);dialogRef=_(ep);data=_(hI,{optional:true});errorMessage=gt(null);hideApiKey=gt(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[Ne.required,Ne.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[Ne.required,Ne.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),n=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(n,t,e),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","formControlName","name","placeholder","My Gemini Key"],["matInput","","id","api-key-value-input","formControlName","apiKey","placeholder","Paste your API key here",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Dr(0,"h2",0),Mo(1),Ur(),Dr(2,"mat-dialog-content")(3,"form",1),Sg("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),Dr(4,"mat-form-field",2)(5,"mat-label"),Mo(6,"Name"),Ur(),jF(7,"input",3),$W(),Ur(),Dr(8,"mat-form-field",2)(9,"mat-label"),Mo(10,"API Key"),Ur(),jF(11,"input",4),$W(),Dr(12,"button",5),Sg("click",function(){return n.toggleHideApiKey()}),Dr(13,"mat-icon",6),Mo(14),Ur()()(),nf(15,Xt,2,1,"div",7),Ur()(),Dr(16,"mat-dialog-actions",8)(17,"button",9),Mo(18,"Cancel"),Ur(),Dr(19,"button",10),Sg("click",function(){return n.onConfirm()}),Mo(20),Ur()()),e&2&&(Ki(),Tg(n.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),Ki(2),of("formGroup",n.form),Ki(4),FW(),Ki(4),of("type",n.hideApiKey()?"password":"text"),FW(),Ki(),Xi("aria-label",n.hideApiKey()?"Show API key":"Hide API key"),Ki(2),Tg(n.hideApiKey()?"visibility":"visibility_off"),Ki(),rf(n.errorMessage()?15:-1),Ki(4),of("disabled",n.form.invalid),Ki(),UD(" ",n.data?.apiKey?"Save":"Add"," "));},dependencies:[Oi,xi,At,Si,Ii,Un,jn,$H,OH,RH,MH,NH,me,Wt$1,Be,Oi$1,Vr,zr,KH,WH,gce,li$1,ai$1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var Qt=(i,t)=>t.id;function Yt(i,t){i&1&&(Dr(0,"mat-option",3),Mo(1,"No items available \u2014 click + to add"),Ur()),i&2&&of("disabled",true);}function Zt(i,t){if(i&1){let e=i5();Dr(0,"mat-option",5)(1,"span",6),Mo(2),Ur(),Dr(3,"button",7),Sg("keydown",function(r){return r.stopPropagation()})("click",function(r){let s=PM(e).$implicit,v=a5(2);return $M(v.onEditApiKey(r,s))}),Dr(4,"mat-icon",8),Mo(5,"edit"),Ur()(),Dr(6,"button",9),Sg("keydown",function(r){return r.stopPropagation()})("click",function(r){let s=PM(e).$implicit,v=a5(2);return $M(v.onDeleteApiKey(r,s.id))}),Dr(7,"mat-icon",8),Mo(8,"delete"),Ur()()();}if(i&2){let e=t.$implicit;of("value",e.id),Ki(2),Tg(e.name),Ki(),of("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),Xi("aria-label","Edit "+e.name),Ki(3),of("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),Xi("aria-label","Delete "+e.name);}}function Jt(i,t){if(i&1&&YK(0,Zt,9,8,"mat-option",5,Qt),i&2){let e=a5();QK(e.items());}}var De=class i extends ce{selectedApiKeyId=wL(null);apiKeySelected=nNe();settingsService=_(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(he,t);}onEditApiKey(t,e){this.handleEdit(he,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[qn],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,n){e&1&&(Dr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Mo(3,"API Key"),Ur(),Dr(4,"mat-select",2),Sg("selectionChange",function(s){return n.onSelectionChange(s.value)}),Dr(5,"mat-select-trigger"),Mo(6),Ur(),nf(7,Yt,2,1,"mat-option",3)(8,Jt,2,0),Ur()(),Dr(9,"button",4),Sg("click",function(s){return n.onAddApiKey(s)}),Dr(10,"mat-icon"),Mo(11,"add_circle"),Ur()()()),e&2&&(Ki(4),of("value",n.selectedApiKeyId())("disabled",n.disabled()),Ki(2),UD(" ",n.selectedItem()?.name," "),Ki(),rf(n.items().length===0?7:8),Ki(2),of("disabled",n.disabled()));},dependencies:[me,Wt$1,Be,zo,Lo,Po$1,Fe,KH,gce,li$1,ai$1,Yt$1,mt,$H],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function ei(i,t){if(i&1&&(Dr(0,"div",4),Mo(1),Ur()),i&2){let e=a5();Ki(),Tg(e.errorMessage());}}var fe=class i{fb=_(Ni);dialogRef=_(ep);data=_(hI,{optional:true});errorMessage=gt(null);form=this.fb.group({url:[this.data?.server?.url??"",[Ne.required,Oe]]});onConfirm(){this.errorMessage.set(null);let t=this.form.controls.url.value.trim();this.dialogRef.close({url:t});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-mcp-server-dialog"]],decls:14,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","mcp-server-url-input","formControlName","url","placeholder","http://localhost:3001/mcp"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","button","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Dr(0,"h2",0),Mo(1),Ur(),Dr(2,"mat-dialog-content")(3,"form",1),Sg("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),Dr(4,"mat-form-field",2)(5,"mat-label"),Mo(6,"Server URL"),Ur(),jF(7,"input",3),$W(),Ur(),nf(8,ei,2,1,"div",4),Ur()(),Dr(9,"mat-dialog-actions",5)(10,"button",6),Mo(11,"Cancel"),Ur(),Dr(12,"button",7),Sg("click",function(){return n.onConfirm()}),Mo(13),Ur()()),e&2&&(Ki(),Tg(n.data?.server?"Edit MCP Server":"Add MCP Server"),Ki(2),of("formGroup",n.form),Ki(4),FW(),Ki(),rf(n.errorMessage()?8:-1),Ki(4),of("disabled",n.form.invalid),Ki(),UD(" ",n.data?.server?"Save":"Add"," "));},dependencies:[Oi,xi,At,Si,Ii,Un,jn,$H,OH,RH,MH,NH,me,Wt$1,Be,Vr,zr,KH,WH],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ti=(i,t)=>t.id,ii=(i,t)=>t.name;function ni(i,t){if(i&1){let e=i5();Dr(0,"div",4)(1,"h3"),Mo(2,"Gemini API Provisioning"),Ur(),Dr(3,"a2ui-composer-api-key-selector",27),Sg("apiKeySelected",function(r){PM(e);let s=a5();return $M(s.onApiKeySelected(r))}),Ur()();}if(i&2){let e=a5();Ki(3),of("selectedApiKeyId",e.selectedApiKeyId());}}function ai(i,t){i&1&&(Dr(0,"mat-card-footer",10),Mo(1," To obtain an API key: "),Dr(2,"ol")(3,"li"),Mo(4," Go to "),Dr(5,"a",28),Mo(6," Google AI Studio"),Ur(),Mo(7," and sign in with your Google account. "),Ur(),Dr(8,"li"),Mo(9,"Click Create API key."),Ur(),Dr(10,"li"),Mo(11,"Select or create a Google Cloud project when prompted, then click Create key."),Ur(),Dr(12,"li"),Mo(13,"Save your key in a secure location!"),Ur()(),Mo(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),Dr(15,"a",29),Mo(16,"Web Crypto API"),Ur(),Mo(17,". Neither Google nor anyone else has access to this key. "),Ur());}function oi(i,t){if(i&1&&(Dr(0,"code"),Mo(1),Ur()),i&2){let e=a5();Ki(),UD("[System] Active renderer updated to ",e.activeRendererUrl());}}function ri(i,t){if(i&1&&(Dr(0,"code",18),Mo(1),Ur()),i&2){let e=a5();Ki(),UD("[Catalog Error] ",e.catalogErrorMessage());}}function li(i,t){i&1&&(Dr(0,"code",19),Mo(1,"[System] Catalog handshake completed successfully. Active catalog ready."),Ur());}function di(i,t){i&1&&(Dr(0,"code"),Mo(1,"[System] Catalog handshake in progress. Indexing metadata..."),Ur());}function si(i,t){i&1&&(Dr(0,"code"),Mo(1,"[System] Bridge connected. Initializing catalog handshake..."),Ur());}function ci(i,t){i&1&&(Dr(0,"code"),Mo(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),Ur());}function mi(i,t){i&1&&(Dr(0,"div",25),Mo(1,"No MCP servers configured \u2014 click + to add"),Ur());}function pi(i,t){if(i&1&&Mo(0),i&2){let e=a5().$implicit;UD(" Connected (",e.tools?.length||0," tools) ");}}function gi(i,t){i&1&&Mo(0," Connecting... ");}function ui(i,t){if(i&1&&Mo(0),i&2){let e=a5().$implicit;UD(" Error: ",e.errorMessage||"Failed to connect"," ");}}function hi(i,t){i&1&&Mo(0," Disconnected ");}function fi(i,t){if(i&1&&(Dr(0,"span",38),Mo(1),Ur()),i&2){let e=a5().$implicit;Ki(),Tg(e.url);}}function _i(i,t){if(i&1&&(Dr(0,"span",44),Mo(1),Ur()),i&2){let e=t.$implicit;Ki(),Tg(e.name);}}function vi(i,t){if(i&1&&(Dr(0,"div",43),YK(1,_i,2,1,"span",44,ii),Ur()),i&2){let e=a5().$implicit;Ki(),QK(e.tools);}}function yi(i,t){if(i&1){let e=i5();Dr(0,"div",30)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),Sg("change",function(r){let s=PM(e).$implicit,v=a5(2);return $M(v.toggleMcpServer(s.id,r.checked))}),Ur(),Dr(4,"div",34)(5,"div",35)(6,"span",36),Mo(7),Ur(),Dr(8,"span",37),nf(9,pi,1,1)(10,gi,1,0)(11,ui,1,1)(12,hi,1,0),Ur()(),nf(13,fi,2,1,"span",38),Ur()(),Dr(14,"div",39)(15,"button",40),Sg("click",function(){let r=PM(e).$implicit,s=a5(2);return $M(s.testMcpServer(r.id))}),Mo(16," Test "),Ur(),Dr(17,"button",41),Sg("click",function(){let r=PM(e).$implicit,s=a5(2);return $M(s.openEditMcpServerDialog(r))}),Dr(18,"mat-icon",24),Mo(19,"edit"),Ur()(),Dr(20,"button",42),Sg("click",function(){let r=PM(e).$implicit,s=a5(2);return $M(s.removeMcpServer(r.id))}),Dr(21,"mat-icon",24),Mo(22,"delete"),Ur()()()(),nf(23,vi,3,0,"div",43),Ur();}if(i&2){let e=t.$implicit;Ki(3),of("checked",e.enabled),Xi("aria-label","Toggle "+(e.name||e.url)),Ki(4),Tg(e.name||e.url),Ki(),Xi("data-status",e.status),Ki(),rf(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),Ki(4),rf(e.name&&e.name!==e.url?13:-1),Ki(10),rf(e.tools&&e.tools.length>0?23:-1);}}function bi(i,t){if(i&1&&(Dr(0,"div",26),YK(1,yi,24,7,"div",30,ti),Ur()),i&2){let e=a5();Ki(),QK(e.mcpManager.servers());}}var Ft=class i{fb=_(Ni);dialog=_(tp);destroyRef=_(hn);startupResolution=_(pv);startupConfigState=_(FB);hostCommunication=_(a3);catalogManagement=_(se);configProvider=_(Jl);settingsService=_(K);mcpManager=_(s_);is1PAuthEnabled=_($B);selectedRendererId=gt(null);selectedApiKeyId=lf(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=lf(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=gt(false);isApiKeyProvidedByConfig=lf(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=lf(()=>this.isApiKeyProvidedByConfig());hideApiKey=gt(true);forceThirdPartyAuth=gt(false);bridgeConnected=lf(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=lf(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=lf(()=>this.catalogManagement.catalogError());activeRendererUrl=lf(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){Ua(()=>{let t=this.settingsService.selectedRendererId()||"default";Po(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}openAddMcpServerDialog(){this.dialog.open(fe,{width:"450px"}).afterClosed().pipe(a$e(this.destroyRef)).subscribe(e=>{e?.url&&this.mcpManager.addServer(e.url);});}openEditMcpServerDialog(t){this.dialog.open(fe,{width:"450px",data:{server:t}}).afterClosed().pipe(a$e(this.destroyRef)).subscribe(n=>{n?.url&&this.mcpManager.updateServerUrl(t.id,n.url);});}async removeMcpServer(t){await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-settings"]],decls:57,vars:13,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-card-header"],[1,"mcp-header-text"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click"],["aria-hidden","true"],[1,"mcp-empty-state"],[1,"mcp-server-list"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-item"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit MCP Server","aria-label","Edit MCP Server",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete MCP Server","aria-label","Delete MCP Server",1,"mcp-delete-btn",3,"click"],[1,"mcp-server-tools"],[1,"mcp-tool-name"]],template:function(e,n){e&1&&(Dr(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Mo(4,"A2UI Composer Settings"),Ur()(),Dr(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Mo(9,"Renderer"),Ur(),Dr(10,"a2ui-composer-renderer-selector",5),Sg("rendererSelected",function(s){return n.onRendererSelected(s)}),Ur()(),nf(11,ni,4,1,"div",4),Dr(12,"div",6)(13,"h3"),Mo(14,"Developer Authentication Overrides"),Ur(),Dr(15,"p",7),Mo(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),Ur(),Dr(17,"div",8)(18,"mat-slide-toggle",9),Sg("change",function(){return n.toggleForceThirdPartyAuth()}),Mo(19," Force External Third-Party Authentication Mode "),Ur()()()()(),nf(20,ai,18,0,"mat-card-footer",10),Ur(),Dr(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Mo(24,"Connection Status & Diagnostics"),Ur(),Dr(25,"p",12),Mo(26,"Real-time monitoring bridge"),Ur()(),Dr(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Mo(31),Ur(),Dr(32,"mat-chip",15),Mo(33),Ur()()(),Dr(34,"div",16)(35,"h3"),Mo(36,"Overlay Logs Preview"),Ur(),Dr(37,"div",17),nf(38,oi,2,1,"code"),nf(39,ri,2,1,"code",18)(40,li,2,0,"code",19)(41,di,2,0,"code")(42,si,2,0,"code")(43,ci,2,0,"code"),Ur()()()(),Dr(44,"mat-card",20)(45,"mat-card-header",21)(46,"div",22)(47,"h2",2),Mo(48,"MCP Servers"),Ur(),Dr(49,"p",12),Mo(50," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),Ur()(),Dr(51,"button",23),Sg("click",function(){return n.openAddMcpServerDialog()}),Dr(52,"mat-icon",24),Mo(53,"add_circle"),Ur()()(),Dr(54,"mat-card-content"),nf(55,mi,2,0,"div",25)(56,bi,3,0,"div",26),Ur()()()),e&2&&(Ki(6),of("formGroup",n.settingsForm),Ki(4),of("selectedRendererId",n.selectedRendererId()),Ki(),rf(n.isThirdParty()?11:-1),Ki(),of("hidden",!n.is1PAuthEnabled),Ki(6),of("checked",n.forceThirdPartyAuth()),Ki(2),rf(n.isThirdParty()?20:-1),Ki(10),of("color",n.bridgeConnected()?"primary":"accent"),Ki(),UD("Bridge: ",n.bridgeConnected()?"Connected":"Disconnected"),Ki(),of("color",n.catalogStatus()==="Connected"?"primary":n.catalogStatus()==="Indexing"?"accent":n.catalogStatus()==="Error"?"warn":void 0),Ki(),UD("Catalog Handshake: ",n.catalogStatus()),Ki(5),rf(n.activeRendererUrl()?38:-1),Ki(),rf(n.catalogErrorMessage()?39:n.catalogStatus()==="Connected"?40:n.catalogStatus()==="Indexing"?41:n.bridgeConnected()?42:43),Ki(16),rf(n.mcpManager.servers().length===0?55:56));},dependencies:[ki,xi,Ii,Oi,Un,me,Vr,KH,WH,gce,li$1,ai$1,E,F,k,z,T,S,j,ot,ki$1,ct,Et,Te,Yt$1,mt,$H,Ae,De],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto}.settings-container[_ngcontent-%COMP%]{padding:24px;max-width:600px;margin:0 auto}.form-section[_ngcontent-%COMP%]{margin-top:16px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-card[_ngcontent-%COMP%]{margin-top:24px}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-lowest);color:var(--mat-sys-primary);padding:12px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:700}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-small-size, 12px);padding-left:24px;padding-bottom:12px}.mcp-card-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mcp-card-header[_ngcontent-%COMP%]     .mat-mdc-card-header-text{display:none}.mcp-card-header[_ngcontent-%COMP%]   .mcp-header-text[_ngcontent-%COMP%]{flex:1;min-width:0}.mcp-card-header[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0;margin-top:-4px;margin-right:-8px}.mcp-empty-state[_ngcontent-%COMP%]{margin-top:16px;padding:16px;text-align:center;font-size:13px;font-style:italic;color:var(--mat-sys-on-surface-variant);border-radius:8px;border:1px dashed var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-lowest)}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:4px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{Ft as Settings};