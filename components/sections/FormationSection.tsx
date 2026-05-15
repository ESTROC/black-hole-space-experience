"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const stages = [
  {
    n: "01",
    emoji: "⭐",
    title: "Giant Star",
    oneLiner: "20× the mass of our Sun",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.35)",
    bg: "rgba(251,191,36,0.06)",
    border: "rgba(251,191,36,0.2)",
    detail: "Burns hydrogen for millions of years, blazing across the cosmos.",
  },
  {
    n: "02",
    emoji: "🔴",
    title: "Red Giant",
    oneLiner: "Swells to 1000× its size",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.35)",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.2)",
    detail: "When fuel runs low, the outer layers expand enormously.",
  },
  {
    n: "03",
    emoji: "💥",
    title: "Supernova",
    oneLiner: "Brighter than a galaxy",
    color: "#f97316",
    glow: "rgba(249,115,22,0.5)",
    bg: "rgba(249,115,22,0.07)",
    border: "rgba(249,115,22,0.25)",
    detail: "The core collapses and rebounds — triggering a cosmic explosion.",
  },
  {
    n: "04",
    emoji: "⚫",
    title: "Black Hole",
    oneLiner: "Born in total darkness",
    color: "#c084fc",
    glow: "rgba(192,132,252,0.45)",
    bg: "rgba(124,58,237,0.07)",
    border: "rgba(124,58,237,0.25)",
    detail: "The remaining core collapses to a singularity. Nothing escapes.",
  },
];

function StageCard({ stage, index, isActive, onClick }: {
  stage: typeof stages[0];
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.18, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      onClick={onClick}
      className="relative cursor-pointer group"
      style={{
        background: isActive ? stage.bg : "rgba(255,255,255,0.015)",
        border: `1px solid ${isActive ? stage.border : "rgba(255,255,255,0.05)"}`,
        borderRadius: 20,
        padding: "32px 28px",
        transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
        boxShadow: isActive ? `0 20px 60px ${stage.glow}` : "none",
      }}
    >
      {/* Number */}
      <div className="font-cinematic mb-4" style={{ fontSize: "0.6rem", color: stage.color, letterSpacing: "0.3em", opacity: 0.7 }}>
        {stage.n}
      </div>

      {/* Animated star icon */}
      <motion.div
        className="text-5xl mb-4"
        animate={isActive
          ? { scale: [1, 1.2, 1], filter: [`drop-shadow(0 0 8px ${stage.glow})`, `drop-shadow(0 0 20px ${stage.glow})`, `drop-shadow(0 0 8px ${stage.glow})`] }
          : { scale: 1 }
        }
        transition={{ duration: 2, repeat: Infinity }}
      >
        {stage.emoji}
      </motion.div>

      {/* Title */}
      <h3 className="font-cinematic mb-1" style={{ fontSize: "1.1rem", color: stage.color, lineHeight: 1.1 }}>
        {stage.title}
      </h3>
      <p className="label-text mb-3" style={{ color: stage.color, opacity: 0.6 }}>
        {stage.oneLiner}
      </p>

      {/* Expandable detail */}
      <motion.p
        initial={false}
        animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="text-white/45 text-sm leading-relaxed overflow-hidden"
      >
        {stage.detail}
      </motion.p>

      {/* Bottom glow bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${stage.color}, transparent)` }}
        animate={{ opacity: isActive ? 0.8 : 0.15 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

export default function FormationSection() {
  const [activeStage, setActiveStage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="formation" className="relative overflow-hidden" style={{ padding: "120px 0 140px" }}>

      {/* Nebula */}
      <div className="nebula-blob" style={{
        width: 700, height: 500,
        background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)",
        bottom: "0%", left: "-15%",
        animationDelay: "3s",
      }} />

      <div className="section-container">
        {/* Chapter label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="section-chapter mb-6"
        >
          <span className="label-text">Chapter 02</span>
        </motion.div>

        {/* Headline — left aligned for asymmetry */}
        <div className="mb-16 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="font-cinematic gradient-text-gold headline-glow-gold"
            style={{ fontSize: "clamp(3rem, 6vw, 6.5rem)", lineHeight: 0.95 }}
          >
            Birth of<br />Darkness
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white/35 mt-5 prose-width-sm"
            style={{ fontSize: "0.85rem", letterSpacing: "0.05em" }}
          >
            A star&apos;s death is the universe&apos;s most violent event — 
            and the most creative.
          </motion.p>
        </div>

        {/* Interactive stage cards */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage, i) => (
            <StageCard
              key={stage.n}
              stage={stage}
              index={i}
              isActive={activeStage === i}
              onClick={() => setActiveStage(i)}
            />
          ))}
        </div>

        {/* Connector arrow row */}
        <div className="hidden lg:flex items-center justify-between mt-3 px-12 pointer-events-none" style={{ height: 2 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="flex-1 h-px"
              style={{ background: `linear-gradient(90deg, ${stages[i].color}40, ${stages[i + 1].color}40)` }}
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }}
            />
          ))}
        </div>

        {/* Supernova fact callout */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-14 glass rounded-2xl py-6 px-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10"
        >
          <span className="text-4xl">🌌</span>
          <p className="text-white/50 text-sm leading-relaxed text-center sm:text-left">
            Our galaxy&apos;s black hole — <span className="text-purple-300 font-semibold">Sagittarius A*</span> — 
            is <span className="text-white/80">4 million</span> times heavier than our Sun.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
