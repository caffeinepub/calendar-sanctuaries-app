import { Character, Enemy, KeyState, AttackType, FacingDirection } from '../types/game';

const GRAVITY = 1800;
const JUMP_FORCE = -620;
const MOVE_SPEED = 280;

// 3D world coordinates
// X: left/right (-7 to 7 in world units, mapped from 0-900 canvas)
// Y: up/down (0 = ground, positive = up in world)
// Z: fixed at 0 for side-view

// Ground level in game units (y = 0 means character bottom is at ground)
export const GROUND_LEVEL = 0;

// World bounds in game units (x range)
export const WORLD_MIN_X = 0;
export const WORLD_MAX_X = 900;

// Canvas width kept for compatibility
export const CANVAS_W = 900;

export function applyPlayerPhysics(
  player: Character,
  keys: KeyState,
  dt: number
): Character {
  let { x, y, z, vx, vy, vz, isOnGround, facing, attackTimer, hitTimer } = player;

  // Horizontal movement
  if (keys.left) {
    vx = -MOVE_SPEED;
    facing = FacingDirection.LEFT;
  } else if (keys.right) {
    vx = MOVE_SPEED;
    facing = FacingDirection.RIGHT;
  } else {
    vx = vx * 0.75;
    if (Math.abs(vx) < 5) vx = 0;
  }

  // Jump
  if (keys.up && isOnGround) {
    vy = JUMP_FORCE;
    isOnGround = false;
  }

  // Gravity
  vy += GRAVITY * dt;

  // Position update
  x += vx * dt;
  y += vy * dt;
  // z stays fixed at 0 for side-view

  // Ground collision
  if (y >= GROUND_LEVEL) {
    y = GROUND_LEVEL;
    vy = 0;
    isOnGround = true;
  }

  // Wall bounds
  x = Math.max(WORLD_MIN_X, Math.min(WORLD_MAX_X - player.width, x));

  // Timers
  if (attackTimer > 0) attackTimer -= dt;
  if (hitTimer > 0) hitTimer -= dt;

  return { ...player, x, y, z, vx, vy, vz, isOnGround, facing, attackTimer, hitTimer };
}

export function applyAttack(
  player: Character,
  keys: KeyState,
  dt: number
): Character {
  let { attackType, attackTimer } = player;

  if (attackTimer <= 0) {
    if (keys.punch) {
      attackType = AttackType.PUNCH;
      attackTimer = 0.35;
    } else if (keys.kick) {
      attackType = AttackType.KICK;
      attackTimer = 0.45;
    } else {
      attackType = AttackType.NONE;
    }
  }

  return { ...player, attackType, attackTimer };
}

export function getAttackHitbox(char: Character): { x: number; y: number; w: number; h: number } | null {
  if (char.attackTimer <= 0 || char.attackType === AttackType.NONE) return null;

  const reach = char.attackType === AttackType.PUNCH ? 80 : 100;
  const offsetX = char.facing === FacingDirection.RIGHT ? char.width : -reach;
  const offsetY = char.attackType === AttackType.KICK ? char.height * 0.5 : char.height * 0.1;
  const h = char.attackType === AttackType.KICK ? 50 : 40;

  return {
    x: char.x + offsetX,
    y: char.y + offsetY,
    w: reach,
    h,
  };
}

export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
