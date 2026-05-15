"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavBarProps {
  muted: boolean;
  onToggleMute: () => void;
}

const navLinks = [
  { label: "What Is It?", href: "what-is" },
  { label: "Formation",   href: "formation" },
  { label: "Explore",     href: "interactive" },
  { label: "Facts",       href: "facts" },
  { label: "Quiz",        href: "quiz" },
];

export default function NavBar({ muted, onToggleMute }: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // Update active section
      const sections = navLinks.map((l) => document.getElementById(l.href));
      let current = "";
      sections.forEach((sec) => {
        if (sec && window.scrollY >= sec.offsetTop - 200) {
          current = sec.id;
        }
      });
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16"
        style={{
          background: scrolled ? "rgba(0,0,5,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "none",
          transition: "background 0.5s ease, backdrop-filter 0.5s ease",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5"
        >
          <div
            className="w-7 h-7 rounded-full"
            style={{
              background: "#000",
              boxShadow: "0 0 14px rgba(124,58,237,0.9), 0 0 28px rgba(124,58,237,0.3)",
              border: "1px solid rgba(192,132,252,0.5)",
            }}
          />
          <span
            className="font-cinematic hidden sm:block"
            style={{ fontSize: "0.65rem", letterSpacing: "0.18em", color: "rgba(192,132,252,0.8)" }}
          >
            BLACK HOLE EXPLORER
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-xs transition-all duration-300"
              style={{
                color: active === link.href ? "rgba(192,132,252,0.9)" : "rgba(255,255,255,0.35)",
                fontFamily: "var(--font-space-grotesk)",
                letterSpacing: "0.04em",
                fontWeight: active === link.href ? 600 : 400,
                textShadow: active === link.href ? "0 0 12px rgba(192,132,252,0.5)" : "none",
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: muted ? "rgba(255,255,255,0.25)" : "rgba(192,132,252,0.7)",
            }}
            title={muted ? "Unmute" : "Mute"}
          >
            <span style={{ fontSize: "0.75rem" }}>{muted ? "🔇" : "🔊"}</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="text-white/50 text-xs">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 glass-dark py-6 px-8 space-y-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left py-2 text-sm"
                style={{
                  color: active === link.href ? "rgba(192,132,252,0.9)" : "rgba(255,255,255,0.4)",
                  fontFamily: "var(--font-space-grotesk)",
                }}
              >
                {link.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
