import { z } from '@hono/zod-openapi'

export const testSchema = z.object({
    message: z.string().openapi({
        example: 'Test successful 🚀',
    }),
})

export type TestResponse = z.infer<typeof testSchema>
