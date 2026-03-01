import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AttackType, FacingDirection } from '../types/game';

// Game units: x in [0..900], y in [0..~420 inverted], z=0
// We map to 3D world: worldX = (x - 450) / 60, worldY = -y/60 + 0.8, worldZ = z/60
export function gameToWorld(x: number, y: number, z: number): [number, number, number] {
  return [
    (x - 450) / 60,
    -y / 60 + 0.8,
    z / 60,
  ];
}

interface Character3DProps {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  facing: FacingDirection;
  attackType: AttackType;
  attackTimer: number;
  hitTimer: number;
  isEnemy: boolean;
  isOnGround: boolean;
}

const Character3D: React.FC<Character3DProps> = ({
  x, y, z, width, height, facing, attackType, attackTimer, hitTimer, isEnemy, isOnGround,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const armRef = useRef<THREE.Mesh>(null);
  const legLRef = useRef<THREE.Mesh>(null);
  const legRRef = useRef<THREE.Mesh>(null);

  const [wx, wy, wz] = gameToWorld(x + width / 2, y, z);

  // Character scale from game units
  const charW = width / 60;
  const charH = height / 60;

  const bodyColor = isEnemy ? '#cc2244' : '#1a44cc';
  const accentColor = isEnemy ? '#ff4466' : '#4488ff';
  const headColor = isEnemy ? '#ffccaa' : '#ffddbb';
  const legColor = isEnemy ? '#880022' : '#002288';
  const eyeColor = isEnemy ? '#ff0000' : '#ffffff';
  const attackColor = isEnemy ? '#ff2244' : '#4488ff';

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth position update
    const targetX = wx;
    const targetY = wy;
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * Math.min(1, delta * 20);
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * Math.min(1, delta * 20);
    groupRef.current.position.z = wz;

    // Facing direction
    const targetRotY = facing === FacingDirection.RIGHT ? 0 : Math.PI;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * Math.min(1, delta * 15);

    // Hit flash
    if (bodyRef.current) {
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
      if (hitTimer > 0) {
        mat.emissive.setHex(0xffffff);
        mat.emissiveIntensity = 0.8 * Math.abs(Math.sin(Date.now() * 0.02));
      } else {
        mat.emissive.setHex(isEnemy ? 0x330011 : 0x001133);
        mat.emissiveIntensity = 0.2;
      }
    }

    // Attack animation — extend arm/leg
    if (armRef.current) {
      if (attackTimer > 0 && attackType === AttackType.PUNCH) {
        armRef.current.position.x = 0.55 + Math.sin(attackTimer * 15) * 0.15;
        armRef.current.scale.x = 1.4;
      } else {
        armRef.current.position.x = 0.35;
        armRef.current.scale.x = 1.0;
      }
    }

    if (legRRef.current) {
      if (attackTimer > 0 && attackType === AttackType.KICK) {
        legRRef.current.rotation.x = -Math.PI / 3 * Math.sin(attackTimer * 12);
        legRRef.current.position.x = 0.3 + Math.sin(attackTimer * 12) * 0.2;
      } else {
        legRRef.current.rotation.x = 0;
        legRRef.current.position.x = 0.12;
      }
    }

    // Idle bob when on ground
    if (isOnGround && attackTimer <= 0) {
      const bob = Math.sin(Date.now() * 0.003) * 0.02;
      if (headRef.current) headRef.current.position.y = charH * 0.38 + bob;
    }
  });

  return (
    <group ref={groupRef} position={[wx, wy, wz]}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, charH * 0.1, 0]}>
        <boxGeometry args={[charW * 0.55, charH * 0.45, charW * 0.35]} />
        <meshStandardMaterial color={bodyColor} emissive={isEnemy ? '#330011' : '#001133'} emissiveIntensity={0.2} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, charH * 0.38, 0]}>
        <sphereGeometry args={[charW * 0.28, 12, 10]} />
        <meshStandardMaterial color={headColor} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.08, charH * 0.4, charW * 0.22]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={isEnemy ? 1.5 : 0.3} />
      </mesh>
      <mesh position={[-0.08, charH * 0.4, charW * 0.22]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={isEnemy ? 1.5 : 0.3} />
      </mesh>

      {/* Arm (attack arm) */}
      <mesh ref={armRef} position={[0.35, charH * 0.12, 0]}>
        <boxGeometry args={[0.35, 0.12, 0.12]} />
        <meshStandardMaterial color={accentColor} emissive={attackTimer > 0 ? attackColor : '#000000'} emissiveIntensity={attackTimer > 0 ? 1.2 : 0} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Other arm */}
      <mesh position={[-0.35, charH * 0.12, 0]}>
        <boxGeometry args={[0.35, 0.12, 0.12]} />
        <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Left leg */}
      <mesh ref={legLRef} position={[-0.12, charH * -0.22, 0]}>
        <boxGeometry args={[0.18, charH * 0.38, 0.18]} />
        <meshStandardMaterial color={legColor} roughness={0.5} />
      </mesh>

      {/* Right leg */}
      <mesh ref={legRRef} position={[0.12, charH * -0.22, 0]}>
        <boxGeometry args={[0.18, charH * 0.38, 0.18]} />
        <meshStandardMaterial color={legColor} roughness={0.5} />
      </mesh>

      {/* Enemy tattoo marks */}
      {isEnemy && (
        <>
          <mesh position={[0.05, charH * 0.42, charW * 0.24]}>
            <boxGeometry args={[0.02, 0.12, 0.01]} />
            <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={2} />
          </mesh>
          <mesh position={[-0.05, charH * 0.42, charW * 0.24]}>
            <boxGeometry args={[0.02, 0.12, 0.01]} />
            <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={2} />
          </mesh>
        </>
      )}

      {/* Attack glow aura */}
      {attackTimer > 0 && (
        <mesh position={[0, charH * 0.1, 0]}>
          <sphereGeometry args={[charW * 0.7, 8, 8]} />
          <meshStandardMaterial
            color={isEnemy ? '#ff2244' : '#4488ff'}
            emissive={isEnemy ? '#ff2244' : '#4488ff'}
            emissiveIntensity={0.6}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};

export default Character3D;
