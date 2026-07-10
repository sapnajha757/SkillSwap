import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | SkillSwap OS",
  description: "Access your AI Career Operating System.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
