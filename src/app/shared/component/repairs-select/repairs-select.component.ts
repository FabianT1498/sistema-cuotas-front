import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

/** Angular Material tables */
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

/** Services */
import { ClearSelectTableService } from '@shared/service/clear-select-table.service';

/** Schemas */
import { Repair } from '@data/schema/repair';

@Component({
  selector: 'app-repairs-select',
  templateUrl: './repairs-select.component.html',
  styleUrls: ['./repairs-select.component.scss']
})
export class RepairsSelectComponent implements OnInit, AfterViewInit {
  /** Repairs table */
  repairsTblColumns: string[];
  totalRepairsTblColumns: string[];

  repairsSource: MatTableDataSource<Repair>;
  repairsSelection: SelectionModel<Repair>;

  @ViewChild(MatPaginator) repairsTblpaginator: MatPaginator;
  @ViewChild(MatSort) repairsTblSort: MatSort;

  @Input()
  public repairs: Repair[];

  @Output()
  totalCost = new EventEmitter<number>();

  @Output()
  selected = new EventEmitter<Repair[]>();

  constructor(clearSelectTableService: ClearSelectTableService) {
    this.repairsSelection = new SelectionModel<Repair>(true, []);
    this.repairsSource = new MatTableDataSource<Repair>();
    this.repairsTblColumns = ['select', 'position', 'repair', 'date', 'cost'];
    this.totalRepairsTblColumns = [
      'emptyFooter',
      'totalTitle',
      'emptyFooter',
      'emptyFooter',
      'totalCost'
    ];
  }

  ngOnInit() {
    this.initData();
    this.addObservableListeners();
  }

  ngAfterViewInit(): void {
    this.repairsSource.paginator = this.repairsTblpaginator;
    this.repairsSource.sort = this.repairsTblSort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    /* this.repairsSource.data = monthlyPayments.map((el, index) => ({
      ...el,
      position: index + 1
    })); */
  }

  private initData() {
    this.repairsSelection = new SelectionModel<Repair>(true, []);
    this.repairsSource = new MatTableDataSource<Repair>();
    this.repairsTblColumns = ['select', 'position', 'month', 'year', 'cost'];
    this.totalRepairsTblColumns = [
      'emptyFooter',
      'totalTitle',
      'emptyFooter',
      'emptyFooter',
      'totalCost'
    ];
  }

  private addObservableListeners() {
    this.clearSelectTableService.clearTable$.subscribe(val => {
      if (val) {
        this.clearSelection();
      }
    });
  }

  private clearSelection() {
    this.repairsSelection.clear();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllRepairsSelected() {
    const numSelected = this.repairsSelection.selected.length;
    const numRows = this.repairsSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleRepairsTbl() {
    this.isAllRepairsSelected()
      ? this.repairsSelection.clear()
      : this.repairsSource.data.forEach(row =>
          this.repairsSelection.select(row)
        );
  }

  getTotalCostRepairs() {
    const costsArr = this.repairsSelection.selected.map(el => el.cost);
    const totalCost = costsArr.reduce((accumulator, el) => accumulator + el, 0);
    this.totalCost.emit(totalCost);
    return totalCost;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabelRepairsTbl(row?: any): string {
    if (!row) {
      return `${this.isAllRepairsSelected() ? 'select' : 'deselect'} all`;
    }
    return `${
      this.repairsSelection.isSelected(row) ? 'deselect' : 'select'
    } row ${row.position + 1}`;
  }

  toggleRepair($event, row) {
    this.repairsSelection.toggle(row);
    this.selected.emit(this.repairsSelection.selected);
  }
}
