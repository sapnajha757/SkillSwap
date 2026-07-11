import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Create a new skill post (teach or learn)
export const createPost = mutation({
  args: {
    type: v.union(v.literal("teach"), v.literal("learn")),
    skill: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const postId = await ctx.db.insert("skillPosts", {
      userId,
      type: args.type,
      skill: args.skill,
      description: args.description,
      status: "open",
      createdAt: Date.now(),
    });

    // Automatically trigger AI matchmaking
    try {
      const oppositeType = args.type === "teach" ? "learn" : "teach";
      const candidates = await ctx.db
        .query("skillPosts")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .collect();

      const filteredCandidates = candidates.filter(
        (p) => p.type === oppositeType && p.userId !== userId
      );

      for (const candidate of filteredCandidates) {
        const teachPostId = args.type === "teach" ? postId : candidate._id;
        const learnPostId = args.type === "learn" ? postId : candidate._id;

        const existingMatch = await ctx.db
          .query("matches")
          .withIndex("by_teachPost", (q) => q.eq("teachPostId", teachPostId))
          .filter((q) => q.eq(q.field("learnPostId"), learnPostId))
          .first();

        if (!existingMatch) {
          // Schedule AI matchmaking evaluation
          await ctx.scheduler.runAfter(0, api.aiMatch.computeMatch, {
            teachPostId,
            learnPostId,
          });
        }
      }
    } catch (err) {
      console.error("Failed to schedule auto matchmaking:", err);
    }

    return postId;
  },
});

// List all open posts (real-time — updates live for all users)
export const listOpenPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("skillPosts")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .collect();
    return posts;
  },
});

// List current user's own posts
export const myPosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const posts = await ctx.db
      .query("skillPosts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return posts;
  },
});

// Trigger matchmaking for all open unmatched posts (existing posts backfill)
export const triggerAllMatches = mutation({
  args: {},
  handler: async (ctx) => {
    const teachPosts = await ctx.db
      .query("skillPosts")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .filter((q) => q.eq(q.field("type"), "teach"))
      .collect();

    const learnPosts = await ctx.db
      .query("skillPosts")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .filter((q) => q.eq(q.field("type"), "learn"))
      .collect();

    let triggeredCount = 0;
    for (const t of teachPosts) {
      for (const l of learnPosts) {
        if (t.userId === l.userId) continue;

        const existing = await ctx.db
          .query("matches")
          .withIndex("by_teachPost", (q) => q.eq("teachPostId", t._id))
          .filter((q) => q.eq(q.field("learnPostId"), l._id))
          .first();

        if (!existing) {
          await ctx.scheduler.runAfter(0, api.aiMatch.computeMatch, {
            teachPostId: t._id,
            learnPostId: l._id,
          });
          triggeredCount++;
        }
      }
    }
    return { triggeredCount };
  },
});