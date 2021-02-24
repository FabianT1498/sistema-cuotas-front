import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NeighborComponent } from './page/neighbor.component';
import { CreateNeighborComponent } from './page/create-neighbor/create-neighbor.component';
import { UpdateNeighborComponent } from './page/update-neighbor/update-neighbor.component';

import { NeighborResolver } from './neighbor-resolver.service';
import { EditNeighborResolver } from './edit-neighbor-resolver.service';

export const routes: Routes = [
  {
    path: '',
    component: NeighborComponent,
    pathMatch: 'full',
    resolve: {
      neighborsCount: NeighborResolver
    }
  },
  {
    path: ':id/editar',
    component: UpdateNeighborComponent,
    resolve: {
      neighbor: EditNeighborResolver
    }
  },
  {
    path: 'crear',
    component: CreateNeighborComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NeighborRoutingModule {}
