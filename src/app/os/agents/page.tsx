"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AGENTS } from "@/constants/agents";
import { Sparkles, ArrowRight } from "lucide-react";
import { StaggerGroup, StaggerItem, AIPulse, springs } from "@/components/motion/primitives";

export default function AgentsHubPage() {
  return (
    <div className="min-h-screen bg-background pb-36 overflow-x-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[700px] h-[700px] bg-primary/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-secondary/8 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono text-xs text-primary uppercase tracking-widest">
              AI Operating System · Agent Fleet
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-4">
            Your AI<br />
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              Career Team
            </span>
          </h1>
          <p className="text-text-secondary text-lg max-w-xl leading-relaxed">
            Eight specialized AI agents. Each one an expert in its domain.
            All with memory of your career context. Available 24/7.
          </p>
        </motion.div>

        {/* Agent Grid */}
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {AGENTS.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <StaggerItem key={agent.id}>
                <Link href={`/os/agents/${agent.id}`} className="block group h-full">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springs.gentle}
                    className={`
                      h-full glass-panel rounded-3xl p-7 border relative overflow-hidden
                      ${agent.border} cursor-pointer
                      hover:${agent.glow}
                      transition-shadow duration-300
                    `}
                    style={{ willChange: "transform" }}
                  >
                    {/* Background gradient blob */}
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${agent.gradient} blur-[60px] rounded-full pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100`} />

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl ${agent.bg} border ${agent.border} flex items-center justify-center mb-5 relative`}>
                      <Icon className={`w-6 h-6 ${agent.color}`} />
                    </div>

                    {/* Text */}
                    <h3 className="font-display text-xl font-bold text-white mb-1.5 relative">
                      {agent.name}
                    </h3>
                    <p className={`text-xs font-mono mb-3 relative ${agent.color}`}>
                      {agent.tagline}
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed relative">
                      {agent.description}
                    </p>

                    {/* CTA */}
                    <div className={`mt-6 flex items-center gap-2 text-xs font-mono relative ${agent.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <span>Start Session</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>

                    {/* Bottom accent line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${agent.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </motion.div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex items-center justify-center gap-3 text-xs font-mono text-text-faint"
        >
          <AIPulse isActive size={14} color="var(--color-secondary)" />
          All agents share your career context · Conversations are persistent · Memory is private
        </motion.div>
      </div>
    </div>
  );
}


