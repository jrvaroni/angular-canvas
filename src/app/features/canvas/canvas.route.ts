import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./view/view.component').then((c) => c.ViewComponent),
      },
    ],
  },
];
