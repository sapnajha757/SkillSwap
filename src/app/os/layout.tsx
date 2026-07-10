import { Suspense } from "react";
import type { Metadata } from "next";
import { OSDock } from "@/components/os/OSDock";
import { NotificationBell } from "@/components/os/NotificationBell";
import { AuthGuard } from "@/components/os/AuthGuard";
import { CommandPalette } from "@/components/os/CommandPalette";

export const metadata: Metadata = {
  title: "Nexus | SkillSwap OS",
  description: "Your AI Career Operating System workspace.",
};

export default function OSLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="relative min-h-screen bg-background text-text-primary">
        {/* NotificationBell in Suspense — doesn't block page render */}
        <Suspense fallback={null}>
          <NotificationBell />
        </Suspense>
        <main id="main-content" tabIndex={-1}>
          {/* Suspense boundary — pages stream in; Convex data resolves per-component */}
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <OSDock />
        </Suspense>
        <CommandPalette />
      </div>
    </AuthGuard>
  );
}
