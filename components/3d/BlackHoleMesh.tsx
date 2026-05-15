"use client";

import React, { useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// ── Accretion Disk Shader ─────────────────────────────────────────────────────
const AccretionDiskMaterial = shaderMaterial(
  {
    uTime: 0,
    uInnerRadius: 2.5,
    uOuterRadius: 7.0,
    uColor1: new THREE.Color("#ff6a00"),
    uColor2: new THREE.Color("#fbbf24"),
    uColor3: new THREE.Color("#7c3aed"),
  },
  // vertex
  `
    varying vec2 vUv;
    varying float vRadius;
    void main() {
      vUv = uv;
      vRadius = length(position.xz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment
  `
    uniform float uTime;
    uniform float uInnerRadius;
    uniform float uOuterRadius;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;
    varying float vRadius;

    // Simple noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    void main() {
      float t = (vRadius - uInnerRadius) / (uOuterRadius - uInnerRadius);
      t = clamp(t, 0.0, 1.0);

      // Angle-based swirl
      float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
      float swirl = angle + uTime * 0.3 - vRadius * 0.4;

      // Turbulence
      float n = noise(vec2(swirl * 2.0, t * 8.0 + uTime * 0.2));
      n = n * 0.5 + noise(vec2(swirl * 5.0, t * 15.0 - uTime * 0.15)) * 0.3;

      // Color gradient (inner = hot, outer = cooler)
      vec3 color = mix(uColor1, uColor2, t * 0.6);
      color = mix(color, uColor3, t * 0.8 + n * 0.2);
      color += uColor1 * (1.0 - t) * 0.5;

      // Brightness
      float bright = (1.0 - t) * 2.0 + n * 0.8;
      color *= bright;

      // Fade at edges
      float alpha = (1.0 - t) * 0.95 + n * 0.15;
      alpha *= smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.85, t);

      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ AccretionDiskMaterial });

type AccretionDiskMaterialInstance = InstanceType<typeof AccretionDiskMaterial>;

declare module "@react-three/fiber" {
  interface ThreeElements {
    accretionDiskMaterial: Partial<AccretionDiskMaterialInstance> & {
      ref?: React.RefObject<AccretionDiskMaterialInstance | null>;
      attach?: string;
    };
  }
}

// ── Gravitational Lensing Particles ──────────────────────────────────────────
function LensingParticles({ count = 150 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 8 + Math.random() * 20;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return { positions, velocities };
  }, [count]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return g;
  }, [positions]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = pos[ix];
      const y = pos[ix + 1];
      const z = pos[ix + 2];

      const dist = Math.sqrt(x * x + y * y + z * z);
      const gravity = Math.min(0.15 / (dist * dist + 0.01), 0.06);

      const nx = x - (x / dist) * gravity;
      const ny = y - (y / dist) * gravity;
      const nz = z - (z / dist) * gravity;
      const nd = Math.sqrt(nx * nx + ny * ny + nz * nz);

      if (nd < 2.2) {
        // Reset particle to outer ring
        const angle = Math.random() * Math.PI * 2;
        const r = 18 + Math.random() * 10;
        pos[ix] = Math.cos(angle) * r;
        pos[ix + 1] = (Math.random() - 0.5) * 2;
        pos[ix + 2] = Math.sin(angle) * r;
      } else {
        pos[ix] = nx;
        pos[ix + 1] = ny;
        pos[ix + 2] = nz;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.15,
        color: new THREE.Color("#c084fc"),
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    []
  );

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}

// ── Jet Streams ───────────────────────────────────────────────────────────────
function JetStream({ direction }: { direction: 1 | -1 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 80;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const spread = t * 2;
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = direction * t * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return pos;
  }, [direction]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
  });

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.12,
        color: new THREE.Color("#06b6d4"),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    []
  );

  return <points geometry={geo} material={mat} ref={pointsRef} />;
}

// ── Main Black Hole ───────────────────────────────────────────────────────────
export interface BlackHoleMeshRef {
  setSize: (scale: number) => void;
}

const BlackHoleMesh = forwardRef<BlackHoleMeshRef>(
  function BlackHoleMesh(props, ref) {
    const groupRef = useRef<THREE.Group>(null);
    const diskRef = useRef<THREE.Mesh>(null);
    const diskMatRef = useRef<InstanceType<typeof AccretionDiskMaterial>>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const targetScale = useRef(1);
    const currentScale = useRef(1);

    useImperativeHandle(ref, () => ({
      setSize: (scale: number) => {
        targetScale.current = Math.max(0.5, Math.min(2.5, scale));
      },
    }));

    useFrame((state) => {
      const t = state.clock.elapsedTime;

      // Animate accretion disk material
      if (diskMatRef.current) {
        diskMatRef.current.uTime = t;
      }

      // Disk rotation
      if (diskRef.current) {
        diskRef.current.rotation.z = t * 0.4;
      }

      // Scale interpolation (from MediaPipe or interaction)
      currentScale.current +=
        (targetScale.current - currentScale.current) * 0.08;

      if (groupRef.current) {
        groupRef.current.scale.setScalar(currentScale.current);

        // Subtle float
        groupRef.current.position.y = Math.sin(t * 0.5) * 0.3;

        // Native Scroll-based rotation (bypasses React state)
        const scrollY = window.scrollY || 0;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const p = maxScroll > 0 ? scrollY / maxScroll : 0;
        groupRef.current.rotation.y = p * Math.PI * 0.5;
      }

      // Glow pulse
      if (glowRef.current) {
        const s = 1 + Math.sin(t * 1.5) * 0.05;
        glowRef.current.scale.setScalar(s);
      }
    });

    return (
      <group ref={groupRef}>
        {/* Event Horizon — pure black sphere */}
        <mesh>
          <sphereGeometry args={[2.2, 48, 48]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Photon sphere — subtle bright ring */}
        <mesh>
          <torusGeometry args={[2.35, 0.05, 8, 96]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>

        {/* Outer glow sphere */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[2.8, 16, 16]} />
          <meshBasicMaterial
            color="#7c3aed"
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        {/* Second glow layer */}
        <mesh>
          <sphereGeometry args={[3.8, 16, 16]} />
          <meshBasicMaterial
            color="#4f46e5"
            transparent
            opacity={0.06}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        {/* Accretion Disk */}
        <mesh
          ref={diskRef}
          rotation={[Math.PI / 2 + 0.15, 0, 0]}
        >
          <ringGeometry args={[2.5, 7.0, 96, 8]} />
          <accretionDiskMaterial
            ref={diskMatRef}
            uTime={0}
            uInnerRadius={2.5}
            uOuterRadius={7.0}
            uColor1={new THREE.Color("#ff6a00")}
            uColor2={new THREE.Color("#fbbf24")}
            uColor3={new THREE.Color("#7c3aed")}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Lensing particles */}
        <LensingParticles count={120} />

        {/* Relativistic jets */}
        <JetStream direction={1} />
        <JetStream direction={-1} />
      </group>
    );
  }
);

export default BlackHoleMesh;
