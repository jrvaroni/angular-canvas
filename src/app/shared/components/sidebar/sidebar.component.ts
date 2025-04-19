// src/app/features/canvas/components/sidebar/sidebar.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { HlmTooltipTriggerDirective } from '@spartan-ng/ui-tooltip-helm';
import { BrnTooltipContentDirective } from '@spartan-ng/brain/tooltip';

import { LayerService } from '../../../services/layer.service';
import { Layer, LayerType } from '../../../models/layer.model';
import { lucideChevronDown, lucideChevronUp, lucideEye, lucideEyeOff, lucideFilePlus, lucideFolder, lucideFolderOpen, lucideGitBranch, lucideImage, lucideLock, lucideLockOpen, lucidePencil, lucideSquare, lucideTrash2, lucideType } from '@ng-icons/lucide';

@Component({
  selector: 'app-canvas-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonDirective,
    HlmIconComponent,
    HlmSeparatorDirective,
    HlmTooltipTriggerDirective,
    BrnTooltipContentDirective
  ],
  providers: [
    provideIcons({
        lucideChevronDown,
        lucideFilePlus,
        lucideFolder,
        lucidePencil,
        lucideSquare,
        lucideType,
        lucideImage,
        lucideGitBranch,
        lucideEye,
        lucideEyeOff,
        lucideLock,
        lucideLockOpen,
        lucideChevronUp,
        lucideTrash2,
        lucideFolderOpen
    })
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private layerService = inject(LayerService);
  
  layers: Layer[] = [];
  selectedLayerIds: string[] = [];
  
  // For layer type icons
  LayerType = LayerType;
  
  ngOnInit(): void {
    this.refreshLayers();
  }
  
  /**
   * Refresh the layers list
   */
  refreshLayers(): void {
    this.layers = this.layerService.getLayers()
      .sort((a, b) => b.zIndex - a.zIndex); // Sort by z-index descending
    this.selectedLayerIds = this.layerService.selectedLayers().map(layer => layer.id);
  }
  
  /**
   * Select a layer
   */
  selectLayer(layer: Layer, event: MouseEvent): void {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd key
      this.layerService.selectLayer(layer.id, true);
    } else {
      this.layerService.selectLayer(layer.id, false);
    }
    
    this.refreshLayers();
  }
  
  /**
   * Toggle layer visibility
   */
  toggleVisibility(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    this.layerService.toggleLayerVisibility(layer.id);
    this.refreshLayers();
  }
  
  /**
   * Toggle layer lock
   */
  toggleLock(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    this.layerService.toggleLayerLock(layer.id);
    this.refreshLayers();
  }
  
  /**
   * Move layer up in z-order
   */
  moveLayerUp(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    this.layerService.moveLayerForward(layer.id);
    this.refreshLayers();
  }
  
  /**
   * Move layer down in z-order
   */
  moveLayerDown(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    this.layerService.moveLayerBackward(layer.id);
    this.refreshLayers();
  }
  
  /**
   * Delete a layer
   */
  deleteLayer(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    this.layerService.deleteLayer(layer.id);
    this.refreshLayers();
  }
  
  /**
   * Create a new layer
   */
  createNewLayer(): void {
    this.layerService.createLayer(LayerType.DRAWING, `Layer ${this.layers.length + 1}`);
    this.refreshLayers();
  }
  
  /**
   * Group selected layers
   */
  groupSelectedLayers(): void {
    if (this.selectedLayerIds.length < 2) return;
    
    this.layerService.groupSelectedLayers();
    this.refreshLayers();
  }
  
  /**
   * Ungroup a layer group
   */
  ungroupLayer(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    
    if (layer.type !== LayerType.GROUP) return;
    
    this.layerService.ungroupLayers(layer.id);
    this.refreshLayers();
  }
  
  /**
   * Get icon name for layer type
   */
  getLayerTypeIcon(type: LayerType): string {
    switch (type) {
      case LayerType.DRAWING:
        return 'lucidePencil';
      case LayerType.SHAPE:
        return 'lucideSquare';
      case LayerType.TEXT:
        return 'lucideType';
      case LayerType.IMAGE:
        return 'lucideImage';
      case LayerType.GROUP:
        return 'lucideFolder';
      case LayerType.DIAGRAM:
        return 'lucideGitBranch';
      default:
        return 'lucideFilePlus';
    }
  }
  
  /**
   * Check if a layer is selected
   */
  isSelected(layer: Layer): boolean {
    return this.selectedLayerIds.includes(layer.id);
  }
  
  /**
   * Adjust opacity for a layer
   */
  onOpacityChange(layer: Layer, opacity: number): void {
    this.layerService.setLayerOpacity(layer.id, opacity / 100);
  }
  
  /**
   * Duplicate a layer
   */
  duplicateLayer(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    // Implementation would need layer duplicating functionality in the service
  }
}