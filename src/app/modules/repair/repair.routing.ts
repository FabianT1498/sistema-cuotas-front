import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateRepairComponent } from './page/create-repair/create-repair.component';
import { RepairComponent } from './page/repair.component';

import { UpdateRepairComponent } from './page/update-repair/update-repair.component';
import { RepairResolver } from './repair-resolver.service';
import { EditRepairResolver } from './edit-repair-resolver.service';

export const routes: Routes = [
  {
    path: '',
    component: RepairComponent,
    pathMatch: 'full',
    resolve: {
      repairsCount: RepairResolver
    }
  },
  {
    path: ':id/editar',
    component: UpdateRepairComponent,
    resolve: {
      repair: EditRepairResolver
    }
  },
  {
    path: 'crear',
    component: CreateRepairComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepairRoutingModule {}
