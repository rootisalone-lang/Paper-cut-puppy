export interface Position {
  x: number;
  y: number;
}

export interface PuppyState {
  position: Position;
  isMoving: boolean;
  facingRight: boolean;
  imageSrc: string | null;
}

export interface GenerationStatus {
  isGenerating: boolean;
  error: string | null;
}