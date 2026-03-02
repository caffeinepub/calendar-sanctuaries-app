import { Character, Enemy, GameState, GameStatus, AttackType, FacingDirection, Particle, Projectile } from '../types/game';
import { getAttackHitbox, rectsOverlap } from './gamePhysics';

const PUNCH_DAMAGE = 8;
const KICK_DAMAGE = 12;
const ENEMY_PUNCH_DAMAGE = 6;
const ENEMY_KICK_DAMAGE = 10;
export const PROJECTILE_DAMAGE = 15;

function getDamage(type: AttackType, isEnemy: boolean): number {
  if (type === AttackType.PUNCH) return isEnemy ? ENEMY_PUNCH_DAMAGE : PUNCH_DAMAGE;
  if (type === AttackType.KICK) return isEnemy ? ENEMY_KICK_DAMAGE : KICK_DAMAGE;
  return 0;
}

function spawnHitParticles(x: number, y: number, z: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
    const speed = 80 + Math.random() * 140;
    const vz = (Math.random() - 0.5) * 60;
    particles.push({
      x,
      y,
      z,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      vz,
      life: 0.4 + Math.random() * 0.2,
      maxLife: 0.6,
      color,
      size: 4 + Math.random() * 6,
    });
  }
  return particles;
}

export function spawnProjectileHitParticles(x: number, y: number, z: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
    const speed = 100 + Math.random() * 180;
    const vz = (Math.random() - 0.5) * 80;
    particles.push({
      x,
      y,
      z,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 100,
      vz,
      life: 0.35 + Math.random() * 0.25,
      maxLife: 0.6,
      color: '#ffee00',
      size: 5 + Math.random() * 8,
    });
  }
  return particles;
}

export function checkProjectileHitsEnemy(
  projectile: Projectile,
  enemy: Character
): boolean {
  // Projectile hitbox: small sphere radius ~0.5 world units
  // Convert projectile x/y from game coords to check against enemy rect
  const pRadius = 20; // in game units (same scale as character coords)
  return rectsOverlap(
    projectile.x - pRadius,
    projectile.y - pRadius,
    pRadius * 2,
    pRadius * 2,
    enemy.x,
    enemy.y,
    enemy.width,
    enemy.height
  );
}

export function processCombat(state: GameState): GameState {
  let { player, enemy, particles } = state;

  // Player attacks enemy
  const playerHitbox = getAttackHitbox(player);
  if (playerHitbox && enemy.hitTimer <= 0) {
    const hit = rectsOverlap(
      playerHitbox.x, playerHitbox.y, playerHitbox.w, playerHitbox.h,
      enemy.x, enemy.y, enemy.width, enemy.height
    );
    if (hit) {
      const dmg = getDamage(player.attackType, false);
      const newHealth = Math.max(0, enemy.health - dmg);
      const knockback = player.facing === FacingDirection.RIGHT ? 120 : -120;
      enemy = {
        ...enemy,
        health: newHealth,
        hitTimer: 0.3,
        vx: knockback,
        aiState: 'stagger',
      };
      particles = [
        ...particles,
        ...spawnHitParticles(
          playerHitbox.x + playerHitbox.w / 2,
          playerHitbox.y + playerHitbox.h / 2,
          enemy.z,
          '#ff4444'
        ),
      ];
    }
  }

  // Enemy attacks player
  const enemyHitbox = getAttackHitbox(enemy);
  if (enemyHitbox && player.hitTimer <= 0) {
    const hit = rectsOverlap(
      enemyHitbox.x, enemyHitbox.y, enemyHitbox.w, enemyHitbox.h,
      player.x, player.y, player.width, player.height
    );
    if (hit) {
      const dmg = getDamage(enemy.attackType, true);
      const newHealth = Math.max(0, player.health - dmg);
      const knockback = enemy.facing === FacingDirection.RIGHT ? 100 : -100;
      player = {
        ...player,
        health: newHealth,
        hitTimer: 0.25,
        vx: knockback,
      };
      particles = [
        ...particles,
        ...spawnHitParticles(
          enemyHitbox.x + enemyHitbox.w / 2,
          enemyHitbox.y + enemyHitbox.h / 2,
          player.z,
          '#8844ff'
        ),
      ];
    }
  }

  // Check game status
  let gameStatus = state.gameStatus;
  let sukunaDefeated = state.sukunaDefeated;

  if (player.health <= 0) {
    gameStatus = GameStatus.GAME_OVER;
  } else if (enemy.health <= 0) {
    sukunaDefeated += 1;
    enemy = createNewEnemy(sukunaDefeated);
    gameStatus = GameStatus.PLAYING;
  }

  return { ...state, player, enemy, particles, gameStatus, sukunaDefeated };
}

export function createNewEnemy(round: number): Enemy {
  const healthBoost = Math.min(round * 20, 100);
  return {
    x: 680,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    width: 64,
    height: 96,
    health: 100 + healthBoost,
    maxHealth: 100 + healthBoost,
    isOnGround: true,
    facing: FacingDirection.LEFT,
    attackType: AttackType.NONE,
    attackTimer: 0,
    hitTimer: 0,
    isBlocking: false,
    aiState: 'approach',
    aiTimer: 0,
    attackCooldown: 1.0,
  };
}

export function createInitialPlayer(): Character {
  return {
    x: 160,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    width: 64,
    height: 96,
    health: 150,
    maxHealth: 150,
    isOnGround: true,
    facing: FacingDirection.RIGHT,
    attackType: AttackType.NONE,
    attackTimer: 0,
    hitTimer: 0,
    isBlocking: false,
  };
}

export function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      z: p.z + p.vz * dt,
      vy: p.vy + 200 * dt,
      life: p.life - dt,
    }))
    .filter(p => p.life > 0);
}
