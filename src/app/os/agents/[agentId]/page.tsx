"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useAction } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { getAgent } from "@/constants/agents";
import { OSLoader } from "@/components/os/OSShared";
import {
  ArrowLeft, CornerDownLeft, Sparkles, Copy, Check,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

// ─────────────────────────────────────────────────────────────
// Agent Chat Page
// ─────────────────────────────────────────────────────────────
export default function AgentChatPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.agentId as string;
  const agent = getAgent(agentId);

  useEffect(() => {
    if (agent === undefined) router.replace("/os/agents");
  }, [agent, router]);

  const [conversationId, setConversationId] = useState<Id<"agentConversations"> | undefined>(undefined);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [localMessages, setLocalMessages] = useState<Array<{
    role: "user" | "assistant"; content: string; id: string;
  }>>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Find existing conversation
  const existingConvo = useQuery(
    api.agents.findConversation,
    { agentId }
  );
  const storedMessages = useQuery(
    api.agents.conversationMessages,
    conversationId ? { conversationId } : "skip"
  );
  const careerStats = useQuery(api.profiles.myCareerStats);

  const chatAction = useAction(api.agentChat.chat);

  // On mount: load existing conversation
  useEffect(() => {
    if (existingConvo) {
      setConversationId(existingConvo._id);
    }
  }, [existingConvo]);

  // Sync stored messages → local (for real-time updates)
  useEffect(() => {
    if (storedMessages && storedMessages.length > 0) {
      setLocalMessages(
        storedMessages.map((m: any) => ({
          role: m.role,
          content: m.content,
          id: m._id,
        }))
      );
    }
  }, [storedMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, isThinking]);

  // Build career context string from stats
  const careerContext = careerStats
    ? [
        careerStats.teachSkills.length > 0
          ? `Teaching: ${careerStats.teachSkills.map((s: any) => s.skill).join(", ")}`
          : null,
        careerStats.learnSkills.length > 0
          ? `Learning: ${careerStats.learnSkills.map((s: any) => s.skill).join(", ")}`
          : null,
        `Matches: ${careerStats.totalMatches} total, ${careerStats.acceptedMatches} accepted`,
      ]
        .filter(Boolean)
        .join(" | ")
    : undefined;

  const handleSend = useCallback(async () => {
    if (!input.trim() || isThinking) return;
    const userText = input.trim();
    setInput("");

    // Optimistic user message
    const userMsgId = `opt-user-${Date.now()}`;
    setLocalMessages((prev) => [
      ...prev,
      { role: "user", content: userText, id: userMsgId },
    ]);

    setIsThinking(true);
    try {
      const result = await chatAction({
        agentId,
        conversationId,
        userMessage: userText,
        careerContext,
      });

      // Set the real conversation ID (if this was the first message)
      if (!conversationId) {
        setConversationId(result.conversationId);
      }

      // Update local: replace optimistic + add assistant
      setLocalMessages((prev) => {
        const without = prev.filter((m) => m.id !== userMsgId);
        return [
          ...without,
          { role: "user" as const, content: userText, id: `user-${Date.now()}` },
          { role: "assistant" as const, content: result.assistantContent, id: `ai-${Date.now()}` },
        ];
      });
    } catch (err) {
      console.error(err);
      setLocalMessages((prev) => prev.filter((m) => m.id !== userMsgId));
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isThinking, conversationId, agentId, careerContext, chatAction]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function copyMessage(content: string, id: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (!agent) return <OSLoader label="Resolving Agent profile..." />;

  const Icon = agent.icon;
  const hasMessages = localMessages.length > 0;

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] ${agent.bg} blur-[180px] rounded-full opacity-40`} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/8 blur-[180px] rounded-full" />
      </div>

      {/* ── Header Bar ── */}
      <div className="relative z-30 flex items-center gap-4 px-6 py-4 border-b border-border-soft glass-panel">
        <Link href="/os/agents">
          <motion.div
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl border border-border-strong flex items-center justify-center text-text-faint hover:text-white hover:bg-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.div>
        </Link>

        <div className={`w-10 h-10 rounded-2xl ${agent.bg} border ${agent.border} flex items-center justify-center flex-shrink-0 ${agent.glow}`}>
          <Icon className={`w-5 h-5 ${agent.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-white text-lg leading-tight">{agent.name}</h1>
          <p className={`text-xs font-mono ${agent.color} truncate`}>{agent.tagline}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-xs font-mono text-text-faint">Active</span>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto relative z-10 pb-4" style={{ scrollbarWidth: "none" }}>
        {!hasMessages ? (
          <WelcomeScreen agent={agent} onPrompt={(p) => { setInput(p); inputRef.current?.focus(); }} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
            <AnimatePresence initial={false}>
              {localMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  agent={agent}
                  copiedId={copiedId}
                  onCopy={copyMessage}
                />
              ))}
            </AnimatePresence>

            {/* Thinking indicator */}
            <AnimatePresence>
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-start gap-4"
                >
                  <div className={`w-9 h-9 rounded-2xl ${agent.bg} border ${agent.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${agent.color}`} />
                  </div>
                  <div className={`px-5 py-4 rounded-3xl rounded-tl-md ${agent.bg} border ${agent.border} flex items-center gap-1.5`}>
                    {[0, 0.15, 0.3].map((d, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [-3, 3, -3] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                        className={`w-2 h-2 rounded-full ${agent.color.replace("text-", "bg-")}`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}
      </div>

      {/* ── Input Bar ── */}
      <div className="relative z-30 border-t border-border-soft glass-panel px-4 py-4 pb-28">
        <div className="max-w-3xl mx-auto">
          <div className={`relative rounded-2xl border ${agent.border} bg-surface/40 backdrop-blur-xl transition-all ${isThinking ? "opacity-60 pointer-events-none" : ""}`}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Ask ${agent.name}...`}
              rows={1}
              disabled={isThinking}
              className="w-full bg-transparent px-5 py-4 pr-16 text-base text-white placeholder:text-text-faint focus:outline-none resize-none leading-relaxed"
              style={{ maxHeight: "160px", overflowY: "auto" }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 160) + "px";
              }}
            />
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute right-3 bottom-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${agent.bg} border ${agent.border} ${agent.color} hover:opacity-80`}
            >
              {isThinking
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <CornerDownLeft className="w-4 h-4" />
              }
            </motion.button>
          </div>
          <div className="flex items-center justify-between mt-2.5 px-1">
            <span className="text-xs font-mono text-text-faint">
              ↵ Send · Shift+↵ New line · Career context is shared automatically
            </span>
            {careerStats && (
              <span className="text-xs font-mono text-text-faint">
                Context: {careerStats.teachSkills.length + careerStats.learnSkills.length} skills loaded
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Welcome Screen (empty state)
// ─────────────────────────────────────────────────────────────
function WelcomeScreen({
  agent,
  onPrompt,
}: {
  agent: ReturnType<typeof getAgent> & {};
  onPrompt: (p: string) => void;
}) {
  const Icon = agent!.icon;
  return (
    <div className="flex flex-col items-center justify-center h-full pt-20 pb-12 px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`w-20 h-20 rounded-3xl ${agent!.bg} border ${agent!.border} flex items-center justify-center mb-6 ${agent!.glow}`}
      >
        <Icon className={`w-10 h-10 ${agent!.color}`} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-3xl font-bold text-white text-center mb-3"
      >
        {agent!.name}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-text-secondary text-base text-center max-w-md leading-relaxed mb-10"
      >
        {agent!.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full max-w-2xl space-y-3"
      >
        <p className="text-xs font-mono text-text-faint text-center uppercase tracking-widest mb-4">
          Suggested starting points
        </p>
        {agent!.starterPrompts.map((prompt, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            whileHover={{ x: 6 }}
            onClick={() => onPrompt(prompt)}
            className={`w-full text-left px-6 py-4 rounded-2xl border ${agent!.border} ${agent!.bg} text-text-secondary hover:text-white text-sm leading-relaxed transition-all flex items-center justify-between group`}
          >
            <span>{prompt}</span>
            <Sparkles className={`w-4 h-4 ${agent!.color} opacity-0 group-hover:opacity-100 flex-shrink-0 ml-4 transition-opacity`} />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────
function MessageBubble({
  msg,
  agent,
  copiedId,
  onCopy,
}: {
  msg: { role: "user" | "assistant"; content: string; id: string };
  agent: ReturnType<typeof getAgent> & {};
  copiedId: string | null;
  onCopy: (content: string, id: string) => void;
}) {
  const isUser = msg.role === "user";
  const Icon = agent!.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
          U
        </div>
      ) : (
        <div className={`w-9 h-9 rounded-2xl ${agent!.bg} border ${agent!.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${agent!.color}`} />
        </div>
      )}

      {/* Bubble */}
      <div className={`group relative max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-5 py-4 rounded-3xl text-sm leading-relaxed ${
            isUser
              ? "bg-white/10 border border-white/15 text-white rounded-tr-md"
              : `${agent!.bg} border ${agent!.border} text-text-primary rounded-tl-md`
          }`}
        >
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button (assistant only) */}
        {!isUser && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-text-faint hover:text-text-secondary transition-colors px-1"
            onClick={() => onCopy(msg.content, msg.id)}
          >
            {copiedId === msg.id ? (
              <><Check className="w-3 h-3 text-secondary" />Copied</>
            ) : (
              <><Copy className="w-3 h-3" />Copy</>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}


