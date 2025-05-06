// src/app/features/canvas/services/history.service.ts

import { Injectable, signal } from '@angular/core';
import { HistoryAction, HistoryState } from '../models/history.model';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private readonly MAX_HISTORY_SIZE = 50;

  // History state
  private historyState = signal<HistoryState>({
    actions: [],
    currentIndex: -1,
    canUndo: false,
    canRedo: false,
  });

  constructor() {}

  /**
   * Add a new action to the history
   */
  addAction(action: Omit<HistoryAction, 'timestamp'>): void {
    const fullAction: HistoryAction = {
      ...action,
      timestamp: Date.now(),
    };

    this.historyState.update((state) => {
      // If we're not at the end of the history, truncate the future actions
      const actions =
        state.currentIndex < state.actions.length - 1 ? state.actions.slice(0, state.currentIndex + 1) : state.actions;

      // Add the new action
      const newActions = [...actions, fullAction];

      // Maintain maximum history size
      if (newActions.length > this.MAX_HISTORY_SIZE) {
        newActions.shift();
      }

      const newIndex = newActions.length - 1;

      return {
        actions: newActions,
        currentIndex: newIndex,
        canUndo: newIndex >= 0,
        canRedo: false, // We just added a new action, so there's nothing to redo
      };
    });
  }

  /**
   * Undo the last action
   */
  undo(): HistoryAction | null {
    let actionToUndo: HistoryAction | null = null;

    this.historyState.update((state) => {
      if (!state.canUndo) return state;

      const newIndex = state.currentIndex - 1;
      actionToUndo = state.actions[state.currentIndex];

      return {
        ...state,
        currentIndex: newIndex,
        canUndo: newIndex >= 0,
        canRedo: true,
      };
    });

    return actionToUndo;
  }

  /**
   * Redo the next action
   */
  redo(): HistoryAction | null {
    let actionToRedo: HistoryAction | null = null;

    this.historyState.update((state) => {
      if (!state.canRedo || state.currentIndex >= state.actions.length - 1) return state;

      const newIndex = state.currentIndex + 1;
      actionToRedo = state.actions[newIndex];

      return {
        ...state,
        currentIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < state.actions.length - 1,
      };
    });

    return actionToRedo;
  }

  /**
   * Get the current history state
   */
  getHistoryState(): HistoryState {
    return this.historyState();
  }

  /**
   * Clear the history
   */
  clearHistory(): void {
    this.historyState.set({
      actions: [],
      currentIndex: -1,
      canUndo: false,
      canRedo: false,
    });
  }

  /**
   * Get action at specific index
   */
  getActionAt(index: number): HistoryAction | null {
    const { actions } = this.historyState();

    if (index < 0 || index >= actions.length) {
      return null;
    }

    return actions[index];
  }

  /**
   * Get the latest action
   */
  getLatestAction(): HistoryAction | null {
    const { actions, currentIndex } = this.historyState();

    if (currentIndex < 0 || actions.length === 0) {
      return null;
    }

    return actions[currentIndex];
  }
}
