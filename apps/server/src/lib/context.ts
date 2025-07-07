import type { Context as HonoContext } from "hono";
import { initDb } from "../db/index";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	// Initialize database for this request
	initDb(context.env);
	
	// No auth configured
	return {
		session: null,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
