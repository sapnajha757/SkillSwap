import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Universe",
  description:
    "Your holistic career identity. Skill constellation, peer matches, AI coaching, and career trajectory — all in one view.",
};

export default function CareerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
