import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { RepairService } from '@data/service/repair.service';
import { Repair } from '@data/schema/repair';
import { RepairSearch } from '@data/interface/search-repairs';

export class RepairsDataSource implements DataSource<Repair> {
  private repairsSubject = new BehaviorSubject<Repair[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private signal$ = new Subject<any>();

  public loading$ = this.loadingSubject.asObservable();

  constructor(private repairService: RepairService) {}

  connect(collectionViewer: CollectionViewer): Observable<Repair[]> {
    return this.repairsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.repairsSubject.complete();
    this.loadingSubject.complete();
    this.signal$.next();
    this.signal$.complete();
  }

  loadRepairs(searchData: Observable<RepairSearch>) {
    this.repairService
      .getRepairs(searchData)
      .pipe(
        takeUntil(this.signal$),
        catchError(() => of([])),
        tap((next: any) => {
          this.loadingSubject.next(true);
        })
      )
      .subscribe(res => {
        console.log(res);
        this.loadingSubject.next(false);
        this.repairsSubject.next(res.data);
      });
  }
}
