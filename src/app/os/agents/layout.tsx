import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Agents",
  description: "Your fleet of 8 specialized AI career agents. Each expert in its domain, all sharing your career context.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
