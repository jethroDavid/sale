import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckerPage } from './checker.page';

const routes: Routes = [
  {
    path: '',
    component: CheckerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckerPageRoutingModule {}
