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

// ── Get or Create Collaborative Room State ───────────────────
export const getOrCreateRoomState = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("sessionRooms")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) return existing;

    const roomId = await ctx.db.insert("sessionRooms", {
      sessionId: args.sessionId,
      code: `// Welcome to your SkillSwap collaborative workspace!\n// Share code and draw on the whiteboard together.\n\nfunction main() {\n  console.log("Hello, SkillSwap!");\n}\n`,
      language: "javascript",
      whiteboardPathsJson: "[]",
    });

    return await ctx.db.get(roomId);
  },
});

// ── Update Room State ─────────────────────────────────────────
export const updateRoomState = mutation({
  args: {
    roomId: v.id("sessionRooms"),
    code: v.optional(v.string()),
    language: v.optional(v.string()),
    whiteboardPathsJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates = {};
    if (args.code !== undefined) updates.code = args.code;
    if (args.language !== undefined) updates.language = args.language;
    if (args.whiteboardPathsJson !== undefined) updates.whiteboardPathsJson = args.whiteboardPathsJson;

    await ctx.db.patch(args.roomId, updates);
  },
});

// ── Get Room State for Live Subscriptions ─────────────────────
export const getRoomState = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("sessionRooms")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});

// ── Complete Session and Transfer Credits ──────────────────────
export const completeSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "scheduled") throw new Error("Invalid session state");

    const match = await ctx.db.get(session.matchId);
    if (!match || (match.teacherId !== userId && match.learnerId !== userId)) {
      throw new Error("Unauthorized");
    }

    // 1. Mark session as completed
    await ctx.db.patch(args.sessionId, { status: "completed" });

    // 2. Perform credit transfer
    const teacherProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", match.teacherId))
      .first();

    const learnerProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", match.learnerId))
      .first();

    if (teacherProfile) {
      const currentCredits = teacherProfile.credits ?? 100;
      await ctx.db.patch(teacherProfile._id, { credits: currentCredits + 50 });
    }

    if (learnerProfile) {
      const currentCredits = learnerProfile.credits ?? 100;
      await ctx.db.patch(learnerProfile._id, { credits: Math.max(0, currentCredits - 50) });
    }
  },
});