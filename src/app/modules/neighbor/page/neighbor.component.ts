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

import { NeighborsDataSource } from '@shared/data-source/neighbors-data-source';
import { NeighborSearch } from '@data/interface/search-neighbors';

import { NeighborService } from '@data/service/neightbor.service';

@Component({
  selector: 'app-neighbor',
  templateUrl: './neighbor.component.html',
  styleUrls: ['./neighbor.component.scss']
})
export class NeighborComponent implements OnInit, AfterViewInit, OnDestroy {
  searchNeighborsForm: FormGroup;
  neighborSearch: NeighborSearch;
  searchData$: BehaviorSubject<NeighborSearch>;

  /** TOTAL Neighbors */
  neighborsCount: number;

  /** TABLE COMPONENTS */
  dataSource: NeighborsDataSource;

  neighborsTblColumns = [
    'id',
    'fullName',
    'dni',
    'houseNumber',
    'optionsNeighbor'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private signal$ = new Subject<any>();

  constructor(
    private neighborService: NeighborService,
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
      .subscribe(res => this.loadNeighborsPage());
  }

  private loadInitialData() {
    this.neighborSearch = {
      neighborID: -1,
      searchCriterias: this.searchNeighborsForm.value,
      searchOptions: {
        sortDirection: 'asc',
        sortActive: 'id',
        pageIndex: 0,
        pageSize: 5
      }
    };

    this.searchData$ = new BehaviorSubject(this.neighborSearch);

    /** Data Source */
    this.dataSource = new NeighborsDataSource(this.neighborService);
    this.dataSource.loadNeighbors(this.searchData$);

    /** Total payments */
    this.neighborsCount = this.route.snapshot.data['neighborsCount'];
  }

  private buildForm() {
    this.searchNeighborsForm = this.formBuilder.group({
      dni: '',
      houseNumber: ''
    });
  }

  private addFormListeners() {
    const dni$ = this.searchNeighborsForm.get('dni').valueChanges.pipe(
      debounceTime(450),
      takeUntil(this.signal$),
      map(val => val.toUpperCase())
    );

    dni$.subscribe(
      (res: string) => (this.neighborSearch.searchCriterias.dni = res)
    );

    const houseNumber$ = this.searchNeighborsForm
      .get('houseNumber')
      .valueChanges.pipe(
        debounceTime(450),
        takeUntil(this.signal$),
        map(val => val.toUpperCase())
      );

    houseNumber$.subscribe((res: string) => {
      this.neighborSearch.searchCriterias.houseNumber = res;
    });

    merge(dni$, houseNumber$)
      .pipe(takeUntil(this.signal$))
      .subscribe(res => {
        this.paginator.pageIndex = 0;
        this.loadNeighborsPage();
      });
  }

  private loadNeighborsPage() {
    this.neighborSearch.searchOptions = {
      sortDirection: this.sort.direction,
      sortActive: this.sort.active,
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    };

    this.searchData$.next(this.neighborSearch);
  }

  showNeighborDetail($event, row) {
    console.log(row);
  }

  ngOnDestroy() {
    this.signal$.next();
    this.signal$.complete();

    this.searchData$.complete();
  }
}
