"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────
// Generate AI Investment/Hiring Thesis
// ─────────────────────────────────────────────────────────────
export const generateThesis = action({
  args: {
    builderName: v.string(),
    skills: v.array(v.string()),
    projects: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `You are an elite VC partner evaluating a technical founder/builder.
Builder Name: ${args.builderName}
Skills: ${args.skills.join(", ") || "Unknown"}
Projects: ${args.projects.join(", ") || "None listed"}

Write a sharp, 3-sentence investment thesis on why this person is a high-potential hire or founder. 
Focus on their specific skill overlaps and project execution. Avoid generic fluff. 
Use a professional, aggressive VC tone (e.g. "strong asymmetric upside", "deep technical moat").

Respond ONLY with the thesis text, no markdown, no quotes.`;

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
          temperature: 0.6,
          max_tokens: 300,
        }),
      }
    );

    const data = await response.json();
    try {
      return data.choices[0].message.content.trim();
    } catch (e) {
      console.error("Thesis generation error", e, data);
      throw new Error("Failed to generate thesis.");
    }
  },
});
