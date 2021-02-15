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
import { Contribution } from '@data/schema/contribution';

@Component({
  selector: 'app-contributions-select',
  templateUrl: './contributions-select.component.html',
  styleUrls: ['./contributions-select.component.scss']
})
export class RepairsSelectComponent implements OnInit, AfterViewInit {
  /** Contributions table */
  contributionsObj: any;

  contributionsTblColumns: string[];
  totalContributionsTblColumns: string[];

  contributionsSource: MatTableDataSource<Contribution>;

  @ViewChild(MatPaginator) contributionsTblpaginator: MatPaginator;

  @Input()
  public contributions: Contribution[];

  @Output()
  totalAmount = new EventEmitter<number>();

  @Output()
  selected = new EventEmitter<Contribution[]>();

  constructor(clearSelectTableService: ClearSelectTableService) {}

  ngOnInit() {
    this.initData();
    this.addObservableListeners();
  }

  ngAfterViewInit(): void {
    this.contributionsSource.paginator = this.contributionsTblpaginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    /* this.repairsSource.data = monthlyPayments.map((el, index) => ({
      ...el,
      position: index + 1
    })); */
  }

  private initData() {
    this.contributionsObj = {};
    this.contributionsSource = new MatTableDataSource<Contribution>();
    this.contributionsTblColumns = [
      'position',
      'contributionTitle',
      'contributionAmount'
    ];
    this.totalContributionsTblColumns = [
      'emptyFooter',
      'totalTitle',
      'totalContribution'
    ];
  }

  private addObservableListeners() {
    this.clearSelectTableService.clearTable$.subscribe(val => {
      if (val) {
        this.clearSelection();
      }
    });
  }

  private isANumber(value: unknown): value is number {
    return typeof value === 'number';
  }

  private clearSelection() {
    this.contributionsObj = {};
  }

  getTotalContribution() {
    const totalAmount = Object.values(this.contributionsObj).reduce(
      (accumulator: number, el: number) => accumulator + el,
      0
    );

    this.totalAmount.emit(this.isANumber(totalAmount) ? totalAmount : 0);

    return totalAmount;
  }

  public contributionValueChange($event, contributionAmount) {
    this.getContributedContributions();
  }

  private getContributedContributions() {
    const contributionsArr = this.contributionsSource.data.reduce(
      (arr, el, index) => {
        if (
          this.isANumber(this.contributionsObj[index]) &&
          this.contributionsObj[index] > 0
        ) {
          arr.push({ ...el, amount: this.contributionsObj[index] });
        }
        return arr;
      },
      []
    );

    this.selected.emit(contributionsArr);

    return contributionsArr;
  }
}
