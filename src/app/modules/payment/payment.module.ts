import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { PaymentComponent } from './page/payment.component';
import { CreatePaymentComponent } from './page/create-payment/create-payment.component';
import { MonthlyPaymentsSelectComponent } from './component/monthly-payments-select/monthly-payments-select.component';

import { PaymentRoutingModule } from './payment.routing';

@NgModule({
  declarations: [
    PaymentComponent,
    CreatePaymentComponent,
    MonthlyPaymentsSelectComponent
  ],
  imports: [SharedModule, PaymentRoutingModule],
  exports: [],
  providers: []
})
export class PaymentModule {}
