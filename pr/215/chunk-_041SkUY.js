import {R}from'./chunk-BDYZdvrt.js';import {E,F,k,z,T,S,j}from'./chunk-BmXJEphb.js';import {f,X as Xc,E as Ec,aa as $_,o as oe,_ as _o,ci as _c,K,N as Ni,l as lr,ag as Kt,d as de,a as d_,g as ke$1,Y as Yt$1,W as We,t as tc,S as Si,h as St$1,M as Mi,T as Ti,i as wf,Q as Q$1,q,r as dt,H,aM as Yi,aV as lc,aG as g,a$ as Jt$1,aR as G,b6 as Ye,b7 as o_,bg as Uv,bV as Rt$1,cj as q3,bp as at,ba as ue$1,A as po,u as uv,B as At$1,bL as jS,m as Ge,x as xt,aE as Cf,ck as Zo,b$ as Xv,cg as xi$1,D as Df,aK as Ri,F as nc,I as rc,ax as Kv,bx as o$,G as Gx,cl as V_,aD as Ie$1,j as oc,ao as NS,ak as PS,c0 as bm,cm as ss,O as pe,U as f6,L as Z,cn as is,co as Oh,cp as k_,cq as F_,cr as B_,cs as L_,c as l_,at as uI,au as fI,ae as IS,af as SS,ar as sm,as as am}from'./main.js';import {k as ki,E as Et$1,x as xi,a as xn,b as Cn,c as wn,r as re}from'./chunk-64d_7f0j.js';import {Y as Yt$2,m as mt}from'./chunk-hfKzUiIw.js';import'./chunk-DhLazMbe.js';import {u as ue,D as Dn,m as me,X,R as Rn,o as ot}from'./chunk-CPcfBvOT.js';import {q as qi,Z as Zi,L as Li,G as Gi,Q as Qn,b as bi,R as R$1,n as ne,V as Vi,x as xe,F as Ft$1,B as Bi,g as zn}from'./chunk-DGqrQjGL.js';var Pt=["*"],St=(()=>{class n{labelPosition="after";static \u0275fac=function(i){return new(i||n)};static \u0275cmp=de({type:n,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(i,o){i&2&&Ge("mdc-form-field--align-end",o.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Pt,decls:1,vars:0,template:function(i,o){i&1&&(po(),At$1(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return n})();var Dt=["switch"],Et=["*"];function Rt(n,t){n&1&&(ke$1(0,"span",11),bm(),ke$1(1,"svg",13),uv(2,"path",14),We(),ke$1(3,"svg",15),uv(4,"path",16),We()());}var Tt=new g("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),we=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Ie=(()=>{class n{_elementRef=f(H);_focusMonitor=f(Yi);_changeDetectorRef=f(lc);defaults=f(Tt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new we(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Jt$1();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new G;toggleChange=new G;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){f(Ye).load(o_);let e=f(new Uv("tabindex"),{optional:true}),i=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=i.color||"accent",this.id=this._uniqueId=f(Rt$1).getId("mat-mdc-slide-toggle-"),this.hideIcon=i.hideIcon??false,this.disabledInteractive=i.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new we(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=de({type:n,selectors:[["mat-slide-toggle"]],viewQuery:function(i,o){if(i&1&&Ri(Dt,5),i&2){let m;nc(m=rc())&&(o._switchElement=m.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(i,o){i&2&&(xi$1("id",o.id),xt("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),Df(o.color?"mat-"+o.color:""),Ge("mat-mdc-slide-toggle-focused",o._focused)("mat-mdc-slide-toggle-checked",o.checked)("_mat-animation-noopable",o._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",ue$1],color:"color",disabled:[2,"disabled","disabled",ue$1],disableRipple:[2,"disableRipple","disableRipple",ue$1],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:Xv(e)],checked:[2,"checked","checked",ue$1],hideIcon:[2,"hideIcon","hideIcon",ue$1],disabledInteractive:[2,"disabledInteractive","disabledInteractive",ue$1]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[Cf([{provide:R$1,useExisting:Zo(()=>n),multi:true},{provide:ne,useExisting:n,multi:true}]),at],ngContentSelectors:Et,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(i,o){if(i&1&&(po(),ke$1(0,"div",1)(1,"button",2,0),tc("click",function(){return o._handleClick()}),uv(3,"div",3)(4,"span",4),ke$1(5,"span",5)(6,"span",6)(7,"span",7),uv(8,"span",8),We(),ke$1(9,"span",9),uv(10,"span",10),We(),Si(11,Rt,5,0,"span",11),We()()(),ke$1(12,"label",12),tc("click",function(b){return b.stopPropagation()}),At$1(13),We()()),i&2){let m=jS(2);Mi("labelPosition",o.labelPosition),St$1(),Ge("mdc-switch--selected",o.checked)("mdc-switch--unselected",!o.checked)("mdc-switch--checked",o.checked)("mdc-switch--disabled",o.disabled)("mat-mdc-slide-toggle-disabled-interactive",o.disabledInteractive),Mi("tabIndex",o.disabled&&!o.disabledInteractive?-1:o.tabIndex)("disabled",o.disabled&&!o.disabledInteractive),xt("id",o.buttonId)("name",o.name)("aria-label",o.ariaLabel)("aria-labelledby",o._getAriaLabelledBy())("aria-describedby",o.ariaDescribedby)("aria-required",o.required||null)("aria-checked",o.checked)("aria-disabled",o.disabled&&o.disabledInteractive?"true":null),St$1(9),Mi("matRippleTrigger",m)("matRippleDisabled",o.disableRipple||o.disabled)("matRippleCentered",true),St$1(),Ti(o.hideIcon?-1:11),St$1(),Mi("for",o.buttonId),xt("id",o._labelId);}},dependencies:[q3,St],styles:[`.mdc-switch {
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
`],encapsulation:2})}return n})(),Mt=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=Q$1({type:n});static \u0275inj=q({imports:[Ie,dt]})}return n})();function Ft(n,t){if(n&1&&(ke$1(0,"div",5),Yt$1(1),We()),n&2){let e=PS();St$1(),oc(e.errorMessage());}}function Nt(n){let t=n.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var Q=class n{fb=f(qi);settingsService=f(R);dialogRef=f(is);data=f(Oh,{optional:true});errorMessage=K(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[xe.required,xe.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[xe.required,Nt]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),i=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:i,name:t,rendererUrl:e}),this.dialogRef.close(i);}catch(o){this.errorMessage.set(o instanceof Error?o.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=de({type:n,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","formControlName","name","placeholder","My Renderer"],["matInput","","id","renderer-url-input","formControlName","rendererUrl","placeholder","http://localhost:3000"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(ke$1(0,"h2",0),Yt$1(1),We(),ke$1(2,"mat-dialog-content")(3,"form",1),tc("ngSubmit",function(m){return m.preventDefault(),i.onConfirm()}),ke$1(4,"mat-form-field",2)(5,"mat-label"),Yt$1(6,"Name"),We(),uv(7,"input",3),uI(),We(),ke$1(8,"mat-form-field",2)(9,"mat-label"),Yt$1(10,"Renderer URL"),We(),uv(11,"input",4),uI(),We(),Si(12,Ft,2,1,"div",5),We()(),ke$1(13,"mat-dialog-actions",6)(14,"button",7),Yt$1(15,"Cancel"),We(),ke$1(16,"button",8),tc("click",function(){return i.onConfirm()}),Yt$1(17),We()()),e&2&&(St$1(),oc(i.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),St$1(2),Mi("formGroup",i.form),St$1(4),fI(),St$1(4),fI(),St$1(),Ti(i.errorMessage()?12:-1),St$1(4),Mi("disabled",i.form.invalid),St$1(),wf(" ",i.data?.renderer?"Save":"Add"," "));},dependencies:[Zi,Li,Ft$1,Bi,Gi,Qn,zn,V_,k_,F_,B_,L_,ue,me,X,Dn,Rn,d_,l_],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var W=class n{disabled=Kv(false);dialog=f(ss);destroyRef=f(pe);items=K([]);selectedItem=Ni(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(f6(this.destroyRef)).subscribe(async o=>{o&&(await this.refreshItems(),this.emitSelection(o));});}async handleEdit(t,e,i,o){if(e.stopPropagation(),e.preventDefault(),i.readOnly)return;this.dialog.open(t,{width:"450px",data:{[o]:i}}).afterClosed().pipe(f6(this.destroyRef)).subscribe(async b=>{b&&(await this.refreshItems(),this.getSelectedId()===b&&this.emitSelection(b));});}async handleDelete(t,e,i=null){t.stopPropagation(),t.preventDefault(),!this.items().find(m=>m.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(i));}static \u0275fac=function(e){return new(e||n)};static \u0275dir=Z({type:n,inputs:{disabled:[1,"disabled"]}})};var Lt=(n,t)=>t.id;function Gt(n,t){if(n&1&&(ke$1(0,"span",5),Yt$1(1),We()),n&2){let e=PS();St$1(),oc(e.selectedItem()?.rendererUrl);}}function Bt(n,t){n&1&&(ke$1(0,"mat-option",6),Yt$1(1,"No items available \u2014 click + to add"),We()),n&2&&Mi("disabled",true);}function Ut(n,t){if(n&1){let e=NS();ke$1(0,"mat-option",8)(1,"div",9)(2,"div",10),Yt$1(3),We(),ke$1(4,"div",5),Yt$1(5),We()(),ke$1(6,"button",11),tc("click",function(o){let m=sm(e).$implicit,b=PS(2);return am(b.onEditRenderer(o,m))})("keydown",function(o){return o.stopPropagation()}),ke$1(7,"mat-icon",12),Yt$1(8,"edit"),We()(),ke$1(9,"button",13),tc("click",function(o){let m=sm(e).$implicit,b=PS(2);return am(b.onDeleteRenderer(o,m.id))})("keydown",function(o){return o.stopPropagation()}),ke$1(10,"mat-icon",12),Yt$1(11,"delete"),We()()();}if(n&2){let e=t.$implicit;Mi("value",e.id),St$1(3),oc(e.name),St$1(2),oc(e.rendererUrl),St$1(),Mi("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),xt("aria-label","Edit "+e.name),St$1(3),Mi("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),xt("aria-label","Delete "+e.name);}}function qt(n,t){if(n&1&&IS(0,Ut,12,9,"mat-option",8,Lt),n&2){let e=PS();SS(e.items());}}var ke=class n extends W{selectedRendererId=Kv("default");rendererSelected=o$();settingsService=f(R);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(Q,t);}onEditRenderer(t,e){this.handleEdit(Q,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=de({type:n,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[Ie$1],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,i){e&1&&(ke$1(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Yt$1(3,"Renderer"),We(),ke$1(4,"mat-select",2),tc("selectionChange",function(m){return i.onSelectionChange(m.value)}),ke$1(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Yt$1(8),We(),Si(9,Gt,2,1,"span",5),We()(),Si(10,Bt,2,1,"mat-option",6)(11,qt,2,0),We()(),ke$1(12,"button",7),tc("click",function(m){return i.onAddRenderer(m)}),ke$1(13,"mat-icon"),Yt$1(14,"add_circle"),We()()()),e&2&&(St$1(4),Mi("value",i.selectedRendererId())("disabled",i.disabled()),St$1(4),oc(i.selectedItem()?.name),St$1(),Ti(i.selectedItem()?.rendererUrl?9:-1),St$1(),Ti(i.items().length===0?10:11),St$1(2),Mi("disabled",i.disabled()));},dependencies:[ue,me,X,xn,Cn,wn,re,d_,Gx,bi,Vi,Yt$2,mt,V_],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-option-supporting-text-color, #666);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function jt(n,t){if(n&1&&(ke$1(0,"div",7),Yt$1(1),We()),n&2){let e=PS();St$1(),oc(e.errorMessage());}}var Y=class n{fb=f(qi);settingsService=f(R);dialogRef=f(is);data=f(Oh,{optional:true});errorMessage=K(null);hideApiKey=K(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[xe.required,xe.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[xe.required,xe.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),i=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(i,t,e),this.dialogRef.close(i);}catch(o){this.errorMessage.set(o instanceof Error?o.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=de({type:n,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","formControlName","name","placeholder","My Gemini Key"],["matInput","","id","api-key-value-input","formControlName","apiKey","placeholder","Paste your API key here",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(ke$1(0,"h2",0),Yt$1(1),We(),ke$1(2,"mat-dialog-content")(3,"form",1),tc("ngSubmit",function(m){return m.preventDefault(),i.onConfirm()}),ke$1(4,"mat-form-field",2)(5,"mat-label"),Yt$1(6,"Name"),We(),uv(7,"input",3),uI(),We(),ke$1(8,"mat-form-field",2)(9,"mat-label"),Yt$1(10,"API Key"),We(),uv(11,"input",4),uI(),ke$1(12,"button",5),tc("click",function(){return i.toggleHideApiKey()}),ke$1(13,"mat-icon",6),Yt$1(14),We()()(),Si(15,jt,2,1,"div",7),We()(),ke$1(16,"mat-dialog-actions",8)(17,"button",9),Yt$1(18,"Cancel"),We(),ke$1(19,"button",10),tc("click",function(){return i.onConfirm()}),Yt$1(20),We()()),e&2&&(St$1(),oc(i.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),St$1(2),Mi("formGroup",i.form),St$1(4),fI(),St$1(4),Mi("type",i.hideApiKey()?"password":"text"),fI(),St$1(),xt("aria-label",i.hideApiKey()?"Show API key":"Hide API key"),St$1(2),oc(i.hideApiKey()?"visibility":"visibility_off"),St$1(),Ti(i.errorMessage()?15:-1),St$1(4),Mi("disabled",i.form.invalid),St$1(),wf(" ",i.data?.apiKey?"Save":"Add"," "));},dependencies:[Zi,Li,Ft$1,Bi,Gi,Qn,zn,V_,k_,F_,B_,L_,ue,me,X,ot,Dn,Rn,d_,l_,Gx,bi,Vi],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var Ht=(n,t)=>t.id;function $t(n,t){n&1&&(ke$1(0,"mat-option",3),Yt$1(1,"No items available \u2014 click + to add"),We()),n&2&&Mi("disabled",true);}function Wt(n,t){if(n&1){let e=NS();ke$1(0,"mat-option",5)(1,"span",6),Yt$1(2),We(),ke$1(3,"button",7),tc("keydown",function(o){return o.stopPropagation()})("click",function(o){let m=sm(e).$implicit,b=PS(2);return am(b.onEditApiKey(o,m))}),ke$1(4,"mat-icon",8),Yt$1(5,"edit"),We()(),ke$1(6,"button",9),tc("keydown",function(o){return o.stopPropagation()})("click",function(o){let m=sm(e).$implicit,b=PS(2);return am(b.onDeleteApiKey(o,m.id))}),ke$1(7,"mat-icon",8),Yt$1(8,"delete"),We()()();}if(n&2){let e=t.$implicit;Mi("value",e.id),St$1(2),oc(e.name),St$1(),Mi("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),xt("aria-label","Edit "+e.name),St$1(3),Mi("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),xt("aria-label","Delete "+e.name);}}function Xt(n,t){if(n&1&&IS(0,Wt,9,8,"mat-option",5,Ht),n&2){let e=PS();SS(e.items());}}var Se=class n extends W{selectedApiKeyId=Kv(null);apiKeySelected=o$();settingsService=f(R);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(Y,t);}onEditApiKey(t,e){this.handleEdit(Y,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=de({type:n,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[Ie$1],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,i){e&1&&(ke$1(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Yt$1(3,"API Key"),We(),ke$1(4,"mat-select",2),tc("selectionChange",function(m){return i.onSelectionChange(m.value)}),ke$1(5,"mat-select-trigger"),Yt$1(6),We(),Si(7,$t,2,1,"mat-option",3)(8,Xt,2,0),We()(),ke$1(9,"button",4),tc("click",function(m){return i.onAddApiKey(m)}),ke$1(10,"mat-icon"),Yt$1(11,"add_circle"),We()()()),e&2&&(St$1(4),Mi("value",i.selectedApiKeyId())("disabled",i.disabled()),St$1(2),wf(" ",i.selectedItem()?.name," "),St$1(),Ti(i.items().length===0?7:8),St$1(2),Mi("disabled",i.disabled()));},dependencies:[ue,me,X,xn,Cn,wn,re,d_,Gx,bi,Vi,Yt$2,mt,V_],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function Qt(n,t){if(n&1){let e=NS();ke$1(0,"div",4)(1,"h3"),Yt$1(2,"Gemini API Provisioning"),We(),ke$1(3,"a2ui-composer-api-key-selector",20),tc("apiKeySelected",function(o){sm(e);let m=PS();return am(m.onApiKeySelected(o))}),We()();}if(n&2){let e=PS();St$1(3),Mi("selectedApiKeyId",e.selectedApiKeyId());}}function Yt(n,t){n&1&&(ke$1(0,"mat-card-footer",10),Yt$1(1," To obtain an API key: "),ke$1(2,"ol")(3,"li"),Yt$1(4," Go to "),ke$1(5,"a",21),Yt$1(6," Google AI Studio"),We(),Yt$1(7," and sign in with your Google account. "),We(),ke$1(8,"li"),Yt$1(9,"Click Create API key."),We(),ke$1(10,"li"),Yt$1(11,"Select or create a Google Cloud project when prompted, then click Create key."),We(),ke$1(12,"li"),Yt$1(13,"Save your key in a secure location!"),We()(),Yt$1(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),ke$1(15,"a",22),Yt$1(16,"Web Crypto API"),We(),Yt$1(17,". Neither Google nor anyone else has access to this key. "),We());}function Zt(n,t){if(n&1&&(ke$1(0,"code"),Yt$1(1),We()),n&2){let e=PS();St$1(),wf("[System] Active renderer updated to ",e.activeRendererUrl());}}function Jt(n,t){if(n&1&&(ke$1(0,"code",18),Yt$1(1),We()),n&2){let e=PS();St$1(),wf("[Catalog Error] ",e.catalogErrorMessage());}}function ei(n,t){n&1&&(ke$1(0,"code",19),Yt$1(1,"[System] Catalog handshake completed successfully. Active catalog ready."),We());}function ti(n,t){n&1&&(ke$1(0,"code"),Yt$1(1,"[System] Catalog handshake in progress. Indexing metadata..."),We());}function ii(n,t){n&1&&(ke$1(0,"code"),Yt$1(1,"[System] Bridge connected. Initializing catalog handshake..."),We());}function ni(n,t){n&1&&(ke$1(0,"code"),Yt$1(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),We());}var At=class n{fb=f(qi);startupResolution=f(Xc);startupConfigState=f(Ec);hostCommunication=f($_);catalogManagement=f(oe);configProvider=f(_o);settingsService=f(R);is1PAuthEnabled=f(_c);selectedRendererId=K(null);selectedApiKeyId=Ni(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=Ni(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=K(false);isApiKeyProvidedByConfig=Ni(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=Ni(()=>this.isApiKeyProvidedByConfig());hideApiKey=K(true);forceThirdPartyAuth=K(false);bridgeConnected=Ni(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=Ni(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=Ni(()=>this.catalogManagement.catalogError());activeRendererUrl=Ni(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){lr(()=>{let t=this.settingsService.selectedRendererId()||"default";Kt(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=de({type:n,selectors:[["a2ui-composer-settings"]],decls:44,vars:12,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"]],template:function(e,i){e&1&&(ke$1(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Yt$1(4,"A2UI Composer Settings"),We()(),ke$1(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Yt$1(9,"Renderer"),We(),ke$1(10,"a2ui-composer-renderer-selector",5),tc("rendererSelected",function(m){return i.onRendererSelected(m)}),We()(),Si(11,Qt,4,1,"div",4),ke$1(12,"div",6)(13,"h3"),Yt$1(14,"Developer Authentication Overrides"),We(),ke$1(15,"p",7),Yt$1(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),We(),ke$1(17,"div",8)(18,"mat-slide-toggle",9),tc("change",function(){return i.toggleForceThirdPartyAuth()}),Yt$1(19," Force External Third-Party Authentication Mode "),We()()()()(),Si(20,Yt,18,0,"mat-card-footer",10),We(),ke$1(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Yt$1(24,"Connection Status & Diagnostics"),We(),ke$1(25,"h3",12),Yt$1(26,"Real-time monitoring bridge"),We()(),ke$1(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Yt$1(31),We(),ke$1(32,"mat-chip",15),Yt$1(33),We()()(),ke$1(34,"div",16)(35,"h4"),Yt$1(36,"Overlay Logs Preview"),We(),ke$1(37,"div",17),Si(38,Zt,2,1,"code"),Si(39,Jt,2,1,"code",18)(40,ei,2,0,"code",19)(41,ti,2,0,"code")(42,ii,2,0,"code")(43,ni,2,0,"code"),We()()()()()),e&2&&(St$1(6),Mi("formGroup",i.settingsForm),St$1(4),Mi("selectedRendererId",i.selectedRendererId()),St$1(),Ti(i.isThirdParty()?11:-1),St$1(),Mi("hidden",!i.is1PAuthEnabled),St$1(6),Mi("checked",i.forceThirdPartyAuth()),St$1(2),Ti(i.isThirdParty()?20:-1),St$1(10),Mi("color",i.bridgeConnected()?"primary":"accent"),St$1(),wf("Bridge: ",i.bridgeConnected()?"Connected":"Disconnected"),St$1(),Mi("color",i.catalogStatus()==="Connected"?"primary":i.catalogStatus()==="Indexing"?"accent":i.catalogStatus()==="Error"?"warn":void 0),St$1(),wf("Catalog Handshake: ",i.catalogStatus()),St$1(5),Ti(i.activeRendererUrl()?38:-1),St$1(),Ti(i.catalogErrorMessage()?39:i.catalogStatus()==="Connected"?40:i.catalogStatus()==="Indexing"?41:i.bridgeConnected()?42:43));},dependencies:[Zi,Li,Gi,Qn,ue,Dn,d_,bi,E,F,k,z,T,S,j,ki,Et$1,xi,Mt,Ie,ke,Se],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto}.settings-container[_ngcontent-%COMP%]{padding:24px;max-width:600px;margin:0 auto}.form-section[_ngcontent-%COMP%]{margin-top:16px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-card[_ngcontent-%COMP%]{margin-top:24px}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-lowest);color:var(--mat-sys-primary);padding:12px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:700}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:16px!important}  body .mat-mdc-slide-toggle label,   body .mat-mdc-slide-toggle .mdc-label{padding-left:16px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-small-size, 12px);padding-left:24px;padding-bottom:12px}















`]})};export{At as Settings};