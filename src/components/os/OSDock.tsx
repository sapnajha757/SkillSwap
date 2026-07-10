"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit, Globe, GraduationCap, Users,
  Sparkles, Bot, Briefcase, FileText, Trophy, BarChart3, TrendingUp,
} from "lucide-react";
import { cn } from "@/utils/cn";

const DOCK_ITEMS = [
  {
    label: "Nexus",
    href: "/os",
    icon: BrainCircuit,
    color: "text-primary",
    glow: "shadow-[0_0_20px_rgba(182,222,195,0.35)]",
  },
  {
    label: "Career",
    href: "/os/career",
    icon: Globe,
    color: "text-secondary",
    glow: "shadow-[0_0_20px_rgba(206,190,249,0.35)]",
  },
  {
    label: "Portfolio",
    href: "/os/portfolio",
    icon: Briefcase,
    color: "text-tertiary",
    glow: "shadow-[0_0_20px_rgba(221,212,191,0.35)]",
  },
  {
    label: "Resume",
    href: "/os/resume",
    icon: FileText,
    color: "text-primary",
    glow: "shadow-[0_0_20px_rgba(182,222,195,0.35)]",
  },
  {
    label: "Agents",
    href: "/os/agents",
    icon: Bot,
    color: "text-secondary",
    glow: "shadow-[0_0_20px_rgba(206,190,249,0.35)]",
  },
  {
    label: "Learning",
    href: "/os/learning",
    icon: GraduationCap,
    color: "text-tertiary",
    glow: "shadow-[0_0_20px_rgba(221,212,191,0.35)]",
  },
  {
    label: "Hackathons",
    href: "/os/hackathons",
    icon: Trophy,
    color: "text-primary",
    glow: "shadow-[0_0_20px_rgba(182,222,195,0.35)]",
  },
  {
    label: "Network",
    href: "/os/network",
    icon: Users,
    color: "text-secondary",
    glow: "shadow-[0_0_20px_rgba(206,190,249,0.35)]",
  },
  {
    label: "Analytics",
    href: "/os/analytics",
    icon: BarChart3,
    color: "text-tertiary",
    glow: "shadow-[0_0_20px_rgba(221,212,191,0.35)]",
  },
  {
    label: "Capital",
    href: "/os/investors",
    icon: TrendingUp,
    color: "text-primary",
    glow: "shadow-[0_0_20px_rgba(182,222,195,0.35)]",
  },
];

export function OSDock() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto px-4">
      <motion.div
        initial={shouldReduceMotion ? { y: 0, opacity: 0 } : { y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="flex items-center gap-1.5 px-3 py-2.5 glass-panel rounded-2xl border border-border-strong shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md"
      >
        {/* Logo mark */}
        <motion.div 
          whileHover={shouldReduceMotion ? {} : { rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-sage-dim flex items-center justify-center mr-1 shadow-[0_0_16px_rgba(182,222,195,0.25)] flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-on-primary" />
        </motion.div>

        <div className="w-px h-7 bg-border-strong mx-1" />

        {DOCK_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.14 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.94, y: -2 }}
                transition={{ type: "spring", stiffness: 500, damping: 22, mass: 0.6 }}
                className="relative flex flex-col items-center gap-1 group"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300",
                    isActive
                      ? `bg-surface-container-high border border-border-strong ${item.glow}`
                      : "hover:bg-surface-container border border-transparent hover:border-border-soft"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors duration-200",
                      isActive ? item.color : "text-text-faint group-hover:text-text-muted"
                    )}
                  />
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="dock-indicator"
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 450, damping: 26 }}
                  />
                )}

                {/* Tooltip — animated Framer-Motion style */}
                <AnimatePresence>
                  <motion.div 
                    initial={{ opacity: 0, y: 8, x: "-50%", scale: 0.9 }}
                    whileHover={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute -top-10 left-1/2 px-2.5 py-1 rounded-lg bg-surface-container border border-border-strong text-[11px] font-mono text-text-muted opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-lg whitespace-nowrap z-50"
                  >
                    {item.label}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
