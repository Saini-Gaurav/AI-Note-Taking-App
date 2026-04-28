"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export function useRequireAuth() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isBootstrapping && !auth.isAuthenticated) {
      router.replace("/auth");
    }
  }, [auth.isAuthenticated, auth.isBootstrapping, router]);

  return auth;
}
