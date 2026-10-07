import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/search.component').then((m) => m.SearchComponent),
  },
  {
    path: 'details/:type/:id',
    loadComponent: () =>
      import('./pages/details/details.component').then((m) => m.DetailsComponent),
  },
  {
    path: 'person/:id',
    loadComponent: () =>
      import('./pages/person/person.component').then((m) => m.PersonComponent),
  },
  { path: '**', redirectTo: 'home' },
];