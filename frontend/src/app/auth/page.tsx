"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthForm } from "@/features/auth/auth-form";
import { getAccessToken } from "@/lib/auth-storage";
import { useAuth } from "@/providers/auth-provider";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping } = useAuth();

  /** Only full-screen load while validating an existing session (token in storage). */
  const validatingSession =
    isBootstrapping &&
    typeof window !== "undefined" &&
    Boolean(getAccessToken());

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isBootstrapping, router]);

  if (validatingSession) {
    return (
      <main className="relative grid min-h-screen place-items-center px-4 py-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-secondary/20" />
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" aria-hidden />
          <p className="text-sm">Checking your session…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:py-10">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-secondary/20" />
      <div className="relative z-0 w-full max-w-md">
        <AuthForm />
      </div>
    </main>
  );
}
