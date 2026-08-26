import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '',
    loadComponent: () => import('./home.component').then((m) => m.HomeComponent),
    children: [
      {
        path: 'mfe1',
        loadComponent: () => loadRemoteModule('mfe1', './Component').then((module) => module.App),
      },
    ],
  },

  {
    path: 'login',
    loadComponent: () => import('./login.component').then((m) => m.LoginComponent),
  },
  { path: '**', redirectTo: 'home' },
];
