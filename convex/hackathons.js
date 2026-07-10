import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── List all hackathons ───────────────────────────────────────
export const list = query({
  args: { status: v.optional(v.union(v.literal("upcoming"), v.literal("active"), v.literal("completed"))) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("hackathons");
    if (args.status) {
      q = q.withIndex("by_status", (q) => q.eq("status", args.status));
    }
    return await q.order("desc").collect();
  },
});

// ── Get a specific hackathon ──────────────────────────────────
export const get = query({
  args: { id: v.id("hackathons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ── List teams for a hackathon ────────────────────────────────
export const listTeams = query({
  args: { hackathonId: v.id("hackathons") },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("hackathonTeams")
      .withIndex("by_hackathon", (q) => q.eq("hackathonId", args.hackathonId))
      .order("desc")
      .collect();

    // Fetch members and creator info for each team
    return await Promise.all(
      teams.map(async (team) => {
        const creator = await ctx.db.get(team.creatorId);
        const creatorProfile = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", team.creatorId)).first();
        
        const members = await ctx.db
          .query("hackathonMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        const membersWithProfiles = await Promise.all(
          members.map(async (m) => {
            const p = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", m.userId)).first();
            return { ...m, profile: p };
          })
        );

        return {
          ...team,
          creator: creatorProfile || creator,
          members: membersWithProfiles,
        };
      })
    );
  },
});

// ── Create a team ─────────────────────────────────────────────
export const createTeam = mutation({
  args: {
    hackathonId: v.id("hackathons"),
    name: v.string(),
    description: v.string(),
    lookingFor: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const teamId = await ctx.db.insert("hackathonTeams", {
      hackathonId: args.hackathonId,
      name: args.name,
      description: args.description,
      lookingFor: args.lookingFor,
      creatorId: userId,
      status: "recruiting",
      createdAt: Date.now(),
    });

    // Add creator as an approved member
    await ctx.db.insert("hackathonMembers", {
      teamId,
      userId,
      role: "Team Lead",
      status: "approved",
      createdAt: Date.now(),
    });

    return teamId;
  },
});

// ── Apply to a team ───────────────────────────────────────────
export const applyToTeam = mutation({
  args: {
    teamId: v.id("hackathonTeams"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("hackathonMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", userId))
      .first();

    if (existing) throw new Error("Already applied to this team");

    await ctx.db.insert("hackathonMembers", {
      teamId: args.teamId,
      userId,
      role: args.role,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// ── Seed Mock Data ────────────────────────────────────────────
// Helper to populate the DB so the UI has data to show
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("hackathons").first();
    if (existing) return; // already seeded

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    await ctx.db.insert("hackathons", {
      title: "Global AI Summit Hackathon",
      description: "Build the next generation of AI-native applications. Focus on spatial computing, agents, and generative UI.",
      theme: "AI Agents & Generative UI",
      startDate: now + 5 * day,
      endDate: now + 8 * day,
      status: "upcoming",
      tags: ["AI", "Next.js", "Agents"],
      prizePool: "$50,000",
    });

    await ctx.db.insert("hackathons", {
      title: "Web3 Builders Clash",
      description: "Create decentralized solutions for identity, finance, and social networking.",
      theme: "Decentralized Future",
      startDate: now - 2 * day,
      endDate: now + 1 * day,
      status: "active",
      tags: ["Web3", "Blockchain", "Solidity"],
      prizePool: "$25,000",
    });

    await ctx.db.insert("hackathons", {
      title: "FinTech Disruption Series",
      description: "Modernize payments, lending, and financial literacy for Gen Z.",
      theme: "Gen Z Finance",
      startDate: now + 14 * day,
      endDate: now + 16 * day,
      status: "upcoming",
      tags: ["FinTech", "Mobile", "Payments"],
      prizePool: "$10,000",
    });
  },
});
