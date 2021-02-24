import { Component, OnInit, ViewEncapsulation } from '@angular/core';

/** SERVICES */
import { NeighborService } from '@data/service/neightbor.service';

/** SCHEMAS */
import { Neighbor, NeighborModel } from '@data/schema/neighbor';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-neighbor',
  templateUrl: './create-neighbor.component.html',
  styleUrls: ['./create-neighbor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateNeighborComponent implements OnInit {
  isLoading: boolean;
  formValuesValid: Neighbor | null;

  constructor(
    private neighborService: NeighborService,
    private router: Router
  ) {}

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

  createNeighbor() {
    if (!this.formValuesValid) {
      console.log('El vecino no puede ser procesado porque es null');
    } else {
      this.isLoading = true;

      const neighborModel = new NeighborModel(this.formValuesValid);
      console.log(neighborModel);

      this.neighborService
        .createNeighbor(neighborModel)
        .pipe(take(1))
        .subscribe(res => {
          console.log(res);
          this.isLoading = false;
          this.router.navigate(['/vecinos']);
        });
    }
  }
}
