import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── List User's Connections (Matches & Teams) ─────────────────
export const listConnections = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { matches: [], teams: [] };

    // Find accepted matches where the user is either the teacher or learner
    const matchesAsTeacher = await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "accepted"))
      .filter(q => q.eq(q.field("teacherId"), userId))
      .collect();

    const matchesAsLearner = await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "accepted"))
      .filter(q => q.eq(q.field("learnerId"), userId))
      .collect();

    const allMatches = [...matchesAsTeacher, ...matchesAsLearner];
    
    // Resolve peer profiles
    const resolvedMatches = await Promise.all(
      allMatches.map(async (m) => {
        const peerId = m.teacherId === userId ? m.learnerId : m.teacherId;
        const peerProfile = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", peerId)).first();
        const role = m.teacherId === userId ? "Teacher" : "Learner";
        return {
          id: m._id,
          type: "match",
          threadId: `match_${m._id}`,
          peerId,
          name: peerProfile?.name || "Anonymous",
          role,
        };
      })
    );

    // Find hackathon teams the user is part of
    const teamMemberships = await ctx.db
      .query("hackathonMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "approved"))
      .collect();

    const resolvedTeams = (await Promise.all(
      teamMemberships.map(async (tm) => {
        const team = await ctx.db.get(tm.teamId);
        if (!team) return null;
        return {
          id: team._id,
          type: "team",
          threadId: `team_${team._id}`,
          name: team.name,
          role: tm.role,
        };
      })
    )).filter(Boolean);

    return {
      matches: resolvedMatches,
      teams: resolvedTeams,
    };
  },
});

// ── Realtime Chat: Get Messages ───────────────────────────────
export const getMessages = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();

    // Resolve sender profiles
    return await Promise.all(
      messages.map(async (m) => {
        const profile = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", m.senderId)).first();
        return { ...m, senderName: profile?.name || "Anonymous" };
      })
    );
  },
});

// ── Realtime Chat: Send Message ───────────────────────────────
export const sendMessage = mutation({
  args: {
    threadId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("chatMessages", {
      threadId: args.threadId,
      senderId: userId,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

// ── Realtime Chat: Send AI PM Message ────────────────────────
export const sendAIPMMessage = mutation({
  args: {
    threadId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    let aiUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "ai-teammate@skillswap.os"))
      .first();

    if (!aiUser) {
      const id = await ctx.db.insert("users", {
        email: "ai-teammate@skillswap.os",
      });
      await ctx.db.insert("profiles", {
        userId: id,
        name: "🤖 AI Teammate (PM)",
        bio: "Autonomous AI Project Manager and Tech Lead",
      });
      aiUser = { _id: id };
    }

    await ctx.db.insert("chatMessages", {
      threadId: args.threadId,
      senderId: aiUser._id,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

// ── Communities: List & Join ──────────────────────────────────
export const listCommunities = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const communities = await ctx.db.query("communities").order("desc").collect();
    
    if (!userId) return communities.map(c => ({ ...c, isMember: false, memberCount: 0 }));

    return await Promise.all(
      communities.map(async (c) => {
        const membership = await ctx.db
          .query("communityMembers")
          .withIndex("by_community_user", (q) => q.eq("communityId", c._id).eq("userId", userId))
          .first();
        
        const members = await ctx.db.query("communityMembers").withIndex("by_community", q => q.eq("communityId", c._id)).collect();

        return { ...c, isMember: !!membership, memberCount: members.length };
      })
    );
  },
});

export const joinCommunity = mutation({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("communityMembers")
      .withIndex("by_community_user", (q) => q.eq("communityId", args.communityId).eq("userId", userId))
      .first();

    if (!existing) {
      await ctx.db.insert("communityMembers", {
        communityId: args.communityId,
        userId,
        joinedAt: Date.now(),
      });
    }
  },
});

// ── Seed Communities ──────────────────────────────────────────
export const seedCommunities = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const existing = await ctx.db.query("communities").first();
    if (existing) return;

    await ctx.db.insert("communities", {
      name: "React Masters",
      description: "Discuss advanced React patterns, Server Components, and Turbopack.",
      tags: ["React", "Next.js", "Frontend"],
      creatorId: userId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("communities", {
      name: "AI Builders",
      description: "Build the next generation of agents. Discuss LLMs, RAG, and Vector DBs.",
      tags: ["AI", "Agents", "LLMs"],
      creatorId: userId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("communities", {
      name: "Web3 Innovators",
      description: "Smart contracts, DeFi, and decentralized systems.",
      tags: ["Web3", "Solidity", "Crypto"],
      creatorId: userId,
      createdAt: Date.now(),
    });
  },
});
