import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameState } from '../types/game';
import { Character3D } from './Character3D';
import ParticleSystem3D from './ParticleSystem3D';

// ─── Muzzle Flash ─────────────────────────────────────────────────────────────
function MuzzleFlash({ time, currentTime }: { time: number; currentTime: number }) {
  const age = currentTime - time;
  if (age > 0.12 || age < 0) return null;
  const t = 1 - age / 0.12;
  return (
    <group position={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.18 * t, 8, 8]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={t * 0.9} />
      </mesh>
      <pointLight color="#FFD700" intensity={3 * t} distance={2} />
    </group>
  );
}

// ─── Explosion Mesh ───────────────────────────────────────────────────────────
function ExplosionMesh({ x, y, z, time, currentTime }: { x: number; y: number; z: number; time: number; currentTime: number }) {
  const age = currentTime - time;
  if (age > 0.6 || age < 0) return null;
  const t = age / 0.6;
  const scale = 0.3 + t * 1.8;
  const opacity = 1 - t;
  return (
    <group position={[x, y, z]}>
      <mesh scale={[scale, scale * 0.4, scale]}>
        <torusGeometry args={[0.5, 0.15, 8, 16]} />
        <meshBasicMaterial color="#FF6600" transparent opacity={opacity * 0.8} />
      </mesh>
      <mesh scale={[scale * 0.6, scale * 0.6, scale * 0.6]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial color="#FFAA00" transparent opacity={opacity * 0.6} />
      </mesh>
      <pointLight color="#FF6600" intensity={4 * opacity} distance={3} />
    </group>
  );
}

// ─── Cursed Energy Aura ───────────────────────────────────────────────────────
function CursedEnergyAura({ x, y, color = '#FF2200', color2 = '#FF4400' }: { x: number; y: number; color?: string; color2?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 2;
    }
  });
  return (
    <group ref={groupRef} position={[x, y + 0.9, 0]}>
      <mesh>
        <torusGeometry args={[0.55, 0.03, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.65, 0.02, 8, 32]} />
        <meshBasicMaterial color={color2} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// ─── Shockwave Effect ─────────────────────────────────────────────────────────
function ShockwaveEffect({ time, currentTime, x }: { time: number; currentTime: number; x: number }) {
  const age = currentTime - time;
  if (age > 0.5 || age < 0) return null;
  const t = age / 0.5;
  const scale = t * 2.5;
  const opacity = 1 - t;
  return (
    <mesh position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[scale, scale, 1]}>
      <ringGeometry args={[0.3, 0.5, 32]} />
      <meshBasicMaterial color="#4488FF" transparent opacity={opacity * 0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Projectile Mesh ──────────────────────────────────────────────────────────
function ProjectileMesh({ x, y, z, vx }: { x: number; y: number; z: number; vx: number }) {
  const dir = vx > 0 ? 1 : -1;
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      <mesh position={[-dir * 0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.04, 0.25, 8]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.7} />
      </mesh>
      <pointLight color="#FFD700" intensity={1.5} distance={1} />
    </group>
  );
}

// ─── Arena Floor ──────────────────────────────────────────────────────────────
function ArenaFloor() {
  return (
    <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#1a0a2e" roughness={0.8} metalness={0.2} />
      </mesh>
      {[-4, -2, 0, 2, 4].map(x => (
        <mesh key={x} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, 6]} />
          <meshBasicMaterial color="#2a1a4e" transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

// ─── Arena Walls ──────────────────────────────────────────────────────────────
function ArenaWalls() {
  return (
    <>
      <mesh position={[0, 2, -2.5]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#0d0520" roughness={1} />
      </mesh>
      <mesh position={[-5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshBasicMaterial color="#110033" transparent opacity={0.8} />
      </mesh>
      <mesh position={[5, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshBasicMaterial color="#110033" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

// ─── Aura color by character type ─────────────────────────────────────────────
function getAuraColors(characterType: string): [string, string] {
  switch (characterType) {
    case 'gojo': return ['#00ccff', '#0088ff'];
    case 'toji': return ['#00cc44', '#cc2200'];
    case 'sukuna': return ['#FF2200', '#FF4400'];
    default: return ['#FF2200', '#FF4400'];
  }
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
interface Scene3DProps {
  gameState: GameState;
}

export default function Scene3D({ gameState }: Scene3DProps) {
  const { player, enemies, particles, projectiles, explosionEvents } = gameState;
  const enemy = enemies[0];
  const now = gameState.timeElapsed;

  const [auraColor1, auraColor2] = enemy ? getAuraColors(enemy.characterType) : ['#FF2200', '#FF4400'];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#2233aa" />
      <directionalLight position={[3, 6, 4]} intensity={1.2} color="#ffffff" castShadow />
      <pointLight position={[-3, 3, 2]} color="#4400aa" intensity={1.5} distance={8} />
      <pointLight position={[3, 3, 2]} color="#aa0022" intensity={1.5} distance={8} />
      <pointLight position={[0, 5, 0]} color="#ffffff" intensity={0.5} distance={10} />

      {/* Arena */}
      <ArenaFloor />
      <ArenaWalls />

      {/* Characters */}
      <Character3D character={player} isPlayer />
      {enemy && <Character3D character={enemy} />}

      {/* Cursed energy aura on enemy */}
      {enemy && enemy.health > 0 && (
        <CursedEnergyAura x={enemy.x} y={enemy.y} color={auraColor1} color2={auraColor2} />
      )}

      {/* Projectiles */}
      {projectiles.map(proj => (
        <ProjectileMesh key={proj.id} x={proj.x} y={proj.y} z={proj.z} vx={proj.vx} />
      ))}

      {/* Muzzle flash */}
      <group position={[player.x + player.facing * 0.5, player.y + 1.0, 0]}>
        <MuzzleFlash time={gameState.muzzleFlashTime} currentTime={now} />
      </group>

      {/* Explosions */}
      {explosionEvents.map(ev => (
        <ExplosionMesh key={ev.id} x={ev.x} y={ev.y} z={ev.z} time={ev.time} currentTime={now} />
      ))}

      {/* Shockwaves */}
      <ShockwaveEffect time={gameState.playerLandedTime} currentTime={now} x={player.x} />
      {enemy && (
        <ShockwaveEffect time={gameState.enemyLandedTime} currentTime={now} x={enemy.x} />
      )}

      {/* Particles */}
      <ParticleSystem3D particles={particles} />
    </>
  );
}
