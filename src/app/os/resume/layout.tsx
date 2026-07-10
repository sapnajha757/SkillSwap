import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Resume Builder",
  description: "AI-powered resume builder. Generate tailored resumes from your career data and project portfolio.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
