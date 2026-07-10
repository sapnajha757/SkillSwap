"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────
// Rewrite a specific resume section with Groq
// ─────────────────────────────────────────────────────────────
export const rewriteSection = action({
  args: {
    section: v.string(),   // e.g. "summary", "experience", "bullet"
    content: v.string(),   // the raw user-written content to improve
    context: v.optional(v.string()), // target role / career context
  },
  handler: async (ctx, args) => {
    const prompts = {
      summary: `You are an elite resume writer. Rewrite this professional summary to be compelling, specific, and results-oriented. 
It should be 3–4 sentences, start with a strong opener (NOT "I am"), quantify impact where possible, and be tailored for a competitive tech job market.
Return ONLY the rewritten summary text, nothing else.

Original: ${args.content}
${args.context ? `Target role/context: ${args.context}` : ""}`,

      bullet: `You are an elite resume writer. Rewrite this experience bullet point to be strong, specific, and achievement-focused.
Use the STAR format (Situation→Action→Result) compressed into one line. Start with a strong action verb. Include a metric or outcome if possible.
Return ONLY the rewritten bullet, nothing else. Keep it to one sentence.

Original: ${args.content}
${args.context ? `Context: ${args.context}` : ""}`,

      experience: `You are an elite resume writer. Improve these experience bullet points to be achievement-focused, metric-driven, and compelling.
Each bullet should start with a strong past-tense action verb and include measurable outcomes.
Return the improved bullets as a JSON array of strings, nothing else.

Original bullets: ${args.content}`,

      skills: `You are an elite resume writer. Organize and enhance this skills section.
Group skills into clear categories (e.g., Languages, Frameworks, Tools, Cloud).
Return ONLY a JSON array like: [{"category":"Languages","items":["Python","TypeScript"]}, ...]

Original: ${args.content}`,
    };

    const prompt = prompts[args.section] ?? `Rewrite this resume section to be more professional and impactful:\n\n${args.content}`;

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
          max_tokens: 600,
        }),
      }
    );

    const data = await response.json();
    try {
      return data.choices[0].message.content.trim();
    } catch {
      return args.content;
    }
  },
});

// ─────────────────────────────────────────────────────────────
// Score the full resume — returns ATS score + feedback
// ─────────────────────────────────────────────────────────────
export const scoreResume = action({
  args: {
    resumeText: v.string(),
    targetRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `You are a senior recruiter and ATS system expert. Score this resume for ATS compatibility and overall quality.
${args.targetRole ? `Target role: ${args.targetRole}` : ""}

Resume content:
${args.resumeText}

Respond ONLY in this JSON format:
{
  "atsScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>"],
  "verdict": "<one sentence overall verdict>"
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
          max_tokens: 500,
        }),
      }
    );

    const data = await response.json();
    try {
      const text = data.choices[0].message.content.trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        atsScore: 50,
        overallScore: 50,
        strengths: [],
        improvements: ["Could not parse AI response"],
        missingKeywords: [],
        verdict: "Please try again.",
      };
    }
  },
});
