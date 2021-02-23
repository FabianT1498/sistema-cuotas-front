import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { BehaviorSubject, merge, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  takeUntil
} from 'rxjs/operators';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Moment } from 'moment';

import { RepairsDataSource } from '@shared/data-source/repairs-data-source';
import { RepairSearch } from '@data/interface/search-repairs';

import { DataService } from '@app/service/data.service';
import { RepairService } from '@data/service/repair.service';

@Component({
  selector: 'app-repair',
  templateUrl: './repair.component.html',
  styleUrls: ['./repair.component.scss']
})
export class RepairComponent implements OnInit, AfterViewInit, OnDestroy {
  searchRepairsForm: FormGroup;
  repairSearch: RepairSearch;
  searchData$: BehaviorSubject<RepairSearch>;

  /** TOTAL REPAIRS */
  repairsCount: number;

  /** TABLE COMPONENTS */
  dataSource: RepairsDataSource;

  repairsTblColumns = [
    'id',
    'title',
    'issueDate',
    'cost',
    'remaining',
    'optionsRepair'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private signal$ = new Subject<any>();

  constructor(
    private repairService: RepairService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.buildForm();
    this.addFormListeners();
    this.loadInitialData();
  }

  ngAfterViewInit() {
    // reset the paginator after sorting
    this.sort.sortChange
      .pipe(distinctUntilChanged(), takeUntil(this.signal$))
      .subscribe(sort => {
        this.paginator.pageIndex = 0;
      });

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(takeUntil(this.signal$))
      .subscribe(res => this.loadRepairsPage());
  }

  private loadInitialData() {
    this.repairSearch = {
      repairID: -1,
      searchCriterias: this.searchRepairsForm.value,
      searchOptions: {
        sortDirection: 'asc',
        sortActive: 'id',
        pageIndex: 0,
        pageSize: 5
      }
    };

    this.searchData$ = new BehaviorSubject(this.repairSearch);

    /** Data Source */
    this.dataSource = new RepairsDataSource(this.repairService);
    this.dataSource.loadRepairs(this.searchData$);

    /** Total payments */
    this.repairsCount = this.route.snapshot.data['repairsCount'];
  }

  private buildForm() {
    this.searchRepairsForm = this.formBuilder.group({
      repairTitle: '',
      repairStartDate: '',
      repairEndDate: '',
      repairStatus: 0
    });
  }

  private addFormListeners() {
    const repairTitle$ = this.searchRepairsForm
      .get('repairTitle')
      .valueChanges.pipe(
        debounceTime(450),
        takeUntil(this.signal$),
        map(val => val.toUpperCase())
      );

    repairTitle$.subscribe(
      (res: string) => (this.repairSearch.searchCriterias.repairTitle = res)
    );

    const repairStartDate$ = this.searchRepairsForm
      .get('repairStartDate')
      .valueChanges.pipe(
        distinctUntilChanged(),
        takeUntil(this.signal$),
        map((date: Moment) => this.dateToString(date, 'YYYY-MM-DD'))
      );

    repairStartDate$.subscribe((res: string) => {
      this.repairSearch.searchCriterias.repairStartDate = res;
      this.repairSearch.searchCriterias.repairEndDate = null;
    });

    const repairEndDate$ = this.searchRepairsForm
      .get('repairEndDate')
      .valueChanges.pipe(
        distinctUntilChanged(),
        takeUntil(this.signal$),
        map((date: Moment) => this.dateToString(date, 'YYYY-MM-DD'))
      );

    repairEndDate$.subscribe((res: string) => {
      this.repairSearch.searchCriterias.repairEndDate = res;
    });

    const repairStatus$ = this.searchRepairsForm
      .get('repairStatus')
      .valueChanges.pipe(distinctUntilChanged(), takeUntil(this.signal$));

    repairStatus$.subscribe((res: number) => {
      this.repairSearch.searchCriterias.repairStatus = res;
    });

    merge(repairTitle$, repairStartDate$, repairEndDate$, repairStatus$)
      .pipe(takeUntil(this.signal$))
      .subscribe(res => {
        this.paginator.pageIndex = 0;
        this.loadRepairsPage();
      });
  }

  private dateToString(date: Moment, format: string): string | null {
    if (!date) {
      return null;
    }

    return date.format(format);
  }

  private loadRepairsPage() {
    this.repairSearch.searchOptions = {
      sortDirection: this.sort.direction,
      sortActive: this.sort.active,
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    };

    this.searchData$.next(this.repairSearch);
  }

  showRepairDetail($event, row) {
    console.log(row);
  }

  ngOnDestroy() {
    this.signal$.next();
    this.signal$.complete();

    this.searchData$.complete();
  }
}
