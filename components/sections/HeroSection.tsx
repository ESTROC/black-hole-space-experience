"use client";

import { Suspense, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import dynamic from "next/dynamic";

const BlackHoleScene = dynamic(() => import("@/components/3d/BlackHoleScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-20 h-20 rounded-full border border-purple-500/30"
        style={{ borderTopColor: "#7c3aed", animation: "rotate-slow 1.5s linear infinite" }}
      />
    </div>
  ),
});

interface HeroSectionProps {
  blackHoleScale?: number;
}

export default function HeroSection({ blackHoleScale = 1 }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "0px 0px 200px 0px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  return (
    <section ref={containerRef} id="hero" className="relative w-full overflow-hidden" style={{ height: "100svh" }}>

      {/* Full-screen 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <BlackHoleScene
            inView={isInView}
            blackHoleScale={blackHoleScale}
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* Bottom atmospheric fade */}
      <div className="absolute bottom-0 left-0 right-0 h-64 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #000005)" }} />

      {/* Side vignettes */}
      <div className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(0,0,5,0.6), transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, rgba(0,0,5,0.6), transparent)" }} />

      {/* Cinematic text */}
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
        style={{ y: textY, opacity: textOpacity }}
      >
        {/* Chapter badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="mb-10"
        >
          <span className="label-text opacity-60">An Immersive Journey</span>
        </motion.div>

        {/* Main cinematic headline */}
        <motion.h1
          initial={{ opacity: 0, y: 48, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 1.0, duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
          className="font-cinematic gradient-text headline-glow mb-6"
          style={{
            fontSize: "clamp(3.5rem, 10vw, 9rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
          }}
        >
          Black<br />Holes
        </motion.h1>

        {/* Subtitle — very short */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="text-white/35 mb-14 tracking-widest uppercase"
          style={{ fontSize: "0.7rem", letterSpacing: "0.3em", fontFamily: "var(--font-orbitron)" }}
        >
          Where gravity bends everything
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={() => document.getElementById("what-is")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary"
          >
            Begin Journey
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      >
        <div className="w-5 h-9 rounded-full border border-white/15 flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1 rounded-full bg-purple-400"
          />
        </div>
        <span className="label-text" style={{ opacity: 0.3 }}>Scroll</span>
      </motion.div>

      {/* Subtle corner accents */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none opacity-20">
        <div className="w-6 h-6 border-t border-l border-purple-500/60" />
      </div>
      <div className="absolute top-8 right-8 z-20 pointer-events-none opacity-20">
        <div className="w-6 h-6 border-t border-r border-purple-500/60" />
      </div>
      <div className="absolute bottom-8 left-8 z-20 pointer-events-none opacity-20">
        <div className="w-6 h-6 border-b border-l border-purple-500/60" />
      </div>
      <div className="absolute bottom-8 right-8 z-20 pointer-events-none opacity-20">
        <div className="w-6 h-6 border-b border-r border-purple-500/60" />
      </div>
    </section>
  );
}
