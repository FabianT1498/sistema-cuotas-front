import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { NeighborService } from '@data/service/neightbor.service';
import { Neighbor } from '@data/schema/neighbor';
import { NeighborSearch } from '@data/interface/search-neighbors';

export class NeighborsDataSource implements DataSource<Neighbor> {
  private neighborsSubject$ = new BehaviorSubject<Neighbor[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private signal$ = new Subject<any>();

  public loading$ = this.loadingSubject.asObservable();

  constructor(private neighborService: NeighborService) {}

  connect(collectionViewer: CollectionViewer): Observable<Neighbor[]> {
    return this.neighborsSubject$.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.neighborsSubject$.complete();
    this.loadingSubject.complete();
    this.signal$.next();
    this.signal$.complete();
  }

  loadNeighbors(searchData: Observable<NeighborSearch>) {
    this.neighborService
      .getNeighbors(searchData)
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
        this.neighborsSubject$.next(res.data);
      });
  }
}
