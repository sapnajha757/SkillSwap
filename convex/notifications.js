import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── List Notifications ────────────────────────────────────────
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

// ── Get Unread Count ──────────────────────────────────────────
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .collect();

    return unread.length;
  },
});

// ── Mark as Read ──────────────────────────────────────────────
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const notif = await ctx.db.get(args.notificationId);
    if (notif && notif.userId === userId) {
      await ctx.db.patch(args.notificationId, { isRead: true });
    }
  },
});

// ── Mark All as Read ──────────────────────────────────────────
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .collect();

    for (const notif of unread) {
      await ctx.db.patch(notif._id, { isRead: true });
    }
  },
});

// ── Seed Dummy Notifications ──────────────────────────────────
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return;

    const now = Date.now();

    await ctx.db.insert("notifications", {
      userId,
      title: "New Match Request",
      message: "Alex wants to learn Next.js from you. View match proposal.",
      type: "match_request",
      linkUrl: "/os/career",
      isRead: false,
      createdAt: now - 1000 * 60 * 5, // 5 mins ago
    });

    await ctx.db.insert("notifications", {
      userId,
      title: "AI Agent Complete",
      message: "Your resume review is ready. Score: 85%.",
      type: "ai_alert",
      linkUrl: "/os/resume",
      isRead: false,
      createdAt: now - 1000 * 60 * 60 * 2, // 2 hours ago
    });

    await ctx.db.insert("notifications", {
      userId,
      title: "System Update",
      message: "SkillSwap OS v2.0 is now live. Enjoy spatial computing features.",
      type: "system",
      isRead: true,
      createdAt: now - 1000 * 60 * 60 * 24, // 1 day ago
    });
  },
});
