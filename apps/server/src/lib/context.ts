import type { Context as HonoContext } from "hono";
import { initDb } from "../db/index";

export interface User {
	address: string;
	authenticated: boolean;
}

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	// Initialize database for this request
	initDb(context.env);

	// No auth configured by default
	return {
		session: null,
		env: context.env,
		user: null as User | null,
		req: context.req,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
