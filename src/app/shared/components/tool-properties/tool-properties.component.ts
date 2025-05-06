// src/app/features/canvas/components/tool-properties/tool-properties.component.ts

import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';

import { Tool, ToolOption } from '../../../models/tool.model';
import { ToolService } from '../../../services/tool.service';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { ToolNamePipe } from "../../pipes/name-tool.pipe";

import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';

@Component({
  selector: 'app-tool-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonDirective,
    HlmInputDirective,
    HlmLabelDirective,
    HlmSeparatorDirective,
    ColorPickerComponent,
    ToolNamePipe,
    BrnSelectImports,
    HlmSelectImports
],
  templateUrl: './tool-properties.component.html',
  styleUrls: ['./tool-properties.component.scss']
})
export class ToolPropertiesComponent implements OnChanges {
  private toolService = inject(ToolService);
  
  @Input() tool: Tool = Tool.SELECT;
  
  // Current tool options
  options: ToolOption | null = null;
  
  selectedFont = this.options?.fontFamily || 'Arial';

  // For template type checking
  Tool = Tool;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tool']) {
      this.loadToolOptions();
    }
  }
  
  /**
   * Load options for the current tool
   */
  loadToolOptions(): void {
    const toolOptions = this.toolService.getToolOptions(this.tool);
    this.options = toolOptions ? { ...toolOptions } : {};
  }
  
  /**
   * Update tool options and save to service
   */
  updateOptions(): void {
    this.toolService.updateToolOptions(this.tool, this.options!);
  }
  
  /**
   * Update stroke color
   */
  onStrokeColorChange(color: string): void {
    this.options!.strokeColor = color;
    this.updateOptions();
  }
  
  /**
   * Update fill color
   */
  onFillColorChange(color: string): void {
    this.options!.fillColor = color;
    this.updateOptions();
  }
  
  /**
   * Update stroke width
   */
  onStrokeWidthChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.options!.strokeWidth = Number(target.value);
    this.updateOptions();
  }
  
  /**
   * Update opacity
   */
  onOpacityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.options!.opacity = Number(target.value) / 100;
    this.updateOptions();
  }
  
  /**
   * Update font size
   */
  onFontSizeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.options!.fontSize = Number(target.value);
    this.updateOptions();
  }
  
  /**
   * Update font family
   */
  onFontFamilyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.options!.fontFamily = target.value;
    this.updateOptions();
  }
  
  /**
   * Toggle start arrow
   */
  toggleStartArrow(): void {
    this.options!.arrowStart = !this.options!.arrowStart;
    this.updateOptions();
  }
  
  /**
   * Toggle end arrow
   */
  toggleEndArrow(): void {
    this.options!.arrowEnd = !this.options!.arrowEnd;
    this.updateOptions();
  }
  
  /**
   * Reset tool options to defaults
   */
  resetOptions(): void {
    this.toolService.resetToolOptions(this.tool);
    this.loadToolOptions();
    this.selectedFont = this.options?.fontFamily || 'Arial';
  }
}