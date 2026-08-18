import {f,a4 as ae,Y as Y_,S as So,j,aa as Uq,b9 as Ee,aJ as Al,V as L_,ah as ue,ba as Ho,ab as qn,ac as Ws,r as I,h as ho,bb as Fn,K as K_,bc as Xa,ak as Z,al as E$1,X as pe,bd as Xc,be as vA,bf as k,bg as sp,as as g,ao as Jt,bh as Eo,b6 as $e,aw as Er,bi as f3,bj as dn,bk as Cr,bl as Io,bm as Ji,bn as w,Q,t as K,bo as es,an as Dr,i as i_,u as st$1,A as Ai,b as fe,o as o_,c as Me,e as Yt,z as ze,g as wi,k as bt$1,l as Sf,q as Ci,bp as Do,ap as M,x as z$1,a6 as pc,y as te,R,ag as C,at as It$1,aS as $t,ax as Xi,ay as Ce,aB as ao,v as vv,D as Dt$1,d as ic,W as We,aC as xi,H as sc,N as ac,P as J$1,aY as AS,aP as RS,aZ as _m,a_ as Em}from'./main.js';import {o,p,l,b}from'./chunk-Blv2imfc.js';function ht(r,n){if(r&1){let e=AS();Me(0,"div",1)(1,"button",2),ic("click",function(){_m(e);let a=RS();return Em(a.action())}),Yt(2),ze()();}if(r&2){let e=RS();bt$1(2),Sf(" ",e.data.action," ");}}var ft=["label"];function gt(r,n){}var yt=Math.pow(2,31)-1,E=class{_overlayRef;instance;containerInstance;_afterDismissed=new C;_afterOpened=new C;_onAction=new C;_durationTimeoutId;_dismissedByAction=false;constructor(n,e){this._overlayRef=e,this.containerInstance=n,n._onExit.subscribe(()=>this._finishDismiss());}dismiss(){this._afterDismissed.closed||this.containerInstance.exit(),clearTimeout(this._durationTimeoutId);}dismissWithAction(){this._onAction.closed||(this._dismissedByAction=true,this._onAction.next(),this._onAction.complete(),this.dismiss()),clearTimeout(this._durationTimeoutId);}closeWithAction(){this.dismissWithAction();}_dismissAfter(n){this._durationTimeoutId=setTimeout(()=>this.dismiss(),Math.min(n,yt));}_open(){this._afterOpened.closed||(this._afterOpened.next(),this._afterOpened.complete());}_finishDismiss(){this._overlayRef.dispose(),this._onAction.closed||this._onAction.complete(),this._afterDismissed.next({dismissedByAction:this._dismissedByAction}),this._afterDismissed.complete(),this._dismissedByAction=false;}afterDismissed(){return this._afterDismissed}afterOpened(){return this.containerInstance._onEnter}onAction(){return this._onAction}},at=new g("MatSnackBarData"),A=class{politeness="polite";announcementMessage="";viewContainerRef;duration=0;panelClass;direction;data=null;horizontalPosition="center";verticalPosition="bottom"},vt=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275dir=J$1({type:r,selectors:[["","matSnackBarLabel",""]],hostAttrs:[1,"mat-mdc-snack-bar-label","mdc-snackbar__label"]})}return r})(),bt=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275dir=J$1({type:r,selectors:[["","matSnackBarActions",""]],hostAttrs:[1,"mat-mdc-snack-bar-actions","mdc-snackbar__actions"]})}return r})(),_t=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275dir=J$1({type:r,selectors:[["","matSnackBarAction",""]],hostAttrs:[1,"mat-mdc-snack-bar-action","mdc-snackbar__action"]})}return r})(),it=(()=>{class r{snackBarRef=f(E);data=f(at);action(){this.snackBarRef.dismissWithAction();}get hasAction(){return !!this.data.action}static \u0275fac=function(t){return new(t||r)};static \u0275cmp=fe({type:r,selectors:[["simple-snack-bar"]],hostAttrs:[1,"mat-mdc-simple-snack-bar"],exportAs:["matSnackBar"],decls:3,vars:2,consts:[["matSnackBarLabel",""],["matSnackBarActions",""],["matButton","","matSnackBarAction","",3,"click"]],template:function(t,a){t&1&&(Me(0,"div",0),Yt(1),ze(),wi(2,ht,3,1,"div",1)),t&2&&(bt$1(),Sf(" ",a.data.message,`
`),bt$1(),Ci(a.hasAction?2:-1));},dependencies:[o_,vt,bt,_t],styles:[`.mat-mdc-simple-snack-bar {
  display: flex;
}
.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-label {
  max-height: 50vh;
  overflow: auto;
}
`],encapsulation:2})}return r})(),re="_mat-snack-bar-enter",oe="_mat-snack-bar-exit",St=(()=>{class r extends Do{_ngZone=f(M);_elementRef=f(z$1);_changeDetectorRef=f(pc);_platform=f(te);_animationsDisabled=Jt();snackBarConfig=f(A);_document=f(R);_trackedModals=new Set;_enterFallback;_exitFallback;_injector=f(k);_announceDelay=150;_announceTimeoutId;_destroyed=false;_portalOutlet;_onAnnounce=new C;_onExit=new C;_onEnter=new C;_animationState="void";_live;_label;_role;_liveElementId=f(It$1).getId("mat-snack-bar-container-live-");constructor(){super();let e=this.snackBarConfig;e.politeness==="assertive"&&!e.announcementMessage?this._live="assertive":e.politeness==="off"?this._live="off":this._live="polite",this._platform.FIREFOX&&(this._live==="polite"&&(this._role="status"),this._live==="assertive"&&(this._role="alert"));}attachComponentPortal(e){this._assertNotAttached();let t=this._portalOutlet.attachComponentPortal(e);return this._afterPortalAttached(),t}attachTemplatePortal(e){this._assertNotAttached();let t=this._portalOutlet.attachTemplatePortal(e);return this._afterPortalAttached(),t}attachDomPortal=e=>{this._assertNotAttached();let t=this._portalOutlet.attachDomPortal(e);return this._afterPortalAttached(),t};onAnimationEnd(e){e===oe?this._completeExit():e===re&&(clearTimeout(this._enterFallback),this._ngZone.run(()=>{this._onEnter.next(),this._onEnter.complete();}));}enter(){this._destroyed||(this._animationState="visible",this._changeDetectorRef.markForCheck(),this._changeDetectorRef.detectChanges(),this._screenReaderAnnounce(),this._animationsDisabled?$t(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(re)));},{injector:this._injector}):(clearTimeout(this._enterFallback),this._enterFallback=setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-snack-bar-fallback-visible"),this.onAnimationEnd(re);},200)));}exit(){return this._destroyed?Ee(void 0):(this._ngZone.run(()=>{this._animationState="hidden",this._changeDetectorRef.markForCheck(),this._elementRef.nativeElement.setAttribute("mat-exit",""),clearTimeout(this._announceTimeoutId),this._animationsDisabled?$t(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(oe)));},{injector:this._injector}):(clearTimeout(this._exitFallback),this._exitFallback=setTimeout(()=>this.onAnimationEnd(oe),200));}),this._onExit)}ngOnDestroy(){this._destroyed=true,this._clearFromModals(),this._completeExit();}_completeExit(){clearTimeout(this._exitFallback),queueMicrotask(()=>{this._onExit.next(),this._onExit.complete();});}_afterPortalAttached(){let e=this._elementRef.nativeElement,t=this.snackBarConfig.panelClass;t&&(Array.isArray(t)?t.forEach(o=>e.classList.add(o)):e.classList.add(t)),this._exposeToModals();let a=this._label.nativeElement,i="mdc-snackbar__label";a.classList.toggle(i,!a.querySelector(`.${i}`));}_exposeToModals(){let e=this._liveElementId,t=this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');for(let a=0;a<t.length;a++){let i=t[a],o=i.getAttribute("aria-owns");this._trackedModals.add(i),o?o.indexOf(e)===-1&&i.setAttribute("aria-owns",o+" "+e):i.setAttribute("aria-owns",e);}}_clearFromModals(){this._trackedModals.forEach(e=>{let t=e.getAttribute("aria-owns");if(t){let a=t.replace(this._liveElementId,"").trim();a.length>0?e.setAttribute("aria-owns",a):e.removeAttribute("aria-owns");}}),this._trackedModals.clear();}_assertNotAttached(){this._portalOutlet.hasAttached();}_screenReaderAnnounce(){this._announceTimeoutId||this._ngZone.runOutsideAngular(()=>{this._announceTimeoutId=setTimeout(()=>{if(this._destroyed)return;let e=this._elementRef.nativeElement,t=e.querySelector("[aria-hidden]"),a=e.querySelector("[aria-live]");if(t&&a){let i=null;this._platform.isBrowser&&document.activeElement instanceof HTMLElement&&t.contains(document.activeElement)&&(i=document.activeElement),t.removeAttribute("aria-hidden"),a.appendChild(t),i?.focus(),this._onAnnounce.next(),this._onAnnounce.complete();}},this._announceDelay);});}static \u0275fac=function(t){return new(t||r)};static \u0275cmp=fe({type:r,selectors:[["mat-snack-bar-container"]],viewQuery:function(t,a){if(t&1&&xi(Xi,7)(ft,7),t&2){let i;sc(i=ac())&&(a._portalOutlet=i.first),sc(i=ac())&&(a._label=i.first);}},hostAttrs:[1,"mdc-snackbar","mat-mdc-snack-bar-container"],hostVars:6,hostBindings:function(t,a){t&1&&ic("animationend",function(o){return a.onAnimationEnd(o.animationName)})("animationcancel",function(o){return a.onAnimationEnd(o.animationName)}),t&2&&We("mat-snack-bar-container-enter",a._animationState==="visible")("mat-snack-bar-container-exit",a._animationState==="hidden")("mat-snack-bar-container-animations-enabled",!a._animationsDisabled);},features:[Ce],decls:6,vars:3,consts:[["label",""],[1,"mdc-snackbar__surface","mat-mdc-snackbar-surface"],[1,"mat-mdc-snack-bar-label"],["aria-hidden","true"],["cdkPortalOutlet",""]],template:function(t,a){t&1&&(Me(0,"div",1)(1,"div",2,0)(3,"div",3),ao(4,gt,0,0,"ng-template",4),ze(),vv(5,"div"),ze()()),t&2&&(bt$1(5),Dt$1("aria-live",a._live)("role",a._role)("id",a._liveElementId));},dependencies:[Xi],styles:[`@keyframes _mat-snack-bar-enter {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes _mat-snack-bar-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.mat-mdc-snack-bar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  margin: 8px;
}
.mat-mdc-snack-bar-handset .mat-mdc-snack-bar-container {
  width: 100vw;
}

.mat-snack-bar-container-animations-enabled {
  opacity: 0;
}
.mat-snack-bar-container-animations-enabled.mat-snack-bar-fallback-visible {
  opacity: 1;
}
.mat-snack-bar-container-animations-enabled.mat-snack-bar-container-enter {
  animation: _mat-snack-bar-enter 150ms cubic-bezier(0, 0, 0.2, 1) forwards;
}
.mat-snack-bar-container-animations-enabled.mat-snack-bar-container-exit {
  animation: _mat-snack-bar-exit 75ms cubic-bezier(0.4, 0, 1, 1) forwards;
}

.mat-mdc-snackbar-surface {
  box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  padding-left: 0;
  padding-right: 8px;
}
[dir=rtl] .mat-mdc-snackbar-surface {
  padding-right: 0;
  padding-left: 8px;
}
.mat-mdc-snack-bar-container .mat-mdc-snackbar-surface {
  min-width: 344px;
  max-width: 672px;
}
.mat-mdc-snack-bar-handset .mat-mdc-snackbar-surface {
  width: 100%;
  min-width: 0;
}
@media (forced-colors: active) {
  .mat-mdc-snackbar-surface {
    outline: solid 1px;
  }
}
.mat-mdc-snack-bar-container .mat-mdc-snackbar-surface {
  color: var(--mat-snack-bar-supporting-text-color, var(--mat-sys-inverse-on-surface));
  border-radius: var(--mat-snack-bar-container-shape, var(--mat-sys-corner-extra-small));
  background-color: var(--mat-snack-bar-container-color, var(--mat-sys-inverse-surface));
}

.mdc-snackbar__label {
  width: 100%;
  flex-grow: 1;
  box-sizing: border-box;
  margin: 0;
  padding: 14px 8px 14px 16px;
}
[dir=rtl] .mdc-snackbar__label {
  padding-left: 8px;
  padding-right: 16px;
}
.mat-mdc-snack-bar-container .mdc-snackbar__label {
  font-family: var(--mat-snack-bar-supporting-text-font, var(--mat-sys-body-medium-font));
  font-size: var(--mat-snack-bar-supporting-text-size, var(--mat-sys-body-medium-size));
  font-weight: var(--mat-snack-bar-supporting-text-weight, var(--mat-sys-body-medium-weight));
  line-height: var(--mat-snack-bar-supporting-text-line-height, var(--mat-sys-body-medium-line-height));
}

.mat-mdc-snack-bar-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  box-sizing: border-box;
}

.mat-mdc-snack-bar-handset,
.mat-mdc-snack-bar-container,
.mat-mdc-snack-bar-label {
  flex: 1 1 auto;
}

.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled).mat-unthemed {
  color: var(--mat-snack-bar-button-color, var(--mat-sys-inverse-primary));
}
.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled) {
  --mat-button-text-state-layer-color: currentColor;
  --mat-button-text-ripple-color: currentColor;
}
.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled) .mat-ripple-element {
  opacity: 0.1;
}
`],encapsulation:2,changeDetection:1})}return r})(),kt=new g("mat-snack-bar-default-options",{providedIn:"root",factory:()=>new A}),It=(()=>{class r{_live=f(vA);_injector=f(k);_breakpointObserver=f(sp);_parentSnackBar=f(r,{optional:true,skipSelf:true});_defaultConfig=f(kt);_animationsDisabled=Jt();_snackBarRefAtThisLevel=null;simpleSnackBarComponent=it;snackBarContainerComponent=St;handsetCssClass="mat-mdc-snack-bar-handset";get _openedSnackBarRef(){let e=this._parentSnackBar;return e?e._openedSnackBarRef:this._snackBarRefAtThisLevel}set _openedSnackBarRef(e){this._parentSnackBar?this._parentSnackBar._openedSnackBarRef=e:this._snackBarRefAtThisLevel=e;}openFromComponent(e,t){return this._attach(e,t)}openFromTemplate(e,t){return this._attach(e,t)}open(e,t="",a){let i=E$1(E$1({},this._defaultConfig),a);return i.data={message:e,action:t},i.announcementMessage===e&&(i.announcementMessage=void 0),this.openFromComponent(this.simpleSnackBarComponent,i)}dismiss(){this._openedSnackBarRef&&this._openedSnackBarRef.dismiss();}ngOnDestroy(){this._snackBarRefAtThisLevel&&this._snackBarRefAtThisLevel.dismiss();}_attachSnackBarContainer(e,t){let a=t&&t.viewContainerRef&&t.viewContainerRef.injector,i=k.create({parent:a||this._injector,providers:[{provide:A,useValue:t}]}),o=new Eo(this.snackBarContainerComponent,t.viewContainerRef,i),s=e.attach(o);return s.instance.snackBarConfig=t,s.instance}_attach(e,t){let a=E$1(E$1(E$1({},new A),this._defaultConfig),t),i=this._createOverlay(a),o=this._attachSnackBarContainer(i,a),s=new E(o,i);if(e instanceof $e){let c=new Er(e,null,{$implicit:a.data,snackBarRef:s});s.instance=o.attachTemplatePortal(c);}else {let c=this._createInjector(a,s),l=new Eo(e,void 0,c),m=o.attachComponentPortal(l);s.instance=m.instance;}return this._breakpointObserver.observe(f3.HandsetPortrait).pipe(dn(i.detachments())).subscribe(c=>{i.overlayElement.classList.toggle(this.handsetCssClass,c.matches);}),a.announcementMessage&&o._onAnnounce.subscribe(()=>{this._live.announce(a.announcementMessage,a.politeness);}),this._animateSnackBar(s,a),this._openedSnackBarRef=s,this._openedSnackBarRef}_animateSnackBar(e,t){e.afterDismissed().subscribe(()=>{this._openedSnackBarRef==e&&(this._openedSnackBarRef=null),t.announcementMessage&&this._live.clear();}),t.duration&&t.duration>0&&e.afterOpened().subscribe(()=>e._dismissAfter(t.duration)),this._openedSnackBarRef?(this._openedSnackBarRef.afterDismissed().subscribe(()=>{e.containerInstance.enter();}),this._openedSnackBarRef.dismiss()):e.containerInstance.enter();}_createOverlay(e){let t=new Cr;t.direction=e.direction;let a=Io(this._injector),i=e.direction==="rtl",o=e.horizontalPosition==="left"||e.horizontalPosition==="start"&&!i||e.horizontalPosition==="end"&&i,s=!o&&e.horizontalPosition!=="center";return o?a.left("0"):s?a.right("0"):a.centerHorizontally(),e.verticalPosition==="top"?a.top("0"):a.bottom("0"),t.positionStrategy=a,t.disableAnimations=this._animationsDisabled,Ji(this._injector,t)}_createInjector(e,t){let a=e&&e.viewContainerRef&&e.viewContainerRef.injector;return k.create({parent:a||this._injector,providers:[{provide:E,useValue:t},{provide:at,useValue:e.data}]})}static \u0275fac=function(t){return new(t||r)};static \u0275prov=w({token:r,factory:r.\u0275fac})}return r})();var Zt=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275mod=Q({type:r});static \u0275inj=K({providers:[It],imports:[es,Dr,i_,it,st$1]})}return r})();var rt=`[
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "sample-surface",
      "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json",
      "sendDataModel": true
    }
  },
  {
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "sample-surface",
      "components": [
        {
          "id": "root",
          "component": "Column",
          "children": ["title", "location_input", "pickup_input", "dropoff_input", "book_button"],
          "justify": "start",
          "align": "stretch"
        },
        {
          "id": "title",
          "component": "Text",
          "text": "Book a Car",
          "variant": "h1"
        },
        {
          "id": "location_input",
          "component": "TextField",
          "label": "Pick-up Location",
          "value": {
            "path": "/booking/location"
          },
          "variant": "shortText"
        },
        {
          "id": "pickup_input",
          "component": "DateTimeInput",
          "label": "Pick-up Date",
          "value": {
            "path": "/booking/pickupDate"
          },
          "enableDate": true,
          "enableTime": false
        },
        {
          "id": "dropoff_input",
          "component": "DateTimeInput",
          "label": "Drop-off Date",
          "value": {
            "path": "/booking/dropoffDate"
          },
          "enableDate": true,
          "enableTime": false
        },
        {
          "id": "book_button",
          "component": "Button",
          "child": "book_button_text",
          "variant": "primary",
          "action": {
            "event": {
              "name": "searchCars",
              "context": {
                "location": {
                  "path": "/booking/location"
                },
                "pickupDate": {
                  "path": "/booking/pickupDate"
                },
                "dropoffDate": {
                  "path": "/booking/dropoffDate"
                }
              }
            }
          }
        },
        {
          "id": "book_button_text",
          "component": "Text",
          "text": "Search Cars",
          "variant": "body"
        }
      ]
    }
  },
  {
    "version": "v0.9",
    "updateDataModel": {
      "surfaceId": "sample-surface",
      "path": "/booking",
      "value": {
        "location": "",
        "pickupDate": "",
        "dropoffDate": ""
      }
    }
  }
]`.trim()+`
`;var F="updateComponents",se="components",At="registerMockRules",xt="mockRulesConfig",Tt="rules",Rt="id",Dt="children",ot="mock_rules_container",U=class r{destroyRef=f(ae);chatState=f(o);catalogManagement=f(Y_);startupResolution=f(So,{optional:true});_activeDraft=j("");activeDraft=this._activeDraft.asReadonly();_draftInput=j("");constructor(){let n=this.startupResolution?.selectedRendererId$?Uq(this.startupResolution.selectedRendererId$):Ee(null),e=Uq(this.catalogManagement.activeCatalog),t=this.startupResolution?.sharedA2uiPayload?Uq(this.startupResolution.sharedA2uiPayload):Ee(null);Al(n,e).pipe(L_(this.destroyRef)).subscribe(()=>{let a=this.catalogManagement.activeCatalog(),i=a&&(a.catalogId||a.$id)||"",o=this._activeDraft(),s=this.getCatalogIdFromDraft(o);if(o===""||s!==i){let c=this.getInitialDraft(i);this._activeDraft.set(c),this._draftInput.set(c);}}),t.pipe(ue(a=>!!a),L_(this.destroyRef)).subscribe(a=>{this.updateDraft(a);}),Uq(this._draftInput).pipe(Ho(1),qn(300),Ws(),L_(this.destroyRef)).subscribe(a=>{this.syncLayoutToHistory(a);});}updateDraft(n){this._activeDraft.set(n),this._draftInput.set(n);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(n){this._activeDraft.set(n);}flushDraft(){let n=this.catalogManagement.activeCatalog(),e=n&&(n.catalogId||n.$id)||"";this._activeDraft.set(this.getInitialDraft(e));}getInitialDraft(n){let e=this.startupResolution?.sharedA2uiPayload();if(e)return e;let t=this.startupResolution?.activeRenderer();return t?.samplePayload?t.samplePayload:n==="https://a2ui.org/specification/v0_9/basic_catalog.json"?rt:n?p([{version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:n,sendDataModel:true}}]):""}getCatalogIdFromDraft(n){let e=n.trim();if(!e)return null;try{let t=JSON.parse(e);if(Array.isArray(t))for(let a of t){let i=a;if(i?.createSurface?.catalogId)return i.createSurface.catalogId}else if(t&&typeof t=="object"){let a=t;if(a?.createSurface?.catalogId)return a.createSurface.catalogId}}catch{}return null}syncLayoutToHistory(n){let e=this.sanitizeLayout(n);if(!e)return;let t=this.chatState.chatHistory();if(t.length===0){this.chatState.setChatHistory([{role:"user",content:e}]);return}let a=t[t.length-1];if(a.role==="user"&&a.content.trim().startsWith("[")){let o=[...t];o[o.length-1]={role:"user",content:e},this.chatState.setChatHistory(o);}else this.chatState.updateChatHistory(o=>[...o,{role:"user",content:e}]);}sanitizeLayout(n){let e=n.trim();if(!e)return "";let t=l(e);if(t){let a=t.map(i=>i&&typeof i=="object"&&!Array.isArray(i)?this.sanitizeBlock(i):i).filter(i=>i!==null);return p(a)}return console.warn("[StateSync] Discarding malformed layout JSON during sanitization: not a valid JSON array"),""}sanitizeBlock(n){if(n[At]||n[xt])return null;if(n[F]&&typeof n[F]=="object"&&n[F]!==null){let e=n[F];if(Array.isArray(e[se])){let t=e[se].filter(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?a[Rt]!==ot:true);e[se]=t.map(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?this.sanitizeComponentObject(a):a);}}return n}sanitizeComponentObject(n){let e={};for(let[t,a]of Object.entries(n))t===Tt||/^mock/i.test(t)||(t===Dt&&Array.isArray(a)?e[t]=a.filter(i=>i!==ot):a!==null&&typeof a=="object"&&!Array.isArray(a)?e[t]=this.sanitizeComponentObject(a):Array.isArray(a)?e[t]=a.map(i=>i!==null&&typeof i=="object"&&!Array.isArray(i)?this.sanitizeComponentObject(i):i):e[t]=a);return e}static \u0275fac=function(e){return new(e||r)};static \u0275prov=I({token:r,factory:r.\u0275fac,providedIn:"root"})};var st=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi,ct=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,lt=/\s*●●●\s*$/g,H=class r{PULSE_INDICATOR="\u25CF\u25CF\u25CF";appendPulse(n){return `${n??""} ${this.PULSE_INDICATOR}`}stripPulse(n){return n?(lt.lastIndex=0,n.replace(lt,"").trim()):""}stripThinkingTags(n){return n?(ct.lastIndex=0,n.replace(ct,"").trim()):""}extractCodeFences(n){if(!n)return {extracted:"",hasFences:false};st.lastIndex=0;let e=Array.from(n.matchAll(st));return e.length>0?{extracted:e.map(t=>t[1].trim()).join(`
`),hasFences:true}:{extracted:n.trim(),hasFences:false}}cleanPayload(n){if(!n)return "";let e=this.stripPulse(n);if(e=this.stripThinkingTags(e),e=this.extractCodeFences(e).extracted,!e.startsWith("{")&&!e.startsWith("[")){let a=Array.from(e.matchAll(/[\{\[]/g));for(let i of a)if(i.index!==void 0&&i.index>=0){let o=e.substring(i.index).trim();if(o.startsWith("{")&&o.includes('"version"')||o.startsWith("[")&&/^\[\s*[\{\"]/.test(o)&&(o.includes('"version"')||o.includes('"createSurface"')||o.includes('"updateComponents"'))||l(o)!==null){e=o;break}}}return e.trim()}isLayoutSnapshot(n){if(!n)return  false;let e=this.cleanPayload(n);return e.startsWith('{"version"')||e.startsWith("{")&&e.includes('"version"')||e.startsWith("[")&&(e.includes('"version"')||e.includes('"createSurface"')||e.includes('"updateComponents"'))||l(e)!==null}static \u0275fac=function(e){return new(e||r)};static \u0275prov=I({token:r,factory:r.\u0275fac,providedIn:"root"})};function dt(r){let n=false,e=l(r);if(e)return {blocks:e,wasHealed:false};try{let i=JSON.parse(r);if(Array.isArray(i))return {blocks:i,wasHealed:n};if(i&&typeof i=="object")return {blocks:[i],wasHealed:n}}catch{}let t=r.split(`
`).map(i=>i.trim()).filter(i=>i.length>0),a=[];for(let i of t)if(!(i.startsWith("```")||!i.startsWith("{")&&!i.startsWith("[")))try{a.push(JSON.parse(i));}catch{n=true;let s=wt(i);if(s!==null)a.push(s);else if(i.includes('"version"')||i.includes('"createSurface"'))throw new Error(`Syntax recovery failed for corrupted JSON Line:
"${i}"`)}if(a.length===0)throw new Error("No valid A2UI JSON layout command block could be parsed or recovered.");return {blocks:a,wasHealed:n}}function wt(r){let n=r.trim();n=n.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(n)}catch{for(let t=1;t<=5;t++)try{return JSON.parse(n+"}".repeat(t))}catch{}for(let t=1;t<=3;t++)for(let a=1;a<=3;a++)try{return JSON.parse(n+"]".repeat(t)+"}".repeat(a))}catch{}}return null}function Et(r){if(!r||typeof r!="object")return  false;let n=r;if(!n.updateComponents||typeof n.updateComponents!="object")return  false;let e=n.updateComponents;return Array.isArray(e.components)}function mt(r,n){let e=false,t={};if(n)for(let i of Object.keys(n)){let o=i.toLowerCase().replace(/[^a-z]/g,"");t[o]=i;}let a={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let i of r){if(!Et(i))continue;let o=i.updateComponents,s=[];for(let c of o.components){if(!c||typeof c!="object"||Array.isArray(c)){s.push(c);continue}let l=c,m=l.component;if(l.name&&!l.component&&(e=true,m=l.name,l.component=m,delete l.name),typeof m!="string")throw new Error("Component declaration is missing component type name string.");let u=m;if(n&&!n[m]){let p=m.toLowerCase().replace(/[^a-z]/g,""),g=t[p];if(!g){let f=a[p];f&&(g=t[f]);}if(g&&n[g])e=true,u=g;else {let f=p?Object.keys(n).find(I=>I.toLowerCase().includes(p)||p.includes(I.toLowerCase())):void 0;if(f)e=true,u=f;else throw new Error(`Validation failure: Component type "${m}" is not registered in the active custom catalog.`)}}let h=Mt(l);h.component=u,s.push(h);}o.components=s;}return e}function ce(r){if(r===null||typeof r!="object")return r;if(Array.isArray(r))return r.map(t=>ce(t));let n=r,e={};for(let[t,a]of Object.entries(n))e[t]=ce(a);return e}function Mt(r){return ce(r)}var z=class r{catalogManagement=f(Y_);systemPrompt=Ai(()=>{let n=this.catalogManagement.activeCatalog();return n?this.generateSystemPrompt(p(n)):`
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests\u2014whether provided as text instructions, UI wireframes, screenshots,
  or mockup images\u2014into valid A2UI v0.9 interactive user interfaces.
      `});generateSystemPrompt(n){return `
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests\u2014whether provided as text instructions, UI wireframes, screenshots,
  or mockup images\u2014into valid A2UI v0.9 interactive user interfaces.

  ## Catalog Allowlist & Component Rules

  You MUST strictly enforce the following rules regarding component selection
  and schema compliance:
  1. **Strict Component Allowlist**: You MUST use ONLY the component types
     defined as keys in the "components" map of the active catalog schema
     provided below.
  2. **No Hallucinated Component Names**: Never invent, guess, or mix
     component names from other libraries or catalogs. For example, if only
     "Column", "Row", "Text", and "Button" are present in the active catalog
     schema below, emitting "MaterialColumn", "MaterialText", or "Div" is
     strictly INVALID.
  3. **No Hallucinated Properties**: Include ONLY properties explicitly
     defined in the JSON Schema for that specific component type in the
     active catalog. Do NOT emit unauthorized keys (e.g., "rules", "mock*",
     or unsupported CSS/styling parameters).

  ### Active Catalog Schema (Mandatory Allowlist)
  \`\`\`json
  ${n}
  \`\`\`

  ### Common Schema Types
  Common structural types referenced by $ref in the catalog schema (e.g.,
  DataBinding, Action, Event, DynamicString, etc.) are defined here:
  \`\`\`json
  ${p(b)}
  \`\`\`

  ## Output Format: Strict A2UI JSON Lines (JSONL)

  Your output MUST be valid **A2UI JSON Lines (JSONL)**:
  1. **One JSON Object Per Line**: Each A2UI message MUST be formatted as a
     single, valid JSON object on its own line, terminated by a newline
     character (\\n). Do NOT pretty-print or split a single JSON object across
     multiple lines.
  2. **Required Version & Command**: Every message object MUST include
     "version": "v0.9" at the top level and specify exactly one A2UI
     command: "createSurface", "updateComponents", "updateDataModel", or
     "deleteSurface".
  3. **No Markdown or Preamble**: Output ONLY raw JSON Lines. Do NOT wrap
     your response in markdown code fences (such as \`\`\`jsonl or \`\`\`). Do
     NOT include any conversational text, greetings, explanations,
     scratchpad analysis, or summary before or after the JSON Lines.
  4. **Direct Parseability**: Every line in your response MUST be
     independently parseable by JSON.parse().

  ## Multimodal & Image-to-UI Guidelines

  When an image, wireframe, mockup, or UI screenshot is provided by the
  user, adhere strictly to these visual translation principles:

  ### 1. Visual Layout, Scope & Sizing Fidelity
  * **Root Container Bounding**: The root component ("id": "root") MUST match
    the visual boundary of the primary UI card, form, or dialog shown. Do
    NOT extract ambient background titles, file names, or browser canvas
    headers outside the visual card boundary unless explicitly requested.
  * **Flex Orientation Mapping**:
    - Elements arranged top-to-bottom MUST map to vertical layout containers
      defined in the active catalog (e.g., Column).
    - Elements arranged left-to-right MUST map to horizontal layout
      containers defined in the active catalog (e.g., Row).
  * **Full-Width Stretch Mandate**: When an element (such as a primary CTA
    button, input field, or card) visually spans the full width of its
    parent container in the screenshot, configure its layout/alignment
    properties to stretch full-width (e.g., setting "align": "stretch" on
    the parent container or applying full-width properties supported by
    the active catalog) rather than rendering as a compact inline element.
  * **Container Spacing & Clipping Prevention**: Ensure root layout
    containers (Column) and nested sections maintain proper vertical
    padding, spacing, and scrollability so that bottom elements (such as
    footer actions or trailing list items) are never cut off or clipped.
  * **No Unseen Separators Rule**: Do NOT insert "Divider" lines or border
    components unless a distinct horizontal or vertical line separator is
    literally visible in the screenshot.
  * **Visual Reading Order**: List child IDs in children arrays in strict
    visual reading order (top-to-bottom, left-to-right).

  ### 2. Catalog-Aware Component Mapping
  Map visual elements to the most specific matching component type from the
  "components" allowlist of the active catalog schema provided above:
  * **Headings & Titles** -> Text component with heading typography styles
    (usageHint: "h1" | "h2" | "h3" or equivalent variant property in the
    active catalog schema).
  * **Body Text & Captions** -> Text component with body or caption
    typography styles (usageHint: "body" | "caption").
  * **Interactive Buttons** -> Button/IconButton component in the active
    catalog schema. Reflect visual prominence (e.g., primary filled vs.
    secondary borderless/outlined) and preserve full-width intent.
  * **Form Controls & Inputs** -> Text entry, date picker, selection/picker,
    or toggle components defined in the active catalog schema.
  * **Content Panels & Containers** -> Card, panel, or layout container
    components defined in the active catalog schema wrapping child elements.
  * **Repeated Lists & Collections** -> Layout container components with
    dynamic item template declarations
    (children: { "componentId": "...", "path": "/..." }).
  * **CRITICAL**: Every generated "component" value MUST be an exact key
    from the "components" map in the active catalog schema provided above.
    Never invent or guess component names not present in the active catalog.

  ### 3. Icon Fidelity, Custom SVG & Styling Intent
  * **Composite Icon & Feature Matching**: Closely examine visual icon
    shapes for composite features (e.g., a document with an edit badge, a
    search icon with a filter indicator, or a custom symbol). First check if
    the active catalog's Icon component includes an exact visual match in
    its enum.
  * **Custom SVG Fallback (No Close Icon Match)**: If an icon in the
    screenshot has distinct visual features that do NOT have a close match
    in the active catalog's predefined icon list:
    - **Do NOT** substitute a visually mismatched, generic, or oversimplified
      placeholder icon.
    - **Fallback to SVG**: Generate an inline vector graphic instead using
      one of the mechanisms supported by the active catalog schema:
      1. If the Icon component in the active catalog accepts custom path
         data, specify the svgPath property with a valid SVG path d string.
      2. If an Image component is available in the active catalog, supply an
         inline SVG Data URL in its url/image source property
         ("data:image/svg+xml;utf8,<svg ...>...</svg>").
  * **Visual Hierarchy**: Preserve typography scale, text weight, button
    prominence, and color intent using supported catalog properties.

  ### 4. Visual Affordance Recognition
  Recognize common UI visual affordance symbols and map them strictly using
  components defined in the active catalog schema provided above:
  * **Downward Chevrons / Disclosure Carets (Collapsible Rows)**:
    - **Visual Indicator**: Downward-facing arrows (\u2228, expand_more) at row
      edges denote expandable/collapsible sections.
    - **Catalog Mapping**: If the active catalog schema includes an expansion
      or accordion component, use it. Otherwise, compose the row using
      layout primitives in the catalog: e.g., a horizontal layout container
      (Row) holding leading text/icons and a trailing downward icon.
  * **Search Cues (Search Inputs)**:
    - **Visual Indicator**: Magnifying glass symbols (\u{1F50D}) inside or adjacent
      to text entry boxes.
    - **Catalog Mapping**: If a search component exists in the active catalog
      schema, use it; otherwise, use a text input component paired with a
      search icon.
  * **Toggle Track & Thumb (Switches & Toggles)**:
    - **Visual Indicator**: Pill-shaped track with a circular thumb (\u26AA\u2501\u2501).
    - **Catalog Mapping**: Use a toggle, switch, or selection control
      component defined in the active catalog schema.
  * **Selection Controls (Option Pickers)**:
    - **Visual Indicator**: Radio circles (\u25EF / \u{1F518}), checkboxes (\u2610 / \u2611), or
      dropdown carets.
    - **Catalog Mapping**: Look up selection, picker, or option components
      in the active catalog schema; if none exist, compose using interactive
      button components.
  * **Pill Badges & Chips (Status & Tags)**:
    - **Visual Indicator**: Small rounded rectangle or oval containing short
      text/status labels.
    - **Catalog Mapping**: Use a chip, badge, or tag component if defined in
      the active catalog schema; otherwise, compose using a text component
      inside a container or card.

  ### 5. Grounding, Data Binding & Sequence
  * **Complete Data Model Extraction**: ALL text strings, label names, image
    URLs, options, and default values visible in the image MUST be extracted
    into the updateDataModel payload.
  * **JSON Pointer References**: Components in updateComponents MUST bind to
    values in updateDataModel using valid JSON Pointers
    (e.g., {"path": "/header/title"}). Do NOT hardcode visible text strings
    inline when data binding is supported.
  * **Strict Grounding**: Include ONLY visual elements present in the
    screenshot. Do NOT hallucinate extra buttons, fields, or unrepresented
    data streams.

  ### 6. Image-to-UI Processing Sequence
  When translating an image to A2UI, follow this internal mental sequence
  (do NOT output any analysis or scratchpad text; output ONLY the final
  JSONL messages):
  1. **Analyze (Internal)**: Identify primary card boundaries, flex layout
     directions, full-width element stretching, absence of unseen dividers,
     container spacing, and composite icon details.
  2. **Extract Data**: Extract all visible text strings, values, and list
     items into updateDataModel.
  3. **Build Component Tree**: Map visual elements strictly to active
     catalog component types with exact icon names/SVGs, full-width
     properties, and JSON Pointer paths.
  4. **Emit JSONL Messages**: Output the single-line JSONL messages in
     strict sequence (createSurface -> updateComponents -> updateDataModel).

  ## Validation & Lifecycle Ordering

  A complete A2UI payload consists of one or more message objects sent as
  continuous JSON Lines. Every message object MUST include a top-level
  "version": "v0.9" field.

  The four primary messages you must use to manage a UI surface are:
  1. **createSurface**: Sent **FIRST** to signal the client to create a new
     surface. It defines the catalogId and optional theme parameters.
  2. **updateComponents**: Used to define or update the UI component tree.
     You must provide a flat list of components. One component MUST have an
     id of "root".
  3. **updateDataModel**: Used to define or update data values that the
     components bind to.
  4. **deleteSurface**: Signals the client to destroy the surface.

  Typical sequence: createSurface -> updateComponents -> updateDataModel
  (or combined/interleaved after creation).
  When updating an existing UI in a multi-turn conversation, keep the
  surfaceId consistent across turns.

  ## Examples

  **IMPORTANT**: The component names used in the examples below (Column, Text,
  TextField, ChoicePicker, Button, etc.) are for structural illustration.
  You MUST replace them with exact component names from the active catalog
  schema provided above. In addition, code fences (\`\`\`jsonl) are shown
  below for documentation readability only; do NOT include code fences in
  your actual JSONL output.

    * **Simple Example**: A basic column with text:
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "main", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "main", "components": [{"id": "root", "component": "MaterialColumn", "children": ["header", "content"]}, {"id": "header", "component": "MaterialText", "text": "Welcome"}, {"id": "content", "component": "MaterialText", "text": {"path": "/message"}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "main", "path": "/message", "value": "Hello, world!"}}
      \`\`\`

    * **Complex Form Example**:
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "vacation_booking", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "vacation_booking", "components": [{"id": "root", "component": "MaterialColumn", "children": ["search_button"]}, {"id": "search_button", "component": "MaterialButton", "label": {"path": "/search_label"}, "action": {"event": {"name": "searchVacation"}}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "vacation_booking", "value": {"search_label": "Search Flights & Hotels"}}}
      \`\`\`

    * **Dynamic List Example**:
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "dynamic_list_demo", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "dynamic_list_demo", "components": [{"id": "root", "component": "MaterialColumn", "children": ["list_container"]}, {"id": "list_container", "component": "MaterialColumn", "children": {"componentId": "item_template", "path": "/items"}}, {"id": "item_template", "component": "MaterialText", "text": {"path": "text"}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "dynamic_list_demo", "value": {"items": [{"text": "Item One"}, {"text": "Item Two"}]}}}
      \`\`\`

  ## Data Binding
  Every component property value MUST come from the data model (with minor
  exceptions for static primitives).
  When referencing data in the data model, you MUST use valid JSON Pointer
  syntax starting with /.

  ## Actions and Context

  When defining actions (e.g., on buttons), the \`context\` payload is a standard
  JSON object, rather than an array of key-value pairs.

  Example action definition:
  \`\`\`json
  "action": {
    "event": {
      "name": "selectItem",
      "context": {
        "itemId": "12345",
        "itemName": {"path": "/selected/name"}
      }
    }
  }
  \`\`\`
  `}static \u0275fac=function(e){return new(e||r)};static \u0275prov=I({token:r,factory:r.\u0275fac,providedIn:"root"})};var V=class r{isConnectivityError(n){return n.includes("failed to fetch")||n.includes("fetch")||n.includes("timeout")||n.includes("504")||n.includes("proxy")||n.includes("networkerror")||n.includes("connection")||n.includes("401")||n.includes("403")||n.includes("credential")||n.includes("quota")||n.includes("blocked")||n.includes("503")||n.includes("unavailable")||n.includes("api key")||n.includes("apikey")}parseError(n,e,t){let a="Connectivity Failure",i=e.trim().startsWith("{"),o=i?"A connectivity error occurred.":e,s=i?"Details: "+e:void 0,c="Tip: Please check your network proxy configurations or verify your settings to restore connections.",l=t,m=true,u=this.isConnectivityError(n);return n.includes("validation")||n.includes("syntax recovery")||n.includes("validation failure")?{errorTitle:"Validation Failure",errorMessage:"The generated layout contains invalid components or structure.",errorTip:"Tip: Try rephrasing your prompt to guide the model to generate valid components.",isRetryable:t,showDetails:true,errorDetails:"Details: "+e,isConnectivityFailure:u}:n.includes("503")||n.includes("unavailable")?{errorTitle:"Service Unavailable",errorMessage:"The generative service is temporarily unavailable. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:u}:n.includes("high demand")?{errorTitle:"Model High Demand",errorMessage:"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:u}:n.includes("timeout")||n.includes("504")?{errorTitle:"REST Gateway Timeout",errorMessage:"Remote generation service did not respond.",errorDetails:"Details: "+e,errorTip:c,isRetryable:l,showDetails:true,isConnectivityFailure:u}:n.includes("api key")||n.includes("apikey")?{errorTitle:"Invalid API Key",errorMessage:"The provided Gemini API key is invalid or missing.",errorDetails:"Details: "+e,errorTip:"Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.",isRetryable:l,showDetails:true,isConnectivityFailure:u}:n.includes("auth")||n.includes("401")||n.includes("403")||n.includes("credential")?{errorTitle:"Authentication Refused",errorMessage:"Authentication failed. Please verify your credentials in Settings.",errorDetails:"Details: "+e,errorTip:c,isRetryable:l,showDetails:true,isConnectivityFailure:u}:n.includes("quota")||n.includes("blocked")||n.includes("429")?{errorTitle:"GenAI Service Blocked",errorMessage:"Resource quota depleted or content safety limits triggered.",errorDetails:"Details: "+e,errorTip:c,isRetryable:l,showDetails:true,isConnectivityFailure:u}:{errorTitle:a,errorMessage:o,errorTip:c,isRetryable:l,showDetails:m,errorDetails:s,isConnectivityFailure:u}}static \u0275fac=function(e){return new(e||r)};static \u0275prov=I({token:r,factory:r.\u0275fac,providedIn:"root"})};function ut(r){let n=/^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i,e=r.replace(n,"");if(e.startsWith("{"))try{let t=JSON.parse(e);if(t.error&&t.error.message)return t.error.message}catch{}return e}function J(r){if(!r)return r;let n=r.replace(/AIzaSy[A-Za-z0-9_-]+/g,"redacted for your protection");return n=n.replace(/(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,a)=>a.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),n=n.replace(/(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,a)=>a.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),n}var pt=class r{catalogManagement=f(Y_);configProvider=f(ho);stateSync=f(U);chatState=f(o);llmClient=f(Fn);chatCleaner=f(H);usageTrackingService=f(K_);promptFactory=f(z);errorPresenter=f(V);destroyRef=f(ae);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;currentTurnIndex=j(0);activePromptId=null;constructor(){Uq(this.configProvider.rendererUrl).pipe(Ho(1)).subscribe(()=>{queueMicrotask(()=>this.wipeEnvironmentCache());});}wipeEnvironmentCache(){this.currentTurnIndex.set(0),this.activePromptId=null,this.chatState.setChatHistory([]),this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}getFullMessageContext(){return [{role:"system",content:this.promptFactory.systemPrompt()},...this.chatState.chatHistory().filter(n=>n.role!=="error")]}activeStreamResponse;isCancelRequested=false;cancelActiveStream(){this.isCancelRequested=true,this.activePromptId&&this.usageTrackingService.trackChatCancel({promptId:this.activePromptId,turnIndex:this.currentTurnIndex(),pipelineStatus:this.pipelineStatus()}),this.activeStreamResponse&&this.activeStreamResponse.cancel&&this.activeStreamResponse.cancel();}emitPromptTracking(n,e,t){let a=!!t?.retryOfPromptId,i=t?.promptTurnIndex??this.currentTurnIndex()+1;this.currentTurnIndex.set(i);let o=this.catalogManagement.activeCatalog(),s=o&&(o.catalogId||o.$id)||"",c=e.some(m=>m.name==="screenshot.png"||m.mimeType?.startsWith("image/")),l=e.filter(m=>m.name!=="screenshot.png"&&!m.mimeType?.startsWith("image/"));return a?this.usageTrackingService.trackChatRetry({promptId:t?.promptId,catalogId:s,turnIndex:i,attemptNumber:2,retryOfPromptId:t?.retryOfPromptId}):this.usageTrackingService.trackChatPrompt({promptId:t?.promptId,catalogId:s,turnType:i===1?"initial":"followup",turnIndex:i,attemptNumber:1,hasScreenshot:c,attachmentCount:l.length})}async submitPrompt(n,e=[],t){if(this.chatState.isProgrammaticStreamActive())return;let a=n.trim();if(!a&&e.length===0)return;let i=this.emitPromptTracking(a,e,t);this.activePromptId=i,this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(s=>[...s,{role:"user",content:a,attachments:e.length>0?e:void 0,promptId:i}]);let o=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",o),this.chatState.updateChatHistory(s=>[...s,{role:"model",content:this.chatCleaner.appendPulse("")}]);try{this.isCancelRequested=!1;let s=await this.llmClient.chatStream(o);if(this.isCancelRequested){s.cancel&&s.cancel();let u=new Error("Cancelled");throw u.name=Xa,u}this.activeStreamResponse=s;let c="",l="";for await(let u of s.contentStream)c+=u.content,u.thinking&&(l+=u.thinking),this.chatState.updateChatHistory(h=>{let p=[...h],g=p.length-1;return p[g]?.role==="model"&&(p[g]={role:"model",content:this.chatCleaner.appendPulse(c),thinking:l}),p});let m=await s.complete;this.chatState.addRawLlmLog("LLM_RESPONSE",m),this.chatState.updateChatHistory(u=>{let h=[...u],p=h.length-1;return h[p]?.role==="model"&&(h[p]={role:"model",content:m,thinking:l}),h}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(m);}catch(s){s&&typeof s=="object"&&"name"in s&&s.name===Xa?(this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.updateChatHistory(c=>{let l=[...c],m=l.length-1;return l[m]?.role==="model"&&(l[m]=Z(E$1({},l[m]),{content:"*You stopped this response.*"})),l})):this.handleConnectivityError(s,a,e,i);}finally{this.activeStreamResponse=void 0;}}async processRawLlmPayload(n){let e=[];try{let t=dt(n);e=t.blocks,t.wasHealed&&this.chatState.setPipelineStatus("healing");}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}this.chatState.setPipelineStatus("validating");try{let t={type:pe.RENDER_A2UI,payload:e};if(!Xc.validateOutgoingMessage(t))throw new Error("Outgoing message envelope validation failed: Schema verification returned false.");mt(e,this.catalogManagement.activeCatalog()?.components)&&this.chatState.setPipelineStatus("healing"),this.chatState.setPipelineStatus("ready");let o=p(e);this.chatState.updateChatHistory(s=>{let c=[...s],l=c.length-1;return c[l]?.role==="model"&&(c[l]=Z(E$1({},c[l]),{content:o})),c}),this.stateSync.commitLayoutFromLlm(o),this.chatState.setProgrammaticStreamActive(!1);}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}}handleConnectivityError(n,e,t=[],a){let i=n instanceof Error?n.message:String(n),o=i.toLowerCase(),s=ut(i);this.errorPresenter.isConnectivityError(o)?this.chatState.setPipelineStatus("idle"):this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false);let c=this.errorPresenter.parseError(o,s,!!e),l="";n instanceof Error?l="Exception: "+n.message+`
Stack: `+(n.stack||"None"):l="Unknown Exception: "+JSON.stringify(n);let m="";c.errorDetails&&(m+=c.errorDetails+`

`),m+=l;let u=J(c.errorMessage),h=c.showDetails?J(m):void 0,p=c.showDetails?J(c.errorTip):void 0;console.error("Gemini chat execution failed:",n),this.chatState.updateChatHistory(g=>{let f=[...g],I=f.length-1,le=E$1({role:"error",content:u,errorTitle:c.errorTitle,errorMessage:u,errorDetails:h,errorTip:p,promptId:a},c.isRetryable?{isRetryable:true,originalPrompt:e,attachments:t}:{});return I>=0&&f[I].role==="model"?(f[I]=le,f):(f.push(le),f)});}systemPrompt=this.promptFactory.systemPrompt;static \u0275fac=function(e){return new(e||r)};static \u0275prov=I({token:r,factory:r.\u0275fac,providedIn:"root"})};export{H,It as I,U,Zt as Z,pt as p};