import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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