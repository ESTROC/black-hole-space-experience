"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Stars } from "@react-three/drei";
import BlackHoleMesh, { BlackHoleMeshRef } from "./BlackHoleMesh";
import Planets from "./Planets";
import StarField from "./StarField";
import { useGPUTier } from "@/hooks/useGPUTier";

interface BlackHoleSceneProps {
  inView?: boolean;
  interactionX?: number;
  interactionY?: number;
  blackHoleScale?: number;
  className?: string;
}

export default function BlackHoleScene({
  inView = true,
  blackHoleScale = 1,
  className = "",
}: BlackHoleSceneProps) {
  const perf = useGPUTier();
  const blackHoleRef = useRef<BlackHoleMeshRef>(null);

  // Apply scale from parent (MediaPipe or mouse)
  if (blackHoleRef.current) {
    blackHoleRef.current.setSize(blackHoleScale);
  }

  return (
    <Canvas
      className={className}
      frameloop={inView ? "always" : "never"}
      dpr={perf.dpr}
      camera={{ position: [0, 2, 18], fov: 60, near: 0.1, far: 500 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      style={{ background: "transparent" }}
    >
      {/* Performance adapters */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* Lighting */}
      <ambientLight intensity={0.02} />
      <pointLight
        position={[0, 0, 0]}
        intensity={8}
        color="#7c3aed"
        distance={50}
        decay={2}
      />
      <pointLight
        position={[10, 5, 10]}
        intensity={0.5}
        color="#06b6d4"
        distance={80}
        decay={2}
      />

      <Suspense fallback={null}>
        {/* Background stars */}
        <StarField count={perf.starCount} />

        {/* Main black hole */}
        <BlackHoleMesh ref={blackHoleRef} />

        {/* Orbiting planets */}
        <Planets count={perf.planetCount} />

        {/* Drei Stars for background depth */}
        <Stars
          radius={80}
          depth={30}
          count={500}
          factor={2}
          saturation={0.3}
          fade
          speed={0.3}
        />
      </Suspense>
    </Canvas>
  );
}
