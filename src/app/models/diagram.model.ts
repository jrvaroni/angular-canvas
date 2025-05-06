// src/app/features/canvas/models/diagram.model.ts

export enum DiagramType {
  SEQUENCE = 'SEQUENCE',
  CLASS = 'CLASS',
  FLOWCHART = 'FLOWCHART',
}

export enum DiagramElementType {
  // Elementos genéricos
  NOTE = 'NOTE',
  CONTAINER = 'CONTAINER',

  // Elementos de diagrama de sequência
  ACTOR = 'ACTOR',
  OBJECT = 'OBJECT',

  // Elementos de diagrama de classe
  CLASS = 'CLASS',
  INTERFACE = 'INTERFACE',
  ENTITY = 'ENTITY',

  // Elementos de fluxograma
  START = 'START',
  END = 'END',
  PROCESS = 'PROCESS',
  DECISION = 'DECISION',
}

export enum ConnectionType {
  // Tipos de conexão genéricos
  ASSOCIATION = 'ASSOCIATION',

  // Tipos de conexão de diagrama de sequência
  MESSAGE = 'MESSAGE',
  RETURN = 'RETURN',
  CREATE = 'CREATE',

  // Tipos de conexão de diagrama de classe
  INHERITANCE = 'INHERITANCE',
  IMPLEMENTATION = 'IMPLEMENTATION',
  AGGREGATION = 'AGGREGATION',
  COMPOSITION = 'COMPOSITION',
  DEPENDENCY = 'DEPENDENCY',

  // Tipos de conexão de fluxograma
  FLOW = 'FLOW',
}

export enum ArrowStyle {
  NONE = 'NONE',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DIAMOND_OPEN = 'DIAMOND_OPEN',
  DIAMOND_CLOSED = 'DIAMOND_CLOSED',
  TRIANGLE = 'TRIANGLE',
}

export interface DiagramElement {
  id: string;
  type: DiagramElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  config: DiagramElementConfig;
}

export interface DiagramElementConfig {
  type: DiagramElementType;
  title: string;
  content?: string;
  style?: {
    fillColor?: string;
    strokeColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    strokeWidth?: number;
  };
  attributes?: string[];
  methods?: string[];
}

export interface DiagramConnection {
  id: string;
  sourceId: string;
  targetId: string;
  config: ConnectionConfig;
}

export interface ConnectionConfig {
  type: ConnectionType;
  label?: string;
  sourceArrow?: ArrowStyle;
  targetArrow?: ArrowStyle;
  style?: {
    strokeColor?: string;
    strokeWidth?: number;
    strokeDash?: number[];
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
  };
}
