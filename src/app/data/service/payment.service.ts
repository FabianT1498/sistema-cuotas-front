import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';

import { IpcService } from '@app/service/ipc.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Payment, PaymentModel } from '../schema/payment';

import { handleError } from './handleError';
import { MonthlyPayment } from '@data/schema/monthly-payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentsUrl = 'api/payments'; // URL to web api

  constructor(private http: HttpClient, private ipc: IpcService) {}

  /* getAll(): Observable<Payment[]> {
    return this.http
      .get<Payment[]>(this.paymentsUrl)
      .pipe(catchError(handleError<MonthlyPayment[]>('getAll', [])));
  } */

  createPayment(data: Observable<any>): Observable<any> {
    return data.pipe(
      switchMap(req =>
        from(this.ipc.invoke('create-payment', ...Object.values(req))).pipe(
          map(res => {
            if (res.status === 0) {
              throw new Error(res.message);
            }
            return res;
          })
        )
      )
    );
  }
}
