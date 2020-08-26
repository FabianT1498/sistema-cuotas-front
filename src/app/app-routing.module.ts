import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContentLayoutComponent } from './layout/content-layout/content-layout.component';
import { NoAuthGuard } from '@app/guard/no-auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard/home',
    pathMatch: 'full'
  },
  {
    path: '',
    component: ContentLayoutComponent,
    canActivate: [NoAuthGuard], // Should be replaced with actual auth guard
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@modules/home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'pagos',
        loadChildren: () =>
          import('@modules/payment/payment.module').then(m => m.PaymentModule)
      },
      {
        path: 'vecinos',
        loadChildren: () =>
          import('@modules/contact/contact.module').then(m => m.ContactModule)
      },
      {
        path: 'cuotas',
        loadChildren: () =>
          import('@modules/contact/contact.module').then(m => m.ContactModule)
      },
      {
        path: 'hojas-calculo',
        loadChildren: () =>
          import('@modules/contact/contact.module').then(m => m.ContactModule)
      }
    ]
  },
  // Fallback when no prior routes is matched
  { path: '**', redirectTo: '/dashboard/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
