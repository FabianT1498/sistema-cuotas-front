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

@Injectable({
  providedIn: 'root'
})
export class PaymentResolver implements Resolve<number> {
  constructor(private paymentService: PaymentService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<number> {
    return this.paymentService.getPaymentsCount().pipe(map(res => res));
  }
}
