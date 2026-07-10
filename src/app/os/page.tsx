"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Sparkles, CornerDownLeft, BrainCircuit, LogOut,
  Users, X, Zap, BookOpen, Target, PanelLeftOpen
} from "lucide-react";
import { OSLoader } from "@/components/os/OSShared";
import { AIPulse, springs } from "@/components/motion/primitives";
// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface CanvasNode {
  id: string;
  label: string;
  intentType: "teach" | "learn";
  x: number;
  y: number;
  phase: number;
}

interface Match {
  _id: Id<"matches">;
  compatibilityScore: number;
  aiReasoning: string;
  status: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function seededPosition(seed: string, index: number) {
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const x = 10 + ((hash * (index + 3)) % 70);
  const y = 15 + ((hash * (index + 7)) % 60);
  return { x, y };
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function OSWorkspace() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

  // PERF: useCallback prevents new function reference on every spotlight re-render
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [shouldReduceMotion]);

  // Convex queries & mutations
  const myPosts = useQuery(api.skillPosts.myPosts);
  const myMatches = useQuery(api.matches.myMatches);
  const openPosts = useQuery(api.skillPosts.listOpenPosts);
  const createPost = useMutation(api.skillPosts.createPost);

  // Local state
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Build canvas nodes from posts
  useEffect(() => {
    if (!myPosts) return;
    const next: CanvasNode[] = myPosts.map((post: any, i: number) => {
      const pos = seededPosition(post._id, i);
      return {
        id: post._id,
        label: post.skill,
        intentType: post.type,
        x: pos.x,
        y: pos.y,
        phase: Math.random() * Math.PI * 2,
      };
    });
    setNodes(next);
  }, [myPosts]);

  // Loading screen
  if (myPosts === undefined) {
    return <OSLoader label="Resolving Spatial Coordinates..." />;
  }

  // Parse intent and create post
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;
    setIsProcessing(true);

