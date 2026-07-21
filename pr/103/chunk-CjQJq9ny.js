import {c as ce,i as it,b as ae,l as le,k as kt,I as It,a as an,o as on,d as at}from'./chunk-BYPZU_nH.js';import {L,F,T,k,E,z,S,j}from'./chunk-1eZryxm2.js';import {U as su,q as qt,i as io,X as Tn,Y as lu,Z as ou,C as Cr,n as nu,_ as iu,a0 as ks,a1 as Ps,g as gd,h as hd,L as Lo,a as Ld,V as Vd,b as hn,J as In,c as Ie$1,y as yn,a2 as tr,k as q,l as nr,a3 as At,B as Bo,a4 as _n,a5 as Lc,a6 as Fn,a7 as Qe$1,a8 as mp,G as or,x as xe}from'./chunk-K_J2SIZD.js';import {g,T as Xg,W,bk as ds,I as Is,bl as Kg,Q as Qe,e as eC,w as wI,q as qi,k as kw,j as ju,b as Yh,G as GI,$ as $h,ab as OE,c as GD,U as Uh,z as zI,ac as PE,d as $u,i as ss,m as Dr,O as bC,Z as Zn,bm as W1,v as K,E as ee,ag as Ge$1,x as re,ar as Gm,al as J1,n as sw,p as aw,an as Hw,aM as qh,H as Hh,r as Cw,o as og,X as Xh,u as uw,t as lw,K as Kh,B as w,b3 as ki,ah as ny,bn as ud,F as ry,P as Bu,V as Vu,as as ej,ap as mg,ak as qc,aV as fw,bo as Ko,aC as tw,aE as ow,l as lg,M as xu,aG as Kd,aL as cp,aj as Fh,aD as jd,aF as Bd}from'./main.js';var De=["*",[["mat-chip-avatar"],["","matChipAvatar",""]],[["mat-chip-trailing-icon"],["","matChipRemove",""],["","matChipTrailingIcon",""]]],Te=["*","mat-chip-avatar, [matChipAvatar]","mat-chip-trailing-icon,[matChipRemove],[matChipTrailingIcon]"];function Pe(n,s){n&1&&(qi(0,"span",3),aw(1,1),ju());}function Le(n,s){n&1&&(qi(0,"span",6),aw(1,2),ju());}var Oe=["*"];var ze=new w("mat-chips-default-options",{providedIn:"root",factory:()=>({separatorKeyCodes:[13]})}),be=new w("MatChipAvatar"),ye=new w("MatChipTrailingIcon"),we=new w("MatChipEdit"),Ce=new w("MatChipRemove"),ke=new w("MatChip"),Se=(()=>{class n{_elementRef=g(Zn);_parentChip=g(ke);_isPrimary=true;_isLeading=false;get disabled(){return this._disabled||this._parentChip?.disabled||false}set disabled(t){this._disabled=t;}_disabled=false;tabIndex=-1;_allowFocusWhenDisabled=false;_getDisabledAttribute(){return this.disabled&&!this._allowFocusWhenDisabled?"":null}constructor(){g(q).load(nr),this._elementRef.nativeElement.nodeName==="BUTTON"&&this._elementRef.nativeElement.setAttribute("type","button");}focus(){this._elementRef.nativeElement.focus();}static \u0275fac=function(i){return new(i||n)};static \u0275dir=xu({type:n,selectors:[["","matChipContent",""]],hostAttrs:[1,"mat-mdc-chip-action","mdc-evolution-chip__action","mdc-evolution-chip__action--presentational"],hostVars:8,hostBindings:function(i,e){i&2&&(Hh("disabled",e._getDisabledAttribute())("aria-disabled",e.disabled),og("mdc-evolution-chip__action--primary",e._isPrimary)("mdc-evolution-chip__action--secondary",!e._isPrimary)("mdc-evolution-chip__action--trailing",!e._isPrimary&&!e._isLeading));},inputs:{disabled:[2,"disabled","disabled",J1],tabIndex:[2,"tabIndex","tabIndex",t=>t==null?-1:ej(t)],_allowFocusWhenDisabled:"_allowFocusWhenDisabled"}})}return n})(),He=(()=>{class n extends Se{_getTabindex(){return this.disabled&&!this._allowFocusWhenDisabled?null:this.tabIndex.toString()}_handleClick(t){!this.disabled&&this._isPrimary&&(t.preventDefault(),this._parentChip._handlePrimaryActionInteraction());}_handleKeydown(t){(t.keyCode===13||t.keyCode===32)&&!this.disabled&&this._isPrimary&&!this._parentChip._isEditing&&(t.preventDefault(),this._parentChip._handlePrimaryActionInteraction());}static \u0275fac=(()=>{let t;return function(e){return (t||(t=cp(n)))(e||n)}})();static \u0275dir=xu({type:n,selectors:[["","matChipAction",""]],hostVars:3,hostBindings:function(i,e){i&1&&Yh("click",function(l){return e._handleClick(l)})("keydown",function(l){return e._handleKeydown(l)}),i&2&&(Hh("tabindex",e._getTabindex()),og("mdc-evolution-chip__action--presentational",false));},features:[Fh]})}return n})();var dt=(()=>{class n{_changeDetectorRef=g(bC);_elementRef=g(Zn);_tagName=g(W1);_ngZone=g(K);_focusMonitor=g(hn);_globalRippleOptions=g(In,{optional:true});_document=g(W);_onFocus=new ee;_onBlur=new ee;_isBasicChip=false;role=null;_hasFocusInternal=false;_pendingFocus=false;_actionChanges;_animationsDisabled=Ie$1();_allLeadingIcons;_allTrailingIcons;_allEditIcons;_allRemoveIcons;_hasFocus(){return this._hasFocusInternal}id=g(yn).getId("mat-mdc-chip-");ariaLabel=null;ariaDescription=null;_chipListDisabled=false;_hadFocusOnRemove=false;_textElement;get value(){return this._value!==void 0?this._value:this._textElement.textContent.trim()}set value(t){this._value=t;}_value;color;removable=true;highlighted=false;disableRipple=false;get disabled(){return this._disabled||this._chipListDisabled}set disabled(t){this._disabled=t;}_disabled=false;removed=new Ge$1;destroyed=new Ge$1;basicChipAttrName="mat-basic-chip";leadingIcon;editIcon;trailingIcon;removeIcon;primaryAction;_rippleLoader=g(tr);_injector=g(re);constructor(){let t=g(q);t.load(nr),t.load(At),this._monitorFocus(),this._rippleLoader?.configureRipple(this._elementRef.nativeElement,{className:"mat-mdc-chip-ripple",disabled:this._isRippleDisabled()});}ngOnInit(){this._isBasicChip=this._elementRef.nativeElement.hasAttribute(this.basicChipAttrName)||this._tagName.toLowerCase()===this.basicChipAttrName;}ngAfterViewInit(){this._textElement=this._elementRef.nativeElement.querySelector(".mat-mdc-chip-action-label"),this._pendingFocus&&(this._pendingFocus=false,this.focus());}ngAfterContentInit(){this._actionChanges=Gm(this._allLeadingIcons.changes,this._allTrailingIcons.changes,this._allEditIcons.changes,this._allRemoveIcons.changes).subscribe(()=>this._changeDetectorRef.markForCheck());}ngDoCheck(){this._rippleLoader.setDisabled(this._elementRef.nativeElement,this._isRippleDisabled());}ngOnDestroy(){this.destroyed.emit({chip:this}),this.destroyed.complete(),this._focusMonitor.stopMonitoring(this._elementRef),this._rippleLoader?.destroyRipple(this._elementRef.nativeElement),this._actionChanges?.unsubscribe();}remove(){this.removable&&(this._hadFocusOnRemove=this._hasFocus(),this.removed.emit({chip:this}));}_isRippleDisabled(){return this.disabled||this.disableRipple||this._animationsDisabled||this._isBasicChip||!this._hasInteractiveActions()||!!this._globalRippleOptions?.disabled}_hasTrailingIcon(){return !!(this.trailingIcon||this.removeIcon)}_handleKeydown(t){(t.keyCode===8&&!t.repeat||t.keyCode===46)&&(t.preventDefault(),this.remove());}focus(){this.disabled||(this.primaryAction?this.primaryAction.focus():this._pendingFocus=true);}_getSourceAction(t){return this._getActions().find(i=>{let e=i._elementRef.nativeElement;return e===t||e.contains(t)})}_getActions(){let t=[];return this.editIcon&&t.push(this.editIcon),this.primaryAction&&t.push(this.primaryAction),this.removeIcon&&t.push(this.removeIcon),t}_handlePrimaryActionInteraction(){}_hasInteractiveActions(){return this._getActions().length>0}_edit(t){}_monitorFocus(){this._focusMonitor.monitor(this._elementRef,true).subscribe(t=>{let i=t!==null;i!==this._hasFocusInternal&&(this._hasFocusInternal=i,i?this._onFocus.next({chip:this}):(this._changeDetectorRef.markForCheck(),setTimeout(()=>this._ngZone.run(()=>this._onBlur.next({chip:this})))));});}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=wI({type:n,selectors:[["mat-basic-chip"],["","mat-basic-chip",""],["mat-chip"],["","mat-chip",""]],contentQueries:function(i,e,d){if(i&1&&Kh(d,be,5)(d,we,5)(d,ye,5)(d,Ce,5)(d,be,5)(d,ye,5)(d,we,5)(d,Ce,5),i&2){let l;uw(l=lw())&&(e.leadingIcon=l.first),uw(l=lw())&&(e.editIcon=l.first),uw(l=lw())&&(e.trailingIcon=l.first),uw(l=lw())&&(e.removeIcon=l.first),uw(l=lw())&&(e._allLeadingIcons=l),uw(l=lw())&&(e._allTrailingIcons=l),uw(l=lw())&&(e._allEditIcons=l),uw(l=lw())&&(e._allRemoveIcons=l);}},viewQuery:function(i,e){if(i&1&&Xh(He,5),i&2){let d;uw(d=lw())&&(e.primaryAction=d.first);}},hostAttrs:[1,"mat-mdc-chip"],hostVars:31,hostBindings:function(i,e){i&1&&Yh("keydown",function(l){return e._handleKeydown(l)}),i&2&&(qh("id",e.id),Hh("role",e.role)("aria-label",e.ariaLabel),Cw("mat-"+(e.color||"primary")),og("mdc-evolution-chip",!e._isBasicChip)("mdc-evolution-chip--disabled",e.disabled)("mdc-evolution-chip--with-trailing-action",e._hasTrailingIcon())("mdc-evolution-chip--with-primary-graphic",e.leadingIcon)("mdc-evolution-chip--with-primary-icon",e.leadingIcon)("mdc-evolution-chip--with-avatar",e.leadingIcon)("mat-mdc-chip-with-avatar",e.leadingIcon)("mat-mdc-chip-highlighted",e.highlighted)("mat-mdc-chip-disabled",e.disabled)("mat-mdc-basic-chip",e._isBasicChip)("mat-mdc-standard-chip",!e._isBasicChip)("mat-mdc-chip-with-trailing-icon",e._hasTrailingIcon())("_mat-animation-noopable",e._animationsDisabled));},inputs:{role:"role",id:"id",ariaLabel:[0,"aria-label","ariaLabel"],ariaDescription:[0,"aria-description","ariaDescription"],value:"value",color:"color",removable:[2,"removable","removable",J1],highlighted:[2,"highlighted","highlighted",J1],disableRipple:[2,"disableRipple","disableRipple",J1],disabled:[2,"disabled","disabled",J1]},outputs:{removed:"removed",destroyed:"destroyed"},exportAs:["matChip"],features:[Hw([{provide:ke,useExisting:n}])],ngContentSelectors:Te,decls:8,vars:2,consts:[[1,"mat-mdc-chip-focus-overlay"],[1,"mdc-evolution-chip__cell","mdc-evolution-chip__cell--primary"],["matChipContent",""],[1,"mdc-evolution-chip__graphic","mat-mdc-chip-graphic"],[1,"mdc-evolution-chip__text-label","mat-mdc-chip-action-label"],[1,"mat-mdc-chip-primary-focus-indicator","mat-focus-indicator"],[1,"mdc-evolution-chip__cell","mdc-evolution-chip__cell--trailing"]],template:function(i,e){i&1&&(sw(De),$h(0,"span",0),qi(1,"span",1)(2,"span",2),GI(3,Pe,2,0,"span",3),qi(4,"span",4),aw(5),$h(6,"span",5),ju()()(),GI(7,Le,2,0,"span",6)),i&2&&(GD(3),zI(e.leadingIcon?3:-1),GD(4),zI(e._hasTrailingIcon()?7:-1));},dependencies:[Se],styles:[`.mdc-evolution-chip,
.mdc-evolution-chip__cell,
.mdc-evolution-chip__action {
  display: inline-flex;
  align-items: center;
}

.mdc-evolution-chip {
  position: relative;
  max-width: 100%;
}

.mdc-evolution-chip__cell,
.mdc-evolution-chip__action {
  height: 100%;
}

.mdc-evolution-chip__cell--primary {
  flex-basis: 100%;
  overflow-x: hidden;
}

.mdc-evolution-chip__cell--trailing {
  flex: 1 0 auto;
}

.mdc-evolution-chip__action {
  align-items: center;
  background: none;
  border: none;
  box-sizing: content-box;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  outline: none;
  padding: 0;
  text-decoration: none;
  color: inherit;
}

.mdc-evolution-chip__action--presentational {
  cursor: auto;
}

.mdc-evolution-chip--disabled,
.mdc-evolution-chip__action:disabled {
  pointer-events: none;
}
@media (forced-colors: active) {
  .mdc-evolution-chip--disabled,
  .mdc-evolution-chip__action:disabled {
    forced-color-adjust: none;
  }
}

.mdc-evolution-chip__action--primary {
  font: inherit;
  letter-spacing: inherit;
  white-space: inherit;
  overflow-x: hidden;
}
.mat-mdc-standard-chip .mdc-evolution-chip__action--primary::before {
  border-width: var(--mat-chip-outline-width, 1px);
  border-radius: var(--mat-chip-container-shape-radius, 8px);
  box-sizing: border-box;
  content: "";
  height: 100%;
  left: 0;
  position: absolute;
  pointer-events: none;
  top: 0;
  width: 100%;
  z-index: 1;
  border-style: solid;
}
.mat-mdc-standard-chip .mdc-evolution-chip__action--primary {
  padding-left: 12px;
  padding-right: 12px;
}
.mat-mdc-standard-chip.mdc-evolution-chip--with-primary-graphic .mdc-evolution-chip__action--primary {
  padding-left: 0;
  padding-right: 12px;
}
[dir=rtl] .mat-mdc-standard-chip.mdc-evolution-chip--with-primary-graphic .mdc-evolution-chip__action--primary {
  padding-left: 12px;
  padding-right: 0;
}
.mat-mdc-standard-chip:not(.mdc-evolution-chip--disabled) .mdc-evolution-chip__action--primary::before {
  border-color: var(--mat-chip-outline-color, var(--mat-sys-outline));
}
.mdc-evolution-chip__action--primary:not(.mdc-evolution-chip__action--presentational):not(.mdc-ripple-upgraded):focus::before {
  border-color: var(--mat-chip-focus-outline-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-standard-chip.mdc-evolution-chip--disabled .mdc-evolution-chip__action--primary::before {
  border-color: var(--mat-chip-disabled-outline-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-standard-chip.mdc-evolution-chip--selected .mdc-evolution-chip__action--primary::before {
  border-width: var(--mat-chip-flat-selected-outline-width, 0);
}
.mat-mdc-basic-chip .mdc-evolution-chip__action--primary {
  font: inherit;
}
.mat-mdc-standard-chip.mdc-evolution-chip--with-leading-action .mdc-evolution-chip__action--primary {
  padding-left: 0;
  padding-right: 12px;
}
[dir=rtl] .mat-mdc-standard-chip.mdc-evolution-chip--with-leading-action .mdc-evolution-chip__action--primary {
  padding-left: 12px;
  padding-right: 0;
}
.mat-mdc-standard-chip.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--primary {
  padding-left: 12px;
  padding-right: 0;
}
[dir=rtl] .mat-mdc-standard-chip.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--primary {
  padding-left: 0;
  padding-right: 12px;
}
.mat-mdc-standard-chip.mdc-evolution-chip--with-leading-action.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--primary {
  padding-left: 0;
  padding-right: 0;
}
.mat-mdc-standard-chip.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--primary {
  padding-left: 0;
  padding-right: 0;
}
[dir=rtl] .mat-mdc-standard-chip.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--primary {
  padding-left: 0;
  padding-right: 0;
}
.mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic .mdc-evolution-chip__action--primary {
  padding-left: 0;
  padding-right: 12px;
}
[dir=rtl] .mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic .mdc-evolution-chip__action--primary {
  padding-left: 12px;
  padding-right: 0;
}
.mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--primary {
  padding-left: 0;
  padding-right: 0;
}
[dir=rtl] .mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--primary {
  padding-left: 0;
  padding-right: 0;
}

.mdc-evolution-chip__action--secondary {
  position: relative;
  overflow: visible;
}
.mat-mdc-standard-chip:not(.mdc-evolution-chip--disabled) .mdc-evolution-chip__action--secondary {
  color: var(--mat-chip-with-trailing-icon-trailing-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-standard-chip.mdc-evolution-chip--disabled .mdc-evolution-chip__action--secondary {
  color: var(--mat-chip-with-trailing-icon-disabled-trailing-icon-color, var(--mat-sys-on-surface));
}
.mat-mdc-standard-chip.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--secondary, .mat-mdc-standard-chip.mdc-evolution-chip--with-leading-action .mdc-evolution-chip__action--secondary {
  padding-left: 8px;
  padding-right: 8px;
}
.mat-mdc-standard-chip.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--secondary, .mat-mdc-standard-chip.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-leading-action .mdc-evolution-chip__action--secondary {
  padding-left: 8px;
  padding-right: 8px;
}
.mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--secondary, .mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-leading-action .mdc-evolution-chip__action--secondary {
  padding-left: 8px;
  padding-right: 8px;
}
[dir=rtl] .mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__action--secondary, [dir=rtl] .mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-leading-action .mdc-evolution-chip__action--secondary {
  padding-left: 8px;
  padding-right: 8px;
}

.mdc-evolution-chip__text-label {
  -webkit-user-select: none;
  user-select: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.mat-mdc-standard-chip .mdc-evolution-chip__text-label {
  font-family: var(--mat-chip-label-text-font, var(--mat-sys-label-large-font));
  line-height: var(--mat-chip-label-text-line-height, var(--mat-sys-label-large-line-height));
  font-size: var(--mat-chip-label-text-size, var(--mat-sys-label-large-size));
  font-weight: var(--mat-chip-label-text-weight, var(--mat-sys-label-large-weight));
  letter-spacing: var(--mat-chip-label-text-tracking, var(--mat-sys-label-large-tracking));
}
.mat-mdc-standard-chip:not(.mdc-evolution-chip--disabled) .mdc-evolution-chip__text-label {
  color: var(--mat-chip-label-text-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-standard-chip.mdc-evolution-chip--selected:not(.mdc-evolution-chip--disabled) .mdc-evolution-chip__text-label {
  color: var(--mat-chip-selected-label-text-color, var(--mat-sys-on-secondary-container));
}
.mat-mdc-standard-chip.mdc-evolution-chip--disabled .mdc-evolution-chip__text-label, .mat-mdc-standard-chip.mdc-evolution-chip--selected.mdc-evolution-chip--disabled .mdc-evolution-chip__text-label {
  color: var(--mat-chip-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}

.mdc-evolution-chip__graphic {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
  position: relative;
  flex: 1 0 auto;
}
.mat-mdc-standard-chip .mdc-evolution-chip__graphic {
  width: var(--mat-chip-with-avatar-avatar-size, 24px);
  height: var(--mat-chip-with-avatar-avatar-size, 24px);
  font-size: var(--mat-chip-with-avatar-avatar-size, 24px);
}
.mdc-evolution-chip--selecting .mdc-evolution-chip__graphic {
  transition: width 150ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mdc-evolution-chip--selectable:not(.mdc-evolution-chip--selected):not(.mdc-evolution-chip--with-primary-icon) .mdc-evolution-chip__graphic {
  width: 0;
}
.mat-mdc-standard-chip.mdc-evolution-chip--with-primary-graphic .mdc-evolution-chip__graphic {
  padding-left: 6px;
  padding-right: 6px;
}
.mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic .mdc-evolution-chip__graphic {
  padding-left: 4px;
  padding-right: 8px;
}
[dir=rtl] .mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic .mdc-evolution-chip__graphic {
  padding-left: 8px;
  padding-right: 4px;
}
.mat-mdc-standard-chip.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__graphic {
  padding-left: 6px;
  padding-right: 6px;
}
.mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__graphic {
  padding-left: 4px;
  padding-right: 8px;
}
[dir=rtl] .mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-trailing-action .mdc-evolution-chip__graphic {
  padding-left: 8px;
  padding-right: 4px;
}
.mdc-evolution-chip--with-avatar.mdc-evolution-chip--with-primary-graphic.mdc-evolution-chip--with-leading-action .mdc-evolution-chip__graphic {
  padding-left: 0;
}

.mdc-evolution-chip__checkmark {
  position: absolute;
  opacity: 0;
  top: 50%;
  left: 50%;
  height: 20px;
  width: 20px;
}
.mat-mdc-standard-chip:not(.mdc-evolution-chip--disabled) .mdc-evolution-chip__checkmark {
  color: var(--mat-chip-with-icon-selected-icon-color, var(--mat-sys-on-secondary-container));
}
.mat-mdc-standard-chip.mdc-evolution-chip--disabled .mdc-evolution-chip__checkmark {
  color: var(--mat-chip-with-icon-disabled-icon-color, var(--mat-sys-on-surface));
}
.mdc-evolution-chip--selecting .mdc-evolution-chip__checkmark {
  transition: transform 150ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate(-75%, -50%);
}
.mdc-evolution-chip--selected .mdc-evolution-chip__checkmark {
  transform: translate(-50%, -50%);
  opacity: 1;
}

.mdc-evolution-chip__checkmark-svg {
  display: block;
}

.mdc-evolution-chip__checkmark-path {
  stroke-width: 2px;
  stroke-dasharray: 29.7833385;
  stroke-dashoffset: 29.7833385;
  stroke: currentColor;
}
.mdc-evolution-chip--selecting .mdc-evolution-chip__checkmark-path {
  transition: stroke-dashoffset 150ms 45ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mdc-evolution-chip--selected .mdc-evolution-chip__checkmark-path {
  stroke-dashoffset: 0;
}
@media (forced-colors: active) {
  .mdc-evolution-chip__checkmark-path {
    stroke: CanvasText !important;
  }
}

.mat-mdc-standard-chip .mdc-evolution-chip__icon--trailing {
  height: 18px;
  width: 18px;
  font-size: 18px;
}
.mdc-evolution-chip--disabled .mdc-evolution-chip__icon--trailing.mat-mdc-chip-remove {
  opacity: calc(var(--mat-chip-trailing-action-opacity, 1) * var(--mat-chip-with-trailing-icon-disabled-trailing-icon-opacity, 0.38));
}
.mdc-evolution-chip--disabled .mdc-evolution-chip__icon--trailing.mat-mdc-chip-remove:focus {
  opacity: calc(var(--mat-chip-trailing-action-focus-opacity, 1) * var(--mat-chip-with-trailing-icon-disabled-trailing-icon-opacity, 0.38));
}

.mat-mdc-standard-chip {
  border-radius: var(--mat-chip-container-shape-radius, 8px);
  height: var(--mat-chip-container-height, 32px);
}
.mat-mdc-standard-chip:not(.mdc-evolution-chip--disabled) {
  background-color: var(--mat-chip-elevated-container-color, transparent);
}
.mat-mdc-standard-chip.mdc-evolution-chip--disabled {
  background-color: var(--mat-chip-elevated-disabled-container-color);
}
.mat-mdc-standard-chip.mdc-evolution-chip--selected:not(.mdc-evolution-chip--disabled) {
  background-color: var(--mat-chip-elevated-selected-container-color, var(--mat-sys-secondary-container));
}
.mat-mdc-standard-chip.mdc-evolution-chip--selected.mdc-evolution-chip--disabled {
  background-color: var(--mat-chip-flat-disabled-selected-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
@media (forced-colors: active) {
  .mat-mdc-standard-chip {
    outline: solid 1px;
  }
}

.mat-mdc-standard-chip .mdc-evolution-chip__icon--primary {
  border-radius: var(--mat-chip-with-avatar-avatar-shape-radius, 24px);
  width: var(--mat-chip-with-icon-icon-size, 18px);
  height: var(--mat-chip-with-icon-icon-size, 18px);
  font-size: var(--mat-chip-with-icon-icon-size, 18px);
}
.mdc-evolution-chip--selected .mdc-evolution-chip__icon--primary {
  opacity: 0;
}
.mat-mdc-standard-chip:not(.mdc-evolution-chip--disabled) .mdc-evolution-chip__icon--primary {
  color: var(--mat-chip-with-icon-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-standard-chip.mdc-evolution-chip--disabled .mdc-evolution-chip__icon--primary {
  color: var(--mat-chip-with-icon-disabled-icon-color, var(--mat-sys-on-surface));
}

.mat-mdc-chip-highlighted {
  --mat-chip-with-icon-icon-color: var(--mat-chip-with-icon-selected-icon-color, var(--mat-sys-on-secondary-container));
  --mat-chip-elevated-container-color: var(--mat-chip-elevated-selected-container-color, var(--mat-sys-secondary-container));
  --mat-chip-label-text-color: var(--mat-chip-selected-label-text-color, var(--mat-sys-on-secondary-container));
  --mat-chip-outline-width: var(--mat-chip-flat-selected-outline-width, 0);
}

.mat-mdc-chip-focus-overlay {
  background: var(--mat-chip-focus-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-chip-selected .mat-mdc-chip-focus-overlay, .mat-mdc-chip-highlighted .mat-mdc-chip-focus-overlay {
  background: var(--mat-chip-selected-focus-state-layer-color, var(--mat-sys-on-secondary-container));
}
.mat-mdc-chip:hover .mat-mdc-chip-focus-overlay {
  background: var(--mat-chip-hover-state-layer-color, var(--mat-sys-on-surface-variant));
  opacity: var(--mat-chip-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-chip-focus-overlay .mat-mdc-chip-selected:hover, .mat-mdc-chip-highlighted:hover .mat-mdc-chip-focus-overlay {
  background: var(--mat-chip-selected-hover-state-layer-color, var(--mat-sys-on-secondary-container));
  opacity: var(--mat-chip-selected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-chip.cdk-focused .mat-mdc-chip-focus-overlay {
  background: var(--mat-chip-focus-state-layer-color, var(--mat-sys-on-surface-variant));
  opacity: var(--mat-chip-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-chip-selected.cdk-focused .mat-mdc-chip-focus-overlay, .mat-mdc-chip-highlighted.cdk-focused .mat-mdc-chip-focus-overlay {
  background: var(--mat-chip-selected-focus-state-layer-color, var(--mat-sys-on-secondary-container));
  opacity: var(--mat-chip-selected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}

.mdc-evolution-chip--disabled:not(.mdc-evolution-chip--selected) .mat-mdc-chip-avatar {
  opacity: var(--mat-chip-with-avatar-disabled-avatar-opacity, 0.38);
}

.mdc-evolution-chip--disabled .mdc-evolution-chip__icon--trailing {
  opacity: var(--mat-chip-with-trailing-icon-disabled-trailing-icon-opacity, 0.38);
}

.mdc-evolution-chip--disabled.mdc-evolution-chip--selected .mdc-evolution-chip__checkmark {
  opacity: var(--mat-chip-with-icon-disabled-icon-opacity, 0.38);
}

.mat-mdc-standard-chip.mdc-evolution-chip--disabled {
  opacity: var(--mat-chip-disabled-container-opacity, 1);
}
.mat-mdc-standard-chip.mdc-evolution-chip--selected .mdc-evolution-chip__icon--trailing, .mat-mdc-standard-chip.mat-mdc-chip-highlighted .mdc-evolution-chip__icon--trailing {
  color: var(--mat-chip-selected-trailing-icon-color, var(--mat-sys-on-secondary-container));
}
.mat-mdc-standard-chip.mdc-evolution-chip--selected.mdc-evolution-chip--disabled .mdc-evolution-chip__icon--trailing, .mat-mdc-standard-chip.mat-mdc-chip-highlighted.mdc-evolution-chip--disabled .mdc-evolution-chip__icon--trailing {
  color: var(--mat-chip-selected-disabled-trailing-icon-color, var(--mat-sys-on-surface));
}

.mat-mdc-chip-edit, .mat-mdc-chip-remove {
  opacity: var(--mat-chip-trailing-action-opacity, 1);
}
.mat-mdc-chip-edit:focus, .mat-mdc-chip-remove:focus {
  opacity: var(--mat-chip-trailing-action-focus-opacity, 1);
}
.mat-mdc-chip-edit::after, .mat-mdc-chip-remove::after {
  background-color: var(--mat-chip-trailing-action-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-chip-edit:hover::after, .mat-mdc-chip-remove:hover::after {
  opacity: calc(var(--mat-chip-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity)) + var(--mat-chip-trailing-action-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity)));
}
.mat-mdc-chip-edit:focus::after, .mat-mdc-chip-remove:focus::after {
  opacity: calc(var(--mat-chip-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity)) + var(--mat-chip-trailing-action-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity)));
}

.mat-mdc-chip-selected .mat-mdc-chip-remove::after,
.mat-mdc-chip-highlighted .mat-mdc-chip-remove::after {
  background-color: var(--mat-chip-selected-trailing-action-state-layer-color, var(--mat-sys-on-secondary-container));
}

.mat-mdc-chip.cdk-focused .mat-mdc-chip-edit:focus::after, .mat-mdc-chip.cdk-focused .mat-mdc-chip-remove:focus::after {
  opacity: calc(var(--mat-chip-selected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity)) + var(--mat-chip-trailing-action-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity)));
}
.mat-mdc-chip.cdk-focused .mat-mdc-chip-edit:hover::after, .mat-mdc-chip.cdk-focused .mat-mdc-chip-remove:hover::after {
  opacity: calc(var(--mat-chip-selected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity)) + var(--mat-chip-trailing-action-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity)));
}

.mat-mdc-standard-chip {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-standard-chip .mat-mdc-chip-graphic,
.mat-mdc-standard-chip .mat-mdc-chip-trailing-icon {
  box-sizing: content-box;
}
.mat-mdc-standard-chip._mat-animation-noopable,
.mat-mdc-standard-chip._mat-animation-noopable .mdc-evolution-chip__graphic,
.mat-mdc-standard-chip._mat-animation-noopable .mdc-evolution-chip__checkmark,
.mat-mdc-standard-chip._mat-animation-noopable .mdc-evolution-chip__checkmark-path {
  transition-duration: 1ms;
  animation-duration: 1ms;
}

.mat-mdc-chip-focus-overlay {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  opacity: 0;
  border-radius: inherit;
  transition: opacity 150ms linear;
}
._mat-animation-noopable .mat-mdc-chip-focus-overlay {
  transition: none;
}
.mat-mdc-basic-chip .mat-mdc-chip-focus-overlay {
  display: none;
}

.mat-mdc-chip .mat-ripple.mat-mdc-chip-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}

.mat-mdc-chip-avatar {
  text-align: center;
  line-height: 1;
  color: var(--mat-chip-with-icon-icon-color, currentColor);
}

.mat-mdc-chip {
  position: relative;
  z-index: 0;
}

.mat-mdc-chip-action-label {
  text-align: left;
  z-index: 1;
}
[dir=rtl] .mat-mdc-chip-action-label {
  text-align: right;
}
.mat-mdc-chip.mdc-evolution-chip--with-trailing-action .mat-mdc-chip-action-label {
  position: relative;
}
.mat-mdc-chip-action-label .mat-mdc-chip-primary-focus-indicator {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
}
.mat-mdc-chip-action-label .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 2px) * -1);
}

.mat-mdc-chip-edit::before, .mat-mdc-chip-remove::before {
  margin: calc(var(--mat-focus-indicator-border-width, 3px) * -1);
  left: 8px;
  right: 8px;
}
.mat-mdc-chip-edit::after, .mat-mdc-chip-remove::after {
  content: "";
  display: block;
  opacity: 0;
  position: absolute;
  top: -3px;
  bottom: -3px;
  left: 5px;
  right: 5px;
  border-radius: 50%;
  box-sizing: border-box;
  padding: 12px;
  margin: -12px;
  background-clip: content-box;
}
.mat-mdc-chip-edit .mat-icon, .mat-mdc-chip-remove .mat-icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
  box-sizing: content-box;
}

.mat-chip-edit-input {
  cursor: text;
  display: inline-block;
  color: inherit;
  outline: 0;
}

@media (forced-colors: active) {
  .mat-mdc-chip-selected:not(.mat-mdc-chip-multiple) {
    outline-width: 3px;
  }
}

.mat-mdc-chip-action:focus-visible .mat-focus-indicator::before {
  content: "";
}

.mdc-evolution-chip__icon, .mat-mdc-chip-edit .mat-icon, .mat-mdc-chip-remove .mat-icon {
  min-height: fit-content;
}

img.mdc-evolution-chip__icon {
  min-height: 0;
}
`],encapsulation:2})}return n})();var Ie=(()=>{class n{_elementRef=g(Zn);_changeDetectorRef=g(bC);_dir=g(Bo,{optional:true});_lastDestroyedFocusedChipIndex=null;_keyManager;_destroyed=new ee;_defaultRole="presentation";get chipFocusChanges(){return this._getChipStream(t=>t._onFocus)}get chipDestroyedChanges(){return this._getChipStream(t=>t.destroyed)}get chipRemovedChanges(){return this._getChipStream(t=>t.removed)}get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._syncChipsState();}_disabled=false;get empty(){return !this._chips||this._chips.length===0}get role(){return this._explicitRole?this._explicitRole:this.empty?null:this._defaultRole}tabIndex=0;set role(t){this._explicitRole=t;}_explicitRole=null;get focused(){return this._hasFocusedChip()}_chips;_chipActions=new ki;ngAfterViewInit(){this._setUpFocusManagement(),this._trackChipSetChanges(),this._trackDestroyedFocusedChip();}ngOnDestroy(){this._keyManager?.destroy(),this._chipActions.destroy(),this._destroyed.next(),this._destroyed.complete();}_hasFocusedChip(){return this._chips&&this._chips.some(t=>t._hasFocus())}_syncChipsState(){this._chips?.forEach(t=>{t._chipListDisabled=this._disabled,t._changeDetectorRef.markForCheck();});}focus(){}_handleKeydown(t){this._originatesFromChip(t)&&this._keyManager.onKeydown(t);}_isValidIndex(t){return t>=0&&t<this._chips.length}_allowFocusEscape(){let t=this._elementRef.nativeElement.tabIndex;t!==-1&&(this._elementRef.nativeElement.tabIndex=-1,setTimeout(()=>this._elementRef.nativeElement.tabIndex=t));}_getChipStream(t){return this._chips.changes.pipe(ny(null),ud(()=>Gm(...this._chips.map(t))))}_originatesFromChip(t){let i=t.target;for(;i&&i!==this._elementRef.nativeElement;){if(i.classList.contains("mat-mdc-chip"))return  true;i=i.parentElement;}return  false}_setUpFocusManagement(){this._chips.changes.pipe(ny(this._chips)).subscribe(t=>{let i=[];t.forEach(e=>e._getActions().forEach(d=>i.push(d))),this._chipActions.reset(i),this._chipActions.notifyOnChanges();}),this._keyManager=new _n(this._chipActions).withVerticalOrientation().withHorizontalOrientation(this._dir?this._dir.value:"ltr").withHomeAndEnd().skipPredicate(t=>this._skipPredicate(t)),this.chipFocusChanges.pipe(ry(this._destroyed)).subscribe(({chip:t})=>{let i=t._getSourceAction(document.activeElement);i&&this._keyManager.updateActiveItem(i);}),this._dir?.change.pipe(ry(this._destroyed)).subscribe(t=>this._keyManager.withHorizontalOrientation(t));}_skipPredicate(t){return t.disabled}_trackChipSetChanges(){this._chips.changes.pipe(ny(null),ry(this._destroyed)).subscribe(()=>{this.disabled&&Promise.resolve().then(()=>this._syncChipsState()),this._redirectDestroyedChipFocus();});}_trackDestroyedFocusedChip(){this.chipDestroyedChanges.pipe(ry(this._destroyed)).subscribe(t=>{let e=this._chips.toArray().indexOf(t.chip),d=t.chip._hasFocus(),l=t.chip._hadFocusOnRemove&&this._keyManager.activeItem&&t.chip._getActions().includes(this._keyManager.activeItem),Fe=d||l;this._isValidIndex(e)&&Fe&&(this._lastDestroyedFocusedChipIndex=e);});}_redirectDestroyedChipFocus(){if(this._lastDestroyedFocusedChipIndex!=null){if(this._chips.length){let t=Math.min(this._lastDestroyedFocusedChipIndex,this._chips.length-1),i=this._chips.toArray()[t];i.disabled?this._chips.length===1?this.focus():this._keyManager.setPreviousItemActive():i.focus();}else this.focus();this._lastDestroyedFocusedChipIndex=null;}}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=wI({type:n,selectors:[["mat-chip-set"]],contentQueries:function(i,e,d){if(i&1&&Kh(d,dt,5),i&2){let l;uw(l=lw())&&(e._chips=l);}},hostAttrs:[1,"mat-mdc-chip-set","mdc-evolution-chip-set"],hostVars:1,hostBindings:function(i,e){i&1&&Yh("keydown",function(l){return e._handleKeydown(l)}),i&2&&Hh("role",e.role);},inputs:{disabled:[2,"disabled","disabled",J1],role:"role",tabIndex:[2,"tabIndex","tabIndex",t=>t==null?0:ej(t)]},ngContentSelectors:Oe,decls:2,vars:0,consts:[["role","presentation",1,"mdc-evolution-chip-set__chips"]],template:function(i,e){i&1&&(sw(),Bu(0,"div",0),aw(1),Vu());},styles:[`.mat-mdc-chip-set {
  display: flex;
}
.mat-mdc-chip-set:focus {
  outline: none;
}
.mat-mdc-chip-set .mdc-evolution-chip-set__chips {
  min-width: 100%;
  margin-left: -8px;
  margin-right: 0;
}
.mat-mdc-chip-set .mdc-evolution-chip {
  margin: 4px 0 4px 8px;
}
[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip-set__chips {
  margin-left: 0;
  margin-right: -8px;
}
[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip {
  margin-left: 0;
  margin-right: 8px;
}

.mdc-evolution-chip-set__chips {
  display: flex;
  flex-flow: wrap;
  min-width: 0;
}

.mat-mdc-chip-set-stacked {
  flex-direction: column;
  align-items: flex-start;
}
.mat-mdc-chip-set-stacked .mat-mdc-chip {
  width: 100%;
}
.mat-mdc-chip-set-stacked .mdc-evolution-chip__graphic {
  flex-grow: 0;
}
.mat-mdc-chip-set-stacked .mdc-evolution-chip__action--primary {
  flex-basis: 100%;
  justify-content: start;
}

input.mat-mdc-chip-input {
  flex: 1 0 150px;
  margin-left: 8px;
}
[dir=rtl] input.mat-mdc-chip-input {
  margin-left: 0;
  margin-right: 8px;
}
.mat-mdc-form-field:not(.mat-form-field-hide-placeholder) input.mat-mdc-chip-input::placeholder {
  opacity: 1;
}
.mat-mdc-form-field:not(.mat-form-field-hide-placeholder) input.mat-mdc-chip-input::-moz-placeholder {
  opacity: 1;
}
.mat-mdc-form-field:not(.mat-form-field-hide-placeholder) input.mat-mdc-chip-input::-webkit-input-placeholder {
  opacity: 1;
}
.mat-mdc-form-field:not(.mat-form-field-hide-placeholder) input.mat-mdc-chip-input:-ms-input-placeholder {
  opacity: 1;
}
.mat-mdc-chip-set + input.mat-mdc-chip-input {
  margin-left: 0;
  margin-right: 0;
}
`],encapsulation:2})}return n})();var Ee=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=ss({type:n});static \u0275inj=Dr({providers:[at,{provide:ze,useValue:{separatorKeyCodes:[13]}}],imports:[or,xe]})}return n})();var Ne=["*"],Me=(()=>{class n{labelPosition="after";static \u0275fac=function(i){return new(i||n)};static \u0275cmp=wI({type:n,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(i,e){i&2&&og("mdc-form-field--align-end",e.labelPosition==="before");},inputs:{labelPosition:"labelPosition"},ngContentSelectors:Ne,decls:1,vars:0,template:function(i,e){i&1&&(sw(),aw(0));},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})}return n})();var Ue=["switch"],Ve=["*"];function Ge(n,s){n&1&&(qi(0,"span",11),Kd(),qi(1,"svg",13),$h(2,"path",14),ju(),qi(3,"svg",15),$h(4,"path",16),ju()());}var je=new w("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),J=class{source;checked;constructor(s,t){this.source=s,this.checked=t;}},lt=(()=>{class n{_elementRef=g(Zn);_focusMonitor=g(hn);_changeDetectorRef=g(bC);defaults=g(je);_onChange=t=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(t){return new J(this,t)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=Ie$1();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(t){this._checked=t,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new Ge$1;toggleChange=new Ge$1;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){g(q).load(nr);let t=g(new mg("tabindex"),{optional:true}),i=this.defaults;this.tabIndex=t==null?0:parseInt(t)||0,this.color=i.color||"accent",this.id=this._uniqueId=g(yn).getId("mat-mdc-slide-toggle-"),this.hideIcon=i.hideIcon??false,this.disabledInteractive=i.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(t=>{t==="keyboard"||t==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):t||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(t){t.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(t){this.checked=!!t;}registerOnChange(t){this._onChange=t;}registerOnTouched(t){this._onTouched=t;}validate(t){return this.required&&t.value!==true?{required:true}:null}registerOnValidatorChange(t){this._validatorOnChange=t;}setDisabledState(t){this.disabled=t,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new J(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(i){return new(i||n)};static \u0275cmp=wI({type:n,selectors:[["mat-slide-toggle"]],viewQuery:function(i,e){if(i&1&&Xh(Ue,5),i&2){let d;uw(d=lw())&&(e._switchElement=d.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(i,e){i&2&&(qh("id",e.id),Hh("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),Cw(e.color?"mat-"+e.color:""),og("mat-mdc-slide-toggle-focused",e._focused)("mat-mdc-slide-toggle-checked",e.checked)("_mat-animation-noopable",e._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",J1],color:"color",disabled:[2,"disabled","disabled",J1],disableRipple:[2,"disableRipple","disableRipple",J1],tabIndex:[2,"tabIndex","tabIndex",t=>t==null?0:ej(t)],checked:[2,"checked","checked",J1],hideIcon:[2,"hideIcon","hideIcon",J1],disabledInteractive:[2,"disabledInteractive","disabledInteractive",J1]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[Hw([{provide:Fn,useExisting:Ko(()=>n),multi:true},{provide:Qe$1,useExisting:n,multi:true}]),qc],ngContentSelectors:Ve,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(i,e){if(i&1&&(sw(),qi(0,"div",1)(1,"button",2,0),Yh("click",function(){return e._handleClick()}),$h(3,"div",3)(4,"span",4),qi(5,"span",5)(6,"span",6)(7,"span",7),$h(8,"span",8),ju(),qi(9,"span",9),$h(10,"span",10),ju(),GI(11,Ge,5,0,"span",11),ju()()(),qi(12,"label",12),Yh("click",function(l){return l.stopPropagation()}),aw(13),ju()()),i&2){let d=fw(2);Uh("labelPosition",e.labelPosition),GD(),og("mdc-switch--selected",e.checked)("mdc-switch--unselected",!e.checked)("mdc-switch--checked",e.checked)("mdc-switch--disabled",e.disabled)("mat-mdc-slide-toggle-disabled-interactive",e.disabledInteractive),Uh("tabIndex",e.disabled&&!e.disabledInteractive?-1:e.tabIndex)("disabled",e.disabled&&!e.disabledInteractive),Hh("id",e.buttonId)("name",e.name)("aria-label",e.ariaLabel)("aria-labelledby",e._getAriaLabelledBy())("aria-describedby",e.ariaDescribedby)("aria-required",e.required||null)("aria-checked",e.checked)("aria-disabled",e.disabled&&e.disabledInteractive?"true":null),GD(9),Uh("matRippleTrigger",d)("matRippleDisabled",e.disableRipple||e.disabled)("matRippleCentered",true),GD(),zI(e.hideIcon?-1:11),GD(),Uh("for",e.buttonId),Hh("id",e._labelId);}},dependencies:[Lc,Me],styles:[`.mdc-switch {
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
`],encapsulation:2})}return n})(),Ae=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=ss({type:n});static \u0275inj=Dr({imports:[lt,xe]})}return n})();function mt(n,s){let t=mp(s);t!==void 0&&n.assign(t);}function ri(n,s){n&1&&(qi(0,"div",4)(1,"mat-icon",23),kw(2,"lock"),ju(),qi(3,"span"),kw(4,"Active URL configuration is locked by enterprise policy (allowOverrides: false)."),ju()());}function si(n,s){n&1&&(qi(0,"mat-error"),kw(1,"Renderer URL is required."),ju());}function di(n,s){n&1&&(qi(0,"mat-error"),kw(1,' Must be a valid HTTP/HTTPS URL or relative path starting with "/". '),ju());}function li(n,s){n&1&&(qi(0,"mat-hint",27),kw(1,"Gemini Assistant feature will be disabled without a valid API key."),ju());}function hi(n,s){n&1&&(qi(0,"mat-error"),kw(1,"API key cannot be empty whitespace."),ju());}function mi(n,s){if(n&1){let t=tw();qi(0,"div",3)(1,"h3"),kw(2,"Gemini API Provisioning"),ju(),qi(3,"mat-form-field",5)(4,"mat-label"),kw(5,"Gemini API Key"),ju(),$h(6,"input",24),OE(),qi(7,"button",25),Yh("click",function(){jd(t);let e=ow();return Bd(e.hideApiKey.set(!e.hideApiKey()))}),qi(8,"mat-icon",26),kw(9),ju()(),GI(10,li,2,0,"mat-hint",27),GI(11,hi,2,0,"mat-error"),ju()();}if(n&2){let t=ow();GD(6),Uh("type",t.hideApiKey()?"password":"text"),PE(),GD(),Hh("aria-label",t.hideApiKey()?"Show API key":"Hide API key"),GD(2),lg(t.hideApiKey()?"visibility":"visibility_off"),GD(),zI(t.settingsForm.controls.apiKey.value?-1:10),GD(),zI(t.settingsForm.controls.apiKey.hasError("pattern")?11:-1);}}function pi(n,s){n&1&&(qi(0,"div",9)(1,"mat-icon",23),kw(2,"lock"),ju(),qi(3,"span"),kw(4,"Authentication mode overrides are locked by enterprise policy."),ju()());}function ui(n,s){n&1&&(qi(0,"mat-card-footer",12),kw(1," To obtain an API key: "),qi(2,"ol")(3,"li"),kw(4," Go to "),qi(5,"a",28),kw(6," Google AI Studio"),ju(),kw(7," and sign in with your Google account. "),ju(),qi(8,"li"),kw(9,"Click Create API key."),ju(),qi(10,"li"),kw(11,"Select or create a Google Cloud project when prompted, then click Create key."),ju(),qi(12,"li"),kw(13,"Save your key in a secure location!"),ju()(),kw(14," A2UI Composer encrypts your key and stores it locally in your browser's secure database using the "),qi(15,"a",29),kw(16,"Web Crypto API"),ju(),kw(17,". Neither Google nor anyone else has access to this key. "),ju());}function gi(n,s){if(n&1&&(qi(0,"code",21),kw(1),ju()),n&2){let t=ow();GD(),$u("[Catalog Error] ",t.catalogErrorMessage());}}function fi(n,s){n&1&&(qi(0,"code",22),kw(1,"[System] Catalog handshake completed successfully. Active catalog ready."),ju());}function vi(n,s){n&1&&(qi(0,"code"),kw(1,"[System] Catalog handshake in progress. Indexing metadata..."),ju());}function _i(n,s){n&1&&(qi(0,"code"),kw(1,"[System] Bridge connected. Initializing catalog handshake..."),ju());}function bi(n,s){n&1&&(qi(0,"code"),kw(1,"[System] Bridge disconnected. Waiting for iframe handshake initialization..."),ju());}var Re=class n{fb=g(su);startupResolution=g(Xg);document=g(W);platformLocation=g(ds);hostCommunication=g(qt);catalogManagement=g(io);configProvider=g(Is);is1PAuthEnabled=g(Kg);isLocked=Qe(false);isThirdParty=Qe(false);hideApiKey=Qe(true);forceThirdPartyAuth=Qe(false);bridgeConnected=eC(()=>this.hostCommunication.latestEnvelope()!==null);catalogStatus=eC(()=>this.catalogManagement.catalogError()?"Error":this.catalogManagement.isHandshakeInProgress()?"Indexing":this.catalogManagement.activeCatalog()?"Connected":"Disconnected");catalogErrorMessage=eC(()=>this.catalogManagement.catalogError());settingsForm=this.fb.group({rendererUrl:["",[Tn.required,Tn.pattern(/^(https?:\/\/|\/(?!\/)).+/i)]],apiKey:[""]});ngOnInit(){let s=this.startupResolution.isContextLocked();this.isLocked.set(s);let t=this.startupResolution.isThirdPartyEnvironment();this.isThirdParty.set(t),this.forceThirdPartyAuth.set(this.configProvider.authType()==="3p");let i=this.configProvider.rendererUrl(),e=this.configProvider.geminiApiKey();if(this.settingsForm.patchValue({rendererUrl:i,apiKey:e}),s&&this.settingsForm.controls.rendererUrl.disable(),t){let d=this.settingsForm.controls.apiKey;d.setValidators([Tn.pattern(/\S/)]),d.updateValueAndValidity();}}async saveSettings(){if(this.settingsForm.invalid){this.settingsForm.markAllAsTouched();return}let s=this.settingsForm.getRawValue();this.isThirdParty()?(this.isLocked()||this.configProvider.setRendererUrl(s.rendererUrl.trim()),await this.configProvider.setGeminiApiKey(s.apiKey.trim())):(await this.configProvider.purgeGeminiApiKey(),this.isLocked()||this.configProvider.setRendererUrl(s.rendererUrl.trim())),this.reloadWindow();}reloadWindow(){if(this.document.defaultView?.location){let s=this.platformLocation.getBaseHrefFromDOM()||"/";mt(this.document.defaultView.location,s);}}toggleForceThirdPartyAuth(){if(this.isLocked())return;let s=!this.forceThirdPartyAuth();this.forceThirdPartyAuth.set(s),this.configProvider.setForcedAuthMode(s?"3p":"1p"),this.reloadWindow();}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=wI({type:n,selectors:[["a2ui-composer-settings"]],decls:53,vars:15,consts:[[1,"settings-container"],[1,"settings-card"],[3,"ngSubmit","formGroup"],[1,"form-section"],[1,"locked-notice"],["appearance","outline",1,"full-width"],["matInput","","formControlName","rendererUrl","placeholder","http://localhost:3000"],[1,"form-section","first-party-auth-section",3,"hidden"],[1,"description"],[1,"locked-notice","auth-locked-notice"],[1,"toggle-container",2,"margin-top","12px"],[3,"change","checked","disabled"],[1,"get-api-key"],["align","end"],["mat-flat-button","","color","primary",3,"click"],[1,"status-card"],[1,"status-badges"],[1,"status-badge","bridge-badge",3,"color"],[1,"status-badge","catalog-badge",3,"color"],[1,"overlay-logs"],[1,"logs-console"],[1,"error-log",2,"color","#f44336","font-weight","bold"],[1,"success-log",2,"color","#4caf50"],["color","warn","aria-hidden","true"],["matInput","","formControlName","apiKey","placeholder","Enter your Gemini API key",3,"type"],["mat-icon-button","","matSuffix","","type","button",1,"api-key-toggle-btn",3,"click"],["aria-hidden","true"],[1,"warning-hint"],["href","https://aistudio.google.com/api-keys","target","_blank","rel","noopener noreferrer"],["href","https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API","target","_blank","rel","noopener noreferrer"]],template:function(t,i){t&1&&(qi(0,"div",0)(1,"mat-card",1)(2,"mat-card-header")(3,"mat-card-title"),kw(4,"A2UI Composer Settings"),ju()(),qi(5,"mat-card-content")(6,"form",2),Yh("ngSubmit",function(){return i.saveSettings()}),qi(7,"div",3)(8,"h3"),kw(9,"Renderer Application URL"),ju(),GI(10,ri,5,0,"div",4),qi(11,"mat-form-field",5)(12,"mat-label"),kw(13,"Target Renderer URL"),ju(),$h(14,"input",6),OE(),GI(15,si,2,0,"mat-error"),GI(16,di,2,0,"mat-error"),ju()(),GI(17,mi,12,5,"div",3),qi(18,"div",7)(19,"h3"),kw(20,"Developer Authentication Overrides"),ju(),qi(21,"p",8),kw(22," Simulate external 3P context to verify Gemini API key provisioning workflows. "),ju(),GI(23,pi,5,0,"div",9),qi(24,"div",10)(25,"mat-slide-toggle",11),Yh("change",function(){return i.toggleForceThirdPartyAuth()}),kw(26," Force External Third-Party Authentication Mode "),ju()()()()(),GI(27,ui,18,0,"mat-card-footer",12),qi(28,"mat-card-actions",13)(29,"button",14),Yh("click",function(){return i.saveSettings()}),kw(30,"Save Settings"),ju()()(),qi(31,"mat-card",15)(32,"mat-card-header")(33,"mat-card-title"),kw(34,"Connection Status & Diagnostics"),ju(),qi(35,"mat-card-subtitle"),kw(36,"Real-time monitoring bridge"),ju()(),qi(37,"mat-card-content")(38,"div",16)(39,"mat-chip-set")(40,"mat-chip",17),kw(41),ju(),qi(42,"mat-chip",18),kw(43),ju()()(),qi(44,"div",19)(45,"h4"),kw(46,"Overlay Logs Preview"),ju(),qi(47,"div",20),GI(48,gi,2,1,"code",21)(49,fi,2,0,"code",22)(50,vi,2,0,"code")(51,_i,2,0,"code")(52,bi,2,0,"code"),ju()()()()()),t&2&&(GD(6),Uh("formGroup",i.settingsForm),GD(4),zI(i.isLocked()?10:-1),GD(4),PE(),GD(),zI(i.settingsForm.controls.rendererUrl.hasError("required")?15:-1),GD(),zI(i.settingsForm.controls.rendererUrl.hasError("pattern")?16:-1),GD(),zI(i.isThirdParty()?17:-1),GD(),Uh("hidden",!i.is1PAuthEnabled),GD(5),zI(i.isLocked()?23:-1),GD(2),Uh("checked",i.forceThirdPartyAuth())("disabled",i.isLocked()),GD(2),zI(i.isThirdParty()?27:-1),GD(13),Uh("color",i.bridgeConnected()?"primary":"accent"),GD(),$u("Bridge: ",i.bridgeConnected()?"Connected":"Disconnected"),GD(),Uh("color",i.catalogStatus()==="Connected"?"primary":i.catalogStatus()==="Indexing"?"accent":i.catalogStatus()==="Error"?"warn":void 0),GD(),$u("Catalog Handshake: ",i.catalogStatus()),GD(5),zI(i.catalogErrorMessage()?48:i.catalogStatus()==="Connected"?49:i.catalogStatus()==="Indexing"?50:i.bridgeConnected()?51:52));},dependencies:[lu,ou,Cr,nu,iu,ks,Ps,ce,it,ae,le,kt,It,an,on,gd,hd,Lo,Ld,Vd,L,F,T,k,E,z,S,j,Ee,dt,Ie,Ae,lt],styles:[`.settings-container[_ngcontent-%COMP%]{padding:24px;max-width:600px;margin:0 auto}.form-section[_ngcontent-%COMP%]{margin-top:16px}.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin-bottom:8px}.full-width[_ngcontent-%COMP%]{width:100%}.locked-notice[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 14px;background-color:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container);border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:500}.status-card[_ngcontent-%COMP%]{margin-top:24px}.status-badges[_ngcontent-%COMP%]{margin-top:12px;margin-bottom:16px}.overlay-logs[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{margin-bottom:8px;font-size:14px}.overlay-logs[_ngcontent-%COMP%]   .logs-console[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container-lowest);color:var(--mat-sys-primary);padding:12px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5}  body .mat-mdc-slide-toggle .mat-internal-form-field,   body .mat-mdc-slide-toggle .mdc-form-field{display:inline-flex!important;align-items:center!important;gap:16px!important}  body .mat-mdc-slide-toggle label,   body .mat-mdc-slide-toggle .mdc-label{padding-left:16px!important;white-space:normal!important;line-height:1.4!important;color:var(--mat-sys-on-surface)!important}.warning-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);display:block;margin-top:4px}.get-api-key[_ngcontent-%COMP%]{font-size:var(--mat-sys-body-small-size, 12px);padding-left:24px}















`]})};export{Re as Settings};