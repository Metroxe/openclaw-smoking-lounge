'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LobsterProps {
  position: [number, number, number];
  color: string;
  name: string;
}

export function Lobster({ position, color, name }: LobsterProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.4, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.1, 0.6]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Tail segments */}
      <mesh position={[0, 0, -0.6]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0, -0.9]} castShadow>
        <boxGeometry args={[0.4, 0.25, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Left claw */}
      <group position={[-0.4, 0, 0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.15, 0.15, 0.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0, 0.35]} castShadow>
          <boxGeometry args={[0.25, 0.2, 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {/* Right claw */}
      <group position={[0.4, 0, 0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.15, 0.15, 0.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0, 0.35]} castShadow>
          <boxGeometry args={[0.25, 0.2, 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {/* Antennae */}
      <mesh position={[-0.1, 0.25, 0.75]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 0.25, 0.75]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.15, 0.2, 0.8]} castShadow>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.15, 0.2, 0.8]} castShadow>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}
