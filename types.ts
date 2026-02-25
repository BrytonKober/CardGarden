export type RotationMode = 'vertical' | 'horizontal';
export type Orientation = 'upright' | 'reversed' | 'sideways';

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'Major' | 'Minor';
  suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
  rank?: number | string;
}

export interface Placeholder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotationMode: RotationMode;
  zIndex: number;
  label?: string;
  assignedCard?: TarotCard | null;
  orientation?: Orientation;
  flipped: boolean;
}

export interface Spread {
  grid: {
    cellSize: number;
    width: number;
    height: number;
  };
  cards: Placeholder[];
}
