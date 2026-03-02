import { Character } from '../types/game';
import { GROUND_LEVEL } from './gamePhysics';

export type EnemyAIState = 'idle' | 'approach' | 'attack' | 'retreat' | 'jump';

export interface EnemyAIConfig {
  moveSpeed: number;
  attackRange: number;
  attackCooldown: number;
  retreatDistance: number;
  jumpChance: number;
  attackDamage: number;
}

export const BASE_ENEMY_CONFIG: EnemyAIConfig = {
  moveSpeed: 2.2,
  attackRange: 1.4,
  attackCooldown: 1.2,
  retreatDistance: 0.8,
  jumpChance: 0.008,
  attackDamage: 12,
};

export function getEnemyConfigForLevel(level: number): EnemyAIConfig {
  const speedMult = 1 + (level - 1) * 0.35;
  const damageMult = 1 + (level - 1) * 0.4;
  return {
    moveSpeed: BASE_ENEMY_CONFIG.moveSpeed * speedMult,
    attackRange: BASE_ENEMY_CONFIG.attackRange,
    attackCooldown: Math.max(0.6, BASE_ENEMY_CONFIG.attackCooldown - (level - 1) * 0.2),
    retreatDistance: BASE_ENEMY_CONFIG.retreatDistance,
    jumpChance: BASE_ENEMY_CONFIG.jumpChance * (1 + (level - 1) * 0.3),
    attackDamage: BASE_ENEMY_CONFIG.attackDamage * damageMult,
  };
}

interface EnemyAIResult {
  enemy: Character;
  didAttack: boolean;
  attackDamage: number;
}

export function updateEnemyAI(
  enemy: Character,
  player: Character,
  delta: number,
  aiCooldownRef: { current: number },
  config?: Partial<EnemyAIConfig>
): EnemyAIResult {
  const cfg: EnemyAIConfig = { ...BASE_ENEMY_CONFIG, ...config };

  let { x, y, z, vx, vy, vz, facing, isGrounded } = enemy;
  let didAttack = false;
  let attackDamage = 0;

  const dx = player.x - x;
  const dist = Math.abs(dx);

  // Reduce cooldown
  aiCooldownRef.current = Math.max(0, aiCooldownRef.current - delta);

  // Gravity
  vy -= 20 * delta;
  y += vy * delta;
  if (y <= GROUND_LEVEL) {
    y = GROUND_LEVEL;
    vy = 0;
    isGrounded = true;
  } else {
    isGrounded = false;
  }

  // Face player
  facing = dx > 0 ? 1 : -1;

  if (dist > cfg.attackRange) {
    // Approach player
    vx = facing * cfg.moveSpeed;

    // Occasional jump
    if (isGrounded && Math.random() < cfg.jumpChance) {
      vy = 7;
      isGrounded = false;
    }
  } else {
    // In attack range
    vx = 0;

    if (aiCooldownRef.current <= 0) {
      // Attack
      didAttack = true;
      attackDamage = cfg.attackDamage;
      aiCooldownRef.current = cfg.attackCooldown;
    } else if (dist < cfg.retreatDistance) {
      // Too close, retreat
      vx = -facing * cfg.moveSpeed * 0.5;
    }
  }

  x += vx * delta;
  // Keep z at 0 for side-view
  z = 0;
  vz = 0;

  // Arena bounds
  x = Math.max(-4, Math.min(4, x));

  return {
    enemy: {
      ...enemy,
      x, y, z, vx, vy, vz,
      facing,
      isGrounded,
      isJumping: !isGrounded,
    },
    didAttack,
    attackDamage,
  };
}
