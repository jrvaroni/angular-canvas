// src/app/features/canvas/models/history.model.ts

export enum ActionType {
    ADD_LAYER = 'add_layer',
    REMOVE_LAYER = 'remove_layer',
    MODIFY_LAYER = 'modify_layer',
    REORDER_LAYER = 'reorder_layer',
    GROUP_LAYERS = 'group_layers',
    UNGROUP_LAYERS = 'ungroup_layers',
    CLEAR_CANVAS = 'clear_canvas',
    IMPORT_CANVAS = 'import_canvas'
  }
  
  export interface HistoryAction {
    type: ActionType;
    timestamp: number;
    layerIds?: string[];
    data?: any; // Action-specific data
    previousState?: any; // For undo functionality
  }
  
  export interface HistoryState {
    actions: HistoryAction[];
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
  }