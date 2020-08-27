import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { tap, delay, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from '@app/service/auth.service';

@Component({
  selector: 'app-create-payment',
  templateUrl: './create-payment.component.html',
  styleUrls: ['./create-payment.component.scss']
})
export class CreatePaymentComponent implements OnInit {
  error: string;
  isLoading: boolean;
  paymentForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.buildForm();
  }

  ngOnInit() {}

  get f() {
    return this.paymentForm.controls;
  }

  createPayment() {
    this.isLoading = true;
    console.log('crear pago');
  }

  private buildForm(): void {
    this.paymentForm = this.formBuilder.group({
      vecino: ['', Validators.required],
      cedula: ['', Validators.required],
      fechaPago: ['', Validators.required]
    });
  }
}
