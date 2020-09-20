import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, filter, tap } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Neighbor } from '../schema/neighbor';

import { handleError } from './handleError';

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
}
