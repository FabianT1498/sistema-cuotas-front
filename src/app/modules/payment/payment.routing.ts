import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatePaymentComponent } from './page/create-payment/create-payment.component';
import { UpdatePaymentComponent } from './page/update-payment/update-payment.component';
import { PaymentComponent } from './page/payment.component';

import { PaymentResolver } from './payment-resolver.service';
import { EditPaymentResolver } from './edit-payment-resolver.service';

export const routes: Routes = [
  {
    path: '',
    component: PaymentComponent,
    pathMatch: 'full',
    resolve: {
      paymentsCount: PaymentResolver
    }
  },
  {
    path: 'crear',
    component: CreatePaymentComponent
  },
  {
    path: ':id/editar',
    component: UpdatePaymentComponent,
    resolve: {
      paymentData: EditPaymentResolver
    }
  }
  /*  {
    path: ':id',
    component: PaymentDetailComponent,
    resolve: {
      project: PaymentResolver
    }
  } */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule {}
