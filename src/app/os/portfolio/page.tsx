"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { OSLoader } from "@/components/os/OSShared";
import { ElevatedCard, StaggerGroup, StaggerItem, AIPulse, ScrollReveal, springs } from "@/components/motion/primitives";
import {
  Plus, X, Code, Code2, ExternalLink, Star, Trash2,
  BrainCircuit, Zap, CheckCircle2, Clock, Sparkles,
  ChevronRight, AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type ProjectStatus = "in-progress" | "completed" | "featured";

interface Project {
  _id: Id<"projects">;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  status: ProjectStatus;
  createdAt: number;
}

interface AIReview {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
  projectNotes: Array<{ title: string; note: string; rating: number }>;
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const projects = useQuery(api.portfolio.myProjects) as Project[] | undefined;
  const careerStats = useQuery(api.profiles.myCareerStats);
  const reviewAction = useAction(api.portfolioAI.reviewPortfolio);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [filter, setFilter] = useState<"all" | ProjectStatus>("all");

  const careerContext = careerStats
    ? [
        careerStats.teachSkills.length > 0
          ? `Teaching: ${careerStats.teachSkills.map((s: any) => s.skill).join(", ")}`
          : null,
        careerStats.learnSkills.length > 0
          ? `Seeking: ${careerStats.learnSkills.map((s: any) => s.skill).join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join(" | ")
    : undefined;

  async function runAIReview() {
    if (!projects || projects.length === 0 || isReviewing) return;
    setIsReviewing(true);
    try {
      const result = await reviewAction({
        projects: projects.map((p) => ({
          title: p.title,
          description: p.description,
          techStack: p.techStack,
          status: p.status,
        })),
        careerContext,
      });
      setAiReview(result as AIReview);
    } finally {
      setIsReviewing(false);
    }
  }

  const filtered =
    filter === "all" ? projects : projects?.filter((p) => p.status === filter);

  if (projects === undefined) return <OSLoader label="Retrieving Portfolio Projects..." />;

  return (
    <div className="min-h-screen bg-background pb-36 overflow-x-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-tertiary/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-primary/8 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 space-y-10">

        {/* ── Header ── */}
        <PortfolioHeader
          count={projects?.length ?? 0}
          onAdd={() => setShowAddModal(true)}
          onReview={runAIReview}
          isReviewing={isReviewing}
          hasProjects={(projects?.length ?? 0) > 0}
        />

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">

          {/* Projects Column */}
          <div className="space-y-6">
            {/* Filter tabs */}
            {(projects?.length ?? 0) > 0 && (
              <FilterTabs current={filter} onChange={setFilter} />
            )}

            {/* Project grid */}
            {!projects ? (
              <ProjectsSkeleton />
            ) : filtered && filtered.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <AnimatePresence>
                  {filtered.map((project, i) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      index={i}
                      onEdit={() => setEditProject(project)}
                      reviewNote={aiReview?.projectNotes.find(
                        (n) => n.title.toLowerCase() === project.title.toLowerCase()
                      )}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState onAdd={() => setShowAddModal(true)} />
            )}
          </div>

          {/* AI Review Panel */}
          <div className="space-y-5">
            <AIReviewPanel
              review={aiReview}
              isReviewing={isReviewing}
              hasProjects={(projects?.length ?? 0) > 0}
              onRequest={runAIReview}
            />
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {(showAddModal || editProject) && (
          <ProjectModal
            project={editProject}
            onClose={() => { setShowAddModal(false); setEditProject(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────
function PortfolioHeader({
  count, onAdd, onReview, isReviewing, hasProjects,
}: {
  count: number;
  onAdd: () => void;
  onReview: () => void;
  isReviewing: boolean;
  hasProjects: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-tertiary/20 border border-tertiary/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-tertiary" />
          </div>
          <span className="font-mono text-xs text-tertiary uppercase tracking-widest">
            Portfolio OS · {count} Project{count !== 1 ? "s" : ""}
          </span>
        </div>
        <h1 className="font-display text-5xl font-bold text-white leading-tight">
          Your Work,{" "}
          <span className="bg-gradient-to-r from-tertiary via-secondary to-primary bg-clip-text text-transparent">
            Amplified
          </span>
        </h1>
        <p className="text-text-secondary text-lg mt-3 max-w-lg">
          Document every project. Get AI-powered feedback. Build a portfolio that opens doors.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {hasProjects && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReview}
            disabled={isReviewing}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-primary/30 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all disabled:opacity-60"
          >
            {isReviewing ? (
              <><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />Analysing...</>
            ) : (
              <><BrainCircuit className="w-4 h-4" />AI Review</>
            )}
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-background text-sm font-bold shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Filter Tabs
// ─────────────────────────────────────────────────────────────
function FilterTabs({
  current,
  onChange,
}: {
  current: string;
  onChange: (f: any) => void;
}) {
  const tabs = [
    { key: "all", label: "All" },
    { key: "featured", label: "Featured" },
    { key: "completed", label: "Completed" },
    { key: "in-progress", label: "In Progress" },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            current === tab.key
              ? "bg-white/10 border border-white/20 text-white"
              : "text-text-faint hover:text-text-secondary border border-transparent hover:border-border-soft"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Project Card
// ─────────────────────────────────────────────────────────────
function ProjectCard({
  project,
  index,
  onEdit,
  reviewNote,
}: {
  project: Project;
  index: number;
  onEdit: () => void;
  reviewNote?: { note: string; rating: number };
}) {
  const deleteProject = useMutation(api.portfolio.deleteProject);
  const toggleFeatured = useMutation(api.portfolio.toggleFeatured);
  const [deleting, setDeleting] = useState(false);

  const statusConfig = {
    featured: { label: "Featured", color: "text-tertiary", bg: "bg-tertiary/10", border: "border-tertiary/30", Icon: Star },
    completed: { label: "Completed", color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30", Icon: CheckCircle2 },
    "in-progress": { label: "In Progress", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", Icon: Clock },
  };
  const cfg = statusConfig[project.status];
  const StatusIcon = cfg.Icon;

  async function handleDelete() {
    setDeleting(true);
    try { await deleteProject({ projectId: project._id }); }
    finally { setDeleting(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 28 }}
      className="group glass-panel rounded-3xl border border-border-strong overflow-hidden relative hover:border-border-strong hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300"
    >
      {/* Featured glow */}
      {project.status === "featured" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-tertiary via-secondary to-primary" />
      )}

      <div className="p-7">
        {/* Status + actions */}
        <div className="flex items-start justify-between mb-5">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${cfg.bg} border ${cfg.border}`}>
            <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
            <span className={`text-xs font-mono ${cfg.color}`}>{cfg.label}</span>
          </div>

          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleFeatured({ projectId: project._id })}
              title="Toggle featured"
              className="w-8 h-8 rounded-xl border border-border-soft flex items-center justify-center text-text-faint hover:text-tertiary hover:border-tertiary/30 transition-colors"
            >
              <Star className={`w-3.5 h-3.5 ${project.status === "featured" ? "text-tertiary fill-tertiary" : ""}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="w-8 h-8 rounded-xl border border-border-soft flex items-center justify-center text-text-faint hover:text-white hover:border-border-strong transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              disabled={deleting}
              className="w-8 h-8 rounded-xl border border-border-soft flex items-center justify-center text-text-faint hover:text-red-400 hover:border-red-400/30 transition-colors disabled:opacity-50"
            >
              {deleting
                ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />
              }
            </motion.button>
          </div>
        </div>

        {/* Title & description */}
        <h3 className="font-display text-xl font-bold text-white mb-2.5 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-text-secondary group-hover:bg-clip-text transition-all">
          {project.title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-5 line-clamp-3">
          {project.description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 mb-5">
          {project.techStack.slice(0, 6).map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-lg bg-surface/60 border border-border-soft text-xs font-mono text-text-secondary"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 6 && (
            <span className="px-2.5 py-1 rounded-lg bg-surface/60 border border-border-soft text-xs font-mono text-text-faint">
              +{project.techStack.length - 6}
            </span>
          )}
        </div>

        {/* AI Review note (if available) */}
        {reviewNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-5 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i < reviewNote.rating ? "bg-primary" : "bg-border-strong"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{reviewNote.note}</p>
            </div>
          </motion.div>
        )}

        {/* Links */}
        <div className="flex items-center gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-text-faint hover:text-white transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              Source
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Review Panel
// ─────────────────────────────────────────────────────────────
function AIReviewPanel({
  review, isReviewing, hasProjects, onRequest,
}: {
  review: AIReview | null;
  isReviewing: boolean;
  hasProjects: boolean;
  onRequest: () => void;
}) {
  if (isReviewing) {
    return (
      <div className="glass-panel rounded-3xl border border-primary/20 p-8 flex flex-col items-center justify-center gap-4 min-h-[280px]">
        <div className="w-12 h-12 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-white mb-1">Analysing Portfolio</p>
          <p className="text-xs font-mono text-primary">AI reviewing your work...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 0.15, 0.3].map((d, i) => (
            <motion.div
              key={i}
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: d }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="glass-panel rounded-3xl border border-border-strong p-8 flex flex-col items-center text-center gap-5 min-h-[280px] justify-center">
        <div className="w-14 h-14 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <BrainCircuit className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-xl mb-2">AI Portfolio Review</h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            {hasProjects
              ? "Get an expert-level critique of every project — score, strengths, gaps, and next steps."
              : "Add at least one project to unlock your AI portfolio review."}
          </p>
        </div>
        {hasProjects && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRequest}
            className="w-full py-3 rounded-2xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Run AI Review
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Score card */}
      <div className="glass-panel rounded-3xl border border-primary/25 p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-primary" />
          </div>
          <span className="font-mono text-xs text-primary uppercase tracking-widest">AI Review Complete</span>
        </div>

        {/* Score ring */}
        <div className="flex items-center gap-6 mb-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="6" />
              <motion.circle
                cx="40" cy="40" r="34" fill="none"
                stroke="#6366F1" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - review.score / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-bold text-xl text-white">{review.score}</span>
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{review.summary}</p>
        </div>
      </div>

      {/* Strengths */}
      {review.strengths.length > 0 && (
        <ReviewSection
          title="Strengths"
          items={review.strengths}
          color="text-secondary"
          bg="bg-secondary/10"
          border="border-secondary/20"
          accentBg="bg-secondary"
        />
      )}

      {/* Gaps */}
      {review.gaps.length > 0 && (
        <ReviewSection
          title="Gaps"
          items={review.gaps}
          color="text-red-400"
          bg="bg-red-400/8"
          border="border-red-400/20"
          accentBg="bg-red-400"
          icon={<AlertCircle className="w-3.5 h-3.5" />}
        />
      )}

      {/* Next steps */}
      {review.nextSteps.length > 0 && (
        <ReviewSection
          title="High-Impact Next Steps"
          items={review.nextSteps}
          color="text-tertiary"
          bg="bg-tertiary/8"
          border="border-tertiary/20"
          accentBg="bg-tertiary"
          icon={<ChevronRight className="w-3.5 h-3.5" />}
        />
      )}
    </motion.div>
  );
}

function ReviewSection({
  title, items, color, bg, border, accentBg, icon,
}: {
  title: string;
  items: string[];
  color: string;
  bg: string;
  border: string;
  accentBg: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`glass-panel rounded-2xl p-6 border ${border} relative overflow-hidden`}>
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${accentBg}`} />
      <h4 className={`text-xs font-mono uppercase tracking-widest mb-4 ${color}`}>{title}</h4>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
            <span className={`${color} flex-shrink-0 mt-0.5`}>{icon ?? "·"}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add / Edit Project Modal
// ─────────────────────────────────────────────────────────────
function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const createProject = useMutation(api.portfolio.createProject);
  const updateProject = useMutation(api.portfolio.updateProject);

  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>(project?.techStack ?? []);
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "in-progress");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addTech(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === ",") && techInput.trim()) {
      e.preventDefault();
      const t = techInput.trim().replace(/,$/, "");
      if (t && !techStack.includes(t)) setTechStack((prev) => [...prev, t]);
      setTechInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (project) {
        await updateProject({
          projectId: project._id,
          title: title.trim(),
          description: description.trim(),
          techStack,
          liveUrl: liveUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          status,
        });
      } else {
        await createProject({
          title: title.trim(),
          description: description.trim(),
          techStack,
          liveUrl: liveUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          status,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "featured", label: "Featured" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-2xl"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 40 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="w-full max-w-2xl glass-panel rounded-3xl border border-border-strong shadow-[0_60px_120px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border-soft">
          <h2 className="font-display text-2xl font-bold text-white">
            {project ? "Edit Project" : "Add Project"}
          </h2>
          <button onClick={onClose} className="text-text-faint hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {/* Title */}
          <FieldGroup label="Project Title" required>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Real-time Collaboration Tool"
              className="w-full bg-surface/40 border border-border-strong rounded-xl px-4 py-3 text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary text-base"
            />
          </FieldGroup>

          {/* Description */}
          <FieldGroup label="Description" required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does it do? What problem does it solve? What was your role?"
              rows={4}
              className="w-full bg-surface/40 border border-border-strong rounded-xl px-4 py-3 text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary text-sm leading-relaxed resize-none"
            />
          </FieldGroup>

          {/* Tech Stack */}
          <FieldGroup label="Tech Stack" hint="Press Enter or comma to add">
            <div className="space-y-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={addTech}
                placeholder="React, TypeScript, Convex..."
                className="w-full bg-surface/40 border border-border-strong rounded-xl px-4 py-3 text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {techStack.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs font-mono"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => setTechStack((prev) => prev.filter((x) => x !== t))}
                        className="hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FieldGroup>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="GitHub URL">
              <input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-surface/40 border border-border-strong rounded-xl px-4 py-3 text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </FieldGroup>
            <FieldGroup label="Live URL">
              <input
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface/40 border border-border-strong rounded-xl px-4 py-3 text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </FieldGroup>
          </div>

          {/* Status */}
          <FieldGroup label="Status">
            <div className="flex gap-3">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    status === opt.value
                      ? "border-primary bg-primary/15 text-white"
                      : "border-border-strong text-text-faint hover:border-border-strong hover:text-text-secondary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FieldGroup>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-border-strong text-text-secondary hover:text-white hover:bg-surface/40 transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex-[2] py-3.5 rounded-2xl bg-white text-background font-bold text-base disabled:opacity-50 transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)]"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin mx-auto" />
              ) : project ? (
                "Save Changes"
              ) : (
                "Add to Portfolio"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl border border-border-strong p-16 flex flex-col items-center text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-tertiary" />
      </div>
      <h3 className="font-display text-3xl font-bold text-white mb-3">
        No Projects Yet
      </h3>
      <p className="text-text-secondary max-w-sm leading-relaxed mb-8">
        Your portfolio is your proof of work. Add your first project and let the AI analyse it.
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAdd}
        className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-background font-bold text-base"
      >
        <Plus className="w-5 h-5" />
        Add First Project
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function FieldGroup({
  label, children, required, hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
        {hint && <span className="text-xs text-text-faint font-mono">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {[1, 2].map((i) => (
        <div key={i} className="glass-panel rounded-3xl border border-border-soft p-7 animate-pulse space-y-4">
          <div className="h-4 bg-surface rounded-lg w-24" />
          <div className="h-6 bg-surface rounded-lg w-3/4" />
          <div className="h-4 bg-surface rounded-lg" />
          <div className="h-4 bg-surface rounded-lg w-5/6" />
          <div className="flex gap-2">
            {[1, 2, 3].map((j) => <div key={j} className="h-6 w-16 bg-surface rounded-lg" />)}
          </div>
        </div>
      ))}
    </div>
  );
}


