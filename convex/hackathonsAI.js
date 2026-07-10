"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

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
