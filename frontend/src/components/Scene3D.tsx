import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Character, Enemy, Particle, Projectile, ExplosionEvent } from '../types/game';
import Character3D from './Character3D';
import ParticleSystem3D from './ParticleSystem3D';

interface Scene3DProps {
  player: Character;
  enemy: Enemy;
  particles: Particle[];
  projectiles: Projectile[];
  sukunaDefeated: number;
  muzzleFlashTime: number;
  playerLandedTime: number;
  enemyLandedTime: number;
  explosionEvents: ExplosionEvent[];
}

function gameXToWorld(x: number): number {
  return (x - 450) / 60;
}

function gameYToWorld(y: number): number {
  return -y / 60 + 0.8;
}

// Pulsing floor glow line
const FloorGlow: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16, 0.1]} />
      <meshBasicMaterial color="#9933ff" transparent opacity={0.7} />
    </mesh>
  );
};

// Animated background energy pillars
const EnergyPillar: React.FC<{ x: number; color: string; phase: number }> = ({ x, color, phase }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.abs(Math.sin(Date.now() * 0.002 + phase)) * 0.1;
      meshRef.current.scale.y = 0.8 + Math.abs(Math.sin(Date.now() * 0.0015 + phase)) * 0.4;
    }
  });
  return (
    <mesh ref={meshRef} position={[x, 2, -2.5]}>
      <cylinderGeometry args={[0.07, 0.14, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
  );
};

// Ruined stone pillar for background scenery
const RuinedPillar: React.FC<{ x: number; z: number; height: number; tilt: number }> = ({ x, z, height, tilt }) => {
  return (
    <group position={[x, 0, z]} rotation={[0, 0, tilt]}>
      {/* Main pillar shaft */}
      <mesh position={[0, height * 0.4, 0]}>
        <cylinderGeometry args={[0.22, 0.28, height * 0.8, 8]} />
        <meshStandardMaterial color="#1a0a2e" roughness={0.9} metalness={0.1} emissive="#0a0518" emissiveIntensity={0.3} />
      </mesh>
      {/* Pillar base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.7, 0.2, 0.7]} />
        <meshStandardMaterial color="#150820" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Broken top */}
      <mesh position={[0.08, height * 0.82, 0.05]} rotation={[0.3, 0.2, 0.4]}>
        <boxGeometry args={[0.35, 0.18, 0.35]} />
        <meshStandardMaterial color="#1a0a2e" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Cursed energy crack glow */}
      <mesh position={[0.01, height * 0.45, 0.23]}>
        <boxGeometry args={[0.02, height * 0.35, 0.01]} />
        <meshStandardMaterial color="#9933ff" emissive="#9933ff" emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// Ruined wall fragment
const RuinedWall: React.FC<{ x: number; z: number; width: number; height: number; rotation: number }> = ({ x, z, width, height, rotation }) => {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {/* Main wall slab */}
      <mesh position={[0, height * 0.5, 0]}>
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial color="#120820" roughness={0.95} metalness={0.05} emissive="#0a0515" emissiveIntensity={0.2} />
      </mesh>
      {/* Broken chunk */}
      <mesh position={[width * 0.35, height * 0.85, 0.1]} rotation={[0.2, 0, 0.5]}>
        <boxGeometry args={[width * 0.3, height * 0.25, 0.28]} />
        <meshStandardMaterial color="#0e0618" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Glowing rune on wall */}
      <mesh position={[0, height * 0.5, 0.16]}>
        <boxGeometry args={[0.04, height * 0.4, 0.01]} />
        <meshStandardMaterial color="#cc2244" emissive="#cc0033" emissiveIntensity={1.5} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, height * 0.5, 0.16]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.04, width * 0.5, 0.01]} />
        <meshStandardMaterial color="#cc2244" emissive="#cc0033" emissiveIntensity={1.5} transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

