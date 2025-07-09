import { initTRPC } from "@trpc/server";
import { addressOwnershipMiddleware, authMiddleware } from "../middleware/auth";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

// Basic rate limiting for all public procedures
export const publicProcedure = t.procedure.use(
	rateLimitMiddleware({
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 300, // 300 requests per minute per IP
	}),
);

// More restrictive rate limiting for expensive operations
export const restrictedProcedure = t.procedure.use(
	rateLimitMiddleware({
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 60, // 60 requests per minute per IP
	}),
);

// Authenticated procedures (optional auth for backward compatibility)
export const authProcedure = t.procedure
	.use(
		rateLimitMiddleware({
			windowMs: 60 * 1000, // 1 minute
			maxRequests: 150, // 150 requests per minute per IP
		}),
	)
	.use(authMiddleware({ requireAuth: false }));

// Protected procedures that require authentication and address ownership
export const protectedProcedure = t.procedure
	.use(
		rateLimitMiddleware({
			windowMs: 60 * 1000, // 1 minute
			maxRequests: 100, // 100 requests per minute per IP
		}),
	)
	.use(authMiddleware({ requireAuth: true }))
	.use(addressOwnershipMiddleware());
