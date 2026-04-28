"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export default function Home() {
  const router = useRouter();
  const { isBootstrapping, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isBootstrapping) return;
    router.replace(isAuthenticated ? "/dashboard" : "/auth");
  }, [isBootstrapping, isAuthenticated, router]);

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </main>
  );
}
