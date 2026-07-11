import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Built-in auth tables (users, authAccounts, sessions, etc.)
  ...authTables,

  // Extend the users table with profile info
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    credits: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  // A post: either "teach" or "learn" a skill
  skillPosts: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("teach"), v.literal("learn")),
    skill: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("matched"),
      v.literal("closed")
    ),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_userId", ["userId"])
    .index("by_type", ["type"]),

  // A match between a teach-post and a learn-post
  matches: defineTable({
    teachPostId: v.id("skillPosts"),
    learnPostId: v.id("skillPosts"),
    teacherId: v.id("users"),
    learnerId: v.id("users"),
    compatibilityScore: v.number(),
    aiReasoning: v.string(),
    status: v.union(
      v.literal("proposed"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("session_scheduled")
    ),
    createdAt: v.number(),
  })
    .index("by_teachPost", ["teachPostId"])
    .index("by_learnPost", ["learnPostId"])
    .index("by_status", ["status"]),

  // A scheduled tutoring session
  sessions: defineTable({
    matchId: v.id("matches"),
    scheduledAt: v.number(),
    durationMinutes: v.number(),
    reminderSent: v.boolean(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  }).index("by_match", ["matchId"]),

  // One conversation thread per user per agent type
  agentConversations: defineTable({
    userId: v.id("users"),
    agentId: v.string(),          // e.g. "career-coach", "resume-reviewer"
    title: v.optional(v.string()),
    lastMessageAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_agentId", ["userId", "agentId"]),

  // Individual messages inside a conversation
  agentMessages: defineTable({
    conversationId: v.id("agentConversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  // User portfolio projects
  projects: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    techStack: v.array(v.string()),
    liveUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.union(
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("featured")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"]),

  // AI-assisted resume builder — one resume per user
  resumes: defineTable({
    userId: v.id("users"),
    // Each section stored as JSON string for schema flexibility
    summary: v.optional(v.string()),
    experienceJson: v.optional(v.string()),  // JSON array of experience entries
    educationJson: v.optional(v.string()),   // JSON array of education entries
    skillsJson: v.optional(v.string()),      // JSON array of skill categories
    certificationsJson: v.optional(v.string()), // JSON array of certifications
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // AI-generated learning roadmaps
  roadmaps: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    targetRole: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("archived")),
    // JSON string containing array of milestones (each with title, description, completed boolean, resources array)
    milestonesJson: v.string(),
    progress: v.number(), // 0 to 100
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ─────────────────────────────────────────────────────────────
  // Hackathons Platform
  // ─────────────────────────────────────────────────────────────
  hackathons: defineTable({
    title: v.string(),
    description: v.string(),
    theme: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(v.literal("upcoming"), v.literal("active"), v.literal("completed")),
    tags: v.array(v.string()),
    prizePool: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_status", ["status"]),

  hackathonTeams: defineTable({
    hackathonId: v.id("hackathons"),
    name: v.string(),
    description: v.string(),
    lookingFor: v.array(v.string()), // e.g. ["Frontend", "AI Engineer", "Designer"]
    creatorId: v.id("users"),
    status: v.union(v.literal("recruiting"), v.literal("full"), v.literal("submitted")),
    createdAt: v.number(),
  }).index("by_hackathon", ["hackathonId"]),

  hackathonMembers: defineTable({
    teamId: v.id("hackathonTeams"),
    userId: v.id("users"),
    role: v.string(), // e.g. "Frontend", "Backend"
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("declined")),
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"]),

  // ─────────────────────────────────────────────────────────────
  // Networking & Communities
  // ─────────────────────────────────────────────────────────────
  communities: defineTable({
    name: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    creatorId: v.id("users"),
    createdAt: v.number(),
  }),

  communityMembers: defineTable({
    communityId: v.id("communities"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_community", ["communityId"])
    .index("by_user", ["userId"])
    .index("by_community_user", ["communityId", "userId"]),

  // Real-time Chat Messages for Matches, Teams, or Communities
  chatMessages: defineTable({
    threadId: v.string(), // e.g., "match_<id>", "team_<id>", "community_<id>"
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_thread", ["threadId"]),

  // ─────────────────────────────────────────────────────────────
  // Notifications System
  // ─────────────────────────────────────────────────────────────
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("match_request"),
      v.literal("message"),
      v.literal("system"),
      v.literal("ai_alert")
    ),
    linkUrl: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"]),

  // ─────────────────────────────────────────────────────────────
  // Analytics & Insights
  // ─────────────────────────────────────────────────────────────
  analytics: defineTable({
    userId: v.id("users"),
    profileViews: v.number(),
    matchSuccessRate: v.number(),
    learningHours: v.number(),
    weeklyActivity: v.array(v.number()), // e.g. [1, 3, 5, 2, 8, 4, 6] for chart
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),

  // ─────────────────────────────────────────────────────────────
  // Investor Mode
  // ─────────────────────────────────────────────────────────────
  investorBookmarks: defineTable({
    investorId: v.id("users"),
    builderId: v.id("users"), // The user they bookmarked
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_investor", ["investorId"]),

  // Real-time Collaborative Session Rooms
  sessionRooms: defineTable({
    sessionId: v.id("sessions"),
    code: v.string(),
    language: v.string(),
    whiteboardPathsJson: v.string(),
  }).index("by_sessionId", ["sessionId"]),
});