import {K}from'./chunk-D2Dg5J_T.js';import {E,F,k,z,T,S,j}from'./chunk-YZniloom.js';import {C,cs as nf,V as an,Z as Zg,B as Bg,ab as VV,s as se,b as Cl,aa as _y,ct as gg,l as lt,d as dd,c as Ea,aj as Ci,$ as zLe,e as Xt$1,g as gL,m as mL,Y as Yne,cu as rL,i as mr,y as yi$1,x as xr,j as im,n as id,L as Lo,p as ad,u as sd,r as rb,cv as tf,cw as xD,cx as YF,cy as XF,cz as tL,cA as eL,k as cO,be as y8,t as cm,bf as C8,F as bt,G as gt,H as mo,I as rt,bn as xl,ay as pm,an as U,aB as Oi,aD as ft,ap as Fr,aq as dL,bA as LO,aE as Jo,aI as CFe,as as ao,at as en,Q as Qc,K as Ho,b0 as Z3,A as Ar,o as jo,av as ob,cB as xu,aK as JO,cq as cd,M as nb,aw as ud,R as sm,T as am,bg as ZO,bQ as zIe,aT as Tn,aZ as $3,aN as H3,ah as O3,ai as k3,ca as px,U as ut,a_ as ex,a$ as tx}from'./main.js';import {o as ot,k as ki,c as ct}from'./chunk-CWgR4CW3.js';import {Y as Yt$1,m as mt}from'./chunk-BfiAtffL.js';import {x as xi,v as vi$1,C as Ci$1,G}from'./chunk-BOVjhrHN.js';import {m as me,D as Dn,n as nt,d as de,R as Rn,P as Pt}from'./chunk-Blr5_gyh.js';import {z as zi,Z as Zi,W as Wi,H as Hi,Q as Qi,X as Xn,D as Di,V as Vi,R as Re,I as It,G as Gi,f as Zn,T as T$1,i as ie}from'./chunk-B5WUUqo3.js';var Kt=["*"],Dt=(()=>{class i{labelPosition="after";static \u0275fac=function(n){return new(n||i)};static \u0275cmp=Xt$1({type:i,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(n,r){n&2&&Ar("mdc-form-field--align-end",r.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Kt,decls:1,vars:0,template:function(n,r){n&1&&(Qc(),Ho(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return i})();var Nt=["switch"],zt=["*"];function Vt(i,t){i&1&&(mr(0,"span",11),px(),mr(1,"svg",13),cO(2,"path",14),xr(),mr(3,"svg",15),cO(4,"path",16),xr()());}var Gt=new U("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Pe=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Te=(()=>{class i{_elementRef=C(rt);_focusMonitor=C(xl);_changeDetectorRef=C(pm);defaults=C(Gt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Pe(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Oi();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new ft;toggleChange=new ft;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){C(Fr).load(dL);let e=C(new LO("tabindex"),{optional:true}),n=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=n.color||"accent",this.id=this._uniqueId=C(Jo).getId("mat-mdc-slide-toggle-"),this.hideIcon=n.hideIcon??false,this.disabledInteractive=n.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Pe(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=Xt$1({type:i,selectors:[["mat-slide-toggle"]],viewQuery:function(n,r){if(n&1&&ud(Nt,5),n&2){let s;sm(s=am())&&(r._switchElement=s.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(n,r){n&2&&(cd("id",r.id),jo("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),nb(r.color?"mat-"+r.color:""),Ar("mat-mdc-slide-toggle-focused",r._focused)("mat-mdc-slide-toggle-checked",r.checked)("_mat-animation-noopable",r._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",en],color:"color",disabled:[2,"disabled","disabled",en],disableRipple:[2,"disableRipple","disableRipple",en],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:JO(e)],checked:[2,"checked","checked",en],hideIcon:[2,"hideIcon","hideIcon",en],disabledInteractive:[2,"disabledInteractive","disabledInteractive",en]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[ob([{provide:T$1,useExisting:xu(()=>i),multi:true},{provide:ie,useExisting:i,multi:true}]),ao],ngContentSelectors:zt,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(n,r){if(n&1&&(Qc(),mr(0,"div",1)(1,"button",2,0),im("click",function(){return r._handleClick()}),cO(3,"div",3)(4,"span",4),mr(5,"span",5)(6,"span",6)(7,"span",7),cO(8,"span",8),xr(),mr(9,"span",9),cO(10,"span",10),xr(),id(11,Vt,5,0,"span",11),xr()()(),mr(12,"label",12),im("click",function(v){return v.stopPropagation()}),Ho(13),xr()()),n&2){let s=Z3(2);ad("labelPosition",r.labelPosition),Lo(),Ar("mdc-switch--selected",r.checked)("mdc-switch--unselected",!r.checked)("mdc-switch--checked",r.checked)("mdc-switch--disabled",r.disabled)("mat-mdc-slide-toggle-disabled-interactive",r.disabledInteractive),ad("tabIndex",r.disabled&&!r.disabledInteractive?-1:r.tabIndex)("disabled",r.disabled&&!r.disabledInteractive),jo("id",r.buttonId)("name",r.name)("aria-label",r.ariaLabel)("aria-labelledby",r._getAriaLabelledBy())("aria-describedby",r.ariaDescribedby)("aria-required",r.required||null)("aria-checked",r.checked)("aria-disabled",r.disabled&&r.disabledInteractive?"true":null),Lo(9),ad("matRippleTrigger",s)("matRippleDisabled",r.disableRipple||r.disabled)("matRippleCentered",true),Lo(),sd(r.hideIcon?-1:11),Lo(),ad("for",r.buttonId),jo("id",r._labelId);}},dependencies:[CFe,Dt],styles:[`.mdc-switch {
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
`],encapsulation:2})}return i})(),Et=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=bt({type:i});static \u0275inj=gt({imports:[Te,mo]})}return i})();function Bt(i,t){if(i&1&&(mr(0,"div",5),yi$1(1),xr()),i&2){let e=H3();Lo(),cm(e.errorMessage());}}function Oe(i){let t=i.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var pe=class i{fb=C(zi);settingsService=C(K);dialogRef=C(tf);data=C(xD,{optional:true});errorMessage=lt(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[Re.required,Re.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[Re.required,Oe]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),n=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:n,name:t,rendererUrl:e}),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","formControlName","name","placeholder","My Renderer"],["matInput","","id","renderer-url-input","formControlName","rendererUrl","placeholder","http://localhost:3000"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(mr(0,"h2",0),yi$1(1),xr(),mr(2,"mat-dialog-content")(3,"form",1),im("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),mr(4,"mat-form-field",2)(5,"mat-label"),yi$1(6,"Name"),xr(),cO(7,"input",3),y8(),xr(),mr(8,"mat-form-field",2)(9,"mat-label"),yi$1(10,"Renderer URL"),xr(),cO(11,"input",4),y8(),xr(),id(12,Bt,2,1,"div",5),xr()(),mr(13,"mat-dialog-actions",6)(14,"button",7),yi$1(15,"Cancel"),xr(),mr(16,"button",8),im("click",function(){return n.onConfirm()}),yi$1(17),xr()()),e&2&&(Lo(),cm(n.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),Lo(2),ad("formGroup",n.form),Lo(4),C8(),Lo(4),C8(),Lo(),sd(n.errorMessage()?12:-1),Lo(4),ad("disabled",n.form.invalid),Lo(),rb(" ",n.data?.renderer?"Save":"Add"," "));},dependencies:[Qi,Wi,It,Gi,Hi,Xn,Zn,rL,YF,XF,tL,eL,me,nt,de,Dn,Rn,gL,mL],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ce=class i{disabled=ZO(false);dialog=C(nf);destroyRef=C(an);items=lt([]);selectedItem=dd(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(zLe(this.destroyRef)).subscribe(async r=>{r&&(await this.refreshItems(),this.emitSelection(r));});}async handleEdit(t,e,n,r){if(e.stopPropagation(),e.preventDefault(),n.readOnly)return;this.dialog.open(t,{width:"450px",data:{[r]:n}}).afterClosed().pipe(zLe(this.destroyRef)).subscribe(async v=>{v&&(await this.refreshItems(),this.getSelectedId()===v&&this.emitSelection(v));});}async handleDelete(t,e,n=null){t.stopPropagation(),t.preventDefault(),!this.items().find(s=>s.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(n));}static \u0275fac=function(e){return new(e||i)};static \u0275dir=ut({type:i,inputs:{disabled:[1,"disabled"]}})};var $t=(i,t)=>t.id;function qt(i,t){if(i&1&&(mr(0,"span",5),yi$1(1),xr()),i&2){let e=H3();Lo(),cm(e.selectedItem()?.rendererUrl);}}function jt(i,t){i&1&&(mr(0,"mat-option",6),yi$1(1,"No items available \u2014 click + to add"),xr()),i&2&&ad("disabled",true);}function Ht(i,t){if(i&1){let e=$3();mr(0,"mat-option",8)(1,"div",9)(2,"div",10),yi$1(3),xr(),mr(4,"div",5),yi$1(5),xr()(),mr(6,"button",11),im("click",function(r){let s=ex(e).$implicit,v=H3(2);return tx(v.onEditRenderer(r,s))})("keydown",function(r){return r.stopPropagation()}),mr(7,"mat-icon",12),yi$1(8,"edit"),xr()(),mr(9,"button",13),im("click",function(r){let s=ex(e).$implicit,v=H3(2);return tx(v.onDeleteRenderer(r,s.id))})("keydown",function(r){return r.stopPropagation()}),mr(10,"mat-icon",12),yi$1(11,"delete"),xr()()();}if(i&2){let e=t.$implicit;ad("value",e.id),Lo(3),cm(e.name),Lo(2),cm(e.rendererUrl),Lo(),ad("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),jo("aria-label","Edit "+e.name),Lo(3),ad("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),jo("aria-label","Delete "+e.name);}}function Wt(i,t){if(i&1&&O3(0,Ht,12,9,"mat-option",8,$t),i&2){let e=H3();k3(e.items());}}var Ae=class i extends ce{selectedRendererId=ZO("default");rendererSelected=zIe();settingsService=C(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(pe,t);}onEditRenderer(t,e){this.handleEdit(pe,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[Tn],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,n){e&1&&(mr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),yi$1(3,"Renderer"),xr(),mr(4,"mat-select",2),im("selectionChange",function(s){return n.onSelectionChange(s.value)}),mr(5,"mat-select-trigger")(6,"div",3)(7,"span",4),yi$1(8),xr(),id(9,qt,2,1,"span",5),xr()(),id(10,jt,2,1,"mat-option",6)(11,Wt,2,0),xr()(),mr(12,"button",7),im("click",function(s){return n.onAddRenderer(s)}),mr(13,"mat-icon"),yi$1(14,"add_circle"),xr()()()),e&2&&(Lo(4),ad("value",n.selectedRendererId())("disabled",n.disabled()),Lo(4),cm(n.selectedItem()?.name),Lo(),sd(n.selectedItem()?.rendererUrl?9:-1),Lo(),sd(n.items().length===0?10:11),Lo(2),ad("disabled",n.disabled()));},dependencies:[me,nt,de,xi,vi$1,Ci$1,G,gL,Yne,Di,Vi,Yt$1,mt,rL],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-option-supporting-text-color, #666);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function Xt(i,t){if(i&1&&(mr(0,"div",7),yi$1(1),xr()),i&2){let e=H3();Lo(),cm(e.errorMessage());}}var he=class i{fb=C(zi);settingsService=C(K);dialogRef=C(tf);data=C(xD,{optional:true});errorMessage=lt(null);hideApiKey=lt(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[Re.required,Re.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[Re.required,Re.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),n=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(n,t,e),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","formControlName","name","placeholder","My Gemini Key"],["matInput","","id","api-key-value-input","formControlName","apiKey","placeholder","Paste your API key here",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(mr(0,"h2",0),yi$1(1),xr(),mr(2,"mat-dialog-content")(3,"form",1),im("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),mr(4,"mat-form-field",2)(5,"mat-label"),yi$1(6,"Name"),xr(),cO(7,"input",3),y8(),xr(),mr(8,"mat-form-field",2)(9,"mat-label"),yi$1(10,"API Key"),xr(),cO(11,"input",4),y8(),mr(12,"button",5),im("click",function(){return n.toggleHideApiKey()}),mr(13,"mat-icon",6),yi$1(14),xr()()(),id(15,Xt,2,1,"div",7),xr()(),mr(16,"mat-dialog-actions",8)(17,"button",9),yi$1(18,"Cancel"),xr(),mr(19,"button",10),im("click",function(){return n.onConfirm()}),yi$1(20),xr()()),e&2&&(Lo(),cm(n.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),Lo(2),ad("formGroup",n.form),Lo(4),C8(),Lo(4),ad("type",n.hideApiKey()?"password":"text"),C8(),Lo(),jo("aria-label",n.hideApiKey()?"Show API key":"Hide API key"),Lo(2),cm(n.hideApiKey()?"visibility":"visibility_off"),Lo(),sd(n.errorMessage()?15:-1),Lo(4),ad("disabled",n.form.invalid),Lo(),rb(" ",n.data?.apiKey?"Save":"Add"," "));},dependencies:[Qi,Wi,It,Gi,Hi,Xn,Zn,rL,YF,XF,tL,eL,me,nt,de,Pt,Dn,Rn,gL,mL,Yne,Di,Vi],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var Qt=(i,t)=>t.id;function Yt(i,t){i&1&&(mr(0,"mat-option",3),yi$1(1,"No items available \u2014 click + to add"),xr()),i&2&&ad("disabled",true);}function Zt(i,t){if(i&1){let e=$3();mr(0,"mat-option",5)(1,"span",6),yi$1(2),xr(),mr(3,"button",7),im("keydown",function(r){return r.stopPropagation()})("click",function(r){let s=ex(e).$implicit,v=H3(2);return tx(v.onEditApiKey(r,s))}),mr(4,"mat-icon",8),yi$1(5,"edit"),xr()(),mr(6,"button",9),im("keydown",function(r){return r.stopPropagation()})("click",function(r){let s=ex(e).$implicit,v=H3(2);return tx(v.onDeleteApiKey(r,s.id))}),mr(7,"mat-icon",8),yi$1(8,"delete"),xr()()();}if(i&2){let e=t.$implicit;ad("value",e.id),Lo(2),cm(e.name),Lo(),ad("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),jo("aria-label","Edit "+e.name),Lo(3),ad("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),jo("aria-label","Delete "+e.name);}}function Jt(i,t){if(i&1&&O3(0,Zt,9,8,"mat-option",5,Qt),i&2){let e=H3();k3(e.items());}}var De=class i extends ce{selectedApiKeyId=ZO(null);apiKeySelected=zIe();settingsService=C(K);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(he,t);}onEditApiKey(t,e){this.handleEdit(he,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[Tn],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,n){e&1&&(mr(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),yi$1(3,"API Key"),xr(),mr(4,"mat-select",2),im("selectionChange",function(s){return n.onSelectionChange(s.value)}),mr(5,"mat-select-trigger"),yi$1(6),xr(),id(7,Yt,2,1,"mat-option",3)(8,Jt,2,0),xr()(),mr(9,"button",4),im("click",function(s){return n.onAddApiKey(s)}),mr(10,"mat-icon"),yi$1(11,"add_circle"),xr()()()),e&2&&(Lo(4),ad("value",n.selectedApiKeyId())("disabled",n.disabled()),Lo(2),rb(" ",n.selectedItem()?.name," "),Lo(),sd(n.items().length===0?7:8),Lo(2),ad("disabled",n.disabled()));},dependencies:[me,nt,de,xi,vi$1,Ci$1,G,gL,Yne,Di,Vi,Yt$1,mt,rL],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function ei(i,t){if(i&1&&(mr(0,"div",4),yi$1(1),xr()),i&2){let e=H3();Lo(),cm(e.errorMessage());}}var fe=class i{fb=C(zi);dialogRef=C(tf);data=C(xD,{optional:true});errorMessage=lt(null);form=this.fb.group({url:[this.data?.server?.url??"",[Re.required,Oe]]});onConfirm(){this.errorMessage.set(null);let t=this.form.controls.url.value.trim();this.dialogRef.close({url:t});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-mcp-server-dialog"]],decls:14,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","mcp-server-url-input","formControlName","url","placeholder","http://localhost:3001/mcp"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","button","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(mr(0,"h2",0),yi$1(1),xr(),mr(2,"mat-dialog-content")(3,"form",1),im("ngSubmit",function(s){return s.preventDefault(),n.onConfirm()}),mr(4,"mat-form-field",2)(5,"mat-label"),yi$1(6,"Server URL"),xr(),cO(7,"input",3),y8(),xr(),id(8,ei,2,1,"div",4),xr()(),mr(9,"mat-dialog-actions",5)(10,"button",6),yi$1(11,"Cancel"),xr(),mr(12,"button",7),im("click",function(){return n.onConfirm()}),yi$1(13),xr()()),e&2&&(Lo(),cm(n.data?.server?"Edit MCP Server":"Add MCP Server"),Lo(2),ad("formGroup",n.form),Lo(4),C8(),Lo(),sd(n.errorMessage()?8:-1),Lo(4),ad("disabled",n.form.invalid),Lo(),rb(" ",n.data?.server?"Save":"Add"," "));},dependencies:[Qi,Wi,It,Gi,Hi,Xn,Zn,rL,YF,XF,tL,eL,me,nt,de,Dn,Rn,gL,mL],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ti=(i,t)=>t.id,ii=(i,t)=>t.name;function ni(i,t){if(i&1){let e=$3();mr(0,"div",4)(1,"h3"),yi$1(2,"Gemini API Provisioning"),xr(),mr(3,"a2ui-composer-api-key-selector",27),im("apiKeySelected",function(r){ex(e);let s=H3();return tx(s.onApiKeySelected(r))}),xr()();}if(i&2){let e=H3();Lo(3),ad("selectedApiKeyId",e.selectedApiKeyId());}}function ai(i,t){i&1&&(mr(0,"mat-card-footer",10),yi$1(1," To obtain an API key: "),mr(2,"ol")(3,"li"),yi$1(4," Go to "),mr(5,"a",28),yi$1(6," Google AI Studio"),xr(),yi$1(7," and sign in with your Google account. "),xr(),mr(8,"li"),yi$1(9,"Click Create API key."),xr(),mr(10,"li"),yi$1(11,"Select or create a Google Cloud project when prompted, then click Create key."),xr(),mr(12,"li"),yi$1(13,"Save your key in a secure location!"),xr()(),yi$1(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),mr(15,"a",29),yi$1(16,"Web Crypto API"),xr(),yi$1(17,". Neither Google nor anyone else has access to this key. "),xr());}function oi(i,t){if(i&1&&(mr(0,"code"),yi$1(1),xr()),i&2){let e=H3();Lo(),rb("[System] Active renderer updated to ",e.activeRendererUrl());}}function ri(i,t){if(i&1&&(mr(0,"code",18),yi$1(1),xr()),i&2){let e=H3();Lo(),rb("[Catalog Error] ",e.catalogErrorMessage());}}function li(i,t){i&1&&(mr(0,"code",19),yi$1(1,"[System] Catalog handshake completed successfully. Active catalog ready."),xr());}function di(i,t){i&1&&(mr(0,"code"),yi$1(1,"[System] Catalog handshake in progress. Indexing metadata..."),xr());}function si(i,t){i&1&&(mr(0,"code"),yi$1(1,"[System] Bridge connected. Initializing catalog handshake..."),xr());}function ci(i,t){i&1&&(mr(0,"code"),yi$1(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),xr());}function mi(i,t){i&1&&(mr(0,"div",25),yi$1(1,"No MCP servers configured \u2014 click + to add"),xr());}function pi(i,t){if(i&1&&yi$1(0),i&2){let e=H3().$implicit;rb(" Connected (",e.tools?.length||0," tools) ");}}function gi(i,t){i&1&&yi$1(0," Connecting... ");}function ui(i,t){if(i&1&&yi$1(0),i&2){let e=H3().$implicit;rb(" Error: ",e.errorMessage||"Failed to connect"," ");}}function hi(i,t){i&1&&yi$1(0," Disconnected ");}function fi(i,t){if(i&1&&(mr(0,"span",38),yi$1(1),xr()),i&2){let e=H3().$implicit;Lo(),cm(e.url);}}function _i(i,t){if(i&1&&(mr(0,"span",44),yi$1(1),xr()),i&2){let e=t.$implicit;Lo(),cm(e.name);}}function vi(i,t){if(i&1&&(mr(0,"div",43),O3(1,_i,2,1,"span",44,ii),xr()),i&2){let e=H3().$implicit;Lo(),k3(e.tools);}}function yi(i,t){if(i&1){let e=$3();mr(0,"div",30)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),im("change",function(r){let s=ex(e).$implicit,v=H3(2);return tx(v.toggleMcpServer(s.id,r.checked))}),xr(),mr(4,"div",34)(5,"div",35)(6,"span",36),yi$1(7),xr(),mr(8,"span",37),id(9,pi,1,1)(10,gi,1,0)(11,ui,1,1)(12,hi,1,0),xr()(),id(13,fi,2,1,"span",38),xr()(),mr(14,"div",39)(15,"button",40),im("click",function(){let r=ex(e).$implicit,s=H3(2);return tx(s.testMcpServer(r.id))}),yi$1(16," Test "),xr(),mr(17,"button",41),im("click",function(){let r=ex(e).$implicit,s=H3(2);return tx(s.openEditMcpServerDialog(r))}),mr(18,"mat-icon",24),yi$1(19,"edit"),xr()(),mr(20,"button",42),im("click",function(){let r=ex(e).$implicit,s=H3(2);return tx(s.removeMcpServer(r.id))}),mr(21,"mat-icon",24),yi$1(22,"delete"),xr()()()(),id(23,vi,3,0,"div",43),xr();}if(i&2){let e=t.$implicit;Lo(3),ad("checked",e.enabled),jo("aria-label","Toggle "+(e.name||e.url)),Lo(4),cm(e.name||e.url),Lo(),jo("data-status",e.status),Lo(),sd(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),Lo(4),sd(e.name&&e.name!==e.url?13:-1),Lo(10),sd(e.tools&&e.tools.length>0?23:-1);}}function bi(i,t){if(i&1&&(mr(0,"div",26),O3(1,yi,24,7,"div",30,ti),xr()),i&2){let e=H3();Lo(),k3(e.mcpManager.servers());}}var Ft=class i{fb=C(zi);dialog=C(nf);destroyRef=C(an);startupResolution=C(Zg);startupConfigState=C(Bg);hostCommunication=C(VV);catalogManagement=C(se);configProvider=C(Cl);settingsService=C(K);mcpManager=C(_y);is1PAuthEnabled=C(gg);selectedRendererId=lt(null);selectedApiKeyId=dd(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=dd(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=lt(false);isApiKeyProvidedByConfig=dd(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=dd(()=>this.isApiKeyProvidedByConfig());hideApiKey=lt(true);forceThirdPartyAuth=lt(false);bridgeConnected=dd(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=dd(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=dd(()=>this.catalogManagement.catalogError());activeRendererUrl=dd(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){Ea(()=>{let t=this.settingsService.selectedRendererId()||"default";Ci(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}openAddMcpServerDialog(){this.dialog.open(fe,{width:"450px"}).afterClosed().pipe(zLe(this.destroyRef)).subscribe(e=>{e?.url&&this.mcpManager.addServer(e.url);});}openEditMcpServerDialog(t){this.dialog.open(fe,{width:"450px",data:{server:t}}).afterClosed().pipe(zLe(this.destroyRef)).subscribe(n=>{n?.url&&this.mcpManager.updateServerUrl(t.id,n.url);});}async removeMcpServer(t){await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=Xt$1({type:i,selectors:[["a2ui-composer-settings"]],decls:57,vars:13,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-card-header"],[1,"mcp-header-text"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click"],["aria-hidden","true"],[1,"mcp-empty-state"],[1,"mcp-server-list"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-item"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit MCP Server","aria-label","Edit MCP Server",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete MCP Server","aria-label","Delete MCP Server",1,"mcp-delete-btn",3,"click"],[1,"mcp-server-tools"],[1,"mcp-tool-name"]],template:function(e,n){e&1&&(mr(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),yi$1(4,"A2UI Composer Settings"),xr()(),mr(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),yi$1(9,"Renderer"),xr(),mr(10,"a2ui-composer-renderer-selector",5),im("rendererSelected",function(s){return n.onRendererSelected(s)}),xr()(),id(11,ni,4,1,"div",4),mr(12,"div",6)(13,"h3"),yi$1(14,"Developer Authentication Overrides"),xr(),mr(15,"p",7),yi$1(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),xr(),mr(17,"div",8)(18,"mat-slide-toggle",9),im("change",function(){return n.toggleForceThirdPartyAuth()}),yi$1(19," Force External Third-Party Authentication Mode "),xr()()()()(),id(20,ai,18,0,"mat-card-footer",10),xr(),mr(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),yi$1(24,"Connection Status & Diagnostics"),xr(),mr(25,"p",12),yi$1(26,"Real-time monitoring bridge"),xr()(),mr(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),yi$1(31),xr(),mr(32,"mat-chip",15),yi$1(33),xr()()(),mr(34,"div",16)(35,"h3"),yi$1(36,"Overlay Logs Preview"),xr(),mr(37,"div",17),id(38,oi,2,1,"code"),id(39,ri,2,1,"code",18)(40,li,2,0,"code",19)(41,di,2,0,"code")(42,si,2,0,"code")(43,ci,2,0,"code"),xr()()()(),mr(44,"mat-card",20)(45,"mat-card-header",21)(46,"div",22)(47,"h2",2),yi$1(48,"MCP Servers"),xr(),mr(49,"p",12),yi$1(50," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),xr()(),mr(51,"button",23),im("click",function(){return n.openAddMcpServerDialog()}),mr(52,"mat-icon",24),yi$1(53,"add_circle"),xr()()(),mr(54,"mat-card-content"),id(55,mi,2,0,"div",25)(56,bi,3,0,"div",26),xr()()()),e&2&&(Lo(6),ad("formGroup",n.settingsForm),Lo(4),ad("selectedRendererId",n.selectedRendererId()),Lo(),sd(n.isThirdParty()?11:-1),Lo(),ad("hidden",!n.is1PAuthEnabled),Lo(6),ad("checked",n.forceThirdPartyAuth()),Lo(2),sd(n.isThirdParty()?20:-1),Lo(10),ad("color",n.bridgeConnected()?"primary":"accent"),Lo(),rb("Bridge: ",n.bridgeConnected()?"Connected":"Disconnected"),Lo(),ad("color",n.catalogStatus()==="Connected"?"primary":n.catalogStatus()==="Indexing"?"accent":n.catalogStatus()==="Error"?"warn":void 0),Lo(),rb("Catalog Handshake: ",n.catalogStatus()),Lo(5),sd(n.activeRendererUrl()?38:-1),Lo(),sd(n.catalogErrorMessage()?39:n.catalogStatus()==="Connected"?40:n.catalogStatus()==="Indexing"?41:n.bridgeConnected()?42:43),Lo(16),sd(n.mcpManager.servers().length===0?55:56));},dependencies:[Zi,Wi,Hi,Qi,Xn,me,Dn,gL,mL,Yne,Di,Vi,E,F,k,z,T,S,j,ot,ki,ct,Et,Te,Yt$1,mt,rL,Ae,De],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto}.settings-container[_ngcontent-%COMP%]{padding:24px;max-width:600px;margin:0 auto}.form-section[_ngcontent-%COMP%]{margin-top:16px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-card[_ngcontent-%COMP%]{margin-top:24px}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-lowest);color:var(--mat-sys-primary);padding:12px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:700}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-small-size, 12px);padding-left:24px;padding-bottom:12px}.mcp-card-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mcp-card-header[_ngcontent-%COMP%]     .mat-mdc-card-header-text{display:none}.mcp-card-header[_ngcontent-%COMP%]   .mcp-header-text[_ngcontent-%COMP%]{flex:1;min-width:0}.mcp-card-header[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0;margin-top:-4px;margin-right:-8px}.mcp-empty-state[_ngcontent-%COMP%]{margin-top:16px;padding:16px;text-align:center;font-size:13px;font-style:italic;color:var(--mat-sys-on-surface-variant);border-radius:8px;border:1px dashed var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-lowest)}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:4px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{Ft as Settings};