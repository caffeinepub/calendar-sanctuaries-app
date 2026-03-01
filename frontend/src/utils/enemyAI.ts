import { Enemy, Character, AttackType, FacingDirection } from '../types/game';
import { GROUND_LEVEL } from './gamePhysics';

const GRAVITY = 1800;
const ENEMY_SPEED = 160;
const ATTACK_RANGE = 110;
const RETREAT_RANGE = 60;

export function updateEnemyAI(enemy: Enemy, player: Character, dt: number): Enemy {
  let { x, y, z, vx, vy, vz, isOnGround, facing, attackType, attackTimer, hitTimer, aiState, aiTimer, attackCooldown } = enemy;

  // Timers
  if (attackTimer > 0) attackTimer -= dt;
  if (hitTimer > 0) hitTimer -= dt;
  if (aiTimer > 0) aiTimer -= dt;
  if (attackCooldown > 0) attackCooldown -= dt;

  // Hit stagger
  if (hitTimer > 0) {
    aiState = 'stagger';
    vx = vx * 0.8;
  } else {
    const dist = Math.abs(player.x - x);

    if (aiState === 'stagger' && hitTimer <= 0) {
      aiState = 'approach';
    }

    if (aiState !== 'stagger') {
      if (dist < RETREAT_RANGE) {
        aiState = 'retreat';
      } else if (dist <= ATTACK_RANGE && attackCooldown <= 0) {
        aiState = 'attack';
      } else {
        aiState = 'approach';
      }
    }

    // Movement
    if (aiState === 'approach') {
      const dir = player.x > x ? 1 : -1;
      vx = dir * ENEMY_SPEED;
      facing = dir > 0 ? FacingDirection.RIGHT : FacingDirection.LEFT;
    } else if (aiState === 'retreat') {
      const dir = player.x > x ? -1 : 1;
      vx = dir * ENEMY_SPEED * 0.7;
      facing = player.x > x ? FacingDirection.LEFT : FacingDirection.RIGHT;
    } else if (aiState === 'attack') {
      vx = vx * 0.5;
      facing = player.x > x ? FacingDirection.RIGHT : FacingDirection.LEFT;
      if (attackTimer <= 0 && attackCooldown <= 0) {
        attackType = Math.random() > 0.5 ? AttackType.PUNCH : AttackType.KICK;
        attackTimer = attackType === AttackType.PUNCH ? 0.35 : 0.45;
        attackCooldown = 1.2 + Math.random() * 0.8;
      }
    }
  }

  // Gravity
  vy += GRAVITY * dt;
  x += vx * dt;
  y += vy * dt;
  // z stays fixed

  if (y >= GROUND_LEVEL) {
    y = GROUND_LEVEL;
    vy = 0;
    isOnGround = true;
  }

  // Wall bounds
  x = Math.max(0, Math.min(900 - enemy.width, x));

  if (attackTimer <= 0) {
    attackType = AttackType.NONE;
  }

  return { ...enemy, x, y, z, vx, vy, vz, isOnGround, facing, attackType, attackTimer, hitTimer, aiState, aiTimer, attackCooldown };
}
