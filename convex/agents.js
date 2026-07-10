import { internalMutation, internalQuery, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Internal: create a conversation ──────────────────────────
export const createConversation = internalMutation({
  args: {
    userId: v.id("users"),
    agentId: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentConversations", {
      userId: args.userId,
      agentId: args.agentId,
      title: args.title,
      lastMessageAt: Date.now(),
    });
  },
});

// ── Internal: fetch conversation metadata for verification ────
export const getConversationInternal = internalQuery({
  args: { conversationId: v.id("agentConversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

// ── Internal: bump lastMessageAt ──────────────────────────────
export const touchConversation = internalMutation({
  args: { conversationId: v.id("agentConversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { lastMessageAt: Date.now() });
  },
});

// ── Internal: add a message ───────────────────────────────────
export const addMessage = internalMutation({
  args: {
    conversationId: v.id("agentConversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("agentMessages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

// ── Internal: fetch recent messages (context window) ──────────
export const getRecentMessages = internalQuery({
  args: {
    conversationId: v.id("agentConversations"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("agentMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(args.limit);
    return all.reverse(); // chronological order for LLM context
  },
});

// ── Public: list the current user's conversations ─────────────
export const myConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("agentConversations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ── Public: get conversation messages (real-time) ─────────────
export const conversationMessages = query({
  args: { conversationId: v.id("agentConversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Ownership check
    const convo = await ctx.db.get(args.conversationId);
    if (!convo || convo.userId !== userId) return [];

    return await ctx.db
      .query("agentMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

// ── Public: get or find a conversation by agentId ─────────────
export const findConversation = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("agentConversations")
      .withIndex("by_userId_agentId", (q) =>
        q.eq("userId", userId).eq("agentId", args.agentId)
      )
      .first();
  },
});
