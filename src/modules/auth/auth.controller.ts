import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { auth } from "../../lib/auth";
import { signInSchema, signUpSchema, changePasswordSchema, verifyEmailSchema, resendVerificationEmailSchema } from "./auth.schema";
import { HTTPException } from "hono/http-exception";
import { sessionMiddleware } from "../../middlewares/auth.middleware";

export const AuthRoutes = new Hono();

AuthRoutes.post(
    "/sign-up",
    describeRoute({
        tags: ["Auth"],
        summary: "Sign Up",
        description: "Create a new account",
        responses: {
            200: {
                description: "User created successfully",
            },
            400: {
                description: "Invalid input",
            },
            500: {
                description: "Internal server error",
            },
        },
    }),
    validator("json", signUpSchema as any),
    async (c) => {
        const { name, email, password } = c.req.valid("json");

        const user = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
            },
        });

        if (!user) {
            throw new HTTPException(500, { message: "Failed to create user" });
        }

        return c.json(user);
    },
);

AuthRoutes.post(
    "/sign-in",
    describeRoute({
        tags: ["Auth"],
        summary: "Sign In",
        description: "Sign in with email and password",
        responses: {
            200: {
                description: "Signed in successfully",
            },
            400: {
                description: "Invalid credentials",
            },
        },
    }),
    validator("json", signInSchema as any),
    async (c) => {
        const { email, password } = c.req.valid("json");

        const session = await auth.api.signInEmail({
            body: { email, password }
        });

        return c.json(session);
    },
);

AuthRoutes.post(
    "/sign-out",
    describeRoute({
        tags: ["Auth"],
        summary: "Sign Out",
        description: "Sign out the current user",
        responses: {
            200: {
                description: "Signed out successfully",
            },
        },
    }),
    async (c) => {
        await auth.api.signOut({
            headers: c.req.raw.headers,
        });
        return c.json({ success: true });
    }
);

AuthRoutes.post(
    "/change-password",
    sessionMiddleware,
    describeRoute({
        tags: ["Auth"],
        summary: "Change Password",
        description: "Change user password",
        responses: {
            200: {
                description: "Password changed successfully",
            },
            400: {
                description: "Invalid password or input",
            },
            500: {
                description: "Internal server error",
            },
        },
        security: [{ BearerAuth: [] }]
    }),
    validator("json", changePasswordSchema as any),
    async (c) => {
        const { currentPassword, newPassword, revokeOtherSessions } = c.req.valid("json");
        // session is available via c.get('session') if needed, but headers are enough for Better Auth

        await auth.api.changePassword({
            body: {
                currentPassword,
                newPassword,
                revokeOtherSessions,
            },
            headers: c.req.raw.headers,
        });

        return c.json({ success: true, message: "Password updated successfully" });
    },
);

AuthRoutes.post(
    "/verify-email",
    describeRoute({
        tags: ["Auth"],
        summary: "Verify Email",
        description: "Verify user email using the token",
        responses: {
            200: {
                description: "Email verified successfully",
            },
            400: {
                description: "Invalid token",
            },
        },
    }),
    validator("json", verifyEmailSchema as any),
    async (c) => {
        const { token } = c.req.valid("json");

        const result = await auth.api.verifyEmail({
            query: {
                token
            }
        });

        return c.json({ success: true, message: "Email verified successfully", result });
    },
);

AuthRoutes.post(
    "/send-verification-email",
    describeRoute({
        tags: ["Auth"],
        summary: "Resend Verification Email",
        description: "Resend verification email to the user",
        responses: {
            200: {
                description: "Email sent successfully",
            },
        },
    }),
    validator("json", resendVerificationEmailSchema as any),
    async (c) => {
        const { email } = c.req.valid("json");

        await auth.api.sendVerificationEmail({
            body: {
                email
            }
        });

        return c.json({ success: true, message: "Verification email sent" });
    }
);
