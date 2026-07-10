"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────
// Generate a new learning roadmap with Groq
// ─────────────────────────────────────────────────────────────
export const generateRoadmap = action({
  args: {
    goal: v.string(),
    context: v.optional(v.string()), // user's current skills or career context
  },
  handler: async (ctx, args) => {
    const prompt = `You are an elite technical career coach and curriculum designer.
The user wants to achieve this goal: "${args.goal}"
${args.context ? `User's context/current skills: ${args.context}` : ""}

Design a comprehensive, step-by-step learning roadmap to achieve this goal. Break it down into logical milestones.
For each milestone, provide a title, a short description, and an array of 2-4 recommended resources (books, docs, concepts to search, etc.).

Respond ONLY in this exact JSON format, nothing else. Do not use markdown blocks, just raw JSON.
{
  "title": "<Roadmap Title (e.g., Full-Stack Web Development)>",
  "description": "<A 2-sentence summary of what they will achieve>",
  "targetRole": "<Optional target job title>",
  "milestones": [
    {
      "id": "<generate a short unique string>",
      "title": "<Milestone 1 Title>",
      "description": "<What they will learn>",
      "completed": false,
      "resources": ["<resource 1>", "<resource 2>"]
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
          temperature: 0.4,
          max_tokens: 1500,
        }),
      }
    );

    const data = await response.json();
    try {
      const text = data.choices[0].message.content.trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Roadmap generation error", e, data);
      throw new Error("Failed to generate roadmap. Please try again.");
    }
  },
});
