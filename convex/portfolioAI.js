"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────
// AI Portfolio Review — analyses all projects and returns
// structured feedback: overall score, per-project notes,
// missing gaps, and 3 high-impact next steps.
// ─────────────────────────────────────────────────────────────
export const reviewPortfolio = action({
  args: {
    projects: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        techStack: v.array(v.string()),
        status: v.string(),
      })
    ),
    careerContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.projects.length === 0) {
      return {
        score: 0,
        summary:
          "Your portfolio is empty. Add at least one project to get a review.",
        strengths: [],
        gaps: ["No projects added yet"],
        nextSteps: [
          "Add a real-world project you've built",
          "Include a project with a live URL",
          "Showcase a project that solves a real problem",
        ],
        projectNotes: [],
      };
    }

    const projectList = args.projects
      .map(
        (p, i) =>
          `${i + 1}. **${p.title}** [${p.status}]\n   Tech: ${p.techStack.join(", ")}\n   Description: ${p.description}`
      )
      .join("\n\n");

    const prompt = `You are an elite portfolio reviewer working at a top-tier tech company. 
You are reviewing a developer's portfolio to help them land their dream job.

${args.careerContext ? `Career Context: ${args.careerContext}\n` : ""}

Projects to review:
${projectList}

Respond ONLY in this exact JSON format, nothing else:
{
  "score": <number 0-100>,
  "summary": "<2-sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "nextSteps": ["<actionable step 1>", "<actionable step 2>", "<actionable step 3>"],
  "projectNotes": [
    {"title": "<project title>", "note": "<specific 1-sentence feedback>", "rating": <1-5>}
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
          max_tokens: 600,
        }),
      }
    );

    const data = await response.json();

    try {
      const text = data.choices[0].message.content.trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Portfolio review parse error", e, data);
      return {
        score: 50,
        summary: "AI review encountered an issue. Please try again.",
        strengths: [],
        gaps: [],
        nextSteps: [],
        projectNotes: [],
      };
    }
  },
});
