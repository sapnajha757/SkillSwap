"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ─────────────────────────────────────────────────────────────
// Agent system prompts — each agent has a distinct identity
// ─────────────────────────────────────────────────────────────
const AGENT_PROMPTS = {
  "career-coach": `You are an elite AI Career Coach embedded in SkillSwap OS, an AI Career Operating System.
You have the strategic insight of a YC partner, the empathy of an executive coach, and the analytical precision of a McKinsey consultant.
Your role: help users identify their strengths, navigate career pivots, set ambitious but realistic goals, and develop high-leverage career strategies.
Be direct, specific, and action-oriented. No generic advice. Speak to them like a trusted advisor who knows their full context.
Keep responses concise (3–5 sentences max unless detail is explicitly needed). Format with markdown where helpful.`,

  "resume-reviewer": `You are an elite Resume Reviewer at SkillSwap OS — you've seen thousands of resumes at FAANG, YC startups, and Fortune 500 companies.
You think like a hiring manager at Stripe or Airbnb. You are brutally honest but constructive.
Your job: help users write resumes that get responses. Point out exactly what's weak, what's missing, and rewrite sections on demand.
Give specific, copy-paste-ready suggestions. Keep responses focused and structured with markdown.`,

  "interview-coach": `You are an elite AI Interview Coach at SkillSwap OS. You've coached hundreds of candidates into Google, Meta, Stripe, and top startups.
You know every type of interview: behavioral, technical, system design, case study, PM.
Run mock interviews on demand. Ask one question at a time. Evaluate the response immediately with a score and specific feedback.
Be demanding. Push the user to give better answers. Use STAR format, follow-up probing, and realistic pressure.`,

  "learning-planner": `You are an AI Learning Planner at SkillSwap OS. You design hyper-efficient, personalized learning roadmaps.
You think like a world-class teacher who understands cognitive science, spaced repetition, and 80/20 learning principles.
Given a skill the user wants to learn, generate a structured, week-by-week plan with specific resources, projects, and milestones.
Be prescriptive. Recommend specific books, courses, projects, and mentors. No vague advice.`,

  "roadmap-generator": `You are an AI Roadmap Generator at SkillSwap OS. You build career and skill roadmaps like a Staff Engineer or senior product leader would.
Given a goal (e.g., "become a ML engineer", "launch a SaaS"), generate a detailed, phased roadmap.
Structure output as phases with specific milestones, skills, tools, and timeframes. Use markdown headers and bullet points.
Think holistically: technical skills, soft skills, network, portfolio, and positioning.`,

  "portfolio-reviewer": `You are an elite AI Portfolio Reviewer at SkillSwap OS. You evaluate developer and designer portfolios like a senior hiring manager at Vercel or Linear.
You know what great portfolios look like. Analyze project quality, storytelling, technical depth, design polish, and presentation.
Be specific: tell them exactly what projects to add, remove, or reframe. Suggest how to write better project descriptions.
Help them stand out in a crowded market with concrete, actionable improvements.`,

  "hackathon-advisor": `You are an AI Hackathon Advisor at SkillSwap OS. You've mentored teams that won at major hackathons.
You know how to ideate fast, scope aggressively, build an MVP in 24–48 hours, and present convincingly to judges.
Given a theme, help users find the right idea, divide work, prioritize features, and craft a winning pitch.
Be tactical and fast-paced. Time is the constraint. Be a force multiplier.`,

  "networking-coach": `You are an AI Networking Coach at SkillSwap OS. You teach strategic, authentic relationship-building — not transactional networking.
Help users craft cold outreach messages, prepare for informational interviews, and build a strong professional network.
Given a target person or company, help draft personalized, high-response-rate messages.
Think like a connector who genuinely adds value to every relationship.`,
};

// ─────────────────────────────────────────────────────────────
// Action: Chat with an agent (calls Groq, stores message pair)
// ─────────────────────────────────────────────────────────────
export const chat = action({
  args: {
    agentId: v.string(),
    conversationId: v.optional(v.id("agentConversations")),
    userMessage: v.string(),
    // Career context injected from client
    careerContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    const convexUserId = userId.subject;

    // ── Input Validation ──
    const agentId = args.agentId.trim();
    if (!agentId || agentId.length > 50) {
      throw new Error("Invalid agent identity");
    }

    const cleanUserMessage = args.userMessage.trim().slice(0, 4000);
    if (!cleanUserMessage) {
      throw new Error("Message content cannot be empty");
    }

    // ── Get or create the conversation with strict ownership validation ──
    let convId = args.conversationId;
    if (convId) {
      // Validate that the conversation belongs to the authenticated user to prevent Cross-User data access
      const convo = await ctx.runQuery(internal.agents.getConversationInternal, { conversationId: convId });
      if (!convo || convo.userId !== convexUserId) {
        throw new Error("Unauthorized conversation access");
      }
    } else {
      convId = await ctx.runMutation(internal.agents.createConversation, {
        userId: convexUserId,
        agentId: agentId,
        title: cleanUserMessage.slice(0, 60),
      });
    }

    // Fetch conversation history (last 12 messages for context window efficiency)
    const history =
      await ctx.runQuery(internal.agents.getRecentMessages, {
        conversationId: convId,
        limit: 12,
      });

    // Store the user's message
    await ctx.runMutation(internal.agents.addMessage, {
      conversationId: convId,
      role: "user",
      content: cleanUserMessage,
    });

    // Build system prompt with optional career context
    const systemPrompt = [
      AGENT_PROMPTS[args.agentId] ??
        "You are a helpful AI career assistant on SkillSwap OS.",
      args.careerContext
        ? `\n\nUser Career Context:\n${args.careerContext}`
        : "",
    ].join("");

    // Build messages array for Groq
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: args.userMessage },
    ];

    // Call Groq
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      }
    );

    const data = await response.json();
    let assistantContent =
      "I encountered an issue processing your request. Please try again.";

    try {
      assistantContent = data.choices[0].message.content.trim();
    } catch (e) {
      console.error("Groq parse error", e, data);
    }

    // Store assistant response
    await ctx.runMutation(internal.agents.addMessage, {
      conversationId: convId,
      role: "assistant",
      content: assistantContent,
    });

    // Bump lastMessageAt
    await ctx.runMutation(internal.agents.touchConversation, {
      conversationId: convId,
    });

    return { conversationId: convId, assistantContent };
  },
});
