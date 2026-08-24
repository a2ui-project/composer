import {f,a6 as ce$1,e as eE,x as xc,B,ac as uY,bb as zo,Y as H_,aj as ue,bc as Ee,ad as Kn,ae as Ys,r as w,g as go,bd as Fn,V as V_,be as Xa,am as Z,an as _,_ as pe,bf as nl,bg as IA,bh as P,bi as dp,au as y,aq as tn,bj as Co,b8 as ze,ay as wr,bk as _3,bl as pn,bm as Sr,bn as xo,bo as ns,bp as I,Q,K,bq as rs,ap as Cr,u as u_,v as lt$1,R as Ri,a as fe,l as l_,N as Ne,Z as Zt$1,W as We,S as Si,d as wt$1,j as Nf,T as Ti,br as Io,ar as N,z as z$1,a8 as gc,y as te,O,ai as T,av as xt$1,aU as Gt,az as es,aA as Ce,aD as co,D as Dv,h as St$1,c as cc,G as Ge,aE as Ni,I as lc,J as uc,L as J,a_ as PS,aR as jS,a$ as Im,b0 as Sm}from'./main.js';import {p,d,c,v}from'./chunk-Cvyt75DA.js';function ht(r,n){if(r&1){let e=PS();Ne(0,"div",1)(1,"button",2),cc("click",function(){Im(e);let a=jS();return Sm(a.action())}),Zt$1(2),We()();}if(r&2){let e=jS();wt$1(2),Nf(" ",e.data.action," ");}}var ft=["label"];function gt(r,n){}var yt=Math.pow(2,31)-1,E=class{_overlayRef;instance;containerInstance;_afterDismissed=new T;_afterOpened=new T;_onAction=new T;_durationTimeoutId;_dismissedByAction=false;constructor(n,e){this._overlayRef=e,this.containerInstance=n,n._onExit.subscribe(()=>this._finishDismiss());}dismiss(){this._afterDismissed.closed||this.containerInstance.exit(),clearTimeout(this._durationTimeoutId);}dismissWithAction(){this._onAction.closed||(this._dismissedByAction=true,this._onAction.next(),this._onAction.complete(),this.dismiss()),clearTimeout(this._durationTimeoutId);}closeWithAction(){this.dismissWithAction();}_dismissAfter(n){this._durationTimeoutId=setTimeout(()=>this.dismiss(),Math.min(n,yt));}_open(){this._afterOpened.closed||(this._afterOpened.next(),this._afterOpened.complete());}_finishDismiss(){this._overlayRef.dispose(),this._onAction.closed||this._onAction.complete(),this._afterDismissed.next({dismissedByAction:this._dismissedByAction}),this._afterDismissed.complete(),this._dismissedByAction=false;}afterDismissed(){return this._afterDismissed}afterOpened(){return this.containerInstance._onEnter}onAction(){return this._onAction}},nt=new y("MatSnackBarData"),A=class{politeness="polite";announcementMessage="";viewContainerRef;duration=0;panelClass;direction;data=null;horizontalPosition="center";verticalPosition="bottom"},vt=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275dir=J({type:r,selectors:[["","matSnackBarLabel",""]],hostAttrs:[1,"mat-mdc-snack-bar-label","mdc-snackbar__label"]})}return r})(),bt=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275dir=J({type:r,selectors:[["","matSnackBarActions",""]],hostAttrs:[1,"mat-mdc-snack-bar-actions","mdc-snackbar__actions"]})}return r})(),_t=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275dir=J({type:r,selectors:[["","matSnackBarAction",""]],hostAttrs:[1,"mat-mdc-snack-bar-action","mdc-snackbar__action"]})}return r})(),at=(()=>{class r{snackBarRef=f(E);data=f(nt);action(){this.snackBarRef.dismissWithAction();}get hasAction(){return !!this.data.action}static \u0275fac=function(t){return new(t||r)};static \u0275cmp=fe({type:r,selectors:[["simple-snack-bar"]],hostAttrs:[1,"mat-mdc-simple-snack-bar"],exportAs:["matSnackBar"],decls:3,vars:2,consts:[["matSnackBarLabel",""],["matSnackBarActions",""],["matButton","","matSnackBarAction","",3,"click"]],template:function(t,a){t&1&&(Ne(0,"div",0),Zt$1(1),We(),Si(2,ht,3,1,"div",1)),t&2&&(wt$1(),Nf(" ",a.data.message,`
`),wt$1(),Ti(a.hasAction?2:-1));},dependencies:[l_,vt,bt,_t],styles:[`.mat-mdc-simple-snack-bar {
  display: flex;
}
.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-label {
  max-height: 50vh;
  overflow: auto;
}
`],encapsulation:2})}return r})(),re="_mat-snack-bar-enter",oe="_mat-snack-bar-exit",kt=(()=>{class r extends Io{_ngZone=f(N);_elementRef=f(z$1);_changeDetectorRef=f(gc);_platform=f(te);_animationsDisabled=tn();snackBarConfig=f(A);_document=f(O);_trackedModals=new Set;_enterFallback;_exitFallback;_injector=f(P);_announceDelay=150;_announceTimeoutId;_destroyed=false;_portalOutlet;_onAnnounce=new T;_onExit=new T;_onEnter=new T;_animationState="void";_live;_label;_role;_liveElementId=f(xt$1).getId("mat-snack-bar-container-live-");constructor(){super();let e=this.snackBarConfig;e.politeness==="assertive"&&!e.announcementMessage?this._live="assertive":e.politeness==="off"?this._live="off":this._live="polite",this._platform.FIREFOX&&(this._live==="polite"&&(this._role="status"),this._live==="assertive"&&(this._role="alert"));}attachComponentPortal(e){this._assertNotAttached();let t=this._portalOutlet.attachComponentPortal(e);return this._afterPortalAttached(),t}attachTemplatePortal(e){this._assertNotAttached();let t=this._portalOutlet.attachTemplatePortal(e);return this._afterPortalAttached(),t}attachDomPortal=e=>{this._assertNotAttached();let t=this._portalOutlet.attachDomPortal(e);return this._afterPortalAttached(),t};onAnimationEnd(e){e===oe?this._completeExit():e===re&&(clearTimeout(this._enterFallback),this._ngZone.run(()=>{this._onEnter.next(),this._onEnter.complete();}));}enter(){this._destroyed||(this._animationState="visible",this._changeDetectorRef.markForCheck(),this._changeDetectorRef.detectChanges(),this._screenReaderAnnounce(),this._animationsDisabled?Gt(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(re)));},{injector:this._injector}):(clearTimeout(this._enterFallback),this._enterFallback=setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-snack-bar-fallback-visible"),this.onAnimationEnd(re);},200)));}exit(){return this._destroyed?Ee(void 0):(this._ngZone.run(()=>{this._animationState="hidden",this._changeDetectorRef.markForCheck(),this._elementRef.nativeElement.setAttribute("mat-exit",""),clearTimeout(this._announceTimeoutId),this._animationsDisabled?Gt(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(oe)));},{injector:this._injector}):(clearTimeout(this._exitFallback),this._exitFallback=setTimeout(()=>this.onAnimationEnd(oe),200));}),this._onExit)}ngOnDestroy(){this._destroyed=true,this._clearFromModals(),this._completeExit();}_completeExit(){clearTimeout(this._exitFallback),queueMicrotask(()=>{this._onExit.next(),this._onExit.complete();});}_afterPortalAttached(){let e=this._elementRef.nativeElement,t=this.snackBarConfig.panelClass;t&&(Array.isArray(t)?t.forEach(o=>e.classList.add(o)):e.classList.add(t)),this._exposeToModals();let a=this._label.nativeElement,i="mdc-snackbar__label";a.classList.toggle(i,!a.querySelector(`.${i}`));}_exposeToModals(){let e=this._liveElementId,t=this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');for(let a=0;a<t.length;a++){let i=t[a],o=i.getAttribute("aria-owns");this._trackedModals.add(i),o?o.indexOf(e)===-1&&i.setAttribute("aria-owns",o+" "+e):i.setAttribute("aria-owns",e);}}_clearFromModals(){this._trackedModals.forEach(e=>{let t=e.getAttribute("aria-owns");if(t){let a=t.replace(this._liveElementId,"").trim();a.length>0?e.setAttribute("aria-owns",a):e.removeAttribute("aria-owns");}}),this._trackedModals.clear();}_assertNotAttached(){this._portalOutlet.hasAttached();}_screenReaderAnnounce(){this._announceTimeoutId||this._ngZone.runOutsideAngular(()=>{this._announceTimeoutId=setTimeout(()=>{if(this._destroyed)return;let e=this._elementRef.nativeElement,t=e.querySelector("[aria-hidden]"),a=e.querySelector("[aria-live]");if(t&&a){let i=null;this._platform.isBrowser&&document.activeElement instanceof HTMLElement&&t.contains(document.activeElement)&&(i=document.activeElement),t.removeAttribute("aria-hidden"),a.appendChild(t),i?.focus(),this._onAnnounce.next(),this._onAnnounce.complete();}},this._announceDelay);});}static \u0275fac=function(t){return new(t||r)};static \u0275cmp=fe({type:r,selectors:[["mat-snack-bar-container"]],viewQuery:function(t,a){if(t&1&&Ni(es,7)(ft,7),t&2){let i;lc(i=uc())&&(a._portalOutlet=i.first),lc(i=uc())&&(a._label=i.first);}},hostAttrs:[1,"mdc-snackbar","mat-mdc-snack-bar-container"],hostVars:6,hostBindings:function(t,a){t&1&&cc("animationend",function(o){return a.onAnimationEnd(o.animationName)})("animationcancel",function(o){return a.onAnimationEnd(o.animationName)}),t&2&&Ge("mat-snack-bar-container-enter",a._animationState==="visible")("mat-snack-bar-container-exit",a._animationState==="hidden")("mat-snack-bar-container-animations-enabled",!a._animationsDisabled);},features:[Ce],decls:6,vars:3,consts:[["label",""],[1,"mdc-snackbar__surface","mat-mdc-snackbar-surface"],[1,"mat-mdc-snack-bar-label"],["aria-hidden","true"],["cdkPortalOutlet",""]],template:function(t,a){t&1&&(Ne(0,"div",1)(1,"div",2,0)(3,"div",3),co(4,gt,0,0,"ng-template",4),We(),Dv(5,"div"),We()()),t&2&&(wt$1(5),St$1("aria-live",a._live)("role",a._role)("id",a._liveElementId));},dependencies:[es],styles:[`@keyframes _mat-snack-bar-enter {
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
`],encapsulation:2,changeDetection:1})}return r})(),St=new y("mat-snack-bar-default-options",{providedIn:"root",factory:()=>new A}),Ct=(()=>{class r{_live=f(IA);_injector=f(P);_breakpointObserver=f(dp);_parentSnackBar=f(r,{optional:true,skipSelf:true});_defaultConfig=f(St);_animationsDisabled=tn();_snackBarRefAtThisLevel=null;simpleSnackBarComponent=at;snackBarContainerComponent=kt;handsetCssClass="mat-mdc-snack-bar-handset";get _openedSnackBarRef(){let e=this._parentSnackBar;return e?e._openedSnackBarRef:this._snackBarRefAtThisLevel}set _openedSnackBarRef(e){this._parentSnackBar?this._parentSnackBar._openedSnackBarRef=e:this._snackBarRefAtThisLevel=e;}openFromComponent(e,t){return this._attach(e,t)}openFromTemplate(e,t){return this._attach(e,t)}open(e,t="",a){let i=_(_({},this._defaultConfig),a);return i.data={message:e,action:t},i.announcementMessage===e&&(i.announcementMessage=void 0),this.openFromComponent(this.simpleSnackBarComponent,i)}dismiss(){this._openedSnackBarRef&&this._openedSnackBarRef.dismiss();}ngOnDestroy(){this._snackBarRefAtThisLevel&&this._snackBarRefAtThisLevel.dismiss();}_attachSnackBarContainer(e,t){let a=t&&t.viewContainerRef&&t.viewContainerRef.injector,i=P.create({parent:a||this._injector,providers:[{provide:A,useValue:t}]}),o=new Co(this.snackBarContainerComponent,t.viewContainerRef,i),s=e.attach(o);return s.instance.snackBarConfig=t,s.instance}_attach(e,t){let a=_(_(_({},new A),this._defaultConfig),t),i=this._createOverlay(a),o=this._attachSnackBarContainer(i,a),s=new E(o,i);if(e instanceof ze){let m=new wr(e,null,{$implicit:a.data,snackBarRef:s});s.instance=o.attachTemplatePortal(m);}else {let m=this._createInjector(a,s),l=new Co(e,void 0,m),c=o.attachComponentPortal(l);s.instance=c.instance;}return this._breakpointObserver.observe(_3.HandsetPortrait).pipe(pn(i.detachments())).subscribe(m=>{i.overlayElement.classList.toggle(this.handsetCssClass,m.matches);}),a.announcementMessage&&o._onAnnounce.subscribe(()=>{this._live.announce(a.announcementMessage,a.politeness);}),this._animateSnackBar(s,a),this._openedSnackBarRef=s,this._openedSnackBarRef}_animateSnackBar(e,t){e.afterDismissed().subscribe(()=>{this._openedSnackBarRef==e&&(this._openedSnackBarRef=null),t.announcementMessage&&this._live.clear();}),t.duration&&t.duration>0&&e.afterOpened().subscribe(()=>e._dismissAfter(t.duration)),this._openedSnackBarRef?(this._openedSnackBarRef.afterDismissed().subscribe(()=>{e.containerInstance.enter();}),this._openedSnackBarRef.dismiss()):e.containerInstance.enter();}_createOverlay(e){let t=new Sr;t.direction=e.direction;let a=xo(this._injector),i=e.direction==="rtl",o=e.horizontalPosition==="left"||e.horizontalPosition==="start"&&!i||e.horizontalPosition==="end"&&i,s=!o&&e.horizontalPosition!=="center";return o?a.left("0"):s?a.right("0"):a.centerHorizontally(),e.verticalPosition==="top"?a.top("0"):a.bottom("0"),t.positionStrategy=a,t.disableAnimations=this._animationsDisabled,ns(this._injector,t)}_createInjector(e,t){let a=e&&e.viewContainerRef&&e.viewContainerRef.injector;return P.create({parent:a||this._injector,providers:[{provide:E,useValue:t},{provide:nt,useValue:e.data}]})}static \u0275fac=function(t){return new(t||r)};static \u0275prov=I({token:r,factory:r.\u0275fac})}return r})();var Zt=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275mod=Q({type:r});static \u0275inj=K({providers:[Ct],imports:[rs,Cr,u_,at,lt$1]})}return r})();var it=`[
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
`;var j="updateComponents",se="components",xt="registerMockRules",At="mockRulesConfig",wt="rules",Dt="id",Tt="children",rt="mock_rules_container",U=class r{destroyRef=f(ce$1);chatState=f(p);catalogManagement=f(eE);startupConfigState=f(xc);previousCatalogId=null;isDraftModified=false;_activeDraft=B("");activeDraft=this._activeDraft.asReadonly();_draftInput=B("");constructor(){uY(this.startupConfigState.selectedRendererId).pipe(zo(1),H_(this.destroyRef)).subscribe(()=>{this.flushDraft();}),uY(this.catalogManagement.activeCatalog).pipe(ue(e=>!!e),H_(this.destroyRef)).subscribe(e=>{let t=e.catalogId||e.$id||"",a=this.previousCatalogId===null,i=this.previousCatalogId!==null&&this.previousCatalogId!==t;if((a||i)&&!this.isDraftModified){let o=this.getInitialDraft(t);this._activeDraft.set(o),this._draftInput.set(o);}this.previousCatalogId=t;}),(this.startupConfigState.sharedA2uiPayload?uY(this.startupConfigState.sharedA2uiPayload):Ee(null)).pipe(ue(e=>!!e),H_(this.destroyRef)).subscribe(e=>{this.injectExternalDraft(e);}),uY(this._draftInput).pipe(zo(1),Kn(300),Ys(),H_(this.destroyRef)).subscribe(e=>{this.syncLayoutToHistory(e);});}updateDraft(n){this.isDraftModified=true,this._activeDraft.set(n),this._draftInput.set(n);}injectExternalDraft(n){this.isDraftModified=true,this._activeDraft.set(n),this._draftInput.set(n);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(n){this.isDraftModified=true,this._activeDraft.set(n);}flushDraft(){this.isDraftModified=false;let n=this.catalogManagement.activeCatalog(),e=n&&(n.catalogId||n.$id)||"",t=this.getInitialDraft(e);this._activeDraft.set(t),this._draftInput.set(t);}getInitialDraft(n){let e=this.startupConfigState.activeRenderer();return e?.samplePayload?e.samplePayload:n==="https://a2ui.org/specification/v0_9/basic_catalog.json"?it:n?d([{version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:n,sendDataModel:true}}]):""}syncLayoutToHistory(n){let e=this.sanitizeLayout(n);if(!e)return;let t=this.chatState.chatHistory();if(t.length===0){this.chatState.setChatHistory([{role:"user",content:e}]);return}let a=t[t.length-1];if(a.role==="user"&&a.content.trim().startsWith("[")){let o=[...t];o[o.length-1]={role:"user",content:e},this.chatState.setChatHistory(o);}else this.chatState.updateChatHistory(o=>[...o,{role:"user",content:e}]);}sanitizeLayout(n){let e=n.trim();if(!e)return "";let t=c(e);if(t){let a=t.map(i=>i&&typeof i=="object"&&!Array.isArray(i)?this.sanitizeBlock(i):i).filter(i=>i!==null);return d(a)}return console.warn("[StateSync] Discarding malformed layout JSON during sanitization: not a valid JSON array"),""}sanitizeBlock(n){if(n[xt]||n[At])return null;if(n[j]&&typeof n[j]=="object"&&n[j]!==null){let e=n[j];if(Array.isArray(e[se])){let t=e[se].filter(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?a[Dt]!==rt:true);e[se]=t.map(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?this.sanitizeComponentObject(a):a);}}return n}sanitizeComponentObject(n){let e={};for(let[t,a]of Object.entries(n))t===wt||/^mock/i.test(t)||(t===Tt&&Array.isArray(a)?e[t]=a.filter(i=>i!==rt):a!==null&&typeof a=="object"&&!Array.isArray(a)?e[t]=this.sanitizeComponentObject(a):Array.isArray(a)?e[t]=a.map(i=>i!==null&&typeof i=="object"&&!Array.isArray(i)?this.sanitizeComponentObject(i):i):e[t]=a);return e}static \u0275fac=function(e){return new(e||r)};static \u0275prov=w({token:r,factory:r.\u0275fac,providedIn:"root"})};var ot=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi,st=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,ct=/\s*●●●\s*$/g;function lt(r){return r.length>0&&r.some(n=>{if(n&&typeof n=="object"&&!Array.isArray(n)){let e=Object.keys(n);return e.includes("version")||e.includes("createSurface")||e.includes("updateComponents")||e.includes("updateDataModel")||e.includes("deleteSurface")}return  false})}var F=class r{PULSE_INDICATOR="\u25CF\u25CF\u25CF";appendPulse(n){return `${n??""} ${this.PULSE_INDICATOR}`}stripPulse(n){return n?(ct.lastIndex=0,n.replace(ct,"").trim()):""}stripThinkingTags(n){return n?(st.lastIndex=0,n.replace(st,"").trim()):""}extractCodeFences(n){if(!n)return {extracted:"",hasFences:false};ot.lastIndex=0;let e=Array.from(n.matchAll(ot));return e.length>0?{extracted:e.map(t=>t[1].trim()).join(`
`),hasFences:true}:{extracted:n.trim(),hasFences:false}}cleanPayload(n){if(!n)return "";let e=this.stripPulse(n);if(e=this.stripThinkingTags(e),e=this.extractCodeFences(e).extracted,!e.startsWith("{")&&!e.startsWith("[")){let a=Array.from(e.matchAll(/[\{\[]/g));for(let i of a)if(i.index!==void 0&&i.index>=0){let o=e.substring(i.index).trim();if(o.startsWith("{")&&o.includes('"version"')||o.startsWith("[")&&/^\[\s*[\{\"]/.test(o)&&(o.includes('"version"')||o.includes('"createSurface"')||o.includes('"updateComponents"'))){e=o;break}let s=c(o);if(s!==null&&lt(s)){e=o;break}}}return e.trim()}isLayoutSnapshot(n){if(!n)return  false;let e=this.cleanPayload(n);if(e.startsWith('{"version"')||e.startsWith("{")&&e.includes('"version"')||e.startsWith("[")&&(e.includes('"version"')||e.includes('"createSurface"')||e.includes('"updateComponents"')))return  true;let t=c(e);return t!==null&&lt(t)}static \u0275fac=function(e){return new(e||r)};static \u0275prov=w({token:r,factory:r.\u0275fac,providedIn:"root"})};function dt(r){if(r==null||r.trim().length===0)return {blocks:[],wasHealed:false};let n=false,e=c(r);if(e)return {blocks:e,wasHealed:false};try{let i=JSON.parse(r);if(Array.isArray(i))return {blocks:i,wasHealed:n};if(i&&typeof i=="object")return {blocks:[i],wasHealed:n}}catch{}let t=r.split(`
`).map(i=>i.trim()).filter(i=>i.length>0),a=[];for(let i of t)if(!(i.startsWith("```")||!i.startsWith("{")&&!i.startsWith("[")))try{a.push(JSON.parse(i));}catch{n=true;let s=Mt(i);if(s!==null)a.push(s);else if(i.includes('"version"')||i.includes('"createSurface"'))throw new Error(`Syntax recovery failed for corrupted JSON Line:
"${i}"`)}if(a.length===0)throw new Error("No valid A2UI JSON layout command block could be parsed or recovered.");return {blocks:a,wasHealed:n}}function Mt(r){if(r==null||r.trim().length===0)return null;let n=r.trim();n=n.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(n)}catch{for(let t=1;t<=5;t++)try{return JSON.parse(n+"}".repeat(t))}catch{}for(let t=1;t<=3;t++)for(let a=1;a<=3;a++)try{return JSON.parse(n+"]".repeat(t)+"}".repeat(a))}catch{}}return null}function Rt(r){if(!r||typeof r!="object")return  false;let n=r;if(!n.updateComponents||typeof n.updateComponents!="object")return  false;let e=n.updateComponents;return Array.isArray(e.components)}function mt(r,n){let e=false,t={};if(n)for(let i of Object.keys(n)){let o=i.toLowerCase().replace(/[^a-z]/g,"");t[o]=i;}let a={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let i of r){if(!Rt(i))continue;let o=i.updateComponents,s=[];for(let m of o.components){if(!m||typeof m!="object"||Array.isArray(m)){s.push(m);continue}let l=m,c=l.component;if(l.name&&!l.component&&(e=true,c=l.name,l.component=c,delete l.name),typeof c!="string")throw new Error("Component declaration is missing component type name string.");let p=c;if(n&&!n[c]){let u=c.toLowerCase().replace(/[^a-z]/g,""),g=t[u];if(!g){let f=a[u];f&&(g=t[f]);}if(g&&n[g])e=true,p=g;else {let f=u?Object.keys(n).find(I=>I.toLowerCase().includes(u)||u.includes(I.toLowerCase())):void 0;if(f)e=true,p=f;else throw new Error(`Validation failure: Component type "${c}" is not registered in the active custom catalog.`)}}let h=Et(l);h.component=p,s.push(h);}o.components=s;}return e}function ce(r){if(r===null||typeof r!="object")return r;if(Array.isArray(r))return r.map(t=>ce(t));let n=r,e={};for(let[t,a]of Object.entries(n))t==="__proto__"||t==="constructor"||t==="prototype"||(e[t]=ce(a));return e}function Et(r){return ce(r)}var H=class r{catalogManagement=f(eE);systemPrompt=Ri(()=>{let n=this.catalogManagement.activeCatalog();return n?this.generateSystemPrompt(d(n)):`
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
  ${d(v)}
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
  `}static \u0275fac=function(e){return new(e||r)};static \u0275prov=w({token:r,factory:r.\u0275fac,providedIn:"root"})};var z=class r{isConnectivityError(n){return n?n.includes("failed to fetch")||n.includes("fetch")||n.includes("timeout")||n.includes("504")||n.includes("proxy")||n.includes("networkerror")||n.includes("connection")||n.includes("401")||n.includes("403")||n.includes("credential")||n.includes("quota")||n.includes("blocked")||n.includes("503")||n.includes("unavailable")||n.includes("api key")||n.includes("apikey"):false}parseError(n,e,t=false){let a=n??"",i=e??"",o="Connectivity Failure",s=i.trim().startsWith("{"),m=s?"A connectivity error occurred.":i,l=s?"Details: "+i:void 0,c="Tip: Please check your network proxy configurations or verify your settings to restore connections.",p=t,h=true,u=this.isConnectivityError(a);return a.includes("validation")||a.includes("syntax recovery")||a.includes("validation failure")?{errorTitle:"Validation Failure",errorMessage:"The generated layout contains invalid components or structure.",errorTip:"Tip: Try rephrasing your prompt to guide the model to generate valid components.",isRetryable:t,showDetails:true,errorDetails:"Details: "+i,isConnectivityFailure:u}:a.includes("503")||a.includes("unavailable")?{errorTitle:"Service Unavailable",errorMessage:"The generative service is temporarily unavailable. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:u}:a.includes("high demand")?{errorTitle:"Model High Demand",errorMessage:"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:u}:a.includes("timeout")||a.includes("504")?{errorTitle:"REST Gateway Timeout",errorMessage:"Remote generation service did not respond.",errorDetails:"Details: "+i,errorTip:c,isRetryable:p,showDetails:true,isConnectivityFailure:u}:a.includes("api key")||a.includes("apikey")?{errorTitle:"Invalid API Key",errorMessage:"The provided Gemini API key is invalid or missing.",errorDetails:"Details: "+i,errorTip:"Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.",isRetryable:p,showDetails:true,isConnectivityFailure:u}:a.includes("auth")||a.includes("401")||a.includes("403")||a.includes("credential")?{errorTitle:"Authentication Refused",errorMessage:"Authentication failed. Please verify your credentials in Settings.",errorDetails:"Details: "+i,errorTip:c,isRetryable:p,showDetails:true,isConnectivityFailure:u}:a.includes("quota")||a.includes("blocked")||a.includes("429")?{errorTitle:"GenAI Service Blocked",errorMessage:"Resource quota depleted or content safety limits triggered.",errorDetails:"Details: "+i,errorTip:c,isRetryable:p,showDetails:true,isConnectivityFailure:u}:{errorTitle:o,errorMessage:m,errorTip:c,isRetryable:p,showDetails:h,errorDetails:l,isConnectivityFailure:u}}static \u0275fac=function(e){return new(e||r)};static \u0275prov=w({token:r,factory:r.\u0275fac,providedIn:"root"})};function ut(r){let n=/^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i,e=r.replace(n,"");if(e.startsWith("{"))try{let t=JSON.parse(e);if(t.error&&t.error.message)return t.error.message}catch{}return e}function V(r){if(!r)return r;let n=r.replace(/AIzaSy[A-Za-z0-9_-]+/g,"redacted for your protection");return n=n.replace(/(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,a)=>a.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),n=n.replace(/(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,a)=>a.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),n}var pt=class r{catalogManagement=f(eE);configProvider=f(go);stateSync=f(U);chatState=f(p);llmClient=f(Fn);chatCleaner=f(F);usageTrackingService=f(V_);promptFactory=f(H);errorPresenter=f(z);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;currentTurnIndex=B(0);activePromptId=null;constructor(){uY(this.configProvider.rendererUrl).pipe(zo(1),H_()).subscribe(()=>{queueMicrotask(()=>this.wipeEnvironmentCache());});}wipeEnvironmentCache(){this.currentTurnIndex.set(0),this.activePromptId=null,this.chatState.setChatHistory([]),this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}getFullMessageContext(){return [{role:"system",content:this.promptFactory.systemPrompt()},...this.chatState.chatHistory().filter(n=>n.role!=="error")]}activeStreamResponse;isCancelRequested=false;cancelActiveStream(){this.isCancelRequested=true,this.activePromptId&&this.usageTrackingService.trackChatCancel({promptId:this.activePromptId,turnIndex:this.currentTurnIndex(),pipelineStatus:this.pipelineStatus()}),this.activeStreamResponse&&this.activeStreamResponse.cancel&&this.activeStreamResponse.cancel();}emitPromptTracking(n,e,t){let a=!!t?.retryOfPromptId,i=t?.promptTurnIndex??this.currentTurnIndex()+1;this.currentTurnIndex.set(i);let o=this.catalogManagement.activeCatalog(),s=o&&(o.catalogId||o.$id)||"",m=e.some(c=>c.name==="screenshot.png"||c.mimeType?.startsWith("image/")),l=e.filter(c=>c.name!=="screenshot.png"&&!c.mimeType?.startsWith("image/"));return a?this.usageTrackingService.trackChatRetry({promptId:t?.promptId,catalogId:s,turnIndex:i,attemptNumber:2,retryOfPromptId:t?.retryOfPromptId}):this.usageTrackingService.trackChatPrompt({promptId:t?.promptId,catalogId:s,turnType:i===1?"initial":"followup",turnIndex:i,attemptNumber:1,hasScreenshot:m,attachmentCount:l.length})}async submitPrompt(n,e=[],t){if(this.chatState.isProgrammaticStreamActive()){console.warn("[ChatCoordinator] Blocked submitPrompt: programmatic stream is active.");return}let a=n.trim();if(!a&&e.length===0)return;let i=this.emitPromptTracking(a,e,t);this.activePromptId=i,this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(s=>[...s,{role:"user",content:a,attachments:e.length>0?e:void 0,promptId:i}]);let o=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",o),this.chatState.updateChatHistory(s=>[...s,{role:"model",content:this.chatCleaner.appendPulse("")}]);try{this.isCancelRequested=!1;let s=await this.llmClient.chatStream(o);if(this.isCancelRequested){s.cancel&&s.cancel();let p=new Error("Cancelled");throw p.name=Xa,p}this.activeStreamResponse=s;let m="",l="";for await(let p of s.contentStream)m+=p.content,p.thinking&&(l+=p.thinking),this.chatState.updateChatHistory(h=>{let u=[...h],g=u.length-1;return u[g]?.role==="model"&&(u[g]={role:"model",content:this.chatCleaner.appendPulse(m),thinking:l}),u});let c=await s.complete;this.chatState.addRawLlmLog("LLM_RESPONSE",c),this.chatState.updateChatHistory(p=>{let h=[...p],u=h.length-1;return h[u]?.role==="model"&&(h[u]={role:"model",content:c,thinking:l}),h}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(c);}catch(s){s&&typeof s=="object"&&"name"in s&&s.name===Xa?(this.chatState.setPipelineStatus("idle"),this.chatState.setProgrammaticStreamActive(false),this.chatState.updateChatHistory(m=>{let l=[...m],c=l.length-1;return l[c]?.role==="model"&&(l[c]=Z(_({},l[c]),{content:"*You stopped this response.*"})),l})):this.handleConnectivityError(s,a,e,i);}finally{this.activeStreamResponse=void 0;}}async processRawLlmPayload(n){let e=[];try{this.chatCleaner.extractCodeFences(n).hasFences&&this.chatState.setPipelineStatus("healing");let t=this.chatCleaner.cleanPayload(n),a=dt(t);if(e=a.blocks,a.wasHealed&&this.chatState.setPipelineStatus("healing"),e.length===0)throw new Error("No valid A2UI JSON layout command block could be parsed or recovered.")}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}this.chatState.setPipelineStatus("validating");try{let t={type:pe.RENDER_A2UI,payload:e},a=[];if(!nl.validateOutgoingMessage(t,a))throw new Error(`Outgoing message envelope validation failed:
${a.join(`
`)}`);mt(e,this.catalogManagement.activeCatalog()?.components)&&this.chatState.setPipelineStatus("healing"),this.chatState.setPipelineStatus("ready");let s=d(e);this.chatState.updateChatHistory(m=>{let l=[...m],c=l.length-1;return l[c]?.role==="model"&&(l[c]=Z(_({},l[c]),{content:s})),l}),this.stateSync.commitLayoutFromLlm(s),this.chatState.setProgrammaticStreamActive(!1);}catch(t){throw this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false),t}}handleConnectivityError(n,e,t=[],a){let i=n instanceof Error?n.message:String(n),o=i.toLowerCase(),s=ut(i);this.errorPresenter.isConnectivityError(o)?this.chatState.setPipelineStatus("idle"):this.chatState.setPipelineStatus("failed"),this.chatState.setProgrammaticStreamActive(false);let m=this.errorPresenter.parseError(o,s,!!e),l="";n instanceof Error?l="Exception: "+n.message+`
Stack: `+(n.stack||"None"):l="Unknown Exception: "+JSON.stringify(n);let c="";m.errorDetails&&(c+=m.errorDetails+`

`),c+=l;let p=V(m.errorMessage),h=m.showDetails?V(c):void 0,u=m.showDetails?V(m.errorTip):void 0;console.error("Gemini chat execution failed:",n),this.chatState.updateChatHistory(g=>{let f=[...g],I=f.length-1,le=_({role:"error",content:p,errorTitle:m.errorTitle,errorMessage:p,errorDetails:h,errorTip:u,promptId:a},m.isRetryable?{isRetryable:true,originalPrompt:e,attachments:t}:{});return I>=0&&f[I].role==="model"?(f[I]=le,f):(f.push(le),f)});}systemPrompt=this.promptFactory.systemPrompt;static \u0275fac=function(e){return new(e||r)};static \u0275prov=w({token:r,factory:r.\u0275fac,providedIn:"root"})};export{Ct as C,F,U,Zt as Z,pt as p};