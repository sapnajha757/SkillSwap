import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: Email({
        id: "resend",
        sendVerificationRequest: async ({ identifier: email, token }) => {
          console.log("-----------------------------------------");
          console.log(`VERIFICATION CODE FOR ${email}: ${token}`);
          console.log("-----------------------------------------");

          const resendKey = process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY;
          if (resendKey) {
            try {
              const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${resendKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: "SkillSwap OS <onboarding@resend.dev>",
                  to: [email],
                  subject: "Reset your SkillSwap OS Password",
                  text: `Your password reset verification code is: ${token}`,
                }),
              });
              if (!res.ok) {
                const errText = await res.text();
                console.error("Resend API failed:", errText);
              } else {
                console.log(`Successfully sent reset code email to ${email}`);
              }
            } catch (err) {
              console.error("Failed to send reset email:", err);
            }
          } else {
            console.log("No RESEND_API_KEY / AUTH_RESEND_KEY configured. Reset email not sent, code logged above.");
          }
        },
      }),
    }),
  ],
});

import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyUserId = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthUserId(ctx);
  },
});