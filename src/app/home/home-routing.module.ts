import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'tracker',
        loadChildren: () => import('../pages/tracker/tracker.module').then(m => m.TrackerPageModule)
      },
      {
        path: 'checker',
        loadChildren: () => import('../pages/checker/checker.module').then(m => m.CheckerPageModule)
      },
      {
        path: 'pick',
        loadChildren: () => import('../pages/pick/pick.module').then(m => m.PickPageModule)
      },
      {
        path: '',
        redirectTo: 'tracker',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
