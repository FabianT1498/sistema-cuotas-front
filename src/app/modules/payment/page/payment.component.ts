import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  takeUntil
} from 'rxjs/operators';

import { PaymentSearch } from '@data/interface/search-payments';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataService } from '@app/service/data.service';
import { PaymentsDataSource } from '@shared/data-source/payments-data-source';
import { ActivatedRoute } from '@angular/router';

import { PaymentService } from '@data/service/payment.service';
import { BankService } from '@data/service/bank.service';

import { FormGroup, FormBuilder } from '@angular/forms';
import { Moment } from 'moment';
import { Bank } from '@data/schema/bank';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  searchPaymentsForm: FormGroup;
  paymentSearch: PaymentSearch;
  searchData$: BehaviorSubject<PaymentSearch>;

  /** TOTAL PAYMENTS */
  paymentsCount: number;

  /** TABLE COMPONENTS */
  dataSource: PaymentsDataSource;
  paymentsTblColumns = [
    'id',
    'neighborFullName',
    'paymentDate',
    'paymentMethod',
    'paymentAmount',
    'referenceNumber',
    'bank',
    'optionsPayment'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  /** Observablesdata */
  paymentMethods$: Observable<any[]>;
  banks$: Observable<Bank[]>;

  isElectronicPayment$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  private signal$ = new Subject();

  constructor(
    private paymentService: PaymentService,
    private bankService: BankService,
    private dataService: DataService,
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
      .subscribe(res => this.loadPaymentsPage());
  }

  private loadInitialData() {
    this.paymentMethods$ = this.dataService.getData('paymentMethods');

    this.banks$ = this.bankService.getBanks();

    this.paymentSearch = {
      neighborID: -1,
      searchCriterias: this.searchPaymentsForm.value,
      searchOptions: {
        sortDirection: 'asc',
        sortActive: 'id',
        pageIndex: 0,
        pageSize: 5
      }
    };

    this.searchData$ = new BehaviorSubject(this.paymentSearch);

    /** Data Source */
    this.dataSource = new PaymentsDataSource(this.paymentService);
    this.dataSource.loadPayments(this.searchData$);

    /** Total payments */
    this.paymentsCount = this.route.snapshot.data['paymentsCount'];
  }

  private buildForm() {
    this.searchPaymentsForm = this.formBuilder.group({
      neighborDNI: '',
      paymentStartDate: '',
      paymentEndDate: '',
      paymentMethod: 'Todos',
      paymentBank: -1,
      referenceNumber: ''
    });
  }

  private addFormListeners() {
    const neighborDNI$ = this.searchPaymentsForm
      .get('neighborDNI')
      .valueChanges.pipe(
        startWith(''),
        debounceTime(450),
        takeUntil(this.signal$),
        map(val => val.toUpperCase())
      );

    neighborDNI$.subscribe(
      (res: string) => (this.paymentSearch.searchCriterias.neighborDNI = res)
    );

    const paymentStartDate$ = this.searchPaymentsForm
      .get('paymentStartDate')
      .valueChanges.pipe(
        distinctUntilChanged(),
        takeUntil(this.signal$),
        map((date: Moment) => this.dateToString(date, 'YYYY-MM-DD'))
      );

    paymentStartDate$.subscribe((res: string) => {
      this.paymentSearch.searchCriterias.paymentStartDate = res;
      this.paymentSearch.searchCriterias.paymentEndDate = null;
    });

    const paymentEndDate$ = this.searchPaymentsForm
      .get('paymentEndDate')
      .valueChanges.pipe(
        distinctUntilChanged(),
        takeUntil(this.signal$),
        map((date: Moment) => this.dateToString(date, 'YYYY-MM-DD'))
      );

    paymentEndDate$.subscribe((res: string) => {
      this.paymentSearch.searchCriterias.paymentEndDate = res;
    });

    const paymentMethod$ = this.searchPaymentsForm
      .get('paymentMethod')
      .valueChanges.pipe(distinctUntilChanged(), takeUntil(this.signal$));

    paymentMethod$.subscribe((res: string) => {
      res !== 'Todos' && res !== 'Efectivo'
        ? this.isElectronicPayment$.next(true)
        : this.isElectronicPayment$.next(false);
      this.resetElectronicPaymentsInputs();
      this.paymentSearch.searchCriterias.paymentMethod = res;
    });

    const paymentBank$ = this.searchPaymentsForm
      .get('paymentBank')
      .valueChanges.pipe(distinctUntilChanged(), takeUntil(this.signal$));

    paymentBank$.subscribe((res: number) => {
      this.paymentSearch.searchCriterias.paymentBank = res;
    });

    const referenceNumber$ = this.searchPaymentsForm
      .get('referenceNumber')
      .valueChanges.pipe(debounceTime(450), takeUntil(this.signal$));

    referenceNumber$.subscribe((res: string) => {
      this.paymentSearch.searchCriterias.referenceNumber = res;
    });

    merge(
      neighborDNI$,
      paymentStartDate$,
      paymentEndDate$,
      paymentMethod$,
      paymentBank$,
      referenceNumber$
    )
      .pipe(takeUntil(this.signal$))
      .subscribe(res => {
        this.paginator.pageIndex = 0;
        this.loadPaymentsPage();
      });
  }

  private dateToString(date: Moment, format: string): string | null {
    if (!date) {
      return null;
    }

    return date.format(format);
  }

  private resetElectronicPaymentsInputs() {
    this.searchPaymentsForm.get('paymentBank').setValue(-1);
    this.searchPaymentsForm.get('referenceNumber').setValue('');
  }

  private loadPaymentsPage() {
    this.paymentSearch.searchOptions = {
      sortDirection: this.sort.direction,
      sortActive: this.sort.active,
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    };

    this.searchData$.next(this.paymentSearch);
  }

  showPaymentDetail($event, row) {
    console.log(row);
  }

  ngOnDestroy() {
    this.signal$.next();
    this.signal$.complete();

    this.searchData$.complete();
    this.isElectronicPayment$.complete();
  }
}
