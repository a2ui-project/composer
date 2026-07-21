import {o as ot,I as It$1,z as zt,q as qt,V as Vt}from'./chunk-M8SN7gsv.js';import {Q as Qe,e as eC,Y as Yg,g,D as Ds,I as Is,W,s as sf,w as wI,a as sr,N as Nt,C as Co,q as qi,b as Yh,k as kw,j as ju,$ as $h,G as GI,c as GD,H as Hh,U as Uh,d as $u,l as lg,o as og,f as Uw,z as zI,h as N,i as ss,m as Dr,Z as Zn,n as sw,p as aw,r as Cw,K as Kh,u as uw,t as lw,v as K,x as re$1,y as Qn,A as dh,B as w,E as ee$1,F as ry,L,J as ED,M as xu,O as bC,P as Bu,R as Qh,V as Vu,X as Xh}from'./main.js';import {M as Me,W as Wt$1,C as Ce,A as At,l as li,d as di,s as si,n as ne$1}from'./chunk-BWchWk6K.js';import {j,P}from'./chunk-FEqRqiQ3.js';import {i as io,$ as $t$1,g as gd,h as hd,L as Lo,a as Ld,V as Vd,R,e as ec,b as hn,B as Bo,I as It,c as Ie,d as Ic,p as pn,H as Hi,x as xe,w as wo}from'./chunk-K_J2SIZD.js';var Qt=["*",[["mat-toolbar-row"]]],Zt=["*","mat-toolbar-row"],Wt=(()=>{class o{static \u0275fac=function(e){return new(e||o)};static \u0275dir=xu({type:o,selectors:[["mat-toolbar-row"]],hostAttrs:[1,"mat-toolbar-row"],exportAs:["matToolbarRow"]})}return o})(),Gt=(()=>{class o{_elementRef=g(Zn);_platform=g(R);_document=g(W);color;_toolbarRows;ngAfterViewInit(){this._platform.isBrowser&&(this._checkToolbarMixedModes(),this._toolbarRows.changes.subscribe(()=>this._checkToolbarMixedModes()));}_checkToolbarMixedModes(){this._toolbarRows.length;}static \u0275fac=function(e){return new(e||o)};static \u0275cmp=wI({type:o,selectors:[["mat-toolbar"]],contentQueries:function(e,i,n){if(e&1&&Kh(n,Wt,5),e&2){let s;uw(s=lw())&&(i._toolbarRows=s);}},hostAttrs:[1,"mat-toolbar"],hostVars:6,hostBindings:function(e,i){e&2&&(Cw(i.color?"mat-"+i.color:""),og("mat-toolbar-multiple-rows",i._toolbarRows.length>0)("mat-toolbar-single-row",i._toolbarRows.length===0));},inputs:{color:"color"},exportAs:["matToolbar"],ngContentSelectors:Zt,decls:2,vars:0,template:function(e,i){e&1&&(sw(Qt),aw(0),aw(1,1));},styles:[`.mat-toolbar {
  background: var(--mat-toolbar-container-background-color, var(--mat-sys-surface));
  color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
}
.mat-toolbar, .mat-toolbar h1, .mat-toolbar h2, .mat-toolbar h3, .mat-toolbar h4, .mat-toolbar h5, .mat-toolbar h6 {
  font-family: var(--mat-toolbar-title-text-font, var(--mat-sys-title-large-font));
  font-size: var(--mat-toolbar-title-text-size, var(--mat-sys-title-large-size));
  line-height: var(--mat-toolbar-title-text-line-height, var(--mat-sys-title-large-line-height));
  font-weight: var(--mat-toolbar-title-text-weight, var(--mat-sys-title-large-weight));
  letter-spacing: var(--mat-toolbar-title-text-tracking, var(--mat-sys-title-large-tracking));
  margin: 0;
}
@media (forced-colors: active) {
  .mat-toolbar {
    outline: solid 1px;
  }
}
.mat-toolbar .mat-form-field-underline,
.mat-toolbar .mat-form-field-ripple,
.mat-toolbar .mat-focused .mat-form-field-ripple {
  background-color: currentColor;
}
.mat-toolbar .mat-form-field-label,
.mat-toolbar .mat-focused .mat-form-field-label,
.mat-toolbar .mat-select-value,
.mat-toolbar .mat-select-arrow,
.mat-toolbar .mat-form-field.mat-focused .mat-select-arrow {
  color: inherit;
}
.mat-toolbar .mat-input-element {
  caret-color: currentColor;
}
.mat-toolbar .mat-mdc-button-base.mat-mdc-button-base.mat-unthemed {
  --mat-button-text-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
  --mat-button-outlined-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
}

.mat-toolbar-row, .mat-toolbar-single-row {
  display: flex;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  height: var(--mat-toolbar-standard-height, 64px);
}
@media (max-width: 599px) {
  .mat-toolbar-row, .mat-toolbar-single-row {
    height: var(--mat-toolbar-mobile-height, 56px);
  }
}

.mat-toolbar-multiple-rows {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  min-height: var(--mat-toolbar-standard-height, 64px);
}
@media (max-width: 599px) {
  .mat-toolbar-multiple-rows {
    min-height: var(--mat-toolbar-mobile-height, 56px);
  }
}
`],encapsulation:2})}return o})();var Yt=(()=>{class o{static \u0275fac=function(e){return new(e||o)};static \u0275mod=ss({type:o});static \u0275inj=Dr({imports:[xe]})}return o})();var Jt=["tooltip"],te=20;var ee=new w("mat-tooltip-scroll-strategy",{providedIn:"root",factory:()=>{let o=g(re$1);return ()=>Vt(o,{scrollThrottle:te})}}),ie=new w("mat-tooltip-default-options",{providedIn:"root",factory:()=>({showDelay:0,hideDelay:0,touchendHideDelay:1500})});var Xt="tooltip-panel",oe={passive:true},ne=8,se=8,ae=24,re=200,U=(()=>{class o{_elementRef=g(Zn);_ngZone=g(K);_platform=g(R);_ariaDescriber=g(ec);_focusMonitor=g(hn);_dir=g(Bo);_injector=g(re$1);_viewContainerRef=g(Qn);_mediaMatcher=g(It);_document=g(W);_renderer=g(dh);_animationsDisabled=Ie();_defaultOptions=g(ie,{optional:true});_overlayRef=null;_tooltipInstance=null;_overlayPanelClass;_portal;_position="below";_positionAtOrigin=false;_disabled=false;_tooltipClass;_viewInitialized=false;_pointerExitEventsInitialized=false;_tooltipComponent=Bt;_viewportMargin=8;_currentPosition;_cssClassPrefix="mat-mdc";_ariaDescriptionPending=false;_dirSubscribed=false;get position(){return this._position}set position(t){t!==this._position&&(this._position=t,this._overlayRef&&(this._updatePosition(this._overlayRef),this._tooltipInstance?.show(0),this._overlayRef.updatePosition()));}get positionAtOrigin(){return this._positionAtOrigin}set positionAtOrigin(t){this._positionAtOrigin=Ic(t),this._detach(),this._overlayRef=null;}get disabled(){return this._disabled}set disabled(t){let e=Ic(t);this._disabled!==e&&(this._disabled=e,e?this.hide(0):this._setupPointerEnterEventsIfNeeded(),this._syncAriaDescription(this.message));}get showDelay(){return this._showDelay}set showDelay(t){this._showDelay=pn(t);}_showDelay;get hideDelay(){return this._hideDelay}set hideDelay(t){this._hideDelay=pn(t),this._tooltipInstance&&(this._tooltipInstance._mouseLeaveHideDelay=this._hideDelay);}_hideDelay;touchGestures="auto";get message(){return this._message}set message(t){let e=this._message;this._message=t!=null?String(t).trim():"",!this._message&&this._isTooltipVisible()?this.hide(0):(this._setupPointerEnterEventsIfNeeded(),this._updateTooltipMessage()),this._syncAriaDescription(e);}_message="";get tooltipClass(){return this._tooltipClass}set tooltipClass(t){this._tooltipClass=t,this._tooltipInstance&&this._setTooltipClass(this._tooltipClass);}_eventCleanups=[];_touchstartTimeout=null;_destroyed=new ee$1;_isDestroyed=false;constructor(){let t=this._defaultOptions;t&&(this._showDelay=t.showDelay,this._hideDelay=t.hideDelay,t.position&&(this.position=t.position),t.positionAtOrigin&&(this.positionAtOrigin=t.positionAtOrigin),t.touchGestures&&(this.touchGestures=t.touchGestures),t.tooltipClass&&(this.tooltipClass=t.tooltipClass)),this._viewportMargin=ne;}ngAfterViewInit(){this._viewInitialized=true,this._setupPointerEnterEventsIfNeeded(),this._focusMonitor.monitor(this._elementRef).pipe(ry(this._destroyed)).subscribe(t=>{t?t==="keyboard"&&this._ngZone.run(()=>this.show()):this._ngZone.run(()=>this.hide(0));});}ngOnDestroy(){let t=this._elementRef.nativeElement;this._touchstartTimeout&&clearTimeout(this._touchstartTimeout),this._overlayRef&&(this._overlayRef.dispose(),this._tooltipInstance=null),this._eventCleanups.forEach(e=>e()),this._eventCleanups.length=0,this._destroyed.next(),this._destroyed.complete(),this._isDestroyed=true,this._ariaDescriber.removeDescription(t,this.message,"tooltip"),this._focusMonitor.stopMonitoring(t);}show(t=this.showDelay,e){if(this.disabled||!this.message||this._isTooltipVisible()){this._tooltipInstance?._cancelPendingAnimations();return}let i=this._createOverlay(e);this._detach(),this._portal=this._portal||new ot(this._tooltipComponent,this._viewContainerRef);let n=this._tooltipInstance=i.attach(this._portal).instance;n._triggerElement=this._elementRef.nativeElement,n._mouseLeaveHideDelay=this._hideDelay,n.afterHidden().pipe(ry(this._destroyed)).subscribe(()=>this._detach()),this._setTooltipClass(this._tooltipClass),this._updateTooltipMessage(),n.show(t);}hide(t=this.hideDelay){let e=this._tooltipInstance;e&&(e.isVisible()?e.hide(t):(e._cancelPendingAnimations(),this._detach()));}toggle(t){this._isTooltipVisible()?this.hide():this.show(void 0,t);}_isTooltipVisible(){return !!this._tooltipInstance&&this._tooltipInstance.isVisible()}_createOverlay(t){if(this._overlayRef){let s=this._overlayRef.getConfig().positionStrategy;if((!this.positionAtOrigin||!t)&&s._origin instanceof Zn)return this._overlayRef;this._detach();}let e=this._injector.get(j).getAncestorScrollContainers(this._elementRef),i=`${this._cssClassPrefix}-${Xt}`,n=It$1(this._injector,this.positionAtOrigin?t||this._elementRef:this._elementRef).withTransformOriginOn(`.${this._cssClassPrefix}-tooltip`).withFlexibleDimensions(false).withViewportMargin(this._viewportMargin).withScrollableContainers(e).withPopoverLocation("global");return n.positionChanges.pipe(ry(this._destroyed)).subscribe(s=>{this._updateCurrentPositionClass(s.connectionPair),this._tooltipInstance&&s.scrollableViewProperties.isOverlayClipped&&this._tooltipInstance.isVisible()&&this._ngZone.run(()=>this.hide(0));}),this._overlayRef=zt(this._injector,{direction:this._dir,positionStrategy:n,panelClass:this._overlayPanelClass?[...this._overlayPanelClass,i]:i,scrollStrategy:this._injector.get(ee)(),disableAnimations:this._animationsDisabled,eventPredicate:this._overlayEventPredicate}),this._updatePosition(this._overlayRef),this._overlayRef.detachments().pipe(ry(this._destroyed)).subscribe(()=>this._detach()),this._overlayRef.outsidePointerEvents().pipe(ry(this._destroyed)).subscribe(()=>this._tooltipInstance?._handleBodyInteraction()),this._overlayRef.keydownEvents().pipe(ry(this._destroyed)).subscribe(s=>{s.preventDefault(),s.stopPropagation(),this._ngZone.run(()=>this.hide(0));}),this._defaultOptions?.disableTooltipInteractivity&&this._overlayRef.addPanelClass(`${this._cssClassPrefix}-tooltip-panel-non-interactive`),this._dirSubscribed||(this._dirSubscribed=true,this._dir.change.pipe(ry(this._destroyed)).subscribe(()=>{this._overlayRef&&this._updatePosition(this._overlayRef);})),this._overlayRef}_detach(){this._overlayRef&&this._overlayRef.hasAttached()&&this._overlayRef.detach(),this._tooltipInstance=null;}_updatePosition(t){let e=t.getConfig().positionStrategy,i=this._getOrigin(),n=this._getOverlayPosition();e.withPositions([this._addOffset(L(L({},i.main),n.main)),this._addOffset(L(L({},i.fallback),n.fallback))]);}_addOffset(t){let e=se,i=!this._dir||this._dir.value=="ltr";return t.originY==="top"?t.offsetY=-e:t.originY==="bottom"?t.offsetY=e:t.originX==="start"?t.offsetX=i?-e:e:t.originX==="end"&&(t.offsetX=i?e:-e),t}_getOrigin(){let t=!this._dir||this._dir.value=="ltr",e=this.position,i;e=="above"||e=="below"?i={originX:"center",originY:e=="above"?"top":"bottom"}:e=="before"||e=="left"&&t||e=="right"&&!t?i={originX:"start",originY:"center"}:(e=="after"||e=="right"&&t||e=="left"&&!t)&&(i={originX:"end",originY:"center"});let{x:n,y:s}=this._invertPosition(i.originX,i.originY);return {main:i,fallback:{originX:n,originY:s}}}_getOverlayPosition(){let t=!this._dir||this._dir.value=="ltr",e=this.position,i;e=="above"?i={overlayX:"center",overlayY:"bottom"}:e=="below"?i={overlayX:"center",overlayY:"top"}:e=="before"||e=="left"&&t||e=="right"&&!t?i={overlayX:"end",overlayY:"center"}:(e=="after"||e=="right"&&t||e=="left"&&!t)&&(i={overlayX:"start",overlayY:"center"});let{x:n,y:s}=this._invertPosition(i.overlayX,i.overlayY);return {main:i,fallback:{overlayX:n,overlayY:s}}}_updateTooltipMessage(){this._tooltipInstance&&(this._tooltipInstance.message=this.message,this._tooltipInstance._markForCheck(),ED(()=>{this._tooltipInstance&&this._overlayRef.updatePosition();},{injector:this._injector}));}_setTooltipClass(t){this._tooltipInstance&&(this._tooltipInstance.tooltipClass=t instanceof Set?Array.from(t):t,this._tooltipInstance._markForCheck());}_invertPosition(t,e){return this.position==="above"||this.position==="below"?e==="top"?e="bottom":e==="bottom"&&(e="top"):t==="end"?t="start":t==="start"&&(t="end"),{x:t,y:e}}_updateCurrentPositionClass(t){let{overlayY:e,originX:i,originY:n}=t,s;if(e==="center"?this._dir&&this._dir.value==="rtl"?s=i==="end"?"left":"right":s=i==="start"?"left":"right":s=e==="bottom"&&n==="top"?"above":"below",s!==this._currentPosition){let R=this._overlayRef;if(R){let $=`${this._cssClassPrefix}-${Xt}-`;R.removePanelClass($+this._currentPosition),R.addPanelClass($+s);}this._currentPosition=s;}}_setupPointerEnterEventsIfNeeded(){this._disabled||!this.message||!this._viewInitialized||this._eventCleanups.length||(this._isTouchPlatform()?this.touchGestures!=="off"&&(this._disableNativeGesturesIfNecessary(),this._addListener("touchstart",t=>{let e=t.targetTouches?.[0],i=e?{x:e.clientX,y:e.clientY}:void 0;this._setupPointerExitEventsIfNeeded(),this._touchstartTimeout&&clearTimeout(this._touchstartTimeout);let n=500;this._touchstartTimeout=setTimeout(()=>{this._touchstartTimeout=null,this.show(void 0,i);},this._defaultOptions?.touchLongPressShowDelay??n);})):this._addListener("mouseenter",t=>{this._setupPointerExitEventsIfNeeded();let e;t.x!==void 0&&t.y!==void 0&&(e=t),this.show(void 0,e);}));}_setupPointerExitEventsIfNeeded(){if(!this._pointerExitEventsInitialized){if(this._pointerExitEventsInitialized=true,!this._isTouchPlatform())this._addListener("mouseleave",t=>{let e=t.relatedTarget;(!e||!this._overlayRef?.overlayElement.contains(e))&&this.hide();}),this._addListener("wheel",t=>{if(this._isTooltipVisible()){let e=this._document.elementFromPoint(t.clientX,t.clientY),i=this._elementRef.nativeElement;e!==i&&!i.contains(e)&&this.hide();}});else if(this.touchGestures!=="off"){this._disableNativeGesturesIfNecessary();let t=()=>{this._touchstartTimeout&&clearTimeout(this._touchstartTimeout),this.hide(this._defaultOptions?.touchendHideDelay);};this._addListener("touchend",t),this._addListener("touchcancel",t);}}}_addListener(t,e){this._eventCleanups.push(this._renderer.listen(this._elementRef.nativeElement,t,e,oe));}_isTouchPlatform(){let t=this._defaultOptions?.detectHoverCapability;return typeof t=="function"?!t():this._platform.IOS||this._platform.ANDROID?true:this._platform.isBrowser?!!t&&this._mediaMatcher.matchMedia("(any-hover: none)").matches:false}_disableNativeGesturesIfNecessary(){let t=this.touchGestures;if(t!=="off"){let e=this._elementRef.nativeElement,i=e.style;(t==="on"||e.nodeName!=="INPUT"&&e.nodeName!=="TEXTAREA")&&(i.userSelect=i.msUserSelect=i.webkitUserSelect=i.MozUserSelect="none"),(t==="on"||!e.draggable)&&(i.webkitUserDrag="none"),i.touchAction="none",i.webkitTapHighlightColor="transparent";}}_syncAriaDescription(t){this._ariaDescriptionPending||(this._ariaDescriptionPending=true,this._ariaDescriber.removeDescription(this._elementRef.nativeElement,t,"tooltip"),this._isDestroyed||ED({write:()=>{this._ariaDescriptionPending=false,this.message&&!this.disabled&&this._ariaDescriber.describe(this._elementRef.nativeElement,this.message,"tooltip");}},{injector:this._injector}));}_overlayEventPredicate=t=>t.type==="keydown"?this._isTooltipVisible()&&t.keyCode===27&&!Hi(t):true;static \u0275fac=function(e){return new(e||o)};static \u0275dir=xu({type:o,selectors:[["","matTooltip",""]],hostAttrs:[1,"mat-mdc-tooltip-trigger"],hostVars:2,hostBindings:function(e,i){e&2&&og("mat-mdc-tooltip-disabled",i.disabled);},inputs:{position:[0,"matTooltipPosition","position"],positionAtOrigin:[0,"matTooltipPositionAtOrigin","positionAtOrigin"],disabled:[0,"matTooltipDisabled","disabled"],showDelay:[0,"matTooltipShowDelay","showDelay"],hideDelay:[0,"matTooltipHideDelay","hideDelay"],touchGestures:[0,"matTooltipTouchGestures","touchGestures"],message:[0,"matTooltip","message"],tooltipClass:[0,"matTooltipClass","tooltipClass"]},exportAs:["matTooltip"]})}return o})(),Bt=(()=>{class o{_changeDetectorRef=g(bC);_elementRef=g(Zn);_isMultiline=false;message;tooltipClass;_showTimeoutId;_hideTimeoutId;_triggerElement;_mouseLeaveHideDelay;_animationsDisabled=Ie();_tooltip;_closeOnInteraction=false;_isVisible=false;_onHide=new ee$1;_showAnimation="mat-mdc-tooltip-show";_hideAnimation="mat-mdc-tooltip-hide";show(t){this._hideTimeoutId!=null&&clearTimeout(this._hideTimeoutId),this._showTimeoutId=setTimeout(()=>{this._toggleVisibility(true),this._showTimeoutId=void 0;},t);}hide(t){this._showTimeoutId!=null&&clearTimeout(this._showTimeoutId),this._hideTimeoutId=setTimeout(()=>{this._toggleVisibility(false),this._hideTimeoutId=void 0;},t);}afterHidden(){return this._onHide}isVisible(){return this._isVisible}ngOnDestroy(){this._cancelPendingAnimations(),this._onHide.complete(),this._triggerElement=null;}_handleBodyInteraction(){this._closeOnInteraction&&this.hide(0);}_markForCheck(){this._changeDetectorRef.markForCheck();}_handleMouseLeave({relatedTarget:t}){(!t||!this._triggerElement.contains(t))&&(this.isVisible()?this.hide(this._mouseLeaveHideDelay):this._finalizeAnimation(false));}_onShow(){this._isMultiline=this._isTooltipMultiline(),this._markForCheck();}_isTooltipMultiline(){let t=this._elementRef.nativeElement.getBoundingClientRect();return t.height>ae&&t.width>=re}_handleAnimationEnd({animationName:t}){(t===this._showAnimation||t===this._hideAnimation)&&this._finalizeAnimation(t===this._showAnimation);}_cancelPendingAnimations(){this._showTimeoutId!=null&&clearTimeout(this._showTimeoutId),this._hideTimeoutId!=null&&clearTimeout(this._hideTimeoutId),this._showTimeoutId=this._hideTimeoutId=void 0;}_finalizeAnimation(t){t?this._closeOnInteraction=true:this.isVisible()||this._onHide.next();}_toggleVisibility(t){let e=this._tooltip.nativeElement,i=this._showAnimation,n=this._hideAnimation;if(e.classList.remove(t?n:i),e.classList.add(t?i:n),this._isVisible!==t&&(this._isVisible=t,this._changeDetectorRef.markForCheck()),t&&!this._animationsDisabled&&typeof getComputedStyle=="function"){let s=getComputedStyle(e);(s.getPropertyValue("animation-duration")==="0s"||s.getPropertyValue("animation-name")==="none")&&(this._animationsDisabled=true);}t&&this._onShow(),this._animationsDisabled&&(e.classList.add("_mat-animation-noopable"),this._finalizeAnimation(t));}static \u0275fac=function(e){return new(e||o)};static \u0275cmp=wI({type:o,selectors:[["mat-tooltip-component"]],viewQuery:function(e,i){if(e&1&&Xh(Jt,7),e&2){let n;uw(n=lw())&&(i._tooltip=n.first);}},hostAttrs:["aria-hidden","true"],hostBindings:function(e,i){e&1&&Yh("mouseleave",function(s){return i._handleMouseLeave(s)});},decls:4,vars:5,consts:[["tooltip",""],[1,"mdc-tooltip","mat-mdc-tooltip",3,"animationend"],[1,"mat-mdc-tooltip-surface","mdc-tooltip__surface"]],template:function(e,i){e&1&&(Bu(0,"div",1,0),Qh("animationend",function(s){return i._handleAnimationEnd(s)}),Bu(2,"div",2),kw(3),Vu()()),e&2&&(Cw(i.tooltipClass),og("mdc-tooltip--multiline",i._isMultiline),GD(3),lg(i.message));},styles:[`.mat-mdc-tooltip {
  position: relative;
  transform: scale(0);
  display: inline-flex;
}
.mat-mdc-tooltip::before {
  content: "";
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  position: absolute;
}
.mat-mdc-tooltip-panel-below .mat-mdc-tooltip::before {
  top: -8px;
}
.mat-mdc-tooltip-panel-above .mat-mdc-tooltip::before {
  bottom: -8px;
}
.mat-mdc-tooltip-panel-right .mat-mdc-tooltip::before {
  left: -8px;
}
.mat-mdc-tooltip-panel-left .mat-mdc-tooltip::before {
  right: -8px;
}
.mat-mdc-tooltip._mat-animation-noopable {
  animation: none;
  transform: scale(1);
}

.mat-mdc-tooltip-surface {
  word-break: normal;
  overflow-wrap: anywhere;
  padding: 4px 8px;
  min-width: 40px;
  max-width: 200px;
  min-height: 24px;
  max-height: 40vh;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  will-change: transform, opacity;
  background-color: var(--mat-tooltip-container-color, var(--mat-sys-inverse-surface));
  color: var(--mat-tooltip-supporting-text-color, var(--mat-sys-inverse-on-surface));
  border-radius: var(--mat-tooltip-container-shape, var(--mat-sys-corner-extra-small));
  font-family: var(--mat-tooltip-supporting-text-font, var(--mat-sys-body-small-font));
  font-size: var(--mat-tooltip-supporting-text-size, var(--mat-sys-body-small-size));
  font-weight: var(--mat-tooltip-supporting-text-weight, var(--mat-sys-body-small-weight));
  line-height: var(--mat-tooltip-supporting-text-line-height, var(--mat-sys-body-small-line-height));
  letter-spacing: var(--mat-tooltip-supporting-text-tracking, var(--mat-sys-body-small-tracking));
}
.mat-mdc-tooltip-surface::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}
.mdc-tooltip--multiline .mat-mdc-tooltip-surface {
  text-align: left;
}
[dir=rtl] .mdc-tooltip--multiline .mat-mdc-tooltip-surface {
  text-align: right;
}

.mat-mdc-tooltip-panel {
  line-height: normal;
}
.mat-mdc-tooltip-panel.mat-mdc-tooltip-panel-non-interactive {
  pointer-events: none;
}

@keyframes mat-mdc-tooltip-show {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes mat-mdc-tooltip-hide {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
.mat-mdc-tooltip-show {
  animation: mat-mdc-tooltip-show 150ms cubic-bezier(0, 0, 0.2, 1) forwards;
}

.mat-mdc-tooltip-hide {
  animation: mat-mdc-tooltip-hide 75ms cubic-bezier(0.4, 0, 1, 1) forwards;
}
`],encapsulation:2})}return o})();var Ut=(()=>{class o{static \u0275fac=function(e){return new(e||o)};static \u0275mod=ss({type:o});static \u0275inj=Dr({imports:[wo,qt,xe,P]})}return o})();var A=class o{storage=null;constructor(){try{typeof window<"u"&&window.sessionStorage&&(this.storage=window.sessionStorage);}catch(r){console.warn("Failed to access window.sessionStorage safely in environment:",r),this.storage=null;}}getItem(r){if(!this.storage)return null;try{return this.storage.getItem(r)}catch(t){return console.warn(`Failed to read key "${r}" from sessionStorage safely:`,t),null}}setItem(r,t){if(this.storage)try{this.storage.setItem(r,t);}catch(e){console.warn(`Failed to write key "${r}" to sessionStorage safely:`,e);}}removeItem(r){if(this.storage)try{this.storage.removeItem(r);}catch(t){console.warn(`Failed to remove key "${r}" from sessionStorage safely:`,t);}}clear(){if(this.storage)try{this.storage.clear();}catch(r){console.warn("Failed to clear sessionStorage safely:",r);}}static \u0275fac=function(t){return new(t||o)};static \u0275prov=N({token:o,factory:o.\u0275fac,providedIn:"root"})};var me=()=>({exact:true});function ce(o,r){o&1&&(qi(0,"span",12),kw(1,"Composer Workspace"),ju());}function de(o,r){o&1&&(qi(0,"span",12),kw(1,"Components Gallery"),ju());}function he(o,r){o&1&&(qi(0,"span",12),kw(1,"Settings"),ju());}var $t=class o{isCollapsed=Qe(true);isDarkTheme=eC(()=>this.configProvider.themePreference()===Yg.DARK);catalogManagement=g(io);indexedDbStorage=g($t$1);storage=g(Ds);sessionStorage=g(A);configProvider=g(Is);document=g(W);activeCatalogTitle=this.catalogManagement.activeCatalogTitle;activeCatalogDescription=this.catalogManagement.activeCatalogDescription;constructor(){sf(()=>{this.isDarkTheme()?this.document.body.classList.add("dark-theme"):this.document.body.classList.remove("dark-theme");});}toggleCollapsed(){this.isCollapsed.update(r=>!r);}ensureCollapsed(){this.isCollapsed.set(true);}toggleTheme(){this.configProvider.setThemePreference(this.isDarkTheme()?Yg.LIGHT:Yg.DARK);}async resetSession(){await this.indexedDbStorage.flushAllRecords(),this.storage.removeItem("a2ui_composer_session_state"),this.storage.removeItem("a2ui_composer_editor_cache"),this.sessionStorage.clear(),this.document.defaultView&&this.document.defaultView.location.reload(),console.log("Session state cleared.");}static \u0275fac=function(t){return new(t||o)};static \u0275cmp=wI({type:o,selectors:[["a2ui-composer-shell"]],decls:30,vars:16,consts:[["sidenav",""],[1,"composer-header"],["mat-icon-button","","aria-label","Toggle sidenav","aria-controls","composer-sidenav",1,"hamburger-button",3,"click"],["aria-hidden","true"],[1,"header-title",3,"matTooltip"],[1,"spacer"],["mat-button","","color","primary",1,"reset-session-button",3,"click"],["mat-icon-button","","color","primary",1,"theme-toggle-button",3,"click"],[1,"composer-sidenav-container"],["id","composer-sidenav","mode","side",1,"composer-sidenav",3,"opened"],["mat-list-item","","routerLink","/","routerLinkActive","active-nav-item","aria-label","Composer Workspace","matTooltip","Composer Workspace","matTooltipPosition","right",3,"click","routerLinkActiveOptions","matTooltipDisabled"],["matListItemIcon","","aria-hidden","true"],[1,"nav-label"],["mat-list-item","","routerLink","/gallery","routerLinkActive","active-nav-item","aria-label","Components Gallery","matTooltip","Components Gallery","matTooltipPosition","right",3,"click","matTooltipDisabled"],["mat-list-item","","routerLink","/settings","routerLinkActive","active-nav-item","aria-label","Settings","matTooltip","Settings","matTooltipPosition","right",3,"click","matTooltipDisabled"],[1,"composer-content"]],template:function(t,e){t&1&&(qi(0,"mat-toolbar",1)(1,"button",2),Yh("click",function(){return e.toggleCollapsed()}),qi(2,"mat-icon",3),kw(3,"menu"),ju()(),qi(4,"span",4),kw(5),ju(),$h(6,"span",5),qi(7,"button",6),Yh("click",function(){return e.resetSession()}),kw(8," New Session "),ju(),qi(9,"button",7),Yh("click",function(){return e.toggleTheme()}),qi(10,"mat-icon",3),kw(11),ju()()(),qi(12,"mat-sidenav-container",8)(13,"mat-sidenav",9,0)(15,"mat-nav-list")(16,"a",10),Yh("click",function(){return e.ensureCollapsed()}),qi(17,"mat-icon",11),kw(18,"construction"),ju(),GI(19,ce,2,0,"span",12),ju(),qi(20,"a",13),Yh("click",function(){return e.ensureCollapsed()}),qi(21,"mat-icon",11),kw(22,"widgets"),ju(),GI(23,de,2,0,"span",12),ju(),qi(24,"a",14),Yh("click",function(){return e.ensureCollapsed()}),qi(25,"mat-icon",11),kw(26,"settings"),ju(),GI(27,he,2,0,"span",12),ju()()(),qi(28,"mat-sidenav-content",15),$h(29,"router-outlet"),ju()()),t&2&&(GD(),Hh("aria-expanded",!e.isCollapsed()),GD(3),Uh("matTooltip",e.activeCatalogDescription()||""),GD(),$u("A2UI Composer",e.activeCatalogTitle()?" - "+e.activeCatalogTitle():""),GD(4),Hh("aria-label",e.isDarkTheme()?"Switch to light theme":"Switch to dark theme"),GD(2),lg(e.isDarkTheme()?"light_mode":"dark_mode"),GD(2),og("collapsed",e.isCollapsed()),Uh("opened",true),GD(3),Uh("routerLinkActiveOptions",Uw(15,me))("matTooltipDisabled",!e.isCollapsed()),GD(3),zI(e.isCollapsed()?-1:19),GD(),Uh("matTooltipDisabled",!e.isCollapsed()),GD(3),zI(e.isCollapsed()?-1:23),GD(),Uh("matTooltipDisabled",!e.isCollapsed()),GD(3),zI(e.isCollapsed()?-1:27));},dependencies:[Yt,Gt,Me,Wt$1,Ce,At,gd,hd,Lo,Ld,Vd,li,di,si,ne$1,sr,Nt,Co,Ut,U],styles:["[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%}.composer-header[_ngcontent-%COMP%]{position:relative;z-index:2;flex-shrink:0;background-color:var(--mat-sys-surface-container);color:var(--mat-sys-on-surface);border-bottom:1px solid var(--mat-sys-outline-variant);--mat-toolbar-container-background-color: var(--mat-sys-surface-container);--mat-toolbar-container-text-color: var(--mat-sys-on-surface)}.spacer[_ngcontent-%COMP%]{flex:1 1 auto}.composer-sidenav-container[_ngcontent-%COMP%]{flex:1;min-height:0}.composer-sidenav[_ngcontent-%COMP%]{width:250px;background-color:var(--mat-sys-surface-container);border-right:1px solid var(--mat-sys-outline-variant);--mat-sidenav-container-shape: 0px;--mat-drawer-container-shape: 0px;border-radius:0;--mat-sidenav-background-color: var(--mat-sys-surface-container);transition:width .2s ease-in-out}.composer-sidenav[_ngcontent-%COMP%]     .mat-drawer-inner-container{border-radius:0;white-space:nowrap;overflow-x:hidden}.composer-sidenav[_ngcontent-%COMP%]   mat-nav-list[_ngcontent-%COMP%]{padding:8px}.composer-sidenav[_ngcontent-%COMP%]   mat-nav-list[_ngcontent-%COMP%]   a[mat-list-item][_ngcontent-%COMP%]{border-radius:28px;margin-bottom:4px}.composer-sidenav[_ngcontent-%COMP%]   mat-nav-list[_ngcontent-%COMP%]   a[mat-list-item].active-nav-item[_ngcontent-%COMP%]{background-color:var(--mat-sys-secondary-container);color:var(--mat-sys-on-secondary-container)}.composer-sidenav[_ngcontent-%COMP%]   mat-nav-list[_ngcontent-%COMP%]   a[mat-list-item].active-nav-item[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{color:var(--mat-sys-primary)}.composer-sidenav.collapsed[_ngcontent-%COMP%]{width:64px}.composer-sidenav.collapsed[_ngcontent-%COMP%]   a[mat-list-item][_ngcontent-%COMP%]{padding:16px;display:flex;justify-content:center}.composer-sidenav.collapsed[_ngcontent-%COMP%]   a[mat-list-item][_ngcontent-%COMP%]     .mdc-list-item__start{margin:0}.composer-content[_ngcontent-%COMP%]{padding:0;box-sizing:border-box;height:100%}.hamburger-button[_ngcontent-%COMP%]{margin-right:8px}.theme-toggle-button[_ngcontent-%COMP%]{margin-left:8px}"]})};export{$t as ComposerShell};