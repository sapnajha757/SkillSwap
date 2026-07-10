"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingOrb } from "@/components/motion/primitives";

/**
 * OSLoader — Premium botanical boot screen.
 * Used by AuthGuard and every OS sub-page during data loading.
 * Respects prefers-reduced-motion with graceful degradation.
 */
export function OSLoader({ label = "Booting Kernel..." }: { label?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Ambient orbs — GPU composited floaters */}
      <FloatingOrb
        size={600}
        color="rgba(182, 222, 195, 0.1)"
        blur={180}
        speed={22}
        className="top-[-20%] left-[-10%]"
      />
      <FloatingOrb
        size={500}
        color="rgba(206, 190, 249, 0.07)"
        blur={180}
        speed={28}
        className="bottom-[-20%] right-[-10%]"
      />

      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 relative z-10"
      >
        {/* Concentric ring loader — counter-rotating for depth */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-surface-container-high" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            style={{ willChange: "transform" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-transparent border-t-secondary/60"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            style={{ willChange: "transform" }}
          />
          {/* Inner core dot */}
          <motion.div
            className="absolute inset-[22px] rounded-full bg-primary/20"
            animate={shouldReduceMotion ? {} : { scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-text-faint uppercase tracking-[0.2em]">
            {label}
          </span>
          {/* Sequenced dots — communicates active processing */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={shouldReduceMotion ? {} : { opacity: [0.15, 1, 0.15] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                style={{ willChange: "opacity" }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * PageAmbient — Reusable ambient background lighting for OS pages.
 * Uses FloatingOrb primitives for GPU-composited motion.
 */
export function PageAmbient({
  accent1 = "primary",
  accent2 = "secondary",
}: {
  accent1?: string;
  accent2?: string;
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className={`absolute top-[-15%] right-[10%] w-[700px] h-[700px] bg-${accent1}/10 blur-[220px] rounded-full animate-breathe`} />
      <div className={`absolute bottom-[-15%] left-[-5%] w-[600px] h-[600px] bg-${accent2}/8 blur-[220px] rounded-full animate-breathe`} style={{ animationDelay: "4s" }} />
    </div>
  );
}

/**
 * PageHeader — Standardised OS page header with section label + h1 + optional subtitle.
 * Uses physics spring for entry animation.
 */
export function PageHeader({
  icon,
  label,
  title,
  titleGradient,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  titleGradient?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-surface-container border border-border-soft flex items-center justify-center">
            {icon}
          </div>
          <span className="section-label">{label}</span>
        </div>
        <h1 className="font-display text-5xl font-semibold text-text-primary leading-tight">
          {titleGradient ? (
            <>
              {title}{" "}
              <span className={`bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}>
                {titleGradient.split(" ").slice(-1)[0]}
              </span>
            </>
          ) : (
            title
          )}
        </h1>
        {subtitle && (
          <p className="text-text-muted text-base mt-2 max-w-xl leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
