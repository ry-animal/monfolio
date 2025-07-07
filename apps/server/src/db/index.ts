import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// Global database instance - will be initialized in the request handler
let _db: any = null;

export function initDb(env: any) {
	_db = drizzle(env.DB, { schema });
}

export const db = new Proxy({} as any, {
	get(_target, prop) {
		if (!_db) {
			throw new Error("Database not initialized. Call initDb first.");
		}
		return _db[prop];
	}
});
