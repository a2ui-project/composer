import {K}from'./chunk-DjAN2sZs.js';import {E,F,k,z,T,S,j}from'./chunk-B4-5taqS.js';import {_,cg as nf,V as an,G as Gg,g as gg,ab as jV,s as se,C as Cl,aa as vy,ch as mg,c as ct,u as ud,v as va,af as yi$1,Z as LLe,b as Xt$1,p as pL,f as fL,W as Wne,ci as eL,h as fr,B as Bi,x as xr,o as om,j as od,F as Fo,k as sd,n as id,r as rb,cj as tf,ck as xD,cl as JF,cm as KF,cn as QF,co as YF,i as iO,bC as B8,l as am,bD as y8,y as bt,H as ht,I as mo,J as ot$1,aI as Xd,aR as fm,aC as U,aX as Ri$1,aN as pt,b2 as Fr,b3 as cL,bc as MO,bT as qo,cp as BFe,bl as ao,b6 as en,Q as Qc,L as jo,bJ as G3,A as Ar,z as zo,aA as ob,cq as Tu,bZ as GO,ce as ad,M as nb,aG as ld,R as im,T as sm,at as UO,bv as LIe,az as $n,am as L3,ak as j3,ad as R3,ae as O3,b_ as px,U as gt,ap as ex,aq as tx}from'./main.js';import {o as ot,k as ki$1,c as ct$1}from'./chunk-BfDWznQj.js';import {Y as Yt$1,m as mt}from'./chunk-BUhfbQVZ.js';import {m as me,V as Vr,W as Wt$1,B as Be,z as zr,a as zo$1,L as Lo,P as Po,b as Fe,O as Oi$1}from'./chunk-CqWVJHXZ.js';import {k as ki,O as Oi,a as Ni,w as wi,R as Ri,U as Un,c as ci$1,l as li$1,N as Ne,A as At,I as Ii,j as jn,b as je,J}from'./chunk-jo0FPBi5.js';var Kt=["*"],Dt=(()=>{class i{labelPosition="after";static \u0275fac=function(n){return new(n||i)};static \u0275cmp=Xt$1({type:i,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(n,r){n&2&&Ar("mdc-form-field--align-end",r.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Kt,decls:1,vars:0,template:function(n,r){n&1&&(Qc(),jo(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return i})();var Nt=["switch"],zt=["*"];function Vt(i,t){i&1&&(fr(0,"span",11),px(),fr(1,"svg",13),iO(2,"path",14),xr(),fr(3,"svg",15),iO(4,"path",16),xr()());}var Gt=new U("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Pe=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Te=(()=>{class i{_elementRef=_(ot$1);_focusMonitor=_(Xd);_changeDetectorRef=_(fm);defaults=_(Gt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Pe(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Ri$1();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new pt;toggleChange=new pt;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){_(Fr).load(cL);let e=_(new MO("tabindex"),{optional:true}),n=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=n.color||"accent",this.id=this._uniqueId=_(qo).getId("mat-mdc-slide-toggle-"),this.hideIcon=n.hideIcon??false,this.disabledInteractive=n.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Pe(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=Xt$1({type:i,selectors:[["mat-slide-toggle"]],viewQuery:function(n,r){if(n&1&&ld(Nt,5),n&2){let s;im(s=sm())&&(r._switchElement=s.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(n,r){n&2&&(ad("id",r.id),zo("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),nb(r.color?"mat-"+r.color:""),Ar("mat-mdc-slide-toggle-focused",r._focused)("mat-mdc-slide-toggle-checked",r.checked)("_mat-animation-noopable",r._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",en],color:"color",disabled:[2,"disabled","disabled",en],disableRipple:[2,"disableRipple","disableRipple",en],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:GO(e)],checked:[2,"checked","checked",en],hideIcon:[2,"hideIcon","hideIcon",en],disabledInteractive:[2,"disabledInteractive","disabledInteractive",en]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[ob([{provide:je,useExisting:Tu(()=>i),multi:true},{provide:J,useExisting:i,multi:true}]),ao],ngContentSelectors:zt,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(n,r){if(n&1&&(Qc(),fr(0,"div",1)(1,"button",2,0),om("click",function(){return r._handleClick()}),iO(3,"div",3)(4,"span",4),fr(5,"span",5)(6,"span",6)(7,"span",7),iO(8,"span",8),xr(),fr(9,"span",9),iO(10,"span",10),xr(),od(11,Vt,5,0,"span",11),xr()()(),fr(12,"label",12),om("click",function(v){return v.stopPropagation()}),jo(13),xr()()),n&2){let s=G3(2);sd("labelPosition",r.labelPosition),Fo(),Ar("mdc-switch--selected",r.checked)("mdc-switch--unselected",!r.checked)("mdc-switch--checked",r.checked)("mdc-switch--disabled",r.disabled)("mat-mdc-slide-toggle-disabled-interactive",r.disabledInteractive),sd("tabIndex",r.disabled&&!r.disabledInteractive?-1:r.tabIndex)("disabled",r.disabled&&!r.disabledInteractive),zo("id",r.buttonId)("name",r.name)("aria-label",r.ariaLabel)("aria-labelledby",r._getAriaLabelledBy())("aria-describedby",r.ariaDescribedby)("aria-required",r.required||null)("aria-checked",r.checked)("aria-disabled",r.disabled&&r.disabledInteractive?"true":null),Fo(9),sd("matRippleTrigger",s)("matRippleDisabled",r.disableRipple||r.disabled)("matRippleCentered",true),Fo(),id(r.hideIcon?-1:11),Fo(),sd("for",r.buttonId),zo("id",r._labelId);}},dependencies:[BFe,Dt],styles:[`.mdc-switch {
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
`],encapsulation:2})}return i})(),Et=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=bt({type:i});static \u0275inj=ht({imports:[Te,mo]})}return i})();function Bt(i,t){if(i&1&&(fr(0,"div",5),Bi(1),xr()),i&2){let e=j3();Fo(),am(e.errorMessage());}}function Oe(i){let t=i.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var pe=class i{fb=_(ki);settingsService=_(K);dialogRef=_(tf);data=_(xD,{optional:true});errorMessage=ct(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[Ne.required,Ne.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[Ne.required,Oe]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),n=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:n,name:t,rendererUrl:e}),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","formControlName","name","placeholder","My Renderer"],["matInput","","id","renderer-url-input","formControlName","rendererUrl","placeholder","http://localhost:3000"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(fr(0,"h2",0),Bi(1),xr(),fr(2,"mat-dialog-content")(3,"form",1),om("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),fr(4,"mat-form-field",2)(5,"mat-label"),Bi(6,"Name"),xr(),iO(7,"input",3),B8(),xr(),fr(8,"mat-form-field",2)(9,"mat-label"),Bi(10,"Renderer URL"),xr(),iO(11,"input",4),B8(),xr(),od(12,Bt,2,1,"div",5),xr()(),fr(13,"mat-dialog-actions",6)(14,"button",7),Bi(15,"Cancel"),xr(),fr(16,"button",8),om("click",function(){return n.onConfirm()}),Bi(17),xr()()),e&2&&(Fo(),am(n.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),Fo(2),sd("formGroup",n.form),Fo(4),y8(),Fo(4),y8(),Fo(),id(n.errorMessage()?12:-1),Fo(4),sd("disabled",n.form.invalid),Fo(),rb(" ",n.data?.renderer?"Save":"Add"," "));},dependencies:[Ri,Ni,At,Ii,wi,Un,jn,eL,JF,KF,QF,YF,me,Wt$1,Be,Vr,zr,pL,fL],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ce=class i{disabled=UO(false);dialog=_(nf);destroyRef=_(an);items=ct([]);selectedItem=ud(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(LLe(this.destroyRef)).subscribe(async r=>{r&&(await this.refreshItems(),this.emitSelection(r));});}async handleEdit(t,e,n,r){if(e.stopPropagation(),e.preventDefault(),n.readOnly)return;this.dialog.open(t,{width:"450px",data:{[r]:n}}).afterClosed().pipe(LLe(this.destroyRef)).subscribe(async v=>{v&&(await this.refreshItems(),this.getSelectedId()===v&&this.emitSelection(v));});}async handleDelete(t,e,n=null){t.stopPropagation(),t.preventDefault(),!this.items().find(s=>s.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(n));}static \u0275fac=function(e){return new(e||i)};static \u0275dir=gt({type:i,inputs:{disabled:[1,"disabled"]}})};var $t=(i,t)=>t.id;function qt(i,t){if(i&1&&(fr(0,"span",5),Bi(1),xr()),i&2){let e=j3();Fo(),am(e.selectedItem()?.rendererUrl);}}function jt(i,t){i&1&&(fr(0,"mat-option",6),Bi(1,"No items available \u2014 click + to add"),xr()),i&2&&sd("disabled",true);}function Ht(i,t){if(i&1){let e=L3();fr(0,"mat-option",8)(1,"div",9)(2,"div",10),Bi(3),xr(),fr(4,"div",5),Bi(5),xr()(),fr(6,"button",11),om("click",function(r){let s=ex(e).$implicit,v=j3(2);return tx(v.onEditRenderer(r,s))})("keydown",function(r){return r.stopPropagation()}),fr(7,"mat-icon",12),Bi(8,"edit"),xr()(),fr(9,"button",13),om("click",function(r){let s=ex(e).$implicit,v=j3(2);return tx(v.onDeleteRenderer(r,s.id))})("keydown",function(r){return r.stopPropagation()}),fr(10,"mat-icon",12),Bi(11,"delete"),xr()()();}if(i&2){let e=t.$implicit;sd("value",e.id),Fo(3),am(e.name),Fo(2),am(e.rendererUrl),Fo(),sd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),zo("aria-label","Edit "+e.name),Fo(3),sd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),zo("aria-label","Delete "+e.name);}}function Wt(i,t){if(i&1&&R3(0,Ht,12,9,"mat-option",8,$t),i&2){let e=j3();O3(e.items());}}var Ae=class i extends ce{selectedRendererId=UO("default");rendererSelected=LIe();settingsService=_(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(pe,t);}onEditRenderer(t,e){this.handleEdit(pe,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[$n],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,n){e&1&&(fr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Bi(3,"Renderer"),xr(),fr(4,"mat-select",2),om("selectionChange",function(s){return n.onSelectionChange(s.value)}),fr(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Bi(8),xr(),od(9,qt,2,1,"span",5),xr()(),od(10,jt,2,1,"mat-option",6)(11,Wt,2,0),xr()(),fr(12,"button",7),om("click",function(s){return n.onAddRenderer(s)}),fr(13,"mat-icon"),Bi(14,"add_circle"),xr()()()),e&2&&(Fo(4),sd("value",n.selectedRendererId())("disabled",n.disabled()),Fo(4),am(n.selectedItem()?.name),Fo(),id(n.selectedItem()?.rendererUrl?9:-1),Fo(),id(n.items().length===0?10:11),Fo(2),sd("disabled",n.disabled()));},dependencies:[me,Wt$1,Be,zo$1,Lo,Po,Fe,pL,Wne,ci$1,li$1,Yt$1,mt,eL],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-option-supporting-text-color, #666);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function Xt(i,t){if(i&1&&(fr(0,"div",7),Bi(1),xr()),i&2){let e=j3();Fo(),am(e.errorMessage());}}var he=class i{fb=_(ki);settingsService=_(K);dialogRef=_(tf);data=_(xD,{optional:true});errorMessage=ct(null);hideApiKey=ct(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[Ne.required,Ne.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[Ne.required,Ne.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),n=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(n,t,e),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","formControlName","name","placeholder","My Gemini Key"],["matInput","","id","api-key-value-input","formControlName","apiKey","placeholder","Paste your API key here",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(fr(0,"h2",0),Bi(1),xr(),fr(2,"mat-dialog-content")(3,"form",1),om("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),fr(4,"mat-form-field",2)(5,"mat-label"),Bi(6,"Name"),xr(),iO(7,"input",3),B8(),xr(),fr(8,"mat-form-field",2)(9,"mat-label"),Bi(10,"API Key"),xr(),iO(11,"input",4),B8(),fr(12,"button",5),om("click",function(){return n.toggleHideApiKey()}),fr(13,"mat-icon",6),Bi(14),xr()()(),od(15,Xt,2,1,"div",7),xr()(),fr(16,"mat-dialog-actions",8)(17,"button",9),Bi(18,"Cancel"),xr(),fr(19,"button",10),om("click",function(){return n.onConfirm()}),Bi(20),xr()()),e&2&&(Fo(),am(n.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),Fo(2),sd("formGroup",n.form),Fo(4),y8(),Fo(4),sd("type",n.hideApiKey()?"password":"text"),y8(),Fo(),zo("aria-label",n.hideApiKey()?"Show API key":"Hide API key"),Fo(2),am(n.hideApiKey()?"visibility":"visibility_off"),Fo(),id(n.errorMessage()?15:-1),Fo(4),sd("disabled",n.form.invalid),Fo(),rb(" ",n.data?.apiKey?"Save":"Add"," "));},dependencies:[Ri,Ni,At,Ii,wi,Un,jn,eL,JF,KF,QF,YF,me,Wt$1,Be,Oi$1,Vr,zr,pL,fL,Wne,ci$1,li$1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var Qt=(i,t)=>t.id;function Yt(i,t){i&1&&(fr(0,"mat-option",3),Bi(1,"No items available \u2014 click + to add"),xr()),i&2&&sd("disabled",true);}function Zt(i,t){if(i&1){let e=L3();fr(0,"mat-option",5)(1,"span",6),Bi(2),xr(),fr(3,"button",7),om("keydown",function(r){return r.stopPropagation()})("click",function(r){let s=ex(e).$implicit,v=j3(2);return tx(v.onEditApiKey(r,s))}),fr(4,"mat-icon",8),Bi(5,"edit"),xr()(),fr(6,"button",9),om("keydown",function(r){return r.stopPropagation()})("click",function(r){let s=ex(e).$implicit,v=j3(2);return tx(v.onDeleteApiKey(r,s.id))}),fr(7,"mat-icon",8),Bi(8,"delete"),xr()()();}if(i&2){let e=t.$implicit;sd("value",e.id),Fo(2),am(e.name),Fo(),sd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),zo("aria-label","Edit "+e.name),Fo(3),sd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),zo("aria-label","Delete "+e.name);}}function Jt(i,t){if(i&1&&R3(0,Zt,9,8,"mat-option",5,Qt),i&2){let e=j3();O3(e.items());}}var De=class i extends ce{selectedApiKeyId=UO(null);apiKeySelected=LIe();settingsService=_(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(he,t);}onEditApiKey(t,e){this.handleEdit(he,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[$n],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,n){e&1&&(fr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Bi(3,"API Key"),xr(),fr(4,"mat-select",2),om("selectionChange",function(s){return n.onSelectionChange(s.value)}),fr(5,"mat-select-trigger"),Bi(6),xr(),od(7,Yt,2,1,"mat-option",3)(8,Jt,2,0),xr()(),fr(9,"button",4),om("click",function(s){return n.onAddApiKey(s)}),fr(10,"mat-icon"),Bi(11,"add_circle"),xr()()()),e&2&&(Fo(4),sd("value",n.selectedApiKeyId())("disabled",n.disabled()),Fo(2),rb(" ",n.selectedItem()?.name," "),Fo(),id(n.items().length===0?7:8),Fo(2),sd("disabled",n.disabled()));},dependencies:[me,Wt$1,Be,zo$1,Lo,Po,Fe,pL,Wne,ci$1,li$1,Yt$1,mt,eL],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function ei(i,t){if(i&1&&(fr(0,"div",4),Bi(1),xr()),i&2){let e=j3();Fo(),am(e.errorMessage());}}var fe=class i{fb=_(ki);dialogRef=_(tf);data=_(xD,{optional:true});errorMessage=ct(null);form=this.fb.group({url:[this.data?.server?.url??"",[Ne.required,Oe]]});onConfirm(){this.errorMessage.set(null);let t=this.form.controls.url.value.trim();this.dialogRef.close({url:t});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-mcp-server-dialog"]],decls:14,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","mcp-server-url-input","formControlName","url","placeholder","http://localhost:3001/mcp"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","button","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(fr(0,"h2",0),Bi(1),xr(),fr(2,"mat-dialog-content")(3,"form",1),om("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),fr(4,"mat-form-field",2)(5,"mat-label"),Bi(6,"Server URL"),xr(),iO(7,"input",3),B8(),xr(),od(8,ei,2,1,"div",4),xr()(),fr(9,"mat-dialog-actions",5)(10,"button",6),Bi(11,"Cancel"),xr(),fr(12,"button",7),om("click",function(){return n.onConfirm()}),Bi(13),xr()()),e&2&&(Fo(),am(n.data?.server?"Edit MCP Server":"Add MCP Server"),Fo(2),sd("formGroup",n.form),Fo(4),y8(),Fo(),id(n.errorMessage()?8:-1),Fo(4),sd("disabled",n.form.invalid),Fo(),rb(" ",n.data?.server?"Save":"Add"," "));},dependencies:[Ri,Ni,At,Ii,wi,Un,jn,eL,JF,KF,QF,YF,me,Wt$1,Be,Vr,zr,pL,fL],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ti=(i,t)=>t.id,ii=(i,t)=>t.name;function ni(i,t){if(i&1){let e=L3();fr(0,"div",4)(1,"h3"),Bi(2,"Gemini API Provisioning"),xr(),fr(3,"a2ui-composer-api-key-selector",27),om("apiKeySelected",function(r){ex(e);let s=j3();return tx(s.onApiKeySelected(r))}),xr()();}if(i&2){let e=j3();Fo(3),sd("selectedApiKeyId",e.selectedApiKeyId());}}function ai(i,t){i&1&&(fr(0,"mat-card-footer",10),Bi(1," To obtain an API key: "),fr(2,"ol")(3,"li"),Bi(4," Go to "),fr(5,"a",28),Bi(6," Google AI Studio"),xr(),Bi(7," and sign in with your Google account. "),xr(),fr(8,"li"),Bi(9,"Click Create API key."),xr(),fr(10,"li"),Bi(11,"Select or create a Google Cloud project when prompted, then click Create key."),xr(),fr(12,"li"),Bi(13,"Save your key in a secure location!"),xr()(),Bi(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),fr(15,"a",29),Bi(16,"Web Crypto API"),xr(),Bi(17,". Neither Google nor anyone else has access to this key. "),xr());}function oi(i,t){if(i&1&&(fr(0,"code"),Bi(1),xr()),i&2){let e=j3();Fo(),rb("[System] Active renderer updated to ",e.activeRendererUrl());}}function ri(i,t){if(i&1&&(fr(0,"code",18),Bi(1),xr()),i&2){let e=j3();Fo(),rb("[Catalog Error] ",e.catalogErrorMessage());}}function li(i,t){i&1&&(fr(0,"code",19),Bi(1,"[System] Catalog handshake completed successfully. Active catalog ready."),xr());}function di(i,t){i&1&&(fr(0,"code"),Bi(1,"[System] Catalog handshake in progress. Indexing metadata..."),xr());}function si(i,t){i&1&&(fr(0,"code"),Bi(1,"[System] Bridge connected. Initializing catalog handshake..."),xr());}function ci(i,t){i&1&&(fr(0,"code"),Bi(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),xr());}function mi(i,t){i&1&&(fr(0,"div",25),Bi(1,"No MCP servers configured \u2014 click + to add"),xr());}function pi(i,t){if(i&1&&Bi(0),i&2){let e=j3().$implicit;rb(" Connected (",e.tools?.length||0," tools) ");}}function gi(i,t){i&1&&Bi(0," Connecting... ");}function ui(i,t){if(i&1&&Bi(0),i&2){let e=j3().$implicit;rb(" Error: ",e.errorMessage||"Failed to connect"," ");}}function hi(i,t){i&1&&Bi(0," Disconnected ");}function fi(i,t){if(i&1&&(fr(0,"span",38),Bi(1),xr()),i&2){let e=j3().$implicit;Fo(),am(e.url);}}function _i(i,t){if(i&1&&(fr(0,"span",44),Bi(1),xr()),i&2){let e=t.$implicit;Fo(),am(e.name);}}function vi(i,t){if(i&1&&(fr(0,"div",43),R3(1,_i,2,1,"span",44,ii),xr()),i&2){let e=j3().$implicit;Fo(),O3(e.tools);}}function yi(i,t){if(i&1){let e=L3();fr(0,"div",30)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),om("change",function(r){let s=ex(e).$implicit,v=j3(2);return tx(v.toggleMcpServer(s.id,r.checked))}),xr(),fr(4,"div",34)(5,"div",35)(6,"span",36),Bi(7),xr(),fr(8,"span",37),od(9,pi,1,1)(10,gi,1,0)(11,ui,1,1)(12,hi,1,0),xr()(),od(13,fi,2,1,"span",38),xr()(),fr(14,"div",39)(15,"button",40),om("click",function(){let r=ex(e).$implicit,s=j3(2);return tx(s.testMcpServer(r.id))}),Bi(16," Test "),xr(),fr(17,"button",41),om("click",function(){let r=ex(e).$implicit,s=j3(2);return tx(s.openEditMcpServerDialog(r))}),fr(18,"mat-icon",24),Bi(19,"edit"),xr()(),fr(20,"button",42),om("click",function(){let r=ex(e).$implicit,s=j3(2);return tx(s.removeMcpServer(r.id))}),fr(21,"mat-icon",24),Bi(22,"delete"),xr()()()(),od(23,vi,3,0,"div",43),xr();}if(i&2){let e=t.$implicit;Fo(3),sd("checked",e.enabled),zo("aria-label","Toggle "+(e.name||e.url)),Fo(4),am(e.name||e.url),Fo(),zo("data-status",e.status),Fo(),id(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),Fo(4),id(e.name&&e.name!==e.url?13:-1),Fo(10),id(e.tools&&e.tools.length>0?23:-1);}}function bi(i,t){if(i&1&&(fr(0,"div",26),R3(1,yi,24,7,"div",30,ti),xr()),i&2){let e=j3();Fo(),O3(e.mcpManager.servers());}}var Ft=class i{fb=_(ki);dialog=_(nf);destroyRef=_(an);startupResolution=_(Gg);startupConfigState=_(gg);hostCommunication=_(jV);catalogManagement=_(se);configProvider=_(Cl);settingsService=_(K);mcpManager=_(vy);is1PAuthEnabled=_(mg);selectedRendererId=ct(null);selectedApiKeyId=ud(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=ud(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=ct(false);isApiKeyProvidedByConfig=ud(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=ud(()=>this.isApiKeyProvidedByConfig());hideApiKey=ct(true);forceThirdPartyAuth=ct(false);bridgeConnected=ud(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=ud(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=ud(()=>this.catalogManagement.catalogError());activeRendererUrl=ud(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){va(()=>{let t=this.settingsService.selectedRendererId()||"default";yi$1(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}openAddMcpServerDialog(){this.dialog.open(fe,{width:"450px"}).afterClosed().pipe(LLe(this.destroyRef)).subscribe(e=>{e?.url&&this.mcpManager.addServer(e.url);});}openEditMcpServerDialog(t){this.dialog.open(fe,{width:"450px",data:{server:t}}).afterClosed().pipe(LLe(this.destroyRef)).subscribe(n=>{n?.url&&this.mcpManager.updateServerUrl(t.id,n.url);});}async removeMcpServer(t){await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-settings"]],decls:57,vars:13,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-card-header"],[1,"mcp-header-text"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click"],["aria-hidden","true"],[1,"mcp-empty-state"],[1,"mcp-server-list"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-item"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit MCP Server","aria-label","Edit MCP Server",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete MCP Server","aria-label","Delete MCP Server",1,"mcp-delete-btn",3,"click"],[1,"mcp-server-tools"],[1,"mcp-tool-name"]],template:function(e,n){e&1&&(fr(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Bi(4,"A2UI Composer Settings"),xr()(),fr(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Bi(9,"Renderer"),xr(),fr(10,"a2ui-composer-renderer-selector",5),om("rendererSelected",function(s){return n.onRendererSelected(s)}),xr()(),od(11,ni,4,1,"div",4),fr(12,"div",6)(13,"h3"),Bi(14,"Developer Authentication Overrides"),xr(),fr(15,"p",7),Bi(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),xr(),fr(17,"div",8)(18,"mat-slide-toggle",9),om("change",function(){return n.toggleForceThirdPartyAuth()}),Bi(19," Force External Third-Party Authentication Mode "),xr()()()()(),od(20,ai,18,0,"mat-card-footer",10),xr(),fr(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Bi(24,"Connection Status & Diagnostics"),xr(),fr(25,"p",12),Bi(26,"Real-time monitoring bridge"),xr()(),fr(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Bi(31),xr(),fr(32,"mat-chip",15),Bi(33),xr()()(),fr(34,"div",16)(35,"h3"),Bi(36,"Overlay Logs Preview"),xr(),fr(37,"div",17),od(38,oi,2,1,"code"),od(39,ri,2,1,"code",18)(40,li,2,0,"code",19)(41,di,2,0,"code")(42,si,2,0,"code")(43,ci,2,0,"code"),xr()()()(),fr(44,"mat-card",20)(45,"mat-card-header",21)(46,"div",22)(47,"h2",2),Bi(48,"MCP Servers"),xr(),fr(49,"p",12),Bi(50," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),xr()(),fr(51,"button",23),om("click",function(){return n.openAddMcpServerDialog()}),fr(52,"mat-icon",24),Bi(53,"add_circle"),xr()()(),fr(54,"mat-card-content"),od(55,mi,2,0,"div",25)(56,bi,3,0,"div",26),xr()()()),e&2&&(Fo(6),sd("formGroup",n.settingsForm),Fo(4),sd("selectedRendererId",n.selectedRendererId()),Fo(),id(n.isThirdParty()?11:-1),Fo(),sd("hidden",!n.is1PAuthEnabled),Fo(6),sd("checked",n.forceThirdPartyAuth()),Fo(2),id(n.isThirdParty()?20:-1),Fo(10),sd("color",n.bridgeConnected()?"primary":"accent"),Fo(),rb("Bridge: ",n.bridgeConnected()?"Connected":"Disconnected"),Fo(),sd("color",n.catalogStatus()==="Connected"?"primary":n.catalogStatus()==="Indexing"?"accent":n.catalogStatus()==="Error"?"warn":void 0),Fo(),rb("Catalog Handshake: ",n.catalogStatus()),Fo(5),id(n.activeRendererUrl()?38:-1),Fo(),id(n.catalogErrorMessage()?39:n.catalogStatus()==="Connected"?40:n.catalogStatus()==="Indexing"?41:n.bridgeConnected()?42:43),Fo(16),id(n.mcpManager.servers().length===0?55:56));},dependencies:[Oi,Ni,wi,Ri,Un,me,Vr,pL,fL,Wne,ci$1,li$1,E,F,k,z,T,S,j,ot,ki$1,ct$1,Et,Te,Yt$1,mt,eL,Ae,De],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto}.settings-container[_ngcontent-%COMP%]{padding:24px;max-width:600px;margin:0 auto}.form-section[_ngcontent-%COMP%]{margin-top:16px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-card[_ngcontent-%COMP%]{margin-top:24px}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-lowest);color:var(--mat-sys-primary);padding:12px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:700}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-small-size, 12px);padding-left:24px;padding-bottom:12px}.mcp-card-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mcp-card-header[_ngcontent-%COMP%]     .mat-mdc-card-header-text{display:none}.mcp-card-header[_ngcontent-%COMP%]   .mcp-header-text[_ngcontent-%COMP%]{flex:1;min-width:0}.mcp-card-header[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0;margin-top:-4px;margin-right:-8px}.mcp-empty-state[_ngcontent-%COMP%]{margin-top:16px;padding:16px;text-align:center;font-size:13px;font-style:italic;color:var(--mat-sys-on-surface-variant);border-radius:8px;border:1px dashed var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-lowest)}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:4px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{Ft as Settings};