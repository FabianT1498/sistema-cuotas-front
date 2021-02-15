import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClearSelectTableService {
  clearTable$ = new BehaviorSubject<boolean>(false);

  clearTable(opt: boolean) {
    this.clearTable$.next(opt);
  }
}
