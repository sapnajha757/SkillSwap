"use client";

import React, { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { OSLoader } from "./OSShared";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <OSLoader label="Verifying Secure Kernel..." />;
  }

  if (!isAuthenticated) {
    return <OSLoader label="Access Denied. Redirecting..." />;
  }

  return <>{children}</>;
}
