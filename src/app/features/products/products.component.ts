import { Component } from '@angular/core';
import { globalModules } from '../../global-imports'

@Component({
    selector: 'app-products',
    standalone: true,
    host: {
        class: 'block',
    },
    imports: [
        globalModules,
    ],
  templateUrl: './products.component.html',
})
export class ProductsComponent { }