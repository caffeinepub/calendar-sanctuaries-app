import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Character, Enemy, Particle, AttackType, FacingDirection } from '../types/game';
import Character3D from './Character3D';
import ParticleSystem3D from './ParticleSystem3D';

interface Scene3DProps {
  player: Character;
  enemy: Enemy;
  particles: Particle[];
  sukunaDefeated: number;
}

// Arena floor glow line
const FloorGlow: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.6 + Math.sin(Date.now() * 0.003) * 0.3;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16, 0.08]} />
      <meshBasicMaterial color="#9933ff" transparent opacity={0.8} />
    </mesh>
  );
};

// Animated background energy pillars
const EnergyPillar: React.FC<{ x: number; color: string; phase: number }> = ({ x, color, phase }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + Math.abs(Math.sin(Date.now() * 0.002 + phase)) * 0.12;
      meshRef.current.scale.y = 0.8 + Math.abs(Math.sin(Date.now() * 0.0015 + phase)) * 0.4;
    }
  });
  return (
    <mesh ref={meshRef} position={[x, 2, -2]}>
      <cylinderGeometry args={[0.08, 0.15, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} />
    </mesh>
  );
};

const CameraRig: React.FC<{ playerX: number; enemyX: number }> = ({ playerX, enemyX }) => {
  const { camera } = useThree();
  const targetRef = useRef({ x: 0, z: 18 });

  useFrame((_, delta) => {
    // Keep both characters in view by centering camera between them
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

const Scene3D: React.FC<Scene3DProps> = ({ player, enemy, particles, sukunaDefeated }) => {
  return (
    <>
      {/* Camera rig */}
      <CameraRig playerX={player.x} enemyX={enemy.x} />

      {/* Lighting */}
      <ambientLight intensity={0.4} color="#220033" />
      <directionalLight
        position={[5, 10, 8]}
        intensity={1.8}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[-6, 4, 3]} intensity={2.5} color="#4488ff" distance={12} />
      <pointLight position={[6, 4, 3]} intensity={2.5} color="#cc2244" distance={12} />
      <pointLight position={[0, 6, 2]} intensity={1.2} color="#9933ff" distance={15} />

      {/* Arena floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial
          color="#0d0020"
          roughness={0.3}
          metalness={0.6}
          emissive="#110022"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Floor grid lines */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={`grid-x-${i}`} position={[-7 + i * 1.75, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.015, 6]} />
          <meshBasicMaterial color="#330055" transparent opacity={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`grid-z-${i}`} position={[0, 0.005, -2.5 + i * 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 0.015]} />
          <meshBasicMaterial color="#330055" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Floor glow line */}
      <FloorGlow />

      {/* Stage edge markers */}
      <mesh position={[-7.5, 0.3, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.8]} />
        <meshStandardMaterial color="#9933ff" emissive="#9933ff" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[7.5, 0.3, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.8]} />
        <meshStandardMaterial color="#9933ff" emissive="#9933ff" emissiveIntensity={1.5} />
      </mesh>

      {/* Background wall */}
      <mesh position={[0, 3, -3.5]}>
        <planeGeometry args={[18, 10]} />
        <meshStandardMaterial color="#080015" roughness={1} emissive="#0a0020" emissiveIntensity={0.3} />
      </mesh>

      {/* Energy pillars */}
      <EnergyPillar x={-6} color="#4488ff" phase={0} />
      <EnergyPillar x={-3} color="#9933ff" phase={1.2} />
      <EnergyPillar x={0} color="#cc2244" phase={2.4} />
      <EnergyPillar x={3} color="#9933ff" phase={0.8} />
      <EnergyPillar x={6} color="#4488ff" phase={1.6} />

      {/* Characters */}
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
        isEnemy={false}
        isOnGround={player.isOnGround}
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
        isEnemy={true}
        isOnGround={enemy.isOnGround}
      />

      {/* Particles */}
      <ParticleSystem3D particles={particles} />

      {/* Fog */}
      <fog attach="fog" args={['#050010', 18, 35]} />
    </>
  );
};

export default Scene3D;
