import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Hackathon Hub",
  description: "Discover hackathons, form teams, generate AI project ideas, and track your submissions.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
