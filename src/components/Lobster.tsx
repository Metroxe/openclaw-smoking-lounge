'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface LobsterProps {
  position: [number, number, number];
  color: string;
  name: string;
  message?: string;
}

// Smoke particle configuration
const PARTICLE_COUNT = 20;
const SMOKE_LIFETIME = 2.5; // seconds

export function Lobster({ position, color, name, message }: LobsterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Points>(null);

  // Smoke particle state and geometry
  const smokeParticles = useMemo(() => {
    const particles: Array<{ age: number; offset: number }> = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        age: (i / PARTICLE_COUNT) * SMOKE_LIFETIME, // Stagger initial ages
        offset: Math.random() * Math.PI * 2, // Random circular offset
      });
    }
    return particles;
  }, []);

  const smokeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const opacities = new Float32Array(PARTICLE_COUNT);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    return geometry;
  }, []);

  // Gentle floating animation + smoke particle animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }

    // Animate smoke particles
    if (smokeRef.current) {
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array;
      const opacities = smokeRef.current.geometry.attributes.opacity.array as Float32Array;

      smokeParticles.forEach((particle, i) => {
        // Age the particle
        particle.age += delta;
        if (particle.age > SMOKE_LIFETIME) {
          particle.age = 0; // Reset particle
          particle.offset = Math.random() * Math.PI * 2; // New random offset
        }

        // Calculate particle position based on age
        const progress = particle.age / SMOKE_LIFETIME;
        const x = Math.cos(particle.offset) * 0.03 * progress; // Slight drift outward
        const y = 0.2 + progress * 0.5; // Rise from cigarette tip
        const z = Math.sin(particle.offset) * 0.03 * progress;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Fade out as particle ages
        opacities[i] = Math.max(0, 1 - progress);
      });

      smokeRef.current.geometry.attributes.position.needsUpdate = true;
      smokeRef.current.geometry.attributes.opacity.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Speech bubble */}
      {message && (
        <Html position={[0, 1.8, 0]} center distanceFactor={8}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              color: '#000',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              width: '600px',
              wordWrap: 'break-word',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              whiteSpace: 'pre-wrap',
            }}
          >
            {/* Agent name */}
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '13px',
                marginBottom: '6px',
                color: '#333',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                paddingBottom: '4px',
              }}
            >
              {name}
            </div>
            {/* Message */}
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
                borderTop: '6px solid rgba(255, 255, 255, 0.75)',
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

        {/* Smoke particles */}
        <points ref={smokeRef} geometry={smokeGeometry}>
          <pointsMaterial
            size={0.08}
            color="#CCCCCC"
            transparent
            opacity={0.4}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            vertexColors={false}
          />
        </points>
      </group>
    </group>
  );
}
