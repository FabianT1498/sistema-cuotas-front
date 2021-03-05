import { Component, OnInit, ViewEncapsulation } from '@angular/core';

/** SERVICES */
import { RepairService } from '@data/service/repair.service';

/** SCHEMAS */
import { Repair, RepairModel } from '@data/schema/repair';
import { catchError, finalize, take, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

@Component({
  selector: 'app-update-repair',
  templateUrl: './update-repair.component.html',
  styleUrls: ['./update-repair.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateRepairComponent implements OnInit {
  isLoading: boolean;
  formValuesValid: Repair | null;
  repair: Repair;

  constructor(
    private repairService: RepairService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isLoading = false;
    this.formValuesValid = null;

    this.repair = this.route.snapshot.data['repair'];

    if (!this.repair) {
      this.router.navigate(['/reparaciones']);
    }
  }

  public receiveFormValuesValid($event) {
    this.formValuesValid = $event;
  }

  updateRepair() {
    if (!this.formValuesValid) {
      console.log('La reparación no puede ser procesada porque es null');
    } else {
      this.isLoading = true;

      const repairModel = new RepairModel(this.formValuesValid);
      console.log(repairModel);

      this.repairService
        .updateRepair(repairModel)
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
