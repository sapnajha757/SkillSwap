import { mutation, internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Internal query: fetch a post by id (used by the AI matching action)
export const getPost = internalQuery({
  args: { postId: v.id("skillPosts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});

// Internal mutation: insert the computed match (called by the AI matching action)
export const insertMatch = internalMutation({
  args: {
    teachPostId: v.id("skillPosts"),
    learnPostId: v.id("skillPosts"),
    teacherId: v.id("users"),
    learnerId: v.id("users"),
    compatibilityScore: v.number(),
    aiReasoning: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("matches", {
      ...args,
      status: "proposed",
      createdAt: Date.now(),
    });
  },
});

// Query: list matches relevant to the current user (as teacher or learner)
export const myMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allMatches = await ctx.db.query("matches").order("desc").collect();
    return allMatches.filter(
      (m) => m.teacherId === userId || m.learnerId === userId
    );
  },
});

// Mutation: human approves/accepts a proposed match (human-in-the-loop!)
export const respondToMatch = mutation({
  args: {
    matchId: v.id("matches"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match proposal not found");

    // Strictly ensure only participant users can modify the match status
    if (match.teacherId !== userId && match.learnerId !== userId) {
      throw new Error("Unauthorized match response action");
    }

    await ctx.db.patch(args.matchId, {
      status: args.accept ? "accepted" : "declined",
    });
  },
});