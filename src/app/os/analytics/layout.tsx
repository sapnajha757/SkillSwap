import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Analytics",
  description: "AI-powered career analytics. Profile views, match success rates, learning hours, and personalized insights.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
