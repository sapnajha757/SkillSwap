"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { OSLoader } from "@/components/os/OSShared";
import { StaggerGroup, StaggerItem, MorphingNumber, AIPulse, ElevatedCard, springs } from "@/components/motion/primitives";
import { 
  BarChart3, Eye, Target, Clock, TrendingUp, Sparkles, BrainCircuit, Activity 
} from "lucide-react";

export default function AnalyticsPage() {
  const seed = useMutation(api.analytics.seed);
  const data = useQuery(api.analytics.getMyAnalytics);
  const careerStats = useQuery(api.profiles.myCareerStats);
  const generateInsights = useAction(api.analyticsAI.generateInsights);

  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (data === null) seed();
  }, [data, seed]);

  // Auto-fetch AI insights on load if career stats exist
  useEffect(() => {
    let isMounted = true;
    async function fetchInsights() {
      if (!careerStats || insights || loadingInsights) return;
      setLoadingInsights(true);
      try {
        const mySkills = [
          ...(careerStats.teachSkills.map((s:any) => s.skill)),
          ...(careerStats.learnSkills.map((s:any) => s.skill))
        ];
        const res = await generateInsights({ skills: mySkills });
        if (isMounted) setInsights(res);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoadingInsights(false);
      }
    }
    fetchInsights();
    return () => { isMounted = false; };
  }, [careerStats, insights, loadingInsights, generateInsights]);

  if (data === undefined) return <OSLoader label="Retrieving Career Analytics..." />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-32">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-secondary/10 blur-[200px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-tertiary/10 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-secondary" />
            </div>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">Intelligence</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">
            Career <span className="bg-gradient-to-r from-secondary via-primary to-tertiary bg-clip-text text-transparent">Analytics</span>
          </h1>
        </motion.div>

        {/* Top KPIs */}
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StaggerItem><StatCard icon={<Eye />} title="Profile Views" value={data?.profileViews || 0} trend="+12%" color="text-tertiary" bg="bg-tertiary/10" border="border-tertiary/20" /></StaggerItem>
          <StaggerItem><StatCard icon={<Target />} title="Match Success" value={data?.matchSuccessRate || 0} suffix="%" trend="+5%" color="text-secondary" bg="bg-secondary/10" border="border-secondary/20" /></StaggerItem>
          <StaggerItem><StatCard icon={<Clock />} title="Learning Hours" value={data?.learningHours || 0} suffix="h" trend="+18%" color="text-primary" bg="bg-primary/10" border="border-primary/20" /></StaggerItem>
        </StaggerGroup>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Chart Area */}
          <div className="glass-panel rounded-3xl border border-border-strong p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-text-faint" /> Weekly Activity</h3>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {data?.weeklyActivity?.map((val: number, i: number) => {
                const max = Math.max(...data.weeklyActivity);
                const height = max === 0 ? 0 : (val / max) * 100;
                return (
                  <div key={i} className="w-full flex flex-col items-center gap-3 group">
                    <div className="w-full bg-surface/50 rounded-t-lg relative overflow-hidden h-full flex items-end">
                      <motion.div 
                        initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                        className="w-full bg-gradient-to-t from-secondary/40 to-secondary/80 rounded-t-lg group-hover:to-secondary transition-colors"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-text-faint uppercase">Day {i+1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="glass-panel rounded-3xl border border-border-strong overflow-hidden relative flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="p-6 border-b border-border-soft flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border-strong">
                <BrainCircuit className="w-4 h-4 text-secondary" />
              </div>
              <h3 className="font-display font-bold text-white">AI Market Insights</h3>
            </div>
            
            <div className="p-6 flex-1 bg-surface/20">
              {loadingInsights ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10">
                  <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-mono text-secondary animate-pulse">Analyzing skill graph...</p>
                </div>
              ) : !insights ? (
                <div className="text-center py-10 text-text-faint text-sm">Failed to load insights.</div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Market Demand Score */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface/60 border border-border-soft">
                    <div className="w-16 h-16 rounded-full border-4 border-surface flex items-center justify-center relative overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="28" cy="28" r="26" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-border-strong" />
                        <circle cx="28" cy="28" r="26" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="163.3" strokeDashoffset={163.3 - (163.3 * insights.demandScore) / 100} className="text-secondary transition-all duration-1000" />
                      </svg>
                      <span className="font-bold text-white z-10 text-sm">{insights.demandScore}</span>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-text-faint uppercase mb-1">Market Demand</div>
                      <div className="text-sm text-text-secondary leading-tight">{insights.marketTrend}</div>
                    </div>
                  </div>

                  {/* Next Skills */}
                  <div>
                    <h4 className="text-xs font-mono text-text-faint uppercase mb-3 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Recommended Next Skills</h4>
                    <div className="space-y-3">
                      {insights.nextSkillRecommendations.map((rec: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-surface/40 border border-border-soft hover:border-secondary/30 transition-colors">
                          <strong className="text-white text-sm block mb-1 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-tertiary" /> {rec.skill}</strong>
                          <p className="text-xs text-text-secondary">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Salary Outlook */}
                  <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5">
                    <h4 className="text-xs font-mono text-secondary uppercase mb-2">Salary Outlook</h4>
                    <p className="text-sm text-white/90 leading-relaxed">{insights.salaryOutlook}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, suffix = "", trend, color, bg, border }: any) {
  const numericValue = typeof value === "number" ? value : 0;
  return (
    <ElevatedCard className="glass-panel p-6 rounded-3xl border border-border-strong relative overflow-hidden group cursor-default">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[40px] opacity-50 group-hover:opacity-100 transition-opacity ${bg}`} />
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl ${bg} ${border} border flex items-center justify-center ${color}`}>
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${bg} ${color}`}>{trend}</span>
      </div>
      <h3 className="text-text-secondary text-sm font-medium mb-1">{title}</h3>
      <div className="font-display text-4xl font-bold text-white">
        <MorphingNumber value={numericValue} suffix={suffix} />
      </div>
    </ElevatedCard>
  );
}


