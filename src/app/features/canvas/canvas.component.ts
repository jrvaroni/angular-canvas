import { Component } from '@angular/core';
import { globalModules } from '../../global-imports';

@Component({
  selector: 'app-canvas',
  standalone: true,
  host: {
    class: 'block',
  },
  imports: [globalModules],
  templateUrl: './canvas.component.html',
})
export class CanvasComponent {}