// Floating cursed energy orb decoration
const CursedOrb: React.FC<{ x: number; y: number; z: number; color: string; phase: number }> = ({ x, y, z, color, phase }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = y + Math.sin(Date.now() * 0.001 + phase) * 0.15;
      groupRef.current.rotation.y += 0.01;
    }
  });
  return (
    <group ref={groupRef} position={[x, y, z]}>
      <mesh>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} roughness={0} metalness={0.3} transparent opacity={0.9} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      <pointLight color={color} intensity={0.8} distance={2.5} />
    </group>
  );
};

// Dynamic pulsing point light for each side
const PulsingLight: React.FC<{ position: [number, number, number]; color: string; baseIntensity: number; phase: number }> = ({
  position, color, baseIntensity, phase,
}) => {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (lightRef.current) {
      const t = Date.now() * 0.002;
      const flicker = Math.sin(t + phase) * 0.3 + Math.sin(t * 2.3 + phase * 1.7) * 0.15;
      lightRef.current.intensity = baseIntensity + flicker;
    }
  });
  return <pointLight ref={lightRef} position={position} color={color} intensity={baseIntensity} distance={14} />;
};

// Rim/back light for each character
const RimLight: React.FC<{ x: number; color: string; isEnemy: boolean }> = ({ x, color, isEnemy }) => {
  const lightRef = useRef<THREE.SpotLight>(null);
  useFrame(() => {
    if (lightRef.current) {
      const t = Date.now() * 0.0015;
      lightRef.current.intensity = 1.2 + Math.sin(t + (isEnemy ? 1.5 : 0)) * 0.3;
    }
  });
  return (
    <spotLight
      ref={lightRef}
      position={[x, 5, -3]}
      target-position={[x, 1, 0]}
      color={color}
      intensity={1.5}
      angle={0.5}
      penumbra={0.6}
      distance={12}
    />
  );
};

const CameraRig: React.FC<{ playerX: number; enemyX: number }> = ({ playerX, enemyX }) => {
  const { camera } = useThree();
  const targetRef = useRef({ x: 0, z: 18 });

  useFrame((_, delta) => {
    const midX = ((playerX - 450) / 60 + (enemyX - 450) / 60) / 2;
    const spread = Math.abs(playerX - enemyX) / 60;
    const targetZ = Math.max(14, Math.min(22, 14 + spread * 0.5));

    targetRef.current.x += (midX - targetRef.current.x) * Math.min(1, delta * 3);
    targetRef.current.z += (targetZ - targetRef.current.z) * Math.min(1, delta * 3);

    camera.position.x += (targetRef.current.x - camera.position.x) * Math.min(1, delta * 5);
    camera.position.y = 4;
    camera.position.z += (targetRef.current.z - camera.position.z) * Math.min(1, delta * 5);
    camera.lookAt(targetRef.current.x, 1.5, 0);
  });

  return null;
};

// ============================================================
// MUZZLE FLASH — bright burst at gun muzzle when shooting
// ============================================================
const MuzzleFlash: React.FC<{ playerX: number; playerY: number; facing: number; flashTime: number }> = ({
  playerX, playerY, facing, flashTime,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const age = performance.now() - flashTime;
    const duration = 120; // ms
    const t = Math.max(0, 1 - age / duration);

    if (!groupRef.current) return;

    if (t <= 0) {
      groupRef.current.visible = false;
      return;
    }

    groupRef.current.visible = true;

    const wx = gameXToWorld(playerX) + facing * 0.9;
    const wy = gameYToWorld(playerY) + 1.1;
    groupRef.current.position.set(wx, wy, 0.1);

    const scale = t * (1 + Math.sin(age * 0.08) * 0.3);
    groupRef.current.scale.setScalar(scale);

    if (innerRef.current) {
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity = t * 0.95;
    }
    if (outerRef.current) {
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity = t * 0.5;
    }
    if (lightRef.current) {
      lightRef.current.intensity = t * 8;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer glow burst */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.55, 8, 8]} />
        <meshBasicMaterial color="#ffee88" transparent opacity={0.5} depthWrite={false} />
      </mesh>
      {/* Mid ring */}
      <mesh>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.7} depthWrite={false} />
      </mesh>
      {/* Bright core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} depthWrite={false} />
      </mesh>
      {/* Cross flare arms */}
      <mesh rotation={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.06]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[1.2, 0.06, 0.06]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.9, 0.04, 0.04]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.9, 0.04, 0.04]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      {/* Point light burst */}
      <pointLight ref={lightRef} color="#ffcc44" intensity={8} distance={5} />
    </group>
  );
};

