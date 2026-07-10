import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Get User Analytics ────────────────────────────────────────
export const getMyAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("analytics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// ── Seed Analytics Data (for demo) ────────────────────────────
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const existing = await ctx.db
      .query("analytics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return;

    await ctx.db.insert("analytics", {
      userId,
      profileViews: Math.floor(Math.random() * 500) + 50,
      matchSuccessRate: Math.floor(Math.random() * 30) + 60, // 60-90%
      learningHours: Math.floor(Math.random() * 100) + 10,
      weeklyActivity: Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)),
      lastUpdated: Date.now(),
    });
  },
});
