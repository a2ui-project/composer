import {s,m as m$1,l}from'./chunk-CQRY3ZKf.js';import {G as Gn,h as ho,V as Vn}from'./chunk-BFRFGDqu.js';import {f,_ as Le,r as r_,l as le,b5 as Fn,aD as il,b6 as xo,a5 as Bn,a6 as Ss,P,b7 as Tx,b8 as k,b9 as Bf,am as g,ai as zt$1,af as E,ba as uo,b2 as Be,aq as hr,bb as QW,bc as Mr,bd as gr,be as mo,bf as Vi,bg as w,K,y as q,bh as Hi,ah as pr,S as Sb,z as tt,u as ue,I as Ib,e as Se,g as Vt$1,j as je,k as di,m as mt,o as nf,x as fi,bi as fo,aj as M,B as $,a1 as Ya,J,A,ab as C,an as _t,aM as Pt,ar as Bi,as as _e,av as Qr,h as jy,v as vt,V as Va,p as Ve,aw as gi,H as Ha,G as Ua,Z,aU as BI,aJ as HI,aV as Up,aW as $p}from'./main.js';function Ft(i,r){if(i&1){let t=BI();Se(0,"div",1)(1,"button",2),Va("click",function(){Up(t);let n=HI();return $p(n.action())}),Vt$1(2),je()();}if(i&2){let t=HI();mt(2),nf(" ",t.data.action," ");}}var zt=["label"];function Ut(i,r){}var Ht=Math.pow(2,31)-1,_=class{_overlayRef;instance;containerInstance;_afterDismissed=new C;_afterOpened=new C;_onAction=new C;_durationTimeoutId;_dismissedByAction=false;constructor(r,t){this._overlayRef=t,this.containerInstance=r,r._onExit.subscribe(()=>this._finishDismiss());}dismiss(){this._afterDismissed.closed||this.containerInstance.exit(),clearTimeout(this._durationTimeoutId);}dismissWithAction(){this._onAction.closed||(this._dismissedByAction=true,this._onAction.next(),this._onAction.complete(),this.dismiss()),clearTimeout(this._durationTimeoutId);}closeWithAction(){this.dismissWithAction();}_dismissAfter(r){this._durationTimeoutId=setTimeout(()=>this.dismiss(),Math.min(r,Ht));}_open(){this._afterOpened.closed||(this._afterOpened.next(),this._afterOpened.complete());}_finishDismiss(){this._overlayRef.dispose(),this._onAction.closed||this._onAction.complete(),this._afterDismissed.next({dismissedByAction:this._dismissedByAction}),this._afterDismissed.complete(),this._dismissedByAction=false;}afterDismissed(){return this._afterDismissed}afterOpened(){return this.containerInstance._onEnter}onAction(){return this._onAction}},wt=new g("MatSnackBarData"),m=class{politeness="polite";announcementMessage="";viewContainerRef;duration=0;panelClass;direction;data=null;horizontalPosition="center";verticalPosition="bottom"},Vt=(()=>{class i{static \u0275fac=function(e){return new(e||i)};static \u0275dir=Z({type:i,selectors:[["","matSnackBarLabel",""]],hostAttrs:[1,"mat-mdc-snack-bar-label","mdc-snackbar__label"]})}return i})(),qt=(()=>{class i{static \u0275fac=function(e){return new(e||i)};static \u0275dir=Z({type:i,selectors:[["","matSnackBarActions",""]],hostAttrs:[1,"mat-mdc-snack-bar-actions","mdc-snackbar__actions"]})}return i})(),$t=(()=>{class i{static \u0275fac=function(e){return new(e||i)};static \u0275dir=Z({type:i,selectors:[["","matSnackBarAction",""]],hostAttrs:[1,"mat-mdc-snack-bar-action","mdc-snackbar__action"]})}return i})(),Et=(()=>{class i{snackBarRef=f(_);data=f(wt);action(){this.snackBarRef.dismissWithAction();}get hasAction(){return !!this.data.action}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ue({type:i,selectors:[["simple-snack-bar"]],hostAttrs:[1,"mat-mdc-simple-snack-bar"],exportAs:["matSnackBar"],decls:3,vars:2,consts:[["matSnackBarLabel",""],["matSnackBarActions",""],["matButton","","matSnackBarAction","",3,"click"]],template:function(e,n){e&1&&(Se(0,"div",0),Vt$1(1),je(),di(2,Ft,3,1,"div",1)),e&2&&(mt(),nf(" ",n.data.message,`
`),mt(),fi(n.hasAction?2:-1));},dependencies:[Ib,Vt,qt,$t],styles:[`.mat-mdc-simple-snack-bar {
  display: flex;
}
.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-label {
  max-height: 50vh;
  overflow: auto;
}
`],encapsulation:2})}return i})(),L="_mat-snack-bar-enter",N="_mat-snack-bar-exit",Kt=(()=>{class i extends fo{_ngZone=f(M);_elementRef=f($);_changeDetectorRef=f(Ya);_platform=f(J);_animationsDisabled=zt$1();snackBarConfig=f(m);_document=f(A);_trackedModals=new Set;_enterFallback;_exitFallback;_injector=f(k);_announceDelay=150;_announceTimeoutId;_destroyed=false;_portalOutlet;_onAnnounce=new C;_onExit=new C;_onEnter=new C;_animationState="void";_live;_label;_role;_liveElementId=f(_t).getId("mat-snack-bar-container-live-");constructor(){super();let t=this.snackBarConfig;t.politeness==="assertive"&&!t.announcementMessage?this._live="assertive":t.politeness==="off"?this._live="off":this._live="polite",this._platform.FIREFOX&&(this._live==="polite"&&(this._role="status"),this._live==="assertive"&&(this._role="alert"));}attachComponentPortal(t){this._assertNotAttached();let e=this._portalOutlet.attachComponentPortal(t);return this._afterPortalAttached(),e}attachTemplatePortal(t){this._assertNotAttached();let e=this._portalOutlet.attachTemplatePortal(t);return this._afterPortalAttached(),e}attachDomPortal=t=>{this._assertNotAttached();let e=this._portalOutlet.attachDomPortal(t);return this._afterPortalAttached(),e};onAnimationEnd(t){t===N?this._completeExit():t===L&&(clearTimeout(this._enterFallback),this._ngZone.run(()=>{this._onEnter.next(),this._onEnter.complete();}));}enter(){this._destroyed||(this._animationState="visible",this._changeDetectorRef.markForCheck(),this._changeDetectorRef.detectChanges(),this._screenReaderAnnounce(),this._animationsDisabled?Pt(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(L)));},{injector:this._injector}):(clearTimeout(this._enterFallback),this._enterFallback=setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-snack-bar-fallback-visible"),this.onAnimationEnd(L);},200)));}exit(){return this._destroyed?Fn(void 0):(this._ngZone.run(()=>{this._animationState="hidden",this._changeDetectorRef.markForCheck(),this._elementRef.nativeElement.setAttribute("mat-exit",""),clearTimeout(this._announceTimeoutId),this._animationsDisabled?Pt(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(N)));},{injector:this._injector}):(clearTimeout(this._exitFallback),this._exitFallback=setTimeout(()=>this.onAnimationEnd(N),200));}),this._onExit)}ngOnDestroy(){this._destroyed=true,this._clearFromModals(),this._completeExit();}_completeExit(){clearTimeout(this._exitFallback),queueMicrotask(()=>{this._onExit.next(),this._onExit.complete();});}_afterPortalAttached(){let t=this._elementRef.nativeElement,e=this.snackBarConfig.panelClass;e&&(Array.isArray(e)?e.forEach(o=>t.classList.add(o)):t.classList.add(e)),this._exposeToModals();let n=this._label.nativeElement,a="mdc-snackbar__label";n.classList.toggle(a,!n.querySelector(`.${a}`));}_exposeToModals(){let t=this._liveElementId,e=this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');for(let n=0;n<e.length;n++){let a=e[n],o=a.getAttribute("aria-owns");this._trackedModals.add(a),o?o.indexOf(t)===-1&&a.setAttribute("aria-owns",o+" "+t):a.setAttribute("aria-owns",t);}}_clearFromModals(){this._trackedModals.forEach(t=>{let e=t.getAttribute("aria-owns");if(e){let n=e.replace(this._liveElementId,"").trim();n.length>0?t.setAttribute("aria-owns",n):t.removeAttribute("aria-owns");}}),this._trackedModals.clear();}_assertNotAttached(){this._portalOutlet.hasAttached();}_screenReaderAnnounce(){this._announceTimeoutId||this._ngZone.runOutsideAngular(()=>{this._announceTimeoutId=setTimeout(()=>{if(this._destroyed)return;let t=this._elementRef.nativeElement,e=t.querySelector("[aria-hidden]"),n=t.querySelector("[aria-live]");if(e&&n){let a=null;this._platform.isBrowser&&document.activeElement instanceof HTMLElement&&e.contains(document.activeElement)&&(a=document.activeElement),e.removeAttribute("aria-hidden"),n.appendChild(e),a?.focus(),this._onAnnounce.next(),this._onAnnounce.complete();}},this._announceDelay);});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=ue({type:i,selectors:[["mat-snack-bar-container"]],viewQuery:function(e,n){if(e&1&&gi(Bi,7)(zt,7),e&2){let a;Ha(a=Ua())&&(n._portalOutlet=a.first),Ha(a=Ua())&&(n._label=a.first);}},hostAttrs:[1,"mdc-snackbar","mat-mdc-snack-bar-container"],hostVars:6,hostBindings:function(e,n){e&1&&Va("animationend",function(o){return n.onAnimationEnd(o.animationName)})("animationcancel",function(o){return n.onAnimationEnd(o.animationName)}),e&2&&Ve("mat-snack-bar-container-enter",n._animationState==="visible")("mat-snack-bar-container-exit",n._animationState==="hidden")("mat-snack-bar-container-animations-enabled",!n._animationsDisabled);},features:[_e],decls:6,vars:3,consts:[["label",""],[1,"mdc-snackbar__surface","mat-mdc-snackbar-surface"],[1,"mat-mdc-snack-bar-label"],["aria-hidden","true"],["cdkPortalOutlet",""]],template:function(e,n){e&1&&(Se(0,"div",1)(1,"div",2,0)(3,"div",3),Qr(4,Ut,0,0,"ng-template",4),je(),jy(5,"div"),je()()),e&2&&(mt(5),vt("aria-live",n._live)("role",n._role)("id",n._liveElementId));},dependencies:[Bi],styles:[`@keyframes _mat-snack-bar-enter {
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
`],encapsulation:2,changeDetection:1})}return i})(),Zt=new g("mat-snack-bar-default-options",{providedIn:"root",factory:()=>new m}),Gt=(()=>{class i{_live=f(Tx);_injector=f(k);_breakpointObserver=f(Bf);_parentSnackBar=f(i,{optional:true,skipSelf:true});_defaultConfig=f(Zt);_animationsDisabled=zt$1();_snackBarRefAtThisLevel=null;simpleSnackBarComponent=Et;snackBarContainerComponent=Kt;handsetCssClass="mat-mdc-snack-bar-handset";get _openedSnackBarRef(){let t=this._parentSnackBar;return t?t._openedSnackBarRef:this._snackBarRefAtThisLevel}set _openedSnackBarRef(t){this._parentSnackBar?this._parentSnackBar._openedSnackBarRef=t:this._snackBarRefAtThisLevel=t;}openFromComponent(t,e){return this._attach(t,e)}openFromTemplate(t,e){return this._attach(t,e)}open(t,e="",n){let a=E(E({},this._defaultConfig),n);return a.data={message:t,action:e},a.announcementMessage===t&&(a.announcementMessage=void 0),this.openFromComponent(this.simpleSnackBarComponent,a)}dismiss(){this._openedSnackBarRef&&this._openedSnackBarRef.dismiss();}ngOnDestroy(){this._snackBarRefAtThisLevel&&this._snackBarRefAtThisLevel.dismiss();}_attachSnackBarContainer(t,e){let n=e&&e.viewContainerRef&&e.viewContainerRef.injector,a=k.create({parent:n||this._injector,providers:[{provide:m,useValue:e}]}),o=new uo(this.snackBarContainerComponent,e.viewContainerRef,a),c=t.attach(o);return c.instance.snackBarConfig=e,c.instance}_attach(t,e){let n=E(E(E({},new m),this._defaultConfig),e),a=this._createOverlay(n),o=this._attachSnackBarContainer(a,n),c=new _(o,a);if(t instanceof Be){let u=new hr(t,null,{$implicit:n.data,snackBarRef:c});c.instance=o.attachTemplatePortal(u);}else {let u=this._createInjector(n,c),Pt=new uo(t,void 0,u),Lt=o.attachComponentPortal(Pt);c.instance=Lt.instance;}return this._breakpointObserver.observe(QW.HandsetPortrait).pipe(Mr(a.detachments())).subscribe(u=>{a.overlayElement.classList.toggle(this.handsetCssClass,u.matches);}),n.announcementMessage&&o._onAnnounce.subscribe(()=>{this._live.announce(n.announcementMessage,n.politeness);}),this._animateSnackBar(c,n),this._openedSnackBarRef=c,this._openedSnackBarRef}_animateSnackBar(t,e){t.afterDismissed().subscribe(()=>{this._openedSnackBarRef==t&&(this._openedSnackBarRef=null),e.announcementMessage&&this._live.clear();}),e.duration&&e.duration>0&&t.afterOpened().subscribe(()=>t._dismissAfter(e.duration)),this._openedSnackBarRef?(this._openedSnackBarRef.afterDismissed().subscribe(()=>{t.containerInstance.enter();}),this._openedSnackBarRef.dismiss()):t.containerInstance.enter();}_createOverlay(t){let e=new gr;e.direction=t.direction;let n=mo(this._injector),a=t.direction==="rtl",o=t.horizontalPosition==="left"||t.horizontalPosition==="start"&&!a||t.horizontalPosition==="end"&&a,c=!o&&t.horizontalPosition!=="center";return o?n.left("0"):c?n.right("0"):n.centerHorizontally(),t.verticalPosition==="top"?n.top("0"):n.bottom("0"),e.positionStrategy=n,e.disableAnimations=this._animationsDisabled,Vi(this._injector,e)}_createInjector(t,e){let n=t&&t.viewContainerRef&&t.viewContainerRef.injector;return k.create({parent:n||this._injector,providers:[{provide:_,useValue:e},{provide:wt,useValue:t.data}]})}static \u0275fac=function(e){return new(e||i)};static \u0275prov=w({token:i,factory:i.\u0275fac})}return i})();var ve=(()=>{class i{static \u0275fac=function(e){return new(e||i)};static \u0275mod=K({type:i});static \u0275inj=q({providers:[Gt],imports:[Hi,pr,Sb,Et,tt]})}return i})();var Tt=`[
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
`;var y="updateComponents",F="components",Jt="registerMockRules",Qt="mockRulesConfig",Wt="rules",Xt="id",Yt="children",Ot="mock_rules_container",jt=class i{destroyRef=f(Le);chatState=f(s);catalogManagement=f(Gn);startupResolution=f(r_,{optional:true});_activeDraft=le("");activeDraft=this._activeDraft.asReadonly();_draftInput=le("");constructor(){let r=this.startupResolution?.selectedRendererId$?ho(this.startupResolution.selectedRendererId$):Fn(null),t=ho(this.catalogManagement.activeCatalog);il(r,t).pipe(Vn(this.destroyRef)).subscribe(()=>{let e=this.catalogManagement.activeCatalog(),n=e&&(e.catalogId||e.$id)||"",a=this._activeDraft(),o=this.getCatalogIdFromDraft(a);(a===""||o!==n)&&this._activeDraft.set(this.getInitialDraft(n));}),ho(this._draftInput).pipe(xo(1),Bn(300),Ss(),Vn(this.destroyRef)).subscribe(e=>{this.syncLayoutToHistory(e);});}updateDraft(r){this._activeDraft.set(r),this._draftInput.set(r);}hydrateActiveDraft(){return this._activeDraft()}commitLayoutFromLlm(r){this._activeDraft.set(r);}flushDraft(){let r=this.catalogManagement.activeCatalog(),t=r&&(r.catalogId||r.$id)||"";this._activeDraft.set(this.getInitialDraft(t));}getInitialDraft(r){let t=this.startupResolution?.sharedA2uiPayload();if(t)return t;let e=this.startupResolution?.activeRenderer();return e?.samplePayload?e.samplePayload:r==="https://a2ui.org/specification/v0_9/basic_catalog.json"?Tt:r?m$1([{version:"v0.9",createSurface:{surfaceId:"sample-surface",catalogId:r,sendDataModel:true}}]):""}getCatalogIdFromDraft(r){let t=r.trim();if(!t)return null;try{let e=JSON.parse(t);if(Array.isArray(e))for(let n of e){let a=n;if(a?.createSurface?.catalogId)return a.createSurface.catalogId}else if(e&&typeof e=="object"){let n=e;if(n?.createSurface?.catalogId)return n.createSurface.catalogId}}catch{}return null}syncLayoutToHistory(r){let t=this.sanitizeLayout(r);if(!t)return;let e=this.chatState.chatHistory();if(e.length===0){this.chatState.setChatHistory([{role:"user",content:t}]);return}let n=e[e.length-1];if(n.role==="user"&&n.content.trim().startsWith("[")){let o=[...e];o[o.length-1]={role:"user",content:t},this.chatState.setChatHistory(o);}else this.chatState.updateChatHistory(o=>[...o,{role:"user",content:t}]);}sanitizeLayout(r){let t=r.trim();if(!t)return "";let e=l(t);if(e){let n=e.map(a=>a&&typeof a=="object"&&!Array.isArray(a)?this.sanitizeBlock(a):a).filter(a=>a!==null);return m$1(n)}return console.warn("[StateSync] Discarding malformed layout JSON during sanitization: not a valid JSON array"),""}sanitizeBlock(r){if(r[Jt]||r[Qt])return null;if(r[y]&&typeof r[y]=="object"&&r[y]!==null){let t=r[y];if(Array.isArray(t[F])){let e=t[F].filter(n=>n!==null&&typeof n=="object"&&!Array.isArray(n)?n[Xt]!==Ot:true);t[F]=e.map(n=>n!==null&&typeof n=="object"&&!Array.isArray(n)?this.sanitizeComponentObject(n):n);}}return r}sanitizeComponentObject(r){let t={};for(let[e,n]of Object.entries(r))e===Wt||/^mock/i.test(e)||(e===Yt&&Array.isArray(n)?t[e]=n.filter(a=>a!==Ot):n!==null&&typeof n=="object"&&!Array.isArray(n)?t[e]=this.sanitizeComponentObject(n):Array.isArray(n)?t[e]=n.map(a=>a!==null&&typeof a=="object"&&!Array.isArray(a)?this.sanitizeComponentObject(a):a):t[e]=n);return t}static \u0275fac=function(t){return new(t||i)};static \u0275prov=P({token:i,factory:i.\u0275fac,providedIn:"root"})};
export{Gt as G,jt as j,ve as v};