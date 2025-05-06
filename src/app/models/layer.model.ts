// src/app/features/canvas/models/layer.model.ts

import { Shape } from './shape.model';

export enum LayerType {
  DRAWING = 'drawing',
  SHAPE = 'shape',
  GROUP = 'group',
  DIAGRAM = 'diagram',
  TEXT = 'text',
  IMAGE = 'image',
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  children?: Layer[];
  data?: any; // For type-specific data
}

export interface DrawingLayer extends Layer {
  type: LayerType.DRAWING;
  data: {
    paths: string[]; // SVG path data
    strokeColor: string;
    strokeWidth: number;
  };
}

export interface ShapeLayer extends Layer {
  type: LayerType.SHAPE;
  data: {
    shape: Shape;
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
  };
}

export interface TextLayer extends Layer {
  type: LayerType.TEXT;
  data: {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    align: 'left' | 'center' | 'right';
  };
}

export interface ImageLayer extends Layer {
  type: LayerType.IMAGE;
  data: {
    src: string;
  };
}

export interface GroupLayer extends Layer {
  type: LayerType.GROUP;
  children: Layer[];
}

export interface DiagramLayer extends Layer {
  type: LayerType.DIAGRAM;
  data: {
    type: 'class' | 'sequence' | 'flow' | 'entity';
    elements: any[]; // Specific to diagram type
    connections: any[]; // Connections between elements
  };
  children: Layer[];
}
