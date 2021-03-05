import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { Repair, RepairModel } from '../schema/repair';

import { IpcService } from '@app/service/ipc.service';

import { handleError } from './handleError';
import { RepairSearch } from '@data/interface/search-repairs';

@Injectable({
  providedIn: 'root'
})
export class RepairService {
  constructor(private ipc: IpcService) {}

  getRepairs(data: Observable<RepairSearch>): Observable<any> {
    return data.pipe(
      switchMap(req => {
        console.log(req);
        return from(this.ipc.invoke('get-repairs', ...Object.values(req))).pipe(
          map(res => {
            if (res.status === 0) {
              throw new Error(res.message);
            }
            console.log(res);
            return res;
          })
        );
      })
    );
  }

  getRepairsCount(): Observable<number> {
    return from(this.ipc.invoke('get-repairs-count')).pipe(
      map(res => {
        if (res.status === 0) {
          throw new Error(res.message);
        }
        return res.data;
      })
    );
  }

  createRepair(repair: RepairModel): Observable<any> {
    return from(this.ipc.invoke('create-repair', repair)).pipe(
      map(res => {
        if (res.status === 0) {
          throw res;
        }
        console.log(res);
        return res;
      })
    );
  }

  updateRepair(repair: RepairModel): Observable<any> {
    return from(this.ipc.invoke('update-repair', repair)).pipe(
      map(res => {
        if (res.status === 0) {
          throw res;
        }

        console.log(res);
        return res;
      })
    );
  }

  editRepair(repairID: string = '-1'): Observable<Repair> {
    return from(this.ipc.invoke('edit-repair', repairID)).pipe(
      map(res => {
        if (res.status === 0) {
          throw new Error(res.message);
        }

        return res.data;
      })
    );
  }

  /*
  getPaidRepairs(neighborID: string) {
    return this.http
      .get<Repair[]>(`${this.repairsUrl}/?neighborID=${neighborID}`)
      .pipe(catchError(handleError<Repair[]>('getPaidRepairs', [])));
  } */

  getUnpaidRepairs(neighborID: Observable<number>): Observable<Repair[]> {
    return neighborID.pipe(
      distinctUntilChanged(),
      switchMap(id => {
        return from(this.ipc.invoke('get-unpaid-repairs', id)).pipe(
          map(res => {
            if (res.status === 0) {
              throw new Error(res.message);
            }
            console.log(res.data);
            return res.data;
          })
        );
      })
    );
  }
}
