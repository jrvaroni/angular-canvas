import { Component } from '@angular/core';
import { globalModules } from '../../global-imports'

@Component({
    selector: 'app-customers',
    standalone: true,
    host: {
        class: 'block',
    },
    imports: [
        globalModules,
    ],
  templateUrl: './customers.component.html',
})
export class CustomersComponent { }