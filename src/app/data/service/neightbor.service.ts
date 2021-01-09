import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  filter
} from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Neighbor } from '../schema/neighbor';

import { handleError } from './handleError';
import { TOUCH_BUFFER_MS } from '@angular/cdk/a11y';

@Injectable({
  providedIn: 'root'
})
export class NeighborService {
  private neighborsUrl = 'api/neighbors'; // URL to web api

  constructor(private http: HttpClient) {}

  getAll(): Observable<Neighbor[]> {
    return this.http
      .get<Neighbor[]>(this.neighborsUrl)
      .pipe(catchError(handleError<Neighbor[]>('getAll', [])));
  }

  getNeighbor(dni: Observable<string>): Observable<Neighbor> {
    return dni.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term =>
        this.http
          .get<Neighbor>(`${this.neighborsUrl}/?dni=^${term}`)
          .pipe(map(neighbor => neighbor))
      )
    );
  }
}
