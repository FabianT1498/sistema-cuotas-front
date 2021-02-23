import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { RepairService } from '@data/service/repair.service';

@Injectable({
  providedIn: 'root'
})
export class RepairResolver implements Resolve<number> {
  constructor(private repairService: RepairService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<number> {
    return this.repairService.getRepairsCount().pipe(map(res => res));
  }
}
