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

export interface Projectile {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  active: boolean;
  ownerId: string;
  createdAt: number;
}

export interface GameState {
  player: Character;
  enemy: Enemy;
  gameStatus: GameStatus;
  round: number;
  sukunaDefeated: number;
  particles: Particle[];
  projectiles: Projectile[];
  // Visual effect events
  muzzleFlashTime: number;       // timestamp of last shot (performance.now())
  playerDamageFlashTime: number; // timestamp of last time player took damage
  playerLandedTime: number;      // timestamp of last player landing
  enemyLandedTime: number;       // timestamp of last enemy landing
  explosionEvents: ExplosionEvent[]; // list of active explosion positions
}

export interface ExplosionEvent {
  id: string;
  x: number;
  y: number;
  z: number;
  startTime: number;
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
  shoot: boolean;
}
