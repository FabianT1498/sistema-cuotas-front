import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { PaymentComponent } from './page/payment.component';
import { CreatePaymentComponent } from './page/create-payment/create-payment.component';

import { PaymentRoutingModule } from './payment.routing';

@NgModule({
  declarations: [PaymentComponent, CreatePaymentComponent],
  imports: [SharedModule, PaymentRoutingModule],
  exports: [],
  providers: []
})
export class PaymentModule {}
