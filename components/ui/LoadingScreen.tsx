"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progressive loading
    const steps = [
      { target: 35,  delay: 200  },
      { target: 65,  delay: 800  },
      { target: 88,  delay: 1500 },
      { target: 100, delay: 2200 },
    ];

    steps.forEach(({ target, delay }) => {
      setTimeout(() => setProgress(target), delay);
    });

    // Dismiss after content is ready
    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "#000005" }}
        >
          {/* Concentric animated rings */}
          {[80, 130, 180].map((r, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: r, height: r,
                borderColor: `rgba(124,58,237,${0.35 - i * 0.1})`,
              }}
              animate={{
                rotate: i % 2 === 0 ? 360 : -360,
                scale: [1, 1.04, 1],
              }}
              transition={{
                rotate: { duration: 6 + i * 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          ))}

          {/* Central black hole */}
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "#000000",
              boxShadow: "0 0 30px rgba(124,58,237,0.9), 0 0 60px rgba(124,58,237,0.3)",
              border: "1px solid rgba(192,132,252,0.6)",
            }}
          />

          {/* Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute mt-36 text-center"
          >
            <p className="font-cinematic text-purple-400/60 mb-4"
              style={{ fontSize: "0.55rem", letterSpacing: "0.35em" }}>
              INITIALIZING
            </p>

            {/* Progress bar */}
            <div className="w-48 h-px bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
