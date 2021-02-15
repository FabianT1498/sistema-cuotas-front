import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import {
  catchError,
  switchMap,
  map,
  distinctUntilChanged
} from 'rxjs/operators';

import { MonthlyPayment } from '../schema/monthly-payment';

import { handleError } from './handleError';
import { IpcService } from '@app/service/ipc.service';

@Injectable({
  providedIn: 'root'
})
export class MonthlyPaymentService {
  private monthlyPaymentUrl = 'api/monthlyPayments'; // URL to web api

  constructor(private ipc: IpcService) {}

  getUnpaidMonthlyPayments(
    neighborID: Observable<number>
  ): Observable<MonthlyPayment[]> {
    return neighborID.pipe(
      distinctUntilChanged(),
      switchMap(id => {
        return from(this.ipc.invoke('get-unpaid-monthly-payments', id)).pipe(
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

  getMonthlyPaymentCost(): Observable<number> {
    return from(this.ipc.invoke('get-monthly-payment-cost')).pipe(
      map(res => {
        if (res.status === 0) {
          throw new Error(res.message);
        }
        console.log(res.data);
        return res.data;
      })
    );
  }

  /* getPaidMonthlyPayments(neighborID: string): Observable<MonthlyPayment[]> {
    return this.http
      .get<MonthlyPayment[]>(
        `${this.monthlyPaymentUrl}/?neighborID=${neighborID}`
      )
      .pipe(
        catchError(handleError<MonthlyPayment[]>('getPaidMonthlyPayments', []))
      );
  } */
}
