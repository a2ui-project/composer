import {f,a7 as me,g as ge,y as yc,q,ae as _q,aP as Lo,V as bq,al as ce$1,aQ as $n,af as Wn,ag as Ps,T,p as po,aR as Hn,M as Mt$1,o as oe$1,aS as Xa,ao as Z,ap as _,W as fe,aT as qc,aU as KM,aV as P,aW as Qf,aX as y$1,aY as Xt,aZ as Eo,a_ as Ve,a$ as Er,b0 as MG,b1 as cn,b2 as Cr,b3 as Io,b4 as Ki,b5 as I,n as Q,Y,b6 as Zi,b7 as Dr,H as Hb,r as st$1,S as Si,b as ue,U as Ub,A as Ae,d as Gt,e as He,_ as _i,i as wt$1,k as vf,E as Ei,b8 as Do,b9 as R,t as U$1,a9 as rc,J as J$1,O,ak as S,ba as xt$1,ax as Ht,bb as qi,bc as De,as as io,Q as Qy,j as St$1,K as Ka,$ as $e,bd as Ii,Z as Za,X as Xa$1,I as K,aD as nS,au as iS,aE as tm,aF as nm}from'./main.js';import {e}from'./chunk-CLNpRTgV.js';import {y,p,g,u}from'./chunk-jTGWZB2t.js';function vt(r,n){if(r&1){let e=nS();Ae(0,"div",1)(1,"button",2),Ka("click",function(){tm(e);let a=iS();return nm(a.action())}),Gt(2),He()();}if(r&2){let e=iS();wt$1(2),vf(" ",e.data.action," ");}}var bt=["label"];function _t(r,n){}var kt=Math.pow(2,31)-1,E=class{_overlayRef;instance;containerInstance;_afterDismissed=new S;_afterOpened=new S;_onAction=new S;_durationTimeoutId;_dismissedByAction=false;constructor(n,e){this._overlayRef=e,this.containerInstance=n,n._onExit.subscribe(()=>this._finishDismiss());}dismiss(){this._afterDismissed.closed||this.containerInstance.exit(),clearTimeout(this._durationTimeoutId);}dismissWithAction(){this._onAction.closed||(this._dismissedByAction=true,this._onAction.next(),this._onAction.complete(),this.dismiss()),clearTimeout(this._durationTimeoutId);}closeWithAction(){this.dismissWithAction();}_dismissAfter(n){this._durationTimeoutId=setTimeout(()=>this.dismiss(),Math.min(n,kt));}_open(){this._afterOpened.closed||(this._afterOpened.next(),this._afterOpened.complete());}_finishDismiss(){this._overlayRef.dispose(),this._onAction.closed||this._onAction.complete(),this._afterDismissed.next({dismissedByAction:this._dismissedByAction}),this._afterDismissed.complete(),this._dismissedByAction=false;}afterDismissed(){return this._afterDismissed}afterOpened(){return this.containerInstance._onEnter}onAction(){return this._onAction}},rt=new y$1("MatSnackBarData"),A=class{politeness="polite";announcementMessage="";viewContainerRef;duration=0;panelClass;direction;data=null;horizontalPosition="center";verticalPosition="bottom"},St=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275dir=K({type:r,selectors:[["","matSnackBarLabel",""]],hostAttrs:[1,"mat-mdc-snack-bar-label","mdc-snackbar__label"]})}return r})(),Ct=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275dir=K({type:r,selectors:[["","matSnackBarActions",""]],hostAttrs:[1,"mat-mdc-snack-bar-actions","mdc-snackbar__actions"]})}return r})(),It=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275dir=K({type:r,selectors:[["","matSnackBarAction",""]],hostAttrs:[1,"mat-mdc-snack-bar-action","mdc-snackbar__action"]})}return r})(),ot=(()=>{class r{snackBarRef=f(E);data=f(rt);action(){this.snackBarRef.dismissWithAction();}get hasAction(){return !!this.data.action}static \u0275fac=function(t){return new(t||r)};static \u0275cmp=ue({type:r,selectors:[["simple-snack-bar"]],hostAttrs:[1,"mat-mdc-simple-snack-bar"],exportAs:["matSnackBar"],decls:3,vars:2,consts:[["matSnackBarLabel",""],["matSnackBarActions",""],["matButton","","matSnackBarAction","",3,"click"]],template:function(t,a){t&1&&(Ae(0,"div",0),Gt(1),He(),_i(2,vt,3,1,"div",1)),t&2&&(wt$1(),vf(" ",a.data.message,`
`),wt$1(),Ei(a.hasAction?2:-1));},dependencies:[Ub,St,Ct,It],styles:[`.mat-mdc-simple-snack-bar {
  display: flex;
}
.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-label {
  max-height: 50vh;
  overflow: auto;
}
`],encapsulation:2})}return r})(),re="_mat-snack-bar-enter",oe="_mat-snack-bar-exit",xt=(()=>{class r extends Do{_ngZone=f(R);_elementRef=f(U$1);_changeDetectorRef=f(rc);_platform=f(J$1);_animationsDisabled=Xt();snackBarConfig=f(A);_document=f(O);_trackedModals=new Set;_enterFallback;_exitFallback;_injector=f(P);_announceDelay=150;_announceTimeoutId;_destroyed=false;_portalOutlet;_onAnnounce=new S;_onExit=new S;_onEnter=new S;_animationState="void";_live;_label;_role;_liveElementId=f(xt$1).getId("mat-snack-bar-container-live-");constructor(){super();let e=this.snackBarConfig;e.politeness==="assertive"&&!e.announcementMessage?this._live="assertive":e.politeness==="off"?this._live="off":this._live="polite",this._platform.FIREFOX&&(this._live==="polite"&&(this._role="status"),this._live==="assertive"&&(this._role="alert"));}attachComponentPortal(e){this._assertNotAttached();let t=this._portalOutlet.attachComponentPortal(e);return this._afterPortalAttached(),t}attachTemplatePortal(e){this._assertNotAttached();let t=this._portalOutlet.attachTemplatePortal(e);return this._afterPortalAttached(),t}attachDomPortal=e=>{this._assertNotAttached();let t=this._portalOutlet.attachDomPortal(e);return this._afterPortalAttached(),t};onAnimationEnd(e){e===oe?this._completeExit():e===re&&(clearTimeout(this._enterFallback),this._ngZone.run(()=>{this._onEnter.next(),this._onEnter.complete();}));}enter(){this._destroyed||(this._animationState="visible",this._changeDetectorRef.markForCheck(),this._changeDetectorRef.detectChanges(),this._screenReaderAnnounce(),this._animationsDisabled?Ht(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(re)));},{injector:this._injector}):(clearTimeout(this._enterFallback),this._enterFallback=setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-snack-bar-fallback-visible"),this.onAnimationEnd(re);},200)));}exit(){return this._destroyed?$n(void 0):(this._ngZone.run(()=>{this._animationState="hidden",this._changeDetectorRef.markForCheck(),this._elementRef.nativeElement.setAttribute("mat-exit",""),clearTimeout(this._announceTimeoutId),this._animationsDisabled?Ht(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(oe)));},{injector:this._injector}):(clearTimeout(this._exitFallback),this._exitFallback=setTimeout(()=>this.onAnimationEnd(oe),200));}),this._onExit)}ngOnDestroy(){this._destroyed=true,this._clearFromModals(),this._completeExit();}_completeExit(){clearTimeout(this._exitFallback),queueMicrotask(()=>{this._onExit.next(),this._onExit.complete();});}_afterPortalAttached(){let e=this._elementRef.nativeElement,t=this.snackBarConfig.panelClass;t&&(Array.isArray(t)?t.forEach(o=>e.classList.add(o)):e.classList.add(t)),this._exposeToModals();let a=this._label.nativeElement,i="mdc-snackbar__label";a.classList.toggle(i,!a.querySelector(`.${i}`));}_exposeToModals(){let e=this._liveElementId,t=this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');for(let a=0;a<t.length;a++){let i=t[a],o=i.getAttribute("aria-owns");this._trackedModals.add(i),o?o.indexOf(e)===-1&&i.setAttribute("aria-owns",o+" "+e):i.setAttribute("aria-owns",e);}}_clearFromModals(){this._trackedModals.forEach(e=>{let t=e.getAttribute("aria-owns");if(t){let a=t.replace(this._liveElementId,"").trim();a.length>0?e.setAttribute("aria-owns",a):e.removeAttribute("aria-owns");}}),this._trackedModals.clear();}_assertNotAttached(){this._portalOutlet.hasAttached();}_screenReaderAnnounce(){this._announceTimeoutId||this._ngZone.runOutsideAngular(()=>{this._announceTimeoutId=setTimeout(()=>{if(this._destroyed)return;let e=this._elementRef.nativeElement,t=e.querySelector("[aria-hidden]"),a=e.querySelector("[aria-live]");if(t&&a){let i=null;this._platform.isBrowser&&document.activeElement instanceof HTMLElement&&t.contains(document.activeElement)&&(i=document.activeElement),t.removeAttribute("aria-hidden"),a.appendChild(t),i?.focus(),this._onAnnounce.next(),this._onAnnounce.complete();}},this._announceDelay);});}static \u0275fac=function(t){return new(t||r)};static \u0275cmp=ue({type:r,selectors:[["mat-snack-bar-container"]],viewQuery:function(t,a){if(t&1&&Ii(qi,7)(bt,7),t&2){let i;Za(i=Xa$1())&&(a._portalOutlet=i.first),Za(i=Xa$1())&&(a._label=i.first);}},hostAttrs:[1,"mdc-snackbar","mat-mdc-snack-bar-container"],hostVars:6,hostBindings:function(t,a){t&1&&Ka("animationend",function(o){return a.onAnimationEnd(o.animationName)})("animationcancel",function(o){return a.onAnimationEnd(o.animationName)}),t&2&&$e("mat-snack-bar-container-enter",a._animationState==="visible")("mat-snack-bar-container-exit",a._animationState==="hidden")("mat-snack-bar-container-animations-enabled",!a._animationsDisabled);},features:[De],decls:6,vars:3,consts:[["label",""],[1,"mdc-snackbar__surface","mat-mdc-snackbar-surface"],[1,"mat-mdc-snack-bar-label"],["aria-hidden","true"],["cdkPortalOutlet",""]],template:function(t,a){t&1&&(Ae(0,"div",1)(1,"div",2,0)(3,"div",3),io(4,_t,0,0,"ng-template",4),He(),Qy(5,"div"),He()()),t&2&&(wt$1(5),St$1("aria-live",a._live)("role",a._role)("id",a._liveElementId));},dependencies:[qi],styles:[`@keyframes _mat-snack-bar-enter {
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
`],encapsulation:2,changeDetection:1})}return r})(),At=new y$1("mat-snack-bar-default-options",{providedIn:"root",factory:()=>new A}),Dt=(()=>{class r{_live=f(KM);_injector=f(P);_breakpointObserver=f(Qf);_parentSnackBar=f(r,{optional:true,skipSelf:true});_defaultConfig=f(At);_animationsDisabled=Xt();_snackBarRefAtThisLevel=null;simpleSnackBarComponent=ot;snackBarContainerComponent=xt;handsetCssClass="mat-mdc-snack-bar-handset";get _openedSnackBarRef(){let e=this._parentSnackBar;return e?e._openedSnackBarRef:this._snackBarRefAtThisLevel}set _openedSnackBarRef(e){this._parentSnackBar?this._parentSnackBar._openedSnackBarRef=e:this._snackBarRefAtThisLevel=e;}openFromComponent(e,t){return this._attach(e,t)}openFromTemplate(e,t){return this._attach(e,t)}open(e,t="",a){let i=_(_({},this._defaultConfig),a);return i.data={message:e,action:t},i.announcementMessage===e&&(i.announcementMessage=void 0),this.openFromComponent(this.simpleSnackBarComponent,i)}dismiss(){this._openedSnackBarRef&&this._openedSnackBarRef.dismiss();}ngOnDestroy(){this._snackBarRefAtThisLevel&&this._snackBarRefAtThisLevel.dismiss();}_attachSnackBarContainer(e,t){let a=t&&t.viewContainerRef&&t.viewContainerRef.injector,i=P.create({parent:a||this._injector,providers:[{provide:A,useValue:t}]}),o=new Eo(this.snackBarContainerComponent,t.viewContainerRef,i),c=e.attach(o);return c.instance.snackBarConfig=t,c.instance}_attach(e,t){let a=_(_(_({},new A),this._defaultConfig),t),i=this._createOverlay(a),o=this._attachSnackBarContainer(i,a),c=new E(o,i);if(e instanceof Ve){let s=new Er(e,null,{$implicit:a.data,snackBarRef:c});c.instance=o.attachTemplatePortal(s);}else {let s=this._createInjector(a,c),l=new Eo(e,void 0,s),d=o.attachComponentPortal(l);c.instance=d.instance;}return this._breakpointObserver.observe(MG.HandsetPortrait).pipe(cn(i.detachments())).subscribe(s=>{i.overlayElement.classList.toggle(this.handsetCssClass,s.matches);}),a.announcementMessage&&o._onAnnounce.subscribe(()=>{this._live.announce(a.announcementMessage,a.politeness);}),this._animateSnackBar(c,a),this._openedSnackBarRef=c,this._openedSnackBarRef}_animateSnackBar(e,t){e.afterDismissed().subscribe(()=>{this._openedSnackBarRef==e&&(this._openedSnackBarRef=null),t.announcementMessage&&this._live.clear();}),t.duration&&t.duration>0&&e.afterOpened().subscribe(()=>e._dismissAfter(t.duration)),this._openedSnackBarRef?(this._openedSnackBarRef.afterDismissed().subscribe(()=>{e.containerInstance.enter();}),this._openedSnackBarRef.dismiss()):e.containerInstance.enter();}_createOverlay(e){let t=new Cr;t.direction=e.direction;let a=Io(this._injector),i=e.direction==="rtl",o=e.horizontalPosition==="left"||e.horizontalPosition==="start"&&!i||e.horizontalPosition==="end"&&i,c=!o&&e.horizontalPosition!=="center";return o?a.left("0"):c?a.right("0"):a.centerHorizontally(),e.verticalPosition==="top"?a.top("0"):a.bottom("0"),t.positionStrategy=a,t.disableAnimations=this._animationsDisabled,Ki(this._injector,t)}_createInjector(e,t){let a=e&&e.viewContainerRef&&e.viewContainerRef.injector;return P.create({parent:a||this._injector,providers:[{provide:E,useValue:t},{provide:rt,useValue:e.data}]})}static \u0275fac=function(t){return new(t||r)};static \u0275prov=I({token:r,factory:r.\u0275fac})}return r})();var en=(()=>{class r{static \u0275fac=function(t){return new(t||r)};static \u0275mod=Q({type:r});static \u0275inj=Y({providers:[Dt],imports:[Zi,Dr,Hb,ot,st$1]})}return r})();var st=`[
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
`;var F="updateComponents",se="components",Rt="registerMockRules",wt="mockRulesConfig",Mt="rules",Et="id",Pt="children",ct="mock_rules_container",U=class r{destroyRef=f(me);chatState=f(y);catalogManagement=f(ge);startupConfigState=f(yc);previousCatalogId=null;isDraftModified=false;_activeDraft=q("");activeDraft=this._activeDraft.asReadonly();_draftInput=q("");constructor(){_q(this.startupConfigState.selectedRendererId).pipe(Lo(1),bq(this.destroyRef)).subscribe(()=>{this.flushDraft();}),_q(this.catalogManagement.activeCatalog).pipe(ce$1(e=>!!e),bq(this.destroyRef)).subscribe(e=>{let t=e.catalogId||e.$id||"",a=this.previousCatalogId===null,i=this.previousCatalogId!==null&&this.previousCatalogId!==t;if((a||i)&&!this.isDraftModified){let o=this.getInitialDraft(t);this._activeDraft.set(o),this._draftInput.set(o);}this.previousCatalogId=t;}),(this.startupConfigState.sharedA2uiPayload?_q(this.startupConfigState.sharedA2uiPayload):$n(null)).pipe(ce$1(e=>!!e),bq(this.destroyRef)).subscribe(e=>{this.injectExternalDraft(e);}),_q(this._draftInput).pipe(Lo(1),Wn(300),Ps(),bq(this.destroyRef)).subscribe(e=>{this.syncLayoutToHistory(e);});}updateDraft(n){this.isDraftModified=true,this._activeDraft.set(n),this._draftInput.set(n);}injectExternalDraft(n){this.isDraftModified=true,this._activeDraft.set(n),this._draftInput.set(n);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(n){this.isDraftModified=true,this._activeDraft.set(n);}flushDraft(){this.isDraftModified=false,this.previousCatalogId=null;let n=this.catalogManagement.activeCatalog(),e=n&&(n.catalogId||n.$id)||"";!this.startupConfigState.activeRenderer()?.samplePayload&&!e&&(e="https://a2ui.org/specification/v0_9/basic_catalog.json");let a=this.getInitialDraft(e);this._activeDraft.set(a),this._draftInput.set(a);}getInitialDraft(n){let e=this.startupConfigState.activeRenderer();return e?.samplePayload?e.samplePayload:n==="https://a2ui.org/specification/v0_9/basic_catalog.json"?st:n?p([{version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:n,sendDataModel:true}}]):""}syncLayoutToHistory(n){let e=this.sanitizeLayout(n);if(!e)return;let t=this.chatState.chatHistory();if(t.length===0){this.chatState.setChatHistory([{role:"user",content:e}]);return}let a=t[t.length-1];if(a.role==="user"&&a.content.trim().startsWith("[")){let o=[...t];o[o.length-1]={role:"user",content:e},this.chatState.setChatHistory(o);}else this.chatState.updateChatHistory(o=>[...o,{role:"user",content:e}]);}sanitizeLayout(n){let e=n.trim();if(!e)return "";let t=g(e);if(t.success){let a=t.data.map(i=>i&&typeof i=="object"&&!Array.isArray(i)?this.sanitizeBlock(i):i).filter(i=>i!==null);return p(a)}return console.warn("[StateSync] Discarding malformed layout JSON during sanitization: not a valid JSON array"),""}sanitizeBlock(n){if(n[Rt]||n[wt])return null;if(n[F]&&typeof n[F]=="object"&&n[F]!==null){let e=n[F];if(Array.isArray(e[se])){let t=e[se].filter(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?a[Et]!==ct:true);e[se]=t.map(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?this.sanitizeComponentObject(a):a);}}return n}sanitizeComponentObject(n){let e={};for(let[t,a]of Object.entries(n))t===Mt||/^mock/i.test(t)||(t===Pt&&Array.isArray(a)?e[t]=a.filter(i=>i!==ct):a!==null&&typeof a=="object"&&!Array.isArray(a)?e[t]=this.sanitizeComponentObject(a):Array.isArray(a)?e[t]=a.map(i=>i!==null&&typeof i=="object"&&!Array.isArray(i)?this.sanitizeComponentObject(i):i):e[t]=a);return e}static \u0275fac=function(e){return new(e||r)};static \u0275prov=T({token:r,factory:r.\u0275fac,providedIn:"root"})};var lt=/```(?:jsonl?|jsonlines|a2ui|html|xml)?\s*([\s\S]*?)\s*```/gi,dt=/<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,ut=/\s*●●●\s*$/g;function mt(r){return r.length>0&&r.some(n=>{if(n&&typeof n=="object"&&!Array.isArray(n)){let e=Object.keys(n);return e.includes("version")||e.includes("createSurface")||e.includes("updateComponents")||e.includes("updateDataModel")||e.includes("deleteSurface")}return  false})}var z=class r{PULSE_INDICATOR="\u25CF\u25CF\u25CF";appendPulse(n){return `${n??""} ${this.PULSE_INDICATOR}`}stripPulse(n){return n?(ut.lastIndex=0,n.replace(ut,"").trim()):""}stripThinkingTags(n){return n?(dt.lastIndex=0,n.replace(dt,"").trim()):""}extractCodeFences(n){if(!n)return {extracted:"",hasFences:false};lt.lastIndex=0;let e=Array.from(n.matchAll(lt));return e.length>0?{extracted:e.map(t=>t[1].trim()).join(`
`),hasFences:true}:{extracted:n.trim(),hasFences:false}}cleanPayload(n){if(!n)return "";let e=this.stripPulse(n);if(e=this.stripThinkingTags(e),e=this.extractCodeFences(e).extracted,!e.startsWith("{")&&!e.startsWith("[")){let a=Array.from(e.matchAll(/[\{\[]/g));for(let i of a)if(i.index!==void 0&&i.index>=0){let o=e.substring(i.index).trim();if(o.startsWith("{")&&o.includes('"version"')||o.startsWith("[")&&/^\[\s*[\{\"]/.test(o)&&(o.includes('"version"')||o.includes('"createSurface"')||o.includes('"updateComponents"'))){e=o;break}let c=g(o);if(c.success&&mt(c.data)){e=o;break}}}return e.trim()}isLayoutSnapshot(n){if(!n)return  false;let e=this.cleanPayload(n);if(e.startsWith('{"version"')||e.startsWith("{")&&e.includes('"version"')||e.startsWith("[")&&(e.includes('"version"')||e.includes('"createSurface"')||e.includes('"updateComponents"')))return  true;let t=g(e);return t.success&&mt(t.data)}static \u0275fac=function(e){return new(e||r)};static \u0275prov=T({token:r,factory:r.\u0275fac,providedIn:"root"})};function ht(r){if(r==null||r.trim().length===0)return {success:true,isConversational:true,blocks:[],count:0};let n=g(r);if(n.success)return {success:true,isConversational:false,blocks:n.data,count:ce(n.data)};let e=r.trim();if(e.startsWith("{")||e.startsWith("[")){let s=pt(r);if(s!==null&&typeof s=="object"){let l=Array.isArray(s)?s:[s];return {success:true,isConversational:false,blocks:l,count:ce(l)}}}let a=r.split(`
`).map((s,l)=>({text:(s||"").trim(),originalIndex:l})).filter(s=>s.text.length>0),i=[],o=false,c=null;for(let s of a)if(!(s.text.startsWith("```")||!s.text.startsWith("{")&&!s.text.startsWith("["))){o=true;try{i.push(JSON.parse(s.text));}catch(l){let d=pt(s.text);if(d!==null)i.push(d);else if(!c){let m=u(l,s.text);c={success:false,error:l?.message??"Syntax recovery failed",line:s.originalIndex+1,column:m.column,snippet:s.text};}}}if(i.length===0){if(c)return c;if(o){let s=n.error;return {success:false,error:s?.message??"Syntax recovery failed",line:s?.line,column:s?.column,snippet:s?.snippet}}return {success:true,isConversational:true,blocks:[],count:0}}return {success:true,isConversational:false,blocks:i,count:ce(i)}}function pt(r){if(r==null||r.trim().length===0)return null;let n=r.trim();if(n.length>256*1024)return null;n=n.replace(/,\s*([\]}])/g,"$1");try{return JSON.parse(n)}catch{for(let t=1;t<=5;t++)try{return JSON.parse(n+"}".repeat(t))}catch{}for(let t=1;t<=3;t++)for(let a=1;a<=3;a++)try{return JSON.parse(n+"}".repeat(t)+"]".repeat(a))}catch{}for(let t=1;t<=3;t++)for(let a=1;a<=3;a++)try{return JSON.parse(n+"]".repeat(t)+"}".repeat(a))}catch{}}return null}function Ot(r){if(!r||typeof r!="object")return  false;let n=r;if(!n.updateComponents||typeof n.updateComponents!="object")return  false;let e=n.updateComponents;return Array.isArray(e.components)}function ft(r,n){let e=false,t={};if(n)for(let i of Object.keys(n)){let o=i.toLowerCase().replace(/[^a-z]/g,"");t[o]=i;}let a={textbox:"textfield",textinput:"textfield",rowlayout:"row",columnlayout:"column",choice:"choicepicker",datepicker:"datetimeinput",datetimepicker:"datetimeinput"};for(let i of r){if(!Ot(i))continue;let o=i.updateComponents,c=[];for(let s of o.components){if(!s||typeof s!="object"||Array.isArray(s)){c.push(s);continue}let l=s,d=l.component;if(l.name&&!l.component&&(e=true,d=l.name,l.component=d,delete l.name),typeof d!="string")throw new Error("Component declaration is missing component type name string.");let m=d;if(n&&!n[d]){let p=d.toLowerCase().replace(/[^a-z]/g,""),g=t[p];if(!g){let f=a[p];f&&(g=t[f]);}if(g&&n[g])e=true,m=g;else {let f=p?Object.keys(n).find(I=>I.toLowerCase().includes(p)||p.includes(I.toLowerCase())):void 0;if(f)e=true,m=f;else throw new Error(`Validation failure: Component type "${d}" is not registered in the active custom catalog.`)}}let h=Lt(l);h.component=m,c.push(h);}o.components=c;}return e}function le(r){if(r===null||typeof r!="object")return r;if(Array.isArray(r))return r.map(t=>le(t));let n=r,e={};for(let[t,a]of Object.entries(n))t==="__proto__"||t==="constructor"||t==="prototype"||(e[t]=le(a));return e}function Lt(r){return le(r)}function ce(r){return r.reduce((n,e)=>!e||typeof e!="object"?n:e.updateComponents&&Array.isArray(e.updateComponents.components)?n+e.updateComponents.components.length:e.createSurface?n+1:n,0)}var H=class r{catalogManagement=f(ge);systemPrompt=Si(()=>{let n=this.catalogManagement.activeCatalog();return n?this.generateSystemPrompt(p(n)):`
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
  ${p(e)}
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
  `}static \u0275fac=function(e){return new(e||r)};static \u0275prov=T({token:r,factory:r.\u0275fac,providedIn:"root"})};var V=class r{isConnectivityError(n){return n?n.includes("failed to fetch")||n.includes("fetch")||n.includes("timeout")||n.includes("504")||n.includes("proxy")||n.includes("networkerror")||n.includes("connection")||n.includes("401")||n.includes("403")||n.includes("credential")||n.includes("quota")||n.includes("blocked")||n.includes("503")||n.includes("unavailable")||n.includes("api key")||n.includes("apikey"):false}parseError(n,e,t=false){let a=n??"",i=e??"",o="Connectivity Failure",c=i.trim().startsWith("{"),s=c?"A connectivity error occurred.":i,l=c?"Details: "+i:void 0,d="Tip: Please check your network proxy configurations or verify your settings to restore connections.",m=t,h=true,p=this.isConnectivityError(a);return a.includes("validation")||a.includes("syntax recovery")||a.includes("validation failure")?{errorTitle:"Validation Failure",errorMessage:"The generated layout contains invalid components or structure.",errorTip:"Tip: Try rephrasing your prompt to guide the model to generate valid components.",isRetryable:t,showDetails:true,errorDetails:"Details: "+i,isConnectivityFailure:p}:a.includes("503")||a.includes("unavailable")?{errorTitle:"Service Unavailable",errorMessage:"The generative service is temporarily unavailable. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:p}:a.includes("high demand")?{errorTitle:"Model High Demand",errorMessage:"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",errorTip:"",isRetryable:true,showDetails:false,isConnectivityFailure:p}:a.includes("timeout")||a.includes("504")?{errorTitle:"REST Gateway Timeout",errorMessage:"Remote generation service did not respond.",errorDetails:"Details: "+i,errorTip:d,isRetryable:m,showDetails:true,isConnectivityFailure:p}:a.includes("api key")||a.includes("apikey")?{errorTitle:"Invalid API Key",errorMessage:"The provided Gemini API key is invalid or missing.",errorDetails:"Details: "+i,errorTip:"Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.",isRetryable:m,showDetails:true,isConnectivityFailure:p}:a.includes("auth")||a.includes("401")||a.includes("403")||a.includes("credential")?{errorTitle:"Authentication Refused",errorMessage:"Authentication failed. Please verify your credentials in Settings.",errorDetails:"Details: "+i,errorTip:d,isRetryable:m,showDetails:true,isConnectivityFailure:p}:a.includes("quota")||a.includes("blocked")||a.includes("429")?{errorTitle:"GenAI Service Blocked",errorMessage:"Resource quota depleted or content safety limits triggered.",errorDetails:"Details: "+i,errorTip:d,isRetryable:m,showDetails:true,isConnectivityFailure:p}:{errorTitle:o,errorMessage:s,errorTip:d,isRetryable:m,showDetails:h,errorDetails:l,isConnectivityFailure:p}}static \u0275fac=function(e){return new(e||r)};static \u0275prov=T({token:r,factory:r.\u0275fac,providedIn:"root"})};function gt(r){let n=/^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i,e=r.replace(n,"");if(e.startsWith("{"))try{let t=JSON.parse(e);if(t.error&&t.error.message)return t.error.message}catch{}return e}function J(r){if(!r)return r;let n=r.replace(/AIzaSy[A-Za-z0-9_-]+/g,"redacted for your protection");return n=n.replace(/(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,a)=>a.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),n=n.replace(/(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,(e,t,a)=>a.toLowerCase()==="redacted for your protection"?e:t+"redacted for your protection"),n}var yt=class r{catalogManagement=f(ge);configProvider=f(po);stateSync=f(U);chatState=f(y);llmClient=f(Hn);errorLogger=f(Mt$1);chatCleaner=f(z);usageTrackingService=f(oe$1);promptFactory=f(H);errorPresenter=f(V);pipelineStatus=this.chatState.pipelineStatus;isProgrammaticStreamActive=this.chatState.isProgrammaticStreamActive;currentTurnIndex=q(0);activePromptId=null;constructor(){_q(this.configProvider.rendererUrl).pipe(Lo(1),bq()).subscribe(()=>{queueMicrotask(()=>this.wipeEnvironmentCache());});}wipeEnvironmentCache(){this.currentTurnIndex.set(0),this.activePromptId=null,this.chatState.setChatHistory([]),this.finalizeStream("idle"),this.chatState.clearRawLlmHistory(),this.stateSync.flushDraft();}finalizeStream(n="idle"){this.chatState.setPipelineStatus(n),this.chatState.setProgrammaticStreamActive(false);}getFullMessageContext(){return [{role:"system",content:this.promptFactory.systemPrompt()},...this.chatState.chatHistory().filter(n=>n.role!=="error")]}activeStreamResponse;isCancelRequested=false;cancelActiveStream(){this.isCancelRequested=true,this.activePromptId&&this.usageTrackingService.trackChatCancel({promptId:this.activePromptId,turnIndex:this.currentTurnIndex(),pipelineStatus:this.pipelineStatus()}),this.activeStreamResponse&&this.activeStreamResponse.cancel&&this.activeStreamResponse.cancel();}emitPromptTracking(n,e,t){let a=!!t?.retryOfPromptId,i=t?.promptTurnIndex??this.currentTurnIndex()+1;this.currentTurnIndex.set(i);let o=this.catalogManagement.activeCatalog(),c=o&&(o.catalogId||o.$id)||"",s=e.some(d=>d.name==="screenshot.png"||d.mimeType?.startsWith("image/")),l=e.filter(d=>d.name!=="screenshot.png"&&!d.mimeType?.startsWith("image/"));return a?this.usageTrackingService.trackChatRetry({promptId:t?.promptId,catalogId:c,turnIndex:i,attemptNumber:2,retryOfPromptId:t?.retryOfPromptId}):this.usageTrackingService.trackChatPrompt({promptId:t?.promptId,catalogId:c,turnType:i===1?"initial":"followup",turnIndex:i,attemptNumber:1,hasScreenshot:s,attachmentCount:l.length})}async submitPrompt(n,e=[],t){if(this.chatState.isProgrammaticStreamActive()){console.warn("[ChatCoordinator] Blocked submitPrompt: programmatic stream is active.");return}let a=n.trim();if(!a&&e.length===0)return;let i=this.emitPromptTracking(a,e,t);this.activePromptId=i,this.chatState.setProgrammaticStreamActive(true),this.chatState.setPipelineStatus("receiving_stream"),this.chatState.updateChatHistory(c=>[...c,{role:"user",content:a,attachments:e.length>0?e:void 0,promptId:i}]);let o=this.getFullMessageContext();this.chatState.addRawLlmLog("LLM_REQUEST",o),this.chatState.updateChatHistory(c=>[...c,{role:"model",content:this.chatCleaner.appendPulse("")}]);try{this.isCancelRequested=!1;let c=await this.llmClient.chatStream(o);if(this.isCancelRequested){c.cancel&&c.cancel();let m=new Error("Cancelled");throw m.name=Xa,m}this.activeStreamResponse=c;let s="",l="";for await(let m of c.contentStream)s+=m.content,m.thinking&&(l+=m.thinking),this.chatState.updateChatHistory(h=>{let p=[...h],g=p.length-1;return p[g]?.role==="model"&&(p[g]={role:"model",content:this.chatCleaner.appendPulse(s),thinking:l}),p});let d=await c.complete;this.chatState.addRawLlmLog("LLM_RESPONSE",d),this.chatState.updateChatHistory(m=>{let h=[...m],p=h.length-1;return h[p]?.role==="model"&&(h[p]={role:"model",content:d,thinking:l}),h}),this.chatState.setPipelineStatus("received_raw"),await this.processRawLlmPayload(d,i);}catch(c){c&&typeof c=="object"&&"name"in c&&c.name===Xa?(this.finalizeStream("idle"),this.chatState.updateChatHistory(s=>{let l=[...s],d=l.length-1;return l[d]?.role==="model"&&(l[d]=Z(_({},l[d]),{content:"*You stopped this response.*"})),l})):this.handleConnectivityError(c,a,e,i);}finally{this.activeStreamResponse=void 0;}}async processRawLlmPayload(n,e){let t=[],a=0;try{this.chatCleaner.extractCodeFences(n).hasFences&&this.chatState.setPipelineStatus("healing");let i=this.chatCleaner.cleanPayload(n),o=ht(i);if(o.success&&o.isConversational){this.finalizeStream("idle");return}if(!o.success){let c=e?`[prompt:${e}] `:"";this.errorLogger.error({sourceTag:"[ChatParser]",message:`${c}${o.error}`,line:o.line,column:o.column,snippet:o.snippet}),this.chatState.updateChatHistory(s=>{let l=[...s],d=l.length-1;return l[d]?.role==="model"&&(l[d]=Z(_({},l[d]),{parseError:o})),l}),this.finalizeStream("idle");return}t=o.blocks,a=o.count;}catch(i){throw this.finalizeStream("failed"),i}this.chatState.setPipelineStatus("validating");try{let i={type:fe.RENDER_A2UI,payload:t},o=[];if(!qc.validateOutgoingMessage(i,o))throw new Error(`Outgoing message envelope validation failed:
${o.join(`
`)}`);ft(t,this.catalogManagement.activeCatalog()?.components)&&this.chatState.setPipelineStatus("healing"),this.chatState.setPipelineStatus("ready");let l=p(t);this.chatState.updateChatHistory(d=>{let m=[...d],h=m.length-1;return m[h]?.role==="model"&&(m[h]=Z(_({},m[h]),{content:l,isSnapshot:!0,componentCount:a})),m}),this.stateSync.commitLayoutFromLlm(l),this.chatState.setProgrammaticStreamActive(!1);}catch(i){throw this.finalizeStream("failed"),i}}handleConnectivityError(n,e,t=[],a){let i=n instanceof Error?n.message:String(n),o=i.toLowerCase(),c=gt(i);this.errorPresenter.isConnectivityError(o)?this.finalizeStream("idle"):this.finalizeStream("failed");let s=this.errorPresenter.parseError(o,c,!!e),l="";n instanceof Error?l="Exception: "+n.message+`
Stack: `+(n.stack||"None"):l="Unknown Exception: "+JSON.stringify(n);let d="";s.errorDetails&&(d+=s.errorDetails+`

`),d+=l;let m=J(s.errorMessage),h=s.showDetails?J(d):void 0,p=s.showDetails?J(s.errorTip):void 0;console.error("Gemini chat execution failed:",n),this.chatState.updateChatHistory(g=>{let f=[...g],I=f.length-1,de=_({role:"error",content:m,errorTitle:s.errorTitle,errorMessage:m,errorDetails:h,errorTip:p,promptId:a},s.isRetryable?{isRetryable:true,originalPrompt:e,attachments:t}:{});return I>=0&&f[I].role==="model"?(f[I]=de,f):(f.push(de),f)});}systemPrompt=this.promptFactory.systemPrompt;static \u0275fac=function(e){return new(e||r)};static \u0275prov=T({token:r,factory:r.\u0275fac,providedIn:"root"})};export{Dt as D,U,en as e,ht as h,yt as y,z};