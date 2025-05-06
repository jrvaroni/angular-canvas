import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { globalComponents, globalModules, globalProviders } from '../../../global-imports';
import { CanvasService } from '../../../services/canvas.service';
import { HistoryService } from '../../../services/history.service';
import { LayerService } from '../../../services/layer.service';
import { ToolService } from '../../../services/tool.service';

import {
  ContextMenuAction,
  ContextMenuComponent,
} from '../../../shared/components/context-menu/context-menu.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TextEditorComponent } from '../../../shared/components/text-editor/text-editor.component';
import { ToolbarComponent } from '../../../shared/components/toolbar/toolbar.component';

import { ActionType } from '../../../models/history.model';
import { Layer, LayerType } from '../../../models/layer.model';
import { Tool } from '../../../models/tool.model';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    globalModules,
    globalComponents,
    ToolbarComponent,
    SidebarComponent,
    ContextMenuComponent,
    TextEditorComponent,
  ],
  providers: [...globalProviders, CanvasService, LayerService, ToolService, HistoryService],
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('contextMenu') contextMenuComponent!: ContextMenuComponent;

  private cdRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  public canvasService = inject(CanvasService);
  public layerService = inject(LayerService);
  private historyService = inject(HistoryService);
  public toolService = inject(ToolService);

  // Canvas state
  canvasWidth = signal<number>(1200);
  canvasHeight = signal<number>(800);
  zoomLevel = signal<number>(1);

  // Mouse state
  isMouseDown = signal<boolean>(false);
  isPanning = signal<boolean>(false);
  lastX = signal<number>(0);
  lastY = signal<number>(0);

  // Context menu state
  showContextMenu = signal<boolean>(false);
  contextMenuX = signal<number>(0);
  contextMenuY = signal<number>(0);

  // Text editor state
  showTextEditor = signal<boolean>(false);
  textEditorLayerId = signal<string>('');
  textEditorPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  textEditorText = signal<string>('');
  textEditorFontSize = signal<number>(16);
  textEditorFontFamily = signal<string>('Arial');
  textEditorColor = signal<string>('#000000');
  textEditorAlign = signal<string>('left');
  textEditorWidth = signal<number>(200);
  textEditorHeight = signal<number>(100);

  isCreatingConnection = signal<boolean>(false);
  connectionSourceId = signal<string | null>(null);
  draggedElementId = signal<string | null>(null);
  isDraggingElement = signal<boolean>(false);

  contextSelectedElementId: string | null = null;
  contextSelectedConnectionId: string | null = null;

  ngOnInit(): void {
    // Subscribe to tool changes
    this.canvasService
      .getToolObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tool) => {
        this.updateCursor();
      });

    this.toolService
      .getToolObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tool) => {
        this.updateCursor();
      });
  }

  ngAfterViewInit(): void {
    // Initialize the canvas
    if (this.canvasElement) {
      this.canvasService.initialize(this.canvasElement.nativeElement);
      this.updateCanvasSize();

      // Add resize listener
      window.addEventListener('resize', () => {
        this.updateCanvasSize();
      });

      // Force initial render
      setTimeout(() => {
        this.canvasService.render();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.canvasService.destroy();
  }

  updateCanvasSize(): void {
    if (this.canvasContainer) {
      const container = this.canvasContainer.nativeElement;
      this.canvasWidth.set(container.clientWidth);
      this.canvasHeight.set(container.clientHeight);

      if (this.canvasElement) {
        const canvas = this.canvasElement.nativeElement;
        canvas.width = this.canvasWidth();
        canvas.height = this.canvasHeight();

        this.canvasService.render();
      }

      this.cdRef.detectChanges();
    }
  }

  updateCursor(): void {
    if (!this.canvasContainer) return;

    let cursorStyle = 'default';

    switch (this.canvasService.currentTool()) {
      case Tool.SELECT:
        cursorStyle = 'default';
        break;
      case Tool.PAN:
        cursorStyle = this.isPanning() ? 'grabbing' : 'grab';
        break;
      case Tool.PEN:
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

  private createTextLayer(x: number, y: number): void {
    // Convert screen to canvas coordinates
    const canvasCoords = this.canvasService.screenToCanvasCoordinates(x, y);

    // Create a new text layer
    const layer = this.layerService.createLayer(LayerType.TEXT, 'Novo Texto', {
      data: {
        text: 'Digite seu texto aqui',
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        align: 'left',
      },
      bounds: {
        x: canvasCoords.x,
        y: canvasCoords.y,
        width: 200,
        height: 30,
      },
    });

    // Open the text editor for the new layer
    this.openTextEditor(layer.id);
  }

  /**
   * Opens the text editor for a layer
   */
  openTextEditor(layerId: string): void {
    const layer = this.layerService.getLayerById(layerId);
    if (!layer || layer.type !== LayerType.TEXT) return;

    // Prepare text editor data
    this.textEditorLayerId.set(layerId);
    this.textEditorText.set(layer.data?.text || 'Digite seu texto aqui');
    this.textEditorFontSize.set(layer.data?.fontSize || 16);
    this.textEditorFontFamily.set(layer.data?.fontFamily || 'Arial');
    this.textEditorColor.set(layer.data?.color || '#000000');
    this.textEditorAlign.set(layer.data?.align || 'left');
    this.textEditorWidth.set(layer.bounds.width);
    this.textEditorHeight.set(layer.bounds.height);

    // Convert canvas coordinates to screen
    const screenPosition = this.canvasService.canvasToScreenCoordinates(layer.bounds.x, layer.bounds.y);
    this.textEditorPosition.set(screenPosition);

    // Show the editor
    this.showTextEditor.set(true);
    this.cdRef.detectChanges();
  }

  /**
   * Closes the text editor
   */
  closeTextEditor(save: boolean): void {
    this.showTextEditor.set(false);

    if (save) {
      // If we need to update history for the edit, do it here
      const layerId = this.textEditorLayerId();
      const layer = this.layerService.getLayerById(layerId);

      if (layer) {
        this.historyService.addAction({
          type: ActionType.MODIFY_LAYER,
          layerIds: [layerId],
          data: {
            updates: {
              ...layer,
            },
          },
          previousState: layer,
        });
      }
    }

    // Update canvas
    this.canvasService.render();
  }

  /**
   * Checks if a mouse event is inside the canvas
   */
  private isMouseEventInsideCanvas(event: MouseEvent): boolean {
    if (!this.canvasElement) return false;

    const canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
    return (
      event.clientX >= canvasRect.left &&
      event.clientX <= canvasRect.right &&
      event.clientY >= canvasRect.top &&
      event.clientY <= canvasRect.bottom
    );
  }

  /**
   * Handle mouse down event
   */
  onMouseDown(event: MouseEvent): void {
    if (!this.isMouseEventInsideCanvas(event)) return;

    // Ignorar eventos de mouse quando o menu de contexto estiver aberto
    if (this.showContextMenu()) return;

    // If text editor is open, ignore canvas interactions
    if (this.showTextEditor()) return;

    this.isMouseDown.set(true);
    this.lastX.set(event.clientX);
    this.lastY.set(event.clientY);

    // Converte as coordenadas da página para coordenadas do canvas
    const canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    // Manipula com base na ferramenta atual
    switch (this.canvasService.currentTool()) {
      case Tool.PAN:
        this.isPanning.set(true);
        this.updateCursor();
        break;

      case Tool.SELECT:
        // Verifica se clicou em alguma camada
        const canvasCoords = this.canvasService.screenToCanvasCoordinates(x, y);
        const hitLayer = this.findLayerAtPosition(canvasCoords.x, canvasCoords.y);

        if (hitLayer) {
          // Se já estiver selecionada, não precisa fazer nada
          if (!this.layerService.selectedLayers().some((layer) => layer.id === hitLayer.id)) {
            this.layerService.selectLayer(hitLayer.id);
          }
        } else {
          // Se não clicou em nenhuma camada, limpa a seleção
          this.layerService.clearSelection();
        }
        break;

      case Tool.PEN:
        this.canvasService.startDrawing(x, y);
        break;

      case Tool.TEXT:
        this.createTextLayer(x, y);
        break;

      case Tool.RECTANGLE:
        // Inicia a criação de um retângulo
        this.startShapeCreation(x, y, 'rectangle');
        break;

      case Tool.ELLIPSE:
        // Inicia a criação de uma elipse
        this.startShapeCreation(x, y, 'ellipse');
        break;

      case Tool.LINE:
        // Inicia a criação de uma linha
        this.startShapeCreation(x, y, 'line');
        break;
    }
  }

  /**
   * Handle mouse move event
   */
  onMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown()) return;

    // Ignorar eventos de mouse quando o menu de contexto estiver aberto
    if (this.showContextMenu()) return;

    // If text editor is open, ignore canvas interactions
    if (this.showTextEditor()) return;

    const currentX = event.clientX;
    const currentY = event.clientY;
    const deltaX = currentX - this.lastX();
    const deltaY = currentY - this.lastY();

    // Converte as coordenadas da página para coordenadas do canvas
    const canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    // Manipula com base na ferramenta atual
    if (this.isPanning()) {
      this.canvasService.pan(deltaX, deltaY);
    } else {
      switch (this.canvasService.currentTool()) {
        case Tool.PEN:
          this.canvasService.continueDrawing(x, y);
          break;

        case Tool.SELECT:
          // Se temos camadas selecionadas e o mouse está pressionado, movemos as camadas
          if (this.layerService.hasSelection()) {
            // Pegar as camadas selecionadas
            const selectedLayers = this.layerService.selectedLayers();

            // Obter o fator de escala para ajustar o movimento ao zoom
            const transform = this.canvasService.canvasTransform();
            const scale = transform.scale;

            // Converter delta para coordenadas do canvas
            const canvasDeltaX = deltaX / scale;
            const canvasDeltaY = deltaY / scale;

            // Mover cada camada selecionada
            selectedLayers.forEach((layer) => {
              // Ignorar camadas bloqueadas
              if (layer.locked) return;

              // Construir o objeto de atualização para este layer
              const updatedLayer = {
                ...layer,
                bounds: {
                  ...layer.bounds,
                  x: layer.bounds.x + canvasDeltaX,
                  y: layer.bounds.y + canvasDeltaY,
                },
              };

              // Atualizar a camada
              this.layerService.updateLayer(layer.id, updatedLayer);
            });

            // Renderizar novamente o canvas após mover as camadas
            this.canvasService.render();
          }
          break;

        case Tool.RECTANGLE:
        case Tool.ELLIPSE:
        case Tool.LINE:
          // Atualiza o tamanho da forma
          const selectedLayers = this.layerService.selectedLayers();
          if (selectedLayers.length === 1 && selectedLayers[0].type === LayerType.SHAPE) {
            this.updateShapeSize(selectedLayers[0].id, x, y);
          }
          break;
      }
    }

    this.lastX.set(currentX);
    this.lastY.set(currentY);
  }
  /**
   * Handle mouse up event
   */
  onMouseUp(event: MouseEvent): void {
    if (!this.isMouseDown()) return;

    if (this.isDraggingElement()) {
      this.isDraggingElement.set(false);
      this.draggedElementId.set(null);
    }

    // Ignorar eventos de mouse quando o menu de contexto estiver aberto
    if (this.showContextMenu()) return;

    // If text editor is open, ignore canvas interactions
    if (this.showTextEditor()) return;

    // Convert to canvas coordinates
    const canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    // Handle based on current tool
    if (this.isPanning()) {
      this.isPanning.set(false);
      this.updateCursor();
    } else {
      switch (this.canvasService.currentTool()) {
        case Tool.PEN:
          this.canvasService.endDrawing(x, y);
          break;

        case Tool.SELECT:
          // Finaliza o movimento, caso tenha ocorrido
          if (this.layerService.hasSelection()) {
            // Atualiza o histórico, se necessário
          }
          break;

        case Tool.RECTANGLE:
        case Tool.ELLIPSE:
        case Tool.LINE:
          // Finaliza a criação da forma
          const selectedLayers = this.layerService.selectedLayers();
          if (selectedLayers.length === 1 && selectedLayers[0].type === LayerType.SHAPE) {
            this.finishShapeCreation(selectedLayers[0].id);
          }
          break;
      }
    }

    this.isMouseDown.set(false);
  }

  /**
   * Handle mouse leave event
   */
  onMouseLeave(): void {
    if (this.isMouseDown()) {
      // If we were drawing, end the drawing
      if (this.canvasService.currentTool() === Tool.PEN) {
        const lastX = this.lastX();
        const lastY = this.lastY();
        const canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
        const x = lastX - canvasRect.left;
        const y = lastY - canvasRect.top;
        this.canvasService.endDrawing(x, y);
      }

      this.isMouseDown.set(false);
      this.isPanning.set(false);
      this.updateCursor();
    }
  }

  /**
   * Handle mouse wheel event for zooming
   */
  onWheel(event: WheelEvent): void {
    if (!this.isMouseEventInsideCanvas(event)) return;

    event.preventDefault();

    // Calculate new zoom level
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.1, Math.min(5, this.zoomLevel() + delta));

    // Update zoom
    this.setZoom(newZoom);
  }

  /**
   * Handle context menu (right-click) event
   */

  onContextMenu(event: MouseEvent): void {
    if (!this.isMouseEventInsideCanvas(event)) return;

    // Prevent default browser context menu
    event.preventDefault();

    // If text editor is open, ignore context menu
    if (this.showTextEditor()) return;

    // Coordenadas exatas do clique
    this.contextMenuX.set(event.clientX);
    this.contextMenuY.set(event.clientY);

    // Comportamento padrão para outros tipos de layer
    this.showContextMenu.set(true);

    if (this.contextMenuComponent) {
      // Abrir o menu no local exato do clique
      this.contextMenuComponent.open(event.clientX, event.clientY);

      // Verificar se clicou em alguma camada
      if (this.canvasService.currentTool() === Tool.SELECT) {
        const canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
        const x = event.clientX - canvasRect.left;
        const y = event.clientY - canvasRect.top;

        const canvasCoords = this.canvasService.screenToCanvasCoordinates(x, y);
        const hitLayer = this.findLayerAtPosition(canvasCoords.x, canvasCoords.y);

        if (hitLayer && !this.layerService.selectedLayers().some((layer) => layer.id === hitLayer.id)) {
          this.layerService.selectLayer(hitLayer.id);
        }
      }
    }
  }

  // Método para mostrar menu de contexto personalizado
  private showCustomContextMenu(
    items: any[],
    clientX: number,
    clientY: number,
    handler: (action: string) => void
  ): void {
    // Verificar se temos um componente de menu de contexto
    if (!this.contextMenuComponent) {
      console.error('ViewComponent: componente de menu de contexto não encontrado');
      return;
    }
    this.contextMenuComponent.setCustomItems(items);

    // Mostrar o menu
    this.showContextMenu.set(true);
    this.contextMenuComponent.open(clientX, clientY);

    // Configurar o manipulador de ações
    this.contextMenuComponent.setCustomActionHandler(handler);
  }

  /**
   * Close context menu
   */
  onContextMenuClosed(): void {
    this.showContextMenu.set(false);

    // Resetar os estados do mouse
    this.isMouseDown.set(false);
    this.isPanning.set(false);
  }

  /**
   * Set zoom level
   */
  setZoom(level: number): void {
    this.zoomLevel.set(level);
    this.canvasService.setZoom(level);
  }

  /**
   * Handles canvas click outside any active UI elements
   */
  handleCanvasClick(event: MouseEvent): void {
    // Check if context menu is visible
    if (this.showContextMenu()) {
      // Check if click is outside context menu
      const clickedInsideMenu = this.isClickInsideContextMenu(event);
      if (!clickedInsideMenu) {
        this.onContextMenuClosed();
      }
      return;
    }

    // If text editor is open, ignore canvas interactions
    if (this.showTextEditor()) return;

    // Convert to canvas coordinates
    const canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    const canvasCoords = this.canvasService.screenToCanvasCoordinates(x, y);
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

  /**
   * Handle context menu actions
   */
  handleContextMenuAction(action: ContextMenuAction): void {
    // Resetar explicitamente o estado do mouse para evitar criação indesejada de camadas
    this.isMouseDown.set(false);
    this.isPanning.set(false);

    const selectedLayers = this.layerService.selectedLayers();
    if (selectedLayers.length === 0) return;

    switch (action) {
      case ContextMenuAction.BRING_TO_FRONT:
        selectedLayers.forEach((layer) => {
          this.layerService.bringLayerToFront(layer.id);
        });
        break;

      case ContextMenuAction.SEND_TO_BACK:
        selectedLayers.forEach((layer) => {
          this.layerService.sendLayerToBack(layer.id);
        });
        break;

      case ContextMenuAction.MOVE_FORWARD:
        selectedLayers.forEach((layer) => {
          this.layerService.moveLayerForward(layer.id);
        });
        break;

      case ContextMenuAction.MOVE_BACKWARD:
        selectedLayers.forEach((layer) => {
          this.layerService.moveLayerBackward(layer.id);
        });
        break;

      case ContextMenuAction.DELETE:
        selectedLayers.forEach((layer) => {
          this.layerService.deleteLayer(layer.id);
        });
        break;

      case ContextMenuAction.GROUP:
        if (selectedLayers.length >= 2) {
          this.layerService.groupSelectedLayers();
        }
        break;

      case ContextMenuAction.UNGROUP:
        selectedLayers.forEach((layer) => {
          if (layer.type === LayerType.GROUP) {
            this.layerService.ungroupLayers(layer.id);
          }
        });
        break;

      case ContextMenuAction.EDIT_TEXT:
        // Check if only one layer is selected and it's a text layer
        if (selectedLayers.length === 1 && selectedLayers[0].type === LayerType.TEXT) {
          this.openTextEditor(selectedLayers[0].id);
        }
        break;
    }

    // Fecha o menu de contexto
    this.onContextMenuClosed();

    // Atualiza o canvas
    this.canvasService.render();
  }

  /**
   * Find layer at a specific position
   */
  private findLayerAtPosition(x: number, y: number): Layer | undefined {
    const layers = this.layerService.getLayers().filter((layer) => layer.visible);

    // Sort by z-index (top to bottom)
    const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

    // Find the first layer that contains the point
    return sortedLayers.find((layer) => {
      if (layer.locked) return false;

      const { bounds } = layer;

      // Check if point is inside layer bounds
      return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
    });
  }

  /**
   * Undo last action
   */
  undo(): void {
    this.historyService.undo();
  }

  /**
   * Redo last undone action
   */
  redo(): void {
    this.historyService.redo();
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

  /**
   * Inicia a criação de uma forma geométrica
   */
  private startShapeCreation(x: number, y: number, shapeType: 'rectangle' | 'ellipse' | 'line'): void {
    // Converte as coordenadas de tela para coordenadas de canvas
    const canvasCoords = this.canvasService.screenToCanvasCoordinates(x, y);

    // Cria uma nova camada de forma
    const layer = this.layerService.createLayer(
      LayerType.SHAPE,
      `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`,
      {
        data: {
          shape: shapeType,
          strokeColor: '#000000',
          fillColor: shapeType === 'line' ? 'transparent' : '#ffffff',
          strokeWidth: 2,
        },
        bounds: {
          x: canvasCoords.x,
          y: canvasCoords.y,
          width: 0,
          height: 0,
        },
      }
    );

    // Seleciona a camada recém-criada
    this.layerService.selectLayer(layer.id);

    // Renderiza o canvas para mostrar a forma inicial
    this.canvasService.render();
  }

  /**
   * Atualiza o tamanho da forma durante o arrasto
   */
  private updateShapeSize(layerId: string, endX: number, endY: number): void {
    const layer = this.layerService.getLayerById(layerId);
    if (!layer || layer.type !== LayerType.SHAPE) return;

    // Converte as coordenadas de tela para coordenadas de canvas
    const canvasCoords = this.canvasService.screenToCanvasCoordinates(endX, endY);

    // Calcula as novas bounds
    const startX = layer.bounds.x;
    const startY = layer.bounds.y;
    const width = Math.abs(canvasCoords.x - startX);
    const height = Math.abs(canvasCoords.y - startY);

    // Para linha, mantemos x,y como o ponto inicial e width/height como a distância
    if (layer.data?.shape === 'line') {
      this.layerService.updateLayer(layerId, {
        bounds: {
          x: startX,
          y: startY,
          width: canvasCoords.x - startX,
          height: canvasCoords.y - startY,
        },
      });
    } else {
      // Para retângulo e elipse, ajustamos bounds para acomodar qualquer direção de arrasto
      this.layerService.updateLayer(layerId, {
        bounds: {
          x: Math.min(startX, canvasCoords.x),
          y: Math.min(startY, canvasCoords.y),
          width,
          height,
        },
      });
    }

    // Renderiza o canvas para mostrar a forma atualizada
    this.canvasService.render();
  }

  /**
   * Finaliza a criação da forma
   */
  private finishShapeCreation(layerId: string): void {
    const layer = this.layerService.getLayerById(layerId);
    if (!layer || layer.type !== LayerType.SHAPE) return;

    // Se a forma for muito pequena, remove-a
    if (layer.data?.shape !== 'line' && layer.bounds.width < 5 && layer.bounds.height < 5) {
      this.layerService.deleteLayer(layerId);
    } else if (layer.data?.shape === 'line' && Math.abs(layer.bounds.width) < 5 && Math.abs(layer.bounds.height) < 5) {
      this.layerService.deleteLayer(layerId);
    }

    // Renderiza o canvas com a forma finalizada
    this.canvasService.render();
  }
}
