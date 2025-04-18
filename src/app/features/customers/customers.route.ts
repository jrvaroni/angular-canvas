// Angular modules
import { Routes } from '@angular/router';

export const routes : Routes = [
  {
    path     : '',
    children : [
      {
        path          : '',
        loadComponent : () => import('./list/customers-list.component').then(c => c.CustomersListComponent),
      },
      {
        path          : 'cadastro',
        loadComponent : () => import('./forms/customers-forms.component').then(c => c.CustomersFormsComponent),
      },
      {
        path          : ':id',
        loadComponent : () => import('./forms/customers-forms.component').then(c => c.CustomersFormsComponent),
      },
    ]
  }
];