export enum Tool {
  SELECT = 'select',
  MOVE = 'move',
  PEN = 'pen',
  LINE = 'line',
  RECTANGLE = 'rectangle',
  ELLIPSE = 'ellipse',
  TEXT = 'text',
  ERASER = 'eraser',
  CONNECTOR = 'connector',
  PAN = 'pan',
  DIAGRAM = 'diagram',
}

export interface ToolOption {
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  opacity?: number;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  dashArray?: number[];
}

export interface ToolConfig {
  id: Tool;
  name: string;
  icon: string;
  cursor: string;
  options?: ToolOption;
}

export const DEFAULT_TOOLS: ToolConfig[] = [
  {
    id: Tool.SELECT,
    name: 'Seleção',
    icon: 'lucidePointer',
    cursor: 'default',
  },
  {
    id: Tool.MOVE,
    name: 'Mover',
    icon: 'lucideMove',
    cursor: 'move',
  },
  {
    id: Tool.PEN,
    name: 'Caneta',
    icon: 'lucidePen',
    cursor: 'crosshair',
    options: {
      strokeColor: '#000000',
      strokeWidth: 2,
    },
  },
  {
    id: Tool.LINE,
    name: 'Linha',
    icon: 'lucideSlash',
    cursor: 'crosshair',
    options: {
      strokeColor: '#000000',
      strokeWidth: 2,
    },
  },
  {
    id: Tool.RECTANGLE,
    name: 'Retângulo',
    icon: 'lucideSquare',
    cursor: 'crosshair',
    options: {
      strokeColor: '#000000',
      fillColor: 'transparent',
      strokeWidth: 2,
    },
  },
  {
    id: Tool.ELLIPSE,
    name: 'Elipse',
    icon: 'lucideCircle',
    cursor: 'crosshair',
    options: {
      strokeColor: '#000000',
      fillColor: 'transparent',
      strokeWidth: 2,
    },
  },
  {
    id: Tool.TEXT,
    name: 'Texto',
    icon: 'lucideType',
    cursor: 'text',
    options: {
      strokeColor: '#000000',
      fontSize: 16,
      fontFamily: 'Arial',
    },
  },
  {
    id: Tool.ERASER,
    name: 'Borracha',
    icon: 'lucideEraser',
    cursor: 'crosshair',
    options: {
      strokeWidth: 10,
    },
  },
  {
    id: Tool.CONNECTOR,
    name: 'Conector',
    icon: 'lucideCombine',
    cursor: 'crosshair',
    options: {
      strokeColor: '#000000',
      strokeWidth: 2,
      arrowEnd: true,
    },
  },
  {
    id: Tool.PAN,
    name: 'Navegar',
    icon: 'lucideHand',
    cursor: 'grab',
  },
];
