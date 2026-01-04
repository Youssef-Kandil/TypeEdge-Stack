import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string().min(2).openapi({ example: "John Doe" }),
    email: z.string().email().openapi({ example: "john@example.com" }),
    password: z.string().min(8).openapi({ example: "SecretP@ss123" }),
});

export const signInSchema = z.object({
    email: z.string().email().openapi({ example: "john@example.com" }),
    password: z.string().min(1).openapi({ example: "SecretP@ss123" }),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1).openapi({ example: "SecretP@ss123" }),
    newPassword: z.string().min(8).openapi({ example: "SecretP@ss123456" }),
    revokeOtherSessions: z.boolean().optional().default(false).openapi({ example: true }),
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1).openapi({ example: "verification_token_here" }),
});

export const resendVerificationEmailSchema = z.object({
    email: z.string().email().openapi({ example: "john@example.com" }),
});
