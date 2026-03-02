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

// UG (player) — cool blue/white cursed energy warrior
const UGCharacter: React.FC<{
  charW: number;
  charH: number;
  attackType: AttackType;
  attackTimer: number;
  hitTimer: number;
  isOnGround: boolean;
  bodyRef: React.RefObject<THREE.Mesh | null>;
  headRef: React.RefObject<THREE.Mesh | null>;
  armRef: React.RefObject<THREE.Mesh | null>;
  legRRef: React.RefObject<THREE.Mesh | null>;
}> = ({ charW, charH, attackType, attackTimer, hitTimer, isOnGround, bodyRef, headRef, armRef, legRRef }) => {
  return (
    <>
      {/* Torso — armored chest plate */}
      <mesh ref={bodyRef} position={[0, charH * 0.08, 0]}>
        <boxGeometry args={[charW * 0.58, charH * 0.42, charW * 0.38]} />
        <meshStandardMaterial color="#0d2a6e" emissive="#001133" emissiveIntensity={0.3} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Chest armor plate */}
      <mesh position={[0, charH * 0.12, charW * 0.2]}>
        <boxGeometry args={[charW * 0.44, charH * 0.28, 0.04]} />
        <meshStandardMaterial color="#1a4aaa" emissive="#2255cc" emissiveIntensity={0.5} roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Chest energy core */}
      <mesh position={[0, charH * 0.14, charW * 0.22]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#88ccff" emissive="#44aaff" emissiveIntensity={2.5} roughness={0} metalness={0.2} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, charH * 0.38, 0]}>
        <boxGeometry args={[charW * 0.42, charH * 0.32, charW * 0.38]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Helmet visor */}
      <mesh position={[0, charH * 0.4, charW * 0.2]}>
        <boxGeometry args={[charW * 0.36, charH * 0.14, 0.04]} />
        <meshStandardMaterial color="#44aaff" emissive="#2288ff" emissiveIntensity={1.8} roughness={0} metalness={0.5} transparent opacity={0.85} />
      </mesh>
      {/* Helmet top ridge */}
      <mesh position={[0, charH * 0.52, 0]}>
        <boxGeometry args={[charW * 0.12, charH * 0.08, charW * 0.36]} />
        <meshStandardMaterial color="#2255aa" emissive="#1144cc" emissiveIntensity={0.8} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Shoulder pads */}
      <mesh position={[charW * 0.38, charH * 0.22, 0]}>
        <boxGeometry args={[0.14, 0.14, charW * 0.44]} />
        <meshStandardMaterial color="#1a3a88" emissive="#112266" emissiveIntensity={0.4} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[-charW * 0.38, charH * 0.22, 0]}>
        <boxGeometry args={[0.14, 0.14, charW * 0.44]} />
        <meshStandardMaterial color="#1a3a88" emissive="#112266" emissiveIntensity={0.4} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Attack arm (right) */}
      <mesh ref={armRef} position={[0.36, charH * 0.1, 0]}>
        <boxGeometry args={[0.32, 0.14, 0.14]} />
        <meshStandardMaterial
          color="#1a3a88"
          emissive={attackTimer > 0 ? '#2266ff' : '#001133'}
          emissiveIntensity={attackTimer > 0 ? 2.0 : 0.2}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {/* Arm gauntlet */}
      <mesh position={[0.52, charH * 0.1, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.18]} />
        <meshStandardMaterial color="#2255aa" emissive={attackTimer > 0 ? '#44aaff' : '#112244'} emissiveIntensity={attackTimer > 0 ? 2.5 : 0.3} roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Other arm (left) */}
      <mesh position={[-0.36, charH * 0.1, 0]}>
        <boxGeometry args={[0.32, 0.14, 0.14]} />
        <meshStandardMaterial color="#1a3a88" emissive="#001133" emissiveIntensity={0.2} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[-0.52, charH * 0.1, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.18]} />
        <meshStandardMaterial color="#2255aa" emissive="#112244" emissiveIntensity={0.3} roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Belt */}
      <mesh position={[0, charH * -0.08, 0]}>
        <boxGeometry args={[charW * 0.6, 0.08, charW * 0.4]} />
        <meshStandardMaterial color="#0a1a44" emissive="#1133aa" emissiveIntensity={0.6} roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Left leg */}
      <mesh ref={null} position={[-0.14, charH * -0.28, 0]}>
        <boxGeometry args={[0.2, charH * 0.36, 0.2]} />
        <meshStandardMaterial color="#0d1f55" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Left knee pad */}
      <mesh position={[-0.14, charH * -0.22, charW * 0.12]}>
        <boxGeometry args={[0.18, 0.1, 0.06]} />
        <meshStandardMaterial color="#2255aa" emissive="#1144cc" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Left boot */}
      <mesh position={[-0.14, charH * -0.44, 0.04]}>
        <boxGeometry args={[0.22, 0.1, 0.26]} />
        <meshStandardMaterial color="#0a1533" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Right leg */}
      <mesh ref={legRRef} position={[0.14, charH * -0.28, 0]}>
        <boxGeometry args={[0.2, charH * 0.36, 0.2]} />
        <meshStandardMaterial color="#0d1f55" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Right knee pad */}
      <mesh position={[0.14, charH * -0.22, charW * 0.12]}>
        <boxGeometry args={[0.18, 0.1, 0.06]} />
        <meshStandardMaterial color="#2255aa" emissive="#1144cc" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Right boot */}
      <mesh position={[0.14, charH * -0.44, 0.04]}>
        <boxGeometry args={[0.22, 0.1, 0.26]} />
        <meshStandardMaterial color="#0a1533" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Cursed energy aura lines on body */}
      <mesh position={[0, charH * 0.08, charW * 0.21]}>
        <boxGeometry args={[0.03, charH * 0.3, 0.01]} />
        <meshStandardMaterial color="#44aaff" emissive="#44aaff" emissiveIntensity={3} />
      </mesh>
      <mesh position={[charW * 0.15, charH * 0.08, charW * 0.21]}>
        <boxGeometry args={[0.03, charH * 0.2, 0.01]} />
        <meshStandardMaterial color="#2288ff" emissive="#2288ff" emissiveIntensity={3} />
      </mesh>
      <mesh position={[-charW * 0.15, charH * 0.08, charW * 0.21]}>
        <boxGeometry args={[0.03, charH * 0.2, 0.01]} />
        <meshStandardMaterial color="#2288ff" emissive="#2288ff" emissiveIntensity={3} />
      </mesh>

      {/* Attack glow aura */}
      {attackTimer > 0 && (
        <mesh position={[0, charH * 0.08, 0]}>
          <sphereGeometry args={[charW * 0.75, 10, 10]} />
          <meshStandardMaterial
            color="#2266ff"
            emissive="#2266ff"
            emissiveIntensity={0.8}
            transparent
            opacity={0.12}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </>
  );
};

