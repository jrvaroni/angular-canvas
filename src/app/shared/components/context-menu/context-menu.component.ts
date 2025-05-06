import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LayerType } from '../../../models/layer.model';
import { LayerService } from '../../../services/layer.service';

export enum ContextMenuAction {
  BRING_TO_FRONT = 'bring-to-front',
  SEND_TO_BACK = 'send-to-back',
  MOVE_FORWARD = 'move-forward',
  MOVE_BACKWARD = 'move-backward',
  DELETE = 'delete',
  GROUP = 'group',
  UNGROUP = 'ungroup',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  EDIT_TEXT = 'edit-text',
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="context-menu"
      [style.left.px]="xPos()"
      [style.top.px]="yPos()"
      #menuElement
      (mousedown)="stopPropagation($event)"
      (click)="stopPropagation($event)"
    >
      <div class="context-menu-section">
        <div class="context-menu-heading">Ordem</div>
        <div class="context-menu-item" (click)="execute(ContextMenuAction.BRING_TO_FRONT, $event)">
          Trazer para frente
        </div>
        <div class="context-menu-item" (click)="execute(ContextMenuAction.SEND_TO_BACK, $event)">Enviar para trás</div>
        <div class="context-menu-item" (click)="execute(ContextMenuAction.MOVE_FORWARD, $event)">Mover para frente</div>
        <div class="context-menu-item" (click)="execute(ContextMenuAction.MOVE_BACKWARD, $event)">Mover para trás</div>
      </div>

      <div class="context-menu-section" *ngIf="canGroup() || hasGroups()">
        <div class="context-menu-heading">Agrupar</div>
        <div
          class="context-menu-item"
          [class.disabled]="!canGroup()"
          (click)="canGroup() && execute(ContextMenuAction.GROUP, $event)"
        >
          Agrupar seleção
        </div>
        <div
          class="context-menu-item"
          [class.disabled]="!hasGroups()"
          (click)="hasGroups() && execute(ContextMenuAction.UNGROUP, $event)"
        >
          Desagrupar
        </div>
      </div>

      <div class="context-menu-section">
        <div class="context-menu-heading">Camada</div>
        <div
          class="context-menu-item"
          [class.disabled]="!hasUnlockedLayers()"
          (click)="hasUnlockedLayers() && execute(ContextMenuAction.LOCK, $event)"
        >
          Bloquear
        </div>
        <div
          class="context-menu-item"
          [class.disabled]="!hasLockedLayers()"
          (click)="hasLockedLayers() && execute(ContextMenuAction.UNLOCK, $event)"
        >
          Desbloquear
        </div>
        <div class="context-menu-item" *ngIf="hasTextLayer()" (click)="execute(ContextMenuAction.EDIT_TEXT, $event)">
          Editar texto
        </div>
        <div class="context-menu-item" (click)="execute(ContextMenuAction.DELETE, $event)">Excluir</div>
      </div>
    </div>
  `,
  styles: [
    `
      .context-menu {
        position: fixed;
        min-width: 180px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        overflow: hidden;
      }

      .context-menu-section {
        padding: 4px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .context-menu-section:last-child {
        border-bottom: none;
      }

      .context-menu-heading {
        padding: 8px 12px 4px;
        font-size: 12px;
        color: #888;
        font-weight: 500;
      }

      .context-menu-item {
        padding: 6px 12px;
        cursor: pointer;
        font-size: 14px;
      }

      .context-menu-item:hover {
        background-color: #f5f5f5;
      }

      .context-menu-item.disabled {
        color: #ccc;
        cursor: not-allowed;
      }

      .context-menu-item.disabled:hover {
        background-color: transparent;
      }
    `,
  ],
})
export class ContextMenuComponent implements OnInit {
  @Input() set x(value: number) {
    this.xPos.set(value);
  }

  @Input() set y(value: number) {
    this.yPos.set(value);
  }

  @Output() closed = new EventEmitter<void>();
  @Output() actionExecuted = new EventEmitter<ContextMenuAction>();

  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);
  private layerService = inject(LayerService);

  // Signals for position
  readonly xPos = signal<number>(0);
  readonly yPos = signal<number>(0);

  // Expose ContextMenuAction enum to template
  ContextMenuAction = ContextMenuAction;
  customItems: any[] = [];
  customActionHandler: ((action: string) => void) | null = null;

  // Computed signals for UI state
  readonly canGroup = computed(() => {
    const selectedLayers = this.layerService.selectedLayers();
    return selectedLayers.length >= 2;
  });

  readonly hasGroups = computed(() => {
    const selectedLayers = this.layerService.selectedLayers();
    return selectedLayers.some((layer) => layer.type === LayerType.GROUP);
  });

  readonly hasLockedLayers = computed(() => {
    const selectedLayers = this.layerService.selectedLayers();
    return selectedLayers.some((layer) => layer.locked);
  });

  readonly hasUnlockedLayers = computed(() => {
    const selectedLayers = this.layerService.selectedLayers();
    return selectedLayers.some((layer) => !layer.locked);
  });

  readonly hasTextLayer = computed(() => {
    const selectedLayers = this.layerService.selectedLayers();
    return selectedLayers.length === 1 && selectedLayers[0].type === LayerType.TEXT;
  });

  private removeGlobalListener: Function | null = null;

  ngOnInit(): void {
    // Add global click listener
    this.addGlobalClickListener();
  }

  /**
   * Open the context menu
   */
  open(x: number, y: number): void {
    // Posicionar o menu diretamente no ponto de clique
    this.xPos.set(x);
    this.yPos.set(y);

    // Adicionar listener global se ainda não adicionado
    if (!this.removeGlobalListener) {
      this.addGlobalClickListener();
    }
  }

  /**
   * Close the context menu
   */
  close(): void {
    if (this.removeGlobalListener) {
      this.removeGlobalListener();
      this.removeGlobalListener = null;
    }

    this.closed.emit();
  }

  /**
   * Stop event propagation
   */
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  /**
   * Execute a context menu action
   */
  execute(action: ContextMenuAction, event: MouseEvent): void {
    // Impedir a propagação do evento
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    this.actionExecuted.emit(action);
    this.close();
  }

  /**
   * Add global click listener to close menu when clicking outside
   */
  private addGlobalClickListener(): void {
    // Remove any existing listener
    if (this.removeGlobalListener) {
      this.removeGlobalListener();
    }

    // Add a new global click listener
    this.removeGlobalListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      // Check if click is outside the menu
      const clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.close();
      }
    });
  }

  setCustomItems(items: any[]): void {
    this.customItems = items;
  }

  setCustomActionHandler(handler: (action: string) => void): void {
    this.customActionHandler = handler;
  }

  executeCustomAction(actionId: string): void {
    if (this.customActionHandler) {
      this.customActionHandler(actionId);
    }

    // Fechar o menu
    this.closed.emit();
  }
}
