import { Character, KeyState } from '../types/game';

export const GROUND_LEVEL = 0;
export const CANVAS_W = 900;
export const ARENA_LEFT = -4;
export const ARENA_RIGHT = 4;
export const JUMP_VELOCITY = 8;
export const GRAVITY = -20;
export const MOVE_SPEED = 3.5;

export function applyPhysics(char: Character, delta: number): Character {
  let { x, y, vx, vy, isGrounded, isJumping } = char;

  // Apply gravity
  vy += GRAVITY * delta;
  y += vy * delta;

  // Ground collision
  if (y <= GROUND_LEVEL) {
    y = GROUND_LEVEL;
    vy = 0;
    isGrounded = true;
    isJumping = false;
  } else {
    isGrounded = false;
  }

  // Apply horizontal movement
  x += vx * delta;

  // Arena bounds
  x = Math.max(ARENA_LEFT, Math.min(ARENA_RIGHT, x));

  return { ...char, x, y, vx, vy, isGrounded, isJumping };
}

export function applyPlayerInput(char: Character, keys: KeyState, delta: number): Character {
  let { vx, vy, isGrounded, isJumping, facing } = char;

  // Horizontal movement
  if (keys.left) {
    vx = -MOVE_SPEED;
    facing = -1;
  } else if (keys.right) {
    vx = MOVE_SPEED;
    facing = 1;
  } else {
    vx = 0;
  }

  // Jump
  if (keys.up && isGrounded) {
    vy = JUMP_VELOCITY;
    isGrounded = false;
    isJumping = true;
  }

  return { ...char, vx, vy, isGrounded, isJumping, facing };
}

export interface AttackHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getAttackHitbox(
  attacker: Character,
  attackType: 'punch' | 'kick' | 'sword',
  swordActive?: boolean
): AttackHitbox {
  const baseRange = attackType === 'kick' ? 1.2 : 0.9;
  // Sword extends range significantly
  const range = swordActive || attackType === 'sword' ? baseRange * 2.2 : baseRange;
  const height = attackType === 'kick' ? 0.6 : 0.8;

  return {
    x: attacker.x + attacker.facing * (range / 2),
    y: attacker.y + 0.5,
    width: range,
    height,
  };
}

export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return (
    ax - aw / 2 < bx + bw / 2 &&
    ax + aw / 2 > bx - bw / 2 &&
    ay - ah / 2 < by + bh / 2 &&
    ay + ah / 2 > by - bh / 2
  );
}
