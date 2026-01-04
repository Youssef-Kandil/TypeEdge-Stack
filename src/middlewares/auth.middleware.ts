
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { auth } from "../lib/auth";

export const sessionMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");
    console.log("🔍 [Middleware] Authorization Header:", authHeader);

    const session = await auth.api.getSession({
        headers: c.req.raw.headers, // This handles cookies
    });

    console.log("🔍 [Middleware] Session Result:", session ? "Found" : "Null");

    if (!session) {
        throw new HTTPException(401, { message: "Unauthorized" });
    }

    c.set("user", session.user);
    c.set("session", session.session);
    await next();
});

export const roleMiddleware = (requiredRole: "admin" | "user" | "specialist" | "lab" | "kitchen") =>
    createMiddleware(async (c, next) => {
        const user = c.get("user");
        if (!user) {
            throw new HTTPException(401, { message: "Unauthorized" });
        }

        if (user.role !== requiredRole && user.role !== "admin") {
            throw new HTTPException(403, { message: "Forbidden" });
        }

        await next();
    });
