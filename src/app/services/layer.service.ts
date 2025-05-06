// src/app/features/canvas/services/layer.service.ts

import { Injectable, Injector, Signal, computed, effect, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionType } from '../models/history.model';
import { Layer, LayerType } from '../models/layer.model';
import { CanvasService } from './canvas.service';
import { HistoryService } from './history.service';

function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `layer_${timestamp}_${randomPart}`;
}

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  private canvasService = inject(CanvasService);
  private historyService = inject(HistoryService);
  private injector = inject(Injector);

  // Layers state
  private layers = signal<Layer[]>([]);
  private selectedLayerIds = signal<string[]>([]);
  private layersSubject = new BehaviorSubject<Layer[]>([]);

  // Computed values
  readonly visibleLayers: Signal<Layer[]> = computed(() =>
    this.layers()
      .filter((layer) => layer.visible)
      .sort((a, b) => a.zIndex - b.zIndex)
  );

  readonly selectedLayers: Signal<Layer[]> = computed(() =>
    this.layers().filter((layer) => this.selectedLayerIds().includes(layer.id))
  );

  readonly hasSelection: Signal<boolean> = computed(() => this.selectedLayerIds().length > 0);

  constructor() {
    // Initialize with a default layer
    this.createLayer(LayerType.DRAWING, 'Background Layer');

    effect(() => {
      // Quando o signal de layers mudar, atualize o BehaviorSubject
      this.layersSubject.next(this.layers());
    });
  }

  /**
   * Create a new layer
   */
  createLayer(type: LayerType, name: string, options: Partial<Layer> = {}): Layer {
    const layerCount = this.layers().length;

    const newLayer: Layer = {
      id: generateId(),
      name: name || `Layer ${layerCount + 1}`,
      type,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: layerCount,
      bounds: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      ...options,
    };

    this.layers.update((layers) => [...layers, newLayer]);

    // Record action for history
    this.historyService.addAction({
      type: ActionType.ADD_LAYER,
      layerIds: [newLayer.id],
      data: { layer: newLayer },
    });

    // Re-render canvas
    this.canvasService.render();

    return newLayer;
  }

  /**
   * Get all layers
   */
  getLayers(): Layer[] {
    return this.layers();
  }

  /**
   * Get layer by ID
   */
  getLayerById(id: string): Layer | undefined {
    return this.layers().find((layer) => layer.id === id);
  }

  /**
   * Update a layer
   */
  updateLayer(id: string, updates: Partial<Layer>): void {
    const originalLayer = this.getLayerById(id);

    if (!originalLayer) return;

    this.layers.update((layers) => layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)));

    // Record action for history
    this.historyService.addAction({
      type: ActionType.MODIFY_LAYER,
      layerIds: [id],
      data: { updates },
      previousState: originalLayer,
    });

    // Re-render canvas
    this.canvasService.render();
  }

  /**
   * Delete layer by ID
   */
  deleteLayer(id: string): void {
    const layerToDelete = this.getLayerById(id);

    if (!layerToDelete) return;

    // Remove from selected layers if selected
    if (this.selectedLayerIds().includes(id)) {
      this.deselectLayer(id);
    }

    this.layers.update((layers) => layers.filter((layer) => layer.id !== id));

    // Record action for history
    this.historyService.addAction({
      type: ActionType.REMOVE_LAYER,
      layerIds: [id],
      previousState: layerToDelete,
    });

    // Re-render canvas
    this.canvasService.render();
  }

  /**
   * Change layer visibility
   */
  toggleLayerVisibility(id: string): void {
    const layer = this.getLayerById(id);

    if (!layer) return;

    this.updateLayer(id, { visible: !layer.visible });
  }

  /**
   * Toggle layer lock status
   */
  toggleLayerLock(id: string): void {
    const layer = this.getLayerById(id);

    if (!layer) return;

    this.updateLayer(id, { locked: !layer.locked });
  }

  /**
   * Change layer opacity
   */
  setLayerOpacity(id: string, opacity: number): void {
    // Ensure opacity is between 0 and 1
    const clampedOpacity = Math.max(0, Math.min(1, opacity));

    this.updateLayer(id, { opacity: clampedOpacity });
  }

  /**
   * Select a layer
   */
  selectLayer(id: string, addToSelection: boolean = false): void {
    const layer = this.getLayerById(id);

    if (!layer) return;

    if (addToSelection) {
      this.selectedLayerIds.update((ids) => (ids.includes(id) ? ids : [...ids, id]));
    } else {
      this.selectedLayerIds.set([id]);
    }

    // Update canvas service selection
    this.canvasService.selectLayers(this.selectedLayerIds());
  }

  /**
   * Deselect a layer
   */
  deselectLayer(id: string): void {
    this.selectedLayerIds.update((ids) => ids.filter((layerId) => layerId !== id));

    // Update canvas service selection
    this.canvasService.selectLayers(this.selectedLayerIds());
  }

  /**
   * Select multiple layers
   */
  selectLayers(ids: string[]): void {
    this.selectedLayerIds.set(ids);

    // Update canvas service selection
    this.canvasService.selectLayers(ids);
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectedLayerIds.set([]);

    // Update canvas service selection
    this.canvasService.clearSelection();
  }

  /**
   * Move layer to specific z-index position
   */
  moveLayerToPosition(id: string, newIndex: number): void {
    const layers = this.layers();
    const layerToMove = this.getLayerById(id);

    if (!layerToMove) return;

    const oldIndex = layerToMove.zIndex;
    const previousState = layers.map((layer) => ({ id: layer.id, zIndex: layer.zIndex }));

    // Update z-indices
    this.layers.update((layers) =>
      layers.map((layer) => {
        if (layer.id === id) {
          return { ...layer, zIndex: newIndex };
        } else if (oldIndex < newIndex && layer.zIndex > oldIndex && layer.zIndex <= newIndex) {
          return { ...layer, zIndex: layer.zIndex - 1 };
        } else if (oldIndex > newIndex && layer.zIndex < oldIndex && layer.zIndex >= newIndex) {
          return { ...layer, zIndex: layer.zIndex + 1 };
        }
        return layer;
      })
    );

    // Record action for history
    this.historyService.addAction({
      type: ActionType.REORDER_LAYER,
      layerIds: [id],
      data: { newIndex },
      previousState,
    });

    // Re-render canvas
    this.canvasService.render();
  }

  /**
   * Move layer forward (increment z-index)
   */
  moveLayerForward(id: string): void {
    const layer = this.getLayerById(id);

    if (!layer) return;

    const layers = this.layers();
    const maxZIndex = Math.max(...layers.map((l) => l.zIndex));

    if (layer.zIndex < maxZIndex) {
      this.moveLayerToPosition(id, layer.zIndex + 1);
    }
  }

  /**
   * Move layer backward (decrement z-index)
   */
  moveLayerBackward(id: string): void {
    const layer = this.getLayerById(id);

    if (!layer) return;

    if (layer.zIndex > 0) {
      this.moveLayerToPosition(id, layer.zIndex - 1);
    }
  }

  /**
   * Bring layer to front (highest z-index)
   */
  bringLayerToFront(id: string): void {
    const layers = this.layers();
    const maxZIndex = Math.max(...layers.map((l) => l.zIndex));

    this.moveLayerToPosition(id, maxZIndex);
  }

  /**
   * Send layer to back (lowest z-index)
   */
  sendLayerToBack(id: string): void {
    this.moveLayerToPosition(id, 0);
  }

  /**
   * Group selected layers
   */
  groupSelectedLayers(groupName?: string): void {
    const selectedIds = this.selectedLayerIds();

    if (selectedIds.length < 2) return;

    const selectedLayers = this.selectedLayers();
    const highestZIndex = Math.max(...selectedLayers.map((layer) => layer.zIndex));

    // Create a group layer
    const groupLayer: Layer = {
      id: generateId(),
      name: groupName || `Group ${this.layers().length + 1}`,
      type: LayerType.GROUP,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: highestZIndex,
      bounds: this.calculateGroupBounds(selectedLayers),
      children: selectedLayers,
    };

    // Remove selected layers and add group
    this.layers.update((layers) => [...layers.filter((layer) => !selectedIds.includes(layer.id)), groupLayer]);

    // Select the new group
    this.selectLayer(groupLayer.id);

    // Record action for history
    this.historyService.addAction({
      type: ActionType.GROUP_LAYERS,
      layerIds: selectedIds,
      data: { groupId: groupLayer.id },
      previousState: selectedLayers,
    });

    // Re-render canvas
    this.canvasService.render();
  }

  /**
   * Ungroup a layer group
   */
  ungroupLayers(groupId: string): void {
    const groupLayer = this.getLayerById(groupId);

    if (!groupLayer || groupLayer.type !== LayerType.GROUP || !groupLayer.children) return;

    const childLayers = [...groupLayer.children];

    // Add children back to the main layers array
    this.layers.update((layers) => [...layers.filter((layer) => layer.id !== groupId), ...childLayers]);

    // Select the ungrouped layers
    this.selectLayers(childLayers.map((layer) => layer.id));

    // Record action for history
    this.historyService.addAction({
      type: ActionType.UNGROUP_LAYERS,
      layerIds: [groupId],
      data: { childIds: childLayers.map((layer) => layer.id) },
      previousState: groupLayer,
    });

    // Re-render canvas
    this.canvasService.render();
  }

  /**
   * Calculate bounds for a group of layers
   */
  private calculateGroupBounds(layers: Layer[]): Layer['bounds'] {
    if (!layers.length) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    layers.forEach((layer) => {
      minX = Math.min(minX, layer.bounds.x);
      minY = Math.min(minY, layer.bounds.y);
      maxX = Math.max(maxX, layer.bounds.x + layer.bounds.width);
      maxY = Math.max(maxY, layer.bounds.y + layer.bounds.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Render all visible layers to the canvas
   */
  renderLayers(ctx: CanvasRenderingContext2D): void {
    if (!ctx) return;

    console.log('LayerService: renderLayers');

    // Obter todas as camadas visíveis
    const visibleLayers = this.visibleLayers();
    console.log('LayerService: camadas visíveis', visibleLayers.length);

    // Limpar o canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Render each visible layer in order of z-index
    visibleLayers.forEach((layer) => {
      console.log('LayerService: renderizando camada', layer.id, layer.type);

      // Outras camadas usando o método padrão
      this.renderLayer(ctx, layer);
    });

    // Render selection highlights if any layers are selected
    if (this.hasSelection()) {
      this.renderSelectionHighlights(ctx);
    }
  }

  /**
   * Render a single layer
   */
  private renderLayer(ctx: CanvasRenderingContext2D, layer: Layer): void {
    ctx.save();

    // Apply layer opacity
    ctx.globalAlpha = layer.opacity;

    // Render based on layer type
    switch (layer.type) {
      case LayerType.DRAWING:
        this.renderDrawingLayer(ctx, layer);
        break;
      case LayerType.SHAPE:
        this.renderShapeLayer(ctx, layer);
        break;
      case LayerType.TEXT:
        this.renderTextLayer(ctx, layer);
        break;
      case LayerType.IMAGE:
        this.renderImageLayer(ctx, layer);
        break;
      case LayerType.GROUP:
        this.renderGroupLayer(ctx, layer);
        break;
    }

    ctx.restore();
  }

  /**
   * Render a drawing layer (freehand paths)
   */
  private renderDrawingLayer(ctx: CanvasRenderingContext2D, layer: Layer): void {
    if (layer.type !== LayerType.DRAWING || !layer.data || !layer.data.paths) return;

    const { paths, strokeColor, strokeWidth } = layer.data;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    paths.forEach((pathData: any) => {
      const path = new Path2D(pathData);
      ctx.stroke(path);
    });
  }

  /**
   * Render a shape layer
   */
  private renderShapeLayer(ctx: CanvasRenderingContext2D, layer: Layer): void {
    if (layer.type !== LayerType.SHAPE || !layer.data) return;

    const { shape, strokeColor, fillColor, strokeWidth } = layer.data;
    const { x, y, width, height } = layer.bounds;

    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = strokeWidth;

    // Render different shapes
    switch (shape) {
      case 'rectangle':
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        if (fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
        break;

      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(
          x + Math.abs(width) / 2,
          y + Math.abs(height) / 2,
          Math.abs(width) / 2,
          Math.abs(height) / 2,
          0,
          0,
          Math.PI * 2
        );
        if (fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
        break;
    }
  }

  /**
   * Render a text layer
   */
  private renderTextLayer(ctx: CanvasRenderingContext2D, layer: Layer): void {
    if (layer.type !== LayerType.TEXT || !layer.data) return;

    const { text, fontSize, fontFamily, color, align } = layer.data;
    const { x, y } = layer.bounds;

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';

    ctx.fillText(text, x, y);
  }

  /**
   * Render an image layer
   */
  private renderImageLayer(ctx: CanvasRenderingContext2D, layer: Layer): void {
    if (layer.type !== LayerType.IMAGE || !layer.data || !layer.data.src) return;

    const { src } = layer.data;
    const { x, y, width, height } = layer.bounds;

    // Load image if not already loaded
    const img = new Image();
    img.src = src;

    if (img.complete) {
      ctx.drawImage(img, x, y, width, height);
    } else {
      img.onload = () => {
        ctx.drawImage(img, x, y, width, height);
      };
    }
  }

  /**
   * Render a group layer
   */
  private renderGroupLayer(ctx: CanvasRenderingContext2D, layer: Layer): void {
    if (layer.type !== LayerType.GROUP || !layer.children) return;

    // Render each child layer
    layer.children.forEach((childLayer) => {
      this.renderLayer(ctx, childLayer);
    });
  }

  private layersObservable = toObservable(this.layers);

  getLayersObservable(): Observable<Layer[]> {
    return this.layersObservable;
  }

  /**
   * Render selection highlights for selected layers
   */
  private renderSelectionHighlights(ctx: CanvasRenderingContext2D): void {
    const selectedLayers = this.selectedLayers();

    ctx.save();

    // Draw selection rectangle and handles
    selectedLayers.forEach((layer) => {
      const { x, y, width, height } = layer.bounds;

      // Selection rectangle
      ctx.strokeStyle = '#1e90ff'; // Dodger blue
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Dashed line
      ctx.strokeRect(x, y, width, height);

      // Selection handles
      ctx.fillStyle = '#ffffff'; // White
      ctx.strokeStyle = '#1e90ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);

      // Draw 8 resize handles
      const handleSize = 8;
      const halfHandle = handleSize / 2;

      // Top-left
      ctx.fillRect(x - halfHandle, y - halfHandle, handleSize, handleSize);
      ctx.strokeRect(x - halfHandle, y - halfHandle, handleSize, handleSize);

      // Top-middle
      ctx.fillRect(x + width / 2 - halfHandle, y - halfHandle, handleSize, handleSize);
      ctx.strokeRect(x + width / 2 - halfHandle, y - halfHandle, handleSize, handleSize);

      // Top-right
      ctx.fillRect(x + width - halfHandle, y - halfHandle, handleSize, handleSize);
      ctx.strokeRect(x + width - halfHandle, y - halfHandle, handleSize, handleSize);

      // Middle-right
      ctx.fillRect(x + width - halfHandle, y + height / 2 - halfHandle, handleSize, handleSize);
      ctx.strokeRect(x + width - halfHandle, y + height / 2 - halfHandle, handleSize, handleSize);

      // Bottom-right
      ctx.fillRect(x + width - halfHandle, y + height - halfHandle, handleSize, handleSize);
      ctx.strokeRect(x + width - halfHandle, y + height - halfHandle, handleSize, handleSize);

      // Bottom-middle
      ctx.fillRect(x + width / 2 - halfHandle, y + height - halfHandle, handleSize, handleSize);
      ctx.strokeRect(x + width / 2 - halfHandle, y + height - halfHandle, handleSize, handleSize);

      // Bottom-left
      ctx.fillRect(x - halfHandle, y + height - halfHandle, handleSize, handleSize);
      ctx.strokeRect(x - halfHandle, y + height - halfHandle, handleSize, handleSize);

      // Middle-left
      ctx.fillRect(x - halfHandle, y + height / 2 - halfHandle, handleSize, handleSize);
      ctx.strokeRect(x - halfHandle, y + height / 2 - halfHandle, handleSize, handleSize);
    });

    ctx.restore();
  }

  /**
   * Clear all layers
   */
  clearCanvas(): void {
    // Record current state for history
    const previousState = this.layers();

    // Create a new default layer
    const defaultLayer = this.createLayer(LayerType.DRAWING, 'Background Layer');

    // Set layers to only contain the default layer
    this.layers.set([defaultLayer]);

    // Record action for history
    this.historyService.addAction({
      type: ActionType.CLEAR_CANVAS,
      previousState,
    });

    // Clear selection
    this.clearSelection();

    // Re-render canvas
    this.canvasService.render();
  }

  /**
   * Import layers from external data
   */
  importLayers(importedLayers: Layer[]): void {
    // Record current state for history
    const previousState = this.layers();

    // Add imported layers
    this.layers.update((layers) => [...layers, ...importedLayers]);

    // Record action for history
    this.historyService.addAction({
      type: ActionType.IMPORT_CANVAS,
      data: { importedLayers },
      previousState,
    });

    // Re-render canvas
    this.canvasService.render();
  }
}
