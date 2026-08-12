import {f,a4 as ae,Y as Y_,S as So,j as j$1,aa as jq,b9 as Ee,aJ as Al,V as L_,ah as ue,ba as Ho,ab as qn,ac as Ws,t as I,h as ho,bb as Fn,K as K_,L as Lt,Z as Kt,bc as Xa,ak as Z,al as E$1,X as pe,bd as Xc,A as Ai,be as yA,bf as k,bg as sp,as as g,ao as Jt,bh as Eo,b6 as $e,aw as Er,bi as u3,bj as dn,bk as Cr,bl as Io,bm as Ji,bn as w,Q,u as K,bo as es,an as Dr,i as i_,x as st$1,b as fe,o as o_,d as Me,g as Yt,z as ze,k as wi,l as bt$1,m as Sf,r as Ci,bp as Do,ap as M,y as z,a6 as pc,B as te$1,R,ag as C$1,at as It$1,aS as $t,ax as Xi,ay as Ce,aB as ao,v as vv,D as Dt,e as ic,W as We,aC as xi,N as sc,O as ac,P as J,aY as AS,aP as RS,aZ as _m,a_ as Em}from'./main.js';import {o,d,l,c}from'./chunk-B0_vyTnx.js';function ut(o,n){if(o&1){let e=AS();Me(0,"div",1)(1,"button",2),ic("click",function(){_m(e);let a=RS();return Em(a.action())}),Yt(2),ze()();}if(o&2){let e=RS();bt$1(2),Sf(" ",e.data.action," ");}}var pt=["label"];function ht(o,n){}var ft=Math.pow(2,31)-1,E=class{_overlayRef;instance;containerInstance;_afterDismissed=new C$1;_afterOpened=new C$1;_onAction=new C$1;_durationTimeoutId;_dismissedByAction=false;constructor(n,e){this._overlayRef=e,this.containerInstance=n,n._onExit.subscribe(()=>this._finishDismiss());}dismiss(){this._afterDismissed.closed||this.containerInstance.exit(),clearTimeout(this._durationTimeoutId);}dismissWithAction(){this._onAction.closed||(this._dismissedByAction=true,this._onAction.next(),this._onAction.complete(),this.dismiss()),clearTimeout(this._durationTimeoutId);}closeWithAction(){this.dismissWithAction();}_dismissAfter(n){this._durationTimeoutId=setTimeout(()=>this.dismiss(),Math.min(n,ft));}_open(){this._afterOpened.closed||(this._afterOpened.next(),this._afterOpened.complete());}_finishDismiss(){this._overlayRef.dispose(),this._onAction.closed||this._onAction.complete(),this._afterDismissed.next({dismissedByAction:this._dismissedByAction}),this._afterDismissed.complete(),this._dismissedByAction=false;}afterDismissed(){return this._afterDismissed}afterOpened(){return this.containerInstance._onEnter}onAction(){return this._onAction}},at=new g("MatSnackBarData"),C=class{politeness="polite";announcementMessage="";viewContainerRef;duration=0;panelClass;direction;data=null;horizontalPosition="center";verticalPosition="bottom"},gt=(()=>{class o{static \u0275fac=function(t){return new(t||o)};static \u0275dir=J({type:o,selectors:[["","matSnackBarLabel",""]],hostAttrs:[1,"mat-mdc-snack-bar-label","mdc-snackbar__label"]})}return o})(),vt=(()=>{class o{static \u0275fac=function(t){return new(t||o)};static \u0275dir=J({type:o,selectors:[["","matSnackBarActions",""]],hostAttrs:[1,"mat-mdc-snack-bar-actions","mdc-snackbar__actions"]})}return o})(),yt=(()=>{class o{static \u0275fac=function(t){return new(t||o)};static \u0275dir=J({type:o,selectors:[["","matSnackBarAction",""]],hostAttrs:[1,"mat-mdc-snack-bar-action","mdc-snackbar__action"]})}return o})(),it=(()=>{class o{snackBarRef=f(E);data=f(at);action(){this.snackBarRef.dismissWithAction();}get hasAction(){return !!this.data.action}static \u0275fac=function(t){return new(t||o)};static \u0275cmp=fe({type:o,selectors:[["simple-snack-bar"]],hostAttrs:[1,"mat-mdc-simple-snack-bar"],exportAs:["matSnackBar"],decls:3,vars:2,consts:[["matSnackBarLabel",""],["matSnackBarActions",""],["matButton","","matSnackBarAction","",3,"click"]],template:function(t,a){t&1&&(Me(0,"div",0),Yt(1),ze(),wi(2,ut,3,1,"div",1)),t&2&&(bt$1(),Sf(" ",a.data.message,`
`),bt$1(),Ci(a.hasAction?2:-1));},dependencies:[o_,gt,vt,yt],styles:[`.mat-mdc-simple-snack-bar {
  display: flex;
}
.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-label {
  max-height: 50vh;
  overflow: auto;
}
`],encapsulation:2})}return o})(),te="_mat-snack-bar-enter",ne="_mat-snack-bar-exit",bt=(()=>{class o extends Do{_ngZone=f(M);_elementRef=f(z);_changeDetectorRef=f(pc);_platform=f(te$1);_animationsDisabled=Jt();snackBarConfig=f(C);_document=f(R);_trackedModals=new Set;_enterFallback;_exitFallback;_injector=f(k);_announceDelay=150;_announceTimeoutId;_destroyed=false;_portalOutlet;_onAnnounce=new C$1;_onExit=new C$1;_onEnter=new C$1;_animationState="void";_live;_label;_role;_liveElementId=f(It$1).getId("mat-snack-bar-container-live-");constructor(){super();let e=this.snackBarConfig;e.politeness==="assertive"&&!e.announcementMessage?this._live="assertive":e.politeness==="off"?this._live="off":this._live="polite",this._platform.FIREFOX&&(this._live==="polite"&&(this._role="status"),this._live==="assertive"&&(this._role="alert"));}attachComponentPortal(e){this._assertNotAttached();let t=this._portalOutlet.attachComponentPortal(e);return this._afterPortalAttached(),t}attachTemplatePortal(e){this._assertNotAttached();let t=this._portalOutlet.attachTemplatePortal(e);return this._afterPortalAttached(),t}attachDomPortal=e=>{this._assertNotAttached();let t=this._portalOutlet.attachDomPortal(e);return this._afterPortalAttached(),t};onAnimationEnd(e){e===ne?this._completeExit():e===te&&(clearTimeout(this._enterFallback),this._ngZone.run(()=>{this._onEnter.next(),this._onEnter.complete();}));}enter(){this._destroyed||(this._animationState="visible",this._changeDetectorRef.markForCheck(),this._changeDetectorRef.detectChanges(),this._screenReaderAnnounce(),this._animationsDisabled?$t(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(te)));},{injector:this._injector}):(clearTimeout(this._enterFallback),this._enterFallback=setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-snack-bar-fallback-visible"),this.onAnimationEnd(te);},200)));}exit(){return this._destroyed?Ee(void 0):(this._ngZone.run(()=>{this._animationState="hidden",this._changeDetectorRef.markForCheck(),this._elementRef.nativeElement.setAttribute("mat-exit",""),clearTimeout(this._announceTimeoutId),this._animationsDisabled?$t(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(ne)));},{injector:this._injector}):(clearTimeout(this._exitFallback),this._exitFallback=setTimeout(()=>this.onAnimationEnd(ne),200));}),this._onExit)}ngOnDestroy(){this._destroyed=true,this._clearFromModals(),this._completeExit();}_completeExit(){clearTimeout(this._exitFallback),queueMicrotask(()=>{this._onExit.next(),this._onExit.complete();});}_afterPortalAttached(){let e=this._elementRef.nativeElement,t=this.snackBarConfig.panelClass;t&&(Array.isArray(t)?t.forEach(r=>e.classList.add(r)):e.classList.add(t)),this._exposeToModals();let a=this._label.nativeElement,i="mdc-snackbar__label";a.classList.toggle(i,!a.querySelector(`.${i}`));}_exposeToModals(){let e=this._liveElementId,t=this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');for(let a=0;a<t.length;a++){let i=t[a],r=i.getAttribute("aria-owns");this._trackedModals.add(i),r?r.indexOf(e)===-1&&i.setAttribute("aria-owns",r+" "+e):i.setAttribute("aria-owns",e);}}_clearFromModals(){this._trackedModals.forEach(e=>{let t=e.getAttribute("aria-owns");if(t){let a=t.replace(this._liveElementId,"").trim();a.length>0?e.setAttribute("aria-owns",a):e.removeAttribute("aria-owns");}}),this._trackedModals.clear();}_assertNotAttached(){this._portalOutlet.hasAttached();}_screenReaderAnnounce(){this._announceTimeoutId||this._ngZone.runOutsideAngular(()=>{this._announceTimeoutId=setTimeout(()=>{if(this._destroyed)return;let e=this._elementRef.nativeElement,t=e.querySelector("[aria-hidden]"),a=e.querySelector("[aria-live]");if(t&&a){let i=null;this._platform.isBrowser&&document.activeElement instanceof HTMLElement&&t.contains(document.activeElement)&&(i=document.activeElement),t.removeAttribute("aria-hidden"),a.appendChild(t),i?.focus(),this._onAnnounce.next(),this._onAnnounce.complete();}},this._announceDelay);});}static \u0275fac=function(t){return new(t||o)};static \u0275cmp=fe({type:o,selectors:[["mat-snack-bar-container"]],viewQuery:function(t,a){if(t&1&&xi(Xi,7)(pt,7),t&2){let i;sc(i=ac())&&(a._portalOutlet=i.first),sc(i=ac())&&(a._label=i.first);}},hostAttrs:[1,"mdc-snackbar","mat-mdc-snack-bar-container"],hostVars:6,hostBindings:function(t,a){t&1&&ic("animationend",function(r){return a.onAnimationEnd(r.animationName)})("animationcancel",function(r){return a.onAnimationEnd(r.animationName)}),t&2&&We("mat-snack-bar-container-enter",a._animationState==="visible")("mat-snack-bar-container-exit",a._animationState==="hidden")("mat-snack-bar-container-animations-enabled",!a._animationsDisabled);},features:[Ce],decls:6,vars:3,consts:[["label",""],[1,"mdc-snackbar__surface","mat-mdc-snackbar-surface"],[1,"mat-mdc-snack-bar-label"],["aria-hidden","true"],["cdkPortalOutlet",""]],template:function(t,a){t&1&&(Me(0,"div",1)(1,"div",2,0)(3,"div",3),ao(4,ht,0,0,"ng-template",4),ze(),vv(5,"div"),ze()()),t&2&&(bt$1(5),Dt("aria-live",a._live)("role",a._role)("id",a._liveElementId));},dependencies:[Xi],styles:[`@keyframes _mat-snack-bar-enter {
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
`],encapsulation:2,changeDetection:1})}return o})(),_t=new g("mat-snack-bar-default-options",{providedIn:"root",factory:()=>new C}),St=(()=>{class o{_live=f(yA);_injector=f(k);_breakpointObserver=f(sp);_parentSnackBar=f(o,{optional:true,skipSelf:true});_defaultConfig=f(_t);_animationsDisabled=Jt();_snackBarRefAtThisLevel=null;simpleSnackBarComponent=it;snackBarContainerComponent=bt;handsetCssClass="mat-mdc-snack-bar-handset";get _openedSnackBarRef(){let e=this._parentSnackBar;return e?e._openedSnackBarRef:this._snackBarRefAtThisLevel}set _openedSnackBarRef(e){this._parentSnackBar?this._parentSnackBar._openedSnackBarRef=e:this._snackBarRefAtThisLevel=e;}openFromComponent(e,t){return this._attach(e,t)}openFromTemplate(e,t){return this._attach(e,t)}open(e,t="",a){let i=E$1(E$1({},this._defaultConfig),a);return i.data={message:e,action:t},i.announcementMessage===e&&(i.announcementMessage=void 0),this.openFromComponent(this.simpleSnackBarComponent,i)}dismiss(){this._openedSnackBarRef&&this._openedSnackBarRef.dismiss();}ngOnDestroy(){this._snackBarRefAtThisLevel&&this._snackBarRefAtThisLevel.dismiss();}_attachSnackBarContainer(e,t){let a=t&&t.viewContainerRef&&t.viewContainerRef.injector,i=k.create({parent:a||this._injector,providers:[{provide:C,useValue:t}]}),r=new Eo(this.snackBarContainerComponent,t.viewContainerRef,i),s=e.attach(r);return s.instance.snackBarConfig=t,s.instance}_attach(e,t){let a=E$1(E$1(E$1({},new C),this._defaultConfig),t),i=this._createOverlay(a),r=this._attachSnackBarContainer(i,a),s=new E(r,i);if(e instanceof $e){let c=new Er(e,null,{$implicit:a.data,snackBarRef:s});s.instance=r.attachTemplatePortal(c);}else {let c=this._createInjector(a,s),l=new Eo(e,void 0,c),d=r.attachComponentPortal(l);s.instance=d.instance;}return this._breakpointObserver.observe(u3.HandsetPortrait).pipe(dn(i.detachments())).subscribe(c=>{i.overlayElement.classList.toggle(this.handsetCssClass,c.matches);}),a.announcementMessage&&r._onAnnounce.subscribe(()=>{this._live.announce(a.announcementMessage,a.politeness);}),this._animateSnackBar(s,a),this._openedSnackBarRef=s,this._openedSnackBarRef}_animateSnackBar(e,t){e.afterDismissed().subscribe(()=>{this._openedSnackBarRef==e&&(this._openedSnackBarRef=null),t.announcementMessage&&this._live.clear();}),t.duration&&t.duration>0&&e.afterOpened().subscribe(()=>e._dismissAfter(t.duration)),this._openedSnackBarRef?(this._openedSnackBarRef.afterDismissed().subscribe(()=>{e.containerInstance.enter();}),this._openedSnackBarRef.dismiss()):e.containerInstance.enter();}_createOverlay(e){let t=new Cr;t.direction=e.direction;let a=Io(this._injector),i=e.direction==="rtl",r=e.horizontalPosition==="left"||e.horizontalPosition==="start"&&!i||e.horizontalPosition==="end"&&i,s=!r&&e.horizontalPosition!=="center";return r?a.left("0"):s?a.right("0"):a.centerHorizontally(),e.verticalPosition==="top"?a.top("0"):a.bottom("0"),t.positionStrategy=a,t.disableAnimations=this._animationsDisabled,Ji(this._injector,t)}_createInjector(e,t){let a=e&&e.viewContainerRef&&e.viewContainerRef.injector;return k.create({parent:a||this._injector,providers:[{provide:E,useValue:t},{provide:at,useValue:e.data}]})}static \u0275fac=function(t){return new(t||o)};static \u0275prov=w({token:o,factory:o.\u0275fac})}return o})();var Wt=(()=>{class o{static \u0275fac=function(t){return new(t||o)};static \u0275mod=Q({type:o});static \u0275inj=K({providers:[St],imports:[es,Dr,i_,it,st$1]})}return o})();var rt=`[
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
`;var j="updateComponents",ie="components",It="registerMockRules",Ct="mockRulesConfig",At="rules",xt="id",Tt="children",ot="mock_rules_container",B=class o$1{destroyRef=f(ae);chatState=f(o);catalogManagement=f(Y_);startupResolution=f(So,{optional:true});_activeDraft=j$1("");activeDraft=this._activeDraft.asReadonly();_draftInput=j$1("");constructor(){let n=this.startupResolution?.selectedRendererId$?jq(this.startupResolution.selectedRendererId$):Ee(null),e=jq(this.catalogManagement.activeCatalog),t=this.startupResolution?.sharedA2uiPayload?jq(this.startupResolution.sharedA2uiPayload):Ee(null);Al(n,e).pipe(L_(this.destroyRef)).subscribe(()=>{let a=this.catalogManagement.activeCatalog(),i=a&&(a.catalogId||a.$id)||"",r=this._activeDraft(),s=this.getCatalogIdFromDraft(r);if(r===""||s!==i){let c=this.getInitialDraft(i);this._activeDraft.set(c),this._draftInput.set(c);}}),t.pipe(ue(a=>!!a),L_(this.destroyRef)).subscribe(a=>{this.updateDraft(a);}),jq(this._draftInput).pipe(Ho(1),qn(300),Ws(),L_(this.destroyRef)).subscribe(a=>{this.syncLayoutToHistory(a);});}updateDraft(n){this._activeDraft.set(n),this._draftInput.set(n);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(n){this._activeDraft.set(n);}flushDraft(){let n=this.catalogManagement.activeCatalog(),e=n&&(n.catalogId||n.$id)||"";this._activeDraft.set(this.getInitialDraft(e));}getInitialDraft(n){let e=this.startupResolution?.sharedA2uiPayload();if(e)return e;let t=this.startupResolution?.activeRenderer();return t?.samplePayload?t.samplePayload:n==="https://a2ui.org/specification/v0_9/basic_catalog.json"?rt:n?d([{version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:n,sendDataModel:true}}]):""}getCatalogIdFromDraft(n){let e=n.trim();if(!e)return null;try{let t=JSON.parse(e);if(Array.isArray(t))for(let a of t){let i=a;if(i?.createSurface?.catalogId)return i.createSurface.catalogId}else if(t&&typeof t=="object"){let a=t;if(a?.createSurface?.catalogId)return a.createSurface.catalogId}}catch{}return null}syncLayoutToHistory(n){let e=this.sanitizeLayout(n);if(!e)return;let t=this.chatState.chatHistory();if(t.length===0){this.chatState.setChatHistory([{role:"user",content:e}]);return}let a=t[t.length-1];if(a.role==="user"&&a.content.trim().startsWith("[")){let r=[...t];r[r.length-1]={role:"user",content:e},this.chatState.setChatHistory(r);}else this.chatState.updateChatHistory(r=>[...r,{role:"user",content:e}]);}sanitizeLayout(n){let e=n.trim();if(!e)return "";let t=l(e);if(t){let a=t.map(i=>i&&typeof i=="object"&&!Array.isArray(i)?this.sanitizeBlock(i):i).filter(i=>i!==null);return d(a)}return console.warn("[StateSync] Discarding malformed layout JSON during sanitization: not a valid JSON array"),""}sanitizeBlock(n){if(n[It]||n[Ct])return null;if(n[j]&&typeof n[j]=="object"&&n[j]!==null){let e=n[j];if(Array.isArray(e[ie])){let t=e[ie].filter(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?a[xt]!==ot:true);e[ie]=t.map(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?this.sanitizeComponentObject(a):a);}}return n}sanitizeComponentObject(n){let e={};for(let[t,a]of Object.entries(n))t===At||/^mock/i.test(t)||(t===Tt&&Array.isArray(a)?e[t]=a.filter(i=>i!==ot):a!==null&&typeof a=="object"&&!Array.isArray(a)?e[t]=this.sanitizeComponentObject(a):Array.isArray(a)?e[t]=a.map(i=>i!==null&&typeof i=="object"&&!Array.isArray(i)?this.sanitizeComponentObject(i):i):e[t]=a);return e}static \u0275fac=function(e){return new(e||o$1)};static \u0275prov=I({token:o$1,factory:o$1.\u0275fac,providedIn:"root"})};var st=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi,ct=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,lt=/\s*●●●\s*$/g,U=class o{PULSE_INDICATOR="\u25CF\u25CF\u25CF";appendPulse(n){return `${n??""} ${this.PULSE_INDICATOR}`}stripPulse(n){return n?(lt.lastIndex=0,n.replace(lt,"").trim()):""}stripThinkingTags(n){return n?(ct.lastIndex=0,n.replace(ct,"").trim()):""}extractCodeFences(n){if(!n)return {extracted:"",hasFences:false};st.lastIndex=0;let e=Array.from(n.matchAll(st));return e.length>0?{extracted:e.map(t=>t[1].trim()).join(`
`),hasFences:true}:{extracted:n.trim(),hasFences:false}}cleanPayload(n){if(!n)return "";let e=this.stripPulse(n);if(e=this.stripThinkingTags(e),e=this.extractCodeFences(e).extracted,!e.startsWith("{")&&!e.startsWith("[")){let a=Array.from(e.matchAll(/[\{\[]/g));for(let i of a)if(i.index!==void 0&&i.index>=0){let r=e.substring(i.index).trim();if(r.startsWith("{")&&r.includes('"version"')||r.startsWith("[")&&/^\[\s*[\{\"]/.test(r)&&(r.includes('"version"')||r.includes('"createSurface"')||r.includes('"updateComponents"'))||l(r)!==null){e=r;break}}}return e.trim()}isLayoutSnapshot(n){if(!n)return  false;let e=this.cleanPayload(n);return e.startsWith('{"version"')||e.startsWith("{")&&e.includes('"version"')||e.startsWith("[")&&(e.includes('"version"')||e.includes('"createSurface"')||e.includes('"updateComponents"'))||l(e)!==null}static \u0275fac=function(e){return new(e||o)};static \u0275prov=I({token:o,factory:o.\u0275fac,providedIn:"root"})};function dt(o){let n=/^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i,e=o.replace(n,"");if(e.startsWith("{"))try{let t=JSON.parse(e);if(t.error&&t.error.message)return t.error.message}catch{}return e}function F(o){if(!o)return o;let n=o.replace(/AIzaSy[A-Za-z0-9_-]+/g,"redacted for your protection");return n=n.replace(/(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,a)=>a.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),n=n.replace(/(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,a)=>a.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),n}var mt=class o$1{catalogManagement=f(Y_);configProvider=f(ho);stateSync=f(B);chatState=f(o);llmClient=f(Fn);chatCleaner=f(U);usageTrackingService=f(K_);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;currentTurnIndex=j$1(0);activePromptId=null;lastSeenRendererUrl="";isFirstUrlEffectRun=true;constructor(){Lt(()=>{let n=this.configProvider.rendererUrl();Kt(()=>{if(this.isFirstUrlEffectRun){this.isFirstUrlEffectRun=false,this.lastSeenRendererUrl=n;return}this.lastSeenRendererUrl!==n&&queueMicrotask(()=>this.wipeEnvironmentCache()),this.lastSeenRendererUrl=n;});});}wipeEnvironmentCache(){this.currentTurnIndex.set(0),this.activePromptId=null,this.chatState.setChatHistory([]),this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}getFullMessageContext(){return [{role:"system",content:this.systemPrompt()},...this.chatState.chatHistory().filter(n=>n.role!=="error")]}activeStreamResponse;isCancelRequested=false;cancelActiveStream(){this.isCancelRequested=true,this.activePromptId&&this.usageTrackingService.trackChatCancel({promptId:this.activePromptId,turnIndex:this.currentTurnIndex(),pipelineStatus:this.pipelineStatus()}),this.activeStreamResponse&&this.activeStreamResponse.cancel&&this.activeStreamResponse.cancel();}emitPromptTracking(n,e,t){let a=!!t?.retryOfPromptId,i=t?.promptTurnIndex??this.currentTurnIndex()+1;this.currentTurnIndex.set(i);let r=this.catalogManagement.activeCatalog(),s=r&&(r.catalogId||r.$id)||"",c=e.some(d=>d.name==="screenshot.png"||d.mimeType?.startsWith("image/")),l=e.filter(d=>d.name!=="screenshot.png"&&!d.mimeType?.startsWith("image/"));return a?this.usageTrackingService.trackChatRetry({promptId:t?.promptId,catalogId:s,turnIndex:i,attemptNumber:2,retryOfPromptId:t?.retryOfPromptId}):this.usageTrackingService.trackChatPrompt({promptId:t?.promptId,catalogId:s,turnType:i===1?"initial":"followup",turnIndex:i,attemptNumber:1,hasScreenshot:c,attachmentCount:l.length})}async submitPrompt(n,e=[],t){let a=n.trim();if(!a&&e.length===0)return;let i=this.emitPromptTracking(a,e,t);this.activePromptId=i,this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(s=>[...s,{role:"user",content:a,attachments:e.length>0?e:void 0,promptId:i}]);let r=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",r),this.chatState.updateChatHistory(s=>[...s,{role:"model",content:this.chatCleaner.appendPulse("")}]);try{this.isCancelRequested=!1;let s=await this.llmClient.chatStream(r);if(this.isCancelRequested){s.cancel&&s.cancel();let u=new Error("Cancelled");throw u.name=Xa,u}this.activeStreamResponse=s;let c="",l="";for await(let u of s.contentStream)c+=u.content,u.thinking&&(l+=u.thinking),this.chatState.updateChatHistory(p=>{let h=[...p],b=h.length-1;return h[b]?.role==="model"&&(h[b]={role:"model",content:this.chatCleaner.appendPulse(c),thinking:l}),h});let d=await s.complete;this.chatState.addRawLlmLog("LLM_RESPONSE",d),this.chatState.updateChatHistory(u=>{let p=[...u],h=p.length-1;return p[h]?.role==="model"&&(p[h]={role:"model",content:d,thinking:l}),p}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(d);}catch(s){s&&typeof s=="object"&&"name"in s&&s.name===Xa?(this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.updateChatHistory(c=>{let l=[...c],d=l.length-1;return l[d]?.role==="model"&&(l[d]=Z(E$1({},l[d]),{content:"*You stopped this response.*"})),l})):this.handleConnectivityError(s,a,e,i);}finally{this.activeStreamResponse=void 0;}}async processRawLlmPayload(n){let e=[];try{e=this.parseAndHealJsonLines(n);}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}this.chatState.setPipelineStatus("validating");try{let t={type:pe.RENDER_A2UI,payload:e},a=console.error,i=[];console.error=(...c)=>{i.push(c.map(l=>typeof l=="object"?JSON.stringify(l):String(l)).join(" "));};let r=!1;try{r=Xc.validateOutgoingMessage(t);}finally{console.error=a;}if(!r)throw new Error(`Outgoing message envelope validation failed:
${i.join(`
`)}`);this.runCatalogComponentSchemaCheck(e),this.chatState.setPipelineStatus("ready");let s=d(e);this.chatState.updateChatHistory(c=>{let l=[...c],d=l.length-1;return l[d]?.role==="model"&&(l[d]=Z(E$1({},l[d]),{content:s})),l}),this.stateSync.commitLayoutFromLlm(s),this.chatState.setProgrammaticStreamActive(!1);}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}}parseAndHealJsonLines(n){this.chatCleaner.extractCodeFences(n).hasFences&&this.chatState.setPipelineStatus("healing");let e=this.chatCleaner.cleanPayload(n),t=l(e);if(t)return t;try{let r=JSON.parse(e);if(Array.isArray(r))return r;if(r&&typeof r=="object")return [r]}catch{}let a=e.split(`
`).map(r=>r.trim()).filter(r=>r.length>0),i=[];for(let r of a)if(!(r.startsWith("```")||!r.startsWith("{")&&!r.startsWith("[")))try{i.push(JSON.parse(r));}catch{this.chatState.setPipelineStatus("healing");let c=this.attemptSyntaxHealing(r);if(c!==null)i.push(c);else if(r.includes('"version"')||r.includes('"createSurface"'))throw new Error(`Syntax recovery failed for corrupted JSON Line:
"${r}"`)}if(i.length===0)throw new Error("No valid A2UI JSON layout command block could be parsed or recovered.");return i}attemptSyntaxHealing(n){let e=n.trim();e=e.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(e)}catch{for(let a=1;a<=5;a++)try{return JSON.parse(e+"}".repeat(a))}catch{}for(let a=1;a<=3;a++)for(let i=1;i<=3;i++)try{return JSON.parse(e+"]".repeat(a)+"}".repeat(i))}catch{}}return null}runCatalogComponentSchemaCheck(n){let t=this.catalogManagement.activeCatalog()?.components,a={};if(t)for(let r of Object.keys(t)){let s=r.toLowerCase().replace(/[^a-z]/g,"");a[s]=r;}let i={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let r of n){if(!r||typeof r!="object")continue;let c=r.updateComponents;if(!c||typeof c!="object"||!Array.isArray(c.components))continue;let l=[];for(let d of c.components){if(!d||typeof d!="object"||Array.isArray(d)){l.push(d);continue}let u=d,p=u.component;if(u.name&&!u.component&&(this.chatState.setPipelineStatus("healing"),p=u.name,u.component=p,delete u.name),typeof p!="string")throw new Error("Component declaration is missing component type name string.");let h=p;if(t&&!t[p]){let f=p.toLowerCase().replace(/[^a-z]/g,""),v=a[f];if(!v){let y=i[f];y&&(v=a[y]);}if(v&&t[v])this.chatState.setPipelineStatus("healing"),h=v;else {let y=f?Object.keys(t).find(re=>re.toLowerCase().includes(f)||f.includes(re.toLowerCase())):void 0;if(y)this.chatState.setPipelineStatus("healing"),h=y;else throw new Error(`Validation failure: Component type "${p}" is not registered in the active custom catalog.`)}}let b=this.sanitizeComponentObject(u);b.component=h,l.push(b);}c.components=l;}}sanitizeValue(n){if(n===null||typeof n!="object")return n;if(Array.isArray(n))return n.map(a=>this.sanitizeValue(a));let e=n,t={};for(let[a,i]of Object.entries(e))a==="rules"||/^mock/i.test(a)||(t[a]=this.sanitizeValue(i));return t}sanitizeComponentObject(n){return this.sanitizeValue(n)}TEST_ONLY={sanitizeComponentObject:n=>this.sanitizeComponentObject(n)};isConnectivityError(n){return n.includes("failed to fetch")||n.includes("fetch")||n.includes("timeout")||n.includes("504")||n.includes("proxy")||n.includes("networkerror")||n.includes("connection")||n.includes("401")||n.includes("403")||n.includes("credential")||n.includes("quota")||n.includes("blocked")||n.includes("503")||n.includes("unavailable")||n.includes("api key")||n.includes("apikey")}parseError(n,e,t){let a="Connectivity Failure",i=e.trim().startsWith("{"),r=i?"A connectivity error occurred.":e,s=i?"Details: "+e:void 0,c="Tip: Please check your network proxy configurations or verify your settings to restore connections.",l=!!t,d=true;return n.includes("validation")||n.includes("syntax recovery")||n.includes("validation failure")?{errorTitle:"Validation Failure",errorMessage:"The generated layout contains invalid components or structure.",errorTip:"Tip: Try rephrasing your prompt to guide the model to generate valid components.",isRetryable:!!t,showDetails:true,errorDetails:"Details: "+e}:n.includes("503")||n.includes("unavailable")?{errorTitle:"Service Unavailable",errorMessage:"The generative service is temporarily unavailable. Please try again later.",errorTip:"",isRetryable:true,showDetails:false}:n.includes("high demand")?{errorTitle:"Model High Demand",errorMessage:"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",errorTip:"",isRetryable:true,showDetails:false}:n.includes("timeout")||n.includes("504")?{errorTitle:"REST Gateway Timeout",errorMessage:"Remote generation service did not respond.",errorDetails:"Details: "+e,errorTip:c,isRetryable:l,showDetails:true}:n.includes("api key")||n.includes("apikey")?{errorTitle:"Invalid API Key",errorMessage:"The provided Gemini API key is invalid or missing.",errorDetails:"Details: "+e,errorTip:"Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.",isRetryable:l,showDetails:true}:n.includes("auth")||n.includes("401")||n.includes("403")||n.includes("credential")?{errorTitle:"Authentication Refused",errorMessage:"Authentication failed. Please verify your credentials in Settings.",errorDetails:"Details: "+e,errorTip:c,isRetryable:l,showDetails:true}:n.includes("quota")||n.includes("blocked")||n.includes("429")?{errorTitle:"GenAI Service Blocked",errorMessage:"Resource quota depleted or content safety limits triggered.",errorDetails:"Details: "+e,errorTip:c,isRetryable:l,showDetails:true}:{errorTitle:a,errorMessage:r,errorTip:c,isRetryable:l,showDetails:d,errorDetails:s}}handleConnectivityError(n,e,t=[],a){let i=n instanceof Error?n.message:String(n),r=i.toLowerCase(),s=dt(i);this.isConnectivityError(r)?this.chatState.setPipelineStatus("idle"):this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false);let c=this.parseError(r,s,e),l="";n instanceof Error?l="Exception: "+n.message+`
Stack: `+(n.stack||"None"):l="Unknown Exception: "+JSON.stringify(n);let d="";c.errorDetails&&(d+=c.errorDetails+`

`),d+=l;let u=F(c.errorMessage),p=c.showDetails?F(d):void 0,h=c.showDetails?F(c.errorTip):void 0;console.error("Gemini chat execution failed:",n),this.chatState.updateChatHistory(b=>{let f=[...b],v=f.length-1,y=E$1({role:"error",content:u,errorTitle:c.errorTitle,errorMessage:u,errorDetails:p,errorTip:h,promptId:a},c.isRetryable?{isRetryable:true,originalPrompt:e,attachments:t}:{});return v>=0&&f[v].role==="model"?(f[v]=y,f):(f.push(y),f)});}systemPrompt=Ai(()=>{let n=this.catalogManagement.activeCatalog();return n?this.generateSystemPrompt(d(n)):`
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
  ${d(c)}
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

    * **Complex Form Example**: A vacation booking form demonstrating advanced
      Material form controls (\`MaterialDatepicker\`, \`MaterialSelect\`,
      \`MaterialSlideToggle\`) and buttons using the modernized Material catalog:
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "vacation_booking", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "vacation_booking", "components": [{"id": "root", "component": "MaterialColumn", "children": ["title", "destination_input", "checkin_datepicker", "checkout_datepicker", "room_type_select", "passenger_select", "flexible_dates_toggle", "search_button"]}, {"id": "title", "component": "MaterialText", "text": {"path": "/title_label"}, "usageHint": "h1"}, {"id": "destination_input", "component": "MaterialInput", "label": {"path": "/destination_label"}, "value": {"path": "/destination_value"}}, {"id": "checkin_datepicker", "component": "MaterialDatepicker", "label": {"path": "/checkin_label"}, "value": {"path": "/checkin_value"}}, {"id": "checkout_datepicker", "component": "MaterialDatepicker", "label": {"path": "/checkout_label"}, "value": {"path": "/checkout_value"}}, {"id": "room_type_select", "component": "MaterialSelect", "label": {"path": "/room_type_label"}, "value": {"path": "/room_type_value"}, "options": [{"label": "Standard Room", "value": "standard"}, {"label": "Deluxe Suite", "value": "deluxe"}]}, {"id": "passenger_select", "component": "MaterialSelect", "label": {"path": "/passenger_label"}, "value": {"path": "/passenger_value"}, "options": [{"label": "1 Passenger", "value": "1"}, {"label": "2 Passengers", "value": "2"}, {"label": "3+ Passengers", "value": "3"}]}, {"id": "flexible_dates_toggle", "component": "MaterialSlideToggle", "label": {"path": "/flexible_dates_label"}, "checked": {"path": "/flexible_dates_checked"}, "color": "primary"}, {"id": "search_button", "component": "MaterialButton", "label": {"path": "/search_label"}, "action": {"event": {"name": "searchVacation"}}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "vacation_booking", "value": {"title_label": "Book Your Dream Vacation", "destination_label": "Destination", "destination_value": "Hawaii", "checkin_label": "Check-in Date", "checkin_value": "2026-07-01", "checkout_label": "Check-out Date", "checkout_value": "2026-07-14", "room_type_label": "Room Type", "room_type_value": "standard", "passenger_label": "Passengers", "passenger_value": "2", "flexible_dates_label": "Flexible Dates (+/- 3 days)", "flexible_dates_checked": true, "search_label": "Search Flights & Hotels"}}}
      \`\`\`

    * **Dynamic List Example**: An example using templates to render a list of
      items.
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "dynamic_list_demo", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "dynamic_list_demo", "components": [{"id": "root", "component": "MaterialColumn", "children": ["title", "list_container"]}, {"id": "title", "component": "MaterialText", "text": "Dynamic List Demo"}, {"id": "list_container", "component": "MaterialColumn", "children": {"componentId": "item_template", "path": "/items"}}, {"id": "item_template", "component": "MaterialText", "text": {"path": "text"}}]}}
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

  `}static \u0275fac=function(e){return new(e||o$1)};static \u0275prov=I({token:o$1,factory:o$1.\u0275fac,providedIn:"root"})};export{B,St as S,U,Wt as W,mt as m};