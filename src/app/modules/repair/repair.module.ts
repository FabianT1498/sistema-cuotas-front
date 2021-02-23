import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { RepairComponent } from './page/repair.component';
import { CreateRepairComponent } from './page/create-repair/create-repair.component';
import { UpdateRepairComponent } from './page/update-repair/update-repair.component';
import { RepairFormComponent } from './component/repair-form/repair-form.component';

import { RepairRoutingModule } from './repair.routing';

@NgModule({
  declarations: [
    RepairComponent,
    CreateRepairComponent,
    UpdateRepairComponent,
    RepairFormComponent
  ],
  imports: [SharedModule, RepairRoutingModule],
  exports: [],
  providers: []
})
export class RepairModule {}
