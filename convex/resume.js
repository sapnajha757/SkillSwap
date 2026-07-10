import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Get current user's resume (one per user) ──────────────────
export const myResume = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// ── Save / upsert the full resume ─────────────────────────────
export const saveResume = mutation({
  args: {
    summary: v.optional(v.string()),
    experienceJson: v.optional(v.string()),
    educationJson: v.optional(v.string()),
    skillsJson: v.optional(v.string()),
    certificationsJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const payload = { ...args, updatedAt: Date.now() };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert("resumes", { userId, ...payload });
  },
});
