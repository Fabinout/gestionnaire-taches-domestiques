import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {authGuard} from './guards/auth.guard';

export const routes: Routes = [
  // Route protégée : Seul un utilisateur connecté peut y accéder
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('../home/home.component').then(m => m.HomeComponent)
  },
  // Route publique
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  // {
  //   path: 'tasks',
  //   canActivate: [authGuard],
  //   loadComponent: () => null
  // },
  {path: '', redirectTo: '/home', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