// ============================================================
// EXPLOSION EFFECT — fiery burst on projectile hit
// ============================================================
const ExplosionMesh: React.FC<{ event: ExplosionEvent }> = ({ event }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const wx = gameXToWorld(event.x);
  const wy = gameYToWorld(event.y);

  useFrame(() => {
    const age = performance.now() - event.startTime;
    const duration = 420;
    const t = Math.max(0, 1 - age / duration); // 1 → 0

    if (!groupRef.current) return;

    if (t <= 0) {
      groupRef.current.visible = false;
      return;
    }

    groupRef.current.visible = true;

    // Expand outward
    const expandScale = 1 - t; // 0 → 1 as explosion grows
    const coreScale = t * 1.5;

    if (ring1Ref.current) {
      ring1Ref.current.scale.setScalar(0.3 + expandScale * 2.5);
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = t * 0.7;
    }
    if (ring2Ref.current) {
      ring2Ref.current.scale.setScalar(0.2 + expandScale * 1.8);
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = t * 0.5;
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(coreScale);
      (coreRef.current.material as THREE.MeshBasicMaterial).opacity = t * 0.9;
    }
    if (lightRef.current) {
      lightRef.current.intensity = t * 6;
      // Shift from white-hot to orange as it cools
      const r = 1;
      const g = 0.3 + t * 0.5;
      const b = t * 0.1;
      lightRef.current.color.setRGB(r, g, b);
    }
  });

  return (
    <group ref={groupRef} position={[wx, wy, 0]}>
      {/* Outer shockwave ring */}
      <mesh ref={ring1Ref} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 16]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Mid fire ring */}
      <mesh ref={ring2Ref} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.2, 0.38, 16]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Core fireball */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.4, 10, 10]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      {/* Inner white-hot core */}
      <mesh>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} depthWrite={false} />
      </mesh>
      {/* Cursed energy tendrils */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((deg * Math.PI) / 180) * 0.5,
            Math.sin((deg * Math.PI) / 180) * 0.5,
            0,
          ]}
          rotation={[0, 0, (deg * Math.PI) / 180]}
        >
          <boxGeometry args={[0.35, 0.04, 0.04]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#ff4400' : '#cc0066'} transparent opacity={0.6} depthWrite={false} />
        </mesh>
      ))}
      {/* Dynamic light */}
      <pointLight ref={lightRef} color="#ff6600" intensity={6} distance={6} />
    </group>
  );
};

// ============================================================
// CURSED ENERGY AURA — pulsing crimson aura around Sukuna
// ============================================================
const CursedEnergyAura: React.FC<{ enemyX: number; enemyY: number }> = ({ enemyX, enemyY }) => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = Date.now() * 0.001;
    const pulse = 0.95 + Math.sin(t * 2.1) * 0.08;
    const pulse2 = 0.9 + Math.sin(t * 1.4 + 1.2) * 0.12;

    const wx = gameXToWorld(enemyX + 32); // center of enemy
    const wy = gameYToWorld(enemyY) + 0.8;

    if (outerRef.current) {
      outerRef.current.position.set(wx, wy, 0);
      outerRef.current.scale.setScalar(pulse);
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.abs(Math.sin(t * 1.8)) * 0.06;
    }
    if (innerRef.current) {
      innerRef.current.position.set(wx, wy, 0);
      innerRef.current.scale.setScalar(pulse2);
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.12 + Math.abs(Math.sin(t * 2.5 + 0.5)) * 0.08;
    }
    if (ringsRef.current) {
      ringsRef.current.position.set(wx, wy, 0);
      ringsRef.current.rotation.z = t * 0.4;
      ringsRef.current.rotation.y = t * 0.25;
    }
  });

  return (
    <>
      {/* Outer aura sphere */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[1.4, 12, 12]} />
        <meshBasicMaterial color="#880022" transparent opacity={0.08} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Inner aura sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.1, 10, 10]} />
        <meshBasicMaterial color="#cc0044" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Rotating cursed energy rings */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.0, 0.025, 6, 24]} />
          <meshBasicMaterial color="#cc0044" transparent opacity={0.35} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[0.85, 0.018, 6, 20]} />
          <meshBasicMaterial color="#880033" transparent opacity={0.3} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 6, -Math.PI / 3, 0]}>
          <torusGeometry args={[1.15, 0.015, 6, 20]} />
          <meshBasicMaterial color="#ff0055" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
};

