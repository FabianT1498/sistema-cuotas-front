import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray
} from '@angular/forms';

import { map, startWith } from 'rxjs/operators';
import { combineLatest, Observable, EMPTY, of } from 'rxjs';

import { SelectOptionsService } from '@app/service/select-options.service';
import { NeighborService } from '@data/service/neightbor.service';
import { MonthlyPaymentService } from '@data/service/monthly-payment.service';
import { RepairService } from '@data/service/repair.service';
import { ContributionService } from '@data/service/contribution.service';

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
export class CreatePaymentComponent implements OnInit {
  isLoading: boolean;
  paymentForm: FormGroup;
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
    this.neighbors$ = this.neighborService.getAll();
    this.contributions$ = this.contributionService.getAll();
  }

  private setupFormListeners() {
    this.neighborFilter$ = this.paymentForm.get('neighbor').valueChanges.pipe(
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
    );
  }

  private buildForm(): void {
    this.paymentForm = this.formBuilder.group({
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
    });
  }

  get f() {
    return this.paymentForm.controls;
  }

  neighborInputChange($event) {
    this.paymentForm.get('neighborID').setValue('');
    this.monthlyPayments$ = EMPTY;
    this.repairs$ = EMPTY;
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
}
