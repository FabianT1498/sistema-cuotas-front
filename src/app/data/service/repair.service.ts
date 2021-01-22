import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Repair } from '../schema/repair';

import { handleError } from './handleError';

@Injectable({
  providedIn: 'root'
})
export class RepairService {
  private repairsUrl = 'api/repairs'; // URL to web api

  constructor(private http: HttpClient) {}

  getAll(): Observable<Repair[]> {
    return this.http
      .get<Repair[]>(this.repairsUrl)
      .pipe(catchError(handleError<Repair[]>('getAll', [])));
  }

  getPaidRepairs(neighborID: string) {
    return this.http
      .get<Repair[]>(`${this.repairsUrl}/?neighborID=${neighborID}`)
      .pipe(catchError(handleError<Repair[]>('getPaidRepairs', [])));
  }

  getUnpaidRepairs(neighborID: Observable<number>): Observable<Repair[]> {
    /* return this.http
      .get<Repair[]>(`${this.repairsUrl}/?neighborID=${neighborID}`)
      .pipe(catchError(handleError<Repair[]>('getUnpaidRepairs', []))); */
    return neighborID.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(id =>
        this.http.get<Repair[]>(this.repairsUrl).pipe(
          map((monthlyPayment, index) => {
            console.log(`${index}: ${monthlyPayment}`);
            return monthlyPayment;
          })
        )
      )
    );
  }
}
