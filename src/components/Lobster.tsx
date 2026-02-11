'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface LobsterProps {
  position: [number, number, number];
  color: string;
  name: string;
  message?: string;
}

export function Lobster({ position, color, name, message }: LobsterProps) {
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
      {/* Speech bubble */}
      {message && (
        <Html position={[0, 1.2, 0]} center distanceFactor={8}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#000',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              maxWidth: '200px',
              wordWrap: 'break-word',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              whiteSpace: 'pre-wrap',
            }}
          >
            {message}
            {/* Speech bubble tail */}
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgba(255, 255, 255, 0.95)',
              }}
            />
          </div>
        </Html>
      )}
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

      {/* Cigarette (held in right claw) */}
      <group position={[0.55, 0.05, 0.55]} rotation={[0, 0, Math.PI / 6]}>
        {/* Cigarette body (white) */}
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        {/* Filter (tan/beige) */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.1]} />
          <meshStandardMaterial color="#E8D4B0" />
        </mesh>
        {/* Burning tip (orange/red) */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.018, 0.05]} />
          <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={1.5} />
        </mesh>
        {/* Glowing ember point light */}
        <pointLight position={[0, 0.2, 0]} color="#FF6600" intensity={0.3} distance={1.5} />
      </group>
    </group>
  );
}
