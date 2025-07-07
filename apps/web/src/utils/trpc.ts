import { QueryCache, QueryClient } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { toast } from "sonner";
// AppRouter type - inferred from server
import type { AppRouter } from "../../../server/src/types";

const getErrorMessage = (error: unknown): string => {
	if (error instanceof TRPCClientError) {
		// Handle different tRPC error codes
		switch (error.data?.code) {
			case "BAD_REQUEST":
				return "Invalid request. Please check your input.";
			case "UNAUTHORIZED":
				return "You need to be logged in to perform this action.";
			case "FORBIDDEN":
				return "You don't have permission to perform this action.";
			case "NOT_FOUND":
				return "The requested resource was not found.";
			case "TIMEOUT":
				return "Request timed out. Please try again.";
			case "CONFLICT":
				return "This action conflicts with existing data.";
			case "PRECONDITION_FAILED":
				return "Prerequisites for this action were not met.";
			case "PAYLOAD_TOO_LARGE":
				return "The request is too large. Please try with less data.";
			case "METHOD_NOT_SUPPORTED":
				return "This operation is not supported.";
			case "UNPROCESSABLE_CONTENT":
				return "The request data is invalid.";
			case "TOO_MANY_REQUESTS":
				return "Too many requests. Please wait a moment and try again.";
			case "CLIENT_CLOSED_REQUEST":
				return "Request was cancelled.";
			case "INTERNAL_SERVER_ERROR":
				return "Server error. Please try again later.";
			default:
				return error.message || "An unexpected error occurred.";
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "An unexpected error occurred.";
};

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			const errorMessage = getErrorMessage(error);
			toast.error(errorMessage, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
				duration: 5000,
			});
		},
	}),
	defaultOptions: {
		queries: {
			retry: (failureCount, error) => {
				// Don't retry on client errors (4xx)
				if (
					error instanceof TRPCClientError &&
					error.data?.httpStatus &&
					error.data.httpStatus < 500
				) {
					return false;
				}
				// Retry up to 3 times for server errors
				return failureCount < 3;
			},
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		},
	},
});

export const trpc = createTRPCReact<AppRouter>();

// Get the API URL based on environment
const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		// Browser: use current location or environment specific URL
		if (location.origin.includes("localhost")) {
			return "http://localhost:3000";
		}
		// For production, use environment variable or fallback
		return (
			process.env.NEXT_PUBLIC_API_URL ||
			"https://monad-takehome-server.ryanlvv.workers.dev"
		);
	}
	// SSR: use environment variable or localhost
	return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

export const trpcClient = trpc.createClient({
	links: [
		httpBatchLink({
			url: `${getBaseUrl()}/trpc`,
			fetch: async (input, init) => {
				const response = await fetch(input, {
					...init,
					signal: AbortSignal.timeout(30000), // 30 second timeout
				});
				return response;
			},
		}),
	],
});
