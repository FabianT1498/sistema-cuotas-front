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
import { Repair } from '@data/schema/repair';

@Injectable({
  providedIn: 'root'
})
export class EditRepairResolver implements Resolve<Repair> {
  constructor(private repairService: RepairService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Repair> {
    return this.repairService
      .editRepair(route.paramMap.get('id'))
      .pipe(map(res => res));
  }
}
