import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, filter, tap } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Payment } from '../schema/payment';

import { handleError } from './handleError';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentsUrl = 'api/payments'; // URL to web api

  constructor(private http: HttpClient) {}

  getAll(): Observable<Payment[]> {
    return this.http
      .get<Payment[]>(this.paymentsUrl)
      .pipe(catchError(handleError<MonthlyPayment[]>('getAll', [])));
  }
}
