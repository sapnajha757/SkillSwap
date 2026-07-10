import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Investor Mode",
  description: "Discover top student builders. Filter by skills, projects, and synergy scores for deal sourcing.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
