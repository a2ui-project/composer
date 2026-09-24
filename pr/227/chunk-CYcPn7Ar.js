import {E,F,k as k$1,z,T,S,j}from'./chunk-DVqxFTUG.js';import {_,F as FB,c as cB,M as tZ,s as se,V as Vu,ao as fv,y as yt,ct as aB,N as Nd,b as $a,a0 as Ri,l as ln,Y as Y1,K as K1,H as Hoe,f as br,g as Oi$1,h as $r,z as zm,x as xd,ah as k3,aJ as j8,i as Ko,k as kd,o as Td,W as Wb,n as x6,ai as O3,aL as H8,q as qr,cu as wB,$ as $s,X,aq as f,p as pe,R as Rt,t as xt,v as wo,B as pt,ba as Ef,a9 as Jm,b4 as V,bl as qi,be as bt,bs as Wr,bt as G1,bC as RR,c7 as ui$1,cv as c1e,bK as qo,bw as dn,C as mu,u as uR,D as ei,aN as t6,m as zr,j as Xo,a4 as Kb,cw as Xl,cb as UR,cr as Ad,J as Jb,b8 as Rd,G as jm,I as Hm,aw as jR,ax as ZTe,ar as xL,b2 as Kn,U as Um,aE as J8,av as Y8,cc as Dk,an as Mf,a7 as Bn,S as Rze,L as Tt,cx as Nf,az as Zw,aA as bL,aB as DL,aC as SL,aD as wL,aF as lk,aG as dk}from'./main.js';import {k as ki$1,E as Et$1,x as xi$2,a as xn,b as Cn,c as wn,r as re$1}from'./chunk-DUSmlmIN.js';import {Y as Yt,m as mt}from'./chunk-BX95WPiB.js';import {m as me,n as nt,d as de,D as Dn,R as Rn$1,P as Pt}from'./chunk-kIz0cJgH.js';import'./chunk-CQAw1Ksh.js';import {O as Oi,x as xi$1,N as Ni,E as Et,F as Fi,I as Ii$1,R as Rn,b as Ri$1,U as Un,l as li$1,a as ai$1,T as Te,K,w as we,k as kn}from'./chunk-CEwWqfBP.js';var jt=["*"],Nt=(()=>{class r{labelPosition="after";static \u0275fac=function(i){return new(i||r)};static \u0275cmp=ln({type:r,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(i,n){i&2&&zr("mdc-form-field--align-end",n.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:jt,decls:1,vars:0,template:function(i,n){i&1&&(mu(),ei(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return r})();var qt=["switch"],Ht=["*"];function Wt(r,t){r&1&&(br(0,"span",11),Dk(),br(1,"svg",13),uR(2,"path",14),$r(),br(3,"svg",15),uR(4,"path",16),$r()());}var Xt=new V("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Me=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},De=(()=>{class r{_elementRef=_(pt);_focusMonitor=_(Ef);_changeDetectorRef=_(Jm);defaults=_(Xt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Me(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=qi();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new bt;toggleChange=new bt;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){_(Wr).load(G1);let e=_(new RR("tabindex"),{optional:true}),i=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=i.color||"accent",this.id=this._uniqueId=_(ui$1).getId("mat-mdc-slide-toggle-"),this.hideIcon=i.hideIcon??false,this.disabledInteractive=i.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Me(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(i){return new(i||r)};static \u0275cmp=ln({type:r,selectors:[["mat-slide-toggle"]],viewQuery:function(i,n){if(i&1&&Rd(qt,5),i&2){let d;jm(d=Hm())&&(n._switchElement=d.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(i,n){i&2&&(Ad("id",n.id),Xo("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),Jb(n.color?"mat-"+n.color:""),zr("mat-mdc-slide-toggle-focused",n._focused)("mat-mdc-slide-toggle-checked",n.checked)("_mat-animation-noopable",n._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",dn],color:"color",disabled:[2,"disabled","disabled",dn],disableRipple:[2,"disableRipple","disableRipple",dn],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:UR(e)],checked:[2,"checked","checked",dn],hideIcon:[2,"hideIcon","hideIcon",dn],disabledInteractive:[2,"disabledInteractive","disabledInteractive",dn]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[Kb([{provide:Te,useExisting:Xl(()=>r),multi:true},{provide:K,useExisting:r,multi:true}]),qo],ngContentSelectors:Ht,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(i,n){if(i&1&&(mu(),br(0,"div",1)(1,"button",2,0),zm("click",function(){return n._handleClick()}),uR(3,"div",3)(4,"span",4),br(5,"span",5)(6,"span",6)(7,"span",7),uR(8,"span",8),$r(),br(9,"span",9),uR(10,"span",10),$r(),xd(11,Wt,5,0,"span",11),$r()()(),br(12,"label",12),zm("click",function(u){return u.stopPropagation()}),ei(13),$r()()),i&2){let d=t6(2);kd("labelPosition",n.labelPosition),Ko(),zr("mdc-switch--selected",n.checked)("mdc-switch--unselected",!n.checked)("mdc-switch--checked",n.checked)("mdc-switch--disabled",n.disabled)("mat-mdc-slide-toggle-disabled-interactive",n.disabledInteractive),kd("tabIndex",n.disabled&&!n.disabledInteractive?-1:n.tabIndex)("disabled",n.disabled&&!n.disabledInteractive),Xo("id",n.buttonId)("name",n.name)("aria-label",n.ariaLabel)("aria-labelledby",n._getAriaLabelledBy())("aria-describedby",n.ariaDescribedby)("aria-required",n.required||null)("aria-checked",n.checked)("aria-disabled",n.disabled&&n.disabledInteractive?"true":null),Ko(9),kd("matRippleTrigger",d)("matRippleDisabled",n.disableRipple||n.disabled)("matRippleCentered",true),Ko(),Td(n.hideIcon?-1:11),Ko(),kd("for",n.buttonId),Xo("id",n._labelId);}},dependencies:[c1e,Nt],styles:[`.mdc-switch {
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
`],encapsulation:2})}return r})(),Ut=(()=>{class r{static \u0275fac=function(i){return new(i||r)};static \u0275mod=Rt({type:r});static \u0275inj=xt({imports:[De,wo]})}return r})();var k=class r{logger=_(qr).withTag("[Settings]");startupResolution=_(FB);startupConfigState=_(cB);configProvider=_(Vu);secureCredentialsStorage=_(wB);localStorageInteractions=_($s);usageTrackingService=_(X);renderers=Nd(()=>this.startupConfigState.renderers());selectedRendererId=Nd(()=>this.startupConfigState.selectedRendererId());activeRenderer=Nd(()=>this.startupConfigState.activeRenderer());async selectRenderer(t){let e=this.selectedRendererId();if(!await this.startupResolution.setSelectedRendererId(t))return  false;this.usageTrackingService.trackRendererSwitch({fromRendererId:e,toRendererId:t||""}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_renderer",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer");let n=this.activeRenderer();n?.rendererUrl?this.configProvider.setRendererUrl(n.rendererUrl):this.configProvider.setRendererUrl("");let d=typeof n?.apiKey=="string"?n.apiKey.trim():"";if(d)this.configProvider.setApiKeyFromConfig(d);else try{await this.syncEffectiveApiKeyToConfigProvider();}catch(u){this.logger.warn("Failed to resolve effective API key during renderer selection:",u);}return  true}_selectedApiKeyId=yt(this.localStorageInteractions.getItem("a2ui_composer_selected_api_key")||null);selectedApiKeyId=Nd(()=>{let t=this._selectedApiKeyId();return t||((this.startupConfigState.apiKeys()||{}).default!==void 0?"default":null)});_effectiveApiKey=yt("");effectiveApiKey=this._effectiveApiKey.asReadonly();getStaticApiKeys(){return this.startupConfigState.apiKeys()||{}}async getAvailableApiKeys(){let t=this.getStaticApiKeys(),e=Object.entries(t).map(([d,u])=>({id:d,name:u.displayName||d,key:u.apiKey||"",readOnly:true})),n=(await this.secureCredentialsStorage.getCustomApiKeys()).filter(d=>!Object.prototype.hasOwnProperty.call(t,d.id)).map(d=>({id:d.id,name:d.name,key:d.key,readOnly:false}));return [...e,...n]}async selectApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"select"}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_api_key",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_api_key"),this._selectedApiKeyId.set(t),await this.syncEffectiveApiKeyToConfigProvider();}async getEffectiveApiKey(){let t=this.selectedApiKeyId(),e=this.getStaticApiKeys();if(t&&e[t]){let d=e[t].apiKey||"";return this._effectiveApiKey.set(d),d}if(t){let d=await this.secureCredentialsStorage.getCustomApiKey(t);return d?(this._effectiveApiKey.set(d.key),d.key):(this._effectiveApiKey.set(""),"")}let i=await this.secureCredentialsStorage.getCustomApiKeys(),n=i.find(d=>d.id==="default")||i[0];if(n){let d=n.key;return this._effectiveApiKey.set(d),d}return this._effectiveApiKey.set(""),""}async saveCustomApiKey(t,e,i){let n=this.getStaticApiKeys();if(Object.prototype.hasOwnProperty.call(n,t))throw new Error(`Cannot save custom API key with ID "${t}": collides with a static configuration key.`);this.usageTrackingService.trackApiKeyUpdate({action:"add"}),await this.secureCredentialsStorage.saveCustomApiKey(t,e,i),await this.syncEffectiveApiKeyToConfigProvider();}async deleteCustomApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"delete"}),await this.secureCredentialsStorage.deleteCustomApiKey(t),this._selectedApiKeyId()===t?await this.selectApiKey(null):await this.syncEffectiveApiKeyToConfigProvider();}async syncEffectiveApiKeyToConfigProvider(){let t=await this.getEffectiveApiKey(),e=this._selectedApiKeyId(),i=this.getStaticApiKeys();return e&&i[e]?this.configProvider.setApiKeyFromConfig(t):!e&&i.default?this.configProvider.setApiKeyFromConfig(t):this.configProvider.setRuntimeApiKey(t),t}getStaticRenderersMap(){return this.startupConfigState.renderers()||{}}getCustomRenderers(){let t=this.localStorageInteractions.getItem("a2ui_composer_custom_renderers");if(!t)return [];try{let e=JSON.parse(t);return Array.isArray(e)?e.filter(i=>i&&typeof i=="object"&&!!String(i.id||"").trim()).map(i=>({id:String(i?.id||"").trim(),name:String(i?.name||""),rendererUrl:String(i?.rendererUrl||"")})):[]}catch(e){return this.logger.warn("Failed to parse custom renderers from LocalStorage:",e),[]}}getRenderers(){let t=this.getStaticRenderersMap(),e=Object.entries(t).map(([d,u])=>({id:d,name:u?.displayName||u?.name||d,rendererUrl:u?.rendererUrl||"",readOnly:true})),i=new Set(e.map(d=>d.name)),n=this.getCustomRenderers().filter(d=>!Object.prototype.hasOwnProperty.call(t,d.id)).map(d=>({id:d.id,name:i.has(d.name)?`${d.name} (local)`:d.name,rendererUrl:d.rendererUrl,readOnly:false}));return [...e,...n]}saveCustomRenderer(t){let e=(t.id||"").trim(),i=(t.name||"").trim(),n=(t.rendererUrl||"").trim();if(!e||!i||!n)throw new Error("Custom renderer id, name, and rendererUrl must not be empty.");if(!/^https?:\/\//i.test(n))throw new Error("Custom renderer URL must start with http:// or https://");let d=this.getStaticRenderersMap();if(Object.prototype.hasOwnProperty.call(d,e))throw new Error(`Cannot save custom renderer with ID "${e}": collides with a static configuration renderer.`);let u=this.getCustomRenderers(),Fe=u.findIndex($t=>$t.id===e);Fe>=0?(u[Fe]={id:e,name:i,rendererUrl:n},this.usageTrackingService.trackRendererEdit({rendererId:e})):(u.push({id:e,name:i,rendererUrl:n}),this.usageTrackingService.trackRendererAdd({rendererId:e})),this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(u));let Ne=f({},this.startupConfigState.renderers());Ne[e]={id:e,name:i,rendererUrl:n},this.startupConfigState.setRenderers(Ne);}deleteCustomRenderer(t){this.usageTrackingService.trackRendererDelete({rendererId:t});let e=this.getCustomRenderers().filter(n=>n.id!==t);this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(e));let i=f({},this.startupConfigState.renderers());delete i[t],this.startupConfigState.setRenderers(i),this.selectedRendererId()===t&&(this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer"),this.selectRenderer(null));}static \u0275fac=function(e){return new(e||r)};static \u0275prov=pe({token:r,factory:r.\u0275fac,providedIn:"root"})};function Jt(r,t){if(r&1&&(br(0,"div",5),Oi$1(1),$r()),r&2){let e=Y8();Ko(),Um(e.errorMessage());}}function Zt(r){let t=r.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var re=class r{fb=_(Oi);settingsService=_(k);dialogRef=_(Nf);data=_(Zw,{optional:true});errorMessage=yt(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[we.required,we.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[we.required,Zt]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),i=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:i,name:t,rendererUrl:e}),this.dialogRef.close(i);}catch(n){this.errorMessage.set(n instanceof Error?n.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=ln({type:r,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","formControlName","name","placeholder","My Renderer"],["matInput","","id","renderer-url-input","formControlName","rendererUrl","placeholder","http://localhost:3000"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(br(0,"h2",0),Oi$1(1),$r(),br(2,"mat-dialog-content")(3,"form",1),zm("ngSubmit",function(d){return d.preventDefault(),i.onConfirm()}),br(4,"mat-form-field",2)(5,"mat-label"),Oi$1(6,"Name"),$r(),uR(7,"input",3),k3(),$r(),br(8,"mat-form-field",2)(9,"mat-label"),Oi$1(10,"Renderer URL"),$r(),uR(11,"input",4),k3(),$r(),xd(12,Jt,2,1,"div",5),$r()(),br(13,"mat-dialog-actions",6)(14,"button",7),Oi$1(15,"Cancel"),$r(),br(16,"button",8),zm("click",function(){return i.onConfirm()}),Oi$1(17),$r()()),e&2&&(Ko(),Um(i.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),Ko(2),kd("formGroup",i.form),Ko(4),O3(),Ko(4),O3(),Ko(),Td(i.errorMessage()?12:-1),Ko(4),kd("disabled",i.form.invalid),Ko(),Wb(" ",i.data?.renderer?"Save":"Add"," "));},dependencies:[Ri$1,Ni,Et,Fi,Ii$1,Un,kn,xL,bL,DL,SL,wL,me,nt,de,Dn,Rn$1,Y1,K1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ie=class r{disabled=jR(false);dialog=_(Mf);destroyRef=_(Bn);items=yt([]);selectedItem=Nd(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(Rze(this.destroyRef)).subscribe(async n=>{n&&(await this.refreshItems(),this.emitSelection(n));});}async handleEdit(t,e,i,n){if(e.stopPropagation(),e.preventDefault(),i.readOnly)return;this.dialog.open(t,{width:"450px",data:{[n]:i}}).afterClosed().pipe(Rze(this.destroyRef)).subscribe(async u=>{u&&(await this.refreshItems(),this.getSelectedId()===u&&this.emitSelection(u));});}async handleDelete(t,e,i=null){t.stopPropagation(),t.preventDefault(),!this.items().find(d=>d.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(i));}static \u0275fac=function(e){return new(e||r)};static \u0275dir=Tt({type:r,inputs:{disabled:[1,"disabled"]}})};var ti=(r,t)=>t.id;function ii(r,t){if(r&1&&(br(0,"span",5),Oi$1(1),$r()),r&2){let e=Y8();Ko(),Um(e.selectedItem()?.rendererUrl);}}function ni(r,t){r&1&&(br(0,"mat-option",6),Oi$1(1,"No items available \u2014 click + to add"),$r()),r&2&&kd("disabled",true);}function ri(r,t){if(r&1){let e=J8();br(0,"mat-option",8)(1,"div",9)(2,"div",10),Oi$1(3),$r(),br(4,"div",5),Oi$1(5),$r()(),br(6,"button",11),zm("click",function(n){let d=lk(e).$implicit,u=Y8(2);return dk(u.onEditRenderer(n,d))})("keydown",function(n){return n.stopPropagation()}),br(7,"mat-icon",12),Oi$1(8,"edit"),$r()(),br(9,"button",13),zm("click",function(n){let d=lk(e).$implicit,u=Y8(2);return dk(u.onDeleteRenderer(n,d.id))})("keydown",function(n){return n.stopPropagation()}),br(10,"mat-icon",12),Oi$1(11,"delete"),$r()()();}if(r&2){let e=t.$implicit;kd("value",e.id),Ko(3),Um(e.name),Ko(2),Um(e.rendererUrl),Ko(),kd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),Xo("aria-label","Edit "+e.name),Ko(3),kd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),Xo("aria-label","Delete "+e.name);}}function ai(r,t){if(r&1&&j8(0,ri,12,9,"mat-option",8,ti),r&2){let e=Y8();H8(e.items());}}var Ie=class r extends ie{selectedRendererId=jR("default");rendererSelected=ZTe();settingsService=_(k);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(re,t);}onEditRenderer(t,e){this.handleEdit(re,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=ln({type:r,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[Kn],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,i){e&1&&(br(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Oi$1(3,"Renderer"),$r(),br(4,"mat-select",2),zm("selectionChange",function(d){return i.onSelectionChange(d.value)}),br(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Oi$1(8),$r(),xd(9,ii,2,1,"span",5),$r()(),xd(10,ni,2,1,"mat-option",6)(11,ai,2,0),$r()(),br(12,"button",7),zm("click",function(d){return i.onAddRenderer(d)}),br(13,"mat-icon"),Oi$1(14,"add_circle"),$r()()()),e&2&&(Ko(4),kd("value",i.selectedRendererId())("disabled",i.disabled()),Ko(4),Um(i.selectedItem()?.name),Ko(),Td(i.selectedItem()?.rendererUrl?9:-1),Ko(),Td(i.items().length===0?10:11),Ko(2),kd("disabled",i.disabled()));},dependencies:[me,nt,de,xn,Cn,wn,re$1,Y1,Hoe,li$1,ai$1,Yt,mt,xL],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-option-supporting-text-color, #666);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function oi(r,t){if(r&1&&(br(0,"div",7),Oi$1(1),$r()),r&2){let e=Y8();Ko(),Um(e.errorMessage());}}var ae=class r{fb=_(Oi);settingsService=_(k);dialogRef=_(Nf);data=_(Zw,{optional:true});errorMessage=yt(null);hideApiKey=yt(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[we.required,we.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[we.required,we.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),i=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(i,t,e),this.dialogRef.close(i);}catch(n){this.errorMessage.set(n instanceof Error?n.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=ln({type:r,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","formControlName","name","placeholder","My Gemini Key"],["matInput","","id","api-key-value-input","formControlName","apiKey","placeholder","Paste your API key here",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,i){e&1&&(br(0,"h2",0),Oi$1(1),$r(),br(2,"mat-dialog-content")(3,"form",1),zm("ngSubmit",function(d){return d.preventDefault(),i.onConfirm()}),br(4,"mat-form-field",2)(5,"mat-label"),Oi$1(6,"Name"),$r(),uR(7,"input",3),k3(),$r(),br(8,"mat-form-field",2)(9,"mat-label"),Oi$1(10,"API Key"),$r(),uR(11,"input",4),k3(),br(12,"button",5),zm("click",function(){return i.toggleHideApiKey()}),br(13,"mat-icon",6),Oi$1(14),$r()()(),xd(15,oi,2,1,"div",7),$r()(),br(16,"mat-dialog-actions",8)(17,"button",9),Oi$1(18,"Cancel"),$r(),br(19,"button",10),zm("click",function(){return i.onConfirm()}),Oi$1(20),$r()()),e&2&&(Ko(),Um(i.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),Ko(2),kd("formGroup",i.form),Ko(4),O3(),Ko(4),kd("type",i.hideApiKey()?"password":"text"),O3(),Ko(),Xo("aria-label",i.hideApiKey()?"Show API key":"Hide API key"),Ko(2),Um(i.hideApiKey()?"visibility":"visibility_off"),Ko(),Td(i.errorMessage()?15:-1),Ko(4),kd("disabled",i.form.invalid),Ko(),Wb(" ",i.data?.apiKey?"Save":"Add"," "));},dependencies:[Ri$1,Ni,Et,Fi,Ii$1,Un,kn,xL,bL,DL,SL,wL,me,nt,de,Pt,Dn,Rn$1,Y1,K1,Hoe,li$1,ai$1],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var di=(r,t)=>t.id;function li(r,t){r&1&&(br(0,"mat-option",3),Oi$1(1,"No items available \u2014 click + to add"),$r()),r&2&&kd("disabled",true);}function si(r,t){if(r&1){let e=J8();br(0,"mat-option",5)(1,"span",6),Oi$1(2),$r(),br(3,"button",7),zm("keydown",function(n){return n.stopPropagation()})("click",function(n){let d=lk(e).$implicit,u=Y8(2);return dk(u.onEditApiKey(n,d))}),br(4,"mat-icon",8),Oi$1(5,"edit"),$r()(),br(6,"button",9),zm("keydown",function(n){return n.stopPropagation()})("click",function(n){let d=lk(e).$implicit,u=Y8(2);return dk(u.onDeleteApiKey(n,d.id))}),br(7,"mat-icon",8),Oi$1(8,"delete"),$r()()();}if(r&2){let e=t.$implicit;kd("value",e.id),Ko(2),Um(e.name),Ko(),kd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),Xo("aria-label","Edit "+e.name),Ko(3),kd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),Xo("aria-label","Delete "+e.name);}}function ci(r,t){if(r&1&&j8(0,si,9,8,"mat-option",5,di),r&2){let e=Y8();H8(e.items());}}var Pe=class r extends ie{selectedApiKeyId=jR(null);apiKeySelected=ZTe();settingsService=_(k);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(ae,t);}onEditApiKey(t,e){this.handleEdit(ae,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=ln({type:r,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[Kn],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,i){e&1&&(br(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Oi$1(3,"API Key"),$r(),br(4,"mat-select",2),zm("selectionChange",function(d){return i.onSelectionChange(d.value)}),br(5,"mat-select-trigger"),Oi$1(6),$r(),xd(7,li,2,1,"mat-option",3)(8,ci,2,0),$r()(),br(9,"button",4),zm("click",function(d){return i.onAddApiKey(d)}),br(10,"mat-icon"),Oi$1(11,"add_circle"),$r()()()),e&2&&(Ko(4),kd("value",i.selectedApiKeyId())("disabled",i.disabled()),Ko(2),Wb(" ",i.selectedItem()?.name," "),Ko(),Td(i.items().length===0?7:8),Ko(2),kd("disabled",i.disabled()));},dependencies:[me,nt,de,xn,Cn,wn,re$1,Y1,Hoe,li$1,ai$1,Yt,mt,xL],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};var Gt=()=>({standalone:true}),mi=(r,t)=>t.id,pi=(r,t)=>t.name;function gi(r,t){if(r&1){let e=J8();br(0,"div",4)(1,"h3"),Oi$1(2,"Gemini API Provisioning"),$r(),br(3,"a2ui-composer-api-key-selector",28),zm("apiKeySelected",function(n){lk(e);let d=Y8();return dk(d.onApiKeySelected(n))}),$r()();}if(r&2){let e=Y8();Ko(3),kd("selectedApiKeyId",e.selectedApiKeyId());}}function ui(r,t){r&1&&(br(0,"mat-card-footer",10),Oi$1(1," To obtain an API key: "),br(2,"ol")(3,"li"),Oi$1(4," Go to "),br(5,"a",29),Oi$1(6," Google AI Studio"),$r(),Oi$1(7," and sign in with your Google account. "),$r(),br(8,"li"),Oi$1(9,"Click Create API key."),$r(),br(10,"li"),Oi$1(11,"Select or create a Google Cloud project when prompted, then click Create key."),$r(),br(12,"li"),Oi$1(13,"Save your key in a secure location!"),$r()(),Oi$1(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),br(15,"a",30),Oi$1(16,"Web Crypto API"),$r(),Oi$1(17,". Neither Google nor anyone else has access to this key. "),$r());}function hi(r,t){if(r&1&&(br(0,"code"),Oi$1(1),$r()),r&2){let e=Y8();Ko(),Wb("[System] Active renderer updated to ",e.activeRendererUrl());}}function fi(r,t){if(r&1&&(br(0,"code",18),Oi$1(1),$r()),r&2){let e=Y8();Ko(),Wb("[Catalog Error] ",e.catalogErrorMessage());}}function yi(r,t){r&1&&(br(0,"code",19),Oi$1(1,"[System] Catalog handshake completed successfully. Active catalog ready."),$r());}function _i(r,t){r&1&&(br(0,"code"),Oi$1(1,"[System] Catalog handshake in progress. Indexing metadata..."),$r());}function vi(r,t){r&1&&(br(0,"code"),Oi$1(1,"[System] Bridge connected. Initializing catalog handshake..."),$r());}function bi(r,t){r&1&&(br(0,"code"),Oi$1(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),$r());}function wi(r,t){if(r&1&&Oi$1(0),r&2){let e=Y8().$implicit;Wb(" Connected (",e.tools?.length||0," tools) ");}}function Ci(r,t){r&1&&Oi$1(0," Connecting... ");}function Si(r,t){if(r&1&&Oi$1(0),r&2){let e=Y8().$implicit;Wb(" Error: ",e.errorMessage||"Failed to connect"," ");}}function Mi(r,t){r&1&&Oi$1(0," Disconnected ");}function xi(r,t){if(r&1){let e=J8();br(0,"div",38)(1,"mat-form-field",45)(2,"input",46),zm("ngModelChange",function(n){lk(e);let d=Y8(2);return dk(d.editingMcpServerUrl.set(n))})("keydown.enter",function(){lk(e);let n=Y8().$implicit,d=Y8();return dk(d.saveEditedMcpServer(n.id))})("keydown.escape",function(){lk(e);let n=Y8(2);return dk(n.cancelEditingMcpServer())}),$r(),k3(),$r(),br(3,"button",47),zm("click",function(){lk(e);let n=Y8().$implicit,d=Y8();return dk(d.saveEditedMcpServer(n.id))}),br(4,"mat-icon",25),Oi$1(5,"check"),$r()(),br(6,"button",48),zm("click",function(){lk(e);let n=Y8(2);return dk(n.cancelEditingMcpServer())}),br(7,"mat-icon",25),Oi$1(8,"close"),$r()()();}if(r&2){let e=Y8(2);Ko(2),kd("ngModel",e.editingMcpServerUrl())("ngModelOptions",x6(3,Gt)),O3(),Ko(),kd("disabled",!e.editingMcpServerUrl().trim());}}function ki(r,t){if(r&1&&(br(0,"span",39),Oi$1(1),$r()),r&2){let e=Y8().$implicit;Ko(),Um(e.url);}}function Ai(r,t){if(r&1&&(br(0,"span",49),Oi$1(1),$r()),r&2){let e=t.$implicit;Ko(),Um(e.name);}}function Ii(r,t){if(r&1&&(br(0,"div",44),j8(1,Ai,2,1,"span",49,pi),$r()),r&2){let e=Y8().$implicit;Ko(),H8(e.tools);}}function Pi(r,t){if(r&1){let e=J8();br(0,"div",27)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),zm("change",function(n){let d=lk(e).$implicit,u=Y8();return dk(u.toggleMcpServer(d.id,n.checked))}),$r(),br(4,"div",34)(5,"div",35)(6,"span",36),Oi$1(7),$r(),br(8,"span",37),xd(9,wi,1,1)(10,Ci,1,0)(11,Si,1,1)(12,Mi,1,0),$r()(),xd(13,xi,9,4,"div",38)(14,ki,2,1,"span",39),$r()(),br(15,"div",40)(16,"button",41),zm("click",function(){let n=lk(e).$implicit,d=Y8();return dk(d.testMcpServer(n.id))}),Oi$1(17," Test "),$r(),br(18,"button",42),zm("click",function(){let n=lk(e).$implicit,d=Y8();return dk(d.startEditingMcpServer(n))}),br(19,"mat-icon",25),Oi$1(20,"edit"),$r()(),br(21,"button",43),zm("click",function(){let n=lk(e).$implicit,d=Y8();return dk(d.removeMcpServer(n.id))}),br(22,"mat-icon",25),Oi$1(23,"delete"),$r()()()(),xd(24,Ii,3,0,"div",44),$r();}if(r&2){let e=t.$implicit,i=Y8();Ko(3),kd("checked",e.enabled),Xo("aria-label","Toggle "+(e.name||e.url)),Ko(4),Um(e.name||e.url),Ko(),Xo("data-status",e.status),Ko(),Td(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),Ko(4),Td(i.editingMcpServerId()===e.id?13:14),Ko(11),Td(e.tools&&e.tools.length>0?24:-1);}}var Bt=class r{fb=_(Oi);startupResolution=_(FB);startupConfigState=_(cB);hostCommunication=_(tZ);catalogManagement=_(se);configProvider=_(Vu);settingsService=_(k);mcpManager=_(fv);newMcpServerUrl=yt("");editingMcpServerId=yt(null);editingMcpServerUrl=yt("");is1PAuthEnabled=_(aB);selectedRendererId=yt(null);selectedApiKeyId=Nd(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=Nd(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=yt(false);isApiKeyProvidedByConfig=Nd(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=Nd(()=>this.isApiKeyProvidedByConfig());hideApiKey=yt(true);forceThirdPartyAuth=yt(false);bridgeConnected=Nd(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=Nd(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=Nd(()=>this.catalogManagement.catalogError());activeRendererUrl=Nd(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){$a(()=>{let t=this.settingsService.selectedRendererId()||"default";Ri(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}async addMcpServer(){let t=this.newMcpServerUrl().trim();t&&(this.newMcpServerUrl.set(""),await this.mcpManager.addServer(t));}startEditingMcpServer(t){this.editingMcpServerId.set(t.id),this.editingMcpServerUrl.set(t.url);}cancelEditingMcpServer(){this.editingMcpServerId.set(null),this.editingMcpServerUrl.set("");}async saveEditedMcpServer(t){let e=this.editingMcpServerUrl().trim();e&&(this.editingMcpServerId.set(null),this.editingMcpServerUrl.set(""),await this.mcpManager.updateServerUrl(t,e));}async removeMcpServer(t){this.editingMcpServerId()===t&&this.cancelEditingMcpServer(),await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=ln({type:r,selectors:[["a2ui-composer-settings"]],decls:62,vars:16,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-add-row"],["appearance","outline","subscriptSizing","dynamic",1,"mcp-url-field"],["matInput","","placeholder","http://localhost:3001/mcp","aria-label","MCP Server URL",3,"ngModelChange","keydown.enter","ngModel","ngModelOptions"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click","disabled"],["aria-hidden","true"],[1,"mcp-server-list"],[1,"mcp-server-item"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-edit-row"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit URL","aria-label","Edit MCP Server URL",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete Server","aria-label","Delete MCP Server",3,"click"],[1,"mcp-server-tools"],["appearance","outline","subscriptSizing","dynamic",1,"mcp-edit-url-field"],["matInput","","aria-label","Edit MCP Server URL",3,"ngModelChange","keydown.enter","keydown.escape","ngModel","ngModelOptions"],["type","button","mat-icon-button","","color","primary","matTooltip","Save URL","aria-label","Save MCP Server URL",1,"mcp-save-edit-btn",3,"click","disabled"],["type","button","mat-icon-button","","matTooltip","Cancel Editing","aria-label","Cancel Editing MCP Server URL",1,"mcp-cancel-edit-btn",3,"click"],[1,"mcp-tool-name"]],template:function(e,i){e&1&&(br(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Oi$1(4,"A2UI Composer Settings"),$r()(),br(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Oi$1(9,"Renderer"),$r(),br(10,"a2ui-composer-renderer-selector",5),zm("rendererSelected",function(d){return i.onRendererSelected(d)}),$r()(),xd(11,gi,4,1,"div",4),br(12,"div",6)(13,"h3"),Oi$1(14,"Developer Authentication Overrides"),$r(),br(15,"p",7),Oi$1(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),$r(),br(17,"div",8)(18,"mat-slide-toggle",9),zm("change",function(){return i.toggleForceThirdPartyAuth()}),Oi$1(19," Force External Third-Party Authentication Mode "),$r()()()()(),xd(20,ui,18,0,"mat-card-footer",10),$r(),br(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Oi$1(24,"Connection Status & Diagnostics"),$r(),br(25,"p",12),Oi$1(26,"Real-time monitoring bridge"),$r()(),br(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Oi$1(31),$r(),br(32,"mat-chip",15),Oi$1(33),$r()()(),br(34,"div",16)(35,"h4"),Oi$1(36,"Overlay Logs Preview"),$r(),br(37,"div",17),xd(38,hi,2,1,"code"),xd(39,fi,2,1,"code",18)(40,yi,2,0,"code",19)(41,_i,2,0,"code")(42,vi,2,0,"code")(43,bi,2,0,"code"),$r()()()(),br(44,"mat-card",20)(45,"mat-card-header")(46,"h2",2),Oi$1(47,"MCP Servers"),$r(),br(48,"p",12),Oi$1(49," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),$r()(),br(50,"mat-card-content")(51,"div",21)(52,"mat-form-field",22)(53,"mat-label"),Oi$1(54,"Server URL"),$r(),br(55,"input",23),zm("ngModelChange",function(d){return i.newMcpServerUrl.set(d)})("keydown.enter",function(){return i.addMcpServer()}),$r(),k3(),$r(),br(56,"button",24),zm("click",function(){return i.addMcpServer()}),br(57,"mat-icon",25),Oi$1(58,"add_circle"),$r()()(),br(59,"div",26),j8(60,Pi,25,7,"div",27,mi),$r()()()()),e&2&&(Ko(6),kd("formGroup",i.settingsForm),Ko(4),kd("selectedRendererId",i.selectedRendererId()),Ko(),Td(i.isThirdParty()?11:-1),Ko(),kd("hidden",!i.is1PAuthEnabled),Ko(6),kd("checked",i.forceThirdPartyAuth()),Ko(2),Td(i.isThirdParty()?20:-1),Ko(10),kd("color",i.bridgeConnected()?"primary":"accent"),Ko(),Wb("Bridge: ",i.bridgeConnected()?"Connected":"Disconnected"),Ko(),kd("color",i.catalogStatus()==="Connected"?"primary":i.catalogStatus()==="Indexing"?"accent":i.catalogStatus()==="Error"?"warn":void 0),Ko(),Wb("Catalog Handshake: ",i.catalogStatus()),Ko(5),Td(i.activeRendererUrl()?38:-1),Ko(),Td(i.catalogErrorMessage()?39:i.catalogStatus()==="Connected"?40:i.catalogStatus()==="Indexing"?41:i.bridgeConnected()?42:43),Ko(16),kd("ngModel",i.newMcpServerUrl())("ngModelOptions",x6(15,Gt)),O3(),Ko(),kd("disabled",!i.newMcpServerUrl().trim()),Ko(4),H8(i.mcpManager.servers()));},dependencies:[xi$1,Ni,Et,Fi,Ii$1,Rn,Ri$1,Un,me,nt,de,Dn,Rn$1,Y1,K1,Hoe,li$1,ai$1,E,F,k$1,z,T,S,j,ki$1,Et$1,xi$2,Ut,De,Yt,mt,Ie,Pe],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto}.settings-container[_ngcontent-%COMP%]{padding:24px;max-width:600px;margin:0 auto}.form-section[_ngcontent-%COMP%]{margin-top:16px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-card[_ngcontent-%COMP%]{margin-top:24px}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-lowest);color:var(--mat-sys-primary);padding:12px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:700}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-small-size, 12px);padding-left:24px;padding-bottom:12px}.mcp-add-row[_ngcontent-%COMP%]{display:flex;width:100%;align-items:center;margin-top:16px}.mcp-add-row[_ngcontent-%COMP%]   .mcp-url-field[_ngcontent-%COMP%]{flex:1}.mcp-add-row[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0}.mcp-edit-row[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;margin-top:6px}.mcp-edit-row[_ngcontent-%COMP%]   .mcp-edit-url-field[_ngcontent-%COMP%]{flex:1}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:2px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:600;font-size:14px;color:var(--mat-sys-on-surface)}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{Bt as Settings};