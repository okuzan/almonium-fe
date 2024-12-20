import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PopupTemplateStateService {
  private drawerState = new Subject<{ visible: boolean; content?: any }>();
  drawerState$ = this.drawerState.asObservable();

  open(content: any) {
    this.drawerState.next({visible: true, content});
  }

  close() {
    this.drawerState.next({visible: false});
  }
}
