import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Character } from '../types/game';

// ─── Sword Slash Effect ───────────────────────────────────────────────────────
function SwordSlashEffect({ active, facing }: { active: boolean; facing: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (active) {
      timeRef.current += delta * 8;
      const t = Math.min(timeRef.current, 1);
      meshRef.current.visible = true;
      meshRef.current.scale.set(1 + t * 1.5, 1 + t * 0.5, 1);
      meshRef.current.rotation.z = facing * (t * Math.PI * 0.6 - Math.PI * 0.3);
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.9 - t * 0.8;
    } else {
      timeRef.current = 0;
      meshRef.current.visible = false;
    }
  });

  return (
    <mesh ref={meshRef} position={[facing * 0.8, 0.3, 0.05]} visible={false}>
      <planeGeometry args={[1.4, 0.12]} />
      <meshBasicMaterial
        color="#00FFFF"
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Sword Mesh ───────────────────────────────────────────────────────────────
function SwordMesh({ visible, facing }: { visible: boolean; facing: number }) {
  if (!visible) return null;
  return (
    <group position={[facing * 0.35, 0.1, 0.08]} rotation={[0, 0, facing * -0.4]}>
      {/* Blade */}
      <mesh position={[facing * 0.5, 0, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.04]} />
        <meshStandardMaterial
          color="#C0E8FF"
          emissive="#00AAFF"
          emissiveIntensity={1.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Blade tip */}
      <mesh position={[facing * 1.05, 0, 0]}>
        <coneGeometry args={[0.03, 0.15, 6]} />
        <meshStandardMaterial
          color="#E0F4FF"
          emissive="#00CCFF"
          emissiveIntensity={1.5}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
      {/* Guard */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.22, 0.06]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[facing * -0.18, 0, 0]}>
        <boxGeometry args={[0.32, 0.07, 0.07]} />
        <meshStandardMaterial color="#4A2800" roughness={0.8} />
      </mesh>
      {/* Blade glow */}
      <pointLight color="#00AAFF" intensity={1.5} distance={1.5} />
    </group>
  );
}

// ─── UG Character ─────────────────────────────────────────────────────────────
interface CharacterProps {
  character: Character;
  isPlayer?: boolean;
}

export function UGCharacter({ character }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;

    const isMoving = Math.abs(character.vx) > 0.1;
    const bobSpeed = isMoving ? 8 : 2;
    const bobAmp = isMoving ? 0.04 : 0.015;
    groupRef.current.position.y = character.y + Math.sin(timeRef.current * bobSpeed) * bobAmp;

    groupRef.current.position.x = character.x;
    groupRef.current.scale.x = character.facing;
  });

  const isHit = character.hitFlashTimer > 0;
  const isAttacking = character.isAttacking;
  const isSword = character.swordActive;

  const bodyColor = isHit ? '#FF6666' : '#1a3a6e';
  const armorColor = isHit ? '#FF8888' : '#2255aa';
  const emissiveColor = isHit ? '#FF2222' : '#0033aa';
  const emissiveInt = isHit ? 0.8 : 0.3;

  const armRotation = isAttacking ? -Math.PI * 0.6 : isSword ? -Math.PI * 0.3 : 0;

  return (
    <group ref={groupRef} position={[character.x, character.y, character.z]}>
      {/* Legs */}
      <mesh position={[-0.12, 0.3, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.18]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
      </mesh>
      <mesh position={[0.12, 0.3, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.18]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
      </mesh>
      {/* Knee pads */}
      <mesh position={[-0.12, 0.42, 0.1]}>
        <boxGeometry args={[0.2, 0.12, 0.06]} />
        <meshStandardMaterial color="#4488ff" emissive="#2244cc" emissiveIntensity={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0.12, 0.42, 0.1]}>
        <boxGeometry args={[0.2, 0.12, 0.06]} />
        <meshStandardMaterial color="#4488ff" emissive="#2244cc" emissiveIntensity={0.5} metalness={0.7} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.52, 0.55, 0.28]} />
        <meshStandardMaterial color={armorColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Chest core */}
      <mesh position={[0, 0.95, 0.15]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#88ccff" emissive="#0088ff" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 0.95, 0.25]} color="#0088ff" intensity={0.8} distance={1.5} />
      {/* Left arm */}
      <group position={[-0.35, 0.9, 0]} rotation={[armRotation, 0, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.18, 0.42, 0.18]} />
          <meshStandardMaterial color={armorColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} metalness={0.5} />
        </mesh>
        {/* Gauntlet */}
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[0.22, 0.18, 0.22]} />
          <meshStandardMaterial color="#4488ff" emissive="#2244cc" emissiveIntensity={0.6} metalness={0.8} />
        </mesh>
      </group>
      {/* Right arm (sword arm) */}
      <group position={[0.35, 0.9, 0]} rotation={[armRotation, 0, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.18, 0.42, 0.18]} />
          <meshStandardMaterial color={armorColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} metalness={0.5} />
        </mesh>
        {/* Gauntlet */}
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[0.22, 0.18, 0.22]} />
          <meshStandardMaterial color="#4488ff" emissive="#2244cc" emissiveIntensity={0.6} metalness={0.8} />
        </mesh>
        {/* Sword attached to right hand */}
        <group position={[0, -0.55, 0]}>
          <SwordMesh visible={isSword} facing={1} />
        </group>
      </group>
      {/* Neck */}
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[0.2, 0.12, 0.2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.48, 0]}>
        <boxGeometry args={[0.38, 0.38, 0.35]} />
        <meshStandardMaterial color={armorColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Helmet visor */}
      <mesh position={[0, 1.5, 0.18]}>
        <boxGeometry args={[0.3, 0.14, 0.06]} />
        <meshStandardMaterial color="#88ccff" emissive="#0066ff" emissiveIntensity={1.0} transparent opacity={0.85} />
      </mesh>
      {/* Helmet top fin */}
      <mesh position={[0, 1.72, 0]}>
        <boxGeometry args={[0.08, 0.14, 0.28]} />
        <meshStandardMaterial color="#3366cc" emissive="#1133aa" emissiveIntensity={0.4} metalness={0.8} />
      </mesh>
      {/* Sword slash effect */}
      <SwordSlashEffect active={isSword && isAttacking} facing={1} />
    </group>
  );
}

