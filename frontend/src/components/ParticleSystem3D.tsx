import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Particle } from '../types/game';
import { gameToWorld } from './Character3D';

interface ParticleSystem3DProps {
  particles: Particle[];
}

const ParticleSystem3D: React.FC<ParticleSystem3DProps> = ({ particles }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const MAX_PARTICLES = 200;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    if (!meshRef.current) return;

    const count = Math.min(particles.length, MAX_PARTICLES);

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const alpha = Math.max(0, p.life / p.maxLife);
      const [wx, wy, wz] = gameToWorld(p.x, p.y, p.z);

      dummy.position.set(wx, wy, wz);
      const scale = (p.size / 60) * alpha;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      colorObj.set(p.color);
      meshRef.current.setColorAt(i, colorObj);
    }

    // Hide unused instances
    for (let i = count; i < MAX_PARTICLES; i++) {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
    meshRef.current.count = MAX_PARTICLES;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
};

export default ParticleSystem3D;
