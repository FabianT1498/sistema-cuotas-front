import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray
} from '@angular/forms';

import {
  catchError,
  debounceTime,
  finalize,
  map,
  startWith,
  takeUntil,
  tap
} from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';

/** SERVICES */
import { DataService } from '@app/service/data.service';
import { NeighborService } from '@data/service/neightbor.service';
import { MonthlyPaymentService } from '@data/service/monthly-payment.service';
import { RepairService } from '@data/service/repair.service';
import { ContributionService } from '@data/service/contribution.service';
import { PaymentService } from '@data/service/payment.service';
import { BankService } from '@data/service/bank.service';

/* SHARED SERVICES */
import { ClearSelectTableService } from '@shared/service/clear-select-table.service';

/** SCHEMAS */
import { MonthlyPayment } from '@data/schema/monthly-payment';
import { Neighbor, NeighborModel } from '@data/schema/neighbor';
import { Repair } from '@data/schema/repair';
import { Payment, PaymentModel } from '@data/schema/payment';
import { Contribution } from '@data/schema/contribution';
import { Bank } from '@data/schema/bank';

@Component({
  selector: 'app-create-payment',
  templateUrl: './create-payment.component.html',
  styleUrls: ['./create-payment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreatePaymentComponent implements OnInit, OnDestroy {
  /** Signal to unsubscribe from all observables */
  private signal$: Subject<any>;

  isLoading: boolean;

  /** Neighbor form section */
  @ViewChild('neighborNotFound') neighborNotFoundComp: TemplateRef<any>;
  @ViewChild('neighborFound') neighborFoundComp: TemplateRef<any>;
  @ViewChild('newNeighbor') newNeighborComp: TemplateRef<any>;
  @ViewChild('neighborContainer', { read: ViewContainerRef }) neighborContainer;
  neighborFullName: string;
  neighborID$: Subject<number>;

  /** FORM GROUPS */
  paymentForm: FormGroup;
  paymentFormArr: FormArray;
  neighborGroup: FormGroup;
  paymentGroup: FormGroup;

  /** Observable data */
  paymentMethods$: Observable<Array<any>>;
  banks$: Observable<Bank[]>;
  monthlyPayments$: Observable<MonthlyPayment[]>;
  repairs$: Observable<Repair[]>;
  contributions$: Observable<Contribution[]>;

  /** Monthly Payments component Outputs */
  monthlyPaymentsTotalCost: number;
  monthlyPaymentsSelected: MonthlyPayment[];

  /** Repairs component Outputs */
  repairsTotalCost: number;
  repairsSelected: Repair[];

  /** Contributions component Outputs */
  contributionsTotalAmount: number;
  contributionsSelected: Contribution[];

  /** Summary component Input */
  summaryItems: any[];

  /** Remaining Amount */
  remainingAmount: number;

  /* New payment subject */
  newRecord$: Subject<any>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private neighborService: NeighborService,
    private monthlyPaymentService: MonthlyPaymentService,
    private repairService: RepairService,
    private contributionService: ContributionService,
    private bankService: BankService,
    private paymentService: PaymentService,
    private clearSelectTableService: ClearSelectTableService
  ) {}

  ngOnInit() {
    this.init();
    this.buildForm();
    this.loadInitialData();
    this.setupFormListeners();
  }

  private init() {
    this.isLoading = false;

    this.monthlyPaymentsTotalCost = 0;
    this.repairsTotalCost = 0;
    this.contributionsTotalAmount = 0;

    this.monthlyPaymentsSelected = [];
    this.repairsSelected = [];
    this.contributionsSelected = [];

    this.remainingAmount = 0;
    this.summaryItems = [];
  }

  private buildForm(): void {
    this.paymentFormArr = this.formBuilder.array([
      this.createNeighborGroup(),
      this.createPaymentGroup()
    ]);
    this.neighborGroup = this.paymentFormArr.get([0]) as FormGroup;
    this.paymentGroup = this.paymentFormArr.get([1]) as FormGroup;

    this.paymentForm = this.formBuilder.group({
      paymentFormArr: this.paymentFormArr
    });
  }

  private loadInitialData() {
    this.paymentMethods$ = this.dataService.getData('paymentMethods');
    this.banks$ = this.bankService.getBanks();
  }

  private setupFormListeners() {
    this.signal$ = new Subject();

    this.newRecord$ = new Subject<any>();

    this.neighborID$ = new Subject<number>();

    const neighborDNI$ = this.neighborGroup
      .get('neighborDNI')
      .valueChanges.pipe(
        debounceTime(450),
        map(val => val.toUpperCase())
      );

    this.neighborService
      .getNeighborByDNI(neighborDNI$)
      .pipe(takeUntil(this.signal$))
      .subscribe((res: any) => {
        let view;

        if (res.data) {
          const neighbor = res.data;
          this.neighborGroup.controls['neighborID'].setValue(neighbor.id);
          this.neighborID$.next(neighbor.id);
          this.neighborFullName = neighbor.fullname;
          this.removeNeighborControls();
          view = this.neighborFoundComp.createEmbeddedView(null);
        } else {
          // Vecino no existe
          view = this.neighborNotFoundComp.createEmbeddedView(null);
          this.addNeighborControls();
          this.neighborID$.next(-1);
          this.neighborGroup.controls['neighborID'].setValue(-1);
        }

        this.clearSelectTableService.clearTable(true);
        this.neighborContainer.remove();
        this.neighborContainer.insert(view);
      });

    this.monthlyPayments$ = this.monthlyPaymentService.getUnpaidMonthlyPayments(
      this.neighborID$
    );

    this.paymentService
      .createPayment(this.newRecord$)
      .pipe(
        takeUntil(this.signal$),
        tap(record => this.router.navigate(['/pagos'])),
        finalize(() => (this.isLoading = false)),
        catchError(error => {
          console.log('Caught in CatchError. Throwing error');
          return throwError(error);
        })
      )
      .subscribe(res => {
        console.log(res);
      });

    /* this.contributionService
      .getAll()
      .pipe(takeUntil(this.signal$))
      .subscribe((contribs: Contribution[]) => {
        this.contributionsSource.data = contribs.map((el, index) => ({
          ...el,
          position: index + 1
        }));
      }); */

    /* .pipe(takeUntil(this.signal$))
      .subscribe((monthlyPayments: MonthlyPayment[]) => {
        this.monthlyPaymentsSource.data = monthlyPayments.map((el, index) => ({
          ...el,
          position: index + 1
        }));
      }); */

    /* this.repairService
      .getUnpaidRepairs(this.neighborID$)
      .pipe(takeUntil(this.signal$))
      .subscribe((repairs: Repair[]) => {
        this.repairsSource.data = repairs.map((el, index) => ({
          ...el,
          position: index + 1
        }));
      }); */
  }

  private createNeighborGroup(): FormGroup {
    return this.formBuilder.group({
      neighborDNI: [
        '',
        [
          Validators.required,
          Validators.pattern('^[VE|ve]-[0-9]+'),
          Validators.minLength(7),
          Validators.maxLength(10)
        ]
      ],
      neighborID: [-1, [Validators.required]]
    });
  }

  private createPaymentGroup(): FormGroup {
    return this.formBuilder.group({
      paymentDate: ['', Validators.required],
      paymentMethod: ['Efectivo', Validators.required],
      amount: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]+(.[0-9]+)?$')
        ]
      ]
    });
  }

  get f() {
    return this.paymentForm.controls;
  }

  private addNeighborControls() {
    if (this.doesNeighborControlsExist()) {
      return;
    }

    console.log('Se va a agregar los controles del vecino');

    this.neighborGroup.addControl(
      'fullName',
      new FormControl('', [
        Validators.required,
        Validators.pattern('^([A-Z]|[a-z]| )+$')
      ])
    );
    this.neighborGroup.addControl(
      'phoneNumber',
      new FormControl('', Validators.pattern('^[0-9]+-[0-9]+$'))
    );
    this.neighborGroup.addControl(
      'email',
      new FormControl('', Validators.email)
    );
    this.neighborGroup.addControl(
      'houseNumber',
      new FormControl('', [
        Validators.required,
        Validators.pattern('^([A-Z]|[a-z])-[0-9]+$')
      ])
    );

    console.log(this.neighborGroup);
  }

  private removeNeighborControls() {
    this.neighborGroup.removeControl('fullName');
    this.neighborGroup.removeControl('phoneNumber');
    this.neighborGroup.removeControl('email');
    this.neighborGroup.removeControl('houseNumber');
  }

  addNeighbor() {
    const view = this.newNeighborComp.createEmbeddedView(null);
    this.neighborContainer.remove();
    this.neighborContainer.insert(view);
  }

  private doesNeighborControlsExist(): boolean {
    return (
      this.neighborGroup.get('fullName') !== null &&
      this.neighborGroup.get('phoneNumber') !== null &&
      this.neighborGroup.get('email') !== null &&
      this.neighborGroup.get('houseNumber') !== null
    );
  }

  /** ----- MONTHLY PAYMENTS ---- */

  public receiveMonthlyPaymentsTotalCost($event) {
    console.log(`El costo total de las mensualidades es : ${$event}`);
    this.monthlyPaymentsTotalCost = $event;
  }

  public receiveMonthlyPaymentsSelected($event) {
    console.log(`Las mensualidades seleccionadas son`);
    console.log($event);
    this.monthlyPaymentsSelected = $event;
  }

  /** ----- REPAIRS ---- */
  public receiveRepairsTotalCost($event) {
    console.log(`El costo total de las reparaciones es : ${$event}`);
    this.repairsTotalCost = $event;
  }

  public receiveRepairsSelected($event) {
    console.log(`Las reparaciones seleccionadas son`);
    console.log($event);
    this.repairsSelected = $event;
  }

  /** CONTRIBUTIONS */

  public receiveContributionsTotalAmount($event) {
    console.log(`El costo total de las reparaciones es : ${$event}`);
    this.repairsTotalCost = $event;
  }

  public receiveContributionsSelected($event) {
    console.log(`Las contribuciones seleccionadas son`);
    console.log($event);
    this.repairsSelected = $event;
  }

  /** SUMMARY */
  public receiveRemainingAmount($event) {
    console.log(`El restante es`);
    console.log($event);
    this.remainingAmount = $event;
  }

  /** ---------------- */

  public receiveStep($event) {
    if (this.isLastStep($event.selectedIndex)) {
      // this.addSummaryItems();
    }
  }

  /* private addSummaryItems(){
    this.summaryItems = this.monthlyPaymentsSelected.map(el => {
      return { title: `${el.month} ${el.year}`, amount: el.cost };
    });

    this.summaryItems = this.summaryItems.concat(
      this.repairsSelected.map(el => {
        return { title: el.title, amount: el.cost };
      })
    );

    this.summaryItems = this.summaryItems.concat(
      this.contributionsSelected
    );
  } */

  private isLastStep(index): boolean {
    return index === 5;
  }

  get isElectronicPayment(): boolean {
    return this.paymentGroup.get('paymentMethod').value !== 'Efectivo';
  }

  paymentMethodChange($event) {
    if (this.isElectronicPayment) {
      this.paymentGroup.addControl(
        'bank',
        new FormControl('', Validators.required)
      );
      this.paymentGroup.addControl(
        'referenceNumber',
        new FormControl('', [
          Validators.required,
          Validators.pattern('^([0-9]|[A-Z]|[a-z])+$')
        ])
      );
    } else {
      this.paymentGroup.removeControl('bank');
      this.paymentGroup.removeControl('referenceNumber');
    }
  }

  createPayment() {
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

      const neighbor: Neighbor = {
        ...this.neighborGroup.value
      };

      const neighborModel = new NeighborModel(neighbor);
      console.log(neighborModel);

      this.newRecord$.next({ paymentModel, neighborModel });
    }
  }

  ngOnDestroy(): void {
    // Signal all streams to complete
    this.signal$.next();
    this.signal$.complete();
    this.clearSelectTableService.clearTable$.complete();
  }
}
