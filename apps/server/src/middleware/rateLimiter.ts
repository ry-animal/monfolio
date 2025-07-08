import { TRPCError } from "@trpc/server";
import type { Context } from "../lib/context";

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

// In-memory rate limiting store
// In production, use Redis or similar persistent store
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
	windowMs: number; // Time window in milliseconds
	maxRequests: number; // Maximum requests per window
	keyGenerator?: (ctx: Context) => string; // Custom key generator
}

/**
 * Default rate limiting configuration
 */
const DEFAULT_CONFIG: RateLimitConfig = {
	windowMs: 60 * 1000, // 1 minute
	maxRequests: 100, // 100 requests per minute
};

/**
 * Generate rate limit key from context
 */
function generateKey(ctx: Context, keyGen?: (ctx: Context) => string): string {
	if (keyGen) {
		return keyGen(ctx);
	}

	// Use CF-Connecting-IP header if available, otherwise use a default
	const ip =
		ctx.req?.headers?.get("cf-connecting-ip") ||
		ctx.req?.headers?.get("x-forwarded-for") ||
		"unknown";

	return `rate_limit:${ip}`;
}

/**
 * Clean up expired entries from the store
 */
function cleanupExpired(): void {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (now > entry.resetTime) {
			rateLimitStore.delete(key);
		}
	}
}

/**
 * Rate limiting middleware factory
 */
export function rateLimitMiddleware(config: Partial<RateLimitConfig> = {}) {
	const finalConfig = { ...DEFAULT_CONFIG, ...config };

	return async function rateLimitMiddlewareHandler(opts: {
		ctx: Context;
		next: any;
	}) {
		const { ctx, next } = opts;

		// Clean up expired entries periodically
		if (Math.random() < 0.01) {
			// 1% chance to cleanup
			cleanupExpired();
		}

		const key = generateKey(ctx, finalConfig.keyGenerator);
		const now = Date.now();

		let entry = rateLimitStore.get(key);

		if (!entry || now > entry.resetTime) {
			// Create new entry or reset expired one
			entry = {
				count: 1,
				resetTime: now + finalConfig.windowMs,
			};
			rateLimitStore.set(key, entry);
		} else {
			// Increment existing entry
			entry.count++;

			if (entry.count > finalConfig.maxRequests) {
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`,
				});
			}
		}

		return next();
	};
}
