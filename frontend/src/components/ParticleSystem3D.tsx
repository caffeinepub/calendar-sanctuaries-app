import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Particle } from '../types/game';

interface ParticleSystem3DProps {
  particles: Particle[];
}

const MAX_PARTICLES = 200;
const HALF = Math.floor(MAX_PARTICLES / 2);

// Convert game-space coordinates to 3D world coordinates.
// Particles use world-space directly (x in [-4..4], y from 0 upward).
function particleToWorld(x: number, y: number, z: number): [number, number, number] {
  return [x, y, z];
}

// Two instanced meshes: spheres (impact flares) and boxes (sparks)
const ParticleSystem3D: React.FC<ParticleSystem3DProps> = ({ particles }) => {
  // Sphere instanced mesh — impact flares
  const sphereMeshRef = useRef<THREE.InstancedMesh>(null);
  // Box instanced mesh — spark streaks
  const boxMeshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    if (!sphereMeshRef.current || !boxMeshRef.current) return;

    const count = Math.min(particles.length, MAX_PARTICLES);

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const rawAlpha = Math.max(0, p.life / p.maxLife);
      const [wx, wy, wz] = particleToWorld(p.x, p.y, p.z);

      // Scale-up-then-shrink: peaks at 30% of life, fades out
      const peakAt = 0.7; // life fraction where scale peaks (counting down from maxLife)
      let scaleMult: number;
      if (rawAlpha > peakAt) {
        // Early phase: scale up from 0 to 1.4x
        scaleMult = 1.4 * (1 - (rawAlpha - peakAt) / (1 - peakAt));
      } else {
        // Late phase: shrink from 1.4x to 0
        scaleMult = 1.4 * (rawAlpha / peakAt);
      }
      scaleMult = Math.max(0, scaleMult);

      // Alternate between sphere (even) and box (odd) particles
      const isSphere = i % 2 === 0;
      const meshRef = isSphere ? sphereMeshRef : boxMeshRef;
      const localIdx = Math.floor(i / 2);

      if (localIdx >= HALF) continue;

      dummy.position.set(wx, wy, wz);

      if (isSphere) {
        // Flare: uniform sphere scale
        const scale = p.size * scaleMult * 1.2;
        dummy.scale.setScalar(scale);
        dummy.rotation.set(0, 0, 0);
      } else {
        // Spark: elongated box oriented along velocity
        const baseScale = p.size * scaleMult;
        const angle = Math.atan2(p.vy, p.vx);
        dummy.scale.set(baseScale * 3.5, baseScale * 0.5, baseScale * 0.5);
        dummy.rotation.set(0, 0, angle);
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(localIdx, dummy.matrix);

      // Cursed-energy color palette: boost saturation
      const baseColor = new THREE.Color(p.color);
      const hsl = { h: 0, s: 0, l: 0 };
      baseColor.getHSL(hsl);
      const boostedColor = new THREE.Color().setHSL(
        hsl.h,
        Math.min(1, hsl.s * 1.5 + 0.3),
        Math.min(0.85, hsl.l * 1.2 + 0.1)
      );
      colorObj.copy(boostedColor);
      meshRef.current!.setColorAt(localIdx, colorObj);
    }

    // Hide unused sphere instances
    const sphereCount = Math.ceil(count / 2);
    for (let i = sphereCount; i < HALF; i++) {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      sphereMeshRef.current.setMatrixAt(i, dummy.matrix);
    }

    // Hide unused box instances
    const boxCount = Math.floor(count / 2);
    for (let i = boxCount; i < HALF; i++) {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      boxMeshRef.current.setMatrixAt(i, dummy.matrix);
    }

    sphereMeshRef.current.instanceMatrix.needsUpdate = true;
    boxMeshRef.current.instanceMatrix.needsUpdate = true;
    if (sphereMeshRef.current.instanceColor) sphereMeshRef.current.instanceColor.needsUpdate = true;
    if (boxMeshRef.current.instanceColor) boxMeshRef.current.instanceColor.needsUpdate = true;

    sphereMeshRef.current.count = HALF;
    boxMeshRef.current.count = HALF;
  });

  return (
    <>
      {/* Impact flares — sphere geometry with emissive glow */}
      <instancedMesh ref={sphereMeshRef} args={[undefined, undefined, HALF]} frustumCulled={false}>
        <sphereGeometry args={[1, 7, 7]} />
        <meshStandardMaterial
          vertexColors
          toneMapped={false}
          emissiveIntensity={2.5}
          roughness={0}
          metalness={0.1}
          transparent
          opacity={0.92}
        />
      </instancedMesh>

      {/* Spark streaks — box geometry, elongated along velocity */}
      <instancedMesh ref={boxMeshRef} args={[undefined, undefined, HALF]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          vertexColors
          toneMapped={false}
          emissiveIntensity={3.0}
          roughness={0}
          metalness={0.2}
          transparent
          opacity={0.85}
        />
      </instancedMesh>
    </>
  );
};

export default ParticleSystem3D;
