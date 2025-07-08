import { TRPCError } from "@trpc/server";
import type { Context } from "../lib/context";
import { isValidEthereumAddress } from "../lib/validation";

/**
 * Authentication configuration
 */
export interface AuthConfig {
	requireAuth?: boolean;
	requireAddressMatch?: boolean;
}

/**
 * Verify Ethereum signature
 * This is a simplified version - in production you'd use a proper crypto library
 */
function verifyEthereumSignature(
	message: string,
	signature: string,
	address: string,
): boolean {
	// In a real implementation, you would:
	// 1. Reconstruct the message that was signed
	// 2. Recover the public key from the signature
	// 3. Derive the address from the public key
	// 4. Compare with the claimed address

	// For now, we'll do basic validation
	if (!signature || !signature.startsWith("0x") || signature.length !== 132) {
		return false;
	}

	if (!isValidEthereumAddress(address)) {
		return false;
	}

	// TODO: Implement proper signature verification using ethers.js or similar
	// This is a placeholder that always returns true for valid format
	return true;
}

/**
 * Authentication middleware
 */
export function authMiddleware(config: AuthConfig = {}) {
	return async function authMiddlewareHandler(opts: {
		ctx: Context;
		next: any;
	}) {
		const { ctx, next } = opts;

		if (!config.requireAuth) {
			return next();
		}

		const authHeader = ctx.req?.headers?.get("authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Missing or invalid authorization header",
			});
		}

		try {
			const token = authHeader.substring(7); // Remove "Bearer "
			const authData = JSON.parse(atob(token));

			const { address, signature, message, timestamp } = authData;

			if (!address || !signature || !message || !timestamp) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Invalid authentication data",
				});
			}

			// Check if the signature is recent (within 5 minutes)
			const now = Date.now();
			const tokenTime = new Date(timestamp).getTime();
			const maxAge = 5 * 60 * 1000; // 5 minutes

			if (now - tokenTime > maxAge) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Authentication token expired",
				});
			}

			// Verify the signature
			if (!verifyEthereumSignature(message, signature, address)) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Invalid signature",
				});
			}

			// Add authenticated user to context
			ctx.user = {
				address,
				authenticated: true,
			};

			return next();
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Authentication failed",
			});
		}
	};
}

/**
 * Address ownership verification middleware
 */
export function addressOwnershipMiddleware() {
	return async function addressOwnershipHandler(opts: {
		ctx: Context;
		input: any;
		next: any;
	}) {
		const { ctx, input, next } = opts;

		if (!ctx.user?.authenticated) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Authentication required",
			});
		}

		// Check if the requested address matches the authenticated user's address
		if (input.address && input.address !== ctx.user.address) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You can only access data for your own address",
			});
		}

		return next();
	};
}
