import {
  AfterViewInit,
  OnDestroy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  OnChanges
} from '@angular/core';

import { MonthlyPayment } from '@data/schema/monthly-payment';

/** Angular Material tables */
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

/** Services */
import { ClearSelectTableService } from '@shared/service/clear-select-table.service';
import { DataService } from '@app/service/data.service';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { MonthlyPaymentService } from '@data/service/monthly-payment.service';

@Component({
  selector: 'app-monthly-payments-select',
  templateUrl: './monthly-payments-select.component.html',
  styleUrls: ['./monthly-payments-select.component.scss']
})
export class MonthlyPaymentsSelectComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  /** Monthly payments table */
  monthlyPaymentsTblColumns: string[];
  totalMonthlyPaymentsTblColumns: string[];

  monthlyPaymentsSource: MatTableDataSource<MonthlyPayment>;
  monthlyPaymentsSelection: SelectionModel<MonthlyPayment>;

  @ViewChild(MatPaginator) monthlyPaymentsTblpaginator: MatPaginator;
  @ViewChild(MatSort) monthlyPaymentsTblSort: MatSort;

  months: string[];

  monthlyPaymentCost: number;

  @Input()
  public monthlyPayments: MonthlyPayment[];

  @Input()
  public selectedMonthlyPayments?: MonthlyPayment[];

  @Output()
  totalCost = new EventEmitter<number>();

  @Output()
  monthlyPaymentCostEv = new EventEmitter<number>();

  @Output()
  selected = new EventEmitter<MonthlyPayment[]>();

  signal$ = new Subject();

  constructor(
    private clearService: ClearSelectTableService,
    private dataService: DataService,
    private monthlyPaymentService: MonthlyPaymentService
  ) {
    this.monthlyPaymentsSource = new MatTableDataSource<MonthlyPayment>();
  }

  ngOnInit() {
    this.initData();
    this.addObservableListeners();
  }

  ngAfterViewInit(): void {
    this.monthlyPaymentsSource.paginator = this.monthlyPaymentsTblpaginator;
    this.monthlyPaymentsSource.sort = this.monthlyPaymentsTblSort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const monthlyPaymentsIsArr = Array.isArray(
      changes.monthlyPayments.currentValue
    );

    if (monthlyPaymentsIsArr) {
      if (this.selectedMonthlyPayments) {
        this.monthlyPaymentsSource.data = this.selectedMonthlyPayments.concat(
          changes.monthlyPayments.currentValue
        );
        this.selectedMonthlyPayments.forEach(row =>
          this.monthlyPaymentsSelection.select(row)
        );
        this.getTotalCostMonthlyPayments();
        this.selected.emit(this.monthlyPaymentsSelection.selected);
      } else {
        this.monthlyPaymentsSource.data = changes.monthlyPayments.currentValue;
      }
    }
  }

  private initData() {
    this.monthlyPaymentsSelection = new SelectionModel<MonthlyPayment>(
      true,
      []
    );

    this.monthlyPaymentsTblColumns = [
      'select',
      'position',
      'month',
      'year',
      'cost'
    ];
    this.totalMonthlyPaymentsTblColumns = [
      'emptyFooter',
      'totalTitle',
      'emptyFooter',
      'emptyFooter',
      'totalCost'
    ];

    this.monthlyPaymentCost = 0;

    this.dataService
      .getData('months')
      .pipe(take(1))
      .subscribe(val => (this.months = val));

    this.monthlyPaymentService
      .getMonthlyPaymentCost()
      .pipe(take(1))
      .subscribe(val => {
        this.monthlyPaymentCost = val;
        this.monthlyPaymentCostEv.emit(val);
      });
  }

  private addObservableListeners() {
    this.clearService.clearTable$.subscribe(val => {
      if (val) {
        this.clearSelection();
      }
    });
  }

  private clearSelection() {
    this.monthlyPaymentsSelection.clear();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllMonthlyPaymentsSelected() {
    const numSelected = this.monthlyPaymentsSelection.selected.length;
    const numRows = this.monthlyPaymentsSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleMonthlyPaymentsTbl() {
    this.isAllMonthlyPaymentsSelected()
      ? this.monthlyPaymentsSelection.clear()
      : this.monthlyPaymentsSource.data.forEach(row =>
          this.monthlyPaymentsSelection.select(row)
        );
  }

  getTotalCostMonthlyPayments() {
    /* const costsArr = this.monthlyPaymentsSelection.selected.map(el => 500);
    const totalCost = costsArr.reduce((accumulator, el) => accumulator + el, 0); */

    const totalCost =
      this.monthlyPaymentsSelection.selected.length * this.monthlyPaymentCost;
    this.totalCost.emit(totalCost);
    return totalCost;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabelMonthlyPaymentsTbl(row?: any): string {
    if (!row) {
      return `${
        this.isAllMonthlyPaymentsSelected() ? 'select' : 'deselect'
      } all`;
    }

    console.log(`La posicion es ${row.position}`);

    return `${
      this.monthlyPaymentsSelection.isSelected(row) ? 'deselect' : 'select'
    } row ${row.position + 1}`;
  }

  toggleMonthlyPayment($event, row) {
    this.monthlyPaymentsSelection.toggle(row);
    this.selected.emit(this.monthlyPaymentsSelection.selected);
  }

  ngOnDestroy() {
    this.signal$.next();
    this.signal$.complete();
  }
}
