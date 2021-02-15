import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

/** Angular Material tables */
import { MatTableDataSource } from '@angular/material/table';

/** Services */
import { ClearSelectTableService } from '@shared/service/clear-select-table.service';

@Component({
  selector: 'app-payment-summary-table',
  templateUrl: './payment-summary-table.component.html',
  styleUrls: ['./payment-summary-table.component.scss']
})
export class PaymentSummaryTableComponent implements OnInit {
  /** Summary table */
  summarySource: MatTableDataSource<any>;
  summaryTblColumns: string[];
  totalSummaryTblColumns: string[];
  availableSummaryTblColumns: string[];
  remaningSummaryTblColumns: string[];

  @Input()
  public items: any[];

  @Input()
  public paymentInput: number;

  @Output()
  remainingAmount = new EventEmitter<number>();

  constructor() {}

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    /* this.monthlyPaymentsSource.data = monthlyPayments.map((el, index) => ({
      ...el,
      position: index + 1
    })); */
  }

  private initData() {
    this.summarySource = new MatTableDataSource<any>();
    this.summaryTblColumns = ['title', 'amountTitle'];
    this.totalSummaryTblColumns = ['totalTitle', 'totalSummary'];
    this.availableSummaryTblColumns = ['availableTitle', 'available'];
    this.remaningSummaryTblColumns = ['remainingTitle', 'remainingSummary'];
  }

  getTotalSummary() {
    return this.items
      .map(el => el.amount)
      .reduce((accumulator, el) => accumulator + el, 0);
  }

  getAmountRemaining() {
    const remainingAmount = this.paymentInput - this.getTotalSummary();
    this.remainingAmount.emit(remainingAmount);
    return remainingAmount;
  }
}
