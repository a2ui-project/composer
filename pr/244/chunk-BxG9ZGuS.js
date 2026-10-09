import {v,cP as L8e,cQ as Ff,ao as Lt,l as lB,g as gv,$ as $Z,z as zl,cR as K,cS as pv,cT as cPe,A as Ae,W as Wt$1,G as Go,af as Qe,ad as nz,d as zt$1,aD as z8e,c9 as F8e,ca as M8e,c8 as $8e,cd as Qge,az as me,aB as Vr,i as ez,j as X1,T as Tie,k as B8e,m as g8e,cU as j1,S as Sr,s as Ai,H as Hr,q as xs,F as Fd,u as Qo,C as zd,L as Ld,D as dE,cV as Pf,cW as xZ,cX as Uw,c7 as jT,aE as tq,aF as N8e,cc as Kge,cY as M1,cZ as F1,c_ as z1,c$ as L1,aA as Wt$2,cg as Be,ci as Fi,aC as zr,t as jk,aH as q9,Y as Ym,aI as W9,R as Ye,U as qe,V as nr,Z as Ze,bl as Nf,aq as Wa,be as j$1,bv as To,bp as Ke,bD as Yr,bE as J1,bN as ig,cC as si,d0 as Vze,bZ as $n,bH as Rt,a0 as As,a1 as Vr$1,cs as C6,J as gn$1,y as lr,aj as Xo,d1 as qT,d2 as Wh,d3 as Mr,cH as ON,cN as $d,a2 as Hd,bj as Ud,a4 as Jm,a5 as Km,aT as AN,aU as BRe,ck as zo,cl as Lo,d4 as Po,cm as Fe,bc as Tt,a7 as h6,a9 as g6,a$ as s6,b0 as a6,cI as JA,a6 as Fe$1,d5 as Oi,a8 as PA,aa as FA}from'./main.js';import {E,F,k,z,T,S,j}from'./chunk-BBSh6iaV.js';import {o as ot,k as ki,c as ct}from'./chunk-VobYhF-Y.js';import {Y as Yt$1,m as mt}from'./chunk-CbUPB_Z3.js';var Kt=["*"],Dt=(()=>{class n{labelPosition="after";static \u0275fac=function(i){return new(i||n)};static \u0275cmp=zt$1({type:n,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(i,o){i&2&&gn$1("mdc-form-field--align-end",o.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Kt,decls:1,vars:0,template:function(i,o){i&1&&(As(),Vr$1(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return n})();var Nt=["switch"],zt=["*"];function Vt(n,t){n&1&&(Sr(0,"span",11),JA(),Sr(1,"svg",13),jk(2,"path",14),Hr(),Sr(3,"svg",15),jk(4,"path",16),Hr()());}var Gt=new j$1("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Pe=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Ee=(()=>{class n{_elementRef=v(Ze);_focusMonitor=v(Nf);_changeDetectorRef=v(Wa);defaults=v(Gt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Pe(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=To();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new Ke;toggleChange=new Ke;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){v(Yr).load(J1);let e=v(new ig("tabindex"),{optional:true}),i=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=i.color||"accent",this.id=this._uniqueId=v(si).getId("mat-mdc-slide-toggle-"),this.hideIcon=i.hideIcon??false,this.disabledInteractive=i.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Pe(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=zt$1({type:n,selectors:[["mat-slide-toggle"]],viewQuery:function(i,o){if(i&1&&Ud(Nt,5),i&2){let s;Jm(s=Km())&&(o._switchElement=s.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(i,o){i&2&&($d("id",o.id),lr("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),Hd(o.color?"mat-"+o.color:""),gn$1("mat-mdc-slide-toggle-focused",o._focused)("mat-mdc-slide-toggle-checked",o.checked)("_mat-animation-noopable",o._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",Rt],color:"color",disabled:[2,"disabled","disabled",Rt],disableRipple:[2,"disableRipple","disableRipple",Rt],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:ON(e)],checked:[2,"checked","checked",Rt],hideIcon:[2,"hideIcon","hideIcon",Rt],disabledInteractive:[2,"disabledInteractive","disabledInteractive",Rt]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[Xo([{provide:qT,useExisting:Mr(()=>n),multi:true},{provide:Wh,useExisting:n,multi:true}]),$n],ngContentSelectors:zt,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(i,o){if(i&1&&(As(),Sr(0,"div",1)(1,"button",2,0),xs("click",function(){return o._handleClick()}),jk(3,"div",3)(4,"span",4),Sr(5,"span",5)(6,"span",6)(7,"span",7),jk(8,"span",8),Hr(),Sr(9,"span",9),jk(10,"span",10),Hr(),Fd(11,Vt,5,0,"span",11),Hr()()(),Sr(12,"label",12),xs("click",function(v){return v.stopPropagation()}),Vr$1(13),Hr()()),i&2){let s=C6(2);zd("labelPosition",o.labelPosition),Qo(),gn$1("mdc-switch--selected",o.checked)("mdc-switch--unselected",!o.checked)("mdc-switch--checked",o.checked)("mdc-switch--disabled",o.disabled)("mat-mdc-slide-toggle-disabled-interactive",o.disabledInteractive),zd("tabIndex",o.disabled&&!o.disabledInteractive?-1:o.tabIndex)("disabled",o.disabled&&!o.disabledInteractive),lr("id",o.buttonId)("name",o.name)("aria-label",o.ariaLabel)("aria-labelledby",o._getAriaLabelledBy())("aria-describedby",o.ariaDescribedby)("aria-required",o.required||null)("aria-checked",o.checked)("aria-disabled",o.disabled&&o.disabledInteractive?"true":null),Qo(9),zd("matRippleTrigger",s)("matRippleDisabled",o.disableRipple||o.disabled)("matRippleCentered",true),Qo(),Ld(o.hideIcon?-1:11),Qo(),zd("for",o.buttonId),lr("id",o._labelId);}},dependencies:[Vze,Dt],styles:[`.mdc-switch {
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
`],encapsulation:2})}return n})(),Ot=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=Ye({type:n});static \u0275inj=qe({imports:[Ee,nr]})}return n})();function Bt(n,t){if(n&1&&(Sr(0,"div",5),Ai(1),Hr()),n&2){let e=g6();Qo(),Ym(e.errorMessage());}}function Ut(n){let t=n.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var pe=class n{fb=v(L8e);settingsService=v(K);dialogRef=v(Pf);data=v(Uw,{optional:true});errorMessage=Ae(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[jT.required,jT.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[jT.required,Ut]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),i=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:i,name:t,rendererUrl:e}),this.dialogRef.close(i);}catch(o){this.errorMessage.set(o instanceof Error?o.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=zt$1({type:n,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:7,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","placeholder","My Renderer",3,"formControl"],["matInput","","id","renderer-url-input","placeholder","http://localhost:3000",3,"formControl"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(Sr(0,"h2",0),Ai(1),Hr(),Sr(2,"mat-dialog-content")(3,"form",1),xs("ngSubmit",function(s){return s.preventDefault(),i.onConfirm()}),Sr(4,"mat-form-field",2)(5,"mat-label"),Ai(6,"Name"),Hr(),jk(7,"input",3),q9(),Hr(),Sr(8,"mat-form-field",2)(9,"mat-label"),Ai(10,"Renderer URL"),Hr(),jk(11,"input",4),q9(),Hr(),Fd(12,Bt,2,1,"div",5),Hr()(),Sr(13,"mat-dialog-actions",6)(14,"button",7),Ai(15,"Cancel"),Hr(),Sr(16,"button",8),xs("click",function(){return i.onConfirm()}),Ai(17),Hr()()),e&2&&(Qo(),Ym(i.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),Qo(2),zd("formGroup",i.form),Qo(4),zd("formControl",i.form.controls.name),W9(),Qo(4),zd("formControl",i.form.controls.rendererUrl),W9(),Qo(),Ld(i.errorMessage()?12:-1),Qo(4),zd("disabled",i.form.invalid),Qo(),dE(" ",i.data?.renderer?"Save":"Add"," "));},dependencies:[$8e,F8e,tq,N8e,M8e,Kge,Qge,j1,M1,F1,z1,L1,me,Wt$2,Be,Vr,zr,ez,X1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ce=class n{disabled=AN(false);dialog=v(Ff);destroyRef=v(Lt);items=Ae([]);selectedItem=Wt$1(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(nz(this.destroyRef)).subscribe(async o=>{o&&(await this.refreshItems(),this.emitSelection(o));});}async handleEdit(t,e,i,o){if(e.stopPropagation(),e.preventDefault(),i.readOnly)return;this.dialog.open(t,{width:"450px",data:{[o]:i}}).afterClosed().pipe(nz(this.destroyRef)).subscribe(async v=>{v&&(await this.refreshItems(),this.getSelectedId()===v&&this.emitSelection(v));});}async handleDelete(t,e,i=null){t.stopPropagation(),t.preventDefault(),!this.items().find(s=>s.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(i));}static \u0275fac=function(e){return new(e||n)};static \u0275dir=Fe$1({type:n,inputs:{disabled:[1,"disabled"]}})};var qt=(n,t)=>t.id;function Ht(n,t){if(n&1&&(Sr(0,"span",5),Ai(1),Hr()),n&2){let e=g6();Qo(),Ym(e.selectedItem()?.rendererUrl);}}function jt(n,t){n&1&&(Sr(0,"mat-option",6),Ai(1,"No items available \u2014 click + to add"),Hr()),n&2&&zd("disabled",true);}function Xt(n,t){if(n&1){let e=h6();Sr(0,"mat-option",8)(1,"div",9)(2,"div",10),Ai(3),Hr(),Sr(4,"div",5),Ai(5),Hr()(),Sr(6,"button",11),xs("click",function(o){let s=PA(e).$implicit,v=g6(2);return FA(v.onEditRenderer(o,s))})("keydown",function(o){return o.stopPropagation()}),Sr(7,"mat-icon",12),Ai(8,"edit"),Hr()(),Sr(9,"button",13),xs("click",function(o){let s=PA(e).$implicit,v=g6(2);return FA(v.onDeleteRenderer(o,s.id))})("keydown",function(o){return o.stopPropagation()}),Sr(10,"mat-icon",12),Ai(11,"delete"),Hr()()();}if(n&2){let e=t.$implicit;zd("value",e.id),Qo(3),Ym(e.name),Qo(2),Ym(e.rendererUrl),Qo(),zd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),lr("aria-label","Edit "+e.name),Qo(3),zd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),lr("aria-label","Delete "+e.name);}}function Wt(n,t){if(n&1&&s6(0,Xt,12,9,"mat-option",8,qt),n&2){let e=g6();a6(e.items());}}var Ie=class n extends ce{selectedRendererId=AN("default");rendererSelected=BRe();settingsService=v(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(pe,t);}onEditRenderer(t,e){this.handleEdit(pe,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=zt$1({type:n,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[Tt],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,i){e&1&&(Sr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Ai(3,"Renderer"),Hr(),Sr(4,"mat-select",2),xs("selectionChange",function(s){return i.onSelectionChange(s.value)}),Sr(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Ai(8),Hr(),Fd(9,Ht,2,1,"span",5),Hr()(),Fd(10,jt,2,1,"mat-option",6)(11,Wt,2,0),Hr()(),Sr(12,"button",7),xs("click",function(s){return i.onAddRenderer(s)}),Sr(13,"mat-icon"),Ai(14,"add_circle"),Hr()()()),e&2&&(Qo(4),zd("value",i.selectedRendererId())("disabled",i.disabled()),Qo(4),Ym(i.selectedItem()?.name),Qo(),Ld(i.selectedItem()?.rendererUrl?9:-1),Qo(),Ld(i.items().length===0?10:11),Qo(2),zd("disabled",i.disabled()));},dependencies:[me,Wt$2,Be,zo,Lo,Po,Fe,ez,Tie,B8e,g8e,Yt$1,mt,j1],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function Qt(n,t){if(n&1&&(Sr(0,"div",7),Ai(1),Hr()),n&2){let e=g6();Qo(),Ym(e.errorMessage());}}var he=class n{fb=v(L8e);settingsService=v(K);dialogRef=v(Pf);data=v(Uw,{optional:true});errorMessage=Ae(null);hideApiKey=Ae(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[jT.required,jT.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[jT.required,jT.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),i=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(i,t,e),this.dialogRef.close(i);}catch(o){this.errorMessage.set(o instanceof Error?o.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=zt$1({type:n,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:10,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","placeholder","My Gemini Key",3,"formControl"],["matInput","","id","api-key-value-input","placeholder","Paste your API key here",3,"type","formControl"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(Sr(0,"h2",0),Ai(1),Hr(),Sr(2,"mat-dialog-content")(3,"form",1),xs("ngSubmit",function(s){return s.preventDefault(),i.onConfirm()}),Sr(4,"mat-form-field",2)(5,"mat-label"),Ai(6,"Name"),Hr(),jk(7,"input",3),q9(),Hr(),Sr(8,"mat-form-field",2)(9,"mat-label"),Ai(10,"API Key"),Hr(),jk(11,"input",4),q9(),Sr(12,"button",5),xs("click",function(){return i.toggleHideApiKey()}),Sr(13,"mat-icon",6),Ai(14),Hr()()(),Fd(15,Qt,2,1,"div",7),Hr()(),Sr(16,"mat-dialog-actions",8)(17,"button",9),Ai(18,"Cancel"),Hr(),Sr(19,"button",10),xs("click",function(){return i.onConfirm()}),Ai(20),Hr()()),e&2&&(Qo(),Ym(i.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),Qo(2),zd("formGroup",i.form),Qo(4),zd("formControl",i.form.controls.name),W9(),Qo(4),zd("type",i.hideApiKey()?"password":"text")("formControl",i.form.controls.apiKey),W9(),Qo(),lr("aria-label",i.hideApiKey()?"Show API key":"Hide API key"),Qo(2),Ym(i.hideApiKey()?"visibility":"visibility_off"),Qo(),Ld(i.errorMessage()?15:-1),Qo(4),zd("disabled",i.form.invalid),Qo(),dE(" ",i.data?.apiKey?"Save":"Add"," "));},dependencies:[$8e,F8e,tq,N8e,M8e,Kge,Qge,j1,M1,F1,z1,L1,me,Wt$2,Be,Oi,Vr,zr,ez,X1,Tie,B8e,g8e],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var Yt=(n,t)=>t.id;function Zt(n,t){n&1&&(Sr(0,"mat-option",3),Ai(1,"No items available \u2014 click + to add"),Hr()),n&2&&zd("disabled",true);}function Jt(n,t){if(n&1){let e=h6();Sr(0,"mat-option",5)(1,"span",6),Ai(2),Hr(),Sr(3,"button",7),xs("keydown",function(o){return o.stopPropagation()})("click",function(o){let s=PA(e).$implicit,v=g6(2);return FA(v.onEditApiKey(o,s))}),Sr(4,"mat-icon",8),Ai(5,"edit"),Hr()(),Sr(6,"button",9),xs("keydown",function(o){return o.stopPropagation()})("click",function(o){let s=PA(e).$implicit,v=g6(2);return FA(v.onDeleteApiKey(o,s.id))}),Sr(7,"mat-icon",8),Ai(8,"delete"),Hr()()();}if(n&2){let e=t.$implicit;zd("value",e.id),Qo(2),Ym(e.name),Qo(),zd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),lr("aria-label","Edit "+e.name),Qo(3),zd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),lr("aria-label","Delete "+e.name);}}function en(n,t){if(n&1&&s6(0,Jt,9,8,"mat-option",5,Yt),n&2){let e=g6();a6(e.items());}}var De=class n extends ce{selectedApiKeyId=AN(null);apiKeySelected=BRe();settingsService=v(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(he,t);}onEditApiKey(t,e){this.handleEdit(he,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=zt$1({type:n,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[Tt],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,i){e&1&&(Sr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Ai(3,"API Key"),Hr(),Sr(4,"mat-select",2),xs("selectionChange",function(s){return i.onSelectionChange(s.value)}),Sr(5,"mat-select-trigger"),Ai(6),Hr(),Fd(7,Zt,2,1,"mat-option",3)(8,en,2,0),Hr()(),Sr(9,"button",4),xs("click",function(s){return i.onAddApiKey(s)}),Sr(10,"mat-icon"),Ai(11,"add_circle"),Hr()()()),e&2&&(Qo(4),zd("value",i.selectedApiKeyId())("disabled",i.disabled()),Qo(2),dE(" ",i.selectedItem()?.name," "),Qo(),Ld(i.items().length===0?7:8),Qo(2),zd("disabled",i.disabled()));},dependencies:[me,Wt$2,Be,zo,Lo,Po,Fe,ez,Tie,B8e,g8e,Yt$1,mt,j1],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function tn(n,t){n&1&&(Sr(0,"mat-error"),Ai(1,"Enter a supported MCP server address"),Hr());}function nn(n,t){if(n&1&&(Sr(0,"div",4),Ai(1),Hr()),n&2){let e=g6();Qo(),Ym(e.errorMessage());}}var fe=class n{fb=v(L8e);dialogRef=v(Pf);connector=v(xZ);data=v(Uw,{optional:true});errorMessage=Ae(null);addressHint=this.connector.addressHint??"";addressValidator=t=>!t.value||this.connector.supports(t.value.trim())?null:{invalidUrl:true};form=this.fb.group({url:[this.data?.server?.url??"",[jT.required,this.addressValidator]]});onConfirm(){this.errorMessage.set(null);let t=this.form.controls.url.value.trim();this.dialogRef.close({url:t});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=zt$1({type:n,selectors:[["a2ui-composer-mcp-server-dialog"]],decls:15,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","mcp-server-url-input",3,"formControl","placeholder"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","button","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(Sr(0,"h2",0),Ai(1),Hr(),Sr(2,"mat-dialog-content")(3,"form",1),xs("ngSubmit",function(s){return s.preventDefault(),i.onConfirm()}),Sr(4,"mat-form-field",2)(5,"mat-label"),Ai(6,"Server URL"),Hr(),jk(7,"input",3),q9(),Fd(8,tn,2,0,"mat-error"),Hr(),Fd(9,nn,2,1,"div",4),Hr()(),Sr(10,"mat-dialog-actions",5)(11,"button",6),Ai(12,"Cancel"),Hr(),Sr(13,"button",7),xs("click",function(){return i.onConfirm()}),Ai(14),Hr()()),e&2&&(Qo(),Ym(i.data?.server?"Edit MCP Server":"Add MCP Server"),Qo(2),zd("formGroup",i.form),Qo(4),zd("formControl",i.form.controls.url)("placeholder",i.addressHint),W9(),Qo(),Ld(i.form.controls.url.hasError("invalidUrl")?8:-1),Qo(),Ld(i.errorMessage()?9:-1),Qo(4),zd("disabled",i.form.invalid),Qo(),dE(" ",i.data?.server?"Save":"Add"," "));},dependencies:[$8e,F8e,tq,N8e,M8e,Kge,Qge,j1,M1,F1,z1,L1,me,Wt$2,Be,Fi,Vr,zr,ez,X1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var an=(n,t)=>t.id,rn=(n,t)=>t.name;function on(n,t){if(n&1){let e=h6();Sr(0,"div",4)(1,"h3"),Ai(2,"Gemini API Provisioning"),Hr(),Sr(3,"a2ui-composer-api-key-selector",27),xs("apiKeySelected",function(o){PA(e);let s=g6();return FA(s.onApiKeySelected(o))}),Hr()();}if(n&2){let e=g6();Qo(3),zd("selectedApiKeyId",e.selectedApiKeyId());}}function ln(n,t){n&1&&(Sr(0,"mat-card-footer",10),Ai(1," To obtain an API key: "),Sr(2,"ol")(3,"li"),Ai(4," Go to "),Sr(5,"a",28),Ai(6," Google AI Studio"),Hr(),Ai(7," and sign in with your Google account. "),Hr(),Sr(8,"li"),Ai(9,"Click Create API key."),Hr(),Sr(10,"li"),Ai(11,"Select or create a Google Cloud project when prompted, then click Create key."),Hr(),Sr(12,"li"),Ai(13,"Save your key in a secure location!"),Hr()(),Ai(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),Sr(15,"a",29),Ai(16,"Web Crypto API"),Hr(),Ai(17,". Neither Google nor anyone else has access to this key. "),Hr());}function dn(n,t){if(n&1&&(Sr(0,"code"),Ai(1),Hr()),n&2){let e=g6();Qo(),dE("[System] Active renderer updated to ",e.activeRendererUrl());}}function sn(n,t){if(n&1&&(Sr(0,"code",18),Ai(1),Hr()),n&2){let e=g6();Qo(),dE("[Catalog Error] ",e.catalogErrorMessage());}}function cn(n,t){n&1&&(Sr(0,"code",19),Ai(1,"[System] Catalog handshake completed successfully. Active catalog ready."),Hr());}function mn(n,t){n&1&&(Sr(0,"code"),Ai(1,"[System] Catalog handshake in progress. Indexing metadata..."),Hr());}function pn(n,t){n&1&&(Sr(0,"code"),Ai(1,"[System] Bridge connected. Initializing catalog handshake..."),Hr());}function gn(n,t){n&1&&(Sr(0,"code"),Ai(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),Hr());}function un(n,t){n&1&&(Sr(0,"div",25),Ai(1,"No MCP servers configured \u2014 click + to add"),Hr());}function hn(n,t){if(n&1&&Ai(0),n&2){let e=g6().$implicit;dE(" Connected (",e.tools?.length||0," tools) ");}}function fn(n,t){n&1&&Ai(0," Connecting... ");}function _n(n,t){if(n&1&&Ai(0),n&2){let e=g6().$implicit;dE(" Error: ",e.errorMessage||"Failed to connect"," ");}}function vn(n,t){n&1&&Ai(0," Disconnected ");}function yn(n,t){if(n&1&&(Sr(0,"span",38),Ai(1),Hr()),n&2){let e=g6().$implicit;Qo(),Ym(e.url);}}function bn(n,t){if(n&1&&(Sr(0,"span",44),Ai(1),Hr()),n&2){let e=t.$implicit;Qo(),Ym(e.name);}}function Cn(n,t){if(n&1&&(Sr(0,"div",43),s6(1,bn,2,1,"span",44,rn),Hr()),n&2){let e=g6().$implicit;Qo(),a6(e.tools);}}function wn(n,t){if(n&1){let e=h6();Sr(0,"div",30)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),xs("change",function(o){let s=PA(e).$implicit,v=g6(2);return FA(v.toggleMcpServer(s.id,o.checked))}),Hr(),Sr(4,"div",34)(5,"div",35)(6,"span",36),Ai(7),Hr(),Sr(8,"span",37),Fd(9,hn,1,1)(10,fn,1,0)(11,_n,1,1)(12,vn,1,0),Hr()(),Fd(13,yn,2,1,"span",38),Hr()(),Sr(14,"div",39)(15,"button",40),xs("click",function(){let o=PA(e).$implicit,s=g6(2);return FA(s.testMcpServer(o.id))}),Ai(16," Test "),Hr(),Sr(17,"button",41),xs("click",function(){let o=PA(e).$implicit,s=g6(2);return FA(s.openEditMcpServerDialog(o))}),Sr(18,"mat-icon",24),Ai(19,"edit"),Hr()(),Sr(20,"button",42),xs("click",function(){let o=PA(e).$implicit,s=g6(2);return FA(s.removeMcpServer(o.id))}),Sr(21,"mat-icon",24),Ai(22,"delete"),Hr()()()(),Fd(23,Cn,3,0,"div",43),Hr();}if(n&2){let e=t.$implicit;Qo(3),zd("checked",e.enabled),lr("aria-label","Toggle "+(e.name||e.url)),Qo(4),Ym(e.name||e.url),Qo(),lr("data-status",e.status),Qo(),Ld(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),Qo(4),Ld(e.name&&e.name!==e.url?13:-1),Qo(10),Ld(e.tools&&e.tools.length>0?23:-1);}}function Mn(n,t){if(n&1&&(Sr(0,"div",26),s6(1,wn,24,7,"div",30,an),Hr()),n&2){let e=g6();Qo(),a6(e.mcpManager.servers());}}var Ft=class n{fb=v(L8e);dialog=v(Ff);destroyRef=v(Lt);startupConfigState=v(lB);hostCommunication=v(gv);catalogManagement=v($Z);configProvider=v(zl);settingsService=v(K);mcpManager=v(pv);is1PAuthEnabled=v(cPe);selectedRendererId=Ae(null);selectedApiKeyId=Wt$1(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=Wt$1(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdPartyAuth=Wt$1(()=>this.configProvider.authType()==="3p");isApiKeyProvidedByConfig=Wt$1(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=Wt$1(()=>this.isApiKeyProvidedByConfig());hideApiKey=Ae(true);forceThirdPartyAuth=Ae(false);bridgeConnected=Wt$1(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=Wt$1(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=Wt$1(()=>this.catalogManagement.catalogError());activeRendererUrl=Wt$1(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){Go(()=>{let t=this.settingsService.selectedRendererId()||"default";Qe(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey(),this.forceThirdPartyAuth.set(this.isThirdPartyAuth());}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p");}openAddMcpServerDialog(){this.dialog.open(fe,{width:"450px"}).afterClosed().pipe(nz(this.destroyRef)).subscribe(e=>{e?.url&&this.mcpManager.addServer(e.url);});}openEditMcpServerDialog(t){this.dialog.open(fe,{width:"450px",data:{server:t}}).afterClosed().pipe(nz(this.destroyRef)).subscribe(i=>{i?.url&&this.mcpManager.updateServerUrl(t.id,i.url);});}async removeMcpServer(t){await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=zt$1({type:n,selectors:[["a2ui-composer-settings"]],decls:57,vars:13,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-card-header"],[1,"mcp-header-text"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click"],["aria-hidden","true"],[1,"mcp-empty-state"],[1,"mcp-server-list"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-item"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit MCP Server","aria-label","Edit MCP Server",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete MCP Server","aria-label","Delete MCP Server",1,"mcp-delete-btn",3,"click"],[1,"mcp-server-tools"],[1,"mcp-tool-name"]],template:function(e,i){e&1&&(Sr(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Ai(4,"A2UI Composer Settings"),Hr()(),Sr(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Ai(9,"Renderer"),Hr(),Sr(10,"a2ui-composer-renderer-selector",5),xs("rendererSelected",function(s){return i.onRendererSelected(s)}),Hr()(),Fd(11,on,4,1,"div",4),Sr(12,"div",6)(13,"h3"),Ai(14,"Developer Authentication Overrides"),Hr(),Sr(15,"p",7),Ai(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),Hr(),Sr(17,"div",8)(18,"mat-slide-toggle",9),xs("change",function(){return i.toggleForceThirdPartyAuth()}),Ai(19," Force External Third-Party Authentication Mode "),Hr()()()()(),Fd(20,ln,18,0,"mat-card-footer",10),Hr(),Sr(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Ai(24,"Connection Status & Diagnostics"),Hr(),Sr(25,"p",12),Ai(26,"Real-time monitoring bridge"),Hr()(),Sr(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Ai(31),Hr(),Sr(32,"mat-chip",15),Ai(33),Hr()()(),Sr(34,"div",16)(35,"h3"),Ai(36,"Overlay Logs Preview"),Hr(),Sr(37,"div",17),Fd(38,dn,2,1,"code"),Fd(39,sn,2,1,"code",18)(40,cn,2,0,"code",19)(41,mn,2,0,"code")(42,pn,2,0,"code")(43,gn,2,0,"code"),Hr()()()(),Sr(44,"mat-card",20)(45,"mat-card-header",21)(46,"div",22)(47,"h2",2),Ai(48,"MCP Servers"),Hr(),Sr(49,"p",12),Ai(50," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),Hr()(),Sr(51,"button",23),xs("click",function(){return i.openAddMcpServerDialog()}),Sr(52,"mat-icon",24),Ai(53,"add_circle"),Hr()()(),Sr(54,"mat-card-content"),Fd(55,un,2,0,"div",25)(56,Mn,3,0,"div",26),Hr()()()),e&2&&(Qo(6),zd("formGroup",i.settingsForm),Qo(4),zd("selectedRendererId",i.selectedRendererId()),Qo(),Ld(i.isThirdPartyAuth()?11:-1),Qo(),zd("hidden",!i.is1PAuthEnabled),Qo(6),zd("checked",i.forceThirdPartyAuth()),Qo(2),Ld(i.isThirdPartyAuth()?20:-1),Qo(10),zd("color",i.bridgeConnected()?"primary":"accent"),Qo(),dE("Bridge: ",i.bridgeConnected()?"Connected":"Disconnected"),Qo(),zd("color",i.catalogStatus()==="Connected"?"primary":i.catalogStatus()==="Indexing"?"accent":i.catalogStatus()==="Error"?"warn":void 0),Qo(),dE("Catalog Handshake: ",i.catalogStatus()),Qo(5),Ld(i.activeRendererUrl()?38:-1),Qo(),Ld(i.catalogErrorMessage()?39:i.catalogStatus()==="Connected"?40:i.catalogStatus()==="Indexing"?41:i.bridgeConnected()?42:43),Qo(16),Ld(i.mcpManager.servers().length===0?55:56));},dependencies:[z8e,F8e,M8e,$8e,Qge,me,Vr,ez,X1,Tie,B8e,g8e,E,F,k,z,T,S,j,ot,ki,ct,Ot,Ee,Yt$1,mt,j1,Ie,De],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto;container-type:inline-size;container-name:settings}.settings-container[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,1fr);align-items:start;gap:24px;padding:32px;max-width:1180px;margin:0 auto}.settings-card[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]{min-width:0;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface)}.settings-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]{padding:28px 28px 8px}.settings-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{padding:0 28px 28px}.settings-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0;font:var(--mat-sys-title-large);letter-spacing:var(--mat-sys-title-large-tracking)}.settings-card[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:8px 0 0;font:var(--mat-sys-body-medium);letter-spacing:var(--mat-sys-body-medium-tracking);color:var(--mat-sys-on-surface-variant)}.form-section[_ngcontent-%COMP%]{margin-top:24px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:0 0 12px;font:var(--mat-sys-title-small);letter-spacing:var(--mat-sys-title-small-tracking)}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);color:var(--mat-sys-on-surface-variant);padding:16px;border-radius:12px;overflow-wrap:anywhere;font:var(--mat-sys-body-small);font-family:Spline Sans Mono,monospace;letter-spacing:var(--mat-sys-body-small-tracking)}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{display:block;font-family:inherit}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] + code[_ngcontent-%COMP%]{margin-top:8px}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:var(--mat-sys-label-large-weight-prominent)}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-primary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{padding:24px 28px;border-top:1px solid var(--mat-sys-outline-variant);font:var(--mat-sys-body-small);letter-spacing:var(--mat-sys-body-small-tracking);color:var(--mat-sys-on-surface-variant)}.get-api-key[_ngcontent-%COMP%]   ol[_ngcontent-%COMP%]{padding-left:20px}.get-api-key[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--mat-sys-primary);text-underline-offset:3px}@container settings (min-width: 980px){.settings-container[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}.settings-card[_ngcontent-%COMP%]{grid-column:1;grid-row:1/span 2}.status-card[_ngcontent-%COMP%]{grid-column:2}}@container settings (max-width: 600px){.settings-container[_ngcontent-%COMP%]{padding:16px;gap:16px}.settings-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]{padding:20px 20px 8px}.settings-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{padding:0 20px 20px}.get-api-key[_ngcontent-%COMP%]{padding:20px}}.mcp-card-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mcp-card-header[_ngcontent-%COMP%]     .mat-mdc-card-header-text{display:none}.mcp-card-header[_ngcontent-%COMP%]   .mcp-header-text[_ngcontent-%COMP%]{flex:1;min-width:0}.mcp-card-header[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0;margin-top:-4px;margin-right:-8px}.mcp-empty-state[_ngcontent-%COMP%]{margin-top:16px;padding:16px;text-align:center;font-size:13px;font-style:italic;color:var(--mat-sys-on-surface-variant);border-radius:8px;border:1px dashed var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-lowest)}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:4px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{Ft as Settings};