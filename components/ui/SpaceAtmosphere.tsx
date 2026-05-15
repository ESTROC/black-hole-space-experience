"use client";

import { useEffect, useRef } from "react";

interface SpaceAtmosphereProps {
  scrollProgress: number;
}

/**
 * SpaceAtmosphere — a full-page cinematic overlay that reacts to scroll.
 * As the user scrolls deeper into the page:
 * - vignette darkens at edges
 * - subtle color grading shifts toward deep purple/void
 * - radial nebula glow shifts position
 *
 * Pure CSS + requestAnimationFrame — zero GPU cost.
 */
export default function SpaceAtmosphere({ scrollProgress }: SpaceAtmosphereProps) {
  const vignetteRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const gradRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = scrollProgress;

    // Vignette: darkens as user travels deeper (0 → 0.45 opacity)
    if (vignetteRef.current) {
      const intensity = Math.min(0.45, p * 0.55);
      vignetteRef.current.style.opacity = `${intensity}`;
    }

    // Nebula glow: shifts from top-center (hero) to bottom-center (ending)
    if (nebulaRef.current) {
      const yPos = 30 + p * 40; // 30% → 70%
      const hue = Math.round(270 - p * 40); // purple → deep blue
      nebulaRef.current.style.background =
        `radial-gradient(ellipse at 50% ${yPos}%, hsla(${hue},70%,30%,0.12) 0%, transparent 65%)`;
    }

    // Atmospheric color shift overlay
    if (gradRef.current) {
      const darkness = Math.min(0.35, p * 0.45);
      gradRef.current.style.opacity = `${darkness}`;
    }
  }, [scrollProgress]);

  return (
    <>
      {/* Vignette edges */}
      <div
        ref={vignetteRef}
        className="journey-overlay"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,5,0.9) 100%)",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* Moving nebula glow */}
      <div
        ref={nebulaRef}
        className="journey-overlay"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(90,30,180,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Deep space color grading */}
      <div
        ref={gradRef}
        className="journey-overlay"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(0,0,8,0.6) 100%)",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* Film grain noise texture */}
      <div className="noise-overlay" />
    </>
  );
}
