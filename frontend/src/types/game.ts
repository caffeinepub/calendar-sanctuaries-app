export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Particle {
  id: number;
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

export interface Projectile {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  ownerId: string;
}

export interface ExplosionEvent {
  id: number;
  x: number;
  y: number;
  z: number;
  time: number;
}

export interface Character {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  health: number;
  maxHealth: number;
  facing: number;
  isAttacking: boolean;
  attackType: 'punch' | 'kick' | 'none';
  attackTimer: number;
  isJumping: boolean;
  isGrounded: boolean;
  hitFlashTimer: number;
  isBlocking: boolean;
  // Sword fields
  swordActive: boolean;
  swordDamageMultiplier: number;
}

export interface GameState {
  player: Character;
  enemies: Character[];
  particles: Particle[];
  projectiles: Projectile[];
  gamePhase: 'playing' | 'playerWon' | 'playerLost' | 'paused';
  score: number;
  timeElapsed: number;
  muzzleFlashTime: number;
  playerDamageFlashTime: number;
  playerLandedTime: number;
  enemyLandedTime: number;
  explosionEvents: ExplosionEvent[];
  // Level fields
  currentLevel: number;
  enemiesDefeatedInLevel: number;
  levelTransitioning: boolean;
  levelTransitionTimer: number;
  allLevelsComplete: boolean;
}

export interface KeyState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  punch: boolean;
  kick: boolean;
  block: boolean;
  shoot: boolean;
  sword: boolean;
}

export interface LevelConfig {
  level: number;
  enemyCount: number;
  enemySpeedMultiplier: number;
  enemyStrengthMultiplier: number;
  enemyHealthMultiplier: number;
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    enemyCount: 1,
    enemySpeedMultiplier: 1.0,
    enemyStrengthMultiplier: 1.0,
    enemyHealthMultiplier: 1.0,
  },
  {
    level: 2,
    enemyCount: 1,
    enemySpeedMultiplier: 1.3,
    enemyStrengthMultiplier: 1.4,
    enemyHealthMultiplier: 1.3,
  },
  {
    level: 3,
    enemyCount: 1,
    enemySpeedMultiplier: 1.7,
    enemyStrengthMultiplier: 1.8,
    enemyHealthMultiplier: 1.6,
  },
];

export const MAX_LEVELS = 3;
