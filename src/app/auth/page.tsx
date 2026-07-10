"use client";

import React, { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, BrainCircuit, Eye, EyeOff, ArrowRight } from "lucide-react";

type Flow = "signIn" | "signUp";

// ── Botanical SVG decoration ──────────────────────────────────
function BotanicalPanel() {
  const shouldReduceMotion = useReducedMotion();

  // Spokes configuration
  const spokes = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="hidden lg:flex absolute right-0 top-0 w-[48%] h-full items-center justify-center pointer-events-none z-0 overflow-hidden">
      {/* Ambient glow with slow orbit/float */}
      <motion.div 
        animate={shouldReduceMotion ? {} : {
          x: [0, 15, -10, 0],
          y: [0, -10, 15, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px] animate-breathe" 
      />
      <motion.div 
        animate={shouldReduceMotion ? {} : {
          x: [0, -20, 15, 0],
          y: [0, 15, -10, 0]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute w-[300px] h-[300px] rounded-full bg-secondary/6 blur-[120px] animate-breathe" 
      />

      {/* Organic node graph */}
      <motion.svg
        width="480" height="480"
        viewBox="0 0 480 480"
        className="opacity-25 relative z-10"
        fill="none"
        animate={shouldReduceMotion ? {} : { rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        {/* Orbital rings — SVG Line Drawing with layout scale */}
        <motion.circle 
          cx="240" cy="240" r="160" 
          stroke="rgba(182,222,195,0.35)" strokeWidth="1" strokeDasharray="4 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
        />
        <motion.circle 
          cx="240" cy="240" r="100" 
          stroke="rgba(206,190,249,0.25)" strokeWidth="1" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.2, ease: "easeInOut" }}
        />
        <motion.circle 
          cx="240" cy="240" r="50" 
          stroke="rgba(182,222,195,0.4)" strokeWidth="1" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
        />

        {/* Spokes */}
        {spokes.map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          const r1 = 50, r2 = 160;
          const x1 = 240 + r1 * Math.cos(angle);
          const y1 = 240 + r1 * Math.sin(angle);
          const x2 = 240 + r2 * Math.cos(angle);
          const y2 = 240 + r2 * Math.sin(angle);
          return (
            <g key={i}>
              <motion.line 
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(182,222,195,0.3)" strokeWidth="1" strokeDasharray="3 6" 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.6 + i * 0.08, ease: "easeOut" }}
              />
              <motion.circle 
                cx={x2} cy={y2} r="5"
                fill="none" stroke="rgba(182,222,195,0.6)" strokeWidth="1.5" 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1.4 + i * 0.05 }}
              />
              <motion.circle 
                cx={x2} cy={y2} r="2"
                fill="rgba(182,222,195,0.5)" 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 1.6 + i * 0.05 }}
              />
            </g>
          );
        })}

        {/* Center orb */}
        <motion.circle 
          cx="240" cy="240" r="18"
          fill="rgba(182,222,195,0.1)" stroke="rgba(182,222,195,0.6)" strokeWidth="1.5" 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 180, delay: 0.8 }}
        />
        <motion.circle 
          cx="240" cy="240" r="8"
          fill="rgba(182,222,195,0.4)" 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 220, delay: 1.0 }}
        />

        {/* Mid-ring nodes */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2 + 0.3;
          const r = 100;
          const x = 240 + r * Math.cos(angle);
          const y = 240 + r * Math.sin(angle);
          return (
            <motion.circle 
              key={i} cx={x} cy={y} r="4"
              fill="rgba(206,190,249,0.5)" stroke="rgba(206,190,249,0.7)" strokeWidth="1" 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 250, damping: 12, delay: 1.8 + i * 0.1 }}
            />
          );
        })}
      </motion.svg>

      {/* Text label */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-16 right-16 text-right"
      >
        <p className="status-mono text-primary mb-1">Global Career Graph</p>
        <p className="text-xs text-text-faint font-body">4,291 active nodes</p>
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function AuthPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [flow, setFlow] = useState<Flow>("signIn");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("flow", flow);
    try {
      await signIn("password", formData);
      router.push("/os");
    } catch {
      setError(
        flow === "signIn"
          ? "Invalid credentials. Please verify your email and password."
          : "Could not create account. Please try a different email."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* ── Ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] bg-primary/10 blur-[180px] rounded-full animate-breathe" />
        <div className="absolute bottom-[-20%] left-[20%] w-[400px] h-[400px] bg-secondary/8 blur-[160px] rounded-full animate-breathe" style={{ animationDelay: "4s" }} />
      </div>

      {/* ── Botanical decorative panel (right half) ── */}
      <BotanicalPanel />

      {/* ── Left: auth form ── */}
      <div className="relative z-10 w-full lg:w-[52%] flex flex-col justify-center px-6 md:px-16 lg:px-20 py-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-16 group w-fit">
          <motion.div 
            whileHover={shouldReduceMotion ? {} : { scale: 1.08, rotate: -5 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-sage-dim flex items-center justify-center shadow-[0_0_16px_rgba(182,222,195,0.25)] group-hover:shadow-[0_0_24px_rgba(182,222,195,0.4)] transition-shadow"
          >
            <Sparkles className="w-4 h-4 text-on-primary" />
          </motion.div>
          <span className="font-display font-bold text-xl text-text-primary">SkillSwap</span>
        </Link>

        {/* Card */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md glass-panel p-8 md:p-10 border border-border-strong/45 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-lg"
        >
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <BrainCircuit className="w-4 h-4 text-primary pulse-dot" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={flow}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
                  transition={{ duration: 0.25 }}
                  className="status-mono text-primary"
                >
                  {flow === "signIn" ? "System Access" : "Node Registration"}
                </motion.span>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={flow + "-title"}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-4xl md:text-5xl font-semibold text-text-primary tracking-tight mb-3"
              >
                {flow === "signIn" ? "Welcome back." : "Create your OS."}
              </motion.h1>
            </AnimatePresence>

            <p className="text-text-muted text-base leading-relaxed font-body">
              {flow === "signIn"
                ? "Re-enter your workspace. Your career graph awaits."
                : "Join 4,291 builders growing with AI-powered career intelligence."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="status-mono text-text-faint">Email Address</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full h-13 rounded-xl border border-border-strong/60 bg-surface-container-low/40 px-5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/60 transition-all font-body glass-refract"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="status-mono text-text-faint">Password</label>
              <div className="relative">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  autoComplete={flow === "signIn" ? "current-password" : "new-password"}
                  className="w-full h-13 rounded-xl border border-border-strong/60 bg-surface-container-low/40 px-5 pr-14 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/60 transition-all font-body glass-refract"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-error font-body px-3 py-2 rounded-lg bg-error-container/10 border border-error/20 text-center">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              id="auth-submit"
              disabled={pending}
              whileHover={pending || shouldReduceMotion ? {} : { scale: 1.01, y: -0.5 }}
              whileTap={pending || shouldReduceMotion ? {} : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 600, damping: 25 }}
              className="w-full h-13 mt-1 rounded-xl bg-gradient-to-br from-primary to-sage-dim text-on-primary font-semibold text-sm flex items-center justify-center gap-3 shadow-[0_0_24px_rgba(182,222,195,0.2)] hover:shadow-[0_0_36px_rgba(182,222,195,0.35)] disabled:opacity-60 disabled:cursor-not-allowed transition-shadow cursor-pointer"
            >
              {pending ? (
                <>
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="font-mono text-xs uppercase tracking-wide">Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{flow === "signIn" ? "Access Workspace" : "Initialize OS"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="mt-8 pt-6 border-t border-border-soft text-center text-xs text-text-muted font-body">
            {flow === "signIn" ? "First time here?" : "Already have an account?"}{" "}
            <button
              type="button"
              id="auth-toggle"
              onClick={() => { setFlow(flow === "signIn" ? "signUp" : "signIn"); setError(""); }}
              className="text-primary hover:text-primary/80 font-semibold transition-colors cursor-pointer"
            >
              {flow === "signIn" ? "Create your OS" : "Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
