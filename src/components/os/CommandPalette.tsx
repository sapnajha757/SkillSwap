"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Search, BrainCircuit, Globe, Briefcase, FileText, Bot, 
  GraduationCap, Trophy, Users, BarChart3, TrendingUp 
} from "lucide-react";
import { springs } from "@/components/motion/primitives";

interface CommandItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

const COMMANDS: CommandItem[] = [
  { label: "Go to Nexus (Workspace)", href: "/os", icon: BrainCircuit, category: "Navigation" },
  { label: "Go to Career Universe", href: "/os/career", icon: Globe, category: "Navigation" },
  { label: "Go to Portfolio", href: "/os/portfolio", icon: Briefcase, category: "Navigation" },
  { label: "Go to Resume", href: "/os/resume", icon: FileText, category: "Navigation" },
  { label: "Go to AI Agents Hub", href: "/os/agents", icon: Bot, category: "Navigation" },
  { label: "Go to Learning Paths", href: "/os/learning", icon: GraduationCap, category: "Navigation" },
  { label: "Go to Hackathon Hub", href: "/os/hackathons", icon: Trophy, category: "Navigation" },
  { label: "Go to Network", href: "/os/network", icon: Users, category: "Navigation" },
  { label: "Go to Analytics", href: "/os/analytics", icon: BarChart3, category: "Navigation" },
  { label: "Go to Investor Mode (Capital)", href: "/os/investors", icon: TrendingUp, category: "Navigation" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 50);
    }
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        navigate(filteredCommands[selectedIndex].href);
      }
    }
  };

  const navigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Trigger Hint floating above OS Dock */}
      <div 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-surface-container-low/80 backdrop-blur border border-border-soft px-3 py-1.5 rounded-full text-[11px] font-mono text-text-faint hover:text-text-muted hover:border-border-strong cursor-pointer transition-all shadow-md select-none flex items-center gap-1.5"
      >
        <span>Press</span>
        <kbd className="bg-surface-container-high px-1.5 py-0.5 rounded border border-border-strong text-white text-[10px]">⌘</kbd>
        <span>+</span>
        <kbd className="bg-surface-container-high px-1.5 py-0.5 rounded border border-border-strong text-white text-[10px]">K</kbd>
        <span>for Command Palette</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[150] bg-background/80 backdrop-blur-md flex items-start justify-center pt-24 px-6"
          >
            <motion.div
              initial={shouldReduceMotion ? { scale: 1, y: 0 } : { scale: 0.97, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { scale: 1, y: 0 } : { scale: 0.97, y: 8 }}
              transition={springs.snappy}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl glass-panel-high border border-border-strong rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-soft">
                <Search className="w-5 h-5 text-text-faint flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or page name..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-text-faint focus:outline-none"
                />
                <kbd className="bg-surface-container-high px-1.5 py-0.5 rounded border border-border-strong text-text-faint text-[10px]">ESC</kbd>
              </div>

              <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-3 text-xs font-mono text-text-faint">No commands found.</div>
                ) : (
                  filteredCommands.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={cmd.href}
                        onClick={() => navigate(cmd.href)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10 border border-primary/20 text-white" : "border border-transparent text-text-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-primary animate-pulse" : "text-text-faint"}`} />
                          <span className="text-sm font-medium">{cmd.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-text-faint uppercase tracking-wider">{cmd.category}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
