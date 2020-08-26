import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatePaymentComponent } from './page/create-payment/create-payment.component';
import { PaymentComponent } from './page/payment.component';

export const routes: Routes = [
  {
    path: '',
    component: PaymentComponent,
    pathMatch: 'full'
  },
  {
    path: 'crear',
    component: CreatePaymentComponent
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
