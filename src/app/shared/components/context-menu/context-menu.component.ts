// src/app/features/canvas/components/context-menu/context-menu.component.ts

import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';

import { LayerService } from '../../../services/layer.service';
import { Layer } from '../../../models/layer.model';
import { lucideArrowDown, lucideArrowUp, lucideCornerLeftDown, lucideCornerRightUp, lucideFolder, lucideFolderOpen, lucideLock, lucideLockOpen, lucideTrash2 } from '@ng-icons/lucide';

// Context menu actions
export enum ContextMenuAction {
  BRING_TO_FRONT = 'bring_to_front',
  SEND_TO_BACK = 'send_to_back',
  MOVE_FORWARD = 'move_forward',
  MOVE_BACKWARD = 'move_backward',
  DUPLICATE = 'duplicate',
  DELETE = 'delete',
  GROUP = 'group',
  UNGROUP = 'ungroup',
  COPY = 'copy',
  CUT = 'cut',
  PASTE = 'paste',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  RENAME = 'rename'
}

interface ContextMenuItem {
  label: string;
  icon: string;
  action: ContextMenuAction;
  disabled?: boolean;
  separator?: boolean;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [
    CommonModule,
    HlmButtonDirective,
    HlmIconComponent,
    HlmSeparatorDirective
  ],
    providers: [
      provideIcons({
        lucideCornerRightUp,
        lucideCornerLeftDown,
        lucideArrowUp,
        lucideArrowDown,
        lucideFolder,
        lucideFolderOpen,
        lucideLock,
        lucideLockOpen,
        lucideTrash2
      })
    ],
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent {
  private layerService = inject(LayerService);
  
  // Position of the context menu
  @Input() x: number = 0;
  @Input() y: number = 0;
  
  // Event emitter for when the menu is closed
  @Output() closed = new EventEmitter<void>();
  
  // Context menu items
  menuItems: ContextMenuItem[] = [];
  
  // Timeout ID for auto-closing
  private closeTimeoutId: any;
  
  constructor() {
    // Initialize once to avoid creating arrays in getMenuItems
    this.menuItems = this.getMenuItems();
  }
  
  /**
   * Open the context menu at the specified position
   */
  open(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.menuItems = this.getMenuItems();
    
    // Clear any existing timeout
    if (this.closeTimeoutId) {
      clearTimeout(this.closeTimeoutId);
    }
    
    // Auto-close after 5 seconds
    this.closeTimeoutId = setTimeout(() => this.close(), 5000);
  }
  
  /**
   * Close the context menu
   */
  close(): void {
    if (this.closeTimeoutId) {
      clearTimeout(this.closeTimeoutId);
    }
    this.closed.emit();
  }
  
  /**
   * Handle menu item click
   */
  onMenuItemClick(action: ContextMenuAction): void {
    const selectedLayers = this.layerService.selectedLayers();
    
    if (selectedLayers.length === 0) {
      this.close();
      return;
    }
    
    switch (action) {
      case ContextMenuAction.BRING_TO_FRONT:
        selectedLayers.forEach(layer => {
          this.layerService.bringLayerToFront(layer.id);
        });
        break;
        
      case ContextMenuAction.SEND_TO_BACK:
        selectedLayers.forEach(layer => {
          this.layerService.sendLayerToBack(layer.id);
        });
        break;
        
      case ContextMenuAction.MOVE_FORWARD:
        selectedLayers.forEach(layer => {
          this.layerService.moveLayerForward(layer.id);
        });
        break;
        
      case ContextMenuAction.MOVE_BACKWARD:
        selectedLayers.forEach(layer => {
          this.layerService.moveLayerBackward(layer.id);
        });
        break;
        
      case ContextMenuAction.DELETE:
        selectedLayers.forEach(layer => {
          this.layerService.deleteLayer(layer.id);
        });
        break;
        
      case ContextMenuAction.GROUP:
        if (selectedLayers.length >= 2) {
          this.layerService.groupSelectedLayers();
        }
        break;
        
      case ContextMenuAction.UNGROUP:
        selectedLayers.forEach(layer => {
          if (layer.type === 'group') {
            this.layerService.ungroupLayers(layer.id);
          }
        });
        break;
        
      case ContextMenuAction.LOCK:
        selectedLayers.forEach(layer => {
          if (!layer.locked) {
            this.layerService.toggleLayerLock(layer.id);
          }
        });
        break;
        
      case ContextMenuAction.UNLOCK:
        selectedLayers.forEach(layer => {
          if (layer.locked) {
            this.layerService.toggleLayerLock(layer.id);
          }
        });
        break;
        
      // Other actions could be implemented as needed
    }
    
    this.close();
  }
  
  /**
   * Get the context menu items based on selected layers
   */
  private getMenuItems(): ContextMenuItem[] {
    const selectedLayers = this.layerService.selectedLayers();
    const hasSelection = selectedLayers.length > 0;
    const hasMultipleSelected = selectedLayers.length > 1;
    const allLocked = hasSelection && selectedLayers.every(layer => layer.locked);
    const someUnlocked = hasSelection && selectedLayers.some(layer => !layer.locked);
    const someLocked = hasSelection && selectedLayers.some(layer => layer.locked);
    const hasGroupSelected = hasSelection && selectedLayers.some(layer => layer.type === 'group');
    
    return [
      {
        label: 'Trazer para Frente',
        icon: 'lucideCornerRightUp',
        action: ContextMenuAction.BRING_TO_FRONT,
        disabled: !hasSelection || allLocked
      },
      {
        label: 'Enviar para Trás',
        icon: 'lucideCornerLeftDown',
        action: ContextMenuAction.SEND_TO_BACK,
        disabled: !hasSelection || allLocked
      },
      {
        label: 'Avançar',
        icon: 'lucideArrowUp',
        action: ContextMenuAction.MOVE_FORWARD,
        disabled: !hasSelection || allLocked
      },
      {
        label: 'Recuar',
        icon: 'lucideArrowDown',
        action: ContextMenuAction.MOVE_BACKWARD,
        disabled: !hasSelection || allLocked,
        separator: true
      },
      {
        label: 'Agrupar',
        icon: 'lucideFolder',
        action: ContextMenuAction.GROUP,
        disabled: !hasMultipleSelected || allLocked
      },
      {
        label: 'Desagrupar',
        icon: 'lucideFolderOpen',
        action: ContextMenuAction.UNGROUP,
        disabled: !hasGroupSelected || allLocked,
        separator: true
      },
      {
        label: 'Bloquear',
        icon: 'lucideLock',
        action: ContextMenuAction.LOCK,
        disabled: !hasSelection || allLocked
      },
      {
        label: 'Desbloquear',
        icon: 'lucideLockOpen',
        action: ContextMenuAction.UNLOCK,
        disabled: !hasSelection || !someLocked,
        separator: true
      },
      {
        label: 'Excluir',
        icon: 'lucideTrash2',
        action: ContextMenuAction.DELETE,
        disabled: !hasSelection || allLocked
      },
    ];
  }
}