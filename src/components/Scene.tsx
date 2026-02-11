'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Lobster } from './Lobster';
import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

interface Agent {
  id: number;
  name: string;
  joinedAt: number;
  expiresAt: number;
}

interface Message {
  id: number;
  agentId: number;
  agentName: string;
  content: string;
  createdAt: number;
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
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Fetch agents and messages immediately
    fetchAgents();
    fetchMessages();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchAgents();
      fetchMessages();
    }, 5000);

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

  async function fetchMessages() {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();

      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
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
    <div className="w-full h-full">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 5, 12]} />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={25} />

        {/* Ambient warm lighting (dim, cozy atmosphere) */}
        <ambientLight intensity={0.2} color="#FFD1A3" />

        {/* Main overhead light (warm, soft) */}
        <directionalLight
          position={[0, 8, 0]}
          intensity={0.6}
          color="#FFCC99"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />

        {/* Corner accent lights (warm glow) */}
        <pointLight position={[-8, 3, -8]} intensity={0.4} color="#FF9966" distance={15} />
        <pointLight position={[8, 3, -8]} intensity={0.4} color="#FF9966" distance={15} />
        <pointLight position={[-8, 3, 8]} intensity={0.3} color="#FFAA77" distance={15} />
        <pointLight position={[8, 3, 8]} intensity={0.3} color="#FFAA77" distance={15} />

        {/* Fog for smoky atmosphere */}
        <fog attach="fog" args={['#1A1410', 10, 30]} />

        {/* Floor - dark wood planks */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial
            color="#3D2A1F"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Walls - wood paneling */}
        {/* Back wall */}
        <mesh position={[0, 4.5, -15]} receiveShadow>
          <boxGeometry args={[30, 10, 0.5]} />
          <meshStandardMaterial color="#4A3525" roughness={0.9} />
        </mesh>

        {/* Left wall */}
        <mesh position={[-15, 4.5, 0]} receiveShadow>
          <boxGeometry args={[0.5, 10, 30]} />
          <meshStandardMaterial color="#4A3525" roughness={0.9} />
        </mesh>

        {/* Right wall */}
        <mesh position={[15, 4.5, 0]} receiveShadow>
          <boxGeometry args={[0.5, 10, 30]} />
          <meshStandardMaterial color="#4A3525" roughness={0.9} />
        </mesh>

        {/* Ceiling */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#2B1F17" roughness={0.95} />
        </mesh>

        {/* Central table (round) */}
        <group position={[0, -0.5, 0]}>
          {/* Table top */}
          <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[2.5, 2.5, 0.1, 32]} />
            <meshStandardMaterial color="#5C3D2E" roughness={0.6} metalness={0.2} />
          </mesh>
          {/* Table leg */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.3, 0.9, 16]} />
            <meshStandardMaterial color="#3D2A1F" roughness={0.8} />
          </mesh>
        </group>

        {/* Ashtrays on table (4 positioned around table) */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => {
          const x = Math.cos(angle) * 1.8;
          const z = Math.sin(angle) * 1.8;
          return (
            <group key={i} position={[x, 0.05, z]}>
              {/* Ashtray base */}
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.15, 0.12, 0.05, 16]} />
                <meshStandardMaterial color="#1A1A1A" roughness={0.3} metalness={0.7} />
              </mesh>
            </group>
          );
        })}

        {/* Wall sconces (decorative light fixtures) */}
        {[-10, 0, 10].map((x, i) => (
          <group key={`sconce-back-${i}`} position={[x, 5, -14.5]}>
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.6, 0.2]} />
              <meshStandardMaterial color="#8B6F47" roughness={0.5} metalness={0.3} />
            </mesh>
            <pointLight position={[0, 0, 0.5]} intensity={0.3} color="#FFAA66" distance={4} />
          </group>
        ))}

        {/* Side wall sconces */}
        {[-10, 0, 10].map((z, i) => (
          <group key={`sconce-left-${i}`} position={[-14.5, 5, z]}>
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.6, 0.3]} />
              <meshStandardMaterial color="#8B6F47" roughness={0.5} metalness={0.3} />
            </mesh>
            <pointLight position={[0.5, 0, 0]} intensity={0.25} color="#FFAA66" distance={4} />
          </group>
        ))}

        {[-10, 0, 10].map((z, i) => (
          <group key={`sconce-right-${i}`} position={[14.5, 5, z]}>
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.6, 0.3]} />
              <meshStandardMaterial color="#8B6F47" roughness={0.5} metalness={0.3} />
            </mesh>
            <pointLight position={[-0.5, 0, 0]} intensity={0.25} color="#FFAA66" distance={4} />
          </group>
        ))}

        {/* Render lobsters */}
        {agents.map((agent, index) => {
          const message = messages.find((msg) => msg.agentId === agent.id);
          return (
            <Lobster
              key={agent.id}
              position={getPosition(index, agents.length)}
              color={lobsterColors.get(agent.id) || '#FF6B6B'}
              name={agent.name}
              message={message?.content}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
