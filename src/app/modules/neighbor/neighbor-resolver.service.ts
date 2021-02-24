import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { NeighborService } from '@data/service/neightbor.service';

@Injectable({
  providedIn: 'root'
})
export class NeighborResolver implements Resolve<number> {
  constructor(
    private neighborService: NeighborService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<number> {
    return this.neighborService.getNeighborsCount().pipe(map(res => res));
  }
}
