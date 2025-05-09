import { Component } from '@angular/core';
import { globalModules } from '../../global-imports';

@Component({
  selector: 'app-home',
  standalone: true,
  host: {
    class: 'block',
  },
  imports: [globalModules],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
