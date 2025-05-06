// src/app/features/canvas/components/sidebar/sidebar.component.ts

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BrnTooltipContentDirective } from '@spartan-ng/brain/tooltip';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { HlmTooltipTriggerDirective } from '@spartan-ng/ui-tooltip-helm';

import {
  lucideChevronDown,
  lucideChevronUp,
  lucideCopy,
  lucideEye,
  lucideEyeOff,
  lucideFilePlus,
  lucideFolder,
  lucideFolderOpen,
  lucideImage,
  lucideLock,
  lucideLockOpen,
  lucideNetwork,
  lucidePencil,
  lucideSquare,
  lucideTrash2,
  lucideType,
} from '@ng-icons/lucide';
import { HlmTooltipModule } from '../../../../../libs/ui/ui-tooltip-helm/src/index';
import { Layer, LayerType } from '../../../models/layer.model';
import { LayerService } from '../../../services/layer.service';

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
    BrnTooltipContentDirective,
    HlmTooltipModule,
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
      lucideNetwork,
      lucideEye,
      lucideEyeOff,
      lucideLock,
      lucideLockOpen,
      lucideChevronUp,
      lucideTrash2,
      lucideFolderOpen,
      lucideCopy,
    }),
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  private layerService = inject(LayerService);
  private destroyRef = inject(DestroyRef);

  // For layer type icons
  LayerType = LayerType;

  readonly layers = computed(() => {
    return this.layerService.getLayers().sort((a, b) => b.zIndex - a.zIndex); // Ordenar por z-index (do maior para o menor)
  });

  readonly selectedLayerIds = computed(() => {
    return this.layerService.selectedLayers().map((layer) => layer.id);
  });

  ngOnInit(): void {}

  /**
   * Select a layer
   */
  selectLayer(layer: Layer, event: MouseEvent): void {
    if (event.ctrlKey || event.metaKey) {
      // Seleção múltipla com tecla Ctrl/Cmd
      this.layerService.selectLayer(layer.id, true);
    } else {
      this.layerService.selectLayer(layer.id, false);
    }
  }

  /**
   * Toggle layer visibility
   */
  toggleVisibility(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    this.layerService.toggleLayerVisibility(layer.id);
  }

  /**
   * Toggle layer lock
   */
  toggleLock(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    this.layerService.toggleLayerLock(layer.id);
  }

  /**
   * Move layer up in z-order
   */
  moveLayerUp(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    this.layerService.moveLayerForward(layer.id);
  }

  /**
   * Move layer down in z-order
   */
  moveLayerDown(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    this.layerService.moveLayerBackward(layer.id);
  }

  /**
   * Delete a layer
   */
  deleteLayer(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    this.layerService.deleteLayer(layer.id);
  }

  /**
   * Create a new layer
   */
  createNewLayer(): void {
    this.layerService.createLayer(LayerType.DRAWING, `Layer ${this.layers.length + 1}`);
  }

  /**
   * Group selected layers
   */
  groupSelectedLayers(): void {
    if (this.selectedLayerIds.length < 2) return;

    this.layerService.groupSelectedLayers();
  }

  /**
   * Ungroup a layer group
   */
  ungroupLayer(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();

    if (layer.type !== LayerType.GROUP) return;

    this.layerService.ungroupLayers(layer.id);
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
        return 'lucideNetwork';
      default:
        return 'lucideFilePlus';
    }
  }

  /**
   * Check if a layer is selected
   */
  isSelected(layer: Layer): boolean {
    return this.selectedLayerIds().includes(layer.id);
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

    // Cria uma cópia profunda da camada
    const layerCopy = JSON.parse(JSON.stringify(layer));

    // Remove o ID para que um novo seja gerado
    delete layerCopy.id;

    // Atualiza o nome para indicar que é uma cópia
    layerCopy.name = `${layer.name} (Cópia)`;

    // Desloca levemente a posição para que seja visível
    if (layerCopy.bounds) {
      layerCopy.bounds.x += 20;
      layerCopy.bounds.y += 20;
    }

    // Cria a nova camada
    const newLayer = this.layerService.createLayer(layer.type, layerCopy.name, layerCopy);

    // Seleciona a nova camada duplicada
    this.layerService.selectLayer(newLayer.id, false);
  }
}
