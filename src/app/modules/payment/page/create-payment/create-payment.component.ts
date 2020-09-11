import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';

import { map, startWith, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, EMPTY } from 'rxjs';

import { SelectOptionsService } from '@app/service/select-options.service';
import { NeighborService } from '@data/service/neightbor.service';
import { MonthlyPaymentService } from '@data/service/monthly-payment.service';

import { MonthlyPayment } from '@data/schema/monthly-payment';
import { Neighbor } from '@data/schema/neighbor';

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

  banks$: Observable<Array<String>>;
  neighbors$: Observable<Neighbor[]>;
  filteredNeighbors$: Observable<Neighbor[]>;
  neighborFilter$: Observable<string>;
  monthlyPayments$: Observable<MonthlyPayment[]>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private selectOptionsService: SelectOptionsService,
    private neighborService: NeighborService,
    private monthlyPaymentService: MonthlyPaymentService
  ) {
    this.paymentMethods = Array('Efectivo', 'Pago movil', 'Transferencia');
  }

  ngOnInit() {
    this.buildForm();
    this.loadInitialData();
    this.setupFormListeners();
  }

  private loadInitialData() {
    this.neighbors$ = this.neighborService.getNeighbors();
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
      amount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get f() {
    return this.paymentForm.controls;
  }

  neighborInputChange($event) {
    this.paymentForm.get('neighborID').setValue('');
    this.monthlyPayments$ = EMPTY;
  }

  neighborOptionSelected($event) {
    const neighborID = $event.option.value.neighborID;
    this.paymentForm.get('neighborID').setValue(neighborID);
    this.monthlyPayments$ = this.monthlyPaymentService.getMonthlyPayments(
      neighborID
    );
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
    this.isLoading = true;
    console.log('pago creado');
  }
}
