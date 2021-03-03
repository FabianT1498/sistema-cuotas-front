import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  take,
  takeUntil,
  tap
} from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';

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
import { Neighbor, NeighborModel } from '@data/schema/neighbor';
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
  newRecord$: Subject<any>;

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
    this.newRecord$ = new Subject<any>();

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

/**
 * 1. Recupero el pago con sus datos, y cuotas y contribuciones pagadas.
 * 2. Permito la modificación del vecino que ha realizado el pago
 * 3. Inicializo el formulario del vecino
 * 4. Paso los datos del pago al formulario de pagos.
 * 5. Inicializo el formulario
 * 6. Recupero las mensualidades por pagar, así como las reparaciones que no han sido pagadas por el vecino
 * 7. Establezco las reparaciones y las mensualidades que ha pagado el vecino como marcadas
 *
 * Casos posibles que se pueden presentar durante la modificación de un pago:
 *
 * 0. Si ya existe un pago posterior al que se intenta modificar, entonces no permitir la modificación.
 *
 * 1. El usuario desea establecer una reparación como no pagada (Ya que se equivocó previamente)
 *  Solución. Permitir la desvinculación del pago con la reparación. Si el vecino desea pagar la reparación despues,
 *  entonces tendrá que pagarla de acuerdo al costo actual por vecino.
 *
 * 2. El usuario desea establecer una mensualidad como no pagada (Ya que se equivocó previamente)
 *  Solución. Permitir la desvinculación de la mensualidad con el pago. Si el vecino desea pagar la mensualidad despues,
 *  entonces tendrá que pagarla de acuerdo al costo actual de la mensualidad.
 *
 * 3. Si el nuevo monto del pago es menor que el debito no permitir actualizar
 *
 * 4. Validar las cuotas o contribuciones que se estan incluyendo
 *
 *  4.1. Las mensualidades que ya estaban agregadas no seran cobradas nuevamente
 *  4.2. Si hay nuevas mensualidades, entonces cobrar de acuerdo al costo actual de la mensualidad
 *
 *  4.3. Las reparaciones que ya estaban agregadas no serán cobradas.
 *  4.4. Si hay nuevas reparaciones, entonces cobrar de acuerdo al costo actual de la reparación.
 *
 * Procedimiento de actualización
 * 1. Valido que existan los id's de las cuotas y contribuciones del pago actualizado.
 * 2. Valido que vecino no haya pagado las cuotas (Mensualidades y reparaciones) en un pago anterior. (Delegado a la base de datos)
 * 2. Recupero el pago antiguo
 * 3. Obtengo las mensualidades agregadas y las removidas
 * 4. Obtengo las reparaciones agregadas y las removidas
 * 5. Obtengo el debito
 *  5.1. Para las mensualidades
 *    5.1.1. Multiplicar el costo actual de la mensualidad por el número de mensualidades agregadas.
 *    5.1.2. Sumar el s.
 */
