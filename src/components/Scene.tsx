'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Lobster } from './Lobster';
import { useEffect, useState } from 'react';

interface Agent {
  id: number;
  name: string;
  joinedAt: number;
  expiresAt: number;
}

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
];

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function Scene() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [lobsterColors, setLobsterColors] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    // Fetch agents immediately
    fetchAgents();

    // Poll every 5 seconds
    const interval = setInterval(fetchAgents, 5000);

    return () => clearInterval(interval);
  }, []);

  async function fetchAgents() {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();

      if (data.agents) {
        setAgents(data.agents);

        // Assign colors to new agents
        setLobsterColors((prevColors) => {
          const newColors = new Map(prevColors);
          data.agents.forEach((agent: Agent) => {
            if (!newColors.has(agent.id)) {
              newColors.set(agent.id, getRandomColor());
            }
          });
          return newColors;
        });
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  }

  // Calculate positions in a circle
  const getPosition = (index: number, total: number): [number, number, number] => {
    const radius = Math.max(3, total * 0.5);
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return [x, 0, z];
  };

  return (
    <div className="w-full h-screen">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={20} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        {/* Floor */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#2C3E50" />
        </mesh>

        {/* Render lobsters */}
        {agents.map((agent, index) => (
          <Lobster
            key={agent.id}
            position={getPosition(index, agents.length)}
            color={lobsterColors.get(agent.id) || '#FF6B6B'}
            name={agent.name}
          />
        ))}
      </Canvas>
    </div>
  );
}
