import { z } from "zod";

const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email");

const passwordField = z
  .string()
  .min(6, "Password must have at least 6 characters");

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must have at least 2 characters"),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
