"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/**
 * SpaceAtmosphere — a full-page cinematic overlay that reacts to scroll.
 * As the user scrolls deeper into the page:
 * - vignette darkens at edges
 * - subtle color grading shifts toward deep purple/void
 * - radial nebula glow shifts position
 *
 * Uses Framer Motion's useScroll/useTransform for native 60fps performance 
 * without triggering React renders.
 */
export default function SpaceAtmosphere() {
  const { scrollYProgress } = useScroll();

  // Vignette: darkens as user travels deeper
  const vignetteOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.45]);

  // Nebula glow position: shifts from top-center to bottom-center
  const nebulaY = useTransform(scrollYProgress, [0, 1], ["30%", "70%"]);
  const nebulaHue = useTransform(scrollYProgress, [0, 1], [270, 230]);
  const nebulaBackground = useTransform(
    () => `radial-gradient(ellipse at 50% ${nebulaY.get()}, hsla(${nebulaHue.get()},70%,30%,0.12) 0%, transparent 65%)`
  );

  // Atmospheric color shift overlay
  const gradOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.35]);

  return (
    <>
      {/* Vignette edges */}
      <motion.div
        className="journey-overlay"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,5,0.9) 100%)",
          opacity: vignetteOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Moving nebula glow */}
      <motion.div
        className="journey-overlay"
        style={{
          background: nebulaBackground,
          pointerEvents: "none",
        }}
      />

      {/* Deep space color grading */}
      <motion.div
        className="journey-overlay"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(0,0,8,0.6) 100%)",
          opacity: gradOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Film grain noise texture */}
      <div className="noise-overlay" />
    </>
  );
}
