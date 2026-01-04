import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import { sessionMiddleware, roleMiddleware } from "../../middlewares/auth.middleware";
import type { user, session } from "../../db/schema";

type Variables = {
    user: typeof user.$inferSelect;
    session: typeof session.$inferSelect;
};

export const TestRoutes = new Hono<{ Variables: Variables }>();

const testSchema = z.object({
    message: z.string().min(1).openapi({
        example: "Hello TypeEdge",
        description: "A test message"
    })
});

TestRoutes.get("/",
    describeRoute({
        tags: ["TEST"],
        summary: "GET TEST",
        description: "GET TEST",
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
                description: 'Retrieve test message',
            },
        },
    }),
    (c) => {
        return c.json({
            message: "Test successful 🚀",
        })
    })

TestRoutes.post("/",
    describeRoute({
        tags: ["TEST"],
        summary: "POST TEST",
        description: "POST TEST with Zod Validation",
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
                description: 'Retrieve test message',
            },
        },
    }),
    validator("json", testSchema as any), // Cast to any to avoid potential type inference issues with hono-openapi generic compatibility if stricter types are enforced
    (c) => {
        const body = c.req.valid("json");
        return c.json({
            message: `Received: ${body.message}`,
        })
    }
)

TestRoutes.get("/protected",
    describeRoute({
        tags: ["TEST"],
        summary: "Protected Route",
        description: "Accessible only to authenticated users",
        responses: {
            200: {
                description: "Protected data",
            }
        },
        security: [{ BearerAuth: [] }]
    }),
    sessionMiddleware,
    (c) => {
        const user = c.get("user");
        return c.json({
            message: `Hello, ${user.name}! You are authenticated.`,
            user
        })
    }
)

TestRoutes.get("/admin",
    describeRoute({
        tags: ["TEST"],
        summary: "Admin Route",
        description: "Accessible only to admins",
        responses: {
            200: {
                description: "Admin data",
            }
        },
        security: [{ BearerAuth: [] }]
    }),
    sessionMiddleware,
    roleMiddleware("admin"),
    (c) => {
        return c.json({
            message: "Welcome, Admin!",
        })
    }
)