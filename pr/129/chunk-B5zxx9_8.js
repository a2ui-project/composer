import {E,F,k,z,T,S,j}from'./chunk-D3dWL3dc.js';import {C,an as Nf,a7 as Bn,L as LB,u as uB,S as iZ,s as se,Z as Zu,ao as pv,cE as cB,y as yt,P as Pd,b as za,a0 as Ri,_ as Pze,l as ln,c as AL,k as kL,p as pie,ar as yL,f as wr,O as Oi,g as jr,j as jm,i as kd,Y as Yo,n as Od,r as Ad,W as Wb,t as Wr,cF as PB,z as zs,X,aq as f,v as he$1,aF as Rf,aA as zw,aB as fL,aC as hL,aD as gL,aE as mL,h as pR,ah as O3,V as Vm,ai as N3,R as Rt,B as kt,D as wo,E as ft,bK as nl,a9 as Wm,b0 as V,bb as Ji,bd as Ct,b1 as Kr,b2 as SL,bW as FR,be as li$1,bi as m$e,b4 as Jo,b5 as dn,G as Bu,I as ti$1,aP as r6,H as Hr,m as ei$1,a4 as Kb,cG as rd,bk as qR,cC as Rd,J as Jb,b7 as Md,M as Hm,U as Um,ax as GR,ay as WTe,bp as Ln,aI as K8,av as X8,aG as U8,aH as V8,cn as Dk,Q as bt,aJ as lk,aK as dk}from'./main.js';import {o as ot,k as ki$1,c as ct}from'./chunk-5o3p8P-c.js';import {Y as Yt,m as mt}from'./chunk-33Ol6d73.js';import {x as xi$1,v as vi$1,C as Ci$1,G}from'./chunk-DNum_L2L.js';import {m as me,D as Dn,n as nt,d as de,R as Rn,P as Pt}from'./chunk-UJBLXSUj.js';import {z as zi,Z as Zi,W as Wi,H as Hi,Q as Qi,X as Xn,D as Di,V as Vi,R as Re$1,I as It,G as Gi,f as Zn,T as T$1,i as ie}from'./chunk-px78dJKc.js';var $t=["*"],zt=(()=>{class n{labelPosition="after";static \u0275fac=function(i){return new(i||n)};static \u0275cmp=ln({type:n,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(i,r){i&2&&Hr("mdc-form-field--align-end",r.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:$t,decls:1,vars:0,template:function(i,r){i&1&&(Bu(),ti$1(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return n})();var qt=["switch"],Ht=["*"];function Wt(n,t){n&1&&(wr(0,"span",11),Dk(),wr(1,"svg",13),pR(2,"path",14),jr(),wr(3,"svg",15),pR(4,"path",16),jr()());}var Xt=new V("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Re=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Fe=(()=>{class n{_elementRef=C(ft);_focusMonitor=C(nl);_changeDetectorRef=C(Wm);defaults=C(Xt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Re(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Ji();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new Ct;toggleChange=new Ct;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){C(Kr).load(SL);let e=C(new FR("tabindex"),{optional:true}),i=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=i.color||"accent",this.id=this._uniqueId=C(li$1).getId("mat-mdc-slide-toggle-"),this.hideIcon=i.hideIcon??false,this.disabledInteractive=i.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Re(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=ln({type:n,selectors:[["mat-slide-toggle"]],viewQuery:function(i,r){if(i&1&&Md(qt,5),i&2){let l;Hm(l=Um())&&(r._switchElement=l.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(i,r){i&2&&(Rd("id",r.id),ei$1("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),Jb(r.color?"mat-"+r.color:""),Hr("mat-mdc-slide-toggle-focused",r._focused)("mat-mdc-slide-toggle-checked",r.checked)("_mat-animation-noopable",r._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",dn],color:"color",disabled:[2,"disabled","disabled",dn],disableRipple:[2,"disableRipple","disableRipple",dn],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:qR(e)],checked:[2,"checked","checked",dn],hideIcon:[2,"hideIcon","hideIcon",dn],disabledInteractive:[2,"disabledInteractive","disabledInteractive",dn]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[Kb([{provide:T$1,useExisting:rd(()=>n),multi:true},{provide:ie,useExisting:n,multi:true}]),Jo],ngContentSelectors:Ht,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(i,r){if(i&1&&(Bu(),wr(0,"div",1)(1,"button",2,0),jm("click",function(){return r._handleClick()}),pR(3,"div",3)(4,"span",4),wr(5,"span",5)(6,"span",6)(7,"span",7),pR(8,"span",8),jr(),wr(9,"span",9),pR(10,"span",10),jr(),kd(11,Wt,5,0,"span",11),jr()()(),wr(12,"label",12),jm("click",function(g){return g.stopPropagation()}),ti$1(13),jr()()),i&2){let l=r6(2);Od("labelPosition",r.labelPosition),Yo(),Hr("mdc-switch--selected",r.checked)("mdc-switch--unselected",!r.checked)("mdc-switch--checked",r.checked)("mdc-switch--disabled",r.disabled)("mat-mdc-slide-toggle-disabled-interactive",r.disabledInteractive),Od("tabIndex",r.disabled&&!r.disabledInteractive?-1:r.tabIndex)("disabled",r.disabled&&!r.disabledInteractive),ei$1("id",r.buttonId)("name",r.name)("aria-label",r.ariaLabel)("aria-labelledby",r._getAriaLabelledBy())("aria-describedby",r.ariaDescribedby)("aria-required",r.required||null)("aria-checked",r.checked)("aria-disabled",r.disabled&&r.disabledInteractive?"true":null),Yo(9),Od("matRippleTrigger",l)("matRippleDisabled",r.disableRipple||r.disabled)("matRippleCentered",true),Yo(),Ad(r.hideIcon?-1:11),Yo(),Od("for",r.buttonId),ei$1("id",r._labelId);}},dependencies:[m$e,zt],styles:[`.mdc-switch {
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
`],encapsulation:2})}return n})(),Ut=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=Rt({type:n});static \u0275inj=kt({imports:[Fe,wo]})}return n})();var P=class n{logger=C(Wr).withTag("[Settings]");startupResolution=C(LB);startupConfigState=C(uB);configProvider=C(Zu);secureCredentialsStorage=C(PB);localStorageInteractions=C(zs);usageTrackingService=C(X);renderers=Pd(()=>this.startupConfigState.renderers());selectedRendererId=Pd(()=>this.startupConfigState.selectedRendererId());activeRenderer=Pd(()=>this.startupConfigState.activeRenderer());async selectRenderer(t){let e=this.selectedRendererId();if(!await this.startupResolution.setSelectedRendererId(t))return  false;this.usageTrackingService.trackRendererSwitch({fromRendererId:e,toRendererId:t||""}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_renderer",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer");let r=this.activeRenderer();r?.rendererUrl?this.configProvider.setRendererUrl(r.rendererUrl):this.configProvider.setRendererUrl("");let l=typeof r?.apiKey=="string"?r.apiKey.trim():"";if(l)this.configProvider.setApiKeyFromConfig(l);else try{await this.syncEffectiveApiKeyToConfigProvider();}catch(g){this.logger.warn("Failed to resolve effective API key during renderer selection:",g);}return  true}_selectedApiKeyId=yt(this.localStorageInteractions.getItem("a2ui_composer_selected_api_key")||null);selectedApiKeyId=Pd(()=>{let t=this._selectedApiKeyId();return t||((this.startupConfigState.apiKeys()||{}).default!==void 0?"default":null)});_effectiveApiKey=yt("");effectiveApiKey=this._effectiveApiKey.asReadonly();getStaticApiKeys(){return this.startupConfigState.apiKeys()||{}}async getAvailableApiKeys(){let t=this.getStaticApiKeys(),e=Object.entries(t).map(([l,g])=>({id:l,name:g.displayName||l,key:g.apiKey||"",readOnly:true})),r=(await this.secureCredentialsStorage.getCustomApiKeys()).filter(l=>!Object.prototype.hasOwnProperty.call(t,l.id)).map(l=>({id:l.id,name:l.name,key:l.key,readOnly:false}));return [...e,...r]}async selectApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"select"}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_api_key",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_api_key"),this._selectedApiKeyId.set(t),await this.syncEffectiveApiKeyToConfigProvider();}async getEffectiveApiKey(){let t=this.selectedApiKeyId(),e=this.getStaticApiKeys();if(t&&e[t]){let l=e[t].apiKey||"";return this._effectiveApiKey.set(l),l}if(t){let l=await this.secureCredentialsStorage.getCustomApiKey(t);return l?(this._effectiveApiKey.set(l.key),l.key):(this._effectiveApiKey.set(""),"")}let i=await this.secureCredentialsStorage.getCustomApiKeys(),r=i.find(l=>l.id==="default")||i[0];if(r){let l=r.key;return this._effectiveApiKey.set(l),l}return this._effectiveApiKey.set(""),""}async saveCustomApiKey(t,e,i){let r=this.getStaticApiKeys();if(Object.prototype.hasOwnProperty.call(r,t))throw new Error(`Cannot save custom API key with ID "${t}": collides with a static configuration key.`);this.usageTrackingService.trackApiKeyUpdate({action:"add"}),await this.secureCredentialsStorage.saveCustomApiKey(t,e,i),await this.syncEffectiveApiKeyToConfigProvider();}async deleteCustomApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"delete"}),await this.secureCredentialsStorage.deleteCustomApiKey(t),this._selectedApiKeyId()===t?await this.selectApiKey(null):await this.syncEffectiveApiKeyToConfigProvider();}async syncEffectiveApiKeyToConfigProvider(){let t=await this.getEffectiveApiKey(),e=this._selectedApiKeyId(),i=this.getStaticApiKeys();return e&&i[e]?this.configProvider.setApiKeyFromConfig(t):!e&&i.default?this.configProvider.setApiKeyFromConfig(t):this.configProvider.setRuntimeApiKey(t),t}getStaticRenderersMap(){return this.startupConfigState.renderers()||{}}getCustomRenderers(){let t=this.localStorageInteractions.getItem("a2ui_composer_custom_renderers");if(!t)return [];try{let e=JSON.parse(t);return Array.isArray(e)?e.filter(i=>i&&typeof i=="object"&&!!String(i.id||"").trim()).map(i=>({id:String(i?.id||"").trim(),name:String(i?.name||""),rendererUrl:String(i?.rendererUrl||"")})):[]}catch(e){return this.logger.warn("Failed to parse custom renderers from LocalStorage:",e),[]}}getRenderers(){let t=this.getStaticRenderersMap(),e=Object.entries(t).map(([l,g])=>({id:l,name:g?.displayName||g?.name||l,rendererUrl:g?.rendererUrl||"",readOnly:true})),i=new Set(e.map(l=>l.name)),r=this.getCustomRenderers().filter(l=>!Object.prototype.hasOwnProperty.call(t,l.id)).map(l=>({id:l.id,name:i.has(l.name)?`${l.name} (local)`:l.name,rendererUrl:l.rendererUrl,readOnly:false}));return [...e,...r]}saveCustomRenderer(t){let e=(t.id||"").trim(),i=(t.name||"").trim(),r=(t.rendererUrl||"").trim();if(!e||!i||!r)throw new Error("Custom renderer id, name, and rendererUrl must not be empty.");if(!/^https?:\/\//i.test(r))throw new Error("Custom renderer URL must start with http:// or https://");let l=this.getStaticRenderersMap();if(Object.prototype.hasOwnProperty.call(l,e))throw new Error(`Cannot save custom renderer with ID "${e}": collides with a static configuration renderer.`);let g=this.getCustomRenderers(),Le=g.findIndex(jt=>jt.id===e);Le>=0?(g[Le]={id:e,name:i,rendererUrl:r},this.usageTrackingService.trackRendererEdit({rendererId:e})):(g.push({id:e,name:i,rendererUrl:r}),this.usageTrackingService.trackRendererAdd({rendererId:e})),this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(g));let Ve=f({},this.startupConfigState.renderers());Ve[e]={id:e,name:i,rendererUrl:r},this.startupConfigState.setRenderers(Ve);}deleteCustomRenderer(t){this.usageTrackingService.trackRendererDelete({rendererId:t});let e=this.getCustomRenderers().filter(r=>r.id!==t);this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(e));let i=f({},this.startupConfigState.renderers());delete i[t],this.startupConfigState.setRenderers(i),this.selectedRendererId()===t&&(this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer"),this.selectRenderer(null));}static \u0275fac=function(e){return new(e||n)};static \u0275prov=he$1({token:n,factory:n.\u0275fac,providedIn:"root"})};function Qt(n,t){if(n&1&&(wr(0,"div",5),Oi(1),jr()),n&2){let e=X8();Yo(),Vm(e.errorMessage());}}function ze(n){let t=n.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var pe=class n{fb=C(zi);settingsService=C(P);dialogRef=C(Rf);data=C(zw,{optional:true});errorMessage=yt(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[Re$1.required,Re$1.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[Re$1.required,ze]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),i=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:i,name:t,rendererUrl:e}),this.dialogRef.close(i);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=ln({type:n,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","formControlName","name","placeholder","My Renderer"],["matInput","","id","renderer-url-input","formControlName","rendererUrl","placeholder","http://localhost:3000"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(wr(0,"h2",0),Oi(1),jr(),wr(2,"mat-dialog-content")(3,"form",1),jm("ngSubmit",function(l){return l.preventDefault(),i.onConfirm()}),wr(4,"mat-form-field",2)(5,"mat-label"),Oi(6,"Name"),jr(),pR(7,"input",3),O3(),jr(),wr(8,"mat-form-field",2)(9,"mat-label"),Oi(10,"Renderer URL"),jr(),pR(11,"input",4),O3(),jr(),kd(12,Qt,2,1,"div",5),jr()(),wr(13,"mat-dialog-actions",6)(14,"button",7),Oi(15,"Cancel"),jr(),wr(16,"button",8),jm("click",function(){return i.onConfirm()}),Oi(17),jr()()),e&2&&(Yo(),Vm(i.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),Yo(2),Od("formGroup",i.form),Yo(4),N3(),Yo(4),N3(),Yo(),Ad(i.errorMessage()?12:-1),Yo(4),Od("disabled",i.form.invalid),Yo(),Wb(" ",i.data?.renderer?"Save":"Add"," "));},dependencies:[Qi,Wi,It,Gi,Hi,Xn,Zn,yL,fL,hL,gL,mL,me,nt,de,Dn,Rn,AL,kL],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ce=class n{disabled=GR(false);dialog=C(Nf);destroyRef=C(Bn);items=yt([]);selectedItem=Pd(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(Pze(this.destroyRef)).subscribe(async r=>{r&&(await this.refreshItems(),this.emitSelection(r));});}async handleEdit(t,e,i,r){if(e.stopPropagation(),e.preventDefault(),i.readOnly)return;this.dialog.open(t,{width:"450px",data:{[r]:i}}).afterClosed().pipe(Pze(this.destroyRef)).subscribe(async g=>{g&&(await this.refreshItems(),this.getSelectedId()===g&&this.emitSelection(g));});}async handleDelete(t,e,i=null){t.stopPropagation(),t.preventDefault(),!this.items().find(l=>l.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(i));}static \u0275fac=function(e){return new(e||n)};static \u0275dir=bt({type:n,inputs:{disabled:[1,"disabled"]}})};var Zt=(n,t)=>t.id;function ei(n,t){if(n&1&&(wr(0,"span",5),Oi(1),jr()),n&2){let e=X8();Yo(),Vm(e.selectedItem()?.rendererUrl);}}function ti(n,t){n&1&&(wr(0,"mat-option",6),Oi(1,"No items available \u2014 click + to add"),jr()),n&2&&Od("disabled",true);}function ii(n,t){if(n&1){let e=K8();wr(0,"mat-option",8)(1,"div",9)(2,"div",10),Oi(3),jr(),wr(4,"div",5),Oi(5),jr()(),wr(6,"button",11),jm("click",function(r){let l=lk(e).$implicit,g=X8(2);return dk(g.onEditRenderer(r,l))})("keydown",function(r){return r.stopPropagation()}),wr(7,"mat-icon",12),Oi(8,"edit"),jr()(),wr(9,"button",13),jm("click",function(r){let l=lk(e).$implicit,g=X8(2);return dk(g.onDeleteRenderer(r,l.id))})("keydown",function(r){return r.stopPropagation()}),wr(10,"mat-icon",12),Oi(11,"delete"),jr()()();}if(n&2){let e=t.$implicit;Od("value",e.id),Yo(3),Vm(e.name),Yo(2),Vm(e.rendererUrl),Yo(),Od("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),ei$1("aria-label","Edit "+e.name),Yo(3),Od("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),ei$1("aria-label","Delete "+e.name);}}function ni(n,t){if(n&1&&U8(0,ii,12,9,"mat-option",8,Zt),n&2){let e=X8();V8(e.items());}}var De=class n extends ce{selectedRendererId=GR("default");rendererSelected=WTe();settingsService=C(P);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(pe,t);}onEditRenderer(t,e){this.handleEdit(pe,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=ln({type:n,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[Ln],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,i){e&1&&(wr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Oi(3,"Renderer"),jr(),wr(4,"mat-select",2),jm("selectionChange",function(l){return i.onSelectionChange(l.value)}),wr(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Oi(8),jr(),kd(9,ei,2,1,"span",5),jr()(),kd(10,ti,2,1,"mat-option",6)(11,ni,2,0),jr()(),wr(12,"button",7),jm("click",function(l){return i.onAddRenderer(l)}),wr(13,"mat-icon"),Oi(14,"add_circle"),jr()()()),e&2&&(Yo(4),Od("value",i.selectedRendererId())("disabled",i.disabled()),Yo(4),Vm(i.selectedItem()?.name),Yo(),Ad(i.selectedItem()?.rendererUrl?9:-1),Yo(),Ad(i.items().length===0?10:11),Yo(2),Od("disabled",i.disabled()));},dependencies:[me,nt,de,xi$1,vi$1,Ci$1,G,AL,pie,Di,Vi,Yt,mt,yL],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-option-supporting-text-color, #666);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function ri(n,t){if(n&1&&(wr(0,"div",7),Oi(1),jr()),n&2){let e=X8();Yo(),Vm(e.errorMessage());}}var he=class n{fb=C(zi);settingsService=C(P);dialogRef=C(Rf);data=C(zw,{optional:true});errorMessage=yt(null);hideApiKey=yt(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[Re$1.required,Re$1.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[Re$1.required,Re$1.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),i=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(i,t,e),this.dialogRef.close(i);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=ln({type:n,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","formControlName","name","placeholder","My Gemini Key"],["matInput","","id","api-key-value-input","formControlName","apiKey","placeholder","Paste your API key here",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(wr(0,"h2",0),Oi(1),jr(),wr(2,"mat-dialog-content")(3,"form",1),jm("ngSubmit",function(l){return l.preventDefault(),i.onConfirm()}),wr(4,"mat-form-field",2)(5,"mat-label"),Oi(6,"Name"),jr(),pR(7,"input",3),O3(),jr(),wr(8,"mat-form-field",2)(9,"mat-label"),Oi(10,"API Key"),jr(),pR(11,"input",4),O3(),wr(12,"button",5),jm("click",function(){return i.toggleHideApiKey()}),wr(13,"mat-icon",6),Oi(14),jr()()(),kd(15,ri,2,1,"div",7),jr()(),wr(16,"mat-dialog-actions",8)(17,"button",9),Oi(18,"Cancel"),jr(),wr(19,"button",10),jm("click",function(){return i.onConfirm()}),Oi(20),jr()()),e&2&&(Yo(),Vm(i.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),Yo(2),Od("formGroup",i.form),Yo(4),N3(),Yo(4),Od("type",i.hideApiKey()?"password":"text"),N3(),Yo(),ei$1("aria-label",i.hideApiKey()?"Show API key":"Hide API key"),Yo(2),Vm(i.hideApiKey()?"visibility":"visibility_off"),Yo(),Ad(i.errorMessage()?15:-1),Yo(4),Od("disabled",i.form.invalid),Yo(),Wb(" ",i.data?.apiKey?"Save":"Add"," "));},dependencies:[Qi,Wi,It,Gi,Hi,Xn,Zn,yL,fL,hL,gL,mL,me,nt,de,Pt,Dn,Rn,AL,kL,pie,Di,Vi],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ai=(n,t)=>t.id;function oi(n,t){n&1&&(wr(0,"mat-option",3),Oi(1,"No items available \u2014 click + to add"),jr()),n&2&&Od("disabled",true);}function li(n,t){if(n&1){let e=K8();wr(0,"mat-option",5)(1,"span",6),Oi(2),jr(),wr(3,"button",7),jm("keydown",function(r){return r.stopPropagation()})("click",function(r){let l=lk(e).$implicit,g=X8(2);return dk(g.onEditApiKey(r,l))}),wr(4,"mat-icon",8),Oi(5,"edit"),jr()(),wr(6,"button",9),jm("keydown",function(r){return r.stopPropagation()})("click",function(r){let l=lk(e).$implicit,g=X8(2);return dk(g.onDeleteApiKey(r,l.id))}),wr(7,"mat-icon",8),Oi(8,"delete"),jr()()();}if(n&2){let e=t.$implicit;Od("value",e.id),Yo(2),Vm(e.name),Yo(),Od("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),ei$1("aria-label","Edit "+e.name),Yo(3),Od("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),ei$1("aria-label","Delete "+e.name);}}function di(n,t){if(n&1&&U8(0,li,9,8,"mat-option",5,ai),n&2){let e=X8();V8(e.items());}}var Te=class n extends ce{selectedApiKeyId=GR(null);apiKeySelected=WTe();settingsService=C(P);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(he,t);}onEditApiKey(t,e){this.handleEdit(he,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=ln({type:n,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[Ln],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,i){e&1&&(wr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Oi(3,"API Key"),jr(),wr(4,"mat-select",2),jm("selectionChange",function(l){return i.onSelectionChange(l.value)}),wr(5,"mat-select-trigger"),Oi(6),jr(),kd(7,oi,2,1,"mat-option",3)(8,di,2,0),jr()(),wr(9,"button",4),jm("click",function(l){return i.onAddApiKey(l)}),wr(10,"mat-icon"),Oi(11,"add_circle"),jr()()()),e&2&&(Yo(4),Od("value",i.selectedApiKeyId())("disabled",i.disabled()),Yo(2),Wb(" ",i.selectedItem()?.name," "),Yo(),Ad(i.items().length===0?7:8),Yo(2),Od("disabled",i.disabled()));},dependencies:[me,nt,de,xi$1,vi$1,Ci$1,G,AL,pie,Di,Vi,Yt,mt,yL],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function si(n,t){if(n&1&&(wr(0,"div",4),Oi(1),jr()),n&2){let e=X8();Yo(),Vm(e.errorMessage());}}var fe=class n{fb=C(zi);dialogRef=C(Rf);data=C(zw,{optional:true});errorMessage=yt(null);form=this.fb.group({url:[this.data?.server?.url??"",[Re$1.required,ze]]});onConfirm(){this.errorMessage.set(null);let t=this.form.controls.url.value.trim();this.dialogRef.close({url:t});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=ln({type:n,selectors:[["a2ui-composer-mcp-server-dialog"]],decls:14,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","mcp-server-url-input","formControlName","url","placeholder","http://localhost:3001/mcp"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","button","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(wr(0,"h2",0),Oi(1),jr(),wr(2,"mat-dialog-content")(3,"form",1),jm("ngSubmit",function(l){return l.preventDefault(),i.onConfirm()}),wr(4,"mat-form-field",2)(5,"mat-label"),Oi(6,"Server URL"),jr(),pR(7,"input",3),O3(),jr(),kd(8,si,2,1,"div",4),jr()(),wr(9,"mat-dialog-actions",5)(10,"button",6),Oi(11,"Cancel"),jr(),wr(12,"button",7),jm("click",function(){return i.onConfirm()}),Oi(13),jr()()),e&2&&(Yo(),Vm(i.data?.server?"Edit MCP Server":"Add MCP Server"),Yo(2),Od("formGroup",i.form),Yo(4),N3(),Yo(),Ad(i.errorMessage()?8:-1),Yo(4),Od("disabled",i.form.invalid),Yo(),Wb(" ",i.data?.server?"Save":"Add"," "));},dependencies:[Qi,Wi,It,Gi,Hi,Xn,Zn,yL,fL,hL,gL,mL,me,nt,de,Dn,Rn,AL,kL],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ci=(n,t)=>t.id,mi=(n,t)=>t.name;function pi(n,t){if(n&1){let e=K8();wr(0,"div",4)(1,"h3"),Oi(2,"Gemini API Provisioning"),jr(),wr(3,"a2ui-composer-api-key-selector",27),jm("apiKeySelected",function(r){lk(e);let l=X8();return dk(l.onApiKeySelected(r))}),jr()();}if(n&2){let e=X8();Yo(3),Od("selectedApiKeyId",e.selectedApiKeyId());}}function gi(n,t){n&1&&(wr(0,"mat-card-footer",10),Oi(1," To obtain an API key: "),wr(2,"ol")(3,"li"),Oi(4," Go to "),wr(5,"a",28),Oi(6," Google AI Studio"),jr(),Oi(7," and sign in with your Google account. "),jr(),wr(8,"li"),Oi(9,"Click Create API key."),jr(),wr(10,"li"),Oi(11,"Select or create a Google Cloud project when prompted, then click Create key."),jr(),wr(12,"li"),Oi(13,"Save your key in a secure location!"),jr()(),Oi(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),wr(15,"a",29),Oi(16,"Web Crypto API"),jr(),Oi(17,". Neither Google nor anyone else has access to this key. "),jr());}function ui(n,t){if(n&1&&(wr(0,"code"),Oi(1),jr()),n&2){let e=X8();Yo(),Wb("[System] Active renderer updated to ",e.activeRendererUrl());}}function hi(n,t){if(n&1&&(wr(0,"code",18),Oi(1),jr()),n&2){let e=X8();Yo(),Wb("[Catalog Error] ",e.catalogErrorMessage());}}function fi(n,t){n&1&&(wr(0,"code",19),Oi(1,"[System] Catalog handshake completed successfully. Active catalog ready."),jr());}function yi(n,t){n&1&&(wr(0,"code"),Oi(1,"[System] Catalog handshake in progress. Indexing metadata..."),jr());}function vi(n,t){n&1&&(wr(0,"code"),Oi(1,"[System] Bridge connected. Initializing catalog handshake..."),jr());}function _i(n,t){n&1&&(wr(0,"code"),Oi(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),jr());}function bi(n,t){n&1&&(wr(0,"div",25),Oi(1,"No MCP servers configured \u2014 click + to add"),jr());}function Ci(n,t){if(n&1&&Oi(0),n&2){let e=X8().$implicit;Wb(" Connected (",e.tools?.length||0," tools) ");}}function wi(n,t){n&1&&Oi(0," Connecting... ");}function Si(n,t){if(n&1&&Oi(0),n&2){let e=X8().$implicit;Wb(" Error: ",e.errorMessage||"Failed to connect"," ");}}function Mi(n,t){n&1&&Oi(0," Disconnected ");}function xi(n,t){if(n&1&&(wr(0,"span",38),Oi(1),jr()),n&2){let e=X8().$implicit;Yo(),Vm(e.url);}}function ki(n,t){if(n&1&&(wr(0,"span",44),Oi(1),jr()),n&2){let e=t.$implicit;Yo(),Vm(e.name);}}function Ai(n,t){if(n&1&&(wr(0,"div",43),U8(1,ki,2,1,"span",44,mi),jr()),n&2){let e=X8().$implicit;Yo(),V8(e.tools);}}function Ii(n,t){if(n&1){let e=K8();wr(0,"div",30)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),jm("change",function(r){let l=lk(e).$implicit,g=X8(2);return dk(g.toggleMcpServer(l.id,r.checked))}),jr(),wr(4,"div",34)(5,"div",35)(6,"span",36),Oi(7),jr(),wr(8,"span",37),kd(9,Ci,1,1)(10,wi,1,0)(11,Si,1,1)(12,Mi,1,0),jr()(),kd(13,xi,2,1,"span",38),jr()(),wr(14,"div",39)(15,"button",40),jm("click",function(){let r=lk(e).$implicit,l=X8(2);return dk(l.testMcpServer(r.id))}),Oi(16," Test "),jr(),wr(17,"button",41),jm("click",function(){let r=lk(e).$implicit,l=X8(2);return dk(l.openEditMcpServerDialog(r))}),wr(18,"mat-icon",24),Oi(19,"edit"),jr()(),wr(20,"button",42),jm("click",function(){let r=lk(e).$implicit,l=X8(2);return dk(l.removeMcpServer(r.id))}),wr(21,"mat-icon",24),Oi(22,"delete"),jr()()()(),kd(23,Ai,3,0,"div",43),jr();}if(n&2){let e=t.$implicit;Yo(3),Od("checked",e.enabled),ei$1("aria-label","Toggle "+(e.name||e.url)),Yo(4),Vm(e.name||e.url),Yo(),ei$1("data-status",e.status),Yo(),Ad(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),Yo(4),Ad(e.name&&e.name!==e.url?13:-1),Yo(10),Ad(e.tools&&e.tools.length>0?23:-1);}}function Pi(n,t){if(n&1&&(wr(0,"div",26),U8(1,Ii,24,7,"div",30,ci),jr()),n&2){let e=X8();Yo(),V8(e.mcpManager.servers());}}var Gt=class n{fb=C(zi);dialog=C(Nf);destroyRef=C(Bn);startupResolution=C(LB);startupConfigState=C(uB);hostCommunication=C(iZ);catalogManagement=C(se);configProvider=C(Zu);settingsService=C(P);mcpManager=C(pv);is1PAuthEnabled=C(cB);selectedRendererId=yt(null);selectedApiKeyId=Pd(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=Pd(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=yt(false);isApiKeyProvidedByConfig=Pd(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=Pd(()=>this.isApiKeyProvidedByConfig());hideApiKey=yt(true);forceThirdPartyAuth=yt(false);bridgeConnected=Pd(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=Pd(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=Pd(()=>this.catalogManagement.catalogError());activeRendererUrl=Pd(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){za(()=>{let t=this.settingsService.selectedRendererId()||"default";Ri(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}openAddMcpServerDialog(){this.dialog.open(fe,{width:"450px"}).afterClosed().pipe(Pze(this.destroyRef)).subscribe(e=>{e?.url&&this.mcpManager.addServer(e.url);});}openEditMcpServerDialog(t){this.dialog.open(fe,{width:"450px",data:{server:t}}).afterClosed().pipe(Pze(this.destroyRef)).subscribe(i=>{i?.url&&this.mcpManager.updateServerUrl(t.id,i.url);});}async removeMcpServer(t){await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=ln({type:n,selectors:[["a2ui-composer-settings"]],decls:57,vars:13,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-card-header"],[1,"mcp-header-text"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click"],["aria-hidden","true"],[1,"mcp-empty-state"],[1,"mcp-server-list"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-item"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit MCP Server","aria-label","Edit MCP Server",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete MCP Server","aria-label","Delete MCP Server",1,"mcp-delete-btn",3,"click"],[1,"mcp-server-tools"],[1,"mcp-tool-name"]],template:function(e,i){e&1&&(wr(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Oi(4,"A2UI Composer Settings"),jr()(),wr(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Oi(9,"Renderer"),jr(),wr(10,"a2ui-composer-renderer-selector",5),jm("rendererSelected",function(l){return i.onRendererSelected(l)}),jr()(),kd(11,pi,4,1,"div",4),wr(12,"div",6)(13,"h3"),Oi(14,"Developer Authentication Overrides"),jr(),wr(15,"p",7),Oi(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),jr(),wr(17,"div",8)(18,"mat-slide-toggle",9),jm("change",function(){return i.toggleForceThirdPartyAuth()}),Oi(19," Force External Third-Party Authentication Mode "),jr()()()()(),kd(20,gi,18,0,"mat-card-footer",10),jr(),wr(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Oi(24,"Connection Status & Diagnostics"),jr(),wr(25,"p",12),Oi(26,"Real-time monitoring bridge"),jr()(),wr(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Oi(31),jr(),wr(32,"mat-chip",15),Oi(33),jr()()(),wr(34,"div",16)(35,"h3"),Oi(36,"Overlay Logs Preview"),jr(),wr(37,"div",17),kd(38,ui,2,1,"code"),kd(39,hi,2,1,"code",18)(40,fi,2,0,"code",19)(41,yi,2,0,"code")(42,vi,2,0,"code")(43,_i,2,0,"code"),jr()()()(),wr(44,"mat-card",20)(45,"mat-card-header",21)(46,"div",22)(47,"h2",2),Oi(48,"MCP Servers"),jr(),wr(49,"p",12),Oi(50," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),jr()(),wr(51,"button",23),jm("click",function(){return i.openAddMcpServerDialog()}),wr(52,"mat-icon",24),Oi(53,"add_circle"),jr()()(),wr(54,"mat-card-content"),kd(55,bi,2,0,"div",25)(56,Pi,3,0,"div",26),jr()()()),e&2&&(Yo(6),Od("formGroup",i.settingsForm),Yo(4),Od("selectedRendererId",i.selectedRendererId()),Yo(),Ad(i.isThirdParty()?11:-1),Yo(),Od("hidden",!i.is1PAuthEnabled),Yo(6),Od("checked",i.forceThirdPartyAuth()),Yo(2),Ad(i.isThirdParty()?20:-1),Yo(10),Od("color",i.bridgeConnected()?"primary":"accent"),Yo(),Wb("Bridge: ",i.bridgeConnected()?"Connected":"Disconnected"),Yo(),Od("color",i.catalogStatus()==="Connected"?"primary":i.catalogStatus()==="Indexing"?"accent":i.catalogStatus()==="Error"?"warn":void 0),Yo(),Wb("Catalog Handshake: ",i.catalogStatus()),Yo(5),Ad(i.activeRendererUrl()?38:-1),Yo(),Ad(i.catalogErrorMessage()?39:i.catalogStatus()==="Connected"?40:i.catalogStatus()==="Indexing"?41:i.bridgeConnected()?42:43),Yo(16),Ad(i.mcpManager.servers().length===0?55:56));},dependencies:[Zi,Wi,Hi,Qi,Xn,me,Dn,AL,kL,pie,Di,Vi,E,F,k,z,T,S,j,ot,ki$1,ct,Ut,Fe,Yt,mt,yL,De,Te],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto}.settings-container[_ngcontent-%COMP%]{padding:24px;max-width:600px;margin:0 auto}.form-section[_ngcontent-%COMP%]{margin-top:16px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-card[_ngcontent-%COMP%]{margin-top:24px}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-lowest);color:var(--mat-sys-primary);padding:12px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:700}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-small-size, 12px);padding-left:24px;padding-bottom:12px}.mcp-card-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mcp-card-header[_ngcontent-%COMP%]     .mat-mdc-card-header-text{display:none}.mcp-card-header[_ngcontent-%COMP%]   .mcp-header-text[_ngcontent-%COMP%]{flex:1;min-width:0}.mcp-card-header[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0;margin-top:-4px;margin-right:-8px}.mcp-empty-state[_ngcontent-%COMP%]{margin-top:16px;padding:16px;text-align:center;font-size:13px;font-style:italic;color:var(--mat-sys-on-surface-variant);border-radius:8px;border:1px dashed var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-lowest)}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:4px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{Gt as Settings};