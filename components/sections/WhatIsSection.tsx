"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Animated SVG spacetime distortion
function SpacetimeWarp() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full h-full"
      style={{ overflow: "visible" }}
    >
      {/* Spacetime grid — warped toward center */}
      {Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const y = 30 + t * 340;
        const dip = 90 * Math.exp(-Math.pow((t - 0.5) / 0.28, 2));
        return (
          <motion.path
            key={`h-${i}`}
            d={`M 30 ${y} Q 200 ${y + dip} 370 ${y}`}
            fill="none"
            stroke={`rgba(124,58,237,${0.15 + (1 - Math.abs(t - 0.5) * 2) * 0.25})`}
            strokeWidth="0.8"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 1.2, ease: "easeOut" }}
          />
        );
      })}
      {Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const x = 30 + t * 340;
        const dip = 80 * Math.exp(-Math.pow((t - 0.5) / 0.28, 2));
        return (
          <motion.path
            key={`v-${i}`}
            d={`M ${x} 30 Q ${x + (t > 0.5 ? 1 : -1) * dip * 0.15} 200 ${x} 370`}
            fill="none"
            stroke={`rgba(192,132,252,${0.08 + (1 - Math.abs(t - 0.5) * 2) * 0.15})`}
            strokeWidth="0.6"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.04, duration: 1.2, ease: "easeOut" }}
          />
        );
      })}

      {/* Event horizon */}
      <motion.circle
        cx="200" cy="200" r="28"
        fill="black"
        initial={{ r: 0 }}
        whileInView={{ r: 28 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4, duration: 0.6, type: "spring", damping: 12 }}
      />
      {/* Photon sphere glow */}
      <motion.circle
        cx="200" cy="200" r="32"
        fill="none"
        stroke="rgba(192,132,252,0.85)"
        strokeWidth="1.5"
        initial={{ opacity: 0, r: 20 }}
        whileInView={{ opacity: 1, r: 32 }}
        viewport={{ once: true }}
        transition={{ delay: 1.6, duration: 0.5 }}
      />
      {/* Accretion disk (ellipse) */}
      <motion.ellipse
        cx="200" cy="200" rx="60" ry="10"
        fill="none"
        stroke="rgba(249,115,22,0.5)"
        strokeWidth="4"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.8, duration: 0.8 }}
        style={{ transformOrigin: "200px 200px" }}
      />
      {/* Orbiting dot */}
      <motion.circle
        r="5"
        fill="#fbbf24"
        filter="url(#glow)"
        animate={{
          cx: [270, 200, 130, 200, 270],
          cy: [200, 160, 200, 240, 200],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export default function WhatIsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="what-is" className="relative overflow-hidden" style={{ padding: "160px 0 120px" }}>

      {/* Nebula blob */}
      <div className="nebula-blob" style={{
        width: 600, height: 600,
        background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
        top: "10%", right: "-10%",
        animationDelay: "0s",
      }} />

      <div className="section-container">

        {/* Chapter label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-chapter mb-14"
        >
          <span className="label-text">Chapter 01</span>
        </motion.div>

        {/* Asymmetric two-column: visual left, text right */}
        <div ref={ref} className="grid md:grid-cols-[1.1fr_0.9fr] gap-16 md:gap-24 items-center">

          {/* LEFT: Spacetime warp visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            <div className="relative w-full" style={{ maxWidth: 400, aspectRatio: "1/1" }}>
              <SpacetimeWarp />
              {/* Center glow behind the SVG */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: -1 }}>
                <div style={{
                  width: 200, height: 200,
                  background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
                  filter: "blur(30px)",
                }} />
              </div>
            </div>
            <p className="label-text mt-4 text-center" style={{ opacity: 0.3 }}>
              Spacetime curvature simulation
            </p>
          </motion.div>

          {/* RIGHT: Minimal text */}
          <div className="space-y-10">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
              className="font-cinematic gradient-text headline-glow"
              style={{ fontSize: "clamp(2.8rem, 5vw, 5.5rem)", lineHeight: 1 }}
            >
              What is a<br />Black Hole?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-white/45 leading-relaxed prose-width"
              style={{ fontSize: "1.05rem" }}
            >
              A region where gravity is so extreme — so impossibly strong — 
              that <em className="text-white/75 not-italic">nothing can escape</em>. 
              Not even light.
            </motion.p>

            {/* Three concept pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-3"
            >
              {[
                { icon: "🌀", text: "Gravity so strong, space itself bends" },
                { icon: "💡", text: "Light travels at 300,000 km/s — still too slow" },
                { icon: "⏱", text: "Time slows down the closer you get" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.7 + i * 0.15, duration: 0.6 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-white/55 text-sm">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Full-width atmospheric quote */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
          className="mt-24 text-center"
        >
          <blockquote
            className="font-cinematic gradient-text-white headline-glow-white"
            style={{ fontSize: "clamp(1.4rem, 3.5vw, 3rem)", lineHeight: 1.2, opacity: 0.6 }}
          >
            "The darkness that devours light."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
