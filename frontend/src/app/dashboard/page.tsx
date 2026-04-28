"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { NotesDashboard } from "@/features/notes/notes-dashboard";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function DashboardPage() {
  const router = useRouter();
  const auth = useRequireAuth();

  const handleLogout = async () => {
    await auth.logout();
    toast.success("Logged out successfully");
    router.replace("/auth");
  };

  if (auth.isBootstrapping) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" aria-hidden />
          <p className="text-sm">Loading your workspace…</p>
        </div>
      </main>
    );
  }

  if (!auth.user) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" aria-hidden />
          <p className="text-sm">Checking your session…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-3 sm:p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              AI Notes Pro
            </h1>
            <p className="text-sm text-muted-foreground">
              Turn rough thoughts into organized, AI-enhanced notes.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
            <ThemeToggle />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void handleLogout()}
            >
              <LogOut className="size-4 shrink-0" />
              <span>Log out</span>
            </Button>
            <UserMenu user={auth.user} />
          </div>
        </header>
        <NotesDashboard />
      </div>
    </main>
  );
}
