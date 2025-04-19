// src/app/services/canvas.service.ts

import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tool, ToolConfig, DEFAULT_TOOLS } from '../models/tool.model';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  // Canvas properties
  private canvasElement: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  
  // Canvas state
  private viewportOffset = signal<{ x: number, y: number }>({ x: 0, y: 0 });
  private zoomLevel = signal<number>(1);
  private canvasSize = signal<{ width: number, height: number }>({ width: 0, height: 0 });
  private isDragging = signal<boolean>(false);
  private isDrawing = signal<boolean>(false);
  private selectedLayerIds = signal<string[]>([]);

  // Computed values
  readonly canDrag: Signal<boolean> = computed(() => 
    this.currentTool() === Tool.PAN || (this.currentTool() === Tool.SELECT && this.selectedLayerIds().length > 0)
  );
  
  readonly canvasTransform = computed(() => ({
    scale: this.zoomLevel(),
    offsetX: this.viewportOffset().x,
    offsetY: this.viewportOffset().y
  }));

  // Observable tool state
  private currentToolSubject = new BehaviorSubject<Tool>(Tool.SELECT);
  readonly currentTool = signal<Tool>(Tool.SELECT);
  
  // Tools configuration
  readonly availableTools: ToolConfig[] = DEFAULT_TOOLS;

  constructor() {}

  /**
   * Initialize the canvas with a given HTML element
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.canvasElement = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (!this.ctx) {
      console.error('Could not get 2D context from canvas element');
      return;
    }
    
    // Set initial canvas size
    this.resizeCanvas();
    
    // Setup event listeners
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  /**
   * Resize the canvas to match its container size
   */
  private resizeCanvas(): void {
    if (!this.canvasElement) return;
    
    const parent = this.canvasElement.parentElement;
    if (!parent) return;
    
    const { width, height } = parent.getBoundingClientRect();
    
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    
    this.canvasSize.set({ width, height });
    
    // Re-render after resize
    this.render();
  }

  /**
   * Set the active tool
   */
  setTool(tool: Tool): void {
    this.currentTool.set(tool);
    this.currentToolSubject.next(tool);
  }

  /**
   * Get the current tool as an Observable
   */
  getToolObservable(): Observable<Tool> {
    return this.currentToolSubject.asObservable();
  }

  /**
   * Check if there's a selected element
   */
  hasSelectedElement(): boolean {
    return this.selectedLayerIds().length > 0;
  }

  /**
   * Set the zoom level
   */
  setZoom(level: number): void {
    // Clamp zoom level between 0.1 and 5
    const clampedZoom = Math.max(0.1, Math.min(5, level));
    this.zoomLevel.set(clampedZoom);
    this.render();
  }

  /**
   * Pan the canvas
   */
  pan(deltaX: number, deltaY: number): void {
    const current = this.viewportOffset();
    this.viewportOffset.set({
      x: current.x + deltaX,
      y: current.y + deltaY
    });
    this.render();
  }

  /**
   * Convert screen coordinates to canvas coordinates (accounting for zoom and pan)
   */
  screenToCanvasCoordinates(x: number, y: number): { x: number, y: number } {
    const transform = this.canvasTransform();
    return {
      x: (x - transform.offsetX) / transform.scale,
      y: (y - transform.offsetY) / transform.scale
    };
  }

  /**
   * Convert canvas coordinates to screen coordinates
   */
  canvasToScreenCoordinates(x: number, y: number): { x: number, y: number } {
    const transform = this.canvasTransform();
    return {
      x: x * transform.scale + transform.offsetX,
      y: y * transform.scale + transform.offsetY
    };
  }

  /**
   * Start dragging operation
   */
  startDrag(): void {
    this.isDragging.set(true);
  }

  /**
   * End dragging operation
   */
  endDrag(): void {
    this.isDragging.set(false);
  }

  /**
   * Select layers by ID
   */
  selectLayers(layerIds: string[]): void {
    this.selectedLayerIds.set(layerIds);
    this.render();
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectedLayerIds.set([]);
    this.render();
  }

  /**
   * Render the canvas (delegating to LayerService for actual rendering)
   */
  render(): void {
    if (!this.ctx || !this.canvasElement) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    
    // Save context state
    this.ctx.save();
    
    // Apply transformations
    const transform = this.canvasTransform();
    this.ctx.translate(transform.offsetX, transform.offsetY);
    this.ctx.scale(transform.scale, transform.scale);
    
    // Actual rendering will be handled by the LayerService
    // which is injected in components that use this service
    
    // Restore context state
    this.ctx.restore();
  }

  /**
   * Export canvas as image
   */
  exportAsImage(format: 'png' | 'jpeg' = 'png'): string {
    if (!this.canvasElement) return '';
    
    return this.canvasElement.toDataURL(`image/${format}`);
  }
  
  /**
   * Clean up resources when component is destroyed
   */
  destroy(): void {
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
    this.canvasElement = null;
    this.ctx = null;
  }
}