// ─── Sukuna Character ─────────────────────────────────────────────────────────
export function SukunaCharacter({ character }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;

    const isMoving = Math.abs(character.vx) > 0.1;
    const bobSpeed = isMoving ? 7 : 1.5;
    const bobAmp = isMoving ? 0.05 : 0.02;
    groupRef.current.position.y = character.y + Math.sin(timeRef.current * bobSpeed) * bobAmp;

    groupRef.current.position.x = character.x;
    groupRef.current.scale.x = character.facing;
  });

  const isHit = character.hitFlashTimer > 0;
  const isAttacking = character.isAttacking;

  const skinColor = isHit ? '#FF9999' : '#cc3333';
  const markColor = isHit ? '#FFAAAA' : '#ff6666';
  const emissiveColor = isHit ? '#FF3333' : '#aa0000';
  const emissiveInt = isHit ? 1.0 : 0.4;

  const armRotation = isAttacking ? -Math.PI * 0.7 : 0;

  return (
    <group ref={groupRef} position={[character.x, character.y, character.z]}>
      {/* Legs */}
      <mesh position={[-0.14, 0.32, 0]}>
        <boxGeometry args={[0.22, 0.6, 0.22]} />
        <meshStandardMaterial color={skinColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
      </mesh>
      <mesh position={[0.14, 0.32, 0]}>
        <boxGeometry args={[0.22, 0.6, 0.22]} />
        <meshStandardMaterial color={skinColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
      </mesh>
      {/* Tattoo marks on legs */}
      <mesh position={[-0.14, 0.38, 0.12]}>
        <boxGeometry args={[0.18, 0.06, 0.02]} />
        <meshStandardMaterial color={markColor} emissive={markColor} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.14, 0.38, 0.12]}>
        <boxGeometry args={[0.18, 0.06, 0.02]} />
        <meshStandardMaterial color={markColor} emissive={markColor} emissiveIntensity={0.8} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.58, 0.6, 0.3]} />
        <meshStandardMaterial color={skinColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
      </mesh>
      {/* Tattoo marks on torso */}
      <mesh position={[0, 1.0, 0.16]}>
        <boxGeometry args={[0.4, 0.08, 0.02]} />
        <meshStandardMaterial color={markColor} emissive={markColor} emissiveIntensity={1.0} />
      </mesh>
      <mesh position={[0, 0.85, 0.16]}>
        <boxGeometry args={[0.35, 0.06, 0.02]} />
        <meshStandardMaterial color={markColor} emissive={markColor} emissiveIntensity={1.0} />
      </mesh>
      {/* Shoulder spikes */}
      <mesh position={[-0.38, 1.18, 0]} rotation={[0, 0, Math.PI * 0.15]}>
        <coneGeometry args={[0.07, 0.28, 6]} />
        <meshStandardMaterial color="#880000" emissive="#cc0000" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.38, 1.18, 0]} rotation={[0, 0, -Math.PI * 0.15]}>
        <coneGeometry args={[0.07, 0.28, 6]} />
        <meshStandardMaterial color="#880000" emissive="#cc0000" emissiveIntensity={0.6} />
      </mesh>
      {/* Arms */}
      <group position={[-0.38, 0.95, 0]} rotation={[armRotation, 0, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.2, 0.46, 0.2]} />
          <meshStandardMaterial color={skinColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
        </mesh>
        {/* Claw */}
        <mesh position={[0, -0.5, 0.1]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.04, 0.18, 5]} />
          <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.8} />
        </mesh>
      </group>
      <group position={[0.38, 0.95, 0]} rotation={[armRotation, 0, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.2, 0.46, 0.2]} />
          <meshStandardMaterial color={skinColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
        </mesh>
        {/* Claw */}
        <mesh position={[0, -0.5, 0.1]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.04, 0.18, 5]} />
          <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.8} />
        </mesh>
      </group>
      {/* Neck */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[0.22, 0.14, 0.22]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.58, 0]}>
        <boxGeometry args={[0.44, 0.42, 0.38]} />
        <meshStandardMaterial color={skinColor} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
      </mesh>
      {/* 4 eyes */}
      <mesh position={[-0.12, 1.64, 0.2]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2.0} />
      </mesh>
      <mesh position={[0.12, 1.64, 0.2]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2.0} />
      </mesh>
      <mesh position={[-0.12, 1.52, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.12, 1.52, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={1.5} />
      </mesh>
      {/* Eye glow */}
      <pointLight position={[0, 1.6, 0.3]} color="#ff0000" intensity={1.0} distance={1.2} />
      {/* Horns */}
      <mesh position={[-0.15, 1.84, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.05, 0.22, 6]} />
        <meshStandardMaterial color="#660000" emissive="#aa0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.15, 1.84, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.05, 0.22, 6]} />
        <meshStandardMaterial color="#660000" emissive="#aa0000" emissiveIntensity={0.5} />
      </mesh>
      {/* Mouth mark */}
      <mesh position={[0, 1.5, 0.2]}>
        <boxGeometry args={[0.22, 0.04, 0.02]} />
        <meshStandardMaterial color={markColor} emissive={markColor} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}
