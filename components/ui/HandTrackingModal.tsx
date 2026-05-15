"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaPipeModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  status: string;
}

export default function MediaPipeModal({
  isOpen,
  onAccept,
  onDecline,
  status,
}: MediaPipeModalProps) {
  const [step, setStep] = useState<"intro" | "permission">("intro");

  const handleAccept = () => {
    setStep("permission");
    onAccept();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) onDecline();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="modal-content"
          >
            {/* Header */}
            <div className="text-center mb-6">
              {/* Animated icon */}
              <div className="relative inline-block mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-400/40 absolute inset-0"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border border-purple-500/30 absolute inset-0"
                />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-900/60 to-cyan-900/60 flex items-center justify-center border border-purple-500/20">
                  <span className="text-3xl">✋</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold gradient-text mb-2">
                Enable Gravity Control
              </h2>
              <p className="text-white/50 text-sm">
                Use your hand to control the black hole
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3 mb-6">
              {[
                { icon: "🤏", label: "Pinch", desc: "Create a gravity pulse" },
                { icon: "🖐️", label: "Open palm", desc: "Repel particles (anti-gravity)" },
                { icon: "👋", label: "Move hand", desc: "Control black hole size & gravity" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl glass">
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white/90">{f.label}</p>
                    <p className="text-xs text-white/40">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Privacy note */}
            <div className="flex items-start gap-2 mb-6 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
              <svg className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <p className="text-xs text-white/40 leading-relaxed">
                Your camera is processed <strong className="text-cyan-400">locally in your browser</strong>. No video is stored or sent anywhere.
              </p>
            </div>

            {/* Status */}
            {status === "loading" && (
              <div className="flex items-center gap-2 mb-4 text-sm text-cyan-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
                />
                Loading AI model...
              </div>
            )}
            {status === "requesting_permission" && (
              <div className="flex items-center gap-2 mb-4 text-sm text-yellow-400">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                />
                Waiting for camera permission...
              </div>
            )}
            {status === "denied" && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                Camera access was denied. You can use mouse control instead.
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onDecline}
                className="flex-1 py-3 px-4 rounded-xl glass text-sm text-white/60 hover:text-white/80 transition-colors"
              >
                Use Mouse Instead
              </button>
              <button
                onClick={handleAccept}
                disabled={status === "loading" || status === "requesting_permission" || status === "active"}
                className="flex-1 py-3 px-4 rounded-xl btn-plasma text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "active"
                  ? "✓ Active"
                  : status === "loading" || status === "requesting_permission"
                  ? "Starting..."
                  : "Enable Camera"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
