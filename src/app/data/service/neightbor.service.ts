import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Neighbor } from '../schema/neighbor';

@Injectable({
  providedIn: 'root'
})
export class NeighborService {
  private neighborsUrl = 'api/neighbors'; // URL to web api

  constructor(private http: HttpClient) {}

  getNeighbors(): Observable<Neighbor[]> {
    return this.http.get<Neighbor[]>(this.neighborsUrl).pipe(
        catchError(this.handleError<Neighbor[]>('getNeighbors', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
