import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from "@scalar/hono-api-reference";
import { openAPIRouteHandler } from "hono-openapi";
import { auth } from './lib/auth'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

// Initialize the OpenAPIHono app
const app = new OpenAPIHono()

// 1. Global Middlewares
app.use(logger())
app.use(cors())

// This mounts all better-auth routes at /api/auth/*
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
    return auth.handler(c.req.raw);
});


// Register routes
import { TestRoutes } from './modules/test/test.controller'
import { AuthRoutes } from './modules/auth/auth.controller'



// OpenAPI Documentation Endpoint (JSON)
app.doc('/doc', {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'TypeEdge API',
    },
})

// Scalar API Reference UI

app.get(
    "/openapi",
    openAPIRouteHandler(app, {
        documentation: {
            info: {
                title: "TypeEdge API",
                version: "1.0.0",
                description: `API for the TypeEdge project...`,
            },
            servers: [
                {
                    url: "http://localhost:4000",
                    description: "TypeEdge API Server",
                },
            ],
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
            // Remove global security requirement so public routes don't demand it
            // security: [{ BearerAuth: [] }], 
        },
    }),
);
app.get("/api/ui", Scalar({ url: "/openapi" }));

app.route('/test', TestRoutes)
app.route('/auth', AuthRoutes)



export default app