// Sukuna — deep crimson cursed spirit king
const SukunaCharacter: React.FC<{
  charW: number;
  charH: number;
  attackType: AttackType;
  attackTimer: number;
  hitTimer: number;
  isOnGround: boolean;
  bodyRef: React.RefObject<THREE.Mesh | null>;
  headRef: React.RefObject<THREE.Mesh | null>;
  armRef: React.RefObject<THREE.Mesh | null>;
  legRRef: React.RefObject<THREE.Mesh | null>;
}> = ({ charW, charH, attackType, attackTimer, hitTimer, isOnGround, bodyRef, headRef, armRef, legRRef }) => {
  return (
    <>
      {/* Torso — dark crimson robes */}
      <mesh ref={bodyRef} position={[0, charH * 0.08, 0]}>
        <boxGeometry args={[charW * 0.62, charH * 0.46, charW * 0.4]} />
        <meshStandardMaterial color="#3a0010" emissive="#220008" emissiveIntensity={0.4} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Robe overlay */}
      <mesh position={[0, charH * 0.06, charW * 0.21]}>
        <boxGeometry args={[charW * 0.5, charH * 0.38, 0.04]} />
        <meshStandardMaterial color="#550015" emissive="#330008" emissiveIntensity={0.3} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Cursed mark on chest */}
      <mesh position={[0, charH * 0.14, charW * 0.23]}>
        <boxGeometry args={[0.18, 0.04, 0.01]} />
        <meshStandardMaterial color="#ff2244" emissive="#ff0033" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0, charH * 0.14, charW * 0.23]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.18, 0.04, 0.01]} />
        <meshStandardMaterial color="#ff2244" emissive="#ff0033" emissiveIntensity={3} />
      </mesh>

      {/* Head — angular, menacing */}
      <mesh ref={headRef} position={[0, charH * 0.38, 0]}>
        <boxGeometry args={[charW * 0.46, charH * 0.34, charW * 0.4]} />
        <meshStandardMaterial color="#2a0a0a" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Sukuna's iconic eyes (4 eyes) */}
      {/* Upper eyes */}
      <mesh position={[0.1, charH * 0.43, charW * 0.21]}>
        <boxGeometry args={[0.1, 0.05, 0.01]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={4} />
      </mesh>
      <mesh position={[-0.1, charH * 0.43, charW * 0.21]}>
        <boxGeometry args={[0.1, 0.05, 0.01]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={4} />
      </mesh>
      {/* Lower eyes */}
      <mesh position={[0.1, charH * 0.36, charW * 0.21]}>
        <boxGeometry args={[0.08, 0.04, 0.01]} />
        <meshStandardMaterial color="#cc0000" emissive="#cc0000" emissiveIntensity={3} />
      </mesh>
      <mesh position={[-0.1, charH * 0.36, charW * 0.21]}>
        <boxGeometry args={[0.08, 0.04, 0.01]} />
        <meshStandardMaterial color="#cc0000" emissive="#cc0000" emissiveIntensity={3} />
      </mesh>
      {/* Tattoo lines on face */}
      <mesh position={[0.06, charH * 0.48, charW * 0.21]}>
        <boxGeometry args={[0.02, 0.1, 0.01]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[-0.06, charH * 0.48, charW * 0.21]}>
        <boxGeometry args={[0.02, 0.1, 0.01]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2.5} />
      </mesh>
      {/* Horns */}
      <mesh position={[charW * 0.18, charH * 0.56, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.05, 0.22, 6]} />
        <meshStandardMaterial color="#1a0000" emissive="#440000" emissiveIntensity={0.5} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[-charW * 0.18, charH * 0.56, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.05, 0.22, 6]} />
        <meshStandardMaterial color="#1a0000" emissive="#440000" emissiveIntensity={0.5} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Shoulder spikes */}
      <mesh position={[charW * 0.4, charH * 0.26, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.06, 0.28, 6]} />
        <meshStandardMaterial color="#220008" emissive="#440011" emissiveIntensity={0.6} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[-charW * 0.4, charH * 0.26, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.06, 0.28, 6]} />
        <meshStandardMaterial color="#220008" emissive="#440011" emissiveIntensity={0.6} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Attack arm (right) */}
      <mesh ref={armRef} position={[0.38, charH * 0.1, 0]}>
        <boxGeometry args={[0.34, 0.16, 0.16]} />
        <meshStandardMaterial
          color="#3a0010"
          emissive={attackTimer > 0 ? '#ff0033' : '#220008'}
          emissiveIntensity={attackTimer > 0 ? 2.5 : 0.3}
          roughness={0.4}
          metalness={0.4}
        />
      </mesh>
      {/* Claw hand */}
      <mesh position={[0.56, charH * 0.1, 0]}>
        <boxGeometry args={[0.14, 0.2, 0.2]} />
        <meshStandardMaterial color="#1a0005" emissive={attackTimer > 0 ? '#ff2244' : '#330008'} emissiveIntensity={attackTimer > 0 ? 3 : 0.4} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Claw tips */}
      {[-0.06, 0, 0.06].map((oz, i) => (
        <mesh key={i} position={[0.66, charH * 0.06, oz]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.025, 0.1, 4]} />
          <meshStandardMaterial color="#ff2244" emissive="#ff0033" emissiveIntensity={2} />
        </mesh>
      ))}

      {/* Other arm (left) */}
      <mesh position={[-0.38, charH * 0.1, 0]}>
        <boxGeometry args={[0.34, 0.16, 0.16]} />
        <meshStandardMaterial color="#3a0010" emissive="#220008" emissiveIntensity={0.3} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[-0.56, charH * 0.1, 0]}>
        <boxGeometry args={[0.14, 0.2, 0.2]} />
        <meshStandardMaterial color="#1a0005" emissive="#330008" emissiveIntensity={0.4} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Tattoo marks on arms */}
      <mesh position={[0.38, charH * 0.14, 0.09]}>
        <boxGeometry args={[0.28, 0.02, 0.01]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.38, charH * 0.14, 0.09]}>
        <boxGeometry args={[0.28, 0.02, 0.01]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={2} />
      </mesh>

      {/* Sash/belt */}
      <mesh position={[0, charH * -0.06, 0]}>
        <boxGeometry args={[charW * 0.65, 0.1, charW * 0.42]} />
        <meshStandardMaterial color="#1a0005" emissive="#440011" emissiveIntensity={0.5} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.15, charH * -0.28, 0]}>
        <boxGeometry args={[0.22, charH * 0.38, 0.22]} />
        <meshStandardMaterial color="#2a0008" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Left leg tattoo */}
      <mesh position={[-0.15, charH * -0.22, 0.12]}>
        <boxGeometry args={[0.16, 0.02, 0.01]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={2} />
      </mesh>
      {/* Left foot */}
      <mesh position={[-0.15, charH * -0.46, 0.04]}>
        <boxGeometry args={[0.24, 0.1, 0.28]} />
        <meshStandardMaterial color="#1a0005" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Right leg */}
      <mesh ref={legRRef} position={[0.15, charH * -0.28, 0]}>
        <boxGeometry args={[0.22, charH * 0.38, 0.22]} />
        <meshStandardMaterial color="#2a0008" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Right leg tattoo */}
      <mesh position={[0.15, charH * -0.22, 0.12]}>
        <boxGeometry args={[0.16, 0.02, 0.01]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={2} />
      </mesh>
      {/* Right foot */}
      <mesh position={[0.15, charH * -0.46, 0.04]}>
        <boxGeometry args={[0.24, 0.1, 0.28]} />
        <meshStandardMaterial color="#1a0005" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Cursed energy aura lines on body */}
      <mesh position={[0, charH * 0.08, charW * 0.22]}>
        <boxGeometry args={[0.03, charH * 0.32, 0.01]} />
        <meshStandardMaterial color="#ff2244" emissive="#ff0033" emissiveIntensity={3} />
      </mesh>
      <mesh position={[charW * 0.16, charH * 0.08, charW * 0.22]}>
        <boxGeometry args={[0.03, charH * 0.22, 0.01]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={3} />
      </mesh>
      <mesh position={[-charW * 0.16, charH * 0.08, charW * 0.22]}>
        <boxGeometry args={[0.03, charH * 0.22, 0.01]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={3} />
      </mesh>

      {/* Attack glow aura */}
      {attackTimer > 0 && (
        <mesh position={[0, charH * 0.08, 0]}>
          <sphereGeometry args={[charW * 0.8, 10, 10]} />
          <meshStandardMaterial
            color="#ff1133"
            emissive="#ff0022"
            emissiveIntensity={1.0}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </>
  );
};

const Character3D: React.FC<Character3DProps> = ({
  x, y, z, width, height, facing, attackType, attackTimer, hitTimer, isEnemy, isOnGround,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const armRef = useRef<THREE.Mesh>(null);
  const legRRef = useRef<THREE.Mesh>(null);

  const [wx, wy, wz] = gameToWorld(x + width / 2, y, z);

  // Character scale from game units
  const charW = width / 60;
  const charH = height / 60;

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

    // Hit flash on body
    if (bodyRef.current) {
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
      if (hitTimer > 0) {
        mat.emissive.setHex(0xffffff);
        mat.emissiveIntensity = 1.2 * Math.abs(Math.sin(Date.now() * 0.025));
      } else {
        if (isEnemy) {
          mat.emissive.setHex(0x220008);
          mat.emissiveIntensity = 0.4;
        } else {
          mat.emissive.setHex(0x001133);
          mat.emissiveIntensity = 0.3;
        }
      }
    }

    // Attack animation — extend arm
    if (armRef.current) {
      if (attackTimer > 0 && attackType === AttackType.PUNCH) {
        armRef.current.position.x = 0.52 + Math.sin(attackTimer * 15) * 0.18;
        armRef.current.scale.x = 1.5;
      } else {
        armRef.current.position.x = isEnemy ? 0.38 : 0.36;
        armRef.current.scale.x = 1.0;
      }
    }

    // Kick animation
    if (legRRef.current) {
      if (attackTimer > 0 && attackType === AttackType.KICK) {
        legRRef.current.rotation.x = -Math.PI / 2.5 * Math.sin(attackTimer * 12);
        legRRef.current.position.x = (isEnemy ? 0.15 : 0.14) + Math.sin(attackTimer * 12) * 0.25;
      } else {
        legRRef.current.rotation.x = 0;
        legRRef.current.position.x = isEnemy ? 0.15 : 0.14;
      }
    }

    // Idle bob when on ground
    if (isOnGround && attackTimer <= 0) {
      const bob = Math.sin(Date.now() * 0.003) * 0.025;
      if (headRef.current) headRef.current.position.y = charH * 0.38 + bob;
    }
  });

  return (
    <group ref={groupRef} position={[wx, wy, wz]}>
      {isEnemy ? (
        <SukunaCharacter
          charW={charW}
          charH={charH}
          attackType={attackType}
          attackTimer={attackTimer}
          hitTimer={hitTimer}
          isOnGround={isOnGround}
          bodyRef={bodyRef}
          headRef={headRef}
          armRef={armRef}
          legRRef={legRRef}
        />
      ) : (
        <UGCharacter
          charW={charW}
          charH={charH}
          attackType={attackType}
          attackTimer={attackTimer}
          hitTimer={hitTimer}
          isOnGround={isOnGround}
          bodyRef={bodyRef}
          headRef={headRef}
          armRef={armRef}
          legRRef={legRRef}
        />
      )}
    </group>
  );
};

export default Character3D;
