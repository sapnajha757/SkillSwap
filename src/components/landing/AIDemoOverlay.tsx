"use client";

// This component is dynamically imported — it is NOT included in the initial
// page bundle. It only loads when the user clicks "Watch AI Demo".
// Bundle savings: ~12 KB (150 lines of animation-heavy JSX).

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AIDemoOverlay({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 2000),
      setTimeout(() => setStage(2), 4200),
      setTimeout(() => setStage(3), 7000),
      setTimeout(() => setStage(4), 9500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="AI Demo"
    >
      <button
        onClick={onClose}
        aria-label="Close demo"
        className="absolute top-8 right-8 p-2 text-text-faint hover:text-text-primary transition-colors z-50 rounded-xl hover:bg-surface-container"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Stage label */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 status-mono text-text-faint" aria-live="polite">
        {["Input", "Parsing", "Scanning", "Match", "Briefing"][stage]} · {stage + 1}/5
      </div>

      <div className="w-full max-w-4xl relative h-[600px] flex items-center justify-center px-6">
        {/* Stage 0: User types intent */}
        <AnimatePresence>
          {stage === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -40, filter: "blur(16px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="status-mono text-text-faint mb-6">User Input</div>
              <p className="font-display font-semibold text-4xl md:text-5xl text-text-primary leading-tight max-w-2xl">
                &ldquo;I want to build a full-stack SaaS.{" "}
                <span className="text-text-muted">I can teach advanced Python.&rdquo;</span>
              </p>
              <div className="mt-8 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary pulse-dot" aria-hidden="true" />
                <span className="status-mono text-primary">Omni-Prompt receiving intent...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 1 & 2: Parsing + scanning */}
        <AnimatePresence>
          {(stage === 1 || stage === 2) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(24px)" }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-primary/10 border-2 border-primary/50 shadow-[0_0_60px_rgba(182,222,195,0.3)] flex items-center justify-center">
                  <BrainCircuit className="w-10 h-10 text-primary animate-pulse" aria-hidden="true" />
                </div>
                {stage === 2 && [1, 2].map((r) => (
                  <motion.div
                    key={r}
                    className="absolute rounded-full border border-primary/30"
                    animate={{ width: [112, 500], height: [112, 500], opacity: [0.8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: (r - 1) * 1.25, ease: "easeOut" }}
                    aria-hidden="true"
                  />
                ))}
                {stage === 2 && [
                  { top: "10%", left: "15%" }, { top: "75%", left: "20%" },
                  { top: "15%", right: "15%" }, { top: "70%", right: "20%" },
                  { top: "45%", left: "5%" }, { top: "45%", right: "5%" },
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.7 }}
                    transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute w-10 h-10 rounded-full bg-surface-container border border-border-soft"
                    style={pos}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <div className="mt-12 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" aria-hidden="true" />
                <span className="status-mono text-primary" aria-live="polite">
                  {stage === 1 ? "Extracting skill vectors..." : "Traversing 4,291 active nodes..."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 3: Connection established */}
        <AnimatePresence>
          {stage === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex items-center gap-0 w-full max-w-lg relative">
                <div className="w-24 h-24 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center shadow-[0_0_40px_rgba(182,222,195,0.3)] flex-shrink-0 z-10">
                  <span className="font-mono text-sm text-primary font-bold">YOU</span>
                </div>
                <div className="flex-1 relative h-0.5 bg-gradient-to-r from-primary/40 via-primary to-secondary/40 mx-0">
                  <svg className="absolute inset-0 w-full h-24 -top-12 pointer-events-none" overflow="visible" aria-hidden="true">
                    <motion.circle
                      cx="0%" cy="50%" r="6" fill="white"
                      style={{ filter: "drop-shadow(0 0 8px rgba(182,222,195,0.8))" }}
                      animate={{ cx: ["0%", "100%"] }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </svg>
                </div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 300, damping: 20 }}
                  className="w-24 h-24 rounded-full bg-secondary/15 border-2 border-secondary flex items-center justify-center shadow-[0_0_40px_rgba(206,190,249,0.3)] flex-shrink-0 z-10"
                >
                  <span className="font-mono text-sm text-secondary font-bold">PEER</span>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="absolute bottom-16 status-mono text-primary bg-primary/10 px-6 py-2 rounded-full border border-primary/30"
                aria-live="polite"
              >
                Synergy Matrix Locked · 98.4%
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 4: Match Briefing card */}
        <AnimatePresence>
          {stage >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="glass-panel-high w-full max-w-xl p-10 relative"
            >
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" aria-hidden="true" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-secondary/15 border-2 border-secondary/50 flex items-center justify-center shadow-[0_0_30px_rgba(206,190,249,0.25)]">
                  <Users className="w-6 h-6 text-secondary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-text-primary">Elena R.</h3>
                  <p className="status-mono text-secondary mt-1">98.4% Vector Synergy</p>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-surface-container border border-border-soft relative overflow-hidden mb-8">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-secondary" aria-hidden="true" />
                <div className="flex items-center gap-2 mb-3">
                  <BrainCircuit className="w-4 h-4 text-secondary" aria-hidden="true" />
                  <span className="status-mono text-text-faint">AI Reasoning Briefing</span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  &ldquo;Elena is building a SaaS and needs React state management — exactly what you want to learn.
                  Her Data Science background is a perfect match for your advanced Python curriculum.&rdquo;
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12" onClick={onClose}>Dismiss</Button>
                <Button variant="default" className="flex-[2] h-12 font-bold" onClick={onClose}>
                  Initialize Sync →
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
