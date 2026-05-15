"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PlanetProps {
  orbitRadius: number;
  speed: number;
  size: number;
  color: string;
  emissive?: string;
  offset?: number;
  ringColor?: string;
}

function Planet({
  orbitRadius,
  speed,
  size,
  color,
  emissive = "#000000",
  offset = 0,
  ringColor,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    groupRef.current.position.x = Math.cos(t) * orbitRadius;
    groupRef.current.position.z = Math.sin(t) * orbitRadius;
    groupRef.current.position.y = Math.sin(t * 0.3) * (orbitRadius * 0.08);

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.15}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Optional ring */}
      {ringColor && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[size * 2, size * 0.08, 4, 48]} />
          <meshStandardMaterial
            color={ringColor}
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Subtle glow */}
      <mesh>
        <sphereGeometry args={[size * 1.3, 8, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

interface PlanetsProps {
  count?: number;
}

const PLANET_CONFIGS = [
  {
    orbitRadius: 22,
    speed: 0.08,
    size: 0.6,
    color: "#4a90d9",
    emissive: "#1a3a6b",
    offset: 0,
  },
  {
    orbitRadius: 32,
    speed: 0.05,
    size: 1.1,
    color: "#d4873a",
    emissive: "#6b3a1a",
    offset: 2.1,
    ringColor: "#c4973a",
  },
  {
    orbitRadius: 42,
    speed: 0.03,
    size: 0.8,
    color: "#7a4acf",
    emissive: "#3a1a6b",
    offset: 4.2,
  },
  {
    orbitRadius: 55,
    speed: 0.02,
    size: 0.5,
    color: "#3a8a6b",
    emissive: "#1a4a3a",
    offset: 1.0,
  },
];

export default function Planets({ count = 4 }: PlanetsProps) {
  const configs = useMemo(() => PLANET_CONFIGS.slice(0, count), [count]);

  return (
    <>
      {configs.map((config, i) => (
        <Planet key={i} {...config} />
      ))}
    </>
  );
}
