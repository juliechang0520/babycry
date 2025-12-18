
export type BabyState = 'SLEEPING' | 'RESTLESS' | 'AWAKE' | 'VICTORY';

export interface GameStatus {
  progress: number;
  noiseLevel: number;
  babyState: BabyState;
  isGameOver: boolean;
  message: string;
}
