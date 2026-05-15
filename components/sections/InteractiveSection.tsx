"use client";

import { Suspense, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import HandTrackingModal from "@/components/ui/HandTrackingModal";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { useGPUTier } from "@/hooks/useGPUTier";
import BlackHoleMesh, { BlackHoleMeshRef } from "@/components/3d/BlackHoleMesh";

const GravitySimulation = dynamic(
  () => import("@/components/3d/GravitySimulation"),
  { ssr: false }
);

interface InteractiveSectionProps {
  triggerPulse: () => void;
}

export default function InteractiveSection({ triggerPulse }: InteractiveSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isPinchPulsing, setIsPinchPulsing] = useState(false);
  const [mousePosState, setMousePosState] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "0px 0px 200px 0px" });
  const blackHoleRef = useRef<BlackHoleMeshRef>(null);
  const perf = useGPUTier();

  const { status, handData, start, stop } = useMediaPipe();
  const isHandActive = status === "active" && handData.isTracking;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePosState({
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const t = e.touches[0];
    setMousePosState({
      x: ((t.clientX - rect.left) / rect.width) * 2 - 1,
      y: -(((t.clientY - rect.top) / rect.height) * 2 - 1),
    });
  }, []);

  const blackHoleScale = isHandActive
    ? Math.max(0.5, Math.min(2.5, 1 + handData.z * 0.8))
    : 1;

  // Send scale to the realistic black hole mesh whenever it changes
  useEffect(() => {
    if (blackHoleRef.current) {
      blackHoleRef.current.setSize(blackHoleScale);
    }
  }, [blackHoleScale]);

  const gravCenter = isHandActive
    ? { x: (handData.x - 0.5) * 20, y: -(handData.y - 0.5) * 12 }
    : { x: mousePosState.x * 10, y: mousePosState.y * 6 };

  return (
    <section ref={sectionRef} id="interactive" className="relative" style={{ minHeight: "100vh" }}>

      {/* Pre-entry: dramatic build-up screen */}
      <AnimatePresence mode="wait">
        {!entered && (
          <motion.div
            key="pre-entry"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="section-fullscreen"
            style={{
              background: "radial-gradient(ellipse at center, rgba(10,0,25,1) 0%, #000005 100%)",
            }}
          >
            {/* Pulsing rings — build tension */}
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-purple-500/10"
                style={{
                  width: i * 160, height: i * 160,
                  top: "50%", left: "50%",
                  marginLeft: -(i * 80), marginTop: -(i * 80),
                }}
                animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}

            {/* Central black hole graphic */}
            <motion.div
              className="relative z-10 mb-12"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div style={{
                width: 120, height: 120,
                borderRadius: "50%",
                background: "#000000",
                boxShadow: "0 0 60px rgba(124,58,237,0.8), 0 0 120px rgba(124,58,237,0.3), 0 0 200px rgba(124,58,237,0.1)",
              }} />
              {/* Photon ring */}
              <div className="absolute inset-0 rounded-full border-2 border-purple-400/60"
                style={{ transform: "scale(1.12)", animation: "rotate-slow 8s linear infinite" }} />
              <div className="absolute inset-0 rounded-full border border-cyan-500/30"
                style={{ transform: "scale(1.28)", animation: "rotate-reverse 14s linear infinite" }} />
            </motion.div>

            {/* Cinematic text */}
            <div className="relative z-10 text-center px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="section-chapter justify-center mb-6"
              >
                <span className="label-text">Chapter 03</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.8, duration: 1 }}
                className="font-cinematic gradient-text headline-glow mb-4"
                style={{ fontSize: "clamp(3rem, 7vw, 7rem)", lineHeight: 0.95 }}
              >
                Bend<br />Gravity
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-white/35 mb-10 prose-width mx-auto text-center"
                style={{ fontSize: "0.9rem" }}
              >
                You control the singularity now.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setEntered(true)}
                className="btn-primary"
              >
                Enter the Gravity Zone →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Full-screen interactive simulation */}
        {entered && (
          <motion.div
            key="simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="relative"
            style={{ minHeight: "100vh" }}
          >
            {/* Top controls bar */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-5">
              {/* Back */}
              <button
                onClick={() => setEntered(false)}
                className="btn-ghost text-xs"
              >
                ← Exit
              </button>

              {/* Status + hand tracking toggle */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                  style={{
                    background: isHandActive ? "rgba(6,182,212,0.1)" : "rgba(255,255,255,0.04)",
                    border: isHandActive ? "1px solid rgba(6,182,212,0.25)" : "1px solid rgba(255,255,255,0.08)",
                    color: isHandActive ? "#67e8f9" : "rgba(255,255,255,0.35)",
                    fontFamily: "var(--font-orbitron)",
                    letterSpacing: "0.1em",
                    fontSize: "0.6rem",
                  }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isHandActive ? "bg-cyan-400 animate-pulse" : "bg-white/20"}`} />
                  {isHandActive ? "HAND ACTIVE" : "MOUSE MODE"}
                </div>

                {status !== "active" ? (
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-plasma text-xs px-4 py-2"
                  >
                    ✋ Hand Control
                  </button>
                ) : (
                  <button onClick={() => stop()} className="btn-ghost text-xs px-4 py-2">
                    Disable Cam
                  </button>
                )}
              </div>
            </div>

            {/* Gesture hints */}
            <AnimatePresence>
              {isHandActive && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-16 left-0 right-0 z-20 flex justify-center"
                >
                  <div className="glass rounded-full px-6 py-2 flex gap-6 text-xs text-white/35">
                    <span>🤏 Pinch = Pulse</span>
                    <span>🖐️ Palm = Repel</span>
                    <span>↕ Depth = Scale</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pinch pulse visual */}
            <AnimatePresence>
              {isPinchPulsing && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-cyan-400"
                    style={{ boxShadow: "0 0 40px rgba(6,182,212,0.6)" }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full-screen canvas */}
            <div
              className="absolute inset-0 cursor-crosshair"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              style={{ background: "radial-gradient(ellipse at center, #050518 0%, #000005 100%)" }}
            >
              <Canvas
                frameloop={isInView ? "always" : "never"}
                dpr={perf.dpr}
                camera={{ position: [0, 0, 18], fov: 50, near: 0.1, far: 300 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                style={{ background: "transparent" }}
              >
                <ambientLight intensity={0.04} />
                <pointLight position={[gravCenter.x, gravCenter.y, 5]} intensity={4} color="#7c3aed" distance={35} />
                <pointLight position={[0, 0, 10]} intensity={0.5} color="#06b6d4" distance={50} />

                <Suspense fallback={null}>
                  {/* Realistic central black hole */}
                  <group position={[gravCenter.x, gravCenter.y, 0]}>
                    <BlackHoleMesh ref={blackHoleRef} />
                  </group>

                  <GravitySimulation
                    particleCount={perf.particleCount}
                    handData={handData}
                    mousePosition={mousePosState}
                    isHandTracking={isHandActive}
                    isPinching={handData.isPinching}
                    onPinchDetected={() => {
                      setIsPinchPulsing(true);
                      triggerPulse();
                      setTimeout(() => setIsPinchPulsing(false), 900);
                    }}
                  />
                </Suspense>
              </Canvas>

              {/* Hand cursor overlay */}
              {isHandActive && handData.isTracking && (
                <motion.div
                  className="absolute pointer-events-none z-10"
                  style={{
                    left: `${handData.x * 100}%`,
                    top: `${handData.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.div
                    className="rounded-full border-2 border-cyan-400/80 bg-cyan-400/10"
                    animate={{
                      width: handData.isPinching ? 18 : handData.isOpenPalm ? 54 : 36,
                      height: handData.isPinching ? 18 : handData.isOpenPalm ? 54 : 36,
                      boxShadow: handData.isPinching ? "0 0 40px rgba(6,182,212,1)" : "0 0 16px rgba(6,182,212,0.4)",
                    }}
                    transition={{ duration: 0.12 }}
                  />
                </motion.div>
              )}

              {/* Corner labels */}
              <div className="absolute top-20 left-6 label-text pointer-events-none opacity-20">
                Gravity Simulator v2
              </div>
              <div className="absolute bottom-6 right-6 label-text pointer-events-none opacity-15">
                {isHandActive ? "Hand Control" : "Mouse Control"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HandTrackingModal
        isOpen={showModal}
        onAccept={async () => { await start(); setShowModal(false); }}
        onDecline={() => setShowModal(false)}
        status={status}
      />
    </section>
  );
}
