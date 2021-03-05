import { Component, OnInit, ViewEncapsulation } from '@angular/core';

/** SERVICES */
import { NeighborService } from '@data/service/neightbor.service';

/** SCHEMAS */
import { Neighbor, NeighborModel } from '@data/schema/neighbor';
import { catchError, finalize, take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

@Component({
  selector: 'app-update-neighbor',
  templateUrl: './update-neighbor.component.html',
  styleUrls: ['./update-neighbor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateNeighborComponent implements OnInit {
  isLoading: boolean;
  formValuesValid: Neighbor | null;
  neighbor: Neighbor;

  constructor(
    private neighborService: NeighborService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isLoading = false;
    this.formValuesValid = null;

    this.neighbor = this.route.snapshot.data['neighbor'];

    if (!this.neighbor) {
      this.router.navigate(['/vecinos']);
    }
  }

  public receiveFormValuesValid($event) {
    this.formValuesValid = $event;
  }

  updateNeighbor() {
    if (!this.formValuesValid) {
      console.log('El vecino no puede ser procesado porque es null');
    } else {
      this.isLoading = true;

      const neighborModel = new NeighborModel(this.formValuesValid);
      console.log(neighborModel);

      this.neighborService
        .updateNeighbor(neighborModel)
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
            this.router.navigate(['/vecinos']);
          }
        });
    }
  }
}
