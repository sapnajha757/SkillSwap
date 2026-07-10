import { mutation, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// Schedule a session after a match is accepted
export const scheduleSession = mutation({
  args: {
    matchId: v.id("matches"),
    scheduledAt: v.number(), // timestamp (ms) of the real session time
    durationMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      matchId: args.matchId,
      scheduledAt: args.scheduledAt,
      durationMinutes: args.durationMinutes,
      reminderSent: false,
      status: "scheduled",
    });

    await ctx.db.patch(args.matchId, { status: "session_scheduled" });

    // DEMO NOTE: In production this would fire ~15-30 min before scheduledAt.
    // For hackathon demo purposes (so judges can see it fire live), we schedule
    // the reminder 10 seconds from now instead of computing the real offset.
    await ctx.scheduler.runAfter(10_000, internal.sessions.sendReminder, {
      sessionId,
    });

    return sessionId;
  },
});

// Internal: runs automatically via the scheduler, marks reminder as sent
export const sendReminder = internalMutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    // In production: send an email/push notification here.
    await ctx.db.patch(args.sessionId, { reminderSent: true });
  },
});

// Query: list sessions relevant to the current user (real-time reminder status)
export const mySessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allMatches = await ctx.db.query("matches").collect();
    const myMatchIds = new Set(
      allMatches
        .filter((m) => m.teacherId === userId || m.learnerId === userId)
        .map((m) => m._id)
    );

    const allSessions = await ctx.db.query("sessions").order("desc").collect();
    return allSessions.filter((s) => myMatchIds.has(s.matchId));
  },
});