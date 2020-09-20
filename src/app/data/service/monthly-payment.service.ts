import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, filter, tap } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { MonthlyPayment } from '../schema/monthly-payment';

import { handleError } from './handleError';

@Injectable({
  providedIn: 'root'
})
export class MonthlyPaymentService {
  private monthlyPaymentUrl = 'api/monthlyPayments'; // URL to web api

  constructor(private http: HttpClient) {}

  getAll(): Observable<MonthlyPayment[]> {
    return this.http
      .get<MonthlyPayment[]>(this.monthlyPaymentUrl)
      .pipe(catchError(handleError<MonthlyPayment[]>('getAll', [])));
  }

  getUnpaidMonthlyPayments(neighborID: string): Observable<MonthlyPayment[]> {
    return this.http
      .get<MonthlyPayment[]>(
        `${this.monthlyPaymentUrl}/?neighborID=${neighborID}`
      )
      .pipe(
        catchError(
          handleError<MonthlyPayment[]>('getUnpaidMonthlyPayments', [])
        )
      );
  }

  getPaidMonthlyPayments(neighborID: string): Observable<MonthlyPayment[]> {
    return this.http
      .get<MonthlyPayment[]>(
        `${this.monthlyPaymentUrl}/?neighborID=${neighborID}`
      )
      .pipe(
        catchError(handleError<MonthlyPayment[]>('getPaidMonthlyPayments', []))
      );
  }
}
