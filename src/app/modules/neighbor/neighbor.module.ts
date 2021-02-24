import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { NeighborComponent } from './page/neighbor.component';
import { CreateNeighborComponent } from './page/create-neighbor/create-neighbor.component';
import { UpdateNeighborComponent } from './page/update-neighbor/update-neighbor.component';
import { NeighborFormComponent } from './component/neighbor-form/neighbor-form.component';

import { NeighborRoutingModule } from './neighbor.routing';

@NgModule({
  declarations: [
    NeighborComponent,
    CreateNeighborComponent,
    UpdateNeighborComponent,
    NeighborFormComponent
  ],
  imports: [SharedModule, NeighborRoutingModule],
  exports: [],
  providers: []
})
export class NeighborModule {}
