import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Learning Paths",
  description: "AI-generated personalized learning roadmaps. Milestones, resources, and progress tracking.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
