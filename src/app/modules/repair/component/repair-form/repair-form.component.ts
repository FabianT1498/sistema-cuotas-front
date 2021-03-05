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
import { Repair } from '@data/schema/repair';

@Component({
  selector: 'app-repair-form',
  templateUrl: './repair-form.component.html',
  styleUrls: ['./repair-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RepairFormComponent implements OnInit {
  /** FORM GROUPS */
  repairForm: FormGroup;

  @Input()
  public repair?: Repair;

  @Output()
  formValuesValid = new EventEmitter<Repair | null>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.buildForm();
    this.addFormListeners();
  }

  private buildForm(): void {
    this.repairForm = this.formBuilder.group({
      id: [this.repair ? this.repair.id : -1, [Validators.required]],
      title: [
        this.repair ? this.repair.title : '',
        [Validators.required, Validators.maxLength(250)]
      ],
      description: [
        this.repair ? this.repair.description : '',
        [Validators.maxLength(500)]
      ],
      issueDate: [
        this.repair ? this.repair.issueDate : '',
        Validators.required
      ],
      cost: [
        this.repair ? this.repair.cost : 0,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]+(.[0-9]+)?$')
        ]
      ]
    });
  }

  private addFormListeners() {
    this.repairForm.valueChanges.subscribe(next => {
      this.repairForm.valid
        ? this.formValuesValid.emit(this.repairForm.value)
        : this.formValuesValid.emit(null);
    });
  }

  get f() {
    return this.repairForm.controls;
  }
}
