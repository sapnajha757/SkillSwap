import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Network",
  description: "Your peer network. Direct messages, team channels, and communities of builders.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
