"use client";

import { useCallback, useRef, useState } from "react";

type SoundType = "hover" | "correct" | "incorrect" | "whoosh" | "ambient";

// Tiny procedural sound generator using Web Audio API
// No external audio files needed!
function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.1
) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  osc.type = type;

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useSound() {
  const [muted, setMuted] = useState(true); // Muted by default
  const audioCtxRef = useRef<AudioContext | null>(null);

  const ensureContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext();
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const play = useCallback(
    (type: SoundType) => {
      if (muted) return;
      const ctx = ensureContext();
      if (!ctx) return;

      switch (type) {
        case "hover":
          playTone(ctx, 440, 0.1, "sine", 0.05);
          break;
        case "correct":
          playTone(ctx, 523, 0.15, "sine", 0.12);
          setTimeout(() => playTone(ctx, 659, 0.15, "sine", 0.12), 150);
          setTimeout(() => playTone(ctx, 784, 0.3, "sine", 0.1), 300);
          break;
        case "incorrect":
          playTone(ctx, 220, 0.3, "sawtooth", 0.06);
          break;
        case "whoosh":
          // Filtered noise sweep for whoosh effect
          playTone(ctx, 200, 0.5, "triangle", 0.08);
          break;
        case "ambient":
          // Deep space hum
          playTone(ctx, 60, 2, "sine", 0.03);
          playTone(ctx, 120, 2, "sine", 0.02);
          break;
      }
    },
    [muted, ensureContext]
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
    ensureContext();
  }, [ensureContext]);

  return { play, muted, toggleMute };
}
