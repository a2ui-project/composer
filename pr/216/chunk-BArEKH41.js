import {_,cL as K9e,cM as bp,ae as cn,L as Lv,u as uv,a2 as c8,s as se,c as cu,cN as K,cO as MC,cP as lv,X as Xe,t as ti$1,$ as $o,a7 as tn,a5 as TGe,b as Gt$1,av as Y9e,c5 as W9e,c6 as q9e,c4 as Q9e,c9 as JCe,ar as me,at as Vr,W as WH,d as JH,e as Wle,T as T9e,x as x9e,cQ as PH,R as Rr,j as Ho,k as Xr,i as Ls,m as Df,n as co,S as Sf,y as wf,p as xw,cR as Cp,cS as a8,cT as XI,c3 as LR,aw as E8,ax as Z9e,c8 as ZCe,cU as kH,cV as OH,cW as RH,cX as NH,as as Wt$1,cc as Be,ce as Fi,au as zr,l as jL,az as y5,q as tB,aA as _5,E as ot$1,F as nt,I as sr,O as et,bh as yp,ag as cc,ba as q,bs as $i,bl as it,bz as li$1,bA as HH,bJ as oB,cy as go,cY as c2e,bV as Un,bD as Lt$1,P as zs,Q as ei$1,co as ZY,r as _n,o as mr,ab as lo,cZ as GR,c_ as Yh,c$ as Gr,cD as I1,cJ as If,V as kf,bf as Tf,Y as Xg,a0 as eB,aL as w1,aM as APe,cg as zo,ch as Lo,d0 as Po,ci as Fe,b8 as Ft,aT as LY,aJ as UY,aX as OY,aY as NY,cE as WP,a1 as Ve,d1 as Oi,aU as PP,aV as FP}from'./main.js';import {E,F,k,z,T,S,j}from'./chunk-D4i-sRQu.js';import {o as ot,k as ki,c as ct}from'./chunk-Choixpkx.js';import {Y as Yt$1,m as mt}from'./chunk-BmbcChCP.js';var zt=["*"],Et=(()=>{class i{labelPosition="after";static \u0275fac=function(n){return new(n||i)};static \u0275cmp=Gt$1({type:i,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(n,o){n&2&&_n("mdc-form-field--align-end",o.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:zt,decls:1,vars:0,template:function(n,o){n&1&&(zs(),ei$1(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return i})();var Nt=["switch"],Vt=["*"];function Gt(i,t){i&1&&(Rr(0,"span",11),WP(),Rr(1,"svg",13),jL(2,"path",14),Xr(),Rr(3,"svg",15),jL(4,"path",16),Xr()());}var Lt=new q("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Pe=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Te=(()=>{class i{_elementRef=_(et);_focusMonitor=_(yp);_changeDetectorRef=_(cc);defaults=_(Lt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Pe(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=$i();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new it;toggleChange=new it;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){_(li$1).load(HH);let e=_(new oB("tabindex"),{optional:true}),n=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=n.color||"accent",this.id=this._uniqueId=_(go).getId("mat-mdc-slide-toggle-"),this.hideIcon=n.hideIcon??false,this.disabledInteractive=n.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Pe(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=Gt$1({type:i,selectors:[["mat-slide-toggle"]],viewQuery:function(n,o){if(n&1&&Tf(Nt,5),n&2){let s;Xg(s=eB())&&(o._switchElement=s.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(n,o){n&2&&(If("id",o.id),mr("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),kf(o.color?"mat-"+o.color:""),_n("mat-mdc-slide-toggle-focused",o._focused)("mat-mdc-slide-toggle-checked",o.checked)("_mat-animation-noopable",o._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",Lt$1],color:"color",disabled:[2,"disabled","disabled",Lt$1],disableRipple:[2,"disableRipple","disableRipple",Lt$1],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:I1(e)],checked:[2,"checked","checked",Lt$1],hideIcon:[2,"hideIcon","hideIcon",Lt$1],disabledInteractive:[2,"disabledInteractive","disabledInteractive",Lt$1]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[lo([{provide:GR,useExisting:Gr(()=>i),multi:true},{provide:Yh,useExisting:i,multi:true}]),Un],ngContentSelectors:Vt,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(n,o){if(n&1&&(zs(),Rr(0,"div",1)(1,"button",2,0),Ls("click",function(){return o._handleClick()}),jL(3,"div",3)(4,"span",4),Rr(5,"span",5)(6,"span",6)(7,"span",7),jL(8,"span",8),Xr(),Rr(9,"span",9),jL(10,"span",10),Xr(),Df(11,Gt,5,0,"span",11),Xr()()(),Rr(12,"label",12),Ls("click",function(v){return v.stopPropagation()}),ei$1(13),Xr()()),n&2){let s=ZY(2);Sf("labelPosition",o.labelPosition),co(),_n("mdc-switch--selected",o.checked)("mdc-switch--unselected",!o.checked)("mdc-switch--checked",o.checked)("mdc-switch--disabled",o.disabled)("mat-mdc-slide-toggle-disabled-interactive",o.disabledInteractive),Sf("tabIndex",o.disabled&&!o.disabledInteractive?-1:o.tabIndex)("disabled",o.disabled&&!o.disabledInteractive),mr("id",o.buttonId)("name",o.name)("aria-label",o.ariaLabel)("aria-labelledby",o._getAriaLabelledBy())("aria-describedby",o.ariaDescribedby)("aria-required",o.required||null)("aria-checked",o.checked)("aria-disabled",o.disabled&&o.disabledInteractive?"true":null),co(9),Sf("matRippleTrigger",s)("matRippleDisabled",o.disableRipple||o.disabled)("matRippleCentered",true),co(),wf(o.hideIcon?-1:11),co(),Sf("for",o.buttonId),mr("id",o._labelId);}},dependencies:[c2e,Et],styles:[`.mdc-switch {
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
`],encapsulation:2})}return i})(),Tt=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=ot$1({type:i});static \u0275inj=nt({imports:[Te,sr]})}return i})();function Ut(i,t){if(i&1&&(Rr(0,"div",5),Ho(1),Xr()),i&2){let e=UY();co(),tB(e.errorMessage());}}function $t(i){let t=i.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var pe=class i{fb=_(K9e);settingsService=_(K);dialogRef=_(Cp);data=_(XI,{optional:true});errorMessage=Xe(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[LR.required,LR.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[LR.required,$t]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),n=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:n,name:t,rendererUrl:e}),this.dialogRef.close(n);}catch(o){this.errorMessage.set(o instanceof Error?o.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Gt$1({type:i,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:7,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","placeholder","My Renderer",3,"formControl"],["matInput","","id","renderer-url-input","placeholder","http://localhost:3000",3,"formControl"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Rr(0,"h2",0),Ho(1),Xr(),Rr(2,"mat-dialog-content")(3,"form",1),Ls("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),Rr(4,"mat-form-field",2)(5,"mat-label"),Ho(6,"Name"),Xr(),jL(7,"input",3),y5(),Xr(),Rr(8,"mat-form-field",2)(9,"mat-label"),Ho(10,"Renderer URL"),Xr(),jL(11,"input",4),y5(),Xr(),Df(12,Ut,2,1,"div",5),Xr()(),Rr(13,"mat-dialog-actions",6)(14,"button",7),Ho(15,"Cancel"),Xr(),Rr(16,"button",8),Ls("click",function(){return n.onConfirm()}),Ho(17),Xr()()),e&2&&(co(),tB(n.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),co(2),Sf("formGroup",n.form),co(4),Sf("formControl",n.form.controls.name),_5(),co(4),Sf("formControl",n.form.controls.rendererUrl),_5(),co(),wf(n.errorMessage()?12:-1),co(4),Sf("disabled",n.form.invalid),co(),xw(" ",n.data?.renderer?"Save":"Add"," "));},dependencies:[Q9e,W9e,E8,Z9e,q9e,ZCe,JCe,PH,kH,OH,RH,NH,me,Wt$1,Be,Vr,zr,WH,JH],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ce=class i{disabled=w1(false);dialog=_(bp);destroyRef=_(cn);items=Xe([]);selectedItem=ti$1(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(TGe(this.destroyRef)).subscribe(async o=>{o&&(await this.refreshItems(),this.emitSelection(o));});}async handleEdit(t,e,n,o){if(e.stopPropagation(),e.preventDefault(),n.readOnly)return;this.dialog.open(t,{width:"450px",data:{[o]:n}}).afterClosed().pipe(TGe(this.destroyRef)).subscribe(async v=>{v&&(await this.refreshItems(),this.getSelectedId()===v&&this.emitSelection(v));});}async handleDelete(t,e,n=null){t.stopPropagation(),t.preventDefault(),!this.items().find(s=>s.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(n));}static \u0275fac=function(e){return new(e||i)};static \u0275dir=Ve({type:i,inputs:{disabled:[1,"disabled"]}})};var Ht=(i,t)=>t.id;function jt(i,t){if(i&1&&(Rr(0,"span",5),Ho(1),Xr()),i&2){let e=UY();co(),tB(e.selectedItem()?.rendererUrl);}}function Wt(i,t){i&1&&(Rr(0,"mat-option",6),Ho(1,"No items available \u2014 click + to add"),Xr()),i&2&&Sf("disabled",true);}function Xt(i,t){if(i&1){let e=LY();Rr(0,"mat-option",8)(1,"div",9)(2,"div",10),Ho(3),Xr(),Rr(4,"div",5),Ho(5),Xr()(),Rr(6,"button",11),Ls("click",function(o){let s=PP(e).$implicit,v=UY(2);return FP(v.onEditRenderer(o,s))})("keydown",function(o){return o.stopPropagation()}),Rr(7,"mat-icon",12),Ho(8,"edit"),Xr()(),Rr(9,"button",13),Ls("click",function(o){let s=PP(e).$implicit,v=UY(2);return FP(v.onDeleteRenderer(o,s.id))})("keydown",function(o){return o.stopPropagation()}),Rr(10,"mat-icon",12),Ho(11,"delete"),Xr()()();}if(i&2){let e=t.$implicit;Sf("value",e.id),co(3),tB(e.name),co(2),tB(e.rendererUrl),co(),Sf("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),mr("aria-label","Edit "+e.name),co(3),Sf("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),mr("aria-label","Delete "+e.name);}}function Qt(i,t){if(i&1&&OY(0,Xt,12,9,"mat-option",8,Ht),i&2){let e=UY();NY(e.items());}}var Ae=class i extends ce{selectedRendererId=w1("default");rendererSelected=APe();settingsService=_(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(pe,t);}onEditRenderer(t,e){this.handleEdit(pe,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Gt$1({type:i,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[Ft],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,n){e&1&&(Rr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Ho(3,"Renderer"),Xr(),Rr(4,"mat-select",2),Ls("selectionChange",function(s){return n.onSelectionChange(s.value)}),Rr(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Ho(8),Xr(),Df(9,jt,2,1,"span",5),Xr()(),Df(10,Wt,2,1,"mat-option",6)(11,Qt,2,0),Xr()(),Rr(12,"button",7),Ls("click",function(s){return n.onAddRenderer(s)}),Rr(13,"mat-icon"),Ho(14,"add_circle"),Xr()()()),e&2&&(co(4),Sf("value",n.selectedRendererId())("disabled",n.disabled()),co(4),tB(n.selectedItem()?.name),co(),wf(n.selectedItem()?.rendererUrl?9:-1),co(),wf(n.items().length===0?10:11),co(2),Sf("disabled",n.disabled()));},dependencies:[me,Wt$1,Be,zo,Lo,Po,Fe,WH,Wle,T9e,x9e,Yt$1,mt,PH],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-option-supporting-text-color, #666);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function Yt(i,t){if(i&1&&(Rr(0,"div",7),Ho(1),Xr()),i&2){let e=UY();co(),tB(e.errorMessage());}}var he=class i{fb=_(K9e);settingsService=_(K);dialogRef=_(Cp);data=_(XI,{optional:true});errorMessage=Xe(null);hideApiKey=Xe(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[LR.required,LR.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[LR.required,LR.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),n=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(n,t,e),this.dialogRef.close(n);}catch(o){this.errorMessage.set(o instanceof Error?o.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Gt$1({type:i,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:10,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","placeholder","My Gemini Key",3,"formControl"],["matInput","","id","api-key-value-input","placeholder","Paste your API key here",3,"type","formControl"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Rr(0,"h2",0),Ho(1),Xr(),Rr(2,"mat-dialog-content")(3,"form",1),Ls("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),Rr(4,"mat-form-field",2)(5,"mat-label"),Ho(6,"Name"),Xr(),jL(7,"input",3),y5(),Xr(),Rr(8,"mat-form-field",2)(9,"mat-label"),Ho(10,"API Key"),Xr(),jL(11,"input",4),y5(),Rr(12,"button",5),Ls("click",function(){return n.toggleHideApiKey()}),Rr(13,"mat-icon",6),Ho(14),Xr()()(),Df(15,Yt,2,1,"div",7),Xr()(),Rr(16,"mat-dialog-actions",8)(17,"button",9),Ho(18,"Cancel"),Xr(),Rr(19,"button",10),Ls("click",function(){return n.onConfirm()}),Ho(20),Xr()()),e&2&&(co(),tB(n.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),co(2),Sf("formGroup",n.form),co(4),Sf("formControl",n.form.controls.name),_5(),co(4),Sf("type",n.hideApiKey()?"password":"text")("formControl",n.form.controls.apiKey),_5(),co(),mr("aria-label",n.hideApiKey()?"Show API key":"Hide API key"),co(2),tB(n.hideApiKey()?"visibility":"visibility_off"),co(),wf(n.errorMessage()?15:-1),co(4),Sf("disabled",n.form.invalid),co(),xw(" ",n.data?.apiKey?"Save":"Add"," "));},dependencies:[Q9e,W9e,E8,Z9e,q9e,ZCe,JCe,PH,kH,OH,RH,NH,me,Wt$1,Be,Oi,Vr,zr,WH,JH,Wle,T9e,x9e],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var Zt=(i,t)=>t.id;function Jt(i,t){i&1&&(Rr(0,"mat-option",3),Ho(1,"No items available \u2014 click + to add"),Xr()),i&2&&Sf("disabled",true);}function ei(i,t){if(i&1){let e=LY();Rr(0,"mat-option",5)(1,"span",6),Ho(2),Xr(),Rr(3,"button",7),Ls("keydown",function(o){return o.stopPropagation()})("click",function(o){let s=PP(e).$implicit,v=UY(2);return FP(v.onEditApiKey(o,s))}),Rr(4,"mat-icon",8),Ho(5,"edit"),Xr()(),Rr(6,"button",9),Ls("keydown",function(o){return o.stopPropagation()})("click",function(o){let s=PP(e).$implicit,v=UY(2);return FP(v.onDeleteApiKey(o,s.id))}),Rr(7,"mat-icon",8),Ho(8,"delete"),Xr()()();}if(i&2){let e=t.$implicit;Sf("value",e.id),co(2),tB(e.name),co(),Sf("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),mr("aria-label","Edit "+e.name),co(3),Sf("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),mr("aria-label","Delete "+e.name);}}function ti(i,t){if(i&1&&OY(0,ei,9,8,"mat-option",5,Zt),i&2){let e=UY();NY(e.items());}}var De=class i extends ce{selectedApiKeyId=w1(null);apiKeySelected=APe();settingsService=_(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(he,t);}onEditApiKey(t,e){this.handleEdit(he,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Gt$1({type:i,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[Ft],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,n){e&1&&(Rr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Ho(3,"API Key"),Xr(),Rr(4,"mat-select",2),Ls("selectionChange",function(s){return n.onSelectionChange(s.value)}),Rr(5,"mat-select-trigger"),Ho(6),Xr(),Df(7,Jt,2,1,"mat-option",3)(8,ti,2,0),Xr()(),Rr(9,"button",4),Ls("click",function(s){return n.onAddApiKey(s)}),Rr(10,"mat-icon"),Ho(11,"add_circle"),Xr()()()),e&2&&(co(4),Sf("value",n.selectedApiKeyId())("disabled",n.disabled()),co(2),xw(" ",n.selectedItem()?.name," "),co(),wf(n.items().length===0?7:8),co(2),Sf("disabled",n.disabled()));},dependencies:[me,Wt$1,Be,zo,Lo,Po,Fe,WH,Wle,T9e,x9e,Yt$1,mt,PH],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function ii(i,t){i&1&&(Rr(0,"mat-error"),Ho(1,"Enter a supported MCP server address"),Xr());}function ni(i,t){if(i&1&&(Rr(0,"div",4),Ho(1),Xr()),i&2){let e=UY();co(),tB(e.errorMessage());}}var fe=class i{fb=_(K9e);dialogRef=_(Cp);connector=_(a8);data=_(XI,{optional:true});errorMessage=Xe(null);addressHint=this.connector.addressHint??"";addressValidator=t=>!t.value||this.connector.supports(t.value.trim())?null:{invalidUrl:true};form=this.fb.group({url:[this.data?.server?.url??"",[LR.required,this.addressValidator]]});onConfirm(){this.errorMessage.set(null);let t=this.form.controls.url.value.trim();this.dialogRef.close({url:t});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Gt$1({type:i,selectors:[["a2ui-composer-mcp-server-dialog"]],decls:15,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","mcp-server-url-input",3,"formControl","placeholder"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","button","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(Rr(0,"h2",0),Ho(1),Xr(),Rr(2,"mat-dialog-content")(3,"form",1),Ls("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),Rr(4,"mat-form-field",2)(5,"mat-label"),Ho(6,"Server URL"),Xr(),jL(7,"input",3),y5(),Df(8,ii,2,0,"mat-error"),Xr(),Df(9,ni,2,1,"div",4),Xr()(),Rr(10,"mat-dialog-actions",5)(11,"button",6),Ho(12,"Cancel"),Xr(),Rr(13,"button",7),Ls("click",function(){return n.onConfirm()}),Ho(14),Xr()()),e&2&&(co(),tB(n.data?.server?"Edit MCP Server":"Add MCP Server"),co(2),Sf("formGroup",n.form),co(4),Sf("formControl",n.form.controls.url)("placeholder",n.addressHint),_5(),co(),wf(n.form.controls.url.hasError("invalidUrl")?8:-1),co(),wf(n.errorMessage()?9:-1),co(4),Sf("disabled",n.form.invalid),co(),xw(" ",n.data?.server?"Save":"Add"," "));},dependencies:[Q9e,W9e,E8,Z9e,q9e,ZCe,JCe,PH,kH,OH,RH,NH,me,Wt$1,Be,Fi,Vr,zr,WH,JH],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ai=(i,t)=>t.id,ri=(i,t)=>t.name;function oi(i,t){if(i&1){let e=LY();Rr(0,"div",4)(1,"h3"),Ho(2,"Gemini API Provisioning"),Xr(),Rr(3,"a2ui-composer-api-key-selector",27),Ls("apiKeySelected",function(o){PP(e);let s=UY();return FP(s.onApiKeySelected(o))}),Xr()();}if(i&2){let e=UY();co(3),Sf("selectedApiKeyId",e.selectedApiKeyId());}}function li(i,t){i&1&&(Rr(0,"mat-card-footer",10),Ho(1," To obtain an API key: "),Rr(2,"ol")(3,"li"),Ho(4," Go to "),Rr(5,"a",28),Ho(6," Google AI Studio"),Xr(),Ho(7," and sign in with your Google account. "),Xr(),Rr(8,"li"),Ho(9,"Click Create API key."),Xr(),Rr(10,"li"),Ho(11,"Select or create a Google Cloud project when prompted, then click Create key."),Xr(),Rr(12,"li"),Ho(13,"Save your key in a secure location!"),Xr()(),Ho(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),Rr(15,"a",29),Ho(16,"Web Crypto API"),Xr(),Ho(17,". Neither Google nor anyone else has access to this key. "),Xr());}function di(i,t){if(i&1&&(Rr(0,"code"),Ho(1),Xr()),i&2){let e=UY();co(),xw("[System] Active renderer updated to ",e.activeRendererUrl());}}function si(i,t){if(i&1&&(Rr(0,"code",18),Ho(1),Xr()),i&2){let e=UY();co(),xw("[Catalog Error] ",e.catalogErrorMessage());}}function ci(i,t){i&1&&(Rr(0,"code",19),Ho(1,"[System] Catalog handshake completed successfully. Active catalog ready."),Xr());}function mi(i,t){i&1&&(Rr(0,"code"),Ho(1,"[System] Catalog handshake in progress. Indexing metadata..."),Xr());}function pi(i,t){i&1&&(Rr(0,"code"),Ho(1,"[System] Bridge connected. Initializing catalog handshake..."),Xr());}function gi(i,t){i&1&&(Rr(0,"code"),Ho(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),Xr());}function ui(i,t){i&1&&(Rr(0,"div",25),Ho(1,"No MCP servers configured \u2014 click + to add"),Xr());}function hi(i,t){if(i&1&&Ho(0),i&2){let e=UY().$implicit;xw(" Connected (",e.tools?.length||0," tools) ");}}function fi(i,t){i&1&&Ho(0," Connecting... ");}function _i(i,t){if(i&1&&Ho(0),i&2){let e=UY().$implicit;xw(" Error: ",e.errorMessage||"Failed to connect"," ");}}function vi(i,t){i&1&&Ho(0," Disconnected ");}function yi(i,t){if(i&1&&(Rr(0,"span",38),Ho(1),Xr()),i&2){let e=UY().$implicit;co(),tB(e.url);}}function bi(i,t){if(i&1&&(Rr(0,"span",44),Ho(1),Xr()),i&2){let e=t.$implicit;co(),tB(e.name);}}function Ci(i,t){if(i&1&&(Rr(0,"div",43),OY(1,bi,2,1,"span",44,ri),Xr()),i&2){let e=UY().$implicit;co(),NY(e.tools);}}function wi(i,t){if(i&1){let e=LY();Rr(0,"div",30)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),Ls("change",function(o){let s=PP(e).$implicit,v=UY(2);return FP(v.toggleMcpServer(s.id,o.checked))}),Xr(),Rr(4,"div",34)(5,"div",35)(6,"span",36),Ho(7),Xr(),Rr(8,"span",37),Df(9,hi,1,1)(10,fi,1,0)(11,_i,1,1)(12,vi,1,0),Xr()(),Df(13,yi,2,1,"span",38),Xr()(),Rr(14,"div",39)(15,"button",40),Ls("click",function(){let o=PP(e).$implicit,s=UY(2);return FP(s.testMcpServer(o.id))}),Ho(16," Test "),Xr(),Rr(17,"button",41),Ls("click",function(){let o=PP(e).$implicit,s=UY(2);return FP(s.openEditMcpServerDialog(o))}),Rr(18,"mat-icon",24),Ho(19,"edit"),Xr()(),Rr(20,"button",42),Ls("click",function(){let o=PP(e).$implicit,s=UY(2);return FP(s.removeMcpServer(o.id))}),Rr(21,"mat-icon",24),Ho(22,"delete"),Xr()()()(),Df(23,Ci,3,0,"div",43),Xr();}if(i&2){let e=t.$implicit;co(3),Sf("checked",e.enabled),mr("aria-label","Toggle "+(e.name||e.url)),co(4),tB(e.name||e.url),co(),mr("data-status",e.status),co(),wf(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),co(4),wf(e.name&&e.name!==e.url?13:-1),co(10),wf(e.tools&&e.tools.length>0?23:-1);}}function Mi(i,t){if(i&1&&(Rr(0,"div",26),OY(1,wi,24,7,"div",30,ai),Xr()),i&2){let e=UY();co(),NY(e.mcpManager.servers());}}var Kt=class i{fb=_(K9e);dialog=_(bp);destroyRef=_(cn);startupResolution=_(Lv);startupConfigState=_(uv);hostCommunication=_(c8);catalogManagement=_(se);configProvider=_(cu);settingsService=_(K);mcpManager=_(MC);is1PAuthEnabled=_(lv);selectedRendererId=Xe(null);selectedApiKeyId=ti$1(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=ti$1(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=Xe(false);isApiKeyProvidedByConfig=ti$1(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=ti$1(()=>this.isApiKeyProvidedByConfig());hideApiKey=Xe(true);forceThirdPartyAuth=Xe(false);bridgeConnected=ti$1(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=ti$1(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=ti$1(()=>this.catalogManagement.catalogError());activeRendererUrl=ti$1(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){$o(()=>{let t=this.settingsService.selectedRendererId()||"default";tn(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}openAddMcpServerDialog(){this.dialog.open(fe,{width:"450px"}).afterClosed().pipe(TGe(this.destroyRef)).subscribe(e=>{e?.url&&this.mcpManager.addServer(e.url);});}openEditMcpServerDialog(t){this.dialog.open(fe,{width:"450px",data:{server:t}}).afterClosed().pipe(TGe(this.destroyRef)).subscribe(n=>{n?.url&&this.mcpManager.updateServerUrl(t.id,n.url);});}async removeMcpServer(t){await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Gt$1({type:i,selectors:[["a2ui-composer-settings"]],decls:57,vars:13,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-card-header"],[1,"mcp-header-text"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click"],["aria-hidden","true"],[1,"mcp-empty-state"],[1,"mcp-server-list"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-item"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit MCP Server","aria-label","Edit MCP Server",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete MCP Server","aria-label","Delete MCP Server",1,"mcp-delete-btn",3,"click"],[1,"mcp-server-tools"],[1,"mcp-tool-name"]],template:function(e,n){e&1&&(Rr(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Ho(4,"A2UI Composer Settings"),Xr()(),Rr(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Ho(9,"Renderer"),Xr(),Rr(10,"a2ui-composer-renderer-selector",5),Ls("rendererSelected",function(s){return n.onRendererSelected(s)}),Xr()(),Df(11,oi,4,1,"div",4),Rr(12,"div",6)(13,"h3"),Ho(14,"Developer Authentication Overrides"),Xr(),Rr(15,"p",7),Ho(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),Xr(),Rr(17,"div",8)(18,"mat-slide-toggle",9),Ls("change",function(){return n.toggleForceThirdPartyAuth()}),Ho(19," Force External Third-Party Authentication Mode "),Xr()()()()(),Df(20,li,18,0,"mat-card-footer",10),Xr(),Rr(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Ho(24,"Connection Status & Diagnostics"),Xr(),Rr(25,"p",12),Ho(26,"Real-time monitoring bridge"),Xr()(),Rr(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Ho(31),Xr(),Rr(32,"mat-chip",15),Ho(33),Xr()()(),Rr(34,"div",16)(35,"h3"),Ho(36,"Overlay Logs Preview"),Xr(),Rr(37,"div",17),Df(38,di,2,1,"code"),Df(39,si,2,1,"code",18)(40,ci,2,0,"code",19)(41,mi,2,0,"code")(42,pi,2,0,"code")(43,gi,2,0,"code"),Xr()()()(),Rr(44,"mat-card",20)(45,"mat-card-header",21)(46,"div",22)(47,"h2",2),Ho(48,"MCP Servers"),Xr(),Rr(49,"p",12),Ho(50," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),Xr()(),Rr(51,"button",23),Ls("click",function(){return n.openAddMcpServerDialog()}),Rr(52,"mat-icon",24),Ho(53,"add_circle"),Xr()()(),Rr(54,"mat-card-content"),Df(55,ui,2,0,"div",25)(56,Mi,3,0,"div",26),Xr()()()),e&2&&(co(6),Sf("formGroup",n.settingsForm),co(4),Sf("selectedRendererId",n.selectedRendererId()),co(),wf(n.isThirdParty()?11:-1),co(),Sf("hidden",!n.is1PAuthEnabled),co(6),Sf("checked",n.forceThirdPartyAuth()),co(2),wf(n.isThirdParty()?20:-1),co(10),Sf("color",n.bridgeConnected()?"primary":"accent"),co(),xw("Bridge: ",n.bridgeConnected()?"Connected":"Disconnected"),co(),Sf("color",n.catalogStatus()==="Connected"?"primary":n.catalogStatus()==="Indexing"?"accent":n.catalogStatus()==="Error"?"warn":void 0),co(),xw("Catalog Handshake: ",n.catalogStatus()),co(5),wf(n.activeRendererUrl()?38:-1),co(),wf(n.catalogErrorMessage()?39:n.catalogStatus()==="Connected"?40:n.catalogStatus()==="Indexing"?41:n.bridgeConnected()?42:43),co(16),wf(n.mcpManager.servers().length===0?55:56));},dependencies:[Y9e,W9e,q9e,Q9e,JCe,me,Vr,WH,JH,Wle,T9e,x9e,E,F,k,z,T,S,j,ot,ki,ct,Tt,Te,Yt$1,mt,PH,Ae,De],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto}.settings-container[_ngcontent-%COMP%]{padding:24px;max-width:600px;margin:0 auto}.form-section[_ngcontent-%COMP%]{margin-top:16px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-card[_ngcontent-%COMP%]{margin-top:24px}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-lowest);color:var(--mat-sys-primary);padding:12px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:700}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-small-size, 12px);padding-left:24px;padding-bottom:12px}.mcp-card-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mcp-card-header[_ngcontent-%COMP%]     .mat-mdc-card-header-text{display:none}.mcp-card-header[_ngcontent-%COMP%]   .mcp-header-text[_ngcontent-%COMP%]{flex:1;min-width:0}.mcp-card-header[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0;margin-top:-4px;margin-right:-8px}.mcp-empty-state[_ngcontent-%COMP%]{margin-top:16px;padding:16px;text-align:center;font-size:13px;font-style:italic;color:var(--mat-sys-on-surface-variant);border-radius:8px;border:1px dashed var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-lowest)}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:4px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{Kt as Settings};