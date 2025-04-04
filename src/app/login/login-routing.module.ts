import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPage } from './login.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPage,
    children: [
      {
        path: 'sign-in',
        loadChildren: () => import('./sign-in/sign-in.module').then( m => m.SignInPageModule)
      },
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPageRoutingModule {}
