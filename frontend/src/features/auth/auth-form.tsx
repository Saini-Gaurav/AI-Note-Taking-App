"use client";

import { useCallback, useState } from "react";
import { Controller, useForm, type UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { useAuth } from "@/providers/auth-provider";
import { rhfTextInputProps } from "@/lib/rhf-text-field";
import {
  loginSchema,
  registerSchema,
  type RegisterSchema,
} from "@/features/auth/schemas";

type Mode = "login" | "register";

const emptyValues: RegisterSchema = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function applyZodFormErrors(
  setError: UseFormSetError<RegisterSchema>,
  zodError: z.ZodError<unknown>
) {
  for (const issue of zodError.issues) {
    const key = issue.path[0];
    if (
      key === "name" ||
      key === "email" ||
      key === "password" ||
      key === "confirmPassword"
    ) {
      setError(key, { type: "manual", message: issue.message });
    }
  }
}

export function AuthForm() {
  const router = useRouter();
  const { login, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const isLogin = mode === "login";

  /** One form for both modes (two useForm instances + toggled Controllers broke RHF updates for some fields). */
  const form = useForm<RegisterSchema>({
    defaultValues: emptyValues,
    shouldUnregister: true,
  });

  const switchMode = useCallback(
    (next: Mode) => {
      if (next === mode) return;
      setMode(next);
      form.reset(emptyValues);
      form.clearErrors();
    },
    [form, mode]
  );

  const isPending = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (data) => {
    if (isLogin) {
      const result = loginSchema.safeParse({
        email: data.email,
        password: data.password,
      });
      if (!result.success) {
        applyZodFormErrors(form.setError, result.error);
        return;
      }
      try {
        await login(result.data);
        toast.success("Welcome back");
        router.replace("/dashboard");
      } catch {
        toast.error("Login failed. Please verify your credentials.");
      }
      return;
    }

    const result = registerSchema.safeParse(data);
    if (!result.success) {
      applyZodFormErrors(form.setError, result.error);
      return;
    }
    try {
      await signUp({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      });
      toast.success("Account created successfully");
      router.replace("/dashboard");
    } catch {
      toast.error("Registration failed. Try with another email.");
    }
  });

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">AI Notes Pro</CardTitle>
        <p className="text-sm text-muted-foreground">
          {isLogin
            ? "Sign in to access your notes and AI workflows."
            : "Create your account to start writing smarter notes."}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          <Button
            type="button"
            variant={isLogin ? "default" : "ghost"}
            onClick={() => switchMode("login")}
          >
            Login
          </Button>
          <Button
            type="button"
            variant={!isLogin ? "default" : "ghost"}
            onClick={() => switchMode("register")}
          >
            Register
          </Button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="auth-name">Name</Label>
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="auth-name"
                    autoComplete="name"
                    {...rhfTextInputProps(field)}
                  />
                )}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.name?.message}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Controller
              name="email"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="auth-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  {...rhfTextInputProps(field)}
                />
              )}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.email?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Controller
              name="password"
              control={form.control}
              render={({ field }) => (
                <PasswordInput
                  id="auth-password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  {...rhfTextInputProps(field)}
                />
              )}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.password?.message}
            </p>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="auth-confirm">Confirm Password</Label>
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field }) => (
                  <PasswordInput
                    id="auth-confirm"
                    autoComplete="new-password"
                    {...rhfTextInputProps(field)}
                  />
                )}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword?.message}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
