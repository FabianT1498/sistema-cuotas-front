import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  filter
} from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { IpcService } from '@app/service/ipc.service';

import { Neighbor } from '../schema/neighbor';

import { handleError } from './handleError';

@Injectable({
  providedIn: 'root'
})
export class NeighborService {
  private neighborsUrl = 'api/neighbors'; // URL to web api

  constructor(private http: HttpClient, private ipc: IpcService) {}

  getAll(): Observable<Neighbor[]> {
    return this.http
      .get<Neighbor[]>(this.neighborsUrl)
      .pipe(catchError(handleError<Neighbor[]>('getAll', [])));
  }

  getNeighborByDNI(dni: Observable<string>): Observable<any> {
    return dni.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((query: string) => query && query.length > 7),
      switchMap(term => {
        return from(this.ipc.invoke('find-neighbor-by-dni', term)).pipe(
          map(res => res)
        );
      })
    );
  }
}
