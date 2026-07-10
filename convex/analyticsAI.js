"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────
// Generate AI Career Insights with Groq
// ─────────────────────────────────────────────────────────────
export const generateInsights = action({
  args: {
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `You are a world-class AI Career Strategist.
The user currently has these skills: ${args.skills.join(", ") || "Beginner"}.

Analyze the current tech job market and provide predictive insights tailored to their profile.
Focus on emerging trends, what skills they should learn next to maximize salary, and overall market demand.

Respond ONLY in this exact JSON format:
{
  "marketTrend": "<1-sentence summary of current market demand for their skills>",
  "demandScore": <number between 1 and 100>,
  "nextSkillRecommendations": [
    { "skill": "<skill1>", "reason": "<Why they should learn it>" },
    { "skill": "<skill2>", "reason": "<Why they should learn it>" }
  ],
  "salaryOutlook": "<Short insight on compensation trends for these skills>"
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
          temperature: 0.5,
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
      console.error("Insight generation error", e, data);
      throw new Error("Failed to generate insights.");
    }
  },
});
