import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';

/** SCHEMAS */
import { Payment } from '@data/schema/payment';

/** SERVICES */
import { DataService } from '@app/service/data.service';
import { BankService } from '@data/service/bank.service';
import { Bank } from '@data/schema/bank';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaymentFormComponent implements OnInit, OnDestroy {
  /** FORM GROUPS */

  @Input()
  paymentGroup: FormGroup;

  private signal$ = new Subject();

  @Input()
  public payment?: Payment;

  /** Data */
  paymentMethods: Array<any>;
  banks: Bank[];

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private bankService: BankService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadInitialData();
  }

  private buildForm(): void {
    console.log(this.payment);

    this.paymentGroup = this.createPaymentGroup();

    if (this.payment && this.payment.paymentMethod !== 'Efectivo') {
      this.addElectronicPaymentFields();
    }
  }

  private loadInitialData() {
    this.dataService
      .getData('paymentMethods')
      .pipe(take(1))
      .subscribe(next => (this.paymentMethods = next));

    this.bankService
      .getBanks()
      .pipe(take(1))
      .subscribe(next => (this.banks = next));
  }

  private createPaymentGroup(): FormGroup {
    return this.formBuilder.group({
      id: [this.payment ? this.payment.id : -1, [Validators.required]],
      paymentDate: [
        this.payment ? this.payment.paymentDate : '',
        [Validators.required]
      ],
      paymentMethod: [
        this.payment ? this.payment.paymentMethod : 'Efectivo',
        [Validators.required]
      ],
      amount: [
        this.payment ? this.payment.amount : 0,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]+(.[0-9]+)?$')
        ]
      ]
    });
  }

  get f() {
    return this.paymentGroup.controls;
  }

  get isElectronicPayment(): boolean {
    return this.paymentGroup.get('paymentMethod').value !== 'Efectivo';
  }

  paymentMethodChange($event) {
    if (this.isElectronicPayment) {
      this.addElectronicPaymentFields();
    } else {
      this.removeElectronicPaymentFields();
    }
  }

  private addElectronicPaymentFields() {
    this.paymentGroup.addControl(
      'bank',
      new FormControl(this.payment ? this.payment.bank : '', [
        Validators.required
      ])
    );

    this.paymentGroup.addControl(
      'referenceNumber',
      new FormControl(this.payment ? this.payment.referenceNumber : '', [
        Validators.required,
        Validators.pattern('^([0-9]|[A-Z]|[a-z])+$')
      ])
    );
  }

  private removeElectronicPaymentFields() {
    this.paymentGroup.removeControl('bank');
    this.paymentGroup.removeControl('referenceNumber');
  }

  ngOnDestroy(): void {
    // Signal all streams to complete
    this.signal$.next();
    this.signal$.complete();
  }
}
