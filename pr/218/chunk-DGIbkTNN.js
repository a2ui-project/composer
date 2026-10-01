import {E,F,k,z,T,S,j}from'./chunk-CI-7gG6z.js';import {_,an as Rf,a7 as Bn,F as FB,c as cB,L as tZ,s as se,V as Vu,ao as fv,cu as aB,y as yt,N as Nd,b as $a,a0 as Ri,Q as Rze,l as ln$1,I as IL,S as SL,d as lie,ar as hL,g as br,h as Oi$1,i as $r,z as zm,x as xd,K as Ko,k as kd,o as Td,W as Wb,q as qr,cv as MB,$ as $s,X,aq as f,p as pe$1,aF as Of,aA as zw,aB as cL,aC as lL,aD as fL,aE as dL,u as uR,ah as k3,U as Um,ai as O3,R as Rt,r as xt,t as wo,v as pt,bc as kf,a9 as Jm,b6 as V,bn as Ji,bg as bt,bu as Jr,bv as bL,bE as RR,c8 as ui,cw as f$e,bM as qo,by as dn$1,B as mu,C as ei,aP as t6,m as zr$1,j as Xo,a4 as Kb,cx as Xl,cc as UR,cs as Ad,J as Jb,ba as Rd,E as jm,H as Hm,ax as jR,ay as ZTe,b4 as Kn,aI as J8,av as Y8,aG as j8,aH as H8,cd as Dk,G as Tt,aJ as lk,aK as dk}from'./main.js';import {o as ot,k as ki$1,c as ct}from'./chunk-Cy4fVpHK.js';import {Y as Yt,m as mt}from'./chunk---KKJEs2.js';import {m as me,V as Vr,W as Wt$1,B as Be,z as zr,a as zo,L as Lo,P as Po,F as Fe$1,O as Oi$2}from'./chunk-DTE6ZA5T.js';import {k as ki,O as Oi,b as Ni,w as wi,a as Ri$1,U as Un,c as ci,l as li,N as Ne,A as At,I as Ii,j as jn,d as je,J}from'./chunk-CLJxmV4K.js';var $t=["*"],zt=(()=>{class i{labelPosition="after";static \u0275fac=function(n){return new(n||i)};static \u0275cmp=ln$1({type:i,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(n,r){n&2&&zr$1("mdc-form-field--align-end",r.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:$t,decls:1,vars:0,template:function(n,r){n&1&&(mu(),ei(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return i})();var qt=["switch"],Ht=["*"];function Wt(i,t){i&1&&(br(0,"span",11),Dk(),br(1,"svg",13),uR(2,"path",14),$r(),br(3,"svg",15),uR(4,"path",16),$r()());}var Xt=new V("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),Re=class{source;checked;constructor(t,e){this.source=t,this.checked=e;}},Fe=(()=>{class i{_elementRef=_(pt);_focusMonitor=_(kf);_changeDetectorRef=_(Jm);defaults=_(Xt);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new Re(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Ji();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new bt;toggleChange=new bt;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){_(Jr).load(bL);let e=_(new RR("tabindex"),{optional:true}),n=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=n.color||"accent",this.id=this._uniqueId=_(ui).getId("mat-mdc-slide-toggle-"),this.hideIcon=n.hideIcon??false,this.disabledInteractive=n.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new Re(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(n){return new(n||i)};static \u0275cmp=ln$1({type:i,selectors:[["mat-slide-toggle"]],viewQuery:function(n,r){if(n&1&&Rd(qt,5),n&2){let l;jm(l=Hm())&&(r._switchElement=l.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(n,r){n&2&&(Ad("id",r.id),Xo("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),Jb(r.color?"mat-"+r.color:""),zr$1("mat-mdc-slide-toggle-focused",r._focused)("mat-mdc-slide-toggle-checked",r.checked)("_mat-animation-noopable",r._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",dn$1],color:"color",disabled:[2,"disabled","disabled",dn$1],disableRipple:[2,"disableRipple","disableRipple",dn$1],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:UR(e)],checked:[2,"checked","checked",dn$1],hideIcon:[2,"hideIcon","hideIcon",dn$1],disabledInteractive:[2,"disabledInteractive","disabledInteractive",dn$1]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[Kb([{provide:je,useExisting:Xl(()=>i),multi:true},{provide:J,useExisting:i,multi:true}]),qo],ngContentSelectors:Ht,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(n,r){if(n&1&&(mu(),br(0,"div",1)(1,"button",2,0),zm("click",function(){return r._handleClick()}),uR(3,"div",3)(4,"span",4),br(5,"span",5)(6,"span",6)(7,"span",7),uR(8,"span",8),$r(),br(9,"span",9),uR(10,"span",10),$r(),xd(11,Wt,5,0,"span",11),$r()()(),br(12,"label",12),zm("click",function(g){return g.stopPropagation()}),ei(13),$r()()),n&2){let l=t6(2);kd("labelPosition",r.labelPosition),Ko(),zr$1("mdc-switch--selected",r.checked)("mdc-switch--unselected",!r.checked)("mdc-switch--checked",r.checked)("mdc-switch--disabled",r.disabled)("mat-mdc-slide-toggle-disabled-interactive",r.disabledInteractive),kd("tabIndex",r.disabled&&!r.disabledInteractive?-1:r.tabIndex)("disabled",r.disabled&&!r.disabledInteractive),Xo("id",r.buttonId)("name",r.name)("aria-label",r.ariaLabel)("aria-labelledby",r._getAriaLabelledBy())("aria-describedby",r.ariaDescribedby)("aria-required",r.required||null)("aria-checked",r.checked)("aria-disabled",r.disabled&&r.disabledInteractive?"true":null),Ko(9),kd("matRippleTrigger",l)("matRippleDisabled",r.disableRipple||r.disabled)("matRippleCentered",true),Ko(),Td(r.hideIcon?-1:11),Ko(),kd("for",r.buttonId),Xo("id",r._labelId);}},dependencies:[f$e,zt],styles:[`.mdc-switch {
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
`],encapsulation:2})}return i})(),Ut=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=Rt({type:i});static \u0275inj=xt({imports:[Fe,wo]})}return i})();var I=class i{logger=_(qr).withTag("[Settings]");startupResolution=_(FB);startupConfigState=_(cB);configProvider=_(Vu);secureCredentialsStorage=_(MB);localStorageInteractions=_($s);usageTrackingService=_(X);renderers=Nd(()=>this.startupConfigState.renderers());selectedRendererId=Nd(()=>this.startupConfigState.selectedRendererId());activeRenderer=Nd(()=>this.startupConfigState.activeRenderer());async selectRenderer(t){let e=this.selectedRendererId();if(!await this.startupResolution.setSelectedRendererId(t))return  false;this.usageTrackingService.trackRendererSwitch({fromRendererId:e,toRendererId:t||""}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_renderer",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer");let r=this.activeRenderer();r?.rendererUrl?this.configProvider.setRendererUrl(r.rendererUrl):this.configProvider.setRendererUrl("");let l=typeof r?.apiKey=="string"?r.apiKey.trim():"";if(l)this.configProvider.setApiKeyFromConfig(l);else try{await this.syncEffectiveApiKeyToConfigProvider();}catch(g){this.logger.warn("Failed to resolve effective API key during renderer selection:",g);}return  true}_selectedApiKeyId=yt(this.localStorageInteractions.getItem("a2ui_composer_selected_api_key")||null);selectedApiKeyId=Nd(()=>{let t=this._selectedApiKeyId();return t||((this.startupConfigState.apiKeys()||{}).default!==void 0?"default":null)});_effectiveApiKey=yt("");effectiveApiKey=this._effectiveApiKey.asReadonly();getStaticApiKeys(){return this.startupConfigState.apiKeys()||{}}async getAvailableApiKeys(){let t=this.getStaticApiKeys(),e=Object.entries(t).map(([l,g])=>({id:l,name:g.displayName||l,key:g.apiKey||"",readOnly:true})),r=(await this.secureCredentialsStorage.getCustomApiKeys()).filter(l=>!Object.prototype.hasOwnProperty.call(t,l.id)).map(l=>({id:l.id,name:l.name,key:l.key,readOnly:false}));return [...e,...r]}async selectApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"select"}),t?this.localStorageInteractions.setItem("a2ui_composer_selected_api_key",t):this.localStorageInteractions.removeItem("a2ui_composer_selected_api_key"),this._selectedApiKeyId.set(t),await this.syncEffectiveApiKeyToConfigProvider();}async getEffectiveApiKey(){let t=this.selectedApiKeyId(),e=this.getStaticApiKeys();if(t&&e[t]){let l=e[t].apiKey||"";return this._effectiveApiKey.set(l),l}if(t){let l=await this.secureCredentialsStorage.getCustomApiKey(t);return l?(this._effectiveApiKey.set(l.key),l.key):(this._effectiveApiKey.set(""),"")}let n=await this.secureCredentialsStorage.getCustomApiKeys(),r=n.find(l=>l.id==="default")||n[0];if(r){let l=r.key;return this._effectiveApiKey.set(l),l}return this._effectiveApiKey.set(""),""}async saveCustomApiKey(t,e,n){let r=this.getStaticApiKeys();if(Object.prototype.hasOwnProperty.call(r,t))throw new Error(`Cannot save custom API key with ID "${t}": collides with a static configuration key.`);this.usageTrackingService.trackApiKeyUpdate({action:"add"}),await this.secureCredentialsStorage.saveCustomApiKey(t,e,n),await this.syncEffectiveApiKeyToConfigProvider();}async deleteCustomApiKey(t){this.usageTrackingService.trackApiKeyUpdate({action:"delete"}),await this.secureCredentialsStorage.deleteCustomApiKey(t),this._selectedApiKeyId()===t?await this.selectApiKey(null):await this.syncEffectiveApiKeyToConfigProvider();}async syncEffectiveApiKeyToConfigProvider(){let t=await this.getEffectiveApiKey(),e=this._selectedApiKeyId(),n=this.getStaticApiKeys();return e&&n[e]?this.configProvider.setApiKeyFromConfig(t):!e&&n.default?this.configProvider.setApiKeyFromConfig(t):this.configProvider.setRuntimeApiKey(t),t}getStaticRenderersMap(){return this.startupConfigState.renderers()||{}}getCustomRenderers(){let t=this.localStorageInteractions.getItem("a2ui_composer_custom_renderers");if(!t)return [];try{let e=JSON.parse(t);return Array.isArray(e)?e.filter(n=>n&&typeof n=="object"&&!!String(n.id||"").trim()).map(n=>({id:String(n?.id||"").trim(),name:String(n?.name||""),rendererUrl:String(n?.rendererUrl||"")})):[]}catch(e){return this.logger.warn("Failed to parse custom renderers from LocalStorage:",e),[]}}getRenderers(){let t=this.getStaticRenderersMap(),e=Object.entries(t).map(([l,g])=>({id:l,name:g?.displayName||g?.name||l,rendererUrl:g?.rendererUrl||"",readOnly:true})),n=new Set(e.map(l=>l.name)),r=this.getCustomRenderers().filter(l=>!Object.prototype.hasOwnProperty.call(t,l.id)).map(l=>({id:l.id,name:n.has(l.name)?`${l.name} (local)`:l.name,rendererUrl:l.rendererUrl,readOnly:false}));return [...e,...r]}saveCustomRenderer(t){let e=(t.id||"").trim(),n=(t.name||"").trim(),r=(t.rendererUrl||"").trim();if(!e||!n||!r)throw new Error("Custom renderer id, name, and rendererUrl must not be empty.");if(!/^https?:\/\//i.test(r))throw new Error("Custom renderer URL must start with http:// or https://");let l=this.getStaticRenderersMap();if(Object.prototype.hasOwnProperty.call(l,e))throw new Error(`Cannot save custom renderer with ID "${e}": collides with a static configuration renderer.`);let g=this.getCustomRenderers(),Le=g.findIndex(jt=>jt.id===e);Le>=0?(g[Le]={id:e,name:n,rendererUrl:r},this.usageTrackingService.trackRendererEdit({rendererId:e})):(g.push({id:e,name:n,rendererUrl:r}),this.usageTrackingService.trackRendererAdd({rendererId:e})),this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(g));let Ve=f({},this.startupConfigState.renderers());Ve[e]={id:e,name:n,rendererUrl:r},this.startupConfigState.setRenderers(Ve);}deleteCustomRenderer(t){this.usageTrackingService.trackRendererDelete({rendererId:t});let e=this.getCustomRenderers().filter(r=>r.id!==t);this.localStorageInteractions.setItem("a2ui_composer_custom_renderers",JSON.stringify(e));let n=f({},this.startupConfigState.renderers());delete n[t],this.startupConfigState.setRenderers(n),this.selectedRendererId()===t&&(this.localStorageInteractions.removeItem("a2ui_composer_selected_renderer"),this.selectRenderer(null));}static \u0275fac=function(e){return new(e||i)};static \u0275prov=pe$1({token:i,factory:i.\u0275fac,providedIn:"root"})};function Qt(i,t){if(i&1&&(br(0,"div",5),Oi$1(1),$r()),i&2){let e=Y8();Ko(),Um(e.errorMessage());}}function ze(i){let t=i.value;if(!t)return null;try{let e=new URL(t.trim());return ["http:","https:"].includes(e.protocol)&&e.host?null:{invalidUrl:!0}}catch{return {invalidUrl:true}}}var pe=class i{fb=_(ki);settingsService=_(I);dialogRef=_(Of);data=_(zw,{optional:true});errorMessage=yt(null);form=this.fb.group({name:[this.data?.renderer?.name??"",[Ne.required,Ne.pattern(/\S/)]],rendererUrl:[this.data?.renderer?.rendererUrl??"",[Ne.required,ze]]});onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.rendererUrl.value.trim(),n=this.data?.renderer?.id||`custom-${Date.now()}`;try{this.settingsService.saveCustomRenderer({id:n,name:t,rendererUrl:e}),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom renderer.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ln$1({type:i,selectors:[["a2ui-composer-add-renderer-dialog"]],decls:18,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","renderer-name-input","formControlName","name","placeholder","My Renderer"],["matInput","","id","renderer-url-input","formControlName","rendererUrl","placeholder","http://localhost:3000"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(br(0,"h2",0),Oi$1(1),$r(),br(2,"mat-dialog-content")(3,"form",1),zm("ngSubmit",function(l){return l.preventDefault(),n.onConfirm()}),br(4,"mat-form-field",2)(5,"mat-label"),Oi$1(6,"Name"),$r(),uR(7,"input",3),k3(),$r(),br(8,"mat-form-field",2)(9,"mat-label"),Oi$1(10,"Renderer URL"),$r(),uR(11,"input",4),k3(),$r(),xd(12,Qt,2,1,"div",5),$r()(),br(13,"mat-dialog-actions",6)(14,"button",7),Oi$1(15,"Cancel"),$r(),br(16,"button",8),zm("click",function(){return n.onConfirm()}),Oi$1(17),$r()()),e&2&&(Ko(),Um(n.data?.renderer?"Edit Custom Renderer":"Add Custom Renderer"),Ko(2),kd("formGroup",n.form),Ko(4),O3(),Ko(4),O3(),Ko(),Td(n.errorMessage()?12:-1),Ko(4),kd("disabled",n.form.invalid),Ko(),Wb(" ",n.data?.renderer?"Save":"Add"," "));},dependencies:[Ri$1,Ni,At,Ii,wi,Un,jn,hL,cL,lL,fL,dL,me,Wt$1,Be,Vr,zr,IL,SL],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var ce=class i{disabled=jR(false);dialog=_(Rf);destroyRef=_(Bn);items=yt([]);selectedItem=Nd(()=>{let t=this.getSelectedId();if(t)return this.items().find(e=>e.id===t)});onSelectionChange(t){t!=null&&this.emitSelection(t);}async handleAdd(t,e){e?.preventDefault(),e?.stopPropagation(),this.dialog.open(t,{width:"450px"}).afterClosed().pipe(Rze(this.destroyRef)).subscribe(async r=>{r&&(await this.refreshItems(),this.emitSelection(r));});}async handleEdit(t,e,n,r){if(e.stopPropagation(),e.preventDefault(),n.readOnly)return;this.dialog.open(t,{width:"450px",data:{[r]:n}}).afterClosed().pipe(Rze(this.destroyRef)).subscribe(async g=>{g&&(await this.refreshItems(),this.getSelectedId()===g&&this.emitSelection(g));});}async handleDelete(t,e,n=null){t.stopPropagation(),t.preventDefault(),!this.items().find(l=>l.id===e)?.readOnly&&(await this.deleteItem(e),await this.refreshItems(),this.getSelectedId()===e&&this.emitSelection(n));}static \u0275fac=function(e){return new(e||i)};static \u0275dir=Tt({type:i,inputs:{disabled:[1,"disabled"]}})};var Zt=(i,t)=>t.id;function en(i,t){if(i&1&&(br(0,"span",5),Oi$1(1),$r()),i&2){let e=Y8();Ko(),Um(e.selectedItem()?.rendererUrl);}}function tn(i,t){i&1&&(br(0,"mat-option",6),Oi$1(1,"No items available \u2014 click + to add"),$r()),i&2&&kd("disabled",true);}function nn(i,t){if(i&1){let e=J8();br(0,"mat-option",8)(1,"div",9)(2,"div",10),Oi$1(3),$r(),br(4,"div",5),Oi$1(5),$r()(),br(6,"button",11),zm("click",function(r){let l=lk(e).$implicit,g=Y8(2);return dk(g.onEditRenderer(r,l))})("keydown",function(r){return r.stopPropagation()}),br(7,"mat-icon",12),Oi$1(8,"edit"),$r()(),br(9,"button",13),zm("click",function(r){let l=lk(e).$implicit,g=Y8(2);return dk(g.onDeleteRenderer(r,l.id))})("keydown",function(r){return r.stopPropagation()}),br(10,"mat-icon",12),Oi$1(11,"delete"),$r()()();}if(i&2){let e=t.$implicit;kd("value",e.id),Ko(3),Um(e.name),Ko(2),Um(e.rendererUrl),Ko(),kd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit renderer"),Xo("aria-label","Edit "+e.name),Ko(3),kd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete renderer"),Xo("aria-label","Delete "+e.name);}}function rn(i,t){if(i&1&&j8(0,nn,12,9,"mat-option",8,Zt),i&2){let e=Y8();H8(e.items());}}var Oe=class i extends ce{selectedRendererId=jR("default");rendererSelected=ZTe();settingsService=_(I);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedRendererId()}refreshItems(){let t=this.settingsService.getRenderers();this.items.set(t);}emitSelection(t){t&&this.rendererSelected.emit(t);}deleteItem(t){this.settingsService.deleteCustomRenderer(t);}onAddRenderer(t){this.handleAdd(pe,t);}onEditRenderer(t,e){this.handleEdit(pe,t,e,"renderer");}onDeleteRenderer(t,e){this.handleDelete(t,e,"default");}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ln$1({type:i,selectors:[["a2ui-composer-renderer-selector"]],inputs:{selectedRendererId:[1,"selectedRendererId"]},outputs:{rendererSelected:"rendererSelected"},features:[Kn],decls:15,vars:6,consts:[[1,"renderer-selector-container"],["appearance","outline",1,"renderer-selector-form-field"],["id","renderer-select",3,"selectionChange","value","disabled"],[1,"renderer-trigger-content"],[1,"renderer-name"],[1,"renderer-url-subtext"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add custom renderer",1,"add-renderer-button",3,"click","disabled"],[1,"renderer-option",3,"value"],[1,"renderer-option-content"],[1,"renderer-option-label"],["mat-icon-button","","type","button",1,"edit-renderer-button",3,"click","keydown","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-renderer-button",3,"click","keydown","disabled","matTooltip"]],template:function(e,n){e&1&&(br(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Oi$1(3,"Renderer"),$r(),br(4,"mat-select",2),zm("selectionChange",function(l){return n.onSelectionChange(l.value)}),br(5,"mat-select-trigger")(6,"div",3)(7,"span",4),Oi$1(8),$r(),xd(9,en,2,1,"span",5),$r()(),xd(10,tn,2,1,"mat-option",6)(11,rn,2,0),$r()(),br(12,"button",7),zm("click",function(l){return n.onAddRenderer(l)}),br(13,"mat-icon"),Oi$1(14,"add_circle"),$r()()()),e&2&&(Ko(4),kd("value",n.selectedRendererId())("disabled",n.disabled()),Ko(4),Um(n.selectedItem()?.name),Ko(),Td(n.selectedItem()?.rendererUrl?9:-1),Ko(),Td(n.items().length===0?10:11),Ko(2),kd("disabled",n.disabled()));},dependencies:[me,Wt$1,Be,zo,Lo,Po,Fe$1,IL,lie,ci,li,Yt,mt,hL],styles:[".renderer-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.renderer-selector-form-field[_ngcontent-%COMP%]{flex:1}.renderer-trigger-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;line-height:normal}.renderer-trigger-content[_ngcontent-%COMP%]   .renderer-name[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-option[_ngcontent-%COMP%]{height:auto!important;line-height:normal!important;padding-top:8px!important;padding-bottom:8px!important}.renderer-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .renderer-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.renderer-option-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden}.renderer-option-label[_ngcontent-%COMP%]{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.renderer-url-subtext[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-renderer-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .edit-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .edit-renderer-button[_ngcontent-%COMP%]{opacity:1}.edit-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-renderer-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.renderer-option[_ngcontent-%COMP%]:hover   .delete-renderer-button[_ngcontent-%COMP%], .renderer-option[_ngcontent-%COMP%]:focus-within   .delete-renderer-button[_ngcontent-%COMP%]{opacity:1}.delete-renderer-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function an(i,t){if(i&1&&(br(0,"div",7),Oi$1(1),$r()),i&2){let e=Y8();Ko(),Um(e.errorMessage());}}var he=class i{fb=_(ki);settingsService=_(I);dialogRef=_(Of);data=_(zw,{optional:true});errorMessage=yt(null);hideApiKey=yt(true);form=this.fb.group({name:[this.data?.apiKey?.name??"",[Ne.required,Ne.pattern(/\S/)]],apiKey:[this.data?.apiKey?.key??"",[Ne.required,Ne.pattern(/\S/)]]});toggleHideApiKey(){this.hideApiKey.update(t=>!t);}async onConfirm(){if(this.form.invalid){this.form.markAllAsTouched();return}this.errorMessage.set(null);let t=this.form.controls.name.value.trim(),e=this.form.controls.apiKey.value.trim(),n=this.data?.apiKey?.id||`custom-${Date.now()}`;try{await this.settingsService.saveCustomApiKey(n,t,e),this.dialogRef.close(n);}catch(r){this.errorMessage.set(r instanceof Error?r.message:"Failed to save custom API key.");}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ln$1({type:i,selectors:[["a2ui-composer-add-api-key-dialog"]],decls:21,vars:8,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","api-key-name-input","formControlName","name","placeholder","My Gemini Key"],["matInput","","id","api-key-value-input","formControlName","apiKey","placeholder","Paste your API key here",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","submit","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(br(0,"h2",0),Oi$1(1),$r(),br(2,"mat-dialog-content")(3,"form",1),zm("ngSubmit",function(l){return l.preventDefault(),n.onConfirm()}),br(4,"mat-form-field",2)(5,"mat-label"),Oi$1(6,"Name"),$r(),uR(7,"input",3),k3(),$r(),br(8,"mat-form-field",2)(9,"mat-label"),Oi$1(10,"API Key"),$r(),uR(11,"input",4),k3(),br(12,"button",5),zm("click",function(){return n.toggleHideApiKey()}),br(13,"mat-icon",6),Oi$1(14),$r()()(),xd(15,an,2,1,"div",7),$r()(),br(16,"mat-dialog-actions",8)(17,"button",9),Oi$1(18,"Cancel"),$r(),br(19,"button",10),zm("click",function(){return n.onConfirm()}),Oi$1(20),$r()()),e&2&&(Ko(),Um(n.data?.apiKey?"Edit Gemini API Key":"Add Gemini API Key"),Ko(2),kd("formGroup",n.form),Ko(4),O3(),Ko(4),kd("type",n.hideApiKey()?"password":"text"),O3(),Ko(),Xo("aria-label",n.hideApiKey()?"Show API key":"Hide API key"),Ko(2),Um(n.hideApiKey()?"visibility":"visibility_off"),Ko(),Td(n.errorMessage()?15:-1),Ko(4),kd("disabled",n.form.invalid),Ko(),Wb(" ",n.data?.apiKey?"Save":"Add"," "));},dependencies:[Ri$1,Ni,At,Ii,wi,Un,jn,hL,cL,lL,fL,dL,me,Wt$1,Be,Oi$2,Vr,zr,IL,SL,lie,ci,li],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var on=(i,t)=>t.id;function ln(i,t){i&1&&(br(0,"mat-option",3),Oi$1(1,"No items available \u2014 click + to add"),$r()),i&2&&kd("disabled",true);}function dn(i,t){if(i&1){let e=J8();br(0,"mat-option",5)(1,"span",6),Oi$1(2),$r(),br(3,"button",7),zm("keydown",function(r){return r.stopPropagation()})("click",function(r){let l=lk(e).$implicit,g=Y8(2);return dk(g.onEditApiKey(r,l))}),br(4,"mat-icon",8),Oi$1(5,"edit"),$r()(),br(6,"button",9),zm("keydown",function(r){return r.stopPropagation()})("click",function(r){let l=lk(e).$implicit,g=Y8(2);return dk(g.onDeleteApiKey(r,l.id))}),br(7,"mat-icon",8),Oi$1(8,"delete"),$r()()();}if(i&2){let e=t.$implicit;kd("value",e.id),Ko(2),Um(e.name),Ko(),kd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be edited":"Edit API key"),Xo("aria-label","Edit "+e.name),Ko(3),kd("disabled",e.readOnly)("matTooltip",e.readOnly?"Static configuration items cannot be deleted":"Delete API key"),Xo("aria-label","Delete "+e.name);}}function sn(i,t){if(i&1&&j8(0,dn,9,8,"mat-option",5,on),i&2){let e=Y8();H8(e.items());}}var De=class i extends ce{selectedApiKeyId=jR(null);apiKeySelected=ZTe();settingsService=_(I);constructor(){super(),this.refreshItems();}getSelectedId(){return this.selectedApiKeyId()}async refreshItems(){let t=await this.settingsService.getAvailableApiKeys();this.items.set(t);}emitSelection(t){this.apiKeySelected.emit(t);}async deleteItem(t){await this.settingsService.deleteCustomApiKey(t);}onAddApiKey(t){this.handleAdd(he,t);}onEditApiKey(t,e){this.handleEdit(he,t,e,"apiKey");}onDeleteApiKey(t,e){this.handleDelete(t,e,null);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ln$1({type:i,selectors:[["a2ui-composer-api-key-selector"]],inputs:{selectedApiKeyId:[1,"selectedApiKeyId"]},outputs:{apiKeySelected:"apiKeySelected"},features:[Kn],decls:12,vars:5,consts:[[1,"api-key-selector-container"],["appearance","outline",1,"api-key-selector-form-field"],["id","api-key-select",3,"selectionChange","value","disabled"],[1,"empty-state-option",3,"disabled"],["mat-icon-button","","type","button","aria-label","Add Gemini API key",1,"add-api-key-button",3,"click","disabled"],[1,"api-key-option",3,"value"],[1,"api-key-option-label"],["mat-icon-button","","type","button",1,"edit-api-key-button",3,"keydown","click","disabled","matTooltip"],["aria-hidden","true"],["mat-icon-button","","type","button",1,"delete-api-key-button",3,"keydown","click","disabled","matTooltip"]],template:function(e,n){e&1&&(br(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),Oi$1(3,"API Key"),$r(),br(4,"mat-select",2),zm("selectionChange",function(l){return n.onSelectionChange(l.value)}),br(5,"mat-select-trigger"),Oi$1(6),$r(),xd(7,ln,2,1,"mat-option",3)(8,sn,2,0),$r()(),br(9,"button",4),zm("click",function(l){return n.onAddApiKey(l)}),br(10,"mat-icon"),Oi$1(11,"add_circle"),$r()()()),e&2&&(Ko(4),kd("value",n.selectedApiKeyId())("disabled",n.disabled()),Ko(2),Wb(" ",n.selectedItem()?.name," "),Ko(),Td(n.items().length===0?7:8),Ko(2),kd("disabled",n.disabled()));},dependencies:[me,Wt$1,Be,zo,Lo,Po,Fe$1,IL,lie,ci,li,Yt,mt,hL],styles:[".api-key-selector-container[_ngcontent-%COMP%]{display:flex;width:100%}.api-key-selector-form-field[_ngcontent-%COMP%]{flex:1}.api-key-option[_ngcontent-%COMP%]     .mdc-list-item__primary-text, .api-key-option[_ngcontent-%COMP%]     .mat-mdc-option-text{display:flex;align-items:center;width:100%;overflow:hidden}.api-key-option-label[_ngcontent-%COMP%]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.edit-api-key-button[_ngcontent-%COMP%]{margin-left:auto;flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .edit-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .edit-api-key-button[_ngcontent-%COMP%]{opacity:1}.edit-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.delete-api-key-button[_ngcontent-%COMP%]{flex-shrink:0;opacity:0;transition:opacity .15s ease-in-out}.api-key-option[_ngcontent-%COMP%]:hover   .delete-api-key-button[_ngcontent-%COMP%], .api-key-option[_ngcontent-%COMP%]:focus-within   .delete-api-key-button[_ngcontent-%COMP%]{opacity:1}.delete-api-key-button[disabled][_ngcontent-%COMP%]{pointer-events:auto}.empty-state-option[_ngcontent-%COMP%]{font-style:italic}"]})};function cn(i,t){if(i&1&&(br(0,"div",4),Oi$1(1),$r()),i&2){let e=Y8();Ko(),Um(e.errorMessage());}}var fe=class i{fb=_(ki);dialogRef=_(Of);data=_(zw,{optional:true});errorMessage=yt(null);form=this.fb.group({url:[this.data?.server?.url??"",[Ne.required,ze]]});onConfirm(){this.errorMessage.set(null);let t=this.form.controls.url.value.trim();this.dialogRef.close({url:t});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ln$1({type:i,selectors:[["a2ui-composer-mcp-server-dialog"]],decls:14,vars:5,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","id","mcp-server-url-input","formControlName","url","placeholder","http://localhost:3001/mcp"],["role","alert",1,"error-message"],["align","end"],["mat-button","","type","button","mat-dialog-close",""],["mat-button","","type","button","color","primary",3,"click","disabled"]],template:function(e,n){e&1&&(br(0,"h2",0),Oi$1(1),$r(),br(2,"mat-dialog-content")(3,"form",1),zm("ngSubmit",function(l){return l.preventDefault(),n.onConfirm()}),br(4,"mat-form-field",2)(5,"mat-label"),Oi$1(6,"Server URL"),$r(),uR(7,"input",3),k3(),$r(),xd(8,cn,2,1,"div",4),$r()(),br(9,"mat-dialog-actions",5)(10,"button",6),Oi$1(11,"Cancel"),$r(),br(12,"button",7),zm("click",function(){return n.onConfirm()}),Oi$1(13),$r()()),e&2&&(Ko(),Um(n.data?.server?"Edit MCP Server":"Add MCP Server"),Ko(2),kd("formGroup",n.form),Ko(4),O3(),Ko(),Td(n.errorMessage()?8:-1),Ko(4),kd("disabled",n.form.invalid),Ko(),Wb(" ",n.data?.server?"Save":"Add"," "));},dependencies:[Ri$1,Ni,At,Ii,wi,Un,jn,hL,cL,lL,fL,dL,me,Wt$1,Be,Vr,zr,IL,SL],styles:["mat-dialog-content[_ngcontent-%COMP%]{padding-top:12px}.full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:12px;margin-top:4px}.error-message[_ngcontent-%COMP%]{color:var(--mat-sys-error, #b3261e);font-size:.875rem;margin-top:8px}"]})};var mn=(i,t)=>t.id,pn=(i,t)=>t.name;function gn(i,t){if(i&1){let e=J8();br(0,"div",4)(1,"h3"),Oi$1(2,"Gemini API Provisioning"),$r(),br(3,"a2ui-composer-api-key-selector",27),zm("apiKeySelected",function(r){lk(e);let l=Y8();return dk(l.onApiKeySelected(r))}),$r()();}if(i&2){let e=Y8();Ko(3),kd("selectedApiKeyId",e.selectedApiKeyId());}}function un(i,t){i&1&&(br(0,"mat-card-footer",10),Oi$1(1," To obtain an API key: "),br(2,"ol")(3,"li"),Oi$1(4," Go to "),br(5,"a",28),Oi$1(6," Google AI Studio"),$r(),Oi$1(7," and sign in with your Google account. "),$r(),br(8,"li"),Oi$1(9,"Click Create API key."),$r(),br(10,"li"),Oi$1(11,"Select or create a Google Cloud project when prompted, then click Create key."),$r(),br(12,"li"),Oi$1(13,"Save your key in a secure location!"),$r()(),Oi$1(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),br(15,"a",29),Oi$1(16,"Web Crypto API"),$r(),Oi$1(17,". Neither Google nor anyone else has access to this key. "),$r());}function hn(i,t){if(i&1&&(br(0,"code"),Oi$1(1),$r()),i&2){let e=Y8();Ko(),Wb("[System] Active renderer updated to ",e.activeRendererUrl());}}function fn(i,t){if(i&1&&(br(0,"code",18),Oi$1(1),$r()),i&2){let e=Y8();Ko(),Wb("[Catalog Error] ",e.catalogErrorMessage());}}function yn(i,t){i&1&&(br(0,"code",19),Oi$1(1,"[System] Catalog handshake completed successfully. Active catalog ready."),$r());}function vn(i,t){i&1&&(br(0,"code"),Oi$1(1,"[System] Catalog handshake in progress. Indexing metadata..."),$r());}function _n(i,t){i&1&&(br(0,"code"),Oi$1(1,"[System] Bridge connected. Initializing catalog handshake..."),$r());}function bn(i,t){i&1&&(br(0,"code"),Oi$1(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),$r());}function Cn(i,t){i&1&&(br(0,"div",25),Oi$1(1,"No MCP servers configured \u2014 click + to add"),$r());}function wn(i,t){if(i&1&&Oi$1(0),i&2){let e=Y8().$implicit;Wb(" Connected (",e.tools?.length||0," tools) ");}}function Sn(i,t){i&1&&Oi$1(0," Connecting... ");}function Mn(i,t){if(i&1&&Oi$1(0),i&2){let e=Y8().$implicit;Wb(" Error: ",e.errorMessage||"Failed to connect"," ");}}function xn(i,t){i&1&&Oi$1(0," Disconnected ");}function kn(i,t){if(i&1&&(br(0,"span",38),Oi$1(1),$r()),i&2){let e=Y8().$implicit;Ko(),Um(e.url);}}function Pn(i,t){if(i&1&&(br(0,"span",44),Oi$1(1),$r()),i&2){let e=t.$implicit;Ko(),Um(e.name);}}function An(i,t){if(i&1&&(br(0,"div",43),j8(1,Pn,2,1,"span",44,pn),$r()),i&2){let e=Y8().$implicit;Ko(),H8(e.tools);}}function In(i,t){if(i&1){let e=J8();br(0,"div",30)(1,"div",31)(2,"div",32)(3,"mat-slide-toggle",33),zm("change",function(r){let l=lk(e).$implicit,g=Y8(2);return dk(g.toggleMcpServer(l.id,r.checked))}),$r(),br(4,"div",34)(5,"div",35)(6,"span",36),Oi$1(7),$r(),br(8,"span",37),xd(9,wn,1,1)(10,Sn,1,0)(11,Mn,1,1)(12,xn,1,0),$r()(),xd(13,kn,2,1,"span",38),$r()(),br(14,"div",39)(15,"button",40),zm("click",function(){let r=lk(e).$implicit,l=Y8(2);return dk(l.testMcpServer(r.id))}),Oi$1(16," Test "),$r(),br(17,"button",41),zm("click",function(){let r=lk(e).$implicit,l=Y8(2);return dk(l.openEditMcpServerDialog(r))}),br(18,"mat-icon",24),Oi$1(19,"edit"),$r()(),br(20,"button",42),zm("click",function(){let r=lk(e).$implicit,l=Y8(2);return dk(l.removeMcpServer(r.id))}),br(21,"mat-icon",24),Oi$1(22,"delete"),$r()()()(),xd(23,An,3,0,"div",43),$r();}if(i&2){let e=t.$implicit;Ko(3),kd("checked",e.enabled),Xo("aria-label","Toggle "+(e.name||e.url)),Ko(4),Um(e.name||e.url),Ko(),Xo("data-status",e.status),Ko(),Td(e.status==="connected"?9:e.status==="connecting"?10:e.status==="error"?11:12),Ko(4),Td(e.name&&e.name!==e.url?13:-1),Ko(10),Td(e.tools&&e.tools.length>0?23:-1);}}function Rn(i,t){if(i&1&&(br(0,"div",26),j8(1,In,24,7,"div",30,mn),$r()),i&2){let e=Y8();Ko(),H8(e.mcpManager.servers());}}var Gt=class i{fb=_(ki);dialog=_(Rf);destroyRef=_(Bn);startupResolution=_(FB);startupConfigState=_(cB);hostCommunication=_(tZ);catalogManagement=_(se);configProvider=_(Vu);settingsService=_(I);mcpManager=_(fv);is1PAuthEnabled=_(aB);selectedRendererId=yt(null);selectedApiKeyId=Nd(()=>this.settingsService.selectedApiKeyId());selectedRendererOption=Nd(()=>{let t=this.selectedRendererId();if(!(!t||t==="Custom"))return this.settingsService.getRenderers().find(e=>e.id===t)});isThirdParty=yt(false);isApiKeyProvidedByConfig=Nd(()=>this.configProvider.isApiKeyProvidedByConfig());isApiKeyUnmaskDisabled=Nd(()=>this.isApiKeyProvidedByConfig());hideApiKey=yt(true);forceThirdPartyAuth=yt(false);bridgeConnected=Nd(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=Nd(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=Nd(()=>this.catalogManagement.catalogError());activeRendererUrl=Nd(()=>this.startupConfigState.resolvedUrl());settingsForm=this.fb.group({});constructor(){$a(()=>{let t=this.settingsService.selectedRendererId()||"default";Ri(()=>{this.selectedRendererId.set(t);});});}ngOnInit(){let t=this.settingsService.selectedRendererId()||"default";this.selectedRendererId.set(t),this.settingsService.getEffectiveApiKey();let e=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(e),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");}async onRendererSelected(t){let e=this.selectedRendererId();this.selectedRendererId.set(t),await this.settingsService.selectRenderer(t)||this.selectedRendererId.set(e);}async onApiKeySelected(t){await this.settingsService.selectApiKey(t);}toggleHideApiKey(){this.isApiKeyUnmaskDisabled()||this.hideApiKey.set(!this.hideApiKey());}toggleForceThirdPartyAuth(){let t=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(t),this.configProvider.setForcedAuthMode(t?"3p":"1p"),this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());}openAddMcpServerDialog(){this.dialog.open(fe,{width:"450px"}).afterClosed().pipe(Rze(this.destroyRef)).subscribe(e=>{e?.url&&this.mcpManager.addServer(e.url);});}openEditMcpServerDialog(t){this.dialog.open(fe,{width:"450px",data:{server:t}}).afterClosed().pipe(Rze(this.destroyRef)).subscribe(n=>{n?.url&&this.mcpManager.updateServerUrl(t.id,n.url);});}async removeMcpServer(t){await this.mcpManager.removeServer(t);}async toggleMcpServer(t,e){await this.mcpManager.toggleServer(t,e);}async testMcpServer(t){await this.mcpManager.testServer(t);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ln$1({type:i,selectors:[["a2ui-composer-settings"]],decls:57,vars:13,consts:[[1,"settings-container"],[1,"settings-card"],["mat-card-title",""],[3,"formGroup"],[1,"form-section"],[3,"rendererSelected","selectedRendererId"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked"],[1,"get-api-key"],[1,"status-card"],["mat-card-subtitle",""],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log"],[1,"success-log"],[1,"status-card","mcp-card"],[1,"mcp-card-header"],[1,"mcp-header-text"],["type","button","mat-icon-button","","aria-label","Add MCP Server","matTooltip","Add MCP Server",1,"mcp-add-btn",3,"click"],["aria-hidden","true"],[1,"mcp-empty-state"],[1,"mcp-server-list"],[3,"apiKeySelected","selectedApiKeyId"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"],[1,"mcp-server-item"],[1,"mcp-server-top-row"],[1,"mcp-server-main"],[1,"mcp-server-toggle",3,"change","checked"],[1,"mcp-server-info"],[1,"mcp-server-header"],[1,"mcp-server-name"],[1,"mcp-server-status"],[1,"mcp-server-url"],[1,"mcp-server-actions"],["type","button","mat-stroked-button","","matTooltip","Test Connection","aria-label","Test MCP Server",1,"mcp-test-btn",3,"click"],["type","button","mat-icon-button","","matTooltip","Edit MCP Server","aria-label","Edit MCP Server",1,"mcp-edit-btn",3,"click"],["type","button","mat-icon-button","","color","warn","matTooltip","Delete MCP Server","aria-label","Delete MCP Server",1,"mcp-delete-btn",3,"click"],[1,"mcp-server-tools"],[1,"mcp-tool-name"]],template:function(e,n){e&1&&(br(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"h2",2),Oi$1(4,"A2UI Composer Settings"),$r()(),br(5,"mat-card-content")(6,"form",3)(7,"div",4)(8,"h3"),Oi$1(9,"Renderer"),$r(),br(10,"a2ui-composer-renderer-selector",5),zm("rendererSelected",function(l){return n.onRendererSelected(l)}),$r()(),xd(11,gn,4,1,"div",4),br(12,"div",6)(13,"h3"),Oi$1(14,"Developer Authentication Overrides"),$r(),br(15,"p",7),Oi$1(16," Simulate external 3P context to verify Gemini API key provisioning workflows. "),$r(),br(17,"div",8)(18,"mat-slide-toggle",9),zm("change",function(){return n.toggleForceThirdPartyAuth()}),Oi$1(19," Force External Third-Party Authentication Mode "),$r()()()()(),xd(20,un,18,0,"mat-card-footer",10),$r(),br(21,"mat-card",11)(22,"mat-card-header")(23,"h2",2),Oi$1(24,"Connection Status & Diagnostics"),$r(),br(25,"p",12),Oi$1(26,"Real-time monitoring bridge"),$r()(),br(27,"mat-card-content")(28,"div",13)(29,"mat-chip-set")(30,"mat-chip",14),Oi$1(31),$r(),br(32,"mat-chip",15),Oi$1(33),$r()()(),br(34,"div",16)(35,"h3"),Oi$1(36,"Overlay Logs Preview"),$r(),br(37,"div",17),xd(38,hn,2,1,"code"),xd(39,fn,2,1,"code",18)(40,yn,2,0,"code",19)(41,vn,2,0,"code")(42,_n,2,0,"code")(43,bn,2,0,"code"),$r()()()(),br(44,"mat-card",20)(45,"mat-card-header",21)(46,"div",22)(47,"h2",2),Oi$1(48,"MCP Servers"),$r(),br(49,"p",12),Oi$1(50," Configure HTTP Model Context Protocol (MCP) servers for use in renderers that support the A2UI MCP Catalog. "),$r()(),br(51,"button",23),zm("click",function(){return n.openAddMcpServerDialog()}),br(52,"mat-icon",24),Oi$1(53,"add_circle"),$r()()(),br(54,"mat-card-content"),xd(55,Cn,2,0,"div",25)(56,Rn,3,0,"div",26),$r()()()),e&2&&(Ko(6),kd("formGroup",n.settingsForm),Ko(4),kd("selectedRendererId",n.selectedRendererId()),Ko(),Td(n.isThirdParty()?11:-1),Ko(),kd("hidden",!n.is1PAuthEnabled),Ko(6),kd("checked",n.forceThirdPartyAuth()),Ko(2),Td(n.isThirdParty()?20:-1),Ko(10),kd("color",n.bridgeConnected()?"primary":"accent"),Ko(),Wb("Bridge: ",n.bridgeConnected()?"Connected":"Disconnected"),Ko(),kd("color",n.catalogStatus()==="Connected"?"primary":n.catalogStatus()==="Indexing"?"accent":n.catalogStatus()==="Error"?"warn":void 0),Ko(),Wb("Catalog Handshake: ",n.catalogStatus()),Ko(5),Td(n.activeRendererUrl()?38:-1),Ko(),Td(n.catalogErrorMessage()?39:n.catalogStatus()==="Connected"?40:n.catalogStatus()==="Indexing"?41:n.bridgeConnected()?42:43),Ko(16),Td(n.mcpManager.servers().length===0?55:56));},dependencies:[Oi,Ni,wi,Ri$1,Un,me,Vr,IL,SL,lie,ci,li,E,F,k,z,T,S,j,ot,ki$1,ct,Ut,Fe,Yt,mt,hL,Oe,De],styles:[`[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto;container-type:inline-size;container-name:settings}.settings-container[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,1fr);align-items:start;gap:24px;padding:32px;max-width:1180px;margin:0 auto}.settings-card[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]{min-width:0;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface)}.settings-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]{padding:28px 28px 8px}.settings-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{padding:0 28px 28px}.settings-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0;font:var(--mat-sys-title-large);letter-spacing:var(--mat-sys-title-large-tracking)}.settings-card[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:8px 0 0;font:var(--mat-sys-body-medium);letter-spacing:var(--mat-sys-body-medium-tracking);color:var(--mat-sys-on-surface-variant)}.form-section[_ngcontent-%COMP%]{margin-top:24px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:0 0 12px;font:var(--mat-sys-title-small);letter-spacing:var(--mat-sys-title-small-tracking)}.full-width[_ngcontent-%COMP%], a2ui-composer-renderer-selector[_ngcontent-%COMP%], a2ui-composer-api-key-selector[_ngcontent-%COMP%], mat-form-field[_ngcontent-%COMP%]{width:100%;box-sizing:border-box}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.save-error-banner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:12px 16px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin:16px 24px 0;font-size:13px;font-weight:500}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-low);color:var(--mat-sys-on-surface-variant);padding:16px;border-radius:12px;overflow-wrap:anywhere;font:var(--mat-sys-body-small);font-family:Spline Sans Mono,monospace;letter-spacing:var(--mat-sys-body-small-tracking)}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{display:block;font-family:inherit}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] + code[_ngcontent-%COMP%]{margin-top:8px}.error-log[_ngcontent-%COMP%]{color:var(--mat-sys-error);font-weight:var(--mat-sys-label-large-weight-prominent)}.success-log[_ngcontent-%COMP%]{color:var(--mat-sys-primary)}mat-card-header[_ngcontent-%COMP%]   h2[mat-card-title][_ngcontent-%COMP%]{margin:0;font-size:20px;font-weight:500;line-height:28px}mat-card-header[_ngcontent-%COMP%]   [mat-card-subtitle][_ngcontent-%COMP%]{margin:4px 0 0;font-size:14px;font-weight:400;line-height:20px;color:var(--mat-sys-on-surface-variant)}  body .mat-mdc-slide-toggle{--mat-slide-toggle-track-width: 52px;--mat-slide-toggle-track-height: 32px;--mat-slide-toggle-track-shape: 9999px;--mat-slide-toggle-handle-width: 100%;--mat-slide-toggle-handle-height: 24px;--mat-slide-toggle-handle-shape: 9999px;--mat-slide-toggle-with-icon-handle-size: 24px;--mat-slide-toggle-selected-handle-size: 24px;--mat-slide-toggle-unselected-handle-size: 16px;--mat-slide-toggle-selected-handle-horizontal-margin: 0 24px;--mat-slide-toggle-selected-with-icon-handle-horizontal-margin: 0 24px;--mat-slide-toggle-unselected-handle-horizontal-margin: 0 8px;--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin: 0 4px}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:12px!important}  body .mat-mdc-slide-toggle label:not(:empty),   body .mat-mdc-slide-toggle .mdc-label:not(:empty){padding-left:4px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{padding:24px 28px;border-top:1px solid var(--mat-sys-outline-variant);font:var(--mat-sys-body-small);letter-spacing:var(--mat-sys-body-small-tracking);color:var(--mat-sys-on-surface-variant)}.get-api-key[_ngcontent-%COMP%]   ol[_ngcontent-%COMP%]{padding-left:20px}.get-api-key[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--mat-sys-primary);text-underline-offset:3px}@container settings (min-width: 980px){.settings-container[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}.settings-card[_ngcontent-%COMP%]{grid-column:1;grid-row:1/span 2}.status-card[_ngcontent-%COMP%]{grid-column:2}}@container settings (max-width: 600px){.settings-container[_ngcontent-%COMP%]{padding:16px;gap:16px}.settings-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]{padding:20px 20px 8px}.settings-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%], .status-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{padding:0 20px 20px}.get-api-key[_ngcontent-%COMP%]{padding:20px}}.mcp-card-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mcp-card-header[_ngcontent-%COMP%]     .mat-mdc-card-header-text{display:none}.mcp-card-header[_ngcontent-%COMP%]   .mcp-header-text[_ngcontent-%COMP%]{flex:1;min-width:0}.mcp-card-header[_ngcontent-%COMP%]   .mcp-add-btn[_ngcontent-%COMP%]{flex-shrink:0;margin-top:-4px;margin-right:-8px}.mcp-empty-state[_ngcontent-%COMP%]{margin-top:16px;padding:16px;text-align:center;font-size:13px;font-style:italic;color:var(--mat-sys-on-surface-variant);border-radius:8px;border:1px dashed var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-lowest)}.mcp-server-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-top:16px}.mcp-server-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid var(--mat-sys-outline-variant);background-color:var(--mat-sys-surface-container-low)}.mcp-server-top-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:12px}.mcp-server-main[_ngcontent-%COMP%]{display:flex;align-items:center;gap:14px;min-width:0;flex:1}.mcp-server-toggle[_ngcontent-%COMP%]{flex-shrink:0}.mcp-server-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;gap:4px}.mcp-server-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mcp-server-name[_ngcontent-%COMP%]{font-weight:500;font-size:14px;color:var(--mat-sys-on-surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-status[_ngcontent-%COMP%]{font-size:12px;font-weight:500;padding:2px 10px;border-radius:9999px;background-color:var(--mat-sys-surface-container-high)}.mcp-server-status[data-status=connected][_ngcontent-%COMP%]{color:var(--mat-sys-tertiary)}.mcp-server-status[data-status=error][_ngcontent-%COMP%]{color:var(--mat-sys-error)}.mcp-server-url[_ngcontent-%COMP%]{font-size:12px;color:var(--mat-sys-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mcp-server-tools[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}.mcp-tool-name[_ngcontent-%COMP%]{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:6px;background-color:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.mcp-server-actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;flex-shrink:0}















`]})};export{Gt as Settings};