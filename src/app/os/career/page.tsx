"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { OSLoader } from "@/components/os/OSShared";
import { StaggerGroup, StaggerItem, ElevatedCard, MorphingNumber, springs } from "@/components/motion/primitives";
import {
  BookOpen, Zap, Target, Users, TrendingUp,
  BrainCircuit, Pencil, Check, X, Star, Award,
  Clock, ArrowRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Career Universe — the user's holistic career identity map
// ─────────────────────────────────────────────────────────────
export default function CareerUniversePage() {
  const stats = useQuery(api.profiles.myCareerStats);
  const profile = useQuery(api.profiles.myProfile);
  const sessions = useQuery(api.sessions.mySessions);

  if (stats === undefined || profile === undefined) return <OSLoader label="Retrieving Career Constellation..." />;

  return (
    <div className="min-h-screen bg-background pb-32 overflow-x-hidden">
      {/* Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[180px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 space-y-10">

        {/* ── Identity Header ── */}
        <IdentityHeader profile={profile} />

        {/* ── Career Stats Grid ── */}
        {stats && <StatsGrid stats={stats} />}

        {/* ── Main content: Constellation + Insights ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
          {/* Skill Constellation */}
          {stats && <SkillConstellation stats={stats} />}

          {/* AI Career Coach Panel */}
          {stats && <AICareerPanel stats={stats} sessions={sessions ?? []} />}
        </div>

        {/* ── Sessions Timeline ── */}
        {sessions && sessions.length > 0 && (
          <SessionsTimeline sessions={sessions} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Identity Header (editable profile card)
// ─────────────────────────────────────────────────────────────
function IdentityHeader({ profile }: { profile: any }) {
  const upsertProfile = useMutation(api.profiles.upsertProfile);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.profile) {
      setName(profile.profile.name ?? "");
      setBio(profile.profile.bio ?? "");
    } else if (profile?.user) {
      setName(profile.user.name ?? "");
    }
  }, [profile]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await upsertProfile({ name: name.trim(), bio: bio.trim() || undefined });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const displayName = profile?.profile?.name ?? profile?.user?.name ?? "Anonymous";
  const displayBio = profile?.profile?.bio ?? "No bio yet. Click edit to tell the OS about yourself.";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-8 border border-border-strong relative overflow-hidden"
    >
      {/* background gradient decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-start gap-6 relative">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-display font-bold text-2xl flex-shrink-0 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
          {initials || "?"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-surface/50 border border-border-strong rounded-xl px-4 py-2.5 text-xl font-display font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the AI OS about your career aspirations..."
                rows={2}
                className="w-full bg-surface/50 border border-border-strong rounded-xl px-4 py-2.5 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  Save
                </motion.button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-strong text-text-secondary hover:text-white text-sm transition-colors">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-bold text-white">{displayName}</h1>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg text-text-faint hover:text-white hover:bg-surface transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <p className="text-text-secondary text-base leading-relaxed max-w-2xl">{displayBio}</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-mono">
                  Identity Node Active
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
                  AI Tracking Career
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stats Grid
// ─────────────────────────────────────────────────────────────
function StatsGrid({ stats }: { stats: any }) {
  const items = [
    {
      icon: BookOpen,
      label: "Skills Teaching",
      value: stats.teachSkills.length,
      sub: "Active posts",
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/20",
    },
    {
      icon: Zap,
      label: "Skills Learning",
      value: stats.learnSkills.length,
      sub: "Active posts",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      icon: Users,
      label: "Peer Matches",
      value: stats.totalMatches,
      sub: `${stats.acceptedMatches} accepted`,
      color: "text-tertiary",
      bg: "bg-tertiary/10",
      border: "border-tertiary/20",
    },
    {
      icon: TrendingUp,
      label: "Avg. Synergy",
      value: stats.avgSynergy,
      suffix: stats.avgSynergy > 0 ? "%" : "",
      displayDash: stats.avgSynergy === 0,
      sub: "Across all matches",
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/20",
    },
  ];

  return (
    <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <StaggerItem key={item.label}>
            <ElevatedCard className={`glass-panel rounded-2xl p-6 border ${item.border} relative overflow-hidden cursor-default h-full`}>
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className={`text-4xl font-display font-bold ${item.color} mb-1`}>
                {(item as any).displayDash ? "—" : <MorphingNumber value={item.value} suffix={(item as any).suffix ?? ""} />}
              </div>
              <div className="text-sm font-medium text-white mb-0.5">{item.label}</div>
              <div className="text-xs text-text-faint font-mono">{item.sub}</div>
            </ElevatedCard>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}

// ─────────────────────────────────────────────────────────────
// Skill Constellation (interactive spatial visualization)
// ─────────────────────────────────────────────────────────────
function SkillConstellation({ stats }: { stats: any }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const allSkills = [
    ...stats.teachSkills.map((s: any) => ({ ...s, category: "teach" })),
    ...stats.learnSkills.map((s: any) => ({ ...s, category: "learn" })),
  ];

  if (allSkills.length === 0) {
    return (
      <div className="glass-panel rounded-3xl border border-border-strong p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-white mb-3">
          Your Constellation is Empty
        </h3>
        <p className="text-text-secondary text-base max-w-sm leading-relaxed mb-6">
          Head to the Nexus and tell the OS what you know or want to learn. Your skill nodes will appear here.
        </p>
        <a
          href="/os"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          Open Nexus <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl border border-border-strong overflow-hidden relative min-h-[460px]">
      {/* Header */}
      <div className="flex items-center justify-between p-7 pb-4 border-b border-border-soft">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">Skill Constellation</h2>
          <p className="text-text-faint text-sm font-mono mt-1">
            {stats.teachSkills.length} teaching · {stats.learnSkills.length} learning
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-text-secondary">Teaching</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-text-secondary">Learning</span>
          </div>
        </div>
      </div>

      {/* Constellation canvas */}
      <div className="relative p-6 flex flex-wrap gap-3 items-start content-start">
        {/* Decorative SVG connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          {allSkills.slice(0, 6).map((_, i) => {
            const x1 = 50 + (i % 3) * 180;
            const y1 = 80 + Math.floor(i / 3) * 120;
            const x2 = 50 + ((i + 1) % 3) * 180;
            const y2 = 80 + Math.floor((i + 1) / 3) * 120;
            return (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(99,102,241,0.6)"
                strokeWidth="1"
                strokeDasharray="4 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: i * 0.2, duration: 1.5 }}
              />
            );
          })}
        </svg>

        <AnimatePresence>
          {allSkills.map((skill: any, i: number) => {
            const isTeach = skill.category === "teach";
            const isHovered = hoveredId === skill._id;

            return (
              <motion.div
                key={skill._id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.06 }}
                onHoverStart={() => setHoveredId(skill._id)}
                onHoverEnd={() => setHoveredId(null)}
                className="relative"
              >
                <motion.div
                  animate={{ y: isHovered ? -6 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`
                    flex items-center gap-2.5 px-5 py-3 rounded-2xl border cursor-default
                    transition-all duration-200
                    ${isTeach
                      ? "bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/20 hover:border-secondary/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                    }
                  `}
                >
                  {isTeach
                    ? <BookOpen className="w-4 h-4 flex-shrink-0" />
                    : <Zap className="w-4 h-4 flex-shrink-0" />
                  }
                  <span className="text-sm font-display font-semibold text-white">{skill.skill}</span>
                  {skill.status === "matched" && (
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse flex-shrink-0" title="Matched" />
                  )}
                </motion.div>

                {/* Tooltip on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2.5 rounded-xl bg-surface border border-border-strong text-xs text-text-secondary whitespace-nowrap pointer-events-none"
                    >
                      <div className="font-mono text-text-faint uppercase mb-0.5">{isTeach ? "Teaching" : "Learning"}</div>
                      <div className="text-white font-medium">Status: {skill.status}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Career Coach Panel
// ─────────────────────────────────────────────────────────────
function AICareerPanel({ stats, sessions }: { stats: any; sessions: any[] }) {
  const insights = generateInsights(stats, sessions);

  return (
    <div className="space-y-4">
      {/* AI Coach Header */}
      <div className="glass-panel rounded-3xl border border-primary/20 p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white text-lg">AI Career Coach</h3>
            <p className="text-xs font-mono text-primary">Analysis Active</p>
          </div>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">
          {insights.summary}
        </p>
      </div>

      {/* Insight Cards */}
      {insights.cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className={`glass-panel rounded-2xl p-5 border relative overflow-hidden ${card.borderColor}`}
        >
          <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${card.accentColor}`} />
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <div>
              <div className="text-xs font-mono text-text-faint uppercase mb-1">{card.category}</div>
              <p className="text-sm text-text-primary leading-relaxed">{card.message}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sessions Timeline
// ─────────────────────────────────────────────────────────────
function SessionsTimeline({ sessions }: { sessions: any[] }) {
  return (
    <div className="glass-panel rounded-3xl border border-border-strong p-7">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-5 h-5 text-tertiary" />
        <h2 className="font-display text-xl font-semibold text-white">Session Timeline</h2>
      </div>
      <div className="space-y-3">
        {sessions.map((session, i) => (
          <motion.div
            key={session._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-5 p-5 rounded-2xl border border-border-soft hover:border-border-strong bg-surface/20 hover:bg-surface/40 transition-all"
          >
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
              session.status === "completed" ? "bg-secondary" :
              session.status === "scheduled" ? "bg-primary animate-pulse" :
              "bg-text-faint"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white capitalize">{session.status} Session</p>
              <p className="text-xs text-text-faint font-mono mt-0.5">
                {new Date(session.scheduledAt).toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })} · {session.durationMinutes} min
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-mono uppercase ${
              session.status === "completed" ? "bg-secondary/10 text-secondary border border-secondary/20" :
              session.status === "scheduled" ? "bg-primary/10 text-primary border border-primary/20" :
              "bg-surface text-text-faint border border-border-soft"
            }`}>
              {session.status}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────


function generateInsights(stats: any, sessions: any[]) {
  const hasTeach = stats.teachSkills.length > 0;
  const hasLearn = stats.learnSkills.length > 0;
  const hasMatches = stats.totalMatches > 0;

  const summary = hasTeach && hasLearn
    ? `Your profile shows a healthy balance — you're offering ${stats.teachSkills.length} skill${stats.teachSkills.length > 1 ? "s" : ""} and seeking to learn ${stats.learnSkills.length}. The AI is actively scanning for high-synergy peers.`
    : !hasTeach && !hasLearn
    ? "Your career constellation is empty. Head to the Nexus and declare your first intent to activate AI matchmaking."
    : hasTeach
    ? `You're positioned as a knowledge source in ${stats.teachSkills.length} area${stats.teachSkills.length > 1 ? "s" : ""}. Consider adding what you want to learn to unlock bi-directional synergies.`
    : `You're actively seeking to learn ${stats.learnSkills.length} skill${stats.learnSkills.length > 1 ? "s" : ""}. Add what you can teach to maximize your match potential.`;

  const cards = [];

  if (!hasTeach) {
    cards.push({
      category: "Opportunity",
      message: "Add at least one skill you can teach. Students who teach attract 3× more high-quality matches.",
      icon: Star,
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
      borderColor: "border-tertiary/20",
      accentColor: "bg-tertiary",
    });
  }

  if (!hasLearn) {
    cards.push({
      category: "Growth",
      message: "Declare a learning goal. The AI needs a target to compute synergy with potential mentors.",
      icon: Zap,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderColor: "border-primary/20",
      accentColor: "bg-primary",
    });
  }

  if (hasMatches && stats.acceptedMatches === 0) {
    cards.push({
      category: "Action Required",
      message: `You have ${stats.totalMatches} proposed match${stats.totalMatches > 1 ? "es" : ""} waiting for your decision. Review and accept to unlock collaboration.`,
      icon: Users,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      borderColor: "border-secondary/20",
      accentColor: "bg-secondary",
    });
  }

  if (stats.acceptedMatches > 0 && sessions.length === 0) {
    cards.push({
      category: "Next Step",
      message: "You have accepted matches but no sessions scheduled. Initiate a sync session to start learning.",
      icon: Clock,
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
      borderColor: "border-tertiary/20",
      accentColor: "bg-tertiary",
    });
  }

  if (stats.avgSynergy >= 80) {
    cards.push({
      category: "Elite Tier",
      message: `Your average synergy score is ${stats.avgSynergy}%. This places you in the top cohort for match quality on the network.`,
      icon: Award,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      borderColor: "border-secondary/20",
      accentColor: "bg-secondary",
    });
  }

  if (cards.length === 0) {
    cards.push({
      category: "Status",
      message: "Your profile is fully optimized. The AI is running continuous background matching.",
      icon: BrainCircuit,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderColor: "border-primary/20",
      accentColor: "bg-primary",
    });
  }

  return { summary, cards };
}
