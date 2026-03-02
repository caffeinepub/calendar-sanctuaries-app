import { Character, Particle, Projectile } from '../types/game';
import { rectsOverlap } from './gamePhysics';

export const MELEE_DAMAGE_PUNCH = 10;
export const MELEE_DAMAGE_KICK = 15;
export const SWORD_DAMAGE_BASE = 28;
export const PROJECTILE_DAMAGE = 20;
export const SWORD_RANGE_MULTIPLIER = 2.2;

let particleIdCounter = 0;

export function spawnHitParticles(
  x: number,
  y: number,
  z: number,
  count: number,
  color: string
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 2 + Math.random() * 3;
    particles.push({
      id: particleIdCounter++,
      x,
      y,
      z,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + 1,
      vz: (Math.random() - 0.5) * 2,
      life: 0.4 + Math.random() * 0.3,
      maxLife: 0.7,
      color,
      size: 0.05 + Math.random() * 0.08,
    });
  }
  return particles;
}

export function spawnProjectileHitParticles(
  x: number,
  y: number,
  z: number
): Particle[] {
  return spawnHitParticles(x, y, z, 12, '#FFD700');
}

export function spawnSwordSlashParticles(
  x: number,
  y: number,
  z: number
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
    const speed = 3 + Math.random() * 4;
    particles.push({
      id: particleIdCounter++,
      x,
      y,
      z,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + 2,
      vz: (Math.random() - 0.5) * 3,
      life: 0.5 + Math.random() * 0.4,
      maxLife: 0.9,
      color: i % 2 === 0 ? '#00FFFF' : '#FFFFFF',
      size: 0.06 + Math.random() * 0.1,
    });
  }
  return particles;
}

export interface MeleeHitResult {
  hit: boolean;
  damage: number;
  newParticles: Particle[];
}

export function checkMeleeHit(
  attacker: Character,
  target: Character,
  attackType: 'punch' | 'kick'
): MeleeHitResult {
  const baseRange = attackType === 'kick' ? 1.2 : 0.9;
  const range = attacker.swordActive ? baseRange * SWORD_RANGE_MULTIPLIER : baseRange;
  const height = attackType === 'kick' ? 0.6 : 0.8;

  const hitboxX = attacker.x + attacker.facing * (range / 2);
  const hitboxY = attacker.y + 0.5;

  const targetW = 0.8;
  const targetH = 1.6;

  const hit = rectsOverlap(
    hitboxX, hitboxY, range, height,
    target.x, target.y + 0.8, targetW, targetH
  );

  if (!hit) {
    return { hit: false, damage: 0, newParticles: [] };
  }

  let baseDamage = attackType === 'kick' ? MELEE_DAMAGE_KICK : MELEE_DAMAGE_PUNCH;

  if (attacker.swordActive) {
    baseDamage = SWORD_DAMAGE_BASE * attacker.swordDamageMultiplier;
  }

  const damage = Math.round(baseDamage * attacker.swordDamageMultiplier);

  const particles = attacker.swordActive
    ? spawnSwordSlashParticles(target.x, target.y + 1, target.z)
    : spawnHitParticles(target.x, target.y + 1, target.z, 8, '#FF4400');

  return { hit: true, damage, newParticles: particles };
}

export function checkProjectileHitsEnemy(
  projectile: Projectile,
  enemy: Character
): boolean {
  return rectsOverlap(
    projectile.x, projectile.y, 0.3, 0.3,
    enemy.x, enemy.y + 0.8, 0.9, 1.6
  );
}

export function updateParticles(particles: Particle[], delta: number): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * delta,
      y: p.y + p.vy * delta,
      z: p.z + p.vz * delta,
      vy: p.vy - 5 * delta,
      life: p.life - delta,
    }))
    .filter(p => p.life > 0);
}

export function updateProjectiles(projectiles: Projectile[], delta: number): Projectile[] {
  return projectiles
    .map(p => ({
      ...p,
      x: p.x + p.vx * delta,
      y: p.y + p.vy * delta,
      z: p.z + p.vz * delta,
      life: p.life - delta,
    }))
    .filter(p => p.life > 0 && Math.abs(p.x) < 10);
}
