/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentChat from "../agentChat.js";
import type * as agents from "../agents.js";
import type * as aiMatch from "../aiMatch.js";
import type * as analytics from "../analytics.js";
import type * as analyticsAI from "../analyticsAI.js";
import type * as auth from "../auth.js";
import type * as hackathons from "../hackathons.js";
import type * as hackathonsAI from "../hackathonsAI.js";
import type * as http from "../http.js";
import type * as investors from "../investors.js";
import type * as investorsAI from "../investorsAI.js";
import type * as learning from "../learning.js";
import type * as learningAI from "../learningAI.js";
import type * as matches from "../matches.js";
import type * as networking from "../networking.js";
import type * as notifications from "../notifications.js";
import type * as portfolio from "../portfolio.js";
import type * as portfolioAI from "../portfolioAI.js";
import type * as profiles from "../profiles.js";
import type * as resume from "../resume.js";
import type * as resumeAI from "../resumeAI.js";
import type * as sessions from "../sessions.js";
import type * as skillPosts from "../skillPosts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentChat: typeof agentChat;
  agents: typeof agents;
  aiMatch: typeof aiMatch;
  analytics: typeof analytics;
  analyticsAI: typeof analyticsAI;
  auth: typeof auth;
  hackathons: typeof hackathons;
  hackathonsAI: typeof hackathonsAI;
  http: typeof http;
  investors: typeof investors;
  investorsAI: typeof investorsAI;
  learning: typeof learning;
  learningAI: typeof learningAI;
  matches: typeof matches;
  networking: typeof networking;
  notifications: typeof notifications;
  portfolio: typeof portfolio;
  portfolioAI: typeof portfolioAI;
  profiles: typeof profiles;
  resume: typeof resume;
  resumeAI: typeof resumeAI;
  sessions: typeof sessions;
  skillPosts: typeof skillPosts;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
