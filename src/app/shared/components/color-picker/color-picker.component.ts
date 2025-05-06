// src/app/features/canvas/components/color-picker/color-picker.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonDirective
  ],
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent {
  @Input() color: string = '#000000';
  @Output() colorChange = new EventEmitter<string>();
  
  isOpen: boolean = false;
  
  // Common colors palette
  commonColors: string[] = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FF9900', '#9900FF',
    'transparent'
  ];
  
  /**
   * Toggle color picker
   */
  togglePicker(): void {
    this.isOpen = !this.isOpen;
  }
  
  /**
   * Close color picker
   */
  closePicker(): void {
    this.isOpen = false;
  }
  
  /**
   * Handle color selection from the palette
   */
  selectColor(color: string): void {
    this.color = color;
    this.colorChange.emit(this.color);
    this.closePicker();
  }
  
  /**
   * Handle color input change
   */
  onColorInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.color = target.value;
    this.colorChange.emit(this.color);
  }
}