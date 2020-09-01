import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';

import { SelectOptionsService } from '@app/service/select-options.service';
import { Observable } from 'rxjs';

import {NeighborService} from '@data/service/neightbor.service'
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
  neighborSelected: Neighbor;
  banks$: Observable<Array<String>>;
  paymentMethods$: Observable<Array<String>>;
  neighbors$ : Observable<Neighbor[]>

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private selectOptionsService: SelectOptionsService,
    private neighborService: NeighborService
  ) {
  }

  ngOnInit() {
    this.buildForm();
    this.paymentMethods$ = this.selectOptionsService.getOptions('paymentMethods');
    this.neighbors$ = this.neighborService.getNeighbors();
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

  get isElectronicPayment(): boolean {
    const paymentMethod = this.paymentForm.controls['paymentMethod']
      ? this.paymentForm.controls['paymentMethod'].value
      : '';

    return paymentMethod !== '' && paymentMethod !== 'Efectivo' ? true : false;
  }

  createPayment() {
    this.isLoading = true;
    console.log('pago creado');
  }

  onChange($event) {
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

    console.log(`isElectronicPayment es ${this.isElectronicPayment}`);

    if (this.isElectronicPayment) {
      this.paymentForm.removeControl('bank');
      this.paymentForm.removeControl('paymentID');
    }

    this.paymentForm.reset(formKeys);
  }
  
  neighborOptionSelected($event) {
    this.neighborSelected = $event.option.value;
    this.paymentForm.controls['neighborID'].setValue(this.neighborSelected.neighborID)
  }

  displayNeighborName(neighbor){
    return neighbor ? neighbor.fullName : null;
  }
}
