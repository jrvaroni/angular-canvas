// src/app/features/canvas/view/view.component.ts

import { Component, DestroyRef, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { globalComponents, globalModules, globalProviders } from '../../../global-imports';
import { CanvasService } from '../../../services/canvas.service';
import { LayerService } from '../../../services/layer.service';
import { ToolService } from '../../../services/tool.service';
import { HistoryService } from '../../../services/history.service';

import { ToolbarComponent } from '../../../shared/components/toolbar/toolbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ContextMenuComponent, ContextMenuAction } from '../../../shared/components/context-menu/context-menu.component';

import { Tool } from '../../../models/tool.model';
import { ActionType } from '../../../models/history.model';
import { Layer, LayerType } from '../../../models/layer.model';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [
    CommonModule,
    globalModules,
    globalComponents,
    ToolbarComponent,
    SidebarComponent,
    ContextMenuComponent
  ],
  providers: [
    ...globalProviders,
    CanvasService,
    LayerService,
    ToolService,
    HistoryService
  ],
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('contextMenu') contextMenuComponent!: ContextMenuComponent;
  
  private cdRef = inject(ChangeDetectorRef)
  private destroyRef = inject(DestroyRef);
  private canvasService = inject(CanvasService);
  private layerService = inject(LayerService);
  private historyService = inject(HistoryService);
  public toolService = inject(ToolService);

  // Canvas state
  canvasWidth: number = 1200;
  canvasHeight: number = 800;
  zoomLevel: number = 1;
  
  // Mouse state
  isMouseDown: boolean = false;
  isPanning: boolean = false;
  lastX: number = 0;
  lastY: number = 0;
  
  // Context menu state
  showContextMenu: boolean = false;
  contextMenuX: number = 0;
  contextMenuY: number = 0;
  
  // Tool state
  currentTool: Tool = Tool.PEN;
  
  ngOnInit(): void {
    // Subscribe to tool changes
    this.canvasService.getToolObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(tool => {
        this.currentTool = tool;
        this.updateCursor();
    });
    

    this.toolService.getToolObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(tool => {
        console.log('View: Ferramenta atualizada para', tool);
        this.currentTool = tool;
        this.updateCursor();
    });
      
    this.currentTool = this.toolService.getActiveTool();
    this.updateCursor();
  }
  
  ngAfterViewInit(): void {
    // Initialize canvas
    if (this.canvasElement) {
      this.canvasService.initialize(this.canvasElement.nativeElement);
      this.updateCanvasSize();
    }
  }
  
  ngOnDestroy(): void {
    this.canvasService.destroy();
  }
  
  /**
   * Update canvas size based on container
   */
  updateCanvasSize(): void {
    if (this.canvasContainer) {
      const container = this.canvasContainer.nativeElement;
      this.canvasWidth = container.clientWidth;
      this.canvasHeight = container.clientHeight;
      
      if (this.canvasElement) {
        const canvas = this.canvasElement.nativeElement;
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        
        // Trigger canvas redraw
        this.canvasService.render();
      }

      this.cdRef.detectChanges()
    }
  }
  
  /**
   * Update cursor based on current tool
   */
  updateCursor(): void {
    if (!this.canvasContainer) return;
    
    let cursorStyle = 'default';
    
    switch (this.currentTool) {
      case Tool.SELECT:
        cursorStyle = 'default';
        break;
      case Tool.PAN:
        cursorStyle = 'grab';
        break;
      case Tool.PEN:
      case Tool.LINE:
      case Tool.RECTANGLE:
      case Tool.ELLIPSE:
        cursorStyle = 'crosshair';
        break;
      case Tool.TEXT:
        cursorStyle = 'text';
        break;
      case Tool.ERASER:
        cursorStyle = 'crosshair';
        break;
    }
    
    this.canvasContainer.nativeElement.style.cursor = cursorStyle;
  }
  
  /**
   * Handle mouse down event
   */
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    
    // Convert page coordinates to canvas coordinates
    const canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    
    // Handle based on current tool
    switch (this.currentTool) {
      case Tool.PAN:
        this.isPanning = true;
        this.canvasContainer.nativeElement.style.cursor = 'grabbing';
        break;
        
      case Tool.SELECT:
        // Handle selection logic
        break;
        
      case Tool.PEN:
        // Start drawing
        this.startDrawing(x, y);
        break;
        
      // Handle other tools as needed
    }
  }
  
  /**
   * Handle mouse move event
   */
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown) return;
    
    const currentX = event.clientX;
    const currentY = event.clientY;
    const deltaX = currentX - this.lastX;
    const deltaY = currentY - this.lastY;
    
    // Convert page coordinates to canvas coordinates
    const canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    
    // Handle based on current tool
    if (this.isPanning) {
      this.canvasService.pan(deltaX, deltaY);
    } else {
      switch (this.currentTool) {
        case Tool.PEN:
          // Continue drawing
          this.continueDrawing(x, y);
          break;
          
        case Tool.SELECT:
          // Update selection
          break;
          
        // Handle other tools as needed
      }
    }
    
    this.lastX = currentX;
    this.lastY = currentY;
  }
  
  /**
   * Handle mouse up event
   */
  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (!this.isMouseDown) return;
    
    // Convert page coordinates to canvas coordinates
    const canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    
    // Handle based on current tool
    if (this.isPanning) {
      this.isPanning = false;
      this.updateCursor();
    } else {
      switch (this.currentTool) {
        case Tool.PEN:
          // Finish drawing
          this.finishDrawing();
          break;
          
        case Tool.SELECT:
          // Finalize selection
          break;
          
        // Handle other tools as needed
      }
    }
    
    this.isMouseDown = false;
  }
  
  /**
   * Handle mouse leave event
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.isMouseDown) {
      this.isMouseDown = false;
      this.isPanning = false;
      this.updateCursor();
      
      // Handle based on current tool
      switch (this.currentTool) {
        case Tool.PEN:
          this.finishDrawing();
          break;
          
        // Handle other tools as needed
      }
    }
  }
  
  /**
   * Handle mouse wheel event for zooming
   */
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    
    // Calculate new zoom level
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.1, Math.min(5, this.zoomLevel + delta));
    
    // Update zoom
    this.setZoom(newZoom);
  }
  
  /**
   * Handle context menu (right-click) event
   */
  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    const canvasElement = this.canvasElement.nativeElement;
    const rect = canvasElement.getBoundingClientRect();
    
    const clickInsideCanvas = 
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    
    if(!clickInsideCanvas) {
      return;
    }
    
    event.preventDefault();
    
    // Coordenadas absolutas do clique
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    // Tamanho do menu (ajuste conforme seu componente)
    const menuWidth = 200; // Largura aproximada do menu
    const menuHeight = 300; // Altura aproximada do menu
    
    // Ajuste para não ultrapassar a tela à direita
    const adjustedX = window.innerWidth - clickX < menuWidth 
      ? clickX - menuWidth 
      : clickX;
    
    // Ajuste para não ultrapassar a tela abaixo
    const adjustedY = window.innerHeight - clickY < menuHeight 
      ? clickY - menuHeight 
      : clickY;
    
    this.contextMenuX = adjustedX;
    this.contextMenuY = adjustedY;
    this.showContextMenu = true;
    
    if (this.contextMenuComponent) {
      this.contextMenuComponent.open(this.contextMenuX, this.contextMenuY);
    }
  }
  
  /**
   * Close context menu
   */
  onContextMenuClosed(): void {
    this.showContextMenu = false;
  }
  
  /**
   * Set zoom level
   */
  setZoom(level: number): void {
    this.zoomLevel = level;
    this.canvasService.setZoom(level);
  }
  
  /**
   * Handle undo action
   */
  undo(): void {
    const action = this.historyService.undo();
    if (!action) return;
    
    this.applyHistoryAction(action, true);
  }
  
  /**
   * Handle redo action
   */
  redo(): void {
    const action = this.historyService.redo();
    if (!action) return;
    
    this.applyHistoryAction(action, false);
  }
  
  /**
   * Apply a history action (undo or redo)
   */
  private applyHistoryAction(action: any, isUndo: boolean): void {
    // Implementation depends on action type
    // This is a simplified version
    switch (action.type) {
      case ActionType.ADD_LAYER:
        if (isUndo) {
          this.layerService.deleteLayer(action.layerIds![0]);
        } else {
          // Re-add the layer
        }
        break;
        
      case ActionType.REMOVE_LAYER:
        if (isUndo) {
          // Re-add the layer
        } else {
          this.layerService.deleteLayer(action.layerIds![0]);
        }
        break;
        
      // Handle other action types
    }
  }
  
  /**
   * Start drawing with pen tool
   */
  private startDrawing(x: number, y: number): void {
    // Implementation for starting a drawing path
    const options = this.toolService.getActiveToolOptions();
    
    // Create a new drawing layer
    this.layerService.createLayer(LayerType.DRAWING, 'Drawing Layer', {
      data: {
        paths: [],
        strokeColor: options?.strokeColor || '#000000',
        strokeWidth: options?.strokeWidth || 2
      }
    });
  }
  
  /**
   * Continue drawing with pen tool
   */
  private continueDrawing(x: number, y: number): void {
    // Implementation for continuing a drawing path
  }
  
  /**
   * Finish drawing with pen tool
   */
  private finishDrawing(): void {
    // Implementation for finishing a drawing path
  }
  
  /**
   * Clear the canvas
   */
  clearCanvas(): void {
    this.layerService.clearCanvas();
  }
  
  /**
   * Export the canvas as an image
   */
  exportCanvas(): void {
    const dataUrl = this.canvasService.exportAsImage();
    
    // Create a download link
    const link = document.createElement('a');
    link.download = 'canvas-export.png';
    link.href = dataUrl;
    link.click();
  }

  handleCanvasClick(event: MouseEvent) {
    // Verifica se o menu de contexto está visível
    if (!this.showContextMenu) return;

    // Verifica se o clique foi fora do menu de contexto
    const clickedInsideMenu = this.isClickInsideContextMenu(event);
    if (!clickedInsideMenu) {
      this.onContextMenuClosed();
    }
  }

  private isClickInsideContextMenu(event: MouseEvent): boolean {
    if (!this.contextMenuComponent || !this.canvasContainer) return false;
    
    const menuElement = this.canvasContainer.nativeElement.querySelector('app-context-menu');
    if (!menuElement) return false;
    
    const rect = menuElement.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

}