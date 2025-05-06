// src/app/features/canvas/components/toolbar/toolbar.component.ts

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BrnTooltipContentDirective } from '@spartan-ng/brain/tooltip';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { HlmTooltipTriggerDirective } from '@spartan-ng/ui-tooltip-helm';

import {
  lucideCircle,
  lucideCircleMinus,
  lucideCirclePlus,
  lucideCombine,
  lucideDownload,
  lucideEraser,
  lucideHand,
  lucideMaximize,
  lucideMove,
  lucidePen,
  lucidePointer,
  lucideRedo2,
  lucideSettings,
  lucideSlash,
  lucideSquare,
  lucideTrash2,
  lucideType,
  lucideUndo2,
} from '@ng-icons/lucide';
import { HlmTooltipModule } from '../../../../../libs/ui/ui-tooltip-helm/src/index';
import { Tool, ToolConfig } from '../../../models/tool.model';
import { ToolService } from '../../../services/tool.service';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { ToolPropertiesComponent } from '../tool-properties/tool-properties.component';

@Component({
  selector: 'app-canvas-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonDirective,
    HlmIconComponent,
    HlmSeparatorDirective,
    HlmTooltipTriggerDirective,
    BrnTooltipContentDirective,
    ColorPickerComponent,
    ToolPropertiesComponent,
    HlmTooltipModule,
  ],
  providers: [
    provideIcons({
      lucidePointer,
      lucideMove,
      lucidePen,
      lucideSlash,
      lucideSquare,
      lucideCircle,
      lucideType,
      lucideEraser,
      lucideCombine,
      lucideHand,
      lucideUndo2,
      lucideRedo2,
      lucideTrash2,
      lucideDownload,
      lucideCircleMinus,
      lucideCirclePlus,
      lucideMaximize,
      lucideSettings,
    }),
  ],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  private toolService = inject(ToolService);

  tools: ToolConfig[] = [];
  activeTool: Tool = Tool.SELECT;

  // Changed from zoom to currentZoom
  @Input() currentZoom: number = 1;
  @Output() zoomChange = new EventEmitter<number>();

  // Action outputs
  @Output() undoAction = new EventEmitter<void>();
  @Output() redoAction = new EventEmitter<void>();
  @Output() clearAction = new EventEmitter<void>();
  @Output() exportAction = new EventEmitter<void>();

  zoomLevels: number[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5];
  showProperties: boolean = false;

  ngOnInit(): void {
    this.tools = this.toolService.getTools();
    this.activeTool = this.toolService.getActiveTool();
  }

  /**
   * Set the active tool
   */
  setTool(tool: Tool): void {
    this.activeTool = tool;
    this.toolService.setActiveTool(tool);
    this.showProperties = true;
  }

  /**
   * Check if a tool is the active tool
   */
  isActiveTool(tool: Tool): boolean {
    return this.activeTool === tool;
  }

  /**
   * Set the zoom level
   */
  setZoom(zoom: number): void {
    this.currentZoom = zoom;
    this.zoomChange.emit(zoom);
  }

  /**
   * Zoom in by one level
   */
  zoomIn(): void {
    const currentIndex = this.zoomLevels.indexOf(this.currentZoom);
    if (currentIndex < this.zoomLevels.length - 1) {
      this.setZoom(this.zoomLevels[currentIndex + 1]);
    }
  }

  /**
   * Zoom out by one level
   */
  zoomOut(): void {
    const currentIndex = this.zoomLevels.indexOf(this.currentZoom);
    if (currentIndex > 0) {
      this.setZoom(this.zoomLevels[currentIndex - 1]);
    }
  }

  /**
   * Reset zoom to 100%
   */
  resetZoom(): void {
    this.setZoom(1);
  }

  /**
   * Toggle properties panel
   */
  toggleProperties(): void {
    this.showProperties = !this.showProperties;
  }

  /**
   * Handle undo action
   */
  undo(): void {
    this.undoAction.emit();
  }

  /**
   * Handle redo action
   */
  redo(): void {
    this.redoAction.emit();
  }

  /**
   * Clear the canvas
   */
  clearCanvas(): void {
    this.clearAction.emit();
  }

  /**
   * Export the canvas as an image
   */
  exportCanvas(): void {
    this.exportAction.emit();
  }
}
