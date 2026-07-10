"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ACTION: Call Groq to score compatibility between a teach post and learn post
export const computeMatch = action({
  args: {
    teachPostId: v.id("skillPosts"),
    learnPostId: v.id("skillPosts"),
  },
  handler: async (ctx, args) => {
    const teachPost = await ctx.runQuery(internal.matches.getPost, {
      postId: args.teachPostId,
    });
    const learnPost = await ctx.runQuery(internal.matches.getPost, {
      postId: args.learnPostId,
    });

    if (!teachPost || !learnPost) throw new Error("Post not found");

    const prompt = `You are matching a tutor with a learner on a peer-tutoring platform.

Teacher offers: "${teachPost.skill}" - ${teachPost.description}
Learner wants: "${learnPost.skill}" - ${learnPost.description}

Rate compatibility from 0-100 based on skill relevance and how well the teacher's offering matches the learner's need. Respond ONLY in this exact JSON format, nothing else:
{"score": <number 0-100>, "reasoning": "<one sentence, max 20 words>"}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    let score = 50;
    let reasoning = "AI evaluated the skill match.";

    try {
      const text = data.choices[0].message.content.trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      score = parsed.score;
      reasoning = parsed.reasoning;
    } catch (e) {
      console.error("Failed to parse Groq response", e, data);
    }

    const matchId = await ctx.runMutation(internal.matches.insertMatch, {
      teachPostId: args.teachPostId,
      learnPostId: args.learnPostId,
      teacherId: teachPost.userId,
      learnerId: learnPost.userId,
      compatibilityScore: score,
      aiReasoning: reasoning,
    });

    return matchId;
  },
});