    try {
      // Stage 1: Parse intent
      setProcessingStage("Parsing intent vectors...");
      await new Promise((r) => setTimeout(r, 800));

      // Stage 2: Determine type from natural language
      const lower = prompt.toLowerCase();
      const isTeach =
        lower.includes("teach") || lower.includes("can ") || lower.includes("know ") || lower.includes("expert");
      const type: "teach" | "learn" = isTeach ? "teach" : "learn";

      // Extract skill keyword (simplified NLP)
      const skill =
        prompt
          .replace(/i (want to|can|know how to|am learning|am studying|need help with|teach|learn|expert in)/gi, "")
          .replace(/\b(please|help|me|how|to|the|a|an)\b/gi, "")
          .trim()
          .split(/[,.]|and/)[0]
          .trim() || prompt.trim();

      setProcessingStage("Registering intent node...");
      await new Promise((r) => setTimeout(r, 600));

      await createPost({
        type,
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        description: prompt,
      });

      setPrompt("");
      setProcessingStage("Scanning network...");
      await new Promise((r) => setTimeout(r, 800));
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
      inputRef.current?.focus();
    }
  }

  const proposedMatches = myMatches?.filter((m: any) => m.status === "proposed") ?? [];

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="h-screen w-screen bg-background relative overflow-hidden select-none spotlight-container"
    >
      <div 
        className="spotlight-glow" 
        style={{ left: spotlightPos.x, top: spotlightPos.y }} 
      />
      {/* ── Ambient Lighting ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-primary/10 blur-[180px] rounded-full animate-breathe" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/8 blur-[180px] rounded-full animate-breathe" style={{ animationDelay: "5s" }} />
      </div>

      {/* ── OS Status Bar ── */}
      <header className="absolute top-0 w-full h-12 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-faint hover:text-white hover:bg-surface transition-colors"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-border-soft" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs text-text-faint tracking-widest uppercase">
              SkillSwap Kernel v3.0
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {proposedMatches.length > 0 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSelectedMatch(proposedMatches[0] as Match)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-mono uppercase tracking-wide hover:bg-secondary/20 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              {proposedMatches.length} Match{proposedMatches.length > 1 ? "es" : ""} Found
            </motion.button>
          )}
          <div className="flex items-center gap-2 font-mono text-xs text-text-faint">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Nominal
          </div>
          <button
            onClick={async () => { await signOut(); router.replace("/"); }}
            className="text-text-faint hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Spatial Canvas ── */}
      <div className="absolute inset-0 z-0 pt-12">
        <CanvasNetwork nodes={nodes} matches={myMatches ?? []} onSelectMatch={setSelectedMatch} />
      </div>

      {/* ── Omni-Prompt (Centered) ── */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl px-6 pointer-events-auto"
        >
          {/* Omni-Prompt */}
          <form onSubmit={handleSubmit}>
            <div className={`relative group rounded-3xl bg-surface-container-low/60 backdrop-blur-3xl transition-all duration-500 ${
              isProcessing
                ? "border border-primary/60 shadow-[0_0_60px_rgba(182,222,195,0.2)]"
                : "border border-border-strong hover:border-primary/30 hover:shadow-[0_0_40px_rgba(182,222,195,0.08)]"
            }`}>
              {/* Animated glow gradient follows cursor (CSS only approximation) */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* AI Scan Effect line */}
              {isProcessing && !shouldReduceMotion && (
                <motion.div
                  initial={{ y: "0%" }}
                  animate={{ y: "100%" }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent pointer-events-none"
                  style={{ willChange: "transform" }}
                />
              )}

              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isProcessing}
                placeholder="What do you want to learn or build today?"
                autoFocus
                className="w-full h-20 bg-transparent px-7 text-xl font-display font-medium text-white placeholder:text-text-faint focus:outline-none disabled:opacity-50 pr-20"
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <motion.button
                  type="submit"
                  disabled={isProcessing || !prompt.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-30 disabled:bg-surface-container disabled:text-text-faint transition-all shadow-[0_2px_20px_rgba(182,222,195,0.25)]"
                >
                  {isProcessing
                    ? <BrainCircuit className="w-5 h-5 animate-pulse text-primary" />
                    : <CornerDownLeft className="w-5 h-5" />
                  }
                </motion.button>
              </div>
            </div>
          </form>

          {/* Processing state */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={springs.gentle}
                className="mt-4 flex items-center justify-center gap-3 text-xs font-mono text-primary"
              >
                <AIPulse isActive size={16} />
                {processingStage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hints */}
          {!isProcessing && !prompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-5 flex items-center justify-center gap-6 text-xs font-mono text-text-faint"
            >
              <span>Try: "I want to master React"</span>
              <span className="text-border-strong">·</span>
              <span>"I can teach advanced Python"</span>
              <span className="text-border-strong">·</span>
              <span>"Help me build a SaaS"</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Contextual Sidebar ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <ContextualSidebar
            posts={myPosts ?? []}
            openPosts={openPosts ?? []}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Match Briefing Modal ── */}
      <AnimatePresence>
        {selectedMatch && (
          <MatchBriefing
            match={selectedMatch}
            onClose={() => setSelectedMatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Canvas Network
// PERF: The original implementation used useAnimationFrame + setState
// which caused 60 full React re-renders per second. This version updates
// DOM elements directly via refs, bypassing React's reconciler entirely.
// Re-renders: 60/sec → 0/sec for animation. React only re-renders on
// data changes (nodes/matches from Convex).
// ─────────────────────────────────────────────────────────────
const CanvasNetwork = React.memo(function CanvasNetwork({
  nodes,
  matches,
  onSelectMatch,
}: {
  nodes: CanvasNode[];
  matches: any[];
  onSelectMatch: (m: any) => void;
}) {
  const t = useRef(0);
  // Refs to each node DOM element — indexed by node id
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rafRef = useRef<number | null>(null);

  // Direct DOM animation — zero React re-renders
  useEffect(() => {
    function animate(delta: number) {
      t.current = delta * 0.0003;
      nodes.forEach((n) => {
        const el = nodeRefs.current[n.id];
        if (!el) return;
        const x = Math.sin(t.current + n.phase) * 1.2;
        const y = Math.cos(t.current + n.phase * 1.3) * 1.2;
        // Direct style mutation — no React reconciliation
        el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      });
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [nodes]); // Only re-subscribe when nodes array changes

  const proposedMatches = matches.filter((m) => m.status === "proposed");

  return (
    <div className="w-full h-full relative">
      {/* SVG Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
        <defs>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b6dec3" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#cebef9" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {proposedMatches.slice(0, 5).map((_, i) => (
          <motion.line
            key={i}
            x1={`${20 + i * 15}%`} y1="50%"
            x2="50%" y2="50%"
            stroke="url(#edgeGrad)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 2, delay: i * 0.3 }}
          />
        ))}
      </svg>

      {/* Intent Nodes (User's Posts) */}
      <AnimatePresence>
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute z-10 pointer-events-auto"
            style={{
              top: `${node.y}%`,
              left: `${node.x}%`,
              // Initial transform — rAF will override from here
              transform: "translate(-50%, -50%)",
              willChange: "transform",
            }}
          >
            {/* Inner ref target for direct DOM animation */}
            <div
              ref={(el) => { nodeRefs.current[node.id] = el; }}
              style={{ transform: "translate(-50%, -50%)", position: "absolute" }}
            >
              <div
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md border cursor-default hover:scale-105 transition-transform ${
                  node.intentType === "teach"
                    ? "bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/20 hover:border-secondary/50"
                    : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${node.intentType === "teach" ? "bg-secondary" : "bg-primary"} animate-pulse`}
                />
                <span className="text-sm font-display font-medium">{node.label}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Match Orbs (Peer nodes from AI) */}
      <AnimatePresence>
        {proposedMatches.map((match, i) => (
          <motion.div
            key={match._id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -15, 0] }}
            transition={{
              scale: { type: "spring", stiffness: 300, damping: 20, delay: i * 0.2 },
              opacity: { delay: i * 0.2 },
              y: { repeat: Infinity, duration: 4 + i, ease: "easeInOut", delay: i * 0.5 },
            }}
            className="absolute z-20 pointer-events-auto cursor-pointer"
            style={{
              top: `${25 + i * 15}%`,
              right: `${10 + i * 5}%`,
              willChange: "transform",
            }}
            onClick={() => onSelectMatch(match)}
          >
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-secondary/10 animate-ping opacity-75" aria-hidden="true" />
              <div className="w-20 h-20 rounded-full bg-secondary/15 border-2 border-secondary/60 flex items-center justify-center shadow-[0_0_40px_rgba(206,190,249,0.3)] hover:shadow-[0_0_60px_rgba(206,190,249,0.5)] hover:scale-110 transition-transform">
                <span className="font-display font-bold text-secondary text-lg">
                  {match.compatibilityScore}
                </span>
              </div>
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono text-secondary/80">
                Peer Match
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// Contextual Sidebar
// PERF: React.memo prevents re-render when parent OS state changes
// (e.g. spotlight position updates) — sidebar content is stable.
// ─────────────────────────────────────────────────────────────
const ContextualSidebar = React.memo(function ContextualSidebar({
  posts,
  openPosts,
  onClose,
}: {
  posts: any[];
  openPosts: any[];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className="absolute left-0 top-12 h-[calc(100%-48px)] w-80 z-40 glass-panel border-r border-border-soft flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-soft">
        <h2 className="font-display font-semibold text-lg text-white">Nexus Overview</h2>
        <button onClick={onClose} className="text-text-faint hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-hide">
        {/* My Intents */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-text-faint uppercase tracking-widest">My Intents</span>
          </div>
          {posts.length === 0 ? (
            <p className="text-sm text-text-faint px-2">No intents yet. Use the Omni-Prompt.</p>
          ) : (
            <div className="space-y-2">
              {posts.map((p) => (
                <div
                  key={p._id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    p.type === "teach"
                      ? "border-secondary/20 bg-secondary/5 text-secondary"
                      : "border-primary/20 bg-primary/5 text-primary"
                  }`}
                >
                  {p.type === "teach" ? <BookOpen className="w-4 h-4 flex-shrink-0" /> : <Zap className="w-4 h-4 flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.skill}</p>
                    <p className="text-xs text-text-faint capitalize">{p.type} · {p.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Feed */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-2">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-xs font-mono text-text-faint uppercase tracking-widest">Live Network</span>
          </div>
          {openPosts.length === 0 ? (
            <p className="text-sm text-text-faint px-2">Network is quiet.</p>
          ) : (
            <div className="space-y-2">
              {openPosts.slice(0, 8).map((p) => (
                <div key={p._id} className="px-4 py-3 rounded-xl border border-border-soft bg-surface/30 hover:border-border-strong transition-colors">
                  <p className="text-sm text-white font-medium truncate">{p.skill}</p>
                  <p className="text-xs text-text-faint capitalize mt-0.5">{p.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────
// Match Briefing Modal
// ─────────────────────────────────────────────────────────────
function MatchBriefing({ match, onClose }: { match: Match; onClose: () => void }) {
  const respondToMatch = useMutation(api.matches.respondToMatch);
  const [pending, setPending] = useState<"accept" | "decline" | null>(null);
  const shouldReduceMotion = useReducedMotion();

  async function handleRespond(accept: boolean) {
    setPending(accept ? "accept" : "decline");
    try {
      await respondToMatch({ matchId: match._id, accept });
      onClose();
    } finally {
      setPending(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/70 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 40 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-lg glass-panel rounded-3xl p-10 border border-border-strong shadow-[0_60px_120px_-20px_rgba(0,0,0,0.9)] relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-text-faint hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/5 border border-secondary/50 flex items-center justify-center shadow-[0_0_30px_rgba(206,190,249,0.3)]">
            <Users className="text-secondary w-7 h-7" />
          </div>
          <div>
            <h3 className="text-3xl font-display font-bold text-white">Peer Match</h3>
            <p className="text-secondary font-mono text-sm mt-1">
              {match.compatibilityScore}% Vector Synergy
            </p>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="p-6 rounded-2xl bg-surface/50 border border-border-soft mb-8 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-secondary" />
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="w-4 h-4 text-secondary" />
            <span className="text-xs font-mono text-text-faint uppercase tracking-widest">
              AI Reasoning Briefing
            </span>
          </div>
          <p className="text-base text-text-primary leading-relaxed">
            "{match.aiReasoning || "This peer's skill profile creates a perfect complementary learning loop with your current trajectory."}"
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <motion.button
            whileHover={shouldReduceMotion ? {} : { scale: 1.015 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            transition={springs.snappy}
            onClick={() => handleRespond(false)}
            disabled={!!pending}
            className="flex-1 h-14 rounded-xl border border-border-strong text-text-secondary hover:text-white hover:bg-surface/50 transition-colors font-medium disabled:opacity-50"
            style={{ willChange: "transform" }}
          >
            {pending === "decline" ? "Declining..." : "Dismiss"}
          </motion.button>
          <motion.button
            whileHover={shouldReduceMotion ? {} : { scale: 1.015 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            transition={springs.snappy}
            onClick={() => handleRespond(true)}
            disabled={!!pending}
            className="flex-[2] h-14 rounded-xl bg-gradient-to-br from-primary to-sage-dim text-on-primary font-bold text-base shadow-[0_0_30px_rgba(182,222,195,0.25)] hover:shadow-[0_0_50px_rgba(182,222,195,0.4)] disabled:opacity-50 transition-shadow uppercase tracking-wide"
            style={{ willChange: "transform" }}
          >
            {pending === "accept" ? "Syncing..." : "Initialize Sync →"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
