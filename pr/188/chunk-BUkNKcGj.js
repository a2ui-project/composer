import {E,F,k,z,T,S as S$1,j}from'./chunk-CBYyQeA-.js';import {f,$ as $c,h as hc,I as m_,a as fe,b as fo,cd as fc,q,C as Ci,s as sr,X as Gt,e as de,L as Lb,A as Ae$1,W as Wt,H as He,i as qa,v as vi,j as wt,_ as _i,p as bi,m as mf,ce as Rc,c as co,n as ne,an as _,T as T$1,Q as Q$1,Y as Y$1,t as st,U,bn as Bi,a8 as tc,aU as y,aV as Zt$1,bq as W$1,bB as We,bC as Rb,bL as gv,b7 as Mt,cf as LG,bS as _t,bF as ue,x as io,K as Ky,y as Tt,aK as rS,k as $e,S as St,a3 as gf,cg as Ho,c4 as Sv,ca as Ei,z as pf,ba as wi$1,D as Ya,E as Ka,at as Cv,au as KU,o as ox,ao as h_,b9 as De,Z as Za,aB as ZI,as as JI,c5 as um,al as Xi,a6 as pe,P as oq,G as K$1,ch as Zi,aw as Ih,ax as a_,ay as l_,az as u_,aA as d_,F as Fb,af as NC,ag as kC,aG as $I,aI as zI,aC as Qp,aD as Jp}from'./main.js';import {w as wi,E as Et,a as Ci$1,C as Cn,y as yn,b as bn,r as re}from'./chunk-B2r722KH.js';import {Y as Yt$1,m as mt}from'./chunk-CMiWkbLd.js';import {m as me,D as Dn,n as nt,d as de$1,R as Rn,P as Pt$1}from'./chunk-CSdnALUK.js';import'./chunk-B50MQtp_.js';import {O as Oi,b as Ri,N as Ni,I as Ii,U as Un,l as li$1,T as Te,K,a as ai$1,w as we,E as Et$1,F as Fi,k as kn}from'./chunk-OG-uUnTI.js';var Ft=["*"],Pt=(()=>{class r{labelPosition="after";static \u0275fac=function(i){return new(i||r)};static \u0275cmp=de({type:r,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(i,n){i&2&&$e("mdc-form-field--align-end",n.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Ft,decls:1,vars:0,template:function(i,n){i&1&&(io(),Tt(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return r})();var zt=["switch"],Ut=["*"];function Lt(r,t){r&1&&(Ae$1(0,"span",11),um(),Ae$1(1,"svg",13),Ky(2,"path",14),He(),Ae$1(3,"svg",15),Ky(4,"path",16),He()());}var Vt=new y("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),ke=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Pe=(()=>{class r{_elementRef=f(U);_focusMonitor=f(Bi);_changeDetectorRef=f(tc);defaults=f(Vt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new ke(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Zt$1();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new W$1;toggleChange=new W$1;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){f(We).load(Rb);let e=f(new gv("tabindex"),{optional:true}),i=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=i.color||"accent",this.id=this._uniqueId=f(Mt).getId("mat-mdc-slide-toggle-"),this.hideIcon=i.hideIcon??false,this.disabledInteractive=i.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new ke(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(i){return new(i||r)};static \u0275cmp=de({type:r,selectors:[["mat-slide-toggle"]],viewQuery:function(i,n){if(i&1&&wi$1(zt,5),i&2){let d;Ya(d=Ka())&&(n._switchElement=d.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(i,n){i&2&&(Ei("id",n.id),St("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),pf(n.color?"mat-"+n.color:""),$e("mat-mdc-slide-toggle-focused",n._focused)("mat-mdc-slide-toggle-checked",n.checked)("_mat-animation-noopable",n._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",ue],color:"color",disabled:[2,"disabled","disabled",ue],disableRipple:[2,"disableRipple","disableRipple",ue],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:Sv(e)],checked:[2,"checked","checked",ue],hideIcon:[2,"hideIcon","hideIcon",ue],disabledInteractive:[2,"disabledInteractive","disabledInteractive",ue]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[gf([{provide:Te,useExisting:Ho(()=>r),multi:true},{provide:K,useExisting:r,multi:true}]),_t],ngContentSelectors:Ut,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(i,n){if(i&1&&(io(),Ae$1(0,"div",1)(1,"button",2,0),qa("click",function(){return n._handleClick()}),Ky(3,"div",3)(4,"span",4),Ae$1(5,"span",5)(6,"span",6)(7,"span",7),Ky(8,"span",8),He(),Ae$1(9,"span",9),Ky(10,"span",10),He(),vi(11,Lt,5,0,"span",11),He()()(),Ae$1(12,"label",12),qa("click",function(p){return p.stopPropagation()}),Tt(13),He()()),i&2){let d=rS(2);_i("labelPosition",n.labelPosition),wt(),$e("mdc-switch--selected",n.checked)("mdc-switch--unselected",!n.checked)("mdc-switch--checked",n.checked)("mdc-switch--disabled",n.disabled)("mat-mdc-slide-toggle-disabled-interactive",n.disabledInteractive),_i("tabIndex",n.disabled&&!n.disabledInteractive?-1:n.tabIndex)("disabled",n.disabled&&!n.disabledInteractive),St("id",n.buttonId)("name",n.name)("aria-label",n.ariaLabel)("aria-labelledby",n._getAriaLabelledBy())("aria-describedby",n.ariaDescribedby)("aria-required",n.required||null)("aria-checked",n.checked)("aria-disabled",n.disabled&&n.disabledInteractive?"true":null),wt(9),_i("matRippleTrigger",d)("matRippleDisabled",n.disableRipple||n.disabled)("matRippleCentered",true),wt(),bi(n.hideIcon?-1:11),wt(),_i("for",n.buttonId),St("id",n._labelId);}},dependencies:[LG,Pt],styles:[`.mdc-switch {
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
`],encapsulation:2})}return r})(),Kt=(()=>{class r{static \u0275fac=function(i){return new(i||r)};static \u0275mod=Q$1({type:r});static \u0275inj=Y$1({imports:[Pe,st]})}return r})();var S=class r{startupResolution=f($c);startupConfigState=f(hc);configProvider=f(fo);secureCredentialsStorage=f(Rc);localStorageInteractions=f(co);usageTrackingService=f(ne);renderers=Ci(()=>this.startupConfigState.renderers());selectedRendererId=Ci(()=>this.startupConfigState.selectedRendererId());activeRenderer=Ci(()=>this.startupConfigState.activeRenderer());async selectRenderer(t){let e=this.selectedRendererId();if(!await this.startupResolution.setSelectedRendererId(t))return  false;this.usageTrackingService.trackRendererSwitch({fromRendererId:e,toRendererId:t||""}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_renderer",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer");let n=this.activeRenderer();n?.rendererUrl?this.configProvider.setRendererUrl(n.rendererUrl):this.configProvider.setRendererUrl("");let d=typeof n?.apiKey=="string"?n.apiKey.trim():"";if(d)this.configProvider.setApiKeyFromConfig(d);else try{await this.syncEffectiveApiKeyToConfigProvider();}catch(p){console.warn("Failed to resolve effective API key during renderer selection:",p);}return  true}_selectedApiKeyId=q(this.localStorageInteractions.getItem("a2ui_composer_selected_api_key")||null);selectedApiKeyId=Ci(()=>{let t=this._selectedApiKeyId();return t||((this.startupConfigState.apiKeys()||{}).default!==void 0?"default":null)});_effectiveApiKey=q("");effectiveApiKey=this._effectiveApiKey.asReadonly();getStaticApiKeys(){return this.startupConfigState.apiKeys()||{}}async getAvailableApiKeys(){let t=this.getStaticApiKeys(),e=Object.entries(t).map(([d,p])=>({id:d,name:p.displayName||d,key:p.apiKey||"",readOnly:true})),n=(await this.secureCredentialsStorage.getCustomApiKeys()).filter(d=>!Object.prototype.hasOwnProperty.call(t,d.id)).map(d=>({id:d.id,name:d.name,key:d.key,readOnly:false}));return [...e,...n]}async selectApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"select"}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_api_key",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_api_key"),this._selectedApiKeyId.set(t),await this.syncEffectiveApiKeyToConfigProvider();}async getEffectiveApiKey(){let t=this.selectedApiKeyId(),e=this.getStaticApiKeys();if(t&&e[t]){let d=e[t].apiKey||"";return this._effectiveApiKey.set(d),d}if(t){let d=await this.secureCredentialsStorage.getCustomApiKey(t);return d?(this._effectiveApiKey.set(d.key),d.key):(this._effectiveApiKey.set(""),"")}let i=await this.secureCredentialsStorage.getCustomApiKeys(),n=i.find(d=>d.id==="default")||i[0];if(n){let d=n.key;return this._effectiveApiKey.set(d),d}return this._effectiveApiKey.set(""),""}async saveCustomApiKey(t,e,i){let n=this.getStaticApiKeys();if(Object.prototype.hasOwnProperty.call(n,t))throw new Error(`Cannot save custom API key with ID "${t}": collides with a static configuration key.`);this.usageTrackingService.trackApiKeyUpdate({action:"add"}),await this.secureCredentialsStorage.saveCustomApiKey(t,e,i),await this.syncEffectiveApiKeyToConfigProvider();}async deleteCustomApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"delete"}),await this.secureCredentialsStorage.deleteCustomApiKey(t),this._selectedApiKeyId()===t?await this.selectApiKey(null):await this.syncEffectiveApiKeyToConfigProvider();}async syncEffectiveApiKeyToConfigProvider(){let t=await this.getEffectiveApiKey(),e=this._selectedApiKeyId(),i=this.getStaticApiKeys();return e&&i[e]?this.configProvider.setApiKeyFromConfig(t):!e&&i.default?this.configProvider.setApiKeyFromConfig(t):this.configProvider.setRuntimeApiKey(t),t}getStaticRenderersMap(){return this.startupConfigState.renderers()||{}}getCustomRenderers(){let t=this.localStorageInteractions.getItem("a2ui_composer_custom_renderers");if(!t)return [];try{let e=JSON.parse(t);return Array.isArray(e)?e.filter(i=>i&&typeof i=="object"&&!!String(i.id||"").trim()).map(i=>({id:String(i?.id||"").trim(),name:String(i?.name||""),rendererUrl:String(i?.rendererUrl||"")})):[]}catch(e){return console.warn("Failed to parse custom renderers from LocalStorage:",e),[]}}getRenderers(){let t=this.getStaticRenderersMap(),e=Object.entries(t).map(([d,p])=>({id:d,name:p?.displayName||p?.name||d,rendererUrl:p?.rendererUrl||"",readOnly:true})),i=new Set(e.map(d=>d.name)),n=this.getCustomRenderers().filter(d=>!Object.prototype.hasOwnProperty.call(t,d.id)).map(d=>({id:d.id,name:i.has(d.name)?`${d.name} (local)`:d.name,rendererUrl:d.rendererUrl,readOnly:false}));return [...e,...n]}saveCustomRenderer(t){let e=(t.id||"").trim(),i=(t.name||"").trim(),n=(t.rendererUrl||"").trim();if(!e||!i||!n)throw new Error("Custom renderer id, name, and rendererUrl must not be empty.");if(!/^https?:\/\//i.test(n))throw new Error("Custom renderer URL must start with http:// or https://");let d=this.getStaticRenderersMap();if(Object.prototype.hasOwnProperty.call(d,e))throw new Error(`Cannot save custom renderer with ID "${e}": collides with a static configuration renderer.`);let p=this.getCustomRenderers(),Te=p.findIndex(Nt=>Nt.id===e);Te>=0?(p[Te]={id:e,name:i,rendererUrl:n},this.usageTrackingService.trackRendererEdit({rendererId:e})):(p.push({id:e,name:i,rendererUrl:n}),this.usageTrackingService.trackRendererAdd({rendererId:e})),this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(p));let Oe=_({},this.startupConfigState.renderers());Oe[e]={id:e,name:i,rendererUrl:n},this.startupConfigState.setRenderers(Oe);}deleteCustomRenderer(t){this.usageTrackingService.trackRendererDelete({rendererId:t});let e=this.getCustomRenderers().filter(n=>n.id!==t);this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(e));let i=_({},this.startupConfigState.renderers());delete i[t],this.startupConfigState.setRenderers(i),this.selectedRendererId()===t&&(this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer"),this.selectRenderer(null));}static \u0275fac=function(e){return new(e||r)};static \u0275prov=T$1({token:r,factory:r.\u0275fac,providedIn:"root"})};function qt(r,t){if(r&1&&(Ae$1(0,"div",5),Wt(1),He()),r&2){let e=JI();wt(),Za(e.errorMessage());}}function Ht(r){let t=r.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var Y=class r{fb=f(Oi);settingsService=f(S);dialogRef=f(Zi);data=f(Ih,{optional:true});errorMessage=q(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[we.required,we.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[we.required,Ht]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),i=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:i,name:t,rendererUrl:e}),this.dialogRef.close(i);}catch(n){this.errorMessage.set(n instanceof Error?n.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=de({type:r,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","formControlName","name","placeholder","My Renderer"],["matInput","","id","renderer-url-input","formControlName","rendererUrl","placeholder","http://localhost:3000"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(Ae$1(0,"h2",0),Wt(1),He(),Ae$1(2,"mat-dialog-content")(3,"form",1),qa("ngSubmit",function(d){return d.preventDefault(),i.onConfirm()}),Ae$1(4,"mat-form-field",2)(5,"mat-label"),Wt(6,"Name"),He(),Ky(7,"input",3),NC(),He(),Ae$1(8,"mat-form-field",2)(9,"mat-label"),Wt(10,"Renderer URL"),He(),Ky(11,"input",4),NC(),He(),vi(12,qt,2,1,"div",5),He()(),Ae$1(13,"mat-dialog-actions",6)(14,"button",7),Wt(15,"Cancel"),He(),Ae$1(16,"button",8),qa("click",function(){return i.onConfirm()}),Wt(17),He()()),e&2&&(wt(),Za(i.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),wt(2),_i("formGroup",i.form),wt(4),kC(),wt(4),kC(),wt(),bi(i.errorMessage()?12:-1),wt(4),_i("disabled",i.form.invalid),wt(),mf(" ",i.data?.renderer?"Save":"Add"," "));},dependencies:[Ri,Ni,Et$1,Fi,Ii,Un,kn,h_,a_,l_,u_,d_,me,nt,de$1,Dn,Rn,Lb,Fb],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var W=class r{disabled=Cv(false);dialog=f(Xi);destroyRef=f(pe);items=q([]);selectedItem=Ci(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(oq(this.destroyRef)).subscribe(async n=>{n&&(await this.refreshItems(),this.emitSelection(n));});}async handleEdit(t,e,i,n){if(e.stopPropagation(),e.preventDefault(),i.readOnly)return;this.dialog.open(t,{width:"450px",data:{[n]:i}}).afterClosed().pipe(oq(this.destroyRef)).subscribe(async p=>{p&&(await this.refreshItems(),this.getSelectedId()===p&&this.emitSelection(p));});}async handleDelete(t,e,i=null){t.stopPropagation(),t.preventDefault(),!this.items().find(d=>d.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(i));}static \u0275fac=function(e){return new(e||r)};static \u0275dir=K$1({type:r,inputs:{disabled:[1,"disabled"]}})};var Xt=(r,t)=>t.id;function Yt(r,t){if(r&1&&(Ae$1(0,"span",5),Wt(1),He()),r&2){let e=JI();wt(),Za(e.selectedItem()?.rendererUrl);}}function Qt(r,t){r&1&&(Ae$1(0,"mat-option",6),Wt(1,"No items available \u2014 click + to add"),He()),r&2&&_i("disabled",true);}function Jt(r,t){if(r&1){let e=ZI();Ae$1(0,"mat-option",8)(1,"div",9)(2,"div",10),Wt(3),He(),Ae$1(4,"div",5),Wt(5),He()(),Ae$1(6,"button",11),qa("click",function(n){let d=Qp(e).$implicit,p=JI(2);return Jp(p.onEditRenderer(n,d))})("keydown",function(n){return n.stopPropagation()}),Ae$1(7,"mat-icon",12),Wt(8,"edit"),He()(),Ae$1(9,"button",13),qa("click",function(n){let d=Qp(e).$implicit,p=JI(2);return Jp(p.onDeleteRenderer(n,d.id))})("keydown",function(n){return n.stopPropagation()}),Ae$1(10,"mat-icon",12),Wt(11,"delete"),He()()();}if(r&2){let e=t.$implicit;_i("value",e.id),wt(3),Za(e.name),wt(2),Za(e.rendererUrl),wt(),_i("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),St("aria-label","Edit "+e.name),wt(3),_i("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),St("aria-label","Delete "+e.name);}}function Zt(r,t){if(r&1&&$I(0,Jt,12,9,"mat-option",8,Xt),r&2){let e=JI();zI(e.items());}}var Ae=class r extends W{selectedRendererId=Cv("default");rendererSelected=KU();settingsService=f(S);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(Y,t);}onEditRenderer(t,e){this.handleEdit(Y,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=de({type:r,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[De],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,i){e&1&&(Ae$1(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Wt(3,"Renderer"),He(),Ae$1(4,"mat-select",2),qa("selectionChange",function(d){return i.onSelectionChange(d.value)}),Ae$1(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Wt(8),He(),vi(9,Yt,2,1,"span",5),He()(),vi(10,Qt,2,1,"mat-option",6)(11,Zt,2,0),He()(),Ae$1(12,"button",7),qa("click",function(d){return i.onAddRenderer(d)}),Ae$1(13,"mat-icon"),Wt(14,"add_circle"),He()()()),e&2&&(wt(4),_i("value",i.selectedRendererId())("disabled",i.disabled()),wt(4),Za(i.selectedItem()?.name),wt(),bi(i.selectedItem()?.rendererUrl?9:-1),wt(),bi(i.items().length===0?10:11),wt(2),_i("disabled",i.disabled()));},dependencies:[me,nt,de$1,Cn,yn,bn,re,Lb,ox,li$1,ai$1,Yt$1,mt,h_],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-option-supporting-text-color, #666);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function ei(r,t){if(r&1&&(Ae$1(0,"div",7),Wt(1),He()),r&2){let e=JI();wt(),Za(e.errorMessage());}}var Q=class r{fb=f(Oi);settingsService=f(S);dialogRef=f(Zi);data=f(Ih,{optional:true});errorMessage=q(null);hideApiKey=q(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[we.required,we.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[we.required,we.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),i=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(i,t,e),this.dialogRef.close(i);}catch(n){this.errorMessage.set(n instanceof Error?n.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=de({type:r,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","formControlName","name","placeholder","My Gemini Key"],["matInput","","id","api-key-value-input","formControlName","apiKey","placeholder","Paste your API key here",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(Ae$1(0,"h2",0),Wt(1),He(),Ae$1(2,"mat-dialog-content")(3,"form",1),qa("ngSubmit",function(d){return d.preventDefault(),i.onConfirm()}),Ae$1(4,"mat-form-field",2)(5,"mat-label"),Wt(6,"Name"),He(),Ky(7,"input",3),NC(),He(),Ae$1(8,"mat-form-field",2)(9,"mat-label"),Wt(10,"API Key"),He(),Ky(11,"input",4),NC(),Ae$1(12,"button",5),qa("click",function(){return i.toggleHideApiKey()}),Ae$1(13,"mat-icon",6),Wt(14),He()()(),vi(15,ei,2,1,"div",7),He()(),Ae$1(16,"mat-dialog-actions",8)(17,"button",9),Wt(18,"Cancel"),He(),Ae$1(19,"button",10),qa("click",function(){return i.onConfirm()}),Wt(20),He()()),e&2&&(wt(),Za(i.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),wt(2),_i("formGroup",i.form),wt(4),kC(),wt(4),_i("type",i.hideApiKey()?"password":"text"),kC(),wt(),St("aria-label",i.hideApiKey()?"Show API key":"Hide API key"),wt(2),Za(i.hideApiKey()?"visibility":"visibility_off"),wt(),bi(i.errorMessage()?15:-1),wt(4),_i("disabled",i.form.invalid),wt(),mf(" ",i.data?.apiKey?"Save":"Add"," "));},dependencies:[Ri,Ni,Et$1,Fi,Ii,Un,kn,h_,a_,l_,u_,d_,me,nt,de$1,Pt$1,Dn,Rn,Lb,Fb,ox,li$1,ai$1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ti=(r,t)=>t.id;function ii(r,t){r&1&&(Ae$1(0,"mat-option",3),Wt(1,"No items available \u2014 click + to add"),He()),r&2&&_i("disabled",true);}function ni(r,t){if(r&1){let e=ZI();Ae$1(0,"mat-option",5)(1,"span",6),Wt(2),He(),Ae$1(3,"button",7),qa("keydown",function(n){return n.stopPropagation()})("click",function(n){let d=Qp(e).$implicit,p=JI(2);return Jp(p.onEditApiKey(n,d))}),Ae$1(4,"mat-icon",8),Wt(5,"edit"),He()(),Ae$1(6,"button",9),qa("keydown",function(n){return n.stopPropagation()})("click",function(n){let d=Qp(e).$implicit,p=JI(2);return Jp(p.onDeleteApiKey(n,d.id))}),Ae$1(7,"mat-icon",8),Wt(8,"delete"),He()()();}if(r&2){let e=t.$implicit;_i("value",e.id),wt(2),Za(e.name),wt(),_i("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),St("aria-label","Edit "+e.name),wt(3),_i("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),St("aria-label","Delete "+e.name);}}function ri(r,t){if(r&1&&$I(0,ni,9,8,"mat-option",5,ti),r&2){let e=JI();zI(e.items());}}var Ie=class r extends W{selectedApiKeyId=Cv(null);apiKeySelected=KU();settingsService=f(S);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(Q,t);}onEditApiKey(t,e){this.handleEdit(Q,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=de({type:r,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[De],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,i){e&1&&(Ae$1(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Wt(3,"API Key"),He(),Ae$1(4,"mat-select",2),qa("selectionChange",function(d){return i.onSelectionChange(d.value)}),Ae$1(5,"mat-select-trigger"),Wt(6),He(),vi(7,ii,2,1,"mat-option",3)(8,ri,2,0),He()(),Ae$1(9,"button",4),qa("click",function(d){return i.onAddApiKey(d)}),Ae$1(10,"mat-icon"),Wt(11,"add_circle"),He()()()),e&2&&(wt(4),_i("value",i.selectedApiKeyId())("disabled",i.disabled()),wt(2),mf(" ",i.selectedItem()?.name," "),wt(),bi(i.items().length===0?7:8),wt(2),_i("disabled",i.disabled()));},dependencies:[me,nt,de$1,Cn,yn,bn,re,Lb,ox,li$1,ai$1,Yt$1,mt,h_],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function ai(r,t){if(r&1){let e=ZI();Ae$1(0,"div",3)(1,"h3"),Wt(2,"Gemini API Provisioning"),He(),Ae$1(3,"a2ui-composer-api-key-selector",18),qa("apiKeySelected",function(n){Qp(e);let d=JI();return Jp(d.onApiKeySelected(n))}),He()();}if(r&2){let e=JI();wt(3),_i("selectedApiKeyId",e.selectedApiKeyId());}}function oi(r,t){r&1&&(Ae$1(0,"mat-card-footer",9),Wt(1," To obtain an API key: "),Ae$1(2,"ol")(3,"li"),Wt(4," Go to "),Ae$1(5,"a",19),Wt(6," Google AI Studio"),He(),Wt(7," and sign in with your Google account. "),He(),Ae$1(8,"li"),Wt(9,"Click Create API key."),He(),Ae$1(10,"li"),Wt(11,"Select or create a Google Cloud project when prompted, then click Create key."),He(),Ae$1(12,"li"),Wt(13,"Save your key in a secure location!"),He()(),Wt(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),Ae$1(15,"a",20),Wt(16,"Web Crypto API"),He(),Wt(17,". Neither Google nor anyone else has access to this key. "),He());}function di(r,t){if(r&1&&(Ae$1(0,"code"),Wt(1),He()),r&2){let e=JI();wt(),mf("[System] Active renderer updated to ",e.activeRendererUrl());}}function li(r,t){if(r&1&&(Ae$1(0,"code",16),Wt(1),He()),r&2){let e=JI();wt(),mf("[Catalog Error] ",e.catalogErrorMessage());}}function si(r,t){r&1&&(Ae$1(0,"code",17),Wt(1,"[System] Catalog handshake completed successfully. Active catalog ready."),He());}function ci(r,t){r&1&&(Ae$1(0,"code"),Wt(1,"[System] Catalog handshake in progress. Indexing metadata..."),He());}function mi(r,t){r&1&&(Ae$1(0,"code"),Wt(1,"[System] Bridge connected. Initializing catalog handshake..."),He());}function pi(r,t){r&1&&(Ae$1(0,"code"),Wt(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),He());}var Ot=class r{fb=f(Oi);startupResolution=f($c);startupConfigState=f(hc);hostCommunication=f(m_);catalogManagement=f(fe);configProvider=f(fo);settingsService=f(S);is1PAuthEnabled=f(fc);selectedRendererId=q(null);selectedApiKeyId=Ci(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=Ci(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=q(false);isApiKeyProvidedByConfig=Ci(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=Ci(()=>this.isApiKeyProvidedByConfig());hideApiKey=q(true);forceThirdPartyAuth=q(false);bridgeConnected=Ci(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=Ci(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=Ci(()=>this.catalogManagement.catalogError());activeRendererUrl=Ci(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){sr(()=>{let t=this.settingsService.selectedRendererId()||"default";Gt(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=de({type:r,selectors:[["a2ui-composer-settings"]],decls:44,vars:12,consts:[[1,"settings-container"],[1,"settings-card"],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log",2,"color","#f44336","font-weight","bold"],[1,"success-log",2,"color","#4caf50"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"]],template:function(e,i){e&1&&(Ae$1(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"mat-card-title"),Wt(4,"A2UI Composer Settings"),He()(),Ae$1(5,"mat-card-content")(6,"form",2)(7,"div",3)(8,"h3"),Wt(9,"Renderer"),He(),Ae$1(10,"a2ui-composer-renderer-selector",4),qa("rendererSelected",function(d){return i.onRendererSelected(d)}),He()(),vi(11,ai,4,1,"div",3),Ae$1(12,"div",5)(13,"h3"),Wt(14,"Developer Authentication Overrides"),He(),Ae$1(15,"p",6),Wt(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),He(),Ae$1(17,"div",7)(18,"mat-slide-toggle",8),qa("change",function(){return i.toggleForceThirdPartyAuth()}),Wt(19," Force External Third-Party Authentication Mode "),He()()()()(),vi(20,oi,18,0,"mat-card-footer",9),He(),Ae$1(21,"mat-card",10)(22,"mat-card-header")(23,"mat-card-title"),Wt(24,"Connection Status & Diagnostics"),He(),Ae$1(25,"mat-card-subtitle"),Wt(26,"Real-time monitoring bridge"),He()(),Ae$1(27,"mat-card-content")(28,"div",11)(29,"mat-chip-set")(30,"mat-chip",12),Wt(31),He(),Ae$1(32,"mat-chip",13),Wt(33),He()()(),Ae$1(34,"div",14)(35,"h4"),Wt(36,"Overlay Logs Preview"),He(),Ae$1(37,"div",15),vi(38,di,2,1,"code"),vi(39,li,2,1,"code",16)(40,si,2,0,"code",17)(41,ci,2,0,"code")(42,mi,2,0,"code")(43,pi,2,0,"code"),He()()()()()),e&2&&(wt(6),_i("formGroup",i.settingsForm),wt(4),_i("selectedRendererId",i.selectedRendererId()),wt(),bi(i.isThirdParty()?11:-1),wt(),_i("hidden",!i.is1PAuthEnabled),wt(6),_i("checked",i.forceThirdPartyAuth()),wt(2),bi(i.isThirdParty()?20:-1),wt(10),_i("color",i.bridgeConnected()?"primary":"accent"),wt(),mf("Bridge: ",i.bridgeConnected()?"Connected":"Disconnected"),wt(),_i("color",i.catalogStatus()==="Connected"?"primary":i.catalogStatus()==="Indexing"?"accent":i.catalogStatus()==="Error"?"warn":void 0),wt(),mf("Catalog Handshake: ",i.catalogStatus()),wt(5),bi(i.activeRendererUrl()?38:-1),wt(),bi(i.catalogErrorMessage()?39:i.catalogStatus()==="Connected"?40:i.catalogStatus()==="Indexing"?41:i.bridgeConnected()?42:43));},dependencies:[Ri,Ni,Ii,Un,me,Dn,Lb,li$1,E,F,k,z,T,S$1,j,wi,Et,Ci$1,Kt,Pe,Ae,Ie],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto}.settings-container[_ngcontent-%COMP%]{padding:24px;max-width:600px;margin:0 auto}.form-section[_ngcontent-%COMP%]{margin-top:16px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-card[_ngcontent-%COMP%]{margin-top:24px}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-lowest);color:var(--mat-sys-primary);padding:12px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:16px!important}  body .mat-mdc-slide-toggle label,   body .mat-mdc-slide-toggle .mdc-label{padding-left:16px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-small-size, 12px);padding-left:24px;padding-bottom:12px}















`]})};export{Ot as Settings};