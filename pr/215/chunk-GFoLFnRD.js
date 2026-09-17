import {E,F,k,z,T,S as S$1,j}from'./chunk-Bki1v2Ez.js';import {f,b as Kc,c as bc,aE as F_,a as fe,v as vo,cg as vc,K,R as Ri,l as lr,aK as Kt,d as de,r as r_,h as Oe,Y as Yt$1,W as We,J as Ja,I as Ii,S as St,T as Ti,t as Si,i as bf,ch as Lc,m as mo,n as ne,a7 as r$1,M,Q as Q$1,u as G,z as dt,H,b5 as qi$1,as as ac,ad as g,ae as Jt$1,b8 as W$1,bk as Ye,bl as Xb,bu as kv,au as Rt,ci as C3,bC as at,bo as ue,B as fo,o as ov,C as At,c9 as TS,G as Ge,x as xt,a$ as _f,cj as Yo,c3 as zv,cd as Mi,D as vf,az as Ai,F as ec,L as tc,aV as Hv,bK as PH,g as kx,ck as O_,ax as Ie,p as nc,aA as _S,aB as wS,c4 as hm,cl as is,U as pe,$ as $q,P as Z,cm as os,cn as xh,co as T_,cp as x_,cq as R_,cr as A_,e as n_,aR as eI,aS as tI,aI as hS,aJ as pS,aC as em,aD as tm}from'./main.js';import {w as wi,E as Et$1,a as Ci,C as Cn,y as yn,b as bn,r as re}from'./chunk-DGKFOe08.js';import {Y as Yt$2,m as mt}from'./chunk-CETt95S6.js';import'./chunk-B63ZTn9z.js';import {m as me,D as Dn,n as nt,d as de$1,R as Rn,P as Pt}from'./chunk-DM3y_M6B.js';import {q as qi,Z as Zi,L as Li,G as Gi,Q as Qn,b as bi,R,n as ne$1,V as Vi,x as xe$1,F as Ft$1,B as Bi,g as zn}from'./chunk-BN1-KNBN.js';var Ft=["*"],Et=(()=>{class r{labelPosition="after";static \u0275fac=function(n){return new(n||r)};static \u0275cmp=de({type:r,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(n,i){n&2&&Ge("mdc-form-field--align-end",i.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Ft,decls:1,vars:0,template:function(n,i){n&1&&(fo(),At(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return r})();var zt=["switch"],Ut=["*"];function Lt(r,t){r&1&&(Oe(0,"span",11),hm(),Oe(1,"svg",13),ov(2,"path",14),We(),Oe(3,"svg",15),ov(4,"path",16),We()());}var Vt=new g("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),ke=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Ee=(()=>{class r{_elementRef=f(H);_focusMonitor=f(qi$1);_changeDetectorRef=f(ac);defaults=f(Vt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new ke(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Jt$1();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new W$1;toggleChange=new W$1;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){f(Ye).load(Xb);let e=f(new kv("tabindex"),{optional:true}),n=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=n.color||"accent",this.id=this._uniqueId=f(Rt).getId("mat-mdc-slide-toggle-"),this.hideIcon=n.hideIcon??false,this.disabledInteractive=n.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new ke(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(n){return new(n||r)};static \u0275cmp=de({type:r,selectors:[["mat-slide-toggle"]],viewQuery:function(n,i){if(n&1&&Ai(zt,5),n&2){let d;ec(d=tc())&&(i._switchElement=d.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(n,i){n&2&&(Mi("id",i.id),xt("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),vf(i.color?"mat-"+i.color:""),Ge("mat-mdc-slide-toggle-focused",i._focused)("mat-mdc-slide-toggle-checked",i.checked)("_mat-animation-noopable",i._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",ue],color:"color",disabled:[2,"disabled","disabled",ue],disableRipple:[2,"disableRipple","disableRipple",ue],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:zv(e)],checked:[2,"checked","checked",ue],hideIcon:[2,"hideIcon","hideIcon",ue],disabledInteractive:[2,"disabledInteractive","disabledInteractive",ue]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[_f([{provide:R,useExisting:Yo(()=>r),multi:true},{provide:ne$1,useExisting:r,multi:true}]),at],ngContentSelectors:Ut,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(n,i){if(n&1&&(fo(),Oe(0,"div",1)(1,"button",2,0),Ja("click",function(){return i._handleClick()}),ov(3,"div",3)(4,"span",4),Oe(5,"span",5)(6,"span",6)(7,"span",7),ov(8,"span",8),We(),Oe(9,"span",9),ov(10,"span",10),We(),Ii(11,Lt,5,0,"span",11),We()()(),Oe(12,"label",12),Ja("click",function(p){return p.stopPropagation()}),At(13),We()()),n&2){let d=TS(2);Ti("labelPosition",i.labelPosition),St(),Ge("mdc-switch--selected",i.checked)("mdc-switch--unselected",!i.checked)("mdc-switch--checked",i.checked)("mdc-switch--disabled",i.disabled)("mat-mdc-slide-toggle-disabled-interactive",i.disabledInteractive),Ti("tabIndex",i.disabled&&!i.disabledInteractive?-1:i.tabIndex)("disabled",i.disabled&&!i.disabledInteractive),xt("id",i.buttonId)("name",i.name)("aria-label",i.ariaLabel)("aria-labelledby",i._getAriaLabelledBy())("aria-describedby",i.ariaDescribedby)("aria-required",i.required||null)("aria-checked",i.checked)("aria-disabled",i.disabled&&i.disabledInteractive?"true":null),St(9),Ti("matRippleTrigger",d)("matRippleDisabled",i.disableRipple||i.disabled)("matRippleCentered",true),St(),Si(i.hideIcon?-1:11),St(),Ti("for",i.buttonId),xt("id",i._labelId);}},dependencies:[C3,Et],styles:[`.mdc-switch {
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
`],encapsulation:2})}return r})(),Ot=(()=>{class r{static \u0275fac=function(n){return new(n||r)};static \u0275mod=Q$1({type:r});static \u0275inj=G({imports:[Ee,dt]})}return r})();var S=class r{startupResolution=f(Kc);startupConfigState=f(bc);configProvider=f(vo);secureCredentialsStorage=f(Lc);localStorageInteractions=f(mo);usageTrackingService=f(ne);renderers=Ri(()=>this.startupConfigState.renderers());selectedRendererId=Ri(()=>this.startupConfigState.selectedRendererId());activeRenderer=Ri(()=>this.startupConfigState.activeRenderer());async selectRenderer(t){let e=this.selectedRendererId();if(!await this.startupResolution.setSelectedRendererId(t))return  false;this.usageTrackingService.trackRendererSwitch({fromRendererId:e,toRendererId:t||""}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_renderer",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer");let i=this.activeRenderer();i?.rendererUrl?this.configProvider.setRendererUrl(i.rendererUrl):this.configProvider.setRendererUrl("");let d=typeof i?.apiKey=="string"?i.apiKey.trim():"";if(d)this.configProvider.setApiKeyFromConfig(d);else try{await this.syncEffectiveApiKeyToConfigProvider();}catch(p){console.warn("Failed to resolve effective API key during renderer selection:",p);}return  true}_selectedApiKeyId=K(this.localStorageInteractions.getItem("a2ui_composer_selected_api_key")||null);selectedApiKeyId=Ri(()=>{let t=this._selectedApiKeyId();return t||((this.startupConfigState.apiKeys()||{}).default!==void 0?"default":null)});_effectiveApiKey=K("");effectiveApiKey=this._effectiveApiKey.asReadonly();getStaticApiKeys(){return this.startupConfigState.apiKeys()||{}}async getAvailableApiKeys(){let t=this.getStaticApiKeys(),e=Object.entries(t).map(([d,p])=>({id:d,name:p.displayName||d,key:p.apiKey||"",readOnly:true})),i=(await this.secureCredentialsStorage.getCustomApiKeys()).filter(d=>!Object.prototype.hasOwnProperty.call(t,d.id)).map(d=>({id:d.id,name:d.name,key:d.key,readOnly:false}));return [...e,...i]}async selectApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"select"}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_api_key",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_api_key"),this._selectedApiKeyId.set(t),await this.syncEffectiveApiKeyToConfigProvider();}async getEffectiveApiKey(){let t=this.selectedApiKeyId(),e=this.getStaticApiKeys();if(t&&e[t]){let d=e[t].apiKey||"";return this._effectiveApiKey.set(d),d}if(t){let d=await this.secureCredentialsStorage.getCustomApiKey(t);return d?(this._effectiveApiKey.set(d.key),d.key):(this._effectiveApiKey.set(""),"")}let n=await this.secureCredentialsStorage.getCustomApiKeys(),i=n.find(d=>d.id==="default")||n[0];if(i){let d=i.key;return this._effectiveApiKey.set(d),d}return this._effectiveApiKey.set(""),""}async saveCustomApiKey(t,e,n){let i=this.getStaticApiKeys();if(Object.prototype.hasOwnProperty.call(i,t))throw new Error(`Cannot save custom API key with ID "${t}": collides with a static configuration key.`);this.usageTrackingService.trackApiKeyUpdate({action:"add"}),await this.secureCredentialsStorage.saveCustomApiKey(t,e,n),await this.syncEffectiveApiKeyToConfigProvider();}async deleteCustomApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"delete"}),await this.secureCredentialsStorage.deleteCustomApiKey(t),this._selectedApiKeyId()===t?await this.selectApiKey(null):await this.syncEffectiveApiKeyToConfigProvider();}async syncEffectiveApiKeyToConfigProvider(){let t=await this.getEffectiveApiKey(),e=this._selectedApiKeyId(),n=this.getStaticApiKeys();return e&&n[e]?this.configProvider.setApiKeyFromConfig(t):!e&&n.default?this.configProvider.setApiKeyFromConfig(t):this.configProvider.setRuntimeApiKey(t),t}getStaticRenderersMap(){return this.startupConfigState.renderers()||{}}getCustomRenderers(){let t=this.localStorageInteractions.getItem("a2ui_composer_custom_renderers");if(!t)return [];try{let e=JSON.parse(t);return Array.isArray(e)?e.filter(n=>n&&typeof n=="object"&&!!String(n.id||"").trim()).map(n=>({id:String(n?.id||"").trim(),name:String(n?.name||""),rendererUrl:String(n?.rendererUrl||"")})):[]}catch(e){return console.warn("Failed to parse custom renderers from LocalStorage:",e),[]}}getRenderers(){let t=this.getStaticRenderersMap(),e=Object.entries(t).map(([d,p])=>({id:d,name:p?.displayName||p?.name||d,rendererUrl:p?.rendererUrl||"",readOnly:true})),n=new Set(e.map(d=>d.name)),i=this.getCustomRenderers().filter(d=>!Object.prototype.hasOwnProperty.call(t,d.id)).map(d=>({id:d.id,name:n.has(d.name)?`${d.name} (local)`:d.name,rendererUrl:d.rendererUrl,readOnly:false}));return [...e,...i]}saveCustomRenderer(t){let e=(t.id||"").trim(),n=(t.name||"").trim(),i=(t.rendererUrl||"").trim();if(!e||!n||!i)throw new Error("Custom renderer id, name, and rendererUrl must not be empty.");if(!/^https?:\/\//i.test(i))throw new Error("Custom renderer URL must start with http:// or https://");let d=this.getStaticRenderersMap();if(Object.prototype.hasOwnProperty.call(d,e))throw new Error(`Cannot save custom renderer with ID "${e}": collides with a static configuration renderer.`);let p=this.getCustomRenderers(),De=p.findIndex(Nt=>Nt.id===e);De>=0?(p[De]={id:e,name:n,rendererUrl:i},this.usageTrackingService.trackRendererEdit({rendererId:e})):(p.push({id:e,name:n,rendererUrl:i}),this.usageTrackingService.trackRendererAdd({rendererId:e})),this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(p));let Te=r$1({},this.startupConfigState.renderers());Te[e]={id:e,name:n,rendererUrl:i},this.startupConfigState.setRenderers(Te);}deleteCustomRenderer(t){this.usageTrackingService.trackRendererDelete({rendererId:t});let e=this.getCustomRenderers().filter(i=>i.id!==t);this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(e));let n=r$1({},this.startupConfigState.renderers());delete n[t],this.startupConfigState.setRenderers(n),this.selectedRendererId()===t&&(this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer"),this.selectRenderer(null));}static \u0275fac=function(e){return new(e||r)};static \u0275prov=M({token:r,factory:r.\u0275fac,providedIn:"root"})};function qt(r,t){if(r&1&&(Oe(0,"div",5),Yt$1(1),We()),r&2){let e=wS();St(),nc(e.errorMessage());}}function Ht(r){let t=r.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var Y=class r{fb=f(qi);settingsService=f(S);dialogRef=f(os);data=f(xh,{optional:true});errorMessage=K(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[xe$1.required,xe$1.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[xe$1.required,Ht]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),n=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:n,name:t,rendererUrl:e}),this.dialogRef.close(n);}catch(i){this.errorMessage.set(i instanceof Error?i.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=de({type:r,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","formControlName","name","placeholder","My Renderer"],["matInput","","id","renderer-url-input","formControlName","rendererUrl","placeholder","http://localhost:3000"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Oe(0,"h2",0),Yt$1(1),We(),Oe(2,"mat-dialog-content")(3,"form",1),Ja("ngSubmit",function(d){return d.preventDefault(),n.onConfirm()}),Oe(4,"mat-form-field",2)(5,"mat-label"),Yt$1(6,"Name"),We(),ov(7,"input",3),eI(),We(),Oe(8,"mat-form-field",2)(9,"mat-label"),Yt$1(10,"Renderer URL"),We(),ov(11,"input",4),eI(),We(),Ii(12,qt,2,1,"div",5),We()(),Oe(13,"mat-dialog-actions",6)(14,"button",7),Yt$1(15,"Cancel"),We(),Oe(16,"button",8),Ja("click",function(){return n.onConfirm()}),Yt$1(17),We()()),e&2&&(St(),nc(n.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),St(2),Ti("formGroup",n.form),St(4),tI(),St(4),tI(),St(),Si(n.errorMessage()?12:-1),St(4),Ti("disabled",n.form.invalid),St(),bf(" ",n.data?.renderer?"Save":"Add"," "));},dependencies:[Zi,Li,Ft$1,Bi,Gi,Qn,zn,O_,T_,x_,R_,A_,me,nt,de$1,Dn,Rn,r_,n_],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var W=class r{disabled=Hv(false);dialog=f(is);destroyRef=f(pe);items=K([]);selectedItem=Ri(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe($q(this.destroyRef)).subscribe(async i=>{i&&(await this.refreshItems(),this.emitSelection(i));});}async handleEdit(t,e,n,i){if(e.stopPropagation(),e.preventDefault(),n.readOnly)return;this.dialog.open(t,{width:"450px",data:{[i]:n}}).afterClosed().pipe($q(this.destroyRef)).subscribe(async p=>{p&&(await this.refreshItems(),this.getSelectedId()===p&&this.emitSelection(p));});}async handleDelete(t,e,n=null){t.stopPropagation(),t.preventDefault(),!this.items().find(d=>d.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(n));}static \u0275fac=function(e){return new(e||r)};static \u0275dir=Z({type:r,inputs:{disabled:[1,"disabled"]}})};var Xt=(r,t)=>t.id;function Yt(r,t){if(r&1&&(Oe(0,"span",5),Yt$1(1),We()),r&2){let e=wS();St(),nc(e.selectedItem()?.rendererUrl);}}function Qt(r,t){r&1&&(Oe(0,"mat-option",6),Yt$1(1,"No items available \u2014 click + to add"),We()),r&2&&Ti("disabled",true);}function Jt(r,t){if(r&1){let e=_S();Oe(0,"mat-option",8)(1,"div",9)(2,"div",10),Yt$1(3),We(),Oe(4,"div",5),Yt$1(5),We()(),Oe(6,"button",11),Ja("click",function(i){let d=em(e).$implicit,p=wS(2);return tm(p.onEditRenderer(i,d))})("keydown",function(i){return i.stopPropagation()}),Oe(7,"mat-icon",12),Yt$1(8,"edit"),We()(),Oe(9,"button",13),Ja("click",function(i){let d=em(e).$implicit,p=wS(2);return tm(p.onDeleteRenderer(i,d.id))})("keydown",function(i){return i.stopPropagation()}),Oe(10,"mat-icon",12),Yt$1(11,"delete"),We()()();}if(r&2){let e=t.$implicit;Ti("value",e.id),St(3),nc(e.name),St(2),nc(e.rendererUrl),St(),Ti("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),xt("aria-label","Edit "+e.name),St(3),Ti("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),xt("aria-label","Delete "+e.name);}}function Zt(r,t){if(r&1&&hS(0,Jt,12,9,"mat-option",8,Xt),r&2){let e=wS();pS(e.items());}}var xe=class r extends W{selectedRendererId=Hv("default");rendererSelected=PH();settingsService=f(S);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(Y,t);}onEditRenderer(t,e){this.handleEdit(Y,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=de({type:r,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[Ie],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,n){e&1&&(Oe(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Yt$1(3,"Renderer"),We(),Oe(4,"mat-select",2),Ja("selectionChange",function(d){return n.onSelectionChange(d.value)}),Oe(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Yt$1(8),We(),Ii(9,Yt,2,1,"span",5),We()(),Ii(10,Qt,2,1,"mat-option",6)(11,Zt,2,0),We()(),Oe(12,"button",7),Ja("click",function(d){return n.onAddRenderer(d)}),Oe(13,"mat-icon"),Yt$1(14,"add_circle"),We()()()),e&2&&(St(4),Ti("value",n.selectedRendererId())("disabled",n.disabled()),St(4),nc(n.selectedItem()?.name),St(),Si(n.selectedItem()?.rendererUrl?9:-1),St(),Si(n.items().length===0?10:11),St(2),Ti("disabled",n.disabled()));},dependencies:[me,nt,de$1,Cn,yn,bn,re,r_,kx,bi,Vi,Yt$2,mt,O_],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function en(r,t){if(r&1&&(Oe(0,"div",7),Yt$1(1),We()),r&2){let e=wS();St(),nc(e.errorMessage());}}var Q=class r{fb=f(qi);settingsService=f(S);dialogRef=f(os);data=f(xh,{optional:true});errorMessage=K(null);hideApiKey=K(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[xe$1.required,xe$1.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[xe$1.required,xe$1.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),n=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(n,t,e),this.dialogRef.close(n);}catch(i){this.errorMessage.set(i instanceof Error?i.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=de({type:r,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","formControlName","name","placeholder","My Gemini Key"],["matInput","","id","api-key-value-input","formControlName","apiKey","placeholder","Paste your API key here",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Oe(0,"h2",0),Yt$1(1),We(),Oe(2,"mat-dialog-content")(3,"form",1),Ja("ngSubmit",function(d){return d.preventDefault(),n.onConfirm()}),Oe(4,"mat-form-field",2)(5,"mat-label"),Yt$1(6,"Name"),We(),ov(7,"input",3),eI(),We(),Oe(8,"mat-form-field",2)(9,"mat-label"),Yt$1(10,"API Key"),We(),ov(11,"input",4),eI(),Oe(12,"button",5),Ja("click",function(){return n.toggleHideApiKey()}),Oe(13,"mat-icon",6),Yt$1(14),We()()(),Ii(15,en,2,1,"div",7),We()(),Oe(16,"mat-dialog-actions",8)(17,"button",9),Yt$1(18,"Cancel"),We(),Oe(19,"button",10),Ja("click",function(){return n.onConfirm()}),Yt$1(20),We()()),e&2&&(St(),nc(n.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),St(2),Ti("formGroup",n.form),St(4),tI(),St(4),Ti("type",n.hideApiKey()?"password":"text"),tI(),St(),xt("aria-label",n.hideApiKey()?"Show API key":"Hide API key"),St(2),nc(n.hideApiKey()?"visibility":"visibility_off"),St(),Si(n.errorMessage()?15:-1),St(4),Ti("disabled",n.form.invalid),St(),bf(" ",n.data?.apiKey?"Save":"Add"," "));},dependencies:[Zi,Li,Ft$1,Bi,Gi,Qn,zn,O_,T_,x_,R_,A_,me,nt,de$1,Pt,Dn,Rn,r_,n_,kx,bi,Vi],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var tn=(r,t)=>t.id;function nn(r,t){r&1&&(Oe(0,"mat-option",3),Yt$1(1,"No items available \u2014 click + to add"),We()),r&2&&Ti("disabled",true);}function rn(r,t){if(r&1){let e=_S();Oe(0,"mat-option",5)(1,"span",6),Yt$1(2),We(),Oe(3,"button",7),Ja("keydown",function(i){return i.stopPropagation()})("click",function(i){let d=em(e).$implicit,p=wS(2);return tm(p.onEditApiKey(i,d))}),Oe(4,"mat-icon",8),Yt$1(5,"edit"),We()(),Oe(6,"button",9),Ja("keydown",function(i){return i.stopPropagation()})("click",function(i){let d=em(e).$implicit,p=wS(2);return tm(p.onDeleteApiKey(i,d.id))}),Oe(7,"mat-icon",8),Yt$1(8,"delete"),We()()();}if(r&2){let e=t.$implicit;Ti("value",e.id),St(2),nc(e.name),St(),Ti("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),xt("aria-label","Edit "+e.name),St(3),Ti("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),xt("aria-label","Delete "+e.name);}}function an(r,t){if(r&1&&hS(0,rn,9,8,"mat-option",5,tn),r&2){let e=wS();pS(e.items());}}var Ae=class r extends W{selectedApiKeyId=Hv(null);apiKeySelected=PH();settingsService=f(S);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(Q,t);}onEditApiKey(t,e){this.handleEdit(Q,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=de({type:r,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[Ie],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,n){e&1&&(Oe(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Yt$1(3,"API Key"),We(),Oe(4,"mat-select",2),Ja("selectionChange",function(d){return n.onSelectionChange(d.value)}),Oe(5,"mat-select-trigger"),Yt$1(6),We(),Ii(7,nn,2,1,"mat-option",3)(8,an,2,0),We()(),Oe(9,"button",4),Ja("click",function(d){return n.onAddApiKey(d)}),Oe(10,"mat-icon"),Yt$1(11,"add_circle"),We()()()),e&2&&(St(4),Ti("value",n.selectedApiKeyId())("disabled",n.disabled()),St(2),bf(" ",n.selectedItem()?.name," "),St(),Si(n.items().length===0?7:8),St(2),Ti("disabled",n.disabled()));},dependencies:[me,nt,de$1,Cn,yn,bn,re,r_,kx,bi,Vi,Yt$2,mt,O_],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function on(r,t){if(r&1){let e=_S();Oe(0,"div",4)(1,"h3"),Yt$1(2,"Gemini API Provisioning"),We(),Oe(3,"a2ui-composer-api-key-selector",20),Ja("apiKeySelected",function(i){em(e);let d=wS();return tm(d.onApiKeySelected(i))}),We()();}if(r&2){let e=wS();St(3),Ti("selectedApiKeyId",e.selectedApiKeyId());}}function dn(r,t){r&1&&(Oe(0,"mat-card-footer",10),Yt$1(1," To obtain an API key: "),Oe(2,"ol")(3,"li"),Yt$1(4," Go to "),Oe(5,"a",21),Yt$1(6," Google AI Studio"),We(),Yt$1(7," and sign in with your Google account. "),We(),Oe(8,"li"),Yt$1(9,"Click Create API key."),We(),Oe(10,"li"),Yt$1(11,"Select or create a Google Cloud project when prompted, then click Create key."),We(),Oe(12,"li"),Yt$1(13,"Save your key in a secure location!"),We()(),Yt$1(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),Oe(15,"a",22),Yt$1(16,"Web Crypto API"),We(),Yt$1(17,". Neither Google nor anyone else has access to this key. "),We());}function sn(r,t){if(r&1&&(Oe(0,"code"),Yt$1(1),We()),r&2){let e=wS();St(),bf("[System] Active renderer updated to ",e.activeRendererUrl());}}function ln(r,t){if(r&1&&(Oe(0,"code",18),Yt$1(1),We()),r&2){let e=wS();St(),bf("[Catalog Error] ",e.catalogErrorMessage());}}function cn(r,t){r&1&&(Oe(0,"code",19),Yt$1(1,"[System] Catalog handshake completed successfully. Active catalog ready."),We());}function mn(r,t){r&1&&(Oe(0,"code"),Yt$1(1,"[System] Catalog handshake in progress. Indexing metadata..."),We());}function pn(r,t){r&1&&(Oe(0,"code"),Yt$1(1,"[System] Bridge connected. Initializing catalog handshake..."),We());}function gn(r,t){r&1&&(Oe(0,"code"),Yt$1(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),We());}var Tt=class r{fb=f(qi);startupResolution=f(Kc);startupConfigState=f(bc);hostCommunication=f(F_);catalogManagement=f(fe);configProvider=f(vo);settingsService=f(S);is1PAuthEnabled=f(vc);selectedRendererId=K(null);selectedApiKeyId=Ri(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=Ri(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=K(false);isApiKeyProvidedByConfig=Ri(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=Ri(()=>this.isApiKeyProvidedByConfig());hideApiKey=K(true);forceThirdPartyAuth=K(false);bridgeConnected=Ri(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=Ri(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=Ri(()=>this.catalogManagement.catalogError());activeRendererUrl=Ri(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){lr(()=>{let t=this.settingsService.selectedRendererId()||"default";Kt(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=de({type:r,selectors:[["a2ui-composer-settings"]],decls:44,vars:12,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"]],template:function(e,n){e&1&&(Oe(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Yt$1(4,"A2UI Composer Settings"),We()(),Oe(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Yt$1(9,"Renderer"),We(),Oe(10,"a2ui-composer-renderer-selector",5),Ja("rendererSelected",function(d){return n.onRendererSelected(d)}),We()(),Ii(11,on,4,1,"div",4),Oe(12,"div",6)(13,"h3"),Yt$1(14,"Developer Authentication Overrides"),We(),Oe(15,"p",7),Yt$1(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),We(),Oe(17,"div",8)(18,"mat-slide-toggle",9),Ja("change",function(){return n.toggleForceThirdPartyAuth()}),Yt$1(19," Force External Third-Party Authentication Mode "),We()()()()(),Ii(20,dn,18,0,"mat-card-footer",10),We(),Oe(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Yt$1(24,"Connection Status & Diagnostics"),We(),Oe(25,"h3",12),Yt$1(26,"Real-time monitoring bridge"),We()(),Oe(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Yt$1(31),We(),Oe(32,"mat-chip",15),Yt$1(33),We()()(),Oe(34,"div",16)(35,"h4"),Yt$1(36,"Overlay Logs Preview"),We(),Oe(37,"div",17),Ii(38,sn,2,1,"code"),Ii(39,ln,2,1,"code",18)(40,cn,2,0,"code",19)(41,mn,2,0,"code")(42,pn,2,0,"code")(43,gn,2,0,"code"),We()()()()()),e&2&&(St(6),Ti("formGroup",n.settingsForm),St(4),Ti("selectedRendererId",n.selectedRendererId()),St(),Si(n.isThirdParty()?11:-1),St(),Ti("hidden",!n.is1PAuthEnabled),St(6),Ti("checked",n.forceThirdPartyAuth()),St(2),Si(n.isThirdParty()?20:-1),St(10),Ti("color",n.bridgeConnected()?"primary":"accent"),St(),bf("Bridge: ",n.bridgeConnected()?"Connected":"Disconnected"),St(),Ti("color",n.catalogStatus()==="Connected"?"primary":n.catalogStatus()==="Indexing"?"accent":n.catalogStatus()==="Error"?"warn":void 0),St(),bf("Catalog Handshake: ",n.catalogStatus()),St(5),Si(n.activeRendererUrl()?38:-1),St(),Si(n.catalogErrorMessage()?39:n.catalogStatus()==="Connected"?40:n.catalogStatus()==="Indexing"?41:n.bridgeConnected()?42:43));},dependencies:[Zi,Li,Gi,Qn,me,Dn,r_,bi,E,F,k,z,T,S$1,j,wi,Et$1,Ci,Ot,Ee,xe,Ae],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto;container-type:inline-size;container-name:settings}.settings-container[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,1fr);align-items:start;gap:24px;padding:32px;max-width:var(--cpk-content-max);margin:0 auto}.settings-card[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]{min-width:0;border:1px solid var(--cpk-border);border-radius:var(--cpk-radius-card);background-color:var(--cpk-surface);box-shadow:var(--cpk-shadow-card)}.settings-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]{padding:28px 28px 8px}.settings-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{padding:0 28px 28px}.settings-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:600;line-height:1.4;letter-spacing:-.5px}.settings-card[_ngcontent-%COMP%]   h3[mat-card-subtitle][_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   h3[mat-card-subtitle][_ngcontent-%COMP%]{margin:8px 0;font-size:13px;font-weight:400;color:var(--cpk-text-secondary)}.form-section[_ngcontent-%COMP%]{margin-top:24px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:0 0 12px;font-size:14px;font-weight:600}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);color:var(--cpk-text-secondary);padding:16px;border-radius:12px;overflow-wrap:anywhere;font-family:var(--cpk-font-mono);font-size:12px;line-height:1.5}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{display:block}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] + code[_ngcontent-%COMP%]{margin-top:8px}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:700}.success-log[_ngcontent-%COMP%]{color:var(--cpk-success)}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:16px!important}  body .mat-mdc-slide-toggle label,   body .mat-mdc-slide-toggle .mdc-label{padding-left:16px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{padding:24px 28px;border-top:1px solid var(--cpk-divider);font-size:12px;line-height:1.7;color:var(--cpk-text-secondary)}.get-api-key[_ngcontent-%COMP%]   ol[_ngcontent-%COMP%]{padding-left:20px}.get-api-key[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--cpk-accent);text-underline-offset:3px}@container settings (min-width: 980px){.settings-container[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}}@container settings (max-width: 600px){.settings-container[_ngcontent-%COMP%]{padding:16px;gap:16px}.settings-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]{padding:20px 20px 8px}.settings-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{padding:0 20px 20px}.get-api-key[_ngcontent-%COMP%]{padding:20px}}















`]})};export{Tt as Settings};