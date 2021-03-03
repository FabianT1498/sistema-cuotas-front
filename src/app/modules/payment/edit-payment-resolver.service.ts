import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PaymentService } from '@data/service/payment.service';
import { Payment } from '@data/schema/payment';

@Injectable({
  providedIn: 'root'
})
export class EditPaymentResolver implements Resolve<any> {
  constructor(private paymentService: PaymentService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Payment> {
    return this.paymentService
      .editPayment(route.paramMap.get('id'))
      .pipe(map(res => res));
  }
}
