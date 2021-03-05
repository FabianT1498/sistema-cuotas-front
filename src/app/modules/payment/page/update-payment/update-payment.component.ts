import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

import { catchError, finalize, take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

// CHILD COMPONENTS
import { PaymentFormComponent } from '@modules/payment/component/payment-form/payment-form.component';

/** SERVICES */
import { DataService } from '@app/service/data.service';
import { NeighborService } from '@data/service/neightbor.service';
import { MonthlyPaymentService } from '@data/service/monthly-payment.service';
import { RepairService } from '@data/service/repair.service';
import { ContributionService } from '@data/service/contribution.service';
import { PaymentService } from '@data/service/payment.service';

/* SHARED SERVICES */
import { ClearSelectTableService } from '@shared/service/clear-select-table.service';

/** SCHEMAS */
import { MonthlyPayment } from '@data/schema/monthly-payment';
import { Repair } from '@data/schema/repair';
import { Payment, PaymentModel } from '@data/schema/payment';
import { Contribution } from '@data/schema/contribution';

@Component({
  selector: 'app-update-payment',
  templateUrl: './update-payment.component.html',
  styleUrls: ['./update-payment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdatePaymentComponent
  implements OnInit, OnDestroy, AfterViewInit {
  /** Signal to unsubscribe from all observables */
  private signal$: Subject<any>;

  isLoading: boolean;

  /** Neighbor form section */
  neighborID$: BehaviorSubject<number>;

  /** FORM GROUPS */
  paymentForm: FormGroup;
  paymentFormArr: FormArray;
  neighborGroup: FormGroup;
  paymentGroup: FormGroup;

  /** Observable data */
  monthlyPayments$: Observable<MonthlyPayment[]>;
  repairs$: Observable<Repair[]>;
  contributions$: Observable<Contribution[]>;

  /** Monthly Payments component Outputs */
  monthlyPaymentsTotalCost: number;
  monthlyPaymentCost: number;
  monthlyPaymentsSelected: MonthlyPayment[];

  /** Repairs component Outputs */
  repairsTotalCost: number;
  repairsSelected: Repair[];

  /** Contributions component Outputs */
  contributionsTotalAmount: number;
  contributionsSelected: Contribution[];

  /** Summary component Input */
  summaryItems: any[];
  months: string[];

  /** Remaining Amount */
  remainingAmount: number;

  /* New payment subject */
  newRecord$: Subject<PaymentModel>;

  paymentData: any;

  @ViewChild(PaymentFormComponent) paymentFormChild: PaymentFormComponent;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private neighborService: NeighborService,
    private monthlyPaymentService: MonthlyPaymentService,
    private repairService: RepairService,
    private contributionService: ContributionService,
    private paymentService: PaymentService,
    private clearSelectTableService: ClearSelectTableService
  ) {}

  ngOnInit() {
    this.init();
    this.buildForm();
    this.loadInitialData();
    this.setupFormListeners();
  }

  ngAfterViewInit() {
    console.log(this.paymentFormChild.paymentGroup);
    this.paymentFormArr.setControl(1, this.paymentFormChild.paymentGroup);
    this.paymentGroup = this.paymentFormChild.paymentGroup;
  }

  private init() {
    this.isLoading = false;

    this.monthlyPaymentsTotalCost = 0;
    this.monthlyPaymentCost = 0;
    this.repairsTotalCost = 0;
    this.contributionsTotalAmount = 0;

    this.monthlyPaymentsSelected = [];
    this.repairsSelected = [];
    this.contributionsSelected = [];

    this.remainingAmount = 0;
    this.summaryItems = [];

    this.paymentData = this.route.snapshot.data['paymentData'];

    if (!this.paymentData) {
      this.router.navigate(['/pagos']);
    }
  }

  private buildForm(): void {
    this.paymentGroup = this.formBuilder.group({});

    this.paymentFormArr = this.formBuilder.array([
      this.createNeighborGroup(),
      this.paymentGroup
    ]);

    this.neighborGroup = this.paymentFormArr.get([0]) as FormGroup;

    this.paymentForm = this.formBuilder.group({
      paymentFormArr: this.paymentFormArr
    });
  }

  private loadInitialData() {
    this.dataService
      .getData('months')
      .pipe(take(1))
      .subscribe(val => (this.months = val));
  }

  private setupFormListeners() {
    this.signal$ = new Subject();
    this.newRecord$ = new Subject<PaymentModel>();

    this.neighborID$ = new BehaviorSubject<number>(
      this.paymentData ? this.paymentData.neighbor.id : -1
    );

    this.monthlyPayments$ = this.monthlyPaymentService.getUnpaidMonthlyPayments(
      this.neighborID$
    );

    this.repairs$ = this.repairService.getUnpaidRepairs(this.neighborID$);

    this.contributions$ = this.contributionService.getAll();

    this.paymentService
      .updatePayment(this.newRecord$)
      .pipe(
        takeUntil(this.signal$),
        catchError(err => {
          console.log(err.message);
          return of(err);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe(res => {
        console.log(res);

        if (res.status === 1) {
          this.router.navigate(['/pagos']);
        }
      });
  }

  private createNeighborGroup(): FormGroup {
    return this.formBuilder.group({
      neighborDNI: [
        {
          value: this.paymentData ? this.paymentData.neighbor.dni : '',
          disabled: true
        },
        [
          Validators.required,
          Validators.pattern('^[VE|ve]-[0-9]+'),
          Validators.minLength(7),
          Validators.maxLength(10)
        ]
      ],
      neighborID: [
        this.paymentData ? this.paymentData.neighbor.id : -1,
        [Validators.required]
      ]
    });
  }

  /** ----- MONTHLY PAYMENTS ---- */

  public receiveMonthlyPaymentsTotalCost($event) {
    this.monthlyPaymentsTotalCost = $event;
  }

  public receiveMonthlyPaymentCost($event) {
    this.monthlyPaymentCost = $event;
  }

  public receiveMonthlyPaymentsSelected($event) {
    this.monthlyPaymentsSelected = $event;
  }

  /** ----- REPAIRS ---- */
  public receiveRepairsTotalCost($event) {
    this.repairsTotalCost = $event;
  }

  public receiveRepairsSelected($event) {
    this.repairsSelected = $event;
  }

  /** CONTRIBUTIONS */

  public receiveContributionsTotalAmount($event) {
    this.contributionsTotalAmount = $event;
  }

  public receiveContributionsSelected($event) {
    this.contributionsSelected = $event;
  }

  /** SUMMARY */
  public receiveRemainingAmount($event) {
    this.remainingAmount = $event;
  }

  /** ---------------- */

  public receiveStep($event) {
    if (this.isLastStep($event.selectedIndex)) {
      this.addSummaryItems();
    }
  }

  private addSummaryItems() {
    this.summaryItems = this.monthlyPaymentsSelected.map(el => {
      return {
        title: `${this.months[el.month - 1]} ${el.year}`,
        amount: this.monthlyPaymentCost
      };
    });

    this.summaryItems = this.summaryItems.concat(
      this.repairsSelected.map(el => {
        return { title: el.title, amount: el.cost };
      })
    );

    this.summaryItems = this.summaryItems.concat(this.contributionsSelected);
  }

  private isLastStep(index): boolean {
    return index === 5;
  }

  updatePayment() {
    if (this.remainingAmount < 0) {
      console.log('El pago no puede ser procesado');
    } else {
      console.log('El pago fue procesado');

      this.isLoading = true;

      const payment: Payment = {
        ...this.paymentGroup.value,
        monthlyPayments: this.monthlyPaymentsSelected,
        repairs: this.repairsSelected,
        contributions: this.contributionsSelected
      };

      const paymentModel = new PaymentModel(payment);
      console.log(paymentModel);

      this.newRecord$.next(paymentModel);
    }
  }

  public receivePaymentGroup($event) {
    this.paymentGroup = $event;
  }

  get f() {
    return this.paymentForm.controls;
  }
  ngOnDestroy(): void {
    // Signal all streams to complete
    this.signal$.next();
    this.signal$.complete();
    this.clearSelectTableService.clearTable$.complete();
  }
}
