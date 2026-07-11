"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ─────────────────────────────────────────────────────────────
// Generate a Hackathon Project Idea with Groq
// ─────────────────────────────────────────────────────────────
export const generateIdea = action({
  args: {
    theme: v.string(),
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `You are an elite hackathon winner and product visionary.
A team wants to compete in a hackathon with the theme: "${args.theme}".
Their combined skills are: ${args.skills.join(", ")}.

Generate an incredibly innovative, winning hackathon project idea tailored to their skills and the theme.
It should not be a generic CRUD app. Think AI-native, spatial, decentralized, or hardware-accelerated.

Respond ONLY in this exact JSON format:
{
  "name": "<Catchy Project Name>",
  "tagline": "<1-sentence pitch>",
  "problem": "<What specific problem does this solve?>",
  "solution": "<How does it work? 2-3 sentences>",
  "techStack": ["<tech1>", "<tech2>", "<tech3>"],
  "wowFactor": "<What makes this project win? The unique differentiator>"
}`;

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
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    const data = await response.json();
    try {
      const text = data.choices[0].message.content.trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Hackathon idea generation error", e, data);
      throw new Error("Failed to generate idea. Please try again.");
    }
  },
});

// ─────────────────────────────────────────────────────────────
// AI Teammate (PM) consultation logic
// ─────────────────────────────────────────────────────────────
export const consultAIPM = action({
  args: {
    threadId: v.string(),
    teamId: v.id("hackathonTeams"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.runQuery(api.hackathons.getTeamDetailsInternal, { teamId: args.teamId });
    if (!team) throw new Error("Team not found");

    const chatHistory = await ctx.runQuery(api.networking.getMessages, { threadId: args.threadId });
    const messagesStr = chatHistory
      .slice(-15)
      .map((m) => `${m.senderName}: ${m.content}`)
      .join("\n");

    const prompt = `You are "🤖 AI Teammate (PM)", an elite, autonomous AI Project Manager and Tech Lead embedded in this hackathon team's chat room.
Your role: analyze the team's project details and recent conversation to provide high-impact assistance. You can:
1. Draft a lightweight PRD (Product Requirement Document)
2. Detail high-level technical milestones or timelines
3. Propose target feature list and architecture
4. Generate boilerplate code blueprints (React / Next.js / Python / Solidity)

Hackathon Team: "${team.name}"
Description: "${team.description}"
Looking for: ${team.lookingFor.join(", ")}

Recent Chat Log:
${messagesStr || "(No chat history yet)"}

Respond directly as the AI Project Manager in a helpful, collaborative, and professional PM tone. Use markdown headings and lists. Be technical and concrete. Keep the response compact enough for a chat bubble (around 200-300 words).`;

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
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      }
    );

    const data = await response.json();
    let content = "I encountered an issue processing your teammate consultation request.";
    try {
      content = data.choices[0].message.content.trim();
    } catch (e) {
      console.error("AI PM consult error", e, data);
    }

    await ctx.runMutation(api.networking.sendAIPMMessage, {
      threadId: args.threadId,
      content,
    });
  },
});

// ── Recommend Teammates based on Team Scope & Candidate Skills ──
export const recommendTeammates = action({
  args: {
    teamId: v.id("hackathonTeams"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch team details
    const team = await ctx.runQuery(api.hackathons.getTeamDetailsInternal, { teamId: args.teamId });
    if (!team) throw new Error("Team not found");

    // 2. Fetch candidate profiles with skills
    const candidates = await ctx.runQuery(api.profiles.listCandidateProfilesWithSkills);

    // 3. Prompt Llama 3 to evaluate and rank the candidates
    const prompt = `You are an elite hackathon recruitment coordinator and similarity scoring engine.
A hackathon team is looking to recruit members.
Team Name: "${team.name}"
Description: "${team.description}"
Looking for roles/skills: ${team.lookingFor.join(", ")}

Here is the list of candidates (builders) on the platform:
${JSON.stringify(candidates, null, 2)}

Select the TOP 3 most compatible candidates for this team. Rate compatibility from 0 to 100 based on role relevance, tech stack fit, and project description compatibility.
For each of the top 3 candidates, provide their userId, name, score, and a 1-sentence compatibilityReason.

Respond ONLY in this exact JSON format, nothing else:
{
  "recommendations": [
    {
      "userId": "<userId string>",
      "name": "<name string>",
      "score": <number 0-100>,
      "compatibilityReason": "<One sentence reasoning why they are a perfect fit>"
    }
  ]
}`;

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
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      }
    );

    const data = await response.json();
    try {
      const text = data.choices[0].message.content.trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Matchmaker recommendation error", e, data);
      return { recommendations: [] };
    }
  },
});
