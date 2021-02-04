import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  finalize,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';

import { PaymentService } from '@data/service/payment.service';
import { Payment } from '@data/schema/payment';
import { PaymentSearch } from '@data/interface/search-payments';

export class PaymentsDataSource implements DataSource<Payment> {
  private paymentsSubject = new BehaviorSubject<Payment[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private signal$ = new Subject<any>();

  public loading$ = this.loadingSubject.asObservable();

  constructor(private paymentService: PaymentService) {}

  connect(collectionViewer: CollectionViewer): Observable<Payment[]> {
    return this.paymentsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.paymentsSubject.complete();
    this.loadingSubject.complete();
    this.signal$.next();
    this.signal$.complete();
  }

  loadPayments(searchData: Observable<PaymentSearch>) {
    this.paymentService
      .getPayments(searchData)
      .pipe(
        takeUntil(this.signal$),
        catchError(() => of([])),
        tap((next: any) => {
          this.loadingSubject.next(true);
        })
      )
      .subscribe(res => {
        console.log(res);
        this.loadingSubject.next(false);
        this.paymentsSubject.next(res.data);
      });
  }
}
