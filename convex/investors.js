import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Discover Top Builders ─────────────────────────────────────
export const discoverBuilders = query({
  args: {},
  handler: async (ctx) => {
    // In a real app, we'd rank by analytics, projects, or hackathon wins.
    // For this demo, we'll return all users who have a profile, sorted by creation date.
    const profiles = await ctx.db.query("profiles").order("desc").take(10);
    
    // Enrich with their projects and skills
    const builders = await Promise.all(
      profiles.map(async (profile) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_userId", (q) => q.eq("userId", profile.userId))
          .collect();

        const skillPosts = await ctx.db
          .query("skillPosts")
          .withIndex("by_userId", (q) => q.eq("userId", profile.userId))
          .filter(q => q.eq(q.field("type"), "teach"))
          .collect();

        const analytics = await ctx.db
          .query("analytics")
          .withIndex("by_user", (q) => q.eq("userId", profile.userId))
          .first();

        return {
          ...profile,
          projects,
          skills: skillPosts.map(sp => sp.skill),
          score: analytics ? Math.round(analytics.matchSuccessRate * 0.7 + analytics.learningHours * 0.3) : Math.floor(Math.random() * 40) + 50,
        };
      })
    );

    // Sort by "score" descending
    return builders.sort((a, b) => b.score - a.score);
  },
});

// ── Get Bookmarks ─────────────────────────────────────────────
export const myBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("investorBookmarks")
      .withIndex("by_investor", (q) => q.eq("investorId", userId))
      .order("desc")
      .collect();
  },
});

// ── Toggle Bookmark ───────────────────────────────────────────
export const toggleBookmark = mutation({
  args: { builderId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("investorBookmarks")
      .withIndex("by_investor", (q) => q.eq("investorId", userId))
      .filter((q) => q.eq(q.field("builderId"), args.builderId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("investorBookmarks", {
        investorId: userId,
        builderId: args.builderId,
        createdAt: Date.now(),
      });
      return true;
    }
  },
});
