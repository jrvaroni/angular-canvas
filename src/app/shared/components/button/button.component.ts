import { Component, Input } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  selector: 'r-button',
  standalone: true,
  imports: [
    HlmButtonDirective
],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
    @Input() variant: 'secondary' | 'destructive' | 'outline' | 'ghost'  | 'link' | null = null
}