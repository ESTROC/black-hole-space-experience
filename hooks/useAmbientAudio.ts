"use client";

import { useRef, useCallback, useEffect, useState } from "react";

/**
 * useAmbientAudio — Cinematic deep-space ambient drone
 *
 * Generates a layered ambient soundscape using Web Audio API:
 * - Sub-bass drone (40Hz) — the void
 * - Harmonic layer (80Hz) — depth
 * - Shimmer layer (320Hz, very soft) — cosmic texture
 * - LFO modulation on each layer for organic, breathing movement
 * - Soft noise pad (filtered) — space atmosphere
 *
 * No external audio files. Pure procedural synthesis.
 * Starts silent. Fades in when user unmutes.
 * Master volume starts at 0.4 so it's clearly audible.
 */

interface UseAmbientAudioReturn {
  muted: boolean;
  toggleMute: () => void;
  isReady: boolean;
  triggerPulse: () => void;
  triggerNarration: (text: string) => void;
}

export function useAmbientAudio(): UseAmbientAudioReturn {
  const [muted, setMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);

  // Build the audio graph on first user interaction
  const initAudio = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      ctxRef.current = ctx;

      // Master gain — starts at 0
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.connect(ctx.destination);
      masterRef.current = master;

      // Create massive synthetic Reverb (Convolver)
      const createReverbBuffer = (duration = 5.0, decay = 2.5) => {
        const length = ctx.sampleRate * duration;
        const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
        for (let i = 0; i < 2; i++) {
          const channel = impulse.getChannelData(i);
          for (let j = 0; j < length; j++) {
            channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
          }
        }
        return impulse;
      };

      const convolver = ctx.createConvolver();
      convolver.buffer = createReverbBuffer();

      // Master low-pass filter to make it sound distant and dark
      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = "lowpass";
      masterFilter.frequency.value = 600; // Keep it deep and mysterious
      masterFilter.Q.value = 1.0;

      // Connect: Oscillators -> Convolver -> MasterFilter -> Master
      convolver.connect(masterFilter);
      masterFilter.connect(master);

      // We mix some dry signal too
      const dryGain = ctx.createGain();
      dryGain.gain.value = 0.3;
      dryGain.connect(masterFilter);

      // Helper: create a sine oscillator + gain that breathes
      const makeBreathingOsc = (freq: number, gainVal: number, lfoRate: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        // Amplitude LFO for "breathing" effect
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = lfoRate;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = gainVal * 0.4; // Modulation depth
        lfo.connect(lfoGain);

        // Base gain
        g.gain.value = gainVal * 0.6;
        lfoGain.connect(g.gain);

        osc.connect(g);

        // Split to wet and dry
        g.connect(convolver);
        g.connect(dryGain);

        osc.start();
        lfo.start();
      };

      // Cinematic C-Minor Chord Cluster (Interstellar style)
      makeBreathingOsc(65.41, 0.5, 0.05);   // C2 (Root)
      makeBreathingOsc(66.00, 0.4, 0.06);   // Detuned C2 (Creates beating)
      makeBreathingOsc(98.00, 0.3, 0.04);   // G2 (Fifth)
      makeBreathingOsc(155.56, 0.25, 0.07); // Eb3 (Minor Third - moody)
      makeBreathingOsc(261.63, 0.15, 0.03); // C4 (Octave)
      makeBreathingOsc(523.25, 0.05, 0.09); // C5 (Ethereal shimmer)

      // Space wind (filtered noise)
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        // Brown noise approximation
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Compensate for gain
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = "bandpass";
      windFilter.frequency.value = 400;
      windFilter.Q.value = 0.5;

      const windGain = ctx.createGain();
      windGain.gain.value = 0.8;

      noiseSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(convolver); // Wind goes strictly into reverb
      noiseSource.start();

      setIsReady(true);
    } catch {
      // Audio not supported — fail silently
    }
  }, []);

  // Fade master gain in/out smoothly
  const fadeGain = useCallback((targetGain: number, duration = 2.5) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + duration);
  }, []);

  // Trigger a cinematic gravity pulse (low freq sweep)
  const triggerPulse = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master || muted) return;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.2);

    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(filter);
    filter.connect(g);
    g.connect(master);

    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  }, [muted]);

  // Cinematic Narration using Web Speech API
  const triggerNarration = useCallback((text: string) => {
    if (muted || typeof window === "undefined") return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Try to find a "deep/documentary" sounding voice
    const preferredVoice = voices.find(v =>
      v.name.includes("Google US English") ||
      v.name.includes("Male") ||
      v.name.includes("Premium")
    ) || voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.pitch = 0.85; // Lower pitch for "mysterious" feel
    utterance.rate = 0.85;  // Slower pace for "cinematic" feel
    utterance.volume = 1.0; // Max volume

    window.speechSynthesis.speak(utterance);
  }, [muted]);

  const toggleMute = useCallback(() => {
    // Init on first click (autoplay policy)
    if (!startedRef.current) {
      initAudio();
      // After init, unmute with fade
      setTimeout(() => {
        setMuted(false);
        fadeGain(0.8, 3.5); // Increased to 0.8
        // Opening narration
        triggerNarration("Far beyond our world... hidden in the darkness of space... lie the most mysterious objects in the universe... black holes.");
      }, 100);
      return;
    }

    if (ctxRef.current?.state === "suspended") {
      ctxRef.current.resume();
    }

    setMuted((prev) => {
      const nextMuted = !prev;
      if (nextMuted) window.speechSynthesis.cancel();
      fadeGain(nextMuted ? 0 : 0.8, 2.0); // Increased to 0.8
      return nextMuted;
    });
  }, [initAudio, fadeGain, triggerNarration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ctxRef.current?.close();
      window.speechSynthesis.cancel();
    };
  }, []);

  return { muted, toggleMute, isReady, triggerPulse, triggerNarration };
}
