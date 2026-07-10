"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { OSLoader } from "@/components/os/OSShared";
import { ElevatedCard, StaggerGroup, StaggerItem, AIPulse, ScrollReveal, springs } from "@/components/motion/primitives";
import {
  GraduationCap, Sparkles, BrainCircuit, CheckCircle2, Circle,
  ChevronRight, BookOpen, Target, Plus, X, Map, Trash2, ArrowRight
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  resources: string[];
}

interface Roadmap {
  _id: Id<"roadmaps">;
  title: string;
  description: string;
  targetRole?: string;
  status: "active" | "completed" | "archived";
  milestonesJson: string;
  progress: number;
  createdAt: number;
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function LearningPage() {
  const roadmaps = useQuery(api.learning.myRoadmaps) as Roadmap[] | undefined;
  const careerStats = useQuery(api.profiles.myCareerStats);
  const deleteRoadmap = useMutation(api.learning.deleteRoadmap);

  const [activeRoadmapId, setActiveRoadmapId] = useState<Id<"roadmaps"> | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    // Auto-select first active roadmap
    if (roadmaps && roadmaps.length > 0 && !activeRoadmapId) {
      const active = roadmaps.find((r) => r.status === "active") ?? roadmaps[0];
      setActiveRoadmapId(active._id);
    }
  }, [roadmaps, activeRoadmapId]);

  const activeRoadmap = roadmaps?.find((r) => r._id === activeRoadmapId);

  async function handleDelete(id: Id<"roadmaps">) {
    if (confirm("Are you sure you want to delete this roadmap?")) {
      await deleteRoadmap({ roadmapId: id });
      if (activeRoadmapId === id) setActiveRoadmapId(null);
    }
  }

  if (roadmaps === undefined) return <OSLoader label="Retrieving Learning Curriculums..." />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-32">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[0%] right-[10%] w-[600px] h-[600px] bg-tertiary/10 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/8 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        {/* Header */}
        <LearningHeader onGenerate={() => setShowGenerateModal(true)} hasRoadmaps={(roadmaps?.length ?? 0) > 0} />

        <div className="mt-10 grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-8 items-start">
          {/* Sidebar: Roadmap List */}
          <div className="space-y-4">
            <div className="text-xs font-mono text-text-faint uppercase tracking-widest mb-2 px-1">Your Roadmaps</div>
            {!roadmaps ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-24 bg-surface/50 rounded-2xl" />)}
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="glass-panel rounded-2xl p-6 text-center border-border-soft">
                <Map className="w-8 h-8 text-text-faint mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-4">No roadmaps yet.</p>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="px-4 py-2 rounded-xl bg-tertiary/10 text-tertiary text-sm font-medium hover:bg-tertiary/20 transition-all w-full"
                >
                  Generate First Roadmap
                </button>
              </div>
            ) : (
              roadmaps.map((r) => (
                <RoadmapCard
                  key={r._id}
                  roadmap={r}
                  isActive={r._id === activeRoadmapId}
                  onClick={() => setActiveRoadmapId(r._id)}
                  onDelete={() => handleDelete(r._id)}
                />
              ))
            )}
          </div>

          {/* Main: Active Roadmap Details */}
          <AnimatePresence mode="wait">
            {activeRoadmap ? (
              <motion.div
                key={activeRoadmap._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <RoadmapDetail roadmap={activeRoadmap} />
              </motion.div>
            ) : roadmaps && roadmaps.length > 0 ? (
              <div className="glass-panel rounded-3xl p-16 flex items-center justify-center border-border-soft h-[600px]">
                <p className="text-text-faint font-mono">Select a roadmap to view details.</p>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showGenerateModal && (
          <GenerateRoadmapModal
            onClose={() => setShowGenerateModal(false)}
            careerContext={careerStats}
            onGenerated={(id: any) => {
              setActiveRoadmapId(id);
              setShowGenerateModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────
function LearningHeader({ onGenerate, hasRoadmaps }: { onGenerate: () => void; hasRoadmaps: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-tertiary/20 border border-tertiary/30 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-tertiary" />
          </div>
          <span className="font-mono text-xs text-tertiary uppercase tracking-widest">Learning OS</span>
        </div>
        <h1 className="font-display text-5xl font-bold text-white leading-tight">
          Master Your <span className="bg-gradient-to-r from-tertiary via-secondary to-primary bg-clip-text text-transparent">Craft</span>
        </h1>
      </div>

      {hasRoadmaps && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onGenerate}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-background text-sm font-bold shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" /> Generate New Path
        </motion.button>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sidebar Card
// ─────────────────────────────────────────────────────────────
function RoadmapCard({ roadmap, isActive, onClick, onDelete }: { roadmap: Roadmap; isActive: boolean; onClick: () => void; onDelete: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`relative group p-5 rounded-2xl cursor-pointer transition-all border ${
        isActive
          ? "bg-tertiary/10 border-tertiary/30 shadow-[0_0_30px_rgba(251,191,36,0.1)]"
          : "bg-surface/20 border-border-soft hover:bg-surface/40 hover:border-border-strong"
      }`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className={`absolute top-3 right-3 w-7 h-7 rounded-lg border border-border-strong text-text-faint hover:text-red-400 hover:border-red-400/30 flex items-center justify-center transition-all ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <h3 className={`font-display font-bold text-lg mb-1 pr-6 ${isActive ? "text-white" : "text-text-secondary group-hover:text-white"}`}>{roadmap.title}</h3>
      {roadmap.targetRole && (
        <div className="flex items-center gap-1.5 text-xs text-tertiary font-mono mb-4">
          <Target className="w-3 h-3" /> {roadmap.targetRole}
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className={isActive ? "text-tertiary" : "text-text-faint"}>Progress</span>
          <span className={isActive ? "text-white" : "text-text-secondary"}>{roadmap.progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${roadmap.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${isActive ? "bg-tertiary" : "bg-border-strong"}`}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Active Roadmap Detail
// ─────────────────────────────────────────────────────────────
function RoadmapDetail({ roadmap }: { roadmap: Roadmap }) {
  const updateMilestones = useMutation(api.learning.updateRoadmapMilestones);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    try { setMilestones(JSON.parse(roadmap.milestonesJson)); } catch { setMilestones([]); }
  }, [roadmap]);

  async function toggleMilestone(id: string) {
    const updated = milestones.map((m) => m.id === id ? { ...m, completed: !m.completed } : m);
    const completedCount = updated.filter((m) => m.completed).length;
    const progress = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
    const status = progress === 100 ? "completed" : "active";
    
    setMilestones(updated);
    await updateMilestones({
      roadmapId: roadmap._id,
      milestonesJson: JSON.stringify(updated),
      progress,
      status,
    });
  }

  return (
    <div className="glass-panel rounded-3xl border border-border-strong overflow-hidden relative">
      {/* Glow header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary via-secondary to-primary" />
      
      <div className="p-8 md:p-10 border-b border-border-soft relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-tertiary/5 blur-[80px] rounded-full pointer-events-none" />
        <h2 className="font-display text-4xl font-bold text-white mb-3">{roadmap.title}</h2>
        <p className="text-text-secondary leading-relaxed max-w-2xl">{roadmap.description}</p>
        {roadmap.progress === 100 && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Path Completed
          </div>
        )}
      </div>

      <div className="p-8 md:p-10">
        <div className="relative">
          {/* Vertical line connecting milestones */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-border-soft" />

          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div key={m.id} className="relative pl-12 group">
                {/* Node */}
                <button
                  onClick={() => toggleMilestone(m.id)}
                  className={`absolute left-[0.6rem] top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all bg-background border-2 ${
                    m.completed
                      ? "border-secondary text-secondary"
                      : "border-border-strong text-transparent hover:border-tertiary group-hover:border-tertiary/50"
                  }`}
                >
                  {m.completed ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                </button>

                <div className={`transition-all ${m.completed ? "opacity-60" : "opacity-100"}`}>
                  <h4 className={`text-lg font-bold mb-2 flex items-center gap-3 ${m.completed ? "text-text-faint line-through" : "text-white"}`}>
                    <span className="text-xs font-mono text-text-faint no-underline">STEP 0{i + 1}</span>
                    {m.title}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">{m.description}</p>
                  
                  {m.resources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {m.resources.map((res, j) => (
                        <div key={j} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/40 border border-border-soft text-xs text-text-secondary">
                          <BookOpen className="w-3.5 h-3.5 text-tertiary" /> {res}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Generate Modal
// ─────────────────────────────────────────────────────────────
function GenerateRoadmapModal({ onClose, careerContext, onGenerated }: any) {
  const createRoadmap = useMutation(api.learning.createRoadmap);
  const generateAction = useAction(api.learningAI.generateRoadmap);

  const [goal, setGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const contextStr = careerContext
    ? [
        careerContext.teachSkills.length > 0 ? `Knows: ${careerContext.teachSkills.map((s: any) => s.skill).join(", ")}` : null,
        careerContext.learnSkills.length > 0 ? `Wants to learn: ${careerContext.learnSkills.map((s: any) => s.skill).join(", ")}` : null,
      ].filter(Boolean).join(" | ")
    : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;
    setIsGenerating(true);
    setError("");

    try {
      const generated = await generateAction({ goal, context: contextStr });
      const newId = await createRoadmap({
        title: generated.title,
        description: generated.description,
        targetRole: generated.targetRole,
        milestonesJson: JSON.stringify(generated.milestones),
      });
      onGenerated(newId);
    } catch (err: any) {
      setError(err.message || "Failed to generate roadmap.");
      setIsGenerating(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-2xl"
      onClick={(e) => e.target === e.currentTarget && !isGenerating && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-xl glass-panel rounded-3xl border border-border-strong p-8 shadow-[0_60px_120px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/10 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-tertiary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Design Learning Path</h2>
          </div>
          {!isGenerating && (
            <button onClick={onClose} className="text-text-faint hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isGenerating ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="relative w-20 h-20 mb-6">
              <svg className="w-full h-full animate-spin text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-tertiary" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI is mapping your path</h3>
            <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
              Analyzing industry trends and curriculum structures to generate your custom roadmap...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">What do you want to master?</label>
              <input
                autoFocus
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Become a Senior Smart Contract Auditor"
                className="w-full bg-surface/40 border border-border-strong rounded-xl px-5 py-4 text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-tertiary text-base"
              />
            </div>

            {contextStr && (
              <div className="px-4 py-3 rounded-xl bg-tertiary/5 border border-tertiary/10">
                <p className="text-xs text-text-secondary leading-relaxed">
                  <span className="text-tertiary font-mono mb-1 block">Included Context:</span>
                  {contextStr}
                </p>
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-6 py-4 rounded-2xl border border-border-strong text-text-secondary hover:text-white hover:bg-surface/40 transition-all text-sm font-medium">Cancel</button>
              <motion.button type="submit" disabled={!goal.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex-1 py-4 rounded-2xl bg-white text-background font-bold text-base disabled:opacity-50 transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Generate Roadmap
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}


