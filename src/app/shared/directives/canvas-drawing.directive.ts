// src/app/shared/directives/canvas-drawing.directive.ts

import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

@Directive({
  selector: '[appCanvasDrawing]',
  standalone: true
})
export class CanvasDrawingDirective {
  private el = inject(ElementRef<HTMLCanvasElement>);
  
  @Input() drawingEnabled: boolean = true;
  @Input() strokeColor: string = '#000000';
  @Input() strokeWidth: number = 2;
  @Input() smoothing: boolean = true;
  
  @Output() drawStart = new EventEmitter<DrawingPoint>();
  @Output() drawMove = new EventEmitter<DrawingPoint>();
  @Output() drawEnd = new EventEmitter<void>();
  
  private isDrawing: boolean = false;
  private lastPoint: DrawingPoint | null = null;
  private points: DrawingPoint[] = [];
  
  constructor() {}
  
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (!this.drawingEnabled) return;
    
    this.isDrawing = true;
    const point = this.getPointFromEvent(event);
    this.lastPoint = point;
    this.points = [point];
    
    this.drawStart.emit(point);
  }
  
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing || !this.drawingEnabled) return;
    
    const point = this.getPointFromEvent(event);
    
    if (this.smoothing) {
      // Add point to collection for smoothing
      this.points.push(point);
      
      // Only process points periodically for smoother curves
      if (this.points.length > 3) {
        const smoothedPoint = this.getSmoothPoint(this.points);
        this.lastPoint = smoothedPoint;
        this.drawMove.emit(smoothedPoint);
      }
    } else {
      this.lastPoint = point;
      this.drawMove.emit(point);
    }
  }
  
  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMouseUpOrLeave(): void {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    this.lastPoint = null;
    this.points = [];
    
    this.drawEnd.emit();
  }
  
  /**
   * Convert mouse event to drawing point
   */
  private getPointFromEvent(event: MouseEvent): DrawingPoint {
    const rect = this.el.nativeElement.getBoundingClientRect();
    
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      pressure: 1.0
    };
  }
  
  /**
   * Calculate smooth point from collected points
   */
  private getSmoothPoint(points: DrawingPoint[]): DrawingPoint {
    // Simple Bezier curve smoothing
    if (points.length < 4) return points[points.length - 1];
    
    const l = points.length - 1;
    
    return {
      x: (points[l-2].x + 4 * points[l-1].x + points[l].x) / 6,
      y: (points[l-2].y + 4 * points[l-1].y + points[l].y) / 6,
      pressure: points[l].pressure
    };
  }
  
  /**
   * Draw directly to the canvas (utility method)
   */
  drawToCanvas(
    ctx: CanvasRenderingContext2D, 
    from: DrawingPoint, 
    to: DrawingPoint, 
    color: string = this.strokeColor, 
    width: number = this.strokeWidth
  ): void {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width * (to.pressure || 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
}