 import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import type { TestResponse } from "./test.schema";

export async function testRepository() {
	return {
		message: "Test successful 🚀",
	} as TestResponse
}