// ============================================================
// SHOCKWAVE EFFECT — expanding disc on character landing
// ============================================================
const ShockwaveEffect: React.FC<{ landedTime: number; landX: number; color: string }> = ({
  landedTime, landX, color,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const age = performance.now() - landedTime;
    const duration = 350;
    const t = Math.max(0, 1 - age / duration); // 1 → 0

    if (!meshRef.current || !ringRef.current) return;

    if (t <= 0 || landedTime === 0) {
      meshRef.current.visible = false;
      ringRef.current.visible = false;
      return;
    }

    meshRef.current.visible = true;
    ringRef.current.visible = true;

    const wx = gameXToWorld(landX + 32);
    const expandScale = (1 - t) * 3.5 + 0.1;

    meshRef.current.position.set(wx, 0.015, 0);
    meshRef.current.scale.set(expandScale, 1, expandScale);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = t * 0.45;

    ringRef.current.position.set(wx, 0.02, 0);
    ringRef.current.scale.set(expandScale * 1.1, 1, expandScale * 1.1);
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity = t * 0.6;
  });

  return (
    <>
      {/* Shockwave disc fill */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {/* Shockwave ring edge */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 1.0, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} />
      </mesh>
    </>
  );
};

// ============================================================
// ENHANCED PROJECTILE MESH with trail
// ============================================================
const ProjectileMesh: React.FC<{ projectile: Projectile }> = ({ projectile }) => {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const trail1Ref = useRef<THREE.Mesh>(null);
  const trail2Ref = useRef<THREE.Mesh>(null);
  const trail3Ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (coreRef.current) {
      coreRef.current.rotation.z += 0.18;
      coreRef.current.rotation.x += 0.1;
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.abs(Math.sin(Date.now() * 0.012)) * 0.25;
      const pulse = 1 + Math.sin(Date.now() * 0.015) * 0.15;
      glowRef.current.scale.setScalar(pulse);
    }
    // Animate trail segments with staggered flicker
    if (trail1Ref.current) {
      (trail1Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.55 + Math.sin(Date.now() * 0.02) * 0.15;
    }
    if (trail2Ref.current) {
      (trail2Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 + Math.sin(Date.now() * 0.018 + 1) * 0.1;
    }
    if (trail3Ref.current) {
      (trail3Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.18 + Math.sin(Date.now() * 0.015 + 2) * 0.08;
    }
  });

  const worldX = gameXToWorld(projectile.x);
  const worldY = gameYToWorld(projectile.y);
  const trailDir = projectile.vx > 0 ? -1 : 1;

  return (
    <group position={[worldX, worldY, 0]}>
      {/* === TRAIL SEGMENTS (electric gold/cyan) === */}
      {/* Trail segment 1 — closest, brightest */}
      <mesh ref={trail1Ref} position={[trailDir * 0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.2, 0.7, 8]} />
        <meshBasicMaterial color="#ffee00" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {/* Trail segment 2 — mid */}
      <mesh ref={trail2Ref} position={[trailDir * 0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.14, 0.65, 8]} />
        <meshBasicMaterial color="#00eeff" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Trail segment 3 — farthest, faintest */}
      <mesh ref={trail3Ref} position={[trailDir * 1.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.08, 0.55, 6]} />
        <meshBasicMaterial color="#44aaff" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {/* Thin electric spark line */}
      <mesh position={[trailDir * 0.6, 0, 0]}>
        <boxGeometry args={[1.2, 0.025, 0.025]} />
        <meshBasicMaterial color="#00ffee" transparent opacity={0.4} depthWrite={false} />
      </mesh>

      {/* === PROJECTILE CORE === */}
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.38, 10, 10]} />
        <meshBasicMaterial color="#ffee00" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* Mid glow ring */}
      <mesh>
        <sphereGeometry args={[0.26, 10, 10]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Core orb */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffcc00"
          emissiveIntensity={4}
          roughness={0}
          metalness={0.3}
        />
      </mesh>
      {/* Inner spark */}
      <mesh>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} roughness={0} metalness={0} />
      </mesh>
      {/* Local point light halo */}
      <pointLight color="#ffcc00" intensity={2.5} distance={4} />
    </group>
  );
};

