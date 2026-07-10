"use client";

import React, { useState, useEffect, memo } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, Users, Target, X, Zap, Globe, Trophy } from "lucide-react";
import { CursorSpotlight, HeroReveal, ScrollReveal, StaggerGroup, StaggerItem, ElevatedCard, springs } from "@/components/motion/primitives";

// PERF: Dynamic import — AIDemoOverlay is ~150 lines of animation code.
// Only loaded when user clicks "Watch AI Demo". Saves ~8KB from initial bundle.
const AIDemoOverlay = dynamic(
  () => import("@/components/landing/AIDemoOverlay").then((m) => ({ default: m.AIDemoOverlay })),
  { ssr: false, loading: () => null }
);

// ── Botanical ambient orb ──────────────────────────────────────
function AmbientOrb({
  top, left, right, bottom, size, color, delay = 0,
}: {
  top?: string; left?: string; right?: string; bottom?: string;
  size: string; color: string; delay?: number;
}) {
  return (
    <div
      className={`absolute ${size} rounded-full blur-[180px] animate-breathe pointer-events-none`}
      style={{
        top, left, right, bottom,
        background: color,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// ── Feature pill — memoized (primitive props, never re-renders) ─
const FeaturePill = memo(function FeaturePill({
  icon, label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-soft glass-panel text-text-secondary text-xs font-mono">
      <span className="text-primary">{icon}</span>
      {label}
    </div>
  );
});

// ── Stat card — memoized (static data) ────────────────────────
const StatCard = memo(function StatCard({
  value, label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="font-display font-bold text-3xl text-text-primary mb-1">{value}</div>
      <div className="text-text-muted text-xs font-mono">{label}</div>
    </div>
  );
});

// ── Main ──────────────────────────────────────────────────────
export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const heroStyle = shouldReduceMotion ? {} : { y: heroY, opacity: heroOpacity };

  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeWord, setActiveWord] = useState(0);

  const cycleWords = ["Learn", "Build", "Connect", "Grow"];
  useEffect(() => {
    const t = setInterval(() => setActiveWord((w) => (w + 1) % cycleWords.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col mesh-gradient">
      {/* ── Ambient lighting ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AmbientOrb top="-20%" left="-10%" size="w-[700px] h-[700px]" color="rgba(182,222,195,0.12)" />
        <AmbientOrb bottom="-20%" right="-10%" size="w-[700px] h-[700px]" color="rgba(206,190,249,0.09)" delay={4} />
        <AmbientOrb top="40%" left="40%" size="w-[400px] h-[400px]" color="rgba(221,212,191,0.05)" delay={2} />
      </div>

      {/* ── Navigation ── */}
      <nav
        aria-label="Main navigation"
        className="relative z-50 flex items-center justify-between px-6 md:px-10 py-6 max-w-7xl mx-auto w-full"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-sage-dim flex items-center justify-center shadow-[0_0_20px_rgba(182,222,195,0.3)]">
            <Sparkles className="w-5 h-5 text-on-primary" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-text-primary">SkillSwap</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" className="hidden sm:inline-flex text-sm text-text-muted hover:text-text-primary">
              Sign In
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="default" size="default" className="text-sm px-5 py-2">
              Initialize Workspace
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main id="main-content" className="flex-1 relative z-10 flex flex-col items-center justify-center pt-16 pb-28 px-6">
        <motion.div
          style={heroStyle}
          className="max-w-5xl mx-auto text-center flex flex-col items-center"
        >
          {/* Status badge */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border-strong glass-panel mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-primary pulse-dot shadow-[0_0_10px_rgba(182,222,195,0.8)]" />
            <span className="status-mono text-primary tracking-[0.15em]">OS Version 3.0 · Live</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-semibold text-[clamp(3rem,8vw,6.5rem)] leading-[1.05] tracking-[-0.03em] text-text-primary mb-6"
          >
            The Operating System<br className="hidden md:block" />
            <span className="relative inline-block">
              {" "}for your{" "}
              <span className="text-primary">Career.</span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-text-muted max-w-2xl mb-10 leading-relaxed font-body"
          >
            Speak your intent. The AI maps the global network and connects you
            with the right peers, mentors, and opportunities — instantly.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 flex-col sm:flex-row w-full sm:w-auto"
          >
            <Link href="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-semibold">
                Start Building Free
              </Button>
            </Link>
            <Button
              size="lg"
              variant="glass"
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto h-13 px-8 text-base flex items-center gap-2.5 border-primary/30 text-primary hover:border-primary/60 hover:bg-primary/5 group"
            >
              <BrainCircuit className="w-5 h-5 group-hover:animate-pulse" />
              Watch AI Demo
            </Button>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mt-14"
          >
            <FeaturePill icon={<BrainCircuit className="w-4 h-4" />} label="Omni-Prompt Intent Engine" />
            <FeaturePill icon={<Users className="w-4 h-4" />} label="Global Peer Network" />
            <FeaturePill icon={<Target className="w-4 h-4" />} label="AI Career Coach" />
            <FeaturePill icon={<Trophy className="w-4 h-4" />} label="Hackathon Hub" />
            <FeaturePill icon={<Globe className="w-4 h-4" />} label="Investor Dealflow" />
          </motion.div>
        </motion.div>

        {/* ── Stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 w-full max-w-3xl mx-auto"
        >
          <div className="glass-panel border border-border-soft rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="4,291" label="Active Nodes" />
            <StatCard value="94%" label="Match Rate" />
            <StatCard value="8" label="AI Agents" />
            <StatCard value="∞" label="Possibilities" />
          </div>
        </motion.div>

        {/* ── How it works ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 w-full max-w-5xl mx-auto"
        >
          <h2 className="font-display font-semibold text-3xl md:text-4xl text-center text-text-primary mb-3">
            Three steps. Zero friction.
          </h2>
          <p className="text-center text-text-muted mb-12 text-base">Your career trajectory, automated.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Speak your intent",
                body: "Type what you want to learn or build. No forms, no tags — just natural language.",
                color: "text-primary",
                border: "border-primary/20",
                bg: "bg-primary/5",
              },
              {
                step: "02",
                title: "AI maps the graph",
                body: "The OS parses your intent, scans 4,000+ nodes, and identifies the perfect synergies.",
                color: "text-secondary",
                border: "border-secondary/20",
                bg: "bg-secondary/5",
              },
              {
                step: "03",
                title: "Initialize the sync",
                body: "Accept the match, open a session, and start building. Your career graph updates in real time.",
                color: "text-tertiary",
                border: "border-tertiary/20",
                bg: "bg-tertiary/5",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`glass-panel card-hover rounded-3xl p-8 border ${item.border} relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${item.bg} blur-[60px] rounded-full`} />
                <div className={`status-mono ${item.color} mb-6`}>{item.step}</div>
                <h3 className="font-display text-xl font-semibold text-text-primary mb-3">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border-soft py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-sage-dim flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-on-primary" />
            </div>
            <span className="font-body text-sm text-text-faint">SkillSwap OS © 2026</span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Ethics"].map((l) => (
              <Link key={l} href="#" className="text-xs text-text-faint hover:text-text-muted transition-colors font-body">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* ── AI Demo Overlay ── */}
      <AnimatePresence>
        {isDemoOpen && <AIDemoOverlay onClose={() => setIsDemoOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}


