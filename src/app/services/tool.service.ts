// src/app/features/canvas/services/tool.service.ts

import { Injectable, Injector, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEFAULT_TOOLS, Tool, ToolConfig, ToolOption } from '../models/tool.model';
import { CanvasService } from './canvas.service';

@Injectable()
export class ToolService {
  private canvasService = inject(CanvasService);
  private _injector = inject(Injector);
  // Tool state
  private tools: ToolConfig[] = DEFAULT_TOOLS;
  private activeTool = signal<Tool>(Tool.SELECT);
  private toolOptions = signal<Map<Tool, ToolOption>>(this.initializeToolOptions());

  // Observable state
  private toolSubject = new BehaviorSubject<Tool>(Tool.SELECT);

  constructor() {
    // Configuração inicial
  }

  /**
   * Initialize tool options with defaults
   */
  private initializeToolOptions(): Map<Tool, ToolOption> {
    const options = new Map<Tool, ToolOption>();

    DEFAULT_TOOLS.forEach((tool) => {
      if (tool.options) {
        options.set(tool.id, { ...tool.options });
      }
    });

    return options;
  }

  /**
   * Get all available tools
   */
  getTools(): ToolConfig[] {
    return this.tools;
  }

  /**
   * Get the active tool
   */
  getActiveTool(): Tool {
    return this.activeTool();
  }

  /**
   * Set the active tool
   */
  setActiveTool(tool: Tool): void {
    console.log('ToolService: setActiveTool', tool);

    this.activeTool.set(tool);
    this.toolSubject.next(tool);

    // Comunicação com o CanvasService
    if (this.canvasService && typeof this.canvasService.setTool === 'function') {
      this.canvasService.setTool(tool);
    }
  }
  /**
   * Get the tool as an Observable
   */
  getToolObservable(): Observable<Tool> {
    return this.toolSubject.asObservable();
  }

  /**
   * Get options for a specific tool
   */
  getToolOptions(tool: Tool): ToolOption | undefined {
    return this.toolOptions().get(tool);
  }

  /**
   * Get options for the active tool
   */
  getActiveToolOptions(): ToolOption | undefined {
    return this.getToolOptions(this.activeTool());
  }

  /**
   * Get the cursor style for the current tool
   */
  getToolCursor(): string {
    const tool = DEFAULT_TOOLS.find((t) => t.id === this.activeTool());

    return tool ? tool.cursor : 'default';
  }

  /**
   * Update options for a specific tool
   */
  updateToolOptions(tool: Tool, options: Partial<ToolOption>): void {
    this.toolOptions.update((toolOptions) => {
      const currentOptions = toolOptions.get(tool) || {};
      toolOptions.set(tool, { ...currentOptions, ...options });
      return new Map(toolOptions);
    });
  }

  /**
   * Update options for the active tool
   */
  updateActiveToolOptions(options: Partial<ToolOption>): void {
    this.updateToolOptions(this.activeTool(), options);
  }

  /**
   * Reset options for a specific tool to defaults
   */
  resetToolOptions(tool: Tool): void {
    const defaultTool = DEFAULT_TOOLS.find((t) => t.id === tool);

    if (defaultTool && defaultTool.options) {
      this.toolOptions.update((toolOptions) => {
        toolOptions.set(tool, { ...defaultTool.options });
        return new Map(toolOptions);
      });
    }
  }

  /**
   * Reset all tool options to defaults
   */
  resetAllToolOptions(): void {
    this.toolOptions.set(this.initializeToolOptions());
  }

  /**
   * Get tool configuration by ID
   */
  getToolConfig(toolId: Tool): ToolConfig | undefined {
    return DEFAULT_TOOLS.find((tool) => tool.id === toolId);
  }
}
