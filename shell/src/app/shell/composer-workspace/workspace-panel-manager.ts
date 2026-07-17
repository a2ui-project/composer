import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class WorkspacePanelManager {
  private openPanelSubject = new Subject<string>();
  openPanel$ = this.openPanelSubject.asObservable();

  openPanel(panelId: string) {
    this.openPanelSubject.next(panelId);
  }
}
