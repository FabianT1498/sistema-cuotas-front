import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, filter, tap } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { MonthlyPayment } from '../schema/monthly-payment';

@Injectable({
  providedIn: 'root'
})
export class MonthlyPaymentService {
  private url = 'api/monthlyPayments'; // URL to web api

  constructor(private http: HttpClient) {}

  getMonthlyPayments(neighborID: string): Observable<MonthlyPayment[]> {
    return this.http
      .get<MonthlyPayment[]>(`${this.url}/?neighborID=${neighborID}`)
      .pipe(
        catchError(this.handleError<MonthlyPayment[]>('getMonthlyPayments', []))
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
