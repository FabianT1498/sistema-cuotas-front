import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray
} from '@angular/forms';

import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { map, startWith, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, EMPTY, of, Subject } from 'rxjs';

/** SERVICES */
import { SelectOptionsService } from '@app/service/select-options.service';
import { NeighborService } from '@data/service/neightbor.service';
import { MonthlyPaymentService } from '@data/service/monthly-payment.service';
import { RepairService } from '@data/service/repair.service';
import { ContributionService } from '@data/service/contribution.service';

/** SCHEMAS */
import { MonthlyPayment } from '@data/schema/monthly-payment';
import { Neighbor } from '@data/schema/neighbor';
import { Repair } from '@data/schema/repair';
import { Payment, PaymentModel } from '@data/schema/payment';
import { Contribution } from '@data/schema/contribution';

@Component({
  selector: 'app-create-payment',
  templateUrl: './create-payment.component.html',
  styleUrls: ['./create-payment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreatePaymentComponent
  implements OnInit, OnDestroy, AfterViewInit {
  /** Signal to unsubscribe from all observables */
  private signal$: Subject<any>;

  /** Neighbor form section */
  @ViewChild('neighborNotFound') neighborNotFoundComp: TemplateRef<any>;
  @ViewChild('neighborFound') neighborFoundComp: TemplateRef<any>;
  @ViewChild('newNeighbor') newNeighborComp: TemplateRef<any>;
  @ViewChild('neighborContainer', { read: ViewContainerRef }) neighborContainer;

  neighbor: Neighbor;
  neighborDNI$: Subject<string>;
  neighborID$: Subject<number>;

  /** FORM GROUPS */
  paymentForm: FormGroup;
  paymentFormArr: FormArray;
  neighborGroup: FormGroup;
  paymentGroup: FormGroup;

  /** Observable data */
  paymentMethods: Array<any>;
  banks$: Observable<Array<String>>;

  /** Monthly payments table */
  monthlyPaymentsTblColumns: string[];
  totalMonthlyPaymentsTblColumns: string[];
  monthlyPaymentsSource: MatTableDataSource<MonthlyPayment>;
  monthlyPaymentsSelection: SelectionModel<MonthlyPayment>;
  @ViewChild(MatPaginator) monthlyPaymentsTblpaginator: MatPaginator;
  @ViewChild(MatSort) monthlyPaymentsTblSort: MatSort;

  /** Repairs table */
  repairsTblColumns: string[];
  totalRepairsTblColumns: string[];
  repairsSource: MatTableDataSource<Repair>;
  repairsSelection: SelectionModel<Repair>;
  @ViewChild(MatPaginator) repairsTblpaginator: MatPaginator;
  @ViewChild(MatSort) repairsTblSort: MatSort;

  /** Contributions table */
  neighborContributions: any;
  contributionsTblColumns: string[];
  totalContributionsTblColumns: string[];
  contributionsSource: MatTableDataSource<Contribution>;
  @ViewChild(MatPaginator) contributionsTblpaginator: MatPaginator;

  /** Summary table */
  summarySource: MatTableDataSource<Contribution>;
  summaryElements: any[];
  summaryTblColumns: string[];
  totalSummaryTblColumns: string[];
  availableSummaryTblColumns: string[];
  remaningSummaryTblColumns: string[];

  /** Remaining Amount */
  amountRemaining: number;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private selectOptionsService: SelectOptionsService,
    private neighborService: NeighborService,
    private monthlyPaymentService: MonthlyPaymentService,
    private repairService: RepairService,
    private contributionService: ContributionService
  ) {
    this.paymentMethods = [
      { id: 0, name: 'Efectivo' },
      { id: 1, name: 'Pago movil' },
      { id: 2, name: 'Transferencia' }
    ];
    this.monthlyPaymentsSelection = new SelectionModel<MonthlyPayment>(
      true,
      []
    );
    this.monthlyPaymentsSource = new MatTableDataSource<MonthlyPayment>();
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

    this.neighborContributions = {};
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

    this.summarySource = new MatTableDataSource<any>();
    this.summaryElements = [];
    this.summaryTblColumns = ['title', 'amountTitle'];
    this.totalSummaryTblColumns = ['totalTitle', 'totalSummary'];
    this.availableSummaryTblColumns = ['availableTitle', 'available'];
    this.remaningSummaryTblColumns = ['remainingTitle', 'remainingSummary'];
  }

  ngOnInit() {
    this.buildForm();
    // this.loadInitialData();
    this.setupFormListeners();
  }

  ngAfterViewInit() {
    this.monthlyPaymentsSource.paginator = this.monthlyPaymentsTblpaginator;
    this.monthlyPaymentsSource.sort = this.monthlyPaymentsTblSort;

    this.repairsSource.paginator = this.repairsTblpaginator;
    this.repairsSource.sort = this.repairsTblSort;

    this.contributionsSource.paginator = this.contributionsTblpaginator;
  }

  private buildForm(): void {
    this.paymentFormArr = this.formBuilder.array([
      this.createNeighborGroup(),
      this.createPaymentGroup()
    ]);
    this.neighborGroup = this.paymentFormArr.get([0]) as FormGroup;
    this.paymentGroup = this.paymentFormArr.get([1]) as FormGroup;

    this.paymentForm = this.formBuilder.group({
      paymentFormArr: this.paymentFormArr
    });
  }

  private loadInitialData() {}

  clearFormData() {
    this.monthlyPaymentsSelection.clear();
    this.repairsSelection.clear();
    this.neighborContributions = {};
  }

  private setupFormListeners() {
    this.signal$ = new Subject();

    this.neighborDNI$ = new Subject<string>();
    this.neighborID$ = new Subject<number>();

    this.contributionService
      .getAll()
      .pipe(takeUntil(this.signal$))
      .subscribe((contribs: Contribution[]) => {
        this.contributionsSource.data = contribs.map((el, index) => ({
          ...el,
          position: index + 1
        }));
      });

    this.neighborService
      .getNeighbor(this.neighborDNI$)
      .pipe(takeUntil(this.signal$))
      .subscribe((neighbor: any) => {
        let view;

        if (neighbor.length > 0) {
          this.neighbor = neighbor[0];
          this.neighborGroup.controls['neighborID'].setValue(this.neighbor.id);
          this.neighborID$.next(this.neighbor.id);
          this.removeNeighborControls();
          view = this.neighborFoundComp.createEmbeddedView(null);
        } else {
          view = this.neighborNotFoundComp.createEmbeddedView(null);
          this.neighborGroup.controls['neighborID'].setValue(-1);
        }

        this.clearFormData();
        this.neighborContainer.remove();
        this.neighborContainer.insert(view);
      });

    this.monthlyPaymentService
      .getUnpaidMonthlyPayments(this.neighborID$)
      .pipe(takeUntil(this.signal$))
      .subscribe((monthlyPayments: MonthlyPayment[]) => {
        this.monthlyPaymentsSource.data = monthlyPayments.map((el, index) => ({
          ...el,
          position: index + 1
        }));
      });

    this.repairService
      .getUnpaidRepairs(this.neighborID$)
      .pipe(takeUntil(this.signal$))
      .subscribe((repairs: Repair[]) => {
        this.repairsSource.data = repairs.map((el, index) => ({
          ...el,
          position: index + 1
        }));
      });
  }

  private createNeighborGroup(): FormGroup {
    return this.formBuilder.group({
      neighborDNI: [
        '',
        [
          Validators.required,
          Validators.pattern('^[VE|ve]-[0-9]+'),
          Validators.maxLength(10)
        ]
      ],
      neighborID: ['-1', [Validators.required, Validators.min(0)]]
    });
  }

  private createPaymentGroup(): FormGroup {
    return this.formBuilder.group({
      paymentDate: ['', Validators.required],
      paymentMethod: ['0', Validators.required],
      amount: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]+(.[0-9]+)?$')
        ]
      ]
    });
  }

  get f() {
    return this.paymentForm.controls;
  }

  neighborDNIChange($event) {
    this.neighborDNI$.next($event.target.value);
  }

  private addNeighborControls() {
    this.neighborGroup.addControl(
      'fullName',
      new FormControl('', [
        Validators.required,
        Validators.pattern('^([A-Z]|[a-z]| )+$')
      ])
    );
    this.neighborGroup.addControl(
      'phoneNumber',
      new FormControl('', Validators.pattern('^[0-9]+-[0-9]+$'))
    );
    this.neighborGroup.addControl(
      'email',
      new FormControl('', Validators.email)
    );
    this.neighborGroup.addControl(
      'houseNumber',
      new FormControl('', [
        Validators.required,
        Validators.pattern('^([A-Z]|[a-z])-[0-9]+$')
      ])
    );
  }

  private removeNeighborControls() {
    this.neighborGroup.removeControl('fullName');
    this.neighborGroup.removeControl('phoneNumber');
    this.neighborGroup.removeControl('email');
    this.neighborGroup.removeControl('houseNumber');
  }

  addNeighbor() {
    this.addNeighborControls();
    const view = this.newNeighborComp.createEmbeddedView(null);
    this.neighborContainer.remove();
    this.neighborContainer.insert(view);
  }

  /** ----- MONTHLY PAYMENTS TABLE METHODS ---- */

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
    const costs = this.monthlyPaymentsSelection.selected.map(el => el.cost);
    return costs.reduce((accumulator, el) => accumulator + el, 0);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabelMonthlyPaymentsTbl(row?: any): string {
    if (!row) {
      return `${
        this.isAllMonthlyPaymentsSelected() ? 'select' : 'deselect'
      } all`;
    }
    return `${
      this.monthlyPaymentsSelection.isSelected(row) ? 'deselect' : 'select'
    } row ${row.position + 1}`;
  }

  toggleMonthlyPayment($event, row) {
    this.monthlyPaymentsSelection.toggle(row);
  }

  /** ----- REPAIRS TABLE METHODS ---- */

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
    const costs = this.repairsSelection.selected.map(el => el.cost);
    return costs.reduce((accumulator, el) => accumulator + el, 0);
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
  }

  /** ----- CONTRIBUTIONS TABLE METHODS ---- */
  getTotalContribution() {
    // Se puede implementar de mejor manera
    return Object.values(this.neighborContributions).reduce(
      (accumulator: number, el: number) => accumulator + el,
      0
    );
  }

  private getContributedContributions() {
    return this.contributionsSource.data.reduce((arr, el, index) => {
      if (this.neighborContributions[index] > 0) {
        arr.push({ ...el, amount: this.neighborContributions[index] });
      }
      return arr;
    }, []);
  }

  /* ---------------SUMMARY  TABLE  METHODS---------------- */

  getTotalSummary() {
    return this.summaryElements
      .map(el => el.amount)
      .reduce((accumulator, el) => accumulator + el, 0);
  }

  getAmountRemaining() {
    return this.paymentGroup.controls['amount'].value - this.getTotalSummary();
  }

  isEmptyArr(arr: any[]): boolean {
    return arr.length === 0;
  }

  receiveStep($event) {
    if (this.isLastStep($event.selectedIndex)) {
      this.summaryElements = this.monthlyPaymentsSelection.selected.map(el => {
        return { title: `${el.month} ${el.year}`, amount: el.cost };
      });

      this.summaryElements = this.summaryElements.concat(
        this.repairsSelection.selected.map(el => {
          return { title: el.title, amount: el.cost };
        })
      );

      this.summaryElements = this.summaryElements.concat(
        this.getContributedContributions()
      );
      console.log(this.summaryElements);

      this.summarySource = new MatTableDataSource<any>(this.summaryElements);
    }
  }

  private isLastStep(index): boolean {
    return index === 5;
  }

  /*  --------------------------------------------- */

  get isElectronicPayment(): boolean {
    return this.paymentGroup.get('paymentMethod').value !== '0';
  }

  paymentMethodChange($event) {
    if (this.isElectronicPayment) {
      this.paymentGroup.addControl(
        'bank',
        new FormControl('', Validators.required)
      );
      this.paymentGroup.addControl(
        'paymentID',
        new FormControl('', [
          Validators.required,
          Validators.pattern('^([0-9]|[A-Z]|[a-z])+$')
        ])
      );
      this.banks$ = this.selectOptionsService.getOptions('banks');
    } else {
      this.paymentGroup.removeControl('bank');
      this.paymentGroup.removeControl('paymentID');
    }
  }

  createPayment() {
    if (this.getAmountRemaining() < 0) {
      console.log('El pago no puede ser procesado');
    } else {
      console.log('El pago fue procesado');

      const payment: Payment = {
        ...this.paymentGroup.value,
        neighborID: this.neighborGroup.controls['neighborID'].value,
        monthlyPayments: this.monthlyPaymentsSelection.selected,
        repairs: this.repairsSelection.selected,
        contributions: this.getContributedContributions()
      };

      const paymentModel = new PaymentModel(payment);
      console.log(paymentModel);
    }

    /*
    delete payment.neighbor;

    const paymentModel = new PaymentModel(payment);

    // this.isLoading = true;
    console.log(paymentModel); */
  }

  ngOnDestroy(): void {
    // Signal all streams to complete
    this.signal$.next();
    this.signal$.complete();
  }
}
