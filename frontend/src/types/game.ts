export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

export enum AttackType {
  NONE = 'NONE',
  PUNCH = 'PUNCH',
  KICK = 'KICK',
}

export enum FacingDirection {
  LEFT = -1,
  RIGHT = 1,
}

export interface Character {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  isOnGround: boolean;
  facing: FacingDirection;
  attackType: AttackType;
  attackTimer: number;
  hitTimer: number;
  isBlocking: boolean;
}

export interface Enemy extends Character {
  aiState: 'approach' | 'attack' | 'retreat' | 'stagger';
  aiTimer: number;
  attackCooldown: number;
}

export interface GameState {
  player: Character;
  enemy: Enemy;
  gameStatus: GameStatus;
  round: number;
  sukunaDefeated: number;
  particles: Particle[];
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface KeyState {
  left: boolean;
  right: boolean;
  up: boolean;
  punch: boolean;
  kick: boolean;
}
