import{t as r}from"./chunk-DarCEgGK.js";import{B as Gr,Ea as ye,En as Xo,Fa as zi,Gt as Qt$1,Ii as qR,Ji as st,Jn as aJ,Ln as Zg,Nr as fe,Oa as yt$1,Oi as pe,Ri as qg,Si as nn$1,Sr as dp,St as Mze,Ui as rB,V as H,W as Hr,Wn as _c,Wt as Qi,Xn as ar,Yn as af,Yr as ht,Zn as b,_t as MA,br as df,ca as uu,dr as ci,en as Sr,g as Cs,hi as lu,hr as d$,ht as Ll,in as Te,ji as pu,jt as PA,ki as pp,kt as Or,ma as vw,na as u$,nn as TS,oi as jt$1,ot as Kn,pr as cse,qi as sf,qr as hp,ti as iJ,w as Ec,wa as xt$1,x as Dc,xa as xe,yt as Mi,z as Gg,zn as Zr}from"./chunk-BrFJ7DF6.js";var At=Math.pow(2,31)-1;var h=class{_overlayRef;instance;containerInstance;_afterDismissed=new fe;_afterOpened=new fe;_onAction=new fe;_durationTimeoutId;_dismissedByAction=!1;constructor(s,t){this._overlayRef=t,this.containerInstance=s,s._onExit.subscribe(()=>this._finishDismiss())}dismiss(){this._afterDismissed.closed||this.containerInstance.exit(),clearTimeout(this._durationTimeoutId)}dismissWithAction(){this._onAction.closed||(this._dismissedByAction=!0,this._onAction.next(),this._onAction.complete(),this.dismiss()),clearTimeout(this._durationTimeoutId)}closeWithAction(){this.dismissWithAction()}_dismissAfter(s){this._durationTimeoutId=setTimeout(()=>this.dismiss(),Math.min(s,At))}_open(){this._afterOpened.closed||(this._afterOpened.next(),this._afterOpened.complete())}_finishDismiss(){this._overlayRef.dispose(),this._onAction.closed||this._onAction.complete(),this._afterDismissed.next({dismissedByAction:this._dismissedByAction}),this._afterDismissed.complete(),this._dismissedByAction=!1}afterDismissed(){return this._afterDismissed}afterOpened(){return this.containerInstance._onEnter}onAction(){return this._onAction}};var _t=new H(`MatSnackBarData`);var p=class{politeness=`polite`;announcementMessage=``;viewContainerRef;duration=0;panelClass;direction;data=null;horizontalPosition=`center`;verticalPosition=`bottom`};var Mt=(()=>{class e{static ɵfac=function(n){return new(n||e)};static ɵdir=xt$1({type:e,selectors:[[``,`matSnackBarLabel`,``]],hostAttrs:[1,`mat-mdc-snack-bar-label`,`mdc-snackbar__label`]})}return e})();var wt=(()=>{class e{static ɵfac=function(n){return new(n||e)};static ɵdir=xt$1({type:e,selectors:[[``,`matSnackBarActions`,``]],hostAttrs:[1,`mat-mdc-snack-bar-actions`,`mdc-snackbar__actions`]})}return e})();var Bt=(()=>{class e{static ɵfac=function(n){return new(n||e)};static ɵdir=xt$1({type:e,selectors:[[``,`matSnackBarAction`,``]],hostAttrs:[1,`mat-mdc-snack-bar-action`,`mdc-snackbar__action`]})}return e})();var kt=(()=>{class e{snackBarRef=b(h);data=b(_t);action(){this.snackBarRef.dismissWithAction()}get hasAction(){return!!this.data.action}static ɵfac=function(n){return new(n||e)};static ɵcmp=(function(){function t(n,a){if(n&1){let i=iJ();Sr(0,`div`,1)(1,`button`,2),Gg(`click`,function(){MA(i);let o=aJ();return PA(o.action())}),zi(2),Zr()()}if(n&2){let i=aJ();Xo(2),vw(` `,i.data.action,` `)}}return Qt$1({type:e,selectors:[[`simple-snack-bar`]],hostAttrs:[1,`mat-mdc-simple-snack-bar`],exportAs:[`matSnackBar`],decls:3,vars:2,consts:[[`matSnackBarLabel`,``],[`matSnackBarActions`,``],[`matButton`,``,`matSnackBarAction`,``,3,`click`]],template:function(a,i){a&1&&(Sr(0,`div`,0),zi(1),Zr(),sf(2,t,3,1,`div`,1)),a&2&&(Xo(),vw(` `,i.data.message,`
`),Xo(),af(i.hasAction?2:-1))},dependencies:[u$,Mt,wt,Bt],styles:[`.mat-mdc-simple-snack-bar {
  display: flex;
}
.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-label {
  max-height: 50vh;
  overflow: auto;
}
`],encapsulation:2})})()}return e})();var T=`_mat-snack-bar-enter`;var D=`_mat-snack-bar-exit`;var Ct=(()=>{class e extends uu{_ngZone=b(Te);_elementRef=b(st);_changeDetectorRef=b(rB);_platform=b(jt$1);_animationsDisabled=Qi();snackBarConfig=b(p);_document=b(ye);_trackedModals=new Set;_enterFallback;_exitFallback;_injector=b(xe);_announceDelay=150;_announceTimeoutId;_destroyed=!1;_portalOutlet;_onAnnounce=new fe;_onExit=new fe;_onEnter=new fe;_animationState=`void`;_live;_label;_role;_liveElementId=b(ci).getId(`mat-snack-bar-container-live-`);constructor(){super();let t=this.snackBarConfig;t.politeness===`assertive`&&!t.announcementMessage?this._live=`assertive`:t.politeness===`off`?this._live=`off`:this._live=`polite`,this._platform.FIREFOX&&(this._live===`polite`&&(this._role=`status`),this._live===`assertive`&&(this._role=`alert`))}attachComponentPortal(t){this._assertNotAttached();let n=this._portalOutlet.attachComponentPortal(t);return this._afterPortalAttached(),n}attachTemplatePortal(t){this._assertNotAttached();let n=this._portalOutlet.attachTemplatePortal(t);return this._afterPortalAttached(),n}attachDomPortal=t=>{this._assertNotAttached();let n=this._portalOutlet.attachDomPortal(t);return this._afterPortalAttached(),n};onAnimationEnd(t){t===D?this._completeExit():t===T&&(clearTimeout(this._enterFallback),this._ngZone.run(()=>{this._onEnter.next(),this._onEnter.complete()}))}enter(){this._destroyed||(this._animationState=`visible`,this._changeDetectorRef.markForCheck(),this._changeDetectorRef.detectChanges(),this._screenReaderAnnounce(),this._animationsDisabled?Mi(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(T)))},{injector:this._injector}):(clearTimeout(this._enterFallback),this._enterFallback=setTimeout(()=>{this._elementRef.nativeElement.classList.add(`mat-snack-bar-fallback-visible`),this.onAnimationEnd(T)},200)))}exit(){return this._destroyed?nn$1(void 0):(this._ngZone.run(()=>{this._animationState=`hidden`,this._changeDetectorRef.markForCheck(),this._elementRef.nativeElement.setAttribute(`mat-exit`,``),clearTimeout(this._announceTimeoutId),this._animationsDisabled?Mi(()=>{this._ngZone.run(()=>queueMicrotask(()=>this.onAnimationEnd(D)))},{injector:this._injector}):(clearTimeout(this._exitFallback),this._exitFallback=setTimeout(()=>this.onAnimationEnd(D),200))}),this._onExit)}ngOnDestroy(){this._destroyed=!0,this._clearFromModals(),this._completeExit()}_completeExit(){clearTimeout(this._exitFallback),queueMicrotask(()=>{this._onExit.next(),this._onExit.complete()})}_afterPortalAttached(){let t=this._elementRef.nativeElement,n=this.snackBarConfig.panelClass;n&&(Array.isArray(n)?n.forEach(r=>t.classList.add(r)):t.classList.add(n)),this._exposeToModals();let a=this._label.nativeElement,i=`mdc-snackbar__label`;a.classList.toggle(i,!a.querySelector(`.${i}`))}_exposeToModals(){let t=this._liveElementId,n=this._document.querySelectorAll(`body > .cdk-overlay-container [aria-modal="true"]`);for(let a=0;a<n.length;a++){let i=n[a],r=i.getAttribute(`aria-owns`);this._trackedModals.add(i),r?r.indexOf(t)===-1&&i.setAttribute(`aria-owns`,r+` `+t):i.setAttribute(`aria-owns`,t)}}_clearFromModals(){this._trackedModals.forEach(t=>{let n=t.getAttribute(`aria-owns`);if(n){let a=n.replace(this._liveElementId,``).trim();a.length>0?t.setAttribute(`aria-owns`,a):t.removeAttribute(`aria-owns`)}}),this._trackedModals.clear()}_assertNotAttached(){this._portalOutlet.hasAttached()}_screenReaderAnnounce(){this._announceTimeoutId||this._ngZone.runOutsideAngular(()=>{this._announceTimeoutId=setTimeout(()=>{if(this._destroyed)return;let t=this._elementRef.nativeElement,n=t.querySelector(`[aria-hidden]`),a=t.querySelector(`[aria-live]`);if(n&&a){let i=null;this._platform.isBrowser&&document.activeElement instanceof HTMLElement&&n.contains(document.activeElement)&&(i=document.activeElement),n.removeAttribute(`aria-hidden`),a.appendChild(n),i?.focus(),this._onAnnounce.next(),this._onAnnounce.complete()}},this._announceDelay)})}static ɵfac=function(n){return new(n||e)};static ɵcmp=(function(){let t=[`label`];function n(a,i){}return Qt$1({type:e,selectors:[[`mat-snack-bar-container`]],viewQuery:function(i,r){if(i&1&&df(dp,7)(t,7),i&2){let o;Zg(o=qg())&&(r._portalOutlet=o.first),Zg(o=qg())&&(r._label=o.first)}},hostAttrs:[1,`mdc-snackbar`,`mat-mdc-snack-bar-container`],hostVars:6,hostBindings:function(i,r){i&1&&Gg(`animationend`,function(l){return r.onAnimationEnd(l.animationName)})(`animationcancel`,function(l){return r.onAnimationEnd(l.animationName)}),i&2&&ar(`mat-snack-bar-container-enter`,r._animationState===`visible`)(`mat-snack-bar-container-exit`,r._animationState===`hidden`)(`mat-snack-bar-container-animations-enabled`,!r._animationsDisabled)},features:[Kn],decls:6,vars:3,consts:[[`label`,``],[1,`mdc-snackbar__surface`,`mat-mdc-snackbar-surface`],[1,`mat-mdc-snack-bar-label`],[`aria-hidden`,`true`],[`cdkPortalOutlet`,``]],template:function(i,r){i&1&&(Sr(0,`div`,1)(1,`div`,2,0)(3,`div`,3),Ll(4,n,0,0,`ng-template`,4),Zr(),qR(5,`div`),Zr()()),i&2&&(Xo(5),Gr(`aria-live`,r._live)(`role`,r._role)(`id`,r._liveElementId))},dependencies:[dp],styles:[`@keyframes _mat-snack-bar-enter {
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
  color: var(--%NS%mat-snack-bar-supporting-text-color, var(--%NS%mat-sys-inverse-on-surface));
  border-radius: var(--%NS%mat-snack-bar-container-shape, var(--%NS%mat-sys-corner-extra-small));
  background-color: var(--%NS%mat-snack-bar-container-color, var(--%NS%mat-sys-inverse-surface));
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
  font-family: var(--%NS%mat-snack-bar-supporting-text-font, var(--%NS%mat-sys-body-medium-font));
  font-size: var(--%NS%mat-snack-bar-supporting-text-size, var(--%NS%mat-sys-body-medium-size));
  font-weight: var(--%NS%mat-snack-bar-supporting-text-weight, var(--%NS%mat-sys-body-medium-weight));
  line-height: var(--%NS%mat-snack-bar-supporting-text-line-height, var(--%NS%mat-sys-body-medium-line-height));
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
  color: var(--%NS%mat-snack-bar-button-color, var(--%NS%mat-sys-inverse-primary));
}
.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled) {
  --%NS%mat-button-text-state-layer-color: currentColor;
  --%NS%mat-button-text-ripple-color: currentColor;
}
.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled) .mat-ripple-element {
  opacity: 0.1;
}
`],encapsulation:2,changeDetection:1})})()}return e})();var It=new H(`mat-snack-bar-default-options`,{providedIn:`root`,factory:()=>new p});var Tt=(()=>{class e{_live=b(cse);_injector=b(xe);_breakpointObserver=b(TS);_parentSnackBar=b(e,{optional:!0,skipSelf:!0});_defaultConfig=b(It);_animationsDisabled=Qi();_snackBarRefAtThisLevel=null;simpleSnackBarComponent=kt;snackBarContainerComponent=Ct;handsetCssClass=`mat-mdc-snack-bar-handset`;get _openedSnackBarRef(){let t=this._parentSnackBar;return t?t._openedSnackBarRef:this._snackBarRefAtThisLevel}set _openedSnackBarRef(t){this._parentSnackBar?this._parentSnackBar._openedSnackBarRef=t:this._snackBarRefAtThisLevel=t}openFromComponent(t,n){return this._attach(t,n)}openFromTemplate(t,n){return this._attach(t,n)}open(t,n=``,a){let i=r(r({},this._defaultConfig),a);return i.data={message:t,action:n},i.announcementMessage===t&&(i.announcementMessage=void 0),this.openFromComponent(this.simpleSnackBarComponent,i)}dismiss(){this._openedSnackBarRef&&this._openedSnackBarRef.dismiss()}ngOnDestroy(){this._snackBarRefAtThisLevel&&this._snackBarRefAtThisLevel.dismiss()}_attachSnackBarContainer(t,n){let a=n&&n.viewContainerRef&&n.viewContainerRef.injector,i=xe.create({parent:a||this._injector,providers:[{provide:p,useValue:n}]}),r=new lu(this.snackBarContainerComponent,n.viewContainerRef,i),o=t.attach(r);return o.instance.snackBarConfig=n,o.instance}_attach(t,n){let a=r(r(r({},new p),this._defaultConfig),n),i=this._createOverlay(a),r$1=this._attachSnackBarContainer(i,a),o=new h(r$1,i);if(t instanceof Hr){let l=new _c(t,null,{$implicit:a.data,snackBarRef:o});o.instance=r$1.attachTemplatePortal(l)}else{let l=this._createInjector(a,o),St=new lu(t,void 0,l);o.instance=r$1.attachComponentPortal(St).instance}return this._breakpointObserver.observe(Mze.HandsetPortrait).pipe(Cs(i.detachments())).subscribe(l=>{i.overlayElement.classList.toggle(this.handsetCssClass,l.matches)}),a.announcementMessage&&r$1._onAnnounce.subscribe(()=>{this._live.announce(a.announcementMessage,a.politeness)}),this._animateSnackBar(o,a),this._openedSnackBarRef=o,this._openedSnackBarRef}_animateSnackBar(t,n){t.afterDismissed().subscribe(()=>{this._openedSnackBarRef==t&&(this._openedSnackBarRef=null),n.announcementMessage&&this._live.clear()}),n.duration&&n.duration>0&&t.afterOpened().subscribe(()=>t._dismissAfter(n.duration)),this._openedSnackBarRef?(this._openedSnackBarRef.afterDismissed().subscribe(()=>{t.containerInstance.enter()}),this._openedSnackBarRef.dismiss()):t.containerInstance.enter()}_createOverlay(t){let n=new Dc;n.direction=t.direction;let a=pu(this._injector),i=t.direction===`rtl`,r=t.horizontalPosition===`left`||t.horizontalPosition===`start`&&!i||t.horizontalPosition===`end`&&i,o=!r&&t.horizontalPosition!==`center`;return r?a.left(`0`):o?a.right(`0`):a.centerHorizontally(),t.verticalPosition===`top`?a.top(`0`):a.bottom(`0`),n.positionStrategy=a,n.disableAnimations=this._animationsDisabled,pp(this._injector,n)}_createInjector(t,n){let a=t&&t.viewContainerRef&&t.viewContainerRef.injector;return xe.create({parent:a||this._injector,providers:[{provide:h,useValue:n},{provide:_t,useValue:t.data}]})}static ɵfac=function(n){return new(n||e)};static ɵprov=pe({token:e,factory:e.ɵfac})}return e})();var Sn=(()=>{class e{static ɵfac=function(n){return new(n||e)};static ɵmod=yt$1({type:e});static ɵinj=ht({providers:[Tt],imports:[hp,Ec,d$,kt,Or]})}return e})();var gt=`application/octet-stream`;var vt=`image/`;var xt=[`bmp`,`gif`,`ico`,`jpeg`,`jpg`,`png`,`svg`,`webp`];var Dt=[`application/pdf`];var Rt=[`pdf`];var Nt=[`application/msword`,`application/rtf`,`application/vnd.oasis.opendocument.text`,`application/vnd.openxmlformats-officedocument.wordprocessingml.document`];var Ot=[`doc`,`docx`,`odt`,`rtf`];var Pt=[`application/vnd.ms-excel`,`application/vnd.oasis.opendocument.spreadsheet`,`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`];var Ft=[`ods`,`xls`,`xlsx`];var jt=`audio/`;var zt=[`aac`,`flac`,`m4a`,`mp3`,`ogg`,`wav`];var Lt=`video/`;var Vt=[`avi`,`mkv`,`mov`,`mp4`,`webm`];var Xt=[`application/json`,`application/xml`,`text/html`,`text/xml`];var Ut=[`css`,`html`,`java`,`js`,`json`,`py`,`ts`,`xml`,`yaml`,`yml`];var Ht=[`application/gzip`,`application/x-tar`,`application/zip`];var qt=[`7z`,`gz`,`rar`,`tar`,`zip`];var Wt=`text/`;var Yt=[`csv`,`log`,`md`,`txt`];var Zt=new Map([[`bmp`,`image/bmp`],[`csv`,`text/csv`],[`doc`,`application/msword`],[`docx`,`application/vnd.openxmlformats-officedocument.wordprocessingml.document`],[`gif`,`image/gif`],[`htm`,`text/html`],[`html`,`text/html`],[`ico`,`image/x-icon`],[`jpeg`,`image/jpeg`],[`jpg`,`image/jpeg`],[`json`,`application/json`],[`md`,`text/markdown`],[`mp3`,`audio/mpeg`],[`mp4`,`video/mp4`],[`pdf`,`application/pdf`],[`png`,`image/png`],[`svg`,`image/svg+xml`],[`txt`,`text/plain`],[`wav`,`audio/wav`],[`webm`,`video/webm`],[`webp`,`image/webp`],[`xml`,`application/xml`],[`zip`,`application/zip`]]);var yt=`description`;var Gt=[{icon:`image`,mimePrefixes:[vt],extensions:xt},{icon:`picture_as_pdf`,mimeTypes:Dt,extensions:Rt},{icon:`article`,mimeTypes:Nt,extensions:Ot},{icon:`table_chart`,mimeTypes:Pt,extensions:Ft},{icon:`audio_file`,mimePrefixes:[jt],extensions:zt},{icon:`video_file`,mimePrefixes:[Lt],extensions:Vt},{icon:`code`,mimeTypes:Xt,extensions:Ut},{icon:`folder_zip`,mimeTypes:Ht,extensions:qt},{icon:yt,mimePrefixes:[Wt],extensions:Yt}];var Qt=/^data:[^,]*;base64,/i;var $t=`InvalidCharacterError`;var Kt=`download`;function Jt(e){return typeof e==`object`&&e!==null&&e.name===$t}function R(e){let s=(e||``).trim(),t=s.lastIndexOf(`.`);return t<=0||t===s.length-1?``:s.slice(t+1).toLowerCase()}function N(e){return(e||``).trim().toLowerCase()}function tn(e,s,t){return s&&(e.mimeTypes?.includes(s)||e.mimePrefixes?.some(n=>s.startsWith(n)))?!0:!!t&&!!e.extensions?.includes(t)}function Mn(e,s){let t=N(s);if(t&&t!==gt)return t;let n=R(e);return Zt.get(n)??gt}function wn(e,s){let t=N(e),n=R(s);return Gt.find(i=>tn(i,t,n))?.icon??yt}function Bn(e,s){return N(e).startsWith(vt)?!0:xt.includes(R(s))}function nn(e){return(e||``).replace(Qt,``)}function Cn(e){let s=nn(e).trim();if(!s)return null;let t;try{t=atob(s)}catch(a){if(!Jt(a))throw a;return null}let n=new Uint8Array(t.length);for(let a=0;a<t.length;a++)n[a]=t.charCodeAt(a);return n}function In(e){return((e||``).split(/[\\/]/).pop()??``).replace(/[\u0000-\u001f\u007f]/g,``).trim()||Kt}export{Sn as a,Mn as i,Cn as n,Tt as o,In as r,wn as s,Bn as t};