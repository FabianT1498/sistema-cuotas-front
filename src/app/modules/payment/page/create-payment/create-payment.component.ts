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

import { map, startWith, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, EMPTY, of, Subject } from 'rxjs';

/** SERVICES */
import { SelectOptionsService } from '@app/service/select-options.service';
import { NeighborService } from '@data/service/neightbor.service';
import { MonthlyPaymentService } from '@data/service/monthly-payment.service';
import { RepairService } from '@data/service/repair.service';
import { ContributionService } from '@data/service/contribution.service';

/** SCHEMAS */
import { MonthlyPayment } from '@data/schema/monthly-payment';
import { Neighbor } from '@data/schema/neighbor';
import { Repair } from '@data/schema/repair';
import { PaymentModel } from '@data/schema/payment';
import { Contribution } from '@data/schema/contribution';

@Component({
  selector: 'app-create-payment',
  templateUrl: './create-payment.component.html',
  styleUrls: ['./create-payment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreatePaymentComponent implements OnInit, OnDestroy {
  @ViewChild('neighborNotFound') neighborNotFoundComp: TemplateRef<any>;
  @ViewChild('neighborFound') neighborFoundComp: TemplateRef<any>;
  @ViewChild('newNeighbor') newNeighborComp: TemplateRef<any>;
  @ViewChild('neighborContainer', { read: ViewContainerRef }) neighborContainer;

  neighbor: Neighbor;
  neighborDNI$: Subject<string>;

  private signal$: Subject<any>;

  paymentForm: FormGroup;
  paymentFormArr: FormArray;
  neighborGroup: FormGroup;

  isLoading: boolean;
  paymentMethods: Array<String>;
  contributionsAdded: Array<Contribution>;

  banks$: Observable<Array<String>>;
  neighbors$: Observable<Neighbor[]>;
  filteredNeighbors$: Observable<Neighbor[]>;
  neighborFilter$: Observable<string>;
  monthlyPayments$: Observable<MonthlyPayment[]>;
  repairs$: Observable<Repair[]>;
  contributions$: Observable<Contribution[]>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private selectOptionsService: SelectOptionsService,
    private neighborService: NeighborService,
    private monthlyPaymentService: MonthlyPaymentService,
    private repairService: RepairService,
    private contributionService: ContributionService
  ) {
    this.paymentMethods = Array('Efectivo', 'Pago movil', 'Transferencia');
    this.contributionsAdded = Array();
  }

  ngOnInit() {
    this.buildForm();
    this.loadInitialData();
    this.setupFormListeners();
  }

  private loadInitialData() {
    this.contributions$ = this.contributionService.getAll();
  }

  private setupFormListeners() {
    this.signal$ = new Subject();

    this.neighborDNI$ = new Subject<string>();

    this.neighborService
      .getNeighbor(this.neighborDNI$)
      .pipe(takeUntil(this.signal$))
      .subscribe((neighbor: any) => {
        let view;

        if (neighbor.length > 0) {
          this.neighbor = neighbor[0];
          this.removeNeighborControls();
          view = this.neighborFoundComp.createEmbeddedView(null);
        } else {
          view = this.neighborNotFoundComp.createEmbeddedView(null);
        }

        this.neighborContainer.remove();
        this.neighborContainer.insert(view);

        console.log(this.paymentForm.controls['paymentFormArr'].get([0]));
      });
    /* this.neighborFilter$ = this.paymentForm.get('neighbor').valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value.fullName))
    );

    this.filteredNeighbors$ = combineLatest(
      this.neighbors$,
      this.neighborFilter$
    ).pipe(
      map(([neighbors, filterString]) =>
        neighbors.filter(
          neighbor =>
            neighbor.fullName
              .toLowerCase()
              .indexOf(filterString.toLowerCase()) !== -1
        )
      )
    ); */
  }

  private createNeighborGroup(): FormGroup {
    return this.formBuilder.group({
      neighborDNI: [
        '',
        [
          Validators.required,
          Validators.pattern('^[VE|ve]-[0-9]+'),
          Validators.maxLength(10)
        ]
      ]
    });
  }

  private buildForm(): void {
    this.paymentForm = this.formBuilder.group({
      paymentFormArr: this.formBuilder.array([this.createNeighborGroup()])
    });

    /* this.paymentForm = this.formBuilder.group({
      neighbor: ['', Validators.required],
      neighborID: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.maxLength(8)
        ]
      ],
      paymentDate: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      amount: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]+(.[0-9]+)?$')
        ]
      ],
      monthlyPayments: [[]],
      repairs: [[]],
      contribution: [''],
      contributionForm: this.formBuilder.array([])
    }); */
  }

  get f() {
    return this.paymentForm.controls;
  }

  neighborDNIChange($event) {
    this.neighborDNI$.next($event.target.value);
  }

  private addNeighborControls() {
    if (typeof this.neighborGroup === 'undefined') {
      this.paymentFormArr = this.paymentForm.get('paymentFormArr') as FormArray;
      this.neighborGroup = this.paymentFormArr.get([0]) as FormGroup;
    }

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
  }

  private removeNeighborControls() {
    if (typeof this.neighborGroup !== 'undefined') {
      this.neighborGroup.removeControl('fullName');
      this.neighborGroup.removeControl('phoneNumber');
      this.neighborGroup.removeControl('email');
      this.neighborGroup.removeControl('houseNumber');
    }
  }

  addNeighbor() {
    this.addNeighborControls();
    const view = this.newNeighborComp.createEmbeddedView(null);
    this.neighborContainer.remove();
    this.neighborContainer.insert(view);
  }

  neighborOptionSelected($event) {
    const neighborID = $event.option.value.neighborID;

    this.paymentForm.get('neighborID').setValue(neighborID);

    // For test purpose get all monthly Payments
    this.monthlyPayments$ = this.monthlyPaymentService.getAll();
    // this.monthlyPayments$ = this.monthlyPaymentService.getUnpaidMonthlyPayments(neighborID);

    // For test purpose get all repairs
    this.repairs$ = this.repairService.getAll();
  }

  displayNeighborName(neighbor) {
    return neighbor && neighbor.fullName ? neighbor.fullName : '';
  }

  get isElectronicPayment(): boolean {
    const paymentMethod = this.paymentForm.get('paymentMethod')
      ? this.paymentForm.get('paymentMethod').value
      : '';

    return paymentMethod !== '' && paymentMethod !== this.paymentMethods[0];
  }

  paymentMethodChange($event) {
    if (this.isElectronicPayment) {
      this.paymentForm.addControl(
        'bank',
        new FormControl('', Validators.required)
      );
      this.paymentForm.addControl(
        'paymentID',
        new FormControl('', [
          Validators.required,
          Validators.pattern('^([0-9]|[A-Z]|[a-z])+$')
        ])
      );
      this.banks$ = this.selectOptionsService.getOptions('banks');
    } else {
      this.paymentForm.removeControl('bank');
      this.paymentForm.removeControl('paymentID');
    }
  }

  displayContribTitle(contribution) {
    return contribution && contribution.title ? contribution.title : '';
  }

  addContribution() {
    if (this.paymentForm.get('contribution')) {
      const value = this.paymentForm.get('contribution').value;

      if (value && typeof value === 'object') {
        // check if doesn't exist the same element
        if (
          this.contributionsAdded.findIndex(el => el.id === value.id) === -1
        ) {
          this.contributionsAdded.push(value);
          const contribForm = this.paymentForm.get(
            'contributionForm'
          ) as FormArray;
          const control = new FormControl(0, [
            Validators.required,
            Validators.min(0),
            Validators.pattern('^[0-9]+(.[0-9]+)?$')
          ]);

          contribForm.push(control);
        }
      }

      this.paymentForm.get('contribution').setValue('');
    }
  }

  deleteContribution(index) {
    this.contributionsAdded.splice(index, 1);
    const formArray = this.paymentForm.get('contributionForm') as FormArray;
    formArray.removeAt(index);
  }

  private isValidAmount(): boolean {
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    let acc = 0;

    // get arrays costs and contributions
    const formArray = this.paymentForm.get('contributionForm') as FormArray;
    const arrContrib = formArray.controls.map(el => el.value);
    const arrRepairs = this.paymentForm.get('repairs').value.map(el => el.cost);
    const arrMonthlyPayment = this.paymentForm
      .get('monthlyPayments')
      .value.map(el => el.cost);

    // adding all debits
    acc = arrContrib.reduce(reducer);
    acc = arrRepairs.reduce(reducer, acc);
    acc = arrMonthlyPayment.reduce(reducer, acc);

    console.log(`El debito es de -${acc}`);

    // get amount payment
    const amount = this.paymentForm.get('amount').value;

    return amount > acc ? true : false;
  }

  onClear() {
    const formKeys = {
      neighbor: '',
      neighborID: '',
      paymentDate: '',
      paymentMethod: '',
      amount: 0
    };

    if (this.isElectronicPayment) {
      this.paymentForm.removeControl('bank');
      this.paymentForm.removeControl('paymentID');
    }

    this.paymentForm.reset(formKeys);
  }

  createPayment() {
    if (this.isValidAmount()) console.log('Cantidad valida');
    else {
      console.log('cantidad invalida');
      return;
    }

    const payment = this.paymentForm.value;

    delete payment.neighbor;

    const paymentModel = new PaymentModel(payment);

    // this.isLoading = true;
    console.log(paymentModel);
  }

  ngOnDestroy(): void {
    // Signal all streams to complete
    this.signal$.next();
    this.signal$.complete();
  }
}
