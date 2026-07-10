import {
  BrainCircuit, FileText, Mic2, BookOpen,
  Map, Briefcase, Zap, Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AgentDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  color: string;
  glow: string;
  border: string;
  bg: string;
  gradient: string;
  starterPrompts: string[];
}

export const AGENTS: AgentDef[] = [
  {
    id: "career-coach",
    name: "Career Coach",
    tagline: "Your strategic career advisor",
    description:
      "Identifies your strengths, maps career pivots, and builds high-leverage strategies for growth.",
    icon: BrainCircuit,
    color: "text-primary",
    glow: "shadow-[0_0_30px_rgba(182,222,195,0.3)]",
    border: "border-primary/30",
    bg: "bg-primary/10",
    gradient: "from-primary/20 to-primary/5",
    starterPrompts: [
      "I want to pivot from backend to ML engineering — what's my path?",
      "How do I negotiate a 30% salary raise at my next review?",
      "I've been in the same role for 3 years. What should I do?",
    ],
  },
  {
    id: "resume-reviewer",
    name: "Resume Reviewer",
    tagline: "Brutally honest, actionable feedback",
    description:
      "Analyzes your resume like a FAANG hiring manager. Points out weak spots and rewrites on demand.",
    icon: FileText,
    color: "text-secondary",
    glow: "shadow-[0_0_30px_rgba(206,190,249,0.3)]",
    border: "border-secondary/30",
    bg: "bg-secondary/10",
    gradient: "from-secondary/20 to-secondary/5",
    starterPrompts: [
      "Review my resume summary: I am a software engineer with 3 years of experience...",
      "How do I quantify achievements if I don't have metrics?",
      "What should a senior developer's resume look like in 2025?",
    ],
  },
  {
    id: "interview-coach",
    name: "Interview Coach",
    tagline: "Run mock interviews anytime",
    description:
      "Behavioral, technical, system design — the AI coach pushes you until you're ready.",
    icon: Mic2,
    color: "text-tertiary",
    glow: "shadow-[0_0_30px_rgba(221,212,191,0.3)]",
    border: "border-tertiary/30",
    bg: "bg-tertiary/10",
    gradient: "from-tertiary/20 to-tertiary/5",
    starterPrompts: [
      "Start a mock behavioral interview for a senior PM role at Stripe",
      "Ask me a system design question for a distributed cache",
      "What's my biggest weakness? How do I answer that?",
    ],
  },
  {
    id: "learning-planner",
    name: "Learning Planner",
    tagline: "Hyper-efficient skill roadmaps",
    description:
      "Designs week-by-week learning plans with specific resources, projects, and milestones.",
    icon: BookOpen,
    color: "text-primary",
    glow: "shadow-[0_0_30px_rgba(182,222,195,0.3)]",
    border: "border-primary/30",
    bg: "bg-primary/10",
    gradient: "from-primary/20 to-primary/5",
    starterPrompts: [
      "Create a 12-week plan to learn machine learning from scratch",
      "I want to master TypeScript in 30 days — build me a plan",
      "What's the fastest path to becoming production-ready in Rust?",
    ],
  },
  {
    id: "roadmap-generator",
    name: "Roadmap Generator",
    tagline: "Career & project blueprints",
    description:
      "Generates phased career roadmaps with milestones, skills, tools, and timeframes.",
    icon: Map,
    color: "text-secondary",
    glow: "shadow-[0_0_30px_rgba(206,190,249,0.3)]",
    border: "border-secondary/30",
    bg: "bg-secondary/10",
    gradient: "from-secondary/20 to-secondary/5",
    starterPrompts: [
      "Build me a roadmap to become a Staff Engineer in 2 years",
      "I want to launch a SaaS product as a solo founder — what's the plan?",
      "Map out the path from junior to principal data scientist",
    ],
  },
  {
    id: "portfolio-reviewer",
    name: "Portfolio Reviewer",
    tagline: "Make your work impossible to ignore",
    description:
      "Evaluates projects, storytelling, and presentation like a senior at Vercel or Linear.",
    icon: Briefcase,
    color: "text-tertiary",
    glow: "shadow-[0_0_30px_rgba(221,212,191,0.3)]",
    border: "border-tertiary/30",
    bg: "bg-tertiary/10",
    gradient: "from-tertiary/20 to-tertiary/5",
    starterPrompts: [
      "Review my portfolio project: I built a real-time chat app using Socket.io...",
      "What projects should a full-stack developer have in 2025?",
      "How do I make my side projects sound more impressive?",
    ],
  },
  {
    id: "hackathon-advisor",
    name: "Hackathon Advisor",
    tagline: "Win your next hackathon",
    description:
      "Rapid ideation, MVP scoping, team strategy, and pitch coaching for 24–48hr builds.",
    icon: Zap,
    color: "text-primary",
    glow: "shadow-[0_0_30px_rgba(182,222,195,0.3)]",
    border: "border-primary/30",
    bg: "bg-primary/10",
    gradient: "from-primary/20 to-primary/5",
    starterPrompts: [
      "The hackathon theme is 'AI for social good' — help me brainstorm 5 ideas",
      "How do we scope an MVP for a 24-hour hackathon with 3 devs?",
      "Help me write a winning 2-minute pitch for a fintech hack project",
    ],
  },
  {
    id: "networking-coach",
    name: "Networking Coach",
    tagline: "Strategic relationship building",
    description:
      "Craft cold outreach, prepare for informational interviews, build authentic networks.",
    icon: Users,
    color: "text-secondary",
    glow: "shadow-[0_0_30px_rgba(206,190,249,0.3)]",
    border: "border-secondary/30",
    bg: "bg-secondary/10",
    gradient: "from-secondary/20 to-secondary/5",
    starterPrompts: [
      "Write me a cold DM to a senior engineer at Google I want to learn from",
      "How do I prepare for an informational interview with a VC partner?",
      "I want to break into the AI startup scene — who should I be talking to?",
    ],
  },
];

export function getAgent(id: string): AgentDef | undefined {
  return AGENTS.find((a) => a.id === id);
}
