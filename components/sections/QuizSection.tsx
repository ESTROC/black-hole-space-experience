"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  emoji: string;
}

const questions: Question[] = [
  {
    id: 1, emoji: "💡",
    question: "Can light escape from a black hole?",
    options: ["Yes, light always escapes", "No — not even light can escape", "Only blue light escapes", "It takes 1,000 years"],
    correct: 1,
    explanation: "Even light — traveling at 300,000 km/s — cannot escape once past the event horizon.",
  },
  {
    id: 2, emoji: "⭐",
    question: "What creates a black hole?",
    options: ["Two planets colliding", "The Sun getting too hot", "A massive star collapsing after supernova", "Asteroids gathering together"],
    correct: 2,
    explanation: "When a massive star exhausts its fuel, it collapses catastrophically — then explodes in a supernova, leaving a black hole behind.",
  },
  {
    id: 3, emoji: "☀️",
    question: "Is our Sun a star or a planet?",
    options: ["A planet like Earth", "A moon of our galaxy", "A star — it creates its own light", "A large comet"],
    correct: 2,
    explanation: "The Sun is a medium-sized star — a ball of plasma undergoing nuclear fusion, creating its own light and heat.",
  },
  {
    id: 4, emoji: "🪐",
    question: "Why do planets orbit stars?",
    options: ["Space has no friction", "Gravity curves their straight-line path into an orbit", "Stars push planets away with light", "Planets seek warmth"],
    correct: 1,
    explanation: "Planets move in a straight line but gravity curves that path — creating the perfect loop we call an orbit.",
  },
  {
    id: 5, emoji: "🌌",
    question: "What's at the center of our Milky Way?",
    options: ["Jupiter-X, a giant planet", "The hottest star known", "Sagittarius A* — a supermassive black hole", "A white hole"],
    correct: 2,
    explanation: "Sagittarius A* sits at our galaxy's core, 26,000 light-years away, with the mass of 4 million Suns.",
  },
];

const praise = ["🚀 Brilliant!", "⭐ Exactly right!", "🌟 Stellar!", "🎯 Perfect!", "🌌 Genius!"];
const hints = ["Keep exploring!", "Almost! Space is tricky.", "Great thinking!", "You'll get it!"];

export default function QuizSection() {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [msg, setMsg] = useState("");

  const q = questions[qIdx];
  const answered = selected !== null;
  const progress = (qIdx / questions.length) * 100;

  const pick = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    const ok = idx === q.correct;
    setAnswers((a) => [...a, ok]);
    if (ok) { setScore((s) => s + 1); setMsg(praise[Math.floor(Math.random() * praise.length)]); }
    else setMsg(hints[Math.floor(Math.random() * hints.length)]);
  };

  const next = () => {
    if (qIdx < questions.length - 1) { setQIdx((i) => i + 1); setSelected(null); setMsg(""); }
    else setDone(true);
  };

  const restart = () => { setQIdx(0); setSelected(null); setScore(0); setDone(false); setAnswers([]); setMsg(""); };

  const scoreColor = score / questions.length >= 0.8 ? "#fbbf24" : score / questions.length >= 0.6 ? "#c084fc" : "#06b6d4";
  const scoreLabel = score === 5 ? "Perfect! 🏆" : score >= 4 ? "Excellent! 🌟" : score >= 3 ? "Well done! 🚀" : "Keep exploring! 🔭";

  return (
    <section id="quiz" className="relative overflow-hidden" style={{ padding: "140px 0 120px" }}>
      <div className="nebula-blob" style={{
        width: 600, height: 600,
        background: "radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)",
        top: "20%", right: "0%",
      }} />

      <div className="section-container">
        {/* Chapter + headline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-chapter mb-6"
        >
          <span className="label-text">Chapter 05</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="font-cinematic gradient-text headline-glow mb-4"
          style={{ fontSize: "clamp(3rem, 5vw, 5.5rem)", lineHeight: 0.95 }}
        >
          Test Your<br />Knowledge
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-white/30 text-sm mb-14"
        >
          Five questions. How deep does your space knowledge go?
        </motion.p>

        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={`q-${qIdx}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.45 }}
              >
                {/* Progress */}
                <div className="flex justify-between items-center mb-3">
                  <span className="label-text opacity-40">{qIdx + 1} / {questions.length}</span>
                  <span className="label-text opacity-40">Score {score}</span>
                </div>
                <div className="progress-bar mb-8">
                  <motion.div className="progress-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>

                {/* Question */}
                <div className="glass rounded-2xl p-7 mb-5 text-center"
                  style={{ border: "1px solid rgba(124,58,237,0.15)" }}>
                  <div className="text-4xl mb-4">{q.emoji}</div>
                  <h3 className="text-white/90 font-semibold text-lg leading-snug">{q.question}</h3>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-5">
                  {q.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => pick(idx)}
                      disabled={answered}
                      whileHover={!answered ? { x: 8 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      className={`quiz-option ${answered && idx === q.correct ? "correct" : ""} ${answered && selected === idx && idx !== q.correct ? "incorrect" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            background: answered && idx === q.correct ? "rgba(34,197,94,0.2)" : "rgba(124,58,237,0.12)",
                            border: answered && idx === q.correct ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(124,58,237,0.2)",
                            color: answered && idx === q.correct ? "#86efac" : "#c084fc",
                          }}>
                          {answered && idx === q.correct ? "✓" : answered && selected === idx ? "✗" : ["A", "B", "C", "D"][idx]}
                        </span>
                        {opt}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {answered && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className={`p-3 rounded-xl text-center text-sm font-semibold ${selected === q.correct ? "bg-green-500/10 text-green-300 border border-green-500/20" : "bg-orange-500/10 text-orange-300 border border-orange-500/20"}`}>
                        {msg}
                      </div>
                      <div className="glass rounded-xl p-4 text-sm text-white/50 leading-relaxed">
                        <span className="text-purple-300 font-semibold">💡 </span>{q.explanation}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={next}
                        className="btn-primary w-full justify-center"
                      >
                        {qIdx < questions.length - 1 ? "Next →" : "See Results 🎉"}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Result screen */
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 18 }}
                className="text-center"
              >
                <div className="glass rounded-3xl p-10" style={{ border: "1px solid rgba(124,58,237,0.2)" }}>
                  <div className="relative inline-block mb-6">
                    <svg width="110" height="110" viewBox="0 0 110 110">
                      <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                      <motion.circle
                        cx="55" cy="55" r="46"
                        fill="none" stroke={scoreColor} strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={289}
                        initial={{ strokeDashoffset: 289 }}
                        animate={{ strokeDashoffset: 289 * (1 - score / questions.length) }}
                        transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                        style={{ transform: "rotate(-90deg)", transformOrigin: "55px 55px" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{score}</span>
                      <span className="text-xs text-white/35">/{questions.length}</span>
                    </div>
                  </div>
                  <h3 className="font-cinematic text-2xl mb-2" style={{ color: scoreColor }}>{scoreLabel}</h3>
                  <p className="text-white/40 text-sm mb-7">
                    {score === 5 ? "You know the cosmos! 🌌" : "Every question you got right means one more mystery unlocked."}
                  </p>
                  <div className="flex justify-center gap-2 mb-8">
                    {answers.map((ok, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${ok ? "bg-green-400" : "bg-red-400/60"}`} title={`Q${i + 1}`} />
                    ))}
                  </div>
                  <button onClick={restart} className="btn-primary">Try Again 🚀</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
