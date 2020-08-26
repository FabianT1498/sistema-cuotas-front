import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { PaymentComponent } from './page/payment.component';

import { PaymentRoutingModule } from './payment.routing';

@NgModule({
  declarations: [PaymentComponent],
  imports: [SharedModule, PaymentRoutingModule],
  exports: [],
  providers: []
})
export class PaymentModule {}
