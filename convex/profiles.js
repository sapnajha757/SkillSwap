import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get the current user's profile
export const myProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return { user, profile };
  },
});

// Upsert profile (create or update)
export const upsertProfile = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        bio: args.bio,
      });
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      bio: args.bio,
    });
  },
});

// Get career stats for the current user
export const myCareerStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const [posts, matches, sessions] = await Promise.all([
      ctx.db
        .query("skillPosts")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db.query("matches").collect().then((all) =>
        all.filter((m) => m.teacherId === userId || m.learnerId === userId)
      ),
      ctx.db.query("sessions").collect(),
    ]);

    const myMatchIds = new Set(matches.map((m) => m._id));
    const mySessions = sessions.filter((s) => myMatchIds.has(s.matchId));

    const teachSkills = posts.filter((p) => p.type === "teach");
    const learnSkills = posts.filter((p) => p.type === "learn");
    const acceptedMatches = matches.filter((m) => m.status === "accepted" || m.status === "session_scheduled");
    const avgSynergy = acceptedMatches.length > 0
      ? Math.round(acceptedMatches.reduce((a, m) => a + m.compatibilityScore, 0) / acceptedMatches.length)
      : 0;

    return {
      teachSkills,
      learnSkills,
      totalMatches: matches.length,
      acceptedMatches: acceptedMatches.length,
      sessions: mySessions.length,
      avgSynergy,
    };
  },
});

// ── Query candidate profiles with their registered skills ─────
export const listCandidateProfilesWithSkills = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const allProfiles = await ctx.db.query("profiles").collect();
    const candidates = allProfiles.filter(
      (p) => p.userId !== userId && p.name !== "🤖 AI Teammate (PM)"
    );

    return await Promise.all(
      candidates.map(async (p) => {
        const posts = await ctx.db
          .query("skillPosts")
          .withIndex("by_userId", (q) => q.eq("userId", p.userId))
          .collect();
        const teachSkills = posts.filter((post) => post.type === "teach").map(post => post.skill);
        const learnSkills = posts.filter((post) => post.type === "learn").map(post => post.skill);
        return {
          userId: p.userId,
          name: p.name,
          bio: p.bio || "",
          teachSkills,
          learnSkills,
        };
      })
    );
  },
});

// ── Query Leaderboard: Top Users by Credit Balance ────────────
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const allProfiles = await ctx.db.query("profiles").collect();
    return allProfiles
      .map(p => ({
        _id: p._id,
        name: p.name,
        credits: p.credits ?? 100,
      }))
      .sort((a, b) => b.credits - a.credits)
      .slice(0, 5);
  },
});
