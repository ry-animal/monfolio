import { QueryCache, QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { toast } from "sonner";
import type { AppRouter } from "../../../server/src/routers/index";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

export const trpc = createTRPCReact<AppRouter>();

// Get the API URL based on environment
const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		// Browser should use relative URL
		return location.origin.includes("localhost")
			? "http://localhost:3000"
			: "https://monad-takehome-server.ryanlvv.workers.dev";
	}
	// SSR should use localhost
	return "http://localhost:3000";
};

export const trpcClient = trpc.createClient({
	links: [
		httpBatchLink({
			url: `${getBaseUrl()}/trpc`,
		}),
	],
});
