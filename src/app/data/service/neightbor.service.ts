import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  filter
} from 'rxjs/operators';

import { IpcService } from '@app/service/ipc.service';

import { Neighbor, NeighborModel } from '../schema/neighbor';
import { NeighborSearch } from '@data/interface/search-neighbors';

@Injectable({
  providedIn: 'root'
})
export class NeighborService {
  constructor(private ipc: IpcService) {}

  getNeighbors(data: Observable<NeighborSearch>): Observable<any> {
    return data.pipe(
      switchMap(req => {
        console.log(req);
        return from(
          this.ipc.invoke('get-neighbors', ...Object.values(req))
        ).pipe(
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

  getNeighborsCount(): Observable<number> {
    return from(this.ipc.invoke('get-neighbors-count')).pipe(
      map(res => {
        if (res.status === 0) {
          throw new Error(res.message);
        }
        return res.data;
      })
    );
  }

  createNeighbor(neighbor: NeighborModel): Observable<any> {
    return from(this.ipc.invoke('create-neighbor', neighbor)).pipe(
      map(res => {
        if (res.status === 0) {
          throw res;
        }

        return res;
      })
    );
  }

  updateNeighbor(neighbor: NeighborModel): Observable<any> {
    return from(this.ipc.invoke('update-neighbor', neighbor)).pipe(
      map(res => {
        if (res.status === 0) {
          throw res;
        }

        return res;
      })
    );
  }

  editNeighbor(neighborID: string = '-1'): Observable<Neighbor> {
    return from(this.ipc.invoke('edit-neighbor', neighborID)).pipe(
      map(res => {
        if (res.status === 0) {
          throw new Error(res.message);
        }

        return res.data;
      })
    );
  }

  getNeighborByDNI(dni: Observable<string>): Observable<any> {
    return dni.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((query: string) => query && query.length > 7),
      switchMap(term => {
        return from(this.ipc.invoke('find-neighbor-by-dni', term)).pipe(
          map(res => {
            console.log(res);
            return res;
          })
        );
      })
    );
  }
}
