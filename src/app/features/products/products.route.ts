// Angular modules
import { Routes } from '@angular/router';

export const routes : Routes = [
  {
    path     : '',
    children : [
      {
        path          : '',
        loadComponent : () => import('./list/products-list.component').then(c => c.ProductsListComponent),
      },
      {
        path          : 'cadastro',
        loadComponent : () => import('./forms/products-forms.component').then(c => c.ProductsFormsComponent),
      },
      {
        path          : ':id',
        loadComponent : () => import('./forms/products-forms.component').then(c => c.ProductsFormsComponent),
      },
    ]
  }
];