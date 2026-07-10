"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { OSLoader } from "@/components/os/OSShared";
import { ElevatedCard, StaggerGroup, StaggerItem, MorphingNumber, AIPulse, springs } from "@/components/motion/primitives";
import {
  TrendingUp, Star, Search, ShieldCheck, Briefcase, Zap, Flame, BrainCircuit, UserCheck
} from "lucide-react";

export default function InvestorPage() {
  const builders = useQuery(api.investors.discoverBuilders);
  const bookmarks = useQuery(api.investors.myBookmarks);
  const toggleBookmark = useMutation(api.investors.toggleBookmark);
  const generateThesis = useAction(api.investorsAI.generateThesis);

  const [activeBuilder, setActiveBuilder] = useState<any>(null);
  const [thesis, setThesis] = useState("");
  const [loadingThesis, setLoadingThesis] = useState(false);

  // Auto-select top builder
  useEffect(() => {
    if (builders && builders.length > 0 && !activeBuilder) {
      setActiveBuilder(builders[0]);
    }
  }, [builders, activeBuilder]);

  // Generate thesis when active builder changes
  useEffect(() => {
    let isMounted = true;
    async function fetchThesis() {
      if (!activeBuilder) return;
      setThesis("");
      setLoadingThesis(true);
      try {
        const t = await generateThesis({
          builderName: activeBuilder.name,
          skills: activeBuilder.skills,
          projects: activeBuilder.projects.map((p: any) => p.title),
        });
        if (isMounted) setThesis(t);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoadingThesis(false);
      }
    }
    fetchThesis();
    return () => { isMounted = false; };
  }, [activeBuilder, generateThesis]);

  const isBookmarked = (id: Id<"users">) => bookmarks?.some((b: any) => b.builderId === id);

  if (builders === undefined) return <OSLoader label="Retrieving Investment Pipeline..." />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-32">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[0%] left-[10%] w-[600px] h-[600px] bg-tertiary/10 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-tertiary/20 border border-tertiary/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-tertiary" />
            </div>
            <span className="font-mono text-xs text-tertiary uppercase tracking-widest">Capital / Dealflow</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">
            Discover Top <span className="bg-gradient-to-r from-tertiary via-secondary to-primary bg-clip-text text-transparent">Builders</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start h-[700px]">
          {/* Sidebar: Ranking list */}
          <div className="glass-panel rounded-3xl border border-border-strong overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-border-soft flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-lg">Global Ranking</h3>
              <div className="text-xs font-mono text-text-faint bg-surface/50 px-2 py-1 rounded">Top {builders.length}</div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {builders.length === 0 ? (
                <div className="text-center py-10 text-text-faint font-mono text-sm">No builders found.</div>
              ) : (
                builders.map((b: any, index: number) => {
                  const active = activeBuilder?.userId === b.userId;
                  return (
                    <div
                      key={b.userId}
                      onClick={() => setActiveBuilder(b)}
                      className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center gap-4 ${
                        active ? "bg-tertiary/10 border-tertiary/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]" : "bg-surface/20 border-border-soft hover:bg-surface/40 hover:border-border-strong"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${index < 3 ? "bg-tertiary/20 border-tertiary text-tertiary" : "bg-surface border-border-strong text-text-faint"}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold truncate ${active ? "text-white" : "text-text-secondary"}`}>{b.name}</h4>
                        <div className="text-xs font-mono text-text-faint truncate">{b.skills.slice(0, 2).join(", ")} {b.skills.length > 2 && "..."}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white flex items-center gap-1 justify-end"><Flame className="w-3.5 h-3.5 text-secondary" /> {b.score}</div>
                        <div className="text-[10px] uppercase font-mono text-text-faint">Score</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Content: Deep Dive */}
          <div className="glass-panel rounded-3xl border border-border-strong h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary via-secondary to-primary" />
            
            {activeBuilder ? (
              <div className="flex flex-col h-full overflow-y-auto p-8 md:p-10 relative">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-tertiary/10 blur-[100px] rounded-full pointer-events-none" />
                
                {/* Header */}
                <div className="flex items-start justify-between mb-8 relative">
                  <div>
                    <h2 className="font-display text-4xl font-bold text-white mb-2 flex items-center gap-3">
                      {activeBuilder.name}
                      <ShieldCheck className="w-6 h-6 text-secondary" />
                    </h2>
                    <p className="text-text-secondary text-lg max-w-xl">{activeBuilder.bio || "No bio provided. Let their work speak."}</p>
                  </div>
                  <button
                    onClick={() => toggleBookmark({ builderId: activeBuilder.userId })}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all ${
                      isBookmarked(activeBuilder.userId)
                        ? "bg-tertiary text-background border-tertiary shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                        : "bg-surface/50 text-white border-border-strong hover:bg-surface"
                    }`}
                  >
                    {isBookmarked(activeBuilder.userId) ? <UserCheck className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    {isBookmarked(activeBuilder.userId) ? "Tracking" : "Track Builder"}
                  </button>
                </div>

                {/* AI Thesis */}
                <div className="p-6 rounded-2xl bg-surface/40 border border-tertiary/20 mb-8 relative">
                  <div className="absolute top-4 right-4"><BrainCircuit className="w-6 h-6 text-tertiary/50" /></div>
                  <h3 className="text-xs font-mono text-tertiary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> AI Investment Thesis
                  </h3>
                  {loadingThesis ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-tertiary/20 rounded w-full" />
                      <div className="h-4 bg-tertiary/20 rounded w-5/6" />
                      <div className="h-4 bg-tertiary/20 rounded w-4/6" />
                    </div>
                  ) : (
                    <p className="text-sm text-white leading-relaxed">{thesis || "No data to analyze."}</p>
                  )}
                </div>

                {/* Stats & Skills */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-5 rounded-2xl bg-background/50 border border-border-soft">
                    <span className="text-xs font-mono text-text-faint uppercase block mb-1">Global Score</span>
                    <span className="font-display text-3xl font-bold text-white flex items-center gap-2">
                      <Flame className="w-6 h-6 text-secondary" /> {activeBuilder.score}
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl bg-background/50 border border-border-soft">
                    <span className="text-xs font-mono text-text-faint uppercase block mb-3">Core Stack</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeBuilder.skills.slice(0, 4).map((s: string) => (
                        <span key={s} className="px-2 py-1 rounded bg-surface border border-border-strong text-xs font-mono text-white">{s}</span>
                      ))}
                      {activeBuilder.skills.length === 0 && <span className="text-text-faint text-sm">None verified</span>}
                    </div>
                  </div>
                </div>

                {/* Portfolio Highlights */}
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Shipped Projects</h3>
                  <div className="space-y-3">
                    {activeBuilder.projects.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-border-strong text-text-faint text-sm text-center">No projects in portfolio.</div>
                    ) : (
                      activeBuilder.projects.map((p: any) => (
                        <div key={p._id} className="p-4 rounded-xl bg-surface/30 border border-border-soft">
                          <h4 className="font-bold text-white text-sm mb-1">{p.title}</h4>
                          <p className="text-xs text-text-secondary line-clamp-2">{p.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.techStack.map((t: string) => <span key={t} className="text-[10px] font-mono text-text-faint px-1.5 py-0.5 rounded bg-surface">{t}</span>)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-text-faint font-mono text-sm">Select a builder to view deep dive.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


