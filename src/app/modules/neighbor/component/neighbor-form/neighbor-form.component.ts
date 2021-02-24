import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** SCHEMAS */
import { Neighbor } from '@data/schema/neighbor';

@Component({
  selector: 'app-neighbor-form',
  templateUrl: './neighbor-form.component.html',
  styleUrls: ['./neighbor-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NeighborFormComponent implements OnInit {
  /** FORM GROUPS */
  neighborForm: FormGroup;

  @Input()
  public neighbor?: Neighbor;

  @Output()
  formValuesValid = new EventEmitter<Neighbor | null>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.buildForm();
    this.addFormListeners();
  }

  private buildForm(): void {
    this.neighborForm = this.formBuilder.group({
      id: [this.neighbor ? this.neighbor.id : -1, [Validators.required]],
      dni: [
        this.neighbor ? this.neighbor.dni : '',
        [
          Validators.required,
          Validators.pattern('^[VE|ve]-[0-9]+'),
          Validators.minLength(7),
          Validators.maxLength(10)
        ]
      ],
      fullName: [
        this.neighbor ? this.neighbor.fullName : '',
        [Validators.required, Validators.pattern('^([A-Z]|[a-z]| )+$')]
      ],
      phoneNumber: [
        this.neighbor ? this.neighbor.phoneNumber : '',
        [Validators.pattern('^[0-9]+-[0-9]+$')]
      ],
      email: [this.neighbor ? this.neighbor.email : '', [Validators.email]],
      houseNumber: [
        this.neighbor ? this.neighbor.houseNumber : '',
        [Validators.required, Validators.pattern('^([A-Z]|[a-z])-[0-9]+$')]
      ],
      street: [
        this.neighbor ? this.neighbor.street : '',
        [Validators.required, Validators.pattern('^([A-Z]|[a-z]| )+$')]
      ]
    });
  }

  private addFormListeners() {
    this.neighborForm.valueChanges.subscribe(next => {
      this.neighborForm.valid
        ? this.formValuesValid.emit(this.neighborForm.value)
        : this.formValuesValid.emit(null);
    });
  }

  get f() {
    return this.neighborForm.controls;
  }
}
