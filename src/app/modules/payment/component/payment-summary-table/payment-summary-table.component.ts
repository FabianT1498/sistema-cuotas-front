import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
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
export class PaymentSummaryTableComponent implements OnInit, OnChanges {
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

  constructor(private clearService: ClearSelectTableService) {
    this.summarySource = new MatTableDataSource<any>();
  }

  ngOnInit() {
    this.initData();
    this.addObservableListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.summarySource.data = Array.isArray(changes.items.currentValue)
      ? changes.items.currentValue
      : [];
  }

  private addObservableListeners() {
    this.clearService.clearTable$.subscribe(val => {
      if (val) {
        this.items = [];
        this.summarySource.data = [];
      }
    });
  }

  private initData() {
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
