import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

/** Angular Material tables */
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

/** Services */
import { ClearSelectTableService } from '@shared/service/clear-select-table.service';

/** Schemas */
import { Contribution } from '@data/schema/contribution';

@Component({
  selector: 'app-contributions-select',
  templateUrl: './contributions-select.component.html',
  styleUrls: ['./contributions-select.component.scss']
})
export class ContributionsSelectComponent
  implements OnInit, AfterViewInit, OnChanges {
  /** Contributions table */
  contributionsObj: any;

  contributionsTblColumns: string[];
  totalContributionsTblColumns: string[];

  contributionsSource: MatTableDataSource<Contribution>;

  @ViewChild(MatPaginator) contributionsTblpaginator: MatPaginator;

  @Input()
  public contributions: Contribution[];

  @Input()
  public contributedContributions?: Contribution[];

  @Output()
  totalAmount = new EventEmitter<number>();

  @Output()
  selected = new EventEmitter<Contribution[]>();

  constructor(private clearSelectTableService: ClearSelectTableService) {
    this.contributionsSource = new MatTableDataSource<Contribution>();
  }

  ngOnInit() {
    this.initData();
    this.addObservableListeners();
  }

  ngAfterViewInit(): void {
    this.contributionsSource.paginator = this.contributionsTblpaginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const contributionsIsArr = Array.isArray(
      changes.contributions.currentValue
    );

    if (contributionsIsArr) {
      this.contributionsSource.data = changes.contributions.currentValue;

      if (this.contributedContributions) {
        this.setContribsAmount();
        this.getTotalContribution();
        this.getContributedContributions();
      }
    }
  }

  private setContribsAmount() {
    this.contributedContributions.forEach(prevContrib => {
      const index = this.contributionsSource.data.findIndex(
        contribs => contribs.id === prevContrib.id
      );
      if (index !== -1) {
        this.contributionsObj[index] = prevContrib.amount;
      }
    });
  }

  private initData() {
    this.contributionsObj = {};
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
