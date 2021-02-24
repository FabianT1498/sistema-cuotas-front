import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { NeighborService } from '@data/service/neightbor.service';
import { Neighbor } from '@data/schema/neighbor';

@Injectable({
  providedIn: 'root'
})
export class EditNeighborResolver implements Resolve<Neighbor> {
  constructor(
    private neighborService: NeighborService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Neighbor> {
    return this.neighborService
      .editNeighbor(route.paramMap.get('id'))
      .pipe(map(res => res));
  }
}
