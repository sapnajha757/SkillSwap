import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Portfolio",
  description: "AI-analyzed project portfolio. Showcase your work, get skill gap analysis, and surface opportunities.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
