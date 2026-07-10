"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { OSLoader } from "@/components/os/OSShared";
import { ElevatedCard, StaggerGroup, StaggerItem, AIPulse, ScrollReveal, springs } from "@/components/motion/primitives";
import {
  Sparkles, BrainCircuit, Plus, Trash2, Wand2, Copy,
  Check, ChevronDown, ChevronUp, FileText, Download,
  AlertCircle, GraduationCap, Briefcase, Code2, Award,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  bullets: string[];
}
interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
}
interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}
interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}
interface ResumeScore {
  atsScore: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  verdict: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function ResumePage() {
  const savedResume = useQuery(api.resume.myResume);
  const profile = useQuery(api.profiles.myProfile);
  const saveResume = useMutation(api.resume.saveResume);
  const rewriteAction = useAction(api.resumeAI.rewriteSection);
  const scoreAction = useAction(api.resumeAI.scoreResume);

  // ── Editor state ──
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [targetRole, setTargetRole] = useState("");

  // ── UI state ──
  const [activeSection, setActiveSection] = useState<string | null>("summary");
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [rewritingId, setRewritingId] = useState<string | null>(null);
  const [score, setScore] = useState<ResumeScore | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");

  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // ── Load saved resume ──
  useEffect(() => {
    if (!savedResume) return;
    if (savedResume.summary) setSummary(savedResume.summary);
    if (savedResume.experienceJson) {
      try { setExperience(JSON.parse(savedResume.experienceJson)); } catch {}
    }
    if (savedResume.educationJson) {
      try { setEducation(JSON.parse(savedResume.educationJson)); } catch {}
    }
    if (savedResume.skillsJson) {
      try { setSkills(JSON.parse(savedResume.skillsJson)); } catch {}
    }
    if (savedResume.certificationsJson) {
      try { setCerts(JSON.parse(savedResume.certificationsJson)); } catch {}
    }
  }, [savedResume]);

  // ── Auto-save (debounced 2s) ──
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveResume({
          summary: summary || undefined,
          experienceJson: experience.length ? JSON.stringify(experience) : undefined,
          educationJson: education.length ? JSON.stringify(education) : undefined,
          skillsJson: skills.length ? JSON.stringify(skills) : undefined,
          certificationsJson: certs.length ? JSON.stringify(certs) : undefined,
        });
        setSavedAt(new Date());
      } finally {
        setIsSaving(false);
      }
    }, 2000);
  }, [summary, experience, education, skills, certs, saveResume]);

  useEffect(() => { scheduleSave(); }, [summary, experience, education, skills, certs]);

  // ── AI: rewrite summary ──
  async function handleRewriteSummary() {
    if (!summary.trim()) return;
    setRewritingId("summary");
    try {
      const result = await rewriteAction({ section: "summary", content: summary, context: targetRole });
      setSummary(result);
    } finally { setRewritingId(null); }
  }

  // ── AI: rewrite bullet ──
  async function handleRewriteBullet(expId: string, bulletIdx: number) {
    const exp = experience.find((e) => e.id === expId);
    if (!exp) return;
    const bullet = exp.bullets[bulletIdx];
    setRewritingId(`${expId}-${bulletIdx}`);
    try {
      const result = await rewriteAction({ section: "bullet", content: bullet, context: `${exp.role} at ${exp.company}` });
      setExperience((prev) =>
        prev.map((e) => e.id !== expId ? e : {
          ...e,
          bullets: e.bullets.map((b, i) => i === bulletIdx ? result : b),
        })
      );
    } finally { setRewritingId(null); }
  }

  // ── AI: score resume ──
  async function handleScore() {
    setIsScoring(true);
    try {
      const text = buildResumeText();
      const result = await scoreAction({ resumeText: text, targetRole: targetRole || undefined });
      setScore(result as ResumeScore);
    } finally { setIsScoring(false); }
  }

  // ── Copy to clipboard ──
  async function handleCopy() {
    await navigator.clipboard.writeText(buildResumeText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function buildResumeText() {
    const name = profile?.profile?.name ?? profile?.user?.name ?? "Your Name";
    const lines: string[] = [name, "", "SUMMARY", summary, ""];
    if (experience.length) {
      lines.push("EXPERIENCE");
      experience.forEach((e) => {
        lines.push(`${e.role} — ${e.company} | ${e.duration}`);
        e.bullets.forEach((b) => lines.push(`• ${b}`));
        lines.push("");
      });
    }
    if (education.length) {
      lines.push("EDUCATION");
      education.forEach((e) => {
        lines.push(`${e.degree} — ${e.institution} | ${e.year}${e.gpa ? ` | GPA: ${e.gpa}` : ""}`);
      });
      lines.push("");
    }
    if (skills.length) {
      lines.push("SKILLS");
      skills.forEach((s) => lines.push(`${s.category}: ${s.items.join(", ")}`));
      lines.push("");
    }
    if (certs.length) {
      lines.push("CERTIFICATIONS");
      certs.forEach((c) => lines.push(`${c.name} — ${c.issuer} (${c.year})`));
    }
    return lines.join("\n");
  }

  const displayName = profile?.profile?.name ?? profile?.user?.name ?? "Your Name";

  if (savedResume === undefined || profile === undefined) return <OSLoader label="Retrieving Resume Data..." />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-32">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/8 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">

        {/* ── Page Header ── */}
        <ResumeHeader
          isSaving={isSaving}
          savedAt={savedAt}
          onScore={handleScore}
          isScoring={isScoring}
          onCopy={handleCopy}
          copied={copied}
          activeView={activeView}
          setActiveView={setActiveView}
          targetRole={targetRole}
          setTargetRole={setTargetRole}
        />

        {/* ── Split Layout ── */}
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">

          {/* Left: Editor or Preview */}
          <AnimatePresence mode="wait">
            {activeView === "edit" ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-4"
              >
                {/* Summary */}
                <SectionPanel
                  id="summary"
                  title="Professional Summary"
                  icon={FileText}
                  active={activeSection === "summary"}
                  onToggle={() => setActiveSection(activeSection === "summary" ? null : "summary")}
                >
                  <div className="space-y-3">
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Write a 3–4 sentence summary of your career, strengths, and goals..."
                      rows={4}
                      className="w-full bg-surface/40 border border-border-strong rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                    />
                    <AIButton
                      label="Rewrite with AI"
                      onClick={handleRewriteSummary}
                      loading={rewritingId === "summary"}
                      disabled={!summary.trim()}
                    />
                  </div>
                </SectionPanel>

                {/* Experience */}
                <SectionPanel
                  id="experience"
                  title="Experience"
                  icon={Briefcase}
                  active={activeSection === "experience"}
                  onToggle={() => setActiveSection(activeSection === "experience" ? null : "experience")}
                  onAdd={() => setExperience((prev) => [...prev, { id: uid(), company: "", role: "", duration: "", bullets: [""] }])}
                >
                  <ExperienceEditor
                    items={experience}
                    onChange={setExperience}
                    onRewriteBullet={handleRewriteBullet}
                    rewritingId={rewritingId}
                  />
                </SectionPanel>

                {/* Education */}
                <SectionPanel
                  id="education"
                  title="Education"
                  icon={GraduationCap}
                  active={activeSection === "education"}
                  onToggle={() => setActiveSection(activeSection === "education" ? null : "education")}
                  onAdd={() => setEducation((prev) => [...prev, { id: uid(), institution: "", degree: "", year: "" }])}
                >
                  <EducationEditor items={education} onChange={setEducation} />
                </SectionPanel>

                {/* Skills */}
                <SectionPanel
                  id="skills"
                  title="Skills"
                  icon={Code2}
                  active={activeSection === "skills"}
                  onToggle={() => setActiveSection(activeSection === "skills" ? null : "skills")}
                  onAdd={() => setSkills((prev) => [...prev, { id: uid(), category: "", items: [] }])}
                >
                  <SkillsEditor items={skills} onChange={setSkills} />
                </SectionPanel>

                {/* Certifications */}
                <SectionPanel
                  id="certifications"
                  title="Certifications"
                  icon={Award}
                  active={activeSection === "certifications"}
                  onToggle={() => setActiveSection(activeSection === "certifications" ? null : "certifications")}
                  onAdd={() => setCerts((prev) => [...prev, { id: uid(), name: "", issuer: "", year: "" }])}
                >
                  <CertificationsEditor items={certs} onChange={setCerts} />
                </SectionPanel>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
              >
                <ResumePreview
                  name={displayName}
                  summary={summary}
                  experience={experience}
                  education={education}
                  skills={skills}
                  certs={certs}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right: Score Panel */}
          <div className="xl:sticky xl:top-8">
            <ScorePanel score={score} isScoring={isScoring} onScore={handleScore} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page Header
// ─────────────────────────────────────────────────────────────
function ResumeHeader({
  isSaving, savedAt, onScore, isScoring, onCopy, copied,
  activeView, setActiveView, targetRole, setTargetRole,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-secondary" />
            </div>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">
              AI Resume Builder
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">
            Your Resume,{" "}
            <span className="bg-gradient-to-r from-secondary via-primary to-tertiary bg-clip-text text-transparent">
              Perfected
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Save status */}
          <div className="text-xs font-mono text-text-faint">
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : savedAt ? (
              <span className="text-secondary">✓ Saved {savedAt.toLocaleTimeString()}</span>
            ) : null}
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl border border-border-strong overflow-hidden">
            {(["edit", "preview"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-4 py-2 text-xs font-mono capitalize transition-all ${
                  activeView === v
                    ? "bg-white/10 text-white"
                    : "text-text-faint hover:text-text-secondary"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-strong text-text-secondary hover:text-white text-sm transition-all"
          >
            {copied ? <><Check className="w-4 h-4 text-secondary" />Copied!</> : <><Copy className="w-4 h-4" />Copy Text</>}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onScore}
            disabled={isScoring}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium hover:bg-secondary/20 transition-all disabled:opacity-60"
          >
            {isScoring
              ? <><div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />Scoring...</>
              : <><BrainCircuit className="w-4 h-4" />ATS Score</>
            }
          </motion.button>
        </div>
      </div>

      {/* Target role input */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-text-faint whitespace-nowrap">Target role:</span>
        <input
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer at Stripe"
          className="flex-1 max-w-md bg-surface/30 border border-border-soft rounded-xl px-4 py-2 text-sm text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary/50"
        />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Collapsible Section Panel
// ─────────────────────────────────────────────────────────────
function SectionPanel({
  id, title, icon: Icon, active, onToggle, onAdd, children,
}: {
  id: string; title: string; icon: any; active: boolean;
  onToggle: () => void; onAdd?: () => void; children: React.ReactNode;
}) {
  return (
    <div className={`glass-panel rounded-2xl border transition-all duration-200 ${active ? "border-border-strong" : "border-border-soft"}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="w-full flex items-center justify-between px-6 py-4 group cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/20 rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${active ? "bg-primary/15 border border-primary/25" : "bg-surface/60 border border-border-soft group-hover:bg-primary/10"}`}>
            <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-text-faint group-hover:text-primary"}`} />
          </div>
          <span className={`font-display font-semibold text-base ${active ? "text-white" : "text-text-secondary group-hover:text-white"} transition-colors`}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onAdd && active && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add
            </motion.button>
          )}
          {active ? <ChevronUp className="w-4 h-4 text-text-faint" /> : <ChevronDown className="w-4 h-4 text-text-faint" />}
        </div>
      </div>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-border-soft pt-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Experience Editor
// ─────────────────────────────────────────────────────────────
function ExperienceEditor({ items, onChange, onRewriteBullet, rewritingId }: {
  items: Experience[];
  onChange: (v: Experience[]) => void;
  onRewriteBullet: (expId: string, idx: number) => void;
  rewritingId: string | null;
}) {
  if (items.length === 0) return (
    <p className="text-sm text-text-faint italic">No experience added yet. Click + Add above.</p>
  );

  function updateField(id: string, field: keyof Experience, value: any) {
    onChange(items.map((e) => e.id === id ? { ...e, [field]: value } : e));
  }
  function addBullet(id: string) {
    onChange(items.map((e) => e.id === id ? { ...e, bullets: [...e.bullets, ""] } : e));
  }
  function updateBullet(id: string, idx: number, val: string) {
    onChange(items.map((e) => e.id === id ? { ...e, bullets: e.bullets.map((b, i) => i === idx ? val : b) } : e));
  }
  function removeBullet(id: string, idx: number) {
    onChange(items.map((e) => e.id === id ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e));
  }
  function removeEntry(id: string) {
    onChange(items.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      {items.map((exp) => (
        <div key={exp.id} className="p-5 rounded-xl border border-border-soft bg-surface/20 space-y-4 relative group">
          <button
            onClick={() => removeEntry(exp.id)}
            className="absolute top-3 right-3 text-text-faint hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { field: "role", placeholder: "Role / Title" },
              { field: "company", placeholder: "Company" },
              { field: "duration", placeholder: "e.g. Jun 2023 – Present" },
            ].map(({ field, placeholder }) => (
              <input
                key={field}
                value={(exp as any)[field]}
                onChange={(e) => updateField(exp.id, field as any, e.target.value)}
                placeholder={placeholder}
                className="bg-surface/40 border border-border-strong rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
              />
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text-faint">Achievements & Bullets</span>
              <button
                onClick={() => addBullet(exp.id)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> bullet
              </button>
            </div>
            {exp.bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-primary mt-2.5 text-xs flex-shrink-0">▸</span>
                <input
                  value={bullet}
                  onChange={(e) => updateBullet(exp.id, i, e.target.value)}
                  placeholder="Describe an achievement with impact..."
                  className="flex-1 bg-surface/40 border border-border-strong rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => onRewriteBullet(exp.id, i)}
                  disabled={!bullet.trim() || rewritingId === `${exp.id}-${i}`}
                  className={`flex-shrink-0 w-8 h-8 mt-0.5 rounded-lg border flex items-center justify-center transition-all disabled:opacity-40 ${
                    rewritingId === `${exp.id}-${i}`
                      ? "border-primary bg-primary/10"
                      : "border-border-strong hover:border-primary hover:bg-primary/10 text-text-faint hover:text-primary"
                  }`}
                >
                  {rewritingId === `${exp.id}-${i}`
                    ? <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                    : <Wand2 className="w-3.5 h-3.5" />
                  }
                </button>
                <button
                  onClick={() => removeBullet(exp.id, i)}
                  className="flex-shrink-0 w-8 h-8 mt-0.5 rounded-lg border border-border-strong text-text-faint hover:text-red-400 hover:border-red-400/30 flex items-center justify-center transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Education Editor
// ─────────────────────────────────────────────────────────────
function EducationEditor({ items, onChange }: { items: Education[]; onChange: (v: Education[]) => void }) {
  if (!items.length) return <p className="text-sm text-text-faint italic">No education added.</p>;

  function update(id: string, field: keyof Education, val: string) {
    onChange(items.map((e) => e.id === id ? { ...e, [field]: val } : e));
  }
  return (
    <div className="space-y-4">
      {items.map((edu) => (
        <div key={edu.id} className="p-5 rounded-xl border border-border-soft bg-surface/20 relative group">
          <button onClick={() => onChange(items.filter((e) => e.id !== edu.id))}
            className="absolute top-3 right-3 text-text-faint hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { field: "degree", placeholder: "Degree / Program" },
              { field: "institution", placeholder: "Institution" },
              { field: "year", placeholder: "e.g. 2021 – 2025" },
              { field: "gpa", placeholder: "GPA (optional)" },
            ].map(({ field, placeholder }) => (
              <input key={field} value={(edu as any)[field] ?? ""} onChange={(e) => update(edu.id, field as any, e.target.value)}
                placeholder={placeholder}
                className="bg-surface/40 border border-border-strong rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skills Editor
// ─────────────────────────────────────────────────────────────
function SkillsEditor({ items, onChange }: { items: SkillGroup[]; onChange: (v: SkillGroup[]) => void }) {
  if (!items.length) return <p className="text-sm text-text-faint italic">No skill groups added.</p>;

  const [inputs, setInputs] = useState<Record<string, string>>({});

  function addItem(id: string) {
    const val = (inputs[id] ?? "").trim();
    if (!val) return;
    onChange(items.map((s) => s.id === id ? { ...s, items: [...s.items, val] } : s));
    setInputs((prev) => ({ ...prev, [id]: "" }));
  }

  return (
    <div className="space-y-4">
      {items.map((group) => (
        <div key={group.id} className="p-5 rounded-xl border border-border-soft bg-surface/20 space-y-3 relative group">
          <button onClick={() => onChange(items.filter((s) => s.id !== group.id))}
            className="absolute top-3 right-3 text-text-faint hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <input value={group.category} onChange={(e) => onChange(items.map((s) => s.id === group.id ? { ...s, category: e.target.value } : s))}
            placeholder="Category (e.g. Languages)"
            className="w-full sm:w-48 bg-surface/40 border border-border-strong rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary" />

          <div className="flex flex-wrap gap-2">
            {group.items.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs font-mono">
                {item}
                <button onClick={() => onChange(items.map((s) => s.id === group.id ? { ...s, items: s.items.filter((_, j) => j !== i) } : s))}>
                  <Trash2 className="w-2.5 h-2.5 hover:text-red-400" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input value={inputs[group.id] ?? ""} onChange={(e) => setInputs((p) => ({ ...p, [group.id]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(group.id); } }}
              placeholder="Add skill, press Enter"
              className="flex-1 bg-surface/40 border border-border-strong rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary" />
            <button onClick={() => addItem(group.id)} className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs hover:bg-primary/20">Add</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Certifications Editor
// ─────────────────────────────────────────────────────────────
function CertificationsEditor({ items, onChange }: { items: Certification[]; onChange: (v: Certification[]) => void }) {
  if (!items.length) return <p className="text-sm text-text-faint italic">No certifications added.</p>;
  function update(id: string, field: keyof Certification, val: string) {
    onChange(items.map((c) => c.id === id ? { ...c, [field]: val } : c));
  }
  return (
    <div className="space-y-3">
      {items.map((cert) => (
        <div key={cert.id} className="grid grid-cols-3 gap-3 relative group p-3 rounded-xl border border-border-soft bg-surface/20">
          <button onClick={() => onChange(items.filter((c) => c.id !== cert.id))}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-surface border border-border-strong text-text-faint hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <Trash2 className="w-2.5 h-2.5" />
          </button>
          {[
            { field: "name", placeholder: "Certificate Name" },
            { field: "issuer", placeholder: "Issuer (e.g. AWS)" },
            { field: "year", placeholder: "Year" },
          ].map(({ field, placeholder }) => (
            <input key={field} value={(cert as any)[field]} onChange={(e) => update(cert.id, field as any, e.target.value)}
              placeholder={placeholder}
              className="bg-surface/40 border border-border-strong rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Resume Preview (print-ready look)
// ─────────────────────────────────────────────────────────────
function ResumePreview({ name, summary, experience, education, skills, certs }: {
  name: string; summary: string; experience: Experience[];
  education: Education[]; skills: SkillGroup[]; certs: Certification[];
}) {
  return (
    <div className="glass-panel rounded-3xl border border-border-strong overflow-hidden">
      <div className="px-6 py-4 border-b border-border-soft flex items-center gap-2">
        <FileText className="w-4 h-4 text-text-faint" />
        <span className="text-xs font-mono text-text-faint uppercase tracking-widest">Live Preview</span>
      </div>
      <div className="p-10 font-sans text-sm leading-relaxed bg-[#0d0d0d]">
        {/* Name */}
        <h1 className="text-3xl font-bold text-white mb-1">{name || "Your Name"}</h1>
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-secondary to-tertiary mb-5" />

        {/* Summary */}
        {summary && (
          <PreviewSection title="SUMMARY">
            <p className="text-text-secondary">{summary}</p>
          </PreviewSection>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <PreviewSection title="EXPERIENCE">
            {experience.map((e) => (
              <div key={e.id} className="mb-4 last:mb-0">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-white">{e.role || "Role"}</span>
                  <span className="text-xs text-text-faint font-mono">{e.duration}</span>
                </div>
                <div className="text-primary text-xs font-mono mb-2">{e.company}</div>
                <ul className="space-y-1">
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-text-secondary">
                      <span className="text-primary flex-shrink-0 mt-0.5">▸</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </PreviewSection>
        )}

        {/* Education */}
        {education.length > 0 && (
          <PreviewSection title="EDUCATION">
            {education.map((e) => (
              <div key={e.id} className="flex items-baseline justify-between mb-2 last:mb-0">
                <div>
                  <span className="font-semibold text-white">{e.degree || "Degree"}</span>
                  <span className="text-text-faint"> — {e.institution}</span>
                </div>
                <div className="text-xs font-mono text-text-faint">{e.year}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
              </div>
            ))}
          </PreviewSection>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <PreviewSection title="SKILLS">
            {skills.filter((s) => s.items.length > 0).map((s) => (
              <div key={s.id} className="flex gap-2 mb-1.5">
                <span className="text-primary font-mono text-xs w-28 flex-shrink-0">{s.category}:</span>
                <span className="text-text-secondary text-xs">{s.items.join(" · ")}</span>
              </div>
            ))}
          </PreviewSection>
        )}

        {/* Certifications */}
        {certs.length > 0 && (
          <PreviewSection title="CERTIFICATIONS">
            {certs.map((c) => (
              <div key={c.id} className="text-text-secondary mb-1">
                <span className="text-white font-medium">{c.name}</span>
                {c.issuer && <span className="text-text-faint"> — {c.issuer}</span>}
                {c.year && <span className="text-text-faint text-xs font-mono"> ({c.year})</span>}
              </div>
            ))}
          </PreviewSection>
        )}
      </div>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-mono text-primary uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
        {title}
        <div className="flex-1 h-px bg-border-soft" />
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ATS Score Panel
// ─────────────────────────────────────────────────────────────
function ScorePanel({ score, isScoring, onScore }: { score: ResumeScore | null; isScoring: boolean; onScore: () => void }) {
  if (isScoring) {
    return (
      <div className="glass-panel rounded-3xl border border-secondary/20 p-8 flex flex-col items-center gap-4 min-h-[280px] justify-center">
        <div className="w-12 h-12 rounded-3xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
          <BrainCircuit className="w-6 h-6 text-secondary animate-pulse" />
        </div>
        <p className="font-display font-semibold text-white">Scoring Resume...</p>
        <div className="flex gap-1.5">
          {[0, 0.15, 0.3].map((d, i) => (
            <motion.div key={i} animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }}
              className="w-2 h-2 rounded-full bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="glass-panel rounded-3xl border border-border-strong p-8 flex flex-col items-center text-center gap-5 min-h-[280px] justify-center">
        <div className="w-14 h-14 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
          <BrainCircuit className="w-7 h-7 text-secondary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-xl mb-2">ATS Score</h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            Get an instant ATS compatibility score and keyword analysis for your target role.
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onScore}
          className="w-full py-3 rounded-2xl bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium hover:bg-secondary/20 transition-all flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" /> Run ATS Check
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {/* Dual scores */}
      <div className="glass-panel rounded-3xl border border-secondary/25 p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-3 mb-5">
          <BrainCircuit className="w-4 h-4 text-secondary animate-pulse" />
          <span className="font-mono text-xs text-secondary uppercase tracking-widest">ATS Analysis</span>
        </div>

        <div className="flex gap-6 mb-5">
          {[
            { label: "ATS Score", value: score.atsScore, color: "#10B981" },
            { label: "Overall", value: score.overallScore, color: "#6366F1" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                  <motion.circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - value / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
              </div>
              <span className="text-xs font-mono text-text-faint">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-text-secondary leading-relaxed italic">"{score.verdict}"</p>
      </div>

      {/* Missing keywords */}
      {score.missingKeywords.length > 0 && (
        <div className="glass-panel rounded-2xl border border-red-400/20 p-5">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-400 rounded-l-2xl" />
          <h4 className="text-xs font-mono text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" /> Missing Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {score.missingKeywords.map((kw) => (
              <span key={kw} className="px-2.5 py-1 rounded-lg bg-red-400/8 border border-red-400/20 text-red-400 text-xs font-mono">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {score.improvements.length > 0 && (
        <div className="glass-panel rounded-2xl border border-tertiary/20 p-5 space-y-2">
          <h4 className="text-xs font-mono text-tertiary uppercase tracking-widest mb-3">Quick Wins</h4>
          {score.improvements.map((imp, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-tertiary flex-shrink-0">→</span> {imp}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function AIButton({ label, onClick, loading, disabled }: {
  label: string; onClick: () => void; loading: boolean; disabled: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-medium hover:bg-primary/20 transition-all disabled:opacity-50"
    >
      {loading
        ? <><div className="w-3.5 h-3.5 border border-primary border-t-transparent rounded-full animate-spin" />Rewriting...</>
        : <><Wand2 className="w-3.5 h-3.5" />{label}</>
      }
    </motion.button>
  );
}


