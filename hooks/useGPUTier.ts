"use client";

import { useEffect, useRef, useState } from "react";

export type GPUTier = "low" | "medium" | "high";

interface GPUConfig {
  tier: GPUTier;
  particleCount: number;
  planetCount: number;
  dpr: [number, number];
  enableBloom: boolean;
  enableShadows: boolean;
  starCount: number;
  isMobile: boolean;
}

const CONFIGS: Record<GPUTier, Omit<GPUConfig, "isMobile">> = {
  low: {
    tier: "low",
    particleCount: 60,
    planetCount: 3,
    dpr: [1, 1],
    enableBloom: false,
    enableShadows: false,
    starCount: 800,
  },
  medium: {
    tier: "medium",
    particleCount: 140,
    planetCount: 5,
    dpr: [1, 1.5],
    enableBloom: false,
    enableShadows: false,
    starCount: 1800,
  },
  high: {
    tier: "high",
    particleCount: 240,
    planetCount: 8,
    dpr: [1, 2],
    enableBloom: true,
    enableShadows: false,
    starCount: 3000,
  },
};

function detectTier(isMobile: boolean): GPUTier {
  // Force low on mobile
  if (isMobile) return "low";

  // Check via WebGL renderer string
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") ||
        canvas.getContext("webgl")) as WebGLRenderingContext | null;

    if (!gl) return "low";

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return "medium";

    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
    const r = renderer.toLowerCase();

    // Known low-power GPUs
    if (
      r.includes("intel") ||
      r.includes("llvmpipe") ||
      r.includes("swiftshader") ||
      r.includes("software") ||
      r.includes("angle") ||
      r.includes("hd graphics") ||
      r.includes("uhd graphics")
    ) {
      return "medium";
    }

    // Dedicated GPUs
    if (
      r.includes("nvidia") ||
      r.includes("amd") ||
      r.includes("radeon") ||
      r.includes("geforce") ||
      r.includes("rtx") ||
      r.includes("gtx") ||
      r.includes("apple m")
    ) {
      return "high";
    }

    return "medium";
  } catch {
    return "medium";
  }
}

export function useGPUTier(): GPUConfig {
  const [config, setConfig] = useState<GPUConfig>({
    ...CONFIGS.medium,
    isMobile: false,
  });

  const detected = useRef(false);

  useEffect(() => {
    if (detected.current) return;
    detected.current = true;

    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;

    const tier = detectTier(isMobile);
    const cfg = CONFIGS[tier];

    // On mobile also halve particle counts further
    setConfig({
      ...cfg,
      isMobile,
      particleCount: isMobile ? Math.min(cfg.particleCount, 50) : cfg.particleCount,
      dpr: isMobile ? [1, 1] : cfg.dpr,
    });
  }, []);

  return config;
}
