"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { OSLoader } from "@/components/os/OSShared";
import { ElevatedCard, StaggerGroup, StaggerItem, AIPulse, springs } from "@/components/motion/primitives";
import {
  Trophy, Sparkles, BrainCircuit, Users, Calendar, 
  ChevronRight, Plus, X, UserPlus, Zap, Rocket, Check
} from "lucide-react";

export default function HackathonsPage() {
  const seed = useMutation(api.hackathons.seed);
  const hackathons = useQuery(api.hackathons.list, {});
  const careerStats = useQuery(api.profiles.myCareerStats);
  const profileData = useQuery(api.profiles.myProfile);
  const currentUserId = profileData?.user?._id;

  // Auto-seed if empty
  useEffect(() => {
    if (hackathons && hackathons.length === 0) {
      seed();
    }
  }, [hackathons, seed]);

  const [activeHackathonId, setActiveHackathonId] = useState<Id<"hackathons"> | null>(null);
  const [showIdeaModal, setShowIdeaModal] = useState(false);

  useEffect(() => {
    if (hackathons && hackathons.length > 0 && !activeHackathonId) {
      setActiveHackathonId(hackathons[0]._id);
    }
  }, [hackathons, activeHackathonId]);

  const activeHackathon = hackathons?.find((h: any) => h._id === activeHackathonId);

  if (hackathons === undefined) return <OSLoader label="Retrieving Hackathons..." />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-32">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[0%] right-[20%] w-[600px] h-[600px] bg-primary/10 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/8 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <span className="font-mono text-xs text-primary uppercase tracking-widest">Innovation Hub</span>
            </div>
            <h1 className="font-display text-5xl font-bold text-white leading-tight">
              Build the <span className="bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-transparent">Future</span>
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowIdeaModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-primary/30 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all flex-shrink-0"
          >
            <BrainCircuit className="w-4 h-4" /> AI Idea Generator
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8 items-start">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="text-xs font-mono text-text-faint uppercase tracking-widest mb-2 px-1">Upcoming & Active</div>
            {!hackathons ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-surface/50 rounded-2xl" />)}
              </div>
            ) : (
              hackathons.map((h: any) => (
                <HackathonCard
                  key={h._id}
                  hackathon={h}
                  isActive={h._id === activeHackathonId}
                  onClick={() => setActiveHackathonId(h._id)}
                />
              ))
            )}
          </div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {activeHackathon && (
              <motion.div
                key={activeHackathon._id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                <HackathonDetail hackathon={activeHackathon} currentUserId={currentUserId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showIdeaModal && activeHackathon && (
          <IdeaGeneratorModal
            theme={activeHackathon.theme}
            careerContext={careerStats}
            onClose={() => setShowIdeaModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Hackathon Card (Sidebar)
// ─────────────────────────────────────────────────────────────
function HackathonCard({ hackathon, isActive, onClick }: any) {
  const isUpcoming = hackathon.status === "upcoming";
  return (
    <div
      onClick={onClick}
      className={`relative group p-6 rounded-2xl cursor-pointer transition-all border ${
        isActive
          ? "bg-primary/10 border-primary/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
          : "bg-surface/20 border-border-soft hover:bg-surface/40 hover:border-border-strong"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
          isUpcoming ? "bg-tertiary/10 border-tertiary/20 text-tertiary" : "bg-secondary/10 border-secondary/20 text-secondary"
        }`}>
          {hackathon.status}
        </div>
        {hackathon.prizePool && <div className="text-xs font-bold text-white">{hackathon.prizePool}</div>}
      </div>
      <h3 className={`font-display font-bold text-lg mb-2 ${isActive ? "text-white" : "text-text-secondary group-hover:text-white"}`}>
        {hackathon.title}
      </h3>
      <div className="flex items-center gap-3 text-xs font-mono text-text-faint">
        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(hackathon.startDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Hackathon Detail (Main)
// ─────────────────────────────────────────────────────────────
function HackathonDetail({ hackathon, currentUserId }: any) {
  const teams = useQuery(api.hackathons.listTeams, { hackathonId: hackathon._id });
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="glass-panel rounded-3xl border border-border-strong overflow-hidden relative p-8 md:p-12">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-wrap gap-2 mb-6">
          {hackathon.tags.map((t: string) => (
            <span key={t} className="px-3 py-1 rounded-lg bg-surface/60 border border-border-soft text-xs font-mono text-text-secondary">{t}</span>
          ))}
        </div>
        
        <h2 className="font-display text-4xl font-bold text-white mb-4">{hackathon.title}</h2>
        <p className="text-text-secondary leading-relaxed max-w-3xl mb-8 text-lg">{hackathon.description}</p>
        
        <div className="flex flex-wrap items-center gap-6 p-5 rounded-2xl bg-background/50 border border-border-soft inline-flex">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-text-faint uppercase">Theme</span>
            <span className="font-medium text-white">{hackathon.theme}</span>
          </div>
          <div className="w-px h-8 bg-border-strong" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-text-faint uppercase">Prize Pool</span>
            <span className="font-medium text-tertiary">{hackathon.prizePool || "TBA"}</span>
          </div>
          <div className="w-px h-8 bg-border-strong" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-text-faint uppercase">Deadline</span>
            <span className="font-medium text-white">{new Date(hackathon.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Teams Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Teams Looking for Members
          </h3>
          <button
            onClick={() => setShowCreateTeam(!showCreateTeam)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-background text-sm font-bold shadow-lg hover:shadow-xl transition-all"
          >
            {showCreateTeam ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateTeam ? "Cancel" : "Create Team"}
          </button>
        </div>

        <AnimatePresence>
          {showCreateTeam && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <CreateTeamForm hackathonId={hackathon._id} onSuccess={() => setShowCreateTeam(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {!teams ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="h-48 bg-surface/40 animate-pulse rounded-2xl" />)}
          </div>
        ) : teams.length === 0 ? (
          <div className="glass-panel p-10 text-center rounded-3xl border-border-soft border-dashed">
            <Users className="w-8 h-8 text-text-faint mx-auto mb-3" />
            <p className="text-text-secondary">No teams formed yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team: any) => (
              <TeamCard key={team._id} team={team} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Team Card
// ─────────────────────────────────────────────────────────────
function TeamCard({ team, currentUserId }: any) {
  const apply = useMutation(api.hackathons.applyToTeam);
  const [applying, setApplying] = useState(false);
  const [role, setRole] = useState("");
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showMatchmaker, setShowMatchmaker] = useState(false);

  async function handleApply() {
    if (!role) return;
    setApplying(true);
    try {
      await apply({ teamId: team._id, role });
      setApplied(true);
      setShowApply(false);
    } catch (e) { alert("Already applied or error occurred"); }
    finally { setApplying(false); }
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border-soft flex flex-col h-full relative overflow-hidden group">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-display font-bold text-white text-lg">{team.name}</h4>
        <div className="px-2 py-1 bg-surface rounded text-[10px] font-mono text-text-faint uppercase">{team.members.length} Members</div>
      </div>
      <p className="text-sm text-text-secondary mb-4 flex-1">{team.description}</p>
      
      <div className="space-y-3">
        <div>
          <span className="text-xs font-mono text-text-faint block mb-1.5">Looking For:</span>
          <div className="flex flex-wrap gap-1.5">
            {team.lookingFor.map((r: string) => (
              <span key={r} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono border border-primary/20">{r}</span>
            ))}
          </div>
        </div>

        {showApply ? (
          <div className="flex gap-2 pt-2">
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="Your role (e.g. Frontend)" className="flex-1 bg-surface border border-border-strong rounded-lg px-3 py-1.5 text-xs text-white" />
            <button onClick={handleApply} disabled={applying} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold disabled:opacity-50">Send</button>
          </div>
        ) : applied ? (
          <div className="pt-2 text-xs font-mono text-secondary flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Request Sent</div>
        ) : currentUserId === team.creatorId ? (
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setShowMatchmaker(true)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold hover:bg-primary/20 transition-all shadow-[0_0_20px_rgba(99,102,241,0.05)]"
            >
              <Sparkles className="w-3.5 h-3.5" /> Find Teammates via AI
            </button>
          </div>
        ) : (
          <button onClick={() => setShowApply(true)} className="mt-2 text-xs font-bold text-white flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <UserPlus className="w-3.5 h-3.5" /> Apply to join
          </button>
        )}
      </div>

      <AnimatePresence>
        {showMatchmaker && (
          <AIMatchmakerModal team={team} onClose={() => setShowMatchmaker(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Create Team Form
// ─────────────────────────────────────────────────────────────
function CreateTeamForm({ hackathonId, onSuccess }: any) {
  const create = useMutation(api.hackathons.createTeam);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [lookingFor, setLookingFor] = useState("");

  async function submit(e: any) {
    e.preventDefault();
    const roles = lookingFor.split(",").map(s => s.trim()).filter(Boolean);
    await create({ hackathonId, name, description: desc, lookingFor: roles });
    onSuccess();
  }

  return (
    <form onSubmit={submit} className="glass-panel p-6 rounded-2xl border border-border-strong mb-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Team Name" className="bg-surface/50 border border-border-strong rounded-xl px-4 py-3 text-sm text-white" />
        <input required value={lookingFor} onChange={e => setLookingFor(e.target.value)} placeholder="Looking for (comma separated, e.g. Design, Backend)" className="bg-surface/50 border border-border-strong rounded-xl px-4 py-3 text-sm text-white" />
      </div>
      <textarea required value={desc} onChange={e => setDesc(e.target.value)} placeholder="Project description..." rows={2} className="w-full bg-surface/50 border border-border-strong rounded-xl px-4 py-3 text-sm text-white resize-none" />
      <div className="flex justify-end"><button type="submit" className="px-5 py-2.5 bg-white text-background font-bold text-sm rounded-xl">Create Team</button></div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Idea Generator Modal
// ─────────────────────────────────────────────────────────────
function IdeaGeneratorModal({ theme, careerContext, onClose }: any) {
  const generate = useAction(api.hackathonsAI.generateIdea);
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState<any>(null);

  const mySkills = [
    ...(careerContext?.teachSkills?.map((s:any) => s.skill) || []),
    ...(careerContext?.learnSkills?.map((s:any) => s.skill) || [])
  ];

  async function handleGenerate() {
    setLoading(true);
    setIdea(null);
    try {
      const res = await generate({ theme, skills: mySkills.length ? mySkills : ["JavaScript", "React"] });
      setIdea(res);
    } catch (e) { alert("Failed to generate idea"); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-2xl" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl glass-panel rounded-3xl border border-border-strong p-8 shadow-[0_60px_120px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex items-center justify-between mb-8 relative">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-primary" /> AI Idea Brainstorm
          </h2>
          <button onClick={onClose} className="text-text-faint hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {!idea && !loading && (
          <div className="text-center py-10">
            <Rocket className="w-12 h-12 text-text-faint mx-auto mb-4" />
            <p className="text-text-secondary mb-6 max-w-sm mx-auto">Generate a winning hackathon idea based on your skill graph and the hackathon theme: <strong>{theme}</strong>.</p>
            <button onClick={handleGenerate} className="px-6 py-3 bg-primary/10 border border-primary/30 text-primary rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-primary/20 transition-all">
              <Zap className="w-4 h-4" /> Spark Idea
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-primary animate-pulse">Synthesizing winning concepts...</p>
          </div>
        )}

        {idea && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
              <h3 className="font-display text-3xl font-bold text-white mb-2">{idea.name}</h3>
              <p className="text-primary font-mono text-sm mb-4">{idea.tagline}</p>
              
              <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
                <div><strong className="text-white block mb-1">Problem:</strong> {idea.problem}</div>
                <div><strong className="text-white block mb-1">Solution:</strong> {idea.solution}</div>
                <div><strong className="text-tertiary block mb-1 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> The Wow Factor:</strong> {idea.wowFactor}</div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {idea.techStack.map((t: string) => <span key={t} className="px-2.5 py-1 rounded bg-surface border border-border-strong text-xs font-mono">{t}</span>)}
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button onClick={handleGenerate} className="px-5 py-2.5 rounded-xl border border-border-strong text-text-secondary hover:text-white text-sm font-medium">Generate Another</button>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white text-background text-sm font-bold shadow-lg">Looks Good</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Teammate Matchmaker Modal
// ─────────────────────────────────────────────────────────────
function AIMatchmakerModal({ team, onClose }: { team: any; onClose: () => void }) {
  const getRecommendations = useAction(api.hackathonsAI.recommendTeammates);
  const invite = useMutation(api.hackathons.inviteTeammate);
  
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getRecommendations({ teamId: team._id });
        setRecommendations(res.recommendations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [team._id, getRecommendations]);

  async function handleInvite(userId: string, name: string) {
    setInvitingId(userId);
    try {
      const role = team.lookingFor[0] || "Builder";
      await invite({ teamId: team._id, userId, role });
      setInvitedIds((prev) => [...prev, userId]);
    } catch (err) {
      console.error(err);
      alert("Invite failed. User might already be invited.");
    } finally {
      setInvitingId(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="w-full max-w-2xl glass-panel rounded-3xl p-8 border border-border-strong relative shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-text-faint hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white">AI Team Matchmaker</h3>
            <p className="text-xs text-text-faint font-mono mt-0.5">Matching candidates for: {team.name}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary font-mono">Running vector similarity matching...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            No compatible builders found on the platform yet.
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {recommendations.map((rec) => {
              const isInvited = invitedIds.includes(rec.userId);
              return (
                <div
                  key={rec.userId}
                  className="p-5 rounded-2xl border border-border-soft bg-surface/30 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-white text-base">{rec.name}</span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold border border-primary/20">
                        {rec.score}% match
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {rec.compatibilityReason}
                    </p>
                  </div>

                  <button
                    onClick={() => handleInvite(rec.userId, rec.name)}
                    disabled={isInvited || invitingId === rec.userId}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex-shrink-0 ${
                      isInvited
                        ? "bg-secondary/20 text-secondary border border-secondary/30"
                        : "bg-primary text-background hover:bg-primary/80"
                    }`}
                  >
                    {isInvited ? "Invited ✓" : invitingId === rec.userId ? "Inviting..." : "Invite"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}


