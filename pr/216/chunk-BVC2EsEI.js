import {K}from'./chunk-DKv1NMqd.js';import {E,F,k,z,T,S,j}from'./chunk-DTIO2u0U.js';import {C,an as tp,a7 as hn,h as hv,a as LB,R as u3,s as se,J as Jl,ao as a_,cV as FB,B as Bt$1,u as uf,G as Ga,a0 as $o,_ as l$e,b as an,c as XH,Q as QH,v as vce,ar as zH,I as Ir,g as Po,U as Ur,f as Ig,r as rf,Y as Yi,k as sf,p as of,l as UD,aH as ep,aI as hI,aO as NH,aJ as PH,aK as FH,aL as $H,V as VF,ah as FW,n as kg,ai as LW,w as Nt$1,x as xt,S as Si,y as ut,b4 as iu,a9 as Mg,aX as W,aT as Ko,aV as _t,b5 as Kr,b6 as JH,ch as CL,aW as ao,b7 as KUe,bQ as yi$1,b1 as cn,z as Il,D as to,bh as f5,H as Hr,i as eo,a4 as HD,cW as Id,bT as kL,bl as af,E as jD,b3 as lf,M as xg,T as Tg,aE as xL,aF as iNe,bc as Mn,bd as o5,aC as c5,aM as QK,aN as XK,bm as WM,O as vt,be as PM,bf as $M}from'./main.js';import {o as ot,k as ki,c as ct}from'./chunk-BQ816oXj.js';import {Y as Yt$1,m as mt}from'./chunk-DLZreqhi.js';import {x as xi,v as vi$1,C as Ci,G}from'./chunk-BAhqhI1v.js';import {m as me,D as Dn,n as nt,d as de,R as Rn,P as Pt}from'./chunk-Bx-rb4oe.js';import {q as qi,z as zi,e as Li,G as Gi,Z as Zi,X as Xn,V as Vi,b as bi$1,R as Re,I as It,U as Ui,g as Zn,T as T$1,h as te}from'./chunk-jlJo_muz.js';var Kt=["*"],Dt=(()=>{class i{labelPosition="after";static \u0275fac=function(n){return new(n||i)};static \u0275cmp=an({type:i,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(n,r){n&2&&Hr("mdc-form-field--align-end",r.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Kt,decls:1,vars:0,template:function(n,r){n&1&&(Il(),to(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return i})();var Nt=["switch"],zt=["*"];function Vt(i,t){i&1&&(Ir(0,"span",11),WM(),Ir(1,"svg",13),VF(2,"path",14),Ur(),Ir(3,"svg",15),VF(4,"path",16),Ur()());}var Gt=new W("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Pe=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Te=(()=>{class i{_elementRef=C(ut);_focusMonitor=C(iu);_changeDetectorRef=C(Mg);defaults=C(Gt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Pe(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Ko();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new _t;toggleChange=new _t;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){C(Kr).load(JH);let e=C(new CL("tabindex"),{optional:true}),n=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=n.color||"accent",this.id=this._uniqueId=C(ao).getId("mat-mdc-slide-toggle-"),this.hideIcon=n.hideIcon??false,this.disabledInteractive=n.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Pe(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=an({type:i,selectors:[["mat-slide-toggle"]],viewQuery:function(n,r){if(n&1&&lf(Nt,5),n&2){let s;xg(s=Tg())&&(r._switchElement=s.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(n,r){n&2&&(af("id",r.id),eo("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),jD(r.color?"mat-"+r.color:""),Hr("mat-mdc-slide-toggle-focused",r._focused)("mat-mdc-slide-toggle-checked",r.checked)("_mat-animation-noopable",r._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",cn],color:"color",disabled:[2,"disabled","disabled",cn],disableRipple:[2,"disableRipple","disableRipple",cn],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:kL(e)],checked:[2,"checked","checked",cn],hideIcon:[2,"hideIcon","hideIcon",cn],disabledInteractive:[2,"disabledInteractive","disabledInteractive",cn]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[HD([{provide:T$1,useExisting:Id(()=>i),multi:true},{provide:te,useExisting:i,multi:true}]),yi$1],ngContentSelectors:zt,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(n,r){if(n&1&&(Il(),Ir(0,"div",1)(1,"button",2,0),Ig("click",function(){return r._handleClick()}),VF(3,"div",3)(4,"span",4),Ir(5,"span",5)(6,"span",6)(7,"span",7),VF(8,"span",8),Ur(),Ir(9,"span",9),VF(10,"span",10),Ur(),rf(11,Vt,5,0,"span",11),Ur()()(),Ir(12,"label",12),Ig("click",function(v){return v.stopPropagation()}),to(13),Ur()()),n&2){let s=f5(2);sf("labelPosition",r.labelPosition),Yi(),Hr("mdc-switch--selected",r.checked)("mdc-switch--unselected",!r.checked)("mdc-switch--checked",r.checked)("mdc-switch--disabled",r.disabled)("mat-mdc-slide-toggle-disabled-interactive",r.disabledInteractive),sf("tabIndex",r.disabled&&!r.disabledInteractive?-1:r.tabIndex)("disabled",r.disabled&&!r.disabledInteractive),eo("id",r.buttonId)("name",r.name)("aria-label",r.ariaLabel)("aria-labelledby",r._getAriaLabelledBy())("aria-describedby",r.ariaDescribedby)("aria-required",r.required||null)("aria-checked",r.checked)("aria-disabled",r.disabled&&r.disabledInteractive?"true":null),Yi(9),sf("matRippleTrigger",s)("matRippleDisabled",r.disableRipple||r.disabled)("matRippleCentered",true),Yi(),of(r.hideIcon?-1:11),Yi(),sf("for",r.buttonId),eo("id",r._labelId);}},dependencies:[KUe,Dt],styles:[`.mdc-switch {
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
`],encapsulation:2})}return i})(),Et=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=Nt$1({type:i});static \u0275inj=xt({imports:[Te,Si]})}return i})();function Bt(i,t){if(i&1&&(Ir(0,"div",5),Po(1),Ur()),i&2){let e=c5();Yi(),kg(e.errorMessage());}}function Oe(i){let t=i.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var pe=class i{fb=C(qi);settingsService=C(K);dialogRef=C(ep);data=C(hI,{optional:true});errorMessage=Bt$1(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[Re.required,Re.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[Re.required,Oe]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),n=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:n,name:t,rendererUrl:e}),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","formControlName","name","placeholder","My Renderer"],["matInput","","id","renderer-url-input","formControlName","rendererUrl","placeholder","http://localhost:3000"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Ir(0,"h2",0),Po(1),Ur(),Ir(2,"mat-dialog-content")(3,"form",1),Ig("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),Ir(4,"mat-form-field",2)(5,"mat-label"),Po(6,"Name"),Ur(),VF(7,"input",3),FW(),Ur(),Ir(8,"mat-form-field",2)(9,"mat-label"),Po(10,"Renderer URL"),Ur(),VF(11,"input",4),FW(),Ur(),rf(12,Bt,2,1,"div",5),Ur()(),Ir(13,"mat-dialog-actions",6)(14,"button",7),Po(15,"Cancel"),Ur(),Ir(16,"button",8),Ig("click",function(){return n.onConfirm()}),Po(17),Ur()()),e&2&&(Yi(),kg(n.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),Yi(2),sf("formGroup",n.form),Yi(4),LW(),Yi(4),LW(),Yi(),of(n.errorMessage()?12:-1),Yi(4),sf("disabled",n.form.invalid),Yi(),UD(" ",n.data?.renderer?"Save":"Add"," "));},dependencies:[Zi,Li,It,Ui,Gi,Xn,Zn,zH,NH,PH,FH,$H,me,nt,de,Dn,Rn,XH,QH],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ce=class i{disabled=xL(false);dialog=C(tp);destroyRef=C(hn);items=Bt$1([]);selectedItem=uf(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(l$e(this.destroyRef)).subscribe(async r=>{r&&(await this.refreshItems(),this.emitSelection(r));});}async handleEdit(t,e,n,r){if(e.stopPropagation(),e.preventDefault(),n.readOnly)return;this.dialog.open(t,{width:"450px",data:{[r]:n}}).afterClosed().pipe(l$e(this.destroyRef)).subscribe(async v=>{v&&(await this.refreshItems(),this.getSelectedId()===v&&this.emitSelection(v));});}async handleDelete(t,e,n=null){t.stopPropagation(),t.preventDefault(),!this.items().find(s=>s.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(n));}static \u0275fac=function(e){return new(e||i)};static \u0275dir=vt({type:i,inputs:{disabled:[1,"disabled"]}})};var $t=(i,t)=>t.id;function qt(i,t){if(i&1&&(Ir(0,"span",5),Po(1),Ur()),i&2){let e=c5();Yi(),kg(e.selectedItem()?.rendererUrl);}}function jt(i,t){i&1&&(Ir(0,"mat-option",6),Po(1,"No items available \u2014 click + to add"),Ur()),i&2&&sf("disabled",true);}function Ht(i,t){if(i&1){let e=o5();Ir(0,"mat-option",8)(1,"div",9)(2,"div",10),Po(3),Ur(),Ir(4,"div",5),Po(5),Ur()(),Ir(6,"button",11),Ig("click",function(r){let s=PM(e).$implicit,v=c5(2);return $M(v.onEditRenderer(r,s))})("keydown",function(r){return r.stopPropagation()}),Ir(7,"mat-icon",12),Po(8,"edit"),Ur()(),Ir(9,"button",13),Ig("click",function(r){let s=PM(e).$implicit,v=c5(2);return $M(v.onDeleteRenderer(r,s.id))})("keydown",function(r){return r.stopPropagation()}),Ir(10,"mat-icon",12),Po(11,"delete"),Ur()()();}if(i&2){let e=t.$implicit;sf("value",e.id),Yi(3),kg(e.name),Yi(2),kg(e.rendererUrl),Yi(),sf("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),eo("aria-label","Edit "+e.name),Yi(3),sf("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),eo("aria-label","Delete "+e.name);}}function Wt(i,t){if(i&1&&QK(0,Ht,12,9,"mat-option",8,$t),i&2){let e=c5();XK(e.items());}}var Ae=class i extends ce{selectedRendererId=xL("default");rendererSelected=iNe();settingsService=C(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(pe,t);}onEditRenderer(t,e){this.handleEdit(pe,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[Mn],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,n){e&1&&(Ir(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Po(3,"Renderer"),Ur(),Ir(4,"mat-select",2),Ig("selectionChange",function(s){return n.onSelectionChange(s.value)}),Ir(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Po(8),Ur(),rf(9,qt,2,1,"span",5),Ur()(),rf(10,jt,2,1,"mat-option",6)(11,Wt,2,0),Ur()(),Ir(12,"button",7),Ig("click",function(s){return n.onAddRenderer(s)}),Ir(13,"mat-icon"),Po(14,"add_circle"),Ur()()()),e&2&&(Yi(4),sf("value",n.selectedRendererId())("disabled",n.disabled()),Yi(4),kg(n.selectedItem()?.name),Yi(),of(n.selectedItem()?.rendererUrl?9:-1),Yi(),of(n.items().length===0?10:11),Yi(2),sf("disabled",n.disabled()));},dependencies:[me,nt,de,xi,vi$1,Ci,G,XH,vce,Vi,bi$1,Yt$1,mt,zH],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-option-supporting-text-color, #666);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function Xt(i,t){if(i&1&&(Ir(0,"div",7),Po(1),Ur()),i&2){let e=c5();Yi(),kg(e.errorMessage());}}var he=class i{fb=C(qi);settingsService=C(K);dialogRef=C(ep);data=C(hI,{optional:true});errorMessage=Bt$1(null);hideApiKey=Bt$1(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[Re.required,Re.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[Re.required,Re.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),n=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(n,t,e),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","formControlName","name","placeholder","My Gemini Key"],["matInput","","id","api-key-value-input","formControlName","apiKey","placeholder","Paste your API key here",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Ir(0,"h2",0),Po(1),Ur(),Ir(2,"mat-dialog-content")(3,"form",1),Ig("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),Ir(4,"mat-form-field",2)(5,"mat-label"),Po(6,"Name"),Ur(),VF(7,"input",3),FW(),Ur(),Ir(8,"mat-form-field",2)(9,"mat-label"),Po(10,"API Key"),Ur(),VF(11,"input",4),FW(),Ir(12,"button",5),Ig("click",function(){return n.toggleHideApiKey()}),Ir(13,"mat-icon",6),Po(14),Ur()()(),rf(15,Xt,2,1,"div",7),Ur()(),Ir(16,"mat-dialog-actions",8)(17,"button",9),Po(18,"Cancel"),Ur(),Ir(19,"button",10),Ig("click",function(){return n.onConfirm()}),Po(20),Ur()()),e&2&&(Yi(),kg(n.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),Yi(2),sf("formGroup",n.form),Yi(4),LW(),Yi(4),sf("type",n.hideApiKey()?"password":"text"),LW(),Yi(),eo("aria-label",n.hideApiKey()?"Show API key":"Hide API key"),Yi(2),kg(n.hideApiKey()?"visibility":"visibility_off"),Yi(),of(n.errorMessage()?15:-1),Yi(4),sf("disabled",n.form.invalid),Yi(),UD(" ",n.data?.apiKey?"Save":"Add"," "));},dependencies:[Zi,Li,It,Ui,Gi,Xn,Zn,zH,NH,PH,FH,$H,me,nt,de,Pt,Dn,Rn,XH,QH,vce,Vi,bi$1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var Qt=(i,t)=>t.id;function Yt(i,t){i&1&&(Ir(0,"mat-option",3),Po(1,"No items available \u2014 click + to add"),Ur()),i&2&&sf("disabled",true);}function Zt(i,t){if(i&1){let e=o5();Ir(0,"mat-option",5)(1,"span",6),Po(2),Ur(),Ir(3,"button",7),Ig("keydown",function(r){return r.stopPropagation()})("click",function(r){let s=PM(e).$implicit,v=c5(2);return $M(v.onEditApiKey(r,s))}),Ir(4,"mat-icon",8),Po(5,"edit"),Ur()(),Ir(6,"button",9),Ig("keydown",function(r){return r.stopPropagation()})("click",function(r){let s=PM(e).$implicit,v=c5(2);return $M(v.onDeleteApiKey(r,s.id))}),Ir(7,"mat-icon",8),Po(8,"delete"),Ur()()();}if(i&2){let e=t.$implicit;sf("value",e.id),Yi(2),kg(e.name),Yi(),sf("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),eo("aria-label","Edit "+e.name),Yi(3),sf("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),eo("aria-label","Delete "+e.name);}}function Jt(i,t){if(i&1&&QK(0,Zt,9,8,"mat-option",5,Qt),i&2){let e=c5();XK(e.items());}}var De=class i extends ce{selectedApiKeyId=xL(null);apiKeySelected=iNe();settingsService=C(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(he,t);}onEditApiKey(t,e){this.handleEdit(he,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[Mn],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,n){e&1&&(Ir(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Po(3,"API Key"),Ur(),Ir(4,"mat-select",2),Ig("selectionChange",function(s){return n.onSelectionChange(s.value)}),Ir(5,"mat-select-trigger"),Po(6),Ur(),rf(7,Yt,2,1,"mat-option",3)(8,Jt,2,0),Ur()(),Ir(9,"button",4),Ig("click",function(s){return n.onAddApiKey(s)}),Ir(10,"mat-icon"),Po(11,"add_circle"),Ur()()()),e&2&&(Yi(4),sf("value",n.selectedApiKeyId())("disabled",n.disabled()),Yi(2),UD(" ",n.selectedItem()?.name," "),Yi(),of(n.items().length===0?7:8),Yi(2),sf("disabled",n.disabled()));},dependencies:[me,nt,de,xi,vi$1,Ci,G,XH,vce,Vi,bi$1,Yt$1,mt,zH],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function ei(i,t){if(i&1&&(Ir(0,"div",4),Po(1),Ur()),i&2){let e=c5();Yi(),kg(e.errorMessage());}}var fe=class i{fb=C(qi);dialogRef=C(ep);data=C(hI,{optional:true});errorMessage=Bt$1(null);form=this.fb.group({url:[this.data?.server?.url??"",[Re.required,Oe]]});onConfirm(){this.errorMessage.set(null);let t=this.form.controls.url.value.trim();this.dialogRef.close({url:t});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-mcp-server-dialog"]],decls:14,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","mcp-server-url-input","formControlName","url","placeholder","http://localhost:3001/mcp"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","button","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Ir(0,"h2",0),Po(1),Ur(),Ir(2,"mat-dialog-content")(3,"form",1),Ig("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),Ir(4,"mat-form-field",2)(5,"mat-label"),Po(6,"Server URL"),Ur(),VF(7,"input",3),FW(),Ur(),rf(8,ei,2,1,"div",4),Ur()(),Ir(9,"mat-dialog-actions",5)(10,"button",6),Po(11,"Cancel"),Ur(),Ir(12,"button",7),Ig("click",function(){return n.onConfirm()}),Po(13),Ur()()),e&2&&(Yi(),kg(n.data?.server?"Edit MCP Server":"Add MCP Server"),Yi(2),sf("formGroup",n.form),Yi(4),LW(),Yi(),of(n.errorMessage()?8:-1),Yi(4),sf("disabled",n.form.invalid),Yi(),UD(" ",n.data?.server?"Save":"Add"," "));},dependencies:[Zi,Li,It,Ui,Gi,Xn,Zn,zH,NH,PH,FH,$H,me,nt,de,Dn,Rn,XH,QH],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ti=(i,t)=>t.id,ii=(i,t)=>t.name;function ni(i,t){if(i&1){let e=o5();Ir(0,"div",4)(1,"h3"),Po(2,"Gemini API Provisioning"),Ur(),Ir(3,"a2ui-composer-api-key-selector",27),Ig("apiKeySelected",function(r){PM(e);let s=c5();return $M(s.onApiKeySelected(r))}),Ur()();}if(i&2){let e=c5();Yi(3),sf("selectedApiKeyId",e.selectedApiKeyId());}}function ai(i,t){i&1&&(Ir(0,"mat-card-footer",10),Po(1," To obtain an API key: "),Ir(2,"ol")(3,"li"),Po(4," Go to "),Ir(5,"a",28),Po(6," Google AI Studio"),Ur(),Po(7," and sign in with your Google account. "),Ur(),Ir(8,"li"),Po(9,"Click Create API key."),Ur(),Ir(10,"li"),Po(11,"Select or create a Google Cloud project when prompted, then click Create key."),Ur(),Ir(12,"li"),Po(13,"Save your key in a secure location!"),Ur()(),Po(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),Ir(15,"a",29),Po(16,"Web Crypto API"),Ur(),Po(17,". Neither Google nor anyone else has access to this key. "),Ur());}function oi(i,t){if(i&1&&(Ir(0,"code"),Po(1),Ur()),i&2){let e=c5();Yi(),UD("[System] Active renderer updated to ",e.activeRendererUrl());}}function ri(i,t){if(i&1&&(Ir(0,"code",18),Po(1),Ur()),i&2){let e=c5();Yi(),UD("[Catalog Error] ",e.catalogErrorMessage());}}function li(i,t){i&1&&(Ir(0,"code",19),Po(1,"[System] Catalog handshake completed successfully. Active catalog ready."),Ur());}function di(i,t){i&1&&(Ir(0,"code"),Po(1,"[System] Catalog handshake in progress. Indexing metadata..."),Ur());}function si(i,t){i&1&&(Ir(0,"code"),Po(1,"[System] Bridge connected. Initializing catalog handshake..."),Ur());}function ci(i,t){i&1&&(Ir(0,"code"),Po(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),Ur());}function mi(i,t){i&1&&(Ir(0,"div",25),Po(1,"No MCP servers configured \u2014 click + to add"),Ur());}function pi(i,t){if(i&1&&Po(0),i&2){let e=c5().$implicit;UD(" Connected (",e.tools?.length||0," tools) ");}}function gi(i,t){i&1&&Po(0," Connecting... ");}function ui(i,t){if(i&1&&Po(0),i&2){let e=c5().$implicit;UD(" Error: ",e.errorMessage||"Failed to connect"," ");}}function hi(i,t){i&1&&Po(0," Disconnected ");}function fi(i,t){if(i&1&&(Ir(0,"span",38),Po(1),Ur()),i&2){let e=c5().$implicit;Yi(),kg(e.url);}}function _i(i,t){if(i&1&&(Ir(0,"span",44),Po(1),Ur()),i&2){let e=t.$implicit;Yi(),kg(e.name);}}function vi(i,t){if(i&1&&(Ir(0,"div",43),QK(1,_i,2,1,"span",44,ii),Ur()),i&2){let e=c5().$implicit;Yi(),XK(e.tools);}}function yi(i,t){if(i&1){let e=o5();Ir(0,"div",30)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),Ig("change",function(r){let s=PM(e).$implicit,v=c5(2);return $M(v.toggleMcpServer(s.id,r.checked))}),Ur(),Ir(4,"div",34)(5,"div",35)(6,"span",36),Po(7),Ur(),Ir(8,"span",37),rf(9,pi,1,1)(10,gi,1,0)(11,ui,1,1)(12,hi,1,0),Ur()(),rf(13,fi,2,1,"span",38),Ur()(),Ir(14,"div",39)(15,"button",40),Ig("click",function(){let r=PM(e).$implicit,s=c5(2);return $M(s.testMcpServer(r.id))}),Po(16," Test "),Ur(),Ir(17,"button",41),Ig("click",function(){let r=PM(e).$implicit,s=c5(2);return $M(s.openEditMcpServerDialog(r))}),Ir(18,"mat-icon",24),Po(19,"edit"),Ur()(),Ir(20,"button",42),Ig("click",function(){let r=PM(e).$implicit,s=c5(2);return $M(s.removeMcpServer(r.id))}),Ir(21,"mat-icon",24),Po(22,"delete"),Ur()()()(),rf(23,vi,3,0,"div",43),Ur();}if(i&2){let e=t.$implicit;Yi(3),sf("checked",e.enabled),eo("aria-label","Toggle "+(e.name||e.url)),Yi(4),kg(e.name||e.url),Yi(),eo("data-status",e.status),Yi(),of(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),Yi(4),of(e.name&&e.name!==e.url?13:-1),Yi(10),of(e.tools&&e.tools.length>0?23:-1);}}function bi(i,t){if(i&1&&(Ir(0,"div",26),QK(1,yi,24,7,"div",30,ti),Ur()),i&2){let e=c5();Yi(),XK(e.mcpManager.servers());}}var Ft=class i{fb=C(qi);dialog=C(tp);destroyRef=C(hn);startupResolution=C(hv);startupConfigState=C(LB);hostCommunication=C(u3);catalogManagement=C(se);configProvider=C(Jl);settingsService=C(K);mcpManager=C(a_);is1PAuthEnabled=C(FB);selectedRendererId=Bt$1(null);selectedApiKeyId=uf(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=uf(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=Bt$1(false);isApiKeyProvidedByConfig=uf(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=uf(()=>this.isApiKeyProvidedByConfig());hideApiKey=Bt$1(true);forceThirdPartyAuth=Bt$1(false);bridgeConnected=uf(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=uf(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=uf(()=>this.catalogManagement.catalogError());activeRendererUrl=uf(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){Ga(()=>{let t=this.settingsService.selectedRendererId()||"default";$o(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}openAddMcpServerDialog(){this.dialog.open(fe,{width:"450px"}).afterClosed().pipe(l$e(this.destroyRef)).subscribe(e=>{e?.url&&this.mcpManager.addServer(e.url);});}openEditMcpServerDialog(t){this.dialog.open(fe,{width:"450px",data:{server:t}}).afterClosed().pipe(l$e(this.destroyRef)).subscribe(n=>{n?.url&&this.mcpManager.updateServerUrl(t.id,n.url);});}async removeMcpServer(t){await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=an({type:i,selectors:[["a2ui-composer-settings"]],decls:57,vars:13,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-card-header"],[1,"mcp-header-text"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click"],["aria-hidden","true"],[1,"mcp-empty-state"],[1,"mcp-server-list"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-item"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit MCP Server","aria-label","Edit MCP Server",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete MCP Server","aria-label","Delete MCP Server",1,"mcp-delete-btn",3,"click"],[1,"mcp-server-tools"],[1,"mcp-tool-name"]],template:function(e,n){e&1&&(Ir(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Po(4,"A2UI Composer Settings"),Ur()(),Ir(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Po(9,"Renderer"),Ur(),Ir(10,"a2ui-composer-renderer-selector",5),Ig("rendererSelected",function(s){return n.onRendererSelected(s)}),Ur()(),rf(11,ni,4,1,"div",4),Ir(12,"div",6)(13,"h3"),Po(14,"Developer Authentication Overrides"),Ur(),Ir(15,"p",7),Po(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),Ur(),Ir(17,"div",8)(18,"mat-slide-toggle",9),Ig("change",function(){return n.toggleForceThirdPartyAuth()}),Po(19," Force External Third-Party Authentication Mode "),Ur()()()()(),rf(20,ai,18,0,"mat-card-footer",10),Ur(),Ir(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Po(24,"Connection Status & Diagnostics"),Ur(),Ir(25,"p",12),Po(26,"Real-time monitoring bridge"),Ur()(),Ir(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Po(31),Ur(),Ir(32,"mat-chip",15),Po(33),Ur()()(),Ir(34,"div",16)(35,"h3"),Po(36,"Overlay Logs Preview"),Ur(),Ir(37,"div",17),rf(38,oi,2,1,"code"),rf(39,ri,2,1,"code",18)(40,li,2,0,"code",19)(41,di,2,0,"code")(42,si,2,0,"code")(43,ci,2,0,"code"),Ur()()()(),Ir(44,"mat-card",20)(45,"mat-card-header",21)(46,"div",22)(47,"h2",2),Po(48,"MCP Servers"),Ur(),Ir(49,"p",12),Po(50," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),Ur()(),Ir(51,"button",23),Ig("click",function(){return n.openAddMcpServerDialog()}),Ir(52,"mat-icon",24),Po(53,"add_circle"),Ur()()(),Ir(54,"mat-card-content"),rf(55,mi,2,0,"div",25)(56,bi,3,0,"div",26),Ur()()()),e&2&&(Yi(6),sf("formGroup",n.settingsForm),Yi(4),sf("selectedRendererId",n.selectedRendererId()),Yi(),of(n.isThirdParty()?11:-1),Yi(),sf("hidden",!n.is1PAuthEnabled),Yi(6),sf("checked",n.forceThirdPartyAuth()),Yi(2),of(n.isThirdParty()?20:-1),Yi(10),sf("color",n.bridgeConnected()?"primary":"accent"),Yi(),UD("Bridge: ",n.bridgeConnected()?"Connected":"Disconnected"),Yi(),sf("color",n.catalogStatus()==="Connected"?"primary":n.catalogStatus()==="Indexing"?"accent":n.catalogStatus()==="Error"?"warn":void 0),Yi(),UD("Catalog Handshake: ",n.catalogStatus()),Yi(5),of(n.activeRendererUrl()?38:-1),Yi(),of(n.catalogErrorMessage()?39:n.catalogStatus()==="Connected"?40:n.catalogStatus()==="Indexing"?41:n.bridgeConnected()?42:43),Yi(16),of(n.mcpManager.servers().length===0?55:56));},dependencies:[zi,Li,Gi,Zi,Xn,me,Dn,XH,QH,vce,Vi,bi$1,E,F,k,z,T,S,j,ot,ki,ct,Et,Te,Yt$1,mt,zH,Ae,De],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto}.settings-container[_ngcontent-%COMP%]{padding:24px;max-width:600px;margin:0 auto}.form-section[_ngcontent-%COMP%]{margin-top:16px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-card[_ngcontent-%COMP%]{margin-top:24px}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-lowest);color:var(--mat-sys-primary);padding:12px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:700}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-small-size, 12px);padding-left:24px;padding-bottom:12px}.mcp-card-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mcp-card-header[_ngcontent-%COMP%]     .mat-mdc-card-header-text{display:none}.mcp-card-header[_ngcontent-%COMP%]   .mcp-header-text[_ngcontent-%COMP%]{flex:1;min-width:0}.mcp-card-header[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0;margin-top:-4px;margin-right:-8px}.mcp-empty-state[_ngcontent-%COMP%]{margin-top:16px;padding:16px;text-align:center;font-size:13px;font-style:italic;color:var(--mat-sys-on-surface-variant);border-radius:8px;border:1px dashed var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-lowest)}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:4px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{Ft as Settings};