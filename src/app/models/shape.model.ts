// src/app/features/canvas/models/shape.model.ts

export enum Shape {
    RECTANGLE = 'rectangle',
    ELLIPSE = 'ellipse',
    LINE = 'line',
    POLYLINE = 'polyline',
    POLYGON = 'polygon',
    PATH = 'path',
    ARROW = 'arrow',
    STAR = 'star',
    ROUNDED_RECTANGLE = 'rounded-rectangle',
    DIAMOND = 'diamond',
    TRIANGLE = 'triangle',
    CLOUD = 'cloud'
  }
  
  export interface Point {
    x: number;
    y: number;
  }
  
  export interface ShapeProps {
    id: string;
    type: Shape;
    points?: Point[];
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    rotation?: number;
    strokeColor: string;
    fillColor: string; 
    strokeWidth: number;
    opacity?: number;
    dashArray?: number[];
  }
  
  export interface RectangleProps extends ShapeProps {
    type: Shape.RECTANGLE;
    width: number;
    height: number;
  }
  
  export interface EllipseProps extends ShapeProps {
    type: Shape.ELLIPSE;
    radiusX: number;
    radiusY: number;
  }
  
  export interface LineProps extends ShapeProps {
    type: Shape.LINE;
    points: [Point, Point];
    arrowStart?: boolean;
    arrowEnd?: boolean;
  }
  
  export interface PolylineProps extends ShapeProps {
    type: Shape.POLYLINE;
    points: Point[];
    closed?: boolean;
  }
  
  export interface PathProps extends ShapeProps {
    type: Shape.PATH;
    data: string; // SVG path data string
  }
  
  export interface DiagramElementProps {
    id: string;
    type: 'class' | 'actor' | 'lifeline' | 'entity' | 'process' | 'decision' | 'note';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    data: any; // Element-specific data (varies by diagram type)
  }
  
  export interface ConnectorProps {
    id: string;
    type: 'direct' | 'orthogonal' | 'curved';
    sourceId: string;
    targetId: string;
    sourcePoint?: Point;
    targetPoint?: Point;
    controlPoints?: Point[];
    strokeColor: string;
    strokeWidth: number;
    dashArray?: number[];
    arrowStart?: boolean;
    arrowEnd?: boolean;
    label?: string;
  }