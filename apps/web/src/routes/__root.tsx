import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "@/components/header";
import Loader from "@/components/loader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Web3Provider } from "@/components/web3-provider";
import type { trpc } from "@/utils/trpc";
import "../index.css";

export interface RouterAppContext {
	trpc: typeof trpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Monfolio - Web3 Portfolio Tracker",
			},
			{
				name: "description",
				content:
					"Track and manage your digital asset portfolio across multiple networks. View balances, transaction history, and analytics in one dashboard.",
			},
			{
				name: "application-name",
				content: "Monfolio",
			},
			{
				name: "robots",
				content: "index, follow",
			},
			{
				name: "keywords",
				content: "portfolio, tracker, dashboard, analytics, finance",
			},
			{
				name: "author",
				content: "Monfolio Team",
			},
			{
				property: "og:title",
				content: "Monfolio - Web3 Portfolio Tracker",
			},
			{
				property: "og:description",
				content:
					"Track your digital asset portfolio across multiple networks. View balances and transaction history.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				name: "twitter:card",
				content: "summary",
			},
			{
				name: "twitter:title",
				content: "Monfolio - Web3 Portfolio Tracker",
			},
			{
				name: "twitter:description",
				content: "Track your digital asset portfolio across multiple networks",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/LMark.png",
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

	return (
		<>
			<HeadContent />
			<Web3Provider>
				<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
					<div
						className="fixed inset-0 z-0 bg-background"
						style={{
							backgroundImage: `url('/N&T.png'), url('/LS.png'), url('/SS.png')`,
							backgroundRepeat: "repeat, no-repeat, no-repeat",
							backgroundPosition: "0 0, -30% 0, 100% 125%",
							backgroundSize: "auto, contain, 40%",
						}}
					/>
					<div className="relative z-10 grid h-svh grid-rows-[auto_1fr]">
						<Header />
						{isFetching ? <Loader /> : <Outlet />}
					</div>
					<Toaster richColors />
				</ThemeProvider>
			</Web3Provider>
			<TanStackRouterDevtools position="bottom-left" />
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</>
	);
}
