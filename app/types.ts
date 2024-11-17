export interface GameSettings {
  boardSize: number;
  gameSpeed: number;
  snakeColor: string;
  foodColor: string;
  controlType: 'arrows' | 'wasd' | 'gamepad';
  musicEnabled: boolean;
  musicVolume: number;
}

export interface Position {
  x: number;
  y: number;
}