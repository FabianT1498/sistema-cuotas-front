import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { PaymentComponent } from './page/payment.component';
import { CreatePaymentComponent } from './page/create-payment/create-payment.component';
import { MonthlyPaymentsSelectComponent } from './component/monthly-payments-select/monthly-payments-select.component';
import { RepairsSelectComponent } from './component/repairs-select/repairs-select.component';
import { ContributionsSelectComponent } from './component/contributions-select/contributions-select.component';
import { PaymentSummaryTableComponent } from './component/payment-summary-table/payment-summary-table.component';

import { PaymentRoutingModule } from './payment.routing';

@NgModule({
  declarations: [
    PaymentComponent,
    CreatePaymentComponent,
    MonthlyPaymentsSelectComponent,
    RepairsSelectComponent,
    ContributionsSelectComponent,
    PaymentSummaryTableComponent
  ],
  imports: [SharedModule, PaymentRoutingModule],
  exports: [],
  providers: []
})
export class PaymentModule {}
