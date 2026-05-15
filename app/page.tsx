"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";

const NavBar = dynamic(() => import("@/components/ui/NavBar"), { ssr: false });
const SpaceAtmosphere = dynamic(() => import("@/components/ui/SpaceAtmosphere"), { ssr: false });
const LoadingScreen = dynamic(() => import("@/components/ui/LoadingScreen"), { ssr: false });
const HeroSection = dynamic(() => import("@/components/sections/HeroSection"), { ssr: false });

// All heavy sections are lazy-loaded after hero
const WhatIsSection      = lazy(() => import("@/components/sections/WhatIsSection"));
const FormationSection   = lazy(() => import("@/components/sections/FormationSection"));
const InteractiveSection = lazy(() => import("@/components/sections/InteractiveSection"));
const FunFactsSection    = lazy(() => import("@/components/sections/FunFactsSection"));
const QuizSection        = lazy(() => import("@/components/sections/QuizSection"));
const EndingSection      = lazy(() => import("@/components/sections/EndingSection"));

// Minimal section skeleton — no layout shift, no blank flash
function SectionSkeleton() {
  return (
    <div style={{ minHeight: 200 }} />
  );
}

export default function Home() {
  const { scrollProgress } = useScrollProgress();
  const { muted, toggleMute, triggerPulse, triggerNarration } = useAmbientAudio();

  return (
    <main className="relative" style={{ background: "#000005" }}>
      {/* Cinematic loading screen — dismisses automatically */}
      <LoadingScreen />

      {/* Scroll-reactive atmosphere overlays */}
      <SpaceAtmosphere scrollProgress={scrollProgress} />

      {/* Navigation — transparent until scroll */}
      <NavBar muted={muted} onToggleMute={toggleMute} />

      {/* Hero — full viewport, 3D canvas */}
      <HeroSection scrollProgress={scrollProgress} />

      {/* Journey sections — progressively rendered */}
      <Suspense fallback={<SectionSkeleton />}>
        <WhatIsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FormationSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <InteractiveSection triggerPulse={triggerPulse} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FunFactsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <QuizSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <EndingSection />
      </Suspense>
    </main>
  );
}
