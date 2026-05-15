"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

// Deterministic seeded PRNG (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0xdeadbeef);
const STARS = Array.from({ length: 80 }, () => ({
  x: rand() * 100,
  y: rand() * 100,
  size: rand() * 2.5 + 0.4,
  delay: rand() * 6,
  duration: 3 + rand() * 5,
}));

const REVEAL_WORDS = ["The", "universe", "is", "waiting", "to", "be", "explored."];

function ParticleField() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={mounted ? { opacity: [0.1, 0.8, 0.1] } : { opacity: 0.1 }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function EndingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="ending"
      className="relative overflow-hidden section-fullscreen"
      style={{ minHeight: "100vh", background: "#000005" }}
    >
      <ParticleField />

      {/* Expanding galaxy glow — the "zoom away" feel */}
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: i * 200,
            height: i * 200,
            top: "50%", left: "50%",
            marginLeft: -(i * 100),
            marginTop: -(i * 100),
            borderColor: `rgba(124,58,237,${0.2 / i})`,
          }}
          animate={{ scale: [1, 1.03 + i * 0.01, 1], rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{
            scale: { duration: 5 + i * 2, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 40 + i * 20, repeat: Infinity, ease: "linear" },
          }}
        />
      ))}

      {/* Central void glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400, height: 400,
          top: "50%", left: "50%",
          marginLeft: -200, marginTop: -200,
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div ref={ref} className="relative z-10 text-center px-6 max-w-3xl">

        {/* Chapter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="section-chapter justify-center mb-12"
        >
          <span className="label-text">The Journey Continues</span>
        </motion.div>

        {/* Word-by-word cinematic reveal */}
        <h2
          className="font-cinematic mb-10"
          style={{
            fontSize: "clamp(3rem, 7vw, 7.5rem)",
            lineHeight: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: "0.3em",
            justifyContent: "center",
          }}
        >
          {REVEAL_WORDS.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className={i >= 4 ? "gradient-text" : "gradient-text-white"}
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {/* Single inspirational line */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.6, duration: 0.9 }}
          className="text-white/30 text-base leading-relaxed mb-16 prose-width mx-auto"
        >
          Every scientist started with a single question.
          Yours might change everything.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 2, duration: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="btn-primary"
          >
            Restart the Journey ↑
          </button>
          <button
            onClick={() => document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-ghost"
          >
            Take the Quiz →
          </button>
        </motion.div>

        {/* Three cosmic truths */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 2.5, duration: 1 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {[
            { emoji: "🔭", stat: "2 Trillion", text: "Galaxies in the universe" },
            { emoji: "⚫", stat: "~10^18", text: "Black holes estimated to exist" },
            { emoji: "💫", stat: "∞", text: "Questions left to answer" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6, scale: 1.03 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <div className="font-cinematic text-lg gradient-text mb-1">{item.stat}</div>
              <div className="text-white/30 text-xs">{item.text}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 3.2, duration: 1 }}
          className="label-text mt-12 opacity-20"
        >
          Made for curious young astronomers
        </motion.p>
      </div>
    </section>
  );
}
