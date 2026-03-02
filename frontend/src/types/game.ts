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

export type CharacterType = 'ug' | 'yuji' | 'sukuna' | 'gojo' | 'toji';

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
  // Character type
  characterType: CharacterType;
}

export interface CharacterStats {
  health: number;
  speed: number;
  attackDamage: number;
  attackRange: number;
  displayName: string;
}

export const CHARACTER_STATS: Record<CharacterType, CharacterStats> = {
  ug: {
    health: 150,
    speed: 3.5,
    attackDamage: 15,
    attackRange: 1.4,
    displayName: 'UG',
  },
  yuji: {
    health: 170,
    speed: 4.0,
    attackDamage: 18,
    attackRange: 1.3,
    displayName: 'Yuji',
  },
  sukuna: {
    health: 120,
    speed: 2.2,
    attackDamage: 12,
    attackRange: 1.4,
    displayName: 'Sukuna',
  },
  gojo: {
    health: 100,
    speed: 2.8,
    attackDamage: 14,
    attackRange: 1.5,
    displayName: 'Gojo',
  },
  toji: {
    health: 140,
    speed: 2.0,
    attackDamage: 18,
    attackRange: 1.3,
    displayName: 'Toji',
  },
};

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
  enemyTypes: CharacterType[];
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    enemyCount: 1,
    enemySpeedMultiplier: 1.0,
    enemyStrengthMultiplier: 1.0,
    enemyHealthMultiplier: 1.0,
    enemyTypes: ['sukuna'],
  },
  {
    level: 2,
    enemyCount: 1,
    enemySpeedMultiplier: 1.3,
    enemyStrengthMultiplier: 1.4,
    enemyHealthMultiplier: 1.3,
    enemyTypes: ['gojo'],
  },
  {
    level: 3,
    enemyCount: 1,
    enemySpeedMultiplier: 1.7,
    enemyStrengthMultiplier: 1.8,
    enemyHealthMultiplier: 1.6,
    enemyTypes: ['toji'],
  },
];

export const MAX_LEVELS = 3;
