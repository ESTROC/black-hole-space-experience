"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const facts = [
  {
    id: 1,
    stat: "40,000,000,000,000,000,000",
    label: "Black holes in the observable universe",
    emoji: "🌌",
    color: "#c084fc",
    glow: "rgba(192,132,252,0.3)",
    detail: "More black holes than grains of sand on every beach on Earth.",
    wide: true,
  },
  {
    id: 2,
    stat: "TIME SLOWS",
    label: "Near the event horizon",
    emoji: "⏰",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.3)",
    detail: "Hours at the edge = thousands of years elsewhere.",
    wide: false,
  },
  {
    id: 3,
    stat: "2019",
    label: "First black hole photograph",
    emoji: "📸",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.3)",
    detail: "200 scientists. 6.5 billion solar masses. M87*.",
    wide: false,
  },
  {
    id: 4,
    stat: "BENDS LIGHT",
    label: "Gravitational lensing",
    emoji: "🔭",
    color: "#f97316",
    glow: "rgba(249,115,22,0.3)",
    detail: "Stars behind a black hole appear as rings of light around it.",
    wide: true,
  },
];

function FactCard({ fact, index }: { fact: typeof facts[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.15, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -10, scale: 1.02 }}
      className={`relative overflow-hidden cursor-default ${fact.wide ? "sm:col-span-2" : ""}`}
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${fact.glow.replace("0.3", "0.08")}, rgba(5,5,16,0.95))`
          : "rgba(10,5,25,0.6)",
        border: `1px solid ${hovered ? fact.color + "40" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 24,
        padding: fact.wide ? "44px 48px" : "44px 36px",
        transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
        boxShadow: hovered ? `0 30px 80px ${fact.glow}` : "none",
      }}
    >
      {/* Large background emoji */}
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl select-none pointer-events-none"
        style={{ opacity: hovered ? 0.12 : 0.05, transition: "opacity 0.5s", fontSize: fact.wide ? "8rem" : "6rem" }}
      >
        {fact.emoji}
      </div>

      {/* Stat */}
      <div
        className="font-cinematic mb-2"
        style={{
          fontSize: fact.wide ? "clamp(1.6rem, 4vw, 3.2rem)" : "clamp(1.8rem, 3.5vw, 2.8rem)",
          color: fact.color,
          textShadow: hovered ? `0 0 30px ${fact.glow}` : "none",
          lineHeight: 1.1,
          transition: "text-shadow 0.4s",
          wordBreak: "break-all",
        }}
      >
        {fact.stat}
      </div>

      {/* Label */}
      <p className="label-text mb-3" style={{ color: fact.color, opacity: 0.55 }}>
        {fact.label}
      </p>

      {/* Detail — only shows on hover */}
      <motion.p
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
        transition={{ duration: 0.3 }}
        className="text-white/40 text-sm"
      >
        {fact.detail}
      </motion.p>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 h-px"
        style={{ background: `linear-gradient(90deg, ${fact.color}, transparent)` }}
        animate={{ width: hovered ? "100%" : "25%" }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}

export default function FunFactsSection() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section id="facts" className="relative overflow-hidden" style={{ padding: "140px 0 120px" }}>

      {/* Multi-nebula atmosphere */}
      <div className="nebula-blob" style={{
        width: 800, height: 500,
        background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
        top: "20%", right: "-20%",
        animationDelay: "1s",
      }} />
      <div className="nebula-blob" style={{
        width: 600, height: 400,
        background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)",
        bottom: "10%", left: "-10%",
        animationDelay: "5s",
      }} />

      <div className="section-container">
        {/* Chapter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-chapter mb-6"
        >
          <span className="label-text">Chapter 04</span>
        </motion.div>

        {/* Headline — staggered for visual interest */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="font-cinematic gradient-text-plasma headline-glow"
            style={{ fontSize: "clamp(3rem, 6vw, 6rem)", lineHeight: 0.95 }}
          >
            Numbers<br />That Break<br />Your Brain
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white/30 prose-width-sm text-sm text-right md:text-right"
          >
            Hover to reveal each truth
          </motion.p>
        </div>

        {/* Magazine-style asymmetric fact grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          style={{ gridAutoRows: "minmax(180px, auto)" }}
        >
          {facts.map((fact, i) => (
            <FactCard key={fact.id} fact={fact} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
