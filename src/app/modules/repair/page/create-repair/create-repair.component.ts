import { Component, OnInit, ViewEncapsulation } from '@angular/core';

/** SERVICES */
import { RepairService } from '@data/service/repair.service';

/** SCHEMAS */
import { Repair, RepairModel } from '@data/schema/repair';
import { catchError, finalize, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { of } from 'rxjs';

@Component({
  selector: 'app-create-repair',
  templateUrl: './create-repair.component.html',
  styleUrls: ['./create-repair.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateRepairComponent implements OnInit {
  isLoading: boolean;
  formValuesValid: Repair | null;

  constructor(private repairService: RepairService, private router: Router) {}

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isLoading = false;
    this.formValuesValid = null;
  }

  public receiveFormValuesValid($event) {
    this.formValuesValid = $event;
  }

  createRepair() {
    if (!this.formValuesValid) {
      console.log('La reparación no puede ser procesada porque es null');
    } else {
      this.isLoading = true;

      const repairModel = new RepairModel(this.formValuesValid);
      console.log(repairModel);

      this.repairService
        .createRepair(repairModel)
        .pipe(
          take(1),
          catchError(err => {
            console.log(err.message);
            return of(err);
          }),
          finalize(() => (this.isLoading = false))
        )
        .subscribe(res => {
          console.log(res);

          if (res.status === 1) {
            this.router.navigate(['/reparaciones']);
          }
        });
    }
  }
}
