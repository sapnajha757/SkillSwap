"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { OSLoader } from "@/components/os/OSShared";
import {
  Users, Send, Search, Users2, UserSquare2, MessageSquare, 
  Hash, ArrowRight, ShieldCheck, Zap
} from "lucide-react";

export default function NetworkingPage() {
  // Data
  const connections = useQuery(api.networking.listConnections);
  const communities = useQuery(api.networking.listCommunities);
  const joinCommunity = useMutation(api.networking.joinCommunity);
  const seed = useMutation(api.networking.seedCommunities);

  useEffect(() => {
    if (communities && communities.length === 0) seed();
  }, [communities, seed]);

  // State
  const [activeTab, setActiveTab] = useState<"chats" | "communities">("chats");
  const [activeThread, setActiveThread] = useState<{ id: string; name: string; type: string } | null>(null);

  // Auto-select first chat
  useEffect(() => {
    if (activeTab === "chats" && !activeThread && connections) {
      if (connections.matches.length > 0) {
        setActiveThread({ id: connections.matches[0].threadId, name: connections.matches[0].name, type: "Match" });
      } else if (connections.teams.length > 0) {
        setActiveThread({ id: connections.teams[0].threadId, name: connections.teams[0].name, type: "Team" });
      }
    }
  }, [connections, activeThread, activeTab]);

  if (connections === undefined || communities === undefined) return <OSLoader label="Retrieving Direct Feeds & Communities..." />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-32">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[0%] left-[20%] w-[500px] h-[500px] bg-secondary/10 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/8 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">Global Network</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">
            Connect & <span className="bg-gradient-to-r from-secondary via-primary to-tertiary bg-clip-text text-transparent">Collaborate</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8 items-start h-[700px]">
          {/* Sidebar */}
          <div className="glass-panel rounded-3xl border border-border-strong overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-border-soft flex gap-2">
              <button
                onClick={() => setActiveTab("chats")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "chats" ? "bg-surface/60 text-white shadow-sm" : "text-text-faint hover:text-white"}`}
              >
                Direct Chats
              </button>
              <button
                onClick={() => setActiveTab("communities")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "communities" ? "bg-surface/60 text-white shadow-sm" : "text-text-faint hover:text-white"}`}
              >
                Communities
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === "chats" && (
                <>
                  {!connections ? (
                    <div className="animate-pulse space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-surface/50 rounded-xl" />)}</div>
                  ) : connections.matches.length === 0 && connections.teams.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <MessageSquare className="w-8 h-8 text-text-faint mx-auto mb-3" />
                      <p className="text-sm text-text-secondary">No active matches or teams. Find peers in the Career hub!</p>
                    </div>
                  ) : (
                    <>
                      {connections.matches.map((m: any) => (
                        <ChatRow key={m.id} icon={<UserSquare2 className="w-4 h-4 text-secondary" />} title={m.name} subtitle={`Match (${m.role})`}
                          isActive={activeThread?.id === m.threadId} onClick={() => setActiveThread({ id: m.threadId, name: m.name, type: "Peer Match" })} />
                      ))}
                      {connections.teams.map((t: any) => (
                        <ChatRow key={t.id} icon={<Users2 className="w-4 h-4 text-primary" />} title={t.name} subtitle="Hackathon Team"
                          isActive={activeThread?.id === t.threadId} onClick={() => setActiveThread({ id: t.threadId, name: t.name, type: "Team Chat" })} />
                      ))}
                    </>
                  )}
                </>
              )}

              {activeTab === "communities" && (
                <>
                  {!communities ? (
                    <div className="animate-pulse space-y-2">{[1, 2].map(i => <div key={i} className="h-24 bg-surface/50 rounded-xl" />)}</div>
                  ) : communities.map((c: any) => (
                    <div key={c._id} className="p-4 rounded-xl border border-border-soft bg-surface/20 hover:border-border-strong transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-display font-bold text-white flex items-center gap-2"><Hash className="w-4 h-4 text-text-faint" /> {c.name}</h4>
                        <span className="text-[10px] font-mono text-text-faint uppercase bg-surface px-2 py-0.5 rounded">{c.memberCount} MBRS</span>
                      </div>
                      <p className="text-xs text-text-secondary mb-4 line-clamp-2">{c.description}</p>
                      {c.isMember ? (
                        <button onClick={() => setActiveThread({ id: `community_${c._id}`, name: c.name, type: "Community" })} className="w-full py-2 rounded-lg bg-surface/60 text-white text-xs font-medium border border-border-strong hover:bg-surface transition-all">
                          Open Chat
                        </button>
                      ) : (
                        <button onClick={() => joinCommunity({ communityId: c._id })} className="w-full py-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold hover:bg-secondary/20 transition-all">
                          Join Community
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="glass-panel rounded-3xl border border-border-strong overflow-hidden flex flex-col h-full relative">
            {activeThread ? (
              <ChatInterface threadId={activeThread.id} name={activeThread.name} type={activeThread.type} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <div className="w-16 h-16 rounded-full bg-surface/60 border border-border-strong flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-text-faint" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Select a Conversation</h3>
                <p className="text-sm text-text-secondary">Choose a chat from the sidebar to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatRow({ icon, title, subtitle, isActive, onClick }: any) {
  return (
    <div onClick={onClick} className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${isActive ? "bg-surface/80 border border-border-strong" : "hover:bg-surface/40 border border-transparent"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "bg-background border border-border-soft" : "bg-surface"}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-white truncate">{title}</h4>
        <p className="text-xs text-text-faint font-mono truncate">{subtitle}</p>
      </div>
    </div>
  );
}

function ChatInterface({ threadId, name, type }: any) {
  // To keep it simple, we'll determine "isMe" by checking if the message sender name matches ours, or just fetching profile.
  // We'll use a hack: passing userId from server if needed, but for now we just rely on senderId matching a query if possible.
  // Actually, getAuthUserId gives a token. Let's just use CSS generic layouts.

  const messages = useQuery(api.networking.getMessages, { threadId });
  const sendMessage = useMutation(api.networking.sendMessage);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const val = input;
    setInput("");
    await sendMessage({ threadId, content: val });
  }

  return (
    <>
      <div className="px-6 py-4 border-b border-border-soft bg-background/50 backdrop-blur-xl absolute top-0 left-0 right-0 z-10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-surface/80 border border-border-strong flex items-center justify-center">
          {type === "Community" ? <Hash className="w-5 h-5 text-text-secondary" /> : <UserSquare2 className="w-5 h-5 text-text-secondary" />}
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-lg leading-tight">{name}</h3>
          <span className="text-[10px] font-mono text-secondary uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> {type}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-4">
        {!messages ? (
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-16 w-64 bg-surface rounded-2xl rounded-tl-sm" />
            <div className="h-12 w-48 bg-surface rounded-2xl rounded-tr-sm self-end" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-faint text-sm font-mono">No messages yet. Say hello!</div>
        ) : (
          messages.map((m: any, i: number) => {
            // Simplified: we won't perfectly know "isMe" without fetching my profile, 
            // but we can assume consecutive messages from same person group together.
            // Let's just style them all neutrally for a group chat, or right-align if senderName implies "me".
            // Since we lack `isMe` easily, we'll left-align with names.
            return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m._id} className="flex flex-col items-start max-w-[80%]">
                <span className="text-[10px] font-mono text-text-faint mb-1 ml-1">{m.senderName}</span>
                <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-surface/60 border border-border-soft text-sm text-white shadow-sm">
                  {m.content}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-border-soft bg-background/50 backdrop-blur-xl">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message..."
            className="w-full bg-surface border border-border-strong rounded-2xl pl-5 pr-14 py-4 text-sm text-white placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-secondary"
          />
          <button type="submit" disabled={!input.trim()} className="absolute right-2 top-2 bottom-2 w-10 bg-secondary text-background rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-secondary/80 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}


