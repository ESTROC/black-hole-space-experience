"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarFieldProps {
  count?: number;
  radius?: number;
}

export default function StarField({ count = 3000, radius = 150 }: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute on sphere surface for immersive feel
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = radius * (0.5 + Math.random() * 0.5);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = Math.random() * 1.5 + 0.3;
    }

    return { positions, sizes };
  }, [count, radius]);

  // Star colors: mostly white/blue, some warm stars
  const colors = useMemo(() => {
    const colors = new Float32Array(count * 3);
    const starColors = [
      [1.0, 1.0, 1.0],   // White
      [0.8, 0.9, 1.0],   // Blue-white
      [1.0, 0.97, 0.9],  // Warm white
      [0.6, 0.8, 1.0],   // Blue
      [1.0, 0.9, 0.7],   // Yellow-white
    ];

    for (let i = 0; i < count; i++) {
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
    }
    return colors;
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, sizes, colors]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state) => {
    if (!pointsRef.current) return;
    // Very slow parallax rotation
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.002;

    // Subtle mouse parallax
    const targetX = state.pointer.x * 0.02;
    const targetY = state.pointer.y * 0.02;
    mouseRef.current.x += (targetX - mouseRef.current.x) * 0.05;
    mouseRef.current.y += (targetY - mouseRef.current.y) * 0.05;
    pointsRef.current.rotation.y += mouseRef.current.x;
    pointsRef.current.rotation.x += mouseRef.current.y;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}
