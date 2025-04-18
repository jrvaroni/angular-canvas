import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guards';
import { HomeComponent } from './features/home/home.component'
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
    { path: '', pathMatch : 'full', component: HomeComponent, canActivate: [AuthGuard], },
    { path: 'auth/login', component: LoginComponent },
    {
        path         : 'produtos',
        loadChildren : () => import('./features/products/products.route').then(m => m.routes),
    },
    {
        path         : 'clientes',
        loadChildren : () => import('./features/customers/customers.route').then(m => m.routes),
    },
    {
        path         : 'canvas',
        loadChildren : () => import('./features/canvas/canvas.route').then(m => m.routes),
    }
];