// ============================================================
// MAIN SCENE
// ============================================================
const Scene3D: React.FC<Scene3DProps> = ({
  player,
  enemy,
  particles,
  projectiles,
  sukunaDefeated,
  muzzleFlashTime,
  playerLandedTime,
  enemyLandedTime,
  explosionEvents,
}) => {
  return (
    <>
      {/* Fog for atmospheric depth */}
      <fog attach="fog" args={['#050010', 18, 45]} />

      {/* Camera rig */}
      <CameraRig playerX={player.x} enemyX={enemy.x} />

      {/* === LIGHTING === */}
      <ambientLight intensity={0.35} color="#1a0030" />

      <directionalLight
        position={[3, 12, 8]}
        intensity={1.6}
        color="#e8d0ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* UG side — cool blue/white pulsing light */}
      <PulsingLight position={[-5.5, 3.5, 2]} color="#4488ff" baseIntensity={2.8} phase={0} />
      {/* Sukuna side — deep red/orange pulsing light */}
      <PulsingLight position={[5.5, 3.5, 2]} color="#cc2244" baseIntensity={2.8} phase={1.5} />

      {/* Center cursed energy overhead */}
      <PulsingLight position={[0, 6, 1]} color="#9933ff" baseIntensity={1.4} phase={0.8} />

      {/* Rim/back lights for character silhouettes */}
      <RimLight x={-4} color="#2266ff" isEnemy={false} />
      <RimLight x={4} color="#ff2244" isEnemy={true} />

      {/* === ARENA FLOOR === */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 7]} />
        <meshStandardMaterial
          color="#0a0018"
          roughness={0.25}
          metalness={0.75}
          emissive="#0d0025"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Floor hex pattern tiles */}
      {Array.from({ length: 7 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <mesh
            key={`hex-${row}-${col}`}
            position={[-6 + row * 2, 0.002, -2 + col * 1]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[1.8, 0.9]} />
            <meshBasicMaterial
              color={(row + col) % 2 === 0 ? '#1a0035' : '#0d0020'}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))
      )}

      {/* Floor grid lines */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={`grid-x-${i}`} position={[-7 + i * 1.75, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.012, 7]} />
          <meshBasicMaterial color="#330055" transparent opacity={0.45} />
        </mesh>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`grid-z-${i}`} position={[0, 0.006, -3 + i * 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 0.012]} />
          <meshBasicMaterial color="#330055" transparent opacity={0.45} />
        </mesh>
      ))}

      {/* Floor center glow circle */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshBasicMaterial color="#9933ff" transparent opacity={0.06} />
      </mesh>
      <mesh position={[0, 0.009, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.7, 1.85, 32]} />
        <meshBasicMaterial color="#9933ff" transparent opacity={0.25} />
      </mesh>

      {/* Floor glow line */}
      <FloorGlow />

      {/* Floor edge trim */}
      <mesh position={[0, 0.01, -3.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 0.06]} />
        <meshBasicMaterial color="#4422aa" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.01, 3.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 0.06]} />
        <meshBasicMaterial color="#4422aa" transparent opacity={0.7} />
      </mesh>

      {/* Stage edge markers */}
      <mesh position={[-7.5, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.9]} />
        <meshStandardMaterial color="#9933ff" emissive="#9933ff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[7.5, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.9]} />
        <meshStandardMaterial color="#9933ff" emissive="#9933ff" emissiveIntensity={2} />
      </mesh>

      {/* === BACKGROUND SCENERY === */}
      <mesh position={[0, 3.5, -4]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#060012" roughness={1} emissive="#080018" emissiveIntensity={0.4} />
      </mesh>

      {[-6, -2, 2, 6].map((bx, i) => (
        <mesh key={`wall-panel-${i}`} position={[bx, 3, -3.85]}>
          <boxGeometry args={[2.8, 6, 0.05]} />
          <meshStandardMaterial color="#0a0020" roughness={0.9} emissive="#0d0025" emissiveIntensity={0.3} />
        </mesh>
      ))}

      <RuinedPillar x={-6.5} z={-3} height={4.5} tilt={0.04} />
      <RuinedPillar x={-4.5} z={-3.2} height={3.2} tilt={-0.06} />
      <RuinedPillar x={6.5} z={-3} height={4.8} tilt={-0.03} />
      <RuinedPillar x={4.5} z={-3.2} height={3.5} tilt={0.05} />

      <RuinedWall x={-8} z={-2.5} width={2.5} height={3.5} rotation={0.15} />
      <RuinedWall x={8} z={-2.5} width={2.2} height={3.0} rotation={-0.12} />

      {/* Floating cursed energy orbs */}
      <CursedOrb x={-5} y={3.5} z={-2.5} color="#4488ff" phase={0} />
      <CursedOrb x={5} y={3.5} z={-2.5} color="#cc2244" phase={1.5} />
      <CursedOrb x={-2.5} y={4.5} z={-3} color="#9933ff" phase={0.8} />
      <CursedOrb x={2.5} y={4.5} z={-3} color="#ff6600" phase={2.2} />
      <CursedOrb x={0} y={5.5} z={-3.5} color="#cc44ff" phase={1.1} />

      {/* Energy pillars */}
      <EnergyPillar x={-6} color="#4488ff" phase={0} />
      <EnergyPillar x={-3} color="#9933ff" phase={1.2} />
      <EnergyPillar x={0} color="#cc2244" phase={2.4} />
      <EnergyPillar x={3} color="#9933ff" phase={0.8} />
      <EnergyPillar x={6} color="#4488ff" phase={1.6} />

      {/* Ceiling arch */}
      <mesh position={[0, 7, -2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[7, 0.15, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#1a0035" emissive="#330066" emissiveIntensity={0.8} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* === CHARACTERS === */}
      <Character3D
        x={player.x}
        y={player.y}
        z={player.z}
        width={player.width}
        height={player.height}
        facing={player.facing}
        attackType={player.attackType}
        attackTimer={player.attackTimer}
        hitTimer={player.hitTimer}
        isOnGround={player.isOnGround}
        isEnemy={false}
      />
      <Character3D
        x={enemy.x}
        y={enemy.y}
        z={enemy.z}
        width={enemy.width}
        height={enemy.height}
        facing={enemy.facing}
        attackType={enemy.attackType}
        attackTimer={enemy.attackTimer}
        hitTimer={enemy.hitTimer}
        isOnGround={enemy.isOnGround}
        isEnemy={true}
      />

      {/* === CURSED ENERGY AURA (Sukuna) === */}
      <CursedEnergyAura enemyX={enemy.x} enemyY={enemy.y} />

      {/* === MUZZLE FLASH === */}
      <MuzzleFlash
        playerX={player.x}
        playerY={player.y}
        facing={player.facing}
        flashTime={muzzleFlashTime}
      />

      {/* === EXPLOSION EFFECTS === */}
      {explosionEvents.map((event) => (
        <ExplosionMesh key={event.id} event={event} />
      ))}

      {/* === SHOCKWAVE EFFECTS === */}
      <ShockwaveEffect
        landedTime={playerLandedTime}
        landX={player.x}
        color="#4488ff"
      />
      <ShockwaveEffect
        landedTime={enemyLandedTime}
        landX={enemy.x}
        color="#cc2244"
      />

      {/* === PROJECTILES === */}
      {projectiles.map((proj) =>
        proj.active ? <ProjectileMesh key={proj.id} projectile={proj} /> : null
      )}

      {/* === PARTICLES === */}
      <ParticleSystem3D particles={particles} />
    </>
  );
};

export default Scene3D;
