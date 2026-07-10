import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── List user's roadmaps ──────────────────────────────────────
export const myRoadmaps = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ── Create a roadmap ─────────────────────────────────────────
export const createRoadmap = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    targetRole: v.optional(v.string()),
    milestonesJson: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("roadmaps", {
      userId,
      title: args.title,
      description: args.description,
      targetRole: args.targetRole,
      status: "active",
      milestonesJson: args.milestonesJson,
      progress: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ── Update roadmap progress ───────────────────────────────────
export const updateRoadmapMilestones = mutation({
  args: {
    roadmapId: v.id("roadmaps"),
    milestonesJson: v.string(),
    progress: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const roadmap = await ctx.db.get(args.roadmapId);
    if (!roadmap || roadmap.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.roadmapId, {
      milestonesJson: args.milestonesJson,
      progress: args.progress,
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// ── Delete a roadmap ─────────────────────────────────────────
export const deleteRoadmap = mutation({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const roadmap = await ctx.db.get(args.roadmapId);
    if (!roadmap || roadmap.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.roadmapId);
  },
});
