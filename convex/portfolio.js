import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── List the current user's projects ─────────────────────────
export const myProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ── Create a project ──────────────────────────────────────────
export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    techStack: v.array(v.string()),
    liveUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    status: v.union(
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("featured")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("projects", {
      userId,
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ── Update a project ──────────────────────────────────────────
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    techStack: v.optional(v.array(v.string())),
    liveUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("in-progress"),
        v.literal("completed"),
        v.literal("featured")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const { projectId, ...patch } = args;
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(projectId, { ...patch, updatedAt: Date.now() });
  },
});

// ── Delete a project ──────────────────────────────────────────
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.projectId);
  },
});

// ── Toggle featured status ────────────────────────────────────
export const toggleFeatured = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");
    const newStatus =
      project.status === "featured" ? "completed" : "featured";
    await ctx.db.patch(args.projectId, { status: newStatus, updatedAt: Date.now() });
  },
});
