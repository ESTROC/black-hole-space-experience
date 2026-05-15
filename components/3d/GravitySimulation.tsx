"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HandData } from "@/hooks/useMediaPipe";

interface GravitySimulationProps {
  particleCount?: number;
  handData?: HandData;
  mousePosition?: { x: number; y: number };
  isHandTracking?: boolean;
  onPinchDetected?: () => void;
  isPinching?: boolean;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
}

export default function GravitySimulation({
  particleCount = 140,
  handData,
  mousePosition = { x: 0, y: 0 },
  isHandTracking = false,
  onPinchDetected,
  isPinching = false,
}: GravitySimulationProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const rippleRef = useRef<THREE.Mesh>(null);

  // All mutable state in refs — no re-renders
  const gravityCenter = useRef({ x: 0, y: 0 });
  const targetGravity = useRef({ x: 0, y: 0 });
  const pinchFired = useRef(false);
  const rippleActive = useRef(false);
  const rippleTime = useRef(0);
  const frameCount = useRef(0);
  const particles = useRef<Particle[]>([]);

  // Initialize particles once
  useMemo(() => {
    particles.current = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * 28,
      y: (Math.random() - 0.5) * 16,
      vx: (Math.random() - 0.5) * 0.04,
      vy: (Math.random() - 0.5) * 0.04,
    }));
  }, [particleCount]);

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    particles.current.forEach((p, i) => {
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = 0;
    });
    return pos;
  }, [particleCount]);

  const colors = useMemo(() => {
    const cols = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      cols[i * 3] = 0.5 + Math.random() * 0.4;
      cols[i * 3 + 1] = 0.15 + Math.random() * 0.25;
      cols[i * 3 + 2] = 0.85 + Math.random() * 0.15;
    }
    return cols;
  }, [particleCount]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  const mat = useMemo(() =>
    new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }), []);

  const rippleGeo = useMemo(() => new THREE.RingGeometry(0.4, 0.55, 40), []);
  const rippleMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color("#06b6d4"),
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  // Pinch trigger
  useEffect(() => {
    if (isPinching && !pinchFired.current) {
      pinchFired.current = true;
      rippleActive.current = true;
      rippleTime.current = 0;
      onPinchDetected?.();
    } else if (!isPinching) {
      pinchFired.current = false;
    }
  }, [isPinching, onPinchDetected]);

  useFrame((state, delta) => {
    frameCount.current++;

    // Update target from hand or mouse
    if (isHandTracking && handData?.isTracking) {
      targetGravity.current.x = (handData.x - 0.5) * 28;
      targetGravity.current.y = -(handData.y - 0.5) * 16;
    } else {
      targetGravity.current.x = mousePosition.x * 13;
      targetGravity.current.y = mousePosition.y * 8;
    }

    // Smooth gravity lerp — capped delta prevents spiral on tab switch
    const dt = Math.min(delta, 0.05);
    gravityCenter.current.x += (targetGravity.current.x - gravityCenter.current.x) * 0.08;
    gravityCenter.current.y += (targetGravity.current.y - gravityCenter.current.y) * 0.08;

    const gx = gravityCenter.current.x;
    const gy = gravityCenter.current.y;

    // Gravity strength
    let gravStrength = 0.75;
    if (isHandTracking && handData?.isTracking) {
      gravStrength = handData.isOpenPalm
        ? 0.08
        : 0.45 + handData.z * 0.7 + (1 - handData.pinchDistance) * 0.45;
    }
    if (isPinching) gravStrength *= 2.2;

    const pos = pointsRef.current?.geometry.attributes.position.array as Float32Array;
    const col = pointsRef.current?.geometry.attributes.color.array as Float32Array;
    if (!pos) return;

    // Physics — only full update every frame (already fast enough)
    const count = particles.current.length;
    for (let i = 0; i < count; i++) {
      const p = particles.current[i];
      const dx = gx - p.x;
      const dy = gy - p.y;
      const distSq = dx * dx + dy * dy + 0.5;
      const invDist = 1 / Math.sqrt(distSq);

      const force = (gravStrength * 0.38) / distSq;
      const fx = dx * invDist * force;
      const fy = dy * invDist * force;

      p.vx += fx;
      p.vy += fy;

      // Open palm: repel
      if (isHandTracking && handData?.isOpenPalm && handData.isTracking) {
        p.vx -= fx * 1.8;
        p.vy -= fy * 1.8;
      }

      // Orbital drift
      p.vx += -dy * invDist * 0.0006;
      p.vy +=  dx * invDist * 0.0006;

      // Damping
      p.vx *= 0.982;
      p.vy *= 0.982;

      p.x += p.vx;
      p.y += p.vy;

      // Respawn when swallowed or off-screen
      const dist = 1 / invDist;
      if (dist < 0.7 || Math.abs(p.x) > 17 || Math.abs(p.y) > 10) {
        const angle = Math.random() * Math.PI * 2;
        const r = 7 + Math.random() * 9;
        p.x = gx + Math.cos(angle) * r;
        p.y = gy + Math.sin(angle) * r;
        p.vx = (Math.random() - 0.5) * 0.08;
        p.vy = (Math.random() - 0.5) * 0.08;
      }

      // Color by speed
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const heat = Math.min(1, speed * 12);
      col[i * 3]     = 0.35 + heat * 0.65;
      col[i * 3 + 1] = 0.08 + heat * 0.18;
      col[i * 3 + 2] = 1.0  - heat * 0.35;

      pos[i * 3]     = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = 0;
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }

    // Ripple
    if (rippleActive.current && rippleRef.current) {
      rippleTime.current += dt;
      const prog = Math.min(rippleTime.current / 1.1, 1);
      const rm = rippleRef.current.material as THREE.MeshBasicMaterial;
      rippleRef.current.scale.setScalar(1 + prog * 9);
      rippleRef.current.position.set(gx, gy, 0.1);
      rm.opacity = 0.75 * (1 - prog);
      if (prog >= 1) { rippleActive.current = false; rm.opacity = 0; }
    }
  });

  return (
    <>
      <points ref={pointsRef} geometry={geo} material={mat} />
      <mesh ref={rippleRef} geometry={rippleGeo} material={rippleMat} />
    </>
  );
}
