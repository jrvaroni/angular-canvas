import { Point } from './point.model';

export type ElementType = 
  | 'rectangle' 
  | 'circle' 
  | 'line' 
  | 'text' 
  | 'path' 
  | 'connector' 
  | 'group'
  | 'diamond'
  | 'ellipse'
  | 'image';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  zIndex: number;
  name?: string;
  
  // Rectangle and general shape properties
  width?: number;
  height?: number;
  
  // Circle properties
  radius?: number;
  
  // Line and connector properties
  endX?: number;
  endY?: number;
  points?: Point[];
  sourceId?: string;
  targetId?: string;
  
  // Style properties
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  
  // Group properties
  children?: CanvasElement[];
  
  // Image properties
  src?: string;
  
  // Additional properties for diagram elements
  diagramType?: 'class' | 'sequence' | 'flowchart' | 'entity';
  properties?: Record<string, any>;
}
